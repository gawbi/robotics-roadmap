---
id: mujoco-sim
title: MuJoCo Simulation
branch: robotics
requires: [inverse-kinematics, pid-control]
hours: 16
summary: MuJoCo 위 SO-101 의 PD 제어·IK 도달·카메라 렌더
papers:
  - title: "MuJoCo: A physics engine for model-based control"
    authors: Emanuel Todorov, Tom Erez, Yuval Tassa
    year: 2012
    url: https://doi.org/10.1109/IROS.2012.6386109
  - title: "MuJoCo Menagerie: A collection of high-quality simulation models for MuJoCo"
    authors: Kevin Zakka, Yuval Tassa, MuJoCo Menagerie Contributors
    year: 2022
    url: https://github.com/google-deepmind/mujoco_menagerie
---

# MuJoCo Simulation

## 배경

pid-control 의 pendulum 은 equation of motion 을 손으로 쓸 수 있었지만, joint 다섯 개짜리 팔은 각 joint 의 inertia 와
gravity 가 configuration 에 따라 서로 얽히고 gripper 가 물체에 닿으면 contact force 까지 생긴다. physics engine 은 이 모두를
generalized coordinate $q$ 로 적은 식 하나로 다룬다.

$$
M(q)\,\ddot q + c(q, \dot q) = \tau + J_c^\top f_c
$$

$M(q)$ 는 mass matrix, $c$ 는 Coriolis·centrifugal·gravity 항을 합친 bias force, $J_c^\top f_c$ 는 contact force 가 joint 에
주는 힘이다. MuJoCo(2012)는 이 식을 contact 까지 포함해 빠르고 안정적으로 푸는 engine 으로, robot learning 에서 가장 널리 쓰이는
simulator 가운데 하나다. 모델은 MJCF 라는 XML 로 적고, joint PD 에 bias force 를 더하면 gravity compensation 이 된다.

$$
\tau = K_p\,(q_d - q) - K_d\,\dot q + c(q, \dot q)
$$

MuJoCo 는 매 step $c(q, \dot q)$ 를 `data.qfrc_bias` 에 계산해 둔다. MuJoCo Menagerie 의 SO-101 모델은 actuator 가 `position`
형식이라 `ctrl` 에 목표 각도를 넣으면 engine 안에서 PD 가 돈다. 이번 과제에서는 actuator 를 torque 형식(`motor`)으로 바꿔
PD 를 직접 짜고, 그 결과를 Menagerie 의 기본 actuator 와 비교한다.

## 목표

- Menagerie 의 SO-101 scene 을 불러 joint·actuator·camera 구성을 확인한다
- actuator 를 `motor` 로 바꾼 사본 위에 PD + gravity compensation 을 짠다
- inverse-kinematics 과제의 IK 로 목표 joint angle 을 구하고 minimum-jerk trajectory 로 따라간다
- 고정 카메라와 손목 카메라(`wrist_cam`) 영상을 렌더링해 mp4 로 저장한다
- 내 PD 와 Menagerie 기본 `position` actuator 의 추종 결과를 비교한다

**직접 짤 것**: PD + gravity compensation, trajectory 추종 loop, IK 연결, 렌더링 loop.
**가져다 써도 되는 것**: MuJoCo 의 적분·contact 계산, `mujoco.viewer`, `mujoco.Renderer`, mp4 저장용 `imageio`·`mediapy`.

## 준비물

- Python 3.12, `mujoco`, numpy, `imageio[ffmpeg]`(또는 `mediapy`), matplotlib
- [MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie) 의 `robotstudio_so101/` — mesh 가 들어 있는 폴더째로
  쓴다
- GPU 불필요. 화면 없는 Linux 에서는 `MUJOCO_GL=egl`(GPU 가 있을 때)이나 `MUJOCO_GL=osmesa` 로 offscreen 렌더링을 한다
- macOS 에서 `mujoco.viewer.launch_passive` 를 쓰려면 `python` 대신 `mjpython` 으로 실행한다

## 진행 순서

1. `scene.xml` 을 불러 `nq`·`nv`·`nu`, joint 이름과 range, actuator 의 gain·`forcerange`, `opt.timestep` 을 출력한다
2. viewer 를 띄우고 기본 `position` actuator 의 `ctrl` 에 목표 각도를 넣어 팔이 움직이는지 본다
3. `so101.xml` 을 복사해 `position` actuator 를 같은 torque 범위의 `motor` actuator 로 바꾼다
4. 팔을 수평으로 뻗은 configuration 을 PD 만으로 잡을 때와 `qfrc_bias` 를 더했을 때의 처짐을 비교한다
5. end-effector 목표 위치를 IK 로 joint angle 로 바꾸고, 그 값까지 minimum-jerk trajectory 로 추종한다
6. 무작위 목표 20개의 도달 오차와 걸린 시간을 표로 남긴다
7. 작업 공간을 보는 고정 카메라를 scene 에 추가하고, 고정 카메라와 `wrist_cam` 영상을 30 fps mp4 로 저장한다

## 시작점

```text
mujoco-sim/
├── assets/                 # copy of Menagerie robotstudio_so101
│   ├── scene.xml
│   ├── so101.xml
│   └── so101_motor.xml     # position -> motor actuators
├── control.py              # pd_gravity
├── reach.py                # IK + trajectory tracking demo
├── render.py               # camera rendering, mp4 export
└── test_sim.py
```

```python
import mujoco
import numpy as np

def load(xml_path: str) -> tuple[mujoco.MjModel, mujoco.MjData]: ...

def pd_gravity(model: mujoco.MjModel, data: mujoco.MjData, q_d: np.ndarray,
               kp: np.ndarray, kd: np.ndarray) -> np.ndarray:
    """(nu,) joint torques, clipped to the actuator ctrlrange."""
    ...

def track(model: mujoco.MjModel, data: mujoco.MjData, q_traj: np.ndarray,
          control_dt: float) -> np.ndarray:
    """follows q_traj (T, nu) every control_dt, stepping physics in between. returns logged qpos."""
    ...

def render_cameras(renderer: mujoco.Renderer, data: mujoco.MjData,
                   cameras: list[str]) -> dict[str, np.ndarray]:
    """returns {camera name: (H, W, 3) uint8 image}."""
    ...
```

## 평가 기준

- [ ] `so101.xml` 만 불렀을 때 `nq = nv = nu = 6` 이고, cube 가 든 `scene_box.xml` 은 freejoint 때문에 `nq = 13`, `nv = 12` 다
- [ ] 같은 gain 에서 `qfrc_bias` 를 더하면 수평 configuration 의 steady-state error 가 PD 만 쓸 때의 1/5 아래로 준다
- [ ] self-collision 이 없는 무작위 목표 20개 중 18개 이상에서 end-effector 가 2초 안에 목표 5 mm 안으로 들어간다
- [ ] 내 PD 와 기본 `position` actuator 의 최종 도달 오차가 둘 다 5 mm 안이다
- [ ] 고정 카메라와 `wrist_cam` 의 640×480 영상이 30 fps mp4 로 저장되고, 영상 속 움직임이 기록한 joint trajectory 와 시점이
      맞는다
- [ ] (선택) 제어 주기를 500 Hz 에서 20 Hz 까지 낮추며 같은 gain 의 tracking error 와 안정성을 비교한다

## 생각해 볼 질문

1. physics timestep(5 ms), controller 주기, 카메라 frame 주기를 서로 다르게 두는 이유는? 셋이 맞물려야 하는 경우는 언제인가?
2. `qfrc_bias` 를 그대로 더하는 gravity compensation 이 실물 로봇에서도 같은 효과를 내려면 무엇이 필요한가? 무엇이 틀릴 수
   있는가?
3. Menagerie 의 `position` actuator 는 `kp` 가 1000 가까이인데 `forcerange` 는 ±2.94 N·m 다. 목표가 멀리 있을 때 이
   actuator 는 사실상 어떻게 움직이는가?

## 힌트

<details>
<summary>actuator 의 motor 전환</summary>

`<position class="sts3215" name="..." joint="..." ctrlrange="..."/>` 를 `<motor name="..." joint="..." ctrlrange="-2.94 2.94"/>`
꼴로 바꾸면 `ctrl` 이 torque(N·m)가 된다. joint 의 `damping`·`frictionloss`·`armature` 는 default class 에 그대로 남아 있어서
내 $K_d$ 와 joint damping 이 함께 작용한다.

</details>

<details>
<summary>IK 의 end-effector 와 MuJoCo 의 end-effector</summary>

Menagerie 의 `gripperframe` site 는 URDF 의 `gripper_frame_link` 와 2 cm 쯤 떨어진 다른 점이다. IK 는 URDF 로 풀고 오차는
MuJoCo 로 재면 그만큼 어긋나니, 한쪽에 맞춰 같은 점을 쓴다. 두 모델의 joint 순서와 zero configuration 은 같다.

</details>

<details>
<summary>렌더링 크기와 MuJoCo 카메라 축</summary>

`mujoco.Renderer` 의 크기는 model 의 offscreen buffer(`<visual><global offwidth offheight>`)를 넘을 수 없다. MuJoCo 카메라는
자기 frame 의 $-z$ 를 바라보고 $+y$ 가 화면 위쪽이라서, $+z$ 를 바라보고 $+y$ 가 아래쪽인 OpenCV 규약과 x 축 기준으로 180°
돌아 있다. physics 는 5 ms 마다 돌고 영상은 33 ms 마다 필요하니, 렌더링은 sim 시간이 다음 frame 시각을 넘을 때만 한다.

</details>

## 참고 자료

- [MuJoCo Python bindings 문서](https://mujoco.readthedocs.io/en/stable/python.html) 와 공식
  [tutorial notebook](https://colab.research.google.com/github/google-deepmind/mujoco/blob/main/python/tutorial.ipynb)(Colab
  에서 바로 열린다)
- MuJoCo 문서 [Computation](https://mujoco.readthedocs.io/en/stable/computation/index.html) — 위 equation of motion 과 bias force
  의 정의
- [MJCF XML reference](https://mujoco.readthedocs.io/en/stable/XMLreference.html) — actuator·camera·option 속성
- Menagerie [robotstudio_so101](https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotstudio_so101) — README 에
  원본 MJCF 에서 바꾼 점이 적혀 있다
- 막혔을 때만 열기: [mink](https://github.com/kevinzakka/mink) — MuJoCo model 위에서 바로 도는 differential IK

## 남은 한계

팔은 원하는 곳에 가지만 무엇을 집을지는 아직 모르고, 사람이 보여 준 동작을 기록할 방법도 없다. 카메라로 물체를 찾아 집는 모듈
파이프라인은 [Classical Pick & Place](../classical-pick/README.md), 시연 데이터 수집은 [Teleop Dataset](../teleop-dataset/README.md),
같은 simulator 로 하는 locomotion policy 학습은 [Sim-to-Real Locomotion](../sim2real-locomotion/README.md) 에서 이어진다.
