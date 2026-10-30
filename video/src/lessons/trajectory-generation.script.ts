import type { VideoScript } from '../script.ts'

// Numbers follow lessons/trajectory-generation/README.md: path and trajectory ((0, 0) → (2, 1) rad, dots every 0.25 s,
// 2.5 s and 4.5 s); joint vs Cartesian (Classical Pick 2.5 cm, eef_step 0.01 m, 0 ~ 1 fraction; v ÷ d at v = 0.1 m/s:
// 0.1 / 0.05 / 0.02 m → 1 / 2 / 5 rad/s, FR3 joint 1 2.62 rad/s, 0.1 ÷ 2.62 ≈ 0.038 m; check 0.2 ÷ 0.05 = 4 rad/s,
// 2.62 × 0.05 ≈ 0.13 m/s, 0.2 ÷ 2.62 ≈ 0.076 m); trapezoid (v_max 1 rad/s, a_max 2 rad/s², 2 rad: 0.5 / 1.5 / 0.5 s,
// 0.25 / 1.5 / 0.25 rad, 2 + 0.5 = 2.5 s; 0.32 rad < 0.5 rad, √(2 × 0.32) = 0.8 rad/s, 0.8 s; FR3 2.62 rad/s, 10 rad/s²,
// 90° = 1.571 rad, 2.62 ÷ 10 = 0.262 s, ≈ 0.86 s; check 0.18 rad → √0.36 = 0.6 rad/s, 0.3 s, 0.6 s); S-curve (5000 rad/s³
// libfranka; j_max 10 rad/s³, 2 ÷ 10 = 0.2 s, 0.2 + 0.5 = 0.7 s, 1.3 s, 2.7 s, seven segments; Ruckig 19.8 µs mean,
// 123 µs worst, 1 ms cycle); cubic / quintic (0° → 90° in 1 s: 4 vs 6 conditions, 135 vs 168.75 °/s, 540 °/s² vs 0,
// 519.6 °/s²; 1.875 × 2 ÷ T ≤ 1 → T ≥ 3.75 s vs 2.5 s); spline (0 → 1 → 1.5 rad at 0, 1, 2 s; min-jerk 1.875 rad/s;
// 0 + 4v1 + 0 = 3 × 1.5, v1 = 1.125 rad/s, −1.5 rad/s², 1.34 rad/s; 3.75 rad/s²; 0 → 1 → 0.5 rad, 0.375 rad/s, ≈ 1.02 rad);
// synchronization (J1 2 rad 1 rad/s 2 rad/s² 2.5 s, J2 1.2 rad 0.4 rad/s 1 rad/s² 3.4 s, J3 0.5 rad 1.0 s; 0.4 / 2.6 /
// 0.4 s, 2 ÷ (3.4 − 0.4) = 0.67, 0.5 ÷ 3.0 = 0.17 rad/s; check 1.5 s and 1.7 s); TOPP (A (0, 0) → B (1, 0) → C (1, 1),
// 1.5 s + 1.5 s = 3.0 s, δ 0.1 rad, r 0.24 rad, path speed ≤ 1 and ≤ 0.7 rad/s, 2.59 s, 0.41 s faster, 3000 steps;
// TOPP-RA N = 500, 30 inequalities, 29.8 ms vs 455.3 ms); MoveIt 2 (path_tolerance 0.1, resample_dt 0.1,
// min_angle_change 0.001; scaling default 0.1, migration 0.2 ~ 0.6; 2 rad: 2.5 / 4.5 / 20.05 / 6.32 / 20.5 s, 0.32 rad:
// 0.8 / 1.14 s; 1.8× and 1.43×; check 1 rad at 0.5 / 0.5: 1 ÷ 0.5 + 0.5 ÷ 1 = 2.5 s vs 1.5 s, 1.67×).

const S1 = 'path 와 Cartesian'
const S2 = 'profile 과 다항식'
const S3 = 'spline 과 동기화'
const S4 = 'TOPP 와 MoveIt 2'

export const script: VideoScript = {
  id: 'trajectory-generation',
  title: 'Trajectory Generation',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/trajectory-generation',
  sections: [S1, S2, S3, S4],
  terms: [
    ['AddTimeOptimalParameterization', '애드 타임 옵티멀 파라미터라이제이션'],
    ['Trajectory Generation', '트라젝토리 제너레이션'],
    ['trajectory generation', '트라젝토리 제너레이션'],
    ['Setup Assistant', '셋업 어시스턴트'],
    ['response adapter', '리스폰스 어댑터'],
    ['joint_limits.yaml', '조인트 리미츠 야믈'],
    ['scaling factor', '스케일링 팩터'],
    ['MoveIt 2', '무브잇 투'],
    ['joint 1', '조인트 원'],
    ['scaling', '스케일링'],
    ['adapter', '어댑터'],
    ['Motion Planning', '모션 플래닝'],
    ['path_tolerance', '패스 톨러런스'],
    ['minimum-jerk', '미니멈 저크'],
    ['phase plane', '페이즈 플레인'],
    ['joint space', '조인트 스페이스'],
    ['cubic spline', '큐빅 스플라인'],
    ['elbow-down', '엘보 다운'],
    ['elbow-up', '엘보 업'],
    ['ros2_control', '로스 투 컨트롤'],
    ['singularity', '싱귤래리티'],
    ['trajectory', '트라젝토리'],
    ['controller', '컨트롤러'],
    ['Cartesian', '카테시안'],
    ['migration', '마이그레이션'],
    ['eef_step', '이이에프 스텝'],
    ['TOPP-RA', '티오피피 알에이'],
    ['S-curve', '에스 커브'],
    ['planner', '플래너'],
    ['profile', '프로파일'],
    ['quintic', '퀸틱'],
    ['MoveIt', '무브잇'],
    ['spline', '스플라인'],
    ['torque', '토크'],
    ['rad/s²', '라디안 매 초 제곱'],
    ['rad/s³', '라디안 매 초 세제곱'],
    ['rad/s', '라디안 매 초'],
    ['°/s²', '도 매 초 제곱'],
    ['°/s', '도 매 초'],
    ['m/s', '미터 매 초'],
    ['waypoint', '웨이포인트'],
    ['v_max', '브이 맥스'],
    ['a_max', '에이 맥스'],
    ['j_max', '제이 맥스'],
    ['cubic', '큐빅'],
    ['joint', '조인트'],
    ['motor', '모터'],
    ['jerk', '저크'],
    ['path', '패스'],
    ['TOTG', '티오티지'],
    ['TOPP', '티오피피'],
    ['FR3', '에프알 쓰리'],
    ['rad', '라디안'],
    ['IK', '아이케이'],
    ['J1', '제이 원'],
    ['J2', '제이 투'],
    ['J3', '제이 쓰리'],
    ['δ', '델타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Trajectory Generation 은 planner 가 낸 자세의 목록에 시각을 붙여, 관절 한계 안에서 움직이게 하는 계산입니다.'],
        [4.2, 7.8, 'path 와 Cartesian 보간, 속도 profile 과 다항식, spline 과 동기화, TOPP 와 MoveIt 2 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'MoveIt 2 의 planner 가 돌려주는 자세의 목록에는 언제 어느 자세에 있어야 하는지가 적혀 있지 않습니다.'],
        [4.4, 7.8, '모든 관절이 한계를 지키며 같은 순간에 도착하고 가장 빨리 끝나려면, 자세마다 시각을 어떻게 붙일까요?'],
      ],
    },
    {
      id: 'path-traj',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'path 는 지나갈 자세를 이은 선이라 시간 정보가 없고, 진행률 s 하나로 위치가 정해지는 q(s) 로 적습니다.', 'path 는 지나갈 자세를 이은 선이라 시간 정보가 없고, 진행률 s 하나로 위치가 정해지는 큐 에스 로 적습니다.'],
        [6.5, 13, 'trajectory 는 시각 t 마다 어느 자세에 있을지 정한 것이고, s(t) 를 정하면 q(s(t)) 로 trajectory 가 됩니다.', 'trajectory 는 시각 t 마다 어느 자세에 있을지 정한 것이고, 에스 티 를 정하면 큐 에스 티 로 trajectory 가 됩니다.'],
        [13, 19.5, '그림의 path 는 두 관절을 (0, 0) 에서 (2, 1) rad 으로 곧게 옮기고, 0.25 초마다 찍은 점은 양 끝에서 촘촘합니다.', '그림의 path 는 두 관절을 영 영 에서 이 일 rad 으로 곧게 옮기고, 0.25 초마다 찍은 점은 양 끝에서 촘촘합니다.'],
        [19.5, 25.7, '같은 path 를 2.5 초에도 4.5 초에도 지날 수 있고, trajectory generation 은 얼마나 빨리 지날지만 정합니다.'],
      ],
    },
    {
      id: 'cartesian',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'joint space 보간은 관절 각도를 같은 진행률로 움직여 계산이 쉽지만, 손끝은 휘어진 길을 갑니다.'],
        [7, 14, 'Cartesian 보간은 손끝의 곧은 선을 eef_step 0.01 m 간격으로 나누고, 나눈 점마다 IK 를 풉니다.'],
        [14, 21, '중간 점에 IK 해가 없으면 거기서 멈추고, 이웃한 해가 elbow-up 과 elbow-down 으로 바뀌면 관절이 크게 뜁니다.'],
        [21, 27.7, '손목이 0.1 m/s 로 joint 1 축에서 0.02 m 옆을 지나면 v ÷ d 로 5 rad/s 라서 FR3 한계 2.62 를 넘습니다.', '손목이 0.1 m/s 로 joint 1 축에서 0.02 m 옆을 지나면 브이 나누기 디 로 5 rad/s 라서 FR3 한계 2.62 를 넘습니다.'],
      ],
    },
    {
      id: 'pause-cart',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 손목이 0.2 m/s 로 joint 1 축에서 0.05 m 떨어진 선을 지나면, 한계 2.62 rad/s 안일까요?'],
        [16.5, 23.5, '0.2 ÷ 0.05 로 4 rad/s 라서 넘습니다. 속도를 약 0.13 m/s 아래로 줄이거나 선을 약 0.076 m 보다 멀리 옮깁니다.'],
      ],
    },
    {
      id: 'trapezoid',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '관절 하나를 가장 빨리 옮기려면 최대 가속도로 속도를 올리고, 최고 속도로 가다가, 최대 가속도로 줄여 멈춥니다.'],
        [6.5, 13, 'v_max 1 rad/s, a_max 2 rad/s² 으로 2 rad 을 옮기면 가속 0.5 초, 등속 1.5 초, 감속 0.5 초입니다.'],
        [13, 19.5, '전체 시간은 T = d ÷ v_max + v_max ÷ a_max 라서 2 + 0.5 = 2.5 초이고, 넓이가 각도입니다.', '전체 시간은 티 는 디 나누기 v_max 더하기 v_max 나누기 a_max 라서 2 더하기 0.5 는 2.5 초이고, 넓이가 각도입니다.'],
        [19.5, 25.5, '0.32 rad 만 옮기면 0.5 rad 보다 짧아 최고 속도에 못 닿고, 꼭짓점 0.8 rad/s 의 삼각형으로 0.8 초가 걸립니다.'],
        [25.5, 31.7, 'FR3 joint 1 의 한계로 90° 를 돌리면 1.571 ÷ 2.62 + 0.262 로 약 0.86 초가 걸립니다.', 'FR3 joint 1 의 한계로 90° 를 돌리면 1.571 ÷ 2.62 더하기 0.262 로 약 0.86 초가 걸립니다.'],
      ],
    },
    {
      id: 'scurve-poly',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '사다리꼴은 가속도가 계단처럼 바뀌어 jerk 가 무한대이고, torque 가 계단처럼 바뀌면 팔 끝에 진동이 남습니다.'],
        [6.5, 13, 'jerk 를 10 rad/s³ 으로 제한한 S-curve 는 가속도가 0.2 초 동안 기울게 바뀌어, 2 rad 이동이 2.7 초가 됩니다.'],
        [13, 19.5, '늘어난 시간은 a_max ÷ j_max 인 0.2 초뿐이라서, jerk 를 제한해도 이동 시간은 크게 늘지 않습니다.'],
        [19.5, 25.5, '시간을 정해 두면 다항식을 쓰는데, cubic 은 위치·속도 넷을 맞추고 quintic 은 가속도까지 여섯을 맞춥니다.'],
        [25.5, 31.7, '0° 에서 90° 로 1 초에 가면 cubic 은 출발 순간 가속도가 540 °/s² 으로 뛰고, quintic 은 0 에서 시작합니다.'],
      ],
    },
    {
      id: 'pause-tri',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 관절을 0.18 rad 만 옮기면 profile 모양과 걸리는 시간은 어떻게 될까요?'],
        [16.5, 23.5, '0.5 rad 보다 짧아 삼각형입니다. 꼭짓점 속도는 √0.36 인 0.6 rad/s 이고, 0.3 초 가속의 두 배인 0.6 초가 걸립니다.', '0.5 rad 보다 짧아 삼각형입니다. 꼭짓점 속도는 루트 0.36 인 0.6 rad/s 이고, 0.3 초 가속의 두 배인 0.6 초가 걸립니다.'],
      ],
    },
    {
      id: 'spline',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'path 에는 waypoint 가 여럿입니다. 관절 하나가 0 → 1 → 1.5 rad 을 시각 0, 1, 2 초에 지나는 경우를 봅니다.'],
        [6.5, 13, '구간마다 minimum-jerk 로 멈췄다 가면 가운데에서 속도가 0 이라서, 첫 구간에 최고 1.875 rad/s 가 필요합니다.'],
        [13, 19.5, 'cubic spline 은 가운데를 1.125 rad/s 로 지나며 양쪽 가속도를 맞추고, 최고 각속도는 1.34 rad/s 로 내려갑니다.'],
        [19.5, 25.7, '0 → 1 → 0.5 rad 에서는 약 1.02 rad 까지 넘쳐 오르고, waypoint 를 지날 시각을 미리 알아야 계산할 수 있습니다.'],
      ],
    },
    {
      id: 'sync',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '관절마다 따로 사다리꼴을 만들면 도착 시각이 J1 2.5 초, J2 3.4 초, J3 1.0 초로 제각각입니다.'],
        [6, 12, '가장 많이 움직이는 J1 이 아니라, 최고 속도가 0.4 rad/s 로 낮은 J2 가 1.2 rad 을 가느라 가장 느립니다.'],
        [12, 18, '제각각 움직이면 J3 가 먼저 멈춰 곧은 path 가 꺾이고, planner 가 충돌 검사하지 않은 자세를 지나게 됩니다.'],
        [18, 24, '그래서 모든 관절을 J2 의 3.4 초에 맞춰 0.4 초 가속, 2.6 초 등속, 0.4 초 감속하고 등속 각속도만 줄입니다.'],
        [24, 29.7, '등속 각속도는 J1 이 2 ÷ 3.0 으로 0.67 rad/s 이고 J3 가 0.17 rad/s 라서, 진행률이 매 순간 같습니다.'],
      ],
    },
    {
      id: 'pause-sync',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 화면의 두 관절을 사다리꼴로 옮기며 동기화하면 전체 시간은 몇 초가 될까요?'],
        [16.5, 23.5, 'J1 은 1 ÷ 1 + 1 ÷ 2 로 1.5 초이고 J2 는 0.6 ÷ 0.5 + 0.5 ÷ 1 로 1.7 초라서 1.7 초입니다.', 'J1 은 1 ÷ 1 더하기 1 ÷ 2 로 1.5 초이고 J2 는 0.6 ÷ 0.5 더하기 0.5 ÷ 1 로 1.7 초라서 1.7 초입니다.'],
      ],
    },
    {
      id: 'topp',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '한계를 지키며 path 를 가장 빨리 지나는 s(t) 를 찾는 문제가 TOPP 이고, 꺾인 path 는 꺾인 점에서 멈춰야 합니다.', '한계를 지키며 path 를 가장 빨리 지나는 에스 티 를 찾는 문제가 TOPP 이고, 꺾인 path 는 꺾인 점에서 멈춰야 합니다.'],
        [6.5, 13, '두 관절이 A → B → C 로 90° 꺾이는 path 를 B 에서 멈추며 가면, 1 rad 사다리꼴 두 개로 3.0 초가 걸립니다.'],
        [13, 19.5, 'TOTG 는 모서리를 원호로 깎는데, δ 가 0.1 rad 이면 반지름 0.24 rad 의 원호가 B 의 0.1 rad 안쪽을 돕니다.'],
        [19.5, 25.5, 'phase plane 에서 path 속도는 곧은 구간에서 1 rad/s 이하이고, 원호 입구에서는 가속도 한계로 0.7 rad/s 이하입니다.'],
        [25.5, 31.7, '한계를 따라 최대로 가속하고 감속하면 2.59 초로 0.41 초 빠릅니다. TOPP-RA 는 500 칸 문제를 29.8 ms 에 풉니다.'],
      ],
    },
    {
      id: 'moveit',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, 'MoveIt 2 에서는 AddTimeOptimalParameterization 이라는 adapter 가 TOTG 로 시각을 붙입니다.'],
        [6.5, 13, '결과는 path_tolerance 0.1 만큼 벗어날 수 있고, joint_limits.yaml 에 가속도 한계가 없으면 실패합니다.'],
        [13, 19.5, 'TOTG 는 한계에 scaling factor 를 곱해 쓰는데, Setup Assistant 기본값이 0.1 이라 처음 띄운 팔이 느립니다.'],
        [19.5, 25.5, '둘 다 0.1 이면 2 rad 이동이 2.5 초에서 20.5 초가 되고, migration 문서는 0.2 ~ 0.6 사이를 권합니다.', '둘 다 0.1 이면 2 rad 이동이 2.5 초에서 20.5 초가 되고, migration 문서는 0.2 에서 0.6 사이를 권합니다.'],
        [25.5, 31.7, '둘 다 0.5 로 주면 2 rad 이동은 4.5 초로 1.8 배가 되는데, T 의 첫 항 d ÷ v_max 만 두 배가 되기 때문입니다.', '둘 다 0.5 로 주면 2 rad 이동은 4.5 초로 1.8 배가 되는데, 티 의 첫 항 디 나누기 v_max 만 두 배가 되기 때문입니다.'],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 앞의 관절을 1 rad 옮길 때 scaling factor 를 둘 다 0.5 로 주면 몇 초가 걸릴까요?'],
        [16.5, 23.5, '한계가 0.5 와 1 로 줄어 1 ÷ 0.5 + 0.5 ÷ 1 = 2.5 초이고, 원래 1.5 초보다 1.67 배 깁니다.', '한계가 0.5 와 1 로 줄어 1 ÷ 0.5 더하기 0.5 ÷ 1 은 2.5 초이고, 원래 1.5 초보다 1.67 배 깁니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. path 는 시간이 없는 선이고, Cartesian 직선은 IK 실패와 jump, singularity 근처 급가속을 겪습니다.', '답입니다. path 는 시간이 없는 선이고, Cartesian 직선은 아이케이 실패와 점프, singularity 근처 급가속을 겪습니다.'],
        [4.2, 8.2, '사다리꼴은 한계를 꽉 채워 가장 빠르지만 jerk 가 무한대이고, S-curve 는 a_max ÷ j_max 만큼만 길어집니다.'],
        [8.2, 12.2, '관절이 여럿이면 가장 느린 관절이 시간을 정하고, 나머지를 거기에 맞춰야 path 가 곧은 선 그대로 남습니다.'],
        [12.2, 15.7, 'TOTG 와 TOPP-RA 는 phase plane 에서 가장 빠른 s(t) 를 찾고, MoveIt 2 는 scaling 한 한계를 씁니다.', 'TOTG 와 TOPP-RA 는 phase plane 에서 가장 빠른 에스 티 를 찾고, MoveIt 2 는 scaling 한 한계를 씁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, 'path 를 찾는 방법은 Motion Planning 에서 다루고, motor 명령으로 바꾸는 과정은 ros2_control 에서 다룹니다.'],
      ],
    },
  ],
}
