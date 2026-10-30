import type { VideoScript } from '../script.ts'

// Numbers follow lessons/pi0/README.md: 50 Hz robots (20 ms a step; UR5e·Franka 20 Hz), OpenVLA about 6 actions a second
// on an RTX 4090 (약 167 ms = 1 ÷ 6 s, 7 tokens per action), 50 ÷ 6 ≈ 8.3×, π0 50 actions in 73 ms; PaliGemma = SigLIP +
// Gemma 2B, 224×224 → 256 image tokens, width 2048 vs 1024, mlp_dim 16,384 vs 4096, 약 30 억 vs 약 3 억 → 약 33 억,
// 18 attention layers, head 256; the attention example (0.7 × 10 + 0.2 × 4 + 0.1 × 2 = 8.0, values set for the lesson);
// the three-block mask; chunk H = 50 (50 Hz → 1 초, 20 Hz → 50 × 0.05 = 2.5 초), 18 numbers per action, 18 − 7 = 11 zeros,
// 50 × 18 = 900 vs 50 × 7 = 350; flow matching τA + (1 − τ)ε, target A − ε, Euler δ = 0.1 × 10 steps; τ density √0.8999
// ≈ 0.949 vs √0.0991 ≈ 0.315, ratio ≈ 3.0 (s = 0.999); the two-number Euler example (−0.5, 1.0) + 10 × (0.25, −0.05) →
// (2.0, 0.5); the ±2 cm two-peak example (mean 0; noise 0.3 → +2, −0.3 → −2; one Euler step → 0); check question A = 2.0,
// ε = −0.5, τ = 0.3 → 0.25 and 2.5; KV cache 3 × 256 = 768, 48, 1 → 817 tokens, 14 + 32 + 27 = 73 ms (2.7 ms × 10),
// no cache (14 + 32 + 2.7) × 10 = 487 ms ≈ 6.7×; check question 20 + 40 + 10 × 3 = 90 vs 10 × (20 + 40 + 3) = 630 ms;
// chunk execution 25 actions (0.5 s) at 50 Hz, 16 (0.8 s) at 20 Hz, 73 ÷ 20 = 3.65 ≈ 4 steps, async start at 4 left
// (4 × 20 = 80 ms), 500 + 73 = 573 ms vs 500 ms; layers 2 Hz / 50 Hz / 1000 Hz PID (예), 20 PID steps per target;
// pretraining 약 10,000 시간, 7 robot configurations, 68 tasks, 9 억 300 만 steps (1 억 600 만 one arm, 7 억 9,700 만 two
// arms), public data 9.1%, n^0.43 with 100^0.43 ≈ 7.3; fine-tuning 5 시간 ~ 100 시간 이상; results (10 trials, partial
// credit 6 of 12 → 0.5; 16 만 steps; up to 2×; long tasks 7, 5 ~ 20 min, over 50% of the maximum score); π0-FAST (DCT +
// BPE, 50 × 14 = 700 → average 53 tokens, 30 ~ 60 tokens, 약 20 억 language model, 약 750 ms, 750 ÷ 73 ≈ 10×, GPU time
// 약 5 분의 1); π0.5 (FAST tokens in pretraining, action expert in post-training); check question 750 ÷ 20 = 37.5 → 약 38
// stale, 12 남짓 usable.

const S1 = 'backbone 과 expert'
const S2 = 'flow matching'
const S3 = 'KV cache 와 실행'
const S4 = '학습과 π0-FAST'

export const script: VideoScript = {
  id: 'pi0',
  title: 'π0',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/pi0',
  sections: [S1, S2, S3, S4],
  terms: [
    ['π0-FAST', '파이 제로 패스트'],
    ['π0.5', '파이 제로 점 오'],
    ['π0', '파이 제로'],
    ['PaliGemma', '팔리젬마'],
    ['Gemma 2B', '젬마 투 비'],
    ['SigLIP', '시그립'],
    ['image encoder', '이미지 인코더'],
    ['image token', '이미지 토큰'],
    ['action token', '액션 토큰'],
    ['action chunk', '액션 청크'],
    ['action expert', '액션 엑스퍼트'],
    ['blockwise causal attention mask', '블록와이즈 코잘 어텐션 마스크'],
    ['mask', '마스크'],
    ['VLA', '브이엘에이'],
    ['attention', '어텐션'],
    ['backbone', '백본'],
    ['transformer', '트랜스포머'],
    ['weight', '웨이트'],
    ['parameter', '파라미터'],
    ['token', '토큰'],
    ['chunk', '청크'],
    ['noise', '노이즈'],
    ['network', '네트워크'],
    ['flow matching', '플로 매칭'],
    ['target velocity', '타깃 벨로시티'],
    ['Euler', '오일러'],
    ['block', '블록'],
    ['query', '쿼리'],
    ['key', '키'],
    ['value', '밸류'],
    ['width', '위드스'],
    ['vocabulary', '보캐뷸러리'],
    ['KV cache', '케이브이 캐시'],
    ['cache', '캐시'],
    ['queue', '큐'],
    ['PID', '피아이디'],
    ['pretraining', '프리트레이닝'],
    ['post-training', '포스트 트레이닝'],
    ['fine-tuning', '파인튜닝'],
    ['Open X-Embodiment', '오픈 엑스 엠보디먼트'],
    ['FAST', '패스트'],
    ['DCT', '디씨티'],
    ['BPE', '비피이'],
    ['GPU', '지피유'],
    ['RTX 4090', '알티엑스 사천구십'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['VLM', '브이엘엠'],
    ['VLA + RL', '브이엘에이 플러스 알엘'],
    ['GR00T N1', '그루트 엔 원'],
    ['reward', '리워드'],
    ['beta', '베타'],
    ['224×224', '이백이십사 곱하기 이백이십사'],
    ['cm', '센티미터'],
    ['τ', '타우'],
    ['δ', '델타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'π0 는 PaliGemma 가 사진과 지시문을 읽고 작은 action expert 가 action chunk 를 만드는 VLA 입니다.'],
        [4.2, 7.8, '두 weight 묶음과 mask, flow matching chunk, KV cache 와 실행, 학습과 π0-FAST 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, '빨래를 개는 π0 의 팔은 1 초에 목표를 50 번 받는데, OpenVLA 는 RTX 4090 에서 1 초에 약 6 개를 냅니다.'],
        [4.2, 7.8, 'VLM 이 인터넷에서 배운 지식을 쓰면서, 1 초에 50 개씩 필요한 관절 목표를 제때 만들 수는 없을까요?'],
      ],
    },
    {
      id: 'architecture',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 7, 'π0 는 transformer 하나에 weight 묶음 둘을 두고, 첫째는 PaliGemma 를 가져온 VLM backbone 입니다.'],
        [7, 13.6, 'PaliGemma 는 SigLIP 과 Gemma 2B 를 이은 모델로, 224×224 사진 한 장을 token 256 개로 바꿉니다.'],
        [13.6, 20.4, '둘째는 무작위 값에서 출발한 action expert 로, 로봇 상태와 noise 섞인 action token 을 받아 속도를 냅니다.'],
        [20.4, 25.2, 'width 는 2048 대 1024 이고, 크기는 약 30 억 대 약 3 억이라 π0 전체는 약 33 억 parameter 입니다.'],
        [25.2, 29.7, 'action expert 는 chunk 하나를 만들 때 여러 번 계산하는 쪽이라서, 저자들은 이쪽을 줄여 추론을 빠르게 했습니다.'],
      ],
    },
    {
      id: 'mask',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.8, '두 묶음은 attention 에서만 만나고, action 쪽 query 와 사진 쪽 key·value 는 다른 weight 로 만듭니다.'],
        [6.8, 13.4, '길이만 같으면 점수를 매겨 섞을 수 있어서, action token 은 18 개 층마다 사진과 지시문의 내용을 다시 가져옵니다.'],
        [13.4, 20.6, 'blockwise causal attention mask 는 뒤쪽 block 만 앞쪽을 보게 하고, block 안은 서로 다 봅니다.'],
        [20.6, 27.7, '앞 두 block 은 계속 바뀌는 action token 을 보지 않아서, 한 번 계산한 결과를 저장해 다시 쓸 수 있습니다.'],
      ],
    },
    {
      id: 'pause-weights',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 손목 카메라 사진, 지시문, 관절 각도, noise 섞인 action 은 각각 어느 weight 가 처리할까요?'],
        [16.5, 23.5, '사진과 지시문은 backbone 이 처리하고, 관절 각도와 noise 섞인 action 은 action expert 가 처리합니다.'],
      ],
    },
    {
      id: 'chunk',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'chunk 는 action 50 개라서 50 Hz 로봇에서는 1 초 분량이고, 20 Hz 로봇에서는 50 × 0.05 로 2.5 초입니다.'],
        [7, 13.8, 'action 은 가장 큰 로봇에 맞춘 숫자 18 개라서, 팔 하나짜리 chunk 는 900 개 중 350 개만 뜻이 있습니다.'],
        [13.8, 20.8, '학습할 때는 시연 chunk 와 noise 를 τ 대 1 − τ 로 섞고, network 가 정답 속도 A − ε 을 맞히게 합니다.', '학습할 때는 시연 chunk 와 noise 를 τ 대 1 빼기 τ 로 섞고, network 가 정답 속도 A 빼기 ε 을 맞히게 합니다.'],
        [20.8, 27.7, 'τ 는 noise 쪽을 더 자주 뽑아서, 논문의 beta 분포로는 τ 0.1 근처가 0.9 근처보다 약 3 배 자주 나옵니다.'],
      ],
    },
    {
      id: 'euler',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'chunk 를 만들 때는 τ 가 0 인 noise 에서 출발해, 길이 δ 가 0.1 인 Euler step 을 10 번 밟습니다.'],
        [6, 12, 'step 마다 action expert 를 한 번 계산해 50 개의 속도를 받고, 0.1 을 곱해 chunk 에 더합니다.'],
        [12, 18.2, '두 숫자 예의 noise −0.5 와 1.0 은 step 마다 0.25 와 −0.05 씩 움직여 2.0 과 0.5 에 닿습니다.'],
        [18.2, 24, '시연이 +2 와 −2 두 봉우리로 갈리면, action 을 바로 맞히는 모델은 평균 0 을 내서 상자에 부딪힙니다.'],
        [24, 29.7, 'flow matching 은 noise 에 따라 봉우리 하나에 닿고, Euler step 을 한 번만 밟으면 평균 0 에 닿습니다.'],
      ],
    },
    {
      id: 'pause-flow',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 시연 값 A 가 2.0 이고 noise ε 이 −0.5 일 때 τ 0.3 의 점과 target velocity 는?'],
        [16.5, 23.5, '점은 0.3 × 2.0 + 0.7 × (−0.5) 로 0.25 이고, 정답 속도는 2.0 − (−0.5) 로 2.5 입니다.', '점은 0.3 × 2.0 더하기 0.7 × −0.5 로 0.25 이고, 정답 속도는 2.0 빼기 −0.5 로 2.5 입니다.'],
      ],
    },
    {
      id: 'kv-cache',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'Euler step 10 번 동안 바뀌는 것은 action token 50 개뿐이고, 사진·지시문·상태 token 은 그대로입니다.'],
        [6, 12, '바뀌지 않는 token 은 image token 768 개와 지시문 48 개, 상태 1 개를 더해 최대 817 개입니다.'],
        [12, 18, '이 token 들의 key 와 value 를 한 번만 계산해 저장해 두고 step 마다 꺼내 쓰는 것을 KV cache 라고 합니다.'],
        [18, 24, 'image encoder 14 ms, 앞쪽 계산 32 ms, action 계산 10 번 27 ms 를 더하면 73 ms 입니다.'],
        [24, 29.7, 'cache 없이 step 마다 다시 하면 14 + 32 + 2.7 로 48.7 ms 씩 10 번, 487 ms 라서 약 6.7 배입니다.', 'cache 없이 step 마다 다시 하면 14 더하기 32 더하기 2.7 로 48.7 ms 씩 10 번, 487 ms 라서 약 6.7 배입니다.'],
      ],
    },
    {
      id: 'async',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '50 Hz 로봇은 chunk 50 개 가운데 25 개, 0.5 초 분량만 실행한 뒤 새로 추론해서 바뀐 상황에 빨리 반응합니다.'],
        [7, 13.8, '25 개를 다 실행한 뒤에 추론하면 73 ms 동안 새 목표가 없어 멈추는데, 73 ÷ 20 은 3.65 라서 약 4 step 입니다.'],
        [13.8, 20.8, '비동기 추론은 action 이 4 개 남았을 때 다음 추론을 시작해서, 4 × 20 으로 80 ms 안에 73 ms 추론이 끝납니다.'],
        [20.8, 27.7, 'π0 가 0.5 초마다 chunk 를 만들면 queue 가 20 ms 마다 목표 각도를 보내고, 모터 안 PID 가 그사이를 채웁니다.'],
      ],
    },
    {
      id: 'pause-kv',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 세 계산이 20 ms, 40 ms, 3 ms 인 모델은 cache 를 쓸 때와 안 쓸 때 얼마 걸릴까요?'],
        [16.5, 23.5, 'cache 를 쓰면 20 + 40 + 10 × 3 으로 90 ms 이고, 안 쓰면 10 × (20 + 40 + 3) 으로 630 ms 입니다.', 'cache 를 쓰면 20 더하기 40 더하기 10 × 3 으로 90 ms 이고, 안 쓰면 10 × 63 으로 630 ms 입니다.'],
      ],
    },
    {
      id: 'training',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'pretraining 은 PaliGemma 에서 출발해 로봇 시연 약 10,000 시간, 로봇 구성 7 가지, 작업 68 가지로 합니다.'],
        [6.5, 12.4, '직접 모은 데이터는 9 억 300 만 step 이고, Open X-Embodiment 같은 공개 데이터는 예시의 9.1% 입니다.'],
        [12.4, 18.6, '많이 모은 작업이 학습을 채우지 않도록 n 의 0.43 제곱에 비례하게 뽑아서, 100 배 많은 조합도 약 7.3 배만 더 뽑힙니다.'],
        [18.6, 24.4, 'fine-tuning 데이터는 가장 단순한 작업에 5 시간을 썼고, 가장 복잡한 작업에는 100 시간 이상을 썼습니다.'],
        [24.4, 29.7, '긴 작업 7 가지에서 pretraining 후 fine-tuning 한 π0 는 모든 작업에서 최고 점수의 50% 넘게 받았습니다.'],
      ],
    },
    {
      id: 'fast',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'π0-FAST 는 action expert 를 빼고, PaliGemma 가 DCT 와 BPE 로 압축한 FAST token 을 냅니다.'],
        [7, 13.6, '50 Hz 두 팔 로봇의 1 초 분량은 값마다 token 하나로 바꾸면 700 개인데, FAST 로는 평균 53 개입니다.'],
        [13.6, 20.8, 'π0-FAST 는 학습 GPU 시간이 약 5 분의 1 이지만, token 을 하나씩 내서 추론이 약 750 ms 입니다.'],
        [20.8, 27.7, 'π0.5 는 FAST token 으로 pretraining 하고, post-training 에서 action expert 를 더합니다.'],
      ],
    },
    {
      id: 'pause-fast',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 750 ms 추론 동안 50 Hz 로봇은 몇 step 을 지나고, 새 chunk 중 몇 개를 쓸 수 있을까요?'],
        [16.5, 23.5, '750 ÷ 20 으로 37.5 step 이 지나서, 앞쪽 약 38 개는 지난 시점의 몫이고 뒤쪽 12 개 남짓만 씁니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 약 30 억의 PaliGemma 가 읽은 내용을 약 3 억의 action expert 가 attention 으로 가져옵니다.'],
        [4.2, 8.2, 'action expert 는 noise 에서 δ 0.1 의 Euler 10 step 으로 action 50 개를 한꺼번에 만듭니다.'],
        [8.2, 12.2, 'KV cache 로 앞쪽 계산을 한 번만 해서 73 ms 에 chunk 가 나오고, 25 개를 실행할 때마다 다시 추론합니다.'],
        [12.2, 15.7, '두 단계 학습을 모두 거친 π0 가 긴 작업에서 가장 높았고, π0-FAST 는 학습이 빠르지만 추론이 느립니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'VLM 과 action network 를 따로 두는 GR00T N1 과, reward 로 더 학습하는 VLA + RL 로 이어집니다.']],
    },
  ],
}
