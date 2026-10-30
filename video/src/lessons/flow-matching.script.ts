import type { VideoScript } from '../script.ts'

// Numbers follow lessons/flow-matching/README.md: the opening (Diffusion Policy 100 단계 → DDIM 10 단계, RTX 3080 0.1 초;
// π0 action 50 개, network 10 번, RTX 4090 27 ms); DDPM T = 1000 → network 1000 번; the straight line ε = −1, x₁ = 2
// (t 0 / 0.25 / 0.5 / 1 → −1 / −0.25 / 0.5 / 2, 0.75 per 0.25, 0.75 ÷ 0.25 = 3 = 2 − (−1), −1 + 3 × 1 = 2); the training
// step (x₁ 2, ε −1, t 0.5 → x_t 0.5, output 2.5, loss (3 − 2.5)² = 0.25; same position 0.5: 1.5 ÷ 1 = 1.5 vs
// 1.5 ÷ 0.5 = 3; DDPM target −1 vs 3; step 번호 1 ~ 1000 vs t 0 ~ 1); check ε 1.5, x₁ 2 → 0.5, 1.5 + 0.4 × 0.5 = 1.7;
// Euler (Δt = 1 ÷ n; v = 2t: n 1 / 2 / 4 / 10 → 0 / 0.5 / 0.75 / 0.9, error 1 ÷ n; check n = 5: 0.2 × (0 + 0.4 + 0.8 +
// 1.2 + 1.6) = 0.2 × 4 = 0.8, error 0.2); network 0.02 초: 1000 / 100 / 10 step → 20 / 2 / 0.2 초; step 1 vs 1000, 999;
// crossing (±2 반반, pair A −2 → +2 speed 4, pair B 2 → −2 speed −4, meet at t 0.5, x 0; loss table c 4 / 2 / 0 / −2 →
// 32 / 20 / 16 / 20); check 4, 4, −4 → (4 + 4 − 4) ÷ 3 ≈ 1.33; steps (ε 0.5: n 1 / 2 / 4 / 10 → 0 / 1.52 / 2.00 / 2.00;
// t 0: 0.5 × 2 + 0.5 × (−2) = 0; noise 20000 개, 0.3 넘게 벗어난 비율 FM 100 / 47 / 1 / 0 %, DDPM 100 / 97 / 29 / 약 0.2 %;
// CIFAR-10 274 vs 142; ImageNet 32×32 약 60%); π0 (PaliGemma weight 30 억 개, action expert 3 억 개, H = 50, 25 개 = 0.5 초,
// δ = 0.1, 10 step; 14 + 32 + 27 = 73 ms, 27 ÷ 10 = 2.7 ms); GR00T N1 (H = 16, K = 4, L40 63.9 ms; ε − A vs A − ε; openpi
// time = 1 is noise, noise − actions, dt = −1/num_steps = −0.1); check A 0.5, ε 1.5: −1 → 1.5 + 4 × (−0.25) = 0.5,
// +1 → 1.5 + 4 × 0.25 = 2.5.

const S1 = '직선과 정답 속도'
const S2 = 'Euler 법과 step 수'
const S3 = '봉우리 둘과 diffusion'
const S4 = 'π0 · GR00T N1'

export const script: VideoScript = {
  id: 'flow-matching',
  title: 'Flow Matching',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/flow-matching',
  sections: [S1, S2, S3, S4],
  terms: [
    ['conditional flow matching loss', '컨디셔널 플로우 매칭 로스'],
    ['marginal velocity field', '마지널 벨로시티 필드'],
    ['target velocity', '타깃 벨로시티'],
    ['Diffusion Policy', '디퓨전 폴리시'],
    ['flow matching', '플로우 매칭'],
    ['action expert', '액션 엑스퍼트'],
    ['action chunk', '액션 청크'],
    ['PaliGemma', '팔리젬마'],
    ['diffusion', '디퓨전'],
    ['CIFAR-10', '사이파 텐'],
    ['GR00T N1', '그루트 엔 원'],
    ['network', '네트워크'],
    ['actions', '액션즈'],
    ['encoder', '인코더'],
    ['openpi', '오픈파이'],
    ['Lipman', '립먼'],
    ['sample', '샘플'],
    ['weight', '웨이트'],
    ['NVIDIA', '엔비디아'],
    ['Euler', '오일러'],
    ['noise', '노이즈'],
    ['chunk', '청크'],
    ['time', '타임'],
    ['DDPM', '디디피엠'],
    ['DDIM', '디디아이엠'],
    ['RTX', '알티엑스'],
    ['VLM', '브이엘엠'],
    ['L40', '엘 사십'],
    ['π0', '파이 제로'],
    ['Δt', '델타 티'],
    ['τ', '타우'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Flow Matching 은 noise 와 데이터를 잇는 직선 위의 속도를 network 가 맞히게 학습하는 생성 방법입니다.'],
        [4.2, 7.8, '직선과 정답 속도, Euler 법과 step 수, 봉우리 둘과 diffusion, π0 와 GR00T N1 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Diffusion Policy 는 100 단계로 학습하고 DDIM 으로 10 단계만 밟지만, RTX 3080 에서 0.1 초가 걸립니다.'],
        [4.2, 7.8, '쓸 때만 단계를 건너뛰지 말고, 처음부터 몇 단계 만에 noise 에서 행동까지 가도록 학습할 수는 없을까요?'],
      ],
    },
    {
      id: 'line',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'DDPM 은 step 하나에 network 를 한 번 쓰는데, 한 step 의 변화가 작다는 가정이라 크게 건너뛰면 맞지 않습니다.'],
        [6.5, 13, 'noise −1 과 데이터 2 를 처음부터 직선으로 이으면, t 가 0.25 늘 때마다 0.75 씩 일정하게 움직입니다.'],
        [
          13,
          20,
          '직선 위 시각 t 의 점은 (1 − t) × ε + t × 데이터라서, t 가 0 이면 noise 이고 1 이면 데이터입니다.',
          '직선 위 시각 t 의 점은 1 빼기 t 에 엡실론을 곱하고 t 에 데이터를 곱해 더한 값이라서, t 가 0 이면 noise 이고 1 이면 데이터입니다.',
        ],
        [
          20,
          27.6,
          '속도는 0.75 ÷ 0.25 로 3 이고 데이터 − noise 인 2 − (−1) 과 같은데, 이 값이 target velocity 입니다.',
          '속도는 0.75 ÷ 0.25 로 3 이고 데이터 빼기 noise 인 2 빼기 −1 과 같은데, 이 값이 target velocity 입니다.',
        ],
      ],
    },
    {
      id: 'cfm-loss',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, '생성할 때는 noise 의 짝을 모르므로, network 가 지금 위치와 시각 t 를 받아 그 자리의 속도를 대신 냅니다.'],
        [6.5, 13, '학습 한 step 에서는 데이터 하나와 noise 를 뽑고, 0 과 1 사이에서 t 를 고르게 뽑아 직선 위의 점을 만듭니다.'],
        [
          13,
          19.5,
          '데이터 2, noise −1, t 0.5 면 점은 0.5 이고, 출력이 2.5 면 loss 는 (3 − 2.5)² 로 0.25 입니다.',
          '데이터 2, noise −1, t 0.5 면 점은 0.5 이고, 출력이 2.5 면 loss 는 3 빼기 2.5 의 제곱으로 0.25 입니다.',
        ],
        [19.5, 24.5, 'Lipman 등은 쌍 하나를 조건으로 두고 계산하는 이 loss 를 conditional flow matching loss 라 불렀습니다.'],
        [24.5, 29.7, 'DDPM 과 학습 순서는 같고 맞히는 값만 다릅니다. 이 예의 정답은 DDPM 이 −1 이고 flow matching 이 3 입니다.'],
      ],
    },
    {
      id: 'pause-target',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. noise 1.5, 데이터 2 일 때 target velocity 와 t 0.4 의 점은 얼마일까요?'],
        [
          16.5,
          23.5,
          'target velocity 는 2 − 1.5 로 0.5 이고, t 0.4 의 점은 1.5 + 0.4 × 0.5 로 1.7 입니다.',
          'target velocity 는 2 빼기 1.5 로 0.5 이고, t 0.4 의 점은 1.5 더하기 0.4 × 0.5 로 1.7 입니다.',
        ],
      ],
    },
    {
      id: 'euler',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'Euler 법은 0 부터 1 까지를 n 토막으로 잘라, 한 토막 동안은 속도가 그대로라고 보고 직진하기를 되풀이합니다.'],
        [
          6.5,
          13,
          '새 위치는 지금 위치 + Δt × 속도이고 Δt 는 1 ÷ n 이라서, step 하나에 network 를 한 번 씁니다.',
          '새 위치는 지금 위치에 Δt 곱하기 속도를 더한 값이고 Δt 는 1 ÷ n 이라서, step 하나에 network 를 한 번 씁니다.',
        ],
        [
          13,
          19.8,
          '경로가 직선이면 오차가 없습니다. 속도가 줄곧 3 인 점은 1 step 이어도 −1 + 1 × 3 으로 2 에 정확히 닿습니다.',
          '경로가 직선이면 오차가 없습니다. 속도가 줄곧 3 인 점은 1 step 이어도 −1 더하기 1 × 3 으로 2 에 정확히 닿습니다.',
        ],
        [
          19.8,
          27.6,
          '속도가 2t 로 커지면 덜 가서, step 1·2·4·10 에서 0·0.5·0.75·0.9 에 닿고 오차는 1 ÷ n 입니다.',
          '속도가 2 곱하기 t 로 커지면 덜 가서, step 1·2·4·10 에서 0·0.5·0.75·0.9 에 닿고 오차는 1 ÷ n 입니다.',
        ],
      ],
    },
    {
      id: 'cost',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'network 한 번에 0.02 초라면 1000 step 은 20 초가 걸리고, 10 step 은 0.2 초가 걸립니다.'],
        [6.5, 12.5, '걸리는 시간은 network 를 쓰는 횟수에 그대로 비례해서, 오차를 줄이려고 step 을 늘리면 그만큼 느려집니다.'],
        [12.5, 18.8, 'flow matching 이 경로를 직선으로 정하는 것은 step 을 늘리지 않고도 오차를 줄이기 위해서입니다.'],
        [18.8, 25.6, 'step 은 많을수록 좋은 것이 아닙니다. 직선 경로에서는 1 번과 1000 번의 결과가 같아 나머지 999 번은 시간만 씁니다.'],
      ],
    },
    {
      id: 'pause-euler',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 속도가 2t 인 점을 0 에서 출발시켜 5 step 으로 걸으면, t 가 1 일 때 위치와 오차는 얼마일까요?',
          '멈추고 적어 보기. 속도가 2 곱하기 t 인 점을 0 에서 출발시켜 5 step 으로 걸으면, t 가 1 일 때 위치와 오차는 얼마일까요?',
        ],
        [16.5, 23.5, 'Δt 0.2 에 속도가 0, 0.4, 0.8, 1.2, 1.6 이라 위치는 0.2 × 4 로 0.8 이고, 오차는 0.2 입니다.'],
      ],
    },
    {
      id: 'crossing',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '데이터가 +2 와 −2 반반이면 봉우리가 둘이고, noise 와 무작위로 짝지은 직선들은 서로 엇갈립니다.'],
        [6.5, 13, 'noise −2 에서 +2 로 가는 직선과 2 에서 −2 로 가는 직선은 t 0.5 에 0 에서 만나고, 속도는 4 와 −4 입니다.'],
        [13, 19.5, 'network 는 같은 입력에 한 값만 내므로, 평균 loss 는 두 정답의 평균 0 을 낼 때 16 으로 가장 작습니다.'],
        [19.5, 25.5, '그래서 network 는 그 자리를 지나는 쌍들의 정답 속도 평균을 배우고, 이것이 marginal velocity field 입니다.'],
        [25.5, 29.7, '한 자리의 속도는 하나뿐이라 학습된 경로는 엇갈리지 않고, 양수 noise 는 +2 로 가고 음수 noise 는 −2 로 갑니다.'],
      ],
    },
    {
      id: 'steps-quality',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '마지막 step 은 남은 시간을 한 번에 가서, 결과가 그 step 을 시작하는 자리에서 추정한 데이터의 평균과 같습니다.'],
        [6.5, 13, '1 step 이면 t 0 에서 두 데이터의 평균 0 으로 가서 모든 sample 이 0 이고, 0 은 데이터 어디에도 없는 값입니다.'],
        [
          13,
          19,
          'noise 0.5 에서 출발하면 sample 은 2 step 에서 1.52 이고, 4 step 과 10 step 에서는 2.00 입니다.',
          'noise 0.5 에서 출발하면 sample 은 2 step 에서 1.52 이고, 4 step 과 10 step 에서는 2 입니다.',
        ],
        [19, 25, 'noise 20000 개로 세면 봉우리를 벗어난 sample 이 1·2·4·10 step 에서 100%·47%·1%·0% 입니다.'],
        [25, 29.7, 'DDPM 은 같은 조건의 4 step 에서 29% 였고, CIFAR-10 의 network 사용은 평균 274 번 대 142 번이었습니다.'],
      ],
    },
    {
      id: 'pause-mean',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 자리를 지나는 쌍 셋의 target velocity 가 4, 4, −4 면 network 는 무엇을 배울까요?'],
        [
          16.5,
          23.5,
          'loss 를 가장 작게 하는 출력은 세 정답의 평균이라 (4 + 4 − 4) ÷ 3 으로 약 1.33 이고, +2 쪽으로 기웁니다.',
          'loss 를 가장 작게 하는 출력은 세 정답의 평균이라 4 더하기 4 빼기 4 를 3 으로 나눠 약 1.33 이고, +2 쪽으로 기웁니다.',
        ],
      ],
    },
    {
      id: 'pi0',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'π0 는 VLM 인 PaliGemma 옆에, flow matching 으로 action 을 만드는 action expert 를 붙였습니다.'],
        [6.5, 13, 'action expert 는 50 step 의 action chunk 를 한꺼번에 만들고, 그중 25 개인 0.5 초 분량을 실행합니다.'],
        [
          13,
          19.5,
          'π0 논문은 시각을 τ 로 적고 τ 0 을 noise 로 두며, 한 step 길이 0.1 로 Euler step 을 10 번 밟습니다.',
        ],
        [19.5, 25.5, 'VLM 이 관측을 읽는 계산은 chunk 하나에 한 번만 하고, step 마다 작은 action expert 만 다시 계산합니다.'],
        [25.5, 29.7, 'RTX 4090 에서 이미지 encoder 14 ms, VLM 32 ms, action expert 27 ms 로 합계 73 ms 입니다.'],
      ],
    },
    {
      id: 'groot',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'NVIDIA 의 GR00T N1 은 action 16 개를 Euler 4 step 으로 만들고, L40 에서 63.9 ms 가 걸렸습니다.'],
        [
          6.5,
          13.5,
          'GR00T N1 의 식 (1) 은 정답 속도를 ε − A 로 적었지만, noise 에서 출발해 속도를 더하려면 A − ε 이어야 합니다.',
          'GR00T N1 의 식 1 은 정답 속도를 엡실론 빼기 A 로 적었지만, noise 에서 출발해 속도를 더하려면 A 빼기 엡실론 이어야 합니다.',
        ],
        [
          13.5,
          20.5,
          'openpi 코드는 time 1 을 noise 로 두고 정답 속도도 noise − actions 로 두어, 방향과 부호를 함께 뒤집었습니다.',
          'openpi 코드는 time 1 을 noise 로 두고 정답 속도도 noise 빼기 actions 로 두어, 방향과 부호를 함께 뒤집었습니다.',
        ],
        [20.5, 27.6, '실행 중인 chunk 가 끝나기 전에 다음 chunk 가 나와야 로봇이 멈추지 않으므로, 이 계산 시간이 step 수를 정합니다.'],
      ],
    },
    {
      id: 'pause-sign',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 시연 0.5, noise 1.5 에서 정답을 A − ε 과 ε − A 로 학습하면 4 step 뒤 어디일까요?',
          '멈추고 적어 보기. 시연 0.5, noise 1.5 에서 정답을 A 빼기 엡실론과 엡실론 빼기 A 로 학습하면 4 step 뒤 어디일까요?',
        ],
        [
          16.5,
          23.5,
          'A − ε 은 속도 −1 로 step 마다 −0.25 씩 가서 0.5 에 닿고, ε − A 는 2.5 에 닿아 시연에서 멀어집니다.',
          'A 빼기 엡실론은 속도 −1 로 step 마다 −0.25 씩 가서 0.5 에 닿고, 엡실론 빼기 A 는 2.5 에 닿아 시연에서 멀어집니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. noise 와 데이터를 직선으로 잇고, 그 위의 일정한 속도인 데이터 − noise 를 network 가 맞히게 학습합니다.', '답입니다. noise 와 데이터를 직선으로 잇고, 그 위의 일정한 속도인 데이터 빼기 noise 를 network 가 맞히게 학습합니다.'],
        [4.2, 8.2, 'Euler 법은 직선 경로에서 오차가 없어서, step 을 늘려 시간을 쓰지 않고도 큰 step 몇 번으로 데이터에 닿습니다.'],
        [8.2, 12.2, '봉우리가 여럿이면 1 step 은 평균을 내지만, 4 step 이면 벗어난 sample 이 1% 로 DDPM 의 29% 보다 적습니다.'],
        [
          12.2,
          15.7,
          'action chunk 는 π0 가 10 step 으로 만들고 GR00T N1 이 4 step 으로 만들며, 정답 속도는 A − ε 입니다.',
          'action chunk 는 π0 가 10 step 으로 만들고 GR00T N1 이 4 step 으로 만들며, 정답 속도는 A 빼기 엡실론 입니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'VLM 으로 이미지와 지시문을 읽어 조건으로 넣고, 그 계산을 10 step 동안 다시 쓰며 실행하는 방법은 π0 에서 다룹니다.']],
    },
  ],
}
