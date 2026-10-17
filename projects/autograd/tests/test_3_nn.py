import pytest

from engine import Value
from nn import MLP, Layer, Neuron


def test_neuron_has_one_weight_per_input_and_a_bias():
    n = Neuron(3)
    params = n.parameters()
    assert len(params) == 4
    assert all(isinstance(p, Value) for p in params)
    assert isinstance(n([1.0, 2.0, 3.0]), Value)


def test_neuron_applies_tanh_only_when_nonlinear():
    for nonlin in (True, False):
        n = Neuron(2, nonlin=nonlin)
        *w, b = n.parameters()
        w[0].data, w[1].data, b.data = 0.5, -1.0, 0.1
        expected = 0.0997 if nonlin else 0.1  # tanh(0.1) or 0.1
        assert n([2.0, 1.0]).data == pytest.approx(expected, abs=1e-4)


def test_layer_returns_one_value_per_neuron():
    assert len(Layer(2, 3)([1.0, -1.0])) == 3
    assert isinstance(Layer(2, 1)([1.0, -1.0]), Value)
    assert len(Layer(2, 3).parameters()) == 3 * 3


def test_mlp_collects_every_parameter_once():
    model = MLP(2, [4, 1])
    params = model.parameters()
    assert len(params) == (2 * 4 + 4) + (4 * 1 + 1)
    assert len({id(p) for p in params}) == len(params)
    assert isinstance(model([1.0, 0.0]), Value)


def test_backward_reaches_the_parameters_and_zero_grad_clears_them():
    model = MLP(2, [4, 1])
    model([0.5, -0.5]).backward()
    assert any(p.grad != 0.0 for p in model.parameters())
    model.zero_grad()
    assert all(p.grad == 0.0 for p in model.parameters())
