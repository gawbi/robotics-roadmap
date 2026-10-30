import type { VideoScript } from '../script.ts'

// Numbers follow lessons/pid-control/README.md: the step (cart 1 kg, 2 N for 1 s → 2 ÷ 1 = 2, 0 + 2 × 1 = 2, 0 + 2 × 1 = 2;
// Δt = 0.5 s unless said); P only (target 1 m, Kp = 4, table rows 0 ~ 5: positions 0, 1, 2, 2, 1, 0, speed 2 m/s at step 1,
// overshoot 1 → 100%; Kp = 1 slower, same width); D (−Kd × v; Kd = 1 → 1.5, 0.81, 1.08; Δt = 0.01 s table Kd 1 / 4 / 10 →
// 1.44 / 1.00 / 0.91 farthest, 0.98 / 1.00 / 0.91 after 6 s, Kd 4 passes 0.95 in 2.4 s; critical damping 2√(Kp × m) =
// 2√(4 × 1) = 4, mass × 4 → 2√(4 × 4) = 8; check Kp 9 → 2√(9 × 1) = 6); period and gain (Kp 4, Kd 4, Δt 0.5 table: P 4, 0,
// 4, −4; D 0, −8, 8, −16; force 4, −8, 12, −20; speeds 2, −2, 4, −6; positions 1, 0, 2, −1, then 4, −4; 8 × 0.5 = 4; ratio
// Kd Δt / m: 4 × 0.5 = 2 (200%), 4 × 0.01 = 0.04 (4%), 40 × 0.01 = 0.4 (40%), 40 × 0.05 = 2; gain × 10 → Δt ÷ 10; check
// 2 × 0.1 ÷ 1 = 0.2 → 20%); I and windup (tilted rail 2 N, PD Kp 4 Kd 1 stops at 0.5 m, 4 × 0.5 = 2 N; steady-state error =
// force ÷ Kp; Ki = 2 → 1.19 m; joint l = 0.5 m, m = 1 kg, g = 9.81, 30° → 0.25 m, 2.45 N·m, 90° → 9.81 × 0.5 = 4.905 N·m;
// saturation 10 N vs 3 N; windup run: limit 3 N, gravity 2 N, target 5 m, Kp 4, Kd 3, Ki 1, Δt 0.01, first 3 s at the limit,
// I 10.5 N vs ≤ 2 N, 7.02 m (2.02 over) vs ≤ 5 m, ±2% (4.9 ~ 5.1 m) in 14.0 s vs 4.1 s; check 2° below → I / Ki or gravity
// feedforward); feedforward and policy (2 N ff → 1; 2.5 N real → 0.5 ÷ 4 = 0.125 → 0.875; Kp 50 → 4.905 ÷ 50 ≈ 0.098 rad ≈
// 5.6°; minimum-jerk 0° → 90° in 1 s, 45° at 0.5 s, peak 168.75 °/s vs 90 °/s ≈ 1.9×; cart 0 → 1 in 2 s: max error 0.50 /
// 0.15 / 0.003, after 4 s 0.52 / 1.01 / 1.00; policy 10 ~ 50 Hz, PID 수백 ~ 수천 Hz, 30 Hz vs 1000 Hz ≈ 33, 33 ms; SO-101,
// STS3215; check 20 Hz / 500 Hz → 1/20 = 0.05 s, 1/500 = 0.002 s, 0.05 ÷ 0.002 = 25).

const S1 = 'P 항과 D 항'
const S2 = '계산 주기와 gain'
const S3 = 'I 항과 windup'
const S4 = 'feedforward·policy'

export const script: VideoScript = {
  id: 'pid-control',
  title: 'PID Control',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/pid-control',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Inverse Kinematics', '인버스 키네마틱스'],
    ['steady-state error', '스테디 스테이트 에러'],
    ['critical damping', '크리티컬 댐핑'],
    ['gravity feedforward', '그래비티 피드포워드'],
    ['minimum-jerk', '미니멈 저크'],
    ['anti-windup', '안티 와인드업'],
    ['PID Control', '피아이디 컨트롤'],
    ['feedforward', '피드포워드'],
    ['saturation', '새추레이션'],
    ['controller', '컨트롤러'],
    ['overshoot', '오버슈트'],
    ['integral', '인티그럴'],
    ['position', '포지션'],
    ['feedback', '피드백'],
    ['STS3215', '에스티에스 삼이일오'],
    ['gripper', '그리퍼'],
    ['gravity', '그래비티'],
    ['SO-101', '에스오 백일'],
    ['windup', '와인드업'],
    ['torque', '토크'],
    ['motor', '모터'],
    ['servo', '서보'],
    ['gain', '게인'],
    ['N·m', '뉴턴미터'],
    ['PID', '피아이디'],
    ['VLA', '브이엘에이'],
    ['kg', '킬로그램'],
    ['Kp', '케이피'],
    ['Kd', '케이디'],
    ['Ki', '케이아이'],
    ['PD', '피디'],
    ['Hz', '헤르츠'],
    ['Δt', '델타 티'],
    ['N', '뉴턴'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'PID 는 목표와 지금의 차이인 오차를 매 순간 재서 motor 가 낼 힘을 고치는 feedback 제어입니다.'],
        [4.2, 7.8, 'P 항과 D 항, 계산 주기와 gain, I 항과 windup, feedforward 와 policy 아래의 PID 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '로봇 팔에 30° 로 가라고 명령하면 팔은 30° 를 지나쳤다가 흔들리거나, 29° 근처에서 멈춰 버리기도 합니다.'],
        [4.4, 7.8, '명령도 맞고 motor 도 멀쩡한데, 로봇 팔은 왜 정확히 30° 에서 서지 못하는 걸까요?'],
      ],
    },
    {
      id: 'p-only',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'motor 는 힘만 냅니다. 힘이 속도를 바꾸고 속도가 위치를 바꾸므로, step 마다 위치를 재서 힘을 정합니다.'],
        [6.5, 12.5, '1 kg 카트를 2 N 으로 1 초 밀면 가속도는 2 ÷ 1 로 2 이고, 새 속도 2 로 위치도 2 만큼 옮깁니다.'],
        [
          12.5,
          18.5,
          'P 항은 오차 1 − x 에 gain Kp 를 곱한 힘입니다. 목표 1 m, Kp 4, Δt 0.5 초로 표를 채웁니다.',
          'P 항은 오차, 1 빼기 x 에 gain Kp 를 곱한 힘입니다. 목표 1 m, Kp 4, Δt 0.5 초로 표를 채웁니다.',
        ],
        [
          18.5,
          23.5,
          'step 1 에서 카트는 목표 1 에 있어 힘이 0 인데, 속도가 이미 2 m/s 라서 2 까지 지나갑니다.',
          'step 1 에서 카트는 목표 1 에 있어 힘이 0 인데, 속도가 이미 초속 2 m 라서 2 까지 지나갑니다.',
        ],
        [23.5, 27.7, '위치는 0, 1, 2, 2, 1, 0 을 끝없이 되풀이하고, 목표를 1 만큼 넘으니 overshoot 가 100% 입니다.'],
      ],
    },
    {
      id: 'pd',
      seconds: 28,
      section: S1,
      cues: [
        [
          0.3,
          6.5,
          'D 항은 오차가 변하는 빠르기에 Kd 를 곱합니다. 목표가 멈춰 있으면 속도에 맞서는 힘 −Kd × v 입니다.',
          'D 항은 오차가 변하는 빠르기에 Kd 를 곱합니다. 목표가 멈춰 있으면 속도에 맞서는 힘, 마이너스 Kd × v 입니다.',
        ],
        [6.5, 12.5, '같은 Kp 4 에 Kd 1 을 더하면 1.5 m 까지 한 번 넘쳤다가, 0.81, 1.08 로 흔들림이 줄며 자리 잡습니다.'],
        [12.5, 18.5, 'Δt 0.01 초로 계산하면 Kd 1 은 1.44 까지 넘치고, Kd 10 은 넘치지 않지만 6 초 뒤에도 0.91 입니다.'],
        [
          18.5,
          23.5,
          'Kd 4 는 넘치지 않고 2.4 초 만에 0.95 를 넘습니다. 이 값 2√(Kp × m) 을 critical damping 이라고 합니다.',
          'Kd 4 는 넘치지 않고 2.4 초 만에 0.95 를 넘습니다. 이 값, 2 × 루트 Kp × m 을 critical damping 이라고 합니다.',
        ],
        [
          23.5,
          27.7,
          '끝에 gripper 를 달아 질량이 4 배가 되면 2√(4 × 4) 로 Kd 가 8, 곧 두 배가 필요합니다.',
          '끝에 gripper 를 달아 질량이 4 배가 되면 2 × 루트 4 × 4 로 Kd 가 8, 곧 두 배가 필요합니다.',
        ],
      ],
    },
    {
      id: 'pause-kd',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. Kp 가 9 이고 질량이 1 kg 이면, 넘치지 않으면서 가장 빠른 Kd 는 얼마일까요?'],
        [
          16.5,
          23.5,
          'critical damping 식 2√(Kp × m) 에 넣으면 2√(9 × 1) 로 2 × 3 이라서, Kd 는 6 입니다.',
          'critical damping 식, 2 × 루트 Kp × m 에 넣으면 2 × 루트 9 × 1 로 2 × 3 이라서, Kd 는 6 입니다.',
        ],
      ],
    },
    {
      id: 'dt',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'Δt 는 controller 가 힘을 다시 정하기까지 걸리는 시간입니다. 같은 Kp 4, Kd 4 를 Δt 0.5 초로 계산합니다.'],
        [6.5, 12.5, 'step 1 에서 속도 2 에 D 항이 −8 N 을 내고, 이 힘이 0.5 초 동안 유지되어 속도를 4 만큼 줄입니다.'],
        [12.5, 19, '속도 2 를 0 으로 만들려던 브레이크가 −2 로 뒤집고, 다음 step 에는 4, 그다음에는 −6 으로 뒤집습니다.'],
        [19, 25.7, '위치는 0, 1, 0, 2, −1, 4, −4 로 흔들림이 끝없이 커지는데, 이것을 발산이라고 합니다.'],
      ],
    },
    {
      id: 'ratio',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'D 항이 한 step 에 줄이는 속도는 지금 속도의 Kd × Δt ÷ m 배이고, 1 을 넘으면 속도를 뒤집습니다.'],
        [6.5, 12.5, 'Kd 4 에 Δt 0.5 초면 비율이 2 라서 발산하고, Δt 0.01 초면 0.04 라서 매끄럽게 줄어듭니다.'],
        [12.5, 18, 'Kd 40 은 Δt 0.01 초면 0.4 로 괜찮지만, Δt 0.05 초면 다시 2 가 되어 발산합니다.'],
        [18, 24, 'gain 을 10 배 키우면 Δt 를 10 분의 1 로 줄여야 하고, 무거운 팔을 붙잡는 큰 gain 은 짧은 주기에서만 안정합니다.'],
        [24, 29.7, '주기도 일정해야 합니다. I 항은 오차 × Δt 를 쌓고 D 항은 Δt 로 나누어서, 주기가 들쭉날쭉하면 크기가 달라집니다.'],
      ],
    },
    {
      id: 'pause-dt',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. Kd 2, m 1, Δt 0.1 이면 D 항은 한 step 에 속도의 몇 % 를 줄일까요? 발산할까요?',
          '멈추고 적어 보기. Kd 2, m 1, Δt 0.1 이면 D 항은 한 step 에 속도의 몇 퍼센트를 줄일까요? 발산할까요?',
        ],
        [16.5, 23.5, 'Kd × Δt ÷ m 은 2 × 0.1 ÷ 1 로 0.2 라서 20% 를 줄입니다. 1 보다 작아 속도를 뒤집지 않습니다.'],
      ],
    },
    {
      id: 'integral',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '레일이 기울어 gravity 가 카트를 늘 2 N 으로 당기면, 같은 PD 로 목표 1 m 에 보내도 0.5 m 에서 멈춥니다.'],
        [6.5, 12.5, '0.5 m 에서는 P 항이 4 × 0.5 로 2 N 을 내 gravity 와 맞고, 카트가 멈춰서 D 항은 0 입니다.'],
        [12.5, 18.5, '멈춘 뒤 남는 오차가 steady-state error 이고 크기는 당기는 힘 ÷ Kp 라서, Kp 를 키워도 0 은 되지 않습니다.'],
        [18.5, 24, 'I 항은 쌓인 오차에 Ki 를 곱합니다. Ki 2 를 더하면 1.19 m 까지 넘쳤다가 목표 1 m 에 자리 잡습니다.'],
        [24, 29.7, '로봇 팔 관절도 같습니다. 0.5 m 팔 끝의 1 kg 은 30° 에서 2.45 N·m, 90° 에서 4.905 N·m 로 당깁니다.'],
      ],
    },
    {
      id: 'windup',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'motor 가 낼 수 있는 힘에는 한계가 있습니다. 힘이 한계에 걸려 더 커지지 못하는 상태가 saturation 입니다.'],
        [6.5, 12.5, '한계 3 N, gravity 2 N 인 카트를 목표 5 m 로 보내면, 처음 3 초 동안 한계에 걸린 채 천천히 올라갑니다.'],
        [12.5, 19, '그동안에도 쌓은 integral 때문에 I 항이 10.5 N 이 되어 7.02 m 까지 넘치는 것이 integral windup 입니다.'],
        [19, 25.7, '한계에 걸린 동안 쌓기를 멈추는 anti-windup 은 I 항이 2 N 이하라서, 넘치지 않고 4.1 초 만에 자리 잡습니다.'],
      ],
    },
    {
      id: 'pause-steady',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 로봇 팔 관절이 목표보다 늘 2° 아래에서 멈춥니다. gain 을 어떻게 바꿔야 할까요?'],
        [16.5, 23.5, 'gravity 를 P 항 혼자 버티는 steady-state error 라서 I 항을 더하거나 Ki 를 키웁니다. Kd 는 관계없습니다.'],
      ],
    },
    {
      id: 'feedforward',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, '레일이 2 N 으로 당긴다는 것을 알면 처음부터 2 N 을 더하면 됩니다. 이렇게 미리 더하는 것이 feedforward 입니다.'],
        [6, 12.5, 'PD 에 2 N 을 더하면 I 항 없이 1 에 멈추지만, 실제로는 2.5 N 이 당기면 0.875 에 멈춥니다.'],
        [12.5, 18.5, '관절에서는 목표가 90° 이면 4.905 N·m 를 미리 더해, Kp 50 인 PD 가 남기던 5.6° 오차를 지웁니다.'],
        [
          18.5,
          24.5,
          'minimum-jerk 목표는 출발과 도착에서 속도와 가속도가 0 이고, 0° 에서 90° 로 1 초면 최고 168.75 °/s 입니다.',
          'minimum-jerk 목표는 출발과 도착에서 속도와 가속도가 0 이고, 0° 에서 90° 로 1 초면 최고 초속 168.75° 입니다.',
        ],
        [24.5, 29.7, '카트를 minimum-jerk 로 옮기면 최대 오차는 PD 가 0.50, 2 N 을 더하면 0.15, 가속도 힘까지 더하면 0.003 입니다.'],
      ],
    },
    {
      id: 'policy',
      seconds: 26,
      section: S4,
      cues: [
        [
          0.3,
          6.5,
          'policy 는 관절마다 다음 목표 각도를 1초에 10 ~ 50 번 내고, PID 가 그 목표를 따라가게 motor 를 움직입니다.',
          'policy 는 관절마다 다음 목표 각도를 1초에 10 에서 50 번 내고, PID 가 그 목표를 따라가게 motor 를 움직입니다.',
        ],
        [
          6.5,
          13,
          'PID 는 1초에 수백 ~ 수천 번 계산해서, policy 가 30 Hz, PID 가 1000 Hz 면 policy 한 번에 약 33 번입니다.',
          'PID 는 1초에 수백에서 수천 번 계산해서, policy 가 30 Hz, PID 가 1000 Hz 면 policy 한 번에 약 33 번입니다.',
        ],
        [13, 19.5, '큰 gain 은 짧은 주기에서만 안정하고, gravity 와 접촉 힘이 바뀌는데 33 ms 를 기다리면 팔이 처지거나 튕깁니다.'],
        [19.5, 25.7, 'SO-101 의 servo STS3215 안에서도 position PID 가 각도를 맞추고, VLA 가 낸 행동도 이 PID 를 거칩니다.'],
      ],
    },
    {
      id: 'pause-rates',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. policy 가 20 Hz, PID 가 500 Hz 면 policy 출력 한 번 사이에 PID 는 몇 번 계산할까요?'],
        [
          16.5,
          23.5,
          'policy 는 1/20 로 0.05 초마다, PID 는 1/500 로 0.002 초마다 계산해서 0.05 ÷ 0.002 로 25 번입니다.',
          'policy 는 이십 분의 일, 0.05 초마다, PID 는 오백 분의 일, 0.002 초마다 계산해서 0.05 ÷ 0.002 로 25 번입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 30° 를 지나쳐 흔들리는 것은 P 항이 속도를 보지 않아서이고, D 항이 속도에 맞서 줄입니다.'],
        [4.2, 8.2, 'D 항의 비율 Kd × Δt ÷ m 이 1 을 넘으면 발산하므로, gain 이 클수록 계산 주기를 짧게 해야 합니다.'],
        [8.2, 12.2, '모자라게 멈추는 것은 gravity 가 남기는 steady-state error 이고, I 항이 지우되 windup 을 막아야 합니다.'],
        [
          12.2,
          15.7,
          'feedforward 가 필요한 힘을 미리 내고, 그 아래의 PID 는 1초에 수백 ~ 수천 번 목표를 따라갑니다.',
          'feedforward 가 필요한 힘을 미리 내고, 그 아래의 PID 는 1초에 수백에서 수천 번 목표를 따라갑니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '손끝을 물체 위치에 두려면 관절마다 몇 도가 되어야 하는지 구하는 계산은 Inverse Kinematics 에서 다룹니다.']],
    },
  ],
}
