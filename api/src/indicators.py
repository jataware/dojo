from __future__ import annotations

import csv
import io
import re
import time
import zlib
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse

import json
import pandas as pd

## remove what is not used
from subprocess import call
import os
from glob import glob
from zipfile import ZipFile
import time
from tqdm import tqdm
from datetime import datetime, timezone
from uuid import uuid4
from urllib.parse import urlparse
import boto3
import pdb
import pydantic
from src.settings import settings

from elasticsearch import Elasticsearch
import pandas as pd
from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
    UploadFile,
    File,
    Request,
)
from fastapi.logger import logger
from fastapi.responses import StreamingResponse

from validation import IndicatorSchema, DojoSchema, MetadataSchema
from src.settings import settings

from src.dojo import search_and_scroll
from src.ontologies import get_ontologies
from src.causemos import notify_causemos
from src.causemos import deprecate_dataset
from src.utils import put_rawfile, get_rawfile, list_files
from src.plugins import plugin_action
from validation.IndicatorSchema import (
    IndicatorMetadataSchema,
    QualifierOutput,
    Output,
    Period,
    Geography,
)

import os

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# For created_at times in epoch milliseconds
def current_milli_time():
    return round(time.time() * 1000)


@router.post("/indicators")
def create_indicator(payload: IndicatorSchema.IndicatorMetadataSchema):
    try:
        indicator_id = str(uuid.uuid4())
        payload.id = indicator_id
        payload.created_at = current_milli_time()
        body = payload.json()
        payload.published = False


        plugin_action("before_create", data=body, type="indicator")
        es.index(index="indicators", body=body, id=indicator_id)
        plugin_action("post_create", data=body, type="indicator")


        empty_annotations_payload = MetadataSchema.MetaModel(metadata={}).json()
        # (?): SHOULD WE HAVE PLUGINS AROUND THE ANNOTATION CREATION?
        plugin_action("before_create", data=body, type="annotation")
        es.index(index="annotations", body=empty_annotations_payload, id=indicator_id)
        plugin_action("post_create", data=body, type="annotation")



        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={
                "location": f"/api/indicators/{indicator_id}",
                "content-type": "application/json",
            },
            content=body,
        )
    except Exception as e:
        logger.error(e)


@router.put("/indicators")
def update_indicator(payload: IndicatorSchema.IndicatorMetadataSchema):
    indicator_id = payload.id
    payload.created_at = current_milli_time()
    body = payload.json()

    plugin_action("before_update", data=body, type="indicator")
    es.index(index="indicators", body=body, id=indicator_id)
    plugin_action("post_update", data=body, type="indicator")

    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Updated indicator with id = {indicator_id}",
    )


@router.patch("/indicators")
def patch_indicator(
    payload: IndicatorSchema.IndicatorMetadataSchema, indicator_id: str
):
    payload.created_at = current_milli_time()
    body = json.loads(payload.json(exclude_unset=True))
    es.update(index="indicators", body={"doc": body}, id=indicator_id)
    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Updated indicator with id = {indicator_id}",
    )


@router.get(
    "/indicators/latest", response_model=List[IndicatorSchema.IndicatorsSearchSchema]
)
def get_latest_indicators(size=10000):
    q = {
        "_source": [
            "description",
            "name",
            "id",
            "created_at",
            "deprecated",
            "maintainer.name",
            "maintainer.email",
        ],
        "query": {
            "bool": {
                "must": [{"match_all": {}}],
                "filter": [{"term": {"published": True}}],
            }
        },
    }
    results = es.search(index="indicators", body=q, size=size)["hits"]["hits"]
    IndicatorsSchemaArray = []
    for res in results:
        IndicatorsSchemaArray.append(res.get("_source"))
    return IndicatorsSchemaArray


@router.get("/indicators", response_model=DojoSchema.IndicatorSearchResult)
def search_indicators(
    query: str = Query(None),
    size: int = 10,
    scroll_id: str = Query(None),
    include_ontologies: bool = True,
    include_geo: bool = True,
) -> DojoSchema.IndicatorSearchResult:
    indicator_data = search_and_scroll(
        index="indicators", size=size, query=query, scroll_id=scroll_id
    )
    # if request wants ontologies and geo data return all
    if include_ontologies and include_geo:
        return indicator_data
    else:
        for indicator in indicator_data["results"]:
            if not include_ontologies:
                for q_output in indicator["qualifier_outputs"]:
                    try:
                        q_output["ontologies"] = {
                            "concepts": None,
                            "processes": None,
                            "properties": None,
                        }
                    except Exception as e:
                        print(e)
                        logger.exception(e)
                for outputs in indicator["outputs"]:
                    try:
                        outputs["ontologies"] = {
                            "concepts": None,
                            "processes": None,
                            "properties": None,
                        }
                    except Exception as e:
                        print(e)
                        logger.exception(e)
            if not include_geo:
                indicator["geography"]["country"] = []
                indicator["geography"]["admin1"] = []
                indicator["geography"]["admin2"] = []
                indicator["geography"]["admin3"] = []

        return indicator_data


@router.get(
    "/indicators/{indicator_id}", response_model=IndicatorSchema.IndicatorMetadataSchema
)
def get_indicators(indicator_id: str) -> IndicatorSchema.IndicatorMetadataSchema:
    try:
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return indicator


@router.put("/indicators/{indicator_id}/publish")
def publish_indicator(indicator_id: str):
    try:
        # Update indicator model with ontologies from UAZ
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
        indicator["published"] = True
        data = get_ontologies(indicator, type="indicator")
        logger.info(f"Sent indicator to UAZ")
        es.index(index="indicators", body=data, id=indicator_id)

        # Notify Causemos that an indicator was created
        plugin_action("before_register", data=indicator, type="indicator")
        # TODO: Move notify_causemose only to causemos plugin
        notify_causemos(data, type="indicator")
        plugin_action("register", data=indicator, type="indicator")
        plugin_action("post_register", data=indicator, type="indicator")
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}/publish"},
        content=f"Published indicator with id {indicator_id}",
    )


@router.put("/indicators/{indicator_id}/deprecate")
def deprecate_indicator(indicator_id: str):
    try:
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
        indicator["deprecated"] = True
        es.index(index="indicators", id=indicator_id, body=indicator)

        # Tell Causemos to deprecate the dataset on their end
        deprecate_dataset(indicator_id)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Deprecated indicator with id {indicator_id}",
    )


@router.get(
    "/indicators/{indicator_id}/annotations", response_model=MetadataSchema.MetaModel
)
def get_annotations(indicator_id: str) -> MetadataSchema.MetaModel:
    """Get annotations for a dataset.

    Args:
        indicator_id (str): The UUID of the dataset to retrieve annotations for from elasticsearch.

    Raises:
        HTTPException: This is raised if no annotation is found for the dataset in elasticsearch.

    Returns:
        MetadataSchema.MetaModel: Returns the annotations pydantic schema for the dataset that contains a metadata dictionary and an annotations object validated via a nested pydantic schema.
    """
    try:
        annotation = es.get(index="annotations", id=indicator_id)["_source"]
        return annotation
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return None


@router.post("/indicators/{indicator_id}/annotations")
def post_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Post annotations for a dataset.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a fully formed json object representing the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset to retrieve annotations for from elasticsearch.

    Returns:
        Response: Returns a response with the status code of 201 and the location of the annotation.
    """
    try:

        body = json.loads(payload.json())

        es.index(index="annotations", body=body, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Updated annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not update annotation with id = {indicator_id}",
        )


@router.put("/indicators/{indicator_id}/annotations")
def put_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Put annotation for a dataset to Elasticsearch.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a fully formed json object representing the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset for which the annotations apply.

    Returns:
        Response: Response object with status code, informational messages, and content.
    """
    try:

        body = json.loads(payload.json())

        es.index(index="annotations", body=body, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Created annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)

        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not create annotation with id = {indicator_id}",
        )


@router.patch("/indicators/{indicator_id}/annotations")
def patch_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Patch annotation for a dataset to Elasticsearch.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a partially formed json object valid for the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset for which the annotations apply.

    Returns:
        Response: Response object with status code, informational messages, and content.
    """
    try:

        body = json.loads(payload.json(exclude_unset=True))

        es.update(index="annotations", body={"doc": body}, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Updated annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not update annotation with id = {indicator_id}",
        )


@router.post("/indicators/{indicator_id}/upload")
def upload_file(
    indicator_id: str,
    file: UploadFile = File(...),
    filename: Optional[str] = None,
    append: Optional[bool] = False,
):
    original_filename = file.filename
    _, ext = os.path.splitext(original_filename)
    dir_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, indicator_id)
    if filename is None:
        if append:
            filenum = len(
                [
                    f
                    for f in list_files(dir_path)
                    if f.startswith("raw_data") and f.endswith(ext)
                ]
            )
            filename = f"raw_data_{filenum}{ext}"
        else:
            filename = f"raw_data{ext}"

    # Upload file
    dest_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, indicator_id, filename)
    put_rawfile(path=dest_path, fileobj=file.file)

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/indicators/{indicator_id}",
            "content-type": "application/json",
        },
        content=json.dumps({"id": indicator_id, "filename": filename}),
    )


@router.get("/indicators/{indicator_id}/verbose")
def get_all_indicator_info(indicator_id: str):
    indicator = get_indicators(indicator_id)
    annotations = get_annotations(indicator_id)

    verbose_return_object = {"indicators": indicator, "annotations": annotations}

    return verbose_return_object


@router.post(
    "/indicators/validate_date",
    response_model=IndicatorSchema.DateValidationResponseSchema,
)
def validate_date(payload: IndicatorSchema.DateValidationRequestSchema):
    valid = True
    try:
        for value in payload.values:
            datetime.strptime(value, payload.format)
    except ValueError as e:
        logger.exception(e)
        valid = False

    return {
        "format": payload.format,
        "valid": valid,
    }


@router.post("/indicators/{indicator_id}/preview/{preview_type}")
async def create_preview(
    indicator_id: str, preview_type: IndicatorSchema.PreviewType, filename: Optional[str] = Query(None),
    filepath: Optional[str] = Query(None),
):
    """Get preview for a dataset.

    Args:
        indicator_id (str): The UUID of the dataset to return a preview of.

    Returns:
        JSON: Returns a json object containing the preview for the dataset.
    """
    try:
        if filename:
            file_suffix_match = re.search(r'raw_data(_\d+)?\.', filename)
            if file_suffix_match:
                file_suffix = file_suffix_match.group(1) or ''
            else:
                file_suffix = ''
        else:
            file_suffix = ''
        # TODO - Get all potential string files concatenated together using list file utility
        if preview_type == IndicatorSchema.PreviewType.processed:
            if filepath:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    filepath.replace(".csv", ".parquet.gzip")
                )
            else:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    indicator_id,
                    f"{indicator_id}{file_suffix}.parquet.gzip",
                )

            file = get_rawfile(rawfile_path)
            df = pd.read_parquet(file)
            try:
                strparquet_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    indicator_id,
                    f"{indicator_id}_str{file_suffix}.parquet.gzip",
                )
                file = get_rawfile(strparquet_path)
                df_str = pd.read_parquet(file)
                df = pd.concat([df, df_str])
            except FileNotFoundError:
                pass

        else:
            if filepath:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL, filepath
                )
            else:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL, indicator_id, "raw_data.csv"
                )
            file = get_rawfile(rawfile_path)
            df = pd.read_csv(file, delimiter=",")

        obj = json.loads(df.sort_index().reset_index(drop=True).head(100).to_json(orient="index"))
        indexed_rows = [{"__id": key, **value} for key, value in obj.items()]

        return indexed_rows
    except FileNotFoundError as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            headers={"msg": f"Error: {e}"},
            content=f"Queue could not be deleted.",
        )


### to be removed after uploading and saved in a different folder.

S3_BUCKET="jataware-world-modelers-dev"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
s3 = boto3.client('s3', aws_access_key_id=f"{AWS_ACCESS_KEY_ID}", aws_secret_access_key=f"{AWS_SECRET_ACCESS_KEY}")

@router.get("/data/populate_wdi_data")
def populate_wdi_data():
    try:
        def main():
            download_data()

            raw_data = pd.read_csv('data/WDIData.csv')

            # list of valid country codes
            countries = pd.read_csv('src/data/country.csv')
            country_codes = set(countries['Alpha-3_Code'].tolist())
            series_info = pd.read_csv('data/WDISeries.csv')

            # DEBUG. user should define what the groups are in indicator_groups.json
            save_indicators(raw_data, series_info)

            # delete all CSVs and json files in output folder
            for filename in glob('output/*.csv') + glob('output/*.json') + glob('output/*.gzip'):
                os.remove(filename)

            for name, indicators in tqdm(indicator_groups(), total=sum(1 for _ in indicator_groups()),
                                         desc='Making datasets'):

                # TODO: come up with better description from somewhere...
                description = f'World Bank Development Indicators: {", ".join(indicators)}'

                # collect all rows in df that have an indicator in indicators
                df_subset = raw_data[raw_data['Indicator Code'].isin(set(indicators))]

                # make dataset
                df = make_dataset(df_subset, country_codes)

                # create metadata for dataset
                meta = make_metadata(df, series_info, name, description)  # , feature_codes)
                #
                # # ensure output folder exists
                if not os.path.exists('output'):
                    os.makedirs('output')
                #
                # # save data to csv and metadata to json
                df.to_csv(os.path.join('output', f'{name}.csv'), index=False)
                with open(os.path.join('output', f'{name}_meta.json'), 'w') as f:
                    json.dump(meta, f)

                # make parquet files
                save_parquet(df, name, id=meta.get("id"))

                # # upload csv and parquet to s3
                upload_files_to_s3(meta.get("id"),name)

                # update meta data_paths
                meta['data_paths']=[f's3://{S3_BUCKET}/datasets/wdi/{meta.get("id")}/{meta.get("id")}.parquet.gzip']

                # # save meta data to elasticsearch
                save_meta_es(meta, name)


        main()
    except Exception as e:
        print(f'error')
        logger.info(e)
        logger.exception(e)
def download_data():
    """download data and unzip if not already done"""

    data_link = 'http://databank.worldbank.org/data/download/WDI_csv.zip'

    # download to 'data' folder if not already downloaded
    if not os.path.exists('data'):
        os.makedirs('data')
    if not os.path.exists('data/WDI_csv.zip'):
        call(['wget', data_link, '-O', 'data/WDI_csv.zip'])
    else:
        print('Skipping download, data already exists')

    # unzip data if not already unzipped
    with ZipFile('data/WDI_csv.zip', 'r') as zip_ref:
        filenames = zip_ref.namelist()
        if not all([os.path.exists('data/' + filename) for filename in filenames]):
            print('Unzipping data...', end='', flush=True)
            zip_ref.extractall('data')
            print('Done')
        else:
            print('Skipping unzip, data already exists')


def save_indicators(df, series_info):
    """For debugging purposes, create mock version of indicator_groups.json"""

    indicators = df['Indicator Code'].unique().tolist()
    firsts = [indicator.split('.')[0] for indicator in indicators]
    # seconds = [f"{first}.{indicator.split('.')[1]}" for first, indicator in zip(firsts,indicators)]
    first_counts = {first: firsts.count(first) for first in set(firsts)}

    groups = {}
    for indicator, first in zip(indicators, firsts):
        count = first_counts[first]
        if count < 100:
            if first not in groups:
                groups[first] = []
            groups[first].append(indicator)
        else:
            second = f"{first}.{indicator.split('.')[1]}"
            if second not in groups:
                groups[second] = []
            groups[second].append(indicator)

    # collect all indicators in groups of size 1 and put them in a group called 'misc'
    misc = []
    todelete = []
    for group, indicators in groups.items():
        if len(indicators) == 1:
            misc.append(indicators[0])
            todelete.append(group)
    for group in todelete:
        del groups[group]
    groups['misc'] = misc

    # get the fully qualified names based on the indicator code groupings
    abbrevs = find_abbreviations(groups, series_info)

    # map from name of group to its indicators
    indicators = {f"WDI - {abbrevs[prefix]}": indicators for prefix, indicators in groups.items()}

    with open('indicator_groups.json', 'w') as f:
        json.dump(indicators, f)
    # DEBUG plot a histogram of the number of indicators in each group
    # from matplotlib import pyplot as plt
    # counts = sorted([len(indicators) for indicators in groups.values()])
    # print(counts)
    # plt.hist(counts, bins=100)
    # plt.xlabel('Number of indicators in group')
    # plt.ylabel('Number of groups')
    # plt.title('Indicator Group Sizes')
    # plt.show()


def find_abbreviations(all_codes, info):
    # prefill some of the abbreviations
    code_chunk_abbreviations = {
        'EG': '',
        'FX': '',
        'SE': 'education',
        'PRM': '',
        'NY': 'national_accounts',
        'SP': 'health.SP',  # 'health', #TODO:
        'SEC': '',
        'SH': 'health.SH',  # 'health', #TODO:shared health?
        'HIV': 'HIV',
        'AG': '',
        'EN': 'environment.EN',
        'TX': 'trade_exports',
        'TM': 'trade_imports',
        'NV': 'national_value',
        'IS': '',
        'ER': 'environment.ER',
        'SI': 'share_income',
        'STA': 'standard',
        'MS': '',
        'FB': 'financial_banking',
        'IC': '',
        'SL': '',
        'TLF': 'total_labor_force',
        'FD': '',
        'VC': '',
        'FM': 'financial_monetary',
        'DTH': 'death',
        'GC': 'government_currency',
        'NE': 'national_expenditure',
        'BM': 'balance_money',
        'BX': 'balance_exports',
        'AGR': '',
        'MNF': '',
        'SRV': '',
        'SLF': '',
        'FAM': '',
        'WAG': '',
        'MLR': '',
        'FS': '',
        'DT': 'external_debt',
        'MED': '',
        'COM': '',
        'CON': '',
        'FP': 'financial_prices',
        'SN': '',
        'IQ': '',
        'BN': 'balances',
        'XPD': 'expenditure',
        'PA': '',
        'FPL': 'family_planning',
        'FR': 'interest_rate',
        'TER': '',
        'EMP': 'employment',
        'IND': '',
        'IT': 'information_technology',
        'GDP': 'GDP',
        'HD': 'human_development',
        'IMM': '',
        'TBS': '',
        'UHC': 'universal_health_coverage',
        'IP': 'intellectual_property',
        'SM': 'social_migration',
        'ST': 'travel_tourism',
        'IE': '',
        'LP': 'logistics_performance',
        'MMR': 'maternal_mortality',
        'CM': 'capital_market',
        'ADT': '',
        'TG': 'trade_goods',
        'DYN': '',
        'TT': 'trade_index',
        'DC': 'debt',
        'VAC': 'vaccination',
        'SGR': '',
        'H2O': 'water',
        'PRE': '',
        'ANM': '',
        'PRG': '',
        'PRV': '',
        'SVR': '',
        'GF': 'government_finance',
        'SG': 'social_gender',
        'EP': 'energy_price',
        'PX': 'private_exchange',
        'GB': 'research_expenditure',
        'ENR': '',
        'UEM': '',
        'ALC': '',
        'FI': '',
        'BG': 'balance_goods',
        'per_si_allsi': 'social_insurance',
        'per_allsp': 'social_protection',
        'per_sa_allsa': 'socal_assistance',
        'per_lm_alllm': 'labor_market',
        'misc': 'miscellaneous',
    }

    # separate out codes that contain lower case letters
    auto = [code for code in all_codes if not any([char.islower() for char in code])]
    manual = [code for code in all_codes if code not in set(auto)]

    chunks = {chunk: all_codes[code] for code in auto for chunk in code.split('.')}

    def count_nonletters(string):
        return len([char for char in string if not char.isalpha()])

    def is_abbreviation(abbr: str, word: str) -> int:
        """
        returns a score for how well the abbreviation matches the word.
        lower score is better
        None if it doesn't match
        """
        abbr, word = abbr.lower(), word.lower()
        letters = set(word)

        if any([char not in letters for char in abbr]):
            return None

        # must start with the same letter
        if abbr[0] != word[0]:
            return None

        # check if the letters in abbr appear in order in word
        i = 0
        for char in abbr:
            i = word.find(char, i)
            if i == -1:
                return None
            i += 1

        return i  # 1 #TODO score

    from typing import List
    def get_candidates(sentences: List[str]) -> List[str]:
        candidates = []
        for sentence in sentences:
            if not isinstance(sentence, str):
                continue
            for word in sentence.split():
                if count_nonletters(word) > 1:
                    continue
                word = ''.join([char for char in word if char.isalpha()])
                word = word.lower()
                if (score := is_abbreviation(chunk, word)) is not None:
                    candidates.append((word, score))

        # collect candidates with the lowest score
        candidates = sorted(candidates, key=lambda x: x[1])
        candidates = [(word, score) for word, score in candidates if score == candidates[0][1]]

        return [*set(candidates)]

    for chunk, codes in chunks.items():
        if code_chunk_abbreviations[chunk] != '':
            continue

        # collect lines from info where info['Series Code'] is in codes
        codes = set(codes)
        lines = info[info['Series Code'].isin(codes)]

        # get the topic strings, filtering out any lines that were nan
        topics = lines['Topic'].unique().tolist()
        candidates = get_candidates(topics)

        if len(candidates) == 1:
            code_chunk_abbreviations[chunk] = candidates[0][0]
            continue
        elif len(candidates) > 1:
            print(f"Multiple candidates for {chunk}: {candidates}")
            pdb.set_trace()

        names = lines['Indicator Name'].unique().tolist()
        candidates = get_candidates(names)

        if len(candidates) == 1:
            code_chunk_abbreviations[chunk] = candidates[0][0]
            continue
        elif len(candidates) > 1:
            print(f"Multiple candidates for {chunk}: {candidates}")
            pdb.set_trace()

        shortdefs = lines['Short definition'].unique().tolist()
        candidates = get_candidates(shortdefs)

        if len(candidates) == 1:
            code_chunk_abbreviations[chunk] = candidates[0][0]
            continue
        elif len(candidates) > 1:
            print(f"Multiple candidates for {chunk}: {candidates}")
            pdb.set_trace()

        longdefs = lines['Long definition'].unique().tolist()
        candidates = get_candidates(longdefs)

        if len(candidates) == 1:
            code_chunk_abbreviations[chunk] = candidates[0][0]
            continue
        elif len(candidates) > 1:
            print(f"Multiple candidates for {chunk}: {candidates}")
            pdb.set_trace()

        source = lines['Source'].unique().tolist()
        candidates = get_candidates(source)

        if len(candidates) == 1:
            code_chunk_abbreviations[chunk] = candidates[0][0]
            continue
        elif len(candidates) > 1:
            print(f"Multiple candidates for {chunk}: {candidates}")
            pdb.set_trace()

        print(f"No candidates for {chunk}")

        # get a single string that combines with space all lines['Topic'], lines['Indicator Name'], lines['Short Definition'],  lines['Long Definition']
        # lines = lines['Topic'].tolist() + lines['Indicator Name'].tolist() + lines['Short definition'].tolist()# + lines['Long definition'].tolist()
        # lines = set([line for line in lines if not pd.isnull(line)])
        # text = '\n'.join()

    # find duplicates in code_chunk_abbreviations
    # abbreviations = set(code_chunk_abbreviations.values())
    # duplicates = [abbr for abbr in abbreviations if list(code_chunk_abbreviations.values()).count(abbr) > 1]

    # pdb.set_trace()
    def unabbreviate_prefix(prefix):
        chunks = prefix.split('.')
        chunks = [code_chunk_abbreviations[chunk] for chunk in chunks]
        return '.'.join(chunks)

    # create a map from the full code to the abbreviation
    code_abbreviations = {}
    for prefix, codes in all_codes.items():
        full = unabbreviate_prefix(prefix)
        code_abbreviations[prefix] = full
        # for code in codes:
        #     code_abbreviations[code] = full

    return code_abbreviations


def indicator_groups():
    """generator for returning groups of indicators to make datasets from"""

    with open('data/indicator_groups.json', 'r') as f:
        groups = json.load(f)

    for name, group in groups.items():
        logger.info(name)
        if name == "World_Development_Indicators.misc":
            yield name, group

def make_dataset(df, country_codes):

    # columns = ['timestamp', 'country', 'admin1', 'admin2', 'admin3', 'lat', 'lng', 'feature', 'value']

    #year strings and timestamps (in milliseconds) from 1960 to 2021
    years = [(f'{year}', datetime(year, 1, 1, tzinfo=timezone.utc).timestamp()*1000) for year in range(1960, 2022)]

    rows = []
    # feature_codes = set(df['Indicator Code'].tolist())

    for _, row in tqdm(df.iterrows(), total=len(df), desc='Making rows', leave=False):
        #filter out rows that are not countries
        if row['Country Code'] not in country_codes:
            continue
        for year, timestamp in years:
            rows.append({
                'timestamp': timestamp,
                'country': row['Country Name'],
                'admin1': None,
                'admin2': None,
                'admin3': None,
                'lat': None,
                'lng': None,
                'feature': row['Indicator Code'], #Indicator Name will go in the description
                'value': row[year]
            })

    df = pd.DataFrame(rows)

    return df

def optimize_df_types(df: pd.DataFrame):
    """
    Pandas will upcast essentially everything. This will use the built-in
    Pandas function to_numeeric to downcast dataframe series to types that use
    less memory e.g. float64 to float32.
    For very large dataframes the memory reduction should translate into
    increased efficieny.
    """
    floats = df.select_dtypes(include=['float64']).columns.tolist()
    df[floats] = df[floats].apply(pd.to_numeric, downcast='float')

    ints = df.select_dtypes(include=['int64']).columns.tolist()
    df[ints] = df[ints].apply(pd.to_numeric, downcast='integer')

    # for col in df.select_dtypes(include=['object']):
    #    num_unique_values = len(df[col].unique())
    #    num_total_values = len(df[col])
    #    if float(num_unique_values) / num_total_values < 0.5:
    #        df[col] = df[col].astype('category')

    return

def save_parquet(df,name, id):
    # DATASET_STORAGE_BASE_URL="s3://jataware-world-modelers-dev/datasets/wdi/"
    filename=f'{name}.parquet.gzip'
    # dest_path = os.path.join(DATASET_STORAGE_BASE_URL, id, filename)
    # location_info = urlparse(dest_path)

    # optimize data types for storage
    optimize_df_types(df)
    # save a parquet file
    df.to_parquet(f"output/{filename}", compression="gzip")

    # send to s3
    # s3.put_object(Bucket=location_info.netloc, Key=output_path, Body=fileobj)


def make_metadata(df, series_info, name, description):
    # get the min and max timestamps
    min_timestamp = df['timestamp'].min()
    max_timestamp = df['timestamp'].max()
    id = str(uuid4())

    features = df['feature'].unique().tolist()
    countries = df['country'].unique().tolist()

    # create a map from the feature name to the row in series_info['Indicator Name'] == feature name
    feature_map = {feature: dict(series_info[series_info['Series Code'] == feature].iloc[0]) for feature in features}

    def get_description(info: dict) -> str:
        ret = info.get('Long definition', None)
        if pd.isnull(ret):
            ret = info.get('Short definition', None)
        if pd.isnull(ret):
            ret = info.get('Indicator Name')
        if pd.isnull(ret):
            ret = ''
        return ret

    def get_unit(info) -> str:
        unit = None
        try:
            # sometimes units are at the end of the indicator name (e.g. 'GDP (current US$)')
            name: str = info['Indicator Name']
            if name.endswith(')'):
                unit = name[name.rfind('(') + 1:-1]
        except:
            unit = None
        if unit is None:
            unit = info.get('Unit of measure', None)
        if pd.isnull(unit):
            unit = 'NA'
        return unit

    def get_unit_description(info) -> str:
        return get_unit(info)  # no other source of info for this

    meta = {
        "id": id,
        "name": name,
        "family_name": None,
        "description": description,
        "created_at": datetime.now(timezone.utc).timestamp() * 1000,
        "category": None,
        "domains": ["Economic Sciences"],
        "maintainer": {
            "name": "David Samson",
            "email": "david@jataware.com",
            "organization": "Jataware",
            "website": "http://databank.worldbank.org/data/download/WDI_csv.zip"
        },
        "data_paths": None,
        "outputs": [
            {
                "name": feature,
                "display_name": info['Indicator Name'],
                "description": get_description(info),
                "type": "float",  # TODO: maybe check the datatype in df?
                "unit": get_unit(info),
                "unit_description": get_unit_description(info),
                "ontologies": {
                    "concepts": [],
                    "processes": [],
                    "properties": []
                },
                "is_primary": True,
                "data_resolution": {
                    "temporal_resolution": "annual",
                    "spatial_resolution": [
                        0,
                        0
                    ]
                },
                "alias": {}
            } for feature, info in feature_map.items()
        ],
        "qualifier_outputs": [
            {
                "name": "timestamp",
                "display_name": "timestamp",
                "description": "timestamp",
                "type": "datetime",
                "unit": "ms",
                "unit_description": "milliseconds since January 1, 1970",
                "ontologies": {
                    "concepts": [],
                    "processes": [],
                    "properties": []
                },
                "related_features": []
            },
            {
                "name": "country",
                "display_name": "country",
                "description": "country",
                "type": "country",
                "unit": None,
                "unit_description": None,
                "ontologies": {
                    "concepts": [],
                    "processes": [],
                    "properties": []
                },
                "related_features": []
            }
        ],
        "tags": [],
        "geography": {
            "country": countries,
            "admin1": [],
            "admin2": [],
            "admin3": []
        },
        "period": {
            "gte": min_timestamp,
            "lte": max_timestamp
        },
        "deprecated": False,
        "data_sensitivity": "",
        "data_quality": ""
    }

    return meta


code_abbreviations = {
    'EG': '',
    'FX': '',
    'SE': '',
    'PRM': '',
    'NY': '',
    'SP': '',
    'SEC': '',
    'SH': '',
    'HIV': '',
    'AG': '',
    'EN': '',
    'TX': '',
    'TM': '',
    'NV': '',
    'IS': '',
    'ER': '',
    'SI': '',
    'STA': '',
    'MS': '',
    'FB': '',
    'IC': '',
    'SL': '',
    'TLF': '',
    'FD': '',
    'VC': '',
    'FM': '',
    'DTH': '',
    'GC': '',
    'NE': '',
    'BM': '',
    'BX': '',
    'AGR': '',
    'MNF': '',
    'SRV': '',
    'SLF': '',
    'FAM': '',
    'WAG': '',
    'MLR': '',
    'FS': '',
    'DT': '',
    'MED': '',
    'COM': '',
    'CON': '',
    'FP': '',
    'SN': '',
    'IQ': '',
    'BN': '',
    'XPD': '',
    'PA': '',
    'FPL': '',
    'FR': '',
    'TER': '',
    'EMP': '',
    'IND': '',
    'IT': '',
    'GDP': '',
    'HD': '',
    'IMM': '',
    'TBS': '',
    'UHC': '',
    'IP': '',
    'SM': '',
    'ST': '',
    'IE': '',
    'LP': '',
    'MMR': '',
    'CM': '',
    'ADT': '',
    'TG': '',
    'DYN': '',
    'TT': '',
    'DC': '',
    'VAC': '',
    'SGR': '',
    'H2O': '',
    'PRE': '',
    'ANM': '',
    'PRG': '',
    'PRV': '',
    'SVR': '',
    'GF': '',
    'SG': '',
    'EP': '',
    'PX': '',
    'GB': '',
    'ENR': '',
    'UEM': '',
    'ALC': '',
    'FI': '',
    'BG': '',
}


def save_meta_es(meta,name):
    # open json and validate
    meta_check=pydantic.parse_file_as(path=f'/api/output/{name}_meta.json', type_=IndicatorMetadataSchema)
    meta['created_at'] = current_milli_time()
    resp = es.index(index="indicators", body=meta, id=meta.get("id"))
    print(resp)

import boto3


def upload_files_to_s3(id, name):
    for file_type in ['csv','parquet.gzip']:
        with open(f'/api/output/{name}.{file_type}',"rb") as f:
            s3.upload_fileobj(f, f"{S3_BUCKET}", f"wbi/{id}/{id}.{file_type}")

