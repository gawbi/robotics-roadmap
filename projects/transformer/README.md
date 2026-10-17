---
id: transformer
title: Transformer
branch: language
requires: [pytorch-mlp]
hours: 24
summary: attention 부터 짜는 encoder-decoder 모델
papers:
  - title: "Neural Machine Translation by Jointly Learning to Align and Translate"
    authors: Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio
    year: 2014
    url: https://arxiv.org/abs/1409.0473
  - title: "Layer Normalization"
    authors: Jimmy Lei Ba, Jamie Ryan Kiros, Geoffrey E. Hinton
    year: 2016
    url: https://arxiv.org/abs/1607.06450
  - title: "Attention Is All You Need"
    authors: Ashish Vaswani et al.
    year: 2017
    url: https://arxiv.org/abs/1706.03762
  - title: "On Layer Normalization in the Transformer Architecture"
    authors: Ruibin Xiong et al.
    year: 2020
    url: https://arxiv.org/abs/2002.04745
---

# Transformer

## 배경

PyTorch Training Loop 의 MLP 는 길이가 정해진 벡터 하나를 받는다. 번역처럼 길이가 제각각인 sequence 를 받아 다른
sequence 를 내는 문제에서 RNN 기반 seq2seq 는 입력을 한 token 씩 읽어 고정 크기 벡터 하나에 눌러 담았는데, 문장이
길수록 앞부분 정보가 흐려졌다. 2014년 Bahdanau 등은 decoder 가 출력 token 마다 encoder 의 모든 위치를 가중 평균해 다시
보게 하는 attention 을 붙여 이 병목을 풀었다.

2017년 Transformer 는 recurrence 를 아예 빼고 attention 만으로 encoder 와 decoder 를 쌓았다. 각 위치의 query $Q$ 를 모든
위치의 key $K$ 와 내적해 점수를 내고, softmax 를 거친 weight 로 value $V$ 를 섞는다.

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}} + M\right) V
$$

$M$ 은 보면 안 되는 위치에 $-\infty$ 를 넣는 mask 로, padding 을 가리거나 decoder 가 아직 만들지 않은 뒤쪽 token 을 보지
못하게 한다. attention 자체는 token 의 순서를 구분하지 못해서 embedding 에 positional encoding 을 더해 위치를 알려 준다.
또 모든 위치를 한 번에 계산하므로 RNN 과 달리 sequence 방향으로도 병렬로 학습할 수 있다. 이번 과제에서는 이 구조를 attention 부터
직접 짜서 숫자열 뒤집기라는 간단한 번역 문제를 푼다.

## 목표

- scaled dot-product attention 과 multi-head attention 을 짜서 `nn.MultiheadAttention` 과 출력을 맞춘다
- sinusoidal positional encoding, padding mask, causal mask 를 짠다
- self-attention·cross-attention·FFN 에 residual 과 LayerNorm 을 붙인 encoder·decoder layer 로 encoder-decoder 모델을 만든다
- teacher forcing 으로 학습시키고 greedy decoding 으로 숫자열을 뒤집는다
- cross-attention weight 를 heatmap 으로 그린다

**직접 짤 것**: attention, multi-head 분할과 합치기, positional encoding, mask, encoder·decoder layer, greedy decoding.
**가져다 써도 되는 것**: 앞 과제의 내 `Linear` 또는 `nn.Linear`, `nn.Embedding`, `nn.LayerNorm`, `torch.optim.AdamW`.
`nn.MultiheadAttention`·`nn.Transformer`·`F.scaled_dot_product_attention` 은 비교용으로만 쓴다.

## 준비물

- Python 3.12, torch, matplotlib, pytest
- 데이터는 코드로 만든다 — 0–9 숫자 1–10 개로 된 sequence 와 그 역순
- GPU 불필요 — 2 layer·d_model 64 정도의 모델은 CPU 에서 몇 분 안에 학습된다

## 진행 순서

1. 숫자열과 그 역순을 `<bos>`·`<eos>`·`<pad>` 를 붙인 batch 로 만드는 data 함수를 짠다
2. `scaled_dot_product_attention(q, k, v, mask)` 를 짜고 mask 된 위치의 attention weight 가 0 인지 확인한다
3. multi-head attention 을 짜서 `nn.MultiheadAttention` 의 weight 를 옮겨 넣고 출력을 비교한다
4. sinusoidal positional encoding 과 padding mask·causal mask 를 만드는 함수를 짠다
5. `EncoderLayer`·`DecoderLayer` 를 짜고 N 층씩 쌓아 `Seq2SeqTransformer` 를 만든다
6. 정답을 한 칸 민 sequence 를 decoder 입력으로 주는 teacher forcing 으로 학습시킨다(`<pad>` 위치는 loss 에서 뺀다)
7. `<bos>` 에서 시작해 `<eos>` 가 나올 때까지 한 token 씩 붙이는 greedy decoding 으로 exact match 정확도를 잰다
8. 한 예제의 cross-attention weight 를 head 별 heatmap 으로 그린다

## 시작점

```text
transformer/
├── data.py           # reversal task batches
├── attention.py      # scaled_dot_product_attention, MultiHeadAttention
├── model.py          # PositionalEncoding, EncoderLayer, DecoderLayer, Seq2SeqTransformer
├── train.py
└── test_attention.py
```

```python
import torch
from torch import nn, Tensor

PAD, BOS, EOS = 10, 11, 12   # digits 0-9 use ids 0-9
VOCAB = 13

def make_batch(batch_size: int, max_len: int = 10) -> tuple[Tensor, Tensor]:
    """src (B, max_len) padded digits; tgt (B, max_len + 2) = <bos> reversed digits <eos>, then padding."""
    ...

def scaled_dot_product_attention(q: Tensor, k: Tensor, v: Tensor, mask: Tensor | None = None
                                 ) -> tuple[Tensor, Tensor]:
    """q (..., Tq, d), k and v (..., Tk, d). mask True = blocked. returns (output, attention weights)."""
    ...

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int): ...
    def forward(self, x_q: Tensor, x_kv: Tensor, mask: Tensor | None = None) -> Tensor: ...

def causal_mask(t: int) -> Tensor:
    """(t, t) bool, True above the diagonal."""
    ...

class Seq2SeqTransformer(nn.Module):
    def __init__(self, vocab: int = VOCAB, d_model: int = 64, n_heads: int = 4,
                 n_layers: int = 2, d_ff: int = 256): ...
    def forward(self, src: Tensor, tgt_in: Tensor) -> Tensor:
        """returns logits (B, T_tgt, vocab)."""
        ...
    @torch.no_grad()
    def greedy_decode(self, src: Tensor, max_len: int) -> Tensor: ...
```

## 스스로 확인

- [ ] `nn.MultiheadAttention(batch_first=True)` 의 weight 를 옮겨 넣은 내 multi-head attention 이 같은 입력에 1e-5 이내로 같은 출력을 낸다
- [ ] decoder 입력에서 $t$ 번째보다 뒤에 있는 token 을 바꿔도 $t$ 번째까지의 decoder 출력이 1e-6 이내로 그대로다
- [ ] 처음 보는 1,000개 sequence(길이 1–10)에서 greedy decoding 의 exact match 정확도가 99% 이상이다
- [ ] 적어도 한 head 의 cross-attention heatmap 에 역대각선이 보인다
- [ ] (선택) CS336 assignment1-basics 의 `test_scaled_dot_product_attention`·`test_4d_scaled_dot_product_attention` 을 adapter 로 연결해 통과시킨다

## 생각해 볼 질문

1. score 를 $\sqrt{d_k}$ 로 나누지 않으면 $d_k$ 가 클 때 softmax 출력과 학습 초기 gradient 에 어떤 일이 생기는가?
2. positional encoding 을 빼면 이 모델은 숫자열을 뒤집지 못한다. 입력 순서를 섞었을 때 encoder 의 attention 출력이 어떻게 바뀌는지로 설명할 수 있는가?
3. 길이 10 까지만 보고 학습한 모델에 길이 15 를 넣으면 어떻게 될까? positional encoding 이 sinusoidal 일 때와 학습되는 embedding 일 때 무엇이 다른가?

## 힌트

<details>
<summary>mask 의 True 가 뜻하는 것</summary>

`nn.MultiheadAttention` 의 bool mask 는 True 가 "보지 않는다" 이고, `F.scaled_dot_product_attention` 과 CS336 test 는 True 가
"본다" 다. 비교할 때마다 어느 규칙인지 먼저 확인한다. mask 는 softmax 전에 score 를 $-\infty$ 로 채우는 방식으로 적용해야
남은 위치의 weight 합이 1 이 된다.

</details>

<details>
<summary>nn.MultiheadAttention 의 weight 배치</summary>

`in_proj_weight` 는 $W_Q, W_K, W_V$ 를 세로로 이어 붙인 `(3·d_model, d_model)` 행렬이고 `in_proj_bias` 도 같은 순서다.
출력 projection 은 `out_proj` 에 따로 있다.

</details>

<details>
<summary>loss 는 내려가는데 decoding 결과가 엉망일 때</summary>

학습 때 decoder 입력과 정답이 한 칸 어긋나 있는지 확인한다. 어긋나 있지 않으면 모델은 입력을 그대로 베끼는 법만 배운다.
greedy decoding 에서도 학습 때와 같은 causal mask 와 padding mask 를 쓰는지 본다.

</details>

## 참고 자료

- Jay Alammar, [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- Lilian Weng, [Attention? Attention!](https://lilianweng.github.io/posts/2018-06-24-attention/)
- Stanford CS336, [Language Modeling from Scratch](https://cs336.stanford.edu/spring2025/) — 강의와 assignment 1
- PyTorch 문서, [nn.MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html) — weight 배치와 mask 규칙
- Harvard NLP, [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) — 논문을 따라가는 전체 구현, 막혔을 때만 열기

## 남은 한계

encoder-decoder 는 (입력, 정답) 쌍이 있어야 학습되고, 입력도 이산 token 열로만 받는다. 정답 쌍 없이 text 자체로 다음
token 을 배우는 [GPT-2](../gpt/README.md), 이미지를 patch token 으로 읽는 [ViT](../vit/README.md), action 을 token 으로 내는
[RT-1](../rt1/README.md), action chunk 를 생성하는 [ACT](../act/README.md) 는 모두 이 구조를 바탕으로 한다.
