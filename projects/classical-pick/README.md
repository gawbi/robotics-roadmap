---
id: classical-pick
title: Classical Pick & Place
branch: robotics
requires: [mujoco-sim, camera-geometry]
hours: 20
summary: 카메라·IK·trajectory 를 손으로 이은 모듈 파이프라인
papers:
  - title: "Automatic generation and detection of highly reliable fiducial markers under occlusion"
    authors: S. Garrido-Jurado, R. Muñoz-Salinas, F. J. Madrid-Cuevas, M. J. Marín-Jiménez
    year: 2014
    url: https://doi.org/10.1016/j.patcog.2014.01.005
  - title: "End-to-End Training of Deep Visuomotor Policies"
    authors: Sergey Levine, Chelsea Finn, Trevor Darrell, Pieter Abbeel
    year: 2016
    url: https://arxiv.org/abs/1504.00702
---

# Classical Pick & Place

## 배경

mujoco-sim 의 팔은 좌표만 주면 그곳으로 가고, camera-geometry 의 코드는 pixel 에서 3D pose 를 구한다. 이 둘을 이으면 공장
로봇이 오래 써 온 모듈 파이프라인 방식의 pick-and-place 가 된다. 카메라 영상에서 물체를 찾아 그 pose 를 로봇 base frame 으로
옮기고, grasp pose 를 정해 IK 로 joint angle 을 구한 뒤 trajectory 를 만들어 따라간다.

$$
T_{bo} = T_{bc}\,T_{co}, \qquad q_{\text{grasp}} = \mathrm{IK}\!\left(T_{bo}\,T_{og}\right)
$$

$T_{co}$ 는 카메라가 본 물체 pose, $T_{bc}$ 는 base 에서 본 카메라 pose(extrinsics), $T_{og}$ 는 물체 기준으로 정한 grasp
pose 다. 모듈마다 입력과 출력이 분명해서 어느 단계가 틀렸는지 따로 시험할 수 있지만, 앞 모듈의 오차는 뒤 모듈로 그대로
넘어가고 물체 모양·조명·카메라 위치가 바뀌면 사람이 규칙을 다시 짜야 한다.

Levine 등(2016)은 카메라 영상에서 motor torque 까지를 neural network 하나로 학습하는 end-to-end visuomotor policy 를 내놓으며
이 한계를 정면으로 다뤘다. 이번 과제에서는 end-to-end policy 와 비교할 baseline 인 모듈 파이프라인을 끝까지 만들어 보고,
어디에서 얼마나 실패하는지를 숫자로 남긴다.

## 목표

- 작업대 위에 cube 와 고정 카메라가 있는 MuJoCo scene 을 만든다
- 렌더링한 영상에서 cube 를 찾아 base frame 기준의 위치와 yaw 를 추정한다
- pre-grasp → grasp → lift → place 로 이어지는 waypoint 를 정하고 IK 로 joint angle 을 구한다
- minimum-jerk trajectory 로 waypoint 를 잇고 gripper 를 여닫는다
- 무작위 cube 배치 50개로 성공률을 재고 실패를 모듈별로 나눈다

**직접 짤 것**: perception(색 분할이나 ArUco 에서 pose 까지), frame 변환 연결, grasp pose 규칙, waypoint 계획, 실행 loop,
평가 script. IK·trajectory·camera 코드는 앞 과제의 것을 쓴다.
**가져다 써도 되는 것**: MuJoCo, `cv2` 의 기본 영상 처리(`inRange`, `findContours`, `minAreaRect`)와 ArUco 검출.

## 준비물

- Python 3.12, `mujoco`, numpy, `opencv-python`, matplotlib
- mujoco-sim 과제의 SO-101 scene. actuator 는 Menagerie 기본 `position` 이든 내 PD 든 상관없다
- GPU 불필요

## 진행 순서

1. scene 에 작업대, 3 cm cube(freejoint), 작업 공간을 위에서 내려다보는 고정 카메라를 추가한다
2. 카메라의 intrinsics 를 `fovy` 에서, extrinsics 를 MuJoCo 가 계산한 카메라 pose 에서 구해 $K$ 와 $T_{bc}$ 를 만든다
3. 렌더링한 영상에서 cube 윗면의 중심 pixel 과 yaw 를 구한다
4. 그 pixel 을 지나는 카메라 ray 를 cube 윗면 높이의 평면과 교차시켜 base frame 의 점으로 바꾼다
5. cube 의 위치·yaw 로 pre-grasp·grasp·lift·place waypoint 를 정하고 IK 로 joint angle 을 구한다
6. waypoint 사이를 minimum-jerk 로 잇고 gripper 를 여닫으며 실행한다
7. cube 를 무작위 위치·yaw 에 놓고 50회 돌려 성공률과 실패 원인을 표로 남긴다
8. 카메라 extrinsics 에 오차를 넣거나 조명을 바꾼 뒤 같은 평가를 다시 돌린다

## 시작점

```text
classical-pick/
├── assets/pick_scene.xml   # SO-101 + table + cube + fixed camera
├── perception.py           # detect_cube, pixel_to_table
├── grasp.py                # grasp_pose, plan_waypoints
├── execute.py              # waypoints -> IK -> min-jerk -> gripper
├── evaluate.py             # 50 random trials, failure table
└── test_perception.py
```

```python
from dataclasses import dataclass
import numpy as np

@dataclass
class CubeEstimate:
    position: np.ndarray       # (3,) in the robot base frame, meters
    yaw: float                 # radians, defined modulo pi / 2
    pixel: tuple[float, float]

def detect_cube(rgb: np.ndarray, K: np.ndarray, T_bc: np.ndarray, top_z: float) -> CubeEstimate | None:
    """rgb (H, W, 3) uint8 from the fixed camera. T_bc uses the OpenCV camera convention."""
    ...

def grasp_pose(cube: CubeEstimate, current_wrist_roll: float) -> np.ndarray:
    """(4, 4) top-down gripper pose in the base frame."""
    ...

def plan_waypoints(cube: CubeEstimate, place_xy: np.ndarray) -> list[tuple[str, np.ndarray, float]]:
    """[(name, T_base_gripper (4, 4), gripper_command), ...] from pre-grasp to retreat."""
    ...

def run_trial(seed: int) -> dict:
    """one episode. returns {"success": bool, "failure": str | None, "pos_err_mm": float, ...}."""
    ...
```

## 평가 기준

- [ ] perception 단위 test 에서 `data.body("cube").xpos` 참값 대비 위치 오차의 median 이 5 mm 아래, yaw 오차가 5° 아래다
- [ ] 무작위 배치 50회 중 80% 이상에서 cube 가 5 cm 넘게 들렸다가 place 목표 2 cm 안에 놓인다
- [ ] 실패한 시도마다 원인을 perception·IK·grasp(미끄러짐)·충돌 가운데 하나로 분류한 표가 있다
- [ ] 카메라 extrinsics 를 1 cm·2° 틀리게 넣었을 때 성공률이 얼마나 떨어지는지 측정했다
- [ ] (선택) cube 를 원기둥이나 색이 다른 물체로 바꿀 때 고쳐야 하는 모듈과 숫자를 목록으로 적는다

## 생각해 볼 질문

1. 이 파이프라인에서 사람이 손으로 정한 숫자와 규칙(색 임계값, grasp 높이, waypoint 간격 …)을 모두 꼽아 보면 몇 개인가?
   물체나 작업이 바뀌면 그중 무엇을 다시 정해야 하는가?
2. perception·IK·실행 단계의 오차가 몇 mm 씩 겹치면 grasp 성공은 무엇으로 정해지는가? end-to-end policy 는 같은 오차를
   어떻게 다루는가?
3. 모듈 파이프라인이 end-to-end policy 보다 분명히 나은 상황은 언제인가?

## 힌트

<details>
<summary>MuJoCo 카메라에서 base frame 의 점까지</summary>

MuJoCo 카메라는 세로 field of view `fovy`(degree) 하나로 정의되고 pixel 이 정사각형이라
$f_x = f_y = \frac{H/2}{\tan(\text{fovy}/2)}$, principal point 는 영상 중심이다. `data.cam_xpos`·`data.cam_xmat` 이 world 에서
본 카메라 pose 인데, MuJoCo 카메라는 $-z$ 를 바라보고 $+y$ 가 위쪽이라 OpenCV 규약으로 쓰려면 x 축 기준 180° rotation 을
오른쪽에 곱한다. cube 는 작업대 위에 놓이니 윗면 높이 $z = h$ 를 알고, pixel $(u, v)$ 의 방향
$d = R_{bc}\,K^{-1}[u, v, 1]^\top$ 로 쏜 ray 가 평면 $z = h$ 와 만나는 점을 구하면 depth 영상 없이도 위치가 나온다.

</details>

<details>
<summary>top-down grasp 와 yaw</summary>

SO-101 은 팔의 joint 가 5개지만, gripper 를 수직 아래로 향하게 하는 grasp 에서는 `wrist_flex` 가 수직을 맞추고 `wrist_roll`
이 yaw 를 맡아서 위치·수직·yaw 를 모두 맞출 수 있다. cube 는 90° 마다 같은 모양이라 yaw 후보 네 개 가운데 `wrist_roll` range
안에서 현재 값과 가장 가까운 것을 고른다.

</details>

<details>
<summary>색 분할 대신 ArUco marker 사용</summary>

marker PNG 를 `type="2d"` texture 로 만들어 cube 의 material 에 붙인다. primitive geom 에는 2d texture 가 local XY 로 투영되기
때문에 윗면에서 marker 가 제대로 보이고, 크기는 material 의 `texrepeat`·`texuniform` 으로 맞춘다. 그러면 camera-geometry 의
marker pose 코드로 위치와 yaw 를 한 번에 얻는다.

</details>

## 참고 자료

- Russ Tedrake, [Robotic Manipulation — Ch. 3 Basic Pick and Place](https://manipulation.csail.mit.edu/pick.html) — 같은
  문제를 spatial algebra, differential IK, grasp·pre-grasp pose, trajectory 순으로 푼다
- OpenCV, [Detection of ArUco Markers](https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html)
- [MJCF XML reference](https://mujoco.readthedocs.io/en/stable/XMLreference.html) 의 `camera`·`texture`·`material` 항목
- Levine 외, [End-to-End Training of Deep Visuomotor Policies](https://arxiv.org/abs/1504.00702) — 같은 일을 network 하나로
  하는 쪽의 출발점

## 남은 한계

이 파이프라인은 cube 하나, 정해진 카메라, 정해진 조명에 맞춰져 있어서 물체나 작업이 바뀔 때마다 perception 규칙과 grasp
규칙을 사람이 다시 짜야 한다. 그 규칙을 시연 데이터에서 배우는 쪽이 imitation learning 이고,
[Behavior Cloning](../behavior-cloning/README.md) 에서 시작해 [ACT](../act/README.md)·[Diffusion Policy](../diffusion-policy/README.md)
로 이어진다.
