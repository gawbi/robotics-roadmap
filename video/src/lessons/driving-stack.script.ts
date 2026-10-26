import type { VideoScript } from '../script.ts'

// Numbers follow lessons/driving-stack/README.md, section "modular 와 end-to-end": UniAD (Hu et al., CVPR 2023), camera 6 대
// (figures/modular-vs-e2e.svg), nuScenes plans 3 s ahead with L2 averaged over 1, 2, 3 s, the table ST-P3 2.11 m · 0.71% and
// UniAD 1.03 m · 0.31%, and Li et al. 2024: 73.9% of nuScenes is driving straight. Arithmetic only: 2.11 ÷ 2 > 1.03,
// 0.71 ÷ 2 > 0.31 ("둘 다 절반 아래") and 100 − 73.9 = 26.1.

const S1 = 'modular 와 end-to-end'
const S2 = 'L2 와 충돌률'
const S3 = 'open-loop 의 함정'

export const script: VideoScript = {
  id: 'driving-stack',
  title: 'Autonomous Driving Stack',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/driving-stack',
  sections: [S1, S2, S3],
  terms: [
    ['modular', '모듈러'],
    ['module', '모듈'],
    ['stack', '스택'],
    ['network', '네트워크'],
    ['end-to-end', '엔드 투 엔드'],
    ['UniAD', '유니 에이디'],
    ['nuScenes', '뉴씬즈'],
    ['L2', '엘 투'],
    ['ST-P3', '에스티 피 쓰리'],
    ['open-loop', '오픈 루프'],
    ['closed-loop', '클로즈드 루프'],
    ['simulation', '시뮬레이션'],
    ['camera', '카메라'],
    ['vector', '벡터'],
    ['frame', '프레임'],
    ['box', '박스'],
    ['Li', '리'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '자율주행 stack 은 module 로 나눠 만들 수도, 센서에서 경로까지 network 하나로 이을 수도 있습니다.'],
        [4.2, 7.8, '이 영상은 두 방식을 비교하고, 그 network 를 평가하는 방법의 함정을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 7,
      cues: [[0.4, 6.8, '먼저 질문 하나. 사람이 운전한 경로와 거의 같은 경로를 내는 network 는, 운전을 잘하는 걸까요?']],
    },
    {
      id: 'stack',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.8, 'modular stack 은 사람이 module 을 나누고, module 사이에 주고받을 것을 정합니다.'],
        [5.8, 11.3, '그래서 module 마다 따로 시험하고, 차가 이상하면 어느 module 이 틀렸는지 찾을 수 있습니다.'],
        [11.3, 17, '대신 앞 module 이 버린 정보는 뒤에서 못 씁니다. 보행자의 몸 방향은 box 목록에 담기지 않습니다.'],
        [17, 22.5, 'end-to-end 는 센서에서 경로까지를 network 하나로 잇습니다. 2023 년의 UniAD 가 그 예입니다.'],
        [22.5, 27.8, '부분 사이에는 학습한 vector 를 넘기고, 최종 경로로 계산한 loss 로 전체를 함께 학습합니다.'],
      ],
    },
    {
      id: 'pause-stack',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. modular stack 의 장점 하나와 약점 하나를 적어 보세요.'],
        [16.5, 23.8, 'module 마다 따로 시험하고 틀린 곳을 찾을 수 있습니다. 대신 앞 module 이 버린 정보는 뒤에서 못 씁니다.'],
      ],
    },
    {
      id: 'metrics',
      seconds: 33,
      section: S2,
      cues: [
        [0.3, 5.8, 'UniAD 는 nuScenes 의 기록된 주행 장면에서, 3 초 앞까지의 경로를 계획합니다.'],
        [5.8, 11.3, '그 계획을 사람이 실제로 운전한 경로와 1 초, 2 초, 3 초 시점에서 비교합니다.'],
        [11.3, 16.8, '세 시점에서 잰 위치 차이의 평균이 L2 입니다. 작을수록 사람의 경로에 가깝습니다.'],
        [16.8, 22, '충돌률은 계획한 경로가 다른 물체와 겹친 비율입니다.'],
        [22, 27.5, '이전 camera 기반 end-to-end 방법인 ST-P3 는 평균 L2 가 2.11 m, 충돌률이 0.71% 였습니다.'],
        [27.5, 32.8, 'UniAD 는 1.03 m 와 0.31%. 두 값 모두 절반 아래로 줄었습니다.'],
      ],
    },
    {
      id: 'loop',
      seconds: 34,
      section: S3,
      cues: [
        [0.3, 6, '이 평가는 기록된 장면을 다시 틀어 놓고, frame 마다 계획을 사람의 경로와 비교합니다.'],
        [6, 11.5, '계획대로 움직이면 장면이 어떻게 바뀌는지는 보지 않습니다. 이것이 open-loop 평가입니다.'],
        [11.5, 16.5, 'Li 등은 2024 년, nuScenes 데이터의 73.9% 가 직진 장면이라는 것을 보였습니다.'],
        [16.5, 22, '그래서 주변을 거의 보지 않고 내 차의 속도만으로 경로를 늘여도 L2 가 작게 나옵니다.'],
        [22, 28, '실제 운전 능력은 계획대로 움직인 결과가 다음 입력으로 돌아오는 closed-loop 에서 봐야 합니다.'],
        [28, 33.8, 'closed-loop simulation 이나 실차 시험이 그 방법입니다. L2 가 작다고 운전을 잘하는 것은 아닙니다.'],
      ],
    },
    {
      id: 'pause-loop',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. nuScenes 의 L2 가 작아도 운전을 잘한다고 할 수 없는 이유를 두 가지 적어 보세요.'],
        [16.5, 23.8, '기록된 장면에서 비교만 하는 open-loop 평가라 움직인 결과를 안 봅니다. 또 73.9% 가 직진이라 속도만으로도 L2 가 작습니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 12,
      cues: [
        [0.3, 6, '처음 질문의 답입니다. 그것만으로는 알 수 없습니다. L2 는 기록된 장면에서 잰 open-loop 점수입니다.'],
        [6, 11.8, '운전 능력은 계획대로 움직인 결과가 돌아오는 closed-loop simulation 이나 실차 시험으로 확인합니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음 세션들은 논문 네 편을 평가 관점으로 읽습니다. 오늘 본 Li 등의 논문도 그중 하나입니다.']],
    },
  ],
}
