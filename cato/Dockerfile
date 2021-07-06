FROM golang:1.16.3-alpine3.13 AS build
RUN apk --no-cache add gcc g++ make git
WORKDIR /src
COPY ./claudine .

ARG CLOUSEAU_VERSION
ARG CLOUSEAU_BUILD
ARG CLOUSEAU_COMMIT

WORKDIR /src/server
RUN GOOS=linux GOARCH=amd64 go build \
        -ldflags="-s -w" \
        -ldflags "-X main.Version=${CLOUSEAU_VERSION} -X main.Build=${CLOUSEAU_BUILD} -X main.Commit=${CLOUSEAU_COMMIT}" \
        -o /out/cato main.go

FROM alpine:3.14
RUN apk --no-cache add ca-certificates
WORKDIR /usr/bin

COPY --from=build /out/cato .

ENV USER=app
ENV GROUP=app
RUN addgroup -S ${USER} && adduser -S ${USER} -G ${GROUP}
USER app

WORKDIR /home/app
RUN mkdir -p /home/app/cato
WORKDIR /home/app/cato


ENTRYPOINT ["cato"]
CMD []