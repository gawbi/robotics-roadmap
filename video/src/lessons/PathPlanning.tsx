import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './path-planning.narration.json'
import { script } from './path-planning.script'

// Numbers follow lessons/path-planning/README.md (see path-planning.script.ts). The 8 × 6 grid is the lesson's own
// grid-search figure (wall, S, G, expanded cells); the map, costmap and car drawings are schematic (marked 모식도).

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
        {children}
      </span>
    </Appear>
  )
}

function Bar({ label, value, max, color, at, width = 520, unit = '', labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {value}
        {unit}
      </span>
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

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
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

// ---------- the lesson's 8 × 6 grid (figures/grid-search.svg) ----------

const COLS = 8
const ROWS = 6
const WALL = new Set(['4,1', '4,2', '4,3', '4,4'])
const START: [number, number] = [1, 3]
const GOAL: [number, number] = [6, 3]
const PATH: [number, number][] = [[1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [6, 5], [6, 4], [6, 3]]
/** A*'s 17 expanded cells grouped by f (the lesson's table) */
const A_GROUPS: [number, [number, number][]][] = [
  [5, [[1, 3], [2, 3], [3, 3]]],
  [7, [[3, 2], [3, 4], [2, 2], [2, 4], [1, 2], [1, 4], [0, 3]]],
  [9, [[3, 1], [3, 5], [4, 5], [5, 5], [6, 5], [6, 4], [6, 3]]],
]

/** g of every free cell from S, moving up/down/left/right at cost 1 */
function bfs(): Record<string, number> {
  const g: Record<string, number> = { [`${START[0]},${START[1]}`]: 0 }
  const q: [number, number][] = [START]
  while (q.length) {
    const [x, y] = q.shift()!
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      const k = `${nx},${ny}`
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || WALL.has(k) || k in g) continue
      g[k] = g[`${x},${y}`] + 1
      q.push([nx, ny])
    }
  }
  return g
}
const G_OF = bfs()

/** the grid with its wall, S and G; `cell` decides how far each free cell has lit up and what it shows */
function Grid({ t, at, size, cell, pathAt, pathColor }: { t: number; at: number; size: number; cell: (x: number, y: number) => { p: number; color: string; text?: string } | null; pathAt: number; pathColor: string }) {
  const pts = PATH.map(([x, y]) => `${x * size + size / 2},${y * size + size / 2}`).join(' ')
  const pathLen = (PATH.length - 1) * size
  const pp = prog(t, pathAt, 1.4)
  return (
    <svg width={COLS * size + 4} height={ROWS * size + 4} style={{ opacity: prog(t, at) }}>
      <g transform="translate(2 2)">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const x = i % COLS
          const y = Math.floor(i / COLS)
          const k = `${x},${y}`
          if (WALL.has(k)) return <rect key={k} x={x * size} y={y * size} width={size} height={size} fill="#cbd5e1" stroke={C.cardEdge} strokeWidth={1.5} />
          const c = cell(x, y)
          return (
            <g key={k}>
              <rect x={x * size} y={y * size} width={size} height={size} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
              {c && <rect x={x * size + 1} y={y * size + 1} width={size - 2} height={size - 2} fill={c.color} opacity={0.32 * c.p} />}
              {c?.text && (
                <text x={x * size + size / 2} y={y * size + size / 2 + 9} fill={c.color} fontSize={26} fontFamily={MONO} fontWeight={600} textAnchor="middle" opacity={c.p}>
                  {c.text}
                </text>
              )}
            </g>
          )
        })}
        <polyline points={pts} fill="none" stroke={pathColor} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pp)} opacity={pp > 0 ? 0.9 : 0} />
        {[
          [START, 'S'],
          [GOAL, 'G'],
        ].map(([[x, y], name]) => (
          <g key={name as string}>
            <circle cx={(x as number) * size + size / 2} cy={(y as number) * size + size / 2} r={size * 0.3} fill={name === 'S' ? C.green : C.red} />
            <text x={(x as number) * size + size / 2} y={(y as number) * size + size / 2 + 9} fill={C.bg} fontSize={26} fontWeight={700} textAnchor="middle">
              {name as string}
            </text>
          </g>
        ))}
      </g>
    </svg>
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
            NAVIGATION · PATH PLANNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Path Planning</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            costmap 위에서 <span style={{ color: C.accent }}>가장 싼 경로</span> 찾기
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            벽에 닿지 않는 칸을 이어, 칸마다 적은 cost 의 합이 가장 작은 길을 찾는 방법
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
  const n = 20
  const s = 14
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={320}>
        <svg width={300} height={300} style={{ position: 'absolute', left: 40, top: 10, opacity: prog(t, 0.4) }}>
          {Array.from({ length: n * n }, (_, i) => {
            const x = i % n
            const y = Math.floor(i / n)
            const wall = x === 0 || y === 0 || x === n - 1 || y === n - 1 || (x === 9 && y < 13) || (y === 13 && x > 13)
            return <rect key={i} x={10 + x * s} y={10 + y * s} width={s} height={s} fill={wall ? C.muted : C.bg} stroke={C.cardEdge} strokeWidth={0.8} />
          })}
          <circle cx={10 + 3.5 * s} cy={10 + 16.5 * s} r={6} fill={C.green} />
          <circle cx={10 + 16.5 * s} cy={10 + 4.5 * s} r={6} fill={C.red} />
        </svg>
        <div style={{ position: 'absolute', left: 400, top: 34, width: 1340, display: 'grid', gap: 20 }}>
          <Label size={24} color={C.muted}>
            RViz 에서 목표를 찍으면, 로봇은 책상과 벽 사이로 선을 하나 그리고 출발한다 (지도는 모식도)
          </Label>
          <div style={{ display: 'flex', gap: 60, opacity: prog(t, 0.9) }}>
            <span style={mono(C.text, 34)}>50 m × 50 m 층</span>
            <span style={mono(C.blue, 34)}>한 칸 5 cm</span>
          </div>
          <div style={{ opacity: prog(t, 2) }}>
            <span style={mono(C.accent, 44)}>1000 × 1000 = 100만 칸</span>
          </div>
        </div>
      </Panel>
      <Appear at={4.5} style={{ position: 'absolute', left: 64, top: 488, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', textWrap: 'balance' }}>
          어느 칸을 이어야 벽에 닿지 않고 가장 짧게 갈까? <span style={{ color: C.accent }}>그것도 1초 안에</span>
        </div>
      </Appear>
      <Card x={330} y={660} w={1260} h={200} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 14, opacity: prog(t, 5.8) }}>
          <Label size={24} color={C.blue} weight={600}>
            ROS 2 의 navigation stack · Nav2
          </Label>
          <span style={line(C.text, 26)}>planner 가 경로를 1초마다 다시 계산한다</span>
          <span style={line(C.text, 26)}>Nav2 논문: Tiago 와 RB-1 이 사람 도움 없이 대학 건물을 37.4 mile(약 60 km) 달렸다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- S1: costmap ----------

const VALUES: [string, string, string, string][] = [
  ['0', 'FREE_SPACE', '장애물에서 충분히 멀다', C.green],
  ['1 ~ 252', '', '장애물에 가까울수록 크다', C.orange],
  ['253', 'INSCRIBED_INFLATED_OBSTACLE', '로봇 중심이 오면 몸이 닿는다', C.pink],
  ['254', 'LETHAL_OBSTACLE', '장애물이 있는 칸', C.red],
  ['255', 'NO_INFORMATION', '아직 관측하지 못한 칸', C.dim],
]

/** a 9 × 7 mini costmap; kind picks which layer it draws */
function MiniGrid({ x, y, s, kind, p }: { x: number; y: number; s: number; kind: 'static' | 'obstacle' | 'inflation' | 'master'; p: number }) {
  const isStatic = (cx: number, cy: number) => cx === 0 || cy === 0
  const isBox = (cx: number, cy: number) => cx >= 5 && cx <= 6 && cy >= 3 && cy <= 4
  const dist = (cx: number, cy: number) => {
    let d = 99
    for (let ox = 0; ox < 9; ox++) for (let oy = 0; oy < 7; oy++) if (isStatic(ox, oy) || isBox(ox, oy)) d = Math.min(d, Math.max(Math.abs(ox - cx), Math.abs(oy - cy)))
    return d
  }
  return (
    <g opacity={p}>
      {Array.from({ length: 63 }, (_, i) => {
        const cx = i % 9
        const cy = Math.floor(i / 9)
        const st = isStatic(cx, cy)
        const ob = isBox(cx, cy)
        const d = dist(cx, cy)
        let fill: string = C.bg
        let op = 1
        if (kind === 'static' && st) fill = C.muted
        if (kind === 'obstacle' && ob) fill = C.red
        if ((kind === 'inflation' || kind === 'master') && !st && !ob && d <= 2) {
          fill = C.orange
          op = d === 1 ? 0.75 : 0.35
        }
        if (kind === 'master' && st) fill = C.muted
        if (kind === 'master' && ob) fill = C.red
        return <rect key={i} x={x + cx * s} y={y + cy * s} width={s} height={s} fill={fill} fillOpacity={op} stroke={C.cardEdge} strokeWidth={1} />
      })}
    </g>
  )
}

function Layers() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={780} h={470} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12 }}>
          <Head>costmap 값 · 칸마다 0 ~ 255 (cost_values.hpp)</Head>
          {VALUES.map(([v, name, mean, color], i) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, i < 2 ? 1 + i * 0.6 : 6.8 + (i - 2) * 1.2) }}>
              <span style={{ ...mono(color, 28), width: 150, textAlign: 'right' }}>{v}</span>
              <div style={{ display: 'grid' }}>
                {name && <span style={mono(C.dim, 20)}>{name}</span>}
                <span style={line(C.text, 24)}>{mean}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={624} w={780} h={250} at={13.2} title={<Head color={C.red}>obstacle layer · LiDAR scan</Head>}>
        <span style={line(C.text, 24)}>빔이 끝난 칸은 254 로 표시한다 (marking, 2.5 m 안)</span>
        <span style={line(C.text, 24)}>빔이 지나간 칸은 비운다 (clearing, 3.0 m 까지)</span>
        <span style={line(C.muted, 24)}>사람이 지나가고 나면 그 자리가 다시 빈 칸이 된다</span>
      </Box>
      <Card x={874} y={130} w={982} h={744} at={13}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>layer 를 겹쳐 master costmap 하나로 (모식도)</Head>
        </div>
        <svg width={982} height={640} style={{ position: 'absolute', left: 0, top: 70 }}>
          {[
            ['static layer', C.muted, 'static', 13.4],
            ['obstacle layer', C.red, 'obstacle', 15],
            ['inflation layer', C.orange, 'inflation', 20.4],
          ].map(([name, color, kind, at], i) => (
            <g key={name as string} opacity={prog(t, at as number)}>
              <text x={60 + i * 320 + 90} y={34} fill={color as string} fontSize={24} fontWeight={600} textAnchor="middle">
                {name as string}
              </text>
              <MiniGrid x={60 + i * 320} y={52} s={20} kind={kind as 'static'} p={1} />
              {arrow(60 + i * 320 + 90, 204, 491 + (i - 1) * 90, 300, C.muted, 2.5, 11, prog(t, 21.5))}
            </g>
          ))}
          <text x={60} y={276} fill={C.muted} fontSize={22} opacity={prog(t, 21.8)}>
            칸마다 최댓값
          </text>
          <MiniGrid x={491 - 117} y={312} s={26} kind="master" p={prog(t, 22.2)} />
          <text x={491} y={530} fill={C.accent} fontSize={26} fontWeight={600} textAnchor="middle" opacity={prog(t, 22.2)}>
            master costmap
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 640, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Chip at={14} color={C.muted}>
            벽 254
          </Chip>
          <Chip at={15.5} color={C.red}>
            상자 254
          </Chip>
          <Chip at={20.6} color={C.orange}>
            둘레에 줄어드는 cost
          </Chip>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const K3: [number, number][] = [
  [0.3, 198],
  [0.4, 146],
  [0.5, 108],
  [0.6, 80],
  [0.7, 59],
]
const K10: [number, number][] = [
  [0.3, 113],
  [0.4, 41],
  [0.5, 15],
  [0.6, 5],
  [0.7, 2],
]

function Inflation() {
  const t = useSec()
  // plot: 0 ~ 0.8 m across, cost 0 ~ 260 up
  const X0 = 80
  const Y0 = 390
  const sx = (d: number) => X0 + d * 900
  const sy = (c: number) => Y0 - c * 1.3
  const curve = (k: number) => {
    const pts: string[] = []
    for (let d = 0.22; d <= 0.7001; d += 0.01) pts.push(`${sx(d).toFixed(1)},${sy(252 * Math.exp(-k * (d - 0.22))).toFixed(1)}`)
    return pts.join(' ')
  }
  const p3 = prog(t, 12.2, 1.2)
  const p10 = prog(t, 14, 1.2)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={500} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>장애물까지 거리 d 와 cost (robot radius r = 0.22 m)</Head>
        </div>
        <svg width={900} height={430} style={{ position: 'absolute', left: 0, top: 66 }}>
          <rect x={sx(0)} y={sy(253)} width={sx(0.22) - sx(0)} height={Y0 - sy(253)} fill={C.pink} opacity={0.18 * prog(t, 0.8)} />
          <text x={(sx(0) + sx(0.22)) / 2} y={sy(253) + 40} fill={C.pink} fontSize={24} fontFamily={MONO} fontWeight={600} textAnchor="middle" opacity={prog(t, 1)}>
            253
          </text>
          <text x={(sx(0) + sx(0.22)) / 2} y={sy(253) + 72} fill={C.pink} fontSize={20} textAnchor="middle" opacity={prog(t, 1)}>
            지나갈 수 없음
          </text>
          <line x1={X0} y1={Y0} x2={sx(0.8)} y2={Y0} stroke={C.muted} strokeWidth={2} />
          <line x1={X0} y1={Y0} x2={X0} y2={sy(260)} stroke={C.muted} strokeWidth={2} />
          {[0, 0.22, 0.4, 0.6, 0.7].map((d) => (
            <text key={d} x={sx(d)} y={Y0 + 30} fill={C.muted} fontSize={20} fontFamily={MONO} textAnchor="middle">
              {d}
            </text>
          ))}
          {[0, 100, 200].map((c) => (
            <text key={c} x={X0 - 12} y={sy(c) + 7} fill={C.muted} fontSize={20} fontFamily={MONO} textAnchor="end">
              {c}
            </text>
          ))}
          <text x={sx(0.8)} y={Y0 - 12} fill={C.dim} fontSize={20} textAnchor="end">
            d (m)
          </text>
          <g opacity={prog(t, 6.2)}>
            <line x1={sx(0.7)} y1={Y0} x2={sx(0.7)} y2={sy(250)} stroke={C.blue} strokeWidth={2} strokeDasharray="6 6" />
            <text x={sx(0.7) - 10} y={sy(236)} fill={C.blue} fontSize={20} fontFamily={MONO} textAnchor="end">
              inflation_radius 0.7
            </text>
          </g>
          <polyline points={curve(3)} fill="none" stroke={C.orange} strokeWidth={4} opacity={p3} />
          <polyline points={curve(10)} fill="none" stroke={C.red} strokeWidth={4} opacity={p10} />
          <text x={sx(0.45)} y={sy(126) - 22} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={p3}>
            k = 3
          </text>
          <text x={sx(0.4) + 10} y={sy(41) - 22} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={p10}>
            k = 10
          </text>
          <circle cx={sx(0.3)} cy={sy(198)} r={7} fill={C.orange} opacity={p3} />
          <circle cx={sx(0.3)} cy={sy(113)} r={7} fill={C.red} opacity={p10} />
        </svg>
      </Card>
      <Card x={994} y={130} w={862} h={500} at={6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 10 }}>
          <span style={mono(C.accent, 30)}>cost(d) = 252 × e^(−k(d − r))</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.6) }}>k = cost_scaling_factor · 클수록 빨리 줄어든다</span>
          <div style={{ display: 'flex', marginTop: 6, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, opacity: prog(t, 12) }}>
            <span style={{ width: 300, ...line(C.muted, 22) }}>장애물까지 거리</span>
            <span style={{ width: 200, ...line(C.orange, 22), textAlign: 'right' }}>k = 3</span>
            <span style={{ width: 200, ...line(C.red, 22), textAlign: 'right' }}>k = 10</span>
          </div>
          {[['0.22 m 이하', 253, 253] as [string, number, number], ...K3.map(([d, c], i): [string, number, number] => [`${d.toFixed(2)} m`, c, K10[i][1]])].map(([d, a, b], i) => (
            <div key={d} style={{ display: 'flex', opacity: prog(t, 12.3 + i * 0.4) }}>
              <span style={{ width: 300, ...mono(C.text, 24) }}>{d}</span>
              <span style={{ width: 200, ...mono(C.orange, 24), textAlign: 'right' }}>{a}</span>
              <span style={{ width: 200, ...mono(C.red, 24), textAlign: 'right' }}>{b}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={660} w={900} h={210} at={18.2} color={`${C.blue}88`} title={<Head color={C.blue}>NavFn: 칸을 지나는 비용 = 50 + 0.8c</Head>}>
        <span style={line(C.text, 24)}>빈 칸은 50 · 253 이상은 지나갈 수 없는 칸</span>
        <span style={mono(C.text, 26)}>벽에서 0.30 m: 50 + 0.8 × 198 = 208</span>
      </Box>
      <Box x={994} y={660} w={862} h={210} at={24.2} color={`${C.green}88`} title={<Head color={C.green}>폭 1.2 m 복도 한가운데 · 양쪽 벽에서 0.6 m</Head>}>
        <span style={mono(C.text, 26)}>cost 80 → 50 + 0.8 × 80 = 114</span>
        <span style={line(C.muted, 24)}>0.30 m 칸 208 의 절반쯤 → 경로가 통로 가운데로 난다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseInflation = () => (
  <PauseWrite
    question="robot radius 0.3 m, inflation_radius 1.0 m, cost_scaling_factor 3 이다. 벽에서 0.25 m 칸과 0.5 m 칸의 cost 는?"
    answer={
      <>
        0.25 m ≤ 0.3 m → 253 (지나갈 수 없음)
        <br />
        0.5 m: 252 × e^(−0.6) = 252 × 0.549 = 138.3 → 내림해서 138
      </>
    }
  />
)

// ---------- S2: Dijkstra and A* ----------

function Dijkstra() {
  const t = useSec()
  const size = 74
  const shown = (g: number) => prog(t, 1 + g * 0.55, 0.4)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={760} h={744} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>8 × 6 grid · 칸 숫자 = 출발점에서 든 비용 g</Head>
        </div>
        <div style={{ position: 'absolute', left: 82, top: 80 }}>
          <Grid
            t={t}
            at={0.4}
            size={size}
            pathAt={7.2}
            pathColor={C.green}
            cell={(x, y) => {
              const g = G_OF[`${x},${y}`]
              if (g === undefined || g > 9) return null
              return { p: shown(g), color: C.blue, text: x === START[0] && y === START[1] ? undefined : x === GOAL[0] && y === GOAL[1] ? undefined : String(g) }
            }}
          />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 560, display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 0.8) }}>회색 4 칸 = 벽 · 상하좌우로 한 칸에 비용 1</span>
          <span style={{ ...mono(C.blue, 28), opacity: prog(t, 13.4) }}>꺼낸 칸 40 / 빈 칸 44</span>
          <span style={{ ...mono(C.green, 28), opacity: prog(t, 14.4) }}>최단 경로 9 칸 (벽이 없으면 5 칸)</span>
        </div>
      </Card>
      <Card x={854} y={130} w={1002} h={470} at={0.3}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 18 }}>
          <Head color={C.blue}>Dijkstra (1959) 의 절차</Head>
          {[
            ['1', '출발 칸의 g 를 0 으로 두고 open list(꺼낼 후보 칸의 목록)에 넣는다', 0.6],
            ['2', 'open list 에서 g 가 가장 작은 칸을 꺼낸다(확장, expand). 꺼낸 칸의 g 는 확정된다', 2.2],
            ['3', '꺼낸 칸의 이웃마다 g 를 고치고, 직전 칸(parent)을 적는다', 6.8],
            ['4', '목표 칸을 꺼내면 parent 를 거꾸로 따라가 경로를 만든다', 8.6],
          ].map(([n, s, at]) => (
            <div key={n as string} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={mono(C.blue, 28)}>{n}</span>
              <span style={line(C.text, 26)}>{s}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={854} y={624} w={1002} h={250} at={20.2} color={`${C.orange}88`} title={<Head color={C.orange}>목표 방향을 쓰지 않는다</Head>}>
        <span style={line(C.text, 25)}>모든 방향을 똑같이 넓혀, G 반대편인 왼쪽 끝 칸까지 꺼내 본다</span>
        <span style={line(C.text, 25)}>100만 칸 지도에서는 목표가 가까워도 출발점 둘레를 넓게 확장한다</span>
        <span style={line(C.muted, 23)}>NavFn 예제 설정 use_astar: false → 이 Dijkstra 방식</span>
      </Box>
    </AbsoluteFill>
  )
}

function AStar() {
  const t = useSec()
  const size = 74
  const groupAt: Record<number, number> = { 5: 7.6, 7: 9.2, 9: 10.8 }
  const groupColor: Record<number, string> = { 5: C.green, 7: C.blue, 9: C.orange }
  const fOf: Record<string, number> = {}
  for (const [f, cells] of A_GROUPS) for (const [x, y] of cells) fOf[`${x},${y}`] = f
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={760} h={744} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>같은 grid · 칸 숫자 = f = g + h</Head>
        </div>
        <div style={{ position: 'absolute', left: 82, top: 80 }}>
          <Grid
            t={t}
            at={0.4}
            size={size}
            pathAt={12.2}
            pathColor={C.green}
            cell={(x, y) => {
              const f = fOf[`${x},${y}`]
              if (f === undefined) return null
              const isEnd = (x === START[0] && y === START[1]) || (x === GOAL[0] && y === GOAL[1])
              return { p: prog(t, groupAt[f], 0.6), color: groupColor[f], text: isEnd ? undefined : String(f) }
            }}
          />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 560, display: 'grid', gap: 10 }}>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 7.4) }}>S: f = 0 + 5 = 5 에서 시작</span>
          <div style={{ display: 'flex', gap: 22, opacity: prog(t, 11) }}>
            <span style={mono(C.green, 26)}>f 5: 3 칸</span>
            <span style={mono(C.blue, 26)}>f 7: 7 칸</span>
            <span style={mono(C.orange, 26)}>f 9: 7 칸</span>
          </div>
          <span style={{ ...mono(C.accent, 28), opacity: prog(t, 12) }}>꺼낸 칸 17 · 경로는 같은 9 칸</span>
        </div>
      </Card>
      <Card x={854} y={130} w={1002} h={744} at={0.3}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 14 }}>
          <span style={mono(C.accent, 44)}>f(n) = g(n) + h(n)</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 1.4) }}>g(n): 출발점에서 칸 n 까지 든 비용</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 2.6) }}>h(n): 칸 n 에서 목표까지 남은 비용의 어림값 (heuristic)</span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 7.2) }}>상하좌우 grid 의 h: Manhattan 거리 = 가로 칸 수 + 세로 칸 수 (벽 무시)</span>
          <div style={{ marginTop: 8, display: 'grid', gap: 6, opacity: prog(t, 12.6) }}>
            <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
              <span style={{ width: 340, ...line(C.muted, 22) }}>지도</span>
              <span style={{ width: 170, ...line(C.blue, 22), textAlign: 'right' }}>Dijkstra</span>
              <span style={{ width: 140, ...line(C.accent, 22), textAlign: 'right' }}>A*</span>
              <span style={{ width: 170, ...line(C.muted, 22), textAlign: 'right' }}>경로</span>
            </div>
            {[
              ['벽 없는 8 × 6 grid', '28', '6', '5 칸'],
              ['가운데 벽 8 × 6 grid', '40', '17', '9 칸'],
            ].map(([a, b, c, d]) => (
              <div key={a} style={{ display: 'flex' }}>
                <span style={{ width: 340, ...line(C.text, 24) }}>{a}</span>
                <span style={{ width: 170, ...mono(C.blue, 26), textAlign: 'right' }}>{b}</span>
                <span style={{ width: 140, ...mono(C.accent, 26), textAlign: 'right' }}>{c}</span>
                <span style={{ width: 170, ...mono(C.muted, 26), textAlign: 'right' }}>{d}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${C.green}66`, background: `${C.green}10`, display: 'grid', gap: 8, opacity: prog(t, 14.2) }}>
            <span style={line(C.green, 26)}>h ≤ 실제 남은 비용 → 최단 경로 보장 (admissible)</span>
            <span style={line(C.muted, 22)}>Hart · Nilsson · Raphael (1968) · Manhattan 거리는 실제보다 길 수 없다</span>
          </div>
          <div style={{ padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 8, opacity: prog(t, 21.8) }}>
            <span style={line(C.text, 25)}>찾는 경로의 비용은 Dijkstra 와 같다</span>
            <span style={line(C.muted, 23)}>달라지는 것: 꺼내 보는 칸의 수와 계산 시간</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseOrder = () => (
  <PauseWrite
    question="open list 에 칸 A(g = 3, h = 6)와 칸 B(g = 5, h = 2)가 있다. Dijkstra 와 A* 는 각각 어느 칸을 먼저 꺼낼까?"
    answer={
      <>
        Dijkstra 는 g 만 본다: 3 &lt; 5 → A
        <br />
        A* 는 f = g + h 를 본다: A 3 + 6 = 9, B 5 + 2 = 7 → B
      </>
    }
  />
)

// ---------- S3: Hybrid-A* and planners ----------

function Hybrid() {
  const t = useSec()
  const cs = 40
  const zig = `${60},${300} ${380},${300} ${380},${60} ${700},${60}`
  const pz = prog(t, 1, 1.4)
  const ph = prog(t, 7.4, 1.6)
  // motion primitives: car at P heading up, three arcs of radius R
  const P = { x: 330, y: 280 }
  const R = 200
  const a = (50 * Math.PI) / 180
  const lEnd = { x: P.x - R + R * Math.cos(a), y: P.y - R * Math.sin(a) }
  const rEnd = { x: P.x + R - R * Math.cos(a), y: P.y - R * Math.sin(a) }
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={480} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 20, display: 'flex', gap: 30 }}>
          <span style={{ ...line(C.orange, 24), opacity: pz }}>━ grid A*: 모서리에서 90° 로 꺾음</span>
          <span style={{ ...line(C.green, 24), opacity: ph }}>━ Hybrid-A*: 회전 반경을 지킨 곡선</span>
        </div>
        <svg width={900} height={410} style={{ position: 'absolute', left: 30, top: 66 }}>
          {Array.from({ length: 20 * 9 }, (_, i) => (
            <rect key={i} x={(i % 20) * cs} y={Math.floor(i / 20) * cs} width={cs} height={cs} fill="none" stroke={C.grid} strokeWidth={1.5} />
          ))}
          <polyline points={zig} fill="none" stroke={C.orange} strokeWidth={5} strokeLinejoin="miter" opacity={pz} />
          <text x={396} y={338} fill={C.orange} fontSize={22} fontFamily={MONO} opacity={pz}>
            90°
          </text>
          <text x={324} y={44} fill={C.orange} fontSize={22} fontFamily={MONO} opacity={pz}>
            90°
          </text>
          <path d="M60,300 C300,300 300,60 700,60" fill="none" stroke={C.green} strokeWidth={5} opacity={ph} />
          <rect x={36} y={288} width={48} height={24} rx={6} fill={C.card} stroke={C.text} strokeWidth={2.5} />
          <circle cx={700} cy={60} r={12} fill={C.red} />
          <text x={4} y={392} fill={C.dim} fontSize={20}>
            모식도 · 최소 회전 반경보다 작게 돌 수 없는 자동차형(Ackermann) 로봇
          </text>
        </svg>
      </Card>
      <Card x={994} y={130} w={862} h={480} at={7}>
        <div style={{ position: 'absolute', left: 30, top: 20 }}>
          <Head color={C.green}>상태 (x, y, θ) 에서 그리는 세 호</Head>
        </div>
        <svg width={660} height={400} style={{ position: 'absolute', left: 100, top: 70 }}>
          <g opacity={prog(t, 8.4)}>
            <path d={`M${P.x},${P.y} A${R},${R} 0 0 0 ${lEnd.x.toFixed(1)},${lEnd.y.toFixed(1)}`} fill="none" stroke={C.green} strokeWidth={4} />
            <path d={`M${P.x},${P.y} A${R},${R} 0 0 1 ${rEnd.x.toFixed(1)},${rEnd.y.toFixed(1)}`} fill="none" stroke={C.green} strokeWidth={4} />
            <line x1={P.x} y1={P.y} x2={P.x} y2={100} stroke={C.green} strokeWidth={4} />
            <circle cx={lEnd.x} cy={lEnd.y} r={7} fill={C.green} />
            <circle cx={rEnd.x} cy={rEnd.y} r={7} fill={C.green} />
            <circle cx={P.x} cy={100} r={7} fill={C.green} />
            <text x={lEnd.x - 18} y={lEnd.y + 8} fill={C.text} fontSize={24} textAnchor="end">
              왼쪽 호
            </text>
            <text x={P.x} y={78} fill={C.text} fontSize={24} textAnchor="middle">
              직진
            </text>
            <text x={rEnd.x + 18} y={rEnd.y + 8} fill={C.text} fontSize={24}>
              오른쪽 호
            </text>
          </g>
          <rect x={P.x - 16} y={P.y} width={32} height={50} rx={6} fill={C.card} stroke={C.text} strokeWidth={2.5} opacity={prog(t, 7.4)} />
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 420, width: 800, opacity: prog(t, 10) }}>
          <span style={line(C.muted, 22)}>호 끝의 실제 좌표를 기억하고, 칸은 와 본 상태인지 가리는 데만 쓴다</span>
        </div>
      </Card>
      <Box x={64} y={636} w={880} h={240} at={14.2} color={`${C.orange}88`} title={<Head color={C.orange}>방향까지 넣으면 상태가 늘어난다</Head>}>
        <span style={line(C.text, 24)}>방향 72 칸 (5° 간격, Smac Hybrid-A* 기본값)</span>
        <span style={mono(C.text, 26)}>100만 × 72 = 7200만 상태</span>
        <span style={line(C.muted, 22)}>h = 장애물을 고려한 2D 거리와 회전 반경만 지킨 거리 중 큰 값</span>
      </Box>
      <Box x={976} y={636} w={880} h={240} at={21.6} color={`${C.blue}88`} title={<Head color={C.blue}>실제 차량</Head>}>
        <span style={line(C.text, 24)}>2007 DARPA Urban Challenge · Stanford Racing Team 의 Junior</span>
        <span style={line(C.text, 24)}>주차장을 다니고, 막힌 도로에서 U-turn</span>
        <span style={mono(C.blue, 26)}>다시 계획 한 번 50 ~ 300 ms</span>
      </Box>
    </AbsoluteFill>
  )
}

function Planners() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={420} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 22 }}>
          <Head>약 75 m 경로 계획 시간 (Nav2 문서)</Head>
          <Bar label="NavFn" value={146} max={250} color={C.blue} at={1} width={360} unit=" ms" labelW={260} />
          <Bar label="Smac 2D (A*)" value={243} max={250} color={C.blue} at={2.4} width={360} unit=" ms" labelW={260} />
          <Bar label="Smac Hybrid-A*" value={144} max={250} color={C.orange} at={6.8} width={360} unit=" ms" labelW={260} />
          <Bar label="Smac State Lattice" value={113} max={250} color={C.orange} at={8.4} width={360} unit=" ms" labelW={260} />
          <div style={{ display: 'flex', gap: 34, opacity: prog(t, 7) }}>
            <span style={line(C.blue, 22)}>■ (x, y) 탐색</span>
            <span style={line(C.orange, 22)}>■ (x, y, θ) 탐색</span>
          </div>
        </div>
      </Card>
      <Card x={994} y={130} w={862} h={420} at={13}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Head>로봇 형태에 맞는 planner (Nav2 tuning guide)</Head>
          {[
            ['NavFn · Smac 2D · Theta*', '원형 differential drive · 원형 omnidirectional', C.blue, 13.4],
            ['Smac Hybrid-A*', '자동차형(Ackermann) · 다리 로봇', C.orange, 15.6],
            ['Smac State Lattice', '원형이 아닌 differential drive · 임의의 형태', C.purple, 20.6],
          ].map(([p, r, color, at]) => (
            <div key={p as string} style={{ display: 'grid', gap: 2, opacity: prog(t, at as number) }}>
              <span style={mono(color as string, 26)}>{p as string}</span>
              <span style={line(C.text, 24)}>{r as string}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={580} w={1792} h={290} at={9.8} gap={12} title={<Head color={C.muted}>함께 볼 것</Head>}>
        <span style={line(C.text, 25)}>방향까지 따지는데도 시간이 2D planner 와 비슷하다: Nav2 문서는 최적화한 heuristic 과 효율적인 구현 덕분이라고 설명한다</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 13.8) }}>Theta*: 두 칸 사이에 장애물이 없으면 칸 중심을 따르지 않고 임의 각도의 직선으로 바로 잇는 grid planner</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 21) }}>관절 6 ~ 7 개인 로봇 팔: 칸 수가 감당할 수 없이 늘어나 RRT · PRM 같은 sampling-based planner 를 쓴다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseRobot = () => (
  <PauseWrite
    question="제자리 회전이 되는 원형 청소 로봇과, 최소 회전 반경이 1.5 m 인 자동차형 배송 로봇. 각각 Nav2 의 어떤 planner 가 맞을까?"
    answer={
      <>
        청소 로봇: 모서리에서 제자리 회전 → NavFn 이나 Smac 2D
        <br />
        배송 로봇: 90° 로 꺾는 경로를 못 따라감 → minimum_turning_radius 1.5 m 의 Smac Hybrid-A*
      </>
    }
  />
)

// ---------- S4: global / local / behavior tree ----------

function GlobalLocal() {
  const t = useSec()
  const robot = { x: 130, y: 360 }
  const rows: [string, string, string, number][] = [
    ['범위', '지도 전체', '로봇 둘레 3 m × 3 m', 7.4],
    ['갱신', '1 Hz', '5 Hz', 8.6],
    ['기준 frame', 'map', 'odom', 9.8],
    ['칸 수', '1000 × 1000 = 100만', '60 × 60 = 3600', 14.4],
    ['layer', 'static · obstacle · inflation', 'voxel · inflation', 11],
    ['쓰는 곳', 'planner server', 'controller server', 2.2],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={780} h={500} at={0.3}>
        <svg width={760} height={490} style={{ position: 'absolute', left: 10, top: 6 }}>
          <text x={24} y={40} fill={C.dim} fontSize={20}>
            모식도
          </text>
          <rect x={20} y={56} width={700} height={400} rx={10} fill="none" stroke={C.cardEdge} strokeWidth={2} />
          <rect x={160} y={110} width={160} height={60} fill={C.muted} opacity={0.5} />
          <rect x={500} y={300} width={100} height={70} fill={C.muted} opacity={0.5} />
          <polyline points={`${robot.x},${robot.y} 420,360 420,210 620,210 620,96`} fill="none" stroke={C.blue} strokeWidth={5} strokeLinejoin="round" opacity={prog(t, 0.8)} />
          <text x={440} y={244} fill={C.blue} fontSize={22} opacity={prog(t, 1)}>
            global 경로 · 1초마다
          </text>
          <circle cx={620} cy={96} r={12} fill={C.red} opacity={prog(t, 0.8)} />
          <text x={642} y={104} fill={C.red} fontSize={22} opacity={prog(t, 0.8)}>
            목표
          </text>
          <g opacity={prog(t, 7.2)}>
            <rect x={robot.x - 70} y={robot.y - 70} width={140} height={140} fill={C.green} fillOpacity={0.08} stroke={C.green} strokeWidth={2.5} strokeDasharray="8 6" />
            <text x={60} y={276} fill={C.green} fontSize={22}>
              local costmap 3 m × 3 m
            </text>
          </g>
          <g opacity={prog(t, 22)}>
            <circle cx={192} cy={360} r={12} fill={C.red} />
            <path d={`M${robot.x},${robot.y} Q192,316 254,360`} fill="none" stroke={C.green} strokeWidth={4} />
          </g>
          <circle cx={robot.x} cy={robot.y} r={15} fill={C.card} stroke={C.text} strokeWidth={3} />
          <text x={60} y={470} fill={C.green} fontSize={22} opacity={prog(t, 2)}>
            controller · 1초에 20 번 속도 명령
          </text>
        </svg>
      </Card>
      <Card x={874} y={130} w={982} h={500} at={2}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 8 }}>
            <span style={{ width: 160, ...line(C.muted, 22) }}>nav2_bringup</span>
            <span style={{ width: 370, ...line(C.blue, 24) }}>global costmap</span>
            <span style={{ width: 380, ...line(C.green, 24) }}>local costmap</span>
          </div>
          {rows.map(([k, g, l, at]) => (
            <div key={k} style={{ display: 'flex', opacity: prog(t, at) }}>
              <span style={{ width: 160, ...line(C.muted, 22) }}>{k}</span>
              <span style={{ width: 370, ...line(C.text, 22) }}>{g}</span>
              <span style={{ width: 380, ...line(C.text, 22) }}>{l}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.2) }}>local 은 odom 기준: AMCL 이 위치를 고쳐도 장애물이 갑자기 옮겨 가 보이지 않는다</span>
        </div>
      </Card>
      <Box x={64} y={660} w={1792} h={210} at={21.6} color={`${C.accent}66`} title={<Head color={C.accent}>0.5 m/s 로 달릴 때 (velocity smoother 최고 속도)</Head>}>
        <div style={{ display: 'flex', gap: 40 }}>
          {[
            ['global 경로를 다시 받기까지 1 s', '0.5 × 1 = 0.5 m'],
            ['controller 다음 명령까지 0.05 s', '0.5 × 0.05 = 0.025 m'],
            ['사람이 local costmap 에 적히기까지', '1 ÷ 5 = 0.2 s'],
          ].map(([a, b], i) => (
            <div key={a} style={{ width: 540, display: 'grid', gap: 4, opacity: prog(t, 22 + i * 1.2) }}>
              <span style={line(C.muted, 23)}>{a}</span>
              <span style={mono(C.text, 28)}>{b}</span>
            </div>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function BT() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={860} h={330} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <Head>behavior tree: leaf node 는 일, control node 는 순서</Head>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 1.2) }}>server 를 나눠 둔다: 경로 계획 · 경로 추종 · 복구 동작</span>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Chip at={6.8} color={C.green} mono>
              SUCCESS
            </Chip>
            <Chip at={7.2} color={C.red} mono>
              FAILURE
            </Chip>
            <Chip at={7.6} color={C.orange} mono>
              RUNNING
            </Chip>
          </div>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 9) }}>Sequence: 자식을 차례로 실행하다 하나라도 실패하면 멈춘다</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 10.4) }}>Fallback: 자식 하나가 성공할 때까지 다음 자식을 시도한다</span>
        </div>
      </Card>
      <Card x={954} y={130} w={902} h={330} at={12.5}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Head color={C.blue}>NavigateToPose → 기본 tree</Head>
          <Flow steps={['RateController 1 Hz', 'ComputePathToPose', 'planner']} color={C.blue} at={12.8} />
          <Flow steps={['FollowPath', 'controller 20 Hz', 'cmd_vel']} color={C.green} at={15.6} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.6) }}>planner 는 GridBased 로 등록한 plugin(NavFn, Smac 등)</span>
        </div>
      </Card>
      <Box x={64} y={486} w={1792} h={220} at={18.3} color={`${C.red}77`} title={<Head color={C.red}>실패하면 recovery · 하나를 할 때마다 처음부터 다시, 최대 6 번</Head>}>
        <span style={line(C.muted, 23)}>먼저 경로 계산 실패는 global costmap 을, 추종 실패는 local costmap 을 지우고 한 번 더 해 본다</span>
        <Flow steps={['두 costmap 지우기', '제자리 회전 1.57 rad', '5 초 대기', '0.15 m/s 로 0.30 m 후진']} color={C.red} at={19} gap={0.7} />
      </Box>
      <Box x={64} y={730} w={1792} h={140} at={24.4} gap={8}>
        <span style={line(C.text, 24)}>한 번만 계산 → 닫힌 문이나 짐을 피해 돌아가는 길을 못 찾는다 · 너무 자주 → 비슷한 두 길 사이에서 경로가 자주 바뀔 수 있다</span>
        <span style={line(C.muted, 22)}>Nav2 논문의 37.4 mile 실험도 1 Hz 로 global planner 를 불렀다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseRate = () => (
  <PauseWrite
    question="planner 가 경로 하나를 계산하는 데 0.3 s 가 걸린다. RateController 를 5 Hz 로 올리면 1초에 경로를 5 번 받을 수 있을까?"
    answer={
      <>
        5 × 0.3 = 1.5 초가 필요하다 → 받을 수 없다
        <br />
        상한은 1 ÷ 0.3 ≈ 3.3 번 → 더 빠른 planner 나 낮은 costmap 해상도가 필요하다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'costmap 의 cost', color: C.accent, text: '0 ~ 255 · 0.22 m 안은 253 · k = 3 이면 0.30 m 에서 198 · NavFn 비용 50 + 0.8c', at: 0.6 },
    { tag: 'Dijkstra 와 A*', color: C.blue, text: 'g 가 작은 칸부터 40 칸 · f = g + h 가 작은 칸부터 17 칸 · 같은 9 칸 경로', at: 4.2 },
    { tag: '자동차형과 Hybrid-A*', color: C.orange, text: '(x, y, θ) 탐색 · 방향 72 칸 · 최소 회전 반경을 지키는 호', at: 8.2 },
    { tag: 'global · local · BT', color: C.red, text: '1초마다 재계획 · controller 1초에 20 번 · NavFn 75 m 경로 146 ms', at: 12.2 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            100만 칸 가운데 벽에 닿지 않고 가장 싼 칸의 줄을, 1초도 안 걸려 어떻게 찾을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
            NEXT · NAVIGATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Path Tracking</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            경로 점들의 목록을 1초에 20 번 속도 명령으로 · pure pursuit 과 MPC
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/path-planning (Dijkstra 1959 · Hart 등 1968 · Dolgov 등 2010 · Nav2 논문 · Smac 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function PathPlanning() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        layers: Layers,
        inflation: Inflation,
        'pause-inflation': PauseInflation,
        dijkstra: Dijkstra,
        astar: AStar,
        'pause-order': PauseOrder,
        hybrid: Hybrid,
        planners: Planners,
        'pause-robot': PauseRobot,
        'global-local': GlobalLocal,
        bt: BT,
        'pause-rate': PauseRate,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
