import type { VideoScript } from '../script.ts'

// Numbers follow lessons/sim2real-locomotion/README.md: Hwangbo 등(2019) ideal-PD policy on ANYmal fails; Rudin 등(2021) GPU
// 한 장, 평지 4 분, 계단·경사 20 분; observation 48 (3 + 3 + 3 + 3 + 12 + 12 + 12), 관절 12, 지형 높이 187; action → torque
// with A1 s = 0.25, K_p = 20, K_d = 0.5, 무릎 −1.5 rad, a = 0.4 → −1.4 rad, q = −1.45 → 0.05 rad, 20 × 0.05 = 1.0 N·m;
// policy 0.02 초 (1초에 50 번), physics 0.005 초, 4 번; check 0.8 + 0.25 × (−0.4) = 0.7, 0.7 − 0.75 = −0.05, −1 N·m; reward
// 아홉 항목, weights +1.0, +0.5, −2.0, −0.05, −0.00001 (A1 −0.0002), −2.5 × 10⁻⁷, −0.01, −1, +1.0; 명령 0.5 m/s, 걸음 1
// 0.4 m/s (0.9608, v_z 0.1 → −0.02, Σ 500 → −0.1, 2 → −0.02, 0.8208), 걸음 2 0.7 m/s (0.8521, 0.3 → −0.18, 1500 → −0.3,
// 10 → −0.1, 0.2721), 0.11 정도, 세 배 가까이; reality gap: 4096 × 24 = 98,304, 1500 × 98,304 = 147,456,000 step,
// × 0.02 = 2,949,120 초, 약 34 일; 12 kg, 12 × 9.81 ≈ 118 N, 발 하나 약 60 N, 미는 힘 45 N, μ 1.0 / 0.8 / 0.7 / 0.6 → 60 / 48
// / 42 / 36 N; 관성 20% 가까이, 6 → 7.2 N·m, 1.2 ÷ 20 = 0.06 rad (약 3.4°); Minitaur 3 ms vs 15 ~ 19 ms (Jetson TX2), 20 ms
// = 한 step; 4° → 4, 0, −4, −4, 0, 4; 센서 noise ±0.05 rad (예); actuator network: SEA chain PD → 전류 PID → FOC → 기어 ·
// spring, parameter 100 개 가까이, 진폭 5 ~ 10 cm, 1 ~ 25 Hz, 1초에 400 번, 4 분 미만, 100만 개 넘게, 입력 6 (지금, 0.01,
// 0.02 초 전 × 2), MLP 32 unit 층 셋, 90% 학습; 오차 3.55 / 5.74 N·m vs 0.740 / 0.966 N·m; 1.5 m/s vs 1.2 m/s, 25%;
// legged_gym LSTM 입력 2, 층 2, 내부 상태 8; check 3 × 2 = 6, 400 × 240 = 96,000, × 12 = 1,152,000 ≈ 115만; domain
// randomization: 마찰 0.5 ~ 1.25, 질량 −5 ~ +5 kg, 밀기 15 초마다 −1 ~ 1 m/s, ±15% · ±2 cm, Minitaur 80 ~ 120%, 지연 0 ~ 40 ms,
// A1 0.05 ~ 4.5 · 0 ~ 6 kg; A 55 N 0.55 m/s, B 45 N 0.45, C 35 N 0.35, 미끄러지면 −1, μ 0.6 / 0.8 / 1.0 / 1.2 → 평균 −0.225 /
// 0.0875 / 0.35; μ 0.7 → 35 ≤ 42; 범위 0.95 ~ 1.05 (57 N, A), 0.6 ~ 1.2 (C), 0.2 ~ 1.4 (12 N, D 0.10 m/s, B −0.275, C 0.0125),
// (0.55 − 0.10) ÷ 0.55 ≈ 82%; Tan 질량 80 ~ 120%, 관성 50 ~ 150%; noise ±0.01 rad, ±1.5 rad/s, ±0.1 m/s, ±0.2 rad/s, ±0.05,
// ±0.1 m; 기울기 0.04, −0.03, 0.05, −0.05, 0.02 → 10 배 2.62 vs 2 배 0.1048, 5 × 5 = 25 배; check μ 0.7 / 1.0 / 1.3 → 42 / 60
// / 78 N, A ≈ 0.0333, B ≈ −0.0333, C 0.35; curriculum: 8 m 칸, 20 줄 × 10 단계, 0.05 + 0.18 × i ÷ 10, 단계 0 5 cm, 단계 9
// 0.05 + 0.18 × 0.9 = 0.212 m, episode 20 초, 4 m, 명령 × 20 × 0.5, 0.3 × 20 × 0.5 = 3 m, 1000 iteration; teacher-student:
// 반지름 10 cm 9 개 점, 100 step (2 초) TCN, L = (aᵀ − aˢ)² + (lᵀ − lˢ)², 50 N 5 초, 0.02 초 이력 대비 35.5%, 이끼 0.452 vs
// 0.199 m/s, RMA 17 → 8, 50 step (0.5 초); check 1 ÷ 50 = 0.02, 50 × 0.02 = 1 초, 50 × 0.01 = 0.5 초.

const S1 = 'policy 와 reward'
const S2 = 'reality gap'
const S3 = 'randomization'
const S4 = '지형 · teacher'

export const script: VideoScript = {
  id: 'sim2real-locomotion',
  title: 'Sim-to-Real Locomotion',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/sim2real-locomotion',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Sim-to-Real Locomotion', '심 투 리얼 로코모션'],
    ['privileged information', '프리빌리지드 인포메이션'],
    ['domain randomization', '도메인 랜더마이제이션'],
    ['actuator network', '액추에이터 네트워크'],
    ['teacher-student', '티처 스튜던트'],
    ['reward hacking', '리워드 해킹'],
    ['PD controller', '피디 컨트롤러'],
    ['latent vector', '레이턴트 벡터'],
    ['physics step', '피직스 스텝'],
    ['randomization', '랜더마이제이션'],
    ['observation', '옵저베이션'],
    ['reality gap', '리얼리티 갭'],
    ['World Model', '월드 모델'],
    ['simulation', '시뮬레이션'],
    ['legged_gym', '레기드 짐'],
    ['curriculum', '커리큘럼'],
    ['ANYmal C', '애니멀 씨'],
    ['actuator', '액추에이터'],
    ['Minitaur', '미니토어'],
    ['Hwangbo', '황보'],
    ['network', '네트워크'],
    ['nominal', '노미널'],
    ['penalty', '페널티'],
    ['teacher', '티처'],
    ['student', '스튜던트'],
    ['ANYmal', '애니멀'],
    ['reward', '리워드'],
    ['weight', '웨이트'],
    ['sample', '샘플'],
    ['spring', '스프링'],
    ['torque', '토크'],
    ['latent', '레이턴트'],
    ['rad/s', '라디안 퍼 초'],
    ['Rudin', '루딘'],
    ['noise', '노이즈'],
    ['motor', '모터'],
    ['model', '모델'],
    ['unit', '유닛'],
    ['N·m', '뉴턴미터'],
    ['m/s', '미터 퍼 초'],
    ['K_p', '케이 피'],
    ['PPO', '피피오'],
    ['MLP', '엠엘피'],
    ['TCN', '티씨엔'],
    ['SEA', '에스이에이'],
    ['PID', '피아이디'],
    ['FOC', '에프오씨'],
    ['CAD', '캐드'],
    ['DQN', '디큐엔'],
    ['SAC', '쌕'],
    ['VLA', '브이엘에이'],
    ['Tan', '탄'],
    ['Lee', '리'],
    ['rad', '라디안'],
    ['kg', '킬로그램'],
    ['cm', '센티미터'],
    ['A1', '에이 원'],
    ['PD', '피디'],
    ['RL', '알엘'],
    ['μ', '뮤'],
    ['N', '뉴턴'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Sim-to-Real Locomotion 은 simulation 에서 배운 4족 보행 policy 를 실제 로봇에 옮기는 방법입니다.'],
        [4.2, 7.8, '보행 reward, reality gap, domain randomization, 지형 curriculum, teacher-student 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'Hwangbo 등이 이상적인 PD 식 simulation 에서 학습한 policy 는 실제 ANYmal 에서 한 걸음도 내딛지 못했습니다.'],
        [4.4, 7.8, '실물에서 한 번도 학습하지 않은 policy 를 실물에서 걷게 하려면 simulation 을 어떻게 바꿔야 할까요?'],
      ],
    },
    {
      id: 'obs-action',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'policy 에는 실제 센서로도 얻는 숫자만 주는데, ANYmal C 평지 설정의 observation 은 48 개입니다.'],
        [6.5, 13, '몸통 속도·회전 속도·중력 방향·속도 명령이 3 개씩이고, 관절 각도·관절 속도·직전 action 이 12 개씩입니다.'],
        [
          13,
          19.5,
          'action 은 관절 12 개의 목표 각도이고, A1 무릎에서는 −1.5 + 0.25 × 0.4 = −1.4 rad 가 목표입니다.',
          'action 은 관절 12 개의 목표 각도이고, A1 무릎에서는 −1.5 더하기 0.25 × 0.4 로 −1.4 rad 이 목표입니다.',
        ],
        [
          19.5,
          25.7,
          '무릎이 −1.45 rad 면 차이는 0.05 rad 라서, PD controller 가 K_p 20 을 곱해 1.0 N·m 를 냅니다.',
          '무릎이 −1.45 rad 이면 차이는 0.05 rad 이라서, PD controller 가 K_p 20 을 곱해 1.0 N·m 를 냅니다.',
        ],
      ],
    },
    {
      id: 'reward',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '보행 reward 는 항목마다 점수에 weight 를 곱해 더하는데, Rudin 등의 reward 는 아홉 항목의 합입니다.'],
        [6.5, 13, '명령이 0.5 m/s 일 때, 0.4 m/s 로 차분한 걸음 1 과 0.7 m/s 로 뛰는 걸음 2 를 네 항목으로 비교합니다.'],
        [13, 19.5, '속도 점수의 차이는 0.11 정도지만 penalty 까지 더하면 0.8208 과 0.2721 이라서, PPO 는 걸음 1 을 배웁니다.'],
        [19.5, 25.7, 'penalty 가 빠지면 관절을 떨며 미끄러지는 걸음도 reward 가 커지는데, 이것을 reward hacking 이라고 합니다.'],
      ],
    },
    {
      id: 'pause-torque',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 기본 0.8 rad, 배율 0.25, action −0.4, 지금 0.75 rad, K_p 20 이면 torque 는?'],
        [
          16.5,
          23.5,
          '목표는 0.8 − 0.1 = 0.7 rad 이고 차이는 −0.05 rad 라서, torque 는 20 × (−0.05) = −1 N·m 입니다.',
          '목표는 0.8 빼기 0.1 로 0.7 rad 이고 차이는 −0.05 rad 이라서, torque 는 20 × −0.05 로 −1 N·m 입니다.',
        ],
      ],
    },
    {
      id: 'gap',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.3, '실물로는 약 34 일 걸릴 step 을 simulation 에서 모으는데, 마찰·질량·지연·noise·actuator 가 실물과 다릅니다.'],
        [6.3, 12.3, '발 하나가 약 60 N 을 받칠 때 45 N 으로 미는 걸음은, μ 0.7 바닥의 한계 42 N 을 넘어 미끄러집니다.'],
        [12.3, 18.3, '몸통이 무거워져 무릎 torque 가 6 에서 7.2 N·m 로 늘면, 무릎은 0.06 rad 더 접힌 자세로 버팁니다.'],
        [
          18.3,
          24.3,
          'Minitaur 에서 명령의 결과가 보고되기까지 15 ~ 19 ms 가 걸렸는데, 50 Hz 의 한 step 은 20 ms 입니다.',
          'Minitaur 에서 명령의 결과가 보고되기까지 십오에서 십구 밀리초가 걸렸는데, 50 Hz 의 한 step 은 20 ms 입니다.',
        ],
        [24.3, 29.7, '한 step 늦게 닿는 명령으로 4° 기울기를 매번 전부 바로잡으면, 4, 0, −4, −4, 0, 4 로 끝없이 흔들립니다.'],
      ],
    },
    {
      id: 'actuator',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.3, 'ANYmal 의 SEA 에서는 목표 각도가 PD, 전류 PID, FOC, 기어와 spring 을 거쳐 torque 가 됩니다.'],
        [6.3, 12.3, 'actuator network 는 이 관계를 실측 데이터로 배우는데, 4 분이 안 걸려 sample 100만 개 넘게 모았습니다.'],
        [12.3, 18.3, '지금과 0.01 초, 0.02 초 전의 각도 오차와 각속도 6 개를 받아, 32 unit 층 셋의 MLP 가 torque 를 냅니다.'],
        [18.3, 24.3, 'torque 예측의 평균 오차는 이상적인 PD 식이 3.55 N·m 이고, actuator network 는 0.740 N·m 입니다.'],
        [24.3, 29.7, '이 network 를 넣고 학습한 policy 는 실물에서 1.5 m/s 로 달려, 이전 기록 1.2 m/s 를 25% 앞섰습니다.'],
      ],
    },
    {
      id: 'pause-actuator',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 관절 12 개에서 1초에 400 번씩 4 분 동안 기록하면 sample 은 모두 몇 개일까요?'],
        [
          16.5,
          23.5,
          '관절 하나가 400 × 240 = 96,000 개라서, 12 개면 96,000 × 12 = 1,152,000 개, 약 115만 개입니다.',
          '관절 하나가 400 × 240 으로 96,000 개라서, 12 개면 96,000 × 12 로 1,152,000 개, 약 115만 개입니다.',
        ],
      ],
    },
    {
      id: 'dr',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'domain randomization 은 episode 를 시작할 때마다 마찰이나 질량 같은 숫자를 정해 둔 범위에서 다시 뽑습니다.'],
        [
          6.5,
          13,
          'legged_gym 의 마찰 범위는 0.5 ~ 1.25 이고, Minitaur 는 지연을 0 ~ 40 ms 에서 무작위로 바꿨습니다.',
          'legged_gym 의 마찰 범위는 영 점 오에서 일 점 이오 이고, Minitaur 는 지연을 영에서 사십 밀리초 사이에서 무작위로 바꿨습니다.',
        ],
        [13, 19.5, '55 N 으로 미는 A, 45 N 의 B, 35 N 의 C 가운데, nominal 값 μ 1.0 에서만 배우면 A 를 고릅니다.'],
        [19.5, 25.7, 'μ 를 0.6, 0.8, 1.0, 1.2 에서 고르게 뽑으면 평균은 A −0.225, B 0.0875, C 0.35 라서 C 를 배웁니다.'],
      ],
    },
    {
      id: 'range-noise',
      seconds: 30,
      section: S3,
      cues: [
        [
          0.3,
          6.3,
          'C 의 35 N 은 μ 0.7 의 한계 42 N 보다 작아 버티지만, 0.95 ~ 1.05 로 좁게 뽑으면 A 를 배워 미끄러집니다.',
          'C 의 35 N 은 μ 0.7 의 한계 42 N 보다 작아 버티지만, 영 점 구오에서 일 점 영오로 좁게 뽑으면 A 를 배워 미끄러집니다.',
        ],
        [
          6.3,
          12.3,
          '범위가 0.2 ~ 1.4 로 넓으면 0.10 m/s 로 기어가는 D 를 골라서, μ 1.0 에서 A 보다 약 82% 느립니다.',
          '범위가 영 점 이에서 일 점 사로 넓으면 0.10 m/s 로 기어가는 D 를 골라서, μ 1.0 에서 A 보다 약 82% 느립니다.',
        ],
        [
          12.3,
          18.3,
          '그래서 Tan 등은 직접 잰 질량은 80 ~ 120% 로 좁게 잡고, 계산한 관성은 50 ~ 150% 로 넓게 잡았습니다.',
          '그래서 Tan 등은 직접 잰 질량은 팔십에서 백이십 퍼센트로 좁게 잡고, 계산한 관성은 오십에서 백오십 퍼센트로 넓게 잡았습니다.',
        ],
        [18.3, 24.3, '센서 noise 에 대비해 legged_gym 은 관절 속도에 ±1.5 rad/s 같은 noise 를 더해 학습합니다.'],
        [24.3, 29.7, '기울기의 10 배로 반응하는 policy 는 action 변화의 제곱 합이 2.62 로, 2 배로 반응할 때보다 25 배 큽니다.'],
      ],
    },
    {
      id: 'pause-dr',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. μ 가 0.7, 1.0, 1.3 으로 같은 가능성으로 나오면 A, B, C 가운데 무엇을 고를까요?'],
        [16.5, 23.5, '한계가 42, 60, 78 N 이라 평균은 A 약 0.0333, B 약 −0.0333, C 0.35 이고, C 를 고릅니다.'],
      ],
    },
    {
      id: 'curriculum',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, '어려운 지형에서 처음부터 학습하면 걷기도 전에 넘어지므로, 쉬운 지형부터 차례로 어렵게 하는 curriculum 을 씁니다.'],
        [6.5, 13, 'legged_gym 은 계단 높이를 단계 0 의 5 cm 에서 단계 9 의 21.2 cm 까지, 10 단계에 걸쳐 올립니다.'],
        [13, 19.5, 'episode 20 초 동안 4 m 를 넘게 가면 한 단계 오르고, 명령 속도 × 20 초 × 0.5 보다 짧으면 내려갑니다.'],
        [19.5, 25.7, '명령이 0.3 m/s 면 기준은 3 m 이고, 맨 위 단계를 넘은 로봇은 쉬운 지형을 잊지 않게 무작위 단계로 보냅니다.'],
      ],
    },
    {
      id: 'teacher',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'Lee 등은 학습 신호가 드물어 바로 배우기 어려운 지형 보행을, teacher 와 student 두 단계로 나눠 학습했습니다.'],
        [6.5, 13, 'teacher 는 발 주변 지형 높이와 마찰 계수처럼 simulation 에만 있는 privileged information 을 받습니다.'],
        [13, 19.5, 'student 는 최근 2 초의 센서 이력만 받는 TCN 으로 teacher 를 따라 배우고, 실제 로봇에는 student 만 올라갑니다.'],
        [19.5, 25.7, '50 N 으로 5 초 옆으로 밀면, 2 초 이력의 student 는 0.02 초 이력보다 진행 방향에서 35.5% 덜 벗어납니다.'],
      ],
    },
    {
      id: 'pause-history',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1초에 50 번 계산하는 student 가 최근 50 step 을 받으면 몇 초의 이력일까요? 100 번이면요?'],
        [
          16.5,
          23.5,
          '한 step 이 0.02 초라서 50 × 0.02 = 1 초이고, 1초에 100 번이면 50 × 0.01 = 0.5 초의 이력입니다.',
          '한 step 이 0.02 초라서 50 × 0.02 로 1 초이고, 1초에 100 번이면 50 × 0.01 로 0.5 초의 이력입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4, 'policy 는 observation 48 개로 목표 각도 12 개를 내고, penalty 없는 reward 는 못 쓸 걸음을 만듭니다.'],
        [4, 8, 'actuator network 는 motor 의 torque 예측 오차를 3.55 에서 0.740 N·m 로 줄였습니다.'],
        [8, 12, 'domain randomization 범위는 실제 값을 담되 너무 넓지 않게 잡고, observation 에도 noise 를 더합니다.'],
        [12, 15.8, '지형 curriculum 은 계단을 21.2 cm 까지 올리고, 2 초 이력의 student 는 teacher 를 따라 배웁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [
          0.4,
          6.8,
          '다음은 지난 데이터를 다시 쓰는 DQN → SAC, 큰 로봇 모델을 다시 학습하는 VLA + RL, World Model 입니다.',
          '다음은 지난 데이터를 다시 쓰는 DQN 에서 SAC, 큰 로봇 모델을 다시 학습하는 VLA 와 RL, World Model 입니다.',
        ],
      ],
    },
  ],
}
