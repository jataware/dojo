# World Bank upload script

Step right up, folks, and lend an ear! Ever find yourself in a pickle, left high and dry with no indicators on your Elasticsearch database for Dojo? Well, we have the solution to turn that frown upside down! Introducing our latest, greatest script that will make your life easier than Sunday morning. With just one click, this magic genie will populate your Elasticsearch with World Bank Data faster than you can say 'Jack Robinson'! No fuss, no muss, just pure data at your fingertips! Time is of the essence, ladies and gentlemen. Grab this script today, and propel your Elasticsearch database into a world of endless possibilities and instant insights! Don't just stand there; step into the future with the World Bank Data script. Elasticsearch never looked this good!


> This script will upload World Bank datasets to a dojo instance. 

# Dependencies

Python 3.10 and `poetry` installed in your system.

To run the script you will need to install the requirements in the pyproject using `poetry install` and from the root directory run:

```
poetry run main
```

or 

```
poetry run python wdi/main.py --es=http://localhost:9200
```

For more options:

```
poetry run python wdi/main.py --es=http://localhost:9200 --bucket="bucket name" --aws_key='aws_key' --aws_secret="aws_secret"
```

--es flag set to the instance of elasticsearch you want to save metadata to. Default to port 9200 on local.

--bucket is the aws bucket you want to save the parquet and csv files to. If you do not set this flag the script will save the parquet and csv files locally in the docker container dojo-api at /storage/datasets/{id}/ . 

--folder is the aws folder of where you want to save the parquet and csv files. 

--aws_key is you aws public key

--aws_secret is you aws secret key
