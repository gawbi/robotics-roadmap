import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './derivatives.narration.json'
import { script } from './derivatives.script'

// Numbers follow lessons/derivatives/README.md (see derivatives.script.ts). The encoder traces are computed from the lesson's
// own setup (10 °/s, 4096 칸, 10 Hz / 1 kHz); the gyro noise trace is one random draw with the lesson's 0.5 °/s noise (marked
// as such); the gear and arm drawings are schematic. Every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28, mono: m = false }: { children: ReactNode; color?: string; size?: number; mono?: boolean }) {
  return (
    <Label color={color} size={size} weight={600} mono={m}>
      {children}
    </Label>
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

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontSize: 23, fontWeight: 600, color, marginLeft: 8, opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
    </div>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, unit = '', fmt, labelW = 120 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, fontFamily: MONO, textAlign: 'right', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
    </div>
  )
}

/** a 2-row matrix drawn with bracket sides */
function Matrix({ rows, color = C.text, size = 26, cellW = 100 }: { rows: string[][]; color?: string; size?: number; cellW?: number }) {
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${rows[0].length}, ${cellW}px)`, rowGap: 6, padding: '6px 12px', borderLeft: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderRadius: 10 }}>
      {rows.flat().map((v, i) => (
        <span key={i} style={{ fontFamily: MONO, fontSize: size, color, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.45 }}>
          {v}
        </span>
      ))}
    </div>
  )
}

interface GridRow {
  cells: ReactNode[]
  /** one time for the whole row, or one per cell */
  at: number | number[]
  color?: string
}

/** a small table; columns in `monoCols` use the mono font, the first column is left-aligned */
function Grid({ head, rows, widths, at, size = 24, monoCols = [], headSize = 21 }: { head: string[]; rows: GridRow[]; widths: number[]; at: number; size?: number; monoCols?: number[]; headSize?: number }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({
    width: widths[i],
    fontFamily: monoCols.includes(i) ? MONO : undefined,
    fontSize: size,
    whiteSpace: 'nowrap',
    textAlign: i === 0 ? 'left' : 'right',
    paddingRight: i === 0 ? 0 : 10,
    lineHeight: 1.45,
  })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: headSize }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', color: r.color ?? C.text }}>
          {r.cells.map((v, i) => (
            <span key={i} style={{ ...cell(i), opacity: prog(t, Array.isArray(r.at) ? r.at[i] : r.at) }}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.45 })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, opacity = 1) {
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

// ---------- the encoder, as the lesson sets it up ----------

/** one tick of the Dynamixel XM430: 360 ÷ 4096 ≈ 0.088° */
const TICK = 360 / 4096
/** what the encoder reports for a true angle: the tick below it */
const reading = (deg: number) => Math.floor(deg / TICK + 1e-9) * TICK
/** speeds (°/s) computed from readings `hz` times a second while the joint turns at 10 °/s */
const speeds = (hz: number, n: number) => Array.from({ length: n }, (_, i) => (reading((10 * (i + 1)) / hz) - reading((10 * i) / hz)) * hz)

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            MATH · DERIVATIVES
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 104, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Derivatives & Gradients</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            변화율을 <span style={{ color: C.accent }}>숫자로</span> 다루는 법
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            encoder 각도에서 속도를 구하는 계산부터, 손끝을 움직이는 Jacobian 까지
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

/** speeds computed at one rate, on a 0 ~ 87.9 °/s scale, 860 × 340 */
function SpeedChart({ t, at, title, result, values, color, stems }: { t: number; at: number; title: string; result: string; values: number[]; color: string; stems: boolean }) {
  const x0 = 90
  const x1 = 830
  const yZero = 290
  const yTop = 80
  const Y = (v: number) => yZero - (v / 87.9) * (yZero - yTop)
  const dx = (x1 - x0) / values.length
  const shown = Math.floor(values.length * prog(t, at + 0.3, 1.6))
  return (
    <svg width={860} height={340}>
      <g opacity={prog(t, at)}>
        <text x={x0} y={30} fill={C.text} fontSize={24} fontWeight={600}>
          {title}
        </text>
        <line x1={x0} y1={yZero} x2={x1} y2={yZero} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={yTop - 10} x2={x0} y2={yZero} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={yTop} x2={x1} y2={yTop} stroke={C.grid} strokeWidth={2} />
        <text x={x0 - 10} y={yZero + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        <text x={x0 - 10} y={yTop + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          87.9
        </text>
        <line x1={x0} y1={Y(10)} x2={x1} y2={Y(10)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
        <line x1={x0} y1={326} x2={x0 + 40} y2={326} stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
        <text x={x0 + 52} y={332} fill={C.muted} fontSize={20}>
          실제 속도 10 °/s
        </text>
      </g>
      {stems ? (
        values.slice(0, shown).map((v, i) => {
          const x = x0 + (i + 0.5) * dx
          return v > 1 ? <line key={i} x1={x} y1={yZero} x2={x} y2={Y(v)} stroke={color} strokeWidth={3} /> : <circle key={i} cx={x} cy={yZero} r={2.2} fill={color} />
        })
      ) : (
        <g>
          <polyline points={values.slice(0, shown).map((v, i) => `${x0 + (i + 0.5) * dx},${Y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth={3} />
          {values.slice(0, shown).map((v, i) => (
            <circle key={i} cx={x0 + (i + 0.5) * dx} cy={Y(v)} r={6} fill={color} />
          ))}
        </g>
      )}
      <text x={x1} y={30} textAnchor="end" fill={color} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 1.9)}>
        {result}
      </text>
    </svg>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={430}>
        <div style={{ position: 'absolute', left: 30, top: 20, opacity: prog(t, 0.3) }}>
          <Label size={24} color={C.muted}>
            10 °/s 로 천천히 도는 관절 · 한 칸 0.088° 인 encoder 로 읽은 각도에서 계산한 속도
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 10, top: 74 }}>
          <SpeedChart t={t} at={0.6} title="1초에 10 번 계산 (10 Hz)" result="9.7 또는 10.5 °/s" values={speeds(10, 10)} color={C.green} stems={false} />
        </div>
        <div style={{ position: 'absolute', left: 910, top: 74 }}>
          <SpeedChart t={t} at={2} title="1초에 1000 번 계산 (1 kHz)" result="0 또는 87.9 °/s" values={speeds(1000, 100)} color={C.red} stems />
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 600, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          더 자주 쟀는데, <span style={{ color: C.accent }}>속도는 왜 더 엉터리가 될까?</span>
        </div>
      </Appear>
      <Card x={210} y={706} w={1500} h={170} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 10, opacity: prog(t, 5.8) }}>
          <span style={line(C.text, 26)}>
            <b style={{ color: C.accent }}>derivative (미분)</b>: 어떤 값을 조금 바꿨을 때 다른 값이 얼마나 빨리 변하는지 나타내는 비율. 속도는 각도의 derivative 다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. derivative 와 차분 ----------

const T_ROWS = ['0.10', '0.11', '0.12', '0.13', '0.14', '0.15']
const TH_ROWS = ['5.00', '6.05', '7.20', '8.45', '9.80', '11.25']
const V_ROWS = ['', '105', '115', '125', '135', '145']
const A_ROWS = ['', '', '1000', '1000', '1000', '1000']

function Difference() {
  const t = useSec()
  const vAt = [99, 7.4, 9.8, 11, 11.3, 11.6]
  const aAt = [99, 99, 14.5, 16.2, 16.5, 16.8]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 18 }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head>0.01 초 간격으로 읽은 관절 각도</Head>
          </div>
          <Grid
            at={0.5}
            size={28}
            headSize={23}
            widths={[170, 170, 230, 250]}
            monoCols={[0, 1, 2, 3]}
            head={['시간 t (초)', '각도 θ (°)', '속도 (°/s)', '가속도 (°/s²)']}
            rows={T_ROWS.map((tt, k) => ({
              cells: [tt, TH_ROWS[k], <span style={{ color: C.green }}>{V_ROWS[k]}</span>, <span style={{ color: C.orange }}>{A_ROWS[k]}</span>],
              at: [0.8 + k * 0.25, 0.8 + k * 0.25, vAt[k], aAt[k]],
            }))}
          />
          <div style={{ marginTop: 10 }}>
            <Flow steps={['각도 θ', '속도', '가속도']} color={C.blue} at={14} last="한 단계마다 차이 ÷ Δt" />
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 1.4) }}>
            표의 각도는 θ = 500t² 를 따른다: 가속도 1000 °/s² 로 일정하게 빨라지는 관절이고, 각도는 정확히 잰다고 가정한다
          </span>
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={300} at={0.5} title={<Head>속도 = 변한 각도 ÷ 걸린 시간</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 1) }}>Δ (delta) 는 변한 양 · Δt = 0.01 초는 두 측정 사이의 시간</span>
        <span style={{ ...mono(C.green, 28), opacity: prog(t, 7) }}>(6.05 − 5.00) ÷ 0.01 = 105 °/s</span>
        <span style={{ ...mono(C.green, 28), opacity: prog(t, 9.5) }}>(7.20 − 6.05) ÷ 0.01 = 115 °/s</span>
      </Box>
      <Box x={996} y={460} w={860} h={200} at={13} title={<Head color={C.orange}>가속도: 속도에 같은 계산을 한 번 더</Head>}>
        <span style={{ ...mono(C.orange, 28), opacity: prog(t, 13.8) }}>(115 − 105) ÷ 0.01 = 1000 °/s²</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>표의 가속도는 모두 1000 °/s² 로 일정하다</span>
      </Box>
      <Box x={996} y={680} w={860} h={200} at={19.5} color={`${C.accent}88`} title={<Head color={C.accent}>finite difference (유한 차분)</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 19.8) }}>일정한 간격의 측정값끼리 뺀 차이를 간격으로 나누는 계산</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 22.5) }}>105 °/s 는 두 측정 사이의 평균 속도</span>
      </Box>
    </AbsoluteFill>
  )
}

/** θ = 500t² from 0.10 s to 0.16 s, with the lines from t = 0.12 to h seconds later */
function SecantPlot({ t }: { t: number }) {
  const X = (s: number) => 110 + (s - 0.1) * 12500
  const Y = (th: number) => 650 - (th - 4) * 54
  const curve = Array.from({ length: 61 }, (_, i) => {
    const s = 0.1 + i * 0.001
    return `${X(s)},${Y(500 * s * s)}`
  }).join(' ')
  const lineThrough = (slope: number) => {
    const a = 0.1
    const b = 0.16
    return { x1: X(a), y1: Y(7.2 + slope * (a - 0.12)), x2: X(b), y2: Y(7.2 + slope * (b - 0.12)) }
  }
  const secants: [number, number, string, number][] = [
    [0.03, 135, C.red, 1.2],
    [0.02, 130, C.orange, 8.3],
    [0.01, 125, C.purple, 9.8],
  ]
  return (
    <svg width={900} height={740}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
          θ = 500t² 위의 점 (0.12 초, 7.20°) 과 h 초 뒤의 점
        </text>
        <text x={120} y={100} fill={C.muted} fontSize={20}>
          θ (°)
        </text>
        <line x1={110} y1={650} x2={860} y2={650} stroke={C.dim} strokeWidth={2} />
        <line x1={110} y1={120} x2={110} y2={650} stroke={C.dim} strokeWidth={2} />
        {T_ROWS.map((s) => (
          <g key={s}>
            <line x1={X(Number(s))} y1={650} x2={X(Number(s))} y2={658} stroke={C.dim} strokeWidth={2} />
            <text x={X(Number(s))} y={684} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          </g>
        ))}
        {[5, 7.2, 11.25].map((th) => (
          <g key={th}>
            <line x1={110} y1={Y(th)} x2={860} y2={Y(th)} stroke={C.grid} strokeWidth={1.5} />
            <text x={100} y={Y(th) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {th === 5 ? '5.00' : th === 7.2 ? '7.20' : '11.25'}
            </text>
          </g>
        ))}
        <text x={860} y={718} textAnchor="end" fill={C.muted} fontSize={20}>
          t (초)
        </text>
        <polyline points={curve} fill="none" stroke={C.blue} strokeWidth={4} />
      </g>
      {secants.map(([h, slope, color, at]) => {
        const l = lineThrough(slope)
        return (
          <g key={h} opacity={prog(t, at)}>
            <line {...l} stroke={color} strokeWidth={2.5} />
            <circle cx={X(0.12 + h)} cy={Y(500 * (0.12 + h) ** 2)} r={8} fill={color} />
          </g>
        )
      })}
      <g opacity={prog(t, 13.5)}>
        <line {...lineThrough(120)} stroke={C.accent} strokeWidth={4} />
      </g>
      <g opacity={prog(t, 0.6)}>
        <circle cx={X(0.12)} cy={Y(7.2)} r={9} fill={C.text} />
        <text x={X(0.12) + 20} y={Y(7.2) + 44} fill={C.text} fontSize={20} fontFamily={MONO}>
          0.12 초 · 7.20°
        </text>
      </g>
    </svg>
  )
}

function SlopeRow({ color, h, v, at, t }: { color: string; h: string; v: string; at: number; t: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at) }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: color }} />
      <span style={{ ...mono(C.text, 28), width: 260 }}>{h}</span>
      <span style={mono(color, 28)}>{v}</span>
    </div>
  )
}

function Tangent() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <SecantPlot t={t} />
      </Panel>
      <Box x={996} y={140} w={860} h={360} at={0.5} title={<Head size={26}>직선의 기울기 = 그 구간의 평균 속도</Head>}>
        <span style={{ ...mono(C.muted, 22), opacity: prog(t, 1.4) }}>(11.25 − 7.20) ÷ 0.03 = 135</span>
        <SlopeRow t={t} at={6.8} color={C.red} h="h = 0.03 초" v="135 °/s" />
        <SlopeRow t={t} at={8.3} color={C.orange} h="h = 0.02 초" v="130 °/s" />
        <SlopeRow t={t} at={9.8} color={C.purple} h="h = 0.01 초" v="125 °/s" />
        <SlopeRow t={t} at={11.5} color={C.accent} h="h → 0" v="120 °/s" />
      </Box>
      <Box x={996} y={520} w={860} h={360} at={13} color={`${C.accent}88`} title={<Head size={26} color={C.accent}>derivative: 접선의 기울기</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 13.3) }}>간격을 0 에 한없이 가깝게 줄일 때 비율이 다가가는 값</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 15.5) }}>dθ/dt (디 세타 디 티) = 120 °/s (0.12 초)</span>
        <Flow steps={['위치', '속도', '가속도', 'jerk']} color={C.orange} at={19.6} gap={0.7} />
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 25) }}>jerk = 1000 ÷ 0.01 = 100,000 °/s³</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.5) }}>가속도가 0.01 초 만에 0 → 1000 °/s² 로 뛸 때</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 2. noise 와 drift ----------

/** 60 readings at 1 kHz: true angle vs encoder value, and the speed computed from them */
function EncoderPlot({ t }: { t: number }) {
  const n = 60
  const x0 = 100
  const x1 = 820
  const dx = (x1 - x0) / n
  // top: angle, 0 ~ 0.6°
  const yA0 = 330
  const A = (deg: number) => yA0 - deg * (220 / 0.6)
  const stairs: string[] = []
  for (let k = 0; k <= n; k++) {
    const r = reading(0.01 * k)
    if (k > 0) stairs.push(`${x0 + k * dx},${A(reading(0.01 * (k - 1)))}`)
    stairs.push(`${x0 + k * dx},${A(r)}`)
  }
  const pa = prog(t, 0.8, 2.5)
  // bottom: speed, 0 ~ 87.9 °/s
  const yV0 = 690
  const V = (v: number) => yV0 - (v / 87.9) * 210
  const v = speeds(1000, n)
  const shown = Math.floor(n * prog(t, 7, 5))
  const avg = Array.from({ length: n + 1 }, (_, k) => (k >= 20 ? (reading(0.01 * k) - reading(0.01 * (k - 20))) / 0.02 : null))
  const avgPts = avg.flatMap((a, k) => (a === null ? [] : [`${x0 + k * dx},${V(a)}`]))
  return (
    <svg width={900} height={740}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
          1 kHz 로 읽은 각도 · 실제로는 10 °/s 로 돈다
        </text>
        <line x1={x0} y1={76} x2={x0 + 36} y2={76} stroke={C.blue} strokeWidth={3} />
        <text x={x0 + 46} y={83} fill={C.blue} fontSize={20}>
          실제 각도
        </text>
        <line x1={x0 + 190} y1={76} x2={x0 + 226} y2={76} stroke={C.orange} strokeWidth={4} />
        <text x={x0 + 236} y={83} fill={C.orange} fontSize={20}>
          encoder 값 (한 칸씩)
        </text>
        <line x1={x0} y1={yA0} x2={x1} y2={yA0} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={110} x2={x0} y2={yA0} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={A(TICK)} x2={x1} y2={A(TICK)} stroke={C.grid} strokeWidth={1.5} />
        <text x={x0 - 10} y={yA0 + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        <text x={x0 - 10} y={A(TICK) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0.088
        </text>
        <text x={x1} y={362} textAnchor="end" fill={C.muted} fontSize={20}>
          0.001 초마다 한 번 읽음
        </text>
      </g>
      <g opacity={pa > 0 ? 1 : 0}>
        <line x1={x0} y1={A(0)} x2={x0 + (x1 - x0) * pa} y2={A(0.6 * pa)} stroke={C.blue} strokeWidth={3} />
        <polyline points={stairs.slice(0, Math.max(1, Math.round(stairs.length * pa))).join(' ')} fill="none" stroke={C.orange} strokeWidth={4} />
      </g>
      <g opacity={prog(t, 6.8)}>
        <text x={30} y={412} fill={C.text} fontSize={24} fontWeight={600}>
          각도 차이 ÷ 0.001 초 = 계산한 속도 (°/s)
        </text>
        <line x1={x0} y1={446} x2={x0 + 36} y2={446} stroke={C.red} strokeWidth={4} />
        <text x={x0 + 46} y={453} fill={C.red} fontSize={20}>
          1 kHz 로 바로 계산
        </text>
        <line x1={x0 + 250} y1={446} x2={x0 + 286} y2={446} stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
        <text x={x0 + 296} y={453} fill={C.muted} fontSize={20}>
          실제 10 °/s
        </text>
        <line x1={x0} y1={yV0} x2={x1} y2={yV0} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={470} x2={x0} y2={yV0} stroke={C.dim} strokeWidth={2} />
        <line x1={x0} y1={V(87.9)} x2={x1} y2={V(87.9)} stroke={C.grid} strokeWidth={1.5} />
        <line x1={x0} y1={V(10)} x2={x1} y2={V(10)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
        <text x={x0 - 10} y={yV0 + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        <text x={x0 - 10} y={V(87.9) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          87.9
        </text>
        <text x={x1} y={726} textAnchor="end" fill={C.muted} fontSize={20}>
          0.001 초마다 한 번 계산
        </text>
      </g>
      {v.slice(0, shown).map((s, i) => {
        const x = x0 + (i + 1) * dx
        return s > 1 ? <line key={i} x1={x} y1={yV0} x2={x} y2={V(s)} stroke={C.red} strokeWidth={4} /> : <circle key={i} cx={x} cy={yV0} r={2.5} fill={C.red} />
      })}
      <g opacity={prog(t, 25.5)}>
        <line x1={x0 + 450} y1={446} x2={x0 + 486} y2={446} stroke={C.green} strokeWidth={4} />
        <text x={x0 + 496} y={453} fill={C.green} fontSize={20}>
          최근 20 개 평균
        </text>
        <polyline points={avgPts.join(' ')} fill="none" stroke={C.green} strokeWidth={4} />
      </g>
    </svg>
  )
}

function Encoder() {
  const t = useSec()
  const hz = (k: number) => [19.8, 20.6, 21.4][k]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <EncoderPlot t={t} />
      </Panel>
      <Box x={996} y={140} w={860} h={190} at={0.3} title={<Head>Dynamixel XM430 · 한 바퀴 4096 칸</Head>}>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 0.9) }}>360 ÷ 4096 ≈ 0.088° (한 칸)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.5) }}>칸 사이에서는 아래 칸 값을 내다가 다음 칸을 넘는 순간 한 번에 올린다</span>
      </Box>
      <Box x={996} y={346} w={860} h={150} at={13} color={`${C.red}88`} title={<Head color={C.red}>속도 = 각도 차이 ÷ Δt</Head>}>
        <span style={{ ...mono(C.red, 26), opacity: prog(t, 13.5) }}>0.088 ÷ 0.001 ≈ 88 °/s (칸이 바뀔 때만)</span>
      </Box>
      <Box x={996} y={512} w={860} h={368} at={19.5} title={<Head size={26}>한 칸이 만드는 속도 오차 = 0.088 ÷ Δt</Head>}>
        <Grid
          at={19.7}
          size={24}
          widths={[160, 140, 270, 170]}
          monoCols={[0, 1, 2, 3]}
          head={['계산 주기', 'Δt (초)', '계산한 속도 (°/s)', '한 칸 오차']}
          rows={[
            { cells: ['10 Hz', '0.1', '9.7 또는 10.5', '0.88'], at: hz(0) },
            { cells: ['100 Hz', '0.01', '8.8 또는 17.6', '8.8'], at: hz(1) },
            { cells: ['1 kHz', '0.001', '0 또는 87.9', '87.9'], at: hz(2), color: C.red },
          ]}
        />
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 25.8) }}>최근 20 개 평균: 8.8 ~ 13.2 °/s · 약 0.01 초 늦음</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.5) }}>low-pass filter: noise 를 많이 줄일수록 더 늦게 반응한다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** a stationary gyro read 100 times a second: the angle its 0.1 °/s bias and one draw of 0.5 °/s noise add up to */
function gyroNoise(): number[] {
  let s = 3
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0
    let x = Math.imul(s ^ (s >>> 15), 1 | s)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
  const out: number[] = [0]
  let w = 0
  for (let i = 1; i <= 6000; i++) {
    w += 0.5 * 0.01 * Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand())
    if (i % 20 === 0) out.push(w)
  }
  return out
}
const NOISE = gyroNoise()

function DriftPlot({ t }: { t: number }) {
  const X = (s: number) => 100 + s * (740 / 60)
  const Y = (deg: number) => 430 - deg * (320 / 6)
  const pb = prog(t, 6.5, 4)
  const pn = prog(t, 12.4, 4)
  const noisePts = NOISE.slice(0, Math.max(1, Math.round(NOISE.length * pn))).map((w, i) => `${X(i * 0.2)},${Y(w)}`)
  return (
    <svg width={900} height={500}>
      <g opacity={prog(t, 6)}>
        <text x={30} y={30} fill={C.text} fontSize={22} fontWeight={600}>
          멈춰 있는 gyro 값을 1초에 100 번 더한 방향 오차
        </text>
        <line x1={100} y1={430} x2={840} y2={430} stroke={C.dim} strokeWidth={2} />
        <line x1={100} y1={90} x2={100} y2={430} stroke={C.dim} strokeWidth={2} />
        <line x1={100} y1={Y(6)} x2={840} y2={Y(6)} stroke={C.grid} strokeWidth={1.5} />
        <text x={90} y={437} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        <text x={90} y={Y(6) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          6°
        </text>
        {[0, 10, 60].map((s) => (
          <text key={s} x={X(s)} y={462} textAnchor={s === 60 ? 'end' : 'middle'} fill={C.muted} fontSize={20} fontFamily={MONO}>
            {s === 0 ? '0' : `${s} 초`}
          </text>
        ))}
      </g>
      <g opacity={pb > 0 ? 1 : 0}>
        <line x1={X(0)} y1={Y(0)} x2={X(60 * pb)} y2={Y(6 * pb)} stroke={C.orange} strokeWidth={4} />
        <text x={820} y={96} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 9.5)}>
          bias 0.1 °/s → 60 초에 6°
        </text>
      </g>
      <g opacity={pn > 0 ? 1 : 0}>
        <polyline points={noisePts.join(' ')} fill="none" stroke={C.purple} strokeWidth={3} />
        <text x={840} y={380} textAnchor="end" fill={C.purple} fontSize={22} fontWeight={600} opacity={prog(t, 14.5)}>
          noise 0.5 °/s → 보통 0.39°
        </text>
        <text x={840} y={494} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 14.5)}>
          noise 선은 무작위로 만든 한 예
        </text>
      </g>
    </svg>
  )
}

function Drift() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 10 }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head>적분: 속도 × Δt 를 차례로 더한다</Head>
          </div>
          <span style={{ ...mono(C.green, 26), opacity: prog(t, 0.8) }}>5.00 + 105 × 0.01 = 6.05°</span>
          <span style={{ ...mono(C.green, 26), opacity: prog(t, 2.2) }}>6.05 + 115 × 0.01 = 7.20°</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.6) }}>앞의 표의 각도가 그대로 돌아온다 · 그래프에서는 속도 곡선 아래의 넓이</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 230 }}>
          <DriftPlot t={t} />
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={6} title={<Head size={26}>멈춘 gyro 에 쌓이는 방향 오차</Head>}>
        <Grid
          at={6.2}
          size={24}
          widths={[130, 330, 280]}
          monoCols={[0, 1, 2]}
          head={['시간', 'bias 0.1 °/s', 'noise 0.5 °/s']}
          rows={[
            { cells: ['10 초', '0.1 × 10 = 1°', '0.16°'], at: [6.5, 6.5, 12.6] },
            { cells: ['60 초', '0.1 × 60 = 6°', '0.39°'], at: [7.2, 7.2, 13.2] },
            { cells: ['600 초', '0.1 × 600 = 60°', '1.2°'], at: [18.3, 18.3, 19.3] },
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.5) }}>noise 는 더할 때마다 방향이 달라 서로 상쇄된다 · n 번 더해도 약 √n 배</span>
      </Box>
      <Box x={996} y={490} w={860} h={390} at={18} color={`${C.accent}88`} title={<Head size={26} color={C.accent}>drift: 적분한 값이 실제에서 멀어지는 현상</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20) }}>encoder 영점이 3° 어긋나도 미분한 속도는 맞지만, 속도의 bias 0.1 °/s 는 적분하면 1 분에 6° 가 된다</span>
        <Grid
          at={23.2}
          size={24}
          widths={[110, 320, 310]}
          head={['계산', 'noise', '일정한 bias']}
          rows={[
            { cells: ['미분', 'Δt 로 나눠 커진다', '변화가 없어 사라진다'], at: 23.6 },
            { cells: ['적분', '상쇄되어 천천히 커진다', '시간에 비례해 쌓인다'], at: 24.6 },
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. 미분 규칙과 gradient ----------

function GearDrawing({ t }: { t: number }) {
  const j = { x: 400, y: 560 }
  const hand = { x: 550, y: 300 }
  return (
    <svg width={900} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g opacity={prog(t, 6.6)}>
        <circle cx={140} cy={560} r={46} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={3} />
        <circle cx={140} cy={560} r={8} fill={C.blue} />
        <rect x={220} y={530} width={110} height={60} rx={10} fill={C.card} stroke={C.orange} strokeWidth={3} />
        <text x={275} y={568} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          100:1
        </text>
        <line x1={186} y1={560} x2={220} y2={560} stroke={C.muted} strokeWidth={4} />
        <line x1={330} y1={560} x2={j.x - 16} y2={560} stroke={C.muted} strokeWidth={4} />
        <text x={140} y={640} textAnchor="middle" fill={C.blue} fontSize={22}>
          motor φ
        </text>
        <text x={275} y={640} textAnchor="middle" fill={C.orange} fontSize={22}>
          gear
        </text>
        <text x={j.x} y={640} textAnchor="middle" fill={C.text} fontSize={22}>
          관절 θ
        </text>
        <line x1={j.x} y1={j.y} x2={660} y2={j.y} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={j.x} y1={j.y} x2={hand.x} y2={hand.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        <circle cx={j.x} cy={j.y} r={16} fill={C.card} stroke={C.text} strokeWidth={3} />
        <circle cx={hand.x} cy={hand.y} r={9} fill={C.green} />
        <path d={`M ${j.x + 70} ${j.y} A 70 70 0 0 0 ${j.x + 35} ${j.y - 60.6}`} fill="none" stroke={C.accent} strokeWidth={3} />
        <text x={j.x + 90} y={j.y - 16} fill={C.accent} fontSize={22} fontFamily={MONO}>
          θ = 60°
        </text>
        <text x={448} y={378} textAnchor="end" fill={C.text} fontSize={22}>
          link 0.5 m
        </text>
        {arrow(640, j.y - 6, 640, hand.y + 4, C.green, 3, 12)}
        {arrow(640, hand.y + 6, 640, j.y - 4, C.green, 3, 12)}
        <line x1={hand.x + 12} y1={hand.y} x2={660} y2={hand.y} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
        <text x={660} y={420} fill={C.green} fontSize={22}>
          손끝 높이
        </text>
        <text x={660} y={452} fill={C.green} fontSize={22} fontFamily={MONO}>
          y = 0.5 sin θ
        </text>
      </g>
    </svg>
  )
}

function Chain() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 14 }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head>chain rule: 단계마다의 변화율을 곱한다</Head>
          </div>
          <span style={{ ...mono(C.accent, 30), opacity: prog(t, 1) }}>dy/dφ = dy/dθ × dθ/dφ</span>
        </div>
        <GearDrawing t={t} />
        <div style={{ position: 'absolute', left: 30, top: 690, opacity: prog(t, 7) }}>
          <Label size={20} color={C.dim}>
            모식도 · motor 가 gear 를 지나 관절을 돌리고, 관절에 달린 link 가 수평에서 θ 만큼 들려 있다
          </Label>
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={200} at={6.5} title={<Head>단계마다의 변화율</Head>}>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 7) }}>gear 100:1 → dθ/dφ = 0.01</span>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 13.8) }}>θ = 60° → dy/dθ = 0.5 × cos 60° = 0.25 m/rad</span>
      </Box>
      <Box x={996} y={356} w={860} h={160} at={16} color={`${C.accent}88`} title={<Head color={C.accent}>곱하면 (motor 1 rad 당)</Head>}>
        <span style={{ ...mono(C.accent, 30), opacity: prog(t, 16.4) }}>0.25 × 0.01 = 0.0025 m</span>
      </Box>
      <Box x={996} y={532} w={860} h={348} at={20.5} gap={12} title={<Head>속도에도 같은 곱</Head>}>
        <span style={{ ...mono(C.blue, 24), opacity: prog(t, 20.8) }}>motor 3000 rpm ≈ 3000 × 2π ÷ 60 ≈ 314 rad/s</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 22) }}>관절 314 × 0.01 = 3.14 rad/s (180 °/s)</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 23.5) }}>손끝 높이 0.25 × 3.14 ≈ 0.79 m/s</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>link 가 수평 (θ = 0°) 이면 1.57 m/s · 똑바로 서면 높이는 그대로</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.2) }}>neural network 의 backpropagation 도 층마다의 변화율을 곱한다</span>
      </Box>
    </AbsoluteFill>
  )
}

function ArmGradient({ t }: { t: number }) {
  const P = (x: number, y: number) => ({ x: 150 + 820 * x, y: 650 - 820 * y })
  const o = P(0, 0)
  const e = P(0.5, 0)
  const h = P(0.5, 0.5)
  const cup = P(0.4, 0.6)
  const e2 = P(0.5 * Math.cos(0.1), 0.5 * Math.sin(0.1))
  const h2 = P(0.4227, 0.5443)
  const pNew = prog(t, 20)
  return (
    <svg width={900} height={740}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
          2 관절 팔 · link 0.5 m 두 개 · 자세 (0°, 90°)
        </text>
        <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        <line x1={e.x} y1={e.y} x2={h.x} y2={h.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        <circle cx={o.x} cy={o.y} r={15} fill={C.card} stroke={C.text} strokeWidth={3} />
        <circle cx={e.x} cy={e.y} r={13} fill={C.card} stroke={C.text} strokeWidth={3} />
        <circle cx={h.x} cy={h.y} r={9} fill={C.blue} />
        <text x={o.x} y={692} textAnchor="middle" fill={C.muted} fontSize={22}>
          어깨 · θ₁
        </text>
        <text x={e.x} y={692} textAnchor="middle" fill={C.muted} fontSize={22}>
          팔꿈치 · θ₂
        </text>
        <text x={h.x + 24} y={h.y + 10} fill={C.blue} fontSize={22} fontFamily={MONO}>
          손끝 (0.5, 0.5)
        </text>
        <rect x={cup.x - 14} y={cup.y - 16} width={28} height={32} rx={5} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={3} />
        <text x={cup.x - 28} y={cup.y - 6} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO}>
          컵 (0.4, 0.6)
        </text>
        <line x1={h.x} y1={h.y} x2={cup.x} y2={cup.y} stroke={C.orange} strokeWidth={2.5} strokeDasharray="7 6" />
        <text x={540} y={182} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.141 m
        </text>
      </g>
      <g opacity={pNew}>
        <line x1={o.x} y1={o.y} x2={e2.x} y2={e2.y} stroke={C.green} strokeWidth={5} strokeDasharray="12 8" strokeLinecap="round" />
        <line x1={e2.x} y1={e2.y} x2={h2.x} y2={h2.y} stroke={C.green} strokeWidth={5} strokeDasharray="12 8" strokeLinecap="round" />
        <circle cx={h2.x} cy={h2.y} r={8} fill={C.green} />
        <line x1={h2.x} y1={h2.y} x2={cup.x} y2={cup.y} stroke={C.green} strokeWidth={2.5} />
        <text x={466} y={208} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.060 m
        </text>
        <text x={30} y={728} fill={C.green} fontSize={21}>
          점선: α = 0.5 로 옮긴 자세 (0.1, 1.621) rad · 손끝 (0.423, 0.544)
        </text>
      </g>
    </svg>
  )
}

function Gradient() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <ArmGradient t={t} />
      </Panel>
      <Box x={996} y={140} w={860} h={140} at={0.5} title={<Head size={26} mono>D = (x − 0.4)² + (y − 0.6)²</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 1.2) }}>지금 0.1² + 0.1² = 0.02 · 거리 √0.02 ≈ 0.141 m</span>
      </Box>
      <Box x={996} y={296} w={860} h={296} at={6.5} title={<Head size={26}>하나만 0.01 rad 바꾸고, 다른 하나는 그대로</Head>}>
        <Grid
          at={6.8}
          size={26}
          widths={[180, 190, 180, 180]}
          monoCols={[0, 1, 2, 3]}
          head={['바꾼 각도', '바뀐 D', '변화 ÷ 0.01', '더 작게']}
          rows={[
            { cells: ['θ₁ 만', '0.01805', '−0.195', '→ −0.2'], at: [7.2, 7.8, 9, 10.5] },
            { cells: ['θ₂ 만', '0.01903', '−0.097', '→ −0.1'], at: [11.5, 11.8, 12.1, 12.4] },
          ]}
        />
        <span style={{ ...mono(C.red, 26), opacity: prog(t, 15.5) }}>∇D = (−0.2, −0.1) · gradient</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>partial derivative 를 묶은 vector · D 가 가장 빨리 커지는 방향</span>
      </Box>
      <Box x={996} y={608} w={860} h={272} at={19.5} title={<Head size={26} color={C.green}>반대로 α × ∇D 만큼 옮긴 뒤 컵까지 거리 (처음 0.141 m)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="α = 0.5" value={0.06} max={0.645} fmt="0.060" unit=" m" color={C.green} at={20.2} />
          <Bar label="α = 1" value={0.062} max={0.645} fmt="0.062" unit=" m" color={C.green} at={26.3} />
          <Bar label="α = 2" value={0.222} max={0.645} fmt="0.222" unit=" m" color={C.orange} at={26.9} />
          <Bar label="α = 5" value={0.645} max={0.645} fmt="0.645" unit=" m" color={C.red} at={27.5} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. Jacobian 과 선형 근사 ----------

function ArmVelocity({ t }: { t: number }) {
  const o = { x: 380, y: 560 }
  const e = { x: 660, y: 560 }
  const h = { x: 660, y: 280 }
  const k = 1700 // px per m/s
  const c1 = { x: h.x - 0.1 * k, y: h.y - 0.1 * k }
  const c2 = { x: h.x - 0.05 * k, y: h.y }
  const sum = { x: h.x - 0.15 * k, y: h.y - 0.1 * k }
  const legend: [string, string, number][] = [
    [C.blue, 'joint 1 만 0.2 rad/s → 첫째 열 × 0.2 = (−0.1, 0.1) m/s', 13.6],
    [C.purple, 'joint 2 만 0.1 rad/s → 둘째 열 × 0.1 = (−0.05, 0) m/s', 14.6],
    [C.green, '더하면 손끝 속도 (−0.15, 0.1) m/s', 16.2],
  ]
  return (
    <svg width={900} height={740}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
          자세 (0°, 90°) · link 0.5 m 두 개 · 관절 속도 (0.2, 0.1) rad/s
        </text>
        <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        <line x1={e.x} y1={e.y} x2={h.x} y2={h.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        <circle cx={o.x} cy={o.y} r={15} fill={C.card} stroke={C.text} strokeWidth={3} />
        <circle cx={e.x} cy={e.y} r={13} fill={C.card} stroke={C.text} strokeWidth={3} />
        <circle cx={h.x} cy={h.y} r={9} fill={C.text} />
        <text x={o.x} y={604} textAnchor="middle" fill={C.muted} fontSize={22}>
          어깨 · joint 1
        </text>
        <text x={e.x} y={604} textAnchor="middle" fill={C.muted} fontSize={22}>
          팔꿈치 · joint 2
        </text>
        <text x={h.x + 22} y={h.y + 8} fill={C.text} fontSize={22}>
          손끝
        </text>
      </g>
      <g opacity={prog(t, 13.6)}>{arrow(h.x, h.y, c1.x, c1.y, C.blue, 4, 14)}</g>
      <g opacity={prog(t, 14.6)}>{arrow(h.x, h.y, c2.x, c2.y, C.purple, 4, 14)}</g>
      <g opacity={prog(t, 16.2)}>
        <line x1={c1.x} y1={c1.y} x2={sum.x} y2={sum.y} stroke={C.purple} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={c2.x} y1={c2.y} x2={sum.x} y2={sum.y} stroke={C.blue} strokeWidth={2} strokeDasharray="6 6" />
        {arrow(h.x, h.y, sum.x, sum.y, C.green, 5, 16)}
      </g>
      {legend.map(([color, text, at], i) => (
        <g key={text} opacity={prog(t, at)}>
          <line x1={40} y1={652 + i * 34} x2={76} y2={652 + i * 34} stroke={color} strokeWidth={4} />
          <text x={88} y={659 + i * 34} fill={color} fontSize={21} fontFamily={MONO}>
            {text}
          </text>
        </g>
      ))}
    </svg>
  )
}

function JacobianScene() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <ArmVelocity t={t} />
      </Panel>
      <Box x={996} y={140} w={860} h={280} at={0.3} title={<Head size={26}>Jacobian J: 손끝 (x, y) 를 관절 각도로 미분한 행렬</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ opacity: prog(t, 0.8) }}>
            <Matrix rows={[['∂x/∂θ₁', '∂x/∂θ₂'], ['∂y/∂θ₁', '∂y/∂θ₂']]} size={24} cellW={120} color={C.muted} />
          </div>
          <span style={{ ...mono(C.text, 24), marginLeft: 16, opacity: prog(t, 7) }}>J(0°, 90°) =</span>
          <div style={{ opacity: prog(t, 7.4) }}>
            <Matrix rows={[['−0.5', '−0.5'], ['0.5', '0']]} size={26} cellW={90} color={C.accent} />
          </div>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 8.5) }}>열마다 그 관절만 1 rad/s 로 돌릴 때의 손끝 속도 (m/s)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>0.01 rad 씩 돌려 잰 값: (−0.502, 0.497), (−0.500, −0.0025)</span>
      </Box>
      <Box x={996} y={436} w={860} h={190} at={13} title={<Head size={26}>관절 속도 → 손끝 속도: J 에 곱한다</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 13.6) }}>0.2 × (−0.5, 0.5) + 0.1 × (−0.5, 0)</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 16.2) }}>= (−0.1, 0.1) + (−0.05, 0) = (−0.15, 0.1) m/s</span>
      </Box>
      <Box x={996} y={642} w={860} h={238} at={21} title={<Head size={26}>손끝 속도 (0.1, 0) m/s → 관절 속도 (a, b): J 를 거꾸로 푼다</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 21.6) }}>세로 (y): 0.5a + 0 × b = 0 → a = 0</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 23) }}>가로 (x): −0.5a − 0.5b = 0.1 → b = −0.2</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>joint 1 은 멈추고 joint 2 만 −0.2 rad/s (시계 방향) 로 돌린다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** the stretched-out arm (0°, 0°): both joints only move the fingertip up */
function StraightArm({ t }: { t: number }) {
  return (
    <svg width={784} height={110} style={{ opacity: prog(t, 7) }}>
      <line x1={40} y1={80} x2={240} y2={80} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
      <line x1={240} y1={80} x2={440} y2={80} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
      <circle cx={40} cy={80} r={12} fill={C.card} stroke={C.text} strokeWidth={3} />
      <circle cx={240} cy={80} r={11} fill={C.card} stroke={C.text} strokeWidth={3} />
      <circle cx={440} cy={80} r={8} fill={C.text} />
      {arrow(440, 72, 440, 4, C.blue, 4, 12)}
      {arrow(466, 80, 466, 44, C.purple, 4, 12)}
      <text x={500} y={30} fill={C.blue} fontSize={20} fontFamily={MONO}>
        joint 1 만: (0, 1) m/s
      </text>
      <text x={500} y={70} fill={C.purple} fontSize={20} fontFamily={MONO}>
        joint 2 만: (0, 0.5) m/s
      </text>
    </svg>
  )
}

function Linear() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={356} at={0.3} title={<Head size={26}>손끝 힘 → 관절 torque: τ = Jᵀ F</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 0.8) }}>F = (0, −10) N (책상을 아래로 10 N)</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 2.2) }}>τ₁ = (−0.5)(0) + (0.5)(−10) = −5 N·m</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 3.4) }}>τ₂ = (−0.5)(0) + (0)(−10) = 0</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 4.4) }}>손끝이 팔꿈치 바로 위라 팔꿈치는 돌지 않고, 어깨는 가로 0.5 m 떨어져 있어 0.5 × 10 = 5 N·m 가 필요하다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 5.4) }}>Jᵀ 는 J 의 행과 열을 바꾼 transpose · 음수는 시계 방향</span>
      </Box>
      <Box x={64} y={512} w={880} h={368} at={6.5} gap={12} title={<Head size={26}>팔을 편 (0°, 0°): singularity</Head>}>
        <StraightArm t={t} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 8.5) }}>
          <span style={mono(C.text, 24)}>J(0°, 0°) =</span>
          <Matrix rows={[['0', '0'], ['1', '0.5']]} size={26} cellW={70} color={C.red} />
          <div style={{ display: 'grid', marginLeft: 20 }}>
            <span style={{ ...line(C.muted, 22) }}>determinant</span>
            <span style={mono(C.red, 24)}>= 0 × 0.5 − 0 × 1 = 0</span>
          </div>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.5) }}>첫째 행이 모두 0 → 어떻게 돌려도 손끝의 가로 (x) 속도는 0</span>
      </Box>
      <Box x={976} y={140} w={880} h={400} at={13} title={<Head size={26}>선형 근사: Δp ≈ J Δq (움직임이 작을 때)</Head>}>
        <Grid
          at={13.3}
          size={21}
          headSize={20}
          widths={[175, 215, 245, 150]}
          monoCols={[0, 1, 2, 3]}
          head={['Δq (rad)', '예측 JΔq', '실제 이동', '차이']}
          rows={[
            { cells: ['(0.02, 0.01)', '(−0.015, 0.010)', '(−0.0151, 0.0098)', '0.00025 m'], at: 14, color: C.green },
            { cells: ['(0.2, 0.1)', '(−0.15, 0.10)', '(−0.158, 0.077)', '0.024 m'], at: 15.4, color: C.orange },
            { cells: ['(0.6, 0.3)', '(−0.45, 0.30)', '(−0.479, 0.093)', '0.21 m'], at: 16.8, color: C.red },
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18) }}>움직임을 10 배 키우면 차이는 약 100 배 · 실제 손끝은 원을 따라 휜다</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 19) }}>sin(60° + 0.1 rad) ≈ sin 60° + cos 60° × 0.1</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 19.6) }}>= 0.916 (실제 0.912)</span>
      </Box>
      <Box x={976} y={556} w={880} h={324} at={20.5} color={`${C.accent}88`} title={<Head size={26} color={C.accent}>계산 주기마다 J 를 다시 구한다</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 20.8) }}>1 kHz 제어: 한 주기 1 ms 동안 1 rad/s 관절은 0.001 rad 만 돈다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 22.6) }}>Kalman Filter 의 EKF: 휘어진 움직임을 Jacobian 으로 직선으로 바꿔 계산</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24.4) }}>MoveIt 의 KDL plugin: Jacobian 으로 관절 각도를 조금씩 고쳐 손끝을 목표에 맞추는 IK</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'derivative 와 차분', color: C.green, text: 'Δθ ÷ Δt 는 finite difference · h 를 줄이면 135 → 130 → 125 → 120 °/s', at: 0.4 },
    { tag: 'noise 와 drift', color: C.red, text: '0.088 ÷ 0.001 ≈ 88 °/s · 20 개 평균은 약 0.01 초 늦음 · bias 0.1 °/s 는 60 초에 6°', at: 4.4 },
    { tag: '미분 규칙과 gradient', color: C.orange, text: '0.25 × 0.01 = 0.0025 m · ∇D = (−0.2, −0.1) · α = 0.5 로 0.141 → 0.060 m', at: 8.4 },
    { tag: 'Jacobian 과 선형 근사', color: C.accent, text: '(0.2, 0.1) rad/s → (−0.15, 0.1) m/s · τ = Jᵀ F · 주기마다 J 를 다시 구한다', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            더 자주 쟀는데 속도는 왜 더 엉터리가 되고, 어떻게 다뤄야 할까?
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
            NEXT · MATH
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Linear Regression</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            측정 데이터에 직선을 맞추며 loss 의 gradient 를 구하고, learning rate 에 따라 수렴과 발산을 본다
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/derivatives
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseDiff = () => (
  <PauseWrite
    question="0.01 초 간격으로 읽은 각도가 20.00°, 20.30°, 20.70° 다. 두 구간의 속도와 그 사이의 가속도는?"
    answer={
      <>
        (20.30 − 20.00) ÷ 0.01 = 30 °/s · (20.70 − 20.30) ÷ 0.01 = 40 °/s
        <br />
        가속도 (40 − 30) ÷ 0.01 = 1000 °/s²
      </>
    }
  />
)

const PauseEncoder = () => (
  <PauseWrite
    question="한 칸 0.36° 인 encoder 를 500 Hz 로 읽어 속도를 계산한다. 한 칸이 만드는 속도 오차는? 최근 10 개를 평균하면?"
    answer={
      <>
        Δt = 1 ÷ 500 = 0.002 초 → 0.36 ÷ 0.002 = 180 °/s
        <br />
        10 개 평균: 0.36 ÷ 0.02 = 18 °/s · 그만큼 늦게 반응
      </>
    }
  />
)

const PauseGrad = () => (
  <PauseWrite
    question="어떤 점에서 ∇f = (3, −4) 다. f 를 가장 빨리 줄이려면 어느 방향으로 움직여야 하고, α = 0.1 로 한 step 옮기면 각 변수는 얼마나 바뀔까?"
    answer={
      <>
        gradient 의 반대인 (−3, 4) 방향
        <br />
        −0.1 × (3, −4) = (−0.3, 0.4) → 첫째 변수는 0.3 줄이고 둘째 변수는 0.4 늘린다
      </>
    }
  />
)

const PauseJac = () => (
  <PauseWrite
    question="자세 (0°, 90°) 에서 관절 속도가 (0.1, −0.1) rad/s 이면 손끝은 어느 쪽으로, 얼마나 빨리 움직일까?"
    answer={
      <>
        0.1 × (−0.5, 0.5) + (−0.1) × (−0.5, 0) = (−0.05, 0.05) + (0.05, 0) = (0, 0.05) m/s
        <br />
        가로 성분이 상쇄되어 0.05 m/s 로 똑바로 위로
      </>
    }
  />
)

export function Derivatives() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        difference: Difference,
        tangent: Tangent,
        'pause-diff': PauseDiff,
        encoder: Encoder,
        drift: Drift,
        'pause-encoder': PauseEncoder,
        chain: Chain,
        gradient: Gradient,
        'pause-grad': PauseGrad,
        jacobian: JacobianScene,
        linear: Linear,
        'pause-jac': PauseJac,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
