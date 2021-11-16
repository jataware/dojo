# Dojo integrated development environment

## Setup

1. Clone repo
2. Run `$ make init` to configure and pull the required submodules
3. Add your secrets to the file `envfile`  
 -- NOTE: You should rarely, if ever, need to change any of the host names or ports. You should really only need to set the variables that are wrapped in `${...}`
4. Run `$ make up` to build and bring online all services
5. Run `$ make create-es-indexes` to create the elasticsearch indexes
6. Setup is complete

## Running

To start all services: `$ make up`

To stop all services: `$ make down`

To force rebuild all images: `$ make rebuild all`

To view logs: `$ make logs` or `$ docker-compose logs {service-name}`


## Endpoints

* Phantom: http://localhost:8080/
* Dojo-api: http://localhost:8000/
* Spacetag: http://localhost:8001/
* Clouseau: http://localhost:3000/
* Shorthand: http://localhost:5000/
* Elasticsearch: http://localhost:9200/
* Redis: http://localhost:6379/
* DMC (Airflow): http://localhost:8090/
