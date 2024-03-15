from pathlib import Path
import requests
import os

from settings import settings
from utils import get_rawfile
from auto_annotations_helpers.meta import Meta
from auto_annotations_helpers.process_df import handle_csv, handle_xlsx
from auto_annotations_helpers.agent import Agent
# from auto_annotations_helpers.utils


#debug/testing
import pdb


def generate_annotations(context, filename=None):
    if filename is None:
        raise ValueError("Filename is required for auto-annotations")
    filename = Path(filename)
    

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    filestream = get_rawfile(rawfile_path)
    # TODO: not the right way to get the file...
    # if not filename.exists():
    #     raise FileNotFoundError(f"File {filename} does not exist") 

    name = context['dataset']['name']
    description = context['dataset']['description']
    meta = Meta(filestream, name, description)

    # shorten the description if necessary
    agent = Agent(model='gpt-4-turbo-preview', timeout=10.0)
    if len(meta.description) > 1000:
        meta.description = shorten_description(meta, agent)


    if filename.suffix == ".csv":
        annotations = handle_csv(meta, agent)
    # elif filename.suffix == ".xlsx":
    #     #TODO: need to handle selecting the sheet the user specifies
    #     pdb.set_trace()
    #     annotations = handle_xlsx(meta, agent)
    # elif filename.suffix == ".nc":
    #     pdb.set_trace()
    #     annotations = handle_netcdf(meta, agent)
    # elif filename.suffix in [".tif", ".tiff"]:
    #     pdb.set_trace()
    #     annotations = handle_geotiff(meta, agent)
    else:
        raise ValueError(f"Unsupported file type for auto annotations: {filename.suffix}")


    annotations = annotations.dict()
    data = {
        "annotations": annotations,
    }
    api_url = settings.DOJO_URL
    request_response = requests.patch(
        f"{api_url}/indicators/{context['uuid']}/annotations",
        json=data,
    )


    return annotations, request_response




def shorten_description(meta: Meta, agent: Agent) -> str:
    desc = agent.oneshot_sync('You are a helpful assistant.', f'''\
I have a dataset called "{meta.name}" With the following description:
"""
{meta.description}
"""
I would like to ensure that it is just a simple description purely about the data without any other superfluous information. Things to remove include contact info, bibliographies, URLs, etc. If there is a lot of superfluous information, could you pare it down to just the key details? Output only the new description without any other comments. If there are not superfluous details, output only the original unmodified description.\
''')
    return desc

