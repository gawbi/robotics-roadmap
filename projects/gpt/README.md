---
id: gpt
title: GPT-2
branch: language
requires: [transformer, tokenizer]
hours: 20
summary: decoder-only GPT 구현과 GPT-2 weight 이식
papers:
  - title: "Using the Output Embedding to Improve Language Models"
    authors: Ofir Press, Lior Wolf
    year: 2016
    url: https://arxiv.org/abs/1608.05859
  - title: "Improving Language Understanding by Generative Pre-Training"
    authors: Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever
    year: 2018
    url: https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
  - title: "Language Models are Unsupervised Multitask Learners"
    authors: Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever
    year: 2019
    url: https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
---

# GPT-2

## 배경

Transformer 과제의 encoder-decoder 는 (입력, 정답) 쌍이 있어야 학습된다. GPT 는 encoder 와 cross-attention 을 떼어 낸
decoder 만 쌓아 text 자체에서 다음 token 을 맞히게 하므로, 사람이 단 label 없이 웹 text 전체를 데이터로 쓸 수 있다.
causal mask 덕분에 길이 $T$ 인 sequence 하나에서 위치마다 하나씩 $T$ 개의 예측을 한 번의 forward 로 학습한다.

$$
\mathcal{L}(\theta) = -\frac{1}{T}\sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t})
$$

GPT 계열은 원래 Transformer 에서 몇 군데를 바꿨다. GPT-1 은 sinusoidal 대신 학습되는 positional embedding 과 GELU
activation 을 썼고, GPT-2 는 LayerNorm 을 각 sub-layer 앞으로 옮기고(pre-LN) 마지막 block 뒤에 LayerNorm 을 하나 더 두었다.
출력 층은 token embedding 행렬을 그대로 다시 쓴다(weight tying). 가장 작은 GPT-2 는 12 layer·12 head·768 차원·context
1,024·vocabulary 50,257 에 parameter 가 약 124M 이다.

이번 과제에서는 이 구조를 직접 짜서 Tiny Shakespeare 로 작게 학습시키고, OpenAI 가 공개한 GPT-2 weight 를 옮겨 넣어
Hugging Face `transformers` 구현과 같은 logits 를 내는지 확인한다.

## 목표

- causal self-attention, pre-LN block, GPT 모델을 짠다
- Tiny Shakespeare 로 character-level GPT 를 학습시키고 temperature·top-k sampling 으로 text 를 생성한다
- Hugging Face GPT-2(124M) weight 를 내 모델에 옮겨 넣고 logits 를 비교한다
- 내 BPE tokenizer 로 prompt 를 encode 해 GPT-2 weight 로 문장을 이어 쓴다

**직접 짤 것**: GPT 모델 전체, batch sampling, 학습 loop(warmup + cosine lr), 생성 함수, weight 이름 mapping.
**가져다 써도 되는 것**: 앞 과제의 내 attention·tokenizer, `nn.Linear`·`nn.Embedding`·`nn.LayerNorm`, `torch.optim.AdamW`,
weight 를 내려받고 정답 logits 를 내는 `transformers`, 비교용 `tiktoken`.

## 준비물

- Python 3.12, torch, numpy, transformers, tiktoken, pytest
- [Tiny Shakespeare](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt) — 1,115,394 글자, 서로 다른 글자 65개
- GPT-2 weight — Hugging Face [`openai-community/gpt2`](https://huggingface.co/openai-community/gpt2) (약 550 MB)
- 8 GB GPU 로 충분하다. nanoGPT `shakespeare_char` 설정(6 layer·6 head·384 차원·context 256)은 A100 에서 약 3분이면 학습이 끝난다.
  GPU 가 없으면 4 layer·128 차원·context 64 정도로 줄여 CPU 에서 돌린다

## 진행 순서

1. Tiny Shakespeare 를 글자 단위 id 로 바꾸고 앞 90%·뒤 10% 를 train·val 로 나눈다
2. 무작위 위치에서 길이 `block_size + 1` 조각을 잘라 `(x, y)` batch 를 만드는 `get_batch` 를 짠다
3. `CausalSelfAttention`·`MLP`·`Block`(pre-LN)·`GPT` 를 짜고 `lm_head` 를 token embedding 과 묶는다
4. AdamW 와 warmup·cosine lr schedule 로 학습시키며 val loss 를 주기적으로 잰다
5. temperature·top-k 를 받는 `generate` 로 text 를 sampling 한다
6. 모델 크기를 GPT-2 small 에 맞추고 `transformers` 의 state_dict 를 이름 mapping 으로 옮겨 넣는다
7. 같은 token id 를 넣어 내 모델과 `GPT2LMHeadModel` 의 logits 를 비교한다
8. GPT-2 vocabulary 를 넣은 내 tokenizer 로 prompt 를 encode 하고, 이어 쓴 id 를 decode 한다

## 시작점

```text
gpt/
├── data.py              # char vocab, get_batch
├── model.py             # CausalSelfAttention, MLP, Block, GPT
├── train.py
├── sample.py
├── load_gpt2.py         # Hugging Face state_dict -> my GPT
└── test_gpt2_logits.py
```

```python
from dataclasses import dataclass
import torch
from torch import nn, Tensor

@dataclass
class GPTConfig:
    vocab_size: int = 50257
    block_size: int = 1024
    n_layer: int = 12
    n_head: int = 12
    n_embd: int = 768
    dropout: float = 0.0

def get_batch(data: Tensor, block_size: int, batch_size: int, device: str
              ) -> tuple[Tensor, Tensor]:
    """x, y both (batch_size, block_size); y is x shifted left by one."""
    ...

class CausalSelfAttention(nn.Module):
    def __init__(self, cfg: GPTConfig): ...
    def forward(self, x: Tensor) -> Tensor: ...

class Block(nn.Module):
    """x = x + attn(ln_1(x)); x = x + mlp(ln_2(x))"""
    def __init__(self, cfg: GPTConfig): ...
    def forward(self, x: Tensor) -> Tensor: ...

class GPT(nn.Module):
    def __init__(self, cfg: GPTConfig): ...
    def forward(self, idx: Tensor, targets: Tensor | None = None
                ) -> tuple[Tensor, Tensor | None]:
        """returns (logits (B, T, vocab), mean cross-entropy or None)."""
        ...
    @torch.no_grad()
    def generate(self, idx: Tensor, max_new_tokens: int, temperature: float = 1.0,
                 top_k: int | None = None) -> Tensor: ...

def load_hf_gpt2(model: GPT, name: str = "gpt2") -> None:
    """copy GPT2LMHeadModel weights into model, in place."""
    ...
```

## 평가 기준

- [ ] 학습 전 첫 batch 의 loss 가 $\ln 65 \approx 4.17$ 근처다
- [ ] nanoGPT `shakespeare_char` 와 같은 설정으로 5,000 iter 학습한 val loss 가 1.55 이하다(nanoGPT README 에 적힌 값은 1.4697)
- [ ] GPT-2 small 크기로 만든 내 모델의 parameter 수가 124,439,808 개다(`lm_head` 를 token embedding 과 묶어 한 번만 셀 때)
- [ ] HF weight 를 옮겨 넣은 내 모델과 `GPT2LMHeadModel` 의 logits 가 float32 에서 최대 절대 오차 1e-3 미만으로 같다
- [ ] GPT-2 vocabulary 를 넣은 내 tokenizer 가 낸 prompt id 가 tiktoken `gpt2` 와 같다
- [ ] (선택) CS336 assignment1-basics 의 `test_model.py` 를 adapter 로 연결해 통과시킨다. 이 test 는 RMSNorm·SwiGLU·RoPE 를 쓰는 Llama 식 block 을 요구하므로 GPT-2 block 과 별도로 하나 더 짠다

## 생각해 볼 질문

1. 출력 층이 token embedding 행렬을 다시 쓰면 GPT-2 small 의 parameter 가 얼마나 줄고, 그렇게 묶어도 되는 이유는 무엇인가?
2. pre-LN 과 post-LN 은 residual 경로에 무엇이 남는지가 다르다. 층이 깊을 때 어느 쪽이 learning rate warmup 없이도 안정적으로 학습되는지 설명할 수 있는가?
3. character-level 모델과 BPE 모델의 val loss 는 숫자를 그대로 비교할 수 없다. 공정하게 비교하려면 어떤 단위로 바꿔야 하는가?

## 힌트

<details>
<summary>HF GPT-2 weight 를 옮길 때 shape 가 안 맞으면</summary>

`transformers` 의 GPT-2 는 Linear 대신 `Conv1D` 를 써서 `attn.c_attn`·`attn.c_proj`·`mlp.c_fc`·`mlp.c_proj` 의 weight 를
`(in, out)` 으로 저장한다. `nn.Linear` 는 `(out, in)` 이므로 이 네 종류만 transpose 해서 넣는다. `c_attn` 은 Q·K·V 를 이어
붙인 `(768, 2304)` 행렬이다. 버전에 따라 state_dict 에 `attn.bias`·`attn.masked_bias` 가 섞여 있을 수 있는데, 이 둘은 weight 가 아니라
mask buffer 라서 건너뛴다.

</details>

<details>
<summary>logits 차이가 0.1 근처에서 멈출 때</summary>

GPT-2 는 tanh 로 근사한 GELU(`gelu_new`)로 학습됐다. 정확한 erf GELU 를 쓰면 argmax 는 대부분 같아도 logits 가 0.1 가량
어긋난다. LayerNorm 의 `eps`(1e-5)도 확인한다.

</details>

<details>
<summary>val loss 가 어느 순간부터 다시 올라갈 때</summary>

Tiny Shakespeare 는 100만 글자 남짓이라 6 layer 모델도 금방 overfit 한다. dropout 을 넣거나 val loss 가 가장 낮았던
checkpoint 를 남긴다.

</details>

## 참고 자료

- Andrej Karpathy, [Let's build GPT: from scratch, in code, spelled out.](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- Andrej Karpathy, [Let's reproduce GPT-2 (124M)](https://www.youtube.com/watch?v=l8pRSuU81PU) — HF weight 이식과 학습 설정
- Stanford CS336, [assignment1-basics](https://github.com/stanford-cs336/assignment1-basics) — Transformer LM 을 처음부터 짜는 handout 과 test
- Andrej Karpathy, [microgpt](https://karpathy.github.io/2026/02/12/microgpt/) — 의존성 없는 순수 Python 파일 하나로 쓴 GPT 의 학습·sampling
- Hugging Face, [`modeling_gpt2.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/models/gpt2/modeling_gpt2.py) — logits 비교 대상 구현
- [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)·[karpathy/build-nanogpt](https://github.com/karpathy/build-nanogpt) — 막혔을 때만 열기

## 남은 한계

text 만 읽고 쓰는 모델이라 카메라 영상을 보지도, 로봇 action 을 내지도 못한다. 이 한계는 이미지와 text 를 한 공간에 놓는
[CLIP](../clip/README.md) 과, language model 의 token 으로 로봇 action 을 내는 [RT-2 → OpenVLA](../vla-tokens/README.md) 에서
다룬다.
