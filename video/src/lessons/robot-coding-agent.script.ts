import type { VideoScript } from '../script.ts'

// Numbers follow lessons/robot-coding-agent/README.md: RoboDojo's 42 tasks and the 22.5% → 46.9% jump (leaderboard, 20 Oct
// 2026), VPP2 32.3%; the harness (three 640×480 RGB views, ~60-line manual, move ≤ 0.20 m, 2 cm waypoints, cuRobo IK,
// 25 actions a second, 0.10 ÷ 0.02 = 5 segments); step limits 200 ~ 1900, push T 600 ÷ 25 = 24 s, a retest episode's
// 739 s for 26 s of robot time (≈ 28×); the ray example (0.60 m down, 0.40 m forward, block +15 mm → 0.585 → 0.390 vs
// 0.400 = 10 mm), push T's 0.780 vs 0.765 m, table_plane 0.7646 ~ 0.7656 m (1 mm) vs the manual's 0.74 m (25 mm); play
// Xylophone 22.9 mm → 2.7 mm (rays 0.7 mm apart, step 377 of 500); Depth Anything V2 41 / ~100 mm vs ~1 cm; 38.3 / 29.6 /
// 48.8 (8.7 points, 57 vs 23 layouts); viewing moves 3.6% / 0.7% of steps, 43% / 10% of episodes; the repair loop (10
// layouts of seed 0, ≤ 5 edits, 6.3 min median, 90% < 11 min, +118 / −6 lines, 769 rounds, 327 commands, ~78,000 lines);
// the push T repair (10 refusals, 3.2 / 12.5 / 13.6 mm, 20 × 20 = 400 mm², 100 ÷ 400 = 0.25 < 0.85, 100 × 4 = 400, 73
// tests, step 354 of 600, 10/10 vs 4/10); the official evaluation (hidden seed, 50 episodes, 81.0 / 55.3 / 34.5 / 32.0 /
// 31.5 → 46.9; VPP2 35.2 / 37.0; clutter 38.0 → 31.0 = 82%, 31 policies median 20%, VPP2 46.4 → 12.6 ≈ 27%; notes on 25
// tasks, 7 tasks with fixed geometry 3/70 → 0/10); the contact classes (92.5 / 50.0 / 40.0 / 33.3 / 8.3 / 7.5, 7 of 12
// at 0, gains +33 / +26 / +13, 2 ~ 3 mm a pixel, 30.1% vs 8.3%, failures 263 → 57 / 30 / 13%); and the lesson's check
// questions (1100 ÷ 25 = 44 s, 520 ÷ 25 = 20.8 s; 0.025 × 0.40 ÷ 0.60 ≈ 17 mm; 12.6 ÷ 46.4 ≈ 27%; 2 pixels = 4 ~ 6 mm).

const S1 = 'thin harness'
const S2 = 'ray · 평면 · 두 번째 view'
const S3 = '실패를 tool 로'
const S4 = '평가와 접촉의 경계'

export const script: VideoScript = {
  id: 'robot-coding-agent',
  title: 'Robot Coding Agent',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/robot-coding-agent',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Robot Coding Agent', '로봇 코딩 에이전트'],
    ['Depth Anything V2', '뎁스 애니씽 브이 투'],
    ['Tactile Sensing', '택타일 센싱'],
    ['optimizer agent', '옵티마이저 에이전트'],
    ['play Xylophone', '플레이 자일로폰'],
    ['Generalization', '제너럴라이제이션'],
    ['triangulation', '트라이앵귤레이션'],
    ['depth network', '뎁스 네트워크'],
    ['acting agent', '액팅 에이전트'],
    ['coding agent', '코딩 에이전트'],
    ['thin harness', '씬 하네스'],
    ['Long-Horizon', '롱 호라이즌'],
    ['calibration', '캘리브레이션'],
    ['GPT-6-Astra', '지피티 식스 아스트라'],
    ['interface.md', '인터페이스 점 엠디'],
    ['table_plane', '테이블 플레인'],
    ['plane sweep', '플레인 스윕'],
    ['hidden seed', '히든 시드'],
    ['leaderboard', '리더보드'],
    ['tic tac toe', '틱택토'],
    ['simulation', '시뮬레이션'],
    ['intrinsics', '인트린직스'],
    ['Precision', '프리시전'],
    ['cluttered', '클러터드'],
    ['container', '컨테이너'],
    ['simulator', '시뮬레이터'],
    ['interface', '인터페이스'],
    ['optimizer', '옵티마이저'],
    ['unit test', '유닛 테스트'],
    ['HexaShell', '헥사셸'],
    ['RoboDojo', '로보도조'],
    ['standard', '스탠더드'],
    ['waypoint', '웨이포인트'],
    ['geometry', '지오메트리'],
    ['harness', '하네스'],
    ['gripper', '그리퍼'],
    ['checker', '체커'],
    ['tool.py', '툴 점 파이'],
    ['network', '네트워크'],
    ['push T', '푸시 티'],
    ['status', '스테이터스'],
    ['rotate', '로테이트'],
    ['Memory', '메모리'],
    ['Python', '파이썬'],
    ['cuRobo', '큐로보'],
    ['Codex', '코덱스'],
    ['agent', '에이전트'],
    ['pixel', '픽셀'],
    ['depth', '뎁스'],
    ['point', '포인트'],
    ['grasp', '그래스프'],
    ['scale', '스케일'],
    ['round', '라운드'],
    ['VPP2', '브이피피 투'],
    ['robo', '로보'],
    ['move', '무브'],
    ['wait', '웨이트'],
    ['done', '던'],
    ['pose', '포즈'],
    ['seed', '시드'],
    ['note', '노트'],
    ['tool', '툴'],
    ['test', '테스트'],
    ['loop', '루프'],
    ['Open', '오픈'],
    ['home', '홈'],
    ['view', '뷰'],
    ['obs', '옵스'],
    ['TCP', '티씨피'],
    ['RGB', '알지비'],
    ['VLA', '브이엘에이'],
    ['ray', '레이'],
    ['IK', '아이케이'],
    ['RL', '알엘'],
    ['mm', '밀리미터'],
    ['cm', '센티미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'HexaShell 은 시연도 학습도 없이, coding agent 가 명령줄 하나로 로봇을 다루게 합니다.'],
        [4.2, 7.8, '결정하지 않는 harness, depth 없이 재는 위치, 실패를 tool 로 바꾸는 loop, 접촉의 경계를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '저장소의 coding agent 는 코드를 실행해 에러를 읽고 고치고, 고친 코드는 남습니다.'],
        [4.4, 7.8, '같은 방식으로 로봇을 다루게 하면, 시연이나 학습 없이 얼마나 잘하게 되고 어디서 막힐까요?'],
      ],
    },
    {
      id: 'harness',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.5, 'harness 는 agent 의 명령을 로봇에 실행해 주는 프로그램입니다. HexaShell 의 harness 는 결정하지 않습니다.'],
        [5.5, 11.5, 'acting agent 는 고치지 않은 Codex agent 이고, robo 실행 파일, obs 폴더, 60 줄 설명서만 받습니다.'],
        [11.5, 17, 'obs 폴더에는 카메라 세 대의 640×480 RGB 사진, calibration, TCP pose 와 관절 각도가 있고 depth 는 없습니다.'],
        [17, 22.5, '명령은 아홉 개입니다. move 는 축마다 최대 0.20 m 이고, obs 와 status 는 step 을 쓰지 않습니다.'],
        [22.5, 27.8, 'server 는 경로를 2 cm 간격으로 나눠 cuRobo 로 IK 를 풀고 1초에 25 번 action 을 보냅니다. 0.10 m 는 다섯 구간입니다.', '서버는 경로를 2 cm 간격으로 나눠 cuRobo 로 IK 를 풀고 1초에 25 번 action 을 보냅니다. 0.10 m 는 다섯 구간입니다.'],
      ],
    },
    {
      id: 'steps',
      seconds: 22,
      section: S1,
      cues: [
        [0.3, 5.8, 'step 한도는 작업마다 200 에서 1900 입니다. 1초에 25 번이므로 600 step 인 push T 는 24 초입니다.'],
        [5.8, 10.8, '사진 보기, 측정, 생각에는 step 이 들지 않고 실행한 action 만 셉니다.'],
        [10.8, 16.3, '대신 실제 시간은 깁니다. 다시 잰 episode 하나는 로봇 시간 26 초에 실제 739 초, 약 28 배였습니다.'],
        [16.3, 21.8, '원칙은 넷입니다. 결정하지 않고, container 에 simulator 가 없고, checker 만 판정하고, 설명서엔 interface 만 적습니다.'],
      ],
    },
    {
      id: 'pause-steps',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. step 한도 1100 인 tic tac toe 는 로봇 시간으로 몇 초이고, 520 step 을 기다렸다면 몇 초일까요?'],
        [16.5, 23.8, '1100 ÷ 25 는 44 초, 520 ÷ 25 는 20.8 초입니다. 한도의 절반 가까이를 기다렸습니다.', '1100 나누기 25 는 44 초, 520 나누기 25 는 20.8 초입니다. 한도의 절반 가까이를 기다렸습니다.'],
      ],
    },
    {
      id: 'ray',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 5, 'pixel 하나와 calibration 은 ray 하나를 정할 뿐입니다. tool 은 ray 에 조건을 하나 더 붙입니다.'],
        [5, 10.5, '첫째 조건은 높이를 아는 평면입니다. 카메라가 탁자보다 0.60 m 위에 있고, ray 가 0.60 m 내려갈 때 0.40 m 나아간다고 합시다.'],
        [10.5, 16.5, '그 점이 15 mm 높은 블록 윗면에 있으면 ray 는 앞으로 0.390 m 입니다. 탁자 높이를 쓰면 10 mm 밀립니다.'],
        [16.5, 22, '실제로 push T 에서 윗면 0.780 m 대신 탁자 0.765 m 를 쓰자 윤곽이 10 mm 밀렸고, episode 는 실패했습니다.'],
        [22, 29.5, '그래서 공용 tool table_plane 이 plane sweep 으로 탁자 높이를 먼저 잽니다. 세 쌍이 1 mm 안에서 맞았습니다.'],
      ],
    },
    {
      id: 'pause-ray',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 ray 에서 잰 높이 0.765 m 대신 설명서의 0.74 m 를 쓰면 위치는 얼마나 틀릴까요?'],
        [16.5, 23.8, '높이 오차 0.025 m 에 0.40 ÷ 0.60 을 곱하면 약 17 mm 입니다. grasp 에 필요한 1 cm 를 넘습니다.', '높이 오차 0.025 m 에 0.40 나누기 0.60 을 곱하면 약 17 mm 입니다. grasp 에 필요한 1 cm 를 넘습니다.'],
      ],
    },
    {
      id: 'two-view',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 5.5, '평면 위에 없는 점에는 두 번째 view 를 씁니다. 두 ray 가 가장 가까워지는 곳이 위치이고, 이것이 triangulation 입니다.'],
        [5.5, 11.5, 'play Xylophone 에서 말렛 머리를 머리 카메라 하나로 재자 22.9 mm 어긋났고, checker 는 하나도 세지 않았습니다.'],
        [11.5, 17, '손목 카메라의 ray 를 더하자 오차는 2.7 mm 였고, 500 step 중 377 번째에 성공했습니다.'],
        [17, 23, 'Depth Anything V2 는 scale 을 맞춰도 오차 중앙값이 머리 41 mm, 손목 약 100 mm 였습니다. grasp 에는 1 cm 가 필요합니다.'],
        [23, 28, '개발용 장면에서 triangulation 은 38.3 점, depth network 는 29.6 점, simulator 의 depth 는 48.8 점이었습니다.'],
        [28, 32, '두 번째 view 에는 비용이 듭니다. 보는 움직임이 step 의 3.6% 를 썼고, episode 의 43% 에 있었습니다.'],
      ],
    },
    {
      id: 'loop',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 5.5, '같은 모델의 agent 둘이 일을 나눕니다. acting agent 는 episode 를 실행하고, optimizer agent 는 tool 을 고칩니다.'],
        [5.5, 11, 'tool 은 tool.py 와 interface.md 가 든 폴더입니다. 사진과 팔 상태는 쓰지만 simulator 와 물체 pose 는 읽지 못합니다.'],
        [11, 17, 'loop 는 seed 0 의 장면 10 개를 씁니다. 실패하면 optimizer 가 기록과 사진, 코드를 읽고 tool 과 unit test 를 고칩니다.'],
        [17, 23, '배달 검사를 통과하면 같은 장면을 다시 시도합니다. 수정은 다섯 번까지이고, 열 번째 장면 뒤에 tool 을 고정합니다.'],
        [23, 29.5, '수리 한 번은 중앙값 6.3 분입니다. 전체 769 round 뒤에 명령 327 개, 약 78,000 줄의 Python 이 남았습니다.'],
      ],
    },
    {
      id: 'push-t',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6, 'push T 의 tool 은 두 view 의 넓이가 다르면 높이를 거부합니다. 10 번을 모두 거부하자 agent 는 탁자 높이 0.765 m 를 썼습니다.'],
        [6, 12, '첫 놓기는 3.2 mm 였지만 검사가 틀린 높이로 12.5 mm 라고 쟀고, 세 번 다시 놓다가 13.6 mm 에서 멈췄습니다.'],
        [12, 18.5, 'optimizer 는 에러 메시지에서 원인을 찾았습니다. 넓이를 1 mm 격자의 칸 수로 세서 먼 카메라에서는 작게 나왔습니다.'],
        [18.5, 24.5, '20 mm × 20 mm 면을 손목 카메라는 400 칸, 2 mm pixel 의 머리 카메라는 100 칸으로 셉니다. 비 0.25 는 하한 0.85 보다 작습니다.', '20 mm 곱하기 20 mm 면을 손목 카메라는 400 칸, 2 mm pixel 의 머리 카메라는 100 칸으로 셉니다. 비 0.25 는 하한 0.85 보다 작습니다.'],
        [24.5, 31.5, 'pixel 넓이의 합으로 바꾸자 100 × 4 는 400 으로 맞았습니다. test 73 개가 통과했고, 다음 시도는 354 번째 step 에 성공했습니다.', 'pixel 넓이의 합으로 바꾸자 100 곱하기 4 는 400 으로 맞았습니다. test 73 개가 통과했고, 다음 시도는 354 번째 step 에 성공했습니다.'],
      ],
    },
    {
      id: 'eval',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'tool 은 seed 0 의 장면 10 개로 만들었으므로, 공식 평가는 RoboDojo 팀이 hidden seed 에서 작업마다 50 episode 를 실행했습니다.'],
        [6, 12, 'Memory 81.0%, Open 55.3%, Generalization 34.5%, Precision 32.0%, Long-Horizon 31.5%, 평균 46.9% 입니다.'],
        [12, 17.5, 'Memory 와 Open 에서는 모두보다 높았고, Precision 과 Long-Horizon 에서는 VPP2 가 35.2% 와 37.0% 로 앞섰습니다.'],
        [17.5, 23, 'cluttered 판에서 HexaShell 은 38.0% 에서 31.0% 로 82% 를 지켰습니다. VPP2 는 46.4% 에서 12.6% 였습니다.'],
        [23, 29.5, 'optimizer 는 작업 25 개에서 checker 의 note 를 읽었고, 감사에서 작업 7 개의 고정 geometry 를 측정으로 바꾸자 0/10 이 됐습니다.', 'optimizer 는 작업 25 개에서 checker 의 note 를 읽었고, 감사에서 작업 7 개의 고정 geometry 를 측정으로 바꾸자 열 번 중 영 번이 됐습니다.'],
      ],
    },
    {
      id: 'pause-clutter',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. VPP2 는 standard 46.4%, cluttered 12.6% 입니다. 성공의 몇 % 를 지켰을까요?'],
        [16.5, 23.8, '12.6 ÷ 46.4 는 약 0.27, 27% 입니다. 82% 를 지킨 HexaShell 의 약 3 분의 1 입니다.', '12.6 나누기 46.4 는 약 0.27, 27% 입니다. 82% 를 지킨 HexaShell 의 약 3 분의 1 입니다.'],
      ],
    },
    {
      id: 'contact',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6, '다시 잰 성공률은 접촉으로 갈립니다. 밀기 92.5%, 단단한 물체 50.0%, 끼우기 8.3%, 관절 물체 7.5% 입니다.'],
        [6, 11.5, 'tool 없는 같은 모델보다 밀기 33 점, 기억 26 점, 단단한 물체 13 점 올랐습니다. geometry 로 계산할 수 있는 곳입니다.'],
        [11.5, 17.5, '끼우기는 몇 mm 안으로 맞춰야 하지만 머리 카메라 pixel 하나가 2 ~ 3 mm 입니다. simulator 의 depth 로는 30.1% 였습니다.', '끼우기는 몇 mm 안으로 맞춰야 하지만 머리 카메라 pixel 하나가 2 에서 3 mm 입니다. simulator 의 depth 로는 30.1% 였습니다.'],
        [17.5, 24, '실패 263 개 가운데 57% 는 step 을 거의 다 썼고, 30% 는 끝났다고 했지만 checker 가 실패로 판정했습니다.'],
        [24, 29, 'step 을 다 쓴 실패는 실행의 부족이고, 끝났다고 선언한 실패는 인식이나 작업 조건 이해의 부족입니다.'],
        [29, 32, '다음 단계로 저자들은 부품을 든 동안에도 계속 재고, 접촉 중에 동작을 고치는 tool 을 꼽았습니다.'],
      ],
    },
    {
      id: 'pause-pixel',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. pixel 하나가 2 ~ 3 mm 일 때 구멍 중심을 2 pixel 틀리면 오차는 얼마이고, 왜 문제일까요?', '멈추고 적어 보기. pixel 하나가 2 에서 3 mm 일 때 구멍 중심을 2 pixel 틀리면 오차는 얼마이고, 왜 문제일까요?'],
        [16.5, 23.8, '4 에서 6 mm 입니다. 끼우기는 몇 mm 안으로 맞춰야 하고, 손목 view 는 부품을 든 채 만들어야 합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 8, '답입니다. 결정하지 않는 harness 와 agent 가 남긴 tool 로 GPT-6-Astra 가 22.5% 에서 46.9% 로 올라 1 위가 됐습니다.'],
        [8, 15.5, '막히는 곳은 접촉입니다. 밀기 92.5% 에 끼우기 8.3% 였고, 로봇 시간 26 초에 실제 739 초가 걸렸습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '접촉 중에 정밀하게 움직이는 작업은 학습한 policy 가 앞섰습니다. 다음은 VLA + RL 과 Tactile Sensing 입니다.', '접촉 중에 정밀하게 움직이는 작업은 학습한 policy 가 앞섰습니다. 다음은 VLA 플러스 RL 과 Tactile Sensing 입니다.'],
      ],
    },
  ],
}
