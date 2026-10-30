import type { VideoScript } from '../script.ts'

// Numbers follow lessons/visual-slam/README.md and its figures: ORB-SLAM3 EuRoC stereo + IMU 평균 3.5 cm (RMS ATE 0.035 m);
// FAST 16 pixel 원, 문턱 t = 20 → 7 (밝기 0 ~ 255), 11 개 이어짐 (figure); BRIEF 256 번 비교 → 256 bit (32 byte); pyramid 1.2 배
// 8 장, 1.2⁷ ≈ 3.6 배, 3 배 넘게; 한 장에 corner 1000 개, 칸마다 5 개 이상; ORB 는 SIFT 보다 100 배쯤 빠름; descriptor 앞 16 bit
// 중 2 bit / 9 bit 차이 (figure); Hamming 50 bit 이하 (일부 100 bit); ratio 0.6, 점 A 20 / 60 → 0.6 × 60 = 36, 점 B 40 / 45 →
// 0.6 × 45 = 27; 확인 문제 30 / 40 → 0.6 × 40 = 24, 10 bit 차이; Z = f × b ÷ d, f = 500, b = 0.1 m, 2 m: d = 25, 1.92 ~ 2.08 m,
// 약 ±4 %; 10 m: d = 5, 8.33 ~ 12.5 m, −17 ~ +25 %; VINS-Mono 30 개 넘는 feature, parallax 20 pixel; 확인 문제 0.2 m, 5 m →
// d = 500 × 0.2 ÷ 5 = 20, f × b = 100, 100 ÷ 21 = 4.76, 100 ÷ 19 = 5.26 m; reprojection (370, 215) vs (372, 214), √(2² + 1²) ≈
// 2.24 pixel; NewCollege 20 fps → 50 ms, tracking 30.57 ms, local BA 296.08 ms, 296 ÷ 50 ≈ 5.9; keyframe: map point 50 개 이상,
// 90 % 보다 적게; inlier 30 개 미만이면 실패; scale: 0.5 m · (0.2, 0, 2) vs 1.0 m · (0.4, 0, 4), u = 370 / 245; depth 중앙값 1;
// 7 자유도 (3 + 3 + 1), Sim(3); VIO: ½ × 1 × 1² = 0.5 m, 2.0 단위 → 0.5 ÷ 2.0 = 0.25 m; 2 초 5 %, 15 초 1 %; 20 Hz / 200 Hz → 10
// 개, 50 ms / 5 ms; map point 15 개 미만 → 5 초 IMU; bias 0.01 m/s² → 60 초 18 m, 5 초 ½ × 0.01 × 5² = 0.125 m; 4-DoF; 확인 문제
// ½ × 0.5 × 2² = 1 m, 4 단위 → 1 ÷ 4 = 0.25 m; ORB-SLAM tracking 약 30 ms, local mapping 약 300 ms (figure); KLT 100 ~ 300 개;
// EuRoC monocular + IMU RMS ATE 0.043 m vs 0.110 m, 0.110 ÷ 0.043 ≈ 2.6; blur f × ω × t_e, f_x = 458.654, 10 ms: 30°/s 0.52 rad/s
// ≈ 2.4, 90°/s 1.57 rad/s ≈ 7.2, 180°/s 3.14 rad/s ≈ 14.4 pixel; FAST 원 지름 약 7 pixel; 어둠 40 × 0.3 = 12, 문턱 20 / 7;
// TUM-VI 10 ~ 70 m; V203 monocular 실패, stereo 0.521 m, monocular + IMU 0.027 m, stereo + IMU 0.024 m; 확인 문제 60°/s, 20 ms,
// f = 500, 60 × π ÷ 180 ≈ 1.05 rad, 500 × 1.05 × 0.02 ≈ 10.5 pixel.

const S1 = 'feature 와 짝짓기'
const S2 = 'triangulation 과 BA'
const S3 = 'scale 과 VIO'
const S4 = 'ORB-SLAM3 와 실패'

export const script: VideoScript = {
  id: 'visual-slam',
  title: 'Visual SLAM & VIO',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/visual-slam',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Visual SLAM & VIO', '비주얼 슬램 앤 브이아이오'],
    ['reprojection error', '리프로젝션 에러'],
    ['bundle adjustment', '번들 어저스트먼트'],
    ['Hamming distance', '해밍 디스턴스'],
    ['KLT optical flow', '케이엘티 옵티컬 플로'],
    ['feature point', '피처 포인트'],
    ['triangulation', '트라이앵귤레이션'],
    ['loop closing', '루프 클로징'],
    ['loop closure', '루프 클로저'],
    ['local mapping', '로컬 매핑'],
    ['Path Planning', '패스 플래닝'],
    ['motion blur', '모션 블러'],
    ['Visual SLAM', '비주얼 슬램'],
    ['scale drift', '스케일 드리프트'],
    ['ratio test', '레이쇼 테스트'],
    ['Shi-Tomasi', '시 토마시'],
    ['descriptor', '디스크립터'],
    ['map point', '맵 포인트'],
    ['ORB-SLAM3', '오알비 슬램 쓰리'],
    ['ORB-SLAM', '오알비 슬램'],
    ['VINS-Mono', '빈스 모노'],
    ['monocular', '모노큘러'],
    ['disparity', '디스패리티'],
    ['keyframe', '키프레임'],
    ['parallax', '패럴랙스'],
    ['tracking', '트래킹'],
    ['local BA', '로컬 비에이'],
    ['RMS ATE', '알엠에스 에이티이'],
    ['costmap', '코스트맵'],
    ['feature', '피처'],
    ['RANSAC', '랜색'],
    ['stereo', '스테레오'],
    ['thread', '스레드'],
    ['corner', '코너'],
    ['inlier', '인라이어'],
    ['EuRoC', '유로크'],
    ['BRIEF', '브리프'],
    ['DBoW2', '디보우 투'],
    ['scale', '스케일'],
    ['depth', '뎁스'],
    ['pixel', '픽셀'],
    ['bias', '바이어스'],
    ['drift', '드리프트'],
    ['ratio', '레이쇼'],
    ['FAST', '패스트'],
    ['V203', '브이 이공삼'],
    ['loop', '루프'],
    ['pose', '포즈'],
    ['SLAM', '슬램'],
    ['blur', '블러'],
    ['ORB', '오알비'],
    ['IMU', '아이엠유'],
    ['VIO', '브이아이오'],
    ['XOR', '엑스오어'],
    ['fps', '에프피에스'],
    ['bit', '비트'],
    ['rad', '라디안'],
    ['yaw', '요'],
    ['BA', '비에이'],
    ['AR', '에이알'],
    ['3D', '쓰리디'],
    ['cm', '센티미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Visual SLAM 은 카메라 사진만으로 자기 위치와 3D 지도를 함께 만들고, VIO 는 여기에 IMU 를 더합니다.'],
        [4.2, 7.8, 'feature 짝짓기, triangulation 과 bundle adjustment, scale 과 VIO, 실패 상황을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '사진 한 장에는 방향만 있고 거리가 없는데, AR 앱의 가상 의자는 방을 한 바퀴 돌아도 제자리에 있습니다.'],
        [
          4.4,
          7.8,
          '카메라를 가진 휴대폰은 자기가 몇 m 움직였고 바닥이 어디 있는지를 어떻게 알아낼까요?',
          '카메라를 가진 휴대폰은 자기가 몇 미터 움직였고 바닥이 어디 있는지를 어떻게 알아낼까요?',
        ],
      ],
    },
    {
      id: 'orb',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, '흰 벽의 pixel 은 옆 pixel 과 똑같아서, 두 방향으로 밝기가 바뀌는 corner 만 feature point 로 씁니다.'],
        [6.5, 12.5, 'FAST 는 둘레 원 위 16 개 pixel 가운데 연속한 여러 개가 문턱 이상 밝거나 어두우면 corner 로 봅니다.'],
        [12.5, 18.5, 'ORB-SLAM3 의 EuRoC 설정은 문턱 20 으로 먼저 찾고, corner 가 모자란 칸에서만 7 로 낮춰 다시 찾습니다.'],
        [18.5, 24.5, 'BRIEF 는 정해 둔 pixel 짝의 밝기를 256 번 비교해서, corner 하나를 256 bit descriptor 로 요약합니다.'],
        [
          24.5,
          29.7,
          '1.2 배씩 줄인 사진 8 장에서 찾으므로 크기 차이가 1.2⁷ ≈ 3.6 배라서, 3 배 넘게 멀어진 점도 찾습니다.',
          '1.2 배씩 줄인 사진 8 장에서 찾으므로 크기 차이가 1.2 의 7 제곱, 약 3.6 배라서, 3 배 넘게 멀어진 점도 찾습니다.',
        ],
      ],
    },
    {
      id: 'matching',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, '두 descriptor 의 차이는 값이 다른 bit 의 수인 Hamming distance 로 재고, XOR 뒤에 1 을 세면 됩니다.'],
        [7, 13.5, 'ORB-SLAM3 는 256 bit 중 50 bit 이하로 다를 때만 짝 후보로 받고, 반복 무늬는 ratio test 로 거릅니다.'],
        [13.5, 20.5, 'ratio 0.6 에서 점 A 는 20 bit 가 0.6 × 60 인 36 보다 작아 받고, 점 B 는 40 이 27 보다 커서 버립니다.'],
        [20.5, 27.5, '남은 틀린 짝은 RANSAC 으로 거릅니다. 짝 몇 개로 움직임을 구하고, 맞는 짝이 가장 많은 경우를 고릅니다.'],
      ],
    },
    {
      id: 'pause-ratio',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 가장 가까운 후보가 30 bit, 두 번째가 40 bit 입니다. ratio 0.6 이면 이 짝을 받을까요?'],
        [16.5, 23.5, '문턱은 0.6 × 40 인 24 bit 이고, 30 bit 가 24 보다 커서 받지 않습니다. 두 후보가 10 bit 만 차이 납니다.'],
      ],
    },
    {
      id: 'triangulation',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, '두 keyframe 에서 본 직선이 만나는 곳이 점의 3D 위치이고, 이 계산을 triangulation 이라고 합니다.'],
        [
          6.5,
          12.5,
          '옆으로 움직였다면 Z = f × b ÷ d 입니다. b 는 카메라가 움직인 거리이고, d 는 밀려 찍힌 pixel 수입니다.',
          '옆으로 움직였다면 깊이는 f 곱하기 b 나누기 d 입니다. b 는 카메라가 움직인 거리이고, d 는 밀려 찍힌 pixel 수입니다.',
        ],
        [12.5, 19, 'f 500, b 0.1 m 에서 2 m 앞의 점은 d 가 25 라서, 1 pixel 틀려도 depth 오차는 약 ±4 % 입니다.'],
        [
          19,
          25,
          '10 m 앞의 점은 d 가 5 라서 같은 1 pixel 에 −17 ~ +25 % 로 흔들립니다. 먼 점일수록 parallax 가 작습니다.',
          '10 m 앞의 점은 d 가 5 라서 같은 1 pixel 에 마이너스 17 에서 플러스 25 퍼센트로 흔들립니다. 먼 점일수록 parallax 가 작습니다.',
        ],
        [25, 29.7, '그래서 VINS-Mono 는 30 개 넘는 feature 가 이어지고 parallax 가 20 pixel 을 넘을 때까지 기다립니다.'],
      ],
    },
    {
      id: 'ba',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, 'tracking 은 map point 를 투영한 자리가 짝지은 pixel 에 가장 가까워지는 pose 를 사진마다 구합니다.'],
        [
          6.5,
          13,
          '투영한 (372, 214) 와 찍힌 (370, 215) 사이의 거리 약 2.24 pixel 이 reprojection error 입니다.',
          '투영한 자리 372, 214 와 찍힌 자리 370, 215 사이의 거리 약 2.24 pixel 이 reprojection error 입니다.',
        ],
        [13, 19.5, 'bundle adjustment 는 keyframe pose 와 map point 를 함께 움직여 이 오차의 합을 줄입니다.'],
        [19.5, 25.5, '20 fps 카메라는 50 ms 마다 사진이 오는데, tracking 은 30.57 ms, local BA 는 296.08 ms 걸립니다.'],
        [
          25.5,
          31.7,
          'local BA 는 296 ÷ 50 으로 사진 약 5.9 장이 지나는 동안 계산하므로, 장면이 바뀐 keyframe 에만 합니다.',
        ],
      ],
    },
    {
      id: 'pause-disparity',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. f 500 인 카메라가 옆으로 0.2 m 움직이며 5 m 앞의 점을 봤습니다. d 와 depth 범위는?'],
        [
          16.5,
          23.5,
          'd 는 500 × 0.2 ÷ 5 로 20 pixel 이고, d 가 21 ~ 19 면 100 ÷ d 로 4.76 ~ 5.26 m 입니다.',
          'd 는 500 × 0.2 ÷ 5 로 20 pixel 이고, d 가 21 에서 19 면 100 ÷ d 로 4.76 에서 5.26 m 입니다.',
        ],
      ],
    },
    {
      id: 'scale',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '카메라 한 대로는 0.5 m 움직이며 2 m 앞을 본 경우와 1.0 m 움직이며 4 m 앞을 본 경우가 똑같이 찍힙니다.'],
        [7, 13.5, '두 경우 모두 점이 첫 사진의 pixel 370, 두 번째 사진의 245 에 찍혀서 사진만으로는 가릴 수 없습니다.'],
        [13.5, 20, '그래서 monocular SLAM 은 길이 하나를 1 로 정하고, ORB-SLAM3 는 처음 지도의 depth 중앙값을 1 로 둡니다.'],
        [20, 27.5, '오래 움직이면 단위가 바뀌는 scale drift 도 생겨서, ORB-SLAM 은 loop 를 닫을 때 7 자유도로 고칩니다.'],
      ],
    },
    {
      id: 'vio',
      seconds: 30,
      section: S3,
      cues: [
        [
          0.3,
          6.5,
          'IMU 의 가속도는 m/s² 라는 실제 단위로 나와서, 카메라가 모르는 scale 을 IMU 로 정할 수 있습니다.',
          'IMU 의 가속도는 미터 퍼 초 제곱이라는 실제 단위로 나와서, 카메라가 모르는 scale 을 IMU 로 정할 수 있습니다.',
        ],
        [
          6.5,
          13,
          '1 m/s² 로 1 초 가속하면 0.5 m 이고, 같은 동안 지도에서 2.0 단위라면 1 단위는 0.25 m 입니다.',
          '1 미터 퍼 초 제곱으로 1 초 가속하면 0.5 m 이고, 같은 동안 지도에서 2.0 단위라면 1 단위는 0.25 m 입니다.',
        ],
        [13, 19, 'ORB-SLAM3 는 2 초 만에 scale 오차 5 %, 15 초 뒤 1 % 를 보고했고, 가속이 없으면 scale 을 정할 수 없습니다.'],
        [19, 25, 'EuRoC 드론은 카메라가 20 Hz, IMU 가 200 Hz 라서 사진 두 장 사이에 IMU 측정이 10 개 들어옵니다.'],
        [
          25,
          29.7,
          'bias 0.01 m/s² 는 5 초에 0.125 m 오차라서 위치를 다시 찾을 때까지 pose 를 잇기에는 충분합니다.',
          'bias 0.01 미터 퍼 초 제곱은 5 초에 0.125 m 오차라서 위치를 다시 찾을 때까지 pose 를 잇기에는 충분합니다.',
        ],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 멈춘 카메라가 2 초 동안 0.5 m/s² 로 가속했고 지도에서는 4 단위였다면 1 단위는 몇 m 일까요?',
          '멈추고 적어 보기. 멈춘 카메라가 2 초 동안 0.5 미터 퍼 초 제곱으로 가속했고 지도에서는 4 단위였다면 1 단위는 몇 미터일까요?',
        ],
        [
          16.5,
          23.5,
          'IMU 로 구한 거리는 ½ × 0.5 × 2² 로 1 m 이고, 지도에서 4 단위이므로 1 단위는 1 ÷ 4 로 0.25 m 입니다.',
          'IMU 로 구한 거리는 이 분의 일 × 0.5 × 2 제곱으로 1 m 이고, 지도에서 4 단위이므로 1 단위는 1 ÷ 4 로 0.25 m 입니다.',
        ],
      ],
    },
    {
      id: 'systems',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'ORB-SLAM 은 tracking, local mapping, loop closing 을 thread 세 개로 나눠 동시에 실행합니다.'],
        [
          7,
          13.5,
          'VINS-Mono 는 Shi-Tomasi corner 를 KLT optical flow 로 따라가며 사진마다 100 ~ 300 개를 유지합니다.',
          'VINS-Mono 는 Shi-Tomasi corner 를 KLT optical flow 로 따라가며 사진마다 100 에서 300 개를 유지합니다.',
        ],
        [
          13.5,
          20.5,
          'monocular + IMU 의 RMS ATE 는 ORB-SLAM3 0.043 m, VINS-Mono 0.110 m 로 약 2.6 배입니다.',
          'monocular 와 IMU 의 RMS ATE 는 ORB-SLAM3 0.043 m, VINS-Mono 0.110 m 로 약 2.6 배입니다.',
        ],
        [20.5, 27.5, 'ORB-SLAM3 는 오래전 keyframe 의 map point 도 BA 에 다시 쓰고, 둘 다 DBoW2 로 전에 온 곳을 알아봅니다.'],
      ],
    },
    {
      id: 'failure',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '흰 벽에서는 FAST 가 corner 를 거의 못 찾고, ORB-SLAM3 는 inlier 가 30 개 미만이면 tracking 실패로 봅니다.'],
        [
          6.5,
          13,
          'blur 길이는 f × 각속도 × 노출 시간이라, f 458.654 와 10 ms 면 90°/s 에서 약 7.2 pixel 입니다.',
          'blur 길이는 f × 각속도 × 노출 시간이라, f 458.654 와 10 ms 면 초당 90° 에서 약 7.2 pixel 입니다.',
        ],
        [13, 19, 'FAST 가 보는 16 pixel 원은 지름이 7 pixel 정도라서, 그만큼 번지면 원 위의 밝기 차가 고르게 뭉개집니다.'],
        [19, 25, '어두워져 밝기 차 40 이 30 % 로 줄면 40 × 0.3 으로 12 라서, 문턱 20 에서는 빠지고 7 에서만 잡힙니다.'],
        [
          25,
          31.7,
          'V203 에서 monocular 는 실패하고 stereo 는 0.521 m 였지만, IMU 를 합친 두 구성은 2 ~ 3 cm 였습니다.',
          'V203 에서 monocular 는 실패하고 stereo 는 0.521 m 였지만, IMU 를 합친 두 구성은 2 에서 3 cm 였습니다.',
        ],
      ],
    },
    {
      id: 'pause-blur',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. f 500 pixel 인 카메라가 60°/s 로 돌고 노출 시간이 20 ms 면, 가운데 점은 몇 pixel 번질까요?',
          '멈추고 적어 보기. f 500 pixel 인 카메라가 초당 60° 로 돌고 노출 시간이 20 ms 면, 가운데 점은 몇 pixel 번질까요?',
        ],
        [16.5, 23.5, '60° 는 약 1.05 rad 라서 500 × 1.05 × 0.02 로 약 10.5 pixel 이고, 원 지름 약 7 pixel 보다 깁니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 여러 사진에서 ORB feature 를 Hamming distance 와 ratio test 로 짝지어 같은 점을 찾습니다.'],
        [4.2, 8.2, '두 keyframe 의 방향으로 triangulation 해 거리를 구하고, bundle adjustment 로 pose 와 지도를 다듬습니다.'],
        [
          8.2,
          12.2,
          '카메라 한 대로는 scale 을 모르므로, IMU 의 m/s² 측정이 scale 을 정해 2 초 만에 오차 5 % 로 맞춥니다.',
          '카메라 한 대로는 scale 을 모르므로, IMU 의 미터 퍼 초 제곱 측정이 scale 을 정해 2 초 만에 오차 5 % 로 맞춥니다.',
        ],
        [12.2, 15.7, '흰 벽, blur, 어둠으로 corner 가 사라지면 IMU 가 pose 를 잇고, drift 는 loop closure 로 고칩니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '지도는 갈 길을 정하지 않습니다. 지도를 costmap 으로 바꿔 경로를 찾는 방법은 Path Planning 에서 다룹니다.']],
    },
  ],
}
