import type { VideoScript } from '../script.ts'

// Numbers follow lessons/transforms/README.md: the wrist camera (정면 25 cm, 오른쪽 2 cm, 위쪽 1 cm; 4×4 행렬; tf2 이동량 3 개 +
// quaternion 4 개); frame 과 pose (1 m 격자, 컵 (5, 2) in a, frame b at (3, 1) same direction → (2, 1); p_a = p_ab + p_b;
// base_link x·y·z = 앞·왼쪽·위); 2D rotation (30° → (0.866, 0.5), 90° → (0, 1); R(30°) = [0.866 −0.5; 0.5 0.866]; (2, 1) →
// (1.232, 1.866), √5 ≈ 2.236; R⁻¹ = Rᵀ; frame b 90°: x_b = (0, 1), y_b = (−1, 0), 2 × (0, 1) + 1 × (−1, 0) = (−1, 2));
// homogeneous transform (b at (3, 1), 90°: R(90°) × (2, 1) = (−1, 2), + (3, 1) = (2, 3); wrong order (5, 2) → (−2, 5);
// T_ab = [0 −1 3; 1 0 1; 0 0 1], first row 0 × 2 + (−1) × 1 + 3 × 1 = 2; 3D 4×4, SE(3), SE(2)); composition (base at (3, 1)
// 90°, camera at base (2, 0): (1, 0) + (2, 0) = (3, 0), R(90°) × (3, 0) + (3, 1) = (0, 3) + (3, 1) = (3, 4); T_wc = [0 −1 3;
// 1 0 3; 0 0 1]; T_bc T_wb → (5, 2); M = x 방향 2: right (3, 3), left (5, 1); check question y 방향 1 → (−1, 0) + (3, 1) =
// (2, 1)); inverse ((2, 3) − (3, 1) = (−1, 2) → (2, 1); −Rᵀ(3, 1) = (−1, 3); wrong −p = (−3, −1): (3, −2) + (−3, −1) = (0, −3));
// 3D rotation (R_z(90°) R_x(90°): x → (0, 1, 0); reversed → (0, 0, 1); R_x/R_y/R_z(90°) columns); roll-pitch-yaw (9 개 →
// 3 개; URDF rpy radian, 1.5708 ≈ π/2 = 90°, R = R_z R_y R_x; RealSense D435 rpy = (−1.5708, 0, −1.5708); gimbal lock at pitch
// 90°: (30°, 90°, 0°) = (0°, 90°, −30°); check question (10°, 90°, 0°) → (0°, 90°, −10°)); axis-angle ((1, 1, 1) axis, 360° ÷ 3
// = 120°, ω̂ ≈ (0.577, 0.577, 0.577)); quaternion (θ/2; identity (1, 0, 0, 0), z 90° (0.707, 0, 0, 0.707), (1, 1, 1) 120° (0.5,
// 0.5, 0.5, 0.5); q and −q; ROS x, y, z, w (0, 0, 0.707, 0.707), MuJoCo · Eigen w, x, y, z; 1843 Hamilton not used); slerp
// (averaging I and R_z(90°): first column (0.5, 0.5, 0), length ≈ 0.707; t = 0.25: 18.4°, 0.79 배; slerp 0°, 22.5°, 45°, 67.5°,
// 90°; −q₁ long arc 270°; Shoemake 1985); wrist camera (optical z·x·y = 앞·오른쪽·아래; p_c = (0.02, −0.01, 0.25) m; T_ec
// (0, 0.06, 0) → (0.02, 0.05, 0.25); gripper (0.4, 0, 0.3) m, x 축 180° → (0.02, −0.05, −0.25) → (0.42, −0.05, 0.05));
// tf2 (TF_DENORMALIZED_QUATERNION: 0.01, 0.7² + 0.7² = 0.98; translation 직선 보간, rotation slerp); odom (1 m/s, 90°/s, 1 초,
// r = 2/π ≈ 0.637 m, (0.637, 0.637); one piece (1, 0), 0.733 m; 10⁻⁶ rad not used; map → odom: odom (2, 0) yaw 0°, map (5, 3)
// yaw 90°: −(2, 0) = (−2, 0), R(90°) × (−2, 0) + (5, 3) = (0, −2) + (5, 3) = (5, 1), yaw 90°; check question (3, 0) →
// R(90°) × (3, 0) + (5, 1) = (0, 3) + (5, 1) = (5, 4)).

const S1 = 'frame 과 rotation'
const S2 = '합성과 역변환'
const S3 = '3D 자세 표현'
const S4 = 'tf2 · 카메라 · odom'

export const script: VideoScript = {
  id: 'transforms',
  title: 'Rigid Transforms',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/transforms',
  sections: [S1, S2, S3, S4],
  terms: [
    ['homogeneous coordinates', '호모지니어스 코디네이츠'],
    ['homogeneous transform', '호모지니어스 트랜스폼'],
    ['Forward Kinematics', '포워드 키네마틱스'],
    ['Rigid Transforms', '리지드 트랜스폼스'],
    ['rotation matrix', '로테이션 매트릭스'],
    ['Camera Geometry', '카메라 지오메트리'],
    ['rigid transform', '리지드 트랜스폼'],
    ['optical frame', '옵티컬 프레임'],
    ['gimbal lock', '짐벌 락'],
    ['axis-angle', '액시스 앵글'],
    ['frame tree', '프레임 트리'],
    ['translation', '트랜슬레이션'],
    ['quaternion', '쿼터니언'],
    ['odometry', '오도메트리'],
    ['RealSense', '리얼센스'],
    ['transpose', '트랜스포즈'],
    ['base_link', '베이스 링크'],
    ['rotation', '로테이션'],
    ['gripper', '그리퍼'],
    ['MuJoCo', '무조코'],
    ['camera', '카메라'],
    ['radian', '라디안'],
    ['slerp', '슬러프'],
    ['frame', '프레임'],
    ['world', '월드'],
    ['pitch', '피치'],
    ['pixel', '픽셀'],
    ['D435', '디 사삼오'],
    ['T_wc', '티 더블유씨'],
    ['T_wb', '티 더블유비'],
    ['T_bc', '티 비씨'],
    ['T_ab', '티 에이비'],
    ['T_be', '티 비이'],
    ['T_ec', '티 이씨'],
    ['p_ab', '피 에이비'],
    ['R_ab', '알 에이비'],
    ['R_z', '알 지'],
    ['R_x', '알 엑스'],
    ['p_a', '피 에이'],
    ['p_b', '피 비'],
    ['p_c', '피 씨'],
    ['base', '베이스'],
    ['pose', '포즈'],
    ['roll', '롤'],
    ['odom', '오돔'],
    ['URDF', '유알디에프'],
    ['tf2', '티에프 투'],
    ['ROS', '로스'],
    ['rpy', '알피와이'],
    ['yaw', '요'],
    ['map', '맵'],
    ['cos', '코사인'],
    ['sin', '사인'],
    ['Rᵀ', '알 트랜스포즈'],
    ['rad', '라디안'],
    ['cm', '센티미터'],
    ['θ', '세타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'rigid transform 은 모양은 그대로 두고 돌리고 옮기기만 하는 변환으로, frame 사이에서 점의 좌표를 바꿉니다.'],
        [4.2, 7.8, 'frame 과 rotation matrix, 합성과 역변환, 3D 자세 표현, tf2 와 손목 카메라와 odom 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '손목 카메라로 컵을 찾았더니 사진 기준으로 정면 25 cm, 오른쪽 2 cm, 위쪽 1 cm 에 있습니다.'],
        [4.4, 7.8, '팔이 손을 뻗으려면 몸통에서 잰 위치가 필요한데, 카메라가 잰 숫자를 어떻게 바꿔야 할까요?'],
      ],
    },
    {
      id: 'frames',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, '원점과 서로 직각인 축의 묶음이 frame 입니다. 교실 구석의 frame a 에서 재면 컵은 (5, 2) 에 있습니다.'],
        [7, 14, '구석에서 (3, 1) 에 같은 방향을 보고 선 로봇의 frame b 로 재면, 같은 컵이 (2, 1) 에 있습니다.'],
        [
          14,
          21,
          '방향이 같으면 p_a = p_ab + p_b 로 더하면 되지만, 대개는 frame b 의 축이 어느 쪽을 향하는지도 알아야 합니다.',
          '방향이 같으면 p_a 는 p_ab 더하기 p_b 로 더하면 되지만, 대개는 frame b 의 축이 어느 쪽을 향하는지도 알아야 합니다.',
        ],
        [21, 27.5, '위치와 방향을 묶어 pose 라고 합니다. ROS 의 base_link 는 x · y · z 축이 앞 · 왼쪽 · 위를 향합니다.'],
      ],
    },
    {
      id: 'rotation',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 7.5, '단위원에서 각도 θ 인 점은 (cos θ, sin θ) 라서, 30° 는 (0.866, 0.5) 이고 90° 는 (0, 1) 입니다.'],
        [7.5, 15, 'rotation matrix 는 길이 1 인 두 축 화살표 (1, 0) 과 (0, 1) 이 돌아서 도착하는 곳을 열로 세운 행렬입니다.'],
        [15, 22.5, '두 열은 길이 1 에 서로 직각이라, (2, 1) 과 돌린 (1.232, 1.866) 은 모두 원점에서 약 2.236 떨어져 있습니다.'],
        [22.5, 29.5, 'R_ab 로 읽으면 열은 frame b 의 축을 frame a 에서 잰 값입니다. 역행렬은 계산할 필요 없이 Rᵀ 입니다.'],
      ],
    },
    {
      id: 'pause-axes',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 원점이 같고 90° 돌아 있는 frame b 의 (2, 1) 은 frame a 에서 어디일까요?'],
        [
          16.5,
          23.5,
          'x 축은 (0, 1) 을 향하고 y 축은 (−1, 0) 을 향해서, 2 × (0, 1) + 1 × (−1, 0) 인 (−1, 2) 입니다.',
          'x 축은 (0, 1) 을 향하고 y 축은 (−1, 0) 을 향해서, 2 × (0, 1) 더하기 1 × (−1, 0) 인 (−1, 2) 입니다.',
        ],
      ],
    },
    {
      id: 'homogeneous',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'frame b 가 (3, 1) 에서 90° 돌았으면, (2, 1) 을 (−1, 2) 로 돌리고 (3, 1) 을 더해 (2, 3) 이 됩니다.'],
        [7, 14, '순서를 바꿔 (3, 1) 을 먼저 더하고 돌리면 (−2, 5) 입니다. p_ab 는 이미 frame a 에서 잰 값이라 돌리면 안 됩니다.'],
        [14, 21, '좌표 끝에 1 을 붙인 homogeneous coordinates 를 쓰면, 돌리기와 더하기가 T_ab 곱 한 번이 됩니다.'],
        [
          21,
          27.5,
          '첫째 행은 0 × 2 + (−1) × 1 + 3 × 1 = 2 이고, 끝의 3 × 1 이 translation 입니다.',
          '첫째 행은 0 × 2 더하기 마이너스 1 × 1 더하기 3 × 1 로 2 이고, 끝의 3 × 1 이 translation 입니다.',
        ],
      ],
    },
    {
      id: 'compose-inverse',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, 'camera 의 (1, 0) 은 base 의 (2, 0) 을 더해 (3, 0) 이 되고, world 에서는 (3, 4) 가 됩니다.'],
        [
          6.5,
          13,
          'T_wc = T_wb T_bc 를 먼저 곱해 두면 같은 답이 나옵니다. 맞닿는 두 아래첨자가 같은 b 여야 합니다.',
          'T_wc 는 T_wb 곱하기 T_bc 이고, 먼저 곱해 두면 같은 답이 나옵니다. 맞닿는 두 아래첨자가 같은 b 여야 합니다.',
        ],
        [13, 19.5, 'x 방향 2 움직임을 오른쪽에 곱하면 로봇의 x 축으로 가서 (3, 3) 이고, 왼쪽에 곱하면 (5, 1) 입니다.'],
        [19.5, 25.5, '역변환은 원점 위치를 먼저 빼고 Rᵀ 로 돌립니다. (2, 3) 에서 (3, 1) 을 빼고 −90° 돌리면 (2, 1) 입니다.'],
        [
          25.5,
          31.7,
          'translation 칸은 −Rᵀp 인 (−1, 3) 입니다. −p 인 (−3, −1) 을 넣으면 (0, −3) 이라는 틀린 답이 나옵니다.',
          'translation 칸은 마이너스 Rᵀ 피 인 (−1, 3) 입니다. 마이너스 피 인 (−3, −1) 을 넣으면 (0, −3) 이라는 틀린 답이 나옵니다.',
        ],
      ],
    },
    {
      id: 'pause-right',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. world 의 (3, 1) 에서 90° 돌아 있는 로봇에 y 방향 1 움직임을 오른쪽에 곱하면 새 원점은?'],
        [
          16.5,
          23.5,
          '오른쪽 곱이라 로봇 자신의 y 축인 (−1, 0) 쪽으로 1 갑니다. (−1, 0) + (3, 1) 이라 새 원점은 (2, 1) 입니다.',
          '오른쪽 곱이라 로봇 자신의 y 축인 (−1, 0) 쪽으로 1 갑니다. (−1, 0) 더하기 (3, 1) 이라 새 원점은 (2, 1) 입니다.',
        ],
      ],
    },
    {
      id: 'rpy',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '3D rotation 은 순서를 바꾸면 결과가 다릅니다. R_z(90°) R_x(90°) 에서 x 축은 (0, 1, 0) 으로 갑니다.'],
        [7, 14, 'rotation matrix 의 숫자 9 개 중 정할 수 있는 것은 3 개라서, 사람은 roll · pitch · yaw 세 각도로 적습니다.'],
        [14, 21, 'URDF 의 rpy 는 radian 셋이라 1.5708 이 90° 이고, 고정된 x, y, z 축 순서로 차례로 돌립니다.'],
        [21, 27.5, 'pitch 가 90° 면 (30°, 90°, 0°) 와 (0°, 90°, −30°) 가 같은 자세가 되는 gimbal lock 이 생깁니다.'],
      ],
    },
    {
      id: 'quaternion',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'axis-angle 은 축 하나와 각도 하나로 적습니다. R_z(90°) R_x(90°) 는 (1, 1, 1) 축으로 120° 입니다.'],
        [6.5, 13, 'quaternion 은 각도의 절반으로 네 칸을 채워서, z 축 90° 는 (0.707, 0, 0, 0.707) 입니다.'],
        [
          13,
          19.5,
          'q 와 −q 는 같은 rotation 입니다. 칸 순서는 ROS 가 x, y, z, w 이고 MuJoCo 는 w, x, y, z 입니다.',
          '큐 와 마이너스 큐 는 같은 rotation 입니다. 칸 순서는 ROS 가 x, y, z, w 이고 MuJoCo 는 w, x, y, z 입니다.',
        ],
        [19.5, 25.5, '두 rotation matrix 를 칸마다 평균하면 첫째 열의 길이가 약 0.707 로 줄어서, 이 행렬을 곱한 물체가 쪼그라듭니다.'],
        [25.5, 31.7, 'slerp 는 두 quaternion 사이 원호를 일정한 속도로 따라가서, t 가 0.25 늘 때마다 22.5° 씩 고르게 돕니다.'],
      ],
    },
    {
      id: 'pause-rpy',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. rpy (10°, 90°, 0°) 와 같은 행렬이 되는 rpy 를 roll 이 0° 인 꼴로 하나 적어 보세요.'],
        [16.5, 23.5, 'pitch 가 90° 이면 roll 로 돈 양과 yaw 로 반대로 돈 양이 같은 일을 해서, 답은 (0°, 90°, −10°) 입니다.'],
      ],
    },
    {
      id: 'wrist-camera',
      seconds: 28,
      section: S4,
      cues: [
        [
          0.3,
          7,
          'optical frame 은 y 축이 아래를 향해서, 위쪽 1 cm 인 컵은 p_c = (0.02, −0.01, 0.25) m 입니다.',
          'optical frame 은 y 축이 아래를 향해서, 위쪽 1 cm 인 컵은 p_c 가 (0.02, −0.01, 0.25) 미터입니다.',
        ],
        [
          7,
          14,
          '컵의 base 좌표는 p_b = T_be T_ec p_c 입니다. T_be 는 팔과 함께 바뀌고 T_ec 는 그대로입니다.',
          '컵의 base 좌표 p_b 는 T_be 곱하기 T_ec 곱하기 p_c 입니다. T_be 는 팔과 함께 바뀌고 T_ec 는 그대로입니다.',
        ],
        [14, 21, '카메라가 gripper 의 (0, 0.06, 0) 에 같은 방향으로 달려서, gripper 에서 컵은 (0.02, 0.05, 0.25) 입니다.'],
        [21, 27.5, 'gripper 가 (0.4, 0, 0.3) 에서 180° 돌아 아래를 보면, 컵은 base 의 (0.42, −0.05, 0.05) 입니다.'],
      ],
    },
    {
      id: 'odom',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7.5, 'tf2 는 translation 3 개와 quaternion 4 개로 변환을 저장하고, rotation 은 slerp 로 보간합니다.'],
        [7.5, 14.5, 'tf2 는 제곱합이 1 에서 0.01 이상 벗어난 quaternion 을 버려서, 0.707 을 0.7 로 적은 0.98 은 버려집니다.'],
        [
          14.5,
          22,
          '바퀴 odometry 는 오른쪽에 곱합니다. 1 m/s 로 가며 90°/s 로 돌면 반지름 약 0.637 m 인 원호를 그립니다.',
          '바퀴 odometry 는 오른쪽에 곱합니다. 초속 1 m 로 가며 초당 90° 로 돌면 반지름 약 0.637 m 인 원호를 그립니다.',
        ],
        [
          22,
          29.5,
          'odom 의 (2, 0) 인 로봇이 map 의 (5, 3), yaw 90° 이면, map → odom 은 (5, 1), 90° 입니다.',
          'odom 의 (2, 0) 인 로봇이 map 의 (5, 3), yaw 90° 이면, map 에서 odom 으로의 변환은 (5, 1), 90° 입니다.',
        ],
      ],
    },
    {
      id: 'pause-odom',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 로봇이 1 m 더 가서 odom 의 (3, 0) 이 됐고 map → odom 이 그대로면, map 에서는 어디일까요?',
          '멈추고 적어 보기. 로봇이 1 m 더 가서 odom 의 (3, 0) 이 됐고 map 에서 odom 으로의 변환이 그대로면, map 에서는 어디일까요?',
        ],
        [
          16.5,
          23.5,
          'map → odom 이 90° 회전과 (5, 1) 이동이라, R(90°) × (3, 0) + (5, 1) 로 (5, 4) 입니다.',
          'map 에서 odom 으로의 변환이 90° 회전과 (5, 1) 이동이라, R(90°) × (3, 0) 더하기 (5, 1) 로 (5, 4) 입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 좌표는 돌린 뒤 원점 위치를 더해 바꾸고, R_ab 의 열은 frame b 의 축을 frame a 에서 잰 값입니다.'],
        [
          4.2,
          8.2,
          '1 을 붙인 homogeneous transform 은 아래첨자가 맞닿게 곱하고, 역변환의 translation 칸은 −Rᵀp 입니다.',
          '1 을 붙인 homogeneous transform 은 아래첨자가 맞닿게 곱하고, 역변환의 translation 칸은 마이너스 Rᵀ 피 입니다.',
        ],
        [
          8.2,
          12.2,
          'rpy 는 pitch 90° 에서 gimbal lock 이 생기고, quaternion 은 q 와 −q 가 같아 짧은 호를 고릅니다.',
          'rpy 는 pitch 90° 에서 gimbal lock 이 생기고, quaternion 은 큐 와 마이너스 큐 가 같아 짧은 호를 고릅니다.',
        ],
        [
          12.2,
          15.7,
          '카메라가 잰 컵은 p_b = T_be T_ec p_c 로 몸통 좌표가 되고, tf2 는 frame tree 를 따라 이 곱을 계산합니다.',
          '카메라가 잰 컵은 T_be 곱하기 T_ec 곱하기 p_c 로 몸통 좌표가 되고, tf2 는 frame tree 를 따라 이 곱을 계산합니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '관절 각도가 gripper 의 pose T_be 를 어떻게 정하는지는 Forward Kinematics 에서 다룹니다.'],
        [3.6, 6.6, 'optical frame 의 3D 점이 사진의 어느 pixel 에 찍히는지는 Camera Geometry 에서 다룹니다.'],
      ],
    },
  ],
}
