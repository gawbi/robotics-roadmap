import type { VideoScript } from '../script.ts'

// Numbers follow lessons/vit/README.md: a 224×224 colour photo has 3 × 224 × 224 = 150,528 numbers; pixel tokens 224 × 224
// = 50,176, score table ≈ 25억 칸; 16×16 patches 224 ÷ 16 = 14, 14 × 14 = 196 tokens, 196 × 196 = 38,416 칸; N = H/P × W/P;
// one colour patch 3 × 16 × 16 = 768; patch size table 32 → 7, 49, 2,401 / 16 → 14, 196, 38,416 / 14 → 16, 256, 65,536 /
// 8 → 28, 784, 614,656, 38,416 ÷ 2,401 = 16 (4 × 4); the 4×4 example (rows 0110 0110 0011 0011, 2×2 patches [0,1,0,1]
// [1,0,1,0] [0,0,0,0] [1,1,1,1]), E = [1 1 1 1; 1 −1 1 −1] → [2,−2] [2,2] [0,0] [4,0]; ViT-B/16 E 768 × 768 + 768 =
// 590,592; check 96 ÷ 16 = 6, 6 × 6 = 36, 768. [CLS]: weights 0.2 each → [1.6, 0]; [CLS] = [1, 0] → 0.037 0.101 0.101 0.014
// 0.747 → [3.429, 0]; 196 + 1 = 197; head 768 × 1,000 + 1,000 = 769,000. position: swapped photo B also [1.6, 0]; example
// position vectors [1,0] [0,1] [0,−1] [−1,0] [0,0] → A [3.454, 0], B [3.454, 0.651]; table 197 × 768 = 151,296; 5-shot
// accuracy 61.38 / 64.21 / 64.00 / 64.03%; check 448 ÷ 16 = 28, 28 × 28 = 784, 784 ÷ 196 = 4. inductive bias: 3×3 filter;
// table 5 ImageNet 130만 77.91 / 76.53, ImageNet-21k 1,400만 83.97 / 85.15, JFT-300M 3억 300만 84.15 / 87.12; 86M / 307M,
// 3.6 배; ViT-B/32 vs ResNet50 900만 / 9,000만; ACT 시연 50 개 정도, ResNet-18; check 84.15 − 77.91 = 6.24, 87.12 − 76.53 =
// 10.59. robots: OpenVLA / π0 256 tokens at 224×224, GR00T N1 64; SigLIP 1,152 + DINOv2 1,024 = 2,176, Llama 2 4,096;
// So400m ≈ 4억; π0 table I 14 + 32 + 27 = 73 ms, 14 + 32 = 46 ms, 50 commands a second, 25 actions, 0.5 초; PaliGemma 224 /
// 448 / 896 → 256 / 1,024 / 4,096; OpenVLA 384×384 학습 시간 3 배; frozen 46.7% vs fine-tuned 80.0%; check 16 × 16 = 256,
// 2 × 256 = 512, 512 + 16 = 528.

const S1 = 'patch 와 token 수'
const S2 = '[CLS] 와 위치 정보'
const S3 = 'inductive bias'
const S4 = '로봇 policy 의 ViT'

export const script: VideoScript = {
  id: 'vit',
  title: 'ViT',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/vit',
  sections: [S1, S2, S3, S4],
  terms: [
    ['translation equivariance', '트랜슬레이션 이퀴베리언스'],
    ['position embedding', '포지션 임베딩'],
    ['patch embedding', '패치 임베딩'],
    ['inductive bias', '인덕티브 바이어스'],
    ['self-attention', '셀프 어텐션'],
    ['interpolation', '인터폴레이션'],
    ['image encoder', '이미지 인코더'],
    ['pixel shuffle', '픽셀 셔플'],
    ['ImageNet-21k', '이미지넷 이십일 케이'],
    ['convolution', '컨볼루션'],
    ['fine-tuning', '파인튜닝'],
    ['Transformer', '트랜스포머'],
    ['image token', '이미지 토큰'],
    ['PaliGemma', '팔리젬마'],
    ['ResNet-18', '레즈넷 십팔'],
    ['ViT-B/16', '비트 비 십육'],
    ['ViT-L/16', '비트 엘 십육'],
    ['attention', '어텐션'],
    ['parameter', '파라미터'],
    ['locality', '로컬리티'],
    ['JFT-300M', '제이에프티 삼백 엠'],
    ['GR00T N1', '그루트 엔 원'],
    ['ImageNet', '이미지넷'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['encoder', '인코더'],
    ['DINOv2', '다이노 브이 투'],
    ['SigLIP', '시그립'],
    ['ResNet', '레즈넷'],
    ['filter', '필터'],
    ['stride', '스트라이드'],
    ['vector', '벡터'],
    ['weight', '웨이트'],
    ['policy', '폴리시'],
    ['[CLS]', '씨엘에스'],
    ['class', '클래스'],
    ['patch', '패치'],
    ['token', '토큰'],
    ['pixel', '픽셀'],
    ['text', '텍스트'],
    ['head', '헤드'],
    ['bias', '바이어스'],
    ['CLIP', '클립'],
    ['RT-2', '알티 투'],
    ['CNN', '씨엔엔'],
    ['VLA', '브이엘에이'],
    ['ViT', '비트'],
    ['BiT', '비아이티'],
    ['%p', '퍼센트포인트'],
    ['π0', '파이 제로'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'ViT 는 사진을 patch 로 잘라 조각 하나를 token 하나로 읽고, 글을 읽던 Transformer 에 넣습니다.'],
        [4.2, 7.8, 'patch 와 token 수, [CLS] 와 위치 정보, inductive bias, 로봇의 ViT encoder 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '224×224 컬러 사진 한 장은 숫자가 150,528 개인데, OpenVLA·π0 는 이 사진을 Transformer 에 넣습니다.'],
        [4.4, 7.8, '단어도 글자도 아닌 이 숫자 격자를 Transformer 는 어떤 단위로 잘라 읽을까요?'],
      ],
    },
    {
      id: 'patches',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.8, 'attention 은 token 쌍마다 점수를 하나씩 매겨서, token 이 N 개면 점수 표는 N × N 칸입니다.'],
        [5.8, 11.3, 'pixel 하나를 token 하나로 쓰면 224×224 사진은 token 이 50,176 개이고, 점수 표는 약 25억 칸입니다.'],
        [11.3, 17.3, '16×16 patch 로 자르면 한 변에 224 ÷ 16 으로 14 개, 모두 196 개라서 점수 표는 38,416 칸입니다.'],
        [
          17.3,
          22.8,
          'patch 수는 H ÷ P × W ÷ P 이고, 컬러 patch 하나를 펼치면 3 × 16 × 16 으로 숫자 768 개입니다.',
          'patch 수는 세로 H 를 P 로 나눈 값에 가로 W 를 P 로 나눈 값을 곱한 것이고, 컬러 patch 하나를 펼치면 3 × 16 × 16 으로 숫자 768 개입니다.',
        ],
        [22.8, 27.7, 'patch 한 변을 32 에서 16 으로 줄이면 token 은 49 개에서 196 개로 4 배, 점수 표는 16 배가 됩니다.'],
      ],
    },
    {
      id: 'embed',
      seconds: 30,
      section: S1,
      cues: [
        [
          0.3,
          7,
          '펼친 patch 에 행렬 E 를 곱해 정해진 길이의 vector 로 바꾸는 계산이 patch embedding 입니다.',
          '펼친 patch 에 행렬 하나를 곱해 정해진 길이의 vector 로 바꾸는 계산이 patch embedding 입니다.',
        ],
        [
          7,
          14.5,
          '예의 E 는 첫째 행이 흰 칸 수를 세고 둘째 행이 왼쪽 − 오른쪽이라, [0, 1, 0, 1] 은 [2, −2] 가 됩니다.',
          '예의 행렬은 첫째 행이 흰 칸 수를 세고 둘째 행이 왼쪽 빼기 오른쪽이라, 0, 1, 0, 1 은 2, −2 가 됩니다.',
        ],
        [
          14.5,
          22,
          '실제 E 는 학습하는 parameter 이고, ViT-B/16 은 768×768 행렬에 bias 768 개라 590,592 개입니다.',
          '실제 행렬은 학습하는 parameter 이고, ViT-B/16 은 768×768 행렬에 bias 768 개라 590,592 개입니다.',
        ],
        [
          22,
          29.7,
          'patch 가 4 개든 196 개든 같은 E 를 쓰고, filter 와 stride 가 P 인 convolution 과 같은 계산입니다.',
          'patch 가 4 개든 196 개든 같은 행렬을 쓰고, filter 와 stride 가 P 인 convolution 과 같은 계산입니다.',
        ],
      ],
    },
    {
      id: 'pause-patch',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 96×96 컬러 사진을 16×16 patch 로 자르면 patch 는 몇 개이고, 하나는 숫자 몇 개일까요?'],
        [16.5, 23.5, '한 변에 96 ÷ 16 으로 6 개라서 patch 는 36 개이고, patch 하나는 3 × 16 × 16 으로 숫자 768 개입니다.'],
      ],
    },
    {
      id: 'cls',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'Transformer 층은 받은 token 수만큼 vector 를 내보내서, 사진 전체를 대표할 vector 하나가 필요합니다.'],
        [6, 12, 'ViT 는 patch token 맨 앞에 [CLS] token 을 붙이고, 마지막 층에서 이 자리의 출력을 사진의 요약으로 씁니다.'],
        [
          12,
          18,
          '[CLS] 가 [0, 0] 이면 점수가 모두 0 이라 weight 가 0.2 씩이고, 출력은 평균 [1.6, 0] 입니다.',
          '[CLS] 가 0, 0 이면 점수가 모두 0 이라 weight 가 0.2 씩이고, 출력은 평균 1.6, 0 입니다.',
        ],
        [
          18,
          24,
          '[CLS] 가 [1, 0] 이면 흰 칸이 가장 많은 patch 4 의 weight 가 0.747 이라 그 정보를 많이 모읍니다.',
          '[CLS] 가 1, 0 이면 흰 칸이 가장 많은 patch 4 의 weight 가 0.747 이라 그 정보를 많이 모읍니다.',
        ],
        [
          24,
          29.7,
          'ViT-B/16 은 token 이 196 + 1 로 197 개이고, head 는 [CLS] 출력을 1,000 class 의 점수로 바꿉니다.',
          'ViT-B/16 은 token 이 196 더하기 1 로 197 개이고, head 는 [CLS] 출력을 1,000 class 의 점수로 바꿉니다.',
        ],
      ],
    },
    {
      id: 'position',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          7.5,
          'patch 1 과 4 를 맞바꾼 사진 B 도 token 은 순서만 달라서, [CLS] 출력이 똑같이 [1.6, 0] 입니다.',
          'patch 1 과 4 를 맞바꾼 사진 B 도 token 은 순서만 달라서, [CLS] 출력이 똑같이 1.6, 0 입니다.',
        ],
        [7.5, 14.5, '그래서 ViT 는 자리마다 정한 vector 를 token 에 더하는데, 이 vector 가 position embedding 입니다.'],
        [14.5, 21.5, 'ViT-B/16 의 position embedding 은 학습하는 표이고, 숫자가 197 × 768 로 151,296 개입니다.'],
        [21.5, 29.7, 'class 마다 5 장으로 잰 정확도는 위치 정보가 없으면 61.38%, 기본값은 64.21% 로 3%p 가까이 차이 납니다.'],
      ],
    },
    {
      id: 'pause-pos',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. ViT-B/16 에 448×448 사진을 넣으면 patch 는 몇 개이고, 표의 196 자리의 몇 배일까요?'],
        [16.5, 23.5, '한 변에 448 ÷ 16 으로 28 개라 patch 는 784 개이고, 784 ÷ 196 으로 표의 4 배입니다.'],
      ],
    },
    {
      id: 'bias',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'CNN 은 가까운 pixel 이 모양을 만든다는 locality 를 담아, filter 가 3×3 처럼 좁은 곳만 봅니다.'],
        [7, 13.5, '같은 filter 를 모든 자리에 써서, 입력을 옮기면 출력도 옮겨 가는 translation equivariance 도 담습니다.'],
        [13.5, 20.5, '데이터를 보기 전에 구조로 정해 둔 이런 가정을 inductive bias 라고 하는데, ViT 에는 이 가정이 거의 없습니다.'],
        [20.5, 27.7, 'ViT 의 self-attention 은 첫 층부터 사진 전체를 봐서, patch 사이의 공간 관계는 모두 데이터에서 배워야 합니다.'],
      ],
    },
    {
      id: 'data',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '가정이 적은 모델은 같은 데이터에 맞는 규칙이 여럿이라, 그중 하나를 고르려면 데이터가 더 많이 필요합니다.'],
        [6, 12.5, 'ImageNet 130만 장으로 미리 학습하면 3.6 배 큰 ViT-L/16 이 76.53% 로 ViT-B/16 의 77.91% 보다 낮습니다.'],
        [12.5, 19, '1,400만 장에서는 85.15% 대 83.97% 로 뒤집히고, 약 3억 장에서는 87.12% 대 84.15% 로 벌어집니다.'],
        [19, 24.5, '큰 ResNet 인 BiT 도 ImageNet 만으로 학습하면 ViT 보다 높았지만, 데이터가 커지자 ViT 가 앞섰습니다.'],
        [24.5, 29.7, 'ACT 는 과제마다 시연 50 개 정도로 학습해 ResNet-18 을 쓰고, 인터넷 데이터 위에 만든 VLA 는 ViT 를 씁니다.'],
      ],
    },
    {
      id: 'pause-data',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 미리 학습한 데이터를 ImageNet 에서 JFT-300M 으로 바꾸면 두 모델은 각각 몇 %p 오를까요?'],
        [
          16.5,
          23.5,
          'ViT-B/16 은 84.15 − 77.91 로 6.24%p 오르고, ViT-L/16 은 87.12 − 76.53 으로 10.59%p 오릅니다.',
          'ViT-B/16 은 84.15 빼기 77.91 로 6.24%p 오르고, ViT-L/16 은 87.12 빼기 76.53 으로 10.59%p 오릅니다.',
        ],
      ],
    },
    {
      id: 'vla',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'VLA 는 분류처럼 [CLS] 하나만 넘기지 않고, 위치를 지키려고 patch 출력 전부를 언어 모델에 넘깁니다.'],
        [7, 14, '그래야 "빨간 컵" 이라는 지시문 token 과 컵이 있는 구역의 patch token 사이에 attention 점수를 매깁니다.'],
        [14, 21.5, 'OpenVLA 와 π0 는 224×224 사진 한 장을 token 256 개로 넘기고, GR00T N1 은 64 개로 줄입니다.'],
        [21.5, 29.7, 'OpenVLA 는 patch 마다 SigLIP 출력 1,152 개와 DINOv2 출력 1,024 개를 이어 2,176 개로 씁니다.'],
      ],
    },
    {
      id: 'cost',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7.5, 'π0 는 사진 3 장을 받아 행동 한 덩어리를 내는 데 73 ms 가 걸리고, 그중 46 ms 가 사진 token 단계입니다.'],
        [7.5, 15, 'PaliGemma 의 image token 은 사진 224, 448, 896 에서 256, 1,024, 4,096 개로 4 배씩 늡니다.'],
        [15, 22, 'OpenVLA 저자들은 384×384 사진이 성공률 차이 없이 학습 시간만 3 배 걸려서 224×224 를 골랐습니다.'],
        [22, 29.7, 'image encoder 를 고정하면 평균 성공률이 46.7% 였고, 함께 fine-tuning 하면 80.0% 였습니다.'],
      ],
    },
    {
      id: 'pause-pi0',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. π0 가 카메라 2 대의 사진과 text token 16 개짜리 지시문을 받으면, 입력 token 은 몇 개일까요?'],
        [
          16.5,
          23.5,
          '사진 한 장은 16 × 16 으로 256 개, 두 장은 512 개이고, 지시문을 더하면 512 + 16 으로 528 개입니다.',
          '사진 한 장은 16 × 16 으로 256 개, 두 장은 512 개이고, 지시문을 더하면 512 더하기 16 으로 528 개입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. ViT 는 사진을 patch 로 잘라 읽고, 224×224 를 patch 16 으로 자르면 token 이 196 개입니다.'],
        [4.2, 8.2, '맨 앞에 [CLS] 를 붙여 197 개가 되고, 자리마다 학습한 position embedding 을 더해 자리를 구별합니다.'],
        [8.2, 12.2, '가정이 적은 ViT-L/16 은 130만 장에서 76.53% 에 그치지만, 3억 장으로 미리 학습하면 87.12% 로 오릅니다.'],
        [12.2, 15.7, 'OpenVLA·π0·GR00T N1 은 ViT 계열 encoder 의 patch token 전부를 언어 모델에 넘겨 위치 정보를 지킵니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '글과 함께 학습하는 image encoder 는 CLIP 에서 다루고, 이를 붙인 VLA 는 RT-2 → OpenVLA 와 π0 에서 다룹니다.']],
    },
  ],
}
