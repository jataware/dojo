SHELL = /bin/bash
LANG = en_US.utf-8
PYTHON = $(shell which python3 || which python)
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
				 $(SPACETAG_DIR)/docker-compose.dev.yaml $(WORKERS_DIR)/docker-compose.yaml
TEMP_COMPOSE_FILES := $(foreach file,$(subst /,_,$(COMPOSE_FILES)),temp_$(file))

.PHONY:update
update:
	git fetch; \
	git submodule foreach git pull; \
	git submodule foreach git status; \
	$(PYTHON) $(BASEDIR)/bin/update_envfile.py envfile.sample envfile;

.PHONY:init
init:
	git submodule update --init --remote --rebase; \
	git config --add fetch.recursesubmodules true; \
	git submodule foreach 'git checkout $$(git config -f ../.gitmodules --get "submodule.$$name.branch")'; \
	mkdir -p -m 0777 $(DOJO_DMC_DIR)/logs $(DOJO_DMC_DIR)/configs $(DOJO_DMC_DIR)/plugins $(DOJO_DMC_DIR)/model_configs \
		$(DOJO_DMC_DIR)/dojo; \
	touch clouseau/.dockerenv; \
	make envfile;

.PHONY:rebuild-all
rebuild-all:
	docker-compose build --no-cache; \
	cd $(MIXMASTA_DIR) && docker build . -t mixmasta:dev;

envfile:
ifeq ($(wildcard envfile),)
	cp envfile.sample envfile; \
	echo -e "\nDon't forget to update 'envfile' with all your secrets!";
endif


.PHONY:clean
clean:
	echo "Clearing all transient data" && \
	docker image prune -f && \
	docker container prune -f && \
	docker-compose run app rm -r ./data/*/ && \
	echo "Done"


docker-compose.yaml:$(COMPOSE_FILES) docker-compose.build-override.yaml envfile
	export $$(cat envfile | xargs); \
	export AWS_SECRET_ACCESS_KEY_ENCODED=$$(echo -n $${AWS_SECRET_ACCESS_KEY} | \
		curl -Gso /dev/null -w %{url_effective} --data-urlencode @- "" | cut -c 3-); \
	if [[ -z  "$${DOCKERHUB_AUTH}" ]]; then \
		export DOCKERHUB_AUTH="$$(echo '{"username":"'$${DOCKERHUB_USER}'","password":"'$${DOCKERHUB_PWD}'","email":"'$${DOCKERHUB_EMAIL}'"}' | base64 | tr -d '\n')"; \
	fi; \
	for compose_file in $(COMPOSE_FILES); do \
	  	tempfile="temp_$${compose_file//\//_}"; \
  		docker-compose -f $$compose_file config > $$tempfile; \
  	done; \
	sed -E -i'.sedbkp' 's|app:|shorthand-app:|' temp_shorthand_docker-compose.yaml; \
	sed -E -i'.sedbkp' -f .dmc.sed temp_dojo_dmc_docker-compose.yaml; \
	docker-compose --env-file envfile $(foreach f,$(TEMP_COMPOSE_FILES), -f $(f)) \
	  	-f docker-compose.build-override.yaml config > docker-compose.yaml; \
	rm $(TEMP_COMPOSE_FILES) *.sedbkp;


phantom/ui/node_modules:docker-compose.yaml phantom/ui/package-lock.json phantom/ui/package.json
	docker-compose run phantom npm ci -y


.PHONY:up
up:docker-compose.yaml phantom/ui/node_modules
	docker-compose up -d; \
	make pull-images


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


.PHONY:create-es-indexes
create-es-indexes:
	curl -s -X PUT http://localhost:9200/accessories > /dev/null; \
		curl -s -X PUT http://localhost:9200/configs > /dev/null; \
		curl -s -X PUT http://localhost:9200/directives > /dev/null; \
		curl -s -X PUT http://localhost:9200/indicators > /dev/null; \
		curl -s -X PUT http://localhost:9200/models > /dev/null; \
		curl -s -X PUT http://localhost:9200/outputfiles > /dev/null; \
		curl -s -X PUT http://localhost:9200/runs > /dev/null;
