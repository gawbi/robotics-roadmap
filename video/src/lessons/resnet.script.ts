import type { VideoScript } from '../script.ts'

// Numbers follow lessons/resnet/README.md: degradation (ImageNet ≈ 128만 train / 5만 val, 1000 class; plain 18 층 27.94%,
// 34 층 28.54%; CIFAR-10 56 층 vs 20 층; 20 층 + identity 36 개 = 56 층; He 초기화 √(2 / n_in), 3 배 오래 학습); gradient
// table (0.5 → 0.031 / 0.00098 / 0.00000095; 0.9 → 0.12 at 20; 1.1 → 6.73 at 20); residual block (x = 2, F(x) = 0.3 →
// 2.3; w = 0.05 → 거리 0.95 vs 0.05; w = 0.1 → 비율 0.1 vs 1.1; 20 block: 10⁻²⁰ vs 1.1²⁰ ≈ 6.73, 0.9²⁰ ≈ 0.12; ResNet 18
// 층 27.88% → 34 층 25.03%, plain +0.60%p, ResNet −2.85%p; check: 0.5³ = 0.125, 1.5³ = 3.375); BatchNorm (1, 2, 3, 6 and
// 10, 20, 30, 60 → −1.069, −0.535, 0, 1.604; 평균 3, √3.5 ≈ 1.871; γ = 1, β = 0 처음 값; step 14 배 적게; batch 32, 64
// channel, 56×56 → 32 × 56 × 56 = 100,352; running mean 0.9 / 0.1; check 0.9 × 2 + 0.1 × 12 = 3; batch 2: 1, 3 and 100,
// 102 → −1, 1; GroupNorm table batch 32 / 16 / 8 / 4 / 2: BN 23.6 / 23.7 / 24.8 / 27.3 / 34.7%, GN 24.1 / 24.2 / 24.0 / 24.2
// / 24.1%; ACT batch 8, LeRobot 8); blocks (64×56×56 → 128×28×28, 1×1 conv stride 2, 128 × 64 = 8,192; BasicBlock 73,728,
// bottleneck 69,632, 256 channel 3×3 두 개 1,179,648 ≈ 17 배; check 1,048,576 + 2,359,296 + 1,048,576 = 4,456,448);
// ResNet-18 / 50 (stem 3×224×224 → 64×112×112 → 64×56×56; stage 56 / 28 / 14 / 7, block 2 2 2 2 and 3 4 6 3, channel 64 /
// 128 / 256 / 512 and 256 / 512 / 1024 / 2048; 7×7 = 49; 2⁵ = 32; 1 + 8 × 2 + 1 = 18, 1 + 16 × 3 + 1 = 50; parameter
// 11,689,512 / 25,557,032; GFLOPS 1.81 / 4.09; top-1 69.758% / 76.13%; layer4 71.8% / 58.6%); transfer (backbone
// 11,176,512, head 512 × 10 + 10 = 5,130, fine-tuning 11,181,642; Square 0.94 / 0.58 / 0.92, 10 배 작은 learning rate; ACT
// lr 1e-5; 224×224, mean 0.485 / 0.456 / 0.406, std 0.229 / 0.224 / 0.225; check 512 × 7 + 7 = 3,591); robot encoders (ACT
// 480×640 → 512×15×20, 480 ÷ 32 = 15, 640 ÷ 32 = 20, 300 token, dim_model 512; FrozenBatchNorm 평균 2, 분산 4, γ 3, β 1:
// 3 × (6 − 2) ÷ 2 + 1 = 7; GroupNorm 16 channel 묶음; PushT 96×96 → 512×3×3, 32 keypoint × 2 = 64).

const S1 = 'residual block'
const S2 = 'BatchNorm 과 통계'
const S3 = 'ResNet-18 · 50 구조'
const S4 = 'backbone 과 policy'

export const script: VideoScript = {
  id: 'resnet',
  title: 'ResNet',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/resnet',
  sections: [S1, S2, S3, S4],
  terms: [
    ['global average pooling', '글로벌 애버리지 풀링'],
    ['Microsoft Research', '마이크로소프트 리서치'],
    ['residual connection', '레지듀얼 커넥션'],
    ['vanishing gradient', '배니싱 그래디언트'],
    ['gradient descent', '그래디언트 디센트'],
    ['pretrained weight', '프리트레인드 웨이트'],
    ['spatial softmax', '스페이셜 소프트맥스'],
    ['FrozenBatchNorm', '프로즌 배치놈'],
    ['Diffusion Policy', '디퓨전 폴리시'],
    ['training error', '트레이닝 에러'],
    ['residual block', '레지듀얼 블록'],
    ['max pooling', '맥스 풀링'],
    ['pooling', '풀링'],
    ['running mean', '러닝 민'],
    ['feature map', '피처 맵'],
    ['top-1 error', '탑 원 에러'],
    ['fine-tuning', '파인 튜닝'],
    ['overfitting', '오버피팅'],
    ['degradation', '디그러데이션'],
    ['BasicBlock', '베이직 블록'],
    ['bottleneck', '보틀넥'],
    ['pretrained', '프리트레인드'],
    ['ResNet-18', '레즈넷 십팔'],
    ['ResNet-50', '레즈넷 오십'],
    ['GroupNorm', '그룹놈'],
    ['BatchNorm', '배치놈'],
    ['CIFAR-10', '사이파 텐'],
    ['ImageNet', '이미지넷'],
    ['backbone', '백본'],
    ['keypoint', '키포인트'],
    ['residual', '레지듀얼'],
    ['identity', '아이덴티티'],
    ['gradient', '그래디언트'],
    ['shortcut', '숏컷'],
    ['channel', '채널'],
    ['network', '네트워크'],
    ['PyTorch', '파이토치'],
    ['LeRobot', '르로봇'],
    ['freeze', '프리즈'],
    ['ResNet', '레즈넷'],
    ['Square', '스퀘어'],
    ['weight', '웨이트'],
    ['stride', '스트라이드'],
    ['layer', '레이어'],
    ['stage', '스테이지'],
    ['block', '블록'],
    ['batch', '배치'],
    ['plain', '플레인'],
    ['class', '클래스'],
    ['token', '토큰'],
    ['patch', '패치'],
    ['PushT', '푸시 티'],
    ['parameter', '파라미터'],
    ['policy', '폴리시'],
    ['error', '에러'],
    ['ReLU', '렐루'],
    ['conv', '콘브'],
    ['stem', '스템'],
    ['head', '헤드'],
    ['bias', '바이어스'],
    ['RT-1', '알티 원'],
    ['GPU', '지피유'],
    ['CNN', '씨엔엔'],
    ['ACT', '에이씨티'],
    ['ViT', '비아이티'],
    ['BN', '비엔'],
    ['He', '허'],
    ['fc', '에프씨'],
    ['%p', '퍼센트 포인트'],
    ['γ', '감마'],
    ['β', '베타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'ResNet 은 층 두세 개마다 입력을 출력에 그대로 더해, 수십 층 CNN 도 학습할 수 있게 한 network 입니다.'],
        [4.2, 7.8, 'residual block, BatchNorm, ResNet-18 과 50 의 구조, backbone 과 로봇 policy 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'Microsoft Research 실험에서 34 층 CNN 은 18 층보다 처음 보는 사진도, 학습 사진도 더 많이 틀렸습니다.'],
        [4.4, 7.8, '층을 더 쌓았는데 왜 학습 사진조차 덜 맞히게 되고, 이 문제는 어떻게 풀 수 있을까요?'],
      ],
    },
    {
      id: 'degradation',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.3, 'top-1 error 는 plain 18 층이 27.94% 이고 34 층이 28.54% 라서, 깊은 쪽이 더 나빴습니다.'],
        [6.3, 12.3, '34 층은 training error 도 내내 높았고, CIFAR-10 에서도 56 층 plain 망이 20 층보다 높았습니다.'],
        [12.3, 18.3, 'overfitting 이면 training error 가 낮아야 하는데, degradation 은 그 값이 높아 덜 배운 것입니다.'],
        [18.3, 24.3, '20 층 망에 identity 층 36 개를 붙이면 같은 답을 내는데, gradient descent 는 그 상태도 못 찾았습니다.'],
        [24.3, 29.7, 'gradient 크기를 지키고 3 배 오래 학습해도 남아서, vanishing gradient 와는 다른 문제입니다.'],
      ],
    },
    {
      id: 'residual',
      seconds: 32,
      section: S1,
      cues: [
        [
          0.3,
          6.6,
          'residual block 은 y = F(x) + x 로 출력에 입력을 더해서, F(x) 가 0.3 이고 x 가 2 면 2.3 을 냅니다.',
          'residual block 은 와이 는 에프 엑스 더하기 엑스 로 출력에 입력을 더해서, 에프 엑스 가 0.3 이고 엑스 가 2 면 2.3 을 냅니다.',
        ],
        [6.6, 12.9, 'weight 가 0.05 에서 출발하면 identity 까지 plain 은 0.95 를 가야 하고, residual 은 0.05 입니다.'],
        [12.9, 19.2, 'weight 가 0.1 이면 gradient 비율은 plain 이 0.1 이고, residual 은 1 을 더한 1.1 입니다.'],
        [
          19.2,
          25.5,
          'block 20 개를 지나면 plain 은 거의 0 이 되지만, residual 은 1.1 의 20 제곱인 약 6.73 입니다.',
          'block 20 개를 지나면 plain 은 거의 0 이 되지만, residual 은 1.1 의 이십 제곱인 약 6.73 입니다.',
        ],
        [25.5, 31.7, '18 층에서 34 층으로 가자 plain 은 error 가 0.60%p 올랐고, ResNet 은 2.85%p 내려갔습니다.'],
      ],
    },
    {
      id: 'pause-paths',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. block 3 개의 weight 가 모두 0.5 면, plain 과 residual 의 비율은 각각 얼마일까요?'],
        [
          16.5,
          23.5,
          'plain 은 0.5 를 세 번 곱해 0.125 이고, residual 은 1 + 0.5 인 1.5 를 세 번 곱해 3.375 입니다.',
          'plain 은 0.5 를 세 번 곱해 0.125 이고, residual 은 1 더하기 0.5 인 1.5 를 세 번 곱해 3.375 입니다.',
        ],
      ],
    },
    {
      id: 'bn-calc',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, 'BatchNorm 은 batch 의 값에서 평균을 빼고 표준편차로 나눠서, channel 마다 평균 0, 분산 1 로 맞춥니다.'],
        [7, 14, '1, 2, 3, 6 과 10 배인 10, 20, 30, 60 은 정규화하면 둘 다 −1.069, −0.535, 0, 1.604 입니다.'],
        [14, 21, '그다음 γ 를 곱하고 β 를 더해 퍼진 정도와 위치를 다시 정하는데, 처음 값은 γ 가 1 이고 β 가 0 입니다.'],
        [
          21,
          27.7,
          'channel 하나의 평균은 batch 32 에 56×56 이면 32 × 56 × 56 = 100,352 개 값으로 구합니다.',
          'channel 하나의 평균은 batch 32 에 56×56 이면 32 × 56 × 56 인 100,352 개 값으로 구합니다.',
        ],
      ],
    },
    {
      id: 'bn-small',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          6.3,
          '평가 때는 학습 중 0.9 와 0.1 로 섞어 쌓아 둔 running mean 을 쓰는데, model.eval() 이 이를 켭니다.',
          '평가 때는 학습 중 0.9 와 0.1 로 섞어 쌓아 둔 running mean 을 쓰는데, 모델 점 이밸 이 이를 켭니다.',
        ],
        [6.3, 12.3, 'batch 가 2 장이면 1, 3 이든 100, 102 이든 정규화 결과가 −1 과 1 이라서, 크기 차이가 사라집니다.'],
        [12.3, 18.3, 'GroupNorm 논문에서 BatchNorm 의 error 는 batch 32 면 23.6% 이고 2 면 34.7% 였습니다.'],
        [18.3, 24.3, '사진 한 장 안의 channel 묶음으로 통계를 내는 GroupNorm 은 batch 32 에서도, 2 에서도 24.1% 였습니다.'],
        [24.3, 29.7, 'ACT 의 batch 는 8 이라서, 로봇 policy 는 FrozenBatchNorm 이나 GroupNorm 을 쓰기도 합니다.'],
      ],
    },
    {
      id: 'pause-running',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. running mean 이 2 이고 이번 batch 평균이 12 면 새 running mean 은 얼마일까요?'],
        [
          16.5,
          23.5,
          '0.9 × 2 + 0.1 × 12 는 1.8 + 1.2 라서, 새 running mean 은 3 입니다.',
          '0.9 × 2 더하기 0.1 × 12 는 1.8 더하기 1.2 라서, 새 running mean 은 3 입니다.',
        ],
      ],
    },
    {
      id: 'blocks',
      seconds: 28,
      section: S3,
      cues: [
        [
          0.3,
          7,
          'BasicBlock 은 3×3 conv 두 개와 BN, ReLU 로 F(x) 를 만들고, 입력을 더한 뒤 ReLU 를 거칩니다.',
          'BasicBlock 은 3×3 conv 두 개와 BN, ReLU 로 에프 엑스 를 만들고, 입력을 더한 뒤 ReLU 를 거칩니다.',
        ],
        [7, 14, 'stage 첫 block 은 64×56×56 을 128×28×28 로 바꿔서, shortcut 의 1×1 conv 로 모양을 맞춥니다.'],
        [
          14,
          21,
          'ResNet-50 의 bottleneck 은 1×1 conv 로 channel 을 1/4 로 줄였다가 3×3 conv 뒤에 되돌립니다.',
          'ResNet-50 의 bottleneck 은 1×1 conv 로 channel 을 사 분의 일로 줄였다가 3×3 conv 뒤에 되돌립니다.',
        ],
        [21, 27.7, '256 channel bottleneck 은 weight 69,632 개로, BasicBlock 의 73,728 개와 비슷합니다.'],
      ],
    },
    {
      id: 'resnet18',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.3, 'stem 의 7×7 conv 와 max pooling 이 3×224×224 사진을 64×56×56 으로 줄여 stage 에 넘깁니다.'],
        [
          6.3,
          12.3,
          'layer1 ~ layer4 를 지나며 크기가 56, 28, 14, 7 로 반씩 줄고, ResNet-18 은 512×7×7 을 냅니다.',
          'layer1 에서 layer4 까지 지나며 크기가 56, 28, 14, 7 로 반씩 줄고, ResNet-18 은 512×7×7 을 냅니다.',
        ],
        [12.3, 18.3, 'global average pooling 은 channel 마다 49 칸을 평균해 512 개를 내고, fc 가 점수 1000 개를 냅니다.'],
        [
          18.3,
          24.3,
          'weight 가 있는 층은 1 + 8 × 2 + 1 = 18 이고, ResNet-50 은 1 + 16 × 3 + 1 = 50 입니다.',
          'weight 가 있는 층은 1 더하기 8 × 2 더하기 1 로 18 이고, ResNet-50 은 1 더하기 16 × 3 더하기 1 로 50 입니다.',
        ],
        [24.3, 29.7, 'parameter 는 ResNet-18 이 11,689,512 개이고 ResNet-50 이 25,557,032 개입니다.'],
      ],
    },
    {
      id: 'pause-bottleneck',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. channel 2048 을 512 로 줄였다가 되돌리는 bottleneck 의 weight 는 몇 개일까요?'],
        [16.5, 23.5, '1×1 conv 둘이 1,048,576 개씩이고 3×3 conv 가 2,359,296 개라서, 모두 4,456,448 개입니다.'],
      ],
    },
    {
      id: 'transfer',
      seconds: 28,
      section: S4,
      cues: [
        [
          0.3,
          7,
          'fc 앞까지가 backbone 이라, ImageNet 의 512 → 1000 head 를 떼고 512 → 10 head 를 붙입니다.',
          'fc 앞까지가 backbone 이라, ImageNet 의 512 에서 1000 으로 가는 head 를 떼고 512 에서 10 으로 가는 head 를 붙입니다.',
        ],
        [7, 14, 'freeze 는 head 의 5,130 개만 학습하고, fine-tuning 은 11,181,642 개를 모두 고칩니다.'],
        [14, 21, 'Square 과제 성공률은 처음부터 학습하면 0.94, freeze 하면 0.58, fine-tuning 하면 0.92 였습니다.'],
        [21, 27.7, 'pretrained weight 는 ImageNet 평균과 표준편차로 정규화한 사진으로 학습해서, LeRobot 도 입력을 그렇게 정규화합니다.'],
      ],
    },
    {
      id: 'robot-encoder',
      seconds: 30,
      section: S4,
      cues: [
        [
          0.3,
          6.3,
          'ACT 는 480 × 640 사진을 512 × 15 × 20 으로 줄여서, 그 300 칸을 token 300 개로 씁니다.',
        ],
        [6.3, 12.3, 'global average pooling 을 하지 않아서, 컵이 사진의 어느 구역에 있는지가 token 에 남습니다.'],
        [
          12.3,
          18.3,
          'FrozenBatchNorm 은 평균 2, 분산 4, γ 3, β 1 을 고정해서, 입력 6 은 언제나 7 이 됩니다.',
        ],
        [18.3, 24.3, 'Diffusion Policy 논문은 GroupNorm 을 쓰고, pooling 자리에 spatial softmax 를 둡니다.'],
        [24.3, 29.7, 'PushT 의 96×96 사진은 512×3×3 이 되고, keypoint 32 개를 뽑아 숫자 64 개가 됩니다.'],
      ],
    },
    {
      id: 'pause-head',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 관절 각도 7 개를 내는 head 를 붙여 freeze 하면, 학습하는 parameter 는 몇 개일까요?'],
        [
          16.5,
          23.5,
          '512 × 7 = 3,584 개에 bias 7 개를 더해 3,591 개이고, backbone 은 고정이라 이것만 학습합니다.',
          '512 × 7 은 3,584 개이고 bias 7 개를 더해 3,591 개이고, backbone 은 고정이라 이것만 학습합니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 깊은 plain 망은 덜 배우는 degradation 을 보였고, residual 은 weight 없는 길을 남깁니다.'],
        [4.2, 8.2, 'BatchNorm 은 평균 0, 분산 1 로 맞추고, 작은 batch 에는 FrozenBatchNorm 이나 GroupNorm 을 씁니다.'],
        [8.2, 12.2, 'ResNet-18 은 BasicBlock 8 개로 512 개를 내고, ResNet-50 은 bottleneck 16 개로 2048 개를 냅니다.'],
        [12.2, 15.7, 'backbone 에 새 head 를 붙여 freeze 나 fine-tuning 을 하고, ACT 는 300 칸을 token 으로 씁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, 'patch 끼리 참고하는 ViT, feature map 을 token 으로 쓰는 ACT, 문장을 섞는 RT-1 이 다음 강의입니다.']],
    },
  ],
}
