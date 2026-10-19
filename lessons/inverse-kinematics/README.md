---
id: inverse-kinematics
title: Inverse Kinematics
branch: robotics
requires: [forward-kinematics]
hours: 3
summary: 손끝 목표 위치에서 joint angle 을 구하는 IK 를 2 관절 팔의 해석적 풀이와 Jacobian 반복법(transpose·pseudo-inverse·damped least squares)으로 손 계산한다
papers:
  - title: "Resolved Motion Rate Control of Manipulators and Human Prostheses"
    authors: Daniel E. Whitney
    year: 1969
    url: https://doi.org/10.1109/TMMS.1969.299896
  - title: "Inverse Kinematic Solutions With Singularity Robustness for Robot Manipulator Control"
    authors: Yoshihiko Nakamura, Hideo Hanafusa
    year: 1986
    url: https://doi.org/10.1115/1.3143764
  - title: "Manipulator Inverse Kinematic Solutions Based on Vector Formulations and Damped Least-Squares Methods"
    authors: Charles W. Wampler
    year: 1986
    url: https://doi.org/10.1109/TSMC.1986.289285
  - title: "Introduction to Inverse Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods"
    authors: Samuel R. Buss
    year: 2004
    url: https://mathweb.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf
---

# Inverse Kinematics

## 학습 목표

- 손끝을 두고 싶은 자리에서 거꾸로 관절 각도를 구하는 문제가 무엇이고, 답이 둘이거나 없을 수 있는 이유를 설명할 수 있다
- 관절 두 개짜리 평면 팔에서 목표 위치에 맞는 관절 각도 두 쌍을 손으로 계산할 수 있다
- 관절 하나를 조금 돌렸을 때 손끝이 얼마나, 어느 쪽으로 움직이는지 계산하고 그 비율을 표 하나로 묶을 수 있다
- 그 표를 써서 관절 각도를 조금씩 고쳐 가며 목표에 다가가는 과정을 한 단계씩 따라갈 수 있다
- 팔을 쭉 폈을 때 이 계산이 왜 터무니없이 큰 값을 내는지, 그것을 막는 방법이 무엇인지 숫자로 설명할 수 있다
- 팔이 닿지 않는 목표를 계산으로 알아보고, 그때 반복 계산이 어떻게 움직이는지 설명할 수 있다

## 손끝 위치에서 joint angle 로

### forward kinematics 다시 보기

[Forward Kinematics](../forward-kinematics/README.md) 에서는 단단한 막대(link) 두 개가 돌아가는 마디(joint) 두 개로 이어진 평면 팔을
다뤘다. 바닥에 고정된 joint 1 은 원점 $(0, 0)$ 에 있고, link 길이는 둘 다 1 이다($L_1 = L_2 = 1$). joint 가 돌아간 각도를 joint
angle 이라 하고 $\theta_1$, $\theta_2$ 로 적는다. $\theta$ 는 그리스 문자 theta(세타)다. $\theta_2$ 는 바닥이 아니라 link 1 이 뻗은
방향에서 잰 상대 각도라서, link 2 는 바닥에서 보아 $\theta_1 + \theta_2$ 방향을 가리킨다.

joint angle 에서 팔 끝(손끝, end-effector)의 위치 $(x, y)$ 를 구하는 계산이 forward kinematics(FK)였고, 식은 아래와 같았다.

$$
x = L_1\cos\theta_1 + L_2\cos(\theta_1 + \theta_2)
$$

$$
y = L_1\sin\theta_1 + L_2\sin(\theta_1 + \theta_2)
$$

$\cos\theta$ 와 $\sin\theta$ 는 길이 1 짜리 막대를 $\theta$ 만큼 돌렸을 때 막대 끝의 가로 위치와 세로 위치다. 그래서 첫 식은 "팔꿈치의
가로 위치 $L_1\cos\theta_1$ 에, link 2 가 더하는 가로 길이 $L_2\cos(\theta_1 + \theta_2)$ 를 더한다" 로 읽는다. $\theta_1 = 30°$,
$\theta_2 = 60°$ 를 넣으면 팔꿈치는 $(0.866, 0.5)$, link 2 는 $90°$ 방향이라 손끝은 $(0.866, 0.5 + 1) = (0.866, 1.5)$ 다.

이 강의에서 자주 쓰는 각도의 cos·sin 값을 다시 모았다.

| 각도 | $\cos$ (가로) | $\sin$ (세로) |
| --- | --- | --- |
| $0°$ | 1 | 0 |
| $30°$ | 0.866 | 0.5 |
| $45°$ | 0.707 | 0.707 |
| $60°$ | 0.5 | 0.866 |
| $90°$ | 0 | 1 |
| $120°$ | $-0.5$ | 0.866 |
| $180°$ | $-1$ | 0 |

$120°$ 는 FK 강의의 표에 없던 값이다. $120°$ 로 돌린 막대는 $60°$ 로 돌린 막대를 세로축에 비춰 뒤집은 자리에 있어서, 세로 위치는
같고 가로 위치만 부호가 바뀐다. 그래서 $\cos 120° = -\cos 60° = -0.5$ 다. 각도에 음수를 넣으면 막대가 가로축 아래로 내려가므로,
$\cos(-60°) = \cos 60° = 0.5$ 이고 $\sin(-60°) = -\sin 60° = -0.866$ 이다.

**확인 문제.** $\theta_1 = 0°$, $\theta_2 = 90°$ 이면 손끝은 어디일까?

<details><summary>답 보기</summary>

팔꿈치는 $(\cos 0°, \sin 0°) = (1, 0)$ 이고, link 2 는 $0° + 90° = 90°$ 방향이라 더할 칸이 $(0, 1)$ 이다. 손끝은 $(1, 1)$ 이다.

</details>

### inverse kinematics

로봇이 실제로 받는 일은 대부분 "손끝을 어디에 두라" 는 꼴이다. 카메라가 컵을 찾아 "컵은 $(0.866, 1.5)$ 에 있다" 고 알려 주면,
로봇은 손끝을 그 자리에 보내야 한다. 그런데 로봇이 직접 움직일 수 있는 것은 joint 의 모터뿐이라서, 모터에 보낼 명령은 손끝
위치가 아니라 joint angle 이어야 한다. 그래서 "손끝을 $(0.866, 1.5)$ 에 두려면 $\theta_1$, $\theta_2$ 가 얼마여야 하나" 를 계산해야
한다.

이렇게 손끝 위치에서 거꾸로 joint angle 을 구하는 계산을 inverse kinematics 라 하고, 줄여서 IK 라고 쓴다. inverse 는 "거꾸로" 라는
뜻이다. FK 가 원인(joint angle)에서 결과(손끝 위치)로 가는 계산이라면, IK 는 결과에서 원인을 찾아가는 계산이다.

![FK 와 IK 의 방향. FK 는 (30°, 60°) 에서 손끝 (0.866, 1.5) 하나를 낸다. IK 는 (0.866, 1.5) 에서 joint angle 두 쌍을 내고, 팔이 닿지 않는 (3, 0) 에서는 답을 내지 못한다](figures/ik-overview.svg)

위 그림은 두 계산의 방향을 나란히 보여 준다. 윗줄의 FK 는 joint angle 을 넣으면 손끝 위치가 하나로 정해진다. 아랫줄의 IK 는
같은 손끝 $(0.866, 1.5)$ 에서 출발하는데, 답이 $(30°, 60°)$ 와 $(90°, -60°)$ 두 쌍이 나온다. 손끝을 $(3, 0)$ 에 두라고 하면 길이
1 짜리 link 두 개로는 원점에서 3 만큼 떨어진 곳에 닿을 수 없으므로 답이 없다.

**확인 문제.** 다음 중 IK 로 답하는 질문은 어느 것일까? (가) "joint angle 이 $(45°, 45°)$ 일 때 손끝은 어디인가?" (나) "손끝을
$(1, 1)$ 에 두려면 joint angle 이 얼마여야 하나?"

<details><summary>답 보기</summary>

(나)다. 손끝 위치에서 joint angle 을 구하므로 IK 다. (가)는 joint angle 에서 손끝 위치를 구하므로 FK 다.

</details>

### 답의 개수

FK 는 joint angle 을 공식에 넣으면 손끝 위치 하나가 나오므로 언제나 답이 하나지만, IK 는 답의 개수가 정해져 있지 않다.

- **답이 둘** — FK 강의에서 $(0°, 90°)$ 와 $(90°, -90°)$ 는 팔 모양이 다른데 손끝이 둘 다 $(1, 1)$ 이었다. 팔꿈치를 한쪽으로 꺾어도,
  반대쪽으로 꺾어도 같은 자리에 손끝이 닿기 때문이다
- **답이 하나** — 팔을 일직선으로 쭉 펴야만 닿는 자리, 예를 들어 $(2, 0)$ 은 $(0°, 0°)$ 하나뿐이다
- **답이 없음** — 원점에서 $L_1 + L_2 = 2$ 보다 먼 자리에는 어떤 joint angle 로도 닿지 않는다

joint 가 셋 이상이면 답이 끝없이 많을 수도 있다. 이 경우는 뒤의 "실제 로봇의 IK" 절에서 숫자로 확인한다. IK 는 식을 정리해 답을 바로 구하는
해석적 풀이로 풀 수도 있고, FK 를 여러 번 되풀이하며 조금씩 다가가는 반복 계산으로 풀 수도 있다. 2 관절 평면 팔은 해석적 풀이가 가능하므로 그것부터 손으로 풀어 본다.

**확인 문제.** link 길이가 $L_1 = 2$, $L_2 = 1$ 인 팔은 원점에서 최대 얼마나 먼 곳까지 닿을까?

<details><summary>답 보기</summary>

두 link 를 일직선으로 펴면 손끝은 원점에서 $2 + 1 = 3$ 만큼 떨어진다. 이보다 먼 곳에는 닿지 않는다.

</details>

**요약**

- IK 는 손끝 위치에서 joint angle 을 구하는 계산이고, 로봇은 모터에 joint angle 을 보내야 하므로 IK 가 필요하다
- FK 의 답은 늘 하나지만, IK 는 같은 손끝에 답이 둘이기도 하고, 팔이 닿지 않으면 답이 없기도 하다

## 2 관절 팔의 해석적 풀이

식을 정리해 답을 공식으로 바로 구하는 방법을 해석적 풀이(analytic solution) 또는 closed-form 해라고 한다. closed-form 은 "정해진
횟수의 계산으로 닫히는 식" 이라는 뜻으로, 반복 없이 공식 한 번으로 답이 나온다는 의미다. 2 관절 팔에서는 $\theta_2$ 를 먼저
구하고, 그 값을 써서 $\theta_1$ 을 구한다. 예로 쓸 목표는 FK 강의의 $(30°, 60°)$ 가 만든 손끝 $(0.866, 1.5)$ 다. 답을 이미 알고
있으니 풀이가 맞는지 바로 확인할 수 있다.

### 목표까지의 거리

먼저 원점(joint 1)에서 목표까지의 거리 $d$ 를 구한다. 좌표가 $(x, y)$ 인 점은 원점에서 가로로 $x$, 세로로 $y$ 만큼 떨어져 있고,
이 두 길이와 거리 $d$ 가 직각삼각형을 이룬다. 그래서 피타고라스 정리(직각을 낀 두 변의 제곱을 더하면 가장 긴 변의 제곱)로
$d^2 = x^2 + y^2$ 이다. 목표 $(0.866, 1.5)$ 에서는 아래와 같다.

$$
d^2 = 0.866^2 + 1.5^2 = 0.75 + 2.25 = 3
$$

제곱해서 3 이 되는 수는 약 1.732 이므로 $d \approx 1.732$ 다. 기호 $\approx$ 는 "약" 이라고 읽는다. 뒤의 계산에는 $d$ 보다
$d^2$ 이 바로 쓰이므로 $d^2 = 3$ 을 기억해 둔다.

**확인 문제.** 목표 $(1, 1)$ 까지의 거리의 제곱 $d^2$ 은?

<details><summary>답 보기</summary>

$1^2 + 1^2 = 2$ 다. 거리는 약 1.414 다.

</details>

### θ₁ = 0 인 팔과 θ₂

joint 1 을 돌리면 팔 전체가 원점을 중심으로 함께 돈다. 이때 손끝은 원점을 중심으로 원을 그리므로, 원점에서 손끝까지의 거리는
$\theta_1$ 이 얼마든 바뀌지 않는다. [Rigid Transforms](../transforms/README.md) 에서 본 것처럼 회전은 길이를 바꾸지 않기 때문이다.
그래서 손끝까지의 거리는 $\theta_2$ 하나로만 정해진다.

거리를 계산하기 쉽게 $\theta_1 = 0°$ 으로 둔 팔을 본다. link 1 이 가로축을 따라 놓이므로 팔꿈치는 $(L_1, 0)$ 이고, link 2 는
$0° + \theta_2 = \theta_2$ 방향을 가리킨다. 그러면 손끝은 아래와 같다.

$$
(L_1 + L_2\cos\theta_2,\ \ L_2\sin\theta_2)
$$

이 식은 "팔꿈치 $(L_1, 0)$ 에, 길이 $L_2$ 막대를 $\theta_2$ 만큼 돌린 칸 $(L_2\cos\theta_2, L_2\sin\theta_2)$ 를 더한다" 는 뜻이다.
$L_1 = L_2 = 1$ 에서 $\theta_2$ 를 바꿔 가며 손끝과 거리를 계산하면 아래 표가 된다.

| $\theta_2$ | 손끝 $(1 + \cos\theta_2,\ \sin\theta_2)$ | $d^2$ | $d$ |
| --- | --- | --- | --- |
| $0°$ | $(2, 0)$ | 4 | 2 |
| $60°$ | $(1.5, 0.866)$ | $2.25 + 0.75 = 3$ | 1.732 |
| $90°$ | $(1, 1)$ | 2 | 1.414 |
| $120°$ | $(0.5, 0.866)$ | $0.25 + 0.75 = 1$ | 1 |
| $180°$ | $(0, 0)$ | 0 | 0 |

$\theta_2 = 0°$ 이면 팔이 쭉 펴져 가장 멀리 닿고, $\theta_2$ 가 커질수록 팔꿈치가 접혀 손끝이 원점에 가까워진다. $180°$ 이면 link 2
가 link 1 위로 완전히 접혀 손끝이 원점으로 돌아온다. 목표의 $d^2 = 3$ 은 표에서 $\theta_2 = 60°$ 줄과 같다.

**확인 문제.** $\theta_1 = 0°$, $\theta_2 = 90°$ 인 팔을 $\theta_1 = 45°$ 로 돌리면 손끝까지의 거리는 몇이 될까?

<details><summary>답 보기</summary>

joint 1 을 돌려도 거리는 바뀌지 않으므로 $\theta_1 = 0°$ 일 때와 같은 약 1.414 다. 실제로 손끝은 $(1, 1)$ 에서 $(0, 1.414)$ 로
옮겨 가고, $0^2 + 1.414^2 \approx 2$ 다.

</details>

### 코사인 법칙

표를 만들지 않고 $d^2$ 을 $\theta_2$ 의 식으로 바로 적어 본다. $\theta_1 = 0°$ 인 팔의 손끝 $(L_1 + L_2\cos\theta_2,\ L_2\sin\theta_2)$
에 피타고라스 정리를 쓰고, 한 줄에 한 단계씩 정리한다.

1. $d^2 = (L_1 + L_2\cos\theta_2)^2 + (L_2\sin\theta_2)^2$
2. 앞 괄호의 제곱은 $(a + b)^2 = a^2 + 2ab + b^2$ 을 써서 풀면
   $L_1^2 + 2L_1L_2\cos\theta_2 + L_2^2\cos^2\theta_2$ 다. $\cos^2\theta_2$ 는 $(\cos\theta_2)^2$ 을 줄여 쓴 것이다
3. 뒤 괄호의 제곱은 $L_2^2\sin^2\theta_2$ 다
4. 둘을 더하면 $d^2 = L_1^2 + 2L_1L_2\cos\theta_2 + L_2^2(\cos^2\theta_2 + \sin^2\theta_2)$ 다
5. 점 $(\cos\theta_2, \sin\theta_2)$ 는 원점에서 거리 1 인 원 위에 있으므로 피타고라스 정리로 $\cos^2\theta_2 + \sin^2\theta_2 = 1$ 이다
6. 그래서 아래 식이 남는다

$$
d^2 = L_1^2 + L_2^2 + 2L_1L_2\cos\theta_2
$$

이 식은 "원점에서 손끝까지 거리의 제곱은 두 link 길이의 제곱을 더하고, 거기에 $2L_1L_2\cos\theta_2$ 를 더한 값" 으로 읽는다.
$L_1 = L_2 = 1$, $\theta_2 = 60°$ 를 넣으면 $1 + 1 + 2 \times 1 \times 1 \times 0.5 = 3$ 으로 표와 같다.

![2 관절 팔이 만드는 삼각형. 원점, 팔꿈치, 손끝을 이으면 세 변이 1, 1, 1.732 이고 팔꿈치의 안쪽 각은 180° − 60° = 120° 다](figures/law-of-cosines.svg)

위 그림처럼 원점, 팔꿈치, 손끝을 이으면 세 변이 $L_1$, $L_2$, $d$ 인 삼각형이 생긴다. 이 식은 수학에서 코사인 법칙(law of
cosines)이라 부르는 삼각형 공식과 같은 내용이다. 코사인 법칙은 보통 두 변 $a$, $b$ 와 그 사이의 각 $C$ 로 세 번째 변 $c$ 를
$c^2 = a^2 + b^2 - 2ab\cos C$ 라고 적는다. 팔꿈치의 안쪽 각 $C$ 는 link 1 의 연장선(점선)에서 잰 $\theta_2$ 를 $180°$ 에서 뺀
$180° - 60° = 120°$ 이고, $\cos 120° = -0.5$ 이므로 $1 + 1 - 2 \times (-0.5) = 3$ 으로 같은 답이 나온다. $C = 90°$ 이면
$\cos 90° = 0$ 이라 $c^2 = a^2 + b^2$ 이 되어, 코사인 법칙은 직각이 아닌 삼각형까지 넓힌 피타고라스 정리라고 볼 수 있다.

**확인 문제.** $L_1 = 2$, $L_2 = 1$, $\theta_2 = 60°$ 인 팔에서 원점부터 손끝까지 거리의 제곱은?

<details><summary>답 보기</summary>

$d^2 = 2^2 + 1^2 + 2 \times 2 \times 1 \times \cos 60° = 4 + 1 + 4 \times 0.5 = 7$ 이다.

</details>

### θ₂ 와 arccos

이제 식을 거꾸로 쓴다. 목표의 $d^2$ 을 알고 $\theta_2$ 를 모르므로, $\cos\theta_2$ 만 남도록 정리한다.

1. $d^2 = L_1^2 + L_2^2 + 2L_1L_2\cos\theta_2$
2. 양변에서 $L_1^2 + L_2^2$ 을 빼면 $d^2 - L_1^2 - L_2^2 = 2L_1L_2\cos\theta_2$
3. 양변을 $2L_1L_2$ 로 나누면 아래 식이 된다

$$
\cos\theta_2 = \frac{d^2 - L_1^2 - L_2^2}{2L_1L_2} = \frac{x^2 + y^2 - L_1^2 - L_2^2}{2L_1L_2}
$$

목표 $(0.866, 1.5)$ 에서는 $\cos\theta_2 = (3 - 1 - 1) \div (2 \times 1 \times 1) = 1 \div 2 = 0.5$ 다.

cos 값에서 각도를 되찾는 계산을 arccos 라고 하고 $\arccos 0.5$ 처럼 쓴다. arc 는 "호(원의 둘레 일부)" 라는 뜻으로, "cos 이 0.5
가 되는 호의 길이(각도)" 를 찾는다는 의미다. cos 표에서 0.5 인 줄을 찾으면 $60°$ 다.

그런데 cos 이 0.5 인 각도는 $60°$ 만이 아니다. 앞에서 본 것처럼 $\cos(-60°) = 0.5$ 이기도 하다. 막대를 위로 $60°$ 돌린 것과 아래로
$60°$ 돌린 것은 가로 위치가 같기 때문이다. 그래서 $\theta_2$ 의 답은 둘이다.

$$
\theta_2 = +60° \quad \text{또는} \quad \theta_2 = -60°
$$

$+60°$ 는 link 2 를 link 1 에서 시계 반대 방향으로 꺾은 자세, $-60°$ 는 시계 방향으로 꺾은 자세다. 두 자세 모두 팔꿈치가 $60°$
만큼 접혀서 원점부터 손끝까지의 거리가 1.732 로 같다.

**확인 문제.** 목표가 $(1, 1)$ 이면 $\cos\theta_2$ 와 $\theta_2$ 는?

<details><summary>답 보기</summary>

$d^2 = 2$ 이므로 $\cos\theta_2 = (2 - 1 - 1) \div 2 = 0$ 이다. cos 이 0 인 각도는 $90°$ 와 $-90°$ 이므로 $\theta_2 = \pm 90°$ 다.
기호 $\pm$ 는 "플러스 마이너스" 라고 읽고, $+$ 와 $-$ 두 경우를 한꺼번에 적은 것이다.

</details>

### 목표 방향과 θ₁

$\theta_2$ 를 정했으면 팔의 모양(팔꿈치가 얼마나 접혔는지)은 정해졌고, 남은 일은 팔 전체를 joint 1 에서 얼마나 돌려야 손끝이 목표
쪽을 향하는지 정하는 것이다. 두 방향을 비교하면 된다.

- **목표의 방향** $\varphi$ — 원점에서 목표를 바라본 각도. $\varphi$ 는 그리스 문자 phi(파이)로, 원주율 $\pi$ 와는 다른 글자다
- **$\theta_1 = 0°$ 일 때 손끝의 방향** $\beta$ — 앞 절의 팔에서 원점이 손끝을 바라본 각도. $\beta$ 는 beta(베타)다

$\theta_1 = 0°$ 인 팔을 $\theta_1$ 만큼 돌리면 손끝의 방향도 $\beta$ 에서 $\beta + \theta_1$ 로 돈다. 이것이 목표 방향 $\varphi$ 와
같아야 하므로 $\beta + \theta_1 = \varphi$, 곧 아래 식이 된다.

$$
\theta_1 = \varphi - \beta
$$

점의 방향 각도는 점을 원점까지의 거리로 나눠 길이 1 로 줄인 뒤 cos·sin 표에서 찾는다. 길이 1 짜리 막대의 끝은 언제나
$(\cos\theta, \sin\theta)$ 이기 때문이다. 이렇게 점 $(x, y)$ 의 방향 각도를 구하는 계산을 프로그램에서는 $\mathrm{atan2}(y, x)$
라고 부른다. 세로 위치를 가로 위치로 나눈 값을 tangent 라 하고 그 값에서 각도를 되찾는 계산을 arctangent 라고 하는데, atan2 는
arctangent 를 줄인 atan 에 입력이 두 개($y$ 와 $x$)라는 뜻의 2 를 붙인 이름이다.

목표 $(0.866, 1.5)$, $\theta_2 = 60°$ 로 계산한다.

| 단계 | 계산 | 결과 |
| --- | --- | --- |
| 목표의 방향 $\varphi$ | $(0.866, 1.5) \div 1.732 = (0.5, 0.866)$ | $60°$ |
| $\theta_1 = 0°$ 일 때 손끝 | $(1 + \cos 60°,\ \sin 60°)$ | $(1.5, 0.866)$ |
| 그 손끝의 방향 $\beta$ | $(1.5, 0.866) \div 1.732 = (0.866, 0.5)$ | $30°$ |
| $\theta_1 = \varphi - \beta$ | $60° - 30°$ | $30°$ |

![θ₁ 구하기. θ₁ = 0 인 팔(점선)의 손끝은 30° 방향에 있고, 목표는 60° 방향에 있으므로 팔 전체를 60° − 30° = 30° 돌린다](figures/theta1-rotate.svg)

위 그림의 점선은 $\theta_1 = 0°$, $\theta_2 = 60°$ 인 팔이고, 손끝 $(1.5, 0.866)$ 이 $30°$ 방향에 있다. 실선은 이 팔을 그대로
$30°$ 돌린 것으로, 손끝이 $60°$ 방향의 목표 $(0.866, 1.5)$ 에 닿는다. 답 $(\theta_1, \theta_2) = (30°, 60°)$ 는 이 목표를 만든
FK 의 입력과 같다.

$\theta_2 = -60°$ 도 같은 순서로 계산한다. $\theta_1 = 0°$ 일 때 손끝은 $(1 + \cos(-60°),\ \sin(-60°)) = (1.5, -0.866)$ 이고,
길이 1.732 로 나누면 $(0.866, -0.5)$ 라서 방향은 $\beta = -30°$ 다. 그래서 $\theta_1 = 60° - (-30°) = 90°$ 다. FK 로 확인하면
$(90°, -60°)$ 의 팔꿈치는 $(0, 1)$ 이고, link 2 는 $90° - 60° = 30°$ 방향이라 더할 칸이 $(0.866, 0.5)$ 다. 손끝은
$(0 + 0.866,\ 1 + 0.5) = (0.866, 1.5)$ 로 목표와 같다.

두 단계를 한 식으로 모으면 아래와 같다.

$$
\theta_1 = \mathrm{atan2}(y, x) - \mathrm{atan2}(L_2\sin\theta_2,\ L_1 + L_2\cos\theta_2)
$$

앞의 $\mathrm{atan2}(y, x)$ 가 목표의 방향 $\varphi$, 뒤의 것이 $\theta_1 = 0°$ 인 팔의 손끝 $(L_1 + L_2\cos\theta_2, L_2\sin\theta_2)$
의 방향 $\beta$ 다.

**확인 문제.** 목표 $(1, 1)$, $\theta_2 = 90°$ 일 때 $\theta_1$ 은? $\theta_2 = -90°$ 이면?

<details><summary>답 보기</summary>

목표 방향은 $(1, 1) \div 1.414 = (0.707, 0.707)$ 이라 $\varphi = 45°$ 다. $\theta_2 = 90°$ 이면 $\theta_1 = 0°$ 일 때 손끝이
$(1 + 0, 1) = (1, 1)$ 이라 $\beta = 45°$, $\theta_1 = 45° - 45° = 0°$ 다. $\theta_2 = -90°$ 이면 손끝이 $(1, -1)$ 이라
$\beta = -45°$, $\theta_1 = 45° - (-45°) = 90°$ 다. 두 답 $(0°, 90°)$ 와 $(90°, -90°)$ 는 FK 강의에서 손끝이 둘 다 $(1, 1)$ 이었던
두 자세다.

</details>

### elbow-up 과 elbow-down

두 답의 팔을 함께 그려 본다.

![같은 목표 (0.866, 1.5) 에 닿는 두 자세. (30°, 60°) 는 팔꿈치가 (0.866, 0.5) 로 원점-목표 선의 오른쪽 아래에, (90°, −60°) 는 팔꿈치가 (0, 1) 로 왼쪽 위에 있다](figures/two-solutions.svg)

위 그림에서 원점과 목표를 잇는 회색 점선을 기준으로, $(30°, 60°)$ 의 팔꿈치 $(0.866, 0.5)$ 는 선 아래쪽에, $(90°, -60°)$ 의
팔꿈치 $(0, 1)$ 은 선 위쪽에 있다. 팔꿈치가 위로 솟은 자세를 elbow-up, 아래로 처진 자세를 elbow-down 이라고 부른다. 두 자세는
점선을 거울로 삼아 서로 뒤집은 모양이고, $\theta_2$ 의 부호만 다르다. 이 팔에서는 $\theta_2 < 0$ 이 elbow-up, $\theta_2 > 0$ 이
elbow-down 이다.

둘 중 무엇을 쓸지는 계산이 아니라 상황이 정한다.

- **joint 의 움직일 수 있는 범위** — 모터가 $\theta_2 < 0$ 쪽으로 꺾이지 못하게 만들어졌다면 elbow-down 만 쓸 수 있다
- **주변 물체** — 책상 위로 팔을 뻗을 때 팔꿈치가 아래로 처지면 책상에 부딪힐 수 있다
- **지금 자세에서 가까운 쪽** — 지금 $(30°, 50°)$ 에 있다면 $(30°, 60°)$ 는 $\theta_2$ 만 $10°$ 돌리면 되지만, $(90°, -60°)$ 로 가려면
  $\theta_1$ 을 $60°$, $\theta_2$ 를 $110°$ 나 돌려야 한다

**흔한 오해.** IK 의 답이 둘이라고 해서 하나는 틀린 답이라고 생각하기 쉽다. 두 답 모두 FK 에 넣으면 손끝이 정확히 목표에
온다. 둘 다 맞는 답이고, 어느 쪽을 고를지는 joint 범위·장애물·현재 자세로 정한다.

**확인 문제.** 목표 $(1, 1)$ 의 두 답 $(0°, 90°)$ 와 $(90°, -90°)$ 중 elbow-up 은 어느 쪽일까?

<details><summary>답 보기</summary>

$(0°, 90°)$ 의 팔꿈치는 $(1, 0)$ 으로 원점-목표 선($45°$ 방향) 아래쪽에, $(90°, -90°)$ 의 팔꿈치는 $(0, 1)$ 로 위쪽에 있다.
elbow-up 은 $(90°, -90°)$ 다. $\theta_2$ 가 음수인 쪽이라는 규칙과도 맞는다.

</details>

### 닿을 수 있는 범위

$\cos\theta_2$ 는 길이 1 짜리 막대 끝의 가로 위치이므로 $-1$ 과 $1$ 사이의 값만 가질 수 있다. 공식으로 구한 $\cos\theta_2$ 가 이
범위를 벗어나면 그런 각도가 없다는 뜻이고, 팔이 목표에 닿지 않는다는 뜻이다.

| 목표 | $d^2$ | $\cos\theta_2 = (d^2 - 2) \div 2$ | 판정 |
| --- | --- | --- | --- |
| $(0.866, 1.5)$ | 3 | 0.5 | 답 둘 ($\pm 60°$) |
| $(2, 0)$ | 4 | 1 | 답 하나 ($0°$, 팔을 쭉 폄) |
| $(2, 1)$ | 5 | 1.5 | 답 없음 (1 보다 큼) |
| $(3, 0)$ | 9 | 3.5 | 답 없음 (1 보다 큼) |

$\cos\theta_2 = 1$ 이면 $\theta_2 = 0°$ 하나뿐이다. $+0°$ 와 $-0°$ 가 같은 각도라 elbow-up 과 elbow-down 이 한 자세로 겹친다.

link 길이가 다르면 너무 가까운 목표에도 닿지 않는다. $L_1 = 2$, $L_2 = 1$ 인 팔은 link 2 를 완전히 접어도 손끝이 원점에서
$2 - 1 = 1$ 만큼 떨어져 있다. 목표 $(0.5, 0)$ 이면 $\cos\theta_2 = (0.25 - 4 - 1) \div (2 \times 2 \times 1) = -4.75 \div 4 = -1.1875$
로 $-1$ 보다 작다.

![팔이 닿는 범위. L₁ = L₂ = 1 이면 반지름 2 인 원 안이 모두 닿고, L₁ = 2, L₂ = 1 이면 반지름 1 과 3 사이의 고리만 닿는다](figures/workspace.svg)

위 그림은 손끝이 닿을 수 있는 자리 전체를 칠한 것이다. 이 영역을 workspace(작업 공간)라고 한다. 왼쪽 팔은 반지름
$L_1 + L_2 = 2$ 인 원 안이 모두 workspace 이고, 오른쪽 팔은 반지름 $L_1 - L_2 = 1$ 과 $L_1 + L_2 = 3$ 사이의 고리 모양이다.

**확인 문제.** $L_1 = L_2 = 1$ 인 팔에서 목표 $(0, 1.5)$ 에 닿을 수 있을까? $\cos\theta_2$ 로 판정해 보자.

<details><summary>답 보기</summary>

$d^2 = 0 + 2.25 = 2.25$ 이고 $\cos\theta_2 = (2.25 - 2) \div 2 = 0.125$ 다. $-1$ 과 $1$ 사이이므로 닿을 수 있고, 답은 둘이다.

</details>

### 해석적 풀이의 한계

2 관절 평면 팔은 삼각형 하나로 풀렸지만, 실제 로봇 팔은 3 차원에서 움직이고 joint 가 5~7 개다. joint 가 늘면 삼각형을 여러 겹
겹쳐 풀어야 하고, 손끝 위치뿐 아니라 집게가 향하는 방향까지 맞춰야 하므로 식이 빠르게 복잡해진다. 손목의 마지막 세 joint 축이
한 점에서 만나도록 특별히 설계한 팔은 해석적 풀이가 알려져 있지만, 모든 팔에 쓸 수 있는 일반 공식은 없다. 로봇마다 새로 식을
유도해야 하고, 로봇의 모양이 조금만 달라도 다시 유도해야 한다.

그래서 어떤 팔에도 같은 방법으로 쓸 수 있는 반복 계산이 널리 쓰인다. 반복 계산에 필요한 재료는 FK 와, 다음 절에서 다룰 "joint 를
조금 돌렸을 때 손끝이 움직이는 비율" 둘뿐이다.

**확인 문제.** 해석적 풀이의 장점과 단점을 하나씩 적어 보자.

<details><summary>답 보기</summary>

장점은 반복 없이 공식 한 번으로 모든 답(여기서는 두 답)을 정확히 얻는다는 것이다. 단점은 로봇마다 식을 따로 유도해야 하고,
joint 가 많은 3 차원 팔에서는 식이 매우 복잡하거나 일반 공식이 없다는 것이다.

</details>

**요약**

- 거리의 제곱 $d^2 = x^2 + y^2$ 과 코사인 법칙 $d^2 = L_1^2 + L_2^2 + 2L_1L_2\cos\theta_2$ 로 $\cos\theta_2$ 를 구하고, cos 이 같은
  두 각도 $\pm\theta_2$ 가 elbow-down 과 elbow-up 두 답이 된다
- $\theta_1$ 은 목표의 방향 $\varphi$ 에서 $\theta_1 = 0°$ 일 때 손끝의 방향 $\beta$ 를 뺀 값이다. 목표 $(0.866, 1.5)$ 의 답은
  $(30°, 60°)$ 와 $(90°, -60°)$ 다
- $\cos\theta_2$ 가 $-1$ 과 $1$ 사이를 벗어나면 목표가 workspace 밖이라 답이 없다

## Jacobian

반복 계산은 "지금 자세에서 joint 를 조금 돌리면 손끝이 어디로 가는가" 를 알아야 한다. 그 정보를 숫자 표 하나로 묶은 것이
Jacobian 이다.

### joint 하나를 조금 돌렸을 때의 손끝 이동

[Linear Regression](../linear-regression/README.md) 에서 gradient 를 처음 구할 때는 $w$ 를 0.01 만큼 늘려 보고 "변한 loss ÷ 변한
$w$" 를 계산했다. 같은 일을 팔에 해 본다. 이번에 바꾸는 것은 joint angle 이고, 결과로 보는 것은 손끝의 $x$ 와 $y$ 다.

각도를 조금 바꿀 때는 도(°) 대신 rad(radian, 라디안)을 쓴다. FK 강의에서 본 것처럼 radian 은 반지름 1 인 원에서 그 각도만큼 돈
둘레의 길이로 각도를 재는 단위이고, $180° = \pi \approx 3.1416$ rad 이다. 0.01 rad 은 약 $0.573°$ 다. radian 을 쓰면 반지름
$r$ 인 원 위의 점이 $\Delta\theta$ rad 돌 때 움직인 거리가 $r \times \Delta\theta$ 로 바로 나와서 계산이 간단해진다. $\Delta$ 는
그리스 문자 delta(델타)로, "변한 양" 을 나타낼 때 쓴다.

자세 $(\theta_1, \theta_2) = (0°, 90°)$ 에서 시작한다. 손끝은 $(1, 1)$ 이다. $\theta_2$ 는 그대로 두고 $\theta_1$ 만 0.01 rad 늘려
FK 로 손끝을 다시 구한다.

| 값 | $\theta_1 = 0$ | $\theta_1 = 0.01$ rad | 변한 양 | 변한 양 ÷ 0.01 |
| --- | --- | --- | --- | --- |
| 손끝 $x$ | 1 | 0.98995 | $-0.01005$ | $-1.005$ |
| 손끝 $y$ | 1 | 1.00995 | $+0.00995$ | $+0.995$ |

$\theta_1$ 을 1 rad 만큼 늘리면 손끝의 $x$ 는 약 1 만큼 줄고 $y$ 는 약 1 만큼 는다는 뜻이다. 늘리는 양을 0.01 보다 더 줄이거나,
LR 강의의 central difference(양쪽으로 0.01 씩 옮긴 두 값의 차이를 0.02 로 나누는 방법)를 쓰면 비율은 $-1$ 과 $+1$ 에 다가간다.

$\theta_1$ 을 되돌리고 이번에는 $\theta_2$ 만 0.01 rad 늘린다.

| 값 | $\theta_2 = 90°$ | $\theta_2 = 90° + 0.01$ rad | 변한 양 | 변한 양 ÷ 0.01 |
| --- | --- | --- | --- | --- |
| 손끝 $x$ | 1 | 0.99000 | $-0.01000$ | $-1.000$ |
| 손끝 $y$ | 1 | 0.99995 | $-0.00005$ | $-0.005$ |

$\theta_2$ 를 늘리면 손끝은 거의 $x$ 쪽으로만 줄어든다. 늘리는 양을 줄이면 비율은 $-1$ 과 $0$ 에 다가간다.

LR 강의처럼 다른 값을 고정하고 하나만 바꿔 구한 비율을 partial derivative(편미분값)라 하고, $\frac{\partial x}{\partial \theta_1}$
처럼 쓴다. "파셜 x 파셜 세타 원" 이라고 읽으며, "$\theta_2$ 는 고정하고 $\theta_1$ 만 조금 바꿨을 때 $x$ 가 변하는 비율" 이라는
뜻이다. 위 두 표를 이 기호로 적으면 $\frac{\partial x}{\partial \theta_1} = -1$, $\frac{\partial y}{\partial \theta_1} = 1$,
$\frac{\partial x}{\partial \theta_2} = -1$, $\frac{\partial y}{\partial \theta_2} = 0$ 이다.

**확인 문제.** 어떤 자세에서 $\theta_1$ 만 0.01 rad 늘렸더니 손끝이 $(1.2, 0.5)$ 에서 $(1.195, 0.512)$ 로 옮겨 갔다.
$\frac{\partial x}{\partial \theta_1}$ 와 $\frac{\partial y}{\partial \theta_1}$ 은 대략 얼마일까?

<details><summary>답 보기</summary>

$x$ 는 $-0.005$ 변해서 $-0.005 \div 0.01 = -0.5$, $y$ 는 $+0.012$ 변해서 $0.012 \div 0.01 = 1.2$ 다.

</details>

### 원을 따라 움직이는 손끝

FK 를 매번 다시 계산하지 않고도 이 비율을 그림 하나로 알 수 있다. joint 1 만 돌리면 팔 전체가 joint 1 을 중심으로 돌므로 손끝은
joint 1 을 중심으로 원을 그리고, joint 2 만 돌리면 link 2 만 팔꿈치를 중심으로 돌므로 손끝은 팔꿈치를 중심으로 원을 그린다.

원 위의 점이 아주 조금 움직이는 방향은 원의 중심에서 그 점으로 그은 선에 직각이다. 그리고 반지름이 $r$ 이면 $\Delta\theta$ rad
돌 때 $r \times \Delta\theta$ 만큼 움직인다. 이 두 성질을 합치면 "joint 에서 손끝까지의 칸(vector)을 시계 반대 방향으로 $90°$
돌린 것" 이 그 joint 의 비율이 된다. 방향은 직각이고, 길이는 반지름 $r$ 그대로이기 때문이다. vector 는 $(1, 1)$ 처럼 숫자를 순서대로
묶은 것으로, 여기서는 "가로로 1, 세로로 1 만큼 가는 칸" 을 뜻한다.

FK 강의에서 점을 $\theta$ 만큼 돌리는 숫자 표로 쓴 rotation matrix $R(\theta)$ 로 $(a, b)$ 를 $90°$ 돌리면 $(a\cos 90° - b\sin 90°,\ a\sin 90° + b\cos 90°) = (-b, a)$ 다.
"두 칸을 맞바꾸고 앞 칸에 마이너스를 붙인다" 로 기억하면 된다.

| joint | 회전 중심 | 중심에서 손끝까지의 칸 | $90°$ 돌린 칸 = 비율 |
| --- | --- | --- | --- |
| joint 1 | 원점 $(0, 0)$ | $(1, 1) - (0, 0) = (1, 1)$ | $(-1, 1)$ |
| joint 2 | 팔꿈치 $(1, 0)$ | $(1, 1) - (1, 0) = (0, 1)$ | $(-1, 0)$ |

![자세 (0°, 90°) 에서 joint 를 하나씩 돌릴 때 손끝의 움직임. joint 1 만 돌면 원점을 중심으로 반지름 1.414 인 원을 따라 (−1, 1) 방향으로, joint 2 만 돌면 팔꿈치를 중심으로 반지름 1 인 원을 따라 (−1, 0) 방향으로 간다](figures/jacobian-columns.svg)

위 그림의 주황 화살표가 joint 1 의 비율 $(-1, 1)$, 보라 화살표가 joint 2 의 비율 $(-1, 0)$ 이다. 앞에서 FK 를 다시 계산해 얻은
값과 같다. 주황 화살표가 더 긴 것은 joint 1 에서 손끝까지의 반지름 1.414 가 joint 2 의 반지름 1 보다 커서, 같은 각도를 돌아도
손끝이 더 멀리 가기 때문이다.

숫자를 바꿔 FK 강의의 자세 $(30°, 60°)$ 에서 같은 계산을 한다. 손끝은 $(0.866, 1.5)$, 팔꿈치는 $(0.866, 0.5)$ 다.

| joint | 중심에서 손끝까지의 칸 | $90°$ 돌린 칸 = 비율 |
| --- | --- | --- |
| joint 1 | $(0.866, 1.5)$ | $(-1.5, 0.866)$ |
| joint 2 | $(0.866, 1.5) - (0.866, 0.5) = (0, 1)$ | $(-1, 0)$ |

FK 로 확인하면 $\theta_1$ 만 0.01 rad 늘렸을 때 손끝이 $(0.85098, 1.50859)$ 로 가서 비율이 $(-1.504, 0.859)$ 이고, 늘리는 양을 줄이면
$(-1.5, 0.866)$ 에 다가간다.

**확인 문제.** 어떤 자세에서 joint 2(팔꿈치)가 $(1, 1)$ 에, 손끝이 $(2, 1)$ 에 있다. joint 2 만 돌릴 때의 비율
$(\frac{\partial x}{\partial \theta_2}, \frac{\partial y}{\partial \theta_2})$ 는?

<details><summary>답 보기</summary>

팔꿈치에서 손끝까지의 칸은 $(2 - 1, 1 - 1) = (1, 0)$ 이다. $90°$ 돌리면 $(-0, 1) = (0, 1)$ 이다. joint 2 를 돌리면 손끝은
처음에 똑바로 위로 움직인다.

</details>

### Jacobian 행렬

joint 마다 구한 비율 vector 를 세로로 세워 나란히 붙이면 가로 2 줄, 세로 2 줄의 숫자 표가 된다. 숫자를 가로 줄(행)과 세로 줄(열)로
늘어놓은 표를 행렬이라 하고, 이 행렬을 Jacobian 이라고 부른다. 이름은 19 세기 독일 수학자 Carl Gustav Jacob Jacobi 에서 왔다.

$$
J = \begin{bmatrix} \dfrac{\partial x}{\partial \theta_1} & \dfrac{\partial x}{\partial \theta_2} \\[2mm] \dfrac{\partial y}{\partial \theta_1} & \dfrac{\partial y}{\partial \theta_2} \end{bmatrix}
\qquad
J(0°, 90°) = \begin{bmatrix} -1 & -1 \\ 1 & 0 \end{bmatrix}
$$

첫째 열은 joint 1 만 돌 때의 비율 $(-1, 1)$, 둘째 열은 joint 2 만 돌 때의 비율 $(-1, 0)$ 이다. 첫째 행은 손끝 $x$ 가, 둘째 행은
손끝 $y$ 가 각 joint 에 얼마나 민감한지를 담는다. Jacobian 은 자세마다 값이 다르다. $J(0°, 90°)$ 처럼 괄호 안에 어느 자세에서
구했는지를 적는다.

Jacobian 이 있으면 joint 두 개를 동시에 조금씩 돌렸을 때 손끝이 얼마나 움직이는지를 FK 없이 곱셈으로 예측할 수 있다. joint angle
변화를 $\Delta\mathbf q = (\Delta\theta_1, \Delta\theta_2)$, 손끝 위치 변화를 $\Delta\mathbf p = (\Delta x, \Delta y)$ 라고 쓰면 아래
식이 된다. 굵은 글씨 $\mathbf q$ 와 $\mathbf p$ 는 숫자 여러 개를 묶은 vector 라는 표시이고, FK 강의의 URDF 절에서 joint 값을 $q$
로 쓴 것을 이어받았다.

$$
\Delta\mathbf p \approx J\,\Delta\mathbf q
$$

행렬과 vector 의 곱은 "행렬의 각 행과 vector 를 같은 자리끼리 곱해 더한 값" 을 차례로 쌓은 것이다. $\Delta\mathbf q = (0.01, 0.02)$
rad 이면 아래와 같다.

| 행 | 계산 | 결과 |
| --- | --- | --- |
| $\Delta x$ | $(-1) \times 0.01 + (-1) \times 0.02$ | $-0.03$ |
| $\Delta y$ | $1 \times 0.01 + 0 \times 0.02$ | $0.01$ |

FK 로 $(0.01,\ \pi/2 + 0.02)$ 의 손끝을 직접 계산하면 변화는 $(-0.03005, 0.00955)$ 로, 예측 $(-0.03, 0.01)$ 과 소수 셋째 자리까지
거의 같다. 이 식은 "joint 가 조금 움직이면 손끝은 joint 마다의 비율에 움직인 양을 곱한 만큼씩 움직이고, 그 움직임을 모두 더한
것" 이라고 읽는다. joint 1 이 0.01 만큼 돌아 손끝을 $(-0.01, 0.01)$ 옮기고, joint 2 가 0.02 만큼 돌아 $(-0.02, 0)$ 옮기니 합이
$(-0.03, 0.01)$ 이다.

**확인 문제.** $J(0°, 90°)$ 에서 $\Delta\mathbf q = (0.02, -0.01)$ 이면 $\Delta\mathbf p$ 는 대략 얼마일까?

<details><summary>답 보기</summary>

$\Delta x = (-1) \times 0.02 + (-1) \times (-0.01) = -0.02 + 0.01 = -0.01$, $\Delta y = 1 \times 0.02 + 0 \times (-0.01) = 0.02$ 라서
$(-0.01, 0.02)$ 다.

</details>

### 선형 근사가 맞는 범위

$\Delta\mathbf p \approx J\Delta\mathbf q$ 의 $\approx$ 는 "joint 를 조금만 돌렸을 때" 에만 맞는다. 손끝은 실제로 원을 따라 휘어
가는데, Jacobian 은 그 원에 닿는 직선(접선) 방향으로 곧게 간다고 보기 때문이다. LR 강의에서 derivative(값을 아주 조금 바꿨을 때의
변화 비율)를 곡선 위 한 점의 접선 기울기로 본 것과 같다. 이렇게 휘어진 관계를 한 점 근처에서 직선 관계로 바꿔 보는 것을 선형 근사(linear approximation)라고 한다.

자세 $(0°, 90°)$ 에서 $\Delta\mathbf q$ 를 키워 가며 예측과 실제를 비교한다.

| $\Delta\mathbf q$ (rad) | 예측 $J\Delta\mathbf q$ | 실제 (FK) | 차이 |
| --- | --- | --- | --- |
| $(0.01, 0.02)$ | $(-0.03, 0.01)$ | $(-0.0300, 0.0095)$ | 0.00045 |
| $(0.1, 0.2)$ | $(-0.3, 0.1)$ | $(-0.3005, 0.0552)$ | 0.045 |
| $(0.5, 0.5)$ | $(-1, 0.5)$ | $(-0.964, 0.020)$ | 0.48 |

$\Delta\mathbf q$ 가 10 배 커질 때 예측과 실제의 차이는 100 배쯤 커진다. 그래서 Jacobian 으로 한 번에 크게 움직이면 손끝이
예측과 다른 곳에 간다. 뒤에서 IK 를 한 번에 끝내지 않고 여러 번 되풀이하는 이유가 이것이다.

**흔한 오해.** Jacobian 을 한 번 구하면 어느 자세에서나 쓸 수 있다고 생각하기 쉽다. $J(0°, 90°)$ 의 첫째 열은 $(-1, 1)$ 이지만
$J(30°, 60°)$ 의 첫째 열은 $(-1.5, 0.866)$ 이다. 자세가 바뀌면 joint 에서 손끝까지의 칸이 바뀌므로 Jacobian 도 다시 구해야 한다.

**확인 문제.** $\Delta\mathbf q$ 를 $(0.1, 0.2)$ 에서 $(0.01, 0.02)$ 로 10 분의 1 로 줄였더니 예측과 실제의 차이가 0.045 에서
0.00045 로 줄었다. 차이는 몇 분의 1 이 되었나?

<details><summary>답 보기</summary>

$0.045 \div 0.00045 = 100$ 이라 100 분의 1 이 되었다. 움직임을 10 분의 1 로 줄이면 차이는 대략 그 제곱인 100 분의 1 로 준다.

</details>

### 2 관절 팔의 Jacobian 일반식

"joint 에서 손끝까지의 칸을 $90°$ 돌린다" 를 기호로 쓰면 아무 자세에서나 Jacobian 을 바로 적을 수 있다. 손끝은
$(x, y) = (L_1\cos\theta_1 + L_2\cos(\theta_1 + \theta_2),\ L_1\sin\theta_1 + L_2\sin(\theta_1 + \theta_2))$ 다.

- **joint 1** — 원점에서 손끝까지의 칸은 $(x, y)$ 이고, $90°$ 돌리면 $(-y, x)$ 다
- **joint 2** — 팔꿈치 $(L_1\cos\theta_1, L_1\sin\theta_1)$ 에서 손끝까지의 칸은 $(L_2\cos(\theta_1 + \theta_2),\ L_2\sin(\theta_1 + \theta_2))$
  이고, $90°$ 돌리면 $(-L_2\sin(\theta_1 + \theta_2),\ L_2\cos(\theta_1 + \theta_2))$ 다

$$
J = \begin{bmatrix} -L_1\sin\theta_1 - L_2\sin(\theta_1 + \theta_2) & -L_2\sin(\theta_1 + \theta_2) \\ L_1\cos\theta_1 + L_2\cos(\theta_1 + \theta_2) & L_2\cos(\theta_1 + \theta_2) \end{bmatrix}
$$

첫째 열의 $-L_1\sin\theta_1 - L_2\sin(\theta_1 + \theta_2)$ 는 손끝 $y$ 에 마이너스를 붙인 것이고, $L_1\cos\theta_1 + L_2\cos(\theta_1 + \theta_2)$
는 손끝 $x$ 그대로다. $(0°, 90°)$ 를 넣으면 $\sin 0° = 0$, $\sin 90° = 1$, $\cos 0° = 1$, $\cos 90° = 0$ 이라 첫째 열이
$(-0 - 1,\ 1 + 0) = (-1, 1)$, 둘째 열이 $(-1, 0)$ 으로 앞의 값과 같다.

**확인 문제.** 일반식에 $(\theta_1, \theta_2) = (90°, 0°)$ 를 넣어 $J$ 를 구해 보자.

<details><summary>답 보기</summary>

$\theta_1 + \theta_2 = 90°$ 이므로 첫째 열은 $(-\sin 90° - \sin 90°,\ \cos 90° + \cos 90°) = (-2, 0)$, 둘째 열은
$(-\sin 90°, \cos 90°) = (-1, 0)$ 이다. 팔이 똑바로 위로 서 있어서 어느 joint 를 돌려도 손끝은 처음에 왼쪽($-x$)으로만 움직인다.

</details>

### 3 차원 팔의 Jacobian

3 차원 팔에서도 "joint 하나만 돌 때 손끝이 움직이는 속도" 를 열로 쌓는 생각은 같다. 다만 joint 마다 도는 축 방향이 달라서
"$90°$ 돌리기" 대신 [Rigid Transforms](../transforms/README.md) 에서 본 cross product(외적)를 쓴다. cross product $\mathbf a \times \mathbf b$
는 두 3D vector 에 모두 직각인 vector 를 만드는 계산이다. 축 방향을 길이 1 인 vector $\hat\omega_i$ 로, joint 축 위의 한 점을
$\mathbf p_i$, 손끝을 $\mathbf p_e$ 로 쓰면 joint $i$ 의 열은 아래와 같다. $\hat\omega$ 는 omega(오메가) 위에 길이 1 표시인
모자를 씌운 것이다.

$$
J_i = \begin{bmatrix} \hat\omega_i \times (\mathbf p_e - \mathbf p_i) \\ \hat\omega_i \end{bmatrix}
$$

윗칸 세 숫자는 손끝의 위치가 변하는 속도이고, 아랫칸 세 숫자는 손끝의 방향이 도는 속도다. 평면 팔은 모든 joint 가 화면을 뚫고
나오는 $z$ 축 $(0, 0, 1)$ 을 중심으로 돈다. $(0, 0, 1) \times (1, 1, 0)$ 을 칸별로 계산하면
$(0 \times 0 - 1 \times 1,\ 1 \times 1 - 0 \times 0,\ 0 \times 1 - 0 \times 1) = (-1, 1, 0)$ 이라, 앞에서 $(1, 1)$ 을 $90°$ 돌린 것과
같다.

![joint i 하나만 돌 때 손끝의 속도. 축 방향 ω̂ᵢ 와 축에서 손끝까지의 vector 의 cross product 다](figures/jacobian-column.svg)

[Forward Kinematics](../forward-kinematics/README.md) 에서 본 작은 공개 로봇 팔 SO-101 로 숫자를 넣어 본다. 모든 joint angle 이 0 인 자세에서 맨 아래
joint `shoulder_pan` 의 축은 아래쪽 $(0, 0, -1)$ 이고, 축 위의 점은 $\mathbf p_i = (0.039, 0, 0.062)$, 집게 끝점은
$\mathbf p_e = (0.391, 0, 0.226)$ 이다(단위 m). 반올림하기 전 값으로 빼면 $\mathbf p_e - \mathbf p_i = (0.353, 0, 0.164)$ 이고,
$(0, 0, -1) \times (0.353, 0, 0.164) = (0, -0.353, 0)$ 이다. 그래서 이 열은 $(0, -0.353, 0, 0, 0, -1)$ 이다. `shoulder_pan` 을
1 rad/s(1 초에 1 rad)로 돌리면 집게 끝이 $-y$ 방향으로 1 초에 0.353 m 의 빠르기로 움직이고, 집게는 아래쪽($-z$)을 향한 축을 중심으로 1 초에 1 rad 씩 돈다는
뜻이다.

손끝 위치 3 개와 방향 3 개를 함께 다루면 행이 6 개이고, joint 가 $n$ 개면 열이 $n$ 개라서 Jacobian 은 $6 \times n$ 행렬이다. 위치만
맞출 때는 윗칸 3 행만 쓴다.

**확인 문제.** joint 가 6 개인 3 차원 팔에서 손끝의 위치와 방향을 모두 다루는 Jacobian 은 몇 행 몇 열일까?

<details><summary>답 보기</summary>

행은 위치 3 개와 방향 3 개로 6 개, 열은 joint 마다 하나씩 6 개라서 $6 \times 6$ 행렬이다.

</details>

**요약**

- joint 하나만 조금 돌렸을 때 손끝 $x$, $y$ 가 변하는 비율이 partial derivative 이고, 그것을 joint 마다 열로 쌓은 행렬이 Jacobian 이다
- 평면 팔에서 joint 의 열은 "joint 에서 손끝까지의 칸을 $90°$ 돌린 것" 이다. $(0°, 90°)$ 에서 $J$ 의 열은 $(-1, 1)$ 과 $(-1, 0)$ 이다
- $\Delta\mathbf p \approx J\Delta\mathbf q$ 는 조금 움직일 때만 맞고, Jacobian 은 자세마다 다시 구해야 한다

## 반복 계산으로 푸는 IK

Jacobian 으로 "손끝을 이만큼 옮기려면 joint 를 얼마나 돌려야 하나" 를 계산하고, 그만큼 돌린 뒤 FK 로 다시 확인하기를 되풀이하면
어떤 팔에서든 IK 를 풀 수 있다. 1969년 Whitney 가 joint 속도와 손끝 속도를 Jacobian 으로 잇는 이 방법을 정리했다.

### 오차 vector

목표 손끝 위치를 $\mathbf p_d$ 로 쓴다. 아래첨자 $d$ 는 desired(원하는)의 첫 글자다. 지금 손끝 $\mathbf p$ 에서 목표까지 남은
칸을 오차 vector 라고 하고 아래처럼 정의한다.

$$
\mathbf e = \mathbf p_d - \mathbf p
$$

자세 $(0°, 90°)$ 에서 손끝은 $(1, 1)$ 이고, 목표를 $\mathbf p_d = (0.5, 1.5)$ 로 두면 $\mathbf e = (0.5 - 1, 1.5 - 1) = (-0.5, 0.5)$
다. 손끝을 왼쪽으로 0.5, 위로 0.5 옮겨야 한다는 뜻이다. 남은 거리는 피타고라스 정리로 $\sqrt{0.5^2 + 0.5^2} = \sqrt{0.5} \approx 0.707$
이고, 이 거리를 $\lVert\mathbf e\rVert$ 로 적는다. $\sqrt{\ }$ 는 제곱해서 안의 수가 되는 양수를 뜻하고, 세로 두 줄 $\lVert\ \rVert$ 은
vector 의 길이를 뜻한다. LR 강의의 오차가 "예측 − 정답" 이었던 것과 달리, 여기서는 "목표 − 지금" 으로 정의해서 $\mathbf e$ 가 손끝이
가야 할 방향을 바로 가리키게 했다.

**확인 문제.** 손끝이 $(1.2, 0.4)$ 에 있고 목표가 $(1, 1)$ 이면 오차 vector 와 남은 거리는?

<details><summary>답 보기</summary>

$\mathbf e = (1 - 1.2, 1 - 0.4) = (-0.2, 0.6)$ 이다. 거리는 $\sqrt{0.04 + 0.36} = \sqrt{0.4} \approx 0.632$ 다.

</details>

### 손끝을 오차만큼 옮기는 Δq

$\Delta\mathbf p \approx J\Delta\mathbf q$ 이므로 손끝을 정확히 $\mathbf e$ 만큼 옮기고 싶으면 $J\Delta\mathbf q = \mathbf e$ 를
만족하는 $\Delta\mathbf q$ 를 찾으면 된다. $J(0°, 90°)$ 와 $\mathbf e = (-0.5, 0.5)$ 를 넣으면 행마다 식이 하나씩 나와 식 두 개가
된다.

$$
(-1) \times \Delta\theta_1 + (-1) \times \Delta\theta_2 = -0.5
$$

$$
1 \times \Delta\theta_1 + 0 \times \Delta\theta_2 = 0.5
$$

식 여러 개를 동시에 만족하는 값을 찾는 것이 연립방정식이고, LR 강의의 normal equation 에서 한 번 풀어 봤다. 한 단계씩 푼다.

1. 둘째 식에서 바로 $\Delta\theta_1 = 0.5$ 다
2. 첫째 식에 넣으면 $-0.5 - \Delta\theta_2 = -0.5$ 다
3. 양변에 0.5 를 더하면 $-\Delta\theta_2 = 0$, 곧 $\Delta\theta_2 = 0$ 이다

$\Delta\mathbf q = (0.5, 0)$ rad 이다. joint 1 만 0.5 rad($28.65°$) 돌리면 된다는 계산이다. 오차 $(-0.5, 0.5)$ 가 joint 1 의 비율
$(-1, 1)$ 과 같은 방향이라 joint 1 만으로 충분하다고 본 것이다.

**확인 문제.** $J(0°, 90°)$ 에서 $\mathbf e = (-1, 0.5)$ 이면 $J\Delta\mathbf q = \mathbf e$ 를 만족하는 $\Delta\mathbf q$ 는?

<details><summary>답 보기</summary>

둘째 식 $\Delta\theta_1 = 0.5$ 를 첫째 식 $-\Delta\theta_1 - \Delta\theta_2 = -1$ 에 넣으면 $-0.5 - \Delta\theta_2 = -1$ 이라
$\Delta\theta_2 = 0.5$ 다. $\Delta\mathbf q = (0.5, 0.5)$ 다.

</details>

### step 별 계산표

$\Delta\mathbf q = (0.5, 0)$ 만큼 돌린 새 자세 $(0.5\ \text{rad}, 90°)$ 의 손끝을 FK 로 구한다. $\cos 0.5 = 0.8776$,
$\sin 0.5 = 0.4794$ 다(0.5 rad 은 $28.65°$). 팔꿈치는 $(0.8776, 0.4794)$ 이고, link 2 는 link 1 에서 $90°$ 더 돈 방향이라 더할 칸은
$(0.8776, 0.4794)$ 를 $90°$ 돌린 $(-0.4794, 0.8776)$ 이다. 손끝은 $(0.8776 - 0.4794,\ 0.4794 + 0.8776) = (0.398, 1.357)$ 이다.

Jacobian 은 손끝이 $(0.5, 1.5)$ 로 간다고 예측했지만 실제 손끝은 $(0.398, 1.357)$ 이다. 0.5 rad 은 작은 움직임이 아니라서 선형
근사가 빗나갔다. 그래도 남은 거리는 0.707 에서 $\sqrt{0.102^2 + 0.143^2} \approx 0.176$ 으로 줄었다. 그래서 이 자리에서 오차와
Jacobian 을 다시 구하고 같은 계산을 되풀이한다. 오차 계산 → Jacobian → $\Delta\mathbf q$ → joint angle 고치기를 한 번 거치는 것을
step 이라 하고, 시작 자세를 step 0 이라고 부른다.

| step | $\theta_1$ | $\theta_2$ | 손끝 | 오차 $\mathbf e$ | 남은 거리 $\lVert\mathbf e\rVert$ | $\Delta\mathbf q$ (rad) |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | $0°$ | $90°$ | $(1, 1)$ | $(-0.5, 0.5)$ | 0.707 | $(0.5, 0)$ |
| 1 | $28.65°$ | $90°$ | $(0.398, 1.357)$ | $(0.102, 0.143)$ | 0.176 | $(0.077, -0.235)$ |
| 2 | $33.04°$ | $76.56°$ | $(0.503, 1.487)$ | $(-0.003, 0.013)$ | 0.013 | $(0.013, -0.018)$ |
| 3 | $33.80°$ | $75.53°$ | $(0.4999, 1.4999)$ | $(0.0001, 0.0001)$ | 0.00009 | 거의 0 |
| 4 | $33.80°$ | $75.52°$ | $(0.5, 1.5)$ | $(0, 0)$ | 0 | 0 |

![pseudo-inverse IK 의 step 0~3. step 0 의 Jacobian 은 손끝이 (0.5, 1.5) 로 간다고 예측했지만 실제로는 (0.398, 1.357) 에 갔고, 다시 계산하며 step 3 에서 목표에 닿는다](figures/newton-steps.svg)

위 그림은 step 마다의 팔을 겹쳐 그린 것이다. step 0 의 Jacobian 이 예측한 자리(점선 화살표의 끝, 곧 목표)와 실제로 간 자리가 다르지만, 다음 step 이
그 차이를 다시 계산해 메운다. 남은 거리는 0.707 → 0.176 → 0.013 → 0.00009 로 step 마다 크게 줄어, step 3 에서 link 길이 1 을 1 m 로
볼 때 0.1 mm 안쪽까지 맞는다. 목표에 가까울수록 선형 근사가 정확해지기 때문에 끝으로 갈수록 빨리 줄어든다.

마지막 자세 $(33.80°, 75.52°)$ 를 해석적 풀이로 확인한다. 목표 $(0.5, 1.5)$ 의 $d^2 = 2.5$ 라서 $\cos\theta_2 = (2.5 - 2) \div 2 = 0.25$
이고, cos 이 0.25 인 각도는 $75.52°$ 다. 반복 계산이 해석적 풀이의 elbow-down 답에 도착했다.

![IK 의 한 step. 지금 joint angle 로 FK 를 계산해 오차를 재고, 같은 자리의 Jacobian 으로 Δq 를 구해 joint angle 을 고친다](figures/ik-loop.svg)

위 그림은 한 step 을 상자로 나눈 것으로, 각 칸에 step 0 의 숫자를 적었다. 지금 joint angle(①)로 FK 를 계산해 손끝(②)과
오차(③)를 구하고, 같은 자리의 Jacobian 을 구하고(④), $J\Delta\mathbf q = \mathbf e$ 를 풀어(⑤) joint angle 을 고친다(⑥). 오차가 충분히
작아질 때까지 이 고리를 돈다. LR 강의의 학습 loop(예측 → loss → gradient → update)와 같은 구조다.

이렇게 식을 직선으로 근사해 한 번에 풀고, 그 자리에서 다시 근사하기를 되풀이하는 방법을 Newton 법(Newton's method)이라고 부른다.

**확인 문제.** 위 표에서 남은 거리가 0.01 보다 작아지는 첫 step 은 몇 번째일까? 그때 step 0 보다 몇 배 작아졌나?

<details><summary>답 보기</summary>

step 3 이다(0.00009). step 2 는 0.013 으로 아직 0.01 보다 크다. $0.707 \div 0.00009 \approx 7900$ 이라 약 8000 배 작아졌다.

</details>

### 역행렬과 determinant

$J\Delta\mathbf q = \mathbf e$ 를 매번 연립방정식으로 푸는 대신 공식으로 쓸 수 있다. 어떤 행렬이 한 일을 되돌리는 행렬을
역행렬(inverse)이라 하고 $J^{-1}$ 로 적는다. transforms 강의에서 rotation matrix 의 역행렬이 transpose(행과 열을 맞바꾼 것)였던
것처럼, $J$ 를 곱한 뒤 $J^{-1}$ 을 곱하면 아무것도 바뀌지 않는다. 그래서 양변에 $J^{-1}$ 을 곱하면 아래처럼 된다.

$$
\Delta\mathbf q = J^{-1}\,\mathbf e
$$

2×2 행렬의 역행렬은 아래 공식으로 구한다.

$$
\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}
$$

"대각선의 $a$ 와 $d$ 는 자리를 바꾸고, 나머지 $b$ 와 $c$ 는 부호를 바꾼 뒤, 전체를 $ad - bc$ 로 나눈다" 로 읽는다. 분모의
$ad - bc$ 를 determinant(행렬식)라고 하고 $\det J$ 로 적는다.

$J(0°, 90°)$ 는 $a = -1$, $b = -1$, $c = 1$, $d = 0$ 이다.

| 단계 | 계산 | 결과 |
| --- | --- | --- |
| determinant | $(-1) \times 0 - (-1) \times 1$ | 1 |
| 자리·부호 바꾸기 | $\begin{bmatrix} 0 & 1 \\ -1 & -1 \end{bmatrix}$ | |
| $\div \det J$ | $\div 1$ | $J^{-1} = \begin{bmatrix} 0 & 1 \\ -1 & -1 \end{bmatrix}$ |
| $J^{-1}\mathbf e$ | $(0 \times (-0.5) + 1 \times 0.5,\ (-1) \times (-0.5) + (-1) \times 0.5)$ | $(0.5, 0)$ |

연립방정식으로 푼 $(0.5, 0)$ 과 같다.

determinant 가 0 이면 공식의 분모가 0 이 되어 역행렬을 구할 수 없다. 2 관절 팔의 Jacobian 은 $\det J = L_1L_2\sin\theta_2$ 다.
$(0°, 90°)$ 에서는 $1 \times 1 \times \sin 90° = 1$, $(30°, 60°)$ 에서는 $J = \begin{bmatrix} -1.5 & -1 \\ 0.866 & 0 \end{bmatrix}$
이라 $(-1.5) \times 0 - (-1) \times 0.866 = 0.866 = \sin 60°$ 로 맞는다. $\theta_2 = 0°$, 곧 팔을 쭉 폈을 때 determinant 가 0 이 된다.
이 자리에서 무슨 일이 생기는지는 뒤의 singularity 절에서 다룬다.

**확인 문제.** $\begin{bmatrix} 2 & 1 \\ 1 & 1 \end{bmatrix}$ 의 determinant 와 역행렬은?

<details><summary>답 보기</summary>

$\det = 2 \times 1 - 1 \times 1 = 1$ 이다. 역행렬은 $\begin{bmatrix} 1 & -1 \\ -1 & 2 \end{bmatrix}$ 이다. 원래 행렬과 곱하면 첫 행
첫 칸이 $2 \times 1 + 1 \times (-1) = 1$, 첫 행 둘째 칸이 $2 \times (-1) + 1 \times 2 = 0$ 처럼 대각선만 1 인 행렬이 나온다.

</details>

### pseudo-inverse

역행렬은 행과 열의 수가 같은 정사각 행렬에만 있다. 그런데 Jacobian 은 정사각이 아닌 경우가 많다. joint 가 3 개인 평면 팔이 손끝
위치 $(x, y)$ 만 맞추면 Jacobian 은 $2 \times 3$ 이고, 식 2 개에 모르는 값 3 개라서 $J\Delta\mathbf q = \mathbf e$ 를 만족하는
$\Delta\mathbf q$ 가 끝없이 많다. 반대로 joint 가 5 개인 팔이 위치와 방향 6 개를 맞추면 Jacobian 은 $6 \times 5$ 이고, 식이 모르는
값보다 많아 정확한 해가 없을 수 있다.

두 경우 모두에서 쓸 수 있는 규칙이 pseudo-inverse(유사 역행렬)이고 $J^+$ 로 적는다. pseudo 는 "유사한, 가짜의" 라는 뜻이다.
pseudo-inverse 로 구한 $\Delta\mathbf q = J^+\mathbf e$ 는 아래 두 조건을 차례로 따른다.

- $\lVert J\Delta\mathbf q - \mathbf e\rVert^2$, 곧 "예측한 손끝 이동과 오차의 차이의 제곱" 을 가장 작게 한다. LR 강의에서
  Legendre 의 least squares 가 오차 제곱을 가장 작게 하는 직선을 찾은 것과 같은 기준이다
- 그런 $\Delta\mathbf q$ 가 여럿이면 그중 길이 $\lVert\Delta\mathbf q\rVert$ 가 가장 짧은 것, 곧 joint 를 가장 적게 돌리는 것을 고른다

식이 모르는 값보다 적은 경우(joint 가 더 많은 경우)의 pseudo-inverse 는 아래 공식으로 구한다.

$$
J^+ = J^\top\left(JJ^\top\right)^{-1}
$$

$J^\top$ 는 $J$ 의 행과 열을 맞바꾼 transpose 다. 이 식은 "$J$ 에 $J^\top$ 를 곱해 정사각 행렬 $JJ^\top$ 를 만들고, 그 역행렬
앞에 $J^\top$ 를 곱한다" 로 읽는다. $J$ 가 정사각이고 역행렬이 있으면 $J^+$ 는 $J^{-1}$ 과 같다. $J(0°, 90°)$ 로 확인한다.

| 단계 | 계산 | 결과 |
| --- | --- | --- |
| $J^\top$ | 행과 열 맞바꾸기 | $\begin{bmatrix} -1 & 1 \\ -1 & 0 \end{bmatrix}$ |
| $JJ^\top$ 첫 행 | $J$ 첫 행 $(-1, -1)$ 과 $J^\top$ 의 두 열: $(-1)(-1) + (-1)(-1)$, $(-1)(1) + (-1)(0)$ | $(2, -1)$ |
| $JJ^\top$ 둘째 행 | $J$ 둘째 행 $(1, 0)$ 과 $J^\top$ 의 두 열: $(1)(-1) + (0)(-1)$, $(1)(1) + (0)(0)$ | $(-1, 1)$ |
| $(JJ^\top)^{-1}$ | $\det = 2 - 1 = 1$, 자리·부호 바꾸기 | $\begin{bmatrix} 1 & 1 \\ 1 & 2 \end{bmatrix}$ |
| $J^\top(JJ^\top)^{-1}$ | 첫 행 $(-1 + 1,\ -1 + 2)$, 둘째 행 $(-1 + 0,\ -1 + 0)$ | $\begin{bmatrix} 0 & 1 \\ -1 & -1 \end{bmatrix}$ |

결과가 앞에서 구한 $J^{-1}$ 과 같다. 그래서 앞의 step 별 계산표는 pseudo-inverse 로 푼 IK 이기도 하다. pseudo-inverse 는 1920 년
Moore 와 1955 년 Penrose 가 각각 정의해 Moore–Penrose pseudo-inverse 라고도 부른다.

**확인 문제.** joint 가 7 개인 팔로 손끝의 위치 3 개와 방향 3 개를 맞출 때 Jacobian 의 크기는? 이때 $J\Delta\mathbf q = \mathbf e$
의 해는 하나일까, 여럿일까?

<details><summary>답 보기</summary>

$6 \times 7$ 이다. 식 6 개에 모르는 값이 7 개라서 해가 여럿이고, pseudo-inverse 는 그중 joint 를 가장 적게 돌리는 해를 고른다.

</details>

### Jacobian transpose 와 gradient descent

역행렬을 구하지 않고 $J^\top$ 만 곱하는 더 단순한 방법도 있다.

$$
\Delta\mathbf q = \alpha\, J^\top\mathbf e
$$

$\alpha$ 는 alpha(알파)로, 한 번에 얼마나 움직일지 정하는 작은 양수다. 이 식은 "오차 vector 에 Jacobian 의 transpose 를 곱하고,
$\alpha$ 를 곱한 만큼 joint 를 돌린다" 로 읽는다. 이 방법을 Jacobian transpose 법이라고 한다.

이 식은 LR 강의의 gradient descent 와 같은 식이다. LR 강의에서 loss 는 모델이 얼마나 틀렸는지를 숫자 하나로 나타낸 값이었고,
gradient descent 는 loss 가 변하는 비율을 모은 gradient 의 반대 방향으로 parameter 를 조금씩 고치기를 되풀이하는 방법이었다.
IK 에서는 고칠 값이 joint angle 이고, loss 를 "남은 거리의 제곱의 절반" 으로 정한다.

$$
L = \tfrac{1}{2}\lVert\mathbf e\rVert^2 = \tfrac{1}{2}(e_x^2 + e_y^2)
$$

$e_x$, $e_y$ 는 오차 vector 의 두 칸이다. $\frac{1}{2}$ 은 미분할 때 나오는 2 를 지우려고 붙였다. LR 강의의 chain rule(한 값이 중간
값을 거쳐 다른 값에 영향을 줄 때 칸마다의 비율을 곱하는 규칙)로 $\frac{\partial L}{\partial \theta_1}$ 을 따라가면 아래와 같다.

1. $\theta_1$ 을 1 늘리면 손끝 $x$ 는 $\frac{\partial x}{\partial \theta_1}$ 만큼 늘고, $e_x = x_d - x$ 는 그만큼 준다. 그래서 $e_x$ 의
   비율은 $-\frac{\partial x}{\partial \theta_1}$ 이다. $e_y$ 도 같은 방식으로 $-\frac{\partial y}{\partial \theta_1}$ 이다
2. $\frac{1}{2}e_x^2$ 을 $e_x$ 로 미분하면 $e_x$ 다. $w^2$ 의 derivative 가 $2w$ 인 것에 $\frac{1}{2}$ 을 곱했다
3. 두 비율을 곱해 더하면 $\frac{\partial L}{\partial \theta_1} = -\left(e_x\frac{\partial x}{\partial \theta_1} + e_y\frac{\partial y}{\partial \theta_1}\right)$ 이다

괄호 안은 $J$ 의 첫째 열과 $\mathbf e$ 를 같은 자리끼리 곱해 더한 값, 곧 $J^\top\mathbf e$ 의 첫째 칸이다. 그래서 gradient 는
$-J^\top\mathbf e$ 이고, gradient descent 의 update $\mathbf q \leftarrow \mathbf q - \alpha \times (-J^\top\mathbf e)$ 가 바로
$\mathbf q \leftarrow \mathbf q + \alpha J^\top\mathbf e$ 다. $\alpha$ 는 LR 강의의 learning rate $\eta$ 와 같은 역할이다.

숫자로 확인한다. $(0°, 90°)$, $\mathbf e = (-0.5, 0.5)$ 에서 $L = \frac{1}{2}(0.25 + 0.25) = 0.25$ 다.

| 값 | 계산 | 결과 |
| --- | --- | --- |
| $J^\top\mathbf e$ 첫째 칸 | $J$ 첫째 열 $(-1, 1)$ 과 $\mathbf e$: $(-1)(-0.5) + 1 \times 0.5$ | 1 |
| $J^\top\mathbf e$ 둘째 칸 | $J$ 둘째 열 $(-1, 0)$ 과 $\mathbf e$: $(-1)(-0.5) + 0 \times 0.5$ | 0.5 |
| gradient | $-J^\top\mathbf e$ | $(-1, -0.5)$ |
| 검산 | $\theta_1$ 을 양쪽으로 0.01 씩 옮긴 central difference | $-1.000$ |

$\alpha = 0.5$ 이면 $\Delta\mathbf q = 0.5 \times (1, 0.5) = (0.5, 0.25)$ 다. pseudo-inverse 의 $(0.5, 0)$ 과 방향이 다르다. Jacobian
transpose 는 "loss 가 가장 빨리 줄어드는 방향" 으로 가고, pseudo-inverse 는 "선형 근사로 오차가 정확히 0 이 되는 자리" 로 간다.

**확인 문제.** $J = \begin{bmatrix} -1 & -1 \\ 1 & 0 \end{bmatrix}$, $\mathbf e = (0.2, 0.4)$ 일 때 $J^\top\mathbf e$ 는? $\alpha = 0.5$
이면 $\Delta\mathbf q$ 는?

<details><summary>답 보기</summary>

첫째 칸은 $(-1)(0.2) + 1 \times 0.4 = 0.2$, 둘째 칸은 $(-1)(0.2) + 0 \times 0.4 = -0.2$ 라서 $J^\top\mathbf e = (0.2, -0.2)$ 다.
$\Delta\mathbf q = 0.5 \times (0.2, -0.2) = (0.1, -0.1)$ 이다.

</details>

### step 크기 α

같은 목표 $(0.5, 1.5)$ 에 $(0°, 90°)$ 에서 출발해 Jacobian transpose 를 $\alpha = 0.5$ 로 돌린다. step 0 의 $\Delta\mathbf q = (0.5, 0.25)$
를 더하면 $(28.65°, 104.32°)$ 가 되고, FK 로 손끝은 $(0.196, 1.211)$ 이다.

| step | $\theta_1$ | $\theta_2$ | 손끝 | 남은 거리 |
| --- | --- | --- | --- | --- |
| 0 | $0°$ | $90°$ | $(1, 1)$ | 0.707 |
| 1 | $28.65°$ | $104.32°$ | $(0.196, 1.211)$ | 0.419 |
| 2 | $19.72°$ | $92.31°$ | $(0.566, 1.264)$ | 0.245 |
| 3 | $25.94°$ | $91.54°$ | $(0.438, 1.325)$ | 0.186 |
| 10 | $31.34°$ | $79.77°$ | $(0.494, 1.453)$ | 0.047 |
| 20 | | | | 0.009 |
| 40 | | | | 0.0004 |

남은 거리가 꾸준히 줄지만 pseudo-inverse 가 step 3 에 0.00009 에 닿은 것과 달리 step 40 에도 0.0004 다. 오차가 작아지면 $J^\top\mathbf e$
도 함께 작아져 움직임이 줄기 때문이다. LR 강의에서 가장 낮은 점에 가까울수록 gradient 가 작아져 천천히 수렴한 것과 같다.

$\alpha$ 를 키우면 빨라질 것 같지만 그렇지 않다.

![step 마다 남은 거리. pseudo-inverse 는 step 3 에 거의 0 이 되고, Jacobian transpose 는 α = 0.5 에서 천천히 줄며, α = 1 에서는 줄었다 늘었다를 되풀이하고 α = 2 에서는 오히려 커진다](figures/error-steps.svg)

위 그림은 세 경우의 남은 거리를 step 마다 이은 것이다. $\alpha = 1$ 이면 step 0 의 $\Delta\mathbf q = (1, 0.5)$ rad 이 너무 커서 손끝이
목표를 지나쳐 $(-0.457, 0.912)$ 로 가고, 남은 거리가 1.123 으로 오히려 커진다. 그 뒤로도 0.4 와 1.7 사이를 오가며 줄지 않는다.
$\alpha = 2$ 이면 남은 거리가 1.9, 2.1, 1.5, 2.6, 3.4 처럼 커지며 팔이 엉뚱한 자세로 돈다.

**흔한 오해.** $\alpha$ 를 크게 잡으면 빨리 수렴한다고 생각하기 쉽다. LR 강의의 learning rate 처럼, 한 번에 너무 크게 움직이면
선형 근사가 맞지 않는 거리까지 가서 목표를 지나치고 되돌아오기를 되풀이한다. 위 표에서 $\alpha = 0.5$ 는 수렴하지만 $\alpha = 1$
은 수렴하지 않는다.

**확인 문제.** $J^\top\mathbf e = (1, 0.5)$ 일 때 $\alpha = 0.2$ 이면 $\Delta\mathbf q$ 는? 이 값을 $\alpha = 1$ 일 때와 비교하면?

<details><summary>답 보기</summary>

$0.2 \times (1, 0.5) = (0.2, 0.1)$ 이다. $\alpha = 1$ 이면 $(1, 0.5)$ 로 5 배 크다. $\alpha = 0.2$ 는 더 느리게 다가가지만 지나칠
위험이 적다.

</details>

### 시작 자세와 해

반복 계산은 시작 자세 근처에서 오차를 줄이는 쪽으로만 움직이므로, 답이 둘인 목표에서 어느 답에 도착할지는 시작 자세가 정한다.
같은 목표 $(0.5, 1.5)$ 를 $(90°, -90°)$ 에서 시작해 pseudo-inverse 로 풀면 아래와 같다.

| step | $\theta_1$ | $\theta_2$ | 남은 거리 |
| --- | --- | --- | --- |
| 0 | $90°$ | $-90°$ | 0.707 |
| 1 | $118.65°$ | $-90°$ | 0.176 |
| 2 | $109.60°$ | $-76.56°$ | 0.013 |
| 3 | $109.33°$ | $-75.53°$ | 0.00009 |

$(0°, 90°)$ 에서 시작했을 때는 elbow-down 답 $(33.80°, 75.52°)$ 에, $(90°, -90°)$ 에서 시작하면 elbow-up 답 $(109.33°, -75.52°)$ 에
도착했다. 해석적 풀이로 구한 $\theta_1$ 도 $\varphi - \beta$ 에서 $\varphi = 71.57°$, $\beta = -37.76°$ 라 $109.33°$ 로 같다.
로봇이 움직이는 중에 IK 를 풀 때는 지금 자세를 시작 자세로 쓴다. 그러면 지금 자세에서 가까운 답이 나와 joint 가 갑자기 크게
돌지 않는다.

**확인 문제.** 로봇이 지금 elbow-up 자세로 컵 근처에 있다. 컵을 조금 옆으로 옮겨 IK 를 다시 풀 때 시작 자세로 무엇을 쓰면
좋을까?

<details><summary>답 보기</summary>

지금 자세를 쓴다. 그러면 반복 계산이 가까운 elbow-up 답으로 다가가서, 팔꿈치가 반대쪽으로 크게 뒤집히는 움직임을 피할 수 있다.

</details>

**요약**

- 오차 $\mathbf e = \mathbf p_d - \mathbf p$ 를 재고, $J\Delta\mathbf q = \mathbf e$ 를 풀어 joint angle 을 고치고, FK 로 다시 재기를
  되풀이한다. $(0°, 90°)$ 에서 목표 $(0.5, 1.5)$ 로 가는 남은 거리는 0.707 → 0.176 → 0.013 → 0.00009 로 준다
- 2×2 행렬의 역행렬은 $ad - bc$ 로 나누는 공식으로 구하고, 정사각이 아닌 Jacobian 에는 pseudo-inverse $J^+ = J^\top(JJ^\top)^{-1}$ 를 쓴다
- Jacobian transpose $\Delta\mathbf q = \alpha J^\top\mathbf e$ 는 $\frac{1}{2}\lVert\mathbf e\rVert^2$ 에 대한 gradient descent 이고,
  $\alpha$ 가 크면 learning rate 처럼 지나치거나 발산한다. 어느 답에 도착할지는 시작 자세가 정한다

## singularity

### 쭉 편 팔의 Jacobian

팔을 쭉 편 자세 $(0°, 0°)$ 에서는 팔꿈치가 $(1, 0)$, 손끝이 $(2, 0)$ 이다. "joint 에서 손끝까지의 칸을 $90°$ 돌리기" 로 Jacobian 을
구한다.

| joint | 중심에서 손끝까지의 칸 | $90°$ 돌린 칸 |
| --- | --- | --- |
| joint 1 | $(2, 0)$ | $(0, 2)$ |
| joint 2 | $(1, 0)$ | $(0, 1)$ |

$$
J(0°, 0°) = \begin{bmatrix} 0 & 0 \\ 2 & 1 \end{bmatrix}, \qquad \det J = 0 \times 1 - 0 \times 2 = 0
$$

두 열이 모두 세로 방향이다. 어느 joint 를 돌려도 손끝은 처음에 위아래로만 움직이고, 첫째 행이 $(0, 0)$ 이라 $\Delta x$ 는 어떤
$\Delta\mathbf q$ 로도 0 이다. 팔이 가로로 쭉 펴진 채라 손끝을 가로 방향으로 움직이는 joint 가 없는 것이다.

![쭉 편 팔 (0°, 0°). joint 1 과 joint 2 의 손끝 움직임 방향이 둘 다 세로라서, 가로(x) 방향으로는 손끝을 움직일 수 없다](figures/singular-arm.svg)

이렇게 Jacobian 의 determinant 가 0 이 되어 손끝을 움직일 수 없는 방향이 생기는 자세를 singularity(특이점)라고 한다.
singular 는 "단 하나뿐인, 특이한" 이라는 뜻으로, 역행렬이 없는 행렬을 singular matrix 라고 부르는 데서 왔다. 2 관절 팔에서는
$\det J = L_1L_2\sin\theta_2$ 가 0 인 $\theta_2 = 0°$(쭉 편 팔)와 $\theta_2 = 180°$(완전히 접은 팔)가 singularity 다.

**흔한 오해.** singularity 에서는 손끝이 가로로 전혀 못 움직인다고 생각하기 쉽다. 실제로는 팔꿈치를 굽히면 손끝이 원점 쪽으로
당겨진다. 다만 처음 조금 움직이는 순간의 비율이 0 이라, Jacobian 의 선형 근사로는 그 방향의 움직임이 보이지 않는다. 문제가
생기는 것은 로봇이 아니라 Jacobian 으로 하는 계산이다.

**확인 문제.** 완전히 접은 팔 $(0°, 180°)$ 의 Jacobian 과 determinant 를 구해 보자. 이때 손끝은 원점 $(0, 0)$ 에 있다.

<details><summary>답 보기</summary>

팔꿈치는 $(1, 0)$ 이다. joint 1 은 원점에서 손끝까지의 칸 $(0, 0)$ 을 돌려 $(0, 0)$, joint 2 는 팔꿈치에서 손끝까지의 칸 $(-1, 0)$
을 돌려 $(0, -1)$ 이다. $J = \begin{bmatrix} 0 & 0 \\ 0 & -1 \end{bmatrix}$, $\det J = 0 \times (-1) - 0 \times 0 = 0$ 이다.

</details>

### 손끝이 움직이지 않는 joint 방향

쭉 편 팔에서 joint 1 을 0.01, joint 2 를 $-0.02$ rad 돌려 본다. $J\Delta\mathbf q = (0 + 0,\ 2 \times 0.01 + 1 \times (-0.02)) = (0, 0)$
으로, Jacobian 은 손끝이 전혀 움직이지 않는다고 예측한다. FK 로 확인하면 손끝은 $(2, 0)$ 에서 $(1.9999, 0)$ 으로 0.0001 만
움직인다. joint 1 이 손끝을 위로 올리는 만큼 joint 2 가 내려 서로 지운 것이다.

joint 를 움직이는 방향에 따라 손끝이 움직이는 양의 배율이 다르다.

| joint 를 움직이는 방향 $\Delta\mathbf q$ | 그 길이 $\lVert\Delta\mathbf q\rVert$ | 손끝 이동 $J\Delta\mathbf q$ | 배율 (손끝 이동 ÷ joint 이동) |
| --- | --- | --- | --- |
| $(2, 1)$ | $\sqrt{5} \approx 2.236$ | $(0,\ 4 + 1) = (0, 5)$ | $5 \div 2.236 = 2.236$ |
| $(1, -2)$ | 2.236 | $(0,\ 2 - 2) = (0, 0)$ | 0 |

Jacobian 이 가장 크게 늘리는 방향과 가장 작게 늘리는 방향의 배율을 Jacobian 의 singular value 라고 부른다. 쭉 편 팔에서는 2.236
과 0 이다. singular value 가 0 이거나 0 에 가까운 방향이 있으면 그 자세가 singularity 이거나 singularity 근처다. 행렬을 이 배율과
방향들로 나누는 계산을 singular value decomposition(SVD)이라고 한다.

**확인 문제.** 쭉 편 팔에서 $\Delta\mathbf q = (0.03, -0.06)$ 이면 Jacobian 이 예측하는 손끝 이동은?

<details><summary>답 보기</summary>

$(0,\ 2 \times 0.03 + 1 \times (-0.06)) = (0, 0)$ 이다. $(1, -2)$ 방향에 0.03 을 곱한 것이라 배율 0 인 방향이다.

</details>

### singularity 근처의 pseudo-inverse

정확히 singularity 인 자세는 드물지만, 그 근처에서는 문제가 커진다. $\theta_1 = 0°$ 이고 $\theta_2$ 가 작은 값 $s$ 인 거의 펴진
팔에서, 손끝을 원점 쪽으로 0.01 만 당기라고 한다($\mathbf e = (-0.01, 0)$). pseudo-inverse 는 $J^{-1}\mathbf e$ 이고, 역행렬
공식의 분모 $\det J = \sin s$ 가 0 에 가까워진다.

| $\theta_2 = s$ (rad) | $\det J$ | pseudo-inverse $\Delta\mathbf q$ | $\lVert\Delta\mathbf q\rVert$ | 실제 손끝 $x$ 변화 |
| --- | --- | --- | --- | --- |
| 0.5 ($28.6°$) | 0.479 | $(-0.018, 0.039)$ | 0.043 | $-0.0104$ |
| 0.1 ($5.7°$) | 0.0998 | $(-0.100, 0.200)$ | 0.223 | $-0.0199$ |
| 0.01 ($0.57°$) | 0.0100 | $(-1.00, 2.00)$ | 2.236 | $-0.928$ |
| 0.001 ($0.057°$) | 0.0010 | $(-10.0, 20.0)$ | 22.36 | $-3.68$ |

$\theta_2$ 가 10 분의 1 이 될 때마다 $\Delta\mathbf q$ 가 10 배씩 커진다. $s = 0.001$ 이면 손끝을 0.01 당기려고 joint 2 를 20 rad,
곧 세 바퀴 넘게 돌리라고 한다. 실제로 손끝을 $x = 1.99$ 로 당기는 데 필요한 팔꿈치 각도는 약 0.2 rad 인데, 계산은 그 100 배를
요구한다. 이 명령을 그대로 모터에 보내면 joint 가 위험할 만큼 빨리 돌고, 손끝은 0.01 이 아니라 3.68 이나 움직여 $x = -1.68$ 까지 간다.

![거의 펴진 팔에서 손끝을 0.01 당길 때 pseudo-inverse 가 요구하는 joint 움직임. θ₂ 가 0.5, 0.1, 0.01, 0.001 로 작아지면 ‖Δq‖ 가 0.043, 0.223, 2.236, 22.36 으로 커진다](figures/near-singular.svg)

방향 하나만 떼어 보면, 손끝을 움직이고 싶은 방향의 배율(singular value)이 $\sigma$ 일 때 pseudo-inverse 는 그 방향의 오차 $e$ 를
$\sigma$ 로 나눠 $\Delta = e \div \sigma$ 만큼 joint 를 돌린다. $\sigma$ 는 sigma(시그마)의 소문자다. $\sigma$ 가
0 에 가까우면 아주 작은 오차도 아주 큰 joint 움직임이 된다.

**확인 문제.** 어떤 방향의 배율이 $\sigma = 0.02$ 이고 그 방향 오차가 $e = 0.01$ 이면 pseudo-inverse 의 joint 움직임은?
$\sigma = 0.002$ 이면?

<details><summary>답 보기</summary>

$0.01 \div 0.02 = 0.5$ 와 $0.01 \div 0.002 = 5$ 다. 배율이 10 분의 1 이 되자 움직임이 10 배가 되었다.

</details>

**요약**

- 팔을 쭉 펴거나 완전히 접으면 Jacobian 의 두 열이 같은 방향이 되어 $\det J = 0$ 이고, 이 자세가 singularity 다
- 손끝을 움직이는 배율(singular value)이 0 에 가까운 방향이 생기고, pseudo-inverse 는 오차를 그 배율로 나누기 때문에 $\Delta\mathbf q$
  가 터무니없이 커진다. $\theta_2 = 0.001$ rad 이면 0.01 을 당기려고 joint 를 20 rad 돌리라고 한다

## damped least squares

### 한 방향에서의 DLS

pseudo-inverse 의 문제는 오차를 줄이는 것만 보고 joint 를 얼마나 돌리는지는 보지 않는다는 데 있다. 그래서 joint 움직임의 크기에도
벌점을 매긴다. 한 방향만 보면, 배율 $\sigma$ 인 방향에서 오차 $e$ 를 줄이려고 joint 를 $\Delta$ 만큼 돌릴 때 아래 값을 가장 작게
하는 $\Delta$ 를 찾는다.

$$
f(\Delta) = (\sigma\Delta - e)^2 + \lambda^2\Delta^2
$$

앞의 항은 "손끝이 $\sigma\Delta$ 만큼 움직인 뒤에도 남는 오차의 제곱" 이고, 뒤의 항은 "joint 를 돌린 양의 제곱에 $\lambda^2$ 을
곱한 벌점" 이다. $\lambda$ 는 lambda(람다)로, 벌점의 세기를 정하는 양수다. 이 방법을 damped least squares(DLS)라고 한다. damped 는
"줄인, 누그러뜨린" 이라는 뜻으로, least squares 의 해가 지나치게 커지지 않게 누른다는 의미다. 1986년 Nakamura·Hanafusa 와
Wampler 가 각각 제안했다.

가장 작은 점에서는 기울기(derivative)가 0 이다. LR 강의의 규칙으로 $f$ 를 $\Delta$ 로 미분해 0 으로 놓고 한 줄씩 푼다.

1. $(\sigma\Delta - e)^2$ 의 derivative 는 chain rule 로 $2(\sigma\Delta - e) \times \sigma$ 다
2. $\lambda^2\Delta^2$ 의 derivative 는 $2\lambda^2\Delta$ 다
3. 둘을 더해 0 으로 놓으면 $2\sigma(\sigma\Delta - e) + 2\lambda^2\Delta = 0$ 이다
4. 양변을 2 로 나누고 괄호를 풀면 $\sigma^2\Delta - \sigma e + \lambda^2\Delta = 0$ 이다
5. $\sigma e$ 를 오른쪽으로 옮기면 $(\sigma^2 + \lambda^2)\Delta = \sigma e$ 다
6. 양변을 $\sigma^2 + \lambda^2$ 으로 나누면 아래와 같다

$$
\Delta = \frac{\sigma\,e}{\sigma^2 + \lambda^2}
$$

$\lambda = 0$ 이면 $\frac{\sigma e}{\sigma^2} = \frac{e}{\sigma}$ 로 pseudo-inverse 와 같다. $\lambda > 0$ 이면 분모에 $\lambda^2$ 이
더해져, $\sigma$ 가 0 에 가까워도 분모가 $\lambda^2$ 보다 작아지지 않는다.

작은 수로 확인한다. $\sigma = 2$, $e = 1$, $\lambda = 1$ 이면 pseudo-inverse 는 $1 \div 2 = 0.5$, DLS 는 $2 \times 1 \div (4 + 1) = 0.4$
다. $f$ 에 넣어 비교하면 $f(0.5) = (1 - 1)^2 + 0.25 = 0.25$, $f(0.4) = (0.8 - 1)^2 + 0.16 = 0.04 + 0.16 = 0.2$ 로 DLS 의 값이 더 작다.
DLS 는 오차를 조금 남기는 대신 joint 를 덜 돌려 둘을 합한 값을 줄인다.

오차 $e = 0.01$, $\lambda = 0.05$ 일 때 배율 $\sigma$ 에 따라 두 방법이 내는 joint 움직임을 비교한다.

| $\sigma$ | pseudo-inverse $e / \sigma$ | DLS $\sigma e / (\sigma^2 + \lambda^2)$ |
| --- | --- | --- |
| 1 | 0.01 | 0.00998 |
| 0.1 | 0.1 | 0.08 |
| 0.05 | 0.2 | 0.1 |
| 0.01 | 1 | 0.0385 |
| 0.001 | 10 | 0.0040 |

![배율 σ 에 따른 joint 움직임. pseudo-inverse e/σ 는 σ 가 0 에 가까워지면 끝없이 커지고, DLS σe/(σ² + λ²) 는 σ = λ = 0.05 에서 가장 큰 0.1 을 넘지 않는다](figures/dls-curve.svg)

$\sigma$ 가 $\lambda$ 보다 충분히 크면(1 이나 0.1) 두 방법이 거의 같고, singularity 에 가까워질수록 pseudo-inverse 만 급격히
커진다. DLS 의 움직임은 $\sigma = \lambda$ 에서 가장 큰 $e \div (2\lambda) = 0.01 \div 0.1 = 0.1$ 이고, 그보다 $\sigma$ 가 작아지면
오히려 줄어든다.

**확인 문제.** $\sigma = 0.5$, $e = 1$, $\lambda = 1$ 일 때 pseudo-inverse 와 DLS 의 joint 움직임은?

<details><summary>답 보기</summary>

pseudo-inverse 는 $1 \div 0.5 = 2$ 다. DLS 는 $0.5 \times 1 \div (0.25 + 1) = 0.5 \div 1.25 = 0.4$ 다.

</details>

### 행렬로 쓴 DLS

joint 가 여러 개일 때는 같은 생각을 행렬로 쓴다. $\lVert J\Delta\mathbf q - \mathbf e\rVert^2 + \lambda^2\lVert\Delta\mathbf q\rVert^2$
을 가장 작게 하는 $\Delta\mathbf q$ 는 아래와 같다.

$$
\Delta\mathbf q = J^\top\left(JJ^\top + \lambda^2 I\right)^{-1}\mathbf e
$$

$I$ 는 대각선만 1 이고 나머지가 0 인 identity matrix(단위행렬)이고, $\lambda^2 I$ 를 더하는 것은 $JJ^\top$ 의 대각선 칸에만
$\lambda^2$ 을 더하는 것이다. pseudo-inverse 공식 $J^\top(JJ^\top)^{-1}$ 에 $\lambda^2 I$ 하나만 더해졌다. 대각선에 양수가 더해지면
determinant 가 0 이 되지 않아 역행렬을 언제나 구할 수 있다.

$J(0°, 90°)$, $\mathbf e = (-0.5, 0.5)$, $\lambda = 1$ 로 계산한다.

| 단계 | 계산 | 결과 |
| --- | --- | --- |
| $JJ^\top + I$ | $\begin{bmatrix} 2 & -1 \\ -1 & 1 \end{bmatrix}$ 의 대각선에 1 더하기 | $\begin{bmatrix} 3 & -1 \\ -1 & 2 \end{bmatrix}$ |
| 그 역행렬 | $\det = 6 - 1 = 5$, 자리·부호 바꿔 5 로 나누기 | $\frac{1}{5}\begin{bmatrix} 2 & 1 \\ 1 & 3 \end{bmatrix}$ |
| 역행렬 × $\mathbf e$ | $\frac{1}{5}(2 \times (-0.5) + 1 \times 0.5,\ 1 \times (-0.5) + 3 \times 0.5) = \frac{1}{5}(-0.5, 1)$ | $(-0.1, 0.2)$ |
| $J^\top \times$ 앞 결과 | $((-1)(-0.1) + 1 \times 0.2,\ (-1)(-0.1) + 0 \times 0.2)$ | $(0.3, 0.1)$ |

DLS 는 $(0.3, 0.1)$ 만큼 돌린다. pseudo-inverse 의 $(0.5, 0)$ 보다 짧고, 방향은 pseudo-inverse 와 Jacobian transpose $(1, 0.5)$ 의
사이쯤이다.

**확인 문제.** 쭉 편 팔 $J(0°, 0°) = \begin{bmatrix} 0 & 0 \\ 2 & 1 \end{bmatrix}$ 에서 $JJ^\top$ 를 구하고, pseudo-inverse 공식의
$(JJ^\top)^{-1}$ 이 있는지 보자. $\lambda = 1$ 인 DLS 의 $JJ^\top + \lambda^2 I$ 와 그 역행렬은?

<details><summary>답 보기</summary>

$J^\top = \begin{bmatrix} 0 & 2 \\ 0 & 1 \end{bmatrix}$ 이므로 $JJ^\top$ 의 첫 행은 $(0 \times 0 + 0 \times 0,\ 0 \times 2 + 0 \times 1) = (0, 0)$,
둘째 행은 $(2 \times 0 + 1 \times 0,\ 2 \times 2 + 1 \times 1) = (0, 5)$ 다. $\det = 0 \times 5 - 0 \times 0 = 0$ 이라 역행렬이 없다.
DLS 는 대각선에 1 을 더해 $\begin{bmatrix} 1 & 0 \\ 0 & 6 \end{bmatrix}$ 이 되고, $\det = 6$ 이라 역행렬
$\frac{1}{6}\begin{bmatrix} 6 & 0 \\ 0 & 1 \end{bmatrix} = \begin{bmatrix} 1 & 0 \\ 0 & 0.167 \end{bmatrix}$ 을 구할 수 있다.

</details>

### λ 의 크기

DLS 가 singularity 근처에서 어떻게 움직이는지 반복 계산으로 확인한다. 거의 펴진 팔 $(0°, 0.001\ \text{rad})$ 에서 손끝을 $(1.99, 0)$
으로 당긴다. 해석적 풀이로는 $(-5.73°, 11.46°)$ 근처의 자세면 된다.

| 방법 | step 0 의 $\lVert\Delta\mathbf q\rVert$ | 남은 거리가 0.0001 보다 작아진 step | 도착한 자세 |
| --- | --- | --- | --- |
| pseudo-inverse | 22.36 rad | 7 | $(-725.73°, 1451.46°)$ |
| DLS $\lambda = 0.05$ | 0.0018 rad | 9 | $(-5.73°, 11.46°)$ |

pseudo-inverse 도 결국 손끝을 $(1.99, 0)$ 에 보내지만, 첫 step 에 joint 2 를 20 rad 돌린 뒤라 joint 1 은 두 바퀴, joint 2 는 네
바퀴를 더 돈 자세에 도착한다. 실제 로봇에서는 케이블이 감기거나 joint 범위를 벗어나는 움직임이다. DLS 는 처음 몇 step 은 조금씩만
움직이다가 팔꿈치가 굽어 배율이 커지면 걸음을 키워, 한 step 에 0.08 rad 을 넘지 않고 가까운 답에 닿는다.

$\lambda$ 를 크게 잡을수록 안전하지만 느려진다. 앞의 목표 $(0.5, 1.5)$ 에 $(0°, 90°)$ 에서 출발해 $\lambda$ 만 바꾸면 남은 거리가
아래처럼 줄어든다.

| 방법 | step 1 | step 3 | step 10 |
| --- | --- | --- | --- |
| pseudo-inverse ($\lambda = 0$) | 0.176 | 0.00009 | 0 |
| DLS $\lambda = 0.1$ | 0.178 | 0.0006 | 0 |
| DLS $\lambda = 0.5$ | 0.218 | 0.038 | 0.0002 |
| DLS $\lambda = 1$ | 0.291 | 0.141 | 0.019 |
| Jacobian transpose $\alpha = 0.5$ | 0.419 | 0.186 | 0.047 |

$\lambda$ 가 작으면 pseudo-inverse 에 가깝게 빨리 수렴하지만 singularity 근처에서 크게 튈 수 있고, $\lambda$ 가 크면 튀지 않지만
수렴이 느리다. $\lambda$ 가 아주 크면 분모의 $\lambda^2$ 이 $\sigma^2$ 보다 훨씬 커져 한 방향의 움직임이 $\sigma e \div \lambda^2$
에 가까워진다. 이것은 Jacobian transpose 가 그 방향에서 내는 $\alpha\sigma e$ 에 $\alpha = 1 / \lambda^2$ 을 넣은 것과 같다. 그래서
$\lambda$ 를 키울수록 DLS 는 작은 step 의 Jacobian transpose 를 닮아 간다. 실제로는 singular value 가 작아질 때만 $\lambda$ 를
키우는 방식이나, 한 step 의 $\lVert\Delta\mathbf q\rVert$ 에 상한을 두는 방식을 함께 쓴다.

**확인 문제.** $\sigma = 0.1$, $e = 1$ 에서 $\lambda = 1$ 인 DLS 의 움직임을 구하고, $\alpha = 1$ 인 Jacobian transpose 의 움직임
$\alpha\sigma e$ 와 비교해 보자.

<details><summary>답 보기</summary>

DLS 는 $0.1 \times 1 \div (0.01 + 1) = 0.1 \div 1.01 \approx 0.099$ 다. Jacobian transpose 는 $1 \times 0.1 \times 1 = 0.1$ 이다.
$\lambda^2 = 1$ 이 $\sigma^2 = 0.01$ 보다 훨씬 커서 두 값이 거의 같다.

</details>

**요약**

- DLS 는 남은 오차의 제곱에 joint 움직임의 벌점 $\lambda^2\lVert\Delta\mathbf q\rVert^2$ 을 더한 값을 줄인다. 한 방향에서는
  $\Delta = \sigma e / (\sigma^2 + \lambda^2)$, 행렬로는 $\Delta\mathbf q = J^\top(JJ^\top + \lambda^2 I)^{-1}\mathbf e$ 다
- $\sigma$ 가 $\lambda$ 보다 크면 pseudo-inverse 와 거의 같고, $\sigma$ 가 0 에 가까워도 움직임이 $e / (2\lambda)$ 를 넘지 않는다
- $\lambda$ 가 크면 안전하지만 느리고, 아주 크면 작은 step 의 Jacobian transpose 와 비슷해진다

## 닿지 않는 목표

### 해석적 판정

길이 1 짜리 link 두 개로 된 팔에 손끝을 $(3, 0)$ 에 두라고 한다. 해석적 풀이로는 $d^2 = 9$ 라서
$\cos\theta_2 = (9 - 1 - 1) \div 2 = 3.5$ 이고, 1 보다 커서 답이 없다. 원점에서 3 만큼 떨어진 곳은 팔의 최대 거리 2 밖이다.

$\cos\theta_2$ 가 1 보다 크거나 $-1$ 보다 작은 경우를 한꺼번에 $\lvert\cos\theta_2\rvert > 1$ 로 적는다. 세로 한 줄
$\lvert\ \rvert$ 는 부호를 뗀 크기(절댓값)라서 $\lvert 3.5\rvert = 3.5$, $\lvert -1.1875\rvert = 1.1875$ 이다. 2 관절 팔에서는
$\lvert\cos\theta_2\rvert > 1$ 이면 목표가 workspace 밖이다.

**확인 문제.** $L_1 = L_2 = 1$ 인 팔에서 목표 $(1.5, 1.5)$ 의 $\cos\theta_2$ 를 구하고 닿을 수 있는지 판정해 보자.

<details><summary>답 보기</summary>

$d^2 = 2.25 + 2.25 = 4.5$ 이고 $\cos\theta_2 = (4.5 - 2) \div 2 = 1.25$ 다. 1 보다 커서 닿지 않는다. 거리로 보면
$d \approx 2.12$ 가 최대 거리 2 보다 크다.

</details>

### 반복 계산의 반응

반복 계산은 답이 없다는 것을 스스로 알지 못하고, 할 수 있는 만큼 오차를 줄이려 한다. $(0°, 90°)$ 에서 시작해 pseudo-inverse 와
DLS($\lambda = 0.5$)로 $(3, 0)$ 을 향해 반복하면 아래와 같다.

| step | pseudo-inverse 남은 거리 | pseudo-inverse $\lVert\Delta\mathbf q\rVert$ | DLS 남은 거리 | DLS $\lVert\Delta\mathbf q\rVert$ |
| --- | --- | --- | --- | --- |
| 0 | 2.236 | 1.41 | 2.236 | 1.27 |
| 1 | 1.996 | 2.05 | 1.791 | 1.01 |
| 2 | 1.330 | 3.57 | 1.200 | 0.74 |
| 3 | 2.210 | 2.97 | 1.063 | 0.48 |
| 4 | 1.516 | 42.01 | 1.024 | 0.37 |
| 5 | 1.163 | 4.96 | 1.010 | 0.28 |
| 10 | | | 1.000 | 0.06 |

pseudo-inverse 는 손끝을 목표 쪽으로 보내려고 팔을 펴다가 singularity 근처에 이르고, step 4 에서 joint 를 42 rad(약 7 바퀴)
돌리라는 값을 낸다. 그 뒤로도 남은 거리가 1.2 와 3.9 사이를 오가며 자리를 잡지 못한다. DLS 는 팔을 목표 쪽으로 쭉 펴서 손끝을
$(2, 0)$ 에 두고 멈춘다. 남은 거리 1 은 $3 - 2$ 로, 이 팔로 목표에 가장 가까이 갈 수 있는 자리다.

![닿지 않는 목표 (3, 0). pseudo-inverse 의 손끝(빨강)은 여기저기 튀고, DLS 의 손끝(초록)은 팔을 쭉 편 (2, 0) 에 다가가 남은 거리 1 에서 멈춘다](figures/unreachable.svg)

닿지 않는 목표는 팔을 그 방향으로 쭉 펴게 만들고, 쭉 편 팔은 singularity 다. 그래서 닿지 않는 목표와 singularity 문제는 함께
나타난다. 같은 목표에서 $\lambda = 0.1$ 로 DLS 를 돌리면 오차가 큰 상태에서 벌점이 약해 pseudo-inverse 처럼 한 step 에 24 rad 까지
튄다. 오차가 클 때 $\lambda$ 를 너무 작게 잡으면 DLS 도 안전하지 않다.

**확인 문제.** $L_1 = L_2 = 1$ 인 팔에 목표 $(0, 2.5)$ 를 주고 DLS 로 반복하면 손끝은 어디에 멈출까? 남은 거리는?

<details><summary>답 보기</summary>

$d = 2.5$ 는 최대 거리 2 보다 커서 닿지 않는다. 팔이 목표 방향($90°$)으로 쭉 펴져 손끝이 $(0, 2)$ 에 멈추고, 남은 거리는
$2.5 - 2 = 0.5$ 다.

</details>

### 도달 가능 여부 확인과 step 제한

실제 IK 프로그램은 닿지 않는 목표를 아래처럼 다룬다.

- **반복 전에 확인** — 목표까지의 거리가 팔의 최대 거리보다 크면 반복을 시작하기 전에 "닿지 않음" 을 알린다. 2 관절 팔은
  $\cos\theta_2$ 가 $-1$ 과 $1$ 사이인지 보면 된다
- **가장 가까운 자세 받아들이기** — DLS 처럼 남은 거리가 더 줄지 않는 자리에서 멈추고, 그때의 오차를 함께 돌려줘 쓰는 쪽이 판단하게
  한다
- **step 크기 제한** — 한 step 의 $\lVert\Delta\mathbf q\rVert$ 나 오차 $\lVert\mathbf e\rVert$ 에 상한을 둬서 한 번에 크게 튀지 않게
  한다

**확인 문제.** 반복 계산이 50 step 동안 남은 거리를 1.000 에서 더 줄이지 못했다. 목표에 닿지 못한 원인으로 무엇을 먼저 의심해야 할까?

<details><summary>답 보기</summary>

목표가 workspace 밖일 가능성이다. 목표까지의 거리가 팔의 최대 거리보다 큰지 확인한다. 2 관절 팔이면 $\cos\theta_2$ 를 계산해
1 보다 큰지 본다.

</details>

**요약**

- 닿지 않는 목표는 해석적으로 $\lvert\cos\theta_2\rvert > 1$ 로 알 수 있다. $(3, 0)$ 은 $\cos\theta_2 = 3.5$ 다
- pseudo-inverse 는 팔을 펴다 singularity 근처에서 크게 튀고, DLS 는 팔을 쭉 편 가장 가까운 자세 $(2, 0)$ 에서 남은 거리 1 로 멈춘다
- 반복 전에 거리를 확인하고, step 크기에 상한을 둔다

## 실제 로봇의 IK

### 위치와 방향을 함께 맞추는 IK

물건을 집으려면 손끝의 위치와 함께 집게가 향하는 방향도 맞춰야 한다. 위치와 방향을 함께 이르는 말이 pose 였다. 3 차원 pose 는
위치 3 개와 방향 3 개로 숫자 6 개라서 오차 vector 도 6 칸이 된다.

$$
\mathbf e = \begin{bmatrix} \mathbf p_d - \mathbf p \\ \log(R_d R^\top) \end{bmatrix}
$$

윗칸은 위치 오차다. 아랫칸은 방향 오차로, 지금 방향을 나타내는 rotation matrix $R$ 에서 목표 방향 $R_d$ 까지 더 돌아야 하는
회전 $R_d R^\top$ 을 [Rigid Transforms](../transforms/README.md) 의 log(rotation matrix 에서 rotation vector 를 꺼내는 계산)로 바꾼 것이다. rotation vector 는 회전축
방향을 가리키고 길이가 회전 각도인 숫자 3 개다. 이 6 칸짜리 오차에 $6 \times n$ Jacobian 을 써서 앞과 같은 반복 계산을 한다.

위치 오차는 m 단위이고 방향 오차는 rad 단위라서, 한 vector 에 넣으면 단위가 섞인다. 위치가 0.01 m(1 cm) 틀린 것과 방향이 0.01 rad
($0.57°$) 틀린 것이 같은 크기로 계산되는 것이다. 그래서 위치와 방향 칸에 서로 다른 무게를 곱해, 어느 쪽 오차를 더 중요하게
줄일지 정하기도 한다.

**확인 문제.** 위치 오차가 $(0.02, 0, 0)$ m 이고 방향 오차가 $(0, 0, 0.1)$ rad 인 6 칸 오차 vector 를 적어 보자.

<details><summary>답 보기</summary>

$\mathbf e = (0.02, 0, 0, 0, 0, 0.1)$ 이다. 앞 세 칸이 위치, 뒤 세 칸이 방향이다.

</details>

### joint 수와 목표 숫자 수

joint 수와 맞춰야 할 숫자의 수가 다르면 답의 개수가 달라진다. link 길이가 모두 1 인 3 관절 평면 팔로 손끝 위치 $(1.366, 2.366)$
만 맞춘다고 하자. 맞출 숫자는 2 개($x$, $y$)인데 joint 는 3 개다.

| $(\theta_1, \theta_2, \theta_3)$ | link 방향 | 더할 칸 세 개 | 손끝 |
| --- | --- | --- | --- |
| $(30°, 30°, 30°)$ | $30°, 60°, 90°$ | $(0.866, 0.5) + (0.5, 0.866) + (0, 1)$ | $(1.366, 2.366)$ |
| $(60°, -30°, 60°)$ | $60°, 30°, 90°$ | $(0.5, 0.866) + (0.866, 0.5) + (0, 1)$ | $(1.366, 2.366)$ |
| $(90°, -60°, 30°)$ | $90°, 30°, 60°$ | $(0, 1) + (0.866, 0.5) + (0.5, 0.866)$ | $(1.366, 2.366)$ |

![link 길이 1 인 3 관절 팔의 세 자세가 같은 손끝 (1.366, 2.366) 에 닿는다. 같은 칸 세 개를 다른 순서로 더한 것이다](figures/redundant.svg)

세 자세 모두 같은 칸 세 개를 순서만 바꿔 더해 손끝이 같다. 이 셋만이 아니라 $\theta_1$ 을 $30°$ 와 $90°$ 사이 어느 값으로 정해도
나머지 두 joint 로 손끝을 맞출 수 있어서 답이 끝없이 많다. joint 가 맞출 숫자보다 많은 팔을 redundant(여유 자유도가 있는) 팔이라 하고, 남는 joint 로 장애물을 피하거나 joint 범위
한가운데에 머무는 자세를 고를 수 있다.

반대로 joint 가 부족하면 아무 목표나 맞출 수 없다. FK 강의의 SO-101 은 집게를 뺀 팔의 joint 가 5 개인데 3 차원 pose 는 숫자가
6 개다. FK 로 만든 목표는 그 목표를 만든 joint angle 이 있으니 닿을 수 있지만, 아무렇게나 고른 6 차원 pose 에는 정확히 닿지 못하고
IK 가 위치와 방향 사이의 타협점을 낸다.

**확인 문제.** joint 가 2 개인 평면 팔로 손끝의 위치 $(x, y)$ 와 집게 방향까지 숫자 3 개를 아무 값으로나 맞출 수 있을까?

<details><summary>답 보기</summary>

맞출 수 없다. joint 가 2 개라 정할 수 있는 숫자가 2 개뿐이다. 위치를 맞추면 집게 방향 $\theta_1 + \theta_2$ 는 해석적 풀이의 두
답 중 하나로 정해져 버린다.

</details>

### joint limit 과 random restart

실제 joint 는 정해진 범위 안에서만 돈다. 로봇의 모양을 적은 파일인 URDF 의 `<limit>` 에 적힌 이 범위를 joint limit 이라고 한다. 반복 계산이 joint limit
밖의 값을 내면 실제 로봇이 갈 수 없으므로, step 마다 joint angle 을 범위 안으로 잘라(clip) 둔다. 예를 들어 $\theta_2$ 의 범위가
$-100°$ ~ $100°$ 인데 계산이 $118.65°$ 를 내면 $100°$ 로 바꾼다.

자르고 나면 반복 계산이 joint limit 에 걸려 목표에 닿지 못하고 멈추기도 한다. 시작 자세에서 목표로 가는 길이 limit 에 막혔지만,
다른 자세에서 출발하면 닿을 수 있는 경우다. 그럴 때 joint limit 안에서 무작위로 고른 시작 자세에서 다시 반복하는 것을 random
restart 라고 한다. 몇 번 다시 시작해 오차가 기준(예를 들어 1 mm)보다 작아진 답을 쓴다.

**확인 문제.** $\theta_1$ 의 범위가 $-90°$ ~ $90°$ 일 때 계산이 $\theta_1 = 109.33°$ 를 냈다. clip 하면 몇 도가 될까? 이 목표
$(0.5, 1.5)$ 의 elbow-up 답은 이 로봇에서 쓸 수 있을까?

<details><summary>답 보기</summary>

$90°$ 로 잘린다. elbow-up 답 $(109.33°, -75.52°)$ 는 $\theta_1$ 이 범위 밖이라 쓸 수 없고, elbow-down 답 $(33.80°, 75.52°)$ 를
써야 한다.

</details>

**요약**

- 3 차원 IK 는 위치 오차와 $\log(R_dR^\top)$ 방향 오차를 묶은 6 칸 오차와 $6 \times n$ Jacobian 으로 같은 반복을 한다. 단위가
  섞이므로 무게를 정한다
- joint 가 맞출 숫자보다 많으면 답이 끝없이 많고, 적으면 아무 목표에나 닿지는 못한다
- 반복마다 joint angle 을 joint limit 안으로 자르고, 막히면 무작위 시작 자세에서 다시 푼다

## 정리

- inverse kinematics(IK)는 손끝 목표 위치에서 joint angle 을 구하는 계산이다. FK 와 달리 답이 둘이거나, 끝없이 많거나, 없을 수
  있다
- 2 관절 평면 팔은 코사인 법칙 $d^2 = L_1^2 + L_2^2 + 2L_1L_2\cos\theta_2$ 로 $\theta_2$ 를, 목표 방향과 $\theta_1 = 0°$ 일 때
  손끝 방향의 차로 $\theta_1$ 을 구한다. 목표 $(0.866, 1.5)$ 의 답은 elbow-down $(30°, 60°)$ 와 elbow-up $(90°, -60°)$ 이고,
  $\lvert\cos\theta_2\rvert > 1$ 이면 답이 없다
- Jacobian 은 joint 하나를 조금 돌렸을 때 손끝이 움직이는 비율을 열로 쌓은 행렬이다. 평면 팔의 열은 joint 에서 손끝까지의 칸을
  $90°$ 돌린 것이고, $(0°, 90°)$ 에서 $J = \begin{bmatrix} -1 & -1 \\ 1 & 0 \end{bmatrix}$ 이다
- 반복 IK 는 오차를 재고 $J\Delta\mathbf q \approx \mathbf e$ 로 joint angle 을 고치기를 되풀이한다. pseudo-inverse 는 빠르고,
  Jacobian transpose 는 $\frac{1}{2}\lVert\mathbf e\rVert^2$ 에 대한 gradient descent 라서 느리고 $\alpha$ 가 크면 발산한다
- 팔을 쭉 펴면 $\det J = 0$ 인 singularity 가 되고, 그 근처에서 pseudo-inverse 의 움직임 $e / \sigma$ 가 끝없이 커진다. damped least
  squares 는 $\sigma e / (\sigma^2 + \lambda^2)$ 로 움직임을 눌러 이를 막고, 닿지 않는 목표에서는 팔을 쭉 편 가장 가까운 자세에서
  멈춘다

IK 는 목표 자세의 joint angle 을 알려 줄 뿐이다. 실제 팔을 그 각도까지 움직이려면 무게·중력·마찰이 있는 link 를 모터의 힘으로
밀어야 하고, 움직이는 동안 주변 물체와 부딪히지 않아야 한다. 이 IK 를 모터 제어와 함께 물리 simulator(물리 법칙을 계산해 실제 움직임을 흉내 내는 프로그램) 위에서 돌리는 일은
[MuJoCo Simulation](../mujoco-sim/README.md) 에서 다루고, 카메라로 찾은 물체를 IK 로 집는 일은
[Classical Pick & Place](../classical-pick/README.md) 에서 다룬다.

## 참고 자료

- Samuel R. Buss, [Introduction to Inverse Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods](https://mathweb.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf)
  — Jacobian transpose·pseudo-inverse·DLS 를 한 문서에서 비교한다. singular value 로 DLS 를 설명하는 절이 이 강의의 $\sigma$ 표와
  같은 관점이다
- Lynch & Park, [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) 5 장(velocity kinematics)·6 장
  (inverse kinematics) — 3 차원 팔의 Jacobian 과 Newton 법 IK 를 수식으로 정리한다. 이 강의의 "3 차원 팔의 Jacobian" 절을 읽은 뒤
  보면 좋다
- Russ Tedrake, [Robotic Manipulation — Ch. 3](https://manipulation.csail.mit.edu/pick.html) 의 "Differential inverse
  kinematics"·"Are kinematic singularities real?" 절 — pseudo-inverse 가 singularity 근처에서 어떻게 되는지 그림으로 보여 준다
- [mink](https://github.com/kevinzakka/mink) · [pink](https://github.com/stephane-caron/pink) — MuJoCo 와 pinocchio 위에서 반복
  IK 를 제공하는 공개 소프트웨어. 실제 로봇 소프트웨어가 joint limit 과 여러 목표를 어떻게 함께 다루는지 볼 수 있다
