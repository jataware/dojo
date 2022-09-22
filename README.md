# ASKEM Data Annotation Tool

## Setup

1. Clone repo
2. Run `$ make init` to generate envfile
3. Add your secrets to the file `envfile`  
  - NOTE: You should rarely, if ever, need to change any of the host names or ports. You should really only need to set the variables that are wrapped in `${...}`

4. Run `$ make up` to build and bring online all services
5. Setup is complete

## Running

To start all services: `$ make up`

To stop all services: `$ make down`

To force rebuild all images: `$ make rebuild all`

To view logs: `$ make logs` or `$ docker-compose logs {service-name}`


## Endpoints

* UI: http://localhost:8081/
* API: http://localhost:8000/
* Elasticsearch: http://localhost:9200/
* Redis: http://localhost:6379/

# Deploying

To run the stack, the following services must be run:

* Elasticsearch
* Redis
* Dojo API (dojo/api/Dockerfile)
* Dojo workers (dojo/workers/rq-worker/Dockerfile)
* Static file hosting (UI)

To generate the static files for the UI:
```bash
cd phantom
NODE_OPTIONS=--openssl-legacy-provider make compile
```
The compiled files required for hosting will be located in the `phantom-askem/ui/dist` folder.


## Loading images to the internal Docker server

When `make up` command is run, the Ubuntu image is pulled and loaded in to the internal docker server. As some of the images are quite large, for the sake of time and bandwidth only the Ubuntu image is automatically loaded.

If you need a different base image loaded, you can load it with this command: `docker-compose exec docker docker pull jataware/dojo-publish:{base_image_tag_name}`

Since the Docker service has a persistent volume, you should not need to rerun the command unless changes have been made to the image.

