import type { VideoScript } from '../script.ts'

// Numbers follow lessons/critic-loss/README.md only: TD 오차 δ = y − Q, L = ½δ², gradient −δ; the batch 0.5, −1, 2, 20
// (sum 23.5, 20 ÷ 23.5 = 85%; Huber δ_H = 1 → 0.5, 1, 1, 1, sum 3.5, 1 ÷ 3.5 = 29%); PyTorch HuberLoss delta 1.0,
// SmoothL1Loss beta 1.0; check 1, −1, 1, −1, 16 → 16 ÷ 20 = 80%, 1 ÷ 5 = 20%; DQN (Mnih 등 2015) error clipping −1 ~ 1,
// reward clipping 1 / −1 / 0, 49 Atari games; implementations (SB3 DQN smooth_l1_loss + clip_grad_norm_ 최대 10, CleanRL
// DQN mse_loss + Adam, Dopamine TF huber_loss + RMSProp, Dopamine JAX mse + Adam, SB3 SAC mse_loss 합 × 0.5, CleanRL SAC
// mse_loss 합, 2026 년 10 월); norm clipping (Pascanu 등 2013): (6, 8), 길이 10, 문턱 5, 배율 0.5 → (3, 4), 성분마다 ±5 →
// (5, 5), 45°; shares 85% / 29% / 85%; check (9, 12), 15, 3 ÷ 15 = 0.2 → (1.8, 2.4); reward 100 배; target 0, 0, 0, 10:
// 평균 2.5, 중앙값 0, 3Q = 1 → 1/3 ≈ 0.33 (13%); 0, 0, 0, 1000: 평균 250, 1/3 (0.13%), δ_H = 100 → 100/3 ≈ 33.3 (13%);
// check nine 0 and one 20 → 20 ÷ 10 = 2, 9Q = 1 → 1/9 ≈ 0.11; Adam (Kingma 와 Ba 2015) m / √v, c 배 / c² 배; β₁ 0.9,
// β₂ 0.999, m = v = 1: gradient 100 → m 10.9, v 11.0, 3.29; clipped to 10 → m 1.9, v 1.10, 1.81; check 50 → m 5.9,
// v 3.499, √ ≈ 1.87, ≈ 3.15; loss reading: target network 10,000 번마다, target 10 → 12, ½ × 2² = 2; reward 100 배 →
// squared 100² = 10,000 배, Huber 100 배; DQN Fig. 2 (episode 평균 점수, held-out state 묶음의 평균 Q).

const S1 = 'Huber 와 sample 몫'
const S2 = 'clipping 의 자리'
const S3 = 'reward 크기와 경계'
const S4 = 'Adam 과 loss 읽기'

export const script: VideoScript = {
  id: 'critic-loss',
  title: 'Critic Loss',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/critic-loss',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Reward Scale & Shaping', '리워드 스케일 앤 셰이핑'],
    ['Stable-Baselines3', '스테이블 베이스라인 쓰리'],
    ['reward centering', '리워드 센터링'],
    ['clip_grad_norm_', '클립 그래드 놈'],
    ['target network', '타깃 네트워크'],
    ['squared error', '스퀘어드 에러'],
    ['norm clipping', '놈 클리핑'],
    ['learning rate', '러닝 레이트'],
    ['SmoothL1Loss', '스무스 엘 원 로스'],
    ['Critic Loss', '크리틱 로스'],
    ['regression', '리그레션'],
    ['HuberLoss', '후버 로스'],
    ['clipping', '클리핑'],
    ['mse_loss', '엠에스이 로스'],
    ['gradient', '그래디언트'],
    ['optimizer', '옵티마이저'],
    ['parameter', '파라미터'],
    ['Pop-Art', '팝아트'],
    ['Pascanu', '파스카누'],
    ['CleanRL', '클린 알엘'],
    ['PyTorch', '파이토치'],
    ['episode', '에피소드'],
    ['network', '네트워크'],
    ['RMSProp', '알엠에스프롭'],
    ['return', '리턴'],
    ['critic', '크리틱'],
    ['target', '타깃'],
    ['sample', '샘플'],
    ['reward', '리워드'],
    ['update', '업데이트'],
    ['Atari', '아타리'],
    ['batch', '배치'],
    ['Huber', '후버'],
    ['delta', '델타'],
    ['state', '스테이트'],
    ['spike', '스파이크'],
    ['beta', '베타'],
    ['norm', '놈'],
    ['Adam', '아담'],
    ['loss', '로스'],
    ['step', '스텝'],
    ['DQN', '디큐엔'],
    ['SAC', '에스에이씨'],
    ['TD', '티디'],
    ['δ', '델타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'critic 은 TD target 을 따라가도록 학습하는데, loss 의 꼴이 sample 마다 끄는 세기를 정합니다.'],
        [4.2, 7.8, 'Huber 와 sample 의 몫, clipping 의 자리, reward 크기와 경계, Adam 과 loss 읽기를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '같은 DQN 이라도 Stable-Baselines3 는 Huber loss 를 쓰고, CleanRL 은 squared error 를 씁니다.'],
        [4.4, 7.8, '오차가 sample 마다 수십 배씩 다른 batch 에서, 이 loss 의 선택은 학습에서 무엇을 바꿀까요?'],
      ],
    },
    {
      id: 'squared',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'critic 의 학습은 regression 입니다. TD target y 와 Q 값의 차이 δ 를 TD 오차라고 부릅니다.'],
        [7, 13.5, 'squared error 는 오차의 제곱에 2 분의 1 을 곱한 값이라서, gradient 의 크기가 오차에 비례합니다.'],
        [13.5, 20.5, '예를 들어 batch 의 TD 오차가 0.5, −1, 2, 20 이면 gradient 크기의 합은 23.5 입니다.'],
        [20.5, 27.7, '오차 20 인 sample 하나가 20 ÷ 23.5 로 85% 를 정해서, 그 target 이 틀렸다면 update 도 따라갑니다.'],
      ],
    },
    {
      id: 'huber',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'Huber loss 는 오차가 경계보다 작으면 squared error 와 같고, 경계를 넘으면 직선으로 자랍니다.'],
        [6.5, 12.5, '직선 구간의 기울기가 일정해서, 오차가 아무리 커도 gradient 크기는 경계 값을 넘지 않습니다.'],
        [12.5, 18.5, 'PyTorch 의 HuberLoss 는 경계 delta 의 기본값이 1.0 이고, SmoothL1Loss 의 beta 도 1.0 입니다.'],
        [18.5, 24.5, '경계 1 인 Huber 에서는 gradient 크기가 0.5, 1, 1, 1 이 되어, 합 3.5 중 오차 20 의 몫은 29% 입니다.'],
        [24.5, 29.7, '경계를 넘은 sample 도 gradient 의 부호는 그대로라서, Q 를 target 쪽으로 고치는 방향은 같습니다.'],
      ],
    },
    {
      id: 'pause-batch',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. TD 오차가 1, −1, 1, −1, 16 이면 오차 16 의 몫은 squared error 와 Huber 에서 얼마일까요?'],
        [16.5, 23.5, 'squared error 는 16 ÷ 20 으로 80% 이고, 경계 1 인 Huber 는 모두 1 이 되어 1 ÷ 5 로 20% 입니다.'],
      ],
    },
    {
      id: 'dqn-clip',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'DQN 논문의 저자들은 TD 오차 항을 −1 과 1 사이로 잘랐는데, gradient 로 보면 경계 1 인 Huber 와 같습니다.'],
        [7, 13.5, '저자들은 reward 도 ±1 로 잘라서, 49 개 Atari 게임에 같은 learning rate 를 쓰기 쉬워진다고 적었습니다.'],
        [13.5, 20.5, '오차 자르기는 gradient 의 세기만 줄이지만, reward 자르기는 무엇을 잘한 것으로 칠지를 바꿉니다.'],
        [20.5, 27.7, '구현도 다릅니다. Stable-Baselines3 DQN 은 Huber loss 를 쓰고, CleanRL DQN 은 mse_loss 를 씁니다.'],
      ],
    },
    {
      id: 'norm-clip',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'Pascanu 등은 gradient 전체의 길이인 norm 이 문턱을 넘으면, 방향은 두고 길이만 문턱으로 줄였습니다.'],
        [6.5, 12.5, 'gradient (6, 8) 은 길이가 10 이라서, 문턱이 5 면 모든 성분에 0.5 를 곱해 (3, 4) 가 됩니다.'],
        [12.5, 18.5, '성분마다 따로 ±5 로 자르면 (5, 5) 가 되어 방향이 바뀌지만, norm clipping 은 방향을 지킵니다.'],
        [18.5, 24.5, 'Huber 는 sample 마다 먼저 잘라 몫을 바꾸고, norm clipping 은 batch 합 전체에 같은 배율을 곱합니다.'],
        [24.5, 29.7, '그래서 squared error 에 norm clipping 을 켜도, 오차 20 인 sample 의 몫은 85% 그대로입니다.'],
      ],
    },
    {
      id: 'pause-norm',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. gradient (9, 12) 를 문턱 3 인 norm clipping 으로 자르면 무엇이 될까요?'],
        [16.5, 23.5, '길이가 15 라서 배율은 3 ÷ 15 로 0.2 이고, 성분마다 곱하면 (1.8, 2.4) 로 방향은 그대로입니다.'],
      ],
    },
    {
      id: 'mean-median',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'Huber 의 경계는 오차의 크기와 견주어 정합니다. reward 를 100 배로 키우면 TD 오차도 대략 100 배가 됩니다.'],
        [6.5, 12.5, '경계를 1 로 두면 거의 모든 sample 이 직선 구간에 들어가서, gradient 에는 오차의 부호만 남습니다.'],
        [12.5, 18.5, 'squared error 로 맞춘 값은 target 의 평균이 되고, 부호만 보는 loss 로 맞춘 값은 중앙값이 됩니다.'],
        [18.5, 24.5, '예를 들어 같은 (s, a) 에서 target 이 0, 0, 0, 10 으로 나오면 평균은 2.5 이고 중앙값은 0 입니다.'],
        [
          24.5,
          29.7,
          '경계 1 인 Huber 는 0 세 개가 3Q 만큼 줄이고 10 이 1 만큼 키워서, 3Q = 1 인 약 0.33 에 멈춥니다.',
          '경계 1 인 Huber 는 0 세 개가 3Q 만큼 줄이고 10 이 1 만큼 키워서, 3Q 가 1 인 약 0.33 에 멈춥니다.',
        ],
      ],
    },
    {
      id: 'scale',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.8, 'target 이 0, 0, 0, 1000 으로 커지면 평균은 250 이지만, 경계 1 인 Huber 의 답은 약 0.33 그대로입니다.'],
        [6.8, 13.3, '평균 2.5 의 13% 이던 답이 평균 250 의 0.13% 가 되고, 경계도 100 으로 키우면 약 33.3 으로 13% 가 됩니다.'],
        [13.3, 19.5, 'DQN 처럼 reward 를 ±1 로 자르면 TD 오차도 대체로 Huber 의 경계 근처에 머뭅니다.'],
        [19.5, 25.7, 'reward 를 자르지 않는 환경에서 경계를 1 로 두면, critic 은 평균보다 작은 값을 배울 수 있습니다.'],
      ],
    },
    {
      id: 'pause-median',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. target 이 0 아홉 개와 20 하나면, squared error 와 경계 1 인 Huber 로 맞춘 값은 얼마일까요?'],
        [16.5, 23.5, 'squared error 는 평균인 20 ÷ 10 으로 2 이고, Huber 는 9Q 와 1 이 같아지는 자리라서 약 0.11 입니다.'],
      ],
    },
    {
      id: 'adam',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'Adam 은 gradient 의 이동 평균 m 을, gradient 제곱의 이동 평균 v 의 제곱근으로 나눈 만큼 움직입니다.'],
        [6.5, 12.5, 'gradient 에 c 를 곱하면 m 은 c 배가 되고 v 는 c 의 제곱 배가 되어서, 나눈 값에서 c 가 지워집니다.'],
        [12.5, 18.5, '다만 batch 안의 몫은 지우지 못해서, 전체에 같은 수를 곱해도 오차 20 인 sample 의 85% 는 그대로입니다.'],
        [18.5, 24.5, 'gradient 가 오래 1 이다가 한 step 만 100 이 되면, 그 step 은 평소의 3.29 배를 움직입니다.'],
        [24.5, 29.7, 'norm clipping 으로 10 까지 자르면 1.81 배에 그쳐서, 이런 순간을 막는 장치로 볼 수 있습니다.'],
      ],
    },
    {
      id: 'loss-read',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'target network 를 덮어써 target 이 10 에서 12 가 되면, Q 가 그대로여도 squared error 가 2 로 뜁니다.'],
        [6.5, 12.5, 'critic 이 나빠져서가 아니라 목표가 움직여서이고, SAC 처럼 조금씩 섞으면 loss 도 완만하게 오르내립니다.'],
        [12.5, 18.5, 'reward 가 100 배면 squared error 는 10,000 배가 되고 Huber 는 100 배가 되어, 직접 비교할 수 없습니다.'],
        [18.5, 24.5, 'DQN 저자들은 critic loss 대신 episode 의 평균 점수와, 고정한 state 묶음에서 계산한 평균 Q 를 보였습니다.'],
        [24.5, 29.7, 'return 은 그대로인데 평균 Q 만 계속 커지면, critic 이 가치를 부풀리고 있다는 신호입니다.'],
      ],
    },
    {
      id: 'pause-adam',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 오래 1 이던 gradient 가 한 step 만 50 이 됐다면, 기본값 Adam 은 평소의 몇 배를 움직일까요?'],
        [16.5, 23.5, 'm 은 5.9 이고 v 는 3.499 라서, 5.9 를 v 의 제곱근 약 1.87 로 나눈 약 3.15 배를 움직입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. squared error 에서는 오차 20 인 sample 이 85% 를 정하고, 경계 1 인 Huber 는 29% 로 줄입니다.'],
        [4.2, 8.2, 'DQN 의 error clipping 은 경계 1 인 Huber 와 같고, norm clipping 은 sample 사이의 몫을 그대로 둡니다.'],
        [8.2, 12.2, 'reward 에 비해 경계가 작으면 중앙값 쪽 값을 배워서, target 0, 0, 0, 10 에서 2.5 대신 0.33 이 나옵니다.'],
        [12.2, 15.7, 'Adam 은 일정한 배율만 지우고 3.29 배의 spike 는 남기며, critic loss 는 target 이 움직이면 오릅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 강의 Reward Scale & Shaping 에서는 Pop-Art 와 reward centering 으로 값의 크기 자체를 바꿉니다.']],
    },
  ],
}
