import type { VideoScript } from '../script.ts'

// Numbers follow lessons/reward-scale/README.md: potential-based shaping (F = γΦ(s') − Φ(s); γ = 1; Φ(s) = −(목표까지 거리),
// 출발 거리 3 → Φ(s0) = −3, 목표 Φ = 0; 곧장 3 → 2 → 1 → 0 은 +1, +1, +1 로 합 3; 돌아서 3 → 2 → 3 → 2 → 1 → 0 은 +1, −1, +1,
// +1, +1 로 합 3; 0 − (−3) = 3; Q*shaped = Q* − Φ(s); Ng 등 1999, Wiewiora 2003; check 4 → 3 → 4 → 3 → 2 → 1 → 0: +1, −1,
// +1, +1, +1, +1 = 4, 0 − (−4) = 4); constant shift (continuing task 에서 c ÷ (1 − γ); step 마다 −1 미로 5 step −5, 10 step
// −10; 2 를 더해 +1 → 5, 10; Naik 격자 −1 의 평균을 빼면 0; Kostrikov 등 2019; Hopper healthy_reward 기본값 1; Pardo 등 2018
// PPO γ = 1; legged_gym only_positive_rewards = True, 음수 합 → 0; Unitree G1 alive 0.15; check −0.5 + 1 = 0.5, 3 × 0.5 =
// 1.5, 8 × 0.5 = 4, 원래 −1.5, −4); reward scale (Q 1, 2, α = 1: 배율 0.1 → Q 0.1, 0.2, 확률 0.475, 0.525; 배율 1 → 0.269,
// 0.731; 배율 10 → Q 10, 20, 0.00005, 0.99995; reward × 10 = α ÷ 10; SAC Table 2: Hopper-v1, Walker2d-v1, HalfCheetah-v1,
// Ant-v1 5, Humanoid-v1 20, Humanoid (rllab) 10; check Q 0, 1, α = 0.5: 지수 0, 2, 7.39 ÷ 8.39 ≈ 0.88; 2 배 → 지수 0, 4,
// 54.6 ÷ 55.6 ≈ 0.98); clipping and Pop-Art (DQN 양수 → 1, 음수 → −1, Mnih 등 2015; Ms. Pac-Man 유령 100 이상, 알약 25 → 모두 1;
// (y − μ) ÷ σ; h = 2, W = 1, b = 0, σ = 10, μ = 0 → 10 × (1 × 2 + 0) + 0 = 20; σ = 20, μ = 5 → W = 1 × 10 ÷ 20 = 0.5, b = (0 + 0
// − 5) ÷ 20 = −0.25, 20 × (0.5 × 2 − 0.25) + 5 = 20; 57 개 중 32 개, 중앙값 0.4%, 평균 34%; gradient norm 여섯 / 네 / 두 자릿수;
// van Hasselt 등 2016); reward centering (Naik 등 2024; 평균 ← 평균 + β(R − 평균); 평균 1, γ 0.99 → 1 ÷ 0.01 = 100; 3-state
// table γ 0.8: 6.15, 3.93, 4.92 / 1.15, −1.07, −0.08; 0.9: 11.07, 8.97, 9.96 / 1.07, −1.03, −0.04; 0.99: 101.01, 98.99, 99.99 /
// 1.01, −1.01, −0.01; 101.01 − 98.99 = 2.02, 1% → 약 1, 같은 1% → 0.01; 상수 −8 ~ 8; Φ(s) = r(π) ÷ (1 − γ); check 평균 2, γ 0.95
// → 2 ÷ 0.05 = 40 → 0).

const S1 = 'shaping 과 Q 초기화'
const S2 = '상수와 생존 보너스'
const S3 = '배율과 temperature'
const S4 = 'Pop-Art · 평균 빼기'

export const script: VideoScript = {
  id: 'reward-scale',
  title: 'Reward Scale & Shaping',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/reward-scale',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Reward Scale & Shaping', '리워드 스케일 앤 셰이핑'],
    ['potential-based shaping', '포텐셜 베이스드 셰이핑'],
    ['reward centering', '리워드 센터링'],
    ['continuing task', '컨티뉴잉 태스크'],
    ['RL Experiments', '알엘 익스페리먼츠'],
    ['healthy_reward', '헬시 리워드'],
    ['learning rate', '러닝 레이트'],
    ['local minimum', '로컬 미니멈'],
    ['hyperparameter', '하이퍼파라미터'],
    ['deterministic', '디터미니스틱'],
    ['Ms. Pac-Man', '미즈 팩맨'],
    ['legged_gym', '레기드 짐'],
    ['Q-learning', '큐 러닝'],
    ['temperature', '템퍼러처'],
    ['terminated', '터미네이티드'],
    ['truncated', '트렁케이티드'],
    ['Gymnasium', '짐나지움'],
    ['centering', '센터링'],
    ['Kostrikov', '코스트리코프'],
    ['Wiewiora', '비에비오라'],
    ['Humanoid', '휴머노이드'],
    ['humanoid', '휴머노이드'],
    ['Pop-Art', '팝아트'],
    ['learner', '러너'],
    ['transition', '트랜지션'],
    ['shift', '시프트'],
    ['scale', '스케일'],
    ['shaping', '셰이핑'],
    ['entropy', '엔트로피'],
    ['penalty', '페널티'],
    ['network', '네트워크'],
    ['Unitree', '유니트리'],
    ['episode', '에피소드'],
    ['update', '업데이트'],
    ['reward', '리워드'],
    ['return', '리턴'],
    ['Hopper', '호퍼'],
    ['critic', '크리틱'],
    ['target', '타깃'],
    ['policy', '폴리시'],
    ['action', '액션'],
    ['Atari', '아타리'],
    ['state', '스테이트'],
    ['alive', '얼라이브'],
    ['Pardo', '파르도'],
    ['Naik', '나이크'],
    ['seed', '시드'],
    ['step', '스텝'],
    ['DQN', '디큐엔'],
    ['SAC', '쌕'],
    ['PPO', '피피오'],
    ['G1', '지원'],
    ['Ng', '응'],
    ['RL', '알엘'],
    ['Φ', '파이'],
    ['γ', '감마'],
    ['α', '알파'],
    ['μ', '뮤'],
    ['σ', '시그마'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'reward 를 고칠 때 shaping 은 함수를 더하고, shift 는 상수를 더하고, scale 은 수를 곱합니다.'],
        [4.2, 7.8, '어떤 변환은 최적 행동을 그대로 두고 학습만 빠르게 하지만, 어떤 변환은 최적 행동 자체를 바꿉니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '로봇 RL 에서는 목표에 가까워지면 점수를 더 주고, 넘어지지 않은 step 마다 1 씩 주고, 10 으로 나눕니다.'],
        [4.4, 7.8, 'SAC 처럼 entropy 를 함께 키우는 알고리즘까지 생각하면, 어떤 변환이 무엇을 바꿀까요?'],
      ],
    },
    {
      id: 'telescoping',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'potential-based shaping 은 state 마다 점수 Φ 를 정하고, transition 마다 F 를 reward 에 더합니다.'],
        [7, 13.5, 'Ng 등은 이 꼴로 더한 shaping 이 최적 policy 를 바꾸지 않는다는 것을 증명했습니다.'],
        [13.5, 20.5, 'Φ 를 목표까지 거리에 마이너스를 붙인 값으로 두면, 거리 3 에서 곧장 가는 경로는 +1 을 세 번 받습니다.'],
        [20.5, 27.7, '한 번 돌아가면 멀어진 step 이 −1 을 받아 앞의 +1 을 되돌리므로, 합은 경로와 상관없이 3 입니다.'],
      ],
    },
    {
      id: 'q-init',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'shaping 을 더한 문제의 최적 Q 는 원래 최적 Q 에서 그 state 의 Φ 를 뺀 값이라, 가장 큰 action 이 그대로입니다.'],
        [6.5, 12.5, 'Wiewiora 는 shaping 을 받는 learner 와, shaping 없이 Q 의 시작값을 Φ 만큼 올린 learner 를 비교했습니다.'],
        [12.5, 18.5, '같은 learning rate 로 같은 순서의 경험을 받으면, 두 learner 의 Q 값 update 는 매번 똑같습니다.'],
        [18.5, 24.5, '그래서 Q 값을 표로 저장하는 Q-learning 에서는 shaping 대신 Q 를 Φ 로 초기화하면 됩니다.'],
        [24.5, 29.7, '목표 가까운 Q 를 처음부터 높게 둔 것과 같아서, shaping 은 탐색을 그쪽으로 먼저 끌어 학습을 빠르게 합니다.'],
      ],
    },
    {
      id: 'pause-shaping',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 출발점 거리가 4 이고 4 → 3 → 4 → 3 → 2 → 1 → 0 으로 가면 shaping 점수의 합은 얼마일까요?'],
        [16.5, 23.5, 'F 는 +1, −1, +1, +1, +1, +1 이라 합은 4 이고, 0 에서 처음 Φ 인 −4 를 빼도 4 라서 곧장 갔을 때와 같습니다.'],
      ],
    },
    {
      id: 'shift-maze',
      seconds: 28,
      section: S2,
      cues: [
        [
          0.3,
          7,
          '끝없이 이어지는 continuing task 에서 상수 c 를 더하면 가치가 모두 c ÷ (1 − γ) 만큼 올라, 순서는 그대로입니다.',
          '끝없이 이어지는 continuing task 에서 상수 c 를 더하면 가치가 모두 c 를 1 빼기 γ 로 나눈 만큼 올라, 순서는 그대로입니다.',
        ],
        [7, 13.5, 'episode 가 끝나는 문제는 다릅니다. step 마다 −1 인 미로에서는 5 step 경로가 −5, 10 step 경로가 −10 입니다.'],
        [13.5, 20.5, '모든 reward 에 2 를 더해 step 마다 +1 이 되면 5 step 은 5, 10 step 은 10 이라서 긴 경로가 더 좋아집니다.'],
        [20.5, 27.7, 'Naik 등의 예에서도 step 마다 −1 인 격자에서 평균을 빼면 모든 reward 가 0 이 되어, 모든 policy 가 최적이 됩니다.'],
      ],
    },
    {
      id: 'survival',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'Gymnasium 의 Hopper 는 넘어지지 않은 step 마다 healthy_reward 기본값 1 을 받고, 이 값이 생존 보너스입니다.'],
        [6.5, 12.5, '그래서 넘어져 끝난 terminated 와 시간 제한으로 끊긴 truncated 를 구분해야 합니다.'],
        [12.5, 18.5, 'Pardo 등의 실험에서 남은 시간을 모르는 PPO 는 γ 가 1 일 때 생존 reward 를 모으려고 제자리에 머물렀습니다.'],
        [18.5, 24.5, 'legged_gym 은 reward 합이 음수면 0 으로 잘라, penalty 를 덜 받으려고 일찍 넘어지는 문제를 피합니다.'],
        [24.5, 29.7, '반대로 Unitree 의 humanoid G1 학습 설정은 살아 있는 step 마다 0.15 를 주는 alive 항을 둡니다.'],
      ],
    },
    {
      id: 'pause-shift',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. step 마다 −0.5 인 reward 에 1 을 더하면, 3 step 과 8 step 경로의 return 은 얼마일까요?'],
        [16.5, 23.5, 'step 마다 0.5 가 되어 3 step 은 1.5, 8 step 은 4 입니다. 원래 −1.5 와 −4 에서 긴 경로가 더 좋아집니다.'],
      ],
    },
    {
      id: 'softmax',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, '모든 reward 에 양수를 곱하면 모든 return 도 같은 배수가 되어, 일반 RL 의 최적 policy 는 그대로입니다.'],
        [6.5, 13.5, 'SAC 의 policy 는 Q 가 큰 action 일수록 확률이 커서, Q 차이가 temperature α 보다 얼마나 큰지가 중요합니다.'],
        [13.5, 20.5, 'Q 값이 1 과 2 이고 α 가 1 이면 확률은 0.269 와 0.731 이고, 배율 0.1 이면 0.475 와 0.525 로 거의 고릅니다.'],
        [20.5, 27.7, '배율 10 이면 Q 값이 10 과 20 이 되어 확률이 0.00005 와 0.99995 로, 거의 한쪽만 고릅니다.'],
      ],
    },
    {
      id: 'sac-scale',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'reward 에 10 을 곱하는 것은 α 를 10 으로 나누는 것과 같아서, 배율은 temperature 의 역수 역할을 합니다.'],
        [6.5, 12.5, '배율이 작으면 policy 가 고르게 퍼져 reward 를 활용하지 못하고, 크면 탐색이 모자라 나쁜 local minimum 에 빠집니다.'],
        [12.5, 18.5, 'SAC 의 저자들은 reward 배율이 조정이 필요한 유일한 hyperparameter 였다고 적고, 환경마다 5, 10, 20 을 썼습니다.'],
        [18.5, 24.5, '후속 논문은 reward 크기가 과제마다 다르고 학습 중에도 바뀐다는 점을 들어 temperature 를 자동으로 조정합니다.'],
        [24.5, 29.7, '자동 조정을 쓰면 배율의 영향이 줄지만, critic 이 다루는 값의 크기는 여전히 배율을 따라갑니다.'],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. Q 값이 0 과 1 이고 α 가 0.5 면 좋은 action 의 확률은 얼마일까요? reward 를 2 배 하면요?'],
        [
          16.5,
          23.5,
          '지수 0 과 2 에서 7.39 ÷ 8.39 로 약 0.88 이고, 2 배면 지수 0 과 4 에서 54.6 ÷ 55.6 으로 약 0.98 입니다.',
        ],
      ],
    },
    {
      id: 'popart',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'DQN 에서는 양수 reward 를 1 로 자르고 음수를 −1 로 잘라, 모든 Atari 게임에 같은 learning rate 를 썼습니다.'],
        [6.5, 12.5, '자르기는 비율을 바꿉니다. Ms. Pac-Man 의 유령 100 이상과 알약 25 가 모두 1 이 되어 유령을 더 노리지 않습니다.'],
        [12.5, 18.5, 'Pop-Art 는 target 의 평균 μ 와 표준편차 σ 를 이동 평균으로 추적하고, network 는 정규화한 target 을 배웁니다.'],
        [18.5, 24.5, 'σ 가 10 에서 20, μ 가 0 에서 5 로 바뀌면 마지막 층을 W 0.5, b −0.25 로 고쳐 출력 20 을 지킵니다.'],
        [24.5, 29.7, 'Pop-Art 는 57 개 게임 중 32 개에서 자른 경우와 같거나 나았고, 점수 중앙값은 0.4%, 평균은 34% 올랐습니다.'],
      ],
    },
    {
      id: 'centering',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'reward centering 은 지금까지 받은 reward 의 평균을 추정해 두고, 받은 reward 에서 그 평균을 빼고 학습합니다.'],
        [
          6.5,
          12.5,
          '가치에는 평균 reward 를 1 − γ 로 나눈 공통 항이 있어서, 평균 1 에 γ 0.99 면 1 ÷ 0.01 로 100 입니다.',
          '가치에는 평균 reward 를 1 빼기 γ 로 나눈 공통 항이 있어서, 평균 1 에 γ 0.99 면 1 ÷ 0.01 로 100 입니다.',
        ],
        [12.5, 18.5, 'γ 0.99 인 state 세 개 순환 문제에서 A, B 의 가치는 101.01, 98.99 이고, 평균을 빼면 1.01, −1.01 입니다.'],
        [18.5, 24.5, 'A 와 B 의 차이 2.02 앞에서 1% 오차는 약 1 이지만, 평균을 뺀 가치에서는 같은 1% 오차가 0.01 에 그칩니다.'],
        [24.5, 29.7, '상수를 더해도 평균을 뺀 가치는 그대로입니다. 다만 끝없이 이어지는 문제를 위한 방법입니다.'],
      ],
    },
    {
      id: 'pause-center',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 평균 reward 가 2 인 끝없이 이어지는 문제에서 γ 가 0.95 면, 공통 항은 얼마이고 평균을 빼면 어떻게 될까요?'],
        [
          16.5,
          23.5,
          '공통 항은 2 ÷ (1 − 0.95) 로 40 이고, 평균 2 를 빼면 평균 reward 가 0 이라 공통 항도 0 이 됩니다.',
          '공통 항은 2 를 1 빼기 0.95 로 나눈 40 이고, 평균 2 를 빼면 평균 reward 가 0 이라 공통 항도 0 이 됩니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, 'potential-based shaping 은 합이 경로와 상관없어 최적 policy 를 지키고, Q 를 Φ 로 초기화한 것과 같습니다.'],
        [4.2, 8.2, '상수를 더하면 episode 가 끝나는 문제에서 생존 보너스나 penalty 가 되어, −1 에 2 를 더한 미로는 긴 경로가 낫습니다.'],
        [8.2, 12.2, '양수 배율은 일반 RL 의 최적 policy 를 지키지만, SAC 에서는 temperature 의 역수처럼 작동해 policy 를 바꿉니다.'],
        [
          12.2,
          15.7,
          '±1 자르기는 비율을 바꾸고, Pop-Art 는 출력을 지켜 정규화하고, centering 은 100 근처 가치를 0 근처로 옮깁니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 강의 RL Experiments 에서는 이런 변환이 정말 도움이 됐는지, seed 를 몇 개 써서 비교할지를 숫자로 봅니다.']],
    },
  ],
}
