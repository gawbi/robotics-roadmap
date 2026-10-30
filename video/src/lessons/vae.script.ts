import type { VideoScript } from '../script.ts'

// Numbers follow lessons/vae/README.md: the hook (ACT without its CVAE: 35.3% → 2% on the human-demo simulator tasks); the
// average (10 demos, 5 at +1 and 5 at −1 m-sideways; MSE 2 / 1.25 / 1 / 1.25 for a = 1 / 0.5 / 0 / −0.5, so 0 → the box;
// check question +2, +2, −2, −2 → (2 + 2 − 2 − 2) ÷ 4 = 0); the autoencoder (3 pixels, (0.4, 0.6, 0.5) → z 0.5 →
// (0.5, 0.5, 0.5), 0.01 + 0.01 + 0 = 0.02; PyTorch MNIST 784 → 400 → 20); the gaps (0 pictures near −3, 1 pictures near 4,
// 0.5 between, 10 outside); the Gaussian encoder (μ −1, σ 0.5 → draws −0.8 −1.7 −0.6 −1.2, 95% in −2 ~ 0; μ 1 → 0 ~ 2;
// logvar −1.386 → σ 0.5, 0 → 1); reparameterization (μ 0.5, σ 2, ε −1 / 0 / 0.3 / 1 → z −1.5 / 0.5 / 1.1 / 2.5; direct draws
// 1.1 then −2.3 at μ 0.51; L = (z − 2)², z 1.1, ∂L/∂z = 2 × (1.1 − 2) = −1.8, ∂L/∂μ = −1.8, ∂L/∂σ = −1.8 × 0.3 = −0.54;
// check μ 1, σ 0.5, ε 2 → z 1 + 0.5 × 2 = 2, ∂z/∂σ = 2); KL (x = (0.6, 0.6, 0.6), μ 0.6, σ 0.1, ε −2 → z 0.4 → 3 × 0.2² =
// 0.12; KL = ½(μ² + σ² − log σ² − 1): μ 1 σ 1 → 0.5, μ 0 σ 0.5 → 0.318, curve points 0 / 0.5 / 2 and 0.318 / 0 / 0.807;
// ELBO −(90 + 25) = −115); β (VAE β = 1, ACT β = 10; A μ 3 σ 0.1 rec 0.01 KL 6.308 loss 6.318, B μ 1 σ 0.5 rec 0.2 KL 0.818
// loss 1.018; LeRobot L1 mean over 100 × 14 = 1400, KL over 32 dims × 10 → 1400 × 10 = 14,000; check 100 + 1 × 20 = 120,
// 100 + 4 × 20 = 180); CVAE and ACT (one-hot 7 = (0, 0, 0, 0, 0, 0, 0, 1, 0, 0); ACT chunk 100 step × 14, latent 32, L1,
// β 10 vs MNIST 2-dim, BCE, β 1; 35.3% → 2%; z = 0 at run time; check μ 0.5, σ 1 → KL 0.5² ÷ 2 = 0.125, × 10 = 1.25).

const S1 = 'MSE 평균과 빈 곳'
const S2 = 'reparameterization'
const S3 = 'KL · ELBO · β'
const S4 = 'ACT 의 CVAE'

export const script: VideoScript = {
  id: 'vae',
  title: 'VAE',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/vae',
  sections: [S1, S2, S3, S4],
  terms: [
    ['reparameterization trick', '리파라미터라이제이션 트릭'],
    ['posterior collapse', '포스테리어 콜랩스'],
    ['reconstruction', '리컨스트럭션'],
    ['latent space', '레이턴트 스페이스'],
    ['World Model', '월드 모델'],
    ['autoencoder', '오토인코더'],
    ['simulator', '시뮬레이터'],
    ['posterior', '포스테리어'],
    ['N(μ, σ²)', '엔 뮤 시그마 제곱'],
    ['gradient', '그래디언트'],
    ['N(0, I)', '엔 영 아이'],
    ['N(0, 1)', '엔 영 일'],
    ['encoder', '인코더'],
    ['decoder', '디코더'],
    ['LeRobot', '르로봇'],
    ['latent', '레이턴트'],
    ['sample', '샘플'],
    ['prior', '프라이어'],
    ['chunk', '청크'],
    ['pixel', '픽셀'],
    ['CVAE', '씨브이에이이'],
    ['ELBO', '엘보'],
    ['DDPM', '디디피엠'],
    ['VAE', '브이에이이'],
    ['log', '로그'],
    ['KL', '케이엘'],
    ['L1', '엘 원'],
    ['μ', '뮤'],
    ['σ', '시그마'],
    ['β', '베타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'VAE 는 데이터를 숫자 몇 개로 줄였다 되살리면서, 그 숫자들을 정규분포에 맞추는 생성 모델입니다.'],
        [4.2, 7.8, '평균이 생기는 이유, encoder 와 reparameterization trick, KL 과 β, ACT 의 CVAE 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, '같은 큐브 옮기기도 시연마다 조금씩 다른데, 정답 하나를 맞히는 모델은 여러 시연의 평균에 가까운 동작을 냅니다.'],
        [4.2, 7.8, '여러 시연이 퍼진 모양을 그대로 배워 그 안에서 동작 하나를 뽑으려면, 모델은 무엇을 학습해야 할까요?'],
      ],
    },
    {
      id: 'average',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '상자를 비켜 가는 시연 10 번 중 5 번은 왼쪽 +1 로, 나머지 5 번은 오른쪽 −1 로 비켜 갔다고 합시다.'],
        [6.5, 13, '예측 a 하나를 MSE 로 학습하면 a 가 1 일 때 MSE 는 2, 0.5 일 때 1.25 이고, 0 일 때 1 로 가장 작습니다.'],
        [13, 19.5, '그래서 모델은 0 을 내는데, 0 은 어느 쪽으로도 비키지 않는다는 뜻이라 로봇은 상자에 정면으로 부딪힙니다.'],
        [19.5, 25.8, '정답이 갈라진 multimodal 데이터에서는 분포 자체를 배워 하나를 뽑아야 하고, 이런 모델을 생성 모델이라고 합니다.'],
      ],
    },
    {
      id: 'gaps',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.3, 'autoencoder 는 encoder 로 그림을 숫자 몇 개인 latent z 로 줄이고, decoder 로 z 에서 그림을 되살립니다.'],
        [6.3, 12.8, '(0.4, 0.6, 0.5) 그림은 z 0.5 로 줄었다가 (0.5, 0.5, 0.5) 로 되살아나고, loss 는 0.02 입니다.', '0.4, 0.6, 0.5 인 그림은 z 0.5 로 줄었다가 0.5, 0.5, 0.5 로 되살아나고, loss 는 0.02 입니다.'],
        [12.8, 19.3, '0 그림이 −3 근처에, 1 그림이 4 근처에 모이면 그 사이 0.5 는 decoder 가 받아 본 적 없는 빈 곳입니다.'],
        [19.3, 25.8, 'loss 식에 z 의 위치가 없어서 생기는 일이라, z 가 빈 곳 없이 N(0, I) 모양을 채워야 새 그림을 뽑을 수 있습니다.'],
      ],
    },
    {
      id: 'pause-average',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 시연의 정답이 +2, +2, −2, −2 일 때 MSE 를 가장 작게 하는 예측은 얼마이고, 시연 몇 개와 같을까요?'],
        [16.5, 23.5, '정답들의 평균 (2 + 2 − 2 − 2) ÷ 4 는 0 입니다. 시연 네 개 중 0 인 것은 하나도 없습니다.', '정답들의 평균은 2 더하기 2 빼기 2 빼기 2 를 4 로 나눈 0 입니다. 시연 네 개 중 0 인 것은 하나도 없습니다.'],
      ],
    },
    {
      id: 'encoder',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.3, 'VAE 의 encoder 는 그림 한 장을 점 하나가 아니라, 평균 μ 와 표준편차 σ 로 정한 범위 하나로 바꿉니다.'],
        [6.3, 12.8, '0 그림에 μ 가 −1, σ 가 0.5 라면 뽑힌 z 의 95% 는 −2 부터 0 사이라서, 이 범위가 0 그림의 몫이 됩니다.'],
        [12.8, 19.3, '1 그림에 μ 가 1, σ 가 0.5 라면 범위는 0 부터 2 까지라서, 두 범위가 0 에서 맞닿아 빈 곳이 없습니다.'],
        [19.3, 25.8, '미리 정해 둔 분포 N(0, I) 를 prior 라고 하고, encoder 가 그림을 보고 낸 분포를 posterior 라고 합니다.'],
      ],
    },
    {
      id: 'reparam',
      seconds: 31,
      section: S2,
      cues: [
        [0.3, 6.5, 'z 를 N(μ, σ²) 에서 바로 뽑으면 μ 를 바꿀 때 z 의 변화가 운에 달려서, encoder 로 가는 gradient 가 끊깁니다.'],
        [6.5, 12.6, 'N(0, 1) 에서 ε 을 먼저 뽑고 z 를 μ + σ × ε 으로 계산하는 방법이 reparameterization trick 입니다.', 'N(0, 1) 에서 ε 을 먼저 뽑고 z 를 μ 더하기 σ × ε 으로 계산하는 방법이 reparameterization trick 입니다.'],
        [12.6, 18.4, 'μ 가 0.5, σ 가 2 일 때 ε 이 −1, 0, 0.3, 1 이면 z 는 −1.5, 0.5, 1.1, 2.5 입니다.'],
        [18.4, 24.7, 'loss 를 (z − 2)² 로 두고 ε 이 0.3 이면 z 는 1.1 이고, z 를 바꿀 때 loss 가 변하는 비율은 −1.8 입니다.', 'loss 를 z 빼기 2 의 제곱으로 두고 ε 이 0.3 이면 z 는 1.1 이고, z 를 바꿀 때 loss 가 변하는 비율은 −1.8 입니다.'],
        [24.7, 30.8, 'z 를 μ 로 미분하면 1, σ 로 미분하면 ε 이라서, μ 쪽에 −1.8, σ 쪽에 −0.54 가 전해집니다.'],
      ],
    },
    {
      id: 'pause-reparam',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. μ 가 1, σ 가 0.5 이고 뽑은 ε 이 2 일 때, z 와 z 를 σ 로 미분한 값은 얼마일까요?'],
        [16.5, 23.5, 'z 는 1 + 0.5 × 2 로 2 입니다. z 를 σ 로 미분한 값은 뽑은 ε 과 같아서 2 입니다.', 'z 는 1 더하기 0.5 × 2 로 2 입니다. z 를 σ 로 미분한 값은 뽑은 ε 과 같아서 2 입니다.'],
      ],
    },
    {
      id: 'kl',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.3, 'VAE 의 loss 는 reconstruction 항에, posterior 가 prior 에서 얼마나 먼지를 재는 KL 항을 더한 값입니다.'],
        [6.3, 12.8, 'reconstruction 항만 있으면 z 가 μ 에서 멀리 뽑힐수록 loss 가 커지므로, 학습은 σ 를 0 쪽으로 줄입니다.'],
        [12.8, 19.3, 'KL 은 μ 가 1, σ 가 1 이면 0.5, μ 가 0, σ 가 0.5 면 0.318 이고, μ 를 0 쪽으로, σ 를 1 쪽으로 당깁니다.'],
        [19.3, 25.8, '이 loss 를 줄이는 일은 ELBO 를 키우는 일과 같고, ELBO 는 언제나 그림이 나올 확률의 log 이하입니다.'],
      ],
    },
    {
      id: 'beta',
      seconds: 31,
      section: S3,
      cues: [
        [0.3, 6.3, 'loss 는 reconstruction 항에 β × KL 을 더한 값으로, VAE 논문은 β 가 1 이고 ACT 는 10 입니다.'],
        [6.3, 12.5, 'β 가 1 일 때 μ 3, σ 0.1 인 encoder A 는 loss 가 6.318 이고, μ 1, σ 0.5 인 B 는 1.018 입니다.'],
        [12.5, 18.5, 'β 가 0 이면 KL 항이 사라져 보통의 autoencoder 와 같아지고, latent space 에 빈 곳이 다시 생깁니다.'],
        [18.5, 24.7, 'β 가 아주 크면 모든 posterior 가 prior 와 겹쳐, decoder 가 z 를 무시하는 posterior collapse 가 생깁니다.'],
        [24.7, 30.8, 'LeRobot 의 ACT 구현은 L1 을 1400 개 숫자로 평균하고 KL 에 10 을 곱해서, KL 의 무게가 14,000 배입니다.'],
      ],
    },
    {
      id: 'pause-beta',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. reconstruction loss 100, KL 20 인 그림의 loss 는 β 가 1 일 때와 4 일 때 얼마일까요?'],
        [16.5, 23.5, '100 + 1 × 20 은 120, 100 + 4 × 20 은 180 입니다. β 가 4 면 학습은 KL 을 줄이는 쪽에 무게를 둡니다.', '100 더하기 1 × 20 은 120, 100 더하기 4 × 20 은 180 입니다. β 가 4 면 학습은 KL 을 줄이는 쪽에 무게를 둡니다.'],
      ],
    },
    {
      id: 'cvae',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.3, 'CVAE 는 encoder 와 decoder 양쪽에 조건 c 를 함께 넣어서, 원하는 조건의 sample 을 만드는 VAE 입니다.'],
        [6.3, 12.6, 'ACT 는 100 step × 관절 목표 14 개인 action chunk 를 되살리고, latent 는 32 차원, β 는 10 입니다.'],
        [12.6, 19, '학습 때 encoder 는 시연마다 다른 움직임을 z 에 담아 넘겨서, policy 는 정답들의 평균을 낼 필요가 없습니다.'],
        [19, 25.8, '저자들이 CVAE 를 빼고 학습하자 사람 시연으로 학습한 simulator 과제의 성공률이 35.3% 에서 2% 로 떨어졌습니다.'],
      ],
    },
    {
      id: 'act-run',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.3, '로봇을 실제로 움직일 때는 encoder 에 넣을 시연이 없어서, 저자들은 encoder 를 학습에만 쓰고 버립니다.'],
        [6.3, 12.8, '실행할 때는 z 를 prior 의 평균인 0 으로 두고, policy 는 카메라 이미지와 관절 위치만으로 chunk 를 냅니다.'],
        [12.8, 19.3, '그래서 같은 관측에는 늘 같은 chunk 가 나옵니다. CVAE 를 쓴다고 실행할 때마다 z 를 뽑지는 않습니다.'],
        [19.3, 25.8, '시연이 왼쪽 잡기와 오른쪽 잡기로 반반 갈리면, z 가 0 일 때의 chunk 가 둘 중 하나를 고른다는 보장이 없습니다.'],
      ],
    },
    {
      id: 'pause-act',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. ACT 의 encoder 가 한 차원에서 μ 0.5, σ 1 을 냈다면 KL 과 β 10 을 곱한 값은 얼마일까요?'],
        [16.5, 23.5, 'σ² 이 1, log 1 이 0 이라 KL 은 0.5² ÷ 2 로 0.125 이고, 10 을 곱하면 loss 에 1.25 가 더해집니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, 'MSE 는 갈라진 시연의 평균을 내고 autoencoder 에는 빈 곳이 남는데, VAE 는 그림을 범위로 바꿔 채웁니다.'],
        [4.2, 8, 'z 를 μ + σ ⊙ ε 으로 계산하면 무작위성이 ε 으로 옮겨 가서, gradient 가 encoder 까지 전해집니다.', 'z 를 μ 더하기 σ 곱하기 ε 으로 계산하면 무작위성이 ε 으로 옮겨 가서, gradient 가 encoder 까지 전해집니다.'],
        [8, 11.8, 'loss 는 reconstruction 항과 β × KL 의 합이고, β 가 너무 크면 posterior collapse 가 생깁니다.'],
        [11.8, 15.7, 'ACT 는 β 가 10 인 CVAE 로 시연의 움직임을 z 에 담아 학습하고, 실행할 때는 encoder 없이 z 를 0 으로 둡니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'VAE 의 sample 은 흐릿합니다. 다음은 더 선명한 sample 을 만드는 DDPM, 그리고 ACT 와 World Model 입니다.']],
    },
  ],
}
