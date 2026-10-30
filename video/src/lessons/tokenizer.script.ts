import type { VideoScript } from '../script.ts'

// Numbers follow lessons/tokenizer/README.md: the opening (Pick up the red cup. 6 vs 빨간 컵을 집어. 18 in GPT-2, 세 배);
// bytes (ASCII cat 99 97 116, ␣ 32; byte 0 ~ 255, 256 가지; UTF-8 1 ~ 4 byte: h 104, é 195 169, 안 50504 → 236 149 136,
// emoji 128578 → 240 159 153 130; 한글 음절 44032 ~ 55203 → 3 byte); tokens (byte vocabulary 256, "cat hat" 7 tokens 99 97
// 116 32 104 97 116; unbelievable 12 / 1 / 4 = un bel iev able, 글자 100 개 안팎, 단어 수만 ~ 수십만, GPT-2 50,257; Unicode
// 출발 13만 개 넘음; check "hello world" 11 / 2); BPE training (cat hat cat that: 16 byte, 15 자리, (a, t) 4, (t, ␣) 3, (c, a)
// 2, (h, a) 2, 넷은 1 씩; 2 + 4 + 3 + 2 + 4 × 1 = 15; ids 256 at, 257 at␣, 258 cat␣; 16 → 12 → 9 → 7; 259 − 256 = 3; Gage
// 1994, Sennrich 2016, GPT-2 2019; check "ab ab abc" 9 tokens, (a, b) 3, 9 − 3 = 6); encode (that cat 8 → 6 → 5 → 5, ids 116
// 104 257 99 256; cat␣ 1 vs 3 in reverse order; GPT-2 하 = 47991 + 246, 237 149 | 152); pre-tokenization (dog. dog! dog?;
// cat, ␣hat, ␣cat, ␣that; (t, ␣) 3 번은 세지 않음; at, cat, hat); special token (<|endoftext|> 50256; Hello world's 15496 995
// 338; V = 256 + M + S, 256 + 50,000 + 1 = 50,257; check 1000 = 256 + M + 2, M = 742); vocabulary size (16 ÷ 7 ≈ 2.29; Tiny
// Shakespeare 256 / 512 / 1024 / 50,257 → 1.00 / 1.88 / 2.26 / 3.09, embedding 약 20만 / 39만 / 79만 / 3,860만; 50,257 × 768 =
// 38,597,376 of 124,439,808 ≈ 31%); Korean tokens (Pick up the red cup. 20 byte 6 / 6 / 6; 빨간 컵을 집어. 21 byte 18 / 11 / 9;
// 고양이가 모자를 썼다. 30 byte 26 / 13 / 9); action bins (0 ~ 8 cm, 1 cm, 8 bins, 3.4 → bin 3 → 3.5 cm; RT-1 11, RT-2 8,
// OpenVLA 7, 256 bins; Llama 새 자리 100 개; 1st ~ 99th quantile; check 6.7 → bin 6, (6 + 7) ÷ 2 = 6.5, 0.2 cm); FAST
// (BridgeV2 7 × 5 Hz 35 / 20, DROID 15 Hz 105 / 29, Bussing 20 Hz 140 / 28, Shirt Fold 14 × 50 Hz 700 / 53; joint 0.10 0.12
// 0.16 0.22 0.30 0.38 0.44 0.48 → DCT 0.778 −0.388 0.032 0.003 0.000 −0.003 0.002 0.000 → × 10 rounded 8 −4 0 0 0 0 0 0; BPE
// vocabulary 1024; π0-FAST GPU 시간 5 분의 1, RTX 4090 1 초 chunk π0 100 ms 안쪽 vs π0-FAST 약 750 ms).

const S1 = 'token 과 vocabulary'
const S2 = 'BPE 학습과 encode'
const S3 = 'vocabulary 크기'
const S4 = 'action token'

export const script: VideoScript = {
  id: 'tokenizer',
  title: 'BPE Tokenizer',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/tokenizer',
  sections: [S1, S2, S3, S4],
  terms: [
    ['pre-tokenization', '프리 토크나이제이션'],
    ['Tiny Shakespeare', '타이니 셰익스피어'],
    ['bytes per token', '바이츠 퍼 토큰'],
    ['language model', '랭귀지 모델'],
    ['special token', '스페셜 토큰'],
    ['action token', '액션 토큰'],
    ['action chunk', '액션 청크'],
    ['unbelievable', '언빌리버블'],
    ['Transformer', '트랜스포머'],
    ['vocabulary', '보캐뷸러리'],
    ['Shirt Fold', '셔츠 폴드'],
    ['tokenizer', '토크나이저'],
    ['Tokenizer', '토크나이저'],
    ['embedding', '임베딩'],
    ['sequence', '시퀀스'],
    ['π0-FAST', '파이 제로 패스트'],
    ['OpenVLA', '오픈브이엘에이'],
    ['Unicode', '유니코드'],
    ['subword', '서브워드'],
    ['GPT-4o', '지피티 포 오'],
    ['corpus', '코퍼스'],
    ['encode', '인코드'],
    ['decode', '디코드'],
    ['GPT-2', '지피티 투'],
    ['GPT-4', '지피티 포'],
    ['UTF-8', '유티에프 팔'],
    ['merge', '머지'],
    ['token', '토큰'],
    ['ASCII', '아스키'],
    ['Llama', '라마'],
    ['RT-2', '알티 투'],
    ['FAST', '패스트'],
    ['text', '텍스트'],
    ['byte', '바이트'],
    ['chunk', '청크'],
    ['hello', '헬로'],
    ['world', '월드'],
    ['that', '댓'],
    ['unk', '언크'],
    ['BPE', '비피이'],
    ['DCT', '디씨티'],
    ['VLA', '브이엘에이'],
    ['GPU', '지피유'],
    ['cat', '캣'],
    ['hat', '햇'],
    ['dog', '도그'],
    ['bin', '빈'],
    ['id', '아이디'],
    ['at', '앳'],
    ['cm', '센티미터'],
    ['π0', '파이 제로'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'BPE Tokenizer 는 text 를 token id 열로 바꾸고, 자주 붙어 나오는 쌍을 합쳐 vocabulary 를 만듭니다.'],
        [4.2, 7.8, 'token 과 vocabulary, BPE 학습과 encode, vocabulary 크기, action token 을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [
          0.4,
          4.4,
          'GPT-2 로 자르면 "Pick up the red cup." 은 token 6 개인데, "빨간 컵을 집어." 는 18 개가 됩니다.',
          'GPT-2 로 자르면 영어 지시 문장은 token 6 개인데, 한국어 문장 빨간 컵을 집어 는 18 개가 됩니다.',
        ],
        [4.4, 7.8, '같은 지시인데 한국어에는 왜 token 이 세 배나 필요하고, 로봇 행동은 어떻게 token 이 될까요?'],
      ],
    },
    {
      id: 'bytes',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'language model 은 곱하기와 더하기만 하므로, 글자를 먼저 숫자 열로 바꿔서 받습니다.'],
        [7, 13.5, 'ASCII 에서 "cat" 은 99, 97, 116 번이고 공백은 32 번이며, byte 하나는 0 부터 255 까지 담습니다.', 'ASCII 에서 cat 은 99, 97, 116 번이고 공백은 32 번이며, byte 하나는 0 부터 255 까지 담습니다.'],
        [
          13.5,
          20.5,
          'UTF-8 로 적으면 글자 하나가 byte 1 ~ 4 개가 되고, "안" 은 236, 149, 136 의 3 byte 입니다.',
          'UTF-8 로 적으면 글자 하나가 byte 1 개에서 4 개가 되고, 안 은 236, 149, 136 의 3 byte 입니다.',
        ],
        [20.5, 27.5, '한글 음절은 모두 3 byte 라서, 한국어 문장은 글자 수가 적어도 byte 수는 같은 뜻의 영어와 비슷해집니다.'],
      ],
    },
    {
      id: 'units',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'text 를 자른 조각이 token 이고, token 에 번호를 붙인 목록이 vocabulary, 그 번호가 token id 입니다.'],
        [6.5, 12.5, 'byte 256 개를 그대로 vocabulary 로 쓰면 "cat hat" 은 token 7 개라서 sequence 길이가 7 입니다.', 'byte 256 개를 그대로 vocabulary 로 쓰면 cat hat 은 token 7 개라서 sequence 길이가 7 입니다.'],
        [
          12.5,
          18.5,
          'unbelievable 은 글자로 12 개, 단어로 1 개, subword 로는 un, bel, iev, able 의 4 개입니다.',
          'unbelievable 은 글자로 12 개, 단어로 1 개, subword 로는 네 조각으로 4 개입니다.',
        ],
        [18.5, 24.5, '단어 단위는 오타나 새 말을 모두 <unk> 하나로 바꿔서, decode 해도 원래 단어를 되살릴 수 없습니다.', '단어 단위는 오타나 새 말을 모두 unk 토큰 하나로 바꿔서, decode 해도 원래 단어를 되살릴 수 없습니다.'],
        [24.5, 29.7, 'GPT-2 는 byte 256 개에서 출발해서, 새 글자도 byte 하나가 token 이 될 뿐 <unk> 는 없습니다.', 'GPT-2 는 byte 256 개에서 출발해서, 새 글자도 byte 하나가 token 이 될 뿐 unk 토큰 는 없습니다.'],
      ],
    },
    {
      id: 'pause-units',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. "hello world" 를 글자 단위로 자르면 token 몇 개이고, 단어 단위로는 몇 개일까요?', '멈추고 적어 보기. hello world 를 글자 단위로 자르면 token 몇 개이고, 단어 단위로는 몇 개일까요?'],
        [16.5, 23.5, '공백까지 세어 글자 단위는 11 개이고, 공백을 경계로 자른 단어 단위는 hello, world 의 2 개입니다.'],
      ],
    },
    {
      id: 'bpe-train',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'BPE 는 이웃한 두 token 을 쌍으로 보고, 가장 자주 나오는 쌍을 새 token 으로 merge 하기를 되풀이합니다.'],
        [
          6.5,
          12.5,
          'corpus "cat hat cat that" 은 byte 16 개라서 이웃한 자리가 15 군데이고, (a, t) 가 4 번으로 가장 많습니다.',
          'corpus cat hat cat that 은 byte 16 개라서 이웃한 자리가 15 군데이고, 에이 티 쌍이 4 번으로 가장 많습니다.',
        ],
        [
          12.5,
          18.5,
          '(a, t) 에 새 id 256 을 붙여 at 으로 바꾸면, 네 자리가 줄어 sequence 는 16 개에서 12 개가 됩니다.',
          '에이 티 쌍에 새 id 256 을 붙여 at 으로 바꾸면, 네 자리가 줄어 sequence 는 16 개에서 12 개가 됩니다.',
        ],
        [
          18.5,
          24.5,
          '다음 회차에는 at␣ 가 257, cat␣ 가 258 이 되어 길이는 12 → 9 → 7 로 줄고, token 이 점점 길어집니다.',
          '다음 회차에는 공백이 붙은 at 이 257, 공백이 붙은 cat 이 258 이 되어 길이는 12 → 9 → 7 로 줄고, token 이 점점 길어집니다.',
        ],
        [
          24.5,
          29.7,
          'merge 한 번마다 vocabulary 가 하나 늘어서, 259 로 만들려면 259 − 256 으로 3 번 합니다.',
          'merge 한 번마다 vocabulary 가 하나 늘어서, 259 로 만들려면 259 빼기 256 으로 3 번 합니다.',
        ],
      ],
    },
    {
      id: 'encode',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'encode 는 merge 를 배운 순서대로 적용하고, 학습에 없던 "that cat" 은 byte 8 개가 token 5 개가 됩니다.', 'encode 는 merge 를 배운 순서대로 적용하고, 학습에 없던 that cat 은 byte 8 개가 token 5 개가 됩니다.'],
        [7, 13.5, '끝의 cat 뒤에 공백이 없어 merge 3 은 건너뛰고, 결과 id 열은 116, 104, 257, 99, 256 입니다.'],
        [
          13.5,
          20.5,
          'merge 를 3 → 2 → 1 로 거꾸로 적용하면 "cat␣" 은 token 1 개가 아니라 c, at, ␣ 의 3 개가 됩니다.',
          'merge 를 3 → 2 → 1 로 거꾸로 적용하면 공백이 붙은 cat 은 token 1 개가 아니라 3 개가 됩니다.',
        ],
        [
          20.5,
          27.5,
          'decode 는 id 마다 byte 를 이어 붙입니다. GPT-2 의 47991 은 "하" 의 앞 2 byte 만 담아 혼자면 � 가 됩니다.',
          'decode 는 id 마다 byte 를 이어 붙입니다. GPT-2 의 47991 은 하 의 앞 2 byte 만 담아 혼자면 깨진 글자가 됩니다.',
        ],
      ],
    },
    {
      id: 'pause-merge',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. "ab ab abc" 의 첫 회차에서 가장 많은 쌍은 무엇이고, merge 뒤 token 은 몇 개일까요?',
          '멈추고 적어 보기. 에이비 에이비 에이비씨 의 첫 회차에서 가장 많은 쌍은 무엇이고, merge 뒤 token 은 몇 개일까요?',
        ],
        [
          16.5,
          23.5,
          '(a, b) 가 3 번으로 가장 많고, token 9 개에서 세 자리를 256 하나로 바꿔 9 − 3 으로 6 개가 됩니다.',
          '에이 비 쌍이 3 번으로 가장 많고, token 9 개에서 세 자리를 256 하나로 바꿔 9 빼기 3 으로 6 개가 됩니다.',
        ],
      ],
    },
    {
      id: 'pretoken',
      seconds: 26,
      section: S3,
      cues: [
        [
          0.3,
          6.5,
          'GPT-2 는 "dog." "dog!" 가 다른 token 이 되는 낭비를 막으려고, BPE 전에 text 를 단어 조각으로 나눕니다.',
          'GPT-2 는 dog 뒤에 붙는 문장부호마다 다른 token 이 되는 낭비를 막으려고, BPE 전에 text 를 단어 조각으로 나눕니다.',
        ],
        [6.5, 12.5, '이 pre-tokenization 뒤에는 쌍을 조각 안에서만 세서, 단어 뒤에 공백이 붙은 token 이 없습니다.'],
        [
          12.5,
          19,
          'special token <|endoftext|> 는 조각내기 전에 먼저 떼어 내서, merge 없이 id 50256 하나로 바꿉니다.',
          'special token 엔드 오브 텍스트 는 조각내기 전에 먼저 떼어 내서, merge 없이 id 50256 하나로 바꿉니다.',
        ],
        [
          19,
          25.7,
          'V = 256 + M + S 라서, GPT-2 는 merge 50,000 번에 special token 하나를 더해 50,257 입니다.',
          'vocabulary 크기는 256 더하기 merge 횟수 더하기 special token 개수라서, GPT-2 는 merge 50,000 번에 special token 하나를 더해 50,257 입니다.',
        ],
      ],
    },
    {
      id: 'vocab-size',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, 'bytes per token 은 byte 수 ÷ token 수이고, cat hat cat that 은 16 ÷ 7 로 약 2.29 입니다.'],
        [6.5, 12.5, 'vocabulary 를 256, 512, 1024, 50,257 로 키우면 이 값은 1.00, 1.88, 2.26, 3.09 가 됩니다.'],
        [12.5, 18.5, '대신 embedding 표가 커져서 GPT-2 는 50,257 × 768 로 약 3,860만 개, 모델 전체의 약 31% 입니다.'],
        [18.5, 24.5, '한국어 지시는 21 byte 로 영어 20 byte 와 비슷한데, GPT-2 에 한국어 merge 가 적어 token 은 18 대 6 입니다.'],
        [
          24.5,
          29.7,
          '한국어를 더 배운 tokenizer 는 "고양이가 모자를 썼다." 를 26 → 13 → 9 개로 줄입니다.',
          '한국어를 더 배운 tokenizer 는 고양이가 모자를 썼다 를 GPT-2 26 개, GPT-4 13 개, GPT-4o 9 개로 줄입니다.',
        ],
      ],
    },
    {
      id: 'pause-vocab',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. special token 2 개를 두고 vocabulary 크기를 1000 으로 만들려면 merge 를 몇 번 해야 할까요?'],
        [
          16.5,
          23.5,
          'S 가 2 라서 1000 = 256 + M + 2 이고, merge 횟수 M 은 1000 − 256 − 2 로 742 번입니다.',
          'special token 이 2 개라서 1000 은 256 더하기 merge 횟수 더하기 2 이고, merge 횟수는 1000 빼기 256 빼기 2 로 742 번입니다.',
        ],
      ],
    },
    {
      id: 'bins',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'RT-2 · OpenVLA 같은 VLA 는 vocabulary 의 token 만 고를 수 있어서, 3.4 같은 실수를 적어 내지 못합니다.'],
        [
          7,
          13.5,
          '그래서 범위를 bin 으로 나눕니다. 0 ~ 8 cm 를 1 cm 씩 나누면 3.4 cm 는 bin 3 이고, 되돌리면 3.5 cm 입니다.',
          '그래서 범위를 bin 으로 나눕니다. 0 에서 8 cm 를 1 cm 씩 나누면 3.4 cm 는 bin 3 이고, 되돌리면 3.5 cm 입니다.',
        ],
        [13.5, 20.5, 'RT-1 은 11 개, RT-2 는 8 개, OpenVLA 는 7 개의 행동 숫자를 내고, 값 하나를 256 개 bin 으로 나눕니다.'],
        [20.5, 27.5, 'OpenVLA 논문에 따르면 Llama 는 새 자리가 100 개뿐이라, 드물게 쓰이는 token 256 개를 덮어썼습니다.'],
      ],
    },
    {
      id: 'fast',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '값마다 bin 하나면 token 이 차원 수 × 주기로 늘어서, 14 차원 50 Hz 인 Shirt Fold 는 1 초에 700 개입니다.'],
        [6.5, 12.5, 'FAST 는 action chunk 를 DCT 로 바꾸는데, 부드러운 움직임은 앞의 몇 계수만 크고 나머지는 0 에 가깝습니다.'],
        [
          12.5,
          19,
          '관절 값 0.10 ~ 0.48 의 계수는 0.778, −0.388 만 크고, 10 을 곱해 반올림하면 8, −4 와 0 여섯 개입니다.',
          '관절 값 0.10 에서 0.48 의 계수는 0.778, −0.388 만 크고, 10 을 곱해 반올림하면 8, −4 와 0 여섯 개입니다.',
        ],
        [19, 25.5, '이어서 BPE 가 이어진 0 과 자주 나오는 계수 조합을 token 하나로 합치고, vocabulary 는 1024 입니다.'],
        [25.5, 31.7, 'Shirt Fold 의 700 개는 평균 53 개가 됐고, π0-FAST 는 π0 의 5 분의 1 GPU 시간에 비슷한 성능을 냈습니다.'],
      ],
    },
    {
      id: 'pause-bin',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 0 ~ 8 cm 를 1 cm 씩 8 개 bin 으로 나눌 때, 6.7 cm 는 몇 번 bin 이고 되돌리면 몇 cm 일까요?',
          '멈추고 적어 보기. 0 에서 8 cm 를 1 cm 씩 8 개 bin 으로 나눌 때, 6.7 cm 는 몇 번 bin 이고 되돌리면 몇 cm 일까요?',
        ],
        [
          16.5,
          23.5,
          '6.7 은 6 이상 7 미만이라 bin 6 이고, 가운데 값 (6 + 7) ÷ 2 로 6.5 cm 가 되어 0.2 cm 오차가 생깁니다.',
          '6.7 은 6 이상 7 미만이라 bin 6 이고, 가운데 값 6 더하기 7 을 2 로 나눈 6.5 cm 가 되어 0.2 cm 오차가 생깁니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. language model 은 숫자만 계산하므로, tokenizer 가 UTF-8 byte 열을 token id 열로 바꿉니다.'],
        [4.2, 8.2, 'BPE 는 가장 자주 나오는 쌍을 merge 해 vocabulary 를 만들고, encode 는 그 merge 를 배운 순서대로 적용합니다.'],
        [8.2, 12.2, 'GPT-2 의 merge 는 대부분 영어에서 배워서, 한국어 byte 는 합쳐지지 못하고 token 이 세 배 듭니다.'],
        [12.2, 15.7, '로봇 행동은 값마다 256 개 bin 의 token 이 되거나, FAST 처럼 DCT 와 BPE 로 700 개를 평균 53 개로 줄입니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'id 를 embedding 으로 바꾸고 다른 token 을 함께 보며 뜻을 정하는 계산은 Transformer 에서 다룹니다.']],
    },
  ],
}
