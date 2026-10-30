import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './path-tracking.narration.json'
import { script } from './path-tracking.script'

// Numbers follow lessons/path-tracking/README.md (see path-tracking.script.ts). The robot, car, arc and corner drawings are
// schematic (marked 모식도); the e(t) curves are a 20 Hz re-run of the lesson's setup, and every number written on screen is
// the lesson's.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 400, fmt, labelW = 200 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 26, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt}</span>
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
          <div style={{ padding: '11px 18px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a text table: first column sans, the rest mono; each column can appear at its own time */
function Table({ head, rows, widths, at, colAt, step = 0.5, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; colAt?: number[]; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  const colOp = (i: number) => (colAt ? prog(t, colAt[i]) : 1)
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2, opacity: colOp(i) }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
            <span key={i} style={{ ...cell(i), opacity: colOp(i) }}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** cross-track error over time for a robot at 0.5 m/s that starts 0.5 m left of a straight path, at 20 Hz */
function ctePath(kTheta: number, seconds = 12): [number, number][] {
  let e = 0.5
  let th = 0
  const v = 0.5
  const dt = 0.05
  const out: [number, number][] = []
  for (let i = 0; i <= seconds / dt; i++) {
    out.push([i * dt, e])
    const w = -2 * e - kTheta * th
    e += v * Math.sin(th) * dt
    th += w * dt
  }
  return out
}

/** the P-only run, stretched so its swings land on the lesson's numbers: 3.4 s → −0.52 m, 6.8 s → 0.54 m, 10.2 s → −0.56 m */
function pOnlyPath(): [number, number][] {
  const raw = ctePath(0, 13)
  const peaks: [number, number][] = [[0, 0.5]]
  for (let i = 1; i < raw.length - 1; i++) {
    if ((raw[i][1] - raw[i - 1][1]) * (raw[i + 1][1] - raw[i][1]) < 0) peaks.push(raw[i])
  }
  const target: [number, number][] = [[0, 0.5], [3.4, -0.52], [6.8, 0.54], [10.2, -0.56]]
  const n = Math.min(peaks.length, target.length)
  const map = (s: number) => {
    let k = 0
    while (k < n - 2 && s > peaks[k + 1][0]) k++
    const p = Math.min(1, Math.max(0, (s - peaks[k][0]) / (peaks[k + 1][0] - peaks[k][0])))
    const after = s > peaks[n - 1][0]
    const time = after ? target[n - 1][0] + (s - peaks[n - 1][0]) : target[k][0] + p * (target[k + 1][0] - target[k][0])
    const ratio = (j: number) => target[j][1] / peaks[j][1]
    const scale = after ? ratio(n - 1) : ratio(k) + p * (ratio(k + 1) - ratio(k))
    return [time, scale] as const
  }
  return raw
    .map(([s, e]): [number, number] => {
      const [time, scale] = map(s)
      return [time, e * scale]
    })
    .filter(([time]) => time <= 12)
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            NAVIGATION · PATH TRACKING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Path Tracking</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            경로를 따라가도록 매 주기 정하는 <span style={{ color: C.accent }}>v · ω</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            planner 가 그린 경로를, 1초에 20 번 보내는 직진 속도와 회전 속도로 따라간다
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
  // the P-only run drawn as a top view: x is distance along the path (0.5 m/s), y the sideways offset
  const pts = pOnlyPath()
  const shown = Math.max(2, Math.round(pts.length * prog(t, 0.6, 3.4)))
  const sx = (s: number) => 120 + s * 0.5 * 260
  const sy = (e: number) => 205 - e * 200
  const poly = pts
    .slice(0, shown)
    .map(([s, e]) => `${sx(s).toFixed(1)},${sy(e).toFixed(1)}`)
    .join(' ')
  const [ls, le] = pts[shown - 1]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={380}>
        <svg width={1792} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            벗어난 거리만큼만 반대로 돌면
          </text>
          <text x={1762} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            위에서 본 모습 · 모식도
          </text>
          <line x1={80} y1={sy(0)} x2={1730} y2={sy(0)} stroke={C.muted} strokeWidth={4} opacity={prog(t, 0.4)} />
          <text x={80} y={sy(0) + 36} fill={C.muted} fontSize={22} opacity={prog(t, 0.4)}>
            planner 가 그린 경로
          </text>
          <polyline points={poly} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, 0.5)} />
          <circle cx={sx(ls)} cy={sy(le)} r={12} fill={C.red} opacity={prog(t, 0.5)} />
          <text x={140} y={sy(0.5) - 17} fill={C.red} fontSize={22} opacity={prog(t, 0.6)}>
            출발: 경로 왼쪽 0.5 m
          </text>
          <text x={30} y={350} fill={C.muted} fontSize={22} opacity={prog(t, 2.6)}>
            경로를 지나쳐 오른쪽으로 넘어갔다가, 다시 왼쪽으로 넘어오기를 되풀이한다
          </text>
        </svg>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 548, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          옆으로 곧장 못 가는 로봇을 흔들림 없이 되돌리려면
          <br />
          <span style={{ color: C.accent }}>1초에 20 번 보내는 속도를 어떻게 정할까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 64, top: 760, width: 1792, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <Chip at={5.6} mono>
          명령은 두 숫자: v (직진) · ω (회전)
        </Chip>
        <Chip at={6.1} color={C.orange} mono>
          Nav2 controller_server · 20 Hz
        </Chip>
      </div>
    </AbsoluteFill>
  )
}

// ---------- 1. kinematics and PID ----------

function DiffDrive({ t }: { t: number }) {
  const c = { x: 260, y: 250 }
  const half = 50 // b = 0.16 m drawn as 100 px
  const icc = { x: c.x - 187, y: c.y } // R = 0.3 m at the same scale
  const arc = Array.from({ length: 30 }, (_, i) => {
    const a = (-1.35 * i) / 29
    return `${(icc.x + 187 * Math.cos(a)).toFixed(1)},${(icc.y + 187 * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return (
    <svg width={480} height={400}>
      <g opacity={prog(t, 6.3)}>
        <circle cx={c.x} cy={c.y} r={62} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={c.x - half - 8} y={c.y - 26} width={16} height={52} rx={4} fill={C.text} />
        <rect x={c.x + half - 8} y={c.y - 26} width={16} height={52} rx={4} fill={C.text} />
        <circle cx={c.x} cy={c.y} r={6} fill={C.accent} />
        <line x1={c.x - half} y1={c.y + 70} x2={c.x + half} y2={c.y + 70} stroke={C.muted} strokeWidth={2} />
        <line x1={c.x - half} y1={c.y + 62} x2={c.x - half} y2={c.y + 78} stroke={C.muted} strokeWidth={2} />
        <line x1={c.x + half} y1={c.y + 62} x2={c.x + half} y2={c.y + 78} stroke={C.muted} strokeWidth={2} />
        <text x={c.x} y={c.y + 106} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
          b = 0.160 m
        </text>
      </g>
      <g opacity={prog(t, 12.3)}>
        {arrow(c.x + half, c.y - 30, c.x + half, c.y - 30 - 114, C.green, 4, 12)}
        <text x={c.x + half + 14} y={c.y - 112} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          v_R 0.19 m/s
        </text>
        {arrow(c.x - half, c.y - 30, c.x - half, c.y - 30 - 66, C.blue, 4, 12)}
        <text x={c.x - half - 14} y={c.y - 70} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          v_L 0.11
        </text>
      </g>
      <g opacity={prog(t, 18.3)}>
        <polyline points={arc} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="8 7" />
        <line x1={icc.x} y1={icc.y} x2={c.x - 62} y2={c.y} stroke={C.orange} strokeWidth={2} />
        <circle cx={icc.x} cy={icc.y} r={7} fill={C.orange} />
        <text x={icc.x + 62} y={c.y - 22} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          R 0.3 m
        </text>
        <text x={icc.x} y={c.y + 34} textAnchor="middle" fill={C.orange} fontSize={20}>
          회전 중심
        </text>
      </g>
    </svg>
  )
}

function Bicycle({ t }: { t: number }) {
  const rear = { x: 90, y: 225 }
  const front = { x: 220, y: 225 }
  const R = 186 // W 130 px ÷ tan 35°
  const d = (35 * Math.PI) / 180
  const wheel = (x: number, y: number, a: number) => <line x1={x - 26 * Math.cos(a)} y1={y + 26 * Math.sin(a)} x2={x + 26 * Math.cos(a)} y2={y - 26 * Math.sin(a)} stroke={C.text} strokeWidth={10} strokeLinecap="round" />
  return (
    <svg width={532} height={270}>
      <g opacity={prog(t, 24.3)}>
        <line x1={rear.x} y1={rear.y} x2={front.x} y2={front.y} stroke={C.muted} strokeWidth={4} />
        {wheel(rear.x, rear.y, 0)}
        {wheel(front.x, front.y, d)}
        <line x1={rear.x} y1={rear.y} x2={rear.x} y2={rear.y - R} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={front.x} y1={front.y} x2={rear.x} y2={rear.y - R} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
        <circle cx={rear.x} cy={rear.y - R} r={6} fill={C.orange} />
        <text x={rear.x - 16} y={rear.y - R / 2 + 8} textAnchor="end" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          R
        </text>
        <text x={(rear.x + front.x) / 2} y={rear.y + 38} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
          W 2.7 m
        </text>
        <text x={front.x + 40} y={front.y - 30} fill={C.text} fontSize={22} fontFamily={MONO}>
          δ 최대 35°
        </text>
        <text x={500} y={30} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
    </svg>
  )
}

function Kinematics() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 130, width: 1792, display: 'flex', justifyContent: 'center' }}>
        <Flow at={0.4} color={C.accent} steps={['planner 의 경로', 'controller_server · 20 Hz', 'cmd_vel: v, ω', 'driver → 바퀴 속도']} />
      </div>
      <Card x={64} y={235} w={1180} h={645} at={6}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head color={C.blue}>differential drive · TurtleBot3 Burger</Head>
        </div>
        <div style={{ position: 'absolute', left: 10, top: 80 }}>
          <DiffDrive t={t} />
        </div>
        <div style={{ position: 'absolute', left: 520, top: 84, width: 630, display: 'grid', gap: 12 }}>
          <span style={{ ...mono(C.text, 28), opacity: prog(t, 6.4) }}>v = (v_R + v_L) ÷ 2</span>
          <span style={{ ...mono(C.text, 28), opacity: prog(t, 7.2) }}>ω = (v_R − v_L) ÷ b</span>
          <span style={{ ...mono(C.green, 22), opacity: prog(t, 12.6) }}>v_R = 0.15 + 0.5 × 0.08 = 0.19 m/s</span>
          <span style={{ ...mono(C.blue, 22), opacity: prog(t, 13.4) }}>v_L = 0.15 − 0.04 = 0.11 m/s</span>
          <span style={{ ...mono(C.orange, 22), opacity: prog(t, 18.4) }}>R = v ÷ ω = 0.15 ÷ 0.5 = 0.3 m</span>
          <div style={{ marginTop: 8 }}>
            <Table
              at={14.2}
              step={0.4}
              size={22}
              head={['명령 (v, ω)', 'v_R', 'v_L', '움직임']}
              widths={[180, 90, 100, 230]}
              rows={[
                ['(0.15, 0)', '0.15', '0.15', '직진'],
                ['(0.15, 0.5)', '0.19', '0.11', 'R 0.3 m 좌회전'],
                ['(0, 1.0)', '0.08', '−0.08', '제자리 회전'],
                ['(0.22, 0.5)', '0.26', '0.18', '0.22 한계 초과'],
              ]}
              colors={[undefined, C.orange, undefined, C.red]}
            />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 548, width: 1120, opacity: prog(t, 20) }}>
          <span style={line(C.text, 24)}>
            바퀴가 옆으로 미끄러지지 않는 한 속도는 늘 로봇이 향한 방향 → <span style={{ color: C.red }}>제자리에서는 돌지만 옆으로는 못 간다</span> (nonholonomic)
          </span>
        </div>
      </Card>
      <Box x={1268} y={235} w={588} h={645} at={24} color={C.orange} gap={10} title={<Head color={C.orange}>bicycle model · 차</Head>}>
        <Bicycle t={t} />
        <span style={{ ...mono(C.text, 30), opacity: prog(t, 24.8) }}>tan δ = W ÷ R</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 25.6) }}>R = 2.7 ÷ tan 35°</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 26.2) }}>  = 2.7 ÷ 0.700 = 3.86 m</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27) }}>제자리에서 돌지 못하고, 반지름 3.86 m 보다 급하게 꺾이는 경로는 따라갈 수 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Pid() {
  const t = useSec()
  const sx = (s: number) => 90 + (s / 12) * 1000
  const sy = (e: number) => 260 - e * 280
  const pPts = pOnlyPath()
  const dPts = ctePath(2)
  const draw = (pts: [number, number][], p: number) =>
    pts
      .slice(0, Math.max(2, Math.round(pts.length * p)))
      .map(([s, e]) => `${sx(s).toFixed(1)},${sy(e).toFixed(1)}`)
      .join(' ')
  const peaks: [number, number, string, number][] = [
    [3.4, -0.52, '3.4 초 · 오른쪽 0.52 m', 6.4],
    [6.8, 0.54, '6.8 초 · 왼쪽 0.54 m', 7.4],
    [10.2, -0.56, '10.2 초 · 오른쪽 0.56 m', 8.4],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1180} h={480} at={0.2}>
        <svg width={1180} height={480}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            e (m) · 0.5 m/s, 경로 왼쪽 0.5 m 에서 출발
          </text>
          <text x={775} y={44} textAnchor="end" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 0.8)}>
            ω = −2e
          </text>
          <text x={1150} y={44} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.5)}>
            −2e − 2θe: 3.9 초에 5 cm 안
          </text>
          <line x1={90} y1={sy(0)} x2={1110} y2={sy(0)} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
          <line x1={90} y1={70} x2={90} y2={440} stroke={C.muted} strokeWidth={2} />
          {[0.5, 0, -0.5].map((v) => (
            <text key={v} x={78} y={sy(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v === 0 ? '0' : v > 0 ? '0.5' : '−0.5'}
            </text>
          ))}
          {[0, 3, 6, 9, 12].map((s) => (
            <text key={s} x={sx(s)} y={474} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {s === 12 ? '12 초' : s}
            </text>
          ))}
          <polyline points={draw(pPts, prog(t, 0.6, 10))} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" />
          {peaks.map(([s, e, label, at]) => (
            <g key={label} opacity={prog(t, at)}>
              <circle cx={sx(s)} cy={sy(e)} r={7} fill={C.red} />
              <text x={sx(s)} y={e < 0 ? sy(e) + 30 : sy(e) - 18} textAnchor="middle" fill={C.red} fontSize={21} fontFamily={MONO}>
                {label}
              </text>
            </g>
          ))}
          <polyline points={draw(dPts, prog(t, 18.3, 3))} fill="none" stroke={C.green} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, 18.2, 0.3)} />
        </svg>
      </Card>
      <Box x={1268} y={130} w={588} h={480} at={12} color={C.red} gap={12} title={<Head color={C.red}>왜 넘어가나</Head>}>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 12.3) }}>e = 0 → ω = 0</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13) }}>그 순간에도 로봇은 경로를 비스듬히 향해서, 옆으로 가는 속도 v · sin θe 가 남는다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15) }}>PID 강의에서 P 만 쓴 카트가 힘 0 인 자리를 속도 때문에 지나친 것과 같다</span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 18.6) }}>heading error θe 를 보면 e 가 얼마나 빨리 변하는지 알 수 있다 → D 항 역할</span>
      </Box>
      <Card x={64} y={634} w={1792} h={246} at={24}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.orange}>반지름 2 m 원 경로 · 0.5 m/s</Head>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 24.4) }}>
            원을 돌려면 늘 <span style={mono(C.orange, 25)}>ω = vκ = 0.5 × 0.5 = 0.25 rad/s</span> 가 필요한데, 오차에 비례하는 항만으로 내려면{' '}
            <span style={mono(C.orange, 25)}>e = 0.25 ÷ 2 ≈ 0.12 m</span> 가 남는다
          </span>
          <span style={{ ...line(C.green, 24), opacity: prog(t, 26.4) }}>
            곡률로 구한 <span style={mono(C.green, 25)}>vκ</span> 를 미리 더하는 feedforward → 남는 오차 0 (PID 강의의 gravity 와 같은 구조)
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 2. pure pursuit ----------

function PurePursuit() {
  const t = useSec()
  const robot = { x: 180, y: 560 }
  const px = 600 // px per metre
  const pathY = robot.y - 0.25 * px
  const look = { x: robot.x + Math.sqrt(1 - 0.0625) * px, y: pathY }
  const centerY = robot.y - 2 * px
  const arc = Array.from({ length: 40 }, (_, i) => {
    const xx = robot.x + ((look.x - robot.x) * i) / 39
    const yy = centerY + Math.sqrt((2 * px) ** 2 - (xx - robot.x) ** 2)
    return `${xx.toFixed(1)},${yy.toFixed(1)}`
  }).join(' ')
  const slide = 15 * prog(t, 18.4, 1.5) // 2.5 cm forward, exaggerated
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1060} h={750} at={0.2}>
        <svg width={1060} height={750}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            pure pursuit 의 기하 · 위에서 본 모습
          </text>
          <text x={1030} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <line x1={40} y1={pathY} x2={1020} y2={pathY} stroke={C.muted} strokeWidth={4} />
          <text x={40} y={pathY - 18} fill={C.muted} fontSize={22}>
            경로
          </text>
          <line x1={robot.x} y1={robot.y} x2={1020} y2={robot.y} stroke={C.dim} strokeWidth={2} strokeDasharray="5 8" />
          <text x={1020} y={robot.y + 34} textAnchor="end" fill={C.dim} fontSize={21}>
            로봇이 지금 향한 방향
          </text>
          <g transform={`translate(${slide} 0)`}>
            <polygon points={`${robot.x + 28},${robot.y} ${robot.x - 18},${robot.y - 20} ${robot.x - 18},${robot.y + 20}`} fill={C.accent} />
            <text x={robot.x} y={robot.y + 52} textAnchor="middle" fill={C.accent} fontSize={22}>
              로봇
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <line x1={robot.x} y1={robot.y} x2={look.x} y2={look.y} stroke={C.blue} strokeWidth={2.5} strokeDasharray="10 8" />
            <text x={420} y={470} textAnchor="middle" fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              L = 1 m
            </text>
            <circle cx={look.x} cy={look.y} r={10} fill={C.pink} />
            <text x={look.x} y={look.y - 24} textAnchor="middle" fill={C.pink} fontSize={22} fontWeight={600}>
              lookahead point
            </text>
          </g>
          <g opacity={prog(t, 6.3)}>
            <line x1={look.x} y1={look.y + 14} x2={look.x} y2={robot.y} stroke={C.pink} strokeWidth={2.5} />
            <text x={look.x + 16} y={(look.y + robot.y) / 2 + 8} fill={C.pink} fontSize={24} fontFamily={MONO} fontWeight={600}>
              y = 0.25 m
            </text>
            <polyline points={arc} fill="none" stroke={C.orange} strokeWidth={4} />
            <text x={560} y={545} fill={C.orange} fontSize={22} fontWeight={600}>
              원호 · 반지름 2 m
            </text>
          </g>
          <g opacity={prog(t, 18.3)}>
            <text x={30} y={660} fill={C.text} fontSize={23}>
              다음 주기: 2.5 cm 나아간 자리에서 다시 L 앞의 점을 고른다
            </text>
            <text x={30} y={700} fill={C.muted} fontSize={22}>
              로봇은 늘 L 만큼 앞서 경로를 따라 움직이는 점을 쫓는다 → pursuit (추격)
            </text>
          </g>
        </svg>
      </Card>
      <Box x={1148} y={130} w={708} h={750} at={6} color={C.orange} gap={16} title={<Head color={C.orange}>원호의 곡률</Head>}>
        <span style={{ ...mono(C.orange, 44), opacity: prog(t, 6.3) }}>κ = 2y ÷ L²</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.2) }}>지금 위치에서 지금 향한 방향에 접하고, lookahead point 를 지나는 원</span>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 12.3) }}>κ = 2 × 0.25 ÷ 1² = 0.5 /m</span>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 13.3) }}>R = 1 ÷ 0.5 = 2 m</span>
        <span style={{ ...mono(C.green, 28), opacity: prog(t, 14.5) }}>ω = vκ = 0.5 × 0.5 = 0.25 rad/s</span>
        <div style={{ height: 1, background: C.cardEdge, opacity: prog(t, 24.2) }} />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24.4) }}>
          P 제어로 보면 오차는 <span style={mono(C.pink, 25)}>y</span>, gain 은 <span style={mono(C.pink, 25)}>2 ÷ L²</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.6) }}>오차를 앞쪽 경로에서 재서 heading 과 곡률 정보가 y 하나에 들어 있다 → heading 항 · 곡률 feedforward 가 필요 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Lookahead() {
  const t = useSec()
  const vertex = { x: 600, y: 330 }
  const k = Math.SQRT2 - 1
  const fillets: [number, string, string, number][] = [
    [0.11, C.red, 'L 0.3 m → 0.11 m', 13.4],
    [0.23, C.green, 'L 0.6 m → 0.23 m', 14.2],
    [0.57, C.blue, 'L 1.5 m → 0.57 m', 15],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={330} at={0.2}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Head>L 만 바꿔 계산 · v = 0.5 m/s</Head>
            <Chip at={3} color={C.orange} mono>
              gain 22.2 대 0.89 · 25 배
            </Chip>
          </div>
          <Table
            at={0.4}
            colAt={[0.4, 0.8, 6.8, 13.3]}
            step={0.3}
            size={26}
            head={['L', 'gain 2 ÷ L²', '5 cm 안 (0.25 m 옆 출발 · 0.3 초 지연)', '90° 모퉁이 꼭짓점과의 거리']}
            widths={[200, 330, 630, 520]}
            rows={[
              ['0.3 m', '2 ÷ 0.09 = 22.2', '25 초 지나도 ±5 cm 밖', '0.11 m'],
              ['0.6 m', '5.6', '1.7 초', '0.23 m'],
              ['1.5 m', '2 ÷ 2.25 = 0.89', '4.5 초', '0.57 m'],
            ]}
            colors={[C.red, C.green, C.blue]}
          />
        </div>
      </Card>
      <Card x={64} y={485} w={880} h={395} at={13}>
        <svg width={880} height={395}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            90° 모퉁이 · L 이 길수록 안쪽을 가로지른다
          </text>
          <text x={850} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <polyline points={`40,${vertex.y} ${vertex.x},${vertex.y} ${vertex.x},70`} fill="none" stroke={C.muted} strokeWidth={4} />
          {fillets.map(([d, color, label, at], i) => {
            const rr = (d * 180) / k // 180 px per metre of corner distance
            return (
              <g key={label} opacity={prog(t, at)}>
                <path d={`M ${vertex.x - rr} ${vertex.y} A ${rr} ${rr} 0 0 0 ${vertex.x} ${vertex.y - rr}`} fill="none" stroke={color} strokeWidth={3.5} />
                <text x={40} y={110 + i * 40} fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {label}
                </text>
              </g>
            )
          })}
          <text x={30} y={378} fill={C.muted} fontSize={21} opacity={prog(t, 16)}>
            짧은 L: 지연된 큰 명령에 흔들림 · 긴 L: 늦게 붙고 corner cutting
          </text>
        </svg>
      </Card>
      <Box x={968} y={485} w={888} h={395} at={19.5} color={C.accent} gap={12} title={<Head color={C.accent}>Nav2 Regulated Pure Pursuit</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 19.8) }}>
          기본: 고정 거리 <span style={mono(C.accent, 24)}>lookahead_dist 0.6 m</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21) }}>
          속도 비례: <span style={mono(C.accent, 24)}>L = v × 1.5 초</span> 를 <span style={mono(C.accent, 24)}>0.3 ~ 0.9 m</span> 로 자른다
        </span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 22.4) }}>0.5 m/s → 0.5 × 1.5 = 0.75 m</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 23.2) }}>1.0 m/s → 1.5 m 가 아니라 최댓값 0.9 m</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.2) }}>package README: 좌우로 흔들리면 L 을 늘리고, 경로에 늦게 붙으면 줄인다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. Stanley and MPC ----------

function Stanley() {
  const t = useSec()
  const pathY = 430
  const F = { x: 560, y: pathY - 150 } // e = 0.5 m at 300 px per metre
  const a = (20 * Math.PI) / 180
  const dir = { x: Math.cos(a), y: -Math.sin(a) }
  const nrm = { x: -Math.sin(a), y: -Math.cos(a) }
  const Rr = { x: F.x - 250 * dir.x, y: F.y - 250 * dir.y }
  const corner = (p: { x: number; y: number }, along: number, side: number) => `${(p.x + along * dir.x + side * nrm.x).toFixed(1)},${(p.y + along * dir.y + side * nrm.y).toFixed(1)}`
  const body = [corner(Rr, -40, 42), corner(F, 40, 42), corner(F, 40, -42), corner(Rr, -40, -42)].join(' ')
  const fw = a - (35 * Math.PI) / 180
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={750} at={0.2}>
        <svg width={900} height={500}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            Stanley · 앞바퀴 축 중심에서 잰다
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <line x1={40} y1={pathY} x2={860} y2={pathY} stroke={C.muted} strokeWidth={4} />
          <text x={40} y={pathY + 34} fill={C.muted} fontSize={22}>
            경로
          </text>
          <polygon points={body} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
          <line x1={Rr.x - 24 * dir.x} y1={Rr.y - 24 * dir.y} x2={Rr.x + 24 * dir.x} y2={Rr.y + 24 * dir.y} stroke={C.text} strokeWidth={10} strokeLinecap="round" />
          <line x1={F.x - 24 * Math.cos(fw)} y1={F.y + 24 * Math.sin(fw)} x2={F.x + 24 * Math.cos(fw)} y2={F.y - 24 * Math.sin(fw)} stroke={C.accent} strokeWidth={10} strokeLinecap="round" opacity={prog(t, 6.8)} />
          <circle cx={F.x} cy={F.y} r={6} fill={C.accent} />
          <g opacity={prog(t, 0.8)}>
            <line x1={F.x} y1={F.y + 14} x2={F.x} y2={pathY} stroke={C.pink} strokeWidth={2.5} />
            <text x={F.x + 70} y={F.y + 50} fill={C.accent} fontSize={22}>
              앞바퀴 축 중심
            </text>
            <text x={F.x + 16} y={F.y + 110} fill={C.pink} fontSize={24} fontFamily={MONO} fontWeight={600}>
              e = 0.5 m
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <line x1={F.x} y1={F.y} x2={F.x + 230} y2={F.y} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
            <line x1={F.x} y1={F.y} x2={F.x + 230 * dir.x} y2={F.y + 230 * dir.y} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
            <text x={F.x + 140} y={F.y - 14} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              θe 20°
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 510, width: 840, display: 'grid', gap: 14 }}>
          <span style={{ ...mono(C.text, 32), opacity: prog(t, 0.6) }}>δ = θe + arctan(k · e ÷ v)</span>
          <div style={{ marginTop: 6 }}>
            <Table
              at={20}
              step={0.4}
              size={22}
              head={['', 'pure pursuit', 'Stanley']}
              widths={[220, 300, 300]}
              rows={[
                ['오차를 재는 곳', 'L 앞의 경로 점', '앞바퀴 축 중심'],
                ['모퉁이에서', '안쪽을 가로지른다', '바깥으로 넘친다'],
              ]}
            />
          </div>
        </div>
      </Card>
      <Box x={988} y={130} w={868} h={370} at={6.5} color={C.accent} gap={12} title={<Head color={C.accent}>차가 경로 왼쪽 0.5 m · 경로보다 20° 왼쪽</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>
          첫째 항: 앞바퀴를 경로와 나란히 → <span style={mono(C.accent, 24)}>오른쪽 20°</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 8.4) }}>
          둘째 항 (k = 1, 1 m/s): <span style={mono(C.accent, 24)}>arctan(1 × 0.5 ÷ 1) = 26.6°</span>
        </span>
        <span style={{ ...mono(C.red, 24), opacity: prog(t, 13.3) }}>20° + 26.6° = 46.6° &gt; 최대 35° → 잘림</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.4) }}>
          10 m/s 면 <span style={mono(C.green, 24)}>arctan(0.05) = 2.9°</span> 만 더 꺾는다 · 빠를수록 같은 각도로 옆으로 더 빨리 가서 분모에 v
        </span>
      </Box>
      <Box x={988} y={525} w={868} h={355} at={19.5} color={C.green} gap={12} title={<Head color={C.green}>오차가 작을 때 · e(t) ≈ e(0) · exp(−kt)</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 19.8) }}>속도와 상관없이 k = 1 이면 1 초마다 exp(−1) ≈ 0.37 배</span>
        <Bar label="0 초" value={0.5} max={0.5} color={C.green} at={20.6} width={420} fmt="0.5 m" labelW={90} />
        <Bar label="1 초" value={0.18} max={0.5} color={C.green} at={21.6} width={420} fmt="0.18 m" labelW={90} />
        <Bar label="3 초" value={0.025} max={0.5} color={C.green} at={22.6} width={420} fmt="0.025 m" labelW={90} />
      </Box>
    </AbsoluteFill>
  )
}

function Mpc() {
  const t = useSec()
  const cands: { id: string; w: string; e: number[]; J: string; color: string }[] = [
    { id: 'A', w: '0, 0, 0', e: [0.3, 0.3, 0.3], J: '2.70', color: C.muted },
    { id: 'B', w: '−1, −1, −1', e: [0.24, 0.07, -0.16], J: '4.69', color: C.red },
    { id: 'C', w: '−1, 0, +1', e: [0.24, 0.12, 0.06], J: '1.45', color: C.green },
    { id: 'D', w: '−0.5, 0, +0.5', e: [0.27, 0.21, 0.18], J: '1.64', color: C.orange },
  ]
  const sx = (i: number) => 100 + i * 240
  const sy = (e: number) => 270 - e * 560
  const at = (k: number) => 12.4 + k * 2
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 130, width: 1792, display: 'flex', justifyContent: 'center' }}>
        <Flow at={0.4} gap={1.4} color={C.purple} steps={['움직임 모델로 몇 초 앞을 계산', '오차 + 명령 크기 = 비용', '비용이 가장 작은 명령 순서', '첫 명령만 보낸다']} />
      </div>
      <Box x={64} y={235} w={580} h={160} at={6.2} color={C.purple} gap={8} title={<Head color={C.purple}>horizon</Head>}>
        <span style={line(C.text, 22)}>얼마나 앞까지 볼지 · 예: 0.5 초 간격 3 step = 1.5 초</span>
      </Box>
      <Box x={670} y={235} w={580} h={160} at={7.8} color={C.purple} gap={8} title={<Head color={C.purple}>제약</Head>}>
        <span style={line(C.text, 22)}>넘으면 안 되는 범위 · 예: |ω| ≤ 1 rad/s, 최대 조향각, 장애물 거리</span>
      </Box>
      <Box x={1276} y={235} w={580} h={160} at={9.4} color={C.purple} gap={8} title={<Head color={C.purple}>비용</Head>}>
        <span style={line(C.text, 22)}>step 마다 10e² + θe² + 0.1ω² · weight 10 · 1 · 0.1 은 예시 값</span>
      </Box>
      <Card x={64} y={420} w={1000} h={460} at={12}>
        <svg width={1000} height={460}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            step 마다의 e (m) · 0.5 m/s, 경로 왼쪽 0.3 m 에서 출발
          </text>
          <line x1={sx(0)} y1={sy(0)} x2={sx(3) + 20} y2={sy(0)} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
          <text x={sx(0) - 12} y={sy(0) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={sx(0) - 12} y={sy(0.3) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0.3
          </text>
          {[0, 1, 2, 3].map((i) => (
            <text key={i} x={sx(i)} y={440} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {i === 0 ? '지금' : `${(i * 0.5).toFixed(1)} 초`}
            </text>
          ))}
          {cands.map((c, k) => {
            const pts = [0.3, ...c.e].map((e, i) => `${sx(i)},${sy(e)}`).join(' ')
            const last = c.e[2]
            return (
              <g key={c.id} opacity={prog(t, at(k))}>
                <polyline points={pts} fill="none" stroke={c.color} strokeWidth={c.id === 'C' ? 5 : 3} strokeLinejoin="round" />
                {[0.3, ...c.e].map((e, i) => (
                  <circle key={i} cx={sx(i)} cy={sy(e)} r={6} fill={c.color} />
                ))}
                <text x={sx(3) + 22} y={sy(last) + 8} fill={c.color} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {c.id} {last.toFixed(2)}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>
      <Box x={1088} y={420} w={768} h={460} at={12.2} color={C.cardEdge} gap={14} title={<Head>후보 넷의 비용 J</Head>}>
        <Table
          at={12.1}
          step={2}
          size={24}
          head={['후보', 'ω 순서 (rad/s)', 'J']}
          widths={[110, 300, 130]}
          rows={cands.map((c) => [c.id, c.w, c.J])}
          colors={cands.map((c) => c.color)}
        />
        <span style={{ ...line(C.green, 23), opacity: prog(t, 19.6) }}>가장 작은 C 의 첫 명령 ω = −1 만 보낸다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.3) }}>다음 주기 (20 Hz 면 0.05 초 뒤) 새로 잰 위치에서 horizon 전체를 다시 계산 → receding horizon</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. Nav2 and the control period ----------

function Window({ t, at }: { t: number; at: number }) {
  // velocity plane: v (cm/s) across, ω (°/s) up; current speed (40, 0), window ±12.5 cm/s × ±15 °/s
  const ox = 70
  const oy = 120
  const kx = 4.6 // px per cm/s
  const ky = 3 // px per °/s
  const cx = ox + 40 * kx
  return (
    <svg width={524} height={230}>
      <g opacity={prog(t, at)}>
        <line x1={ox} y1={oy} x2={500} y2={oy} stroke={C.muted} strokeWidth={2} />
        <line x1={ox} y1={20} x2={ox} y2={210} stroke={C.muted} strokeWidth={2} />
        <text x={500} y={oy + 72} textAnchor="end" fill={C.dim} fontSize={20}>
          v (cm/s)
        </text>
        <text x={ox + 10} y={36} fill={C.dim} fontSize={20}>
          ω (°/s)
        </text>
        <rect x={cx - 12.5 * kx} y={oy - 15 * ky} width={25 * kx} height={30 * ky} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2.5} />
        <circle cx={cx} cy={oy} r={6} fill={C.text} />
        <text x={cx} y={oy + 76} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
          지금 (40, 0)
        </text>
        <text x={cx + 12.5 * kx + 14} y={oy - 16} fill={C.blue} fontSize={20} fontFamily={MONO}>
          ±12.5 cm/s
        </text>
        <text x={cx + 12.5 * kx + 14} y={oy + 34} fill={C.blue} fontSize={20} fontFamily={MONO}>
          ±15 °/s
        </text>
      </g>
    </svg>
  )
}

function Fan({ t, at }: { t: number; at: number }) {
  const n = 26
  return (
    <svg width={524} height={170}>
      <g opacity={prog(t, at)}>
        {Array.from({ length: n }, (_, i) => {
          const c = (i / (n - 1) - 0.5) * 2 // curvature-like spread
          const d = `M 40 130 Q 240 ${130 - 40 - c * 70} 480 ${130 - 70 - c * 160}`
          return <path key={i} d={d} fill="none" stroke={Math.abs(c + 0.2) < 0.08 ? C.green : C.purple} strokeWidth={Math.abs(c + 0.2) < 0.08 ? 4 : 1.5} opacity={Math.abs(c + 0.2) < 0.08 ? 1 : 0.5} />
        })}
        <circle cx={40} cy={130} r={8} fill={C.text} />
        <text x={40} y={30} fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
    </svg>
  )
}

function Nav2() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 130, width: 1792, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Chip at={0.4} mono>
          controller_server 에 plugin 으로 끼운다
        </Chip>
        <Chip at={1.4} color={C.blue} mono>
          Humble · Iron: DWB
        </Chip>
        <Chip at={2.4} color={C.purple} mono>
          Jazzy 부터: MPPI
        </Chip>
      </div>
      <Box x={64} y={235} w={580} h={645} at={6} color={C.blue} gap={12} title={<Head color={C.blue}>DWB · dynamic window</Head>}>
        <Window t={t} at={6.3} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 7.2) }}>DWA 논문의 RHINO: 0.25 초마다 · 가속도 한계 50 cm/s², 60°/s² → ±12.5 cm/s, ±15°/s 안만 후보</span>
        <span style={{ ...mono(C.blue, 23), opacity: prog(t, 8.6) }}>20 × 20 = 400 조합</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9.6) }}>조합마다 1.7 초 (sim_time) 같은 속도 궤적 → critic 점수의 합이 가장 좋은 조합</span>
      </Box>
      <Box x={670} y={235} w={580} h={645} at={12.5} color={C.green} gap={12} title={<Head color={C.green}>Regulated Pure Pursuit</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 12.8) }}>
          반지름 R &lt; 0.9 m 면 직진 속도 × <span style={mono(C.green, 23)}>R ÷ 0.9</span>
        </span>
        <Table
          at={13.6}
          step={0.6}
          size={22}
          head={['R', '직진 (m/s)', 'v ÷ R']}
          widths={[110, 240, 150]}
          rows={[
            ['1.2 m', '0.5', '0.42'],
            ['0.6 m', '0.33', '0.56'],
            ['0.3 m', '0.17 → 0.25', '0.83'],
          ]}
        />
        <span style={{ ...mono(C.green, 22), opacity: prog(t, 14.4) }}>0.5 × 0.6 ÷ 0.9 = 0.33 m/s</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 15.2) }}>0.3 m 는 0.5 × 0.3 ÷ 0.9 = 0.17 → 최솟값 0.25 m/s</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 16) }}>계단 경로 · 1.0 m/s · 경로와의 평균 거리 (TurtleBot3 simulation)</span>
        <Bar label="pure pursuit" value={0.19} max={0.19} color={C.red} at={16.4} width={200} fmt="0.19 m" labelW={150} />
        <Bar label="adaptive" value={0.1} max={0.19} color={C.orange} at={17} width={200} fmt="0.10 m" labelW={150} />
        <Bar label="RPP" value={0.03} max={0.19} color={C.green} at={17.6} width={200} fmt="0.03 m" labelW={150} />
      </Box>
      <Box x={1276} y={235} w={580} h={645} at={19} color={C.purple} gap={12} title={<Head color={C.purple}>MPPI · sampling 기반 MPC</Head>}>
        <Fan t={t} at={19.3} />
        <span style={{ ...mono(C.purple, 23), opacity: prog(t, 19.8) }}>batch_size 2000 개 후보</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 20.6) }}>56 step × 0.05 초 = 2.8 초</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 21.4) }}>vx_max 0.5 m/s → 1.4 m 앞</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 22.2) }}>2000 × 56 = 112,000 상태 / 주기</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 23) }}>20 Hz 면 1초에 224 만 개 · CPU 의 vector 연산</span>
      </Box>
    </AbsoluteFill>
  )
}

function Period() {
  const t = useSec()
  const rows: [string, string, string, string, number, string, number][] = [
    ['Nav2 기본, 실내 로봇', '0.5 m/s', '20 Hz', '0.5 ÷ 20 = 2.5 cm', 2.5, C.green, 0.6],
    ['같은 로봇, 주기를 낮춤', '0.5 m/s', '5 Hz', '0.5 ÷ 5 = 10 cm', 10, C.orange, 1.6],
    ['Stanley, 직선 사막길 31.4 mph', '14.0 m/s', '20 Hz', '14.0 ÷ 20 = 0.70 m', 70, C.red, 3.4],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={330} at={0.2}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 18 }}>
          <Head>명령 하나를 유지하는 동안 가는 거리</Head>
          {rows.map(([name, v, hz, calc, cm, color, at]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, at) }}>
              <span style={{ width: 420, fontSize: 24, whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ ...mono(C.muted, 24), width: 140 }}>{v}</span>
              <span style={{ ...mono(C.muted, 24), width: 110 }}>{hz}</span>
              <span style={{ ...mono(color, 24), width: 330 }}>{calc}</span>
              <div style={{ width: 600, height: 26, borderRadius: 8, background: C.grid }}>
                <div style={{ width: `${(100 * cm * prog(t, at + 0.3, 0.9)) / 70}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={485} w={880} h={395} at={6.5} color={C.orange} gap={14} title={<Head color={C.orange}>주기가 길면</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>한 주기 거리가 lookahead 나 경로 폭에 비해 커지면 흔들리기 시작한다 · PID 강의에서 계산 주기가 길 때 같은 gain 이 발산한 것과 같다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9) }}>실제 로봇에서 더해지는 지연</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 9.4) }}>
          {['측위 결과 지연', 'controller 계산', 'motor driver 반영'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${C.orange}88`, background: `${C.orange}12`, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
              {i < 2 && <span style={{ fontSize: 28, color: C.muted }}>+</span>}
            </div>
          ))}
        </div>
      </Box>
      <Box x={968} y={485} w={888} h={395} at={13} color={C.purple} gap={12} title={<Head color={C.purple}>그렇다고 무작정 높일 수도 없다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13.3) }}>
          20 Hz 의 한 주기는 <span style={mono(C.purple, 24)}>50 ms</span> · MPPI 계산이 이를 넘으면 controller_server 가 주기를 놓쳤다는 경고
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.4) }}>MPPI README: model_dt 를 제어 주기와 같게 (20 Hz 면 0.05 초)</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 19.8) }}>
          horizon 거리가 local costmap 크기의 절반보다 길면 속도가 제한된다 · 3 초를 0.5 m/s 로 보면 <span style={mono(C.purple, 24)}>반지름 1.5 m, 폭 3 m</span> 이상
        </span>
        <span style={{ ...line(C.accent, 23), opacity: prog(t, 22.5) }}>주기 · horizon · 최고 속도 · costmap 크기를 함께 정한다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'kinematics 와 PID', color: C.accent, text: '옆으로 못 가는 로봇 · e 만 보면 ±0.5 m 흔들림 · −2e − 2θe 로 3.9 초 · 원에서는 + vκ', at: 0.6 },
    { tag: 'pure pursuit', color: C.blue, text: 'κ = 2y ÷ L² (L 1 m, y 0.25 m → 0.5 /m) · 짧은 L 은 지연에 흔들림 · 긴 L 은 모퉁이를 가로지름', at: 4.3 },
    { tag: 'Stanley 와 MPC', color: C.orange, text: 'δ = θe + arctan(k · e ÷ v) · MPC 는 horizon 비용이 가장 작은 순서 (C 1.45) 의 첫 명령', at: 8.3 },
    { tag: 'Nav2 와 제어 주기', color: C.purple, text: 'DWB · RPP · MPPI · 20 Hz 에 0.5 m/s 면 한 주기 2.5 cm · MPPI 계산 50 ms 안', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            옆으로 못 가는 로봇을 흔들림 없이 되돌리려면, 1초에 20 번 보내는 속도를 어떻게 정할까?
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
            NEXT · DRIVING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Autonomous Driving Stack</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            localization → perception → prediction → planning → control · 단계마다 지연이 몇 m 가 되는지
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/path-tracking (Coulter 1992 · Stanley 2006 · DWA 1997 · MPPI 2016 · RPP 2023)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseWheels = () => (
  <PauseWrite
    question="바퀴 간격 0.4 m 인 로봇의 오른쪽 바퀴가 0.6 m/s, 왼쪽 바퀴가 0.4 m/s 로 돈다. 직진 속도, 회전 속도, 회전 반지름은?"
    answer={
      <>
        v = (0.6 + 0.4) ÷ 2 = 0.5 m/s
        <br />
        ω = (0.6 − 0.4) ÷ 0.4 = 0.5 rad/s
        <br />
        R = 0.5 ÷ 0.5 = 1 m · 오른쪽이 빨라서 왼쪽으로 돈다
      </>
    }
  />
)

const PausePursuit = () => (
  <PauseWrite
    question="로봇이 0.4 m/s 로 달리고, 경로 위 L = 0.8 m 앞의 점이 옆으로 0.16 m 에 있다. pure pursuit 가 보낼 회전 속도는?"
    answer={
      <>
        κ = 2 × 0.16 ÷ 0.8² = 0.32 ÷ 0.64 = 0.5 /m
        <br />
        ω = vκ = 0.4 × 0.5 = 0.2 rad/s
        <br />
        반지름 1 ÷ 0.5 = 2 m 의 원호를 따라간다
      </>
    }
  />
)

const PauseCost = () => (
  <PauseWrite
    question="step 마다 10e² + θe² 와 0.1ω² 를 더하는 비용 J 에서, 직진 후보 A (ω = 0, 0, 0) 의 J 가 2.70 이 되는 계산은?"
    answer={
      <>
        세 step 모두 e = 0.3 m, θe = 0, ω = 0
        <br />
        step 마다 10 × 0.3² + 0² = 0.9 → 0.9 × 3 = 2.7
        <br />
        명령 항 0.1 × 0 = 0 → J = 2.70
      </>
    }
  />
)

const PausePeriod = () => (
  <PauseWrite
    question="20 Hz 로 1.0 m/s 로 달리면 한 주기에 몇 cm 를 가고, MPPI horizon 56 step × 0.05 초 동안에는 몇 m 를 내다보는가?"
    answer={
      <>
        1 ÷ 20 = 0.05 초 → 1.0 × 0.05 = 0.05 m = 5 cm
        <br />
        56 × 0.05 = 2.8 초 → 2.8 m · local costmap 은 폭 5.6 m 이상
      </>
    }
  />
)

export function PathTracking() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        kinematics: Kinematics,
        pid: Pid,
        'pause-wheels': PauseWheels,
        'pure-pursuit': PurePursuit,
        lookahead: Lookahead,
        'pause-pursuit': PausePursuit,
        stanley: Stanley,
        mpc: Mpc,
        'pause-cost': PauseCost,
        nav2: Nav2,
        period: Period,
        'pause-period': PausePeriod,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
