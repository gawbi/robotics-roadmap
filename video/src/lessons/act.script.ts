import type { VideoScript } from '../script.ts'

// Numbers follow lessons/act/README.md: ALOHA's 50 Hz (20 ms step) and 14 joint angles, the 400-step transfer-cube episode
// with k = 100 (4 decisions, (100, 14) chunk = 2 s), the H = 400 ÷ k table with ε = 0.01 (1600, 16, 0.16) and the paper's
// 1% → 44%, the 100 ms inference example (10 commands a second, 80 ms waits, 20 ms → 2 s deadline), the cube pushed from
// 10 cm to 14 cm at step 30 (k = 20 reacts at step 40, k = 100 at step 100), the 40.0° → 44.0° jump at a chunk boundary,
// temporal ensembling of 30°, 32°, 35° with m = 0.69 (1, 0.5, 0.25 → 31.29°) and m = 0.01 (32.32° vs 32.33°), the 3.3% gain,
// and the lesson's three check questions (T = 200 and k = 20; 300 ms → k ≥ 15; 40, 44, 44 → 41.71°).

const S1 = 'action chunking'
const S2 = '결정 횟수와 compounding error'
const S3 = '추론 시한과 chunk 길이'
const S4 = 'temporal ensembling'

export const script: VideoScript = {
  id: 'act',
  title: 'ACT',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/act',
  sections: [S1, S2, S3, S4],
  terms: [
    ['temporal ensembling', '템포럴 앙상블링'],
    ['transfer-cube', '트랜스퍼 큐브'],
    ['Real Robot', '리얼 로봇'],
    ['simulator', '시뮬레이터'],
    ['parameter', '파라미터'],
    ['open-loop', '오픈 루프'],
    ['chunking', '청킹'],
    ['LeRobot', '르로봇'],
    ['weight', '웨이트'],
    ['chunk', '청크'],
    ['ALOHA', '알로하'],
    ['H²ε', '에이치 제곱 엡실론'],
    ['π0', '파이 제로'],
    ['cm', '센티미터'],
    ['ε', '엡실론'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'ACT 는 관측을 한 번 볼 때 앞으로 2 초 동안의 action 100 개를 한꺼번에 내는 policy 입니다.'],
        [4.2, 7.8, '이 영상은 action 을 묶어 내면 무엇이 좋아지고 무엇을 잃는지, 묶음을 어떻게 이어 붙이는지 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 7,
      cues: [
        [0.4, 3.6, 'step 마다 action 하나를 내는 policy 는 episode 끝으로 갈수록 어긋나고, 어떤 자세에서는 멈춰 버립니다.'],
        [3.6, 6.8, '그럼 질문 하나. 시연은 그대로 두고, policy 출력의 모양만 바꿔서 이 실패를 줄일 수 있을까요?'],
      ],
    },
    {
      id: 'chunking',
      seconds: 25,
      section: S1,
      cues: [
        [0.3, 5.8, 'ALOHA 는 1초에 50 번, 곧 20 ms 마다 양팔의 목표 관절 각도 14 개를 보냅니다. 이 한 번이 step 입니다.'],
        [5.8, 11.8, '지금까지의 policy 는 step 마다 관측을 보고 action 하나를 냅니다. 400 step 이면 400 번 결정합니다.'],
        [11.8, 18.3, 'ACT 는 관측을 한 번 볼 때 앞으로 k step 의 action k\u00a0개를 한꺼번에 냅니다. 이 묶음이 action chunk 입니다.'],
        [18.3, 24.8, '논문의 k 는 100 입니다. 길이 400 step 인 episode 에서 결정은 400 번에서 4 번으로 줄어듭니다.'],
      ],
    },
    {
      id: 'execute',
      seconds: 19,
      section: S1,
      cues: [
        [
          0.3,
          6,
          'chunk 하나는 100 줄 × 14 칸의 표, 2 초 분량입니다. 로봇은 이 표를 20 ms 마다 한 줄씩 실행합니다.',
          'chunk 하나는 백 줄, 열네 칸의 표, 2 초 분량입니다. 로봇은 이 표를 20 ms 마다 한 줄씩 실행합니다.',
        ],
        [6, 12.3, 'chunk 를 쓴다고 로봇이 2 초에 한 번 움직이는 것은 아닙니다. 줄어드는 것은 관측을 보고 결정하는 횟수뿐입니다.'],
        [12.3, 18.8, '시연 중 사람이 잠깐 멈춘 자세에서도, chunk 는 멈춤과 그 뒤의 움직임을 통째로 내서 멈춰 버리는 일이 줄어듭니다.'],
      ],
    },
    {
      id: 'horizon',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 5.6, 'Behavior Cloning 에서, 결정 한 번이 틀릴 확률이 ε 이고 결정이 H 번이면 최악에 H²ε 번까지 틀린다고 했습니다.'],
        [5.6, 10.6, 'chunk 를 쓰면 결정 횟수 H 는 step 수 T 를 k 로 나눈 값입니다. transfer-cube 과제는 T 가 400 입니다.'],
        [10.6, 16.4, 'ε 을 0.01 로 두면 H²ε 은 k 가 1 이면 1600, 10 이면 16, 100 이면 0.16 입니다.'],
        [16.4, 21, 'k 를 10 배 키우면 결정은 10 분의 1 이지만, H²ε 은 제곱이라 100 분의 1 로 줄어듭니다.'],
        [21, 25.8, 'k 만 바꿔 simulator 과제에서 잰 논문의 평균 성공률은 k 가 1 이면 1%, 100 이면 44% 였습니다.'],
      ],
    },
    {
      id: 'pause-horizon',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. T 가 200, ε 이 0.01 일 때, k 가 1 일 때와 20 일 때의 결정 횟수와 H²ε 은 각각 얼마일까요?'],
        [16.5, 23.8, 'k 가 1 이면 200 번에 400, k 가 20 이면 10 번에 1 입니다. 결정은 20 분의 1, H²ε 은 400 분의 1 로 줄었습니다.'],
      ],
    },
    {
      id: 'timing',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 5.3, '관측을 넣어 출력을 계산하는 일을 추론이라고 합니다. 추론 한 번에 100 ms 가 걸리는 모델이 있다고 합시다.'],
        [5.3, 11, 'k 가 1 이면 모델이 100 ms 에 action 하나를 만들어 1초에 명령이 10 개뿐이고, 로봇은 명령마다 80 ms 를 기다립니다.'],
        [11, 15.8, 'k 가 100 이면 같은 100 ms 의 추론 한 번으로 2 초 분량의 action 100 개가 나옵니다.'],
        [15.8, 21, '로봇이 그 100 개를 실행하는 동안 다음 chunk 를 계산하면 되니, 추론 시한이 20 ms 에서 2 초로 100 배 늘어납니다.'],
        [21, 25.8, '논문의 ACT 는 추론이 약 0.01 초라 20 ms 에도 맞지만, π0 처럼 parameter 가 수십억 개인 모델은 이 시한이 필요합니다.'],
      ],
    },
    {
      id: 'open-loop',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 5.3, 'chunk 를 실행하는 동안에는 새 관측을 보지 않습니다. 이렇게 실행 중의 변화를 반영하지 않는 제어를 open-loop 제어라고 합니다.'],
        [5.3, 11, '집게가 10 cm 에 있는 큐브 쪽으로 step 마다 0.2 cm 씩 다가가는데, step 30 에 큐브가 14 cm 로 밀려났다고 합시다.'],
        [11, 16, 'k 가 20 이면 step 40 에 새 관측을 보고 방향을 바꿉니다. 10 step 늦게 반응합니다.'],
        [16, 20.8, 'k 가 100 이면 step 100 에야 반응해서, 70 step, 곧 1.4 초가 늦습니다.'],
        [20.8, 25.8, '논문에서도 성공률은 k 가 100 일 때 가장 높았고, 200 과 400 에서는 조금 떨어졌습니다.'],
      ],
    },
    {
      id: 'pause-deadline',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 50 Hz 로봇에서 추론 한 번에 300 ms 가 걸립니다. 명령을 기다리지 않으려면 k 는 최소 얼마일까요?'],
        [16.5, 23.8, 'chunk 하나의 길이 k × 20 ms 가 추론 시간 300 ms 이상이어야 하니, k 는 최소 300 ÷ 20, 곧 15 입니다.'],
      ],
    },
    {
      id: 'jump',
      seconds: 15,
      section: S4,
      cues: [
        [0.3, 4.6, 'k 가 100 인 chunk 를 끝까지 실행하면, 100 step 마다 움직임이 끊깁니다.'],
        [4.6, 9.6, '첫 chunk 가 어깨 관절을 step 마다 0.4° 씩 돌려, step 99 에 40.0° 에 닿았다고 합시다.'],
        [9.6, 14.8, 'step 100 의 둘째 chunk 가 44.0° 에서 시작하면, 20\u00a0ms 동안 평소의 10 배인 4.0° 를 돌아야 해서 팔이 튑니다.'],
      ],
    },
    {
      id: 'ensemble',
      seconds: 31,
      section: S4,
      cues: [
        [0.3, 5.3, 'ACT 는 이 끊김을 없애려고 step 마다 추론해 chunk 를 새로 냅니다. 그러면 앞뒤 chunk 가 서로 겹칩니다.'],
        [
          5.3,
          10.8,
          'k 가 3 이면 시각 t − 2, t − 1, t 에 낸 세 chunk 가 모두 시각 t 를 덮어, 시각 t 의 예측이 3 개 생깁니다.',
          'k 가 3 이면 시각 t 마이너스 2, t 마이너스 1, t 에 낸 세 chunk 가 모두 시각 t 를 덮어, 시각 t 의 예측이 세 개 생깁니다.',
        ],
        [10.8, 15.3, '이 예측들을 하나로 합쳐 실제로 실행할 각도를 정하는 방법이 temporal ensembling 입니다.'],
        [15.3, 21, '예측마다 weight 를 곱해 더한 뒤 weight 의 합으로 나눕니다. weight 는 가장 오래된 예측이 1 이고, 최근 것일수록 작습니다.'],
        [21, 26, '예측이 오래된 것부터 30°, 32°, 35° 이고 m 이 0.69 면, weight 는 1, 0.5, 0.25 입니다.'],
        [26, 30.8, '54.75 ÷ 1.75, 약 31.29° 를 실행합니다. 최근 chunk 가 다른 값을 내도 각도는 조금씩만 바뀝니다.'],
      ],
    },
    {
      id: 'weights',
      seconds: 23,
      section: S4,
      cues: [
        [0.3, 6.2, '저자 코드의 m 은 0.01 이라 weight 가 1, 0.99, 0.98 이고, 결과 32.32° 는 보통 평균 32.33° 에 가깝습니다.'],
        [6.2, 11.8, '주의할 점. 이 식에서 가장 큰 weight 1 을 받는 것은 가장 최근이 아니라, 가장 오래된 예측입니다.'],
        [11.8, 17.5, '대가도 있습니다. step 마다 추론하니 추론이 20 ms 안에 끝나야 하고, 앞에서 늘린 추론 시한은 포기합니다.'],
        [17.5, 22.8, '논문에서는 성공률을 3.3% 높였지만, LeRobot 은 temporal ensembling 을 기본값에서 꺼 둡니다.'],
      ],
    },
    {
      id: 'pause-ensemble',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. m 이 0.69 이고 시각 t 의 세 예측이 오래된 것부터 40, 44, 44 입니다. 실행할 각도는 얼마일까요?'],
        [
          16.5,
          23.8,
          'weight 는 1, 0.5, 0.25 입니다. 40 + 22 + 11 은 73, 이것을 1.75 로 나누면 약 41.71° 입니다.',
          'weight 는 1, 0.5, 0.25 입니다. 40 더하기 22 더하기 11 은 73, 이것을 1.75 로 나누면 약 41.71° 입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 15,
      cues: [
        [0.3, 7.5, '질문의 답입니다. 출력을 action 100 개 묶음으로 바꾸자 결정은 400 번에서 4 번으로, 성공률은 1% 에서 44% 로 올랐습니다.'],
        [7.5, 14.8, '추론 시한도 2 초로 늘었습니다. chunk 경계의 튐은 temporal ensembling 이 겹친 예측의 가중 평균으로 없앱니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 세션은 학습한 policy 를 실물 팔에서 돌리고 성공률로 평가하는 Real Robot 입니다.']],
    },
  ],
}
