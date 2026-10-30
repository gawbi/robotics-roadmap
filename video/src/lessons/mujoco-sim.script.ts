import type { VideoScript } from '../script.ts'

// Numbers follow lessons/mujoco-sim/README.md: intro (MuJoCo 2012; OpenAI 2018 Shadow hand, 약 100 년치 경험, 50 시간 정도;
// 0.1 mm 쯤 침투); step (Δt = 0.1 초, 1 m, 1 kg, 1 × 9.81 = 9.81 N, −9.81 m/s²; table 0 / 0.1 / 0.2 / 0.3 / 0.4 초, 높이 1 /
// 0.9019 / 0.7057 / 0.4114 / 0.0190 → −0.4715 m, 속도 0 / −0.981 / −1.962 / −2.943 / −3.924 → −4.905 m/s; 0.019 m, 47 cm;
// mjModel / mjData; SO-101 MuJoCo 3.13 step 약 3.2 µs, timestep 5 ms, 약 1560 배; 10 초 × 100 만 번, 10 × 10⁶ ÷ 86400 ≈ 116 일,
// 2 시간 미만); two-joint arm (0.5 m + 0.5 m, 1 kg 추 두 개; 1 × 0.5² + 1 × 1² = 1.25, 0.25 + 0.5 = 0.75 kg·m²; 1 ÷ 1.25 =
// 0.8, 1 ÷ 0.75 ≈ 1.33 rad/s²; τ = (1, 0) → α = (4, −8); M = [1.25 0.5; 0.5 0.25]; bent M 0.75 / 0.25 / 0.25 → (2, −2);
// gravity torque 9.81 × 0.5 + 9.81 × 1.0 = 14.715 N·m, 9.81 × 0.5 = 4.905 N·m, 늘어뜨리면 9.81 / 0; SO-101 6 × 6; check
// α1 = −0.4 α2, 0.05 α2 = 1 → 20, −8); MJCF (hinge 1, slide 1, ball 3, free 6 DOF; free nq 3 + 4 = 7, nv 3 + 3 = 6; SO-101 6 /
// 6; 1000 kg/m³, 0.1³ × 1000 = 1 kg; Menagerie 2022, timestep 0.002 → 0.005, Euler → implicitfast, iterations 100 → 10,
// pyramidal → elliptic, impratio 1 → 10; 19.9 mm); contact (k = 10000 N/m, 9.81 ÷ 10000 ≈ 0.001 m ≈ 1 mm; solref "0.02 1";
// MuJoCo 3.13 침투 0.02 / 0.01 / 0.005 초 → 0.108 / 0.061 / 0.043 mm, 10 g 0.108 mm); friction (μ = 1, 1 × 9.81 = 9.81 N;
// 5 N → 0, 9.81 N → 0, 12 N → 12 − 9.81 = 2.19 m/s²; 0.1 kg, 0.1 × 9.81 = 0.981 N, 0.6 N, 2 × 1 × 0.6 = 1.2 N, 2 × 0.6 × 0.6
// = 0.72 N; check μ = 0.5, 0.2 kg, 0.2 × 9.81 = 1.962 N); timestep (0.002 초 = 1 초에 500 step; k = 100 N/m, 1 cm, 1 kg;
// Δt 0.1: 0.01 / 0 / −0.01 / −0.01 / 0 / 0.01 m; Δt 0.3: 0.01 / −0.08 / 0.55 / −3.77 / 25.84 m; 2√(1 ÷ 100) = 0.2 초; table
// 100 / 10000 / 1000000 / 10000 N/m, 1 / 1 / 1 / 0.01 kg → 0.2 / 0.02 / 0.002 / 0.002 초; 5 / 2 / 0.5 ms → 200 / 500 / 2000
// step, 0.64 / 1.6 / 6.4 ms, 약 1560 / 625 / 156 배; check k = 400, 2√(1 ÷ 400) = 0.1 초, 400 × 0.0144 = 5.76 > 4); control
// (kp = 998.22 N·m/rad, kv = 2.731, forcerange ±2.94 N·m; 998.22 × 0.1 = 99.8 N·m; 2.94 ÷ 998.22 ≈ 0.00295 rad ≈ 0.17°;
// shoulder_lift 0.573 N·m; 0.573 ÷ 10 = 0.0573 rad ≈ 3.3°; 0.573 ÷ 998.22 ≈ 0.00057 rad ≈ 0.033°; PD + gravity compensation 0);
// sim-to-real (20%: 0.573 × 1.2 = 0.688, 0.688 − 0.573 = 0.115 N·m, 0.115 ÷ 10 = 0.0115 rad, 0.35 m, 0.35 × 0.0115 ≈ 0.004 m
// ≈ 4 mm; μ 1 vs 0.6; 1 rad/s, 20 ms, 1 × 0.02 = 0.02 rad ≈ 1.1°; Table 1: 0.95 ~ 1.05, 0.5 ~ 1.5, 0.7 ~ 1.3, 0.3 ~ 3.0,
// 0.75 ~ 1.5; 약 3 년치 (실제 약 1.5 시간) vs 100 년치; check 1 × 0.7 = 0.7, 1 × 1.3 = 1.3, 0.5 범위 밖).

const S1 = 'step 과 mass matrix'
const S2 = 'MJCF · 접촉 · 마찰'
const S3 = 'timestep 과 제어'
const S4 = 'sim-to-real gap'

export const script: VideoScript = {
  id: 'mujoco-sim',
  title: 'MuJoCo Simulation',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/mujoco-sim',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Force & Impedance Control', '포스 앤 임피던스 컨트롤'],
    ['Classical Pick & Place', '클래시컬 픽 앤 플레이스'],
    ['gravity compensation', '그래비티 컴펜세이션'],
    ['system identification', '시스템 아이덴티피케이션'],
    ['domain randomization', '도메인 랜더마이제이션'],
    ['equation of motion', '이퀘이션 오브 모션'],
    ['semi-implicit Euler', '세미 임플리싯 오일러'],
    ['position actuator', '포지션 액추에이터'],
    ['MuJoCo Simulation', '무조코 시뮬레이션'],
    ['sim-to-real gap', '심 투 리얼 갭'],
    ['physics engine', '피직스 엔진'],
    ['Teleop Dataset', '텔레옵 데이터셋'],
    ['randomization', '랜더마이제이션'],
    ['gravity torque', '그래비티 토크'],
    ['soft contact', '소프트 콘택트'],
    ['normal force', '노멀 포스'],
    ['mass matrix', '매스 매트릭스'],
    ['shoulder_lift', '숄더 리프트'],
    ['elliptic cone', '일립틱 콘'],
    ['implicitfast', '임플리싯 패스트'],
    ['Shadow hand', '섀도 핸드'],
    ['convex hull', '컨벡스 헐'],
    ['simulation', '시뮬레이션'],
    ['bias force', '바이어스 포스'],
    ['controller', '컨트롤러'],
    ['Menagerie', '머내저리'],
    ['free joint', '프리 조인트'],
    ['actuator', '액추에이터'],
    ['timestep', '타임스텝'],
    ['backlash', '백래시'],
    ['inertia', '이너셔'],
    ['physics', '피직스'],
    ['gravity', '그래비티'],
    ['damping', '댐핑'],
    ['mjModel', '엠제이 모델'],
    ['mjData', '엠제이 데이터'],
    ['solref', '솔레프'],
    ['MuJoCo', '무조코'],
    ['SO-101', '에스오 백일'],
    ['torque', '토크'],
    ['joint', '조인트'],
    ['hinge', '힌지'],
    ['slide', '슬라이드'],
    ['noise', '노이즈'],
    ['motor', '모터'],
    ['URDF', '유알디에프'],
    ['MJCF', '엠제이씨에프'],
    ['body', '바디'],
    ['geom', '지옴'],
    ['site', '사이트'],
    ['ball', '볼'],
    ['free', '프리'],
    ['tree', '트리'],
    ['XML', '엑스엠엘'],
    ['DOF', '디오에프'],
    ['gap', '갭'],
    ['PD', '피디'],
    ['kg/m³', '킬로그램 퍼 세제곱미터'],
    ['rad/s²', '라디안 퍼 초 제곱'],
    ['m/s²', '미터 퍼 초 제곱'],
    ['rad/s', '라디안 퍼 초'],
    ['N·m', '뉴턴 미터'],
    ['N/m', '뉴턴 퍼 미터'],
    ['rad', '라디안'],
    ['kg', '킬로그램'],
    ['mm', '밀리미터'],
    ['cm', '센티미터'],
    ['µs', '마이크로초'],
    ['Δt', '델타 티'],
    ['Kp', '케이피'],
    ['N', '뉴턴'],
    ['g', '그램'],
    ['μ', '뮤'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'MuJoCo 는 joint 들이 얽힌 equation of motion 을 step 마다 풀고, 닿은 곳은 용수철처럼 계산합니다.'],
        [4.2, 7.8, 'step 과 mass matrix, MJCF 와 접촉, timestep 과 제어, sim-to-real gap 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '바닥의 상자는 0.1 mm 쯤 파고들고, timestep 을 키우면 물체가 튀어 오르며, 집히던 큐브가 실제 팔에서 미끄러집니다.'],
        [4.4, 7.8, '컴퓨터는 매 순간 무엇을 계산하길래, 실제로는 일어나지 않는 이런 일이 simulation 에서 생길까요?'],
      ],
    },
    {
      id: 'step',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'physics engine 은 시간을 Δt 로 잘라 힘 → 가속도 → 새 속도 → 새 위치를 계산하고, 이 한 간격이 step 입니다.'],
        [6, 12, '속도를 먼저 고친 뒤 그 속도로 위치를 옮기는 semi-implicit Euler 로, 1 m 높이 상자를 Δt 0.1 초로 풉니다.'],
        [12, 18, '이 계산에는 바닥이 없어서 상자는 0.4 초에 0.019 m 까지 내려온 뒤, 다음 step 에서 바닥을 47 cm 뚫고 들어갑니다.'],
        [18, 24, 'MuJoCo 는 바뀌지 않는 길이·질량·모양을 mjModel 에 두고, 위치와 속도인 상태는 mjData 에 둡니다.'],
        [24, 29.7, 'SO-101 은 step 하나가 약 3.2 µs 라서, 실제 팔로 약 116 일 걸릴 시도를 2 시간 안에 계산합니다.'],
      ],
    },
    {
      id: 'mass',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, '1 kg 추 두 개를 0.5 m 간격으로 단 팔은, 펴면 어깨 inertia 가 1.25 이고 직각으로 굽히면 0.75 입니다.'],
        [
          6.5,
          12.5,
          '책상 위에 편 팔의 어깨에만 1 N·m 를 주면 팔꿈치 추만 나가서, 어깨는 4 이고 팔꿈치는 −8 rad/s² 로 꺾입니다.',
          '책상 위에 편 팔의 어깨에만 1 N·m 를 주면 팔꿈치 추만 나가서, 어깨는 4 이고 팔꿈치는 −8 rad/s² 으로 꺾입니다.',
        ],
        [12.5, 18.5, 'joint 두 개의 식에 든 숫자 네 개가 mass matrix 이고, 대각선 밖의 0.5 가 두 joint 를 얽습니다.'],
        [18.5, 24.5, '팔을 세워 수평으로 펴면 gravity torque 가 생기는데, 어깨는 14.715 N·m 이고 팔꿈치는 4.905 N·m 입니다.'],
        [
          24.5,
          29.7,
          'gravity 와 속도의 torque 를 합친 bias force c 를 넣으면 식은 M(q)q̈ + c = τ + τ접촉 입니다.',
          'gravity 와 속도의 torque 를 합친 bias force c 를 넣으면 식은 M 곱하기 각가속도 더하기 c 는 타우 더하기 접촉 torque 입니다.',
        ],
      ],
    },
    {
      id: 'pause-elbow',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 팔을 편 채 멈춘 상태에서 팔꿈치에만 1 N·m 를 주면, 두 joint 의 각가속도는 각각 얼마일까요?'],
        [
          16.5,
          23.5,
          '어깨가 팔꿈치의 −0.4 배라서 0.05 × 팔꿈치 = 1 이 되어, 팔꿈치는 20 이고 어깨는 −8 rad/s² 입니다.',
          '어깨가 팔꿈치의 −0.4 배라서 0.05 × 팔꿈치 가속도는 1 이 되어, 팔꿈치는 20 이고 어깨는 −8 rad/s² 입니다.',
        ],
      ],
    },
    {
      id: 'mjcf',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'MJCF 는 질량, 충돌용 모양, actuator 까지 적는 XML 이고, body 안에 body 를 넣어 tree 를 만듭니다.'],
        [6.5, 13, 'DOF 는 hinge 가 1, ball 이 3, free 가 6 이고, free joint 상자의 위치는 숫자 7 개로 적습니다.'],
        [13, 19.5, 'geom 은 접촉에 쓰이고 질량도 정해서, 기본 밀도 1000 kg/m³ 에서 한 변 0.1 m 상자는 1 kg 입니다.'],
        [19.5, 25.7, 'Menagerie 의 SO-101 은 timestep 0.005 초를 쓰고, 집게 끝 점이 URDF 와 19.9 mm 다릅니다.'],
      ],
    },
    {
      id: 'contact',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'MuJoCo 는 물체가 조금 겹치게 두고 깊이에 따라 커지는 힘으로 밀어내는데, 이 말랑한 접촉이 soft contact 입니다.'],
        [6, 12, '단단함 10000 N/m 인 바닥이라면 1 kg 상자는 9.81 ÷ 10000 으로 약 1 mm 파고든 채로 멈춥니다.'],
        [12, 18, '기본 solref 는 단단함을 시간 0.02 초로 적고, 이때 1 kg 상자도 10 g 상자도 똑같이 0.108 mm 파고듭니다.'],
        [
          18,
          24,
          '마찰 힘은 μ × normal force 까지만 생겨서, μ 1 바닥의 1 kg 상자를 12 N 으로 밀면 2.19 m/s² 로 가속합니다.',
          '마찰 힘은 μ × normal force 까지만 생겨서, μ 1 바닥의 1 kg 상자를 12 N 으로 밀면 2.19 m/s² 으로 가속합니다.',
        ],
        [24, 29.7, '0.1 kg 큐브를 손가락마다 0.6 N 으로 누르면 μ 1 에서는 1.2 N 까지 버텨 들리고, μ 0.6 에서는 미끄러집니다.'],
      ],
    },
    {
      id: 'pause-grip',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. μ 가 0.5 인 손가락 두 개로 0.2 kg 물체를 집으려면, 손가락마다 최소 몇 N 으로 눌러야 할까요?'],
        [
          16.5,
          23.5,
          '무게가 0.2 × 9.81 로 1.962 N 이고 2 × 0.5 × 누르는 힘 ≥ 1.962 라서, 손가락마다 1.962 N 이상입니다.',
          '무게가 0.2 × 9.81 로 1.962 N 이고 2 × 0.5 × 누르는 힘이 1.962 이상이어야 해서, 손가락마다 1.962 N 이상입니다.',
        ],
      ],
    },
    {
      id: 'timestep',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'MuJoCo 기본 timestep 은 0.002 초로 1초에 500 step 이고, 작을수록 정확하지만 step 이 늘어납니다.'],
        [6, 12, '단단함 100 N/m 용수철에 1 cm 눌린 1 kg 물체는 Δt 0.1 초에서 −0.01 m 와 0.01 m 사이를 오갑니다.'],
        [12, 18, 'Δt 0.3 초에서는 −0.08, 0.55, −3.77, 25.84 m 로 튀는데, 물리 법칙이 아니라 계산 방식 때문입니다.'],
        [
          18,
          24,
          '발산하지 않는 경계는 2√(m/k) 라서 k 100, m 1 이면 0.2 초이고, 단단하고 가벼울수록 timestep 이 작아야 합니다.',
          '발산하지 않는 경계는 2 곱하기 루트 m 나누기 k 라서 k 100, m 1 이면 0.2 초이고, 단단하고 가벼울수록 timestep 이 작아야 합니다.',
        ],
        [24, 29.7, 'step 하나가 약 3.2 µs 인 SO-101 은 5 ms 로 약 1560 배 빠르지만, 0.5 ms 로 줄이면 약 156 배입니다.'],
      ],
    },
    {
      id: 'control',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, 'motor 는 명령을 torque 로 그대로 내고, position actuator 는 목표 각도를 받아 PD 를 안에서 계산합니다.'],
        [
          6.5,
          13.5,
          'SO-101 은 gain 998.22 에 한계 2.94 N·m 라서, 목표에서 약 0.17° 만 벗어나도 torque 가 잘립니다.',
          'SO-101 은 게인 998.22 에 한계 2.94 N·m 라서, 목표에서 약 0.17° 만 벗어나도 torque 가 잘립니다.',
        ],
        [13.5, 20.5, 'PD 만으로 팔을 붙잡으면 shoulder_lift 는 bias force 0.573 N·m 때문에 Kp 10 에서 약 3.3° 처집니다.'],
        [20.5, 27.7, 'engine 이 계산한 bias force 를 torque 에 더하는 gravity compensation 을 쓰면 처짐이 0 이 됩니다.', '엔진이 계산한 bias force 를 torque 에 더하는 gravity compensation 을 쓰면 처짐이 0 이 됩니다.'],
      ],
    },
    {
      id: 'pause-spring',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. k 400 N/m, m 1 kg 용수철에서 Δt 의 경계는 몇 초일까요? 0.12 초로 풀면 어떻게 될까요?'],
        [
          16.5,
          23.5,
          '경계는 2√(1 ÷ 400) 으로 0.1 초입니다. 0.12 초면 400 × 0.0144 가 5.76 으로 4 를 넘어서 발산합니다.',
          '경계는 2 곱하기 루트 1 ÷ 400 으로 0.1 초입니다. 0.12 초면 400 × 0.0144 가 5.76 으로 4 를 넘어서 발산합니다.',
        ],
      ],
    },
    {
      id: 'gap',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'sim-to-real gap 은 모델 숫자가 실물과 다를 때와, 실물의 현상이 모델에 아예 없을 때 생깁니다.'],
        [6.5, 13.5, '부품이 20% 무거우면 0.688 N·m 가 필요한데, gravity compensation 은 모델대로 0.573 N·m 만 더합니다.'],
        [13.5, 20.5, '남는 0.115 N·m 를 Kp 10 인 PD 가 버티면 0.0115 rad 처지고, 0.35 m 떨어진 집게 끝은 약 4 mm 내려갑니다.'],
        [20.5, 27.7, '명령 지연과 backlash, noise 는 모델에 없어서, 1 rad/s 로 움직일 때 20 ms 늦으면 약 1.1° 를 더 갑니다.'],
      ],
    },
    {
      id: 'randomize',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'system identification 은 무게를 달고 joint 를 흔들어 마찰과 damping 을 재서 모델 숫자를 고칩니다.'],
        [6, 12, 'domain randomization 은 episode 마다 숫자를 범위 안에서 다시 뽑아, 어디서든 통하는 policy 를 배웁니다.'],
        [
          12,
          18,
          'Shadow hand 연구는 모델을 보정한 뒤 질량을 0.5 ~ 1.5 배에서 뽑고, 마찰 계수는 0.7 ~ 1.3 배에서 뽑았습니다.',
          'Shadow hand 연구는 모델을 보정한 뒤 질량을 0.5 에서 1.5 배 사이에서 뽑고, 마찰 계수는 0.7 에서 1.3 배 사이에서 뽑았습니다.',
        ],
        [18, 24, 'randomization 없이는 약 3 년치 경험으로 배웠지만, 모두 켜고 같은 성능에 이르는 데는 약 100 년치가 들었습니다.'],
        [24, 29.7, '그 100 년치를 쌓는 데 실제로는 50 시간 정도가 걸렸고, 뽑는 범위는 실제 값을 포함해야 효과가 있습니다.'],
      ],
    },
    {
      id: 'pause-range',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 마찰 계수를 보정값 1 의 0.7 ~ 1.3 배에서 뽑아 학습했는데, 실제 큐브가 0.5 면 무엇이 문제일까요?',
          '멈추고 적어 보기. 마찰 계수를 보정값 1 의 0.7 에서 1.3 배 사이에서 뽑아 학습했는데, 실제 큐브가 0.5 면 무엇이 문제일까요?',
        ],
        [
          16.5,
          23.5,
          '0.5 는 학습 범위 0.7 ~ 1.3 밖이라 policy 가 이런 큐브를 겪은 적이 없습니다. 실제 마찰을 재거나 범위를 넓힙니다.',
          '0.5 는 학습 범위 0.7 에서 1.3 의 밖이라 policy 가 이런 큐브를 겪은 적이 없습니다. 실제 마찰을 재거나 범위를 넓힙니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [
          0.3,
          4.2,
          '답입니다. physics engine 은 step 마다 M(q)q̈ + c = τ 를 풀고, 어깨만 밀어도 팔꿈치가 −8 로 꺾입니다.',
          '답입니다. physics engine 은 step 마다 equation of motion 을 풀고, 어깨만 밀어도 팔꿈치가 −8 로 꺾입니다.',
        ],
        [4.2, 8.2, '접촉은 말랑한 용수철이라 상자가 0.1 mm 쯤 파고들고, 마찰 힘은 μ × normal force 까지만 생깁니다.'],
        [
          8.2,
          12.2,
          'timestep 이 2√(m/k) 를 넘으면 발산하고, 멈춘 팔의 처짐은 gravity compensation 으로 없앱니다.',
          'timestep 이 2 곱하기 루트 m 나누기 k 를 넘으면 발산하고, 멈춘 팔의 처짐은 gravity compensation 으로 없앱니다.',
        ],
        [12.2, 15.7, 'gap 은 모델의 오차와 빠진 현상에서 생기고, system identification 과 domain randomization 으로 줄입니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'Classical Pick & Place 와 Teleop Dataset, Force & Impedance Control 이 다음 강의입니다.']],
    },
  ],
}
