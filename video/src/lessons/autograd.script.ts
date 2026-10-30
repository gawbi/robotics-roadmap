import type { VideoScript } from '../script.ts'

// Numbers follow lessons/autograd/README.md: the opening (ACT 약 8천만 parameter, 8천만 × 2 = 1억 6천만 번, 11 GB RTX
// 2080 Ti 에서 약 5 시간, loss.backward()); the computational graph L = (a × b + c) × f with a 2, b −3, c 10, f −2 (p = −6,
// d = 4, L = −8; local derivative 덧셈 1, 곱셈 다른 입력, sigmoid σ(1 − σ); p −6 → −5.99, d 4 → 4.01, 비율 1; d 4 → 4.01,
// L −8 → −8.02, 비율 −2); backward (L 1, d −2, f 4, p −2, c −2, a 6, b −4; a 2 → 2.01, L −8 → −7.94, 0.06 ÷ 0.01 = 6 =
// (−3) × 1 × (−2); check a 1, b 4, c −1, f 3 → p 4, d 3, L 9, f 3, d 3, p 3, a 12, b 3); fan-out (q = a × b, L = q + a,
// a 3, b 2 → q 6, L 9, 2 + 1 = 3, b 의 gradient 1 × a = 3; a 3.01 → q 6.02, L 9.03, 0.03 ÷ 0.01 = 3; L = a × a → 3 + 3 = 6
// = 2a, 덮어쓰면 3; topological order a b p c d f L, backward L f d c p b a with 1 4 −2 −2 −2 −4 6; p before d → 0);
// reverse-mode (9 × 2 = 18 / 9 / 1 + 1 = 2 번; 8천만 × 2 = 1억 6천만 / 8천만 / 2 번; Baydin ≤ 6 배, 보통 2 ~ 3 배); the XOR
// network (3 × 3 = 9 parameter; w₁₁ = w₁₂ = 1, b₁ = 0, w₂₁ = w₂₂ = 1, b₂ = −1, v₁ = 1, v₂ = −1, b₃ = 0; input [1, 0]: h₁ =
// σ(1) = 0.7311, h₂ = σ(0) = 0.5, z₃ = 0.2311, ŷ = 0.5575, 오차 제곱 0.1958; backward ŷ −0.8850, z₃ −0.2183, h₁ −0.2183, h₂
// +0.2183, z₁ −0.0429 (× 0.1966), z₂ 0.0546 (× 0.25); 4 ~ 5 분의 1; check v₁ = 2 → h₁ −0.4366, z₁ −0.0858 not used);
// vanishing (step 0 평균 gradient b₃ 0.0264, w₁₁ −0.0037, 7 분의 1; loss 0.2478 → 0.2270 at step 100, 0.0258 at 500, 0.0059
// at 1,000, 0.0020 at 2,000, 200 ~ 500 step 에 급히 떨어짐; 0.25ⁿ 0.25 / 0.0625 / 0.0156 / 0.00098 / 0.00000095 for 1 / 2 /
// 3 / 5 / 10 층, 1000 분의 1 이하; check 0.25³ = 0.0156, 0.9 × 0.1 = 0.09, 0.09³ ≈ 0.00073; ReLU 기울기 1, ResNet18);
// initialisation (η = 1, 2,000 step: h₁ 5.64 / −2.40 → 0.43, h₂ 4.12 / −6.33 → 1.54, v₁ 7.84, v₂ −8.35, b₃ −3.61, 예측
// 0.048 / 0.957 / 0.045; same start [1, 1], bias 0, v 1 → −0.0113 both, 2,000 step 뒤 5.34 / −0.38, 예측 0.069 / 0.662 /
// 0.670, loss 0.1708, 20,000 step 0.167 근처; 모두 0 → gradient 9 개 0; nn.Linear ±1/√입력 수, 입력 2 개 ±0.71; check 4
// neuron → 직선 1 개); PyTorch autograd (MulBackward0 saves d = 4, f = −2, AddBackward0, MulBackward0 saves a = 2, b = −3,
// AccumulateGrad; a.grad 6, b.grad −4, c.grad −2, f.grad 4; L = q + a 를 다시 계산해 backward 한 번 더 → 3 + 3 = 6;
// select_action @torch.no_grad(); SmolVLA 약 4억 5천만 중 약 1억 학습, VLM requires_grad = False).

const S1 = 'graph 와 backward'
const S2 = '누적과 reverse-mode'
const S3 = 'XOR 와 vanishing'
const S4 = '초기화와 autograd'

export const script: VideoScript = {
  id: 'autograd',
  title: 'Backpropagation',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/autograd',
  sections: [S1, S2, S3, S4],
  terms: [
    ['automatic differentiation', '오토매틱 디퍼렌시에이션'],
    ['PyTorch Training Loop', '파이토치 트레이닝 루프'],
    ['topological order', '토폴로지컬 오더'],
    ['credit assignment', '크레딧 어사인먼트'],
    ['local derivative', '로컬 데리버티브'],
    ['Backpropagation', '백프로퍼게이션'],
    ['AccumulateGrad', '어큐뮬레이트 그래드'],
    ['torch.no_grad()', '토치 닷 노 그래드'],
    ['requires_grad', '리콰이어스 그래드'],
    ['select_action', '셀렉트 액션'],
    ['MulBackward0', '멀 백워드 제로'],
    ['AddBackward0', '애드 백워드 제로'],
    ['.backward()', ' 닷 백워드'],
    ['reverse-mode', '리버스 모드'],
    ['forward-mode', '포워드 모드'],
    ['nn.Linear', '엔엔 닷 리니어'],
    ['vanishing', '배니싱'],
    ['gradient', '그레이디언트'],
    ['parameter', '파라미터'],
    ['backward', '백워드'],
    ['autograd', '오토그래드'],
    ['ResNet18', '레즈넷 십팔'],
    ['PyTorch', '파이토치'],
    ['LeRobot', '르로봇'],
    ['SmolVLA', '스몰 브이엘에이'],
    ['network', '네트워크'],
    ['sigmoid', '시그모이드'],
    ['grad_fn', '그래드 에프엔'],
    ['forward', '포워드'],
    ['neuron', '뉴런'],
    ['hidden', '히든'],
    ['weight', '웨이트'],
    ['random', '랜덤'],
    ['update', '업데이트'],
    ['tensor', '텐서'],
    ['Baydin', '베이딘'],
    ['survey', '서베이'],
    ['False', '폴스'],
    ['.grad', ' 닷 그래드'],
    ['graph', '그래프'],
    ['bias', '바이어스'],
    ['leaf', '리프'],
    ['loop', '루프'],
    ['ReLU', '렐루'],
    ['XOR', '엑스오어'],
    ['AND', '앤드'],
    ['VLM', '브이엘엠'],
    ['OR', '오어'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Backpropagation 은 계산 graph 를 한 번 거꾸로 훑어 모든 parameter 의 gradient 를 구합니다.'],
        [4.2, 7.8, 'graph 와 backward, 누적과 reverse-mode, XOR 와 vanishing, 초기화와 autograd 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'ACT 에는 학습으로 정하는 숫자가 약 8천만 개 있는데, 시연이 주는 정답은 관절이 가야 할 목표 각도뿐입니다.'],
        [4.4, 7.8, '출력 각도가 틀렸을 때 8천만 개를 각각 어느 쪽으로 얼마나 고쳐야 하는지, 어떻게 알 수 있을까요?'],
      ],
    },
    {
      id: 'graph',
      seconds: 28,
      section: S1,
      cues: [
        [
          0.3,
          6.5,
          'L 은 (a × b + c) × f 이고, a 2, b −3, c 10, f −2 를 넣어 연산을 하나씩 forward 로 계산합니다.',
          'L 은 a 곱하기 b 더하기 c, 곱하기 f 이고, a 2, b −3, c 10, f −2 를 넣어 연산을 하나씩 forward 로 계산합니다.',
        ],
        [
          6.5,
          13,
          '곱셈 p 는 2 × −3 으로 −6 이고, 덧셈 d 는 −6 + 10 으로 4 이고, L 은 4 × −2 로 −8 입니다.',
          '곱셈 p 는 2 × −3 으로 −6 이고, 덧셈 d 는 −6 더하기 10 으로 4 이고, L 은 4 × −2 로 −8 입니다.',
        ],
        [13, 20, 'local derivative 는 연산 하나의 출력이 입력을 따라 변하는 비율이라서, 덧셈은 1 이고 곱셈은 다른 입력입니다.'],
        [
          20,
          27.5,
          'sigmoid 의 비율은 출력 × (1 − 출력) 이라서, backward 에 쓰려면 forward 값 일부를 남겨 둡니다.',
          'sigmoid 의 비율은 출력 곱하기 일 빼기 출력 이라서, backward 에 쓰려면 forward 값 일부를 남겨 둡니다.',
        ],
      ],
    },
    {
      id: 'backward',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'backward 는 L 의 gradient 1 에서 출발해, 연산마다 local derivative 하나씩만 곱하며 거슬러 갑니다.'],
        [6, 12, 'L 은 d × f 라서 d 는 1 × −2 로 −2 를 받고 f 는 4 를 받으며, 덧셈 뒤의 p 와 c 도 −2 입니다.'],
        [12, 18.5, 'p 는 a × b 라서 a 는 −2 × −3 으로 6 을 받고, b 는 −2 × 2 로 −4 를 받습니다.'],
        [18.5, 24.5, 'a 를 2 에서 2.01 로 늘리면 L 은 −8 에서 −7.94 가 되어, 0.06 ÷ 0.01 로 비율 6 이 맞습니다.'],
        [24.5, 29.7, 'gradient 는 값의 크기가 아니라 민감도라서, 가장 큰 c 10 은 gradient 가 −2 이고 작은 a 2 는 6 입니다.'],
      ],
    },
    {
      id: 'pause-backward',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 graph 에 a 1, b 4, c −1, f 3 을 넣으면 각 값의 gradient 는 얼마일까요?'],
        [16.5, 23.5, 'd 와 f 가 3 이라 f, d, p 는 3 을 받습니다. a 는 3 × 4 로 12 를 받고, b 는 3 × 1 로 3 을 받습니다.'],
      ],
    },
    {
      id: 'fanout',
      seconds: 28,
      section: S2,
      cues: [
        [
          0.3,
          6.5,
          'q 는 a × b 이고 L 은 q + a 라서, a 3 은 곱셈과 덧셈 두 곳에 쓰이고 L 에 닿는 길도 두 개입니다.',
          'q 는 a 곱하기 b 이고 L 은 q 더하기 a 라서, a 3 은 곱셈과 덧셈 두 곳에 쓰이고 L 에 닿는 길도 두 개입니다.',
        ],
        [
          6.5,
          13,
          'q 를 거친 길로 1 × b 인 2 가 들어오고 바로 가는 길로 1 이 들어와, a 의 gradient 는 2 + 1 로 3 입니다.',
          'q 를 거친 길로 1 × b 인 2 가 들어오고 바로 가는 길로 1 이 들어와, a 의 gradient 는 2 더하기 1 로 3 입니다.',
        ],
        [13, 19.5, 'a 를 3.01 로 늘리면 L 이 9 에서 9.03 이 되어 비율 3 이 맞으니, gradient 는 길마다 더해 쌓습니다.'],
        [19.5, 27.5, 'backward 는 topological order 를 뒤집어 갑니다. p 를 d 보다 먼저 하면 빈 0 이 곱해져 모두 0 이 됩니다.'],
      ],
    },
    {
      id: 'reverse',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6, 'automatic differentiation 은 graph 를 기록해 두고, 연산마다 정해진 규칙만 적용합니다.'],
        [6, 12.5, 'parameter 9 개를 하나씩 조금 바꿔 재면 9 × 2 로 18 번, forward-mode 로는 9 번 graph 를 훑습니다.'],
        [12.5, 19, 'reverse-mode 는 forward 와 backward 한 번씩 2 번이라, ACT 약 8천만 개도 1억 6천만 번 대신 2 번입니다.'],
        [
          19,
          25.7,
          'Baydin 등의 survey 에 따르면 계산량은 함수 한 번의 6 배 이하이고 보통 2 ~ 3 배이며, 대신 중간 값을 저장합니다.',
          'Baydin 등의 survey 에 따르면 계산량은 함수 한 번의 6 배 이하이고 보통 이에서 삼 배이며, 대신 중간 값을 저장합니다.',
        ],
      ],
    },
    {
      id: 'pause-fanout',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. L 이 a × a 이고 a 가 3 이면 a 의 gradient 는 얼마일까요? 덮어쓰면 얼마가 나올까요?'],
        [
          16.5,
          23.5,
          '입력마다 다른 입력 3 이 들어와 3 + 3 으로 6 이고, 2a 와 같습니다. 덮어쓰면 3 이 나옵니다.',
          '입력마다 다른 입력 3 이 들어와 3 더하기 3 으로 6 이고, 이 곱하기 a 와 같습니다. 덮어쓰면 3 이 나옵니다.',
        ],
      ],
    },
    {
      id: 'xor',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'XOR network 는 hidden neuron 두 개와 출력 neuron 하나로 되어 있고, 학습할 숫자는 3 × 3 으로 9 개입니다.'],
        [
          6.5,
          13,
          '입력 [1, 0] 을 넣으면 h₁ 은 0.7311 이고 h₂ 는 0.5 이며, 예측 ŷ 는 정답 1 보다 작은 0.5575 입니다.',
          '입력 1, 0 을 넣으면 에이치 원 은 0.7311 이고 에이치 투 는 0.5 이며, 예측 와이 햇 은 정답 1 보다 작은 0.5575 입니다.',
        ],
        [
          13,
          19.5,
          'backward 로 z₃ 가 −0.2183 을 받고, 여기에 v₁ 1 과 v₂ −1 을 곱한 값이 h₁ 과 h₂ 로 갑니다.',
          'backward 로 지 쓰리 가 −0.2183 을 받고, 여기에 브이 원 1 과 브이 투 −1 을 곱한 값이 에이치 원 과 에이치 투 로 갑니다.',
        ],
        [
          19.5,
          25.5,
          'h₁ 의 −0.2183 은 음수라서 키우면 오차가 줄고, h₂ 의 +0.2183 은 양수라서 키우면 오차가 커집니다.',
          '에이치 원 의 −0.2183 은 음수라서 키우면 오차가 줄고, 에이치 투 의 +0.2183 은 양수라서 키우면 오차가 커집니다.',
        ],
        [25.5, 29.7, '정답이 없는 hidden neuron 도 이렇게 gradient 를 받는데, 이것이 credit assignment 문제의 답입니다.'],
      ],
    },
    {
      id: 'vanishing',
      seconds: 30,
      section: S3,
      cues: [
        [
          0.3,
          6.5,
          'sigmoid 기울기는 최대 0.25 라서, z₃ 의 −0.2183 은 sigmoid 를 하나 더 지나 z₁ 에서 −0.0429 가 됩니다.',
          'sigmoid 기울기는 최대 0.25 라서, 지 쓰리 의 −0.2183 은 sigmoid 를 하나 더 지나 지 원 에서 −0.0429 가 됩니다.',
        ],
        [
          6.5,
          13,
          'step 0 평균 gradient 는 출력 쪽 b₃ 이 0.0264 인데, hidden 쪽 w₁₁ 은 −0.0037 로 7 분의 1 입니다.',
          'step 0 평균 gradient 는 출력 쪽 비 쓰리 가 0.0264 인데, hidden 쪽 더블유 원원 은 −0.0037 로 7 분의 1 입니다.',
        ],
        [
          13,
          19.5,
          '그래서 loss 는 100 step 동안 0.2270 까지만 내려가고, 200 ~ 500 step 사이에야 급히 떨어집니다.',
          '그래서 loss 는 100 step 동안 0.2270 까지만 내려가고, 이백에서 오백 step 사이에야 급히 떨어집니다.',
        ],
        [
          19.5,
          25.5,
          'sigmoid 층 n 개를 거치면 가장 커도 0.25ⁿ 배라서, 다섯 층이면 0.00098 로 1000 분의 1 이하가 됩니다.',
          'sigmoid 층 n 개를 거치면 가장 커도 영 점 이오의 엔 제곱 배라서, 다섯 층이면 0.00098 로 1000 분의 1 이하가 됩니다.',
        ],
        [25.5, 29.7, '요즘 network 는 양수에서 기울기가 1 인 ReLU 를 쓰고, 입력을 출력에 더하는 연결로 gradient 길을 따로 만듭니다.'],
      ],
    },
    {
      id: 'pause-vanish',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. sigmoid 층 세 개를 거친 gradient 는 가장 커도 처음의 몇 배일까요? 출력이 모두 0.9 라면요?'],
        [16.5, 23.5, '최대 0.25 × 0.25 × 0.25 로 0.0156 배입니다. 출력이 0.9 면 기울기가 0.09 라서 약 0.00073 배입니다.'],
      ],
    },
    {
      id: 'init',
      seconds: 30,
      section: S4,
      cues: [
        [
          0.3,
          6.5,
          '서로 다른 값에서 출발한 XOR network 는 η 1 로 2,000 step 뒤 loss 가 0.2478 에서 0.0020 이 됐습니다.',
          '서로 다른 값에서 출발한 XOR network 는 에타 1 로 2,000 step 뒤 loss 가 0.2478 에서 0.0020 이 됐습니다.',
        ],
        [
          6.5,
          13,
          'h₁ 은 x₁ + x₂ 가 약 0.43 을 넘으면 켜져 OR 에 가깝고, h₂ 는 약 1.54 를 넘어야 켜져 AND 에 가깝습니다.',
          '에이치 원 은 엑스 원 더하기 엑스 투 가 약 0.43 을 넘으면 켜져 OR 에 가깝고, 에이치 투 는 약 1.54 를 넘어야 켜져 AND 에 가깝습니다.',
        ],
        [
          13,
          19.5,
          '똑같이 weight [1, 1], bias 0 에서 출발한 두 hidden neuron 은 둘 다 gradient −0.0113 을 받습니다.',
          '똑같이 weight 1, 1, bias 0 에서 출발한 두 hidden neuron 은 둘 다 gradient −0.0113 을 받습니다.',
        ],
        [19.5, 25.5, '같은 양만큼 고쳐져 2,000 step 뒤에도 둘 다 weight 5.34 라서, 직선 하나만 그어 loss 가 0.1708 입니다.'],
        [25.5, 29.7, 'PyTorch 의 nn.Linear 는 서로 다른 작은 random 값으로 출발시켜, 입력이 2 개면 약 ±0.71 사이에서 뽑습니다.'],
      ],
    },
    {
      id: 'autograd',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'requires_grad 인 tensor 로 계산하면 연산마다 grad_fn 이 남고, L 의 grad_fn 은 MulBackward0 입니다.'],
        [6.5, 13.5, 'L.backward() 를 부르면 a.grad 는 6, b.grad 는 −4 로, 손으로 채운 backward 표와 같은 값이 나옵니다.'],
        [
          13.5,
          20.5,
          'L 이 q + a 일 때 backward 를 한 번 더 하면 a.grad 가 3 + 3 으로 6 이 되어서, 매 step 지웁니다.',
          'L 이 q 더하기 a 일 때 backward 를 한 번 더 하면 a.grad 가 3 더하기 3 으로 6 이 되어서, 매 step 지웁니다.',
        ],
        [20.5, 27.7, 'LeRobot 의 ACT 는 select_action 을 torch.no_grad() 로 감싸, 실행 중에는 graph 를 기록하지 않습니다.'],
      ],
    },
    {
      id: 'pause-symmetry',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. hidden neuron 4 개를 모두 같은 값으로 출발시키면, 서로 다른 직선은 몇 개일까요?'],
        [16.5, 23.5, '한 개입니다. 네 neuron 이 늘 같은 gradient 를 받아 같은 값으로 남으므로, 모두 같은 직선 하나를 긋습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 계산을 graph 로 기록하고 L 의 gradient 1 에서 local derivative 를 곱해 가면, a 는 6 입니다.'],
        [
          4.2,
          8.2,
          '여러 곳에 쓰인 값은 2 + 1 처럼 더하고, reverse-mode 는 parameter 수와 상관없이 2 번 훑습니다.',
          '여러 곳에 쓰인 값은 2 더하기 1 처럼 더하고, reverse-mode 는 parameter 수와 상관없이 2 번 훑습니다.',
        ],
        [8.2, 12.2, '정답 없는 hidden neuron 도 −0.2183 을 받지만, sigmoid 를 지날 때마다 0.25 이하가 곱해집니다.'],
        [12.2, 15.7, '서로 다른 값에서 출발해야 OR 와 AND 로 나뉘고, PyTorch 는 grad_fn 을 따라 .grad 에 더해 쌓습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '매 step gradient 를 지우고 update 하는 학습 loop 는 다음 강의 PyTorch Training Loop 에서 다룹니다.']],
    },
  ],
}
