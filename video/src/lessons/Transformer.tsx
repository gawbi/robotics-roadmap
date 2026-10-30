import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './transformer.narration.json'
import { script } from './transformer.script'

// Numbers follow lessons/transformer/README.md (see transformer.script.ts). The cross-attention heat map and the encoder /
// decoder boxes are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, fmt, labelW = 100 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

function Flow({ steps, color, at, gap = 0.4 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
    </div>
  )
}

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11, opacity = 1) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a simple text table: the first column sans unless `monoFirst`, the rest mono */
function Table({ head, rows, widths, at, step = 0.5, size = 24, colors, monoFirst = false }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; monoFirst?: boolean }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 && !monoFirst ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
            <span key={i} style={cell(i)}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            LANGUAGE · TRANSFORMER
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Transformer</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            token 들이 <span style={{ color: C.accent }}>query · key · value</span> 로 서로를 참고한다
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            attention 을 층으로 쌓아, 수백 개 조각에서 필요한 정보를 골라 모으는 구조
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 1700 }}>
          {script.sections.map((c, i) => (
            <Appear key={c} at={4.4 + i * 0.45}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 28, transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 4.4 - i * 0.45) * 2)})` }}>
                <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>{i + 1}</span>
                {c}
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <div style={{ position: 'absolute', left: 36, top: 28, width: 820, display: 'grid', gap: 16, opacity: prog(t, 0.4) }}>
          <Head color={C.blue}>text · 같은 token id</Head>
          <span style={line(C.text, 25)}>
            "배를 먹었다" 의 "배" → <span style={mono(C.blue, 26)}>token id 0</span>
          </span>
          <span style={{ ...line(C.text, 25), opacity: prog(t, 0.9) }}>
            "배를 탔다" 의 "배" → <span style={mono(C.blue, 26)}>token id 0</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 1.4) }}>과일인지는 "먹었다" 를 봐야 안다</span>
        </div>
        <div style={{ position: 'absolute', left: 930, top: 28, width: 820, display: 'grid', gap: 16, opacity: prog(t, 1.8) }}>
          <Head color={C.orange}>ALOHA 의 카메라 사진 한 장</Head>
          <span style={line(C.text, 25)}>
            ResNet 으로 <span style={mono(C.orange, 26)}>15 × 20 = 300</span> 구역 · 구역마다 숫자 <span style={mono(C.orange, 26)}>512</span> 개
          </span>
          <span style={{ ...line(C.text, 25), opacity: prog(t, 2.3) }}>
            카메라 4 대면 구역 <span style={mono(C.orange, 26)}>1,200</span> 개
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.8) }}>큐브 구역이 집을 자리인지는 집게 구역을 봐야 안다</span>
        </div>
      </Panel>
      <Appear at={4.5} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          수백 개 조각 가운데 <span style={{ color: C.accent }}>필요한 조각의 정보를 어떻게 골라 모을까?</span>
        </div>
      </Appear>
      <Appear at={5.6} style={{ position: 'absolute', left: 230, top: 610, width: 1460 }}>
        <Panel x={0} y={0} w={1460} h={270}>
          <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
            <span style={line(C.text, 26)}>
              <span style={{ color: C.accent, fontWeight: 600 }}>attention</span>: 조각마다 모든 조각과 관련도 점수를 매기고, 점수가 큰 조각의 정보를 많이 섞어 자기 vector 를 고친다
            </span>
            <span style={{ ...line(C.text, 26), opacity: prog(t, 6.2) }}>
              <span style={{ color: C.accent, fontWeight: 600 }}>Transformer</span>: attention 을 층으로 쌓은 구조 (Vaswani 등, 2017)
            </span>
            <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.8) }}>
              ACT 도 이 구조로 구역 1,200 개와 관절 각도를 한꺼번에 읽고 100 step 의 관절 목표값을 낸다 · parameter 약 8,000 만 개 · RTX 2080 Ti 한 장으로 5 시간쯤 학습
            </span>
          </div>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- attention 과 √d_k ----------

function Qkv() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={300} at={0.3} title={<Head color={C.blue}>embedding 표 · token id 로 행 하나를 꺼낸다</Head>}>
        <Table
          head={['token', 'token id', 'embedding']}
          widths={[260, 200, 300]}
          at={0.5}
          step={0.35}
          rows={[
            ['배', '0', '[1, 1]'],
            ['를', '1', '[0, 0]'],
            ['먹었다', '2', '[2, 0]'],
            ['탔다', '3', '[0, 2]'],
          ]}
          colors={[C.accent]}
        />
      </Box>
      <Box x={64} y={460} w={860} h={420} at={6.5} title={<Head color={C.accent}>attention 세 단계 · "배 를 먹었다" 의 "배"</Head>}>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 6.9) }}>
          <span style={line(C.muted, 22)}>① 점수: dot product</span>
          <span style={mono(C.text, 24)}>[1, 1] · [1, 1], [0, 0], [2, 0] → 2, 0, 2</span>
        </div>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 8.4) }}>
          <span style={line(C.muted, 22)}>② weight: softmax 로 0 이상, 합 1</span>
          <span style={mono(C.orange, 24)}>0.468, 0.063, 0.468</span>
        </div>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 10) }}>
          <span style={line(C.muted, 22)}>③ 출력: weight 로 가중 평균</span>
          <span style={mono(C.green, 24)}>0.468 × [1, 1] + 0.468 × [2, 0] = [1.404, 0.468]</span>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.4) }}>"배 를 탔다" 에서는 [0.468, 1.404] 가 된다</span>
      </Box>
      <Box x={956} y={140} w={900} h={220} at={13} gap={10} title={<Head color={C.red}>embedding 그대로 · "집어" 의 weight</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="빨간" value={0.259} max={1} color={C.muted} at={13.4} />
          <Bar label="컵" value={0.035} max={1} color={C.muted} at={13.8} />
          <Bar label="집어" value={0.705} max={1} color={C.red} at={14.2} />
        </div>
      </Box>
      <Box x={956} y={375} w={900} h={265} at={19.5} title={<Head color={C.purple}>W_Q, W_K, W_V 로 역할을 나눈다</Head>}>
        <Table
          head={['token', 'x', 'query', 'key', 'value']}
          widths={[110, 150, 180, 180, 180]}
          at={19.8}
          step={0.4}
          rows={[
            ['빨간', '[1, 0]', '[0, 1]', '[1, 0]', '[1, 0]'],
            ['컵', '[0, 1]', '[1, 0]', '[0, 1]', '[1, 1]'],
            ['집어', '[1, −1]', '[−1, 1]', '[1, −1]', '[0, −1]'],
          ]}
        />
      </Box>
      <Box x={956} y={655} w={900} h={225} at={25.5} gap={10} title={<Head color={C.green}>query · key 로 다시 · "집어" 의 weight</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <Bar label="빨간" value={0.114} max={1} color={C.muted} at={25.8} width={300} />
            <Bar label="컵" value={0.844} max={1} color={C.green} at={26.2} width={300} />
            <Bar label="집어" value={0.042} max={1} color={C.muted} at={26.6} width={300} />
          </div>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 27.6) }}>
            <span style={line(C.muted, 22)}>출력</span>
            <span style={mono(C.green, 26)}>[0.958, 0.802]</span>
            <span style={line(C.muted, 20)}>대부분 "컵" 의 value</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function SoftmaxChart() {
  const t = useSec()
  const base = 385
  const H = 300
  const groups = [
    { x: [90, 215, 340], w: [0.665, 0.245, 0.09], f: ['0.665', '0.245', '0.090'], s: ['1', '0', '−1'], name: '점수 [1, 0, −1]', color: C.blue, at: 6.8 },
    { x: [530, 655, 780], w: [0.99966, 0.00034, 0.0000001], f: ['0.99966', '0.00034', '0.0000001'], s: ['8', '0', '−8'], name: '8 배 한 [8, 0, −8]', color: C.red, at: 9 },
  ]
  return (
    <svg width={900} height={470}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
        softmax 의 weight
      </text>
      <line x1={30} x2={870} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
      {groups.map((g) => (
        <g key={g.name} opacity={prog(t, g.at)}>
          {g.x.map((x, i) => {
            const h = Math.max(2, H * g.w[i] * prog(t, g.at, 0.9))
            return (
              <g key={i}>
                <rect x={x - 35} y={base - h} width={70} height={h} rx={6} fill={g.color} opacity={0.85} />
                <text x={x} y={base - h - 12} textAnchor="middle" fill={g.color} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  {g.f[i]}
                </text>
                <text x={x} y={base + 30} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {g.s[i]}
                </text>
              </g>
            )
          })}
          <text x={g.x[1]} y={base + 62} textAnchor="middle" fill={g.color} fontSize={22} fontWeight={600}>
            {g.name}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Scaling() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={300} at={0.3} title={<Head color={C.accent}>점수는 √d_k 정도로 자란다</Head>}>
        <span style={line(C.text, 23)}>dot product 는 d_k 개 칸의 곱을 더한 값</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.5) }}>
          칸이 서로 독립 · 평균 0 · 분산 1 → 점수의 분산 = <span style={mono(C.accent, 24)}>d_k</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>
          표준편차는 √d_k · <span style={mono(C.orange, 24)}>d_k = 64 → √64 = 8</span>
        </span>
      </Box>
      <Appear at={6.5} style={{ position: 'absolute', left: 956, top: 140, width: 900, height: 470 }}>
        <Panel x={0} y={0} w={900} h={470}>
          <SoftmaxChart />
        </Panel>
      </Appear>
      <Box x={64} y={460} w={860} h={420} at={13} title={<Head color={C.orange}>가운데 점수를 0.5 올리면</Head>}>
        <Table
          head={['점수', '가운데 weight', '올린 뒤', '변화']}
          widths={[230, 210, 180, 170]}
          at={13.3}
          step={0.8}
          monoFirst
          rows={[
            ['[1, 0, −1]', '0.245', '0.348', '+0.103'],
            ['[8, 0, −8]', '0.00034', '0.00055', '+0.0002'],
          ]}
          colors={[C.blue, C.red]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.5) }}>
          점수가 큰 쪽의 weight 변화는 작은 쪽의 <span style={mono(C.red, 24)}>약 500 분의 1</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>weight 가 거의 안 변하면 gradient 도 0 에 가까워, 처음 쏠린 곳에 머문다</span>
      </Box>
      <Box x={956} y={630} w={900} h={250} at={20} title={<Head color={C.green}>scaled dot-product attention</Head>}>
        <span style={{ ...mono(C.green, 28), lineHeight: 1.3 }}>
          softmax(QK<sup style={{ fontSize: 18 }}>T</sup> ÷ √d_k) V
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22) }}>
          "집어" 의 점수 ÷ √2 → "컵" 의 weight <span style={mono(C.green, 24)}>0.844 → 0.734</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.5) }}>같은 수로 나누므로 점수의 순서는 그대로</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseScale = () => <PauseWrite question="d_k = 16 일 때 dot product 가 12 인 점수는 √d_k 로 나눈 뒤 얼마가 될까?" answer="√16 = 4 로 나누므로 12 ÷ 4 = 3" />

// ---------- head · 위치 · block ----------

function Heads() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={330} at={0.3} gap={12} title={<Head color={C.blue}>attention 한 번 · "컵" 의 weight 한 줄</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="빨간" value={0.422} max={1} color={C.blue} at={0.6} />
          <Bar label="컵" value={0.155} max={1} color={C.muted} at={1} />
          <Bar label="집어" value={0.422} max={1} color={C.blue} at={1.4} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3) }}>색 (빨간) 과 동작 (집어) 이 vector 하나에 섞인다</span>
      </Box>
      <Box x={956} y={140} w={900} h={330} at={6.5} gap={12} title={<Head color={C.purple}>multi-head · head 마다 W_Q, W_K, W_V 가 따로</Head>}>
        <Table
          head={['head', '빨간', '컵', '집어', '출력']}
          widths={[110, 120, 120, 120, 270]}
          at={6.8}
          step={0.8}
          rows={[
            ['head 1', '0.576', '0.212', '0.212', '[0.576, 0.212]'],
            ['head 2', '0.212', '0.212', '0.576', '[0.212, 0.576]'],
          ]}
          colors={[C.blue, C.orange]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 9.5) }}>
          이어 붙인 <span style={mono(C.purple, 24)}>[0.576, 0.212, 0.212, 0.576]</span> 에 W_O 를 곱한다
        </span>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 10.5) }}>손으로 정한 숫자의 예 · √d_k 로 나누는 단계는 뺐다</span>
      </Box>
      <Box x={64} y={490} w={860} h={390} at={13} title={<Head color={C.green}>계산량을 같게 두고 head 수만 바꾼 번역</Head>}>
        <Table
          head={['head 수 h', 'head 차원 d_k', 'BLEU']}
          widths={[240, 280, 200]}
          at={13.3}
          step={0.5}
          monoFirst
          rows={[
            ['1', '512', '24.9'],
            ['8', '64', '25.8'],
            ['32', '16', '25.4'],
          ]}
          colors={[C.text, C.green, C.text]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 16) }}>head 1 개는 8 개보다 0.9 점 낮고, 32 개로 나눠도 다시 떨어진다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.5) }}>BLEU: 사람의 번역과 겹치는 정도 · 클수록 좋다</span>
      </Box>
      <Box x={956} y={490} w={900} h={390} at={20} gap={16} title={<Head color={C.accent}>head 하나의 차원 = d_model ÷ h</Head>}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', opacity: prog(t, 20.4) }}>
          <span style={{ ...line(C.muted, 23), width: 260 }}>GPT-2 가장 작은 모델</span>
          <span style={mono(C.text, 28)}>768 ÷ 12 = 64</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', opacity: prog(t, 21.6) }}>
          <span style={{ ...line(C.muted, 23), width: 260 }}>ACT</span>
          <span style={mono(C.text, 28)}>512 ÷ 8 = 64</span>
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23) }}>
          두 모델 모두 점수를 <span style={mono(C.accent, 24)}>√64 = 8</span> 로 나눈다
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>head 를 늘려도 head 수 × head 차원이 같아서 전체 계산량은 비슷하다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Block() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={370} at={0.3} title={<Head color={C.blue}>순서를 모르는 attention · bites 의 출력</Head>}>
        <Table
          head={['문장', 'bites 의 출력']}
          widths={[360, 380]}
          at={0.6}
          step={0.8}
          rows={[
            ['dog bites man', '[0.577, 0.844]'],
            ['man bites dog', '[0.577, 0.844]'],
          ]}
        />
        <span style={{ ...mono(C.orange, 21), opacity: prog(t, 6.8) }}>[sin(pos), cos(pos), sin(pos / 100), cos(pos / 100)]</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 8.6) }}>
          dog [1, 0] + 위치 0 → <span style={mono(C.orange, 24)}>[1, 1]</span> · 위치 2 → <span style={mono(C.orange, 24)}>[1.909, −0.416]</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>sin · cos 은 −1 과 1 사이 · 위치 번호를 그대로 더하면 한없이 커진다</span>
      </Box>
      <Box x={956} y={140} w={900} h={370} at={12.5} gap={10} title={<Head color={C.green}>residual connection · 출력 = x + Sublayer(x)</Head>}>
        <span style={mono(C.text, 24)}>[1, 2] + [0.5, −0.5] = [1.5, 1.5]</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14) }}>층마다 gradient 에 0.1 이 곱해지면 세 층 뒤</span>
        <span style={{ ...mono(C.red, 24), opacity: prog(t, 14.6) }}>0.1 × 0.1 × 0.1 = 0.001</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.8) }}>덧셈 경로의 1 이 더해지면</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 16.4) }}>1.1 × 1.1 × 1.1 = 1.331</span>
      </Box>
      <Box x={64} y={530} w={860} h={350} at={18.5} title={<Head color={C.purple}>LayerNorm · token 하나 안에서 평균 0, 표준편차 1</Head>}>
        <Table
          head={['단계', '[1, 1, 5, 5]', '[10, 10, 50, 50]']}
          widths={[190, 270, 320]}
          size={22}
          at={18.8}
          step={0.5}
          rows={[
            ['평균', '3', '30'],
            ['평균을 뺀 값', '[−2, −2, 2, 2]', '[−20, −20, 20, 20]'],
            ['표준편차', '2', '20'],
            ['나눈 값', '[−1, −1, 1, 1]', '[−1, −1, 1, 1]'],
          ]}
          colors={[undefined, undefined, undefined, C.purple]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.5) }}>dataset 통계가 아니라 token 하나의 칸만 보고 계산한다</span>
      </Box>
      <Box x={956} y={530} w={900} h={350} at={24.5} title={<Head color={C.orange}>FFN 과 encoder layer</Head>}>
        <Flow steps={['self-attention', '+ 입력', 'LayerNorm']} color={C.blue} at={24.8} />
        <Flow steps={['FFN', '+ 입력', 'LayerNorm']} color={C.orange} at={25.8} />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 26.8) }}>
          FFN: token 마다 따로 <span style={mono(C.orange, 24)}>512 → 2,048 → 512</span> (ACT 는 3,200)
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 28) }}>입출력 모양이 같아 그대로 쌓는다 · 원래 논문은 6 층</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseNorm = () => (
  <PauseWrite
    question="[2, 2, 6, 6] 에 LayerNorm 을 하면? (γ = 1, β = 0) 입력 [2, 0] 에 sub-layer 출력 [−1, 3] 을 더한 residual connection 의 값은?"
    answer={
      <>
        평균 4, 표준편차 2 → [−1, −1, 1, 1]
        <br />
        residual: [2 − 1, 0 + 3] = [1, 3]
      </>
    }
  />
)

// ---------- decoder 와 mask ----------

function Tok({ x, y, w = 90, label, color, op }: { x: number; y: number; w?: number; label: string; color: string; op: number }) {
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={50} rx={10} fill={`${color}1f`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 33} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
        {label}
      </text>
    </g>
  )
}

function EncDecDiagram() {
  const t = useSec()
  const enc = prog(t, 0.4)
  const dec = prog(t, 6.6)
  const cross = prog(t, 13.2)
  const decX = [615, 725, 835, 945]
  return (
    <svg width={1100} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={enc}>
        숫자열 뒤집기: 3 1 4 → 4 1 3
      </text>
      <text x={1070} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={enc}>
        모식도
      </text>
      {/* encoder */}
      <g opacity={enc}>
        {[130, 250, 370].map((x, i) => (
          <rect key={i} x={x} y={120} width={80} height={50} rx={8} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={1.5} />
        ))}
        <text x={280} y={100} textAnchor="middle" fill={C.blue} fontSize={22}>
          token 마다 vector
        </text>
        {[170, 290, 410].map((x) => (
          <g key={x}>{arrow(x, 222, x, 176, C.blue, 2.5, 10)}</g>
        ))}
        <rect x={60} y={230} width={440} height={290} rx={16} fill={C.card} stroke={C.blue} strokeWidth={2} />
        <text x={280} y={290} textAnchor="middle" fill={C.blue} fontSize={30} fontWeight={700}>
          encoder
        </text>
        <text x={280} y={350} textAnchor="middle" fill={C.text} fontSize={24}>
          self-attention · FFN
        </text>
        <text x={280} y={395} textAnchor="middle" fill={C.muted} fontSize={22}>
          입력 전체를 한꺼번에 읽는다
        </text>
        {[130, 250, 370].map((x, i) => (
          <Tok key={x} x={x - 5} y={600} label={['3', '1', '4'][i]} color={C.blue} op={1} />
        ))}
        {[170, 290, 410].map((x) => (
          <g key={x}>{arrow(x, 596, x, 526, C.blue, 2.5, 10)}</g>
        ))}
        <text x={280} y={700} textAnchor="middle" fill={C.muted} fontSize={22}>
          입력
        </text>
      </g>
      {/* cross-attention link */}
      <g opacity={cross}>{arrow(506, 380, 594, 380, C.orange, 4, 13)}</g>
      {/* decoder */}
      <g opacity={dec}>
        <rect x={600} y={230} width={460} height={290} rx={16} fill={C.card} stroke={C.green} strokeWidth={2} />
        <text x={830} y={290} textAnchor="middle" fill={C.green} fontSize={30} fontWeight={700}>
          decoder
        </text>
        <text x={830} y={345} textAnchor="middle" fill={C.text} fontSize={24}>
          masked self-attention
        </text>
        <text x={830} y={395} textAnchor="middle" fill={cross > 0.5 ? C.orange : C.text} fontSize={24} fontWeight={cross > 0.5 ? 700 : 400}>
          cross-attention
        </text>
        <text x={830} y={445} textAnchor="middle" fill={C.text} fontSize={24}>
          FFN
        </text>
        {decX.map((x, i) => (
          <Tok key={x} x={x} y={600} label={['<bos>', '4', '1', '3'][i]} color={C.green} op={prog(t, 6.8 + i * 0.5)} />
        ))}
        {decX.map((x, i) => (
          <g key={x} opacity={prog(t, 6.8 + i * 0.5)}>
            {arrow(x + 45, 596, x + 45, 526, C.green, 2.5, 10)}
          </g>
        ))}
        {decX.map((x, i) => (
          <Tok key={x} x={x} y={120} label={['4', '1', '3', '<eos>'][i]} color={C.accent} op={prog(t, 7.1 + i * 0.5)} />
        ))}
        {decX.map((x, i) => (
          <g key={x} opacity={prog(t, 7.1 + i * 0.5)}>
            {arrow(x + 45, 222, x + 45, 176, C.accent, 2.5, 10)}
          </g>
        ))}
        <text x={830} y={100} textAnchor="middle" fill={C.accent} fontSize={22}>
          다음 token
        </text>
        <text x={830} y={700} textAnchor="middle" fill={C.muted} fontSize={22}>
          decoder 입력 (지금까지 쓴 token)
        </text>
      </g>
      <g opacity={cross}>
        <text x={830} y={485} textAnchor="middle" fill={C.orange} fontSize={20}>
          query: decoder · key, value: encoder
        </text>
      </g>
    </svg>
  )
}

function CrossMap() {
  const t = useSec()
  const cell = 75
  const x0 = 200
  const y0 = 110
  const out = ['4', '1', '3']
  const inp = ['3', '1', '4']
  return (
    <svg width={660} height={360}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
        cross-attention weight (예)
      </text>
      <text x={630} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
        모식도
      </text>
      {inp.map((s, j) => (
        <text key={j} x={x0 + j * cell + cell / 2} y={y0 - 14} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO}>
          {s}
        </text>
      ))}
      <text x={x0 + 3 * cell + 20} y={y0 - 14} fill={C.muted} fontSize={20}>
        입력 →
      </text>
      {out.map((s, i) => (
        <text key={i} x={x0 - 18} y={y0 + i * cell + cell / 2 + 8} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO}>
          {s}
        </text>
      ))}
      <text x={40} y={y0 + cell / 2 + 8} fill={C.muted} fontSize={20}>
        출력
      </text>
      {out.map((_, i) =>
        inp.map((_, j) => {
          const hot = i + j === 2
          return <rect key={`${i}${j}`} x={x0 + j * cell + 3} y={y0 + i * cell + 3} width={cell - 6} height={cell - 6} rx={6} fill={hot ? C.orange : C.grid} opacity={hot ? 0.2 + 0.7 * prog(t, 21 + i * 0.5) : 1} />
        }),
      )}
      <text x={x0 + 3 * cell + 20} y={y0 + 2 * cell + 20} fill={C.orange} fontSize={20}>
        반대쪽 대각선
      </text>
    </svg>
  )
}

function EncDec() {
  return (
    <AbsoluteFill>
      <Appear at={0.3} style={{ position: 'absolute', left: 64, top: 140, width: 1100, height: 740 }}>
        <Panel x={0} y={0} w={1100} h={740}>
          <EncDecDiagram />
        </Panel>
      </Appear>
      <Box x={1196} y={140} w={660} h={360} at={6.5} title={<Head color={C.green}>autoregressive · 한 token 씩</Head>}>
        <Table
          head={['단계', 'decoder 입력', '다음 token']}
          widths={[80, 320, 180]}
          size={22}
          at={6.8}
          step={0.5}
          monoFirst
          rows={[
            ['1', '<bos>', '4'],
            ['2', '<bos> 4', '1'],
            ['3', '<bos> 4 1', '3'],
            ['4', '<bos> 4 1 3', '<eos>'],
          ]}
        />
      </Box>
      <Appear at={20} style={{ position: 'absolute', left: 1196, top: 520, width: 660, height: 360 }}>
        <Panel x={0} y={0} w={660} h={360}>
          <CrossMap />
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

function MaskGrid() {
  const t = useSec()
  const cell = 100
  const x0 = 170
  const y0 = 170
  const toks = ['<bos>', '4', '1', '3']
  const block = prog(t, 12.6)
  const cheat = prog(t, 6.7) * (1 - prog(t, 12.4))
  const row2 = prog(t, 13)
  return (
    <svg width={640} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
        teacher forcing: 정답을 한꺼번에
      </text>
      <text x={30} y={82} fill={C.muted} fontSize={20}>
        행: 위치 (query) · 열: 볼 token (key)
      </text>
      {toks.map((s, j) => (
        <text key={j} x={x0 + j * cell + cell / 2} y={y0 - 14} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
          {s}
        </text>
      ))}
      {toks.map((s, i) => (
        <text key={i} x={x0 - 16} y={y0 + i * cell + cell / 2 + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
          {`${i + 1} ${s}`}
        </text>
      ))}
      {toks.map((_, i) =>
        toks.map((_, j) => {
          const future = j > i
          const x = x0 + j * cell
          const y = y0 + i * cell
          return (
            <g key={`${i}${j}`}>
              <rect x={x + 4} y={y + 4} width={cell - 8} height={cell - 8} rx={8} fill={future ? C.grid : `${C.accent}33`} stroke={future ? C.cardEdge : C.accent} strokeWidth={1.5} opacity={future ? 1 : 1} />
              {future && (
                <g opacity={1 - block}>
                  <rect x={x + 4} y={y + 4} width={cell - 8} height={cell - 8} rx={8} fill={`${C.accent}33`} stroke={C.accent} strokeWidth={1.5} />
                </g>
              )}
              {future && (
                <text x={x + cell / 2} y={y + cell / 2 + 8} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={block}>
                  −∞
                </text>
              )}
            </g>
          )
        }),
      )}
      <g opacity={cheat}>
        <rect x={x0 + cell + 4} y={y0 + 4} width={cell - 8} height={cell - 8} rx={8} fill={`${C.red}33`} stroke={C.red} strokeWidth={3} />
        <text x={x0 + cell + cell / 2} y={y0 + cell / 2 + 8} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={700}>
          베끼기
        </text>
      </g>
      <rect x={x0} y={y0 + cell} width={4 * cell} height={cell} rx={10} fill="none" stroke={C.orange} strokeWidth={3} opacity={row2} />
      <text x={30} y={630} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 24.8)}>
        대각선과 그 왼쪽만 열림 = causal mask
      </text>
      <text x={30} y={672} fill={C.muted} fontSize={22} opacity={prog(t, 25.6)}>
        decoder self-attention 에만 쓴다
      </text>
      <text x={30} y={710} fill={C.muted} fontSize={22} opacity={prog(t, 26.4)}>
        encoder · cross-attention 은 막지 않는다
      </text>
    </svg>
  )
}

function Mask() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Appear at={0.3} style={{ position: 'absolute', left: 64, top: 140, width: 640, height: 740 }}>
        <Panel x={0} y={0} w={640} h={740}>
          <MaskGrid />
        </Panel>
      </Appear>
      <Box x={736} y={140} w={1120} h={470} at={12.5} title={<Head color={C.orange}>위치 2 의 "4" · 점수 [1, 2, 3, 0] 에서 위치 3, 4 를 막는다</Head>}>
        <Table
          head={['상대 token', '점수', 'mask 후', <span key="e">e<sup style={{ fontSize: 14 }}>점수</sup></span>, 'weight', 'mask 없을 때']}
          widths={[180, 110, 170, 160, 150, 210]}
          at={12.8}
          step={0.4}
          rows={[
            ['<bos>', '1', '1', '2.718', '0.269', '0.087'],
            ['4', '2', '2', '7.389', '0.731', '0.237'],
            ['1', '3', '−∞', '0', '0', '0.644'],
            ['3', '0', '−∞', '0', '0', '0.032'],
            ['합', '', '', '10.107', '1', '1'],
          ]}
          colors={[C.green, C.green, C.red, C.red, C.muted]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 18.8) }}>
          mask 가 없으면 생성할 때는 아직 없을 "1" 에서 <span style={mono(C.red, 24)}>64.4%</span> 를 가져온다
        </span>
      </Box>
      <Box x={736} y={630} w={1120} h={250} at={18.5} title={<Head color={C.purple}>막는 순서</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.5) }}>
          softmax 먼저 하고 뒤쪽을 지우면 → <span style={mono(C.red, 24)}>0.087 + 0.237 = 0.324</span> · 합이 1 이 아니다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22) }}>
          −∞ 로 바꾼 뒤 softmax → <span style={mono(C.green, 24)}>0.269 + 0.731 = 1</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseReverse = () => (
  <PauseWrite
    question='"3 1 4 1" 을 뒤집으면 decoder 는 몇 단계 만에 멈추고, 첫 출력에서 cross-attention 은 입력의 몇 번째를 가장 많이 볼까?'
    answer={
      <>
        1, 4, 1, 3 다음 &lt;eos&gt; → 모두 5 단계
        <br />
        첫째 출력 "1" 은 입력의 넷째 (마지막) token
      </>
    }
  />
)

// ---------- ACT 의 Transformer ----------

function ActDiagram() {
  const t = useSec()
  const box = (x: number, y: number, w: number, h: number, color: string, op: number) => <rect x={x} y={y} width={w} height={h} rx={14} fill={C.card} stroke={color} strokeWidth={2} opacity={op} />
  const inp = prog(t, 0.5)
  const enc = prog(t, 1.1)
  const dec = prog(t, 1.7)
  const out = prog(t, 2.3)
  const layers = prog(t, 12.8)
  return (
    <svg width={1792} height={470}>
      <g opacity={inp}>
        {box(30, 50, 300, 90, C.orange, 1)}
        <text x={180} y={88} textAnchor="middle" fill={C.text} fontSize={22}>
          사진 구역
        </text>
        <text x={180} y={122} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.8)}>
          4 × 300 = 1,200
        </text>
        {box(30, 165, 300, 70, C.orange, 1)}
        <text x={180} y={208} textAnchor="middle" fill={C.text} fontSize={22}>
          관절 각도 · 1 개
        </text>
        {box(30, 260, 300, 70, C.orange, 1)}
        <text x={180} y={303} textAnchor="middle" fill={C.text} fontSize={22}>
          style 변수 z · 1 개
        </text>
        <text x={180} y={385} textAnchor="middle" fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.5)}>
          token 1,202 개
        </text>
        {arrow(340, 190, 394, 190, C.muted, 3, 12)}
      </g>
      <g opacity={enc}>
        {box(400, 70, 320, 260, C.blue, 1)}
        <text x={560} y={120} textAnchor="middle" fill={C.blue} fontSize={28} fontWeight={700}>
          encoder
        </text>
        <text x={560} y={172} textAnchor="middle" fill={C.text} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={layers}>
          4 층
        </text>
        <text x={560} y={222} textAnchor="middle" fill={C.muted} fontSize={22}>
          self-attention
        </text>
        <text x={560} y={262} textAnchor="middle" fill={C.muted} fontSize={22} opacity={layers}>
          512 차원 · head 8
        </text>
        <text x={560} y={298} textAnchor="middle" fill={C.muted} fontSize={22} opacity={layers}>
          FFN 3,200 차원
        </text>
        {arrow(726, 190, 784, 190, C.muted, 3, 12)}
      </g>
      <g opacity={dec}>
        {box(790, 70, 320, 260, C.green, 1)}
        <text x={950} y={120} textAnchor="middle" fill={C.green} fontSize={28} fontWeight={700}>
          decoder
        </text>
        <text x={950} y={172} textAnchor="middle" fill={C.text} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={layers}>
          7 층 (표 III)
        </text>
        <text x={950} y={222} textAnchor="middle" fill={C.muted} fontSize={22}>
          cross-attention
        </text>
        <text x={950} y={262} textAnchor="middle" fill={C.muted} fontSize={20}>
          encoder 출력 → key · value
        </text>
        <text x={950} y={298} textAnchor="middle" fill={C.muted} fontSize={22} opacity={layers}>
          512 차원 · head 8
        </text>
        <g opacity={prog(t, 18.7)}>
          {box(790, 385, 320, 60, C.accent, 1)}
          <text x={950} y={423} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
            query 100 개 (고정)
          </text>
          {arrow(950, 380, 950, 337, C.accent, 3, 11)}
        </g>
        {arrow(1116, 190, 1174, 190, C.muted, 3, 12)}
      </g>
      <g opacity={out}>
        {box(1180, 130, 220, 120, C.purple, 1)}
        <text x={1290} y={180} textAnchor="middle" fill={C.text} fontSize={22}>
          linear layer
        </text>
        <text x={1290} y={222} textAnchor="middle" fill={C.purple} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 24.8)}>
          512 → 14
        </text>
        {arrow(1406, 190, 1464, 190, C.muted, 3, 12)}
        {box(1470, 90, 290, 200, C.pink, 1)}
        <text x={1615} y={140} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
          action chunk
        </text>
        <text x={1615} y={205} textAnchor="middle" fill={C.pink} fontSize={40} fontFamily={MONO} fontWeight={600}>
          100 × 14
        </text>
        <text x={1615} y={255} textAnchor="middle" fill={C.muted} fontSize={20}>
          100 step × 관절 14
        </text>
      </g>
    </svg>
  )
}

function Act() {
  return (
    <AbsoluteFill>
      <Appear at={0.3} style={{ position: 'absolute', left: 64, top: 140, width: 1792, height: 470 }}>
        <Panel x={0} y={0} w={1792} h={470}>
          <ActDiagram />
        </Panel>
      </Appear>
      <Box x={64} y={630} w={1792} h={250} at={6.5}>
        <Table
          head={['부분', '입력', '출력']}
          widths={[340, 680, 640]}
          at={6.2}
          step={9}
          rows={[
            ['encoder (4 층)', 'token 1,202 개', '512 차원 vector 1,202 개'],
            ['decoder (7 층)', 'query vector 100 개 (step 마다 하나)', '512 차원 vector 100 개'],
            ['linear layer', 'vector 100 개', '100 × 14 action chunk'],
          ]}
          colors={[C.blue, C.green, C.pink]}
        />
      </Box>
    </AbsoluteFill>
  )
}

function DecoderLayers() {
  const t = useSec()
  return (
    <svg width={800} height={230}>
      {Array.from({ length: 7 }, (_, i) => {
        const y = 204 - i * 32
        const first = i === 0
        return (
          <g key={i} opacity={prog(t, 13.3 + i * 0.15)}>
            <rect x={0} y={y} width={300} height={26} rx={6} fill={first ? `${C.green}55` : C.grid} stroke={first ? C.green : C.cardEdge} strokeWidth={1.5} />
            <text x={20} y={y + 20} fill={first ? C.green : C.dim} fontSize={20} fontFamily={MONO} fontWeight={600}>
              {`${i + 1} 층`}
            </text>
          </g>
        )
      })}
      <g opacity={prog(t, 14.5)}>
        <text x={340} y={224} fill={C.green} fontSize={22} fontWeight={600}>
          이 층의 출력을 action 에 쓴다
        </text>
      </g>
      <g opacity={prog(t, 15.5)}>
        <line x1={322} x2={322} y1={14} y2={192} stroke={C.dim} strokeWidth={2} />
        <text x={340} y={90} fill={C.muted} fontSize={22}>
          2 ~ 7 층: action 에 쓰이지 않는다
        </text>
        <text x={340} y={124} fill={C.muted} fontSize={22}>
          gradient 도 닿지 않아 학습되지 않는다
        </text>
      </g>
    </svg>
  )
}

function Squares() {
  const t = useSec()
  const big = 260
  const small = (big * 302) / 1202
  return (
    <svg width={844} height={270}>
      <g opacity={prog(t, 20.4)}>
        <rect x={40} y={265 - small} width={small} height={small} fill={`${C.blue}55`} stroke={C.blue} strokeWidth={2} />
        <text x={40} y={120} fill={C.muted} fontSize={20}>
          카메라 1 대 (시뮬레이션)
        </text>
        <text x={40} y={152} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          302 × 302
        </text>
        <text x={40} y={182} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          = 91,204 칸
        </text>
      </g>
      <g opacity={prog(t, 22)}>
        <rect x={300} y={5} width={big} height={big} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} />
        <text x={430} y={100} textAnchor="middle" fill={C.muted} fontSize={20}>
          카메라 4 대 (ALOHA)
        </text>
        <text x={430} y={140} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          1202 × 1202
        </text>
        <text x={430} y={175} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          = 1,444,804 칸
        </text>
      </g>
      <g opacity={prog(t, 24)}>
        <text x={600} y={130} fill={C.green} fontSize={34} fontFamily={MONO} fontWeight={600}>
          약 16 배
        </text>
        <text x={600} y={170} fill={C.muted} fontSize={20}>
          token 수 비율의 제곱
        </text>
      </g>
    </svg>
  )
}

function ActCost() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={330} at={0.3} title={<Head color={C.green}>한꺼번에 내는 decoder</Head>}>
        <span style={line(C.muted, 23)}>
          번역 decoder: <span style={mono(C.muted, 22)}>&lt;bos&gt; → 4 → 1 → 3</span> 한 token 씩
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 1.5) }}>
          ACT decoder: <span style={mono(C.green, 24)}>query 100 개 → 100 step</span> 동시에
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 3) }}>앞의 출력을 다시 넣지 않으므로, 공개 코드는 decoder 에 causal mask 를 쓰지 않는다</span>
      </Box>
      <Box x={956} y={140} w={900} h={330} at={6.5} title={<Head color={C.accent}>추론 한 번 · 학습</Head>}>
        <span style={line(C.text, 23)}>encoder 한 번 + decoder 한 번</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 8) }}>
          RTX 2080 Ti 한 장에서 추론 <span style={mono(C.accent, 24)}>약 0.01 초</span> (논문)
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>parameter 약 8,000 만 개 · 같은 GPU 한 장으로 5 시간쯤 학습</span>
      </Box>
      <Box x={64} y={490} w={860} h={390} at={13} title={<Head color={C.orange}>공개 코드의 decoder 7 층</Head>}>
        <DecoderLayers />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 17) }}>
          LeRobot 기본값: decoder <span style={mono(C.orange, 24)}>1 층</span>
        </span>
      </Box>
      <Box x={956} y={490} w={900} h={390} at={20} title={<Head color={C.blue}>점수 표 칸 수 = token 수 × token 수</Head>}>
        <Squares />
      </Box>
    </AbsoluteFill>
  )
}

const PauseAct = () => (
  <PauseWrite
    question="카메라 2 대 480 × 640 이면 ACT 의 encoder token 과 점수 표 칸은? chunk 가 50 step 이면 query 는?"
    answer={
      <>
        2 × 300 + 관절 1 + z 1 = 602 개
        <br />
        602 × 602 = 362,404 칸 · query 50 개
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'attention 과 √d_k', color: C.accent, text: '점수 ÷ √d_k 를 softmax 해 value 를 섞는다 · "집어" 는 "컵" 에서 84.4%', at: 0.5 },
    { tag: 'head · 위치 · block', color: C.blue, text: 'head 8 개 BLEU 25.8 · sin · cos 위치 · residual · LayerNorm', at: 4.4 },
    { tag: 'decoder 와 mask', color: C.orange, text: '−∞ 로 막아 [1, 2, 3, 0] → 0.269, 0.731, 0, 0', at: 8.4 },
    { tag: 'ACT 의 Transformer', color: C.pink, text: 'token 1,202 개 · encoder 4 층 · query 100 개 → 100 × 14', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            수백 개 조각 가운데 필요한 조각의 정보를 어떻게 골라 모을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 32, fontWeight: 600 }}>{it.text}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Outro() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>GPT-2 · ViT</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            decoder 만 쌓아 글을 생성하기 · 사진을 patch token 으로 잘라 encoder 에 넣기
          </Label>
        </Appear>
        <Appear at={3.6}>
          <Label color={C.text} size={34}>
            로봇 쪽에서는 <span style={{ color: C.accent }}>RT-1</span> 과 <span style={{ color: C.accent }}>ACT</span> 가 이 구조를 그대로 쓴다
          </Label>
        </Appear>
        <Appear at={4.4} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/transformer (Attention Is All You Need · ACT 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Transformer() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        qkv: Qkv,
        scaling: Scaling,
        'pause-scale': PauseScale,
        heads: Heads,
        block: Block,
        'pause-norm': PauseNorm,
        encdec: EncDec,
        mask: Mask,
        'pause-reverse': PauseReverse,
        act: Act,
        'act-cost': ActCost,
        'pause-act': PauseAct,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
