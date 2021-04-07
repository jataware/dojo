
FROM golang:stretch AS build
WORKDIR /src
ENV CGO_ENABLED=0
COPY ./claudine .
RUN GOOS=linux GOARCH=amd64 go build -o /out/claudine main.go
RUN GOOS=linux GOARCH=amd64 go build -o /out/c client.go

FROM ubuntu:20.04

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get clean && apt-get install -y \
    sudo \
    wget \
    curl \
    git \
    zip \
    openssh-server

RUN mkdir /var/run/sshd
RUN echo 'root:root' |chpasswd
RUN ssh-keygen -A
RUN sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN echo "clouseau ALL=NOPASSWD:ALL" >> /etc/sudoers.d/50-clouseau

RUN useradd --user-group --create-home clouseau && \
    usermod -s /bin/bash clouseau && \
    echo "clouseau:clouseau" | chpasswd clouseau && \
    echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep && \
    mkdir /home/clouseau/.ssh /home/clouseau/.tools && \
    echo "\n\
if [ -n \$BASH ] && [ -r ~/.bashrc ]; then\n\
    . ~/.bashrc\n\
fi\n" >> /home/clouseau/.bash_profile

COPY --from=build /out/claudine /home/clouseau/.tools/claudine
COPY --from=build /out/c /home/clouseau/.tools/c
COPY assets/settings.yaml /home/clouseau/.tools/settings.yaml

COPY assets/.bash-preexec /home/clouseau/.bash-preexec
COPY assets/.bashrc /home/clouseau/.bashrc
COPY assets/.hooks /home/clouseau/.hooks


RUN chown -v -R clouseau:clouseau /home/clouseau

USER clouseau
WORKDIR /home/clouseau

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT []
CMD ["entrypoint.sh"]
