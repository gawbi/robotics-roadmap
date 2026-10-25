---
title: 1D Kalman filter 직접 구현
summary: NumPy 로 예측·보정 cycle 을 짜고, 측정 noise 를 바꿔 가며 Kalman gain 이 어떻게 달라지는지 확인
lessons: [kalman-filter]
stack: [Python, NumPy, Matplotlib]
---

# 1D Kalman filter 직접 구현

<!--
labs/<이름>/README.md 로 복사해서 씁니다(예: labs/kalman-1d/README.md). 코드와 결과 그림은 같은 폴더에 둡니다.
frontmatter 의 lessons 에 적은 강의마다 "구현" 탭에 이 글이 나오고, 지도의 그 강의 원에 마름모 표시가 붙습니다.
dataset·checkpoint·학습 로그(data/, outputs/, runs/, *.pt 등)는 .gitignore 에 있어 커밋되지 않습니다.
-->

## 무엇을 만들었나

무엇을, 왜 만들었는지 두세 문장으로 씁니다.

## 실행 방법

```bash
cd labs/kalman-1d
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 결과

![측정값, 추정값, 실제값을 함께 그린 그래프](result.png)

숫자로 말합니다. 예: 측정만 쓸 때 RMSE 0.52 m → filter 를 거치면 0.18 m.

## 강의와 다르게 해 본 것

- 강의에 없던 조건(noise 크기, 초기값, 다른 dataset)을 바꿔 보고 무엇이 달라졌는지

## 막혔던 점과 해결

- 
