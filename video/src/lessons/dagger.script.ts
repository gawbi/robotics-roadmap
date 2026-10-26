import type { VideoScript } from '../script.ts'

// Numbers follow lessons/dagger/README.md: the 1000 / 2000 step demo counts, iteration 2 of the lane example (c = 0.3,
// y = 0 … 1.8, labels 8y = 0 … 8.0, 7 × 100 = 700 new pairs, 1700 in all, c = 1.0), policy 1.6° vs expert 4.8° at 0.6 m,
// 1000 → 1700 → 3100 → 4600 pairs, the 10 step chain with u = 2, the bounds with ε = 0.1 and u = 2 (T = 2 … 10), T = 300,
// the ε = 0.05 · u = 2 · T = 20 check, the 600 / 12,000 / 60,000 step table, HG-DAgger's 3 × 20 = 60 steps, RaC 78.3 % on
// 5 h against 75.0 % on about 89 h, and the iteration 2 · 3 · 4 rollouts (step 7, step 14, 15 steps).

const S1 = 'DAgger 의 반복'
const S2 = '실수가 쌓이는 정도'
const S3 = '사람 expert 와 개입 수집'

export const script: VideoScript = {
  id: 'dagger',
  title: 'DAgger',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/dagger',
  sections: [S1, S2, S3],
  terms: [
    ['HG-DAgger', '에이치지 대거'],
    ['Dataset Aggregation', '데이터셋 애그리게이션'],
    ['iteration', '이터레이션'],
    ['uTε', '유 티 엡실론'],
    ['LeRobot', '르로봇'],
    ['RaC', '래크'],
    ['frame', '프레임'],
    ['intervention', '인터벤션'],
    ['chunking', '청킹'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'DAgger 는 policy 가 직접 운전해 간 상태에서 expert 에게 정답을 물어, 데이터에 더해 가는 방법입니다.'],
        [4.2, 7.8, '이 영상은 그 반복과 실수가 쌓이는 정도, 그리고 사람 expert 로 데이터를 모으는 법을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.2, '먼저 질문 하나. 시연을 1000 step 에서 2000 step 으로 늘려도, 0.3 m 바깥의 데이터는 여전히 0 입니다.'],
        [4.2, 7.8, 'policy 가 실수한 뒤에만 들어가는 그 상태의 정답은 어디서 얻어야 할까요?'],
      ],
    },
    {
      id: 'loop',
      seconds: 25,
      section: S1,
      cues: [
        [0.3, 6, '빈 곳으로 가는 것은 실수하는 policy 자신입니다. 그래서 policy 에게 직접 운전을 맡깁니다.'],
        [6, 13, 'policy 로 운전하고, 지나간 상태의 관측을 기록하고, 그 상태에서 expert 가 냈을 action 을 정답으로 붙입니다.'],
        [13, 18.5, '새 쌍을 지금까지 모은 데이터에 합쳐 전체로 다시 학습합니다. 이 한 바퀴가 iteration 입니다.'],
        [18.5, 24.8, '이름은 Dataset Aggregation, 모아 합친다는 뜻입니다. 이번 데이터만 쓰면 전에 받은 정답을 잊기 때문입니다.'],
      ],
    },
    {
      id: 'iteration2',
      seconds: 36,
      section: S1,
      cues: [
        [
          0.3,
          6,
          'iteration 1 은 시연 1000 step 입니다. iteration 2 에서는 그 시연으로 학습한 policy 가 운전합니다.',
          'iteration 1 은 시연 1000 step 입니다. 이터레이션 2 에서는 그 시연으로 학습한 policy 가 운전합니다.',
        ],
        [6, 12.5, '정답이 있던 0.3 m 까지가 아는 범위라, 0.1 m 씩 밀리다가 그 바깥에서 크게 밀려 step 7 에 차선을 벗어납니다.'],
        [12.5, 19, '지나간 위치마다 expert 에게 묻습니다. 정답은 벗어난 거리의 8 배만큼 꺾는 것이라, 1.0 m 에서는 8° 입니다.'],
        [19, 25.5, '차를 움직인 건 policy 지만, 저장하는 건 expert 의 정답입니다. 0.6 m 에서 policy 는 1.6°, 정답은 4.8° 입니다.'],
        [25.5, 30.5, 'policy 의 1.6° 를 저장하면 자기 값을 다시 배울 뿐이라, 아는 범위가 0.3 m 그대로입니다.'],
        [30.5, 35.8, '일곱 위치에서 100 번씩 운전해 새 쌍이 700 개, 데이터는 1700 쌍입니다. 다음 policy 는 1.0 m 까지 압니다.'],
      ],
    },
    {
      id: 'pause-loop',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. DAgger 한 iteration 의 네 단계와, 정답으로 expert 의 action 을 저장하는 이유를 적어 보세요.'],
        [16.5, 23.8, '운전, 기록, expert 정답 붙이기, 합쳐서 다시 학습입니다. policy 의 조향을 저장하면 아는 범위가 넓어지지 않습니다.'],
      ],
    },
    {
      id: 'chain',
      seconds: 25,
      section: S2,
      cues: [
        [0.3, 6, 'step 마다 틀릴 확률을 ε, episode 길이를 T 라 하고, 10 step episode 의 step 4 에서 처음 틀렸다고 해 봅니다.'],
        [6, 12, 'behavior cloning 의 policy 는 시연에 없는 상태로 들어가 그 뒤를 모두 틀립니다. step 4 부터 10 까지 7 번입니다.'],
        [
          12,
          18.5,
          'DAgger 로 학습한 policy 는 벗어난 상태의 정답도 배워서 돌아옵니다. step 4, 5 두 번만 틀립니다.',
          'DAgger 로 학습한 policy 는 벗어난 상태의 정답도 배워서 돌아옵니다. 스텝 사와 오, 두 번만 틀립니다.',
        ],
        [18.5, 24.8, '실수 한 번 때문에 틀리는 step 수의 상한을 u 라고 하고, 이 예는 2 입니다. behavior cloning 은 많게는 T 입니다.'],
      ],
    },
    {
      id: 'bounds',
      seconds: 38,
      section: S2,
      cues: [
        [0.3, 6.5, 'episode 하나에서 실수할 기회는 T × ε 번. behavior cloning 은 한 번마다 피해가 많게는 T 라서 상한이 T²ε 입니다.'],
        [6.5, 12, 'DAgger 는 실수 한 번의 피해가 u 라서 상한이 uTε 입니다. 실수가 T 에 비례해 쌓입니다.'],
        [12, 18, '차이는 ε 을 잰 곳에서 나옵니다. behavior cloning 은 시연에서, DAgger 는 policy 들이 직접 간 상태에서 쟀습니다.'],
        [18, 23.5, 'ε 이 0.1, u 가 2 일 때 T 를 늘리면 behavior cloning 은 0.4, 1.6, 3.6, 6.4, 10 으로 휘어 오릅니다.'],
        [23.5, 28.5, 'DAgger 는 0.4, 0.8, 1.2, 1.6, 2 로 곧게 오릅니다. T 가 두 배가 되면 상한도 두 배입니다.'],
        [28.5, 33, 'behavior cloning 은 네 배가 되니, 두 상한의 비 T ÷ u 는 episode 가 길수록 커집니다.'],
        [33, 37.8, '1초에 10 번 결정하며 30 초 동안 일하는 로봇이라면 T 는 300 입니다.'],
      ],
    },
    {
      id: 'pause-bounds',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. ε 이 0.05, u 가 2, T 가 20 이면 두 상한은 각각 얼마이고, 몇 배 차이일까요?',
          '멈추고 적어 보기. 엡실론이 영 점 영오, 유가 이, 티가 이십이면 두 상한은 각각 얼마이고, 몇 배 차이일까요?',
        ],
        [
          16.5,
          23.8,
          'behavior cloning 은 20 × 20 × 0.05 로 20, DAgger 는 2 × 20 × 0.05 로 2, 10 배 차이입니다.',
          '비헤이비어 클로닝은 이십 곱하기 이십 곱하기 영 점 영오로 이십, 대거는 이 곱하기 이십 곱하기 영 점 영오로 이, 십 배 차이입니다.',
        ],
      ],
    },
    {
      id: 'human',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6, '이 강의의 expert 는 차의 위치를 아는 프로그램이라 어디서든 바로 답했습니다. 실물 로봇에서 expert 는 대개 사람입니다.'],
        [6, 12.5, '사람은 결과를 보며 조작을 고쳐 가는데, policy 가 운전하는 동안에는 자기 답이 실행되는 모습을 못 본 채 답해야 합니다.'],
        [12.5, 17, '서툰 policy 가 실물을 움직여야 데이터가 모이니, 차가 부딪히고 팔이 물건을 떨어뜨립니다.'],
        [17, 23, '묻는 횟수도 많습니다. 1초에 10 번, 60 초 episode 를 20 번씩, iteration 5 번을 돌면 60,000 번입니다.'],
        [23, 27.8, '0.1 초에 하나씩 쉬지 않고 답해도 6,000 초, 100 분이 걸립니다.'],
      ],
    },
    {
      id: 'hg',
      seconds: 37,
      section: S3,
      cues: [
        [0.3, 6.5, 'HG-DAgger 는 운전대를 누가 잡을지 사람이 정합니다. 지켜보다 위험하면 넘겨받아 되돌리고, 안전해지면 돌려줍니다.'],
        [6.5, 12.5, '정답은 사람이 운전대를 쥔 구간만 기록합니다. 600 step 에서 20 step 씩 세 번이면 60 개, 10 분의 1 입니다.'],
        [12.5, 18.5, '사람은 결과를 보며 운전하고, 넘겨받는 곳이 policy 가 데려간 위험한 상태라 그 근처의 정답이 모입니다.'],
        [18.5, 25, 'LeRobot 은 실물 팔에서 같은 방식을 씁니다. 사람이 넘겨받은 구간만 저장하고, 그 frame 에 intervention 표시를 붙입니다.'],
        [25, 31, 'RaC 는 넘겨받으면 먼저 익숙한 상태로 되돌리고, 하던 작업을 끝까지 보여 준 뒤 episode 를 끝냅니다.'],
        [
          31,
          36.8,
          '셔츠 걸기에서 RaC 는 5 시간 데이터로 성공률 78.3 %, 약 89 시간 시연을 쓴 이전 연구는 75.0 % 였습니다.',
          '셔츠 걸기에서 RaC 는 다섯 시간 데이터로 성공률 78.3 %, 약 89 시간 시연을 쓴 이전 연구는 75.0 % 였습니다.',
        ],
      ],
    },
    {
      id: 'pause-human',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 사람에게 매 step 묻기 어려운 이유 두 가지와, HG-DAgger 가 정답을 기록하는 구간을 적어 보세요.'],
        [16.5, 23.8, '결과를 못 본 채 답해 정답의 질이 떨어지고, 서툰 policy 가 실물을 움직여 위험합니다. 기록은 사람이 넘겨받은 구간만 합니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 15,
      cues: [
        [0.3, 7.5, '처음 질문의 답입니다. 그 상태로 가는 것은 policy 자신이니, policy 에게 운전을 맡기고 그 자리에서 expert 에게 묻습니다.'],
        [7.5, 14.8, '아는 범위가 1.0, 1.7 m 로 넓어지자, step 7 에 벗어나던 policy 가 iteration 4 에 15 step 을 완주했습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, 'DAgger 는 데이터를 모으는 방법을 바꿔 compounding error 를 줄였습니다.'],
        [3.6, 6.8, '다음 세션은 관측 한 번에 action 여러 step 을 묶어 내는 action chunking, ACT 입니다.'],
      ],
    },
  ],
}
