import type { VideoScript } from '../script.ts'

// Numbers follow lessons/world-model/README.md: DayDreamer A1 (2022 년 6 월, SAC 1 시간 → 몸 굴리기에서 멈춤, Dreamer 1 시간 →
// 걸음; 1초에 20 번, 20 × 3,600 = 72,000; UR5 2 Hz, 8 시간, 1분에 2.5 개; XArm 약 0.5 Hz, 10 시간, 3.1 개; Sphero 2 Hz, 2 시간);
// rail world (칸 0 ~ 7, 충전기 칸 4, r = −|s' − 4|, 칸 1 + 1 → 칸 2, −2; −1 → 칸 0, −4; YOLO-World 2024 년 1 월); model-free vs
// model-based (후보 넷, 실제 step 12 번, 되돌리기 3 번; PlaNet episode 1,000 개 662 점 vs D4PG 100,000 개 524 점); latent
// (64 × 64 × 3 = 12,288, latent 30, 12,288 ÷ 30 ≈ 410; RSSM 확정 200 + 무작위 30 = 230); dynamics f = z + w × a, w = 1,
// 1 + 1 × 1 = 2, −|2 − 4| = −2; planning H = 3 from 칸 1 (A 2,3,4 −2,−1,0 합 −3; B −4; C −6; D −9), from 칸 3 (A −3, B −2, C 0,
// D −3), 3 × 3 × 3 = 27; CEM (H = 1, 정답 3, N(0, 2²), 후보 4 개, elite 2 개; μ 0 → 1.5 → 2.25 → 2.625, σ 2 → 0.5 → 0.25 → 0.125;
// rows −2,−1,1,2 / 1,1.5,2,2.5 / 2,2.25,2.5,2.75, elite 1,2 / 2,2.5 / 2.5,2.75); PlaNet CEM H = 12, 후보 1,000 개, 반복 10 번,
// elite 100 개, 1,000 × 10 × 12 = 120,000; check elite 3, 5 → μ (3 + 5) ÷ 2 = 4, σ 1; compounding (w = 1.5 → 2.5, 4, 5.5, 오차
// 0.5, 1, 1.5; predicted sums A −3, B −1.5, C −4.5, D −9 vs real −3, −4, −6, −9; VizDoom 2100 점); check w = 0.8 → 0.8, 1.6, 2.4,
// 3.2, 오차 −0.8, step 마다 −0.2; MPC (칸 1 → 2 → 3 → 4 → 4, picks B C C D, −2 − 1 + 0 = −3 vs −2 − 1 − 1 = −4); horizons
// (PlaNet 12, Dreamer 15, TD-MPC2 3, V-JEPA 2-AC 1); reward extrapolation (칸 0 ~ 3 −4, −3, −2, −1, r = z − 4, 칸 6 +2 vs −2);
// Dreamer (15 step, 과제 20 개, 500 만 step 823 점 vs D4PG 1 억 step 786 점; DreamerV3 2023 년 1 월 150 개); video models (Genie
// 2024 년 2 월, 3 만 시간, 11B, 160 × 90 = 14,400 pixel, 8 가지 latent action; Genie 3 2025 년 8 월 24 frame, 720p, 몇 분;
// Cosmos 2025 년 1 월, 약 2,000 만 시간, clip 약 1 억 개; DreamGen 시연 2,884 개, 새 동작 14 개 43.2%, 새 환경 28.5%, 0%); V-JEPA 2
// (2025 년 6 월, 컵 pick-and-place Cosmos 0% vs 80%, 16 초 vs 4 분 = 240 초, 240 ÷ 16 = 15 배).

const S1 = 'world model 의 입출력'
const S2 = 'planning 과 CEM'
const S3 = '오차 누적과 MPC'
const S4 = 'Dreamer 와 영상 model'

export const script: VideoScript = {
  id: 'world-model',
  title: 'World Model',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/world-model',
  sections: [S1, S2, S3, S4],
  terms: [
    ['pick-and-place', '픽 앤 플레이스'],
    ['representation', '레프리젠테이션'],
    ['dynamics model', '다이내믹스 모델'],
    ['reward model', '리워드 모델'],
    ['World Models', '월드 모델스'],
    ['world model', '월드 모델'],
    ['World Model', '월드 모델'],
    ['model-based', '모델 베이스드'],
    ['model-free', '모델 프리'],
    ['V-JEPA 2-AC', '브이 제파 투 에이씨'],
    ['YOLO-World', '욜로 월드'],
    ['DayDreamer', '데이드리머'],
    ['controller', '컨트롤러'],
    ['simulator', '시뮬레이터'],
    ['transition', '트랜지션'],
    ['GR00T N1', '그루트 엔원'],
    ['planning', '플래닝'],
    ['DreamGen', '드림젠'],
    ['TD-MPC2', '티디 엠피씨 투'],
    ['horizon', '호라이즌'],
    ['VizDoom', '비즈둠'],
    ['planner', '플래너'],
    ['dataset', '데이터셋'],
    ['Dreamer', '드리머'],
    ['cheetah', '치타'],
    ['Cosmos', '코스모스'],
    ['PlaNet', '플래닛'],
    ['latent', '레이턴트'],
    ['reward', '리워드'],
    ['critic', '크리틱'],
    ['Genie', '지니'],
    ['actor', '액터'],
    ['elite', '엘리트'],
    ['batch', '배치'],
    ['value', '밸류'],
    ['pixel', '픽셀'],
    ['frame', '프레임'],
    ['model', '모델'],
    ['D4PG', '디포피지'],
    ['CEM', '씨이엠'],
    ['MPC', '엠피씨'],
    ['GPU', '지피유'],
    ['SAC', '에스에이씨'],
    ['IDM', '아이디엠'],
    ['VLA', '브이엘에이'],
    ['A1', '에이원'],
    ['2D', '투디'],
    ['RL', '알엘'],
    ['μ', '뮤'],
    ['σ', '시그마'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'World Model 은 행동을 넣으면 다음 장면을 예측하는 model 을 배워, 그 안에서 행동을 미리 비교합니다.'],
        [4.2, 7.8, 'world model 의 입출력, planning 과 CEM, 오차 누적과 MPC, Dreamer 와 영상 model 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '2022 년 DayDreamer 실험에서 SAC 로 1 시간 학습한 4 다리 로봇 A1 은 몸을 굴리는 데까지만 배웠습니다.'],
        [4.4, 7.8, '움직이기 전에 그 결과를 컴퓨터 안에서 먼저 계산해 보면, 같은 1 시간으로 더 많이 배울 수 있을까요?'],
      ],
    },
    {
      id: 'rail',
      seconds: 27,
      section: S1,
      cues: [
        [0.3, 6.5, 'world model 은 지금 상태와 행동을 받아 다음 상태를 예측하는 모델이고, 대개 reward 도 함께 예측합니다.'],
        [6.5, 13, '여덟 칸 레일의 칸 4 에 충전기가 있고, reward 는 충전기에서 떨어진 칸 수에 마이너스를 붙인 값입니다.'],
        [13, 20, '칸 1 에서 +1 을 넣으면 칸 2 와 reward −2 를 예측해야 하고, 행동이 다르면 예측도 달라집니다.'],
        [20, 26.7, 'YOLO-World 는 행동도 미래도 없어서 world model 이 아니고, 물리 simulator 는 사람이 물리 식으로 만듭니다.'],
      ],
    },
    {
      id: 'latent',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'model-free RL 은 실제로 해 본 결과로만 배우고, model-based RL 은 world model 안에서 먼저 비교합니다.'],
        [7, 14, 'cheetah 달리기에서 PlaNet 은 episode 1,000 개로 662 점, D4PG 는 100,000 개로 524 점을 냈습니다.'],
        [14, 21, '64 × 64 컬러 이미지는 숫자 12,288 개인데, PlaNet 은 이를 숫자 30 개짜리 latent 로 줄여 그 위에서 예측합니다.'],
        [21, 27.7, 'dynamics model f 는 action 을 받아 다음 latent 를 예측하고, reward model g 는 reward 를 냅니다.'],
      ],
    },
    {
      id: 'pause-io',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 로봇이 칸 1 에 있을 때 world model 에 action −1 을 넣으면 무엇을 예측해야 할까요?'],
        [
          16.5,
          23.5,
          '다음 이미지에서 로봇은 칸 0 에 있고, reward 는 −|0 − 4| 로 −4 라고 예측해야 합니다. 출력은 늘 미래입니다.',
          '다음 이미지에서 로봇은 칸 0 에 있고, reward 는 0 빼기 4 의 절댓값에 마이너스를 붙인 −4 라고 예측해야 합니다. 출력은 늘 미래입니다.',
        ],
      ],
    },
    {
      id: 'plan',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'planning 은 행동열 후보를 world model 안에서 rollout 해 보고, 예측 reward 합이 가장 큰 후보를 고릅니다.'],
        [7, 14, '칸 1 에서 horizon 3 이면 A 의 합은 −3 이고 B 는 −4, C 는 −6, D 는 −9 라서 A 를 고릅니다.'],
        [14, 21, '같은 후보로 칸 3 에서 출발하면 한 칸 가서 멈추는 C 가 합 0 으로 가장 좋아서, planning 은 매번 새로 합니다.'],
        [21, 27.7, 'planning 은 만든 후보 안에서만 고르고, 행동이 연속이거나 horizon 이 길면 모두 넣어 볼 수 없습니다.'],
      ],
    },
    {
      id: 'cem',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'CEM 은 정규분포에서 후보를 뽑아 점수를 매기고, 좋은 elite 의 평균과 표준편차로 분포를 다시 맞춥니다.'],
        [7, 13.5, '칸 1 에서 H 가 1 이면 정답 action 은 3 이고, 평균 0, 표준편차 2 에서 후보 4 개를 뽑아 상위 2 개를 남깁니다.'],
        [13.5, 20.5, '반복마다 평균은 0 에서 1.5, 2.25, 2.625 로 3 에 다가가고, 표준편차는 2 에서 0.125 까지 좁아집니다.'],
        [20.5, 27.7, 'PlaNet 은 H 12, 후보 1,000 개, 반복 10 번이라 실제 step 하나에 latent 예측을 120,000 번 합니다.'],
      ],
    },
    {
      id: 'pause-cem',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. CEM 의 어떤 반복에서 elite 가 3 과 5 였다면, 새 평균 μ 와 표준편차 σ 는 얼마일까요?'],
        [
          16.5,
          23.5,
          '평균은 (3 + 5) ÷ 2 로 4 이고, 두 elite 가 평균에서 1 씩 떨어져 있어서 표준편차는 1 입니다.',
          '평균은 3 더하기 5 를 2 로 나눈 4 이고, 두 elite 가 평균에서 1 씩 떨어져 있어서 표준편차는 1 입니다.',
        ],
      ],
    },
    {
      id: 'compound',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'world model 이 잘못 배워 w 가 1.5 라면, 칸 1 에서 +1 을 세 번 넣은 예측은 2.5, 4, 5.5 가 됩니다.'],
        [7, 14, '실제 칸과의 오차는 0.5, 1, 1.5 로 커지고, rollout 을 따라 쌓이는 이 오차를 compounding error 라고 합니다.'],
        [14, 21, '이 model 로는 B 의 예측 합이 −1.5 로 가장 커서 B 를 고르지만, 실제 합은 −4 로 A 의 −3 보다 나쁩니다.'],
        [21, 27.7, 'VizDoom 의 world model 안에서만 배운 controller 는 가상 환경 2100 점, 실제 게임에선 무작위보다 낮았습니다.'],
      ],
    },
    {
      id: 'mpc',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.8, 'MPC 는 매 step 지금 이미지로 planning 하고, 행동열의 첫 action 하나만 실제로 한 뒤 다시 계획합니다.'],
        [6.8, 13, 'w 가 1.5 인 model 로도 로봇은 칸 1, 2, 3, 4 로 가서 머물고, 처음 세 step 의 실제 합은 −3 입니다.'],
        [13, 19.5, '상상 속 rollout 은 PlaNet 12, Dreamer 15, TD-MPC2 3 step 으로 짧게 두고 그 너머는 value 로 씁니다.'],
        [
          19.5,
          25.8,
          '무작위 action 으로 칸 0 ~ 3 만 본 reward model 은 직선 z − 4 를 배워 칸 6 에서 +2 를 예측합니다.',
          '무작위 action 으로 칸 0 에서 3 까지만 본 reward model 은 직선 z 빼기 4 를 배워 칸 6 에서 +2 를 예측합니다.',
        ],
        [25.8, 31.7, '그래서 world model 을 학습하는 일과 planner 로 실제 데이터를 더 모으는 일을 번갈아 되풀이합니다.'],
      ],
    },
    {
      id: 'pause-drift',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. w 가 0.8 인 world model 로 칸 0 에서 +1 을 네 번 넣으면, 넷째 step 의 예측과 오차는?'],
        [16.5, 23.5, '예측은 step 마다 0.8 씩 늘어 3.2 이고, 실제 칸 4 와의 오차는 −0.8 로 step 마다 −0.2 씩 쌓였습니다.'],
      ],
    },
    {
      id: 'dreamer',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'Dreamer 는 actor 의 action 으로 15 step 을 상상하고, 그 너머는 critic 의 value 로 대신합니다.'],
        [7, 14, '이미지 연속 제어 과제 20 개에서 Dreamer 는 500 만 step 뒤 823 점, D4PG 는 1 억 step 뒤 786 점입니다.'],
        [14, 21, 'DayDreamer 저자들은 simulator 없이 실제 로봇 네 대에서 Dreamer 를 학습했고, A1 은 1 시간 만에 일어나 걸었습니다.'],
        [21, 27.7, 'actor 는 상상으로 배우지만, 그 상상을 만드는 world model 은 실제로 모은 transition 으로 계속 고칩니다.'],
      ],
    },
    {
      id: 'video',
      seconds: 32,
      section: S4,
      cues: [
        [
          0.3,
          6.8,
          '최근에는 영상 수만 ~ 수천만 시간으로 다음 장면을 pixel 그대로 그리는 큰 영상 생성 모델을 world model 로 씁니다.',
          '최근에는 영상 수만에서 수천만 시간으로 다음 장면을 pixel 그대로 그리는 큰 영상 생성 모델을 world model 로 씁니다.',
        ],
        [6.8, 13, 'Genie 는 2D 게임 영상 3 만 시간으로 학습했고, 두 frame 사이의 변화를 8 가지로 나눠 action 처럼 씁니다.'],
        [13, 19.5, 'DreamGen 은 만든 영상에 IDM 으로 action 을 붙여 GR00T N1 을 학습했고, 새 동작 14 개에서 평균 43.2% 였습니다.'],
        [19.5, 25.8, 'V-JEPA 2-AC 는 representation 만 예측하고, 컵 pick-and-place 성공률은 Cosmos 0% 대 80% 였습니다.'],
        [25.8, 31.7, 'action 하나를 고르는 데 V-JEPA 2-AC 는 16 초, Cosmos 는 4 분이 걸려서 240 ÷ 16 으로 15 배 짧았습니다.'],
      ],
    },
    {
      id: 'pause-steps',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. DayDreamer 의 A1 은 1초에 20 번 명령을 받습니다. 1 시간 동안의 실제 step 은 몇 번일까요?'],
        [16.5, 23.5, '1 시간은 3,600 초라서 20 × 3,600 으로 72,000 번입니다. A1 은 이만큼의 실제 step 으로 걷기를 배웠습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. world model 은 latent 와 action 으로 다음 latent 와 reward 를 예측해 행동을 미리 비교합니다.'],
        [4.2, 8.2, 'planning 은 후보의 예측 reward 합을 비교하고, CEM 은 elite 로 분포를 좁혀 가며 좋은 후보를 찾습니다.'],
        [8.2, 12.2, '예측 위에 예측을 쌓으면 오차가 0.5, 1, 1.5 로 커지므로, rollout 을 짧게 두고 MPC 로 매 step 다시 계획합니다.'],
        [12.2, 15.7, 'Dreamer 는 상상 속 학습으로 A1 을 1 시간 만에 걷게 했고, V-JEPA 2-AC 는 16 초에 action 을 골랐습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [
          0.4,
          6.6,
          '시연으로 배운 VLA 를 simulator 나 실제 로봇에서 받은 reward 로 더 학습하는 방법은 VLA + RL 에서 다룹니다.',
          '시연으로 배운 VLA 를 simulator 나 실제 로봇에서 받은 reward 로 더 학습하는 방법은 VLA 플러스 RL 에서 다룹니다.',
        ],
      ],
    },
  ],
}
