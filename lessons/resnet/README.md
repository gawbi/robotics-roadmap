---
id: resnet
title: ResNet
branch: vision
requires: [cnn]
hours: 3
summary: 층을 깊게 쌓으면 gradient 가 사라지는 문제를 숫자로 보고, 입력을 출력에 더하는 residual connection 과 batch normalization 으로 만든 ResNet-18 을 로봇 policy 의 image encoder 로 쓰기까지 따라간다
papers:
  - title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift"
    authors: Sergey Ioffe, Christian Szegedy
    year: 2015
    url: https://arxiv.org/abs/1502.03167
  - title: "Deep Residual Learning for Image Recognition"
    authors: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
    year: 2015
    url: https://arxiv.org/abs/1512.03385
---

# ResNet

## 학습 목표

- 층을 더 쌓은 CNN 이 오히려 학습 데이터에서조차 더 많이 틀리는 현상을 실제 숫자로 보이고, 이것이 외워서 생기는 문제와 다른
  이유를 설명할 수 있다
- 층을 거꾸로 지나며 gradient 에 같은 수가 계속 곱해질 때, 0.5 를 20 번 곱하면 약 100만 분의 1 이 되는 식으로 gradient 가 거의
  0 이 되는 과정을 계산할 수 있다
- block 의 입력을 출력에 그대로 더하는 연결이 gradient 에 "1 + 작은 값" 의 길을 만든다는 것을 한 block, 두 block, 20 block 으로
  손 계산할 수 있다
- 값 몇 개짜리 작은 묶음으로 평균과 퍼진 정도를 구해 값의 크기를 맞추는 계산(batch normalization)을 하고, 학습 때와 평가 때
  쓰는 숫자가 왜 다른지 설명할 수 있다
- 18 층짜리 ResNet-18 의 층마다 출력 크기와 학습할 숫자의 개수를 셀 수 있다
- 사진 약 128만 장으로 미리 학습한 ResNet-18 의 마지막 요약 숫자 512 개가, 로봇이 다음 행동을 고르는 모델(ACT, Diffusion
  Policy)에 사진을 넣는 입구로 쓰이는 방식을 설명할 수 있다

## 층을 깊게 쌓을 때의 문제

### 깊은 CNN 이 필요한 이유

[CNN](../cnn/README.md) 에서 본 LeNet 은 convolution 층이 둘뿐이었다. convolution 은 작은 filter(숫자 판)를 사진 위에서 한 칸씩
옮기며 겹친 칸끼리 곱해 더하는 계산이고, 그 결과로 나온 숫자 판을 feature map 이라고 했다. LeNet 은 28×28 흑백 숫자 사진처럼
작고 단순한 사진에는 충분했지만, 로봇 카메라가 찍는 224×224 컬러 사진 속에서 컵과 그릇과 사람 손을 가려내기에는 부족하다.

CNN 강의의 receptive field 계산이 그 이유를 보여 준다. receptive field 는 출력 한 칸이 반영하는 입력 사진의 영역이었고, 3×3 filter 로
하는 convolution 층(줄여서 conv)을 $L$ 층 쌓으면 $1 + L \times 2$ 칸이 된다.

| 쌓은 3×3 conv 수 | receptive field |
| --- | --- |
| 2 | $1 + 2 \times 2 = 5$ |
| 10 | $1 + 10 \times 2 = 21$ |
| 50 | $1 + 50 \times 2 = 101$ |

층이 적으면 한 칸이 사진의 아주 작은 조각밖에 보지 못한다. CNN 강의에서 본 것처럼 깊은 층은 아래층의 작은 선과 모서리를 조합해
"손잡이가 달린 둥근 물체" 같은 큰 패턴을 찾기 때문에, 복잡한 사진을 다루려면 층을 수십 개 쌓아야 한다. 2015년 무렵 사진 분류에서
가장 좋은 성적을 낸 모델들도 층이 16~30 개였다.

**확인 문제.** 3×3 conv 를 20 층 쌓으면 receptive field 는 몇 칸일까?

<details><summary>답 보기</summary>

$1 + 20 \times 2 = 41$ 칸이다.

</details>

### degradation

층이 많으면 더 복잡한 것을 표현할 수 있으니 층을 쌓을수록 성적이 좋아질 것 같다. 2015년 Kaiming He 등이 실험해 보니 결과는
반대였다. convolution 층을 차례로 쌓기만 한 망을 이 강의에서는 plain network 라고 부르는데, plain network 를 깊게 만들었더니
오히려 더 많이 틀렸다.

이 실험에 쓴 데이터는 ImageNet 이다. ImageNet 은 사진을 1000 개의 종류(class)로 나눠 모은 데이터로, 학습용 사진이 약 128만 장,
검증용 사진이 5만 장이다. class 에는 강아지 품종, 컵, 자동차 같은 것들이 들어 있다. 모델이 사진마다 1000 개의 점수를 내면 가장
높은 점수의 class 를 답으로 고르는데, 이 답이 틀린 사진의 비율을 top-1 error 라고 한다. 100 장 중 28 장을 틀리면 top-1 error 는
28% 다.

| 망 | 층 수 | 검증 사진의 top-1 error |
| --- | --- | --- |
| plain | 18 | 27.94% |
| plain | 34 | 28.54% |

34 층 plain 망이 18 층보다 더 많이 틀렸다. 학습이 덜 된 것인지 보려고 학습 사진에서의 error 를 함께 그려 보면, 34 층 망은 학습하는
내내 학습 사진에서도 18 층 망보다 더 많이 틀렸다. 같은 현상은 32×32 컬러 사진 10 class 데이터인 CIFAR-10 에서도 나타나서,
20 층 plain 망보다 56 층 plain 망의 학습 사진 error 가 더 높았다.

학습 사진에서 틀린 비율을 training error, 학습에 쓰지 않은 사진에서 틀린 비율을 test error 라고 부른다. 층을 더 쌓았는데 정확도가
떨어지는 이 현상을 He 등은 degradation(성능 저하)이라고 이름 붙였다.

**흔한 오해.** "층이 많으면 parameter(weight 처럼 학습으로 정하는 숫자)가 많아져서 학습 데이터를 외우는 overfitting 이 생긴 것" 이라고 생각하기 쉽다.
[PyTorch Training Loop](../pytorch-mlp/README.md) 에서 본 overfitting 은 학습 데이터는 잘 맞히는데 처음 보는 데이터를 못 맞히는
현상이라, overfitting 이라면 training error 는 낮아야 한다. degradation 에서는 training error 자체가 높아서, 깊은 망은 학습 사진조차
잘 맞히지 못한다. 외운 것이 아니라 덜 배운 것이다.

**확인 문제.** 어떤 망의 training error 가 2%, test error 가 30% 다. 다른 망은 training error 가 25%, test error 가 27% 다. 둘 중
overfitting 에 가까운 것은?

<details><summary>답 보기</summary>

첫째 망이다. 학습 사진은 98% 맞히는데 처음 보는 사진은 70% 만 맞히므로 학습 사진을 외운 쪽에 가깝다. 둘째 망은 학습 사진에서도
25% 를 틀리므로 degradation 처럼 덜 배운 쪽이다.

</details>

### 깊은 망이 얕은 망보다 나빠질 수 없는 이유

degradation 이 이상한 현상인 이유는 깊은 망이 얕은 망을 그대로 흉내 낼 수 있기 때문이다. 입력을 아무것도 바꾸지 않고 그대로
내보내는 계산을 identity(항등) 라고 한다. $x = 5$ 를 받으면 5 를, $x = -2$ 를 받으면 $-2$ 를 내는 계산이다. 층 하나가 identity 가
되려면, 입력에 곱하는 숫자 weight 하나로 된 층 $y = w x$ 라면 $w = 1$ 이면 된다.

20 층 망을 잘 학습해 두고, 그 뒤에 identity 로 만든 층 36 개를 붙이면 56 층 망이 된다. 붙인 36 층은 아무것도 바꾸지 않으므로
이 56 층 망은 20 층 망과 똑같은 답을 내고, 똑같은 만큼만 틀린다.

![20 층 망 뒤에 입력을 그대로 내보내는 identity 층 36 개를 붙이면 56 층 망이 되고, 이 망은 20 층 망과 같은 답을 낸다. 그래서 56 층 망의 가장 좋은 상태는 20 층 망보다 나쁠 수 없다](figures/deep-identity.svg)

위 그림처럼 56 층 망이 가질 수 있는 상태 중에는 "20 층 망과 똑같은 상태" 가 이미 들어 있다. 그러니 56 층 망을 제대로 학습하면
training error 가 20 층 망보다 높을 수 없다. 그런데도 실제로 높게 나왔다는 것은, 그런 좋은 상태가 분명히 있는데 gradient descent
가 그 상태를 찾아가지 못한다는 뜻이다. gradient descent 는 loss(모델이 틀린 정도를 나타낸 숫자 하나)를 줄이는 방향으로 parameter
를 조금씩 고치는 방법으로, [Linear Regression](../linear-regression/README.md) 에서 처음 다뤘다.

**확인 문제.** 10 층 망 뒤에 identity 층 15 개를 붙이면 몇 층 망이 되고, 이 망의 training error 는 10 층 망과 비교해 어떨까?

<details><summary>답 보기</summary>

25 층 망이 되고, 붙인 층이 아무것도 바꾸지 않으므로 training error 는 10 층 망과 같다.

</details>

**요약**

- 복잡한 사진을 다루려면 층을 수십 개 쌓아 receptive field 를 넓혀야 한다
- plain network 는 층을 쌓을수록 training error 까지 높아지는 degradation 을 보인다. ImageNet 에서 18 층 27.94%, 34 층 28.54% 였다
- 깊은 망은 identity 층을 붙여 얕은 망을 흉내 낼 수 있으므로, degradation 은 좋은 상태를 학습이 찾아가지 못하는 문제다

## gradient 의 곱셈

깊은 망의 학습이 어려운 첫째 이유는 gradient 가 층을 거꾸로 지나며 겪는 곱셈에 있다. [Backpropagation](../autograd/README.md)
강의의 정리에서 sigmoid 를 지날 때마다 gradient 가 4 분의 1 이하로 줄어든다는 문제를 남겨 두었는데, 이 섹션에서 그 문제를 숫자로
끝까지 따라간다.

### chain rule 로 이어지는 곱

gradient 는 parameter 나 중간 값을 아주 조금 바꿨을 때 loss 가 변하는 비율이다. Backpropagation 강의의 chain rule(연쇄 법칙)은
값이 중간 값 여러 개를 거쳐 영향을 줄 때, 전체 비율이 칸마다의 비율을 모두 곱한 값이라는 규칙이었다.

가장 단순한 깊은 망을 만들어 본다. 층마다 숫자 하나를 받아 0.5 를 곱해 내보내는 층을 3 개 이었다.

$$
h_1 = 0.5\, x, \qquad h_2 = 0.5\, h_1, \qquad h_3 = 0.5\, h_2
$$

$x$ 는 망의 입력, $h_1, h_2, h_3$ 은 1·2·3 번째 층의 출력이다. $x = 8$ 을 넣으면 $h_1 = 4$, $h_2 = 2$, $h_3 = 1$ 이다.

이제 $x$ 를 0.01 늘려 8.01 로 바꾸고 그 영향이 끝까지 어떻게 전해지는지 본다.

| 값 | 바뀌기 전 | 바뀐 뒤 | 변화 | 앞 칸 변화에 대한 비율 |
| --- | --- | --- | --- | --- |
| $x$ | 8 | 8.01 | $+0.01$ | |
| $h_1 = 0.5\, x$ | 4 | 4.005 | $+0.005$ | $0.005 \div 0.01 = 0.5$ |
| $h_2 = 0.5\, h_1$ | 2 | 2.0025 | $+0.0025$ | $0.0025 \div 0.005 = 0.5$ |
| $h_3 = 0.5\, h_2$ | 1 | 1.00125 | $+0.00125$ | $0.00125 \div 0.0025 = 0.5$ |

$x$ 를 0.01 늘렸더니 $h_3$ 은 0.00125 늘었으니 전체 비율은 $0.00125 \div 0.01 = 0.125$ 다. 칸마다의 비율 0.5 세 개를 곱한
$0.5 \times 0.5 \times 0.5 = 0.125$ 와 같다. 이 비율을 기호로는 $\frac{\partial h_3}{\partial x}$ 로 쓰고 "$x$ 를 조금 바꿨을 때
$h_3$ 이 변하는 비율" 로 읽는다.

입력에서 출력 쪽으로 값을 계산하는 것을 forward, 같은 비율을 출력 쪽에서 입력 쪽으로 거꾸로 계산하는 것을 backward
라고 했다. 출력에서 gradient 1 로 출발해 층을 하나 지날 때마다 그 층의
비율 0.5 를 곱하면 $h_2$ 에서 0.5, $h_1$ 에서 0.25, $x$ 에서 0.125 가 된다.

![0.5 를 곱하는 층 세 개. 위 줄은 forward 로 x = 8 이 4, 2, 1 이 되고, 아래 줄은 backward 로 출력의 gradient 1 이 층을 거꾸로 지나며 0.5, 0.25, 0.125 로 줄어든다](figures/vanishing-chain.svg)

위 그림의 아래 줄이 backward 다. 층을 하나 거꾸로 지날 때마다 gradient 가 반으로 줄어서, 입력에 가까운 값일수록 gradient 가 작다.

**확인 문제.** 층마다 0.5 대신 3 을 곱하는 층 3 개를 이으면 $\frac{\partial h_3}{\partial x}$ 는 얼마일까?

<details><summary>답 보기</summary>

칸마다의 비율이 3 이라 $3 \times 3 \times 3 = 27$ 이다.

</details>

### 거듭제곱

같은 수를 여러 번 곱하는 계산은 거듭제곱으로 짧게 쓴다. $0.5$ 를 3 번 곱한 수는 $0.5^3$ 으로 쓰고 "0.5 의 3 제곱" 이라고 읽는다.
0.5 의 오른쪽 위에 작게 쓴 3 이 곱한 횟수다. $0.5^3 = 0.5 \times 0.5 \times 0.5 = 0.125$ 다.

층이 $L$ 개면 입력까지 전해지는 gradient 는 $0.5^L$ 이다. $L$ 을 늘려 가며 계산하면 아래와 같다.

| 층 수 $L$ | 계산 | $0.5^L$ | 분수로 |
| --- | --- | --- | --- |
| 1 | $0.5$ | 0.5 | $1/2$ |
| 2 | $0.5 \times 0.5$ | 0.25 | $1/4$ |
| 3 | $0.25 \times 0.5$ | 0.125 | $1/8$ |
| 5 | $0.125 \times 0.5 \times 0.5$ | 0.03125 | $1/32$ |
| 10 | $0.03125 \times 0.03125$ | 0.0009765625 | $1/1{,}024$ |
| 20 | $0.0009765625 \times 0.0009765625$ | 0.00000095367 | $1/1{,}048{,}576$ |

10 층 줄은 0.5 를 5 번 곱한 $0.5^5 = 0.03125$ 를 한 번 더 곱해 계산했는데, 0.5 를 5 번 곱하고 또 5 번 곱하면 모두 10 번 곱한
것이기 때문이다. 20 층 줄도 같은 방법으로 $0.5^{10}$ 을 두 번 곱했다.

0.5 를 20 번 곱하면 약 0.00000095, 곧 약 100만 분의 1 이 된다. 출력 쪽에서 gradient 가 1 이었다면 20 층 아래의 입력 쪽에는 100만
분의 1 만 도착한다. 이렇게 gradient 가 층을 거꾸로 지나며 거의 0 이 되는 현상을 vanishing gradient(사라지는 gradient)라고 한다.

숫자만 바꿔 sigmoid 를 지나는 경우를 보자. Backpropagation 강의에서 sigmoid 의 기울기는 아무리 커도 0.25 였다. 20 층 모두에서
가장 큰 기울기 0.25 를 얻는다고 해도 $0.25^{20} \approx 0.0000000000009$ 로, 1 조 분의 1 보다 작다. 기호 $\approx$ 는 "약" 이라고 읽는다.

**확인 문제.** 층마다 0.5 를 곱하는 망이 4 층이면 입력에 도착하는 gradient 는 출력의 몇 분의 1 일까?

<details><summary>답 보기</summary>

$0.5^4 = 0.0625 = 1/16$ 이라 16 분의 1 이다.

</details>

### 앞쪽 층의 학습 속도

gradient 가 작으면 그 층의 weight 는 거의 고쳐지지 않는다. gradient descent 에서 parameter 를 한 번 고치는 일(update)은

$$
w \leftarrow w - \eta \times g
$$

였다. $w$ 는 고칠 weight, $g$ 는 그 weight 의 gradient, $\eta$ 는 eta(에타)라고 읽는 learning rate 다. 식은 "weight 에서 learning
rate 곱하기 gradient 를 빼서 새 weight 로 삼는다" 로 읽는다. 기호 $\leftarrow$ 는 오른쪽 값을 왼쪽에 새로 넣는다는 뜻이다.

20 층 망의 맨 위 층 weight 의 gradient 가 2 라고 하자. 맨 아래 층 weight 의 gradient 는 19 층을 거꾸로 지나며 0.5 가 19 번 곱해져
$2 \times 0.5^{19} \approx 0.0000038$ 이 된다. 층 하나의 weight gradient 는 그 층에 도착한 gradient 에 그 층의 입력을 곱한 값이라,
도착한 gradient 가 작으면 weight gradient 도 함께 작아진다. 여기서는 두 층의 입력 크기가 같다고 두고 계산한다.

| 층 | gradient $g$ | $\eta = 0.1$ 일 때 한 번 고치는 양 $\eta g$ |
| --- | --- | --- |
| 맨 위 층 | 2 | 0.2 |
| 맨 아래 층 | 0.0000038 | 0.00000038 |

맨 위 층이 한 번에 0.2 만큼 움직일 때 맨 아래 층은 0.00000038 만큼 움직인다. 맨 아래 층이 0.2 만큼 움직이려면 같은 update 를
$0.5^{19}$ 의 역수, 곧 $2^{19} = 524{,}288$ 번 되풀이해야 한다. 역수는 1 을 그 수로 나눈 값이다. 입력에 가까운 층은 사진의 선과
모서리를 찾는 filter 를 배워야 하는 자리인데, 그 층이 학습 내내 거의 처음 값에 머문다.

**흔한 오해.** "gradient 가 작으면 learning rate 를 키우면 된다" 고 생각하기 쉽다. learning rate 는 모든 층에 똑같이 곱해지므로,
맨 아래 층에 맞춰 52만 배로 키우면 맨 위 층은 한 번에 $0.2 \times 524{,}288 \approx 10$ 만 만큼 튀어 버린다.
[Linear Regression](../linear-regression/README.md) 에서 본 것처럼 learning rate 가 너무 크면 값이 발산한다.

**확인 문제.** 맨 위 층 gradient 가 4 이고 층마다 0.5 가 곱해지면, 그 아래로 3 층 내려간 층의 gradient 는 얼마이고 $\eta = 0.1$
일 때 한 번 고치는 양은?

<details><summary>답 보기</summary>

$4 \times 0.5^3 = 4 \times 0.125 = 0.5$ 이고, 한 번 고치는 양은 $0.1 \times 0.5 = 0.05$ 다.

</details>

### 1 보다 큰 수와 1 근처의 수

곱하는 수가 1 보다 크면 반대 일이 생긴다. 층마다 2 를 곱하면 20 층 뒤에는 $2^{20} = 1{,}048{,}576$ 배가 된다. gradient 가 100만
배로 불어나면 update 한 번에 weight 가 엉뚱한 곳으로 튀는데, 이 현상을 exploding gradient(폭증하는 gradient)라고 한다.

그렇다면 곱하는 수를 1 근처로 맞추면 될 것 같다. [PyTorch Training Loop](../pytorch-mlp/README.md) 의 He 초기화가 바로 이 일을
한다. He 초기화는 weight 의 처음 값 크기를 $\sqrt{2 / n_{\text{in}}}$ 정도로 잡아 층을 지나도 값의 크기가 대략 유지되게 하는
방법이었다. 그런데 1 근처에서 조금만 벗어나도 20 번 곱하면 차이가 커진다.

| 층마다 곱하는 수 | 5 층 | 10 층 | 20 층 |
| --- | --- | --- | --- |
| 0.5 | 0.031 | 0.00098 | 0.00000095 |
| 0.9 | 0.59 | 0.35 | 0.12 |
| 1 | 1 | 1 | 1 |
| 1.1 | 1.61 | 2.59 | 6.73 |
| 2 | 32 | 1,024 | 1,048,576 |

![층마다 0.5, 0.9, 1, 1.1 을 곱할 때 gradient 크기가 층 수에 따라 바뀌는 모습. 0.5 는 몇 층 만에 0 에 붙고, 0.9 는 20 층에서 0.12, 1.1 은 20 층에서 6.73 이 된다. 1 만 끝까지 1 로 남는다](figures/power-curves.svg)

위 그림의 가로축은 층 수, 세로축은 입력까지 전해진 gradient 의 크기다. 1 에서 0.1 만 벗어나도 20 층 뒤에는 0.12 나 6.73 이 되고,
1 을 그대로 곱할 때만 끝까지 1 이 남는다. 실제 망에서 층마다 곱해지는 수는 weight 와 입력에 따라 매번 달라지므로 모든 층을 정확히
1 로 맞춰 둘 수는 없다.

**확인 문제.** 층마다 1.1 을 곱하는 10 층 망과 0.9 를 곱하는 10 층 망에서, 입력에 도착하는 gradient 는 각각 약 몇 배일까?

<details><summary>답 보기</summary>

표에서 $1.1^{10} \approx 2.59$ 배, $0.9^{10} \approx 0.35$ 배다. 같은 0.1 차이인데 하나는 커지고 하나는 작아진다.

</details>

### 초기화와 normalization 으로 막는 범위

He 초기화와 뒤에서 다룰 batch normalization 을 함께 쓰면 층마다 곱해지는 수가 1 에서 크게 벗어나지 않아서, 층이 수십 개인 망도
학습이 시작은 된다. ResNet 논문의 plain network 실험도 이 둘을 모두 쓴 망이었다. 논문은 이 plain 망에서 gradient 크기가 정상
범위였는데도 34 층 망의 training error 가 18 층보다 높았다고 보고하고, 깊은 plain 망은 좋은 상태로 다가가는 속도 자체가 아주
느린 것 같다고 추측했다.

gradient 의 크기는 초기화와 normalization 으로 어느 정도 지킬 수 있지만, 그것만으로는 깊은 plain 망이 얕은 망만큼도 학습되지
않는다. 다음 섹션의 residual connection 은 identity 를 학습하기 쉽게 만들고 gradient 가 weight 를 거치지 않고 지나가는 길을 따로
열어, 두 문제를 함께 다룬다.

**요약**

- chain rule 때문에 입력 쪽 gradient 는 층마다의 비율을 모두 곱한 값이다. 층마다 0.5 면 20 층 뒤에 $0.5^{20} \approx$ 100만 분의 1 이다
- 1 보다 작은 수를 계속 곱하면 vanishing gradient, 1 보다 큰 수를 곱하면 exploding gradient 가 생기고, 1 근처의 0.9·1.1 도 20 번
  곱하면 0.12·6.73 이 된다
- 초기화와 normalization 으로 gradient 크기를 어느 정도 지켜도 깊은 plain 망의 degradation 은 남는다

## residual connection

### 입력을 출력에 더하는 연결

He 등은 층 몇 개를 묶은 덩어리(block)의 출력에 그 block 의 입력을 그대로 더했다.

$$
y = \mathcal F(x) + x
$$

$x$ 는 block 의 입력, $\mathcal F$ 는 block 안의 층들이 계산하는 함수, $y$ 는 block 의 출력이다. $\mathcal F$ 는 필기체 F 로,
"에프" 라고 읽는다. 식은 "입력 $x$ 를 block 의 층들에 넣어 $\mathcal F(x)$ 를 계산하고, 거기에 입력 $x$ 를 그대로 더해 출력으로
낸다" 로 읽는다.

숫자로 보면 $x = 2$ 이고 block 의 층들이 $\mathcal F(x) = 0.3$ 을 냈다면 출력은 $y = 0.3 + 2 = 2.3$ 이다. 같은 층들을 plain 망처럼
쓰면 출력은 $\mathcal F(x) = 0.3$ 뿐이다.

입력 $x$ 가 block 의 층들을 건너뛰어 출력의 덧셈까지 곧장 가는 길을 shortcut connection 또는 skip connection 이라고 하고, 이런
연결을 residual connection 이라고 부른다. residual connection 이 있는 block 을 residual block, residual block 을 쌓은 망을
ResNet(Residual Network)이라고 한다.

residual 은 "남은 것, 차이" 라는 뜻이다. block 이 내야 할 출력을 $H$ 라고 하면 $\mathcal F(x) = H - x$ 이므로, 층들이 배우는 것은
출력 전체가 아니라 입력과 출력의 차이다. 위 예에서 출력이 2.3 이어야 한다면 층들은 2.3 전체가 아니라 차이 0.3 만 내면 된다.
[Linear Regression](../linear-regression/README.md) 에서 예측과 정답의 차이를 residual(오차)이라고 불렀던 것과 같은 단어로, 두
곳 모두 "두 값의 차이" 를 가리킨다.

**확인 문제.** $x = 5$ 이고 block 의 층들이 $\mathcal F(x) = -1$ 을 냈다. residual block 과 plain block 의 출력은 각각 얼마일까?

<details><summary>답 보기</summary>

residual block 은 $-1 + 5 = 4$, plain block 은 $\mathcal F(x) = -1$ 이다.

</details>

### 아무 일도 하지 않는 block

앞에서 깊은 망이 얕은 망을 흉내 내려면 남는 층들이 identity 가 되면 된다고 했다. residual connection 은 이 identity 를 학습하기
아주 쉽게 만든다.

계산을 간단히 하려고 block 의 층들을 weight 하나짜리 $\mathcal F(x) = w x$ 로 두자. weight 는 학습 전에 0.05 처럼 0 근처의 작은
random(무작위) 값으로 시작한다.

| block | 출력 | identity 가 되는 $w$ | 처음 $w = 0.05$ 에서의 거리 |
| --- | --- | --- | --- |
| plain | $y = w x$ | $w = 1$ | $1 - 0.05 = 0.95$ |
| residual | $y = w x + x$ | $w = 0$ | $0.05 - 0 = 0.05$ |

plain block 이 identity 가 되려면 weight 가 0.05 에서 1 까지 0.95 만큼 움직여야 한다. residual block 은 $w = 0$ 이면
$y = 0 + x = x$ 로 이미 identity 이고, 처음 값 0.05 는 거기서 0.05 만큼밖에 떨어져 있지 않다.

![plain block 은 w = 1 이 identity 라서 처음 값 0.05 에서 0.95 만큼 가야 하고, residual block 은 w = 0 이 identity 라서 0.05 만큼만 가면 된다](figures/identity-distance.svg)

실제 block 은 weight 하나가 아니라 conv 층 두 개와 ReLU(음수를 0 으로 바꾸는 계산)로 되어 있어서, plain block 이 정확히 identity 를 흉내 내기는 위 예보다
훨씬 어렵다. 반면 residual block 은 층의 weight 를 모두 0 쪽으로 보내기만 하면 identity 가 된다. 그래서 residual block 을 쌓은 망은
처음부터 "입력을 거의 그대로 전하는 망" 에서 출발해 필요한 차이만 조금씩 배운다. He 등은 학습을 마친 ResNet 의 $\mathcal F$ 출력이
plain 망의 층 출력보다 대체로 작다는 것을 측정해, block 들이 실제로 입력을 조금씩만 고친다는 것을 보였다.

**확인 문제.** residual block $y = w x + x$ 에서 $w = 0$ 일 때 $x = 7$ 을 넣으면 출력은? plain block $y = w x$ 에서 $w = 0$ 이면?

<details><summary>답 보기</summary>

residual block 은 $0 \times 7 + 7 = 7$ 로 입력을 그대로 낸다. plain block 은 $0 \times 7 = 0$ 이라 입력의 정보가 모두 사라진다.

</details>

### residual block 의 gradient

이제 gradient 를 비교한다. 두 block 모두 $w = 0.1$ 이고 입력 $x = 2$ 다. 앞의 0.5 층들과 같은 방법으로 $x$ 를 0.01 늘려 본다.

| block | $x = 2$ 일 때 $y$ | $x = 2.01$ 일 때 $y$ | 변화 | 비율 $\frac{\partial y}{\partial x}$ |
| --- | --- | --- | --- | --- |
| plain $y = 0.1\, x$ | 0.2 | 0.201 | 0.001 | $0.001 \div 0.01 = 0.1$ |
| residual $y = 0.1\, x + x$ | 2.2 | 2.211 | 0.011 | $0.011 \div 0.01 = 1.1$ |

plain block 의 비율은 $w = 0.1$ 이고, residual block 의 비율은 $1 + 0.1 = 1.1$ 이다.

Backpropagation 강의의 규칙으로도 같은 답이 나온다. residual block 에서 $x$ 는 두 곳에 쓰인다. 하나는 $\mathcal F$ 로 들어가는
길이고, 다른 하나는 덧셈으로 곧장 가는 shortcut 이다. 한 값이 여러 곳에 쓰이면 길마다의 gradient 를 더한다는 규칙이 있었다.

- shortcut 길: 덧셈의 local derivative(연산 하나의 입력을 조금 바꿨을 때 그 연산의 출력이 변하는 비율)는 1 이라 이 길의 비율은 1 이다
- $\mathcal F$ 길: $\mathcal F(x) = 0.1\, x$ 의 비율 0.1 에 덧셈의 1 을 곱해 0.1 이다

두 길을 더하면 $1 + 0.1 = 1.1$ 이다. 일반식으로 쓰면

$$
\frac{\partial y}{\partial x} = 1 + \frac{\partial \mathcal F}{\partial x}
$$

이고, "residual block 의 비율은 1 에 block 층들의 비율을 더한 값" 으로 읽는다. 앞의 예에서 $\frac{\partial \mathcal F}{\partial x}$
는 $w = 0.1$ 이었다.

![같은 w = 0.1 인 plain block 과 residual block. x = 2 를 넣으면 plain 은 0.2, residual 은 0.2 + 2 = 2.2 를 낸다. backward 에서 plain 은 gradient 에 0.1 을 곱하고, residual 은 shortcut 길의 1 과 F 길의 0.1 을 더한 1.1 을 곱한다](figures/residual-nudge.svg)

위 그림의 아래쪽처럼 residual block 에서는 gradient 가 shortcut 을 따라 weight 와 상관없이 1 로 지나간다. block 층들의 weight 가
작아서 $\mathcal F$ 길의 비율이 0.1 이나 0.01 이 되어도 shortcut 의 1 은 그대로 남는다.

**확인 문제.** residual block $y = w x + x$ 에서 $w = -0.2$ 이면 $\frac{\partial y}{\partial x}$ 는? 같은 $w$ 의 plain block 은?

<details><summary>답 보기</summary>

residual block 은 $1 + (-0.2) = 0.8$, plain block 은 $-0.2$ 다.

</details>

### 두 block 을 지나는 gradient 의 길

residual block 두 개를 이어 본다. 첫 block 의 weight 를 $a$, 둘째 block 의 weight 를 $b$ 라고 하면

$$
x_1 = a\, x_0 + x_0, \qquad x_2 = b\, x_1 + x_1
$$

이다. $x_0$ 은 입력, $x_1$ 은 첫 block 의 출력, $x_2$ 는 둘째 block 의 출력이다. chain rule 로 block 마다의 비율을 곱하면

$$
\frac{\partial x_2}{\partial x_0} = (1 + b) \times (1 + a)
$$

이다. 괄호를 풀면 한 줄에 한 단계씩

$$
\begin{aligned}
(1 + b)(1 + a) &= 1 \times (1 + a) + b \times (1 + a) \\
&= 1 + a + b + ab
\end{aligned}
$$

이 된다. 네 항은 gradient 가 지나는 길 네 개에 하나씩 대응한다.

| 항 | 지나는 길 | $a = b = 0.1$ 일 때 |
| --- | --- | --- |
| $1$ | 두 block 모두 shortcut | 1 |
| $a$ | 첫 block 은 $\mathcal F$, 둘째는 shortcut | 0.1 |
| $b$ | 첫 block 은 shortcut, 둘째는 $\mathcal F$ | 0.1 |
| $ab$ | 두 block 모두 $\mathcal F$ | 0.01 |

합은 $1 + 0.1 + 0.1 + 0.01 = 1.21$ 이고, $(1.1) \times (1.1) = 1.21$ 과 같다. 숫자로 검산하면 $x_0 = 2$ 일 때 $x_1 = 2.2$,
$x_2 = 2.42$ 이고, $x_0 = 2.01$ 일 때 $x_1 = 2.211$, $x_2 = 2.4321$ 이라 비율은 $0.0121 \div 0.01 = 1.21$ 이다.

![residual block 두 개를 지나는 gradient 의 길 네 개. 두 shortcut 을 모두 타는 길은 1, F 를 하나만 지나는 두 길은 0.1 씩, F 를 둘 다 지나는 길은 0.01 이고 모두 더하면 1.21 이다](figures/residual-paths.svg)

위 그림의 맨 위 길은 weight 를 하나도 거치지 않는다. plain 망이었다면 gradient 가 지나는 길은 맨 아래 $ab = 0.01$ 하나뿐이다.
block 이 $n$ 개면 길은 $2^n$ 개로 늘어나고, 그중 모든 shortcut 을 타는 길 하나가 언제나 1 을 그대로 전한다. 2016년 He 등은 후속
논문 Identity Mappings in Deep Residual Networks 에서 이 성질을 식으로 정리해, 출력 쪽 gradient 가 어떤 block 에든 곧장 전해진다는
것을 보였다.

**확인 문제.** $a = 0.2$, $b = -0.1$ 이면 두 block 을 지나는 비율은? 네 길로 나눠 더해 보라.

<details><summary>답 보기</summary>

$1 + a + b + ab = 1 + 0.2 - 0.1 - 0.02 = 1.08$ 이다. $(1 - 0.1) \times (1 + 0.2) = 0.9 \times 1.2 = 1.08$ 로 검산된다.

</details>

### 20 block 의 비교

block 을 20 개 이어 plain 망과 비교한다. 모든 block 의 weight 가 같은 값 $w$ 라고 하면 plain 망의 비율은 $w^{20}$, residual 망의
비율은 $(1 + w)^{20}$ 이다.

| block 의 weight $w$ | plain 망 $w^{20}$ | residual 망 $(1 + w)^{20}$ |
| --- | --- | --- |
| 0.1 | $0.1^{20}$ = 0.00000000000000000001 | $1.1^{20} \approx 6.73$ |
| $-0.1$ | $(-0.1)^{20}$ = 0.00000000000000000001 | $0.9^{20} \approx 0.12$ |
| 0 | 0 | $1^{20} = 1$ |
| 0.1 과 $-0.1$ 을 번갈아 | 0.00000000000000000001 | $(1.1 \times 0.9)^{10} \approx 0.90$ |

plain 망에서는 weight 가 0.1 정도로 작으면 20 block 뒤에 gradient 가 소수점 아래 스무 번째 자리에서야 1 이 나오는 수가 된다. residual 망은
block 층들이 아무것도 배우지 않은 $w = 0$ 에서도 1 을 그대로 전하고, weight 가 $\pm 0.1$ 정도인 범위에서는 0.12 와 6.73 사이에 머문다.
마지막 줄처럼 block 마다 $\mathcal F$ 의 비율이 양수와 음수로 섞이면 곱은 1 근처에 남는다. 앞쪽 block 이 받는 gradient 가 출력 쪽과
비슷한 크기라서, 20 block 아래의 층도 위쪽 층과 비슷한 속도로 배운다.

**흔한 오해.** "residual connection 이 있으면 gradient 가 언제나 정확히 1 이다" 고 생각하기 쉽다. block 하나의 비율은
$1 + \frac{\partial \mathcal F}{\partial x}$ 이라 1 에서 조금씩 벗어나고, 위 표처럼 20 번 곱하면 0.12 나 6.73 이 될 수도 있다.
residual connection 이 보장하는 것은 weight 를 거치지 않는 길이 하나 있다는 것이고, 그 덕분에 plain 망처럼 $10^{-20}$ 까지 줄어드는
일이 생기지 않는다. $10^{-20}$ 은 1 을 10 으로 20 번 나눈 수다.

**확인 문제.** block 3 개의 weight 가 모두 0.5 다. plain 망과 residual 망에서 입력까지 전해지는 비율은 각각?

<details><summary>답 보기</summary>

plain 망은 $0.5^3 = 0.125$, residual 망은 $1.5^3 = 1.5 \times 1.5 \times 1.5 = 3.375$ 다.

</details>

### block 안 weight 의 gradient

입력 쪽으로 gradient 가 잘 전해지면 앞쪽 block 의 weight 도 잘 배운다. 두 block 망에서 첫 block 의 weight $a$ 의 gradient 를
비교한다. $x_0 = 2$, $a = b = 0.1$ 이다.

| 망 | 식 | $a$ 를 0.01 늘렸을 때 | 비율 $\frac{\partial x_2}{\partial a}$ |
| --- | --- | --- | --- |
| plain | $x_2 = b \times (a\, x_0)$ | 0.02 → 0.022 | $0.002 \div 0.01 = 0.2$ |
| residual | $x_2 = (1 + b) \times (a\, x_0 + x_0)$ | 2.42 → 2.442 | $0.022 \div 0.01 = 2.2$ |

chain rule 로 쓰면 plain 은 "$a$ → $x_1$" 의 비율 $x_0 = 2$ 에 "$x_1$ → $x_2$" 의 비율 $b = 0.1$ 을 곱한 0.2, residual 은 같은
$x_0 = 2$ 에 $1 + b = 1.1$ 을 곱한 2.2 다. 첫 block 위에 block 이 하나만 더 있어도 residual 쪽의 gradient 가 11 배 크고, 위에 쌓인
block 이 많을수록 차이는 더 벌어진다.

**확인 문제.** 위 표에서 $b = 0.5$ 로 바꾸면 plain 과 residual 의 $\frac{\partial x_2}{\partial a}$ 는 각각?

<details><summary>답 보기</summary>

plain 은 $x_0 \times b = 2 \times 0.5 = 1$, residual 은 $x_0 \times (1 + b) = 2 \times 1.5 = 3$ 이다.

</details>

**요약**

- residual block 은 $y = \mathcal F(x) + x$ 로 block 층들의 출력에 입력을 그대로 더하고, 층들은 입력과 출력의 차이만 배운다
- block 층들의 weight 가 0 이면 identity 가 되어서, 0 근처에서 시작하는 weight 로 identity 를 쉽게 학습한다
- block 하나의 gradient 비율은 $1 + \frac{\partial \mathcal F}{\partial x}$ 이다. 두 block 이면 $1 + a + b + ab$ 의 네 길로 나뉘고, weight
  를 거치지 않는 길이 언제나 1 을 전한다

## batch normalization

ResNet 의 block 안에는 conv 층마다 batch normalization 이라는 계산이 붙는다. batch 는 학습 때 한 번에 함께 계산하는 사진 묶음이고,
이 계산은 batch 안의 값들로 평균과 퍼진 정도를 구해 쓰기 때문에 이런 이름이 붙었다. 줄여서 BatchNorm 또는 BN 이라고 부르고,
2015년 Sergey Ioffe 와 Christian Szegedy 가 발표했다.

### 층마다 달라지는 값의 크기

어떤 conv 층의 한 channel 이 사진 4 장을 받아 낸 값이 1, 2, 3, 6 이라고 하자. channel 은 [CNN](../cnn/README.md) 에서 본 것처럼
feature map 한 장이고, 여기서는 사진마다 그 channel 의 값 하나씩을 뽑아 본 것이다. 학습이 진행되어 이 층의 weight 가 10 배로 커지면
같은 사진에서 10, 20, 30, 60 이 나온다.

이 값을 받는 다음 층 입장에서는 입력의 크기가 학습 도중에 10 배로 바뀐다. 다음 층은 방금 전의 입력 크기에 맞춰 weight 를
고쳐 왔는데, 앞 층이 바뀌면서 그 맞춤이 어긋난다. 층이 많을수록 이런 어긋남이 겹겹이 쌓여 학습이 느려지고, learning rate 를 작게
잡아야 한다. Ioffe 와 Szegedy 는 이렇게 앞 층이 학습되면서 다음 층이 받는 값들의 퍼져 있는 모양(분포)이 계속 바뀌는 현상을 internal covariate
shift 라고 불렀다.

batch normalization 은 층마다 값을 받아 평균이 0, 퍼진 정도가 1 이 되도록 다시 맞춘 뒤 다음 층에 넘긴다. 그러면 1, 2, 3, 6 과
10, 20, 30, 60 이 똑같은 값이 되어, 앞 층의 크기가 바뀌어도 다음 층이 받는 값의 크기는 일정하다. 이렇게 값을 정해진 크기로 맞추는
계산을 normalization(정규화)이라고 한다.

### 분산과 표준편차

평균은 숫자를 모두 더해 개수로 나눈 값이다. 퍼진 정도는 분산과 표준편차로 잰다.

분산은 "값마다 평균에서 떨어진 거리를 제곱해 평균한 값" 이다. 2, 2, 6, 6 으로 계산하면 아래와 같다.

| 값 | 평균 | 평균에서 뺀 값 | 제곱 |
| --- | --- | --- | --- |
| 2 | 4 | $-2$ | 4 |
| 2 | 4 | $-2$ | 4 |
| 6 | 4 | 2 | 4 |
| 6 | 4 | 2 | 4 |

평균은 $(2 + 2 + 6 + 6) \div 4 = 16 \div 4 = 4$ 이고, 분산은 제곱 네 개의 평균 $(4 + 4 + 4 + 4) \div 4 = 4$ 다. 평균에서 뺀 값을
그냥 평균하면 $-2, -2, 2, 2$ 가 서로 지워져 0 이 되므로, [Linear Regression](../linear-regression/README.md) 의 MSE 처럼 제곱해서
부호를 없앤 뒤 평균한다.

표준편차는 분산의 제곱근이다. 제곱근 $\sqrt{\ }$ 은 "제곱해서 그 수가 되는 양수" 라서 $\sqrt{4} = 2$ 다. 분산은 제곱한 값의
평균이라 단위가 제곱으로 커져 있는데, 제곱근을 씌우면 원래 값과 같은 단위로 돌아와 "값들이 평균에서 대략 2 만큼 떨어져 있다" 로
읽을 수 있다.

숫자만 바꿔 1, 2, 3, 6 으로 하면 평균은 $12 \div 4 = 3$, 평균에서 뺀 값은 $-2, -1, 0, 3$, 제곱은 4, 1, 0, 9 이고 분산은
$14 \div 4 = 3.5$, 표준편차는 $\sqrt{3.5} \approx 1.871$ 이다.

기호로는 평균을 $\mu$, 분산을 $\sigma^2$, 표준편차를 $\sigma$ 로 쓴다. $\mu$ 는 그리스 문자 mu(뮤), $\sigma$ 는 sigma(시그마)의
소문자다. [Backpropagation](../autograd/README.md) 에서 sigmoid 를 $\sigma$ 로 썼던 것과는 다른 뜻이다.

**확인 문제.** 1, 3, 5, 7 의 평균과 분산은?

<details><summary>답 보기</summary>

평균은 $16 \div 4 = 4$ 다. 평균에서 뺀 값은 $-3, -1, 1, 3$, 제곱은 9, 1, 1, 9 라 분산은 $20 \div 4 = 5$ 다.

</details>

### 정규화 계산

값마다 평균을 빼고 표준편차로 나누면 평균 0, 분산 1 인 값이 된다.

$$
\hat x = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}}
$$

$x$ 는 원래 값, $\mu$ 는 평균, $\sigma^2$ 은 분산, $\hat x$ 는 "엑스 햇" 이라고 읽는 정규화한 값이다. $\epsilon$ 은 epsilon(엡실론)
으로, 분산이 0 일 때 0 으로 나누는 일을 막으려고 더하는 아주 작은 수다. 보통 0.00001 을 쓰고 손 계산에서는 0 으로 둔다. 식은
"값에서 평균을 빼고, 분산에 작은 수를 더해 제곱근을 씌운 값으로 나눈다" 로 읽는다.

2, 2, 6, 6 은 평균 4, 표준편차 2 라서 $\hat x$ 는 $(2 - 4) \div 2 = -1$, $-1$, $(6 - 4) \div 2 = 1$, $1$ 이다.

1, 2, 3, 6 과 10, 20, 30, 60 을 나란히 계산하면 아래와 같다.

| 원래 값 | 평균 | 표준편차 | $\hat x$ |
| --- | --- | --- | --- |
| 1, 2, 3, 6 | 3 | $\sqrt{3.5} \approx 1.871$ | $-1.069$, $-0.535$, 0, 1.604 |
| 10, 20, 30, 60 | 30 | $\sqrt{350} \approx 18.71$ | $-1.069$, $-0.535$, 0, 1.604 |

첫 줄의 1 은 $(1 - 3) \div 1.871 \approx -1.069$ 이고, 둘째 줄의 10 은 $(10 - 30) \div 18.71 \approx -1.069$ 다. 값이 모두 10 배가
되면 평균과 표준편차도 10 배가 되어 나눗셈에서 지워지기 때문에, 정규화한 결과는 똑같다.

![1, 2, 3, 6 과 그 10 배인 10, 20, 30, 60 은 수직선 위에서 크기가 전혀 다르지만, 평균을 빼고 표준편차로 나누면 둘 다 −1.069, −0.535, 0, 1.604 가 된다. γ = 2, β = 1 을 입히면 −1.14, −0.07, 1, 4.21 이 된다](figures/batchnorm-steps.svg)

위 그림의 위 두 줄이 원래 값, 가운데 줄이 정규화한 값이다. 다음 층은 앞 층의 weight 가 10 배로 바뀌어도 가운데 줄의 값을 받는다.

**확인 문제.** 0, 4, 4, 8 을 정규화하면? (평균과 분산부터 구한다. $\sqrt{8} \approx 2.83$ 이다)

<details><summary>답 보기</summary>

평균은 $16 \div 4 = 4$, 평균에서 뺀 값은 $-4, 0, 0, 4$, 제곱은 16, 0, 0, 16 이라 분산은 $32 \div 4 = 8$ 이다. 표준편차 2.83 으로
나누면 $-1.41$, 0, 0, 1.41 이다.

</details>

### γ 와 β

모든 층의 값을 언제나 평균 0, 분산 1 로 묶어 두면 망이 표현할 수 있는 것이 줄어든다. 어떤 층은 값이 더 넓게 퍼져야 하거나 평균이
0 이 아니어야 더 잘 작동할 수 있다. 그래서 정규화한 값에 학습하는 숫자 두 개를 다시 입힌다.

$$
y = \gamma\, \hat x + \beta
$$

$\gamma$ 는 gamma(감마), $\beta$ 는 beta(베타)라고 읽는다. 식은 "정규화한 값에 $\gamma$ 를 곱하고 $\beta$ 를 더한다" 로 읽는다.
$\gamma$ 는 퍼진 정도를, $\beta$ 는 평균 위치를 정하고, 둘 다 weight 처럼 gradient descent 로 학습하는 parameter 다. 처음 값은
$\gamma = 1$, $\beta = 0$ 이라 학습 초기에는 정규화한 값이 그대로 나간다.

$\gamma = 2$, $\beta = 1$ 이면 2, 2, 6, 6 의 $\hat x$ 인 $-1, -1, 1, 1$ 은 $2 \times (-1) + 1 = -1$, $-1$, $2 \times 1 + 1 = 3$, $3$ 이
된다. 평균은 1, 표준편차는 2 로 바뀌었다. $\gamma$ 가 원래 표준편차 2, $\beta$ 가 원래 평균 4 를 배우면 $\hat x$ 는
$2 \times (-1) + 4 = 2$ 와 $2 \times 1 + 4 = 6$ 으로 원래 값 2, 2, 6, 6 이 그대로 돌아온다. 그래서 정규화가 해로운 층이라면 망이
스스로 정규화를 되돌릴 수 있다.

**확인 문제.** $\hat x = -1, 0, 1$ 에 $\gamma = 3$, $\beta = -2$ 를 입히면?

<details><summary>답 보기</summary>

$3 \times (-1) - 2 = -5$, $3 \times 0 - 2 = -2$, $3 \times 1 - 2 = 1$ 이다.

</details>

### channel 마다 모으는 값

conv 층의 출력은 batch 의 사진마다 feature map 여러 장이다. batch 크기 $N$, channel
수 $C$, feature map 의 세로 $H$·가로 $W$ 로 쓰면 출력 숫자의 개수는 $N \times C \times H \times W$ 다.

BatchNorm 은 평균과 분산을 channel 하나마다 따로 구하는데, 이때 batch 의 모든 사진과 feature map 의 모든 칸을 한데 모은다. 한
channel 에서 모으는 값의 개수는 $N \times H \times W$ 이고, $\mu$ 와 $\sigma^2$ 은 channel 수만큼 $C$ 개씩 나온다. $\gamma$ 와 $\beta$
도 channel 마다 하나씩이다.

사진 2 장, channel 2 장, 2×2 feature map 이면 0 번 channel 에서 모으는 값은 사진마다 4 칸씩 $2 \times 2 \times 2 = 8$ 개다.

![사진 2 장이 각각 channel 2 장의 2×2 feature map 을 낸다. 0 번 channel 의 평균과 분산은 두 사진의 0 번 channel 8 칸을 모아 구하고(평균 4, 분산 4), 1 번 channel 은 따로 구한다](figures/bn-channel.svg)

위 그림에서 0 번 channel 의 8 칸은 2 와 6 이 네 개씩이라 평균 4, 분산 4 이고, 정규화하면 2 는 $-1$, 6 은 1 이 된다. 1 번 channel 은
자기 8 칸만으로 따로 평균과 분산을 구한다. channel 마다 따로 하는 이유는 channel 마다 찾는 특징이 달라 값의 크기도 제각각이기
때문이다.

**확인 문제.** batch 크기 32, channel 64, 56×56 feature map 에 BatchNorm 을 걸면 channel 하나의 평균을 구할 때 몇 개의 값을 쓰고,
$\gamma$ 는 모두 몇 개일까?

<details><summary>답 보기</summary>

$32 \times 56 \times 56 = 32 \times 3{,}136 = 100{,}352$ 개 값으로 평균을 구한다. $\gamma$ 는 channel 마다 하나라 64 개다.

</details>

### 학습 때와 평가 때의 통계

학습 때는 batch 마다 그 batch 의 평균과 분산으로 정규화한다. 그런데 학습을 마친 모델을 로봇에서 쓸 때는 카메라 사진이 한 장씩
들어온다. 사진 한 장의 한 channel 에 값이 하나만 있다고 하면 그 값이 곧 평균이라 분산이 0 이고, 정규화한 값은
$(5 - 5) \div \sqrt{0 + \epsilon} = 0$ 처럼 언제나 0 이 된다. 어떤 사진을 넣어도 같은 값이 나와서 모델이 아무것도 구별하지 못한다.

그래서 학습하는 동안 batch 의 평균과 분산을 moving average 로 따로 쌓아 두고, 평가 때는 그 값을 쓴다. moving average 는
[PyTorch Training Loop](../pytorch-mlp/README.md) 에서 본, 지난 평균과 새 값을 일정 비율로 섞어 새 평균으로 삼는 계산이다.
BatchNorm 은 새 값을 10% 섞는다.

$$
\mu_{\text{run}} \leftarrow 0.9\, \mu_{\text{run}} + 0.1\, \mu_{\mathcal B}
$$

$\mu_{\text{run}}$ 은 쌓아 둔 평균(running mean), $\mu_{\mathcal B}$ 는 이번 batch 의 평균이다. 아래첨자 $\mathcal B$ 는 batch 를
뜻한다. 식은 "쌓아 둔 평균을 90%, 이번 batch 평균을 10% 섞어 새로 쌓는다" 로 읽는다. 분산도 같은 방법으로 쌓는다.

running mean 이 0 에서 시작하고 batch 평균이 3, 5, 4 로 들어오면 아래와 같다.

| batch | $\mu_{\mathcal B}$ | 계산 | 새 $\mu_{\text{run}}$ |
| --- | --- | --- | --- |
| 1 | 3 | $0.9 \times 0 + 0.1 \times 3$ | 0.3 |
| 2 | 5 | $0.9 \times 0.3 + 0.1 \times 5 = 0.27 + 0.5$ | 0.77 |
| 3 | 4 | $0.9 \times 0.77 + 0.1 \times 4 = 0.693 + 0.4$ | 1.093 |

처음에는 0 에서 출발한 탓에 실제 평균 4 근처보다 작지만, batch 를 수천 번 거치면 데이터 전체의 평균에 가까워진다. PyTorch 는 이
섞는 비율 0.1 을 BatchNorm 의 momentum 이라 부르는데, optimizer 의 momentum 과는 이름만 같은 다른 숫자다.

평가 때는 batch 의 통계 대신 이렇게 쌓아 둔 $\mu_{\text{run}}$ 과 분산을 고정해 쓰므로, 사진 한 장을 넣어도 정규화가 제대로 된다.
학습 때와 평가 때 계산이 달라서 모델을 쓰기 전에는 평가 모드로 바꿔야 하고, 바꾸지 않으면 같은 사진에도 batch 에 따라 다른 답이
나온다.

**확인 문제.** running mean 이 2 이고 이번 batch 평균이 12 면 새 running mean 은?

<details><summary>답 보기</summary>

$0.9 \times 2 + 0.1 \times 12 = 1.8 + 1.2 = 3$ 이다.

</details>

### 작은 batch 의 문제

batch 가 작으면 batch 의 평균과 분산이 그때그때 크게 흔들린다. 극단적으로 사진 2 장에 값이 하나씩이면 정규화 결과는 값이 무엇이든
$-1$ 과 1 이다.

| batch 의 두 값 | 평균 | 분산 | $\hat x$ |
| --- | --- | --- | --- |
| 1, 3 | 2 | 1 | $-1$, 1 |
| 100, 102 | 101 | 1 | $-1$, 1 |

1 과 100 은 크기가 전혀 다른데 둘 다 $-1$ 이 됐다. 같은 사진이라도 batch 에 어떤 사진이 함께 들어왔는지에 따라 정규화한 값이
바뀐다는 뜻이다. batch 가 클수록 평균과 분산이 데이터 전체의 값에 가까워져 이 흔들림이 줄어든다. 로봇 학습은 사진이 크고 모델이
여러 개라서 batch 를 8 이나 16 처럼 작게 잡는 일이 많은데, 그래서 로봇 policy 는 BatchNorm 을 다른 계산으로 바꿔 쓰기도 한다. 이
내용은 마지막 섹션에서 다룬다.

![batch 크기에 따른 BatchNorm 의 정규화 결과. batch 가 1 장이면 무엇을 넣어도 0, 2 장이면 무엇을 넣어도 −1 과 1 이 되고, 4 장이면 값의 상대적인 차이가 남는다](figures/bn-batch-size.svg)

위 그림처럼 batch 가 1 장이면 정보가 모두 사라지고, 2 장이면 "둘 중 어느 쪽이 큰가" 만 남는다.

**확인 문제.** batch 의 두 값이 7 과 7 이면 정규화 결과는? ($\epsilon$ 은 아주 작은 양수다)

<details><summary>답 보기</summary>

평균 7, 분산 0 이라 $(7 - 7) \div \sqrt{0 + \epsilon} = 0$ 으로 둘 다 0 이다.

</details>

### bias 를 뺀 conv

[CNN](../cnn/README.md) 에서 conv 층은 filter 마다 bias 를 하나씩 더했다. 그런데 conv 바로 뒤에 BatchNorm 이 오면 bias 는 아무
효과가 없다. 1, 2, 3, 6 에 bias 5 를 더하면 6, 7, 8, 11 이 되는데, 평균도 3 에서 8 로 5 만큼 함께 커지므로 평균을 빼는 순간 bias 가
지워진다. 평균에서 뺀 값은 두 경우 모두 $-2, -1, 0, 3$ 이다. 그래서 ResNet 의 conv 층에는 bias 가 없고, 평균을 옮기는 일은
BatchNorm 의 $\beta$ 가 맡는다.

**요약**

- BatchNorm 은 channel 마다 batch 의 $N \times H \times W$ 개 값으로 평균 $\mu$ 와 분산 $\sigma^2$ 을 구해 $\hat x = (x - \mu) / \sqrt{\sigma^2 + \epsilon}$ 로
  맞춘 뒤, 학습하는 $\gamma$, $\beta$ 로 $y = \gamma \hat x + \beta$ 를 낸다. 1, 2, 3, 6 과 10, 20, 30, 60 은 같은 $\hat x$ 가 된다
- 학습 때는 batch 통계를 쓰면서 running mean 을 $0.9 \times$ 이전 $+ 0.1 \times$ 새 값으로 쌓고, 평가 때는 쌓아 둔 통계를 쓴다
- batch 가 작으면 통계가 흔들린다. 2 장이면 무엇을 넣어도 $-1$, 1 이다

## BasicBlock

ResNet-18 의 residual block 은 3×3 conv 두 개로 된 BasicBlock 이다.

### block 의 계산 순서

BasicBlock 의 $\mathcal F$ 는 아래 순서로 계산하고, 마지막에 입력을 더한다.

1. 3×3 conv (padding 1, stride 1)
2. BatchNorm
3. ReLU
4. 3×3 conv (padding 1, stride 1)
5. BatchNorm
6. 입력 $x$ 를 더한다
7. ReLU

stride 는 filter 를 옮기는 칸 수, padding 은 테두리에 덧대는 0 의 줄 수였다. ReLU 는 [CNN](../cnn/README.md) 에서 본 $\max(0, z)$ 로, 음수를 0 으로 바꾸고 0 이상은 그대로 두는 계산이다. 덧셈 뒤에 ReLU 를 한
번 더 거치는 것이 He 등의 원래 설계다. 식으로 쓰면 $y = \mathrm{ReLU}(\mathcal F(x) + x)$ 다.

padding 1 인 3×3 conv 는 [CNN](../cnn/README.md) 의 출력 크기 공식 $\lfloor (H + 2p - k)/s \rfloor + 1$ 로
$\lfloor (56 + 2 - 3)/1 \rfloor + 1 = 56$ 이라 feature map 크기를 바꾸지 않는다. $\lfloor \cdot \rfloor$ 은 소수점 아래를 버리는
기호다. conv 의 filter 수도 입력 channel 수와 같게 두면 $\mathcal F(x)$ 는 $x$ 와 모양이 똑같다. 64 장짜리 56×56 feature map 이 들어오면
$\mathcal F(x)$ 도 64 장짜리 56×56 이다.

### 원소별 덧셈

$\mathcal F(x) + x$ 는 같은 자리의 숫자끼리 더하는 계산으로, 원소별 덧셈(element-wise addition)이라고 한다. channel 하나의 2×2
feature map 으로 계산하면 아래와 같다.

$$
\mathcal F(x) = \begin{bmatrix} 1 & 0 \\ -1 & 2 \end{bmatrix}, \quad
x = \begin{bmatrix} 3 & 1 \\ 0 & 2 \end{bmatrix}, \quad
\mathcal F(x) + x = \begin{bmatrix} 4 & 1 \\ -1 & 4 \end{bmatrix}
$$

왼쪽 위는 $1 + 3 = 4$, 오른쪽 위는 $0 + 1 = 1$, 왼쪽 아래는 $-1 + 0 = -1$, 오른쪽 아래는 $2 + 2 = 4$ 다. 마지막 ReLU 를 거치면
음수인 $-1$ 만 0 이 되어 $\begin{bmatrix} 4 & 1 \\ 0 & 4 \end{bmatrix}$ 가 block 의 출력이다.

![원소별 덧셈. F(x) 의 2×2 와 입력 x 의 2×2 를 같은 자리끼리 더하면 4, 1, −1, 4 가 되고, ReLU 가 −1 을 0 으로 바꿔 block 출력 4, 1, 0, 4 가 된다](figures/elementwise-add.svg)

같은 자리끼리 더하므로 두 묶음의 모양, 곧 channel 수와 세로·가로 크기가 모두 같아야 한다. identity shortcut 은 더하기 한 번뿐이라
학습할 숫자가 하나도 늘지 않는다.

**확인 문제.** $\mathcal F(x) = \begin{bmatrix} -2 & 1 \\ 0 & -1 \end{bmatrix}$, $x = \begin{bmatrix} 1 & 1 \\ 2 & 3 \end{bmatrix}$
이면 block 출력(ReLU 까지)은?

<details><summary>답 보기</summary>

더하면 $\begin{bmatrix} -1 & 2 \\ 2 & 2 \end{bmatrix}$ 이고, ReLU 가 $-1$ 을 0 으로 바꿔 $\begin{bmatrix} 0 & 2 \\ 2 & 2 \end{bmatrix}$ 다.

</details>

### 모양이 바뀌는 block 의 1×1 conv shortcut

ResNet 은 몇 block 마다 feature map 의 가로세로를 반으로 줄이고 channel 수를 두 배로 늘린다. [CNN](../cnn/README.md) 의 LeNet 이
pooling 으로 "어디에" 정보는 줄이고 conv 로 feature 의 종류는 늘렸던 것과 같은 방향이다. 이런 block 은 첫 conv 를 stride 2 로 하고
filter 를 두 배로 둔다. 64 장짜리 56×56 이 들어오면 $\mathcal F(x)$ 는 128 장짜리 28×28 이 되어, 입력 $x$ 와 모양이 달라서 그대로
더할 수 없다.

이때는 shortcut 에서 $x$ 의 모양을 맞춘다. 1×1 filter 로 하는 conv, 곧 1×1 conv 를 stride 2 로 건다.

1×1 conv 는 filter 가 한 칸짜리라 이웃 칸을 보지 않고, 한 칸에 쌓인 channel 값들만 weight 로 곱해 더한다. 입력이 2 channel 이고
어느 칸의 두 channel 값이 3 과 1 이라고 하자. filter 의 weight 가 2 와 $-1$ 이면 그 칸의 출력은 $2 \times 3 + (-1) \times 1 = 5$
다. weight 가 1 과 1 인 filter 를 하나 더 두면 같은 칸에서 $1 \times 3 + 1 \times 1 = 4$ 가 나와, 출력은 그 칸에서 channel 2 장의
값 5 와 4 를 갖는다. filter 수를 늘리면 출력 channel 수가 늘어난다.

stride 2 는 한 칸씩 건너뛰며 계산하므로 4×4 에서는 $(0, 0)$, $(0, 2)$, $(2, 0)$, $(2, 2)$ 네 칸만 남아 2×2 가 된다. 출력 크기 공식으로도
$\lfloor (4 + 0 - 1)/2 \rfloor + 1 = \lfloor 1.5 \rfloor + 1 = 2$ 다.

![1×1 conv shortcut. 2 channel 4×4 입력에서 stride 2 로 한 칸씩 건너뛴 네 칸만 골라, 칸마다 두 channel 값 (3, 1) 에 filter weight (2, −1) 을 곱해 더한 5 처럼 계산한다. 출력은 2×2 다](figures/shortcut-1x1.svg)

ResNet-18 에서 64 → 128 channel 로 바뀌는 block 은 128 개의 1×1 filter 가 각각 64 개 weight 를 가지므로 shortcut 의 parameter 가
$128 \times 64 = 8{,}192$ 개다. 그 뒤에 BatchNorm 이 하나 붙는다. 식으로 쓰면 이 block 의 출력은 $y = \mathrm{ReLU}(\mathcal F(x) + W_s x)$
이고, $W_s x$ 는 1×1 conv 와 BatchNorm 으로 모양을 맞춘 입력이다.

![layer2 의 첫 BasicBlock. 64 장짜리 56×56 입력이 3×3 conv(stride 2) → BN → ReLU → 3×3 conv → BN 을 지나 128 장짜리 28×28 의 F(x) 가 되고, shortcut 은 1×1 conv(stride 2) 와 BN 으로 입력을 같은 모양으로 맞춰 더한 뒤 ReLU 를 거친다](figures/basic-block.svg)

위 그림의 괄호 안 숫자는 (channel 수, 세로, 가로) 순서의 모양이다. 모양이 그대로인 block 은 오른쪽 주황 길 대신 $x$ 를 그대로 더한다.

**확인 문제.** 128 → 256 channel 로 바뀌는 block 의 1×1 conv shortcut 은 weight 가 몇 개일까? 28×28 입력에 stride 2 로 걸면 출력
크기는?

<details><summary>답 보기</summary>

$256 \times 128 = 32{,}768$ 개다. 크기는 $\lfloor (28 - 1)/2 \rfloor + 1 = \lfloor 13.5 \rfloor + 1 = 14$ 라 14×14 다.

</details>

**요약**

- BasicBlock 은 3×3 conv → BN → ReLU → 3×3 conv → BN 으로 $\mathcal F(x)$ 를 만들고, 입력을 원소별로 더한 뒤 ReLU 를 거친다
- 원소별 덧셈은 두 묶음의 모양이 같아야 하고, identity shortcut 은 parameter 가 없다
- 크기가 반으로 줄고 channel 이 두 배가 되는 block 은 shortcut 에 stride 2 의 1×1 conv 와 BN 을 두어 모양을 맞춘다

## ResNet-18

ResNet-18 은 이름 그대로 weight 가 있는 층이 18 개인 ResNet 이다. 224×224 컬러 사진을 받아 ImageNet 1000 class 의 점수를 낸다.

### stem

맨 앞의 몇 층은 사진을 받아 크기를 빨리 줄이는 부분으로, 줄기라는 뜻의 stem 이라고 부른다.

| 층 | 설정 | 크기 계산 | 출력 |
| --- | --- | --- | --- |
| 입력 | 컬러 사진 | | $3 \times 224 \times 224$ |
| conv | 7×7 filter 64 개, stride 2, padding 3 | $\lfloor (224 + 6 - 7)/2 \rfloor + 1 = 111 + 1$ | $64 \times 112 \times 112$ |
| BN, ReLU | | | $64 \times 112 \times 112$ |
| max pooling | 3×3, stride 2, padding 1 | $\lfloor (112 + 2 - 3)/2 \rfloor + 1 = 55 + 1$ | $64 \times 56 \times 56$ |

크기는 [CNN](../cnn/README.md) 과 같이 "장 수 × 세로 × 가로" 로 적었다. conv 줄의 계산은 CNN 강의의 출력 크기 표 마지막 줄과 같고,
max pooling 은 3×3 묶음에서 가장 큰 값을 남기며 2 칸씩 옮기는 계산이다. stem 을 지나면 가로세로가 224 에서 56 으로 4 분의 1 이
된다.

### stage 네 개

stem 뒤에는 BasicBlock 두 개씩으로 된 묶음 네 개가 이어진다. 이 묶음을 stage 라고 하고, 차례로 layer1~layer4 라고 부른다.

| stage | block | 첫 block 의 stride | 출력 |
| --- | --- | --- | --- |
| layer1 | BasicBlock 2 개 | 1 | $64 \times 56 \times 56$ |
| layer2 | BasicBlock 2 개 | 2 | $128 \times 28 \times 28$ |
| layer3 | BasicBlock 2 개 | 2 | $256 \times 14 \times 14$ |
| layer4 | BasicBlock 2 개 | 2 | $512 \times 7 \times 7$ |

layer2·3·4 의 첫 block 이 가로세로를 반으로 줄이고 channel 을 두 배로 늘린다. 이 세 block 의 shortcut 에만 1×1 conv 가 있고, 나머지
다섯 block 은 입력을 그대로 더한다. layer1 은 stem 이 이미 크기를 줄였으므로 크기를 바꾸지 않는다. 가로세로는 224 → 56 → 28 →
14 → 7 로 모두 32 분의 1 이 되고, channel 은 64 → 128 → 256 → 512 로 늘어난다.

![ResNet-18 의 stage 별 출력 모양. stem 이 3×224×224 를 64×56×56 으로 줄이고, layer2·3·4 의 첫 block 이 크기를 반으로 줄이며 channel 을 두 배로 늘려 512×7×7 이 된다. global average pooling 이 512 개 숫자로, fc 가 1000 개 점수로 바꾼다](figures/resnet18.svg)

위 그림의 초록 상자가 마지막 feature map $512 \times 7 \times 7$ 이다. 7×7 에서 이웃한 두 칸은 원래 사진에서 32 pixel 떨어진 자리를
대표하고, 칸마다 512 장의 값이 그 자리 주변에 어떤 특징이 얼마나 있는지를 담는다.

**확인 문제.** 같은 ResNet-18 에 448×448 사진을 넣으면 layer4 의 출력 크기는? (가로세로가 모두 32 분의 1 이 된다)

<details><summary>답 보기</summary>

$448 \div 32 = 14$ 라 $512 \times 14 \times 14$ 다. conv 층은 사진 크기와 상관없이 같은 filter 를 옮기므로 사진이 커지면 feature
map 도 커진다.

</details>

### global average pooling 과 fc

마지막 feature map 의 channel 마다 7×7 = 49 칸의 평균을 내 숫자 하나로 만든다. 이 계산을 global average pooling 이라고 한다.
global 은 "전체" 라는 뜻으로, [CNN](../cnn/README.md) 의 average pooling 을 2×2 묶음이 아니라 feature map 전체에 한 번 하는 것이다.
2×2 feature map $\begin{bmatrix} 1 & 3 \\ 5 & 7 \end{bmatrix}$ 이라면 $(1 + 3 + 5 + 7) \div 4 = 4$ 가 된다.

channel 이 512 장이므로 global average pooling 의 출력은 숫자 512 개다. 이 512 개가 사진 한 장의 요약, 곧 feature vector 다. 마지막으로
Linear layer 하나가 512 개를 1000 개 점수로 바꾼다. ResNet 에서는 이 Linear layer 를 fc(fully connected, 모든 입력이 모든 출력과
연결된 층)라고 부르고, 이 점수 1000 개가 class 마다의 점수인 logits 다.

![global average pooling. 512 장의 7×7 feature map 에서 장마다 49 칸의 평균을 내 숫자 512 개를 만든다. 2×2 예에서 1, 3, 5, 7 의 평균은 4 다](figures/gap.svg)

global average pooling 은 "어디에" 정보를 모두 버리고 "무엇이 얼마나" 만 남긴다. 그래서 사진 크기가 달라 feature map 이 7×7 이든
14×14 이든 결과는 언제나 512 개라, 뒤에 붙는 fc 를 바꾸지 않아도 된다.

**확인 문제.** 3×3 feature map $\begin{bmatrix} 0 & 2 & 4 \\ 1 & 3 & 5 \\ 2 & 4 & 6 \end{bmatrix}$ 에 global average pooling 을 하면?

<details><summary>답 보기</summary>

합은 $6 + 9 + 12 = 27$ 이고 칸은 9 개라 $27 \div 9 = 3$ 이다.

</details>

### 층 수와 parameter 수

weight 가 있는 층을 세면 stem 의 conv 1 개, BasicBlock 8 개 × conv 2 개 = 16 개, fc 1 개를 더해 $1 + 16 + 1 = 18$ 이다. shortcut 의
1×1 conv 는 He 등의 관례대로 층 수에 넣지 않는다.

parameter 수는 conv 의 weight, BatchNorm 의 $\gamma$·$\beta$, fc 의 weight·bias 를 모두 센다. conv 에 bias 가 없으므로 conv 층의
parameter 는 $C_{\text{out}} \times C_{\text{in}} \times k \times k$ 다. $C_{\text{out}}$ 은 출력 channel 수, $C_{\text{in}}$ 은 입력 channel
수, $k$ 는 filter 크기다. BatchNorm 은 channel 마다 $\gamma$ 와 $\beta$ 두 개다.

| 부분 | 계산 | parameter | 비율 |
| --- | --- | --- | --- |
| stem | conv $64 \times 3 \times 7 \times 7 = 9{,}408$, BN $2 \times 64 = 128$ | 9,536 | 0.1% |
| layer1 | block 하나 $2 \times (64 \times 64 \times 9) + 2 \times 128 = 73{,}984$, 그 두 배 | 147,968 | 1.3% |
| layer2 | | 525,568 | 4.5% |
| layer3 | | 2,099,712 | 18.0% |
| layer4 | | 8,393,728 | 71.8% |
| fc | $512 \times 1{,}000 + 1{,}000$ | 513,000 | 4.4% |
| 합 | | 11,689,512 | |

모두 약 1,170만 개이고, 그중 72% 가 layer4 에 있다. 3×3 conv 의 parameter 는 channel 수의 제곱에 비례해서, channel 이 두 배가 되면
parameter 는 네 배가 되기 때문이다. layer1 의 conv 하나는 $64 \times 64 \times 9 = 36{,}864$ 개, layer4 의 conv 하나는
$512 \times 512 \times 9 = 2{,}359{,}296$ 개로 64 배다. fc 를 뺀 앞부분은 $11{,}689{,}512 - 513{,}000 = 11{,}176{,}512$ 개다.

**흔한 오해.** "층이 18 개면 사진을 18 번 줄인다" 고 생각하기 쉽다. 크기를 줄이는 곳은 stem 의 conv·max pooling 과 layer2·3·4 의 첫
block, 모두 다섯 곳이고, 각각 반으로 줄여 $2^5 = 32$ 분의 1 이 된다. 나머지 층은 크기를 그대로 두고 feature 를 다듬는다.

**확인 문제.** layer2 의 첫 block 에서 첫 3×3 conv(입력 64, 출력 128)와 둘째 3×3 conv(입력 128, 출력 128)의 weight 는 각각 몇
개일까?

<details><summary>답 보기</summary>

$128 \times 64 \times 9 = 73{,}728$ 개와 $128 \times 128 \times 9 = 147{,}456$ 개다.

</details>

### 더 깊은 ResNet 과 실험 결과

같은 방식으로 stage 마다 block 수를 늘리면 더 깊은 ResNet 이 된다. ResNet-34 는 BasicBlock 을 stage 마다 3·4·6·3 개 쌓은 것이고,
ResNet-50 부터는 계산을 줄이려고 1×1, 3×3, 1×1 conv 세 개로 된 bottleneck block 을 쓴다.

He 등은 plain 망과 ResNet 을 층 수와 parameter 수를 똑같이 맞춰 비교했다. 아래는 ImageNet 검증 사진에서의 top-1 error 다.

| 층 수 | plain | ResNet |
| --- | --- | --- |
| 18 | 27.94% | 27.88% |
| 34 | 28.54% | 25.03% |

![ImageNet 검증 사진의 top-1 error. plain 망은 18 층 27.94% 에서 34 층 28.54% 로 나빠지고, ResNet 은 18 층 27.88% 에서 34 층 25.03% 로 좋아진다](figures/imagenet-error.svg)

plain 망은 층을 늘리자 error 가 0.6%p 올랐는데 ResNet 은 2.85%p 내려갔다. %p(퍼센트 포인트)는 두 백분율의 차이를 뺄셈으로 나타낸
단위다. 18 층에서는 두 망의 error 가 거의 같고, 대신 ResNet 이 더 빨리 수렴했다. 층이 깊어질수록 residual connection 의 효과가
커진다는 뜻이다. CIFAR-10 에서는 1202 층 ResNet 까지 학습해 training error 를 0.1% 아래로 낮췄다. ResNet 은 2015년 ImageNet 대회의
분류 부문에서 1 위를 했다.

**확인 문제.** 위 표에서 18 층에서 34 층으로 갈 때 plain 과 ResNet 의 error 는 각각 몇 %p 바뀌었나?

<details><summary>답 보기</summary>

plain 은 $28.54 - 27.94 = 0.60$%p 올랐고, ResNet 은 $27.88 - 25.03 = 2.85$%p 내려갔다.

</details>

**요약**

- ResNet-18 은 stem($3 \times 224 \times 224$ → $64 \times 56 \times 56$), BasicBlock 두 개씩의 stage 네 개(64·128·256·512 channel),
  global average pooling(512 개), fc(1000 개)로 되어 있다
- 층 수는 conv 1 + conv 16 + fc 1 = 18 이고, parameter 는 11,689,512 개로 72% 가 layer4 에 있다
- ImageNet 에서 plain 망은 18 → 34 층에서 나빠졌지만 ResNet 은 27.88% 에서 25.03% 로 좋아졌다

## ImageNet 사전학습과 로봇 policy

### pretrained weight

ResNet-18 을 ImageNet 의 사진 약 128만 장으로 학습하면 parameter 11,689,512 개에 값이 정해진다. 이렇게 큰 데이터로 미리 학습해 둔
parameter 값을 pretrained weight 라고 하고, 미리 학습하는 일을 사전학습(pretraining)이라고 부른다. PyTorch 의 사진 모델 모음인
torchvision 이 공개한 ResNet-18 pretrained weight 는 ImageNet 검증 사진에서 약 69.8% 를 맞힌다.

pretrained weight 에서 앞쪽 stage 는 선이나 색의 경계처럼 단순한 모양에, 뒤쪽 stage 는 바퀴나 손잡이처럼 물체의 부분에 반응하는
filter 를 이미 배워 두었다. 로봇이 보는 사진도 같은 세상의 사진이라 이 filter 들이 그대로 쓸모 있다. 그래서 로봇 데이터로 학습할 때 parameter 를 random 값이 아니라
pretrained weight 에서 출발시키는 경우가 많다. 다른 곳에서 학습한 weight 를 가져다 새 일에 쓰는 것을 transfer learning(전이
학습)이라고 한다.

### backbone 과 새 head

[PyTorch Training Loop](../pytorch-mlp/README.md) 에서 network 를 입력을 feature 로 바꾸는 앞부분 backbone 과, feature 를 원하는
출력으로 바꾸는 뒷부분 head 로 나눠 보았다. ResNet-18 에서는 fc 앞까지, 곧 global average pooling 이 512 개 숫자를 내는 곳까지가
backbone 이고 fc 가 head 다.

로봇이 물체 10 종류를 가려내야 한다면 ImageNet 용 fc(512 → 1000)를 떼고 512 → 10 짜리 새 fc 를 붙인다. 새 head 의 parameter 는
$512 \times 10 + 10 = 5{,}130$ 개뿐이고, backbone 의 11,176,512 개는 pretrained weight 를 그대로 쓴다.

| 학습 방식 | backbone | head | 학습하는 parameter |
| --- | --- | --- | --- |
| freeze | pretrained weight 고정 | 새로 학습 | 5,130 |
| fine-tuning | pretrained weight 에서 출발해 조금씩 고침 | 새로 학습 | 11,181,642 |
| 처음부터 학습 | random 값에서 출발 | 새로 학습 | 11,181,642 |

freeze 는 "얼린다" 는 뜻으로 backbone 의 값을 고치지 않는 것이고, fine-tuning 은 "미세 조정" 이라는 뜻으로 작은 learning rate 로
backbone 까지 조금씩 고치는 것이다. 데이터가 적을수록 pretrained weight 에서 출발하는 쪽이 유리하다. 11,181,642 는 backbone
11,176,512 개와 head 5,130 개를 더한 값이다.

**확인 문제.** ResNet-18 backbone 위에 관절 각도 7 개를 내는 head(Linear 512 → 7)를 붙이면 head 의 parameter 는 몇 개일까?

<details><summary>답 보기</summary>

$512 \times 7 + 7 = 3{,}584 + 7 = 3{,}591$ 개다.

</details>

### ACT 의 image encoder

[CNN](../cnn/README.md) 의 마지막 섹션에서 policy 를 지금 보이는 것(observation)을 받아 다음 행동(action)을 내는 모델이라고 했고,
카메라 사진은 CNN 이 줄인 feature 의 형태로 policy 에 들어간다고 했다. 이렇게 사진을 feature 로 바꾸는 부분을 image encoder 라고
한다. 가장 단순한 연결은 global average pooling 이 낸 512 개를 관절 각도와 이어 붙여 policy 에 넣는 것이다.

[ACT](../act/README.md)(Action Chunking with Transformers)는 사람이 조종해 보여 준 시연으로 로봇 팔의 다음 동작 여러 개를 한꺼번에
내도록 학습하는 policy 로, 2023년 Tony Zhao 등이 발표했다. ACT 는 카메라마다 ImageNet pretrained weight 의 ResNet-18 을 image
encoder 로 쓰는데, global average pooling 으로 512 개 숫자 하나를 만들지 않고 그 앞의 feature map 을 그대로 꺼낸다.

480×640 카메라 사진을 넣으면 가로세로가 32 분의 1 이 되어 layer4 의 출력은 $512 \times 15 \times 20$ 이다.
$480 \div 32 = 15$, $640 \div 32 = 20$ 이기 때문이다. $15 \times 20 = 300$ 칸 하나하나가 512 개 숫자를 가지며, ACT 는 이 300 칸을
transformer 에 넣는 입력 조각 300 개로 쓴다. transformer 는 입력 조각들이 서로를 참고해 값을 고치는 구조로
[Transformer](../transformer/README.md) 에서 다루고, 그 입력 조각 하나를 token 이라고 부른다. 여기서 token 은 텍스트 조각이 아니라
사진의 한 구역을 요약한 512 개 숫자다.

![로봇 policy 의 image encoder 로 쓰는 ResNet-18. 480×640 카메라 사진이 layer4 에서 512×15×20 이 되면 ACT 는 칸 300 개를 512 개 숫자짜리 token 300 개로 쓰고, global average pooling 을 하면 숫자 512 개 하나가 된다. Diffusion Policy 는 같은 구조에서 pooling 을 spatial softmax 로, BatchNorm 을 GroupNorm 으로 바꾼다](figures/robot-encoder.svg)

위 그림처럼 global average pooling 의 512 개는 "무엇이 있는가" 만 남기고 "어디에" 를 버리는 반면, 300 개 token 은 칸마다의 위치가
살아 있다. 컵을 집으려면 컵이 사진의 어느 구역에 있는지가 중요하기 때문에 ACT 는 pooling 전의 feature map 을 쓴다. 사진 한 장의
$3 \times 480 \times 640 = 921{,}600$ 개 숫자가 $512 \times 300 = 153{,}600$ 개로 줄어든다.

**확인 문제.** 256×320 사진을 ACT 의 ResNet-18 에 넣으면 token 은 몇 개이고, token 하나는 숫자 몇 개일까?

<details><summary>답 보기</summary>

가로세로가 32 분의 1 이 되어 $256 \div 32 = 8$, $320 \div 32 = 10$ 이라 layer4 출력은 $512 \times 8 \times 10$ 이다. token 은
$8 \times 10 = 80$ 개이고, token 하나는 channel 수와 같은 숫자 512 개다.

</details>

### Diffusion Policy 의 image encoder

[Diffusion Policy](../diffusion-policy/README.md) 는 잡음에서 출발해 잡음을 조금씩 걷어 내며 action 을 만드는 policy 로, 2023년
Cheng Chi 등이 발표했다. 원 논문은 image encoder 로 ResNet-18 의 구조를 쓰되 두 곳을 바꿨고, ImageNet pretrained weight 없이
로봇 데이터로 처음부터 학습한 것을 기본으로 삼았다.

- global average pooling 을 spatial softmax 로 바꾼다. spatial softmax 는 channel 마다 값이 큰 칸의 위치 $(x, y)$ 를 뽑아내는
  계산이라, 평균을 내며 위치를 버리는 global average pooling 과 달리 "어디에" 가 남는다
- BatchNorm 을 GroupNorm 으로 바꾼다

두 policy 모두 ResNet-18 의 층 구조와 residual connection 은 그대로 쓰고, 사진을 policy 가 쓸 숫자로 바꾸는 입구 역할을 맡긴다.
spatial softmax 의 계산은 Diffusion Policy 강의에서 자세히 다룬다.

### FrozenBatchNorm 과 GroupNorm

앞에서 batch 가 작으면 BatchNorm 의 통계가 흔들린다고 했다. 로봇 policy 는 batch 가 작은 경우가 많아서 두 policy 가 각자 다른
방법으로 이 문제를 피한다.

ACT 는 FrozenBatchNorm 을 쓴다. ImageNet 학습 때 쌓아 둔 running mean·분산과 $\gamma$·$\beta$ 를 모두 고정한 BatchNorm 으로, 학습
중에도 batch 통계를 쓰지 않고 고정된 숫자로만 계산한다. 쌓아 둔 평균이 2, 분산이 4, $\gamma = 3$, $\beta = 1$ 이면 입력 6 은
batch 에 무엇이 함께 있든 언제나 $3 \times (6 - 2) \div 2 + 1 = 7$ 이 된다. frozen 은 "얼린" 이라는 뜻이다.

GroupNorm 은 평균과 분산을 batch 로 모으지 않고 사진 한 장 안에서 구한다. channel 을 몇 개씩 묶음(group)으로 나누고, 한 사진의 한
묶음에 든 모든 값으로 평균과 분산을 낸다. 사진 한 장의 channel 4 장을 2 장씩 묶는데 각 channel 의 값이 하나씩 1, 3, 10, 14 라면,
첫 묶음 1, 3 은 $-1$, 1 이 되고 둘째 묶음 10, 14 도 $-1$, 1 이 된다. batch 에 다른 사진이 몇 장 있든 결과가 같다.

| 방식 | 평균·분산을 구하는 값 | batch 크기의 영향 |
| --- | --- | --- |
| BatchNorm | channel 하나, batch 전체의 $N \times H \times W$ 개 | 작은 batch 에서 흔들림 |
| FrozenBatchNorm | 사전학습 때 쌓아 둔 고정값 | 없음 |
| GroupNorm | 사진 한 장, channel 묶음 하나의 값 | 없음 |

**확인 문제.** FrozenBatchNorm 의 쌓아 둔 평균이 1, 분산이 9, $\gamma = 2$, $\beta = 0$ 이면 입력 7 의 출력은?

<details><summary>답 보기</summary>

표준편차는 $\sqrt{9} = 3$ 이라 $2 \times (7 - 1) \div 3 + 0 = 4$ 다.

</details>

**요약**

- ImageNet 으로 미리 학습한 ResNet-18 의 pretrained weight 는 선·경계·물체 부분을 찾는 filter 를 담고 있어 로봇 사진에도 쓸모 있다
- fc 를 떼면 512 개 feature 를 내는 backbone 이 되고, 새 head 만 붙여 다른 일에 쓴다
- ACT 는 pretrained ResNet-18 의 $512 \times 15 \times 20$ feature map 을 token 300 개로 쓰고 FrozenBatchNorm 을 쓴다. Diffusion Policy 는 같은
  구조에서 pooling 을 spatial softmax 로, BatchNorm 을 GroupNorm 으로 바꿔 처음부터 학습한다

## 정리

- 층을 깊게 쌓은 plain network 는 학습 데이터에서조차 더 많이 틀리는 degradation 을 보인다. ImageNet 에서 18 층 27.94%, 34 층
  28.54% 였고, 깊은 망은 identity 층을 붙여 얕은 망을 흉내 낼 수 있으므로 이것은 overfitting 이 아니라 학습이 좋은 상태를 찾지 못하는
  문제다
- chain rule 때문에 입력 쪽 gradient 는 층마다의 비율을 모두 곱한 값이다. 층마다 0.5 면 20 층 뒤에 $0.5^{20} \approx$ 100만 분의 1
  (vanishing gradient), 2 면 $2^{20} \approx$ 100만 배(exploding gradient)가 된다
- residual block $y = \mathcal F(x) + x$ 는 weight 를 0 으로 보내기만 하면 identity 가 되고, gradient 비율이 $1 + \frac{\partial \mathcal F}{\partial x}$
  이다. 두 block 이면 $(1 + a)(1 + b) = 1 + a + b + ab$ 로, weight 를 거치지 않는 길이 언제나 1 을 전한다. $w = 0.1$ 인 20 block 에서
  plain 망은 $10^{-20}$, residual 망은 6.73 이다
- BatchNorm 은 channel 마다 batch 의 값으로 평균 0, 분산 1 을 맞춘 뒤 $\gamma$, $\beta$ 를 입힌다. 1, 2, 3, 6 은
  $-1.069, -0.535, 0, 1.604$ 가 되고 그 10 배도 같은 값이 된다. 평가 때는 학습 중 $0.9 \times$ 이전 $+ 0.1 \times$ 새 값으로 쌓은
  통계를 쓴다
- BasicBlock 은 3×3 conv 두 개와 BN 으로 $\mathcal F$ 를 만들고, 모양이 바뀌는 block 은 1×1 conv shortcut 으로 입력의 모양을 맞춘다
- ResNet-18 은 $3 \times 224 \times 224$ 를 stem 과 stage 네 개로 $512 \times 7 \times 7$ 까지 줄이고, global average pooling 으로 512 개,
  fc 로 1000 개 점수를 낸다. parameter 는 11,689,512 개다
- ImageNet 으로 사전학습한 ResNet-18 의 fc 앞부분은 로봇 policy 의 image encoder 가 된다. ACT 는 $512 \times 15 \times 20$ feature map 을
  token 300 개로 쓰고, Diffusion Policy 는 pooling 과 normalization 을 바꿔 쓴다

ResNet 은 사진을 512 개 숫자나 feature map 으로 요약할 뿐이라 로봇 action 을 내려면 그 위에 policy 가 따로 있어야 한다. 또
convolution 은 가까운 칸끼리만 계산하므로 사진의 멀리 떨어진 두 구역의 관계는 층을 아주 많이 쌓아야 반영된다. 사진을 조각으로 잘라
조각끼리 서로 참고하게 하는 모델은 [ViT](../vit/README.md) 에서, CNN feature map 을 token 으로 바꿔 transformer 로 로봇 action 을 내는
모델은 [RT-1](../rt1/README.md) 과 [ACT](../act/README.md) 에서, 같은 image encoder 위에서 잡음을 걷어 내며 action 을 만드는 방법은
[Diffusion Policy](../diffusion-policy/README.md) 에서 다룬다.

## 참고 자료

- Kaiming He et al., [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385) (2015) — ResNet 의 원 논문.
  그림 1 이 degradation, 3절이 residual block, 표 2 가 plain·ResNet 의 18·34 층 비교, 4.2절이 CIFAR-10 실험이다
- Kaiming He et al., [Identity Mappings in Deep Residual Networks](https://arxiv.org/abs/1603.05027) (2016) — shortcut 이 gradient 를
  어떤 block 에든 곧장 전한다는 것을 식으로 보인 후속 논문. 이 강의의 $1 + a + b + ab$ 를 block 이 많을 때로 넓힌 3절을 읽는다
- Sergey Ioffe, Christian Szegedy, [Batch Normalization](https://arxiv.org/abs/1502.03167) (2015) — Algorithm 1 이 학습 때의 정규화,
  3.1절이 평가 때 쌓아 둔 통계를 쓰는 방법이다
- Dive into Deep Learning, [Residual Networks (ResNet)](https://d2l.ai/chapter_convolutional-modern/resnet.html)·[Batch Normalization](https://d2l.ai/chapter_convolutional-modern/batch-norm.html)
  — 두 개념을 그림과 함께 설명한 교재의 두 절
- Yannic Kilcher, [Deep Residual Learning for Image Recognition (Paper Explained)](https://www.youtube.com/watch?v=GWt6Fu05voI) —
  ResNet 논문을 그림과 함께 읽어 주는 영상
- PyTorch 문서, [nn.BatchNorm2d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html) — momentum 0.1 의 뜻과
  running 통계의 갱신 식
- torchvision, [`resnet18` weight 문서](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet18.html) —
  ImageNet pretrained weight 의 정확도와 입력 사진의 전처리 방법
- LeRobot, [`modeling_diffusion.py`](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/diffusion/modeling_diffusion.py)
  — ResNet-18 의 pooling 을 spatial softmax 로, BatchNorm 을 GroupNorm 으로 바꿔 policy 의 image encoder 로 쓰는 실제 예
