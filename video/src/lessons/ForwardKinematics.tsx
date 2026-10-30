import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, lerp, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './forward-kinematics.narration.json'
import { script } from './forward-kinematics.script'

// Numbers follow lessons/forward-kinematics/README.md (see forward-kinematics.script.ts). The arm drawings are to scale in
// the lesson's units (link length 1); the cup and motor sketch in the question is schematic.

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

type P = [number, number]
const rad = (deg: number) => (deg * Math.PI) / 180
/** lesson coordinates (y up) to SVG pixels, origin `o`, `s` pixels per unit */
const toPx = (o: P, s: number) => (p: P): P => [o[0] + p[0] * s, o[1] - p[1] * s]
/** an arc around `c` (pixels) of radius r, from a0 to a1 degrees measured counter-clockwise on screen */
function arcPath(c: P, r: number, a0: number, a1: number) {
  const p0 = [c[0] + r * Math.cos(rad(a0)), c[1] - r * Math.sin(rad(a0))]
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] - r * Math.sin(rad(a1))]
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  const sweep = a1 > a0 ? 0 : 1
  return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} ${sweep} ${p1[0]} ${p1[1]}`
}

/** a link drawn from a to b, growing with p */
function Link({ a, b, p, color, width = 12, opacity = 1 }: { a: P; b: P; p: number; color: string; width?: number; opacity?: number }) {
  if (p <= 0) return null
  return <line x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], p)} y2={lerp(a[1], b[1], p)} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
}

function Joint({ at, r = 11, color = C.accent, opacity = 1 }: { at: P; r?: number; color?: string; opacity?: number }) {
  return <circle cx={at[0]} cy={at[1]} r={r} fill={C.card} stroke={color} strokeWidth={3.5} opacity={opacity} />
}

/** a frame's x (red) and y (green) axes at `o`, turned `deg` */
function Frame({ o, deg, len = 88, opacity = 1 }: { o: P; deg: number; len?: number; opacity?: number }) {
  const x: P = [o[0] + len * Math.cos(rad(deg)), o[1] - len * Math.sin(rad(deg))]
  const y: P = [o[0] + len * Math.cos(rad(deg + 90)), o[1] - len * Math.sin(rad(deg + 90))]
  return (
    <g opacity={opacity}>
      {arrow(o[0], o[1], x[0], x[1], C.red, 4, 14)}
      {arrow(o[0], o[1], y[0], y[1], C.green, 4, 14)}
      <circle cx={o[0]} cy={o[1]} r={6} fill={C.text} />
    </g>
  )
}

/** a text table whose rows fade in at their own times */
function Table({ head, rows, widths, times, size = 23, colors, monoCols = [] }: { head: string[]; rows: ReactNode[][]; widths: number[]; times: number[]; size?: number; colors?: (string | undefined)[]; monoCols?: number[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 && !monoCols.includes(0) ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, Math.min(...times) - 0.3), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, times[k]), color: colors?.[k] ?? C.text }}>
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

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, unit = '', labelW = 190 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontFamily: MONO, fontSize: 21, textAlign: 'right', color: C.muted }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {value}
        {unit}
      </span>
    </div>
  )
}

const sub = (s: string) => <sub style={{ fontSize: '0.65em' }}>{s}</sub>
const sup = (s: string) => <sup style={{ fontSize: '0.6em' }}>{s}</sup>

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            KINEMATICS · FORWARD KINEMATICS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Forward Kinematics</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            joint angle + URDF → <span style={{ color: C.accent }}>손끝 pose</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            각도밖에 모르는 팔이 base 에서 본 집게 끝의 위치와 방향을 계산하는 법
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
  const base: P = [130, 230]
  const fwd: P = [470, 230]
  const cup: P = [470, 110]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={330} at={0.4}>
        <svg width={860} height={330}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            카메라가 찾은 컵
          </text>
          <text x={830} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도 · 위에서 본 모습
          </text>
          <g opacity={prog(t, 0.8)}>
            <rect x={base[0] - 40} y={base[1] - 40} width={80} height={80} rx={12} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={base[0]} y={base[1] + 70} textAnchor="middle" fill={C.muted} fontSize={22}>
              로봇 base
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            {arrow(base[0] + 46, base[1], fwd[0], fwd[1], C.blue, 4)}
            <text x={(base[0] + fwd[0]) / 2 + 20} y={base[1] + 40} textAnchor="middle" fill={C.blue} fontSize={23} fontWeight={600}>
              앞으로 30 cm
            </text>
            {arrow(fwd[0], fwd[1], cup[0], cup[1] + 30, C.blue, 4)}
            <text x={fwd[0] + 24} y={180} fill={C.blue} fontSize={23} fontWeight={600}>
              왼쪽으로 10 cm
            </text>
            <circle cx={cup[0]} cy={cup[1]} r={24} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={3} />
            <text x={cup[0] + 40} y={cup[1] + 8} fill={C.orange} fontSize={23} fontWeight={600}>
              컵
            </text>
          </g>
        </svg>
      </Card>
      <Card x={996} y={140} w={860} h={330} at={1.6}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Head size={26}>SO-101 의 motor 여섯 개가 읽는 것</Head>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 245px)', gap: 18 }}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} style={{ opacity: prog(t, 1.9 + k * 0.2), padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${C.purple}66`, background: `${C.purple}12`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={mono(C.purple, 22)}>motor {k}</span>
                <span style={mono(C.text, 22)}>?°</span>
              </div>
            ))}
          </div>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 3.4) }}>저마다 몇 도 돌아가 있는지뿐 · 집게 끝의 위치는 어디에도 없다</span>
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          각도밖에 모르는 팔은 <span style={{ color: C.accent }}>집게 끝이 컵에서 몇 cm 떨어져 있는지</span> 어떻게 알까?
        </div>
      </Appear>
      <Card x={260} y={680} w={1400} h={190} at={5.6}>
        <div style={{ padding: '24px 34px', display: 'grid', gap: 16, opacity: prog(t, 5.8) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ ...mono(C.purple, 28), padding: '8px 18px', borderRadius: 12, border: `1.5px solid ${C.purple}77` }}>30°, 60°</span>
            <span style={{ fontSize: 34, color: C.muted }}>→</span>
            <span style={{ ...mono(C.accent, 28), padding: '8px 18px', borderRadius: 12, border: `1.5px solid ${C.accent}77` }}>forward kinematics</span>
            <span style={{ fontSize: 34, color: C.muted }}>→</span>
            <span style={{ ...mono(C.green, 28), padding: '8px 18px', borderRadius: 12, border: `1.5px solid ${C.green}77` }}>손끝 (0.866, 1.5)</span>
          </div>
          <span style={line(C.muted, 23)}>몸의 치수를 적은 파일 (URDF) 과 지금의 각도로 base 에서 손끝까지 joint 를 하나씩 거치며 계산한다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. two-link arm and relative angles ----------

function TwoLink() {
  const t = useSec()
  const P = toPx([170, 650], 300)
  const O = P([0, 0])
  const E = P([Math.cos(rad(30)), Math.sin(rad(30))])
  const T = P([Math.cos(rad(30)), Math.sin(rad(30)) + 1])
  const ext = P([Math.cos(rad(30)) * 1.6, Math.sin(rad(30)) * 1.6])
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <svg width={860} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            2 관절 평면 팔 · L₁ = L₂ = 1
          </text>
          <g opacity={prog(t, 0.4)}>
            {arrow(O[0], O[1], 800, O[1], C.dim, 2, 12)}
            {arrow(O[0], O[1], O[0], 90, C.dim, 2, 12)}
            <text x={790} y={O[1] + 32} fill={C.dim} fontSize={22} textAnchor="end">
              x
            </text>
            <text x={O[0] - 30} y={104} fill={C.dim} fontSize={22}>
              y
            </text>
          </g>
          <Link a={O} b={E} p={prog(t, 0.6, 1)} color={C.blue} />
          <Link a={E} b={T} p={prog(t, 3, 1)} color={C.orange} />
          <g opacity={prog(t, 0.6)}>
            <path d={arcPath(O, 80, 0, 30)} fill="none" stroke={C.blue} strokeWidth={3} />
            <text x={O[0] + 104} y={O[1] - 22} fill={C.blue} fontSize={23} fontFamily={MONO} fontWeight={600}>
              30°
            </text>
            <text x={265} y={540} textAnchor="end" fill={C.blue} fontSize={23} fontWeight={600}>
              link 1
            </text>
            <text x={O[0] - 20} y={O[1] + 50} fill={C.muted} fontSize={22}>
              joint 1 (base)
            </text>
          </g>
          <g opacity={prog(t, 3.4)}>
            <text x={T[0] - 24} y={360} textAnchor="end" fill={C.orange} fontSize={23} fontWeight={600}>
              link 2
            </text>
            <text x={T[0] + 28} y={T[1] + 8} fill={C.green} fontSize={23} fontWeight={600}>
              손끝 · end-effector
            </text>
          </g>
          <g opacity={prog(t, 7)}>
            <line x1={E[0]} y1={E[1]} x2={ext[0]} y2={ext[1]} stroke={C.purple} strokeWidth={2.5} strokeDasharray="8 8" />
            <path d={arcPath(E, 70, 30, 90)} fill="none" stroke={C.purple} strokeWidth={3} />
            <text x={E[0] + 44} y={E[1] - 84} fill={C.purple} fontSize={23} fontFamily={MONO} fontWeight={600}>
              60°
            </text>
          </g>
          <g opacity={prog(t, 0.9)}>
            <Joint at={O} />
            <Joint at={E} opacity={prog(t, 1.4)} />
            <circle cx={T[0]} cy={T[1]} r={9} fill={C.green} opacity={prog(t, 3.8)} />
          </g>
          <g opacity={prog(t, 19.8)}>
            <text x={E[0] + 30} y={E[1] + 38} fill={C.text} fontSize={22}>
              팔꿈치 (joint 2)
            </text>
            <text x={E[0] + 30} y={E[1] + 68} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 0.5)
            </text>
            <text x={T[0] + 28} y={T[1] + 40} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 1.5)
            </text>
          </g>
        </svg>
      </Card>
      <Box x={956} y={140} w={900} h={190} at={0.3} title={<Head color={C.accent}>link · joint · end-effector</Head>} gap={12}>
        <span style={line(C.text, 23)}>link: 휘지 않는 막대 · joint: 두 link 를 잇고 도는 마디</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 3.4) }}>end-effector: 팔 끝에서 일을 하는 집게 (= 손끝)</span>
      </Box>
      <Box x={956} y={350} w={900} h={190} at={6.5} color={`${C.purple}88`} title={<Head color={C.purple}>상대 각도</Head>} gap={12}>
        <span style={line(C.text, 23)}>joint 2 의 encoder 는 link 1 에서 꺾인 각도만 잰다 (점선 기준)</span>
        <span style={{ ...mono(C.purple, 24), opacity: prog(t, 13.3) }}>link 2 방향 = θ₁ + θ₂ = 30° + 60° = 90°</span>
      </Box>
      <Card x={956} y={560} w={900} h={320} at={13}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <Table
            head={['단계', '계산', '결과']}
            widths={[180, 400, 250]}
            times={[19.8, 13.6, 21, 22.2]}
            colors={[C.blue, C.purple, C.orange, C.green]}
            rows={[
              ['팔꿈치', '(1 × cos 30°, 1 × sin 30°)', '(0.866, 0.5)'],
              ['link 2 의 방향', '30° + 60°', '90°'],
              ['더할 이동량', '(1 × cos 90°, 1 × sin 90°)', '(0, 1)'],
              ['손끝', '(0.866 + 0, 0.5 + 1)', '(0.866, 1.5)'],
            ]}
          />
          <div style={{ display: 'grid', gap: 2, opacity: prog(t, 23.4) }}>
            <span style={mono(C.muted, 22)}>
              x = L{sub('1')}cos θ{sub('1')} + L{sub('2')}cos(θ{sub('1')} + θ{sub('2')})
            </span>
            <span style={mono(C.muted, 22)}>
              y = L{sub('1')}sin θ{sub('1')} + L{sub('2')}sin(θ{sub('1')} + θ{sub('2')})
            </span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Configs() {
  const t = useSec()
  const P = toPx([110, 410], 200)
  const O = P([0, 0])
  const E = P([0.866, 0.5])
  const good = P([0.866, 1.5])
  const bad = P([1.366, 1.366])
  const Q = toPx([110, 300], 140)
  const q0 = Q([0, 0])
  const a1 = Q([1, 0])
  const b1 = Q([0, 1])
  const tip = Q([1, 1])
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={440} at={0.3}>
        <svg width={860} height={440}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            θ₂ 를 바닥 기준으로 읽으면
          </text>
          <line x1={O[0]} y1={O[1]} x2={600} y2={O[1]} stroke={C.dim} strokeWidth={2} />
          <Link a={O} b={E} p={1} color={C.blue} width={10} />
          <Link a={E} b={good} p={prog(t, 0.6)} color={C.green} width={10} />
          <g opacity={prog(t, 1.6)}>
            <line x1={E[0]} y1={E[1]} x2={bad[0]} y2={bad[1]} stroke={C.red} strokeWidth={6} strokeDasharray="12 9" strokeLinecap="round" />
            <circle cx={bad[0]} cy={bad[1]} r={8} fill={C.red} />
            <text x={bad[0] + 22} y={bad[1] + 6} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              틀림 (1.366, 1.366)
            </text>
            <text x={bad[0] + 22} y={bad[1] + 40} fill={C.muted} fontSize={22}>
              가로 0.5 · 세로 0.134 어긋남
            </text>
          </g>
          <Joint at={O} />
          <Joint at={E} />
          <g opacity={prog(t, 0.8)}>
            <circle cx={good[0]} cy={good[1]} r={8} fill={C.green} />
            <text x={good[0] - 22} y={good[1] + 6} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              맞음 (0.866, 1.5)
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={600} w={860} h={280} at={2.4} title={<Head color={C.red}>흔한 오해 · θ₂ 는 바닥에서 잰 방향</Head>} gap={12}>
        <span style={line(C.text, 23)}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> link 2 를 60° 로 놓으면 <span style={mono(C.red, 23)}>(0.866 + 0.5, 0.5 + 0.866)</span>
        </span>
        <span style={line(C.text, 23)}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 나눠 계산: <span style={mono(C.red, 23)}>cos 30° + cos 60° = 1.366</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 4) }}>
          <span style={{ color: C.green, fontWeight: 700 }}>✓</span> 각도를 먼저 더한다: <span style={mono(C.green, 23)}>cos(30° + 60°) = cos 90° = 0</span>
        </span>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={7}>
        <svg width={900} height={340} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            같은 손끝 (1, 1) 을 만드는 두 자세
          </text>
          <line x1={q0[0]} y1={q0[1]} x2={480} y2={q0[1]} stroke={C.dim} strokeWidth={2} />
          <g opacity={prog(t, 7.4)}>
            <Link a={q0} b={a1} p={1} color={C.blue} width={10} />
            <Link a={a1} b={tip} p={1} color={C.blue} width={10} />
            <Joint at={a1} color={C.blue} />
            <text x={a1[0]} y={a1[1] + 36} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0°, 90°)
            </text>
          </g>
          <g opacity={prog(t, 8.6)}>
            <Link a={q0} b={b1} p={1} color={C.orange} width={10} opacity={0.9} />
            <Link a={b1} b={tip} p={1} color={C.orange} width={10} opacity={0.9} />
            <Joint at={b1} color={C.orange} />
            <text x={b1[0]} y={b1[1] - 24} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (90°, −90°)
            </text>
          </g>
          <Joint at={q0} />
          <g opacity={prog(t, 9.8)}>
            <circle cx={tip[0]} cy={tip[1]} r={9} fill={C.green} />
            <text x={tip[0] + 16} y={tip[1] + 34} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (1, 1)
            </text>
          </g>
          <g opacity={prog(t, 21.3)}>
            {arrow(tip[0], tip[1] - 12, tip[0], tip[1] - 62, C.blue, 4)}
            <text x={tip[0] + 14} y={tip[1] - 46} fill={C.blue} fontSize={22} fontWeight={600}>
              집게 90°
            </text>
            {arrow(tip[0] + 12, tip[1], tip[0] + 72, tip[1], C.orange, 4)}
            <text x={tip[0] + 84} y={tip[1] + 8} fill={C.orange} fontSize={22} fontWeight={600}>
              집게 0°
            </text>
          </g>
          <g opacity={prog(t, 7.6)}>
            <text x={520} y={150} fill={C.muted} fontSize={22}>
              팔꿈치가 오른쪽 아래 (1, 0)
            </text>
            <text x={520} y={182} fill={C.muted} fontSize={22}>
              또는 왼쪽 위 (0, 1)
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 350, width: 840, display: 'grid', gap: 18 }}>
          <Table
            head={['(θ₁, θ₂)', '팔꿈치', 'link 2 방향', '손끝']}
            widths={[230, 180, 200, 170]}
            monoCols={[0]}
            times={[7.4, 7.9, 8.4, 8.9]}
            colors={[C.text, C.text, C.blue, C.orange]}
            rows={[
              ['(0°, 0°)', '(1, 0)', '0°', '(2, 0)'],
              ['(90°, 0°)', '(0, 1)', '90°', '(0, 2)'],
              ['(0°, 90°)', '(1, 0)', '90°', '(1, 1)'],
              ['(90°, −90°)', '(0, 1)', '0°', '(1, 1)'],
            ]}
          />
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...line(C.text, 23), opacity: prog(t, 14.3) }}>FK 는 답이 늘 하나 · IK 는 답이 여럿일 수 있다</span>
            <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>펴면 L₁ + L₂ = 2 · 원점에서 2 보다 먼 곳에는 닿지 않는다</span>
            <span style={{ ...line(C.green, 23), opacity: prog(t, 23) }}>pose = 위치 + 방향 · 평면 3 개, 3 차원 6 개</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 2. transform chain and URDF ----------

function Chain() {
  const t = useSec()
  const P = toPx([150, 640], 280)
  const O = P([0, 0])
  const E = P([0.866, 0.5])
  const T = P([0.866, 1.5])
  const stage = (at: number, next?: number) => prog(t, at) * (next === undefined ? 1 : 1 - 0.65 * prog(t, next))
  const steps: [string, string, string, number][] = [
    ['R(30°)', '(0, 0)', '30°', 13.3],
    ['Tr(1)', '(0.866, 0.5)', '30°', 14.6],
    ['R(60°)', '(0.866, 0.5)', '90°', 16],
    ['Tr(1)', '(0.866, 1.5)', '90°', 19.8],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            frame 이 팔을 따라 옮겨 간다
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.muted} fontSize={21}>
            <tspan fill={C.red}>빨강 x 축</tspan> · <tspan fill={C.green}>초록 y 축</tspan>
          </text>
          <g opacity={0.25 * prog(t, 0.5)}>
            <line x1={O[0]} y1={O[1]} x2={E[0]} y2={E[1]} stroke={C.blue} strokeWidth={16} strokeLinecap="round" />
            <line x1={E[0]} y1={E[1]} x2={T[0]} y2={T[1]} stroke={C.orange} strokeWidth={16} strokeLinecap="round" />
          </g>
          <g opacity={prog(t, 0.5) * (1 - 0.6 * prog(t, 13.3))}>
            <Frame o={O} deg={0} />
            <text x={O[0] + 100} y={O[1] + 8} fill={C.muted} fontSize={21}>
              base frame
            </text>
          </g>
          <g opacity={stage(13.3, 14.6)}>
            <Frame o={O} deg={30} />
            <text x={200} y={688} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              ① R(30°)
            </text>
          </g>
          <g opacity={prog(t, 14.6)}>
            <line x1={O[0]} y1={O[1]} x2={E[0]} y2={E[1]} stroke={C.text} strokeWidth={2} strokeDasharray="6 7" />
          </g>
          <g opacity={stage(14.6, 16)}>
            <Frame o={E} deg={30} />
          </g>
          <g opacity={prog(t, 14.6)}>
            <text x={484} y={530} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              ② Tr(1)
            </text>
            <text x={484} y={562} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 0.5)
            </text>
          </g>
          <g opacity={stage(16, 19.8)}>
            <Frame o={E} deg={90} />
            <text x={40} y={452} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              ③ R(60°) → 90°
            </text>
          </g>
          <g opacity={prog(t, 19.8)}>
            <line x1={E[0]} y1={E[1]} x2={T[0]} y2={T[1]} stroke={C.text} strokeWidth={2} strokeDasharray="6 7" />
            <Frame o={T} deg={90} />
            <text x={484} y={228} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              ④ Tr(1)
            </text>
            <text x={484} y={260} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 1.5)
            </text>
          </g>
          <text x={40} y={726} fill={C.green} fontSize={22} opacity={prog(t, 22)}>
            마지막 frame 의 x 축 90° = 집게 방향 θ₁ + θ₂ → 위치와 방향이 한꺼번에
          </text>
        </svg>
      </Card>
      <Box x={996} y={140} w={860} h={190} at={6.5} title={<Head color={C.accent}>joint 하나 = transform 하나</Head>} gap={12}>
        <span style={line(C.text, 24)}>
          <span style={mono(C.accent, 25)}>R(θ)</span> 원점은 그대로 두고 축을 θ 만큼 돌린다
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 9.5) }}>
          <span style={mono(C.accent, 25)}>Tr(L)</span> 지금의 x 축 방향으로 L 만큼 옮긴다
        </span>
      </Box>
      <Box x={996} y={350} w={860} h={350} at={0.3} title={<Head>base 쪽부터 차례로 곱한다</Head>} gap={12}>
        <span style={mono(C.text, 28)}>
          T{sub('0h')} = R(θ{sub('1')}) Tr(L{sub('1')}) R(θ{sub('2')}) Tr(L{sub('2')})
        </span>
        <Table
          head={['적용한 transform', '원점', 'x 축 방향']}
          widths={[260, 260, 250]}
          monoCols={[0]}
          times={steps.map((s) => s[3])}
          rows={steps.map(([a, b, c], i) => [`${'①②③④'[i]} ${a}`, b, c])}
          colors={[C.text, C.blue, C.text, C.green]}
        />
      </Box>
      <Box x={996} y={720} w={860} h={160} at={25.5} color={`${C.red}88`} gap={10}>
        <span style={line(C.text, 23)}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> <span style={mono(C.red, 23)}>Tr(1) R(30°)</span> 이면 원점이 <span style={mono(C.red, 23)}>(1, 0)</span> 에 머문다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 27) }}>
          <span style={{ color: C.green, fontWeight: 700 }}>✓</span> base 에서 손끝 쪽으로 link 가 이어진 순서대로 곱한다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Urdf() {
  const t = useSec()
  const code: [ReactNode, number][] = [
    [
      <>
        {'<joint name="joint2" type='}
        <span style={{ color: C.orange }}>"revolute"</span>
        {'>'}
      </>,
      0.6,
    ],
    [
      <>
        {'  <parent link='}
        <span style={{ color: C.blue }}>"link1"</span>
        {'/>'}
      </>,
      1.2,
    ],
    [
      <>
        {'  <child link='}
        <span style={{ color: C.blue }}>"link2"</span>
        {'/>'}
      </>,
      1.6,
    ],
    [
      <>
        {'  <origin xyz='}
        <span style={{ color: C.green }}>"1 0 0"</span>
        {' rpy='}
        <span style={{ color: C.green }}>"0 0 0"</span>
        {'/>'}
      </>,
      2.2,
    ],
    [
      <>
        {'  <axis xyz='}
        <span style={{ color: C.purple }}>"0 0 1"</span>
        {'/>'}
      </>,
      2.8,
    ],
    ['</joint>', 0.6],
  ]
  const tags: [string, string, number][] = [
    ['type', 'joint 가 움직이는 방식', 0.8],
    ['parent · child', 'base 쪽 link · 손끝 쪽 link', 1.4],
    ['origin xyz', 'parent frame 에서 joint 자리까지 옮기는 양', 2.4],
    ['origin rpy', '옮긴 뒤 고정으로 돌려 두는 각도', 2.6],
    ['axis', 'joint frame 에서 본 회전축 방향', 3],
  ]
  const types: [string, string, string][] = [
    ['revolute', 'lower ~ upper 사이에서 돈다', 'rad'],
    ['continuous', '한계 없이 돈다 (바퀴)', 'rad'],
    ['prismatic', '축 방향으로 미끄러진다', 'm'],
    ['fixed', '두 link 를 붙여 둔다', '없음'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Head size={26}>2 관절 팔의 joint2 를 적은 URDF (XML)</Head>
          <div style={{ padding: '16px 20px', borderRadius: 14, background: C.bg, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 4 }}>
            {code.map(([c, at], i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 24, color: C.text, whiteSpace: 'pre', opacity: prog(t, at), lineHeight: 1.45 }}>
                {c}
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {tags.map(([k, v, at]) => (
              <div key={k} style={{ display: 'flex', gap: 18, opacity: prog(t, at) }}>
                <span style={{ ...mono(C.accent, 22), width: 220 }}>{k}</span>
                <span style={line(C.text, 22)}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 19.8), paddingTop: 6, borderTop: `1.5px solid ${C.cardEdge}` }}>
            <span style={line(C.text, 23)}>
              URDF 에는 joint angle 이 없다 → <span style={{ color: C.green, fontWeight: 600 }}>FK = URDF + encoder 로 읽은 각도</span>
            </span>
            <span style={line(C.muted, 22)}>함께 적힌 mesh · 질량 · 관성은 FK 에 쓰지 않는다</span>
          </div>
        </div>
      </Card>
      <Box x={956} y={140} w={900} h={255} at={6.5} title={<Head color={C.accent}>joint 하나의 계산</Head>} gap={12}>
        <span style={mono(C.text, 28)}>
          T{sub('parent, child')} = T{sup('origin')} · T{sup('motion')}(q)
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 7.5) }}>
          <span style={mono(C.green, 22)}>T origin</span> origin 의 xyz · rpy 로 만든 고정 transform
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9) }}>
          <span style={mono(C.purple, 22)}>T motion(q)</span> axis 를 중심으로 q 만큼 돌린다
        </span>
      </Box>
      <Card x={956} y={415} w={900} h={240} at={10.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
            {['type', '움직임', 'q 의 단위'].map((h, i) => (
              <span key={h} style={{ width: [200, 470, 150][i], fontSize: 20, color: C.muted, textAlign: i === 2 ? 'right' : 'left' }}>
                {h}
              </span>
            ))}
          </div>
          {types.map(([a, b, c], k) => (
            <div key={a} style={{ display: 'flex', opacity: prog(t, 10.8 + k * 0.4) }}>
              <span style={{ ...mono(C.accent, 22), width: 200 }}>{a}</span>
              <span style={{ fontSize: 22, width: 470, whiteSpace: 'nowrap' }}>{b}</span>
              <span style={{ ...mono(C.text, 22), width: 150, textAlign: 'right' }}>{c}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={956} y={675} w={900} h={205} at={13} color={`${C.orange}88`} title={<Head color={C.orange}>URDF 의 각도 단위는 radian</Head>} gap={10}>
        <span style={mono(C.text, 22)}>180° = π ≈ 3.1416 rad · 90° = 1.5708 rad · 1° = 0.01745 rad</span>
        <span style={{ ...mono(C.orange, 22), opacity: prog(t, 15) }}>upper="1.57" → 1.57 × 180 ÷ 3.1416 ≈ 90° (1.57° 가 아니다)</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. kinematic tree, robot_state_publisher and tf2 ----------

function Tree() {
  const t = useSec()
  const chain = ['base_link', 'shoulder_link', 'upper_arm_link', 'lower_arm_link', 'wrist_link', 'gripper_link']
  const joints = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll']
  const bx = 60
  const bw = 380
  const bh = 44
  const yOf = (i: number) => 70 + i * 92
  const ys = 640
  const left = { x: 30, w: 330 }
  const right = { x: 420, w: 410 }
  const zero: [string, string, string, string][] = [
    ['shoulder_link', '0.039', '0.000', '0.062'],
    ['upper_arm_link', '0.069', '−0.018', '0.117'],
    ['lower_arm_link', '0.097', '−0.018', '0.229'],
    ['wrist_link', '0.232', '−0.018', '0.234'],
    ['gripper_link', '0.293', '0.000', '0.234'],
    ['gripper_frame_link', '0.391', '0.000', '0.226'],
  ]
  const split = prog(t, 6.8)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <svg width={900} height={740}>
          <text x={30} y={40} fill={C.text} fontSize={26} fontWeight={600}>
            SO-101 URDF 의 kinematic tree
          </text>
          {chain.map((name, i) => {
            const y = yOf(i)
            const on = prog(t, 0.5 + i * 0.6)
            const hot = i === 5 ? split : 0
            return (
              <g key={name} opacity={on}>
                <rect x={bx} y={y} width={bw} height={bh} rx={10} fill={C.card} stroke={hot ? C.orange : C.blue} strokeWidth={2 + hot} />
                <text x={bx + bw / 2} y={y + 30} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {name}
                </text>
                {i < 5 && (
                  <>
                    {arrow(bx + bw / 2, y + bh + 2, bx + bw / 2, yOf(i + 1) - 4, C.muted, 2.5, 11, prog(t, 0.8 + i * 0.6))}
                    <text x={470} y={y + bh + 32} fill={C.accent} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 0.8 + i * 0.6)}>
                      {joints[i]}
                      <tspan fill={C.dim} fontFamily="inherit" fontWeight={400}>
                        {' · revolute'}
                      </tspan>
                    </text>
                  </>
                )}
              </g>
            )
          })}
          <text x={470} y={yOf(0) + 30} fill={C.dim} fontSize={21} opacity={prog(t, 0.8)}>
            ← root
          </text>
          <g opacity={split}>
            {arrow(bx + bw / 2, yOf(5) + bh + 2, left.x + left.w / 2, ys - 4, C.muted, 2.5, 11)}
            {arrow(bx + bw / 2, yOf(5) + bh + 2, right.x + right.w / 2, ys - 4, C.muted, 2.5, 11)}
            <text x={178} y={612} textAnchor="end" fill={C.dim} fontSize={21} fontFamily={MONO}>
              fixed
            </text>
            <text x={470} y={592} fill={C.dim} fontSize={21} fontFamily={MONO}>
              revolute
            </text>
            <rect x={left.x} y={ys} width={left.w} height={bh} rx={10} fill={C.card} stroke={C.green} strokeWidth={2.5} />
            <text x={left.x + left.w / 2} y={ys + 30} textAnchor="middle" fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              gripper_frame_link
            </text>
            <rect x={right.x} y={ys} width={right.w} height={bh} rx={10} fill={C.card} stroke={C.purple} strokeWidth={2.5} />
            <text x={right.x + right.w / 2} y={ys + 30} textAnchor="middle" fill={C.purple} fontSize={21} fontFamily={MONO} fontWeight={600}>
              moving_jaw_so101_v1_link
            </text>
            <text x={left.x + left.w / 2} y={ys + 76} textAnchor="middle" fill={C.muted} fontSize={21}>
              집게 끝점 자리 (부품 없음)
            </text>
            <text x={right.x + right.w / 2} y={ys + 76} textAnchor="middle" fill={C.muted} fontSize={21}>
              움직이는 집게 날
            </text>
          </g>
        </svg>
      </Card>
      <Box x={996} y={140} w={860} h={220} at={6.5} title={<Head color={C.accent}>so101_new_calib.urdf</Head>} gap={12}>
        <span style={line(C.text, 23)}>
          link <span style={mono(C.accent, 23)}>8</span> 개 · joint <span style={mono(C.accent, 23)}>7</span> 개 (revolute 6 개 · fixed 1 개)
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.5) }}>파일은 joint 를 집게 쪽부터 거꾸로 적어서, parent · child 로 tree 를 세운 순서대로 곱한다</span>
      </Box>
      <Card x={996} y={380} w={860} h={320} at={13}>
        <div style={{ padding: '20px 28px', display: 'grid', gap: 10 }}>
          <Label size={22} color={C.muted}>
            모든 joint angle 이 0 일 때 link 원점의 위치 (단위 m)
          </Label>
          <Table
            head={['link', 'x', 'y', 'z']}
            widths={[300, 150, 150, 150]}
            monoCols={[0]}
            size={21}
            times={zero.map((_, k) => 13.4 + k * 0.35)}
            colors={[C.text, C.text, C.text, C.text, C.text, C.green]}
            rows={zero}
          />
        </div>
      </Card>
      <Box x={996} y={720} w={860} h={160} at={19.5} color={`${C.orange}88`} gap={14}>
        <span style={line(C.text, 22)}>
          <span style={mono(C.orange, 22)}>shoulder_pan</span> 의 <span style={mono(C.text, 21)}>rpy="3.14159 0 -3.14159"</span> → joint 의 z 축이 −z 쪽
        </span>
        <span style={{ ...mono(C.orange, 22), opacity: prog(t, 21.5) }}>+90° → (0.391, 0, 0.226) → (0.039, −0.353, 0.226)</span>
      </Box>
    </AbsoluteFill>
  )
}

function Rsp() {
  const t = useSec()
  type B = { x: number; y: number; w: number; h: number; color: string; at: number; lines: [string, boolean][] }
  const boxes: B[] = [
    { x: 31, y: 150, w: 200, h: 140, color: C.muted, at: 0.5, lines: [['joint driver', false], ['encoder 각도', false]] },
    { x: 281, y: 150, w: 220, h: 140, color: C.accent, at: 0.9, lines: [['/joint_states', true], ['이름 · 각도', false]] },
    { x: 551, y: 130, w: 330, h: 180, color: C.blue, at: 1.4, lines: [['robot_state_publisher', true], ['URDF 로 tree 를 세움', false], ['joint 마다 transform', false]] },
    { x: 931, y: 80, w: 250, h: 120, color: C.green, at: 7.2, lines: [['/tf', true], ['움직이는 joint 6 개', false], ['기본 20 Hz 까지', false]] },
    { x: 931, y: 240, w: 250, h: 120, color: C.orange, at: 9.5, lines: [['/tf_static', true], ['fixed joint 1 개', false], ['시작할 때 한 번', false]] },
    { x: 1231, y: 150, w: 240, h: 140, color: C.purple, at: 13.6, lines: [['tf2 buffer', true], ['시각과 함께 보관', false], ['기본 최근 10 초', false]] },
    { x: 1521, y: 150, w: 240, h: 140, color: C.text, at: 15, lines: [['RViz · node', false], ['lookupTransform', true], ['손끝 pose', false]] },
  ]
  const arrows: [number, number, number, number, number][] = [
    [231, 220, 281, 220, 0.9],
    [501, 220, 551, 220, 1.4],
    [881, 190, 931, 140, 7.2],
    [881, 250, 931, 300, 9.5],
    [1181, 140, 1231, 190, 13.6],
    [1181, 300, 1231, 250, 13.6],
    [1471, 220, 1521, 220, 15],
  ]
  const path = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll', 'fixed']
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={400} at={0.3}>
        <svg width={1792} height={400}>
          <text x={31} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            ROS 2 에서 FK 가 계산되는 흐름
          </text>
          {arrows.map(([x1, y1, x2, y2, at], i) => (
            <g key={i}>{arrow(x1, y1, x2, y2, C.muted, 3, 12, prog(t, at))}</g>
          ))}
          {boxes.map((b) => {
            const top = b.y + b.h / 2 - ((b.lines.length - 1) * 32) / 2 + 8
            return (
              <g key={b.x + b.y} opacity={prog(t, b.at)}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={14} fill={`${b.color}14`} stroke={b.color} strokeWidth={2} />
                {b.lines.map(([s, m], i) => (
                  <text
                    key={s}
                    x={b.x + b.w / 2}
                    y={top + i * 32}
                    textAnchor="middle"
                    fill={i === 0 || m ? b.color : C.text}
                    fontSize={m ? (s.length >= 15 ? 20 : 22) : i === 0 ? 22 : 20}
                    fontFamily={m ? MONO : undefined}
                    fontWeight={i === 0 || m ? 600 : 400}
                  >
                    {s}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </Card>
      <Box x={64} y={560} w={880} h={320} at={13.5} title={<span style={mono(C.purple, 21)}>lookupTransform("base_link", "gripper_frame_link")</span>} gap={14}>
        <span style={line(C.text, 22)}>tf2 가 tree 에서 두 frame 을 잇는 길을 찾아 그 위의 transform 을 곱한다</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {path.map((j, i) => (
            <span key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: prog(t, 14.5 + i * 0.4) }}>
              <span style={{ ...mono(j === 'fixed' ? C.orange : C.green, 20), padding: '6px 12px', borderRadius: 10, border: `1.5px solid ${j === 'fixed' ? C.orange : C.green}66` }}>{j}</span>
              {i < path.length - 1 && <span style={{ color: C.muted, fontSize: 24 }}>→</span>}
            </span>
          ))}
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 17.5) }}>
          SO-101: revolute <span style={mono(C.green, 22)}>5</span> 개 + fixed <span style={mono(C.orange, 22)}>1</span> 개의 transform 을 곱한다
        </span>
      </Box>
      <Box x={976} y={560} w={880} h={320} at={20} title={<Head color={C.purple}>tf2 buffer 와 시각</Head>} gap={12}>
        <span style={line(C.text, 22)}>frame 쌍마다 시각과 함께 보관 · 기본으로 최근 10 초</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21.8) }}>시각을 주면 그 앞뒤 값을 보간해 돌려준다</span>
        <span style={{ ...line(C.green, 22), opacity: prog(t, 23.2) }}>손목 카메라 사진의 시각 → 사진을 찍던 순간의 집게 pose</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.6) }}>/joint_states 에 joint 하나가 빠지면 그 아래 link 의 lookup 은 실패</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. DH, PoE and the error against the real arm ----------

function DhPoe() {
  const t = useSec()
  const ur: [string, string, string, string][] = [
    ['1', '0', '0.1625', 'π/2'],
    ['2', '−0.425', '0', '0'],
    ['3', '−0.3922', '0', '0'],
    ['4', '0', '0.1333', 'π/2'],
    ['5', '0', '0.0997', '−π/2'],
    ['6', '0', '0.0996', '0'],
  ]
  const P = toPx([120, 470], 200)
  const O = P([0, 0])
  const J2 = P([1, 0])
  const start = P([2, 0])
  const mid = P([1.5, 0.866])
  const end = P([0.866, 1.5])
  const elbow = P([0.866, 0.5])
  const s1 = prog(t, 24.8, 1)
  const s2 = prog(t, 27, 1)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.accent} size={27}>
            DH parameter · joint 마다 숫자 4 개
          </Head>
          <span style={line(C.text, 22)}>
            URDF origin: <span style={mono(C.text, 22)}>xyz 3 + rpy 3 = 6</span> 개
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 2.5) }}>
            DH (1955): 회전축을 z, 이웃한 두 축에 직각인 선을 x 로 두면 <span style={mono(C.accent, 22)}>a · d · α · θ</span>
          </span>
          <div style={{ opacity: prog(t, 6.5), display: 'grid', gap: 8 }}>
            <Label size={21} color={C.muted}>
              UR5e 의 DH parameter (Universal Robots 공개)
            </Label>
            <Table head={['joint', 'a (m)', 'd (m)', 'α (rad)']} widths={[120, 200, 200, 180]} size={21} times={ur.map((_, k) => 6.8 + k * 0.3)} rows={ur} />
          </div>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 9) }}>
            <span style={line(C.text, 22)}>
              모든 각도 0 → flange <span style={mono(C.blue, 22)}>(−0.817, −0.233, 0.063) m</span>
            </span>
            <span style={mono(C.green, 22)}>√(0.817² + 0.233²) ≈ 0.850 m ↔ reach 850 mm</span>
          </div>
          <span style={{ ...line(C.orange, 22), opacity: prog(t, 12.8) }}>원래 DH (UR) 와 Craig 규약 (Franka FR3) · 표를 바꿔 넣으면 다른 팔</span>
        </div>
      </Card>
      <Card x={996} y={140} w={860} h={740} at={18.5}>
        <svg width={860} height={540} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            PoE (1984) · zero configuration 의 축만 적는다
          </text>
          <line x1={O[0]} y1={O[1]} x2={640} y2={O[1]} stroke={C.dim} strokeWidth={2} />
          <g opacity={prog(t, 19) * (1 - 0.6 * s1)}>
            <Link a={O} b={J2} p={1} color={C.muted} width={10} />
            <Link a={J2} b={start} p={1} color={C.muted} width={10} />
          </g>
          <g opacity={prog(t, 19.4)}>
            <Joint at={O} />
            <Joint at={J2} />
            <circle cx={start[0]} cy={start[1]} r={8} fill={C.text} />
            <text x={O[0]} y={O[1] + 40} textAnchor="middle" fill={C.text} fontSize={21} fontFamily={MONO}>
              (0, 0)
            </text>
            <text x={J2[0]} y={J2[1] + 40} textAnchor="middle" fill={C.text} fontSize={21} fontFamily={MONO}>
              (1, 0)
            </text>
            <text x={start[0]} y={start[1] + 40} textAnchor="middle" fill={C.text} fontSize={21} fontFamily={MONO}>
              (2, 0) 시작
            </text>
          </g>
          <g opacity={s1 * (1 - 0.5 * s2)}>
            <path d={arcPath(J2, 200, 0, 60 * s1)} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="8 6" />
            <Link a={J2} b={mid} p={s1} color={C.orange} width={8} />
          </g>
          <g opacity={prog(t, 25.6)}>
            <circle cx={mid[0]} cy={mid[1]} r={8} fill={C.orange} />
            <text x={mid[0] + 22} y={mid[1] + 6} fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600}>
              (1.5, 0.866)
            </text>
            <text x={540} y={404} fill={C.orange} fontSize={22} fontWeight={600}>
              ① (1, 0) 중심 60°
            </text>
          </g>
          <g opacity={s2}>
            <path d={arcPath(O, 346.4, 30, 30 + 30 * s2)} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="8 6" />
            <Link a={O} b={elbow} p={1} color={C.green} width={10} />
            <Link a={elbow} b={end} p={1} color={C.green} width={10} />
            <Joint at={elbow} color={C.green} />
          </g>
          <g opacity={prog(t, 27.8)}>
            <circle cx={end[0]} cy={end[1]} r={9} fill={C.green} />
            <text x={end[0] + 26} y={end[1] - 18} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 1.5)
            </text>
            <text x={450} y={216} fill={C.green} fontSize={22} fontWeight={600}>
              ② (0, 0) 중심 30°
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 556, width: 800, display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 20.5) }}>zero configuration: 모든 joint angle 이 0 인 자세 · 축은 (0, 0) 과 (1, 0)</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 28.4) }}>손끝 쪽 joint 부터 돌려서, joint 2 의 축은 적어 둔 (1, 0) 그대로</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 29.2) }}>link 마다 frame 을 정하지 않고 base 와 손끝 frame 만 쓴다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function ErrorScene() {
  const t = useSec()
  const O: P = [80, 420]
  const L = 640
  const at20: P = [O[0] + L * Math.cos(rad(20)), O[1] - L * Math.sin(rad(20))]
  const at25: P = [O[0] + L * Math.cos(rad(25)), O[1] - L * Math.sin(rad(25))]
  const causes: [string, number][] = [
    ['encoder 의 0 점 ≠ 실제 joint 의 0 점 → calibration 으로 맞춘다', 0.6],
    ['link 길이 · joint 자리가 제작 공차만큼 URDF 와 다르다', 1.6],
    ['기어의 틈 (backlash) 만큼 link 가 흔들린다', 2.6],
    ['무거운 물건을 들면 link 와 기어가 조금 휜다', 3.6],
  ]
  const so: [string, number][] = [
    ['shoulder_pan', 6.15],
    ['shoulder_lift', 5.94],
    ['elbow_flex', 5.13],
    ['wrist_flex', 2.78],
    ['wrist_roll', 0.14],
  ]
  const grow = prog(t, 8, 1.2)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={260} at={0.3} title={<Head color={C.red}>계산과 실물이 어긋나는 원인</Head>} gap={8}>
        {causes.map(([s, at]) => (
          <span key={s} style={{ ...line(C.text, 22), opacity: prog(t, at) }}>
            · {s}
          </span>
        ))}
      </Box>
      <Card x={64} y={420} w={860} h={460} at={6.5}>
        <svg width={860} height={460}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            길이 2 로 편 팔 · 계산은 20°, 실제는 25°
          </text>
          <line x1={O[0]} y1={O[1]} x2={800} y2={O[1]} stroke={C.dim} strokeWidth={2} />
          <line x1={O[0]} y1={O[1]} x2={at20[0]} y2={at20[1]} stroke={C.blue} strokeWidth={9} strokeLinecap="round" />
          <g opacity={grow}>
            <line x1={O[0]} y1={O[1]} x2={at25[0]} y2={at25[1]} stroke={C.orange} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
            <path d={arcPath(O, 200, 20, 25)} fill="none" stroke={C.purple} strokeWidth={3} />
            <path d={arcPath(O, L, 20, 25)} fill="none" stroke={C.red} strokeWidth={5} />
          </g>
          <Joint at={O} />
          <circle cx={at20[0]} cy={at20[1]} r={8} fill={C.blue} />
          <text x={at20[0] + 20} y={at20[1] + 30} fill={C.blue} fontSize={22} fontWeight={600}>
            계산 20°
          </text>
          <g opacity={grow}>
            <circle cx={at25[0]} cy={at25[1]} r={8} fill={C.orange} />
            <text x={at25[0] + 22} y={at25[1] - 4} fill={C.orange} fontSize={22} fontWeight={600}>
              실제 25°
            </text>
            <text x={265} y={398} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
              Δθ = 5° ≈ 0.0873 rad
            </text>
          </g>
          <text x={640} y={108} textAnchor="end" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 14)}>
            2 × 0.0873 ≈ 0.175
          </text>
        </svg>
      </Card>
      <Box x={956} y={140} w={900} h={255} at={6.5} title={<Head color={C.purple}>각도 오차 → 손끝 오차</Head>} gap={10}>
        <span style={line(C.text, 23)}>
          joint 에서 손끝까지 거리 r · 손끝 이동 ≈ <span style={mono(C.purple, 25)}>r × Δθ</span> (Δθ 는 rad)
        </span>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 12.8) }}>5° = 5 × 0.01745 ≈ 0.0873 rad</span>
        <span style={{ ...mono(C.red, 23), opacity: prog(t, 14) }}>r = 2 → 2 × 0.0873 ≈ 0.175</span>
      </Box>
      <Box x={956} y={413} w={900} h={310} at={19} title={<Head color={C.green} size={25}>SO-101 · joint 하나만 1° 틀릴 때 집게 끝점 이동</Head>} gap={12}>
        {so.map(([j, v], i) => (
          <Bar key={j} label={j} value={v} max={6.5} unit=" mm" color={i === 0 ? C.orange : C.green} at={19.4 + i * 0.4} />
        ))}
      </Box>
      <Box x={956} y={741} w={900} h={139} at={25.5} color={`${C.orange}88`} gap={8}>
        <span style={mono(C.text, 21)}>UR5e · base joint 1° → 0.850 × 0.01745 ≈ 0.0148 m ≈ 15 mm</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 27.3) }}>
          repeatability <span style={mono(C.green, 22)}>±0.03 mm</span> 여도 calibration 을 안 넣으면 cm 단위 오차
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: '2 관절 팔과 상대 각도', color: C.accent, text: '30° + 60° = 90° 로 쌓인다 · 손끝 (0.866, 1.5) · 집게 90°', at: 1 },
    { tag: 'transform 곱과 URDF', color: C.blue, text: 'joint = T origin · T motion(q) 를 base 부터 곱한다 · 1.57 rad ≈ 90°', at: 4.4 },
    { tag: 'SO-101 tree 와 tf2', color: C.orange, text: 'robot_state_publisher → /tf 6 개 · /tf_static 1 개 → tf2 가 길을 따라 곱한다', at: 8.4 },
    { tag: 'DH · PoE · 오차', color: C.red, text: 'DH 숫자 4 개 · PoE 는 zero configuration 의 축 · SO-101 1° → 6.15 mm', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            각도밖에 모르는 팔은 집게 끝이 어디 있는지 어떻게 알까?
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
  const next: [string, string, number][] = [
    ['Inverse Kinematics', '집게 끝을 컵 위 5 cm 에 두는 joint angle · FK 와 그 미분을 되풀이', 0.5],
    ['Hand-Eye Calibration', '집게와 손목 카메라 사이의 transform · 물체를 base 좌표로', 3.8],
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 30, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · KINEMATICS
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          {next.map(([name, what, at]) => (
            <Appear key={name} at={at}>
              <div style={{ width: 760, padding: '30px 36px', borderRadius: 24, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600 }}>{name}</div>
                <Label color={C.muted} size={28}>
                  {what}
                </Label>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={5} style={{ marginTop: 40, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/forward-kinematics (Denavit-Hartenberg 1955 · Brockett 1984 · Modern Robotics)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseArm = () => (
  <PauseWrite
    question="link 길이가 둘 다 1 인 2 관절 팔에서 θ₁ = 60°, θ₂ = 30° 이면 손끝은 어디인가?"
    answer={
      <>
        팔꿈치 (cos 60°, sin 60°) = (0.5, 0.866)
        <br />
        link 2 방향 60° + 30° = 90° → 더할 이동량 (0, 1)
        <br />
        손끝 (0.5 + 0, 0.866 + 1) = (0.5, 1.866)
      </>
    }
  />
)

const PauseUrdf = () => (
  <PauseWrite
    question={'어떤 joint 의 <origin xyz="0 0 2" rpy="0 0 0"/> 은 무엇을 뜻할까? 로봇이 움직이는 동안 이 값은 바뀔까?'}
    answer={
      <>
        parent link frame 에서 z 방향으로 2 m 옮긴 자리에 joint 가 있고, 고정으로 돌려 둔 각도는 없다
        <br />
        만들 때 정한 값이라 바뀌지 않는다 · 바뀌는 것은 그 joint 의 q 뿐
      </>
    }
  />
)

const PauseTf = () => (
  <PauseWrite
    question={'SO-101 에서 lookupTransform("base_link", "wrist_link") 는 transform 을 몇 개 곱할까? 그중 /tf_static 에서 온 것은?'}
    answer={
      <>
        shoulder_pan → shoulder_lift → elbow_flex → wrist_flex · 4 개
        <br />
        넷 다 revolute 라 /tf 에서 왔고, /tf_static 에서 온 것은 0 개
      </>
    }
  />
)

const PauseError = () => (
  <PauseWrite
    question="손끝이 base joint 축에서 0.5 m 떨어진 팔에서 base joint 각도가 2° 틀리면 손끝은 대략 몇 mm 어긋날까?"
    answer={
      <>
        2° = 2 × 0.01745 = 0.0349 rad
        <br />
        0.5 × 0.0349 ≈ 0.0175 m → 약 17 mm
      </>
    }
  />
)

export function ForwardKinematics() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'two-link': TwoLink,
        configs: Configs,
        'pause-arm': PauseArm,
        chain: Chain,
        urdf: Urdf,
        'pause-urdf': PauseUrdf,
        tree: Tree,
        rsp: Rsp,
        'pause-tf': PauseTf,
        'dh-poe': DhPoe,
        error: ErrorScene,
        'pause-error': PauseError,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
