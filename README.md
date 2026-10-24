<div align="center">

# Robotics Roadmap

**로보틱스 개발자가 되기 위한 오픈소스 독학 커리큘럼**

[![Lessons](https://img.shields.io/badge/lessons-56-2dd4bf)](#커리큘럼)
[![Hours](https://img.shields.io/badge/hours-118-818cf8)](#커리큘럼)
[![Lessons license](https://img.shields.io/badge/lessons-CC%20BY--NC--SA%204.0-lightgrey)](lessons/LICENSE.md)
[![Site license](https://img.shields.io/badge/site-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520.19-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/woolimi/robotics-roadmap?style=social)](https://github.com/woolimi/robotics-roadmap/stargazers)

[예시 사이트](https://woolimi.github.io/robotics-roadmap/) · [설치와 실행](#설치와-실행) · [커리큘럼](#커리큘럼) · [강의와 퀴즈](#강의와-퀴즈) · [기여](#기여) · [라이선스](#라이선스)

<img src="docs/tour.gif" alt="커리큘럼 지도에서 강의 원을 눌러 선수·후속 강의가 강조되고, 오른쪽 창에 강의 본문이 열리는 모습" width="960">

</div>

## 소개

로보틱스 개발자가 되기 위한 독학 커리큘럼입니다. 리포를 fork 해 내 컴퓨터에서 지도를 띄우면, 강의를 읽고 퀴즈로 이해를 확인하고
그 기록을 내 fork 에 쌓는 과정을 혼자서 이어 갈 수 있습니다. 강의 56개는 선수 관계로 이어진 지도 위에 놓여 있어서
로보틱스의 각 기술이 어떤 기초 위에 서 있는지 한눈에 보이고, 강의마다 근거가 된 논문을 밝히고 그 논문의 방법과 숫자를 따라
설명합니다.

vector·미분·확률과 ROS 2 같은 공통 기초에서 출발해 robot learning, manipulation, mobile robot·자율주행 세 직무 방향으로
나아갑니다. 강의는 처음 배우는 사람 기준으로 작은 숫자 예시부터 한 단계씩 설명하고, 실제 로봇과 오픈소스에서 그 개념이 어떻게
쓰이는지까지 다룹니다.

## 특징

- **fork 해서 혼자 진행하는 자율형 학습**: 강의를 읽고 끝의 면접형 4지선다 퀴즈를 풀면 채점 결과가 내 fork 의 `progress/` 에
  남습니다. 다시 풀 때는 틀린 원리만 다른 문항으로 묻고, 틀린 문항이 없어지면 강의가 완료로 칠해집니다. 계정이나 수강 신청 없이
  git 만으로 진도를 관리하므로 어느 컴퓨터에서 clone 해도 이어서 공부할 수 있습니다.
- **로보틱스 기술의 의존 관계가 보이는 지도**: π0 를 이해하려면 RT-2·OpenVLA, flow matching, ACT 를, LiDAR SLAM 을 이해하려면
  particle filter 와 그 앞의 Kalman filter 를 먼저 알아야 한다는 식의 선수 관계가 지도의 선으로 그려져 있습니다. 강의를 누르면
  선수·후속 강의가 강조되어, 목표로 삼은 기술까지 무엇을 어떤 순서로 공부할지 바로 정할 수 있습니다.
- **논문 기반 강의**: 강의마다 frontmatter 에 근거 논문을 적고, 본문은 그 논문의 방법과 실험 숫자를 따라갑니다. 커리큘럼 전체에서
  Kalman(1960)부터 ACT·Diffusion Policy·π0·GR00T N1 까지 논문·교과서·공식 문서 200여 편을 다루고, 본문의 숫자마다 논문·문서·직접
  계산 중 어디서 왔는지 밝힙니다.
- **코드 없이 숫자와 그림으로**: 개념마다 손으로 따라 할 수 있는 숫자 예시와 SVG 그림이 있고, 긴 유도는 접어 둔 "심화" 블록에
  있어 처음 읽을 때는 건너뛸 수 있습니다. ROS 2·Nav2·MoveIt 2·ros2_control·Autoware·MuJoCo·LeRobot 의 기본값과 동작은 소스
  코드와 공식 문서로 확인해 적었습니다.
- **업데이트 알림**: 원본 리포에 새 강의가 올라오면 지도 화면에서 업데이트할지 묻고, 버튼 하나로 내 fork 에 합칩니다.

## 설치와 실행

설치하기 전에 [예시 사이트](https://woolimi.github.io/robotics-roadmap/)에서 지도와 강의를 둘러보고 퀴즈를 풀어 볼 수 있습니다. 예시
사이트의 퀴즈 결과는 새로고침하면 사라지므로, 진행 기록을 남기려면 아래처럼 내 fork 를 띄워서 씁니다.

[Node.js](https://nodejs.org/) 20.19 이상(또는 22.12 이상)과 git 이 필요합니다. 퀴즈 기록을 내 GitHub 에 남길 수 있도록 fork 해서 씁니다.

1. 이 페이지 오른쪽 위의 **Fork** 를 눌러 내 계정으로 복사합니다
2. 내 fork 를 받아 지도를 띄웁니다

   ```bash
   git clone https://github.com/<내 계정>/robotics-roadmap.git
   cd robotics-roadmap/site
   npm install
   npm run dev
   ```

3. 브라우저에서 http://localhost:5173 을 엽니다

### 퀴즈 기록

퀴즈를 제출하면 지도를 띄운 dev server 가 답안을 채점해 `progress/<강의>.json` 에 저장합니다. 이 파일은 내 컴퓨터에만 있으므로,
공부를 마칠 때 커밋해서 push 해 두면 다른 컴퓨터에서 clone 해도 진행 상태가 그대로 보입니다.

```bash
git add progress
git commit -m "Record quiz progress"
git push
```

### 강의 업데이트

강의는 계속 늘어나고 고쳐집니다. `npm run dev` 로 지도를 띄우면 dev server 가 원본 리포(woolimi/robotics-roadmap)를 확인해서, 내 fork 에
없는 변경이 있으면 화면 위쪽에 업데이트할지 묻습니다. **업데이트** 를 누르면 원본의 변경을 내 fork 에 합치고, 퀴즈 기록은 그대로
남습니다. 합친 결과는 다음에 퀴즈 기록을 push 할 때 함께 올라갑니다.

원본은 `progress/` 를 건드리지 않으므로 기록만 커밋했다면 충돌하지 않습니다. `lessons/` 나 `site/` 를 직접 고쳤다면 원본의 변경과 겹쳐
자동으로 합치지 못할 수 있는데, 그때는 터미널에서 직접 합칩니다.

```bash
git fetch upstream
git merge upstream/main
```

## 커리큘럼

![커리큘럼 지도. 가운데 동심원에 공통 기초가 놓이고, 점선으로 나뉜 세 구역으로 Robot Learning·Manipulation·Mobile Robotics 트리가 뻗습니다](docs/map.png)

| 영역 | 다루는 것 |
| --- | --- |
| 공통 기초 | vector·행렬, 미분·gradient, 확률·Gaussian, ROS 2(node·topic·tf2), 좌표 변환, PID 제어, 카메라 geometry |
| Robot Learning | linear regression 에서 PyTorch 까지의 신경망 기초, CNN·ViT·CLIP, Transformer·GPT-2, VAE·diffusion·flow matching, 강화학습(DQN·SAC·PPO·sim-to-real), imitation learning(behavior cloning·DAgger·ACT·Diffusion Policy), VLA(RT-2·OpenVLA·π0·GR00T N1), world model |
| Manipulation | forward·inverse kinematics, MuJoCo simulation, force·impedance control, ros2_control, trajectory generation, motion planning(RRT·OMPL·MoveIt 2), hand-eye calibration, pick-and-place, grasp planning |
| Mobile Robotics · 자율주행 | Kalman filter, particle filter, LiDAR·visual SLAM, path planning(A*·Nav2), path tracking(pure pursuit·MPC), LiDAR perception, 자율주행 stack(Autoware) |

원 하나가 강의 하나이고, 선은 먼저 읽어 두면 좋은 강의를 잇습니다. 가운데의 Vectors & Matrices 에서 시작해 공통 기초를 읽고,
지원하려는 직무의 영역을 따라 바깥으로 나아가면 됩니다. 선수 관계는 권장 순서일 뿐이라 어떤 강의든 바로 열 수 있습니다.

## 강의와 퀴즈

![Kalman filter 강의. 오른쪽 창에 숫자로 계산하는 표와 그림이 보이고, 왼쪽 지도에서는 이 강의와 선수·후속 강의가 강조됩니다](docs/lesson.png)

강의는 학습 목표, 본문, 정리 순서로 이루어집니다. 본문은 직접 따라 계산하는 표, 그림, 수식, 절마다 답을 접어 둔 확인 문제로 짜여
있고, 긴 유도는 "심화" 블록에 접어 두어 처음 읽을 때는 건너뛸 수 있습니다.

![퀴즈 화면. 면접관의 질문에 4지선다로 답하는 문항이 보입니다](docs/quiz.png)

강의 끝의 퀴즈는 강의의 원리 하나마다 한 문항을 묻습니다. 제출하면 틀린 문항의 해설이 보이고, 다시 풀 때는 틀린 원리만 같은 원리의
다른 문항으로 묻습니다. 틀린 문항이 남지 않으면 그 강의는 완료로 칠해지고 이어지는 강의가 밝아집니다.

## 프로젝트 구조

```text
robotics-roadmap/
├── lessons/              # 강의 56개
│   ├── branches.yaml     # 지도의 동심원·영역·branch 설정
│   └── <강의>/
│       ├── README.md     # 강의 본문 (frontmatter 에 선수 강의·시간·논문)
│       ├── quiz.yaml     # 면접형 퀴즈
│       └── figures/      # SVG 그림
├── progress/             # 내 퀴즈 기록 (fork 에서만 커밋)
├── site/                 # 지도와 강의를 보여 주는 Vite + React 앱
└── docs/                 # README 이미지
```

## 기여

틀린 내용, 어색한 설명, 깨진 링크는 [issue](https://github.com/woolimi/robotics-roadmap/issues) 로 알려 주시면 고치겠습니다.
사실 정정은 근거가 되는 논문·공식 문서·소스 코드 링크를 함께 남겨 주시면 가장 빠르게 반영됩니다.

강의를 고치거나 새로 쓰는 pull request 도 환영합니다. 강의 형식, 문장 규칙, 퀴즈 규칙, 지도 사이트의 구조는
[CONTRIBUTING.md](CONTRIBUTING.md) 에 있고, PR 을 올리기 전에 `site/` 에서 `npm test` 로 형식 검사를 통과하는지 확인해 주세요.

## 라이선스

- 강의(`lessons/`)와 문서 이미지(`docs/`): [CC BY-NC-SA 4.0](lessons/LICENSE.md). 출처를 밝히면 비영리 목적으로 자유롭게 쓰고 고칠 수
  있고, 고친 자료도 같은 조건으로 공유해야 합니다
- 지도 사이트(`site/`): [MIT](LICENSE)
