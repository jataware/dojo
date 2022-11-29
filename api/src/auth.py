from __future__ import annotations

import uuid
from typing import Optional, Tuple

from keycloak.exceptions import KeycloakError
from fastapi import (APIRouter, Response, Request,)
from fastapi.logger import logger
from pydantic import BaseModel

from src.keycloak import keycloak, keycloakAdmin
from src.session import SessionData, session_backend
from src.settings import settings


class AuthRequest(BaseModel):
    session_id: Optional[str] = None
    auth_code: Optional[str] = None


router = APIRouter()

def check_session(request: Request) -> Tuple[bool, Optional[SessionData]]:
    session_id = request.cookies.get(settings.SESSION_COOKIE_NAME, None)
    if not session_id:
        return False, None

    session_data = session_backend.read(session_id)
    if not session_data:
        return False, None
    access_token = session_data.access_token
    refresh_token = session_data.refresh_token

    try:
        # Validate token. Is there a lighter 
        keycloak.userinfo(access_token)
    except KeycloakError as auth_error:
        try:
            logger.info("Access token expired, checking refresh token.")
            token_info = keycloak.refresh_token(refresh_token)
            new_session_data = SessionData(
                userid=session_data.userid,
                access_token=token_info['access_token'],
                refresh_token=token_info['refresh_token'],
            )
            session_backend.update(session_id, new_session_data)
            return True, new_session_data
        except KeycloakError:
            logger.info("Access and refresh tokens are expired, need to log in.")
            return False, None
    return True, session_data

def find_user_roles(user_info):
    # create empty overwriteable roles list
    roles = []

    # select out all the dojo: prefixed roles from the roles in the user's access token
    roles = [role for role in user_info['realm_access']['roles'] if role.startswith('dojo:')]

    # if they have the admin role
    if 'admin' in user_info['realm_access']['roles']:
        # fetch all the roles from across the entire realm (ie not just the ones the user has)
        realm_roles = keycloakAdmin.get_realm_roles(True)
        # select out all the dojo: prefixed roles from across the realm and replace the user's ones with these
        roles = [realm_role['name'] for realm_role in realm_roles if realm_role['name'].startswith('dojo:')]

    return roles


@router.post("/auth/status")
async def auth(request: Request, response: Response, payload: AuthRequest) -> str:

    wellKnown = keycloak.well_known()

    is_session_valid, session_data = check_session(request)
    session_id = request.cookies.get(settings.SESSION_COOKIE_NAME, None)

    if is_session_valid:
        user_info = keycloak.userinfo(session_data.access_token)

        roles = find_user_roles(user_info)

        return {
            "authenticated": True,
            "auth_url": None,
            "keycloak_url": wellKnown['issuer'],
            "user": user_info,
            "dojo_roles": roles,
        }

    redirect_uri="http://localhost:8080/auth"
    auth_code = payload.auth_code
    if not auth_code:
        auth_url = keycloak.auth_url(
            redirect_uri=redirect_uri,
            scope="email",
            state=uuid.uuid4()
        )
        return {
            "authenticated": False,
            "auth_url": auth_url,
            "keycloak_url": wellKnown['issuer'],
            "user": None,
            "dojo_roles": None,
        }

    token = keycloak.token(
        grant_type=["authorization_code"],
        code=auth_code,
        redirect_uri=redirect_uri,
    )
    access_token = token["access_token"]
    refresh_token = token["refresh_token"]
    user_info = keycloak.userinfo(access_token)
    session_id = uuid.uuid4()
    roles = find_user_roles(user_info)

    session_data = SessionData(
        userid=user_info['email'],
        access_token=access_token,
        refresh_token=refresh_token,
    )

    logger.info(f"Creating new session for user {session_data.userid}")
    session_backend.create(session_id, session_data)
    response.set_cookie(key=settings.SESSION_COOKIE_NAME, value=session_id, secure=False, httponly=False)

    return {
        "authenticated": True,
        "auth_url": None,
        "keycloak_url": wellKnown['issuer'],
        "user": user_info['email'],
        "dojo_roles": roles,
    }


@router.post("/auth/logout")
async def logout(request: Request, response: Response) -> str:

    is_session_valid, session_data = check_session(request)
    session_id = request.cookies.get(settings.SESSION_COOKIE_NAME, None)

    if not is_session_valid:
        return True

    try:
        keycloak.logout(session_data.refresh_token)
        session_backend.delete(session_id)
        return True
    except:
        return False
