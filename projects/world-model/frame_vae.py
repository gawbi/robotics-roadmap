"""64×64×3 frame 을 latent z 로 줄이는 conv VAE.

reparameterize·kl_normal 은 VAE 과제의 코드를 그대로 쓰고, 이 파일에는 64×64×3 frame 을 받는 conv encoder·decoder 와 loss 를
짠다.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "vae"))
from vae import kl_normal, reparameterize  # VAE 과제의 코드
