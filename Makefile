VERSION := 0.0.1

# make helpers
null  :=
space := $(null) #
comma := ,

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

DETECTED_OS := $(shell uname)
ifeq ($(DETECTED_OS),Darwin)
	SED=gsed
else
	SED=sed
endif

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



.PHONY:
ALL_DOCKER_COMPOSE_FILES:= $(wildcard docker-compose*.yaml)

ifneq ($(wildcard .docker-compose.locals),)
DOCKER_COMPOSE_LOCALS=$(shell cat .docker-compose.locals)
else
DOCKER_COMPOSE_LOCALS=
endif


DOCKER_COMPOSE_FILES:=docker-compose.network.yaml \
	docker-compose.redis.yaml \
	docker-compose.elastic.yaml \
	docker-compose.kibana.yaml \
	docker-compose.airflow.yaml \
	docker-compose.api.yaml \
	docker-compose.ui.yaml \
	docker-compose.terminal.yaml \
	docker-compose.minio.yaml \
	docker-compose.testmos.yaml \
	$(DOCKER_COMPOSE_LOCALS) \
	docker-compose.dev.yaml

ALL_PROFILES=default elastic redis dojoapi ui terminal docker airflow minio testmos

define all_profiles
$(subst $(space),$(comma),$(ALL_PROFILES))
endef


.PHONY: docker-hub-env
docker-hub-env: check-DOCKERHUB_USER check-DOCKERHUB_USER
	@echo "Regenrating .env file"; \
	$(file >.env,$(file <env.template)) \
	$(file >>.env,$(newline)) \
	$(file >>.env,DOCKERHUB_AUTH=$(shell echo '{"username":"'$${DOCKERHUB_USER}'","password":"'$${DOCKERHUB_PWD}'","email":"'$${DOCKERHUB_EMAIL}'"}' | base64 | tr -d '\n')) \
	$(file >>.env,DOCKERHUB_USER=$(shell echo $${DOCKERHUB_USER})) \
	$(file >>.env,DOCKERHUB_PWD=$(shell echo $${DOCKERHUB_PWD}))

.env: docker-hub-env

.PHONY: up.a
up.a:| .env
	COMPOSE_PROFILES="$(all_profiles)" docker compose $(addprefix -f , $(DOCKER_COMPOSE_FILES)) up -d

.PHONY: down.a
down.a:
	COMPOSE_PROFILES="*" docker compose $(addprefix -f , $(DOCKER_COMPOSE_FILES)) down


.PHONY: down.v
down.v:
	COMPOSE_PROFILES="*" docker compose $(addprefix -f , $(DOCKER_COMPOSE_FILES)) down -v

.PHONY:logs
logs:
	COMPOSE_PROFILES="*" docker compose $(addprefix -f , $(DOCKER_COMPOSE_FILES)) logs


.PHONY: docker_build-api
docker_build-api:
	(cd api && docker build -t dojo_api:dev .)

.PHONY: docker_build-terminal
docker_build-terminal:
	(cd terminal && docker build -t dojo_terminal:dev .)

.PHONY: docker_build-worker
docker_build-worker:
	(cd workers && docker build -t dojo_worker:dev .)

.PHONY: docker_build-rqworker
docker_build-rqworker:
	(cd tasks && docker build -t dojo_rqworker:dev .)

.PHONY: docker_build-ui
docker_build-ui:
	(cd ui && docker build -t dojo_ui:dev .)

.PHONY: docker_build-router
docker_build-router:
	(cd router && docker build -t dojo_router:dev .)

.PHONY: docker_build-dags
docker_build-dags:
	(cd dmc && docker build -t dojo_dags:dev .)

.PHONY: docker_build-permfix
docker_build-permfix:
	(cd perm-fixer && docker build -t dojo_permfix:dev .)


check-%:
	@: $(if $(value $*),,$(error $* is undefined))

.PHONY: docker_build-all
docker_build-all: docker_build-api \
	docker_build-dags \
	docker_build-permfix \
	docker_build-rqworker \
	docker_build-terminal \
	docker_build-worker \
	docker_build-ui

.PHONY: print-version
print-version:
	@printf "${VERSION}"

.PHONY: bump-version
bump-version:
	@echo "Current: ${VERSION}"
	@echo ${VERSION} | awk -F. -v OFS=. '{$$NF+=1; print}' | xargs -I%x $(SED) -i "0,/${VERSION}/s//%x/" Makefile
	@$(MAKE) -s print-version


.PHONY: docker_tag
docker_tag: check-VERSION
	docker tag dojo_api:dev registry.gitlab.com/jataware/dojo/api:${VERSION}
	docker tag dojo_ui:dev registry.gitlab.com/jataware/dojo/ui:${VERSION}
	#docker tag dojo_router:dev registry.gitlab.com/jataware/dojo/router:${VERSION}
	docker tag dojo_rqworker:dev registry.gitlab.com/jataware/dojo/rqworker:${VERSION}
	docker tag dojo_terminal:dev registry.gitlab.com/jataware/dojo/terminal:${VERSION}
	docker tag dojo_worker:dev registry.gitlab.com/jataware/dojo/worker:${VERSION}
	docker tag dojo_dags:dev registry.gitlab.com/jataware/dojo/dags:${VERSION}
	docker tag dojo_permfix:dev registry.gitlab.com/jataware/dojo/permfix:${VERSION}

.PHONY: gitlab-docker-login
gitlab-docker-login:| check-GITLAB_USER check-GITLAB_PASS
	@printf "${GITLAB_PASS}\n" | docker login registry.gitlab.com/jataware -u "${GITLAB_USER}" --password-stdin


.PHONY: docker_push
docker_push:| gitlab-docker-login check-VERSION
	@echo "push ${VERSION}"
	docker push registry.gitlab.com/jataware/dojo/api:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/terminal:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/worker:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/rqworker:${VERSION}
	#docker push registry.gitlab.com/jataware/dojo/router:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/ui:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/dags:${VERSION}
	docker push registry.gitlab.com/jataware/dojo/permfix:${VERSION}
