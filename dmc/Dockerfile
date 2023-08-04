FROM busybox

RUN mkdir /dmc

WORKDIR /dmc

COPY dags/ dags/

CMD cp -R /dmc/dags/* /dags && chown 50000:50000 -R /dags

