import type { VideoScript } from '../script.ts'

// Numbers follow lessons/hand-eye-calibration/README.md and its figures: the opening puzzle (camera 1 mm, FK 1 mm, 1 cm off);
// the lever arm (translation 3 mm → 3 mm; 1° at 0.5 m: 0.5 × tan 1° = 0.5 × 0.01746 ≈ 0.0087 m ≈ 8.7 mm; table 0.5° / 1° / 2°
// at 0.3 / 0.5 / 1.0 m: 2.6 4.4 8.7 / 5.2 8.7 17.5 / 10.5 17.5 34.9 mm; 50 mm mount 50 × tan 1° ≈ 0.87 mm; figure angle 6×;
// Classical Pick & Place 2° → 1.7 cm); pixel size Z ÷ f with f = 500 pixel: 1 mm at 0.5 m, 0.5 mm at 0.25 m; check question
// 0.8 × tan 0.5° = 0.8 × 0.00873 ≈ 0.0070 m ≈ 7 mm (0.3 m → 2.6 mm); AX = XB from poses 1 and 2, N(N−1)/2 pairs, 10 poses →
// 45; Shiu & Ahmad 1989, Tsai & Lenz 1989; rotation axes (30°, a₁ (1, 0, 0) ↔ b₁ (0, −1, 0), a₂ (0, 1, 0) ↔ b₂ (1, 0, 0), R_X
// = 90° about z); ≥ 2 non-parallel motions = ≥ 3 poses; one-axis 10 poses → 45 motions, rotation ≈ 90° and translation
// 1 ~ 1.4 m off; translation-only 10 poses → Tsai fails, Park > 100° off; 90° about z → (−x − y, x − y, 0); simulation
// (camera y 7 cm, z 5 cm, 90° about z, target 0.4 m below, ±s°; target pose noise 0.1° / 0.5 mm, FK 0.01° / 0.1 mm; OpenCV
// 4.14, 300 runs, median); Park translation error by pose count (±30°) 3.57 / 1.84 / 1.18 / 0.88 / 0.75 mm for 3 / 5 / 10 /
// 15 / 20, by range (10 poses) 6.83 / 3.38 / 1.72 / 1.17 / 0.77 mm for ±5 / 10 / 20 / 30 / 45°; table rows (Tsai / Park /
// Daniilidis, ±30°): 3: 0.37° 3.27 / 0.37° 3.57 / 0.35° 3.32; 5: 0.22° 1.98 / 0.20° 1.84 / 0.22° 2.08; 10: 0.13° 1.17 /
// 0.13° 1.18 / 0.14° 1.30; 20: 0.10° 0.75 / 0.08° 0.75 / 0.10° 0.85 mm; ±5° Tsai fails; OpenCV 4.10 (2024) Tsai drops pairs
// under ≈ 17° or over ≈ 116°, < 2 pairs left → identity rotation and 0 translation; MoveIt Calibration from 5 poses, 12 ~ 15
// plateau; easy_handeye2 ±25° and 0.1 m; ArUco board 3 × 4 (DICT_5X5_250); check 12 × 11 ÷ 2 = 66; solvers Tsai-Lenz 1989,
// Park-Martin 1994, Daniilidis 1999; IBM 90 ms per pose, rotation 10× more accurate; Park simulation improves fast up to ≈ 10
// measurements; ±5° → ±30° cuts translation error by ≈ 6 mm vs solver gaps of 0.1 mm order; Enebuse et al. 2022 (UR5e, Azure
// Kinect, 101 poses); validation (10 new poses: rms 0.79 mm, 1° rotation → 2.59 mm, 5 mm translation → 1.96 mm; 0.4 × tan 1°
// ≈ 7.0 mm); MoveIt sample 5 → result; optical frame mistakes in 90° steps; check f = 600, 0.3 m, 2 pixel: 0.3 ÷ 600 =
// 0.0005 m, 2 × 0.5 = 1 mm; summary 10 ~ 15 poses.

const S1 = '자로 잴 수 없는 X'
const S2 = 'AX = XB 와 회전 축'
const S3 = '자세 수집과 solver'
const S4 = '검증과 tf'

export const script: VideoScript = {
  id: 'hand-eye-calibration',
  title: 'Hand-Eye Calibration',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/hand-eye-calibration',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Hand-Eye Calibration', '핸드 아이 캘리브레이션'],
    ['MoveIt Calibration', '무브잇 캘리브레이션'],
    ['calibrateHandEye', '캘리브레이트 핸드 아이'],
    ['publish.launch.py', '퍼블리시 런치 파이'],
    ['dual quaternion', '듀얼 쿼터니언'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['easy_handeye2', '이지 핸드아이 투'],
    ['simultaneous', '사이멀테이니어스'],
    ['optical frame', '옵티컬 프레임'],
    ['camera frame', '카메라 프레임'],
    ['eye-to-hand', '아이 투 핸드'],
    ['eye-in-hand', '아이 인 핸드'],
    ['Park-Martin', '파크 마틴'],
    ['camera_link', '카메라 링크'],
    ['translation', '트랜슬레이션'],
    ['point cloud', '포인트 클라우드'],
    ['touch test', '터치 테스트'],
    ['Daniilidis', '다닐리디스'],
    ['separable', '세퍼러블'],
    ['Tsai-Lenz', '차이 렌츠'],
    ['transform', '트랜스폼'],
    ['simulation', '시뮬레이션'],
    ['rotation', '로테이션'],
    ['tutorial', '튜토리얼'],
    ['gripper', '그리퍼'],
    ['overlay', '오버레이'],
    ['AX = XB', '에이엑스 이퀄 엑스비'],
    ['OpenCV', '오픈 씨브이'],
    ['marker', '마커'],
    ['target', '타깃'],
    ['camera', '카메라'],
    ['solver', '솔버'],
    ['sample', '샘플'],
    ['parent', '페어런트'],
    ['child', '차일드'],
    ['panel', '패널'],
    ['noise', '노이즈'],
    ['pixel', '픽셀'],
    ['frame', '프레임'],
    ['depth', '뎁스'],
    ['RViz', '알비즈'],
    ['base', '베이스'],
    ['pose', '포즈'],
    ['mesh', '메시'],
    ['tool', '툴'],
    ['Tsai', '차이'],
    ['Park', '파크'],
    ['tan', '탄젠트'],
    ['rms', '알엠에스'],
    ['SVD', '에스브이디'],
    ['PnP', '피엔피'],
    ['FK', '에프케이'],
    ['tf', '티에프'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Hand-Eye Calibration 은 로봇을 여러 자세로 움직여 카메라와 gripper 사이의 transform 을 계산하는 일입니다.'],
        [4.2, 7.8, '자로 잴 수 없는 X, AX = XB 와 회전 축, 자세 수집과 solver, 검증과 tf 를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '손목 카메라로 잰 marker 위치는 1 mm 안에서 맞고, 관절 각도로 계산한 gripper 위치도 1 mm 안에서 맞습니다.'],
        [4.4, 7.8, '그런데 gripper 를 marker 자리로 보내면 1 cm 가까이 옆에 내려앉습니다. 1 cm 는 어디서 생긴 걸까요?'],
      ],
    },
    {
      id: 'chain',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'base 에서 본 target pose 는 gripper pose 와 X, camera 에서 본 target pose 를 차례로 곱한 값입니다.'],
        [6.5, 12.5, 'gripper 의 pose 는 관절 각도로 FK 를 계산해 얻고, camera 에서 본 target pose 는 PnP 로 얻습니다.'],
        [12.5, 18.5, '가운데의 X 는 gripper 에서 본 camera 의 pose 인데, FK 로도 PnP 로도 구할 수 없습니다.'],
        [18.5, 24, 'eye-in-hand 는 손목의 카메라가 책상의 target 을 보며, gripper 에서 camera 까지의 X 를 구합니다.'],
        [24, 29.7, 'eye-to-hand 는 삼각대의 카메라가 gripper 에 단 target 을 보며, base 에서 camera 까지의 X 를 구합니다.'],
      ],
    },
    {
      id: 'lever',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 7, 'X 의 translation 이 3 mm 틀리면 위치도 3 mm 틀리지만, rotation 오차는 거리를 곱한 만큼 커집니다.'],
        [7, 14, '1° 틀린 X 로 0.5 m 앞 물체를 계산하면 0.5 × tan 1° 라서, 약 8.7 mm 옆에 있는 것으로 나옵니다.'],
        [14, 21.5, '같은 1° 라도 0.3 m 앞에서는 5.2 mm 이고 1.0 m 앞에서는 17.5 mm 라서, 멀리 볼수록 중요합니다.'],
        [21.5, 29.7, '50 mm 받침대 끝은 1° 기울어도 약 0.87 mm 만 움직이고 원점은 렌즈 안쪽이라, 자로 잴 수 없습니다.'],
      ],
    },
    {
      id: 'pause-lever',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. X 의 rotation 이 0.5° 틀렸고 물체가 0.8 m 앞에 있으면, 위치는 약 몇 mm 틀릴까요?'],
        [16.5, 23.5, '0.8 × tan 0.5° 는 0.8 × 0.00873 으로 약 0.0070 m, 약 7 mm 입니다. 0.3 m 앞이면 2.6 mm 입니다.'],
      ],
    },
    {
      id: 'axxb',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, 'target 은 base 에 고정되어 있어서, 자세 1 과 자세 2 에서 계산한 base 에서 본 target pose 는 같아야 합니다.'],
        [6.5, 12.5, '두 식을 정리하면 AX = XB 인데, A 는 gripper 가 자세 1 에서 2 로 움직인 양이라 FK 두 번으로 계산합니다.'],
        [12.5, 18.5, 'B 는 그동안 camera 가 움직인 양이라 사진 두 장의 target pose 로 계산하고, target 의 위치는 식에 남지 않습니다.'],
        [18.5, 24.5, 'X 를 rotation 과 translation 으로 나누면, rotation 식에는 translation 이 없어서 먼저 풀 수 있습니다.'],
        [
          24.5,
          29.7,
          '자세가 N 개면 두 자세씩 짝지은 움직임이 N(N−1)/2 개라서, 자세가 10 개면 움직임은 45 개입니다.',
          '자세가 N 개면 두 자세씩 짝지은 움직임이 N 곱하기 N 빼기 1 을 2 로 나눈 개수라서, 자세가 10 개면 움직임은 45 개입니다.',
        ],
      ],
    },
    {
      id: 'axes',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, '카메라는 gripper 에 단단히 붙어 있어서 gripper 가 30° 돌면 카메라도 30° 돌고, 축을 적는 좌표만 다릅니다.'],
        [
          6.5,
          13,
          'gripper 의 (1, 0, 0) 축을 camera 는 (0, −1, 0) 축으로 보고, 이 짝을 잇는 값이 X 의 rotation 입니다.',
          'gripper 의 일, 영, 영 축을 camera 는 영, 마이너스 일, 영 축으로 보고, 이 짝을 잇는 값이 X 의 rotation 입니다.',
        ],
        [13, 19.5, '축의 짝이 하나뿐이면 그 축으로 더 돈 각도가 정해지지 않아서, 축이 평행하지 않은 움직임이 두 개 필요합니다.'],
        [19.5, 24.5, '움직임 두 개는 자세 세 개에서 나오므로, OpenCV 문서도 자세가 적어도 3 개 필요하다고 적습니다.'],
        [24.5, 29.7, 'translation 만 하면 카메라가 어디에 달렸든 같은 화살표만큼 옮겨져서, X 의 translation 을 구할 수 없습니다.'],
      ],
    },
    {
      id: 'pause-axis',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 모든 자세를 gripper 의 z 축 회전으로만 만들었다면, X 의 어느 부분을 알 수 없을까요?'],
        [16.5, 23.5, 'translation 은 z 성분을 모르고, rotation 도 축의 짝이 하나뿐이라 z 축으로 얼마나 더 돌았는지 모릅니다.'],
      ],
    },
    {
      id: 'poses',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'simulation 에서 사진의 noise 는 0.1°, 0.5 mm 이고, FK 의 noise 는 0.01°, 0.1 mm 입니다.'],
        [
          6.5,
          13,
          '±30° 로 기울이면 Park 의 translation 오차는 자세 3 개에서 3.57 mm 이고, 20 개에서 0.75 mm 입니다.',
        ],
        [
          13,
          19.5,
          '자세가 10 개라도 ±5° 면 6.83 mm 가 틀리고 ±45° 면 0.77 mm 라서, 회전 범위를 먼저 챙깁니다.',
        ],
        [
          19.5,
          26,
          'OpenCV 4.10 부터 Tsai 구현은 회전이 약 17° 보다 작거나 약 116° 보다 큰 짝을 버려서 ±5° 에서 실패합니다.',
          'OpenCV 사 점 십 부터 Tsai 구현은 회전이 약 17° 보다 작거나 약 116° 보다 큰 짝을 버려서 ±5° 에서 실패합니다.',
        ],
        [
          26,
          31.7,
          'MoveIt Calibration 은 자세 5 개부터 계산하는데, 보통 12 ~ 15 개에서 더 나아지지 않습니다.',
          'MoveIt Calibration 은 자세 5 개부터 계산하는데, 보통 십이에서 십오 개에서 더 나아지지 않습니다.',
        ],
      ],
    },
    {
      id: 'solvers',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'Tsai-Lenz 와 Park-Martin 은 rotation 부터 구하고 translation 을 구하는 separable 방법입니다.'],
        [7, 14, 'Daniilidis 는 dual quaternion 으로 둘을 SVD 로 함께 구하는 simultaneous 방법입니다.'],
        [14, 21, 'OpenCV 의 기본 solver 는 Tsai-Lenz 이고, MoveIt Calibration 은 Daniilidis 를 기본으로 씁니다.'],
        [21, 27.7, 'solver 사이 차이는 0.1 mm 단위지만, 범위를 ±5° 에서 ±30° 로 넓히면 오차가 약 6 mm 줄어듭니다.'],
      ],
    },
    {
      id: 'pause-pairs',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 자세를 12 개 모았다면, OpenCV 구현이 쓰는 자세 짝인 움직임은 몇 개일까요?'],
        [16.5, 23.5, '12 개에서 두 개씩 고르는 경우의 수라서 12 × 11 ÷ 2 로 66 개입니다. 다만 Tsai 구현은 일부를 버립니다.'],
      ],
    },
    {
      id: 'validate',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'target 은 움직이지 않았으므로 자세마다 base 에서 본 target 위치를 계산하면 같은 자리가 나와야 합니다.'],
        [7, 14.5, '새 자세 10 개에서 맞는 X 는 rms 0.79 mm 퍼지고, rotation 이 1° 틀린 X 는 2.59 mm 퍼집니다.'],
        [14.5, 22, '0.4 m 앞에서 1° 는 약 7.0 mm 인데 퍼짐은 2.59 mm 라서, 같은 방향으로 남는 오차는 퍼짐에 안 보입니다.'],
        [22, 29.7, '그래서 touch test 로 계산한 점 위에 뾰족한 tool 을 보내고, tool 끝과 실제 점 사이를 자로 잽니다.'],
      ],
    },
    {
      id: 'tools',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'MoveIt Calibration 과 easy_handeye2 는 둘 다 OpenCV 로 계산해 결과를 tf 에 올립니다.'],
        [7, 14.5, 'MoveIt Calibration 은 RViz panel 에서 sample 을 쌓아, 5 개부터 결과를 내고 계속 갱신합니다.'],
        [14.5, 22, 'easy_handeye2 는 frame 이름 네 개로 tf 를 읽고, 저장한 결과는 publish.launch.py 로 올립니다.'],
        [22, 29.7, 'optical frame 대신 camera_link 를 고르면 90° 단위로 틀어지고, parent 와 child 가 바뀌면 역행렬이 됩니다.'],
      ],
    },
    {
      id: 'pause-pixel',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. f 가 600 pixel 인 카메라로 0.3 m 앞 gripper 끝이 2 pixel 어긋나면 약 몇 mm 일까요?',
          '멈추고 적어 보기. 에프 가 600 pixel 인 카메라로 0.3 m 앞 gripper 끝이 2 pixel 어긋나면 약 몇 mm 일까요?',
        ],
        [
          16.5,
          23.5,
          'pixel 하나는 Z ÷ f 인 0.3 ÷ 600 으로 0.0005 m 라서, 2 pixel 은 2 × 0.5 로 1 mm 입니다.',
          'pixel 하나는 지 나누기 에프 인 0.3 ÷ 600 으로 0.0005 m 라서, 2 pixel 은 2 × 0.5 로 1 mm 입니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 1 cm 는 gripper 에서 본 camera 의 pose X 에서 생기고, 1° 는 0.5 m 앞에서 약 8.7 mm 입니다.'],
        [4.2, 8.2, '두 자세에서 같은 target 을 보면 AX = XB 가 나오고, 축이 평행하지 않은 움직임이 두 개 이상 필요합니다.'],
        [
          8.2,
          12.2,
          '자세 10 ~ 15 개를 크게 돌려 모으는 것이 solver 선택보다 중요해서, 범위가 ±5° 면 6.83 mm 가 틀립니다.',
          '자세 십에서 십오 개를 크게 돌려 모으는 것이 solver 선택보다 중요해서, 범위가 ±5° 면 6.83 mm 가 틀립니다.',
        ],
        [12.2, 15.7, '새 자세의 퍼짐과 touch test 로 검증한 뒤, MoveIt Calibration 이나 easy_handeye2 로 tf 에 올립니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '찾은 물체를 어떤 자세와 너비로 잡아야 미끄러지지 않는지는 다음 강의 Grasp Planning 에서 다룹니다.']],
    },
  ],
}
