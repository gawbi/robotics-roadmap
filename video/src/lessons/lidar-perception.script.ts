import type { VideoScript } from '../script.ts'

// Numbers follow lessons/lidar-perception/README.md: time of flight (100 m → 약 667 ns); VLP-16 (beam 16, −15° ~ +15°,
// 2° 간격, 5 ~ 20 Hz, 약 30만 점/s, 10 Hz → 300,000 ÷ 10 = 30,000 per scan, 4 byte × 4 = 16 byte, 300,000 × 16 = 4.8 MB);
// box = 숫자 7 개 + class; ring spacing 10 / 30 / 50 m → 0.35 / 1.05 / 1.75 m, person 1.7 m tall, 0.5 m wide, sensor 0.8 m,
// rings 5 / 2 / 1, points per ring 약 14 / 5 / 3, person 약 70 / 약 10 / 약 3; 0.2°, 30 m → 0.105 m; nuScenes 32-beam 3 m 최대
// 1만 2천 vs 80 m 많아야 100; 10 Hz → 0.1 초, 15 m/s → 1.5 m; voxel 52 → 13, leaf size 0.2 m; RANSAC 3 points, 0.1 m,
// candidates 6 vs 33 inliers; p = 0.99, w 0.8 / 0.6 / 0.4 / 0.2 → k 7 / 19 / 70 / 574; check w = 0.5 → 0.125, log 0.01 ÷
// log 0.875 ≈ 34.5 → 35; slope 10% from 10 m → 30 m: 20 × 0.1 = 2 m; clustering tolerance 0.7 m (Autoware default), 10 ~
// 1000 points, two people 0.5 m apart: 0.7 m → one box, 0.3 m → two; use_height false; 30° car 4.5 × 1.8 m → 4.8 × 3.8 m,
// 8.1 m² → 18.3 m²; VoxelNet 225 ms (4.4 Hz); PointPillars 0.16 m, 0 ~ 70.4 m × −40 ~ 40 m, 440 × 500 = 22만 칸, 97% empty,
// 12,000 pillars, 100 points, 9 → 64 numbers, 64 × 500 × 440 pseudo-image, 16.2 ms (62 Hz), encoder 1.3 ms vs 190 ms, KITTI
// Moderate AP 74.99 / SECOND 73.66 / VoxelNet 65.11; IoU 4 × 2 m, 0.5 m → 3.5 × 2 = 7, 8 + 8 − 7 = 9, 0.78; 1.0 m → 0.60;
// person 0.6 × 0.6 m, 0.3 m → 0.33; AP table (0.95 0.90 0.80 0.70 0.50, TP TP FP TP FP, 4 cars) → 0.5 × 1.00 + 0.25 × 0.75 =
// 0.6875 ≈ 69%, recall 75%; KITTI 7,481 / 7,518, IoU car 0.7, person·bicycle 0.5; nuScenes 1,000 scenes × 20 초, center
// distance 0.5 / 1 / 2 / 4 m; NDS PointPillars mAP 30.5% → 45.3%, MonoDIS mAP 30.4%, 속도 오차 1.55 m/s, NDS 38.4%; check
// 0.8 m → 6.4 ÷ 9.6 ≈ 0.67 < 0.7; tracking A 9.0 m 10 m/s → 10.0 m, B 11.5 m 5 m/s → 12.0 m, d1 11.2 m, d2 13.5 m, gate
// 2 m, B–d1 0.8 m, A–d2 3.5 m, A–d1 + B–d2 = 2.7 m vs 4.3 m; AB3DMOT 숫자 11 개, 3 frame birth, 2 frame keep, 2 ÷ 10 =
// 0.2 초, 207.4 frame/s; check 0.5 초 = 5 frame; fusion point (10, 1, 0.5) → (−1, −0.5, 10), f 700 px, centre (640, 360),
// u = 700 × (−1 ÷ 10) + 640 = 570, v = 700 × (−0.5 ÷ 10) + 360 = 325; PointPainting mAP 40.1% → 46.4%, bicycle 14.0% →
// 24.1%, traffic cone 45.6% → 62.4%, 0.75 ms; extrinsic 1° → 700 × tan 1° ≈ 12 px, 30 m person ≈ 12 px; 50 ms × 20 m/s = 1 m.

const S1 = 'point cloud 와 밀도'
const S2 = '규칙 기반 상자'
const S3 = 'PointPillars 와 지표'
const S4 = 'tracking 과 fusion'

export const script: VideoScript = {
  id: 'lidar-perception',
  title: 'LiDAR Perception',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/lidar-perception',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Autonomous Driving Stack', '오토노머스 드라이빙 스택'],
    ['Euclidean clustering', '유클리디언 클러스터링'],
    ['voxel downsampling', '복셀 다운샘플링'],
    ['Hungarian algorithm', '헝가리안 알고리즘'],
    ['LiDAR Perception', '라이다 퍼셉션'],
    ['L-shape fitting', '엘 셰이프 피팅'],
    ['segmentation', '세그멘테이션'],
    ['Kalman filter', '칼만 필터'],
    ['PointPainting', '포인트 페인팅'],
    ['camera frame', '카메라 프레임'],
    ['pseudo-image', '수도 이미지'],
    ['PointPillars', '포인트 필러스'],
    ['point cloud', '포인트 클라우드'],
    ['localization', '로컬라이제이션'],
    ['calibration', '캘리브레이션'],
    ['convolution', '컨볼루션'],
    ['prediction', '프리딕션'],
    ['extrinsic', '익스트린식'],
    ['perception', '퍼셉션'],
    ['clustering', '클러스터링'],
    ['tolerance', '톨러런스'],
    ['precision', '프리시전'],
    ['intensity', '인텐시티'],
    ['use_height', '유즈 하이트'],
    ['planning', '플래닝'],
    ['tracking', '트래킹'],
    ['nuScenes', '누씬즈'],
    ['detector', '디텍터'],
    ['Moderate', '모더레이트'],
    ['Autoware', '오토웨어'],
    ['VoxelNet', '복셀넷'],
    ['AB3DMOT', '에이비쓰리디모트'],
    ['MonoDIS', '모노디스'],
    ['control', '컨트롤'],
    ['channel', '채널'],
    ['VLP-16', '브이엘피 식스틴'],
    ['inlier', '인라이어'],
    ['RANSAC', '랜색'],
    ['recall', '리콜'],
    ['fusion', '퓨전'],
    ['pillar', '필러'],
    ['camera', '카메라'],
    ['LiDAR', '라이다'],
    ['voxel', '복셀'],
    ['frame', '프레임'],
    ['class', '클래스'],
    ['stack', '스택'],
    ['pixel', '픽셀'],
    ['KITTI', '키티'],
    ['track', '트랙'],
    ['scan', '스캔'],
    ['beam', '빔'],
    ['ring', '링'],
    ['byte', '바이트'],
    ['gate', '게이트'],
    ['yaw', '요'],
    ['box', '박스'],
    ['log', '로그'],
    ['CNN', '씨엔엔'],
    ['IoU', '아이오유'],
    ['NDS', '엔디에스'],
    ['mAP', '엠에이피'],
    ['AP', '에이피'],
    ['TP', '티피'],
    ['FP', '에프피'],
    ['MB', '메가바이트'],
    ['ns', '나노초'],
    ['px', '픽셀'],
    ['3D', '쓰리디'],
    ['2D', '투디'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'LiDAR Perception 은 좌표만 있는 point cloud 에서 물체를 찾아 상자를 씌우고 frame 사이로 잇습니다.'],
        [4.2, 7.8, 'point cloud 와 밀도, 규칙 기반 상자, PointPillars 와 지표, tracking 과 fusion 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'LiDAR 의 점 하나에는 좌표와 반사 세기뿐이라, 어느 점이 차이고 어느 점이 사람인지 적혀 있지 않습니다.'],
        [4.2, 7.8, '이 점 더미에서 앞의 보행자를 찾아 상자를 씌우고, 그 사람이 어느 쪽으로 걷는지까지 어떻게 알아낼까요?'],
      ],
    },
    {
      id: 'sensor',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'LiDAR 는 레이저가 맞고 돌아오기까지 걸린 시간으로 거리를 재서, 100 m 앞 벽이면 왕복 약 667 ns 가 걸립니다.'],
        [6.5, 13, 'VLP-16 은 beam 16 개를 −15° 에서 +15° 까지 2° 간격으로 쌓아 돌리며, 1초에 약 30만 개의 점을 냅니다.'],
        [13, 19.5, '점 하나는 x, y, z 와 반사 세기 intensity 를 4 byte 실수로 하나씩 담아서 모두 16 byte 입니다.'],
        [19.5, 25.7, 'perception 의 출력은 중심, 크기, 방향 yaw 의 숫자 7 개와 class 를 담은 3D box 의 목록입니다.'],
      ],
    },
    {
      id: 'density',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'beam 사이 각도가 2° 로 정해져서, ring 사이 세로 간격은 10 m 에서 0.35 m, 30 m 에서 1.05 m 로 벌어집니다.'],
        [7, 13.5, '키 1.7 m, 폭 0.5 m 인 사람에게 닿는 ring 은 10 m 에서 5 개, 30 m 에서 2 개, 50 m 에서 1 개뿐입니다.'],
        [13.5, 20.5, '가로 간격도 거리에 비례해서 사람 한 명의 점은 10 m 에서 약 70 개, 30 m 에서 약 10 개, 50 m 에서 약 3 개입니다.'],
        [
          20.5,
          27.7,
          '10 Hz 면 scan 의 첫 점과 끝 점 사이가 0.1 초라서, 15 m/s 로 달리는 차가 1.5 m 움직인 만큼 점을 옮겨 둡니다.',
          '10 Hz 면 scan 의 첫 점과 끝 점 사이가 0.1 초라서, 초속 15 m 로 달리는 차가 1.5 m 움직인 만큼 점을 옮겨 둡니다.',
        ],
      ],
    },
    {
      id: 'pause-scan',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 10 Hz 로 도는 VLP-16 의 scan 하나에는 점이 몇 개이고, 1초에 몇 MB 를 보낼까요?'],
        [16.5, 23.5, 'scan 하나는 300,000 ÷ 10 으로 30,000 개이고, 1초에는 300,000 × 16 byte 로 4.8 MB 를 보냅니다.'],
      ],
    },
    {
      id: 'ransac',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'voxel downsampling 은 칸마다 점들의 평균 위치 하나만 남겨서, 그림의 점 52 개가 13 개로 줄고 밀도가 고르게 됩니다.'],
        [7, 13.8, '땅 점은 물체 사이를 이어 주므로 먼저 지우는데, RANSAC 은 점 3 개로 평면을 만들고 0.1 m 안의 inlier 를 셉니다.'],
        [13.8, 20.8, '차 점이 섞인 첫 후보는 inlier 가 6 개이고 땅 점만 뽑은 둘째 후보는 33 개라서, 둘째 평면을 땅으로 고릅니다.'],
        [20.8, 27.7, '땅을 평면 하나로 보므로, 10 m 앞에서 10% 오르막이 시작되면 30 m 지점의 길은 2 m 높아 물체로 분류됩니다.'],
      ],
    },
    {
      id: 'cluster',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'Euclidean clustering 에서 0.5 m 떨어진 두 사람은 tolerance 0.7 m 면 한 상자가 됩니다.'],
        [7, 14, '30 m 에서 ring 간격이 1.05 m 라 3D 거리로 묶으면 차 한 대가 쪼개져서, Autoware 는 x·y 거리로만 묶습니다.'],
        [14, 20.5, '무리의 최소 점 수가 10 개라서, 50 m 에서 점이 약 3 개 찍히는 사람은 버려집니다.'],
        [20.5, 27.7, '30° 돌아간 4.5 × 1.8 m 차는 x·y 범위 상자로 4.8 × 3.8 m 가 되어, L-shape fitting 을 씁니다.'],
      ],
    },
    {
      id: 'pause-ransac',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 잘라 낸 영역의 땅 점이 절반이면, 99% 확률로 땅 점만 한 번 뽑으려면 몇 번 반복할까요?'],
        [16.5, 23.5, '셋 다 땅일 확률은 0.5 세제곱인 0.125 이고, log 0.01 ÷ log 0.875 가 약 34.5 라서 35 번 반복합니다.'],
      ],
    },
    {
      id: 'pillars',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'point cloud 는 대부분 빈 공간이라, 3D convolution 을 쓴 VoxelNet 은 225 ms 가 걸렸습니다.'],
        [7, 14, 'PointPillars 는 위에서 본 격자를 0.16 m 칸으로 나누고, 점이 있는 pillar 만 최대 12,000 개 모읍니다.'],
        [14, 21, '점마다 숫자 9 개를 64 개로 바꿔 pillar 안 최댓값만 남기고, 이 pseudo-image 를 2D CNN 에 넣습니다.'],
        [21, 27.7, 'scan 하나를 16.2 ms 에 처리했고, KITTI Moderate AP 는 74.99 로 VoxelNet 65.11 보다 높았습니다.'],
      ],
    },
    {
      id: 'metrics',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'IoU 는 겹친 부피를 합친 부피로 나눈 값으로, 4 × 2 m 차 상자가 0.5 m 어긋나면 7 ÷ 9 로 0.78 입니다.'],
        [6.5, 12.8, '같은 거리 오차에도 작은 물체는 크게 떨어져서, 0.6 × 0.6 m 사람 상자는 0.3 m 만 어긋나도 0.33 입니다.'],
        [12.8, 19.3, 'precision 과 recall 곡선 아래 넓이가 AP 라서, 정답 4 대 예에서 recall 은 75% 지만 AP 는 약 69% 입니다.'],
        [19.3, 25.6, 'KITTI 는 IoU 기준이 차 0.7, 사람과 자전거 0.5 이고, nuScenes 는 중심 거리 0.5, 1, 2, 4 m 를 씁니다.'],
        [25.6, 31.7, 'NDS 는 mAP 와 TP 오차가 절반씩이라, 속도 오차가 큰 MonoDIS 는 38.4% 로 PointPillars 보다 낮습니다.'],
      ],
    },
    {
      id: 'pause-iou',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 4 × 2 m 차 상자가 길이 방향으로 0.8 m 어긋났다면, KITTI 기준으로 맞힌 것일까요?'],
        [16.5, 23.5, '겹친 넓이는 6.4, 합친 넓이는 9.6 이라 IoU 는 약 0.67 이고, 차 기준 0.7 보다 작아서 FP 로 셉니다.'],
      ],
    },
    {
      id: 'tracking',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.3, 'tracking 은 scan 마다 따로 나온 상자를 Kalman filter 의 예측, 짝짓기, 보정으로 잇습니다.'],
        [
          6.3,
          12,
          'A 는 9.0 m 에서 10 m/s, B 는 11.5 m 에서 5 m/s 라서 0.1 초 뒤 예측은 10.0 m 와 12.0 m 입니다.',
          'A 는 9.0 m 에서 초속 10 m, B 는 11.5 m 에서 초속 5 m 라서 0.1 초 뒤 예측은 10.0 m 와 12.0 m 입니다.',
        ],
        [
          12,
          18,
          '가장 가까운 B 와 d1 을 먼저 짝지으면 A 에는 3.5 m 떨어진 d2 만 남아, gate 2 m 를 넘으므로 A 를 놓칩니다.',
          '가장 가까운 B 와 디 원 을 먼저 짝지으면 A 에는 3.5 m 떨어진 디 투 만 남아, gate 2 m 를 넘으므로 A 를 놓칩니다.',
        ],
        [
          18,
          24,
          'Hungarian algorithm 은 합 2.7 m 와 4.3 m 를 비교해 A 와 d1, B 와 d2 를 골라 두 번호를 지킵니다.',
          'Hungarian algorithm 은 합 2.7 m 와 4.3 m 를 비교해 A 와 디 원, B 와 디 투 를 골라 두 번호를 지킵니다.',
        ],
        [24, 29.7, 'AB3DMOT 은 3 frame 연속 짝지어져야 track 을 만들고, 짝 잃은 track 은 2 frame 인 0.2 초 동안 둡니다.'],
      ],
    },
    {
      id: 'fusion',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.8, 'LiDAR 는 멀수록 점이 듬성하고 색이 없고, 카메라는 pixel 이 빽빽하지만 사진 한 장으로는 거리를 모릅니다.'],
        [
          6.8,
          13.8,
          '점 (10, 1, 0.5) 는 camera frame 의 (−1, −0.5, 10) 이 되어 pixel (570, 325) 에 찍힙니다.',
          '점 십, 일, 영 점 오 는 camera frame 의 마이너스 일, 마이너스 영 점 오, 십 이 되어 pixel 오백칠십, 삼백이십오 에 찍힙니다.',
        ],
        [13.8, 20.8, 'PointPainting 은 pixel 의 segmentation 점수를 점에 붙여 자전거 AP 를 14.0% 에서 24.1% 로 올렸습니다.'],
        [
          20.8,
          27.7,
          'extrinsic 이 1° 틀리면 약 12 px 밀리고, 시각이 50 ms 어긋나면 20 m/s 로 오는 차의 점이 1 m 어긋납니다.',
          'extrinsic 이 1° 틀리면 약 12 px 밀리고, 시각이 50 ms 어긋나면 초속 20 m 로 오는 차의 점이 1 m 어긋납니다.',
        ],
      ],
    },
    {
      id: 'pause-track',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 10 Hz 에서 짝 잃은 track 을 2 frame 유지할 때, 보행자가 차 뒤를 0.5 초 지나가면?'],
        [16.5, 23.5, '0.5 초는 5 frame 이라 2 frame 을 넘겨 track 이 지워지고, 다시 나온 보행자는 새 번호로 시작합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. point cloud 는 좌표와 반사 세기뿐이고, 사람의 점은 10 m 약 70 개, 50 m 약 3 개입니다.'],
        [4.2, 8.2, '규칙 기반 경로는 RANSAC 으로 땅을 지운 뒤 clustering 과 L-shape fitting 으로 상자를 만듭니다.'],
        [8.2, 12.2, 'PointPillars 는 pseudo-image 를 2D CNN 에 넣어 class 까지 내고, 성능은 IoU 기준 AP 로 잽니다.'],
        [12.2, 15.7, 'tracking 은 Hungarian algorithm 으로 번호와 속도를 붙이고, fusion 은 calibration 이 정확해야 합니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '물체 목록만으로는 차를 몰 수 없어서 localization, prediction, planning, control 이 함께 필요합니다.'],
        [3.6, 6.7, '이 모듈들을 한 차량 위에서 잇는 자율주행 stack 과 Autoware 구조는 Autonomous Driving Stack 에서 봅니다.'],
      ],
    },
  ],
}
