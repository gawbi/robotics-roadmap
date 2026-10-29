import type { VideoScript } from '../script.ts'

// Numbers follow lessons/legged-balance/README.md: Mini Cheetah 9 kg, μ = 0.4, weight 9 × 9.81 = 88.3 N, trot 44.1 N a foot,
// horizontal 0.4 × 44.1 = 17.7 N, friction cone 21.8°, 0.4 × 88.3 = 35.3 N → 35.3 ÷ 9 = 3.92 m/s² (= μ × g), μ = 0.1 → 0.98 m/s²;
// the cart-table example (z = 0.8 m, foot ±0.1 m: 0 → ankle, 1 m/s² → 8.2 cm, 1.23 m/s² → 10.0 cm, 2 m/s² → 16.3 cm,
// 0.1 × 9.81 ÷ 0.8 = 1.23 m/s², p = x − (z/g) ẍ) and its check question (1.0 m, 0.08 m → 0.08 × 9.81 ÷ 1.0 ≈ 0.785 m/s²);
// preview control (Kajita: 0.814 m, 5 ms, weights 1 and 10⁻⁶; ZMP targets from 2.0 s every 0.8 s, 0.3 m forward, ±0.1 m,
// 0.1 s switch; preview 1.6 s → CoM starts 0.97 s, 3.7 cm at 2.0 s, max 6.6 cm, errors 0.97 / 0.63 cm; preview 0.8 s →
// 1.38 s, 10.8 cm, 3.96 / 2.13 cm; HRP-2P 154 cm, 58 kg, 0.1 m stairs) and its check (0.814, 0.6 m/s² → ≈ −0.050 m, 약 5 cm);
// LIP (9.81 ÷ 0.8 = 12.26, ω = 3.50 /s, 0.29 m → 5.82 /s, 1 cm → 0.12 m/s², 5 cm → 0.61 m/s²; 5.0 → 6.3 → 10.8 → 20.7 cm,
// speeds 0.13 / 0.33 / 0.70 m/s); capture point (0.7 ÷ 3.50 = 0.20 m; 0.35 / 0.7 / 1.4 m/s → 0.10 / 0.20 / 0.40 m, one step
// max 0.35 m; waiting: ×2.01 per 0.2 s → 0.30 m, 0.51 m) and its check (1.0 m, 0.05 m, 0.5 m/s → ω ≈ 3.13, 0.16, 0.21 m);
// single rigid body (legs ≈ 10%, hips ±0.19 m, CoM 2 cm ahead → 0.17 / 0.21 m, 48.8 / 39.5 N, 8.3 N·m each; equal 22.1 N →
// 9.3 vs 7.5 N·m); convex MPC (12 states, 0.002 s × 13 = 0.026 s × 10 step = 0.26 s, 5 step a stance, 4 × 3 × 10 = 120 → 60
// variables, μ = 0.4, 120 N cap, weights 50 / 10, 30 ~ 40 a second; 1 / 3 / 5 m/s² → 9 / 27 / 45 N → 4.5 / 13.5 / 22.5 N →
// 0.10 / 0.31 / 0.51) and its check (μ = 0.6 → 26.5 N, 53.0 N, ≈ 5.89 m/s², 22.5 < 26.5); foot force → torque (0.2 m legs,
// 45°, −90°, 0.283 m, 0.141 m, J = [0.283 0.141; 0 −0.141], 6.24 N·m, −3.82 / 4.33 N·m, max 17 N·m); WBIC 500 a second,
// PD 40,000 a second (Kp 3, Kd 0.3), 2.45 → 3.7 m/s; DTC: 0.1 m gap 10 of 10, 0.6 m gaps 4 of 4.

const S1 = '바닥 반력과 ZMP'
const S2 = 'preview control'
const S3 = 'capture point'
const S4 = 'convex MPC'

export const script: VideoScript = {
  id: 'legged-balance',
  title: 'ZMP → Convex MPC',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/legged-balance',
  sections: [S1, S2, S3, S4],
  terms: [
    ['linear inverted pendulum', '리니어 인버티드 펜듈럼'],
    ['Sim-to-Real Locomotion', '심 투 리얼 로코모션'],
    ['reinforcement learning', '리인포스먼트 러닝'],
    ['ground reaction force', '그라운드 리액션 포스'],
    ['center of pressure', '센터 오브 프레셔'],
    ['single rigid body', '싱글 리지드 바디'],
    ['support polygon', '서포트 폴리곤'],
    ['preview control', '프리뷰 컨트롤'],
    ['capture point', '캡처 포인트'],
    ['friction cone', '프릭션 콘'],
    ['ZMP equation', '지엠피 이퀘이션'],
    ['joint torque', '조인트 토크'],
    ['Mini Cheetah', '미니 치타'],
    ['convex MPC', '컨벡스 엠피씨'],
    ['controller', '컨트롤러'],
    ['friction', '프릭션'],
    ['gravity', '그래비티'],
    ['preview', '프리뷰'],
    ['Kajita', '카지타'],
    ['moment', '모멘트'],
    ['torque', '토크'],
    ['model', '모델'],
    ['simulation', '시뮬레이션'],
    ['Pratt', '프랫'],
    ['trot', '트롯'],
    ['WBIC', '더블유 비 아이 씨'],
    ['ZMP', '지엠피'],
    ['MPC', '엠피씨'],
    ['CoP', '씨오피'],
    ['DTC', '디티씨'],
    ['QP', '큐피'],
    ['PD', '피디'],
    ['RL', '알엘'],
    ['Jᵀ', '제이 트랜스포즈'],
    ['m/s²', '미터 퍼 제곱초'],
    ['m/s', '미터 퍼 초'],
    ['N·m', '뉴턴 미터'],
    ['/s', '퍼 초'],
    ['kg', '킬로그램'],
    ['cm', '센티미터'],
    ['N', '뉴턴'],
    ['μ', '뮤'],
    ['ω', '오메가'],
    ['τ', '타우'],
    ['√', '루트 '],
    ['≈', '약'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '다리 로봇을 움직이는 바깥 힘은 gravity 와 바닥 반력뿐입니다. 바닥을 미는 힘만으로 균형을 잡는 제어를 봅니다.'],
        [4.2, 7.8, 'friction cone 과 ZMP, preview control, capture point, convex MPC 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '바닥은 발을 밀어 올릴 수는 있어도 끌어당기지는 못하고, 옆으로는 마찰이 버티는 만큼만 밉니다.'],
        [4.4, 7.8, '이런 조건에서 넘어지지 않으려면, 발을 언제 어디에 딛고 바닥을 어느 쪽으로 얼마나 세게 밀어야 할까요?'],
      ],
    },
    {
      id: 'grf',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6, '발이 바닥을 누르면 바닥도 같은 크기로 되밉니다. 이 ground reaction force, 바닥 반력의 수직 성분은 0 이상입니다.'],
        [6, 12.5, 'Mini Cheetah 는 9 kg, μ 는 0.4 입니다. trot 에서는 두 발이 88.3 N 을 나눠 받아 한 발에 44.1 N 입니다.'],
        [12.5, 19.5, '수평 힘은 수직 힘의 μ 배까지라서 한 발에 0.4 × 44.1 로 17.7 N 입니다. 21.8° 안쪽이 friction cone 입니다.'],
        [19.5, 27.5, '수평 힘 합은 최대 35.3 N 이라 가속도는 35.3 ÷ 9 로 3.92 m/s² 까지입니다. μ 가 0.1 이면 0.98 m/s² 입니다.'],
      ],
    },
    {
      id: 'zmp',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '나뉘어 걸린 바닥 반력은 한 점의 힘 하나로 볼 수 있습니다. 이 CoP 는 발이 닿은 영역, support polygon 안에 있습니다.'],
        [6, 12, '바닥 반력이 몸을 돌리는 moment 를 남기지 않을 점을 거꾸로 구할 수 있습니다. 이 점이 ZMP 입니다.'],
        [12, 18, 'Kajita 등은 이 관계를 탁자 위 수레로 그렸습니다. 예로 무게중심 높이 0.8 m, 발은 발목 앞뒤로 0.1 m 씩이라 합시다.'],
        [18, 24, '1 m/s² 로 가속하면 ZMP 는 0.8 ÷ 9.81 × 1 로 발목 뒤 8.2 cm 입니다. 2 m/s² 면 16.3 cm 로 발 밖입니다.'],
        [24, 29.7, '뒤꿈치 끝이 한계라서 가속도는 0.1 × 9.81 ÷ 0.8 로 1.23 m/s² 까지입니다. 발 안이어도 넘어질 수는 있습니다.'],
      ],
    },
    {
      id: 'pause-zmp',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 무게중심 높이 1.0 m, 뒤꿈치 끝까지 0.08 m 인 로봇이 발을 들지 않고 낼 수 있는 가속도는 얼마일까요?'],
        [16.5, 23.5, 'ZMP 를 뒤꿈치 끝 −0.08 m 에 두면 가속도는 0.08 × 9.81 ÷ 1.0 으로 약 0.785 m/s² 입니다.'],
      ],
    },
    {
      id: 'plan',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, '걸음 계획은 순서가 거꾸로입니다. 발자국을 먼저 정하면 ZMP 목표가 정해지고, 그 ZMP 를 만드는 무게중심 경로를 찾습니다.'],
        [6.5, 13, '오른발에서 왼발로 옮길 때 ZMP 를 왼쪽으로 옮기려면, 무게중심이 그보다 먼저 왼쪽으로 움직여야 합니다.'],
        [13, 19.5, 'Kajita 등은 미래 목표를 보고 지금 입력을 정하는 preview control 로 풀었습니다. 앞을 보며 핸들을 꺾는 운전 같습니다.'],
        [19.5, 25.7, 'ZMP 목표는 예로 2.0 초부터 0.8 초마다 한 걸음씩, 좌우로 0.1 m 떨어진 발을 번갈아 딛도록 정했습니다.'],
      ],
    },
    {
      id: 'preview',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'preview 1.6 초면 무게중심은 목표보다 약 1 초 이른 0.97 초에 출발해 2.0 초에 이미 3.7 cm 옮겨 갑니다.'],
        [6.5, 12.5, 'ZMP 는 ±10 cm 의 두 발 위를 오가지만, 무게중심은 좌우로 최대 6.6 cm 만 흔들립니다.'],
        [12.5, 19.5, 'preview 0.8 초면 무게중심이 1.38 초에 늦게 출발해, ZMP 가 목표를 지나쳐 10.8 cm 까지 나갑니다.'],
        [19.5, 27.5, 'ZMP 최대 오차는 1.6 초에서 앞뒤 0.97 cm, 좌우 0.63 cm 이지만 0.8 초에서는 3.96 cm 와 2.13 cm 입니다.'],
      ],
    },
    {
      id: 'pause-preview',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 높이 0.814 m 인 무게중심이 두 발 가운데에 있습니다. 왼쪽으로 0.6 m/s² 가속하려면 ZMP 는 어디일까요?'],
        [
          16.5,
          23.5,
          '0 − 0.814 ÷ 9.81 × 0.6 은 약 −0.050 m 입니다. ZMP 를 오른쪽 약 5 cm 에 먼저 두어야 왼쪽으로 갑니다.',
          '0 빼기 0.814 ÷ 9.81 × 0.6 은 약 −0.050 m 입니다. ZMP 를 오른쪽 약 5 cm 에 먼저 두어야 왼쪽으로 갑니다.',
        ],
      ],
    },
    {
      id: 'lip',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, '무게중심은 ZMP 에서 멀어지는 쪽으로 거리에 비례해 가속합니다. 높이가 일정한 모델이 linear inverted pendulum 입니다.'],
        [6.5, 13, '높이 0.8 m 면 비례 상수는 9.81 ÷ 0.8 로 12.26 이고, ZMP 보다 5 cm 앞이면 가속도는 0.61 m/s² 입니다.'],
        [13, 19.5, '넘어지는 빠르기 ω 는 √12.26 으로 3.50 /s 이고, 높이 0.29 m 인 Mini Cheetah 는 5.82 /s 입니다.'],
        [19.5, 27.5, '발끝보다 5 cm 앞에 멈춘 무게중심은 ZMP 를 발끝에 두어도 0.2 초마다 6.3, 10.8, 20.7 cm 로 멀어집니다.'],
      ],
    },
    {
      id: 'capture',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '발끝을 넘어가면 발목으로는 가속을 줄일 수 있을 뿐이라서, 발을 내디뎌 support polygon 을 앞으로 옮겨야 합니다.'],
        [6.5, 13, '밀려 0.7 m/s 가 된 높이 0.8 m 로봇은 발목에서 0.7 ÷ 3.50 으로 0.20 m 앞을 디디면 그 위에서 멈춥니다.'],
        [13, 18.5, 'Pratt 등은 이 점을 capture point 라 불렀습니다. 더 가까이 디디면 발을 넘어가고, 더 멀리 디디면 되돌아옵니다.'],
        [18.5, 24, '0.35 m/s 면 발끝 0.10 m 라 디디지 않고 섭니다. 1.4 m/s 면 0.40 m 로 한 걸음 최대 0.35 m 밖입니다.'],
        [24, 29.7, '발끝에서 버티면 capture point 는 0.2 초마다 약 2.01 배 멀어져, 0.4 초 뒤에는 0.51 m 가 됩니다.'],
      ],
    },
    {
      id: 'pause-capture',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 높이 1.0 m, 무게중심이 발목보다 0.05 m 앞인 로봇이 0.5 m/s 로 밀렸습니다. 어디를 디뎌야 설까요?'],
        [
          16.5,
          23.5,
          'ω 는 √(9.81 ÷ 1.0) 으로 약 3.13 /s, 속도 ÷ ω 는 약 0.16 m 라서 답은 0.21 m 앞입니다.',
          'ω 는 루트 9.81 ÷ 1.0 으로 약 3.13 /s, 속도 ÷ ω 는 약 0.16 m 라서 답은 0.21 m 앞입니다.',
        ],
      ],
    },
    {
      id: 'mpc',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '4족 로봇의 발은 점으로 닿아 ZMP 를 옮길 넓이가 없습니다. 그래서 무게중심 경로 대신 바닥 반력 자체를 계획합니다.'],
        [6.5, 13, '로봇 전체를 질량과 회전 관성이 있는 상자 하나로 보는 single rigid body 모델입니다. 다리는 질량의 약 10% 입니다.'],
        [13, 19.5, '무게중심이 가운데보다 2 cm 앞이면 앞발 둘이 48.8 N, 뒷발 둘이 39.5 N 을 받아야 moment 가 8.3 N·m 로 같습니다.'],
        [19.5, 26, 'convex MPC 는 0.026 초 × 10 step 의 바닥 반력을 QP 로 풉니다. 공중 발을 지우면 변수는 120 개에서 60 개입니다.'],
        [
          26,
          31.7,
          '5 m/s² 는 한 발 수평 22.5 N, 수직의 0.51 배라 미끄러집니다. QP 는 제약 안의 힘만 1초에 30 ~ 40 번 고릅니다.',
          '5 m/s² 는 한 발 수평 22.5 N, 수직의 0.51 배라 미끄러집니다. QP 는 제약 안의 힘만 1초에 30 에서 40 번 고릅니다.',
        ],
      ],
    },
    {
      id: 'torque',
      seconds: 30,
      section: S4,
      cues: [
        [
          0.3,
          6,
          'MPC 의 f 는 바닥이 발을 미는 힘입니다. 다리는 반대로 −f 를 내야 하므로 joint torque 는 τ = Jᵀ(−f) 입니다.',
          'MPC 의 f 는 바닥이 발을 미는 힘입니다. 다리는 반대로 마이너스 f 를 내야 하므로 joint torque 는 Jᵀ 에 마이너스 f 를 곱한 값입니다.',
        ],
        [6, 12, '허벅지와 정강이가 0.2 m 인 다리를 엉덩이 45°, 무릎 −90° 로 굽히면 발은 엉덩이 아래 0.283 m 에 옵니다.'],
        [12, 18, '44.1 N 만이면 엉덩이 torque 는 0, 무릎은 6.24 N·m 입니다. 앞으로 13.5 N 을 더하면 −3.82 와 4.33 입니다.'],
        [
          18,
          24,
          'MPC 는 1초에 30 ~ 40 번만 풀고 WBIC 가 1초에 500 번 힘을 다듬어, 최고 속도는 2.45 에서 3.7 m/s 가 됐습니다.',
          'MPC 는 1초에 30 에서 40 번만 풀고 WBIC 가 1초에 500 번 힘을 다듬어, 최고 속도는 2.45 에서 3.7 m/s 가 됐습니다.',
        ],
        [24, 29.7, 'DTC 는 model 이 계획하고 학습한 policy 가 따라가서, RL policy 가 못 건넌 0.1 m 틈을 10 번 모두 건넜습니다.'],
      ],
    },
    {
      id: 'pause-mpc',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 trot 에서 고무 바닥이라 μ 가 0.6 이면 가속도는 최대 얼마이고, 5 m/s² 명령은 지킬까요?'],
        [16.5, 23.5, '한 발 26.5 N, 두 발 53.0 N 이라 가속도는 약 5.89 m/s² 까지입니다. 22.5 N 은 26.5 N 안이라 지킵니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '바닥은 밀기만 합니다. μ 가 0.4 면 가속도는 3.92 m/s² 까지이고, ZMP 가 발 밖인 움직임은 낼 수 없습니다.'],
        [4.2, 8.1, 'preview control 은 1.6 초 앞의 ZMP 목표를 보고, 발을 바꾸기 약 1 초 전부터 무게중심을 움직입니다.'],
        [8.1, 12, '무게중심은 ZMP 에서 멀어지며 가속하지만, 0.7 m/s 로 밀렸을 때 0.20 m 앞의 capture point 를 디디면 멈춰 섭니다.'],
        [
          12,
          15.7,
          'convex MPC 는 몸통 하나의 모델로 네 발의 힘을 QP 로 정하고, τ = Jᵀ(−f) 로 joint torque 로 바꿉니다.',
          'convex MPC 는 몸통 하나의 모델로 네 발의 힘을 QP 로 정하고, Jᵀ 에 마이너스 f 를 곱해 joint torque 로 바꿉니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.4, '이 강의의 controller 는 사람이 만든 모델과 비용으로 바닥 반력을 계산했습니다.'],
        [3.4, 6.8, '다음 Sim-to-Real Locomotion 은 같은 보행을 simulation 에서 reinforcement learning 으로 배웁니다.'],
      ],
    },
  ],
}
