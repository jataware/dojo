#!/usr/bin/env sh

DT=$(date +"%Y%m%d")
GIT=${DT}.git.$(git rev-parse --short HEAD)
PROJECT="phantom"
VERSION="2.0.1"
TAG="${PROJECT}_${VERSION}"

GROUP=jataware
NAME=clouseau
IMAGE="${GROUP}/${NAME}"

docker build -f phantom/Dockerfile \
       -t "${IMAGE}:${PROJECT}-dev" \
       -t "${IMAGE}:${TAG}" \
       -t "${IMAGE}:${TAG}-dev" \
       -t "${IMAGE}:${GIT}" \
       .
