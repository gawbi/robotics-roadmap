import type { VideoScript } from '../script.ts'

// Numbers follow lessons/teleop-dataset/README.md: the opening (SO-101, 50 demos each; LeRobot paper, Sept 2025: 2,200+
// contributors, 16,000+ LeRobotDataset datasets, more than half on SO-100 · SO-101); devices (5 joints + 1 gripper = 6 target
// angles; RoboTurk, 8 students, picking: VR 79.36 s, phone 89.97 s, spacemouse 112.57 s, keyboard 151.45 s; keyboard 5 mm a
// frame × 30 = 150 mm a second; check 4 × 30 × 3 = 360 mm = 36 cm); leader-follower (leader 20°, follower 25°, offset 5°;
// homing_offset · drive_mode · range_min · range_max; ALOHA's two reasons; svla_so101_pickplace episode 0, frames 170 ~ 210,
// gripper action 1.0 ~ 1.2 vs follower 7.0, range 0 ~ 100); frames (30 fps → 1000 ÷ 30 ≈ 33.3 ms; t = k ÷ fps, frame 57 →
// 57 ÷ 30 = 1.9 s; images 480×640×3 × 2, state 6, action 6; timeline example 10° ~ 15°, 0.000 ~ 0.133 s; lag table 4.14 /
// 3.13 / 2.12 / 1.09 / 0.26 / 1.20 / 2.24, best at 4 frames, 4 × 33.3 ≈ 133 ms); the loop (defaults 30 fps, 60 s episode,
// 60 s reset, 50 episodes; cadence 29.88 Hz, 8 of 599 loops over 33.3 ms); clock sync (30 Hz camera, 100 Hz joints → ≤ 5 ms;
// pairs at 0 / 30 / 70 / 100 / 130 ms; 60° a second = 0.06° a ms; 3.3 ms ≈ 0.2° ≈ 1 mm, 33.3 ms ≈ 2° ≈ 1 cm, 100 ms = 6° ≈
// 3.1 cm at r = 30 cm); check 8 × 20 = 160 frames, 30 ÷ 20 = 1.5 s; formats (1 radian = 360 ÷ (2 × 3.14) ≈ 57.3°; Open
// X-Embodiment 34 labs, 60 datasets, 22 robots, 100 만+ trajectories; SO-101 degree vs −100 ~ 100, gripper 0 ~ 100); v3.0
// table (11,939 frames, 370 KB) and video (921,600 byte a picture ≈ 0.92 MB, ≈ 11 GB per camera → 40.1 MB / 45.5 MB, ≈ 270 /
// 240 분의 1; keyframe 6.2 KB, others 0.46 KB, AV1, keyframe every 2); episode index (episode 0 rows 0 ~ 302 = 303 frames,
// 303 ÷ 30 = 10.1 s; episode 1 rows 303 ~ 568, 10.1 ~ 18.97 s; frame 57 → row 303 + 57 = 360, 10.1 + 57 ÷ 30 = 12.0 s); meta
// (v3.0, 30 fps, 50 episodes, 1 task, lengths 183 ~ 306 frames; MIN_MAX −1 ~ 1, MEAN_STD; ACT 100 actions, k ~ k+99);
// check 240 + 10 = 250, 8.0 + 10 ÷ 30 ≈ 8.33 s; hesitation (7 × 2 = 14 frames of 1 cm, 3 × 30 = 90 frames of 0 cm,
// (14 × 1 + 90 × 0) ÷ 104 ≈ 0.13 cm; pauses 26 frames ≈ 0.9 s and 25 frames, 2,556 of 11,939 = 21%; cut to 3 frames →
// 14 ÷ (14 + 3 × 3) ≈ 0.61 cm); check 8 × 2 = 16, 2 × 12 = 24, 16 ÷ 40 = 0.4 cm; failures ((45 × 2 + 5 × 6) ÷ 50 = 2.4 cm,
// 10 failures → 2.8 cm); grasp style (0° / 90° → 45°; 250 + 250 → (250 × 0 + 250 × 90) ÷ 500 = 45°); robomimic Square
// (200 → 78.7%, 300 → 52.7%, 100 → 58.7%, 100 → 22.0%, 200 → 46.7%); positions (10 per spot, 50+; 9 / 8 / 10 / 7 / 3 of 10,
// (9 + 8 + 10 + 7 + 3) ÷ 50 = 74%, E 30%, about 10 more demos at E).

const S1 = '입력 장치'
const S2 = 'frame 과 시각 맞추기'
const S3 = 'LeRobotDataset 형식'
const S4 = '시연의 품질과 수'

export const script: VideoScript = {
  id: 'teleop-dataset',
  title: 'Teleop Dataset',
  lessonUrl: 'https://gawbi.github.io/robotics-roadmap/#/p/teleop-dataset',
  sections: [S1, S2, S3, S4],
  terms: [
    ['svla_so101_pickplace', '에스브이엘에이 픽플레이스'],
    ['joint-space mapping', '조인트 스페이스 매핑'],
    ['task-space mapping', '태스크 스페이스 매핑'],
    ['Open X-Embodiment', '오픈 엑스 엠보디먼트'],
    ['Teleop Dataset', '텔레옵 데이터셋'],
    ['LeRobotDataset', '르로봇 데이터셋'],
    ['lerobot-record', '르로봇 레코드'],
    ['homing_offset', '호밍 오프셋'],
    ['action_is_pad', '액션 이즈 패드'],
    ['normalization', '노멀라이제이션'],
    ['calibration', '캘리브레이션'],
    ['spacemouse', '스페이스마우스'],
    ['stats.json', '스탯츠 제이슨'],
    ['drive_mode', '드라이브 모드'],
    ['trajectory', '트래젝터리'],
    ['timestamp', '타임스탬프'],
    ['info.json', '인포 제이슨'],
    ['range_min', '레인지 민'],
    ['range_max', '레인지 맥스'],
    ['robomimic', '로보미믹'],
    ['MEAN_STD', '민 에스티디'],
    ['RoboTurk', '로보터크'],
    ['episodes', '에피소드즈'],
    ['follower', '팔로워'],
    ['offset', '오프셋'],
    ['MIN_MAX', '민 맥스'],
    ['LeRobot', '르로봇'],
    ['Parquet', '파케이'],
    ['picking', '피킹'],
    ['dataset', '데이터셋'],
    ['leader', '리더'],
    ['SO-101', '에스오 백일'],
    ['Square', '스퀘어'],
    ['radian', '라디안'],
    ['degree', '디그리'],
    ['ALOHA', '알로하'],
    ['frame', '프레임'],
    ['state', '스테이트'],
    ['stats', '스탯츠'],
    ['Robot', '로봇'],
    ['Real', '리얼'],
    ['loop', '루프'],
    ['RLDS', '알엘디에스'],
    ['meta', '메타'],
    ['v3.0', '브이 삼 점 영'],
    ['MP4', '엠피포'],
    ['fps', '에프피에스'],
    ['VR', '브이알'],
    ['IK', '아이케이'],
    ['KB', '킬로바이트'],
    ['MB', '메가바이트'],
    ['GB', '기가바이트'],
    ['cm', '센티미터'],
    ['mm', '밀리미터'],
  ],
  scenes: [
    {
      id: 'intro',
      seconds: 8,
      cues: [
        [0.4, 4.2, 'Teleop Dataset 은 사람이 로봇을 조종하는 동안 사진, 관절 각도, 보낸 명령을 같은 시각끼리 묶어 쌓은 기록입니다.'],
        [4.2, 7.8, '입력 장치, frame 과 시각 맞추기, LeRobotDataset 형식, 시연의 품질과 수를 차례로 봅니다.'],
      ],
    },
    {
      id: 'question',
      seconds: 8,
      cues: [
        [0.4, 4.4, '같은 SO-101 팔로 시연을 50 개씩 모아도, 어떤 dataset 으로 학습한 policy 는 블록 위에서 한참 멈춥니다.'],
        [4.4, 7.8, '시연을 모을 때 무엇을 어떻게 기록해야 학습에 쓸 수 있는 dataset 이 될까요?'],
      ],
    },
    {
      id: 'devices',
      seconds: 28,
      section: S1,
      cues: [
        [0.3, 7, 'SO-101 에는 목표 각도 6 개를 보내고, leader 팔은 관절 각도를 그대로 옮기는 joint-space mapping 입니다.'],
        [7, 14, 'VR 조종기, 스마트폰, spacemouse, 키보드는 손끝 목표를 내고, IK 로 관절 각도를 구합니다.'],
        [14, 21, 'RoboTurk 의 picking 평균 완료 시간은 VR 79.36 초, spacemouse 112.57 초, 키보드 151.45 초였습니다.'],
        [21, 27.7, '키보드 시연은 축에 나란한 움직임만 이어 붙이기 쉬워서, policy 도 축을 하나씩 따라 꺾이는 길을 배웁니다.'],
      ],
    },
    {
      id: 'leader',
      seconds: 30,
      section: S1,
      cues: [
        [0.3, 6, '같은 자세에서 leader 어깨는 20° 를 읽고 follower 는 25° 를 읽는다면, offset 5° 를 더해 맞춥니다.'],
        [6, 12, 'calibration 은 모터마다 기준점, 방향, 움직인 범위의 양 끝을 재서 파일에 저장합니다.'],
        [12, 18, 'ALOHA 저자들은 특이 자세 근처에서 IK 가 자주 실패하고, leader 의 무게가 떨림을 줄여서 관절 각도를 옮겼습니다.'],
        [18, 24, 'action 에는 follower 가 아니라 leader 의 각도를 적습니다. 그래야 블록을 쥐는 힘이 기록에 남습니다.'],
        [
          24,
          29.7,
          '공개 dataset 에서 블록을 쥔 동안 집게 action 은 1.0 ~ 1.2 이고, follower 값은 7.0 입니다.',
          '공개 dataset 에서 블록을 쥔 동안 집게 action 은 1.0 에서 1.2 이고, follower 값은 7.0 입니다.',
        ],
      ],
    },
    {
      id: 'pause-keyboard',
      seconds: 24,
      section: S1,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 키보드로 frame 마다 손끝을 4 mm 씩 옮기고 30 fps 로 3 초 누르면, 손끝은 얼마나 갈까요?'],
        [16.5, 23.5, '손끝은 4 × 30 × 3 으로 360 mm, 36 cm 를 갑니다. 1초에 frame 30 개씩 3 초 동안 옮깁니다.'],
      ],
    },
    {
      id: 'frames',
      seconds: 30,
      section: S2,
      cues: [
        [0.3, 6, '30 fps 는 1초에 frame 을 30 개 남긴다는 뜻이라서, frame 사이 간격은 1000 ÷ 30 으로 약 33.3 ms 입니다.'],
        [6, 12, 'timestamp 는 시계를 읽지 않고 k ÷ fps 로 적어서, 30 fps 에서 frame 57 은 57 ÷ 30 인 1.9 초입니다.'],
        [12, 18, 'frame 하나에는 사진 두 장, state 6 개, leader 의 값인 action 6 개, timestamp 가 들어갑니다.'],
        [18, 24, 'state 는 팔이 지금 있는 자세이고 action 은 가라고 보낸 목표라서, 관측은 action 을 보내기 직전에 읽습니다.'],
        [24, 29.7, '실제 모터는 늦게 따라가서 action 과 가장 가까운 state 는 4 frame 뒤이고, 30 fps 에서 약 133 ms 입니다.'],
      ],
    },
    {
      id: 'sync',
      seconds: 30,
      section: S2,
      cues: [
        [
          0.3,
          7,
          'lerobot-record 는 관측을 읽고 action 을 보내고 frame 을 저장한 뒤, 1/fps 초가 될 때까지 기다립니다.',
          'lerobot-record 는 관측을 읽고 action 을 보내고 frame 을 저장한 뒤, fps 분의 일 초가 될 때까지 기다립니다.',
        ],
        [7, 13, 'loop 가 33.3 ms 를 넘기면 기록 속 시각이 어긋납니다. 공식 예시는 29.88 Hz 였고 599 번 중 8 번이 넘었습니다.'],
        [13, 20, '카메라 30 Hz, 관절 100 Hz 라면 사진마다 가장 가까운 관절 값을 골라 시각 차이를 많아야 5 ms 로 줄입니다.'],
        [20, 29.7, '어깨가 1초에 60° 씩 돌 때 사진이 100 ms 늦으면 6° 가 벌어지고, 반지름 30 cm 에서 손끝 약 3.1 cm 입니다.'],
      ],
    },
    {
      id: 'pause-fps',
      seconds: 24,
      section: S2,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 20 fps 로 8 초 기록한 episode 는 frame 이 몇 개이고, frame 30 은 몇 초일까요?'],
        [16.5, 23.5, 'frame 은 8 × 20 으로 160 개이고, frame 30 의 timestamp 는 30 ÷ 20 으로 1.5 초입니다.'],
      ],
    },
    {
      id: 'format',
      seconds: 28,
      section: S3,
      cues: [
        [0.3, 7, '1 radian 은 약 57.3° 라서, radian 으로 적은 곳과 degree 로 적은 곳의 1.0 은 전혀 다른 자세입니다.'],
        [7, 13.5, 'Open X-Embodiment 연구진은 34 개 연구실의 dataset 60 개를 RLDS 한 형식으로 바꿔 한 곳에 모았습니다.'],
        [13.5, 20.5, 'LeRobotDataset 은 frame 마다 한 행인 Parquet 표를 쓰고, frame 11,939 개짜리 표가 370 KB 입니다.'],
        [20.5, 27.7, '사진을 그대로 두면 카메라 하나에 약 11 GB 라서 MP4 로 압축하고, 영상은 각각 40.1 MB 와 45.5 MB 입니다.'],
      ],
    },
    {
      id: 'meta',
      seconds: 30,
      section: S3,
      cues: [
        [0.3, 6, 'v3.0 은 여러 episode 를 한 파일에 이어 붙이고, 각 episode 가 어디부터 어디까지인지 meta 에 적습니다.'],
        [6, 12, 'episode 0 이 303 frame 이라서, episode 1 의 frame 57 은 행 360 과 영상 12.0 초에 있습니다.'],
        [12, 18, 'info.json 에는 버전, fps, 값마다 이름과 크기가 있고, stats.json 에는 최솟값, 최댓값, 평균, 표준편차가 있습니다.'],
        [18, 24, 'normalization 은 stats 로 값의 크기를 맞추는데, ACT 는 평균을 빼고 표준편차로 나누는 MEAN_STD 를 씁니다.'],
        [24, 29.7, 'action 100 개를 묶어 읽는 ACT 에서 episode 끝의 모자란 자리는 action_is_pad 로 표시해 loss 에서 뺍니다.'],
      ],
    },
    {
      id: 'pause-index',
      seconds: 24,
      section: S3,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. episode 0 이 240 frame 이면, episode 1 의 frame 10 은 몇 번 행, 영상 몇 초일까요?'],
        [
          16.5,
          23.5,
          '행 240 + 10 인 250 번 행에 있고, 영상에서는 8.0 + 10 ÷ 30 으로 약 8.33 초에 있습니다.',
          '행 240 더하기 10 인 250 번 행에 있고, 영상에서는 8.0 더하기 10 ÷ 30 으로 약 8.33 초에 있습니다.',
        ],
      ],
    },
    {
      id: 'hesitation',
      seconds: 28,
      section: S4,
      cues: [
        [0.3, 7, 'behavior cloning 은 같은 장면의 action 이 여럿이면 MSE 를 줄이는 평균을 배우고, 그 무게는 frame 수입니다.'],
        [7, 14, '시연 7 개가 frame 2 개씩 1 cm 내리고 3 개가 30 frame 멈추면, 평균은 14 ÷ 104 로 약 0.13 cm 입니다.'],
        [14, 21, 'svla_so101_pickplace 에서도 처음과 끝의 멈춘 frame 이 11,939 개 중 2,556 개로 21% 였습니다.'],
        [21, 27.7, '시연은 망설임 없이 하고 정지 구간을 짧게 남깁니다. 정지를 3 frame 으로 줄이면 평균은 약 0.61 cm 로 오릅니다.'],
      ],
    },
    {
      id: 'quality',
      seconds: 32,
      section: S4,
      cues: [
        [0.3, 6.5, '실패한 시연도 정답으로 배웁니다. 45 개는 2 cm 에서 닫고 5 개는 6 cm 에서 닫았다면, policy 는 2.4 cm 에서 닫습니다.'],
        [6.5, 12.5, '손목 0° 로 위에서 집는 시연과 90° 로 옆에서 집는 시연을 반씩 섞으면, policy 는 45° 로 비스듬히 다가갑니다.'],
        [12.5, 19, 'Square 작업에서 숙련자 한 명의 200 개는 78.7% 였고, 숙련도가 다른 6 명의 300 개는 52.7% 였습니다.'],
        [19, 25.5, '숙련된 2 명의 시연 100 개에 서툰 2 명의 100 개를 더하자, 성공률은 58.7% 에서 46.7% 로 떨어졌습니다.'],
        [25.5, 31.7, '시연은 자리마다 10 개씩 50 개 이상으로 시작하고, 성공률이 30% 인 오른쪽 뒤 자리처럼 낮은 곳에 더 모읍니다.'],
      ],
    },
    {
      id: 'pause-pause',
      seconds: 24,
      section: S4,
      cues: [
        [0.3, 4.5, '멈추고 적어 보기. 시연 8 개는 frame 2 개 동안 1 cm 씩 내리고 2 개는 frame 12 개 동안 멈추면, 평균은 얼마일까요?'],
        [16.5, 23.5, '내린 frame 16 개와 멈춘 frame 24 개를 합한 40 개로 나누면, 평균은 16 ÷ 40 인 0.4 cm 입니다.'],
      ],
    },
    {
      id: 'answer',
      seconds: 16,
      cues: [
        [0.3, 4.2, '답입니다. leader 팔은 관절 각도를 옮기고 다른 장치는 IK 를 거치며, action 에는 leader 의 각도를 적습니다.'],
        [4.2, 8.2, 'frame 은 사진, state, action, k ÷ fps 의 timestamp 로 이루어지고, 관측은 action 보다 먼저 읽습니다.'],
        [8.2, 12.2, 'LeRobotDataset 은 episode 를 Parquet 표와 MP4 영상에 이어 붙이고, stats 와 경계를 meta 에 적습니다.'],
        [12.2, 15.7, 'policy 는 frame 수로 무게를 매긴 평균을 배우므로, 정지와 실패, 방식 차이를 줄인 일관된 시연이 수보다 중요합니다.'],
      ],
    },
    {
      id: 'outro',
      seconds: 7,
      cues: [[0.4, 6.6, '시연 밖 상태의 정답은 DAgger 에서, action 묶음으로 배우는 법은 ACT 에서, 실물 실행은 Real Robot 에서 다룹니다.']],
    },
  ],
}
