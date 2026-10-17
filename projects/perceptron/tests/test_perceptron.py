import pytest

from perceptron import predict, train, train_epoch

AND = [([0.0, 0.0], 0), ([0.0, 1.0], 0), ([1.0, 0.0], 0), ([1.0, 1.0], 1)]
OR = [([0.0, 0.0], 0), ([0.0, 1.0], 1), ([1.0, 0.0], 1), ([1.0, 1.0], 1)]
XOR = [([0.0, 0.0], 0), ([0.0, 1.0], 1), ([1.0, 0.0], 1), ([1.0, 1.0], 0)]


def labels(data):
    return [y for _, y in data]


def predictions(w, b, data):
    return [predict(w, b, x) for x, _ in data]


def test_predict_steps_on_the_weighted_sum():
    assert predict([1.0, 1.0], -1.5, [1.0, 1.0]) == 1
    assert predict([1.0, 1.0], -1.5, [1.0, 0.0]) == 0
    assert predict([-2.0, 0.5], 1.0, [0.0, 4.0]) == 1


def test_predict_is_zero_on_the_boundary():
    assert predict([1.0, -1.0], 0.0, [2.0, 2.0]) == 0


@pytest.mark.parametrize("lr", [0.1, 0.5])
def test_train_epoch_updates_only_on_mistakes(lr):
    w, b, errors = train_epoch([0.0, 0.0], 0.0, AND, lr)
    assert w == pytest.approx([lr, lr])
    assert b == pytest.approx(lr)
    assert errors == 1


def test_train_epoch_uses_the_weights_updated_earlier_in_the_epoch():
    # (0,1) is missed first, which moves the boundary so that (1,0) is then classified correctly
    w, b, errors = train_epoch([0.0, 0.0], 0.0, XOR, 1.0)
    assert w == pytest.approx([-1.0, 0.0])
    assert b == pytest.approx(0.0)
    assert errors == 2


def test_train_runs_exactly_max_epochs():
    # AND with lr = 1 needs exactly 6 epochs (see test_converged_epoch_counts_from_one)
    assert train(AND, lr=1.0, max_epochs=6)[2] == 6
    assert train(AND, lr=1.0, max_epochs=5)[2] is None


@pytest.mark.parametrize("data", [AND, OR], ids=["AND", "OR"])
def test_linearly_separable_data_converges(data):
    w, b, epoch = train(data, lr=0.1, max_epochs=100)
    assert epoch is not None and 1 <= epoch <= 100
    assert predictions(w, b, data) == labels(data)
    # the returned weights are the ones that made no mistake
    assert train_epoch(w, b, data, 0.1)[2] == 0


def test_converged_epoch_counts_from_one():
    # with lr = 1 every weight stays an integer, so the epoch count is exact
    assert train(AND, lr=1.0)[2] == 6
    assert train(OR, lr=1.0)[2] == 4


def test_xor_never_converges():
    w, b, epoch = train(XOR, lr=0.1, max_epochs=10_000)
    assert epoch is None
    assert predictions(w, b, XOR) != labels(XOR)
