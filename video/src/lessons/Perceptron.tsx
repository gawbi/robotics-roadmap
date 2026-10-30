import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './perceptron.narration.json'
import { script } from './perceptron.script'

// Numbers follow lessons/perceptron/README.md (see perceptron.script.ts). The gripper and the robot MLP drawings are
// schematic; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false }: { children: ReactNode; color?: string; at: number; mono?: boolean }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
        {children}
      </span>
    </Appear>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a text table whose rows fade in one by one; cells are mono unless `sans` lists the column */
function Table({ head, rows, widths, at, step = 0.5, size = 24, colors, sans = [0], align }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; sans?: number[]; align?: ('left' | 'right' | 'center')[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], flex: 'none', fontFamily: sans.includes(i) ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: align?.[i] ?? (i === 0 ? 'left' : 'center') })
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

// ---------- the (x₁, x₂) plane ----------

type Pt = [number, number]

/** a coordinate plane: origin at (ox, oy) px, `unit` px per 1, drawn over [x0, x1] × [y0, y1] */
function plane(ox: number, oy: number, unit: number, x0: number, x1: number, y0: number, y1: number) {
  const P = ([a, b]: Pt): Pt => [ox + unit * a, oy - unit * b]
  const rect: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  /** the part of `poly` where sign × (a x₁ + b x₂ − c) ≥ 0 */
  const clip = (poly: Pt[], a: number, b: number, c: number, sign: 1 | -1): Pt[] => {
    const f = (p: Pt) => sign * (a * p[0] + b * p[1] - c)
    const out: Pt[] = []
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length]
      const fp = f(p)
      const fq = f(q)
      if (fp >= 0) out.push(p)
      if (fp >= 0 !== fq >= 0) {
        const s = fp / (fp - fq)
        out.push([p[0] + s * (q[0] - p[0]), p[1] + s * (q[1] - p[1])])
      }
    })
    return out
  }
  /** the line a x₁ + b x₂ = c inside the plane, as px end points */
  const seg = (a: number, b: number, c: number): [Pt, Pt] => {
    const pts = clip(rect, a, b, c, 1).filter((p) => Math.abs(a * p[0] + b * p[1] - c) < 1e-9)
    return [P(pts[0]), P(pts[pts.length - 1])]
  }
  const poly = (pts: Pt[]) => pts.map((p) => P(p).join(',')).join(' ')
  return { P, rect, clip, seg, poly, x0, x1, y0, y1 }
}
type Plane = ReturnType<typeof plane>

function Axes({ pl, opacity }: { pl: Plane; opacity: number }) {
  const [ax0, ay] = pl.P([pl.x0, 0])
  const [ax1] = pl.P([pl.x1, 0])
  const [bx, by0] = pl.P([0, pl.y0])
  const [, by1] = pl.P([0, pl.y1])
  return (
    <g opacity={opacity}>
      <line x1={ax0} y1={ay} x2={ax1} y2={ay} stroke={C.dim} strokeWidth={1.5} />
      <line x1={bx} y1={by0} x2={bx} y2={by1} stroke={C.dim} strokeWidth={1.5} />
      <text x={ax1 - 40} y={ay + 34} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
        x₁
      </text>
      <text x={bx - 12} y={by1 + 18} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
        x₂
      </text>
    </g>
  )
}

function BLine({ pl, a, b, c, color, opacity, width = 3.5, dash }: { pl: Plane; a: number; b: number; c: number; color: string; opacity: number; width?: number; dash?: string }) {
  const [[x1, y1], [x2, y2]] = pl.seg(a, b, c)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinecap="round" />
}

/** a sample: filled orange when its answer is 1, hollow when 0 */
function Dot({ pl, p, one, opacity, ring }: { pl: Plane; p: Pt; one: boolean; opacity: number; ring?: string }) {
  const [x, y] = pl.P(p)
  return (
    <g opacity={opacity}>
      {ring && <circle cx={x} cy={y} r={17} fill="none" stroke={ring} strokeWidth={2.5} />}
      <circle cx={x} cy={y} r={9} fill={one ? C.orange : C.card} stroke={one ? C.orange : C.text} strokeWidth={3} />
    </g>
  )
}

function PtLabel({ x, y, children, anchor = 'middle', opacity, color = C.muted }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; opacity: number; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={22} fontFamily={MONO} opacity={opacity}>
      {children}
    </text>
  )
}

const CORNERS: Pt[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            CORE · ROSENBLATT 1958
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Perceptron</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            weighted sum · <span style={{ color: C.accent }}>step function</span> · decision boundary
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            입력에 weight 를 곱해 더한 값이 0 을 넘는지로 1 또는 0 을 답하는 기계
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

/** a two-finger gripper holding an object, a contact pad on each fingertip (schematic) */
function Gripper({ t, at }: { t: number; at: number }) {
  return (
    <svg width={560} height={400}>
      <g opacity={prog(t, at)}>
        <text x={280} y={40} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
          집게 두 손가락 끝의 접촉 센서
        </text>
        <rect x={120} y={70} width={320} height={30} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={130} y={100} width={44} height={200} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={386} y={100} width={44} height={200} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
      </g>
      <g opacity={prog(t, at + 0.4)}>
        <rect x={190} y={215} width={180} height={90} rx={10} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
        <text x={280} y={268} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
          물체
        </text>
      </g>
      <g opacity={prog(t, at + 0.8)}>
        <rect x={174} y={230} width={14} height={60} rx={3} fill={C.orange} />
        <rect x={372} y={230} width={14} height={60} rx={3} fill={C.orange} />
        <text x={110} y={270} textAnchor="end" fill={C.orange} fontSize={32} fontFamily={MONO} fontWeight={600}>
          x₁
        </text>
        <text x={450} y={270} textAnchor="start" fill={C.orange} fontSize={32} fontFamily={MONO} fontWeight={600}>
          x₂
        </text>
        <text x={280} y={360} textAnchor="middle" fill={C.muted} fontSize={22}>
          닿으면 1 · 안 닿으면 0
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  const rows = [
    ['0', '0', '0', '0'],
    ['0', '1', '0', '1'],
    ['1', '0', '0', '1'],
    ['1', '1', '1', '0'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={400}>
        <div style={{ position: 'absolute', left: 20, top: 0 }}>
          <Gripper t={t} at={0.4} />
        </div>
        <div style={{ position: 'absolute', left: 610, top: 50 }}>
          <Table at={1} head={['x₁', 'x₂', '둘 다 닿음 (AND)', '한쪽만 닿음 (XOR)']} widths={[70, 70, 230, 250]} rows={rows} size={28} sans={[]} align={['center', 'center', 'center', 'center']} step={0.25} />
        </div>
        <div style={{ position: 'absolute', left: 1260, top: 60, width: 500, display: 'grid', gap: 26 }}>
          <Label size={24} color={C.muted} style={{ opacity: prog(t, 1.8) }}>
            예시 네 줄만 보여 주고 규칙을 찾게 하면
          </Label>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 2.2) }}>
            <span style={{ color: C.green, fontSize: 30, fontWeight: 700 }}>✓</span>
            <span style={line(C.text, 28)}>"둘 다 닿았나" 는 몇 번 만에 배운다</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 3) }}>
            <span style={{ color: C.red, fontSize: 30, fontWeight: 700 }}>✕</span>
            <span style={line(C.text, 28)}>"한쪽만 닿았나" 는 아무리 오래 학습해도 못 배운다</span>
          </div>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 575, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          같은 센서 두 개짜리 문제에서 <span style={{ color: C.accent }}>왜 이런 차이가 날까?</span>
        </div>
      </Appear>
      <Card x={330} y={690} w={1260} h={180} at={5.6}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12, opacity: prog(t, 5.8) }}>
          <span style={line(C.text, 24)}>perceptron: 1958 년 Frank Rosenblatt 가 뇌의 신경세포를 본떠 발표한, 예시에서 규칙을 찾는 기계</span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 6.4) }}>입력에 숫자를 곱해 더한 값이 0 을 넘는지만 본다 → 평면에 직선 하나를 긋는 일</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- weighted sum, step function, threshold ----------

function TruthTable({ t }: { t: number }) {
  const cols: [string, string, number][] = [
    ['AND', C.orange, 0.8],
    ['OR', C.green, 2.3],
    ['XOR', C.pink, 3.8],
  ]
  const vals = [
    [0, 0, 0],
    [0, 1, 1],
    [0, 1, 1],
    [1, 1, 0],
  ]
  const cell = (w: number, color = C.text, op = 1): CSSProperties => ({ width: w, textAlign: 'center', fontFamily: MONO, fontSize: 28, fontWeight: 600, color, opacity: op })
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        <span style={cell(100, C.muted)}>x₁</span>
        <span style={cell(100, C.muted)}>x₂</span>
        {cols.map(([n, c, a]) => (
          <span key={n} style={cell(140, c, prog(t, a))}>
            {n}
          </span>
        ))}
      </div>
      {CORNERS.map(([a, b], k) => (
        <div key={k} style={{ display: 'flex' }}>
          <span style={cell(100)}>{a}</span>
          <span style={cell(100)}>{b}</span>
          {cols.map(([n, c, at], j) => (
            <span key={n} style={cell(140, vals[k][j] ? c : C.dim, prog(t, at + 0.2))}>
              {vals[k][j]}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** one perceptron: inputs × weights → Σ with bias → step function → ŷ, 1060 × 360 */
function Neuron({ t, at }: { t: number; at: number }) {
  return (
    <svg width={1060} height={360}>
      <g opacity={prog(t, at)}>
        <circle cx={90} cy={100} r={36} fill={C.card} stroke={C.orange} strokeWidth={3} />
        <circle cx={90} cy={270} r={36} fill={C.card} stroke={C.orange} strokeWidth={3} />
        <text x={90} y={110} textAnchor="middle" fill={C.orange} fontSize={30} fontFamily={MONO} fontWeight={600}>
          x₁
        </text>
        <text x={90} y={280} textAnchor="middle" fill={C.orange} fontSize={30} fontFamily={MONO} fontWeight={600}>
          x₂
        </text>
        {arrow(128, 106, 428, 168, C.muted, 3)}
        {arrow(128, 264, 428, 202, C.muted, 3)}
        <text x={232} y={100} fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
          w₁ = 1
        </text>
        <text x={232} y={300} fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
          w₂ = 1
        </text>
      </g>
      <g opacity={prog(t, at + 0.6)}>
        <circle cx={480} cy={185} r={54} fill={C.card} stroke={C.accent} strokeWidth={3} />
        <text x={480} y={200} textAnchor="middle" fill={C.accent} fontSize={46} fontWeight={600}>
          Σ
        </text>
        <text x={480} y={52} textAnchor="middle" fill={C.purple} fontSize={26} fontFamily={MONO} fontWeight={600}>
          b = −1.5
        </text>
        {arrow(480, 64, 480, 128, C.purple, 3)}
      </g>
      <g opacity={prog(t, at + 1.2)}>
        {arrow(536, 185, 616, 185, C.muted, 3)}
        <rect x={620} y={110} width={240} height={150} rx={14} fill={`${C.green}10`} stroke={C.green} strokeWidth={2} />
        <text x={740} y={138} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
          step function
        </text>
        <line x1={650} y1={230} x2={830} y2={230} stroke={C.dim} strokeWidth={1.5} />
        <line x1={650} y1={230} x2={740} y2={230} stroke={C.green} strokeWidth={4} />
        <line x1={740} y1={230} x2={740} y2={160} stroke={C.green} strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={740} y1={160} x2={830} y2={160} stroke={C.green} strokeWidth={4} />
        <text x={740} y={254} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        {arrow(864, 185, 944, 185, C.muted, 3)}
        <circle cx={990} cy={185} r={40} fill={C.card} stroke={C.text} strokeWidth={3} />
        <text x={990} y={197} textAnchor="middle" fill={C.text} fontSize={34} fontFamily={MONO} fontWeight={600}>
          ŷ
        </text>
      </g>
      <g opacity={prog(t, at + 1.8)}>
        <text x={40} y={345} fill={C.text} fontSize={28} fontFamily={MONO} fontWeight={600}>
          z = w₁x₁ + w₂x₂ + b
        </text>
        <text x={620} y={345} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          z {'>'} 0 → 1, 아니면 0
        </text>
      </g>
    </svg>
  )
}

function WeightedSum() {
  const t = useSec()
  const rows: [string, string, string, string, string, string][] = [
    ['[0, 0]', '1×0 + 1×0 = 0', '0 − 1.5 = −1.5', '0', '0 − 0.5 = −0.5', '0'],
    ['[0, 1]', '1×0 + 1×1 = 1', '1 − 1.5 = −0.5', '0', '1 − 0.5 = 0.5', '1'],
    ['[1, 0]', '1×1 + 1×0 = 1', '1 − 1.5 = −0.5', '0', '1 − 0.5 = 0.5', '1'],
    ['[1, 1]', '1×1 + 1×1 = 2', '2 − 1.5 = 0.5', '1', '2 − 0.5 = 1.5', '1'],
  ]
  const widths = [120, 250, 250, 80, 250, 80]
  const show = [12.8, 12.8, 13.6, 19, 25, 25.6]
  const color = [C.text, C.text, C.purple, C.orange, C.green, C.green]
  const cell = (i: number, op: number, c = color[i]): CSSProperties => ({ width: widths[i], flex: 'none', textAlign: i === 0 ? 'left' : 'center', fontFamily: MONO, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', color: c, opacity: op })
  const head = ['입력 x', 'w₁x₁ + w₂x₂', 'z (b = −1.5)', 'ŷ', 'z (b = −0.5)', 'ŷ']
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={700} h={360} at={0.3} title={<Head>truth table · 한 줄이 sample 하나</Head>}>
        <TruthTable t={t} />
      </Box>
      <Card x={796} y={140} w={1060} h={360} at={6.5}>
        <Neuron t={t} at={6.7} />
      </Card>
      <Box x={64} y={530} w={1200} h={350} at={12.5} title={<Head color={C.blue}>w = [1, 1] 로 네 입력을 계산</Head>} gap={10}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
            {head.map((h, i) => (
              <span key={i} style={{ ...cell(i, prog(t, show[i]), C.muted), fontFamily: undefined, fontSize: 22, fontWeight: 500 }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map((r, k) => (
            <div key={k} style={{ display: 'flex' }}>
              {r.map((v, i) => (
                <span key={i} style={cell(i, prog(t, show[i] + 0.2 + k * 0.15))}>
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 40, marginTop: 4 }}>
          <span style={{ ...line(C.orange, 22), opacity: prog(t, 20) }}>b = −1.5 → 예측 0, 0, 0, 1 = AND</span>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 26) }}>b = −0.5 → 예측 0, 1, 1, 1 = OR</span>
        </div>
      </Box>
      <Box x={1288} y={530} w={568} h={350} at={24.6} title={<Head color={C.purple}>threshold θ 와 bias</Head>} gap={10}>
        <span style={line(C.text, 22)}>Rosenblatt (1958): 합이 문턱 θ 를 넘으면 1</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 25.4) }}>합 {'>'} 1.5 ⇔ 합 − 1.5 {'>'} 0</span>
        <span style={{ ...line(C.purple, 22), opacity: prog(t, 26.2) }}>
          그래서 b = −(문턱) · 문턱 1.5 → b = −1.5
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27) }}>문턱 0.5 → OR · 1.5 → AND · 2.5 → 늘 0</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- decision boundary ----------

function Boundary() {
  const t = useSec()
  const pl = plane(150, 600, 360, -0.25, 1.55, -0.25, 1.35)
  const shade = prog(t, 1.2) * (1 - prog(t, 13.5, 0.8))
  const lines = prog(t, 13.8)
  const [r1x, r1y] = pl.P([1, 1])
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <svg width={760} height={740}>
          <text x={36} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.4)}>
            AND 의 네 점과 decision boundary
          </text>
          <polygon points={pl.poly(pl.clip(pl.rect, 1, 1, 1.5, 1))} fill={C.blue} opacity={0.14 * shade} />
          <Axes pl={pl} opacity={prog(t, 0.5)} />
          <BLine pl={pl} a={1} b={1} c={0.5} color={C.green} opacity={lines} />
          <BLine pl={pl} a={1} b={1} c={2.5} color={C.purple} opacity={lines} />
          <BLine pl={pl} a={1} b={1} c={1.5} color={C.blue} opacity={prog(t, 1)} />
          <text x={256} y={140} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 1.4) * (1 - lines)}>
            x₁ + x₂ = 1.5
          </text>
          <text x={430} y={192} fill={C.blue} fontSize={22} opacity={prog(t, 7.3) * (1 - lines)}>
            z {'>'} 0 → 1 로 예측
          </text>
          <text x={180} y={470} fill={C.muted} fontSize={22} opacity={prog(t, 7.6) * (1 - lines)}>
            z {'<'} 0 → 0 으로 예측
          </text>
          {CORNERS.map((p) => (
            <Dot key={p.join()} pl={pl} p={p} one={p[0] + p[1] === 2} opacity={prog(t, 0.6)} />
          ))}
          <circle cx={r1x} cy={r1y} r={18} fill="none" stroke={C.accent} strokeWidth={3} opacity={prog(t, 8) * (1 - lines)} />
          <PtLabel x={150} y={640} opacity={prog(t, 0.7)}>
            (0, 0)
          </PtLabel>
          <PtLabel x={510} y={640} opacity={prog(t, 0.7)}>
            (1, 0)
          </PtLabel>
          <PtLabel x={128} y={248} anchor="end" opacity={prog(t, 0.7)}>
            (0, 1)
          </PtLabel>
          <PtLabel x={534} y={248} anchor="start" opacity={prog(t, 0.7)}>
            (1, 1)
          </PtLabel>
        </svg>
      </Card>
      <Box x={856} y={140} w={1000} h={230} at={0.3} title={<Head color={C.blue}>decision boundary: z = 0 인 점들</Head>} gap={10}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 0.9) }}>
          w = [1, 1], b = −1.5 → <span style={mono(C.blue, 24)}>x₁ + x₂ − 1.5 = 0</span> → <span style={mono(C.blue, 24)}>x₁ + x₂ = 1.5</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 3.5) }}>(0, 1.5), (0.5, 1), (1, 0.5) 처럼 x₁ 이 0.5 늘면 x₂ 가 0.5 준다</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 8.2) }}>(1, 1): z = 0.5 {'>'} 0 → 1 쪽 · 직선 위의 점은 z = 0 → 0 쪽</span>
      </Box>
      <Box x={856} y={390} w={1000} h={255} at={13.5} title={<Head>w = [1, 1] 그대로 두고 b 만 바꾸기</Head>} gap={10}>
        <Table
          at={13.8}
          step={0.6}
          head={['', 'b', 'decision boundary', '1 쪽 점', '규칙']}
          widths={[60, 140, 300, 160, 160]}
          sans={[0, 3, 4]}
          rows={[
            [<Swatch key="g" color={C.green} />, '−0.5', 'x₁ + x₂ = 0.5', '3 개', 'OR'],
            [<Swatch key="b" color={C.blue} />, '−1.5', 'x₁ + x₂ = 1.5', '1 개', 'AND'],
            [<Swatch key="p" color={C.purple} />, '−2.5', 'x₁ + x₂ = 2.5', '0 개', '늘 0'],
          ]}
          colors={[C.green, C.blue, C.purple]}
        />
      </Box>
      <Box x={856} y={665} w={1000} h={215} at={20.5} title={<Head color={C.accent}>weight 는 방향 · bias 는 위치</Head>} gap={10}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21) }}>b = 0 이면 원점의 z 가 늘 0 → 직선이 원점을 지나 AND 를 가를 수 없다</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 24) }}>w, b 를 2 배 한 [2, 2], −3 의 z 는 −3, −1, −1, 1 → 부호가 같아 같은 직선</span>
      </Box>
    </AbsoluteFill>
  )
}

function Swatch({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 34, height: 5, borderRadius: 3, background: color, verticalAlign: 'middle' }} />
}

// ---------- learning rule ----------

function Rule() {
  const t = useSec()
  const p = prog(t, 10.4, 1.4)
  const zx = (z: number) => 60 + ((z + 0.2) / 0.6) * 720
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={410} at={0.3} title={<Head color={C.orange}>AND 의 입력 [1, 1] · 시작 w = [0, 0], b = 0</Head>} gap={12}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 2) }}>z = 0 × 1 + 0 × 1 + 0 = 0 → ŷ = 0</span>
        <span style={{ ...line(C.red, 24), opacity: prog(t, 3.6) }}>정답 y = 1 인데 0 으로 예측 → 틀림</span>
        <Table
          at={7.2}
          step={0.5}
          head={['값', '계산', '결과']}
          widths={[260, 380, 160]}
          rows={[
            ['오차 (정답 − 예측)', '1 − 0', '+1'],
            ['새 w₁', '0 + 0.1 × (+1) × 1', '0.1'],
            ['새 w₂', '0 + 0.1 × (+1) × 1', '0.1'],
            ['새 b', '0 + 0.1 × (+1)', '0.1'],
          ]}
        />
      </Box>
      <Box x={64} y={570} w={900} h={310} at={9.6} title={<Head color={C.green}>고친 뒤 같은 입력 [1, 1] 의 z</Head>} gap={10}>
        <svg width={844} height={110}>
          <line x1={zx(-0.2)} y1={60} x2={zx(0.4)} y2={60} stroke={C.dim} strokeWidth={2} />
          <line x1={zx(0)} y1={30} x2={zx(0)} y2={90} stroke={C.muted} strokeWidth={2} strokeDasharray="5 5" />
          <text x={zx(0)} y={22} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            z = 0
          </text>
          <rect x={zx(0)} y={52} width={zx(0.3 * p) - zx(0)} height={16} rx={4} fill={`${C.green}88`} />
          <circle cx={zx(0)} cy={60} r={9} fill={C.card} stroke={C.text} strokeWidth={3} />
          <circle cx={zx(0.3 * p)} cy={60} r={10} fill={C.green} opacity={prog(t, 10.4)} />
          <text x={zx(0)} y={106} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
            전 0
          </text>
          <text x={zx(0.3)} y={106} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 11.8)}>
            후 0.3
          </text>
          <text x={zx(0.15)} y={36} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 12.2)}>
            +0.3
          </text>
        </svg>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 12) }}>0.1 × 1 + 0.1 × 1 + 0.1 = 0.3 {'>'} 0 → ŷ = 1</span>
      </Box>
      <Box x={988} y={140} w={868} h={300} at={14} title={<Head color={C.accent}>perceptron 학습 규칙</Head>} gap={10}>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 14.4) }}>w₁ ← w₁ + η (y − ŷ) x₁</span>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 14.8) }}>w₂ ← w₂ + η (y − ŷ) x₂</span>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 15.2) }}>b ← b + η (y − ŷ)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>η: learning rate · 한 번에 고치는 크기 (여기서 0.1) · y − ŷ: 오차</span>
      </Box>
      <Box x={988} y={460} w={868} h={420} at={21} title={<Head color={C.orange}>오차 y − ŷ 는 −1, 0, +1 셋뿐</Head>} gap={12}>
        <Table
          at={21.3}
          step={0.5}
          head={['경우', 'y', 'ŷ', '오차', '숫자의 변화']}
          widths={[220, 70, 90, 80, 330]}
          sans={[0, 2, 4]}
          align={['left', 'center', 'center', 'center', 'left']}
          rows={[
            ['맞힘', '0 · 1', 'y 와 같음', '0', '바뀌지 않는다'],
            ['1 을 0 으로 틀림', '1', '0', '+1', 'η × 입력을 더한다'],
            ['0 을 1 로 틀림', '0', '1', '−1', 'η × 입력을 뺀다'],
          ]}
          colors={[C.green, C.text, C.text]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.5) }}>맞힌 sample 은 오차가 0 → 틀린 sample 에서만 고친다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>입력이 0 인 자리의 weight 도 그대로 · 그 입력은 z 에 영향을 주지 않았다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- epochs, online update, learning rate ----------

function Epochs() {
  const t = useSec()
  const runs: [number, string][] = [
    [1, '0.1, 0.1, 0.1'],
    [3, '0.2, 0.1, 0'],
    [3, '0.2, 0.1, −0.1'],
    [2, '0.2, 0.2, −0.1'],
    [1, '0.2, 0.1, −0.2'],
    [0, '0.2, 0.1, −0.2'],
  ]
  const pl = plane(130, 370, 250, -0.25, 1.45, -0.2, 1.15)
  const [ox, oy] = pl.P([1, 0])
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1100} h={220} at={0.3} title={<Head>epoch 와 online update</Head>} gap={10}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 0.6) }}>epoch: truth table 의 네 sample 을 처음부터 끝까지 한 번 보기 · step: sample 하나</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 3.5) }}>online update: 틀리면 그 자리에서 고치고, 뒤의 sample 은 고친 숫자로 예측</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 5) }}>batch update: 모았다가 epoch 끝에 한꺼번에 → AND 는 4 epoch, x₁ + x₂ = 1</span>
        </div>
      </Box>
      <Box x={64} y={380} w={1100} h={500} at={7} title={<Head color={C.orange}>η = 0.1 · AND 를 truth table 순서로 online update</Head>} gap={12}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted, fontSize: 22 }}>
            <span style={{ width: 140 }}>epoch</span>
            <span style={{ width: 360 }}>그 epoch 에 틀린 수</span>
            <span style={{ width: 400 }}>epoch 끝의 w₁, w₂, b</span>
          </div>
          {runs.map(([wrong, wb], k) => {
            const at = 7.4 + k * 0.6
            const last = k === runs.length - 1
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', opacity: prog(t, at) }}>
                <span style={{ ...mono(last ? C.green : C.text, 24), width: 140 }}>{k + 1}</span>
                <span style={{ width: 360, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ display: 'inline-block', width: 60 * wrong * prog(t, at, 0.8), minWidth: 4, height: 22, borderRadius: 5, background: last ? C.green : C.red }} />
                  <span style={mono(last ? C.green : C.red, 24)}>{wrong}</span>
                </span>
                <span style={{ ...mono(last ? C.green : C.text, 24), width: 400 }}>{wb}</span>
              </div>
            )
          })}
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.5) }}>24 step 동안 10 번 틀림 · epoch 6 에 0 번 → 수렴 · 숫자는 epoch 5 끝에 이미 최종</span>
      </Box>
      <Card x={1188} y={140} w={668} h={436} at={14}>
        <svg width={668} height={436}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 14.2)}>
            학습한 decision boundary
          </text>
          <polygon points={pl.poly(pl.clip(pl.rect, 2, 1, 2, 1))} fill={C.blue} opacity={0.14 * prog(t, 15)} />
          <Axes pl={pl} opacity={prog(t, 14.3)} />
          <BLine pl={pl} a={2} b={1} c={2} color={C.blue} opacity={prog(t, 14.8)} />
          {CORNERS.map((p) => (
            <Dot key={p.join()} pl={pl} p={p} one={p[0] + p[1] === 2} opacity={prog(t, 14.4)} ring={p[0] === 1 && p[1] === 0 ? C.accent : undefined} />
          ))}
          <text x={256} y={100} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15.4)}>
            2x₁ + x₂ = 2
          </text>
          <text x={ox + 26} y={oy - 40} fill={C.accent} fontSize={20} fontFamily={MONO} opacity={prog(t, 17)}>
            z = 0.2 − 0.2 = 0
          </text>
          <text x={ox + 26} y={oy - 14} fill={C.accent} fontSize={20} opacity={prog(t, 17.4)}>
            → 0 으로 예측
          </text>
        </svg>
      </Card>
      <Box x={1188} y={596} w={668} h={284} at={21} title={<Head color={C.accent} size={24}>η = 1.0 (10 배) 로 다시 학습하면</Head>} gap={10}>
        <Table
          at={21.3}
          step={0.5}
          size={22}
          head={['항목', 'η = 0.1', 'η = 1.0']}
          widths={[200, 230, 170]}
          rows={[
            ['수렴 epoch', '6', '6'],
            ['마지막 w, b', '[0.2, 0.1], −0.2', '[2, 1], −2'],
            ['decision boundary', '2x₁ + x₂ = 2', '같음'],
          ]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24) }}>0 에서 시작하면 숫자가 처음부터 10 배 → z 도 10 배, 부호가 같다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- linearly separable, XOR ----------

function Xor() {
  const t = useSec()
  const pl = plane(170, 560, 360, -0.2, 1.45, -0.2, 1.3)
  const andOp = prog(t, 0.5) * (1 - prog(t, 12.2, 0.5))
  const xorOp = prog(t, 12.7)
  const [cx, cy] = pl.P([0.5, 0.5])
  const [a0, a1] = [pl.P([0, 1]), pl.P([1, 0])]
  const [b0, b1] = [pl.P([0, 0]), pl.P([1, 1])]
  const states: [string, string][] = [
    ['A', '[−1, 0], 1'],
    ['B', '[−1, 0], 0'],
    ['C', '[−1, 1], 1'],
    ['D', '[0, 1], 2'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <svg width={760} height={740}>
          <text x={36} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={andOp}>
            AND: 직선 하나로 갈린다
          </text>
          <text x={36} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={xorOp}>
            XOR 의 네 점
          </text>
          <Axes pl={pl} opacity={prog(t, 0.5)} />
          <g opacity={andOp}>
            <polygon points={pl.poly(pl.clip(pl.rect, 1, 1, 1.5, 1))} fill={C.blue} opacity={0.14} />
            <BLine pl={pl} a={1} b={1} c={1.5} color={C.blue} opacity={1} />
            {CORNERS.map((p) => (
              <Dot key={p.join()} pl={pl} p={p} one={p[0] + p[1] === 2} opacity={1} />
            ))}
          </g>
          <g opacity={xorOp}>
            {CORNERS.map((p) => (
              <Dot key={p.join()} pl={pl} p={p} one={p[0] + p[1] === 1} opacity={1} />
            ))}
            <line x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke={C.orange} strokeWidth={3} opacity={prog(t, 14)} />
            <line x1={b0[0]} y1={b0[1]} x2={b1[0]} y2={b1[1]} stroke={C.text} strokeWidth={2.5} strokeDasharray="8 7" opacity={prog(t, 14.6)} />
            <circle cx={cx} cy={cy} r={13} fill="none" stroke={C.accent} strokeWidth={3} opacity={prog(t, 16)} />
            <text x={cx + 26} y={cy + 8} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16)}>
              (0.5, 0.5)
            </text>
            <text x={b0[0]} y={b0[1] + 40} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              (0, 0)
            </text>
            <text x={a1[0]} y={a1[1] + 40} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO}>
              (1, 0)
            </text>
            <text x={a0[0] - 22} y={a0[1] + 8} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO}>
              (0, 1)
            </text>
            <text x={b1[0] + 24} y={b1[1] + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
              (1, 1)
            </text>
            <text x={36} y={680} fill={C.text} fontSize={22} opacity={prog(t, 18.8)}>
              같은 쪽 두 점을 잇는 선분은 통째로 같은 쪽에 있다
            </text>
            <text x={36} y={714} fill={C.accent} fontSize={22} opacity={prog(t, 20.8)}>
              → (0.5, 0.5) 는 1 쪽이면서 0 쪽 → 그런 직선은 없다
            </text>
          </g>
        </svg>
      </Card>
      <Box x={856} y={140} w={1000} h={200} at={0.3} title={<Head color={C.blue}>linearly separable</Head>} gap={12}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 0.8) }}>0 인 점과 1 인 점을 직선 하나로 완전히 가를 수 있는 데이터</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Chip color={C.green} at={2}>
            AND ✓
          </Chip>
          <Chip color={C.green} at={2.8}>
            OR ✓
          </Chip>
          <Chip color={C.red} at={13}>
            XOR ✕
          </Chip>
        </div>
      </Box>
      <Box x={856} y={360} w={1000} h={200} at={6.5} title={<Head color={C.green}>Novikoff (1962) 의 증명</Head>} gap={10}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 7) }}>linearly separable 하면 학습 규칙은 유한한 횟수만 틀린 뒤 반드시 수렴한다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.5) }}>틀리는 횟수의 상한은 learning rate 나 sample 순서와 상관없이 성립한다</span>
      </Box>
      <Box x={856} y={580} w={1000} h={300} at={24.5} title={<Head color={C.red}>XOR 에 학습 규칙을 그대로 적용 (η = 1)</Head>} gap={14}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 24.8) }}>epoch 별 틀린 수: 2, 3, 4, 4, …</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, 25.4) }}>
          {states.map(([n, v], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 160, boxSizing: 'border-box', padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${C.orange}88`, background: `${C.orange}12`, display: 'grid', justifyItems: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.orange }}>{n}</span>
                <span style={mono(C.text, 20)}>{v}</span>
              </div>
              <span style={{ fontSize: 26, color: C.muted }}>→</span>
              {i === states.length - 1 && <span style={{ fontSize: 22, fontWeight: 700, color: C.orange }}>A</span>}
            </div>
          ))}
        </div>
        <span style={{ ...mono(C.red, 24), opacity: prog(t, 27.4) }}>1,000 epoch → 2 + 3 + 4 × 998 = 3997 번 틀림</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- two layers, credit assignment ----------

function unitEdge(a: Pt, ra: number, b: Pt, rb: number, color: string, opacity: number) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1])
  const ux = (b[0] - a[0]) / d
  const uy = (b[1] - a[1]) / d
  return arrow(a[0] + ux * ra, a[1] + uy * ra, b[0] - ux * (rb + 4), b[1] - uy * (rb + 4), color, 2.5, 10, opacity)
}

function Network({ t }: { t: number }) {
  const x1: Pt = [80, 120]
  const x2: Pt = [80, 290]
  const h1: Pt = [440, 110]
  const h2: Pt = [440, 300]
  const out: Pt = [800, 205]
  const unit = (p: Pt, r: number, color: string, label: string, op: number) => (
    <g opacity={op}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={C.card} stroke={color} strokeWidth={3} />
      <text x={p[0]} y={p[1] + 10} textAnchor="middle" fill={color} fontSize={28} fontFamily={MONO} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  const pin = prog(t, 0.5)
  const ph = prog(t, 1.2)
  const po = prog(t, 3.4)
  return (
    <svg width={980} height={420}>
      {unitEdge(x1, 34, h1, 46, C.dim, ph)}
      {unitEdge(x1, 34, h2, 46, C.dim, ph)}
      {unitEdge(x2, 34, h1, 46, C.dim, ph)}
      {unitEdge(x2, 34, h2, 46, C.dim, ph)}
      {unitEdge(h1, 46, out, 46, C.dim, po)}
      {unitEdge(h2, 46, out, 46, C.dim, po)}
      {unit(x1, 34, C.orange, 'x₁', pin)}
      {unit(x2, 34, C.orange, 'x₂', pin)}
      {unit(h1, 46, C.green, 'h₁', ph)}
      {unit(h2, 46, C.blue, 'h₂', ph)}
      {unit(out, 46, C.accent, 'Σ', po)}
      <g opacity={po}>
        {arrow(850, 205, 900, 205, C.muted, 3)}
        <text x={914} y={217} fill={C.text} fontSize={34} fontFamily={MONO} fontWeight={600}>
          ŷ
        </text>
      </g>
      <text x={h1[0]} y={30} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600} opacity={ph}>
        h₁ · OR
      </text>
      <text x={h1[0]} y={54} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 9.5)}>
        w [1, 1], b −0.5
      </text>
      <text x={h2[0]} y={372} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600} opacity={ph}>
        h₂ · NAND
      </text>
      <text x={h2[0]} y={398} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO} opacity={prog(t, 7)}>
        w [−1, −1], b 1.5
      </text>
      <text x={out[0]} y={110} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600} opacity={po}>
        출력 · AND
      </text>
      <text x={out[0]} y={135} textAnchor="middle" fill={C.accent} fontSize={20} fontFamily={MONO} opacity={prog(t, 10.2)}>
        w [1, 1], b −1.5
      </text>
      <text x={40} y={398} fill={C.muted} fontSize={20} opacity={prog(t, 11)}>
        hidden layer = h₁, h₂
      </text>
    </svg>
  )
}

function TwoLayer() {
  const t = useSec()
  const pl = plane(110, 340, 220, -0.25, 1.5, -0.2, 1.2)
  const band = pl.clip(pl.clip(pl.rect, 1, 1, 0.5, 1), 1, 1, 1.5, -1)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={980} h={420} at={0.3}>
        <Network t={t} />
      </Card>
      <Card x={1068} y={140} w={788} h={420} at={12.5}>
        <svg width={788} height={420}>
          <text x={30} y={42} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 12.7)}>
            두 직선 사이의 띠
          </text>
          <polygon points={pl.poly(band)} fill={C.accent} opacity={0.16 * prog(t, 15)} />
          <Axes pl={pl} opacity={prog(t, 12.8)} />
          <BLine pl={pl} a={1} b={1} c={0.5} color={C.green} opacity={prog(t, 13.4)} />
          <BLine pl={pl} a={1} b={1} c={1.5} color={C.blue} opacity={prog(t, 14)} />
          {CORNERS.map((p) => (
            <Dot key={p.join()} pl={pl} p={p} one={p[0] + p[1] === 1} opacity={prog(t, 12.9)} />
          ))}
          <g opacity={prog(t, 13.4)}>
            <line x1={470} y1={143} x2={500} y2={143} stroke={C.green} strokeWidth={4} />
            <text x={512} y={150} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
              h₁: x₁ + x₂ = 0.5
            </text>
          </g>
          <g opacity={prog(t, 14)}>
            <line x1={470} y1={188} x2={500} y2={188} stroke={C.blue} strokeWidth={4} />
            <text x={512} y={195} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
              h₂: x₁ + x₂ = 1.5
            </text>
          </g>
          <text x={470} y={250} fill={C.accent} fontSize={22} fontWeight={600} opacity={prog(t, 15.2)}>
            띠 안만 1 → XOR
          </text>
          <text x={470} y={290} fill={C.muted} fontSize={20} opacity={prog(t, 15.8)}>
            (0, 1), (1, 0) 이 띠 안
          </text>
          <text x={470} y={326} fill={C.muted} fontSize={20} opacity={prog(t, 16.4)}>
            [1, 1]: OR 1 · NAND 0 → 0
          </text>
        </svg>
      </Card>
      <Box x={64} y={580} w={900} h={300} at={18.5} title={<Head color={C.red}>hidden layer 의 숫자는 어떻게 찾을까</Head>} gap={10}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 18.8) }}>perceptron 학습 규칙은 그 unit 의 정답 y 를 알아야 쓸 수 있다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.4) }}>truth table 에는 XOR 의 정답만 있고, h₁ 이 OR 를 맡는다는 정답은 없다</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 22.2) }}>출력이 틀린 책임이 어느 unit 의 숫자에 있는지 정하는 문제 → credit assignment</span>
      </Box>
      <Box x={988} y={580} w={868} h={300} at={24.5} title={<Head color={C.green} size={24}>학습한 AND 의 [1, 1] 에서 w₁ 을 0.01 늘리면</Head>} gap={10}>
        <Table
          at={24.7}
          step={0.4}
          head={['w₁', 'z', 'step', 'sigmoid']}
          widths={[140, 160, 140, 180]}
          sans={[]}
          rows={[
            ['0.20', '0.10', '1', '0.5250'],
            ['0.21', '0.11', '1', '0.5275'],
            ['변화', '+0.01', '0', '+0.0025'],
          ]}
          colors={[C.text, C.text, C.green]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 27) }}>step 은 z = 0 을 빼면 derivative 가 0 → 고칠 방향을 알 수 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the robot policy MLP ----------

function RobotMlp({ t }: { t: number }) {
  const inputs: [string, number][] = [
    ['몸통 선속도', 3],
    ['몸통 각속도', 3],
    ['몸통 기준 중력 방향', 3],
    ['따라갈 속도 명령', 3],
    ['관절 각도', 12],
    ['관절 속도', 12],
    ['직전에 낸 action', 12],
  ]
  const layers: [number, number, number, string][] = [
    [410, 128, 340, C.blue],
    [670, 64, 260, C.blue],
    [930, 32, 190, C.blue],
  ]
  const mid = 270
  const col = (x: number, w: number, h: number, color: string, op: number, children: ReactNode) => (
    <div style={{ position: 'absolute', left: x, top: mid - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 16, border: `2px solid ${color}`, background: `${color}14`, display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 4, opacity: op }}>
      {children}
    </div>
  )
  const pin = prog(t, 7.3)
  return (
    <>
      <div style={{ position: 'absolute', left: 30, top: 24, width: 320, opacity: pin }}>
        <Head color={C.orange} size={26}>
          입력 48 개
        </Head>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 80, width: 320, display: 'grid', gap: 8 }}>
        {inputs.map(([s, n], i) => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', opacity: prog(t, 7.6 + i * 0.3) }}>
            <span style={line(C.text, 22)}>{s}</span>
            <span style={mono(C.orange, 22)}>{n}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 6, opacity: prog(t, 10) }}>
          <span style={line(C.muted, 22)}>합</span>
          <span style={mono(C.orange, 22)}>48</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 410, top: 24, width: 720, textAlign: 'center', opacity: prog(t, 13.8) }}>
        <Head color={C.blue} size={26}>
          hidden layer · activation function ELU
        </Head>
      </div>
      {layers.map(([x, n, h, c], i) =>
        col(x, 200, h, c, prog(t, 14 + i * 0.6), (
          <>
            <span style={mono(c, 44)}>{n}</span>
            <span style={line(C.muted, 22)}>unit</span>
          </>
        )),
      )}
      <div style={{ position: 'absolute', left: 1190, top: 24, width: 230, textAlign: 'center', opacity: prog(t, 16) }}>
        <Head color={C.green} size={26}>
          출력 12 개
        </Head>
      </div>
      {col(1190, 230, 140, C.green, prog(t, 16), (
        <>
          <span style={mono(C.green, 44)}>12</span>
          <span style={line(C.muted, 22)}>관절 목표 각도</span>
        </>
      ))}
      <div style={{ position: 'absolute', left: 1480, top: 24, width: 280, opacity: prog(t, 21) }}>
        <Head color={C.purple} size={26}>
          실제 로봇
        </Head>
      </div>
      <div style={{ position: 'absolute', left: 1480, top: 150, width: 270, height: 240, boxSizing: 'border-box', padding: '18px 20px', borderRadius: 16, border: `2px solid ${C.purple}`, background: `${C.purple}14`, display: 'grid', alignContent: 'center', gap: 8, opacity: prog(t, 21) }}>
        <span style={line(C.text, 22)}>motor 안의 PD controller 가 목표 각도를 torque 로 바꾼다</span>
        <span style={line(C.muted, 20)}>(논문 3.2 절)</span>
      </div>
      <svg width={1792} height={470} style={{ position: 'absolute', left: 0, top: 0 }}>
        {arrow(354, mid, 404, mid, C.muted, 3, 11, prog(t, 13.8))}
        {arrow(614, mid, 664, mid, C.muted, 3, 11, prog(t, 14.4))}
        {arrow(874, mid, 924, mid, C.muted, 3, 11, prog(t, 15))}
        {arrow(1134, mid, 1184, mid, C.muted, 3, 11, prog(t, 15.8))}
        {arrow(1424, mid, 1474, mid, C.muted, 3, 11, prog(t, 21))}
      </svg>
    </>
  )
}

function Mlp() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={250} at={0.3} title={<Head color={C.accent}>MLP (multi-layer perceptron)</Head>} gap={10}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 0.8) }}>unit: weighted sum z 를 activation function 에 넣는다 (perceptron 과 같음)</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 3) }}>다른 점: 출력은 0 · 1 이 아닌 실수 · 숫자는 backpropagation 으로 고친다</span>
          <span style={{ ...mono(C.blue, 23), opacity: prog(t, 5) }}>ELU: z {'>'} 0 이면 z, 0 이하면 eᶻ − 1</span>
        </div>
      </Box>
      <Box x={968} y={140} w={888} h={250} at={20.5} title={<Head color={C.purple}>0.02 초마다 한 번 = 1초에 50 번</Head>} gap={10}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 21) }}>0.02 초 = simulation step 0.005 초 × 4</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 22.5) }}>실제 로봇: motor 안의 PD controller 가 목표 각도 → torque</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24) }}>simulation 에서는 actuator network 가 목표 각도 → torque</span>
        </div>
      </Box>
      <Card x={64} y={410} w={1792} h={470} at={7}>
        <div style={{ position: 'absolute', right: 30, bottom: 20, opacity: prog(t, 7.3) }}>
          <Label size={20} color={C.dim}>
            legged_gym · ANYmal C 평지 보행 policy
          </Label>
        </div>
        <RobotMlp t={t} />
      </Card>
    </AbsoluteFill>
  )
}

function Params() {
  const t = useSec()
  const rows: [string, string, number, number][] = [
    ['입력 48 → 128', '48 × 128 + 128', 6272, 0.8],
    ['128 → 64', '128 × 64 + 64', 8256, 7.3],
    ['64 → 32', '64 × 32 + 32', 2080, 7.9],
    ['32 → 출력 12', '32 × 12 + 12', 396, 8.5],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1100} h={440} at={0.3} title={<Head color={C.blue}>층마다 weight 수 + bias 수 (입력 수 × unit 수 + unit 수)</Head>} gap={12}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted, fontSize: 22 }}>
            <span style={{ width: 230 }}>층</span>
            <span style={{ width: 270 }}>weight 수 + bias 수</span>
            <span style={{ width: 150, textAlign: 'right' }}>합</span>
          </div>
          {rows.map(([name, calc, n, at]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', opacity: prog(t, at) }}>
              <span style={{ ...line(C.text, 24), width: 230 }}>{name}</span>
              <span style={{ ...mono(C.text, 24), width: 270 }}>{calc}</span>
              <span style={{ ...mono(C.blue, 24), width: 150, textAlign: 'right' }}>{n.toLocaleString('en-US')}</span>
              <span style={{ marginLeft: 30, display: 'inline-block', width: (330 * n * prog(t, at, 0.9)) / 8256, minWidth: 4, height: 22, borderRadius: 5, background: C.blue }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 8, opacity: prog(t, 10) }}>
            <span style={{ ...line(C.accent, 24), width: 500, fontWeight: 600 }}>전체</span>
            <span style={{ ...mono(C.accent, 26), width: 150, textAlign: 'right' }}>17,004</span>
          </div>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 4) }}>첫 층 = 입력이 48 개인 perceptron 128 개와 같은 계산</span>
      </Box>
      <Box x={1188} y={140} w={668} h={440} at={13.5} title={<Head color={C.green}>legged_gym 논문 (Rudin et al., 2021)</Head>} gap={14}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, opacity: prog(t, 14.5) }}>
          <span style={mono(C.green, 96)}>4 분</span>
          <span style={line(C.text, 26)}>안에 평지 policy 학습</span>
        </div>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 15.5) }}>GPU 하나로 로봇 수천 대를 동시에 simulation</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>학습한 숫자: weight 와 bias 모두 17,004 개</span>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 600, width: 1792 }}>
        <Misconception at={20.6} belief="층만 많이 쌓으면 activation function 없이도 직선 아닌 경계를 만든다" fact="h = 2x + 1, ŷ = 3h − 1 이면 ŷ = 3(2x + 1) − 1 = 6x + 2 · 한 층과 같아 경계는 직선 하나" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'weighted sum 과 직선', color: C.accent, text: 'z = w₁x₁ + w₂x₂ + b 가 0 보다 크면 1 → 직선 하나로 가른다 · b = −문턱', at: 1 },
    { tag: '학습 규칙과 epoch', color: C.orange, text: '틀린 sample 에서만 η × 오차 × 입력 · AND 는 6 epoch 에 2x₁ + x₂ = 2', at: 4.4 },
    { tag: 'XOR 와 두 층', color: C.red, text: 'XOR 를 가르는 직선은 없다 → 1,000 epoch 에 3997 번 틀림 · OR 와 NAND 를 AND 로', at: 8.4 },
    { tag: '로봇 policy 의 MLP', color: C.green, text: '48 → 128 → 64 → 32 → 12 · ELU · 숫자 17,004 개 · 1초에 50 번', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            "둘 다 닿았나" 는 몇 번 만에 배우는데, "한쪽만 닿았나" 는 왜 배우지 못할까?
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
            NEXT · CORE
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Backpropagation</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            chain rule 로 hidden layer 의 derivative 까지 구하는 계산을 한 단계씩
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/perceptron (Rosenblatt 1958 · Novikoff 1962 · Rudin et al. 2021)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseBoundary = () => (
  <PauseWrite
    question="w = [1, 1], b = −0.5 인 perceptron 의 decision boundary 는 어떤 직선이고, 네 점 중 1 쪽에 있는 점은?"
    answer={
      <>
        z = x₁ + x₂ − 0.5 = 0 → x₁ + x₂ = 0.5
        <br />z 는 −0.5, 0.5, 0.5, 1.5 → 1 쪽은 (0, 1), (1, 0), (1, 1) · 원점만 0 쪽이라 OR
      </>
    }
  />
)

const PauseUpdate = () => (
  <PauseWrite
    question="w = [0.2, 0.1], b = 0, η = 0.1 에서 AND 의 입력 [0, 1] 을 봤다. 예측과 고친 뒤의 w, b 는? 고친 뒤 같은 입력의 z 는?"
    answer={
      <>
        z = 0.2 × 0 + 0.1 × 1 + 0 = 0.1 → ŷ = 1, 정답 0 · 오차 0 − 1 = −1
        <br />w = [0.2, 0.1 − 0.1] = [0.2, 0], b = 0 − 0.1 = −0.1 → 새 z = −0.1 → 0 (맞힘)
      </>
    }
  />
)

const PauseXor = () => (
  <PauseWrite
    question="두 층 XOR network (h₁ = OR, h₂ = NAND, 출력 = AND) 에 입력 [0, 0] 을 넣으면 h₁, h₂, 출력의 z 는?"
    answer={
      <>
        h₁: 0 + 0 − 0.5 = −0.5 → 0 · h₂: 0 − 0 + 1.5 = 1.5 → 1
        <br />
        출력: 0 + 1 − 1.5 = −0.5 → ŷ = 0 (XOR 의 정답 0)
      </>
    }
  />
)

const PauseParams = () => (
  <PauseWrite
    question="입력 6 개를 받는 unit 32 개짜리 층의 weight 와 bias 는 모두 몇 개인가?"
    answer={
      <>
        weight 6 × 32 = 192 개 · bias 는 unit 수와 같은 32 개
        <br />
        192 + 32 = 224 개 · 입력이 6 개인 perceptron 32 개의 숫자
      </>
    }
  />
)

export function Perceptron() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'weighted-sum': WeightedSum,
        boundary: Boundary,
        'pause-boundary': PauseBoundary,
        rule: Rule,
        epochs: Epochs,
        'pause-update': PauseUpdate,
        xor: Xor,
        'two-layer': TwoLayer,
        'pause-xor': PauseXor,
        mlp: Mlp,
        params: Params,
        'pause-params': PauseParams,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
