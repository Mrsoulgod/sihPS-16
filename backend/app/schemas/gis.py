import uuid
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class GeoJsonFeature(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJsonFeatureCollection(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: str = "FeatureCollection"
    features: List[GeoJsonFeature]
    metadata: Dict[str, Any]
