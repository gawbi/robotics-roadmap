---
id: cnn
title: CNN
branch: vision
requires: [pytorch-mlp]
hours: 2
summary: 작은 filter 를 사진 위에서 옮겨 가며 곱해 더하는 convolution. filter 학습, weight sharing, stride·padding·pooling, LeNet, receptive field, 위치를 남기는 로봇 image encoder 와 GQ-CNN·PointPillars
papers:
  - title: "Gradient-Based Learning Applied to Document Recognition"
    authors: Yann LeCun, Léon Bottou, Yoshua Bengio, Patrick Haffner
    year: 1998
    url: http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf
  - title: "End-to-End Training of Deep Visuomotor Policies"
    authors: Sergey Levine, Chelsea Finn, Trevor Darrell, Pieter Abbeel
    year: 2016
    url: https://arxiv.org/abs/1504.00702
  - title: "Dex-Net 2.0: Deep Learning to Plan Robust Grasps with Synthetic Point Clouds and Analytic Grasp Metrics"
    authors: Jeffrey Mahler et al.
    year: 2017
    url: https://arxiv.org/abs/1703.09312
  - title: "PointPillars: Fast Encoders for Object Detection from Point Clouds"
    authors: Alex H. Lang et al.
    year: 2019
    url: https://arxiv.org/abs/1812.05784
  - title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"
    authors: Tony Z. Zhao, Vikash Kumar, Sergey Levine, Chelsea Finn
    year: 2023
    url: https://arxiv.org/abs/2304.13705
  - title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion"
    authors: Cheng Chi et al.
    year: 2023
    url: https://arxiv.org/abs/2303.04137
---

# CNN

ALOHA 로봇 팔은 시연을 1초에 50 번 기록하는데, 한 번 기록할 때마다 카메라 한 대의 480×640 컬러 사진이 숫자 921,600 개로 들어간다. 책상
위의 컵을 조금만 옮겨도 컵 둘레의 pixel 값이 모두 바뀐다. 이렇게 숫자가 달라진 사진에서 policy 는 어떻게 같은 컵을 알아보고 컵이 옮겨 간
쪽으로 손을 뻗을까?

사진의 모든 자리에 같은 작은 숫자 판을 대어 보는 convolution 으로 이 문제를 푼다. convolution 층을 쌓은 network 를 CNN(Convolutional
Neural Network)이라고 한다. ACT 는 카메라 네 대의 사진을 CNN 인 ResNet-18 에 각각 넣어 세로 15 × 가로 20 자리마다 숫자 512 개가 붙은
판으로 바꾼 뒤 policy 에 넣는다.

## 학습 목표

- convolution 이 filter 를 옮겨 가며 곱해 더하는 계산이고, filter 의 숫자는 사진의 label 에서 만든 loss 로 학습된다는 것을 설명할 수 있다
- weight sharing 으로 parameter 가 줄고, 입력이 옮겨 가면 출력도 같은 만큼 옮겨 가는 이유를 숫자로 설명할 수 있다
- stride·padding·pooling·channel 수로 출력 크기와 parameter 수를 계산할 수 있다
- 로봇 policy 의 image encoder 가 위치 정보를 남기는 방법(feature map, spatial softmax)과 GQ-CNN·PointPillars 가 CNN 을 쓰는 방식을 설명할 수 있다

## 사진의 숫자 표현

디지털 사진은 작은 네모 칸을 가로세로로 늘어놓은 격자이고, 이 칸 하나를 pixel 이라고 한다. pixel 은 picture element 를 줄인 말이다.
흑백 사진은 pixel 마다 밝기 숫자가 하나씩 들어 있는데, 보통 0 이 검정이고 255 가 흰색이다. 아래 5×5 사진은 계산을 간단히 하려고 밝기를
흰 칸 1 과 검은 칸 0 두 값으로만 적었고, 이 강의의 convolution 손 계산은 주로 이 사진으로 한다.

![5×5 흑백 사진 한 장. 왼쪽은 눈에 보이는 모습이고, 오른쪽은 같은 사진의 칸마다 흰색이면 1, 검은색이면 0 을 적은 숫자 25 개다](figures/pixel-grid.svg)

칸의 자리는 (위에서 몇 번째 줄, 왼쪽에서 몇 번째 칸) 으로 적고 둘 다 0 부터 센다. 이 사진에서 $(0, 2)$ 는 1 이고 $(0, 0)$ 은 0 이다.

컬러 사진은 pixel 마다 빨강(R)·초록(G)·파랑(B) 빛의 세기를 0 ~ 255 로 하나씩 적는다. 같은 색의 숫자만 모으면 사진과 크기가 같은 숫자
판이 한 장 나오는데, 이 판을 **channel** 이라고 한다. 흑백 사진은 channel 이 1 장이고 컬러 사진은 3 장이다.

![2×2 컬러 사진은 빨강(R)·초록(G)·파랑(B) 세기를 적은 숫자 판 세 장으로 저장된다. (R, G, B) 로 적으면 빨강 pixel 은 (255, 0, 0) 이고 노랑은 (255, 255, 0) 이며 흰색은 (255, 255, 255) 다](figures/rgb-channels.svg)

이 강의는 숫자 판 묶음의 크기를 "channel 수 × 세로 × 가로" 순서로 적는다. 로봇 카메라의 사진은 MNIST 손글씨 사진보다 숫자가 천 배 넘게
많다.

| 사진 | 크기 | 숫자 개수 |
| --- | --- | --- |
| MNIST 손글씨 숫자 | $1 \times 28 \times 28$ | 784 |
| ResNet 에 넣는 ImageNet 사진 | $3 \times 224 \times 224$ | 150,528 |
| Levine 등(2016)의 PR2 로봇 카메라 | $3 \times 240 \times 240$ | 172,800 |
| ACT 의 ALOHA 카메라 한 대 | $3 \times 480 \times 640$ | 921,600 |

## 펼친 사진과 MLP

[PyTorch Training Loop](../pytorch-mlp/README.md) 의 MNIST MLP 처럼 사진을 한 줄로 펴서(flatten) MLP 에 넣으면 두 가지 문제가 생긴다.
첫째는 parameter 수인데, neuron 하나가 입력마다 weight 를 하나씩 두고 bias 도 하나 더 두므로 첫 layer 의 parameter 가 사진 크기에 비례해 는다.

| 사진 | 입력 숫자 수 | neuron 1,000 개짜리 첫 layer 의 parameter |
| --- | --- | --- |
| 224×224 컬러 | 150,528 | $1{,}000 \times (150{,}528 + 1) = 150{,}529{,}000$ |
| ALOHA 카메라 480×640 컬러 | 921,600 | $1{,}000 \times (921{,}600 + 1) = 921{,}601{,}000$ |

카메라 사진 한 장을 받는 첫 layer 에만 parameter 가 9 억 개를 넘고, 그 값을 모두 학습하려면 데이터도 그만큼 많이 필요하다.

둘째는 위치 문제다. neuron 하나로 "이 사진은 숫자 1 인가?" 를 판정한다고 하자. 5×5 사진에서 "1" 을 이루는 흰 칸 8 곳에는 weight 1 을
주고 나머지 17 칸에는 0 을 준다. 곱해 더한 값에 bias $-6$ 을 더한 $z$ 는 "weight 1 인 칸 가운데 흰 칸의 개수 − 6" 이 되고, $z$ 가 0 보다
크면 "1 이다" 로 판정한다.

![weight 가 원래 자리의 '1' 모양에 맞춰진 neuron. 원래 사진에서는 곱해 더한 값이 8 이라 '1' 로 판정하지만, 오른쪽으로 한 칸 옮긴 사진에서는 3 이라 '1' 이 아니라고 판정한다](figures/shift-mlp.svg)

| 사진 | weight 1 인 칸 가운데 흰 칸 | $z$ | 판정 |
| --- | --- | --- | --- |
| 원래 자리 | 8 | $8 - 6 = 2$ | 1 이다 |
| 오른쪽으로 한 칸 | 3 | $3 - 6 = -3$ | 1 이 아니다 |

사람 눈에는 똑같은 "1" 인데, 오른쪽으로 한 칸 옮기자 weight 1 인 칸과 겹치는 흰 칸이 세 곳으로 줄었다. MLP 의 weight 는
"몇 번째 입력" 마다 따로 있어서, 원래 자리에서 배운 모양을 한 칸 옆에서 알아보려면 그 자리의 weight 로 다시 배워야 한다.

**흔한 오해.** "사람 눈에 같은 사진이면 모델도 비슷하게 본다." MLP 에게 한 칸 옮긴 사진은 25 개 입력 가운데 10 개가 바뀐 다른 사진이다.
책상 위의 컵이 몇 cm 옆에 놓인 사진도 같은 이유로 MLP policy 에게는 처음 보는 입력이 된다.

## convolution

LeCun 등은 1998 년 LeNet-5 에서 이 두 문제를 convolution 으로 풀었다. convolution 은 3×3 같은 작은 숫자 판 하나만 두고, 그 판을 사진
위에서 한 칸씩 옮기며 같은 계산을 되풀이한다. 이 작은 숫자 판을 **filter** 라고 하고 kernel 이라고도 부른다.

$$
K = \begin{bmatrix} -1 & 2 & -1 \\ -1 & 2 & -1 \\ -1 & 2 & -1 \end{bmatrix}
$$

$K$ 는 줄마다 가운데가 2 이고 양옆이 $-1$ 인 3×3 filter 다. filter 를 사진 위에 겹쳤을 때 그 밑에 깔린 3×3 조각을 window 라고 한다.
window 와 filter 에서 같은 자리의 숫자끼리 곱한 9 개를 모두 더하면 출력 한 칸이 된다. 사진의 왼쪽 위에 filter 를 겹치면 window 는
$\begin{bmatrix} 0 & 0 & 1 \\ 0 & 1 & 1 \\ 0 & 0 & 1 \end{bmatrix}$ 이다.

![5×5 입력의 왼쪽 위 3×3 window 와 3×3 filter 를 칸끼리 곱하면 9 개의 곱이 나오고, 모두 더한 −1 이 출력의 왼쪽 위 칸이 된다](figures/conv-first.svg)

이 filter 는 줄마다 "왼쪽 × $(-1)$ + 가운데 × 2 + 오른쪽 × $(-1)$" 를 계산하므로 손으로 셀 때는 줄 단위로 더하면 빠르다. 세 줄
$[0, 0, 1]$, $[0, 1, 1]$, $[0, 0, 1]$ 이 각각 $-1$, $0 + 2 - 1 = 1$, $-1$ 을 내서 합은 $-1$ 이다. filter 의 숫자 9 개가 neuron 의 weight 역할을 하고,
계산은 neuron 의 "입력마다 weight 를 곱해 더하기" 와 같다.

filter 를 오른쪽으로 한 칸 옮기면 window 의 세 줄이 $[0, 1, 0]$, $[1, 1, 0]$, $[0, 1, 0]$ 이라 $2 + 1 + 2 = 5$ 이고, 한 칸 더 옮기면 세 줄이 모두
$[1, 0, 0]$ 이라 $-3$ 이다. 오른쪽 끝에 닿으면 한 줄 내려가 다시 왼쪽부터 옮긴다. filter 의 왼쪽 위 모서리가 놓일 수 있는 자리가 가로
3 곳, 세로 3 곳이라 출력은 3×3 이다.

![filter 를 한 칸씩 오른쪽으로 옮기며 같은 계산을 되풀이하면 출력의 첫 줄이 −1, 5, −3 으로 채워진다](figures/conv-slide.svg)

$$
\begin{bmatrix} -1 & 5 & -3 \\ -1 & 5 & -3 \\ -1 & 4 & -1 \end{bmatrix}
$$

5, 5, 4 가 모인 가운데 세로 줄은 사진에서 "1" 의 세로획이 지나가는 자리다. window 가 가운데 세로 줄만 흰 모양이면 $2 + 2 + 2 = 6$ 이
나오는데, $(0, 1)$ 과 $(1, 1)$ 은 "1" 의 왼쪽으로 삐친 칸 하나 때문에 1 이 줄어 5 가 됐다. 흰 세로선이 window 의 가장자리에 걸리면 $-1$ 과 곱해져
값이 음수가 된다.

<details><summary><b>심화: 9 자리 계산표와 convolution 의 식</b></summary>

9 자리를 모두 줄 단위로 계산하면 아래와 같다. $l, m, r$ 는 window 한 줄의 왼쪽·가운데·오른쪽 값이다.

| 출력 자리 | window 의 세 줄 | 줄마다 $-l + 2m - r$ | 합 |
| --- | --- | --- | --- |
| $(0, 0)$ | $[0,0,1]$, $[0,1,1]$, $[0,0,1]$ | $-1$, $1$, $-1$ | $-1$ |
| $(0, 1)$ | $[0,1,0]$, $[1,1,0]$, $[0,1,0]$ | $2$, $1$, $2$ | $5$ |
| $(0, 2)$ | $[1,0,0]$, $[1,0,0]$, $[1,0,0]$ | $-1$, $-1$, $-1$ | $-3$ |
| $(1, 0)$ | $[0,1,1]$, $[0,0,1]$, $[0,0,1]$ | $1$, $-1$, $-1$ | $-1$ |
| $(1, 1)$ | $[1,1,0]$, $[0,1,0]$, $[0,1,0]$ | $1$, $2$, $2$ | $5$ |
| $(1, 2)$ | $[1,0,0]$, $[1,0,0]$, $[1,0,0]$ | $-1$, $-1$, $-1$ | $-3$ |
| $(2, 0)$ | $[0,0,1]$, $[0,0,1]$, $[0,1,1]$ | $-1$, $-1$, $1$ | $-1$ |
| $(2, 1)$ | $[0,1,0]$, $[0,1,0]$, $[1,1,1]$ | $2$, $2$, $0$ | $4$ |
| $(2, 2)$ | $[1,0,0]$, $[1,0,0]$, $[1,1,0]$ | $-1$, $-1$, $1$ | $-1$ |

$(2, 1)$ 이 4 인 것은 맨 아래 가로획 $[1, 1, 1]$ 줄이 $-1 + 2 - 1 = 0$ 을 내기 때문이다.

입력 사진을 $x$, 출력을 $y$ 라 하고 $x[i, j]$ 를 "$x$ 의 $i$ 번째 줄 $j$ 번째 칸 값" 으로 읽으면 3×3 convolution 은 아래 식이다.

$$
y[i, j] = \sum_{u=0}^{2} \sum_{v=0}^{2} K[u, v] \times x[i + u,\; j + v] + b
$$

$\Sigma$ 는 "아래 번호부터 위 번호까지 바꿔 가며 모두 더하라" 는 기호이고, 두 번 겹쳐 있어서 $u$ 와 $v$ 를 각각 0·1·2 로 바꾼 9 가지 조합을
더한다.

| 기호 | 뜻 | $y[0, 1] = 5$ 를 계산할 때 |
| --- | --- | --- |
| $i, j$ | 출력 칸의 줄·칸 번호 | $i = 0$, $j = 1$ |
| $u, v$ | filter 안의 줄·칸 번호 | 0·1·2 를 차례로 넣는다 |
| $K[u, v]$ | filter 의 $(u, v)$ 칸 숫자 | 예: $K[1, 1] = 2$ |
| $x[i + u, j + v]$ | 그 filter 칸 밑에 깔린 사진 값 | $u = 1, v = 1$ 이면 $x[1, 2] = 1$ |
| $b$ | filter 하나에 하나씩 더하는 bias | 손 계산에서는 0 |

출력 자리 $(i, j)$ 를 한 칸 옮기면 $x[i + u, j + v]$ 의 자리도 함께 옮겨 가므로, 이 식이 "filter 를 옮긴다" 는 말을 그대로 나타낸다.

수학 교과서의 convolution 은 filter 를 상하좌우로 뒤집어 곱하고, 딥러닝 도구는 뒤집지 않고 그대로 곱한다. 수학에서는 뒤집지 않는 쪽을
cross-correlation 이라고 부른다. 그래도 filter 숫자는 어차피 학습으로 정하므로, 뒤집힌 filter 가 필요하면 그 숫자를 배우면 되어 결과는 같다.

</details>

**확인 문제.** 같은 filter 를 아래 3×4 사진에 대면 출력은 몇 칸이고, 각 칸의 값은?

$$
\begin{bmatrix} 0 & 0 & 1 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}
$$

<details><summary>답 보기</summary>

filter 가 놓일 수 있는 자리는 세로 1 곳, 가로 2 곳이라 출력은 1×2 다.

| 자리 | window 의 줄 | 줄마다 $-l + 2m - r$ | 합 |
| --- | --- | --- | --- |
| 왼쪽 | 세 줄 모두 $[0, 0, 1]$ | $-1$ | $-3$ |
| 오른쪽 | 세 줄 모두 $[0, 1, 0]$ | $2$ | $6$ |

답: $[-3, 6]$ 이다. 흰 세로선이 window 한가운데 오는 자리에서 가장 큰 값이 나온다.

</details>

## feature map

같은 사진에 숫자만 바꾼 filter 를 대 본다.

$$
K_{\text{가로}} = \begin{bmatrix} -1 & -1 & -1 \\ 2 & 2 & 2 \\ -1 & -1 & -1 \end{bmatrix}
$$

window 의 윗줄·가운데 줄·아랫줄 합을 차례로 $A$, $B$, $C$ 라 하면 결과는 $-A + 2B - C$ 다. 왼쪽 위 window 는 줄 합이 1, 2, 1 이라
$-1 + 4 - 1 = 2$ 이고, 9 자리를 모두 계산하면 $\begin{bmatrix} 2 & 2 & 0 \\ -1 & -1 & 0 \\ -1 & -2 & -1 \end{bmatrix}$ 이다. 가로선 filter 는
가로로 놓인 선처럼 가운데 줄에 흰 칸이 많고 위아래 줄에 적은 window 에서 큰 값을 낸다.

![같은 '1' 사진에 세로선 filter 를 대면 가운데 세로 줄에서 5·5·4 가 나오고, 가로선 filter 를 대면 맨 위 줄에서 2 가 나온다. filter 마다 다른 feature map 이 생긴다](figures/conv-two-filters.svg)

window 가 filter 모양을 닮을수록 값이 커지므로, 출력의 각 칸은 그 자리에 filter 와 닮은 모양이 얼마나 있는지를 나타낸다. filter 하나로 사진 전체를 훑어 얻은 숫자
판을 **feature map** 이라고 한다. feature 는 "특징" 이라는 뜻으로, feature map 은 "세로선이 어디에 얼마나 있는가" 같은 특징 하나를 자리별로
적은 지도다. filter 를 여러 개 쓰면 feature map 도 그 수만큼 나온다.

## filter 학습

세로선 filter 와 가로선 filter 는 사람이 숫자를 골라 만든 것이다. CNN 은 filter 의 숫자를 MLP 의 weight 처럼 parameter 로 두고 학습하는데,
"첫 층에는 세로선 filter 가 와야 한다" 같은 정답은 어디에도 없다. 정답은 사진마다 사람이 붙여 둔 "이 사진은 7" 같은 숫자 하나뿐이고, 이것을
**label** 이라고 한다.

CNN 은 filter 뒤에 층을 더 거쳐 숫자 0 ~ 9 마다 점수를 하나씩, 모두 10 개 낸다. label 이 쓰이는 곳은 이 점수로 loss 를 계산하는 마지막 한
곳뿐이다. softmax 가 점수 10 개를 합이 1 인 확률 10 개로 바꾸고, label 이 7 이면 7 자리 확률 $p_7$ 하나만 꺼내 cross-entropy loss
$-\log p_7$ 을 계산한다. 학습을 막 시작해 점수 10 개가 모두 같으면 $p_7 = 1 \div 10 = 0.1$ 이라 loss 가 2.303 이고, 학습이 잘 되어
$p_7 = 0.9$ 가 되면 loss 는 0.105 다.

그다음 backpropagation 이 loss 에서 출발해 입력 쪽으로 거꾸로 훑으며 parameter 마다 gradient 를 구하는데, filter 의 숫자 9 개와 bias 도 각자
gradient 를 하나씩 받는다. gradient 가 음수면 그 숫자를 조금 늘릴 때 loss 가 줄고, 양수면 오히려 loss 가 늘며, 0 이면 loss 가
그대로다.

![사진이 filter 와 뒤쪽 층을 거쳐 점수 10 개가 되고 softmax 로 7 자리 확률 0.1 이 나온다. label 7 은 마지막 loss 계산에만 들어가 −log 0.1 = 2.303 을 만들고, backpropagation 이 이 loss 를 거꾸로 전해 filter 숫자마다 gradient 를 준다](figures/filter-label-flow.svg)

label 7 은 filter 에 직접 닿지 않는다. filter 가 받는 것은 gradient 뿐이고, label 은 열 자리 가운데 어느 자리의 확률을 키울지만 정한다.

filter 하나는 7 사진에도, 3 사진에도, 1 사진에도 똑같이 쓰여서, 그 filter 의 숫자를 어느 쪽으로 고쳐야 loss 가 줄어드는지가 사진마다
다를 수 있다. 사진 3 장짜리 mini-batch 에서 같은 filter 의 한 칸 숫자 $w = 0.5$ 가 사진마다 아래 gradient 를 받았다고 하자.

| 사진 | label | 이 사진에서 구한 $w$ 의 gradient | 이 사진의 loss 를 줄이는 방향 |
| --- | --- | --- | --- |
| 1 | 7 | $-0.6$ | $w$ 를 늘린다 |
| 2 | 3 | $+0.3$ | $w$ 를 줄인다 |
| 3 | 1 | $-0.9$ | $w$ 를 늘린다 |

$w$ 는 하나뿐이라 sample 마다 구한 gradient 의 평균 $g = (-0.6 + 0.3 - 0.9) \div 3 = -0.4$ 를 쓴다. SGD 는 $w \leftarrow w - \eta\, g$ 로
고치는데, $\eta$ 는 eta(에타)로 읽는 learning rate 이고 여기서는 0.1 로 둔다. 그러면 $w = 0.5 - 0.1 \times (-0.4) = 0.54$ 로 0.04 늘어난다.

![예로 정한 gradient 로 본 mini-batch update. 같은 filter 칸 w = 0.5 에 대해 사진 3 장이 구한 gradient 가 차례로 −0.6(label 7), +0.3(label 3), −0.9(label 1) 이면 평균은 −0.4 다. SGD 로 고치면 w 는 0.5 − 0.1 × (−0.4) = 0.54 가 되어 0.04 늘어난다](figures/batch-filter-update.svg)

학습은 이런 step 을 수만 번 되풀이하고 step 마다 다른 숫자의 사진이 섞여 들어오므로, filter 는 선이나 밝기 경계처럼 여러 숫자를 가르는 데
두루 쓰이는 무늬에 반응하는 모양으로 바뀌어 간다. grasp 의 성공 여부를 label 로 학습한 GQ-CNN 의 첫 층 filter 도 논문에 실린 그림을 보면
여러 크기에서 깊이가 어느 방향으로 바뀌는지 재는 모양이다.

**흔한 오해.** "학습하면 숫자 0 ~ 9 마다 전용 filter 가 하나씩 생긴다." 첫 층 filter 는 7·3·1 사진의 gradient 평균으로 고쳐지므로 한 숫자에만
맞춰지지 않는다. 숫자마다 따로 있는 parameter 는 마지막 layer 에서 그 숫자의 점수를 계산하는 weight 다.

**확인 문제.** 위 mini-batch 에서 사진 2(label 3)의 gradient 가 $+0.3$ 이 아니라 $+1.5$ 라면, 평균 gradient 와 고친 뒤 $w$ 는 얼마일까?
나머지 조건($w = 0.5$, $\eta = 0.1$, 사진 1 은 $-0.6$, 사진 3 은 $-0.9$)은 그대로다.

<details><summary>답 보기</summary>

① 평균 gradient

$$
g = (-0.6 + 1.5 - 0.9) \div 3 = 0 \div 3 = 0
$$

② SGD update

$$
w = 0.5 - 0.1 \times 0 = 0.5
$$

| 고치기 전 | 더하는 양 $-\eta g = -0.1 \times 0$ | 고친 뒤 |
| --- | --- | --- |
| 0.5 | 0 | 0.5 |

답: 평균 gradient 는 0 이고 $w$ 는 0.5 그대로다. $w$ 를 늘리는 쪽인 음수 gradient 의 크기 합 $0.6 + 0.9 = 1.5$ 와 줄이는 쪽인 양수 gradient
1.5 가 같아서 서로 지워졌다. 이 칸의 값은 이번 step 에서 바뀌지 않고, 고칠 방향은 다음 mini-batch 의 사진들로 다시 정해진다.

</details>

## weight sharing

세로선 filter 의 출력 9 칸은 모두 같은 filter 숫자 9 개로 계산했다. 이렇게 weight 한 벌을 모든 자리에 돌려 쓰는 것을 **weight
sharing**(parameter sharing)이라고 한다. 5×5 사진을 받아 숫자 9 개를 내는 일을 두 방식으로 하면 parameter 수가 크게 다르다.

| 방식 | 출력 칸 하나가 보는 입력 | parameter 수 |
| --- | --- | --- |
| MLP layer (출력 9 개) | 25 칸 전부 | $9 \times (25 + 1) = 234$ |
| 3×3 convolution | 가까운 3×3 = 9 칸 | $9 + 1 = 10$ |

convolution 은 뜻 있는 모양이 가까운 pixel 끼리 만들어진다고 가정해서 3×3 만 보고, 세로선이 사진 어디에 있어도 같은 세로선이라고 가정해서
같은 filter 를 모든 자리에 쓴다. 사진이 커져도 filter 크기는 그대로라 parameter 수가 늘지 않는다. LeRobot 의 ACT 가 224×224 ImageNet 사진으로
미리 학습한 ResNet-18 weight 를 기본값으로 불러와 480×640 사진에 그대로 쓸 수 있는 것도 이 때문이다.

같은 filter 가 모든 자리를 똑같이 계산하므로, 사진 속 모양이 옮겨 가면 그 모양에 대한 답도 같은 만큼 옮겨 간다. MLP 에서 문제가 됐던 "오른쪽으로
한 칸 옮긴 1" 에 세로선 filter 를 대 보면 5, 5, 4 가 가운데 세로 줄에서 오른쪽 세로 줄로 옮겨 갈 뿐 값은 그대로다.

![입력 사진을 오른쪽으로 한 칸 옮기면 세로선 filter 의 출력에서 5·5·4 줄도 오른쪽으로 한 칸 옮겨 간다. 값은 그대로이고 자리만 바뀐다](figures/conv-shift.svg)

입력을 옮기면 출력도 같은 만큼 옮겨 가는 이 성질을 **translation equivariance** 라고 한다. translation 은 평행 이동을 뜻하고, equivariance 는
함께 변한다는 뜻이다. MLP 에서는 곱해 더한 값이 8 에서 3 으로 떨어졌지만, convolution 에서는 "세로선이 있다" 는 정보가 자리만 바뀐 채 남는다.

## stride 와 padding

5×5 사진에 3×3 filter 를 대면 출력이 3×3 으로 줄었다. 출력 크기는 filter 를 몇 칸씩 옮기는지와 테두리를 어떻게 다루는지에 따라 달라진다.

filter 를 한 번에 옮기는 칸 수를 **stride** 라고 한다. stride 2 로 옮기면 filter 의 왼쪽 위 모서리는 가로 0·2, 세로 0·2 에만 놓여서, stride 1
출력에서 네 모서리만 골라낸 $\begin{bmatrix} -1 & -3 \\ -1 & -1 \end{bmatrix}$ 이 나온다. 가로세로가 대략 반으로 줄어 계산이 빨라지지만, 이 예에서처럼
세로획 위의 5 를 건너뛰기도 한다.

3×3 filter 는 사진 테두리 칸을 window 가운데에 두지 못해서 출력이 입력보다 가로세로 2 칸씩 작아진다. 층마다 이렇게 줄면 몇 층 만에 가로세로가
1 칸까지 줄어들므로, 테두리에 0 을 덧대고 계산한다. 이것을 **padding** 이라고 하고, 한 줄씩 덧대면(padding 1) 5×5 사진이 7×7 이 되어 출력이 다시 5×5 다.

![왼쪽: stride 2 는 filter 를 두 칸씩 옮겨 5×5 입력에서 2×2 출력을 낸다. 오른쪽: padding 1 은 테두리에 0 을 한 줄씩 덧대 7×7 을 만들고, 출력이 입력과 같은 5×5 가 된다](figures/stride-padding.svg)

입력의 세로 길이를 $H$, filter 크기를 $k$, padding 을 $p$, stride 를 $s$ 라고 하면 출력의 세로 길이는 아래 식이고, 가로도 같다.

$$
H_{\text{out}} = \left\lfloor \frac{H + 2p - k}{s} \right\rfloor + 1
$$

$\lfloor \cdot \rfloor$ 은 소수점 아래를 버리는 floor 기호다. 이 식은 filter 의 모서리가 놓일 수 있는 0 번 ~ $H + 2p - k$ 번 칸을 $s$ 칸씩
건너뛸 때 모서리가 몇 자리에 놓이는지 세는데, 건너뛴 횟수에 처음 자리 1 곳을 더한 값이다.

| $H$ | $k$ | $p$ | $s$ | 계산 | $H_{\text{out}}$ |
| --- | --- | --- | --- | --- | --- |
| 5 | 3 | 0 | 1 | $\lfloor (5 + 0 - 3) / 1 \rfloor + 1 = 2 + 1$ | 3 |
| 5 | 3 | 0 | 2 | $\lfloor (5 + 0 - 3) / 2 \rfloor + 1 = 1 + 1$ | 2 |
| 5 | 3 | 1 | 1 | $\lfloor (5 + 2 - 3) / 1 \rfloor + 1 = 4 + 1$ | 5 |
| 6 | 3 | 0 | 2 | $\lfloor (6 + 0 - 3) / 2 \rfloor + 1 = \lfloor 1.5 \rfloor + 1 = 1 + 1$ | 2 |
| 224 | 7 | 3 | 2 | $\lfloor (224 + 6 - 7) / 2 \rfloor + 1 = \lfloor 111.5 \rfloor + 1 = 111 + 1$ | 112 |

넷째 줄처럼 나누어떨어지지 않으면 남는 칸은 버린다. 마지막 줄은 [ResNet](../resnet/README.md) 첫 층의 설정이고, 224×224 사진이 112×112 가 된다.

**흔한 오해.** "padding 을 하면 사진에 없던 정보가 생긴다." 덧대는 값은 모두 0 이라 곱해도 0 이고, padding 은 출력 크기를 지킬 뿐이다.

**확인 문제.** 32×32 사진에 5×5 filter 를 padding 0, stride 1 로 대면 출력 크기는? 같은 사진에 3×3 filter 를 padding 1, stride 2 로 대면?

<details><summary>답 보기</summary>

1. $\lfloor (32 + 0 - 5) / 1 \rfloor + 1 = 27 + 1 = 28$ 이라 28×28 이다
2. $\lfloor (32 + 2 - 3) / 2 \rfloor + 1 = \lfloor 15.5 \rfloor + 1 = 15 + 1 = 16$ 이라 16×16 이다

</details>

## 여러 channel 의 convolution

입력 channel 이 여러 장이면 filter 도 입력과 같은 장 수로 만든다. 컬러 사진에 쓰는 3×3 filter 는 3×3 판 3 장이라 숫자가 27 개다. 장마다 겹친
window 와 칸끼리 곱해 더한 뒤, 장마다 나온 값을 모두 더하고 bias 를 한 번 더해 숫자 하나를 낸다.

![입력 channel 이 2 장인 예(숫자는 계산을 보이려고 정한 값). filter 도 입력처럼 2 장이다. channel 마다 겹친 칸끼리 곱해 더한 2 와 2 를 합치고 bias 1 을 더하면 출력의 왼쪽 위 칸 5 가 된다](figures/multi-channel.svg)

위 그림은 계산을 보이려고 숫자를 정한 channel 2 장짜리 예다. 0 번 channel 과 1 번 channel 에서 각각 2 가 나오고, bias 1 을 더해 출력 칸이 5 가 된다.

<details><summary><b>심화: channel 2 장짜리 convolution 손 계산</b></summary>

$$
x_0 = \begin{bmatrix} 1 & 0 & 2 \\ 0 & 1 & 0 \\ 1 & 2 & 1 \end{bmatrix},\quad
x_1 = \begin{bmatrix} 0 & 1 & 1 \\ 1 & 0 & 0 \\ 2 & 1 & 0 \end{bmatrix},\quad
K_0 = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix},\quad
K_1 = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix},\quad b = 1
$$

$x_0$, $x_1$ 은 입력의 0 번·1 번 channel 이고, $K_0$, $K_1$ 은 filter 의 0 번·1 번 장이다.

| 출력 자리 | 0 번 channel 의 window 와 $K_0$ | 1 번 channel 의 window 와 $K_1$ | 합 + $b$ |
| --- | --- | --- | --- |
| $(0, 0)$ | $1 + 0 + 0 + 1 = 2$ | $0 + 1 + 1 + 0 = 2$ | $2 + 2 + 1 = 5$ |
| $(0, 1)$ | $0 + 0 + 0 + 0 = 0$ | $0 + 1 + 0 + 0 = 1$ | $0 + 1 + 1 = 2$ |
| $(1, 0)$ | $0 + 0 + 0 + 2 = 2$ | $0 + 0 + 2 + 0 = 2$ | $2 + 2 + 1 = 5$ |
| $(1, 1)$ | $1 + 0 + 0 + 1 = 2$ | $0 + 0 + 1 + 0 = 1$ | $2 + 1 + 1 = 4$ |

출력은 $\begin{bmatrix} 5 & 2 \\ 5 & 4 \end{bmatrix}$ 다.

</details>

입력이 몇 장이든 filter 하나는 출력 판 한 장을 만들기 때문에, 출력 channel 수는 filter 수와 같다. conv layer(convolution 을 하는 층)
하나의 parameter 수는 입력 channel 수 $C_{\text{in}}$, 출력 channel 수 $C_{\text{out}}$, filter 크기 $k$ 로 정해진다.

$$
\text{parameter 수} = C_{\text{out}} \times (C_{\text{in}} \times k \times k + 1)
$$

| 층 | $C_{\text{in}}$ | $C_{\text{out}}$ | $k$ | 계산 | parameter |
| --- | --- | --- | --- | --- | --- |
| 흑백 사진, 세로선 filter 하나 | 1 | 1 | 3 | $1 \times (1 \times 9 + 1)$ | 10 |
| 컬러 사진, filter 64 개 | 3 | 64 | 3 | $64 \times (3 \times 9 + 1) = 64 \times 28$ | 1,792 |
| ResNet-18 첫 층(bias 없음) | 3 | 64 | 7 | $64 \times 3 \times 49$ | 9,408 |
| LeNet C3 | 6 | 16 | 5 | $16 \times (6 \times 25 + 1) = 16 \times 151$ | 2,416 |

앞 층의 출력 channel 이 다음 층의 입력 channel 이 되므로, 둘째 층의 filter 는 첫 층이 만든 feature map 여러 장을 한꺼번에 보고 "세로선과
가로선이 이 자리에서 만난다" 같은 더 복잡한 모양을 찾는다.

**흔한 오해.** "컬러 사진의 3×3 filter 는 숫자 9 개다." filter 는 입력 channel 마다 한 장씩 있어서 $3 \times 9 = 27$ 개다.

**확인 문제.** 입력 channel 16 장에 3×3 filter 32 개를 쓰는 층의 parameter 는 몇 개일까?

<details><summary>답 보기</summary>

filter 하나는 $16 \times 3 \times 3 = 144$ 개에 bias 1 개를 더해 145 개이고, 32 개면 $32 \times 145 = 4{,}640$ 개다.

</details>

## pooling

사진 전체를 요약하려면 어딘가에서 가로세로를 줄여야 하는데, 이웃한 칸 몇 개를 숫자 하나로 합치는 pooling 이 그 일을 한다. 많이 쓰는 **max
pooling** 은 feature map 을 겹치지 않는 2×2 묶음으로 나누고 묶음마다 가장 큰 값 하나만 남긴다.

![2×2 max pooling. 예로 정한 4×4 feature map 을 겹치지 않는 2×2 묶음 넷으로 나누고 묶음마다 가장 큰 값 3, 2, 2, 4 만 남겨 2×2 를 만든다](figures/max-pool.svg)

위 그림에서 네 묶음의 가장 큰 값은 왼쪽 위부터 차례로 3, 2, 2, 4 라서 결과는 $\begin{bmatrix} 3 & 2 \\ 2 & 4 \end{bmatrix}$ 다. max pooling 에는 학습할 숫자가 없고, "이 2×2 구역
어딘가에 그 특징이 있었는가" 만 남긴 채 구역 안의 정확한 자리는 버린다. 출력 크기는 앞의 공식에 $k = 2$, $s = 2$ 를 넣어 구한다. 묶음의
평균을 남기는 average pooling 도 있다.

같은 묶음 안에서 큰 값이 움직이면 결과가 그대로다. 0 으로 가득 찬 4×4 feature map 에서 $(0, 1)$ 칸만 5 이면 결과는 왼쪽 위만 5 인
$\begin{bmatrix} 5 & 0 \\ 0 & 0 \end{bmatrix}$ 이고, 5 가 $(0, 0)$ 이나 $(1, 1)$ 로 옮겨 가도 같은 묶음이라 결과가 같다. 입력을 옮겨도 출력이
변하지 않는 이 성질을 **translation invariance** 라고 한다. convolution 의 equivariance 는 출력이 함께 옮겨 가는 것이고, invariance 는
출력이 그대로인 것이다. 5 가 $(0, 2)$ 로 넘어가 묶음 경계를 넘으면 결과가 $\begin{bmatrix} 0 & 5 \\ 0 & 0 \end{bmatrix}$ 로 바뀌므로, CNN 이
위치에 완전히 무관해지지는 않는다.

<details><summary><b>심화: convolution → ReLU → pooling 손 계산</b></summary>

convolution 과 pooling 사이에 음수를 0 으로 바꾸는 ReLU($\max(0, z)$)를 끼우면 작은 CNN 이 된다. 5×5 "1" 사진에 세로선 filter(padding 1,
stride 1)를 대고, ReLU 를 적용한 뒤 2×2 max pooling 을 한다. pooling 의 출력 크기는 $\lfloor (5 - 2) / 2 \rfloor + 1 = 2$ 라서 5×5 의 마지막
줄과 마지막 칸은 어느 묶음에도 들지 않는다.

| 단계 | 결과 |
| --- | --- |
| convolution (padding 1) | $\begin{bmatrix} -1 & 0 & 3 & -2 & 0 \\ -1 & -1 & 5 & -3 & 0 \\ -1 & -1 & 5 & -3 & 0 \\ -1 & -1 & 4 & -1 & -1 \\ -1 & 0 & 2 & 0 & -1 \end{bmatrix}$ |
| ReLU | $\begin{bmatrix} 0 & 0 & 3 & 0 & 0 \\ 0 & 0 & 5 & 0 & 0 \\ 0 & 0 & 5 & 0 & 0 \\ 0 & 0 & 4 & 0 & 0 \\ 0 & 0 & 2 & 0 & 0 \end{bmatrix}$ |
| 2×2 max pooling | $\begin{bmatrix} 0 & 5 \\ 0 & 5 \end{bmatrix}$ |

convolution 출력의 가운데 3×3 은 padding 없이 계산한 출력과 같다. 덧댄 0 이 window 에 들어가지 않는 자리이기 때문이다. pooling 의 오른쪽 위 묶음은
0 ~ 1 번 줄, 2 ~ 3 번 칸 $\{3, 0, 5, 0\}$ 이라 5 다.

![작은 CNN 의 계산. 5×5 '1' 사진에 세로선 filter(padding 1)를 대고, ReLU 로 음수를 0 으로 바꾼 뒤 2×2 max pooling 을 하면 윗줄 0, 5 와 아랫줄 0, 5 가 된다. 오른쪽으로 한 칸 옮긴 사진도 똑같은 결과가 나온다](figures/mini-cnn.svg)

사진을 오른쪽으로 한 칸 옮기면 convolution 출력의 3·5·5·4·2 줄이 2 번 칸에서 3 번 칸으로 옮겨 가는데, 2 번 칸과 3 번 칸은 같은 pooling
묶음이라 결과가 원래와 똑같다.

| 입력 | MLP neuron 의 곱해 더한 값 | 작은 CNN 의 결과 |
| --- | --- | --- |
| 원래 사진 | 8 | $\begin{bmatrix} 0 & 5 \\ 0 & 5 \end{bmatrix}$ |
| 오른쪽으로 한 칸 | 3 | $\begin{bmatrix} 0 & 5 \\ 0 & 5 \end{bmatrix}$ |
| 왼쪽으로 한 칸 | 3 | $\begin{bmatrix} 5 & 0 \\ 5 & 0 \end{bmatrix}$ |

왼쪽으로 옮기면 세로획이 1 번 칸으로 가서 왼쪽 묶음에 들어가므로 결과도 바뀌지만, "위아래로 길게 세로선이 있다" 는 내용(5 와 5)은 그대로
남고 자리만 바뀐다.

</details>

## LeNet

convolution 과 pooling 뒤에 MLP 를 붙이면 사진을 보고 답을 고르는 모델이 된다. LeCun 등이 1998 년 손글씨 숫자를 알아보려고 만든 LeNet-5 가
그 예다. 아래 그림은 LeNet-5 를 MNIST 의 28×28 사진에 맞추고 ReLU 와 max pooling 을 쓰도록 바꾼 형태다.

![LeNet. 28×28 사진 1 장이 conv 와 pooling 을 두 번 거쳐 5×5 판 16 장, 숫자 400 개가 되고, 펼쳐서 Linear 세 층을 지나 숫자 10 개가 된다. 초록 글씨는 그 층의 parameter 수이고 모두 합하면 61,706 개다](figures/lenet5.svg)

그림에서 C 는 convolution 이고, S 는 크기를 줄이는 subsampling(여기서는 max pooling)이며, F 는 입력마다 weight 를 곱해 더하는 Linear layer 다.

conv 층을 지날 때마다 channel 수는 1 → 6 → 16 으로 늘고, 가로세로는 층을 지나며 28 → 14 → 10 → 5 로 준다. 사진의 "어디에" 정보는
줄이고 "무엇이 있는가" 를 담는 feature 의 종류는 늘리는 구조다. parameter 는 모두 61,706 개로, [PyTorch Training Loop](../pytorch-mlp/README.md)
의 MNIST MLP(784 → 256 → 10)에 있는 203,530 개의 3 분의 1 이 안 된다.

원 논문의 LeNet-5 는 32×32 사진을 받고 ReLU 가 아니라 S 자 모양의 함수를 쓴다. max pooling 자리에는 학습하는 계수가 붙은 subsampling 이 있고,
C3 의 filter 는 S2 의 channel 가운데 일부만 본다. 논문에 따르면 전체 연결은 340,908 개지만 weight sharing 덕분에 학습할 parameter 는 60,000 개다.

<details><summary><b>심화: LeNet 의 층별 크기와 parameter 수</b></summary>

| 층 | 하는 일 | 크기 계산 | 출력 크기 |
| --- | --- | --- | --- |
| C1 | 5×5 filter 6 개, padding 2, ReLU | $\lfloor (28 + 4 - 5)/1 \rfloor + 1 = 28$ | $6 \times 28 \times 28$ |
| S2 | 2×2 max pooling | $\lfloor (28 - 2)/2 \rfloor + 1 = 14$ | $6 \times 14 \times 14$ |
| C3 | 5×5 filter 16 개, padding 0, ReLU | $\lfloor (14 - 5)/1 \rfloor + 1 = 10$ | $16 \times 10 \times 10$ |
| S4 | 2×2 max pooling | $\lfloor (10 - 2)/2 \rfloor + 1 = 5$ | $16 \times 5 \times 5$ |
| F5 → F6 → 출력 | 400 개로 편 뒤 Linear 400 → 120 → 84 → 10 | | 10 |

Linear layer 의 parameter 는 "입력 수 × 출력 수 + 출력 수(bias)" 로 센다. S2, S4 는 max pooling 이라 parameter 가 없다.

| 층 | 계산 | parameter |
| --- | --- | --- |
| C1 | $6 \times (1 \times 5 \times 5 + 1)$ | 156 |
| C3 | $16 \times (6 \times 5 \times 5 + 1)$ | 2,416 |
| F5 | $400 \times 120 + 120$ | 48,120 |
| F6 | $120 \times 84 + 84$ | 10,164 |
| 출력 | $84 \times 10 + 10$ | 850 |
| 합 | $156 + 2{,}416 + 48{,}120 + 10{,}164 + 850$ | 61,706 |

parameter 는 대부분 뒤쪽 Linear layer 에 있는데, 그 layer 가 보는 것은 사진 784 개 pixel 이 아니라 conv 와 pooling 이 줄여 놓은 400 개
숫자다.

</details>

**확인 문제.** LeNet 의 C3 filter 를 16 개가 아니라 8 개로 줄이면 C3 의 parameter 와 펼친 숫자의 개수는 각각 몇 개가 될까?

<details><summary>답 보기</summary>

C3 은 $8 \times (6 \times 25 + 1) = 8 \times 151 = 1{,}208$ 개다. S4 출력이 $8 \times 5 \times 5$ 라 펼친 숫자는 200 개가 된다.

</details>

## receptive field

LeNet 의 C1 filter 는 5×5 조각밖에 보지 못하는데, 숫자 "8" 과 "0" 을 가르려면 고리가 둘인지 하나인지 알아야 하므로
사진의 넓은 영역을 한꺼번에 봐야 한다. 출력 한 칸의 값을 계산할 때 쓰인 입력 영역을 그 칸의 **receptive field** 라고 한다. 원래는 신경과학 용어로, 눈의 신경세포 하나가
반응하는 시야의 범위를 가리키던 말이다.

3×3 convolution 의 출력 한 칸은 입력 3×3 을 본다. 그 위에 3×3 convolution 을 한 번 더 쌓으면 2 층의 한 칸은 1 층 출력 3×3 을 본다.
그 3×3 가운데 왼쪽 끝 칸이 보는 입력은 0 ~ 2 번 칸이고 오른쪽 끝 칸이 보는 입력은 2 ~ 4 번 칸이라서, 2 층의 한 칸에는 입력 5×5 전체가 반영된다.

![3×3 conv 를 두 번 쌓으면 2 층 출력의 한 칸은 1 층 출력 3×3 을 보고, 그 3×3 은 입력 5×5 전체를 본다. 층이 깊어질수록 한 칸이 보는 입력 영역이 넓어진다](figures/receptive-field.svg)

| 쌓은 3×3 conv 수 | receptive field |
| --- | --- |
| 1 | 3 |
| 2 | $3 + 2 = 5$ |
| 3 | $5 + 2 = 7$ |
| 10 | $1 + 10 \times 2 = 21$ |

filter 크기가 $k$ 이고 stride 가 1 이면 층마다 $k - 1$ 씩 넓어져 $L$ 층 뒤에는 $1 + L \times (k - 1)$ 이 된다. stride 나 pooling 이 끼면 훨씬
빨리 넓어져서, LeNet 의 S4 한 칸은 28×28 사진 가운데 16×16 을 본다. stride 까지 넣어 계산하면 ResNet-18 의 마지막 층 한 칸은 435×435 영역을
보는데, ACT 의 480×640 사진에서는 세로 거의 전체에 해당한다.

층마다 새로 배우는 것은 바로 아래층 feature 의 조합뿐이지만, 층이 쌓이면 짧은 선 → 모서리 → 부분 → 물체 순서로 큰 패턴이 만들어진다.

**흔한 오해.** "filter 가 커야 큰 물체를 알아본다." LeNet 의 filter 는 끝까지 5×5 지만 S4 의 한 칸은 16×16 을 보고, ResNet-18 의 filter 는
대부분 3×3 이다. 큰 패턴은 큰 filter 가 아니라 깊은 층에서 나온다.

<details><summary><b>심화: stride 와 pooling 이 섞인 receptive field 계산</b></summary>

2×2 pooling 뒤의 feature map 에서는 이웃한 두 칸이 원래 사진에서 2 pixel 떨어진 곳을 대표한다. 이웃한 두 칸이 원래 사진에서 떨어진 거리를
간격이라고 부르면, receptive field 와 간격은 층마다 아래 두 규칙으로 계산한다.

- 새 receptive field = 이전 receptive field + $(k - 1)$ × 이전 간격
- 새 간격 = 이전 간격 × stride

| 층 | $k$, stride | receptive field 계산 | receptive field | 간격 |
| --- | --- | --- | --- | --- |
| 입력 | | | 1 | 1 |
| C1 | 5, 1 | $1 + 4 \times 1$ | 5 | 1 |
| S2 | 2, 2 | $5 + 1 \times 1$ | 6 | 2 |
| C3 | 5, 1 | $6 + 4 \times 2$ | 14 | 2 |
| S4 | 2, 2 | $14 + 1 \times 2$ | 16 | 4 |

ResNet-18 은 7×7 stride 2 conv, 3×3 stride 2 max pooling 뒤에 3×3 conv 16 개를 쌓고, 그 가운데 stage 2·3·4 의 첫 conv 가 stride 2 다.

| 구간 | receptive field 계산 | receptive field | 간격 |
| --- | --- | --- | --- |
| 7×7 conv, stride 2 | $1 + 6 \times 1$ | 7 | 2 |
| 3×3 max pooling, stride 2 | $7 + 2 \times 2$ | 11 | 4 |
| stage 1 (conv 4 개) | $11 + 4 \times (2 \times 4)$ | 43 | 4 |
| stage 2 (첫 conv stride 2, 뒤 3 개) | $43 + 2 \times 4 + 3 \times (2 \times 8)$ | 99 | 8 |
| stage 3 | $99 + 2 \times 8 + 3 \times (2 \times 16)$ | 211 | 16 |
| stage 4 | $211 + 2 \times 16 + 3 \times (2 \times 32)$ | 435 | 32 |

마지막 간격 32 는 출력의 이웃한 두 칸이 사진에서 32 pixel 떨어져 있다는 뜻이다.

</details>

## 로봇 policy 의 image encoder

로봇이 지금 보는 것(observation)을 받아 다음 행동(action)을 내는 모델을 policy 라고 한다. 카메라 사진을 펼쳐 MLP policy 에 넣으면 앞에서
본 parameter 와 위치 문제가 그대로 생겨서, 사진은 CNN 으로 먼저 줄이고 관절 각도 같은 다른 숫자와 함께 policy 에 넣는다. 이 CNN 을 image
encoder 라고 부른다.

![ACT 의 image encoder. 카메라 한 대의 480×640×3 사진(숫자 921,600 개)을 ResNet-18 이 전체 stride 32 로 줄여 15×20×512 feature map(153,600 개)을 만들고, 위치 300 곳의 feature 512 개씩을 카메라 4 대 모아 1,200 곳으로 transformer 에 넣는다. 관절 각도 14 개도 함께 들어가 action chunk 를 낸다](figures/act-encoder.svg)

[ACT](../act/README.md) 는 ALOHA 의 카메라 네 대가 보내는 480×640×3 사진을 ResNet-18 로 각각 15×20×512 feature map 으로 바꾼다. ResNet-18 은
stride 2 인 층을 다섯 번 지나 가로세로가 $2^5 = 32$ 분의 1 이 되므로 $480 \div 32 = 15$, $640 \div 32 = 20$ 이다. 이 map 을 위치 300 곳, 곳마다
숫자 512 개로 펴고, 카메라 네 대를 이으면 1,200 곳이 된다. 거기에 관절 각도 14 개를 더해 transformer 에 넣으면 앞으로 $k$ step 동안의 관절
목표 $k \times 14$ 개가 나온다.

| 단계 | 크기 | 숫자 개수 |
| --- | --- | --- |
| 카메라 사진 한 장 | $3 \times 480 \times 640$ | 921,600 |
| ResNet-18 의 feature map | $512 \times 15 \times 20$ | 153,600 |
| 카메라 네 대의 feature | 1,200 곳 × 512 | 614,400 |

숫자 개수는 6 분의 1 로만 줄었지만, pixel 은 그 자리의 밝기일 뿐이고 feature map 의 한 곳은 그 자리의 receptive field 안에 무엇이 있는지를
512 개 숫자로 적은 값이다. ImageNet 분류용 ResNet-18 은 마지막 7×7×512 map 을 global average pooling 으로 평균 내어 512 개로 만든 뒤 1000 class 점수를 내는데, ACT 는 이 평균과 분류 층을 떼어 내고 15×20 의 자리 구분을 그대로 남긴다.

**확인 문제.** 카메라 사진이 384×512 이면 ResNet-18 의 feature map 은 몇 곳이고, 숫자는 몇 개일까? 전체 stride 는 32 다.

<details><summary>답 보기</summary>

① 가로세로: $384 \div 32 = 12$, $512 \div 32 = 16$

② 위치 수: $12 \times 16 = 192$ 곳

③ 숫자 개수: $192 \times 512 = 98{,}304$ 개

답: 192 곳, 숫자 98,304 개다.

</details>

## 위치 정보와 spatial softmax

사진 분류에서는 고양이가 사진 어디에 있든 답이 "고양이" 라서, pooling 으로 자리를 버리는 translation invariance 가 쓸모 있다. 로봇 제어는
반대로 컵이 어디 있는지에 따라 손을 뻗을 곳이 정해지므로 자리를 버리면 안 된다. Levine 등(2016)은 PR2 로봇 팔을 카메라 사진으로 직접 움직이는
CNN policy 를 만들며 "위치 정보가 제어에 중요해서 pooling 을 쓰지 않는다" 고 적었다.

이들은 pooling 을 빼고 **spatial softmax** 를 넣었다. 마지막 conv 층의 channel 마다 feature map 전체에 softmax 를 걸어 자리마다 확률을
만들고, 그 확률로 열 번호와 줄 번호의 평균을 내어 그 channel 의 특징이 사진 어디에 있는지를 숫자 두 개짜리 좌표 $(x, y)$ 로 낸다.

![global average pooling 과 spatial softmax. 예로 정한 3×3 feature map 에서 6 이 (1, 2) 에 있을 때와 (1, 0) 에 있을 때 global average pooling 은 둘 다 6 ÷ 9 = 0.67 이라 자리를 구분하지 못하고, spatial softmax 는 (x, y) = (1.98, 1.00) 과 (0.02, 1.00) 으로 자리를 좌표로 남긴다](figures/spatial-softmax.svg)

위 그림의 feature map 은 계산을 보이려고 정한 값이다. 평균은 6 이 어디 있든 0.67 이지만, spatial softmax 의 $x$ 는 6 이 오른쪽 열에 있으면
1.98, 왼쪽 열에 있으면 0.02 다.

| 시스템 | 사진 | CNN 출력에서 위치를 남기는 방법 |
| --- | --- | --- |
| Levine 등(2016) | $3 \times 240 \times 240$ | conv 3 층 뒤의 32 channel(각 109×109)에 spatial softmax 를 걸어 좌표 32 개(숫자 64 개)를 냄 |
| Diffusion Policy(2023) | Push-T 에서 96×96 을 84×84 로 잘라 씀 | ResNet-18 의 global average pooling 을 spatial softmax 로 바꿈 |
| ACT(2023) | $3 \times 480 \times 640$ | pooling 없이 15×20 feature map 을 펴고 자리마다 2D position embedding 을 더함 |

Levine 등의 network 는 parameter 가 약 92,000 개이고 1초에 20 번 관절 torque 를 냈다. spatial softmax 는 마지막 conv 층의 숫자
380,192 개($32 \times 109 \times 109$)를 64 개로 줄였다. Diffusion Policy 에서는 ResNet-18 을 미리 학습해 두지
않고 policy 와 함께 처음부터 학습했다.

**흔한 오해.** "CNN 은 위치에 무관하게 물체를 알아보니 로봇에도 그대로 좋다." convolution 은 입력이 옮겨 가면 출력도 함께 옮겨 가는
equivariance 를 가질 뿐이고, 위치를 지우는 것은 pooling 이다.

<details><summary><b>심화: spatial softmax 의 계산</b></summary>

channel $c$ 의 feature map 값 $a_{ij}$ 에 softmax 를 걸면 자리 $(i, j)$ 의 확률은 $s_{ij} = e^{a_{ij}} / \sum_{i'j'} e^{a_{i'j'}}$ 이다. 위 그림의 map
은 6 이 하나이고 0 이 여덟 개라서 분모가 $e^6 + 8 \times e^0 \approx 403.4 + 8 = 411.4$ 다.

| 자리 | 값 | 확률 |
| --- | --- | --- |
| 6 이 있는 칸 | $e^6 \approx 403.4$ | $403.4 \div 411.4 \approx 0.9806$ |
| 나머지 8 칸 | $e^0 = 1$ | $1 \div 411.4 \approx 0.0024$ |

좌표는 확률로 낸 평균 $x = \sum s_{ij} \times (\text{열 번호})$, $y = \sum s_{ij} \times (\text{줄 번호})$ 다. 6 이 $(1, 2)$ 에 있으면 2 번 열의
확률 합은 $0.9806 + 2 \times 0.0024 \approx 0.9855$ 이고, 1 번 열은 $3 \times 0.0024 \approx 0.0073$ 이라서
$x \approx 0 + 1 \times 0.0073 + 2 \times 0.9855 \approx 1.98$ 이다. 줄은 위아래가 대칭이라 $y = 1.00$ 이다. 이 계산은 미분할 수 있어서,
policy 의 loss 로 conv 층까지 함께 학습할 수 있다.

</details>

## GQ-CNN 과 PointPillars

CNN 은 policy 의 image encoder 말고 로봇의 인식 모듈에도 쓰인다. 아래 두 예는 모두 입력을 CNN 이 받을 수 있는 격자로 먼저 바꾼다.

[Grasp Planning](../grasping/README.md) 에서 다루는 Dex-Net 2.0 의 GQ-CNN 은 grasp 후보마다 성공 확률을 낸다. 후보의 중심이 가운데에 오고
gripper 축이 가로가 되도록 depth image 를 옮기고 돌려 32×32 로 자른 뒤, gripper 의 깊이 $z$ 와 함께 넣는다. convolution 의 equivariance 는 평행 이동에만 성립하고
회전에는 성립하지 않아서, 사진을 grasp 방향에 맞춰 돌려 넣으면 network 가 grasp 방향마다 따로 배울 필요가 없다. 학습 방법은
[filter 학습](#filter-학습) 에서 본 것과 같아서, 합성 데이터 670 만 개마다 붙은 "견고한 grasp 인가" label 로 cross-entropy loss 를 줄인다.

[LiDAR Perception](../lidar-perception/README.md) 에서 다루는 PointPillars 는 LiDAR 의 점 구름을 위에서 내려다본 0.16 m × 0.16 m 칸(pillar)으로
나누고, 칸마다 점들을 숫자 64 개로 요약해 64 channel 사진처럼 만든다(pseudo-image). 여기에 3×3 conv 층을 쌓은 2D CNN 을 대어 물체를 감싸는
3D 상자를 낸다. KITTI 에서 차량을 찾는 범위 70.4 m × 80 m 를 0.16 m 로 나누면 $440 \times 500 = 220{,}000$ 칸인데, 논문에 따르면 점이 든 칸은 6,000 ~ 9,000 개뿐이다.

| 시스템 | CNN 입력 | 출력 | 논문의 숫자 |
| --- | --- | --- | --- |
| GQ-CNN | 32×32 depth crop + gripper 깊이 $z$ | grasp 성공 확률 | parameter 약 1,800 만 개, 아는 물체 8 개에서 성공률 93%, 계획에 0.8 초 |
| PointPillars | 64 channel pseudo-image | 3D 상자와 class | scan 하나에 16.2 ms(62 Hz), 그 가운데 2D CNN 과 detection head 가 7.7 ms |

## 정리

- convolution 은 작은 filter 를 사진 위에서 옮기며 window 와 칸끼리 곱해 더한다. 세로선 filter 를 5×5 "1" 사진에 대면 세로획 자리에 5, 5, 4 가
  모인 feature map 이 나온다. filter 숫자는 사진마다 붙은 label 로 만든 loss 의 gradient 를 mini-batch 평균으로 받아 고쳐진다
- weight sharing 덕분에 3×3 filter 하나는 사진 크기와 상관없이 parameter 가 10 개이고, 입력이 옮겨 가면 출력도 같은 만큼 옮겨 간다. 출력 길이는
  $\lfloor (H + 2p - k)/s \rfloor + 1$ 이다. stride·pooling 과 깊은 층이 receptive field 를 넓혀서 ResNet-18 의 마지막 한 칸은 435×435 를 본다
- 로봇 image encoder 는 자리를 지우는 pooling 을 빼고 feature map 을 그대로 쓰거나(ACT 의 15×20×512) spatial softmax 로 좌표를 뽑는다. GQ-CNN 은
  grasp 에 맞춰 자른 depth image 를 CNN 에 넣고, PointPillars 는 점 구름으로 만든 pseudo-image 를 넣는다

LeNet 은 conv 층이 둘뿐이라 작고 단순한 사진만 다룰 수 있다. 그렇다고 층을 수십 개 쌓기만 하면 gradient 가 앞쪽 층까지 잘 전해지지 않아
오히려 학습이 잘 되지 않는다. 다음 강의인 [ResNet](../resnet/README.md) 은 입력을 출력에 더하는 연결로 이 문제를 푼다. [DDPM](../ddpm/README.md) 은
conv 층으로 그림의 noise 를 제거하는 생성 모델을 다룬다. grasp 후보를 고르는 전체 계획은 [Grasp Planning](../grasping/README.md) 에서 다루고,
점 구름에서 물체를 찾는 pipeline 은 [LiDAR Perception](../lidar-perception/README.md) 에서 다룬다.

## 참고 자료

- Yann LeCun 외, [Gradient-Based Learning Applied to Document Recognition](http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf) (1998) — LeNet-5
  의 원 논문. II-B 절에 층별 크기와 parameter 수가 있다
- Sergey Levine 외, [End-to-End Training of Deep Visuomotor Policies](https://arxiv.org/abs/1504.00702) (JMLR 2016) — 카메라 사진에서 바로 관절
  torque 를 내는 CNN policy. 5.1 절에 pooling 을 쓰지 않은 이유와 spatial softmax 가 있다
- Tony Z. Zhao 외, [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705) (RSS 2023) — ACT 논문.
  IV-C 절에 ResNet-18 이 480×640 사진을 15×20×512 feature map 으로 바꾸는 과정이 있다
- Cheng Chi 외, [Diffusion Policy](https://arxiv.org/abs/2303.04137) (RSS 2023) — arXiv v5 의 3.2 절에 ResNet-18 image encoder 의 global average
  pooling 을 spatial softmax 로 바꾸고 BatchNorm 을 GroupNorm 으로 바꾼 이유가 있다
- Jeffrey Mahler 외, [Dex-Net 2.0](https://arxiv.org/abs/1703.09312) (RSS 2017) — GQ-CNN. IV-B 절과 Fig. 4 에 입력 정렬, 구조, 첫 층 filter 그림이 있다
- Alex H. Lang 외, [PointPillars](https://arxiv.org/abs/1812.05784) (CVPR 2019) — 점 구름을 pseudo-image 로 바꿔 2D CNN 에 넣는 방법. 2 절에 구조가 있고
  6 절에 실행 시간 내역이 있다
- Stanford CS231n, [Convolutional Neural Networks 강의 노트](https://cs231n.github.io/convolutional-networks/) — 출력 크기 공식, parameter sharing,
  pooling 을 그림과 함께 정리한 글. "Convolutional Layer" 절의 움직이는 그림에 여러 channel 의 계산이 있다
- Vincent Dumoulin, Francesco Visin, [A guide to convolution arithmetic for deep learning](https://arxiv.org/abs/1603.07285) — padding·stride 조합마다
  출력 크기가 어떻게 되는지 그림으로 정리한 글
- [CNN Explainer](https://poloclub.github.io/cnn-explainer/) — 작은 CNN 의 feature map 과 filter 계산을 브라우저에서 눌러 보며 따라가는 도구
