"""reset 마다 질량·마찰·actuator gear 를 다시 뽑는 domain randomization, action 을 늦게 적용하는 latency, observation noise wrapper."""

from __future__ import annotations

from dataclasses import dataclass

import gymnasium as gym


@dataclass
class DRRange:
    mass_scale: tuple[float, float] = (0.8, 1.2)
    friction_scale: tuple[float, float] = (0.5, 1.25)
    gear_scale: tuple[float, float] = (0.9, 1.1)


class DynamicsRandomization(gym.Wrapper):
    """resample physical parameters on every reset, always scaling from a saved nominal copy"""

    def __init__(self, env: gym.Env, ranges: DRRange | None, seed: int = 0):
        raise NotImplementedError

    def reset(self, *, seed: int | None = None, options: dict | None = None):
        raise NotImplementedError

    def set_params(self, mass_scale: float, friction_scale: float, gear_scale: float) -> None:
        """fix the parameters (used for evaluation); ranges=None disables resampling"""
        raise NotImplementedError


class ActionLatency(gym.Wrapper):
    """apply the action chosen k steps ago; k may be resampled per episode from a range"""

    def __init__(self, env: gym.Env, k: int | tuple[int, int]):
        raise NotImplementedError


class ObservationNoise(gym.ObservationWrapper):
    def __init__(self, env: gym.Env, std: float):
        raise NotImplementedError
