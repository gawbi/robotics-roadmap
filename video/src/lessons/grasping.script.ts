import type { VideoScript } from '../script.ts'

// Numbers follow lessons/grasping/README.md: intro (한 변 5 cm 상자; Dex-Net 2.0 합성 데이터 670 만, 0.8 초, 물체 8 개 93%,
// 2017); grasp 표현 (t, a, b, w; 위치 3 + 방향 3 + 폭 1 = 7, 6-DoF, AnyGrasp 7-DoF; classical-pick cube t = (0.20, 0, 0.025) m,
// a = (0, 0, −1), b = (cos 10°, sin 10°, 0), w 7 cm → 5 cm; planar grasp (u, v), φ, z = 4); grippers (Robotiq 2F-85 85 mm,
// 20 ~ 235 N; Dex-Net 3.0 지름 15 mm, 최대 약 0.9 kg; Allegro Hand V3 4 × 4 = 16; suction 30 mm, 60 kPa, π × 0.015² =
// 7.07 × 10⁻⁴ m², 42.4 N; Schmalz 1 kg, 5 m/s², 1 × 14.81 × 1.5 = 22.2 N, μ 0.5, S 2 → 59.2 N; check 20 mm, 50 kPa,
// 3.14 × 10⁻⁴ m², 15.7 N, 1 × 9.81 × 1.5 = 14.7 N); friction cone (μ 0.5 → 26.6°, 20° tan 0.36, 35° tan 0.70; 0.2 / 0.3 / 0.5
// / 1.0 → 11.3 / 16.7 / 26.6 / 45°); antipodal (box 5 cm 0°, 1 cm offsets → arctan(2 ÷ 5) = 21.8°; cylinder r 3 cm, 1.5 cm →
// 30°; d 0.5 / 1 / 1.5 / 2 cm → 9.6 / 19.5 / 30 / 41.8°, μ 0.17 / 0.35 / 0.58 / 0.89); force closure (wrench 6 = 힘 3 +
// torque 3); grip force (2μF ≥ m(g + a) × S; 0.5 kg: 4.9 / 14.8 / 24.7 / 7.4 N, 1.7 배; 5 cm off COM 0.5 × 9.81 × 0.05 =
// 0.245 N·m vs pads 0.049 N·m, 5 분의 1, 73.6 N; AnyGrasp 25 번씩, 16 → 11; check 1 kg, μ 0.4, S 2 → 19.62 ÷ 0.8 = 24.5 N);
// ε (box L1: 0.58 / 0.33 / 0.14 / 0.07 / 0, 약 5 분의 1; Dex-Net μ N(0.5, 0.1) clipped 0 ~ 1); Dex-Net 2.0 (mesh 1,500, antipodal
// 후보 최대 1000, 670 만 쌍, 0.002, 양성 21.2%, parameter 약 1,800 만, conv 4 + fc 3; 93% 0.8 초, 95% 2.6 초, 80% 0.8 초,
// registration 처음 보는 10 개 52%, 40 개 94% 2.5 초); Contact-GraspNet (0.28 초, 51 개, 9 장면, 90.2% vs 80.4%); AnyGrasp
// (93.3%, Dex-Net 4.0 72.2%, 사람 93.9%, 300 여 개; D435 ±5 mm; 철물 81.5%, 과자·인형 100%); pipeline (pre-grasp 0.1 m,
// AnyGrasp 10 cm; MTC angle_delta 기본 0.1 rad, 예제 π / 12 = 15°, 2π ÷ (π / 12) = 24, max_ik_solutions 1 / 8, 0.10 ~ 0.15 m,
// 0.1 ~ 0.3 m; check 2π ≈ 6.28, 6.28 ÷ 0.1 ≈ 63); outro (1°, 0.5 m, 0.5 × tan 1° ≈ 8.7 mm).

const S1 = 'grasp 표현 · gripper'
const S2 = '마찰 · antipodal'
const S3 = 'ε · 학습한 grasp'
const S4 = 'pipeline · 실패'

export const script: VideoScript = {
  id: 'grasping',
  title: 'Grasp Planning',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/grasping',
  sections: [S1, S2, S3, S4],
  terms: [
    ['robust epsilon quality', '로버스트 엡실론 퀄리티'],
    ['robust', '로버스트'],
    ['camera', '카메라'],
    ['MoveIt', '무브잇'],
    ['MoveIt Task Constructor', '무브잇 태스크 컨스트럭터'],
    ['Hand-Eye Calibration', '핸드아이 캘리브레이션'],
    ['multi-finger hand', '멀티 핑거 핸드'],
    ['robot base frame', '로봇 베이스 프레임'],
    ['primitive wrench', '프리미티브 렌치'],
    ['Contact-GraspNet', '컨택트 그래스프넷'],
    ['max_ik_solutions', '맥스 아이케이 솔루션스'],
    ['Motion Planning', '모션 플래닝'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['suction gripper', '석션 그리퍼'],
    ['Ferrari-Canny', '페라리 캐니'],
    ['classical-pick', '클래시컬 픽'],
    ['friction cone', '프릭션 콘'],
    ['force closure', '포스 클로저'],
    ['camera frame', '카메라 프레임'],
    ['parallel-jaw', '패럴렐 조'],
    ['registration', '레지스트레이션'],
    ['depth image', '뎁스 이미지'],
    ['convex hull', '컨벡스 헐'],
    ['angle_delta', '앵글 델타'],
    ['grip force', '그립 포스'],
    ['antipodal', '앤티포달'],
    ['pre-grasp', '프리 그래스프'],
    ['rotation', '로테이션'],
    ['pipeline', '파이프라인'],
    ['AnyGrasp', '애니그래스프'],
    ['Dex-Net', '덱스넷'],
    ['GQ-CNN', '지큐 씨엔엔'],
    ['gripper', '그리퍼'],
    ['suction', '석션'],
    ['clutter', '클러터'],
    ['gravity', '그래비티'],
    ['arctan', '아크탄젠트'],
    ['planar', '플레이너'],
    ['normal', '노멀'],
    ['wrench', '렌치'],
    ['torque', '토크'],
    ['vacuum', '배큐엄'],
    ['6-DoF', '식스 도프'],
    ['2F-85', '투에프 팔십오'],
    ['grasp', '그래스프'],
    ['label', '레이블'],
    ['pixel', '픽셀'],
    ['depth', '뎁스'],
    ['noise', '노이즈'],
    ['frame', '프레임'],
    ['robot', '로봇'],
    ['base', '베이스'],
    ['cube', '큐브'],
    ['mesh', '메시'],
    ['hull', '헐'],
    ['pose', '포즈'],
    ['D435', '디 사삼오'],
    ['kPa', '킬로파스칼'],
    ['rad', '라디안'],
    ['kg', '킬로그램'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
    ['IK', '아이케이'],
    ['N', '뉴턴'],
    ['μ', '뮤'],
    ['φ', '파이'],
    ['π', '파이'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Grasp Planning 은 물체의 어디를 어느 방향으로 얼마나 벌려 쥘지, 쥐어 보기 전에 계산으로 정하는 일입니다.'],
        [4.2, 7.8, 'grasp 표현과 gripper, 마찰과 antipodal, ε 과 학습한 grasp, 실행 pipeline 과 실패를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '한 변 5 cm 상자는 마주 보는 두 면을 쥐면 집히지만, 둥근 과일은 손가락이 닫히는 순간 옆으로 밀려 빠져나갑니다.'],
        [4.4, 7.8, '처음 보는 물체에서 손가락을 어디에 어느 방향으로 대야 미끄러지지 않을지, 쥐기 전에 알 수 있을까요?'],
      ],
    },
    {
      id: 'repr',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'parallel-jaw gripper 의 grasp 는 중심 t, 다가가는 방향 a, 닫히는 방향 b, 폭 w 로 적습니다.'],
        [7, 14, 'a 와 b 를 정하면 rotation 이 정해져서, 위치 3 개, 방향 3 개, 폭 1 개를 합친 숫자 7 개가 됩니다.'],
        [14, 21, 'classical-pick 의 cube 는 t 가 cube 가운데, a 가 수직 아래이고, w 는 7 cm 에서 5 cm 로 닫힙니다.'],
        [21, 27.7, 'planar grasp 는 a 를 수직으로 고정해 pixel (u, v), 각도 φ, depth z 의 4 개만 정합니다.'],
      ],
    },
    {
      id: 'grippers',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6.5, 'parallel-jaw gripper 는 두 접촉을 양쪽에서 눌러 마찰로 버티고, multi-finger hand 는 손가락으로 감쌉니다.'],
        [6.5, 12.5, 'suction gripper 는 한 면을 밀폐해 압력 차이로 당기고, Dex-Net 3.0 은 산업에서 널리 쓰인다고 적었습니다.'],
        [12.5, 18.5, '당기는 힘은 압력 차이 × 컵 넓이라서, 지름 30 mm 컵 안을 60 kPa 낮추면 42.4 N 으로 당깁니다.'],
        [
          18.5,
          24.5,
          '1 kg 물체를 5 m/s² 로 들 때 안전율 1.5 면, 윗면에 댄 컵은 1 × 14.81 × 1.5 로 22.2 N 이면 됩니다.',
          '1 kg 물체를 5 미터 매 제곱초로 들 때 안전율 1.5 면, 윗면에 댄 컵은 1 × 14.81 × 1.5 로 22.2 N 이면 됩니다.',
        ],
        [24.5, 29.7, '옆면에 대면 마찰로 버텨야 해서 μ 0.5, 안전율 2 에서 59.2 N 이 필요해 같은 컵으로는 못 듭니다.'],
      ],
    },
    {
      id: 'pause-suction',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 지름 20 mm 컵에 압력 차이 50 kPa 면 몇 N 일까요? 1 kg 을 안전율 1.5 로 들 수 있을까요?'],
        [
          16.5,
          23.5,
          '넓이가 3.14 × 10⁻⁴ m² 라 힘은 15.7 N 이고, 필요한 힘은 1 × 9.81 × 1.5 로 14.7 N 이라 겨우 지킵니다.',
          '넓이가 3.14 × 10 의 마이너스 4 승 제곱미터라 힘은 15.7 N 이고, 필요한 힘은 1 × 9.81 × 1.5 로 14.7 N 이라 겨우 지킵니다.',
        ],
      ],
    },
    {
      id: 'cone',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          6.5,
          '미끄러지지 않는 조건 T ≤ μN 은, 힘이 normal 에서 기운 각도가 arctan μ 이하라는 조건으로 바뀝니다.',
          '미끄러지지 않는 조건, 티 가 뮤 엔 이하라는 조건은, 힘이 normal 에서 기운 각도가 arctan μ 이하라는 조건으로 바뀝니다.',
        ],
        [6.5, 12.5, 'μ 가 0.5 면 friction cone 의 반각은 26.6° 라서, 20° 기운 힘은 버티고 35° 기운 힘은 미끄러집니다.'],
        [12.5, 18.5, '두 손가락을 잇는 선이 양쪽 friction cone 안이면 antipodal grasp 입니다. 상자 가운데를 쥐면 0° 입니다.'],
        [18.5, 24.5, '한쪽은 1 cm 아래, 다른 쪽은 1 cm 위를 쥐면 21.8° 라서, μ 0.5 에서는 집히고 μ 0.3 에서는 미끄러집니다.'],
        [24.5, 29.7, '반지름 3 cm 원기둥을 중심에서 1.5 cm 벗어나 쥐면 30° 라서, 26.6° 를 넘어 밀려 나갑니다.'],
      ],
    },
    {
      id: 'force',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.5, '접촉력만 조절해 어떤 외부 wrench 든 상쇄하면 force closure 입니다. wrench 는 힘 3 개와 torque 3 개입니다.'],
        [
          6.5,
          12.5,
          'grip force 는 2μF ≥ m(g + a) × S 로 정하고, 0.5 kg, μ 0.5, a 5, 안전율 2 면 14.8 N 입니다.',
          'grip force 는 2 뮤 에프 가 엠 곱하기 지 더하기 에이, 곱하기 에스 이상이 되게 정하고, 0.5 kg, μ 0.5, a 5, 안전율 2 면 14.8 N 입니다.',
        ],
        [
          12.5,
          18,
          'μ 가 0.3 이면 24.7 N 으로 1.7 배가 됩니다. 2F-85 는 grip force 를 20 ~ 235 N 에서 정합니다.',
          'μ 가 0.3 이면 24.7 N 으로 1.7 배가 됩니다. 2F-85 는 grip force 를 20 에서 235 N 사이에서 정합니다.',
        ],
        [
          18,
          24,
          '무게중심에서 5 cm 벗어나 쥐면 gravity torque 가 0.245 N·m 인데, 패드 두 개는 0.049 N·m 만 버팁니다.',
          '무게중심에서 5 cm 벗어나 쥐면 gravity torque 가 0.245 뉴턴미터인데, 패드 두 개는 0.049 뉴턴미터만 버팁니다.',
        ],
        [24, 29.7, '그래서 무게중심 가까이를 쥐고, AnyGrasp 는 이 거리를 점수에 넣어 미끄러짐을 16 번에서 11 번으로 줄였습니다.'],
      ],
    },
    {
      id: 'pause-grip',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1 kg 물체를 μ 0.4 패드로 천천히 들 때, 안전율 2 면 손가락 하나가 몇 N 으로 눌러야 할까요?'],
        [
          16.5,
          23.5,
          'F = m(g + a) × S ÷ (2μ) 이므로 19.62 ÷ 0.8 로 24.5 N 입니다.',
          '에프 는 엠 곱하기 지 더하기 에이, 곱하기 에스 를 2 뮤로 나눈 값이므로 19.62 ÷ 0.8 로 24.5 N 입니다.',
        ],
      ],
    },
    {
      id: 'epsilon',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'Ferrari-Canny 의 ε 은 primitive wrench 의 convex hull 에 원점을 중심으로 넣는 가장 큰 공의 반지름입니다.'],
        [7, 14, 'hull 이 한 방향으로 납작하면 그 방향에 약하고, ε 은 가장 약한 방향에서 버티는 크기를 힘 1 당으로 잽니다.'],
        [14, 21, '폭 5 cm 상자 가운데를 μ 0.5 로 쥐면 ε 은 0.33 이고, 1 cm 씩 엇갈려 쥐면 0.07 로 약 5 분의 1 입니다.'],
        [21, 27.7, 'pose 와 μ 에는 오차가 있어서, Dex-Net 은 이를 흔든 ε 의 기댓값인 robust epsilon quality 를 씁니다.'],
      ],
    },
    {
      id: 'learned',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'Dex-Net 2.0 은 mesh 1,500 개로 grasp 670 만 쌍을 만들고 robust ε 으로 성공 label 을 붙였습니다.'],
        [6.5, 13, '이 데이터로 학습한 GQ-CNN 은 아는 물체 8 개를 0.8 초에 93% 집었고, registration 은 2.6 초에 95% 였습니다.'],
        [13, 19.5, '처음 보는 물체 10 개에서는 registration 이 52% 로 떨어졌지만, GQ-CNN 은 80% 를 집었습니다.'],
        [19.5, 25.5, 'clutter 에서 옆으로 쥐려면 6-DoF grasp 가 필요하고, Contact-GraspNet 은 이를 0.28 초에 냅니다.'],
        [25.5, 31.7, '실제 카메라 데이터로 학습한 AnyGrasp 는 통 집기에서 93.3% 로, Dex-Net 4.0 72.2%, 사람 93.9% 와 견줬습니다.'],
      ],
    },
    {
      id: 'pause-epsilon',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 폭 5 cm 상자를 1 cm 씩 엇갈려 쥐면 21.8° 입니다. μ 0.3 에서 ε 이 0 인 이유는 무엇일까요?'],
        [16.5, 23.5, '반각 16.7° 보다 21.8° 가 커서 선이 원뿔 밖이라, antipodal 이 깨져 force closure 가 아니므로 ε 은 0 입니다.'],
      ],
    },
    {
      id: 'pipeline',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'depth image 에서 후보를 만들어 점수로 정렬하고, 차례로 IK 와 충돌 검사를 해 통과 못 한 후보는 버립니다.'],
        [7, 14, 'grasp 를 robot base frame 으로 옮겨 IK 를 풀고, 0.1 m 물러난 pre-grasp 에서 내려갑니다.'],
        [
          14,
          21,
          'MoveIt 예제는 angle_delta 를 π / 12 로 두어 한 바퀴에 2π ÷ (π / 12) 로 후보 24 개를 만듭니다.',
          'MoveIt 예제는 angle_delta 를 12 분의 π 로 두어, 한 바퀴 2π 를 12 분의 π 로 나눈 후보 24 개를 만듭니다.',
        ],
        [
          21,
          27.7,
          '후보마다 IK 해를 기본 1 개, 예제는 8 개 구하고, 0.10 ~ 0.15 m 다가가 쥔 뒤 0.1 ~ 0.3 m 들어 올립니다.',
          '후보마다 IK 해를 기본 1 개, 예제는 8 개 구하고, 0.10 에서 0.15 m 다가가 쥔 뒤 0.1 에서 0.3 m 들어 올립니다.',
        ],
      ],
    },
    {
      id: 'failures',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, '실패는 depth 에서 시작하기도 합니다. 투명하거나 반짝이는 물체는 depth 카메라가 뒤의 배경을 재거나 값이 빕니다.'],
        [6.5, 12.5, '얇은 부분은 depth 에서 빠져 비어 보이고, Dex-Net 2.0 은 그 자리를 손가락이 들어갈 곳으로 착각해 실패했습니다.'],
        [12.5, 18.5, 'D435 의 depth 는 같은 점이 ±5 mm 까지 흔들리고, clutter 에서는 손가락이 이웃 물체와 부딪힙니다.'],
        [18.5, 24.5, '젖은 물체는 좋은 grasp 에서도 미끄러져서, AnyGrasp 물고기 잡기 실패의 절반 가까이가 낮은 마찰 때문이었습니다.'],
        [24.5, 29.7, '논문의 성공률은 그 논문의 조건에서 잰 값입니다. AnyGrasp 에서도 철물은 81.5%, 과자와 인형은 100% 였습니다.'],
      ],
    },
    {
      id: 'pause-angle',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. angle_delta 를 기본값 0.1 rad 로 두면, 물체 축을 한 바퀴 도는 동안 후보가 대략 몇 개 생길까요?'],
        [
          16.5,
          23.5,
          '한 바퀴는 2π ≈ 6.28 rad 라서 6.28 ÷ 0.1 로 약 63 개입니다. 예제의 24 개보다 많아 IK 도 그만큼 더 풉니다.',
          '한 바퀴는 2π, 약 6.28 rad 라서 6.28 ÷ 0.1 로 약 63 개입니다. 예제의 24 개보다 많아 IK 도 그만큼 더 풉니다.',
        ],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. grasp 는 t, a, b, w 의 숫자 7 개이고, suction 은 압력 차이 × 넓이로 42.4 N 을 당깁니다.'],
        [4.2, 8.2, '힘이 반각 arctan μ 의 friction cone 안이면 버티고, 0.5 kg 은 μ 0.5, 안전율 2 에서 14.8 N 으로 쥡니다.'],
        [8.2, 12.2, 'ε 은 convex hull 에 들어가는 가장 큰 공의 반지름이고, GQ-CNN 은 robust ε label 로 배웁니다.'],
        [12.2, 15.7, '후보, 점수, IK, 충돌 검사, pre-grasp 순서로 실행하고, 투명한 물체와 depth noise 에서 많이 실패합니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '다음은 camera 와 로봇 base 를 잇는 Hand-Eye Calibration, 물체를 피하는 Motion Planning 입니다.']],
    },
  ],
}
