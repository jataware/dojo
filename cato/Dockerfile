FROM golang:1.17-buster AS build

RUN apt-get install gcc g++ make git

WORKDIR /src
COPY ./claudine .

ARG CLOUSEAU_VERSION
ARG CLOUSEAU_BUILD
ARG CLOUSEAU_COMMIT

RUN mkdir -p /out/pkg

WORKDIR /src/server
RUN GOOS=linux GOARCH=amd64 go build \
        -ldflags="-s -w" \
        -ldflags "-X main.Version=${CLOUSEAU_VERSION} -X main.Build=${CLOUSEAU_BUILD} -X main.Commit=${CLOUSEAU_COMMIT}" \
        -o /out/cato main.go

WORKDIR /src/preexec
RUN GOOS=linux GOARCH=amd64 go build \
        -ldflags="-s -w" \
        -ldflags "-X main.Version=${CLOUSEAU_VERSION} -X main.Build=${CLOUSEAU_BUILD} -X main.Commit=${CLOUSEAU_COMMIT}" \
              -o /out/pkg/dojo-preexec main.go

WORKDIR /src/cli
RUN GOOS=linux GOARCH=amd64 go build \
        -ldflags="-s -w" \
        -ldflags "-X main.Version=${CLOUSEAU_VERSION} -X main.Build=${CLOUSEAU_BUILD} -X main.Commit=${CLOUSEAU_COMMIT}" \
              -o /out/pkg/dojo main.go

WORKDIR /src/embedded
RUN GOOS=linux GOARCH=amd64 go build \
        -ldflags="-s -w" \
        -ldflags "-X main.Version=${CLOUSEAU_VERSION} -X main.Build=${CLOUSEAU_BUILD} -X main.Commit=${CLOUSEAU_COMMIT}" \
              -o /out/pkg/claudine claudine/embedded

WORKDIR /src
RUN cp -r pkg/. /out/pkg

WORKDIR /out
RUN tar czvf pkg.tgz -C pkg/ .

FROM debian:10-slim

WORKDIR /usr/bin
COPY --from=build /out/cato .

# RUN apt-get clean &&  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# RUN echo "app ALL=NOPASSWD:ALL" >> /etc/sudoers.d/50-app

RUN useradd --user-group --create-home app


RUN mkdir -p /home/app/cato/static
COPY --from=build /out/pkg.tgz /home/app/cato/static/pkg.tgz
RUN chown -v -R app:app /home/app

USER app
WORKDIR /home/app/cato

ENTRYPOINT ["cato"]
CMD []