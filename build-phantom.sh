#!/usr/bin/env sh

DT=$(date +"%Y%m%d")
GIT=${DT}.git.$(git rev-parse --short HEAD)
VERSION="0.2.1"
TAG="${VERSION}"

GROUP=jataware
NAME=phantom
IMAGE="${GROUP}/${NAME}"

docker build -f phantom/Dockerfile \
       -t "${IMAGE}:dev" \
       -t "${IMAGE}:${TAG}" \
       -t "${IMAGE}:${TAG}-dev" \
       -t "${IMAGE}:${GIT}" \
       .
