---
id: warmup
title: NumPy Warm-up
branch: core
requires: []
hours: 6
summary: gradient descent 로 푸는 linear regression
papers:
  - title: "Nouvelles méthodes pour la détermination des orbites des comètes"
    authors: Adrien-Marie Legendre
    year: 1805
  - title: "Méthode générale pour la résolution des systèmes d'équations simultanées"
    authors: Augustin-Louis Cauchy
    year: 1847
---

# NumPy Warm-up

## 배경

흩어진 점들을 가장 잘 지나는 직선을 찾는 문제는 1805년 Legendre 가 least squares 로 정리했다. least squares 는
예측값과 정답의 차이를 제곱해 평균한 loss 가 가장 작아지는 $w, b$ 를 찾는 방법이다.

$$
\hat y = w x + b, \qquad L(w, b) = \frac{1}{N}\sum_{i=1}^{N} (\hat y_i - y_i)^2
$$

linear regression 은 이 최솟값을 식 한 줄(normal equation)로 바로 구할 수 있지만, 뒤에 나올 neural network 에는 그런 식이 없다.
그래서 지금 위치에서 loss 가 가장 빨리 줄어드는 방향, 즉 gradient 의 반대 방향으로 조금씩 움직이기를 되풀이하는데,
1847년 Cauchy 가 제안한 이 방법이 gradient descent 다.

$$
\frac{\partial L}{\partial w} = \frac{2}{N}\sum_i (\hat y_i - y_i)\,x_i, \qquad
\frac{\partial L}{\partial b} = \frac{2}{N}\sum_i (\hat y_i - y_i), \qquad
w \leftarrow w - \eta\,\frac{\partial L}{\partial w}
$$

이번 과제에서는 정답을 미리 아는 문제에 gradient descent 를 써서, 반복이 정말 정답으로 다가가는지와 learning rate
$\eta$ 가 크면 왜 발산하는지를 눈으로 확인한다. 뒤에 나오는 학습 과제는 모두 이 loop(예측 → loss → gradient → update)를
더 크게 키운다.

## 목표

- $y = 3x + 2 + \text{noise}$ 데이터를 만들고 직선을 gradient descent 로 맞춘다
- gradient 를 손으로 유도해 코드로 옮기고 finite difference 로 검산한다
- 찾은 $w, b$ 를 `np.linalg.lstsq` 의 정답과 비교한다
- 데이터·직선·loss curve 를 matplotlib 로 그리고, learning rate 에 따른 수렴과 발산을 비교한다

**직접 짤 것**: 예측, loss, gradient, update loop. for 문 대신 NumPy 배열 연산(vectorization)으로 짠다.
**가져다 써도 되는 것**: 정답 비교용 `np.linalg.lstsq`, 그림을 그리는 matplotlib.

## 준비물

- Python 3.12, numpy, matplotlib, pytest
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — 가상환경과 패키지 설치
- GPU 불필요

## 진행 순서

1. 환경 준비 — uv 로 Python 3.12 가상환경을 만들고 패키지를 설치한다

   ```bash
   uv venv --python 3.12
   source .venv/bin/activate          # Windows: .venv\Scripts\activate
   uv pip install numpy matplotlib pytest
   ```

2. `np.random.default_rng(0)` 으로 $x \sim U(0, 10)$ 100개와 $y = 3x + 2 + \epsilon,\ \epsilon \sim \mathcal N(0, 1)$ 을 만들고
   scatter plot 으로 찍어 본다
3. `predict`·`mse`·`grad` 를 for 문 없이 배열 연산으로 짠다
4. central difference $\frac{L(w+h) - L(w-h)}{2h}$ 로 구한 값과 `grad` 의 결과를 비교한다
5. $w = b = 0$ 에서 시작하는 gradient descent loop 를 짜고 step 마다 loss 를 기록한다
6. 찾은 $w, b$ 를 `np.linalg.lstsq` 의 해와 비교한다
7. 데이터 위에 찾은 직선을 겹쳐 그리고, 옆 그림에 loss curve(log 축)를 그린다
8. learning rate 0.001·0.01·0.05 의 loss curve 세 개를 한 그림에 겹쳐 그린다

## 시작점

```text
warmup/
├── linreg.py
├── plot.py
└── test_linreg.py
```

```python
import numpy as np

def make_data(n: int = 100, seed: int = 0) -> tuple[np.ndarray, np.ndarray]:
    """x ~ U(0, 10), y = 3x + 2 + N(0, 1). both shape (n,)."""
    ...

def predict(w: float, b: float, x: np.ndarray) -> np.ndarray: ...

def mse(w: float, b: float, x: np.ndarray, y: np.ndarray) -> float: ...

def grad(w: float, b: float, x: np.ndarray, y: np.ndarray) -> tuple[float, float]:
    """returns (dL/dw, dL/db)."""
    ...

def numerical_grad(w: float, b: float, x: np.ndarray, y: np.ndarray, h: float = 1e-5
                   ) -> tuple[float, float]: ...

def fit(x: np.ndarray, y: np.ndarray, lr: float = 0.01, steps: int = 5000
        ) -> tuple[float, float, list[float]]:
    """returns (w, b, loss_history)."""
    ...
```

## 평가 기준

- [ ] 최적점에서 먼 $(w, b)$ 몇 곳에서 `grad` 와 `numerical_grad` 의 상대 오차가 1e-6 보다 작다
- [ ] lr 0.01·5,000 step 으로 찾은 $w, b$ 가 `np.linalg.lstsq` 의 해와 1e-3 이내로 같다
- [ ] lr 0.05 에서는 loss 가 몇백 step 안에 `inf` 나 `nan` 으로 발산하는 것이 그림에 보인다
- [ ] (선택) $N = 100{,}000$ 에서 배열 연산으로 짠 `grad` 가 Python for 문 버전보다 10배 이상 빠르다
- [ ] (선택) $x$ 를 평균 0·표준편차 1 로 standardize 하면 lr 을 0.1 로 키워도 발산하지 않고, 50 step 안에 정답과 1e-3 이내로 맞는다

## 생각해 볼 질문

1. loss 가 $L(w) = a w^2$ 뿐이라면 update 는 $w \leftarrow (1 - 2\eta a)\, w$ 가 된다. 어떤 $\eta$ 부터 발산하는지 이 식으로 설명할 수 있는가?
2. normal equation 이라는 정답 식이 있는데도 큰 문제에서 gradient descent 를 쓰는 이유는?
3. lr 0.01 의 loss curve 는 처음에 빨리 떨어진 뒤 오래 완만하게 내려가는데, 그동안 주로 $b$ 가 움직인다. 왜 그런가?

## 힌트

<details>
<summary>shape 가 (N,) 인지 (N, 1) 인지</summary>

`x` 가 `(N,)` 이고 `y` 가 `(N, 1)` 이면 `predict(...) - y` 는 오류 없이 `(N, N)` 이 된다(broadcasting). loss 값이 이상하게
크면 중간 배열의 `.shape` 부터 찍어 본다.

</details>

<details>
<summary>loss 가 줄다가 갑자기 nan 이 될 때</summary>

learning rate 가 loss 곡면의 가장 가파른 방향에 비해 크다. lr 을 줄이거나 $x$ 의 scale 을 맞춘다(평균을 빼고 표준편차로
나눈다). scale 을 맞춰 찾은 $w, b$ 는 원래 scale 로 되돌려야 `np.linalg.lstsq` 의 해와 비교할 수 있다.

</details>

## 참고 자료

- 3Blue1Brown, [Gradient descent, how neural networks learn](https://www.youtube.com/watch?v=IHZwWFHWa-w)
- [NumPy: the absolute basics for beginners](https://numpy.org/doc/stable/user/absolute_beginners.html) — 배열과 broadcasting
- [Matplotlib Quick start guide](https://matplotlib.org/stable/users/explain/quick_start.html)
- Stanford CS229, [Lecture Notes](https://cs229.stanford.edu/main_notes.pdf) — 1장의 linear regression 과 LMS
- Dive into Deep Learning, [Linear Regression Implementation from Scratch](https://d2l.ai/chapter_linear-regression/linear-regression-scratch.html) — 막혔을 때만 열기

## 남은 한계

linear regression 은 연속값 하나를 직선으로 예측할 뿐이라 class 를 가르는 분류도, 직선으로 안 되는 관계도 다루지 못한다.
여기서부터 과제가 분야별로 나뉘어, 학습 모델은 [Perceptron](../perceptron/README.md), 로봇은 [Rigid Transforms](../transforms/README.md) 와
[PID Control](../pid-control/README.md), reward 로 배우는 학습은 [Bandits & MDPs](../bandit-mdp/README.md), 언어는
[BPE Tokenizer](../tokenizer/README.md) 에서 시작한다.
