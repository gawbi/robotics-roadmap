import type { VideoScript } from '../script.ts'

// Numbers follow lessons/perceptive-locomotion/README.md: the worked example (0.5 m/s, a 0.2 m step 1.0 m ahead, action
// every 0.02 s = 50 a second → 1.0 ÷ 0.5 = 2.0 s, 2.0 ÷ 0.02 = 100 actions vs 0 s, 0 for blind); Miki et al.'s ANYmal
// (wooden steps 12 ~ 36.5 cm, 10 tries each: blind drops from 20 cm, perceptive stable to 30.5 cm; the 20 cm / 17 cm
// course 75 s with three carries vs 33 s; 2.2 km Etzel trail in 78 min vs the planner's 76 min; DARPA SubT 1700 m without
// a fall); Agarwal et al.'s A1 (17 cm × 30 cm stairs, 13 steps: blind 0% and 2.2 steps vs 100%; 26 cm gap and stepping
// stones 0% / 0% vs 100% / 94%; blind descends 13 steps at 100% but a hip popped; climbs 24 cm stairs and a 26 cm curb with
// a 28 cm hip); the check question 0.6 ÷ 1.2 = 0.5 s, 1 ÷ 50 = 0.02 s, 0.5 ÷ 0.02 = 25; elevation_mapping_cupy (0.04 m
// cells, 8 m map, 8 ÷ 0.04 = 200, 200 × 200 = 40,000 cells, variance 0.05 × d², 0.05 × 2² = 0.2 and 0.05 × 1² = 0.05,
// initial variance 1000; the update 0.25 m / 0.2 → point 0.20 m / 0.05, gain 0.2 ÷ (0.2 + 0.05) = 0.8, 0.25 + 0.8 × (0.20 −
// 0.25) = 0.21 m, 0.2 × 0.05 ÷ 0.25 = 0.04; Jetson Xavier 43,017 LiDAR points in 6.857 ms, 20 map updates a second);
// height samples (rings 0.08, 0.16, 0.26, 0.36, 0.48 m with 6, 8, 10, 12, 16 points, 6 + 8 + 10 + 12 + 16 = 52, 52 × 4 =
// 208, neighbours ≈ 0.084 m inside and ≈ 0.188 m outside; a 0.2 m step 0.3 m ahead → 3 + 5 = 8 read +0.2 m and 44 read 0;
// legged_gym 17 × 11 = 187; MLP 52 → 24, 24 × 4 = 96); the noise model (nominal 60%, large offset 30%, large noise 10%;
// +0.1 m offset: 0 → 0.1 m, 0.2 → 0.3 m, difference 0.2 m; reconstruction loss × 0.5); the gate (σ(0) = 0.5, σ(2.2) ≈
// 0.90, σ(−2.2) ≈ 0.10; map feature 0.5, b′ value 0.1 → 0.1 + 0.90 × 0.5 = 0.55 and 0.1 + 0.10 × 0.5 = 0.15; GRU 2 layers
// × 50 units, 96 gates; the check question 0.2 + 0.5 × 0.4 = 0.4, 0.2 + 0.05 × 0.4 = 0.22); Agarwal et al.'s pipeline
// (RealSense D435, Jetson NX, 480 × 848 every 100 ± 20 ms, crop 200 pixels, 58 × 87 = 5,046 ≈ 24 × 208, CNN latency 10 ±
// 10 ms, GRU policy 50 a second, PD 400 a second with Kp 40, Kd 0.5; f = 424 → 424 × 0.2 ÷ 1 ≈ 85 rows → 85 × 58 ÷ 480 ≈
// 10 rows, 2 m → ≈ 42 → ≈ 5 rows; feet 0.4 m apart at 0.35 m/s → 0.4 ÷ 0.35 ≈ 1.14 s ≈ 57 actions); the two phases (depth
// rendering ≈ 10× slower; RTX 3090: 4096 robots ≈ 2 × 10⁵ step/s vs 256 envs 500 step/s → 400×; 15 × 10⁹ ÷ 500 = 3 × 10⁷
// s ≈ 347 days; phase 1 PPO 150억 samples, phase 2 DAgger 24 steps, 600만 samples; Cheng et al.'s 12 × 11 = 132 scandots);
// latency (1 m/s × 0.2 s = 0.2 m; Miki 1.2 m/s × 1 ÷ 20 = 0.05 s → 0.06 m; Agarwal 0.35 m/s × 0.1 s = 0.035 m; Cheng 1
// m/s × 0.08 s = 0.08 m; 50 actions vs 10 depths a second → 5 actions an image; 80 ~ 120 ms and 10 ~ 30 ms randomised; the
// check question 0.8 × 0.08 = 0.064 m, 0.1 ÷ 0.02 = 5); parkour (Zhuang: s steps of 0.05, (1 − 0.5) × 0.2 + 0.5 × 0.45 =
// 0.325 m, A1 80% on a 0.40 m box = 1.53 × height and a 0.60 m gap = 1.5 × body length, teacher without soft dynamics 0%,
// MLP student 0% / 1%; Cheng: waypoint (1, 0), command 1.0 m/s, (1.2, 0) → 1.0, (0.6, 0.8) → 0.6, (0, 1.0) → 0, (−0.5, 0)
// → −0.5, edge penalty within 5 cm, A1 jumps a 0.5 m box ≈ 2 × the 0.26 m thigh height and a 0.8 m gap = 2 × foot
// distance; Hoeller: skills 50 a second, navigation 5 a second, 2 m/s, 98.2 / 96.3 / 97.6% vs 95.3 / 60.9 / 75.3%; the
// check question 0.8 × 0.6 + 0.6 × 0.8 = 0.96, |v| = 1.0 m/s).

const S1 = 'blind 와 perceptive'
const S2 = '높이 지도와 gate'
const S3 = 'depth image 2 단계'
const S4 = 'parkour 의 세 장치'

export const script: VideoScript = {
  id: 'perceptive-locomotion',
  title: 'Perceptive Locomotion',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/perceptive-locomotion',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Humanoid Whole-Body Control', '휴머노이드 홀 바디 컨트롤'],
    ['soft dynamics constraint', '소프트 다이내믹스 컨스트레인트'],
    ['egocentric depth image', '에고센트릭 뎁스 이미지'],
    ['depth image', '뎁스 이미지'],
    ['perceptive locomotion', '퍼셉티브 로코모션'],
    ['Perceptive Locomotion', '퍼셉티브 로코모션'],
    ['navigation policy', '내비게이션 폴리시'],
    ['teacher-student', '티처 스튜던트'],
    ['belief encoder', '빌리프 인코더'],
    ['height sample', '하이트 샘플'],
    ['elevation map', '엘리베이션 맵'],
    ['Kalman Filter', '칼만 필터'],
    ['local minimum', '로컬 미니멈'],
    ['inner product', '이너 프로덕트'],
    ['soft dynamics', '소프트 다이내믹스'],
    ['depth camera', '뎁스 카메라'],
    ['RealSense', '리얼센스'],
    ['perceptive', '퍼셉티브'],
    ['simulation', '시뮬레이션'],
    ['navigation', '내비게이션'],
    ['rendering', '렌더링'],
    ['scandots', '스캔닷츠'],
    ['humanoid', '휴머노이드'],
    ['Agarwal', '아가왈'],
    ['Hoeller', '횔러'],
    ['penalty', '페널티'],
    ['nominal', '노미널'],
    ['feature', '피처'],
    ['sigmoid', '시그모이드'],
    ['student', '스튜던트'],
    ['teacher', '티처'],
    ['parkour', '파쿠르'],
    ['ANYmal', '애니멀'],
    ['Jetson', '젯슨'],
    ['belief', '빌리프'],
    ['torque', '토크'],
    ['offset', '오프셋'],
    ['reward', '리워드'],
    ['sample', '샘플'],
    ['weight', '웨이트'],
    ['vector', '벡터'],
    ['Zhuang', '좡'],
    ['LiDAR', '라이다'],
    ['phase', '페이즈'],
    ['image', '이미지'],
    ['pixel', '픽셀'],
    ['depth', '뎁스'],
    ['blind', '블라인드'],
    ['noise', '노이즈'],
    ['world', '월드'],
    ['thigh', '싸이'],
    ['D435', '디 사삼오'],
    ['Cheng', '청'],
    ['Miki', '미키'],
    ['gate', '게이트'],
    ['gain', '게인'],
    ['pose', '포즈'],
    ['CNN', '씨엔엔'],
    ['GRU', '지알유'],
    ['IMU', '아이엠유'],
    ['MLP', '엠엘피'],
    ['PPO', '피피오'],
    ['RTX', '알티엑스'],
    ['hip', '힙'],
    ['A1', '에이 원'],
    ['NX', '엔엑스'],
    ['m/s', '미터 퍼 세컨드'],
    ['cm', '센티미터'],
    ['km', '킬로미터'],
    ['α', '알파'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'perceptive locomotion 은 몸 밖을 재는 센서로 지형을 보고 걷는 보행입니다. 발이 닿기 전에 계단을 압니다.'],
        [4.2, 7.8, 'blind policy 의 한계, 높이 지도와 gate, depth image 2 단계 학습, parkour 의 세 장치를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'student policy 는 관절 각도와 IMU 이력만 보는 blind policy 라서, 계단은 부딪힌 뒤에야 압니다.'],
        [4.4, 7.8, 'ANYmal 은 단 높이 20 cm 부터 앞발이 걸렸습니다. 닿기 전에 계단을 알려면 policy 에 무엇을 보여 줘야 할까요?'],
      ],
    },
    {
      id: 'blind',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'blind policy 는 발이 닿은 뒤 관절 각도와 torque 의 변화로 지형을 짐작합니다. 높은 계단에서는 이미 늦습니다.'],
        [6.5, 13.5, '예로 0.5 m/s 로 걷는 로봇 앞 1.0 m 에 계단이 있습니다. policy 는 1초에 50 번 action 을 냅니다.'],
        [13.5, 21, 'perceptive policy 는 센서가 볼 때 압니다. 1.0 ÷ 0.5 로 2.0 초가 남고, action 은 100 번입니다.'],
        [21, 29.5, 'blind policy 는 0 초, 0 번입니다. perceptive policy 는 그동안 앞발을 높이 들 준비를 합니다.'],
      ],
    },
    {
      id: 'results',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'blind policy 는 나무 단 20 cm 부터 막혔고, perceptive policy 는 30.5 cm 까지 올랐습니다.'],
        [7, 14, 'blind policy 는 장애물 셋에 모두 걸려 사람이 옮겨 75 초, perceptive policy 는 도움 없이 33 초였습니다.'],
        [14, 21, 'A1 은 카메라 한 대로 17 cm 계단 13 칸을 100% 올랐고, blind policy 는 0% 로 평균 2.2 칸이었습니다.'],
        [21, 27.5, '다만 blind A1 도 같은 계단 내려가기는 100% 였습니다. 칸마다 떨어지듯 내려가는 걸음이라 hip 이 빠졌습니다.'],
      ],
    },
    {
      id: 'pause-blind',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1.2 m/s 로 걷다 0.6 m 앞 계단을 봤습니다. 1초에 50 번이면 닿기 전 action 은 몇 번일까요?'],
        [16.5, 23.5, '0.6 ÷ 1.2 로 0.5 초가 남고, 0.5 ÷ 0.02 로 25 번입니다. 빨리 걸을수록 준비할 action 이 줍니다.'],
      ],
    },
    {
      id: 'map',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '장마다 받은 점을 pose 로 쌓고, 바닥을 칸으로 나눠 칸마다 높이 하나를 적은 지도가 elevation map 입니다.'],
        [6.5, 13, 'Miki 등의 코드는 칸 한 변이 0.04 m, 지도 한 변이 8 m 라서 한 변에 200 칸, 모두 40,000 칸입니다.'],
        [13, 19.5, '칸 높이는 Kalman Filter 처럼 고칩니다. 예로 2 m 앞에서 잰 0.25 m 칸에 1 m 앞에서 잰 0.20 m 가 들어옵니다.'],
        [19.5, 26, 'gain 은 0.2 ÷ (0.2 + 0.05) 로 0.8 이라서, 높이는 0.20 쪽으로 0.8 만큼 옮겨 0.21 m 가 됩니다.', 'gain 은 0.2 를 0.2 더하기 0.05 로 나눈 0.8 이라서, 높이는 0.20 쪽으로 0.8 만큼 옮겨 0.21 m 가 됩니다.'],
        [26, 31.5, 'policy 에는 40,000 칸을 다 넣지 않고, 발마다 원 다섯 개 위의 52 개를 읽어 네 발에 208 개를 넣습니다.'],
      ],
    },
    {
      id: 'gate',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, 'student 는 일부러 noise 를 섞은 height sample 로 배웁니다. 틀린 지도를 겪지 않으면 그대로 믿기 때문입니다.'],
        [6.5, 13, '지도 상태는 셋입니다. 작은 noise 가 60%, 발마다 큰 offset 이 30%, 점마다 큰 noise 가 10% 입니다.'],
        [13, 19.5, '+0.1 m offset 이 붙으면 바닥은 0.1 m, 계단 윗면은 0.3 m 로 읽히지만, 차이는 0.2 m 그대로입니다.'],
        [19.5, 26, '얼마나 믿을지는 gate 가 정합니다. GRU 의 중간 belief 로 0 과 1 사이의 α 를 만들어 지도 feature 에 곱합니다.'],
        [26, 31.5, 'gate 입력 2.2 면 α 는 약 0.90 이라 지도 정보가 거의 그대로 들어가고, −2.2 면 약 0.10 이라 거의 막힙니다.'],
      ],
    },
    {
      id: 'pause-gate',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. gate 입력 0, 지도 feature 0.4, 중간 belief 값 0.2 면 belief 는? α 가 0.05 면?'],
        [16.5, 23.5, 'sigmoid(0) 은 0.5 라서 0.2 + 0.5 × 0.4 로 0.4 이고, 0.05 면 0.2 + 0.02 로 0.22 입니다.', 'sigmoid 0 은 0.5 라서 0.2 더하기 0.5 곱하기 0.4 로 0.4 이고, 0.05 면 0.2 더하기 0.02 로 0.22 입니다.'],
      ],
    },
    {
      id: 'depth',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'Agarwal 등은 지도 대신 머리의 카메라가 찍은 egocentric depth image 를 policy 에 바로 넣었습니다.'],
        [6, 12.5, '480 × 848 사진이 100 ± 20 ms 마다 옵니다. 왼쪽 200 pixel 을 자르고 58 × 87 로 줄입니다.', '480 × 848 사진이 100 플러스 마이너스 20 ms 마다 옵니다. 왼쪽 200 pixel 을 자르고 58 × 87 로 줄입니다.'],
        [12.5, 19, '58 × 87 은 5,046 개로 208 개의 24 배쯤이지만, pixel 에는 높이가 아니라 그 방향으로 잰 거리만 있습니다.'],
        [19, 25, 'f 가 424 면 1 m 앞의 0.2 m 앞면은 424 × 0.2 ÷ 1 로 약 85 줄, 58 줄 사진에서는 약 10 줄입니다.'],
        [25, 30, '카메라는 앞만 봅니다. 뒷발은 앞발 자리에 0.4 ÷ 0.35 로 약 1.14 초 뒤에 닿아서 GRU 가 기억해야 합니다.'],
      ],
    },
    {
      id: 'two-phase',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, '높이만 읽는 simulation 은 RTX 3090 에서 1초에 약 20만 step, depth 를 그리면 500 step 입니다.'],
        [6.5, 13, '400 배 차이입니다. 첫 단계의 150억 sample 을 depth 를 그리며 모으면 3천만 초, 약 347 일이 걸립니다.'],
        [13, 19.5, 'phase 1 policy 는 정해 둔 자리의 지형 높이인 scandots 를 받아 PPO 로 150억 sample 을 학습합니다.'],
        [19.5, 26, 'phase 2 는 CNN 으로 depth 를 받고, phase 1 의 action 을 따라 배워 600만 sample 로 끝납니다.'],
        [26, 31.5, '지형 정보는 늦게 닿습니다. 1 m/s 에서 0.2 초 지연은 지형이 0.2 m 어긋나 보인다는 뜻입니다.'],
      ],
    },
    {
      id: 'pause-latency',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 지연 0.08 초, depth 는 1초에 10 번입니다. 0.8 m/s 면 사진을 처음 쓰기까지 얼마나 갈까요?'],
        [16.5, 23.5, '0.8 × 0.08 로 약 6.4 cm 를 갑니다. 사진 간격 0.1 초 ÷ action 간격 0.02 초로 사진 하나를 5 번에 씁니다.'],
      ],
    },
    {
      id: 'soft',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'parkour 처럼 키보다 높은 상자를 실제 물리로 바로 배우면, 장애물 앞에서 막히는 local minimum 에 빠집니다.'],
        [7, 14, '학습 초반에는 장애물을 뚫고 지나가게 두고 뚫은 만큼 penalty 를 주는 soft dynamics constraint 를 씁니다.'],
        [14, 21, '상자 높이는 난이도 s 로 정합니다. 쉬운 끝 0.2 m 와 어려운 끝 0.45 m 를 섞어, s 가 0.5 면 0.325 m 입니다.'],
        [21, 27.5, 'A1 은 0.40 m 상자와 0.60 m 틈에 각각 80% 성공했고, 이 단계를 뺀 teacher 는 0% 였습니다.'],
      ],
    },
    {
      id: 'heading',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'Cheng 등은 경유점 방향과 속도의 inner product 를 명령 속도 1.0 m/s 에서 잘라 reward 로 줍니다.'],
        [6.5, 13.5, '앞쪽 경유점에 (1.2, 0) 은 1.0, (0.6, 0.8) 은 0.6, (0, 1.0) 은 0, (−0.5, 0) 은 −0.5 입니다.', '앞쪽 경유점에 속도가 앞으로 1.2 면 1.0, 비스듬히 0.6 과 0.8 이면 0.6, 옆으로 1.0 이면 0, 뒤로 0.5 면 −0.5 입니다.'],
        [13.5, 19.5, '명령보다 빨라도 reward 는 늘지 않고 어긋난 만큼 덜 받습니다. 방향은 phase 2 student 가 depth 로 예측합니다.'],
        [19.5, 24.5, 'A1 은 thigh 높이 0.26 m 의 약 2 배인 0.5 m 상자에 올랐고, 앞뒤 발 사이의 2 배인 0.8 m 틈을 건넜습니다.'],
        [24.5, 29.5, 'Hoeller 등은 1초에 5 번 기술과 목표를 정하는 navigation policy 를 더해 최대 2 m/s 로 코스를 지났습니다.'],
      ],
    },
    {
      id: 'pause-reward',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 경유점 방향 (0.6, 0.8), 명령 속도 1.0 m/s 에서 속도가 (0.8, 0.6) 이면 reward 는?', '멈추고 적어 보기. 경유점 방향 0.6 과 0.8, 명령 속도 1.0 m/s 에서 속도가 0.8 과 0.6 이면 reward 는?'],
        [16.5, 23.5, '0.8 × 0.6 + 0.6 × 0.8 로 0.96 입니다. 속도 크기는 1.0 m/s 지만 방향이 조금 어긋나 그만큼 덜 받습니다.', '0.8 곱하기 0.6 더하기 0.6 곱하기 0.8 로 0.96 입니다. 속도 크기는 1.0 m/s 지만 방향이 조금 어긋나 그만큼 덜 받습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.3, 'blind policy 는 부딪힌 뒤에야 알아서 perceptive policy 가 가진 action 100 번의 준비를 못 합니다.'],
        [4.3, 8.3, 'height sample 208 개를 틀린 지도로 학습한 student 는 gate α 로 지도를 믿을 정도를 배웁니다.'],
        [8.3, 12.3, 'depth 를 그리면 400 배 느려서 scandots policy 를 DAgger 로 따라 배우고, 시야 밖은 GRU 가 기억합니다.'],
        [12.3, 15.7, 'parkour 는 soft dynamics 와 inner product reward 로 0.5 m 상자와 0.8 m 틈을 넘습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, 'teacher-student 학습은 humanoid 에도 쓰입니다. 다음은 Humanoid Whole-Body Control 입니다.'],
      ],
    },
  ],
}
