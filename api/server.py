import logging


import uvicorn
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Request, HTTPException
from typing import Union

from src import (
    auth,
    clouseau,
    data,
    dojo,
    healthcheck,
    indicators,
    models,
    phantom,
    runs,
)
from src.settings import settings
from src.auth import check_auth

logger = logging.getLogger(__name__)

api = FastAPI(docs_url="/")
api.include_router(auth.router, tags=["Authentication"])
api.include_router(healthcheck.router, tags=["Health Check"])
api.include_router(models.router, tags=["Models"])
api.include_router(dojo.router, tags=["Dojo"])
api.include_router(runs.router, tags=["Runs"])
api.include_router(indicators.router, tags=["Indicators"])
api.include_router(clouseau.router, prefix="/clouseau", tags=["Clouseau"])
api.include_router(phantom.router, prefix="/phantom", tags=["Phantom"])
api.include_router(data.router, tags=["Data"])

if settings.REQUIRE_AUTH:
    @api.middleware("http")
    async def check_keycloak_auth(request: Request, call_next):
        headers = dict(request['headers'])
        bearer = headers.get('bearer', None)

        if not request['path'].startswith(('/auth', '/healthcheck')):
            # Check_auth raises a 401 if it is invalid
            try:
                check_auth(bearer)
            except HTTPException as err:
                return err
        
        # If we make it to here, we don't need to auth or have a valid token
        response = await call_next(request)
        return response

def setup_elasticsearch_indexes():
    # Config should match keyword args on https://elasticsearch-py.readthedocs.io/en/v8.3.2/api.html#elasticsearch.client.IndicesClient.create
    indices = {
        "accessories": {},
        "annotations": {
            "mappings": {
                "date_detection": False,
                "properties": {
                    "annotations": {"type": "object", "enabled": False},
                    "metadata": {"type": "object", "enabled": False},
                },
            }
        },
        "configs": {},
        "directives": {},
        "indicators": {
            "mappings": {
                "properties": {
                    "created_at": {"type": "long"},
                    "data_quality": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "data_sensitivity": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "deprecated": {"type": "boolean"},
                    "description": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "domains": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "fileData": {
                        "properties": {
                            "raw": {"properties": {"uploaded": {"type": "boolean"}}}
                        }
                    },
                    "geography": {
                        "properties": {
                            "admin1": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "admin2": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "admin3": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "country": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                        }
                    },
                    "id": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "maintainer": {
                        "properties": {
                            "email": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "name": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "organization": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                            "website": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword", "ignore_above": 256}
                                },
                            },
                        }
                    },
                    "name": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "outputs": {"type": "object", "enabled": False},
                    "period": {
                        "properties": {"gte": {"type": "long"}, "lte": {"type": "long"}}
                    },
                    "published": {"type": "boolean"},
                    "qualifier_outputs": {"type": "object", "enabled": False},
                    "spatial_resolution": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                    "temporal_resolution": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                    },
                }
            }
        },
        "models": {},
        "outputfiles": {},
        "runs": {},
    }
    es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

    for idx, config in indices.items():
        if not es.indices.exists(index=idx):
            logger.info(f"Creating index {idx}")
            es.indices.create(index=idx, body=config)


def print_debug_routes() -> None:
    max_len = max(len(route.path) for route in api.routes)
    routes = sorted(
        [
            (method, route.path, route.name)
            for route in api.routes
            for method in route.methods
        ],
        key=lambda x: (x[1], x[0]),
    )
    route_table = "\n".join(
        f"{method:7} {path:{max_len}} {name}" for method, path, name in routes
    )
    logger.debug(f"Route Table:\n{route_table}")


@api.on_event("startup")
async def startup_event() -> None:
    setup_elasticsearch_indexes()
    print_debug_routes()


if __name__ == "__main__":
    setup_elasticsearch_indexes()
    print_debug_routes()
    if settings.UVICORN_RELOAD:
        uvicorn.run(
            f"{__name__}:api",
            host="0.0.0.0",
            port=settings.BIND_PORT,
            reload=True,
            log_config="logging.color.yaml",
        )
    else:
        uvicorn.run(
            api, host="0.0.0.0", port=settings.BIND_PORT, log_config="logging.yaml"
        )
