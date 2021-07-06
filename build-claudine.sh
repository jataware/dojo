#!/usr/bin/env sh

DT=$(date +"%Y%m%d")
COMMIT=$(git rev-parse --short HEAD)
GIT=${DT}.git.${COMMIT}
PROJECT="claudine"
VERSION="2.2.1"
TAG="${PROJECT}_${VERSION}"

GROUP=jataware
NAME=clouseau
IMAGE="${GROUP}/${NAME}"

docker build -f sshd/Dockerfile \
       --build-arg CLOUSEAU_VERSION=${VERSION} \
       --build-arg CLOUSEAU_BUILD=${DT} \
       --build-arg CLOUSEAU_COMMIT=${COMMIT} \
       -t "${IMAGE}:${PROJECT}-latest" \
       -t "${IMAGE}:${PROJECT}-dev" \
       -t "${IMAGE}:${TAG}" \
       -t "${IMAGE}:${TAG}-dev" \
       -t "${IMAGE}:${GIT}" \
       .
