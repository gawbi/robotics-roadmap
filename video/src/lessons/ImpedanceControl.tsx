import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './impedance-control.narration.json'
import { script } from './impedance-control.script'

// Numbers follow lessons/impedance-control/README.md (see impedance-control.script.ts). The arm, table, spring and residual
// drawings are schematic (marked 모식도 / 만든 예); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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

/** Jᵀ drawn with a real superscript, which every font has */
const JT = ({ f = true }: { f?: boolean }) => (
  <span>
    J<sup style={{ fontSize: '0.6em' }}>T</sup>
    {f ? 'F' : ''}
  </span>
)

/** a line of text that fades in at `at` */
function Line({ at, children, style }: { at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ opacity: prog(t, at), ...style }}>{children}</div>
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

/** a vertical zigzag spring from y1 down to y2 */
function spring(x: number, y1: number, y2: number, color: string, coils = 6, half = 16) {
  const lead = 12
  const step = (y2 - y1 - 2 * lead) / (coils * 2)
  const pts: string[] = [`${x},${y1}`, `${x},${y1 + lead}`]
  for (let i = 0; i < coils * 2; i++) pts.push(`${x + (i % 2 === 0 ? half : -half)},${y1 + lead + step * (i + 0.5)}`)
  pts.push(`${x},${y2 - lead}`, `${x},${y2}`)
  return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
}

/** a vertical damper (cylinder and piston) from y1 down to y2 */
function damper(x: number, y1: number, y2: number, color: string) {
  const mid = (y1 + y2) / 2
  return (
    <g stroke={color} strokeWidth={3} fill="none">
      <line x1={x} y1={y1} x2={x} y2={mid - 6} />
      <line x1={x - 14} y1={mid - 6} x2={x + 14} y2={mid - 6} />
      <polyline points={`${x - 20},${mid - 22} ${x - 20},${mid + 18} ${x + 20},${mid + 18} ${x + 20},${mid - 22}`} />
      <line x1={x} y1={mid + 18} x2={x} y2={y2} />
    </g>
  )
}

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 3 }}>
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

const Divider = ({ at }: { at: number }) => {
  const t = useSec()
  return <div style={{ height: 1.5, background: C.cardEdge, opacity: prog(t, at) }} />
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            KINEMATICS · FORCE & IMPEDANCE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Force & Impedance Control</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontSize: 36, color: C.muted }}>
            손끝의 <span style={{ color: C.accent }}>힘</span>과 <span style={{ color: C.accent }}>단단함</span>을 정하는 제어
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            책상 높이를 정확히 몰라도 일정한 힘으로 누르게 하는 방법
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

/** an arm coming down onto a table whose real top sits `dy` px off the height the program knows (y = known) */
function Wipe({ ox, t, at, dy, title, note, color }: { ox: number; t: number; at: number; dy: number; title: string; note: string; color: string }) {
  const known = 250
  const top = known + dy
  const hand = Math.min(known, top) - 14
  const ax = ox + 110
  return (
    <g opacity={prog(t, at)}>
      <line x1={ox} y1={known} x2={ox + 380} y2={known} stroke={C.accent} strokeWidth={2} strokeDasharray="8 7" />
      <rect x={ox} y={top} width={380} height={300 - top + 20} rx={6} fill={`${C.blue}1c`} stroke={C.blue} strokeWidth={2} />
      <line x1={ax} y1={100} x2={ax} y2={hand - 12} stroke={C.muted} strokeWidth={14} strokeLinecap="round" />
      <circle cx={ax} cy={hand} r={14} fill={C.text} />
      <text x={ox} y={360} fill={C.text} fontSize={22} fontWeight={600}>
        {title}
      </text>
      <text x={ox} y={392} fill={color} fontSize={21}>
        {note}
      </text>
    </g>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={880} h={420}>
        <svg width={880} height={420}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            position 제어 팔로 책상 닦기
          </text>
          <text x={850} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 높이 차이는 과장
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={30} y1={76} x2={80} y2={76} stroke={C.accent} strokeWidth={2} strokeDasharray="8 7" />
            <text x={92} y={83} fill={C.accent} fontSize={20}>
              프로그램이 아는 책상 높이
            </text>
          </g>
          <Wipe ox={30} t={t} at={0.6} dy={-22} title="책상이 1 mm 높으면" note="수십 N 으로 짓누르거나 충돌로 멈춤" color={C.red} />
          <Wipe ox={470} t={t} at={1.4} dy={22} title="책상이 1 mm 낮으면" note="손끝이 허공을 닦음" color={C.blue} />
        </svg>
      </Panel>
      <Card x={976} y={130} w={880} h={420} at={1.8}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 16 }}>
          <Head size={26}>카메라로 잰 책상 높이는 mm 단위로 틀린다</Head>
          <Line at={2.3} style={line(C.muted, 24)}>
            단단한 position 제어는 1 mm 차이에도 힘이 크게 바뀐다
          </Line>
          <Line at={2.8} style={line(C.text, 24)}>
            Franka 로봇 팔: joint torque 명령을 <span style={mono(C.accent, 24)}>1초에 1000 번</span> 받는다
          </Line>
          <Line at={3.3} style={line(C.text, 24)}>
            공식 예제: 손끝 stiffness <span style={mono(C.accent, 24)}>150 N/m</span> 인 Cartesian impedance controller
          </Line>
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 600, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          책상 높이를 정확히 모르는 채로 일정한 힘으로 닦게 하려면
          <br />
          <span style={{ color: C.accent }}>motor 에 무엇을 명령해야 할까?</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- 1. contact and position control ----------

function StiffRow({ k, src, f, at }: { k: string; src: string; f: number; at: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <div style={{ width: 280, display: 'grid', gap: 2 }}>
        <span style={mono(C.text, 26)}>{k}</span>
        <span style={{ fontSize: 20, color: C.dim, whiteSpace: 'nowrap' }}>{src}</span>
      </div>
      <div style={{ width: 380, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * f * prog(t, at, 0.9)) / 57}%`, minWidth: 4, height: '100%', borderRadius: 8, background: f > 10 ? C.red : C.orange }} />
      </div>
      <span style={{ ...mono(f > 10 ? C.red : C.orange, 26), opacity: prog(t, at + 0.6) }}>{f} N</span>
    </div>
  )
}

function Contact() {
  const t = useSec()
  const ax = 430
  const top = 430
  const hand = top - 14
  const goal = 500
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={860} h={740}>
        <svg width={860} height={740}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              목표가 책상 안쪽에 있을 때
            </text>
            <text x={830} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도 · 1 mm 는 과장
            </text>
          </g>
          <g opacity={prog(t, 0.5)}>
            <rect x={80} y={top} width={700} height={130} rx={8} fill={`${C.blue}1c`} stroke={C.blue} strokeWidth={2} />
            <text x={110} y={540} fill={C.blue} fontSize={22}>
              책상
            </text>
            <line x1={ax} y1={90} x2={ax} y2={hand - 12} stroke={C.muted} strokeWidth={16} strokeLinecap="round" />
            <circle cx={ax} cy={hand} r={14} fill={C.text} />
            <text x={ax - 30} y={hand - 30} textAnchor="end" fill={C.text} fontSize={22}>
              손끝
            </text>
          </g>
          <g opacity={prog(t, 1)}>
            <line x1={ax - 12} y1={goal - 12} x2={ax + 12} y2={goal + 12} stroke={C.accent} strokeWidth={4} />
            <line x1={ax - 12} y1={goal + 12} x2={ax + 12} y2={goal - 12} stroke={C.accent} strokeWidth={4} />
            {spring(ax, hand + 14, goal - 14, C.accent, 3, 12)}
            <text x={ax + 34} y={goal + 8} fill={C.accent} fontSize={22} fontWeight={600}>
              목표 위치
            </text>
            <text x={ax + 34} y={goal + 36} fill={C.dim} fontSize={20}>
              책상 윗면 1 mm 아래
            </text>
          </g>
          <g opacity={prog(t, 7.5)}>
            <line x1={ax - 50} y1={hand} x2={ax - 50} y2={goal} stroke={C.red} strokeWidth={2.5} />
            <line x1={ax - 60} y1={hand} x2={ax - 40} y2={hand} stroke={C.red} strokeWidth={2.5} />
            <line x1={ax - 60} y1={goal} x2={ax - 40} y2={goal} stroke={C.red} strokeWidth={2.5} />
            <text x={ax - 70} y={goal - 22} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600}>
              남은 오차 1 mm
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            {arrow(480, 300, 480, 410, C.orange, 4)}
            <text x={500} y={350} fill={C.orange} fontSize={22} fontWeight={600}>
              누르는 힘
            </text>
            <text x={500} y={380} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              K × 0.001 m
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 600, width: 800, display: 'grid', gap: 10 }}>
          <Line at={0.8} style={line(C.muted, 24)}>
            허공에서는 손끝이 목표까지 가서 오차가 0 이 된다
          </Line>
          <Line at={7.5} style={line(C.text, 24)}>
            목표가 책상 안쪽이면 손끝이 막혀 멈추고 오차가 그대로 남는다
          </Line>
        </div>
      </Panel>
      <Panel x={956} y={130} w={900} h={740}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 14 }}>
          <Line at={0.6} style={line(C.text, 25)}>
            PD 제어: 오차 1 m 에 Kp N 을 낸다 → 손끝에서 보면 목표에 묶인 용수철
          </Line>
          <Line at={7.3}>
            <Head size={27}>
              stiffness = 용수철을 <span style={{ fontFamily: MONO }}>1 m</span> 늘이는 데 드는 힘 (N/m)
            </Head>
          </Line>
          <Line at={14.3} style={{ ...line(C.accent, 26), fontWeight: 600 }}>
            누르는 힘 = stiffness × 남은 오차
          </Line>
          <div style={{ height: 8 }} />
          <Divider at={21.2} />
          <Line at={21.3}>
            <Head size={26}>손끝 stiffness 와 오차 1 mm 에서 누르는 힘</Head>
          </Line>
          <div style={{ display: 'grid', gap: 16 }}>
            <StiffRow k="500 N/m" src="이 강의의 impedance 예" f={0.5} at={21.8} />
            <StiffRow k="3,000 N/m" src="libfranka Cartesian 최댓값" f={3} at={22.6} />
            <StiffRow k="12,000 N/m" src="joint 3000 · 팔 0.5 m" f={12} at={23.4} />
            <StiffRow k="57,000 N/m" src="joint 14,250 · 팔 0.5 m" f={57} at={24.2} />
          </div>
          <Line at={25.6} style={line(C.muted, 22)}>
            같은 1 mm 라도 stiffness 에 비례해서 힘이 커진다
          </Line>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

function JointGain() {
  const t = useSec()
  const px = 110
  const py = 360
  const L = 480
  const a = 0.18
  const tx = px + L * Math.cos(a)
  const ty = py - L * Math.sin(a)
  const r = 200
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={860} h={740}>
        <svg width={860} height={460}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              joint gain 이 손끝 stiffness 가 되는 길
            </text>
            <text x={830} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
          </g>
          <g opacity={prog(t, 0.6)}>
            <line x1={px} y1={py} x2={px + L} y2={py} stroke={C.dim} strokeWidth={6} strokeDasharray="10 8" />
            <line x1={px} y1={py} x2={tx} y2={ty} stroke={C.muted} strokeWidth={10} strokeLinecap="round" />
            <circle cx={px} cy={py} r={18} fill={C.card} stroke={C.text} strokeWidth={3} />
            <circle cx={tx} cy={ty} r={11} fill={C.text} />
            <text x={330} y={402} fill={C.dim} fontSize={22}>
              팔 길이 l
            </text>
            <text x={60} y={420} fill={C.blue} fontSize={22} fontWeight={600}>
              joint torque Kp · Δθ
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <path d={`M ${px + r} ${py} A ${r} ${r} 0 0 0 ${px + r * Math.cos(a)} ${py - r * Math.sin(a)}`} fill="none" stroke={C.blue} strokeWidth={3} />
            <text x={px + r - 6} y={py - r * Math.sin(a) - 22} fill={C.blue} fontSize={24} fontWeight={600}>
              Δθ
            </text>
            <path d={`M ${px + L} ${py} A ${L} ${L} 0 0 0 ${tx} ${ty}`} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="5 5" />
            <text x={px + L + 22} y={322} fill={C.green} fontSize={21} fontWeight={600}>
              손끝 이동
            </text>
            <text x={px + L + 22} y={350} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              l · Δθ
            </text>
            {arrow(tx - 10, 150, tx - 10, ty - 18, C.orange, 4)}
            <text x={tx - 30} y={186} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              손끝 힘 Kp · Δθ ÷ l
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 470, width: 800, display: 'grid', gap: 14 }}>
          <Line at={2.4} style={line(C.muted, 24)}>
            손끝 stiffness = 손끝 힘 ÷ 손끝 이동 = (Kp · Δθ ÷ l) ÷ (l · Δθ)
          </Line>
          <Line at={3.6}>
            <div style={{ padding: '18px 26px', borderRadius: 16, border: `1.5px solid ${C.accent}66`, background: `${C.accent}12`, display: 'inline-block' }}>
              <span style={{ ...mono(C.accent, 40) }}>
                손끝 stiffness = Kp ÷ l<sup style={{ fontSize: '0.6em' }}>2</sup>
              </span>
            </div>
          </Line>
        </div>
      </Panel>
      <Card x={956} y={130} w={900} h={740} at={6.8}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 14 }}>
          <Head size={26}>Franka libfranka 예제 · 팔 길이 0.5 m 로 잡을 때</Head>
          <Line at={7.4} style={line(C.muted, 22)}>
            1 ~ 3 번 joint 의 stiffness 3000 N·m/rad
          </Line>
          <Line at={7.9} style={mono(C.text, 30)}>
            3000 ÷ 0.5² = 12,000 N/m
          </Line>
          <Line at={14.3} style={line(C.muted, 22)}>
            설정할 수 있는 최댓값 14,250 N·m/rad
          </Line>
          <Line at={14.8} style={mono(C.text, 30)}>
            14,250 ÷ 0.5² = 57,000 N/m
          </Line>
          <Line at={17.6} style={line(C.muted, 22)}>
            오차가 5 mm 면
          </Line>
          <Line at={18} style={mono(C.red, 30)}>
            57,000 × 0.005 = 285 N
          </Line>
          <div style={{ height: 6 }} />
          <Divider at={21.2} />
          <Line at={21.3}>
            <Head size={26}>I 항까지 있으면</Head>
          </Line>
          <Line at={21.8} style={line(C.text, 24)}>
            막혀서 남은 오차가 I 항에 계속 쌓여, 힘은 motor torque 한계에 닿아서야 멈춘다
          </Line>
          <Line at={23.6} style={line(C.muted, 22)}>
            Franka FR3 의 1 ~ 4 번 joint 한계 87 N·m 를 0.5 m 팔 끝의 힘으로
          </Line>
          <Line at={24.1} style={mono(C.orange, 30)}>
            87 ÷ 0.5 = 174 N
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseGain = () => (
  <PauseWrite
    question="joint P gain 이 2000 N·m/rad 이고 손끝까지 0.4 m 다. 목표가 책상 2 mm 아래에 있으면 손끝은 몇 N 으로 누를까?"
    answer={
      <>
        손끝 stiffness = Kp ÷ l² = 2000 ÷ 0.4² = 2000 ÷ 0.16 = 12,500 N/m
        <br />
        남은 오차 2 mm → 12,500 × 0.002 = 25 N
      </>
    }
  />
)

// ---------- 2. joint torque ----------

function Jacobian() {
  const t = useSec()
  const sh = { x: 150, y: 600 }
  const el = { x: 450, y: 600 }
  const hd = { x: 450, y: 300 }
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={800} h={740}>
        <svg width={800} height={740}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              두 joint 팔 · 어깨 0°, 팔꿈치 90°
            </text>
            <text x={770} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <line x1={sh.x} y1={sh.y} x2={el.x} y2={el.y} stroke={C.muted} strokeWidth={12} strokeLinecap="round" />
            <line x1={el.x} y1={el.y} x2={hd.x} y2={hd.y} stroke={C.muted} strokeWidth={12} strokeLinecap="round" />
            <circle cx={sh.x} cy={sh.y} r={18} fill={C.card} stroke={C.text} strokeWidth={3} />
            <circle cx={el.x} cy={el.y} r={14} fill={C.card} stroke={C.text} strokeWidth={3} />
            <circle cx={hd.x} cy={hd.y} r={12} fill={C.text} />
          </g>
          <g opacity={prog(t, 7.3)}>
            <text x={sh.x} y={648} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              어깨 0°
            </text>
            <text x={300} y={640} textAnchor="middle" fill={C.dim} fontSize={21}>
              위팔 0.5 m
            </text>
            <text x={476} y={608} fill={C.text} fontSize={22} fontWeight={600}>
              팔꿈치 90°
            </text>
            <text x={476} y={455} fill={C.dim} fontSize={21}>
              아래팔 0.5 m
            </text>
            <text x={476} y={346} fill={C.text} fontSize={22}>
              손끝
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            {arrow(hd.x, 140, hd.x, hd.y - 16, C.orange, 4)}
            <text x={hd.x - 18} y={180} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              아래로 10 N
            </text>
            <text x={70} y={560} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              어깨 −5 N·m
            </text>
          </g>
          <g opacity={prog(t, 17)}>
            {arrow(hd.x + 16, hd.y, 610, hd.y, C.pink, 4)}
            <text x={624} y={hd.y + 8} fill={C.pink} fontSize={22} fontWeight={600}>
              옆으로 10 N
            </text>
          </g>
          <g opacity={prog(t, 21.3)}>
            <line x1={el.x} y1={130} x2={el.x} y2={700} stroke={C.accent} strokeWidth={2} strokeDasharray="7 7" />
            <text x={476} y={670} fill={C.accent} fontSize={22} fontWeight={600}>
              작용선이 팔꿈치를 지난다
            </text>
            <text x={476} y={700} fill={C.accent} fontSize={22}>
              → 팔꿈치 torque 0
            </text>
          </g>
        </svg>
      </Panel>
      <Panel x={896} y={130} w={960} h={740}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 16 }}>
          <Line at={0.5} style={mono(C.accent, 64)}>
            τ = <JT />
          </Line>
          <Line at={1.2} style={line(C.muted, 24)}>
            손끝 힘 F 를 joint torque τ 로 바꿀 때 Jacobian 의 transpose 를 곱한다
          </Line>
          <Line at={7.4} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 6 }}>
            <span style={mono(C.text, 32)}>J =</span>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 110px', rowGap: 6, padding: '6px 14px', borderLeft: `3px solid ${C.muted}`, borderRight: `3px solid ${C.muted}`, borderRadius: 6 }}>
              {['−0.5', '−0.5', '0.5', '0'].map((v, i) => (
                <span key={i} style={{ ...mono(C.text, 32), textAlign: 'right', paddingRight: 14 }}>
                  {v}
                </span>
              ))}
            </div>
            <span style={line(C.dim, 22)}>손끝은 어깨에서 가로 0.5 m, 세로 0.5 m</span>
          </Line>
          <div style={{ height: 6 }} />
          <Table
            head={['손끝 힘 F', '어깨 torque', '팔꿈치 torque']}
            rows={[
              ['아래로 10 N · (0, −10)', '−5 N·m', '0'],
              ['옆으로 10 N · (10, 0)', '−5 N·m', '−5 N·m'],
            ]}
            widths={[400, 230, 250]}
            at={14.3}
            step={2.5}
            size={25}
            colors={[C.orange, C.pink]}
          />
          <Line at={15.4} style={mono(C.muted, 23)}>
            어깨: (−0.5)(0) + (0.5)(−10) = −5
          </Line>
          <Line at={15.9} style={mono(C.muted, 23)}>
            팔꿈치: (−0.5)(0) + (0)(−10) = 0
          </Line>
          <Line at={22.3} style={line(C.text, 24)}>
            어깨는 손끝에서 가로로 0.5 m 떨어져 0.5 × 10 = 5 N·m 가 필요하고, 음수는 시계 방향이다
          </Line>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

function ErrRow({ label, sh, el, at }: { label: ReactNode; sh: number; el: number; at: number }) {
  const t = useSec()
  const bar = (v: number, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 360, height: 22, borderRadius: 6, background: C.grid }}>
        <div style={{ width: `${(100 * v * prog(t, at, 0.9)) / 7}%`, minWidth: 4, height: '100%', borderRadius: 6, background: color }} />
      </div>
      <span style={{ ...mono(color, 24), opacity: prog(t, at + 0.6) }}>{v}°</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: 280, fontSize: 23, lineHeight: 1.3, color: C.text }}>{label}</span>
      <div style={{ display: 'grid', gap: 6 }}>
        {bar(sh, C.blue)}
        {bar(el, C.green)}
      </div>
    </div>
  )
}

function ComputedTorque() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={860} h={740}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 16 }}>
          <Head size={26}>computed-torque control (inverse dynamics control)</Head>
          <Line at={0.6} style={line(C.muted, 24)}>
            운동 방정식 <span style={mono(C.text, 26)}>M(q) × 가속도 + c(q, 속도) = τ</span>
          </Line>
          <Line at={1.4} style={line(C.muted, 24)}>
            M: 팔의 관성 · c: gravity 와 속도에 따른 torque · controller 가 M 과 c 를 안다면
          </Line>
          <div style={{ height: 4 }} />
          <Line at={6.3}>
            <div style={{ padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${C.accent}66`, background: `${C.accent}12` }}>
              <span style={mono(C.accent, 30)}>τ = M × (목표 가속도 + PD 가속도) + c</span>
            </div>
          </Line>
          <Line at={7.6} style={line(C.text, 24)}>
            M 을 곱해 원하는 가속도를 내는 torque 로 바꾸고, c 를 더해 gravity 와 속도에 따른 몫을 미리 상쇄한다
          </Line>
          <Line at={9.5} style={{ ...line(C.accent, 26), fontWeight: 600 }}>
            → joint 마다 질량 1 인 독립된 PD 처럼 움직인다
          </Line>
          <div style={{ height: 4 }} />
          <Divider at={12.2} />
          <Line at={12.3} style={line(C.text, 24)}>
            gain 을 torque 가 아니라 가속도에 곱하므로, 질량 1 의 critical damping 을 바로 쓴다
          </Line>
          <Line at={13.4} style={mono(C.orange, 32)}>
            Kd = 2√Kp = 2√100 = 20
          </Line>
        </div>
      </Panel>
      <Card x={956} y={130} w={900} h={740} at={17.8}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 16 }}>
          <Head size={26}>어깨 1 초 동안 0° → 60° · 팔꿈치는 90° 유지</Head>
          <span style={line(C.muted, 22)}>gravity 를 받는 같은 팔을 직접 simulation 한 최대 오차 (Kp 100, Kd 20)</span>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: C.blue }}>
              <span style={{ width: 22, height: 14, borderRadius: 4, background: C.blue }} />
              어깨
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: C.green }}>
              <span style={{ width: 22, height: 14, borderRadius: 4, background: C.green }} />
              팔꿈치
            </span>
          </div>
          <div style={{ display: 'grid', gap: 22, marginTop: 4 }}>
            <ErrRow label="PD" sh={6.9} el={2.6} at={18.4} />
            <ErrRow label="PD + gravity compensation" sh={1.9} el={0.9} at={20.6} />
            <ErrRow label="computed torque" sh={0} el={0} at={24.3} />
            <ErrRow label="computed torque · model 질량 20% 가벼움" sh={3.2} el={3.8} at={26.2} />
          </div>
          <Line at={27.4} style={line(C.muted, 22)}>
            model 이 틀린 만큼 지우지 못한 gravity 와 관성이 오차로 남는다
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseMass = () => (
  <PauseWrite
    question="팔을 편 자세 (M = [1.25, 0.5; 0.5, 0.25]) 에서 gravity 없이 팔꿈치만 +4 rad/s² 로 돌리고 어깨는 멈춰 두려면 두 joint torque 는?"
    answer={
      <>
        τ = M × (0, 4) → 어깨 1.25 × 0 + 0.5 × 4 = 2 N·m · 팔꿈치 0.5 × 0 + 0.25 × 4 = 1 N·m
        <br />
        어깨도 2 N·m 를 내야 팔꿈치의 움직임에 끌려가지 않는다
      </>
    }
  />
)

// ---------- 3. impedance and the alternatives ----------

function Impedance() {
  const t = useSec()
  const ax = 330
  const top = 400
  const hand = top - 14
  const goal = 600
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={820} h={740}>
        <svg width={820} height={740}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              가상의 용수철 K 와 damper D
            </text>
            <text x={790} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도 · 1 cm 는 과장
            </text>
          </g>
          <g opacity={prog(t, 0.5)}>
            <rect x={60} y={top} width={700} height={250} rx={8} fill={`${C.blue}1c`} stroke={C.blue} strokeWidth={2} />
            <text x={90} y={630} fill={C.blue} fontSize={22}>
              책상
            </text>
            <line x1={ax} y1={90} x2={ax} y2={hand - 12} stroke={C.muted} strokeWidth={14} strokeLinecap="round" />
            <circle cx={ax} cy={hand} r={14} fill={C.text} />
            <text x={ax - 30} y={hand - 24} textAnchor="end" fill={C.text} fontSize={22}>
              손끝
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            <line x1={ax - 34} y1={hand + 16} x2={ax + 34} y2={hand + 16} stroke={C.accent} strokeWidth={3} />
            <line x1={ax - 34} y1={goal - 16} x2={ax + 34} y2={goal - 16} stroke={C.accent} strokeWidth={3} />
            {spring(ax - 34, hand + 16, goal - 16, C.accent, 6, 14)}
            {damper(ax + 34, hand + 16, goal - 16, C.purple)}
            <line x1={ax} y1={goal - 16} x2={ax} y2={goal} stroke={C.accent} strokeWidth={3} />
            <circle cx={ax} cy={goal} r={8} fill={C.accent} />
            <text x={ax - 64} y={500} textAnchor="end" fill={C.accent} fontSize={24} fontWeight={600}>
              K
            </text>
            <text x={ax + 68} y={500} fill={C.purple} fontSize={24} fontWeight={600}>
              D
            </text>
            <text x={ax + 24} y={goal + 16} fill={C.accent} fontSize={21} fontWeight={600}>
              목표
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <text x={ax + 76} y={goal + 16} fill={C.dim} fontSize={20}>
              책상 윗면 1 cm 아래
            </text>
            <text x={ax - 64} y={530} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              500 N/m
            </text>
            {arrow(500, 280, 500, 380, C.orange, 4)}
            <text x={520} y={318} fill={C.orange} fontSize={22} fontWeight={600}>
              윗면에서 멈춰 누름
            </text>
            <text x={520} y={350} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              500 × 0.01 = 5 N
            </text>
          </g>
          <g opacity={prog(t, 16)}>
            <text x={30} y={700} fill={C.red} fontSize={22}>
              position 제어 (12,000 N/m) 는 같은 1 mm 에 12 N 차이
            </text>
          </g>
        </svg>
      </Panel>
      <Panel x={916} y={130} w={940} h={740}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 12 }}>
          <Line at={0.5} style={mono(C.accent, 28)}>
            F = K × 위치 오차 + D × 속도 오차
          </Line>
          <Line at={1.2} style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={mono(C.accent, 28)}>
              τ = <JT /> + g(q)
            </span>
            <span style={line(C.dim, 21)}>g(q): gravity 를 버티는 torque</span>
          </Line>
          <Line at={13.2}>
            <Head size={24}>책상 높이가 틀렸을 때 (K = 500 N/m, 목표 1 cm 아래)</Head>
          </Line>
          <Table
            head={['책상 높이', '용수철이 늘어난 길이', '누르는 힘']}
            rows={[
              ['1 mm 높음', '11 mm', '5.5 N'],
              ['아는 그대로', '10 mm', '5 N'],
              ['1 mm 낮음', '9 mm', '4.5 N'],
            ]}
            widths={[260, 300, 220]}
            at={13.3}
            step={0.5}
            size={24}
          />
          <div style={{ height: 4 }} />
          <Divider at={19.6} />
          <Line at={19.8} style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={mono(C.purple, 30)}>D = 2ζ√(K m)</span>
            <span style={line(C.dim, 21)}>ζ: damping ratio · ζ = 1 이면 넘치지 않고 가장 빨리 선다</span>
          </Line>
          <Line at={21.8} style={line(C.text, 23)}>
            effective mass m: 이 팔을 가로로 밀면 1 kg, 세로로 밀면 2 kg
          </Line>
          <Table
            head={['세로 (2 kg) 의 ζ', 'D (N·s/m)', '1 cm 밀었다 놓으면 넘친 양']}
            rows={[
              ['0.2', '12.6', '52.7%'],
              ['0.71', '44.7', '4.3%'],
              ['1', '63.2', '0%'],
            ]}
            widths={[240, 200, 380]}
            at={23.6}
            step={0.4}
            size={23}
            colors={[undefined, C.orange, undefined]}
          />
          <Line at={26.4} style={mono(C.orange, 23)}>
            Franka 예제 D = 2√K = 2√500 = 44.7
          </Line>
          <Line at={27.4} style={mono(C.orange, 23)}>
            → 세로 ζ = 44.7 ÷ 63.2 = 0.71
          </Line>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

/** how hard the hand presses on a ±1 mm table: a range bar on a 0 ~ 25 N axis */
function RangeRow({ name, sub, lo, hi, color, at, val }: { name: string; sub: string; lo: number; hi: number; color: string; at: number; val: string }) {
  const t = useSec()
  const W = 320
  const x = (v: number) => (v / 25) * W
  const p = prog(t, at, 0.8)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at - 0.2, 0.3) }}>
      <div style={{ width: 260, display: 'grid', gap: 2 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color }}>{name}</span>
        <span style={{ fontSize: 20, color: C.dim, whiteSpace: 'nowrap' }}>{sub}</span>
      </div>
      <div style={{ position: 'relative', width: W, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ position: 'absolute', left: x(10) - 1, top: -6, width: 2, height: 42, background: C.dim }} />
        <div style={{ position: 'absolute', left: x(lo) - (hi === lo ? 6 : 0), top: 3, width: Math.max(12, x(hi) - x(lo)) * p, height: 24, borderRadius: 6, background: color }} />
      </div>
      <span style={{ ...mono(color, 23), opacity: prog(t, at + 0.6) }}>{val}</span>
    </div>
  )
}

function Compare() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={880} h={740}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 14 }}>
          <Head size={26}>admittance control · 잰 힘으로 움직일 위치를 정한다</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', rowGap: 12 }}>
            {['손목 F/T sensor 로 잰 힘', '가상 질량 · damping · stiffness', '위치 명령', 'position controller'].map((s, i, all) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 0.6 + i * 0.5) }}>
                <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${C.green}88`, background: `${C.green}12`, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</div>
                {i < all.length - 1 && <span style={{ fontSize: 28, color: C.muted }}>→</span>}
              </div>
            ))}
          </div>
          <Line at={3} style={line(C.dim, 21)}>
            torque 를 직접 줄 수 없고 position · velocity 명령만 받는 팔에 쓴다
          </Line>
          <div style={{ height: 2 }} />
          <Line at={6.8} style={line(C.text, 23)}>
            hand guiding: stiffness 0, damping 50 N·s/m, 질량 2 kg
          </Line>
          <Line at={8.6} style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={mono(C.green, 30)}>5 N ÷ 50 = 0.1 m/s</span>
            <span style={line(C.dim, 21)}>63% 에 닿는 시간 2 ÷ 50 = 0.04 초</span>
          </Line>
          <div style={{ height: 2 }} />
          <Divider at={13.2} />
          <Line at={13.3}>
            <Head size={24}>
              단단한 벽 · 벽 stiffness 10<sup style={{ fontSize: '0.6em' }}>5</sup> N/m · 제어 주기 0.002 초
            </Head>
          </Line>
          <Table
            head={['damping (N·s/m)', '주기 × 벽 ÷ damping', '한 주기 뒤', '결과']}
            rows={[
              ['50', '4', '−3x', <span style={{ fontFamily: SANS }}>발산</span>],
              ['200', '1', '0', <span style={{ fontFamily: SANS }}>벽 표면에 선다</span>],
              ['400', '0.5', '0.5x', <span style={{ fontFamily: SANS }}>매끄럽게 줄어듦</span>],
            ]}
            widths={[200, 230, 150, 210]}
            at={14}
            step={0.6}
            size={22}
            colors={[C.red, undefined, C.green]}
          />
          <Line at={16.4} style={line(C.muted, 22)}>
            2 를 넘으면 발산한다 → 단단한 환경일수록 큰 damping 이나 짧은 주기가 필요하다
          </Line>
        </div>
      </Panel>
      <Card x={976} y={130} w={880} h={740} at={19.3}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 14 }}>
          <Head size={26}>hybrid force/position control</Head>
          <svg width={820} height={170}>
            <line x1={20} y1={140} x2={800} y2={140} stroke={C.blue} strokeWidth={3} />
            <text x={790} y={166} textAnchor="end" fill={C.blue} fontSize={20}>
              책상
            </text>
            <circle cx={120} cy={124} r={14} fill={C.text} />
            {arrow(140, 124, 260, 124, C.accent, 4)}
            <text x={280} y={132} fill={C.accent} fontSize={22} fontWeight={600}>
              x · y → position 축 (경로를 따라)
            </text>
            {arrow(120, 20, 120, 104, C.orange, 4)}
            <text x={144} y={52} fill={C.orange} fontSize={22} fontWeight={600}>
              z → force 축 (잰 힘과의 차이로 PI 제어)
            </text>
          </svg>
          <span style={line(C.dim, 21)}>축마다 0 과 1 로 고르는 대각 행렬 S: compliance selection matrix</span>
          <div style={{ height: 4 }} />
          <Divider at={22.4} />
          <Line at={22.5}>
            <Head size={24}>±1 mm 로 오르내리는 책상을 10 N 으로 닦을 때</Head>
          </Line>
          <div style={{ display: 'grid', gap: 16 }}>
            <RangeRow name="position 제어" sub="K = 12,000 N/m" lo={0} hi={22} color={C.red} at={26.6} val="0 ~ 22 N" />
            <RangeRow name="impedance" sub="K = 500 N/m · 2 cm 아래" lo={9.5} hi={10.5} color={C.green} at={27.4} val="9.5 ~ 10.5 N" />
            <RangeRow name="hybrid" sub="z 축 force 제어" lo={10} hi={10} color={C.accent} at={23} val="10 N" />
          </div>
          <Line at={28.4} style={line(C.dim, 21)}>
            position 제어는 목표를 10 ÷ 12000 ≈ 0.83 mm 아래에 두고, 책상이 낮은 곳에서는 떨어진다
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseDamping = () => (
  <PauseWrite
    question="effective mass 가 4 kg 인 방향에 K = 400 N/m 를 걸었다. critical damping 이 되는 D 는? 이 방향에 D = 2√K 를 쓰면 ζ 는?"
    answer={
      <>
        D = 2 × 1 × √(400 × 4) = 2 × 40 = 80 N·s/m
        <br />
        D = 2√400 = 40 을 쓰면 ζ = 40 ÷ 80 = 0.5
      </>
    }
  />
)

// ---------- 4. collisions and learning ----------

/** a made-up residual trace (the lesson's figure is also made up to show the idea): noise, +4.9 N·m at 1.5 s, a hit at 3 s */
function residualAt(s: number): number {
  const noise = 0.45 * Math.sin(s * 23) + 0.3 * Math.sin(s * 41 + 1) + 0.15 * Math.sin(s * 67 + 2)
  const load = s >= 1.5 ? 4.9 : 0
  const hit = s >= 3 ? Math.min(16, (s - 3) * 160) - 4.9 * Math.min(1, (s - 3) * 30) : 0
  return noise + load + hit
}

function Residual() {
  const t = useSec()
  const X = (s: number) => 90 + s * 200
  const Y = (v: number) => 580 - v * 20
  const shown = 0.02 + 3.1 * prog(t, 7.3, 2.6)
  const pts: string[] = []
  for (let s = 0; s <= Math.min(shown, 3.1); s += 0.01) pts.push(`${X(s)},${Y(residualAt(s))}`)
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={960} h={740}>
        <svg width={960} height={640}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              어깨 joint 의 residual
            </text>
            <text x={930} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
              원리를 보이려고 만든 예
            </text>
            {arrow(X(0), Y(0), X(4.1), Y(0), C.muted, 2, 10)}
            {arrow(X(0), Y(0), X(0), Y(20.5), C.muted, 2, 10)}
            {[0, 1, 2, 3].map((s) => (
              <text key={s} x={X(s)} y={Y(0) + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {s}
              </text>
            ))}
            <text x={X(4)} y={Y(0) + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              4 초
            </text>
            {[0, 10, 20].map((v) => (
              <text key={v} x={X(0) - 14} y={Y(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <text x={X(0) + 16} y={Y(20) + 6} fill={C.dim} fontSize={20}>
              N·m
            </text>
          </g>
          <polyline points={pts.join(' ')} fill="none" stroke={C.blue} strokeWidth={3} strokeLinejoin="round" opacity={prog(t, 0.6)} />
          <g opacity={prog(t, 9.8)}>
            <text x={X(4)} y={Y(18.5)} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600}>
              3 초: 사람과 부딪힘
            </text>
            <text x={X(4)} y={Y(18.5) + 30} textAnchor="end" fill={C.red} fontSize={22}>
              문턱을 넘어 팔을 세움
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            <line x1={X(0)} y1={Y(10)} x2={X(4)} y2={Y(10)} stroke={C.red} strokeWidth={2} strokeDasharray="9 7" />
            <text x={X(0) + 16} y={Y(10) - 12} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              문턱 10 N·m
            </text>
          </g>
          <g opacity={prog(t, 21.3)}>
            <text x={X(1.62)} y={Y(4.9) - 72} fill={C.green} fontSize={22} fontWeight={600}>
              1.5 초: 1 kg 을 집음
            </text>
            <text x={X(1.62)} y={Y(4.9) - 42} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              +4.9 N·m
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 650, width: 900 }}>
          <Line at={7.4} style={line(C.text, 24)}>
            허공에서는 0 근처 · 무언가에 닿으면 그 힘이 <JT /> 만큼 joint torque 에 더해진다
          </Line>
        </div>
      </Panel>
      <Panel x={1056} y={130} w={800} h={740}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 10 }}>
          <Line at={0.5}>
            <Head size={25}>residual = 잰 torque − model 이 예측한 torque</Head>
          </Line>
          <Line at={1.6} style={line(C.muted, 22)}>
            Franka 의 <span style={mono(C.text, 21)}>tau_ext_hat_filtered</span> 가 이 값에 low-pass filter 를 거친 것
          </Line>
          <div style={{ height: 4 }} />
          <Divider at={14.2} />
          <Line at={14.3}>
            <Head size={24}>setCollisionBehavior · joint 마다 문턱 두 개</Head>
          </Line>
          <Line at={14.8} style={line(C.text, 22)}>
            낮은 문턱: 접촉으로 표시만 하고 계속 움직인다
          </Line>
          <Line at={15.3} style={line(C.text, 22)}>
            높은 문턱: 충돌로 보고 팔을 세운다
          </Line>
          <Line at={16.4} style={line(C.muted, 22)}>
            libfranka 예제 setDefaultBehavior 의 문턱
          </Line>
          <Line at={16.9} style={mono(C.orange, 26)}>
            등속 10 N·m · 가속 · 감속 20 N·m
          </Line>
          <div style={{ height: 4 }} />
          <Divider at={21.2} />
          <Line at={21.3}>
            <Head size={24}>model 에 없는 짐 · 어깨에서 0.5 m 앞</Head>
          </Line>
          <Line at={21.8} style={mono(C.green, 26)}>
            1 × 9.81 × 0.5 = 4.9 N·m
          </Line>
          <Line at={22.2} style={line(C.dim, 21)}>
            문턱 10 N·m 의 절반
          </Line>
          <Line at={24} style={mono(C.red, 26)}>
            2.5 × 9.81 × 0.5 ≈ 12.3 N·m
          </Line>
          <Line at={24.4} style={line(C.dim, 21)}>
            10 을 넘어 부딪히지 않았는데도 멈춘다 → gripper 와 짐의 질량을 model 에 넣는다
          </Line>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

function Layer({ x, y, w, h, title, sub, out, color, at }: { x: number; y: number; w: number; h: number; title: string; sub: string; out?: string; color: string; at: number }) {
  const t = useSec()
  return (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + 24} y={y + 44} fill={color} fontSize={24} fontWeight={600}>
        {title}
      </text>
      <text x={x + 24} y={y + 80} fill={C.text} fontSize={22} fontFamily={MONO}>
        {sub}
      </text>
      {out && (
        <text x={x + 24} y={y + 114} fill={C.muted} fontSize={21}>
          {out}
        </text>
      )}
    </g>
  )
}

function Policy() {
  const t = useSec()
  const tl = { x: 470, w: 380 }
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={900} h={740}>
        <svg width={900} height={640}>
          <g opacity={prog(t, 0.3)}>
            <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
              policy 와 impedance controller 의 두 주기
            </text>
          </g>
          <Layer x={40} y={80} w={370} h={136} title="학습한 policy" sub="1초에 10 번 (SERL)" out="→ 목표 자세 (+ K, D)" color={C.purple} at={6.3} />
          <Layer x={40} y={290} w={370} h={136} title="impedance controller" sub="1초에 1000 번" out="→ joint torque" color={C.accent} at={6.8} />
          <Layer x={40} y={500} w={370} h={100} title="팔과 환경" sub="" color={C.blue} at={7.3} />
          <g opacity={prog(t, 6.8)}>{arrow(225, 220, 225, 286, C.purple, 3)}</g>
          <g opacity={prog(t, 7.3)}>{arrow(225, 430, 225, 496, C.accent, 3)}</g>
          <g opacity={prog(t, 8.6)}>
            <text x={tl.x} y={110} fill={C.text} fontSize={22} fontWeight={600}>
              목표 하나 (100 ms) 동안
            </text>
            <line x1={tl.x} y1={200} x2={tl.x + tl.w} y2={200} stroke={C.muted} strokeWidth={2} />
            {[0, 1].map((k) => (
              <line key={k} x1={tl.x + k * tl.w} y1={150} x2={tl.x + k * tl.w} y2={200} stroke={C.purple} strokeWidth={4} />
            ))}
            <text x={tl.x} y={140} fill={C.purple} fontSize={20} fontFamily={MONO}>
              0 ms
            </text>
            <text x={tl.x + tl.w} y={140} textAnchor="end" fill={C.purple} fontSize={20} fontFamily={MONO}>
              100 ms
            </text>
            {Array.from({ length: 100 }, (_, k) => (
              <line key={k} x1={tl.x + (k + 0.5) * (tl.w / 100)} y1={212} x2={tl.x + (k + 0.5) * (tl.w / 100)} y2={236} stroke={C.accent} strokeWidth={1.5} opacity={prog(t, 9 + k * 0.02, 0.2)} />
            ))}
            <text x={tl.x} y={274} fill={C.accent} fontSize={22} fontWeight={600}>
              1 ms 마다 torque 계산
            </text>
            <text x={tl.x} y={306} fill={C.accent} fontSize={22} fontWeight={600}>
              모두 100 번
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 640, width: 840 }}>
          <Line at={1} style={line(C.text, 23)}>
            variable impedance: policy 가 목표와 함께 stiffness K 와 damping D 도 낸다
          </Line>
        </div>
      </Panel>
      <Panel x={996} y={130} w={860} h={740}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 12 }}>
          <Line at={0.5}>
            <Head size={25}>variable impedance · 작업 도중에 K 와 D 를 바꾼다</Head>
          </Line>
          <Line at={1.4} style={line(C.text, 22)}>
            핀을 구멍 위로 옮길 때: stiffness 를 크게 → 빠르고 정확하게
          </Line>
          <Line at={2.4} style={line(C.text, 22)}>
            꽂는 순간: 옆 방향을 무르게 → 끼이지 않게
          </Line>
          <div style={{ height: 4 }} />
          <Divider at={12.2} />
          <Line at={12.3}>
            <Head size={24}>SERL (2024) · 목표와 손끝의 거리를 Δ 이하로 자른다</Head>
          </Line>
          <Line at={13.4} style={mono(C.orange, 26)}>
            K 500 N/m × Δ 1 cm = 5 N 이하
          </Line>
          <Line at={18.3} style={line(C.text, 22)}>
            PCB 부품 꽂기: 너무 단단하면 가는 핀이 휘고, 너무 무르면 제자리까지 빨리 못 옮긴다
          </Line>
          <Line at={19.6} style={mono(C.green, 26)}>
            시연 20 개 + 학습 20 분 → 성공률 100%
          </Line>
          <div style={{ height: 4 }} />
          <Divider at={24.2} />
          <Line at={24.3}>
            <Head size={24}>VICES (2019) · policy 가 stiffness 와 damping 도 낸다</Head>
          </Line>
          <Line at={25} style={line(C.text, 22)}>
            policy 는 1초에 20 번, controller 는 1초에 500 번 계산
          </Line>
          <Line at={26.2} style={line(C.green, 22)}>
            경로 따라가기 · 문 열기 · 표면 닦기 가운데, 계속 닿아 있어야 하는 표면 닦기에서 다른 action space 보다 높은 reward
          </Line>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

const PauseResidual = () => (
  <PauseWrite
    question="충돌 문턱이 10 N·m 인 joint 에서 손끝까지의 수평 거리가 0.4 m 다. model 에 넣지 않은 짐이 몇 kg 을 넘으면 가만히 들고만 있어도 충돌로 판단될까?"
    answer={
      <>
        짐의 torque = 질량 × 9.81 × 0.4 = 3.924 × 질량 N·m
        <br />
        3.924 × 질량 &gt; 10 → 질량 &gt; 10 ÷ 3.924 ≈ 2.55 kg
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items: { tag: string; color: string; text: ReactNode; at: number }[] = [
    { tag: '접촉과 position 제어', color: C.accent, text: '누르는 힘 = 손끝 stiffness × 남은 오차 · 3000 ÷ 0.5² = 12,000 N/m 면 1 mm 에 12 N', at: 1 },
    {
      tag: 'joint torque 계산',
      color: C.blue,
      text: (
        <>
          τ = <JT /> 로 손끝 힘을 torque 로 · computed torque 는 model 질량이 20% 틀리면 3.8° 까지 벗어난다
        </>
      ),
      at: 4.4,
    },
    { tag: 'impedance 와 비교', color: C.green, text: 'K 500 N/m · 1 cm → 5 N, 높이 ±1 mm 에도 4.5 ~ 5.5 N · hybrid 는 z 축에서 10 N 유지', at: 8.4 },
    { tag: '충돌 감지와 학습', color: C.orange, text: 'residual 문턱 10 ~ 20 N·m · policy 1초에 10 번 → impedance controller 1초에 1000 번', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            책상 높이를 정확히 모르는 채로 일정한 힘으로 닦으려면 motor 에 무엇을 명령할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 25, color: it.color }}>{it.tag}</span>
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>ros2_control</div>
        </Appear>
        <Appear at={1}>
          <div style={{ maxWidth: 1600, textAlign: 'center' }}>
            <Label color={C.muted} size={32}>
              controller 가 command interface · state interface 를 hardware 에서 받아 쓰는 구조와, controller_manager 가 실시간 loop 안에서 controller 를 부르는 방식
            </Label>
          </div>
        </Appear>
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/impedance-control (Hogan · Raibert & Craig · Khatib · SERL · VICES 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function ImpedanceControl() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        contact: Contact,
        'joint-gain': JointGain,
        'pause-gain': PauseGain,
        jacobian: Jacobian,
        'computed-torque': ComputedTorque,
        'pause-mass': PauseMass,
        impedance: Impedance,
        compare: Compare,
        'pause-damping': PauseDamping,
        residual: Residual,
        policy: Policy,
        'pause-residual': PauseResidual,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
