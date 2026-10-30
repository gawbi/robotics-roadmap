import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './bandit-mdp.narration.json'
import { script } from './bandit-mdp.script'

// Numbers follow lessons/bandit-mdp/README.md and its figures (see bandit-mdp.script.ts). The 3×3 gridworld is the lesson's:
// cells 1 ~ 9 from the top left, 3 is the charger (+1, end), 5 the stairs (−1, end), 7 the start.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, fmt, sub, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * Math.abs(value) * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
      {sub && <span style={{ fontSize: 21, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
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

function Flow({ steps, color, at, gap = 0.4 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 28, color: C.muted, opacity: prog(t, at + i * gap + 0.2) }}>→</span>}
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

const line = (color = C.text, size = 23): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 25): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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
function Table({ head, rows, widths, at, step = 0.5, size = 24, colors, rowAt }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; rowAt?: number[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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

// ---------- the 3×3 gridworld ----------

/** top-left corner of cell i (1 ~ 9) */
const cellXY = (i: number, x0: number, y0: number, s: number) => ({ x: x0 + ((i - 1) % 3) * s, y: y0 + Math.floor((i - 1) / 3) * s })
const centre = (i: number, x0: number, y0: number, s: number) => {
  const { x, y } = cellXY(i, x0, y0, s)
  return { x: x + s / 2, y: y + s / 2 }
}

/** the nine cells with the charger and the stairs marked; `num` shows each cell's number in its corner */
function GridCells({ x0, y0, s, num = true, numSize = 22 }: { x0: number; y0: number; s: number; num?: boolean; numSize?: number }) {
  return (
    <g>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const { x, y } = cellXY(i, x0, y0, s)
        const fill = i === 3 ? `${C.green}26` : i === 5 ? `${C.red}26` : C.bg
        const stroke = i === 3 ? C.green : i === 5 ? C.red : C.cardEdge
        return (
          <g key={i}>
            <rect x={x + 3} y={y + 3} width={s - 6} height={s - 6} rx={10} fill={fill} stroke={stroke} strokeWidth={2} />
            {num && (
              <text x={x + 14} y={y + 12 + numSize} fill={C.dim} fontSize={numSize} fontFamily={MONO} fontWeight={600}>
                {i}
              </text>
            )}
          </g>
        )
      })}
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
            RL · BANDITS & MDPS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Bandits & MDPs</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            점수만 보고 배우기 · <span style={{ color: C.accent }}>exploration · return · value</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            입력마다 정답 label 이 없고, 행동한 뒤에 받는 reward 로 행동을 배우는 문제
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

/** FetchReach's sparse reward against the fingertip's distance to the goal; 0.3 m spans 90 → 840 px */
function SparseStep({ t, at }: { t: number; at: number }) {
  const X = (m: number) => 90 + (m / 0.3) * 750
  const y0 = 110
  const y1 = 250
  return (
    <svg width={900} height={330}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, at)}>
        FetchReach 의 점수 (한 번 움직일 때마다)
      </text>
      <g opacity={prog(t, at + 0.3)}>
        <line x1={X(0)} y1={y1 + 30} x2={X(0.3)} y2={y1 + 30} stroke={C.cardEdge} strokeWidth={2} />
        <text x={56} y={y0 + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
          0
        </text>
        <text x={44} y={y1 + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
          −1
        </text>
        {[0, 0.1, 0.2, 0.3].map((m) => (
          <text key={m} x={X(m)} y={y1 + 64} textAnchor="middle" fill={C.dim} fontSize={21} fontFamily={MONO}>
            {m === 0.3 ? '0.3 m' : m}
          </text>
        ))}
        <polyline points={`${X(0)},${y0} ${X(0.05)},${y0} ${X(0.05)},${y1} ${X(0.3)},${y1}`} fill="none" stroke={C.orange} strokeWidth={5} strokeLinejoin="round" />
        <text x={X(0.05) + 22} y={y0 + 46} fill={C.green} fontSize={22} fontWeight={600}>
          목표에서 0.05 m 안 → 0 점
        </text>
        <text x={X(0.3)} y={y1 - 18} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
          그 밖은 어디든 −1 점
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  const facts: [ReactNode, number][] = [
    [<>팔은 1초에 <span style={mono(C.blue, 24)}>25</span> 번 움직이고, <span style={mono(C.blue, 24)}>50</span> 번 움직이면 시도 하나가 끝난다</>, 0.9],
    [<>목표 근처에 닿기 전에는 어떻게 움직이든 점수가 똑같이 <span style={mono(C.orange, 24)}>−1</span></>, 1.8],
    [<>점수는 목표에 닿고 나서야 달라진다</>, 2.7],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={330} at={0.4}>
        <SparseStep t={t} at={0.5} />
      </Card>
      <Box x={996} y={140} w={860} h={330} at={0.6} title={<Head color={C.muted} size={24}>Gymnasium-Robotics 의 FetchReach · 손끝을 공중의 목표점에</Head>}>
        {facts.map(([s, at], i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ color: C.accent, fontSize: 24, fontWeight: 700 }}>•</span>
            <span style={line(C.text, 24)}>{s}</span>
          </div>
        ))}
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          끝에서야 점수가 달라지면, <span style={{ color: C.accent }}>지나온 움직임 가운데 무엇이 좋았을까?</span>
        </div>
      </Appear>
      <Card x={64} y={680} w={1792} h={200} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 14, opacity: prog(t, 5.8) }}>
          <span style={line(C.text, 24)}>
            reinforcement learning: 지금부터 앞으로 받을 점수를 모두 더한 값을 상황마다 계산하고, 끝의 점수를 앞 상황으로 거슬러 전한다 (Bellman 식)
          </span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 6.6) }}>
            ETH Zurich 의 legged_gym: 사족 보행 로봇이 <span style={mono(C.blue, 23)}>0.02</span> 초마다 관절 목표를 내고, 늦게 받는 점수는 <span style={mono(C.blue, 23)}>0.99</span> 배씩 깎아 더한다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. ε-greedy · UCB ----------

/** ε = 0.1 at one step once the estimates are right: 0.9 to the best estimate, 0.1 to a random pick split between A and B */
function EpsTree({ t, at }: { t: number; at: number }) {
  const node = (x: number, y: number, w: number, label: string, color: string, o: number) => (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={56} rx={12} fill={`${color}18`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  return (
    <svg width={880} height={330}>
      {node(30, 150, 150, '한 step', C.accent, prog(t, at))}
      {arrow(180, 165, 352, 86, C.green, 3, 11, prog(t, at + 0.4))}
      {arrow(180, 192, 352, 266, C.orange, 3, 11, prog(t, at + 0.4))}
      {node(360, 50, 270, '0.9 · B (추정값 최대)', C.green, prog(t, at + 0.7))}
      {node(360, 236, 270, '0.1 · 무작위로 하나', C.orange, prog(t, at + 0.7))}
      {arrow(630, 254, 690, 216, C.orange, 2.5, 9, prog(t, at + 1))}
      {arrow(630, 282, 690, 306, C.orange, 2.5, 9, prog(t, at + 1))}
      {node(698, 186, 160, 'A · 0.05', C.orange, prog(t, at + 1.2))}
      {node(698, 274, 160, 'B · 0.05', C.orange, prog(t, at + 1.2))}
    </svg>
  )
}

function Greedy() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} gap={16} title={<Head>슬롯머신 두 대 · 레버를 100 번 당긴다</Head>}>
        <Table
          head={['기계', '결과와 확률', '기댓값']}
          widths={[90, 340, 360]}
          size={22}
          at={0.6}
          rows={[
            ['A', '1 개 (확률 1)', '1 × 1 = 1'],
            ['B', '4 개 (0.5) · 0 개 (0.5)', '4 × 0.5 + 0 × 0.5 = 2'],
          ]}
          colors={[C.blue, C.green]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.6) }}>B 는 한 번에 2 개를 주는 일이 없지만, 오래 당기면 한 번에 평균 2 개를 준다</span>
      </Box>
      <Box x={64} y={490} w={880} h={390} at={6} gap={12} title={<Head color={C.orange}>추정값 Q 와 greedy 의 함정</Head>}>
        <span style={line(C.text, 23)}>
          Q(a) = 그 arm 에서 지금까지 받은 reward 의 평균 · 진짜 기댓값은 모른다
        </span>
        <div style={{ display: 'grid', gap: 8, opacity: prog(t, 11.7) }}>
          <span style={mono(C.blue, 24)}>첫 시도 A → 1 개 · Q(A) = 1</span>
          <span style={mono(C.red, 24)}>첫 시도 B → 0 개 · Q(B) = 0</span>
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13) }}>greedy 는 Q 가 큰 A 만 당겨서, Q(B) 를 고칠 기회가 오지 않는다</span>
        <span style={{ ...line(C.red, 23), opacity: prog(t, 14.5) }}>B 의 첫 결과가 0 일 확률 0.5 → 절반의 확률로 더 좋은 B 를 버린다</span>
      </Box>
      <Card x={976} y={140} w={880} h={500} at={17.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head>ε = 0.1 인 ε-greedy 의 한 step (추정값이 잡힌 뒤)</Head>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 64 }}>
          <EpsTree t={t} at={17.7} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 400, display: 'grid', gap: 8, opacity: prog(t, 20) }}>
          <span style={mono(C.green, 24)}>B: 0.9 + 0.05 = 0.95 · A: 0.05</span>
          <span style={mono(C.text, 24)}>기댓값 0.95 × 2 + 0.05 × 1 = 1.95</span>
        </div>
      </Card>
      <Box x={976} y={660} w={880} h={220} at={23.8} gap={10} title={<Head color={C.red}>✕ exploration 을 많이 할수록 잘 배운다</Head>}>
        <Bar label="ε = 0.1" value={1.95} max={2} color={C.green} at={24.2} width={340} labelW={120} fmt="1.95" />
        <Bar label="ε = 0.5" value={1.75} max={2} color={C.orange} at={25} width={340} labelW={120} fmt="1.75" sub="0.75 × 2 + 0.25 × 1" />
        <Bar label="ε = 1" value={1.5} max={2} color={C.red} at={25.8} width={340} labelW={120} fmt="1.5" sub="매번 무작위" />
      </Box>
    </AbsoluteFill>
  )
}

/** Q + bonus stacked for three arms at t = 100, c = 2; 150 px per unit, baseline at y 560 */
function UcbBars({ t }: { t: number }) {
  const base = 560
  const k = 150
  const arms = [
    { name: 'A', n: 80, q: 1.5, b: 0.48, sum: '1.98', x: 110 },
    { name: 'B', n: 15, q: 1.2, b: 1.11, sum: '2.31', x: 360 },
    { name: 'C', n: 5, q: 0.5, b: 1.92, sum: '2.42', x: 610 },
  ]
  const W = 150
  return (
    <svg width={900} height={600} style={{ position: 'absolute', left: 0, top: 0 }}>
      <line x1={70} y1={base} x2={830} y2={base} stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 0.6)} />
      {arms.map((a, i) => {
        const pq = prog(t, 6.2 + i * 0.4, 0.8)
        const pb = prog(t, 7.6 + i * 0.4, 0.8)
        const hq = a.q * k * pq
        const hb = a.b * k * pb
        const top = base - hq - hb
        return (
          <g key={a.name}>
            <rect x={a.x} y={base - hq} width={W} height={hq} fill={C.blue} opacity={0.85} />
            <rect x={a.x} y={top} width={W} height={hb} fill={C.orange} opacity={0.85} />
            <text x={a.x + W / 2} y={base - (a.q * k) / 2 + 9} textAnchor="middle" fill={C.bg} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={pq}>
              {a.q}
            </text>
            <text x={a.x + W / 2} y={base - a.q * k - (a.b * k) / 2 + 9} textAnchor="middle" fill={C.bg} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={pb}>
              +{a.b}
            </text>
            <text x={a.x + W / 2} y={top - 14} textAnchor="middle" fill={a.name === 'C' ? C.accent : C.text} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.8 + i * 0.3)}>
              {a.sum}
            </text>
            <text x={a.x + W / 2} y={base + 34} textAnchor="middle" fill={C.muted} fontSize={23} opacity={prog(t, 0.6)}>
              {`${a.name} · N ${a.n}`}
            </text>
          </g>
        )
      })}
      {prog(t, 12.2) > 0 && <rect x={604} y={base - 2.42 * k - 50} width={162} height={2.42 * k + 54} rx={10} fill="none" stroke={C.accent} strokeWidth={3} opacity={prog(t, 12.2)} />}
    </svg>
  )
}

function Ucb() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <UcbBars t={t} />
        <div style={{ position: 'absolute', left: 30, top: 24, display: 'grid', gap: 12 }}>
          <span style={mono(C.text, 28)}>
            고를 arm = argmax [ Q(a) + c √(ln t ÷ N(a)) ]
          </span>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', opacity: prog(t, 6) }}>
            <span style={mono(C.muted, 22)}>t = 100 · c = 2</span>
            <span style={{ ...mono(C.blue, 22) }}>■ 추정값 Q</span>
            <span style={{ ...mono(C.orange, 22) }}>■ bonus</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 630, width: 840, display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.accent, 23), opacity: prog(t, 12.4) }}>추정값이 가장 작은 C 를 고른다 · 덜 당긴 arm 일수록 bonus 가 크다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.5) }}>N(a) 가 4 배가 되면 bonus 가 절반 · 한 번도 안 당긴 arm 은 먼저 한 번씩</span>
        </div>
      </Card>
      <Box x={996} y={140} w={860} h={740} at={17.5} gap={14} title={<Head>arm 10 개 · 문제 2000 개를 1000 step 씩 푼 평균</Head>}>
        <span style={line(C.muted, 22)}>세 전략 모두 추정값 0 에서 시작 · UCB 의 c = 2</span>
        <Head color={C.text} size={24}>
          마지막 100 step 의 평균 reward
        </Head>
        <Bar label="greedy" value={1.04} max={1.6} color={C.red} at={18.6} width={380} labelW={200} fmt="1.04" />
        <Bar label="ε-greedy (0.1)" value={1.39} max={1.6} color={C.orange} at={19.2} width={380} labelW={200} fmt="1.39" />
        <Bar label="UCB" value={1.5} max={1.6} color={C.green} at={19.8} width={380} labelW={200} fmt="1.50" />
        <div style={{ height: 6 }} />
        <Head color={C.text} size={24}>
          가장 좋은 arm 을 고른 비율
        </Head>
        <Bar label="greedy" value={37} max={100} color={C.red} at={24} width={380} labelW={200} fmt="37%" />
        <Bar label="ε-greedy (0.1)" value={80} max={100} color={C.orange} at={24.6} width={380} labelW={200} fmt="80%" />
        <Bar label="UCB" value={86} max={100} color={C.green} at={25.2} width={380} labelW={200} fmt="86%" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.5) }}>실행할 때마다 0.03 안팎으로 달라진다 · ε-greedy 는 끝까지 섞이는 무작위 선택 때문에 91% 를 넘지 못한다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseUcb = () => (
  <PauseWrite
    question="c = 1 이고 ln t = 4 다. arm X 는 Q = 2, N = 16 이고 arm Y 는 Q = 1, N = 1 이다. UCB 와 greedy 는 각각 어느 arm 을 고를까?"
    answer={
      <>
        X: 1 × √(4 ÷ 16) = 0.5 → 2 + 0.5 = 2.5 · Y: 1 × √(4 ÷ 1) = 2 → 1 + 2 = 3
        <br />
        UCB 는 Y 를 고르고, greedy 는 Q 가 큰 X 를 고른다
      </>
    }
  />
)

// ---------- 2. MDP · reward · γ ----------

function GridScene() {
  const t = useSec()
  const s = 180
  const x0 = 80
  const y0 = 100
  const c = (i: number) => centre(i, x0, y0, s)
  const slip = prog(t, 7.2) * (1 - prog(t, 13.8, 0.4))
  const path = prog(t, 20.8, 1.2)
  const p2 = c(2)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={700} h={740} at={0.3}>
        <svg width={700} height={740}>
          <text x={30} y={56} fill={C.text} fontSize={26} fontWeight={600}>
            3×3 gridworld · 로봇 청소기
          </text>
          <GridCells x0={x0} y0={y0} s={s} />
          <text x={c(3).x + 10} y={c(3).y + 14} textAnchor="middle" fill={C.green} fontSize={26} fontWeight={700}>
            충전기
          </text>
          <text x={c(3).x + 10} y={c(3).y + 50} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
            +1 · 끝
          </text>
          <text x={c(5).x} y={c(5).y + 14} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={700}>
            계단
          </text>
          <text x={c(5).x} y={c(5).y + 50} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO}>
            −1 · 끝
          </text>
          <text x={c(7).x} y={c(7).y + 62} textAnchor="middle" fill={C.accent} fontSize={24} fontWeight={700}>
            출발
          </text>
          <g opacity={slip}>
            {arrow(p2.x + 20, p2.y - 30, p2.x + 120, p2.y - 30, C.green, 4)}
            {arrow(p2.x, p2.y - 10, p2.x, p2.y - 78, C.muted, 3)}
            {arrow(p2.x, p2.y + 16, p2.x, p2.y + 120, C.red, 3)}
            <text x={p2.x + 46} y={p2.y - 44} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0.8
            </text>
            <text x={p2.x - 54} y={p2.y - 28} fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0.1
            </text>
            <text x={p2.x + 14} y={p2.y + 70} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0.1
            </text>
          </g>
          <g opacity={path}>
            <polyline points={[7, 4, 1, 2].map((i) => `${c(i).x},${c(i).y}`).join(' ') + ` ${c(3).x - 70},${c(3).y}`} fill="none" stroke={C.green} strokeWidth={5} strokeLinejoin="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - path)} />
            {arrow(c(3).x - 90, c(3).y, c(3).x - 62, c(3).y, C.green, 5, 14, path)}
            <polyline points={`${c(7).x + 30},${c(7).y + 20} ${c(8).x},${c(8).y + 20} ${c(8).x},${c(5).y + 100}`} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="10 8" opacity={path} />
            {arrow(c(8).x, c(5).y + 120, c(8).x, c(5).y + 92, C.red, 4, 12, path)}
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 666, width: 640 }}>
          <span style={line(C.muted, 22)}>격자 밖으로 나가려는 이동은 제자리에 머문다</span>
        </div>
      </Card>
      <Box x={796} y={140} w={1060} h={200} at={0.6} title={<Head>MDP 의 재료</Head>}>
        <span style={line(C.text, 23)}>state: 칸 1 ~ 9 · action: 위 · 아래 · 왼쪽 · 오른쪽</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.5) }}>칸 3 (+1) 과 칸 5 (−1) 는 terminal state · 들어가면 episode 가 끝난다</span>
      </Box>
      <Box x={796} y={360} w={1060} h={230} at={7} title={<Head color={C.orange}>미끄러운 바닥의 transition · 칸 2 에서 오른쪽</Head>}>
        <span style={line(C.text, 23)}>
          <span style={mono(C.green, 24)}>P(3 | 2, 오른쪽) = 0.8</span> · 위쪽 벽에 막혀 칸 2 에 <span style={mono(C.muted, 24)}>0.1</span> · 칸 5 에 <span style={mono(C.red, 24)}>0.1</span>
        </span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 9.5) }}>바로 받는 reward 의 기댓값 1 × 0.8 + 0 × 0.1 + (−1) × 0.1 = 0.7</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>계단 바로 옆을 지나는 위험만큼 1 보다 작다</span>
      </Box>
      <Box x={796} y={610} w={1060} h={270} at={14} gap={10} title={<Head color={C.green}>return · γ = 0.9</Head>}>
        <span style={mono(C.text, 24)}>G = r₁ + γ r₂ + γ² r₃ + ⋯ (늦게 받을수록 γ 를 한 번 더 곱한다)</span>
        <Bar label="4 step · 짧은 길" value={0.729} max={1} color={C.green} at={21} width={420} labelW={260} fmt="0.729" sub="0.9³ × 1" />
        <Bar label="6 step · 돌아가는 길" value={0.59} max={1} color={C.blue} at={22.6} width={420} labelW={260} fmt="≈ 0.590" sub="0.9⁵ × 1" />
        <Bar label="칸 8 을 지나 계단" value={0.9} max={1} color={C.red} at={24.2} width={420} labelW={260} fmt="−0.9" sub="0.9 × (−1)" />
      </Box>
    </AbsoluteFill>
  )
}

/** FetchReach's two rewards against distance; 0.3 m spans 90 → 940 px, 0 at y 90 and −1 at y 300 */
function ReachRewards({ t }: { t: number }) {
  const X = (m: number) => 90 + (m / 0.3) * 850
  const Y = (r: number) => 90 - r * 210
  return (
    <svg width={1000} height={380}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12)}>
        FetchReach 의 두 reward · 손끝과 목표 사이 거리
      </text>
      <g opacity={prog(t, 12.2)}>
        <line x1={X(0)} y1={Y(-1) + 20} x2={X(0.3)} y2={Y(-1) + 20} stroke={C.cardEdge} strokeWidth={2} />
        <text x={58} y={Y(0) + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
          0
        </text>
        <text x={46} y={Y(-1) + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
          −1
        </text>
        {[0, 0.1, 0.2, 0.3].map((m) => (
          <text key={m} x={X(m)} y={Y(-1) + 54} textAnchor="middle" fill={C.dim} fontSize={21} fontFamily={MONO}>
            {m === 0.3 ? '0.3 m' : m}
          </text>
        ))}
        <polyline points={`${X(0)},${Y(0)} ${X(0.05)},${Y(0)} ${X(0.05)},${Y(-1)} ${X(0.3)},${Y(-1)}`} fill="none" stroke={C.orange} strokeWidth={5} strokeLinejoin="round" />
        <text x={X(0.05) + 24} y={Y(-1) - 18} fill={C.orange} fontSize={22} fontWeight={600}>
          sparse (기본값): 0.05 m 밖은 어디든 −1
        </text>
        <circle cx={X(0.1)} cy={Y(-1)} r={8} fill={C.orange} />
        <circle cx={X(0.2)} cy={Y(-1)} r={8} fill={C.orange} />
      </g>
      <g opacity={prog(t, 18.2)}>
        <line x1={X(0)} y1={Y(0)} x2={X(0.3)} y2={Y(-0.3)} stroke={C.blue} strokeWidth={5} />
        <circle cx={X(0.1)} cy={Y(-0.1)} r={8} fill={C.blue} />
        <circle cx={X(0.2)} cy={Y(-0.2)} r={8} fill={C.blue} />
        <text x={X(0.1) - 40} y={Y(-0.1) + 50} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.1 m → −0.1
        </text>
        <text x={X(0.2) - 40} y={Y(-0.2) + 50} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.2 m → −0.2
        </text>
        <text x={X(0.3)} y={Y(-0.3) - 70} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
          dense: 거리에 마이너스
        </text>
      </g>
    </svg>
  )
}

function Horizon() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={330} at={0.3} gap={12} title={<Head>γ 는 초가 아니라 step 마다 곱한다 · 곱하는 수 γⁿ 이 0.5 가 되는 때</Head>}>
        <Table
          head={['control 주기', 'γ', '0.5 까지 step', '0.5 까지 시간', '1 ÷ (1 − γ) step 의 시간']}
          widths={[420, 200, 300, 320, 420]}
          size={25}
          at={0.6}
          rowAt={[1, 6.3, 8.4]}
          rows={[
            ['0.02 초 (50 Hz) · legged_gym', '0.99', '69', '1.38 초', '2 초'],
            ['0.005 초 (200 Hz)', '0.99', '69', '0.34 초', '0.5 초'],
            ['0.005 초 (200 Hz)', '0.9975', '277', '1.38 초', '2 초'],
          ]}
          colors={[C.green, C.red, C.green]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 8) }}>
          200 Hz 에서 γ 를 그대로 두면 내다보는 시간이 4 분의 1 · 네 step 이 50 Hz 의 한 step 과 같도록 γ⁴ ≈ 0.99 인 0.9975 로 올린다
        </span>
      </Box>
      <Card x={64} y={500} w={1000} h={380} at={12}>
        <ReachRewards t={t} />
      </Card>
      <Box x={1096} y={500} w={760} h={380} at={24} gap={10} title={<Head color={C.red}>잘못된 shaping · Ng, Harada, Russell (1999)</Head>}>
        <span style={line(C.text, 22)}>simulation 속 자전거가 목표에 다가갈 때마다 양의 reward 를 받고, 멀어질 때는 penalty 가 없었다</span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 25.5) }}>→ 출발점 근처에서 작은 원을 계속 돈다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26.8) }}>고친 꼴: shaping 점수 = 다음 state 의 점수 − 지금 state 의 점수</span>
        <span style={{ ...line(C.green, 22), opacity: prog(t, 27.8) }}>한 바퀴 돌면 합이 0 → 원을 돌 이유가 사라지고 최적 policy 는 그대로</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseHz = () => (
  <PauseWrite
    question="로봇이 25 Hz 로 action 을 내고 γ = 0.96 으로 학습한다. 0.96¹⁷ ≈ 0.50 일 때 몇 초 뒤의 reward 가 절반이 될까? 100 Hz 로 바꾸며 같은 시간을 지키려면 γ 는?"
    answer={
      <>
        한 step 은 1 ÷ 25 = 0.04 초 → 17 × 0.04 = 0.68 초
        <br />
        25 Hz 의 한 step 동안 100 Hz 는 네 step → γ⁴ = 0.96 · 0.99⁴ ≈ 0.961 → γ ≈ 0.99
      </>
    }
  />
)

// ---------- 3. Bellman 과 value ----------

function Bellman() {
  const t = useSec()
  const chain = [
    { cell: 7, v: '0.729', at: 16.1 },
    { cell: 4, v: '0.81', at: 15.5 },
    { cell: 1, v: '0.9', at: 14.9 },
    { cell: 2, v: '1', at: 14.3 },
    { cell: 3, v: '0', at: 13.7 },
  ]
  const bw = 230
  const gap = 110
  const x0 = (1792 - (5 * bw + 4 * gap)) / 2
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={300} at={0.3}>
        <svg width={1792} height={300}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            가장 짧은 길 7 → 4 → 1 → 2 → 3 의 value · 미끄럽지 않은 바닥, γ = 0.9
          </text>
          {chain.map((c, i) => {
            const x = x0 + i * (bw + gap)
            const end = c.cell === 3
            return (
              <g key={c.cell}>
                <rect x={x} y={80} width={bw} height={150} rx={16} fill={end ? `${C.green}20` : C.bg} stroke={end ? C.green : C.cardEdge} strokeWidth={2} />
                <text x={x + bw / 2} y={116} textAnchor="middle" fill={end ? C.green : C.muted} fontSize={23}>
                  {end ? '칸 3 · 충전기' : `칸 ${c.cell}`}
                </text>
                <text x={x + bw / 2} y={180} textAnchor="middle" fill={C.accent} fontSize={44} fontFamily={MONO} fontWeight={600} opacity={prog(t, c.at)}>
                  {c.v}
                </text>
                {end && (
                  <text x={x + bw / 2} y={216} textAnchor="middle" fill={C.green} fontSize={20}>
                    들어갈 때 +1
                  </text>
                )}
                {i < 4 && arrow(x + bw + 16, 155, x + bw + gap - 16, 155, C.muted, 3, 12)}
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 246, opacity: prog(t, 16.6) }}>
          <span style={line(C.muted, 23)}>앞 칸의 value = reward + 0.9 × 다음 칸의 value · 끝의 reward 1 이 한 칸씩 앞으로 전해진다</span>
        </div>
      </Card>
      <Box x={64} y={470} w={880} h={410} at={0.5} title={<Head color={C.blue}>value V(s)</Head>}>
        <span style={line(C.text, 23)}>그 칸에서 출발해 policy 를 따를 때 받을 return 의 기댓값</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3) }}>칸 2 에 서 있는 것만으로 받는 reward 는 없다 · V(2) = 1 은 앞으로 받을 return 이 1 이라는 뜻</span>
        <span style={{ ...mono(C.accent, 25), opacity: prog(t, 7.3) }}>V(4) = 0 + 0.9 × V(1) = 0 + 0.9 × 0.9 = 0.81</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 13.8) }}>이 관계가 Bellman 식 (Richard Bellman, 1957 년 Dynamic Programming) · 도착 칸이 확률로 정해지면 도착 확률로 평균한다</span>
      </Box>
      <Box x={976} y={470} w={880} h={410} at={20.5} gap={16} title={<Head color={C.green}>Q(1, a): 칸 1 에서 action a 를 먼저 하면</Head>}>
        <Table
          head={['칸 1 의 action', '도착 칸', 'Q(1, a)']}
          widths={[220, 160, 420]}
          at={20.8}
          rows={[
            ['오른쪽', '2', '0 + 0.9 × 1 = 0.9'],
            ['아래', '4', '0 + 0.9 × 0.81 = 0.729'],
            ['위 · 왼쪽', '1 (벽)', '0 + 0.9 × 0.9 = 0.81'],
          ]}
          colors={[C.green, undefined, undefined]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.5) }}>
          가장 큰 0.9 가 최적 value <span style={mono(C.green, 24)}>V*(1)</span> · 그 값을 내는 오른쪽이 칸 1 의 가장 좋은 action
        </span>
        <span style={{ ...mono(C.muted, 23), opacity: prog(t, 25) }}>V*(s) = max Q(s, a)</span>
      </Box>
    </AbsoluteFill>
  )
}

/** sweep k of value iteration on the non-slippery grid: values of cells 1, 2, 4, 6, 7, 8, 9 */
const SWEEPS: Record<number, string>[] = [
  { 1: '0', 2: '1', 4: '0', 6: '1', 7: '0', 8: '0', 9: '0' },
  { 1: '0.9', 2: '1', 4: '0', 6: '1', 7: '0', 8: '0', 9: '0.9' },
  { 1: '0.9', 2: '1', 4: '0.81', 6: '1', 7: '0', 8: '0.81', 9: '0.9' },
  { 1: '0.9', 2: '1', 4: '0.81', 6: '1', 7: '0.729', 8: '0.81', 9: '0.9' },
]

function MiniSweep({ k, t, at }: { k: number; t: number; at: number }) {
  const s = 100
  const vals = SWEEPS[k - 1]
  const prev = k > 1 ? SWEEPS[k - 2] : {}
  return (
    <g opacity={prog(t, at)}>
      <text x={150} y={22} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
        {`sweep ${k}`}
      </text>
      <GridCells x0={0} y0={40} s={s} num={false} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const c = centre(i, 0, 40, s)
        if (i === 3 || i === 5)
          return (
            <text key={i} x={c.x} y={c.y + 8} textAnchor="middle" fill={i === 3 ? C.green : C.red} fontSize={21}>
              {i === 3 ? '충전기' : '계단'}
            </text>
          )
        const fresh = vals[i] !== (prev as Record<number, string>)[i] && vals[i] !== '0'
        return (
          <text key={i} x={c.x} y={c.y + 9} textAnchor="middle" fill={fresh ? C.accent : vals[i] === '0' ? C.dim : C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
            {vals[i]}
          </text>
        )
      })}
    </g>
  )
}

/** γ = 0.99 on the slippery floor: the four cells beside the stairs point at the far wall */
function SlipPolicy({ t, at }: { t: number; at: number }) {
  const s = 62
  const x0 = 24
  const y0 = 70
  const dirs: Record<number, [number, number][]> = { 1: [[1, 0]], 2: [[0, -1]], 4: [[-1, 0]], 6: [[1, 0]], 7: [[0, -1], [1, 0]], 8: [[0, 1]], 9: [[0, -1]] }
  const wall = [2, 4, 6, 8]
  return (
    <svg width={440} height={300}>
      <text x={24} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        γ = 0.99 · 미끄러운 바닥
      </text>
      <g opacity={prog(t, at + 0.3)}>
        <GridCells x0={x0} y0={y0} s={s} num={false} />
        {Object.entries(dirs).map(([k, ds]) => {
          const c = centre(Number(k), x0, y0, s)
          const col = wall.includes(Number(k)) ? C.orange : C.muted
          return (
            <g key={k}>
              {ds.map(([dx, dy], j) => arrow(c.x - dx * 14, c.y - dy * 14, c.x + dx * 20, c.y + dy * 20, col, 3, 10))}
            </g>
          )
        })}
      </g>
      <g opacity={prog(t, at + 1)}>
        <text x={240} y={110} fill={C.orange} fontSize={21} fontWeight={600}>
          계단 옆 네 칸은
        </text>
        <text x={240} y={142} fill={C.orange} fontSize={21} fontWeight={600}>
          벽 쪽을 가리킨다
        </text>
        <text x={240} y={190} fill={C.muted} fontSize={20}>
          직각으로 미끄러져도
        </text>
        <text x={240} y={218} fill={C.muted} fontSize={20}>
          계단에 안 빠진다
        </text>
      </g>
    </svg>
  )
}

function Sweeps() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={420} at={6.3}>
        <svg width={1792} height={420}>
          {[1, 2, 3, 4].map((k) => (
            <g key={k} transform={`translate(${96 + (k - 1) * 430}, 40)`}>
              <MiniSweep k={k} t={t} at={6.6 + (k - 1) * 1.1} />
            </g>
          ))}
          {[1, 2, 3].map((k) => (
            <g key={k} opacity={prog(t, 7.2 + (k - 1) * 1.1)}>{arrow(96 + k * 430 - 112, 230, 96 + k * 430 - 30, 230, C.muted, 3, 12)}</g>
          ))}
        </svg>
      </Card>
      <Box x={64} y={580} w={880} h={300} at={0.3} gap={12} title={<Head color={C.accent}>value iteration · 모든 value 를 0 에서 시작</Head>}>
        <span style={mono(C.text, 24)}>
          V<sub>k+1</sub>(s) = max<sub>a</sub> Σ P(s′ | s, a) [ r + γ V<sub>k</sub>(s′) ]
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2) }}>sweep 한 번 = 모든 칸을 직전 sweep 의 값만으로 다시 계산 · 칸 3 과 5 는 언제나 0</span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 12.7) }}>sweep 5: 바뀌는 값이 없다 → Bellman residual = 0 → 멈춘다</span>
      </Box>
      <Box x={976} y={580} w={420} h={300} at={18} gap={12} title={<Head color={C.orange}>미끄러운 바닥의 residual</Head>}>
        <span style={mono(C.orange, 23)}>0.7 → 0.504 → 0.263 → ⋯</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.5) }}>줄기만 하고 0 이 되지 않는다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21) }}>
          0.0001 보다 작아지면 멈춤 → <span style={mono(C.green, 23)}>sweep 12</span>
        </span>
      </Box>
      <Card x={1416} y={580} w={440} h={300} at={24}>
        <SlipPolicy t={t} at={24.2} />
      </Card>
    </AbsoluteFill>
  )
}

const PauseSweep = () => (
  <PauseWrite
    question="미끄럽지 않은 바닥, γ = 0.9 에서 value iteration 을 할 때 sweep 3 이 끝난 뒤에도 칸 7 의 값이 0 인 이유는? 칸 7 은 몇 번째 sweep 에서 값을 얻을까?"
    answer={
      <>
        sweep 3 은 직전 값 V<sub>2</sub> 만 본다 · V<sub>2</sub>(4) = V<sub>2</sub>(8) = 0 → 위 · 오른쪽 모두 0 + 0.9 × 0 = 0
        <br />
        0.81 은 sweep 3 에서 막 생긴 값 → sweep 4: V<sub>4</sub>(7) = 0.9 × 0.81 = 0.729
      </>
    }
  />
)

// ---------- 4. Q-learning ----------

/** one update on a number line: 0.3 → 1.0 spans 80 → 800 px */
function TdLine({ t, at }: { t: number; at: number }) {
  const X = (v: number) => 80 + ((v - 0.3) / 0.7) * 720
  const y = 230
  const move = prog(t, at + 2, 1)
  return (
    <svg width={880} height={400}>
      <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, at)}>
        update 한 번 · α = 0.1
      </text>
      <g opacity={prog(t, at + 0.2)}>
        <line x1={X(0.3)} y1={y} x2={X(1)} y2={y} stroke={C.cardEdge} strokeWidth={3} />
        <circle cx={X(0.5)} cy={y} r={10} fill={C.blue} />
        <text x={X(0.5)} y={y - 30} textAnchor="middle" fill={C.blue} fontSize={23} fontFamily={MONO} fontWeight={600}>
          Q 0.5
        </text>
        <circle cx={X(0.9)} cy={y} r={10} fill={C.green} />
        <text x={X(0.9)} y={y - 30} textAnchor="middle" fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600}>
          target 0.9
        </text>
      </g>
      <g opacity={prog(t, at + 1)}>
        <line x1={X(0.5)} y1={130} x2={X(0.9)} y2={130} stroke={C.orange} strokeWidth={2.5} />
        <line x1={X(0.5)} y1={122} x2={X(0.5)} y2={140} stroke={C.orange} strokeWidth={2.5} />
        <line x1={X(0.9)} y1={122} x2={X(0.9)} y2={140} stroke={C.orange} strokeWidth={2.5} />
        <text x={(X(0.5) + X(0.9)) / 2} y={112} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          TD error = 0.9 − 0.5 = 0.4
        </text>
      </g>
      <g opacity={prog(t, at + 2)}>
        <circle cx={X(0.5 + 0.04 * move)} cy={y} r={10} fill={C.accent} />
        <text x={X(0.54)} y={y + 50} textAnchor="middle" fill={C.accent} fontSize={23} fontFamily={MONO} fontWeight={600}>
          새 Q 0.54
        </text>
        <text x={X(0.3)} y={340} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
          0.1 × 0.4 = 0.04 만큼 이동
        </text>
      </g>
    </svg>
  )
}

function QUpdate() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={270} at={0.3} gap={14} title={<Head>알 수 있는 것 · 겪은 경험 하나하나</Head>}>
        <Flow steps={['칸 s', 'action a', 'reward r', '도착 칸 s′']} color={C.blue} at={0.6} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.5) }}>transition 확률 P(s′ | s, a) 는 모른다 (바닥이 얼마나 미끄러운지)</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.2) }}>
          Q 표: 칸 7 개 × action 4 개 = <span style={mono(C.accent, 24)}>28</span> 칸 · 경험 하나마다 한 칸을 고친다
        </span>
      </Box>
      <Box x={976} y={140} w={880} h={270} at={11.5} gap={12} title={<Head color={C.accent}>Q-learning 의 update 식</Head>}>
        <span style={mono(C.text, 25)}>Q(s, a) ← Q(s, a) + α [ target − Q(s, a) ]</span>
        <span style={{ ...mono(C.green, 25), opacity: prog(t, 12.6) }}>
          target = r + γ · max<sub>a′</sub> Q(s′, a′)
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.5) }}>TD error = target − Q(s, a) · s′ 이 terminal state 이면 target = r</span>
      </Box>
      <Card x={64} y={430} w={880} h={450} at={17.5}>
        <TdLine t={t} at={17.7} />
      </Card>
      <Box x={976} y={430} w={880} h={450} at={23.5} gap={14} title={<Head color={C.orange}>같은 칸에 target 이 1, 1, −1, 1, 1 로 들어오면</Head>}>
        <span style={line(C.muted, 22)}>미끄러운 바닥의 Q(2, 오른쪽) · 0.8 의 확률로 충전기 (1), 0.1 의 확률로 계단 (−1)</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.3) }}>
          <span style={mono(C.red, 24)}>α = 1 → 1</span> · 마지막 target 을 그대로 베낀다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 25.1) }}>
          <span style={mono(C.orange, 24)}>α = 0.5 → 0.72</span> · 덜 흔들린다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 25.9) }}>
          <span style={mono(C.green, 24)}>α = 1/n → (1 + 1 − 1 + 1 + 1) ÷ 5 = 0.6</span> · 평균
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.2) }}>Q 가 배울 것은 target 의 기댓값이므로 α 를 1 보다 작게 잡는다</span>
      </Box>
    </AbsoluteFill>
  )
}

function OffPolicy() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={420} at={0.3} gap={16} title={<Head>데이터를 모으는 policy 와 배우는 policy</Head>}>
        <span style={{ ...line(C.muted, 22) }}>Q 가 가장 큰 action 만 고르면 처음 찾은 길만 되풀이해 다른 칸을 끝내 겪지 못한다</span>
        <div style={{ display: 'grid', gap: 6, opacity: prog(t, 2.5) }}>
          <span style={mono(C.orange, 24)}>모으는 policy · ε-greedy</span>
          <span style={line(C.text, 23)}>가끔 무작위 action 을 섞어 다른 칸도 겪는다</span>
        </div>
        <div style={{ display: 'grid', gap: 6, opacity: prog(t, 7) }}>
          <span style={mono(C.green, 24)}>배우는 policy · greedy</span>
          <span style={line(C.text, 23)}>target 에는 다음에 실제로 고를 action 이 아니라 max Q 를 쓴다</span>
        </div>
        <span style={{ ...line(C.accent, 24), fontWeight: 600, opacity: prog(t, 9.5) }}>둘이 다르다 → off-policy</span>
      </Box>
      <Box x={976} y={140} w={880} h={420} at={13.5} gap={14} title={<Head color={C.accent}>α = 1 · 같은 길 7 → 4 → 1 → 2 → 3 을 되풀이</Head>}>
        <Table
          head={['episode', 'Q(7, 위)', 'Q(4, 위)', 'Q(1, 오른쪽)', 'Q(2, 오른쪽)']}
          widths={[110, 150, 150, 180, 180]}
          size={23}
          at={13.8}
          step={0.9}
          rows={[
            ['1', '0', '0', '0', '1'],
            ['2', '0', '0', '0.9', '1'],
            ['3', '0', '0.81', '0.9', '1'],
            ['4', '0.729', '0.81', '0.9', '1'],
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18) }}>값이 episode 마다 한 칸씩 출발 쪽으로 거슬러 올라온다 · value iteration 이 sweep 마다 채운 숫자와 같다</span>
      </Box>
      <Box x={64} y={590} w={1792} h={290} at={20.5} gap={14} title={<Head color={C.green}>α = 0.5 · ε = 0.2 · episode 3000 개 (미끄럽지 않은 격자)</Head>}>
        <span style={line(C.text, 23)}>칸마다 가장 큰 Q 가 value iteration 의 V* 와 같아진다</span>
        <div style={{ display: 'flex', gap: 16, opacity: prog(t, 22) }}>
          {[
            ['1', '0.9'],
            ['2', '1'],
            ['4', '0.81'],
            ['6', '1'],
            ['7', '0.729'],
            ['8', '0.81'],
            ['9', '0.9'],
          ].map(([c, v]) => (
            <span key={c} style={{ padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${C.green}77`, background: `${C.green}14`, ...mono(C.green, 23) }}>
              {`V*(${c}) ${v}`}
            </span>
          ))}
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>표는 칸 9 개 격자에서나 한 장이면 된다 · 보행 로봇의 state 는 연속된 숫자 48 개라 칸을 셀 수 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseQ = () => (
  <PauseWrite
    question="칸 1 에서 실수로 아래를 골라 칸 4 로 갔다. 칸 4 의 Q 는 위 0.81 · 아래 0.6 · 왼쪽 0.7 · 오른쪽 −1, Q(1, 아래) = 0.5, γ = 0.9, α = 0.5. 다음에 왼쪽을 고를 예정이면 target 과 새 Q(1, 아래) 는?"
    answer={
      <>
        target = 0 + 0.9 × 0.81 = 0.729 (다음에 고를 왼쪽 0.7 이 아니라 가장 큰 값)
        <br />
        TD error 0.729 − 0.5 = 0.229 → 새 Q = 0.5 + 0.5 × 0.229 ≈ 0.6145
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'ε-greedy · UCB', color: C.accent, text: '무작위 선택 ε 또는 덜 당긴 arm 의 bonus · 평균 reward 1.04 → 1.39 → 1.50', at: 0.5 },
    { tag: 'MDP · reward · γ', color: C.blue, text: '50 Hz · γ 0.99 → 약 1.4 초 뒤 절반 · 주기를 바꾸면 γ 도 · reward 가 행동을 정한다', at: 4.4 },
    { tag: 'Bellman 과 value', color: C.orange, text: 'reward + γ × 다음 칸 value · 1 → 0.9 → 0.81 → 0.729 · P 를 알면 value iteration', at: 8.4 },
    { tag: 'Q-learning', color: C.green, text: 'P 없이 경험으로 Q ← Q + α (target − Q) · max Q 를 쓰는 off-policy', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            끝에서야 점수가 달라지면, 지나온 움직임 가운데 무엇이 좋았는지 어떻게 알까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
            NEXT · RL
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600 }}>Policy Gradient · DQN → SAC</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            value 를 거치지 않고 policy 를 직접 고치기 · 표 대신 neural network 로 Q 를 계산하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/bandit-mdp (Sutton & Barto · Auer 외 · Ng 외 · Watkins & Dayan · legged_gym)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function BanditMdp() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        greedy: Greedy,
        ucb: Ucb,
        'pause-ucb': PauseUcb,
        grid: GridScene,
        horizon: Horizon,
        'pause-hz': PauseHz,
        bellman: Bellman,
        sweeps: Sweeps,
        'pause-sweep': PauseSweep,
        'q-update': QUpdate,
        'off-policy': OffPolicy,
        'pause-q': PauseQ,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
