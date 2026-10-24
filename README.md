# Robotics Roadmap

<p align="center">
  <img src="docs/tour.gif" alt="커리큘럼 지도에서 강의 원을 눌러 선수·후속 강의가 강조되고, 오른쪽 창에 강의 본문이 열리는 모습" width="960">
</p>

<p align="center">
  <b>강의 56개</b> · <b>약 118시간</b> · <b>코드 없이 숫자와 그림으로</b> · <b>면접형 퀴즈</b>
</p>

로보틱스 분야에 취업하려는 사람을 위한 한국어 독학 커리큘럼이다. vector·미분·확률과 ROS 2 같은 공통 기초에서 출발해 robot learning,
manipulation, mobile robot·자율주행 세 직무 방향으로 나아간다. 강의는 처음 배우는 사람 기준으로 작은 숫자 예시부터 한 단계씩
설명하고, 실제 로봇과 오픈소스(ROS 2·Nav2·MoveIt 2·Autoware·LeRobot 등)에서 그 개념이 어떻게 쓰이는지까지 다룬다. 강의를 다 읽으면
면접에서 나올 법한 4지선다 퀴즈로 이해했는지 확인한다.

## 커리큘럼

![커리큘럼 지도. 가운데 동심원에 공통 기초가 놓이고, 점선으로 나뉜 세 구역으로 Robot Learning·Manipulation·Mobile Robotics 트리가 뻗는다](docs/map.png)

| 영역 | 다루는 것 |
| --- | --- |
| 공통 기초 | vector·행렬, 미분·gradient, 확률·Gaussian, ROS 2(node·topic·tf2), 좌표 변환, PID 제어, 카메라 geometry |
| Robot Learning | linear regression 에서 PyTorch 까지의 신경망 기초, CNN·ViT·CLIP, Transformer·GPT-2, VAE·diffusion·flow matching, 강화학습(DQN·SAC·PPO·sim-to-real), imitation learning(behavior cloning·DAgger·ACT·Diffusion Policy), VLA(RT-2·OpenVLA·π0·GR00T N1), world model |
| Manipulation | forward·inverse kinematics, MuJoCo simulation, force·impedance control, ros2_control, trajectory generation, motion planning(RRT·OMPL·MoveIt 2), hand-eye calibration, pick-and-place, grasp planning |
| Mobile Robotics · 자율주행 | Kalman filter, particle filter, LiDAR·visual SLAM, path planning(A*·Nav2), path tracking(pure pursuit·MPC), LiDAR perception, 자율주행 stack(Autoware) |

원 하나가 강의 하나이고, 선은 먼저 읽어 두면 좋은 강의를 잇는다. 가운데의 Vectors & Matrices 에서 시작해 공통 기초를 읽고, 지원하려는
직무의 영역을 따라 바깥으로 나아가면 된다. 선수 관계는 권장 순서일 뿐이라 어떤 강의든 바로 열 수 있다.

## 강의와 퀴즈

![Kalman filter 강의. 오른쪽 창에 숫자로 계산하는 표와 그림이 보이고, 왼쪽 지도에서는 이 강의와 선수·후속 강의가 강조된다](docs/lesson.png)

강의는 학습 목표, 본문, 정리 순서로 이루어진다. 본문은 직접 따라 계산하는 표, 그림, 수식, 절마다 답을 접어 둔 확인 문제로 짜여 있고,
긴 유도는 "심화" 블록에 접어 두어 처음 읽을 때는 건너뛸 수 있다.

![퀴즈 화면. 면접관의 질문에 4지선다로 답하는 문항이 보인다](docs/quiz.png)

강의 끝의 퀴즈는 강의의 원리 하나마다 한 문항을 묻는다. 제출하면 틀린 문항의 해설이 보이고, 다시 풀 때는 틀린 원리만 같은 원리의
다른 문항으로 묻는다. 틀린 문항이 남지 않으면 그 강의는 완료로 칠해지고 이어지는 강의가 밝아진다.

## 시작하기

[Node.js](https://nodejs.org/) 20.19 이상(또는 22.12 이상)과 git 이 필요하다. 퀴즈 기록을 내 GitHub 에 남길 수 있도록 fork 해서 쓴다.

1. 이 페이지 오른쪽 위의 **Fork** 를 눌러 내 계정으로 복사한다
2. 내 fork 를 받아 지도를 띄운다

   ```bash
   git clone https://github.com/<내 계정>/robotics-roadmap.git
   cd robotics-roadmap/site
   npm install
   npm run dev
   ```

3. 브라우저에서 http://localhost:5173 을 연다

## 퀴즈 기록

퀴즈를 제출하면 지도를 띄운 dev server 가 답안을 채점해 `progress/<강의>.json` 에 저장한다. 이 파일은 내 컴퓨터에만 있으므로, 공부를
마칠 때 커밋해서 push 해 두면 다른 컴퓨터에서 clone 해도 진행 상태가 그대로 보인다.

```bash
git add progress
git commit -m "Record quiz progress"
git push
```

## 강의 업데이트

강의는 계속 늘어나고 고쳐진다. `npm run dev` 로 지도를 띄우면 dev server 가 원본 리포(woolimi/robotics-roadmap)를 확인해서, 내 fork 에
없는 변경이 있으면 화면 위쪽에 업데이트할지 묻는다. **업데이트** 를 누르면 원본의 변경을 내 fork 에 합치고, 퀴즈 기록은 그대로 남는다.
합친 결과는 다음에 퀴즈 기록을 push 할 때 함께 올라간다.

원본은 `progress/` 를 건드리지 않으므로 기록만 커밋했다면 충돌하지 않는다. `lessons/` 나 `site/` 를 직접 고쳤다면 원본의 변경과 겹쳐
자동으로 합치지 못할 수 있는데, 그때는 터미널에서 직접 합친다.

```bash
git fetch upstream
git merge upstream/main
```

## 기여와 라이선스

강의를 고치거나 새로 쓸 때의 규칙과 지도 사이트의 구조는 [CONTRIBUTING.md](CONTRIBUTING.md) 에 있다. 틀린 내용이나 어색한 설명은
issue 로 알려 주면 고친다.

- 강의(`lessons/`)와 문서 이미지(`docs/`): [CC BY-NC-SA 4.0](lessons/LICENSE.md). 출처를 밝히면 비영리 목적으로 자유롭게 쓰고 고칠 수
  있고, 고친 자료도 같은 조건으로 공유해야 한다
- 지도 사이트(`site/`): [MIT](LICENSE)
