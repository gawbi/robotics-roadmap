import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './lidar-slam.narration.json'
import { script } from './lidar-slam.script'

// Numbers follow lessons/lidar-slam/README.md (see lidar-slam.script.ts). The drift loop redraws figures/drift-loop.svg's
// computed paths; the grid, ICP and pose-graph drawings are schematic (marked 모식도) and every number on them is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
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

/** a text table: every column left-aligned, columns from `monoFrom` on in mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, monoFrom = 1, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; monoFrom?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i >= monoFrom ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap' })
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

// ---------- the drift loop (figures/drift-loop.svg, scaled) ----------

const TRUE_PATH: [number, number][] = [
  [90, 250],
  [370, 250],
  [370, 110],
  [90, 110],
  [90, 250],
]
const ODOM_PATH: [number, number][] = [
  [90, 250], [125.3, 250], [160.7, 250], [196, 250], [231.4, 250], [266.8, 250], [302.1, 250], [337.5, 250], [372.8, 250],
  [372.2, 214.7], [371.6, 179.3], [370.9, 144], [370.3, 108.6], [335, 109.9], [299.7, 111.1], [264.3, 112.3], [229, 113.6],
  [193.7, 114.8], [158.4, 116], [123, 117.3], [87.7, 118.5], [89.6, 153.8], [91.4, 189.1], [93.3, 224.4], [95.1, 259.7],
]

function DriftLoop({ t, at, odomAt, sx = 2.5, ox = 60, oy = 110 }: { t: number; at: number; odomAt: number; sx?: number; ox?: number; oy?: number }) {
  const P = ([x, y]: [number, number]): [number, number] => [(x - 87) * sx + ox, (y - 108) * sx + oy]
  const pts = (a: [number, number][]) => a.map((p) => P(p).join(',')).join(' ')
  const n = ODOM_PATH.length
  const shown = Math.max(1, Math.round(prog(t, odomAt, 2.2) * n))
  const [sx0, sy0] = P(ODOM_PATH[0])
  const [ex, ey] = P(ODOM_PATH[n - 1])
  const done = prog(t, odomAt + 2.2)
  return (
    <g>
      <polyline points={pts(TRUE_PATH)} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="10 8" strokeLinejoin="round" opacity={prog(t, at)} />
      <circle cx={sx0} cy={sy0} r={9} fill={C.green} opacity={prog(t, at)} />
      <g opacity={prog(t, odomAt - 0.2, 0.3)}>
        <polyline points={pts(ODOM_PATH.slice(0, shown))} fill="none" stroke={C.orange} strokeWidth={3.5} strokeLinejoin="round" />
      </g>
      <g opacity={done}>
        <circle cx={ex} cy={ey} r={9} fill={C.orange} />
        <line x1={ex} y1={ey} x2={sx0} y2={sy0} stroke={C.red} strokeWidth={2.5} strokeDasharray="4 4" />
      </g>
    </g>
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
            ESTIMATION · LIDAR SLAM
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>LiDAR SLAM</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            지도와 위치를 <span style={{ color: C.accent }}>함께</span> 추정
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            처음 들어간 건물에서 LiDAR 로 지도를 그리면서, 그 지도 위의 자기 위치도 구하는 방법
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
  const notes: [ReactNode, string, number][] = [
    ['실제 경로: 20 m × 10 m 복도 한 바퀴 (60 m)', C.green, 0.6],
    ['odometry 로 이어 붙인 경로: 출발점에 돌아오지 못한다', C.orange, 1.4],
    ['그 자리에서 찍은 scan 은 처음 본 벽과 어긋나 같은 벽이 두 겹이 된다', C.text, 2.4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={430}>
        <svg width={800} height={430} style={{ position: 'absolute', left: 0, top: 0 }}>
          <DriftLoop t={t} at={0.4} odomAt={0.9} sx={2} ox={60} oy={40} />
        </svg>
        <div style={{ position: 'absolute', left: 800, top: 60, width: 950, display: 'grid', gap: 26 }}>
          {notes.map(([s, color, at], i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ width: 28, height: 6, borderRadius: 3, background: color, display: 'inline-block', transform: 'translateY(-6px)' }} />
              <span style={line(C.text, 28)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 610, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          지도도 위치도 없이 출발한 로봇은 <span style={{ color: C.accent }}>어떻게 반듯한 지도를 얻을까?</span>
        </div>
      </Appear>
      <Appear at={5.6} style={{ position: 'absolute', left: 64, top: 730, width: 1792 }}>
        <div style={{ textAlign: 'center' }}>
          <Label color={C.muted} size={32}>
            지도를 그리려면 위치가 필요하고, 위치를 고치려면 지도가 필요하다
          </Label>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- S1: the cycle and odometry drift ----------

function Cycle() {
  const t = useSec()
  const rows: [string, string, string, string, number, string][] = [
    ['localization', '지도', '지도 위의 위치', 'AMCL', 0.6, C.blue],
    ['mapping', 'scan 마다 찍은 위치', '지도', '위치를 안다고 치고 칠하기', 3.4, C.orange],
    ['SLAM', '센서 값과 odometry 뿐', '위치와 지도 둘 다', 'slam_toolbox, Cartographer', 6.8, C.accent],
  ]
  const cell = (w: number, color: string = C.text, m = false): CSSProperties => ({ width: w, fontSize: 26, color, whiteSpace: 'nowrap', fontFamily: m ? MONO : undefined, fontWeight: m ? 600 : 500 })
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={350} at={0.3} title={<Head color={C.accent}>지도와 위치는 서로를 필요로 한다</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 8 }}>
            {['문제', '아는 것', '구하는 것', 'ROS 2 의 예'].map((h, i) => (
              <span key={h} style={{ ...cell([320, 420, 400, 560][i], C.muted), fontSize: 22 }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([a, b, c, d, at, color]) => (
            <div key={a} style={{ display: 'flex', opacity: prog(t, at) }}>
              <span style={cell(320, color, true)}>{a}</span>
              <span style={cell(420)}>{b}</span>
              <span style={cell(400)}>{c}</span>
              <span style={cell(560, C.muted)}>{d}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={64} y={520} w={880} h={360} at={12.5} color={`${C.blue}88`} title={<Head color={C.blue}>front-end · 매 scan 마다</Head>}>
        {[
          ['1', 'odometry 로 구한 자세를 출발점으로 삼는다', 12.8],
          ['2', '새 scan 을 바로 앞 scan 이나 작은 지도 조각에 맞춰 위치를 고친다', 14.2],
          ['3', '고친 위치로 지도를 늘려 간다 · 그래도 오차가 조금씩 남는다', 16.2],
        ].map(([n, s, at]) => (
          <div key={n as string} style={{ display: 'flex', gap: 14, opacity: prog(t, at as number) }}>
            <span style={mono(C.blue, 24)}>{n}</span>
            <span style={line(C.text, 24)}>{s}</span>
          </div>
        ))}
      </Box>
      <Box x={976} y={520} w={880} h={360} at={19} color={`${C.green}88`} title={<Head color={C.green}>back-end · 예전 자리에 돌아왔을 때</Head>}>
        {[
          ['1', '예전에 지나간 곳에 돌아온 것을 알아차린다', 19.3],
          ['2', '그 정보로 지금까지의 경로 전체를 한꺼번에 다시 맞춘다', 21],
          ['3', 'slam_toolbox 와 Cartographer 는 둘 다 이 pose graph 방식이다', 22.8],
        ].map(([n, s, at]) => (
          <div key={n as string} style={{ display: 'flex', gap: 14, opacity: prog(t, at as number) }}>
            <span style={mono(C.green, 24)}>{n}</span>
            <span style={line(C.text, 24)}>{s}</span>
          </div>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

function Drift() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={840} h={740}>
        <svg width={840} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            복도 한 바퀴의 odometry 경로
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={30} y1={84} x2={70} y2={84} stroke={C.green} strokeWidth={3} strokeDasharray="10 8" />
            <text x={82} y={92} fill={C.green} fontSize={22}>
              실제 경로
            </text>
          </g>
          <g opacity={prog(t, 18.2)}>
            <line x1={260} y1={84} x2={300} y2={84} stroke={C.orange} strokeWidth={3.5} />
            <text x={312} y={92} fill={C.orange} fontSize={22}>
              odometry 경로
            </text>
          </g>
          <DriftLoop t={t} at={0.5} odomAt={18.3} />
          <g opacity={prog(t, 0.5)}>
            <text x={90} y={446} fill={C.green} fontSize={22}>
              출발
            </text>
          </g>
          <g opacity={prog(t, 20.6)}>
            <text x={50} y={530} fill={C.orange} fontSize={22}>
              돌아온 곳
            </text>
            <text x={190} y={530} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              0.78 m 차이
            </text>
          </g>
          <g opacity={prog(t, 18.6)}>
            <text x={30} y={600} fill={C.muted} fontSize={23}>
              가정: 바퀴 지름 1% 크게 · 90° 돌 때마다 1° 더 돈 것으로 셈
            </text>
          </g>
          <g opacity={prog(t, 21)}>
            <text x={30} y={648} fill={C.text} fontSize={23}>
              출발점에 돌아왔는데 0.78 m 떨어졌다고 계산한다
            </text>
            <text x={30} y={694} fill={C.text} fontSize={23}>
              그 자리의 scan 은 처음 본 벽과 어긋나 벽이 두 겹
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={936} y={140} w={920} h={190} at={0.3} title={<Head color={C.orange}>바퀴 지름을 1% 크게 알면</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 0.8) }}>
          거리도 1% 크게 센다 → <span style={mono(C.orange, 26)}>60 m × 1% = 0.6 m</span> 어긋남
        </span>
      </Box>
      <Box x={936} y={350} w={920} h={320} at={6} title={<Head color={C.accent}>방향 오차: 옆으로 벗어나는 거리 = 달린 거리 × sin(오차)</Head>}>
        <Table
          head={['방향 오차', '10 m 뒤', '20 m 뒤', '50 m 뒤']}
          rows={[
            ['0.5°', '0.09 m', '0.17 m', '0.44 m'],
            ['1°', '0.17 m', '0.35 m', '0.87 m'],
            ['2°', '0.35 m', '0.70 m', '1.75 m'],
          ]}
          widths={[220, 200, 200, 200]}
          at={12}
          monoFrom={0}
          colors={[C.muted, C.text, C.orange]}
        />
      </Box>
      <Box x={936} y={690} w={920} h={190} at={24} title={<Head color={C.red}>LiDAR 의 벽 점도 함께 밀린다</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24.4) }}>
          방향 1° 오차 · 3 m 앞 벽: <span style={mono(C.red, 26)}>3 × sin 1° ≈ 0.052 m</span> → 5 cm 칸 하나
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: occupancy grid and log-odds ----------

function Grid() {
  const t = useSec()
  const cols = 14
  const rows = 10
  const s = 50
  const gx = 50
  const gy = 90
  const robot = { c: 1, r: 5 }
  const hit = 9
  const lit = prog(t, 13.2)
  const fill = (c: number, r: number) => {
    if (r !== robot.r || c <= robot.c) return { f: C.grid, o: 1 }
    if (c < hit) return { f: C.green, o: 0.15 + 0.35 * lit }
    if (c === hit) return { f: C.red, o: 0.15 + 0.6 * lit }
    return { f: C.grid, o: 1 }
  }
  const cells = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const { f, o } = r === robot.r ? fill(c, r) : { f: C.grid, o: 1 }
      cells.push(<rect key={`${c}-${r}`} x={gx + c * s + 1} y={gy + r * s + 1} width={s - 2} height={s - 2} fill={f} opacity={o} />)
    }
  const ry = gy + robot.r * s + s / 2
  const rx = gx + robot.c * s + s / 2
  const wallX = gx + hit * s
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            LiDAR 빛 한 줄이 칸을 바꾸는 방식
          </text>
          <text x={870} y={50} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 한 칸 5 cm
          </text>
          <g opacity={prog(t, 0.5)}>{cells}</g>
          <g opacity={prog(t, 0.8)}>
            <rect x={wallX + 6} y={gy + 2 * s} width={12} height={6 * s} rx={4} fill={C.orange} />
            <circle cx={rx} cy={ry} r={16} fill={C.accent} />
          </g>
          {arrow(rx + 18, ry, rx + 18 + (wallX + 4 - rx - 18) * prog(t, 13.4, 1), ry, C.accent, 3, 12, prog(t, 13.2, 0.3))}
          <g opacity={lit}>
            <text x={gx + 2 * s} y={gy + robot.r * s - 14} fill={C.green} fontSize={22} fontWeight={600}>
              지나감 → 비어 있음
            </text>
            <text x={wallX + 30} y={gy + (robot.r + 1) * s + 30} fill={C.red} fontSize={22} fontWeight={600}>
              맞음 → 차 있음
            </text>
            <text x={gx + 10 * s + 10} y={gy + robot.r * s - 14} fill={C.muted} fontSize={22} fontWeight={600}>
              벽 뒤 → 모름
            </text>
          </g>
          <g opacity={prog(t, 14.5)}>
            <text x={30} y={650} fill={C.muted} fontSize={23}>
              모든 칸은 0.5 에서 출발한다 (차 있을 확률)
            </text>
            <text x={30} y={694} fill={C.muted} fontSize={23}>
              빛이 가지 않은 끝점 너머의 칸은 0.5 그대로 남는다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={300} at={0.3} title={<Head color={C.accent}>occupancy grid</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 0.6) }}>바닥을 같은 크기의 네모 칸으로 나누고, 칸마다 차 있을 확률을 적는다 (Moravec · Elfes, 1985)</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 6.6) }}>
          slam_toolbox 기본 resolution <span style={mono(C.accent, 24)}>0.05 m</span>
        </span>
        <span style={{ ...mono(C.accent, 24), opacity: prog(t, 8.5) }}>10 m × 10 m → 200 × 200 = 40,000 칸</span>
      </Box>
      <Box x={996} y={460} w={860} h={420} at={20.5} title={<Head color={C.orange}>TurtleBot3 의 LiDAR · LDS-01</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 20.8) }}>1초에 5 바퀴 (300 rpm) · 1° 간격으로 거리 360 개 · 0.12 ~ 3.5 m</span>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 21.8) }}>360 × 5 = 1,800 줄 / 초</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 23.5) }}>
          3.5 m 를 가는 빛 한 줄이 지나는 5 cm 칸 <span style={mono(C.orange, 26)}>70 개</span>
        </span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 25.5) }}>그래서 칸 하나를 고치는 계산은 가벼워야 한다</span>
      </Box>
    </AbsoluteFill>
  )
}

function LogOdds() {
  const t = useSec()
  const pts: [number, number, string, number][] = [
    [0, 0.5, '0.50', 12.2],
    [1, 0.7, '0.70', 12.6],
    [2, 0.84, '0.84', 13],
    [3, 0.93, '0.93', 13.4],
    [4, 0.89, '0.89', 14.4],
    [8, 0.63, '0.63', 15.2],
    [12, 0.248, '0.248', 16],
  ]
  const x0 = 380
  const dx = 110
  const yb = 320
  const yh = 260
  const X = (k: number) => x0 + k * dx
  const Y = (p: number) => yb - p * yh
  const events: [number, string][] = [
    [0, '0'],
    [1, '1 맞음'],
    [2, '2 맞음'],
    [3, '3 맞음'],
    [4, '4 지나감'],
    [8, '8 지나감'],
    [12, '12 지나감'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={330} at={0.3} title={<Head color={C.accent}>log-odds 로 바꾸면 더하기만 남는다</Head>}>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 0.6) }}>l = ln( p ÷ (1 − p) )</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 2) }}>p = 0.5 → l = 0 · 0.5 보다 크면 양수, 작으면 음수</span>
        <span style={{ ...mono(C.red, 25), opacity: prog(t, 6.4) }}>맞음 0.7 → ln(0.7 ÷ 0.3) = +0.85</span>
        <span style={{ ...mono(C.green, 25), opacity: prog(t, 8) }}>지나감 0.4 → ln(0.4 ÷ 0.6) = −0.41</span>
      </Box>
      <Box x={956} y={140} w={900} h={330} at={18} title={<Head color={C.orange}>칸을 칠하는 기준</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 18.3) }}>Nav2 map saver: 0.25 아래는 비어 있음, 0.65 이상은 차 있음</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.3) }}>
          slam_toolbox 는 횟수를 센다: 맞은 비율이 <span style={mono(C.orange, 23)}>occupancy_threshold 0.1</span> 을 넘으면 차 있음
        </span>
        <span style={{ ...mono(C.orange, 23), opacity: prog(t, 26) }}>3 ÷ 12 = 0.25 → 아직 차 있음</span>
        <span style={{ ...mono(C.muted, 23), opacity: prog(t, 27.2) }}>3 ÷ 30 = 0.1 → 이제 비어 있음</span>
      </Box>
      <Card x={64} y={500} w={1792} h={380} at={12}>
        <svg width={1792} height={380}>
          <text x={40} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            한 칸의 차 있을 확률 · 사람이 섰다가 떠난 칸
          </text>
          <text x={1752} y={44} textAnchor="end" fill={C.orange} fontSize={24} fontWeight={600} opacity={prog(t, 18.4)}>
            지나감 9 번 = 1.8 초 (1초에 5 바퀴)
          </text>
          <line x1={x0 - 30} y1={yb} x2={X(12) + 30} y2={yb} stroke={C.cardEdge} strokeWidth={2} />
          {(
            [
              [0.65, C.red, '차 있음 기준 0.65'],
              [0.25, C.green, '비어 있음 기준 0.25'],
            ] as const
          ).map(([p, color, label]) => (
            <g key={label} opacity={prog(t, 15.6)}>
              <line x1={x0 - 30} y1={Y(p)} x2={X(12) + 30} y2={Y(p)} stroke={color} strokeWidth={2} strokeDasharray="8 7" opacity={0.7} />
              <text x={40} y={Y(p) + 8} fill={color} fontSize={22}>
                {label}
              </text>
            </g>
          ))}
          {pts.slice(1).map(([k, p, , at], i) => {
            const [pk, pp] = pts[i]
            return <line key={k} x1={X(pk)} y1={Y(pp)} x2={X(k)} y2={Y(p)} stroke={C.accent} strokeWidth={2} strokeDasharray={k - pk > 1 ? '5 6' : undefined} opacity={prog(t, at) * 0.7} />
          })}
          {pts.map(([k, p, label, at]) => (
            <g key={k} opacity={prog(t, at)}>
              <circle cx={X(k)} cy={Y(p)} r={8} fill={C.accent} />
              <text x={X(k)} y={k === 8 || k === 0 ? Y(p) + 36 : Y(p) - 22} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
            </g>
          ))}
          {events.map(([k, label]) => (
            <text key={k} x={X(k)} y={yb + 38} textAnchor="middle" fill={C.muted} fontSize={21} opacity={prog(t, 12.2)}>
              {label}
            </text>
          ))}
          <text x={40} y={yb + 38} fill={C.dim} fontSize={21} opacity={prog(t, 12.2)}>
            scan 번호
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- S3: scan matching and the pose graph ----------

function ScanMatch() {
  const t = useSec()
  const ref: [number, number][] = []
  for (let x = 60; x <= 540; x += 40) ref.push([x, 250])
  for (let y = 70; y < 250; y += 36) ref.push([560, y])
  const settle = prog(t, 7.5, 3.5)
  const off = { x: 54 * (1 - settle), y: -34 * (1 - settle) }
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={120} at={0.3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span style={line(C.text, 25)}>scan matching: 새 scan 을 앞 scan (또는 지도) 에 겹치게 옮긴 양이 로봇이 움직인 양</span>
          <span style={{ ...mono(C.accent, 26), opacity: prog(t, 2) }}>Δx · Δy · Δθ</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 3.2), whiteSpace: 'nowrap' }}>출발점은 odometry</span>
        </div>
      </Box>
      <Box x={64} y={290} w={880} h={590} at={6} color={`${C.blue}88`} title={<Head color={C.blue}>ICP · Besl 과 McKay (1992)</Head>}>
        <svg width={824} height={300}>
          <text x={820} y={290} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          {ref.map(([x, y], i) => (
            <line key={`l${i}`} x1={x + off.x} y1={y + off.y} x2={x} y2={y} stroke={C.muted} strokeWidth={1.5} opacity={0.7 * (1 - settle) * prog(t, 6.8)} />
          ))}
          {ref.map(([x, y], i) => (
            <circle key={`r${i}`} cx={x} cy={y} r={6} fill={C.blue} />
          ))}
          {ref.map(([x, y], i) => (
            <circle key={`n${i}`} cx={x + off.x} cy={y + off.y} r={6} fill={C.orange} opacity={prog(t, 6.4)} />
          ))}
          <text x={600} y={286} fill={C.blue} fontSize={22}>
            기준 scan
          </text>
          <text x={650} y={130} fill={C.orange} fontSize={22} opacity={prog(t, 6.4)}>
            새 scan
          </text>
        </svg>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 7) }}>점마다 가장 가까운 점과 짝 → 짝끼리 거리 제곱 합이 가장 작게 옮김 → 짝을 다시 지어 되풀이</span>
        <span style={{ ...line(C.red, 24), opacity: prog(t, 12.3) }}>출발점에서 가장 가까운 local minimum 으로 수렴: odometry 가 크게 틀리면 틀린 답에서 멈춘다</span>
      </Box>
      <Box x={976} y={290} w={880} h={380} at={18} color={`${C.orange}88`} title={<Head color={C.orange}>correlative · slam_toolbox 기본값</Head>}>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 18.4) }}>거친 탐색: 26 × 26 위치 × 21 각도 = 14,196</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.8) }}>±0.25 m 를 2 cm 간격 · ±20° 를 2° 간격</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.4) }}>고운 탐색: 3 × 3 위치 × 11 각도 = 99</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20.8) }}>최고점 둘레 ±1 cm 를 1 cm 간격 · ±1° 를 0.2° 간격</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.2) }}>후보마다 점 360 개를 칸에 대 보면 칸 조회 약 510 만 번</span>
      </Box>
      <Box x={976} y={690} w={880} h={190} at={24} color={`${C.red}88`} title={<Head color={C.red}>긴 복도: scan 으로 풀 수 없는 방향</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.4) }}>복도 방향으로 밀어도 벽이 똑같이 겹쳐 점수가 같다 → 이 방향은 odometry 에 기댈 수밖에 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Loop() {
  const t = useSec()
  const fix = prog(t, 18.6, 1.6)
  const before = [0, 5, 10, 5.2, 0.4]
  const after = [0, 4.92, 9.84, 4.96, 0.08]
  const m = before.map((b, i) => b + (after[i] - b) * fix)
  const PX = (v: number) => 100 + 90 * v
  const pos: [number, number][] = [
    [PX(m[0]), 130],
    [PX(m[1]), 130],
    [PX(m[2]), 200],
    [PX(m[3]), 270],
    [PX(m[4]), 270],
  ]
  const edgeLabel: [string, number, number][] = [
    ['+5.0', (pos[0][0] + pos[1][0]) / 2, 112],
    ['+5.0', (pos[1][0] + pos[2][0]) / 2 + 10, 142],
    ['−4.8', (pos[2][0] + pos[3][0]) / 2 + 10, 268],
    ['−4.8', (pos[3][0] + pos[4][0]) / 2, 310],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12.2)}>
            1차원 예: 5 m 씩 두 번 갔다가 되돌아오기
          </text>
          <text x={1070} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 12.2)}>
            모식도
          </text>
          <g opacity={prog(t, 12.4)}>
            {pos.slice(1).map(([x, y], i) => {
              const [px, py] = pos[i]
              const d = Math.hypot(x - px, y - py) || 1
              const ux = (x - px) / d
              const uy = (y - py) / d
              return <g key={i}>{arrow(px + 17 * ux, py + 17 * uy, x - 17 * ux, y - 17 * uy, C.blue, 3, 11)}</g>
            })}
            {edgeLabel.map(([s, x, y], i) => (
              <text key={i} x={x} y={y} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {s}
              </text>
            ))}
          </g>
          <g opacity={prog(t, 14.8)}>
            <path d={`M ${pos[4][0] - 12} ${pos[4][1] - 9} C ${pos[4][0] - 50} ${pos[4][1] - 40}, ${pos[0][0] - 50} ${pos[0][1] + 40}, ${pos[0][0] - 12} ${pos[0][1] + 9}`} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="7 6" />
            <text x={160} y={200} fill={C.red} fontSize={22} fontWeight={600}>
              loop closure = 0 m
            </text>
            <text x={160} y={238} fill={C.orange} fontSize={22} fontWeight={600} opacity={1 - fix}>
              odometry 끝 = 0.4 m
            </text>
          </g>
          {pos.map(([x, y], i) => (
            <g key={i} opacity={prog(t, 12.4)}>
              <circle cx={x} cy={y} r={13} fill={C.card} stroke={i === 4 ? C.orange : C.accent} strokeWidth={3} />
              <text x={x} y={i < 2 ? y - 26 : i === 2 ? y - 26 : y + 44} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                {`x${i}`}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 380, width: 1040, display: 'grid', gap: 18 }}>
          <Table
            head={['가정', 'edge 하나가 떠안는 양', '고친 위치 x0 ~ x4 (m)']}
            rows={[
              ['분산이 모두 같다', '0.4 ÷ 5 = 0.08 m', '0, 4.92, 9.84, 4.96, 0.08'],
              ['loop closure 분산 ≈ 0', '0.4 ÷ 4 = 0.1 m', '0, 4.9, 9.8, 4.9, 0'],
            ]}
            widths={[300, 320, 400]}
            at={18.2}
            step={1.2}
            size={23}
            colors={[C.accent, C.text]}
          />
          <span style={{ ...line(C.text, 24), opacity: prog(t, 21.4) }}>edge 하나가 떠안는 양 = 전체 어긋남 × (그 edge 의 분산 ÷ 고리 위 분산의 합)</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 22.6) }}>분산이 큰 측정일수록 많이 고친다 · Kalman gain 과 같은 원리 · 2D 는 Ceres 로 비선형 최적화</span>
        </div>
      </Panel>
      <Box x={1196} y={140} w={660} h={400} at={0.3} title={<Head color={C.accent}>pose graph</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 0.6) }}>node: scan 을 찍은 순간의 로봇 자세 (x, y, 각도)</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.6) }}>
          slam_toolbox: <span style={mono(C.accent, 23)}>0.5 m</span> 또는 <span style={mono(C.accent, 23)}>0.5 rad</span> (약 29°) 마다 node 하나
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.3) }}>edge: 두 node 사이의 상대 이동과 그 불확실성</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 9) }}>
          <span style={{ color: C.red }}>loop closure</span>: 돌아온 곳에서 멀리 떨어진 두 node 를 잇는 edge
        </span>
      </Box>
      <Box x={1196} y={560} w={660} h={320} at={24} color={`${C.red}88`} title={<Head color={C.red}>오해 · loop closure 는 많을수록 좋다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.4) }}>서로 다른 두 복도를 잘못 이은 edge 하나가 사이의 모든 node 를 끌어당겨 지도 전체를 휘게 한다</span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 26.4) }}>그래서 점수 문턱 0.35 · 0.45 와 이어진 scan 10 개 이상 같은 조건으로 고른다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: slam_toolbox and saving the map ----------

function FlowBox({ x, y, w, h, color, lines, at, t }: { x: number; y: number; w: number; h: number; color: string; lines: [string, boolean][]; at: number; t: number }) {
  const lh = 32
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2 + 8
  return (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={`${color}14`} stroke={`${color}99`} strokeWidth={2} />
      {lines.map(([s, m], i) => (
        <text key={i} x={x + w / 2} y={top + i * lh} textAnchor="middle" fill={i === 0 ? color : C.muted} fontSize={m ? 23 : 21} fontFamily={m ? MONO : undefined} fontWeight={i === 0 ? 600 : 500}>
          {s}
        </text>
      ))}
    </g>
  )
}

function Toolbox() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={380}>
        <svg width={1792} height={380}>
          <text x={40} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            Nav2 문서가 SLAM 에 권하는 package
          </text>
          <FlowBox x={40} y={80} w={400} h={90} color={C.blue} lines={[['/scan', true], ['LiDAR 값', false]]} at={0.5} t={t} />
          <FlowBox x={40} y={210} w={400} h={90} color={C.blue} lines={[['odom → base_footprint', true], ['odometry · EKF 가 내는 tf', false]]} at={0.9} t={t} />
          {arrow(440, 125, 560, 170, C.muted, 3, 12, prog(t, 1.2))}
          {arrow(440, 255, 560, 210, C.muted, 3, 12, prog(t, 1.2))}
          <FlowBox x={560} y={100} w={460} h={180} color={C.accent} lines={[['slam_toolbox', true], ['0.5 m · 0.5 rad 마다 node', false], ['pose graph 최적화', false]]} at={1.4} t={t} />
          {arrow(1020, 170, 1140, 125, C.muted, 3, 12, prog(t, 6.6))}
          {arrow(1020, 210, 1140, 255, C.muted, 3, 12, prog(t, 9))}
          <FlowBox x={1140} y={80} w={460} h={90} color={C.green} lines={[['/map', true], ['5 초마다 (map_update_interval)', false]]} at={6.8} t={t} />
          <FlowBox x={1140} y={210} w={460} h={90} color={C.orange} lines={[['map → odom tf', true], ['0.02 초마다 · 50 Hz', false]]} at={9.2} t={t} />
          <text x={40} y={350} fill={C.muted} fontSize={22} opacity={prog(t, 10.8)}>
            odom → base_footprint 는 끊김 없이 이어지지만 오차가 쌓이고, map → odom 이 그 쌓인 오차를 덜어 낸다
          </text>
        </svg>
      </Panel>
      <Box x={64} y={550} w={880} h={330} at={13} color={`${C.blue}88`} title={<Head color={C.blue}>synchronous mode</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 13.3) }}>들어온 scan 을 버리지 않고 쌓아 두었다가 차례로 처리한다</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 15.5) }}>지도 품질이 중요할 때 · 녹화한 데이터를 처리할 때</span>
      </Box>
      <Box x={976} y={550} w={880} h={330} at={20.5} color={`${C.orange}88`} title={<Head color={C.orange}>asynchronous mode</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 20.8) }}>앞 scan 처리가 끝난 시점에 와 있는 새 scan 만 처리한다</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 22.8) }}>loop closure 가 오래 걸려도 실시간보다 뒤처지지 않지만, 일부 scan 은 지도에 빠질 수 있다</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 24.8) }}>로봇이 움직이며 위치를 바로 써야 하면 이쪽</span>
      </Box>
    </AbsoluteFill>
  )
}

function Save() {
  const t = useSec()
  const thr: [string, string, string, number][] = [
    ['#fefefe', '0.25 이하 → 254', '흰색 · 비어 있음', 18.4],
    ['#000000', '0.65 이상 → 0', '검은색 · 차 있음', 19.6],
    ['#cdcdcd', '그 사이 · −1 → 205', '회색 · 모름', 20.8],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.accent}>24,000 m² 공간의 지도 한 장 (칸 하나 1 byte)</Head>}>
        <Table
          head={['칸 크기', '칸 수', '/map 메시지 하나']}
          rows={[
            ['10 cm', '240 만', '약 2.4 MB'],
            ['5 cm', '960 만', '약 9.6 MB'],
            ['2.5 cm', '3,840 만', '약 38.4 MB'],
          ]}
          widths={[240, 260, 300]}
          at={0.8}
          monoFrom={0}
          colors={[C.muted, C.accent, C.orange]}
        />
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 3) }}>칸 크기를 반으로 줄이면 칸 수는 네 배</span>
      </Box>
      <Box x={976} y={140} w={880} h={330} at={6} title={<Head color={C.orange}>LDS-01 거리 정확도 ±5%</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 6.4) }}>
          3 m 앞 벽: <span style={mono(C.orange, 25)}>±3 × 0.05 = ±0.15 m</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 8) }}>이 30 cm 폭에 5 cm 칸은 6 개, 2.5 cm 칸은 12 개</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 9.6) }}>칸을 줄여도 벽은 센서보다 정확해지지 않고, 벽 점이 두 배 많은 칸에 번져 찍힌다</span>
      </Box>
      <Card x={64} y={500} w={1792} h={380} at={12}>
        <svg width={1792} height={380} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={40} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            지도 저장 · Nav2 map saver
          </text>
          <FlowBox x={40} y={110} w={300} h={90} color={C.accent} lines={[['map_saver_cli', true], ['-f ~/map', true]]} at={12.2} t={t} />
          {arrow(340, 140, 410, 110, C.muted, 3, 12, prog(t, 12.8))}
          {arrow(340, 170, 410, 200, C.muted, 3, 12, prog(t, 13.4))}
          <FlowBox x={410} y={70} w={290} h={80} color={C.green} lines={[['map.pgm', true], ['지도 그림', false]]} at={13} t={t} />
          <FlowBox x={410} y={170} w={290} h={80} color={C.green} lines={[['map.yaml', true], ['칸 크기 · origin · 문턱', false]]} at={13.6} t={t} />
          {arrow(700, 160, 770, 160, C.muted, 3, 12, prog(t, 15))}
          <FlowBox x={770} y={115} w={290} h={90} color={C.blue} lines={[['map_server', true], ['→ AMCL', true]]} at={15.2} t={t} />
        </svg>
        <div style={{ position: 'absolute', left: 1120, top: 24, width: 640, display: 'grid', gap: 14, opacity: prog(t, 18) }}>
          <Head color={C.orange} size={26}>
            저장할 때의 두 문턱 · pgm 의 밝기
          </Head>
          {thr.map(([sw, a, b, at]) => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at) }}>
              <span style={{ width: 30, height: 30, borderRadius: 6, background: sw, border: `1.5px solid ${C.muted}`, display: 'inline-block' }} />
              <span style={{ ...mono(C.text, 23), width: 300 }}>{a}</span>
              <span style={line(C.muted, 23)}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 40, top: 280, width: 1712, display: 'grid', gap: 6, opacity: prog(t, 24.3) }}>
          <span style={line(C.text, 24)}>pgm 에는 칸의 색만 남는다 → 이어 그리려면 serialize_map 으로 pose graph 와 raw scan 을 함께 저장</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.orange, text: 'odometry 만 쌓으면 60 m 고리 끝에서 0.78 m · 1° 오차면 3 m 앞 벽이 0.052 m 밀림', at: 0.6 },
    { tag: script.sections[1], color: C.accent, text: '맞음 +0.85 · 지나감 −0.41 을 log-odds 로 더함 · 0.5 는 빈 칸이 아니라 모르는 칸', at: 4.4 },
    { tag: script.sections[2], color: C.red, text: 'scan matching 으로 odometry 를 고치고, 고리의 어긋남 0.4 m 를 분산 비율로 나눔', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: '/map 5 초 · map → odom 50 Hz · map_saver_cli 로 pgm · yaml 저장 → AMCL', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            지도도 위치도 없이 출발한 로봇은 어떻게 반듯한 지도를 얻을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 31, fontWeight: 600 }}>{it.text}</span>
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
            NEXT · ESTIMATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Visual SLAM · VIO</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            카메라 사진 여러 장에서 같은 점을 찾아 거리를 구하고, 경로와 지도를 함께 최적화
          </Label>
        </Appear>
        <Appear at={2}>
          <Label color={C.muted} size={30}>
            저장한 지도 위에서 경로를 계획하는 방법은 Path Planning 에서
          </Label>
        </Appear>
        <Appear at={2.6} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/lidar-slam (Moravec · Besl · Lu · Olson · Cartographer · slam_toolbox 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseDrift = () => (
  <PauseWrite
    question="회전을 2° 틀리게 센 뒤 30 m 를 곧게 달렸다. odometry 위치는 옆으로 얼마나 벗어나 있을까?"
    answer={
      <>
        30 × sin 2° = 30 × 0.0349 ≈ 1.05 m
        <br />
        거리를 정확히 셌어도 방향이 틀리면 이만큼 어긋난다
      </>
    }
  />
)

const PauseLogOdds = () => (
  <PauseWrite
    question="빛이 맞으면 +0.85, 지나가면 −0.41 을 더한다. 처음 0.5 인 칸에 맞음, 맞음, 지나감이 차례로 들어오면 차 있을 확률은?"
    answer={
      <>
        0 + 0.85 + 0.85 − 0.41 = 1.29 → 확률로 되돌리면 ≈ 0.78
        <br />
        순서를 바꿔도 더하기라서 결과는 같다
      </>
    }
  />
)

const PauseLoop = () => (
  <PauseWrite
    question="odometry edge 가 +3.0, +3.0, −2.9, −2.9 m 이고, 첫 node 와 같은 자리라는 loop closure edge 의 분산이 0 에 가깝다. 고친 뒤 odometry edge 하나는?"
    answer={
      <>
        3.0 + 3.0 − 2.9 − 2.9 = 0.2 m → 0.2 ÷ 4 = 0.05 m 씩
        <br />
        갈 때 2.95 m, 올 때 −2.95 m → 끝 위치 0
      </>
    }
  />
)

const PauseSave = () => (
  <PauseWrite
    question="50 m × 40 m 창고를 5 cm 칸으로 그리면 칸은 몇 개이고, 2.5 cm 로 줄이면 몇 배가 될까?"
    answer={
      <>
        50 ÷ 0.05 = 1,000 칸 × 40 ÷ 0.05 = 800 칸 → 80 만 칸
        <br />
        2.5 cm 면 2 × 2 = 4 배인 320 만 칸
      </>
    }
  />
)

export function LidarSlam() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        cycle: Cycle,
        drift: Drift,
        'pause-drift': PauseDrift,
        grid: Grid,
        logodds: LogOdds,
        'pause-logodds': PauseLogOdds,
        scan: ScanMatch,
        loop: Loop,
        'pause-loop': PauseLoop,
        toolbox: Toolbox,
        save: Save,
        'pause-save': PauseSave,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
