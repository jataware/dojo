FROM --platform=linux/amd64 python:3.9.2


RUN pip install --upgrade pip
COPY ./requirements.txt /api/
RUN pip install -r /api/requirements.txt

COPY . /api
WORKDIR /api

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-mpnet-base-v2')"

CMD ["uvicorn", "server:api", "--host", "0.0.0.0", "--port", "8000", "--log-config", "logging.yaml"]
