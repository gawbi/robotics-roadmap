"""lerobot/aloha_sim_transfer_cube_human 으로 StyleEncoder 와 ACTPolicy 를 L1 + β·KL 로 학습하고, L1 과 KL 을 따로 기록한다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "vae"))
from vae import reparameterize  # vae 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
