from __future__ import annotations
import logging
import time
import os
from typing import Any, Dict, Optional
from pydantic import BaseModel
from datetime import datetime
import pandas as pd

from fastapi import APIRouter, Response, File, UploadFile, status
from rq import Queue
from rq.job import Job, JobStatus
from redis import Redis
from rq.exceptions import NoSuchJobError
import boto3

from src.utils import get_rawfile, put_rawfile
from src.settings import settings

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

# FAST API ROUTER
router = APIRouter()

# REDIS CONNECTION AND QUEUE OBJECTS
redis = Redis(
    os.environ.get("REDIS_HOST", "redis.dojo-stack"),
    os.environ.get("REDIS_PORT", "6379"),
)
q = Queue(connection=redis, default_timeout=-1)
# Create queues
default_queue = q
datamodeling_queue = Queue('datamodeling', connection=redis)

def get_queue(queue_name):
    if queue_name == 'datamodeling':
        return datamodeling_queue
    return default_queue

# S3 OBJECT
s3 = boto3.resource("s3")


def get_context(uuid):
    from src.indicators import get_indicators, get_annotations

    try:
        annotations = get_annotations(uuid)
    except:
        annotations = {}
    try:
        dataset = get_indicators(uuid)
    except:
        dataset = {}

    context = {"uuid": uuid, "dataset": dataset, "annotations": annotations}

    return context


# RQ ENDPOINTS

@router.post("/job/clear/{uuid}")
async def clear_rq_job_cache(uuid: str):
    """Clear the RQ job cache for a specific uuid.

    Returns:
        Response:
            status_code: 200 if successful, 404 if no job found for uuid.
            content: a success message or an error message.
    """
    # Construct the pattern to match job ids for this UUID
    pattern = f'*{uuid}_*'
    keys = redis.scan_iter(match=pattern)
    # strip out rq:job: as scan_iter returns that with all keys
    job_ids = [key.decode('utf-8').replace('rq:job:', '') for key in keys]

    if job_ids:
        try:
            for job_id in job_ids:
                job = Job.fetch(job_id, connection=redis)
                job.cleanup(ttl=0)
        except NoSuchJobError:
            # Ignore jobs that no longer exist
            pass

        return {"message": f"Cleared {len(job_ids)} jobs for UUID: {uuid}"}
    else:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content=f"No job found for uuid = {uuid}",
        )


@router.post("/job/fetch/{job_id}")
@router.get("/job/fetch/{job_id}")
def get_rq_job_results(job_id: str):
    """Fetch a job's results from RQ.

    Args:
        job_id (str): The id of the job being run in RQ.
                      Comes from the job/enqueue/{job_string} endpoint.

    Returns:
        Response:
            status_code: 200 if successful, 404 if job does not exist.
            content: contains the job's results.
    """
    try:
        job = Job.fetch(job_id, connection=redis)
        result = job.result
        return result
    except NoSuchJobError:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content=f"Job with id = {job_id} not found",
        )


@router.get("/job/queue/length")
def queue_length():
    return len(q)


@router.post("/job/queue/empty")
def empty_queue():
    try:
        deleted = q.empty()
        return Response(
            status_code=status.HTTP_200_OK,
            headers={"msg": f"deleted: {deleted}"},
            content=f"Queue deleted, {deleted} items removed",
        )
    # TODO print or handle specific Error
    except:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="Queue could not be deleted.",
        )


@router.get("/job/available_job_strings")
def available_job_strings():
    job_string_dict = {

        "Geotime Classify": "geotime_processors.geotime_classify",
        "Elwood": "elwood_processors.run_elwood",

        "Convert & Save Dataset Raw File as CSV":
            "file_processors.file_conversion",

        # NOTE Unused:
        # "Anomaly Detection": "tasks.anomaly_detection",

        # Dataset Transform GET/FETCH Jobs:
        "Dataset Transform - Fetch Geo Boundary Box":
            "transformation_processos.get_boundary_box",

        "Dataset Transform - Fetch Temporal Extent":
            "transformation_processos.get_temporal_extent",

        "Dataset Transform - Fetch Unique Dates":
            "transformation_processos.get_unique_dates",

        # Dataset Transform PERFORM transform:
        "Dataset Transform - Clip Geo": "transformation_processos.clip_geo",
        "Dataset Transform - Regrid Geo": "transformation_processos.regrid_geo",

        "Dataset Transform - Clip Time": "transformation_processos.clip_time",
        "Dataset Transform - Scale Time": "transformation_processos.scale_time",

        "Dataset Transform - Restore to Original File":
            "transformation_processos.restore_raw_file",

        # Finishes a dataset registration, given metadata/annotations
        #   and files exist. Used for Composite Dataset Register API.
        "Finish Dataset Registration":
            "dataset_register_processors.finish_dataset_registration",

        "Index PCA Analysis":
            "causemos_processors.generate_index_model_weights",

        # Dataset Resolution
        "Dataset Resolution - Calculate Temporal":
            "resolution_processors.calculate_temporal_resolution",

        "Dataset Resolution - Calculate Geographical":
            "resolution_processors.calculate_geographical_resolution",

        # Extract and Embed
        "Process-Embed Dataset Features":
            "embeddings_processors.calculate_store_embeddings",

        "Extract and Embed Document Paragraphs":
            "paragraph_embeddings_processors.calculate_store_embeddings",

        # NOTE: Only supports country fields [for now].
        "Detect GADM Country Alternatives": "gadm_processors.resolution_alternatives"
    }
    return job_string_dict


def cancel_job(job_id):
    job = Job.fetch(job_id, connection=redis)
    job.cancel()

    return job.get_status()


class GetJobStatusResponseModel(BaseModel):
    id: str
    created_at: datetime
    enqueued_at: Optional[datetime]
    started_at: Optional[datetime]
    status: JobStatus
    job_error: Optional[str]
    result: Optional[dict]


@router.get(
    "/job/{uuid}/{job_string}",
    response_model=GetJobStatusResponseModel
)
def job_status(uuid: str, job_string: str, queue_name: str = "default"):
    """
    If a job exists, returns the full job data.
    """
    job_id = f"{uuid}_{job_string}"
    if "data_modeling" in job_string:
        queue_name = "datamodeling"
    else:
        queue_name = "default"
    q_ = get_queue(queue_name)    

    job = q_.fetch_job(job_id)

    # It is None, since no job exists
    if not job:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content=(
                f"No job data found for uuid = {uuid}/{job_string}.\n"
                "This job may have existed, but cache expired."
            ),
        )

    response = {
        "id": job_id,
        "created_at": job.created_at,
        "enqueued_at": job.enqueued_at,
        "started_at": job.started_at,
        "status": job.get_status(),
        "job_error": job.exc_info,
        "result": job.result,
    }
    return response


# TODO Use instead of Optional Dict|None (which doesn't generate swagger)
class JobCreateOptions(BaseModel):
    force_restart: Optional[bool]
    synchronous: Optional[bool]
    preview: Optional[int]
    timeout: Optional[int]
    context: Optional[dict]


# Last to not interfere with other routes
@router.post("/job/{uuid}/{job_string}")
def job(uuid: str, job_string: str, options: Optional[Dict[Any, Any]] = None):
    """
    \nCreates a new job.
    \n`uuid` can and should match the ID of the entity being
    worked on.
    \nFor example, to work with an indicator/dataset, set `uuid` to the dataset
    uuid.
    \nAvailable `job_string` can be retrieved from `/job/available_job_strings`
    """
    if options is None:
        options = {}

    force_restart = options.pop("force_restart", False)
    synchronous = options.pop("synchronous", False)
    timeout = options.pop("timeout", 60)
    preview = options.get("preview_run", False)
    recheck_delay = 0.5
    if "data_modeling" in job_string:
        queue_name = "datamodeling"
    else:
        queue_name = "default"
    q_ = get_queue(queue_name)

    job_id = f"{uuid}_{job_string}"
    if preview:
        job_id = job_id + "_preview"
    job = q_.fetch_job(job_id)

    context = options.pop("context", None)
    if job and force_restart:
        job.cleanup(ttl=0)  # Cleanup/remove data immediately

    if not job or force_restart:
        try:
            if not context:
                context = get_context(uuid=uuid)
        except Exception as e:
            logging.error(e)

        job = q_.enqueue_call(
            func=job_string, args=[context], kwargs=options, job_id=job_id
        )
        if synchronous:
            timer = 0.0
            while (
                job.get_status(refresh=True) not in ("finished", "failed")
                and timer < timeout
            ):
                time.sleep(recheck_delay)
                timer += recheck_delay

    status = job.get_status()
    if status in ("finished", "failed"):
        job_result = job.result
        job_error = job.exc_info
        job.cleanup(ttl=0)  # Cleanup/remove data immediately
    else:
        job_result = None
        job_error = None

    response = {
        "id": job_id,
        "created_at": job.created_at,
        "enqueued_at": job.enqueued_at,
        "started_at": job.started_at,
        "status": status,
        "job_error": job_error,
        "result": job_result,
    }
    return response


# TEST ENDPOINTS


def test_job():
    # Test RQ job
    time.sleep(5)

    print("Job Job")


@router.post("/data/test/{num_of_jobs}")
def run_test_jobs(num_of_jobs):
    for n in range(int(num_of_jobs)):
        q.enqueue("tasks.test_job")


@router.get("/data/test/s3_grab/{uuid}")
def test_s3_grab(uuid):
    rawfile_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, uuid, "raw_data.csv")
    file = get_rawfile(rawfile_path)

    df = pd.read_csv(file, delimiter=",")

    preview = df.head(5).to_json(orient="records")

    return preview


@router.post("/data/test/s3_upload/{uuid}")
def test_s3_upload(uuid: str, filename: str, payload: UploadFile = File(...)):
    try:
        dest_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, uuid, filename)
        put_rawfile(path=dest_path, fileobj=payload.file)
        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"msg": "File uploaded"},
            content=f"File uploaded to S3 as {filename}",
        )
    except Exception as e:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            headers={"msg": f"Error: {e}"},
            content=f"File could not be uploaded.",
        )


@router.get("/data/test/job_cancel_redo")
def job_cancel_redo_test(uuid: str, job_id: str):
    response = enqueue_job("geotime_processors.process", uuid, job_id)

    time.sleep(5)

    cancel_status = cancel_job(job_id)

    response2 = enqueue_job("geotime_processors.process", uuid, job_id)

    return Response(
        status_code=status.HTTP_200_OK,
        headers={"msg": "Job cancelled and restarted"},
        content=f"Job cancelled and restarted. Cancel status: {cancel_status}",
    )
