import type { VideoScript } from '../script.ts'

// Numbers follow lessons/forward-kinematics/README.md: the question (30 cm 앞, 10 cm 왼쪽; SO-101 motor 여섯 개); the 2-link
// arm (L₁ = L₂ = 1, θ₁ = 30°, θ₂ = 60°, 30° + 60° = 90°, cos 30° = 0.866, elbow (0.866, 0.5), move (0, 1), tip (0.866, 1.5));
// the wrong reading ((0.866 + 0.5, 0.5 + 0.866) = (1.366, 1.366), off by 0.5 and 0.134; cos 30° + cos 60° = 1.366, cos 90° = 0);
// four configurations ((0°, 0°) → (2, 0), (90°, 0°) → (0, 2), (0°, 90°) → (1, 1), (90°, −90°) → (1, 1); elbows (1, 0) and
// (0, 1); hand 90° and 0°; reach L₁ + L₂ = 2; pose 3 numbers in a plane, 6 in 3D); check (60°, 30°) → (0.5, 0.866) and
// (0.5, 1.866); the transform chain (joints 6 ~ 7; R(30°) Tr(1) R(60°) Tr(1): (0, 0) 30°, (0.866, 0.5) 30°, (0.866, 0.5) 90°,
// (0.866, 1.5) 90°; Tr(1) R(30°) stays at (1, 0)); URDF (joint2: revolute, link1 → link2, origin xyz 1 0 0, rpy 0 0 0, axis
// 0 0 1; T origin · T motion(q); 180° = π ≈ 3.1416 rad, 90° = 1.5708 rad, 1° = 0.01745 rad; upper 1.57 → 1.57 × 180 ÷ 3.1416
// ≈ 90°); check origin xyz 0 0 2 → 2 m along z; SO-101 tree (link 8, joint 7 = revolute 6 + fixed 1, five revolute joints to
// gripper_link, zero-pose link origins in m: shoulder 0.039 0.000 0.062, upper_arm 0.069 −0.018 0.117, lower_arm 0.097 −0.018
// 0.229, wrist 0.232 −0.018 0.234, gripper 0.293 0.000 0.234, gripper_frame 0.391 0.000 0.226; shoulder_pan rpy 3.14159 0
// −3.14159, +90° → (0.039, −0.353, 0.226)); robot_state_publisher and tf2 (moving joints 6 → /tf, fixed 1 → /tf_static,
// publish_frequency 20 Hz, buffer 10 s, lookup multiplies revolute 5 + fixed 1); check base_link → wrist_link: 4 transforms,
// 0 from /tf_static; DH (6 vs 4 numbers, 1955; UR5e a −0.425 −0.3922, d 0.1625 0.1333 0.0997 0.0996, α π/2 0 0 π/2 −π/2 0;
// flange (−0.817, −0.233, 0.063) m, √(0.817² + 0.233²) ≈ 0.850 m, reach 850 mm); PoE (1984; (2, 0) about (1, 0) by 60° →
// (1.5, 0.866), about (0, 0) by 30° → (0.866, 1.5)); error (r × Δθ; length 2, 20° vs 25°, 5° = 5 × 0.01745 ≈ 0.0873 rad,
// 2 × 0.0873 ≈ 0.175; SO-101 1°: 6.15 / 5.94 / 5.13 / 2.78 / 0.14 mm, 0.353 × 0.01745 ≈ 0.00615 m; UR5e 0.850 × 0.01745 ≈
// 0.0148 m ≈ 15 mm; repeatability ±0.03 mm, cm-level without calibration); check 0.5 m, 2° = 2 × 0.01745 = 0.0349 rad,
// 0.5 × 0.0349 ≈ 0.0175 m ≈ 17 mm; outro (컵 위 5 cm).

const S1 = '2 관절 팔과 상대 각도'
const S2 = 'transform 곱과 URDF'
const S3 = 'SO-101 tree 와 tf2'
const S4 = 'DH · PoE · 오차'

export const script: VideoScript = {
  id: 'forward-kinematics',
  title: 'Forward Kinematics',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/forward-kinematics',
  sections: [S1, S2, S3, S4],
  terms: [
    ['moving_jaw_so101_v1_link', '무빙 조 링크'],
    ['robot_state_publisher', '로봇 스테이트 퍼블리셔'],
    ['gripper_frame_link', '그리퍼 프레임 링크'],
    ['Hand-Eye Calibration', '핸드 아이 캘리브레이션'],
    ['Inverse Kinematics', '인버스 키네마틱스'],
    ['Forward Kinematics', '포워드 키네마틱스'],
    ['zero configuration', '제로 컨피규레이션'],
    ['kinematic tree', '키네마틱 트리'],
    ['end-effector', '엔드 이펙터'],
    ['shoulder_pan', '숄더 팬'],
    ['shoulder_lift', '숄더 리프트'],
    ['elbow_flex', '엘보 플렉스'],
    ['wrist_flex', '리스트 플렉스'],
    ['wrist_roll', '리스트 롤'],
    ['gripper_link', '그리퍼 링크'],
    ['wrist_link', '리스트 링크'],
    ['base_link', '베이스 링크'],
    ['/joint_states', '조인트 스테이츠'],
    ['/tf_static', '티에프 스태틱'],
    ['/tf', '티에프'],
    ['lookupTransform', '룩업 트랜스폼'],
    ['repeatability', '리피터빌리티'],
    ['calibration', '캘리브레이션'],
    ['joint angle', '조인트 앵글'],
    ['transform', '트랜스폼'],
    ['Isaac Sim', '아이작 심'],
    ['backlash', '백래시'],
    ['revolute', '리볼루트'],
    ['encoder', '인코더'],
    ['flange', '플랜지'],
    ['Gazebo', '가제보'],
    ['MoveIt', '무브잇'],
    ['Franka', '프랑카'],
    ['parent', '페어런트'],
    ['origin', '오리진'],
    ['motion', '모션'],
    ['radian', '라디안'],
    ['buffer', '버퍼'],
    ['SO-101', '에스오 백일'],
    ['ROS 2', '로스 투'],
    ['Craig', '크레이그'],
    ['child', '차일드'],
    ['frame', '프레임'],
    ['fixed', '픽스드'],
    ['reach', '리치'],
    ['upper', '어퍼'],
    ['joint', '조인트'],
    ['motor', '모터'],
    ['UR5e', '유알 파이브 이'],
    ['URDF', '유알디에프'],
    ['axis', '액시스'],
    ['link', '링크'],
    ['base', '베이스'],
    ['tree', '트리'],
    ['pose', '포즈'],
    ['tf2', '티에프 투'],
    ['XML', '엑스엠엘'],
    ['PoE', '피오이'],
    ['ROS', '로스'],
    ['root', '루트'],
    ['rad', '라디안'],
    ['cos', '코사인'],
    ['FK', '에프케이'],
    ['IK', '아이케이'],
    ['DH', '디에이치'],
    ['UR', '유알'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Forward Kinematics 는 joint angle 과 URDF 로 base 에서 본 손끝의 pose 를 구하는 계산입니다.'],
        [
          4.2,
          7.8,
          '2 관절 팔의 상대 각도, transform 의 곱과 URDF, tree 와 tf2, DH 와 PoE, 실물과의 오차를 봅니다.',
          '두 관절 팔의 상대 각도, transform 의 곱과 URDF, tree 와 tf2, DH 와 PoE, 실물과의 오차를 봅니다.',
        ],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '카메라는 컵이 base 앞으로 30 cm 에 있다고 알려 주지만, SO-101 의 motor 는 몇 도 돌았는지만 읽습니다.'],
        [4.4, 7.8, '각도밖에 모르는 팔은 지금 집게 끝이 컵에서 몇 cm 떨어져 있는지 어떻게 알 수 있을까요?'],
      ],
    },
    {
      id: 'two-link',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'link 는 휘지 않는 막대이고 joint 는 두 link 를 잇는 마디이며, 팔 끝의 집게는 end-effector 입니다.'],
        [6.5, 13, 'joint 2 의 motor 는 link 1 끝에 실려 함께 움직이므로, 그 encoder 는 link 1 에서 꺾인 각도만 잽니다.'],
        [
          13,
          19.5,
          '이런 상대 각도는 joint 를 지날 때마다 쌓여서, link 2 는 바닥에서 보아 30° + 60° 인 90° 를 가리킵니다.',
          '이런 상대 각도는 joint 를 지날 때마다 쌓여서, link 2 는 바닥에서 보아 30° 더하기 60° 인 90° 를 가리킵니다.',
        ],
        [19.5, 25.7, '길이 1 인 link 로 팔꿈치는 (0.866, 0.5) 에 오고, 위로 1 만큼 더 가서 손끝은 (0.866, 1.5) 입니다.'],
      ],
    },
    {
      id: 'configs',
      seconds: 28,
      section: S1,
      cues: [
        [
          0.3,
          7,
          'θ2 를 바닥 기준으로 잘못 읽으면 손끝은 (1.366, 1.366) 이 되어, 가로로 0.5, 세로로 0.134 어긋납니다.',
          '세타 투 를 바닥 기준으로 잘못 읽으면 손끝은 (1.366, 1.366) 이 되어, 가로로 0.5, 세로로 0.134 어긋납니다.',
        ],
        [7, 14, '거꾸로 (0°, 90°) 와 (90°, −90°) 는 팔꿈치가 다른 두 자세인데, 손끝은 둘 다 (1, 1) 에 옵니다.'],
        [14, 21, '그래서 FK 는 답이 늘 하나지만 IK 는 답이 여럿일 수 있고, 이 팔은 원점에서 2 보다 먼 곳에 닿지 않습니다.'],
        [21, 27.7, '두 자세의 집게는 90° 와 0° 를 향합니다. 위치와 방향을 함께 이르는 pose 는 평면에서 숫자 3 개입니다.'],
      ],
    },
    {
      id: 'pause-arm',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. link 길이가 둘 다 1 이고 joint angle 이 60° 와 30° 이면 손끝은 어디일까요?'],
        [
          16.5,
          23.5,
          '팔꿈치는 (0.5, 0.866) 이고 link 2 는 60° + 30° 인 90° 를 향하므로, 손끝은 (0.5, 1.866) 입니다.',
          '팔꿈치는 (0.5, 0.866) 이고 link 2 는 60° 더하기 30° 인 90° 를 향하므로, 손끝은 (0.5, 1.866) 입니다.',
        ],
      ],
    },
    {
      id: 'chain',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          6.5,
          '실제 팔은 joint 가 6 ~ 7 개라서, joint 하나를 transform 하나로 적어 base 쪽부터 차례로 곱합니다.',
          '실제 팔은 joint 가 여섯에서 일곱 개라서, joint 하나를 transform 하나로 적어 base 쪽부터 차례로 곱합니다.',
        ],
        [
          6.5,
          13,
          'R(θ) 는 원점을 둔 채 축을 θ 만큼 돌리고, Tr(L) 은 지금의 x 축 방향으로 L 만큼 옮기는 transform 입니다.',
          '알 세타 는 원점을 둔 채 축을 세타 만큼 돌리고, 티알 엘 은 지금의 엑스 축 방향으로 엘 만큼 옮기는 transform 입니다.',
        ],
        [
          13,
          19.5,
          'R(30°) 와 Tr(1) 을 적용하면 팔꿈치 (0.866, 0.5) 에 닿고, R(60°) 를 적용하면 축이 90° 를 향합니다.',
          '알 삼십 도 와 티알 일 을 적용하면 팔꿈치 (0.866, 0.5) 에 닿고, 알 육십 도 를 적용하면 축이 90° 를 향합니다.',
        ],
        [
          19.5,
          25.5,
          '마지막 Tr(1) 로 손끝 (0.866, 1.5) 에 닿고, 그 frame 의 x 축이 집게 방향이라 pose 가 한꺼번에 나옵니다.',
          '마지막 티알 일 로 손끝 (0.866, 1.5) 에 닿고, 그 frame 의 x 축이 집게 방향이라 pose 가 한꺼번에 나옵니다.',
        ],
        [
          25.5,
          29.7,
          '곱하는 순서는 바꿀 수 없습니다. Tr(1) 을 먼저 하고 R(30°) 를 하면 원점은 (1, 0) 에 머뭅니다.',
          '곱하는 순서는 바꿀 수 없습니다. 티알 일 을 먼저 하고 알 삼십 도 를 하면 원점은 (1, 0) 에 머뭅니다.',
        ],
      ],
    },
    {
      id: 'urdf',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'URDF 는 joint 마다 parent 와 child, 자리를 옮기는 origin, 회전축 axis 를 적어 두는 XML 파일입니다.'],
        [6.5, 13, 'joint 하나는 늘 고정된 T origin 에 axis 를 중심으로 q 만큼 움직이는 T motion 을 곱한 꼴로 계산합니다.'],
        [13, 19.5, 'URDF 는 각도를 radian 으로 적어서, upper 1.57 은 1.57 × 180 ÷ 3.1416 으로 약 90° 입니다.'],
        [19.5, 25.7, 'URDF 에는 지금의 joint angle 이 없어서, FK 는 URDF 와 encoder 로 읽은 값을 합쳐야 계산할 수 있습니다.'],
      ],
    },
    {
      id: 'pause-urdf',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 어떤 joint 의 origin 이 xyz 0 0 2, rpy 0 0 0 이면 무슨 뜻이고, 움직이는 동안 바뀔까요?', '멈추고 적어 보기. 어떤 joint 의 origin 이 엑스와이지 영 영 이, 알피와이 영 영 영 이면 무슨 뜻이고, 움직이는 동안 바뀔까요?'],
        [16.5, 23.5, 'parent link frame 에서 z 방향으로 2 m 옮긴 자리에 joint 가 있다는 뜻이고, 바뀌는 것은 q 뿐입니다.'],
      ],
    },
    {
      id: 'tree',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'link 를 joint 로 이은 구조가 kinematic tree 이고, link 마다 root 에서 오는 길의 joint 만 곱합니다.'],
        [6.5, 13, 'SO-101 의 URDF 에는 link 8 개와 joint 7 개가 있고, tree 는 gripper_link 에서 두 갈래로 나뉩니다.'],
        [13, 19.5, '모든 joint angle 이 0 이면 집게 끝점은 base 에서 앞으로 0.391 m, 높이 0.226 m 에 있습니다.'],
        [
          19.5,
          25.7,
          'shoulder_pan 은 rpy 로 축이 아래를 향해, +90° 돌리면 끝점이 (0.039, −0.353, 0.226) 으로 갑니다.',
          'shoulder_pan 은 알피와이 로 축이 아래를 향해, 90° 돌리면 끝점이 (0.039, −0.353, 0.226) 으로 갑니다.',
        ],
      ],
    },
    {
      id: 'rsp',
      seconds: 27,
      section: S3,
      cues: [
        [0.3, 7, 'robot_state_publisher 는 /joint_states 가 올 때마다 joint 하나하나의 transform 을 계산합니다.'],
        [7, 13.5, '움직이는 joint 6 개는 /tf 에 기본 20 Hz 까지 보내고, fixed joint 1 개는 시작할 때 /tf_static 에 보냅니다.'],
        [13.5, 20, 'base 에서 손끝까지 곱하는 일은 tf2 가 맡아서, lookupTransform 을 부르면 tree 에서 길을 찾아 곱합니다.'],
        [20, 26.7, 'tf2 buffer 는 최근 10 초를 남겨 두어, 사진을 찍은 시각으로 물으면 그 순간의 집게 pose 를 보간해 줍니다.'],
      ],
    },
    {
      id: 'pause-tf',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. SO-101 에서 base_link 부터 wrist_link 까지 tf2 는 transform 을 몇 개 곱할까요?'],
        [16.5, 23.5, 'shoulder_pan 부터 wrist_flex 까지 4 개이고, 모두 revolute 라 /tf_static 에서 온 것은 0 개입니다.'],
      ],
    },
    {
      id: 'dh-poe',
      seconds: 31,
      section: S4,
      cues: [
        [0.3, 6.5, 'URDF 는 origin 을 숫자 6 개로 적지만, 1955 년 DH 는 frame 자리를 규칙으로 정해 joint 마다 4 개로 적습니다.'],
        [6.5, 12.5, 'UR5e 의 DH 표로 모든 각도 0 을 계산하면 flange 는 수직축에서 약 0.850 m 떨어져 reach 850 mm 와 맞습니다.'],
        [12.5, 18.5, 'UR 의 원래 규약과 Franka 의 Craig 규약은 식이 달라서, 한 규약의 표를 다른 식에 넣으면 다른 팔이 나옵니다.'],
        [18.5, 24.5, '1984 년 PoE 는 link 마다 frame 을 붙이지 않고 zero configuration 의 joint 축 자리만 적습니다.'],
        [24.5, 30.7, '손끝 (2, 0) 을 (1, 0) 중심으로 60° 돌린 뒤 (0, 0) 중심으로 30° 돌리면 (0.866, 1.5) 가 나옵니다.'],
      ],
    },
    {
      id: 'error',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '실물 손끝은 encoder 0 점의 차이, 제작 공차, 기어의 backlash, link 의 휘어짐 때문에 계산한 자리와 다릅니다.'],
        [
          6.5,
          12.5,
          'joint 에서 손끝까지 거리가 r 이면, 작은 각도 오차 Δθ rad 는 손끝을 약 r × Δθ 만큼 옮깁니다.',
          'joint 에서 손끝까지 거리가 알 이면, 작은 각도 오차 델타 세타 라디안은 손끝을 약 알 곱하기 델타 세타 만큼 옮깁니다.',
        ],
        [12.5, 19, '길이 2 로 편 팔이 5° 어긋나면 5° 는 약 0.0873 rad 이라서, 손끝은 약 2 × 0.0873 으로 0.175 만큼 갑니다.'],
        [19, 25.5, '1° 오차로 SO-101 의 끝점은 shoulder_pan 이면 6.15 mm, wrist_roll 이면 0.14 mm 옮겨 갑니다.'],
        [
          25.5,
          31.7,
          'UR5e 는 repeatability 가 ±0.03 mm 여도, calibration 을 반영하지 않으면 cm 단위로 어긋날 수 있습니다.',
        ],
      ],
    },
    {
      id: 'pause-error',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 손끝이 base joint 축에서 0.5 m 떨어진 팔에서 각도가 2° 틀리면 몇 mm 어긋날까요?'],
        [16.5, 23.5, '2° 는 2 × 0.01745 로 0.0349 rad 이고, 0.5 × 0.0349 로 약 0.0175 m, 약 17 mm 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 각도는 앞 link 기준으로 쌓여, 30° 와 60° 인 팔의 손끝은 (0.866, 1.5) 이고 집게는 90° 를 향합니다.'],
        [4.2, 8.2, 'joint 마다 origin 의 고정 transform 에 q 만큼 움직이는 transform 을 곱해, base 부터 차례로 곱합니다.'],
        [8.2, 12.2, 'ROS 2 에서는 robot_state_publisher 가 joint 마다 transform 을 보내고 tf2 가 그 곱을 맡습니다.'],
        [12.2, 15.7, 'DH 와 PoE 는 같은 FK 를 다르게 적고, SO-101 의 base joint 가 1° 틀리면 집게 끝은 약 6 mm 어긋납니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '집게 끝을 컵 위 5 cm 에 두는 joint angle 을 구하는 반대 계산은 Inverse Kinematics 에서 다룹니다.'],
        [3.6, 6.6, 'FK 로 구한 집게 pose 에 곱할 손목 카메라의 transform 은 Hand-Eye Calibration 에서 구합니다.'],
      ],
    },
  ],
}
