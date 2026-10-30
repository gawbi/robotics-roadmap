import type { VideoScript } from '../script.ts'

// Numbers follow lessons/classical-pick/README.md: the setup (camera f = 500, principal point (320, 240), camera at
// (0.3, 0, 0.55) looking straight down; 5 cm cube, top 0.05 m, centre 0.025 m; fingers open to 7 cm); APC 2015 (25 teams
// answered, 20 used motion planning; 26 teams, 12 items in 20 min, 36 in all, RBO 10 of 12; difficulty 인식 4.52, grasping
// 4.36, planning and control 3.75); colour mask (R ≥ 150 and G·B ≤ 80; (200, 40, 30) → (100, 20, 15); 200 ÷ 270 ≈ 0.74,
// 100 ÷ 135 ≈ 0.74, (120, 110, 100) 120 ÷ 330 ≈ 0.36, (230, 200, 190) 230 ÷ 620 ≈ 0.37; share ≥ 0.6; 9 cells → (220, 240),
// 8 cells → (219.875, 239.875); check (60, 55, 50) 60 ÷ 165 ≈ 0.36); YOLO-World 2024 ("red cube" box (200, 220)–(240, 260),
// score 0.91, centre (220, 240); LVIS, V100, 52 images a second, 35.4 AP); yaw 10°, 90° period, candidates 10°, 100°, −80°,
// −170°, wrist_roll 0° → 10°, 70° → 100°; back-projection (depth 0.5 = 0.55 − 0.05; 220 − 320 = −100, ÷ 500 = −0.2,
// × 0.5 = −0.1; camera (−0.1, 0, 0.5) → (−0.1, 0, −0.5) + (0.3, 0, 0.55) = (0.20, 0, 0.05); centre (0.20, 0, 0.025); depth
// 0.51 → −0.102, 2 mm; check (420, 290) → (100, 50) → (0.2, 0.1) → (0.1, 0.05, 0.5) → (0.4, −0.05, 0.05), 40 cm / 5 cm);
// height assumption (0.2 m per 1 m down, 0.3 − 0.2 × 0.5 = 0.20; 5 cm book, top (0.20, 0, 0.10), u ≈ 209, (0.189, 0, 0.05),
// 1.1 cm and 5 cm off; depth 0.45 m); grasp (top-down, (7 − 5) ÷ 2 = 1 cm margin; six waypoints 0.2 m above, pre-grasp
// (0.20, 0, 0.225), place (0.30, 0, 0.025)); IK (links 0.2 + 0.2 = 0.4 m, shoulder 0.1 m up, hand 0.075 m; pre-grasp wrist
// √(0.2² + 0.2²) ≈ 0.283 m; place at 0.40 → √(0.4² + 0.2²) ≈ 0.447 m fails; pre-grasp (90°, −90°, −90°), grasp (60°, −120°,
// −30°), elbow-down (0°, 90°)); path (minimum-jerk T = 2 s; 1 s tip x 0.225, 2.5 cm; at 0.05 m height x 0.212, 1.2 cm;
// CartesianPath 0.01 m); MTC (π/12 → 24 candidates, max_ik_solutions default 1, tutorial 8; task.plan(5); check π/6 → 12,
// 12 × 8 = 96); error budget (0.5 ÷ 500 = 0.001 m per pixel, 2 + 3 + 3 = 8 mm in 10 mm; 2° tilt 314 × 2 ÷ 360 ≈ 1.7 cm,
// 8 + 17 = 25 mm); failures (41 of 50 = 82%; 4 / 2 / 2 / 1 = 8% / 4% / 4% / 2%; 45 ÷ 50 = 90%; check 30 ÷ 40 = 75%,
// 36 ÷ 40 = 90%); end-to-end (Levine et al. 2016, 92,000-parameter CNN).

const S1 = '여섯 module 과 인식'
const S2 = 'depth 와 높이 가정'
const S3 = 'IK · 경로 · MTC'
const S4 = 'error budget 과 비교'

export const script: VideoScript = {
  id: 'classical-pick',
  title: 'Classical Pick & Place',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/classical-pick',
  sections: [S1, S2, S3, S4],
  terms: [
    ['classical pick-and-place', '클래시컬 픽 앤 플레이스'],
    ['Amazon Picking Challenge', '아마존 피킹 챌린지'],
    ['Classical Pick & Place', '클래시컬 픽 앤 플레이스'],
    ['principal point', '프린시펄 포인트'],
    ['back-projection', '백 프로젝션'],
    ['Behavior Cloning', '비헤이비어 클로닝'],
    ['motion planning', '모션 플래닝'],
    ['Cartesian path', '카테시안 패스'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['top-down grasp', '탑다운 그래스프'],
    ['bounding box', '바운딩 박스'],
    ['camera frame', '카메라 프레임'],
    ['camera', '카메라'],
    ['depth camera', '뎁스 카메라'],
    ['error budget', '에러 버짓'],
    ['minimum-jerk', '미니멈 저크'],
    ['joint angle', '조인트 앵글'],
    ['calibration', '캘리브레이션'],
    ['base frame', '베이스 프레임'],
    ['end-to-end', '엔드 투 엔드'],
    ['grasp pose', '그래스프 포즈'],
    ['propagator', '프로퍼게이터'],
    ['YOLO-World', '욜로 월드'],
    ['wrist_roll', '리스트 롤'],
    ['generator', '제너레이터'],
    ['connector', '커넥터'],
    ['parameter', '파라미터'],
    ['pre-grasp', '프리 그래스프'],
    ['MoveIt 2', '무브잇 투'],
    ['red cube', '레드 큐브'],
    ['approach', '어프로치'],
    ['centroid', '센트로이드'],
    ['grasping', '그래스핑'],
    ['pipeline', '파이프라인'],
    ['waypoint', '웨이포인트'],
    ['gripper', '그리퍼'],
    ['network', '네트워크'],
    ['retreat', '리트리트'],
    ['module', '모듈'],
    ['Levine', '러빈'],
    ['torque', '토크'],
    ['motor', '모터'],
    ['stage', '스테이지'],
    ['depth', '뎁스'],
    ['grasp', '그래스프'],
    ['pixel', '픽셀'],
    ['cube', '큐브'],
    ['lift', '리프트'],
    ['mask', '마스크'],
    ['OMPL', '오엠피엘'],
    ['base', '베이스'],
    ['box', '박스'],
    ['yaw', '요'],
    ['ray', '레이'],
    ['CNN', '씨엔엔'],
    ['MTC', '엠티씨'],
    ['IK', '아이케이'],
    ['3D', '쓰리디'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Classical Pick & Place 는 사진 속 물체를 3D 위치, 잡기 자세, IK, 경로, 실행으로 이어 옮깁니다.'],
        [4.2, 7.8, '여섯 module 과 인식, depth 와 높이 가정, IK · 경로 · MTC, error budget 과 비교를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '팔이 상자를 집으러 내려가다 손가락이 모서리에 걸리면, 원인이 여럿이어도 보이는 결과는 못 집었다 하나뿐입니다.'],
        [4.4, 7.8, '사진 한 장에서 손가락이 닫히기까지의 여러 계산 가운데, 어느 계산이 틀렸는지 어떻게 가려낼 수 있을까요?'],
      ],
    },
    {
      id: 'pipeline',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6.5, '일을 인식, 3D 위치, 잡기 자세, IK, 경로, 실행의 여섯 module 로 나누고, module 마다 입력과 출력을 정합니다.'],
        [6.5, 12.5, '앞 module 의 출력을 다음 module 의 입력으로 넘기는 pipeline 이라서, 중간 값을 하나씩 확인할 수 있습니다.'],
        [12.5, 19, '사람이 짠 규칙으로 module 을 잇는 이 방식을 classical pick-and-place 라고 부릅니다.'],
        [19, 25.7, '첫 Amazon Picking Challenge 설문에 답한 25 팀 중 20 팀은 motion planning 으로 경로를 계산했습니다.'],
      ],
    },
    {
      id: 'mask',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, '인식은 cube 의 pixel 을 고릅니다. R 이 150 이상이고 G·B 가 80 이하인 칸을 1 로 적은 표가 mask 입니다.'],
        [
          7,
          14,
          '그늘진 (100, 20, 15) 는 R 문턱에서 빠지지만, 빨강의 몫 R ÷ (R + G + B) 는 밝을 때처럼 약 0.74 입니다.',
          '그늘진 (100, 20, 15) 는 R 문턱에서 빠지지만, 빨강의 몫, 알 나누기 알 더하기 지 더하기 비 는 밝을 때처럼 약 0.74 입니다.',
        ],
        [14, 21, 'YOLO-World 가 이름으로 찾은 bounding box 가운데 (220, 240) 은 mask 의 centroid 와 같습니다.'],
        [21, 27.7, 'box 는 각도를 주지 않아 yaw 를 따로 구합니다. wrist_roll 이 0° 면 후보 넷 중 가장 가까운 10° 를 고릅니다.'],
      ],
    },
    {
      id: 'pause-mask',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 밝기가 반이 된 책상 pixel (60, 55, 50) 은 빨강의 몫 0.6 이상 규칙으로 cube 일까요?'],
        [16.5, 23.5, '합이 165 라서 몫은 60 ÷ 165 로 약 0.36 이고 cube 가 아닙니다. 밝은 책상의 몫 0.36 과 같습니다.'],
      ],
    },
    {
      id: 'backproject',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '같은 ray 위의 점은 모두 같은 pixel 에 찍혀서 depth 가 필요합니다. 이 pixel 의 depth 는 0.5 m 입니다.'],
        [
          7,
          14,
          'back-projection 은 220 − 320 으로 −100, 500 으로 나눠 −0.2, depth 를 곱해 −0.1 입니다.',
          'back-projection 은 220 빼기 320 으로 −100, 500 으로 나눠 −0.2, depth 를 곱해 −0.1 입니다.',
        ],
        [14, 21, '축을 base 에 맞추고 카메라 자리 (0.3, 0, 0.55) 를 더하면 cube 윗면은 (0.20, 0, 0.05) 입니다.'],
        [21, 27.7, 'depth 를 0.51 로 잘못 재면 높이만이 아니라 X 도 −0.2 × 0.51 로 −0.102 가 되어 2 mm 바뀝니다.'],
      ],
    },
    {
      id: 'height',
      seconds: 28,
      section: S2,
      cues: [
        [
          0.3,
          7,
          'ray 는 1 m 내려갈 때 0.2 m 다가오니, 높이 0.05 m 를 가정하면 x 는 0.3 − 0.2 × 0.5 로 0.20 입니다.',
          'ray 는 1 m 내려갈 때 0.2 m 다가오니, 높이 0.05 m 를 가정하면 x 는 0.3 빼기 0.2 × 0.5 로 0.20 입니다.',
        ],
        [7, 14, 'cube 를 두께 5 cm 인 책 위에 올리면 윗면은 실제로 (0.20, 0, 0.10) 이고, pixel u 약 209 에 찍힙니다.'],
        [14, 21, '높이 0.05 m 를 가정한 pipeline 은 (0.189, 0, 0.05) 를 내서, 앞뒤로 1.1 cm 틀리고 높이로 5 cm 틀립니다.'],
        [21, 27.7, 'gripper 는 윗면보다 5 cm 아래로 가려다 cube 를 누릅니다. depth camera 는 0.45 m 를 직접 재서 맞습니다.'],
      ],
    },
    {
      id: 'pause-backproject',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. pixel (420, 290) 의 depth 가 0.5 m 라면 이 점의 base frame 좌표는 무엇일까요?'],
        [
          16.5,
          23.5,
          'camera 좌표는 (0.1, 0.05, 0.5) 이고 base 로 옮기면 (0.4, −0.05, 0.05), 로봇 앞 40 cm 입니다.',
        ],
      ],
    },
    {
      id: 'waypoints',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'top-down grasp 에서 grasp pose 의 손끝은 cube 가운데 (0.20, 0, 0.025) 이고, 방향은 10° 입니다.'],
        [
          6.5,
          13,
          '손가락은 7 cm 까지 벌어지고 cube 는 5 cm 라서 양쪽 여유는 (7 − 5) ÷ 2 로 1 cm 이고, 이것이 오차 한도입니다.',
          '손가락은 7 cm 까지 벌어지고 cube 는 5 cm 라서 양쪽 여유는 7 빼기 5 를 2 로 나눈 1 cm 이고, 이것이 오차 한도입니다.',
        ],
        [13, 19, 'cube 위 0.2 m 의 pre-grasp 에서 멈췄다가 수직으로 내려가며, waypoint 는 retreat 까지 여섯 개입니다.'],
        [19, 25.5, '팔 길이 합은 0.4 m 라서, 놓을 자리를 0.40 m 로 옮기면 손목까지 약 0.447 m 가 되어 IK 가 실패합니다.'],
        [25.5, 31.7, 'IK 답이 여럿이면 앞 waypoint 의 joint angle 에 가까운 답을 골라, 그 사이에서 팔이 크게 뒤집히지 않게 합니다.'],
      ],
    },
    {
      id: 'path',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 7, 'joint angle 을 2 초 동안 minimum-jerk 로 이으면 손끝이 휘어, 1 초에 곧은 경로에서 2.5 cm 벗어납니다.'],
        [7, 14.5, 'cube 윗면 높이에서도 1.2 cm 벗어나 여유 1 cm 를 넘으니, cube 근처는 Cartesian path 로 곧게 내려갑니다.'],
        [
          14.5,
          22,
          'MTC 의 generator 가 π/12 마다 grasp pose 후보 24 개를 내면, IK 를 풀어 답이 없는 후보를 버립니다.',
          'MTC 의 generator 가 십이 분의 파이마다 grasp pose 후보 24 개를 내면, IK 를 풀어 답이 없는 후보를 버립니다.',
        ],
        [22, 29.7, 'propagator 가 approach 와 lift 를 구하고, connector 가 그 사이를 OMPL 로 잇습니다.'],
      ],
    },
    {
      id: 'pause-mtc',
      seconds: 24,
      section: S3,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 간격을 π/6 으로 바꾸면 한 바퀴 후보는 몇 개이고, IK 답을 8 개까지 구하면 최대 몇 개일까요?',
          '멈추고 적어 보기. 간격을 육 분의 파이로 바꾸면 한 바퀴 후보는 몇 개이고, IK 답을 8 개까지 구하면 최대 몇 개일까요?',
        ],
        [
          16.5,
          23.5,
          '2π ÷ (π/6) 으로 후보는 12 개이고, 후보마다 최대 8 개라서 12 × 8 로 96 개까지 나올 수 있습니다.',
          '이 파이를 육 분의 파이로 나누면 후보는 12 개이고, 후보마다 최대 8 개라서 12 × 8 로 96 개까지 나올 수 있습니다.',
        ],
      ],
    },
    {
      id: 'budget',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, '뒤 module 은 앞 module 의 오차를 알 수 없어서, IK 는 틀린 자리의 joint angle 을 정확히 풀어 버립니다.'],
        [6.5, 13.5, 'depth 0.5 m 에서 1 pixel 은 0.5 ÷ 500 으로 0.001 m 라서, 2 pixel 밀린 인식은 2 mm 틀립니다.'],
        [13.5, 20.5, 'calibration 과 실행이 3 mm 씩 더해 8 mm 가 되고, 여유 10 mm 를 나눠 주는 이 계산이 error budget 입니다.'],
        [20.5, 27.7, '카메라가 2° 기울면 314 × 2 ÷ 360 으로 약 1.7 cm 가 더해져 합이 25 mm 가 되고, 여유를 넘습니다.'],
      ],
    },
    {
      id: 'failures',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '50 번에 41 번 성공하면 82% 이고, 실패 9 번은 인식 4 번, IK 2 번, grasp 2 번, 충돌 1 번입니다.'],
        [6.5, 12.5, '인식 실패가 가장 많으니 인식부터 고칩니다. 그 4 번이 성공으로 바뀌면 45 ÷ 50 으로 성공률은 90% 가 됩니다.'],
        [12.5, 19, 'Amazon Picking Challenge 설문의 어려움 점수 평균도 인식이 4.52 로 가장 높고 grasping 이 4.36 이었습니다.'],
        [19, 25.5, 'end-to-end 는 시연으로 network 하나를 학습하고, Levine 등의 CNN 은 영상에서 motor torque 까지 냈습니다.'],
        [25.5, 31.7, '모듈 pipeline 은 중간 값으로 고장을 찾지만 물체가 바뀌면 규칙을 다시 짜고, end-to-end 는 시연을 다시 모읍니다.'],
      ],
    },
    {
      id: 'pause-fail',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 40 번에 30 번 성공했고 실패 10 번 중 grasp 실패가 6 번입니다. 지금 성공률과 고친 뒤 성공률은?'],
        [16.5, 23.5, '지금은 30 ÷ 40 으로 75% 이고, grasp 실패 6 번을 고치면 성공이 36 번이라 36 ÷ 40 으로 90% 가 됩니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 여섯 module 의 입력과 출력을 정해 두면, 인식이 낸 pixel 같은 중간 값을 하나씩 확인할 수 있습니다.'],
        [4.2, 8.2, 'depth 0.5 m 로 (0.20, 0, 0.05) 를 구하고, 높이 가정이 틀리면 가로 위치와 높이가 함께 틀립니다.'],
        [8.2, 12.2, 'joint angle 만 이으면 손끝이 1.2 cm 휘어서, cube 근처는 Cartesian path 로 곧게 움직입니다.'],
        [
          12.2,
          15.7,
          '오차는 더해져 2 + 3 + 3 으로 8 mm 가 1 cm 여유를 나눠 쓰고, 실패를 module 별로 세면 고칠 곳이 정해집니다.',
          '오차는 더해져 2 더하기 3 더하기 3 으로 8 mm 가 1 cm 여유를 나눠 쓰고, 실패를 module 별로 세면 고칠 곳이 정해집니다.',
        ],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '둥근 물체나 처음 보는 물체에서 손가락을 어디에 어느 방향으로 대야 하는지는 Grasp Planning 에서 다룹니다.'],
        [3.6, 6.6, '사람이 짠 규칙 없이 시연에서 배우는 방법은 Behavior Cloning 에서 다루니, 다음 강의로 이어서 보세요.'],
      ],
    },
  ],
}
