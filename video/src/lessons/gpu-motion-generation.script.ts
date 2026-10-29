import type { VideoScript } from '../script.ts'

// Numbers follow lessons/gpu-motion-generation/README.md: MoveIt 2's RRTConnect → shortcut → TOTG (451.2° → 370.7°, the
// ~240° route not reached), cuRobo's 2,600 Franka Panda problems at a mean 50 ms on an RTX 4090 vs Tesseract's 2.95 s on the
// same PC (0.3 m/s box: 0.3 × 2.95 = 0.885 m, 0.3 × 0.05 = 0.015 m); 32 poses × 7 joints = 224 variables, weight 5000; the
// planar example (sphere r 0.1 m from (0, 0) to (4, 0), obstacle centre (2, 0.3) r 0.4 m, enlarged boundary 0.5 m; costs
// straight seed 10 × 0.2 = 2.0, B −0.1/−0.3/−0.1 → 0.01 + 0.04 + 0.04 + 0.01 = 0.10, C 0.2/0.9/0.2 → 1.06; d = 0.3 − 0.5 =
// −0.2, gradient +10, step 0.01 → 0 − 0.01 × 10 = −0.1, neighbour gradient +0.2; seed at y = 0.5 → C); TrajOpt on 198 PR2
// problems 84.3% / 0.206 s with one seed vs 99.0% / 0.307 s with four, CHOMP 67.7% / 83.3%; the check question (−0.1, −0.2,
// −0.1 → d = 0.5 − 0.4 − 0.1 = 0, smoothness 0.04); Panda's 61 spheres r 1.1 ~ 6 cm (v0.7.8), 65 with 4 for the held object,
// sphere pairs halved; nvblox ESDF 1.9 ms vs voxblox 58 ms = 31×; η = 0.025 m and the r 0.06 m spheres (ESDF 0.12 / 0.07 /
// 0.04 → d 0.06 / 0.01 / −0.02 → cost 0 / (0.025 − 0.01)² ÷ (2 × 0.025) = 0.0045 / 0.02 + 0.025 ÷ 2 = 0.0325, slope 0 /
// −0.6 / −1); η 0 → 2.5 cm: 38% → 65%, continuous check 69%, speed metric 71%; buffers 0.004 m (Franka) and 0.01 m (UR10e);
// the check question (ESDF 0.08 → d 0.02, cost (0.025 − 0.02)² ÷ 0.05 = 0.0005, slope −0.2); 12 × 32 × 65 = 24,960 lookups,
// 30 IK seeds, particle twice then L-BFGS; particle example (y −0.2 / 0 / +0.2, costs 0.08 / 2.0 / 4.08, exp 1 / 0.147 /
// 0.018, sum 1.165, weights 0.86 / 0.13 / 0.02, new y ≈ −0.17, β = 1); particle +2 ms, 71% → 76% and 82% → 85%; L-BFGS on
// (x − 3)²: 0 → 0.6 → 1.08 vs 0.6 → 3.0 (y/s = 1.2 ÷ 0.6 = 2, step 2.4); 28 ms: gradient descent 61% vs L-BFGS 85%; the
// seed table 1 / 12 / 48 / 128 → 77 / 84 / 87 / 88% at 25 / 27 / 36 / 66 ms, graph planner paths 96% at 116 ms; cage scene
// 4 → 48 seeds: RTX 4090 27 → 35 ms, Orin 15 W 181 → 598 ms; dt: halving dt → ×2 / ×4 / ×8, dt 0.25 s × 31 = 7.75 s, the
// example 0.4 rad/s, 0.5 rad/s², 2 rad/s³ vs limits 2, 15, 500 → s ≥ 0.2 / 0.183 / 0.159 → s = 0.2, dt 0.05 s, 31 × 0.05 =
// 1.55 s, 0.5 ÷ 0.04 = 12.5, 2 ÷ 0.008 = 250; the check question (0.3 / 0.6 / 1 → 0.15 / 0.2 / ≈ 0.126 → 0.2); motion
// quality Tesseract 1.96 s / 200, Tesseract-TG 1.25 s / 602, cuRobo 1.59 s / 49 (1.59 − 1.25 = 0.34 s, 602 ÷ 49 ≈ 12);
// benchmark: 12 scene kinds, 5 mm / 5%, Ryzen 9 7950X vs RTX 4090, 60 s limit, mean 50 ms, 75th 30 ms, 98th 260 ms, Orin
// 15 W mean 0.48 s / 98th 3.3 s, VAMP median 40 µs, MoveIt/OMPL 23.51 ms, Tesseract's RRTConnect 1.5 s; IK one pose 2.7 ms
// vs TRAC-IK 0.9 ms, 1,000 poses 27 ms vs 629 ms; MPC: 0.3 × 1.59 ≈ 0.48 m, horizon 30 steps, 400 samples, 5 iterations,
// 500 commands a second vs STORM 125, 0.3 × 0.03 = 0.009 m = 9 mm; the check question (1 ÷ 500 = 0.002 s = 2 ms, 1 × 0.002
// = 0.002 m = 2 mm); cuMotion: XRDF (UR10e 12 rad/s², 500 rad/s³), read_esdf_world false → true, ESDF service 30 s, robot
// segmenter distance_threshold 0.05 m, allow_nonzero_velocity_at_trajectory_end false → true, time_dilation_factor 0.5 → dt
// × 1 ÷ 0.5 = 2, Jetson Thor under 1 s, discrete GPU tens of ms.

const S1 = 'trajectory 최적화'
const S2 = '구 근사와 SDF'
const S3 = 'seed 병렬과 dt'
const S4 = 'MPC 와 cuMotion'

export const script: VideoScript = {
  id: 'gpu-motion-generation',
  title: 'GPU Motion Generation',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/gpu-motion-generation',
  sections: [S1, S2, S3, S4],
  terms: [
    ['allow_nonzero_velocity_at_trajectory_end', '얼라우 논제로 벨로시티 앳 트래젝토리 엔드'],
    ['joint_trajectory_controller', '조인트 트래젝토리 컨트롤러'],
    ['trajectory optimization', '트래젝토리 옵티마이제이션'],
    ['GPU Motion Generation', '지피유 모션 제너레이션'],
    ['signed distance field', '사인드 디스턴스 필드'],
    ['activation distance', '액티베이션 디스턴스'],
    ['time_dilation_factor', '타임 다일레이션 팩터'],
    ['isaac_ros_cumotion', '아이작 로스 큐모션'],
    ['planning_pipelines', '플래닝 파이프라인즈'],
    ['motion generation', '모션 제너레이션'],
    ['gradient descent', '그래디언트 디센트'],
    ['Diffusion Policy', '디퓨전 폴리시'],
    ['read_esdf_world', '리드 이에스디에프 월드'],
    ['robot segmenter', '로봇 세그멘터'],
    ['buffer_distance', '버퍼 디스턴스'],
    ['Grasp Planning', '그래스프 플래닝'],
    ['planning scene', '플래닝 신'],
    ['planning', '플래닝'],
    ['local minimum', '로컬 미니멈'],
    ['Tesseract-TG', '테서랙트 티지'],
    ['Franka Panda', '프랑카 판다'],
    ['depth camera', '뎁스 카메라'],
    ['RRTConnect', '알알티 커넥트'],
    ['controller', '컨트롤러'],
    ['Tesseract', '테서랙트'],
    ['trajectory', '트래젝토리'],
    ['Isaac ROS', '아이작 로스'],
    ['collision', '콜리전'],
    ['waypoint', '웨이포인트'],
    ['gradient', '그래디언트'],
    ['particle', '파티클'],
    ['pipeline', '파이프라인'],
    ['shortcut', '숏컷'],
    ['cuMotion', '큐모션'],
    ['horizon', '호라이즌'],
    ['TrajOpt', '트래즈옵트'],
    ['voxblox', '복스블록스'],
    ['L-BFGS', '엘 비에프지에스'],
    ['MoveIt', '무브잇'],
    ['cuRobo', '큐로보'],
    ['nvblox', '엔브이블록스'],
    ['weight', '웨이트'],
    ['plugin', '플러그인'],
    ['Panda', '판다'],
    ['STORM', '스톰'],
    ['block', '블록'],
    ['voxel', '복셀'],
    ['RViz', '알비즈'],
    ['YAML', '야믈'],
    ['TOTG', '티오티지'],
    ['ESDF', '이에스디에프'],
    ['MPPI', '엠피피아이'],
    ['SIMD', '심드'],
    ['XRDF', '엑스알디에프'],
    ['URDF', '유알디에프'],
    ['jerk', '저크'],
    ['seed', '시드'],
    ['pose', '포즈'],
    ['link', '링크'],
    ['true', '트루'],
    ['false', '폴스'],
    ['GPU', '지피유'],
    ['CPU', '씨피유'],
    ['SDF', '에스디에프'],
    ['MPC', '엠피씨'],
    ['RTX', '알티엑스'],
    ['PR2', '피알 투'],
    ['ROS', '로스'],
    ['IK', '아이케이'],
    ['dt', '디티'],
    ['PC', '피씨'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
    ['µs', '마이크로초'],
    ['ms', '밀리초'],
    ['η', '에타'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'GPU Motion Generation 은 경로 찾기와 다듬기를 나누지 않고 trajectory 전체를 비용 하나로 최적화합니다.'],
        [4.2, 7.8, '비용 하나의 최적화, 구 근사와 SDF, seed 병렬과 dt 재조정, MPC 와 cuMotion 을 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '선반 옆으로 사람이 상자를 밀어 넣으면 7 관절 팔은 경로를 다시 계획해야 하는데, 세 단계에 몇 초가 걸립니다.'],
        [4.4, 7.8, '장면이 바뀔 때마다 다시 계획해도 될 만큼 빠르고, 로봇에 그대로 보낼 만큼 매끄러운 trajectory 를 어떻게 얻을까요?'],
      ],
    },
    {
      id: 'pipeline',
      seconds: 26,
      section: S1,
      cues: [
        [0.3, 6, 'MoveIt 2 는 RRTConnect 로 경로를 찾고, shortcut 으로 펴고, TOTG 로 시각을 붙입니다.'],
        [6, 12.5, '뒤 단계는 앞 결과를 고치기만 해서 shortcut 은 451.2° 를 370.7° 로 줄였을 뿐 약 240° 길로 못 옮겼습니다.'],
        [12.5, 19, 'cuRobo 는 최적화 수십 개를 GPU 에서 동시에 풀어 Panda 문제 2,600 개를 평균 50 ms 에 풀었습니다.'],
        [19, 25.5, 'Tesseract 는 평균 2.95 초입니다. 0.3 m/s 상자는 그동안 0.885 m 를 가고 50 ms 에는 0.015 m 갑니다.', 'Tesseract 는 평균 2.95 초입니다. 초속 0.3 m 상자는 그동안 0.885 m 를 가고 50 ms 에는 0.015 m 갑니다.'],
      ],
    },
    {
      id: 'trajopt',
      seconds: 32,
      section: S1,
      cues: [
        [0.3, 6.5, 'trajectory 를 숫자 목록으로 두고 고쳐 비용을 줄입니다. 자세 32 개 × 관절 7 개 = 224 개가 변수입니다.', 'trajectory 를 숫자 목록으로 두고 고쳐 비용을 줄입니다. 자세 32 개 곱하기 관절 7 개, 224 개가 변수입니다.'],
        [6.5, 13, '평면 예시로 반지름 0.1 m 구의 길에 반지름 0.4 m 장애물이 있고, waypoint 셋의 y 만 고칩니다.'],
        [13, 19.5, '충돌 비용은 파고든 깊이 × 10 이고 매끄러움은 이웃 y 차이의 제곱 합입니다. 직선 seed 는 0.2 m 파고들어 2.0 입니다.'],
        [19.5, 26, 'B 는 아래로 돌아 0.10, C 는 위로 돌아 1.06 입니다. gradient +10 이라 step 0.01 로 y 는 −0.1 이 됩니다.'],
        [26, 31.7, 'y = 0.5 에서 출발한 seed 는 위로 밀려 비용 1.06 인 C 에 멈춥니다. 이런 해가 local minimum 입니다.', 'y 0.5 에서 출발한 seed 는 위로 밀려 비용 1.06 인 C 에 멈춥니다. 이런 해가 local minimum 입니다.'],
      ],
    },
    {
      id: 'pause-trajopt',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. y 를 −0.1, −0.2, −0.1 로 두면 비용의 합은 얼마이고, 구는 장애물과 어떤 관계일까요?'],
        [16.5, 23.5, 'd = 0.5 − 0.4 − 0.1 = 0 이라 충돌 비용은 0 이고 합은 0.04 입니다. B 보다 작지만 표면에 딱 붙습니다.', 'd 는 0.5 빼기 0.4 빼기 0.1, 0 이라 충돌 비용은 0 이고 합은 0.04 입니다. B 보다 작지만 표면에 딱 붙습니다.'],
      ],
    },
    {
      id: 'spheres',
      seconds: 28,
      section: S2,
      cues: [
        [0.3, 6, '충돌 비용을 1 초에 수백만 번 계산하려면 거리가 단순해야 해서, cuRobo 는 로봇 전체를 구 여러 개로 근사합니다.'],
        [6, 12, 'Panda 설정에는 반지름 1.1 ~ 6 cm 구가 61 개 있고, 장애물까지 거리는 중심의 거리에서 반지름을 뺀 값입니다.', 'Panda 설정에는 반지름 1.1 에서 6 cm 구가 61 개 있고, 장애물까지 거리는 중심의 거리에서 반지름을 뺀 값입니다.'],
        [12, 18.5, '거리는 SDF 에서 읽습니다. voxel 마다 가장 가까운 표면까지 거리를 밖은 +, 안은 − 로 적은 표입니다.', '거리는 SDF 에서 읽습니다. voxel 마다 가장 가까운 표면까지 거리를 밖은 플러스, 안은 마이너스로 적은 표입니다.'],
        [18.5, 25, 'nvblox 가 카메라 장면을 이 표로 바꿉니다. ESDF 갱신 1.9 ms 는 voxblox 의 58 ms 보다 31 배 빠릅니다.'],
      ],
    },
    {
      id: 'activation',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '깊이에만 비용을 주면 구가 표면에 붙어 지나가므로, activation distance η 안쪽은 비용을 제곱으로 올립니다.'],
        [6, 12.5, 'η 는 0.025 m 입니다. 반지름 0.06 m 구의 ESDF 값이 0.12 면 d 는 0.06 으로 η 보다 커 비용 0 입니다.'],
        [12.5, 19, 'ESDF 값 0.07 이면 d = 0.01 로 비용 0.0045 이고, 0.04 면 d = −0.02 로 파고들어 비용 0.0325 입니다.', 'ESDF 값 0.07 이면 d 는 0.01 로 비용 0.0045 이고, 0.04 면 d 는 −0.02 로 파고들어 비용 0.0325 입니다.'],
        [19, 25, '기울기 −0.6 과 −1 은 음수라서 d 를 늘리면 비용이 줍니다. 파고든 뒤에는 −1 로 일정해 밀어내는 힘이 폭발하지 않습니다.'],
        [25, 29.7, 'seed 하나와 L-BFGS 만 쓴 실험에서 η 를 0 에서 2.5 cm 로 바꾸자 성공률이 38% 에서 65% 로 올랐습니다.'],
      ],
    },
    {
      id: 'pause-sdf',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 반지름 0.06 m 구의 ESDF 값이 0.08 m 이고 η 는 0.025 m 입니다. 비용과 기울기는 얼마일까요?'],
        [16.5, 23.5, 'd = 0.02 m 로 η 안입니다. 비용은 (0.025 − 0.02)² ÷ 0.05 = 0.0005 이고 기울기는 −0.2 입니다.', 'd 는 0.02 m 로 η 안입니다. 비용은 0.025 빼기 0.02 의 제곱 나누기 0.05, 0.0005 이고 기울기는 −0.2 입니다.'],
      ],
    },
    {
      id: 'seeds',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6, 'seed 를 더 쓰면 성공률이 오릅니다. cuRobo 는 seed 1, 12, 48, 128 개에서 77, 84, 87, 88% 를 풀었습니다.'],
        [6, 12.5, 'GPU 는 seed·자세·구마다 거리를 동시에 계산해 12 × 32 × 65 = 24,960 번의 조회가 서로 기다리지 않습니다.', 'GPU 는 seed, 자세, 구마다 거리를 동시에 계산해 12 곱하기 32 곱하기 65, 24,960 번의 조회가 서로 기다리지 않습니다.'],
        [12.5, 19, 'IK seed 30 개로 목표 자세를 얻고, seed 마다 particle 최적화 두 번과 L-BFGS 를 거쳐 최선을 고릅니다.'],
        [19, 25.5, 'particle 최적화는 후보를 흔들어 비용이 작은 쪽에 큰 weight 를 주고 평균합니다. 예시의 새 y 는 약 −0.17 입니다.'],
        [25.5, 31.7, 'L-BFGS 는 gradient 변화로 휜 정도를 추정해 같은 28 ms 에 gradient descent 61% 대 85% 를 풀었습니다.'],
      ],
    },
    {
      id: 'dt',
      seconds: 32,
      section: S3,
      cues: [
        [0.3, 6, 'dt 를 절반으로 줄이면 속도, 가속도, jerk 가 2 배, 4 배, 8 배로 늘어서 cuRobo 는 dt 를 따로 찾습니다.'],
        [6, 12.5, '속도 0.4, 가속도 0.5, jerk 2 가 한계 2, 15, 500 에 들려면 배율 s 는 0.2, 0.183, 0.159 이상입니다.'],
        [12.5, 19, 's = 0.2 라서 dt 는 0.05 초, 이동 시간은 31 × 0.05 = 1.55 초입니다. 속도만 한계에 닿습니다.', 's 는 0.2 라서 dt 는 0.05 초, 이동 시간은 31 곱하기 0.05, 1.55 초입니다. 속도만 한계에 닿습니다.'],
        [19, 25.5, '평균 최대 jerk 는 cuRobo 49 에 Tesseract-TG 602 로 약 12 배 차이입니다. 대신 0.34 초 빨리 끝났습니다.'],
        [25.5, 31.7, '계획 시간은 평균 50 ms 지만 75번째 백분위 30 ms, 98번째 260 ms 라서 주기는 꼬리로 정합니다.'],
      ],
    },
    {
      id: 'pause-dt',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 최대 속도 0.3, 가속도 0.6, jerk 1 이면 새 dt 와 이동 시간은 얼마이고 어느 한계가 정할까요?'],
        [16.5, 23.5, '조건 0.15, 0.2, 약 0.126 중 가장 큰 0.2 라서 dt 는 0.05 초, 이동 시간은 1.55 초이고 가속도가 정합니다.'],
      ],
    },
    {
      id: 'mpc',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6, '계획 한 번은 실행 중 장면을 다시 보지 않습니다. 이동 시간 1.59 초 동안 0.3 m/s 상자는 약 0.48 m 움직입니다.', '계획 한 번은 실행 중 장면을 다시 보지 않습니다. 이동 시간 1.59 초 동안 초속 0.3 m 상자는 약 0.48 m 움직입니다.'],
        [6, 12.5, 'MPC 는 짧은 horizon 의 명령을 매 주기 새로 최적화하고 첫 명령만 보냅니다. MPPI 식 particle 최적화입니다.'],
        [12.5, 19, '설정은 horizon 30 step, 후보 400 개이고 RTX 4090 에서 1 초에 500 번 명령을 냅니다.'],
        [19, 25.5, '0.03 초마다 명령을 내면 상자는 그 사이 9 mm 만 움직입니다. 대신 움직임의 질과 안전 보장이 약합니다.'],
      ],
    },
    {
      id: 'cumotion',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 6.5, 'ROS 2 에서는 cuRobo 를 품은 Isaac ROS cuMotion 을 MoveIt 2 의 pipeline 으로 붙입니다.'],
        [6.5, 13, 'cuMotion 은 URDF 와 함께 XRDF 를 요구합니다. collision 구, 가속도·jerk 한계, 여유를 적는 YAML 입니다.'],
        [13, 19.5, '기본값은 planning scene 물체만 봅니다. depth camera 를 쓰려면 nvblox 와 read_esdf_world 를 켭니다.'],
        [19.5, 26.5, '끝 속도가 0 이 아니어도 controller 가 받게 하고, time_dilation_factor 0.5 는 속도를 절반으로 만듭니다.'],
      ],
    },
    {
      id: 'pause-mpc',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 1 초에 500 번 명령을 내면 명령 사이는 몇 ms 이고, 1 m/s 로 오는 손은 그동안 몇 mm 움직일까요?', '멈추고 적어 보기. 1 초에 500 번 명령을 내면 명령 사이는 몇 ms 이고, 초속 1 m 로 오는 손은 그동안 몇 mm 움직일까요?'],
        [16.5, 23.5, '명령 사이는 1 ÷ 500 = 0.002 초, 2 ms 입니다. 손은 그동안 1 × 0.002 = 0.002 m, 2 mm 움직입니다.', '명령 사이는 1 나누기 500, 0.002 초, 2 ms 입니다. 손은 그동안 1 곱하기 0.002, 0.002 m, 2 mm 움직입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4, '답입니다. 224 개 숫자를 고쳐 비용을 줄이고, 직선 seed 2.0 은 0.10 으로 가지만 위쪽 seed 는 1.06 에 멈춥니다.'],
        [4, 8, '구 근사와 ESDF 로 충돌 비용과 gradient 가 조회 한 번에 나오고, η 2.5 cm 는 38% 를 65% 로 올렸습니다.'],
        [8, 12, 'seed 수십 개를 particle 과 L-BFGS 로 함께 풀고 dt 를 다시 정해 평균 50 ms 입니다. 배율은 상대마다 다릅니다.'],
        [12, 15.7, '바뀌는 장면은 0.03 초마다 고치는 MPC 로 다루지만 질과 안전 보장이 약하고, cuMotion 은 MoveIt 2 에 붙입니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '다음은 잡을 자세를 정하는 Grasp Planning 과, policy 가 action 을 내는 Diffusion Policy 입니다.'],
      ],
    },
  ],
}
