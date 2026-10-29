import type { VideoScript } from '../script.ts'

// Numbers follow lessons/humanoid-wbc/README.md: joint counts 12 / 19 / 23 / 33 (A1 · H1 · G1 · HumanPlus robot), H1 약 180 cm ·
// 약 47 kg, G1 1,320 mm · 약 35 kg; the tipping-force table with 12 kg × 9.81 ≈ 117.7 N and 35 × 9.81 ≈ 343.4 N (d 0.2 / 0.1 /
// 0.05 m, heights 0.3 / 0.6 m → 78.5 / 57.2 / 28.6 N, 세 배 가까이 무거운데도); HumanPlus push 24 N → 32 N; the 2 kg box at
// 0.4 m: 2 × 0.4 ÷ (35 + 2) ≈ 0.022 m ≈ 2.2 cm = 22% of 10 cm, and its check (0.5 m → 1 ÷ 37 ≈ 0.027 m, 0.1 − 0.027 = 0.073 m);
// AMASS 346 명 · 11,451 동작 · 42 시간, SMPL β 10 · 24 × 3 · 6,890 꼭짓점; H2O's 12 keypoints; the clap example (0.18 m, 0.22 m,
// 0.75 → 0.135 / 0.085 / 0.17 m vs 0 m) and its check (0.6 → 0.108 / 0.112 / 0.224 m ≈ 22 cm); sim-to-data 약 13,000 → 약 10,000
// (77%) → 약 8,500 (65%), 72.5% vs 67.9% = 4.6%p, success = link 평균 거리 ≤ 0.5 m; DeepMimic's four terms (k 2 / 0.1 / 40 / 10,
// weight 0.65 / 0.1 / 0.15 / 0.1), the worked example 0.5881 / 0.0905 / 0.15 → 0.1005 → 0.0303 / 0.0991, reward 0.9277 / 0.8783 /
// 0.8080, phase 0 ~ 1, early termination 0.5 m (H2O) and 1.5 → 0.3 m (ASAP); OmniH2O teacher 913 inputs, student 90 + 25 × 63 =
// 1,665, success 94.77 / 94.10 / 47.11 / 90.62%, real robot 83.26 mm vs 47.94 mm (서 있는 동작 20 개), the check 405 / 3,240; H2O
// randomization 0.2 ~ 1.1, 0.7 ~ 1.3, 0.75 ~ 1.25, 20 ~ 60 ms; ASAP's ankle example (60%, 0.10 → 0.06, Δa = −0.04, 0.10 ÷ 0.6 ≈
// 0.167, −0.067, 0.167 × 0.6 ≈ 0.10), the 1 s replay errors 80.8 / 77.6 / 68.1 / 37.9 mm, real G1 61.2 → 50.2 mm and 159 → 112 mm,
// 400 → 100 recordings with 4 ankle joints; SONIC under GR00T N1.5: 64 token + 14 hand = 78, 29 joints, 50 / 500 a second, 500 ÷ 50
// = 10, 1 ~ 2 ms on Jetson Orin, token 68% vs SMPL 81 개 27%, hardest task 60% vs 0%, kinematic planner 10 a second; and the
// check 0.2 ÷ 0.02 = 10.

const S1 = '좁은 support polygon'
const S2 = 'retargeting 과 선별'
const S3 = 'reward 와 student'
const S4 = 'delta action 과 VLA'

export const script: VideoScript = {
  id: 'humanoid-wbc',
  title: 'Humanoid Whole-Body Control',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/humanoid-wbc',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Humanoid Whole-Body Control', '휴머노이드 홀 바디 컨트롤'],
    ['asymmetric actor-critic', '어시메트릭 액터 크리틱'],
    ['whole-body controller', '홀 바디 컨트롤러'],
    ['domain randomization', '도메인 랜더마이제이션'],
    ['privileged imitator', '프리빌리지드 이미테이터'],
    ['delta action model', '델타 액션 모델'],
    ['imitation reward', '이미테이션 리워드'],
    ['linear velocity', '리니어 벨로시티'],
    ['support polygon', '서포트 폴리곤'],
    ['motion tracking', '모션 트래킹'],
    ['command writer', '커맨드 라이터'],
    ['motion capture', '모션 캡처'],
    ['delta dynamics', '델타 다이나믹스'],
    ['PD controller', '피디 컨트롤러'],
    ['delta action', '델타 액션'],
    ['motion token', '모션 토큰'],
    ['Jetson Orin', '젯슨 오린'],
    ['GR00T N1.5', '그루트 엔 일 점 오'],
    ['World Model', '월드 모델'],
    ['fine-tuning', '파인 튜닝'],
    ['sim-to-data', '심 투 데이터'],
    ['retargeting', '리타게팅'],
    ['simulation', '시뮬레이션'],
    ['controller', '컨트롤러'],
    ['privileged', '프리빌리지드'],
    ['reference', '레퍼런스'],
    ['HumanPlus', '휴먼플러스'],
    ['DeepMimic', '딥미믹'],
    ['humanoid', '휴머노이드'],
    ['keypoint', '키포인트'],
    ['tracking', '트래킹'],
    ['OmniH2O', '옴니 에이치 투 오'],
    ['ExBody2', '엑스바디 투'],
    ['Unitree', '유니트리'],
    ['dataset', '데이터셋'],
    ['encoder', '인코더'],
    ['network', '네트워크'],
    ['student', '스튜던트'],
    ['teacher', '티처'],
    ['ExBody', '엑스바디'],
    ['reward', '리워드'],
    ['weight', '웨이트'],
    ['frame', '프레임'],
    ['token', '토큰'],
    ['mocap', '모캡'],
    ['SONIC', '소닉'],
    ['AMASS', '어매스'],
    ['SysID', '시스 아이디'],
    ['imitator', '이미테이터'],
    ['delta', '델타'],
    ['SMPL', '에스엠피엘'],
    ['ASAP', '에이셉'],
    ['link', '링크'],
    ['H2O', '에이치 투 오'],
    ['PPO', '피피오'],
    ['IMU', '아이엠유'],
    ['RSI', '알에스아이'],
    ['VLA', '브이엘에이'],
    ['VR', '브이알'],
    ['RL', '알엘'],
    ['PD', '피디'],
    ['G1', '지 원'],
    ['H1', '에이치 원'],
    ['A1', '에이 원'],
    ['Δa', '델타 에이'],
    ['rad', '라디안'],
    ['mm', '밀리미터'],
    ['cm', '센티미터'],
    ['kg', '킬로그램'],
    ['N', '뉴턴'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '이 강의는 사람의 motion capture 를 humanoid 관절로 옮겨 전신으로 따라 하게 하는 제어를 다룹니다.'],
        [4.2, 7.8, 'support polygon, retargeting 과 선별, reward 와 student, delta action 과 VLA 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '4족 policy 는 속도 명령 세 개로 관절 12 개를 움직이지만, 쪼그려 앉아 상자를 드는 자세는 속도로 적을 수 없습니다.'],
        [4.4, 7.8, '관절 23 개인 G1 이 사람 동작을 따라 하며 버티려면, policy 에 무엇을 목표로 주고 무엇으로 reward 를 줄까요?'],
      ],
    },
    {
      id: 'balance',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, '4족 A1 의 관절은 12 개지만 H1 은 19 개, G1 은 23 개, 손 달린 HumanPlus 로봇은 33 개입니다.'],
        [6.5, 13, '바닥에 닿은 점들을 감싼 영역이 support polygon 입니다. 무게중심을 수직으로 내린 점이 이 안에 있어야 버팁니다.'],
        [13, 20.5, '미는 힘 × 높이가 무게 × 가장자리 거리보다 크면 넘어집니다. 예로 든 12 kg 4족 로봇은 78.5 N 까지 버팁니다.'],
        [20.5, 27.8, '35 kg G1 은 두 발로 앞을 밀면 57.2 N, 한 발로 옆을 밀면 28.6 N 에 넘어갑니다. 더 무거운데 더 약합니다.'],
      ],
    },
    {
      id: 'arm',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 6, '무게중심이 높아 미는 힘의 지렛대가 길고, 발이 좁아 무게의 지렛대가 짧아서입니다. 그래서 발을 내디뎌 균형을 잡습니다.'],
        [6, 12, 'H1 의 골반을 밀자 기본 controller 는 24 N 에서 균형을 잃고, 학습한 policy 는 32 N 까지 버텼습니다.'],
        [
          12,
          18.5,
          'G1 이 약 2 kg 상자를 몸 앞 0.4 m 에 들면 무게중심은 2 × 0.4 ÷ 37 ≈ 0.022 m 앞으로 갑니다.',
          'G1 이 약 2 kg 상자를 몸 앞 0.4 m 에 들면 무게중심은 2 × 0.4 ÷ 37 로 약 0.022 m 앞으로 갑니다.',
        ],
        [18.5, 23.8, '약 2.2 cm 라서 앞쪽 여유 10 cm 의 22% 가 사라집니다. controller 는 상체와 하체를 함께 조율해야 합니다.'],
      ],
    },
    {
      id: 'pause-balance',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. G1 이 2 kg 상자를 몸 앞 0.5 m 에 들면 무게중심은 얼마나 가고, 여유 0.1 m 는 얼마나 남나요?'],
        [
          16.5,
          23.5,
          '2 × 0.5 ÷ 37 ≈ 0.027 m 옮겨 가고, 여유는 0.1 − 0.027 = 0.073 m, 약 7.3 cm 남습니다.',
          '2 × 0.5 ÷ 37 로 약 0.027 m 옮겨 가고, 여유는 0.1 빼기 0.027 로 0.073 m, 약 7.3 cm 남습니다.',
        ],
      ],
    },
    {
      id: 'retarget',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '사람 움직임은 motion capture 로 기록합니다. AMASS 는 346 명의 동작 11,451 개, 42 시간을 모았습니다.'],
        [6, 12, '사람과 로봇은 팔 길이도 관절 수도 달라서, 사람 동작을 로봇 관절 값으로 바꾸는 retargeting 이 필요합니다.'],
        [12, 18, '각도 복사는 사람 관절 각도를 로봇의 같은 관절에 넣고, keypoint 맞추기는 대응점 12 개가 가까워지는 각도를 찾습니다.'],
        [18, 24.5, '박수 예에서 사람 어깨 0.18 m, 로봇 어깨 0.22 m, 팔 0.75 배면 각도 복사의 손은 중심에서 0.085 m 떨어집니다.'],
        [
          24.5,
          29.8,
          '두 손 사이가 0.085 × 2 = 0.17 m 벌어져 박수가 허공을 칩니다. 위치 맞추기는 frame 마다 최적화가 듭니다.',
          '두 손 사이가 0.085 × 2 로 0.17 m 벌어져 박수가 허공을 칩니다. 위치 맞추기는 frame 마다 최적화가 듭니다.',
        ],
      ],
    },
    {
      id: 'filter',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'retargeting 한 동작에는 로봇이 못 하는 옆돌기도 섞여 있어서, H2O 는 sim-to-data 로 simulation 에서 거릅니다.'],
        [6.5, 13.5, '모든 link 상태를 받는 privileged imitator 를 먼저 학습하고, 이 상한 policy 가 실패한 동작을 지웁니다.'],
        [13.5, 20, '약 13,000 개가 규칙 필터 뒤 약 10,000 개, imitator 뒤 약 8,500 개로 줄어 처음의 65% 가 남았습니다.'],
        [
          20,
          27.8,
          '거른 데이터로 학습한 policy 는 72.5%, 전체로 학습한 policy 는 67.9% 로, 적은 데이터가 4.6%p 높았습니다.',
          '거른 데이터로 학습한 policy 는 72.5%, 전체로 학습한 policy 는 67.9% 로, 적은 데이터가 4.6 퍼센트포인트 높았습니다.',
        ],
      ],
    },
    {
      id: 'pause-retarget',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 박수 예에서 로봇 팔이 사람의 0.6 배라면, 각도를 복사했을 때 두 손 사이는 얼마나 떨어질까요?'],
        [
          16.5,
          23.5,
          '안쪽으로 0.18 × 0.6 = 0.108 m, 중심에서 0.22 − 0.108 = 0.112 m, 두 손 사이 0.224 m 입니다.',
          '안쪽으로 0.18 × 0.6 은 0.108 m, 중심에서 0.22 빼기 0.108 은 0.112 m, 두 손 사이 0.224 m 입니다.',
        ],
      ],
    },
    {
      id: 'reward',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'tracking policy 는 속도 명령 대신 reference 의 다음 frame 을 받습니다. DeepMimic 의 형식입니다.'],
        [
          6,
          12.5,
          'reward 는 항목마다 오차를 0 ~ 1 점수로 바꿔 weight 를 곱해 더합니다. 항목은 자세, 속도, 손발, 무게중심입니다.',
          'reward 는 항목마다 오차를 0 에서 1 점수로 바꿔 weight 를 곱해 더합니다. 항목은 자세, 속도, 손발, 무게중심입니다.',
        ],
        [12.5, 19, '손발 점수는 손 오차 0 이면 0.15, 10 cm 면 0.1005, 20 cm 면 0.0303 입니다. 오차 제곱의 지수 함수라서입니다.'],
        [19, 25, '오차가 두 배면 제곱은 네 배라서 점수가 3 분의 1 이하가 됩니다. 합은 0.9277, 0.8783, 0.8080 입니다.'],
        [25, 29.8, '몸통이 바닥에 닿으면 episode 를 끝내는 조기 종료와, 무작위 시점에서 시작하는 RSI 도 결과를 크게 바꿉니다.'],
      ],
    },
    {
      id: 'student',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '실제 로봇에는 IMU 와 encoder 뿐이라, simulation 과 달리 몸통의 linear velocity 를 재기 어렵습니다.'],
        [6, 12.5, 'OmniH2O 의 teacher 는 모든 link 상태 등 913 개 입력으로 PPO 학습하지만 로봇에는 못 올립니다.'],
        [12.5, 19, 'student 는 지금 상태 90 개와 25 step 이력을 합친 1,665 개를 받고, DAgger 로 teacher 를 따라 배웁니다.'],
        [19, 25, 'teacher 94.77%, student 94.10% 로 거의 같았고, 같은 입력을 PPO 로 바로 학습하면 47.11% 였습니다.'],
        [25, 29.8, '실제 로봇에서 서 있는 동작 20 개의 위치 오차는 이력 없이 83.26 mm, 25 step 이력으로 47.94 mm 였습니다.'],
      ],
    },
    {
      id: 'pause-student',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. student 가 이력을 5 step 만 받으면 입력은 몇 개이고, 50 step 이면 몇 개일까요?'],
        [
          16.5,
          23.5,
          '90 + 5 × 63 = 405 개, 90 + 50 × 63 = 3,240 개입니다. 저자들은 25 step 이 가장 좋다고 보았습니다.',
          '90 더하기 5 × 63 은 405 개, 90 더하기 50 × 63 은 3,240 개입니다. 저자들은 25 step 이 가장 좋다고 보았습니다.',
        ],
      ],
    },
    {
      id: 'delta',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'domain randomization 은 policy 를 조심스럽게 합니다. ASAP 은 실제 로봇 기록으로 simulation 을 고칩니다.'],
        [6.5, 13, 'action 에 더할 값을 배우는 delta action model 을 둡니다. 예의 발목은 명령의 60% 만 움직입니다.'],
        [
          13,
          19.5,
          'policy 가 0.10 을 내면 실제 발목은 0.06 만 움직이므로, Δa 는 0.06 − 0.10 = −0.04 를 배웁니다.',
          'policy 가 0.10 을 내면 실제 발목은 0.06 만 움직이므로, Δa 는 0.06 빼기 0.10 인 −0.04 를 배웁니다.',
        ],
        [
          19.5,
          25.5,
          'fine-tuning 한 policy 는 0.10 ÷ 0.6 ≈ 0.167 을 내고, 실제 발목은 0.167 × 0.6 ≈ 0.10 움직입니다.',
          'fine-tuning 한 policy 는 0.10 ÷ 0.6 인 약 0.167 을 내고, 실제 발목은 0.167 × 0.6 으로 약 0.10 움직입니다.',
        ],
        [25.5, 29.8, '1 초 재생 오차 80.8 mm 가 delta dynamics 로는 68.1 mm, delta action 으로는 37.9 mm 가 됐습니다.'],
      ],
    },
    {
      id: 'layers',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'VLA 가 손과 몸의 목표를 정하면, whole-body controller 가 1 초에 50 번 균형을 잡아 관절 목표를 냅니다.'],
        [6.5, 13.5, 'GR00T N1.5 가 숫자 64 개의 motion token 과 손 관절 14 개를 내면, SONIC 이 관절 29 개 목표로 바꿉니다.'],
        [
          13.5,
          20.5,
          'command writer 는 최신 목표를 1 초에 500 번 PD 로 보내므로, 목표 하나를 500 ÷ 50 = 10 번 보냅니다.',
          'command writer 는 최신 목표를 1 초에 500 번 PD 로 보내므로, 목표 하나를 500 ÷ 50 인 10 번 보냅니다.',
        ],
        [20.5, 27.8, '같은 VLA 에게 SMPL 자세 81 개 숫자를 직접 내게 하니, 세 작업 평균 성공률이 68% 에서 27% 로 떨어졌습니다.'],
      ],
    },
    {
      id: 'pause-wbc',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. command writer 는 목표 하나를 몇 번 보내고, 0.2 초 동안 controller 는 몇 번 계산할까요?'],
        [
          16.5,
          23.5,
          '500 ÷ 50 = 10 번이고, controller 한 번이 0.02 초라서 0.2 ÷ 0.02 = 10 번입니다.',
          '500 ÷ 50 은 10 번이고, controller 한 번이 0.02 초라서 0.2 ÷ 0.02 도 10 번입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. support polygon 이 좁아 35 kg G1 도 한 발로는 28.6 N 에 넘어가서 전신으로 균형을 잡습니다.'],
        [4.2, 8.1, '각도 복사 retargeting 은 손이 0.17 m 어긋나고, 못 하는 동작은 걸러 약 8,500 개를 남깁니다.'],
        [8.1, 12, 'reward 는 닮은 정도의 점수 합이고, student 는 1,665 개 입력으로 teacher 에 가까운 94.10% 입니다.'],
        [12, 15.8, 'delta action 은 오차를 80.8 에서 37.9 mm 로 줄이고, SONIC 은 VLA 아래서 1 초에 50 번 관절 목표를 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [
          0.4,
          6.6,
          '이 policy 는 작업 성공으로 reward 를 받지 않습니다. 다음은 VLA + RL 과 World Model 입니다.',
          '이 policy 는 작업 성공으로 reward 를 받지 않습니다. 다음은 VLA 플러스 RL 과 World Model 입니다.',
        ],
      ],
    },
  ],
}
