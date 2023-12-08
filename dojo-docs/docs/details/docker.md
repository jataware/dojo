---
layout: default
title: Prebuilt Containers
parent: Model Registration
---

# Working with prebuilt containers

Dojo supports the usage of prebuilt containers that are hosted on Dockerhub. However, Dojo currently only supports **Debian** based images such as Ubuntu. A (somewhat) complete listing of Debian derivatives can be found at the [Debian Census](https://wiki.debian.org/Derivatives/Census).

To use your own prebuilt container, you should provide the tag when provisioning your Dojo containerization environment in lieu of selecting an image that already exists in Dojo. For example, you can provide tags such as `python:3.9.10-slim-buster` or `r-base:latest`.