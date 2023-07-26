SHELL = /bin/bash
LANG = en_US.utf-8
PYTHON = $(shell which python3 || which python)
DOCKER = $(shell which docker)
DOCKER_COMPOSE = $(shell which docker-compose || echo "$(DOCKER) compose")
export LANG

BASEDIR = $(shell pwd)
TERMINAL_DIR = terminal
DOJO_API_DIR = api
DOJO_DMC_DIR = dmc
ELWOOD_DIR = elwood
UI_DIR = ui
RQ_DIR = tasks
WORKERS_DIR = workers
COMPOSE_DIRS := $(TERMINAL_DIR) $(DOJO_API_DIR) $(DOJO_DMC_DIR) $(WORKERS_DIR)
COMPOSE_FILES := $(TERMINAL_DIR)/docker-compose.yaml $(DOJO_API_DIR)/docker-compose.yaml \
				 $(DOJO_DMC_DIR)/docker-compose.yaml $(WORKERS_DIR)/docker-compose.yaml \
				 $(RQ_DIR)/docker-compose.yaml
TEMP_COMPOSE_FILES := $(foreach file,$(subst /,_,$(COMPOSE_FILES)),temp_$(file))
IMAGE_NAMES = api terminal ui tasks
BUILD_FILES = $(wildcard */.build)
BUILD_DIRS = $(dir $(BUILD_FILES))

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
	touch terminal/.dockerenv; \
	make envfile;

.PHONY:rebuild-all
rebuild-all:
	$(DOCKER_COMPOSE) build --no-cache; \
	cd $(ELWOOD_DIR) && $(DOCKER) build . -t elwood:dev;

envfile:
ifeq ($(wildcard envfile),)
	cp envfile.sample envfile; \
	echo -e "\nDon't forget to update 'envfile' with all your secrets!";
endif

.PHONY:static
static:docker-compose.yaml ui/node_modules ui/package-lock.json ui/package.json
	rm -fr ui/dist/; $(DOCKER_COMPOSE) run ui npm run build

.PHONY:images
images:static
	for dir in $(BUILD_DIRS); do \
		(cd $${dir} && bash .build); \
	done

.PHONY:clean
clean:
	echo "Clearing all transient data" && \
	$(DOCKER) image prune -f && \
	$(DOCKER) container prune -f && \
	$(DOCKER_COMPOSE) run app rm -r ./data/*/ && \
	echo "Done"

terminal/.dockerenv:
	touch terminal/.dockerenv

docker-compose.yaml:$(COMPOSE_FILES) docker-compose.build-override.yaml terminal/.dockerenv envfile
	export $$(grep -v '^#' envfile | xargs); \
		curl -Gso /dev/null -w %{url_effective} --data-urlencode @- "" | cut -c 3-); \
	if [[ -z "$${DOCKERHUB_AUTH}" ]]; then \
		export DOCKERHUB_AUTH="$$(echo '{"username":"'$${DOCKERHUB_USER}'","password":"'$${DOCKERHUB_PWD}'","email":"'$${DOCKERHUB_EMAIL}'"}' | base64 | tr -d '\n')"; \
	fi; \
	for compose_file in $(COMPOSE_FILES); do \
		tempfile="temp_$${compose_file//\//_}"; \
		$(DOCKER_COMPOSE) -f $$compose_file config > $$tempfile; \
	done; \
	sed -E -i'.sedbkp' -f .dmc.sed temp_dmc_docker-compose.yaml; \
	$(DOCKER_COMPOSE) --env-file envfile $(foreach f,$(TEMP_COMPOSE_FILES), -f $(f)) \
		-f docker-compose.build-override.yaml config > docker-compose.yaml; \
	rm $(TEMP_COMPOSE_FILES) *.sedbkp;


ui/package-lock.json:ui/package.json
	$(DOCKER_COMPOSE) run ui npm i -y --package-lock-only

ui/node_modules:ui/package-lock.json |
	$(DOCKER_COMPOSE) run ui npm ci -y

.PHONY:up
up:docker-compose.yaml ui/node_modules
	$(DOCKER_COMPOSE) up -d

.PHONY:up-rebuild
up-rebuild:docker-compose.yaml ui/node_modules
	$(DOCKER_COMPOSE) up --build -d



.PHONY:down
down:docker-compose.yaml
	$(DOCKER_COMPOSE) down


.PHONY:restart
restart:docker-compose.yaml
	make down && make up


.PHONY:logs
logs:
	$(DOCKER_COMPOSE) logs -f --tail=30
