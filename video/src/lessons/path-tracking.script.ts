import type { VideoScript } from '../script.ts'

// Numbers follow lessons/path-tracking/README.md: controller_server at 20 Hz (controller_frequency 20.0), cmd_vel; the
// differential drive (v = (v_R + v_L) ÷ 2, ω = (v_R − v_L) ÷ b; TurtleBot3 Burger b = 0.160 m, v 0.15 m/s, ω 0.5 rad/s →
// 0.15 + 0.5 × 0.08 = 0.19, 0.15 − 0.04 = 0.11 m/s, R = 0.15 ÷ 0.5 = 0.3 m; table (0.15, 0) / (0, 1.0) → 0.08, −0.08 /
// (0.22, 0.5) → 0.26, 0.18; teleop 0.22 m/s, 0.22 − 0.04 = 0.18); the bicycle model (tan δ = W ÷ R, 2.7 m, 35°,
// 2.7 ÷ tan 35° = 2.7 ÷ 0.700 = 3.86 m); PID on cross-track error (0.5 m/s, 0.5 m left, ω = −2e, 3.4 s → 0.52 m right,
// 6.8 s → 0.54 m left, 10.2 s → 0.56 m right; ω = −2e − 2θe → 5 cm in 3.9 s; 2 m circle, 0.5 × 0.5 = 0.25 rad/s,
// 0.25 ÷ 2 ≈ 0.12 m, feedforward vκ); pure pursuit (κ = 2y ÷ L², L = 1 m, y = 0.25 m → 2 × 0.25 ÷ 1² = 0.5 /m, radius 2 m,
// ω = 0.5 × 0.5 = 0.25 rad/s, 2.5 cm per cycle, gain 2 ÷ L²); lookahead (0.3 m → 2 ÷ 0.09 = 22.2, 0.6 m → 5.6, 1.5 m →
// 2 ÷ 2.25 = 0.89, 25 배; 0.3 s delay, 0.25 m start: > ±5 cm after 25 s / 1.7 s / 4.5 s; 90° corner 0.11 / 0.23 / 0.57 m;
// RPP lookahead_dist 0.6 m, lookahead_time 1.5 s, 0.3 ~ 0.9 m, 0.5 × 1.5 = 0.75 m, 1.0 m/s → 0.9 m); Stanley
// (δ = θe + arctan(k e ÷ v), 0.5 m, 20°, k = 1, 1 m/s → arctan(0.5) = 26.6°, 46.6° > 35°; 10 m/s → arctan(0.05) = 2.9°;
// exp(−1) ≈ 0.37, 0.5 → 0.18 → 0.025 m in 1 s / 3 s; 20 times a second); MPC (0.5 m/s, 0.3 m left, |ω| ≤ 1 rad/s,
// 3 steps of 0.5 s = 1.5 s, cost 10e² + θe² + 0.1ω²; A 0 0 0 → 0.30 0.30 0.30, 2.70; B −1 −1 −1 → 0.24 0.07 −0.16, 4.69;
// C −1 0 +1 → 0.24 0.12 0.06, 1.45; D −0.5 0 +0.5 → 0.27 0.21 0.18, 1.64; 20 Hz → 0.05 s; check 10 × 0.3² = 0.9,
// 0.9 × 3 = 2.7); Nav2 controllers (Humble / Iron DWB, Jazzy MPPI; DWA RHINO 0.25 s, 50 cm/s², 60°/s² → ±12.5 cm/s,
// ±15°/s; DWB 20 × 20 = 400 pairs, sim_time 1.7 s; RPP min radius 0.9 m, 0.5 m/s, 1.2 / 0.6 / 0.3 m → 0.5 / 0.33 / 0.17 →
// 0.25 m/s; MPPI batch_size 2000, 56 steps × 0.05 s = 2.8 s, vx_max 0.5 m/s → 1.4 m, 2000 × 56 = 112,000, 224 만 a second);
// the control period (0.5 ÷ 20 = 2.5 cm, 0.5 ÷ 5 = 10 cm, 14.0 ÷ 20 = 0.70 m; MPPI 50 ms; 3 s × 0.5 m/s → radius 1.5 m,
// width 3 m; check 1 ÷ 20 = 0.05 s, 5 cm, 56 × 0.05 = 2.8 s, 2.8 m).

const S1 = 'kinematics 와 PID'
const S2 = 'pure pursuit'
const S3 = 'Stanley 와 MPC'
const S4 = 'Nav2 와 제어 주기'

export const script: VideoScript = {
  id: 'path-tracking',
  title: 'Path Tracking',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/path-tracking',
  sections: [S1, S2, S3, S4],
  terms: [
    ['path tracking', '패스 트래킹'],
    ['Regulated Pure Pursuit', '레귤레이티드 퓨어 퍼슈트'],
    ['Autonomous Driving Stack', '오토노머스 드라이빙 스택'],
    ['differential drive', '디퍼런셜 드라이브'],
    ['cross-track error', '크로스 트랙 에러'],
    ['controller_server', '컨트롤러 서버'],
    ['receding horizon', '리시딩 호라이즌'],
    ['lookahead point', '룩어헤드 포인트'],
    ['TurtleBot3 Burger', '터틀봇 쓰리 버거'],
    ['heading error', '헤딩 에러'],
    ['pure pursuit', '퓨어 퍼슈트'],
    ['feedforward', '피드포워드'],
    ['localization', '로컬라이제이션'],
    ['perception', '퍼셉션'],
    ['prediction', '프리딕션'],
    ['kinematics', '키네매틱스'],
    ['controller', '컨트롤러'],
    ['lookahead', '룩어헤드'],
    ['planning', '플래닝'],
    ['control', '컨트롤'],
    ['costmap', '코스트맵'],
    ['cmd_vel', '커맨드 벨'],
    ['heading', '헤딩'],
    ['horizon', '호라이즌'],
    ['Stanley', '스탠리'],
    ['planner', '플래너'],
    ['adaptive', '어댑티브'],
    ['critic', '크리틱'],
    ['weight', '웨이트'],
    ['plugin', '플러그인'],
    ['Humble', '험블'],
    ['arctan', '아크탄젠트'],
    ['Jazzy', '재지'],
    ['local', '로컬'],
    ['stack', '스택'],
    ['Iron', '아이언'],
    ['gain', '게인'],
    ['Nav2', '내브 투'],
    ['MPPI', '엠피피아이'],
    ['rad/s', '라디안 매 초'],
    ['cm/s', '센티미터 매 초'],
    ['m/s', '미터 매 초'],
    ['tan', '탄젠트'],
    ['MPC', '엠피씨'],
    ['DWB', '디더블유비'],
    ['RPP', '알피피'],
    ['PID', '피아이디'],
    ['km', '킬로미터'],
    ['cm', '센티미터'],
    ['/m', ' 퍼 미터'],
    ['θe', '세타 이'],
    ['ω', '오메가'],
    ['κ', '카파'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'planner 가 그린 경로를 따라가도록 매 주기 직진 속도와 회전 속도를 정하는 일을 path tracking 이라고 합니다.'],
        [4.2, 7.8, 'kinematics 와 PID, pure pursuit, Stanley 와 MPC, Nav2 controller 와 제어 주기를 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '경로에서 벗어난 거리만큼만 반대로 돌게 하면, 로봇은 경로를 지나쳐 좌우로 넘나들기를 되풀이합니다.'],
        [4.4, 7.8, '옆으로 곧장 움직이지 못하는 로봇을 흔들림 없이 되돌리려면, 1초에 20 번 보내는 속도를 어떻게 정해야 할까요?'],
      ],
    },
    {
      id: 'kinematics',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, 'Nav2 의 controller_server 는 1초에 20 번 직진 속도 v 와 회전 속도 ω 를 정해 cmd_vel 로 보냅니다.'],
        [6, 12, 'differential drive 의 v 는 두 바퀴 속도의 평균이고, ω 는 두 바퀴의 속도 차를 바퀴 간격 b 로 나눈 값입니다.'],
        [12, 18, 'TurtleBot3 Burger 에 v 0.15 m/s, ω 0.5 rad/s 를 보내면 바퀴는 0.19, 0.11 m/s 로 돕니다.'],
        [18, 24, '이때 반지름은 0.15 ÷ 0.5 로 0.3 m 입니다. 바퀴는 로봇이 향한 방향으로만 굴러서 옆으로는 못 갑니다.'],
        [24, 29.7, '차는 제자리에서 돌지 못합니다. 축간거리 2.7 m, 최대 조향각 35° 로는 반지름 3.86 m 보다 작게 돌 수 없습니다.'],
      ],
    },
    {
      id: 'pid',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '0.5 m/s 로봇이 경로 왼쪽 0.5 m 에서 출발하고, cross-track error 에만 P 제어 ω = −2e 를 겁니다.', '0.5 m/s 로봇이 경로 왼쪽 0.5 m 에서 출발하고, cross-track error 에만 P 제어를 걸어 ω 를 오차의 마이너스 2 배로 정합니다.'],
        [6, 12, '로봇은 3.4 초 뒤 오른쪽 0.52 m, 6.8 초 뒤 왼쪽 0.54 m 에 가 있어서 흔들림이 조금씩 커집니다.'],
        [12, 18, 'e 가 0 인 순간에는 회전 명령도 0 이지만, 로봇은 경로를 비스듬히 향한 채 그대로 반대편으로 넘어갑니다.', '오차가 0 인 순간에는 회전 명령도 0 이지만, 로봇은 경로를 비스듬히 향한 채 그대로 반대편으로 넘어갑니다.'],
        [18, 24, 'heading error 항을 더한 ω = −2e − 2θe 는 D 항처럼 작용해서, 3.9 초 만에 경로 5 cm 안으로 들어옵니다.', 'heading error 항을 더해 ω 를 오차의 마이너스 2 배에서 θe 의 2 배를 뺀 값으로 정하면 D 항처럼 작용해서, 3.9 초 만에 경로 5 cm 안으로 들어옵니다.'],
        [24, 29.7, '반지름 2 m 원에서는 약 0.12 m 가 남는데, 곡률로 구한 vκ 를 미리 더하는 feedforward 를 넣으면 0 이 됩니다.', '반지름 2 m 원에서는 약 0.12 m 가 남는데, 곡률로 구한 v 곱하기 κ 를 미리 더하는 feedforward 를 넣으면 0 이 됩니다.'],
      ],
    },
    {
      id: 'pause-wheels',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 바퀴 간격 0.4 m 인 로봇의 오른쪽 바퀴가 0.6 m/s, 왼쪽 바퀴가 0.4 m/s 입니다. v, ω, 반지름은?'],
        [16.5, 23.5, 'v 는 1.0 ÷ 2 = 0.5 m/s, ω 는 0.2 ÷ 0.4 = 0.5 rad/s 이고, 반지름은 0.5 ÷ 0.5 = 1 m 입니다.', 'v 는 1.0 ÷ 2 로 0.5 m/s, ω 는 0.2 ÷ 0.4 로 0.5 rad/s 이고, 반지름은 0.5 ÷ 0.5 로 1 m 입니다.'],
      ],
    },
    {
      id: 'pure-pursuit',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, 'pure pursuit 는 경로 위에서 거리 L 만큼 앞의 lookahead point 를 고르고, 그 점을 지나는 원호를 따라갑니다.'],
        [6, 12, '원호는 로봇이 지금 향한 방향에 접하고, 곡률은 그 점이 옆으로 떨어진 거리 y 하나로 정해지는 2y ÷ L² 입니다.', '원호는 로봇이 지금 향한 방향에 접하고, 곡률은 그 점이 옆으로 떨어진 거리 y 하나로 정해지는 2 y 나누기 L 제곱입니다.'],
        [12, 18, 'L 1 m, y 0.25 m 면 곡률은 2 × 0.25 ÷ 1² = 0.5 /m 이고, 0.5 m/s 에서 ω 는 0.25 rad/s 입니다.', 'L 1 m, y 0.25 m 면 곡률은 2 × 0.25 ÷ 1 제곱으로 0.5 /m 이고, 0.5 m/s 에서 ω 는 0.25 rad/s 입니다.'],
        [18, 24, '다음 주기에는 2.5 cm 나아간 자리에서 다시 점을 고르므로, 로봇은 L 만큼 앞서 움직이는 점을 쫓아갑니다.'],
        [24, 29.7, 'pure pursuit 도 gain 이 2 ÷ L² 인 P 제어지만, 앞쪽 오차라서 heading 항과 feedforward 가 필요 없습니다.', 'pure pursuit 도 gain 이 2 나누기 L 제곱인 P 제어지만, 앞쪽 오차라서 heading 항과 feedforward 가 필요 없습니다.'],
      ],
    },
    {
      id: 'lookahead',
      seconds: 26,
      section: S2,
      cues: [
        [0.3, 6.5, 'gain 은 L 0.3 m 에서 22.2, 1.5 m 에서 0.89 로 25 배 차이입니다. 명령이 0.3 초 늦게 반영된다고 합시다.'],
        [6.5, 13, '0.6 m 는 1.7 초, 1.5 m 는 4.5 초 만에 들어오지만, L 0.3 m 는 25 초가 지나도 ±5 cm 넘게 흔들립니다.'],
        [13, 19.5, '지연 없이 90° 모퉁이를 돌면 꼭짓점과의 거리가 0.11, 0.23, 0.57 m 로, L 이 길수록 안쪽을 가로지릅니다.'],
        [19.5, 25.7, 'Regulated Pure Pursuit 는 기본 0.6 m 를 쓰고, 속도 비례를 켜면 v × 1.5 초를 0.3 ~ 0.9 m 로 자릅니다.', 'Regulated Pure Pursuit 는 기본 0.6 m 를 쓰고, 속도 비례를 켜면 v 곱하기 1.5 초를 0.3 에서 0.9 m 사이로 자릅니다.'],
      ],
    },
    {
      id: 'pause-pursuit',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 0.4 m/s 로 달리는 로봇의 L = 0.8 m 앞 경로 점이 옆으로 0.16 m 에 있습니다. 회전 속도는?', '멈추고 적어 보기. 0.4 m/s 로 달리는 로봇의 L 0.8 m 앞 경로 점이 옆으로 0.16 m 에 있습니다. 회전 속도는?'],
        [16.5, 23.5, '곡률은 2 × 0.16 ÷ 0.8² = 0.32 ÷ 0.64 = 0.5 /m 이고, ω = 0.4 × 0.5 = 0.2 rad/s 입니다.', '곡률은 2 × 0.16 ÷ 0.8 제곱, 곧 0.32 ÷ 0.64 로 0.5 /m 이고, ω 는 0.4 × 0.5 로 0.2 rad/s 입니다.'],
      ],
    },
    {
      id: 'stanley',
      seconds: 26,
      section: S3,
      cues: [
        [0.3, 6.5, 'Stanley 는 오차를 앞바퀴 축 중심에서 재고, 앞바퀴 각도를 θe 에 arctan(k·e ÷ v) 를 더해 정합니다.', 'Stanley 는 오차를 앞바퀴 축 중심에서 재고, 앞바퀴 각도를 θe 에 arctan k 곱하기 오차 나누기 v 를 더해 정합니다.'],
        [6.5, 13, '경로 왼쪽 0.5 m 에서 20° 왼쪽을 향하면 첫째 항이 20° 를 돌리고, k = 1, 1 m/s 면 둘째 항이 26.6° 를 더합니다.', '경로 왼쪽 0.5 m 에서 20° 왼쪽을 향하면 첫째 항이 20° 를 돌리고, k 가 1, 1 m/s 면 둘째 항이 26.6° 를 더합니다.'],
        [13, 19.5, '합친 46.6° 는 최대 조향각 35° 를 넘어서 잘립니다. 같은 오차라도 10 m/s 에서는 2.9° 만 더 꺾습니다.'],
        [19.5, 25.7, '오차가 작으면 1 초마다 약 0.37 배로 줄어서, 0.5 m 오차는 1 초 뒤 0.18 m, 3 초 뒤 0.025 m 가 됩니다.'],
      ],
    },
    {
      id: 'mpc',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'MPC 는 움직임 모델로 앞으로 몇 초를 미리 계산해, 오차와 명령 크기를 합친 비용이 가장 작은 명령 순서를 고릅니다.'],
        [6, 12, 'horizon 은 얼마나 앞까지 볼지, 제약은 넘으면 안 되는 범위, 비용은 오차와 명령에 weight 를 곱해 더한 값입니다.'],
        [12, 18, '경로 왼쪽 0.3 m 의 로봇이 0.5 초 간격 3 step 을 내다보면, 직진 A 는 2.70, 계속 우회전하는 B 는 4.69 입니다.', '경로 왼쪽 0.3 m 의 로봇이 0.5 초 간격 3 스텝을 내다보면, 직진 에이 는 2.70, 계속 우회전하는 비 는 4.69 입니다.'],
        [18, 24, '세게 돌았다가 되돌아오는 C 가 1.45 로 가장 작고, 완만한 D 는 1.64 입니다. MPC 는 C 의 첫 명령만 보냅니다.'],
        [24, 29.7, '다음 주기에 새로 잰 위치에서 horizon 전체를 다시 계산하므로, 이 방식을 receding horizon 이라고 합니다.'],
      ],
    },
    {
      id: 'pause-cost',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. step 마다 10e² + θe² 와 0.1ω² 를 더하는 비용에서, 직진 후보 A 가 2.70 인 계산은?', '멈추고 적어 보기. 스텝마다 10 곱하기 오차 제곱 더하기 θe 제곱과 0.1 ω 제곱을 더하는 비용에서, 직진 후보 에이 가 2.70 인 계산은?'],
        [16.5, 23.5, '세 step 모두 e 0.3 m, θe 0, ω 0 이라서 step 마다 10 × 0.3² = 0.9 이고, 0.9 × 3 = 2.7 입니다.', '세 스텝 모두 오차 0.3 m, θe 0, ω 0 이라서 스텝마다 10 × 0.3 제곱으로 0.9 이고, 0.9 × 3 은 2.7 입니다.'],
      ],
    },
    {
      id: 'nav2',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6, 'Nav2 의 기본 controller 는 ROS 2 Humble 과 Iron 에서는 DWB 이고, Jazzy 부터는 MPPI 입니다.', 'Nav2 의 기본 controller 는 로스 투 Humble 과 Iron 에서는 DWB 이고, Jazzy 부터는 MPPI 입니다.'],
        [6, 12.5, 'DWB 는 가속도 한계 안에서 닿는 속도만 후보로 삼고, 400 개 조합마다 1.7 초 궤적을 만들어 critic 점수를 더합니다.'],
        [12.5, 19, 'RPP 는 반지름 R 이 0.9 m 보다 작으면 속도를 R ÷ 0.9 배로 줄입니다. 0.6 m 면 0.5 m/s 가 0.33 m/s 입니다.', 'RPP 는 반지름 알 이 0.9 m 보다 작으면 속도를 알 나누기 0.9 배로 줄입니다. 0.6 m 면 0.5 m/s 가 0.33 m/s 입니다.'],
        [19, 25.7, 'MPPI 는 한 주기에 후보 궤적 2000 개를 0.05 초 간격 56 step 씩 시뮬레이션해서 2.8 초 앞까지 봅니다.', 'MPPI 는 한 주기에 후보 궤적 2000 개를 0.05 초 간격 56 스텝씩 시뮬레이션해서 2.8 초 앞까지 봅니다.'],
      ],
    },
    {
      id: 'period',
      seconds: 26,
      section: S4,
      cues: [
        [0.3, 6.5, '20 Hz 에서 0.5 m/s 로봇은 한 주기에 2.5 cm 를 가고, 14.0 m/s 로 달린 Stanley 는 0.70 m 를 갔습니다.'],
        [6.5, 13, '이 거리가 lookahead 나 경로 폭에 비해 커지면, PID 에서 계산 주기가 길 때처럼 흔들리기 시작합니다.'],
        [13, 19.5, '주기를 무작정 높일 수도 없습니다. MPPI 의 한 주기 계산이 50 ms 를 넘으면 20 Hz 를 지키지 못합니다.'],
        [19.5, 25.7, 'horizon 거리가 local costmap 절반보다 길면 속도가 제한되므로, 주기와 horizon 과 costmap 을 함께 정합니다.'],
      ],
    },
    {
      id: 'pause-period',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. Nav2 기본 설정에서 1.0 m/s 로 달리면 한 주기에 몇 cm 를 가고, MPPI 는 몇 m 를 내다볼까요?', '멈추고 적어 보기. Nav2 기본 설정에서 1.0 m/s 로 달리면 한 주기에 몇 cm 를 가고, MPPI 는 몇 미터를 내다볼까요?'],
        [16.5, 23.5, '한 주기 1 ÷ 20 = 0.05 초에 5 cm 를 가고, horizon 56 × 0.05 = 2.8 초 동안 2.8 m 를 내다봅니다.', '한 주기 1 ÷ 20, 곧 0.05 초에 5 cm 를 가고, horizon 56 × 0.05, 곧 2.8 초 동안 2.8 m 를 내다봅니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4, '답입니다. 옆으로 못 가는 로봇에 e 만 보는 P 제어를 걸면 ±0.5 m 로 흔들려서, heading 항이 D 항 역할을 해야 합니다.', '답입니다. 옆으로 못 가는 로봇에 오차만 보는 P 제어를 걸면 ±0.5 m 로 흔들려서, heading 항이 D 항 역할을 해야 합니다.'],
        [4, 8, 'pure pursuit 는 곡률 2y ÷ L² 의 원호를 고르는데, L 이 짧으면 지연에 흔들리고 길면 모퉁이를 가로지릅니다.', 'pure pursuit 는 곡률 2 y 나누기 L 제곱의 원호를 고르는데, L 이 짧으면 지연에 흔들리고 길면 모퉁이를 가로지릅니다.'],
        [8, 12, 'Stanley 는 앞바퀴에서 잰 오차로 각도를 정하고, MPC 는 horizon 동안의 비용이 가장 작은 명령 순서를 고릅니다.'],
        [12, 15.7, 'Nav2 는 DWB, RPP, MPPI 를 plugin 으로 끼워 1초에 20 번 계산하고, 주기와 horizon 을 함께 맞춥니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [
        [0.4, 6.6, '다음 강의는 localization 에서 control 까지 이어지는 Autonomous Driving Stack 입니다.'],
      ],
    },
  ],
}
