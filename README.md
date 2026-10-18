# Physical AI from Scratch

perceptron 부터 Diffusion Policy·ACT·VLA, 실물 로봇 배포까지 Physical AI 를 이루는 아이디어를 하나씩 직접 구현하며
따라가는 프로젝트 기반 독학 커리큘럼이다. 과제 37개가 선수 관계로 이어져 있고, 이 관계를 Ecole 42 의 holygraph
처럼 가운데에서 바깥으로 퍼지는 지도로 보여 준다.

**커리큘럼 지도**: https://woolimi.github.io/physical-ai-from-scratch/

## 처음 준비

### 필요한 것

- GitHub 계정과 git
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — 과제마다 Python 3.12 와 패키지를 설치한다. Python 을 따로
  설치할 필요가 없다
- [Claude Code](https://claude.com/claude-code) — 과제 평가에 쓴다
- GPU 는 중반부터 필요하다. 모든 과제의 내 구현은 8 GB 급 소비자 GPU 나 Colab 으로 돌아가고, 비교용 SmolVLA
  fine-tuning 처럼 더 큰 메모리가 필요한 경우는 각 과제의 "준비물" 에 cloud GPU 대안이 있다
- LIBERO 를 쓰는 VLA 과제는 macOS 에서 돌지 않으므로 Linux 나 Colab 을 쓴다
- 실물 로봇 과제는 LeRobot 이 지원하는 저가 로봇 팔(SO-101 등)을 기준으로 한다. 장비가 없으면 simulation 으로 대신한다

### fork 와 clone

GitHub 에서 이 리포의 **Fork** 버튼을 눌러 내 계정으로 복사한다. 구현과 평가 기록은 모두 이 fork 에 쌓이고, 진행 기록을
지도로 공유하려면 fork 가 public 이어야 한다. 그다음 fork 를 clone 하고, 커리큘럼 업데이트를 받아 올 `upstream` 을
등록한다.

```bash
git clone https://github.com/<계정>/physical-ai-from-scratch.git
cd physical-ai-from-scratch
git remote add upstream https://github.com/woolimi/physical-ai-from-scratch.git
```

### 과제별 Python 환경

Python 환경은 과제 폴더마다 따로 있다. 과제 폴더의 `pyproject.toml` 에 그 과제의 Python 버전과 패키지가, `uv.lock` 에
패키지의 정확한 버전이 적혀 있다. 과제 폴더에서 `uv run <명령>` 을 처음 실행하면 uv 가 그 폴더에 `.venv/` 를 만들고 패키지를
설치한 뒤 명령을 실행하므로, 가상환경을 켜거나 `pip install` 을 할 일이 없고 한 과제의 패키지가 다른 과제에 섞이지 않는다.
`.venv/` 는 `.gitignore` 에 걸려 있어서 커밋되지 않는다.

설치가 되는지는 perceptron 의 채점용 test 로 확인한다. 아직 아무것도 구현하지 않았으므로 첫 test 가
`NotImplementedError` 로 실패하면 정상이다.

```bash
cd projects/perceptron
uv run pytest tests -x
```

과제에 패키지를 더하려면 과제 폴더에서 `uv add <패키지>` 를 쓴다. `pyproject.toml` 과 `uv.lock` 이 함께 바뀌므로 둘 다
커밋한다.

### Claude Code

Claude Code 를 설치하고 로그인한 뒤 **fork 루트에서** `claude` 를 실행한다. 평가 skill 이 리포 안의
`.claude/skills/evaluate/` 에 있어서, 다른 폴더에서 열면 `/evaluate` 가 보이지 않는다.

### 로컬 지도

구두 평가의 객관식 문항은 fork 에서 직접 띄운 지도에서 응시한다. 답안을 fork 의 `projects/<과제>/quiz-result.json` 에
저장하는 일을 dev server 가 맡아서, 배포된 지도에서는 응시할 수 없다. Node.js 가 필요하다.

```bash
cd site
npm install
npm run dev     # http://localhost:5173
```

## 과제 하나의 진행

과제 id 는 `projects/` 아래 폴더 이름(`warmup`, `perceptron` 등)이다. 지도 가운데의
[NumPy Warm-up](projects/warmup/README.md) 부터 시작해 바깥쪽으로 넓혀 간다.

1. 지도에서 과제를 열어 "평가 기준" 까지 읽는다. "생각해 볼 질문" 은 구두 평가에서 묻는 원리이니 미리 읽어 둔다
2. "준비물" 중 데이터·장비처럼 패키지가 아닌 것을 준비한다. 패키지는 `uv run` 이 설치한다
3. `cd projects/<과제>` 로 과제 폴더에 들어가 "시작점" 의 stub 을 채운다. 명령은 모두 과제 폴더에서 `uv run` 으로 실행한다
4. 막히면 "힌트" 를 펼치고, 그래도 막히면 선수 과제로 돌아간다. "참고 자료" 의 공식 구현은 마지막에 연다
5. "평가 기준" 을 스스로 확인한 뒤 커밋한다. 평가는 커밋된 상태만 본다
6. 로컬 지도에서 과제를 열고 "객관식 평가" 로 응시한다. 객관식 문항이 없는 과제는 이 단계를 건너뛴다
7. fork 루트에서 연 Claude Code 에 `/evaluate <과제>` 를 입력해 평가를 받는다
8. 평가가 남긴 결과 커밋을 `git push` 한다. 재평가가 나오면 "고칠 것" 을 반영해 커밋하고 6번부터 다시 한다

선수 관계는 권장 순서이고 잠금이 아니다. 대부분의 과제는 공식 구현(torchvision, Hugging Face, LeRobot, CleanRL 등)과
출력을 비교하는 평가 기준을 갖고 있다.

### 시작점과 채점용 test

과제 README 의 "시작점" 에 나오는 파일은 모두 과제 폴더에 들어 있다. 함수는 몸통이 `raise NotImplementedError` 인 stub
이라서, 이름과 signature 는 그대로 두고 몸통을 채운다. 과제는 채점용 `tests/` 가 있는지로 나뉜다.

| 구분 | 채점용 test 가 있는 과제 | 채점용 test 가 없는 과제 |
| --- | --- | --- |
| 과제 폴더 | stub 과 채점용 `tests/` | stub 과 직접 채울 test 파일(`test_*.py`) |
| 확인 방법 | `uv run pytest tests -x` | 평가 기준을 확인하는 test·script 를 직접 짜서 돌린다 |

`pytest -x` 는 처음 실패한 test 에서 멈추면서 그 test 가 부른 함수를 보여 주므로, 함수 하나를 채울 때마다 돌리면 다음에
채울 함수를 알 수 있다. 채점용 `tests/` 는 고치지 않고, 직접 쓰는 test 는 `tests/` 밖의 파일에 둔다. test 통과는 평가
기준의 하나일 뿐이고, 완료는 평가로만 기록된다.

### 앞 과제 코드의 재사용

앞 과제에서 짠 코드를 다시 쓰는 과제는 그 과제 폴더를 `sys.path` 에 더해 import 한다. 이 import 는 그 코드를 쓰는 stub
첫머리에 들어 있어서, 내가 풀어 둔 앞 과제 코드가 그대로 쓰이고 복사본을 따로 관리할 필요가 없다.

```python
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "forward-kinematics"))
from urdf import Robot  # forward-kinematics 과제의 코드
```

`append` 는 목록 끝에 더하므로 이름이 같은 파일이 있으면 지금 과제의 파일이 먼저 import 된다. 그래서 다른 과제가 import
하는 모듈은 리포 안에 같은 이름의 파일이 없고, 과제의 중심 모듈은 과제 이름(`gpt.py`·`ppo.py`·`rt1.py`)을, 나머지는 그
과제에만 있는 개념(`urdf.py`·`noise_schedule.py`·`gae.py`)을 이름으로 쓴다. 지금 과제에 파일을 새로 만들 때도 앞 과제 폴더에
있는 이름은 피한다. 앞 과제 코드가 쓰는 패키지가 지금 과제의 환경에 없으면 지금 과제 폴더에서 `uv add` 로 더한다.

## 평가

`.claude/skills/evaluate/` 의 평가 skill 이 Ecole 42 의 defense 처럼 과제 하나를 평가한다.

- **규칙 검사**: 과제의 "직접 짤 것" 을 library 호출로 대신하지 않았는지, 채점용 `tests/` 를 고치지 않았는지 본다
- **평가 기준 검사**: 제출 코드를 실행해 항목을 하나씩 판정한다. GPU 학습이나 실물 로봇처럼 그 자리에서 돌릴 수 없는
  항목은 커밋된 기록물(log, 결과 표, 그래프, 영상)로 판정한다
- **구두 평가**: "생각해 볼 질문" 과 과제 코드의 원리를 묻는다. `quiz.yaml` 이 있는 과제는 로컬 지도에서 원리마다 한
  문항씩 객관식으로 풀고, 제출하면 정답과 해설이 나온다. 재평가 때는 같은 원리를 다른 문항으로 묻는다. `quiz.yaml` 이
  없는 과제는 Claude Code 가 질문을 하나씩 묻고, 학습자는 코드를 보지 않고 답한다

필수 평가 기준을 모두 통과하고 구두 평가에서 틀리거나 설명하지 못한 답이 없으면 통과다. 객관식은 모든 문항을 맞혀야 한다. 결과는 `projects/<과제>/EVALUATION.md` 에
회차별로 쌓이고 `progress.yaml` 이 갱신된다. 학습 결과 기록물은 `projects/<과제>/results/` 처럼 과제 폴더 안에
커밋한다. `data/`·`outputs/`·`runs/`·`wandb/` 는 `.gitignore` 에 걸려 있어서 평가에 쓸 수 없다.

다른 리포에 이미 구현해 둔 것이 있으면 평가를 시작할 때 그 위치를 알려 주면 되고, 그 위치는 `progress.yaml` 의
`evidence` 에 링크로 남는다.

## 커리큘럼 업데이트 반영

과제 설명이나 stub·채점용 test 가 바뀌면 upstream 에서 받아 fork 에 합친다. GitHub 의 fork 페이지에 있는
**Sync fork** 버튼으로 합쳐도 되는데, 그때는 로컬에서 `git pull` 을 한 번 더 한다.

```bash
git pull --no-rebase upstream main
git push
```

내가 채운 stub 이나 직접 만든 파일을 커리큘럼도 고쳤으면 merge 충돌이 난다. 이때는 내 구현을 남기고 merge 를 마친다.

```bash
git checkout --ours projects/<과제>/<파일>
git add projects/<과제>/<파일>
git commit --no-edit
```

`uv add` 로 패키지를 더한 과제에서 `uv.lock` 이 충돌하면, `pyproject.toml` 을 먼저 손으로 합친 뒤 과제 폴더에서
`uv lock` 을 실행해 `uv.lock` 을 다시 만든다.

## 진행 기록 공유

fork 루트의 `progress.yaml` 이 진행 기록이다. 평가 skill 이 갱신하고, 시작한 과제는 직접 `status: in_progress` 로
적는다. 파일이 없으면 아래 모양으로 만든다.

```yaml
projects:
  perceptron:
    status: in_progress
  autograd:
    status: done # in_progress | done
    evaluated: 2026-10-21 # 마지막 평가 날짜
    commit: "1a2b3c4" # 평가한 commit
    evidence: # 다른 리포·정리 글 (선택)
      - title: 구현 정리 글
        url: https://example.com/autograd
```

push 한 뒤 지도 주소에 `?from=<계정>/<리포>` 를 붙이면 그 리포의 `progress.yaml` 로 진행 상태를 칠한 지도가 읽기
전용으로 열린다. 과제 창에는 평가 결과와 `EVALUATION.md`·구현 코드·evidence 링크가 붙는다. `&embed=1` 을 더하면
다른 페이지에 iframe 으로 넣기 좋은 모드가 되어, 처음 안내 창이 뜨지 않고 마우스 휠은 Ctrl(⌘) 을 누를 때만 확대·축소한다.

```text
https://woolimi.github.io/physical-ai-from-scratch/?from=<계정>/<리포>
https://woolimi.github.io/physical-ai-from-scratch/?from=<계정>/<리포>&embed=1
```

`?from=` 없이 지도를 열면 과제 창에서 진행 상태를 직접 바꿀 수 있고, 이 기록은 브라우저 localStorage 에만 저장된다.

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
| 시작점 | 과제 폴더에 들어 있는 파일 구조와 stub, 실행 명령 |
| 평가 기준 | 평가에서 하나씩 판정하는 항목 |
| 생각해 볼 질문 | 구두 평가에서 받는 질문 |
| 힌트 | 막혔을 때 펼쳐 보는 단서 |
| 참고 자료 | 논문, 강의, 참고 구현 |
| 남은 한계 | 이 과제로 풀리지 않는 문제와 이어지는 과제 |

## 지도 사이트

`site/` 는 `projects/` 의 frontmatter 를 읽어 holygraph 를 그리는 Vite + React 앱이다. `?from=` 이 있으면 그 리포의
`progress.yaml` 을 GitHub 에서 읽고, 없으면 브라우저 localStorage 의 진행 상태를 쓴다. localStorage 기록은 상단의
"진행 기록" 메뉴에서 JSON 파일로 옮길 수 있다. `npm run dev` 로 띄우면 `site/quiz-server.ts` 가 객관식 평가의 답안을
받아 `projects/<과제>/quiz-result.json` 에 쓰고, 배포본에는 이 기능이 없다.

```bash
cd site
npm install
npm run dev     # http://localhost:5173
npm test        # frontmatter·선수 관계·섹션 순서·시작점 파일·과제 환경·과제 사이 import·레이아웃·객관식 문항 검사
npm run build   # site/dist
```

`main` 에 push 하면 `.github/workflows/pages.yml` 이 테스트·빌드 후 GitHub Pages 에 배포한다.

## 과제 추가·수정

1. `projects/<id>/README.md` 를 만든다. 폴더 이름이 곧 `id` 다
2. frontmatter 에 `id`, `title`, `branch`, `requires`, `hours`, `summary`, `papers` 를 채운다
3. 본문은 위 섹션 순서를 따른다. 다른 과제는 `[제목](../<id>/README.md)` 로 링크한다
4. 과제 폴더에 [warmup](projects/warmup/pyproject.toml) 과 같은 모양의 `pyproject.toml` 을 두고 `uv lock` 으로 `uv.lock` 을
   만든다. 패키지는 "준비물" 과 맞춘다
5. "시작점" 의 파일을 모두 과제 폴더에 만든다. 함수는 몸통을 `raise NotImplementedError` 로 둔 stub 이고, 실행 script 는
   [warmup/plot.py](projects/warmup/plot.py) 처럼 `main()` 과 `__main__` guard 만 둔다. "시작점" 은 "아래 파일은 모두 리포에
   들어 있다." 로 시작하고, 파일 tree 에는 학습 결과물(그림·영상·checkpoint)을 넣지 않는다. 앞 과제의 코드를 쓰는 stub
   에는 그 과제 폴더를 `sys.path` 에 더하는 import 를 넣는다. 뒤 과제가 import 할 모듈과 그 모듈이 import 하는 같은 폴더의
   모듈은 리포 안에 같은 이름이 없게 짓고, `model`·`config`·`data` 같은 흔한 이름은 쓰지 않는다
6. 계산 결과가 하나로 정해지는 과제는 채점용 `tests/` 를 함께 둔다. `tests/conftest.py` 는
   [perceptron](projects/perceptron/tests/conftest.py) 의 것을 복사하고, test 는 torch·numpy 결과나 손으로 계산되는 값과
   비교한다. stub 에서는 모든 test 가 실패하고 정답 구현에서는 모두 통과하는지 확인하되, 정답 구현은 커밋하지 않는다
7. 설명을 돕는 그림은 `figures/` 에 SVG 로 두고 README 에서 `![설명](figures/<이름>.svg)` 로 넣는다. 지도의 과제 창이 어두운
   배경이라 [perceptron 의 그림](projects/perceptron/figures/perceptron.svg) 과 같은 어두운 카드와 색을 쓴다
8. `cd site && npm test` 로 선수 관계 순환, 없는 과제 참조, 섹션 누락, 시작점 tree 의 파일과 실제 파일의 불일치,
   `pyproject.toml`·`uv.lock` 누락, 과제 사이 import 의 이름 충돌과 `requires` 누락, 지도 라벨 겹침, `quiz.yaml` 형식을 검사한다
9. 구두 평가의 객관식 문항은 [warmup](projects/warmup/quiz.yaml) 과 같은 모양의 `quiz.yaml` 에 둔다. "생각해 볼 질문"
   하나와 과제 코드의 원리 하나가 각각 topic 이 되고, topic 마다 같은 원리를 다른 각도에서 묻는 variant 를 2개 이상 둔다.
   보기는 4개이고 `answer` 는 0부터 센 정답 번호다. 해설의 수치는 정답 구현으로 돌려 확인한다

branch 의 이름·색·배치는 [`projects/branches.yaml`](projects/branches.yaml) 에서 정한다.
