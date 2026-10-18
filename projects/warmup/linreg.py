"""y = 3x + 2 + noise 데이터에 직선을 gradient descent 로 맞춘다. for 문 대신 NumPy 배열 연산으로 짠다."""

from __future__ import annotations

import numpy as np


def make_data(n: int = 100, seed: int = 0) -> tuple[np.ndarray, np.ndarray]:
    """x ~ U(0, 10), y = 3x + 2 + N(0, 1). both shape (n,)."""
    raise NotImplementedError


def predict(w: float, b: float, x: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def mse(w: float, b: float, x: np.ndarray, y: np.ndarray) -> float:
    raise NotImplementedError


def grad(w: float, b: float, x: np.ndarray, y: np.ndarray) -> tuple[float, float]:
    """returns (dL/dw, dL/db)."""
    raise NotImplementedError


def numerical_grad(w: float, b: float, x: np.ndarray, y: np.ndarray, h: float = 1e-5
                   ) -> tuple[float, float]:
    raise NotImplementedError


def fit(x: np.ndarray, y: np.ndarray, lr: float = 0.01, steps: int = 5000
        ) -> tuple[float, float, list[float]]:
    """returns (w, b, loss_history)."""
    raise NotImplementedError
