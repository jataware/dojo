from pydantic import BaseSettings


class Settings(BaseSettings):

    ELASTICSEARCH_URL: str = "http://localhost:9200"

    DATASET_STORAGE_BASE_URL: str
    CSV_FILE_NAME: str = "raw_data.csv"
    DOJO_URL: str

    TERMINAL_ENDPOINT: str

    STORAGE_HOST: str = None

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
