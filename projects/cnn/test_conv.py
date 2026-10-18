"""conv.py 의 test. kernel 1·3·5, stride 1·2, padding 0·1·2 의 모든 조합에서 conv2d 와 F.conv2d 의 비교,
float64 작은 입력에서의 torch.autograd.gradcheck, max_pool2d 와 F.max_pool2d 의 비교를 여기에 쓴다."""
