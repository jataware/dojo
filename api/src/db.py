from sqlmodel import create_engine

SQLALCHEMY_DATABASE_URL = "postgresql://api_postgres:api_postgres@api-postgres/api_postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL,  echo=True)