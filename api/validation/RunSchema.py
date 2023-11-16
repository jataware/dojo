# generated by datamodel-codegen:
#   filename:  model-run.schema.json
#   timestamp: 2021-07-20T16:47:44+00:00

from __future__ import annotations

from typing import List, Optional, Union
from enum import Enum
from pydantic import BaseModel, Extra, Field
from pydantic.utils import Obj


class Parameter(BaseModel):
    class Config:
        extra = Extra.allow

    name: str = Field(
        ...,
        description="The name of the parameter",
        examples=["management_practice"],
        title="Parameter Name",
    )
    value: Union[str, float, bool] = Field(
        ...,
        description="Set value of parameter during run",
        examples=["irrig"],
        title="Parameter Value",
    )


class ModelRunSchema(BaseModel):
    class Config:
        extra = Extra.allow

    id: str = Field(
        ...,
        description="A unique model run id",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Run ID",
    )
    model_name: str = Field(
        ..., description="The model name", examples=["DSSAT"], title="Model Name"
    )
    model_id: str = Field(
        ...,
        description="The ID of the model that this run belongs to",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Model ID",
    )
    created_at: int = Field(
        ...,
        description="When the model run was started",
        examples=[1234567890000],
        title="Run Creation Time",
    )
    data_paths: List[str] = Field(
        ...,
        description="URL paths to output model run data",
        examples=[["runs/<run-id>/<cube-id-1>", "runs/<run-id>/<cube-id-2>"]],
        title="Data Path URLs",
    )
    #pre_gen_output_paths: Optional[List[str]] = Field(
    pre_gen_output_paths: Optional[List] = Field(
        None,
        description="List of dict {file:URL path} to pre-generated output",
        examples=[["runs/<run-id>/<cube-id-1>/pre-gen"]],
        title="Pre-generated Output Path URLs",
    )
    is_default_run: Optional[bool] = Field(
        False, description="Is this the default run of the model", title="Default Run?"
    )
    parameters: List[Parameter] = Field(
        ...,
        description="The parameters exposed for the model",
        title="Model Parameters",
    )
    tags: List[str] = Field(
        ...,
        description="The tags associated with the model run",
        examples=[["Agriculture"]],
        title="Model Run Tags",
    )

class RunLogsSchema(BaseModel):
    class Config:
        extra = Extra.allow

    id: str = Field(
        ...,
        description="A unique model run id",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Run ID",
    )
    tasks: List[Obj] = Field(
        ...,
        description="tasks",
        title="tasks",
    )


class RunStatusSchema(Enum):
    success = "success"
    running = "running"
    failed = "failed"
    queued = "queued"
    finished = "finished"
