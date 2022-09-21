from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse
import json

from keycloak import KeycloakOpenID
from elasticsearch import Elasticsearch
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
from fastapi.responses import JSONResponse

from validation import IndicatorSchema, DojoSchema, MetadataSchema
from src.settings import settings


from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class AuthRequest(BaseModel):
    auth_code: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


# logger: Logger = logging.getLogger(__name__)
router = APIRouter()

# TODO: Move config to env variables, especially client secret key
keycloak = KeycloakOpenID(server_url="http://keycloak:8080/",
                                 client_id="causemos",
                                 realm_name="Uncharted",
                                 client_secret_key="jtbQhs6SlfynqJaygVpwav2kLzAme2b4")


def check_auth(access_token):
    valid = False
    try:
        logger.info(access_token)
        user_info = keycloak.userinfo(access_token)
        user_info("Checking access token")
        if user_info:
            return True
    except Exception as err:
        logger.error(err)
    
    if not valid:
        raise HTTPException(status_code=401)
    return True


@router.post("/auth/status")
async def auth(response: Response, payload: AuthRequest) -> str:
    logger.info(payload)

    redirect_uri="http://localhost:8080/auth"
    auth_code = payload.auth_code
    if payload.access_token:
        logger.info("Checking access token")
        try:
            # logger.info(f'access token "{payload.access_token}"')
            user_info = keycloak.userinfo(payload.access_token)
            # user_info("Checking access token")
            if user_info:
                return {
                    "authenticated": True,
                    "auth_url": None,
                    "user": user_info['email'],
                    "access_token": payload.access_token,
                    "refresh_token": payload.refresh_token,
                }
        except Exception as err:
            logger.error(err)

    if payload.refresh_token:
        try:
            logger.info(payload.refresh_token)
            token = keycloak.refresh_token(payload.refresh_token)
            logger.info(token)
        except Exception as err:
            logger.error(err)

    if not auth_code:
        auth_url = keycloak.auth_url(
            redirect_uri=redirect_uri,
            scope="email",
            state=uuid.uuid4()
        )
        logger.info(auth_url)
        return {
            "authenticated": False,
            "auth_url": auth_url,
            "user": None
        }

    token = keycloak.token(
        grant_type=["authorization_code"],
        code=auth_code,
        redirect_uri=redirect_uri,
    )
    logger.info(token)
    access_token = token["access_token"]
    refresh_token = token.get("refresh_token"),
    user_info = keycloak.userinfo(access_token)
    logger.info(f'access token  ORIG: "{access_token}"')
    response.set_cookie(key="access-token", value=access_token, secure=False, httponly=False)
    response.set_cookie(key="refresh-token", value=refresh_token, secure=False, httponly=False)
    logger.info(user_info)
    return {
        "authenticated": True,
        "auth_url": None,
        "user": user_info['email'],
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
