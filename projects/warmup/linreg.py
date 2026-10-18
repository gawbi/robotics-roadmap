"""y = 3x + 2 + noise 데이터에 직선을 gradient descent 로 맞춘다. for 문 대신 NumPy 배열 연산으로 짠다."""

from __future__ import annotations

import numpy as np


def make_data(n: int = 100, seed: int = 0) -> tuple[np.ndarray, np.ndarray]:
    """x ~ U(0, 10), y = 3x + 2 + N(0, 1). both shape (n,)."""
    rng = np.random.default_rng(seed)
    x = rng.uniform(0, 10, n)
    y = 3 * x + 2 + rng.normal(0, 1, n)
    return x, y


def predict(w: float, b: float, x: np.ndarray) -> np.ndarray:
    y = w * x + b
    return y


def mse(w: float, b: float, x: np.ndarray, y: np.ndarray) -> float:
    return float(np.mean((predict(w, b, x) - y) ** 2))


def grad(w: float, b: float, x: np.ndarray, y: np.ndarray) -> tuple[float, float]:
    """returns (dL/dw, dL/db)."""
    error = predict(w, b, x) - y
    dw = 2 * np.mean(error * x)
    db = 2 * np.mean(error)
    return float(dw), float(db)


def numerical_grad(w: float, b: float, x: np.ndarray, y: np.ndarray, h: float = 1e-5
                   ) -> tuple[float, float]:
    dw = (mse(w + h, b, x, y) - mse(w - h, b, x, y)) / (2 * h)
    db = (mse(w, b + h, x, y) - mse(w, b - h, x, y)) / (2 * h)
    return dw, db


def fit(x: np.ndarray, y: np.ndarray, lr: float = 0.01, steps: int = 5000
        ) -> tuple[float, float, list[float]]:
    """returns (w, b, loss_history)."""
    w, b = 0.0, 0.0
    loss_history = []
    for _ in range(steps):
        loss_history.append(mse(w, b, x, y))
        dw, db = grad(w, b, x, y)
        w = w - lr * dw
        b = b - lr * db
    return w, b, loss_history
