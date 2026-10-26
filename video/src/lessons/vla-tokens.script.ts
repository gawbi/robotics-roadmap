import type { VideoScript } from '../script.ts'

// Numbers follow lessons/vla-tokens/README.md: joint 1 over −128° ~ +128° in 256 bins of 1°, 10.3° → 138.3 → bin 138 →
// back to 10.5°; OpenVLA's 7 action numbers (position 3, rotation 3, gripper 1) and the example bins 138, 173, 97, 188,
// 128, 115, 121; room for only 100 new tokens; the +200° outlier (min~max: 0.82°, ~24 bins; 1%~99%: 0.078°, clip to 255);
// Prismatic-7B (SigLIP + DINOv2 about 600 M, 2-layer MLP projector, Llama 2 7B), 224×224, 256 image tokens; Open
// X-Embodiment (21 institutions, 22 robots, 60 datasets, over 1 M demos, 527 skills) → 970 k demos; WidowX 8 tasks 76.3% vs
// 45.6%; 0.5° → 2.6 mm and 8° → 41.9 mm on a 30 cm arm (circumference 1,884 mm), 1 mm pin gap; about 6 actions/s on an
// RTX 4090 (0.167 s), 50 Hz = 20 ms, 8.3×; 0.02 s × 7 = 0.14 s; OpenVLA-OFT 4.2 → 108.8 actions/s on an A100 (26×), 8-step
// chunks. The lesson's check question gives 0.01 s × 7 = 0.07 s → about 14 actions/s. How OpenVLA pairs bins with
// vocabulary entries is left unsaid (CLAUDE.md, 사실 확인): only that it overwrites the 256 least-used tokens, per its paper.

const S1 = 'action token'
const S2 = 'OpenVLA 의 구조와 데이터'
const S3 = 'action token 의 약점'

export const script: VideoScript = {
  id: 'vla-tokens',
  title: 'RT-2 → OpenVLA',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/vla-tokens',
  sections: [S1, S2, S3],
  terms: [
    ['VLA', '브이엘에이'],
    ['VLM', '브이엘엠'],
    ['OpenVLA-OFT', '오픈 브이엘에이 오에프티'],
    ['OpenVLA', '오픈 브이엘에이'],
    ['RT-2', '알티 투'],
    ['token', '토큰'],
    ['tokenizer', '토크나이저'],
    ['vocabulary', '보캐뷸러리'],
    ['language model', '랭귀지 모델'],
    ['Llama 2 7B', '라마 투 세븐 비'],
    ['Llama', '라마'],
    ['Prismatic-7B', '프리즈매틱 세븐 비'],
    ['Prismatic', '프리즈매틱'],
    ['224×224', '이백이십사 곱하기 이백이십사'],
    ['SigLIP', '시그립'],
    ['DINOv2', '다이노 브이 투'],
    ['image encoder', '이미지 인코더'],
    ['projector', '프로젝터'],
    ['image', '이미지'],
    ['text', '텍스트'],
    ['parameter', '파라미터'],
    ['Open X-Embodiment', '오픈 엑스 엠보디먼트'],
    ['dataset', '데이터셋'],
    ['skill', '스킬'],
    ['WidowX', '위도우 엑스'],
    ['BridgeData V2', '브리지 데이터 브이 투'],
    ['the', '더'],
    ['cup', '컵'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
    ['GPU', '지피유'],
    ['RTX 4090', '알티엑스 사천구십'],
    ['A100', '에이 백'],
    ['Driving Stack', '드라이빙 스택'],
    ['modular', '모듈러'],
    ['end-to-end', '엔드 투 엔드'],
    ['open-loop', '오픈 루프'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'VLA 는 인터넷의 사진과 글로 배운 VLM 이 로봇 시연으로 action 까지 내도록 더 학습한 모델입니다.'],
        [4.2, 7.8, '이 영상은 action token, OpenVLA 의 구조와 데이터, 그리고 이 방식의 약점을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 7,
      cues: [[0.4, 6.8, '먼저 질문 하나. token 만 고를 수 있는 language model 이 10.3° 같은 관절 각도를 어떻게 낼까요?']],
    },
    {
      id: 'bins',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6, 'language model 은 vocabulary, 곧 쓸 수 있는 token 목록에서 하나를 고를 뿐, 10.3 같은 실수는 직접 못 씁니다.'],
        [6, 12, '그래서 관절 1 의 범위 −128° 에서 +128° 까지를 같은 폭의 칸 256 개로 나눕니다. 칸 폭은 1° 입니다.'],
        [12, 18, '10.3° 는 왼쪽 끝에서 138.3 칸 떨어져 있어 138 번 칸이 되고, 이 칸 번호가 token 하나가 됩니다.'],
        [18, 23.5, '모델이 138 번 칸의 token 을 내면, 그 칸의 가운데 값 10.5° 로 되돌립니다.'],
        [23.5, 27.8, '시연의 10.3° 와는 0.2° 어긋납니다. 칸으로 자른 값은 칸 폭의 절반까지 틀릴 수 있습니다.'],
      ],
    },
    {
      id: 'vocab',
      seconds: 20,
      section: S1,
      cues: [
        [0.3, 6, '차원마다 칸 번호 하나가 token 하나라서, OpenVLA 의 action 하나는 token 7 개가 됩니다.'],
        [6, 9.6, 'OpenVLA 논문에 따르면 Llama tokenizer 에는 새 token 을 더할 자리가 100 개뿐이었습니다.'],
        [9.6, 13, '그래서 이미 있는 token 가운데 가장 덜 쓰이는 256 개를 action token 으로 덮어썼습니다.'],
        [13, 19.8, '"the" 나 "cup" 을 덮어쓰면 지시문을 못 읽지만, 거의 안 나오는 token 은 뜻을 잃어도 손해가 적습니다.'],
      ],
    },
    {
      id: 'quantile',
      seconds: 20,
      section: S1,
      cues: [
        [0.3, 6.5, '범위를 시연의 최솟값부터 최댓값까지로 잡으면, 센서 오류로 튄 +200° 하나가 범위를 크게 넓힙니다.'],
        [6.5, 13, '칸 폭이 0.82° 로 넓어져서, 값이 모인 −10° 에서 +10° 사이에는 약 24 칸만 쓰입니다.'],
        [13, 19.8, 'OpenVLA 는 1% 에서 99% 분위수 사이를 256 칸으로 나눠 칸 폭이 0.078° 이고, 범위 밖 값은 끝 칸으로 잘라 넣습니다.'],
      ],
    },
    {
      id: 'pause-token',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. −128° 에서 +128° 까지를 256 칸으로 나누면, 45.8° 는 몇 번 칸이고 되돌리면 몇 도일까요?'],
        [16.5, 23.8, '45.8 에 128 을 더하면 173.8 이라 173 번 칸입니다. 되돌리면 그 칸의 가운데 값 45.5° 입니다.'],
      ],
    },
    {
      id: 'arch',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6, 'OpenVLA 는 Prismatic-7B 라는 VLM 에서 출발합니다. 입력은 224×224 사진 한 장과 지시문입니다.'],
        [6, 9.4, '사진은 SigLIP 과 DINOv2 로 된, 약 6 억 parameter 의 image encoder 를 지납니다.'],
        [9.4, 12.5, '이어서 projector 가 그 출력을 image token 256 개로 바꿉니다.'],
        [12.5, 15.5, '지시문은 Llama tokenizer 로 text token 이 됩니다.'],
        [15.5, 19, '둘을 함께 받은 Llama 2 7B 가 action token 7 개를 하나씩 고릅니다.'],
        [19, 25.8, '7 개는 손끝 위치 변화 3 개, 회전 변화 3 개, 집게 1 개로 되돌아갑니다. 관절 각도 같은 로봇 상태는 받지 않습니다.'],
      ],
    },
    {
      id: 'data',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 6.5, '학습 데이터 Open X-Embodiment 는 21 개 기관이 로봇 22 가지로 모은 dataset 60 개를 합친 것입니다.'],
        [6.5, 12.5, '시연은 100 만 개가 넘고 skill 은 527 가지. 그중 바깥 카메라와 팔 하나의 손끝 제어 데이터만 골라 97 만 개로 학습했습니다.'],
        [12.5, 15.5, 'WidowX 과제 8 개에서 OpenVLA 의 성공률은 76.3% 였습니다.'],
        [15.5, 18.5, '같은 Prismatic 을 BridgeData V2 하나로만 학습한 판은 45.6% 였습니다.'],
        [18.5, 23.8, '저자들은 여러 로봇 데이터의 다양한 장면과 작업이 일반화에 꼭 필요하다고 보았습니다.'],
      ],
    },
    {
      id: 'pause-openvla',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. OpenVLA 의 입력 두 가지와, 출력 token 7 개가 각각 무엇인지 적어 보세요.'],
        [16.5, 23.8, '입력은 224×224 사진 한 장과 지시문, 출력은 손끝 위치 변화 3 개, 회전 변화 3 개, 집게 1 개의 action token 입니다.'],
      ],
    },
    {
      id: 'precision',
      seconds: 22,
      section: S3,
      cues: [
        [0.3, 6, '칸의 가운데 값으로 되돌리면, 칸 폭이 1° 일 때 관절마다 최대 0.5° 가 어긋납니다.'],
        [6, 12.5, '관절에서 손끝까지 30 cm 인 팔이면, 손끝은 둘레 1,884\u00a0mm 의 원에서 0.5 ÷ 360 만큼, 약 2.6 mm 어긋납니다.'],
        [12.5, 17, '칸이 16 개라면 최대 8° 라서 약 41.9 mm. 컵은 집어도, 1 mm 틈에 핀을 꽂기에는 2.6 mm 도 부족합니다.'],
        [17, 21.8, '칸을 더 잘게 나누면 덮어쓸 token 이 늘고 칸마다 시연이 줄어, RT-1, RT-2, OpenVLA 는 모두 256 칸을 썼습니다.'],
      ],
    },
    {
      id: 'speed',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'action 하나에 token 7 개를 하나씩 내려면, parameter 70 억 개짜리 모델을 7 번 차례로 계산해야 합니다.'],
        [6.5, 12.5, '그래서 OpenVLA 는 RTX 4090 한 장에서 1 초에 약 6 번 action 을 냅니다. 한 번에 약 0.167 초입니다.'],
        [12.5, 19, '손을 빠르고 섬세하게 움직이는 로봇은 20 ms 마다 명령을 보내는 50 Hz 로 제어하기도 합니다.'],
        [19, 25.8, '1 초에 약 6 번으로 50 Hz 를 맞추려면, 50 ÷ 6, 약 8.3 배 빨라져야 합니다.'],
      ],
    },
    {
      id: 'onestep',
      seconds: 20,
      section: S3,
      cues: [
        [0.3, 6.5, 'GPU 가 빠르면 7 개가 한 번에 나올까요? GPU 는 계산 안의 곱셈을 동시에 할 뿐, 고르는 순서는 못 바꿉니다.'],
        [6.5, 12.5, '또 추론 한 번에 지금 step 의 action 하나만 나와서, ACT 처럼 여러 step 을 묶어 낼 수 없고 로봇이 기다립니다.'],
        [12.5, 16, 'OpenVLA-OFT 는 7 자리를 계산 한 번에 내고, 앞으로 8 step 을 한 묶음으로 냅니다.'],
        [16, 19.8, '그러자 A100\u00a0에서 1 초에 내는 action 이 4.2 개에서 108.8 개로 늘었습니다.'],
      ],
    },
    {
      id: 'pause-weak',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 계산 한 번에 0.01 초가 걸리는 VLA 가 token 7 개를 하나씩 내면, 1 초에 action 을 몇 번 낼까요?'],
        [16.5, 23.8, 'action 하나에 0.01 초씩 7 번, 0.07 초가 걸려서 1 초에 약 14 번입니다. 50 Hz 에는 한참 모자랍니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 15,
      cues: [
        [0.3, 7.5, '처음 질문의 답입니다. 차원마다 값의 범위를 256 칸으로 나누고, 칸 번호마다 token 하나를 짝지어 글처럼 쓰게 합니다.'],
        [7.5, 14.8, '그 대가로 관절마다 최대 0.5° 가 어긋나고, RTX 4090\u00a0에서 1 초에 약 6 번, 한 번에 한 step 의 action 만 냅니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [
          0.4,
          6.6,
          // non-breaking hyphens keep the caption from splitting "end-to-end"; the voice reads the plain spelling
          '다음 세션은 Driving Stack 입니다. modular 와 end\u2011to\u2011end, 그리고 open\u2011loop 평가가 무엇을 놓치는지 봅니다.',
          '다음 세션은 Driving Stack 입니다. modular 와 end-to-end, 그리고 open-loop 평가가 무엇을 놓치는지 봅니다.',
        ],
      ],
    },
  ],
}
