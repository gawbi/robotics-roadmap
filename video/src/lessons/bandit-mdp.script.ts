import type { VideoScript } from '../script.ts'

// Numbers follow lessons/bandit-mdp/README.md and its figures: FetchReach (0.05 m, 0 / −1 per step, 25 moves a second, 50
// moves an episode); legged_gym (0.02 s, 0.99); two machines (A 1 coin → 1 × 1 = 1; B 4 coins at 0.5 → 4 × 0.5 + 0 × 0.5 = 2;
// 100 pulls; greedy start Q(A) = 1, Q(B) = 0, loses B with probability 0.5); ε-greedy (ε = 0.1 → 0.9 + 0.05 = 0.95 / 0.05,
// 0.95 × 2 + 0.05 × 1 = 1.95; ε = 0.5 → 0.75 × 2 + 0.25 × 1 = 1.75; ε = 1 → 1.5); UCB (t = 100, c = 2: A 1.5 + 0.48 = 1.98
// at N 80, B 1.2 + 1.11 = 2.31 at N 15, C 0.5 + 1.92 = 2.42 at N 5; N × 4 → bonus ÷ 2; UCB1 c = √2); 10-arm testbed (2000
// problems, 1000 steps, last 100 steps: greedy 1.04 / 37%, ε 0.1 1.39 / 80%, UCB 1.50 / 86%, ± 0.03; ε cap 91%); check
// question (c = 1, ln t = 4; X Q 2 N 16 → 1 × √(4 ÷ 16) = 0.5 → 2.5; Y Q 1 N 1 → 2 → 3); 3×3 gridworld (cell 3 +1, cell 5 −1,
// start 7; slip 0.8 / 0.1 / 0.1, 1 × 0.8 + 0 × 0.1 + (−1) × 0.1 = 0.7); return γ = 0.9 (0.729, 0.590, −0.9; 0.9 / 0.81 /
// 0.729); control period (γ 0.99: 69 steps, 0.02 s → 1.38 s, 0.005 s → 0.34 s; 0.9975 → 277 steps, 1.38 s; 1 ÷ (1 − 0.99) =
// 100 steps = 2 s / 0.5 s); FetchReach rewards (sparse −1 outside 0.05 m, 0.2 m and 0.1 m both −1; dense 0.2 m → −0.2, 0.1 m →
// −0.1); Ng 1999 bicycle; check question (25 Hz, γ 0.96, 0.96^17 ≈ 0.50, 1 ÷ 25 = 0.04 s, 17 × 0.04 = 0.68 s, 100 Hz γ⁴ =
// 0.96, 0.99⁴ ≈ 0.961 → γ ≈ 0.99); value / Bellman (V(4) = 0 + 0.9 × 0.9 = 0.81; chain 0.729, 0.81, 0.9, 1, 0; Q(1, a) 0.9 /
// 0.729 / 0.81); value iteration (sweep table 1 → 4, sweep 5 residual 0; slippery residual 0.7, 0.504, 0.263, threshold
// 0.0001, stops at sweep 12; slippery γ 0.99 V* 0.8974 etc., cells 2, 4, 6, 8 face the wall); check question (V₂(4) = V₂(8) =
// 0, sweep 4: 0.9 × 0.81 = 0.729); Q-learning (7 × 4 = 28 entries; Q 0.5, target 0.9, TD error 0.4, α 0.1 → 0.04 → 0.54;
// targets 1, 1, −1, 1, 1: α 1 → 1, α 0.5 → 0.72, α 1/n → (1 + 1 − 1 + 1 + 1) ÷ 5 = 0.6; α = 1 episodes 1, 0.9, 0.81, 0.729;
// α 0.5, ε 0.2, 3000 episodes); check question (Q(4, ·) 0.81 / 0.6 / 0.7 / −1, Q(1, 아래) 0.5, γ 0.9, α 0.5 → 0.9 × 0.81 =
// 0.729, 0.729 − 0.5 = 0.229, 0.5 + 0.5 × 0.229 = 0.6145); summary (50 Hz, γ 0.99 → 약 1.4 초); 9 cells vs 48 numbers.

const S1 = 'ε-greedy · UCB'
const S2 = 'MDP · reward · γ'
const S3 = 'Bellman 과 value'
const S4 = 'Q-learning'

export const script: VideoScript = {
  id: 'bandit-mdp',
  title: 'Bandits & MDPs',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/bandit-mdp',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Bellman optimality equation', '벨만 옵티멀리티 이퀘이션'],
    ['reinforcement learning', '리인포스먼트 러닝'],
    ['Policy Gradient', '폴리시 그래디언트'],
    ['value iteration', '밸류 이터레이션'],
    ['neural network', '뉴럴 네트워크'],
    ['Bandits & MDPs', '밴디츠 앤 엠디피스'],
    ['exploitation', '익스플로이테이션'],
    ['exploration', '익스플로레이션'],
    ['Q-learning', '큐 러닝'],
    ['off-policy', '오프 폴리시'],
    ['FetchReach', '페치 리치'],
    ['gridworld', '그리드 월드'],
    ['TD error', '티디 에러'],
    ['ε-greedy', '엡실론 그리디'],
    ['residual', '레지듀얼'],
    ['Bellman', '벨만'],
    ['bandit', '밴딧'],
    ['greedy', '그리디'],
    ['reward', '리워드'],
    ['return', '리턴'],
    ['sparse', '스파스'],
    ['target', '타깃'],
    ['agent', '에이전트'],
    ['bonus', '보너스'],
    ['dense', '덴스'],
    ['sweep', '스윕'],
    ['value', '밸류'],
    ['state', '스테이트'],
    ['UCB', '유씨비'],
    ['MDP', '엠디피'],
    ['DQN', '디큐엔'],
    ['SAC', '색'],
    ['arm', '암'],
    ['Ng', '응'],
    ['V*', '브이 스타'],
    ['γ', '감마'],
    ['α', '알파'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Bandits & MDPs 는 정답 없이 점수만 보고 행동을 배우는 reinforcement learning 의 기초를 다룹니다.'],
        [4.2, 7.8, 'ε-greedy 와 UCB, MDP 와 reward 설계, value 와 Bellman 식, Q-learning 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'FetchReach 의 로봇 팔은 손끝이 목표에서 0.05 m 안이면 0 점을, 그 밖이면 −1 점을 받습니다.'],
        [4.4, 7.8, '닿기 전까지 점수가 늘 −1 이라면, 지나온 움직임 가운데 무엇이 좋았는지 어떻게 알 수 있을까요?'],
      ],
    },
    {
      id: 'greedy',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '기계 B 는 0.5 의 확률로 동전 4 개를 줘서 기댓값이 2 이고, 늘 1 개를 주는 기계 A 의 두 배입니다.'],
        [6, 11.5, 'agent 는 이 확률을 모르므로, 지금까지 그 기계에서 받은 reward 의 평균을 추정값 Q 로 씁니다.'],
        [11.5, 17.5, '첫 시도에서 B 가 0 개를 주면 greedy 는 Q 가 큰 A 만 당겨서, 절반의 확률로 더 좋은 기계를 버립니다.'],
        [17.5, 23.8, 'ε-greedy 는 확률 ε 으로 무작위로 고르는데, ε 이 0.1 이면 B 를 0.95 의 확률로 골라 기댓값이 1.95 입니다.'],
        [23.8, 29.7, 'exploration 이 많을수록 좋은 것은 아니어서, ε 이 0.5 이면 기댓값이 1.75 로 떨어집니다.'],
      ],
    },
    {
      id: 'ucb',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'UCB 는 덜 당긴 arm 일수록 추정값에 bonus 를 크게 더하고, 더한 값이 가장 큰 arm 을 고릅니다.'],
        [6, 12, 't 가 100, c 가 2 일 때 80 번 당긴 A 의 bonus 는 0.48 이지만, 다섯 번 당긴 C 의 bonus 는 1.92 입니다.'],
        [12, 17.5, '그래서 UCB 는 추정값이 가장 작은 C 를 고르고, C 를 당길수록 bonus 는 줄어듭니다.'],
        [17.5, 23.5, 'arm 이 10 개인 문제 2000 개를 1000 step 씩 풀어, 마지막 100 step 의 평균 reward 를 비교합니다.'],
        [23.5, 29.7, 'greedy 1.04, ε-greedy 1.39, UCB 1.50 이고, 가장 좋은 arm 을 고른 비율은 37%, 80%, 86% 입니다.'],
      ],
    },
    {
      id: 'pause-ucb',
      seconds: 24,
      section: S1,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. c 가 1 이고 ln t 가 4 일 때, arm X 와 Y 가운데 UCB 와 greedy 는 각각 무엇을 고를까요?',
          '멈추고 적어 보기. 씨 가 1 이고 로그 티 가 4 일 때, arm X 와 Y 가운데 UCB 와 greedy 는 각각 무엇을 고를까요?',
        ],
        [
          16.5,
          23.5,
          'X 는 2 + 0.5 로 2.5, Y 는 1 + 2 로 3 이라 UCB 는 Y 를 고르고, greedy 는 Q 가 큰 X 를 고릅니다.',
          'X 는 2 더하기 0.5 로 2.5, Y 는 1 더하기 2 로 3 이라 UCB 는 Y 를 고르고, greedy 는 Q 가 큰 X 를 고릅니다.',
        ],
      ],
    },
    {
      id: 'grid',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '3×3 gridworld 에서 청소기는 칸 7 에서 출발하고, 충전기인 칸 3 은 +1, 계단인 칸 5 는 −1 을 주고 끝납니다.'],
        [7, 14, '바닥이 미끄러우면 고른 방향으로 0.8, 직각으로 0.1 씩 가서, 칸 2 에서 오른쪽의 reward 기댓값은 0.7 입니다.'],
        [14, 20.5, '늦게 받는 reward 일수록 step 마다 γ 를 곱해 깎아서 더하고, 이 합을 return 이라 합니다.'],
        [20.5, 27.7, 'γ 가 0.9 면 칸 7 에서 4 step 에 닿는 return 은 0.729, 6 step 은 0.590, 계단에 빠지면 −0.9 입니다.'],
      ],
    },
    {
      id: 'horizon',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'γ 는 step 마다 곱하므로, 0.99 를 0.02 초마다 곱하면 69 step 인 1.38 초 뒤에 0.5 가 됩니다.'],
        [6, 12, '같은 γ 를 0.005 초마다 곱하면 0.34 초 만에 0.5 가 되어, γ 를 0.9975 로 올려야 시간이 같아집니다.'],
        [12, 18, 'FetchReach 의 sparse reward 는 0.2 m 와 0.1 m 가 똑같이 −1 이라, 처음에는 갈 방향의 단서가 없습니다.'],
        [18, 24, 'dense reward 는 거리에 마이너스를 붙인 값이라 가까워질수록 커져서, 매 step 갈 방향을 알려 줍니다.'],
        [24, 29.7, 'Ng 등이 든 자전거는 다가갈 때만 점수를 받자, 출발점 근처에서 작은 원을 도는 법을 배웠습니다.'],
      ],
    },
    {
      id: 'pause-hz',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 25 Hz 에서 γ 0.96 은 17 step 에 0.5 가 됩니다. 몇 초이고, 100 Hz 의 γ 는 얼마일까요?'],
        [
          16.5,
          23.5,
          '한 step 이 0.04 초라서 17 × 0.04 로 0.68 초이고, 100 Hz 에서는 γ⁴ 이 0.96 이 되는 약 0.99 입니다.',
          '한 step 이 0.04 초라서 17 × 0.04 로 0.68 초이고, 100 Hz 에서는 γ 를 네 번 곱해 0.96 이 되는 약 0.99 입니다.',
        ],
      ],
    },
    {
      id: 'bellman',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'value 는 그 칸에서 출발해 policy 를 따를 때 받을 return 의 기댓값이고, 그 칸에서 받는 reward 가 아닙니다.'],
        [7, 13.5, '칸 4 에서 위로 가면 칸 1 에 닿아서, 칸 4 의 value 는 0 에 0.9 × 0.9 를 더한 0.81 입니다.'],
        [13.5, 20.5, '이 관계가 Bellman 식이고, 충전기의 reward 1 이 0.9, 0.81, 0.729 로 한 칸씩 앞쪽 칸에 전해집니다.'],
        [
          20.5,
          27.7,
          'Q(s, a) 는 먼저 a 를 한 뒤 가장 좋게 행동할 때의 return 이고, 칸 1 에서는 오른쪽이 0.9 로 가장 큽니다.',
          '큐 에스 에이 는 먼저 action 에이 를 한 뒤 가장 좋게 행동할 때의 return 이고, 칸 1 에서는 오른쪽이 0.9 로 가장 큽니다.',
        ],
      ],
    },
    {
      id: 'sweeps',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'value iteration 은 모든 value 를 0 에서 시작해 Bellman optimality equation 으로 거듭 덮어씁니다.'],
        [6.5, 12.5, 'sweep 한 번마다 값이 한 칸씩 퍼져서, 1, 0.9, 0.81 을 거쳐 sweep 4 에서 칸 7 이 0.729 를 얻습니다.'],
        [12.5, 18, '미끄럽지 않은 바닥에서는 sweep 5 에서 바뀌는 값이 없어서, Bellman residual 이 정확히 0 이 됩니다.'],
        [18, 24, '미끄러우면 residual 이 0.7, 0.504, 0.263 처럼 줄기만 해서, 0.0001 보다 작아지는 sweep 12 에서 멈춥니다.'],
        [24, 29.7, 'γ 가 0.99 인 미끄러운 바닥에서는 계단 옆 칸 2, 4, 6, 8 의 policy 가 일부러 벽 쪽을 가리킵니다.'],
      ],
    },
    {
      id: 'pause-sweep',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 미끄럽지 않은 바닥에서 sweep 3 이 끝나도 칸 7 이 0 인 이유는 무엇이고, 언제 값을 얻을까요?'],
        [16.5, 23.5, 'sweep 3 은 직전 sweep 의 값만 보는데 칸 4 와 8 이 아직 0 이라서, 칸 7 은 sweep 4 에서 0.729 를 얻습니다.'],
      ],
    },
    {
      id: 'q-update',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, '실제 로봇은 바닥이 얼마나 미끄러운지 모르고, 겪은 state, action, reward, 다음 state 만 압니다.'],
        [6, 11.5, 'Q-learning 은 칸 7 개 × action 4 개로 28 칸인 Q 표를 두고, 경험 하나마다 한 칸을 고칩니다.'],
        [11.5, 17.5, 'target 은 reward 에 도착한 칸의 가장 큰 Q 를 γ 로 깎아 더한 값이고, 지금 값과의 차이가 TD error 입니다.'],
        [17.5, 23.5, 'Q 가 0.5 이고 target 이 0.9 면 TD error 는 0.4 이고, α 가 0.1 이면 0.04 만큼 target 쪽으로 옮깁니다.'],
        [
          23.5,
          29.7,
          'target 이 1, 1, −1, 1, 1 로 들어오면 α 가 1/n 일 때 Q 는 다섯 값의 평균인 0.6 이 됩니다.',
          'target 이 1, 1, −1, 1, 1 로 들어오면 α 가 엔 분의 일 일 때 Q 는 다섯 값의 평균인 0.6 이 됩니다.',
        ],
      ],
    },
    {
      id: 'off-policy',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'Q 가 가장 큰 action 만 고르면 처음 찾은 길만 되풀이하므로, 데이터는 ε-greedy 로 모읍니다.'],
        [6.5, 13.5, '그래도 target 에는 실제로 고를 action 대신 가장 큰 Q 를 써서, 이런 방법을 off-policy 라 합니다.'],
        [13.5, 20.5, 'α 가 1 이면 같은 길을 네 episode 도는 동안 1, 0.9, 0.81, 0.729 가 한 칸씩 출발 쪽으로 올라옵니다.'],
        [20.5, 27.7, 'α 0.5, ε 0.2 로 episode 3000 개를 돌리면, 칸마다 가장 큰 Q 가 value iteration 의 V* 와 같아집니다.'],
      ],
    },
    {
      id: 'pause-q',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 칸 1 에서 실수로 아래로 가 칸 4 에 왔고 다음엔 왼쪽을 고를 때, target 과 새 Q 는 얼마일까요?'],
        [16.5, 23.5, 'target 은 왼쪽이 아니라 가장 큰 0.81 을 써서 0.9 × 0.81 인 0.729 이고, 새 Q 는 약 0.6145 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. bandit 에서는 ε-greedy 의 무작위 선택이나 UCB 의 bonus 로 덜 해 본 선택지를 확인합니다.'],
        [4.2, 8.2, 'γ 는 step 마다 곱해서 50 Hz 의 0.99 는 약 1.4 초 뒤를 절반으로 깎고, reward 설계가 배울 행동을 정합니다.'],
        [8.2, 12.2, 'Bellman 식은 끝에서 받은 reward 를 앞쪽 state 로 전하고, value iteration 은 P 를 알 때 V* 를 구합니다.'],
        [12.2, 15.7, 'Q-learning 은 P 없이 겪은 경험의 target 쪽으로 Q 를 조금씩 옮겨서 같은 답에 다가갑니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음은 policy 를 직접 고치는 Policy Gradient 와, neural network 로 Q 를 구하는 DQN → SAC 입니다.']],
    },
  ],
}
