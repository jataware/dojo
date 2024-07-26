from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):

    ELASTICSEARCH_URL: str = "http://localhost:9200"

    DATASET_STORAGE_BASE_URL: str
    DOCUMENT_STORAGE_BASE_URL: str

    CSV_FILE_NAME: str = "raw_data.csv"
    DOJO_URL: str
    OCR_URL: str

    TERMINAL_ENDPOINT: str

    STORAGE_HOST: Optional[str] = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
