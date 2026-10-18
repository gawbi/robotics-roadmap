"""URDF 의 link·joint 를 읽어 parent → child tree 를 만든다. XML 은 xml.etree.ElementTree 로 읽고,
origin 의 rpy 는 transforms 과제의 so3.rpy_to_matrix 로 rotation matrix 로 바꾼다."""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "transforms"))
from so3 import rpy_to_matrix  # transforms 과제의 코드


@dataclass
class Joint:
    name: str
    type: str                  # "revolute" | "continuous" | "prismatic" | "fixed"
    parent: str                # parent link name
    child: str                 # child link name
    origin: np.ndarray         # (4, 4) parent link frame -> joint frame
    axis: np.ndarray           # (3,) unit axis in the joint frame
    lower: float | None = None
    upper: float | None = None


@dataclass
class Robot:
    root: str
    joints: dict[str, Joint]
    children: dict[str, list[str]] = field(default_factory=dict)  # link -> child joint names


def parse_urdf(path: str) -> Robot:
    raise NotImplementedError
