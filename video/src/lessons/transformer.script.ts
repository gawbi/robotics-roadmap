import type { VideoScript } from '../script.ts'

// Numbers follow lessons/transformer/README.md: the opening (15 × 20 = 300 구역, 512 개, 카메라 4 대 1,200 개, 100 step,
// parameter 약 8,000 만 개, RTX 2080 Ti 한 장 5 시간; Vaswani 2017, Bahdanau 2014); embedding table (배 [1, 1], 를 [0, 0],
// 먹었다 [2, 0], 탔다 [0, 2]); "빨간 컵 집어" (빨간 [1, 0], 컵 [0, 1], 집어 [1, −1]; embedding as is: scores 1, −1, 2 →
// weight 0.259, 0.035, 0.705; q k v table, 집어 q [−1, 1], scores −1, 1, −2 → weight 0.114, 0.844, 0.042 → output
// [0.958, 0.802]); scaling (d_k = 64 → √64 = 8; [1, 0, −1] → 0.665, 0.245, 0.090; [8, 0, −8] → 0.99966, 0.00034; middle
// +0.5: 0.245 → 0.348 (+0.103), 0.00034 → 0.00055 (+0.0002), 약 500 분의 1; 집어 ÷ √2 ≈ 1.414: 컵 0.844 → 0.734; check
// d_k = 16, 12 ÷ 4 = 3); multi-head (컵 weight 0.422, 0.155, 0.422; head 1 / head 2 weight 0.576, 0.212; BLEU h 1 / 8 / 32
// with d_k 512 / 64 / 16 → 24.9 / 25.8 / 25.4, 0.9 점; GPT-2 768 ÷ 12 = 64, ACT 512 ÷ 8 = 64); positional encoding (dog
// [1, 0], bites [0, 1], man [1, 1]; bites output [0.577, 0.844] in both orders; [sin(pos), cos(pos), sin(pos / 100),
// cos(pos / 100)]; dog at 0 → [1, 1], at 2 → [1.909, −0.416]; GPT-2 1,024 positions); residual ([1, 2] + [0.5, −0.5] =
// [1.5, 1.5]; 0.1³ = 0.001 vs 1.1³ = 1.331); LayerNorm ([1, 1, 5, 5] mean 3 σ 2, [10, 10, 50, 50] mean 30 σ 20 → [−1, −1,
// 1, 1]); FFN (512 → 2,048 원래 논문, ACT 3,200; 원래 6 층, ACT encoder 4 층); check ([2, 2, 6, 6] → mean 4, σ 2 →
// [−1, −1, 1, 1]; [2, 0] + [−1, 3] = [1, 3]); encoder-decoder (3 1 4 → 4 1 3, 4 단계 table); causal mask (scores [1, 2, 3, 0]
// → 0.269, 0.731, 0, 0; no mask 0.087, 0.237, 0.644, 0.032; softmax first 0.087 + 0.237 = 0.324); check (3 1 4 1 → 1 4 1 3,
// 5 단계, 넷째 token); ACT (encoder 4 층, decoder 7 층, 512, head 8, FFN 3,200; 4 × 300 = 1,200 + 1 + 1 = 1,202 token;
// query 100 개, 100 × 14; RTX 2080 Ti 약 0.01 초; first decoder layer only, LeRobot 1 층; 302 × 302 = 91,204 vs
// 1202 × 1202 = 1,444,804, 약 16 배); check (2 × 300 = 600 + 2 = 602, 602 × 602 = 362,404, query 50 개).

const S1 = 'attention 과 √d_k'
const S2 = 'head · 위치 · block'
const S3 = 'decoder 와 mask'
const S4 = 'ACT 의 Transformer'

export const script: VideoScript = {
  id: 'transformer',
  title: 'Transformer',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/transformer',
  sections: [S1, S2, S3, S4],
  terms: [
    ['positional encoding', '포지셔널 인코딩'],
    ['residual connection', '레지듀얼 커넥션'],
    ['teacher forcing', '티처 포싱'],
    ['autoregressive', '오토리그레시브'],
    ['encoder-decoder', '인코더 디코더'],
    ['self-attention', '셀프 어텐션'],
    ['cross-attention', '크로스 어텐션'],
    ['dot product', '닷 프로덕트'],
    ['linear layer', '리니어 레이어'],
    ['action chunk', '액션 청크'],
    ['causal mask', '코절 마스크'],
    ['Transformer', '트랜스포머'],
    ['multi-head', '멀티 헤드'],
    ['embedding', '임베딩'],
    ['attention', '어텐션'],
    ['sub-layer', '서브 레이어'],
    ['LayerNorm', '레이어 놈'],
    ['residual', '레지듀얼'],
    ['gradient', '그래디언트'],
    ['softmax', '소프트맥스'],
    ['LeRobot', '르로봇'],
    ['encoder', '인코더'],
    ['decoder', '디코더'],
    ['d_model', '디 모델'],
    ['vector', '벡터'],
    ['weight', '웨이트'],
    ['token', '토큰'],
    ['query', '쿼리'],
    ['value', '밸류'],
    ['patch', '패치'],
    ['block', '블록'],
    ['bites', '바이츠'],
    ['GPT-2', '지피티 투'],
    ['BLEU', '블루'],
    ['CVAE', '씨브이에이이'],
    ['head', '헤드'],
    ['mask', '마스크'],
    ['key', '키'],
    ['dog', '도그'],
    ['man', '맨'],
    ['sin', '사인'],
    ['cos', '코사인'],
    ['FFN', '에프에프엔'],
    ['ViT', '비아이티'],
    ['RTX', '알티엑스'],
    ['Ti', '티아이'],
    ['id', '아이디'],
    ['III', '삼'],
    ['W_Q', '더블유 큐'],
    ['W_K', '더블유 케이'],
    ['W_V', '더블유 브이'],
    ['W_O', '더블유 오'],
    ['√d_k', '루트 디 케이'],
    ['d_k', '디 케이'],
    ['<bos>', '비오에스'],
    ['<eos>', '이오에스'],
    ['−∞', '음의 무한대'],
    ['√', '루트 '],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Transformer 는 token 들이 query·key·value 로 서로를 참고하는 attention 을 층으로 쌓은 구조입니다.'],
        [4.2, 7.8, 'attention 과 √d_k, head 와 위치와 block, decoder 와 mask, ACT 의 구조를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '"배를 먹었다" 와 "배를 탔다" 의 "배" 는 token id 가 같고, 사진 구역 하나도 혼자서는 뜻이 정해지지 않습니다.'],
        [4.4, 7.8, '어느 조각을 봐야 하는지 아무도 정해 주지 않는데, 모델은 필요한 조각의 정보를 어떻게 골라 모을까요?'],
      ],
    },
    {
      id: 'qkv',
      seconds: 32,
      section: S1,
      cues: [
        [0.3, 6.5, 'token id 는 넣은 차례일 뿐이라 embedding 표의 행을 꺼내 쓰고, "배" 는 어느 문장에서든 [1, 1] 입니다.'],
        [6.5, 13, 'attention 은 dot product 점수를 softmax 해 합이 1 인 weight 로 만들고, vector 를 가중 평균합니다.'],
        [13, 19.5, '"빨간 컵 집어" 에서 embedding 을 그대로 쓰면, "집어" 는 "컵" 에 3.5% 만 주고 자기에게 70.5% 를 줍니다.'],
        [19.5, 25.5, 'W_Q, W_K, W_V 를 곱해 찾는 기준 query, 보여 주는 표지 key, 넘길 내용 value 를 나눕니다.'],
        [25.5, 31.7, '이제 "집어" 는 "컵" 에서 84.4% 를 가져와서, 출력 [0.958, 0.802] 가 대부분 "컵" 의 value 로 채워집니다.'],
      ],
    },
    {
      id: 'scaling',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'dot product 는 d_k 개 칸의 곱을 더한 값이라, 칸이 평균 0, 분산 1 이면 점수는 √d_k 정도로 자랍니다.'],
        [6.5, 13, 'd_k 가 64 면 점수가 8 정도인데, [1, 0, −1] 을 8 배 하면 weight 가 0.665 에서 0.99966 으로 쏠립니다.'],
        [13, 20, '가운데 점수를 0.5 올려도 weight 변화가 +0.103 대신 +0.0002 라서, gradient 가 0 에 가깝습니다.', '가운데 점수를 0.5 올려도 weight 변화가 0.103 대신 0.0002 라서, gradient 가 0 에 가깝습니다.'],
        [20, 27.5, '그래서 점수를 √d_k 로 나눕니다. 순서는 그대로라서 "집어" 의 점수를 √2 로 나눠도 "컵" 이 0.734 로 가장 큽니다.'],
      ],
    },
    {
      id: 'pause-scale',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. d_k 가 16 일 때 dot product 가 12 인 점수는 √d_k 로 나눈 뒤 얼마가 될까요?'],
        [16.5, 23.5, '√16 은 4 라서 12 ÷ 4 로 3 입니다. 이렇게 나누면 차원과 상관없이 점수의 대표적인 크기가 1 근처에 옵니다.'],
      ],
    },
    {
      id: 'heads',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'attention 한 번은 token 마다 weight 한 줄이라서, "컵" 은 "빨간" 과 "집어" 에 0.422 씩 나눠 줍니다.'],
        [6.5, 13, 'multi-head 는 칸을 나눠 head 마다 따로 attention 하고, 두 head 가 "빨간" 과 "집어" 에 0.576 씩 줍니다.'],
        [13, 20, 'head 수만 바꾼 번역 비교에서 BLEU 는 8 개일 때 25.8 로 가장 높았고, 1 개일 때는 24.9 였습니다.', 'head 수만 바꾼 번역 비교에서 BLEU 는 여덟 개일 때 25.8 로 가장 높았고, 한 개일 때는 24.9 였습니다.'],
        [20, 27.5, 'head 차원은 d_model ÷ h 라서, GPT-2 의 768 ÷ 12 와 ACT 의 512 ÷ 8 은 둘 다 64 입니다.'],
      ],
    },
    {
      id: 'block',
      seconds: 31,
      section: S2,
      cues: [
        [0.3, 6.5, '점수와 가중 평균은 순서와 상관없어서, dog bites man 과 man bites dog 의 bites 출력이 같습니다.'],
        [6.5, 12.5, 'positional encoding 은 −1 과 1 사이를 오가는 sin 과 cos 으로 위치 vector 를 만들어 더합니다.'],
        [12.5, 18.5, 'residual connection 은 입력을 더해 넘겨서, gradient 가 세 층 뒤 0.001 대신 1.331 로 남습니다.'],
        [18.5, 24.5, 'LayerNorm 은 평균을 빼고 표준편차로 나눠, [1, 1, 5, 5] 와 [10, 10, 50, 50] 을 똑같이 만듭니다.'],
        [24.5, 30.7, 'FFN 은 token 마다 따로 512 차원을 2,048 로 늘렸다 되돌리고, 원래 논문은 이 block 을 6 층 쌓았습니다.'],
      ],
    },
    {
      id: 'pause-norm',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. [2, 2, 6, 6] 의 LayerNorm 은? 입력 [2, 0] 에 출력 [−1, 3] 을 더하면?'],
        [16.5, 23.5, '평균 4 를 빼고 표준편차 2 로 나눠 [−1, −1, 1, 1] 이고, residual 을 거친 값은 [1, 3] 입니다.'],
      ],
    },
    {
      id: 'encdec',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, 'encoder 는 숫자열 뒤집기의 입력 "3 1 4" 를 한꺼번에 읽어, 전체 정보가 섞인 vector 를 token 마다 냅니다.'],
        [6.5, 13, 'decoder 는 <bos> 부터 한 token 씩 골라 입력 끝에 붙이는데, 이 방식을 autoregressive 라고 합니다.'],
        [13, 20, 'cross-attention 은 decoder 쪽에서 query 를 만들고 encoder 출력에서 key 와 value 를 만듭니다.'],
        [20, 27.5, '출력의 t 번째는 입력의 뒤에서 t 번째라서, 잘 학습하면 cross-attention weight 가 반대쪽 대각선에 모입니다.'],
      ],
    },
    {
      id: 'mask',
      seconds: 31,
      section: S3,
      cues: [
        [0.3, 6.5, '학습 때는 정답 "<bos> 4 1 3" 을 한꺼번에 넣고 위치마다 다음 token 을 맞히는 teacher forcing 을 씁니다.'],
        [6.5, 12.5, '그대로 두면 위치 1 의 <bos> 가 위치 2 의 "4" 를 보고 답을 베끼지만, 생성할 때는 뒤쪽 token 이 아직 없습니다.'],
        [12.5, 18.5, '그래서 softmax 전에 뒤쪽 점수를 −∞ 로 바꾸면, [1, 2, 3, 0] 의 weight 가 0.269, 0.731, 0, 0 입니다.'],
        [18.5, 24.5, 'mask 가 없으면 아직 없을 "1" 에서 64.4% 를 가져오고, softmax 뒤에 지우면 남은 합이 0.324 라 1 이 아닙니다.'],
        [24.5, 30.7, 'causal mask 는 대각선과 그 왼쪽만 열린 표이고, decoder 의 self-attention 에만 씁니다.'],
      ],
    },
    {
      id: 'pause-reverse',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. "3 1 4 1" 을 뒤집는 decoder 는 몇 단계에 멈추고, 첫 출력 때 입력의 몇 번째를 볼까요?'],
        [16.5, 23.5, '"1 4 1 3" 다음 <eos> 를 골라 5 단계에 멈추고, 첫 token "1" 은 입력의 넷째 token 을 봐야 합니다.'],
      ],
    },
    {
      id: 'act',
      seconds: 31,
      section: S4,
      cues: [
        [0.3, 6.5, 'ACT 는 encoder-decoder 로 사진과 관절 각도를 받아 100 step 의 action chunk 를 냅니다.'],
        [6.5, 12.5, 'encoder token 은 구역 4 × 300 인 1,200 개에 관절 1 개와 style 변수 z 1 개를 더한 1,202 개입니다.', 'encoder token 은 구역 4 × 300 인 1,200 개에 관절 한 개와 style 변수 z 한 개를 더한 1,202 개입니다.'],
        [12.5, 18.5, '논문 표 III 의 ACT 는 encoder 4 층과 decoder 7 층에 512 차원, head 8 개, FFN 3,200 차원을 씁니다.', '논문 표 III 의 ACT 는 encoder 4 층과 decoder 7 층에 512 차원, head 여덟 개, FFN 3,200 차원을 씁니다.'],
        [18.5, 24.5, 'decoder 입력은 언제나 같은 query 100 개이고, i 번째 query 가 i 번째 step 의 action 을 찾습니다.'],
        [24.5, 30.7, 'decoder 출력 100 개를 linear layer 로 관절 목표값 14 개씩 바꾸면 100 × 14 action chunk 입니다.'],
      ],
    },
    {
      id: 'act-cost',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'query 100 개로 100 step 을 한꺼번에 내므로, 공개 코드는 decoder 에 causal mask 를 쓰지 않습니다.'],
        [6.5, 13, 'encoder 와 decoder 를 한 번씩만 계산해서, 논문에 따르면 RTX 2080 Ti 한 장에서 추론이 약 0.01 초입니다.'],
        [13, 20, '공개 코드는 decoder 7 층 중 첫째 층 출력을 action 에 써서, LeRobot 은 decoder 1 층을 기본값으로 둡니다.'],
        [20, 27.5, '점수 표는 token 수의 제곱이라, 카메라 1 대의 91,204 칸이 4 대면 1,444,804 칸으로 약 16 배입니다.', '점수 표는 token 수의 제곱이라, 카메라 한 대의 91,204 칸이 네 대면 1,444,804 칸으로 약 16 배입니다.'],
      ],
    },
    {
      id: 'pause-act',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 카메라 2 대인 ACT 의 encoder token 수와 점수 표 칸 수는? 50 step 이면 query 는?', '멈추고 적어 보기. 카메라 두 대인 ACT 의 encoder token 수와 점수 표 칸 수는? 50 step 이면 query 는?'],
        [16.5, 23.5, '사진 token 600 개에 관절과 z 를 더해 602 개이고, 점수 표는 362,404 칸이며, query 는 50 개입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. attention 은 query·key 점수를 √d_k 로 나눠 softmax 하고, 그 weight 로 value 를 섞습니다.'],
        [4.2, 8.2, 'head 마다 다른 관계를 보고, 위치 vector 와 residual, LayerNorm 으로 block 을 쌓습니다.'],
        [8.2, 12.2, 'causal mask 는 softmax 전에 뒤쪽 점수를 −∞ 로 바꿔, 한꺼번에 학습해도 앞의 token 만 보게 합니다.'],
        [12.2, 15.7, 'ACT 는 token 1,202 개를 encoder 4 층에 넣고, query 100 개로 100 step 을 한꺼번에 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, 'decoder 만 쌓아 글을 생성하는 방법은 GPT-2 에서 다루고, 사진을 patch token 으로 넣는 방법은 ViT 에서 다룹니다.'],
        [3.6, 6.6, 'action 을 token 으로 바꿔 고르는 RT-1 과, action chunk 와 CVAE 를 결합한 ACT 도 이 구조를 씁니다.'],
      ],
    },
  ],
}
