SHELL = /bin/bash
LANG = en_US.utf-8
PYTHON = $(shell which python3 || which python)
export LANG


.PHONY:update
update:
	docker-compose pull

.PHONY:clean
clean:
	echo "Clearing all transient data" && \
	docker image prune -f && \
	docker container prune -f && \
	docker-compose pull && \
	echo "Done"

.PHONY:up
up:
	docker-compose up --scale processor=3 -d

.PHONY:down
down:
	docker-compose down

.PHONY:restart
restart:
	make down && make up

.PHONY:logs
logs:
	docker-compose logs -f --tail=30
