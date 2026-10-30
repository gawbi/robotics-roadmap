# 공부 순서: 실무 중심

매니퓰레이터, 4족 로봇(로봇개), 휴머노이드를 바로 다룰 수 있게 되고, 마지막에 이를 하나의 Physical AI 시스템으로 엮는 것을 목표로 한 순서입니다. 지도의 강의 71개를 모두 읽지 않고, **구현 단계를
뼈대로 두고 그 단계에 필요한 강의만 앞에 붙였습니다.** 날짜별 일정은 [17주 로드맵](study-roadmap.md)에 있습니다.

## 원칙

- **구현이 먼저 정해지고, 강의는 그 구현에 필요한 만큼 읽습니다.** 단계마다 "남길 결과"가 `labs/` 의 구현 하나가 됩니다
- **아는 기초는 퀴즈로 확인하고 넘어갑니다.** 아래 표의 "퀴즈만" 칸은 퀴즈를 먼저 풀어 통과하면 짧은 노트만 쓰고 넘어가는 강의입니다.
  막히면 그때 읽습니다
- **앞 단계의 결과 위에 다음 단계를 쌓습니다.** 매니퓰레이터 트랙에서는 MuJoCo 팔 하나를 끝까지 키우고, 다리 로봇 트랙에서는 학습한 보행 policy 하나를 끝까지 키웁니다
- 평일에는 강의 하나를 공부하고(읽기 · 퀴즈 · 짧은 노트), 주말에는 구현합니다

## 0. 최소 기초 (1–2주, 22h)

| 읽을 강의 | 퀴즈만 |
| --- | --- |
| [Rigid Transforms](../lessons/transforms/README.md), [PID Control](../lessons/pid-control/README.md), [ROS 2 Basics](../lessons/ros2-basics/README.md), [Camera Geometry](../lessons/camera-geometry/README.md), [PyTorch Training Loop](../lessons/pytorch-mlp/README.md) | [Vectors & Matrices](../lessons/vectors-matrices/README.md), [Derivatives & Gradients](../lessons/derivatives/README.md), [Probability & Gaussians](../lessons/probability/README.md), [Linear Regression](../lessons/linear-regression/README.md), [Perceptron](../lessons/perceptron/README.md), [Backpropagation](../lessons/autograd/README.md) |

좌표 변환, PD 제어, ROS 2, 카메라 좌표는 세 로봇 모두에서 첫날부터 씁니다. 신경망 쪽은 학습 loop 를 직접 짜서 실행할 수 있을 만큼만 채웁니다.

남길 결과: 1 관절 PD 의 gain 별 step response, 또는 작은 MLP 를 직접 학습한 곡선.

## 1. 매니퓰레이터 (주력, 6–7주)

| 단계 | 구현 | 먼저 읽을 강의 | 퀴즈만 | 남길 결과 |
| --- | --- | --- | --- | --- |
| M1 | MuJoCo 에서 SO-101 팔을 FK·IK 와 PD 로 움직이기 | [Forward Kinematics](../lessons/forward-kinematics/README.md), [Inverse Kinematics](../lessons/inverse-kinematics/README.md), [MuJoCo Simulation](../lessons/mujoco-sim/README.md) | | 목표점 도달 오차, singularity 근처의 거동 |
| M2 | 같은 팔을 ros2_control 과 MoveIt 2 로 움직이기 (mock hardware → simulation) | [ros2_control](../lessons/ros2-control/README.md), [Motion Planning](../lessons/motion-planning/README.md) | [Trajectory Generation](../lessons/trajectory-generation/README.md) | 장애물을 피한 궤적, 관절 추종 오차 |
| M3 | 손목 카메라 hand-eye calibration 뒤 scripted pick-and-place | [Hand-Eye Calibration](../lessons/hand-eye-calibration/README.md), [Classical Pick & Place](../lessons/classical-pick/README.md) | | calibration 오차, 단계별 실패 원인 |
| M4 | M3 장면에서 teleop 으로 시연을 모아 ACT 와 Diffusion Policy 학습 | [Teleop Dataset](../lessons/teleop-dataset/README.md), [Behavior Cloning](../lessons/behavior-cloning/README.md), [ACT](../lessons/act/README.md), [Diffusion Policy](../lessons/diffusion-policy/README.md) | [VAE](../lessons/vae/README.md), [BPE Tokenizer](../lessons/tokenizer/README.md), [Transformer](../lessons/transformer/README.md), [CNN](../lessons/cnn/README.md), [ResNet](../lessons/resnet/README.md), [DDPM](../lessons/ddpm/README.md), [RT-1](../lessons/rt1/README.md) | scripted pick 과 성공률 비교, chunk 크기·denoising step 수 비교 |
| M5 | 같은 dataset 에 언어 지시를 붙여 작은 VLA(LeRobot 의 SmolVLA 등) fine-tune | [RT-2 → OpenVLA](../lessons/vla-tokens/README.md), [π0](../lessons/pi0/README.md) | [ViT](../lessons/vit/README.md), [GPT-2](../lessons/gpt/README.md), [CLIP](../lessons/clip/README.md), [Flow Matching](../lessons/flow-matching/README.md) | ACT 와의 성공률·추론 시간 비교 |
| M6 | 실물 팔(SO-101 등)에 올리기, 접촉이 있는 작업 | [Real Robot](../lessons/real-robot/README.md), [Force & Impedance Control](../lessons/impedance-control/README.md) | | 실물 성공률과 신뢰 구간, 실패 영상 |

M4 가 이 트랙의 중심입니다. 직접 모은 데이터, 학습한 policy, 성공률, 실패 이유가 면접에서 가장 오래 이야기할 거리입니다. 처음이면 LeRobot 의
PushT·ALOHA simulation 으로 학습을 한 번 재현하고 내 장면으로 옮깁니다. 실물 팔이 없으면 M6 은 뒤로 미룹니다.

## 2. 강화학습 기초와 로봇개 (1주 + 2주)

| 단계 | 구현 | 먼저 읽을 강의 | 퀴즈만 | 남길 결과 |
| --- | --- | --- | --- | --- |
| R | Gymnasium Pendulum 에서 SAC 학습, critic loss 를 MSE 와 Huber 로 바꿔 seed 5 개씩 짝지은 비교 | [PPO](../lessons/ppo/README.md), [DQN → SAC](../lessons/off-policy/README.md), [Critic Loss](../lessons/critic-loss/README.md), [Reward Scale & Shaping](../lessons/reward-scale/README.md), [RL Experiments](../lessons/rl-experiments/README.md) | [Bandits & MDPs](../lessons/bandit-mdp/README.md), [Policy Gradient](../lessons/policy-gradient/README.md) | 학습 곡선, IQM 과 95% 구간, sign-flip 검정의 p 값 |
| Q2 | [unitree_rl_gym](https://github.com/unitreerobotics/unitree_rl_gym) 이나 [MuJoCo Playground](https://playground.mujoco.org/) 로 4족 평지 보행 학습 → 다른 simulator 에서 다시 걷게 하기 | [Sim-to-Real Locomotion](../lessons/sim2real-locomotion/README.md), [Locomotion Deployment](../lessons/locomotion-deployment/README.md) | | reward 항을 바꾼 비교, sim-to-sim 에서 무너지는 조건, 배포 점검표를 채운 기록 |
| Q3 | 지형과 상태 추정 넣기 | [Perceptive Locomotion](../lessons/perceptive-locomotion/README.md), [ZMP → Convex MPC](../lessons/legged-balance/README.md) | [Kalman Filter](../lessons/kalman-filter/README.md) | 계단·경사 성공률, 몸통 속도 추정 오차 |

R 단계는 매니퓰레이터 M3 다음, M4 앞의 한 주에 합니다. 여기서 익힌 실험 비교 방법을 M4 의 ACT·Diffusion Policy 비교에 그대로 쓰기 때문입니다. Q2 의 배포 강의는 학습이 끝난 policy 를 실물에 올릴 때 필요한 일(관절 번호, IMU, 몸통 속도, motor 명령, 시작 순서, 제어 주기)을 다룹니다. 실물이
없어도 sim-to-sim 단계에서 같은 배포 코드를 시험할 수 있습니다.

## 3. 휴머노이드 (2주, 로봇개 트랙 다음)

| 단계 | 구현 | 먼저 읽을 강의 | 남길 결과 |
| --- | --- | --- | --- |
| H1 | Q2 의 과정을 G1 2족 보행으로 반복하고, 사람 동작 추종(motion tracking) 하나 학습 | [Humanoid Locomotion](../lessons/humanoid-locomotion/README.md), [Humanoid Whole-Body Control](../lessons/humanoid-wbc/README.md) | clock reward 유무 비교, 추종 오차 |
| H2 | 상체 조작을 VLA 로, 하체를 whole-body controller 로 나누는 구조 이해 | [GR00T N1](../lessons/groot/README.md), [Robot Data Scaling](../lessons/data-scaling/README.md) | 구조를 내 말로 그린 노트 |

휴머노이드 손(dexterous hand)으로 시연을 모으는 방법(사람 손 동작을 로봇 손 관절로 옮기는 retargeting)은 아직 강의가 없습니다. 다음 보강 후보입니다.

## 4. Physical AI 통합 프로젝트 (3주, 마지막)

앞에서 만든 보행 policy, 카메라 좌표, 집기를 한 로봇 위에 모아, 자연어 명령을 받아 지도 위를 이동하고 물체를 찾아 다루는 시스템으로 엮습니다.
도구는 NVIDIA Isaac Sim·Isaac Lab, ROS 2 의 Nav2, YOLO, LLM 입니다.

| 단계 | 구현 | 먼저 읽을 강의 | 퀴즈만 | 남길 결과 |
| --- | --- | --- | --- | --- |
| P1 | LiDAR SLAM 으로 지도를 만들고 Nav2 로 목표점까지 이동 | [LiDAR SLAM](../lessons/lidar-slam/README.md), [Path Planning](../lessons/path-planning/README.md), [Path Tracking](../lessons/path-tracking/README.md) | [Particle Filter](../lessons/particle-filter/README.md), [Visual SLAM & VIO](../lessons/visual-slam/README.md) | 지도, 도달 성공률, parameter 비교 |
| P2 | 카메라로 물체를 찾아 robot frame 의 3D 좌표 계산 | [Object Detection](../lessons/object-detection/README.md) | [LiDAR Perception](../lessons/lidar-perception/README.md) | 3D 좌표 오차, 실패 분류 |
| P3 | 자연어 명령 → LLM 계획 → 단위 동작(이동·탐색·집기) 실행 | [Reasoning VLA](../lessons/vla-reasoning/README.md), [Robot Coding Agent](../lessons/robot-coding-agent/README.md) | | 명령 10 개의 성공률과 실패 원인, 시연 영상 |

Isaac Sim 과 Isaac Lab 은 NVIDIA GPU 가 있는 Ubuntu 에서만 돌아서, Mac 만 있으면 학교 실습실이나 GPU 원격 서버가 필요합니다.

## 5. 그 밖의 강의

지원하는 공고에 맞춰 고릅니다.

| 공고에 이런 말이 있으면 | 강의 |
| --- | --- |
| grasp, bin picking, 6D pose | [Grasp Planning](../lessons/grasping/README.md), [6D Object Pose](../lessons/object-pose/README.md), [Tactile Sensing](../lessons/tactile-sensing/README.md) |
| cuRobo, Isaac ROS, GPU motion planning | [GPU Motion Generation](../lessons/gpu-motion-generation/README.md) |
| VLA, foundation model, RL fine-tuning | [Reasoning VLA](../lessons/vla-reasoning/README.md), [VLA + RL](../lessons/vla-rl/README.md), [World Model](../lessons/world-model/README.md), [DAgger](../lessons/dagger/README.md), [DQN → SAC](../lessons/off-policy/README.md) |
| LLM agent, code generation | [Robot Coding Agent](../lessons/robot-coding-agent/README.md) |

Mobile Autonomy 트리 가운데 SLAM 과 navigation 은 4 단계에서 읽고, 자율주행 branch 는 이 목표에서는 읽지 않습니다.

## 시간

| 묶음 | 강의 수 | 강의 시간 |
| --- | --- | --- |
| 최소 기초 | 11 | 22h |
| 매니퓰레이터 | 27 | 57h |
| 강화학습 기초와 로봇개 | 12 | 28h |
| 휴머노이드 | 4 | 10h |
| Physical AI 통합 프로젝트 | 9 | 18h |

강의 시간은 읽는 시간입니다. 구현은 단계마다 주말 하루에서 이틀을 따로 잡습니다.
