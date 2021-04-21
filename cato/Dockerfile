FROM golang:1.16.3-alpine3.13 AS build
RUN apk --no-cache add gcc g++ make git
WORKDIR /src
COPY ./claudine .

WORKDIR /src/server
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /out/cato main.go

FROM alpine:3.13
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