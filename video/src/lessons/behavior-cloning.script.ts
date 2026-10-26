import type { VideoScript } from '../script.ts'

// Numbers follow lessons/behavior-cloning/README.md: the 0.1 m drift rule and its table, the 1000-step histogram
// (30, 150, 320, 330, 140, 30), T = 100 and ε = 0.01, the ±20° demos with MSE 800, 500, 400, 500, 800.

const S1 = 'compounding error'
const S2 = 'distribution shift'
const S3 = 'multimodal 시연과 평균'

export const script: VideoScript = {
  id: 'behavior-cloning',
  title: 'Behavior Cloning',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/behavior-cloning',
  sections: [S1, S2, S3],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'behavior cloning 은 사람의 시연을 정답 삼아 policy 를 supervised learning 으로 배우는 방법입니다.'],
        [4.2, 7.8, '이 영상은 그 policy 가 실제로 돌리면 무너지는 이유 세 가지만 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 7,
      cues: [[0.4, 6.8, '먼저 질문 하나. 검증 loss 는 낮은데, 실제로 돌려 보면 성공률이 낮은 이유는 뭘까요?']],
    },
    {
      id: 'drift',
      seconds: 36,
      section: S1,
      cues: [
        [0.3, 4, '차가 차선 가운데에서 벗어난 거리 y 를 step 마다 따라가 봅시다. 주황 띠는 시연에 있던 위치, ±0.3 m 입니다.'],
        [4, 13, '시연 범위 안에서는 policy 가 핸들을 조금 덜 꺾어서, 한 step 에 0.1 m 씩 밀려납니다.'],
        [13, 16, 'step 3 에서 0.3 m 를 넘어 0.4 m, 시연에 한 번도 없던 위치로 들어갑니다.'],
        [16, 25, '처음 보는 관측이라 더 크게 틀립니다. 0.2, 0.4, 0.8 m. 밀려나는 거리가 step 마다 두 배가 됩니다.'],
        [25, 31, 'step 7 에 y 는 1.8 m. 차선 폭의 절반인 1.75 m 를 넘어 차선 밖으로 나갑니다.'],
        [31, 35.8, '작은 오차가 시연에 없던 상황을 만들고, 그 상황에서 오차가 더 커졌습니다.'],
      ],
    },
    {
      id: 'compound',
      seconds: 17,
      section: S1,
      cues: [
        [0.3, 6, '이렇게 오차가 낯선 상황을 부르고, 낯선 상황이 더 큰 오차를 부르며 쌓이는 현상을 compounding error 라고 합니다.'],
        [6, 11.5, '한 step 에 틀릴 확률이 0.01 이고 episode 가 100 step 이면, 실수가 이어지지 않을 때는 평균 1 번 틀립니다.'],
        [11.5, 16.8, '한 번 틀린 뒤로 계속 틀린다면 최악에는 100 step 이 모두 틀립니다. Ross 와 Bagnell 이 증명한 T²ε 상한입니다.'],
      ],
    },
    {
      id: 'pause-compound',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. compounding error 를 한 문장으로 적고, 차 예시의 숫자 하나를 같이 적어 보세요.'],
        [16.5, 23.8, '작은 오차가 시연에 없던 상황을 만들고, 거기서 오차가 더 커지며 쌓입니다. 0.3 m 를 넘자 0.2, 0.4, 0.8 m 로 커졌습니다.'],
      ],
    },
    {
      id: 'histogram',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, '시연 1000 step 동안 차의 위치를 0.1 m 구간마다 세면, 가운데에 몰리고 0.3 m 바깥에는 하나도 없습니다.'],
        [6.5, 13, '앞에서 policy 가 지나간 위치를 찍어 보면, 0 에서 0.3 m 까지는 막대가 있는 곳입니다.'],
        [13, 19, '하지만 0.4, 0.6, 1.0, 1.8 m 는 시연에 한 번도 없던 곳입니다.'],
        [19, 25.8, '학습할 때 본 입력의 분포와 실행할 때 만나는 입력의 분포가 달라지는 것, 이것이 distribution shift 입니다.'],
      ],
    },
    {
      id: 'validation',
      seconds: 14,
      section: S2,
      cues: [
        [0.3, 7, 'validation set 도 시연에서 떼어 둔 쌍이라, policy 가 밀려나 들어간 위치는 하나도 들어 있지 않습니다.'],
        [7, 13.8, '그래서 로봇 policy 는 실제로 돌려 본 성공률로 평가합니다. distribution shift 가 원인이고, compounding error 는 그 결과입니다.'],
      ],
    },
    {
      id: 'pause-shift',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. validation loss 가 낮아도 실제로 돌리면 실패할 수 있는 이유를 한 줄로 적어 보세요.'],
        [16.5, 23.8, 'validation set 도 시연에서 뽑은 쌍이라, policy 가 밀려나 들어간 상태의 오차는 재지 못하기 때문입니다.'],
      ],
    },
    {
      id: 'swerve',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6.5, '차선 한가운데에 상자가 있습니다. expert 는 10 번 중 5 번은 왼쪽으로 20°, 5 번은 오른쪽으로 20° 꺾어 피했습니다.'],
        [6.5, 12, '관측은 열 번 모두 같은데, 정답 action 은 −20 이 다섯 개, +20 이 다섯 개입니다.'],
        [12, 19, '핸들을 −10° 에서 +10° 사이로 꺾으면 상자에 부딪힙니다.'],
        [19, 29.8, 'MSE 로 학습한 policy 는 두 정답의 평균, 0° 를 냅니다. 상자로 곧장 가는 action 입니다.'],
      ],
    },
    {
      id: 'mse',
      seconds: 21,
      section: S3,
      cues: [
        [0.3, 7, 'policy 가 낼 수 있는 값마다 MSE 를 구하면, 피하는 −20° 와 +20° 는 반대쪽 시연과의 오차 때문에 800 으로 가장 큽니다.'],
        [7, 14, '가장 작은 값은 0° 의 400 입니다. 학습은 loss 가 작아지는 쪽으로 가니, policy 는 0° 에 도착합니다.'],
        [14, 20.8, 'MSE 를 가장 작게 만드는 값은 언제나 정답들의 평균입니다.'],
      ],
    },
    {
      id: 'modes',
      seconds: 22,
      section: S3,
      cues: [
        [0.3, 6.5, '실제 시연을 세어 보면 −20° 근처와 +20° 근처에 봉우리가 둘인 multimodal 분포입니다. 평균 0° 에는 시연이 하나도 없습니다.'],
        [6.5, 12, '왼쪽과 오른쪽을 500 번씩 모아도 평균은 그대로 0° 입니다. 데이터 양으로는 풀리지 않습니다.'],
        [12, 21.8, '그래서 action 의 분포를 내거나 봉우리 하나를 고르는 policy 가 필요합니다. RT-1, ACT, Diffusion Policy 가 이 문제를 다룹니다.'],
      ],
    },
    {
      id: 'pause-modes',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. ±20° 로 반반 갈린 시연에서 MSE 로 학습한 policy 가 0° 를 내는 이유를 적어 보세요.'],
        [16.5, 23.8, 'MSE 를 가장 작게 만드는 값은 정답들의 평균이고, −20 과 +20 의 평균 0° 는 아무도 하지 않은 action 이기 때문입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 15,
      cues: [
        [0.3, 7.5, '처음 질문의 답입니다. 검증 loss 는 시연이 지나간 위치에서만 잰 오차라서, 실행 중 밀려나 들어간 곳의 오차를 보여 주지 못합니다.'],
        [7.5, 14.8, '거기서 오차는 쌓여 커지고, 정답이 갈리는 장면에서는 평균이 아무도 하지 않은 action 이 됩니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 세션은 이 문제를 데이터로 푸는 DAgger 입니다.']],
    },
  ],
}
