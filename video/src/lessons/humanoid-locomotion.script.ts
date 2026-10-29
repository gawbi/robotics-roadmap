import type { VideoScript } from '../script.ts'

// Numbers follow lessons/humanoid-locomotion/README.md: why two legs are hard (35 kg G1 tips at 343.4 × 0.05 ÷ 0.6 ≈ 28.6 N,
// a 12 kg quadruped holds 117.7 × 0.2 ÷ 0.3 ≈ 78.5 N; Digit's 36 degrees of freedom = 6 + 8 + 8 + 4 + 10, 16 set by the
// policy; Humanoid-Gym's 100 actions a second, 0.64 s gait cycle = 64 step, a 0.3 s fall = 30 step); the gait clock
// (sin ≥ 0 left stance, < 0 right stance, 6 step of double support, 29 + 29 single support, +1 / −0.3 per foot, 0.35,
// A 64, B 6 + 58 × 0.35 = 26.3, C 6 − 58 × 0.3 = −11.4; swing 0.4 → 20% double support, 0.6 → running); the feet air time
// vs fractal comparison (H1, 10 robots a task: jump up 80 / 90%, leap 50 / 80%, stairs 90 / 100%, hurdle 20 / 100%); the
// check question (swing 0.3 → 0.3 ~ 0.5 and 0.8 ~ 1.0 = 40%); HT (66 + 48 = 114 a token, 16 step at 50 Hz = 16 × 0.02 =
// 0.32 s, 16 × 114 = 1,824, MLP 114 → 192, 4 blocks, 1.4 M parameters, Kp · Kd so 16 × 3 = 48; Transformer ≈ 97%, LSTM ≈ 89%,
// TCN ≈ 87%, MLP ≈ 76%; context 1 / 8 / 16 step → ≈ 0.62 / 0.71 / 0.75 m/s on a 25° slope at 1 m/s); in-context adaptation
// (sand: 0.1 ÷ 0.02 = 5 new tokens, 16 − 5 = 11 old, all 16 after 0.32 s; RMA's 8 values; 32 step → 3,648 and 0.64 s);
// teacher + RL (λ 1 → 0.5 → 0 at 0 / 25 / 50%, KL 0.4 → 0.4 / 0.2 / 0; RL only ≈ 0.15, imitation only ≈ 0.63, both ≈ 0.75
// m/s; 50 actions a second, PD 1,000; slopes to 10% grade ≈ 5.7°; λ from 2: 2 × (1 − 0.4) = 1.2, 1.2 × 0.5 = 0.6);
// pretraining + fine-tuning (over 1 billion RL step for HT; 10,000 × 10 = 100,000 s ≈ 27.8 h, 27 h reported; HT-2 slopes
// 2 ~ 20% grade, obstacles 0.5 ~ 5 cm, noise std 0.135, 2048 × 24 × 2000 = 98,304,000 ≈ 100 M step ≈ 1/10 of 1 billion;
// uphill 45.3 → 95.8%, push 5.8 → 87.6%, obstacles 24.9 → 93.2%; ≈ 100 M fine-tuned beats 200 M from scratch; ≈ 4.3 miles
// ≈ 6.9 km on 5 trails, 31% grade ≈ 17°); sim-to-sim (Isaac Gym env 8192 → calibrated MuJoCo → XBot-S 1.2 m / XBot-L
// 1.65 m; actor 2 + 3 + 12 + 12 + 3 + 3 + 12 = 47, × 15 step = 705 for 0.15 s; policy 100 a second, PD 1,000; critic 73 × 3;
// 15 → 10 step: 470 and 0.1 s); parkour (H1 ≈ 1.8 m, ≈ 47 kg, 19 joints, legs 0.4 + 0.4 = 0.8 m; commands −0.8 ~ 2.0 m/s;
// scandot 11 × 19 = 209 → 32, GRU + MLP, 10 terrains × 10 levels; depth 48 × 64 = 3,072 → CNN → 32; 24 h with 4 GPUs 85%,
// 1 GPU 40%, no oracle weights 0%; depth 10 / policy 50 / PD 1,000 a second, 50 ÷ 10 = 5; box 0.42 m 90% vs blind 0% and
// MPC 0%, hurdle 0.25 m 100% vs MPC 0%; 0.42 ÷ 0.8 ≈ 0.53, 0.25 ÷ 0.8 ≈ 0.31, 0.8 ÷ 0.8 = 1; 2 m/s × 0.1 s = 0.2 m = 20 cm, 5 computations).

const S1 = '2족 보행과 clock'
const S2 = 'causal Transformer'
const S3 = 'teacher · 사전 학습'
const S4 = 'MuJoCo 검증과 parkour'

export const script: VideoScript = {
  id: 'humanoid-locomotion',
  title: 'Humanoid Locomotion',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/humanoid-locomotion',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Humanoid Whole-Body Control', '휴머노이드 홀 바디 컨트롤'],
    ['asymmetric actor-critic', '어시메트릭 액터 크리틱'],
    ['in-context adaptation', '인 컨텍스트 어댑테이션'],
    ['Humanoid Locomotion', '휴머노이드 로코모션'],
    ['causal Transformer', '코절 트랜스포머'],
    ['causal mask', '코절 마스크'],
    ['periodic reward', '피리오딕 리워드'],
    ['Legged Balance', '레그드 밸런스'],
    ['KL divergence', '케이엘 다이버전스'],
    ['Humanoid-Gym', '휴머노이드 짐'],
    ['distillation', '디스틸레이션'],
    ['observation', '옵저베이션'],
    ['Transformer', '트랜스포머'],
    ['fine-tuning', '파인 튜닝'],
    ['simulation', '시뮬레이션'],
    ['privileged', '프리빌리지드'],
    ['Isaac Gym', '아이작 짐'],
    ['simulator', '시뮬레이터'],
    ['parameter', '파라미터'],
    ['iteration', '이터레이션'],
    ['mask token', '마스크 토큰'],
    ['humanoid', '휴머노이드'],
    ['Unitree', '유니트리'],
    ['student', '스튜던트'],
    ['teacher', '티처'],
    ['encoder', '인코더'],
    ['parkour', '파쿠르'],
    ['fractal', '프랙탈'],
    ['network', '네트워크'],
    ['context', '컨텍스트'],
    ['reward', '리워드'],
    ['weight', '웨이트'],
    ['MuJoCo', '무조코'],
    ['stance', '스탠스'],
    ['oracle', '오라클'],
    ['sample', '샘플'],
    ['critic', '크리틱'],
    ['Zhuang', '주앙'],
    ['Digit', '디짓'],
    ['token', '토큰'],
    ['phase', '페이즈'],
    ['swing', '스윙'],
    ['causal', '코절'],
    ['clock', '클록'],
    ['motor', '모터'],
    ['depth', '뎁스'],
    ['actor', '액터'],
    ['block', '블록'],
    ['XBot', '엑스봇'],
    ['HT-2', '에이치티 투'],
    ['LSTM', '엘에스티엠'],
    ['trot', '트롯'],
    ['mask', '마스크'],
    ['CNN', '씨엔엔'],
    ['GRU', '지알유'],
    ['MLP', '엠엘피'],
    ['MPC', '엠피씨'],
    ['PPO', '피피오'],
    ['TCN', '티씨엔'],
    ['sin', '사인'],
    ['m/s', '미터 퍼 세컨드'],
    ['G1', '지 원'],
    ['H1', '에이치 원'],
    ['HT', '에이치티'],
    ['KL', '케이엘'],
    ['PD', '피디'],
    ['RL', '알엘'],
    ['kg', '킬로그램'],
    ['cm', '센티미터'],
    ['N', '뉴턴'],
    ['λ', '람다'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '두 발로 걷는 humanoid 를 simulation 에서만 학습한 policy 로 산길과 장애물을 넘게 하는 법입니다.'],
        [4.2, 7.8, '2족 보행이 어려운 이유, clock, 이력을 읽는 Transformer, teacher 와 사전 학습, parkour 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '4족 policy 는 걸음을 정해 주지 않아도 trot 으로 수렴했지만, 처음부터 학습한 Digit 은 왼다리를 끌었습니다.'],
        [4.4, 7.8, '두 발 로봇에게 발을 언제 들고 디딜지를 무엇으로 알려 주고, 산길과 장애물을 넘게 하려면 무엇을 더해야 할까요?'],
      ],
    },
    {
      id: 'hard',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '딛는 넓이가 좁아서 한 발로 선 35 kg G1 은 약 28.6 N 에 넘어가고, 12 kg 4족 로봇은 약 78.5 N 을 버팁니다.'],
        [6.5, 13, '몸통을 직접 미는 motor 도 없습니다. Digit 의 자유도 36 개 가운데 policy 가 정하는 것은 16 개뿐입니다.'],
        [13, 19.5, '넘어지면 episode 가 끝납니다. Humanoid-Gym 에서 0.3 초 만에 넘어지면 30 step 으로 끝납니다.'],
        [19.5, 25.8, '정해진 걸음도 없습니다. 속도만 적은 reward 로 학습하면 걸음이 매번 달라져서, 발을 들게 하는 항목이 필요합니다.'],
      ],
    },
    {
      id: 'clock',
      seconds: 32,
      section: S1,
      cues: [
        [0.3, 6.5, '한 주기 안의 위치를 0 에서 1 로 센 값이 phase 이고, periodic reward 는 구간마다 발이 지킬 약속을 정합니다.'],
        [6.5, 13, '한 주기는 0.64 초, 64 step 입니다. sin 이 0 이상이면 왼발이 딛고, 0 보다 작으면 오른발이 딛습니다.'],
        [13, 19, '접촉이 약속과 맞으면 +1, 틀리면 −0.3 을 주고 두 발의 평균을 냅니다. 약속대로 걸으면 한 주기에 64 점입니다.'],
        [19, 25.5, '두 발을 늘 바닥에 두면 26.3 점이고, 순서를 거꾸로 하면 −11.4 점이라서 policy 는 clock 에 박자를 맞춥니다.'],
        [25.5, 31.8, 'clock 은 박자를 바꾸는 도약을 막습니다. fractal 지형으로 발을 들게 하자 허들 성공률이 20% 에서 100% 가 됐습니다.'],
      ],
    },
    {
      id: 'pause-clock',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 반 주기 어긋난 걸음의 swing 비율이 0.3 이면, 두 발이 함께 딛는 구간은 몇 % 일까요?', '멈추고 적어 보기. 반 주기 어긋난 걸음의 swing 비율이 0.3 이면, 두 발이 함께 딛는 구간은 몇 퍼센트일까요?'],
        [16.5, 23.5, '두 stance 가 겹치는 0.3 ~ 0.5 와 0.8 ~ 1.0 을 더하면 0.2 + 0.2 = 0.4, 40% 입니다.', '두 stance 가 겹치는 0.3 에서 0.5 와 0.8 에서 1.0 을 더하면 0.2 더하기 0.2, 0.4, 40% 입니다.'],
      ],
    },
    {
      id: 'transformer',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.3, 'HT 는 observation 66 개와 action 48 개를 이은 114 개를 token 하나로 보고, 16 step 을 읽습니다.'],
        [6.3, 12.3, '16 step 은 1초에 50 번이라 16 × 0.02 = 0.32 초이고, 숫자는 16 × 114 = 1,824 개입니다.', '16 step 은 1초에 50 번이라 16 곱하기 0.02, 0.32 초이고, 숫자는 16 곱하기 114, 1,824 개입니다.'],
        [12.3, 18.5, '같은 MLP 가 114 개를 192 차원으로 바꾸고, causal mask 를 쓴 block 4 개의 마지막 출력을 action 으로 바꿉니다.'],
        [18.5, 24, 'action 을 넣는 이유는 목표 각도와 실제 각도의 차이에 지형이 담기기 때문입니다. parameter 는 140 만 개입니다.'],
        [24, 29.8, 'network 만 바꾸면 성공률은 Transformer 약 97%, LSTM 약 89%, TCN 약 87%, MLP 약 76% 였습니다.'],
      ],
    },
    {
      id: 'incontext',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, '로봇 위에서 weight 는 바뀌지 않고 token 16 개만 바뀝니다. 이것이 in-context adaptation 입니다.'],
        [6.5, 13.5, '내리막에서는 발을 덜 들고 보폭을 줄였다가 평지에서 돌아왔고, 계단 턱에 걸리면 다음 시도에 다리를 더 높이 들었습니다.'],
        [13.5, 20.5, '모래에 들어선 0.1 초 뒤에는 0.1 ÷ 0.02 = 5 개가 모래 위 token 이고, 0.32 초 뒤에는 16 개가 다 바뀝니다.', '모래에 들어선 0.1 초 뒤에는 0.1 나누기 0.02, 5 개가 모래 위 token 이고, 0.32 초 뒤에는 16 개가 다 바뀝니다.'],
        [20.5, 27.8, 'context 1, 8, 16 step 으로 25° 경사를 오르면 평균 속도는 약 0.62, 0.71, 0.75 m/s 였습니다.'],
      ],
    },
    {
      id: 'pause-context',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. HT 의 context 를 16 step 에서 32 step 으로 늘리면 숫자는 몇 개이고 이력은 몇 초일까요?'],
        [16.5, 23.5, '32 × 114 = 3,648 개입니다. 한 step 이 0.02 초라서 32 × 0.02 = 0.64 초의 이력입니다.', '32 곱하기 114, 3,648 개입니다. 한 step 이 0.02 초라서 32 곱하기 0.02, 0.64 초의 이력입니다.'],
      ],
    },
    {
      id: 'teacher',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '관측만 받는 Transformer 를 처음부터 RL 로 학습하면 sample 이 많이 들어서, 학습을 두 단계로 나눕니다.'],
        [6, 12.5, '상태 전체를 받는 MLP teacher 를 먼저 학습하고, student 는 RL loss 에 따라 하기 항을 더해 학습합니다.'],
        [12.5, 18.5, '따라 하는 정도는 두 확률분포의 차이인 KL divergence 로 재고, weight λ 는 학습 절반에서 0 이 됩니다.'],
        [18.5, 24.5, 'λ 가 1 에서 시작하고 KL 이 늘 0.4 라면, 따라 하기 항은 0% 에서 0.4, 25% 에서 0.2, 50% 이후 0 입니다.'],
        [24.5, 29.8, '25° 경사에서 RL 만은 약 0.15 m/s, 따라 하기만은 약 0.63 m/s, 둘을 섞으면 약 0.75 m/s 였습니다.'],
      ],
    },
    {
      id: 'finetune',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'teacher 를 거쳐도 HT 는 10억 step 넘게 학습했습니다. 다음 관측과 action 을 맞히는 사전 학습을 더합니다.'],
        [6.5, 13, 'simulation 의 HT 궤적 1만 개는 10,000 × 10 = 100,000 초, 약 27.8 시간의 걷기 데이터입니다.', 'simulation 의 HT 궤적 1만 개는 10,000 곱하기 10, 100,000 초, 약 27.8 시간의 걷기 데이터입니다.'],
        [13, 19.5, 'HT-2 는 사전 학습 모델을 거친 지형에서 PPO 로 fine-tuning 합니다. 약 1억 step 으로 HT 의 약 10 분의 1 입니다.'],
        [19.5, 25.5, '성공률은 오르막 45.3% 에서 95.8% 로, 밀기 5.8% 에서 87.6% 로, 장애물 24.9% 에서 93.2% 로 올랐습니다.'],
        [25.5, 31.8, '처음부터 2억 step 학습한 policy 보다 높았고, 실제 Digit 은 카메라 없이 산길 약 4.3 마일을 걸었습니다.'],
      ],
    },
    {
      id: 'pause-lambda',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. λ 가 2 에서 학습 절반에 0 으로 줄 때, 20% 지점의 λ 와 KL 0.5 의 따라 하기 항은 얼마일까요?'],
        [16.5, 23.5, '20% 는 50% 까지의 0.4 만큼 온 곳이라 λ 는 2 × 0.6 = 1.2 이고, 따라 하기 항은 1.2 × 0.5 = 0.6 입니다.', '20% 는 50% 까지의 0.4 만큼 온 곳이라 λ 는 2 곱하기 0.6, 1.2 이고, 따라 하기 항은 1.2 곱하기 0.5, 0.6 입니다.'],
      ],
    },
    {
      id: 'sim2sim',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'Humanoid-Gym 은 Isaac Gym 에서 학습한 policy 를 MuJoCo 에서 다시 걷게 한 뒤 XBot 에 올립니다.'],
        [6.5, 13, 'simulator 마다 접촉 계산이 달라서, 다른 simulator 에서 다시 시험하는 단계가 sim-to-sim 검증입니다.', 'simulator 마다 접촉 계산이 달라서, 다른 simulator 에서 다시 시험하는 단계가 심 투 심 검증입니다.'],
        [13, 19.5, 'actor 는 한 step 47 개를 15 step 쌓아 47 × 15 = 705 개, 0.15 초의 이력을 봅니다.', 'actor 는 한 step 47 개를 15 step 쌓아 47 곱하기 15, 705 개, 0.15 초의 이력을 봅니다.'],
        [19.5, 25.8, 'critic 에만 privileged 값을 주는 asymmetric actor-critic 이라서 teacher 가 따로 없습니다.'],
      ],
    },
    {
      id: 'parkour',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '카메라가 없으면 발이 걸려야 턱을 알아챕니다. Zhuang 등은 H1 머리의 depth 카메라로 parkour 를 학습했습니다.'],
        [6.5, 13, '평지 걷기 policy 에 이어, 11 × 19 = 209 점의 높이를 32 개로 요약해 받는 oracle policy 를 학습합니다.', '평지 걷기 policy 에 이어, 11 곱하기 19, 209 점의 높이를 32 개로 요약해 받는 oracle policy 를 학습합니다.'],
        [13, 19.5, 'depth student 는 48 × 64 = 3,072 픽셀을 CNN 으로 32 개로 바꾸고, DAgger 로 oracle 을 배웁니다.', 'depth student 는 48 곱하기 64, 3,072 픽셀을 CNN 으로 32 개로 바꾸고, DAgger 로 oracle 을 배웁니다.'],
        [19.5, 25.8, 'depth encoder 는 1초에 10 번, policy 는 50 번 계산해서 depth 요약 하나를 50 ÷ 10 = 5 번 씁니다.', 'depth encoder 는 1초에 10 번, policy 는 50 번 계산해서 depth 요약 하나를 50 나누기 10, 5 번 씁니다.'],
        [25.8, 31.8, 'depth policy 는 다리 0.8 m 의 약 0.53 배인 0.42 m 상자를 10 번 중 9 번 넘었고, MPC 는 0% 였습니다.'],
      ],
    },
    {
      id: 'pause-depth',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. depth 요약은 1초에 10 번 옵니다. 2 m/s 로 달리면 요약 사이에 몇 cm 를 가고 몇 번 계산할까요?'],
        [16.5, 23.5, '요약 사이 0.1 초에 2 × 0.1 = 0.2 m, 20 cm 를 가고, policy 는 0.1 ÷ 0.02 = 5 번 계산합니다.', '요약 사이 0.1 초에 2 곱하기 0.1, 0.2 m, 20 cm 를 가고, policy 는 0.1 나누기 0.02, 5 번 계산합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. Digit 은 자유도 36 개 중 16 개만 정하고, clock 은 약속대로 걸으면 64 점, 거꾸로 걸으면 −11.4 점을 줍니다.'],
        [4.2, 8.1, 'HT 는 token 16 개, 0.32 초의 이력을 causal Transformer 로 읽어 weight 그대로 걸음을 바꿉니다.'],
        [8.1, 12, '따라 하기 항을 줄이며 RL 과 섞고, 사전 학습 뒤 약 1억 step 의 fine-tuning 으로 산길 약 4.3 마일을 걸었습니다.'],
        [12, 15.7, '보정한 MuJoCo 에서 다시 시험하고, depth parkour policy 는 0.42 m 상자를 10 번 중 9 번 넘었습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음은 사람 동작을 따라 하는 Humanoid Whole-Body Control 과 균형을 계산하는 Legged Balance 입니다.']],
    },
  ],
}
