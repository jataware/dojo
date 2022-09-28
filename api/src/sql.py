# imports
from typing import  List, Optional
import pandas as pd
import numpy as np
import hashlib
import random
import string
from .db import engine
from sqlmodel import Field, SQLModel, create_engine, Relationship, Session, select
from sqlalchemy import BigInteger, Column
from pydantic import conint, confloat, constr, BaseModel, validator
from pydantic.main import ModelMetaclass
from elasticsearch import Elasticsearch

from src.settings import settings
from fastapi.logger import logger

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

default_columns = [
    "timestamp",
    "country",
        "admin1",
        "admin2",
        "admin3",
        "lat",
        "lng",
        "feature",
        "value",
    ]


# create SQLModel classes
class Feature(SQLModel, table=True):
    feature_id: str = Field(default=None, primary_key=True)
    dataset_id: constr(strict=True) = Field(title="Dataset id")
    timestamp: Optional[int] = Field(
        title="Epoch timestamp", default=None, sa_column=Column(BigInteger())
    )
    country: Optional[str] = Field(title="country")
    admin1: Optional[str] = Field(title="admin1")
    admin2: Optional[str] = Field(title="admin2")
    admin3: Optional[str] = Field(title="admin3")
    lat: confloat(strict=True) = Field(title="lat")
    lng: confloat(strict=True) = Field(title="lng")
    feature: constr(strict=True) = Field(title="feature")
    value_type: constr(strict=True) = Field(title="value_type")
    value: Optional[str] = Field(title="value")


class Qualifier(SQLModel, table=True):
    qualifier_id: Optional[int] = Field(default=None, primary_key=True)
    dataset_id: constr(strict=True) = Field(title="Dataset id")
    qualifier_name: constr(strict=True) = Field(title="qualifier_name")
    qualifier_type: constr(strict=True) = Field(title="qualifier_type")
    qualifier_value: Optional[str]  = Field(title="qualifier_value")

    feature_id: str = Field(default=None, foreign_key="feature.feature_id")


# validation wrapper
def validate_data_schema(data_schema: ModelMetaclass):
    """This decorator will validate a pandas.DataFrame against the given data_schema."""

    def Inner(func):
        def wrapper(*args, **kwargs):
            res = func(*args, **kwargs)
            if isinstance(res, pd.DataFrame):
                # check result of the function execution against the data_schema
                df_dict = res.to_dict(orient="records")

                # Wrap the data_schema into a helper class for validation
                class ValidationWrap(BaseModel):
                    df_dict: List[data_schema]

                # Do the validation
                _ = ValidationWrap(df_dict=df_dict)
            else:
                raise TypeError(
                    "Your Function is not returning an object of type pandas.DataFrame."
                )

            # return the function result
            return res

        return wrapper

    return Inner


# apply the wrapper to a return validated function
@validate_data_schema(data_schema=Feature)
def return_validated_feature(df) -> pd.DataFrame:
    return df


@validate_data_schema(data_schema=Qualifier)
def return_validated_qualifier(df) -> pd.DataFrame:
    return df


def return_mapping_value_types(indicator):
    feature_mapping = {}
    qualifier_mapping = {}

    outputs = indicator.get("outputs")
    qualifiers = indicator.get("qualifier_outputs")

    for output in outputs:
        feature_mapping[output["name"]] = output["type"]

    for output in qualifiers:
        if output.get("name", "") not in default_columns and not output.get(
            "qualifier_role", None
        ):
            qualifier_mapping[output["name"]] = output["type"]

    return feature_mapping, qualifier_mapping


def feature_to_type(row, mapping):
    return mapping[row.get("feature")]


def set_column_types(df,type, columns=[]):

    for col in columns:
        df[col] = df[col].astype(type)
    return df


def create_qualifier_dataframe(df, feature_mapping, qualifier_mapping):
    qualifier_df = df.drop(
        default_columns,
        axis=1,
    )
    for col in feature_mapping.keys():
        try:
            qualifier_df.drop(col)
        except Exception as e:
            logger.info(e)

    # wide to long
    qualifier_df_long = pd.melt(
        qualifier_df,
        id_vars=["dataset_id", "feature_id"],
        value_vars=list(qualifier_mapping.keys()),
        var_name="feature",
        value_name="qualifier_value",
    )

    # map value type to qualifier name using mapper
    qualifier_df_long["qualifier_type"] = qualifier_df_long.apply(
        lambda x: feature_to_type(x, qualifier_mapping), axis=1
    )
    # change column name
    qualifier_df_long=qualifier_df_long.rename(columns={"feature": "qualifier_name"})

    # set columns to str type
    qualifier_df_long=set_column_types(
        df=qualifier_df_long,
        type=str,
        columns=["qualifier_value", "dataset_id","qualifier_name", "feature_id"])

    return qualifier_df_long


def create_feature_dataframe(df,feature_mapping):
    # remove qualifiers
    only_feature_columns=default_columns+['dataset_id','feature_id']


    df = df[only_feature_columns]
    #  set value_type for each feature.
    df["value_type"] = df.apply(
        lambda x: feature_to_type(x, feature_mapping), axis=1
    )
    df['timestamp'].replace(to_replace=[np.nan], value=-9999, inplace=True)

    df = set_column_types(
        df=df,
        type=str,
        columns=["value", "value_type", "feature_id", "feature"])

    df = set_column_types(
        df=df,
        type="Int64",
        columns=["timestamp"])

    return df


def prepare_indicator_for_database(indicator):
    try:
        indicator_id=indicator.get('id')
        feature_mapping, qualifier_mapping = return_mapping_value_types(indicator)
    except Exception as e:
        logger.exception(e)
        raise Exception("Indiciator not found in es")
    try:
        # read in data
        df = pd.concat(pd.read_parquet(file) for file in indicator["data_paths"])

        # create primary key - feature_id for each row.
        df["dataset_id"] = indicator_id
        df = df.reset_index(drop=True)

        df["row_id"] = df.index
        df["feature_id"] = df.apply(
            lambda x: hashlib.sha224(
                str(indicator_id).encode("utf-8") + str(x["row_id"]).encode("utf-8")
            ).hexdigest(),
            axis=1
        )

        #create feature df
        feature_df = create_feature_dataframe(df, feature_mapping)

        # validate feature df
        validated_features = return_validated_feature(feature_df)


        # create qualifier df
        qualifier_df = create_qualifier_dataframe(
            df, feature_mapping, qualifier_mapping
        )

        # validate qualifier df
        validated_qualifiers=return_validated_qualifier(qualifier_df)

        # create feature dataframe


        return validated_features, validated_qualifiers

    except Exception as e:
        logger.info(e)


def save_to_sql(validated_df, table):
    logger.info(validated_df)
    try:
        validated_df.to_sql(
            table,
            engine,
            if_exists='append',
            index=False
        )

    except Exception as e:
        logger.exception(e)


# see if data was populated
def select_data():
    try:
        with Session(engine) as session:
            statement = select(Feature)
            results = session.exec(statement)
            for row in results:
                logger.info(f'row {row}row')
    except Exception as e:
        logger.exception(e)


# create the database
def create_db_and_tables():
    # Create the engine
    SQLModel.metadata.create_all(engine)

