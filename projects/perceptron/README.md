---
id: perceptron
title: Perceptron
branch: core
requires: [warmup]
hours: 4
summary: 순수 Python 으로 짜는 최초의 학습 기계와 그 한계
papers:
  - title: "The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain"
    authors: Frank Rosenblatt
    year: 1958
  - title: "On Convergence Proofs on Perceptrons"
    authors: Albert B. J. Novikoff
    year: 1962
  - title: "Perceptrons: An Introduction to Computational Geometry"
    authors: Marvin Minsky, Seymour Papert
    year: 1969
---

# Perceptron

## 배경

1958년 Rosenblatt 의 perceptron 은 입력에 weight 를 곱해 더한 값이 0 보다 크면 1, 아니면 0 을 내는 단순한 모델인데,
틀릴 때마다 weight 를 조금씩 고치는 학습 규칙이 붙어 있어서 "데이터로 스스로 배우는 기계" 의 첫 사례가 됐다.

$$
\hat y = \mathbb{1}[\,w \cdot x + b > 0\,], \qquad w \leftarrow w + \eta\,(y - \hat y)\,x
$$

데이터가 직선 하나로 나뉠 수 있으면(linearly separable) 이 규칙은 유한 번 안에 반드시 수렴한다. 그런데 1969년
Minsky 와 Papert 가 XOR 처럼 직선 하나로 나눌 수 없는 문제는 perceptron 이 영영 풀지 못한다는 것을 보이면서
neural network 연구는 한동안 멈췄다. 이번 과제에서는 그 수렴과 실패를 둘 다 직접 확인한다.

## 목표

- perceptron 학습 규칙으로 AND·OR 를 학습시킨다
- 같은 코드로 XOR 를 학습시키면 끝까지 수렴하지 않는 것을 확인한다
- 학습된 decision boundary 를 2D 평면에 그린다

**직접 짤 것**: 예측, 학습 규칙, epoch 반복 전부. numpy 도 쓰지 않고 list 와 for 문만으로 짠다.
**가져다 써도 되는 것**: 그림을 그리는 matplotlib.

## 준비물

- Python 3.12, pytest, matplotlib
- GPU 불필요

## 진행 순서

1. AND·OR·XOR 의 진리표를 `(x1, x2) -> y` 목록으로 만든다
2. `predict(w, b, x)` 를 짠다
3. 한 epoch 동안 모든 샘플을 돌며 weight 를 고치는 `train_epoch` 를 짠다
4. 한 epoch 동안 틀린 개수가 0 이 될 때까지 반복하고, 최대 epoch 를 넘으면 멈춘다
5. AND·OR·XOR 마다 몇 epoch 만에 수렴했는지(또는 실패했는지) 출력한다
6. 학습된 $w, b$ 로 직선 $w_1 x_1 + w_2 x_2 + b = 0$ 을 그리고 네 점을 함께 찍는다

## 시작점

```text
perceptron/
├── perceptron.py        # predict, train_epoch, train 의 stub
├── plot.py              # 직접 만든다. AND·OR·XOR 의 decision boundary 그림
└── tests/               # 채점용 test. 고치지 않는다
    ├── conftest.py
    └── test_perceptron.py
```

[perceptron.py](perceptron.py) 의 함수는 몸통이 `raise NotImplementedError` 인 stub 이고, docstring 에 수식과 변수의
대응, 손으로 따라 할 수 있는 숫자 예시가 있다. 함수 하나를 채울 때마다 test 를 돌리면 `-x` 가 처음 실패한 test 에서
멈추고 그 test 가 부른 함수를 보여 준다.

```bash
pytest projects/perceptron/tests -x
```

## 평가 기준

- [ ] `pytest projects/perceptron/tests` 가 모두 통과한다. AND·OR 가 100 epoch 안에 수렴해 네 점을 모두 맞히는 것과 XOR 가
  `max_epochs` 10,000 에서도 수렴하지 않는 것을 이 test 가 확인한다
- [ ] 그림에서 AND·OR 의 직선은 두 class 를 가르고, XOR 에는 그런 직선이 없다는 것이 눈으로 보인다
- [ ] (선택) 학습 순서를 섞어도 AND·OR 가 수렴하는지 확인하는 pytest 를 `tests/` 밖의 test 파일(예: `test_shuffle.py`)에 쓴다

## 생각해 볼 질문

1. XOR 를 직선 하나로 나눌 수 없다는 것을 종이에 그림으로 설명할 수 있는가?
2. learning rate 를 10배 키우면 수렴 epoch 수가 어떻게 되는가? 그 이유는?
3. perceptron 을 두 층으로 쌓으면 XOR 를 표현할 수 있다. 그런데 왜 1969년에는 그걸로 해결되지 않았는가?

## 힌트

<details>
<summary>XOR 를 두 층으로 표현하는 weight</summary>

XOR = (x1 OR x2) AND NOT (x1 AND x2) 다. 첫 층에 OR 와 NAND 를 두고 둘째 층에서 AND 를 하면 된다.
다만 이 weight 는 손으로 정해야 하는데, 여러 층을 데이터로 학습시키는 방법은 다음 과제에서 다룬다.

</details>

## 참고 자료

- Rosenblatt 1958 원문은 길고 생물학 용어가 많아서 학습 규칙만 찾아 읽어도 충분하다. linearly separable 데이터에서 유한 번 안에 수렴한다는 증명은 Novikoff 1962 에 있다
- Michael Nielsen, [Neural Networks and Deep Learning — Chapter 1](http://neuralnetworksanddeeplearning.com/chap1.html)

## 남은 한계

층을 쌓으면 XOR 를 표현할 수 있지만 여러 층의 weight 를 한꺼번에 학습시킬 방법이 없었다.
그 방법이 [Backpropagation](../autograd/README.md) 이다.
