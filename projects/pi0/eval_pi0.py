"""LIBERO suite 의 10 task × 10 episode 성공률과 chunk 당 추론 시간을 잰다. LIBERO 는 Linux 에서만 돈다.

episode 루프는 vla-tokens 과제의 evaluate_suite 를 쓴다. 이 파일에는 관측 dict 에서 이미지 목록과 state 를 꺼내
Pi0Lite.select_action 을 부르고 numpy 로 바꾸는 policy_fn, Pi0Lite.reset 을 부르는 reset_fn, chunk 를 새로 생성할 때마다 걸린
시간을 재는 코드를 짠다.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "vla-tokens"))
from eval_libero import evaluate_suite  # vla-tokens 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
