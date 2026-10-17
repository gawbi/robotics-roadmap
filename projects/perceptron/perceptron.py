"""Perceptron. numpy 없이 list 와 for 문만으로 짠다.

data 는 (x, y) 의 list 다. x 는 [x1, x2] 같은 float list 이고 y 는 0 또는 1 이다.
"""

from __future__ import annotations


def predict(w: list[float], b: float, x: list[float]) -> int:
    """ŷ = 1[w·x + b > 0]

    w·x 는 내적 w_1 x_1 + w_2 x_2 + ... 이다. w·x + b 가 0 보다 크면 1, 0 이하면 0 을 돌려준다.

    예: w = [1, 1], b = -1.5
        x = [1, 1] → 1 + 1 - 1.5 = 0.5  → 1
        x = [1, 0] → 1 + 0 - 1.5 = -0.5 → 0
    """
    raise NotImplementedError


def train_epoch(
    w: list[float], b: float, data: list[tuple[list[float], int]], lr: float
) -> tuple[list[float], float, int]:
    """data 를 주어진 순서대로 한 번 돌며 sample 마다 weight 를 고친다.

    sample (x, y) 하나마다
        ŷ   = predict(w, b, x)
        w_i ← w_i + η (y - ŷ) x_i    (모든 i)
        b   ← b   + η (y - ŷ)
    η 는 lr 이다. 맞힌 sample 은 y - ŷ = 0 이라 아무것도 바뀌지 않는다.

    returns (w, b, 이번 epoch 에서 틀린 sample 수). 틀렸는지는 고치기 전의 ŷ 로 센다.

    예: w = [0, 0], b = 0, lr = 0.1, AND 진리표를 (0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1 순서로
        앞의 세 점은 w·x + b = 0 이라 ŷ = 0 으로 맞힌다
        (1,1) 은 ŷ = 0, y = 1 이라 w = [0.1, 0.1], b = 0.1 로 고친다
        → ([0.1, 0.1], 0.1, 1)
    """
    raise NotImplementedError


def train(
    data: list[tuple[list[float], int]], lr: float = 0.1, max_epochs: int = 100
) -> tuple[list[float], float, int | None]:
    """w 를 0 vector, b 를 0 으로 두고 train_epoch 를 반복한다.

    한 epoch 동안 틀린 수가 0 이면 거기서 멈추고 그 epoch 번호(1 부터 센다)를 돌려준다.
    max_epochs 번 돌아도 0 이 되지 않으면 converged_epoch 는 None 이다.

    returns (w, b, converged_epoch)
    """
    raise NotImplementedError
