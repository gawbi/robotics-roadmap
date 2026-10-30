import type { VideoScript } from '../script.ts'

// Numbers follow lessons/locomotion-deployment/README.md only: the four stages and the policy period (Isaac Gym 0.005 s ×
// decimation 4, MuJoCo 0.002 s × 10, 0.02 s, 50 a second; check 0.02 ÷ 0.001 = 20); what the policy file leaves out (G1
// 47 in → 12 out; scales × 0.25, × 1, × 2 / 2 / 0.25, × 1, × 0.05, clock 0.8 s; knee 4 rad/s × 0.05 = 0.2, noise ±1.5 ×
// 0.05 = ±0.075, 4 is 20 ×; target = default + 0.25 × action, 0.3 + 0.25 × 0.4 = 0.4 rad vs legged_gym 0.5 → 0.5 rad,
// 0.1 vs 0.2 off the default; check 0.8 × 0.25 = 0.2, 0.5 × 2 = 1.0, −2 × 0.05 = −0.1); joint order (H1 map [7, 3, 4, 5, 10,
// 8, 0, 1, 2, 11], 10 leg joints; knee 0.3 rad → motor 3 hip roll, ≈ 17°, kp 200, 200 × 0.3 = 60 N·m; G1 [0, 1, …, 11];
// depth-first vs breadth-first first six; quaternion (w, x, y, z) vs (x, y, z, w); check slot 8 → motor 2, motor 8 = slot
// 5); gravity ((0, 0, −1); 10° forward: sin 10° = 0.174, cos 10° = 0.985 → (0.174, 0, −0.985); the three formulas;
// (cos 5°, 0, sin 5°, 0) = (0.996, 0, 0.087, 0), 2 × 0.996 × 0.087 = 0.174, 1 − 2 × 0.996² = −0.985; misread → −0.174;
// (0, 0, 0, 1) still (0, 0, −1)); body velocity (48 obs, first 3 slots × 2; 0.05 m/s² × 10 s = 0.5 m/s; Bloesch EKF,
// StarlETH 60 s, ≈ 1 m, 10%, RMS 0.011 ~ 0.015 m/s; slip 0.01 ÷ 0.02 = 0.5 m/s; Ji MLP estimator, Mini Cheetah 3.75 m/s,
// friction 0.22 → 3.54 m/s, 7 µs vs 34 µs; G1 actor 47, critic 50; check 0.02 ÷ 0.02 = 1 m/s); motor commands (q, dq, kp,
// kd, tau; G1 knee kp 150, kd 4: 150 × 0.05 + 4 × (0 − 1) = 7.5 − 4 = 3.5 N·m; damping kp 0, kd 8, 8 × 2 = 16 N·m; start-up
// 2 s in 100 steps of 0.02 s, knee 1.0 → 0.3 rad = 0.7 rad, 150 × 0.7 = 105 N·m vs 0.7 ÷ 100 = 0.007, 150 × 0.007 = 1.05
// N·m); loop timing (3 ms + 20 ms = 23 ms, 1 ÷ 0.023 ≈ 43.5, 0.8 ÷ 0.02 = 40 steps, 40 × 0.023 = 0.92 s, 15%; cpp_g1
// sleep_until; check 5 + 20 = 25 ms, 1 ÷ 0.025 = 40, 40 × 0.025 = 1.0 s).

const S1 = 'policy 밖의 숫자'
const S2 = '관절 순서와 중력'
const S3 = '몸통 속도라는 빈칸'
const S4 = 'motor 명령과 주기'

export const script: VideoScript = {
  id: 'locomotion-deployment',
  title: 'Locomotion Deployment',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/locomotion-deployment',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Locomotion Deployment', '로코모션 디플로이먼트'],
    ['Perceptive Locomotion', '퍼셉티브 로코모션'],
    ['Humanoid Locomotion', '휴머노이드 로코모션'],
    ['linear Kalman filter', '리니어 칼만 필터'],
    ['unitree_rl_gym', '유니트리 알엘 짐'],
    ['Kalman filter', '칼만 필터'],
    ['Mini Cheetah', '미니 치타'],
    ['zero torque', '제로 토크'],
    ['sleep_until', '슬립 언틸'],
    ['legged_gym', '레그드 짐'],
    ['rt/lowcmd', '알티 로우 커맨드'],
    ['quaternion', '쿼터니언'],
    ['observation', '옵저베이션'],
    ['decimation', '데시메이션'],
    ['kinematics', '키네마틱스'],
    ['simulation', '시뮬레이션'],
    ['simulator', '시뮬레이터'],
    ['estimator', '에스티메이터'],
    ['Isaac Gym', '아이작 짐'],
    ['Isaac Lab', '아이작 랩'],
    ['StarlETH', '스탈레스'],
    ['Sim2Real', '심 투 리얼'],
    ['Ethernet', '이더넷'],
    ['Unitree', '유니트리'],
    ['Sim2Sim', '심 투 심'],
    ['physics', '피직스'],
    ['damping', '댐핑'],
    ['hip roll', '힙 롤'],
    ['hip yaw', '힙 요'],
    ['Bloesch', '블로시'],
    ['PD gain', '피디 게인'],
    ['cpp_g1', '씨피피 지 원'],
    ['MuJoCo', '무조코'],
    ['script', '스크립트'],
    ['weight', '웨이트'],
    ['select', '셀렉트'],
    ['Python', '파이썬'],
    ['critic', '크리틱'],
    ['actor', '액터'],
    ['clock', '클락'],
    ['start', '스타트'],
    ['motor', '모터'],
    ['batch', '배치'],
    ['Train', '트레인'],
    ['rad/s', '라디안 퍼 세컨드'],
    ['m/s', '미터 퍼 세컨드'],
    ['N·m', '뉴턴 미터'],
    ['Play', '플레이'],
    ['loop', '루프'],
    ['roll', '롤'],
    ['pitch', '피치'],
    ['yaw', '요'],
    ['sin', '사인'],
    ['cos', '코사인'],
    ['tau', '타우'],
    ['rad', '라디안'],
    ['EKF', '이케이에프'],
    ['IMU', '아이엠유'],
    ['MLP', '엠엘피'],
    ['PPO', '피피오'],
    ['RMS', '알엠에스'],
    ['DDS', '디디에스'],
    ['C++', '씨 플러스 플러스'],
    ['G1', '지 원'],
    ['H1', '에이치 원'],
    ['Ji', '지'],
    ['dq', '디 큐'],
    ['kp', '케이 피'],
    ['kd', '케이 디'],
    ['µs', '마이크로초'],
    ['cm', '센티미터'],
    ['torque', '토크'],
    ['noise', '노이즈'],
    ['topic', '토픽'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Locomotion Deployment 는 simulation 에서 학습한 보행 policy 를 실물 4족·휴머노이드에 올리는 일입니다.'],
        [4.2, 7.8, 'policy 밖의 숫자, 관절 순서와 중력 방향, 직접 잴 수 없는 몸통 속도, motor 명령과 제어 주기를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '학습이 끝나면 손에 남는 것은 weight 를 담은 파일 하나이고, 하나만 어긋나도 실물은 바로 쓰러집니다.'],
        [4.4, 7.8, 'simulator 가 대신 해 주던 일 가운데, 배포 코드는 무엇을 학습 때와 똑같이 다시 해야 할까요?'],
      ],
    },
    {
      id: 'stages',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'unitree_rl_gym 은 학습에서 실물까지를 Train, Play, Sim2Sim, Sim2Real 네 단계로 나눕니다.'],
        [6.5, 13, 'Train 과 Play 에서는 학습 환경이 observation 을 만들어서, 잘 걸어도 배포 코드가 맞다는 뜻은 아닙니다.'],
        [13, 19.5, 'Sim2Sim 의 MuJoCo script 는 observation 을 실물 배포처럼 다시 조립해서, 여기서 배포 코드를 처음 시험합니다.'],
        [
          19.5,
          25.7,
          'physics 간격은 0.005 초 × 4 와 0.002 초 × 10 으로 달라도, policy 는 모두 0.02 초마다 불립니다.',
          'physics 간격은 0.005 초에 decimation 4 와 0.002 초에 decimation 10 으로 달라도, policy 는 모두 0.02 초마다 불립니다.',
        ],
      ],
    },
    {
      id: 'obs',
      seconds: 31,
      section: S1,
      cues: [
        [0.3, 6.5, 'G1 policy 파일은 숫자 47 개를 받아 12 개를 내는 함수일 뿐이고, 각 칸의 뜻과 배율은 설정 파일에 따로 있습니다.'],
        [6.5, 12.5, '관절 속도 칸은 0.05 배라서 무릎이 4 rad/s 로 돌면 0.2 가 들어가고, 학습 때 noise 는 ±0.075 였습니다.'],
        [12.5, 18.5, '배포 코드가 0.05 를 빠뜨리면 policy 는 학습 때 보던 크기의 20 배인 4 를 받고, 무엇을 낼지 예측할 수 없습니다.'],
        [18.5, 24.5, '목표 각도는 기본 자세에 action 의 0.25 배를 더해서, 무릎 기본 0.3 rad 에 0.4 를 내면 0.4 rad 입니다.'],
        [24.5, 30.7, 'legged_gym 의 기본값 0.5 를 잘못 적으면 0.5 rad 가 되어, 기본 자세에서 벗어나는 양이 두 배가 됩니다.', 'legged_gym 의 기본값 0.5 를 잘못 적으면 0.5 rad 이 되어, 기본 자세에서 벗어나는 양이 두 배가 됩니다.'],
      ],
    },
    {
      id: 'pause-obs',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 회전 0.8 rad/s, 앞 속도 명령 0.5 m/s, 무릎 −2 rad/s 이면 세 칸에는 무엇이 들어갈까요?'],
        [
          16.5,
          23.5,
          '회전 속도는 0.8 × 0.25 로 0.2 이고, 속도 명령은 0.5 × 2 로 1.0 이고, 무릎은 −2 × 0.05 로 −0.1 입니다.',
        ],
      ],
    },
    {
      id: 'joints',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'policy 의 출력 칸은 simulator 가 정한 관절 순서를 따르고, 실물 motor 는 제조사가 정한 번호로 불립니다.'],
        [6.5, 12.5, 'H1 의 대응표는 7, 3, 4, 5, 10, 8, 0, 1, 2, 11 이고, G1 은 칸과 motor 번호가 같습니다.'],
        [12.5, 19, '대응표가 없으면 왼쪽 무릎의 목표 0.3 rad 가 motor 3 인 hip roll 로 가고, 그 순간 torque 는 60 N·m 입니다.', '대응표가 없으면 왼쪽 무릎의 목표 0.3 rad 이 motor 3 인 hip roll 로 가고, 그 순간 torque 는 60 N·m 입니다.'],
        [19, 25.7, 'Isaac Gym 은 관절을 깊이 우선으로 세고 Isaac Lab 은 너비 우선으로 세며, quaternion 칸 순서도 다릅니다.'],
      ],
    },
    {
      id: 'gravity',
      seconds: 31,
      section: S2,
      cues: [
        [0.3, 6.3, 'policy 는 몸통의 기울기를 몸통에서 본 중력 방향으로 받습니다. 똑바로 서 있으면 (0, 0, −1) 입니다.'],
        [6.3, 12.3, '앞으로 10° 숙이면 sin 10° 가 0.174 이고 cos 10° 가 0.985 라서 (0.174, 0, −0.985) 가 됩니다.'],
        [12.3, 18.3, '배포 script 는 IMU 가 준 (w, x, y, z) 순서의 quaternion 에서 이 중력 방향을 계산합니다.'],
        [18.3, 24.5, 'x, y, z, w 순서의 값을 w, x, y, z 로 잘못 읽으면 x 성분이 −0.174 가 되어 뒤로 젖혔다고 읽습니다.'],
        [24.5, 30.7, '똑바로 선 자세는 잘못 읽어도 (0, 0, −1) 이라서, 서 있을 때는 멀쩡하다가 기울면 반대로 바로잡으려 합니다.'],
      ],
    },
    {
      id: 'pause-joint',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. H1 의 칸 8 인 오른쪽 무릎은 어느 motor 로 가야 하고, 대응표를 빠뜨리면 어느 관절이 받을까요?'],
        [16.5, 23.5, '칸 8 은 motor 2 로 가야 합니다. motor 8 은 칸 5 인 오른쪽 hip yaw 라서, 무릎의 목표를 받아 다리를 비틉니다.'],
      ],
    },
    {
      id: 'integrate',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'legged_gym 의 기본 observation 48 개는 맨 앞 3 칸이 몸통 선속도지만, 몸통 속도를 직접 재는 센서는 없습니다.'],
        [6.5, 12.8, 'IMU 가속도를 적분하면 오차가 쌓여서, 0.05 m/s² 만 남아도 10 초 뒤 0.5 m/s 가 틀어집니다.'],
        [12.8, 19.2, 'Bloesch 등의 EKF 는 IMU 로 몸통의 움직임을 예측하고, 땅에 닿은 발을 고정으로 보고 kinematics 로 보정합니다.'],
        [
          19.2,
          25.7,
          'StarlETH 실험의 속도 RMS 오차는 0.011 ~ 0.015 m/s 였지만, 절대 위치와 yaw 는 계속 조금씩 어긋납니다.',
          'StarlETH 실험의 속도 RMS 오차는 0.011 에서 0.015 m/s 였지만, 절대 위치와 yaw 는 계속 조금씩 어긋납니다.',
        ],
      ],
    },
    {
      id: 'estimator',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.8, 'Ji 등은 관절과 IMU 이력에서 몸통 선속도, 발 높이, 접촉 확률을 내는 estimator 를 policy 와 함께 학습했습니다.'],
        [6.8, 13.2, 'Mini Cheetah 는 평지에서 3.75 m/s 로 달렸고, 마찰 계수 0.22 의 미끄러운 판에서는 3.54 m/s 로 달렸습니다.'],
        [13.2, 19.4, 'estimator 는 한 번 계산하는 데 7 µs 가 걸려서, 34 µs 가 걸리는 linear Kalman filter 보다 빨랐습니다.'],
        [19.4, 25.7, 'G1 은 actor 가 받는 47 개에서 속도를 빼고 critic 의 50 개에만 넣어서, 배포 때 속도를 추정할 필요가 없습니다.'],
      ],
    },
    {
      id: 'pause-slip',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 땅에 닿았다고 본 발이 0.02 초 동안 2 cm 미끄러지면, 몸통 속도 추정은 얼마나 틀어질까요?'],
        [16.5, 23.5, '미끄러진 0.02 m 를 0.02 초로 나누면 1 m/s 입니다. 걷기 명령 0.5 m/s 보다 커서, 접촉 판정이 정확도를 좌우합니다.'],
      ],
    },
    {
      id: 'motor',
      seconds: 31,
      section: S4,
      cues: [
        [0.3, 6.5, '배포 script 는 DDS 의 rt/lowcmd topic 으로 motor 마다 q, dq, kp, kd, tau 다섯 숫자를 보냅니다.'],
        [6.5, 12.6, 'G1 무릎은 kp 150, kd 4 라서 목표 0.4 rad, 지금 0.35 rad, 각속도 1 rad/s 이면 3.5 N·m 를 냅니다.'],
        [12.6, 18.6, 'damping 명령은 kp 0, kd 8 이라서 2 rad/s 로 접히면 16 N·m 로 버티지만, 멈춘 관절은 붙잡지 못해 주저앉습니다.'],
        [18.6, 24.6, '매단 채 zero torque 에서 start 로 기본 자세로 옮기고, A 로 실행한 뒤 select 로 damping 에 넣습니다.'],
        [24.6, 30.7, '무릎 0.7 rad 를 한 번에 옮기면 105 N·m 지만, 2 초 동안 100 step 에 나누면 1.05 N·m 에서 시작합니다.', '무릎 0.7 rad 을 한 번에 옮기면 105 N·m 지만, 2 초 동안 100 step 에 나누면 1.05 N·m 에서 시작합니다.'],
      ],
    },
    {
      id: 'loop',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.8, '0.02 초를 쉬는 loop 는 계산과 통신에 3 ms 가 걸리면 한 바퀴가 23 ms 라서, 1초에 약 43.5 번 불립니다.'],
        [6.8, 13, '걸음 clock 의 40 step 은 실제로 0.92 초가 걸리고, action 하나가 motor 에 머무는 시간은 15% 늘어납니다.'],
        [13, 19.4, 'C++ 예제 cpp_g1 은 다음 시작 시각까지만 기다려서, 계산이 0.02 초보다 짧으면 주기가 그대로입니다.'],
        [19.4, 25.7, '어느 쪽이든 policy 계산이 0.02 초를 넘으면 주기를 지킬 수 없으니, loop 의 시작 시각을 기록해 간격을 확인합니다.'],
      ],
    },
    {
      id: 'pause-loop',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 계산에 5 ms 가 걸리고 20 ms 를 쉬면, policy 는 1초에 몇 번 불리고 clock 은 몇 초에 한 바퀴일까요?'],
        [16.5, 23.5, '한 바퀴가 25 ms 라서 1초에 40 번 불리고, 40 step 인 걸음 clock 은 40 × 0.025 로 1.0 초마다 돕니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. policy 파일 밖의 배율, 기본 자세, action 배율, PD gain, 0.02 초 주기를 학습 때와 똑같이 맞춥니다.'],
        [4.2, 8.2, '관절 목표는 대응표로 맞는 motor 에 보내고, 중력 방향은 quaternion 의 칸 순서를 확인해 계산합니다.'],
        [8.2, 12.2, '직접 잴 수 없는 몸통 속도는 Kalman filter 나 학습한 estimator 로 추정하거나, actor 의 입력에서 뺍니다.'],
        [12.2, 15.7, '매단 채 zero torque 에서 2 초 보간으로 켜고 damping 으로 끄며, 다음 시작 시각까지 기다려 주기를 지킵니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '다음 강의 Perceptive Locomotion 에서는 지형을 보는 센서를 observation 에 더합니다.'],
        [3.6, 6.6, '센서가 늦거나 틀릴 때 policy 가 버티는 방법을 보고, 휴머노이드의 보행은 Humanoid Locomotion 에서 다룹니다.'],
      ],
    },
  ],
}
