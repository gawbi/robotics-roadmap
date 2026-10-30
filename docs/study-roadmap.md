# 공부 로드맵: 17주 일정

[공부 순서](study-plan.md)를 날짜 단위로 펼친 일정입니다. 매니퓰레이터를 주력으로 하고, 4주차 뒤에 강화학습 기초 한 주를 두고, 로봇개와 휴머노이드를 그 뒤에 둡니다. 마지막 3 주에는 앞에서 만든 것을 하나의 Physical AI 시스템으로 엮습니다. 평일 하루에
강의 하나, 주말에 구현 하나가 기본입니다. 밀리면 "예비" 날로 메웁니다.

## 처음 한 번만

1. [사이트](https://gawbi.github.io/robotics-roadmap/) 오른쪽 위 **내 공부 시작** 을 누릅니다
2. **토큰** 칸에 GitHub fine-grained token(`github_pat_…`)을 붙여넣습니다. 토큰은 Repository access 를 `robotics-roadmap` 하나로,
   Contents 를 Read and write 로 만듭니다
3. **기록 리포** 칸에 `gawbi/robotics-roadmap` 을 적습니다. 비워 두면 `gawbi/robotics-study` 로 연결하려다 실패합니다
4. **연결** 을 누릅니다. 오른쪽 위 버튼이 `@gawbi` 로 바뀌면 끝입니다

휴대폰에서도 쓰려면 사이트를 "홈 화면에 추가"로 설치하고(iPhone Safari 는 공유 → 홈 화면에 추가, Android Chrome 은 메뉴 → 앱 설치), 앱
안에서 1 ~ 4 를 한 번 더 합니다. 토큰은 만들 때 한 번만 보이므로, 따로 저장해 두지 않았다면 휴대폰용 토큰을 하나 더 만듭니다.

## 매일 하는 일 (약 2시간 반)

| 순서 | 시간 | 할 일 |
| --- | --- | --- |
| ① 읽기 | 90분 | 지도에서 강의를 열고 처음부터 읽습니다. 확인 문제는 "답 보기"를 누르기 전에 종이에 풉니다. 접힌 "심화" 블록은 첫 회독에서 건너뜁니다 |
| ② 퀴즈 | 15분 | 강의 창에서 퀴즈를 풉니다. 틀린 문항은 해설을 읽고 다음 날 아침에 다시 풉니다. 틀린 문항이 없어지면 통과입니다 |
| ③ 노트 | 30분 | 강의 창을 닫고 **내 노트** 탭에 세 칸을 씁니다. 저장하면 자동으로 커밋됩니다 |
| ④ 검토 | 5분 | Claude 에게 "○○ 노트 봐줘" 라고 보냅니다. 틀린 부분과 면접 꼬리 질문 2 개를 받습니다 |

노트의 세 칸:

- **한 문장 요약**: 처음 듣는 사람에게 설명하듯
- **직접 해 본 계산**: 강의의 숫자 예시에서 숫자만 바꿔 다시 풀기
- **면접 질문에 답해 보기**: 30초 안에 말할 길이로

**퀴즈만** 이라고 적힌 강의는 30분이면 됩니다. 퀴즈부터 풀고, 틀린 주제의 절만 읽고 다시 푼 뒤, 노트에는 한 문장 요약만 씁니다.

노트와 구현 코드는 직접 씁니다. 남이 쓴 노트는 공부한 증거가 되지 못하고, 면접에서 그 내용을 물으면 답할 수 없습니다.

## 주말 구현의 순서

1. `labs/<이름>/` 폴더를 만들고 [lab 템플릿](templates/lab.md)을 `README.md` 로 복사해 frontmatter 의 `lessons` 를 채웁니다
2. 코드를 짜고, 결과를 그래프와 숫자로 남깁니다
3. README 의 "결과" 에 숫자로 적습니다(예: 도달 오차 평균 3.2 mm)
4. `git pull` → `git add labs/<이름>` → `git commit -m "Add <이름> lab"` → `git push`

막히면 에러 메시지와 코드를 Claude 에게 보내 원인을 같이 찾습니다.

## 1주차: 최소 기초

| 날 | 할 일 |
| --- | --- |
| 1 | [Rigid Transforms](../lessons/transforms/README.md) |
| 2 | [PID Control](../lessons/pid-control/README.md) |
| 3 | 퀴즈만: [Vectors & Matrices](../lessons/vectors-matrices/README.md), [Derivatives & Gradients](../lessons/derivatives/README.md), [Probability & Gaussians](../lessons/probability/README.md) |
| 4 | [ROS 2 Basics](../lessons/ros2-basics/README.md) |
| 5 | [Camera Geometry](../lessons/camera-geometry/README.md) |
| 6 | 퀴즈만: [Linear Regression](../lessons/linear-regression/README.md), [Perceptron](../lessons/perceptron/README.md), [Backpropagation](../lessons/autograd/README.md). 그다음 [PyTorch Training Loop](../lessons/pytorch-mlp/README.md) |
| 7 | 구현 1 |

**구현 1 `labs/pd-1joint`** (PID Control)

- Python 으로 관절 하나에 매달린 막대를 만듭니다. 중력과 마찰이 있고 0.001 초씩 시간을 넘깁니다
- PD 로 0 에서 1 rad 까지 올립니다. $(K_p, K_d)$ 를 약한 것, 적당한 것, 진동하는 것 세 조합으로 시험합니다
- 남길 것: 세 조합의 각도 그래프 하나, 조합마다 overshoot(%) 와 목표 ±2% 에 들어오는 시간

## 2주차: 팔을 simulation 에서 움직이기 (M1)

| 날 | 할 일 |
| --- | --- |
| 1 | [Forward Kinematics](../lessons/forward-kinematics/README.md) |
| 2 | [Inverse Kinematics](../lessons/inverse-kinematics/README.md) |
| 3 | [MuJoCo Simulation](../lessons/mujoco-sim/README.md) |
| 4 | 복습: 1주차 퀴즈 가운데 틀렸던 것 다시 풀기 |
| 5 | 예비 |
| 6–7 | 구현 2 |

**구현 2 `labs/so101-ik`** (forward-kinematics, inverse-kinematics, mujoco-sim)

- MuJoCo Menagerie 의 SO-101 model 을 불러옵니다
- FK 를 직접 계산해 MuJoCo 가 주는 손끝 위치와 같은지 확인합니다
- Jacobian IK 로 목표점 10 개에 손끝을 보내고 도달 오차를 표로 적습니다
- 남길 것: 오차 표, 팔이 거의 다 펴진 자세(singularity) 근처의 움직임 영상이나 그래프

## 3주차: ROS 2 로 팔 움직이기 (M2)

| 날 | 할 일 |
| --- | --- |
| 1 | 퀴즈만: [Trajectory Generation](../lessons/trajectory-generation/README.md) |
| 2 | [ros2_control](../lessons/ros2-control/README.md) |
| 3 | [Motion Planning](../lessons/motion-planning/README.md) |
| 4 | 복습 |
| 5 | 예비 |
| 6–7 | 구현 3 |

**구현 3 `labs/so101-moveit`** (ros2-control, motion-planning)

- 같은 팔을 ros2_control 의 mock hardware 로 띄우고 MoveIt 2 로 목표 자세까지 움직입니다
- 장애물 상자 하나를 넣고 피해 가는 경로를 만듭니다
- 남길 것: RViz 화면 녹화, 관절 추종 오차

## 4주차: 카메라로 집기 (M3)

| 날 | 할 일 |
| --- | --- |
| 1 | [Hand-Eye Calibration](../lessons/hand-eye-calibration/README.md) |
| 2 | [Classical Pick & Place](../lessons/classical-pick/README.md) |
| 3 | 복습 |
| 4–7 | 구현 4 |

**구현 4 `labs/scripted-pick`** (hand-eye-calibration, classical-pick)

- MuJoCo 장면에 손목 카메라와 상자를 넣고 hand-eye calibration 을 합니다
- 카메라로 상자 위치를 찾아 집어 옮기는 scripted pick-and-place 를 만듭니다
- 남길 것: calibration 오차, 상자 위치를 20 번 바꿨을 때 성공률과 실패 원인 분류
- 이 장면이 6 ~ 10주차의 무대입니다

## 5주차: 강화학습 기초

| 날 | 할 일 |
| --- | --- |
| 1 | 퀴즈만: [Bandits & MDPs](../lessons/bandit-mdp/README.md), [Policy Gradient](../lessons/policy-gradient/README.md). 그다음 [PPO](../lessons/ppo/README.md) |
| 2 | [DQN → SAC](../lessons/off-policy/README.md) |
| 3 | [Critic Loss](../lessons/critic-loss/README.md) |
| 4 | [Reward Scale & Shaping](../lessons/reward-scale/README.md) |
| 5 | [RL Experiments](../lessons/rl-experiments/README.md) |
| 6–7 | 구현 5 |

**구현 5 `labs/sac-pendulum`** (off-policy, critic-loss, rl-experiments)

- Gymnasium 의 Pendulum 에서 SAC 를 학습합니다
- critic loss 를 MSE 와 Huber 로 바꿔 seed 5 개씩 학습하고, 같은 seed 끼리 짝지어 비교합니다
- 남길 것: 두 방법의 학습 곡선, 마지막 return 의 IQM 과 95% 구간, sign-flip 검정의 p 값
- 여기서 익힌 비교 방법을 6 ~ 8주차의 ACT·Diffusion Policy 비교에 그대로 씁니다

## 6–8주차: 시연으로 학습하기 (M4, 핵심)

| 날 | 6주차 | 7주차 | 8주차 |
| --- | --- | --- | --- |
| 1 | 퀴즈만: [CNN](../lessons/cnn/README.md), [ResNet](../lessons/resnet/README.md) | [ACT](../lessons/act/README.md) | 실험: ACT 의 chunk 크기 비교 |
| 2 | [Behavior Cloning](../lessons/behavior-cloning/README.md) | 퀴즈만: [DDPM](../lessons/ddpm/README.md), [RT-1](../lessons/rt1/README.md) | 실험: Diffusion Policy 의 denoising step 수 비교 |
| 3 | 퀴즈만: [VAE](../lessons/vae/README.md), [BPE Tokenizer](../lessons/tokenizer/README.md) | [Diffusion Policy](../lessons/diffusion-policy/README.md) | 실험: 시연 수 25·50·100 비교 |
| 4 | 퀴즈만: [Transformer](../lessons/transformer/README.md) | 복습 | 실패 사례 분류 |
| 5 | [Teleop Dataset](../lessons/teleop-dataset/README.md) | 예비 | README 정리 |
| 6–7 | 구현 6-1 | 구현 6-2 | 구현 6 마무리 |

**구현 6 `labs/imitation-pick`** (teleop-dataset, behavior-cloning, act, diffusion-policy)

- 6-1: LeRobot 의 PushT simulation 으로 Diffusion Policy 학습을 한 번 재현합니다. 그다음 구현 4 의 장면에서 키보드나 마우스로 시연을 50 개 모아 LeRobotDataset 으로 저장합니다
- 6-2: 같은 dataset 으로 ACT 와 Diffusion Policy 를 학습합니다
- 8주차: 위 표의 실험을 하고 scripted pick 과 성공률을 비교합니다. 성공률은 시도 수와 95% 구간을 함께 적습니다
- 남길 것: 방법별 성공률 표, 실험 그래프, 실패 영상 2 ~ 3 개와 원인
- 면접에서 가장 오래 이야기할 프로젝트입니다. README 를 가장 공들여 씁니다

## 9–10주차: VLA 와 실물 (M5, M6)

| 날 | 9주차 | 10주차 |
| --- | --- | --- |
| 1 | 퀴즈만: [ViT](../lessons/vit/README.md), [GPT-2](../lessons/gpt/README.md) | 구현 7 평가 |
| 2 | 퀴즈만: [CLIP](../lessons/clip/README.md), [Flow Matching](../lessons/flow-matching/README.md) | 구현 7 평가 |
| 3 | [RT-2 → OpenVLA](../lessons/vla-tokens/README.md) | [Real Robot](../lessons/real-robot/README.md) |
| 4 | [π0](../lessons/pi0/README.md) | [Force & Impedance Control](../lessons/impedance-control/README.md) |
| 5 | 예비 | 예비 |
| 6–7 | 구현 7 | 구현 8 또는 정리 |

**구현 7 `labs/vla-finetune`** (vla-tokens, pi0)

- 구현 6 의 dataset 에 "빨간 상자를 왼쪽 접시에" 같은 언어 지시를 붙이고, LeRobot 의 작은 VLA(SmolVLA 등)를 fine-tune 합니다
- 남길 것: ACT·Diffusion Policy 와의 성공률과 추론 시간 비교, 처음 보는 지시문에서의 결과

**구현 8 `labs/real-arm`** (real-robot): 실물 팔(SO-101 등)이 있을 때만 합니다

- 실물에서 시연을 모아 ACT 를 학습하고 성공률을 신뢰 구간과 함께 적습니다
- 실물이 없으면 이 주말에는 구현 1 ~ 7 의 README 를 다듬습니다

## 11–12주차: 로봇개

| 날 | 11주차 | 12주차 |
| --- | --- | --- |
| 1 | [Sim-to-Real Locomotion](../lessons/sim2real-locomotion/README.md) | 구현 9: sim-to-sim |
| 2 | [Locomotion Deployment](../lessons/locomotion-deployment/README.md) | 구현 9: sim-to-sim |
| 3 | [Perceptive Locomotion](../lessons/perceptive-locomotion/README.md) | 구현 9: 배포 점검표 |
| 4 | [ZMP → Convex MPC](../lessons/legged-balance/README.md) | 복습 |
| 5 | 퀴즈만: [Kalman Filter](../lessons/kalman-filter/README.md) | 예비 |
| 6–7 | 구현 9: 학습 | 구현 9 마무리 |

**구현 9 `labs/quadruped-walk`** (ppo, sim2real-locomotion, locomotion-deployment)

- [unitree_rl_gym](https://github.com/unitreerobotics/unitree_rl_gym) 으로 Go2 평지 보행을 학습합니다. Isaac Gym 은 NVIDIA GPU 가 필요하므로,
  GPU 가 없으면 [MuJoCo Playground](https://playground.mujoco.org/) 와 GPU 가 있는 원격 환경을 씁니다
- 학습한 policy 를 MuJoCo 에서 다시 걷게 하는 배포 script 를 직접 쓰고, Locomotion Deployment 의 점검표를 채웁니다
- 남길 것: reward 항 하나를 바꾼 비교(seed 짝지은 비교로), 속도 명령 추종 오차, sim-to-sim 에서 무너지는 조건

## 13주차: 휴머노이드

| 날 | 할 일 |
| --- | --- |
| 1 | [Humanoid Locomotion](../lessons/humanoid-locomotion/README.md) |
| 2 | [Humanoid Whole-Body Control](../lessons/humanoid-wbc/README.md) |
| 3 | [GR00T N1](../lessons/groot/README.md) |
| 4 | [Robot Data Scaling](../lessons/data-scaling/README.md) |
| 5 | 예비 |
| 6–7 | 구현 10 |

**구현 10 `labs/humanoid-walk`** (humanoid-locomotion)

- 구현 9 의 과정을 G1 으로 반복합니다. unitree_rl_gym 에 G1 설정과 MuJoCo 배포 script 가 있습니다
- 남길 것: 걸음 clock 을 뺀 policy 와의 비교, MuJoCo 에서의 속도 추종 오차

## 14–16주차: Physical AI 통합 프로젝트

앞의 13주에 만든 것(보행 policy, 카메라 좌표, 집기)을 한 로봇 위에 모아, 자연어 명령을 받아 지도 위를 이동하고 물체를 찾아 다루는 시스템으로
엮는다. 이 단계의 simulation(Isaac Sim·Isaac Lab, Gazebo + Nav2)은 NVIDIA GPU 가 있는 Ubuntu 에서 돈다. Mac 만 있으면 학교 실습실이나 GPU 가
있는 원격 서버를 쓰고, 그것도 어려우면 MuJoCo 와 2D 지도로 범위를 줄인다.

| 날 | 14주차 | 15주차 | 16주차 |
| --- | --- | --- | --- |
| 1 | 퀴즈만: [Particle Filter](../lessons/particle-filter/README.md) | [Object Detection](../lessons/object-detection/README.md) | 복습: [Reasoning VLA](../lessons/vla-reasoning/README.md) |
| 2 | [LiDAR SLAM](../lessons/lidar-slam/README.md) | 퀴즈만: [LiDAR Perception](../lessons/lidar-perception/README.md) | [Robot Coding Agent](../lessons/robot-coding-agent/README.md) |
| 3 | [Path Planning](../lessons/path-planning/README.md) | 구현 12 | 구현 13 |
| 4 | [Path Tracking](../lessons/path-tracking/README.md) | 구현 12 | 구현 13 |
| 5 | 퀴즈만: [Visual SLAM & VIO](../lessons/visual-slam/README.md) | 예비 | 구현 13 |
| 6–7 | 구현 11 | 구현 12 마무리 | 구현 13 마무리 |

**구현 11 `labs/slam-nav`** (lidar-slam, path-planning, path-tracking)

- 바퀴 로봇이나 4족 로봇에 LiDAR 를 달고 `slam_toolbox` 로 지도를 만든 뒤, 저장한 지도에서 Nav2 로 목표점 10 개에 보낸다
- Nav2 의 parameter 하나(예: 장애물 여유 거리)를 바꿔 두 설정을 비교한다
- 남길 것: 지도 그림, 목표점 도달 성공률과 걸린 시간, parameter 를 바꾼 비교

**구현 12 `labs/detect-3d`** (object-detection, camera-geometry)

- simulation 카메라 영상에서 YOLO 로 물체를 찾고, box 가운데와 depth 로 물체의 3D 좌표를 robot frame 에서 계산한다
- 정답 좌표를 아는 장면 20 개에서 오차를 잰다. 필요하면 내 장면의 사진으로 detector 를 fine-tune 한다
- 남길 것: 탐지 결과 영상, 3D 좌표 오차 표, 놓치거나 잘못 찾은 경우의 분류

**구현 13 `labs/language-robot`** (vla-reasoning, robot-coding-agent)

- 단위 동작 `move_to`(Nav2), `scan`(카메라로 둘러보기), `pick` 또는 `track`(구현 6·12) 을 만들고, 동작마다 성공과 실패 조건을 정한다
- LLM 이 "창가에 있는 빨간 상자를 찾아서 가져와" 같은 명령을 단위 동작의 순서로 바꾸고, 실행 결과를 보고 다시 계획하게 한다
- 동작이 실패하거나 시간을 넘기면 멈추는 fail-safe 를 넣는다
- 남길 것: 명령 10 개의 성공률, 실패한 명령의 원인(계획·탐지·이동·집기 중 어디서), 시연 영상
- 이 구현이 포트폴리오의 마지막 대표작이다. 앞의 구현 1 ~ 12 가 어디에 쓰였는지 README 에 그림으로 그린다

## 17주차: 지원 준비

| 날 | 할 일 |
| --- | --- |
| 1–2 | 지원할 공고의 키워드에 맞는 강의를 [공부 순서의 5 절](study-plan.md#5-그-밖의-강의)에서 골라 공부 |
| 3 | 구현 README 13 개 다듬기: 결과 숫자, 그래프, 막혔던 점 |
| 4 | 모의 면접: Claude 에게 "구현 6 으로 면접 봐줘", "구현 13 으로 면접 봐줘" |
| 5 | 이력서에 구현과 공부 기록 링크(`#/me`) 넣기 |

## Claude 에게 이렇게 말하면 됩니다

| 말 | 받는 것 |
| --- | --- |
| "오늘 뭐 해" | 이 일정에서 오늘 할 일과 미리 생각해 볼 질문 하나 |
| "○○ 노트 봐줘" | 사실 오류 지적, 면접 꼬리 질문 2 개 |
| "○○ 면접 질문 내줘" | 강의 범위의 면접 질문 5 개. 답을 쓰면 채점 |
| "이 에러 봐줘" + 에러 메시지 | 원인을 같이 찾기 |
| "일정 밀렸어" | 남은 주차를 다시 짠 일정 |
