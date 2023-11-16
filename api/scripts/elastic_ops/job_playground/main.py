
import requests
import pprint

pp = pprint.PrettyPrinter(indent=2)

PROTOCOL = "http"
HOST = "localhost"
PORT = "8000"
BASE = f"{PROTOCOL}://{HOST}:{PORT}"

# NOTE Replace ID with your Dataset/Indicator ID
JOB_P = "76fe7e85-1e32-4c7c-b757-e198f1a9278b/file_processors.file_conversion"

JOB_ID = JOB_P.replace("/", "_")

print(f"\nExpected job id: {JOB_ID}")

# My pretty-print shortcut
mp = pp.pprint


def main():
    print(f"\nCreating hardcoded job JOB_P: {JOB_P}")
    # 1 Create RQ job... which one?
    response = requests.post(f"{BASE}/job/{JOB_P}", json={
        "filename": "raw_data.nc",
        # "force_restart": False
    })

    # 2 Get jobId or ID of indicator created
    print(f"\nResponse.status_code: {response.status_code}")

    json = response.json()

    print("\n====\nResponse body:\n\n")
    mp(json)

    id = json.get("id")

    print(f"\n===========\nJob id:\n{id}")

    # 3 fetch job result
    # 3a POST
    post_fetch = requests.post(f"{BASE}/job/fetch/{JOB_ID}")
    print("\npost_fetch RESULT res:")
    mp(post_fetch.json())
    # 3b GET
    get_fetch = requests.get(f"{BASE}/job/fetch/{JOB_ID}")
    print("\nget_fetch RESULT res:")
    mp(get_fetch.json())

    # 4 GET job status
    fetched = requests.get(f"{BASE}/job/{JOB_P}")

    print("\nResult from calling GET job status:\n")
    mp(fetched.json())


if __name__ == "__main__":
    main()
