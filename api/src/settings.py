from pydantic import BaseSettings, PyObject
from typing import Dict
from src.plugins import PluginHandler
from fastapi.logger import logger


class Settings(BaseSettings):

    BIND_PORT: int = 8000
    ELASTICSEARCH_URL: str
    ELASTICSEARCH_PORT: int = 9200
    DMC_URL: str
    DMC_PORT: int = 8080
    DMC_USER: str
    DMC_PASSWORD: str
    DMC_LOCAL_DIR: str

    DOJO_URL: str

    REDIS_HOST: str
    REDIS_PORT: int = 6379

    DOCKERHUB_URL: str = ""
    DOCKERHUB_USER: str = ""
    DOCKERHUB_PWD: str = ""
    DOCKERHUB_ORG: str = "jataware"

    DATASET_STORAGE_BASE_URL: str = "file:///datasets/"

    DOCUMENT_STORAGE_BASE_URL: str = "file:///documents/"

    CONFIG_STORAGE_BASE: str = "file:///dojo/configs/"

    UVICORN_RELOAD: bool = False

    UAZ_URL: str = ""
    UAZ_THRESHOLD: str = ""
    UAZ_HITS: str = ""

    DEBUG: bool = False

    PLUGINS: Dict[str, str] = {
        # "my_plugin": "plugin_module.MyPlugin",  # Where plugin_module.MyPlugin is an importable dotted path and MyPlugin
        # is a subclass of utils.PluginInterface
        # "causemos": "src.plugins.causemos.CausemosPlugin",
        "logger": "src.plugins.logging.LoggingPlugin",
    }

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Instantiate plugins defined via the settings
settings.PLUGINS = PluginHandler(settings.PLUGINS)
