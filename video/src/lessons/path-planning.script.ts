import type { VideoScript } from '../script.ts'

// Numbers follow lessons/path-planning/README.md: the opening (50 m × 50 m, 5 cm = 0.05 m cells, 1000 × 1000 = 100만,
// Nav2 replans every 1 s, Tiago and RB-1 37.4 mile ≈ 60 km); costmap values (0 ~ 255; 0 free, 1 ~ 252, 253 inscribed,
// 254 lethal, 255 unknown; obstacle layer marks within 2.5 m and clears to 3.0 m); inflation (r = 0.22 m, inflation_radius
// 0.7 m, k = 3 and 10, cost(d) = 252 × e^(−k(d − r)); the table 0.30 / 0.40 / 0.50 / 0.60 / 0.70 m → 198 / 146 / 108 / 80 /
// 59 (k = 3) and 113 / 41 / 15 / 5 / 2 (k = 10); NavFn 50 + 0.8c, 50, 50 + 0.8 × 198 = 208, 1.2 m corridor 0.6 m → 80 →
// 114; check question 0.3 m, 1.0 m, k 3, 0.25 m → 253, 0.5 m → 252 × 0.549 = 138.3 → 138); the 8 × 6 grid (wall of 4
// cells, S (1, 3), G (6, 3), path 9 vs 5 without the wall, 44 free cells, Dijkstra 40, A* 17 grouped f = 5 / 7 / 9 as
// 3 / 7 / 7; no-wall grid 28 vs 6, path 5; 1968; check question A g 3 h 6 → 9, B g 5 h 2 → 7); Hybrid-A* (90°, (x, y, θ),
// 72 headings at 5°, 10⁶ × 72 = 7200만, 2007 Urban Challenge Junior, 2010 paper 50 ~ 300 ms; ≈ 75 m plans NavFn 146 ms,
// Smac 2D 243 ms, Hybrid-A* 144 ms, State Lattice 113 ms; robot arms 6 ~ 7 joints; check question 1.5 m); global and local
// (1 s and 20 times a second, 3 m × 3 m, 1 Hz / 5 Hz, map / odom, 60 × 60 = 3600 cells, 0.5 m/s → 0.5 × 1 = 0.5 m and
// 0.5 × 0.05 = 0.025 m, 1 ÷ 5 = 0.2 s); the behavior tree (1 Hz RateController, 20 Hz controller, 1.57 rad, 5 s, 0.15 m/s,
// 0.30 m, up to 6 tries; check question 0.3 s, 5 Hz, 5 × 0.3 = 1.5, 1 ÷ 0.3 ≈ 3.3).

const S1 = 'costmap 의 cost'
const S2 = 'Dijkstra 와 A*'
const S3 = '자동차형과 Hybrid-A*'
const S4 = 'global·local·BT'

export const script: VideoScript = {
  id: 'path-planning',
  title: 'Path Planning',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/path-planning',
  sections: [S1, S2, S3, S4],
  terms: [
    ['minimum_turning_radius', '미니멈 터닝 레디어스'],
    ['cost_scaling_factor', '코스트 스케일링 팩터'],
    ['differential drive', '디퍼렌셜 드라이브'],
    ['inflation_radius', '인플레이션 레디어스'],
    ['Urban Challenge', '어반 챌린지'],
    ['sampling-based', '샘플링 베이스드'],
    ['RateController', '레이트 컨트롤러'],
    ['Path Tracking', '패스 트래킹'],
    ['behavior tree', '비헤이비어 트리'],
    ['State Lattice', '스테이트 래티스'],
    ['pure pursuit', '퓨어 퍼슛'],
    ['robot radius', '로봇 레디어스'],
    ['FollowPath', '팔로우 패스'],
    ['admissible', '어드미서블'],
    ['controller', '컨트롤러'],
    ['heuristic', '휴리스틱'],
    ['Hybrid-A*', '하이브리드 에이 스타'],
    ['inflation', '인플레이션'],
    ['Manhattan', '맨해튼'],
    ['open list', '오픈 리스트'],
    ['Dijkstra', '다익스트라'],
    ['planning', '플래닝'],
    ['obstacle', '옵스터클'],
    ['Sequence', '시퀀스'],
    ['Fallback', '폴백'],
    ['recovery', '리커버리'],
    ['SUCCESS', '석세스'],
    ['FAILURE', '페일리어'],
    ['RUNNING', '러닝'],
    ['costmap', '코스트맵'],
    ['planner', '플래너'],
    ['Smac 2D', '스맥 투디'],
    ['global', '글로벌'],
    ['static', '스태틱'],
    ['master', '마스터'],
    ['parent', '페어런트'],
    ['Junior', '주니어'],
    ['server', '서버'],
    ['search', '서치'],
    ['layer', '레이어'],
    ['LiDAR', '라이다'],
    ['local', '로컬'],
    ['NavFn', '내브 에프엔'],
    ['DARPA', '다르파'],
    ['Smac', '스맥'],
    ['Nav2', '내브 투'],
    ['SLAM', '슬램'],
    ['grid', '그리드'],
    ['cost', '코스트'],
    ['odom', '오돔'],
    ['node', '노드'],
    ['tick', '틱'],
    ['map', '맵'],
    ['RRT', '알알티'],
    ['MPC', '엠피씨'],
    ['rad', '라디안'],
    ['A*', '에이 스타'],
    ['cm', '센티미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '로봇은 지도를 칸마다 cost 를 적은 costmap 으로 바꾸고, 가장 싼 칸부터 넓혀 목표까지 가는 경로를 찾습니다.'],
        [4.2, 7.8, 'costmap 과 inflation, Dijkstra 와 A*, Hybrid-A*, global·local planning 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '50 m × 50 m 층을 5 cm 칸으로 나눈 지도에는 칸이 1000 × 1000 = 100만 개 있습니다.', '50 m 곱하기 50 m 층을 5 cm 칸으로 나눈 지도에는 칸이 1000 곱하기 1000, 100만 개 있습니다.'],
        [4.4, 7.8, '로봇은 그중 어느 칸을 이어야 벽에 닿지 않고 가장 짧게 가는지를 어떻게 1초도 안 걸려 찾을까요?'],
      ],
    },
    {
      id: 'layers',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'costmap 은 지도와 같은 칸마다 0 ~ 255 의 숫자 하나를 적은 grid 이고, 클수록 로봇 중심을 두기 위험합니다.', 'costmap 은 지도와 같은 칸마다 0 에서 255 사이의 숫자 하나를 적은 grid 이고, 클수록 로봇 중심을 두기 위험합니다.'],
        [6.5, 13, '254 는 장애물이 있는 칸이고, 253 은 로봇 중심이 오면 몸이 닿는 칸이고, 255 는 아직 관측하지 못한 칸입니다.'],
        [13, 20, 'static layer 는 SLAM 지도의 벽을 254 로 적고, obstacle layer 는 LiDAR 가 본 장애물을 적습니다.'],
        [20, 27.5, 'inflation layer 는 그 둘레에 줄어드는 cost 를 적고, master costmap 은 칸마다 최댓값을 남깁니다.'],
      ],
    },
    {
      id: 'inflation',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '반지름 0.22 m 인 로봇은 중심이 벽에서 0.22 m 안으로 들어오면 몸이 닿으므로, 그 안의 칸은 253 으로 막습니다.'],
        [6, 12, '그 바깥부터 inflation_radius 0.7 m 까지는 장애물에서 멀어질수록 지수적으로 줄어드는 cost 를 적습니다.'],
        [12, 18, 'cost_scaling_factor k 가 3 이면 0.30 m 칸이 198 이고, k 가 10 이면 113 으로 훨씬 빨리 줄어듭니다.'],
        [18, 24, 'NavFn 은 칸을 지나는 비용을 50 + 0.8c 로 바꿉니다. 빈 칸은 50 이고, 벽에서 0.30 m 인 칸은 208 입니다.', 'NavFn 은 칸을 지나는 비용을 50 더하기 0.8 곱하기 c 로 바꿉니다. 빈 칸은 50 이고, 벽에서 0.30 m 인 칸은 208 입니다.'],
        [24, 29.7, '폭 1.2 m 복도의 한가운데는 114 로 그 절반쯤이라서, planner 는 조금 돌더라도 통로 가운데로 길을 냅니다.'],
      ],
    },
    {
      id: 'pause-inflation',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, 'robot radius 0.3 m, inflation_radius 1.0 m, k 가 3 일 때 0.25 m 와 0.5 m 칸의 cost 는?'],
        [16.5, 23.5, '0.25 m 는 0.3 m 이하라서 253 입니다. 0.5 m 는 252 × 0.549 = 138.3 을 내림해서 138 입니다.', '0.25 m 는 0.3 m 이하라서 253 입니다. 0.5 m 는 252 곱하기 0.549, 138.3 을 내림해서 138 입니다.'],
      ],
    },
    {
      id: 'dijkstra',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'Dijkstra 는 출발 칸부터 든 비용 g 를 적으며, 아직 꺼내지 않은 칸 가운데 g 가 가장 작은 칸을 하나씩 꺼냅니다.'],
        [6.5, 13, '칸을 꺼내면 이웃의 g 를 고치고, 목표 칸을 꺼내면 칸마다 적어 둔 parent 를 거꾸로 따라가 경로를 만듭니다.'],
        [13, 20, '8 × 6 grid 에서 가운데 벽을 돌아가는 최단 경로는 9 칸이고, Dijkstra 는 빈 칸 44 개 가운데 40 개를 꺼냅니다.', '8 곱하기 6 grid 에서 가운데 벽을 돌아가는 최단 경로는 9 칸이고, Dijkstra 는 빈 칸 44 개 가운데 40 개를 꺼냅니다.'],
        [20, 27.5, '목표가 어느 쪽인지 쓰지 않고 모든 방향을 똑같이 넓혀서, 100만 칸 지도에서는 출발점 둘레를 넓게 살핍니다.'],
      ],
    },
    {
      id: 'astar',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 7, 'A* 는 꺼내는 순서만 바꿉니다. g 에 목표까지 남은 비용의 어림값 h 를 더한 f 가 가장 작은 칸부터 꺼냅니다.'],
        [7, 14, '상하좌우 grid 에서는 Manhattan 거리를 h 로 쓰고, A* 는 17 칸만 꺼내고도 같은 9 칸 경로를 찾습니다.'],
        [14, 21.5, 'h 가 실제 남은 비용보다 크지 않으면 최단 경로가 보장되고, 1968 년 논문은 이 성질을 admissible 이라 불렀습니다.'],
        [21.5, 29.5, 'admissible 한 heuristic 이면 A* 와 Dijkstra 의 경로 비용은 같고, 꺼내는 칸의 수와 계산 시간만 다릅니다.'],
      ],
    },
    {
      id: 'pause-order',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, 'open list 에 A(g 3, h 6)와 B(g 5, h 2)가 있습니다. Dijkstra 와 A* 는 어느 칸을 먼저 꺼낼까요?', 'open list 에 g 가 3, h 가 6 인 칸 A 와, g 가 5, h 가 2 인 칸 B 가 있습니다. Dijkstra 와 A* 는 어느 칸을 먼저 꺼낼까요?'],
        [16.5, 23.5, 'Dijkstra 는 g 가 작은 A 를 꺼냅니다. A* 는 A 의 f 가 9 이고 B 의 f 가 7 이라서 B 를 먼저 꺼냅니다.'],
      ],
    },
    {
      id: 'hybrid',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 7, 'grid A* 경로는 칸 중심을 이은 꺾은선이라 모서리에서 90° 로 꺾는데, 자동차형 로봇은 최소 회전 반경보다 작게 못 돕니다.'],
        [7, 14, 'Hybrid-A* 는 위치에 방향을 더한 (x, y, θ) 를 상태로 두고, 왼쪽 호, 직진, 오른쪽 호로 다음 상태를 만듭니다.', 'Hybrid-A* 는 위치에 방향을 더한 엑스, 와이, 세타를 상태로 두고, 왼쪽 호, 직진, 오른쪽 호로 다음 상태를 만듭니다.'],
        [14, 21.5, '방향을 5° 간격 72 칸으로 나누면 100만 칸 지도의 상태가 100만 × 72 = 7200만 개라서 heuristic 이 더 중요합니다.', '방향을 5° 간격 72 칸으로 나누면 100만 칸 지도의 상태가 100만 곱하기 72, 7200만 개라서 heuristic 이 더 중요합니다.'],
        [21.5, 29.5, '2007 년 Urban Challenge 의 Junior 가 이 방법을 썼고, 주차장에서 다시 계획하는 데 50 ~ 300 ms 걸렸습니다.', '2007 년 Urban Challenge 의 Junior 가 이 방법을 썼고, 주차장에서 다시 계획하는 데 50 에서 300 ms 걸렸습니다.'],
      ],
    },
    {
      id: 'planners',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, 'Nav2 문서의 약 75 m 경로에서 위치만 탐색하는 NavFn 은 146 ms, Smac 2D 는 243 ms 가 걸렸습니다.'],
        [6.5, 13, '방향까지 따지는 Smac Hybrid-A* 는 144 ms, State Lattice 는 113 ms 로 2D planner 와 비슷합니다.', '방향까지 따지는 Smac Hybrid-A* 는 144 ms, State Lattice 는 113 ms 로 투디 planner 와 비슷합니다.'],
        [13, 20.5, '원형 differential drive 로봇은 NavFn 이나 Smac 2D 를 쓰고, 자동차형 로봇은 Hybrid-A* 를 씁니다.'],
        [20.5, 27.5, '로봇 팔처럼 관절이 6 ~ 7 개면 칸 수가 너무 늘어서, RRT 같은 sampling-based planner 를 씁니다.', '로봇 팔처럼 관절이 6 에서 7 개면 칸 수가 너무 늘어서, RRT 같은 sampling-based planner 를 씁니다.'],
      ],
    },
    {
      id: 'pause-robot',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '제자리 회전이 되는 원형 청소 로봇과, 최소 회전 반경 1.5 m 인 자동차형 배송 로봇에 맞는 planner 는?'],
        [16.5, 23.5, '청소 로봇은 NavFn 이나 Smac 2D 로 충분하고, 배송 로봇은 회전 반경을 1.5 m 로 둔 Smac Hybrid-A* 를 씁니다.'],
      ],
    },
    {
      id: 'global-local',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'global planner 는 목표까지 경로를 1초마다 다시 계산하고, controller 는 1초에 20 번 속도 명령을 냅니다.'],
        [7, 14, 'global costmap 은 1 Hz 로 갱신하고, local costmap 은 로봇 둘레 3 m × 3 m 를 5 Hz 로 갱신합니다.'],
        [14, 21.5, 'local costmap 은 0.05 m 칸 60 × 60 = 3600 개라서 100만 칸인 global costmap 보다 훨씬 작습니다.', 'local costmap 은 0.05 m 칸 60 곱하기 60, 3600 개라서 100만 칸인 global costmap 보다 훨씬 작습니다.'],
        [21.5, 29.5, '0.5 m/s 로 달리면 다음 명령까지 0.025 m 를 가고, 앞에 사람이 나타나면 0.2 s 안에 local costmap 에 적힙니다.', '초속 0.5 m 로 달리면 다음 명령까지 0.025 m 를 가고, 앞에 사람이 나타나면 0.2 초 안에 local costmap 에 적힙니다.'],
      ],
    },
    {
      id: 'bt',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'Nav2 는 경로 계획, 경로 추종, 복구 동작을 별도 server 로 나누고, 부르는 순서는 behavior tree 로 정합니다.'],
        [6.5, 12.5, 'node 는 SUCCESS, FAILURE, RUNNING 중 하나를 돌려주고, Sequence 와 Fallback 이 순서를 정합니다.'],
        [12.5, 18.5, '기본 tree 에서 RateController 는 경로 계산을 1초에 한 번 통과시키고, FollowPath 는 최근 경로를 따르게 합니다.', '기본 트리에서 RateController 는 경로 계산을 1초에 한 번 통과시키고, FollowPath 는 최근 경로를 따르게 합니다.'],
        [18.5, 24.5, '그래도 실패하면 costmap 지우기, 제자리 회전 1.57 rad, 5 초 대기, 0.30 m 후진을 차례로 최대 6 번 시도합니다.'],
        [24.5, 29.7, '경로를 한 번만 계산하면 닫힌 문을 돌아가지 못하고, 너무 자주 계산하면 비슷한 두 길 사이에서 경로가 자주 바뀔 수 있습니다.'],
      ],
    },
    {
      id: 'pause-rate',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '경로 하나에 0.3 s 가 걸리는 planner 에서 RateController 를 5 Hz 로 올리면 1초에 경로를 5 번 받을까요?', '경로 하나에 0.3 초가 걸리는 planner 에서 RateController 를 5 Hz 로 올리면 1초에 경로를 5 번 받을까요?'],
        [16.5, 23.5, '5 × 0.3 = 1.5 초가 필요해서 받을 수 없습니다. 1 ÷ 0.3 ≈ 3.3 번이 상한이라 더 빠른 planner 가 필요합니다.', '5 곱하기 0.3 은 1.5 초라서 받을 수 없습니다. 1 나누기 0.3, 약 3.3 번이 상한이라 더 빠른 planner 가 필요합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4, 'costmap 은 칸마다 0 ~ 255 의 cost 를 적고, inflation 이 벽 가까운 칸을 비싸게 만들어 길이 가운데로 납니다.', 'costmap 은 칸마다 0 에서 255 의 cost 를 적고, inflation 이 벽 가까운 칸을 비싸게 만들어 길이 가운데로 납니다.'],
        [4, 8, '싼 칸부터 넓힐 때 Dijkstra 는 40 칸을 꺼내고, g 에 h 를 더한 f 로 고르는 A* 는 17 칸만 꺼내 같은 경로를 찾습니다.'],
        [8, 12, '자동차형 로봇은 (x, y, θ) 를 탐색하는 Smac Hybrid-A* 로 최소 회전 반경을 지키는 경로를 만듭니다.', '자동차형 로봇은 엑스, 와이, 세타를 탐색하는 Smac Hybrid-A* 로 최소 회전 반경을 지키는 경로를 만듭니다.'],
        [12, 15.7, 'NavFn 은 약 75 m 경로를 146 ms 에 찾고, 1초마다 다시 계산하며, controller 는 1초에 20 번 명령을 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, 'planner 가 내는 경로는 지도 위 좌표를 이은 점들의 목록이라서, 이것을 두 바퀴의 속도로 바꾸는 일이 남습니다.'],
        [3.6, 6.7, '다음은 Path Tracking 입니다. pure pursuit 과 MPC 로 경로를 1초에 20 번 속도 명령으로 바꿉니다.'],
      ],
    },
  ],
}
