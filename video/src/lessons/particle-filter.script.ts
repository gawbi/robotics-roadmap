import type { VideoScript } from '../script.ts'

// Numbers follow lessons/particle-filter/README.md: the corridor (20 m, doors at 4 m and 14 m, (4 + 14) ÷ 2 = 9 m, peak σ
// 0.4 m, 0.4² + 5² ≈ 25.2 m², σ ≈ 5 m; RHINO 20,000 samples); particles (x, y, θ, w; 20 m × 20 m at 5 cm and 1° →
// 400 × 400 × 360 ≈ 5,800 만 cells vs 2000 × 4 = 8000 numbers; grid needed 4 cm; 10 m × 10 m at 0.5 m × 0.5 m × 10° →
// 20 × 20 × 36 = 14,400, +height 10 m → × 20 = 288,000); one cycle (true 5.1 m; 4.0 4.2 3.7 4.6 3.3 → +1.0 1.1 0.9 1.2 0.8 →
// 5.0 5.3 4.6 5.8 4.1 m; wall 20 m, measured 14.9 m, σ 0.3 m; expected 15.0 14.7 15.4 14.2 15.9, diff 0.1 0.2 0.5 0.7 1.0,
// score 0.95 0.80 0.25 0.07 0.004, sum ≈ 2.07, weight 0.46 0.39 0.12 0.03 0.00; 0.95 ÷ 2.07 ≈ 0.46; resample 5.0 ×2, 5.3 ×2,
// 4.6 ×1, weights 1/5; weighted mean ≈ 5.09 m; check 2.0 2.5 3.0 m with 0.2 0.5 0.3 → 0.4 + 1.25 + 0.9 = 2.55 m, 10 → 2 5 3);
// likelihood field (σ = 0.2 m sigma_hit: d 0 0.1 0.2 0.3 0.4 1.0 m → 1.00 0.88 0.61 0.32 0.14 0.000004; A 0.05 0.1 0 m →
// 0.969 × 0.883 × 1 ≈ 0.855, B 0.35 0.4 0.3 m → 0.216 × 0.135 × 0.325 ≈ 0.0095, 0.3 m off → A 0.99 B 0.01; z_hit = z_rand
// = 0.5, max range 10 m: 0.5 × 1 + 0.5 ÷ 10 = 0.55, 0 + 0.05 = 0.05, 0.05 ÷ 0.55 ≈ 0.09); degeneracy (Labbe 5,000 / 3 /
// 4,997; N_eff = 1 ÷ Σw², 1 ÷ 0.379 ≈ 2.6, N / 2; resample_interval 1; (1 − 0.39)⁵ ≈ 0.084 ≈ 8%; low-variance start 0.12,
// needles 0.12 0.32 0.52 0.72 0.92 at 1/N = 0.2, cumulative 0.46 0.85); particle count (max_beams 60: 500 × 60 = 30,000,
// 2000 × 60 = 120,000; Dellaert 20,000 vs 5000 for MINERVA; KLD bin 0.5 m × 0.5 m × 10°, pf_err 0.05, pf_z 0.99, k 50 → 588,
// 100 → 1129, ≈ 11 per bin, min 500, max 2000; Fox 50,000 vs 3,000 at KL 0.25, 44 cm vs 114 cm); motion model (alpha1 ~ 4
// = 0.2, √(0.2 × 0.25²) ≈ 0.11 m, ≈ 0.11 rad, 6.4°; update_min_d 0.25 m, update_min_a 0.2 rad ≈ 11.5°); AMCL (particle
// 500 ~ 2000; set_initial_pose false; RViz σ 0.5 m, yaw 15°, 2 ~ 3 × → 1 ~ 1.5 m; 14,400 bins ÷ 2000 → 1 per 7 bins;
// recovery_alpha 0.0; check k 30 → 365 → 500).

const S1 = '봉우리가 여럿인 믿음'
const S2 = '한 cycle 의 세 단계'
const S3 = 'degeneracy 와 KLD'
const S4 = 'Nav2 의 AMCL'

export const script: VideoScript = {
  id: 'particle-filter',
  title: 'Particle Filter',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/particle-filter',
  sections: [S1, S2, S3, S4],
  terms: [
    ['effective sample size', '이펙티브 샘플 사이즈'],
    ['2D Pose Estimate', '투디 포즈 에스티메이트'],
    ['likelihood field', '라이클리후드 필드'],
    ['set_initial_pose', '셋 이니셜 포즈'],
    ['kidnapped robot', '키드냅트 로봇'],
    ['recovery_alpha', '리커버리 알파'],
    ['min_particles', '민 파티클스'],
    ['low-variance', '로 배리언스'],
    ['multinomial', '멀티노미얼'],
    ['LiDAR SLAM', '라이다 슬램'],
    ['map_server', '맵 서버'],
    ['degeneracy', '디제너러시'],
    ['resampling', '리샘플링'],
    ['odometry', '오도메트리'],
    ['Dellaert', '델라에르트'],
    ['Gaussian', '가우시안'],
    ['particle', '파티클'],
    ['sampling', '샘플링'],
    ['z_rand', '지 랜드'],
    ['belief', '빌리프'],
    ['filter', '필터'],
    ['sample', '샘플'],
    ['N_eff', '엔 이펙티브'],
    ['LiDAR', '라이다'],
    ['RHINO', '라이노'],
    ['noise', '노이즈'],
    ['cycle', '사이클'],
    ['Labbe', '라베'],
    ['alpha', '알파'],
    ['false', '폴스'],
    ['Nav2', '내브 투'],
    ['AMCL', '에이엠씨엘'],
    ['scan', '스캔'],
    ['beam', '빔'],
    ['odom', '오돔'],
    ['RViz', '알비즈'],
    ['KLD', '케이엘디'],
    ['Fox', '폭스'],
    ['bin', '빈'],
    ['map', '맵'],
    ['rad', '라디안'],
    ['yaw', '요'],
    ['tf', '티에프'],
    ['cm', '센티미터'],
    ['σ', '시그마'],
    ['θ', '세타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [
          0.4,
          4.2,
          'Particle filter 는 위치의 후보를 점 수백 ~ 수천 개로 뿌려 두고, 움직이면 함께 옮기고 센서와 맞는 점만 남깁니다.',
          'Particle filter 는 위치의 후보를 점 수백에서 수천 개로 뿌려 두고, 움직이면 함께 옮기고 센서와 맞는 점만 남깁니다.',
        ],
        [4.2, 7.8, '봉우리가 여럿인 믿음, 한 cycle 의 세 단계, degeneracy 와 KLD sampling, Nav2 의 AMCL 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '복도 양쪽 끝에 똑같은 회의실이 있으면, 두 회의실 문 앞에서 찍은 LiDAR scan 이 똑같이 나옵니다.'],
        [4.4, 7.8, '평균 하나와 분산 하나로는 적을 수 없는 두 후보를 함께 남기려면, 위치를 어떤 모양으로 기억해야 할까요?'],
      ],
    },
    {
      id: 'multimodal',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.3, '길이 20 m 복도의 4 m 와 14 m 에 똑같은 문이 있고, 로봇은 LiDAR 로 바로 옆에 문이 있다는 것을 알아냈습니다.'],
        [6.3, 12.3, 'belief 는 위치마다 로봇이 있을 확률을 적은 분포인데, 지금은 두 문 앞에 봉우리가 하나씩 솟은 모양입니다.'],
        [
          12.3,
          18.5,
          'Gaussian 하나로 맞추면 평균은 (4 + 14) ÷ 2 로 9 m 가 되고, σ 는 약 5 m 로 넓게 퍼집니다.',
          'Gaussian 하나로 맞추면 평균은 4 더하기 14 를 2 로 나눈 9 m 가 되고, σ 는 약 5 m 로 넓게 퍼집니다.',
        ],
        [18.5, 24.3, '그러면 9 m 근처가 가장 그럴듯하다는 답이 나오는데, 9 m 에는 문이 없으니 로봇이 거기 있을 리 없습니다.'],
        [24.3, 29.7, 'Dellaert 등의 실험에서도 RHINO 에 뿌린 sample 20,000 개가 대칭인 복도 때문에 두 곳에 모였습니다.'],
      ],
    },
    {
      id: 'particles',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'particle 은 위치 x, y 와 방향 θ 세 숫자에, 얼마나 그럴듯한지 적은 가중치 w 를 붙인 후보 하나입니다.'],
        [6.5, 13, 'particle 이 촘촘히 모인 곳일수록 로봇이 있을 확률이 높아서, 점의 배치만 바꾸면 어떤 belief 도 나타냅니다.'],
        [13, 19.5, '20 m × 20 m 를 5 cm 칸과 1° 로 나누면 약 5,800 만 칸이지만, particle 2000 개는 숫자 8000 개면 됩니다.'],
        [19.5, 25.7, '상태의 숫자가 하나 늘면 particle 이 곱으로 늘어나서, 바닥 로봇의 x, y, θ 처럼 숫자가 적은 상태에 주로 씁니다.'],
      ],
    },
    {
      id: 'pause-gauss',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 봉우리의 σ 가 0.4 m 이고 평균에서 5 m 씩 떨어져 있으면, Gaussian 하나의 분산은 얼마일까요?'],
        [
          16.5,
          23.5,
          '분산은 0.4² + 5² 로 약 25.2 m² 이고 σ 는 약 5 m 인데, 그 평균인 9 m 에는 문이 없습니다.',
          '분산은 0.4 의 제곱 더하기 5 의 제곱으로 약 25.2 제곱미터 이고 σ 는 약 5 m 인데, 그 평균인 9 m 에는 문이 없습니다.',
        ],
      ],
    },
    {
      id: 'cycle',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '실제 로봇은 5.1 m 에 있지만 로봇 자신은 이 값을 모르고, 복도 위 particle 5 개로 한 cycle 을 따라갑니다.'],
        [6.5, 12.8, '예측 단계는 odometry 의 1 m 에 particle 마다 noise 를 더해 옮겨서, 4.0 m 의 점은 5.0 m 로 갑니다.'],
        [12.8, 19.3, '가중치 단계에서는 LiDAR 가 잰 벽까지 14.9 m 와, particle 마다 예상한 거리의 차이로 점수를 매깁니다.'],
        [19.3, 25.5, '5.0 m 의 particle 은 15.0 m 를 예상해 0.1 m 차이라 점수 0.95 이고, 합 2.07 로 나누면 0.46 입니다.'],
        [25.5, 31.7, 'resampling 은 가중치에 비례해 5 번 다시 뽑아서, 5.0 m 와 5.3 m 는 두 개씩 남고 4.1 m 는 사라집니다.'],
      ],
    },
    {
      id: 'field',
      seconds: 27,
      section: S2,
      cues: [
        [0.3, 6.8, '실제 LiDAR 는 scan 한 번에 점을 수백 개 내서, likelihood field 는 선을 긋지 않고 beam 끝점만 봅니다.'],
        [6.8, 13.3, '끝점에서 가장 가까운 벽까지 거리 d 로 점수를 매겨, σ 가 0.2 m 면 d 0.1 m 는 0.88, 0.3 m 는 0.32 입니다.'],
        [13.3, 20, 'beam 점수를 곱하면 A 는 약 0.855, 0.3 m 어긋난 B 는 약 0.0095 라서 가중치는 0.99 대 0.01 입니다.'],
        [20, 26.7, '사람에 맞은 beam 이 점수를 0 으로 만들지 않게, AMCL 은 z_rand 로 바닥 값을 깔아 약 0.09 배로만 줄입니다.'],
      ],
    },
    {
      id: 'pause-mean',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 2.0, 2.5, 3.0 m 의 가중치가 0.2, 0.5, 0.3 이면 가중 평균과 10 개로 다시 뽑은 개수는?'],
        [
          16.5,
          23.5,
          '가중 평균은 0.4 + 1.25 + 0.9 로 2.55 m 이고, 10 개로 다시 뽑으면 평균 2, 5, 3 개씩 복사됩니다.',
          '가중 평균은 0.4 더하기 1.25 더하기 0.9 로 2.55 m 이고, 10 개로 다시 뽑으면 평균 2, 5, 3 개씩 복사됩니다.',
        ],
      ],
    },
    {
      id: 'degeneracy',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'resampling 없이 가중치만 곱해 가면 particle 하나가 거의 다 차지하는데, 이것이 degeneracy 입니다.'],
        [6.5, 12.8, 'Labbe 의 예에서는 5,000 개 중 의미 있는 가중치가 3 개뿐이라, 나머지 4,997 개는 추정에 거의 보탬이 안 됩니다.'],
        [12.8, 19, 'degeneracy 는 effective sample size N_eff 로 재고, 다섯 가중치로는 1 ÷ 0.379 로 약 2.6 입니다.'],
        [19, 25.2, 'multinomial 방식은 난수를 따로 뽑아서, 가중치 0.39 인 particle 이 한 번도 안 뽑힐 확률이 약 8% 입니다.'],
        [25.2, 31.5, 'low-variance 방식은 시작점 하나만 뽑고 0.2 간격으로 바늘을 꽂아서, 가중치 0.2 이상인 점은 꼭 남깁니다.'],
      ],
    },
    {
      id: 'kld',
      seconds: 27,
      section: S3,
      cues: [
        [0.3, 6.8, 'particle 500 개면 cycle 마다 500 × 60 으로 30,000 번, 2000 개면 120,000 번 끝점을 계산합니다.'],
        [6.8, 13.3, '무작정 늘리면 한 번 계산하는 사이 들어온 측정을 버리게 되어, Dellaert 등은 오차가 다시 커졌다고 보고했습니다.'],
        [13.3, 20, 'KLD sampling 은 particle 이 든 bin 수 k 로 개수를 정해서, 50 이면 588 개, 100 이면 1129 개입니다.'],
        [20, 26.7, 'Fox 의 실험에서 고정 개수 방식이 50,000 개로 닿은 수준에, KLD sampling 은 평균 3,000 개로 닿았습니다.'],
      ],
    },
    {
      id: 'pause-neff',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. particle N 개의 가중치가 모두 같을 때와, 하나가 전부를 가질 때 N_eff 는 각각 얼마일까요?'],
        [16.5, 23.5, '모두 같으면 N_eff 는 particle 수 N 이고, 하나가 전부를 가지면 1 이라서 degeneracy 가 끝까지 간 상태입니다.'],
      ],
    },
    {
      id: 'motion',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'AMCL 은 odometry 의 움직임을 제자리 회전, 직진, 제자리 회전으로 나눠 각 동작에 Gaussian noise 를 더합니다.'],
        [
          6.5,
          13,
          'alpha 기본값 0.2 로 0.25 m 를 직진하면, noise 의 표준편차는 √(0.2 × 0.25²) 로 약 0.11 m 입니다.',
          'alpha 기본값 0.2 로 0.25 m 를 직진하면, noise 의 표준편차는 0.2 × 0.25² 의 제곱근으로 약 0.11 m 입니다.',
        ],
        [13, 19.5, '너무 줄이면 미끄러질 때 particle 이 못 따라가고, 너무 키우면 무리가 넓어져 추정이 흔들립니다.'],
        [19.5, 25.7, 'cycle 은 0.25 m 이상 움직이거나 0.2 rad 이상 돌 때만 수행해서, 세워 둔 로봇의 particle 은 모이지 않습니다.'],
      ],
    },
    {
      id: 'amcl',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, 'AMCL 은 LiDAR scan, map_server 의 지도, odometry 의 tf 를 받아 map → odom tf 로 위치를 냅니다.'],
        [6.5, 13, 'set_initial_pose 가 기본값 false 라서, 처음에는 RViz 의 2D Pose Estimate 로 초기 위치를 줍니다.'],
        [
          13,
          19.5,
          'RViz 의 표준편차가 0.5 m, yaw 15° 라서, 클릭이 1 ~ 1.5 m 넘게 어긋나면 근처에 particle 이 거의 없습니다.',
          'RViz 의 표준편차가 0.5 m, yaw 15° 라서, 클릭이 1 에서 1.5 m 넘게 어긋나면 근처에 particle 이 거의 없습니다.',
        ],
        [19.5, 25.5, '지도 전체에 뿌리면 10 m × 10 m 에도 bin 이 14,400 개라, particle 2000 개는 bin 7 개에 하나꼴입니다.'],
        [25.5, 31.7, 'kidnapped robot 이면 틀린 후보끼리 복사할 뿐인데, 복구용 recovery_alpha 는 기본값 0.0 이라 꺼져 있습니다.'],
      ],
    },
    {
      id: 'pause-kidnap',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. KLD 식이 365 개를 내면 AMCL 은 몇 개를 쓰고, 다른 방으로 옮겨진 로봇은 스스로 위치를 되찾을까요?'],
        [16.5, 23.5, '365 는 min_particles 500 보다 작아 500 개를 씁니다. 새 방엔 후보가 없고 복구 기능도 꺼져 있어 어렵습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [
          0.3,
          4.2,
          '답입니다. 위치를 particle 수백 ~ 수천 개로 기억하면, 4 m 와 14 m 두 문 앞의 봉우리를 함께 남길 수 있습니다.',
          '답입니다. 위치를 particle 수백에서 수천 개로 기억하면, 4 m 와 14 m 두 문 앞의 봉우리를 함께 남길 수 있습니다.',
        ],
        [4.2, 8.2, '한 cycle 은 noise 를 섞은 예측, likelihood field 로 매기는 가중치, 가중치에 비례한 resampling 입니다.'],
        [8.2, 12.2, 'resampling 은 degeneracy 를 막지만 새 자리를 못 만들고, KLD sampling 이 bin 수로 개수를 고릅니다.'],
        [
          12.2,
          15.7,
          'Nav2 의 AMCL 은 particle 500 ~ 2000 개로, 0.25 m 나 0.2 rad 움직일 때마다 한 cycle 을 수행합니다.',
          'Nav2 의 AMCL 은 particle 500 에서 2000 개로, 0.25 m 나 0.2 rad 움직일 때마다 한 cycle 을 수행합니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'AMCL 이 쓰는 지도를 만들려면 지도와 위치를 동시에 추정해야 하는데, 이 방법은 다음 강의 LiDAR SLAM 에서 다룹니다.']],
    },
  ],
}
