"""linreg.py 의 test. grad 와 numerical_grad 의 비교, fit 과 np.linalg.lstsq 의 비교를 여기에 쓴다."""

import numpy as np
import pytest

from linreg import fit, grad, make_data, mse, numerical_grad


def rel_err(a: float, b: float) -> float:
    return abs(a - b) / max(abs(a), abs(b))


def test_three_points():
    x = np.array([1., 2., 3.])
    y = np.array([5., 8., 11.])
    assert mse(0, 0, x, y) == pytest.approx(70.0)
    assert grad(0, 0, x, y) == pytest.approx((-36.0, -16.0))
    w, b, _ = fit(x, y, lr=0.01, steps=1)
    assert (w, b) == pytest.approx((0.36, 0.16))


@pytest.mark.parametrize("w, b", [(0., 0.), (-5., 10.), (8., -3.), (20., 20.)])
def test_grad_matches_numerical_grad(w, b):
    x, y = make_data()
    for analytic, numerical in zip(grad(w, b, x, y), numerical_grad(w, b, x, y)):
        assert rel_err(analytic, numerical) < 1e-6


def test_fit_matches_lstsq():
    x, y = make_data()
    w, b, _ = fit(x, y, lr=0.01, steps=5000)
    A = np.stack([x, np.ones_like(x)], axis=1)
    w_ls, b_ls = np.linalg.lstsq(A, y, rcond=None)[0]
    assert abs(w - w_ls) < 1e-3
    assert abs(b - b_ls) < 1e-3
