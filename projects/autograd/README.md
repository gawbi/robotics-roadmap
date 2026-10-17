---
id: autograd
title: Backpropagation
branch: core
requires: [perceptron]
hours: 10
summary: scalar autograd 엔진과 XOR 를 푸는 MLP
papers:
  - title: "Learning representations by back-propagating errors"
    authors: David E. Rumelhart, Geoffrey E. Hinton, Ronald J. Williams
    year: 1986
    url: https://www.nature.com/articles/323533a0
  - title: "Automatic Differentiation in Machine Learning: a Survey"
    authors: Atılım Güneş Baydin et al.
    year: 2018
    url: https://jmlr.org/papers/v18/17-468.html
---

# Backpropagation

## 배경

perceptron 을 두 층으로 쌓으면 XOR 를 표현할 수 있지만, hidden 층의 weight 를 얼마나 고쳐야 하는지 알려 주는 규칙이
없었다. step function 은 거의 모든 곳에서 미분이 0 이라 출력의 오차가 앞 층으로 전해지지 않는다. 1986년 Rumelhart·Hinton·
Williams 는 step 대신 sigmoid 처럼 미분 가능한 activation 을 쓰고 chain rule 로 loss 의 gradient 를 출력에서 입력 쪽으로
거꾸로 전파하면, 모든 층의 weight 를 한꺼번에 학습시킬 수 있음을 보였다.

계산을 덧셈·곱셈 같은 작은 연산의 graph 로 보면 각 node 는 자기 local derivative 만 알면 된다. 어떤 값 $x$ 가
$y_1, \dots, y_k$ 여러 곳에 쓰였다면 $x$ 의 gradient 는 경로마다 들어온 gradient 를 모두 더한 값이다.

$$
\frac{\partial L}{\partial x} = \sum_{j=1}^{k} \frac{\partial L}{\partial y_j}\,\frac{\partial y_j}{\partial x}
$$

graph 를 topological order 의 역순으로 한 번 훑으면 parameter 가 몇 개든 scalar loss 하나의 gradient 를 forward 와
비슷한 비용으로 모두 얻는다. 이 방식이 reverse-mode automatic differentiation 이고, PyTorch 의 `loss.backward()` 가 하는
일이다. 이번 과제에서는 숫자 하나를 감싸는 `Value` class 로 이 엔진을 직접 짜고, 그 위에 MLP 를 올려 perceptron 이 못 푼
XOR 를 푼다.

## 목표

- 값·gradient·자기를 만든 연산과 입력을 기억하는 `Value` 로 scalar autograd 엔진을 만든다
- `+`·`*`·`**`·`exp`·`tanh`·`relu` 의 local derivative 와 `backward()` 를 짠다
- 같은 식의 gradient 를 `torch.autograd` 와 비교한다
- 엔진 위에 `Neuron`·`Layer`·`MLP` 를 쌓아 XOR 네 점을 모두 맞힌다

**직접 짤 것**: `Value` 의 연산과 backward, topological sort, MLP, 학습 loop.
**가져다 써도 되는 것**: 검산용 `torch.autograd`, graph 를 그려 보는 graphviz, 그림용 matplotlib.

## 준비물

- Python 3.12, matplotlib, pytest
- torch — gradient 검산용이라 CPU 판으로 충분하다
- (선택) graphviz — pip 패키지와 시스템 Graphviz 를 함께 설치해야 graph 를 그릴 수 있다
- GPU 불필요

## 진행 순서

1. `data`·`grad`·`_prev`·`_op` 를 담은 `Value` 를 만들고 `+`·`*` 의 forward 만 짠다
2. 각 연산이 결과 `Value` 에 local derivative 를 계산하는 `_backward` 함수를 달게 한다
3. 출력에서 시작하는 topological sort 를 짜고, 그 역순으로 `_backward` 를 부르는 `backward()` 를 짠다
4. `**`·`exp`·`tanh`·`relu` 를 추가하고 `-`·`/`·`__radd__` 같은 나머지는 이미 있는 연산의 조합으로 만든다
5. 같은 식을 `Value` 와 `torch`(float64) 로 계산해 gradient 를 비교하는 test 를 쓴다
6. `Neuron`·`Layer`·`MLP` 와 모든 weight 를 모아 주는 `parameters()` 를 짠다
7. target 을 -1·+1 로 둔 XOR 네 점에 MSE loss 로 MLP 를 학습시킨다
8. 학습된 MLP 의 decision boundary 를 2D 평면에 그린다

## 시작점

```text
autograd/
├── engine.py        # Value
├── nn.py            # Neuron, Layer, MLP
├── train_xor.py
└── test_engine.py
```

```python
from __future__ import annotations
from typing import Callable

class Value:
    def __init__(self, data: float, _children: tuple[Value, ...] = (), _op: str = ""):
        self.data = data
        self.grad = 0.0
        self._backward: Callable[[], None] = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other: Value | float) -> Value: ...
    def __mul__(self, other: Value | float) -> Value: ...
    def __pow__(self, k: float) -> Value: ...
    def exp(self) -> Value: ...
    def tanh(self) -> Value: ...
    def relu(self) -> Value: ...

    def backward(self) -> None:
        """fill .grad of every node reachable from self, in reverse topological order. self.grad starts at 1."""
        ...

class Neuron:
    def __init__(self, n_in: int, nonlin: bool = True): ...
    def __call__(self, x: list[Value]) -> Value: ...
    def parameters(self) -> list[Value]: ...

class MLP:
    def __init__(self, n_in: int, n_outs: list[int]): ...
    def __call__(self, x: list[Value]) -> Value | list[Value]: ...
    def parameters(self) -> list[Value]: ...
    def zero_grad(self) -> None: ...
```

## 스스로 확인

- [ ] micrograd README 첫머리의 사용 예시 식을 그대로 돌리면 `g.data`·`a.grad`·`b.grad` 가 README 에 적힌 24.7041·138.8338·645.5773 과 같다
- [ ] 직접 고른 식 3개 이상에서 모든 입력의 gradient 가 `torch.autograd`(float64) 와 1e-6 이내로 같다
- [ ] `b = a + a` 와 `c = a * a` 에서 `a.grad` 가 각각 2 와 $2a$ 로 나온다
- [ ] hidden 4–8 개짜리 MLP 가 XOR 네 점을 모두 맞힌다
- [ ] (선택) sklearn `make_moons` 100 점을 학습시키고 decision boundary 를 그린다

## 생각해 볼 질문

1. 한 값이 식에 두 번 쓰이면 gradient 를 덮어쓰지 않고 더해야 한다. 그 이유를 위의 합 공식으로 설명할 수 있는가?
2. parameter 가 1만 개이고 loss 가 scalar 하나일 때 입력 쪽에서 출발하는 forward-mode 대신 출력 쪽에서 출발하는 reverse-mode 를 쓰는 이유는?
3. perceptron 의 step function 을 그대로 두고 backpropagation 을 하면 어떤 일이 생기는가?

## 힌트

<details>
<summary>topological sort</summary>

DFS 로 한 node 의 `_prev` 를 모두 방문한 뒤에 그 node 를 목록에 넣으면 목록에서 입력은 앞에, 출력은 뒤에 온다.
`backward()` 는 이 목록을 뒤집어 돈다. 이미 방문한 node 는 set 으로 걸러야 같은 node 의 `_backward` 가 두 번 불리지 않는다.

</details>

<details>
<summary>step 이 갈수록 update 가 커질 때</summary>

`_backward` 는 `+=` 로 gradient 를 쌓기 때문에 update 전에 모든 parameter 의 `grad` 를 0 으로 되돌려야 한다. `zero_grad` 를
빼먹으면 이전 step 의 gradient 가 계속 더해진다.

</details>

<details>
<summary>XOR 가 수렴하지 않을 때</summary>

hidden 이 2개뿐이면 초기값에 따라 local minimum 에 자주 걸린다. hidden 을 4개 이상으로 늘리거나 seed 를 바꿔 보고,
초기 weight 가 너무 커서 `tanh` 가 처음부터 ±1 에 붙어 있지 않은지 확인한다.

</details>

## 참고 자료

- Andrej Karpathy, [The spelled-out intro to neural networks and backpropagation: building micrograd](https://www.youtube.com/watch?v=VMj-3S1tku0) — 개념을 잡는 용도로 보고, 코드는 보지 않고 짠다
- Stanford CS231n, [Backpropagation, Intuitions](https://cs231n.github.io/optimization-2/)
- Christopher Olah, [Calculus on Computational Graphs: Backpropagation](https://colah.github.io/posts/2015-08-Backprop/)
- [karpathy/micrograd](https://github.com/karpathy/micrograd) — 막혔을 때만 열기

## 남은 한계

숫자 하나마다 Python 객체를 만들기 때문에 MNIST 처럼 weight 가 수십만 개인 모델은 너무 느리다. 같은 계산을 tensor 단위로
묶어 처리하는 방법은 [PyTorch Training Loop](../pytorch-mlp/README.md) 에서 다룬다.
