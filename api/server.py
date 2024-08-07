import logging

import uvicorn
from elasticsearch import Elasticsearch
from fastapi import FastAPI, exceptions
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import json

from src import (
    terminal,
    data,
    dojo,
    healthcheck,
    indicators,
    documents,
    models,
    ui,
    runs,
    data_modelings,
    knowledge
)
from src.settings import settings

logger = logging.getLogger(__name__)

api = FastAPI(docs_url="/")
api.include_router(healthcheck.router, tags=["Health Check"])
api.include_router(models.router, tags=["Models"])
api.include_router(dojo.router, tags=["Dojo"])
api.include_router(runs.router, tags=["Runs"])
api.include_router(indicators.router, tags=["Indicators"])
api.include_router(documents.router, tags=["Documents"])
api.include_router(knowledge.router, tags=["Knowledge"])
api.include_router(terminal.router, prefix="/terminal", tags=["Terminal"])
api.include_router(ui.router, prefix="/ui", tags=["Dojo UI"])
api.include_router(data.router, tags=["Data"])
api.include_router(data_modelings.router, tags=["Data Modelings"])


def setup_elasticsearch_indexes():
    """
    Creates any indexes not present on the connected elasticsearch database.
    Won't deeply merge or overwrite existing index/properties- only creates
    missing indeces.
    Config should match keyword args on:
    https://elasticsearch-py.readthedocs.io/en/v8.3.2/api.html#elasticsearch.client.IndicesClient.create
    """
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
                    "outputs": {"type": "nested"},
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
        "features": {
            "mappings": {
                "properties": {
                    "embeddings": {
                        "type": "dense_vector",
                        "dims": 1536
                    }
                }
            }
        },
        "documents": {
            "settings": {
                "index": {
                    "sort.field": "uploaded_at",
                    "sort.order": "desc"
                }
            },
            "mappings": {
                "properties": {
                    "title": {
                        "type": "text",
                        "fields": {
                            "lowersortable": {
                                "type": "keyword",
                                "normalizer": "lowercase"
                            }
                        }
                    },
                    "publisher": {
                        "type": "text",
                        "fields": {
                            "lowersortable": {
                                "type": "keyword",
                                "normalizer": "lowercase"
                            }
                        }
                    },
                    "creation_date": {
                        "type": "date"
                    },
                    "uploaded_at": {
                        "type": "date"
                    },
                    "processed_at": {
                        "type": "date"
                    }
                }
            }
        },
        "document_paragraphs": {
            "mappings": {
                "properties": {
                    "embeddings": {
                        "type": "dense_vector",
                        "dims": 1536
                    },
                    "length": {
                        "type": "short"
                    },
                    "index": {
                        "type": "long"
                    },
                    "page_no": {
                        "type": "long"
                    }
                }
            }
        },
        "data_modelings": {
            "mappings": {
                "properties": {
                    "data": {
                        "type": "object",
                        "enabled": False
                    }
                }
            }
        }
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


@api.exception_handler(exceptions.RequestValidationError)
@api.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    logger.info(f"Request or Response validation failed!: {exc}")
    exc_json = json.loads(exc.json())
    return JSONResponse({"detail": exc_json}, status_code=422)


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
