import json
import requests
import os
import time

WM_USER = os.getenv("WM_USER")
WM_PASS = os.getenv("WM_PASS")

# In order to use this script, you must ssh to the Dojo instance and use LocalForward 8000 localhost:8000 or change the API_URL
API_URL = "http://localhost:8000/indicators/"
PUBLISH_ENDPOINT = "/publish"
PERSIST_PATH = "/location/to/Indicator-Backups-Prod/"

session = requests.Session()
session.auth = (WM_USER, WM_PASS)

uuids = ["59c823e2-6a04-45ef-9302-4b20e7971751"]

for uuid in uuids:

    # Persist old indicator.
    retries = 0
    while retries < 5:
        try:
            indicator = session.get(API_URL + uuid)
            response_json = indicator.json()
            break
        except:
            retries += 1
            continue

    with open(os.path.join(PERSIST_PATH, uuid + "_indicator.json"), "w") as f:
        json.dump(response_json, f)

    # Publish twice to repair and send to Causemos

    retries = 0
    while retries < 5:
        try:
            session.put(API_URL + uuid + PUBLISH_ENDPOINT)
            break
        except:
            retries += 1
            continue

    time.sleep(5)

    retries = 0
    while retries < 5:
        try:
            session.put(API_URL + uuid + PUBLISH_ENDPOINT)
            break
        except:
            retries += 1
            continue

    print(uuid)
