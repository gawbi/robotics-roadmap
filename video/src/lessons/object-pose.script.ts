import type { VideoScript } from '../script.ts'

// Numbers follow lessons/object-pose/README.md: the mug's handle at (0.07, 0, 0) m, the example camera at base (0.3, 0, 0.55)
// looking down with f = 500 and principal point (320, 240), the cup centre at base (0.20, 0, 0.05) = camera t = (−0.1, 0, 0.5) →
// pixel (220, 240) (u = 500 × (−0.1 ÷ 0.5) + 320 = 220); cup A's x axis (1, 0, 0) → handle (−0.03, 0, 0.5) → (290, 240), cup
// B's 90° turn (0, −1, 0) → (−0.1, −0.07, 0.5) → (220, 170), handles √(0.07² + 0.07²) ≈ 0.099 m ≈ 10 cm apart; the output
// table (2D box 4, 3D point 3, point + yaw 4, 6D pose 6); the check question's 180° cup (−1, 0, 0) → (−0.17, 0, 0.5) →
// u = 500 × (−0.17 ÷ 0.5) + 320 = 150 → (150, 240). PnP: the 20 × 6 × 4 cm box 0.5 m away, corner (0.10, −0.03, 0.50) →
// (420, 210) vs the detected (423, 214), √(3² + 4²) = 5 pixel; depth 500 × 0.2 ÷ 0.5 = 200 pixel, 198 pixel → 500 × 0.2 ÷ 198
// ≈ 0.505 m (5 mm), sideways 0.5 ÷ 500 = 0.001 m (1 mm), Joyce et al. (2025) > 80% of translation error along the line of
// sight; the check question at 1.0 m (100 pixel, 98 → ≈ 1.020 m ≈ 2 cm, 1.0 ÷ 500 = 0.002 m, 4× for 2× distance). RANSAC:
// 140² = 19,600 vs 5² = 25, solvePnPRansac draws 5 with threshold 8 pixel (8 × 0.5 ÷ 500 = 0.008 m), w = 0.7 / 0.5 / 0.3 →
// w⁵ 0.168 / 0.031 / 0.0024 → 25 / 145 / 1,893 draws for 99%, 100 draws → 99% 이상 / 95.8% / 21.6%. ICP: model pins 0, 2, 4,
// 6 cm, observed 3, 5, 7, 9 cm; start 2.2 → +0.8 → 3.0; start 1.0 → +2, 0, 0, 0 → +0.5 → 1.5 → 0 (stops, RMS ≈ 0.87 cm),
// basin 2 ~ 4 cm. Metrics: ADD threshold 10% of diameter; the box turned 180°: (10, 3, 2) → (−10, −3, 2), 2 × √(10² + 3²)
// ≈ 20.9 cm, diameter √(20² + 6² + 4²) ≈ 21.3 cm, threshold 2.13 cm, ADD-S 0; PoseCNN's bowl ADD AUC 6.5 vs ADD-S 69.7,
// 21 objects 53.7 → 79.3 with ICP; the ADD-S misconception 5 × 3 ÷ 100 = 0.15 cm; the mug's MSSD 14 cm; MSSD thresholds 5%
// ~ 50% of diameter (10), MSSD 3 cm passes from 3.19 cm (15%): 8 ÷ 10 = 0.8; check: MSSD 5 cm → from 5.32 cm (25%), 6 ÷ 10
// = 0.6; BOP best AR 56.9 (2017) → 85.6 (2023), unseen 67.4 (2023) → 82.1 (2024, FreeZeV2.1) at 24.9 s an image, 7 datasets.
// Learned: PoseCNN (RSS 2018, 21 YCB objects, 92 videos, 133,827 frames), DOPE (CoRL 2018, 8 + 1 = 9 belief maps, ≥ 4
// corners), DOPE's sugar box 66.64 (DR 30만 장) / 62.94 (photorealistic 60만 장) / 77.00 (mixed 12만 장), Baxter 49 of 60,
// retraining 몇 시간 ~ 며칠 (MegaPose). Render-and-compare: DeepIM 4 refinements 62.7% → 88.6% on LINEMOD; MegaPose 5 × 104 =
// 520 hypotheses, ≈ 50 ms a refinement, ≈ 2.5 s for the 520; FoundationPose 42 × 6 = 252 (paper 42 × 12 = 504), 160×160
// crop, 5 refinements, 512-number score vector, ≈ 1.3 s (4 ms + 0.88 s + 0.42 s, RTX 3090), ≈ 32 Hz tracking, AR 83.3 vs
// MegaPose RGB-D 58.6, Isaac ROS refine_iterations 3. Grasp: T_bg = T_bc · T_co · T_og, cup A (−0.03, 0, 0.5) → (X, −Y, −Z) →
// (−0.03, 0, −0.5) + (0.3, 0, 0.55) = (0.27, 0, 0.05), cup B → (0.20, 0.07, 0.05), check (−0.17, 0, 0.5) → (0.13, 0, 0.05);
// 0.07 × tan 5° ≈ 0.0061 m ≈ 6.1 mm, 10° ≈ 12 mm > 1 cm.

const S1 = '6D pose 와 두 컵'
const S2 = 'PnP · RANSAC · ICP'
const S3 = '대칭과 BOP 의 AR'
const S4 = 'refiner 와 grasp'

export const script: VideoScript = {
  id: 'object-pose',
  title: '6D Object Pose',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/object-pose',
  sections: [S1, S2, S3, S4],
  terms: [
    ['hand-eye calibration', '핸드 아이 캘리브레이션'],
    ['domain randomization', '도메인 랜더마이제이션'],
    ['basin of attraction', '베이슨 오브 어트랙션'],
    ['render-and-compare', '렌더 앤드 컴페어'],
    ['reprojection error', '리프로젝션 에러'],
    ['Behavior Cloning', '비헤이비어 클로닝'],
    ['Motion Planning', '모션 플래닝'],
    ['principal point', '프린시펄 포인트'],
    ['FoundationPose', '파운데이션포즈'],
    ['instance-level', '인스턴스 레벨'],
    ['local minimum', '로컬 미니멈'],
    ['bounding box', '바운딩 박스'],
    ['hypothesis', '하이포시시스'],
    ['YCB-Video', '와이씨비 비디오'],
    ['sugar box', '슈거 박스'],
    ['translation', '트랜슬레이션'],
    ['simulation', '시뮬레이션'],
    ['rotation', '로테이션'],
    ['MegaPose', '메가포즈'],
    ['tracking', '트래킹'],
    ['keypoint', '키포인트'],
    ['detector', '디텍터'],
    ['diameter', '다이아미터'],
    ['LINEMOD', '라인모드'],
    ['PoseCNN', '포즈 씨엔엔'],
    ['gripper', '그리퍼'],
    ['network', '네트워크'],
    ['refiner', '리파이너'],
    ['basin', '베이슨'],
    ['outlier', '아웃라이어'],
    ['inlier', '인라이어'],
    ['OpenCV', '오픈 씨브이'],
    ['DeepIM', '딥 아이엠'],
    ['camera', '카메라'],
    ['object', '오브젝트'],
    ['render', '렌더'],
    ['recall', '리콜'],
    ['Joyce', '조이스'],
    ['frame', '프레임'],
    ['model', '모델'],
    ['pixel', '픽셀'],
    ['depth', '뎁스'],
    ['grasp', '그래스프'],
    ['ADD-S', '에이디디 에스'],
    ['RANSAC', '랜색'],
    ['MSSD', '엠에스에스디'],
    ['MSPD', '엠에스피디'],
    ['DOPE', '도프'],
    ['pose', '포즈'],
    ['base', '베이스'],
    ['pitch', '피치'],
    ['roll', '롤'],
    ['yaw', '요'],
    ['PnP', '피엔피'],
    ['ICP', '아이씨피'],
    ['ADD', '에이디디'],
    ['AUC', '에이유씨'],
    ['BOP', '비오피'],
    ['VSD', '브이에스디'],
    ['CAD', '캐드'],
    ['AR', '에이알'],
    ['T_bg', '티 비지'],
    ['T_bc', '티 비씨'],
    ['T_co', '티 씨오'],
    ['T_og', '티 오지'],
    ['Δt', '델타 티'],
    ['ΔR', '델타 알'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, '6D object pose 는 카메라에서 본 물체의 rotation 3 개와 translation 3 개, 숫자 6 개입니다.'],
        [4.2, 7.8, '두 컵의 예, PnP·RANSAC·ICP, 대칭 물체의 지표, render-and-compare 와 grasp 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '로봇 팔이 머그컵을 손잡이로 집으려 합니다. detector 와 depth 로 컵 가운데의 3D 위치는 구할 수 있습니다.'],
        [4.4, 7.8, '그런데 같은 자리의 컵도 손잡이가 오른쪽이나 뒤쪽을 향할 수 있습니다. 어느 쪽으로 얼마나 돌아가 있을까요?'],
      ],
    },
    {
      id: 'pose',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, 'CAD model 의 원점과 축이 object frame 입니다. 머그컵은 몸통 가운데가 원점이고 손잡이 쪽이 x 축입니다.'],
        [6.5, 13.5, 'object frame 이 돌아간 방향이 rotation R 이고, 원점의 camera 좌표가 translation t 입니다.'],
        [13.5, 20.5, '둘을 합친 6 개가 6D pose 입니다. 예시 카메라에서 컵 가운데 (−0.1, 0, 0.5) 는 pixel (220, 240) 입니다.'],
        [
          20.5,
          27.5,
          'model 위의 점은 p_c = R p_o + t 로 옮겨집니다. 손잡이는 0.07 × x 축의 camera 방향 + t 입니다.',
          'model 위의 점은 피 씨 는 알 피 오 플러스 티 로 옮겨집니다. 손잡이는 0.07 곱하기 x 축의 camera 방향, 플러스 t 입니다.',
        ],
      ],
    },
    {
      id: 'two-cups',
      seconds: 27,
      section: S1,
      cues: [
        [0.3, 6.5, '컵 A 는 x 축이 (1, 0, 0) 이라서 손잡이는 (−0.03, 0, 0.5), pixel (290, 240) 입니다.'],
        [6.5, 13, '컵 B 는 90° 돌아 x 축이 (0, −1, 0) 입니다. 손잡이는 (−0.1, −0.07, 0.5), pixel (220, 170) 입니다.'],
        [
          13,
          19.5,
          '가운데는 같지만 손잡이는 √(0.07² + 0.07²) ≈ 0.099 m, 약 10 cm 떨어져 있습니다.',
          '가운데는 같지만 손잡이는 루트 0.07 제곱 더하기 0.07 제곱, 약 0.099 m, 약 10 cm 떨어져 있습니다.',
        ],
        [19.5, 26.5, '3D 점 하나로는 두 컵이 구별되지 않습니다. 3D 점에 yaw 를 더한 4 개도 기울거나 누운 자세는 모릅니다.'],
      ],
    },
    {
      id: 'pause-pose',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 컵이 180° 돌아 손잡이가 사진 왼쪽을 향합니다. 손잡이의 camera 좌표와 pixel 은?'],
        [
          16.5,
          23.5,
          '손잡이는 (−0.17, 0, 0.5) 이고, u 는 500 × (−0.17 ÷ 0.5) + 320 = 150 입니다.',
          '손잡이는 (−0.17, 0, 0.5) 이고, u 는 500 곱하기, 괄호 −0.17 나누기 0.5, 더하기 320 은 150 입니다.',
        ],
      ],
    },
    {
      id: 'pnp',
      seconds: 28,
      section: S2,
      cues: [
        [
          0.3,
          6.5,
          '3D 점과 그 점이 찍힌 pixel 의 짝이 2D–3D 대응입니다. PnP 는 이 대응 여러 개로 R 과 t 를 풉니다.',
          '3D 점과 그 점이 찍힌 pixel 의 짝이 이디 삼디 대응입니다. PnP 는 이 대응 여러 개로 R 과 t 를 풉니다.',
        ],
        [6.5, 13, '꼭짓점을 지금 pose 로 투영하면 (420, 210) 인데 detector 는 (423, 214) 에서 찾았습니다.'],
        [
          13,
          19.5,
          'reprojection error 는 √(3² + 4²) = 5 pixel 입니다. PnP 는 이 제곱 합이 가장 작은 R 과 t 를 찾습니다.',
          'reprojection error 는 루트 3 제곱 더하기 4 제곱, 5 pixel 입니다. PnP 는 이 제곱 합이 가장 작은 R 과 t 를 찾습니다.',
        ],
        [19.5, 27.5, '200 pixel 인 20 cm 변이 198 로 잡히면 depth 가 5 mm 틀리지만, 옆 1 pixel 은 1 mm 입니다.'],
      ],
    },
    {
      id: 'ransac-icp',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '틀린 짝인 outlier 가 섞입니다. 140 pixel 틀린 하나의 제곱 19,600 은 5 pixel 틀린 수백 개의 25 보다 큽니다.'],
        [6.5, 13, 'RANSAC 은 대응 5 개만 뽑아 pose 를 구하고 8 pixel 안의 inlier 를 셉니다. 되풀이해 가장 많은 쪽을 고릅니다.'],
        [13, 19.5, 'inlier 비율 0.7, 0.5, 0.3 이면 25, 145, 1,893 번을 뽑아야 합니다. 상한 100 번이면 21.6% 까지 떨어집니다.'],
        [19.5, 25.5, 'depth 가 있으면 ICP 를 씁니다. model 점마다 가장 가까운 관측 점을 짝짓고 겹치게 옮기기를 되풀이합니다.'],
        [
          25.5,
          31.7,
          '2.2 cm 에서 출발하면 참값 3.0 에 닿지만 1.0 에서 출발하면 1.5 에서 멈춥니다. basin 은 2 ~ 4 cm 입니다.',
          '2.2 cm 에서 출발하면 참값 3.0 에 닿지만 1.0 에서 출발하면 1.5 에서 멈춥니다. basin 은 2 에서 4 cm 입니다.',
        ],
      ],
    },
    {
      id: 'pause-pnp',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 상자가 1.0 m 앞이면 20 cm 변은 몇 pixel 이고, 1 pixel 씩 안쪽이면 depth 는 얼마나 틀릴까요?'],
        [16.5, 23.5, '100 pixel 로 찍히고, 98 pixel 이면 약 1.020 m 라서 약 2 cm 틀립니다. 거리 2 배에 오차는 4 배입니다.'],
      ],
    },
    {
      id: 'symmetry',
      seconds: 31,
      section: S3,
      cues: [
        [0.3, 6.5, 'ADD 는 model 점을 정답과 추정 pose 로 옮겨 같은 점끼리의 거리를 평균합니다. 문턱은 diameter 의 10% 입니다.'],
        [6.5, 13, '무늬 없는 상자를 180° 돌리면 꼭짓점 (10, 3, 2) cm 가 (−10, −3, 2) 로 약 20.9 cm 옮겨집니다.'],
        [13, 19.5, 'ADD 20.9 cm 는 문턱 2.13 cm 를 넘어 틀렸다고 판정됩니다. 가장 가까운 점과 재는 ADD-S 는 0 입니다.'],
        [19.5, 25, 'PoseCNN 의 결과에서 대칭인 그릇은 ADD 의 AUC 가 6.5 였지만 ADD-S 의 AUC 는 69.7 이었습니다.'],
        [25, 30.7, 'ADD-S 가 작다고 grasp 에 쓸 pose 는 아닙니다. 손잡이 점 5 개만 3 cm 어긋나도 ADD-S 는 0.15 cm 입니다.'],
      ],
    },
    {
      id: 'bop',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'BOP 는 MSSD, MSPD, VSD 를 씁니다. MSSD 는 대칭을 고려한 점 거리의 최댓값이라서 손잡이가 반대면 14 cm 입니다.'],
        [7, 13.5, 'AR 은 여러 문턱의 recall 을 평균한 값입니다. MSSD 의 문턱은 diameter 의 5% 에서 50% 까지 10 개입니다.'],
        [13.5, 20.5, 'MSSD 3 cm 인 추정은 문턱 1.06, 2.13 cm 는 통과하지 못하고 3.19 cm 부터 8 개를 통과해 0.8 을 받습니다.'],
        [20.5, 27.5, '최고 AR 은 2017 년 56.9 에서 2023 년 85.6 으로 올랐고, 처음 보는 물체는 82.1 이지만 한 장에 24.9 초입니다.'],
      ],
    },
    {
      id: 'pause-ar',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 같은 상자의 추정이 MSSD 5 cm 입니다. 문턱 10 개 중 몇 개를 통과해 AR 에 얼마를 보탤까요?'],
        [16.5, 23.5, '5 cm 보다 큰 문턱은 25% 인 5.32 cm 부터 50% 까지 6 개입니다. 6 ÷ 10 이라서 0.6 을 보탭니다.'],
      ],
    },
    {
      id: 'render-compare',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, 'PoseCNN 과 DOPE 는 합성 데이터로 학습한 instance-level 방법이라서 새 물체마다 다시 학습합니다.'],
        [6.5, 13, 'sugar box 는 domain randomization 만 30만 장이면 66.64, 둘을 섞은 12만 장이면 77.00 이었습니다.'],
        [13, 19.5, 'render-and-compare 는 render 와 사진을 refiner 에 넣어 고칠 양 Δt, ΔR 을 내고 다시 그립니다.'],
        [19.5, 26, 'DeepIM 은 4 번 고쳐 정답률을 62.7% 에서 88.6% 로 올렸고, MegaPose 는 처음 보는 물체로 넓혔습니다.'],
        [26, 31.7, 'FoundationPose 는 hypothesis 252 개로 약 1.3 초에 pose 를 내고, tracking 은 약 32 Hz 입니다.'],
      ],
    },
    {
      id: 'grasp',
      seconds: 28,
      section: S4,
      cues: [
        [
          0.3,
          7,
          'grasp 는 CAD model 위에서 T_og 로 정해 둡니다. base 에서는 T_bg = T_bc · T_co · T_og 입니다.',
          'grasp 는 CAD model 위에서 T_og 로 정해 둡니다. base 에서는 T_bg, 곧 T_bc, T_co, T_og 를 차례로 곱한 것입니다.',
        ],
        [7, 13, 'T_bc 는 base 에서 본 카메라의 pose 로 hand-eye calibration 으로 구하고, T_co 는 추정기가 냅니다.'],
        [
          13,
          20,
          '컵 A 의 손잡이는 축을 (X, −Y, −Z) 로 바꾸고 (0.3, 0, 0.55) 를 더해 base 의 (0.27, 0, 0.05) 입니다.',
          '컵 A 의 손잡이는 축을 엑스, 마이너스 와이, 마이너스 지 로 바꾸고 (0.3, 0, 0.55) 를 더해 base 의 (0.27, 0, 0.05) 입니다.',
        ],
        [20, 27.5, 'rotation 오차는 grasp 점까지의 거리를 곱한 만큼 위치 오차가 됩니다. 7 cm 손잡이는 5° 면 약 6.1 mm 입니다.'],
      ],
    },
    {
      id: 'pause-grasp',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 손잡이의 camera 좌표가 (−0.17, 0, 0.5) 인 컵의 손잡이는 base frame 의 어디일까요?'],
        [16.5, 23.5, '축을 바꾸면 (−0.17, 0, −0.5) 이고, (0.3, 0, 0.55) 를 더하면 (0.13, 0, 0.05) 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '6D pose 는 rotation 3 개와 translation 3 개이고, 가운데가 같은 두 컵의 손잡이도 약 10 cm 떨어집니다.'],
        [4.2, 8.1, 'PnP 는 depth 에 약하고, RANSAC 은 inlier 0.5 면 145 번이 필요하고, ICP 는 basin 안에서 출발해야 합니다.'],
        [8.1, 12, '180° 돈 상자의 ADD 는 20.9 cm 라서 대칭 물체에는 ADD-S 나 BOP 의 MSSD 를 쓰고, AR 로 비교합니다.'],
        [12, 15.7, 'FoundationPose 는 처음 보는 물체를 약 1.3 초에 추정하고, grasp 는 T_bg 사슬로 base 로 옮깁니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '다음은 grasp 까지 팔을 옮기는 Motion Planning 과, 사진에서 바로 action 을 내는 Behavior Cloning 입니다.'],
      ],
    },
  ],
}
