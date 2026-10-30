import type { VideoScript } from '../script.ts'

// Numbers follow lessons/perceptron/README.md: Rosenblatt 1958, the gripper's two contact sensors (1 / 0) and the four-row
// truth table (AND 0 0 0 1, OR 0 1 1 1, XOR 0 1 1 0); weighted sum with w = [1, 1], b = −1.5 (sums 0, 1, 1, 2 → z −1.5,
// −0.5, −0.5, 0.5 → ŷ 0, 0, 0, 1 = AND) and b = −0.5 (z −0.5, 0.5, 0.5, 1.5 → OR); threshold θ 0.5 / 1.5 / 2.5, b = −θ;
// decision boundary x₁ + x₂ = 1.5 through (0, 1.5), (0.5, 1), (1, 0.5), (1, 1) at z = 0.5; b = −0.5 / −1.5 / −2.5 → lines
// 0.5 / 1.5 / 2.5 with 3 / 1 / 0 points on the 1 side; × 2 → w = [2, 2], b = −3, z −3, −1, −1, 1; check question b = −0.5
// → x₁ + x₂ = 0.5, (0, 1), (1, 0), (1, 1); the learning rule from w = [0, 0], b = 0 with η = 0.1 (error 1 − 0 = +1, each
// 0 + 0.1 × (+1) × 1 = 0.1, z 0.1 × 1 + 0.1 × 1 + 0.1 = 0.3), errors −1 / 0 / +1; AND online update with η = 0.1: wrong
// counts 1, 3, 3, 2, 1, 0 over 6 epochs, epoch-end numbers 0.1, 0.1, 0.1 / 0.2, 0.1, 0 / 0.2, 0.1, −0.1 / 0.2, 0.2, −0.1
// / 0.2, 0.1, −0.2 / 0.2, 0.1, −0.2, 10 wrong in 24 steps, w = [0.2, 0.1], b = −0.2 → × 10 → 2x₁ + x₂ = 2, (1, 0) at
// z = 0.2 − 0.2 = 0; batch update 4 epochs → x₁ + x₂ = 1; η = 1.0 → same wrong steps, 6 epochs, [2, 1], −2 (10×); check
// question w = [0.2, 0.1], b = 0, η = 0.1, input [0, 1] → z = 0.1, ŷ = 1, error 0 − 1 = −1, w = [0.2, 0], b = −0.1,
// new z = −0.1; Novikoff 1962; XOR's crossing at (0.5, 0.5); XOR with η = 1: wrong 2, 3, 4, 4, …, states A [−1, 0], 1 →
// B [−1, 0], 0 → C [−1, 1], 1 → D [0, 1], 2, 1,000 epochs → 2 + 3 + 4 × 998 = 3997; two layers OR (w [1, 1], b −0.5),
// NAND (w [−1, −1], b 1.5), AND (w [1, 1], b −1.5), [0, 0] → h₁ z −0.5 → 0, h₂ z 1.5 → 1, output 0 + 1 − 1.5 = −0.5 → 0;
// band between x₁ + x₂ = 0.5 and 1.5; step vs sigmoid at w₁ 0.20 / 0.21 (z 0.10 / 0.11, step 1 / 1, sigmoid 0.5250 /
// 0.5275, +0.01 → +0.0025); legged_gym ANYmal C flat policy: 48 inputs (3 + 3 + 3 + 3 + 12 + 12 + 12), ELU, hidden 128,
// 64, 32, 12 joint targets, every 0.02 s = 50 a second = 0.005 s × 4, PD controller on the real robot, actuator network in
// simulation; parameters 48 × 128 + 128 = 6,272, 128 × 64 + 64 = 8,256, 64 × 32 + 32 = 2,080, 32 × 12 + 12 = 396, total
// 17,004; Rudin et al. one GPU, thousands of robots, under 4 minutes; no activation: h = 2x + 1, ŷ = 3h − 1 → 6x + 2;
// check question 6 × 32 = 192, 192 + 32 = 224.

const S1 = 'weighted sum 과 직선'
const S2 = '학습 규칙과 epoch'
const S3 = 'XOR 와 두 층'
const S4 = '로봇 policy 의 MLP'

export const script: VideoScript = {
  id: 'perceptron',
  title: 'Perceptron',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/perceptron',
  sections: [S1, S2, S3, S4],
  terms: [
    ['linearly separable', '리니어리 세퍼러블'],
    ['activation function', '액티베이션 펑션'],
    ['decision boundary', '디시전 바운더리'],
    ['credit assignment', '크레딧 어사인먼트'],
    ['gradient descent', '그레이디언트 디센트'],
    ['backpropagation', '백프로퍼게이션'],
    ['online update', '온라인 업데이트'],
    ['batch update', '배치 업데이트'],
    ['learning rate', '러닝 레이트'],
    ['step function', '스텝 펑션'],
    ['weighted sum', '웨이티드 섬'],
    ['hidden layer', '히든 레이어'],
    ['PD controller', '피디 컨트롤러'],
    ['Rudin et al.', '루딘 연구진'],
    ['truth table', '트루스 테이블'],
    ['chain rule', '체인 룰'],
    ['perceptron', '퍼셉트론'],
    ['Rosenblatt', '로젠블랫'],
    ['derivative', '디리버티브'],
    ['simulation', '시뮬레이션'],
    ['legged_gym', '레기드 짐'],
    ['ANYmal C', '애니멀 씨'],
    ['Novikoff', '노비코프'],
    ['network', '네트워크'],
    ['sigmoid', '시그모이드'],
    ['weight', '웨이트'],
    ['sample', '샘플'],
    ['torque', '토크'],
    ['epoch', '에포크'],
    ['bias', '바이어스'],
    ['unit', '유닛'],
    ['NAND', '낸드'],
    ['XOR', '엑스오어'],
    ['AND', '앤드'],
    ['MLP', '엠엘피'],
    ['ELU', '이엘유'],
    ['GPU', '지피유'],
    ['OR', '오어'],
    ['x₁', '엑스 일'],
    ['x₂', '엑스 이'],
    ['w₁', '더블유 일'],
    ['w₂', '더블유 이'],
    ['h₁', '에이치 일'],
    ['h₂', '에이치 이'],
    ['ŷ', '와이 햇'],
    ['θ', '세타'],
    ['η', '에타'],
    ['z', '제트'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'perceptron 은 입력에 weight 를 곱해 더한 값이 0 을 넘는지로 답하는, 1958 년 Rosenblatt 의 기계입니다.'],
        [4.2, 7.8, 'weighted sum 과 직선, 학습 규칙과 epoch, XOR 와 두 층, 로봇 policy 의 MLP 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '집게 두 손가락 끝의 접촉 센서는 닿으면 1, 안 닿으면 0 을 내고, 기계에는 예시 네 줄만 보여 줍니다.'],
        [4.4, 7.8, '"둘 다 닿았나" 는 몇 번 만에 배우는데, "한쪽만 닿았나" 는 왜 아무리 오래 학습해도 배우지 못할까요?'],
      ],
    },
    {
      id: 'weighted-sum',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'AND 는 둘 다 1 일 때만 1 이고, OR 는 하나라도 1 이면 1 이고, XOR 는 두 입력이 다를 때만 1 입니다.'],
        [6.5, 12.5, 'perceptron 은 입력마다 weight 를 곱해 더하고, 늘 더하는 숫자 bias 를 붙여 weighted sum z 를 만듭니다.'],
        [12.5, 18.5, 'w 를 1, 1 로 두고 b 를 −1.5 로 두면, 네 입력의 z 는 차례로 −1.5, −0.5, −0.5, 0.5 입니다.'],
        [18.5, 24.5, 'step function 은 z 가 0 보다 클 때만 1 을 내서 예측이 0, 0, 0, 1 이고, AND 의 정답과 같습니다.'],
        [24.5, 29.7, 'b 만 −0.5 로 바꾸면 OR 가 됩니다. bias 는 Rosenblatt 논문의 문턱 θ 에 마이너스를 붙인 수입니다.'],
      ],
    },
    {
      id: 'boundary',
      seconds: 28,
      section: S1,
      cues: [
        [
          0.3,
          7,
          'z 가 0 인 점들이 이루는 직선이 decision boundary 이고, w 1, 1 과 b −1.5 면 x₁ + x₂ = 1.5 입니다.',
          'z 가 0 인 점들이 이루는 직선이 decision boundary 이고, w 1, 1 과 b −1.5 면 x₁ 더하기 x₂ 가 1.5 인 직선입니다.',
        ],
        [7, 13.5, '직선 한쪽은 z 가 0 보다 커서 1 로 예측하는데, 그쪽에 있는 점은 정답이 1 인 1, 1 하나뿐입니다.'],
        [13.5, 20.5, 'w 를 그대로 두고 b 를 −0.5, −1.5, −2.5 로 줄이면 평행한 직선이 멀어져 1 쪽 점이 3 개, 1 개, 0 개가 됩니다.'],
        [20.5, 27.7, 'weight 는 직선의 방향을 정하고 bias 는 위치를 정합니다. b 가 0 이면 직선이 원점을 지나서 AND 를 가를 수 없습니다.'],
      ],
    },
    {
      id: 'pause-boundary',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. w 가 1, 1 이고 b 가 −0.5 면 decision boundary 는 어떤 직선이고, 1 쪽의 점은 무엇일까요?'],
        [
          16.5,
          23.5,
          'x₁ + x₂ = 0.5 입니다. z 가 −0.5, 0.5, 0.5, 1.5 라서 원점만 0 쪽에 남으니 OR 를 계산합니다.',
          'x₁ 더하기 x₂ 가 0.5 인 직선입니다. z 가 −0.5, 0.5, 0.5, 1.5 라서 원점만 0 쪽에 남으니 OR 를 계산합니다.',
        ],
      ],
    },
    {
      id: 'rule',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '학습은 w 와 b 를 모두 0 에서 시작합니다. AND 의 입력 1, 1 을 보면 z 가 0 이라 0 으로 예측해 틀립니다.'],
        [7, 14, '오차는 정답 빼기 예측인 +1 이라 weight 와 bias 에 0.1 씩 더하고, 같은 입력의 z 는 0 에서 0.3 이 됩니다.'],
        [14, 21, '학습 규칙은 weight 에 η × 오차 × 입력을 더하는 식이고, η 는 한 번에 고치는 크기인 learning rate 입니다.'],
        [21, 27.7, '맞힌 sample 은 오차가 0 이라 숫자가 그대로라서, perceptron 은 틀린 sample 에서만 숫자를 고칩니다.'],
      ],
    },
    {
      id: 'epochs',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '네 sample 을 한 번씩 다 보는 것이 epoch 이고, 틀리면 그 자리에서 바로 고치는 방식이 online update 입니다.'],
        [7, 14, 'η 0.1 로 AND 를 학습하면 epoch 별 틀린 수가 1, 3, 3, 2, 1, 0 이라 6 epoch 에 수렴합니다.'],
        [
          14,
          21,
          '학습한 w 는 0.2, 0.1 이고 b 는 −0.2 라서, 10 을 곱하면 decision boundary 는 2x₁ + x₂ = 2 입니다.',
          '학습한 w 는 0.2, 0.1 이고 b 는 −0.2 라서, 10 을 곱하면 decision boundary 는 이 x₁ 더하기 x₂ 가 2 인 직선입니다.',
        ],
        [21, 27.7, 'η 를 1.0 으로 10 배 키워도 틀린 step 과 6 epoch, 직선이 같습니다. 0 에서 시작하면 숫자만 10 배가 됩니다.'],
      ],
    },
    {
      id: 'pause-update',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. w 0.2, 0.1, b 0, η 0.1 에서 AND 의 입력 0, 1 을 봤습니다. 예측과 고친 뒤의 w, b 는?'],
        [16.5, 23.5, 'z 가 0.1 이라 1 로 예측해 틀리고, 오차 −1 로 w 는 0.2, 0 이 되고 b 는 −0.1 이 되어 z 는 −0.1 입니다.'],
      ],
    },
    {
      id: 'xor',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '0 인 점과 1 인 점을 직선 하나로 가를 수 있으면 linearly separable 하다고 하고, AND 와 OR 가 그렇습니다.'],
        [6.5, 12.5, '1962 년 Novikoff 는 linearly separable 하면 학습 규칙이 유한한 횟수만 틀린 뒤 반드시 수렴함을 증명했습니다.'],
        [12.5, 18.5, 'XOR 는 1 인 두 점과 0 인 두 점이 정사각형의 두 대각선에 엇갈려 놓이고, 두 대각선은 가운데서 만납니다.'],
        [18.5, 24.5, '한쪽에 있는 두 점을 잇는 선분은 통째로 같은 쪽이라, 가운데 점은 1 쪽이면서 0 쪽이어야 해서 직선이 없습니다.'],
        [24.5, 29.7, 'η 1 로 학습하면 epoch 3 부터 네 상태를 돌며 네 sample 을 다 틀리고, 1,000 epoch 에 3997 번 틀립니다.'],
      ],
    },
    {
      id: 'two-layer',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'XOR 는 OR 와 "둘 다 1 은 아니다" 인 NAND 가 동시에 참일 때 1 이라, 두 결과를 AND 에 넣으면 됩니다.'],
        [6.5, 12.5, 'NAND 는 AND 의 숫자에 −1 을 곱한 w −1, −1 과 b 1.5 이고, 첫 층에 OR 인 h₁ 과 NAND 인 h₂ 를 둡니다.'],
        [12.5, 18.5, '입력 1, 1 은 OR 로는 1 이지만 NAND 가 0 을 내서 걸러지고, 출력은 두 직선 사이의 띠만 1 로 예측합니다.'],
        [18.5, 24.5, '정답이 있는 것은 출력 unit 뿐이라서, hidden layer 의 숫자는 perceptron 학습 규칙으로 찾을 수 없습니다.'],
        [24.5, 29.7, 'step function 은 w₁ 을 0.20 에서 0.21 로 바꿔도 출력이 1 그대로지만, sigmoid 출력은 0.0025 늘어납니다.'],
      ],
    },
    {
      id: 'pause-xor',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 두 층 XOR network 에 입력 0, 0 을 넣으면 h₁, h₂ 와 출력의 z 는 각각 얼마일까요?'],
        [
          16.5,
          23.5,
          'h₁ 의 z 는 −0.5 라 0 이고 h₂ 의 z 는 1.5 라 1 입니다. 출력의 z 는 0 + 1 − 1.5 로 −0.5 라 0 입니다.',
          'h₁ 의 z 는 −0.5 라 0 이고 h₂ 의 z 는 1.5 라 1 입니다. 출력의 z 는 0 더하기 1 빼기 1.5 로 −0.5 라 0 입니다.',
        ],
      ],
    },
    {
      id: 'mlp',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'step function 을 매끄러운 activation function 으로 바꾼 unit 을 여러 층 쌓은 것이 MLP 입니다.'],
        [7, 13.5, 'legged_gym 의 ANYmal C 평지 보행 policy 는 몸의 상태와 속도 명령을 나타내는 숫자 48 개를 받습니다.'],
        [13.5, 20.5, '이 숫자들은 ELU 를 쓰는 unit 128 개, 64 개, 32 개짜리 hidden layer 를 거쳐 관절 12 개의 목표 각도가 됩니다.'],
        [20.5, 27.7, 'policy 는 0.02 초마다 한 번 목표 각도를 내고, 실제 로봇에서는 PD controller 가 이를 torque 로 바꿉니다.'],
      ],
    },
    {
      id: 'params',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, '층마다 weight 는 입력 수 × unit 수 만큼 있고 bias 는 unit 수 만큼 있어서, 첫 층은 6,272 개입니다.'],
        [7, 13.5, '나머지 층은 8,256 개, 2,080 개, 396 개라서, 이 policy 가 학습하는 숫자는 모두 17,004 개입니다.'],
        [13.5, 20.5, 'Rudin et al. 은 GPU 하나로 로봇 수천 대를 동시에 simulation 해서, 이 평지 policy 를 4 분 안에 학습했습니다.'],
        [20.5, 27.7, '층을 쌓아도 activation function 이 없으면 weighted sum 하나와 같아서, 경계는 여전히 직선 하나입니다.'],
      ],
    },
    {
      id: 'pause-params',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 입력 6 개를 받는 unit 32 개짜리 층의 weight 와 bias 는 모두 몇 개일까요?'],
        [
          16.5,
          23.5,
          'weight 는 6 × 32 로 192 개이고 bias 는 unit 수와 같은 32 개라서, 모두 192 + 32 로 224 개입니다.',
          'weight 는 6 × 32 로 192 개이고 bias 는 unit 수와 같은 32 개라서, 모두 192 더하기 32 로 224 개입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. perceptron 은 z 가 0 보다 큰지만 보므로, 평면에 decision boundary 라는 직선 하나를 긋습니다.'],
        [
          4.2,
          8.2,
          '"둘 다 닿았나" 인 AND 는 linearly separable 해서 6 epoch 만에 2x₁ + x₂ = 2 를 찾습니다.',
          '"둘 다 닿았나" 인 AND 는 linearly separable 해서 6 epoch 만에 이 x₁ 더하기 x₂ 가 2 인 직선을 찾습니다.',
        ],
        [8.2, 12.2, '"한쪽만 닿았나" 인 XOR 는 직선 하나로 가를 수 없어서, 네 상태를 돌며 1,000 epoch 에 3997 번 틀립니다.'],
        [12.2, 15.7, '두 층이면 XOR 를 표현하고, step 을 매끄러운 함수로 바꿔 여러 층 쌓은 것이 로봇 policy 의 MLP 입니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'chain rule 로 hidden layer 의 derivative 까지 구하는 계산은 다음 강의 Backpropagation 에서 다룹니다.']],
    },
  ],
}
