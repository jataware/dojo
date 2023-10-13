from pydantic import BaseModel, Extra, Json
from typing import Dict, Any

class DataModeling(BaseModel):
    data: Dict[str, Any]

    class Config:
        extra = Extra.allow