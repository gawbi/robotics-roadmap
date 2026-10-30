import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './ros2-basics.narration.json'
import { script } from './ros2-basics.script'

// Numbers follow lessons/ros2-basics/README.md (see ros2-basics.script.ts). The graphs, timelines and frame drawings redraw
// the lesson's figures; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, unit = '', labelW = 230 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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

const line = (color = C.text, size = 22): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })
/** a dark outline behind SVG text, so faint grid lines never cut through a label */
const halo = { stroke: C.card, strokeWidth: 6, paintOrder: 'stroke' } as const

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11, opacity = 1, dash?: string) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a text table; `monoCols` marks the columns set in MONO */
function Table({ head, rows, widths, monoCols = [], at, step = 0.6, size = 22, colors, times }: { head?: string[]; rows: ReactNode[][]; widths: number[]; monoCols?: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; times?: number[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: monoCols.includes(i) ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', lineHeight: 1.45 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {head && (
        <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 4 }}>
          {head.map((h, i) => (
            <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
              {h}
            </span>
          ))}
        </div>
      )}
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, times?.[k] ?? at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            ROS 2 · MIDDLEWARE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ROS 2 Basics</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            node · topic · <span style={{ color: C.accent }}>service · action</span> · QoS · tf2
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            따로 실행되는 로봇 프로그램들을 정해진 이름과 형식으로 잇는 middleware
          </Label>
        </Appear>
        <Appear at={2}>
          <Label color={C.dim} size={22}>
            Ghost Robotics 는 자사 소프트웨어의 약 90% 를 ROS 2 로 통신 · Nav2 · MoveIt · ros2_control 도 ROS 2 위에서 동작 · ROS 2 Jazzy 기준
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 20, maxWidth: 1700 }}>
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

/** ticks of three programs over the same 100 ms (lesson figure ros2-rates) */
function Rates({ t, at }: { t: number; at: number }) {
  const x = (ms: number) => 300 + ms * 5.2
  const rows: { name: string; y: number; ticks: number[]; color: string; count: string }[] = [
    { name: 'camera driver · 30 Hz', y: 120, ticks: [0, 33.3, 66.7], color: C.blue, count: '3 번' },
    { name: 'policy · 20 Hz 일 때', y: 200, ticks: [0, 50], color: C.orange, count: '2 번' },
    { name: 'motor · 1000 Hz', y: 280, ticks: Array.from({ length: 100 }, (_, i) => i), color: C.green, count: '100 번' },
  ]
  return (
    <svg width={868} height={400}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        같은 100 ms 동안 계산하는 횟수
      </text>
      {rows.map((r, k) => (
        <g key={r.name} opacity={prog(t, at + 0.4 + k * 0.5)}>
          <text x={30} y={r.y + 8} fill={r.color} fontSize={22} fontWeight={600}>
            {r.name}
          </text>
          {r.ticks.map((ms) => (
            <line key={ms} x1={x(ms)} x2={x(ms)} y1={r.y - 18} y2={r.y + 18} stroke={r.color} strokeWidth={r.ticks.length > 10 ? 2 : 5} strokeLinecap="round" />
          ))}
          <text x={820} y={r.y + 44} textAnchor="end" fill={r.color} fontSize={20} fontFamily={MONO} fontWeight={600}>
            {r.count}
          </text>
        </g>
      ))}
      <g opacity={prog(t, at + 0.4)}>
        <line x1={300} x2={820} y1={344} y2={344} stroke={C.dim} strokeWidth={2} />
        <text x={300} y={374} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
        <text x={820} y={374} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          100 ms
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={400}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <Head>
            <span style={{ opacity: prog(t, 0.4) }}>로봇 팔 하나에서 동시에 실행되는 프로그램</span>
          </Head>
          <Table
            at={0.6}
            step={0.4}
            head={['프로그램', '1초에 계산하는 횟수', '한 번의 간격', '내보내는 데이터']}
            widths={[230, 210, 170, 180]}
            monoCols={[1, 2]}
            rows={[
              ['camera driver', '30 Hz', '33 ms', '사진'],
              ['학습한 policy', '10 ~ 50 Hz', '20 ~ 100 ms', '자세나 속도 목표'],
              ['motor controller', '500 ~ 1000 Hz', '1 ~ 2 ms', 'motor 명령'],
            ]}
            colors={[C.blue, C.orange, C.green]}
          />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.2) }}>Hz 는 1초에 계산하는 횟수 · 한 번의 간격은 1 ÷ Hz · 30 Hz 면 1 ÷ 30 ≈ 0.033 초라서 33 ms</span>
        </div>
      </Panel>
      <Card x={988} y={140} w={868} h={400} at={1}>
        <Rates t={t} at={1.2} />
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 562, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          주기가 다른 프로그램들이 데이터를 주고받으면서,
          <br />
          <span style={{ color: C.accent }}>하나가 꺼져도 나머지는 멈추지 않으려면 무엇이 필요할까?</span>
        </div>
      </Appear>
      <Card x={210} y={716} w={1500} h={164} at={5.8}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 10, opacity: prog(t, 6) }}>
          <span style={line(C.text, 24)}>ROS 2 (Robot Operating System 2): 이름과 달리 운영체제가 아니라, 프로그램끼리 정해진 이름과 형식으로 데이터를 주고받게 하는 middleware 와 도구 묶음</span>
          <span style={line(C.muted, 22)}>middleware: 운영체제와 응용 프로그램 사이에서 프로그램끼리의 통신을 맡는 소프트웨어</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- node 와 topic ----------

/** one program on one thread: a 40 ms policy step stalls the 1 ms motor updates */
function OneProgram({ t }: { t: number }) {
  const x = (ms: number) => 60 + ms * 14.8
  const skip = prog(t, 6.6)
  return (
    <svg width={880} height={360}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        프로그램 하나로 짜면 · 모든 계산이 차례를 기다린다
      </text>
      <g opacity={prog(t, 0.6)}>
        <text x={60} y={92} fill={C.muted} fontSize={22}>
          motor 계산 · 1 ms 마다
        </text>
        {Array.from({ length: 50 }, (_, i) => i + 1).map((ms) => {
          const missed = ms <= 40
          const color = missed ? (skip > 0.5 ? C.red : C.muted) : C.green
          return <line key={ms} x1={x(ms)} x2={x(ms)} y1={108} y2={138} stroke={color} strokeWidth={3} opacity={missed ? 1 - 0.5 * skip : 1} />
        })}
      </g>
      <g opacity={prog(t, 7)}>
        <line x1={x(1)} x2={x(40)} y1={152} y2={152} stroke={C.red} strokeWidth={2} />
        <line x1={x(1)} x2={x(1)} y1={146} y2={158} stroke={C.red} strokeWidth={2} />
        <line x1={x(40)} x2={x(40)} y1={146} y2={158} stroke={C.red} strokeWidth={2} />
        <text x={x(20.5)} y={182} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
          motor 계산 40 번 건너뜀
        </text>
      </g>
      <g opacity={prog(t, 1.2)}>
        <rect x={x(0)} y={210} width={x(40) - x(0)} height={52} rx={8} fill={`${C.orange}2a`} stroke={C.orange} strokeWidth={2} />
        <text x={(x(0) + x(40)) / 2} y={244} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
          policy 계산 · 사진 한 장 · 40 ms
        </text>
      </g>
      <g opacity={prog(t, 0.6)}>
        <line x1={x(0)} x2={x(50)} y1={300} y2={300} stroke={C.dim} strokeWidth={2} />
        {[0, 10, 20, 30, 40].map((ms) => (
          <text key={ms} x={x(ms)} y={330} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {ms}
          </text>
        ))}
        <text x={x(50)} y={330} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          50 ms
        </text>
      </g>
    </svg>
  )
}

/** three nodes in three processes; the policy process crashes and the motor one keeps going */
function ThreeNodes({ t }: { t: number }) {
  const x = (ms: number) => 320 + ms * 5.2
  const crash = prog(t, 18.8)
  const rows = [
    { name: 'camera_driver', y: 64, ticks: [0, 33.3, 66.7], color: C.blue },
    { name: 'policy', y: 150, ticks: [0, 50], color: C.orange },
    { name: 'motor_controller', y: 236, ticks: Array.from({ length: 100 }, (_, i) => i), color: C.green },
  ]
  return (
    <svg width={880} height={356}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 12.7)}>
        node 로 나누면 · process 마다 따로 실행
      </text>
      {rows.map((r, k) => {
        const dead = r.name === 'policy' ? crash : 0
        return (
          <g key={r.name} opacity={prog(t, 13 + k * 0.4)}>
            <rect x={30} y={r.y} width={260} height={56} rx={14} fill={`${r.color}14`} stroke={dead > 0.5 ? C.red : r.color} strokeWidth={2} />
            <text x={160} y={r.y + 36} textAnchor="middle" fill={dead > 0.5 ? C.red : r.color} fontSize={21} fontFamily={MONO} fontWeight={600}>
              {r.name}
            </text>
            <g opacity={1 - dead}>
              {r.ticks.map((ms) => (
                <line key={ms} x1={x(ms)} x2={x(ms)} y1={r.y + 10} y2={r.y + 46} stroke={r.color} strokeWidth={r.ticks.length > 10 ? 2 : 5} strokeLinecap="round" />
              ))}
            </g>
          </g>
        )
      })}
      <text x={340} y={186} fill={C.red} fontSize={22} fontWeight={600} opacity={crash}>
        ✕ 오류로 강제 종료
      </text>
      <text x={320} y={324} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 19.6)}>
        그대로 남아 마지막 목표 자세 유지
      </text>
    </svg>
  )
}

/** ROS 1's central roscore against ROS 2's peer-to-peer discovery */
function Ros1Ros2({ t, at }: { t: number; at: number }) {
  const star = [
    [80, 30],
    [320, 30],
    [80, 130],
    [320, 130],
  ]
  const mesh = [
    [530, 30],
    [770, 30],
    [530, 130],
    [770, 130],
  ]
  const down = prog(t, at + 1.4)
  return (
    <svg width={832} height={222}>
      <g opacity={prog(t, at)}>
        {star.map(([x, y]) => (
          <line key={`${x}${y}`} x1={x} y1={y} x2={200} y2={80} stroke={C.muted} strokeWidth={2} />
        ))}
        <rect x={135} y={58} width={130} height={44} rx={10} fill={C.card} stroke={down > 0.5 ? C.red : C.muted} strokeWidth={2.5} />
        <text x={200} y={87} textAnchor="middle" fill={down > 0.5 ? C.red : C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
          roscore
        </text>
        {star.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={16} fill={C.card} stroke={C.blue} strokeWidth={2.5} />
        ))}
        <text x={200} y={184} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
          ROS 1 · roscore 가 멈추면 전체가 영향
        </text>
        <text x={200} y={214} textAnchor="middle" fill={C.red} fontSize={20} fontFamily={MONO}>
          single point of failure
        </text>
      </g>
      <g opacity={prog(t, at + 0.8)}>
        {mesh.flatMap(([x1, y1], i) => mesh.slice(i + 1).map(([x2, y2]) => <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.green} strokeWidth={2} opacity={0.7} />))}
        {mesh.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={16} fill={C.card} stroke={C.blue} strokeWidth={2.5} />
        ))}
        <text x={650} y={184} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
          ROS 2 · 중앙 서버 없이 서로를 찾음
        </text>
        <text x={650} y={214} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO}>
          peer-to-peer
        </text>
      </g>
    </svg>
  )
}

function Split() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={360} at={0.3}>
        <OneProgram t={t} />
      </Card>
      <Card x={64} y={524} w={880} h={356} at={12.5}>
        <ThreeNodes t={t} />
      </Card>
      <Box x={968} y={140} w={888} h={400} at={12.5} title={<Head color={C.accent}>node 와 process</Head>} gap={12}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 12.8) }}>node: 한 가지 일을 맡는 계산 단위 · 공식 문서는 node 하나가 논리적으로 한 가지 일만 하도록 권한다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 14.5) }}>node 는 보통 process 하나에서 실행된다 · 여러 node 를 한 process 에 넣을 수도 있다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 18.8) }}>운영체제는 process 마다 독립된 메모리 공간을 줘서, 하나가 강제 종료돼도 나머지는 그대로 남는다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>대신 메모리를 나눠 쓰지 않아서, 누가 무엇을 어떤 형식으로 보낼지 정한 약속이 필요하고 그 전달을 middleware 가 맡는다</span>
      </Box>
      <Box x={968} y={564} w={888} h={316} at={24.5} title={<Head color={C.orange}>ROS 1 → ROS 2 (Macenski 등, 2022)</Head>} gap={10}>
        <Ros1Ros2 t={t} at={24.7} />
      </Box>
    </AbsoluteFill>
  )
}

/** the small mobile robot's node graph (lesson figure ros2-graph): ellipses are nodes, boxes are topics */
function Graph({ t }: { t: number }) {
  const node = (cx: number, cy: number, rx: number, name: string, at: number, color = C.blue) => (
    <g opacity={prog(t, at)}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={cy > 200 ? 28 : 36} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={cx} y={cy + 8} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
        {name}
      </text>
    </g>
  )
  const topic = (x: number, y: number, w: number, h: number, name: string, sub: string | null, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={C.bg} stroke={C.orange} strokeWidth={2} />
      <text x={x + w / 2} y={sub ? y + 32 : y + h / 2 + 8} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
        {name}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 62} textAnchor="middle" fill={C.muted} fontSize={20}>
          {sub}
        </text>
      )}
    </g>
  )
  return (
    <svg width={1792} height={270}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        카메라로 길을 보고 바퀴로 움직이는 작은 이동 로봇
      </text>
      <text x={1762} y={40} textAnchor="end" fill={C.muted} fontSize={20} opacity={prog(t, 0.3)}>
        타원 = node · 네모 = topic · 화살표 = publish → subscribe
      </text>
      {node(170, 118, 125, 'camera_driver', 0.5)}
      <g opacity={prog(t, 0.8)}>{arrow(295, 118, 353, 118, C.muted)}</g>
      {topic(355, 80, 310, 76, '/camera/image_raw', 'Image · 30 Hz', 0.9)}
      <g opacity={prog(t, 1.4)}>{arrow(665, 118, 723, 118, C.muted)}</g>
      {node(805, 118, 80, 'policy', 1.5)}
      <g opacity={prog(t, 2)}>{arrow(885, 118, 943, 118, C.muted)}</g>
      {topic(945, 80, 210, 76, '/cmd_vel', 'Twist · 20 Hz', 2.1)}
      <g opacity={prog(t, 2.6)}>{arrow(1155, 118, 1213, 118, C.muted)}</g>
      {node(1385, 118, 170, 'base_controller', 2.7)}
      <g opacity={prog(t, 3.2)}>{arrow(1385, 154, 1385, 196, C.muted)}</g>
      {topic(1200, 198, 370, 56, '/joint_states · 50 Hz', null, 3.3)}
      <g opacity={prog(t, 4)}>{arrow(510, 156, 510, 196, C.muted)}</g>
      {node(510, 226, 90, 'ros2 bag', 4.1, C.purple)}
      <text x={620} y={233} fill={C.muted} fontSize={20} opacity={prog(t, 4.5)}>
        subscriber 하나 더 · policy 가 받는 사진에는 영향 없음
      </text>
    </svg>
  )
}

function Bandwidth() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={270} at={0.3}>
        <Graph t={t} />
      </Card>
      <Box x={64} y={430} w={1000} h={450} at={6.5} title={<Head color={C.accent}>bandwidth = message 하나의 크기 × 1초에 보내는 개수</Head>}>
        <Table
          at={6.6}
          head={['단계', '계산', '결과']}
          widths={[170, 330, 420]}
          monoCols={[1, 2]}
          size={23}
          times={[6.9, 8.6, 13.3, 15.6]}
          rows={[
            ['픽셀 수', '640 × 480', '307,200'],
            ['사진 한 장', '307,200 × 3 byte', '921,600 byte ≈ 0.92 MB'],
            ['1초 · 30 Hz', '921,600 × 30', '27,648,000 byte ≈ 27.6 MB/s'],
            ['bit 로', '27,648,000 × 8', '약 221 Mbit/s'],
          ]}
          colors={[C.text, C.text, C.text, C.accent]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.4) }}>rgb8: 픽셀마다 빨강 · 초록 · 파랑을 byte 하나씩, 3 byte · 한 줄은 640 × 3 = 1920 byte</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.4) }}>1 byte = 8 bit · 네트워크 속도는 bit 단위로 적는다</span>
      </Box>
      <Box x={1088} y={430} w={768} h={270} at={19.5} title={<Head color={C.orange}>같은 로봇의 다른 topic · 1초에 흐르는 양</Head>} gap={12}>
        <Table
          at={19.7}
          step={0.7}
          widths={[290, 380]}
          monoCols={[0, 1]}
          rows={[
            ['/camera/image_raw', '27,648,000 byte'],
            ['/cmd_vel', '48 × 20 Hz = 960 byte'],
            ['/joint_states', '48 × 50 Hz = 2,400 byte'],
          ]}
          colors={[C.accent, C.text, C.text]}
        />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 22.5) }}>
          <span style={mono(C.text, 22)}>960 + 2,400 = 3,360 byte</span> → 카메라는 약 8,000 배
        </span>
      </Box>
      <Box x={1088} y={720} w={768} h={160} at={26} title={<Head color={C.red} size={24}>무선 54 Mbit/s 라면 (논문의 느린 무선 실험)</Head>} gap={8}>
        <span style={{ ...mono(C.red, 22), opacity: prog(t, 26.4) }}>54,000,000 ÷ (921,600 × 8) ≈ 7.3 장 / 1초</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 28) }}>유선 1,000 Mbit/s Ethernet 이면 221 Mbit/s 는 22% 정도</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseBw = () => (
  <PauseWrite
    question="640 × 480 depth 카메라가 픽셀마다 거리를 2 byte 로 적어 30 Hz 로 보낸다. bandwidth 는 몇 Mbit/s 일까?"
    answer={
      <>
        640 × 480 × 2 = 614,400 byte · × 30 = 18,432,000 byte
        <br />
        bit 로 바꾸면 18,432,000 × 8 ≈ 147 Mbit/s
      </>
    }
  />
)

// ---------- 통신 방식과 QoS ----------

/** a two-lifeline message diagram, 520 × 240 */
function Lifelines({ left, right, children }: { left: string; right: string; children: ReactNode }) {
  return (
    <svg width={520} height={240}>
      <text x={70} y={24} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
        {left}
      </text>
      <text x={450} y={24} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
        {right}
      </text>
      <line x1={70} x2={70} y1={36} y2={236} stroke={C.cardEdge} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={450} x2={450} y1={36} y2={236} stroke={C.cardEdge} strokeWidth={2} strokeDasharray="6 6" />
      {children}
    </svg>
  )
}

function Patterns() {
  const t = useSec()
  const label = (x: number, y: number, s: string, color: string, at: number) => (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, at)}>
      {s}
    </text>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={576} h={420} at={0.3} title={<Head color={C.blue}>topic · 한쪽으로 계속</Head>}>
        <Lifelines left="publisher" right="subscriber">
          {label(260, 64, 'message', C.blue, 0.8)}
          {[80, 125, 170, 215].map((y, i) => (
            <g key={y}>{arrow(76, y, 444, y, C.blue, 3, 11, prog(t, 0.8 + i * 0.5))}</g>
          ))}
        </Lifelines>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.6) }}>결과를 돌려주지 않는다 · 사진, 속도 명령, 관절 상태</span>
      </Box>
      <Box x={672} y={140} w={576} h={420} at={3.4} title={<Head color={C.green}>service · request 하나에 response 하나</Head>}>
        <Lifelines left="client" right="server">
          {label(260, 66, 'request', C.green, 3.8)}
          {arrow(76, 80, 444, 80, C.green, 3, 11, prog(t, 3.8))}
          <rect x={442} y={88} width={16} height={72} rx={4} fill={C.green} opacity={0.6 * prog(t, 4.4)} />
          {label(260, 161, 'response', C.green, 5)}
          {arrow(444, 175, 76, 175, C.green, 3, 11, prog(t, 5))}
        </Lifelines>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 5.6) }}>빨리 끝나야 한다 · controller 켜고 끄기, 설정값 읽기</span>
      </Box>
      <Box x={1280} y={140} w={576} h={420} at={7} title={<Head color={C.orange}>action · 오래 걸리는 일</Head>}>
        <Lifelines left="client" right="server">
          {label(260, 56, 'goal', C.orange, 7.4)}
          {arrow(76, 70, 444, 70, C.orange, 3, 11, prog(t, 7.4))}
          {label(260, 103, 'feedback', C.purple, 8.3)}
          {[115, 150, 185].map((y, i) => (
            <g key={y}>{arrow(444, y, 76, y, C.purple, 2.5, 10, prog(t, 8.3 + i * 0.6), '8 6')}</g>
          ))}
          {label(260, 216, 'result', C.orange, 10.6)}
          {arrow(444, 228, 76, 228, C.orange, 3, 11, prog(t, 10.6))}
        </Lifelines>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.4) }}>도중에 cancel 가능 · service 3 개와 topic 2 개를 묶어 만든 방식</span>
      </Box>
      <Box x={64} y={584} w={1100} h={296} at={14} title={<Head color={C.orange}>Nav2 의 NavigateToPose action · 30 m 를 0.5 m/s 로</Head>}>
        <svg width={1044} height={120}>
          <line x1={40} x2={1000} y1={70} y2={70} stroke={C.cardEdge} strokeWidth={6} strokeLinecap="round" />
          <line x1={40} x2={40 + 960 * prog(t, 14.6, 6)} y1={70} y2={70} stroke={C.orange} strokeWidth={6} strokeLinecap="round" />
          {[200, 360, 520, 680, 840].map((x) => (
            <line key={x} x1={x} x2={x} y1={56} y2={84} stroke={C.purple} strokeWidth={3} opacity={prog(t, 14.6 + ((x - 40) / 960) * 6)} />
          ))}
          <circle cx={40} cy={70} r={9} fill={C.orange} />
          <circle cx={40 + 960 * prog(t, 14.6, 6)} cy={70} r={12} fill={C.text} />
          <text x={40} y={36} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
            goal
          </text>
          <text x={520} y={36} textAnchor="middle" fill={C.purple} fontSize={20} fontFamily={MONO} fontWeight={600}>
            feedback (주기적으로)
          </text>
          <text x={1000} y={36} textAnchor="end" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, 20.4)}>
            result
          </text>
          <text x={40} y={114} fill={C.muted} fontSize={20} fontFamily={MONO}>
            0 초
          </text>
          <text x={1000} y={114} textAnchor="end" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16.5)}>
            30 ÷ 0.5 = 60 초
          </text>
        </svg>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.5) }}>feedback: 지금 위치 · 남은 거리 · 남은 예상 시간 · 회복 동작 (recovery) 횟수</span>
      </Box>
      <Box x={1188} y={584} w={668} h={296} at={21} title={<Head color={C.red}>같은 일을 service 로 요청했다면</Head>} gap={12}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.3) }}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 60 초 동안 진행 상황을 모른 채 기다린다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.5) }}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 사람이 길을 막아도 멈추라고 할 수 없다
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>로봇 팔의 MoveIt 도 move_group node 의 move_action 으로 목표 자세를 받는다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** a 30 Hz camera feeding a 10 Hz policy: the queue at depth 10 and at depth 1 (lesson figure ros2-qos-depth) */
function Queue({ t }: { t: number }) {
  const cell = (i: number) => 120 + i * 70
  return (
    <svg width={832} height={180}>
      <text x={0} y={38} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.8)}>
        depth 10
      </text>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={cell(i)} y={6} width={62} height={50} rx={6} fill={i === 0 ? `${C.orange}55` : i === 9 ? `${C.green}44` : `${C.blue}22`} stroke={i === 0 ? C.orange : i === 9 ? C.green : C.blue} strokeWidth={2} opacity={prog(t, 19.9 + i * 0.15)} />
      ))}
      <text x={120} y={88} fill={C.orange} fontSize={21} fontWeight={600} opacity={prog(t, 21.6)}>
        꺼내는 사진 · 9 × 33 ≈ 300 ms 전
      </text>
      <text x={812} y={88} textAnchor="end" fill={C.green} fontSize={21} opacity={prog(t, 21.6)}>
        가장 최근
      </text>
      <g opacity={prog(t, 26.2)}>
        <text x={0} y={142} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          depth 1
        </text>
        <rect x={120} y={110} width={62} height={50} rx={6} fill={`${C.green}44`} stroke={C.green} strokeWidth={2} />
        <text x={204} y={142} fill={C.green} fontSize={21} fontWeight={600}>
          언제나 33 ms 안에 찍은 사진
        </text>
      </g>
    </svg>
  )
}

function Qos() {
  const t = useSec()
  const bad = prog(t, 13.2)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.accent}>QoS profile · 미리 묶어 둔 설정</Head>}>
        <Table
          at={0.5}
          head={['profile', 'history · depth', 'reliability', 'durability']}
          widths={[180, 230, 210, 170]}
          monoCols={[1, 2, 3]}
          rows={[
            ['기본', 'keep last 10', 'reliable', 'volatile'],
            ['sensor data', 'keep last 5', 'best effort', 'volatile'],
          ]}
          colors={[C.text, C.green]}
        />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 1.6) }}>reliable: 도착을 확인할 때까지 다시 보낸다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.4) }}>best effort: 한 번 보내고 끝낸다 · 사진은 하나 빠져도 33 ms 뒤에 새 사진이 온다</span>
      </Box>
      <Box x={968} y={140} w={888} h={330} at={6.5} title={<Head color={C.accent}>QoS 호환 · 요청이 제시보다 높으면 연결 안 됨</Head>}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: -12, right: -12, top: 77, height: 38, borderRadius: 8, background: `${C.red}22`, opacity: bad }} />
          <Table
            at={6.8}
            step={0.5}
            head={['publisher 가 제시', 'subscriber 가 요청', '연결']}
            widths={[300, 300, 180]}
            monoCols={[0, 1]}
            rows={[
              ['best effort', 'best effort', '된다'],
              ['best effort', 'reliable', '안 된다'],
              ['reliable', 'best effort', '된다'],
              ['reliable', 'reliable', '된다'],
            ]}
            colors={[C.text, bad > 0.5 ? C.red : C.text, C.text, C.text]}
          />
        </div>
      </Box>
      <Box x={64} y={494} w={880} h={386} at={13} title={<Head color={C.red}>흔한 문제: 둘째 줄</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 13.4) }}>
          <span style={{ padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.blue}88`, background: `${C.blue}14`, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap' }}>camera driver · best effort</span>
          <span style={{ color: C.red, fontSize: 30, fontWeight: 700 }}>✕</span>
          <span style={{ padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.orange}88`, background: `${C.orange}14`, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap' }}>새 node · reliable</span>
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 14.8) }}>오류 없이 실행되고 topic 이름도 맞지만 callback 이 한 번도 불리지 않는다 · log 에 경고 한 줄만</span>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: C.bg, border: `1px solid ${C.cardEdge}`, opacity: prog(t, 16.2) }}>
          <span style={mono(C.orange, 20)}>requesting incompatible QoS. No messages will be sent to it.</span>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.6) }}>
          확인: <span style={mono(C.text, 22)}>ros2 topic info -v</span> · 해결: subscriber 를 best effort 로
        </span>
      </Box>
      <Box x={968} y={494} w={888} h={386} at={19.5} title={<Head color={C.orange}>30 Hz 카메라 · 10 Hz policy 의 queue</Head>}>
        <Queue t={t} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.5) }}>0.5 m/s 로 달리면 0.5 × 0.3 = 0.15 m 뒤에서 본 장면</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 28) }}>센서 topic 은 depth 를 작게 · 놓치면 안 되는 명령은 넉넉히</span>
      </Box>
    </AbsoluteFill>
  )
}

const PausePattern = () => (
  <PauseWrite
    question="topic, service, action 가운데 무엇이 맞을까? (가) LiDAR 거리 측정 10 Hz (나) 지금까지 만든 지도를 파일로 저장하라는 요청 (다) 사람이 다가오면 멈출 수 있어야 하는 5 초짜리 팔 이동"
    answer={
      <>
        (가) 계속 흐르는 센서 데이터 → topic
        <br />
        (나) 금방 끝나고 성공 여부만 받으면 되는 요청 → service
        <br />
        (다) 오래 걸리고 진행 상황과 cancel 이 필요 → action
      </>
    }
  />
)

// ---------- timer 와 제어 loop ----------

/** 10 ms timer, 25 ms callback (lesson figure ros2-timer-overrun) */
function Overrun({ t }: { t: number }) {
  const x = (ms: number) => 300 + ms * 16
  const dots: { ms: number; color: string; status: string; at: number; skip?: boolean }[] = [
    { ms: 10, color: C.green, status: '바로 실행', at: 6.8 },
    { ms: 20, color: C.orange, status: '15 ms 기다림', at: 12.8 },
    { ms: 30, color: C.dim, status: '건너뜀', at: 14.6, skip: true },
    { ms: 40, color: C.orange, status: '20 ms 기다림', at: 15.8 },
    { ms: 50, color: C.dim, status: '건너뜀', at: 16.8, skip: true },
    { ms: 60, color: C.dim, status: '건너뜀', at: 17.4, skip: true },
  ]
  const bars: { from: number; label: string; color: string; at: number }[] = [
    { from: 10, label: '10 ms 예정분', color: C.green, at: 7.4 },
    { from: 35, label: '20 ms 예정분', color: C.orange, at: 13.4 },
    { from: 60, label: '40 ms 예정분', color: C.orange, at: 16.2 },
  ]
  return (
    <svg width={1792} height={400}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        100 Hz 로 계산하려는 controller · timer 간격 10 ms · callback 한 번에 25 ms
      </text>
      <g opacity={prog(t, 0.6)}>
        <text x={30} y={120} fill={C.text} fontSize={24} fontWeight={600}>
          예정 시각
        </text>
        <text x={30} y={148} fill={C.muted} fontSize={20}>
          timer · 10 ms 마다
        </text>
        <text x={30} y={256} fill={C.text} fontSize={24} fontWeight={600}>
          실제 실행
        </text>
        <text x={30} y={284} fill={C.muted} fontSize={20}>
          executor 의 thread
        </text>
        {dots.map((d) => (
          <line key={d.ms} x1={x(d.ms)} x2={x(d.ms)} y1={164} y2={220} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="5 6" />
        ))}
        <line x1={x(0)} x2={x(90)} y1={340} y2={340} stroke={C.dim} strokeWidth={2} />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((ms) => (
          <text key={ms} x={x(ms)} y={372} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {ms}
          </text>
        ))}
        <text x={x(90)} y={372} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          90 ms
        </text>
      </g>
      {dots.map((d) => (
        <g key={d.ms} opacity={prog(t, d.at)}>
          <text x={x(d.ms)} y={86} textAnchor="middle" fill={d.skip ? C.muted : d.color} fontSize={20} fontFamily={MONO} fontWeight={600}>
            {d.ms} ms
          </text>
          <circle cx={x(d.ms)} cy={112} r={9} fill={d.skip ? C.card : d.color} stroke={d.color} strokeWidth={2.5} />
          {d.skip && <line x1={x(d.ms) - 6} y1={106} x2={x(d.ms) + 6} y2={118} stroke={C.dim} strokeWidth={2.5} />}
          <text x={x(d.ms)} y={150} textAnchor="middle" fill={d.skip ? C.muted : d.color} fontSize={20}>
            {d.status}
          </text>
        </g>
      ))}
      <g opacity={prog(t, 13.4)}>
        <line x1={x(20)} y1={162} x2={x(35)} y2={224} stroke={C.orange} strokeWidth={2} strokeDasharray="6 5" />
      </g>
      <g opacity={prog(t, 16.2)}>
        <line x1={x(40)} y1={162} x2={x(60)} y2={224} stroke={C.orange} strokeWidth={2} strokeDasharray="6 5" />
      </g>
      {bars.map((b) => (
        <g key={b.from} opacity={prog(t, b.at)}>
          <rect x={x(b.from) + 2} y={228} width={25 * 16 * prog(t, b.at, 1) - 4} height={56} rx={8} fill={`${b.color}2a`} stroke={b.color} strokeWidth={2} />
          <text x={x(b.from + 12.5)} y={264} textAnchor="middle" fill={b.color} fontSize={22} fontWeight={600} opacity={prog(t, b.at + 0.6)}>
            {b.label}
          </text>
        </g>
      ))}
      <g opacity={prog(t, 18.8)}>
        {[10, 35, 60].map((ms) => (
          <g key={ms}>
            <line x1={x(ms) + 4} x2={x(ms + 25) - 4} y1={302} y2={302} stroke={C.red} strokeWidth={2} />
            <text x={x(ms + 12.5)} y={328} textAnchor="middle" fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600} style={halo}>
              실제 간격 25 ms
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function Timer() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={400} at={0.3}>
        <Overrun t={t} />
      </Card>
      <Box x={64} y={564} w={880} h={316} at={18.5} title={<Head color={C.red}>1초에 계산하는 횟수</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="예정 · 10 ms 간격" value={100} max={100} color={C.muted} at={18.8} unit=" 번" />
          <Bar label="실제 · 25 ms 간격" value={40} max={100} color={C.red} at={19.6} unit=" 번" />
        </div>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.8) }}>1000 ÷ 10 = 100 번 → 1000 ÷ 25 = 40 번</span>
      </Box>
      <Box x={968} y={564} w={888} h={316} at={24.5} title={<Head color={C.orange}>주기가 바뀌면</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 24.8) }}>gain 을 10 ms (100 Hz) 에 맞춘 controller: 같은 gain 이어도 I 항과 D 항의 크기가 달라지고, gain 이 크면 발산할 수도 있다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26.4) }}>같은 thread 를 쓰는 카메라 callback 도 그동안 기다린다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.6) }}>multi-threaded executor 에서 오래 걸리는 일은 다른 callback group 에 두거나, 다른 node 로 떼어 낸다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** policy at 20 Hz over a topic, controller_manager's read → update → write in one process (lesson figure ros2-control-loop) */
function ControlLoop({ t }: { t: number }) {
  const steps = [
    { x: 90, name: 'read', sub: '관절 상태 읽기' },
    { x: 440, name: 'update', sub: 'controller 계산' },
    { x: 790, name: 'write', sub: '명령 쓰기' },
  ]
  const live = t > 8 ? Math.floor((t - 8) * 3) % 3 : -1
  return (
    <svg width={1100} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        policy node 와 ros2_control 의 두 주기
      </text>
      <g opacity={prog(t, 0.6)}>
        <ellipse cx={210} cy={120} rx={150} ry={40} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={2} />
        <text x={210} y={114} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          policy node
        </text>
        <text x={210} y={142} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          20 Hz
        </text>
        {arrow(360, 120, 418, 120, C.muted)}
        <rect x={420} y={92} width={280} height={56} rx={8} fill={C.bg} stroke={C.orange} strokeWidth={2} />
        <text x={560} y={128} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
          목표 · topic
        </text>
      </g>
      <g opacity={prog(t, 7)}>
        <rect x={30} y={200} width={1040} height={380} rx={18} fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray="10 8" />
        <text x={56} y={240} fill={C.blue} fontSize={22} fontWeight={600}>
          controller_manager 의 process
        </text>
        <text x={900} y={240} textAnchor="end" fill={C.muted} fontSize={22}>
          update_rate 마다 되풀이
        </text>
        <text x={1044} y={240} textAnchor="end" fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
          1000 Hz
        </text>
      </g>
      <g opacity={prog(t, 7.4)}>{arrow(560, 148, 560, 298, C.orange)}</g>
      {steps.map((s, i) => (
        <g key={s.name} opacity={prog(t, 7.6 + i * 0.5)}>
          <rect x={s.x} y={300} width={240} height={90} rx={12} fill={live === i ? `${C.blue}44` : `${C.blue}14`} stroke={C.blue} strokeWidth={live === i ? 3.5 : 2} />
          <text x={s.x + 120} y={338} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
            {s.name}
          </text>
          <text x={s.x + 120} y={370} textAnchor="middle" fill={C.muted} fontSize={20}>
            {s.sub}
          </text>
        </g>
      ))}
      <g opacity={prog(t, 8.4)}>
        {arrow(330, 345, 438, 345, C.blue)}
        {arrow(680, 345, 788, 345, C.blue)}
      </g>
      <g opacity={prog(t, 14.2)}>
        <rect x={90} y={470} width={940} height={70} rx={12} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
        <text x={560} y={514} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
          hardware interface · plugin
        </text>
        {arrow(210, 468, 210, 392, C.green)}
        {arrow(910, 392, 910, 468, C.green)}
        {arrow(560, 542, 560, 652, C.green)}
        <rect x={400} y={654} width={320} height={60} rx={12} fill={C.bg} stroke={C.muted} strokeWidth={2} />
        <text x={560} y={692} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
          로봇 팔의 motor
        </text>
      </g>
    </svg>
  )
}

function Control() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={740} at={0.3}>
        <ControlLoop t={t} />
      </Card>
      <Box x={1188} y={140} w={668} h={300} at={0.3} title={<Head color={C.red}>timer 와 topic 만으로 만들면</Head>} gap={12}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 0.8) }}>공식 문서: 기본 executor 들은 실행 시간과 순서를 정확히 지켜야 하는 real-time 응용에 맞지 않다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.4) }}>매 주기 topic 으로 message 를 주고받으면 그때마다 전달 시간도 더해진다</span>
      </Box>
      <Box x={1188} y={464} w={668} h={416} at={14} title={<Head color={C.green}>ros2_control 에서는</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 14.4) }}>controller 와 hardware interface 는 같은 process 에 불러온 plugin → 값이 topic 을 거치지 않고 메모리에서 바로 오간다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21.3) }}>
          loop thread 우선순위 기본값 50 · Franka FR3: <span style={mono(C.accent, 22)}>update_rate 1000 Hz</span>, 우선순위 97
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.8) }}>update_rate 의 기본값은 100 Hz · 읽기 전용이라 시작할 때 정한다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 24.4) }}>
          policy 20 Hz → 목표 사이 <span style={mono(C.orange, 22)}>50 ms</span> 동안 <span style={mono(C.orange, 22)}>50 번</span> 계산
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseTimer = () => (
  <PauseWrite
    question="50 Hz timer 의 callback 이 한 번에 30 ms 걸린다. 실제로는 1초에 몇 번 실행될까?"
    answer={
      <>
        간격 1000 ÷ 50 = 20 ms 보다 callback 30 ms 가 길다 → 끝나자마자 다시 실행
        <br />
        30 ms 마다 한 번 → 1000 ÷ 30 ≈ 33 번
      </>
    }
  />
)

// ---------- tf2 frame tree ----------

/** REP-105's map → odom → base_link → camera_link chain and who publishes each edge */
function FrameTree({ t }: { t: number }) {
  const nodes = [
    { y: 90, name: 'map', sub: '지도', color: C.purple },
    { y: 260, name: 'odom', sub: '출발점', color: C.blue },
    { y: 430, name: 'base_link', sub: '로봇 몸체', color: C.green },
    { y: 600, name: 'camera_link', sub: '센서 · 몸체에 고정', color: C.orange },
  ]
  const edges: [string, string, boolean][] = [
    ['위치 추정 node', '(localization)', false],
    ['바퀴 odometry 같은', '움직임 측정 node', false],
    ['robot_state_publisher', 'URDF → /tf_static', true],
  ]
  return (
    <svg width={760} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        frame tree · REP-105
      </text>
      {nodes.map((n, i) => (
        <g key={n.name} opacity={prog(t, 0.6 + i * 0.5)}>
          <rect x={60} y={n.y} width={280} height={64} rx={12} fill={`${n.color}14`} stroke={n.color} strokeWidth={2} />
          <text x={200} y={n.y + 28} textAnchor="middle" fill={n.color} fontSize={24} fontFamily={MONO} fontWeight={600}>
            {n.name}
          </text>
          <text x={200} y={n.y + 54} textAnchor="middle" fill={C.muted} fontSize={20}>
            {n.sub}
          </text>
        </g>
      ))}
      {edges.map(([a, b, m], i) => {
        const y0 = nodes[i].y + 64
        const y1 = nodes[i + 1].y
        return (
          <g key={a} opacity={prog(t, 2.4 + i * 0.7)}>
            {arrow(200, y0 + 2, 200, y1 - 2, C.muted)}
            <text x={380} y={(y0 + y1) / 2 - 4} fill={C.text} fontSize={m ? 20 : 22} fontFamily={m ? MONO : undefined} fontWeight={600}>
              {a}
            </text>
            <text x={380} y={(y0 + y1) / 2 + 24} fill={C.muted} fontSize={20}>
              {b}
            </text>
          </g>
        )
      })}
      <text x={30} y={712} fill={C.muted} fontSize={20} opacity={prog(t, 4.6)}>
        frame 마다 부모는 하나 · 변 하나 = 부모에서 자식으로 가는 변환 하나
      </text>
    </svg>
  )
}

function Frames() {
  const t = useSec()
  const row = (name: string, color: string, at: number, text: string, use: string, useAt: number) => (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16, alignItems: 'start', opacity: prog(t, at) }}>
      <span style={{ ...mono(color, 26), paddingTop: 2 }}>{name}</span>
      <div style={{ display: 'grid', gap: 4 }}>
        <span style={line(C.text, 23)}>{text}</span>
        <span style={{ ...line(C.accent, 23), opacity: prog(t, useAt) }}>→ {use}</span>
      </div>
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <FrameTree t={t} />
      </Card>
      <Box x={848} y={140} w={1008} h={380} at={7} title={<Head color={C.accent}>map 과 odom 을 따로 두는 이유</Head>} gap={18}>
        {row('map', C.purple, 7.3, '오래 지나도 어긋나지 않지만, 위치 추정이 고쳐질 때 값이 갑자기 뛴다', '"주방으로 가라" 같은 목표를 정한다', 17.5)}
        {row('odom', C.blue, 10, '매끄럽게 이어지지만, 바퀴 미끄러짐이 쌓여 점점 어긋난다', '장애물을 피하는 제어에 쓴다 · 위치가 뛰면 엉뚱하게 움직이므로', 14.4)}
      </Box>
      <Box x={848} y={544} w={1008} h={336} at={21} title={<Head color={C.orange}>예: 위치 추정 node 는 그 차이인 map → odom 을 낸다</Head>} gap={10}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.3) }}>
          바퀴 odometry: odom 의 <span style={mono(C.blue, 24)}>(3.0, 1.0) m</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.6) }}>
          벽과 지도를 맞춘 위치 추정: map 의 <span style={mono(C.purple, 24)}>(3.4, 1.0) m</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24) }}>
          두 frame 의 방향이 같다면 map → odom 은 <span style={mono(C.accent, 24)}>(0.4, 0) m</span> 이동
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.6) }}>1초 뒤 더 정확한 값을 찾으면 map → odom 은 (0.5, 0.1) 처럼 갑자기 바뀌지만, odom → base_link 는 바퀴를 따라 매끄럽게 이어진다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** the cup seen by the camera, drawn in map coordinates at 160 px per m (lesson figure ros2-tf-tree) */
function FloorPlot({ t }: { t: number }) {
  const X = (m: number) => 100 + m * 160
  const Y = (m: number) => 640 - m * 160
  const robot = { x: X(3.4), y: Y(1.0) }
  const cam = { x: X(3.4), y: Y(1.2) }
  const cup = { x: X(3.4), y: Y(2.2) }
  const coords: [string, string, number][] = [
    ['camera_link', '(1.0, 0)', 0.8],
    ['base_link', '(1.2, 0)', 3.4],
    ['odom', '(3.0, 2.2)', 9.6],
    ['map', '(3.4, 2.2)', 13.6],
  ]
  return (
    <svg width={900} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        바닥 위 두 축 · x 앞 · y 왼쪽 · 단위 m
      </text>
      <g opacity={prog(t, 0.4)}>
        {[1, 2, 3, 4].map((m) => (
          <line key={`v${m}`} x1={X(m)} x2={X(m)} y1={Y(3)} y2={Y(0)} stroke={C.grid} strokeWidth={1.5} />
        ))}
        {[1, 2, 3].map((m) => (
          <line key={`h${m}`} x1={X(0)} x2={X(4.2)} y1={Y(m)} y2={Y(m)} stroke={C.grid} strokeWidth={1.5} />
        ))}
        {arrow(X(0), Y(0), X(4.3), Y(0), C.muted, 2.5)}
        {arrow(X(0), Y(0), X(0), Y(3.2), C.muted, 2.5)}
        {[0, 1, 2, 3, 4].map((m) => (
          <text key={m} x={X(m)} y={672} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {m}
          </text>
        ))}
        {[1, 2, 3].map((m) => (
          <text key={m} x={X(0) - 18} y={Y(m) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {m}
          </text>
        ))}
        <text x={X(0) + 12} y={Y(0) - 12} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600} style={halo}>
          map
        </text>
      </g>
      <g opacity={prog(t, 13.4)}>
        <circle cx={X(0.4)} cy={Y(0)} r={7} fill={C.blue} />
        {arrow(X(0.4), Y(0), X(0.4), Y(0.6), C.blue, 2.5)}
        <text x={X(0.4)} y={704} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
          odom 원점 = map 의 (0.4, 0)
        </text>
      </g>
      <g opacity={prog(t, 0.6)}>
        <polygon points={`${robot.x},${robot.y - 30} ${robot.x - 24},${robot.y + 22} ${robot.x + 24},${robot.y + 22}`} fill={`${C.green}33`} stroke={C.green} strokeWidth={2.5} />
        <rect x={cam.x - 10} y={cam.y - 8} width={20} height={16} rx={3} fill={C.orange} />
        <line x1={cam.x} x2={cup.x} y1={cam.y - 12} y2={cup.y + 18} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
        <circle cx={cup.x} cy={cup.y} r={14} fill={`${C.orange}55`} stroke={C.orange} strokeWidth={2.5} />
        <text x={cam.x + 30} y={cam.y + 7} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
          camera_link
        </text>
        <text x={cup.x + 14} y={(cam.y + cup.y) / 2 + 7} fill={C.orange} fontSize={20} fontFamily={MONO}>
          1.0 m
        </text>
        <text x={cup.x + 26} y={cup.y + 7} fill={C.orange} fontSize={22} fontWeight={600}>
          컵
        </text>
      </g>
      <g opacity={prog(t, 6.8)}>
        <text x={robot.x - 40} y={robot.y + 10} textAnchor="end" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600} style={halo}>
          base_link · odom 의 (3.0, 1.0)
        </text>
        <text x={robot.x - 40} y={robot.y + 38} textAnchor="end" fill={C.muted} fontSize={20} style={halo}>
          왼쪽으로 90° 돌아 있음 · 앞(x) 이 위쪽
        </text>
      </g>
      {coords.map(([f, v, at], i) => (
        <text key={f} x={cup.x - 34} y={cup.y - 70 + i * 30} textAnchor="end" fill={i === 3 ? C.accent : C.text} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, at)} style={halo}>
          {f} {v}
        </text>
      ))}
    </svg>
  )
}

function Transform() {
  const t = useSec()
  const step = (edge: string, calc: string, at: number, color = C.text) => (
    <div style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
      <span style={line(C.muted, 22)}>{edge}</span>
      <span style={mono(color, 24)}>{calc}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <FloorPlot t={t} />
      </Card>
      <Box x={988} y={140} w={868} h={470} at={0.3} title={<Head color={C.accent}>컵의 좌표를 tree 를 따라 바꾸기</Head>} gap={12}>
        {step('camera_link 에서 · 정면 1.0 m', '(1.0, 0)', 0.8)}
        {step('base_link → camera_link · 회전 없음 · 0.2 m 앞', '(1.0 + 0.2, 0) = (1.2, 0)', 3.4)}
        {step('odom → base_link · 왼쪽으로 90° · 이동 (3.0, 1.0)', '(1.2, 0) → 돌리면 (0, 1.2) → 옮기면 (3.0, 2.2)', 6.8)}
        {step('map → odom · 회전 없음 · 이동 (0.4, 0)', '(3.0 + 0.4, 2.2) = (3.4, 2.2)', 13.4, C.accent)}
      </Box>
      <Box x={988} y={634} w={868} h={246} at={19} title={<Head color={C.orange}>변환은 시각마다 다르다</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.3) }}>
          사진의 stamp 가 0.1 초 전 · 0.5 rad/s 로 회전 중 → <span style={mono(C.orange, 22)}>0.5 × 0.1 = 0.05 rad (약 2.9°)</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.3) }}>
          3 m 앞 컵: <span style={mono(C.red, 22)}>3 × 0.05 ≈ 0.15 m</span> 어긋남 → 사진을 찍은 시각의 변환을 tf2 에 묻는다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseTf = () => (
  <PauseWrite
    question="camera_link 는 base_link 의 (0.1, 0), base_link 는 odom 의 (5.0, 0) 에 같은 방향으로 있고, map → odom 은 회전 없이 (−0.2, 0.3) 이다. 카메라 정면 2.0 m 의 물체는 map 에서 어디일까?"
    answer={
      <>
        회전이 없으니 이동만 차례로 더한다
        <br />
        base_link (2.1, 0) → odom (7.1, 0) → map (7.1 − 0.2, 0 + 0.3) = (6.9, 0.3)
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'node 와 topic', color: C.accent, text: '주기가 다른 일은 node 로 나눈다 · 640 × 480 × 3 byte × 30 Hz × 8 ≈ 221 Mbit/s', at: 1 },
    { tag: '통신 방식과 QoS', color: C.blue, text: 'topic · service · action · 요청이 제시보다 높으면 연결 안 됨 · 센서는 best effort', at: 4.4 },
    { tag: 'timer 와 제어 loop', color: C.orange, text: '10 ms timer 에 25 ms callback 이면 100 번 → 40 번 · 1000 Hz loop 는 ros2_control', at: 8.4 },
    { tag: 'tf2 frame tree', color: C.green, text: 'map → odom → base_link → camera_link · 컵 (1.0, 0) → map (3.4, 2.2)', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            주기가 다른 프로그램들이 데이터를 주고받으면서, 하나가 꺼져도 나머지는 멈추지 않으려면?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
            NEXT · ROS 2
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Rigid Transforms · Kalman Filter</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            3 차원 회전: rotation matrix · homogeneous transform · tf2 가 쓰는 quaternion
          </Label>
        </Appear>
        <Appear at={1.4}>
          <Label color={C.muted} size={32}>
            odom → base_link 와 map → odom 을 계산하는 위치 추정: robot_localization
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/ros2-basics (Macenski 등 2022 Science Robotics · ROS 2 Jazzy 문서 · REP-105)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Ros2Basics() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        split: Split,
        bandwidth: Bandwidth,
        'pause-bw': PauseBw,
        patterns: Patterns,
        qos: Qos,
        'pause-pattern': PausePattern,
        timer: Timer,
        control: Control,
        'pause-timer': PauseTimer,
        frames: Frames,
        transform: Transform,
        'pause-tf': PauseTf,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
