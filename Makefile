SHELL = /bin/bash
LANG = en_US.utf-8
export LANG

BASEDIR = $(shell pwd)
CLOUSEAU_DIR = clouseau
DOJO_API_DIR = dojo/api
DOJO_DMC_DIR = dojo/dmc
MIXMASTA_DIR = mixmasta
PHANTOM_DIR = phantom
SHORTHAND_DIR = shorthand
SPACETAG_DIR = spacetag
WORKERS_DIR = workers
COMPOSE_DIRS := $(CLOUSEAU_DIR) $(DOJO_API_DIR) $(DOJO_DMC_DIR) $(SHORTHAND_DIR) $(SPACETAG_DIR) $(WORKERS_DIR)
COMPOSE_FILES := $(CLOUSEAU_DIR)/docker-compose.yaml $(DOJO_API_DIR)/docker-compose.yaml \
				 $(DOJO_DMC_DIR)/docker-compose.yaml $(SHORTHAND_DIR)/docker-compose.yaml \
				 $(SPACETAG_DIR)/docker-compose.yaml $(WORKERS_DIR)/docker-compose.yaml docker-compose.phantom.yaml
TEMP_COMPOSE_FILES := $(foreach file,$(subst /,_,$(COMPOSE_FILES)),temp_$(file))


.PHONY:rebuild-all
rebuild-all:
	docker-compose build --no-cache; \
		cd $(MIXMASTA_DIR) && docker build . -t mixmasta:dev;


.PHONY:clean
clean:
	echo "Clearing all transient data" && \
	docker image prune -f && \
	docker container prune -f && \
	docker-compose run app rm -r ./data/*/ && \
	echo "Done"


docker-compose.yaml:$(COMPOSE_FILES) docker-compose.override.yaml
	. envfile; \
	for compose_file in $(COMPOSE_FILES); do \
	  	tempfile="temp_$${compose_file//\//_}"; \
  		docker-compose -f $$compose_file config > $$tempfile; \
  	done; \
	sed -i 's|app:|shorthand-app:|' temp_shorthand_docker-compose.yaml; \
	sed -i -e 's|published: 8080|published: 8090|' \
		   -e '/image:/! s/\<postgres\>\([:\/]\)/airflow-postgres\1/g' \
		   -e '/image:/! s/redis:$$/airflow-redis:/g' \
		   -e '/image:/! s/@redis:/@airflow-redis:/g' \
		   -e 's|published: 6379|published: 6390|' temp_dojo_dmc_docker-compose.yaml; \
  	docker-compose $(foreach f,$(TEMP_COMPOSE_FILES), -f $(f)) \
	  	-f docker-compose.override.yaml config > docker-compose.yaml; \
	rm $(TEMP_COMPOSE_FILES);


.PHONY:up
up:docker-compose.yaml
	docker-compose up -d; \
	echo make build-dev-image


.PHONY:down
down:docker-compose.yaml
	docker-compose down


.PHONY:restart
restart:docker-compose.yaml
	make down && make up


.PHONY:logs
logs:
	docker-compose logs -f --tail=30


.PHONY:pull-images
pull-images:
	docker-compose exec docker /bin/bash -c "cd /build && ./pull-images"


.PHONY:build-dev-image
build-dev-image:
	docker-compose exec docker /bin/bash -c "cd /build && ./build-dev-image"
