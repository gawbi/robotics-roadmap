import type { VideoScript } from '../script.ts'

// Numbers follow lessons/groot/README.md: humanoid data (GR-1 조종 88 시간 / 88.4 시간, π0 약 10,000 시간, 100 분의 1 도
// 안 됨, 20 Hz); table 7 hours (꼭대기 3,288.8 = GR-1 88.4 + AgiBot-Alpha 1,979.4 + DROID 428.3 등, 가운데 2,569.9 =
// simulation 1,742.6 + 생성 영상 827.3, 바닥 2,517.0 = Ego4D 2,144.7 등 7 가지, 합 8,375.7); neural trajectory (88 시간으로
// fine-tuning, 827 시간, 827 ÷ 88 ≈ 9.4 배, 영상 1 초에 L40 2 분, 약 10 만 5 천 GPU 시간, L40 3,600 장, 약 1.5 일);
// DexMimicGen (78 만 개, 11 시간, 6,500 시간, 9 개월); check 88.4 × 3600 × 20 = 6,364,800 ≈ 636 만, 6.4M; System 2
// Eagle-2 10 Hz on L40, System 1 120 Hz, 2.2B = 22 억, VLM 13.4 억, 22 − 13.4 = 8.6 억, 12 번째 층 φ, 224 × 224, token 64 vs
// PaliGemma 256 (4 분의 1), 63.9 ms per 16-action chunk on L40, public config 16 층; cross-attention (query from action·상태,
// key·value from φ); embodiment MLP (SO-101 6 = 관절 5 + 집게 1, 공통 길이 4 (예), 6 × 4 + 4 = 28, 팔 둘 로봇 14 (예),
// 14 × 4 + 4 = 60, 상태 64 칸, action 32 칸, 최대 32 대, π0 18 칸; check 20 × 4 + 4 = 84); flow matching (τ A + (1 − τ) ε,
// target A − ε not ε − A, π0 H 50 / 10 step / 0.1, GR00T H 16 / K = 4 / 0.25; Euler example A = (1.0, −0.5), ε = (−1.0, 0.5),
// V = (2.0, −1.0), 0.25 × V = (0.5, −0.25), (−1.0, 0.5) → (−0.5, 0.25) → (0, 0) → (0.5, −0.25) → (1.0, −0.5); check ε = (2.0,
// 0), A = (0, 1.0), V = (−2.0, 1.0), (−0.5, 0.25) per step, (1.5, 0.25) → (1.0, 0.5)); chunk timing (20 Hz 0.05 s, 16 × 0.05
// = 0.8 s, 8 × 0.05 = 0.4 s; 30 Hz ≈ 0.033 s, 16 ÷ 30 ≈ 0.53 s, 8 ÷ 30 ≈ 0.27 s; N1.6 8 개 실행; H100 23 + 11 → 38 ms,
// RTX 4090 25 + 17 → 44 ms, Jetson AGX Thor 39 + 61 → 105 ms; 8 개 ≈ 267 ms, 2 ÷ 30 ≈ 67 ms, 기다림 38 ms); latent action
// (VQ-VAE, e = (0.8, 0.3), c1 = (1, 0) 0.13, c2 = (−1, 0) 3.33, c3 = (0, 1) 1.13; RoboCasa 시연 30 개 latent 조금 낫고
// 100 · 300 개 IDM 이 나음); results (Diffusion Policy 10.2% / 46.4%, GR00T-N1-2B 42.6% / 76.8%, 46.4 − 42.6 = 3.8%p;
// simulation 100 개 33.4% vs 45.0%; 생성 영상 1 : 1, 8 가지, +5.8%p; check 46.4 − 10.2 = 36.2%p, 76.8 − 42.6 = 34.2%p;
// N1.5 language following 46.6% → 93.3%, N1.7 덩어리 40).

const S1 = 'data pyramid'
const S2 = 'System 2 와 1'
const S3 = 'flow matching'
const S4 = 'latent action · 결과'

export const script: VideoScript = {
  id: 'groot',
  title: 'GR00T N1',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/groot',
  sections: [S1, S2, S3, S4],
  terms: [
    ['GR00T-N1-2B', '그루트 엔 원 투 비'],
    ['GR00T N1', '그루트 엔 원'],
    ['GR00T', '그루트'],
    ['GR-1', '지알 원'],
    ['N1.5', '엔 원 점 오'],
    ['N1.6', '엔 원 점 육'],
    ['SO-101', '에스오 백일'],
    ['Eagle-2', '이글 투'],
    ['Jetson AGX Thor', '젯슨 에이지엑스 토르'],
    ['Thor', '토르'],
    ['RTX 4090', '알티엑스 사천구십'],
    ['H100', '에이치 백'],
    ['L40', '엘 사십'],
    ['NVIDIA', '엔비디아'],
    ['humanoid', '휴머노이드'],
    ['VLA + RL', '브이엘에이 플러스 알엘'],
    ['VLA', '브이엘에이'],
    ['VLM', '브이엘엠'],
    ['RL', '알엘'],
    ['simulation', '시뮬레이션'],
    ['data pyramid', '데이터 피라미드'],
    ['data islands', '데이터 아일랜즈'],
    ['System 2', '시스템 투'],
    ['System 1', '시스템 원'],
    ['System', '시스템'],
    ['flow matching', '플로 매칭'],
    ['latent action', '레이턴트 액션'],
    ['tracker', '트래커'],
    ['fine-tuning', '파인튜닝'],
    ['DexMimicGen', '덱스미믹젠'],
    ['frame', '프레임'],
    ['diffusion transformer', '디퓨전 트랜스포머'],
    ['parameter', '파라미터'],
    ['token', '토큰'],
    ['self-attention', '셀프 어텐션'],
    ['cross-attention', '크로스 어텐션'],
    ['query', '쿼리'],
    ['key', '키'],
    ['value', '밸류'],
    ['MLP', '엠엘피'],
    ['weight', '웨이트'],
    ['state encoder', '스테이트 인코더'],
    ['encoder', '인코더'],
    ['decoder', '디코더'],
    ['noise', '노이즈'],
    ['Euler', '오일러'],
    ['network', '네트워크'],
    ['VQ-VAE', '브이큐 브이에이이'],
    ['codebook', '코드북'],
    ['vector', '벡터'],
    ['IDM', '아이디엠'],
    ['pseudo-action', '수도 액션'],
    ['RoboCasa', '로보카사'],
    ['post-training', '포스트 트레이닝'],
    ['FLARE', '플레어'],
    ['language following', '랭귀지 팔로잉'],
    ['reward', '리워드'],
    ['planning', '플래닝'],
    ['World Model', '월드 모델'],
    ['6.4M', '육백사십만'],
    ['%p', '퍼센트포인트'],
    ['π0', '파이 제로'],
    ['τ', '타우'],
    ['ε', '엡실론'],
    ['φ', '파이'],
    ['c1', '씨 원'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'GR00T N1 은 NVIDIA 가 2025 년에 공개한 humanoid VLA 로, 사람 영상과 simulation 을 함께 배웁니다.'],
        [4.2, 7.8, 'data pyramid, System 2 와 1, flow matching, latent action 과 결과를 봅니다.', 'data pyramid, 시스템 투와 원, flow matching, latent action 과 결과를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '사람이 GR-1 을 조종해 모은 데이터는 88 시간으로, π0 의 약 10,000 시간의 100 분의 1 도 안 됩니다.'],
        [4.4, 7.8, '이렇게 적은 데이터로 humanoid 에게 처음 보는 물건을 그릇에 옮기는 일을 어떻게 가르칠 수 있을까요?'],
      ],
    },
    {
      id: 'pyramid',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'humanoid 는 사람이 손목에 tracker 를 차고 장갑을 껴서 조종해야 해서, 시연을 한 건씩 모으는 품이 많이 듭니다.'],
        [6.5, 13, '저자들은 GR-1 을 조종하며 1초에 20 번 관절 명령과 머리 카메라 사진을 기록했습니다.'],
        [13, 20, '공개 로봇 데이터도 로봇마다 관절 수와 카메라 위치가 달라 합치기 어려워, 논문은 data islands 라고 불렀습니다.'],
        [20, 27.7, 'data pyramid 는 사람 영상을 바닥에 깔고, simulation 과 생성 영상을 가운데에 두고, 실물 기록을 꼭대기에 둡니다.'],
      ],
    },
    {
      id: 'hours',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, '논문 표 7 의 시간을 층별로 더하면 꼭대기 3,288.8 시간, 가운데 2,569.9 시간, 바닥 2,517.0 시간입니다.'],
        [6.5, 13, '꼭대기가 가장 긴 것은 다른 로봇의 데이터가 섞여서이고, humanoid GR-1 의 데이터는 그중 88.4 시간뿐입니다.'],
        [13, 20, '가운데 층의 생성 영상 827 시간은 GR-1 조종 88 시간으로 fine-tuning 한 영상 생성 모델이 만들었습니다.'],
        [20, 27.7, 'simulation 기록 78 만 개는 DexMimicGen 으로 11 시간에 만들었고, 사람이 조종하면 6,500 시간 걸립니다.'],
      ],
    },
    {
      id: 'pause-frames',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. GR-1 조종 데이터 88.4 시간을 1초에 20 번 기록했다면 frame 은 모두 몇 개일까요?'],
        [
          16.5,
          23.5,
          '88.4 × 3600 × 20 = 6,364,800 으로 약 636 만 frame 이고, 논문 표 7 의 6.4M 과 맞습니다.',
          '88.4 × 3600 × 20 은 6,364,800 으로 약 636 만 frame 이고, 논문 표 7 의 육백사십만 과 맞습니다.',
        ],
      ],
    },
    {
      id: 'systems',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.2, 'System 2 는 NVIDIA 의 VLM 인 Eagle-2 로, 사진과 지시문을 읽어 L40 에서 1초에 10 번 계산합니다.'],
        [6.2, 12.2, 'System 1 은 flow matching 으로 학습한 diffusion transformer 로, 1초에 120 번 action 을 냅니다.'],
        [12.2, 18.2, 'GR00T-N1-2B 의 parameter 22 억 개 중 13.4 억 개가 VLM 이고, 8.6 억 개가 System 1 쪽입니다.'],
        [18.2, 24.2, 'VLM 의 맨 마지막 층 대신 12 번째 층 출력 φ 를 쓰자, 논문에 따르면 추론이 빨라지고 성공률도 올랐습니다.'],
        [24.2, 29.7, '사진 한 장은 token 64 개로 π0 의 256 개의 4 분의 1 이고, action 16 개에 63.9 ms 가 걸립니다.'],
      ],
    },
    {
      id: 'embodiment',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'π0 는 두 부분의 token 을 한 줄로 이어 같은 self-attention 에 넣어서, 두 부분의 층 수가 같아야 했습니다.'],
        [6.5, 13, 'cross-attention 은 action·상태 token 으로 query 를 만들고, VLM 출력 φ 로 key 와 value 를 만듭니다.'],
        [13, 20, '로봇마다 둔 작은 MLP 가 SO-101 의 숫자 6 개를 예로 든 길이 4 의 token 으로 바꾸면 parameter 는 28 개입니다.'],
        [20, 27.7, '공개 구현은 상태는 64 칸까지 채우고 action 은 32 칸까지 0 을 채운 뒤, 로봇 번호마다 따로 둔 weight 를 곱합니다.'],
      ],
    },
    {
      id: 'pause-encoder',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 상태 숫자가 20 개면 state encoder 의 parameter 는 몇 개이고, π0 의 18 칸은 왜 곤란할까요?'],
        [16.5, 23.5, '20 × 4 + 4 = 84 개입니다. 숫자 20 개는 18 칸에 들어가지 않지만 공개 구현의 상태 64 칸에는 들어갑니다.', '20 × 4 더하기 4 는 84 개입니다. 숫자 20 개는 18 칸에 들어가지 않지만 공개 구현의 상태 64 칸에는 들어갑니다.'],
      ],
    },
    {
      id: 'flow',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.2, '섞은 점은 τ × A + (1 − τ) × ε 이라서 τ 가 0 이면 noise 이고, τ 가 1 이면 시연 덩어리입니다.', '섞은 점은 τ 곱하기 A 더하기, 1 빼기 τ 곱하기 ε 이라서 τ 가 0 이면 noise 이고, τ 가 1 이면 시연 덩어리입니다.'],
        [6.2, 12.2, 'τ 가 1 늘 때 섞은 점이 변하는 양이 A − ε 이라서, 정답 속도는 ε − A 가 아니라 A − ε 입니다.', 'τ 가 1 늘 때 섞은 점이 변하는 양이 A 빼기 ε 이라서, 정답 속도는 ε 빼기 A 가 아니라 A 빼기 ε 입니다.'],
        [12.2, 18.2, 'π0 는 action 50 개를 Euler 10 step 으로 만들고, GR00T N1 은 16 개를 K = 4 step 으로 만듭니다.', 'π0 는 action 50 개를 Euler 10 step 으로 만들고, GR00T N1 은 16 개를 4 step 으로 만듭니다.'],
        [18.2, 24.2, '예로 든 A (1.0, −0.5) 와 ε (−1.0, 0.5) 이면 속도는 (2.0, −1.0) 이고, step 마다 0.25 배를 더합니다.', '예로 든 A 1.0, −0.5 와 ε −1.0, 0.5 이면 속도는 2.0, −1.0 이고, step 마다 0.25 배를 더합니다.'],
        [24.2, 29.7, 'noise 에서 출발해 (−0.5, 0.25), (0, 0), (0.5, −0.25) 를 지나 시연 값 (1.0, −0.5) 에 닿습니다.', 'noise 에서 출발해 −0.5, 0.25 와 0, 0 과 0.5, −0.25 를 지나 시연 값 1.0, −0.5 에 닿습니다.'],
      ],
    },
    {
      id: 'timing',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, '덩어리 16 개는 20 Hz 로봇에서 16 × 0.05 로 0.8 초 분량이고, 30 Hz 로봇에서는 약 0.53 초입니다.'],
        [6.5, 13, '공개 구현은 덩어리 앞부분만 실행하고 새 사진으로 다음 덩어리를 만드는데, N1.6 의 예시는 8 개를 실행합니다.'],
        [13, 20, 'N1.6 의 덩어리 하나는 H100 에서 38 ms, RTX 4090 에서 44 ms, Jetson AGX Thor 에서 105 ms 걸립니다.'],
        [20, 27.7, '30 Hz 로봇이 8 개를 실행하는 약 267 ms 안에 Thor 는 다음 덩어리를 끝내지만, 2 개만 실행하면 로봇이 기다립니다.'],
      ],
    },
    {
      id: 'pause-euler',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. ε 이 (2.0, 0) 이고 A 가 (0, 1.0) 이며 network 가 정답 속도를 내면 2 step 뒤 값은?', '멈추고 적어 보기. ε 이 2.0, 0 이고 A 가 0, 1.0 이며 network 가 정답 속도를 내면 2 step 뒤 값은?'],
        [16.5, 23.5, '속도는 A − ε 인 (−2.0, 1.0) 이고 step 마다 (−0.5, 0.25) 씩 더해, 2 step 뒤는 (1.0, 0.5) 입니다.', '속도는 A 빼기 ε 인 −2.0, 1.0 이고 step 마다 −0.5, 0.25 씩 더해, 2 step 뒤는 1.0, 0.5 입니다.'],
      ],
    },
    {
      id: 'latent',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.2, '사람 영상과 생성 영상에는 관절 값이 없어서, flow matching 의 정답으로 쓸 action 을 따로 붙여야 합니다.'],
        [6.2, 12.2, 'latent action 의 encoder 는 지금 장면과 H step 뒤 장면으로 숫자를 내고, decoder 는 뒤 장면을 되살립니다.'],
        [12.2, 18.2, 'VQ-VAE 는 그 숫자를 codebook 에서 가장 가까운 vector 로 바꿔, 예로 든 (0.8, 0.3) 은 c1 이 됩니다.', 'VQ-VAE 는 그 숫자를 codebook 에서 가장 가까운 vector 로 바꿔, 예로 든 0.8, 0.3 은 c1 이 됩니다.'],
        [18.2, 24.2, 'IDM 은 실물 데이터로 두 장면 사이의 action 을 맞히게 학습해, 생성한 로봇 영상에 pseudo-action 을 붙입니다.'],
        [24.2, 29.7, 'RoboCasa 에서 작업당 시연 30 개면 latent action 이 조금 나았고, 100 개와 300 개면 IDM 이 나았습니다.'],
      ],
    },
    {
      id: 'results',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.2, 'GR-1 실물 작업에서 데이터 10% 로 학습하면 Diffusion Policy 는 10.2% 이고 GR00T N1 은 42.6% 입니다.'],
        [6.2, 12.2, '전체 데이터로는 46.4% 와 76.8% 이고, 10% 의 GR00T N1 은 전체의 Diffusion Policy 와 3.8%p 차이입니다.'],
        [12.2, 18.2, '생성 영상을 실물 데이터와 1 : 1 로 섞어 post-training 하자, 실물 작업 8 가지의 평균 성공률이 5.8%p 올랐습니다.', '생성 영상을 실물 데이터와 일 대 일로 섞어 post-training 하자, 실물 작업 8 가지의 평균 성공률이 5.8%p 올랐습니다.'],
        [18.2, 24.2, 'post-training 데이터가 모두 오른손만 써서, 왼손으로 집어 오른손에 건네는 행동이 학습 뒤 사라졌습니다.'],
        [24.2, 29.7, 'VLM 을 얼리고 FLARE loss 를 더한 N1.5 에서는 language following 이 46.6% 에서 93.3% 로 올랐습니다.'],
      ],
    },
    {
      id: 'pause-gain',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 데이터를 10% 에서 전체로 늘리면 두 모델의 성공률은 각각 몇 %p 오를까요?'],
        [16.5, 23.5, 'Diffusion Policy 는 36.2%p 오르고 GR00T N1 은 34.2%p 올라서, 오른 폭은 비슷하지만 출발점이 다릅니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.4, 4.2, '첫째, 사람 영상과 simulation, 생성 영상을 88 시간의 실물 기록 아래에 쌓아 한 모델로 함께 배웁니다.'],
        [4.2, 8, '둘째, Eagle-2 의 12 번째 층 출력을 diffusion transformer 가 cross-attention 으로 읽습니다.'],
        [8, 12, '셋째, action 16 개를 정답 속도 A − ε 으로 학습한 flow matching 4 step 으로 만들고 앞부분만 실행합니다.', '셋째, action 16 개를 정답 속도 A 빼기 ε 으로 학습한 flow matching 4 step 으로 만들고 앞부분만 실행합니다.'],
        [12, 15.8, '넷째, 영상에는 latent action 과 IDM pseudo-action 을 붙이고, 데이터 10% 만으로 42.6% 를 냈습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음은 reward 로 VLA 를 더 학습하는 VLA + RL 과, 다음 장면 예측을 planning 에 쓰는 World Model 입니다.', '다음은 reward 로 VLA 를 더 학습하는 VLA 플러스 RL 과, 다음 장면 예측을 planning 에 쓰는 World Model 입니다.']],
    },
  ],
}
