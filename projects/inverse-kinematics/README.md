---
id: inverse-kinematics
title: Inverse Kinematics
branch: robotics
requires: [forward-kinematics]
hours: 12
summary: Jacobian 과 damped least squares 로 푸는 IK
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

## 배경

FK 는 joint angle $q$ 에서 end-effector pose $x = f(q)$ 를 계산하지만, 물체를 집으려면 원하는 pose $x_d$ 에서 거꾸로 $q$ 를
찾아야 한다. $f$ 는 삼각함수가 겹겹이 들어간 비선형 함수라서 일반적인 closed-form 해가 없고, 해가 여러 개(elbow up·down)이거나
아예 없을 수도 있다. 그래서 현재 $q$ 근처에서 $f$ 를 선형으로 근사하고 조금씩 다가가는 differential IK 를 쓴다(Whitney 1969).

$$
\dot x = J(q)\,\dot q, \qquad
J_i = \begin{bmatrix} \hat\omega_i \times (p_e - p_i) \\ \hat\omega_i \end{bmatrix}
$$

revolute joint $i$ 의 world 기준 axis $\hat\omega_i$ 와 그 axis 위의 한 점 $p_i$ 만 알면 FK 결과에서 geometric Jacobian 의 한
열이 바로 나온다. 위치 차이와 $\log(R_d R^\top)$ 로 구한 rotation 차이를 합쳐 오차 $e$ 로 두고, 이 오차를 줄이는 $\Delta q$ 를
pseudo-inverse $J^+ e$ 로 구하면 singularity 근처에서 $\Delta q$ 가 한없이 커진다. damped least squares(DLS)는
$\lVert J\Delta q - e\rVert^2 + \lambda^2\lVert\Delta q\rVert^2$ 를 최소화해서 이를 막는다.

$$
\Delta q = J^\top \left(J J^\top + \lambda^2 I\right)^{-1} e
$$

SO-101 은 팔의 joint 가 5개라 임의의 6D pose 를 다 만들 수는 없다. FK 로 만든 목표에는 도달할 수 있지만, 아무렇게나 고른 6D
목표에서는 DLS 가 위치와 orientation 사이의 타협점을 낸다.

## 목표

- 내 FK 위에서 geometric Jacobian 을 계산한다
- finite difference 와 pinocchio 로 Jacobian 을 검증한다
- pseudo-inverse IK 와 DLS IK 를 짜서 singularity 근처에서 두 방법이 어떻게 다른지 비교한다
- joint limit 과 random restart 를 넣고 무작위 목표로 성공률을 잰다
- (선택) 위치와 orientation 에 서로 다른 weight 를 주는 IK 를 만든다

**직접 짤 것**: Jacobian, pose error, IK 반복, restart. FK 와 SO(3) log 는 앞 과제의 코드를 쓴다.
**가져다 써도 되는 것**: 비교용 pinocchio, `np.linalg.solve`·`np.linalg.svd`.

## 준비물

- Python 3.12, numpy, `pin`, matplotlib, pytest
- forward-kinematics 과제의 URDF parser·FK 와 SO-101 URDF
- GPU 불필요

## 진행 순서

1. FK 가 end-effector pose 와 함께 각 joint 의 world 기준 axis 와 위치도 돌려주도록 넓힌다
2. geometric Jacobian 을 짜고 central difference 로 구한 Jacobian 과 비교한다
3. 위치만 맞추는 IK 를 pseudo-inverse 로 짠다
4. 같은 IK 를 DLS 로 바꿔, 팔을 쭉 편 configuration 근처에서 두 방법의 $\lVert\Delta q\rVert$ 를 비교한다
5. rotation 오차를 더해 6D pose IK 로 넓힌다
6. joint limit clipping 과 random restart 를 넣는다
7. FK 로 만든 무작위 목표 1,000개로 성공률과 반복 횟수 분포를 잰다

## 시작점

```text
inverse-kinematics/
├── jacobian.py     # geometric_jacobian
├── ik.py           # pose_error, ik_dls, solve_with_restarts
├── bench.py        # success rate on random targets
└── test_ik.py
```

```python
import numpy as np
from urdf import Robot  # forward-kinematics 과제의 코드

def geometric_jacobian(robot: Robot, q: np.ndarray, ee_link: str) -> np.ndarray:
    """(6, n) Jacobian at the ee_link origin, world-aligned. rows are (linear, angular)."""
    ...

def pose_error(T: np.ndarray, T_d: np.ndarray) -> np.ndarray:
    """(6,) = (p_d - p, log(R_d R^T)), both expressed in the world frame."""
    ...

def ik_dls(robot: Robot, T_d: np.ndarray, q0: np.ndarray, ee_link: str,
           lam: float = 0.05, max_iters: int = 200, position_only: bool = False,
           tol_pos: float = 1e-3, tol_rot: float = np.deg2rad(1.0)
           ) -> tuple[np.ndarray, bool, int]:
    """returns (q, converged, iterations). q stays inside joint limits."""
    ...

def solve_with_restarts(robot: Robot, T_d: np.ndarray, ee_link: str, n_restarts: int = 10,
                        seed: int = 0, **kw) -> tuple[np.ndarray, bool]: ...
```

## 평가 기준

- [ ] Jacobian 이 central difference($\epsilon = 10^{-6}$)와 1e-6 안, pinocchio `getFrameJacobian(..., pin.LOCAL_WORLD_ALIGNED)`
      와 1e-9 안에서 같다
- [ ] $J$ 의 smallest singular value 에 따라 그린 그림에서, 팔을 쭉 편 configuration 에 가까워질수록 pseudo-inverse 의
      $\lVert\Delta q\rVert$ 는 커지고 DLS 의 $\lVert\Delta q\rVert$ 는 유한하게 남는다
- [ ] FK 로 만든 무작위 목표 1,000개에서 위치만 맞추는 IK 가 restart 10번 안에 95% 이상 1 mm 안으로 수렴한다
- [ ] 같은 조건에서 6D pose IK 가 90% 이상 1 mm · 1° 안으로 수렴한다
- [ ] (선택) 아무렇게나 고른 6D 목표에서 orientation weight 를 바꾸면 위치 오차와 orientation 오차 가운데 한쪽이 줄 때 다른
      쪽이 커지는 것을 그림으로 보인다

## 생각해 볼 질문

1. $\lambda$ 를 키우면 무엇을 얻고 무엇을 잃는가? $\lambda$ 가 아주 클 때 DLS 의 한 step 은 어떤 방법의 step 과 비슷해지는가?
2. 같은 목표인데 시작 configuration 에 따라 다른 해가 나오는 이유는? 이 차이가 이어지는 trajectory 를 만들 때 문제가 되는
   상황은?
3. 위치 오차(m)와 rotation 오차(rad)를 한 벡터에 넣으면 단위가 섞이는데, 그러면 수렴과 결과가 어떻게 달라지는가?

## 힌트

<details>
<summary>rotation 오차와 Jacobian 의 기준 frame</summary>

$\log(R_d R^\top)$ 는 world frame 으로 표현한 rotation 오차라서 world-aligned Jacobian 과 짝이 맞는다. $\log(R^\top R_d)$ 를
쓰려면 Jacobian 의 angular 부분도 end-effector frame 으로 돌려야 한다. 두 쪽이 어긋나면 어떤 목표에서는 수렴하고 어떤
목표에서는 수렴하지 않아서 원인을 찾기 어렵다.

</details>

<details>
<summary>λ 와 step 크기</summary>

$J$ 의 smallest singular value $\sigma_{\min}$ 이 클 때는 $\lambda$ 를 작게, singularity 에 가까워질수록 크게 두는 adaptive
방식이 흔하다. 한 step 의 $\lVert\Delta q\rVert$ 에 상한을 두는 것도 발산을 막는 데 도움이 된다.

</details>

<details>
<summary>pinocchio Jacobian 을 읽는 순서</summary>

`pin.computeJointJacobians(model, data, q)` 와 `pin.updateFramePlacements(model, data)` 를 먼저 부르고
`pin.getFrameJacobian(model, data, frame_id, pin.LOCAL_WORLD_ALIGNED)` 를 읽는다. 행 순서는 (linear, angular)다.

</details>

## 참고 자료

- Samuel R. Buss, [Introduction to Inverse Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods](https://mathweb.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf)
  — 세 방법을 한 문서에서 비교한다
- Lynch & Park, [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) 5장(velocity kinematics)·
  6장(numerical inverse kinematics)
- Russ Tedrake, [Robotic Manipulation — Ch. 3](https://manipulation.csail.mit.edu/pick.html) 의 "Differential inverse
  kinematics"·"Are kinematic singularities real?" 절
- 막혔을 때만 열기: [mink](https://github.com/kevinzakka/mink)(MuJoCo 기반 differential IK),
  [pink](https://github.com/pink-kinematics/pink)(pinocchio 기반 differential IK)

## 남은 한계

joint angle 은 구했지만 그 값까지 실제로 움직이려면 mass·gravity·friction 이 있는 팔을 torque 로 밀어야 하고, 움직이는 동안
주변 물체와 부딪히기도 한다. 이 IK 를 PD 제어와 함께 physics simulator 위에 올리는 과제가 [MuJoCo Simulation](../mujoco-sim/README.md) 이다.
