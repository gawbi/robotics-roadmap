import type { VideoScript } from '../script.ts'

// Numbers follow lessons/impedance-control/README.md: the wiping question (1 mm, 수십 N; Franka 1초에 1000 번, 150 N/m); stiff
// position control (1 mm = 0.001 m; 500 / 3,000 / 12,000 / 57,000 N/m → 0.5 / 3 / 12 / 57 N; Kp ÷ l², 3000 ÷ 0.5² = 12,000,
// 14,250 ÷ 0.5² = 57,000; 5 mm → 285 N; FR3 87 N·m ÷ 0.5 = 174 N; check 2000 ÷ 0.4² = 12,500 N/m, × 0.002 = 25 N);
// τ = JᵀF (0.5 m links, 0°, 90°, J = [−0.5 −0.5; 0.5 0], down 10 N → −5 / 0 N·m, sideways 10 N → −5 / −5 N·m, 0.5 × 10 = 5);
// computed torque (Kd = 2√100 = 20, Kp 100; 1 초, 0° → 60°, 90°; max error PD 6.9° / 2.6°, + gravity compensation 1.9° /
// 0.9°, computed torque 0° / 0°, 20% lighter model 3.2° / 3.8°; check M = [1.25 0.5; 0.5 0.25], M × (0, 4) = 2 / 1 N·m);
// impedance (K = 500 N/m, 1 cm, 500 × 0.01 = 5 N; ±1 mm → 11 / 9 mm → 5.5 / 4.5 N vs 12 N; D = 2ζ√(Km), effective mass
// 1 kg / 2 kg; ζ 0.2 / 0.71 / 1 → D 12.6 / 44.7 / 63.2, overshoot 52.7% / 4.3% / 0%; 2√500 = 44.7, 44.7 ÷ 63.2 = 0.71;
// check 4 kg, K 400 → 2 × 1 × √(400 × 4) = 80, 2√400 = 40, 40 ÷ 80 = 0.5); admittance (Ka 0, Da 50 N·s/m, Ma 2 kg, 5 N →
// 5 ÷ 50 = 0.1 m/s, 2 ÷ 50 = 0.04 초; Ke 10⁵ N/m, Δt 0.002 초, Da 50 / 200 / 400 → 4 / 1 / 0.5 → −3x / 0 / 0.5x, > 2
// diverges); hybrid (x · y position, z force; ±1 mm table at 10 N: position 12,000 N/m 0 ~ 22 N, 10 ÷ 12000 ≈ 0.83 mm;
// impedance 500 N/m, 2 cm → 9.5 ~ 10.5 N; hybrid 10 N); residual (thresholds 10 / 20 N·m; 1 × 9.81 × 0.5 = 4.9 N·m,
// 2.5 × 9.81 × 0.5 ≈ 12.3 N·m; check 10 N·m, 0.4 m: 9.81 × 0.4 = 3.924, 10 ÷ 3.924 ≈ 2.55 kg); learning (SERL policy
// 1초에 10 번, controller 1초에 1000 번, 100 번; K 500, Δ 1 cm → 5 N; 시연 20 개, 20 분, 100%; VICES 20 / 500 번).

const S1 = '접촉과 position 제어'
const S2 = 'joint torque 계산'
const S3 = 'impedance 와 비교'
const S4 = '충돌 감지와 학습'

export const script: VideoScript = {
  id: 'impedance-control',
  title: 'Force & Impedance Control',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/impedance-control',
  sections: [S1, S2, S3, S4],
  terms: [
    ['computed-torque control', '컴퓨티드 토크 컨트롤'],
    ['gravity compensation', '그래비티 컴펜세이션'],
    ['impedance controller', '임피던스 컨트롤러'],
    ['variable impedance', '배리어블 임피던스'],
    ['command interface', '커맨드 인터페이스'],
    ['controller_manager', '컨트롤러 매니저'],
    ['critical damping', '크리티컬 댐핑'],
    ['computed torque', '컴퓨티드 토크'],
    ['force/position', '포스 포지션'],
    ['effective mass', '이펙티브 매스'],
    ['hand guiding', '핸드 가이딩'],
    ['action space', '액션 스페이스'],
    ['ros2_control', '로스 투 컨트롤'],
    ['F/T sensor', '에프 티 센서'],
    ['admittance', '어드미턴스'],
    ['controller', '컨트롤러'],
    ['transpose', '트랜스포즈'],
    ['libfranka', '립프랑카'],
    ['impedance', '임피던스'],
    ['stiffness', '스티프니스'],
    ['position', '포지션'],
    ['residual', '레지듀얼'],
    ['Jacobian', '야코비안'],
    ['damping', '댐핑'],
    ['N·m/rad', '뉴턴 미터 퍼 라디안'],
    ['rad/s²', '라디안 퍼 초 제곱'],
    ['dynamics', '다이나믹스'],
    ['gravity', '그래비티'],
    ['control', '컨트롤'],
    ['Franka', '프랑카'],
    ['reward', '리워드'],
    ['hybrid', '하이브리드'],
    ['damper', '댐퍼'],
    ['motor', '모터'],
    ['torque', '토크'],
    ['joint', '조인트'],
    ['model', '모델'],
    ['force', '포스'],
    ['Force', '포스'],
    ['VICES', '바이시스'],
    ['N·s/m', '뉴턴 초 퍼 미터'],
    ['gain', '게인'],
    ['SERL', '에스이알엘'],
    ['N·m', '뉴턴 미터'],
    ['N/m', '뉴턴 퍼 미터'],
    ['m/s', '미터 퍼 초'],
    ['FR3', '에프알 쓰리'],
    ['PCB', '피씨비'],
    ['PD', '피디'],
    ['Kp', '케이피'],
    ['Kd', '케이디'],
    ['mm', '밀리미터'],
    ['cm', '센티미터'],
    ['kg', '킬로그램'],
    ['ᵀ', ' 트랜스포즈 '],
    ['√', ' 루트 '],
    ['&', ' 앤드 '],
    ['τ', '타우'],
    ['ζ', '제타'],
    ['Δ', '델타'],
    ['N', '뉴턴'],
    ['z', '제트'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Force & Impedance Control 은 물체에 닿는 작업을 위해 손끝의 힘과 단단함을 정하는 제어입니다.'],
        [4.2, 7.8, '접촉과 position 제어, joint torque 계산, impedance 와 다른 방식 비교, 충돌 감지와 학습을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '책상이 프로그램이 아는 높이보다 1 mm 만 높아도, position 제어 팔은 책상을 수십 N 으로 짓누릅니다.'],
        [4.4, 7.8, '책상 높이를 정확히 모르는 채로 일정한 힘으로 닦게 하려면, motor 에 무엇을 명령해야 할까요?'],
      ],
    },
    {
      id: 'contact',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'PD 제어는 오차에 gain 을 곱해 힘을 내므로, 손끝에서 보면 목표 위치에 묶인 용수철과 같습니다.'],
        [7, 14, '용수철을 1 m 늘이는 데 드는 힘이 stiffness 이고, 목표가 책상 안쪽이면 손끝은 막혀 오차가 남습니다.'],
        [14, 21, '손끝은 남은 오차에 stiffness 를 곱한 힘으로 누르므로, 1 mm 오차면 힘은 K × 0.001 m 입니다.'],
        [21, 27.7, 'stiffness 가 500, 3,000, 12,000, 57,000 N/m 이면 1 mm 에 0.5, 3, 12, 57 N 으로 누릅니다.'],
      ],
    },
    {
      id: 'joint-gain',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'joint 의 gain Kp 가 손끝에서 내는 stiffness 는 팔 길이 l 로 정해지는데, 그 값은 Kp ÷ l² 입니다.'],
        [
          7,
          14,
          'Franka 예제 값 3000 N·m/rad 에 팔 길이 0.5 m 면, 3000 ÷ 0.5² 로 12,000 N/m 입니다.',
          'Franka 예제 값 3000 N·m/rad 에 팔 길이 0.5 m 면, 3000 ÷ 0.5 제곱으로 12,000 N/m 입니다.',
        ],
        [14, 21, '설정 최댓값 14,250 N·m/rad 면 57,000 N/m 가 되고, 오차가 5 mm 면 285 N 으로 누릅니다.'],
        [21, 27.7, 'I 항까지 있으면 오차가 계속 쌓여 힘이 torque 한계까지 커지는데, FR3 의 87 N·m 는 0.5 m 끝에서 174 N 입니다.'],
      ],
    },
    {
      id: 'pause-gain',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. joint P gain 2000 N·m/rad, 손끝까지 0.4 m, 목표가 2 mm 아래면 손끝은 몇 N 으로 누를까요?'],
        [
          16.5,
          23.5,
          '손끝 stiffness 는 2000 ÷ 0.4² 로 12,500 N/m 이고, 남은 오차 2 mm 를 곱하면 25 N 입니다.',
          '손끝 stiffness 는 2000 ÷ 0.4 제곱으로 12,500 N/m 이고, 남은 오차 2 mm 를 곱하면 25 N 입니다.',
        ],
      ],
    },
    {
      id: 'jacobian',
      seconds: 28,
      section: S2,
      cues: [
        [
          0.3,
          7,
          '손끝 힘 F 를 joint torque τ 로 바꿀 때는 Jacobian 의 transpose 를 곱해, τ = JᵀF 로 계산합니다.',
          '손끝 힘 F 를 joint torque τ 로 바꿀 때는 Jacobian 의 transpose 를 곱해, τ 는 J transpose F 로 계산합니다.',
        ],
        [7, 14, '위팔과 아래팔이 0.5 m 인 팔을 어깨 0°, 팔꿈치 90° 로 두면, 손끝은 가로 0.5 m, 세로 0.5 m 에 있습니다.'],
        [14, 21, '아래로 10 N 누르려면 어깨는 −5 N·m, 팔꿈치는 0 이고, 옆으로 10 N 밀려면 두 joint 모두 −5 N·m 입니다.'],
        [21, 27.7, '팔꿈치가 0 인 것은 손끝이 팔꿈치 바로 위에 있어서, 수직인 힘의 작용선이 팔꿈치를 지나기 때문입니다.'],
      ],
    },
    {
      id: 'computed-torque',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'motor 는 gravity 와 관성, joint 끼리 주고받는 힘도 이겨야 하는데, model M 과 c 로 미리 지울 수 있습니다.'],
        [6, 12, 'computed-torque control 은 원하는 가속도에 M 을 곱하고 c 를 더해, joint 마다 질량 1 인 PD 로 만듭니다.'],
        [
          12,
          18,
          'gain 을 가속도에 곱하므로 critical damping 은 Kd = 2√Kp 이고, Kp 가 100 이면 2√100 으로 20 입니다.',
          'gain 을 가속도에 곱하므로 critical damping 은 Kd 가 2 루트 Kp 이고, Kp 가 100 이면 2 루트 100 으로 20 입니다.',
        ],
        [18, 24, '어깨를 1 초에 0° 에서 60° 로 옮길 때 어깨 최대 오차는 PD 가 6.9° 이고, gravity 를 보상하면 1.9° 입니다.'],
        [24, 29.7, 'computed torque 는 0° 지만, model 의 질량이 20% 가벼우면 어깨 3.2°, 팔꿈치 3.8° 까지 벗어납니다.'],
      ],
    },
    {
      id: 'pause-mass',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 팔을 편 자세에서 gravity 없이 팔꿈치만 4 rad/s² 로 돌리고 어깨는 멈춰 두려면 두 torque 는?',
          '멈추고 적어 보기. 팔을 편 자세에서 gravity 없이 팔꿈치만 4 라디안 퍼 초 제곱으로 돌리고 어깨는 멈춰 두려면 두 torque 는?',
        ],
        [
          16.5,
          23.5,
          'τ = M × (0, 4) 라서 어깨는 0.5 × 4 로 2 N·m, 팔꿈치는 0.25 × 4 로 1 N·m 입니다. 어깨도 버텨야 합니다.',
          'τ 는 M 에 0, 4 를 곱한 값이라서 어깨는 0.5 × 4 로 2 N·m, 팔꿈치는 0.25 × 4 로 1 N·m 입니다. 어깨도 버텨야 합니다.',
        ],
      ],
    },
    {
      id: 'impedance',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'impedance control 은 손끝이 목표에 용수철 K 와 damper D 로 매달린 것처럼 힘을 내서 torque 로 바꿉니다.'],
        [6.5, 13, 'K 를 500 N/m 로 두고 목표를 책상 윗면 1 cm 아래에 두면, 손끝은 윗면에서 멈춰 5 N 으로 누릅니다.'],
        [13, 19.5, '책상이 1 mm 높으면 5.5 N, 낮으면 4.5 N 이라서, position 제어가 같은 1 mm 에 내는 12 N 차이보다 작습니다.'],
        [
          19.5,
          26,
          'D 는 D = 2ζ√(Km) 로 고르는데, 손끝이 느끼는 질량 m 은 이 팔에서 가로 1 kg, 세로 2 kg 처럼 방향마다 다릅니다.',
          'D 는 2 제타 루트 K 엠 으로 고르는데, 손끝이 느끼는 질량 엠 은 이 팔에서 가로 1 kg, 세로 2 kg 처럼 방향마다 다릅니다.',
        ],
        [
          26,
          31.7,
          'Franka 예제의 D = 2√K 는 1 kg 에 맞춘 식이라, K 500 의 세로 방향에서는 ζ 가 44.7 ÷ 63.2 로 0.71 입니다.',
          'Franka 예제의 D 는 2 루트 K 로 1 kg 에 맞춘 식이라, K 500 의 세로 방향에서는 ζ 가 44.7 ÷ 63.2 로 0.71 입니다.',
        ],
      ],
    },
    {
      id: 'compare',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, '손목 F/T sensor 로 잰 힘으로 움직일 위치를 정해 position 명령으로 넘기는 것이 admittance control 입니다.'],
        [6.5, 13, 'hand guiding 에서 damping 50 N·s/m 인 팔을 5 N 으로 밀면, 손끝은 5 ÷ 50 으로 0.1 m/s 로 움직입니다.'],
        [13, 19.5, '단단한 벽에는 약한데, 제어 주기 × 벽 stiffness ÷ damping 이 2 를 넘으면 흔들림이 커지며 발산합니다.'],
        [
          19.5,
          26,
          'hybrid control 은 축마다 위치와 힘 중 하나를 골라, 닦기에서 z 를 힘 축으로 두면 10 N 을 그대로 지킵니다.',
        ],
        [
          26,
          31.7,
          '±1 mm 책상을 10 N 으로 닦으면 position 은 0 ~ 22 N 을 오가고, impedance 는 9.5 ~ 10.5 N 입니다.',
          '±1 mm 책상을 10 N 으로 닦으면 position 은 0 에서 22 N 을 오가고, impedance 는 9.5 에서 10.5 N 입니다.',
        ],
      ],
    },
    {
      id: 'pause-damping',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 질량 4 kg 인 방향에 K = 400 N/m 를 걸면 critical damping 의 D 는? D = 2√K 면 ζ 는?',
          '멈추고 적어 보기. 질량 4 kg 인 방향에 K 400 N/m 를 걸면 critical damping 의 D 는? D 가 2 루트 K 면 ζ 는?',
        ],
        [
          16.5,
          23.5,
          'D 는 2 × 1 × √(400 × 4) 로 80 N·s/m 입니다. 2√400 인 40 을 쓰면 ζ 는 40 ÷ 80 으로 0.5 입니다.',
          'D 는 2 × 1 × 루트 400 × 4 로 80 N·s/m 입니다. 2 루트 400 인 40 을 쓰면 ζ 는 40 ÷ 80 으로 0.5 입니다.',
        ],
      ],
    },
    {
      id: 'residual',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'model 이 지금의 움직임으로 예측한 torque 와 실제로 잰 torque 의 차이를 residual 이라고 합니다.'],
        [
          7,
          14,
          '팔이 허공에서 움직이면 residual 은 0 근처에 있고, 무언가에 닿으면 JᵀF 만큼 더해져 커집니다.',
          '팔이 허공에서 움직이면 residual 은 0 근처에 있고, 무언가에 닿으면 J transpose F 만큼 더해져 커집니다.',
        ],
        [14, 21, 'libfranka 예제는 등속 구간의 충돌 문턱을 10 N·m 로 두고, 가속 · 감속 구간은 20 N·m 로 높여 둡니다.'],
        [21, 27.7, '0.5 m 앞에 든 짐도 residual 을 올려, 1 kg 은 4.9 N·m 이고 2.5 kg 은 약 12.3 N·m 라서 팔이 멈춥니다.'],
      ],
    },
    {
      id: 'policy',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, '핀을 옮길 때는 단단하고 꽂을 때는 옆이 물러야 해서, K 와 D 를 시간에 따라 바꾸는 variable impedance 를 씁니다.'],
        [6, 12, 'SERL 의 policy 는 1초에 10 번 목표를 내고, controller 는 목표 하나마다 torque 를 100 번 계산합니다.'],
        [
          12,
          18,
          '목표를 책상 깊숙이 찍으면 큰 힘이 나서 거리를 Δ 이하로 자르는데, K 500 에 Δ 1 cm 면 5 N 을 넘지 않습니다.',
        ],
        [18, 24, 'PCB 에 부품을 꽂는 작업에서 SERL 은 시연 20 개와 20 분의 학습으로 성공률 100% 를 보고했습니다.'],
        [24, 29.7, 'VICES 는 policy 가 stiffness 와 damping 도 내게 했고, 표면 닦기에서 다른 방식보다 높은 reward 를 얻었습니다.'],
      ],
    },
    {
      id: 'pause-residual',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 문턱 10 N·m 인 joint 에서 손끝까지 0.4 m 면, model 에 없는 짐이 몇 kg 을 넘을 때 멈출까요?'],
        [16.5, 23.5, '짐의 torque 는 질량 × 9.81 × 0.4 라서, 10 ÷ 3.924 로 약 2.55 kg 을 넘으면 들고만 있어도 충돌로 판단합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 단단한 position 제어는 오차 1 mm 에 12 N 을 내니, 손끝 stiffness 를 낮게 정해야 합니다.'],
        [
          4.2,
          8.2,
          '원하는 손끝 힘 F 를 τ = JᵀF 로 joint torque 로 바꿔 motor 에 명령하고, model 로 dynamics 를 지웁니다.',
          '원하는 손끝 힘 F 에 J transpose 를 곱해 joint torque 로 바꿔 motor 에 명령하고, model 로 dynamics 를 지웁니다.',
        ],
        [
          8.2,
          12.2,
          'K 500 N/m 용수철로 목표를 1 cm 아래에 두면 높이가 1 mm 틀려도 4.5 ~ 5.5 N 으로 누릅니다.',
          'K 500 N/m 용수철로 목표를 1 cm 아래에 두면 높이가 1 mm 틀려도 4.5 에서 5.5 N 으로 누릅니다.',
        ],
        [12.2, 15.7, 'residual 로 충돌을 감지하고, 학습한 policy 는 impedance controller 위에서 목표와 stiffness 를 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'command interface 로 torque 를 보내는 controller 의 구조는 다음 강의 ros2_control 에서 다룹니다.']],
    },
  ],
}
