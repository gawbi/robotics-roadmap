---
id: forward-kinematics
title: Forward Kinematics
branch: robotics
requires: [transforms]
hours: 10
summary: URDF 를 직접 읽어 joint chain 으로 계산하는 FK
papers:
  - title: "A Kinematic Notation for Lower-Pair Mechanisms Based on Matrices"
    authors: Jacques Denavit, Richard S. Hartenberg
    year: 1955
    url: https://doi.org/10.1115/1.4011045
  - title: "Robotic manipulators and the product of exponentials formula"
    authors: Roger W. Brockett
    year: 1984
    url: https://doi.org/10.1007/BFb0031048
  - title: "Modern Robotics: Mechanics, Planning, and Control"
    authors: Kevin M. Lynch, Frank C. Park
    year: 2017
    url: https://hades.mech.northwestern.edu/index.php/Modern_Robotics
  - title: "The Pinocchio C++ library: A fast and flexible implementation of rigid body dynamics algorithms and their analytical derivatives"
    authors: Justin Carpentier et al.
    year: 2019
    url: https://hal.science/hal-01866228
---

# Forward Kinematics

## 배경

transforms 에서는 frame 사이의 변환을 다뤘지만, 그 변환이 joint angle 에 따라 어떻게 바뀌는지는 다루지 않았다. 로봇 팔은
link 가 joint 로 이어진 chain 이라서, joint 마다 그 joint 가 붙은 자리까지의 고정 변환과 joint angle 만큼의 rotation 을 차례로 곱하면
end-effector 의 pose 가 나온다. 이 계산이 forward kinematics(FK)다.

$$
T_{0n}(q) = \prod_{i=1}^{n} T^{\text{origin}}_{i}\; \exp\!\big([\hat a_i]\,q_i\big)
$$

$T^{\text{origin}}_i$ 는 parent link frame 에서 본 joint $i$ 의 pose 이고, $\hat a_i$ 는 그 frame 에서 본 joint axis 다.
prismatic joint 이면 rotation 대신 $\hat a_i q_i$ 만큼 translation 한다. URDF 는 이 두 가지를 joint 마다 `<origin xyz rpy>` 와
`<axis>` 로 적어 둔 XML 이고, ROS 를 비롯한 대부분의 로봇 소프트웨어가 이 형식으로 로봇 모양을 주고받는다.

1955년 Denavit 과 Hartenberg 는 joint 하나를 숫자 4개로 적는 규약(DH parameter)을 만들었고, 지금도 많은 교과서가 이 규약을
쓴다. 하지만 URDF 는 joint 마다 임의의 6D origin 을 허용하므로 DH 로 바꿀 필요 없이 파일을 그대로 따라가면 된다. Brockett 의
product of exponentials(PoE)는 zero configuration 에서 적은 screw axis 만으로 같은 FK 를 표현하는 또 다른 방법이고,
Modern Robotics 가 이 방식을 쓴다.

## 목표

- URDF 의 link·joint 를 읽어 parent → child tree 를 만든다
- joint angle 을 받아 모든 link 의 world pose 를 내는 FK 를 짠다
- pinocchio 가 같은 URDF 로 계산한 결과와 숫자로 비교한다
- 팔을 3D stick figure 로 그려 configuration 이 그럴듯한지 눈으로 확인한다
- (선택) PoE 로 같은 FK 를 다시 짜서 비교한다

**직접 짤 것**: URDF parser(`xml.etree.ElementTree` 로), joint 변환, tree 순회. rotation 변환은 transforms 과제의 코드를 쓴다.
**가져다 써도 되는 것**: 비교용 pinocchio, 그림용 matplotlib.

## 준비물

- Python 3.12, numpy, matplotlib, `pin`(pinocchio 의 pip 패키지), pytest
- SO-101 URDF — [SO-ARM100 리포](https://github.com/TheRobotStudio/SO-ARM100/tree/main/Simulation/SO101) 의
  `so101_new_calib.urdf`. FK 에는 mesh 가 필요 없어서 이 파일 하나면 된다
- GPU 불필요

## 진행 순서

1. URDF 를 열어 모든 joint 의 `type`·`parent`·`child`·`origin`·`axis`·`limit` 를 표로 출력한다
2. 어떤 joint 의 child 도 아닌 root link 를 찾고, link → 자식 joint 목록의 tree 를 만든다
3. joint type(revolute·continuous·prismatic·fixed)별 움직임 변환을 짠다
4. root 에서 tree 를 따라 내려가며 모든 link 의 world pose 를 채우는 FK 를 짠다
5. joint limit 안의 무작위 joint angle 1,000세트로 pinocchio 와 비교하는 test 를 쓴다
6. 몇 가지 configuration 을 3D stick figure 로 그린다
7. (선택) zero configuration 의 screw axis 를 뽑아 PoE FK 를 짜고 비교한다

## 시작점

```text
forward-kinematics/
├── urdf.py                 # Joint, Robot, parse_urdf
├── fk.py                   # joint_transform, forward_kinematics
├── viz.py                  # stick figure
├── test_fk.py
└── so101_new_calib.urdf
```

```python
from dataclasses import dataclass, field
import numpy as np

@dataclass
class Joint:
    name: str
    type: str                  # "revolute" | "continuous" | "prismatic" | "fixed"
    parent: str                # parent link name
    child: str                 # child link name
    origin: np.ndarray         # (4, 4) parent link frame -> joint frame
    axis: np.ndarray           # (3,) unit axis in the joint frame
    lower: float | None = None
    upper: float | None = None

@dataclass
class Robot:
    root: str
    joints: dict[str, Joint]
    children: dict[str, list[str]] = field(default_factory=dict)  # link -> child joint names

def parse_urdf(path: str) -> Robot: ...

def joint_transform(joint: Joint, q: float) -> np.ndarray:
    """(4, 4) motion of the joint itself for joint value q (identity for fixed joints)."""
    ...

def forward_kinematics(robot: Robot, q: dict[str, float]) -> dict[str, np.ndarray]:
    """returns {link name: (4, 4) pose in the root frame}. missing joints default to 0."""
    ...
```

## 스스로 확인

- [ ] 무작위 joint angle 1,000세트에서 모든 link 의 위치가 pinocchio 와 1e-9 m, orientation 이 1e-9 rad 안에서 같다
- [ ] URDF 의 `<joint>` 원소 순서를 무작위로 섞어 저장한 파일로도 같은 결과가 나온다
- [ ] (선택) PoE FK 가 URDF chain FK 와 1e-9 안에서 같다
- [ ] (선택) MuJoCo Menagerie 의 `so101.xml` 을 불러 같은 joint angle 을 넣으면 대응하는 body 의 위치가 0.1 mm 안에서 같다

## 생각해 볼 질문

1. DH parameter 는 joint 하나를 숫자 4개로 적는데 URDF 의 origin 은 6개를 쓴다. 남는 2개로 무엇을 얻고 무엇을 잃는가?
2. PoE 에서는 각 joint 의 screw axis 를 zero configuration 에서 한 번만 적어 두면 된다. 앞쪽 joint 가 움직여도 그 값을 고칠
   필요가 없는 이유는?
3. FK 계산이 정확해도 실물 SO-101 의 end-effector 가 FK 결과와 몇 mm 씩 어긋나는 이유로는 무엇이 있는가?

## 힌트

<details>
<summary>joint 순서와 tree</summary>

SO-101 URDF 는 joint 가 gripper 쪽부터 거꾸로 적혀 있어서, 파일에 나온 순서대로 곱하면 틀린다. root link 에서 출발해 parent
→ child 방향으로 순회하고, 각 link 의 pose 는 parent link 의 pose 가 정해진 뒤에 계산한다.

</details>

<details>
<summary>pinocchio 와의 비교 방법</summary>

`pin.buildModelFromUrdf(path)` 로 model 을 만들고 `pin.framesForwardKinematics(model, data, q)` 를 부른 뒤,
`data.oMf[model.getFrameId("wrist_link")]` 처럼 link 이름으로 frame 을 찾는다. pinocchio 의 `q` 는 `model.names` 에 나오는
joint 순서(첫 항목 `universe` 제외)를 따르고, orientation 차이는 $\lVert \log(R_{\text{mine}}^\top R_{\text{pin}}) \rVert$ 로 잰다.

</details>

<details>
<summary>MuJoCo 와의 비교</summary>

Menagerie 의 body 이름은 URDF link 이름에서 `_link` 를 뗀 꼴(`shoulder`, `upper_arm` …)이다. MJCF 는 URDF 의 숫자를 반올림해
옮긴 것이라 완전히 같지는 않다. end-effector 의 `gripperframe` site 는 URDF 의 `gripper_frame_link` 와 2 cm 쯤 떨어진 다른
점이니, 비교는 body 끼리 한다.

</details>

## 참고 자료

- ROS wiki 의 URDF XML 명세 [`<joint>`](http://wiki.ros.org/urdf/XML/joint) · [`<link>`](http://wiki.ros.org/urdf/XML/link) —
  `origin`·`axis`·`rpy` 의 정확한 정의
- Lynch & Park, [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) 4장 forward kinematics —
  space frame 과 body frame 두 가지 PoE
- Russ Tedrake, [Robotic Manipulation — Ch. 3](https://manipulation.csail.mit.edu/pick.html) 의 "Forward kinematics"·"The
  kinematic tree" 절
- [TheRobotStudio/SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100/tree/main/Simulation/SO101) — SO-101 의 URDF 와 MJCF
- 막혔을 때만 열기: [pinocchio](https://github.com/stack-of-tasks/pinocchio) 의 URDF parser,
  [NxRLab/ModernRobotics](https://github.com/NxRLab/ModernRobotics/tree/master/packages/Python) 의 `FKinSpace`·`FKinBody`

## 남은 한계

joint angle 에서 end-effector pose 는 구할 수 있지만, 물체를 집을 때 필요한 것은 반대 방향, 곧 "cube 위 5 cm 에 gripper 를
두려면 joint angle 이 얼마여야 하나" 다. 이 역문제를 푸는 과제가 [Inverse Kinematics](../inverse-kinematics/README.md) 다.
