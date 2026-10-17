---
id: tokenizer
title: BPE Tokenizer
branch: language
requires: [warmup]
hours: 8
summary: byte-level BPE 의 학습·encode·decode
papers:
  - title: "A New Algorithm for Data Compression"
    authors: Philip Gage
    year: 1994
  - title: "Neural Machine Translation of Rare Words with Subword Units"
    authors: Rico Sennrich, Barry Haddow, Alexandra Birch
    year: 2016
    url: https://arxiv.org/abs/1508.07909
  - title: "Language Models are Unsupervised Multitask Learners"
    authors: Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever
    year: 2019
    url: https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
---

# BPE Tokenizer

## 배경

language model 은 text 를 정수 열로 받는다. 글자 하나를 token 하나로 삼으면 vocabulary 는 작지만 sequence 가 길어져
계산이 늘고, 단어 하나를 token 하나로 삼으면 sequence 는 짧아지지만 학습 때 못 본 단어가 나올 때마다 `<unk>` 로
뭉개진다. BPE(byte pair encoding)는 그 중간 지점을 데이터로 정한다. 1994년 Gage 가 압축 알고리즘으로 낸 방법으로, 가장
자주 붙어 나오는 token 쌍을 새 token 하나로 합치는 일을 vocabulary 가 원하는 크기가 될 때까지 반복한다. 2016년 Sennrich 등은
이 방법으로 번역 모델의 subword 단위를 만들었다.

GPT-2 는 시작 vocabulary 를 Unicode 글자가 아닌 byte 256개로 두었는데, 어떤 문자열이든 UTF-8 byte 로 바꾸면 이 256개로
표현되므로 `<unk>` 가 아예 생기지 않는다. 또 merge 가 단어와 문장부호의 경계를 넘지 않도록 정규식으로 text 를 먼저
조각낸 뒤 조각 안에서만 BPE 를 한다. GPT-2 의 vocabulary 50,257 개는 byte 256개, merge 50,000개, 문서 끝을 표시하는
special token `<|endoftext|>` 하나로 이뤄진다.

## 목표

- 학습 text 에서 merge 목록을 배우는 `train_bpe` 를 짠다
- 배운 merge 로 text 와 token id 를 오가는 `encode`·`decode` 를 짠다
- GPT-2 정규식 pre-tokenization 과 special token 처리를 붙인다
- GPT-2 의 vocabulary 를 불러와 tiktoken 과 같은 id 를 내는지 확인한다

**직접 짤 것**: pair 세기, merge, 학습 loop, encode·decode, special token 분리.
**가져다 써도 되는 것**: `\p{L}` 을 지원하는 정규식 패키지 `regex`, 비교용 `tiktoken`.

## 준비물

- Python 3.12, regex, tiktoken, pytest
- 학습 text — [Tiny Shakespeare](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt) (약 1.1 MB)
- (선택) [CS336 assignment1-basics](https://github.com/stanford-cs336/assignment1-basics) — tokenizer test 와 GPT-2 vocabulary·merge fixture
- GPU 불필요

## 진행 순서

1. `"안녕 hello".encode("utf-8")` 이 어떤 byte 열이 되는지 출력해 한글 한 글자가 몇 byte 인지 확인한다
2. 정수 열에서 이웃한 pair 의 개수를 세는 함수와, 지정한 pair 를 새 id 로 바꾸는 함수를 짠다
3. 이 둘을 `vocab_size - 256` 번 반복하는 `train_bpe` 로 Tiny Shakespeare 에서 merge 목록을 배운다
4. merge 목록으로 `encode`·`decode` 를 짜고 round-trip 을 확인한다
5. GPT-2 정규식으로 text 를 조각내고 조각마다 따로 pair 를 세도록 학습과 encode 를 고친다
6. `<|endoftext|>` 같은 special token 을 정규식을 적용하기 전에 떼어 내 id 하나로 처리한다
7. tiktoken `gpt2` 의 vocabulary 로 내 tokenizer 를 만들어 같은 text 의 id 열을 비교한다

## 시작점

```text
tokenizer/
├── bpe.py
├── train.py
└── test_bpe.py
```

```python
import regex as re

GPT2_PAT = r"""'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+"""

def get_pair_counts(ids: list[int], counts: dict[tuple[int, int], int] | None = None
                    ) -> dict[tuple[int, int], int]: ...

def merge(ids: list[int], pair: tuple[int, int], new_id: int) -> list[int]: ...

def train_bpe(text: str, vocab_size: int, special_tokens: list[str] | None = None
              ) -> tuple[dict[int, bytes], list[tuple[bytes, bytes]]]:
    """returns (vocab: id -> bytes, merges in creation order). same shape as CS336 run_train_bpe."""
    ...

class Tokenizer:
    def __init__(self, vocab: dict[int, bytes], merges: list[tuple[bytes, bytes]],
                 special_tokens: list[str] | None = None): ...
    def encode(self, text: str) -> list[int]: ...
    def decode(self, ids: list[int]) -> str: ...
```

## 평가 기준

- [ ] 한글·emoji·연속 공백·줄바꿈이 섞인 문자열에서 `decode(encode(s)) == s` 다
- [ ] GPT-2 정규식을 쓰고 Tiny Shakespeare 앞 90% 로 학습해 뒤 10% 에서 재면 token 하나에 담기는 byte 가 vocab_size 512 에서 약 1.9, 1024 에서 약 2.3 이다(tiktoken `gpt2` 는 약 3.3)
- [ ] tiktoken `gpt2` 의 vocabulary 로 만든 내 tokenizer 가 한글이 섞인 text 에서 `tiktoken.get_encoding("gpt2").encode()` 와 같은 id 열을 낸다
- [ ] (선택) CS336 `tests/test_tokenizer.py` 를 `get_tokenizer` adapter 로 연결해 통과시킨다
- [ ] (선택) CS336 `tests/test_train_bpe.py` 를 통과시킨다. 빈도가 같은 pair 는 사전순으로 더 큰 쪽을 고른다는 규칙과 1.5초 시간 제한이 들어 있다

## 생각해 볼 질문

1. 시작 vocabulary 를 byte 256개로 두면 `<unk>` 가 생기지 않는 이유는? 대신 무엇을 잃는가?
2. 정규식으로 미리 조각내지 않으면 `dog.`·`dog!`·`dog?` 에서 어떤 merge 가 생기고, 그것이 왜 낭비인가?
3. 같은 뜻의 한국어 문장이 영어 문장보다 GPT-2 token 을 훨씬 많이 쓰는 이유는? 이것이 모델의 비용과 context 길이에 어떤 영향을 주는가?

## 힌트

<details>
<summary>encode 에서 merge 를 적용하는 순서</summary>

학습 때 merge 가 만들어진 순서가 곧 우선순위다. 지금 조각 안에 있는 pair 가운데 가장 먼저 배운 merge 하나를 골라 합치고,
합칠 pair 가 없을 때까지 반복한다. merge 50,000개를 처음부터 끝까지 차례로 훑을 필요는 없다.

</details>

<details>
<summary>tiktoken 의 id 와 내 id 가 어긋날 때</summary>

tiktoken `gpt2` 에서 byte 하나짜리 token 의 id 는 byte 값 순서가 아니다(`!` 가 0번이다). `enc._mergeable_ranks` 는
`bytes → rank` dict 이고 rank 가 곧 token id 라서, "이어 붙인 bytes 의 rank 가 가장 낮은 pair 부터 합친다" 는 규칙을 쓰면 merge
목록 없이도 같은 결과가 나온다. CS336 fixture 의 `gpt2_merges.txt` 는 byte 를 출력 가능한 Unicode 글자로 바꿔 적은 형식이라
`tests/common.py` 의 `gpt2_bytes_to_unicode` 로 되돌려 읽어야 한다.

</details>

<details>
<summary>학습이 너무 느릴 때</summary>

정규식으로 조각내면 같은 조각이 수없이 반복된다. 서로 다른 조각과 그 등장 횟수만 세어 두고 pair 개수에 횟수를 곱하면
계산량이 크게 준다. 그래도 느리면 merge 한 번으로 실제로 바뀌는 pair 의 개수만 다시 센다.

</details>

## 참고 자료

- Andrej Karpathy, [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)
- Hugging Face LLM Course, [Byte-Pair Encoding tokenization](https://huggingface.co/learn/llm-course/chapter6/5)
- Stanford CS336, [assignment1-basics](https://github.com/stanford-cs336/assignment1-basics) — handout 의 BPE 절과 test
- OpenAI, [gpt-2 `encoder.py`](https://github.com/openai/gpt-2/blob/master/src/encoder.py) — GPT-2 원본 tokenizer, 막혔을 때만 열기
- [karpathy/minbpe](https://github.com/karpathy/minbpe) — 막혔을 때만 열기

## 남은 한계

tokenizer 는 text 를 id 로 바꿀 뿐 다음에 올 token 을 예측하지 못한다. 이 id 열로 language model 을 학습시키는 과정은
[GPT-2](../gpt/README.md) 에서 다룬다.
