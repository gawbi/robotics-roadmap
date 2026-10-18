"""LeRobotDataset 에 delta_timestamps 를 주어 관측 2 frame 과 action 16 step 을 한 샘플로 묶고, action·state 를 학습 데이터의
min·max 로 [-1, 1] 에 맞추는 정규화와 그 역변환을 둔다."""
