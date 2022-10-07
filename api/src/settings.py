from pydantic import BaseSettings


class Settings(BaseSettings):

    BIND_PORT: int = 8000
    ELASTICSEARCH_URL: str
    ELASTICSEARCH_PORT: int = 9200
    DMC_URL: str
    DMC_PORT: int = 8080
    DMC_USER: str
    DMC_PASSWORD: str
    DMC_LOCAL_DIR: str

    DATASET_STORAGE_BASE_URL: str
    DOJO_URL: str

    REDIS_HOST: str
    REDIS_PORT: int = 6379

    DOCKERHUB_URL: str = ""
    DOCKERHUB_USER: str = ""
    DOCKERHUB_PWD: str = ""
    DOCKERHUB_ORG: str = "jataware"

    DATASET_STORAGE_BASE_URL: str = "file:///datasets/"

    CONFIG_STORAGE_BASE: str = "file:///dojo/configs/"

    REQUIRE_AUTH: bool = True
    SESSION_COOKIE_NAME: str = "dojo-auth-session"
    KEYCLOAK_URL: str = "http://keycloak:8080/"
    KEYCLOAK_CLIENT_ID: str = "causemos"
    KEYCLOAK_REALM_NAME: str = "Uncharted"
    KEYCLOAK_CLIENT_SECRET_KEY: str = "jtbQhs6SlfynqJaygVpwav2kLzAme2b4"

    UVICORN_RELOAD: bool = False

    UAZ_URL: str = ""
    UAZ_THRESHOLD: str = ""
    UAZ_HITS: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
