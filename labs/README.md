# 구현

강의를 공부하며 직접 짠 코드를 `labs/<이름>/` 에 둡니다. 폴더마다 `README.md` 가 있어야 하고, 그 frontmatter 의 `lessons` 에 구현한
강의 id 를 적습니다. 형식은 [docs/templates/lab.md](../docs/templates/lab.md) 를 복사해서 씁니다.

- `lessons` 에 적은 강의마다 지도의 원 왼쪽 위에 마름모가 붙고, 강의 창의 **구현** 탭에 README 가 나옵니다
- 포트폴리오 페이지(`#/me`)의 **구현 프로젝트** 에 카드로 모입니다
- 결과는 그래프·GIF·숫자로 보여 줍니다. 결과 그림은 README 와 같은 폴더에 두고 상대 경로로 겁니다
- dataset·checkpoint·학습 로그는 커밋하지 않습니다(`.gitignore` 의 `data/`, `outputs/`, `runs/`, `*.pt` 등)

## 구현해 볼 만한 것

Robot Learning·Manipulation 직무 기준으로, 강의 하나를 코드 하나로 옮기는 작은 것부터 여러 강의를 잇는 프로젝트 순서입니다.

| 구현 | 이어지는 강의 | 보여 줄 결과 |
| --- | --- | --- |
| PID 로 1 관절 팔 각도 맞추기 (MuJoCo) | pid-control, mujoco-sim | gain 별 step response 그래프 |
| 2 관절 팔 FK·IK 를 손으로 짜고 Jacobian IK 와 비교 | forward-kinematics, inverse-kinematics | 목표점 도달 오차, singularity 근처의 거동 |
| 1D·2D Kalman filter | kalman-filter | noise 크기별 RMSE, Kalman gain 의 수렴 |
| micrograd 크기의 autograd 와 MLP | autograd, pytorch-mlp | PyTorch 와 같은 gradient 가 나오는지 확인 |
| CartPole PPO | ppo | 학습 곡선, clip ε 를 바꾼 비교 |
| PushT Diffusion Policy (LeRobot) | diffusion-policy | 성공률, denoising step 수에 따른 속도·성능 |
| ACT 로 시뮬레이션 팔 pick-and-place (LeRobot·MuJoCo) | act, teleop-dataset | 성공률, chunk 크기 비교 |
| hand-eye calibration 부터 pick 까지 (ROS 2·MoveIt 2) | hand-eye-calibration, classical-pick, motion-planning | calibration 오차, 단계별 실패 원인 |
