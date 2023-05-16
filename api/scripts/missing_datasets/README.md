Uses APIs to "scrape" and check if datasets are missing from a third-party service.

## Setup

Copy env.sample to .env on root dir and populate values.

Some non-sensitive sample values:

```
MD_HOST=subdomain.dojo-modeling.com
MD_PROTOCOL=https
MD_API_ROOT=api/dojo
MD_EXTERNAL_BASE_URI=https://some-domain-path/datacubes?filters
```


## Running

To run from base project root dir:

```
$ poetry env use python3.10   # tells poetry to use this python version when creating a venv for this project
$ poetry shell                # activate virtual env
$ poetry install              # install dependencies if not done so before
$ poetry run main             # run main fn as decribed in project toml file. Usually cmd to re-run (do previous steps once per terminal)
```
