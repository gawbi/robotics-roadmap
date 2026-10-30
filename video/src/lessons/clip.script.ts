import type { VideoScript } from '../script.ts'

// Numbers follow lessons/clip/README.md: the opening (COCO 80 class; 4억 pairs; OK-Robot 10 homes, 58.5%); two encoders
// (512 차원, length 1; [3, 4] and [4, 3] ÷ 5 → [0.6, 0.8] · [0.8, 0.6], 0.6 × 0.8 + 0.8 × 0.6 = 0.96; cosine 1 / 0 / −1);
// the example matrix (0.8 0.5 0.1 / 0.6 0.7 0.2 / 0.0 0.1 0.9; τ = 0.1 → 6, 7, 2; e^s 0.3679, 1, 0.0067, sum 1.3746;
// probabilities 0.2676, 0.7275, 0.0049; −log 0.7275 = 0.318; rows 0.049 / 0.318 / 0.000 → 0.122; columns 0.086;
// (0.122 + 0.086) ÷ 2 = 0.104; gradients +0.2676 / −0.2725 / +0.0049, "50 배 넘게"); batch (32,768 pairs, 32,767
// negatives, 32,768 × 32,768 ≈ 10억 7천만 칸, log 32768 ≈ 10.4; check question 4 pairs, log 4 = 1.386, 3 negatives);
// temperature (τ = 1: 0.447 0.331 0.222, loss 0.805; τ = 0.1: 8 5 1 → 0.952 0.047 0.001, loss 0.049; best row 0.787,
// B = 32,768 → 0.000225, loss ≥ 8.4, 10.4 에서 2 정도; τ starts 0.07, logit scale 1 / 0.07 ≈ 14.3, capped at 100 so τ ≥
// 0.01, stored log 4.6052 → 100.0; check question 50 → τ 0.02, 25 − 15 = 10, 0.2 의 50 배); zero-shot (cosine 0.30 0.27
// 0.18 0.22, × 100 → 30 27 18 22, probabilities 0.952 0.047 0.000 0.000; without 100: 0.265 0.257 0.235 0.244; 76.2%,
// 128만 장, ResNet-50; template +1.3%p, 80 templates +3.5%p more); limits (relation test 59%, spatial 56%, chance 50%;
// NegCLIP 81%, COCO fine-tune 63%); SigLIP (σ(0) 0.5, σ(3) 0.953, σ(−3) 0.047; t = 10, b = −5; I2–T1 10 × 0.6 − 5 = 1,
// σ(−1) 0.269, loss 1.313; nine cells 0.049 0.693 0.018 / 1.313 0.127 0.049 / 0.007 0.018 0.018 → 2.292 ÷ 3 = 0.764;
// start t = 10, b = −10, σ(−10) ≈ 0.00005, 1 / 32,768 ≈ 0.00003; batch up to 100만, 32,000 enough; SigLiT TPUv4 4 chips,
// 2 days, 84.5%; check question logit 4 → 0.982 → ≈ 0.018, logit 0 → 0.5 → 0.693); robots (YOLO-World LVIS 1203 class,
// V100 52 images a second, 35.4 AP; OK-Robot pick scores 0.31 0.26 0.22 0.12 (예), 10 homes 171 trials, 58.5%, 9.3%
// wrong object, 82.4%; CLIPort Franka Panda, 9 tasks, 179 image–action pairs; PaliGemma SigLIP So400m + Gemma-2B, π0,
// OpenVLA SigLIP + DINOv2 → Llama 2, ≈ 10%p over LLaVA, SmolVLA 64 visual tokens).

const S1 = '유사도 행렬과 InfoNCE'
const S2 = 'temperature · 분류'
const S3 = '약점과 SigLIP'
const S4 = '로봇에서의 쓰임'

export const script: VideoScript = {
  id: 'clip',
  title: 'CLIP',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/clip',
  sections: [S1, S2, S3, S4],
  terms: [
    ['language-conditioned policy', '랭귀지 컨디셔닝 폴리시'],
    ['cosine similarity', '코사인 시밀래러티'],
    ['Transporter', '트랜스포터'],
    ['multi-task model', '멀티태스크 모델'],
    ['bounding box', '바운딩 박스'],
    ['bag-of-words', '백 오브 워즈'],
    ['cross-entropy', '크로스 엔트로피'],
    ['image encoder', '이미지 인코더'],
    ['text encoder', '텍스트 인코더'],
    ['image–action', '이미지 액션'],
    ['dot product', '닷 프로덕트'],
    ['logit scale', '로짓 스케일'],
    ['Franka Panda', '프랑카 판다'],
    ['patch token', '패치 토큰'],
    ['grasp model', '그래스프 모델'],
    ['temperature', '템퍼러처'],
    ['YOLO-World', '욜로 월드'],
    ['screwdriver', '스크루드라이버'],
    ['blue mug', '블루 머그'],
    ['red', '레드'],
    ['zero-shot', '제로샷'],
    ['ViT-B/32', '빗 비 삼십이'],
    ['ResNet-50', '레즈넷 오십'],
    ['Gemma-2B', '젬마 투비'],
    ['So400m', '소 사백 엠'],
    ['OK-Robot', '오케이 로봇'],
    ['PaliGemma', '팔리젬마'],
    ['embedding', '임베딩'],
    ['negative', '네거티브'],
    ['positive', '포지티브'],
    ['template', '템플릿'],
    ['ImageNet', '이미지넷'],
    ['AnyGrasp', '애니그래스프'],
    ['InfoNCE', '인포엔씨이'],
    ['softmax', '소프트맥스'],
    ['sigmoid', '시그모이드'],
    ['gradient', '그레이디언트'],
    ['NegCLIP', '네그클립'],
    ['CLIPort', '클리포트'],
    ['OpenVLA', '오픈브이엘에이'],
    ['encoder', '인코더'],
    ['picking', '피킹'],
    ['DINOv2', '디노 브이투'],
    ['Llama', '라마'],
    ['memory', '메모리'],
    ['prompt', '프롬프트'],
    ['detector', '디텍터'],
    ['SigLIP', '시그립'],
    ['vector', '벡터'],
    ['cosine', '코사인'],
    ['class', '클래스'],
    ['batch', '배치'],
    ['logit', '로짓'],
    ['model', '모델'],
    ['RT-2', '알티 투'],
    ['COCO', '코코'],
    ['LVIS', '엘비스'],
    ['CLIP', '클립'],
    ['VLA', '브이엘에이'],
    ['GPU', '지피유'],
    ['AP', '에이피'],
    ['π0', '파이 제로'],
    ['τ', '타우'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'CLIP 은 사진과 글의 쌍 4억 개로 사진과 문장을 같은 공간의 vector 로 바꿔, 맞는 정도를 점수로 냅니다.'],
        [4.2, 7.8, '유사도 행렬과 InfoNCE, temperature 와 zero-shot 분류, 약점과 SigLIP, 로봇에서의 쓰임을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '책상 정리 로봇의 detector 는 COCO 의 80 가지 class 로 학습해서 "파란 머그컵" 을 고를 수 없습니다.'],
        [4.4, 7.8, '물체 이름이 하나 늘 때마다 사진 수백 장에 이름을 달아 detector 를 다시 학습해야 할까요?'],
      ],
    },
    {
      id: 'encoders',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'CLIP 의 image encoder 는 사진을 vector 하나로 바꾸고, text encoder 는 문장을 vector 하나로 바꿉니다.'],
        [6.5, 13, '두 vector 를 길이 1 인 512 차원으로 맞추고, 둘의 dot product 인 cosine similarity 를 점수로 씁니다.'],
        [
          13,
          19.5,
          '[3, 4] 와 [4, 3] 은 길이 5 로 나누면 [0.6, 0.8] 과 [0.8, 0.6] 이 되고, 둘의 점수는 0.96 입니다.',
          'vector 3, 4 와 4, 3 은 길이 5 로 나누면 0.6, 0.8 과 0.8, 0.6 이 되고, 둘의 점수는 0.96 입니다.',
        ],
        [19.5, 25.7, '학습 전에는 고양이 사진과 고양이 설명의 vector 가 다른 방향이고, 학습 후에는 거의 같은 방향입니다.'],
      ],
    },
    {
      id: 'matrix',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, '사진 3장과 설명 3개의 점수표에서 대각선의 짝은 positive 이고, 같은 batch 의 다른 쌍은 negative 입니다.'],
        [6.5, 12.5, '강아지 사진 행의 0.6, 0.7, 0.2 를 τ 0.1 로 나눈 6, 7, 2 를 softmax 하면 정답 확률은 0.7275 입니다.'],
        [
          12.5,
          18.5,
          '이 행의 loss 는 −log 0.7275 로 0.318 이고, 행 평균 0.122 와 열 평균 0.086 의 평균은 0.104 입니다.',
          '이 행의 loss 는 마이너스 로그 0.7275 로 0.318 이고, 행 평균 0.122 와 열 평균 0.086 의 평균은 0.104 입니다.',
        ],
        [18.5, 24.5, 'gradient 는 확률에서 정답 칸만 1 을 뺀 값이라, 가까운 고양이 설명이 +0.2676 으로 가장 세게 밀립니다.'],
        [
          24.5,
          29.7,
          'CLIP 은 batch 에 쌍을 32,768 개 넣어서, 처음 loss 는 log 32768 로 약 10.4 에서 시작합니다.',
          'CLIP 은 batch 에 쌍을 32,768 개 넣어서, 처음 loss 는 로그 32768 로 약 10.4 에서 시작합니다.',
        ],
      ],
    },
    {
      id: 'pause-batch',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. batch 에 쌍이 4 개이고 모든 점수가 같다면, 처음 loss 와 negative 개수는 얼마일까요?'],
        [
          16.5,
          23.5,
          'softmax 가 1/4 씩 주므로 loss 는 log 4 인 1.386 이고, negative 는 자기 짝을 뺀 3 개입니다.',
          'softmax 가 사 분의 일씩 주므로 loss 는 로그 4 인 1.386 이고, negative 는 자기 짝을 뺀 3 개입니다.',
        ],
      ],
    },
    {
      id: 'temperature',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'τ 로 나누지 않으면 고양이 사진 행의 0.8, 0.5, 0.1 은 확률 0.447, 0.331, 0.222 로 평평해집니다.'],
        [6.5, 12.5, '순서는 맞아도 loss 가 0.805 로 크고, τ 0.1 로 나누면 정답 확률이 0.952 로 몰려 loss 는 0.049 입니다.'],
        [
          12.5,
          19,
          'cosine 은 −1 과 1 사이라서, τ 가 없으면 batch 32,768 에서 loss 가 8.4 아래로 내려가지 못합니다.',
          'cosine 은 마이너스 1 과 1 사이라서, τ 가 없으면 batch 32,768 에서 loss 가 8.4 아래로 내려가지 못합니다.',
        ],
        [
          19,
          24.5,
          'CLIP 은 τ 를 0.07 에서 시작해 encoder 와 함께 학습하고, 곱하는 수 1/τ 를 logit scale 로 저장합니다.',
          'CLIP 은 τ 를 0.07 에서 시작해 encoder 와 함께 학습하고, 곱하는 수 타우 분의 일을 logit scale 로 저장합니다.',
        ],
        [24.5, 29.7, 'logit scale 은 100 을 넘지 않게 잘라 두는데, 공개된 ViT-B/32 의 값은 그 상한 100 에 닿아 있었습니다.'],
      ],
    },
    {
      id: 'zero-shot',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'zero-shot 분류는 "고양이 사진", "개 사진" 처럼 class 이름을 넣은 prompt 의 embedding 을 사진과 비교합니다.'],
        [6.5, 12.5, 'cosine 0.30, 0.27, 0.18, 0.22 에 100 을 곱해 softmax 하면 고양이의 확률이 0.952 입니다.'],
        [12.5, 18.5, '100 을 곱하지 않으면 확률이 0.265, 0.257, 0.235, 0.244 로 거의 같아 확신하는 정도가 드러나지 않습니다.'],
        [18.5, 24, '가장 큰 CLIP model 은 ImageNet 의 이름표 달린 사진 128만 장을 하나도 쓰지 않고 76.2% 를 맞혔습니다.'],
        [
          24,
          29.7,
          'template 하나를 쓰면 이름만 넣을 때보다 1.3%p 오르고, template 80 개를 평균하면 3.5%p 더 오릅니다.',
          'template 하나를 쓰면 이름만 넣을 때보다 1.3 퍼센트 포인트 오르고, template 80 개를 평균하면 3.5 퍼센트 포인트 더 오릅니다.',
        ],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. logit scale 이 50 이면 τ 는 얼마이고, cosine 0.5 와 0.3 의 logit 차이는 얼마일까요?'],
        [16.5, 23.5, 'τ 는 1 ÷ 50 으로 0.02 이고, logit 은 25 와 15 라서 차이는 cosine 차이 0.2 의 50 배인 10 입니다.'],
      ],
    },
    {
      id: 'limits',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'CLIP 은 인터넷 설명 글에 잘 적히지 않는 개수, 위치 관계, 세밀한 구분과 거리에 약합니다.'],
        [6, 12.5, '순서만 바꾼 설명 둘 중 하나를 고르는 시험에서 CLIP ViT-B/32 는 59% 로, 무작위의 50% 와 큰 차이가 없습니다.'],
        [12.5, 18.5, '"말이 풀을 먹는다" 를 batch 의 다른 설명과 구별할 때는 "말" 과 "풀" 이 들어 있는지만 봐도 충분합니다.'],
        [18.5, 24.5, '순서를 몰라도 loss 가 내려가서 encoder 는 순서를 배우지 않고, 단어를 자루에 담은 bag-of-words 처럼 행동합니다.'],
        [24.5, 29.7, '순서를 바꾼 문장을 negative 로 넣은 NegCLIP 은 81% 를 맞혀, 다시 학습만 한 model 의 63% 를 넘었습니다.'],
      ],
    },
    {
      id: 'siglip',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'CLIP 의 softmax 는 분모가 행 전체의 합이라서, 여러 GPU 에 나눠 계산해도 embedding 을 모두 주고받아야 합니다.'],
        [
          6.5,
          13,
          'SigLIP 은 같은 유사도 행렬의 칸마다 짝인지를 sigmoid 로 따로 판정하고, 칸의 logit 은 t × s + b 입니다.',
          'SigLIP 은 같은 유사도 행렬의 칸마다 짝인지를 sigmoid 로 따로 판정하고, 칸의 logit 은 티 곱하기 에스 더하기 비 입니다.',
        ],
        [
          13,
          19.5,
          't 10, b −5 면 강아지 사진과 고양이 설명 칸의 logit 은 10 × 0.6 − 5 로 1 이고, loss 가 1.313 입니다.',
          '티 10, 비 마이너스 5 면 강아지 사진과 고양이 설명 칸의 logit 은 10 × 0.6 빼기 5 로 1 이고, loss 가 1.313 입니다.',
        ],
        [19.5, 25.7, '아홉 칸의 합 2.292 를 3 으로 나눈 0.764 가 SigLIP loss 이고, 분모가 없으니 GPU 마다 맡은 칸만 계산합니다.'],
      ],
    },
    {
      id: 'pause-sig',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. t 10, b −5 에서 cosine 0.9 인 짝의 칸과 cosine 0.5 인 짝이 아닌 칸의 loss 는 얼마일까요?',
          '멈추고 적어 보기. 티 10, 비 마이너스 5 에서 cosine 0.9 인 짝의 칸과 cosine 0.5 인 짝이 아닌 칸의 loss 는 얼마일까요?',
        ],
        [
          16.5,
          23.5,
          '짝은 logit 4 라서 −log 0.982 로 약 0.018 이고, 짝이 아닌 칸은 logit 0 이라 −log 0.5 인 0.693 입니다.',
          '짝은 logit 4 라서 마이너스 로그 0.982 로 약 0.018 이고, 짝이 아닌 칸은 logit 0 이라 마이너스 로그 0.5 인 0.693 입니다.',
        ],
      ],
    },
    {
      id: 'open-vocab',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'YOLO-World 는 물체 이름을 CLIP 의 text encoder 로 embedding 으로 바꿔, 사진의 영역마다 비교합니다.'],
        [6.5, 12, '학습에 쓰지 않은 LVIS 의 class 1203 개에서, 1초에 사진 52 장을 처리하며 35.4 AP 를 얻었습니다.'],
        [12, 18.5, 'OK-Robot 은 물체마다 위치와 CLIP embedding 을 memory 에 저장하고, 질의 문장과 가장 가까운 물체를 고릅니다.'],
        [18.5, 24, '집는 자세는 grasp model 인 AnyGrasp 가 정하고, 처음 가 본 집 10 곳에서 성공률은 58.5% 였습니다.'],
        [24, 29.7, '171 번 시도에서 가장 많은 실패는 엉뚱한 물체를 찾은 9.3% 였고, 조건을 다듬으면 82.4% 까지 올랐습니다.'],
      ],
    },
    {
      id: 'policy-vla',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, 'CLIPort 에서는 CLIP 의 두 encoder 가 어느 물체인지를 맡고, Transporter 가 어디를 집고 놓을지를 맡습니다.'],
        [6.5, 13, 'Franka Panda 팔로 실제 작업 9 가지를 하는 model 하나를 image–action 쌍 179 개로 학습했습니다.'],
        [13, 19.5, 'VLA 는 image encoder 로 SigLIP 을 많이 쓰고, π0 의 출발점인 PaliGemma 도 SigLIP 을 씁니다.'],
        [19.5, 25.7, 'OpenVLA 는 SigLIP 과 DINOv2 의 출력을 이어 붙입니다. VLA 는 patch token 을 전부 넘겨 위치 정보를 지킵니다.'],
      ],
    },
    {
      id: 'pause-swap',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 찾을 물체를 "blue mug" 에서 "red screwdriver" 로 바꾸면 무엇을 다시 계산할까요?'],
        [16.5, 23.5, '새 문장의 질의 embedding 하나만 계산합니다. memory 의 위치와 embedding 은 그대로 쓰고 cosine 만 다시 셉니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 문장만 바꾸면 됩니다. InfoNCE 로 짝의 점수를 올려 사진과 아무 문장이나 비교합니다.'],
        [4.2, 8.2, 'temperature 로 cosine 차이를 키워야 학습이 되고, 100 을 곱한 prompt 점수로 zero-shot 분류를 합니다.'],
        [8.2, 12.2, '위치 관계에 약해 관계 시험은 59% 에 그치고, SigLIP 은 칸마다 sigmoid 를 써서 큰 batch 를 나누기 쉽게 했습니다.'],
        [12.2, 15.7, '로봇에서는 YOLO-World 와 OK-Robot 의 picking, CLIPort 의 policy, VLA 의 SigLIP 으로 쓰입니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'CLIP 은 점수만 낼 뿐 action 은 내지 못합니다. action 까지 내는 VLA 는 RT-2 → OpenVLA 와 π0 에서 다룹니다.']],
    },
  ],
}
