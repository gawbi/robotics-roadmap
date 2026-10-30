import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './transforms.narration.json'
import { script } from './transforms.script'

// Numbers follow lessons/transforms/README.md (see transforms.script.ts). The wrist-camera, gripper and gimbal drawings are
// schematic (marked 모식도); the plots of frames, the unit circle, the slerp fans and the odometry arc are drawn to scale.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28, mono = false }: { children: ReactNode; color?: string; size?: number; mono?: boolean }) {
  return (
    <Label color={color} size={size} weight={600} mono={mono}>
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** one line of a Box that fades in at `at` */
function Row({ at, children, style }: { at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ ...line(), opacity: prog(t, at), ...style }}>{children}</div>
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, dash?: string) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a frame's x and y axes at screen point (x, y), the x axis turned `deg` counter-clockwise */
function axes(x: number, y: number, deg: number, len: number, color: string, labels?: [string, string], width = 3.5, dash?: string) {
  const a = (deg * Math.PI) / 180
  const off = len + 20
  return (
    <g>
      {arrow(x, y, x + len * Math.cos(a), y - len * Math.sin(a), color, width, 13, dash)}
      {arrow(x, y, x - len * Math.sin(a), y - len * Math.cos(a), color, width, 13, dash)}
      <circle cx={x} cy={y} r={5} fill={color} />
      {labels && (
        <>
          <text x={x + off * Math.cos(a)} y={y - off * Math.sin(a) + 7} textAnchor="middle" fill={color} fontSize={21} fontWeight={600}>
            {labels[0]}
          </text>
          <text x={x - off * Math.sin(a)} y={y - off * Math.cos(a) + 7} textAnchor="middle" fill={color} fontSize={21} fontWeight={600}>
            {labels[1]}
          </text>
        </>
      )}
    </g>
  )
}

/** a bracketed matrix or column vector in MONO */
function Matrix({ rows, size = 28, colW = 60, colColors }: { rows: (string | number)[][]; size?: number; colW?: number; colColors?: string[] }) {
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${rows[0].length}, ${colW}px)`, padding: '4px 10px', borderLeft: `3px solid ${C.muted}`, borderRight: `3px solid ${C.muted}`, borderRadius: 8, fontFamily: MONO, fontSize: size, fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>
      {rows.flatMap((r, i) =>
        r.map((v, j) => (
          <span key={`${i}-${j}`} style={{ color: colColors?.[j] ?? C.text }}>
            {v}
          </span>
        )),
      )}
    </div>
  )
}

/** a text table: `monoCols` marks the columns set in MONO */
function Table({ head, rows, widths, at, step = 0.6, size = 24, monoCols, colors, rowAt }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; monoCols: boolean[]; colors?: (string | undefined)[]; rowAt?: number[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: monoCols[i] ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', paddingRight: 10, fontWeight: monoCols[i] ? 600 : 500 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, fontWeight: 500, color: C.muted, fontSize: size - 2 }}>
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

/** faint grid lines of a plot whose point (X, Y) sits at screen (ox + s X, oy − s Y) */
function grid(ox: number, oy: number, s: number, xs: [number, number], ys: [number, number]) {
  const out: ReactNode[] = []
  for (let X = xs[0]; X <= xs[1]; X++) out.push(<line key={`x${X}`} x1={ox + s * X} y1={oy - s * ys[0]} x2={ox + s * X} y2={oy - s * ys[1]} stroke={C.grid} strokeWidth={2} />)
  for (let Y = ys[0]; Y <= ys[1]; Y++) out.push(<line key={`y${Y}`} x1={ox + s * xs[0]} y1={oy - s * Y} x2={ox + s * xs[1]} y2={oy - s * Y} stroke={C.grid} strokeWidth={2} />)
  return <g>{out}</g>
}

const T = (t: number, at: number, out?: number) => prog(t, at) * (out === undefined ? 1 : 1 - prog(t, out, 0.5))

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            KINEMATICS · RIGID TRANSFORMS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Rigid Transforms</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            모양은 그대로 · <span style={{ color: C.accent }}>rotation + translation</span> 만
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            frame 사이에서 점의 좌표를 바꾸는 계산
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
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={800} height={330}>
          <g opacity={prog(t, 0.4)}>
            <text x={780} y={34} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
            <rect x={60} y={230} width={120} height={60} rx={10} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={120} y={318} textAnchor="middle" fill={C.muted} fontSize={21}>
              팔 몸통 (base)
            </text>
            <line x1={120} y1={230} x2={260} y2={110} stroke={C.muted} strokeWidth={10} strokeLinecap="round" />
            <line x1={260} y1={110} x2={420} y2={130} stroke={C.muted} strokeWidth={10} strokeLinecap="round" />
            <circle cx={260} cy={110} r={10} fill={C.card} stroke={C.muted} strokeWidth={3} />
          </g>
          <g opacity={prog(t, 0.8)}>
            <rect x={420} y={112} width={56} height={40} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
            <circle cx={466} cy={132} r={7} fill={C.accent} />
            <text x={448} y={92} textAnchor="middle" fill={C.accent} fontSize={21} fontWeight={600}>
              손목 카메라
            </text>
            <line x1={480} y1={140} x2={640} y2={238} stroke={C.accent} strokeWidth={2} strokeDasharray="7 7" />
          </g>
          <g opacity={prog(t, 1.2)}>
            <rect x={640} y={232} width={44} height={56} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={3} />
            <text x={662} y={318} textAnchor="middle" fill={C.orange} fontSize={21} fontWeight={600}>
              컵
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 840, top: 30, width: 920, display: 'grid', gap: 16 }}>
          <Appear at={0.6}>
            <Label size={24} color={C.muted}>
              카메라가 잰 컵의 위치 (사진 기준)
            </Label>
          </Appear>
          <div style={{ display: 'flex', gap: 14 }}>
            <Chip at={0.9} mono>
              정면 25 cm
            </Chip>
            <Chip at={1.3} mono>
              오른쪽 2 cm
            </Chip>
            <Chip at={1.7} mono>
              위쪽 1 cm
            </Chip>
          </div>
          <Row at={2.4}>팔이 손을 뻗으려면 몸통에서 잰 컵의 위치가 필요하다</Row>
          <Row at={3.2} style={line(C.muted, 24)}>
            카메라는 팔이 움직일 때마다 자리와 방향이 바뀐다
          </Row>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 496, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          카메라가 잰 숫자를 몸통 기준 숫자로 바꾸려면 <span style={{ color: C.accent }}>무엇을 알고, 어떤 계산을 해야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={660} w={1260} h={220} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Flow steps={['카메라 frame', '손목 frame', '몸통 frame']} color={C.accent} at={5.9} />
          <Row at={6.8}>frame 사이의 위치와 방향을 4×4 행렬 하나로 적어 두면, 바꾸는 계산은 행렬을 차례로 곱하는 일</Row>
          <Row at={7.2} style={line(C.muted, 22)}>
            ROS 2 의 tf2: 이동량 숫자 3 개와 방향 quaternion 숫자 4 개로 저장하고 frame tree 를 따라 이어 계산
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- frame 과 rotation ----------

function Frames() {
  const t = useSec()
  const ox = 110
  const oy = 610
  const s = 120
  const P = (X: number, Y: number): [number, number] => [ox + s * X, oy - s * Y]
  const [bx, by] = P(3, 1)
  const [cx, cy] = P(5, 2)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.2}>
        <svg width={900} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            교실 바닥 · 1 m 격자
          </text>
          {grid(ox, oy, s, [0, 6], [0, 4])}
          {[0, 1, 2, 3, 4, 5, 6].map((X) => (
            <text key={X} x={ox + s * X} y={642} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {X}
            </text>
          ))}
          {[1, 2, 3, 4].map((Y) => (
            <text key={Y} x={ox - 18} y={oy - s * Y + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {Y}
            </text>
          ))}
          <g opacity={prog(t, 0.5)}>
            {axes(ox, oy, 0, 90, C.blue)}
            <text x={ox} y={684} fill={C.blue} fontSize={22} fontWeight={600}>
              frame a (교실 구석)
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            <circle cx={cx} cy={cy} r={14} fill={C.orange} />
            <text x={cx + 22} y={cy + 8} fill={C.orange} fontSize={22} fontWeight={600}>
              컵
            </text>
            <text x={696} y={342} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              frame a: (5, 2)
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            {axes(bx, by, 0, 90, C.green)}
            <text x={bx + 90} y={by - 12} textAnchor="middle" fill={C.green} fontSize={21} fontWeight={600}>
              x
            </text>
            <text x={455} y={420} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              frame b (로봇)
            </text>
          </g>
          <g opacity={prog(t, 9)}>
            <line x1={bx + 96} y1={by} x2={cx} y2={by} stroke={C.green} strokeWidth={2.5} strokeDasharray="8 7" />
            <line x1={cx} y1={by} x2={cx} y2={cy + 16} stroke={C.green} strokeWidth={2.5} strokeDasharray="8 7" />
            <text x={610} y={528} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              frame b: (2, 1)
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            {arrow(ox, oy, bx - 8, by + 3, C.orange, 3, 13, '9 7')}
            <text x={300} y={588} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              p_ab = (3, 1)
            </text>
          </g>
          <text x={30} y={720} fill={C.muted} fontSize={22} opacity={prog(t, 21.5)}>
            frame b 를 로봇의 base_link 로 보면 x 축은 앞, y 축은 왼쪽을 향한다
          </text>
        </svg>
      </Card>
      <Box x={996} y={140} w={860} h={180} at={0.4} title={<Head color={C.blue}>frame = 원점 + 서로 직각인 축</Head>}>
        <Row at={0.8}>위치를 적는 숫자는 어느 frame 에서 쟀는지에 따라 달라진다</Row>
      </Box>
      <Box x={996} y={336} w={860} h={256} at={7} title={<Head>아래첨자 = 어느 frame 에서 잰 값인지</Head>}>
        <Table
          head={['기호', '뜻', '컵의 예']}
          widths={[110, 500, 160]}
          monoCols={[true, false, true]}
          at={7.3}
          rowAt={[7.6, 8.4, 15]}
          colors={[C.blue, C.green, C.orange]}
          rows={[
            ['p_a', 'frame a 에서 잰 점 p 의 좌표', '(5, 2)'],
            ['p_b', 'frame b 에서 잰 같은 점의 좌표', '(2, 1)'],
            ['p_ab', 'frame a 에서 잰 frame b 원점의 위치', '(3, 1)'],
          ]}
        />
      </Box>
      <Box x={996} y={608} w={860} h={272} at={14} title={<Head color={C.orange}>방향이 같을 때만 더하기로 끝난다</Head>} gap={12}>
        <Row at={14.5}>
          <span style={mono(C.orange, 24)}>p_a = p_ab + p_b = (3, 1) + (2, 1) = (5, 2)</span>
        </Row>
        <Row at={17}>frame 이 돌아가 있으면 축의 방향(orientation)도 알아야 한다</Row>
        <Row at={21.2}>
          위치 + 방향 = <b style={{ color: C.accent }}>pose</b>
        </Row>
        <Row at={23} style={line(C.muted, 24)}>
          ROS REP-103: base_link 의 x · y · z 축은 앞 · 왼쪽 · 위
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Rotation() {
  const t = useSec()
  const cx = 360
  const cy = 380
  const r = 200
  const c30 = 0.866
  const s30 = 0.5
  const p30: [number, number] = [cx + r * c30, cy - r * s30]
  const q30: [number, number] = [cx - r * s30, cy - r * c30]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={820} h={740} at={0.2}>
        <svg width={820} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            단위원 · 반지름 1
          </text>
          <line x1={120} y1={cy} x2={610} y2={cy} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={cx} y1={150} x2={cx} y2={610} stroke={C.cardEdge} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" opacity={prog(t, 0.4)} />
          <g opacity={prog(t, 0.8)}>
            <path d={`M ${cx + 52} ${cy} A 52 52 0 0 0 ${cx + 52 * c30} ${cy - 52 * s30}`} fill="none" stroke={C.orange} strokeWidth={2.5} />
            <text x={432} y={368} fill={C.orange} fontSize={20} fontFamily={MONO}>
              30°
            </text>
            <line x1={p30[0]} y1={p30[1]} x2={p30[0]} y2={cy} stroke={C.accent} strokeWidth={2} strokeDasharray="5 5" />
            <line x1={p30[0]} y1={p30[1]} x2={cx} y2={p30[1]} stroke={C.accent} strokeWidth={2} strokeDasharray="5 5" />
            <circle cx={p30[0]} cy={p30[1]} r={8} fill={C.accent} />
            <text x={548} y={272} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (0.866, 0.5)
            </text>
            <text x={446} y={406} textAnchor="middle" fill={C.accent} fontSize={20} fontFamily={MONO}>
              cos 30°
            </text>
            <text x={545} y={340} fill={C.accent} fontSize={20} fontFamily={MONO}>
              sin 30°
            </text>
            <circle cx={cx} cy={cy - r} r={7} fill={C.text} />
            <text x={372} y={174} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
              90°: (0, 1)
            </text>
          </g>
          <g opacity={prog(t, 7.8)}>
            {arrow(cx, cy, cx + r, cy, C.dim, 3)}
            <text x={572} y={410} fill={C.dim} fontSize={20} fontFamily={MONO}>
              (1, 0)
            </text>
            {arrow(cx, cy, p30[0], p30[1], C.green, 5, 16)}
          </g>
          <g opacity={prog(t, 9.5)}>
            {arrow(cx, cy, q30[0], q30[1], C.purple, 5, 16)}
            <text x={248} y={202} textAnchor="end" fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (−0.5, 0.866)
            </text>
          </g>
          <g opacity={prog(t, 15.3)}>
            <polygon
              points={[
                [cx, cy],
                [cx + 22 * c30, cy - 22 * s30],
                [cx + 22 * c30 - 22 * s30, cy - 22 * s30 - 22 * c30],
                [cx - 22 * s30, cy - 22 * c30],
              ]
                .map((p) => p.join(','))
                .join(' ')}
              fill="none"
              stroke={C.text}
              strokeWidth={2}
            />
            <text x={433} y={310} textAnchor="middle" fill={C.green} fontSize={20}>
              길이 1
            </text>
            <text x={296} y={312} textAnchor="end" fill={C.purple} fontSize={20}>
              길이 1
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 636, display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, 8.5) }}>
          <span style={mono(C.text, 28)}>R(30°) =</span>
          <Matrix rows={[['0.866', '−0.5'], ['0.5', '0.866']]} colW={110} colColors={[C.green, C.purple]} />
          <span style={{ ...line(C.muted, 22), marginLeft: 10 }}>열 = 두 축이 도착한 곳</span>
        </div>
      </Card>
      <Box x={916} y={140} w={940} h={180} at={0.4} title={<Head color={C.accent}>단위원 위의 점 = (cos θ, sin θ)</Head>}>
        <Row at={0.8}>가로 좌표가 cos θ 이고 세로 좌표가 sin θ</Row>
        <Row at={2.5}>
          <span style={mono(C.accent, 24)}>30° → (0.866, 0.5) · 90° → (0, 1)</span>
        </Row>
      </Box>
      <Box x={916} y={336} w={940} h={180} at={7.5} title={<Head>rotation matrix: 두 축이 도착하는 곳을 열로</Head>}>
        <Row at={7.9}>
          첫째 열 = <span style={mono(C.green, 24)}>(1, 0)</span> 이 가는 곳 <span style={mono(C.green, 24)}>(cos θ, sin θ)</span>
        </Row>
        <Row at={9.6}>
          둘째 열 = <span style={mono(C.purple, 24)}>(0, 1)</span> 이 가는 곳 <span style={mono(C.purple, 24)}>(−sin θ, cos θ)</span>
        </Row>
      </Box>
      <Box x={916} y={532} w={940} h={180} at={15} title={<Head color={C.green}>rigid transform: 늘리거나 찌그러뜨리지 않는다</Head>}>
        <Row at={15.4}>
          LiDAR 의 예 <span style={mono(C.text, 24)}>R(30°) × (2, 1) = (1.232, 1.866)</span>
        </Row>
        <Row at={17.5}>
          두 점 모두 원점에서 <span style={mono(C.green, 24)}>√5 ≈ 2.236</span> · <span style={mono(C.muted, 22)}>0.866² + 0.5² = 1</span>
        </Row>
      </Box>
      <Box x={916} y={728} w={940} h={152} at={22.5} title={<Head color={C.orange}>R_ab 의 열 = frame b 의 축을 frame a 에서 잰 값</Head>}>
        <Row at={24.5}>
          역행렬은 transpose: <span style={mono(C.orange, 24)}>R(30°)⁻¹ = R(30°)ᵀ = R(−30°)</span>
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 합성과 역변환 ----------

function Homogeneous() {
  const t = useSec()
  const ox = 265
  const oy = 615
  const s = 90
  const P = (X: number, Y: number): [number, number] => [ox + s * X, oy - s * Y]
  const [bx, by] = P(3, 1)
  const [px, py] = P(2, 3)
  const [w1x, w1y] = P(5, 2)
  const [w2x, w2y] = P(-2, 5)
  const R = 485
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={820} h={740} at={0.2}>
        <svg width={820} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            frame b: frame a 의 (3, 1) 에서 90° 회전
          </text>
          {grid(ox, oy, s, [-2, 5], [0, 5])}
          <g opacity={prog(t, 0.4)}>
            {axes(ox, oy, 0, 70, C.blue)}
            <text x={ox + 14} y={oy + 38} fill={C.blue} fontSize={22} fontWeight={600}>
              frame a
            </text>
            {arrow(ox, oy, bx - 8, by + 3, C.orange, 3, 13, '9 7')}
          </g>
          <g opacity={prog(t, 0.8)}>
            {axes(bx, by, 90, 70, C.green)}
            <text x={bx + 16} y={by - 63} fill={C.green} fontSize={21} fontWeight={600}>
              x
            </text>
            <text x={bx - 70} y={by - 14} textAnchor="middle" fill={C.green} fontSize={21} fontWeight={600}>
              y
            </text>
            <text x={552} y={564} fill={C.green} fontSize={21} fontWeight={600}>
              frame b · (3, 1) · 90°
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <line x1={bx} y1={by - 76} x2={bx} y2={py} stroke={C.green} strokeWidth={2.5} strokeDasharray="8 7" />
            <line x1={bx} y1={py} x2={px + 10} y2={py} stroke={C.green} strokeWidth={2.5} strokeDasharray="8 7" />
            <text x={550} y={402} fill={C.green} fontSize={20}>
              2 만큼
            </text>
            <text x={490} y={331} textAnchor="middle" fill={C.green} fontSize={20}>
              1 만큼
            </text>
          </g>
          <g opacity={prog(t, 3.6)}>
            <circle cx={px} cy={py} r={10} fill={C.accent} />
            <text x={428} y={336} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (2, 3)
            </text>
          </g>
          <g opacity={prog(t, 7.3) * (1 - 0.6 * prog(t, 14))}>
            {arrow(ox, oy, w1x, w1y, C.red, 2.5, 12, '7 7')}
            <circle cx={w1x} cy={w1y} r={7} fill={C.red} />
            <text x={w1x + 12} y={w1y + 9} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (5, 2)
            </text>
          </g>
          <g opacity={prog(t, 9.3) * (1 - 0.6 * prog(t, 14))}>
            <path d={`M ${w1x} ${w1y} A ${R} ${R} 0 0 0 ${w2x} ${w2y}`} fill="none" stroke={C.red} strokeWidth={2.5} strokeDasharray="7 7" />
            <circle cx={w2x} cy={w2y} r={8} fill={C.red} />
            <text x={w2x} y={w2y + 36} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (−2, 5)
            </text>
            <text x={300} y={212} textAnchor="middle" fill={C.red} fontSize={20}>
              나중에 90° 회전
            </text>
          </g>
        </svg>
      </Card>
      <Box x={916} y={140} w={940} h={215} at={0.4} title={<Head mono color={C.accent}>p_a = R_ab p_b + p_ab</Head>}>
        <Table
          head={['단계', '계산', '결과']}
          widths={[230, 380, 180]}
          monoCols={[false, true, true]}
          at={0.8}
          rowAt={[1.4, 3.4]}
          rows={[
            ['방향 바꾸기', 'R(90°) × (2, 1)', '(−1, 2)'],
            ['원점 위치 더하기', '(−1, 2) + (3, 1)', '(2, 3)'],
          ]}
        />
      </Box>
      <Box x={916} y={371} w={940} h={180} at={7} color={`${C.red}88`} title={<Head color={C.red}>✕ 원점 위치를 먼저 더하고 돌리면</Head>}>
        <Row at={7.4}>
          <span style={mono(C.red, 24)}>(2, 1) + (3, 1) = (5, 2) → 90° → (−2, 5)</span>
        </Row>
        <Row at={10.5}>p_ab 는 이미 frame a 에서 잰 값이라 돌리면 안 된다</Row>
      </Box>
      <Box x={916} y={567} w={940} h={313} at={14} gap={12} title={<Head color={C.green}>homogeneous transform: 좌표 끝에 1 을 붙인다</Head>}>
        <Row at={14.5}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={mono(C.text, 28)}>T_ab =</span>
            <Matrix rows={[[0, '−1', 3], [1, 0, 1], [0, 0, 1]]} colColors={[C.text, C.text, C.orange]} />
            <span style={mono(C.muted, 28)}>×</span>
            <Matrix rows={[[2], [1], [1]]} />
            <span style={mono(C.muted, 28)}>=</span>
            <Matrix rows={[[2], [3], [1]]} colColors={[C.accent]} />
          </div>
        </Row>
        <Row at={21.3}>
          <span style={mono(C.text, 24)}>0 × 2 + (−1) × 1 + 3 × 1 = 2</span> · 끝의 <span style={mono(C.orange, 24)}>3 × 1</span> 이 translation
        </Row>
        <Row at={24} style={line(C.muted, 23)}>
          3D 는 4×4 행렬 · 이런 행렬의 모임이 SE(3), 2D 의 3×3 은 SE(2)
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function ComposeInverse() {
  const t = useSec()
  const ox = 190
  const oy = 585
  const s = 95
  const P = (X: number, Y: number): [number, number] => [ox + s * X, oy - s * Y]
  const [bx, by] = P(3, 1)
  const [cx, cy] = P(3, 3)
  const [qx, qy] = P(3, 4)
  const [lx, ly] = P(5, 1)
  const [px, py] = P(2, 3)
  const A = T(t, 0.3, 12.8)
  const B = T(t, 13.2, 19.2)
  const Cl = prog(t, 19.7)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={820} h={740} at={0.2}>
        <svg width={820} height={740}>
          {grid(ox, oy, s, [-1, 6], [0, 5])}
          {axes(ox, oy, 0, 70, C.blue)}
          <text x={ox + 12} y={oy + 38} fill={C.blue} fontSize={22} fontWeight={600}>
            {t < 19.4 ? 'world w' : 'frame a'}
          </text>
          {axes(bx, by, 90, 70, C.green)}
          <text x={bx + 12} y={by - 58} fill={C.green} fontSize={21} fontWeight={600}>
            x
          </text>
          <text x={bx - 92} y={by + 7} textAnchor="end" fill={C.green} fontSize={21} fontWeight={600}>
            y
          </text>
          <text x={bx + 16} y={by + 34} fill={C.green} fontSize={21} fontWeight={600}>
            {t < 19.4 ? 'base b · (3, 1) · 90°' : 'frame b · (3, 1) · 90°'}
          </text>
          {arrow(ox, oy, bx - 8, by + 3, C.dim, 2.5, 12, '8 7')}
          <g opacity={A}>
            <line x1={bx} y1={by - 78} x2={cx} y2={cy + 6} stroke={C.orange} strokeWidth={2.5} strokeDasharray="8 7" />
            {axes(cx, cy, 90, 70, C.orange)}
            <text x={cx + 16} y={cy + 8} fill={C.orange} fontSize={21} fontWeight={600}>
              camera c · base 의 (2, 0)
            </text>
            <circle cx={qx} cy={qy} r={10} fill={C.accent} />
            <text x={qx + 18} y={qy + 8} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              (3, 4)
            </text>
            <text x={30} y={700} fill={C.muted} fontSize={22}>
              camera 의 (1, 0) → base 의 (3, 0) → world 의 (3, 4)
            </text>
          </g>
          <g opacity={B}>
            {arrow(bx, by - 6, cx, cy + 10, C.green, 3, 13)}
            {axes(cx, cy, 90, 70, C.green, undefined, 3, '6 5')}
            <text x={cx + 16} y={cy + 8} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              T_wb M · (3, 3)
            </text>
            {arrow(bx + 6, by, lx - 10, ly, C.orange, 3, 13)}
            {axes(lx, ly, 90, 70, C.orange, undefined, 3, '6 5')}
            <text x={lx} y={ly - 96} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600}>
              M T_wb · (5, 1)
            </text>
            <text x={30} y={700} fill={C.muted} fontSize={22}>
              오른쪽 곱: 로봇 자신의 x 축(위)으로 2 · 왼쪽 곱: world 의 x 축(오른쪽)으로 2
            </text>
          </g>
          <g opacity={Cl}>
            {arrow(bx - 4, by - 8, px + 8, py + 10, C.accent, 3, 13)}
            <text x={410} y={412} textAnchor="end" fill={C.accent} fontSize={21} fontFamily={MONO} fontWeight={600}>
              (−1, 2)
            </text>
            <circle cx={px} cy={py} r={10} fill={C.accent} />
            <text x={px - 16} y={py + 34} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              p_a = (2, 3)
            </text>
          </g>
          <g opacity={prog(t, 21.5)}>
            <text x={px} y={py - 22} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              p_b = (2, 1)
            </text>
          </g>
          <text x={30} y={700} fill={C.muted} fontSize={22} opacity={Cl}>
            (2, 3) − (3, 1) = (−1, 2) → −90° 회전 → (2, 1)
          </text>
        </svg>
      </Card>
      <Box x={916} y={140} w={940} h={178} at={0.4} title={<Head>camera → base → world</Head>}>
        <Row at={1.6}>
          <span style={mono(C.orange, 24)}>(1, 0) + (2, 0) = (3, 0)</span> <span style={line(C.muted, 22)}>base 에서</span>
        </Row>
        <Row at={3.4}>
          <span style={mono(C.accent, 24)}>R(90°) × (3, 0) + (3, 1) = (3, 4)</span> <span style={line(C.muted, 22)}>world 에서</span>
        </Row>
      </Box>
      <Box x={916} y={334} w={940} h={135} at={6.5} title={<Head mono color={C.accent}>T_wc = T_wb T_bc</Head>}>
        <Row at={8.5}>맞닿는 아래첨자 b 가 같아야 한다 · 거꾸로 곱한 T_bc T_wb 는 (5, 2)</Row>
      </Box>
      <Box x={916} y={485} w={940} h={133} at={13} title={<Head>곱하는 자리 · M = x 방향으로 2</Head>}>
        <Row at={13.5}>
          오른쪽 <span style={mono(C.green, 24)}>T_wb M → (3, 3)</span> · 왼쪽 <span style={mono(C.orange, 24)}>M T_wb → (5, 1)</span>
        </Row>
      </Box>
      <Box x={916} y={634} w={940} h={246} at={19.5} title={<Head color={C.accent}>역변환: 원점 위치를 빼고 Rᵀ 로 돌린다</Head>}>
        <Row at={20}>
          <span style={mono(C.accent, 24)}>(2, 3) − (3, 1) = (−1, 2) → −90° → (2, 1)</span>
        </Row>
        <Row at={25.7}>
          translation 칸 = <span style={mono(C.green, 24)}>−Rᵀp = (−1, 3)</span>
        </Row>
        <Row at={27.6} style={line(C.red, 24)}>
          ✕ −p = (−3, −1) 을 넣으면 <span style={mono(C.red, 24)}>(3, −2) + (−3, −1) = (0, −3)</span>
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3D 자세 표현 ----------

function Rpy() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={360} at={0.3} title={<Head color={C.blue}>3D rotation 은 순서가 중요하다</Head>}>
        <Table
          head={['rotation', 'x 축이 가는 곳', 'y 축이 가는 곳', 'z 축이 가는 곳']}
          widths={[150, 210, 210, 210]}
          monoCols={[true, true, true, true]}
          size={22}
          at={0.6}
          step={0.4}
          rows={[
            ['R_x(90°)', '(1, 0, 0)', '(0, 0, 1)', '(0, −1, 0)'],
            ['R_y(90°)', '(0, 0, −1)', '(0, 1, 0)', '(1, 0, 0)'],
            ['R_z(90°)', '(0, 1, 0)', '(−1, 0, 0)', '(0, 0, 1)'],
          ]}
        />
        <div style={{ display: 'grid', gap: 6, marginTop: 4 }}>
          <Row at={2.8}>
            <span style={mono(C.green, 22)}>R_z(90°) R_x(90°): x 축 → (0, 1, 0)</span>
          </Row>
          <Row at={4.4}>
            <span style={mono(C.red, 22)}>R_x(90°) R_z(90°): x 축 → (0, 1, 0) → (0, 0, 1)</span>
          </Row>
        </div>
      </Box>
      <Box x={976} y={140} w={880} h={360} at={7} title={<Head color={C.orange}>숫자 9 개 중 정할 수 있는 것은 3 개</Head>}>
        <Row at={7.4} style={line(C.muted, 24)}>
          열의 길이 1, 서로 직각이라는 조건이 나머지를 정한다
        </Row>
        {(
          [
            ['roll', 'x 축 중심 · 비행기가 날개를 기울인다', C.orange, 9],
            ['pitch', 'y 축 중심 · 코를 들거나 숙인다', C.green, 9.8],
            ['yaw', 'z 축 중심 · 좌우로 방향을 튼다', C.purple, 10.6],
          ] as const
        ).map(([n, d, col, at]) => (
          <Row key={n} at={at}>
            <span style={{ ...mono(col, 24), display: 'inline-block', width: 110 }}>{n}</span>
            {d}
          </Row>
        ))}
      </Box>
      <Box x={64} y={520} w={880} h={360} at={14} title={<Head color={C.green}>URDF 의 rpy: radian 셋 · 고정축 x → y → z</Head>}>
        <Row at={14.5}>
          <span style={mono(C.green, 24)}>90° = π/2 ≈ 1.5708 rad</span>
        </Row>
        <Row at={16.5}>
          <span style={mono(C.text, 24)}>R = R_z(yaw) R_y(pitch) R_x(roll)</span> <span style={line(C.muted, 22)}>나중 rotation 이 왼쪽</span>
        </Row>
        <Row at={18.2} style={line(C.text, 22)}>
          RealSense D435 의 optical frame: <span style={mono(C.orange, 22)}>rpy="-1.5708 0 -1.5708"</span>
        </Row>
        <Row at={19.4} style={line(C.muted, 22)}>
          R_x(−90°) 먼저, R_z(−90°) 나중 → z 는 앞 · x 는 오른쪽 · y 는 아래
        </Row>
      </Box>
      <Card x={976} y={520} w={880} h={360} at={21}>
        <svg width={880} height={360}>
          <text x={28} y={42} fill={C.text} fontSize={24} fontWeight={600}>
            gimbal lock
          </text>
          <text x={852} y={42} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <g opacity={prog(t, 21.3)}>
            {arrow(200, 250, 200, 110, C.purple, 4, 15)}
            {arrow(200, 250, 340, 250, C.orange, 4, 15)}
            <rect x={200} y={230} width={20} height={20} fill="none" stroke={C.muted} strokeWidth={2} />
            <text x={214} y={124} fill={C.purple} fontSize={20} fontWeight={600}>
              yaw 의 축 (z)
            </text>
            <text x={300} y={282} textAnchor="middle" fill={C.orange} fontSize={20} fontWeight={600}>
              roll 의 축 (x)
            </text>
            <text x={200} y={340} textAnchor="middle" fill={C.text} fontSize={21}>
              pitch 0°: 두 축이 직각
            </text>
          </g>
          <g opacity={prog(t, 22.3)}>
            {arrow(380, 190, 470, 190, C.muted, 3)}
            <text x={425} y={176} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO}>
              pitch 90°
            </text>
            {arrow(540, 200, 540, 80, C.purple, 4, 15)}
            {arrow(540, 200, 540, 296, C.orange, 4, 15)}
            <text x={554} y={92} fill={C.purple} fontSize={20} fontWeight={600}>
              yaw 의 축 (z)
            </text>
            <text x={554} y={300} fill={C.orange} fontSize={20} fontWeight={600}>
              roll 의 축 (x → −z)
            </text>
            <text x={540} y={340} textAnchor="middle" fill={C.text} fontSize={21}>
              pitch 90°: 같은 직선 위
            </text>
          </g>
          <g opacity={prog(t, 23.5)}>
            <text x={640} y={172} fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600}>
              (30°, 90°, 0°)
            </text>
            <text x={640} y={206} fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600}>
              = (0°, 90°, −30°)
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Quaternion() {
  const t = useSec()
  const fan = (x0: number, y0: number, rays: [number, number][], color: string, at: number) =>
    rays.map(([deg, len], i) => {
      const a = (deg * Math.PI) / 180
      const ex = x0 + 250 * len * Math.cos(a)
      const ey = y0 - 250 * len * Math.sin(a)
      return (
        <g key={i} opacity={prog(t, at + i * 0.35)}>
          <line x1={x0} y1={y0} x2={ex} y2={ey} stroke={color} strokeWidth={5} strokeLinecap="round" />
          <circle cx={ex} cy={ey} r={7} fill={color} />
        </g>
      )
    })
  const ref = (x0: number, y0: number) => <path d={`M ${x0 + 250} ${y0} A 250 250 0 0 0 ${x0} ${y0 - 250}`} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={245} at={0.3} title={<Head color={C.blue}>axis-angle: 축 하나 + 각도 하나</Head>}>
        <Row at={1.6}>
          <span style={mono(C.text, 22)}>R_z(90°) R_x(90°) × (1, 1, 1) = (1, 1, 1)</span> → 회전축
        </Row>
        <Row at={3.2}>
          세 번 하면 세 축이 제자리 → <span style={mono(C.blue, 24)}>360° ÷ 3 = 120°</span>
        </Row>
        <Row at={4.6} style={line(C.muted, 22)}>
          축은 길이 1 인 unit vector ≈ (0.577, 0.577, 0.577)
        </Row>
      </Box>
      <Box x={976} y={140} w={880} h={245} at={6.5} title={<Head mono color={C.green}>q = (cos θ/2, 축 × sin θ/2)</Head>}>
        <Table
          head={['rotation', 'θ/2', '(w, x, y, z)']}
          widths={[270, 110, 400]}
          monoCols={[false, true, true]}
          size={22}
          at={6.8}
          rowAt={[7.2, 8.4, 10.5]}
          rows={[
            ['아무것도 안 함', '0°', '(1, 0, 0, 0)'],
            ['z 축 90°', '45°', '(0.707, 0, 0, 0.707)'],
            ['(1, 1, 1) 축 120°', '60°', '(0.5, 0.5, 0.5, 0.5)'],
          ]}
        />
      </Box>
      <Box x={64} y={405} w={880} h={260} at={13} title={<Head color={C.orange}>q 와 −q 는 같은 rotation · 칸 순서를 확인한다</Head>}>
        <Row at={13.4} style={line(C.text, 22)}>
          90° 와 90° + 360° 는 θ/2 가 45° 와 225° → 모든 칸의 부호가 반대
        </Row>
        <Table
          head={['소프트웨어', '칸 순서', 'z 축 90°']}
          widths={[250, 170, 360]}
          monoCols={[false, true, true]}
          size={22}
          at={15}
          rowAt={[15.4, 16.6]}
          rows={[
            ['ROS 2 · tf2_echo', 'x, y, z, w', '(0, 0, 0.707, 0.707)'],
            ['MuJoCo · Eigen 생성자', 'w, x, y, z', '(0.707, 0, 0, 0.707)'],
          ]}
        />
      </Box>
      <Box x={64} y={685} w={880} h={195} at={25.5} title={<Head color={C.green}>slerp (Shoemake, 1985)</Head>}>
        <Row at={25.9}>네 칸 공간에서 길이 1 인 두 점을 잇는 원호를 일정한 속도로 따라간다</Row>
        <Row at={28} style={line(C.muted, 22)}>
          q₀ · q₁ 이 음수면 q₁ 의 부호를 바꿔 짧은 호를 고른다 (−q₁ 쪽 긴 호는 270° 를 돈다)
        </Row>
      </Box>
      <Card x={976} y={405} w={880} h={475} at={19.5}>
        <svg width={880} height={475}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            위에서 본 손 · z 축 0° → 90° (t = 0, 0.25, 0.5, 0.75, 1)
          </text>
          <g opacity={prog(t, 19.8)}>
            <text x={40} y={84} fill={C.red} fontSize={22} fontWeight={600}>
              rotation matrix 칸마다 평균
            </text>
            {ref(70, 380)}
            {fan(70, 380, [[0, 1], [18.4, 0.79], [45, 0.707], [71.6, 0.79], [90, 1]], C.red, 20)}
            <text x={40} y={420} fill={C.red} fontSize={20} fontFamily={MONO}>
              t = 0.25: 18.4° · 0.79 배
            </text>
            <text x={40} y={450} fill={C.red} fontSize={20} fontFamily={MONO}>
              t = 0.5: 첫째 열 길이 ≈ 0.707
            </text>
          </g>
          <g opacity={prog(t, 25.8)}>
            <text x={470} y={84} fill={C.green} fontSize={22} fontWeight={600}>
              slerp
            </text>
            {ref(480, 380)}
            {fan(480, 380, [[0, 1], [22.5, 1], [45, 1], [67.5, 1], [90, 1]], C.green, 26)}
            {(
              [
                ['0°', 745, 388],
                ['22.5°', 740, 280],
                ['45°', 680, 190],
                ['67.5°', 592, 130],
                ['90°', 494, 114],
              ] as const
            ).map(([s, x, y]) => (
              <text key={s} x={x} y={y} fill={C.green} fontSize={20} fontFamily={MONO}>
                {s}
              </text>
            ))}
            <text x={470} y={420} fill={C.green} fontSize={20} fontFamily={MONO}>
              0.25 마다 22.5° · 크기 그대로
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- tf2 · 카메라 · odom ----------

function WristCamera() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={700} h={740} at={0.2}>
        <svg width={700} height={420}>
          <text x={28} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            카메라 사진 · optical frame
          </text>
          <text x={672} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <rect x={60} y={80} width={580} height={300} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
          <g opacity={prog(t, 0.6)}>
            {arrow(350, 230, 470, 230, C.accent, 4, 14)}
            {arrow(350, 230, 350, 350, C.accent, 4, 14)}
            <circle cx={350} cy={230} r={13} fill={C.bg} stroke={C.accent} strokeWidth={3} />
            <line x1={341} y1={221} x2={359} y2={239} stroke={C.accent} strokeWidth={3} />
            <line x1={359} y1={221} x2={341} y2={239} stroke={C.accent} strokeWidth={3} />
            <text x={482} y={237} fill={C.accent} fontSize={21} fontWeight={600}>
              x 오른쪽
            </text>
            <text x={364} y={352} fill={C.accent} fontSize={21} fontWeight={600}>
              y 아래
            </text>
            <text x={328} y={206} textAnchor="end" fill={C.accent} fontSize={21} fontWeight={600}>
              z 앞 (사진 안쪽)
            </text>
          </g>
          <g opacity={prog(t, 2.5)}>
            <circle cx={390} cy={196} r={10} fill={C.orange} />
            <text x={408} y={192} fill={C.orange} fontSize={21} fontWeight={600}>
              컵
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 420, width: 640, display: 'grid', gap: 14 }}>
          <Row at={1}>optical frame: z · x · y 축 = 앞 · 오른쪽 · 아래</Row>
          <Row at={1.8} style={line(C.muted, 24)}>
            camera_link: x · y · z 축 = 앞 · 왼쪽 · 위
          </Row>
          <Row at={3}>
            <span style={mono(C.text, 24)}>정면 0.25 · 오른쪽 0.02 · 위쪽 0.01 m</span>
          </Row>
          <Row at={4.2}>
            <span style={mono(C.orange, 24)}>p_c = (0.02, −0.01, 0.25)</span> <span style={line(C.muted, 22)}>위쪽은 y 가 −</span>
          </Row>
        </div>
      </Card>
      <Box x={796} y={140} w={1060} h={180} at={7} title={<Head mono color={C.accent}>p_b = T_be T_ec p_c</Head>}>
        <Row at={9}>
          <span style={mono(C.green, 24)}>T_be</span> gripper 의 pose · 관절 각도로 계산 · 팔이 움직이면 바뀐다
        </Row>
        <Row at={10.8}>
          <span style={mono(C.orange, 24)}>T_ec</span> 카메라를 gripper 에 고정한 자리 · 바뀌지 않는다
        </Row>
      </Box>
      <Box x={796} y={336} w={1060} h={250} at={14} title={<Head>한 frame 씩 바꾸기 (단위 m)</Head>}>
        <Table
          head={['단계', '계산', '결과']}
          widths={[195, 505, 290]}
          monoCols={[false, true, true]}
          size={22}
          at={14.3}
          rowAt={[14.8, 21.4, 23.2]}
          colors={[C.orange, C.green, C.green]}
          rows={[
            ['T_ec 원점 더하기', '(0.02, −0.01, 0.25) + (0, 0.06, 0)', '(0.02, 0.05, 0.25)'],
            ['R_x(180°) 돌리기', '(x, y, z) → (x, −y, −z)', '(0.02, −0.05, −0.25)'],
            ['T_be 원점 더하기', '(0.02, −0.05, −0.25) + (0.4, 0, 0.3)', '(0.42, −0.05, 0.05)'],
          ]}
        />
      </Box>
      <Card x={796} y={602} w={1060} h={278} at={14}>
        <svg width={620} height={278}>
          <text x={28} y={38} fill={C.text} fontSize={22} fontWeight={600}>
            옆에서 본 모식도 (base 의 x–z 평면)
          </text>
          <line x1={40} y1={240} x2={600} y2={240} stroke={C.cardEdge} strokeWidth={2} />
          {arrow(80, 240, 150, 240, C.blue, 3.5, 13)}
          {arrow(80, 240, 80, 170, C.blue, 3.5, 13)}
          <text x={160} y={247} fill={C.blue} fontSize={20} fontWeight={600}>
            x
          </text>
          <text x={92} y={176} fill={C.blue} fontSize={20} fontWeight={600}>
            z
          </text>
          <text x={92} y={268} fill={C.blue} fontSize={20} fontWeight={600}>
            base
          </text>
          <g opacity={prog(t, 21.2)}>
            <rect x={262} y={64} width={36} height={22} rx={5} fill={C.cardEdge} stroke={C.green} strokeWidth={2.5} />
            <line x1={268} y1={86} x2={268} y2={110} stroke={C.green} strokeWidth={4} strokeLinecap="round" />
            <line x1={292} y1={86} x2={292} y2={110} stroke={C.green} strokeWidth={4} strokeLinecap="round" />
            {arrow(280, 96, 280, 162, C.orange, 3, 12)}
            <text x={300} y={152} fill={C.orange} fontSize={20} fontWeight={600}>
              손끝 z (아래)
            </text>
            <text x={318} y={84} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
              gripper (0.4, 0, 0.3)
            </text>
          </g>
          <g opacity={prog(t, 23.4)}>
            <rect x={276} y={200} width={28} height={40} rx={4} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2.5} />
            <circle cx={290} cy={215} r={5} fill={C.accent} />
            <text x={318} y={226} fill={C.accent} fontSize={20} fontFamily={MONO} fontWeight={600}>
              컵 (0.42, −0.05, 0.05)
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 610, top: 60, width: 430, display: 'grid', gap: 12 }}>
          <Row at={16} style={line(C.muted, 22)}>
            T_ec 는 자로 잴 수 없어 Hand-Eye Calibration 으로 구한다
          </Row>
          <Row at={21.4} style={line(C.text, 22)}>
            gripper: x 축으로 180° 회전 · 손끝 z 가 아래
          </Row>
          <Row at={22.2}>
            <span style={mono(C.green, 20)}>R_x(180°): (x, y, z) → (x, −y, −z)</span>
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Odom() {
  const t = useSec()
  // odometry arc: 300 px per m, start at (120, 340); r = 2/π ≈ 0.637 m → 191 px
  const r = 191
  // map–odom plot: 50 px per m, map origin at (120, 700)
  const M = (X: number, Y: number): [number, number] => [120 + 50 * X, 700 - 50 * Y]
  const [ox, oy] = M(5, 1)
  const [rx, ry] = M(5, 3)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={230} at={0.3} title={<Head color={C.accent}>tf2 가 저장하는 것</Head>}>
        <Row at={0.8}>translation 3 개 + quaternion 4 개 · 받은 시각과 함께</Row>
        <Row at={3}>두 시각 사이: translation 은 직선으로, rotation 은 slerp 로 보간</Row>
        <Row at={5} style={line(C.muted, 23)}>
          tf2_echo 는 같은 pose 를 translation · quaternion · rpy · 4×4 행렬로 출력
        </Row>
      </Box>
      <Box x={64} y={386} w={880} h={185} at={7.5} color={`${C.red}88`} title={<Head mono color={C.red} size={26}>TF_DENORMALIZED_QUATERNION</Head>}>
        <Row at={8}>네 칸의 제곱합이 1 에서 0.01 이상 벗어나면 그 변환을 버린다</Row>
        <Row at={10.5}>
          <span style={mono(C.red, 24)}>0.7² + 0.7² = 0.98</span> → 0.707 을 0.7 로 적으면 버려진다
        </Row>
      </Box>
      <Box x={64} y={587} w={880} h={293} at={22} title={<Head mono color={C.orange} size={26}>T_map,odom = T_map,base (T_odom,base)⁻¹</Head>}>
        <Row at={22.4} style={line(C.text, 23)}>
          odometry: odom 의 (2, 0), yaw 0° · 위치 추정: map 의 (5, 3), yaw 90°
        </Row>
        <Table
          head={['단계', '계산', '결과']}
          widths={[210, 370, 230]}
          monoCols={[false, true, true]}
          size={22}
          at={23.5}
          rowAt={[24, 25.6]}
          rows={[
            ['(T_odom,base)⁻¹', '−(2, 0)', '(−2, 0), yaw 0°'],
            ['T_map,base 곱하기', 'R(90°) × (−2, 0) + (5, 3)', '(5, 1), yaw 90°'],
          ]}
        />
      </Box>
      <Card x={976} y={140} w={880} h={740} at={14.5}>
        <svg width={880} height={740}>
          <text x={28} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            1 초 동안 1 m/s 로 가며 90°/s 로 회전
          </text>
          <g opacity={prog(t, 14.8)}>
            <line x1={100} y1={340} x2={520} y2={340} stroke={C.cardEdge} strokeWidth={2} />
            <path d={`M 120 340 A ${r} ${r} 0 0 0 ${120 + r} ${340 - r}`} fill="none" stroke={C.green} strokeWidth={4} />
            <circle cx={120} cy={340} r={7} fill={C.text} />
            {arrow(120 + r, 340 - r, 120 + r, 340 - r - 44, C.green, 3.5, 13)}
            <circle cx={120} cy={340 - r} r={4} fill={C.dim} />
            <line x1={124} y1={340 - r} x2={120 + r - 6} y2={340 - r} stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" />
            <text x={300} y={130} textAnchor="end" fill={C.green} fontSize={20} fontFamily={MONO}>
              r = 2/π ≈ 0.637 m
            </text>
            <text x={328} y={124} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              (0.637, 0.637)
            </text>
            <text x={262} y={312} fill={C.green} fontSize={20}>
              원호 길이 1 m
            </text>
          </g>
          <g opacity={prog(t, 17.5)}>
            <line x1={120} y1={340} x2={412} y2={340} stroke={C.red} strokeWidth={3} strokeDasharray="8 7" />
            <circle cx={420} cy={340} r={8} fill={C.red} />
            <text x={420} y={372} textAnchor="middle" fill={C.red} fontSize={21} fontFamily={MONO} fontWeight={600}>
              (1, 0)
            </text>
            <line x1={420} y1={340} x2={316} y2={157} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <text x={384} y={250} fill={C.red} fontSize={21} fontFamily={MONO} fontWeight={600}>
              0.733 m
            </text>
            <text x={28} y={414} fill={C.muted} fontSize={21}>
              한 조각으로 곧게 계산하면 (1, 0) 에 도착해 0.733 m 어긋난다
            </text>
            <text x={28} y={444} fill={C.muted} fontSize={21}>
              diff_drive_controller 는 회전이 있는 조각을 원호로 계산한다
            </text>
          </g>
          <g opacity={prog(t, 22.2)}>
            <line x1={20} y1={472} x2={860} y2={472} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={28} y={510} fill={C.text} fontSize={24} fontWeight={600}>
              map 과 odom
            </text>
            {grid(120, 700, 50, [0, 6], [0, 3])}
            {axes(120, 700, 0, 50, C.blue)}
            <text x={130} y={730} fill={C.blue} fontSize={20} fontWeight={600}>
              map
            </text>
            {arrow(120, 700, ox - 6, oy + 2, C.dim, 2.5, 11, '6 5')}
            {axes(ox, oy, 90, 45, C.orange)}
            <text x={440} y={657} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              odom: map 의 (5, 1), 90°
            </text>
          </g>
          <g opacity={prog(t, 23.5)}>
            <line x1={ox} y1={oy - 52} x2={rx} y2={ry + 10} stroke={C.orange} strokeWidth={2} strokeDasharray="5 5" />
            <circle cx={rx} cy={ry} r={9} fill={C.accent} />
            {arrow(rx, ry, rx, ry - 36, C.accent, 3, 11)}
            <text x={440} y={556} fill={C.accent} fontSize={20} fontFamily={MONO} fontWeight={600}>
              로봇: odom (2, 0) = map (5, 3)
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'p_a = R_ab p_b + p_ab · R_ab 의 열 = frame b 의 축 · R⁻¹ = Rᵀ', at: 0.6 },
    { tag: script.sections[1], color: C.blue, text: 'T_wc = T_wb T_bc · 역변환의 translation 칸은 −Rᵀp = (−1, 3)', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'pitch 90° 에서 gimbal lock · q 와 −q 는 같은 rotation · slerp 는 22.5° 씩', at: 8.4 },
    { tag: script.sections[3], color: C.red, text: 'p_b = T_be T_ec p_c = (0.42, −0.05, 0.05) · map → odom 은 (5, 1), 90°', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            카메라가 잰 숫자를 몸통 기준 숫자로 바꾸려면 무엇을 알고, 어떤 계산을 해야 할까?
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
  const next = [
    { name: 'Forward Kinematics', sub: '관절 각도가 gripper 의 pose T_be 를 정하는 방법', at: 0.5 },
    { name: 'Camera Geometry', sub: 'optical frame 의 3D 점이 찍히는 pixel', at: 3.7 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 30, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · KINEMATICS · PERCEPTION
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 60 }}>
          {next.map((n) => (
            <Appear key={n.name} at={n.at}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 12, width: 780 }}>
                <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 600 }}>{n.name}</div>
                <Label color={C.muted} size={30}>
                  {n.sub}
                </Label>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={1.5} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/transforms (Modern Robotics 3장 · REP 103 · tf2 · Shoemake 1985)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- pauses ----------

const PauseAxes = () => (
  <PauseWrite
    question="frame b 는 frame a 와 원점이 같고 90° 돌아 있다. frame b 에서 (2, 1) 인 점은 frame a 에서 어디인가?"
    answer={
      <>
        x_b = (0, 1) · y_b = (−1, 0) → 2 × (0, 1) + 1 × (−1, 0) = (−1, 2)
        <br />
        R_ab 의 열이 frame b 의 축이라, 점을 90° 돌린 결과와 같다
      </>
    }
  />
)

const PauseRight = () => (
  <PauseWrite
    question="로봇의 pose T_wb 는 world 의 (3, 1) 에서 90° 회전이다. 'y 방향으로 1' 움직임을 오른쪽에 곱하면 로봇의 새 원점은?"
    answer={
      <>
        오른쪽 곱 = 로봇 자신의 y 축 · R(90°) × (0, 1) = (−1, 0)
        <br />
        (−1, 0) + (3, 1) = (2, 1)
      </>
    }
  />
)

const PauseRpy = () => (
  <PauseWrite
    question="rpy (10°, 90°, 0°) 와 같은 행렬이 되는 rpy 를 roll 이 0° 인 꼴로 하나 적어라."
    answer={
      <>
        pitch 90° 에서는 roll 10° 와 yaw −10° 가 같은 일을 한다
        <br />
        답: (0°, 90°, −10°)
      </>
    }
  />
)

const PauseOdom = () => (
  <PauseWrite
    question="odometry 가 odom 의 (3, 0), yaw 0° 가 되었다. map → odom (90° 회전, (5, 1) 이동) 이 그대로라면 로봇은 map 에서 어디인가?"
    answer={
      <>
        R(90°) × (3, 0) + (5, 1) = (0, 3) + (5, 1) = (5, 4)
        <br />
        odom 의 x 축이 map 의 위쪽을 향해서, 앞으로 1 m 는 map 에서 위로 1 m
      </>
    }
  />
)

export function Transforms() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        frames: Frames,
        rotation: Rotation,
        'pause-axes': PauseAxes,
        homogeneous: Homogeneous,
        'compose-inverse': ComposeInverse,
        'pause-right': PauseRight,
        rpy: Rpy,
        quaternion: Quaternion,
        'pause-rpy': PauseRpy,
        'wrist-camera': WristCamera,
        odom: Odom,
        'pause-odom': PauseOdom,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
