---
id: camera-geometry
title: Camera Geometry
branch: robotics
requires: [transforms]
hours: 18
summary: pinhole model·Zhang calibration·ArUco
papers:
  - title: "A Flexible New Technique for Camera Calibration"
    authors: Zhengyou Zhang
    year: 2000
    url: https://www.microsoft.com/en-us/research/publication/a-flexible-new-technique-for-camera-calibration/
  - title: "Multiple View Geometry in Computer Vision (2nd ed.)"
    authors: Richard Hartley, Andrew Zisserman
    year: 2004
    url: https://www.robots.ox.ac.uk/~vgg/hzbook/
  - title: "Automatic generation and detection of highly reliable fiducial markers under occlusion"
    authors: S. Garrido-Jurado, R. Muñoz-Salinas, F. J. Madrid-Cuevas, M. J. Marín-Jiménez
    year: 2014
    url: https://doi.org/10.1016/j.patcog.2014.01.005
  - title: "Infinitesimal Plane-Based Pose Estimation"
    authors: Toby Collins, Adrien Bartoli
    year: 2014
    url: https://doi.org/10.1007/s11263-014-0725-5
---

# Camera Geometry

## 배경

transforms 로 3D frame 사이를 오갈 수는 있지만 카메라가 주는 것은 3D 점이 아니라 pixel 이다. pinhole model 은 world 의 점을
camera frame 으로 옮긴 뒤 depth $z$ 로 나눠 image plane 에 투영하고, intrinsic matrix $K$ 로 pixel 단위로 바꾼다.

$$
s\begin{bmatrix}u\\v\\1\end{bmatrix} = K\,[R\,|\,t]\begin{bmatrix}X_w\\1\end{bmatrix}, \qquad
K = \begin{bmatrix} f_x & \gamma & c_x\\ 0 & f_y & c_y\\ 0&0&1\end{bmatrix}
$$

실제 렌즈는 직선을 휘게 만들어서, normalized coordinates $x$ 에 radial distortion $x_d = x\,(1 + k_1 r^2 + k_2 r^4)$ 도 붙는다.
Zhang(2000)의 방법은 평면 checkerboard 를 여러 각도에서 찍기만 하면 $K$ 를 구할 수 있게 했다. board 평면을 $Z = 0$ 으로
두면 board 와 image 사이의 관계가 homography $H = [h_1\ h_2\ h_3] = \lambda K\,[r_1\ r_2\ t]$ 하나로 표현되고, $r_1, r_2$ 가
서로 수직인 unit vector 이므로 사진 한 장마다 $B = K^{-\top}K^{-1}$ 에 걸리는 선형 제약이 두 개씩 생긴다.

$$
h_1^\top B\, h_2 = 0, \qquad h_1^\top B\, h_1 = h_2^\top B\, h_2
$$

사진 세 장 이상에서 이 제약을 쌓아 closed-form 으로 $K$ 를 구한 뒤, reprojection error 를 최소화하는 nonlinear least squares
로 $K$·distortion·사진별 pose 를 함께 다듬는다. 같은 원리를 크기를 아는 정사각형 하나에 쓰면 ArUco marker 의 6D pose 가
나오고, 그 pose 에 카메라의 extrinsics 를 곱하면 로봇 base 기준의 물체 위치가 된다.

## 목표

- 3D 점을 pixel 로 투영하는 함수(distortion 포함)를 만들고 합성 데이터로 검증한다
- normalized DLT 로 homography 를 추정한다
- Zhang 의 closed-form 으로 $K$ 와 사진별 extrinsics 를 구한다
- reprojection error 를 최소화해 결과를 다듬고 `cv2.calibrateCamera` 와 비교한다
- ArUco marker 의 corner 4개에서 marker pose 를 구하고 `cv2.solvePnP` 와 비교한다

**직접 짤 것**: 투영, distortion, homography 추정, Zhang closed-form, reprojection residual, marker pose 계산.
**가져다 써도 되는 것**: checkerboard corner 검출(`cv2.findChessboardCorners`, `cv2.cornerSubPix`), ArUco 검출
(`cv2.aruco.ArucoDetector`), optimizer `scipy.optimize.least_squares`, 비교 대상 `cv2.calibrateCamera`·`cv2.solvePnP`.

## 준비물

- Python 3.12, numpy, scipy, `opencv-python`(ArUco 가 들어 있어 contrib 패키지는 필요 없다), matplotlib, pytest
- checkerboard 사진 — OpenCV 리포 [samples/data](https://github.com/opencv/opencv/tree/4.x/samples/data) 의
  `left01.jpg`–`left14.jpg`. 640×480, inner corner 9×6 이고 `left10` 이 없어서 13장이다
- (선택) webcam, [calib.io](https://calib.io/pages/camera-calibration-pattern-generator) 로 만든 checkerboard 인쇄물,
  인쇄한 ArUco marker
- GPU 불필요

## 진행 순서

1. `project` 함수를 짜고, 알려진 $K$ 와 pose 로 합성 board 점을 투영해 본다
2. normalized DLT 로 board 평면 → image 의 homography 를 추정한다
3. 합성 데이터에서 Zhang closed-form 으로 $K$ 를 되찾는다
4. 각 사진의 $R, t$ 를 homography 와 $K$ 에서 꺼낸다
5. $K$, $k_1, k_2$, 사진별 pose 를 한 벡터로 묶은 reprojection residual 을 `least_squares` 로 최소화한다
6. OpenCV sample 사진 13장에 같은 파이프라인을 돌려 `cv2.calibrateCamera` 와 비교한다
7. 알려진 pose 로 ArUco marker 를 투영한 합성 영상을 만들고, 검출한 corner 에서 marker pose 를 구한다
8. 같은 corner 로 `cv2.solvePnP(..., flags=cv2.SOLVEPNP_IPPE_SQUARE)` 를 돌려 내 결과와 비교한다

## 시작점

```text
camera-geometry/
├── camera.py          # project, distort
├── homography.py      # estimate_homography (normalized DLT)
├── zhang.py           # intrinsics_from_homographies, extrinsics_from_homography
├── refine.py          # residuals, refine
├── marker_pose.py
├── synth.py           # synthetic boards and marker images
└── test_camera.py
```

```python
import numpy as np

Pose = tuple[np.ndarray, np.ndarray]  # (R (3, 3), t (3,)), board/marker frame -> camera frame

def project(X: np.ndarray, K: np.ndarray, R: np.ndarray, t: np.ndarray,
            dist: tuple[float, float] = (0.0, 0.0)) -> np.ndarray:
    """(N, 3) points -> (N, 2) pixels with radial distortion (k1, k2)."""
    ...

def estimate_homography(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    """(N, 2) plane points -> (N, 2) pixels. returns (3, 3) with H[2, 2] == 1."""
    ...

def intrinsics_from_homographies(Hs: list[np.ndarray]) -> np.ndarray:
    """Zhang closed form, needs >= 3 views. returns K (3, 3)."""
    ...

def extrinsics_from_homography(H: np.ndarray, K: np.ndarray) -> Pose: ...

def refine(K0: np.ndarray, poses0: list[Pose], board: np.ndarray, corners: list[np.ndarray]
           ) -> tuple[np.ndarray, tuple[float, float], list[Pose], float]:
    """returns (K, (k1, k2), poses, rms_px)."""
    ...

def marker_pose(corners_px: np.ndarray, side: float, K: np.ndarray) -> Pose:
    """corners in OpenCV order (top-left, top-right, bottom-right, bottom-left)."""
    ...
```

## 스스로 확인

- [ ] noise 없는 합성 데이터(사진 5장)에서 closed-form $K$ 가 참값과 상대 오차 1e-6 안이다
- [ ] OpenCV sample 13장에서 refinement 뒤 $f_x, f_y, c_x, c_y$ 가 `cv2.calibrateCamera` 와 1% 안이고, RMS reprojection error 가
      cv2 값과 0.05 px 안이다
- [ ] distortion 을 빼고 refinement 하면 같은 sample 에서 RMS 가 1 px 를 넘는다
- [ ] 같은 corner 에서 구한 내 marker pose 의 reprojection RMS 가 `cv2.solvePnP` 결과보다 0.01 px 넘게 크지 않다
- [ ] 5 cm marker 를 25–50 cm 거리에 놓은 합성 영상 50장에서 위치 오차의 median 이 카메라까지 거리의 2% 안이다
- [ ] (선택) 직접 찍은 webcam 사진 15장 이상으로 calibration 해서 RMS 1 px 아래를 얻는다

## 생각해 볼 질문

1. Zhang 방법에 사진이 최소 세 장 필요한 이유를 미지수와 제약의 개수로 설명할 수 있는가? 모든 사진에서 board 를 같은
   기울기로 들고 찍으면 어떻게 되는가?
2. 작은 marker 하나로 pose 를 구하면 좌우 위치보다 거리($z$) 방향 오차가 큰 이유는?
3. closed-form 해가 있는데도 reprojection error 를 다시 최소화하는 이유는? closed-form 이 실제로 최소화하는 양은 무엇인가?

## 힌트

<details>
<summary>불안정한 DLT 결과</summary>

pixel 좌표는 수백, board 좌표는 칸 단위로 0–8 이라 그대로 쓰면 행렬 원소 크기의 차이가 커서 SVD 결과가 나빠진다. 두 점 집합을 각각
평균이 0, 원점까지의 평균 거리가 $\sqrt2$ 가 되도록 바꾸는 변환을 먼저 적용하고, 추정한 $H$ 에 그 변환을 되돌려 곱한다(Hartley
normalization).

</details>

<details>
<summary>homography 에서 꺼낸 R 의 SO(3) projection</summary>

noise 때문에 $[r_1\ r_2\ r_1\times r_2]$ 는 정확한 rotation matrix 가 아니다. SVD $U\Sigma V^\top$ 를 구해 $UV^\top$ 로 바꾸면
Frobenius norm 기준으로 가장 가까운 rotation 이 되는데, $\det(UV^\top) = -1$ 이면 reflection 이므로
$U\,\mathrm{diag}(1, 1, -1)\,V^\top$ 로 부호를 바로잡는다. $\lambda$ 의 부호는 board 가 카메라 앞($t_z > 0$)에 오도록 고른다.

</details>

<details>
<summary>ArUco corner 순서와 합성 영상</summary>

OpenCV 가 주는 corner 4개는 marker 의 왼쪽 위부터 시계 방향이고, `SOLVEPNP_IPPE_SQUARE` 에는 marker 중심을 원점으로 한
$(-s/2, s/2, 0)$, $(s/2, s/2, 0)$, $(s/2, -s/2, 0)$, $(-s/2, -s/2, 0)$ 순서의 3D 점을 넣어야 한다. marker 의 $z$ 축은 카메라 쪽을
향하므로, 합성 영상을 만들 때 marker 가 뒤집혀 보이지 않게 pose 를 잡는다. `cv2.aruco.generateImageMarker` 로 만든 marker image 는 pixel
단위라서, 그 pixel 좌표를 marker 평면의 미터 좌표로 옮기는 scale·평행이동 행렬 $S$ 가 먼저 필요하다(image 의 $y$ 축은 아래, marker
평면의 $y$ 축은 위를 향하므로 부호도 맞춘다). $K[r_1\ r_2\ t]\,S$ 를 `cv2.warpPerspective` 에 넣으면 pose 참값을 아는 영상이 생긴다. homography 로 얻은 pose 를
초기값으로 `least_squares` 를 한 번 더 돌리면 reprojection error 가 줄어든다.

</details>

## 참고 자료

- OpenCV, [Camera Calibration (Python tutorial)](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html) ·
  [Detection of ArUco Markers](https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html)
- Wilhelm Burger, "Zhang's Camera Calibration Algorithm: In-Depth Tutorial and Implementation" — 원 논문이 생략한 유도와 구현
  세부를 채운 technical report. [imagingbook extras](https://imagingbook.com/extras/) 페이지에 링크가 있다
- Hartley & Zisserman, [Multiple View Geometry](https://www.robots.ox.ac.uk/~vgg/hzbook/) 4장(homography 추정과 DLT
  normalization)·6장(camera model)
- 막혔을 때만 열기: Burger 의 Java 구현 [imagingbook-calibrate](https://github.com/imagingbook/imagingbook-calibrate)

## 남은 한계

카메라 한 대가 본 물체의 pose 는 구할 수 있지만, 그 pose 로 팔을 움직여 물체를 집는 데까지는 아직 이어지지 않았다. 카메라와
IK·trajectory 를 하나의 파이프라인으로 묶는 과제가 [Classical Pick & Place](../classical-pick/README.md) 다.
