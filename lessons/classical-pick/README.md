---
id: classical-pick
title: Classical Pick & Place
branch: grasping
requires: [mujoco-sim, camera-geometry]
hours: 2
summary: 사진에서 찾은 물체를 3D 위치·grasp pose·IK·경로·실행으로 이어 옮기는 모듈 파이프라인. 단계별 오차 누적과 실패 분류, MoveIt Task Constructor 의 stage, end-to-end 와의 비교
papers:
  - title: "Analysis and Observations from the First Amazon Picking Challenge"
    authors: Nikolaus Correll, Kostas E. Bekris, Dmitry Berenson, Oliver Brock, Albert Causo, Kris Hauser, Kei Okada, Alberto Rodriguez, Joseph M. Romano, Peter R. Wurman
    year: 2016
    url: https://arxiv.org/abs/1601.05484
  - title: "MoveIt! Task Constructor for Task-Level Motion Planning"
    authors: Michael Görner, Robert Haschke, Helge Ritter, Jianwei Zhang
    year: 2019
    url: https://doi.org/10.1109/ICRA.2019.8793898
  - title: "YOLO-World: Real-Time Open-Vocabulary Object Detection"
    authors: Tianheng Cheng, Lin Song, Yixiao Ge, Wenyu Liu, Xinggang Wang, Ying Shan
    year: 2024
    url: https://arxiv.org/abs/2401.17270
  - title: "End-to-End Training of Deep Visuomotor Policies"
    authors: Sergey Levine, Chelsea Finn, Trevor Darrell, Pieter Abbeel
    year: 2016
    url: https://arxiv.org/abs/1504.00702
---

# Classical Pick & Place

로봇 팔이 책상 위의 상자를 집으려고 내려가다가 손가락이 상자 모서리에 걸려 상자를 밀어내는 일은 흔하다. 카메라가 상자 위치를 몇 mm
틀리게 봤을 수도 있고 관절 각도를 잘못 계산했거나 내려가는 길이 휘었을 수도 있지만, 겉으로 보이는 결과는 "못 집었다" 하나뿐이다.
사진 한 장에서 손가락이 닫히기까지 로봇이 하는 여러 계산 가운데, 어느 계산이 틀렸는지 어떻게 가려낼 수 있을까?

이 일을 인식, 3D 위치, 잡기 자세, IK, 경로, 실행의 여섯 단계로 나누고 단계마다 입력과 출력을 정해 두면 중간 값을 하나씩 확인할 수 있다.
사람이 짠 규칙으로 이 단계들을 이은 방식이 classical pick-and-place 이고, ROS 2 의 MoveIt 2 는 같은 구조를 MoveIt Task Constructor 의
stage 로 제공한다. 2015 년 첫 Amazon Picking Challenge 가 끝난 뒤 설문에 답한 25 팀 가운데 20 팀이 motion planning 으로 팔의 경로를
따로 계산했고, 팀들은 가장 어려운 단계로 인식을 꼽았다.

## 학습 목표

- pick-and-place 를 여섯 module 로 나누고 module 마다 무엇을 받아 무엇을 내는지 설명할 수 있다
- pixel 과 depth 로 물체의 base frame 좌표를 계산하고, depth 대신 높이를 가정할 때 생기는 오차를 설명할 수 있다
- grasp pose, waypoint, IK, 경로가 MoveIt Task Constructor 의 어떤 stage 로 구현되는지 설명할 수 있다
- module 마다 생긴 작은 오차가 더해져 실패가 되는 과정을 error budget 으로 계산하고, 모듈 파이프라인과 end-to-end policy 를 비교할 수 있다

## pick-and-place 와 모듈 파이프라인

물체를 집어(pick) 다른 곳에 놓는(place) 일을 pick-and-place 라고 한다. 로봇이 받는 정보는 카메라 사진 한 장과 지금의 관절 각도뿐인데, 이 두
가지에서 곧바로 관절 명령을 계산하기는 어려워서 일을 작은 단계로 나눈다. 단계마다 받는 값(입력)과 내는 값(출력)을 정해 두고, 앞 단계의 출력을
다음 단계의 입력으로 넘긴다. 입력과 출력이 정해진 한 단계를 **module** 이라 하고, module 을 이어 데이터가 앞에서 뒤로 흐르게 만든 것을
**pipeline** 이라고 한다. 사람이 짠 규칙으로 module 을 잇는 이 방식은 데이터로 학습하는 방식보다 먼저 쓰였다고 해서 classical(전통적인)
pick-and-place 라고 부른다.

![여섯 module 로 나눈 pick-and-place. 인식이 사진에서 pixel (220, 240) 과 yaw 10° 를 찾으면 3D 위치가 이를 base frame 좌표 (0.20, 0, 0.05) 로 바꾸고, 잡기 자세가 waypoint 여섯 개를 정한다. IK 가 waypoint 마다 joint angle 을 구하면 경로가 그 사이를 minimum-jerk trajectory 로 잇고, 실행 단계가 팔과 gripper 를 움직인다](figures/pipeline.svg)

각 module 이 받는 것과 내는 것은 아래와 같다.

| 순서 | module | 입력 | 출력 |
| --- | --- | --- | --- |
| ① | 인식 | 카메라 사진 | 상자 가운데의 pixel 과 돌아간 각도 |
| ② | 3D 위치 | pixel, depth | base frame 의 실제 좌표 (m) |
| ③ | 잡기 자세 | 상자의 좌표와 각도 | 손이 거쳐 갈 자세 여섯 개 |
| ④ | IK | 손의 자세 | 그 자세의 joint angle |
| ⑤ | 경로 | 자세별 joint angle | 시각별 목표 각도 |
| ⑥ | 실행 | 시각별 목표 각도 | 실제로 움직이는 팔과 gripper |

예시 장면의 숫자는 [Camera Geometry](../camera-geometry/README.md) 의 예시 카메라를 이어받는다.

- 로봇 base frame: 로봇 바닥 가운데를 원점으로 잡은 좌표의 기준이다. $x$ 축은 로봇 앞쪽을 향하고 $y$ 축은 왼쪽을 향하며, $z$ 축은 위쪽을
  향한다. 책상 윗면이 $z = 0$ 이다
- 카메라: focal length 는 $f = 500$ 이고 principal point 는 $(c_x, c_y) = (320, 240)$ 이다. base frame 의 $(0.3, 0, 0.55)$ 에서 수직 아래를
  내려다본다
- 물체: 한 변 5 cm 인 빨간 정육면체(cube)라서 윗면 높이는 0.05 m 이고 가운데 높이는 0.025 m 다
- gripper: 팔 끝의 두 손가락짜리 집게로, 손가락이 최대 7 cm 까지 벌어진다

## 색과 이름으로 찾는 물체

첫 module 인 인식은 cube 윗면 가운데가 사진의 어느 칸(pixel)에 찍혔는지를 낸다. pixel 하나에는 빨강·초록·파랑 빛의 세기가
0 ~ 255 의 숫자 세 개(RGB 값)로 적혀 있다. cube 는 빨갛고 책상은 회색이라 "R 이 150 이상이고 G·B 가 80 이하이면 cube" 같은 규칙으로 cube 의
pixel 을 고를 수 있다. 사진의 모든 pixel 에 이 규칙을 적용해, cube 로 판정한 칸에는 1 을 적고 나머지 칸에는 0 을 적은 표를 **mask** 라고 한다.

이 규칙은 그늘진 칸을 놓친다. 그늘이 지면 R·G·B 가 거의 같은 비율로 함께 줄어서, 밝기가 반이 된 cube 윗면 $(200, 40, 30)$ 은
$(100, 20, 15)$ 가 되고 R 이 150 아래로 떨어진다. 그래도 세 숫자 가운데 빨강이 차지하는 몫은 그대로라서, 규칙을 몫으로 바꾸면 그늘진 칸도 고른다.

| pixel | RGB | R ≥ 150 이고 G·B ≤ 80 | 빨강의 몫 R ÷ (R + G + B) | 몫 ≥ 0.6 |
| --- | --- | --- | --- | --- |
| 밝은 cube | $(200, 40, 30)$ | cube | $200 \div 270 \approx 0.74$ | cube |
| 그늘진 cube | $(100, 20, 15)$ | 놓침 | $100 \div 135 \approx 0.74$ | cube |
| 책상 | $(120, 110, 100)$ | 아님 | $120 \div 330 \approx 0.36$ | 아님 |
| 책상의 반사광 | $(230, 200, 190)$ | 아님 | $230 \div 620 \approx 0.37$ | 아님 |

색을 hue(색상), saturation(채도), value(명도)로 나눠 적는 HSV 도 같은 원리를 쓴다. 밝기가 바뀌면 주로 value 만 바뀌므로, hue 의 범위로 고르면
조명이 바뀌어도 판정이 덜 흔들린다.

![5×5 칸 사진 조각과 두 규칙의 mask. 가운데 3×3 칸이 cube 이고 오른쪽 아래 한 칸은 그늘져 (100, 20, 15) 다. R ≥ 150 규칙은 그 칸을 놓쳐 8 칸을 고르고 중심이 (219.875, 239.875) 로 밀린다. 빨강의 몫 ≥ 0.6 규칙은 9 칸을 모두 골라 중심이 (220, 240) 이다](figures/color-mask.svg)

mask 에서 1 인 칸들의 $u$ 좌표 평균과 $v$ 좌표 평균으로 정한 점을 **centroid** 라고 하고, 이 점이 cube 윗면 가운데의 pixel 이다. 위 그림에서
그늘진 한 칸을 놓친 R 문턱 규칙의 centroid 는 0.125 칸 밀렸는데, 그늘이 cube 의 절반을 덮으면 이 밀림도 커진다.

색이 제각각인 컵이나 드라이버는 이름을 글로 주면 사진에서 그 물체를 찾아 주는 인식기로 찾는다. 이 인식기는 사진과 설명 글을 짝지은 많은
예로 미리 학습한 neural network 로, 이름에 맞는 물체마다 그 물체를 둘러싼 직사각형인 **bounding box** 와 0 ~ 1 사이의 점수를 낸다. 아무
이름이나 받을 수 있어서 open-vocabulary 인식기라고 부르고, YOLO-World(2024)가 그 예다. YOLO-World 논문은 학습에 쓰지 않은 LVIS dataset 으로
평가해 V100 GPU 에서 1초에 사진 52 장을 처리하며 35.4 AP 를 얻었다고 보고했다. AP 는 box 의 위치와 이름이 맞은 정도를 0 ~ 100 으로 매긴
detection 성능 지표다.

![이름으로 찾는 인식기. 사진과 이름 "red cube" 를 넣으면 bounding box (200, 220)–(240, 260) 과 점수 0.91 이 나오고, 두 꼭짓점의 평균인 가운데는 (220, 240) 이다](figures/detector-box.svg)

box 가운데 $(220, 240)$ 은 색 mask 의 centroid 와 같은 칸이고 출력 형식도 같으니, 첫 module 만 바꿔 끼우고 뒤 module 은 그대로 쓸 수
있다. 다만 인식기도 사진 속 칸 번호만 줄 뿐 거리는 주지 않고, box 는 늘 사진의 가로세로에
맞춘 직사각형이라 물체가 돌아간 각도도 주지 않는다.

**확인 문제.** 밝기가 반이 된 책상 pixel $(60, 55, 50)$ 은 "몫 ≥ 0.6" 규칙으로 cube 일까?

<details><summary>답 보기</summary>

1. 합: $60 + 55 + 50 = 165$
2. 빨강의 몫: $60 \div 165 \approx 0.36$
3. 0.6 보다 작으므로 cube 가 아니다. 밝은 책상의 몫 0.36 과 같아서, 밝기가 바뀌어도 판정이 바뀌지 않는다.

</details>

<details><summary><b>심화: centroid 계산</b></summary>

몫 규칙이 고른 아홉 칸은 $u = 219, 220, 221$ 과 $v = 239, 240, 241$ 이 만나는 칸이다. $u$ 값 아홉 개는 세 값이 세 번씩 나오므로 합이
$3 \times (219 + 220 + 221) = 1980$ 이고, 평균은 $1980 \div 9 = 220$ 이다. $v$ 도 같은 계산으로 240 이다.

R 문턱 규칙은 오른쪽 아래 칸 $(221, 241)$ 을 놓쳐 여덟 칸만 남긴다.

| 좌표 | 아홉 칸의 합 | 놓친 칸 | 여덟 칸의 합 | 평균 |
| --- | --- | --- | --- | --- |
| $u$ | 1980 | 221 | $1980 - 221 = 1759$ | $1759 \div 8 = 219.875$ |
| $v$ | 2160 | 241 | $2160 - 241 = 1919$ | $1919 \div 8 = 239.875$ |

mask 에서 1 인 칸이 $(10, 4)$, $(12, 4)$, $(10, 6)$, $(12, 6)$ 네 개라면 $u$ 평균은 $(10 + 12 + 10 + 12) \div 4 = 11$ 이고 $v$ 평균은
$(4 + 4 + 6 + 6) \div 4 = 5$ 라서 centroid 는 $(11, 5)$ 다. OpenCV 는 centroid 를 image moment 로 구하는데, mask 에 그대로 쓰면 위의
평균과 같은 값이 나온다.

</details>

## yaw 와 손가락 방향

손가락이 cube 의 마주 보는 두 옆면을 쥐려면 cube 가 위에서 볼 때 얼마나 돌아가 있는지도 알아야 한다. 수직축을 중심으로 돌아간 이 각도를
**yaw** 라고 한다. mask 에서 1 인 칸들을 감싸는 가장 작은 직사각형을 돌려 가며 찾으면 그 직사각형의 기울기가 yaw 다. 이 강의의 예시에서는
cube 의 yaw 를 10° 로 둔다.

정육면체 윗면은 정사각형이라 90° 돌려도 모양이 같아서, yaw 10° 인 cube 와 100°, −80° 인 cube 는 사진으로 가릴 수 없다. 그래서 yaw 는 90°
주기로 다루고, 오차를 잴 때도 이 주기를 쓴다. 인식이 88° 를 냈고 실제 yaw 가 2° 라면 88° 는 −2° 와 같은 자세라서, 오차는 86° 가 아니라 4° 다.

![위에서 본 cube. yaw 10°, 100°, 190° 인 정사각형은 모양이 똑같다. 손가락 방향의 후보 10°, 100°, −80°, −170° 가운데 지금 wrist_roll 0° 에 가장 가까운 10° 를 고른다](figures/yaw.svg)

손가락 방향은 손목을 비트는 관절 `wrist_roll` 이 맞춘다. yaw 10° 인 cube 를 쥘 수 있는 손가락 방향은 90° 간격의 10°, 100°, −80°, −170°
넷이다. 이 가운데 관절이 돌 수 있는 범위인 joint limit 안에 있고 지금 각도에 가장 가까운 후보를 고르면 손목을 가장 조금 돌린다. 지금
`wrist_roll` 이 0° 면 차이가 10° 인 10° 를 고르지만, 70° 면 같은 cube 라도 차이가 30° 인 100° 를 고른다. 답이 여럿일 때 지금 자세에 가까운
답을 고르는 규칙은 IK 에서도 쓴다.

**확인 문제.** cube 의 yaw 가 30° 이고 지금 `wrist_roll` 이 −50° 다. 고를 손가락 방향은?

<details><summary>답 보기</summary>

1. 후보: 30° 에서 90° 씩 더하고 빼면 30°, 120°, −60°, −150°
2. −50° 와의 차이: 80°, 170°, 10°, 100°
3. 차이가 가장 작은 −60° 를 고른다.

</details>

## depth 와 3D 위치

인식이 낸 pixel $(220, 240)$ 은 "사진 가운데에서 왼쪽으로 100 칸" 이라는 뜻일 뿐인데, gripper 를 cube 위 20 cm 에 세우거나 관절 각도를 구하는
뒤의 module 은 모두 실제 길이를 쓴다. 그래서 두 번째 module 은 pixel 을 base frame 에서 m 단위로 잰 3D 좌표로 바꾼다.
[Camera Geometry](../camera-geometry/README.md) 에서 본 것처럼 렌즈 중심에서 뻗은 반직선(ray) 위의 점은 거리와 상관없이 같은 pixel 에 찍히므로,
카메라 앞쪽 방향으로 잰 물체까지의 거리인 **depth** 를 알아야 점이 하나로 정해진다.

depth camera 가 pixel $(220, 240)$ 의 depth 를 0.5 m 로 쟀다고 하자. 높이 0.55 m 에서 내려다보는 카메라와 높이 0.05 m 인 cube 윗면 사이의
거리이므로 $0.55 - 0.05 = 0.5$ 로 맞는 값이다. pixel 에서 3D 점을 되찾는 계산을 back-projection 이라고 하며, 아래 세 단계로 한다.

| 단계 | $u$ 쪽 | $v$ 쪽 |
| --- | --- | --- |
| ① principal point 빼기 | $220 - 320 = -100$ | $240 - 240 = 0$ |
| ② $f = 500$ 으로 나누기 | $-100 \div 500 = -0.2$ | $0 \div 500 = 0$ |
| ③ depth 0.5 곱하기 | $-0.2 \times 0.5 = -0.1$ | $0 \times 0.5 = 0$ |

camera frame 은 렌즈 중심이 원점인 frame 으로, $X$ 축은 사진 오른쪽을 향하고 $Y$ 축은 사진 아래쪽을 향하며 $Z$ 축은 카메라 앞쪽을 향한다.
따라서 cube 윗면 가운데는 camera frame 에서 $(X, Y, Z) = (-0.1, 0, 0.5)$ 다. 세 단계를 식으로 쓰면 아래와 같다.

$$
X = \frac{(u - c_x)\,Z}{f}, \qquad Y = \frac{(v - c_y)\,Z}{f}
$$

이 좌표를 로봇이 쓰려면 base frame 으로 옮겨야 한다. 수직 아래를 보는 이 카메라에서 camera 의 $X$ 축은 base 의 $+x$ 방향이고, $Y$ 축은 $-y$
방향이며, $Z$ 축은 $-z$ 방향이다. 그래서 $(X, Y, Z)$ 를 $(X, -Y, -Z)$ 로 바꾸고 카메라가 달린 자리 $(0.3, 0, 0.55)$ 를 더한다.

| camera $(X, Y, Z)$ | 축 맞추기 $(X, -Y, -Z)$ | 카메라 자리 더하기 | base frame 좌표 |
| --- | --- | --- | --- |
| $(-0.1, 0, 0.5)$ | $(-0.1, 0, -0.5)$ | $+ (0.3, 0, 0.55)$ | $(0.20, 0, 0.05)$ |

높이 0.05 m 는 cube 윗면 높이와 맞고, cube 의 가운데는 여기서 반 변을 내린 $(0.20, 0, 0.025)$ 다. 카메라가 비스듬히 달린 경우에는
[Rigid Transforms](../transforms/README.md) 에서 본 homogeneous transform 을 곱한다. base 에서 본 카메라의 pose(위치와 방향)를 extrinsics 라고
하는데, 이 값을 로봇을 움직여 재는 방법은 [Hand-Eye Calibration](../hand-eye-calibration/README.md) 에서 다룬다.

> **오해** depth 가 틀리면 높이만 틀린다.
>
> **사실** back-projection 은 ② 에서 구한 방향에 depth 를 곱하므로, depth 를 0.5 대신 0.51 로 재면 가로 위치 $X$ 도 $-0.2 \times 0.51 = -0.102$ 로 2 mm 바뀐다.

**확인 문제.** pixel $(420, 290)$ 의 depth 가 0.5 m 다. base frame 좌표는?

<details><summary>답 보기</summary>

1. principal point 빼기: $(420 - 320, 290 - 240) = (100, 50)$
2. 500 으로 나누기: $(0.2, 0.1)$
3. depth 곱하기: $(0.1, 0.05)$ 라서 camera 좌표는 $(0.1, 0.05, 0.5)$
4. 축 맞추기: $(0.1, -0.05, -0.5)$
5. 카메라 자리 더하기: $(0.1 + 0.3, -0.05 + 0, -0.5 + 0.55) = (0.4, -0.05, 0.05)$

로봇 앞 40 cm, 오른쪽 5 cm 다.

</details>

<details><summary><b>심화: 다른 pixel 의 back-projection 과 homogeneous transform</b></summary>

cube 가 pixel $(220, 40)$ 에 찍히고 depth 가 0.5 m 인 경우를 같은 방법으로 계산한다.

| 단계 | $u$ 쪽 | $v$ 쪽 |
| --- | --- | --- |
| ① principal point 빼기 | $220 - 320 = -100$ | $40 - 240 = -200$ |
| ② $f = 500$ 으로 나누기 | $-0.2$ | $-0.4$ |
| ③ depth 0.5 곱하기 | $-0.1$ | $-0.2$ |

camera 좌표 $(-0.1, -0.2, 0.5)$ 를 $(X, -Y, -Z) = (-0.1, 0.2, -0.5)$ 로 바꾸고 $(0.3, 0, 0.55)$ 를 더하면 base 좌표는 $(0.20, 0.20, 0.05)$ 다.
$Y$ 가 음수(사진 위쪽)라서 base 에서는 로봇 왼쪽 20 cm 가 된다.

카메라가 기울어져 있으면 축을 맞추는 일이 rotation 행렬 곱셈이 되고, 그 rotation 과 카메라 자리(translation)를 4×4 행렬 하나에 담은 것이
homogeneous transform 이다. base 에서 본 카메라의 pose 를 $T_{bc}$ 라 하고 카메라에서 본 물체의 pose 를 $T_{co}$ 라 하면, base 에서 본 물체는
$T_{bo} = T_{bc}\,T_{co}$ 다. 이 강의의 카메라는 수직 아래를 보므로 $T_{bc}$ 의 rotation 이 위의 축 대응이고, translation 이 $(0.3, 0, 0.55)$ 다.

</details>

## 높이 가정과 ray

depth camera 가 없어도 cube 가 늘 책상 위에 놓인다는 사실을 쓰면 위치를 구할 수 있다. base frame 에서 pixel $(220, 240)$ 의 ray 는 1 m
내려갈 때마다 로봇 쪽으로 0.2 m 다가온다(back-projection ② 의 값). 이 ray 가 높이 0.05 m 평면에 닿으려면 $0.55 - 0.05 = 0.5$ m 내려가야 하므로
$x = 0.3 - 0.2 \times 0.5 = 0.20$ 이고, depth camera 로 구한 $(0.20, 0, 0.05)$ 와 같다.

![옆에서 본 장면. 높이 0.55 m 의 카메라에서 pixel (220, 240) 을 지나는 ray 위의 점들은 모두 같은 pixel 에 찍힌다. 그 ray 가 높이 0.05 m 평면과 만나는 점 (0.20, 0, 0.05) 이 cube 윗면 가운데다](figures/pixel-ray.svg)

이 방법은 cube 윗면이 늘 높이 0.05 m 에 있다고 가정한다. 누가 cube 를 두께 5 cm 짜리 책 위에 올려 두면 윗면은 실제로 $(0.20, 0, 0.10)$ 에
있어서 pixel $u \approx 209$ 에 찍힌다. pipeline 은 이 ray 가 높이 0.05 m 평면과 만나는 점을 계산해 cube 가 $(0.189, 0, 0.05)$ 에 있다고
낸다(계산은 아래 심화). 앞뒤 위치는 1.1 cm 틀리고 높이는 5 cm 틀려서, gripper 는 cube 윗면보다 5 cm 아래로 내려가려다 cube 를 위에서 누른다.
depth camera 는 이 pixel 의 depth 를 0.45 m 로 직접 재므로 이런 일이 없다.

![책 위에 올린 cube. 실제 윗면은 높이 0.10 m 인데 높이 0.05 m 를 가정하면 같은 ray 를 따라 더 내려간 (0.189, 0, 0.05) 를 cube 로 착각해서, 앞뒤 위치는 1.1 cm 틀리고 높이는 5 cm 틀린다](figures/height-assumption.svg)

<details><summary><b>심화: ray 와 평면의 교점과 높이 가정의 오차</b></summary>

ray 위의 점은 출발점에 방향을 $t$ 배 해서 더한 것이다.

$$
p(t) = (0.3,\ 0,\ 0.55) + t \times (-0.2,\ 0,\ -1)
$$

$t$ 는 ray 를 따라 얼마나 갔는지를 나타내는 0 이상의 수이고, 이 점의 높이는 $0.55 - t$ 다. 높이가 0.05 가 되려면 $0.55 - t = 0.05$ 에서
$t = 0.5$ 이고, 넣으면 $p = (0.3 - 0.1,\ 0,\ 0.55 - 0.5) = (0.20, 0, 0.05)$ 다.

pixel $(220, 40)$ 은 ② 의 값이 $(-0.2, -0.4)$ 라서 base frame 의 방향이 $(-0.2, 0.4, -1)$ 이다. 같은 $t = 0.5$ 에서
$p = (0.3 - 0.1,\ 0 + 0.2,\ 0.05) = (0.20, 0.20, 0.05)$ 로 back-projection 의 결과와 같다.

책 위에 올린 cube 의 윗면 $(0.20, 0, 0.10)$ 은 카메라까지의 depth 가 $0.55 - 0.10 = 0.45$ 라서 $u = 500 \times (-0.1) \div 0.45 + 320 \approx 209$
에 찍힌다. pipeline 이 이 pixel 을 높이 0.05 m 로 가정해 계산하면 아래와 같다.

| 단계 | 계산 | 결과 |
| --- | --- | --- |
| ② 방향 | $(209 - 320) \div 500$ | $-0.222$ |
| 가정한 depth | $0.55 - 0.05$ | $0.5$ |
| ③ $X$ | $-0.222 \times 0.5$ | $-0.111$ |
| base 의 $x$ | $0.3 - 0.111$ | $0.189$ |

depth camera 는 같은 pixel 의 depth 를 0.45 m 로 잰다. 그러면 ③ 이 $-0.222 \times 0.45 \approx -0.1$ 이 되고 base 의 $x$ 는
$0.3 - 0.1 = 0.2$ 이며, 높이는 $0.55 - 0.45 = 0.10$ 이라서 실제 위치와 맞는다.

</details>

## grasp pose 와 waypoint

cube 의 위치를 알았으니 gripper 를 어떤 자세로 가져가 쥘지 정한다. 물체를 쥐는 순간의 gripper pose 를 **grasp pose** 라고 한다. 이 강의는
gripper 를 수직 아래로 향한 채 cube 바로 위에서 내려가, 손가락 끝의 가운데가 cube 가운데 높이에 왔을 때 손가락을 닫는 **top-down grasp** 를
쓴다. 예시 cube 의 grasp pose 는 손끝 위치가 cube 가운데 $(0.20, 0, 0.025)$ 이고, 손가락이 닫히는 방향은 yaw 절에서 고른 10° 다.

손가락은 7 cm 까지 벌어지고 cube 는 5 cm 라서 양쪽에 $(7 - 5) \div 2 = 1$ cm 씩 여유가 있다. 손끝이 cube 가운데에서 1 cm 넘게 벗어나면
내려가는 손가락이 cube 모서리에 걸리므로, 이 1 cm 가 모든 module 이 나눠 쓰는 오차의 한도다.

grasp pose 로 팔을 바로 보내면 손이 비스듬히 다가가다 손가락으로 cube 를 밀어낼 수 있어서, cube 위에서 먼저 멈춘 뒤 수직으로 내려간다. 이처럼
손이 거쳐 가도록 정해 둔 자세를 **waypoint** 라고 한다. cube 를 $(0.30, 0, 0.025)$ 로 옮기는 waypoint 는 아래와 같고, gripper 는 모든
waypoint 에서 수직 아래를 향한다.

| 순서 | waypoint | 손끝 위치 | 정한 규칙 | gripper |
| --- | --- | --- | --- | --- |
| 1 | pre-grasp | $(0.20, 0, 0.225)$ | grasp 를 0.2 m 올린 자리 | 열림 |
| 2 | grasp | $(0.20, 0, 0.025)$ | cube 가운데 | 도착 후 닫음 |
| 3 | lift | $(0.20, 0, 0.225)$ | grasp 를 0.2 m 올린 자리 | 닫힘 |
| 4 | pre-place | $(0.30, 0, 0.225)$ | place 를 0.2 m 올린 자리 | 닫힘 |
| 5 | place | $(0.30, 0, 0.025)$ | cube 가 책상에 닿는 높이 | 도착 후 엶 |
| 6 | retreat | $(0.30, 0, 0.225)$ | place 를 0.2 m 올린 자리 | 열림 |

![옆에서 본 waypoint 여섯 개. cube 위 0.2 m 의 pre-grasp 에서 grasp 로 수직으로 내려가 쥐고, lift 로 올라가 pre-place 로 옮긴 뒤 place 로 내려가 놓고 retreat 로 물러난다](figures/waypoints.svg)

0.2 m 라는 높이와 놓을 자리는 사람이 정한 값이다. MoveIt Task Constructor 의 pick-and-place 튜토리얼은 이런 거리를 한 값으로 정하지 않고,
grasp 직전에 손이 다가가는 거리는 0.10 ~ 0.15 m 범위로 주고 쥔 뒤 들어 올리는 거리는 0.1 ~ 0.3 m 범위로 주어 그 안에서 경로를 찾는다.
둥근 물체나 옆으로 누운 물체에서 손가락을 어디에 댈지 정하는 방법은 [Grasp Planning](../grasping/README.md) 에서 다룬다.

**확인 문제.** 손가락이 최대 8 cm 벌어지는 gripper 로 한 변 6 cm 인 cube 를 top-down grasp 하면 한쪽 여유는 몇 cm 이고, 손끝 위치 오차가
1.5 cm 면 어떻게 될까?

<details><summary>답 보기</summary>

1. 한쪽 여유: $(8 - 6) \div 2 = 1$ cm
2. 손끝이 1.5 cm 벗어나면 한쪽 손가락이 cube 안쪽으로 $1.5 - 1 = 0.5$ cm 들어온 자리로 내려가므로 cube 윗면 모서리에 걸린다.

</details>

## IK 와 답 고르기

waypoint 는 손끝의 pose 인데, 로봇이 motor 로 직접 정할 수 있는 것은 관절이 돌아간 각도인 **joint angle** 뿐이다. 손끝 pose 에서 joint angle
을 거꾸로 구하는 계산이 [Inverse Kinematics](../inverse-kinematics/README.md) 에서 본 IK 이고, 네 번째 module 은 waypoint 마다 IK 를 푼다.
이 강의는 손으로 계산할 수 있도록 SO-101 처럼 관절이 다섯 개인 팔을 단순하게 바꾼 모델을 쓴다. 팔 전체를 좌우로 돌리는 `shoulder_pan` 과
손가락 방향을 맞추는 `wrist_roll` 을 빼면, 어깨(base 원점 위 0.1 m)에서 길이 0.2 m 인 위팔(`shoulder_lift`, 각도 $\theta_1$), 길이 0.2 m 인
아래팔(`elbow_flex`, $\theta_2$), 손끝까지 0.075 m 인 손(`wrist_flex`, $\theta_3$)이 옆에서 본 한 평면 안에서 돈다. $\theta_1$ 은 수평을
기준으로 잰 각도이고, $\theta_2$ 와 $\theta_3$ 은 바로 앞 부품의 방향을 기준으로 잰 각도다. gripper 가 수직 아래를 향하려면
$\theta_1 + \theta_2 + \theta_3 = -90°$ 여야 해서 손목은 손끝 바로 위 0.075 m 에 놓이고, 위팔과 아래팔로 손목을 그 자리에 보내는 일은 IK
강의의 2 관절 팔 문제가 된다.

IK 를 풀기 전에 팔이 닿는지부터 보는데, 위팔과 아래팔을 일직선으로 펴도 어깨에서 손목까지 $0.2 + 0.2 = 0.4$ m 라서 그보다 먼 자리는 답이
없다. pre-grasp 의 손목(높이 0.3 m)은 어깨에서 앞으로 0.2 m 이고 위로도 0.2 m 라서, 거리가 $\sqrt{0.2^2 + 0.2^2} \approx 0.283$ m 로 닿는다.
하지만 놓을 자리를 $(0.40, 0, 0.025)$ 로 옮기면 pre-place 의 손목까지 거리가 $\sqrt{0.4^2 + 0.2^2} \approx 0.447$ m 라서 IK module 이 실패를
알린다.

닿는 waypoint 는 IK 강의에서 본 코사인 법칙으로 풀어 아래 joint angle 을 얻는다(손계산은 아래 심화).

| waypoint | 손목 (어깨 기준 앞, 위) | `shoulder_pan` | $\theta_1$ | $\theta_2$ | $\theta_3$ | `wrist_roll` |
| --- | --- | --- | --- | --- | --- | --- |
| pre-grasp | $(0.2, 0.2)$ | 0° | 90° | −90° | −90° | 10° |
| grasp | $(0.2, 0)$ | 0° | 60° | −120° | −30° | 10° |

![단순화한 팔을 옆에서 본 두 자세. pre-grasp 에서는 위팔이 수직(90°)이고 아래팔이 수평이며 손목이 −90° 라서 손끝이 (0.20, 0.225) 에 온다. grasp 에서는 위팔 60°, 팔꿈치 −120°, 손목 −30° 로 손끝이 (0.20, 0.025) 에 온다. 두 자세 모두 gripper 가 수직 아래를 향한다](figures/ik-arm.svg)

같은 손목 자리에 닿는 답은 하나가 아니어서, pre-grasp 에서도 위팔이 수평으로 뻗고 아래팔이 수직으로 서는 elbow-down 답
$(\theta_1, \theta_2) = (0°, 90°)$ 가 손목을 같은 자리에 보낸다. waypoint 마다 다른 답을 고르면 그 사이에서 팔이 크게 뒤집히므로, IK module 은
joint limit 안의 답 가운데 앞 waypoint 의 joint angle 에 가까운 답을 고른다. MoveIt Task Constructor 의 `ComputeIK` stage 는 pose 하나에
구할 IK 답의 수 `max_ik_solutions` 의 기본값이 1 이지만, 튜토리얼은 grasp 에서 답을 8 개까지 구한다. 서로 비슷한 답을 버리는 기준
`min_solution_distance` 도 기본값 0.1 대신 1.0 으로 둔다.

**확인 문제.** 어깨에서 본 손목이 앞으로 0.3 m, 위로 0.4 m 다. 이 팔이 닿을까?

<details><summary>답 보기</summary>

1. 거리: $\sqrt{0.3^2 + 0.4^2} = \sqrt{0.09 + 0.16} = \sqrt{0.25} = 0.5$ m
2. 팔 길이 합 0.4 m 보다 멀어서 닿지 않는다. IK module 은 실패를 알리고, 사람이 놓을 자리나 waypoint 높이를 다시 정해야 한다.

</details>

<details><summary><b>심화: pre-grasp 와 grasp 의 IK 손계산</b></summary>

어깨에서 손목 목표까지의 거리를 $d$ 라 하고 위팔과 아래팔의 길이를 $L_1 = L_2 = 0.2$ 라 하면, IK 강의에서 본 코사인 법칙은 아래와 같다.

$$
\cos\theta_2 = \frac{d^2 - L_1^2 - L_2^2}{2 L_1 L_2}
$$

거리의 제곱에서 두 팔 길이의 제곱을 빼고 두 길이 곱의 2 배로 나누면 팔꿈치 각도의 cos 값이 된다는 식이다. 어깨에서 손목 목표를 바라보는
방향을 $\varphi$ 라 하고, $\theta_1 = 0°$ 로 둔 팔에서 어깨가 손목을 바라보는 방향을 $\beta$ 라 하면 $\theta_1 = \varphi - \beta$ 다.

| 단계 | pre-grasp (손목 $(0.2, 0.2)$, $d^2 = 0.08$) | grasp (손목 $(0.2, 0)$, $d^2 = 0.04$) |
| --- | --- | --- |
| $\cos\theta_2$ | $(0.08 - 0.04 - 0.04) \div 0.08 = 0$ | $(0.04 - 0.04 - 0.04) \div 0.08 = -0.5$ |
| $\theta_2$ (elbow-up) | $-90°$ | $-120°$ |
| $\varphi$ | $45°$ | $0°$ |
| $\theta_1 = 0°$ 일 때 손목 | $0.2 \times (1 + \cos(-90°), \sin(-90°)) = (0.2, -0.2)$ | $0.2 \times (1 + \cos(-120°), \sin(-120°)) = (0.1, -0.173)$ |
| $\beta$ | $-45°$ | $-60°$ |
| $\theta_1 = \varphi - \beta$ | $45° - (-45°) = 90°$ | $0° - (-60°) = 60°$ |
| 아래팔 방향 $\theta_1 + \theta_2$ | $0°$ | $-60°$ |
| $\theta_3 = -90° - (\theta_1 + \theta_2)$ | $-90°$ | $-30°$ |

forward kinematics(FK)로 검산한다. 옆에서 본 위치를 (앞뒤, 높이) 로 적으면 어깨는 $(0, 0.1)$ 이다. pre-grasp 에서는 위팔이 수직이라 팔꿈치가
$(0, 0.3)$ 에 있고, 아래팔이 수평이라 손목이 $(0.2, 0.3)$ 에 있다. grasp 에서는 팔꿈치가 어깨에서 $0.2 \times (\cos 60°, \sin 60°) = (0.1, 0.173)$
떨어져 있고, 아래팔이 $0.2 \times (\cos(-60°), \sin(-60°)) = (0.1, -0.173)$ 을 더해 손목이 어깨에서 $(0.2, 0)$ 에 온다.

pixel $(220, 40)$ 에 찍힌 cube(손끝 $(0.20, 0.20, 0.025)$)는 위에서 보면 로봇 앞으로 0.2 m 이고 왼쪽으로도 0.2 m 라서 `shoulder_pan` 이 45°
이고, 그 방향의 수평 거리는 $\sqrt{0.08} \approx 0.283$ m 다. 손목이 어깨와 같은 높이라 $d^2 = 0.08$ 이고 $\cos\theta_2 = 0$ 이라서 elbow-up
답은 $\theta_2 = -90°$ 다. $\varphi = 0°$ 이고 $\beta = -45°$ 라서 $\theta_1 = 45°$ 이며, 아래팔 방향이 $-45°$ 이므로
$\theta_3 = -90° - (-45°) = -45°$ 다.

</details>

## waypoint 사이의 경로

joint angle 을 한순간에 바꾸면 motor 가 갑자기 큰 힘을 내서 팔이 튀므로, 다섯 번째 module 은 두 waypoint 사이를 시간에 따라 조금씩 옮겨
가는 목표의 목록인 **trajectory** 를 만든다. 이 강의는 출발과 도착에서 속도와 가속도가 0 인 minimum-jerk 곡선으로 pre-grasp 에서 grasp 까지
$T = 2$ 초 동안 잇는다(아래 심화). 관절 한계 안에서 시간을 붙이는 여러 방법은 [Trajectory Generation](../trajectory-generation/README.md) 에서
다룬다.

joint angle 이 부드럽게 바뀌어도 손끝은 곧게 움직이지 않는다. 손끝 위치는 joint angle 의 cos·sin 으로 계산하므로, 관절마다 일정한 진행률로
움직여도 손끝은 휘어진 길을 그린다. 1 초의 자세 $(75°, -105°, -60°)$ 를 FK 로 계산하면 gripper 는 $75° - 105° - 60° = -90°$ 로 수직이지만
손끝이 앞으로 밀려 있다.

| 시각 | 손끝 앞뒤 위치 $x$ (m) | 손끝 높이 (m) | 곧은 경로 $x = 0.2$ 와의 차이 |
| --- | --- | --- | --- |
| 0 s | 0.200 | 0.225 | 0 |
| 1 s | 0.225 | 0.118 | 2.5 cm |
| 손끝이 cube 윗면 높이 0.05 m 를 지날 때 | 0.212 | 0.050 | 1.2 cm |
| 2 s | 0.200 | 0.025 | 0 |

손끝은 cube 윗면 높이를 지날 때 1.2 cm 벗어나 있어서, 여유 1 cm 를 넘어 손가락이 모서리에 걸린다. 그래서 cube 근처에서는 손끝이 지날 곧은
선을 잘게 나누고 나눈 점마다 IK 를 다시 푸는데, 이렇게 손끝을 곧은 선으로 움직이는 경로를 Cartesian path 라고 한다. 아래 그림의 초록 선이 그
경로다.

![pre-grasp 에서 grasp 로 갈 때의 손끝 경로. joint angle 을 minimum-jerk 로 이으면 손끝이 앞으로 휘어 1 초에 2.5 cm 벗어나고, cube 윗면 높이에서 1.2 cm 벗어난다. 손끝 높이를 minimum-jerk 로 나눠 매 점 IK 를 풀면 수직으로 내려간다](figures/joint-path.svg)

책상 위에 다른 물체가 있으면 pre-grasp 까지 가는 길도 그 물체를 피해야 해서, MoveIt Task Constructor 튜토리얼은 구간마다 다른 planner 를 쓴다.

| planner | 하는 일 | 튜토리얼에서 맡은 구간 |
| --- | --- | --- |
| `PipelinePlanner` | MoveIt 의 planning pipeline(보통 OMPL)으로 충돌 없는 길을 찾는다 | 지금 자세 → pre-grasp, lift → 놓을 자리 |
| `CartesianPath` | 손끝을 곧은 선으로 옮기며 0.01 m 간격으로 IK 를 푼다 | approach, lift, retreat |
| `JointInterpolationPlanner` | 시작과 끝 joint angle 사이를 단순히 보간한다 | 손을 열고 닫는 동작, "ready" 자세로 돌아가는 동작 |

OMPL 같은 sampling planner 가 충돌 없는 길을 찾는 방식은 [Motion Planning](../motion-planning/README.md) 에서 다룬다.

**확인 문제.** 손끝 높이를 0.225 m 에서 0.025 m 로 2 초 동안 minimum-jerk 로 옮긴다. 1 초(진행률 0.5)의 목표 높이는?

<details><summary>답 보기</summary>

1. 움직일 양: $0.025 - 0.225 = -0.2$ m
2. 1 초의 높이: $0.225 + (-0.2) \times 0.5 = 0.125$ m

손끝 위치 $(0.20, 0, 0.125)$ 에서 IK 를 풀면 이 시각의 joint angle 이 나오고, 이렇게 나눈 점마다 IK 를 풀면 손끝은 수직으로 내려간다.

</details>

<details><summary><b>심화: minimum-jerk trajectory 의 숫자</b></summary>

출발 joint angle $q_0$ 에서 도착 $q_f$ 로 시간 $T$ 동안 가는 minimum-jerk trajectory 는 아래 식이다.

$$
q(t) = q_0 + (q_f - q_0)\,s(\tau), \qquad s(\tau) = 10\tau^3 - 15\tau^4 + 6\tau^5, \qquad \tau = t / T
$$

$\tau$ 는 지난 시간을 $T$ 로 나눈 비율이고 $s(\tau)$ 는 그 비율에서의 진행률이다. jerk 는 가속도가 1 초에 변하는 양인데, 이 곡선은 이동하는
동안 jerk 의 제곱을 내내 더한 값을 가장 작게 만든다. pre-grasp $(90°, -90°, -90°)$ 에서 grasp $(60°, -120°, -30°)$ 로 $T = 2$ 초 동안
옮기면 `shoulder_lift` 와 `elbow_flex` 는 각각 −30° 움직이고 `wrist_flex` 는 +60° 움직인다.

| 시각 $t$ | $\tau$ | 진행률 $s$ | `shoulder_lift` | `elbow_flex` | `wrist_flex` |
| --- | --- | --- | --- | --- | --- |
| 0 s | 0 | 0 | 90° | −90° | −90° |
| 0.5 s | 0.25 | 0.104 | 86.9° | −93.1° | −83.8° |
| 1 s | 0.5 | 0.5 | 75° | −105° | −60° |
| 1.5 s | 0.75 | 0.896 | 63.1° | −116.9° | −36.2° |
| 2 s | 1 | 1 | 60° | −120° | −30° |

1 초의 `shoulder_lift` 는 $90° + (-30°) \times 0.5 = 75°$ 이고, 0.5 초의 `wrist_flex` 는 $-90° + 60° \times 0.104 \approx -83.8°$ 다. 처음과 끝의
0.5 초 동안은 전체의 10% 남짓만 움직이고 가운데에서 빨리 움직인다. 1 초의 손끝을 FK 로 구하면 팔꿈치는 어깨에서
$0.2 \times (\cos 75°, \sin 75°) = (0.052, 0.193)$ 떨어져 있고, 아래팔은 $-30°$ 방향으로 $(0.173, -0.1)$ 을 더한다. 손이 아래로 0.075 m 를 더
내려가므로 손끝은 (앞뒤, 높이) $= (0.225, 0.118)$ 이다. 손끝이 높이 0.05 m 를 지나는 시각은 같은 방법으로 계산하면 약 1.42 초이고, 그때
$x \approx 0.212$ 다.

</details>

## 실행과 단계별 확인

여섯 번째 module 은 trajectory 의 목표 각도를 시간에 맞춰 관절의 controller 에 보내고, grasp 에 도착하면 손가락을 닫아 누르는 힘이 충분해진
뒤 들어 올린다. cube 가 미끄러지지 않으려면 마찰 힘이 무게를 버텨야 한다. 마찰 계수 $\mu$ 는 누르는 힘에 비해 마찰 힘이 얼마나 클 수 있는지를
나타내는 값이다. cube 가 0.1 kg 이면 무게는 $0.1 \times 9.81 = 0.981$ N 이고, 두 손가락이 각각 $F$ 로 누를 때 $2\mu F \ge 0.981$ 이어야
한다. 그래서 $\mu = 1$ 이면 $F \ge 0.49$ N 이어야 하고 $\mu = 0.6$ 이면 $F \ge 0.82$ N 이어야 한다. 가속과 안전율까지 넣은 grip force 계산은
Grasp Planning 에서 다룬다.

실행 중에도 module 이 끝날 때마다 출력을 확인해 두면, 확인이 실패했을 때 어느 module 을 볼지 바로 정해진다.

| 확인하는 때 | 확인하는 값 | 실패하면 의심할 module |
| --- | --- | --- |
| 인식 직후 | mask 의 칸 수가 cube 크기에 맞는가 | 인식 |
| 3D 위치 직후 | 계산한 높이가 0.05 m 근처인가 | 3D 위치, calibration |
| IK 직후 | 모든 waypoint 의 답이 joint limit 안에 있는가 | 잡기 자세, IK |
| grasp 직후 | 손가락이 다 닫히지 않고 cube 폭에서 멈췄는가 | 인식, 3D 위치, 경로(빈손으로 닫힘) |
| lift 직후 | cube 가 손가락과 함께 올라왔는가 | 실행(미끄러짐) |

grasp 직후 손가락이 0 cm 까지 다 닫혔다면 손가락 사이에 아무것도 없다는 뜻이고, 5 cm 근처에서 멈췄다면 cube 를 쥐었다는 뜻이다.

**확인 문제.** grasp 직후 손가락 사이 간격이 0 cm 였다. 어느 module 부터 다시 볼까?

<details><summary>답 보기</summary>

손가락이 빈손으로 닫혔으므로 손끝이 cube 가운데에 가지 못했다. 위치를 낸 인식·3D 위치 module 이나 calibration 부터 확인하고, 그 값이 맞으면
cube 근처에서 손끝이 휘지 않았는지 경로를 본다.

</details>

## MoveIt Task Constructor 의 pick-and-place

ROS 2 에서는 이 module 들을 MoveIt 2 의 MoveIt Task Constructor(MTC)로 묶을 수 있다. MTC 는 작업을 **stage** 라는 작은 계획 문제로 나누고,
stage 를 차례로 또는 나란히 담는 container 로 묶어 task 하나를 만든다(Görner 외, ICRA 2019). 아래 그림은 MoveIt 2 튜토리얼에서 Panda 팔이
높이 0.1 m, 반지름 0.02 m 인 원기둥을 옮기는 task 의 stage 를 순서대로 보여 준다.

![MoveIt Task Constructor 튜토리얼의 pick-and-place task. current 다음 open hand, move to pick(Connect, OMPL), pick object 안의 approach object(Cartesian 0.10 ~ 0.15 m), grasp pose IK(GenerateGraspPose, π/12 간격, IK 답 최대 8 개), close hand, attach object, lift object(0.1 ~ 0.3 m), move to place, place object 안의 place pose IK, open hand, detach object, retreat, 마지막 return home 순서다](figures/mtc-stages.svg)

stage 는 결과를 주고받는 방식에 따라 세 종류로 나뉜다.

| 종류 | 하는 일 | 튜토리얼의 stage |
| --- | --- | --- |
| generator | 이웃 stage 와 상관없이 상태를 만들어 앞뒤로 넘긴다 | `current`, `generate grasp pose`, `generate place pose` |
| propagator | 한쪽 이웃의 결과를 받아 계산하고 반대쪽으로 넘긴다 | `approach object`, `lift object`, `retreat`, `close hand` |
| connector | 앞뒤 stage 의 결과 사이를 잇는다 | `move to pick`, `move to place` |

`generate grasp pose` 는 물체 축을 중심으로 $\pi / 12$(15°)마다 grasp pose 후보를 만들어 한 바퀴에 $2\pi \div (\pi / 12) = 24$ 개를 내고,
이를 감싼 wrapper stage `grasp pose IK` 가 후보마다 IK 를 풀어 답이 없는 후보를 버린다. 이 강의에서 손으로 한 손가락 방향 고르기와 IK 답
고르기를 MTC 에서는 이 두 stage 가 맡는다. `approach object` 는 그 grasp 에서 거꾸로 손의 z 방향으로 0.10 ~ 0.15 m 물러난 자리까지
Cartesian path 를 구하는데, 그 자리가 이 강의의 pre-grasp 다. 마지막으로 `move to pick` 이 지금 자세와 그 pre-grasp 사이를 OMPL 로 잇는다.

로봇은 그림의 위에서 아래 순서로 움직이지만, 계산은 grasp pose 에서 시작해 앞뒤로 넓혀 간다. pre-grasp 를 먼저 정하고 내려가는 길을 찾으면 그
길이 grasp 에 닿는다는 보장이 없기 때문이다.

`allow collision (hand,object)` 와 `attach object` 는 팔을 움직이지 않고, MoveIt 이 충돌 검사에 쓰는 장면인 planning scene 을 고친다. 쥐는
동안에는 손가락과 물체의 충돌을 허용하고, 쥔 뒤에는 물체를 손에 붙여 이후의 경로가 물체까지 포함해 충돌을 검사하게 한다.

튜토리얼은 `task.plan(5)` 로 처음부터 끝까지 이어진 해를 최대 5 개 찾은 뒤 첫 번째 해를 실행한다. RViz 의 MTC 화면에서 stage 를 고르면 그
stage 의 성공한 해와 실패한 해가 따로 나열되므로, `grasp pose IK` 에서 후보가 모두 실패했는지 `move to pick` 에서 길을 못 찾았는지를 실행하기
전에 stage 단위로 가려낼 수 있다.

**확인 문제.** `generate grasp pose` 의 간격을 $\pi / 12$ 에서 $\pi / 6$ 으로 바꾸면 한 바퀴의 후보 수는? `grasp pose IK` 가 `max_ik_solutions` 를
8 로 두면 IK 답은 최대 몇 개까지 나올 수 있을까?

<details><summary>답 보기</summary>

1. 후보 수: $2\pi \div (\pi / 6) = 12$ 개
2. IK 답: 후보 하나에 최대 8 개라서 $12 \times 8 = 96$ 개까지 나올 수 있다. 실제로는 닿지 않거나 충돌하는 후보가 빠져서 더 적다.

</details>

## 오차의 누적

손끝 위치에는 여러 module 의 오차가 차례로 섞여 든다. 인식이 pixel 을 틀리면 3D 위치가 틀리고, IK 는 그 틀린 자리의 joint angle 을 정확히
풀어 버린다. 뒤 module 은 앞 module 의 오차를 알 방법이 없어서 오차는 고쳐지지 않고 그대로 넘어가 더해진다.

| 출처 | 오차가 생기는 이유 | 손끝 위치 오차 |
| --- | --- | --- |
| 인식 | centroid 가 2 pixel 밀림. depth 0.5 m 에서 1 pixel 은 $0.5 \div 500 = 0.001$ m | 2 mm |
| calibration | 카메라 자리를 3 mm 틀리게 잼 | 3 mm |
| 실행 | motor 가 목표 각도를 조금 못 따라감 | 3 mm |
| 합 | 같은 방향으로 겹치는 가장 나쁜 경우 | 8 mm |

합 8 mm 는 여유 10 mm 안이라 쥘 수 있다. 오차의 방향이 서로 달라 일부가 지워지기도 하지만, 실패를 막으려면 모두 같은 방향으로 겹치는 가장
나쁜 경우를 기준으로 본다. 여유를 module 마다 나눠 주는 이 계산을 **error budget** 이라고 한다.

![위는 7 cm 로 벌린 손가락과 5 cm cube 사이의 양쪽 여유 1 cm 다. 아래는 오차를 쌓은 막대로, 인식 2 mm, calibration 3 mm, 실행 3 mm 의 합 8 mm 는 여유 10 mm 안이지만 카메라가 2° 기울면 17 mm 가 더해져 25 mm 로 여유를 넘는다](figures/error-budget.svg)

누가 카메라를 건드려 2° 기울었는데 pipeline 이 처음 잰 extrinsics 를 그대로 쓰면, 0.5 m 앞의 cube 는 반지름 0.5 m 인 원을 따라 2° 옆으로
옮겨 간 자리로 보인다. 위치 오차는 반지름 50 cm 인 원의 둘레 $2 \times 3.14 \times 50 = 314$ cm 의 $2 / 360$ 이라서
$314 \times 2 \div 360 \approx 1.7$ cm 다. 인식이 pixel 을 정확히 찾았어도 합이 $8 + 17 = 25$ mm 가 되어 여유를 넘는다. rotation 오차는
물체까지의 거리를 곱한 만큼 위치 오차가 되므로, 카메라를 옮기거나 건드리면 calibration 을 다시 해야 한다.

> **오해** 오차가 큰 module 하나만 고치면 된다.
>
> **사실** 위 표의 오차는 하나하나 3 mm 이하지만 합은 8 mm 다. 오차는 더해지므로 module 마다 작은 오차만 내도 합이 여유를 넘을 수 있다.

**확인 문제.** 카메라가 1° 기울었다. 0.5 m 떨어진 cube 의 위치는 약 몇 cm 틀릴까?

<details><summary>답 보기</summary>

1. 반지름 50 cm 인 원의 둘레: $2 \times 3.14 \times 50 = 314$ cm
2. 1° 는 한 바퀴의 $1 / 360$ 이라서 $314 \div 360 \approx 0.87$ cm

2° 일 때의 절반이다. $0.5 \times \tan 1° \approx 0.0087$ m 로 계산해도 같다.

</details>

## 성공률과 실패 분류

한 번 성공한 것으로는 pipeline 을 얼마나 믿을지 알 수 없어서, cube 를 무작위 위치와 yaw 에 놓고 여러 번 시도해 성공한 비율인 성공률을 잰다.
"cube 가 5 cm 넘게 들렸다가 놓을 자리 2 cm 안에 놓였다" 처럼 성공 기준도 미리 숫자로 정해 둔다. 예를 들어 50 번 시도해 41 번 성공했다면
성공률은 $41 \div 50 = 82\%$ 다. 실패 9 번의 원인을 단계별로 확인한 값으로 나눈 결과가 아래 표와 같다고 하자.

| 실패 원인 | 횟수 | 50 번 가운데 비율 |
| --- | --- | --- |
| 인식 (위치나 yaw 를 틀림) | 4 | 8% |
| IK (닿지 않거나 joint limit 밖) | 2 | 4% |
| grasp (쥐었다가 미끄러짐) | 2 | 4% |
| 충돌 (팔이 cube 를 치거나 밀어냄) | 1 | 2% |
| 합 | 9 | 18% |

![50 번 시도한 예의 결과. 성공은 41 번(82%)이고, 실패 9 번은 인식 4 번, IK 2 번, grasp 2 번, 충돌 1 번이다. 인식 실패가 가장 많으므로 인식 module 부터 고친다](figures/failure-bars.svg)

이 예에서는 인식 실패가 4 번으로 가장 많으니 색 문턱이나 조명부터 손본다. 그 4 번이 모두 성공으로 바뀌면 다른 module 은 건드리지 않고도
성공률이 $45 \div 50 = 90\%$ 가 된다.

2015 년 Amazon Picking Challenge 에서는 각 팀이 20 분 동안 선반 칸 12 곳에서 정해진 물건 12 개를 꺼내야 했다. 26 팀이 꺼낸 정답 물건은
모두 합쳐 36 개였고, 절반쯤의 팀은 0 점이었다. 우승한 RBO 팀(TU Berlin)은 12 개 가운데 10 개를 꺼냈다. 대회 뒤 설문에서 팀들이 여섯 항목을
어려운 순서로 매긴 점수(높을수록 어려움)의 평균은 인식이 4.52 로 가장 높았고, grasping 이 4.36, planning and control 이 3.75 였다.

**확인 문제.** 40 번 시도에 30 번 성공했고, 실패 10 번 가운데 grasp 실패가 6 번이다. 성공률은? grasp 실패를 모두 고치면 성공률은?

<details><summary>답 보기</summary>

1. 지금 성공률: $30 \div 40 = 75\%$
2. grasp 실패 6 번이 성공으로 바뀌면 성공 $30 + 6 = 36$ 번이라서 $36 \div 40 = 90\%$

</details>

## 모듈 파이프라인과 end-to-end

모듈 파이프라인은 중간 값을 하나씩 확인할 수 있어서 고장 난 곳을 찾기 쉽고, 사람이 시연한 기록 없이 calibration 과 규칙 몇 개만으로 첫
시도부터 동작한다.

다만 모든 module 에 사람이 이 cube, 이 카메라, 이 조명에 맞춰 정한 숫자가 들어 있다. 빨강의 몫 문턱 0.6, extrinsics 와 윗면 높이 0.05 m,
waypoint 높이 0.2 m, waypoint 사이 시간 2 초, 손가락 닫는 힘이 모두 그렇다. cube 를 지름 4 cm, 높이 10 cm 인 원기둥 컵으로 바꾸면 인식
문턱(컵의 색), 높이 가정(윗면 0.10 m), grasp 높이(컵 가운데 0.05 m), yaw 규칙(원기둥은 어느 방향으로 쥐어도 같음), 손가락 힘이 모두 바뀐다.
물체와 손이 여러 곳에서 계속 닿으며 힘을 주고받는 작업은 규칙으로 적기도 어렵다. 구멍에 꼭 맞는 막대를 끼우려면 걸릴 때마다 어느 쪽으로
얼마나 비틀지 정해야 하고, 수건은 놓인 모양을 3D 좌표 몇 개로 적을 수조차 없다.

[Behavior Cloning](../behavior-cloning/README.md) 에서 본 end-to-end 는 반대 방법이다. 사람이 로봇을 조종해 일을 해 보이는 시연에서 (카메라
사진, 그때의 관절 각도) 짝을 모아 neural network 하나를 학습해, 사진을 넣으면 관절 명령이 바로 나오게 한다. 상황을 받아 행동을 내는 이 규칙을
policy 라고 하고, 입력 끝에서 출력 끝까지 중간 module 없이 한 번에 배워서 end-to-end 라고 부른다. Levine 등(2016)은 parameter 92,000 개인
CNN 이 카메라 영상에서 motor torque 까지 바로 내도록 학습해, 병에 뚜껑을 돌려 끼우는 것처럼 시각과 제어가 맞물린 작업을 실제 로봇에서 해냈다.

![위는 모듈 파이프라인. 인식, 3D 위치, 잡기 자세, IK, 경로, 실행 사이마다 확인할 수 있는 중간 값이 있고, 필요한 것은 calibration 과 사람이 정한 규칙이다. 아래는 end-to-end. 사진과 관절 각도를 network 하나에 넣어 관절 각도를 바로 내고, 필요한 것은 시연 데이터다](figures/modular-vs-e2e.svg)

| 기준 | 모듈 파이프라인 | end-to-end policy |
| --- | --- | --- |
| 필요한 것 | calibration, 사람이 짠 규칙 | 시연 데이터 |
| 고장 진단 | module 별 중간 값으로 원인을 찾는다 | 중간 값이 없어 영상으로 실패 모습을 나눈다 |
| 물체가 바뀌면 | 여러 module 의 규칙을 다시 짠다 | 새 물체의 시연을 모아 다시 학습한다 |
| 접촉이 복잡한 작업 | 규칙으로 적기 어렵다 | 시연에 담긴 대로 배울 수 있다 |
| 실패하기 쉬운 때 | 높이·색·calibration 가정이 틀릴 때 | 시연 범위 밖의 위치·물체·조명 |

물체와 환경이 정해져 있고 위치가 정확해야 하며 실패 원인을 설명해야 하는 공장 라인에는 모듈 파이프라인이 맞다. 반면 물체가 자주 바뀌거나
접촉이 복잡해 규칙으로 적기 어렵고 시연을 모을 수 있는 작업에는 end-to-end 가 맞다. 둘을 섞기도 하는데, 이름으로 찾는 인식기로 물체 위치를
구하고 손을 그 근처까지 IK 와 motion planning 으로 보낸 뒤 마지막에 쥐는 동작만 학습한 policy 에 맡기는 식이다.

**확인 문제.** (가) 컨베이어 위를 지나는 같은 모양의 상자를 하루 종일 옮기기, (나) 매번 모양이 다른 옷 개기. 각각 어느 방식이 맞을까?

<details><summary>답 보기</summary>

(가)는 물체와 환경이 정해져 있고 같은 동작을 반복하므로 모듈 파이프라인이 맞다. (나)는 옷의 모양을 3D 좌표 몇 개로 적을 수 없고 접촉이
복잡해 규칙을 짜기 어려우므로, 시연에서 배우는 end-to-end policy 가 맞다.

</details>

## 정리

- classical pick-and-place 는 인식 → 3D 위치 → 잡기 자세 → IK → 경로 → 실행의 여섯 module 을 사람이 짠 규칙으로 잇는다. pixel $(220, 240)$
  과 depth 0.5 m 를 back-projection 하면 base 좌표 $(0.20, 0, 0.05)$ 가 나오고, depth 대신 높이를 가정하면 가정이 틀린 만큼 가로 위치와
  높이가 함께 틀린다
- joint angle 만 보간하면 손끝이 휘어 cube 근처에서 1.2 cm 벗어나므로 grasp 근처는 Cartesian path 로 움직인다. MoveIt Task Constructor 에서는
  generator 가 grasp pose 후보를 만들고, propagator 가 approach·lift 를 Cartesian path 로 구하고, connector 가 그 사이를 OMPL 로 잇는다
- module 의 오차는 고쳐지지 않고 더해지므로 인식 2 mm, calibration 3 mm, 실행 3 mm 가 여유 1 cm 를 나눠 쓴다. 카메라가 2° 기울면 0.5 m 앞의
  cube 위치가 1.7 cm 틀린다. 실패를 module 별로 세면 고칠 곳이 정해지지만, 물체가 바뀌면 규칙을 손으로 다시 짜야 한다

이 강의의 grasp 는 위에서 내려가 마주 보는 두 면을 쥐는 규칙 하나였다. 둥근 물체나 처음 보는 물체에서 손가락을 어디에 어느 방향으로 대야
미끄러지지 않는지 계산하는 방법은 [Grasp Planning](../grasping/README.md) 에서 다루고, 사람이 짠 규칙 없이 시연에서 배우는 방법은
[Behavior Cloning](../behavior-cloning/README.md) 에서 다룬다.

## 참고 자료

- Russ Tedrake, [Robotic Manipulation — Ch. 3 Basic Pick and Place](https://manipulation.csail.mit.edu/pick.html) — 같은 문제를 frame 변환,
  grasp·pre-grasp pose, IK, trajectory 순으로 푸는 MIT 강의 교재
- MoveIt 2, [Pick and Place with MoveIt Task Constructor](https://moveit.picknik.ai/main/doc/tutorials/pick_and_place_with_moveit_task_constructor/pick_and_place_with_moveit_task_constructor.html)
  — 이 강의의 MTC 절에서 본 stage 와 planner 를 코드로 하나씩 더해 가는 튜토리얼. 처음의 stage 종류 설명부터 읽는다
- M. Görner, R. Haschke 외, [MoveIt! Task Constructor for Task-Level Motion Planning](https://doi.org/10.1109/ICRA.2019.8793898) (ICRA 2019)
  — generator·propagator·connector 로 계획 문제를 나누는 MTC 의 설계를 설명한 논문
- OpenCV, [Changing Colorspaces](https://github.com/opencv/opencv/blob/4.x/doc/py_tutorials/py_imgproc/py_colorspaces/py_colorspaces.markdown)
  — 사진을 HSV 로 바꾸고 색 하나만 골라 mask 를 만드는 예. [색과 이름으로 찾는 물체](#색과-이름으로-찾는-물체) 절과 함께 읽는다
- T. Cheng 외, [YOLO-World: Real-Time Open-Vocabulary Object Detection](https://arxiv.org/abs/2401.17270) (2024) — 이름을 주면 bounding box
  를 찾는 open-vocabulary 인식기. 초록과 Figure 1 로 입력과 출력을 확인한다
- N. Correll 외, [Analysis and Observations from the First Amazon Picking Challenge](https://arxiv.org/abs/1601.05484) (2016) — 26 팀의
  인식·grasp·motion planning 구성과 결과를 비교한 설문 분석. Table II 의 점수와 Fig. 11 의 어려웠던 단계를 본다
- S. Levine 외, [End-to-End Training of Deep Visuomotor Policies](https://arxiv.org/abs/1504.00702) (2016) — 카메라 영상에서 motor torque
  까지를 network 하나로 학습한 연구. 모듈 파이프라인과 비교하는 서론을 읽는다
