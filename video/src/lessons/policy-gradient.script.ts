import type { VideoScript } from '../script.ts'

// Numbers follow lessons/policy-gradient/README.md: the driving question (0.02 초, 관절 12 개; Rudin 등 PPO, GPU 하나, 4 분);
// two machines (A 1 coin, B 0.5 × 4 = 2; argmax Q(A) = 1, Q(B) 0.99 → 1.01, 0 → 1; softmax θ −2 / −1 / 0 / 1 / 2 → π(B)
// 0.1192 / 0.2689 / 0.5 / 0.7311 / 0.8808); J = 1 + π(B) (θ = 0: J 1.5 → 1.5025 at +0.01, 0.0025 ÷ 0.01 = 0.25; η = 1 → θ
// 0.25, π(B) 0.5622; J between 1 and 2); check θ = 3 (e³ ≈ 20.09, 21.09, ≈ 0.953, ≈ 0.047); log-probability gradient (B 1 − π(B),
// A −π(B); θ = 0 ±0.5; θ = 2 +0.1192 / −0.8808; ln 0.5 = −0.6931); estimate r × ∇ ln π (θ = 0: A 0.5 / r 1 / −0.5, B 4 coins
// 0.25 / +2, B 0 coins 0.25 / 0; 0.5 × (−0.5) + 0.25 × 2 + 0.25 × 0 = 0.25); REINFORCE (1992 Williams; η = 0.1, 8 steps,
// step 1 0.1 × 4 × 0.5 = 0.2, π(B) 0.5498; π(B) 0.5 0.5498 0.5362 0.5362 0.5819 0.5677 0.6095 0.6095 0.6460; steps 2, 5
// A; trajectory 0.6 × 0.8 × 0.7 × 0.8 = 0.2688); check step 9 (θ 0.6015, π(B) 0.6460, 0.1 × 1 × (−0.6460) = −0.0646, 0.6015 −
// 0.0646 = 0.5369); baseline (θ = 0 mean 0.25, variance 1.0625, wrong sign 0.5; b = 1.5: +0.25 / +1.25 / −0.75, variance 0.5,
// wrong sign 0.25; +10 coins, 200 step × 4000 runs: no baseline 35.2% below 0.5, mean 0.644; running-mean baseline 0%, mean
// 0.934); advantage (Q − V; machines −0.5 / +0.5; V(s) = 40, G 30 / 50 → −10 / +10); actor-critic (1 + 0.99 × 9.5 − 10 =
// 1 + 9.405 − 10 = 0.405; critic 12 → 1 + 0.99 × 12 − 10 = 2.88); check critic 7 (1 + 6.93 − 10 = −2.07 vs 0.405); Gaussian
// policy (ANYmal C MLP 48 inputs, ELU 128 / 64 / 32, 12 outputs, 0.02 초; σ parameter × 12, init_noise_std = 1.0; a = μ + σε;
// action_scale = 0.5, 0.5 × 1 = 0.5 rad ≈ 28.6°; knee −0.8 rad, μ = 0.2, ε = 0.5 → a = 0.7, −0.8 + 0.5 × 0.7 = −0.45 rad,
// mean only −0.8 + 0.5 × 0.2 = −0.7 rad; (a − μ) ÷ σ² = (0.7 − 0.2) ÷ 1² = 0.5); check μ = −0.1, σ = 0.5, a = 0.4 (0.5 ÷ 0.25
// = 2); answer (1.0625 → 0.5); outro (PPO, World Model).

const S1 = '확률로 고르는 policy'
const S2 = 'REINFORCE'
const S3 = 'baseline 과 critic'
const S4 = 'Gaussian policy'

export const script: VideoScript = {
  id: 'policy-gradient',
  title: 'Policy Gradient',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/policy-gradient',
  sections: [S1, S2, S3, S4],
  terms: [
    ['log-derivative trick', '로그 데리버티브 트릭'],
    ['standard deviation', '스탠다드 디비에이션'],
    ['log-probability', '로그 프로버빌리티'],
    ['stochastic policy', '스토캐스틱 폴리시'],
    ['gradient ascent', '그래디언트 어센트'],
    ['policy gradient', '폴리시 그래디언트'],
    ['init_noise_std', '이닛 노이즈 에스티디'],
    ['value network', '밸류 네트워크'],
    ['hidden layer', '히든 레이어'],
    ['actor-critic', '액터 크리틱'],
    ['action_scale', '액션 스케일'],
    ['World Model', '월드 모델'],
    ['environment', '인바이런먼트'],
    ['trajectory', '트래젝토리'],
    ['REINFORCE', '리인포스'],
    ['parameter', '파라미터'],
    ['advantage', '어드밴티지'],
    ['ANYmal C', '애니멀 씨'],
    ['Gaussian', '가우시안'],
    ['baseline', '베이스라인'],
    ['variance', '배리언스'],
    ['Williams', '윌리엄스'],
    ['gradient', '그래디언트'],
    ['network', '네트워크'],
    ['softmax', '소프트맥스'],
    ['argmax', '아그맥스'],
    ['reward', '리워드'],
    ['rsl_rl', '알에스엘 알엘'],
    ['sample', '샘플'],
    ['critic', '크리틱'],
    ['weight', '웨이트'],
    ['agent', '에이전트'],
    ['state', '스테이트'],
    ['value', '밸류'],
    ['unit', '유닛'],
    ['bias', '바이어스'],
    ['MLP', '엠엘피'],
    ['PPO', '피피오'],
    ['rad', '라디안'],
    ['π(B)', '파이 비'],
    ['θ', '세타'],
    ['η', '에타'],
    ['γ', '감마'],
    ['μ', '뮤'],
    ['σ', '시그마'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'policy gradient 는 action 을 확률로 뽑고, 평균보다 점수가 좋았던 action 의 확률이 오르게 weight 를 고칩니다.'],
        [4.2, 7.8, '확률로 고르는 policy, REINFORCE, baseline 과 critic, Gaussian policy 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, '사족 보행 policy 는 0.02 초마다 관절 12 개의 목표 각도를 내지만, 정답 각도 없이 점수만 받습니다.'],
        [4.2, 7.8, '정답 없이 network 의 weight 를 어느 쪽으로 고쳐야 점수가 오르는지 어떻게 알 수 있을까요?'],
      ],
    },
    {
      id: 'softmax',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, '기계 A 는 늘 동전 1 개를 주고 B 는 0.5 의 확률로 4 개를 줘서, 기댓값은 A 는 1, B 는 2 입니다.'],
        [7, 14, 'argmax policy 는 B 의 평균 reward 가 0.99 에서 1.01 로 바뀌는 사이에 B 를 고를 확률이 0 에서 1 로 뜁니다.'],
        [14, 21, '그 밖에서는 확률이 변하지 않아 gradient 가 거의 모든 곳에서 0 이라, 어느 쪽으로 고칠지 모릅니다.'],
        [21, 27.7, 'softmax 로 B 의 점수 θ 를 확률로 바꾸면 θ 가 −1, 0, 1 일 때 0.2689, 0.5, 0.7311 로 부드럽게 바뀝니다.'],
      ],
    },
    {
      id: 'objective',
      seconds: 26,
      section: S1,
      cues: [
        [
          0.3,
          6.5,
          'policy 가 좋은지는 reward 의 기댓값 J 로 재고, 두 기계의 J 는 1 + π(B) 라서 1 과 2 사이입니다.',
          'policy 가 좋은지는 reward 의 기댓값 J 로 재고, 두 기계의 J 는 1 더하기 π(B) 라서 1 과 2 사이입니다.',
        ],
        [6.5, 13, 'θ 가 0 일 때 0.01 늘리면 J 가 1.5 에서 1.5025 가 되어, 0.0025 ÷ 0.01 로 gradient 는 0.25 입니다.'],
        [13, 19.5, 'J 는 클수록 좋아서 gradient 를 더하는 gradient ascent 로 고치고, η 가 1 이면 π(B) 는 0.5622 로 오릅니다.'],
        [19.5, 25.7, 'agent 는 기댓값을 모르고 당겨 본 결과인 sample 만 알아서, gradient 를 sample 로 추정해야 합니다.'],
      ],
    },
    {
      id: 'pause-softmax',
      seconds: 24,
      section: S1,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. θ 가 3 이면 B 를 고를 확률은 얼마일까요? e 의 3 제곱은 약 20.09 입니다.',
          '멈추고 적어 보기. θ 가 3 이면 B 를 고를 확률은 얼마일까요? 자연상수 e 를 세 번 곱하면 약 20.09 입니다.',
        ],
        [
          16.5,
          23.5,
          '분자는 약 20.09 이고 분모는 1 + 20.09 로 21.09 라서, B 의 확률은 약 0.953 이고 A 는 약 0.047 입니다.',
          '분자는 약 20.09 이고 분모는 1 더하기 20.09 로 21.09 라서, B 의 확률은 약 0.953 이고 A 는 약 0.047 입니다.',
        ],
      ],
    },
    {
      id: 'log-trick',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          6.3,
          '고른 action 의 log-probability 를 θ 로 미분하면 B 는 1 − π(B) 이고, A 는 −π(B) 입니다.',
          '고른 action 의 log-probability 를 θ 로 미분하면 B 는 1 빼기 π(B) 이고, A 는 마이너스 π(B) 입니다.',
        ],
        [6.3, 12.2, 'θ 가 2 면 자주 고르는 B 는 +0.1192 이고 드문 A 는 −0.8808 이라, 드문 action 에서 크게 움직입니다.'],
        [12.2, 18.2, 'log-derivative trick 으로 확률 하나를 밖으로 꺼내면, J 의 gradient 를 기댓값으로 쓸 수 있습니다.'],
        [18.2, 24.2, '모르는 기댓값 자리에 실제로 받은 reward r 을 넣어, r × log-probability gradient 로 추정합니다.'],
        [24.2, 29.7, 'θ 가 0 이면 추정은 −0.5, 2, 0 이 0.5, 0.25, 0.25 의 확률로 나와 평균이 진짜 값 0.25 입니다.'],
      ],
    },
    {
      id: 'reinforce',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'REINFORCE 는 sample 마다 θ 에 η × r × log-probability gradient 를 더하는 방법입니다.'],
        [7, 14, 'η 0.1 에서 step 1 에 B 로 4 개를 받으면 θ 는 0.1 × 4 × 0.5 로 0.2 이고, π(B) 는 0.5498 입니다.'],
        [14, 21, '여덟 step 뒤 π(B) 는 0.6460 이지만, A 를 고른 step 2 와 5 에도 reward 가 양수라 A 의 확률이 올랐습니다.'],
        [21, 27.7, '여러 step 의 trajectory 에서 바닥이 정하는 이동 확률 0.8 은 θ 와 상관없어서, 미분하면 사라집니다.'],
      ],
    },
    {
      id: 'pause-reinforce',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. step 8 뒤 θ 는 0.6015, π(B) 는 0.6460 입니다. 다음에 A 를 골라 1 개를 받으면 새 θ 는?'],
        [
          16.5,
          23.5,
          'A 의 gradient 가 −0.6460 이라 θ 는 0.0646 줄고, 0.6015 − 0.0646 으로 0.5369 가 됩니다.',
          'A 의 gradient 가 −0.6460 이라 θ 는 0.0646 줄고, 0.6015 빼기 0.0646 으로 0.5369 가 됩니다.',
        ],
      ],
    },
    {
      id: 'baseline',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.3, 'θ 가 0 일 때 추정의 평균은 0.25 인데 variance 는 1.0625 이고, 절반의 확률로 부호까지 틀립니다.'],
        [6.3, 12.2, 'action 과 상관없는 baseline 을 reward 에서 빼도, 기댓값은 그대로이고 흔들림만 줄어듭니다.'],
        [12.2, 18.2, 'baseline 1.5 를 빼면 추정이 0.25, 1.25, −0.75 로 모여서 variance 가 0.5 로 줄어듭니다.'],
        [18.2, 24.2, '동전을 10 개씩 더 준 문제를 baseline 없이 4000 번 학습하면 35.2% 가 더 나쁜 A 쪽으로 기울었습니다.'],
        [24.2, 29.7, '지금까지 받은 reward 의 평균을 baseline 으로 빼면 그런 판이 0% 였고, 평균 π(B) 는 0.934 였습니다.'],
      ],
    },
    {
      id: 'critic',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.3, 'state 마다 앞으로 받을 reward 가 달라서, state 의 value V 를 baseline 으로 쓰고 따로 학습합니다.'],
        [
          6.3,
          12.2,
          'advantage 는 Q − V 로 action 이 그 state 의 평균보다 얼마나 나은지를 나타내고, 두 기계에서 B 는 +0.5 입니다.',
          'advantage 는 Q 빼기 V 로 action 이 그 state 의 평균보다 얼마나 나은지를 나타내고, 두 기계에서 B 는 +0.5 입니다.',
        ],
        [
          12.2,
          18.2,
          'actor-critic 은 reward 하나와 critic 의 예측으로 1 + 0.99 × 9.5 − 10 = 0.405 를 얻습니다.',
          'actor-critic 은 reward 하나와 critic 의 예측으로 1 더하기 0.99 × 9.5 빼기 10 인 0.405 를 얻습니다.',
        ],
        [18.2, 24.2, '그 뒤 step 의 운이 섞이지 않아 variance 는 작지만, critic 이 12 로 틀리면 advantage 가 2.88 로 치우칩니다.'],
        [24.2, 29.7, '이 bias 는 운이 아니라 critic 의 값에서 와서, 여러 번 평균해도 사라지지 않습니다.'],
      ],
    },
    {
      id: 'pause-critic',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. reward 1, γ 0.99, 지금 예측 10 에서 critic 이 다음 value 를 7 로 내면 advantage 는?'],
        [
          16.5,
          23.5,
          '1 + 0.99 × 7 − 10 으로 −2.07 이라, 진짜 값 0.405 보다 작아 조금 나았던 action 의 확률을 내리게 됩니다.',
          '1 더하기 0.99 × 7 빼기 10 으로 −2.07 이라, 진짜 값 0.405 보다 작아 조금 나았던 action 의 확률을 내리게 됩니다.',
        ],
      ],
    },
    {
      id: 'gaussian',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'ANYmal C 보행 MLP 는 숫자 48 개를 받아 128, 64, 32 unit 을 거쳐 관절 12 개의 값을 냅니다.'],
        [6.5, 13, '출력이 연속된 숫자라 action 마다 확률을 적을 수 없어서, 평균 μ 와 표준편차 σ 의 Gaussian 에서 뽑습니다.'],
        [13, 19.5, 'rsl_rl 에서 MLP 출력 12 개는 관절마다 Gaussian 의 평균이 되고, σ 는 state 와 상관없는 parameter 입니다.'],
        [
          19.5,
          25.7,
          'σ 는 init_noise_std 1.0 에서 시작해 weight 와 함께 배우고, action 은 μ + σ × ε 으로 뽑습니다.',
          'σ 는 init_noise_std 1.0 에서 시작해 weight 와 함께 배우고, action 은 μ 더하기 σ × ε 으로 뽑습니다.',
        ],
      ],
    },
    {
      id: 'knee',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'action 에 0.5 를 곱해 기본 자세에 더한 값이 목표 각도라서, σ 가 1 이면 0.5 rad, 약 28.6° 만큼 흩어집니다.'],
        [7, 14, '기본 각도 −0.8 rad 인 무릎에서 μ 0.2, ε 0.5 면 action 은 0.7 이고, 목표 각도는 −0.45 rad 입니다.'],
        [
          14,
          21,
          '평균으로 미분한 gradient 는 (a − μ) ÷ σ² 로 0.5 라서, advantage 가 양수면 μ 가 0.7 쪽으로 갑니다.',
          '평균으로 미분한 gradient 는 a 빼기 μ 를 σ² 으로 나눈 0.5 라서, advantage 가 양수면 μ 가 0.7 쪽으로 갑니다.',
        ],
        [21, 27.7, '학습이 끝나 policy 를 실행할 때는 Gaussian 에서 뽑지 않고 평균 μ 를 그대로 써서, 목표 각도는 −0.7 rad 입니다.'],
      ],
    },
    {
      id: 'pause-gauss',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. μ −0.1, σ 0.5 에서 action 0.4 를 뽑았다면 평균의 gradient 는? advantage 가 음수면?'],
        [
          16.5,
          23.5,
          'a − μ 는 0.5, σ² 은 0.25 라서 gradient 는 2 이고, advantage 가 음수라 μ 는 줄어 0.4 에서 멀어집니다.',
          'a 빼기 μ 는 0.5, σ² 은 0.25 라서 gradient 는 2 이고, advantage 가 음수라 μ 는 줄어 0.4 에서 멀어집니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. softmax 로 action 을 확률로 뽑는 stochastic policy 는 θ 를 조금 바꾸면 확률도 조금 바뀝니다.'],
        [4.2, 8.2, 'REINFORCE 는 reward 에 log-probability gradient 를 곱해 고치므로, environment 를 몰라도 됩니다.'],
        [8.2, 12.2, 'baseline 은 variance 를 1.0625 에서 0.5 로 줄이고, critic 은 더 줄이는 대신 bias 가 생깁니다.'],
        [12.2, 15.7, '보행 policy 는 MLP 출력 12 개를 Gaussian 의 평균으로 쓰는 actor-critic 으로 배우고, 실행할 때는 평균만 씁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '같은 데이터로 여러 번 고치면서 policy 가 한 번에 너무 바뀌지 않게 막는 방법은 PPO 에서 다룹니다.'],
        [3.6, 6.6, 'environment 가 움직이는 방식을 따로 배워 직접 움직여 보는 횟수를 줄이는 방법은 World Model 에서 다룹니다.'],
      ],
    },
  ],
}
