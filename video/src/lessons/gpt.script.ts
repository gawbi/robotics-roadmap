import type { VideoScript } from '../script.ts'

// Numbers follow lessons/gpt/README.md: WebText (웹 문서 약 800 만 개, 40 GB), OpenVLA 행동 하나 = token 7 개, Llama 2 7B;
// the count table (지시문 10 개: 집어 6, 놓아 2, 밀어 1, 던져 1 → 0.6, 0.2, 0.1, 0.1); vocabulary 50,257, 50,257 × 50,257 ≈ 25 억;
// logits 2.0, 1.0, 0.5, −1.0 → e^z 7.389, 2.718, 1.649, 0.368, sum 12.124 → 0.609, 0.224, 0.136, 0.030; shift table
// (<bos> 빨간 컵 집어 → 빨간 컵 집어 <eos>, T + 1 → T 문제); loss table 0.5 / 0.8 / 0.609 / 0.9 → 0.693 / 0.223 / 0.496 /
// 0.105, sum 1.517, 1.517 ÷ 4 ≈ 0.379; log V: 8 → 2.079, 65 → 4.174, 50,257 → 10.825; check 0.5, 0.5, 1 → 1.386 ÷ 3 ≈ 0.462;
// GPT-2 vs Transformer (learned position table, GELU, Pre-LN + final LN, weight tying); token embedding 50,257 × 768,
// position embedding 1,024 × 768, context length 1,024, block 12; causal mask scores 0, 1, 2, 3 → no mask 0.032, 0.087, 0.237,
// 0.644 (64.4%), masked 0.090, 0.245, 0.665, 0 (sum 11.107); batch 1,024 × 512 = 524,288; check 256; generation 컵 0.8,
// 집어 0.609, <eos> 0.9; 100 token → forward 100 번, OpenVLA 7 번; sampling intervals 0 ~ 0.609 ~ 0.834 ~ 0.970 ~ 1, random 0.75
// → 놓아; 3% token: 0.97^100 ≈ 0.048, 95% 넘게; τ = 0.5 → 0.842, 0.114, 0.042, 0.002; τ = 2 → 0.434, 0.263, 0.205, 0.097;
// top-k k = 2 → 0.731, 0.269; GPT-2 samples k = 40; OpenVLA greedy (do_sample=False); check τ 0.5 on [1, 0] → [2, 0], 7.389 ÷
// 8.389 = 0.881, 1 ÷ 8.389 = 0.119; sizes 12 / 24 / 36 / 48 blocks, d 768 / 1,024 / 1,280 / 1,600, 124M / 355M / 774M / 1.5B;
// 124,439,808 = blocks 85,054,464 (≈ 68%) + token embedding 38,597,376 (≈ 31%) + position 786,432 (+ final LN 1,536); block ≈ 12d²;
// float32 ≈ 500 MB, largest ≈ 6.2 GB; validation loss 3.12 / 2.84 / 2.67 / 2.54; scaling law 2× → 2^−0.076 ≈ 0.95×; check 4× →
// 0.949 × 0.949 ≈ 0.90, 3.0 → 약 2.7; RT-2 9% / 44% / 63% (5B 처음부터, 5B, 55B); 256 bins, OpenVLA 7 tokens, ≈ 6 Hz on an RTX 4090.

const S1 = '다음 token 과 loss'
const S2 = 'decoder-only 구조'
const S3 = '생성과 sampling'
const S4 = '크기 · scaling · VLA'

export const script: VideoScript = {
  id: 'gpt',
  title: 'GPT-2',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/gpt',
  sections: [S1, S2, S3, S4],
  terms: [
    ['self-supervised learning', '셀프 슈퍼바이즈드 러닝'],
    ['masked self-attention', '마스크드 셀프 어텐션'],
    ['decoder-only', '디코더 온리'],
    ['cross-attention', '크로스 어텐션'],
    ['cross-entropy', '크로스 엔트로피'],
    ['greedy decoding', '그리디 디코딩'],
    ['teacher forcing', '티처 포싱'],
    ['autoregressive', '오토리그레시브'],
    ['language model', '랭귀지 모델'],
    ['random number', '랜덤 넘버'],
    ['context length', '컨텍스트 렝스'],
    ['token embedding', '토큰 임베딩'],
    ['causal mask', '코절 마스크'],
    ['scaling law', '스케일링 로'],
    ['action token', '액션 토큰'],
    ['OpenWebText', '오픈 웹 텍스트'],
    ['temperature', '템퍼러처'],
    ['Transformer', '트랜스포머'],
    ['vocabulary', '보캐뷸러리'],
    ['embedding', '임베딩'],
    ['parameter', '파라미터'],
    ['Llama 2 7B', '라마 투 세븐 비'],
    ['RTX 4090', '알티엑스 사천구십'],
    ['position', '포지션'],
    ['sampling', '샘플링'],
    ['softmax', '소프트맥스'],
    ['network', '네트워크'],
    ['WebText', '웹 텍스트'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['float32', '플로트 삼십이'],
    ['encoder', '인코더'],
    ['decoder', '디코더'],
    ['forward', '포워드'],
    ['scaling', '스케일링'],
    ['greedy', '그리디'],
    ['weight', '웨이트'],
    ['vector', '벡터'],
    ['top-k', '탑 케이'],
    ['logit', '로짓'],
    ['token', '토큰'],
    ['label', '레이블'],
    ['block', '블록'],
    ['batch', '배치'],
    ['GPT-2', '지피티 투'],
    ['RT-2', '알티 투'],
    ['CLIP', '클립'],
    ['text', '텍스트'],
    ['loss', '로스'],
    ['bin', '빈'],
    ['FFN', '에프에프엔'],
    ['VLA', '브이엘에이'],
    ['log', '로그'],
    ['<bos>', '비오에스'],
    ['<eos>', '이오에스'],
    ['GB', '기가바이트'],
    ['MB', '메가바이트'],
    ['1.5B', '일 점 오 비'],
    ['55B', '오십오 비'],
    ['5B', '오 비'],
    ['124M', '백이십사 엠'],
    ['355M', '삼백오십오 엠'],
    ['774M', '칠백칠십사 엠'],
    ['τ', '타우'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'GPT-2 는 Transformer 의 decoder 만 쌓아, 웹 문서 약 800 만 개에서 다음 token 맞히기만 배운 모델입니다.'],
        [4.2, 7.8, '다음 token 과 loss, decoder-only 구조, 생성과 sampling, 크기와 scaling, VLA 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'OpenVLA 한가운데의 Llama 2 7B 는 인터넷의 글에서 바로 다음 조각 하나를 맞히는 연습만 했습니다.'],
        [4.4, 7.8, '다음 조각 하나를 맞힐 줄 아는 모델이 어떻게 긴 글을 쓰고, 로봇의 움직임까지 내게 될까요?'],
      ],
    },
    {
      id: 'probs',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'language model 은 앞의 token 들을 받아, vocabulary 의 token 마다 다음에 올 확률을 매긴 표를 냅니다.'],
        [6, 12, '"빨간 컵" 으로 시작한 지시문 10 개 중 6 개에서 "집어" 가 왔다면, 그 확률은 6 ÷ 10 으로 0.6 입니다.'],
        [12, 18, '세어 두는 방법은 실제 글에 못 씁니다. GPT-2 의 vocabulary 에는 token 이 50,257 개 있습니다.'],
        [
          18,
          24,
          'token 두 개짜리 앞부분만 해도 50,257 × 50,257 ≈ 25 억 가지라서, network 가 logit 을 계산합니다.',
          'token 두 개짜리 앞부분만 해도 50,257 × 50,257 로 약 25 억 가지라서, network 가 logit 을 계산합니다.',
        ],
        [
          24,
          29.7,
          'softmax 는 logit 2.0, 1.0, 0.5, −1.0 을 확률 0.609, 0.224, 0.136, 0.030 으로 바꿉니다.',
        ],
      ],
    },
    {
      id: 'shift',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '정답은 text 안에 있습니다. 입력 "<bos> 빨간 컵 집어" 를 왼쪽으로 한 칸 밀면 정답 줄이 됩니다.'],
        [6, 12, 'label 없이 배우는 이 방식이 self-supervised learning 이고, GPT-2 는 WebText 40 GB 로 배웠습니다.'],
        [
          12,
          18.5,
          'loss 는 위치마다 정답 확률 p 에 −log 를 씌운 cross-entropy 이고, 정답 확률이 1 에 가까울수록 0 에 가깝습니다.',
          'loss 는 위치마다 정답 확률 p 에 마이너스 log 를 씌운 cross-entropy 이고, 정답 확률이 1 에 가까울수록 0 에 가깝습니다.',
        ],
        [18.5, 24.5, '정답 확률 0.5, 0.8, 0.609, 0.9 면 loss 는 0.693, 0.223, 0.496, 0.105 로 평균 약 0.379 입니다.'],
        [24.5, 29.7, '학습 전의 loss 는 log V 근처라서, V 가 50,257 인 GPT-2 는 10.825 근처에서 학습을 시작합니다.'],
      ],
    },
    {
      id: 'pause-loss',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 정답 확률이 0.5, 0.5, 1 인 token 3 개짜리 조각의 loss 는 얼마일까요?'],
        [
          16.5,
          23.5,
          '0.693 + 0.693 + 0 은 1.386 이고, 위치 수 3 으로 나누면 1.386 ÷ 3 으로 약 0.462 입니다.',
          '0.693 더하기 0.693 더하기 0 은 1.386 이고, 위치 수 3 으로 나누면 1.386 ÷ 3 으로 약 0.462 입니다.',
        ],
      ],
    },
    {
      id: 'decoder',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'language model 은 번역할 원문이 없어서, encoder 와 cross-attention 을 빼고 decoder 만 씁니다.'],
        [7, 14, 'masked self-attention 과 FFN 만 남은 block 을 쌓은 구조이고, 가장 작은 GPT-2 는 block 12 개입니다.'],
        [14, 21, 'token 은 50,257 × 768 표의 한 행으로 바뀌고, 1,024 행 position 표의 행을 더해 순서를 구분합니다.'],
        [21, 27.7, 'position 표가 1,024 행이라 context length 는 1,024 이고, 출력에는 token embedding 표를 다시 씁니다.'],
      ],
    },
    {
      id: 'mask',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '"<bos> 빨간 컵 집어" 를 넣으면, 위치 3 이 맞혀야 할 "집어" 는 위치 4 의 입력으로 이미 들어와 있습니다.'],
        [6, 12, '설명용 점수 0, 1, 2, 3 을 그대로 두면, 위치 3 은 정답이 있는 위치 4 에 weight 의 64.4% 를 둡니다.'],
        [
          12,
          18,
          'causal mask 는 뒤쪽 점수를 −∞ 로 바꿔서, 남은 세 위치의 weight 가 0.090, 0.245, 0.665 가 됩니다.',
          'causal mask 는 뒤쪽 점수를 마이너스 무한대로 바꿔서, 남은 세 위치의 weight 가 0.090, 0.245, 0.665 가 됩니다.',
        ],
        [18, 24, '위치 t 의 출력은 위치 1 부터 t 까지만 보므로, 정답 줄을 한꺼번에 넣는 teacher forcing 을 쓸 수 있습니다.'],
        [
          24,
          29.7,
          'GPT-2 는 1,024 token 조각 512 개를 한 batch 로 넣어, 1,024 × 512 = 524,288 문제를 한 번에 풉니다.',
          'GPT-2 는 1,024 token 조각 512 개를 한 batch 로 넣어, 1,024 × 512 로 524,288 개의 문제를 한 번에 풉니다.',
        ],
      ],
    },
    {
      id: 'pause-mask',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 길이 256 입력은 forward 한 번에 문제를 몇 개 풀고, 위치 10 은 위치 11 에 달려 있을까요?'],
        [16.5, 23.5, '위치마다 하나씩 256 개를 풉니다. 위치 10 은 위치 1 부터 10 까지만 보므로, 위치 11 을 바꿔도 그대로입니다.'],
      ],
    },
    {
      id: 'generate',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '마지막 위치의 확률표에서 고른 token 을 입력 끝에 붙여 다시 넣는 방식이 autoregressive 생성입니다.'],
        [7, 14, '"<bos> 빨간" 에서 가장 큰 확률을 고르면 컵 0.8, 집어 0.609, <eos> 0.9 순서로 나오고 멈춥니다.'],
        [14, 21, '생성은 앞의 token 이 있어야 다음을 고르므로 token 마다 forward 를 한 번 해서, 100 token 이면 100 번입니다.'],
        [21, 27.7, '행동 하나가 token 7 개인 OpenVLA 는 forward 를 7 번 합니다. GPT-2 는 최근 token 1,024 개만 넣습니다.'],
      ],
    },
    {
      id: 'sampling',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, '가장 큰 확률의 token 을 고르는 greedy decoding 은 결과가 늘 같지만, 같은 구절을 반복하기 쉽습니다.'],
        [
          6.5,
          13,
          'sampling 은 누적 확률로 0 ~ 1 을 나눠 random number 가 떨어진 구간을 고르고, 0.75 면 "놓아" 입니다.',
          'sampling 은 누적 확률로 0 에서 1 을 나눠 random number 가 떨어진 구간을 고르고, 0.75 면 "놓아" 입니다.',
        ],
        [13, 19.5, '확률 3% 인 token 이 100 번 내내 안 뽑힐 확률은 약 0.048 이라서, 긴 글에는 95% 넘는 확률로 끼어듭니다.'],
        [19.5, 26, 'temperature 는 logit 을 τ 로 나눕니다. τ 0.5 면 집어 가 0.842 로 몰리고, τ 2 면 0.434 로 퍼집니다.'],
        [
          26,
          31.7,
          'k 2 인 top-k 는 상위 둘만 남겨 0.731, 0.269 입니다. GPT-2 예시는 k 40 이고 OpenVLA 는 greedy 입니다.',
          'k 가 2 인 top-k 는 상위 둘만 남겨 0.731, 0.269 입니다. GPT-2 예시는 k 가 40 이고 OpenVLA 는 greedy 입니다.',
        ],
      ],
    },
    {
      id: 'pause-temp',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. logit 이 1 과 0 이고 τ 가 0.5 면, 두 token 의 확률은 각각 얼마일까요?'],
        [
          16.5,
          23.5,
          'τ 로 나누면 2 와 0 이고, 7.389 ÷ 8.389 = 0.881, 1 ÷ 8.389 = 0.119 로 첫 token 에 더 몰립니다.',
          'τ 로 나누면 2 와 0 이고, 7.389 ÷ 8.389 로 0.881, 1 ÷ 8.389 로 0.119 라서 첫 token 에 더 몰립니다.',
        ],
      ],
    },
    {
      id: 'size',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'GPT-2 는 block 이 12, 24, 36, 48 개인 네 모델이고, parameter 는 124M 에서 1.5B 까지입니다.'],
        [7, 14, '가장 작은 모델의 parameter 중 block 12 개가 약 68% 이고, token embedding 표가 약 31% 입니다.'],
        [14, 21, 'block 하나는 약 12d² 개라서, vector 길이 d 가 두 배가 되면 block 하나의 parameter 는 네 배입니다.'],
        [21, 27.7, 'float32 로 저장하면 가장 작은 모델은 약 500 MB 이고 가장 큰 모델은 약 6.2 GB 라서, 클수록 느려집니다.'],
      ],
    },
    {
      id: 'scaling',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, 'OpenWebText 의 validation loss 는 124M 3.12, 355M 2.84, 774M 2.67, 1.5B 2.54 입니다.'],
        [6.5, 13, 'scaling law 에 따르면 embedding 표를 뺀 parameter 수가 두 배가 될 때마다 loss 는 약 0.95 배가 됩니다.'],
        [13, 19.5, 'RT-2 의 처음 보는 환경 성공률은 로봇 데이터로만 배운 5B 가 9% 이고, 인터넷으로 미리 배운 5B 는 44% 입니다.'],
        [19.5, 26, '같은 방법의 55B 는 63% 였습니다. RT-2 와 OpenVLA 는 행동 값을 차원마다 bin 256 개로 나눠 token 으로 씁니다.'],
        [26, 31.7, 'OpenVLA 는 action token 7 개를 하나씩 고르고, RTX 4090 한 장에서 1초에 약 6 번 행동을 냅니다.'],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 지수가 0.076 일 때 embedding 표를 뺀 parameter 수를 4 배로 키우면 loss 는 몇 배일까요?'],
        [
          16.5,
          23.5,
          '4 배는 2 배를 두 번 한 것이라 0.949 × 0.949 ≈ 0.90 배이고, loss 가 3.0 이었다면 약 2.7 이 됩니다.',
          '4 배는 2 배를 두 번 한 것이라 0.949 × 0.949 로 약 0.90 배이고, loss 가 3.0 이었다면 약 2.7 이 됩니다.',
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
          '답입니다. 정답은 입력을 한 칸 민 것이라 label 없는 text 로 배우고, loss 는 위치마다 −log p 의 평균입니다.',
          '답입니다. 정답은 입력을 한 칸 민 것이라 label 없는 text 로 배우고, loss 는 위치마다 마이너스 log p 의 평균입니다.',
        ],
        [4.2, 8.2, 'decoder-only 구조에 causal mask 를 쓰면, forward 한 번에 위치 수만큼의 문제를 풉니다.'],
        [8.2, 12.2, '글은 마지막 위치의 확률표에서 고른 token 을 붙여 가며 쓰고, greedy · temperature · top-k 가 고르는 방식입니다.'],
        [12.2, 15.7, '모델이 클수록 loss 가 낮고, OpenVLA 는 같은 방식으로 행동을 bin 256 개의 token 으로 바꿔 하나씩 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '사진과 글을 같은 공간에 놓는 모델은 CLIP 에서 다루고, VLA 의 구조와 약점은 RT-2 → OpenVLA 에서 다룹니다.']],
    },
  ],
}
