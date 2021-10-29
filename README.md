# Dojo integrated development environment

## Setup

1. Clone repo
2. Run `$ make init` to configure and pull the required submodules
4. Setup is complete

## Running

To start all services: `$ make up`

To stop all services: `$ make down`

To force rebuild all images: `$ make rebuild all`


## Endpoints

* Phantom: http://localhost:8080/
* Dojo-api: http://localhost:8000/
* Spacetag: http://localhost:8001/
* Clouseau: http://localhost:3000/
* Shorthand: http://localhost:5000/
* Elasticsearch: http://localhost:9200/
* Redis: http://localhost:6379/
* DMC (Airflow): http://localhost:8090/