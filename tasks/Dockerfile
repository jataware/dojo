FROM --platform=linux/amd64 python:3.8-bullseye

RUN apt-get update &&\
    apt-get reinstall -y gdal-bin=3.2.2+dfsg-2+deb11u2 \
    libgdal-dev=3.2.2+dfsg-2+deb11u2 && \
    apt install -y wget unzip python3-rtree python3-all-dev tesseract-ocr ghostscript

RUN apt install --no-install-recommends -y libreoffice-writer libreoffice-impress    

RUN wget https://jataware-world-modelers.s3.amazonaws.com/gadm/gadm36_0.feather.zip
RUN wget https://jataware-world-modelers.s3.amazonaws.com/gadm/gadm36_2.feather.zip
RUN wget https://jataware-world-modelers.s3.amazonaws.com/gadm/gadm36_3.feather.zip
RUN mkdir ~/elwood_data && \
    unzip gadm36_0.feather.zip -d ~/elwood_data/ && \
    unzip gadm36_2.feather.zip -d ~/elwood_data/ && \
    unzip gadm36_3.feather.zip -d ~/elwood_data/ && \
    rm gadm36_?.feather.zip

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV GADM_DIR=/root/elwood_data

RUN pip install --upgrade pip
RUN pip install numpy==1.22  # Numpy must be installed before GDAL (in requirements.txt) to prevent issues

COPY ./tasks/requirements.txt /tasks/requirements.txt
WORKDIR /tasks
RUN pip install -r requirements.txt

COPY ./tasks /tasks

ENV PYTHONPATH "${PYTHONPATH}:/api"
