# Physical AI from Scratch

perceptron 부터 Diffusion Policy·ACT·VLA, 실물 로봇 배포까지 Physical AI 를 이루는 아이디어를 하나씩 직접 구현하며
따라가는 프로젝트 기반 독학 커리큘럼이다. 과제 37개가 선수 관계로 이어져 있고, 이 관계를 Ecole 42 의 holygraph
처럼 가운데에서 바깥으로 퍼지는 지도로 보여 준다.

**커리큘럼 지도**: https://woolimi.github.io/physical-ai-from-scratch/

## 진행 방식

1. 이 리포를 fork 한다
2. 지도 가운데의 [NumPy Warm-up](projects/warmup/README.md) 부터 연다
3. 과제 설명을 읽고 `projects/<과제>/` 폴더 안에 직접 구현한다
4. 과제의 "스스로 확인" 목록으로 결과를 점검하고, 지도에서 완료로 표시한다
5. 밝아진 다음 과제로 넘어간다

선수 관계는 권장 순서이고 잠금이 아니다. 이미 아는 내용은 완료로 표시하고 건너뛰어도 되고, 막히면 선수 과제로
돌아가면 된다. 채점도 없다. 대부분의 과제는 공식 구현(torchvision, Hugging Face, LeRobot, CleanRL 등)과 출력을
비교하는 기준을 제시하는데, 이것은 스스로 확인하기 위한 참고다.

## 과제 구성

| branch | 다루는 것 |
| --- | --- |
| Foundations | numpy, perceptron, backpropagation, PyTorch 학습 루프 |
| Language | BPE tokenizer, Transformer, GPT-2 |
| Vision | CNN, ResNet, ViT, CLIP |
| Generative Models | VAE, DDPM, flow matching |
| Imitation Learning | behavior cloning, DAgger, RT-1, Diffusion Policy, ACT, 실물 로봇 |
| Reinforcement Learning | bandit·MDP, DQN·SAC, policy gradient, PPO, sim-to-real 보행 |
| Robotics | 좌표 변환, kinematics, PID, MuJoCo, 카메라, pick-and-place, teleoperation 데이터 |
| VLA | RT-2 → OpenVLA, π0 |
| Frontier | world model, VLA 의 RL fine-tuning |

과제 하나는 `projects/<id>/README.md` 하나다. 앞의 YAML frontmatter 가 지도에 쓰이는 정보(branch, 선수 과제,
예상 시간, 논문)이고, 본문은 모든 과제가 같은 순서의 섹션을 갖는다.

| 섹션 | 내용 |
| --- | --- |
| 배경 | 이 아이디어가 풀려던 문제와 핵심 수식 |
| 목표 | 만들 것, 직접 짤 부분과 가져다 써도 되는 부분 |
| 준비물 | 패키지, 데이터·simulator, 필요한 GPU |
| 진행 순서 | 한 번에 하나씩 끝낼 수 있는 단계 |
| 시작점 | 파일 구조와 함수 signature |
| 스스로 확인 | 결과를 점검하는 기준 |
| 생각해 볼 질문 | 코드를 보지 않고 답해 볼 질문 |
| 힌트 | 막혔을 때 펼쳐 보는 단서 |
| 참고 자료 | 논문, 강의, 참고 구현 |
| 남은 한계 | 이 과제로 풀리지 않는 문제와 이어지는 과제 |

## 준비

- Python 3.12, [uv](https://docs.astral.sh/uv/) 권장. 과제마다 필요한 패키지는 각 과제의 "준비물" 에 있다
- GPU 는 중반부터 필요하다. 모든 과제의 내 구현은 8 GB 급 소비자 GPU 나 Colab 으로 돌아가고, 비교용 SmolVLA
  fine-tuning 처럼 더 큰 메모리가 필요한 경우는 각 과제의 "준비물" 에 cloud GPU 대안이 있다
- LIBERO 를 쓰는 VLA 과제는 macOS 에서 돌지 않으므로 Linux 나 Colab 을 쓴다
- 실물 로봇 과제는 LeRobot 이 지원하는 저가 로봇 팔(SO-101 등)을 기준으로 한다. 장비가 없으면 simulation 으로 대신한다

## 지도 사이트

`site/` 는 `projects/` 의 frontmatter 를 읽어 holygraph 를 그리는 Vite + React 앱이다. 진행 상태는 브라우저
localStorage 에만 저장되고, 상단의 "진행 기록" 메뉴에서 JSON 파일로 옮길 수 있다.

```bash
cd site
npm install
npm run dev     # http://localhost:5173
npm test        # frontmatter·선수 관계·섹션 순서·레이아웃 검사
npm run build   # site/dist
```

`main` 에 push 하면 `.github/workflows/pages.yml` 이 테스트·빌드 후 GitHub Pages 에 배포한다.

## 과제 추가·수정

1. `projects/<id>/README.md` 를 만든다. 폴더 이름이 곧 `id` 다
2. frontmatter 에 `id`, `title`, `branch`, `requires`, `hours`, `summary`, `papers` 를 채운다
3. 본문은 위 섹션 순서를 따른다. 다른 과제는 `[제목](../<id>/README.md)` 로 링크한다
4. `cd site && npm test` 로 선수 관계 순환, 없는 과제 참조, 섹션 누락, 지도 라벨 겹침을 검사한다

branch 의 이름·색·배치는 [`projects/branches.yaml`](projects/branches.yaml) 에서 정한다.
