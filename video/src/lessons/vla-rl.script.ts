import type { VideoScript } from '../script.ts'

// Numbers follow lessons/vla-rl/README.md: intro (π*0.6 · RECAP, 시간당 작업 수 두 배 넘게, 실패율 대략 절반, 에스프레소 13 시간);
// demo ceiling (시연 100 개 = 가운데 70 + 가장자리 30, 성공률 95% / 50%, 0.7 × 0.95 + 0.3 × 0.5 = 0.665 + 0.15 = 0.815,
// 95 − 81.5 = 13.5%p, 1000 개 더 모아도 70 : 30 → 81.5%; check 0.4 × 0.95 + 0.6 × 0.5 = 0.38 + 0.3 = 0.68); recovery (chunk
// 0.5 초, episode chunk 20 개 = 10 초, 미끄러짐 2%, 1 − 0.02 = 0.98, 80% 되돌림 → 0.02 × 0.2 = 0.004 → 0.996; chunk 10 / 20 / 40:
// 0.817 / 0.668 / 0.446 vs 0.961 / 0.923 / 0.852; RaC DROID 1% 표본 3.68%); RL fine-tuning (reward 1 / 0; batch 20 개 중 6 개
// 성공 → 6 ÷ 20 = 0.3, +0.7 / −0.3; 0% → 0, 5% → +0.95 (baseline 1 ÷ 20 = 0.05), 95% → −0.95; πRL LIBERO 작업 40 개, 시연 최소
// 40 개; check 2 ÷ 10 = 0.2, +0.8 / −0.2); reward sources (HIL-SERL 성공 200 개 + 실패 1000 개, 약 5 분, 정확도 대개 95% 초과;
// 가상의 설계 0.1 per chunk: 3 × 0.1 + 1 = 1.3 vs 19 × 0.1 = 1.9); token ratio (0.5 × 0.8 × 0.25 = 0.1 → 0.6 × 0.8 × 0.25 =
// 0.12, ratio 1.2 = 1.2 × 1 × 1; clip 0.8 ~ 1.2 at ε = 0.2; GRPO 3 ÷ 8 = 0.375 → +0.625 / −0.375; VLA-RL LIBERO 40 작업
// 76.5% → 81.0%; SimpleVLA-RL 시연 1 개, LIBERO-Long 17.3% → 91.7%; check 1.1 × 1.0 × 0.9 = 0.99); flow matching (Euler step 10
// 번, 50 × 7 = 350, 350 × 350 = 122,500; πRL π0 57.6% → 97.6%; filtered BC 81.5% → 86.7%, 0.7 → 0.816; DSRL 약 1 만 step, 약 20% →
// 약 100%; RECAP value 0.815, 0.95 − 0.815 = +0.135, 0.5 − 0.815 = −0.315); on / off-policy (episode 10 초 + reset 20 초, 1000 개
// → 30,000 초 ≈ 8.3 시간; environment 64 개, 16 번 × 10 초 = 160 초; SimpleVLA-RL 실물 작업 4 개 17.5% → 38.5%; check 50 vs
// 50 × 6 = 300); intervention (chunk 20 개: policy 0 ~ 11 · 15 ~ 19 = 17 개, 사람 12 ~ 14 = 3 개; HIL-SERL RAM 48% → 100%,
// 1 ~ 2.5 시간, 100 번, HG-DAgger 49.7%; ConRFT Octo 작업 8 개, 15 ~ 90 분, 39.4% → 96.3%; 평가 20 개 → 1 ÷ 20 = 5%p, 10%p =
// 성공 두 개).

const S1 = '시연이 정하는 상한'
const S2 = 'reward 와 advantage'
const S3 = 'token 과 flow 의 확률'
const S4 = 'off-policy 와 실물'

export const script: VideoScript = {
  id: 'vla-rl',
  title: 'VLA + RL',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/vla-rl',
  sections: [S1, S2, S3, S4],
  terms: [
    ['process reward model', '프로세스 리워드 모델'],
    ['reward classifier', '리워드 클래시파이어'],
    ['reward hacking', '리워드 해킹'],
    ['sparse reward', '스파스 리워드'],
    ['flow matching', '플로 매칭'],
    ['flow', '플로'],
    ['replay buffer', '리플레이 버퍼'],
    ['fine-tuning', '파인튜닝'],
    ['filtered BC', '필터드 비씨'],
    ['World Model', '월드 모델'],
    ['Real Robot', '리얼 로봇'],
    ['Euler step', '오일러 스텝'],
    ['SimpleVLA-RL', '심플 브이엘에이 알엘'],
    ['LIBERO-Long', '리베로 롱'],
    ['VLA + RL', '브이엘에이 플러스 알엘'],
    ['VLA-RL', '브이엘에이 알엘'],
    ['HIL-SERL', '힐 설'],
    ['on-policy', '온 폴리시'],
    ['off-policy', '오프 폴리시'],
    ['environment', '인바이런먼트'],
    ['simulation', '시뮬레이션'],
    ['simulator', '시뮬레이터'],
    ['iteration', '이터레이션'],
    ['advantage', '어드밴티지'],
    ['positive', '파지티브'],
    ['negative', '네거티브'],
    ['baseline', '베이스라인'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['ConRFT', '콘 알에프티'],
    ['update', '업데이트'],
    ['reward', '리워드'],
    ['critic', '크리틱'],
    ['LIBERO', '리베로'],
    ['RECAP', '리캡'],
    ['DROID', '드로이드'],
    ['ratio', '레이쇼'],
    ['token', '토큰'],
    ['group', '그룹'],
    ['batch', '배치'],
    ['chunk', '청크'],
    ['noise', '노이즈'],
    ['clip', '클립'],
    ['Octo', '옥토'],
    ['DSRL', '디에스알엘'],
    ['GRPO', '지알피오'],
    ['PPO', '피피오'],
    ['SFT', '에스에프티'],
    ['VLA', '브이엘에이'],
    ['RAM', '램'],
    ['RL', '알엘'],
    ['π*0.6', '파이 스타 영 점 육'],
    ['πRL', '파이 알엘'],
    ['π0', '파이 제로'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [
          0.4,
          4.2,
          'VLA + RL 은 시연으로 배운 VLA 에게 작업을 여러 번 시도하게 하고, 성공 여부를 reward 로 주어 더 학습합니다.',
          'VLA 플러스 RL 은 시연으로 배운 VLA 에게 작업을 여러 번 시도하게 하고, 성공 여부를 reward 로 주어 더 학습합니다.',
        ],
        [4.2, 7.8, '시연이 정하는 상한, reward 와 advantage, token 과 flow 의 확률, off-policy 와 실물 로봇을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '시연으로 배운 VLA 는 컵을 놓치면 바로잡지 못하고, 시연을 더 모아도 성공률이 잘 오르지 않습니다.'],
        [4.4, 7.8, '정답 action 을 더 주지 않고, 로봇이 직접 해 본 성공과 실패만으로 VLA 를 더 낫게 만들 수 있을까요?'],
      ],
    },
    {
      id: 'ceiling',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, '시연 100 개 가운데 70 개는 컵 가운데를 잡았고 30 개는 가장자리를 잡았는데, 성공률은 95% 와 50% 입니다.'],
        [
          7,
          14,
          'SFT 한 policy 는 시연의 비율대로 잡아서, 성공률이 0.7 × 0.95 + 0.3 × 0.5 로 0.815 입니다.',
          'SFT 한 policy 는 시연의 비율대로 잡아서, 성공률이 0.7 × 0.95 더하기 0.3 × 0.5 로 0.815 입니다.',
        ],
        [
          14,
          21,
          '늘 가운데만 잡는 policy 의 95% 보다 13.5%p 낮은데, 가장자리 시연도 똑같이 정답으로 쓰이기 때문입니다.',
          '늘 가운데만 잡는 policy 의 95% 보다 13.5 퍼센트포인트 낮은데, 가장자리 시연도 똑같이 정답으로 쓰이기 때문입니다.',
        ],
        [
          21,
          27.7,
          '같은 습관으로 시연을 1000 개 더 모아도 비율은 70 : 30 이라서, 따라 한 policy 도 81.5% 그대로입니다.',
          '같은 습관으로 시연을 1000 개 더 모아도 비율은 70 대 30 이라서, 따라 한 policy 도 81.5% 그대로입니다.',
        ],
      ],
    },
    {
      id: 'recovery',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'chunk 마다 컵이 2% 확률로 미끄러지고, policy 는 미끄러진 컵을 다시 잡는 법을 모른다고 합시다.'],
        [7, 14, 'chunk 20 개짜리 episode 의 성공률은 0.98 을 20 번 곱한 0.668 이고, chunk 40 개면 0.446 까지 떨어집니다.'],
        [14, 21, '미끄러짐의 80% 를 되돌리면 chunk 하나의 실패 확률이 0.02 × 0.2 로 0.004 가 되어, 성공률은 0.923 입니다.'],
        [21, 27.7, '사람은 실수를 피하고 실수한 시연을 지워서, DROID 표본에서 회복 동작이 든 episode 는 3.68% 였습니다.'],
      ],
    },
    {
      id: 'pause-demo',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 시연이 가운데 40 개, 가장자리 60 개라면 그대로 따라 한 policy 의 성공률은 얼마일까요?'],
        [
          16.5,
          23.5,
          '0.4 × 0.95 + 0.6 × 0.5 는 0.38 + 0.3 이라 68% 입니다. 시연이 치우친 만큼 policy 도 나빠집니다.',
          '0.4 × 0.95 더하기 0.6 × 0.5 는 0.38 더하기 0.3 이라 68% 입니다. 시연이 치우친 만큼 policy 도 나빠집니다.',
        ],
      ],
    },
    {
      id: 'rl-loop',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'RL fine-tuning 은 SFT 한 VLA 로 rollout 을 모아, 성공하면 1, 실패하면 0 의 reward 로 고칩니다.'],
        [6.5, 12.5, 'episode 끝에만 1 을 주는 reward 를 sparse reward 라고 하는데, policy 는 성공과 실패의 차이에서만 배웁니다.'],
        [12.5, 18.5, '20 개 가운데 6 개가 성공하면 baseline 은 6 ÷ 20 인 0.3 이고, advantage 는 +0.7 과 −0.3 입니다.'],
        [18.5, 24.5, '성공률이 0% 면 advantage 가 모두 0 이라 배울 것이 없고, 5% 나 95% 처럼 치우치면 단서가 하나에 몰립니다.'],
        [24.5, 29.7, '그래서 SFT 를 먼저 합니다. πRL 에서는 LIBERO 작업 40 개에 시연이 최소 40 개 필요했습니다.'],
      ],
    },
    {
      id: 'reward-source',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 7.5, '성공도 누군가 판정해야 합니다. simulator 의 판정 프로그램은 실물에 없고, 사람이 판정하면 손이 듭니다.'],
        [7.5, 15, 'HIL-SERL 은 성공 장면 200 개와 실패 장면 1000 개로 reward classifier 를 학습해 대개 95% 넘게 맞혔습니다.'],
        [15, 22.5, '중간 점수를 잘못 정하면 위험합니다. 쥐고 있는 chunk 마다 0.1 을 주면 놓는 행동은 1.3, 쥐고만 있으면 1.9 입니다.'],
        [22.5, 29.7, '이렇게 reward 숫자만 키우는 행동을 reward hacking 이라고 해서, 최종 성공의 reward 를 늘 가장 크게 둡니다.'],
      ],
    },
    {
      id: 'pause-advantage',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. episode 10 개 가운데 2 개가 성공했다면, baseline 과 성공·실패의 advantage 는 얼마일까요?'],
        [16.5, 23.5, 'baseline 은 2 ÷ 10 인 0.2 이고, 성공의 advantage 는 +0.8 이고 실패의 advantage 는 −0.2 입니다.'],
      ],
    },
    {
      id: 'token-ratio',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'PPO 는 옛 policy 와 새 policy 가 같은 action 을 고를 확률의 비인 ratio 로 update 크기를 제한합니다.'],
        [6.5, 12.5, 'token VLA 의 action 확률은 token 확률의 곱이라서, 0.5 × 0.8 × 0.25 는 0.1 이고 새 확률은 0.12 입니다.'],
        [
          12.5,
          18.5,
          '그래서 ratio 는 1.2 로 바로 나오고, clip 은 ratio 가 0.8 ~ 1.2 밖으로 나가는 쪽으로는 더 고치지 않습니다.',
          '그래서 ratio 는 1.2 로 바로 나오고, clip 은 ratio 가 0.8 에서 1.2 밖으로 나가는 쪽으로는 더 고치지 않습니다.',
        ],
        [18.5, 24.5, 'GRPO 는 group 평균을 baseline 으로 써서, 8 번 중 3 번 성공하면 advantage 가 +0.625 와 −0.375 입니다.'],
        [24.5, 29.7, 'SimpleVLA-RL 은 작업마다 시연 1 개로 시작해, GRPO 로 LIBERO-Long 성공률을 17.3% 에서 91.7% 로 올렸습니다.'],
      ],
    },
    {
      id: 'flow-four',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'flow matching VLA 인 π0 는 noise 하나에서 Euler step 10 번을 거쳐 chunk 를 만듭니다.'],
        [6.5, 13, 'chunk 의 확률 밀도에는 숫자 50 × 7 인 350 개의 변화 비율 122,500 개가 step 마다 필요합니다.'],
        [13, 19.5, '피하는 방법은 넷입니다. step 마다 noise 를 넣는 πRL 은 π0 의 LIBERO 성공률을 57.6% 에서 97.6% 로 올렸습니다.'],
        [19.5, 25.5, '성공만 다시 배우는 filtered BC 는 컵 예의 81.5% 를 86.7% 로 올리고, DSRL 은 noise 만 고릅니다.'],
        [25.5, 31.7, 'RECAP 은 가운데 잡기에 +0.135 로 positive 를 붙이고 가장자리에 −0.315 로 negative 를 붙여 학습합니다.'],
      ],
    },
    {
      id: 'pause-ratio',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 자리별 ratio 가 1.1, 1.0, 0.9 면 action ratio 는? clip 에 잘릴까요?',
          '멈추고 적어 보기. 자리별 ratio 가 1.1, 1.0, 0.9 면 action ratio 는? clip 에 잘릴까요?',
        ],
        [16.5, 23.5, 'action ratio 는 1.1 × 1.0 × 0.9 로 0.99 입니다. 0.8 과 1.2 사이라서 잘리지 않습니다.'],
      ],
    },
    {
      id: 'on-off',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7.5, 'on-policy 학습은 지금 policy 의 rollout 으로 몇 번 update 하고 버리는데, PPO 와 GRPO 가 여기에 속합니다.'],
        [7.5, 15, 'off-policy 학습은 시연과 사람의 개입, 지난 rollout 을 replay buffer 에 쌓아 두고 되풀이해 꺼내 씁니다.'],
        [15, 22.5, 'episode 1000 개를 모으면 실물 한 대는 되돌려 놓는 20 초까지 약 8.3 시간이 걸리고, simulation 은 160 초입니다.'],
        [22.5, 29.7, 'simulation 으로만 학습한 SimpleVLA-RL 은 실물 팔에서 17.5% 를 38.5% 로 올렸지만, 여전히 낮았습니다.'],
      ],
    },
    {
      id: 'intervention',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, '실물 RL 은 사람의 개입을 함께 씁니다. 위험해지면 사람이 넘겨받아 다시 잡아 주고, 그 구간은 회복 시연이 됩니다.'],
        [
          6.5,
          12.5,
          'chunk 20 개 가운데 사람이 12 ~ 14 의 3 개를 맡으면, policy 가 실행한 17 개와 성공 여부는 RL 데이터가 됩니다.',
          'chunk 20 개 가운데 사람이 12 에서 14 의 3 개를 맡으면, policy 가 실행한 17 개와 성공 여부는 RL 데이터가 됩니다.',
        ],
        [
          12.5,
          18.5,
          'HIL-SERL 의 RAM 꽂기는 개입 없이 학습하면 48%, 개입을 쓰면 100% 였고, 대부분의 작업을 1 ~ 2.5 시간에 익혔습니다.',
          'HIL-SERL 의 RAM 꽂기는 개입 없이 학습하면 48%, 개입을 쓰면 100% 였고, 대부분의 작업을 1 에서 2.5 시간에 익혔습니다.',
        ],
        [
          18.5,
          24.5,
          'ConRFT 는 Octo 를 실물 작업마다 15 ~ 90 분씩 RL 로 고쳐, 평균 성공률을 39.4% 에서 96.3% 로 올렸습니다.',
          'ConRFT 는 Octo 를 실물 작업마다 15 에서 90 분씩 RL 로 고쳐, 평균 성공률을 39.4% 에서 96.3% 로 올렸습니다.',
        ],
        [
          24.5,
          29.7,
          '평가 횟수도 봐야 합니다. episode 20 개로 재면 성공 하나가 5%p 라서, 10%p 개선은 성공 두 개입니다.',
          '평가 횟수도 봐야 합니다. episode 20 개로 재면 성공 하나가 5 퍼센트포인트라서, 10 퍼센트포인트 개선은 성공 두 개입니다.',
        ],
      ],
    },
    {
      id: 'pause-onoff',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. episode 50 개씩 6 번 모으면, 마지막에 on-policy 와 off-policy 는 몇 개를 쓸까요?'],
        [16.5, 23.5, 'on-policy 는 마지막에 모은 50 개만 쓰고, off-policy 는 쌓아 둔 50 × 6 인 300 개를 모두 쓸 수 있습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 시연만 따라 하면 성공률이 81.5% 에 묶이고, 회복을 모르면 chunk 20 개 작업이 66.8% 로 떨어집니다.'],
        [4.2, 8.2, 'RL 은 성공 여부에서 baseline 을 뺀 advantage 로 배우고, 성공률이 0% 가 되지 않도록 SFT 를 먼저 합니다.'],
        [8.2, 12.2, 'token VLA 는 ratio 가 확률의 곱이라 PPO 와 GRPO 를 쓰고, flow matching VLA 는 네 방법으로 우회합니다.'],
        [12.2, 15.7, '실물에서는 데이터를 다시 쓰는 off-policy 학습과 사람의 개입을 쓰고, 넘겨받은 구간은 회복 시연이 됩니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 장면을 예측해 시도를 줄이는 방법은 World Model 에서, 실물 팔의 개입 수집은 Real Robot 에서 다룹니다.']],
    },
  ],
}
