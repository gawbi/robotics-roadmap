---
id: pid-control
title: PID Control
branch: robotics
requires: [warmup]
hours: 10
summary: pendulum 적분부터 PID·feedforward 추종까지
papers:
  - title: "The coordination of arm movements: an experimentally confirmed mathematical model"
    authors: Tamar Flash, Neville Hogan
    year: 1985
    url: https://doi.org/10.1523/JNEUROSCI.05-07-01688.1985
  - title: "Feedback Systems: An Introduction for Scientists and Engineers"
    authors: Karl J. Åström, Richard M. Murray
    year: 2008
    url: http://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-complete_22Feb09.pdf
---

# PID Control

## 배경

warmup 의 gradient descent 에는 시간 개념이 없었다. 로봇의 joint 는 torque 를 받아도 위치가 바로 바뀌지 않고 먼저 가속도가
생기며, 이 가속도가 쌓여 속도와 위치가 바뀐다. 가장 단순한 예인 1-DOF pendulum 의 equation of motion 은 다음과 같다($\theta$ 는
아래로 늘어진 상태에서 잰 각도, $b$ 는 viscous friction 계수).

$$
m l^2\,\ddot\theta + b\,\dot\theta + m g l \sin\theta = \tau
$$

이 식을 컴퓨터로 풀려면 작은 시간 간격 $\Delta t$ 마다 상태를 갱신하는 numerical integration 이 필요한데, 방법에 따라
energy 가 저절로 늘거나 줄어드는 오차가 생긴다. 목표 각도 $\theta_d$ 를 따라가게 하는 가장 흔한 controller 는 PID 다.

$$
\tau = K_p e + K_i \!\int_0^t\! e\,dt' + K_d\,\dot e + \tau_{ff}, \qquad e = \theta_d - \theta
$$

PD 만으로는 gravity 를 버티느라 steady-state error 가 남는다. model 로 미리 계산한 feedforward
$\tau_{ff} = m l^2\ddot\theta_d + b\dot\theta_d + m g l \sin\theta_d$ 를 더하면 feedback 은 model 이 틀린 만큼만 고치면 된다.
목표 trajectory 는 출발과 도착에서 속도·가속도가 0 인 minimum-jerk 다항식으로 만든다.

$$
\theta_d(t) = \theta_0 + (\theta_f - \theta_0)\,(10s^3 - 15s^4 + 6s^5), \qquad s = t/T
$$

학습한 policy 는 보통 10–50 Hz 로 목표 joint position 을 내고, 그 사이를 이런 저수준 controller 가 메운다. SO-101 의 STS3215
servo 도 안에서 position PID 를 돌리며, LeRobot 은 팔을 연결할 때 그 P·I·D 계수를 servo 에 써 넣는다.

## 목표

- explicit Euler, semi-implicit Euler, RK4 로 pendulum 을 적분하고 energy 변화를 비교한다
- torque 한계와 anti-windup 이 들어간 PID controller 를 만든다
- gravity feedforward 와 full model feedforward 를 붙여 steady-state error 와 tracking error 를 비교한다
- minimum-jerk trajectory 를 만들고 추종 결과를 plot 으로 남긴다

**직접 짤 것**: integrator, PID, feedforward, trajectory 생성 전부.
**가져다 써도 되는 것**: integrator 검증용 `scipy.integrate.solve_ivp`, 그림용 matplotlib.

## 준비물

- Python 3.12, numpy, scipy, matplotlib, pytest
- GPU 불필요

## 진행 순서

1. 상태 $x = (\theta, \dot\theta)$ 와 torque 를 받아 $\dot x$ 를 돌려주는 `dynamics` 를 짠다
2. explicit Euler·semi-implicit Euler·RK4 의 한 step 함수를 짠다
3. $b = 0$, torque 0 으로 60° 에서 놓고 10초 동안 적분한 세 방법의 energy 곡선을 한 그림에 그린다
4. P → PD → PID 순서로 항을 하나씩 더하며, 90° 에서 멈추라는 목표를 줬을 때의 응답을 그린다
5. torque 한계를 건 상태에서 anti-windup 이 있을 때와 없을 때의 overshoot 를 비교한다
6. minimum-jerk trajectory 의 위치·속도·가속도를 그린다
7. 0° → 90° 를 1초에 가는 trajectory 를 PD, PD + gravity feedforward, PD + full feedforward 로 추종해 tracking error 를 비교한다

## 시작점

```text
pid-control/
├── pendulum.py        # PendulumParams, dynamics, energy
├── integrators.py     # euler_step, semi_implicit_step, rk4_step
├── controller.py      # PID, feedforward
├── trajectory.py      # min_jerk
├── run_tracking.py    # simulation loop and plots
└── test_pid.py
```

```python
from dataclasses import dataclass
import numpy as np

@dataclass
class PendulumParams:
    m: float = 1.0     # kg
    l: float = 0.5     # m
    b: float = 0.1     # N*m*s/rad
    g: float = 9.81

def dynamics(x: np.ndarray, tau: float, p: PendulumParams) -> np.ndarray:
    """x = (theta, theta_dot) -> x_dot."""
    ...

def energy(x: np.ndarray, p: PendulumParams) -> float: ...

def rk4_step(x: np.ndarray, tau: float, dt: float, p: PendulumParams) -> np.ndarray:
    """tau is held constant during the step."""
    ...

@dataclass
class PID:
    kp: float
    ki: float
    kd: float
    tau_max: float = float("inf")
    integral: float = 0.0

    def __call__(self, e: float, e_dot: float, dt: float) -> float:
        """returns torque clipped to [-tau_max, tau_max]."""
        ...

def feedforward(q_d: float, qd_d: float, qdd_d: float, p: PendulumParams,
                gravity_only: bool = False) -> float: ...

def min_jerk(t: float, q0: float, qf: float, T: float) -> tuple[float, float, float]:
    """returns (q_d, qd_d, qdd_d) at time t. holds qf for t > T."""
    ...
```

## 스스로 확인

- [ ] RK4(dt = 1 ms)로 10초 적분한 energy 의 상대 변화가 1e-8 아래이고, 같은 dt 의 explicit Euler 는 energy 가 계속 늘어난다
- [ ] RK4 의 10초 뒤 각도가 `solve_ivp(rtol=1e-10, atol=1e-10)` 결과와 1e-6 rad 안에서 같다
- [ ] PD 로 90° 를 잡을 때 남는 steady-state error $e$ 가 $K_p e = m g l \sin(\theta_d - e)$ 의 해와 0.01° 안에서 일치하고,
      I 항을 넣으면 0 으로 줄어든다
- [ ] PD + gravity feedforward 는 도착 뒤의 steady-state error 가 0 에 가깝지만 움직이는 동안의 tracking error 는 남고, full
      feedforward 를 더하면 torque 한계가 충분할 때 최대 tracking error 가 1° 아래로 준다
- [ ] (선택) feedforward model 의 mass 를 20% 틀리게 넣어도 PID 가 결국 steady-state error 를 없앤다

## 생각해 볼 질문

1. semi-implicit Euler 는 RK4 보다 훨씬 부정확한데도 energy 가 오르내리기만 할 뿐 계속 늘지 않는다. explicit Euler 와 무엇이
   다르기 때문인가?
2. 목표 각도가 계단처럼 갑자기 바뀔 때 D 항을 오차의 미분으로 계산하면 어떤 일이 생기는가? 측정값의 미분으로 바꾸면 무엇이
   달라지는가?
3. 출발점과 도착점을 일정 속도로 잇는 trajectory 대신 minimum-jerk 를 쓰는 이유를 필요한 torque 관점에서 설명할 수 있는가?

## 힌트

<details>
<summary>gain 을 고르는 출발점</summary>

gravity 와 $b$ 를 빼고 보면 오차가 $I\ddot e + K_d \dot e + K_p e = 0$ ($I = m l^2$) 꼴의 2차 시스템이 되므로, natural
frequency $\omega_n$ 과 damping ratio $\zeta$ 로 $K_p = I\omega_n^2$, $K_d = 2\zeta\omega_n I$ 를 잡을 수 있다. $\zeta = 1$ 에서
시작해 $\omega_n$ 을 키워 가되, $\omega_n \Delta t$ 가 커지면 controller 가 아니라 적분 자체가 불안정해진다.

</details>

<details>
<summary>integral windup</summary>

torque 가 한계에 걸려 있는 동안에도 integral 이 계속 쌓이면, 목표에 도착한 뒤에도 쌓인 값이 다 빠질 때까지 목표 너머로
계속 밀어서 overshoot 가 커진다. 포화된 동안 적분을 멈추거나 integral 값 자체에 상한을 두는 방법이 흔하다.

</details>

<details>
<summary>semi-implicit Euler</summary>

explicit Euler 는 위치와 속도를 모두 이전 값으로 갱신한다. 속도를 먼저 갱신한 뒤 그 새 속도로 위치를 갱신하도록 순서만
바꾸면 semi-implicit(symplectic) Euler 가 된다.

</details>

## 참고 자료

- Russ Tedrake, [Underactuated Robotics — Ch. 2 The Simple Pendulum](https://underactuated.mit.edu/pend.html) — 같은
  pendulum 의 phase portrait 와 energy 관점
- Brett Beauregard, [Improving the Beginner's PID](http://brettbeauregard.com/blog/2011/04/improving-the-beginners-pid-introduction/) —
  derivative kick, windup, 실행 중 gain 변경 같은 실전 문제를 하나씩 고쳐 가는 연재
- Åström & Murray, [Feedback Systems (PDF)](http://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-complete_22Feb09.pdf)
  10장 PID control
- Lynch & Park, [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) 11장 robot control —
  feedforward 와 computed torque 를 여러 joint 로 넓히는 방법
- scipy [`solve_ivp`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html) — integrator 검증 기준

## 남은 한계

joint 하나는 다룰 수 있지만, 여러 joint 가 서로의 inertia 와 gravity 를 주고받고 물체와 부딪히기도 하는 팔은 equation of
motion 을 손으로 쓸 수 없다. physics engine 위에서 이 controller 를 여러 joint 로 넓히는 과제가
[MuJoCo Simulation](../mujoco-sim/README.md) 이다.
