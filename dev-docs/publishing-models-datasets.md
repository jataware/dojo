
This doc describes how to set up and run model/dataset publishing while on local development.
It assumes you're familiar with the dojo stack and how to run it (at least the basics).

The Dojo UI should be running under localhost:8080 and dojo API on localhost:8000, among other services.

# Set Up

For publishing models and datasets, make sure these env vars are set in your envfile:

CAUSEMOS_IND_URL=http://testmos:8012/api/maas
CAUSEMOS_DEBUG=false
AWS_ACCESS_KEY_ID=miniouser
AWS_SECRET_ACCESS_KEY=miniopass
PLUGINS={"causemos":"src.plugins.causemos.CausemosPlugin","logger":"src.plugins.logging.LoggingPlugin", "sync":"src.plugins.sync.SyncPlugin"}

For registering a new model; usually a prerequisite for publishing:

DOCKERHUB_USER=<docker-user>
DOCKERHUB_PWD=<docker-api-key>

where you'll have to set up a user/api key combination for a user within the dockerhub jataware org.

Note: Most of these env vars already contain their default under envfile.sample.

If your stack is running, you'll have to run `make restart` to re-build the api using the new envfile values.

Alternatively, instead of restarting the whole stack, you may manually regenerate the docker-compose files with new env vars using `make docker-compose.yaml` and only restart the api service `docker compose up -d --build api`.

If in doubt, after restarting your api container, docker exec into it and verify the injected env vars:

`docker exec -it dojo-api /bin/bash`

And echo any relevant env vars. Example:
`echo $CAUSEMOS_DEBUG`

# Tail and Examining logs

Open two terminals in order to view logs for your running containers (one for api, one for testmos the mock publishing service):

- `docker logs --tail 100 -f dojo-api`

- `docker logs --tail 100 -f tasks-testmos-1`


# Register a Model

If unfamliar with the process, register a test-model following this video:

https://www.youtube.com/watch?v=stvtNUrEKDU

Upon getting to the final page after submitting and uploading the docker image, press publish and examine the logs for both open terminals from above section. The API will log a lot of scrolling data. As long as the window howing the logs for testmos displaying the data and request once you've successfully simulated publishing locally.

# Register a Dataset

Navigate to http://localhost:8080/datasets/register to start registering a new model.

The first metadata page can contain arbitrary values for most fields, except the `File Upload`, which needs valid csv,xls,netcdf,geotiff files. If selecting files other than csv, you'll have to specify other fields relavant to the dataset and file type (such as sheet for spreadsheet xls files).

Upon pressing next, you'll have to wait for the system to analyze  and optionally convert the dataset file.
Once completed, you'll be greeted by the Annotate step. It should be similar to annotating the model output from the video on the `Register a Model` section above. Once done with the annotations, you may proceed by clicking next.

For brevity, let's skip the Data Transformation step for now. Click next and proceed to the `Processing` step.

The system will process the dataset file, metadata, and annotations and generated a normalized file. You'll be directed to the review/preview page. If everything looks good (similar to annotating a model output), press `Submit to Dojo`.

You should be redirected to the last step- Submit and a confirmation page displayed.

Verify that the logs for testmos display the latest dataset publish data. That is, this should have been called and show up in the logs:

`api/maas/indicators/post-process, Method: POST`

the logged request usually contains a long (think 50+ lines of line breaks) post body.
