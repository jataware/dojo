

# Dependencies

# gnumake curl git
# docker docker-compose

VERSION := 1.0.0

DEV ?= $(strip $(if $(findstring y,$(prod)),,dev))

VERSION := ${VERSION}$(DEV:dev=-dev)

DETECTED_OS := $(shell uname)

CMD_ARGUMENTS ?= $(cmd)

.DEFAULT_GOAL := help

check-%:
	@: $(if $(value $*),,$(error $* is undefined))

.PHONY: all
all: | check-DOCKERHUB_USER check-DOCKERHUB_PASS ## Run build all projects and push to docker hub. Requires DOCKERHUB_USER and DOCKERHUB_PASS to be set in the environment

help:
	@echo ""
	@echo "By default make targets assume DEV to run production pass in prod=y as a command line argument"
	@echo ""
	@echo "Targets:"
	@echo ""
	@grep -E '^([a-zA-Z_-])+%*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}'


.PHONY: docker_build
docker_build: docker_build-claudine docker_build-cato docker_build-phantom  ## Build all docker containers

.PHONY: docker_build-claudine
docker_build-claudine: ## build claudine containers
	(cd sshd && ./build-docker.sh)

.PHONY: docker_build-cato
docker_build-cato: ## build cato containers
	./build-cato.sh

.PHONY: docker_build-phantom
docker_build-phantom: ## build phantom containers
	(cd app && npm run buildprod && cd - && \
			./build-phantom.sh)

.PHONY: docker_login-dockerhub
docker_login-dockerhub:| check-DOCKERHUB_USER check-DOCKERHUB_PASS  ## Login to docker registery. Requires DOCKERHUB_USER and DOCKERHUB_PASS to be set in the environment
	@printf "${DOCKERHUB_PASS}\n" | docker login -u "${DOCKERHUB_USER}" --password-stdin

.PHONY: docker_push-dockerhub
docker_push-dockerhub: docker_push-claudine docker_push-cato docker_push-phantom | docker_login-dockerhub  ## push all containers to docker registry

docker_push-%:| docker_login-dockerhub
	@echo "push $* ${VERSION}"
	docker push "jataware/clouseau:$*_${VERSION}"



.PHONY: npm_run_dev
npm_run_dev:
	(cd app && npm run dev)
