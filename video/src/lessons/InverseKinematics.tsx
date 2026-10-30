import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './inverse-kinematics.narration.json'
import { script } from './inverse-kinematics.script'

// Numbers follow lessons/inverse-kinematics/README.md (see inverse-kinematics.script.ts). The arm drawings are to scale
// (link length 1) except the cup scene, which is marked 모식도; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 12, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
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
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line of text that fades in at `at` */
function Row({ at, children, style }: { at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ ...line(), ...style, opacity: prog(t, at) }}>{children}</div>
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

/** a 2-row matrix with brackets */
function Matrix({ rows, size = 26, color = C.text }: { rows: string[][]; size?: number; color?: string }) {
  const bracket = (side: 'left' | 'right'): CSSProperties => ({
    width: 10,
    [side === 'left' ? 'borderLeft' : 'borderRight']: `2.5px solid ${C.muted}`,
    borderTop: `2.5px solid ${C.muted}`,
    borderBottom: `2.5px solid ${C.muted}`,
  })
  return (
    <span style={{ display: 'inline-flex', alignItems: 'stretch', gap: 10, verticalAlign: 'middle' }}>
      <span style={bracket('left')} />
      <span style={{ display: 'grid', gridTemplateColumns: `repeat(${rows[0].length}, auto)`, columnGap: 26, rowGap: 2, padding: '4px 0', fontFamily: MONO, fontSize: size, fontWeight: 600, color, textAlign: 'right' }}>
        {rows.flat().map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </span>
      <span style={bracket('right')} />
    </span>
  )
}

/** a text table: columns listed in `monoCols` are mono; the first column is left-aligned, the rest right-aligned */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors, monoCols, rowAt }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; monoCols?: number[]; rowAt?: number[] }) {
  const t = useSec()
  const isMono = (i: number) => (monoCols ? monoCols.includes(i) : i > 0)
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: isMono(i) ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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
        <div key={k} style={{ display: 'flex', opacity: prog(t, rowAt?.[k] ?? at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
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
function Bar({ label, value, max, color, at, width = 460, unit = '', labelW = 130 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, fontFamily: MONO, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 24, borderRadius: 7, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 7, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 23, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
  )
}

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

type Pt = [number, number]

/** joint positions of a planar arm in SVG pixels: origin `o`, `s` pixels per unit length, angles in degrees */
function armPts(o: Pt, s: number, deg: number[], len: number[] = deg.map(() => 1)): Pt[] {
  const pts: Pt[] = [o]
  let a = 0
  let [x, y] = o
  deg.forEach((d, i) => {
    a += (d * Math.PI) / 180
    x += Math.cos(a) * len[i] * s
    y -= Math.sin(a) * len[i] * s
    pts.push([x, y])
  })
  return pts
}

function Arm({ pts, color, width = 8, dash, opacity = 1 }: { pts: Pt[]; color: string; width?: number; dash?: string; opacity?: number }) {
  const tip = pts[pts.length - 1]
  return (
    <g opacity={opacity}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />
      {pts.slice(0, -1).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={8} fill={C.card} stroke={C.text} strokeWidth={2.5} />
      ))}
      <circle cx={tip[0]} cy={tip[1]} r={7} fill={color} />
    </g>
  )
}

function Target({ p, opacity = 1 }: { p: Pt; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={15} fill="none" stroke={C.orange} strokeWidth={2.5} />
      <circle cx={p[0]} cy={p[1]} r={4} fill={C.orange} />
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
            KINEMATICS · INVERSE KINEMATICS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Inverse Kinematics</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            손끝 목표 위치 <span style={{ color: C.accent }}>→ joint angle</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            답이 둘이거나, 끝없이 많거나, 없을 수 있는 거꾸로 푸는 계산
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
  const pts: Pt[] = [
    [120, 380],
    [300, 200],
    [552, 350],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={490}>
        <svg width={860} height={490}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            카메라가 찾은 컵의 위치
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={40} y1={400} x2={820} y2={400} stroke={C.cardEdge} strokeWidth={3} />
            <rect x={90} y={380} width={60} height={20} rx={4} fill={C.cardEdge} />
            <rect x={560} y={320} width={80} height={80} rx={8} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2.5} />
            <text x={600} y={368} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              컵
            </text>
            <rect x={670} y={62} width={60} height={40} rx={8} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
            <circle cx={700} cy={82} r={8} fill={C.accent} />
            <text x={655} y={90} textAnchor="end" fill={C.accent} fontSize={22} fontWeight={600}>
              카메라
            </text>
            <line x1={700} y1={102} x2={566} y2={318} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
            <line x1={700} y1={102} x2={640} y2={318} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
          </g>
          <g opacity={prog(t, 0.8)}>
            <Arm pts={pts} color={C.blue} width={10} />
            <Target p={[552, 350]} />
            <text x={205} y={376} fill={C.orange} fontSize={24} fontWeight={700}>
              θ₁ ?
            </text>
            <text x={285} y={175} fill={C.orange} fontSize={24} fontWeight={700}>
              θ₂ ?
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <line x1={120} y1={440} x2={552} y2={440} stroke={C.muted} strokeWidth={2} />
            <line x1={120} y1={430} x2={120} y2={450} stroke={C.muted} strokeWidth={2} />
            <line x1={552} y1={430} x2={552} y2={450} stroke={C.muted} strokeWidth={2} />
            <text x={336} y={472} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              앞 25 cm
            </text>
            <line x1={530} y1={400} x2={530} y2={352} stroke={C.muted} strokeWidth={2} />
            <text x={518} y={384} textAnchor="end" fill={C.text} fontSize={22} fontWeight={600}>
              높이 5 cm
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={490} at={0.6} title={<Head color={C.accent}>joint angle 과 손끝</Head>}>
        <Row at={1.2} style={{ color: C.muted }}>
          motor 가 받을 수 있는 명령은 관절 하나하나의 각도뿐이다
        </Row>
        <Row at={4.5}>
          FK: <span style={mono(C.blue)}>(θ₁, θ₂) → 손끝 (x, y)</span> · 답은 언제나 하나
        </Row>
        <Row at={4.9}>
          <span style={mono(C.text, 24)}>x = L₁cos θ₁ + L₂cos(θ₁ + θ₂)</span>
        </Row>
        <Row at={4.9}>
          <span style={mono(C.text, 24)}>y = L₁sin θ₁ + L₂sin(θ₁ + θ₂)</span>
        </Row>
        <Row at={5.6}>
          IK: <span style={mono(C.orange)}>손끝 (x, y) → (θ₁, θ₂) ?</span> · 이 식을 거꾸로 푼다
        </Row>
      </Box>
      <Appear at={4.7} style={{ position: 'absolute', left: 64, top: 670, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          FK 식을 거꾸로 풀어, <span style={{ color: C.accent }}>손끝을 컵에 두는 joint angle 은 어떻게 구할까?</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- analytic solution / workspace ----------

function Analytic() {
  const t = useSec()
  const o: Pt = [260, 640]
  const s = 280
  const down = armPts(o, s, [30, 60])
  const up = armPts(o, s, [90, -60])
  const target = down[2]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <svg width={820} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            link 길이 1 인 2 관절 평면 팔
          </text>
          <g opacity={prog(t, 0.3)}>
            <line x1={200} y1={o[1]} x2={790} y2={o[1]} stroke={C.cardEdge} strokeWidth={2} />
            <line x1={o[0]} y1={700} x2={o[0]} y2={110} stroke={C.cardEdge} strokeWidth={2} />
            <text x={o[0] + 12} y={680} fill={C.muted} fontSize={22}>
              원점 (0, 0)
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <line x1={o[0]} y1={o[1]} x2={target[0]} y2={target[1]} stroke={C.muted} strokeWidth={2.5} strokeDasharray="8 8" />
            <text x={358} y={426} textAnchor="middle" fill={C.text} fontFamily={MONO} fontSize={28} fontWeight={600}>
              d
            </text>
          </g>
          <Arm pts={down} color={C.blue} opacity={prog(t, 0.6)} />
          <Arm pts={up} color={C.green} dash="2 14" opacity={prog(t, 19.8)} />
          <Target p={target} opacity={prog(t, 1.2)} />
          <text x={target[0] + 22} y={target[1] - 4} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 1.2)}>
            손끝 (0.866, 1.5)
          </text>
          <g opacity={prog(t, 0.6)}>
            <text x={down[1][0] + 22} y={down[1][1] + 8} fill={C.blue} fontFamily={MONO} fontSize={22} fontWeight={600}>
              (30°, 60°)
            </text>
            <text x={down[1][0] + 22} y={down[1][1] + 38} fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 19.8)}>
              elbow-down
            </text>
          </g>
          <g opacity={prog(t, 19.8)}>
            <text x={up[1][0] - 16} y={up[1][1] - 6} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              elbow-up
            </text>
            <text x={up[1][0] - 16} y={up[1][1] + 24} textAnchor="end" fill={C.green} fontFamily={MONO} fontSize={22} fontWeight={600}>
              (90°, −60°)
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={916} y={140} w={940} h={250} at={0.3} title={<Head color={C.accent}>① forward kinematics 와 코사인 법칙</Head>}>
        <Row at={0.6}>
          <span style={mono(C.blue)}>(30°, 60°) → 손끝 (0.866, 1.5)</span>
        </Row>
        <Row at={6.8}>
          <span style={mono()}>d² = 0.75 + 2.25 = 3 → d = 1.732</span>
        </Row>
        <Row at={9.5}>
          <span style={mono(C.accent)}>cos θ₂ = (3 − 1 − 1) ÷ (2 × 1 × 1) = 0.5</span>
        </Row>
      </Box>
      <Box x={916} y={410} w={940} h={270} at={13} title={<Head color={C.orange}>② θ₂ = ±60° 와 θ₁ = φ − β</Head>}>
        <Table
          head={['', 'θ₂ = 60°', 'θ₂ = −60°']}
          widths={[440, 200, 220]}
          monoCols={[1, 2]}
          at={13.2}
          rowAt={[13.6, 15.2, 17.2]}
          rows={[
            ['목표 방향 φ', '60°', '60°'],
            ['θ₁ = 0 일 때 손끝 방향 β', '30°', '−30°'],
            [<span style={{ color: C.accent }}>θ₁ = φ − β</span>, <span style={{ color: C.blue }}>30°</span>, <span style={{ color: C.green }}>90°</span>],
          ]}
        />
      </Box>
      <Box x={916} y={700} w={940} h={180} at={25.6} gap={10} title={<Head color={C.green}>③ 둘 다 맞는 답 · 지금 자세에 가까운 쪽</Head>}>
        <Row at={26} style={{ fontSize: 23 }}>
          지금 <span style={mono(C.text, 23)}>(30°, 50°)</span> → elbow-down: <span style={mono(C.blue, 23)}>θ₂ 만 10°</span>
        </Row>
        <Row at={27.2} style={{ fontSize: 23, color: C.muted }}>
          elbow-up 으로 가려면 <span style={mono(C.green, 23)}>θ₁ 60°</span> 와 <span style={mono(C.green, 23)}>θ₂ 110°</span> 를 돌려야 한다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Workspace() {
  const t = useSec()
  const s = 65
  const disk: Pt = [190, 330]
  const ring: Pt = [620, 330]
  const o3: Pt = [120, 365]
  const poses: [number[], string, string][] = [
    [[30, 30, 30], C.blue, '(30°, 30°, 30°)'],
    [[60, -30, 60], C.green, '(60°, −30°, 60°)'],
    [[90, -60, 30], C.purple, '(90°, −60°, 30°)'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.accent}>cos θ₂ = (d² − 2) ÷ 2 가 −1 ~ 1 사이일 때만 답이 있다</Head>}>
        <Table
          head={['목표', 'd²', 'cos θ₂', '판정']}
          widths={[230, 90, 150, 320]}
          monoCols={[0, 1, 2]}
          at={0.5}
          rowAt={[0.8, 1.6, 4.2, 5.4]}
          colors={[C.blue, C.green, C.red, C.red]}
          rows={[
            ['(0.866, 1.5)', '3', '0.5', '답 둘 (±60°)'],
            ['(2, 0)', '4', '1', '답 하나 (0°)'],
            ['(2, 1)', '5', '1.5', '답 없음'],
            ['(3, 0)', '9', '3.5', '답 없음'],
          ]}
        />
      </Box>
      <Card x={64} y={490} w={880} h={390} at={20.6}>
        <svg width={880} height={390} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            3 관절 팔 · link 길이 모두 1
          </text>
          {poses.map(([deg, color], i) => (
            <Arm key={i} pts={armPts(o3, 110, deg)} color={color} width={6} opacity={prog(t, 21 + i * 0.6)} />
          ))}
          <Target p={armPts(o3, 110, [30, 30, 30])[3]} opacity={prog(t, 21)} />
        </svg>
        <div style={{ position: 'absolute', left: 380, top: 80, width: 470, display: 'grid', gap: 12 }}>
          {poses.map(([, color, label], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 21 + i * 0.6) }}>
              <span style={{ width: 36, height: 6, borderRadius: 3, background: color }} />
              <span style={mono(color, 24)}>{label}</span>
            </div>
          ))}
          <Row at={23.4} style={{ fontSize: 23 }}>
            세 자세 모두 손끝 <span style={mono(C.orange, 23)}>(1.366, 2.366)</span>
          </Row>
          <Row at={24.4} style={{ fontSize: 22, color: C.muted }}>
            30° · 60° · 90° 방향 vector 세 개를 순서만 바꿔 더한 꼴
          </Row>
        </div>
      </Card>
      <Card x={976} y={140} w={880} h={740} at={7}>
        <svg width={880} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            workspace: 손끝이 닿을 수 있는 곳 전체
          </text>
          <g opacity={prog(t, 7.3)}>
            <circle cx={disk[0]} cy={disk[1]} r={2 * s} fill={`${C.blue}26`} stroke={C.blue} strokeWidth={2.5} />
            <circle cx={disk[0]} cy={disk[1]} r={5} fill={C.text} />
            <circle cx={disk[0] + 2 * s} cy={disk[1]} r={7} fill={C.green} />
            <circle cx={disk[0] + 2 * s} cy={disk[1] - s} r={7} fill={C.red} />
            <text x={disk[0] + 2 * s + 12} y={disk[1] - s - 14} fill={C.red} fontFamily={MONO} fontSize={20} fontWeight={600}>
              (2, 1)
            </text>
            <text x={disk[0]} y={580} textAnchor="middle" fill={C.blue} fontFamily={MONO} fontSize={24} fontWeight={600}>
              L₁ = L₂ = 1
            </text>
            <text x={disk[0]} y={614} textAnchor="middle" fill={C.text} fontSize={24}>
              반지름 2 인 원 안 전부
            </text>
          </g>
          <g opacity={prog(t, 13.8)}>
            <circle cx={ring[0]} cy={ring[1]} r={3 * s} fill={`${C.purple}26`} stroke={C.purple} strokeWidth={2.5} />
            <circle cx={ring[0]} cy={ring[1]} r={s} fill={C.card} stroke={C.purple} strokeWidth={2.5} />
            <circle cx={ring[0]} cy={ring[1]} r={5} fill={C.text} />
            <circle cx={ring[0] + 0.5 * s} cy={ring[1]} r={7} fill={C.red} />
            <text x={ring[0]} y={ring[1] + 32} textAnchor="middle" fill={C.red} fontFamily={MONO} fontSize={20} fontWeight={600}>
              (0.5, 0)
            </text>
            <text x={ring[0]} y={580} textAnchor="middle" fill={C.purple} fontFamily={MONO} fontSize={24} fontWeight={600}>
              L₁ = 2, L₂ = 1
            </text>
            <text x={ring[0]} y={614} textAnchor="middle" fill={C.text} fontSize={24}>
              반지름 1 과 3 사이 고리만
            </text>
          </g>
          <g opacity={prog(t, 16)}>
            <text x={30} y={680} fill={C.red} fontFamily={MONO} fontSize={22} fontWeight={600}>
              (0.5, 0): cos θ₂ = (0.25 − 4 − 1) ÷ (2 × 2 × 1) = −1.1875
            </text>
            <text x={30} y={716} fill={C.muted} fontSize={22}>
              link 2 를 완전히 접어도 손끝이 원점에서 2 − 1 = 1 떨어져 있다
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- Jacobian / iterative IK ----------

function Jacobian() {
  const t = useSec()
  const o: Pt = [200, 600]
  const s = 300
  const pts = armPts(o, s, [0, 90])
  const tip = pts[2]
  const k = 0.6 * s
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={800} h={740}>
        <svg width={800} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            자세 (0°, 90°) 에서 joint 를 하나씩 돌리면
          </text>
          <Arm pts={pts} color={C.blue} opacity={prog(t, 0.5)} />
          <g opacity={prog(t, 0.5)}>
            <text x={o[0]} y={644} textAnchor="middle" fill={C.muted} fontSize={22}>
              원점
            </text>
            <text x={pts[1][0]} y={644} textAnchor="middle" fill={C.muted} fontSize={22}>
              팔꿈치 (1, 0)
            </text>
            <text x={tip[0] + 20} y={tip[1] + 6} fill={C.text} fontSize={22} fontWeight={600}>
              손끝 (1, 1)
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            <line x1={o[0]} y1={o[1]} x2={tip[0]} y2={tip[1]} stroke={C.green} strokeWidth={2} strokeDasharray="7 7" opacity={0.8} />
            <text x={320} y={440} textAnchor="end" fill={C.green} fontSize={22}>
              원점 → 손끝 (1, 1)
            </text>
            {arrow(tip[0], tip[1], tip[0] - k, tip[1] - k, C.green, 4)}
            <text x={tip[0] - k - 16} y={tip[1] - k - 14} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              joint 1 열 (−1, 1)
            </text>
          </g>
          <g opacity={prog(t, 16.8)}>
            <text x={pts[1][0] + 20} y={460} fill={C.orange} fontSize={22}>
              팔꿈치 → 손끝 (0, 1)
            </text>
            {arrow(tip[0], tip[1], tip[0] - k, tip[1], C.orange, 4)}
            <text x={tip[0] - k - 14} y={tip[1] + 8} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              joint 2 열 (−1, 0)
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={896} y={140} w={960} h={230} at={0.3} title={<Head color={C.accent}>Jacobian J: joint 마다 열 하나</Head>}>
        <Row at={0.6}>열 = joint 하나만 조금 돌릴 때 손끝 x, y 가 변하는 비율</Row>
        <Row at={7.2}>그 joint 에서 손끝까지의 vector 를 시계 반대 방향으로 90° 돌린 vector</Row>
        <Row at={9.5}>
          <span style={mono(C.accent)}>(a, b) → (−b, a)</span>
        </Row>
      </Box>
      <Box x={896} y={390} w={960} h={200} at={14.2} title={<Head color={C.blue}>J(0°, 90°) 와 선형 근사</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <span style={mono(C.text, 26)}>J =</span>
          <Matrix rows={[['−1', '−1'], ['1', '0']]} />
          <span style={{ ...mono(C.accent, 26), marginLeft: 40, opacity: prog(t, 21) }}>Δp ≈ J Δq</span>
        </div>
      </Box>
      <Box x={896} y={610} w={960} h={270} at={21.2} title={<Head color={C.orange}>예측 J Δq 와 FK 로 구한 실제 이동</Head>}>
        <Table
          head={['Δq (rad)', '예측 J Δq', '실제 (FK)', '차이']}
          widths={[200, 210, 270, 130]}
          monoCols={[0, 1, 2, 3]}
          size={22}
          at={21.4}
          rowAt={[21.8, 24.2, 25.2]}
          colors={[C.green, C.orange, C.red]}
          rows={[
            ['(0.01, 0.02)', '(−0.03, 0.01)', '(−0.0300, 0.0095)', '0.00045'],
            ['(0.1, 0.2)', '(−0.3, 0.1)', '(−0.3005, 0.0552)', '0.045'],
            ['(0.5, 0.5)', '(−1, 0.5)', '(−0.964, 0.020)', '0.48'],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

function Iterate() {
  const t = useSec()
  const o: Pt = [330, 520]
  const s = 280
  const step0 = armPts(o, s, [0, 90])
  const step1 = armPts(o, s, [28.65, 90])
  const step3 = armPts(o, s, [33.8, 75.53])
  const up = armPts(o, s, [109.33, -75.52])
  const target = step3[2]
  const legend: [string, string, number, string?][] = [
    [C.dim, 'step 0 (0°, 90°)', 0.5, '6 10'],
    [C.orange, 'step 1 (28.65°, 90°)', 7, undefined],
    [C.green, 'step 3 (33.80°, 75.53°) · elbow-down', 15, undefined],
    [C.purple, 'seed (90°, −90°) → elbow-up (109.33°, −75.52°)', 19.8, '2 12'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={760} h={740}>
        <svg width={760} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            목표 (0.5, 1.5) 를 향한 반복
          </text>
          <line x1={240} y1={o[1]} x2={720} y2={o[1]} stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 0.3)} />
          <Arm pts={step0} color={C.dim} width={6} dash="6 10" opacity={prog(t, 0.5)} />
          <Arm pts={step1} color={C.orange} width={6} opacity={prog(t, 7)} />
          <Arm pts={step3} color={C.green} width={7} opacity={prog(t, 15)} />
          <Arm pts={up} color={C.purple} width={6} dash="2 12" opacity={prog(t, 19.8)} />
          <Target p={target} opacity={prog(t, 0.4)} />
          <text x={target[0] + 20} y={target[1] + 6} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 0.4)}>
            목표 (0.5, 1.5)
          </text>
          <text x={step0[2][0] + 16} y={step0[2][1] + 8} fill={C.muted} fontFamily={MONO} fontSize={22} fontWeight={600} opacity={prog(t, 0.5)}>
            0
          </text>
          <text x={step1[2][0] - 10} y={step1[2][1] + 28} textAnchor="end" fill={C.orange} fontFamily={MONO} fontSize={22} fontWeight={600} opacity={prog(t, 7)}>
            1
          </text>
          {legend.map(([color, label, at, dash], i) => (
            <g key={label} opacity={prog(t, at)}>
              <line x1={30} x2={70} y1={592 + i * 36} y2={592 + i * 36} stroke={color} strokeWidth={6} strokeDasharray={dash} strokeLinecap="round" />
              <text x={84} y={600 + i * 36} fill={C.text} fontFamily={MONO} fontSize={21}>
                {label}
              </text>
            </g>
          ))}
        </svg>
      </Panel>
      <Box x={856} y={140} w={1000} h={140} at={0.3} gap={10}>
        <Row at={0.5}>
          오차 <span style={mono(C.orange)}>e = (−0.5, 0.5)</span> · 남은 거리 <span style={mono(C.orange)}>‖e‖ ≈ 0.707</span>
        </Row>
        <Row at={2.5}>
          <span style={mono(C.accent)}>Δq = J⁻¹e = (0.5, 0)</span> · joint 1 만 <span style={mono(C.accent)}>0.5 rad = 28.65°</span>
        </Row>
      </Box>
      <Box x={856} y={296} w={1000} h={300} at={0.6} title={<Head color={C.green}>pseudo-inverse 반복 · step 마다 Jacobian 을 다시 구한다</Head>}>
        <Table
          head={['step', 'θ₁', 'θ₂', '손끝', '남은 거리']}
          widths={[90, 170, 170, 280, 180]}
          at={0.8}
          rowAt={[1, 7, 13.4, 15]}
          colors={[C.muted, C.orange, C.text, C.green]}
          rows={[
            ['0', '0°', '90°', '(1, 1)', '0.707'],
            ['1', '28.65°', '90°', '(0.398, 1.357)', '0.176'],
            ['2', '33.04°', '76.56°', '(0.503, 1.487)', '0.013'],
            ['3', '33.80°', '75.53°', '(0.4999, 1.4999)', '0.00009'],
          ]}
        />
      </Box>
      <Box x={856} y={612} w={1000} h={268} at={25.6} color={`${C.red}88`} title={<Head color={C.red}>Jacobian transpose: Δq = α Jᵀe · α = 0.5 는 step 40 에 0.0004</Head>}>
        <Table
          head={['남은 거리', 'step 1', 'step 2', 'step 3', 'step 10']}
          widths={[170, 140, 140, 140, 140]}
          size={23}
          at={25.8}
          rowAt={[26.2, 27.4, 28.6]}
          colors={[C.text, C.orange, C.red]}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['α = 0.5', '0.419', '0.245', '0.186', '0.047'],
            ['α = 1', '1.123', '1.039', '1.564', '0.615'],
            ['α = 2', '1.90', '2.12', '1.54', '1.74'],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- singularity / damped least squares ----------

function Singular() {
  const t = useSec()
  const o: Pt = [90, 250]
  const pts = armPts(o, 230, [0, 0])
  const tip = pts[2]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={380}>
        <svg width={820} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            쭉 편 팔 (0°, 0°)
          </text>
          <Arm pts={pts} color={C.blue} opacity={prog(t, 0.4)} />
          <g opacity={prog(t, 0.4)}>
            <text x={o[0]} y={292} textAnchor="middle" fill={C.muted} fontSize={22}>
              joint 1
            </text>
            <text x={pts[1][0]} y={292} textAnchor="middle" fill={C.muted} fontSize={22}>
              joint 2
            </text>
            <text x={tip[0]} y={292} textAnchor="middle" fill={C.muted} fontSize={22}>
              손끝 (2, 0)
            </text>
          </g>
          <g opacity={prog(t, 1.5)}>
            {arrow(tip[0] - 18, tip[1] - 14, tip[0] - 18, tip[1] - 134, C.green, 4)}
            <text x={tip[0] - 32} y={tip[1] - 110} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              joint 1 열 (0, 2)
            </text>
            {arrow(tip[0] + 18, tip[1] - 14, tip[0] + 18, tip[1] - 74, C.orange, 4)}
            <text x={tip[0] + 32} y={tip[1] - 50} fill={C.orange} fontSize={22} fontWeight={600}>
              joint 2 열 (0, 1)
            </text>
          </g>
          <text x={tip[0]} y={340} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 4)}>
            두 열이 모두 세로 · 가로(x) 로는 못 움직인다
          </text>
        </svg>
      </Panel>
      <Box x={64} y={540} w={820} h={340} at={2} title={<Head color={C.red}>determinant 가 0 인 자세 = singularity</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={mono(C.text, 26)}>J(0°, 0°) =</span>
          <Matrix rows={[['0', '0'], ['2', '1']]} />
        </div>
        <Row at={3}>
          <span style={mono(C.red)}>det J = 0 × 1 − 0 × 2 = 0</span>
        </Row>
        <Row at={7.4}>
          <span style={mono()}>det J = L₁L₂ sin θ₂</span> → θ₂ = 0° 와 180°
        </Row>
        <Row at={10} style={{ color: C.muted, fontSize: 22 }}>
          Jacobian 의 rank(독립인 열의 수)가 2 에서 1 로 줄어든다
        </Row>
      </Box>
      <Box x={916} y={140} w={940} h={400} at={14} title={<Head color={C.orange}>거의 편 팔에서 손끝을 0.01 당길 때 · e = (−0.01, 0)</Head>}>
        <Table
          head={['θ₂ = s (rad)', 'det J', 'Δq = J⁻¹e', '‖Δq‖']}
          widths={[240, 130, 260, 150]}
          monoCols={[0, 1, 2, 3]}
          at={14.2}
          rowAt={[14.5, 15.3, 16.3, 17.3]}
          colors={[C.text, C.text, C.orange, C.red]}
          rows={[
            ['0.5 (28.6°)', '0.479', '(−0.018, 0.039)', '0.043'],
            ['0.1 (5.7°)', '0.0998', '(−0.100, 0.200)', '0.223'],
            ['0.01 (0.57°)', '0.0100', '(−1.00, 2.00)', '2.236'],
            ['0.001 (0.057°)', '0.0010', '(−10.0, 20.0)', '22.36'],
          ]}
        />
        <Row at={18.4} style={{ fontSize: 22, color: C.muted }}>
          θ₂ 가 10 분의 1 이 될 때마다 ‖Δq‖ 는 10 배 · s = 0.001 이면 joint 2 를 20 rad, 세 바퀴 넘게 돌리라고 한다
        </Row>
      </Box>
      <Box x={916} y={560} w={940} h={320} at={21.2} title={<Head color={C.accent}>singular value σ: Jacobian 이 방향마다 늘리는 배율</Head>}>
        <Row at={21.5} style={{ fontSize: 23 }}>
          쭉 편 팔: <span style={mono(C.text, 23)}>(2, 1)</span> 방향 배율 <span style={mono(C.green, 23)}>5 ÷ √5 ≈ 2.236</span> · <span style={mono(C.text, 23)}>(1, −2)</span> 방향 배율 <span style={mono(C.red, 23)}>0</span>
        </Row>
        <Row at={23} style={{ fontSize: 23 }}>
          pseudo-inverse 는 방향마다 <span style={mono(C.orange, 23)}>e ÷ σ</span> 만큼 돌린다 · σ → 0 이면 움직임이 아주 커진다
        </Row>
        <Row at={24.8} style={{ fontSize: 22, color: C.muted }}>
          MoveIt 2 의 KDL plugin 은 SVD 로 pseudo-inverse 를 구하면서 0.001 보다 작은 singular value 의 역수를 0 으로 둔다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Dls() {
  const t = useSec()
  // σ on a log axis from 0.001 to 1, joint movement from 0 to 0.25
  const X0 = 110
  const X1 = 830
  const Y0 = 420
  const Y1 = 100
  const sx = (sig: number) => X0 + ((Math.log10(sig) + 3) / 3) * (X1 - X0)
  const sy = (v: number) => Y0 - (v / 0.25) * (Y0 - Y1)
  const e = 0.01
  const lam = 0.05
  const sigmas = Array.from({ length: 121 }, (_, i) => 10 ** (-3 + (3 * i) / 120))
  const pinv = sigmas.filter((sg) => e / sg <= 0.25).map((sg) => `${sx(sg)},${sy(e / sg)}`)
  const dls = sigmas.map((sg) => `${sx(sg)},${sy((sg * e) / (sg * sg + lam * lam))}`)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={880} h={540}>
        <svg width={880} height={540}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12.6)}>
            배율 σ 에 따른 joint 움직임 · e = 0.01, λ = 0.05
          </text>
          <g opacity={prog(t, 12.6)}>
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.muted} strokeWidth={2} />
            <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 10} stroke={C.muted} strokeWidth={2} />
            {[0.001, 0.01, 0.1, 1].map((v) => (
              <g key={v}>
                <line x1={sx(v)} y1={Y0} x2={sx(v)} y2={Y0 + 8} stroke={C.muted} strokeWidth={2} />
                <text x={sx(v)} y={Y0 + 34} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={20}>
                  {v}
                </text>
              </g>
            ))}
            {[0, 0.1, 0.2].map((v) => (
              <text key={v} x={X0 - 12} y={sy(v) + 7} textAnchor="end" fill={C.muted} fontFamily={MONO} fontSize={20}>
                {v}
              </text>
            ))}
            <text x={(X0 + X1) / 2} y={Y0 + 66} textAnchor="middle" fill={C.muted} fontSize={21}>
              배율 σ (log 눈금)
            </text>
            <line x1={X0} y1={sy(0.1)} x2={sx(0.05)} y2={sy(0.1)} stroke={C.green} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.7} />
          </g>
          <polyline points={pinv.join(' ')} fill="none" stroke={C.red} strokeWidth={4} opacity={prog(t, 13.2)} />
          <polyline points={dls.join(' ')} fill="none" stroke={C.green} strokeWidth={4} opacity={prog(t, 13.8)} />
          <g opacity={prog(t, 15)}>
            <text x={478} y={118} textAnchor="end" fill={C.red} fontSize={21}>
              끝없이 커진다 ↑
            </text>
            <circle cx={sx(0.05)} cy={sy(0.1)} r={7} fill={C.green} />
            <text x={500} y={252} textAnchor="end" fill={C.green} fontSize={21} fontWeight={600}>
              σ = λ = 0.05 에서 최대 0.1
            </text>
          </g>
          <g opacity={prog(t, 13.4)}>
            <line x1={40} y1={514} x2={76} y2={514} stroke={C.red} strokeWidth={5} />
            <text x={88} y={521} fill={C.red} fontFamily={MONO} fontSize={21} fontWeight={600}>
              pseudo-inverse e ÷ σ
            </text>
            <line x1={440} y1={514} x2={476} y2={514} stroke={C.green} strokeWidth={5} />
            <text x={488} y={521} fill={C.green} fontFamily={MONO} fontSize={21} fontWeight={600}>
              DLS σe ÷ (σ² + λ²)
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={976} y={140} w={880} h={540} at={0.3} title={<Head color={C.accent}>damped least squares (DLS)</Head>}>
        <Row at={0.6}>
          <span style={mono(C.text, 24)}>f(Δ) = (σΔ − e)² + λ²Δ²</span>
        </Row>
        <Row at={2} style={{ fontSize: 22, color: C.muted }}>
          앞 항: 손끝이 σΔ 만큼 움직인 뒤 남는 오차의 제곱 · 뒤 항: joint 를 돌린 양에 매기는 벌점
        </Row>
        <Row at={6.8}>
          가장 작게 하는 <span style={mono(C.green)}>Δ = σe ÷ (σ² + λ²)</span> · λ = 0 이면 pseudo-inverse
        </Row>
        <div style={{ marginTop: 8 }}>
          <Table
            head={['σ', 'pseudo-inverse', 'DLS']}
            widths={[160, 260, 260]}
            at={12.8}
            step={0.5}
            colors={[C.text, C.text, C.text, C.orange, C.red]}
            rows={[
              ['1', '0.01', '0.00998'],
              ['0.1', '0.1', '0.08'],
              ['0.05', '0.2', '0.1'],
              ['0.01', '1', '0.0385'],
              ['0.001', '10', '0.0040'],
            ]}
            monoCols={[0, 1, 2]}
          />
        </div>
      </Box>
      <Box x={64} y={700} w={880} h={180} at={19.2} gap={8} title={<Head color={C.red} size={24}>거의 편 팔 (0°, 0.001 rad) → 목표 (1.99, 0)</Head>}>
        <Row at={19.5} style={{ fontSize: 22 }}>
          pseudo-inverse: step 0 에 <span style={mono(C.red, 22)}>22.36 rad</span> → <span style={mono(C.red, 22)}>(−725.73°, 1451.46°)</span>
        </Row>
        <Row at={25.2} style={{ fontSize: 22 }}>
          DLS λ = 0.05: 한 step 에 0.08 rad 이하 → <span style={mono(C.green, 22)}>(−5.73°, 11.46°)</span> 근처
        </Row>
      </Box>
      <Box x={976} y={700} w={880} h={180} at={26.4} gap={10} title={<Head color={C.orange} size={24}>λ 를 키우면 느려진다 · 목표 (0.5, 1.5) 의 step 3 남은 거리</Head>}>
        <div style={{ display: 'flex', gap: 28 }}>
          {(
            [
              ['λ = 0', '0.00009', C.green, 26.8],
              ['λ = 0.5', '0.038', C.orange, 27.3],
              ['λ = 1', '0.141', C.red, 27.8],
            ] as const
          ).map(([k, v, color, at]) => (
            <span key={k} style={{ ...mono(color, 24), opacity: prog(t, at) }}>
              {k}: {v}
            </span>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- joint limits / solvers ----------

function Limits() {
  const t = useSec()
  const o: Pt = [300, 560]
  const s = 260
  const stuck = armPts(o, s, [90, -90])
  const good = armPts(o, s, [33.8, 75.52])
  const target = good[2]
  const ghost: Pt = [o[0] + Math.cos((118.65 * Math.PI) / 180) * 200, o[1] - Math.sin((118.65 * Math.PI) / 180) * 200]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={800} h={740}>
        <svg width={800} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            θ₁ 범위 −90° ~ 90° 인 팔 · 목표 (0.5, 1.5)
          </text>
          <path d={`M ${o[0]} ${o[1] - 170} A 170 170 0 0 1 ${o[0]} ${o[1] + 170} Z`} fill={`${C.green}1c`} opacity={prog(t, 0.6)} />
          <text x={o[0] + 20} y={o[1] + 60} fill={C.green} fontSize={21} opacity={prog(t, 0.6)}>
            link 1 이 갈 수 있는 쪽
          </text>
          <g opacity={prog(t, 7.2)}>
            <line x1={o[0]} y1={o[1]} x2={o[0]} y2={230} stroke={C.red} strokeWidth={2.5} strokeDasharray="8 8" />
            <text x={o[0] - 16} y={250} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600}>
              θ₁ = 90° 한계
            </text>
            <line x1={o[0]} y1={o[1]} x2={ghost[0]} y2={ghost[1]} stroke={C.red} strokeWidth={3} strokeDasharray="3 9" opacity={0.8} />
            <text x={ghost[0] - 10} y={ghost[1] + 6} textAnchor="end" fill={C.red} fontFamily={MONO} fontSize={22} fontWeight={600}>
              118.65°
            </text>
          </g>
          <Arm pts={stuck} color={C.red} opacity={prog(t, 7.4)} />
          <g opacity={prog(t, 14.3)}>
            <line x1={stuck[2][0]} y1={stuck[2][1]} x2={target[0]} y2={target[1]} stroke={C.red} strokeWidth={1.5} strokeDasharray="5 6" />
            <text x={stuck[2][0] + 18} y={stuck[2][1] + 8} fill={C.red} fontSize={22} fontWeight={600}>
              남은 거리 0.707
            </text>
          </g>
          <Arm pts={good} color={C.green} opacity={prog(t, 17)} />
          <Target p={target} opacity={prog(t, 0.4)} />
          <text x={target[0] + 22} y={target[1] - 2} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 0.4)}>
            목표 (0.5, 1.5)
          </text>
        </svg>
      </Panel>
      <Box x={896} y={140} w={960} h={200} at={0.3} title={<Head color={C.accent}>URDF 의 &lt;limit&gt; → step 마다 범위 안으로 자르기 (clip)</Head>}>
        <Row at={0.6}>범위 밖의 값을 내면 로봇이 갈 수 없어서, step 마다 joint angle 을 자른다</Row>
        <Row at={3.2} style={{ color: C.muted }}>
          자르면 계산이 limit 에 걸려 목표에 닿지 못한 채 멈추기도 한다
        </Row>
      </Box>
      <Box x={896} y={360} w={960} h={250} at={7.2} color={`${C.red}88`} title={<Head color={C.red}>seed (90°, −90°) 에서 출발</Head>}>
        <Flow steps={['첫 step θ₁ = 118.65°', 'clip → 90°', '제자리로 돌아옴']} color={C.red} at={7.6} gap={1.2} />
        <Row at={14.3}>
          되풀이하다 <span style={mono(C.red)}>남은 거리 0.707</span> 에서 멈춘다
        </Row>
      </Box>
      <Box x={896} y={630} w={960} h={250} at={16.6} color={`${C.green}88`} title={<Head color={C.green}>random restart: 다른 시작 자세에서 다시 풀기</Head>}>
        <Flow steps={['seed (0°, 90°)', 'elbow-down (33.80°, 75.52°)']} color={C.green} at={17} gap={1.2} />
        <Row at={21.3}>joint limit 안에서 무작위로 고른 자세에서 다시 푼다</Row>
      </Box>
    </AbsoluteFill>
  )
}

function Plugins() {
  const t = useSec()
  const solvers: [string, string, string, number][] = [
    ['KDL', 'SVD pseudo-inverse 의 Newton 반복 · random restart', 'MoveIt 2 기본 · 최대 500 step · 오차 1e-5 에서 성공', 13.3],
    ['TRAC-IK', 'KDL-RR 과 SQP 최적화를 동시에 실행', '오차 1e-5 · solve_type 기본 Distance: seed 에 가장 가까운 답', 19.8],
    ['pick_ik', 'gradient descent 와 evolutionary algorithm', 'bio_ik 를 다시 구현 · 튜토리얼 예시: 위치 0.001 m · 방향 0.01 rad', 22.4],
    ['IKFast', 'OpenRAVE 가 로봇마다 생성한 해석적 풀이 C++ 코드', '몇 microsecond · 6 · 7 관절 팔에서 시험', 23.4],
  ]
  const arms: [string, number, number, number][] = [
    ['Franka Panda', 62.0, 93.2, 99.9],
    ['KUKA iiwa 14', 38.1, 95.2, 99.9],
    ['UR5', 16.5, 88.6, 99.2],
    ['Jaco2', 26.3, 97.9, 99.9],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={220} at={0.3} title={<Head color={C.accent}>kinematics.yaml (로봇 설정 package)</Head>}>
        <Row at={0.6}>
          IK solver plugin 과 <span style={mono(C.accent, 22)}>kinematics_solver_timeout</span> 을 적는다
        </Row>
        <Row at={6.8}>
          timeout: 값이 없으면 <span style={mono(C.orange)}>0.05 초</span> · Setup Assistant 가 만든 파일은 <span style={mono(C.orange)}>0.005 초</span> (5 ms)
        </Row>
      </Box>
      <Box x={64} y={380} w={900} h={500} at={13} gap={16} title={<Head color={C.blue}>MoveIt 2 의 IK plugin</Head>}>
        {solvers.map(([name, how, cfg, at]) => (
          <div key={name} style={{ display: 'flex', gap: 18, opacity: prog(t, at) }}>
            <span style={{ ...mono(C.blue, 24), width: 120 }}>{name}</span>
            <div style={{ display: 'grid', gap: 2, width: 700 }}>
              <span style={line(C.text, 22)}>{how}</span>
              <span style={line(C.muted, 21)}>{cfg}</span>
            </div>
          </div>
        ))}
      </Box>
      <Card x={996} y={140} w={860} h={740} at={25.6}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 8 }}>
          <Head color={C.text} size={26}>
            TRAC-IK README 의 IK 성공률
          </Head>
          <Label size={21} color={C.muted}>
            팔마다 손이 닿는 무작위 자세 10,000 개 · 오차 1e-5 · 5 ms 안에
          </Label>
          <div style={{ display: 'flex', gap: 22, margin: '4px 0 6px', opacity: prog(t, 25.8) }}>
            {(
              [
                ['KDL', C.red],
                ['KDL-RR', C.orange],
                ['TRAC-IK', C.green],
              ] as const
            ).map(([k, color]) => (
              <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 21, color }}>
                <span style={{ width: 22, height: 14, borderRadius: 3, background: color }} />
                {k}
              </span>
            ))}
          </div>
          {arms.map(([arm, kdl, rr, trac], i) => (
            <div key={arm} style={{ display: 'grid', gap: 4, padding: '4px 10px', borderRadius: 12, border: `1.5px solid ${arm === 'UR5' ? `${C.accent}88` : 'transparent'}` }}>
              <span style={{ ...line(arm === 'UR5' ? C.accent : C.text, 22), lineHeight: 1.3, fontWeight: 600, opacity: prog(t, 26 + i * 0.5) }}>{arm}</span>
              <Bar label="KDL" value={kdl} max={100} color={C.red} at={26.2 + i * 0.5} unit="%" />
              <Bar label="KDL-RR" value={rr} max={100} color={C.orange} at={26.4 + i * 0.5} unit="%" />
              <Bar label="TRAC-IK" value={trac} max={100} color={C.green} at={26.6 + i * 0.5} unit="%" />
            </div>
          ))}
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'cos θ₂ = 0.5 → (30°, 60°) 와 (90°, −60°) · cos θ₂ 가 −1 ~ 1 밖이면 닿지 않는다', at: 1 },
    { tag: script.sections[1], color: C.blue, text: 'J Δq = e 를 풀고 다시 · 0.707 → 0.176 → 0.013 → 0.00009 · 어느 답일지는 seed 가 정한다', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'e ÷ σ 가 22.36 rad 까지 · DLS σe ÷ (σ² + λ²) 는 최대 0.1 · KDL 은 σ < 0.001 을 버린다', at: 8.4 },
    { tag: script.sections[3], color: C.red, text: 'clip 에 막히면 random restart · UR5 성공률 KDL 16.5% · TRAC-IK 99.2%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            FK 식을 거꾸로 풀어, 손끝을 컵에 두는 joint angle 은 어떻게 구할까?
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
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · KINEMATICS
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Trajectory Generation</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            IK 가 구한 각도까지 joint limit 안에서 시간에 맞춰 가는 계산
          </Label>
        </Appear>
        <Appear at={3.6}>
          <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
            <span style={{ padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 26 }}>
              <span style={{ fontFamily: MONO, color: C.accent }}>Motion Planning</span> · 부딪히지 않는 경로
            </span>
            <span style={{ padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 26 }}>
              <span style={{ fontFamily: MONO, color: C.accent }}>MuJoCo Simulation</span> · torque 로 움직이기
            </span>
          </div>
        </Appear>
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/inverse-kinematics (Whitney · Nakamura · Wampler · Buss · TRAC-IK)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseTwo = () => (
  <PauseWrite
    question="link 길이가 둘 다 1 인 2 관절 평면 팔의 목표가 (1, 1) 이면, IK 의 두 답은?"
    answer={
      <>
        d² = 2 → cos θ₂ = 0 → θ₂ = ±90° · φ = 45°
        <br />
        θ₁ = 45° − 45° = 0° 또는 45° − (−45°) = 90°
        <br />
        답: (0°, 90°) 와 (90°, −90°)
      </>
    }
  />
)

const PauseTranspose = () => (
  <PauseWrite
    question="자세 (0°, 90°) 의 J 는 첫째 열 (−1, 1), 둘째 열 (−1, 0) 이다. e = (0.2, 0.4), α = 0.5 면 Jacobian transpose 의 Δq = α Jᵀe 는?"
    answer={
      <>
        Jᵀe 첫째 칸: (−1)(0.2) + 1 × 0.4 = 0.2
        <br />
        Jᵀe 둘째 칸: (−1)(0.2) + 0 × 0.4 = −0.2
        <br />
        Δq = 0.5 × (0.2, −0.2) = (0.1, −0.1)
      </>
    }
  />
)

const PauseDls = () => (
  <PauseWrite
    question="한 방향의 배율 σ = 0.5, 그 방향 오차 e = 1, λ = 1 일 때 pseudo-inverse 와 DLS 의 joint 움직임은?"
    answer={
      <>
        pseudo-inverse: e ÷ σ = 1 ÷ 0.5 = 2
        <br />
        DLS: σe ÷ (σ² + λ²) = 0.5 × 1 ÷ (0.25 + 1) = 0.5 ÷ 1.25 = 0.4
        <br />
        DLS 가 움직임을 5 분의 1 로 줄인다
      </>
    }
  />
)

const PauseClip = () => (
  <PauseWrite
    question="θ₁ 의 범위가 −90° ~ 90° 인데 반복 계산이 θ₁ = 109.33° 를 냈다. clip 하면 몇 도이고, 목표 (0.5, 1.5) 에는 어떤 답을 써야 할까?"
    answer={
      <>
        clip → 90°
        <br />
        elbow-up (109.33°, −75.52°) 는 범위 밖이라 쓸 수 없다
        <br />
        elbow-down (33.80°, 75.52°) 를 쓰고, 막히면 다른 seed 로 다시 푼다
      </>
    }
  />
)

export function InverseKinematics() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        analytic: Analytic,
        workspace: Workspace,
        'pause-two': PauseTwo,
        jacobian: Jacobian,
        iterate: Iterate,
        'pause-transpose': PauseTranspose,
        singular: Singular,
        dls: Dls,
        'pause-dls': PauseDls,
        limits: Limits,
        plugins: Plugins,
        'pause-clip': PauseClip,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
