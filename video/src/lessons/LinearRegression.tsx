import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './linear-regression.narration.json'
import { script } from './linear-regression.script'

// Numbers follow lessons/linear-regression/README.md (see linear-regression.script.ts). The candidate lines in the question
// scene and the dots in the standardization drawing are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28, mono = false }: { children: ReactNode; color?: string; size?: number; mono?: boolean }) {
  return (
    <Label color={color} size={size} weight={600} mono={mono}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, fontFamily: MONO }}>{label}</span>
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

function Flow({ steps, color, at, gap = 0.5 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.45 })

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

/** a text table whose rows fade in one by one: first column sans, the rest mono */
function Grid({ head, rows, widths, size = 24 }: { head: string[]; rows: { cells: ReactNode[]; at: number; color?: string; cellAt?: number[] }[]; widths: number[]; size?: number }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 12 })
  const first = Math.min(...rows.map((r) => r.at))
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, first - 0.3), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, r.at), color: r.color ?? C.text }}>
          {r.cells.map((v, i) => (
            <span key={i} style={{ ...cell(i), opacity: r.cellAt ? prog(t, r.cellAt[i]) : 1 }}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** maps data to SVG pixels: x0..x1 → px0..px1 and y0..y1 → py0..py1 (py0 is the bottom) */
function scale(x0: number, x1: number, px0: number, px1: number) {
  return (v: number) => px0 + ((v - x0) / (x1 - x0)) * (px1 - px0)
}

const polyline = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            CORE · LINEAR REGRESSION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Linear Regression</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={{ color: C.accent }}>ŷ = w x + b</span> · MSE loss · gradient descent
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            측정 데이터에 직선을 맞추고, loss 의 gradient 로 parameter 를 고치는 법
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
  const X = scale(0, 5, 110, 930)
  const Y = scale(0, 16, 620, 120)
  const pts: [number, number][] = [
    [1, 5.5],
    [2, 7.5],
    [3, 10.5],
    [4, 14.5],
  ]
  const candidates: [number, number, string][] = [
    [3, 2, C.green],
    [2.5, 3, C.blue],
    [3.5, 1, C.purple],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={40} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            1초 동안 굴러간 거리 · 바닥 상태에 따라 흔들린 네 점
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={110} y1={620} x2={940} y2={620} stroke={C.muted} strokeWidth={1.5} />
            <line x1={110} y1={620} x2={110} y2={110} stroke={C.muted} strokeWidth={1.5} />
            {[1, 2, 3, 4].map((v) => (
              <text key={v} x={X(v)} y={652} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            {[0, 5, 10, 15].map((v) => (
              <text key={v} x={96} y={Y(v) + 7} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <text x={940} y={694} textAnchor="end" fill={C.muted} fontSize={22}>
              전압 (V)
            </text>
            <text x={110} y={98} fill={C.muted} fontSize={22}>
              거리 (cm)
            </text>
          </g>
          {candidates.map(([w, b, color], i) => (
            <line key={i} x1={X(0)} y1={Y(b)} x2={X(4.6)} y2={Y(w * 4.6 + b)} stroke={color} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.75 * prog(t, 1.6 + i * 0.7)} />
          ))}
          <text x={940} y={Y(3.5 * 4.6 + 1) + 28} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 3.2)}>
            직선 후보 (모식도)
          </text>
          {pts.map(([x, y], i) => (
            <circle key={i} cx={X(x)} cy={Y(y)} r={10} fill={C.orange} opacity={prog(t, 0.6 + i * 0.3)} />
          ))}
          <g opacity={prog(t, 4.6)}>
            <line x1={110} y1={Y(10)} x2={930} y2={Y(10)} stroke={C.accent} strokeWidth={2} strokeDasharray="4 8" />
            <text x={124} y={Y(10) - 14} fill={C.accent} fontSize={22} fontWeight={600}>
              10 cm 는 몇 V?
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={0.6} title={<Head color={C.orange}>잰 값</Head>}>
        <Grid
          head={['전압', '거리']}
          widths={[200, 220]}
          rows={pts.map(([x, y], i) => ({ cells: [`${x} V`, `${y} cm`], at: 0.8 + i * 0.3 }))}
        />
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={4.4} color={`${C.accent}88`} title={<Head color={C.accent}>물음</Head>}>
        <span style={line(C.text, 28)}>10 cm 를 가려면 몇 V 가 필요한가?</span>
        <span style={line(C.text, 28)}>수많은 직선 가운데 가장 잘 맞는 하나를 컴퓨터는 어떻게 고르는가?</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 1. MSE loss ----------

function Residuals() {
  const t = useSec()
  const X = scale(0, 3.5, 100, 800)
  const Y = scale(0, 12, 600, 120)
  const truth: [number, number][] = [
    [1, 5],
    [2, 8],
    [3, 11],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={36} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            noise 없는 세 점과 직선
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={100} y1={600} x2={810} y2={600} stroke={C.muted} strokeWidth={1.5} />
            <line x1={100} y1={600} x2={100} y2={110} stroke={C.muted} strokeWidth={1.5} />
            {[1, 2, 3].map((v) => (
              <text key={v} x={X(v)} y={632} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            {[0, 4, 8, 12].map((v) => (
              <text key={v} x={86} y={Y(v) + 7} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <text x={810} y={672} textAnchor="end" fill={C.muted} fontSize={22}>
              전압 x (V)
            </text>
            <text x={36} y={92} fill={C.muted} fontSize={22}>
              거리 y (cm)
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <line x1={X(0)} y1={Y(2)} x2={X(3.4)} y2={Y(3 * 3.4 + 2)} stroke={C.green} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.8} />
            <text x={120} y={300} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              y = 3x + 2
            </text>
          </g>
          <g opacity={prog(t, 11.6)}>
            <line x1={X(0)} y1={Y(1)} x2={X(3.5)} y2={Y(8)} stroke={C.blue} strokeWidth={3.5} />
            <text x={620} y={420} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ŷ = 2x + 1
            </text>
          </g>
          {truth.map(([x, y], i) => {
            const p = 2 * x + 1
            const op = prog(t, 12.4 + i * 0.5)
            return (
              <g key={i}>
                <g opacity={op}>
                  <line x1={X(x)} y1={Y(y)} x2={X(x)} y2={Y(p)} stroke={C.red} strokeWidth={3} strokeDasharray="6 5" />
                  <circle cx={X(x)} cy={Y(p)} r={8} fill={C.blue} />
                  <text x={X(x) + 14} y={Y((y + p) / 2) + 8} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
                    −{y - p}
                  </text>
                </g>
                <circle cx={X(x)} cy={Y(y)} r={10} fill={C.orange} opacity={prog(t, 0.5 + i * 0.3)} />
              </g>
            )
          })}
          <text x={100} y={716} fill={C.orange} fontSize={22} opacity={prog(t, 1.2)}>
            잰 점 (1, 5) · (2, 8) · (3, 11)
          </text>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={260} at={6} gap={12} title={<Head color={C.blue} size={34} mono>ŷ = w x + b</Head>}>
        <span style={line(C.text, 24)}>w · 기울기 (weight) · x 가 1 늘 때 예측이 느는 양</span>
        <span style={line(C.text, 24)}>b · 절편 (bias) · x = 0 일 때의 예측</span>
        <span style={line(C.muted, 24)}>w, b 처럼 데이터를 보고 정하는 숫자가 parameter</span>
      </Box>
      <Card x={956} y={430} w={900} h={450} at={11.5}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <Head>w = 2, b = 1 일 때</Head>
          <Grid
            head={['x', '정답 y', '예측 2x + 1', '오차 ŷ − y']}
            widths={[120, 180, 260, 260]}
            rows={truth.map(([x, y], i) => ({ cells: [String(x), String(y), String(2 * x + 1), `−${y - 2 * x - 1}`], at: 11.9 + i * 0.5 }))}
          />
          <Appear at={17.2}>
            <span style={mono(C.accent, 26)}>제곱 4 + 9 + 16 = 29 → MSE = 29 ÷ 3 ≈ 9.67</span>
          </Appear>
          <Appear at={22.7}>
            <span style={mono(C.orange, 24)}>w = b = 0 → 25 + 64 + 121 = 210 → 210 ÷ 3 = 70</span>
          </Appear>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Outlier() {
  const t = useSec()
  // the small cancelling example
  const sx = scale(0, 3, 60, 380)
  const sy = scale(0, 5, 300, 80)
  // the outlier plot
  const X = scale(0, 4.5, 100, 820)
  const Y = scale(0, 26, 520, 86)
  const clean: [number, number][] = [
    [1, 5],
    [2, 8],
    [3, 11],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={330} at={0.3}>
        <svg width={860} height={330}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            오차를 그냥 더하면
          </text>
          <line x1={60} y1={300} x2={380} y2={300} stroke={C.muted} strokeWidth={1.5} />
          <line x1={sx(0)} y1={sy(3)} x2={sx(3)} y2={sy(3)} stroke={C.blue} strokeWidth={3} />
          <text x={sx(2.25)} y={sy(3) - 12} fill={C.blue} fontSize={22} fontFamily={MONO}>
            ŷ = 3
          </text>
          <g opacity={prog(t, 1.2)}>
            <line x1={sx(1)} y1={sy(4)} x2={sx(1)} y2={sy(3)} stroke={C.red} strokeWidth={3} strokeDasharray="5 4" />
            <line x1={sx(2)} y1={sy(2)} x2={sx(2)} y2={sy(3)} stroke={C.red} strokeWidth={3} strokeDasharray="5 4" />
            <text x={sx(1) + 14} y={sy(3.5) + 4} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              −1
            </text>
            <text x={sx(2) + 14} y={sy(2.5) + 12} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              +1
            </text>
          </g>
          <circle cx={sx(1)} cy={sy(4)} r={9} fill={C.orange} />
          <circle cx={sx(2)} cy={sy(2)} r={9} fill={C.orange} />
          <g opacity={prog(t, 2)}>
            <text x={430} y={130} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
              −1 + (+1) = 0
            </text>
            <text x={430} y={172} fill={C.muted} fontSize={22}>
              두 점 모두 1 씩 틀렸는데 합은 0
            </text>
            <text x={430} y={222} fill={C.green} fontSize={22} fontWeight={600}>
              → 제곱해 부호를 없앤 뒤 평균한다
            </text>
            <text x={430} y={262} fill={C.muted} fontSize={20}>
              점이 3 개든 300 개든 점 하나당 오차
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={500} w={860} h={380} at={7} gap={16} title={<Head>같은 세 점 · (w, b) 에 따라 바뀌는 loss</Head>}>
        <Bar label="(0, 0)" value={70} max={70} color={C.red} at={7.6} width={440} labelW={120} />
        <Bar label="(2, 1)" value={9.67} max={70} color={C.orange} at={8.4} width={440} labelW={120} />
        <Bar label="(3, 2)" value={0} max={70} color={C.green} at={9.2} width={440} labelW={120} />
        <Appear at={10.4}>
          <span style={line(C.muted, 22)}>loss 는 데이터가 얼마나 나쁜지가 아니라, 지금 고른 parameter 가 이 데이터에 얼마나 안 맞는지를 잰다</span>
        </Appear>
      </Box>
      <Panel x={956} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={36} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            4 V 의 14 cm 가 24 cm 로 찍히면
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={100} y1={520} x2={830} y2={520} stroke={C.muted} strokeWidth={1.5} />
            <line x1={100} y1={520} x2={100} y2={80} stroke={C.muted} strokeWidth={1.5} />
            {[1, 2, 3, 4].map((v) => (
              <text key={v} x={X(v)} y={550} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            {[0, 10, 20].map((v) => (
              <text key={v} x={86} y={Y(v) + 7} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <text x={830} y={550} textAnchor="end" fill={C.muted} fontSize={20}>
              V
            </text>
            <text x={36} y={80} fill={C.muted} fontSize={20}>
              cm
            </text>
            <line x1={X(0)} y1={Y(2)} x2={X(4.5)} y2={Y(15.5)} stroke={C.green} strokeWidth={3} />
            <text x={600} y={380} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              y = 3x + 2
            </text>
          </g>
          {clean.map(([x, y], i) => (
            <circle key={i} cx={X(x)} cy={Y(y)} r={10} fill={C.orange} opacity={prog(t, 0.5 + i * 0.2)} />
          ))}
          <circle cx={X(4)} cy={Y(14)} r={10} fill="none" stroke={C.orange} strokeWidth={2.5} opacity={prog(t, 1.1) * (1 - 0.6 * prog(t, 14))} />
          <g opacity={prog(t, 14)}>
            {arrow(X(4), Y(14) - 14, X(4), Y(24) + 16, C.red, 2.5)}
            <circle cx={X(4)} cy={Y(24)} r={10} fill={C.red} />
            <text x={X(4) + 16} y={Y(19) + 8} fill={C.red} fontSize={22} fontWeight={600}>
              센서 오류
            </text>
          </g>
          <g opacity={prog(t, 15.4)}>
            <line x1={X(0.5)} y1={Y(0)} x2={X(4.5)} y2={Y(24)} stroke={C.red} strokeWidth={3} strokeDasharray="12 7" />
            <text x={360} y={296} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              y = 6x − 3
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 36, right: 36, top: 580, display: 'grid', gap: 10 }}>
          <Appear at={13.7}>
            <span style={mono(C.text, 24)}>오차 1 → 제곱 1 · 오차 10 → 제곱 100</span>
          </Appear>
          <Appear at={20.7}>
            <span style={line(C.green, 22)}>L1 loss · 오차의 크기를 제곱하지 않고 그대로 평균해서 이런 점에 덜 끌려간다</span>
          </Appear>
          <Appear at={22.4}>
            <span style={line(C.muted, 22)}>ACT 저자들은 L2 loss (MSE) 대신 L1 loss 를 썼고, 그쪽이 action 을 더 정밀하게 학습했다고 보고했다</span>
          </Appear>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- 2. gradient descent ----------

function Gradient() {
  const t = useSec()
  const X = scale(0, 6, 130, 790)
  const Y = scale(0, 45, 560, 90)
  const L = (w: number) => (14 / 3) * (w - 3) ** 2
  const curve = polyline(Array.from({ length: 61 }, (_, i) => i / 10).map((w) => [X(w), Y(L(w))]))
  const vals = ['42', '18.67', '4.67', '0', '4.67', '18.67']
  const tangent = (w: number, slope: number, half = 0.45) => [X(w - half), Y(L(w) - slope * half), X(w + half), Y(L(w) + slope * half)]
  const [a1, b1, c1, d1] = tangent(1, -18.67)
  const [a5, b5, c5, d5] = tangent(5, 18.67)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            b = 2 로 고정한 loss 곡선 L(w, 2)
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={130} y1={560} x2={800} y2={560} stroke={C.muted} strokeWidth={1.5} />
            <path d={curve} fill="none" stroke={C.accent} strokeWidth={3.5} />
            {vals.map((v, i) => (
              <g key={i}>
                <circle cx={X(i)} cy={Y(L(i))} r={7} fill={C.accent} />
                <text x={X(i)} y={598} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {i}
                </text>
                <text x={X(i)} y={640} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
              </g>
            ))}
            <text x={30} y={598} fill={C.muted} fontSize={22}>
              w
            </text>
            <text x={30} y={640} fill={C.muted} fontSize={22}>
              loss
            </text>
            <text x={30} y={700} fill={C.muted} fontSize={22}>
              w = 3 에서 0 으로 가장 낮고 양쪽으로 갈수록 커지는 U 자
            </text>
          </g>
          <g opacity={prog(t, 18.3)}>
            <line x1={a1} y1={b1} x2={c1} y2={d1} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
            <text x={262} y={330} fill={C.red} fontSize={22} fontWeight={600}>
              기울기 −18.67
            </text>
            <line x1={X(2.55)} y1={560} x2={X(3.45)} y2={560} stroke={C.green} strokeWidth={5} strokeLinecap="round" />
            <text x={X(3)} y={530} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              기울기 0
            </text>
            <line x1={a5} y1={b5} x2={c5} y2={d5} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />
            <text x={658} y={330} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              기울기 +18.67
            </text>
          </g>
        </svg>
      </Panel>
      <Card x={956} y={140} w={900} h={330} at={6}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head>w 를 2 → 2.01 로 늘리면 (b = 1)</Head>
          <Grid
            head={['값', '변화 전', '변화 후', '변화량']}
            widths={[100, 160, 250, 290]}
            size={22}
            rows={[
              { cells: ['예측', '3, 5, 7', '3.01, 5.02, 7.03', '+0.01, +0.02, +0.03'], at: 6.6 },
              { cells: ['loss', '9.6667', '9.5338', '−0.1329'], at: 8.6, color: C.accent },
            ]}
          />
          <Appear at={12.2}>
            <span style={mono(C.accent, 26)}>−0.1329 ÷ 0.01 ≈ −13.29 → −13.33</span>
          </Appear>
          <Appear at={14}>
            <span style={line(C.muted, 22)}>늘리는 양을 줄일수록 −13.33 에 다가간다 · partial derivative ∂L/∂w</span>
          </Appear>
        </div>
      </Card>
      <Box x={956} y={500} w={900} h={380} at={18} gap={12} title={<Head>gradient 는 부호로 읽는다</Head>}>
        <span style={line(C.red, 24)}>+ 양수 · 늘리면 loss 가 커진다 → 그 parameter 를 줄인다</span>
        <span style={line(C.green, 24)}>− 음수 · 늘리면 loss 가 줄어든다 → 그 parameter 를 늘린다</span>
        <span style={line(C.muted, 24)}>0 · 조금 바꿔도 loss 가 거의 변하지 않는다 → 그대로 둔다</span>
        <Appear at={24.2}>
          <span style={mono(C.accent, 24)}>∂L/∂w = 2/3 × (−2 − 6 − 12) = 2/3 × (−20) ≈ −13.33</span>
        </Appear>
        <Appear at={26}>
          <span style={mono(C.blue, 24)}>∂L/∂b = 2/3 × (−2 − 3 − 4) = 2/3 × (−9) = −6</span>
        </Appear>
      </Box>
    </AbsoluteFill>
  )
}

function Descent() {
  const t = useSec()
  const known: [number, number][] = [
    [0, 70],
    [1, 55.34],
    [2, 43.75],
    [5, 21.63],
    [20, 0.68],
  ]
  // between the table's steps the curve is drawn by log-linear interpolation of the loss
  const lossAt = (s: number) => {
    for (let i = 1; i < known.length; i++) {
      const [s0, l0] = known[i - 1]
      const [s1, l1] = known[i]
      if (s <= s1) return l0 * (l1 / l0) ** ((s - s0) / (s1 - s0))
    }
    return known[known.length - 1][1]
  }
  const X = scale(0, 20, 60, 800)
  const Y = scale(0, 70, 230, 30)
  const reveal = prog(t, 13.4, 3)
  const curve = polyline(
    Array.from({ length: 81 }, (_, i) => i / 4)
      .filter((s) => s <= 20 * reveal)
      .map((s) => [X(s), Y(lossAt(s))]),
  )
  const rows: { s: string; w: string; b: string; l: string; at: number; color?: string }[] = [
    { s: '0', w: '0', b: '0', l: '70', at: 6.8 },
    { s: '1', w: '0.36', b: '0.16', l: '55.34', at: 7.4, color: C.accent },
    { s: '2', w: '0.68', b: '0.3024', l: '43.75', at: 13.4 },
    { s: '5', w: '1.4420', b: '0.6425', l: '21.63', at: 14 },
    { s: '20', w: '2.9294', b: '1.3206', l: '0.68', at: 14.6, color: C.green },
    { s: '100', w: '3.1971', b: '1.5519', l: '0.029', at: 20.4, color: C.orange },
    { s: '1000', w: '3.0226', b: '1.9486', l: '0.0004', at: 21.4 },
    { s: '3000', w: '3.0002', b: '1.9996', l: '0.0000', at: 22.2 },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={6.5}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <Head>η = 0.01 · w = b = 0 에서 시작 · 세 점 (1, 5), (2, 8), (3, 11)</Head>
          <div style={{ display: 'grid', gap: 4 }}>
            <span style={mono(C.muted, 22)}>step 0 의 gradient (−36, −16)</span>
            <span style={mono(C.accent, 22)}>w = 0 − 0.01 × (−36) = 0.36 · b = 0 − 0.01 × (−16) = 0.16</span>
          </div>
          <Grid
            head={['step', 'w', 'b', 'loss']}
            widths={[150, 210, 210, 210]}
            size={26}
            rows={rows.map((r) => ({ cells: [r.s, r.w, r.b, r.l], at: r.at, color: r.color }))}
          />
          <Appear at={20.6}>
            <span style={line(C.orange, 22)}>w 는 100 step 에 3 을 넘었다가, b 가 2 로 천천히 오르는 동안 3 으로 돌아온다</span>
          </Appear>
        </div>
      </Card>
      <Box x={956} y={140} w={900} h={300} at={0.3} gap={10} title={<Head>gradient descent 의 update</Head>}>
        <span style={mono(C.accent, 32)}>w ← w − η × ∂L/∂w</span>
        <span style={mono(C.accent, 32)}>b ← b − η × ∂L/∂b</span>
        <span style={line(C.muted, 22)}>η (learning rate) · gradient 에 곱해 한 번에 움직일 크기를 정하는 양수</span>
      </Box>
      <Card x={956} y={470} w={900} h={410} at={13}>
        <div style={{ padding: '24px 30px 0', display: 'grid', gap: 12 }}>
          <Flow steps={['예측', 'loss', 'gradient', 'update']} color={C.blue} at={13.2} gap={0.35} />
        </div>
        <svg width={900} height={300} style={{ position: 'absolute', left: 0, top: 100 }}>
          <line x1={60} y1={230} x2={820} y2={230} stroke={C.muted} strokeWidth={1.5} />
          <path d={curve} fill="none" stroke={C.green} strokeWidth={3.5} />
          {known.map(([s, l], i) => (
            <circle key={i} cx={X(s)} cy={Y(l)} r={6} fill={C.green} opacity={prog(t, 13.4 + (s / 20) * 3)} />
          ))}
          <text x={X(0) + 50} y={Y(70) + 8} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.4)}>
            loss 70
          </text>
          <text x={X(0)} y={264} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={X(5)} y={264} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO} opacity={prog(t, 14.2)}>
            5
          </text>
          <text x={X(20)} y={264} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16.2)}>
            20 step · loss 0.68
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 3. learning rate 와 발산 ----------

function NumberLine({ y0, eta, mult, seq, lo, hi, ticks, color, at }: { y0: number; eta: string; mult: string; seq: number[]; lo: number; hi: number; ticks: number[]; color: string; at: number }) {
  const t = useSec()
  const X = scale(lo, hi, 80, 920)
  const yl = y0 + 160
  const fmt = (v: number) => String(v).replace('-', '−')
  return (
    <g opacity={prog(t, at)}>
      <text x={40} y={y0 + 26} fill={color} fontSize={24} fontWeight={600}>
        η = {eta} · 곱해지는 수 {mult}
      </text>
      <text x={40} y={y0 + 62} fill={C.muted} fontSize={22} fontFamily={MONO}>
        w : {seq.map(fmt).join(' → ')}
      </text>
      <line x1={80} y1={yl} x2={920} y2={yl} stroke={C.muted} strokeWidth={1.5} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={yl - 8} x2={X(v)} y2={yl + 8} stroke={C.muted} strokeWidth={1.5} />
          <text x={X(v)} y={yl + 34} textAnchor="middle" fill={v === 0 ? C.text : C.dim} fontSize={20} fontFamily={MONO}>
            {fmt(v)}
          </text>
        </g>
      ))}
      {seq.slice(1).map((v, i) => {
        const xa = X(seq[i])
        const xb = X(v)
        const h = Math.min(66, Math.abs(xb - xa) * 0.3 + 12)
        const p = prog(t, at + 0.4 + i * 0.5, 0.5)
        return (
          <path key={i} d={`M${xa},${yl} Q${(xa + xb) / 2},${yl - 2 * h} ${xb},${yl}`} fill="none" stroke={color} strokeWidth={2.5} opacity={p} strokeDasharray="6 5" />
        )
      })}
      {seq.map((v, i) => (
        <circle key={i} cx={X(v)} cy={yl} r={i === 0 ? 9 : 7} fill={i === 0 ? C.text : color} opacity={prog(t, at + 0.2 + Math.max(0, i - 1) * 0.5 + (i ? 0.4 : 0))} />
      ))}
    </g>
  )
}

function LearningRate() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={40} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            L = w² 에서 w = 1 부터 · update 마다 같은 수를 곱한다
          </text>
          <NumberLine y0={80} eta="0.1" mult="0.8" seq={[1, 0.8, 0.64, 0.512, 0.41]} lo={-1} hi={1} ticks={[-1, 0, 1]} color={C.green} at={6.6} />
          <NumberLine y0={300} eta="0.75" mult="−0.5" seq={[1, -0.5, 0.25, -0.125, 0.0625]} lo={-1} hi={1} ticks={[-1, 0, 1]} color={C.orange} at={9.4} />
          <NumberLine y0={520} eta="1.5" mult="−2" seq={[1, -2, 4, -8, 16]} lo={-8} hi={16} ticks={[-8, 0, 8, 16]} color={C.red} at={12.6} />
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={0.3} gap={12} title={<Head>L = w² 의 gradient descent</Head>}>
        <span style={mono(C.text, 26)}>gradient = 2w</span>
        <span style={mono(C.accent, 26)}>w ← w − η × 2w = (1 − 2η) w</span>
        <span style={line(C.muted, 22)}>update 마다 w 에 같은 수 1 − 2η 가 곱해진다</span>
        <Appear at={15.4}>
          <span style={line(C.red, 22)}>곱해지는 수의 크기가 1 보다 작으면 0 으로 다가가고, 1 보다 크면 발산한다</span>
        </Appear>
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={18.5} gap={12} title={<Head>가파른 loss 와 세 점의 MSE</Head>}>
        <span style={mono(C.text, 22)}>L = aw² → 곱해지는 수 1 − 2aη</span>
        <span style={line(C.text, 22)}>η &gt; 1/a 에서 발산 · a = 2 면 상한 0.5 · a = 10 이면 상한 0.1</span>
        <Appear at={24.6}>
          <span style={line(C.accent, 22)}>세 점의 MSE 에서 상한은 약 0.18</span>
        </Appear>
        <Appear at={25.6}>
          <span style={mono(C.red, 22)}>η = 0.2 → loss 70 → 103.92 → 154.29 → 229.10</span>
        </Appear>
        <Appear at={27}>
          <span style={line(C.muted, 22)}>1782 step 째 inf, 그 뒤 nan · loss 가 커지면 learning rate 부터 줄인다</span>
        </Appear>
      </Box>
    </AbsoluteFill>
  )
}

function Scale() {
  const t = useSec()
  const raw = [0.12, 0.2, 0.31, 0.45, 0.52, 0.66, 0.8, 0.93]
  const mid = raw.reduce((a, b) => a + b, 0) / raw.length
  const sd = Math.sqrt(raw.reduce((a, b) => a + (b - mid) ** 2, 0) / raw.length)
  const p = prog(t, 22.5, 1.6)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={360} at={0.3} gap={14} title={<Head>b = 2 로 고정한 loss 는 a (w − 3)² · a 는 x² 의 평균</Head>}>
        <Grid
          head={['입력 x', 'x² 의 평균', '상한 (w, b 함께)']}
          widths={[250, 250, 300]}
          rows={[
            { cells: ['1, 2, 3', '14/3', '약 0.18'], at: 0.8 },
            { cells: ['10, 20, 30', '100 배', '0.002'], at: 2.4, color: C.orange },
          ]}
        />
        <Appear at={7.2}>
          <span style={mono(C.red, 24)}>η = 0.01 → 첫 step 에 loss 70 → 약 4840 (발산)</span>
        </Appear>
      </Box>
      <Box x={64} y={530} w={880} h={350} at={13.5} gap={14} title={<Head>Dynamixel XM430-W350 의 encoder</Head>}>
        <span style={line(C.text, 24)}>한 바퀴를 4096 눈금으로 잰다</span>
        <span style={mono(C.accent, 24)}>4096 ÷ (2π) ≈ 652 배 (radian 대신 눈금 수)</span>
        <span style={line(C.text, 24)}>x² 의 평균은 약 42 만 배 → learning rate 를 42 만 분의 1 로 줄여야 한다</span>
      </Box>
      <Card x={976} y={140} w={880} h={740} at={20.5}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.green}>standardization</Head>
          <span style={mono(C.green, 30)}>(x − 평균) ÷ 표준편차</span>
          <span style={line(C.muted, 22)}>입력을 평균 0, 표준편차 1 로 맞춘다</span>
        </div>
        <svg width={880} height={300} style={{ position: 'absolute', left: 0, top: 220 }}>
          <text x={30} y={34} fill={C.dim} fontSize={20}>
            입력의 흩어진 모습 (모식도)
          </text>
          <line x1={60} y1={150} x2={820} y2={150} stroke={C.muted} strokeWidth={1.5} />
          <line x1={440} y1={138} x2={440} y2={162} stroke={C.text} strokeWidth={2} />
          <text x={440} y={194} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
            0
          </text>
          <g opacity={p}>
            <line x1={440 - 110} y1={142} x2={440 - 110} y2={158} stroke={C.green} strokeWidth={2} />
            <line x1={440 + 110} y1={142} x2={440 + 110} y2={158} stroke={C.green} strokeWidth={2} />
            <text x={440 - 110} y={194} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
              −1
            </text>
            <text x={440 + 110} y={194} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
              1
            </text>
          </g>
          {raw.map((v, i) => {
            const before = 150 + v * 720
            const after = 440 + ((v - mid) / sd) * 110
            return <circle key={i} cx={before + (after - before) * p} cy={150} r={9} fill={p > 0.5 ? C.green : C.orange} />
          })}
          <text x={820} y={240} textAnchor="end" fill={p > 0.5 ? C.green : C.orange} fontSize={22} fontWeight={600}>
            {p > 0.5 ? '평균 0 · 표준편차 1' : '크기가 제각각인 넓게 퍼진 입력'}
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 540, display: 'grid', gap: 10 }}>
          <Appear at={21.5}>
            <span style={line(C.text, 22)}>LeRobot 의 ACT 는 기본 설정에서 카메라 영상, 관절 상태, action 을 모두 dataset 의 평균과 표준편차로 바꾼 뒤 학습한다</span>
          </Appear>
          <Appear at={24}>
            <span style={line(C.muted, 20)}>loss 를 합으로 쓰면 gradient 가 N 배라서, PyTorch 의 MSELoss 는 기본값이 평균 (reduction = 'mean')</span>
          </Appear>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 4. test loss 와 로봇 ----------

function Overfit() {
  const t = useSec()
  const X = scale(0, 5.5, 100, 940)
  const Y = scale(0, 21, 620, 110)
  const pts: [number, number][] = [
    [1, 5.5],
    [2, 7.5],
    [3, 10.5],
    [4, 14.5],
  ]
  const q = (x: number) => 0.5 * x * x + 0.5 * x + 4.5
  const curve = polyline(Array.from({ length: 53 }, (_, i) => i / 10).map((x) => [X(x), Y(q(x))]))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={36} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            흔들린 네 점 (train) 과 5 V 의 새 측정 (test)
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={100} y1={620} x2={950} y2={620} stroke={C.muted} strokeWidth={1.5} />
            <line x1={100} y1={620} x2={100} y2={100} stroke={C.muted} strokeWidth={1.5} />
            {[1, 2, 3, 4, 5].map((v) => (
              <text key={v} x={X(v)} y={652} textAnchor="middle" fill={v === 5 ? C.text : C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            {[0, 5, 10, 15, 20].map((v) => (
              <text key={v} x={86} y={Y(v) + 7} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <text x={950} y={694} textAnchor="end" fill={C.muted} fontSize={22}>
              전압 (V)
            </text>
            <text x={36} y={92} fill={C.muted} fontSize={20}>
              cm
            </text>
            <line x1={X(0)} y1={Y(2)} x2={X(5.5)} y2={Y(18.5)} stroke={C.green} strokeWidth={3} />
            <path d={curve} fill="none" stroke={C.purple} strokeWidth={3} />
            <line x1={120} x2={160} y1={150} y2={150} stroke={C.green} strokeWidth={3} />
            <text x={172} y={158} fill={C.green} fontSize={22} fontFamily={MONO}>
              직선 3x + 2
            </text>
            <line x1={120} x2={160} y1={190} y2={190} stroke={C.purple} strokeWidth={3} />
            <text x={172} y={198} fill={C.purple} fontSize={22} fontFamily={MONO}>
              곡선 0.5x² + 0.5x + 4.5
            </text>
            <circle cx={140} cy={230} r={8} fill={C.orange} />
            <text x={172} y={238} fill={C.orange} fontSize={22}>
              train 점 네 개
            </text>
          </g>
          {pts.map(([x, y], i) => (
            <circle key={i} cx={X(x)} cy={Y(y)} r={10} fill={C.orange} opacity={prog(t, 0.5 + i * 0.2)} />
          ))}
          <g opacity={prog(t, 7.2)}>
            <circle cx={140} cy={270} r={8} fill="none" stroke={C.text} strokeWidth={2.5} />
            <text x={172} y={278} fill={C.text} fontSize={22}>
              5 V 에서 새로 잰 점 (예로 정한 17.5 cm)
            </text>
            <line x1={X(5)} y1={620} x2={X(5)} y2={Y(21)} stroke={C.dim} strokeWidth={1.5} strokeDasharray="4 6" />
            <line x1={X(5) + 14} y1={Y(17)} x2={X(5) + 46} y2={Y(17)} stroke={C.green} strokeWidth={4} strokeLinecap="round" />
            <circle cx={X(5)} cy={Y(17.5)} r={8} fill={C.bg} stroke={C.text} strokeWidth={2.5} />
          </g>
          <g opacity={prog(t, 13.7)}>
            <line x1={X(5)} y1={Y(17.5) - 10} x2={X(5)} y2={Y(19.5)} stroke={C.red} strokeWidth={3} />
            <line x1={X(5) + 14} y1={Y(19.5)} x2={X(5) + 46} y2={Y(19.5)} stroke={C.purple} strokeWidth={4} strokeLinecap="round" />
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={740} at={0.3} gap={16} title={<Head>train 의 loss 와 5 V 의 오차</Head>}>
        <Grid
          head={['모델', '네 점의 loss', '5 V 예측', '오차²']}
          widths={[150, 190, 170, 150]}
          rows={[
            { cells: ['직선', '0.25', '17', '0.25'], at: 0.8, color: C.green, cellAt: [0.8, 0.8, 7.4, 8.4] },
            { cells: ['곡선', '0', '19.5', '4'], at: 1.4, color: C.purple, cellAt: [1.4, 1.4, 13.7, 14.6] },
          ]}
        />
        <Appear at={8.6}>
          <span style={line(C.muted, 22)}>직선: 17 − 17.5 = −0.5 → 0.25 · 곡선: 19.5 − 17.5 = +2.0 → 4</span>
        </Appear>
        <Appear at={15.4}>
          <span style={mono(C.accent, 28)}>4 ÷ 0.25 = 16 배</span>
        </Appear>
        <Appear at={17}>
          <span style={line(C.text, 22)}>곡선은 데이터에 섞인 noise 까지 따라가도록 휘었고, 같은 noise 가 새 측정에 다시 나오지 않아 그 휨이 오차가 된다</span>
        </Appear>
        <Appear at={20.7}>
          <span style={line(C.orange, 22)}>train set · 학습에 쓴 데이터</span>
        </Appear>
        <Appear at={21.7}>
          <span style={line(C.blue, 22)}>test set · 학습에 쓰지 않고 성능을 재는 데만 쓰는 데이터</span>
        </Appear>
        <Appear at={22.9}>
          <span style={line(C.red, 22)}>overfitting · train set 에는 아주 잘 맞지만 처음 보는 데이터에서 성능이 떨어지는 현상</span>
        </Appear>
      </Box>
    </AbsoluteFill>
  )
}

function Robot() {
  const t = useSec()
  // camera calibration: marker position X (m) → pixel
  const cx = scale(0, 0.35, 100, 800)
  const cy = scale(100, 280, 380, 80)
  const marks: [number, number][] = [
    [0.1, 151],
    [0.2, 198],
    [0.3, 251],
  ]
  // torque constant: current (A) → stall torque (N·m)
  const tx = scale(0, 3, 90, 450)
  const ty = scale(0, 5.5, 360, 80)
  const stall: [number, number, string][] = [
    [2.1, 3.8, '11.1 V'],
    [2.3, 4.1, '12 V'],
    [2.7, 4.8, '14.8 V'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={230} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head>normal equation · gradient = 0 으로 놓고 바로 푼다</Head>
          <span style={mono(C.text, 26)}>14/3 w + 2b = 18 · 2w + b = 8</span>
          <Appear at={2.4}>
            <span style={mono(C.green, 26)}>→ (w, b) = (3, 2) · gradient descent 는 수천 step</span>
          </Appear>
        </div>
      </Card>
      <Card x={64} y={400} w={880} h={480} at={6.5}>
        <svg width={880} height={480}>
          <text x={30} y={42} fill={C.text} fontSize={26} fontWeight={600}>
            camera 의 pixel 축척 · 예로 정한 표식 세 개
          </text>
          <line x1={100} y1={380} x2={810} y2={380} stroke={C.muted} strokeWidth={1.5} />
          <line x1={100} y1={380} x2={100} y2={76} stroke={C.muted} strokeWidth={1.5} />
          {[0.1, 0.2, 0.3].map((v) => (
            <text key={v} x={cx(v)} y={410} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          {[100, 200].map((v) => (
            <text key={v} x={88} y={cy(v) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <text x={810} y={446} textAnchor="end" fill={C.muted} fontSize={20}>
            표식 위치 X (m)
          </text>
          <text x={30} y={72} fill={C.muted} fontSize={20}>
            pixel
          </text>
          <g opacity={prog(t, 7.6)}>
            <line x1={cx(0)} y1={cy(100)} x2={cx(0.35)} y2={cy(275)} stroke={C.blue} strokeWidth={3} />
            <text x={520} y={260} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              pixel = 500 × X + 100
            </text>
          </g>
          {marks.map(([x, p], i) => (
            <g key={i} opacity={prog(t, 6.8 + i * 0.3)}>
              <circle cx={cx(x)} cy={cy(p)} r={9} fill={C.orange} />
              <text x={cx(x) - 12} y={cy(p) - 19} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO}>
                {p}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 9)}>
            <text x={520} y={300} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              s = 500 pixel/m
            </text>
            <text x={520} y={334} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              c = 100 pixel
            </text>
            <text x={520} y={366} fill={C.muted} fontSize={22}>
              세 표식의 오차 −1, +2, −1 pixel
            </text>
          </g>
        </svg>
      </Card>
      <Card x={976} y={140} w={880} h={420} at={13}>
        <svg width={880} height={420}>
          <text x={30} y={42} fill={C.text} fontSize={26} fontWeight={600}>
            XM430-W350 사양의 stall 점 · τ = k I
          </text>
          <line x1={90} y1={360} x2={460} y2={360} stroke={C.muted} strokeWidth={1.5} />
          <line x1={90} y1={360} x2={90} y2={76} stroke={C.muted} strokeWidth={1.5} />
          {[1, 2, 3].map((v) => (
            <text key={v} x={tx(v)} y={388} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v} A
            </text>
          ))}
          {[2, 4].map((v) => (
            <text key={v} x={78} y={ty(v) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <text x={30} y={72} fill={C.muted} fontSize={20}>
            N·m
          </text>
          <g opacity={prog(t, 14.6)}>
            <line x1={tx(0)} y1={ty(0)} x2={tx(3)} y2={ty(5.37)} stroke={C.purple} strokeWidth={3} />
            <text x={110} y={140} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
              기울기 k ≈ 1.79
            </text>
          </g>
          {stall.map(([i, tau, v], k) => (
            <g key={k} opacity={prog(t, 13.4 + k * 0.3)}>
              <circle cx={tx(i)} cy={ty(tau)} r={8} fill={C.orange} />
              <text x={490} y={104 + k * 34} fill={C.orange} fontSize={20} fontFamily={MONO}>
                {v} : {i} A, {tau} N·m
              </text>
            </g>
          ))}
          <g opacity={prog(t, 14.6)}>
            <text x={490} y={222} fill={C.text} fontSize={22} fontFamily={MONO}>
              k = ΣIτ ÷ ΣI²
            </text>
            <text x={490} y={256} fill={C.text} fontSize={22} fontFamily={MONO}>
              = 30.37 ÷ 16.99
            </text>
            <text x={490} y={294} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
              ≈ 1.79 N·m/A
            </text>
          </g>
          <g opacity={prog(t, 19.8)}>
            <text x={490} y={344} fill={C.green} fontSize={20} fontFamily={MONO}>
              300 × 2.69 ≈ 807 mA
            </text>
            <text x={490} y={376} fill={C.green} fontSize={20} fontFamily={MONO}>
              1.79 × 0.807 ≈ 1.44 N·m
            </text>
          </g>
        </svg>
      </Card>
      <Box x={976} y={590} w={880} h={290} at={25.5} gap={12} title={<Head>ACT 의 action head</Head>}>
        <span style={mono(C.accent, 24)}>â = w1·h1 + w2·h2 + … + w512·h512 + b</span>
        <span style={line(C.text, 22)}>숫자 512 개로 관절마다 식 하나 · motor 가 6 개인 SO-101 팔이면 식 6 개</span>
        <span style={line(C.muted, 22)}>ACT 는 앞쪽 network 도 함께 학습하고, loss 로는 MSE 대신 L1 loss 를 쓴다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'MSE loss', color: C.orange, text: '오차 −2, −3, −4 → (4 + 9 + 16) ÷ 3 ≈ 9.67 · 24 cm 하나가 3x + 2 를 6x − 3 으로 끈다', at: 1 },
    { tag: 'gradient descent', color: C.blue, text: 'w ← w − η × ∂L/∂w · 부호로 방향을 읽는다 · η = 0.01 로 20 step 에 loss 70 → 0.68', at: 4.4 },
    { tag: 'learning rate 와 발산', color: C.red, text: '곱해지는 수 1 − 2aη 의 크기가 1 을 넘으면 발산 · 입력 10 배면 상한 0.18 → 0.002', at: 8.4 },
    { tag: 'test loss 와 로봇', color: C.green, text: 'train loss 0 인 곡선의 5 V 오차 제곱은 직선의 16 배 · k ≈ 1.79 N·m/A · action head', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            수많은 직선 가운데 가장 잘 맞는 하나를 컴퓨터는 어떻게 고를까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600 }}>{it.text}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Outro() {
  const next = [
    { name: 'Perceptron', text: '답이 둘 중 하나인 문제에서 출력이 문턱을 넘는지로 둘을 가르는 학습 규칙' },
    { name: 'Behavior Cloning', text: '사람이 조종한 시연을 정답으로 삼아 같은 loss 와 gradient 로 policy 를 학습' },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 28, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          {next.map((n, i) => (
            <Appear key={n.name} at={0.5 + i * 0.6}>
              <div style={{ width: 760, padding: '28px 34px', borderRadius: 22, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 600 }}>{n.name}</div>
                <Label color={C.muted} size={28} style={{ lineHeight: 1.45 }}>
                  {n.text}
                </Label>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/linear-regression (Legendre 1805 · Cauchy 1847)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseMse = () => (
  <PauseWrite
    question="데이터가 두 점 (1, 3), (2, 5) 이고 직선이 ŷ = x + 1 일 때 MSE 는?"
    answer={
      <>
        예측 2, 3 → 오차 2 − 3 = −1, 3 − 5 = −2 → 제곱 1, 4
        <br />
        MSE = (1 + 4) ÷ 2 = 2.5
      </>
    }
  />
)

const PauseStep = () => (
  <PauseWrite
    question="두 점 (1, 3), (2, 5) 에서 w = b = 0 이면 gradient 가 (−13, −8) 이다. η = 0.1 로 한 step 뒤의 w 와 b 는?"
    answer={
      <>
        w = 0 − 0.1 × (−13) = 1.3 · b = 0 − 0.1 × (−8) = 0.8
        <br />
        gradient 가 둘 다 음수라서 두 parameter 가 모두 커졌다
      </>
    }
  />
)

const PauseLr = () => (
  <PauseWrite
    question="L(w) = 2w² 이고 η = 0.6 이면 update 마다 곱해지는 수는 얼마이고, w 는 어떻게 움직일까?"
    answer={
      <>
        1 − 2 × 2 × 0.6 = 1 − 2.4 = −1.4 → 크기가 1 보다 크고 음수
        <br />
        w = 1 에서 1 → −1.4 → 1.96 · 상한 1 / a = 0.5 보다 η 가 커서 부호를 바꾸며 멀어진다
      </>
    }
  />
)

const PauseTorque = () => (
  <PauseWrite
    question="어떤 servo 에서 (전류 1 A, torque 2 N·m), (전류 2 A, torque 3.6 N·m) 를 쟀다. 원점을 지나는 직선 τ = kI 로 맞춘 k 는?"
    answer={
      <>
        k = (1 × 2 + 2 × 3.6) ÷ (1² + 2²) = 9.2 ÷ 5 = 1.84 N·m/A
        <br />
        두 점의 비율 2 와 1.8 사이 · 전류가 큰 둘째 점에 더 가깝다
      </>
    }
  />
)

export function LinearRegression() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        residuals: Residuals,
        outlier: Outlier,
        'pause-mse': PauseMse,
        gradient: Gradient,
        descent: Descent,
        'pause-step': PauseStep,
        lr: LearningRate,
        scale: Scale,
        'pause-lr': PauseLr,
        overfit: Overfit,
        robot: Robot,
        'pause-torque': PauseTorque,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
