import type { VideoScript } from '../script.ts'

// Numbers follow lessons/tactile-sensing/README.md: the AnySkin plug task (10 번 중 평균 1.7 vs 6.7; DIGIT 2.3, ReSkin 6.0;
// new skin 5.3 / 1.7 / 1.3; 3.6 ÷ 5.0 = 72%, ReSkin 0%); what a camera misses (f = 424 pixel, 500 ÷ 424 ≈ 1.2 mm; DIGIT
// 19 ÷ 640 ≈ 0.03 mm, ≈ 40×; 5 N vs 25 N; GelSight < 0.05 N in most conditions; F/T sensor 6 numbers, ATI mini45 ≈ $3,000;
// 0.5 kg, 14.8 N, 3.70 N, T ÷ N = 0.25, 7.4 N; check question 10 N, 3 N, μ = 0.5 → 0.3, slips above 5 N); the three
// families (3D-ViTac 16 × 16 = 256 cells, 3 mm², < 1 mm, ≈ 32 Hz, ≈ $20; ReSkin 20 × 20 mm, 5 × 3 = 15, ≈ 400 Hz, 2 ~ 3 mm,
// < $30; DIGIT 20 × 27 × 18 mm, 20 g, 19 × 16 mm, 640 × 480, 60 FPS, ≈ $15 at 1000 units; GelSight Mini 25 FPS, $549;
// per second ≈ 8,200 / 6,000 / 921,600 × 60 ≈ 5,500 만; vision-based 30 ~ 60 FPS); photometric stereo (A − B) ÷ (A + B) with
// the 7-pixel table (A 70 65 55 45 35 30 50, B 30 35 45 55 65 70 50, slope 0.4 0.3 0.1 −0.1 −0.3 −0.4 0, depth 0.04 0.07
// 0.08 0.07 0.04 0 0 mm, 0.1 mm spacing, width 5 × 0.1 = 0.5 mm; 3.96 mm ball, 80 × 80 × 80 lookup table, 18 × 14 mm,
// 30 FPS, 20 ~ 30 μm); markers (25 × 25 mm at 1.1 mm, Mini 7 × 9 = 63 → 126 → PCA 15; shear 1 N ↔ 0.08 mm, 0.20 0.22 0.18
// 0.21 0.19 → 0.20 ÷ 0.08 = 2.5 N; 0.1 mm ↔ 1 N, 0.6 mm → 6 N, 2.5 ÷ 6 = 0.42; R² > 0.9; check 0.12 ÷ 0.08 = 1.5 N,
// 0.5 ÷ 0.1 = 5 N, 0.3); slip (0.20 ×5 → 1; 0.08 0.18 0.22 0.18 0.08 → 0.08 ÷ 0.22 = 0.36 < 0.5; AnySkin LSTM 30 objects,
// 100 Hz, 10 new objects 92%; ≈ 80 ms, 0.08 × 25 = 2, 0.08 × 400 = 32); TACTO (0 ~ 100 N → 0 ~ 5 mm, 10 ÷ 100 × 5 = 0.5 mm,
// noise σ 7, 160 × 120 at ≈ 200 FPS, 100 만 grasps, 1,000 ~ 10,000× data; pen test 11.75 / 0.41 / 4.56 / 1.66 / 2.01 / 0.76 /
// 0.52 mm and 46.56 / 3.48 / 17.64 / 11.60 / 10.96 / 4.96 / 4.14°, 4.56 ÷ 0.41 ≈ 11; Taxim MSE 58.4 vs 215.9); policy inputs
// (ResNet-18, MLP, transformer, 96 demos, 10 steps; 256 cells + 512 points, 256 × 4 + 512 = 1,536; 3D-ViTac wrench 0.45 /
// 0.65 / 0.90 / 0.15 / 0.30 / 0.70, egg 0.50 / 0.55 / 0.85 / 0.10 / 0.50 / 0.80, 30 demos, 20 runs; Sparsh 46 만여 장, RMSE
// mN 39.34 / 36.09, 98.22 / 51.89, 187.51 / 97.95, ≈ 4.8× vs ≈ 2.7×; slip F1 0.767 / 0.820, 0.238 / 0.828, 0.214 / 0.760);
// slow-fast (12 actions a second, 0.67 s chunk, 120 ms, 0.67 + 0.12 = 0.79 s, 0.67 × 25 ≈ 17; slow 1 ~ 2 Hz, fast 24 FPS
// < 1 ms; cucumber 0.56 / 0.19 / 0.44, 0.60 / 0.16 / 0.41, 0.48 / 0.15 / 0.39, 0.98 / 0.80 / 0.90; chunk 8 → 2: 100% → 20%;
// latency 10 ~ 60 ms, 40 ms at 25 FPS; check 1000 ÷ 60 ≈ 16.7 ms, 16.7 + 60 + 1 ≈ 78 ms); wear and drift (1.7 N, 5 / 10 / 15
// rubs: DIGIT 0 / 0.3 / 0.3%, GelSight 276 / 482 / 805%; ReSkin 50,000 presses, first 5,000; 25.24% → 84.43% → 87.00%, 390
// presses, ±1 mm).

const S1 = '카메라가 못 보는 접촉'
const S2 = 'gel 과 marker'
const S3 = 'simulation 과 학습'
const S4 = '주기 · 마모 · 센서 차이'

export const script: VideoScript = {
  id: 'tactile-sensing',
  title: 'Tactile Sensing',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/tactile-sensing',
  sections: [S1, S2, S3, S4],
  terms: [
    ['forward kinematics', '포워드 키네마틱스'],
    ['photometric stereo', '포토메트릭 스테레오'],
    ['resistive array', '리지스티브 어레이'],
    ['color jittering', '컬러 지터링'],
    ['physics engine', '피직스 엔진'],
    ['Tactile Sensing', '택타일 센싱'],
    ['friction cone', '프릭션 콘'],
    ['GelSight Mini', '젤사이트 미니'],
    ['magnetic skin', '마그네틱 스킨'],
    ['magnetometer', '마그네토미터'],
    ['lookup table', '룩업 테이블'],
    ['latent chunk', '레이턴트 청크'],
    ['action chunk', '액션 청크'],
    ['partial slip', '파셜 슬립'],
    ['vision-based', '비전 베이스드'],
    ['point cloud', '포인트 클라우드'],
    ['calibration', '캘리브레이션'],
    ['transformer', '트랜스포머'],
    ['grip force', '그립 포스'],
    ['Real Robot', '리얼 로봇'],
    ['simulation', '시뮬레이션'],
    ['resistive', '리지스티브'],
    ['3D-ViTac', '쓰리디 바이택'],
    ['baseline', '베이스라인'],
    ['magnetic', '마그네틱'],
    ['GelSight', '젤사이트'],
    ['AnySkin', '애니스킨'],
    ['encoder', '인코더'],
    ['decoder', '디코더'],
    ['OpenGL', '오픈지엘'],
    ['ReSkin', '리스킨'],
    ['Sparsh', '스파시'],
    ['latent', '레이턴트'],
    ['marker', '마커'],
    ['TACTO', '택토'],
    ['DIGIT', '디짓'],
    ['pixel', '픽셀'],
    ['label', '레이블'],
    ['shear', '시어'],
    ['chunk', '청크'],
    ['drift', '드리프트'],
    ['skin', '스킨'],
    ['pose', '포즈'],
    ['cone', '콘'],
    ['USB', '유에스비'],
    ['RGB', '알지비'],
    ['PCA', '피씨에이'],
    ['RDP', '알디피'],
    ['gel', '젤'],
    ['μN', '뮤 엔'],
    ['mN', '밀리뉴턴'],
    ['mm', '밀리미터'],
    ['N', '뉴턴'],
    ['μ', '뮤'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Tactile Sensing 은 손끝의 무른 면이 눌리고 끌리는 모양에서 접촉면의 모양과 힘, 미끄러짐을 숫자로 냅니다.'],
        [4.2, 7.8, '카메라가 못 보는 접촉, gel 과 marker, simulation 과 policy, 주기와 마모의 문제를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'USB 플러그를 꽂을 때 손가락과 플러그가 맞닿은 면은 가려 있고, 얼마나 세게 쥐었는지는 사진에 없습니다.'],
        [4.4, 7.8, '손가락이 물체에 닿은 바로 그 자리에서 무엇을 재야 하고, 그 값은 어떻게 얻을 수 있을까요?'],
      ],
    },
    {
      id: 'occlusion',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 6.5, '카메라가 놓치는 것은 셋입니다. 접촉면은 가려 있고, 0.5 m 앞 pixel 하나는 500 ÷ 424 로 약 1.2 mm 입니다.'],
        [6.5, 13, 'DIGIT 는 19 mm 를 640 pixel 로 찍어 pixel 하나가 약 0.03 mm 라서, 약 40 배 촘촘합니다.'],
        [13, 19.5, '둘째는 힘입니다. 5 N 인지 25 N 인지 사진은 같지만, GelSight 는 대부분 0.05 N 미만도 구분했습니다.'],
        [19.5, 27.5, '셋째는 미끄러짐입니다. T 가 μN 에 다가가면 가장자리부터 미끄러지는 partial slip 은 물체가 움직인 뒤에야 사진에 보입니다.'],
      ],
    },
    {
      id: 'families',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'resistive array 는 저항이 바뀌는 막으로 칸마다 힘을 재고, 3D-ViTac 은 256 칸을 1초에 약 32 번 읽습니다.'],
        [6, 12, 'magnetic skin 은 자석 가루 섞은 막 아래 자기장 센서로, ReSkin 은 숫자 15 개를 1초에 약 400 번 읽습니다.'],
        [12, 18, 'vision-based 센서는 gel 뒤의 카메라로 눌린 모양을 찍고, DIGIT 는 640 × 480 을 1초에 60 장 찍습니다.'],
        [18, 24, '1초에 들어오는 숫자는 3D-ViTac 약 8,200 개, ReSkin 6,000 개, DIGIT 약 5,500 만 개입니다.'],
        [24, 29.7, '해상도가 전부는 아닙니다. 플러그 꽂기 성공은 DIGIT policy 가 10 번 중 2.3 번, AnySkin 은 6.7 번입니다.'],
      ],
    },
    {
      id: 'pause-cone',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 수직 힘 10 N, 접선 힘 3 N, μ 0.5 면 friction cone 안일까요? 한계는 몇 N 일까요?'],
        [
          16.5,
          23.5,
          'T ÷ N 은 0.3 으로 μ 0.5 이하라서 cone 안입니다. T 가 0.5 × 10 인 5 N 을 넘으면 미끄러집니다.',
          '티 나누기 엔 은 0.3 으로 μ 0.5 이하라서 cone 안입니다. 티 가 0.5 × 10 인 5 N 을 넘으면 미끄러집니다.',
        ],
      ],
    },
    {
      id: 'photometric',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6.5, 'GelSight 의 gel 은 투명한 고무 위에 불투명한 반사막을 입힌 것이라, 밝기는 막의 기울기에만 달려 있습니다.'],
        [
          6.5,
          13,
          'photometric stereo 는 여러 빛의 밝기로 기울기를 구합니다. 빛 A, B 두 개면 (A − B) ÷ (A + B) 입니다.',
          'photometric stereo 는 여러 빛의 밝기로 기울기를 구합니다. 빛 A, B 두 개면 에이 빼기 비 를 에이 더하기 비 로 나눈 값입니다.',
        ],
        [13, 20, 'A 70, B 30 이면 기울기는 0.4 입니다. 기울기 × 0.1 mm 를 더해 가면 pixel 3 이 0.08 mm 로 가장 깊습니다.'],
        [20, 27.5, '실제 센서는 빛이 나란하지 않아, 지름 3.96 mm 공을 눌러 80 × 80 × 80 lookup table 을 센서마다 만듭니다.'],
      ],
    },
    {
      id: 'markers',
      seconds: 32,
      section: S2,
      cues: [
        [0.3, 6.5, '깊이로는 막이 옆으로 끌린 양을 모르니, GelSight 는 고무와 반사막 사이에 검은 marker 를 찍어 이동을 잽니다.'],
        [6.5, 12.5, '누르면 marker 가 바깥으로 퍼지고, 끌면 모두 끈 방향으로 움직입니다. 접촉면을 따라 끄는 힘이 shear 입니다.'],
        [12.5, 19, 'shear 1 N 마다 0.08 mm 로 calibration 하면, 평균 이동 0.20 mm 는 0.20 ÷ 0.08 로 2.5 N 입니다.'],
        [19, 25.5, '미끄러짐은 가장자리에서 시작합니다. 모두 붙어 있으면 marker 5 개가 다 0.20 mm 움직여 가장자리 ÷ 가운데가 1 입니다.'],
        [25.5, 31.7, '가장자리가 미끄러지면 0.08, 0.18, 0.22, 0.18, 0.08 mm 로 0.36 이 되어, 문턱 0.5 아래라서 힘을 올립니다.'],
      ],
    },
    {
      id: 'pause-marker',
      seconds: 24,
      section: S2,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 같은 공 calibration 에서 평균 이동 0.12 mm, 깊이 0.5 mm 면 T ÷ N 은 얼마일까요?',
          '멈추고 적어 보기. 같은 공 calibration 에서 평균 이동 0.12 mm, 깊이 0.5 mm 면 티 나누기 엔 은 얼마일까요?',
        ],
        [
          16.5,
          23.5,
          'shear 는 0.12 ÷ 0.08 로 1.5 N 이고 수직 힘은 0.5 ÷ 0.1 로 5 N 이라서 T ÷ N 은 0.3 입니다.',
          'shear 는 0.12 ÷ 0.08 로 1.5 N 이고 수직 힘은 0.5 ÷ 0.1 로 5 N 이라서 티 나누기 엔 은 0.3 입니다.',
        ],
      ],
    },
    {
      id: 'sim',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 6.5, 'TACTO 는 physics engine 이 준 pose 와 수직 힘을 받아 gel 깊이로 바꾸고 OpenGL 로 사진을 그립니다.'],
        [
          6.5,
          12.5,
          'DIGIT 기본값은 0 ~ 100 N 을 0 ~ 5 mm 로 직선 대응시켜, 10 N 은 10 ÷ 100 × 5 로 0.5 mm 입니다.',
          'DIGIT 기본값은 0 에서 100 N 을 0 에서 5 mm 로 직선 대응시켜, 10 N 은 10 ÷ 100 × 5 로 0.5 mm 입니다.',
        ],
        [12.5, 20, 'simulation 으로 학습한 모델의 펜 위치 오차는 simulation 0.41 mm, 실물 4.56 mm 로 약 11 배였습니다.'],
        [20, 27.5, 'RGB 밝기를 흔드는 color jittering 을 더하면 1.66 mm 로 줄고, 실물 128 장을 섞으면 0.52 mm 입니다.'],
      ],
    },
    {
      id: 'policy',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, '촉각을 policy 에 넣는 방법은 셋입니다. 첫째는 AnySkin 처럼 촉각 신호를 카메라 사진과 나란한 입력으로 넣습니다.'],
        [6.5, 13, '둘째는 3D-ViTac 처럼 256 칸의 위치를 forward kinematics 로 구해 카메라 점 512 개와 합칩니다.'],
        [13, 19.5, '육각 렌치 꽂기는 point cloud 만 0.65, 촉각 점을 더하면 0.90, 촉각 점만으로는 0.15 입니다.'],
        [19.5, 25.5, '셋째는 Sparsh 처럼 label 없는 사진 46 만여 장으로 encoder 를 미리 학습하고 작은 decoder 만 학습합니다.'],
        [
          25.5,
          31.7,
          'label 이 1/100 이면 힘 오차는 처음부터 학습하면 약 4.8 배로 늘지만, Sparsh 는 약 2.7 배인 97.95 mN 입니다.',
          'label 이 백 분의 일이면 힘 오차는 처음부터 학습하면 약 4.8 배로 늘지만, Sparsh 는 약 2.7 배인 97.95 mN 입니다.',
        ],
      ],
    },
    {
      id: 'pause-points',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 손가락 4 개에 256 칸 패드를 붙이고 카메라 점 512 개를 뽑으면 점은 모두 몇 개일까요?'],
        [
          16.5,
          23.5,
          '촉각 점은 256 × 4 로 1,024 개이고 카메라 점이 512 개라서, 모두 1,024 + 512 로 1,536 개입니다.',
          '촉각 점은 256 × 4 로 1,024 개이고 카메라 점이 512 개라서, 모두 1,024 더하기 512 로 1,536 개입니다.',
        ],
      ],
    },
    {
      id: 'slow-fast',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 6.5, 'chunk 실행 중에는 새 관측을 보지 않습니다. RDP 의 baseline 은 chunk 가 0.67 초이고 계산이 120 ms 였습니다.'],
        [
          6.5,
          13,
          'chunk 직후 미끄러지면 0.67 + 0.12 로 0.79 초 뒤에야 반응하고, GelSight Mini 사진 약 17 장을 놓칩니다.',
          'chunk 직후 미끄러지면 0.67 더하기 0.12 로 0.79 초 뒤에야 반응하고, GelSight Mini 사진 약 17 장을 놓칩니다.',
        ],
        [
          13,
          20,
          'RDP 의 느린 층은 1초에 1 ~ 2 번 latent chunk 를 내고, 빠른 층은 1초에 24 번 촉각으로 action 을 고칩니다.',
          'RDP 의 느린 층은 1초에 한 번에서 두 번 latent chunk 를 내고, 빠른 층은 1초에 24 번 촉각으로 action 을 고칩니다.',
        ],
        [20, 25.5, '오이 깎기 점수는 Diffusion Policy 가 0.44, 촉각 사진을 더해도 0.41 인데, RDP 는 0.90 이었습니다.'],
        [25.5, 29.7, 'chunk 를 짧게 해도 안 됩니다. 닦기에서 chunk 를 8 에서 2 로 줄이자 쥐기 성공률이 100% 에서 20% 가 됐습니다.'],
      ],
    },
    {
      id: 'wear',
      seconds: 30,
      section: S4,
      cues: [
        [0.3, 7, 'gel 은 닳습니다. 연마 팁으로 15 번 문지르자 새는 빛이 DIGIT 는 0.3% 늘고, 이전 GelSight 는 805% 늘었습니다.'],
        [7, 13.5, 'drift 는 같은 힘에도 신호가 서서히 변하는 현상입니다. ReSkin 을 50,000 번 누르자 처음 학습한 모델이 힘을 크게 봤습니다.'],
        [13.5, 20.5, 'ReSkin 한 센서로 학습한 모델은 다른 센서에서 위치를 25.24% 만 맞혔고, 여러 센서로 학습하면 84.43% 였습니다.'],
        [20.5, 26, 'skin 을 바꾸자 AnySkin 은 6.7 번에서 5.3 번으로 줄고, ReSkin 은 6.0 번에서 1.7 번으로 떨어졌습니다.'],
        [26, 29.7, '영점을 자주 다시 재고, 여러 센서로 학습하고, 새 센서에 label 없이 적응시킵니다. 적응 뒤에는 87.00% 였습니다.'],
      ],
    },
    {
      id: 'pause-swap',
      seconds: 24,
      section: S4,
      cues: [
        [
          0.3,
          4.5,
          '멈추고 적어 보기. 1.7 번을 넘는 몫이 촉각의 기여라면, skin 을 바꾼 AnySkin 과 ReSkin 은 몇 % 를 지켰을까요?',
          '멈추고 적어 보기. 1.7 번을 넘는 몫이 촉각의 기여라면, skin 을 바꾼 AnySkin 과 ReSkin 은 몇 퍼센트를 지켰을까요?',
        ],
        [16.5, 23.5, 'AnySkin 은 5.0 번이 3.6 번이 되어 3.6 ÷ 5.0 으로 72% 를 지켰고, ReSkin 은 4.3 번이 0 이라 0% 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. 카메라는 접촉면과 힘, partial slip 을 못 보고, 촉각 센서는 그 자리를 0.03 mm pixel 로 잽니다.'],
        [4.2, 8.2, 'GelSight 는 밝기에서 기울기와 깊이를 얻고, marker 이동으로 shear 2.5 N 과 비율 0.36 의 미끄러짐을 봅니다.'],
        [8.2, 12.2, 'simulation 의 0.41 mm 오차는 실물에서 4.56 mm 가 되고, 촉각 점은 육각 렌치 0.65 를 0.90 으로 올립니다.'],
        [12.2, 15.7, 'chunk 중에도 반응하려면 RDP 처럼 빠른 층을 두고, 마모와 drift, 센서 차이는 영점 재기와 여러 센서로 다룹니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '촉각 policy 를 실물 팔에서 비동기로 추론하고 chunk 를 이어 붙이는 방법은 Real Robot 에서 다룹니다.']],
    },
  ],
}
