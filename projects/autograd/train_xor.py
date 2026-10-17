"""XOR 네 점에 MLP 를 학습시킨다."""

from __future__ import annotations

from nn import MLP

XOR = [([0.0, 0.0], -1.0), ([0.0, 1.0], 1.0), ([1.0, 0.0], 1.0), ([1.0, 1.0], -1.0)]


def train_xor(hidden: int = 4, steps: int = 500, lr: float = 0.05, seed: int = 0) -> MLP:
    """MLP(2, [hidden, 1]) 을 만들어 XOR 에 steps 번 gradient descent 를 하고 돌려준다.

    step 하나는
        L = Σ_k (ŷ_k - y_k)²    네 점 k 의 squared error 합
        모든 grad 를 0 으로 되돌리고 L.backward()
        p ← p - η · ∂L/∂p       모든 parameter p 에 대해, η 는 lr
    seed 는 random.seed 로 넘겨 weight 초기값을 고정한다. 기본값은 네 점을 모두 맞히도록 직접 고른다.
    """
    raise NotImplementedError


if __name__ == "__main__":
    model = train_xor()
    # 네 점의 예측과 2D decision boundary 그림은 여기서 직접 짠다
