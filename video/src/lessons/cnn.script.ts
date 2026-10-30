import type { VideoScript } from '../script.ts'

// Numbers follow lessons/cnn/README.md: ALOHA 1초에 50 번, 3 × 480 × 640 = 921,600; the 5×5 "1" picture and the vertical
// filter (rows −1 2 −1; first window −1, first row −1 5 −3, middle column 5 5 4, output 3×3, 2 + 2 + 2 = 6); filter learning
// (label 7, 10 scores, p = 1 ÷ 10 = 0.1 → loss 2.303; mini-batch −0.6 / +0.3 / −0.9 → −0.4, w 0.5, learning rate 0.1 → 0.54,
// +0.04); check 3×4 → 1×2, [−3, 6]; MLP first layer 1,000 × (921,600 + 1) = 921,601,000 (150,528 → 150,529,000); 9 × (25 + 1)
// = 234 vs 9 + 1 = 10; LeRobot ACT 224×224 ResNet-18 weights on 480×640; the shift (MLP 8 → 3, z 2 → −3, bias −6; 5 5 4 moves
// one column); 2×2 max pooling (4×4 map, 5 at (0, 1) → [[5, 0], [0, 0]], at (0, 2) → [[0, 5], [0, 0]]); output length
// ⌊(H + 2p − k) ÷ s⌋ + 1 with 5/3/0/1 → 3, 5/3/0/2 → 2, 5/3/1/1 → 5, 224/7/3/2 → 112; colour 3×3 filter 3 × 9 = 27; params
// C_out × (C_in × k × k + 1): 64 × 28 = 1,792, ResNet-18 first layer 64 × 3 × 49 = 9,408, LeNet C3 2,416; LeNet 28 → 14 →
// 10 → 5, channels 1 → 6 → 16, 16 × 5 × 5 = 400, 61,706 vs MNIST MLP 203,530; receptive field 3, 5, 7, LeNet S4 16×16,
// ResNet-18 435×435; check 16 × 3 × 3 = 144 + 1 = 145, 32 × 145 = 4,640; ACT encoder (stride 2 five times, 2⁵ = 32,
// 480 ÷ 32 = 15, 640 ÷ 32 = 20, 15 × 20 × 512 = 153,600, 300 places, 4 cameras 1,200 places, 14 joint angles, ImageNet
// ResNet-18 7×7×512 → 512); spatial softmax (3×3 map with one 6: 6 ÷ 9 = 0.67 both ways, x = 1.98 vs 0.02, y = 1.00;
// Levine 32 channels of 109×109 = 380,192 → 64); GQ-CNN 32×32 depth crop; PointPillars 0.16 m cells, 64 channels; check
// 384 ÷ 32 = 12, 512 ÷ 32 = 16, 12 × 16 = 192, 192 × 512 = 98,304.

const S1 = 'convolution 계산'
const S2 = 'weight sharing'
const S3 = '크기와 parameter'
const S4 = '위치를 남기는 encoder'

export const script: VideoScript = {
  id: 'cnn',
  title: 'CNN',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/cnn',
  sections: [S1, S2, S3, S4],
  terms: [
    ['translation equivariance', '트랜슬레이션 이퀴베리언스'],
    ['global average pooling', '글로벌 애버리지 풀링'],
    ['cross-entropy loss', '크로스 엔트로피 로스'],
    ['LiDAR Perception', '라이다 퍼셉션'],
    ['backpropagation', '백프로퍼게이션'],
    ['spatial softmax', '스페이셜 소프트맥스'],
    ['weight sharing', '웨이트 셰어링'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['image encoder', '이미지 인코더'],
    ['receptive field', '리셉티브 필드'],
    ['learning rate', '러닝 레이트'],
    ['pseudo-image', '수도 이미지'],
    ['PointPillars', '포인트필러스'],
    ['depth image', '뎁스 이미지'],
    ['feature map', '피처 맵'],
    ['max pooling', '맥스 풀링'],
    ['convolution', '컨볼루션'],
    ['transformer', '트랜스포머'],
    ['invariance', '인베리언스'],
    ['ResNet-18', '레즈넷 십팔'],
    ['parameter', '파라미터'],
    ['gradient', '그래디언트'],
    ['ImageNet', '이미지넷'],
    ['softmax', '소프트맥스'],
    ['network', '네트워크'],
    ['encoder', '인코더'],
    ['feature', '피처'],
    ['channel', '채널'],
    ['padding', '패딩'],
    ['pooling', '풀링'],
    ['gripper', '그리퍼'],
    ['GQ-CNN', '지큐 씨엔엔'],
    ['LeRobot', '르로봇'],
    ['stride', '스트라이드'],
    ['window', '윈도'],
    ['filter', '필터'],
    ['neuron', '뉴런'],
    ['Levine', '레빈'],
    ['ResNet', '레즈넷'],
    ['Linear', '리니어'],
    ['weight', '웨이트'],
    ['layer', '레이어'],
    ['label', '레이블'],
    ['pixel', '픽셀'],
    ['LeNet', '르넷'],
    ['ALOHA', '알로하'],
    ['MNIST', '엠니스트'],
    ['grasp', '그래스프'],
    ['noise', '노이즈'],
    ['conv', '컨브'],
    ['bias', '바이어스'],
    ['DDPM', '디디피엠'],
    ['CNN', '씨엔엔'],
    ['MLP', '엠엘피'],
    ['SGD', '에스지디'],
    ['map', '맵'],
    ['2D', '투디'],
    ['3D', '쓰리디'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'CNN 은 작은 filter 를 사진 위에서 옮겨 가며 곱해 더하는 convolution 층을 쌓은 network 입니다.'],
        [4.2, 7.8, 'convolution 계산, weight sharing, 크기와 parameter, 위치를 남기는 image encoder 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'ALOHA 는 시연을 1초에 50 번 기록하고, 카메라 한 대의 480×640 컬러 사진 한 장은 숫자 921,600 개입니다.'],
        [4.2, 7.8, '컵을 조금만 옮겨도 pixel 값이 모두 바뀌는데, policy 는 어떻게 같은 컵을 알아보고 그쪽으로 손을 뻗을까요?'],
      ],
    },
    {
      id: 'conv',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'convolution 은 3×3 같은 작은 숫자 판 하나를 사진 위에서 한 칸씩 옮기며 같은 계산을 되풀이합니다.'],
        [6, 12, '이 숫자 판을 filter 라고 합니다. filter 밑에 깔린 window 와 같은 자리끼리 곱한 9 개를 더하면 출력 한 칸입니다.'],
        [12, 18, '줄마다 가운데가 2, 양옆이 −1 인 세로선 filter 를 5×5 "1" 사진의 왼쪽 위에 대면 −1 이 나옵니다.'],
        [18, 24, '한 칸씩 옮기면 첫 줄은 −1, 5, −3 이고, 가운데 세로 줄에는 세로획을 따라 5, 5, 4 가 모여 출력은 3×3 입니다.'],
        [24, 29.8, 'filter 하나로 사진 전체를 훑은 판이 feature map 이고, 자리마다 filter 를 닮은 정도를 적습니다.'],
      ],
    },
    {
      id: 'learn',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'filter 의 숫자는 사람이 고르지 않고 학습합니다. 정답은 사진마다 붙은 "이 사진은 7" 같은 label 하나뿐입니다.'],
        [6.5, 13, 'softmax 가 점수 10 개를 확률로 바꾸고, 7 자리 확률이 0.1 이면 cross-entropy loss 는 2.303 입니다.'],
        [13, 19.5, 'backpropagation 이 loss 를 거꾸로 전해 filter 의 숫자 9 개와 bias 마다 gradient 를 줍니다.'],
        [19.5, 25.8, 'gradient −0.6, +0.3, −0.9 의 평균은 −0.4 이고, SGD 로 고치면 w 는 0.5 에서 0.54 가 됩니다.'],
      ],
    },
    {
      id: 'pause-conv',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 세로선 filter 를 세 줄 모두 [0, 0, 1, 0] 인 3×4 사진에 대면 출력은 몇 칸이고 값은?', '멈추고 적어 보기. 세로선 필터를 세 줄 모두 영, 영, 일, 영 인 3×4 사진에 대면 출력은 몇 칸이고 값은?'],
        [16.5, 23.5, '출력은 1×2 이고 값은 −3 과 6 입니다. 흰 세로선이 window 한가운데에 오는 자리에서 가장 큰 값이 나옵니다.'],
      ],
    },
    {
      id: 'sharing',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'MLP 에 사진을 펴서 넣으면 neuron 1,000 개짜리 첫 layer 에만 parameter 가 921,601,000 개입니다.', 'MLP 에 사진을 펴서 넣으면 neuron 1,000 개짜리 첫 layer 에만 parameter 가 구억 이천백육십만 천 개입니다.'],
        [6.5, 13, '출력 9 개짜리 MLP layer 는 9 × (25 + 1) = 234 개이고, 3×3 convolution 은 9 + 1 = 10 개입니다.', '출력 9 개짜리 MLP layer 는 9 곱하기 26, 234 개이고, 3×3 convolution 은 9 더하기 1, 10 개입니다.'],
        [13, 19.5, 'weight 한 벌을 모든 자리에 돌려 쓰는 weight sharing 덕분에, 사진이 커져도 parameter 가 늘지 않습니다.'],
        [19.5, 25.8, 'LeRobot 의 ACT 는 224×224 ImageNet 으로 미리 학습한 ResNet-18 weight 를 480×640 사진에 씁니다.'],
      ],
    },
    {
      id: 'shift',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, '"1" 을 판정하는 MLP neuron 은 곱해 더한 값이 8 이었지만, 사진을 오른쪽으로 한 칸 옮기자 3 으로 떨어졌습니다.'],
        [6.5, 13, '세로선 filter 의 출력에서는 5, 5, 4 가 가운데 세로 줄에서 오른쪽 세로 줄로 옮겨 갈 뿐 값은 그대로입니다.'],
        [13, 19.5, '입력을 옮기면 출력도 같은 만큼 옮겨 가는 이 성질을 translation equivariance 라고 합니다.'],
        [19.5, 25.8, '2×2 max pooling 은 묶음마다 가장 큰 값만 남겨, 묶음 안에서 옮겨 가도 결과가 같은 invariance 를 줍니다.'],
      ],
    },
    {
      id: 'pause-pool',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 4×4 feature map 의 5 가 (0, 1) 에서 (0, 2) 로 옮겨 가면 2×2 max pooling 결과는?', '멈추고 적어 보기. 4×4 feature map 의 5 가 영 일 칸에서 영 이 칸으로 옮겨 가면 2×2 max pooling 결과는?'],
        [16.5, 23.5, '왼쪽 위만 5 이던 결과가 오른쪽 위만 5 로 바뀝니다. 묶음 경계를 넘으면 CNN 도 위치에 무관하지 않습니다.'],
      ],
    },
    {
      id: 'size',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'stride 는 filter 를 한 번에 옮기는 칸 수이고, padding 은 테두리에 0 을 덧대 출력이 줄어들지 않게 합니다.'],
        [6.5, 13, '출력 길이는 (H + 2p − k) ÷ s 를 내림하고 1 을 더합니다. p 는 padding, k 는 filter 크기입니다.', '출력 길이는 H 더하기 2 p 빼기 k 를 s 로 나눠 내림하고 1 을 더합니다. p 는 padding, k 는 filter 크기입니다.'],
        [13, 19.5, 'ResNet 첫 층은 7×7 filter, padding 3, stride 2 로 224×224 사진을 112×112 로 줄입니다.'],
        [19.5, 25.8, '컬러 사진의 3×3 filter 는 channel 마다 한 장씩 3 × 9 = 27 개이고, 출력 channel 수는 filter 수입니다.', '컬러 사진의 3×3 filter 는 channel 마다 한 장씩 3 곱하기 9, 27 개이고, 출력 channel 수는 filter 수입니다.'],
      ],
    },
    {
      id: 'lenet',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '컬러 사진용 3×3 filter 64 개의 parameter 는 64 × (3 × 9 + 1) = 1,792 개입니다.', '컬러 사진용 3×3 filter 64 개의 parameter 는 64 곱하기 28, 1,792 개입니다.'],
        [6, 12, 'LeNet 은 28×28 사진을 conv 와 pooling 두 번으로 숫자 400 개로 줄인 뒤 Linear 세 층에 넣습니다.'],
        [12, 18, 'channel 은 1 → 6 → 16 으로 늘고 가로세로는 28 → 14 → 10 → 5 로 줄어 feature 의 종류가 늘어납니다.'],
        [18, 24, 'LeNet 의 parameter 는 61,706 개로, MNIST MLP 의 203,530 개의 3 분의 1 이 안 됩니다.'],
        [24, 29.8, '3×3 conv 를 쌓으면 receptive field 가 3, 5, 7 로 넓어지고, ResNet-18 의 끝은 435×435 를 봅니다.'],
      ],
    },
    {
      id: 'pause-params',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 입력 channel 16 장에 3×3 filter 32 개를 쓰는 층의 parameter 는 몇 개일까요?'],
        [16.5, 23.5, 'filter 하나는 16 × 3 × 3 + 1 = 145 개이고, 32 개면 32 × 145 = 4,640 개입니다.', 'filter 하나는 16 곱하기 3 곱하기 3 더하기 1, 145 개이고, 32 개면 32 곱하기 145, 4,640 개입니다.'],
      ],
    },
    {
      id: 'act',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, '사진은 image encoder 인 CNN 으로 줄인 뒤 policy 에 넣고, ACT 는 ResNet-18 을 씁니다.'],
        [6.5, 13, 'ResNet-18 은 stride 2 인 층 다섯 개로 가로세로를 32 분의 1 로 줄여 480×640 을 15×20 으로 만듭니다.'],
        [13, 19.5, '자리 300 곳마다 숫자 512 개이고, 카메라 네 대를 이은 1,200 곳을 관절 각도 14 개와 transformer 에 넣습니다.'],
        [19.5, 25.8, 'ImageNet 분류는 global average pooling 으로 자리를 평균 내지만, ACT 는 15×20 자리를 남깁니다.'],
      ],
    },
    {
      id: 'spatial',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, '로봇은 컵이 어디 있는지에 따라 손을 뻗을 곳이 정해져서, Levine 등은 위치 정보를 지키려고 pooling 을 쓰지 않았습니다.'],
        [6, 12, '6 이 3×3 map 의 오른쪽 열에 있든 왼쪽 열에 있든 global average pooling 은 6 ÷ 9 = 0.67 입니다.', '6 이 3×3 map 의 오른쪽 열에 있든 왼쪽 열에 있든 global average pooling 은 6 나누기 9, 0.67 입니다.'],
        [12, 18, 'spatial softmax 는 자리마다 확률을 만들어 좌표 평균을 내고, 두 경우를 x 1.98 과 0.02 로 가릅니다.'],
        [18, 24, 'GQ-CNN 은 depth image 를 grasp 중심과 gripper 축에 맞춰 돌려 32×32 로 자르고 grasp 성공 확률을 냅니다.'],
        [24, 29.8, 'PointPillars 는 점 구름을 0.16 m 칸마다 숫자 64 개로 요약한 pseudo-image 를 2D CNN 에 넣습니다.'],
      ],
    },
    {
      id: 'pause-act',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 384×512 사진을 전체 stride 32 인 ResNet-18 에 넣으면 자리와 숫자는 몇 개일까요?'],
        [16.5, 23.5, '384 ÷ 32 = 12, 512 ÷ 32 = 16 이라 12 × 16 = 192 곳이고, 192 × 512 = 98,304 개입니다.', '384 나누기 32 는 12, 512 나누기 32 는 16 이라 12 곱하기 16, 192 곳이고, 숫자는 192 곱하기 512, 98,304 개입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. convolution 은 filter 를 옮기며 곱해 더하고, filter 숫자는 loss 의 gradient 로 배웁니다.'],
        [4.2, 8.2, 'weight sharing 으로 3×3 filter 하나의 parameter 는 10 개이고, 입력이 옮겨 가면 출력도 함께 옮겨 갑니다.'],
        [8.2, 12.2, '출력 길이는 (H + 2p − k) ÷ s 내림 + 1 이고, 층이 깊어질수록 receptive field 가 435×435 까지 넓어집니다.', '출력 길이는 H 더하기 2 p 빼기 k 를 s 로 나눠 내림하고 1 을 더한 값이고, 층이 깊어질수록 receptive field 가 435×435 까지 넓어집니다.'],
        [12.2, 15.7, '로봇 encoder 는 pooling 대신 ACT 처럼 feature map 을 쓰거나 spatial softmax 로 좌표를 뽑습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '층을 수십 개 쌓기만 하면 gradient 가 앞쪽 층까지 잘 전해지지 않는데, 다음 강의 ResNet 이 이 문제를 풉니다.'],
        [3.6, 6.6, 'DDPM 의 noise 제거, Grasp Planning, LiDAR Perception 에서도 CNN 을 다시 만납니다.'],
      ],
    },
  ],
}
