import type { VideoScript } from '../script.ts'

// Numbers follow lessons/vla-reasoning/README.md: π0's 50 Hz robot and 0.5 s re-inference, the flat VLA's 600 ÷ 0.5 =
// 1200 inferences of one instruction, a 2 s subtask → 2 ÷ 0.5 = 4, the language following rate ≈ 20% = 1 ÷ 5, Hi Robot's
// 1 s / on-speech recompute and PaliGemma-3B VLM pair, the π0.5 high-level ablation (≈ 79 / 71 / 63 / 62 / 60 / 60 / 58%,
// read off figure 13), the Hi Robot RTX 4090 timings (prefill 47 ms, decode 13.2 ms a token, 6 × 13.2 = 79.2 ms, low-level
// 73 ms, 199.2 ms ≈ 10 actions, 1000 ms wait → 1199.2 ms ≈ 60 actions) and its check question (2000 + 47 + 132 = 2179
// ms, 179 ms); ECoT's seven stages, 7 → 350 tokens, 314 trials, Octo 21 / 16, OpenVLA 44 / 30, RT-2-X 47 / 48, Naive CoT
// 48 / 48, ECoT 66 / 64, 22 and 34 %p → 28, correction 32 → 80 and 16 → 44; the token-cost table (47 + 7 × 13.2 = 139.4
// ms ≈ 7.2 a second, 47 + 350 × 13.2 = 4667 ms ≈ 0.21), ECoT-Lite's measured 1 ~ 1.2 (H100 FP8), 0.3 ~ 0.5 and 3 ~ 4
// (RTX 4090), the four cost cuts (5-step freeze 63 → 72%, 24% faster; two copies 65%, 40% faster, 2× compute; ECoT-Lite
// ≈ 3× faster, +10 ~ 19%; Fast-ThinkAct ≈ 250 tokens → −89.3% latency), empty thinking tokens −3.8%, and the check
// question (107 tokens → 1459.4 ms → ≈ 0.69 a second, ≈ 1.46 s a chunk); knowledge insulation's gradient example (+0.2,
// −0.5, learning rate 0.1: −0.3 → +0.03 vs 0.2 → −0.02), ≈ 3 B / 0.3 B parameters, 7.5× training steps, DROID 0.55 /
// 0.49 / 0.45, ≈ 20% more compute a step, frozen backbone 0%, and the check question (−0.3, +0.5 → +0.2 → −0.02; −0.3 →
// +0.03); Gemini Robotics-ER's 0 ~ 1000 coordinates, [y, x] = [500, 250] on 640×480 → (160, 240), grasp angle −90 ~ 90°,
// zero-shot code 27% vs 53% on 7 ALOHA 2 tasks, Gemini Robotics 1.5's thinking scores (ALOHA 0.26 → 0.55, +0.29; Bi-arm
// Franka 0.55 → 0.60; Apollo humanoid 0.51 → 0.67), 8 agent tasks (≤ 44% vs ≈ 80%), and the check question (1280×720,
// [250, 600] → (768, 180)).

const S1 = 'high · low-level'
const S2 = 'ECoT 와 token 비용'
const S3 = 'stop-gradient'
const S4 = 'ER 와 thinking VLA'

export const script: VideoScript = {
  id: 'vla-reasoning',
  title: 'Reasoning VLA',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/vla-reasoning',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Gemini Robotics-ER 1.5', '제미나이 로보틱스 이아르 일 점 오'],
    ['pick up the rain jacket', '픽 업 더 레인 재킷'],
    ['Gemini Robotics 1.5', '제미나이 로보틱스 일 점 오'],
    ['pack the rain jacket', '팩 더 레인 재킷'],
    ['Gemini Robotics-ER', '제미나이 로보틱스 이아르'],
    ['knowledge insulation', '놀리지 인슐레이션'],
    ['Gemini 2.0 Flash', '제미나이 이 점 영 플래시'],
    ['Gemini Robotics', '제미나이 로보틱스'],
    ['Gemini', '제미나이'],
    ['chain-of-thought', '체인 오브 쏘트'],
    ['pick up the plate', '픽 업 더 플레이트'],
    ['clean the kitchen', '클린 더 키친'],
    ["that's not trash", '댓츠 낫 트래시'],
    ['Google DeepMind', '구글 딥마인드'],
    ['back-projection', '백 프로젝션'],
    ['stop-gradient', '스탑 그래디언트'],
    ['Reasoning VLA', '리즈닝 브이엘에이'],
    ['learning rate', '러닝 레이트'],
    ['flow matching', '플로우 매칭'],
    ['PaliGemma-3B', '팔리젬마 쓰리비'],
    ['bounding box', '바운딩 박스'],
    ['thinking VLA', '씽킹 브이엘에이'],
    ['orchestrator', '오케스트레이터'],
    ['implicit HL', '임플리싯 에이치엘'],
    ['World Model', '월드 모델'],
    ['trajectory', '트래젹토리'],
    ['simulation', '시뮬레이션'],
    ['next-token', '넥스트 토큰'],
    ['high-level', '하이 레벨'],
    ['ECoT-Lite', '이씨오티 라이트'],
    ['Naive CoT', '나이브 씨오티'],
    ['low-level', '로우 레벨'],
    ['attention', '어텐션'],
    ['humanoid', '휴머노이드'],
    ['gradient', '그래디언트'],
    ['flat VLA', '플랫 브이엘에이'],
    ['Hi Robot', '하이 로봇'],
    ['backbone', '백본'],
    ['thinking', '씽킹'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['subtask', '서브태스크'],
    ['prefill', '프리필'],
    ['gripper', '그리퍼'],
    ['OBJECTS', '오브젝츠'],
    ['ALOHA 2', '알로하 투'],
    ['WidowX', '위도우엑스'],
    ['Franka', '프랑카'],
    ['decode', '디코드'],
    ['weight', '웨이트'],
    ['ALOHA', '알로하'],
    ['DROID', '드로이드'],
    ['GPT-4', '지피티 포'],
    ['token', '토큰'],
    ['chunk', '청크'],
    ['pixel', '픽셀'],
    ['point', '포인트'],
    ['depth', '뎁스'],
    ['grasp', '그래스프'],
    ['agent', '에이전트'],
    ['value', '밸류'],
    ['ECoT', '이씨오티'],
    ['FAST', '패스트'],
    ['TASK', '태스크'],
    ['PLAN', '플랜'],
    ['MOVE', '무브'],
    ['H100', '에이치 백'],
    ['RTX', '알티엑스'],
    ['FP8', '에프피 에이트'],
    ['VLM', '브이엘엠'],
    ['VLA', '브이엘에이'],
    ['key', '키'],
    ['π0.5', '파이 제로 점 오'],
    ['π0', '파이 제로'],
    ['ER', '이아르'],
    ['RL', '알엘'],
    ['2D', '이차원'],
    ['%p', ' 퍼센트 포인트'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Reasoning VLA 는 action 앞에 다음 subtask 글이나 물체 위치를 먼저 내고, 그 글을 보고 움직입니다.'],
        [4.2, 7.8, '두 policy 의 나눔, ECoT 와 token 비용, knowledge insulation, Gemini 의 두 층을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'π0 는 사진과 짧은 지시문을 받아 action chunk 를 내고, 50 Hz 로봇에서는 0.5 초마다 다시 추론합니다.'],
        [4.4, 7.8, '몇 분짜리 지시를 다음에 할 일의 글로 먼저 쪼개면서도, 1 초에 50 개씩 필요한 관절 목표를 제때 낼 수 있을까요?'],
      ],
    },
    {
      id: 'flat',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6, '중간 출력 없이 action 을 바로 내는 VLA 가 flat VLA 입니다. 긴 작업에서는 같은 지시문을 여러 번 받습니다.'],
        [6, 12.5, '0.5 초마다 추론하며 10 분짜리 부엌 정리를 하면 600 ÷ 0.5 로 1200 번 추론하고, 매번 지시문이 같습니다.'],
        [12.5, 19, 'subtask 글로 바꾸면 글이 단계마다 달라집니다. 2 초짜리 subtask 는 같은 글을 2 ÷ 0.5 로 4 번만 받습니다.'],
        [19, 25.8, '그래서 지시를 subtask 글로 바꾸는 high-level 과, 그 글로 chunk 를 내는 low-level 로 나눕니다.'],
      ],
    },
    {
      id: 'hierarchy',
      seconds: 32,
      section: S1,
      cues: [
        [0.3, 6, 'high-level 은 사진과 전체 지시문, 사용자가 중간에 한 말을 받아 몇 초짜리 subtask 글을 냅니다.'],
        [6, 12, 'low-level 은 사진, 관절 각도, subtask 글만 받아 0.5 초마다 chunk 를 냅니다. 전체 지시문은 보지 않습니다.'],
        [12, 18.5, 'Hi Robot 은 VLM 두 개를 따로 학습하고, π0.5 는 weight 한 벌이 글을 낸 뒤 action 을 냅니다.'],
        [18.5, 25, '네 작업의 진행률은 π0.5 약 79%, 학습에만 subtask 를 넣은 implicit HL 약 71%, GPT-4 약 58% 였습니다.'],
        [25, 31.7, '말을 들으면 Hi Robot 은 바로 다시 계산해 199.2 ms 뒤에 chunk 를 냅니다. 1 초마다라면 1199.2 ms 입니다.'],
      ],
    },
    {
      id: 'pause-latency',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. high-level 을 2 초마다만 계산하고 새 명령이 token 10 개면, 가장 늦으면 몇 ms 일까요?', '멈추고 적어 보기. high-level 을 2 초마다만 계산하고 새 명령이 token 10 개면, 가장 늦으면 몇 밀리초일까요?'],
        [16.5, 23.5, '2000 + 47 + 132 로 2179 ms 입니다. 말을 듣자마자 계산하면 47 + 132 로 179 ms 입니다.', '2000 더하기 47 더하기 132 로 2179 ms 입니다. 말을 듣자마자 계산하면 47 더하기 132 로 179 ms 입니다.'],
      ],
    },
    {
      id: 'ecot',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '답 앞에 풀이를 쓰는 것이 chain-of-thought 입니다. ECoT 는 action token 7 개 앞에 풀이를 붙입니다.'],
        [6, 12.5, 'TASK, PLAN, SUBTASK 는 보통의 글 추론이고, MOVE, GRIPPER, OBJECTS 는 사진을 봐야 쓰는 추론입니다.'],
        [12.5, 18.5, 'gripper 끝의 pixel 좌표와 물체의 상자까지 적어서, 한 step 의 token 이 7 개에서 350 개가 됩니다.'],
        [18.5, 24.5, '같은 데이터로 배운 OpenVLA 는 44%, ECoT 는 66% 였고, 카메라를 옮긴 경우에는 30% 와 64% 였습니다.'],
        [24.5, 29.8, '22%p 와 34%p 의 평균이 초록의 28% 입니다. 계획과 subtask 만 쓴 Naive CoT 는 48% 에 그쳤습니다.'],
      ],
    },
    {
      id: 'token-cost',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6, '추론 글에는 시간이 듭니다. token 하나를 낼 때마다 앞의 token 을 봐야 해서 decode 를 되풀이합니다.'],
        [6, 12.5, 'Hi Robot 의 측정값을 빌리면 prefill 은 47 ms 이고, token 하나의 decode 는 13.2 ms 입니다.'],
        [12.5, 19, '7 개면 47 + 7 × 13.2 로 139.4 ms, 1 초에 약 7.2 번입니다. 350 개면 4667 ms, 약 0.21 번입니다.', '7 개면 47 더하기 7 곱하기 13.2 로 139.4 ms, 1 초에 약 7.2 번입니다. 350 개면 4667 ms, 약 0.21 번입니다.'],
        [19, 25.5, '실제로 ECoT 는 H100 에서 1 초에 1 ~ 1.2 번, RTX 4090 에서는 0.3 ~ 0.5 번 action 을 냅니다.', '실제로 ECoT 는 H100 에서 1 초에 1 에서 1.2 번, RTX 4090 에서는 0.3 에서 0.5 번 action 을 냅니다.'],
        [25.5, 31.7, '줄이는 길은 넷입니다. 위쪽 추론을 5 step 고정하면 63% 가 72% 로 오르며 24% 빨라졌습니다.'],
      ],
    },
    {
      id: 'pause-tokens',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 추론 token 100 개와 action token 7 개를 한 step 에 내면 1 초에 몇 번 낼까요?'],
        [16.5, 23.5, '107 개라서 47 + 107 × 13.2 로 1459.4 ms, 1 초에 약 0.69 번입니다. 1 초짜리 chunk 면 로봇이 기다립니다.', '107 개라서 47 더하기 107 곱하기 13.2 로 1459.4 ms, 1 초에 약 0.69 번입니다. 1 초짜리 chunk 면 로봇이 기다립니다.'],
      ],
    },
    {
      id: 'ki-gradient',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'subtask 를 고르는 지식은 VLM backbone 에 있는데, 무작위 action expert 와 함께 배우면 상합니다.'],
        [6, 11.5, 'action expert 의 loss 의 gradient 가 attention 을 거쳐 backbone 까지 고치기 때문입니다.'],
        [11.5, 18, 'w 에 FAST token 을 맞히는 loss 의 gradient +0.2 와 action expert 의 −0.5 가 온다고 합시다.'],
        [18, 24, '둘을 더한 −0.3 에 learning rate 0.1 을 곱하면 w 는 +0.03 만큼 바뀌고, FAST loss 는 늘어납니다.'],
        [24, 29.8, 'action expert 쪽을 막으면 0.2 만 남아 w 는 −0.02 만큼 바뀌고, FAST loss 는 줄어듭니다.'],
      ],
    },
    {
      id: 'ki-results',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'gradient 를 backbone 앞에서 끊는 것이 stop-gradient 입니다. 앞으로 가는 값은 그대로 두고 뒤로만 끊습니다.'],
        [6, 12, '끊기만 하면 backbone 은 action 을 배우지 못하므로, FAST token 으로 바꾼 action 과 웹 데이터로 배웁니다.'],
        [12, 18, 'action expert 는 backbone 의 key 와 value 를 읽기만 하며 flow matching 으로 배웁니다.'],
        [18, 24, 'π0 는 학습 step 이 7.5 배 들었고, knowledge insulation 은 DROID 점수도 0.55 대 0.49 로 앞섰습니다.'],
        [24, 29.8, 'backbone 을 얼리면 서랍 작업과 셔츠 개기에서 성공률 0% 였습니다. backbone 도 action 을 배워야 합니다.'],
      ],
    },
    {
      id: 'pause-gradient',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. gradient 가 FAST loss 에서 −0.3, action expert 에서 +0.5 면 w 는 어떻게 바뀔까요?'],
        [16.5, 23.5, '없으면 합이 +0.2 라서 w 는 −0.02 만큼 바뀌고 FAST loss 는 늘어납니다. 있으면 w 는 +0.03 바뀌고 줄어듭니다.'],
      ],
    },
    {
      id: 'er',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'Google DeepMind 는 추론 VLM 을 따로 만듭니다. Gemini Robotics-ER 는 좌표를 글로 내는 VLM 입니다.'],
        [6.5, 13, 'point 는 y, x 순서로, 상자는 y0, x0, y1, x1 순서로 적고, 좌표는 0 ~ 1000 의 정수로 정규화합니다.', 'point 는 와이, 엑스 순서로, 상자는 와이 제로, 엑스 제로, 와이 일, 엑스 일 순서로 적고, 좌표는 0 에서 1000 의 정수로 정규화합니다.'],
        [13, 20, '640×480 사진의 [500, 250] 은 x 가 250 ÷ 1000 × 640 으로 160, y 가 240 pixel 입니다.', '640×480 사진의 500, 250 은 x 가 250 ÷ 1000 × 640 으로 160, y 가 240 pixel 입니다.'],
        [20, 27.7, '코드를 써서 로봇을 움직이면 ALOHA 2 의 7 가지 작업에서 Gemini 2.0 Flash 는 27%, ER 는 53% 였습니다.'],
      ],
    },
    {
      id: 'thinking',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'Gemini Robotics 1.5 는 추론을 두 층에 나눕니다. 위층 orchestrator 는 계획과 단계 완료 판정을 맡습니다.'],
        [7, 14, '아래층 VLA 는 action 앞에 생각을 글로 쓰는 thinking VLA 입니다. 받은 명령을 몇 초짜리 단계로 다시 쪼갭니다.'],
        [14, 22, 'thinking 을 켜자 진행 점수가 ALOHA 에서 0.26 이 0.55 로, humanoid 는 0.51 이 0.67 로 올랐습니다.'],
        [22, 29.7, '도구와 기억이 필요한 8 가지 작업에서 VLA 혼자는 최대 44%, orchestrator 를 붙인 agent 는 80% 근처였습니다.'],
      ],
    },
    {
      id: 'pause-point',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1280×720 사진에서 ER 가 point [250, 600] 을 냈습니다. pixel 좌표는 얼마일까요?', '멈추고 적어 보기. 1280×720 사진에서 ER 가 point 250, 600 을 냈습니다. pixel 좌표는 얼마일까요?'],
        [16.5, 23.5, 'y, x 순서라서 x 는 600 ÷ 1000 × 1280 으로 768, y 는 250 ÷ 1000 × 720 으로 180 pixel 입니다.', '와이, 엑스 순서라서 x 는 600 ÷ 1000 × 1280 으로 768, y 는 250 ÷ 1000 × 720 으로 180 pixel 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.3, '답입니다. high-level 이 subtask 글을 내고, low-level 은 그 글만 보고 action chunk 를 냅니다.'],
        [4.3, 8.3, 'ECoT 는 성공률을 44% 에서 66% 로 올렸지만 token 350 개로 1 초에 1 ~ 1.2 번뿐이라 비용을 줄여야 합니다.', 'ECoT 는 성공률을 44% 에서 66% 로 올렸지만 token 350 개로 1 초에 1 에서 1.2 번뿐이라 비용을 줄여야 합니다.'],
        [8.3, 12.3, 'knowledge insulation 은 stop-gradient 로 지식을 지키고, 학습 step 은 7.5 분의 1 이면 됩니다.'],
        [12.3, 15.8, 'ER 는 좌표를 글로 내고, thinking VLA 는 생각을 켜서 ALOHA 의 진행 점수를 0.26 에서 0.55 로 올렸습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '고른 subtask 가 옳았는지는 실행해 봐야 압니다. 다음은 World Model 과, 실행 결과로 더 배우는 VLA + RL 입니다.', '고른 subtask 가 옳았는지는 실행해 봐야 압니다. 다음은 World Model 과, 실행 결과로 더 배우는 VLA 플러스 RL 입니다.'],
      ],
    },
  ],
}
