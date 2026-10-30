import type { VideoScript } from '../script.ts'

// Numbers follow lessons/diffusion-policy/README.md: the box scene (10 demos, 5 at −20° and 5 at +20°, −10° ~ +10° hits the
// box; MSE head 0°, RT-1 head 256 bins, 0.5 each, −19.5° / +20.5°; diffusion head K network calls, −20° / +20° 근처);
// check question 7 / 3 demos → (7 × (−20) + 3 × 20) ÷ 10 = −80 ÷ 10 = −8°, bins 108 / 148 get 0.7 / 0.3; min-max
// normalization −20° → −1, +20° → +1; conditioned network ε(O, Aᵏ, k), the 5-step training recipe; the K = 5 schedule
// (k = 5: 0.54, 1.41, 0.71) with A⁵ = 0.60 → network 0.54 in the box scene and 0.65 on the straight road, 0.60 − 0.54 ×
// 0.54 = 0.31, 1.41 × 0.31 = 0.44, 0.71 × 0.3 = 0.21, A⁴ = 0.65; paths 0.60 0.65 0.41 0.58 0.92 1.00 (+20°), −0.40 −0.58
// −0.30 −0.24 −0.54 −1.00 (−20°), straight 0.60 0.56 0.18 0.19 0.15 0.00 (0°); per-step sampling 2 × 0.5⁸ = 2 ÷ 256 ≈
// 0.008; chunk T_p = 16, PushT action (x, y) → 16 × 2 = 32 numbers, T_o = 2; receding horizon T_a = 8, 10 Hz, 0.1 s a
// step, 0.8 s between inferences, step 0 makes 0 ~ 15 and step 8 makes 8 ~ 23; T_a = 1 switches modes, T_a = 16 reacts
// to step 2 after 1.4 s vs 0.6 s for T_a = 8; real PushT T_p 16, T_a 6; ACT temporal ensembling +20°, −20°, +20° with
// weights 1, 0.990, 0.980 → 19.8 ÷ 2.970 ≈ 6.67°; check question T_a = 4 → 4 × 0.1 = 0.4 s, 16 − 4 = 12 dropped, step 3
// change after 0.1 s; encoder ResNet-18 from scratch, GroupNorm; spatial softmax 3×3 with one cell 2: e² ≈ 7.389,
// 7.389 + 8 = 15.389, 0.480 / 0.065, 0.610 / 0.195, (0.415, −0.415); LeRobot 32 keypoints → 32 × 2 = 64; Square table
// ResNet-18 0.94 / 0.58 / 0.92, ResNet-34 0.92 / 0.40 / 0.94, ViT-B/16 0.22 / 0.70 / 0.98; check question centre cell →
// (0, 0); 1D conv kernel 0.25 0.5 0.25 on 0 0 4 0 0 0 → 0 1 2 1 0 0; U-Net 16 → 8 → 4; condition 132 + 128 = 260, Aᵏ
// (16, 2); transformer 16 action tokens; DDIM: K = 100 cosine, example 0.01 s × 100 = 1 s vs 0.8 s, 10 steps on RTX 3080
// 0.1 s, real tasks 16 steps; 5 → 3 → 1 → 0 (0.60 0.56 0.67 1.00, 3 calls, +20°) vs 5 → 2 → 0 (0.60 0.51 0.91, 2 calls,
// 1.91 ÷ 2 × 40 − 20 = 18.2°); check question 0.02 s: 100 × 0.02 = 2 s, 10 × 0.02 = 0.2 s; PushT 96×96, 200 demos,
// lerobot/pusht 206 episodes, T_o T_p T_a = 2 16 8; sim coverage best / last-10 LSTM-GMM 0.69 / 0.54, IBC 0.75 / 0.64,
// DP CNN 0.91 / 0.84, DP transformer 0.78 / 0.66; real UR5, 136 demos, 20 start states, 19 of 20 = 95%; success rates
// human 100%, CNN 95%, R3M 80%, transformer 65%, ImageNet 15%, LSTM-GMM 20% / 10%, IBC 0% / 0%; LeRobot checkpoint 500
// episodes, max overlap 0.955, success 65.4%, threshold 0.95; LeRobot 2026 년 5 월 default ImageNet ResNet-18 + BatchNorm.

const S1 = '관측 조건 denoising'
const S2 = 'chunk 와 horizon'
const S3 = 'encoder 와 denoiser'
const S4 = 'DDIM 과 PushT'

export const script: VideoScript = {
  id: 'diffusion-policy',
  title: 'Diffusion Policy',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/diffusion-policy',
  sections: [S1, S2, S3, S4],
  terms: [
    ['global average pooling', '글로벌 애버리지 풀링'],
    ['temporal ensembling', '템포럴 앙상블링'],
    ['prediction horizon', '프리딕션 호라이즌'],
    ['causal attention', '코절 어텐션'],
    ['cross-attention', '크로스 어텐션'],
    ['skip connection', '스킵 커넥션'],
    ['spatial softmax', '스페이셜 소프트맥스'],
    ['image encoder', '이미지 인코더'],
    ['1D convolution', '원디 컨볼루션'],
    ['Flow Matching', '플로 매칭'],
    ['action chunk', '액션 청크'],
    ['feature map', '피처 맵'],
    ['fine-tuning', '파인튜닝'],
    ['transformer', '트랜스포머'],
    ['simulation', '시뮬레이션'],
    ['checkpoint', '체크포인트'],
    ['pretrained', '프리트레인드'],
    ['Real Robot', '리얼 로봇'],
    ['ResNet-18', '레즈넷 십팔'],
    ['denoising', '디노이징'],
    ['diffusion', '디퓨전'],
    ['embedding', '임베딩'],
    ['denoiser', '디노이저'],
    ['receding', '리시딩'],
    ['LSTM-GMM', '엘에스티엠 지엠엠'],
    ['RTX 3080', '알티엑스 삼공팔공'],
    ['coverage', '커버리지'],
    ['sampling', '샘플링'],
    ['schedule', '스케줄'],
    ['horizon', '호라이즌'],
    ['network', '네트워크'],
    ['encoder', '인코더'],
    ['LeRobot', '르로봇'],
    ['weight', '웨이트'],
    ['kernel', '커널'],
    ['Square', '스퀘어'],
    ['cosine', '코사인'],
    ['token', '토큰'],
    ['noise', '노이즈'],
    ['U-Net', '유넷'],
    ['chunk', '청크'],
    ['block', '블록'],
    ['PushT', '푸시 티'],
    ['DDIM', '디디아이엠'],
    ['DDPM', '디디피엠'],
    ['FiLM', '필름'],
    ['head', '헤드'],
    ['IoU', '아이오유'],
    ['IBC', '아이비씨'],
    ['UR5', '유알 파이브'],
    ['3×3', '삼 바이 삼'],
    ['map', '맵'],
    ['π0', '파이 제로'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Diffusion Policy 는 관측을 조건으로 noise 를 걷어 내서, 앞으로 몇 step 의 action 을 한 덩어리로 만듭니다.'],
        [4.2, 7.8, '관측 조건 denoising, chunk 와 horizon, encoder 와 denoiser, DDIM 과 PushT 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'PushT 시연은 블록 왼쪽으로도 오른쪽으로도 돌아가는데, MSE 로 배운 policy 는 두 길의 평균인 한가운데로 밉니다.'],
        [4.4, 7.8, '시연에 있던 길 하나를 골라 끝까지 따라가게 하려면, policy 는 무엇을 내야 할까요?'],
      ],
    },
    {
      id: 'heads',
      seconds: 28,
      section: S1,
      cues: [
        [
          0.3,
          6.5,
          '상자 앞 시연 10 번 가운데 5 번은 −20° 로 피했고 5 번은 +20° 로 피했는데, −10° ~ +10° 로 꺾으면 부딪힙니다.',
          '상자 앞 시연 10 번 가운데 5 번은 −20° 로 피했고 5 번은 +20° 로 피했는데, 마이너스 10 도에서 플러스 10 도 사이로 꺾으면 부딪힙니다.',
        ],
        [6.5, 13, 'MSE head 는 오차 제곱의 평균을 줄이려고 두 정답의 평균인 0° 를 내서, 상자에 그대로 부딪힙니다.'],
        [13, 20, 'RT-1 head 는 256 칸 가운데 시연이 떨어진 두 칸에 0.5 씩 확률을 주고, −19.5° 나 +20.5° 를 고릅니다.'],
        [20, 27.5, 'diffusion head 는 noise 에서 출발해 network 를 K 번 써서 걷어 내므로, −20° 나 +20° 근처에서 끝납니다.'],
      ],
    },
    {
      id: 'denoise',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'network 는 noise 섞인 action 과 단계 번호에 관측 O 까지 받아서, 섞인 noise 를 맞힙니다.'],
        [6, 12, '학습은 DDPM 과 같습니다. action 에 noise 를 섞고, 맞힌 값과 정답 noise 의 차이를 제곱해 loss 로 씁니다.'],
        [12, 18, '같은 값 0.60 을 받아도 network 의 답은 상자 장면에서 0.54 이고, 곧은 길 장면에서 0.65 입니다.'],
        [18, 24, '각도는 −20° 를 −1 로, +20° 를 +1 로 옮기는데, 상자 장면의 0.60 은 다섯 단계 뒤 1.00 이 되어 +20° 입니다.'],
        [24, 29.7, '같은 장면에서 −0.40 에서 출발하면 −20° 에 닿고, 곧은 길 장면은 0.60 에서 출발해도 0° 에 닿습니다.'],
      ],
    },
    {
      id: 'pause-mse',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 시연이 −20° 7 개, +20° 3 개면 MSE head 와 RT-1 head 는 각각 무엇을 낼까요?'],
        [16.5, 23.5, 'MSE head 는 평균 −8° 를 내서 부딪히고, RT-1 head 는 −20° 칸에 0.7 을 주고 +20° 칸에 0.3 을 줍니다.'],
      ],
    },
    {
      id: 'chunk',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'step 마다 따로 sampling 하면 앞에서 고른 쪽이 다음 sampling 에 들어가지 않아서, 왼쪽과 오른쪽이 반반으로 섞입니다.'],
        [6.5, 13, '그렇게 뽑을 때 8 step 이 모두 같은 쪽으로 나올 확률은 2 ÷ 256 으로 약 0.008 뿐입니다.'],
        [13, 20, '앞으로 16 step 의 action 을 chunk 하나로 만들고, 그 개수 16 을 prediction horizon 이라 합니다.'],
        [20, 27.5, 'PushT 의 action 은 손끝 위치 x, y 라서 chunk 는 숫자 32 개이고, network 는 이를 함께 봅니다.'],
      ],
    },
    {
      id: 'receding',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'chunk 16 개를 다 실행하고서야 새 관측을 보면 늦으므로, 앞 8 개만 실행하고 새 관측으로 chunk 를 다시 만듭니다.'],
        [6, 12, '이 8 을 action horizon 이라 하고, 내다보는 구간을 밀며 다시 계획하는 방식을 receding horizon 이라 합니다.'],
        [12, 18, 'PushT 시연은 10 Hz 라서 step 하나가 0.1 초이고, action horizon 이 8 이면 0.8 초마다 추론합니다.'],
        [18, 24, 'action horizon 이 1 이면 봉우리 사이를 오가고, 16 이면 step 2 의 변화를 1.4 초 뒤에야 반영합니다.'],
        [24, 29.7, 'ACT 식 temporal ensembling 은 +20°, −20°, +20° 를 6.67° 로 섞으므로, chunk 는 하나씩 실행합니다.'],
      ],
    },
    {
      id: 'pause-horizon',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 10 Hz 로봇이 16 개짜리 chunk 의 앞 4 개만 실행하면, 추론 간격과 버리는 action 수는?'],
        [
          16.5,
          23.5,
          '4 step 마다 추론하니 4 × 0.1 로 0.4 초 간격이고, chunk 하나에서 16 − 4 로 12 개를 버립니다.',
          '4 step 마다 추론하니 4 × 0.1 로 0.4 초 간격이고, chunk 하나에서 16 빼기 4 로 12 개를 버립니다.',
        ],
      ],
    },
    {
      id: 'encoder',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, 'ResNet-18 encoder 는 pretrained weight 없이 diffusion head 의 loss 로 처음부터 학습합니다.'],
        [6.5, 13, 'global average pooling 은 평균만 남겨 위치가 사라지므로, 그 층을 spatial softmax 로 바꿉니다.'],
        [13, 20, '3×3 feature map 의 오른쪽 위 칸만 2 면 그 칸의 확률이 0.480 이고, 좌표의 기댓값은 0.415, −0.415 입니다.'],
        [20, 27.5, 'Square 과제에서 pretrained ResNet-18 을 고정하면 0.58 이었지만, fine-tuning 하면 0.92 였습니다.'],
      ],
    },
    {
      id: 'denoiser',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, '기본 denoiser 는 1D convolution U-Net 으로, kernel 을 시간축으로만 밀며 이웃 시각의 값을 곱해 더합니다.'],
        [6, 12, 'kernel 0.25, 0.5, 0.25 를 밀면 0, 0, 4, 0, 0, 0 이 0, 1, 2, 1, 0, 0 으로 이웃에 퍼집니다.'],
        [12, 18, 'U-Net 은 시간축 길이를 16, 8, 4 로 줄였다 키우고, skip connection 으로 세밀한 값을 되살립니다.'],
        [18, 24, '관측 조건 132 개와 단계 번호 embedding 128 개를 이은 260 개는 FiLM 으로 모든 block 에 들어갑니다.'],
        [24, 29.7, 'transformer denoiser 는 action 16 개를 token 으로 받고, 관측은 cross-attention 으로 받습니다.'],
      ],
    },
    {
      id: 'pause-spatial',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 3×3 feature map 의 가운데 칸만 2 이고 나머지가 0 이면, spatial softmax 의 결과는?'],
        [16.5, 23.5, '가운데 칸이 0.480 이고 나머지가 0.065 씩인데, 좌우와 위아래가 서로 지워져서 가운데 좌표인 0, 0 이 나옵니다.'],
      ],
    },
    {
      id: 'ddim',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, '학습은 cosine schedule 100 단계로 하는데, 예를 들어 network 한 번에 0.01 초면 chunk 에 1 초가 듭니다.'],
        [6.5, 13, 'DDIM 은 같은 network 로 단계를 건너뛰는데, 저자들은 10 단계만 밟아 RTX 3080 에서 0.1 초가 걸렸습니다.'],
        [13, 20, 'DDIM 은 원래 값을 추정한 뒤 목표 단계의 비율로 다시 섞고, 새 noise 를 더하지 않아 같은 출발점이면 결과가 같습니다.'],
        [20, 27.5, '상자 장면의 0.60 은 5, 3, 1, 0 으로 세 번 건너면 +20° 에 닿지만, 5, 2, 0 으로 두 번이면 18.2° 에 그칩니다.'],
      ],
    },
    {
      id: 'pusht',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'PushT 는 둥근 손끝으로 T 자 블록을 밀어 목표 자리에 겹치는 과제라서, 미는 자리를 계속 바꿔야 합니다.'],
        [6, 12, 'simulation 의 coverage 는 Diffusion Policy 가 0.91 로 가장 높았고, IBC 는 0.75 였습니다.'],
        [12, 18, '실물 실험은 UR5 로봇 팔과 시연 136 개로 했고, 같은 시작 상태 20 개에서 마지막 순간의 IoU 로 성공을 쟀습니다.'],
        [18, 24, 'Diffusion Policy 는 20 번 중 19 번, 95% 를 성공했고, LSTM-GMM 은 20% 였고 IBC 는 0% 였습니다.'],
        [24, 29.7, 'LeRobot checkpoint 는 최대 겹침 평균이 0.955 인데도, 기준 0.95 를 넘긴 episode 는 65.4% 였습니다.'],
      ],
    },
    {
      id: 'pause-ddim',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. network 한 번에 0.02 초면 100 단계와 10 단계는 각각 몇 초이고, 0.8 초 안에 끝나는 쪽은?'],
        [16.5, 23.5, '100 × 0.02 로 2 초가 걸리고 10 × 0.02 로 0.2 초가 걸려서, 0.8 초 안에 끝나는 것은 10 단계뿐입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. diffusion head 는 관측을 조건으로 noise 를 걷어 내서, 0° 대신 −20° 나 +20° 근처를 냅니다.'],
        [4.2, 8.2, 'action 16 개를 chunk 하나로 만들어 한 길을 지키고, 앞 8 개만 실행한 뒤 새 관측으로 chunk 를 다시 만듭니다.'],
        [8.2, 12.2, 'spatial softmax 가 위치를 남기고, FiLM 으로 조건을 넣은 1D convolution U-Net 이 noise 를 맞힙니다.'],
        [12.2, 15.7, 'DDIM 으로 100 단계를 10 단계로 줄였고, 실물 PushT 에서 95% 를 성공해 LSTM-GMM 의 20% 를 크게 넘었습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, 'noise 에서 action 까지의 길을 거의 직선으로 만들어 적은 단계로 가는 방법은 Flow Matching 에서 다룹니다.'],
        [3.6, 6.6, '그 head 를 큰 모델에 붙인 policy 는 π0 에서, 실물 팔에서 실행하는 과정은 Real Robot 에서 다룹니다.'],
      ],
    },
  ],
}
