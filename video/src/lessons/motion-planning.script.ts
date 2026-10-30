import type { VideoScript } from '../script.ts'

// Numbers follow lessons/motion-planning/README.md: the shelf and cup with a 7-joint arm; the 2-joint example (link 1 m,
// pillars of radius 0.3 m, S (−60°, 30°), G (100°, 40°), straight line √(160² + 10²) = 160.3° through the band while joint
// 1 passes 5° ~ 35°; joint 1 at 31° → joint 2 −49° ~ 49°, 0° → 46° ~ 97°, 60° → −96° ~ −42°; 2° cells 32,400, 3,987 of
// them, 3987 ÷ 32400 = 12.3%); the grid (36 cells of 10° a joint, 36 × 36 = 1,296, 46,656, 약 21.8억, 약 784억; 1 bit a
// cell 162 byte, 5.8 KB, 272 MB, 9.8 GB; 0.8 m link, 0.8 × 0.1745 = 0.14 m, 10 cm object; Panda at 1° cells 14.5 PB; check
// question 18 cells of 20°, 2⁶ = 64, 18⁶ = 3400만, 0.28 m); collision checking (943 checks for one RRT-Connect path, 5,773
// for one PRM roadmap; Panda visual mesh 134,924 vs collision mesh 2,364 triangles, 약 57 분의 1, link0 20,483 vs 200;
// FCL's seven primitives; ACM: 11 links, 11 × 10 ÷ 2 = 55 pairs, Adjacent 10, Never 23, Default 1, 21 checked, 2.6 분의
// 1); padding (default_robot_padding and default_object_padding 0.0; 0 / 0.05 / 0.1 / 0.11 m → 12.3 / 17.3 / 21.3 /
// 23.0%, no path at 0.11 m; √(1.25² + 0.75²) = 1.458 m, 1.458 − 0.3 − 0.05 − 1 = 0.108 m; check question 1.3 m, 0.15 m,
// 1.3 − 0.15 − 0.05 − 1 = 0.1 m); PRM (Kavraki et al. 1996; 60 poses, 6 nearest, 197 of 228 pairs, path of 6 vertices,
// 316.1°); RRT step (q_near (0°, 20°), q_rand (80°, 80°), direction (80, 60), √(80² + 60²) = 100, ε = 15°,
// (0, 20) + (80, 60) × 15 ÷ 100 = (12°, 29°); goal bias 0.05 = 1 in 20; check question (10°, 10°), (40°, 50°), ε = 10°,
// (30, 40), 50, (6, 8), (16°, 18°)); RRT-Connect (Kuffner & LaValle 2000; ε = 15°, 144 iterations, trees of 41 and 44,
// path of 33 vertices, 451.2°); shortcut (100 tries, 5 vertices, 370.7°); RRT* (500 → 347.1°, 1,500 → 268.6°, 3,000 →
// 252.1°; 2° grid shortest 약 240°); MoveIt 2 (default RRTConnect, MoveGroupInterface 5 s and 1 attempt); cuRobo
// (MotionBenchMaker and MπNets, 2,600 problems, RTX 4090, mean 50 ms vs Tesseract 2.95 s, success 99.8% vs 98.53%, 98th
// percentile 260 ms vs 22 s, 12 seeds in most environments).

const S1 = 'C-space 와 grid'
const S2 = 'collision checking'
const S3 = 'PRM · RRT 계열'
const S4 = 'MoveIt 2 pipeline'

export const script: VideoScript = {
  id: 'motion-planning',
  title: 'Motion Planning',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/motion-planning',
  sections: [S1, S2, S3, S4],
  terms: [
    ['probabilistic completeness', '프라버빌리스틱 컴플리트니스'],
    ['time parameterization', '타임 파라미터라이제이션'],
    ['FollowJointTrajectory', '팔로우 조인트 트래젝토리'],
    ['MoveGroupInterface', '무브 그룹 인터페이스'],
    ['collision checking', '콜리전 체킹'],
    ['collision checker', '콜리전 체커'],
    ['response adapter', '리스폰스 어댑터'],
    ['request adapter', '리퀘스트 어댑터'],
    ['collision mesh', '콜리전 메시'],
    ['Motion Planning', '모션 플래닝'],
    ['configuration', '컨피규레이션'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['planning scene', '플래닝 신'],
    ['ros2_control', '로스 투 컨트롤'],
    ['visual mesh', '비주얼 메시'],
    ['RRT-Connect', '알알티 커넥트'],
    ['C-obstacle', '씨 옵스터클'],
    ['RRTConnect', '알알티 커넥트'],
    ['move_group', '무브 그룹'],
    ['planner_id', '플래너 아이디'],
    ['trajectory', '트래젝토리'],
    ['controller', '컨트롤러'],
    ['Tesseract', '테서랙트'],
    ['primitive', '프리미티브'],
    ['goal bias', '골 바이어스'],
    ['MoveIt 2', '무브잇 투'],
    ['pipeline', '파이프라인'],
    ['planning', '플래닝'],
    ['shortcut', '숏컷'],
    ['gradient', '그래디언트'],
    ['C-space', '씨 스페이스'],
    ['roadmap', '로드맵'],
    ['capsule', '캡슐'],
    ['padding', '패딩'],
    ['planner', '플래너'],
    ['q_rand', '큐 랜드'],
    ['q_near', '큐 니어'],
    ['rewire', '리와이어'],
    ['cuRobo', '큐로보'],
    ['action', '액션'],
    ['q_new', '큐 뉴'],
    ['Panda', '판다'],
    ['noise', '노이즈'],
    ['STOMP', '스톰프'],
    ['CHOMP', '촘프'],
    ['ROS 2', '로스 투'],
    ['query', '쿼리'],
    ['Pilz', '필츠'],
    ['CIRC', '써크'],
    ['RRT*', '알알티 스타'],
    ['grid', '그리드'],
    ['link', '링크'],
    ['tree', '트리'],
    ['edge', '엣지'],
    ['node', '노드'],
    ['OMPL', '오엠피엘'],
    ['mesh', '메시'],
    ['bit', '비트'],
    ['FCL', '에프씨엘'],
    ['ACM', '에이씨엠'],
    ['PRM', '피알엠'],
    ['RRT', '알알티'],
    ['GPU', '지피유'],
    ['CPU', '씨피유'],
    ['PTP', '피티피'],
    ['LIN', '린'],
    ['A*', '에이 스타'],
    ['TF', '티에프'],
    ['GB', '기가바이트'],
    ['motor', '모터'],
    ['cm', '센티미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Motion Planning 은 관절 각도의 공간에서 팔의 어느 부분도 부딪히지 않는 길을 찾는 일입니다.'],
        [4.2, 7.8, 'C-space 와 grid, collision checking, PRM 과 RRT 계열, MoveIt 2 의 pipeline 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '7 관절 팔을 선반 안쪽 컵까지 고르게 돌리면, 손은 도착해도 가는 도중에 팔꿈치가 선반 모서리를 칠 수 있습니다.'],
        [4.4, 7.8, '셀 수 없이 많은 각도 조합 가운데, 팔 전체가 선반에 닿지 않는 길을 어떻게 몇 초 안에 찾을까요?'],
      ],
    },
    {
      id: 'cspace',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.5, '관절 각도를 모은 묶음을 configuration 이라고 하고, 가능한 모든 자세의 공간을 C-space 라고 합니다.'],
        [5.5, 11, '2 관절 팔의 C-space 는 두 관절 각도를 축으로 한 평면이고, 그 위의 점 하나가 팔 전체의 자세 하나입니다.', '두 관절 팔의 C-space 는 두 관절 각도를 축으로 한 평면이고, 그 위의 점 하나가 팔 전체의 자세 하나입니다.'],
        [11, 16.5, 'link 길이 1 m 인 팔 옆에 반지름 0.3 m 기둥 두 개를 세우고, 팔이 닿는 자세를 칠하면 C-obstacle 입니다.'],
        [16.5, 22, '둥근 기둥은 C-space 에서 비스듬한 띠가 되고, 2° 간격으로 세면 두 띠가 전체의 12.3% 를 차지합니다.'],
        [22, 27.8, 'S 에서 G 로 두 관절을 같은 비율로 돌리면 160.3° 직선이 띠를 지나, 손끝이 아니라 link 몸통이 기둥을 칩니다.'],
      ],
    },
    {
      id: 'grid',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 6, '관절마다 10° 칸 36 개로 나누면 2 관절은 1,296 칸이라 A* 로 뒤져도 되지만, 관절 하나마다 칸이 36 배가 됩니다.', '관절마다 10° 칸 36 개로 나누면 두 관절은 1,296 칸이라 A* 로 뒤져도 되지만, 관절 하나마다 칸이 36 배가 됩니다.'],
        [6, 12, '6 관절은 약 21.8억 칸이고 7 관절은 약 784억 칸이라서, 칸마다 1 bit 만 적어도 9.8 GB 입니다.'],
        [12, 18, '10° 칸도 촘촘하지 않습니다. 0.8 m link 를 10° 돌리면 손끝이 0.14 m 움직여 10 cm 물체를 놓칠 수 있습니다.'],
        [18, 23.8, '그래서 planner 는 표를 만들지 않고, 필요한 자세만 골라 충돌하는지를 그때그때 collision checker 에 묻습니다.'],
      ],
    },
    {
      id: 'pause-grid',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 관절마다 20° 칸 18 개로 나누면, 6 관절 팔의 칸 수는 10° 칸일 때의 몇 분의 1 일까요?'],
        [16.5, 23.5, '관절마다 칸이 36 에서 18 로 절반이라 2 의 6 제곱, 64 분의 1 입니다. 대신 한 칸에 손끝이 0.28 m 움직입니다.'],
      ],
    },
    {
      id: 'collision',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6, '2 관절 예시의 충돌 검사는 RRT-Connect 경로 하나에 943 번이고, PRM roadmap 하나에 5,773 번입니다.', '두 관절 예시의 충돌 검사는 RRT-Connect 경로 하나에 943 번이고, PRM roadmap 하나에 5,773 번입니다.'],
        [6, 12.5, 'Panda 는 visual mesh 가 삼각형 134,924 개인데, collision mesh 는 2,364 개로 약 57 분의 1 입니다.'],
        [12.5, 19, 'capsule 같은 primitive 는 숫자 몇 개로 모양이 정해지고, MoveIt 2 의 기본 checker 인 FCL 이 다룹니다.', 'capsule 같은 primitive 는 숫자 몇 개로 모양이 정해지고, MoveIt 2 의 기본 체커 인 FCL 이 다룹니다.'],
        [19, 25.7, '자기 몸과의 충돌은 Panda 의 link 쌍 55 개 가운데 ACM 으로 34 쌍을 꺼서, 21 쌍만 검사합니다.'],
      ],
    },
    {
      id: 'padding',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 6, '오차에 대비해 모양을 사방으로 키우는 것이 padding 이고, MoveIt 2 의 기본값은 0.0 이라서 직접 정해야 합니다.'],
        [6, 12, '2 관절 예시에 padding 을 0.05 m, 0.1 m 로 주면 막힌 자세가 12.3% 에서 17.3%, 21.3% 로 늘어납니다.', '두 관절 예시에 padding 을 0.05 m, 0.1 m 로 주면 막힌 자세가 12.3% 에서 17.3%, 21.3% 로 늘어납니다.'],
        [12, 18, 'link 1 이 기둥 A 옆을 지나는 틈은 1.458 − 0.3 − 0.05 − 1 을 계산해 0.108 m 입니다.', '첫 번째 link 가 기둥 A 옆을 지나는 틈은 1.458 빼기 0.3 빼기 0.05 빼기 1 을 계산해 0.108 m 입니다.'],
        [18, 23.8, 'padding 이 0.11 m 면 C-space 가 둘로 끊겨 S 와 G 를 잇는 길이 사라지고, planner 는 실패를 돌려줍니다.'],
      ],
    },
    {
      id: 'pause-padding',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. link 는 1 m, 반지름 0.05 m 이고 기둥은 원점에서 1.3 m, 반지름 0.15 m 면 padding 한계는?'],
        [16.5, 23.5, '틈은 1.3 − 0.15 − 0.05 − 1 로 0.1 m 라서, padding 이 0.1 m 를 넘으면 link 끝이 기둥에 닿습니다.', '틈은 1.3 빼기 0.15 빼기 0.05 빼기 1 로 0.1 m 라서, padding 이 0.1 m 를 넘으면 link 끝이 기둥에 닿습니다.'],
      ],
    },
    {
      id: 'prm-rrt',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'PRM 은 충돌 없는 자세를 무작위로 뽑아 가까운 점끼리 이은 roadmap 을 만들고, S 와 G 만 붙여 길을 찾습니다.'],
        [6, 12, '자세 60 개를 가까운 6 개와 이으면 228 쌍 중 197 쌍이 이어지고, 경로는 꼭짓점 6 개, 316.1° 입니다.'],
        [12, 18, 'RRT 는 무작위 점 q_rand 에 가장 가까운 tree 의 점 q_near 에서 ε 만큼만 뻗어 q_new 를 붙입니다.'],
        [18, 24, 'q_near (0°, 20°) 에서 q_rand (80°, 80°) 까지는 길이 100 이라, 15° 를 가면 (12°, 29°) 입니다.'],
        [24, 29.8, '둘레가 빈 점일수록 가장 가까운 점으로 잘 뽑혀 tree 가 빈 곳으로 퍼지고, goal bias 0.05 로 목표를 섞습니다.'],
      ],
    },
    {
      id: 'connect',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'RRT-Connect 는 S 와 G 에서 tree 를 하나씩 키우고, 한쪽에 점이 붙으면 다른 쪽이 막힐 때까지 그 점으로 뻗습니다.'],
        [6.5, 12.5, '예시에서는 144 번 반복해 두 tree 가 만났고, 경로는 꼭짓점 33 개, 451.2° 로 띠 아래쪽을 크게 돌아갑니다.'],
        [12.5, 19, '표본이 늘수록 길을 찾을 확률이 1 에 다가가는 probabilistic completeness 는 있지만, 경로는 최적이 아닙니다.'],
        [19, 25.5, 'shortcut 을 100 번 시도하면 꼭짓점 5 개, 370.7° 로 줄지만, 띠를 넘지 못해 아래쪽 길에 머뭅니다.'],
        [25.5, 31.8, '싼 부모를 고르고 rewire 하는 RRT* 는 표본 500 개에 347.1°, 3,000 개에 252.1° 로 약 240° 에 다가갑니다.'],
      ],
    },
    {
      id: 'pause-rrt',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. q_near (10°, 10°), q_rand (40°, 50°), step 길이 ε 10° 이면 q_new 는 어디일까요?'],
        [16.5, 23.5, '방향 (30, 40) 의 길이는 50 이고, 10° 만 가므로 (6, 8) 을 더해 q_new 는 (16°, 18°) 입니다.'],
      ],
    },
    {
      id: 'moveit',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6, 'MoveIt 2 의 move_group node 는 planning 요청을 ROS 2 action 으로 받아서, 도중에 취소할 수도 있습니다.'],
        [6, 12.5, 'request adapter 는 시작 자세를 확인하고, 관절 범위를 벗어났거나 이미 충돌 중이면 planner 를 부르지 않습니다.'],
        [12.5, 19, 'response adapter 는 time parameterization 으로 시간을 붙이고 경로를 다시 검사합니다.'],
        [19, 25.8, '완성된 trajectory 는 FollowJointTrajectory action 으로 로봇 쪽 controller 에 가서 실행됩니다.'],
      ],
    },
    {
      id: 'planners',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'OMPL planner 는 같은 요청에도 매번 다른 길을 내서, MoveIt 2 에는 방식이 다른 planner 도 들어 있습니다.'],
        [6, 12, 'Pilz 는 PTP, LIN, CIRC 처럼 정해진 모양의 경로를 만들고, 장애물을 돌아가지 않아서 닿으면 실패합니다.'],
        [12, 18, 'CHOMP 는 초기 경로를 gradient 로 장애물 밖으로 밀어내고, STOMP 는 noise 를 더한 후보의 비용을 비교합니다.'],
        [18, 24, 'cuRobo 는 GPU 에서 경로 후보 여러 개를 동시에 최적화해, 문제 2,600 개에서 평균 50 ms 에 경로를 냈습니다.'],
        [24, 29.8, 'CPU 기반 Tesseract 는 평균 2.95 초가 걸렸고, 성공률은 cuRobo 99.8%, Tesseract 98.53% 였습니다.'],
      ],
    },
    {
      id: 'pause-default',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. planner_id 도 그룹의 기본 planner 설정도 비어 있으면, 어떤 planner 가 몇 초 안에 찾을까요?'],
        [16.5, 23.5, 'OMPL 의 RRTConnect 가 MoveGroupInterface 기본 planning 시간 5 초 안에 찾고, 시도 횟수는 1 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4, '답입니다. 자세 하나를 C-space 의 점 하나로 보고, 7 관절의 약 784억 칸 대신 필요한 자세만 뽑아 묻습니다.'],
        [4, 8, 'collision checking 은 단순한 모양과 ACM 으로 가볍게 하고, padding 은 틈보다 작게 둡니다.'],
        [8, 12, 'RRT-Connect 는 두 tree 를 마주 키워 빨리 길을 찾고, 경로는 shortcut 이나 RRT* 로 줄입니다.'],
        [12, 15.8, 'MoveIt 2 는 RRTConnect 가 찾은 경로에 시간을 붙여 trajectory 로 만들고, controller 에 보냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, 'trajectory 가 motor 명령이 되는 과정은 ros2_control, 물체를 잡는 자세는 Grasp Planning 에서 다룹니다.'],
      ],
    },
  ],
}
