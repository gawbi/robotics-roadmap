import type { VideoScript } from '../script.ts'

// Numbers follow lessons/off-policy/README.md: the opening (CleanRL SAC 100 만 step, 1초에 10 번, 1,000,000 ÷ 10 = 100,000 초,
// 28 시간 가까이; DQN 2015 Atari 49 개; SERL 시연 20 개, 20 분, 100/100); table → network (CartPole 숫자 4 개, 10⁴ = 10,000 칸,
// 100⁴ = 1 억 칸; Q = w × x, x = 2, target 0.9, w 0.2 → 0.4, Q(1) 0.2 → 0.4, Q(3) 0.6 → 1.2, reward 최대 1); moving target
// (A: x 1 → 2, reward 0; B: x 2 → 충전기, reward 1; γ = 0.9, 진짜 Q(1) = 0.9; target 1.8 w, update 0/1/2: w 1, 1.4, 1.96, target
// 1.8, 2.52, 3.528, 차이 0.8, 1.12, 1.568, 새 w 1.4, 1.96, 2.744; 0.4 다가감, 0.72 달아남, 1.4 배; 차이 0.8 1.12 1.57 2.20);
// DQN (복사본 1 고정: 차이 0.8 0.4 0.2 0.1; update 10,000 번마다 복사, CleanRL dqn.py 500 step; τ = 0.005 → 0.5%; A 만:
// 1, 1.8, 3.24, 5.83; A + B: 0.76, 0.674, 0.643, 0.631 → 0.625; 250,000 × 32 ÷ 1,000,000 = 8; ablation table of 5 games
// 316.8 240.7 10.2 3.2 / 1006.3 831.4 141.9 29.1 / 7446.6 4102.8 2867.7 1453.0 / 2894.4 822.6 1003.0 275.8 / 1088.9 826.3
// 373.2 302.0); check question (r = 1, γ = 0.9, Q (6, 8) → 8.2, 8.2, 1); overestimation (진짜 1, ±0.3, 1.3 / 0.7, 큰 값
// 평균 1.15, 작은 값 평균 0.85); Double DQN (target (5.2, 4.6), online (4.4, 5.0) → 5.2 vs 4.6; 49 개, 93.5% → 114.7%; TD3
// 2018); actor-critic (Pendulum −2 ~ 2; Q = 1 − (a − 0.5)², −5.25 −1.25 0.75 0.75 −1.25, a = 0.5 에서 1; 5⁶ = 15,625; 걸음
// 0.25, a 0 → 0.25 → 0.375 → 0.4375, 0 + 0.25 × 1 = 0.25); SAC (entropy 0.693, 0.325, 0; α = 0.1 table p 1 / 0.9 / 0.731 /
// 0.5 → 1.0 / 1.0225 / 1.0313 / 1.0193, Q 기댓값 0.99 0.9731 0.95, entropy 0.582, 0.0325 0.0582 0.0693; soft target r 0, γ 0.9,
// d 0, α 0.1, 확률 0.5, critic 1.0 / 0.9 → 0.069, 0.969, 0.872; μ 0.2, σ 0.5, ε 0.6 → u 0.5, tanh 0.5 = 0.462, × 2 = 0.924;
// 목표 −dim A, Pendulum −1, HalfCheetah −6, α 0.2, η 0.1, entropy −1.5 → 0.25, −0.5 → 0.15); check question (0.25,
// ln 0.25 = −1.386 → 0.1386, 1.0386, 약 0.935); off-policy (Minitaur 160,000 step, episode 약 400 번, 약 2 시간; 밸브 PPO 7.4
// 시간, SAC 3 시간, 카메라 영상 300,000 step 약 20 시간); SERL / RLPD (batch 256 = 128 + 128, UTD ratio 20, critic 10 개 중
// 2 개; actor 10 Hz, impedance 1 kHz; PCB 20 / 20 분, cable routing 20 / 31 분, 물건 옮기기 20 / 105 분, 모두 100/100; BC 시연
// 100 개 10 배 낮음, 최대 3 배 빨리; HIL-SERL 시연 20 ~ 30 개, 13 개 100%, 1 ~ 2.5 시간, HG-DAgger 49.7%, 처음부터 0%); check
// question (20 × 60 = 1,200 초, 12,000 개, 12,000 × 20 = 240,000 번, 20 배).

const S1 = 'DQN 의 두 장치'
const S2 = 'overestimation'
const S3 = 'actor-critic·SAC'
const S4 = 'off-policy·SERL'

export const script: VideoScript = {
  id: 'off-policy',
  title: 'DQN → SAC',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/off-policy',
  sections: [S1, S2, S3, S4],
  terms: [
    ['impedance controller', '임피던스 컨트롤러'],
    ['bonus', '보너스'],
    ['sample efficiency', '샘플 이피션시'],
    ['clipped double Q', '클립드 더블 큐'],
    ['Policy Gradient', '폴리시 그래디언트'],
    ['generalization', '제너럴라이제이션'],
    ['online network', '온라인 네트워크'],
    ['overestimation', '오버에스티메이션'],
    ['target network', '타깃 네트워크'],
    ['moving target', '무빙 타깃'],
    ['entropy bonus', '엔트로피 보너스'],
    ['replay buffer', '리플레이 버퍼'],
    ['temperature', '템퍼러처'],
    ['environment', '인바이런먼트'],
    ['transition', '트랜지션'],
    ['off-policy', '오프 폴리시'],
    ['Double DQN', '더블 디큐엔'],
    ['on-policy', '온 폴리시'],
    ['HG-DAgger', '에이치지 대거'],
    ['UTD ratio', '유티디 레이쇼'],
    ['HIL-SERL', '힐 서얼'],
    ['Pendulum', '펜듈럼'],
    ['CartPole', '카트폴'],
    ['Breakout', '브레이크아웃'],
    ['Gaussian', '가우시안'],
    ['Minitaur', '미니토어'],
    ['learner', '러너'],
    ['process', '프로세스'],
    ['entropy', '엔트로피'],
    ['network', '네트워크'],
    ['Franka', '프랑카'],
    ['update', '업데이트'],
    ['weight', '웨이트'],
    ['target', '타깃'],
    ['critic', '크리틱'],
    ['reward', '리워드'],
    ['torque', '토크'],
    ['online', '온라인'],
    ['buffer', '버퍼'],
    ['actor', '액터'],
    ['state', '스테이트'],
    ['batch', '배치'],
    ['tanh', '탄에이치'],
    ['RLPD', '알엘피디'],
    ['SERL', '서얼'],
    ['kHz', '킬로헤르츠'],
    ['DQN', '디큐엔'],
    ['SAC', '에스에이씨'],
    ['TD3', '티디 쓰리'],
    ['PPO', '피피오'],
    ['PCB', '피씨비'],
    ['VLA', '브이엘에이'],
    ['max', '맥스'],
    ['RL', '알엘'],
    ['α', '알파'],
    ['γ', '감마'],
    ['μ', '뮤'],
    ['σ', '시그마'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'off-policy RL 은 겪은 경험을 replay buffer 에 쌓아 두고, 무작위로 꺼내 몇 번이고 다시 학습합니다.'],
        [4.2, 7.8, 'DQN 의 두 장치, max 의 overestimation, SAC 의 entropy bonus, 실물 로봇의 SERL 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '1초에 10 번 행동하는 실물 로봇이 100 만 step 을 겪으려면, 쉬지 않고 28 시간 가까이 움직여야 합니다.'],
        [4.4, 7.8, '겪은 경험과 사람의 시연을 버리지 않고 몇 번이고 다시 쓰면, 실물 로봇도 몇 시간 안에 배울 수 있을까요?'],
      ],
    },
    {
      id: 'moving-target',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.5, 'CartPole 의 state 는 숫자 네 개라서, 숫자마다 100 칸씩 자르면 칸이 1 억 개가 되어 대부분 비어 있습니다.'],
        [5.5, 11, '표 대신 weight 로 Q 를 계산합니다. 복도 예의 Q 는 w × x 이고, x 가 2 인 곳만 배워도 w 가 0.4 가 됩니다.'],
        [11, 16.5, 'x 가 1 과 3 인 곳의 Q 도 두 배가 되는 generalization 이 생겨, 최대 1 이어야 할 Q 가 1.2 가 됩니다.'],
        [16.5, 22.5, 'transition A 는 x 1 에서 2 로 갑니다. target 도 같은 w 로 계산하면 차이가 0.8 에서 1.12 로 커집니다.'],
        [22.5, 27.8, 'Q 가 0.4 다가갈 때 target 은 0.72 달아나서 w 가 1.4 배씩 커집니다. 이것이 moving target 입니다.'],
      ],
    },
    {
      id: 'dqn',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'DQN 은 target 을 weight 의 복사본인 target network 로 계산해, 차이를 0.8, 0.4, 0.2 로 줄입니다.'],
        [6, 12, '복사본은 가끔 옮겨 옵니다. DQN 논문은 update 10,000 번마다 복사했고, SAC 는 매 step 0.5% 씩 옮깁니다.'],
        [12, 18, 'replay buffer 는 transition 을 쌓아 무작위 batch 로 뽑아서, DQN 설정에서 하나를 평균 8 번 씁니다.'],
        [18, 24, 'A 만 배우면 복사본이 1.8 배씩 커지지만, B 와 섞으면 B 의 target 1 이 Q 를 붙잡아 0.625 로 모입니다.'],
        [24, 29.5, '두 장치를 모두 끄자 Breakout 점수는 316.8 에서 3.2 로 떨어졌고, 다섯 게임 모두 둘 다 쓸 때 가장 높았습니다.'],
      ],
    },
    {
      id: 'pause-target',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. r 은 1, γ 는 0.9, 다음 Q 는 6 과 8 입니다. 계속, 시간 제한, 쓰러짐일 때 target 은?'],
        [
          16.5,
          23.5,
          '계속되거나 시간 제한으로 끊기면 d 가 0 이라 1 + 0.9 × 8 = 8.2 이고, 막대가 쓰러지면 d 가 1 이라 1 입니다.',
          '계속되거나 시간 제한으로 끊기면 d 가 0 이라 1 더하기 0.9 곱하기 8 은 8.2 이고, 막대가 쓰러지면 d 가 1 이라 1 입니다.',
        ],
      ],
    },
    {
      id: 'overestimation',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'network 의 Q 에는 잡음이 섞입니다. 진짜 Q 가 1 인 두 action 이 같은 확률로 0.3 높거나 낮게 나온다고 합시다.'],
        [6.5, 13, '네 경우 가운데 셋에서 큰 값이 1.3 이라, max 로 고른 값의 평균은 1.15 로 진짜 1 보다 큽니다.'],
        [13, 19.5, '실제보다 크게 잡는 이 쏠림이 overestimation 이고, 그 값이 target 을 거쳐 앞 state 로 쌓입니다.'],
        [19.5, 25.5, 'action 이 많을수록 잡음이 위로 튄 action 이 하나쯤 있을 가능성이 커서, 쏠림도 그만큼 커집니다.'],
      ],
    },
    {
      id: 'double-q',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'DQN 의 target 은 action 고르기와 값 읽기를 target network 하나로 해서, 위로 튄 값을 그대로 씁니다.'],
        [6.5, 13, 'Double DQN 은 action 을 online network 로 고르고, 값은 잡음이 다른 target network 로 읽습니다.'],
        [13, 19.5, '같은 설정의 게임 49 개에서 사람 점수에 견준 점수의 중앙값이 93.5% 에서 114.7% 로 올랐습니다.'],
        [19.5, 27.5, 'TD3 와 SAC 는 critic 둘 중 작은 값을 쓰는 clipped double Q 를 씁니다. 그 평균은 0.85 로 조금 작습니다.'],
      ],
    },
    {
      id: 'pause-double',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. Q 가 target 쪽 5.2 와 4.6, online 쪽 4.4 와 5.0 이면 DQN 과 Double DQN 의 값은?'],
        [16.5, 23.5, 'DQN 은 큰 값 5.2 를 쓰고, Double DQN 은 online 이 고른 두 번째 action 의 값 4.6 을 씁니다.'],
      ],
    },
    {
      id: 'actor-critic',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'Pendulum 의 action 은 −2 에서 2 사이의 torque 라서, target 의 max 를 구하기 어렵습니다.'],
        [6, 12.5, '예로 든 Q 에 action −2, −1, 0, 1, 2 를 넣으면 최댓값이 0.75 지만, 실제로는 0.5 에서 1 입니다.'],
        [12.5, 18.5, '더 잘게 넣으면 계산이 늘어서, 관절 6 개인 팔은 관절마다 값 5 개만 넣어도 조합이 15,625 개입니다.'],
        [18.5, 24.5, '그래서 state 를 받아 action 을 내는 actor 와, 그 action 의 Q 를 내는 critic 을 함께 학습합니다.'],
        [24.5, 29.8, 'actor 는 Q 가 커지는 쪽으로 action 을 옮깁니다. 걸음 크기 0.25 면 0 이 0.25, 0.375, 0.4375 가 됩니다.'],
      ],
    },
    {
      id: 'sac',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'SAC 는 action 을 골고루 섞는 정도를 entropy 로 잽니다. 반반이면 0.693, 0.9 와 0.1 이면 0.325 입니다.'],
        [6.5, 12.5, 'α 배의 entropy 를 reward 에 더하면, Q 1.0 과 0.9, α 0.1 에서 p 0.731 이 가장 좋습니다.'],
        [12.5, 19, 'critic target 은 작은 critic 값 0.9 에 entropy bonus 0.069 를 더하고 0.9 를 곱한 0.872 입니다.'],
        [19, 25.5, 'tanh 로 묶은 Gaussian actor 는 μ 0.2, σ 0.5, ε 0.6 에서 u 0.5, torque 0.924 를 냅니다.'],
        [25.5, 31.8, 'temperature α 도 학습해서, entropy 가 목표 −1 보다 낮은 −1.5 면 α 를 0.2 에서 0.25 로 키웁니다.'],
      ],
    },
    {
      id: 'pause-sac',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 같은 예에서 뽑은 action 의 확률만 0.25 면 target 은? ln 0.25 는 −1.386 입니다.',
          '멈추고 적어 보기. 같은 예에서 뽑은 action 의 확률만 0.25 면 target 은? 자연로그 0.25 는 −1.386 입니다.',
        ],
        [
          16.5,
          23.5,
          'bonus 0.1 × 1.386 = 0.1386 을 더하면 1.0386 이고, target 은 0.9 × 1.0386, 약 0.935 입니다.',
          'bonus 0.1 곱하기 1.386, 0.1386 을 더하면 1.0386 이고, target 은 0.9 곱하기 1.0386, 약 0.935 입니다.',
        ],
      ],
    },
    {
      id: 'on-off',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'transition 은 environment 의 기록이라, 데이터를 모은 policy 와 배우는 policy 가 달라도 됩니다.'],
        [6.5, 13, 'PPO 같은 on-policy 는 policy 를 고치면 예전 데이터를 버리지만, off-policy 는 시연까지 buffer 에 넣어 씁니다.'],
        [13, 19.5, 'transition 하나를 여러 번 써서 sample efficiency 가 높고, step 마다 실제 시간이 드는 실물에서 유리합니다.'],
        [19.5, 27.5, 'SAC 로 Minitaur 는 약 2 시간에 걷기를 배웠고, 밸브 돌리기는 PPO 연구의 7.4 시간 대신 3 시간이 걸렸습니다.'],
      ],
    },
    {
      id: 'serl',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'SERL 은 SAC 를 고친 RLPD 로 배웁니다. batch 256 을 시연 데이터 128 개와 로봇이 모은 128 개로 채웁니다.'],
        [6, 12, 'step 하나마다 update 를 20 번 하고, critic 10 개 중 무작위 2 개의 작은 값을 써서 값이 튀지 않게 합니다.'],
        [12, 17.5, 'actor process 가 10 Hz 로 손끝 목표를 내면 impedance controller 가 1 kHz 로 따라갑니다.'],
        [17.5, 23.5, 'Franka 팔은 시연 20 개와 실물 학습 20 분으로 PCB 에 부품 꽂기를 100 번 중 100 번 성공했습니다.'],
        [23.5, 29.8, 'HIL-SERL 은 사람의 수정도 buffer 에 넣어, 작업과 세부 단계 13 개 모두에서 성공률 100% 를 냈습니다.'],
      ],
    },
    {
      id: 'pause-utd',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1초에 10 번 행동하는 로봇이 20 분 배우면 transition 수와, UTD ratio 20 의 update 수는?'],
        [
          16.5,
          23.5,
          '1,200 초 × 10 = 12,000 개이고, update 는 12,000 × 20 = 240,000 번으로 20 배입니다.',
          '1,200 초 곱하기 10 은 12,000 개이고, update 는 12,000 곱하기 20 은 240,000 번으로 20 배입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. target network 와 replay buffer 가 흔들림을 막아, 둘 다 끈 Breakout 은 3.2 로 떨어집니다.'],
        [4.2, 8.2, 'max 의 쏠림은 Double DQN 이 고르기와 읽기를 나눠 줄이고, TD3 와 SAC 는 작은 critic 값으로 줄입니다.'],
        [8.2, 12.2, 'SAC 는 reward 에 α 배의 entropy 를 더해 탐색을 policy 안에 넣고, α 도 목표에 맞춰 학습합니다.'],
        [12.2, 15.7, 'off-policy 라서 데이터를 버리지 않고, SERL 은 시연 20 개와 실물 20 분으로 PCB 꽂기를 100 번 모두 해냈습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [
          0.4,
          6.6,
          '다음은 policy 를 직접 고치는 Policy Gradient 와 PPO, VLA 를 RL 로 다듬는 VLA + RL 입니다.',
          '다음은 policy 를 직접 고치는 Policy Gradient 와 PPO, VLA 를 RL 로 다듬는 VLA 플러스 RL 입니다.',
        ],
      ],
    },
  ],
}
