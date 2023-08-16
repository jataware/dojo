
These scripts will verify that features and indicators index are in sync, as well as offer
an additional script that will populate the features index from the indicators one.


Check if the features index is missing outputs from indicators.outputs:
```
poetry run python semantic_work/verify_missing_features.py
```

Index all features from the indicators index:

```
poetry run python semantic_work/populate_features_index.py
```

We should not exactly need this for our production system if it's working properly, as our rq worker has a task to update the features index anytime the API registers or updates a dataset/indicator.




