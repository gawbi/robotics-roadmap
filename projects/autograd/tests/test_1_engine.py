import math

import pytest

from engine import Value


def test_add_and_mul_remember_their_inputs():
    a, b = Value(2.0), Value(-3.0)
    c = a + b
    d = a * b
    assert c.data == -1.0
    assert d.data == -6.0
    assert c._prev == {a, b}
    assert d._prev == {a, b}


def test_add_and_mul_backward():
    a, b = Value(2.0), Value(-3.0)
    (a * b).backward()
    assert a.grad == -3.0
    assert b.grad == 2.0

    a, b = Value(2.0), Value(-3.0)
    (a + b).backward()
    assert a.grad == 1.0
    assert b.grad == 1.0


def test_backward_starts_from_one():
    a = Value(5.0)
    a.backward()
    assert a.grad == 1.0


@pytest.mark.parametrize(
    ("op", "x", "out", "grad"),
    [
        (lambda v: v**2, 3.0, 9.0, 6.0),
        (lambda v: v**-1, 3.0, 1 / 3, -1 / 9),
        (lambda v: v.exp(), 1.0, math.e, math.e),
        (lambda v: v.tanh(), 0.5, math.tanh(0.5), 1 - math.tanh(0.5) ** 2),
        (lambda v: v.relu(), 2.0, 2.0, 1.0),
        (lambda v: v.relu(), -1.0, 0.0, 0.0),
    ],
    ids=["pow2", "pow-1", "exp", "tanh", "relu+", "relu-"],
)
def test_unary_forward_and_local_derivative(op, x, out, grad):
    a = Value(x)
    y = op(a)
    assert y.data == pytest.approx(out)
    y.backward()
    assert a.grad == pytest.approx(grad)


def test_floats_on_either_side():
    a = Value(3.0)
    assert (a + 1).data == 4.0
    assert (1 + a).data == 4.0
    assert (a * 2).data == 6.0
    assert (2 * a).data == 6.0
    assert (-a).data == -3.0
    assert (a - 1).data == 2.0
    assert (1 - a).data == -2.0
    assert (a / 2).data == pytest.approx(1.5)
    assert (6 / a).data == pytest.approx(2.0)


def test_sub_and_div_backward():
    a, b = Value(2.0), Value(4.0)
    (a / b).backward()
    assert a.grad == pytest.approx(1 / 4)  # 1/b
    assert b.grad == pytest.approx(-2 / 16)  # -a/b²

    a, b = Value(2.0), Value(4.0)
    (a - b).backward()
    assert a.grad == pytest.approx(1.0)
    assert b.grad == pytest.approx(-1.0)

    a = Value(2.0)
    (1 - a).backward()
    assert a.grad == pytest.approx(-1.0)


def test_a_value_used_twice_gets_both_gradients():
    a = Value(3.0)
    (a + a).backward()
    assert a.grad == pytest.approx(2.0)

    a = Value(3.0)
    (a * a).backward()
    assert a.grad == pytest.approx(6.0)  # 2a


def test_each_node_backpropagates_once():
    # b is reached through two different parents, d and c
    a = Value(3.0)
    b = a * 2
    c = b * 3
    d = b + c
    d.backward()
    assert b.grad == pytest.approx(4.0)
    assert a.grad == pytest.approx(8.0)


def test_micrograd_readme_example():
    # the usage example at the top of https://github.com/karpathy/micrograd
    a = Value(-4.0)
    b = Value(2.0)
    c = a + b
    d = a * b + b**3
    c += c + 1
    c += 1 + c + (-a)
    d += d * 2 + (b + a).relu()
    d += 3 * d + (b - a).relu()
    e = c - d
    f = e**2
    g = f / 2.0
    g += 10.0 / f
    g.backward()
    assert g.data == pytest.approx(24.7041, abs=1e-4)
    assert a.grad == pytest.approx(138.8338, abs=1e-4)
    assert b.grad == pytest.approx(645.5773, abs=1e-4)
