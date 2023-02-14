FROM python:3.10

RUN pip install --upgrade pip
COPY ./requirements.txt /recommender/
RUN pip install -r /recommender/requirements.txt

COPY ./src /recommender/src
COPY ./big_models_data_cache /recommender/big_models_data_cache
WORKDIR /recommender

ENV TRANSFORMERS_CACHE="/recommender/big_models_data_cache"

RUN pwd
RUN ls

CMD python src/causal_recommender_api.py
