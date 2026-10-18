"""같은 샘플 수에서 DAgger policy 와 expert 시연만으로 학습한 BC 의 이탈률을 비교한다.

expert 데이터 수집과 BC 학습·이탈률 측정은 behavior-cloning 과제의 collect_demos.py·train_bc.py·lane_eval.py 를 import 해서
쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "behavior-cloning"))
from collect_demos import collect  # behavior-cloning 과제의 코드
from lane_eval import departure_rate  # behavior-cloning 과제의 코드
from train_bc import train_bc  # behavior-cloning 과제의 코드


def expert_only_bc(n_samples: int, seed: int) -> float:
    """train BC on n_samples expert-only samples and return its departure rate."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
