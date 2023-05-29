# Dojo integrated development environment

## Setup

1. Clone repo
2. Run `$ make init` to configure and pull the required submodules
3. Optional: Add your secrets to the file `envfile`  

##### Optional: Dev Setup to Publish Models
To publish and work with Model flows:
  - Create a (Dockerhub)[https://hub.docker.com/] account, if needed.
  - Provide your Dockerhub username to a Jataware Slack admin. This user will be added to Jataware's Dockerhub org.
  - Create a new access token: https://hub.docker.com/settings/security - Make sure it has read/write/delete permissions
  - Copy and save the access token. Store safely (eg password manager)
  - envfile secrets updates for docker and to register models:
```
DOCKERHUB_USER=your-dockerhub-username
DOCKERHUB_PWD=your-saved-access-token
```
-- NOTE: You should rarely, if ever, need to change any of the host names or ports on the envfile.
You should really only need to set the variables that are wrapped in `${...}`.

If you don't need to publish models, you will not need to modify the default envfile that was generated from envfile.sample to get started.

4. Run `$ make up` to build and bring online all services
5. Setup is complete

## Running

To start all services: `$ make up`

To stop all services: `$ make down`

To force rebuild all images: `$ make rebuild all`

To view logs: `$ make logs` or `$ docker-compose logs {service-name}`


## Endpoints

* Dojo UI: http://localhost:8080/
* Dojo API: http://localhost:8000/
* Terminal API: http://localhost:3000/
* Elasticsearch: http://localhost:9200/
* Redis: http://localhost:6379/
* DMC (Airflow): http://localhost:8090/


## Loading images to the internal Docker server

When `make up` command is run, the Ubuntu image is pulled and loaded in to the internal docker server. As some of the images are quite large, for the sake of time and bandwidth only the Ubuntu image is automatically loaded.

If you need a different base image loaded, you can load it with this command: `docker-compose exec docker docker pull jataware/dojo-publish:{base_image_tag_name}`

Since the Docker service has a persistent volume, you should not need to rerun the command unless changes have been made to the image.
