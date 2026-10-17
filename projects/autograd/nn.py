"""engine.Value 위에 쌓는 MLP."""

from __future__ import annotations

import random

from engine import Value


class Neuron:
    def __init__(self, n_in: int, nonlin: bool = True):
        """weight n_in 개와 bias 하나를 Value 로 만든다. weight 는 random.uniform(-1, 1), bias 는 0 으로 시작한다."""
        raise NotImplementedError

    def __call__(self, x: list[Value | float]) -> Value:
        """out = φ(w_1 x_1 + ... + w_n x_n + b)

        φ 는 nonlin 이 True 면 tanh, False 면 그대로 통과시킨다.

        예: w = [0.5, -1], b = 0.1, x = [2, 1] → 0.5·2 - 1·1 + 0.1 = 0.1 → tanh(0.1) ≈ 0.0997
        """
        raise NotImplementedError

    def parameters(self) -> list[Value]:
        """[w_1, ..., w_n, b]"""
        raise NotImplementedError


class Layer:
    def __init__(self, n_in: int, n_out: int, nonlin: bool = True):
        """Neuron(n_in, nonlin) 을 n_out 개 만든다."""
        raise NotImplementedError

    def __call__(self, x: list[Value | float]) -> Value | list[Value]:
        """neuron 마다 출력 하나. n_out 이 1 이면 list 대신 Value 하나를 돌려준다."""
        raise NotImplementedError

    def parameters(self) -> list[Value]:
        """모든 neuron 의 parameter 를 이어 붙인 list"""
        raise NotImplementedError


class MLP:
    def __init__(self, n_in: int, n_outs: list[int]):
        """n_in → n_outs[0] → n_outs[1] → ... 로 Layer 를 쌓는다.

        예: MLP(2, [4, 1]) 은 Layer(2, 4) 다음에 Layer(4, 1) 이고 parameter 는 (2·4 + 4) + (4·1 + 1) = 17 개다.
        """
        raise NotImplementedError

    def __call__(self, x: list[Value | float]) -> Value | list[Value]:
        """x 를 Layer 에 차례로 통과시킨다. 마지막 Layer 의 출력이 하나면 Value 하나를 돌려준다."""
        raise NotImplementedError

    def parameters(self) -> list[Value]:
        """모든 Layer 의 parameter 를 이어 붙인 list"""
        raise NotImplementedError

    def zero_grad(self) -> None:
        """모든 parameter 의 grad 를 0 으로 되돌린다."""
        raise NotImplementedError
