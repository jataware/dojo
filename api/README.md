# Dojo API

This is a FastAPI webapp that provides an interface to the Domain Model Controller execution engine.

## Installation

`pip install -r requirements.txt`

## Run the webapp

To run this API, along with Elasticsearch and Kibana, run:

```
docker-compose up --build -d

```

This will build the API container and run the server on `http://localhost:8000/`

## Running the webapp in development

To run the API for development purposes use:

```
docker-compose -f docker-compose-dev.yaml up -d
```

This will turn on the API, Elasticsearch and Kibana, but the API will be in `reload` mode and any changes made to the local repository will be reflected in the container to facilitate development.

You should also ensure that `CAUSEMOS_DEBUG` in `.env` is set to `true` as this will bypass notifying Uncharted that indicators were created. In production, this should be set to `false` so that Uncharted gets notified whenever a new indicator is created.

## Setup

Use the following script to set up Model runs index mappings for Elasticsearch:

```
cd ../api/es-mappings
python3 CreateMappings.py
```

## Running the examples

For each example (`MaxHop` and `pythia`) there is a `run_<model>.json` file. Copy and paste the contents into Dojo's create `run/` endpoint (http://localhost:8000/#/Runs/create_run_runs_post) then navigate to airflow (http://localhost:8080) to monitor model execution.

## Validating that Mode/Dataset Publishing Works during Development

Your envfile should contain the following values:

```
CAUSEMOS_DEBUG=false
CAUSEMOS_IND_URL=http://dojo-stack_testmos_1:8012
PLUGINS={"causemos":"src.plugins.causemos.CausemosPlugin","logger":"src.plugins.logging.LoggingPlugin","sync":"src.plugins.sync.SyncPlugin"}
```

`CAUSEMOS_DEBUG=false` will cause publishing to be enabled. Double-check that `CAUSEMOS_IND_URL` is not a production URL. It can be either a localhost, empty, or a url pointing to dojo-stack_testmos.

Register a Model or Dataset and verify that the mock testmos application logs receipt of the published data.

## Logging

To set the log level, change the level for FastAPI in `logging.yaml`. 

## Schema Validation

This step only needs to be done after an Uncharted schema change. While the steps below will auto-build the pydantic schema files in the `validation/` folder, you may need to update the .py files in the `src/` directory with any schema class name changes.

To retrieve and build pydantic .py files from the lastest schema jsons from Uncharted run:

```
chmod 755 json_to_pydantic.sh
./json_to_pydantic.sh
``` 
This shell script clones the Uncharted Schema repo, builds the the pydantic schemas via `datamodel-codegen` (as described [here](https://pydantic-docs.helpmanual.io/datamodel_code_generator/)), then deletes the Uncharted Repo.  Note that an external `$ref` under `model_id` is removed from `model-run.schema.json` and proper conversion to pydantic schema should be verified.

## Additional Setup for Publishing Models during Development

First you will need to determine your local machine IPv4

For OSX
```
ipconfig getifaddr en0
```
For Linux
```
hostname -i
```

Put this into `.env` for the `DMC URL` and within the `DOJO URL` (keep the `http://` and `:8000`, just swap the IP). You will also need to specify the path to the DMC directory.

> Note: you can override values in the `.env` file by setting them in your environment directly. For example `export ELASTICSEARCH_PORT=9200` will take precedence over what is specified in the `.env` file.

