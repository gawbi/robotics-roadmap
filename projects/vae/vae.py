"""MLP VAE. reparameterization, Gaussian KL, negative ELBO, 두 이미지 사이의 latent 보간."""

from __future__ import annotations

import torch
from torch import nn


def reparameterize(mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """z = mu + sigma * eps, eps ~ N(0, I). gradients must reach mu and logvar."""
    raise NotImplementedError


def kl_normal(mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """KL(N(mu, diag(exp(logvar))) || N(0, I)) per sample, shape (N,)"""
    raise NotImplementedError


class VAE(nn.Module):
    def __init__(self, x_dim: int = 784, h_dim: int = 400, z_dim: int = 20, cond_dim: int = 0):
        raise NotImplementedError

    def encode(self, x: torch.Tensor, c: torch.Tensor | None = None) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (mu, logvar), each (N, z_dim)"""
        raise NotImplementedError

    def decode(self, z: torch.Tensor, c: torch.Tensor | None = None) -> torch.Tensor:
        """returns Bernoulli logits (N, x_dim)"""
        raise NotImplementedError

    def forward(self, x: torch.Tensor, c: torch.Tensor | None = None
                ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """returns (recon_logits, mu, logvar)"""
        raise NotImplementedError


def neg_elbo(x: torch.Tensor, recon_logits: torch.Tensor, mu: torch.Tensor, logvar: torch.Tensor,
             beta: float = 1.0) -> torch.Tensor:
    """sum over pixels and latent dims, mean over the batch"""
    raise NotImplementedError


@torch.no_grad()
def interpolate(model: VAE, x_a: torch.Tensor, x_b: torch.Tensor, steps: int = 10) -> torch.Tensor:
    raise NotImplementedError
