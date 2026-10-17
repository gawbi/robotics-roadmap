---
id: transforms
title: Rigid Transforms
branch: robotics
requires: [warmup]
hours: 8
summary: SO(3)·SE(3) 의 여러 표현과 그 사이의 변환
papers:
  - title: "Animating rotation with quaternion curves"
    authors: Ken Shoemake
    year: 1985
    url: https://dl.acm.org/doi/10.1145/325165.325242
  - title: "Modern Robotics: Mechanics, Planning, and Control"
    authors: Kevin M. Lynch, Frank C. Park
    year: 2017
    url: https://hades.mech.northwestern.edu/index.php/Modern_Robotics
  - title: "Quaternion kinematics for the error-state Kalman filter"
    authors: Joan Solà
    year: 2017
    url: https://arxiv.org/abs/1711.02508
  - title: "A micro Lie theory for state estimation in robotics"
    authors: Joan Solà, Jeremie Deray, Dinesh Atchuthan
    year: 2018
    url: https://arxiv.org/abs/1812.01537
---

# Rigid Transforms

## 배경

warmup 에서 다룬 벡터에는 기준이 따로 없었지만, 로봇에서는 같은 점이라도 어느 frame 에서 본 값인지를 늘 함께 따져야 한다.
카메라가 본 cube 위치를 팔의 base frame 기준으로 옮기려면 두 frame 사이의 rotation 과 translation 을 알아야 하고, 그 둘을
묶은 것이 rigid transform 이다. 3D rotation 전체의 집합을 SO(3), rotation 과 translation 을 합친 pose 의 집합을 SE(3) 라고
부르며, homogeneous coordinates 로 쓰면 pose 의 합성이 4×4 행렬 곱 하나로 끝난다.

$$
R^\top R = I,\ \det R = 1, \qquad
T = \begin{bmatrix} R & p \\ 0 & 1 \end{bmatrix} \in SE(3), \qquad
T_{ac} = T_{ab}\,T_{bc}
$$

같은 rotation 을 적는 방법은 여럿이다. rotation matrix 는 숫자 9개에 제약 6개가 붙어 있고, axis-angle 은 unit axis
$\hat\omega$ 와 angle $\theta$ 를 곱한 3차원 벡터로 적으며, unit quaternion 은 숫자 4개를 쓰되 $q$ 와 $-q$ 가 같은 rotation 을
뜻한다. axis-angle 에서 rotation matrix 로 가는 Rodrigues 공식이 곧 SO(3) 의 exponential map 이다.

$$
R = \exp([\hat\omega]\theta) = I + \sin\theta\,[\hat\omega] + (1-\cos\theta)\,[\hat\omega]^2,
\qquad q = \left(\cos\tfrac{\theta}{2},\ \hat\omega\sin\tfrac{\theta}{2}\right)
$$

$[\hat\omega]$ 는 $[\hat\omega]\,v = \hat\omega \times v$ 가 되는 3×3 skew-symmetric 행렬이다. rotation 과 translation 을 함께
담은 6차원 twist $\xi = (\omega, v)$ 에도 같은 꼴의 exponential map 이 있어서, SE(3) 의 pose 도 숫자 6개로 적고 보간할 수
있다. 이번 과제에서는 이 변환을 numpy 로 직접 짜고 scipy 의 구현과 숫자로 맞춰 본다.

## 목표

- `hat`·`exp`·`log` 로 axis-angle 과 rotation matrix 를 오가는 SO(3) 함수를 만든다
- rotation matrix ↔ quaternion 변환, quaternion 곱, slerp 를 만든다
- URDF 가 쓰는 roll-pitch-yaw 를 rotation matrix 로 바꾼다
- homogeneous transform 의 합성·역변환과 SE(3) 의 exp·log 를 만든다
- frame 몇 개를 3D 화살표로 그려 합성 순서가 맞는지 눈으로 확인한다

**직접 짤 것**: 위 변환 전부. numpy 의 기본 선형대수(`@`, `np.linalg.norm`, `np.linalg.svd`)만으로 짠다.
**가져다 써도 되는 것**: 정답 비교용 `scipy.spatial.transform` 의 `Rotation`·`RigidTransform`·`Slerp`, 그림용 matplotlib.

## 준비물

- Python 3.12, numpy, scipy(`RigidTransform` 은 1.16 부터 들어 있다), matplotlib, pytest
- GPU 불필요

## 진행 순서

1. `hat`·`vee` 를 짜고 `hat(w) @ v` 가 `np.cross(w, v)` 와 같은지 확인한다
2. Rodrigues 공식으로 `exp_so3` 를 짜서 `Rotation.from_rotvec` 와 비교한다
3. rotation angle 이 0 근처와 $\pi$ 근처일 때도 NaN 이 나지 않는 `log_so3` 를 짠다
4. rotation matrix ↔ quaternion 변환과 quaternion 곱을 짜서 `Rotation.as_quat` 와 비교한다
5. URDF 의 `rpy` 를 rotation matrix 로 바꾸는 함수를 짜서 `Rotation.from_euler` 와 비교한다
6. homogeneous transform 의 합성·역변환과 SE(3) 의 exp·log 를 짜서 `RigidTransform` 과 비교한다
7. slerp 를 짜서 `Slerp` 와 비교한다
8. world·base·camera 세 frame 을 화살표로 그려 $T_{wc} = T_{wb}\,T_{bc}$ 가 그림과 맞는지 본다

## 시작점

```text
transforms/
├── so3.py             # hat, vee, exp_so3, log_so3, rpy_to_matrix
├── quat.py            # quaternion conversion, product, slerp
├── se3.py             # homogeneous transform, exp_se3, log_se3
├── viz.py             # draw frames as arrows
└── test_transforms.py
```

```python
import numpy as np

# so3.py
def hat(w: np.ndarray) -> np.ndarray:
    """(3,) -> (3, 3) skew-symmetric matrix with hat(w) @ v == np.cross(w, v)."""
    ...

def vee(W: np.ndarray) -> np.ndarray: ...

def exp_so3(rotvec: np.ndarray) -> np.ndarray:
    """axis-angle vector (unit axis * angle) -> (3, 3) rotation matrix."""
    ...

def log_so3(R: np.ndarray) -> np.ndarray:
    """(3, 3) rotation matrix -> axis-angle vector with angle in [0, pi]."""
    ...

def rpy_to_matrix(roll: float, pitch: float, yaw: float) -> np.ndarray:
    """URDF convention: fixed axes x, then y, then z."""
    ...

# quat.py — quaternions are (w, x, y, z)
def quat_from_matrix(R: np.ndarray) -> np.ndarray: ...
def matrix_from_quat(q: np.ndarray) -> np.ndarray: ...
def quat_mul(q1: np.ndarray, q2: np.ndarray) -> np.ndarray: ...
def slerp(q0: np.ndarray, q1: np.ndarray, t: float) -> np.ndarray: ...

# se3.py — twists are (omega, v)
def make_T(R: np.ndarray, p: np.ndarray) -> np.ndarray: ...
def inv_T(T: np.ndarray) -> np.ndarray:
    """inverse without np.linalg.inv."""
    ...
def exp_se3(xi: np.ndarray) -> np.ndarray: ...
def log_se3(T: np.ndarray) -> np.ndarray: ...
```

## 스스로 확인

- [ ] 무작위 rotation 10,000개에서 `exp_so3(log_so3(R))` 와 `R` 의 원소별 차이가 1e-10 안이다
- [ ] 내 quaternion 이 `Rotation.as_quat(scalar_first=True)` 와 부호 차이를 빼고 1e-12 안에서 같다
- [ ] rotation angle $10^{-9}$, $\pi - 10^{-6}$, $\pi - 10^{-9}$ 에서도 `log_so3` 가 NaN 없이 `Rotation.as_rotvec` 와 1e-9 안에서
      일치한다
- [ ] `exp_se3`·`log_se3` 가 `RigidTransform.from_exp_coords`·`as_exp_coords` 와 1e-10 안에서 일치한다
- [ ] `inv_T(T) @ T` 가 단위행렬과 1e-12 안에서 같다
- [ ] (선택) slerp 결과가 `Slerp` 와 1e-12 안에서 같고, 보간하는 동안 angular velocity 가 일정하다

## 생각해 볼 질문

1. $q$ 와 $-q$ 가 같은 rotation 인데도 slerp 를 하기 전에 둘 중 하나를 골라야 하는 이유는? 고르지 않으면 어떤 경로로
   보간되는가?
2. roll-pitch-yaw 세 숫자로 모든 rotation 을 적을 수 있는데, 로봇 소프트웨어가 내부 계산에는 quaternion 이나 rotation matrix 를
   쓰는 이유는?
3. $T_{ab}T_{bc}$ 에서 오른쪽에 곱한 변환은 어느 frame 기준의 움직임인가? 같은 움직임을 왼쪽에 곱하면 무엇이 달라지는가?

## 힌트

<details>
<summary>rotation angle 이 π 근처일 때의 log</summary>

$(R - R^\top)/(2\sin\theta)$ 로 axis 를 구하면 $\sin\theta \to 0$ 에서 0 을 0 으로 나누게 되고, $\arccos$ 로 구한 angle 도
$\pi$ 근처에서 정밀도를 잃는다. rotation matrix 를 먼저 quaternion 으로 바꾸고 angle 을 $2\,\mathrm{atan2}(\lVert v\rVert, w)$
로 구하면 0 근처와 $\pi$ 근처에서 모두 안정적이다. quaternion 으로 바꿀 때는 trace 와 대각 원소 가운데 가장 큰 쪽을 골라 그
값으로 나누는 Shepperd 의 방법을 쓴다.

</details>

<details>
<summary>quaternion 순서와 Euler angle 규약</summary>

scipy 의 `as_quat` 는 기본이 (x, y, z, w) 이고 `scalar_first=True` 를 주면 (w, x, y, z) 다. MuJoCo 는 (w, x, y, z) 를 쓰므로
프로젝트 안에서 한 가지로 정해 둔다. URDF 의 `rpy` 는 고정축 x → y → z 순서라서
$R = R_z(\text{yaw})\,R_y(\text{pitch})\,R_x(\text{roll})$ 이고, scipy 에서는 소문자 `"xyz"`(extrinsic)가 같은 규약이다.

</details>

<details>
<summary>SE(3) exp 의 translation 부분</summary>

twist $(\omega, v)$ 의 exp 에서 translation 은 $v$ 그대로가 아니라 $V v$ 다. rotation 과 translation 이 동시에 일어나면 경로가
나선(screw)을 그리기 때문인데, $\theta = \lVert\omega\rVert$ 라 하면
$V = I + \frac{1-\cos\theta}{\theta^2}[\omega] + \frac{\theta-\sin\theta}{\theta^3}[\omega]^2$ 이다. $\theta \to 0$ 에서는 이 계수를
Taylor 전개로 바꿔 계산해야 0 에 가까운 수로 나누지 않는다.

</details>

## 참고 자료

- Lynch & Park, [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) 3장 — 무료 PDF 와 강의 영상이
  함께 있고, SO(3)·SE(3)·exponential coordinates 를 이 과제와 같은 기호로 설명한다
- Russ Tedrake, [Robotic Manipulation — Ch. 3 Basic Pick and Place](https://manipulation.csail.mit.edu/pick.html) 의
  "Monogram Notation"·"Spatial Algebra" 절 — frame 이름을 기호에 붙여 합성 순서 실수를 막는 표기법
- 3Blue1Brown, [Quaternions and 3d rotation, explained interactively](https://www.youtube.com/watch?v=zjMuIxRvygQ) 와
  [interactive 페이지](https://eater.net/quaternions)
- Solà 외, [A micro Lie theory for state estimation in robotics](https://arxiv.org/abs/1812.01537) — SO(3)·SE(3) 의 exp·log 를
  한 틀로 정리한 짧은 글
- scipy [`Rotation`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.transform.Rotation.html) ·
  [`RigidTransform`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.transform.RigidTransform.html) 문서 —
  비교 대상의 순서와 부호 규약 확인용
- 막혔을 때만 열기: [NxRLab/ModernRobotics](https://github.com/NxRLab/ModernRobotics/tree/master/packages/Python) 의
  `MatrixExp3`·`MatrixLog3`·`MatrixExp6`, [pytransform3d](https://github.com/dfki-ric/pytransform3d)

## 남은 한계

frame 하나하나는 다룰 수 있지만, joint 가 여러 개 이어진 팔에서 joint angle 이 end-effector pose 를 어떻게 정하는지와 pixel 이
3D 점과 어떻게 이어지는지는 아직 계산하지 못한다. 앞의 것은 [Forward Kinematics](../forward-kinematics/README.md), 뒤의 것은
[Camera Geometry](../camera-geometry/README.md) 에서 다룬다.
