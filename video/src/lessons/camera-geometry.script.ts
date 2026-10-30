import type { VideoScript } from '../script.ts'

// Numbers follow lessons/camera-geometry/README.md: the cup at pixel (370, 215); the example camera (640×480, f_x = f_y =
// 500, principal point (320, 240)); the projection steps (0.1, −0.05, 1.0) → (0.1, −0.05) → (50, −25) → (370, 215) and
// (−0.2, 0.1, 2.0) → (−0.1, 0.05) → (−50, 25) → (270, 265); the similar triangles (2 m forward, 0.4 m right → 0.2 m at 1 m);
// the same ray ((0.1, −0.05, 1.0), (0.2, −0.1, 2.0), (0.3, −0.15, 3.0) → (370, 215)); size and distance (500 × 0.1 ÷ 1 =
// 50 = 500 × 0.2 ÷ 2); back-projection ((370, 215) at depth 1.0 / 2.0 → (50, −25) → (0.1, −0.05) → (0.1, −0.05, 1.0) /
// (0.2, −0.1, 2.0)); stereo (baseline 0.1 m, disparity 50 / 25, 500 × 0.1 ÷ 50 = 1.0 m, 500 × 0.1 ÷ 25 = 2.0 m; D435 f =
// 424 ÷ tan 45° = 424, baseline 50 mm, 0.08 pixel → 약 4 / 15 / 60 mm at 1 / 2 / 4 m); check question (0.2, 0.1, 2.0) →
// (0.1, 0.05) → (50, 25) → (370, 265); K and camera_info k = [500, 0, 320, 0, 500, 240, 0, 0, 1]; 1280×960 → f 1000, (640,
// 480); distortion (k1 ≈ −0.281, k2 ≈ 0.078; (0.3, 0): r² 0.09, 약 0.975, (470, 240) → (466, 240); (0.6, 0.45): r² 0.5625,
// 약 0.867, (620, 465) → (580, 435); 2.5% vs 13%; plumb_bob 5 coefficients (k1, k2, t1, t2, k3)); extrinsics (R = I, t =
// (−0.1, 0, 1.0), world (0.2, −0.05, 0) → (0.1, −0.05, 1.0) → (370, 215); 3 + 3 = 6 numbers; camera at (0.1, 0, −1.0);
// camera_link misread: 1 m forward → 1 m up); distortion check (k1 −0.1, k2 0, (0.6, 0.8): 0.36 + 0.64 = 1, 0.9 → (0.54,
// 0.72)); checkerboard 9 × 6 inner corners, Z = 0; reprojection error (373, 219) vs (370, 215) → √(3² + 4²) = 5 pixel;
// RMS of 1 and 7 → √((1 + 49) ÷ 2) = 5 vs plain mean 4; OpenCV sample (640×480, 13 photos, 9×6): none 557.5 / (360.1,
// 235.5) / 1.555, k1 k2 536.5 / (342.4, 234.3) / 0.418, 5 coefficients 536.1 / (342.4, 235.5) / 0.409, f_x 약 4% larger;
// homography 3×3, 8 of 9 numbers, ≥ 4 points; Zhang (2 equations per photo; H = [[208, 0, 320], [−144, 500, 240], [−0.6, 0,
// 1]]; f 400 / 500 / 600 → lengths 1.166 / 1 / 0.897 and 1.25 / 1 / 0.833; 5 numbers → ≥ 3 photos, skew 0 → 2; 45° best,
// 5° → 40% fail); refinement (640×480, 256 corners, 5 photos: f_x 877.16 → 832.50, k1 0.136 → −0.228, RMS 0.881 → 0.335);
// RMS check (0, 0, 3 → 0, 0, 9 → 9 ÷ 3 = 3 → √3 ≈ 1.73); ArUco (6×6 cells, 250 markers; 0.05 m side at 50 pixel → 500 ×
// 0.05 ÷ 50 = 0.5 m, X = (370 − 320) × 0.5 ÷ 500 = 0.05, Y = (215 − 240) × 0.5 ÷ 500 = −0.025; corners (±a/2, ±a/2, 0));
// base frame (camera at (0.3, 0, 0.5) looking down → (0.05, 0.025, −0.5) + (0.3, 0, 0.5) = (0.35, 0.025, 0)); errors (u
// 370 → 371: 0.05 → 0.051, 1 mm; side 50 → 49: 0.5 → 약 0.510, 약 1 cm; 1 pixel = 2%; 0.5 ÷ 500 = 0.001 m; 10×); marker
// check (500 × 0.04 ÷ 20 = 1 m, 500 × 0.04 ÷ 19 ≈ 1.053 m, 약 5 cm); summary RMS 0.42 → 1.56 pixel.

const S1 = 'pinhole 과 거리'
const S2 = 'camera_info 와 tf2'
const S3 = 'Zhang calibration'
const S4 = 'ArUco marker pose'

export const script: VideoScript = {
  id: 'camera-geometry',
  title: 'Camera Geometry',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/camera-geometry',
  sections: [S1, S2, S3, S4],
  terms: [
    ['Classical Pick & Place', '클래시컬 픽 앤 플레이스'],
    ['Hand-Eye Calibration', '핸드 아이 캘리브레이션'],
    ['Visual SLAM & VIO', '비주얼 슬램 앤 브이아이오'],
    ['camera optical frame', '카메라 옵티컬 프레임'],
    ['Levenberg-Marquardt', '레벤버그 마쿼트'],
    ['reprojection error', '리프로젝션 에러'],
    ['radial distortion', '레이디얼 디스토션'],
    ['principal point', '프린시펄 포인트'],
    ['Camera Geometry', '카메라 지오메트리'],
    ['back-projection', '백 프로젝션'],
    ['lens distortion', '렌즈 디스토션'],
    ['pinhole model', '핀홀 모델'],
    ['stereo camera', '스테레오 카메라'],
    ['optical frame', '옵티컬 프레임'],
    ['focal length', '포컬 렝스'],
    ['image plane', '이미지 플레인'],
    ['camera frame', '카메라 프레임'],
    ['world frame', '월드 프레임'],
    ['depth camera', '뎁스 카메라'],
    ['checkerboard', '체커보드'],
    ['camera_info', '카메라 인포'],
    ['camera_link', '카메라 링크'],
    ['calibration', '캘리브레이션'],
    ['closed-form', '클로즈드 폼'],
    ['translation', '트랜슬레이션'],
    ['refinement', '리파인먼트'],
    ['intrinsics', '인트린직스'],
    ['extrinsics', '익스트린직스'],
    ['homography', '호모그래피'],
    ['distortion', '디스토션'],
    ['normalized coordinates', '노멀라이즈드 코디네이츠'],
    ['normalized', '노멀라이즈드'],
    ['image_rect', '이미지 렉트'],
    ['image_proc', '이미지 프록'],
    ['plumb_bob', '플럼 밥'],
    ['disparity', '디스패리티'],
    ['transform', '트랜스폼'],
    ['identity', '아이덴티티'],
    ['detector', '디텍터'],
    ['rotation', '로테이션'],
    ['baseline', '베이스라인'],
    ['solvePnP', '솔브 피엔피'],
    ['rectify', '렉티파이'],
    ['pinhole', '핀홀'],
    ['OpenCV', '오픈씨브이'],
    ['stereo', '스테레오'],
    ['corner', '코너'],
    ['marker', '마커'],
    ['camera', '카메라'],
    ['ArUco', '아루코'],
    ['pixel', '픽셀'],
    ['depth', '뎁스'],
    ['Zhang', '장'],
    ['world', '월드'],
    ['board', '보드'],
    ['frame', '프레임'],
    ['model', '모델'],
    ['skew', '스큐'],
    ['node', '노드'],
    ['pose', '포즈'],
    ['base', '베이스'],
    ['ROS 2', '로스 투'],
    ['D435', '디 사삼오'],
    ['tf2', '티에프 투'],
    ['RMS', '알엠에스'],
    ['PnP', '피엔피'],
    ['k1', '케이 원'],
    ['k2', '케이 투'],
    ['ID', '아이디'],
    ['cm', '센티미터'],
    ['3D', '쓰리디'],
    ['Z', '제트'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Camera Geometry 는 3D 점이 pixel 이 되는 계산과, 그 숫자를 calibration 으로 구하는 법입니다.'],
        [4.2, 7.8, 'pinhole 과 거리, camera_info 와 tf2, Zhang calibration, marker pose 를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, 'detector 는 컵의 pixel (370, 215) 두 숫자를 내지만, 팔을 뻗으려면 3D 위치 숫자 세 개가 필요합니다.'],
        [4.4, 7.8, 'pixel 에서 3D 위치를 얻으려면 카메라의 무엇을 알아야 하고, 모자란 숫자 하나는 어디서 채워야 할까요?'],
      ],
    },
    {
      id: 'projection',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 5.8, 'camera optical frame 은 렌즈 중심이 원점이고, z 는 앞쪽, x 는 오른쪽, y 는 아래쪽을 향합니다.'],
        [5.8, 11.5, 'pinhole model 은 점과 렌즈 중심을 잇는 직선이 image plane 을 지나는 자리에 그 점이 찍힌다고 계산합니다.'],
        [11.5, 17, 'image plane 위의 자리는 옆으로 간 거리 ÷ 앞으로 간 거리이고, 이것이 normalized coordinates 입니다.'],
        [17, 22.5, '예시 카메라는 640×480 사진에 focal length 500, principal point (320, 240) 입니다.'],
        [22.5, 27.7, '(0.1, −0.05, 1.0) 을 depth 로 나누고 500 을 곱해 (320, 240) 을 더하면 (370, 215) 입니다.'],
      ],
    },
    {
      id: 'depth',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '직선 하나 위의 1 m, 2 m, 3 m 점은 depth 로 나누면 배수가 지워져 모두 pixel (370, 215) 에 찍힙니다.'],
        [6, 12, '그래서 1 m 앞의 10 cm 컵과 2 m 앞의 20 cm 상자는 둘 다 사진에서 50 pixel 높이로 찍힙니다.'],
        [12, 18, 'depth 를 알면 세 단계를 거꾸로 밟는 back-projection 으로 pixel 에서 3D 점을 되찾습니다.'],
        [18, 24, 'stereo 의 depth 는 f × baseline ÷ disparity 라서, 500 × 0.1 ÷ 50 으로 1.0 m 입니다.'],
        [24, 29.7, 'D435 값으로 계산하면 depth 오차는 1 m 에서 약 4 mm, 2 m 에서 약 15 mm, 4 m 에서 약 60 mm 입니다.'],
      ],
    },
    {
      id: 'pause-project',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 예시 카메라에서 camera frame 의 점 (0.2, 0.1, 2.0) 은 어느 pixel 에 찍힐까요?'],
        [16.5, 23.5, 'depth 로 나누면 (0.1, 0.05), 500 을 곱하면 (50, 25), (320, 240) 을 더하면 (370, 265) 입니다.'],
      ],
    },
    {
      id: 'intrinsics',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6.3, 'f 와 principal point 는 카메라 자체의 숫자인 intrinsics 이고, 행렬 K 로 camera_info 의 k 에 담깁니다.'],
        [6.3, 12, '같은 센서를 1280×960 으로 읽으면 f 는 1000, principal point 는 (640, 480) 으로 바뀝니다.'],
        [12, 18, 'lens distortion 은 가장자리의 곧은 선이 휘는 현상이고, OpenCV 예제 카메라는 k1 이 약 −0.281 입니다.'],
        [18, 24, '중심 가까운 점은 2.5% 만 당겨지지만, 모서리 근처 점은 13% 당겨져 (620, 465) 가 (580, 435) 로 찍힙니다.'],
        [24, 29.7, 'plumb_bob 계수 5 개는 camera_info 의 d 에 담기고, image_proc 이 왜곡을 편 image_rect 를 냅니다.'],
      ],
    },
    {
      id: 'extrinsics',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 7, '물체 위치는 로봇 base 같은 world frame 에서 필요해서, R 과 t 로 camera frame 의 점으로 바꿉니다.'],
        [7, 14, 'R 이 I 이고 t 가 (−0.1, 0, 1.0) 이면 world 의 (0.2, −0.05, 0) 은 (0.1, −0.05, 1.0) 입니다.'],
        [14, 21, 'R 과 t 의 숫자 6 개가 extrinsics 이고, t 는 카메라에서 본 world 원점의 위치입니다.'],
        [21, 27.7, 'extrinsics 는 tf2 transform 이고, camera_link 좌표로 잘못 읽으면 앞쪽 1 m 가 위쪽 1 m 가 됩니다.'],
      ],
    },
    {
      id: 'pause-distort',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. k1 이 −0.1, k2 가 0 인 렌즈에서 normalized 점 (0.6, 0.8) 은 어디로 옮겨질까요?'],
        [
          16.5,
          23.5,
          'r² 은 0.36 + 0.64 로 1 이고 배율은 1 − 0.1 로 0.9 라서, 점은 중심 쪽으로 당겨진 (0.54, 0.72) 입니다.',
          '알 제곱은 0.36 더하기 0.64 로 1 이고 배율은 1 빼기 0.1 로 0.9 라서, 점은 중심 쪽으로 당겨진 (0.54, 0.72) 입니다.',
        ],
      ],
    },
    {
      id: 'reprojection',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, 'calibration 은 생김새를 아는 checkerboard 를 찍어 숫자를 거꾸로 구하고, 모든 corner 의 Z 는 0 입니다.'],
        [7, 14, '찾은 corner (373, 219) 와 투영한 (370, 215) 사이의 reprojection error 는 5 pixel 입니다.'],
        [14, 21, 'corner 가 많으면 RMS 로 모으는데, 거리가 1, 7 pixel 이면 RMS 는 5 pixel 로 평균 4 보다 큽니다.'],
        [21, 27.7, 'OpenCV 예제에서 distortion 을 빼면 RMS 가 1.555 pixel 이고, k1, k2 를 넣으면 0.418 pixel 입니다.'],
      ],
    },
    {
      id: 'zhang',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6.5, 'corner 의 Z 가 0 이라 R 의 셋째 칸이 지워지고, 판과 사진은 3×3 행렬 homography 로 이어집니다.'],
        [6.5, 13, 'K 를 되돌린 H 의 두 칸은 rotation 의 칸이라 길이가 같고 수직이어서, 사진마다 식이 두 개 나옵니다.'],
        [13, 19.5, '기울인 판의 예에서 f 를 400 으로 추측하면 두 길이가 1.166 과 1.25 로 다르고, 500 일 때만 둘 다 1 입니다.'],
        [19.5, 25.5, 'skew 까지 숫자 5 개면 서로 다르게 기울인 사진이 최소 3 장 필요하고, 정면 사진은 단서가 되지 않습니다.'],
        [25.5, 31.7, 'closed-form 답으로 시작해 refinement 하자, 논문 실험의 RMS 가 0.881 에서 0.335 pixel 로 줄었습니다.'],
      ],
    },
    {
      id: 'pause-rms',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. corner 세 개의 reprojection error 가 0, 0, 3 pixel 이면 RMS 는 얼마일까요?'],
        [16.5, 23.5, '제곱하면 0, 0, 9 이고 평균은 9 ÷ 3 으로 3 이라서, RMS 는 3 의 제곱근인 약 1.73 pixel 입니다.'],
      ],
    },
    {
      id: 'marker',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'ArUco marker 는 흑백 칸으로 ID 를 적은 정사각형 표식이고, detector 는 ID 와 네 꼭짓점 pixel 을 냅니다.'],
        [7, 14, '거리는 f × 실제 크기 ÷ 사진 속 크기라서, 한 변 0.05 m marker 가 50 pixel 로 찍히면 0.5 m 입니다.'],
        [14, 21, '중심 (370, 215) 를 depth 0.5 m 로 back-projection 하면 (0.05, −0.025, 0.5) 입니다.'],
        [21, 27.7, '기울어 사다리꼴로 찍히면, 꼭짓점의 3D 좌표 4 개와 pixel 4 개로 pose 를 푸는 PnP 를 씁니다.'],
      ],
    },
    {
      id: 'marker-error',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'base 의 (0.3, 0, 0.5) 에서 아래를 보는 카메라라면, marker 는 base 의 (0.35, 0.025, 0) 입니다.'],
        [7, 14, '꼭짓점 pixel 은 1 pixel 쯤 틀릴 수 있는데, 중심 u 가 370 에서 371 로 틀리면 좌우 위치는 1 mm 틀립니다.'],
        [14, 21, '한 변이 49 pixel 로 틀리면 거리는 약 0.510 m 로 약 1 cm 틀려, 좌우 오차의 10 배입니다.'],
        [21, 27.7, '그래서 정밀하게 집으려면 큰 marker 를 쓰거나, 여러 marker 를 배열한 board 를 쓰거나, 카메라를 가까이 둡니다.'],
      ],
    },
    {
      id: 'pause-marker',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 한 변 0.04 m marker 가 20 pixel 로 찍히면 거리는 얼마이고, 19 pixel 이면 얼마일까요?'],
        [16.5, 23.5, '500 × 0.04 ÷ 20 으로 1 m 이고, 19 pixel 이면 약 1.053 m 라서 약 5 cm 틀립니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. pixel 은 방향만 주고, 거리는 depth camera, stereo, 크기를 아는 marker 로 채웁니다.'],
        [4.2, 8.2, 'intrinsics 와 distortion 계수는 camera_info 에 담기고, extrinsics 는 tf2 로 다룹니다.'],
        [8.2, 12.2, 'homography 로 K 를 추측해 다듬고, distortion 을 빼면 RMS 가 0.42 에서 1.56 pixel 로 커집니다.'],
        [12.2, 15.7, '크기를 아는 marker 로 거리를 구하지만, 같은 1 pixel 오차가 거리에는 좌우보다 10 배 크게 들어갑니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 3.6, '물체의 3D 위치로 잡기 자세를 정하고 옮기는 과정은 Classical Pick & Place 에서 다룹니다.'],
        [3.6, 6.6, '카메라가 달린 자리는 Hand-Eye Calibration 에서, 지도 만들기는 Visual SLAM & VIO 에서 다룹니다.'],
      ],
    },
  ],
}
