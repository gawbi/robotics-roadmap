"""class 이름과 prompt template 으로 zero-shot classifier 를 만들고 CIFAR-10 test set 의 zero-shot 정확도를 잰다."""

from __future__ import annotations

import torch

from clip_model import CLIP


@torch.no_grad()
def zeroshot_weights(model: CLIP, classnames: list[str], templates: list[str]) -> torch.Tensor:
    """(embed_dim, num_classes), one normalized column per class"""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
