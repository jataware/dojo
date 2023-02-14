FROM python:3.10

ENV TRANSFORMERS_CACHE="/recommender/big_models_data_cache"

RUN pip install --upgrade pip
COPY ./requirements.txt /recommender/
RUN pip install -r /recommender/requirements.txt

RUN python -c "from transformers import pipeline; pipeline('text-generation', model='gpt2-xl')"

COPY ./src /recommender/src

WORKDIR /recommender

CMD python src/causal_recommender_api.py
