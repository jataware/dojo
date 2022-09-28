from sqlmodel import create_engine
from src.settings import settings


engine = create_engine(settings.DATASET_DB_URL,  echo=True)