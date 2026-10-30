import type { VideoScript } from '../script.ts'

// Numbers follow lessons/lidar-slam/README.md: the map / pose cycle (AMCL, slam_toolbox, Cartographer); odometry drift
// (wheel diameter 1% → 60 m 에 0.6 m; lateral = distance × sin(heading error): 0.5° 0.09 / 0.17 / 0.44 m, 1° 0.17 / 0.35 /
// 0.87 m, 2° 0.35 / 0.70 / 1.75 m at 10 / 20 / 50 m; 20 m × 10 m corridor loop 60 m, 90° 마다 1°, 0.78 m; 3 × sin 1° ≈ 0.052 m,
// 5 cm cell; check 30 × sin 2° = 30 × 0.0349 ≈ 1.05 m); occupancy grid (5 cm, resolution 0.05 m, 10 m × 10 m → 200 × 200 =
// 40,000; start 0.5; LDS-01 5 바퀴/s (300 rpm), 1°, 360, 0.12 ~ 3.5 m, 360 × 5 = 1,800 rays/s, 3.5 m crosses 70 cells);
// log-odds (l = ln p/(1 − p); 0.7 → ln(0.7/0.3) = +0.85, 0.4 → ln(0.4/0.6) = −0.41; table 0 / 0.85 / 1.69 / 2.54 / 2.14 /
// 0.51 / −1.11 ↔ 0.50 / 0.70 / 0.84 / 0.93 / 0.89 / 0.63 / 0.248 at scans 0 / 1 / 2 / 3 / 4 / 8 / 12; nine passes, free
// below 0.25, 1.8 s at 5 바퀴/s; Cartographer 0.55 / 0.49 → +0.20 / −0.04, 4 × 0.20 = 0.80 → 0.69 > 0.65; slam_toolbox
// min_pass_through 2, occupancy_threshold 0.1, 3 / 12 = 0.25, 3 / 30 = 0.1; nav_msgs −1; check 0 + 0.85 + 0.85 − 0.41 = 1.29
// → ≈ 0.78); scan matching (0.2 s per turn, Δx Δy Δθ; ICP 1992; correlative ±0.25 m at 2 cm → 26 × 26, ±20° at 2° → 21,
// 14,196; fine ±1 cm at 1 cm → 3 × 3, ±1° at 0.2° → 11, 99; 14,196 × 360 ≈ 510 만 lookups); pose graph (node every 0.5 m or
// 0.5 rad (약 29°); 1D +5.0 +5.0 −4.8 −4.8 → 0.4 m, loop 0 m; equal variance 0.4 ÷ 5 = 0.08 → 0 / 4.92 / 9.84 / 4.96 / 0.08;
// loop variance ≈ 0 → 0.4 ÷ 4 = 0.1 → 0 / 4.9 / 9.8 / 4.9 / 0; loop search 3 m, chain 10, 8 m, 문턱 0.35 / 0.45; check
// +3.0 +3.0 −2.9 −2.9 → 0.2 ÷ 4 = 0.05 → 2.95 / −2.95); slam_toolbox (/map every 5 s (map_update_interval 5.0), map → odom
// tf 0.02 s = 50 Hz, minimum_travel 0.5 m / 0.5 rad, loop_search_maximum_distance 3.0, max_laser_range 20.0); resolution
// and saving (24,000 m²: 10 cm 240 만 ≈ 2.4 MB, 5 cm 960 만 ≈ 9.6 MB, 2.5 cm 3,840 만 ≈ 38.4 MB; LDS-01 ±5% → ±3 × 0.05 =
// ±0.15 m, 30 cm 폭 = 5 cm 6 칸 / 2.5 cm 12 칸; map saver 0.25 → 254, 0.65 → 0, otherwise 205; check 50 ÷ 0.05 = 1,000,
// 40 ÷ 0.05 = 800, 80 만, 2 × 2 = 4 배, 320 만).

const S1 = 'odometry 오차'
const S2 = 'occupancy grid'
const S3 = 'pose graph'
const S4 = 'slam_toolbox 와 저장'

export const script: VideoScript = {
  id: 'lidar-slam',
  title: 'LiDAR SLAM',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/lidar-slam',
  sections: [S1, S2, S3, S4],
  terms: [
    ['asynchronous mode', '에이싱크로너스 모드'],
    ['synchronous mode', '싱크로너스 모드'],
    ['occupancy grid', '오큐펀시 그리드'],
    ['scan matching', '스캔 매칭'],
    ['loop closure', '루프 클로저'],
    ['local minimum', '로컬 미니멈'],
    ['Path Planning', '패스 플래닝'],
    ['map_saver_cli', '맵 세이버 씨엘아이'],
    ['serialize_map', '시리얼라이즈 맵'],
    ['slam_toolbox', '슬램 툴박스'],
    ['correlative', '코릴레이티브'],
    ['pose graph', '포즈 그래프'],
    ['Visual SLAM', '비주얼 슬램'],
    ['back-end', '백엔드'],
    ['front-end', '프런트엔드'],
    ['log-odds', '로그 오즈'],
    ['map saver', '맵 세이버'],
    ['raw scan', '로 스캔'],
    ['odometry', '오도메트리'],
    ['map.yaml', '맵 야믈'],
    ['map.pgm', '맵 피지엠'],
    ['package', '패키지'],
    ['LDS-01', '엘디에스 영일'],
    ['LiDAR', '라이다'],
    ['/scan', '스캔 토픽'],
    ['/map', '맵 토픽'],
    ['AMCL', '에이엠씨엘'],
    ['SLAM', '슬램'],
    ['Nav2', '내브 투'],
    ['node', '노드'],
    ['edge', '엣지'],
    ['scan', '스캔'],
    ['odom', '오돔'],
    ['yaml', '야믈'],
    ['ICP', '아이씨피'],
    ['VIO', '브이아이오'],
    ['pgm', '피지엠'],
    ['map', '맵'],
    ['sin', '사인'],
    ['rad', '라디안'],
    ['cm', '센티미터'],
    ['MB', '메가바이트'],
    ['tf', '티에프'],
    ['Δx', '델타 엑스'],
    ['Δy', '델타 와이'],
    ['Δθ', '델타 세타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'LiDAR SLAM 은 처음 들어간 건물에서 LiDAR 로 지도를 그리면서, 그 지도 위의 자기 위치도 함께 구합니다.'],
        [4.2, 7.8, 'odometry 오차, occupancy grid, scan matching 과 pose graph, slam_toolbox 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '복도를 한 바퀴 돌며 odometry 로 구한 위치에 scan 을 붙이면, 출발점에서 같은 벽이 두 겹으로 그려집니다.'],
        [4.4, 7.8, '지도는 위치로 그리고 위치는 지도로 고치는데, 둘 다 없이 출발한 로봇은 어떻게 반듯한 지도를 얻을까요?'],
      ],
    },
    {
      id: 'cycle',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'AMCL 은 지도가 있을 때 위치를 찾고, 반대로 위치를 정확히 알면 scan 을 그 자리에 칠해 지도를 그립니다.'],
        [6.5, 12.5, '처음 들어간 건물에서는 둘 다 모르니, SLAM 은 센서 값과 odometry 만으로 위치와 지도를 함께 추정합니다.'],
        [12.5, 19, 'front-end 는 새 scan 을 바로 앞의 scan 이나 작은 지도 조각에 맞춰 위치를 고치고, 그 위치로 지도를 늘려 갑니다.'],
        [19, 25.7, '예전에 지나간 곳에 돌아온 것을 알아차리면, back-end 가 지금까지의 경로 전체를 한꺼번에 다시 맞춥니다.'],
      ],
    },
    {
      id: 'drift',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '바퀴 지름을 1% 크게 알고 있으면 거리도 1% 크게 세어서, 60 m 를 달리면 0.6 m 가 어긋납니다.'],
        [
          6,
          12,
          '방향 오차는 더 크게 번집니다. 옆으로 벗어나는 거리는 달린 거리 × sin(방향 오차) 로 커집니다.',
          '방향 오차는 더 크게 번집니다. 옆으로 벗어나는 거리는 달린 거리에 방향 오차의 sin 을 곱한 값으로 커집니다.',
        ],
        [12, 18, '방향을 1° 틀리면 10 m 뒤 0.17 m, 50 m 뒤 0.87 m 벗어나고, 2° 틀리면 50 m 뒤 1.75 m 벗어납니다.'],
        [18, 24, '20 m × 10 m 복도를 한 바퀴 60 m 돌아 출발점에 왔는데, odometry 는 0.78 m 떨어진 곳이라고 계산합니다.'],
        [24, 29.7, '방향을 1° 틀리면 3 m 앞 벽 점이 약 0.052 m 옆에 찍혀서, 5 cm 칸 지도에서는 벽이 한 칸 밀립니다.'],
      ],
    },
    {
      id: 'pause-drift',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 회전을 2° 틀리게 센 뒤 30 m 를 곧게 달렸다면, odometry 위치는 옆으로 얼마나 벗어날까요?'],
        [16.5, 23.5, '30 × sin 2° 는 30 × 0.0349 로 약 1.05 m 입니다. 거리를 정확히 셌어도 방향이 틀리면 이만큼 어긋납니다.'],
      ],
    },
    {
      id: 'grid',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'occupancy grid 는 바닥을 같은 크기의 네모 칸으로 나누고, 칸마다 무언가로 차 있을 확률을 적은 표입니다.'],
        [6.5, 13, 'slam_toolbox 의 기본 칸 크기는 0.05 m 라서, 10 m × 10 m 방은 200 × 200 으로 40,000 칸이 됩니다.'],
        [13, 20.5, '칸은 처음에 모두 0.5 입니다. 빛이 맞은 끝점 칸은 차 있고, 빛이 지나온 칸은 비어 있고, 벽 뒤 칸은 모릅니다.'],
        [20.5, 27.7, 'LDS-01 은 1초에 빛 1,800 줄을 받고, 3.5 m 를 가는 빛 한 줄은 5 cm 칸을 70 개 지나서 계산이 가벼워야 합니다.'],
      ],
    },
    {
      id: 'logodds',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '확률을 log-odds 로 바꾸면 새 증거를 더하기만 하면 되고, 확률 0.5 는 log-odds 0 입니다.'],
        [6, 12, '빛이 맞을 때마다 +0.85 를 더하고 지나갈 때마다 −0.41 을 더하는데, 맞음 0.7 과 지나감 0.4 로 정한 값입니다.'],
        [12, 18, '사람이 서 있던 칸은 세 번 맞아 0.93 까지 오르고, 사람이 떠난 뒤 빛이 아홉 번 지나가야 0.25 아래가 됩니다.'],
        [18, 24, 'Nav2 map saver 는 0.25 아래를 비어 있다고 보는데, LiDAR 가 1초에 5 바퀴 돌면 아홉 번에 1.8 초가 걸립니다.'],
        [24, 29.7, 'slam_toolbox 는 횟수를 세서 맞은 비율이 0.1 을 넘으면 차 있다고 칠하므로, 3 ÷ 12 인 칸은 아직 벽입니다.'],
      ],
    },
    {
      id: 'pause-logodds',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 처음 0.5 인 칸에 맞음, 맞음, 지나감이 차례로 들어오면 차 있을 확률은 얼마일까요?'],
        [
          16.5,
          23.5,
          'log-odds 는 0 + 0.85 + 0.85 − 0.41 로 1.29 이고, 확률로 되돌리면 약 0.78 입니다. 순서를 바꿔도 같습니다.',
          'log-odds 는 0.85 더하기 0.85 빼기 0.41 로 1.29 이고, 확률로 되돌리면 약 0.78 입니다. 순서를 바꿔도 같습니다.',
        ],
      ],
    },
    {
      id: 'scan',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '0.2 초 사이에 찍은 두 scan 은 거의 같은 벽을 보므로, 둘이 겹치게 옮긴 Δx, Δy, Δθ 가 실제 이동입니다.'],
        [6, 12, 'ICP 는 새 scan 의 점마다 가장 가까운 점을 짝으로 정하고, 짝끼리 거리 제곱 합이 가장 작아지게 옮기기를 되풀이합니다.'],
        [12, 18, 'ICP 는 출발점에서 가장 가까운 local minimum 으로 수렴해서, odometry 가 크게 틀리면 틀린 답에서 멈춥니다.'],
        [18, 24, 'correlative 방식은 위치 26 × 26, 각도 21 개인 후보 14,196 개를 모두 점수 매겨 가장 높은 자세를 고릅니다.'],
        [24, 29.7, '양쪽 벽이 나란한 긴 복도에서는 복도 방향으로 밀어도 점수가 같아서, 그 방향 이동은 scan 으로 알 수 없습니다.'],
      ],
    },
    {
      id: 'loop',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'node 는 scan 을 찍은 순간의 자세이고, slam_toolbox 는 0.5 m 나 0.5 rad 마다 node 를 만듭니다.'],
        [6, 12, 'edge 는 두 node 사이의 상대 이동과 그 불확실성이고, loop closure 는 멀리 떨어진 두 node 를 잇는 edge 입니다.'],
        [12, 18, 'edge 가 +5.0, +5.0, −4.8, −4.8 m 면 끝이 0.4 m 인데, loop closure 는 출발점이라고 합니다.'],
        [18, 24, '분산이 모두 같으면 다섯 edge 가 0.4 ÷ 5 로 0.08 m 씩 떠안고, 분산이 큰 측정일수록 많이 고칩니다.'],
        [24, 29.7, '똑같이 생긴 두 복도를 잘못 이은 loop closure 하나가 지도 전체를 휘게 해서, 점수 문턱으로 깐깐하게 고릅니다.'],
      ],
    },
    {
      id: 'pause-loop',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. edge 가 +3.0, +3.0, −2.9, −2.9 m 이고 loop closure 분산이 0 에 가까우면 고칠 양은?'],
        [16.5, 23.5, '끝 0.2 m 를 edge 넷이 0.2 ÷ 4 로 0.05 m 씩 떠안아서, 갈 때 2.95 m, 올 때 −2.95 m 가 됩니다.'],
      ],
    },
    {
      id: 'toolbox',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'Nav2 문서가 권하는 slam_toolbox 는 /scan 의 LiDAR 값과 odometry 가 내는 tf 를 받습니다.'],
        [6.5, 13, 'pose graph 를 최적화해서 /map 은 5 초마다 내고, 고친 위치는 map → odom tf 로 1초에 50 번 냅니다.'],
        [13, 20.5, 'synchronous mode 는 scan 을 버리지 않고 차례로 처리해서, 지도 품질이 중요하거나 녹화한 데이터를 쓸 때 알맞습니다.'],
        [20.5, 27.7, 'asynchronous mode 는 앞 scan 처리가 끝났을 때 와 있는 새 scan 만 처리해서, 실시간보다 뒤처지지 않습니다.'],
      ],
    },
    {
      id: 'save',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, '칸 크기를 반으로 줄이면 칸 수는 네 배가 되고, 24,000 m² 공간의 지도 한 장은 5 cm 칸에서 약 9.6 MB 입니다.'],
        [6, 12, '칸을 줄여도 벽이 센서보다 정확해지지는 않아서, LDS-01 은 3 m 앞 벽까지의 거리가 ±0.15 m 까지 틀립니다.'],
        [12, 18, '다 그린 지도는 map_saver_cli 로 저장하고, 그러면 지도 그림 map.pgm 과 설명 파일 map.yaml 이 생깁니다.'],
        [18, 24, '저장할 때 0.25 이하인 칸은 흰색이 되고 0.65 이상인 칸은 검은색이 되며, 나머지 칸은 회색이 됩니다.'],
        [24, 29.7, 'pgm 에는 pose graph 가 남지 않아서, 이어 그리려면 serialize_map 으로 raw scan 과 함께 저장합니다.'],
      ],
    },
    {
      id: 'pause-save',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 50 m × 40 m 창고를 5 cm 칸으로 그리면 칸은 몇 개이고, 2.5 cm 로 줄이면 몇 배가 될까요?'],
        [16.5, 23.5, '가로 1,000 칸, 세로 800 칸이라 80 만 칸이고, 2.5 cm 로 줄이면 2 × 2 로 4 배인 320 만 칸이 됩니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. SLAM 은 위치와 지도를 함께 추정하는데, odometry 만 쌓으면 60 m 고리 끝에서 0.78 m 가 어긋납니다.'],
        [4.2, 8.2, 'occupancy grid 는 칸마다 log-odds 를 더해 가고, 확률 0.5 인 칸은 빈 칸이 아니라 모르는 칸입니다.'],
        [8.2, 12.2, 'scan matching 은 벽 모양으로 odometry 를 고치고, loop closure 는 남은 어긋남을 분산에 비례해 나눕니다.'],
        [12.2, 15.7, 'slam_toolbox 로 그린 지도는 map_saver_cli 로 pgm 과 yaml 로 저장해서 AMCL 에 넘깁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '카메라로 하는 Visual SLAM 과 VIO 는 다음 강의에서 다루고, 저장한 지도 위의 경로 계획은 Path Planning 에서 다룹니다.']],
    },
  ],
}
