# World Bank upload script

This script will upload World Bank datasets to a dojo instance. 

# Dependencies

Python 3.10 and `poetry` installed in your system.

To run the script you will need to install the requirements in the pyproject using `poetry install` and from the root directory run:

```
poetry run python wdi/main.py --es=http://localhost:9200
```

For more options:

```
poetry run python wdi/main.py --es=http://localhost:9200 --bucket="bucket name" --aws_key='aws_key' --aws_secret="aws_secret"
```

--es flag needs to be set to the instance of elasticsearch you want to save metadata to.

--bucket is the aws bucket you want to save the parquet and csv files to. If you do not set this flag the script will save the parquet and csv files locally in the docker container dojo-api at /storage/datasets/{id}/ . 

--folder is the aws folder of where you want to save the parquet and csv files. 

--aws_key is you aws public key

--aws_secret is you aws secret key
