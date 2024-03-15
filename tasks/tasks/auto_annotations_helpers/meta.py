from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class Meta:
    path: Path
    name: str
    description: str