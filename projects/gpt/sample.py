"""학습한 character-level GPT 나 GPT-2 weight 로 text 를 이어 쓴다.
GPT-2 의 prompt 는 tokenizer 과제의 bpe.Tokenizer 에 GPT-2 vocabulary 를 넣어 encode·decode 한다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "tokenizer"))
from bpe import Tokenizer  # tokenizer 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
