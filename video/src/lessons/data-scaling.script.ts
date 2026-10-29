import type { VideoScript } from '../script.ts'

// Numbers follow lessons/data-scaling/README.md: UMI's opening (2 people, 1 lab, 305 demos → 20/20 in the lab, nothing at
// a new café; 3 people, 30 places, 1,400 demos → 43/60 = 71.7% at two new places); Lin et al.'s ≥ 40,000 demos and
// ≥ 15,000 real trials, 32 environments × 50 demos, ≈ 90%; OXE (21 institutions, 34 labs, 60 datasets, 22 robots, > 1M
// trajectories, 527 skills; 7 action numbers, 256 bins, per-dataset normalisation: A ±2 cm, B ±0.5 cm → 1 cm and 0.25 cm
// both 0.5, B = a quarter of A; RT-1-X 35M parameters, 9 robots / 12 datasets, better on 4 of 5 small datasets, +50% =
// 1.5×; Bridge Stanford 40 / 27 / 50, Bridge Berkeley 30 / 27 / 30, Google robot 92 / 73 / 91, RT-2-X 55B; emergent skill
// 27.3% → 75.8% ≈ 2.8×, 42.8% without Bridge); CLIP's 400M pairs; DROID (18 robots, 13 institutions, 50 people, 12 months,
// 76,000 successes = 350 h, ≈ 16,000 failures, 15 a second, 350 × 3600 × 15 = 18.9M frames, 564 scenes in 52 buildings,
// 76,000 ÷ 564 ≈ 135, 1,417 viewpoints, 86 verbs, ≈ 100 demos ≈ 20 min a scene, OXE ≈ 300 scenes; co-training with 50 ~ 150
// demos: +22%p and +17%p; 7,362 demos from 20 scenes = 368 each vs spread over 564 ≈ 13 each); the collection rates (35 /
// 111 / 231 an hour, 1000 ÷ 35 ≈ 28.6 h, 1000 ÷ 111 ≈ 9.0 h, 1000 ÷ 231 ≈ 4.3 h; check 500 ÷ 35 ≈ 14.3, 500 ÷ 111 ≈ 4.5,
// 111 ÷ 35 ≈ 3.2); UMI ($73 gripper, $298 GoPro, 780 g, 20/20 on UR5, Franka FR2 18/20, 155° fisheye vs 69° crop 11/20,
// mirrors flipped 20 / as-is 17 / none 18, SLAM 6.1 mm and 3.5°, 6 DoF); latency matching (10 a second = 100 ms, 80 + 120
// + 100 = 300 ms, drop 0 · 100 · 200 ms, 0.5 m/s × 0.3 s = 0.15 m = 15 cm, gripper 120 vs arm 100 → 20 ms earlier,
// throwing 105/120 = 87.5% vs 69/120 = 57.5%, ≈ 90% of UMI demos usable, 48% of bare-hand speed; check 60 + 90 + 100 = 250
// ms, 5 dropped at 50 ms); the scaling law (Pour Water, Mouse Arrangement, 32 objects / 32 environments / 32 pairs × 120
// demos, 1 · 2 · 4 · 8 · 16 · 32, 100% … 3.125%, 8 objects > 0.8, 50% ≈ 100%, gap = 1.263 × x^−0.683, 2^−0.683 ≈ 0.62,
// pairs 8 / 16 / 32 / 64 → gap 0.31 / 0.19 / 0.12 / 0.074 → score 0.69 / 0.81 / 0.88 / 0.93, steps +0.12 / +0.07 / +0.05,
// 1,191 pairs for 0.99; environments × objects table 0.14 0.37 0.44 0.36 / 0.46 0.61 0.54 0.52 / 0.74 0.76 0.79 0.73;
// plateaus at 400 / 800 / 1,600 = 50 a pair; 32 × 50 = 1,600, 4 people, one afternoon, 8 new environments 87.5% and 90.0%;
// ViT-S / B / L 0.66 / 0.81 / 0.90, from scratch 0.03; check 0.80 → gap 0.20 → 0.124 → 0.077 → 0.92); MimicGen (mug at
// (40, 0), approach (40, −10) → (40, −2); new mug (60, 20) turned 90° → (70, 20) → (62, 20); 10 → 1,000 demos; Square 11.3
// → 90.7%, Threading 19.3 → 98.0%, Three Piece Assembly 1.3 → 82.0%; 18 tasks, ≈ 200 → 50,000+; 200 → 1,000 big, 1,000 →
// 5,000 small; Gear Assembly D1 rate 8.2%, 1000 ÷ 0.082 ≈ 12,200 tries, 76.0%; Three Piece D1 fills 43.5% of cells; real
// 243 → 200 = 82.3% and 192 → 100 = 52.1%, policies 36% and 14%, 10 demos → 0%; check 1000 ÷ 0.25 = 4,000); DemoGen (±1.5
// cm, 9 a layout, 0.01 s, 8 tasks 11.0% → 74.6%); curation (LoRA MSE 0.0049 vs 0.006, scores 0.72 vs 0.90; CUPID 25
// rollouts, TuckBox push : pick 2 : 1, 0% → 84 ~ 88%; check +0.1 +0.3 +0.6 with + + − → −0.2); π0.5 (five data kinds,
// MM ≈ 100 homes ≈ 400 h, 1% / 99% quantiles → −1 ~ 1, 3 · 12 · 22 · 53 · 82 · 104 places, 40,000 steps, 97.6% non-target).

const S1 = 'OXE 와 DROID'
const S2 = 'UMI 로봇 없는 수집'
const S3 = 'data scaling law'
const S4 = '합성 · 고르기 · 섞기'

export const script: VideoScript = {
  id: 'data-scaling',
  title: 'Robot Data Scaling',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/data-scaling',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Three Piece Assembly', '스리 피스 어셈블리'],
    ['Mouse Arrangement', '마우스 어레인지먼트'],
    ['Open X-Embodiment', '오픈 엑스 임바디먼트'],
    ['Robot Data Scaling', '로봇 데이터 스케일링'],
    ['data scaling law', '데이터 스케일링 로'],
    ['latency matching', '레이턴시 매칭'],
    ['image encoder', '이미지 인코더'],
    ['encoder', '인코더'],
    ['point cloud', '포인트 클라우드'],
    ['underfitting', '언더피팅'],
    ['pretraining', '프리트레이닝'],
    ['Pour Water', '포어 워터'],
    ['pretrained', '프리트레인드'],
    ['spacemouse', '스페이스마우스'],
    ['trajectory', '트래젝토리'],
    ['simulation', '시뮬레이션'],
    ['Threading', '스레딩'],
    ['influence', '인플루언스'],
    ['parameter', '파라미터'],
    ['power law', '파워 로'],
    ['GR00T N1', '그루트 엔 원'],
    ['MimicGen', '미믹젠'],
    ['quantile', '퀀타일'],
    ['humanoid', '휴머노이드'],
    ['dataset', '데이터셋'],
    ['fisheye', '피시아이'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['DemoGen', '데모젠'],
    ['TuckBox', '턱박스'],
    ['Google', '구글'],
    ['Square', '스퀘어'],
    ['weight', '웨이트'],
    ['RT-1-X', '알티 원 엑스'],
    ['RT-2-X', '알티 투 엑스'],
    ['robot', '로봇'],
    ['frame', '프레임'],
    ['GoPro', '고프로'],
    ['CUPID', '큐피드'],
    ['DROID', '드로이드'],
    ['ViT-S', '비트 에스'],
    ['ViT-B', '비트 비'],
    ['ViT-L', '비트 엘'],
    ['π0.5', '파이 영 점 오'],
    ['LoRA', '로라'],
    ['SLAM', '슬램'],
    ['RT-X', '알티 엑스'],
    ['RT-2', '알티 투'],
    ['UR5', '유알 파이브'],
    ['OXE', '오엑스이'],
    ['UMI', '유엠아이'],
    ['IMU', '아이엠유'],
    ['VLA', '브이엘에이'],
    ['DoF', '디오에프'],
    ['Lin', '린'],
    ['gap', '갭'],
    ['π0', '파이 제로'],
    ['RL', '알엘'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Robot Data Scaling 은 처음 보는 곳에서도 일하는 policy 를 위해 시연을 어디서 얼마나 모을지를 다룹니다.'],
        [4.2, 7.8, '여러 로봇의 데이터를 합친 OXE 와 DROID, 로봇 없는 UMI, data scaling law, 합성과 고르기를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '실험실 한 곳의 시연 305 개로 학습한 policy 는 그곳에서 20 번 모두 성공했지만, 새 카페에서는 움직이지 않았습니다.'],
        [4.4, 7.8, '30 곳의 시연 1,400 개로 학습하자 새 장소에서 60 번 중 43 번 성공했습니다. 어떤 시연을 얼마나 모아야 할까요?'],
      ],
    },
    {
      id: 'oxe',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'OXE 는 dataset 60 개를 한 형식으로 모았습니다. 로봇 22 종, trajectory 100 만 개 이상입니다.'],
        [6, 12, 'RT-X 는 action 을 손끝 자세와 집게의 숫자 7 개로 바꾸고, 크기는 dataset 마다 따로 정규화합니다.'],
        [12, 18, '최대 ±2 cm 인 로봇 A 의 1 cm 와 최대 ±0.5 cm 인 로봇 B 의 0.25 cm 가 똑같이 0.5 가 됩니다.'],
        [18, 24, '데이터가 적은 dataset 5 개에서 RT-1-X 는 5 개 중 4 개가 원래 방법보다 나았고 평균 50% 높았습니다.'],
        [24, 30, '데이터가 많은 Google 로봇에서는 RT-1 92% 에 RT-1-X 73% 로, 작은 모델의 underfitting 입니다.'],
      ],
    },
    {
      id: 'droid',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 7, '로봇 데이터는 관측과 그 순간의 action 이 함께 있어야 해서 웹에서 긁어 올 수 없고, 사람과 로봇이 함께 있어야 합니다.'],
        [7, 14.5, 'DROID 는 로봇 18 대로 50 명이 12 개월 동안 성공 시연 76,000 개를 모았습니다. 장면은 564 곳입니다.'],
        [14.5, 22, '1 초에 15 번 기록해 frame 은 1,890 만 개지만 이웃 frame 은 거의 같습니다. 일반화는 장면의 가짓수가 좌우합니다.'],
        [22, 30, 'DROID 를 절반 섞은 Diffusion Policy 는 22%p 높았고, 7,362 개라도 장면 20 곳보다 흩어진 쪽이 높았습니다.', 'DROID 를 절반 섞은 Diffusion Policy 는 22 퍼센트 포인트 높았고, 7,362 개라도 장면 20 곳보다 흩어진 쪽이 높았습니다.'],
      ],
    },
    {
      id: 'pause-oxe',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 로봇 C 는 최대 ±4 cm 를 옮기고 최댓값으로 정규화했습니다. 모델이 −0.25 를 냈다면 보낼 이동량은?'],
        [16.5, 23.5, '정규화할 때 4 cm 로 나눴으니 되돌릴 때는 4 cm 를 곱합니다. −0.25 × 4 는 −1 이라서 x 쪽으로 −1 cm 입니다.'],
      ],
    },
    {
      id: 'umi',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 7, '1 시간에 모은 컵 정리 시연은 spacemouse 조종이 35 개, 손에 쥐는 UMI 집게가 111 개, 맨손이 231 개입니다.'],
        [7, 14, '시연 1,000 개에 조종은 1000 ÷ 35 로 약 28.6 시간, UMI 는 약 9.0 시간입니다. 맨손은 바로 못 씁니다.'],
        [14, 22, 'UMI 는 사람이 3D 프린터로 만든 집게를 들고 다니며 모읍니다. 센서는 GoPro 하나이고, 로봇 팔에도 같은 집게를 답니다.'],
        [22, 30, '손목 카메라, 155° fisheye, 거울, SLAM 과 IMU 의 궤적을 갖춘 policy 는 20 번 중 20 번 성공했습니다.'],
      ],
    },
    {
      id: 'latency',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '손에 든 UMI 는 사진과 궤적이 GoPro 한 대에서 나와 같은 순간이지만, 로봇에서는 전송, 추론, 실행에 시간이 걸립니다.'],
        [7, 14.5, '사진 80 ms, 추론 120 ms, 팔 100 ms 면 첫 명령은 300 ms 뒤라서 그 전의 action 셋은 버립니다.'],
        [14.5, 21.5, '안 맞추면 1 초에 0.5 m 일 때 0.5 × 0.3 으로 15 cm 어긋납니다. 던지기는 켜면 87.5%, 끄면 57.5% 입니다.'],
        [21.5, 28, '한계도 있습니다. SLAM 은 흰 벽에서 궤적을 잃어 Lin 등은 시연의 약 90% 만 썼고, 수집 속도는 맨손의 48% 입니다.'],
      ],
    },
    {
      id: 'pause-latency',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1 초에 20 번 action 을 내고 카메라 60 ms, 추론 90 ms, 팔 100 ms 면 몇 개를 버릴까요?'],
        [16.5, 23.5, '60 + 90 + 100 은 250 ms 라서, 50 ms 간격의 0 부터 200 ms 까지 다섯 개를 버리고 250 ms 부터 보냅니다.', '60 더하기 90 더하기 100 은 250 ms 라서, 50 ms 간격의 0 부터 200 ms 까지 다섯 개를 버리고 250 ms 부터 보냅니다.'],
      ],
    },
    {
      id: 'scaling',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'Lin 등은 시연 4 만 개 이상과 실물 시험 1 만 5 천 번 이상으로 무엇을 늘려야 하는지 쟀습니다.'],
        [6, 12, '한 환경에서 물체 32 개, 환경 32 곳에 같은 물체, 환경 32 곳에 다른 물체 32 개로 각각 시연 120 개씩 모았습니다.'],
        [12, 18, '가짓수를 늘리면 새 환경·물체의 점수가 꾸준히 올랐지만, 가짓수를 고정하고 시연만 늘리면 50% 와 100% 가 거의 겹쳤습니다.'],
        [18, 24, '1 − 점수인 gap 은 쌍이 두 배가 될 때마다 0.62 배가 됩니다. 이렇게 같은 비율로 주는 관계가 power law 입니다.', '1 빼기 점수인 gap 은 쌍이 두 배가 될 때마다 0.62 배가 됩니다. 이렇게 같은 비율로 주는 관계가 power law 입니다.'],
        [24, 30, '쌍 8 개에서 0.69 면 16 개는 0.81, 32 개는 0.88, 64 개는 0.93 입니다. 0.99 에는 쌍 1,191 개로 예측됩니다.'],
      ],
    },
    {
      id: 'plan',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '환경 1 곳에 물체 1 개면 0.14, 16 곳이면 0.74 였고, 16 곳에서 물체를 4 개로 늘려도 0.73 ~ 0.79 였습니다.', '환경 1 곳에 물체 1 개면 0.14, 16 곳이면 0.74 였고, 16 곳에서 물체를 4 개로 늘려도 0.73 에서 0.79 였습니다.'],
        [7, 14, '저자들은 환경을 최대한 많이 두고 환경마다 물체는 하나만 쓰라고 권했습니다. 시연은 쌍마다 50 개쯤에서 멈췼습니다.'],
        [14, 21, '쌍 32 개 × 50 개 = 1,600 개 계획으로 4 명이 한나절에 모으자 새 환경 8 곳에서 87.5% 와 90.0% 였습니다.', '쌍 32 개에 50 개씩 1,600 개 계획으로 4 명이 한나절에 모으자 새 환경 8 곳에서 87.5% 와 90.0% 였습니다.'],
        [21, 28, 'encoder 가 점수를 갈랐습니다. ViT-S, B, L 이 0.66, 0.81, 0.90 이고, 처음부터 학습하면 0.03 입니다.'],
      ],
    },
    {
      id: 'pause-scaling',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 쌍이 두 배면 gap 이 0.62 배가 됩니다. 쌍 16 개에서 0.80 이면 64 개에서는 몇 점쯤일까요?'],
        [16.5, 23.5, 'gap 은 1 − 0.80 으로 0.20, 32 개에서 0.124, 64 개에서 약 0.077 입니다. 점수는 약 0.92 입니다.', 'gap 은 1 빼기 0.80 으로 0.20, 32 개에서 0.124, 64 개에서 약 0.077 입니다. 점수는 약 0.92 입니다.'],
      ],
    },
    {
      id: 'mimicgen',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, '사람 시연은 대부분 물체에 다가가는 움직임이라 잔 기준으로는 거의 같습니다. MimicGen 은 시연을 새 물체 위치로 옮깁니다.'],
        [7, 14.5, '잔 (40, 0) 에 (40, −10) 에서 다가간 구간은, 잔이 (60, 20) 에 90° 돌면 (70, 20) 에서 다가갑니다.', '잔 40, 0 에 40, −10 에서 다가간 구간은, 잔이 60, 20 에 90° 돌면 70, 20 에서 다가갑니다.'],
        [14.5, 22, '시연 10 개로 1,000 개를 만들자 Square 는 11.3% 에서 90.7% 로, Threading 은 98.0% 로 올랐습니다.'],
        [22, 30, '배치가 치우치는 한계도 있습니다. DemoGen 은 point cloud 를 옮겨 작업 8 개를 11.0% 에서 74.6% 로 올렸습니다.'],
      ],
    },
    {
      id: 'cupid',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '성공한 시연에도 해로운 것이 섞입니다. 떼어 둔 시연의 action 을 맞히는 validation MSE 는 실물과 어긋납니다.'],
        [6.5, 13, 'LoRA 로만 고친 policy 는 MSE 0.0049 로 0.006 보다 낮지만 실물 점수는 0.72 로 0.90 보다 낮았습니다.'],
        [13, 19.5, 'CUPID 는 실행 25 번의 기록으로, 성공한 실행을 키우는 시연에 + 를, 실패한 실행을 키우는 시연에 − 를 더합니다.', 'CUPID 는 실행 25 번의 기록으로, 성공한 실행을 키우는 시연에 플러스를, 실패한 실행을 키우는 시연에 마이너스를 더합니다.'],
        [19.5, 26, '밀기와 집어 옮기기가 2 : 1 인 TuckBox policy 는 늘 밀어 실패했지만, − 시연을 지우자 84 ~ 88% 가 됐습니다.', '밀기와 집어 옮기기가 2 대 1 인 TuckBox policy 는 늘 밀어 실패했지만, 마이너스 시연을 지우자 84 에서 88% 가 됐습니다.'],
        [26, 32, 'π0.5 는 1% 와 99% quantile 로 정규화해 섞고, 장소를 3 곳에서 104 곳으로 늘리자 새 집의 점수가 올랐습니다.'],
      ],
    },
    {
      id: 'pause-cupid',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 실행이 성공, 성공, 실패이고 influence 가 +0.1, +0.3, +0.6 인 시연의 점수는 얼마일까요?'],
        [16.5, 23.5, '성공은 +1, 실패는 −1 을 곱해 더하면 0.1 + 0.3 − 0.6 으로 −0.2 입니다. − 라서 지울 후보입니다.', '성공은 +1, 실패는 −1 을 곱해 더하면 0.1 더하기 0.3 빼기 0.6 으로 −0.2 입니다. 마이너스라서 지울 후보입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.3, '답입니다. OXE 는 dataset 60 개를 action 7 개로 맞췄고, DROID 는 장면 564 곳으로 22%p 를 더했습니다.', '답입니다. OXE 는 dataset 60 개를 action 7 개로 맞췄고, DROID 는 장면 564 곳으로 22 퍼센트 포인트를 더했습니다.'],
        [4.3, 8.3, 'UMI 는 손목 카메라, SLAM, latency matching 으로 시연을 옮기고, 안 맞추면 87.5% 가 57.5% 입니다.'],
        [8.3, 12.3, 'gap 은 환경·물체 쌍의 power law 로 줄어 쌍이 두 배면 0.62 배이고, 쌍마다 시연은 50 개쯤에서 효과가 멈춥니다.'],
        [12.3, 15.8, 'MimicGen 은 10 개를 1,000 개로 늘리고, CUPID 는 0% 를 84 ~ 88% 로 올리고, VLA 는 데이터를 섞습니다.', 'MimicGen 은 10 개를 1,000 개로 늘리고, CUPID 는 0% 를 84 에서 88% 로 올리고, VLA 는 데이터를 섞습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '다음은 이 데이터로 학습하는 VLA 입니다. RT-2 → OpenVLA 와 π0, GR00T N1, VLA + RL 로 이어집니다.', '다음은 이 데이터로 학습하는 VLA 입니다. RT-2, OpenVLA 와 π0, GR00T N1, VLA 플러스 RL 로 이어집니다.'],
      ],
    },
  ],
}
