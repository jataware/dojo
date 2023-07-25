# Dojo RQ Worker for Task Running

This is Dojo's task running RQ worker. It handles most of the interactions with Elwood for data registration processing and for model output processing during model registration.

> Note: model output file handling is performed by DMC/Airflow for actual model runs.

## Development

To develop the RQ Worker, from the top-level of the project run `docker-compose build rqworker` prior to running `make up` if you only want to rebuild the RQ Worker. You could also try mounting the `tasks` directory and live editing the file.