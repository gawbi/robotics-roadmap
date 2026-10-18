"""convolution 과 max pooling. 정의 그대로의 for 문 기준 구현, im2col, im2col 을 쓴 conv2d·max_pool2d."""

from __future__ import annotations

import torch


def conv_out_size(size: int, kernel: int, stride: int = 1, padding: int = 0) -> int:
    raise NotImplementedError


def conv2d_naive(x: torch.Tensor, weight: torch.Tensor, bias: torch.Tensor | None = None,
                 stride: int = 1, padding: int = 0) -> torch.Tensor:
    """reference only: nested loops over the definition. use tiny inputs."""
    raise NotImplementedError


def im2col(x: torch.Tensor, kernel: int, stride: int = 1, padding: int = 0) -> torch.Tensor:
    """(N, C, H, W) -> (N, C*kernel*kernel, H_out*W_out).
    row order must match weight.reshape(C_out, C*kernel*kernel)."""
    raise NotImplementedError


def conv2d(x: torch.Tensor, weight: torch.Tensor, bias: torch.Tensor | None = None,
           stride: int = 1, padding: int = 0) -> torch.Tensor:
    """weight: (C_out, C_in, k, k) -> (N, C_out, H_out, W_out). same semantics as F.conv2d."""
    raise NotImplementedError


def max_pool2d(x: torch.Tensor, kernel: int = 2, stride: int = 2) -> torch.Tensor:
    raise NotImplementedError
