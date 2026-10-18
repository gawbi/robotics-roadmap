"""고정 카메라와 wrist_cam 영상을 렌더링해 30 fps mp4 로 저장한다."""

from __future__ import annotations

import mujoco
import numpy as np


def render_cameras(renderer: mujoco.Renderer, data: mujoco.MjData,
                   cameras: list[str]) -> dict[str, np.ndarray]:
    """returns {camera name: (H, W, 3) uint8 image}."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
