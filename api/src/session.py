import json
from redis import Redis
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from fastapi.logger import logger
from fastapi_sessions.backends.session_backend import SessionBackend, SessionModel
from fastapi_sessions.frontends.session_frontend import ID

from src.settings import settings


class SessionData(BaseModel):
    userid: str
    access_token: str
    refresh_token: str


class RedisSessionBackend(SessionBackend[ID, SessionModel]):

    def __init__(self) -> None:
        self.redis = Redis(
            settings.REDIS_HOST, settings.REDIS_PORT
        )

    @staticmethod
    def redis_key(session_id):
        return f"dojo:auth:{session_id}"

    def create(self, session_id: ID, data: SessionModel) -> None:
        """Create a new session."""
        self.redis.set(self.redis_key(session_id), data.json())

    def read(self, session_id: ID) -> Optional[SessionModel]:
        """Read session data from the storage."""
        cache_resp = self.redis.get(self.redis_key(session_id))
        if cache_resp:
            return SessionData(**json.loads(cache_resp))
        else:
            return None

    def update(self, session_id: ID, data: SessionModel) -> None:
        """Update session data to the storage"""
        key = self.redis_key(session_id)
        if self.redis.exists(key):
            self.redis.set(key, data.json())

    def delete(self, session_id: ID) -> None:
        """Remove session data from the storage."""
        key = self.redis_key(session_id)
        if self.redis.exists(key):
            self.redis.delete(key)


session_backend = RedisSessionBackend[UUID, SessionData]()