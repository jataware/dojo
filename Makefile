
# Dependencies

# gnumake curl git
# docker docker-compose

VERSION := 2.4.6

DEV ?= $(strip $(if $(findstring y,$(prod)),,dev))

VERSION := ${VERSION}$(DEV:dev=-dev)

DETECTED_OS := $(shell uname)

CMD_ARGUMENTS ?= $(cmd)

.DEFAULT_GOAL := help

check-%:
	@: $(if $(value $*),,$(error $* is undefined))

help:
	@echo ""
	@echo "By default make targets assume DEV to run production pass in prod=y as a command line argument"
	@echo ""
	@echo "Targets:"
	@echo ""
	@grep -E '^([a-zA-Z_-])+%*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}'

ip-addr:
ifeq ($(DETECTED_OS),Darwin) # Mac OS X
	$(eval ip_address=$(shell ipconfig getifaddr en0))
else
	$(eval ip_address=$(shell hostname -i))
endif

.PHONE: ip
ip:| ip-addr
	@echo ${ip_address}

.PHONY: docker_build
docker_build: docker_build-cato  ## Build all docker containers

.PHONY: docker_build-cato
docker_build-cato: ## Build Cato container
	./build-cato.sh

.PHONY: docker_login-dockerhub
docker_login-dockerhub:| check-DOCKERHUB_USER check-DOCKERHUB_PASS  ## Login to docker registery. Requires DOCKERHUB_USER and DOCKERHUB_PASS to be set in the environment
	@printf "${DOCKERHUB_PASS}\n" | docker login -u "${DOCKERHUB_USER}" --password-stdin

.PHONY: docker_push-dockerhub
docker_push-dockerhub: docker_push-cato | docker_login-dockerhub  ## Push all containers to docker registry

docker_push-%:| docker_login-dockerhub
	@echo "push $* ${VERSION}"
	docker push "jataware/clouseau:$*_${VERSION}"

.PHONY: go_fmt-embedded
go_fmt-embedded:   ## format claudine/embedded
	(cd claudine/embedded/app && go fmt claudine/embedded/app)
	(cd claudine/embedded && go fmt claudine/embedded)

.PHONY: go_fmt-preexec
go_fmt-preexec:
	(cd claudine/preexec && go fmt claudine/preexec)

.PHONY: go_fmt-server
go_fmt-server:
	(cd claudine/server/cato && go fmt claudine/server/cato)
	(cd claudine/server && go fmt claudine/server)

.PHONY: go_fmt-cli
go_fmt-cli:
	(cd claudine/cli && go fmt ./... )


.PHONY: go_fmt
go_fmt:| go_fmt-embedded go_fmt-preexec go_fmt-server go_fmt-cli  ## format go files

.PHONY: go_build-embedded
go_build-embedded:  ## Compile claudine/embedded
	(cd claudine/embedded/app && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" claudine/embedded/app)
	(cd claudine/embedded && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../build/claudine claudine/embedded)

.PHONY: go_build-preexec
go_build-preexec: ## Compile claudine/preexec
	(cd claudine/preexec && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../build/dojo-preexec main.go)

.PHONY: go_build-server
go_build-server: ## Compile claudine/server
	(cd claudine/server/cato && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" claudine/server/cato)
	(cd claudine/server && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../build/cato main.go)

.PHONY: go_build-cli
go_build-cli:  ## Compile claudine/cli
	(cd claudine/cli && \
		 go mod tidy && \
		 go build -gcflags="-m=2 -l" \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../build/dojo main.go)
dist:
	mkdir -p dist/pkg

dist-clean:
			 -rm -r dist/*

.PHONY: go_build-linux-preexec
go_build-linux-preexec:
	(cd claudine/preexec && \
		 go mod tidy && \
		 GOOS=linux go build -gcflags="-m=2 -l" \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../../dist/pkg/dojo-preexec main.go)


.PHONY: go_build-linux-embedded
go_build-linux-embedded:
	(cd claudine/embedded/app && \
		 go mod tidy && \
		 GOOS=linux go build claudine/embedded/app)
	(cd claudine/embedded && \
		 go mod tidy && \
		 GOOS=linux go build \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../../dist/pkg/claudine claudine/embedded)

.PHONY: go_build-linux-cli
go_build-linux-cli:
	(cd claudine/cli && \
		 go mod tidy && \
		 GOOS=linux go build \
							-ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
							-o ../../dist/pkg/dojo main.go)

GO_PKG_BUILDS := go_build-linux-cli go_build-linux-embedded go_build-linux-preexec

.PHONY: docker-package
docker-package: dist-clean dist  $(GO_PKG_BUILDS) ## Build template package
	(cp -r claudine/pkg/. dist/pkg/ && \
	 cd dist && \
	 tar czvf pkg.tgz -C pkg .)

GO_BUILDS := go_build-embedded go_build-server go_build-preexec go_build-cli

.PHONY: go_build
go_build:| $(GO_BUILDS) ## Build go binaries

.PHONY: fmt
fmt:| go_fmt  ## Format all

.PHONY: compile
compile:| go_build  ## Compile all builds

.PHONY: cato_run_dev
cato_run_dev: ## Dev - run cato dev server locally
	(cd claudine/server && \
			HTTP_STATIC=../../dist go run \
				 -ldflags "-X main.Version=${VERSION} -X main.Build=$(shell date +%FT%T%Z) -X main.Commit=$(shell git rev-parse --short HEAD)" \
				 main.go -settings settings.yaml -debug -trace -env -pull-images=false)

.PHONY: socat-start
socat-start:  ## Dev - start socat dev server
	@echo Starting socat
	@docker run -d --rm --name socat1 -v /var/run/docker.sock:/var/run/docker.sock -p 8375:8375 alpine/socat tcp-listen:8375,fork,reuseaddr unix-connect:/var/run/docker.sock

.PHONY: socat-stop
socat-stop:  ## Dev - stop socat dev server
	@echo Stopping socat
	@docker stop socat1

.PHONY: docker-compose_up
docker-compose_up:|ip-addr  ## Dev - run local cluster
	PRIVATE_IP=${ip_address} docker compose up --force-recreate

