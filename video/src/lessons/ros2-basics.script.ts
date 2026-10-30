import type { VideoScript } from '../script.ts'

// Numbers follow lessons/ros2-basics/README.md: rates (camera driver 30 Hz / 33 ms, policy 10 ~ 50 Hz / 20 ~ 100 ms, motor
// controller 500 ~ 1000 Hz / 1 ~ 2 ms; 1 ÷ 30 ≈ 0.033 s; one program: policy 40 ms → motor every 1 ms skips 40 times;
// 100 ms window: camera 3, policy (20 Hz) 2, motor (1000 Hz) 100); graph (/camera/image_raw Image 30 Hz, /cmd_vel Twist
// 20 Hz, /joint_states JointState 50 Hz); bandwidth (640 × 480 = 307,200, × 3 byte = 921,600 byte ≈ 0.92 MB, × 30 =
// 27,648,000 byte ≈ 27.6 MB/s, × 8 ≈ 221 Mbit/s; /cmd_vel 6 × 8 = 48 byte × 20 Hz = 960 byte, /joint_states 48 byte × 50 Hz
// = 2,400 byte, 960 + 2,400 = 3,360 byte, ≈ 8,000 배; 1,000 Mbit/s Ethernet 22%; 54 Mbit/s → 54,000,000 ÷ (921,600 × 8)
// ≈ 7.3 장); check (640 × 480 × 2 = 614,400 byte, × 30 = 18,432,000 byte, × 8 ≈ 147 Mbit/s); action (30 m at 0.5 m/s:
// 30 ÷ 0.5 = 60 초; service 3 개 + topic 2 개); check (LiDAR 10 Hz, 5 초); QoS profiles (기본 keep last 10 reliable
// volatile, sensor data keep last 5 best effort volatile); depth (30 Hz camera, 10 Hz policy, 100 ms, depth 10: 9 × 33 ≈
// 300 ms, 0.5 × 0.3 = 0.15 m; depth 1: 33 ms); timer (10 ms period, 25 ms callback: 10 → 35, 20 waits 15 → 35, 30
// skipped, 40 waits 20 → 60, 50 · 60 skipped; 100 Hz → 1000 ÷ 25 = 40); check (50 Hz: 1000 ÷ 50 = 20 ms, 30 ms →
// 1000 ÷ 30 ≈ 33); ros2_control (1000 Hz loop, priority default 50, Franka FR3 update_rate 1000 Hz priority 97,
// update_rate default 100 Hz; policy 20 Hz → 50 ms, 50 번); tf2 (odom (3.0, 1.0), map (3.4, 1.0) → map → odom (0.4, 0),
// later (0.5, 0.1); cup (1.0, 0) → + (0.2, 0) = (1.2, 0) → 90° → (0, 1.2) → + (3.0, 1.0) = (3.0, 2.2) → + (0.4, 0) =
// (3.4, 2.2); stamp 0.1 초, 0.5 rad/s → 0.5 × 0.1 = 0.05 rad ≈ 2.9°, 3 m → 3 × 0.05 = 0.15 m); check ((0.1, 0), (5.0, 0),
// (−0.2, 0.3), 2.0 m → (2.1, 0) → (7.1, 0) → (6.9, 0.3)).

const S1 = 'node 와 topic'
const S2 = '통신 방식과 QoS'
const S3 = 'timer 와 제어 loop'
const S4 = 'tf2 frame tree'

export const script: VideoScript = {
  id: 'ros2-basics',
  title: 'ROS 2 Basics',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/ros2-basics',
  sections: [S1, S2, S3, S4],
  terms: [
    ['/camera/image_raw', '카메라 이미지 로'],
    ['hardware interface', '하드웨어 인터페이스'],
    ['controller_manager', '컨트롤러 매니저'],
    ['motor controller', '모터 컨트롤러'],
    ['Rigid Transforms', '리지드 트랜스폼스'],
    ['NavigateToPose', '내비게이트 투 포즈'],
    ['ROS 2 Basics', '로스 투 베이직스'],
    ['/joint_states', '조인트 스테이츠'],
    ['Kalman Filter', '칼만 필터'],
    ['peer-to-peer', '피어 투 피어'],
    ['ros2_control', '로스 투 컨트롤'],
    ['camera_link', '카메라 링크'],
    ['best effort', '베스트 에포트'],
    ['update_rate', '업데이트 레이트'],
    ['middleware', '미들웨어'],
    ['subscriber', '서브스크라이버'],
    ['quaternion', '쿼터니언'],
    ['Franka FR3', '프랑카 에프알 쓰리'],
    ['subscribe', '서브스크라이브'],
    ['publisher', '퍼블리셔'],
    ['real-time', '리얼 타임'],
    ['base_link', '베이스 링크'],
    ['bandwidth', '밴드위스'],
    ['controller', '컨트롤러'],
    ['hardware', '하드웨어'],
    ['executor', '익스큐터'],
    ['feedback', '피드백'],
    ['response', '리스폰스'],
    ['callback', '콜백'],
    ['reliable', '릴라이어블'],
    ['/cmd_vel', '커맨드 벨'],
    ['Mbit/s', '메가비트 퍼 세컨드'],
    ['request', '리퀘스트'],
    ['service', '서비스'],
    ['process', '프로세스'],
    ['roscore', '로스코어'],
    ['plugin', '플러그인'],
    ['result', '리절트'],
    ['cancel', '캔슬'],
    ['thread', '스레드'],
    ['ROS 1', '로스 원'],
    ['ROS 2', '로스 투'],
    ['rad/s', '라디안 퍼 세컨드'],
    ['LiDAR', '라이다'],
    ['policy', '폴리시'],
    ['motor', '모터'],
    ['topic', '토픽'],
    ['timer', '타이머'],
    ['depth', '뎁스'],
    ['frame', '프레임'],
    ['stamp', '스탬프'],
    ['node', '노드'],
    ['goal', '골'],
    ['gain', '게인'],
    ['loop', '루프'],
    ['tree', '트리'],
    ['odom', '오돔'],
    ['byte', '바이트'],
    ['Nav2', '내브 투'],
    ['m/s', '미터 퍼 세컨드'],
    ['QoS', '큐오에스'],
    ['tf2', '티에프 투'],
    ['map', '맵'],
    ['rad', '라디안'],
    ['bit', '비트'],
    ['MB', '메가바이트'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'ROS 2 는 따로 실행되는 로봇 프로그램들이 정해진 이름과 형식으로 데이터를 주고받게 해 주는 middleware 입니다.'],
        [4.2, 7.8, 'node 와 topic, 통신 방식과 QoS, timer 와 제어 loop, tf2 의 frame tree 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [
          0.4,
          4.4,
          '1초에 카메라는 30 장을 찍고, policy 는 10 ~ 50 번, motor controller 는 500 ~ 1000 번 계산합니다.',
          '1초에 카메라는 30 장을 찍고, policy 는 10 에서 50 번, motor controller 는 500 에서 1000 번 계산합니다.',
        ],
        [4.4, 7.8, '주기가 다른 프로그램들이 데이터를 주고받으면서, 하나가 꺼져도 나머지가 멈추지 않으려면 무엇이 필요할까요?'],
      ],
    },
    {
      id: 'split',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.3, '프로그램 하나로 짜면 policy 가 사진 한 장을 보고 행동을 정하는 40 ms 동안 motor 제어도 멈춥니다.'],
        [6.3, 12.5, 'motor 명령은 1 ms 마다 고쳐야 하므로, 그사이 motor 계산을 40 번 건너뛰게 됩니다.'],
        [12.5, 18.5, '그래서 각자의 주기로 계산하는 node 여러 개로 나누는데, node 는 보통 process 하나에서 실행됩니다.'],
        [18.5, 24.5, 'policy 의 process 가 오류로 꺼져도 motor controller 는 남아서 마지막 목표 자세를 유지합니다.'],
        [24.5, 29.7, 'ROS 1 은 roscore 가 멈추면 전체가 영향을 받았고, ROS 2 는 서로를 직접 찾는 peer-to-peer 로 바꿨습니다.'],
      ],
    },
    {
      id: 'bandwidth',
      seconds: 32,
      section: S1,
      cues: [
        [0.3, 6.5, 'topic 은 /camera/image_raw 같은 이름이 붙은 통로로, publisher 가 보내고 subscriber 가 받습니다.'],
        [6.5, 13, '640 × 480 컬러 사진 한 장은 픽셀마다 3 byte 라서 921,600 byte, 약 0.92 MB 입니다.'],
        [13, 19.5, '30 Hz 로 보내면 1초에 27,648,000 byte 이고, 8 을 곱해 bit 로 바꾸면 약 221 Mbit/s 입니다.'],
        [19.5, 26, '/cmd_vel 은 1초에 960 byte, /joint_states 는 2,400 byte 로, 카메라는 그 합의 약 8,000 배입니다.'],
        [26, 31.7, '54 Mbit/s 무선 연결로는 1초에 약 7.3 장만 보낼 수 있어서, 사진은 로봇 안에서 처리하거나 압축해 보냅니다.'],
      ],
    },
    {
      id: 'pause-bw',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 픽셀마다 2 byte 인 640 × 480 depth 사진을 30 Hz 로 보내면 몇 Mbit/s 일까요?'],
        [16.5, 23.5, '한 장이 614,400 byte 이고 1초에 18,432,000 byte 라서, 8 을 곱하면 약 147 Mbit/s 입니다.'],
      ],
    },
    {
      id: 'patterns',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'topic 은 한쪽으로 흘려보내기만 하고, service 는 request 하나에 response 하나를 돌려받습니다.'],
        [7, 14, 'action 은 goal 을 받으면 feedback 을 여러 번 보내고 끝에 result 를 주며, 도중에 cancel 할 수 있습니다.'],
        [14, 21, 'Nav2 의 NavigateToPose 로 0.5 m/s 로 30 m 를 가면 30 ÷ 0.5 로 60 초가 걸립니다.'],
        [21, 27.7, 'service 였다면 60 초 동안 진행 상황을 모른 채 기다리고, 사람이 길을 막아도 멈추라고 할 수 없습니다.'],
      ],
    },
    {
      id: 'qos',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, 'QoS 의 reliable 은 도착할 때까지 다시 보내고, best effort 는 한 번 보내고 끝냅니다.'],
        [6.5, 13, 'QoS 는 양쪽이 따로 정하는데, subscriber 의 요청이 publisher 의 제시보다 높으면 연결되지 않습니다.'],
        [13, 19.5, 'best effort 카메라를 reliable 로 subscribe 하면, 오류는 없지만 callback 이 한 번도 불리지 않습니다.'],
        [19.5, 26, '30 Hz 사진을 10 Hz 로 처리하며 depth 가 10 이면, 꺼내는 사진은 9 × 33 으로 약 300 ms 전 것입니다.'],
        [26, 31.7, 'depth 가 1 이면 늘 33 ms 안의 사진을 보므로, 센서 topic 은 best effort 와 작은 depth 를 씁니다.'],
      ],
    },
    {
      id: 'pause-pattern',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. LiDAR 측정 10 Hz, 지도 저장 요청, 사람이 오면 멈춰야 하는 5 초 팔 이동에는 각각 무엇이 맞을까요?'],
        [16.5, 23.5, '흐르는 LiDAR 값은 topic, 금방 끝나는 지도 저장은 service, cancel 이 필요한 팔 이동은 action 입니다.'],
      ],
    },
    {
      id: 'timer',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'timer 는 callback 의 예정 시각만 정하고, 실제로 부르는 것은 executor 의 thread 입니다.'],
        [6.5, 12.5, '10 ms 간격인데 callback 이 25 ms 걸리면, 10 ms 예정분은 바로 실행되어 35 ms 까지 thread 를 씁니다.'],
        [12.5, 18.5, '20 ms 예정분은 15 ms 기다렸다 35 ms 에 실행되고, 그사이 지난 30 ms 예정 시각은 건너뜁니다.'],
        [18.5, 24.5, '실제 간격은 callback 이 걸리는 25 ms 라서, 1초에 100 번이 아니라 1000 ÷ 25 로 40 번만 계산합니다.'],
        [24.5, 29.7, 'gain 을 10 ms 에 맞춘 controller 는 간격이 바뀌면 I 항과 D 항이 달라지고, 발산할 수도 있습니다.'],
      ],
    },
    {
      id: 'control',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '기본 executor 는 real-time 응용에 맞지 않아서, 1000 Hz 제어 loop 는 보통 ros2_control 에 둡니다.'],
        [7, 14, 'controller_manager 는 주기마다 관절 상태를 읽고, controller 를 계산하고, 결과를 hardware 에 씁니다.'],
        [14, 21, 'controller 와 hardware interface 는 한 process 의 plugin 이라 값이 메모리에서 바로 오갑니다.'],
        [21, 27.7, 'Franka FR3 는 1000 Hz 에 우선순위 97 을 쓰고, policy 가 20 Hz 면 목표 하나 사이에 50 번 계산합니다.'],
      ],
    },
    {
      id: 'pause-timer',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 50 Hz timer 의 callback 이 한 번에 30 ms 걸린다면, 실제로는 1초에 몇 번 실행될까요?'],
        [16.5, 23.5, '간격은 1000 ÷ 50 으로 20 ms 지만 callback 이 30 ms 걸려서, 1000 ÷ 30 으로 약 33 번 실행됩니다.'],
      ],
    },
    {
      id: 'frames',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, '위치는 모두 어떤 frame 에서 잰 값이고, tf2 는 frame 사이의 관계를 시간과 함께 tree 로 기록합니다.'],
        [7, 14, 'map 은 오래 지나도 어긋나지 않지만 값이 갑자기 뛰고, odom 은 매끄럽지만 바퀴 미끄러짐이 쌓여 점점 어긋납니다.'],
        [14, 21, '그래서 장애물을 피하는 제어는 매끄러운 odom 을 쓰고, 주방으로 가라 같은 목표는 map 에서 정합니다.'],
        [
          21,
          27.7,
          'odom 에서 (3.0, 1.0) 인 로봇이 map 에서 (3.4, 1.0) 이면, map → odom 은 (0.4, 0) 이동입니다.',
          'odom 에서 3.0, 1.0 인 로봇이 map 에서 3.4, 1.0 이면, map 에서 odom 으로 가는 변환은 0.4, 0 이동입니다.',
        ],
      ],
    },
    {
      id: 'transform',
      seconds: 30,
      section: S4,
      cues: [
        [
          0.3,
          6.5,
          '1.0 m 앞의 컵은 camera_link 의 (1.0, 0) 이고, 카메라가 0.2 m 앞에 있어 base_link 의 (1.2, 0) 입니다.',
          '1.0 m 앞의 컵은 camera_link 의 1.0, 0 이고, 카메라가 0.2 m 앞에 있어 base_link 의 1.2, 0 입니다.',
        ],
        [
          6.5,
          13,
          '로봇이 왼쪽으로 90° 돌아 있어 (0, 1.2) 가 되고, (3.0, 1.0) 을 더하면 odom 의 (3.0, 2.2) 입니다.',
          '로봇이 왼쪽으로 90° 돌아 있어 0, 1.2 가 되고, 3.0, 1.0 을 더하면 odom 의 3.0, 2.2 입니다.',
        ],
        [
          13,
          19,
          'map → odom 의 (0.4, 0) 을 더하면 map 의 (3.4, 2.2) 입니다. tf2 는 tree 의 변을 이렇게 차례로 잇습니다.',
          'map 에서 odom 으로 가는 0.4, 0 을 더하면 map 의 3.4, 2.2 입니다. tf2 는 tree 의 변을 이렇게 차례로 잇습니다.',
        ],
        [19, 25, '사진의 stamp 가 0.1 초 전이고 로봇이 0.5 rad/s 로 돌면, 그사이 로봇은 0.05 rad, 약 2.9° 를 돌았습니다.'],
        [25, 29.7, '지금 변환을 쓰면 3 m 앞 컵이 3 × 0.05 로 약 0.15 m 어긋나므로, 사진을 찍은 시각의 변환을 물어야 합니다.'],
      ],
    },
    {
      id: 'pause-tf',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 회전 없이 (0.1, 0), (5.0, 0), (−0.2, 0.3) 을 거치면, 2.0 m 앞 물체는 map 의 어디일까요?',
          '멈추고 적어 보기. 회전 없이 0.1, 0 과 5.0, 0 과 −0.2, 0.3 을 거치면, 2.0 m 앞 물체는 map 의 어디일까요?',
        ],
        [
          16.5,
          23.5,
          '이동만 더하면 base_link 의 (2.1, 0), odom 의 (7.1, 0) 을 거쳐 map 의 (6.9, 0.3) 입니다.',
          '이동만 더하면 base_link 의 2.1, 0 과 odom 의 7.1, 0 을 거쳐 map 의 6.9, 0.3 입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 주기가 다른 일은 node 로 나눠 실행하고, 640 × 480 사진을 30 Hz 로 보내면 약 221 Mbit/s 입니다.'],
        [4.2, 8.2, '짧은 요청은 service, 긴 일은 action 에 맡기고, QoS 요청이 제시보다 높으면 오류 없이 데이터만 오지 않습니다.'],
        [8.2, 12.2, 'callback 이 간격보다 길면 예정 시각을 건너뛰어 주기가 늘므로, 1000 Hz loop 는 ros2_control 에 둡니다.'],
        [12.2, 15.7, 'tf2 는 map 부터 센서까지 frame tree 를 시간과 함께 기록해, 어떤 두 frame 사이든 좌표를 바꿉니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '3 차원 회전과 quaternion 은 Rigid Transforms 에서, 위치 추정은 Kalman Filter 에서 다룹니다.']],
    },
  ],
}
