import type { VideoScript } from '../script.ts'

// Numbers follow lessons/ppo/README.md: the big step (machine A 1 coin, B 0.5 × 4 = 2; θ = 0 mean 1.5, Â = 0 − 1.5 = −1.5,
// ∇ ln π(B) = 1 − 0.5 = 0.5, Δθ = −0.75η; η 0.1 / 1 / 10 → θ −0.075 / −0.75 / −7.5, π(B) 0.4813 / 0.3208 / 0.000553, ≈ 481 /
// 321 / 0.55 of 1000; true gradient 0.9994 × 0.000553 ≈ 0.00055, 186 updates back to 0; θ 0 → 1: B 0.5 → 0.7311, A ×0.5379;
// θ 4 → 5: B 0.9820 → 0.9933 (+0.0113), A 0.0180 → 0.0067, ×0.3721; check η = 2 → −1.5, e^−1.5 ≈ 0.2231, 0.2231 ÷ 1.2231 ≈
// 0.1824, ≈ 182); the ratio (θ_old 0 → θ 0.5: A 0.5 → 0.3775, 0.7551; B 0.5 → 0.6225, 1.2449; θ = 2: A 0.1192, B 0.8808,
// ratio 0.2384 / 1.7616, gradient −0.1050 + 0.2100 + 0 = 0.105, without ratio −0.3212; 0.01 → 0.5 gives 50, 100 번에 1 번);
// clip (unclipped η 0.5, 10 epoch: B 0.5 → 0.0822; TRPO δ = 0.01; ε 0.2, [0.8, 1.2], 20%; 1.3 × 2 = 2.6 vs 1.2 × 2 = 2.4;
// Â ±2 flat at 2.4 / −1.6; epoch table 0.5 / 0.4073 / 0.3236, ratio 1 / 0.8147 / 0.6473, gradient −0.75 / −0.7242 / 0, clip
// 0.8 × (−1.5) = −1.2, no clip epoch 10 0.0922, after 0.0822; MuJoCo 7 tasks × 3 seeds = 21 runs, 100 만 step, no clip −0.39,
// ε 0.1 / 0.2 / 0.3 → 0.76 / 0.82 / 0.70; check Â −1, ratio 0.6: −0.6, −0.8); GAE (CartPole, γ = 1, V 3 3 2 2, reward 1,
// δ 1 0 1 −1; λ 0.5 weights 1 0.5 0.25 0.125 → 1.125; λ 0 → 1, λ 1 → 4 − 3 = 1; backward −1 0.5 0.25 1.125; wrong V(s₁) 5:
// error 2 / 1 / 0; γ 0.99, λ 0.95, γλ 0.9405, 0.9405¹⁰ ≈ 0.54, 50 step ≈ 0.047; check γλ 0.5, δ 2 0 −2 → −2, −1, 1.5);
// bootstrap (V(s₄) = 2, δ₃ = 1 + 2 − 2 = 1, Â 1 1.5 0.75 1.375 vs −1 0.5 0.25 1.125; episode 20 초 ÷ 0.02 초 = 1000 step,
// rollout 24 step, ≈ 42 iterations; 25 step (0.5 초), 24 step (0.48 초)); loss (value loss (3 − 4.125)² = 1.2656; entropy
// 0.6931 / 0.3251 / 0.0047; c_v, c_e: Atari 1 / 0.01, CleanRL 0.5 / 0.01, legged_gym 1.0 / 0.01, Isaac Lab ANYmal-D 1.0 /
// 0.005); iteration (CleanRL CartPole 4 × 128 = 512, 128 each, 4 mini-batch, 4 epoch, 4 × 4 = 16); parallel (4096 × 24 =
// 98,304, 4096 × 24 ÷ 4 = 24,576, 192×, 5 epoch → 20 updates; ε 0.2; γ 0.99, λ 0.95; lr 2.5 × 10⁻⁴ (CleanRL), 10⁻³ adaptive;
// desired_kl 0.01, > 0.02 → ÷ 1.5, < 0.005 → × 1.5, 10⁻⁵ ~ 10⁻², KL 0.03: 10⁻³ ÷ 1.5 ≈ 6.7 × 10⁻⁴; Rudin RTX A6000, 1500
// updates, rough 20 분, flat < 4 분, 1500 × 98,304 ≈ 1.47 억 step; check 2048 × 48 = 98,304, ÷ 8 = 12,288, 8 × 5 = 40).

const S1 = '한 번에 큰 update'
const S2 = 'ratio 와 clip'
const S3 = 'GAE 와 bootstrap'
const S4 = '병렬 simulation 설정'

export const script: VideoScript = {
  id: 'ppo',
  title: 'PPO',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/ppo',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Sim-to-Real Locomotion', '심투리얼 로코모션'],
    ['importance sampling', '임포턴스 샘플링'],
    ['probability ratio', '프로버빌리티 레이쇼'],
    ['adaptive schedule', '어댑티브 스케줄'],
    ['clipped surrogate', '클립드 서로게이트'],
    ['supervised learning', '슈퍼바이즈드 러닝'],
    ['policy gradient', '폴리시 그래디언트'],
    ['learning rate', '러닝 레이트'],
    ['entropy bonus', '엔트로피 보너스'],
    ['value loss', '밸류 로스'],
    ['Isaac Lab', '아이작 랩'],
    ['legged_gym', '레기드 짐'],
    ['mini-batch', '미니배치'],
    ['time-out', '타임아웃'],
    ['TD error', '티디 에러'],
    ['surrogate', '서로게이트'],
    ['advantage', '어드밴티지'],
    ['bootstrap', '부트스트랩'],
    ['iteration', '이터레이션'],
    ['simulation', '시뮬레이션'],
    ['gradient', '그래디언트'],
    ['variance', '배리언스'],
    ['CartPole', '카트폴'],
    ['CleanRL', '클린알엘'],
    ['entropy', '엔트로피'],
    ['MuJoCo', '무조코'],
    ['update', '업데이트'],
    ['reward', '리워드'],
    ['sample', '샘플'],
    ['critic', '크리틱'],
    ['state', '스테이트'],
    ['ratio', '레이쇼'],
    ['epoch', '에포크'],
    ['batch', '배치'],
    ['Rudin', '루딘'],
    ['clip', '클립'],
    ['bias', '바이어스'],
    ['PPO', '피피오'],
    ['GAE', '지에이이'],
    ['GPU', '지피유'],
    ['VLA', '브이엘에이'],
    ['env', '엔브'],
    ['KL', '케이엘'],
    ['RL', '알엘'],
    ['θ', '세타'],
    ['η', '에타'],
    ['γ', '감마'],
    ['λ', '람다'],
    ['δ', '델타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [
          0.4,
          4.2,
          'PPO 는 옛 policy 와 지금 policy 의 확률 비를 0.8 ~ 1.2 근처로 묶고, 같은 데이터로 여러 epoch 학습합니다.',
          'PPO 는 옛 policy 와 지금 policy 의 확률 비를 0.8 에서 1.2 근처로 묶고, 같은 데이터로 여러 epoch 학습합니다.',
        ],
        [4.2, 7.8, '한 번에 큰 update, ratio 와 clip, GAE 와 bootstrap, 병렬 simulation 설정을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'policy gradient 로 학습하면 reward 가 잘 오르다가 어느 update 뒤 갑자기 떨어져 다시 오르지 않기도 합니다.'],
        [4.4, 7.8, '한 번 모은 데이터로 여러 번 고치면서도 policy 가 한 번에 망가지지 않게 막을 수는 없을까요?'],
      ],
    },
    {
      id: 'big-step',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '기계 A 는 늘 동전 1 개를 주고 B 는 0.5 의 확률로 4 개를 줘서, 기댓값은 A 가 1 이고 B 가 2 입니다.'],
        [
          6.5,
          13,
          'θ 가 0 일 때 B 를 골라 0 개를 받으면 advantage 는 0 − 1.5 로 −1.5 이고, θ 는 −0.75η 만큼 움직입니다.',
          'θ 가 0 일 때 B 를 골라 0 개를 받으면 advantage 는 0 빼기 1.5 로 −1.5 이고, θ 는 −0.75 η 만큼 움직입니다.',
        ],
        [13, 19.5, 'learning rate η 가 0.1, 1 이면 B 를 고를 확률이 0.4813, 0.3208 이고, 10 이면 0.000553 입니다.'],
        [19.5, 25.7, 'η 가 10 이면 1000 번 당겨 B 를 약 0.55 번만 골라서, 더 좋은 기계를 운 나쁜 한 번 때문에 거의 버립니다.'],
      ],
    },
    {
      id: 'no-recover',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '진짜 gradient 를 알아도 θ 가 −7.5 인 곳에서는 0.9994 × 0.000553 으로 약 0.00055 밖에 안 됩니다.'],
        [6.5, 13, '그래서 η 10 으로 계속 고쳐도 θ 가 0 으로 돌아오기까지 update 가 186 번 필요합니다.'],
        [13, 19.5, 'θ 를 4 에서 5 로 1 만 옮겨도 B 의 확률은 0.0113 만 오르지만, A 의 확률은 0.3721 배가 됩니다.'],
        [19.5, 25.7, 'supervised learning 과 달리 policy 가 자기 데이터를 모으므로, 한 번에 크게 바꾸지 않는 장치가 필요합니다.'],
      ],
    },
    {
      id: 'pause-step',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 sample 로 η 가 2 이면 새 θ 와 B 를 고를 확률은 얼마일까요?'],
        [16.5, 23.5, 'θ 는 −0.75 × 2 로 −1.5 가 되고, B 의 확률은 0.2231 ÷ 1.2231 로 약 0.1824 로 줄어듭니다.'],
      ],
    },
    {
      id: 'ratio',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'probability ratio 는 고른 action 을 새 policy 가 고를 확률을 옛 policy 의 확률로 나눈 값입니다.'],
        [6.5, 13, '옛 θ 가 0 이고 새 θ 가 0.5 면 ratio 는 A 가 0.7551 이고 B 가 1.2449 이며, 고치기 전에는 모두 1 입니다.'],
        [13, 19.5, 'ratio 를 곱하면 옛 데이터로 새 policy 의 평균을 구하는데, 이 방법을 importance sampling 이라고 합니다.'],
        [19.5, 25.7, '옛 확률 0.01 인 action 을 새 policy 가 0.5 로 고르면 ratio 50 이라, sample 하나가 50 개 몫이 됩니다.'],
      ],
    },
    {
      id: 'clip',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.3, '제한 없는 surrogate 를 η 0.5 로 10 epoch 키우면, 운 나쁜 sample 하나로 B 의 확률이 0.0822 가 됩니다.'],
        [
          6.3,
          12.2,
          'PPO 는 ratio 를 1 − ε 과 1 + ε 사이로 자르는데, ε 은 보통 0.2 라서 범위는 0.8 ~ 1.2 입니다.',
          'PPO 는 ratio 를 1 빼기 ε 과 1 더하기 ε 사이로 자르는데, ε 은 보통 0.2 라서 범위는 0.8 에서 1.2 입니다.',
        ],
        [12.2, 18.2, 'sample 마다 자르지 않은 항과 자른 항 중 작은 값을 골라, advantage 방향으로 20% 넘게 간 sample 은 멈춥니다.'],
        [18.2, 24.2, 'clip 이 있으면 epoch 2 에 ratio 가 0.6473 이 되고, epoch 3 부터 B 의 확률이 0.3236 에 멈춥니다.'],
        [24.2, 29.7, 'MuJoCo 평균 점수는 clip 없이 −0.39 였고, ε 이 0.1, 0.2, 0.3 이면 0.76, 0.82, 0.70 이었습니다.'],
      ],
    },
    {
      id: 'pause-clip',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. advantage 가 −1 이고 ratio 가 0.6 인 sample 의 두 항과 고르는 값은? θ 를 움직일까요?'],
        [16.5, 23.5, '두 항은 −0.6 과 −0.8 이고, 자른 항 −0.8 이 더 작아서 gradient 가 0 이라 θ 를 움직이지 않습니다.'],
      ],
    },
    {
      id: 'gae',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.3, 'critic 의 예측으로 만든 TD error δ 는 받은 reward 에 다음 예측을 더하고 지금 예측을 뺀 값입니다.'],
        [6.3, 12.2, 'CartPole 의 4 step 에서 예측이 3, 3, 2, 2 이고 reward 가 매번 1 이면 δ 는 1, 0, 1, −1 입니다.'],
        [12.2, 18.2, 'GAE 는 뒤의 δ 일수록 γλ 를 거듭 곱해 섞는데, λ 가 0.5 면 몫이 1, 0.5, 0.25, 0.125 라서 1.125 입니다.'],
        [18.2, 24.2, '마지막 step 부터 거꾸로 훑으면 advantage 는 −1, 0.5, 0.25, 1.125 로 같은 1.125 가 나옵니다.'],
        [24.2, 29.7, 'λ 가 작으면 critic 오차를 그대로 받는 bias 가 커지고, 크면 여러 step 의 운이 섞이는 variance 가 커집니다.'],
      ],
    },
    {
      id: 'bootstrap',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'PPO 의 γ 0.99, λ 0.95 면 γλ 는 0.9405 라서, 10 step 뒤의 δ 는 약 0.54 배 몫만 받습니다.'],
        [
          6.5,
          13,
          'rollout 이 막대가 선 채 끝나고 다음 예측이 2 면, 마지막 δ 는 1 + 2 − 2 로 1 입니다.',
          'rollout 이 막대가 선 채 끝나고 다음 예측이 2 면, 마지막 δ 는 1 더하기 2 빼기 2 로 1 입니다.',
        ],
        [13, 19.5, '받지 않은 reward 를 예측으로 채우는 bootstrap 으로, step 3 의 advantage 가 −1 에서 +1 이 됩니다.'],
        [19.5, 25.7, '보행 episode 는 1000 step 이고 rollout 은 24 step 이라, 20 초의 time-out 도 bootstrap 합니다.'],
      ],
    },
    {
      id: 'pause-gae',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. γλ 가 0.5 이고 δ 가 2, 0, −2 인 3 step episode 의 advantage 를 뒤에서부터 구하면?'],
        [
          16.5,
          23.5,
          '뒤에서부터 −2 가 나오고, 0 + 0.5 × (−2) 로 −1 이 나오며, 2 + 0.5 × (−1) 로 1.5 가 나옵니다.',
          '뒤에서부터 −2 가 나오고, 0 더하기 0.5 × −2 로 −1 이 나오며, 2 더하기 0.5 × −1 로 1.5 가 나옵니다.',
        ],
      ],
    },
    {
      id: 'loss',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'critic 은 value loss 로 고치는데, step 0 은 예측 3 과 정답 4.125 의 차이를 제곱해 1.2656 입니다.'],
        [6.5, 13, 'entropy 는 반반 고르면 0.6931 이고 쏠릴수록 0 에 다가가서, η 10 으로 망가진 policy 는 0.0047 입니다.'],
        [13, 19.5, 'loss 는 clipped surrogate 에 마이너스를 붙이고 value loss 는 더하고 entropy bonus 는 빼서 묶습니다.'],
        [19.5, 25.7, 'CleanRL 은 env 4 개 × 128 step 으로 512 개를 모아 4 묶음, 4 epoch 로 16 번 고치고 버립니다.'],
      ],
    },
    {
      id: 'parallel',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.3, 'legged_gym 은 env 4096 개 × 24 step 으로 iteration 마다 sample 98,304 개를 모읍니다.'],
        [6.3, 12.2, 'mini-batch 4 개로 나누면 하나가 24,576 개로 CartPole 의 192 배이고, 5 epoch 로 20 번 고칩니다.'],
        [12.2, 18.2, 'KL 이 0.02 를 넘으면 learning rate 를 1.5 로 나누고, 0.005 보다 작으면 1.5 를 곱해 변화를 묶습니다.'],
        [18.2, 24.2, 'Rudin 등은 GPU 한 장으로 1500 번 update 해서 험지 보행은 20 분 안에, 평지 보행은 4 분 안에 학습했습니다.'],
        [24.2, 29.7, 'env 마다 연속 step 이 25 개보다 적으면 학습이 잘 되지 않았는데, 기본값 24 step 이 바로 그 경계에 있습니다.'],
      ],
    },
    {
      id: 'pause-batch',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. env 2048 개를 48 step 씩 움직여 mini-batch 8 개로 5 epoch 학습하면 크기와 step 수는?'],
        [16.5, 23.5, '98,304 개를 8 로 나눠 mini-batch 하나는 12,288 개이고, gradient step 은 8 × 5 로 40 번입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 한 번에 크게 고치면 B 의 확률이 0.000553 이 되고, 그 policy 는 좋은 데이터를 다시 모으지 못합니다.'],
        [
          4.2,
          8.2,
          'PPO 는 ratio 를 0.8 ~ 1.2 로 잘라서, 같은 sample 로 10 epoch 를 해도 B 의 확률이 0.3236 에 멈춥니다.',
          'PPO 는 ratio 를 0.8 에서 1.2 로 잘라서, 같은 sample 로 10 epoch 를 해도 B 의 확률이 0.3236 에 멈춥니다.',
        ],
        [8.2, 12.2, 'advantage 는 γ 0.99, λ 0.95 의 GAE 로 구하고, 끊긴 rollout 은 bootstrap 합니다.'],
        [12.2, 15.7, 'legged_gym 과 Isaac Lab 은 4096 × 24 의 큰 batch 를 mini-batch 4 개, 5 epoch 로 씁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '보행 policy 가 무엇을 보고 reward 를 어떻게 짜는지는 Sim-to-Real Locomotion 에서 다룹니다.'],
        [
          3.6,
          6.6,
          'VLA 를 성공 여부 reward 와 PPO 로 더 학습하는 방법은 VLA + RL 에서 다룹니다.',
          'VLA 를 성공 여부 reward 와 PPO 로 더 학습하는 방법은 VLA 플러스 RL 에서 다룹니다.',
        ],
      ],
    },
  ],
}
