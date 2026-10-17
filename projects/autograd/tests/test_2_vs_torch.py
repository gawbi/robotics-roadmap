import pytest
import torch

from engine import Value

# Each expression only uses operators and .exp() .tanh() .relu(), so it runs on both Value and torch.Tensor.


def neuron(x1, x2, w1, w2, b):
    return (x1 * w1 + x2 * w2 + b).tanh()


def reuse(a, b):
    z = 2 * a + 2 + a
    q = z.relu() + z * a
    h = (z * b).relu()
    return h + q + q * b


def ratio(a, b):
    f = (a.exp() + b**2) / (a * b - 3)
    return f + 10.0 / f - (-a).relu() + (1 - b).tanh()


CASES = [
    (neuron, [2.0, 0.0, -3.0, 1.0, 6.8813735870195432]),
    (reuse, [-4.0, -1.5]),
    (ratio, [0.7, -1.3]),
]


@pytest.mark.parametrize(("f", "inputs"), CASES, ids=[f.__name__ for f, _ in CASES])
def test_matches_torch_autograd(f, inputs):
    xs = [Value(x) for x in inputs]
    out = f(*xs)
    out.backward()

    ts = [torch.tensor(x, dtype=torch.float64, requires_grad=True) for x in inputs]
    ref = f(*ts)
    ref.backward()

    assert out.data == pytest.approx(ref.item(), abs=1e-6)
    for x, t in zip(xs, ts):
        assert x.grad == pytest.approx(t.grad.item(), abs=1e-6)
