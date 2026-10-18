"""flow time τ 의 sampling, flow matching loss, τ = 0 의 noise 에서 τ = 1 의 action chunk 까지 Euler 적분."""

from __future__ import annotations

import torch

from action_expert import ActionExpert


def sample_tau(batch: int, device: torch.device) -> torch.Tensor:
    """flow time in [0, 1) with 0 = pure noise, biased toward the noisy end."""
    raise NotImplementedError


def flow_matching_loss(expert: ActionExpert, actions: torch.Tensor, state: torch.Tensor,
                       prefix: torch.Tensor, prefix_pad_mask: torch.Tensor,
                       action_pad_mask: torch.Tensor) -> torch.Tensor:
    """actions (B, H, action_dim); action_pad_mask (B, H) is True where the chunk was padded past the episode end,
    and those positions are left out of the loss."""
    raise NotImplementedError


@torch.no_grad()
def euler_sample(expert: ActionExpert, state: torch.Tensor, prefix: torch.Tensor,
                 prefix_pad_mask: torch.Tensor, horizon: int, action_dim: int, steps: int = 10,
                 noise: torch.Tensor | None = None) -> torch.Tensor:
    """integrate from tau = 0 (noise) to tau = 1 -> (B, horizon, action_dim).
    starts from `noise` (B, horizon, action_dim), drawn from N(0, I) if None."""
    raise NotImplementedError
