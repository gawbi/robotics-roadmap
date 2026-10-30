import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './cnn.narration.json'
import { script } from './cnn.script'

// Numbers follow lessons/cnn/README.md and its figures (see cnn.script.ts). The 5×5 "1" picture, the filter outputs, the
// max pooling map and the spatial softmax maps are the lesson's own examples; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false, size = 24 }: { children: ReactNode; color?: string; at: number; mono?: boolean; size?: number }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: size, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
        {children}
      </span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
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

/** a Panel that fades in at `at`, so a card is never shown empty before its cue */
function Card({ x, y, w, h, at, children }: { x: number; y: number; w: number; h: number; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      <Panel x={0} y={0} w={w} h={h}>
        {children}
      </Panel>
    </Appear>
  )
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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

const fmt = (v: number | string) => (typeof v === 'number' && v < 0 ? `−${-v}` : `${v}`)

interface Win {
  r: number
  c: number
  n: number
  color: string
  o?: number
}

/**
 * A grid of numbers. `img` draws 1 as a white pixel and 0 as a dark one; `show` fades single cells; `hl` colours a cell's
 * edge; `win` outlines n×n windows on top.
 */
function Mat({ m, cell = 60, gap = 5, fs, img = false, show, hl, win = [], bg }: { m: (number | string)[][]; cell?: number; gap?: number; fs?: number; img?: boolean; show?: (r: number, c: number) => number; hl?: (r: number, c: number) => string | undefined; win?: Win[]; bg?: (r: number, c: number) => string | undefined }) {
  const rows = m.length
  const cols = m[0].length
  const step = cell + gap
  const size = fs ?? Math.round(cell * 0.42)
  return (
    <div style={{ position: 'relative', width: cols * step - gap, height: rows * step - gap }}>
      {m.flatMap((row, r) =>
        row.map((v, c) => {
          const white = img && v === 1
          const edge = hl?.(r, c)
          return (
            <div
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * step,
                top: r * step,
                width: cell,
                height: cell,
                borderRadius: 8,
                background: bg?.(r, c) ?? (white ? C.text : img ? C.grid : C.bg),
                border: `2px solid ${edge ?? (white ? C.text : C.cardEdge)}`,
                display: 'grid',
                placeItems: 'center',
                opacity: show ? show(r, c) : 1,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: size, fontWeight: 600, color: white ? C.bg : edge ?? (img ? C.dim : C.text) }}>{fmt(v)}</span>
            </div>
          )
        }),
      )}
      {win.map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: w.c * step - 6,
            top: w.r * step - 6,
            width: w.n * step - gap + 12,
            height: w.n * step - gap + 12,
            borderRadius: 12,
            border: `4px solid ${w.color}`,
            opacity: w.o ?? 1,
          }}
        />
      ))}
    </div>
  )
}

// the lesson's 5×5 "1" picture, the same picture moved one cell right, the vertical-line filter and its outputs
const IMG = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
]
const IMG_R = IMG.map((r) => [0, ...r.slice(0, 4)])
const K = [
  [-1, 2, -1],
  [-1, 2, -1],
  [-1, 2, -1],
]
const OUT = [
  [-1, 5, -3],
  [-1, 5, -3],
  [-1, 4, -1],
]
const OUT_R = [
  [-1, -1, 5],
  [-1, -1, 5],
  [-1, -1, 4],
]
/** the lesson's 9-position table: the window's three rows, −l + 2m − r for each, and the sum */
const ROWS: [string, string, number][] = [
  ['[0,0,1] [0,1,1] [0,0,1]', '−1, 1, −1', -1],
  ['[0,1,0] [1,1,0] [0,1,0]', '2, 1, 2', 5],
  ['[1,0,0] [1,0,0] [1,0,0]', '−1, −1, −1', -3],
  ['[0,1,1] [0,0,1] [0,0,1]', '1, −1, −1', -1],
  ['[1,1,0] [0,1,0] [0,1,0]', '1, 2, 2', 5],
  ['[1,0,0] [1,0,0] [1,0,0]', '−1, −1, −1', -3],
  ['[0,0,1] [0,0,1] [0,1,1]', '−1, −1, 1', -1],
  ['[0,1,0] [0,1,0] [1,1,1]', '2, 2, 0', 4],
  ['[1,0,0] [1,0,0] [1,1,0]', '−1, −1, 1', -1],
]

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            VISION · CNN
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>CNN</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={{ color: C.accent }}>C</span>onvolutional <span style={{ color: C.accent }}>N</span>eural <span style={{ color: C.accent }}>N</span>etwork
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            작은 filter 하나를 사진의 모든 자리에 대어 보는 convolution 을 쌓은 network
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
  const sizes: [string, number, string, string][] = [
    ['MNIST 손글씨 · 1×28×28', 784, '784', C.dim],
    ['ImageNet · 3×224×224', 150528, '150,528', C.blue],
    ['PR2 카메라 · 3×240×240', 172800, '172,800', C.purple],
    ['ALOHA 카메라 · 3×480×640', 921600, '921,600', C.orange],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 16 }}>
          <Label size={24}>사진 한 장의 숫자 개수 (channel 수 × 세로 × 가로) · ALOHA 는 1초에 50 번 기록</Label>
          {sizes.map(([n, v, f, c], i) => (
            <Bar key={n} label={n} value={v} max={921600} color={c} at={0.6 + i * 0.5} width={900} fmt={f} labelW={400} />
          ))}
        </div>
      </Panel>
      <Appear at={4.3} style={{ position: 'absolute', left: 64, top: 510, width: 1792 }}>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.35, textAlign: 'center' }}>
          컵을 조금만 옮겨도 pixel 값이 모두 바뀐다
          <br />
          <span style={{ color: C.accent }}>policy 는 어떻게 같은 컵을 알아보고 손을 뻗을까?</span>
        </div>
      </Appear>
      <Appear at={5.6} style={{ position: 'absolute', left: 64, top: 720, width: 1792, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Chip at={5.6} color={C.green}>
          ACT: 카메라 네 대 → ResNet-18 → 세로 15 × 가로 20 자리마다 숫자 512 개
        </Chip>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- convolution ----------

function Conv() {
  const t = useSec()
  const k = t < 18.9 ? 0 : Math.min(8, 1 + Math.floor((t - 18.9) / 0.6))
  const winO = prog(t, 6.3) * (1 - prog(t, 24, 0.5))
  const shown = (i: number) => (i === 0 ? prog(t, 13, 0.4) : t >= 18.9 && i <= k ? 1 : 0)
  const mid = t >= 23.2
  const [rows, each, sum] = ROWS[k]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={580} h={560}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 22, opacity: prog(t, 0.4) }}>
          <Head>입력: 5×5 "1" 사진</Head>
          <Mat m={IMG} img cell={84} gap={6} fs={30} win={[{ r: Math.floor(k / 3), c: k % 3, n: 3, color: C.accent, o: winO }]} />
        </div>
      </Panel>
      <Panel x={676} y={140} w={430} h={560}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 22, opacity: prog(t, 1.6) }}>
          <Head color={C.accent}>세로선 filter K (3×3)</Head>
          <Mat m={K} cell={90} gap={8} fs={32} hl={(_r, c) => (c === 1 ? C.green : C.red)} />
          <span style={line(C.muted, 22)}>줄마다 가운데 2, 양옆 −1</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 6.6) }}>window 와 같은 자리끼리 곱한 9 개를 모두 더하면 출력 한 칸</span>
        </div>
      </Panel>
      <Panel x={1138} y={140} w={718} h={560}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 22, opacity: prog(t, 12.6) }}>
          <Head>
            출력 3×3 <span style={{ color: C.green, opacity: prog(t, 24.3) }}>= feature map</span>
          </Head>
          <Mat m={OUT} cell={116} gap={10} fs={42} show={(r, c) => shown(r * 3 + c)} hl={(_r, c) => (mid && c === 1 ? C.green : undefined)} />
          <span style={{ ...line(C.green, 22), opacity: prog(t, 23.4) }}>가운데 줄 5, 5, 4 = "1" 의 세로획이 지나가는 자리</span>
        </div>
      </Panel>
      <Card x={64} y={730} w={1792} h={150} at={6.3}>
        <div style={{ position: 'absolute', left: 32, top: 26, right: 32, display: 'grid', gap: 10, opacity: 1 - prog(t, 24, 0.4) }}>
          <Label size={22} color={C.muted}>
            {t < 18.9 ? '왼쪽 위 window' : `window ${k + 1} / 9`} · 줄마다 −왼쪽 + 2 × 가운데 − 오른쪽
          </Label>
          <div style={{ display: 'flex', gap: 26, alignItems: 'baseline' }}>
            <span style={mono(C.text, 28)}>{rows}</span>
            <span style={mono(C.muted, 28)}>→</span>
            <span style={mono(C.orange, 28)}>{each}</span>
            <span style={{ ...mono(C.accent, 30), opacity: t < 18.9 ? prog(t, 13) : 1 }}>→ 합 {fmt(sum)}</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 30, right: 32, display: 'grid', gap: 10, opacity: prog(t, 24.3) }}>
          <span style={line(C.text, 28)}>filter 하나로 사진 전체를 훑은 숫자 판 = feature map</span>
          <span style={line(C.muted, 24)}>window 가 filter 모양을 닮을수록 값이 크다 · 세로선만 흰 window 라면 2 + 2 + 2 = 6</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Learn() {
  const t = useSec()
  const steps: [string, string, number][] = [
    ['사진', '1 장', 0.6],
    ['filter · 뒤쪽 층', 'parameter', 1.0],
    ['점수', '0 ~ 9 마다 10 개', 6.7],
    ['softmax', '합이 1 인 확률', 7.3],
    ['7 자리 확률', '1 ÷ 10 = 0.1', 7.9],
    ['cross-entropy', '−log 0.1 = 2.303', 8.5],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={320}>
        <div style={{ position: 'absolute', left: 32, top: 26, display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map(([a, b, at], i) => (
            <div key={a} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 236, padding: '14px 16px', borderRadius: 16, border: `1.5px solid ${i === 5 ? C.red : C.blue}88`, background: `${i === 5 ? C.red : C.blue}12`, display: 'grid', gap: 4, opacity: prog(t, at) }}>
                <span style={{ fontSize: 23, fontWeight: 600 }}>{a}</span>
                <span style={mono(C.muted, 20)}>{b}</span>
              </div>
              {i < steps.length - 1 && <span style={{ width: 50, textAlign: 'center', fontSize: 30, color: C.muted, opacity: prog(t, steps[i + 1][2]) }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 32, top: 150, right: 32, display: 'flex', gap: 18, alignItems: 'center', opacity: prog(t, 1.2) }}>
          <span style={{ ...line(C.text, 24) }}>정답은 사진마다 붙은 label 하나뿐:</span>
          <span style={mono(C.orange, 26)}>"이 사진은 7"</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 9) }}>· label 은 마지막 loss 계산에만 들어간다 · 학습이 잘 되어 0.9 면 loss 0.105</span>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 222, right: 32, padding: '14px 22px', borderRadius: 14, border: `1.5px solid ${C.orange}77`, background: `${C.orange}12`, display: 'flex', gap: 18, alignItems: 'center', opacity: prog(t, 13.3) }}>
          <span style={{ fontSize: 30, color: C.orange }}>←</span>
          <span style={line(C.text, 24)}>backpropagation: loss 에서 입력 쪽으로 거꾸로 · filter 숫자 9 개와 bias 가 gradient 를 하나씩 받는다</span>
        </div>
      </Panel>
      <Card x={64} y={490} w={1060} h={390} at={19.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>mini-batch 3 장 · 같은 filter 의 한 칸 w = 0.5</Head>
          <Table
            head={['사진', 'label', 'w 의 gradient', 'loss 를 줄이는 방향']}
            widths={[120, 140, 260, 420]}
            at={19.8}
            step={0.5}
            rows={[
              ['1', '7', '−0.6', 'w 를 늘린다'],
              ['2', '3', '+0.3', 'w 를 줄인다'],
              ['3', '1', '−0.9', 'w 를 늘린다'],
            ]}
          />
          <div style={{ ...mono(C.accent, 28), opacity: prog(t, 21.6), marginTop: 6 }}>g = (−0.6 + 0.3 − 0.9) ÷ 3 = −0.4</div>
        </div>
      </Card>
      <Card x={1156} y={490} w={700} h={390} at={22.4}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.green}>SGD update · learning rate 0.1</Head>
          <span style={mono(C.text, 28)}>w ← w − 0.1 × g</span>
          <span style={{ ...mono(C.text, 28), opacity: prog(t, 23) }}>= 0.5 − 0.1 × (−0.4)</span>
          <span style={{ ...mono(C.green, 34), opacity: prog(t, 23.6) }}>= 0.54 (0.04 늘어남)</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.2) }}>7 · 3 · 1 사진의 gradient 평균으로 고치므로, 첫 층 filter 가 한 숫자에만 맞춰지지 않는다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseConv = () => (
  <PauseWrite
    question="세로선 filter K 를 세 줄이 모두 [0, 0, 1, 0] 인 3×4 사진에 대면, 출력은 몇 칸이고 각 칸의 값은?"
    answer={
      <>
        filter 가 놓일 자리: 세로 1 곳 × 가로 2 곳 → 출력 1×2
        <br />
        왼쪽: 세 줄 모두 [0, 0, 1] → −1 씩, 합 −3 · 오른쪽: 세 줄 모두 [0, 1, 0] → 2 씩, 합 6
        <br />
        답: [−3, 6]
      </>
    }
  />
)

// ---------- weight sharing ----------

function Sharing() {
  const t = useSec()
  const dot = (i: number, x0: number, y0: number, sp: number) => [x0 + (i % 5) * sp, y0 + Math.floor(i / 5) * sp] as const
  const out = (j: number, x0: number, y0: number, sp: number) => [x0 + (j % 3) * sp, y0 + Math.floor(j / 3) * sp] as const
  const lines = prog(t, 7, 1.2)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={230}>
        <div style={{ padding: '22px 32px', display: 'grid', gap: 12, opacity: prog(t, 0.4) }}>
          <Head>사진을 한 줄로 펴서 MLP 에 넣으면 · neuron 1,000 개짜리 첫 layer 의 parameter</Head>
          <Table
            head={['사진', '입력 숫자 수', '1,000 × (입력 + bias 1)']}
            widths={[460, 300, 900]}
            at={0.6}
            step={0.8}
            size={26}
            rows={[
              ['224×224 컬러', '150,528', '1,000 × (150,528 + 1) = 150,529,000'],
              ['ALOHA 카메라 480×640 컬러', '921,600', '1,000 × (921,600 + 1) = 921,601,000'],
            ]}
            colors={[C.text, C.orange]}
          />
        </div>
      </Panel>
      <Card x={64} y={400} w={1100} h={480} at={6.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>5×5 사진 → 숫자 9 개를 내는 두 방식</Head>
        </div>
        <svg width={1100} height={480} style={{ position: 'absolute', left: 0, top: 0 }}>
          {/* MLP: every one of the 9 outputs sees all 25 inputs */}
          <text x={40} y={110} fill={C.blue} fontSize={24} fontWeight={600}>
            MLP layer
          </text>
          {Array.from({ length: 25 }).flatMap((_, i) =>
            Array.from({ length: 9 }).map((__, j) => {
              const [x1, y1] = dot(i, 50, 150, 44)
              const [x2, y2] = out(j, 360, 172, 64)
              return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.blue} strokeWidth={1} opacity={0.18 * lines} />
            }),
          )}
          {Array.from({ length: 25 }).map((_, i) => {
            const [x, y] = dot(i, 50, 150, 44)
            return <circle key={i} cx={x} cy={y} r={9} fill={C.muted} />
          })}
          {Array.from({ length: 9 }).map((_, j) => {
            const [x, y] = out(j, 360, 172, 64)
            return <circle key={j} cx={x} cy={y} r={13} fill={C.blue} />
          })}
          <text x={40} y={400} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8)}>
            9 × (25 + 1) = 234
          </text>
          <text x={40} y={438} fill={C.muted} fontSize={22} opacity={prog(t, 8)}>
            출력마다 25 칸 전부를 본다
          </text>
          {/* convolution: one 3×3 filter reused at every position */}
          <text x={600} y={110} fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 9.5)}>
            3×3 convolution
          </text>
          <g opacity={prog(t, 9.5)}>
            {Array.from({ length: 25 }).map((_, i) => {
              const x = 610 + (i % 5) * 44
              const y = 132 + Math.floor(i / 5) * 44
              const inWin = i % 5 < 3 && Math.floor(i / 5) < 3
              return <rect key={i} x={x} y={y} width={36} height={36} rx={6} fill={inWin ? `${C.green}44` : C.grid} stroke={inWin ? C.green : C.cardEdge} strokeWidth={1.5} />
            })}
            {Array.from({ length: 9 }).map((_, j) => {
              const x = 900 + (j % 3) * 52
              const y = 176 + Math.floor(j / 3) * 52
              return <rect key={j} x={x} y={y} width={44} height={44} rx={6} fill={j === 0 ? C.green : C.grid} stroke={C.green} strokeWidth={1.5} />
            })}
          </g>
          <text x={600} y={400} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 10.5)}>
            9 + 1 = 10
          </text>
          <text x={600} y={438} fill={C.muted} fontSize={22} opacity={prog(t, 10.5)}>
            가까운 3×3 만, 같은 filter 로
          </text>
        </svg>
      </Card>
      <Card x={1196} y={400} w={660} h={480} at={13}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <Head color={C.green}>weight sharing</Head>
          <span style={line(C.text, 24)}>weight 한 벌을 모든 자리에 돌려 쓴다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.5) }}>사진이 커져도 filter 크기는 그대로 → parameter 수가 늘지 않는다</span>
          <div style={{ display: 'grid', gap: 10, marginTop: 6, opacity: prog(t, 19.7) }}>
            <Label size={22} color={C.muted}>
              LeRobot 의 ACT 기본값
            </Label>
            {['224×224 ImageNet 사진으로 미리 학습', 'ResNet-18 weight 를 불러와', '480×640 ALOHA 사진에 그대로'].map((s, i) => (
              <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'center', opacity: prog(t, 19.9 + i * 0.6) }}>
                <span style={mono(C.accent, 24)}>{i === 0 ? '·' : '↓'}</span>
                <span style={{ padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.accent}66`, background: `${C.accent}10`, fontSize: 23 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Shift() {
  const t = useSec()
  const orig = (r: number, c: number) => (IMG[r][c] === 1 ? C.orange : undefined)
  const moves: [number, number][] = [
    [0, 1],
    [0, 0],
    [1, 1],
  ]
  const mi = t < 21.3 ? 0 : t < 22.8 ? 1 : 2
  const [pr, pc] = moves[mi]
  const pool = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (r === pr && c === pc ? 5 : 0)))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={880} h={430}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16, opacity: prog(t, 0.4) }}>
          <Head color={C.orange}>MLP neuron · 주황 칸 8 곳 weight 1, bias −6</Head>
          <div style={{ display: 'flex', gap: 90 }}>
            {[
              { m: IMG, n: 8, z: '8 − 6 = 2', ok: "'1' 이다", c: C.green, at: 0.6, name: '원래 자리' },
              { m: IMG_R, n: 3, z: '3 − 6 = −3', ok: "'1' 이 아니다", c: C.red, at: 3.2, name: '오른쪽으로 한 칸' },
            ].map((d) => (
              <div key={d.name} style={{ display: 'grid', gap: 8, opacity: prog(t, d.at) }}>
                <span style={line(C.muted, 22)}>{d.name}</span>
                <Mat m={d.m} img cell={36} gap={4} fs={18} hl={orig} />
                <span style={mono(C.text, 24)}>흰 칸 {d.n} · z = {d.z}</span>
                <span style={{ ...line(d.c, 24), fontWeight: 600 }}>{d.ok}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Card x={976} y={140} w={880} h={430} at={6.4}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.green}>세로선 filter 의 출력</Head>
          <div style={{ display: 'flex', gap: 90 }}>
            {[
              { m: OUT, col: 1, name: '원래 사진', at: 6.6 },
              { m: OUT_R, col: 2, name: '오른쪽으로 한 칸', at: 8.4 },
            ].map((d) => (
              <div key={d.name} style={{ display: 'grid', gap: 8, opacity: prog(t, d.at) }}>
                <span style={line(C.muted, 22)}>{d.name}</span>
                <Mat m={d.m} cell={56} gap={6} fs={24} hl={(_r, c) => (c === d.col ? C.green : undefined)} />
              </div>
            ))}
          </div>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 10) }}>5 · 5 · 4 가 가운데 줄에서 오른쪽 줄로, 값은 그대로</span>
          <div style={{ opacity: prog(t, 13.2) }}>
            <span style={mono(C.accent, 24)}>translation equivariance</span>
            <span style={line(C.muted, 22)}> · 입력이 옮겨 가면 출력도 같은 만큼</span>
          </div>
        </div>
      </Card>
      <Card x={64} y={600} w={1792} h={280} at={19.6}>
        <div style={{ position: 'absolute', left: 32, top: 26, width: 560, display: 'grid', gap: 12 }}>
          <Head color={C.purple}>2×2 max pooling</Head>
          <span style={line(C.text, 24)}>겹치지 않는 2×2 묶음마다 가장 큰 값 하나만 남긴다 · 학습할 숫자는 없다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.3) }}>5 가 같은 묶음 안에서 움직이면 결과가 그대로 → translation invariance</span>
        </div>
        <div style={{ position: 'absolute', left: 660, top: 28 }}>
          <Mat m={pool} cell={44} gap={4} fs={22} hl={(r, c) => (r === pr && c === pc ? C.purple : undefined)} bg={(r, c) => (r < 2 && c < 2 ? `${C.purple}44` : undefined)} />
          <span style={{ ...mono(C.muted, 22), position: 'absolute', left: 0, top: 196 }}>
            5 의 자리 ({pr}, {pc})
          </span>
        </div>
        <span style={{ position: 'absolute', left: 900, top: 120, fontSize: 36, color: C.muted }}>→</span>
        <div style={{ position: 'absolute', left: 980, top: 76 }}>
          <Mat
            m={[
              [5, 0],
              [0, 0],
            ]}
            cell={64}
            gap={6}
            fs={26}
            hl={(r, c) => (r === 0 && c === 0 ? C.purple : undefined)}
          />
        </div>
        <div style={{ position: 'absolute', left: 1180, top: 60, width: 570, display: 'grid', gap: 10, opacity: prog(t, 22.2) }}>
          <span style={line(C.text, 24)}>(0, 1) · (0, 0) · (1, 1) 어디에 있어도 결과는 왼쪽 위만 5</span>
          <span style={line(C.muted, 22)}>equivariance 는 출력이 함께 옮겨 가는 것, invariance 는 출력이 그대로인 것</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PausePool = () => (
  <PauseWrite
    question="0 으로 가득 찬 4×4 feature map 에서 5 가 (0, 1) 칸에서 (0, 2) 칸으로 옮겨 가면, 2×2 max pooling 의 결과는?"
    answer={
      <>
        [[5, 0], [0, 0]] → [[0, 5], [0, 0]] · 왼쪽 위만 5 에서 오른쪽 위만 5 로 바뀐다
        <br />
        5 가 묶음 경계를 넘었으므로, CNN 이 위치에 완전히 무관해지지는 않는다
      </>
    }
  />
)

// ---------- size and parameters ----------

function Size() {
  const t = useSec()
  const corners: [number, number][] = [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ]
  const ci = Math.floor(Math.max(0, t - 1.2) / 0.8) % 4
  const [wr, wc] = corners[ci]
  const sp = 38
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={780} h={530}>
        <svg width={780} height={530} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={52} fill={C.text} fontSize={26} fontWeight={600}>
            stride 2 · 두 칸씩 옮김
          </text>
          {Array.from({ length: 25 }).map((_, i) => (
            <rect key={i} x={30 + (i % 5) * sp} y={80 + Math.floor(i / 5) * sp} width={32} height={32} rx={5} fill={IMG[Math.floor(i / 5)][i % 5] ? C.text : C.grid} stroke={C.cardEdge} />
          ))}
          <rect x={30 + wc * sp - 5} y={80 + wr * sp - 5} width={3 * sp + 4} height={3 * sp + 4} rx={8} fill="none" stroke={C.accent} strokeWidth={4} opacity={prog(t, 1)} />
          <text x={250} y={140} fill={C.muted} fontSize={30} opacity={prog(t, 2)}>
            →
          </text>
          {[
            [-1, -3],
            [-1, -1],
          ].flatMap((row, r) =>
            row.map((v, c) => (
              <g key={`${r}${c}`} opacity={prog(t, 2.2)}>
                <rect x={300 + c * 62} y={100 + r * 62} width={54} height={54} rx={8} fill={C.bg} stroke={r * 2 + c === ci ? C.accent : C.cardEdge} strokeWidth={2} />
                <text x={327 + c * 62} y={136 + r * 62} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {fmt(v)}
                </text>
              </g>
            )),
          )}
          <text x={300} y={262} fill={C.muted} fontSize={21} opacity={prog(t, 2.6)}>
            출력 2×2
          </text>
          {/* padding 1: a ring of zeros around the 5×5 picture */}
          <g opacity={prog(t, 3.4)}>
            <text x={30} y={322} fill={C.text} fontSize={26} fontWeight={600}>
              padding 1 · 테두리에 0
            </text>
            {Array.from({ length: 49 }).map((_, i) => {
              const r = Math.floor(i / 7)
              const c = i % 7
              const ring = r === 0 || c === 0 || r === 6 || c === 6
              const v = ring ? 0 : IMG[r - 1][c - 1]
              return (
                <g key={i}>
                  <rect x={30 + c * 26} y={340 + r * 26} width={22} height={22} rx={4} fill={ring ? C.bg : v ? C.text : C.grid} stroke={ring ? C.orange : C.cardEdge} strokeWidth={1.2} strokeDasharray={ring ? '3 3' : undefined} />
                </g>
              )
            })}
            <text x={250} y={436} fill={C.muted} fontSize={30}>
              →
            </text>
            <text x={300} y={420} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              7×7 에 3×3
            </text>
            <text x={300} y={458} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              → 출력 5×5
            </text>
          </g>
        </svg>
      </Panel>
      <Card x={876} y={140} w={980} h={530} at={6.5}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Head>출력 길이 (가로도 같다)</Head>
          <span style={mono(C.accent, 40)}>⌊(H + 2p − k) ÷ s⌋ + 1</span>
          <span style={line(C.muted, 22)}>H 입력 길이 · k filter 크기 · p padding · s stride · ⌊ ⌋ 는 소수점 아래를 버림</span>
          <Table
            head={['H', 'k', 'p', 's', '계산', '출력']}
            widths={[70, 60, 60, 60, 520, 110]}
            at={9.5}
            step={0.7}
            size={23}
            colors={[undefined, undefined, undefined, C.green]}
            rows={[
              ['5', '3', '0', '1', '⌊(5 + 0 − 3) / 1⌋ + 1 = 2 + 1', '3'],
              ['5', '3', '0', '2', '⌊(5 + 0 − 3) / 2⌋ + 1 = 1 + 1', '2'],
              ['5', '3', '1', '1', '⌊(5 + 2 − 3) / 1⌋ + 1 = 4 + 1', '5'],
              ['224', '7', '3', '2', '⌊(224 + 6 − 7) / 2⌋ + 1 = 111 + 1', '112'],
            ]}
          />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 13.4) }}>넷째 줄은 ResNet 첫 층의 설정 · 224×224 사진이 112×112 가 된다</span>
        </div>
      </Card>
      <Card x={64} y={700} w={1792} h={180} at={19.6}>
        <svg width={260} height={180} style={{ position: 'absolute', left: 20, top: 0 }}>
          {[C.red, C.green, C.blue].map((c, i) => (
            <rect key={c} x={40 + i * 34} y={30 + i * 22} width={100} height={100} rx={8} fill={`${c}33`} stroke={c} strokeWidth={2} />
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 290, top: 30, right: 32, display: 'grid', gap: 10 }}>
          <span style={line(C.text, 26)}>
            컬러 사진의 3×3 filter = 3×3 판 3 장(R · G · B) → <span style={mono(C.accent, 26)}>3 × 9 = 27</span> 개
          </span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 22.5) }}>장마다 곱해 더한 값을 모두 합치고 bias 를 한 번 더해 숫자 하나 · filter 하나 → 출력 판 한 장 → 출력 channel 수 = filter 수</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function LeNet() {
  const t = useSec()
  const boxes: [string, string, string | null, number][] = [
    ['입력', '1×28×28', null, 6.3],
    ['C1 conv', '6×28×28', '156', 6.7],
    ['S2 pool', '6×14×14', null, 7.1],
    ['C3 conv', '16×10×10', '2,416', 7.5],
    ['S4 pool', '16×5×5', null, 7.9],
    ['펼침', '400', null, 8.6],
    ['F5', '120', '48,120', 9.2],
    ['F6', '84', '10,164', 9.6],
    ['출력', '10', '850', 10],
  ]
  const lit = (i: number) => t >= 12.2 && i <= 4
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={920} h={350}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12, opacity: prog(t, 0.4) }}>
          <Head>conv layer 의 parameter</Head>
          <span style={mono(C.accent, 26)}>출력 channel × (입력 channel × k × k + 1)</span>
          <Table
            head={['층', '계산', 'parameter']}
            widths={[340, 320, 170]}
            at={1}
            step={0.6}
            size={23}
            colors={[undefined, C.accent, undefined, undefined]}
            rows={[
              ['흑백 · 세로선 filter 1 개', '1 × (1 × 9 + 1)', '10'],
              ['컬러 · 3×3 filter 64 개', '64 × (3 × 9 + 1)', '1,792'],
              ['ResNet-18 첫 층 (bias 없음)', '64 × 3 × 49', '9,408'],
              ['LeNet C3', '16 × (6 × 25 + 1)', '2,416'],
            ]}
          />
        </div>
      </Panel>
      <Card x={1016} y={140} w={840} h={350} at={24}>
        <svg width={840} height={350} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            receptive field: 출력 한 칸이 보는 입력
          </text>
          {/* stacked 3×3 convs, drawn in one dimension: 7 → 5 → 3 → 1 */}
          {[7, 5, 3, 1].map((n, row) => {
            const y = 250 - row * 52
            const x0 = 60 + (7 - n) * 22
            return (
              <g key={n} opacity={prog(t, 24.2 + row * 0.4)}>
                {Array.from({ length: n }).map((_, i) => (
                  <rect key={i} x={x0 + i * 44} y={y} width={36} height={32} rx={5} fill={row === 3 ? C.green : `${C.green}${['22', '33', '55'][row]}`} stroke={C.green} strokeWidth={1.2} />
                ))}
              </g>
            )
          })}
          <text x={30} y={318} fill={C.muted} fontSize={21} opacity={prog(t, 25.6)}>
            쌓은 conv 1 개 → 3 · 2 개 → 5 · 3 개 → 7
          </text>
          <g opacity={prog(t, 26.6)}>
            <text x={420} y={120} fill={C.text} fontSize={23}>
              stride · pooling 을 넣으면
            </text>
            <text x={420} y={170} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              LeNet S4 → 16×16
            </text>
            <text x={420} y={220} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ResNet-18 → 435×435
            </text>
            <text x={420} y={262} fill={C.muted} fontSize={21}>
              큰 filter 가 아니라 깊은 층
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={520} w={1792} h={360} at={6}>
        <div style={{ position: 'absolute', left: 32, top: 22 }}>
          <Head>LeNet (MNIST 28×28 에 맞춘 형태) · 장 수 × 세로 × 가로</Head>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 84, display: 'flex', alignItems: 'flex-start' }}>
          {boxes.map(([a, b, p, at], i) => (
            <div key={a} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: 140, display: 'grid', gap: 10, opacity: prog(t, at) }}>
                <div style={{ height: 96, padding: '12px 12px', borderRadius: 14, border: `1.5px solid ${lit(i) ? C.accent : i < 5 ? C.blue : C.purple}88`, background: `${i < 5 ? C.blue : C.purple}12`, display: 'grid', alignContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 600 }}>{a}</span>
                  <span style={mono(lit(i) ? C.accent : C.text, 21)}>{b}</span>
                </div>
                {p && <span style={{ ...mono(C.green, 21), textAlign: 'center', opacity: prog(t, 18.4) }}>{p}</span>}
              </div>
              {i < boxes.length - 1 && <span style={{ width: 48, textAlign: 'center', fontSize: 28, lineHeight: '96px', color: C.muted, opacity: prog(t, boxes[i + 1][3]) }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 32, top: 250, right: 32, display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 12.3) }}>
            channel <span style={mono(C.accent, 24)}>1 → 6 → 16</span> 으로 늘고 가로세로 <span style={mono(C.accent, 24)}>28 → 14 → 10 → 5</span> 로 준다 · "어디에" 는 줄이고 "무엇이" 는 늘린다
          </span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 18.4) }}>
            초록 = parameter · 합 <span style={mono(C.green, 24)}>61,706</span> 개 · MNIST MLP(784 → 256 → 10)의 <span style={mono(C.text, 24)}>203,530</span> 개의 3 분의 1 미만
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseParams = () => (
  <PauseWrite
    question="입력 channel 16 장에 3×3 filter 32 개를 쓰는 conv layer 의 parameter 는 몇 개일까?"
    answer={
      <>
        filter 하나: 16 × 3 × 3 = 144 개 + bias 1 개 = 145 개
        <br />
        filter 32 개: 32 × 145 = 4,640 개
      </>
    }
  />
)

// ---------- image encoders that keep position ----------

function Act() {
  const t = useSec()
  const boxes: { title: string; lines: string[]; color: string; at: number }[] = [
    { title: '카메라 사진', lines: ['480×640×3', '921,600 개'], color: C.blue, at: 0.5 },
    { title: 'ResNet-18', lines: ['stride 2 × 다섯 번', '2⁵ = 32 분의 1'], color: C.accent, at: 6.6 },
    { title: 'feature map', lines: ['15×20×512', '153,600 개'], color: C.green, at: 8 },
    { title: '카메라 4 대', lines: ['300 곳 × 4', '= 1,200 곳'], color: C.orange, at: 13.2 },
    { title: 'transformer', lines: ['+ 관절 각도 14 개', '→ action k × 14'], color: C.purple, at: 15.5 },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={350}>
        <div style={{ position: 'absolute', left: 32, top: 22 }}>
          <Head>ACT 의 image encoder · 사진을 CNN 으로 줄인 뒤 policy 에 넣는다</Head>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 90, display: 'flex', alignItems: 'center' }}>
          {boxes.map((b, i) => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 286, height: 200, padding: '18px 20px', borderRadius: 16, border: `1.5px solid ${b.color}88`, background: `${b.color}12`, display: 'grid', alignContent: 'center', gap: 10, opacity: prog(t, b.at) }}>
                <span style={{ fontSize: 26, fontWeight: 600, color: b.color }}>{b.title}</span>
                {b.lines.map((l) => (
                  <span key={l} style={mono(C.text, 24)}>
                    {l}
                  </span>
                ))}
              </div>
              {i < boxes.length - 1 && <span style={{ width: 70, textAlign: 'center', fontSize: 32, color: C.muted, opacity: prog(t, boxes[i + 1].at) }}>→</span>}
            </div>
          ))}
        </div>
      </Panel>
      <Card x={64} y={520} w={880} h={360} at={9}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>자리를 남기는 크기 계산</Head>
          <span style={mono(C.accent, 26)}>480 ÷ 32 = 15 · 640 ÷ 32 = 20</span>
          <Table
            head={['단계', '크기', '숫자 개수']}
            widths={[300, 260, 220]}
            at={9.6}
            step={0.7}
            size={23}
            rows={[
              ['카메라 사진 한 장', '3 × 480 × 640', '921,600'],
              ['ResNet-18 의 feature map', '512 × 15 × 20', '153,600'],
              ['카메라 네 대의 feature', '1,200 곳 × 512', '614,400'],
            ]}
          />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 13.5) }}>한 곳 = 사진에서 32 pixel 간격의 한 자리</span>
        </div>
      </Card>
      <Card x={976} y={520} w={880} h={360} at={19.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Head>마지막 map 을 어떻게 쓰나</Head>
          <div style={{ padding: '14px 20px', borderRadius: 14, border: `1.5px solid ${C.red}66`, background: `${C.red}10`, display: 'grid', gap: 6 }}>
            <span style={line(C.red, 22)}>ImageNet 분류</span>
            <span style={line(C.text, 23)}>7×7×512 → global average pooling → 512 개 → 1000 class 점수</span>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: 14, border: `1.5px solid ${C.green}66`, background: `${C.green}10`, display: 'grid', gap: 6, opacity: prog(t, 21.4) }}>
            <span style={line(C.green, 22)}>ACT</span>
            <span style={line(C.text, 23)}>평균과 분류 층을 떼어 내고 15×20 자리 구분을 그대로 남긴다</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Spatial() {
  const t = useSec()
  const map = (col: number) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 1 && c === col ? 6 : 0)))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 0.4) }}>
          <Head>pooling 은 자리를 지운다</Head>
          <span style={line(C.muted, 22)}>Levine 등(2016): "위치 정보가 제어에 중요해서 pooling 을 쓰지 않는다"</span>
          <div style={{ display: 'flex', gap: 60, marginTop: 10 }}>
            {[
              { col: 2, name: '6 이 (1, 2) 에', xy: '(1.98, 1.00)' },
              { col: 0, name: '6 이 (1, 0) 에', xy: '(0.02, 1.00)' },
            ].map((d) => (
              <div key={d.col} style={{ width: 380, display: 'grid', gap: 12, opacity: prog(t, 6.2) }}>
                <span style={line(C.text, 23)}>{d.name}</span>
                <Mat m={map(d.col)} cell={84} gap={8} fs={32} hl={(r, c) => (r === 1 && c === d.col ? C.orange : undefined)} />
                <div style={{ display: 'grid', gap: 4, marginTop: 8, opacity: prog(t, 7.6) }}>
                  <span style={line(C.red, 21)}>global average pooling</span>
                  <span style={mono(C.text, 26)}>6 ÷ 9 = 0.67</span>
                </div>
                <div style={{ display: 'grid', gap: 4, opacity: prog(t, 12.6) }}>
                  <span style={line(C.green, 21)}>spatial softmax (x, y)</span>
                  <span style={mono(C.green, 26)}>{d.xy}</span>
                </div>
              </div>
            ))}
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 14) }}>channel 마다 자리별 확률을 만들고 그 확률로 열 · 줄 번호의 평균을 낸다 · 미분할 수 있다</span>
        </div>
      </Panel>
      <Card x={996} y={140} w={860} h={230} at={1}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 10 }}>
          <Head>Levine 등 · PR2 카메라 3×240×240</Head>
          <span style={line(C.text, 23)}>conv 3 층 → 32 channel × 109×109</span>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 13) }}>380,192 개 → 좌표 32 개 = 64 개</span>
        </div>
      </Card>
      <Card x={996} y={400} w={860} h={230} at={18}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 10 }}>
          <Head color={C.orange}>GQ-CNN (Dex-Net 2.0)</Head>
          <span style={line(C.text, 23)}>grasp 중심을 가운데, gripper 축을 가로로 맞춰 depth image 를 옮기고 돌린다</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 19.5) }}>
            <span style={mono(C.orange, 23)}>32×32</span> crop + gripper 깊이 z → grasp 성공 확률
          </span>
        </div>
      </Card>
      <Card x={996} y={660} w={860} h={220} at={24}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 10 }}>
          <Head color={C.purple}>PointPillars</Head>
          <span style={line(C.text, 23)}>
            점 구름 → <span style={mono(C.purple, 23)}>0.16 m</span> 칸마다 숫자 64 개 → 64 channel pseudo-image
          </span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 25.5) }}>→ 3×3 conv 를 쌓은 2D CNN → 3D 상자와 class</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseAct = () => (
  <PauseWrite
    question="카메라 사진이 384×512 이면 ResNet-18 (전체 stride 32) 의 feature map 은 몇 곳이고, 숫자는 몇 개일까?"
    answer={
      <>
        384 ÷ 32 = 12 · 512 ÷ 32 = 16 → 12 × 16 = 192 곳
        <br />
        192 × 512 = 98,304 개
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'convolution 계산', color: C.accent, text: 'filter 를 옮기며 곱해 더한다 · 세로획 자리에 5, 5, 4 · 평균 gradient −0.4 로 w 0.5 → 0.54', at: 0.4 },
    { tag: 'weight sharing', color: C.green, text: 'MLP 234 개 대 conv 10 개 · 한 칸 옮기면 MLP 는 8 → 3, conv 출력은 5, 5, 4 가 함께 옮겨 간다', at: 4.3 },
    { tag: '크기와 parameter', color: C.orange, text: '⌊(H + 2p − k) ÷ s⌋ + 1 · LeNet 61,706 개 · ResNet-18 의 receptive field 435×435', at: 8.3 },
    { tag: '위치를 남기는 encoder', color: C.purple, text: 'ACT 15×20×512 · spatial softmax x 1.98 대 0.02 · GQ-CNN 32×32 · PointPillars 0.16 m', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            숫자가 모두 바뀐 사진에서 policy 는 어떻게 같은 컵을 알아보고 손을 뻗을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.4 }}>{it.text}</span>
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
            NEXT · VISION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>ResNet</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            층을 수십 개 쌓아도 gradient 가 앞쪽 층까지 전해지도록, 입력을 출력에 더하는 연결
          </Label>
        </Appear>
        <Appear at={3.7}>
          <Label color={C.text} size={30}>
            이어서 DDPM · Grasp Planning · LiDAR Perception
          </Label>
        </Appear>
        <Appear at={4.2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/cnn (LeNet-5 · Levine 등 · ACT · Diffusion Policy · Dex-Net 2.0 · PointPillars 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Cnn() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        conv: Conv,
        learn: Learn,
        'pause-conv': PauseConv,
        sharing: Sharing,
        shift: Shift,
        'pause-pool': PausePool,
        size: Size,
        lenet: LeNet,
        'pause-params': PauseParams,
        act: Act,
        spatial: Spatial,
        'pause-act': PauseAct,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
