"""숫자 하나를 감싸고 자기를 만든 계산을 기억하는 Value 와 reverse-mode autodiff.

표기: 연산 결과를 out, loss 를 L 이라 하면 out.grad 는 ∂L/∂out 이다. 각 연산이 out 에 다는 _backward 는
입력마다 (local derivative) × out.grad 를 그 입력의 grad 에 더한다(+=).
"""

from __future__ import annotations

from typing import Callable


class Value:
    def __init__(self, data: float, _children: tuple[Value, ...] = (), _op: str = ""):
        self.data = data
        self.grad = 0.0
        self._backward: Callable[[], None] = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __repr__(self) -> str:
        return f"Value(data={self.data}, grad={self.grad})"

    # 기본 연산: forward 값과 _backward 를 직접 짠다

    def __add__(self, other: Value | float) -> Value:
        """out = a + b    (a → self, b → other. other 가 float 이면 Value 로 감싼다)

        ∂out/∂a = 1,  ∂out/∂b = 1

        예: a = 2, b = -3 → out = -1. out.grad 가 5 이면 a.grad 와 b.grad 에 각각 5 가 더해진다
        """
        raise NotImplementedError

    def __mul__(self, other: Value | float) -> Value:
        """out = a · b

        ∂out/∂a = b,  ∂out/∂b = a

        예: a = 2, b = -3 → out = -6. out.grad 가 1 이면 a.grad 에 -3, b.grad 에 2 가 더해진다
        """
        raise NotImplementedError

    def __pow__(self, k: float) -> Value:
        """out = a^k    (k 는 Value 가 아닌 상수)

        ∂out/∂a = k · a^(k-1)

        예: a = 3, k = 2  → out = 9,   ∂out/∂a = 6
            a = 3, k = -1 → out = 1/3, ∂out/∂a = -1/9
        """
        raise NotImplementedError

    def exp(self) -> Value:
        """out = e^a

        ∂out/∂a = e^a, 곧 out 자신의 값이다

        예: a = 1 → out ≈ 2.7183, ∂out/∂a ≈ 2.7183
        """
        raise NotImplementedError

    def tanh(self) -> Value:
        """t = tanh(a) = (e^(2a) - 1) / (e^(2a) + 1)    (forward 값은 math.tanh 로 구해도 된다)

        ∂t/∂a = 1 - t²

        예: a = 0.5 → t ≈ 0.4621, ∂t/∂a ≈ 0.7864
        """
        raise NotImplementedError

    def relu(self) -> Value:
        """out = max(0, a)

        ∂out/∂a = 1 (a > 0),  0 (a ≤ 0)

        예: a = 2  → out = 2, ∂out/∂a = 1
            a = -1 → out = 0, ∂out/∂a = 0
        """
        raise NotImplementedError

    # 나머지 연산: 위의 연산을 조합해 만든다. _backward 를 따로 짜지 않는다

    def __neg__(self) -> Value:
        """-a = a · (-1)"""
        raise NotImplementedError

    def __sub__(self, other: Value | float) -> Value:
        """a - b = a + (-b)"""
        raise NotImplementedError

    def __truediv__(self, other: Value | float) -> Value:
        """a / b = a · b^(-1)"""
        raise NotImplementedError

    def __radd__(self, other: float) -> Value:
        """other + a. `1 + a` 처럼 float 가 왼쪽에 오면 Python 이 a.__radd__(1) 을 부른다"""
        raise NotImplementedError

    def __rmul__(self, other: float) -> Value:
        """other · a"""
        raise NotImplementedError

    def __rsub__(self, other: float) -> Value:
        """other - a"""
        raise NotImplementedError

    def __rtruediv__(self, other: float) -> Value:
        """other / a"""
        raise NotImplementedError

    def backward(self) -> None:
        """self 에서 거꾸로 닿는 모든 node 의 grad 를 채운다.

        1. self 에서 출발해 _prev 를 따라가며 topological order 목록을 만든다. 입력이 앞, self 가 맨 뒤에 온다
        2. self.grad = 1 로 둔다 (∂L/∂L = 1)
        3. 목록을 뒤에서부터 돌며 node 마다 _backward() 를 한 번씩 부른다

        예: a = 3, b = a · 2, c = b + b 에서 c.backward() → c.grad = 1, b.grad = 2, a.grad = 4
        """
        raise NotImplementedError
