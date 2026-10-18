---
name: evaluate
description: Physical AI from Scratch 과제 평가. 학습자 리포에서 과제 하나의 구현을 그 과제 README 의 "목표"·"평가 기준"·"생각해 볼 질문" 으로 평가하고, 결과를 projects/<id>/EVALUATION.md 와 progress.yaml 에 기록한다. "/evaluate <과제 id>", "평가해 줘", "이 과제 평가 받을게", "<과제> 다 했어" 같은 요청에 쓴다.
argument-hint: <과제 id>
---

# 과제 평가

과제 하나를 Ecole 42 의 defense 처럼 평가한다. 평가자는 제출된 코드를 실행해 "평가 기준" 을 하나씩 판정하고, 학습자에게
"생각해 볼 질문" 과 코드에 관한 질문을 직접 물어 이해했는지 확인한다. 통과해야만 progress.yaml 의 상태가 `done` 이 된다.

## 평가자 원칙

- 학습자의 코드를 고치지 않는다. 고칠 점은 기록에만 남긴다.
- 구두 평가 중에는 답이나 힌트를 주지 않고, 판정을 마친 뒤에 해설한다.
- 모든 판정에 근거(실행한 명령과 출력, 파일 경로와 줄, 수치)를 붙인다. 근거가 없으면 통과가 아니다.
- 평가 기준의 수치(80% 이상, 1e-6 이내 등)는 적힌 그대로 적용하고 완화하지 않는다.
- 커밋된 상태만 평가한다.

## 진행 순서

### 1. 대상 확인

1. 인자로 받은 과제 id 의 `projects/<id>/README.md` 를 읽는다. id 가 없으면 progress.yaml 에서 `in_progress` 인 과제를
   보여 주고 고르게 한다.
2. 제출물은 `projects/<id>/` 에서 `README.md`·`EVALUATION.md`·`tests/`·`figures/` 를 뺀 파일이고, 학습자가 채운 stub
   파일도 여기에 든다. `pyproject.toml`·`uv.lock` 은 과제 환경이라 제출물 판정에서 뺀다. 학습자가 다른 리포나 경로에 이미 구현해 둔 것이 있다고 하면 그 위치를 제출물로 보고,
   기록과 progress.yaml 의 `evidence` 에 남긴다.
3. `git status --porcelain -- projects/<id>` 에 변경이 있으면 커밋부터 요청하고 멈춘다. 평가할 commit 은
   `git rev-parse --short HEAD` 다. 다른 리포가 제출물이면 기록에는 그 리포의 commit 을 적고, progress.yaml 의 `commit` 은
   비워 둔다(지도가 `commit` 으로 이 리포의 `projects/<id>/` 를 링크하기 때문이다).
4. 제출물이 비어 있으면 평가하지 않고 끝낸다. 커리큘럼 원본은 아래 `git fetch` 로 늘 받아 둔다(2단계의 test 비교에
   쓴다). 제출물이 `projects/<id>/` 이면 아래 diff 로 제출물이 원본 그대로인지 보고, 0 으로 끝나면(손대지 않은 stub)
   역시 평가하지 않는다. 학습자 리포가 커리큘럼과 history 를 공유하지 않아 `merge-base` 가
   실패하면 `FETCH_HEAD` 와 바로 비교한다.

   ```bash
   git fetch --quiet https://github.com/woolimi/physical-ai-from-scratch.git main
   git diff --quiet "$(git merge-base HEAD FETCH_HEAD || echo FETCH_HEAD)" HEAD -- projects/<id> \
     ':!projects/<id>/tests' ':!projects/<id>/README.md' ':!projects/<id>/EVALUATION.md' ':!projects/<id>/figures' \
     ':!projects/<id>/pyproject.toml' ':!projects/<id>/uv.lock'
   ```

### 2. 규칙 검사

"목표" 의 **직접 짤 것** 이 library 호출로 대체되지 않았는지 import 와 호출을 훑는다. **가져다 써도 되는 것** 은 검산·비교
용도로만 쓰였는지 본다. 위반이 있으면 그 부분과 관련된 평가 기준을 미흡으로 판정한다.

채점용 `tests/` 가 있는 과제는 학습자가 test 를 고치지 않았는지 1단계에서 받은 커리큘럼 원본과 비교한다. 아래 출력이
비어 있어야 하고, 바뀌거나 추가된 파일이 있으면 그 test 가 확인하는 평가 기준을 미흡으로 판정한다. 학습자가 따로 쓴 test 는
`tests/` 밖에 둔다.

```bash
git diff --stat "$(git merge-base HEAD FETCH_HEAD || echo FETCH_HEAD)" HEAD -- projects/<id>/tests
```

다만 `merge-base` 가 실패해 `FETCH_HEAD` 와 바로 비교한 경우의 차이는 학습자가 고친 것인지 커리큘럼이 나중에 test 를
고친 것인지 가릴 수 없으므로 미흡으로 판정하지 않는다. 학습자에게 아래 명령으로 최신 채점 test 를 받아 커밋하게 하고
(`--no-overlay` 라서 원본에 없는 파일은 지워진다), 새 commit 으로 1단계부터 다시 시작한다.

```bash
git checkout --no-overlay FETCH_HEAD -- projects/<id>/tests
```

### 3. 평가 기준 검사

"평가 기준" 의 항목을 하나씩 판정한다.

- **실행 확인**: 이 자리에서 돌릴 수 있는 항목은 제출된 test·script 를 실행하고, 명령과 핵심 출력을 근거로 남긴다.
  명령은 학습자와 같이 과제 폴더를 cwd 로 두고 그 폴더의 환경에서 돌도록 `uv run --directory projects/<id> <명령>` 으로
  실행한다. 채점용 `tests/` 가 있으면 `uv run --directory projects/<id> pytest tests` 부터 돌려 passed·failed 수를 남기고,
  학습자가 `tests/` 밖에 쓴 test 는 따로 돌려 해당 `(선택)` 항목의 근거로만 쓴다. 채점용 `tests/` 가 없는 과제는 학습자가
  쓴 `test_*.py` 가 평가 기준을 확인하는 test 이므로, 그 test 가 기준이 요구하는 내용을 실제로 확인하는지 읽어 본 뒤 돌린
  결과를 해당 항목의 근거로 쓴다. 제출물이 다른 위치에 있어 채점용 test 를 그대로 돌릴 수 없으면 test 가 확인하는 내용을
  평가용 script 로 확인한다.
  제출물에 없는 확인 코드가 필요하면 평가용 script 를 scratch 위치에 따로 써서 돌리고, 학습자 리포에는 넣지 않는다.
- **기록 확인**: GPU 학습, 실물 로봇, 수 시간 걸리는 rollout 처럼 이 자리에서 돌릴 수 없는 항목은 제출된 기록물(log,
  결과 표, 그래프, 영상, W&B 링크)로 판정한다. 기록물의 조건(seed, 데이터, step 수)이 기준과 같은지도 확인한다.
  기록물이 없으면 확인 불가이고, 확인 불가는 미흡이다.
- `(선택)` 이 붙은 항목은 판정해서 기록하되 통과 여부에는 넣지 않는다.

항목마다 **통과** 또는 **미흡** 이다.

### 4. 구두 평가

질문은 "생각해 볼 질문" 전부와, 제출 코드에서 고른 질문 2개다. 코드 질문은 특정 줄을 가리켜 그 줄이 하는 일, 그 줄을
지우거나 바꾸면 생기는 일을 묻는다.

- 한 번에 하나씩 묻고 학습자의 답을 기다린다. 학습자는 코드와 자료를 보지 않고 답한다.
- 답마다 판정한다.
  - **충분**: 핵심 원리와 조건을 맞게 설명했다
  - **보완**: 방향은 맞지만 빠진 조건이나 부정확한 부분이 있다
  - **부족**: 틀렸거나 설명하지 못했다
- 판정과 해설은 질문을 모두 마친 뒤에 한꺼번에 준다.

### 5. 판정

필수 평가 기준을 모두 통과하고 구두 평가에 **부족** 이 없으면 **통과**, 그 밖은 **재평가** 다. 재평가는 고칠 것을 반영한 새
commit 에서 처음부터 다시 하고, 구두 질문은 같은 원리를 다른 각도에서 묻는다.

### 6. 기록

`projects/<id>/EVALUATION.md` 에 회차를 추가한다. 최신 회차가 위에 오고, 파일이 없으면 첫 줄 `# <과제 제목> 평가` 로 만든다.

```markdown
# Autograd 평가

## 2회차 — 통과

- 날짜: 2026-10-21
- commit: `1a2b3c4`
- 제출물: `projects/autograd/`

### 평가 기준

| 기준 | 판정 | 근거 |
| --- | --- | --- |
| `uv run pytest tests` 전부 통과 | 통과 | 23 passed, `tests/` 는 원본과 같음 |
| (선택) make_moons decision boundary | 미흡 | 제출물에 없음 |

### 구두 평가

| 질문 | 판정 | 요약 |
| --- | --- | --- |
| gradient 를 더해야 하는 이유 | 충분 | 합 공식의 두 경로를 들어 설명 |
| `engine.py:41` 의 `+=` 를 `=` 로 바꾸면 | 보완 | 결과는 맞혔지만 `b = a + a` 사례를 들지 못함 |

### 고칠 것

- 없음
```

그다음 리포 루트의 `progress.yaml` 을 갱신한다. 파일이 없으면 만든다. 다른 과제의 기록과 기존 `evidence` 는 그대로 둔다.

```yaml
projects:
  autograd:
    status: done # 통과면 done, 재평가면 in_progress
    evaluated: 2026-10-21
    commit: "1a2b3c4" # 따옴표 필수. 숫자로만 된 hash 가 number 로 읽히지 않게
    evidence: # 다른 리포·글이 제출물이거나 결과를 정리한 글이 있을 때만
      - title: scalar autograd 구현 정리
        url: https://example.com/blog/autograd
```

### 7. 커밋

```bash
git add projects/<id>/EVALUATION.md progress.yaml
git commit -m "Evaluate <id>: pass"   # 재평가면 "Evaluate <id>: retry"
```

push 는 학습자가 한다. push 하면 몇 분 안에 `?from=<owner>/<repo>` 지도에 반영된다는 것과, 재평가라면 고칠 것 목록을 마지막에
다시 알려 준다.
