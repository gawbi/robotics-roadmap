import type { VideoScript } from '../script.ts'

// Numbers follow lessons/object-detection/README.md: detector outputs (box (200, 220)–(240, 260), class cup, 점수 0.91,
// 0 ~ 1); IoU (A (100, 100)–(200, 200), B (150, 120)–(250, 220), 200 − 150 = 50, 200 − 120 = 80, 4,000, 10,000 + 10,000 −
// 4,000 = 16,000, 4,000 ÷ 16,000 = 0.25; check A (0, 0)–(100, 100), B (50, 0)–(150, 100), 5,000, 15,000, ≈ 0.33, not 0.5);
// Faster R-CNN (anchor 9 개 = 넓이 128², 256², 512² × 비 1:1, 1:2, 2:1; VGG-16, K40 1초에 5 장, VOC 2007 mAP 73.2%, class 20);
// YOLO (S 7, B 2, C 20, 2 × 5 + 20 = 30, 7 × 7 × 30, Titan X 1초에 45 장, mAP 63.4%, 73.2 − 63.4 = 9.8); NMS (0.9 / 0.8 / 0.6,
// IoU 0.75 / 0.3, Ultralytics 기본 기준 0.7; 두 컵 IoU 0.5, 기준 0.7 vs 0.45; check 0.95 / 0.85 / 0.7, IoU 0.6 / 0.8, 기준 0.7 → 2
// 개, 0.5 → 1 개); 점수 기준 기본값 0.25, 평가 때 0.001; benchmarks (VOC IoU 0.5 초과, COCO IoU 0.50 ~ 0.95 의 10 단계, class 80
// 개); 40 × 40 pixel box 가 8 pixel 어긋남 (32 × 40 = 1,280, 1,600 + 1,600 − 1,280 = 1,920, IoU 0.67; AP50, AP75 의 0.75);
// label 형식 (640 × 480, box (200, 220)–(240, 260), 220 ÷ 640 = 0.34375, 240 ÷ 480 = 0.5, 0.0625, 0.0833 → 0 0.34375 0.5 0.0625
// 0.0833; check 1280 × 720, (640, 300)–(740, 420), class 2 → 690 ÷ 1280 ≈ 0.539, 360 ÷ 720 = 0.5, 100 ÷ 1280 ≈ 0.078, 120 ÷
// 720 ≈ 0.167); 3D (f_x = f_y = 600 pixel, principal point (320, 240), box 가운데 (380, 240), depth 0.5 m, X = (380 − 320) × 0.5
// ÷ 600 = 0.05 m, Y = 0 m, Z = 0.5 m, 5 cm; 고리 모양 0.8 m → X 0.08 m, 0.03 m (3 cm), 0.3 m (30 cm); check f_x 500, u 320 / 220,
// depth 1.0 m → −100 × 1.0 ÷ 500 = −0.2 m, 왼쪽 0.2 m); tracking (점수 기준 0.25, 0.9 → 0.2, ByteTrack MOT17 MOTA 80.3, IDF1
// 77.3, V100 1초에 30 프레임); Grounding DINO (zero-shot COCO AP 52.5, Swin-L, Swin-T 46.7 ~ 48.4).

const S1 = 'IoU 와 YOLO'
const S2 = 'NMS 와 점수 기준'
const S3 = 'mAP 와 fine-tuning'
const S4 = '3D · 추적 · 이름'

export const script: VideoScript = {
  id: 'object-detection',
  title: 'Object Detection',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/object-detection',
  sections: [S1, S2, S3, S4],
  terms: [
    ['open-vocabulary detector', '오픈 보캐뷸러리 디텍터'],
    ['Hand-Eye Calibration', '핸드 아이 캘리브레이션'],
    ['image classifier', '이미지 클래시파이어'],
    ['Object Detection', '오브젝트 디텍션'],
    ['6D Object Pose', '식스디 오브젝트 포즈'],
    ['Grounding DINO', '그라운딩 디노'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['false positive', '폴스 파지티브'],
    ['bounding box', '바운딩 박스'],
    ['Faster R-CNN', '패스터 알씨엔엔'],
    ['camera frame', '카메라 프레임'],
    ['fine-tuning', '파인 튜닝'],
    ['feature map', '피처 맵'],
    ['Ultralytics', '울트라리틱스'],
    ['robot base', '로봇 베이스'],
    ['PASCAL VOC', '파스칼 브이오씨'],
    ['two-stage', '투 스테이지'],
    ['tracking', '트래킹'],
    ['one-stage', '원 스테이지'],
    ['zero-shot', '제로샷'],
    ['ByteTrack', '바이트트랙'],
    ['precision', '프리시전'],
    ['detector', '디텍터'],
    ['network', '네트워크'],
    ['gripper', '그리퍼'],
    ['recall', '리콜'],
    ['module', '모듈'],
    ['anchor', '앵커'],
    ['class', '클래스'],
    ['model', '모델'],
    ['pixel', '픽셀'],
    ['label', '레이블'],
    ['depth', '뎁스'],
    ['MOT17', '모트 십칠'],
    ['MOTA', '모타'],
    ['IDF1', '아이디에프 원'],
    ['V100', '브이 백'],
    ['AP50', '에이피 오십'],
    ['AP75', '에이피 칠십오'],
    ['COCO', '코코'],
    ['YOLO', '욜로'],
    ['grid', '그리드'],
    ['mask', '마스크'],
    ['box', '박스'],
    ['IoU', '아이오유'],
    ['NMS', '엔엠에스'],
    ['mAP', '엠에이피'],
    ['VOC', '브이오씨'],
    ['txt', '텍스트'],
    ['AP', '에이피'],
    ['cm', '센티미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Object Detection 은 카메라 사진에서 물체마다 bounding box 와 class, 점수를 내는 일입니다.'],
        [4.2, 7.8, 'IoU 와 YOLO, NMS 와 점수 기준, mAP 와 fine-tuning, 3D 좌표와 추적을 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'image classifier 는 사진 한 장에 이름 하나만 내서, 빨간 상자가 어디 있는지는 알 수 없습니다.'],
        [4.4, 7.8, '개수가 정해지지 않은 box 들을 network 는 어떻게 내고, 로봇 팔이 갈 3D 좌표는 어떻게 얻을까요?'],
      ],
    },
    {
      id: 'outputs',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, 'detector 는 물체마다 두 꼭짓점의 pixel 좌표로 적은 box 와 컵 같은 class, 0.91 같은 점수를 냅니다.'],
        [6.5, 13, 'IoU 는 두 box 가 겹친 넓이를 둘 중 하나라도 덮은 넓이로 나눈 값이라, 같으면 1 이고 안 겹치면 0 입니다.'],
        [13, 19, '예를 들어 box A 와 B 가 가로 50, 세로 80 으로 겹치면 겹친 넓이는 50 × 80 으로 4,000 입니다.'],
        [
          19,
          25.7,
          '두 box 의 넓이가 각각 10,000 이면 합친 넓이는 16,000 이라, IoU 는 4,000 ÷ 16,000 으로 0.25 입니다.',
        ],
      ],
    },
    {
      id: 'stages',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'two-stage 인 Faster R-CNN 은 물체가 있을 만한 영역을 먼저 고르고, 영역마다 class 와 box 를 다시 냅니다.'],
        [6, 12, '첫 module 은 feature map 의 위치마다 넓이 세 가지와 가로세로 비 세 가지를 짝지은 anchor 9 개를 씁니다.'],
        [12, 18, 'one-stage 인 YOLO 는 사진을 7 × 7 grid 로 나누고, 물체의 가운데가 들어 있는 칸이 그 물체를 맡습니다.'],
        [
          18,
          24,
          '칸마다 box 2 개에 값 5 개씩과 class 확률 20 개를 내서 2 × 5 + 20 = 30, 출력은 7 × 7 × 30 입니다.',
          '칸마다 box 2 개에 값 5 개씩과 class 확률 20 개를 내서 2 × 5 더하기 20 은 30, 출력은 7 × 7 × 30 입니다.',
        ],
        [24, 29.7, 'VOC 2007 mAP 는 YOLO 가 63.4% 로 Faster R-CNN 의 73.2% 보다 9.8 점 낮았지만, 몇 배 빨랐습니다.'],
      ],
    },
    {
      id: 'pause-iou',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 한 변이 100 인 정사각형 box 두 개가 가로로 50 어긋나 있으면 IoU 는 얼마일까요?'],
        [16.5, 23.5, '겹친 넓이는 5,000, 합친 넓이는 15,000 이라 IoU 는 5,000 ÷ 15,000 으로 약 0.33 이고, 0.5 가 아닙니다.'],
      ],
    },
    {
      id: 'nms',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'detector 는 한 물체 근처에서 비슷한 box 를 여럿 내서, 그대로 두면 컵 하나를 세 개로 셉니다.'],
        [6, 12, 'NMS 는 점수가 가장 높은 box 를 남기고, 그 box 와 IoU 가 기준보다 큰 box 를 지우는 일을 되풀이합니다.'],
        [12, 18, '점수 0.9, 0.8, 0.6 인 box 셋에서 0.9 box 와의 IoU 는 0.8 box 가 0.75 이고 0.6 box 가 0.3 입니다.'],
        [18, 24, 'Ultralytics 의 기본 NMS 기준 0.7 을 쓰면, IoU 0.75 인 box 는 지우고 0.3 인 box 는 남깁니다.'],
        [24, 29.7, '남은 box 가 옆의 다른 컵인지 같은 컵의 어긋난 box 인지, IoU 만 보는 NMS 는 구별하지 못합니다.'],
      ],
    },
    {
      id: 'thresholds',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'NMS 기준을 낮추면 중복은 줄지만 붙은 물체를 지우고, 기준을 높이면 붙은 물체를 지키지만 중복이 남습니다.'],
        [6.5, 13, 'IoU 0.5 로 겹친 나란한 두 컵은 기준 0.7 에서는 둘 다 남고, 기준 0.45 에서는 하나가 사라집니다.'],
        [13, 19.5, 'NMS 전에는 점수 기준보다 낮은 box 를 버리는데, Ultralytics 가 예측할 때 쓰는 기본값은 0.25 입니다.'],
        [19.5, 25.7, '점수 기준을 올리면 false positive 는 줄지만 놓치는 물체가 늘어서, 성능은 precision 과 recall 로 잽니다.'],
      ],
    },
    {
      id: 'pause-nms',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 점수 0.95, 0.85, 0.7 인 box 셋을 NMS 기준 0.7 과 0.5 로 거르면 각각 몇 개가 남을까요?'],
        [16.5, 23.5, '기준 0.7 에서는 IoU 0.8 인 0.7 box 만 지워 2 개가 남고, 기준 0.5 에서는 둘 다 지워 1 개가 남습니다.'],
      ],
    },
    {
      id: 'map',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'recall 을 가로축, precision 을 세로축에 놓은 곡선 아래 넓이가 AP 이고, class 마다 구한 AP 의 평균이 mAP 입니다.'],
        [
          6,
          12,
          'VOC 는 IoU 0.5 초과를 맞은 box 로 치고, COCO 는 IoU 0.50 ~ 0.95 의 10 단계에서 잰 AP 를 평균합니다.',
          'VOC 는 IoU 0.5 초과를 맞은 box 로 치고, COCO 는 IoU 0.5 에서 0.95 까지 10 단계에서 잰 AP 를 평균합니다.',
        ],
        [12, 18, '40 × 40 pixel 컵의 box 가 가로로 8 pixel 어긋나면 IoU 는 1,280 ÷ 1,920 으로 0.67 입니다.'],
        [18, 24, '그래서 VOC 의 0.5 기준으로는 맞은 box 이지만, IoU 0.75 에서 잰 AP75 의 기준으로는 틀린 box 가 됩니다.'],
        [24, 29.7, '컵이 있는지만 알면 될 때는 AP50 을, gripper 를 컵 가운데로 보낼 때는 AP75 나 COCO mAP 를 봅니다.'],
      ],
    },
    {
      id: 'finetune',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'COCO 의 class 는 80 개라서, 로봇의 부품이나 공구는 COCO 로 학습한 model 에서 출발해 fine-tuning 합니다.'],
        [6.5, 13, 'Ultralytics 형식은 사진마다 txt 파일을 두고, 물체마다 class 번호와 가운데, 폭, 높이를 0 ~ 1 값으로 적습니다.',
          'Ultralytics 형식은 사진마다 txt 파일을 두고, 물체마다 class 번호와 가운데, 폭, 높이를 0 에서 1 사이 값으로 적습니다.'],
        [
          13,
          19.5,
          '640 × 480 사진에서 (200, 220)–(240, 260) 인 class 0 은 0 0.34375 0.5 0.0625 0.0833 입니다.',
          '640 × 480 사진에서 왼쪽 위가 200, 220 이고 오른쪽 아래가 240, 260 인 class 0 은 0, 0.34375, 0.5, 0.0625, 0.0833 입니다.',
        ],
        [19.5, 25.7, '꼭짓점 좌표를 나눠 적으면 검사는 통과해도 엉뚱한 box 를 배우니, label 을 사진 위에 다시 그려 봅니다.'],
      ],
    },
    {
      id: 'pause-label',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 1280 × 720 사진의 box (640, 300)–(740, 420) 인 class 2 물체를 한 줄로 쓰면 무엇일까요?',
          '멈추고 적어 보기. 1280 × 720 사진에서 왼쪽 위가 640, 300 이고 오른쪽 아래가 740, 420 인 class 2 물체를 한 줄로 쓰면 무엇일까요?',
        ],
        [
          16.5,
          23.5,
          '가운데는 690 ÷ 1280 과 360 ÷ 720 이고, 폭과 높이까지 나누면 2 0.539 0.5 0.078 0.167 입니다.',
          '가운데는 690 ÷ 1280 과 360 ÷ 720 이고, 폭과 높이까지 나누면 2, 0.539, 0.5, 0.078, 0.167 입니다.',
        ],
      ],
    },
    {
      id: 'to3d',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'box 는 사진 속 위치라서, box 가운데 pixel 과 그 자리의 depth 로 camera frame 의 3D 점을 구합니다.'],
        [
          6,
          12,
          '초점 거리가 600 pixel, 사진 가운데가 (320, 240), box 가운데가 (380, 240), depth 가 0.5 m 라고 합시다.',
          '초점 거리가 600 pixel, 사진 가운데가 320, 240, box 가운데가 380, 240, depth 가 0.5 m 라고 합시다.',
        ],
        [
          12,
          18,
          'X 는 (380 − 320) × 0.5 ÷ 600 으로 0.05 m 라서, 물체는 카메라 앞 0.5 m, 오른쪽 5 cm 에 있습니다.',
          'X 는 380 빼기 320 에 0.5 를 곱하고 600 으로 나눠 0.05 m 라서, 물체는 카메라 앞 0.5 m, 오른쪽 5 cm 에 있습니다.',
        ],
        [18, 24, '카메라에서 robot base 로 가는 변환을 곱하면 팔이 갈 좌표가 되고, 이 변환은 Hand-Eye Calibration 으로 구합니다.'],
        [24, 29.7, '고리 모양 물체는 가운데에서 뒤쪽 벽의 0.8 m 를 재서 앞으로 30 cm 틀리니, depth 중앙값이나 mask 를 씁니다.'],
      ],
    },
    {
      id: 'track',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6, 'detector 는 프레임마다 box 를 따로 내므로, 물체에 번호를 붙여 프레임 사이에서 잇는 tracking 을 씁니다.'],
        [6, 12, '사람이 컵 앞을 지나가면 점수가 0.25 아래로 떨어져 box 가 버려지고, 다시 나타난 컵은 새 번호를 받습니다.'],
        [12, 18, 'ByteTrack 은 점수가 높은 box 로 먼저 짝짓고, 짝을 못 찾은 기존 물체를 낮은 점수의 box 와 한 번 더 짝짓습니다.'],
        [18, 24, '저자들은 MOT17 의 시험 데이터에서 MOTA 80.3, IDF1 77.3 을 얻었고, V100 에서 1초에 30 프레임을 처리했습니다.'],
        [24, 29.7, 'Grounding DINO 는 "왼쪽 컵" 같은 글로 물체를 찾고, 가장 큰 model 은 zero-shot COCO AP 52.5 였습니다.', 'Grounding DINO 는 왼쪽 컵 같은 글로 물체를 찾고, 가장 큰 model 은 zero-shot COCO AP 52.5 였습니다.'],
      ],
    },
    {
      id: 'pause-3d',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 초점 거리 500 pixel, 가운데 u 320, box 가운데 u 220, depth 1.0 m 면 X 는 얼마일까요?'],
        [
          16.5,
          23.5,
          'X 는 (220 − 320) × 1.0 ÷ 500 으로 −0.2 m 이고, X 가 음수라서 물체는 왼쪽으로 0.2 m 떨어져 있습니다.',
          'X 는 220 빼기 320 에 1.0 을 곱하고 500 으로 나눠 마이너스 0.2 m 이고, X 가 음수라서 물체는 왼쪽으로 0.2 m 떨어져 있습니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. YOLO 는 7 × 7 grid 로 7 × 7 × 30 의 정해진 크기의 출력을 내서 개수 문제를 없앱니다.'],
        [4.2, 8.2, '점수가 0.25 보다 낮은 box 를 버리고, NMS 기준 0.7 로 IoU 0.75 인 중복은 지우고 0.3 인 box 는 남깁니다.'],
        [8.2, 12.2, 'COCO mAP 는 IoU 0.50 ~ 0.95 의 평균이라, IoU 0.67 인 box 는 AP50 에서 맞고 AP75 에서 틀립니다.', 'COCO mAP 는 IoU 0.5 에서 0.95 까지의 평균이라, IoU 0.67 인 box 는 AP50 에서 맞고 AP75 에서 틀립니다.'],
        [12.2, 15.7, '3D 좌표는 box 가운데와 depth 로 얻되 중앙값이나 mask 를 쓰고, ByteTrack 은 낮은 점수 box 로 물체를 잇습니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '찾은 물체를 어떤 자세로 집을지는 Grasp Planning 에서, 물체의 3D 자세는 6D Object Pose 에서 다룹니다.']],
    },
  ],
}
