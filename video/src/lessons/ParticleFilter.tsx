import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './particle-filter.narration.json'
import { script } from './particle-filter.script'

// Numbers follow lessons/particle-filter/README.md (see particle-filter.script.ts). The corridor belief, the five-particle
// cycle, the likelihood-field tiles, the resampling bars and the KLD curve redraw the lesson's figures from its numbers; the
// particle clouds are schematic (marked 모식도).

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, fmt, sub, labelW = 200 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
      {sub && <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
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
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line that fades in at `at` */
function Line({ at, children, style }: { at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <span style={{ ...line(), ...style, opacity: prog(t, at) }}>{children}</span>
}

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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.5, size = 22, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 4 }}>
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

/** deterministic noise for the schematic particle clouds */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
const normal = (i: number) => Math.sqrt(-2 * Math.log(Math.max(1e-6, rnd(2 * i + 1)))) * Math.cos(2 * Math.PI * rnd(2 * i + 2))
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            ESTIMATION · PARTICLE FILTER
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Particle Filter</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={{ color: C.accent }}>예측 · 가중치 · resampling</span> 을 되풀이하는 점 수백 ~ 수천 개
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            봉우리가 여럿인 위치의 믿음을, 후보 점의 배치로 나타내는 방법
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

/** the same LiDAR fan drawn from (x, y), pointing toward the room on side `dir` (−1 left, +1 right) */
function Fan({ x, y, dir, color }: { x: number; y: number; dir: number; color: string }) {
  const rays = [-60, -40, -20, 0, 20, 40, 60].map((deg) => {
    const a = (deg * Math.PI) / 180
    const dx = Math.cos(a) * dir
    const dy = Math.sin(a)
    // hit the corridor walls (y 110 / 270) or the far wall of the room (70 px beyond the door wall)
    const tWall = dy === 0 ? Infinity : dy > 0 ? (262 - y) / dy : (118 - y) / dy
    const tFar = 150 / Math.abs(dx)
    const len = Math.min(tWall, tFar)
    return [x + dx * len, y + dy * len] as const
  })
  return (
    <g>
      {rays.map(([ex, ey], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={1.5} opacity={0.6} />
          <circle cx={ex} cy={ey} r={4} fill={color} />
        </g>
      ))}
      <circle cx={x} cy={y} r={16} fill={C.card} stroke={C.text} strokeWidth={3} />
    </g>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={340}>
        <svg width={1792} height={340}>
          <text x={40} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            복도 양쪽 끝에 똑같이 생긴 회의실이 하나씩 있는 사무실
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={80} y1={110} x2={1712} y2={110} stroke={C.muted} strokeWidth={4} />
            <line x1={80} y1={270} x2={1712} y2={270} stroke={C.muted} strokeWidth={4} />
            <line x1={80} y1={110} x2={80} y2={270} stroke={C.muted} strokeWidth={4} />
            <line x1={1712} y1={110} x2={1712} y2={270} stroke={C.muted} strokeWidth={4} />
            {[330, 1462].map((wx) => (
              <g key={wx}>
                <line x1={wx} y1={110} x2={wx} y2={160} stroke={C.muted} strokeWidth={4} />
                <line x1={wx} y1={220} x2={wx} y2={270} stroke={C.muted} strokeWidth={4} />
              </g>
            ))}
            <text x={170} y={198} textAnchor="middle" fill={C.muted} fontSize={24}>
              회의실
            </text>
            <text x={1622} y={198} textAnchor="middle" fill={C.muted} fontSize={24}>
              회의실
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            <Fan x={420} y={190} dir={-1} color={C.blue} />
            <Fan x={1372} y={190} dir={1} color={C.blue} />
            <text x={420} y={310} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              후보 ① 왼쪽 문 앞
            </text>
            <text x={1372} y={310} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              후보 ② 오른쪽 문 앞
            </text>
          </g>
          <text x={896} y={200} textAnchor="middle" fill={C.orange} fontSize={26} fontWeight={600} opacity={prog(t, 2.2)}>
            두 자리의 LiDAR scan 이 똑같다
          </text>
        </svg>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 505, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          두 후보를 함께 남기려면 <span style={{ color: C.accent }}>위치를 어떤 모양으로 기억해야 할까?</span>
        </div>
      </Appear>
      <Card x={300} y={610} w={1320} h={270} at={5.4}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12 }}>
          <Line at={5.6}>
            <span style={{ color: C.orange, fontWeight: 600 }}>Kalman filter</span> 는 위치를 평균 하나와 분산 하나로 기억한다
          </Line>
          <Line at={6.2} style={{ color: C.muted }}>
            맞는 답 &quot;왼쪽 문 앞이거나 오른쪽 문 앞&quot; 은 이 형식으로 적을 수 없다
          </Line>
          <Line at={6.8}>
            <span style={{ color: C.green, fontWeight: 600 }}>Particle filter</span> 는 후보를 점 수백 ~ 수천 개로 뿌리고, 옮기고, 센서와 맞는 점만 남긴다
          </Line>
          <Line at={7.3} style={{ color: C.muted, fontSize: 22 }}>
            MCL (Dellaert, Fox, Burgard, Thrun 1999) · 안내 로봇 MINERVA 는 75 분 동안 2200 m 넘게 달리며 위치를 한 번도 잃지 않았다
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. multimodal belief ----------

const MX = (m: number) => 80 + m * 52
const AXIS = 380

function beliefPath() {
  const pts: string[] = []
  for (let m = 0; m <= 20.0001; m += 0.02) {
    const b = Math.exp(-((m - 4) ** 2) / (2 * 0.16)) + Math.exp(-((m - 14) ** 2) / (2 * 0.16))
    pts.push(`${MX(m).toFixed(1)},${(AXIS - 190 * b).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

function gaussPath() {
  const pts: string[] = []
  for (let m = 0; m <= 20.0001; m += 0.1) pts.push(`${MX(m).toFixed(1)},${(AXIS - 90 * Math.exp(-((m - 9) ** 2) / 50)).toFixed(1)}`)
  return `M${pts.join(' L')}`
}

const CLUSTER = Array.from({ length: 60 }, (_, i) => ({ m: (i < 30 ? 4 : 14) + 0.4 * clamp(normal(i), -2.2, 2.2), y: 344 + 26 * rnd(i + 300) }))

function Multimodal() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={480}>
        <svg width={1180} height={480}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            길이 20 m 복도 · 문은 4 m 와 14 m
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={MX(0)} y1={AXIS} x2={MX(20)} y2={AXIS} stroke={C.muted} strokeWidth={2} />
            {Array.from({ length: 11 }, (_, i) => i * 2).map((m) => (
              <g key={m}>
                <line x1={MX(m)} y1={AXIS} x2={MX(m)} y2={AXIS + 8} stroke={C.muted} strokeWidth={2} />
                <text x={MX(m)} y={AXIS + 32} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {m}
                </text>
              </g>
            ))}
            <text x={1150} y={452} textAnchor="end" fill={C.muted} fontSize={20}>
              위치 (m)
            </text>
            {[4, 14].map((m) => (
              <g key={m}>
                <rect x={MX(m) - 18} y={62} width={36} height={46} rx={4} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2} />
                <text x={MX(m)} y={140} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
                  문
                </text>
              </g>
            ))}
          </g>
          <path d={beliefPath()} fill="none" stroke={C.green} strokeWidth={3.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 6.5, 2)} />
          <g opacity={prog(t, 8.5)}>
            {CLUSTER.map((p, i) => (
              <circle key={i} cx={MX(p.m)} cy={p.y} r={5} fill={C.blue} opacity={0.85} />
            ))}
            <text x={MX(4) - 40} y={300} textAnchor="end" fill={C.blue} fontSize={20} fontWeight={600}>
              particle 무리 ①
            </text>
            <text x={MX(14) + 40} y={300} fill={C.blue} fontSize={20} fontWeight={600}>
              particle 무리 ②
            </text>
          </g>
          <g opacity={prog(t, 12.5)}>
            <path d={gaussPath()} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="10 8" />
            <text x={MX(9)} y={205} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              Gaussian 하나: 평균 9 m · σ 약 5 m
            </text>
          </g>
          <g opacity={prog(t, 18.7)}>
            <line x1={MX(9)} y1={255} x2={MX(9)} y2={AXIS} stroke={C.red} strokeWidth={2.5} strokeDasharray="6 6" />
            <text x={MX(9)} y={240} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={700}>
              9 m 에는 문이 없다
            </text>
          </g>
          <text x={30} y={452} fill={C.dim} fontSize={20} opacity={prog(t, 9)}>
            초록 실선: 문을 본 뒤의 belief · 파란 점: particle · 주황 점선: Gaussian 하나
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={230} at={6.3} title={<Head color={C.green}>belief (믿음)</Head>}>
        <Line at={6.6} style={{ fontSize: 23 }}>
          위치마다 로봇이 있을 확률을 적은 분포
        </Line>
        <Line at={8} style={{ fontSize: 23, color: C.muted }}>
          문을 본 뒤에는 4 m 와 14 m 에 봉우리가 하나씩, 나머지 자리는 거의 0
        </Line>
      </Box>
      <Box x={1276} y={390} w={580} h={230} at={12.3} gap={10} title={<Head color={C.orange}>Gaussian 하나로 맞추면</Head>}>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 12.8) }}>(4 + 14) ÷ 2 = 9 m</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15) }}>
          σ <span style={mono(C.orange, 24)}>약 5 m</span> · 9 m 근처가 가장 그럴듯해 보인다
        </span>
        <span style={{ ...line(C.red, 23), fontWeight: 600, opacity: prog(t, 18.7) }}>9 m 에는 문이 없어 로봇이 있을 리 없다</span>
      </Box>
      <Box x={64} y={650} w={1792} h={230} at={24.3} title={<Head color={C.blue}>Dellaert 등 1999 · Bonn 대학 건물의 로봇 RHINO</Head>}>
        <Flow steps={['sample 20,000 개를 지도의 빈 곳에 고르게', '방에 들어설 즈음 두 곳에 모임', '두 방의 sonar 가 달라 하나로']} color={C.blue} at={24.6} gap={0.9} />
        <Line at={27} style={{ fontSize: 22, color: C.muted }}>
          하나는 실제 위치였고, 다른 하나는 복도가 대칭이라 생긴 후보였다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

/** a small cloud of particles for the 'any shape' panel */
function Cloud({ ox, kind, t, at }: { ox: number; kind: 'two' | 'three' | 'band'; t: number; at: number }) {
  const centres = kind === 'two' ? [[70, 100], [190, 100]] : kind === 'three' ? [[60, 70], [190, 60], [130, 160]] : []
  const pts = Array.from({ length: 54 }, (_, i) => {
    const s = i + (kind === 'two' ? 0 : kind === 'three' ? 100 : 200)
    if (kind === 'band') {
      const u = rnd(s + 7)
      return [20 + 220 * u, 160 - 120 * u + 12 * normal(s)]
    }
    const c = centres[i % centres.length]
    return [c[0] + 16 * normal(s), c[1] + 16 * normal(s + 50)]
  })
  return (
    <g transform={`translate(${ox} 0)`} opacity={prog(t, at)}>
      <rect x={0} y={0} width={260} height={200} rx={12} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={clamp(x, 8, 252)} cy={clamp(y, 8, 192)} r={4.5} fill={C.blue} opacity={0.85} />
      ))}
      <text x={130} y={236} textAnchor="middle" fill={C.text} fontSize={22}>
        {kind === 'two' ? '봉우리 둘' : kind === 'three' ? '봉우리 셋' : '띠 모양'}
      </text>
    </g>
  )
}

const SMALL = [
  [60, 60, 20], [92, 82, 35], [130, 52, 10], [70, 200, -15], [120, 214, 40], [300, 70, 80], [330, 200, 25], [280, 226, -30], [52, 140, 60], [340, 140, 5],
] as const

function Particles() {
  const t = useSec()
  const hx = 200
  const hy = 130
  const a = (30 * Math.PI) / 180
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={340} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 22 }}>
          <Head color={C.blue}>particle 하나 = 후보 하나</Head>
        </div>
        <svg width={830} height={260} style={{ position: 'absolute', left: 30, top: 70 }}>
          <g opacity={prog(t, 0.6)}>
            <rect x={10} y={10} width={370} height={240} rx={10} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
            {SMALL.map(([x, y, d], i) => {
              const r = (d * Math.PI) / 180
              return (
                <g key={i} opacity={0.6}>
                  <circle cx={x} cy={y} r={5} fill={C.blue} />
                  <line x1={x} y1={y} x2={x + 18 * Math.cos(r)} y2={y - 18 * Math.sin(r)} stroke={C.blue} strokeWidth={2} />
                </g>
              )
            })}
          </g>
          <g opacity={prog(t, 1.2)}>
            <line x1={hx} y1={hy} x2={hx + 62} y2={hy} stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" />
            {arrow(hx, hy, hx + 70 * Math.cos(a), hy - 70 * Math.sin(a), C.accent, 3.5, 13)}
            <path d={`M${hx + 36},${hy} A36,36 0 0 0 ${hx + 36 * Math.cos(a)},${hy - 36 * Math.sin(a)}`} fill="none" stroke={C.orange} strokeWidth={2.5} />
            <circle cx={hx} cy={hy} r={9} fill={C.accent} />
            <text x={hx + 76} y={hy - 6} fill={C.orange} fontSize={26} fontWeight={700}>
              θ
            </text>
            <text x={hx} y={hy + 40} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (x, y)
            </text>
          </g>
          <g opacity={prog(t, 2)} fontSize={24}>
            <text x={420} y={50} fill={C.accent} fontFamily={MONO} fontWeight={600}>
              x, y
            </text>
            <text x={510} y={50} fill={C.text}>
              위치
            </text>
            <text x={420} y={100} fill={C.orange} fontWeight={700}>
              θ
            </text>
            <text x={510} y={100} fill={C.text}>
              바라보는 방향
            </text>
            <text x={420} y={150} fill={C.green} fontFamily={MONO} fontWeight={600}>
              w
            </text>
            <text x={510} y={150} fill={C.text}>
              가중치 (그럴듯한 정도)
            </text>
            <text x={420} y={210} fill={C.muted} fontSize={21}>
              세 숫자 + 가중치 = particle 하나
            </text>
          </g>
        </svg>
      </Card>
      <Card x={956} y={140} w={900} h={340} at={6.5}>
        <div style={{ position: 'absolute', left: 28, top: 22, right: 28, display: 'flex', justifyContent: 'space-between' }}>
          <Head color={C.blue}>점이 촘촘한 곳일수록 확률이 높다</Head>
          <Label size={20} color={C.dim}>
            모식도
          </Label>
        </div>
        <svg width={860} height={250} style={{ position: 'absolute', left: 28, top: 76 }}>
          <Cloud ox={0} kind="two" t={t} at={7} />
          <Cloud ox={285} kind="three" t={t} at={8.2} />
          <Cloud ox={570} kind="band" t={t} at={9.4} />
        </svg>
      </Card>
      <Box x={64} y={510} w={860} h={370} at={13} title={<Head color={C.orange}>grid 로 나누면 칸이 너무 많다</Head>}>
        <Line at={13.3} style={{ fontSize: 23 }}>
          20 m × 20 m 를 5 cm 칸과 1° 방향으로 나누면
        </Line>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 14) }}>400 × 400 × 360 ≈ 5,800 만 칸</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 16) }}>
          particle 2000 개는 숫자 4 개씩 → <span style={mono(C.green, 24)}>2000 × 4 = 8000 개</span>
        </span>
        <Line at={17.5} style={{ fontSize: 22, color: C.muted }}>
          particle 은 로봇이 있을 법한 곳에만 모인다 · Dellaert 등: 같은 정확도에 grid 는 4 cm 칸까지 필요
        </Line>
      </Box>
      <Box x={956} y={510} w={900} h={370} at={19.5} title={<Head color={C.purple}>상태의 숫자가 늘면 칸이 곱으로 는다</Head>}>
        <Line at={19.8} style={{ fontSize: 23 }}>
          10 m × 10 m 를 0.5 m × 0.5 m × 10° 로 나누면
        </Line>
        <Bar label="x, y, θ" value={14400} max={288000} color={C.purple} at={20.3} width={300} fmt="14,400 칸" sub="20 × 20 × 36" />
        <Bar label="+ 높이 10 m" value={288000} max={288000} color={C.red} at={21.5} width={300} fmt="288,000 칸" sub="× 20" />
        <Line at={23} style={{ fontSize: 22, color: C.muted }}>
          그래서 x, y, θ 처럼 숫자가 적은 상태에 쓰고, 상태가 수십 개면 Kalman filter 계열을 쓴다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseGauss = () => (
  <PauseWrite
    question="봉우리 하나의 σ 가 0.4 m 이고, 두 봉우리가 평균 9 m 에서 5 m 씩 떨어져 있다. 이 belief 를 Gaussian 하나로 맞추면 분산과 σ 는?"
    answer={
      <>
        분산 = 봉우리 하나의 분산 + 떨어진 거리의 제곱 = 0.4² + 5² ≈ 25.2 m² → σ 약 5 m
        <br />
        9 m 근처가 가장 그럴듯하다고 나오지만, 9 m 에는 문이 없다
      </>
    }
  />
)

// ---------- 2. one cycle ----------

const CX = (m: number) => 150 + (m - 3) * (800 / 3)
const INIT = [4.0, 4.2, 3.7, 4.6, 3.3]
const MOVED = [5.0, 5.3, 4.6, 5.8, 4.1]
const WEIGHT = [0.46, 0.39, 0.12, 0.03, 0.0]

function CycleRow({ y0, label, color, at, t, right, children }: { y0: number; label: string; color: string; at: number; t: number; right?: ReactNode; children: ReactNode }) {
  return (
    <g opacity={prog(t, at)}>
      <text x={20} y={y0 + 28} fill={color} fontSize={23} fontWeight={600}>
        {label}
      </text>
      {right}
      <line x1={CX(3)} y1={y0 + 118} x2={CX(6)} y2={y0 + 118} stroke={C.muted} strokeWidth={2} />
      {[3, 4, 5, 6].map((m) => (
        <g key={m}>
          <line x1={CX(m)} y1={y0 + 118} x2={CX(m)} y2={y0 + 126} stroke={C.muted} strokeWidth={2} />
          <text x={CX(m)} y={y0 + 148} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {m} m
          </text>
        </g>
      ))}
      <line x1={CX(5.1)} y1={y0 + 106} x2={CX(5.1)} y2={y0 + 130} stroke={C.red} strokeWidth={3} />
      {children}
    </g>
  )
}

function Cycle() {
  const t = useSec()
  const slide = prog(t, 7.2, 1.6)
  const rows = [20, 195, 370, 545]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <CycleRow
            y0={rows[0]}
            label="처음 particle"
            color={C.blue}
            at={0.3}
            t={t}
            right={
              <text x={980} y={rows[0] + 28} textAnchor="end" fill={C.red} fontSize={20}>
                빨간 눈금: 실제 로봇 5.1 m (로봇은 모른다)
              </text>
            }
          >
            {INIT.map((m, i) => (
              <g key={i}>
                <circle cx={CX(m)} cy={rows[0] + 88} r={9} fill={C.blue} />
                <text x={CX(m)} y={rows[0] + 62} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO}>
                  {m.toFixed(1)}
                </text>
              </g>
            ))}
          </CycleRow>
          <CycleRow
            y0={rows[1]}
            label="① 예측"
            color={C.accent}
            at={6.5}
            t={t}
            right={
              <text x={980} y={rows[1] + 28} textAnchor="end" fill={C.accent} fontSize={20}>
                odometry 1 m + 각자 뽑은 noise
              </text>
            }
          >
            {INIT.map((m, i) => (
              <g key={i}>
                <circle cx={CX(m)} cy={rows[1] + 88} r={8} fill="none" stroke={C.dim} strokeWidth={1.5} strokeDasharray="3 3" />
                <circle cx={CX(lerp(m, MOVED[i], slide))} cy={rows[1] + 88} r={9} fill={C.accent} />
                <text x={CX(MOVED[i])} y={rows[1] + 62} textAnchor="middle" fill={C.accent} fontSize={20} fontFamily={MONO} opacity={prog(t, 8.8)}>
                  {MOVED[i].toFixed(1)}
                </text>
              </g>
            ))}
          </CycleRow>
          <CycleRow
            y0={rows[2]}
            label="② 가중치"
            color={C.green}
            at={12.8}
            t={t}
            right={
              <text x={980} y={rows[2] + 28} textAnchor="end" fill={C.green} fontSize={20}>
                LiDAR 가 잰 벽(20 m)까지 14.9 m
              </text>
            }
          >
            {MOVED.map((m, i) => (
              <g key={i}>
                <circle cx={CX(m)} cy={rows[2] + 88} r={6 + 16 * Math.sqrt(WEIGHT[i]) * prog(t, 19.5, 1)} fill={C.green} opacity={WEIGHT[i] > 0 ? 0.9 : 0.35} />
                <text x={CX(m)} y={rows[2] + 56} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 20 + 0.3 * i)}>
                  {WEIGHT[i].toFixed(2)}
                </text>
              </g>
            ))}
          </CycleRow>
          <CycleRow
            y0={rows[3]}
            label="③ resampling"
            color={C.orange}
            at={25.5}
            t={t}
            right={
              <text x={980} y={rows[3] + 28} textAnchor="end" fill={C.orange} fontSize={20}>
                개수는 5 개 그대로
              </text>
            }
          >
            {[
              [5.0, 2],
              [5.3, 2],
              [4.6, 1],
            ].map(([m, n]) => (
              <g key={m} opacity={prog(t, 26.2)}>
                {Array.from({ length: n }, (_, k) => (
                  <circle key={k} cx={CX(m)} cy={rows[3] + (n === 2 ? 78 + 22 * k : 88)} r={8} fill={C.orange} />
                ))}
                <text x={CX(m)} y={rows[3] + 60} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
                  × {n}
                </text>
              </g>
            ))}
            {[5.8, 4.1].map((m) => (
              <circle key={m} cx={CX(m)} cy={rows[3] + 88} r={8} fill="none" stroke={C.red} strokeWidth={1.5} strokeDasharray="3 3" opacity={prog(t, 27)} />
            ))}
          </CycleRow>
        </svg>
      </Panel>
      <Card x={1096} y={140} w={760} h={740} at={6.5}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <Head color={C.accent}>① 예측</Head>
            <span style={{ ...line(C.text, 23), opacity: prog(t, 7) }}>
              noise 를 더한 이동 <span style={mono(C.accent, 22)}>1.0 · 1.1 · 0.9 · 1.2 · 0.8 m</span>
            </span>
            <Line at={10} style={{ fontSize: 22, color: C.muted }}>
              Kalman filter 의 Q 대신, particle 이 퍼진 정도가 불확실성
            </Line>
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 12.8) }}>
            <Head color={C.green}>② 가중치</Head>
            <span style={mono(C.green, 22)}>점수 = exp(−차이² ÷ (2 × 0.3²)) · σ = 0.3 m</span>
            <Table
              head={['particle', '예상 거리', '차이', '점수', '가중치']}
              widths={[130, 150, 130, 130, 130]}
              at={13.6}
              colors={[C.green]}
              rows={[
                ['5.0 m', '15.0 m', '0.1 m', '0.95', '0.46'],
                ['5.3 m', '14.7 m', '0.2 m', '0.80', '0.39'],
                ['4.6 m', '15.4 m', '0.5 m', '0.25', '0.12'],
                ['5.8 m', '14.2 m', '0.7 m', '0.07', '0.03'],
                ['4.1 m', '15.9 m', '1.0 m', '0.004', '0.00'],
              ]}
            />
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 19.5) }}>
            <span style={mono(C.text, 22)}>합 0.95 + 0.80 + 0.25 + 0.07 + 0.004 ≈ 2.07</span>
            <span style={mono(C.green, 22)}>0.95 ÷ 2.07 ≈ 0.46</span>
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 25.5) }}>
            <Head color={C.orange}>③ resampling</Head>
            <span style={line(C.text, 23)}>5 번 다시 뽑기 → 5.0 m, 5.3 m 두 개씩 · 4.6 m 하나 · 가중치는 모두 1/5</span>
            <Line at={28} style={{ fontSize: 22, color: C.muted }}>
              resampling 전 가중 평균 ≈ 5.09 m · 실제 5.1 m 에 가깝다
            </Line>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** one likelihood-field tile: a wall at x 360 with its blue field, a particle and three beams */
function FieldTile({ ox, px, label, color, d, t, at }: { ox: number; px: number; label: string; color: string; d: string[]; t: number; at: number }) {
  const ends = [
    [px + 240, 70],
    [px + 230, 200],
    [px + 250, 330],
  ]
  const labelAt = [
    [px + 230, 55],
    [px + 220, 186],
    [px + 240, 362],
  ]
  return (
    <g transform={`translate(${ox} 70)`}>
      <rect x={0} y={0} width={420} height={400} rx={12} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((i) => {
        const dm = (i + 0.5) * 0.1
        return <rect key={i} x={360 - 20 * (i + 1)} y={10} width={20} height={380} fill={C.blue} opacity={0.5 * Math.exp(-(dm * dm) / 0.08)} />
      })}
      <rect x={360} y={10} width={10} height={380} fill={C.muted} />
      <text x={16} y={32} fill={color} fontSize={22} fontWeight={600}>
        {label}
      </text>
      <g opacity={prog(t, at)}>
        {ends.map(([ex, ey], i) => (
          <g key={i}>
            <line x1={px} y1={200} x2={ex} y2={ey} stroke={color} strokeWidth={2} strokeDasharray={color === C.red ? '7 5' : undefined} />
            <circle cx={ex} cy={ey} r={7} fill={color} />
            <text x={labelAt[i][0]} y={labelAt[i][1]} textAnchor="end" fill={color} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 6.5)}>
              {d[i]}
            </text>
          </g>
        ))}
        <circle cx={px} cy={200} r={11} fill={C.card} stroke={color} strokeWidth={3} />
      </g>
    </g>
  )
}

function Field() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={490}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 scan 을 두 particle 자리에 놓고 끝점을 본다
          </text>
          <g opacity={prog(t, 0.6)}>
            <FieldTile ox={20} px={110} label="particle A" color={C.green} d={['0.05 m', '0.1 m', '0 m']} t={t} at={1.2} />
            <FieldTile ox={460} px={50} label="particle B · 0.3 m 왼쪽" color={C.red} d={['0.35 m', '0.4 m', '0.3 m']} t={t} at={1.8} />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 500, width: 840, display: 'grid', gap: 10 }}>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 13.5) }}>A  0.969 × 0.883 × 1 ≈ 0.855</span>
          <span style={{ ...mono(C.red, 24), opacity: prog(t, 15) }}>B  0.216 × 0.135 × 0.325 ≈ 0.0095</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 17) }}>
            합이 1 이 되게 나누면 → <span style={mono(C.green, 24)}>A 0.99</span> · <span style={mono(C.red, 24)}>B 0.01</span>
          </span>
          <Line at={2.5} style={{ fontSize: 21, color: C.dim }}>
            숫자: beam 끝점에서 가장 가까운 벽까지 d · 파란 음영: 벽에 가까울수록 진한 likelihood field
          </Line>
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={300} at={0.3} title={<Head color={C.blue}>likelihood field: 선 대신 끝점</Head>}>
        <Line at={0.8} style={{ fontSize: 23 }}>
          beam 마다 벽까지 선을 그으면 particle 수 × beam 수만큼 선을 그어야 한다
        </Line>
        <Line at={3} style={{ fontSize: 23, color: C.muted }}>
          끝점에서 가장 가까운 벽까지 거리 d 는 칸마다 미리 계산해 표로 두고, 읽기만 한다
        </Line>
      </Box>
      <Box x={996} y={460} w={860} h={190} at={6.8} title={<Head color={C.green}>beam 점수 = exp(−d² ÷ (2σ²)) · σ = 0.2 m</Head>}>
        <Table
          head={['d', '0 m', '0.1 m', '0.2 m', '0.3 m', '0.4 m', '1.0 m']}
          widths={[100, 100, 100, 100, 100, 100, 150]}
          at={7.3}
          rows={[['점수', '1.00', '0.88', '0.61', '0.32', '0.14', '0.000004']]}
          colors={[C.green]}
        />
      </Box>
      <Box x={996} y={670} w={860} h={210} at={20} title={<Head color={C.orange}>사람에 맞은 beam · z_hit = z_rand = 0.5, 최대 거리 10 m</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.4) }}>
          벽에 닿은 beam <span style={mono(C.green, 24)}>0.5 × 1 + 0.5 ÷ 10 = 0.55</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.5) }}>
          사람에 맞은 beam <span style={mono(C.orange, 24)}>0 + 0.05 = 0.05 → 0.05 ÷ 0.55 ≈ 0.09 배</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseMean = () => (
  <PauseWrite
    question="particle 2.0 · 2.5 · 3.0 m, 가중치 0.2 · 0.5 · 0.3 의 가중 평균은? 10 개로 resampling 하면 몇 개씩?"
    answer={
      <>
        0.2 × 2.0 + 0.5 × 2.5 + 0.3 × 3.0 = 0.4 + 1.25 + 0.9 = 2.55 m
        <br />
        10 × 0.2 = 2 개 · 10 × 0.5 = 5 개 · 10 × 0.3 = 3 개
      </>
    }
  />
)

// ---------- 3. degeneracy and KLD sampling ----------

const BAR = (v: number) => 20 + v * 780
const SEG: [number, number, string, string][] = [
  [0, 0.46, '5.0 m (0.46)', C.green],
  [0.46, 0.85, '5.3 m (0.39)', C.blue],
  [0.85, 0.97, '4.6 m', C.orange],
  [0.97, 1, '', C.red],
]

function WeightBar({ y, t, at }: { y: number; t: number; at: number }) {
  return (
    <g opacity={prog(t, at)}>
      {SEG.map(([a, b, label, color]) => (
        <g key={a}>
          <rect x={BAR(a)} y={y} width={BAR(b) - BAR(a)} height={40} fill={`${color}55`} stroke={color} strokeWidth={1.5} />
          {label && (
            <text x={(BAR(a) + BAR(b)) / 2} y={y + 68} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO} fontWeight={600}>
              {label}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

const BIG = [37, 151, 262]

function Degeneracy() {
  const t = useSec()
  const needles = [0.12, 0.32, 0.52, 0.72, 0.92]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={340} at={0.3} title={<Head color={C.red}>degeneracy: 하나가 가중치를 거의 다 차지</Head>}>
        <svg width={824} height={150}>
          {Array.from({ length: 280 }, (_, i) => {
            const big = BIG.includes(i)
            return <circle key={i} cx={14 + (i % 40) * 20.5} cy={12 + Math.floor(i / 40) * 20.5} r={big ? 8 : 4} fill={big ? C.green : C.dim} opacity={big ? prog(t, 7) : 0.6} />
          })}
        </svg>
        <Line at={6.8} style={{ fontSize: 22, color: C.muted }}>
          Labbe 의 예: 5,000 개 중 의미 있는 가중치는 3 개 · 나머지 4,997 개도 옮기고 점수를 매기지만 추정에 거의 보탬이 없다 (모식도)
        </Line>
      </Box>
      <Box x={64} y={500} w={880} h={380} at={12.8} gap={12} title={<Head color={C.accent}>effective sample size</Head>}>
        <span style={{ ...mono(C.accent, 26), opacity: prog(t, 13.1) }}>N_eff = 1 ÷ Σ w²</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 14.5) }}>1 ÷ (0.46² + 0.39² + 0.12² + 0.03²)</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 16) }}>= 1 ÷ 0.379 ≈ 2.6</span>
        <Line at={17} style={{ fontSize: 23 }}>
          particle 5 개 중 추정에 실제로 보탬이 되는 것은 3 개가 안 된다
        </Line>
        <Line at={17.8} style={{ fontSize: 22, color: C.muted }}>
          Labbe 예제는 N_eff 가 N / 2 아래일 때만 resampling · Nav2 AMCL 은 resample_interval 1 이라 cycle 마다
        </Line>
      </Box>
      <Box x={976} y={140} w={880} h={340} at={19} title={<Head color={C.orange}>multinomial: 난수를 N 번 따로</Head>}>
        <svg width={824} height={80}>
          <WeightBar y={4} t={t} at={19.3} />
        </svg>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 21) }}>(1 − 0.39)⁵ ≈ 0.084 → 약 8%</span>
        <Line at={22.2} style={{ fontSize: 22, color: C.muted }}>
          가중치 0.39 인 5.3 m 가 다섯 번 모두 안 뽑힐 확률 · 운이 나쁘면 무거운 particle 도 사라진다
        </Line>
      </Box>
      <Box x={976} y={500} w={880} h={380} at={25.2} title={<Head color={C.green}>low-variance: 난수 한 번, 바늘 N 개</Head>}>
        <svg width={824} height={120}>
          <WeightBar y={40} t={t} at={25.4} />
          {needles.map((v, i) => {
            const seg = SEG.find(([a, b]) => v >= a && v < b)
            return (
              <g key={v} opacity={prog(t, 26 + 0.3 * i)}>
                <line x1={BAR(v)} y1={22} x2={BAR(v)} y2={84} stroke={seg ? seg[3] : C.text} strokeWidth={3} />
                <text x={BAR(v)} y={16} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                  {v.toFixed(2)}
                </text>
              </g>
            )
          })}
        </svg>
        <Line at={27.5} style={{ fontSize: 23 }}>
          시작점 0.12 를 한 번 뽑고 1/N = 0.2 간격 → 5.0 m × 2 · 5.3 m × 2 · 4.6 m × 1
        </Line>
        <Line at={29} style={{ fontSize: 22, color: C.muted }}>
          가중치 1/N 이상인 particle 은 반드시 하나 이상 남는다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const KX = (k: number) => 110 + k * (570 / 300)
const KY = (n: number) => 400 - n * (340 / 3000)

function Kld() {
  const t = useSec()
  const dashed = [
    [2, 20],
    [50, 588],
    [100, 1129],
    [183, 2009],
  ]
  const green = [
    [0, 500],
    [42.56, 500],
    [50, 588],
    [100, 1129],
    [182.2, 2000],
    [300, 2000],
  ]
  const path = (pts: number[][]) => `M${pts.map(([k, n]) => `${KX(k).toFixed(1)},${KY(n).toFixed(1)}`).join(' L')}`
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={300} at={0.3} title={<Head color={C.orange}>cycle 마다 끝점 계산 = particle 수 × max_beams 60</Head>}>
        <Bar label="500 개" value={30000} max={120000} color={C.orange} at={0.8} labelW={160} fmt="30,000 번" />
        <Bar label="2000 개" value={120000} max={120000} color={C.red} at={3.5} labelW={160} fmt="120,000 번" />
        <Line at={5} style={{ fontSize: 22, color: C.muted }}>
          particle 이 많을수록 belief 가 촘촘하지만 한 cycle 이 길어진다
        </Line>
      </Box>
      <Box x={64} y={460} w={860} h={420} at={6.8} title={<Head color={C.red}>무작정 늘리면</Head>}>
        <Line at={7.1} style={{ fontSize: 23 }}>
          Dellaert 등: sample 수를 늘리면 오차가 줄다가, 한 번 계산이 길어져 그사이 들어온 측정을 버리면서 다시 커진다
        </Line>
        <Line at={9.5} style={{ fontSize: 23 }}>
          Fox: 너무 적으면 위치를 자주 못 찾고, 너무 많으면 한 번 고치는 데 몇 초가 걸려 센서 데이터를 버린다
        </Line>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.5) }}>
          필요한 수도 상황마다 다르다 · 건물 전체에서 처음 찾을 때 <span style={mono(C.text, 22)}>20,000 개</span>, MINERVA 를 따라갈 때 <span style={mono(C.text, 22)}>5000 개</span>
        </span>
      </Box>
      <Card x={956} y={140} w={900} h={460} at={13.3}>
        <svg width={900} height={460}>
          <text x={20} y={40} fill={C.muted} fontSize={20}>
            particle 수
          </text>
          <text x={300} y={40} fill={C.dim} fontSize={20}>
            점선: 제한 없는 KLD 식 · 초록: AMCL 이 쓰는 개수
          </text>
          <line x1={KX(0)} y1={KY(0)} x2={KX(300)} y2={KY(0)} stroke={C.muted} strokeWidth={2} />
          <line x1={KX(0)} y1={KY(0)} x2={KX(0)} y2={KY(3000)} stroke={C.muted} strokeWidth={2} />
          {[0, 100, 200, 300].map((k) => (
            <text key={k} x={KX(k)} y={424} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {k}
            </text>
          ))}
          {[0, 1000, 2000, 3000].map((n) => (
            <text key={n} x={100} y={KY(n) + 6} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {n}
            </text>
          ))}
          <text x={680} y={452} textAnchor="end" fill={C.muted} fontSize={20}>
            bin 수 k · bin = 0.5 m × 0.5 m × 10°
          </text>
          {[500, 2000].map((n) => (
            <line key={n} x1={KX(0)} y1={KY(n)} x2={KX(300)} y2={KY(n)} stroke={C.dim} strokeWidth={1.5} strokeDasharray="2 6" />
          ))}
          <text x={692} y={KY(2000) - 13} fill={C.green} fontSize={20} fontFamily={MONO}>
            max_particles
          </text>
          <text x={692} y={KY(2000) + 25} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
            2000
          </text>
          <text x={692} y={KY(500) - 13} fill={C.green} fontSize={20} fontFamily={MONO}>
            min_particles
          </text>
          <text x={692} y={KY(500) + 25} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
            500
          </text>
          <path d={path(dashed)} fill="none" stroke={C.muted} strokeWidth={2.5} strokeDasharray="8 7" opacity={prog(t, 13.8)} />
          <path d={path(green)} fill="none" stroke={C.green} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 14.3, 2)} />
          <g opacity={prog(t, 15.8)}>
            <circle cx={KX(50)} cy={KY(588)} r={7} fill={C.green} />
            <text x={KX(50) + 18} y={KY(588) + 39} fill={C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
              k = 50 → 588
            </text>
          </g>
          <g opacity={prog(t, 17.3)}>
            <circle cx={KX(100)} cy={KY(1129)} r={7} fill={C.green} />
            <text x={KX(100) + 18} y={KY(1129) + 28} fill={C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
              k = 100 → 1129
            </text>
          </g>
        </svg>
      </Card>
      <Box x={956} y={620} w={900} h={260} at={20} title={<Head color={C.green}>Fox 의 실험 · 기준 분포와의 KL 거리 0.25 아래까지</Head>}>
        <Bar label="고정 개수" value={50000} max={50000} color={C.red} at={20.4} labelW={230} width={380} fmt="50,000 개" />
        <Bar label="KLD sampling 평균" value={3000} max={50000} color={C.green} at={22} labelW={230} width={380} fmt="3,000 개" />
        <Line at={23.8} style={{ fontSize: 22, color: C.muted }}>
          가장 작은 평균 위치 오차: KLD sampling 44 cm · 고정 개수 114 cm
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseNeff = () => (
  <PauseWrite
    question="particle N 개의 가중치가 모두 같을 때와, 하나가 가중치 전부를 가질 때 N_eff = 1 ÷ Σ w² 는 각각 얼마인가?"
    answer={
      <>
        모두 1/N 이면 1 ÷ (N × 1/N²) = N · 모든 particle 이 보탬이 된다
        <br />
        하나가 1, 나머지가 0 이면 1 ÷ 1 = 1 · degeneracy 가 끝까지 간 상태
      </>
    }
  />
)

// ---------- 4. Nav2 AMCL ----------

const SPREAD = Array.from({ length: 70 }, (_, i) => ({ dx: 110 * clamp(normal(i + 500), -2, 2), dy: 27 * clamp(normal(i + 700), -1.8, 1.8) }))

function Motion() {
  const t = useSec()
  const alphas: [string, string][] = [
    ['alpha1', '회전할 때 생기는 회전 noise'],
    ['alpha2', '직진할 때 생기는 회전 noise'],
    ['alpha3', '직진할 때 생기는 직진 noise'],
    ['alpha4', '회전할 때 생기는 직진 noise'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={300} at={0.3} title={<Head color={C.accent}>AMCL 의 motion model</Head>}>
        <Flow steps={['제자리 회전', '직진', '제자리 회전']} color={C.accent} at={0.8} />
        <Line at={2.5} style={{ fontSize: 23 }}>
          odometry 가 알려 준 움직임을 세 동작으로 나누고, 각 동작에 Gaussian noise 를 더해 particle 을 옮긴다
        </Line>
        <Line at={4.2} style={{ fontSize: 22, color: C.muted }}>
          noise 의 크기는 움직인 양에 비례하고, parameter 네 개가 비율을 정한다
        </Line>
      </Box>
      <Box x={996} y={140} w={860} h={300} at={1.5} gap={6} title={<Head color={C.text}>noise parameter (기본값)</Head>}>
        {alphas.map(([name, what], i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 20, opacity: prog(t, 2 + 0.4 * i) }}>
            <span style={{ ...mono(C.accent, 24), width: 120 }}>{name}</span>
            <span style={{ ...mono(C.text, 24), width: 60 }}>0.2</span>
            <span style={line(C.text, 23)}>{what}</span>
          </div>
        ))}
      </Box>
      <Box x={64} y={470} w={900} h={410} at={6.5} title={<Head color={C.blue}>0.25 m 를 똑바로 갔을 때 퍼지는 정도</Head>}>
        <svg width={840} height={190}>
          <g opacity={prog(t, 7)}>
            {arrow(80, 30, 330, 30, C.muted, 3)}
            <text x={344} y={37} fill={C.muted} fontSize={20} fontFamily={MONO}>
              odometry 0.25 m
            </text>
            <circle cx={80} cy={100} r={8} fill={C.text} />
          </g>
          <g opacity={prog(t, 8)}>
            {SPREAD.map((p, i) => (
              <circle key={i} cx={330 + p.dx * prog(t, 8, 1.4)} cy={100 + p.dy * prog(t, 8, 1.4)} r={4.5} fill={C.blue} opacity={0.8} />
            ))}
          </g>
          <g opacity={prog(t, 10)}>
            <line x1={330} y1={168} x2={440} y2={168} stroke={C.orange} strokeWidth={3} />
            <line x1={330} y1={160} x2={330} y2={176} stroke={C.orange} strokeWidth={3} />
            <line x1={440} y1={160} x2={440} y2={176} stroke={C.orange} strokeWidth={3} />
            <text x={456} y={175} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              표준편차 약 0.11 m
            </text>
            <text x={824} y={175} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
          </g>
        </svg>
        <span style={{ ...mono(C.blue, 24), opacity: prog(t, 9.5) }}>√(alpha3 × 0.25²) = √(0.2 × 0.25²) ≈ 0.11 m</span>
        <Line at={11.3} style={{ fontSize: 23 }}>
          방향 noise 도 alpha2 로 같은 계산 → 약 0.11 rad, 6.4°
        </Line>
      </Box>
      <Box x={996} y={470} w={860} h={410} at={13} gap={10} title={<Head color={C.orange}>크기를 정하는 trade-off</Head>}>
        <Line at={13.3} style={{ fontSize: 22 }}>
          너무 줄이면 → 바퀴가 미끄러질 때 particle 이 따라가지 못한다
        </Line>
        <Line at={15} style={{ fontSize: 22 }}>
          너무 키우면 → 무리가 넓어져 추정이 흔들리고 particle 도 더 필요
        </Line>
        <Line at={16.8} style={{ fontSize: 22, color: C.muted }}>
          Kalman filter 에서 Q 를 정할 때와 같은 trade-off
        </Line>
        <span style={{ ...line(C.purple, 22), fontWeight: 600, opacity: prog(t, 19.5) }}>cycle 은 움직여야 수행한다</span>
        <span style={{ ...mono(C.purple, 22), opacity: prog(t, 19.9) }}>update_min_d 0.25 m · update_min_a 0.2 rad (약 11.5°)</span>
        <Line at={22} style={{ fontSize: 22, color: C.muted }}>
          세워 두면 particle 이 모이지 않는다 · 그대로 갱신하려면 request_nomotion_update service
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function IoBox({ x, y, w, text, color, at, t }: { x: number; y: number; w: number; text: string; color: string; at: number; t: number }) {
  return (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={64} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fill={C.text} fontSize={22}>
        {text}
      </text>
    </g>
  )
}

function Amcl() {
  const t = useSec()
  const inputs: [number, string, number][] = [
    [24, '/scan · LiDAR scan', 0.5],
    [104, '/map · map_server 의 지도', 0.9],
    [184, 'odom → base_footprint tf', 1.3],
    [264, '/initialpose · RViz', 6.8],
  ]
  const outputs: [number, string, number][] = [
    [44, 'map → odom tf', 3],
    [144, '/amcl_pose · 무거운 무리의 평균', 3.5],
    [244, '/particle_cloud · RViz 표시', 4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={360}>
        <svg width={1792} height={360}>
          {inputs.map(([y, s, at]) => (
            <g key={s}>
              <IoBox x={30} y={y} w={410} text={s} color={at > 6 ? C.orange : C.blue} at={at} t={t} />
              <g opacity={prog(t, at + 0.3)}>{arrow(450, y + 32, 560, y + 32, C.muted, 2.5)}</g>
            </g>
          ))}
          <g opacity={prog(t, 0.3)}>
            <rect x={570} y={24} width={650} height={304} rx={16} fill={`${C.accent}12`} stroke={C.accent} strokeWidth={2.5} />
            <text x={895} y={110} textAnchor="middle" fill={C.accent} fontSize={44} fontFamily={MONO} fontWeight={600}>
              AMCL
            </text>
            <text x={895} y={170} textAnchor="middle" fill={C.text} fontSize={24}>
              particle 500 ~ 2000 개 · KLD sampling
            </text>
            <text x={895} y={215} textAnchor="middle" fill={C.muted} fontSize={22}>
              0.25 m 또는 0.2 rad 움직일 때마다 한 cycle
            </text>
            <text x={895} y={258} textAnchor="middle" fill={C.muted} fontSize={22}>
              /map 은 읽기만 하고 고치지 않는다
            </text>
          </g>
          {outputs.map(([y, s, at]) => (
            <g key={s}>
              <g opacity={prog(t, at)}>{arrow(1230, y + 32, 1340, y + 32, C.muted, 2.5)}</g>
              <IoBox x={1350} y={y} w={410} text={s} color={C.green} at={at} t={t} />
            </g>
          ))}
        </svg>
      </Panel>
      <Box x={64} y={530} w={900} h={350} at={6.5} gap={10} title={<Head color={C.orange}>초기 위치: RViz 의 2D Pose Estimate</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 6.8) }}>
          <span style={mono(C.orange, 22)}>set_initial_pose = false</span> → /initialpose 를 기다린다
        </span>
        <Line at={8.5} style={{ fontSize: 22 }}>
          지도 위를 클릭하고 끌어 방향을 정하면 /initialpose 가 나간다
        </Line>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 13.2) }}>
          공분산 기본: x · y 표준편차 <span style={mono(C.orange, 22)}>0.5 m</span>, yaw <span style={mono(C.orange, 22)}>15°</span>
        </span>
        <Line at={15.5} style={{ fontSize: 22, color: C.muted }}>
          클릭이 표준편차의 2 ~ 3 배인 1 ~ 1.5 m 이상 벗어나면 실제 위치 근처에 particle 이 거의 없다
        </Line>
      </Box>
      <Box x={996} y={530} w={860} h={350} at={19.5} gap={10} title={<Head color={C.red}>지도 전체 · kidnapped robot</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.8) }}>
          <span style={mono(C.text, 22)}>reinitialize_global_localization</span>: 빈 칸 전체에
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21.3) }}>
          10 m × 10 m 도 <span style={mono(C.orange, 22)}>20 × 20 × 36 = 14,400</span> bin · max_particles 2000 이면 bin 7 개에 하나꼴
        </span>
        <Line at={25.7} style={{ fontSize: 22 }}>
          kidnapped robot: resampling 은 틀린 후보끼리 복사할 뿐이다
        </Line>
        <Line at={27.5} style={{ fontSize: 22, color: C.muted }}>
          w_fast 가 w_slow 보다 떨어지면 무작위 particle 을 넣는 기능은 recovery_alpha 기본 0.0 이라 꺼져 있다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseKidnap = () => (
  <PauseWrite
    question="particle 이 bin 30 개에 모여 KLD 식이 365 개를 냈다. 기본값의 AMCL 은 몇 개를 쓸까? 사람이 로봇을 다른 방에 옮기면 스스로 위치를 되찾을까?"
    answer={
      <>
        365 &lt; min_particles 500 → 500 개
        <br />
        새 방엔 후보가 없고 recovery_alpha 0.0 → RViz 로 위치를 다시 준다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: '봉우리가 여럿인 믿음', color: C.accent, text: 'particle 의 배치가 belief · 4 m 와 14 m 두 무리 · Gaussian 하나는 문 없는 9 m', at: 0.6 },
    { tag: '한 cycle 의 세 단계', color: C.green, text: 'noise 섞은 예측 → likelihood field 가중치 → resampling · 5.0 m, 5.3 m 가 두 개씩', at: 4.4 },
    { tag: 'degeneracy 와 KLD', color: C.orange, text: 'N_eff ≈ 2.6 · resampling 은 새 자리를 못 만든다 · bin 50 → 588 개', at: 8.4 },
    { tag: 'Nav2 의 AMCL', color: C.red, text: 'particle 500 ~ 2000 개 · 0.25 m 나 0.2 rad 마다 cycle · 처음 위치는 RViz', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            멀리 떨어진 두 후보를 함께 남기려면, 위치를 어떤 모양으로 기억해야 할까?
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
            NEXT · ESTIMATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>LiDAR SLAM</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            지도와 위치를 동시에 추정하고, 그 지도를 저장해 AMCL 에 넘기기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/particle-filter (Dellaert 등 1999 MCL · Fox 2001 KLD-Sampling · Nav2 AMCL)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function ParticleFilter() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        multimodal: Multimodal,
        particles: Particles,
        'pause-gauss': PauseGauss,
        cycle: Cycle,
        field: Field,
        'pause-mean': PauseMean,
        degeneracy: Degeneracy,
        kld: Kld,
        'pause-neff': PauseNeff,
        motion: Motion,
        amcl: Amcl,
        'pause-kidnap': PauseKidnap,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
