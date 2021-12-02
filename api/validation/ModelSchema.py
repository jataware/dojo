# generated by datamodel-codegen:
#   filename:  model.schema.json
#   timestamp: 2021-07-20T16:47:45+00:00

from __future__ import annotations

from copy import deepcopy
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Extra, Field


class Id(BaseModel):
    __root__: str = Field(
        ...,
        description="A unique model run id",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Run ID",
    )


class Parameter1(BaseModel):
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


class Type(Enum):
    int = "int"
    float = "float"
    str = "str"
    boolean = "boolean"
    lat = "lat"
    lng = "lng"
    date = "date"
    daterange = "daterange"
    datetime = "datetime"
    geo = "geo"


class DataType(Enum):
    nominal = "nominal"
    ordinal = "ordinal"
    numerical = "numerical"
    freeform = "freeform"


class Type1(Enum):
    int = "int"
    float = "float"
    str = "str"
    boolean = "boolean"
    datetime = "datetime"
    lat = "lat"
    lng = "lng"
    country = "country"
    admin1 = "admin1"
    admin2 = "admin2"
    admin3 = "admin3"


class Type2(Enum):
    int = "int"
    float = "float"
    str = "str"
    boolean = "boolean"
    datetime = "datetime"
    lat = "lat"
    lng = "lng"
    country = "country"
    admin1 = "admin1"
    admin2 = "admin2"
    admin3 = "admin3"


class Maintainer(BaseModel):
    class Config:
        extra = Extra.allow

    name: str = Field(
        ...,
        description="The full name of the model maintainer",
        examples=["Bob Fakename"],
        title="Model Maintainer Name",
    )
    email: str = Field(
        ...,
        description="Email address of the model maintainer",
        examples=["bob@fake.org"],
        title="Model Maintainer Email Address",
    )
    organization: Optional[str] = Field(
        None,
        description="Maintainer Organization",
        examples=["University of Fakeland"],
        title="Model Maintainer Organization",
    )
    website: Optional[str] = Field(
        None,
        description="Model maintainer website",
        examples=["http://www.fake.org/"],
        title="Model Maintainer Website",
    )


class Geography(BaseModel):
    class Config:
        extra = Extra.allow

    country: Optional[List[str]] = Field(
        None,
        description="List of countries covered by the model",
        examples=[["Ethiopia", "South Sudan"]],
        title="Countries",
    )
    admin1: Optional[List[str]] = Field(
        None,
        description="List of admin level 1 regions covered by the model",
        examples=[["Oromia", "Sidama", "Amhara"]],
        title="Admin Level 1",
    )
    admin2: Optional[List[str]] = Field(
        None,
        description="List of admin level 2 regions covered by the model",
        examples=[["West Gojjam", "East Gojjam", "Agew Awi", "Arsi", "Bale", "Borana"]],
        title="Admin Level 2",
    )
    admin3: Optional[List[str]] = Field(
        None,
        description="List of admin level 3 regions covered by the model",
        examples=[["Aminyaa", "Askoo", "Coole", "Galaanaa", "Qarsaa", "Qarcaa"]],
        title="Admin Level 3",
    )


class Period(BaseModel):
    class Config:
        extra = Extra.allow

    gte: Optional[int] = Field(
        None,
        description="Start Time (inclusive)",
        examples=[1234567890000],
        title="Start Time",
    )
    lte: Optional[int] = Field(
        None,
        description="End Time (inclusive)",
        examples=[1234567890000],
        title="End Time",
    )


class ConceptMatch(BaseModel):
    name: Optional[str] = Field(
        None,
        description="The name of the concept component in the ontology",
        examples=["wm/concept/humanitarian_assistance/food_aid"],
        title="Concept Component Name",
    )
    score: Optional[float] = Field(
        None,
        description="A score between 0 and 1 representing the strength of the match",
        examples=[0.785829484462738],
        title="Match Score",
    )


class TemporalResolution(Enum):
    annual = "annual"
    monthly = "monthly"
    dekad = "dekad"
    weekly = "weekly"
    daily = "daily"
    other = "other"


class Resolution(BaseModel):
    temporal_resolution: Optional[TemporalResolution] = Field(
        None,
        description="Temporal resolution of the output",
        title="Temporal Resolution",
    )
    spatial_resolution: Optional[List[float]] = Field(
        None,
        description="Spatial resolution of the output (in meters)",
        examples=[[20, 20]],
        max_items=2,
        min_items=2,
        title="Spatial Resolution",
    )


class OntologyComponents(BaseModel):
    concepts: List[ConceptMatch] = Field(
        ...,
        description="A list of concepts matched for this variable",
        title="Matched concepts",
    )
    processes: List[ConceptMatch] = Field(
        ...,
        description="A list of processes matched for this variable",
        title="Matched Processes",
    )
    properties: List[ConceptMatch] = Field(
        ...,
        description="A list of properties matched for this variable",
        title="Matched Properties",
    )


class Parameter(BaseModel):
    class Config:
        extra = Extra.allow

    name: str = Field(
        ...,
        description="The name of the parameter",
        examples=["management_practice"],
        title="Parameter Name",
    )
    display_name: str = Field(
        ...,
        description="The user visible name of the parameter",
        examples=["Management Practice"],
        title="Parameter Display Name",
    )
    description: str = Field(
        ...,
        description="The description of the parameter",
        examples=[
            "The management practice to model. rf_highN corresponds to a high nitrogen management  practice. irrig corresponds to a high nitrogen, irrigated management practice. rf_0N  corresponds to a subsistence management practice. rf_lowN corresponds to a low nitrogen  managemet practice."
        ],
        title="Parameter Description",
    )
    type: Type = Field(..., description="The type of parameter", title="Parameter Type")
    unit: Optional[str] = Field(
        None,
        description="The unit of the parameter value",
        examples=["degC"],
        title="Unit",
    )
    unit_description: Optional[str] = Field(
        None,
        description="A short description of the unit",
        examples=["degrees Celcius"],
        title="Unit Description",
    )
    ontologies: Optional[OntologyComponents] = Field(
        None,
        description="The three ontological parts representing the concepts matched to this varible",
        title="Ontology Components",
    )
    is_drilldown: Optional[bool] = Field(
        None,
        description="Does this variable represent a drilldown",
        examples=[True],
        title="Is Drilldown?",
    )
    additional_options: Optional[Dict[str, Any]] = Field(
        None, description="Model specific extras", title="Additional Options"
    )
    data_type: DataType = Field(
        ...,
        description="Describes whether the data values will be categorical, ordered, or numerical",
        title="Data Value Type",
    )
    default: Any = Field(
        ...,
        description="The default value of the parameter",
        examples=["irrig", 5, [44, 32]],
        title="Default Parameter Value",
    )
    choices: Optional[List[str]] = Field(
        None,
        description="If the parameter is a string type, then enumerate the choices for that parameter",
        examples=[["irrig", "rf_highN"]],
        title="Parameter Choices",
    )
    min: Optional[float] = Field(
        None,
        description="If the parameter is a numeric type, state the inclusive min of parameter values",
        examples=[5],
        title="Parameter Min",
    )
    max: Optional[float] = Field(
        None,
        description="If the parameter is a numeric type, state the inclusive max of parameter values",
        examples=[10],
        title="Parameter Max",
    )


class Output(BaseModel):
    class Config:
        extra = Extra.allow

    name: str = Field(
        ...,
        description="The name of the output variable",
        examples=["management_practice"],
        title="Output variable Name",
    )
    display_name: str = Field(
        ...,
        description="The user visible name of the output variable",
        examples=["Management Practice"],
        title="Output variable Display Name",
    )
    description: str = Field(
        ...,
        description="The description of the output variable",
        examples=[
            "The management practice to model. rf_highN corresponds to a high nitrogen management  practice. irrig corresponds to a high nitrogen, irrigated management practice. rf_0N  corresponds to a subsistence management practice. rf_lowN corresponds to a low nitrogen  managemet practice."
        ],
        title="Output variable Description",
    )
    type: Type1 = Field(
        ..., description="The type of output variable", title="Output variable Type"
    )
    unit: Optional[str] = Field(
        None,
        description="The unit of the output variable",
        examples=["degC"],
        title="Unit",
    )
    unit_description: Optional[str] = Field(
        None,
        description="A short description of the unit",
        examples=["degrees Celcius"],
        title="Unit Description",
    )
    ontologies: OntologyComponents = Field(
        ...,
        description="The three ontological parts representing the concepts matched to this varible",
        title="Ontology Components",
    )
    is_primary: bool = Field(
        ...,
        description="Does this variable represent data based on the primary time and location columns",
        examples=[True],
        title="Is Primary?",
    )
    additional_options: Optional[Dict[str, Any]] = Field(
        None, description="Model specific extras", title="Additional Options"
    )
    data_resolution: Optional[Resolution] = Field(
        None,
        description="Spatial and temporal resolution of the data",
        title="Data Resolution",
    )
    choices: Optional[List[str]] = Field(
        None,
        description="If the output variable is a string type, then enumerate the choices for that output variable",
        examples=[["irrig", "rf_highN"]],
        title="Output variable choices",
    )
    min: Optional[float] = Field(
        None,
        description="Inclusive min of output values",
        examples=[5],
        title="Output variable Min",
    )
    max: Optional[float] = Field(
        None,
        description="Inclusive max of output values",
        examples=[10],
        title="Output variable Max",
    )


class QualifierOutput(BaseModel):
    class Config:
        extra = Extra.allow

    name: str = Field(
        ...,
        description="The name of the output qualifier column in data file",
        examples=["service_type"],
        title="Output Qualifier Column Name",
    )
    display_name: str = Field(
        ...,
        description="The user visible name of the output qualifier",
        examples=["Type of money service"],
        title="Output Qualifier Display Name",
    )
    description: str = Field(
        ...,
        description="The description of the output qualifier",
        examples=["Type of money service used"],
        title="Output Qualifier Description",
    )
    type: Type2 = Field(
        ...,
        description="The type of the output qualifier",
        title="Output Qualifier Type",
    )
    unit: Optional[str] = Field(
        None,
        description="The unit of the output qualifier",
        examples=["unitless"],
        title="Unit",
    )
    unit_description: Optional[str] = Field(
        None,
        description="A short description of the unit",
        examples=[""],
        title="Unit Description",
    )
    ontologies: OntologyComponents = Field(
        ...,
        description="The three ontological parts representing the concepts matched to this output",
        title="Ontology Components",
    )
    related_features: List[str] = Field(
        ...,
        description="The feature names that this data should be used as a qualifier for",
        title="Related Features",
    )


class ModelMetadataSchema(BaseModel):
    class Config:
        extra = Extra.allow

    id: str = Field(
        ...,
        description="A unique model id",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Model ID",
    )
    name: str = Field(
        ..., description="The model name", examples=["DSSAT-PYTHIA"], title="Model Name"
    )
    family_name: str = Field(
        ...,
        description="The model family name",
        examples=["DSSAT"],
        title="Model Family Name",
    )
    description: str = Field(
        ...,
        description="The description of the model.",
        examples=[
            "The Decision Support System for Agrotechnology Transfer (DSSAT) comprises dynamic crop growth simulation model for over 40 crops. The model simulates growth development; and yield as a function of the soil-plant-atmosphere dynamics."
        ],
        title="Model Description",
    )
    created_at: Optional[int] = Field(
        None,
        description="When the model was registered",
        examples=[1234567890000],
        title="Model Registration Time",
    )
    category: List[str] = Field(
        ...,
        description="List of categories",
        examples=[["Economic", "Agricultural"]],
        title="Categories",
    )
    maintainer: Maintainer = Field(
        ...,
        description="Information about the model maintainer.",
        title="Model Maintainer",
    )
    image: str = Field(
        ...,
        description="The name and tag of the model container image (on Dockerhub, etc.)",
        examples=["DSSAT:latest"],
        title="Container Image",
    )
    observed_data: Optional[List[Id]] = Field(
        None,
        description="A list of Cube IDs that represent observed data for this model",
        title="Observed Data",
    )
    is_stochastic: Optional[bool] = Field(
        False, description="Is the model stochastic", title="Is the model stochastic"
    )
    parameters: List[Parameter] = Field(
        ...,
        description="The parameters exposed for the model",
        title="Model Parameters",
    )
    outputs: List[Output] = Field(
        ..., description="An array of model outputs", title="Model Outputs"
    )
    qualifier_outputs: Optional[List[QualifierOutput]] = Field(
        None,
        description="An array describing the additional qualifier columns in the output data files",
        title="Model Qualifier Outputs",
    )
    tags: Optional[List[str]] = Field(
        None,
        description="The tags associated with the model.",
        examples=[["Agriculture"]],
        title="Model Tags",
    )
    geography: Optional[Geography] = Field(
        None,
        description="Information about the geography covered by the model",
        title="Geography",
    )
    period: Optional[Period] = Field(
        None, description="Data ranges covered by the run", title="Run time period"
    )

    next_version: Optional[str] = Field(
        None, description="UUID of the next version", title="next model version"
    )

    prev_version: Optional[str] = Field(
        None, description="UUID of the pervious version", title="previous model version"
    )


class ModelMetadataPatchSchema(BaseModel):
    # This class is used for patching the ModelMetadataPatchSchema using the logic below.
    # It sets all of the fields to be optional.
    # This methodology allows us to use FastAPI/Pydantics validation on any provided fields, without having to redefine
    # all of the fields
    ...


# Dynamically set the fields to be patched based on the ModelMetadataSchema class definitions
for field_name, field_def in ModelMetadataSchema.__fields__.items():
    # Don't allow editing of the model id, models should be versioned
    if field_name in ('id',):
        continue
    # Copy all other fields over, setting them to be optional
    new_field = deepcopy(field_def)
    new_field.required = False
    ModelMetadataPatchSchema.__fields__[field_name] = new_field


class VersionSchema(BaseModel):
    class Config:
        extra = Extra.allow

    current_version: str = Field(
        ...,
        description="A unique model id",
        examples=["123e4567-e89b-12d3-a456-426614174000"],
        title="Model ID",
    )
    prev_versions: List[str] = Field(
        ...,
        description="Model IDs for all previous versions, in order from from oldest to news",
        examples=[["01234567-e89b-12d3-a456-426614174000", "edcba567-e89b-12d3-a456-426614174000"]],
        title="Previous versions",
    )
    later_versions: List[str] = Field(
        ...,
        description="Model IDs for all later versions, in order from from oldest to news",
        examples=[["01234567-e89b-12d3-a456-426614174000", "edcba567-e89b-12d3-a456-426614174000"]],
        title="Later versions",
    )

