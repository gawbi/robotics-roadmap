import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './policy-gradient.narration.json'
import { script } from './policy-gradient.script'

// Numbers follow lessons/policy-gradient/README.md (see policy-gradient.script.ts). The softmax, J(θ), REINFORCE-step,
// number-line and Gaussian plots are drawn from the lesson's own formulas and numbers.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at }: { children: ReactNode; color?: string; at: number }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap' }}>{children}</span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, fmt, labelW = 200 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap, position: 'relative' }}>
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

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })
const one = (color = C.text, size = 23): CSSProperties => ({ ...line(color, size), whiteSpace: 'nowrap' })

/** one line of a box that fades in at its own second */
function Row({ at, style, children }: { at: number; style: CSSProperties; children: ReactNode }) {
  const t = useSec()
  return <span style={{ ...style, opacity: prog(t, at) }}>{children}</span>
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

interface Col {
  w: number
  mono?: boolean
  right?: boolean
}

/** a text table whose rows each fade in at their own second */
function Tab({ cols, head, rows, at, size = 22 }: { cols: Col[]; head: ReactNode[]; rows: { at: number; color?: string; cells: ReactNode[] }[]; at: number; size?: number }) {
  const t = useSec()
  const cell = (i: number, isHead: boolean): CSSProperties => ({
    width: cols[i].w,
    fontFamily: cols[i].mono && !isHead ? MONO : undefined,
    fontSize: isHead ? size - 2 : size,
    whiteSpace: 'nowrap',
    textAlign: cols[i].right ? 'right' : 'left',
    paddingRight: cols[i].right ? 12 : 0,
  })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted }}>
        {head.map((h, i) => (
          <span key={i} style={cell(i, true)}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, r.at), color: r.color ?? C.text }}>
          {r.cells.map((v, i) => (
            <span key={i} style={cell(i, false)}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const sig = (x: number) => 1 / (1 + Math.exp(-x))
const gauss = (x: number, m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s))
const path = (xs: number[], f: (x: number) => [number, number]) =>
  xs
    .map((x, i) => {
      const [px, py] = f(x)
      return `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`
    })
    .join(' ')
const range = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)
const neg = (v: number) => (v < 0 ? `−${-v}` : `${v}`)

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            REINFORCEMENT LEARNING · RL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Policy Gradient</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            θ ← θ + η × <span style={{ color: C.accent }}>r × ∇ ln π(a)</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            정답 없이 reward 만으로 policy 의 weight 를 고치는 방법
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
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={880} h={330} at={0.3} title={<Head>사족 보행 policy 의 학습</Head>} gap={18}>
        <Row at={0.8} style={one(C.text, 26)}>
          <span style={mono(C.accent, 27)}>0.02</span> 초마다 관절 <span style={mono(C.accent, 27)}>12</span> 개의 목표 각도를 낸다
        </Row>
        <Row at={1.6} style={one(C.red, 26)}>
          “이 순간 무릎은 이 각도” 라는 정답 데이터가 없다
        </Row>
        <Row at={2.4} style={line(C.muted, 23)}>
          받는 것: 명령한 속도를 잘 따라갔는지, 넘어지지 않았는지의 점수
        </Row>
      </Box>
      <Box x={980} y={130} w={880} h={330} at={1.2} color={`${C.green}88`} title={<Head color={C.green}>Rudin 등 (2021)</Head>} gap={18}>
        <Row at={1.6} style={one(C.text, 26)}>
          policy gradient 계열의 알고리즘인 PPO 로
        </Row>
        <Row at={2.2} style={one(C.text, 26)}>
          사족 보행 로봇 ANYmal 의 평지 보행 policy 를
        </Row>
        <Row at={2.8} style={one(C.green, 26)}>
          GPU 하나에서 <span style={mono(C.green, 27)}>4</span> 분 안에 학습했다
        </Row>
      </Box>
      <Appear at={4.4} style={{ position: 'absolute', left: 60, top: 520, width: 1800 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          정답이 없는데 network 의 weight 를
          <br />
          <span style={{ color: C.accent }}>어느 쪽으로 고쳐야 점수가 오를까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 60, top: 730, width: 1800, display: 'flex', justifyContent: 'center' }}>
        <Chip at={5.8}>policy gradient: action 을 확률로 뽑고, 평균보다 좋았던 action 의 확률을 올린다</Chip>
      </div>
    </AbsoluteFill>
  )
}

// ---------- 1. a policy that picks by probability ----------

function Machines({ at }: { at: number }) {
  const t = useSec()
  return (
    <svg width={704} height={170}>
      <g opacity={prog(t, at)}>
        <rect x={2} y={2} width={330} height={164} rx={16} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={2} />
        <text x={26} y={54} fill={C.blue} fontSize={42} fontFamily={MONO} fontWeight={600}>
          A
        </text>
        <text x={26} y={100} fill={C.text} fontSize={23}>
          당길 때마다 동전 1 개
        </text>
        <text x={26} y={142} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
          기댓값 1
        </text>
      </g>
      <g opacity={prog(t, at + 0.8)}>
        <rect x={360} y={2} width={340} height={164} rx={16} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
        <text x={384} y={54} fill={C.green} fontSize={42} fontFamily={MONO} fontWeight={600}>
          B
        </text>
        <text x={384} y={92} fill={C.text} fontSize={22}>
          0.5 의 확률로 동전 4 개
        </text>
        <text x={384} y={120} fill={C.muted} fontSize={21}>
          나머지 경우에는 0 개
        </text>
        <text x={384} y={152} fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600}>
          기댓값 4 × 0.5 = 2
        </text>
      </g>
    </svg>
  )
}

function Softmax() {
  const t = useSec()
  const X = (th: number) => 120 + (th + 3) * 140
  const Y = (p: number) => 520 - p * 400
  const curve = path(range(-3, 3, 120), (th) => [X(th), Y(sig(th))])
  const pts: [number, string][] = [
    [-2, '0.1192'],
    [-1, '0.2689'],
    [0, '0.5'],
    [1, '0.7311'],
    [2, '0.8808'],
  ]
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={760} h={750} at={0.3} title={<Head>슬롯머신 두 대 · 고른 기계가 action</Head>}>
        <Machines at={0.6} />
        <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
          <Row at={7} style={one(C.orange, 25)}>
            argmax policy: 평균이 가장 큰 기계를 확률 1 로
          </Row>
          <Row at={8} style={one(C.text, 23)}>
            <span style={mono(C.text, 24)}>Q(A) = 1</span> 일 때 <span style={mono(C.orange, 24)}>Q(B) 0.99 → 1.01</span>
          </Row>
          <Row at={9} style={one(C.text, 23)}>
            B 를 고를 확률이 <span style={mono(C.red, 24)}>0 → 1</span> 로 뛴다
          </Row>
          <Row at={14.4} style={one(C.red, 23)}>
            그 밖에서는 변화 없음 → gradient 가 거의 어디서나 0
          </Row>
          <div style={{ height: 1, background: C.cardEdge, margin: '6px 0', opacity: prog(t, 21) }} />
          <Row at={21} style={one(C.accent, 25)}>
            softmax: A 의 점수는 0, B 의 점수는 θ
          </Row>
          <Row at={21.8} style={one(C.text, 23)}>
            <span style={mono(C.accent, 25)}>
              π(B) = e<sup>θ</sup> ÷ (1 + e<sup>θ</sup>)
            </span>
          </Row>
        </div>
      </Box>
      <Card x={850} y={130} w={1010} h={750} at={7}>
        <svg width={1010} height={600} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            B 를 고를 확률
          </text>
          <line x1={120} y1={520} x2={960} y2={520} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={120} y1={110} x2={120} y2={520} stroke={C.cardEdge} strokeWidth={2} />
          {[-3, -2, -1, 0, 1, 2, 3].map((th) => (
            <text key={th} x={X(th)} y={554} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {neg(th)}
            </text>
          ))}
          {[
            [0, '0'],
            [0.5, '0.5'],
            [1, '1'],
          ].map(([p, s]) => (
            <text key={s as string} x={106} y={Y(p as number) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          <text x={960} y={588} textAnchor="end" fill={C.muted} fontSize={20}>
            B 의 점수 θ →
          </text>
          <g opacity={prog(t, 7.6)}>
            <path d={`M${X(-3)},${Y(0)} L${X(0)},${Y(0)} L${X(0)},${Y(1)} L${X(3)},${Y(1)}`} fill="none" stroke={C.orange} strokeWidth={4} />
            <text x={X(1.2)} y={Y(1) - 16} fill={C.orange} fontSize={22} fontWeight={600}>
              argmax: 계단
            </text>
          </g>
          <g opacity={prog(t, 14.4)}>
            <text x={X(-1.1)} y={Y(0) - 18} fill={C.red} fontSize={21}>
              기울기 0
            </text>
            <text x={X(0.25)} y={Y(1) + 32} fill={C.red} fontSize={21}>
              기울기 0
            </text>
          </g>
          <g opacity={prog(t, 21.2)}>
            <path d={curve} fill="none" stroke={C.accent} strokeWidth={4} />
            <text x={X(-2.9)} y={Y(0.6)} fill={C.accent} fontSize={22} fontWeight={600}>
              softmax: 곡선
            </text>
          </g>
          {pts.map(([th, s], i) => (
            <g key={th} opacity={prog(t, 22 + i * 0.4)}>
              <circle cx={X(th)} cy={Y(sig(th))} r={8} fill={C.accent} />
              <text
                x={th < 0 ? X(th) - 14 : X(th) + 16}
                y={th < 0 ? Y(sig(th)) - 14 : Y(sig(th)) + 32}
                textAnchor={th < 0 ? 'end' : 'start'}
                fill={C.text}
                fontSize={21}
                fontFamily={MONO}
              >
                {s}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 618 }}>
          <Tab
            at={23}
            size={22}
            cols={[{ w: 150 }, ...pts.map(() => ({ w: 130, mono: true, right: true }))]}
            head={['θ', ...pts.map(([th]) => neg(th))]}
            rows={[
              { at: 23.4, color: C.accent, cells: ['π(B)', ...pts.map(([, s]) => s)] },
              { at: 23.8, color: C.muted, cells: ['π(A)', '0.8808', '0.7311', '0.5', '0.2689', '0.1192'] },
            ]}
          />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Objective() {
  const t = useSec()
  const X = (th: number) => 110 + (th + 4) * 96.25
  const Y = (j: number) => 600 - (j - 1) * 460
  const curve = path(range(-4, 4, 160), (th) => [X(th), Y(1 + sig(th))])
  // tangent at θ = 0: J = 1.5 + 0.25 θ
  const tan = (th: number): [number, number] => [X(th), Y(1.5 + 0.25 * th)]
  const [tx1, ty1] = tan(-1.6)
  const [tx2, ty2] = tan(1.6)
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={940} h={750} at={0.3}>
        <svg width={940} height={650} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            기대 reward
          </text>
          <text x={200} y={48} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
            J(θ) = 1 + π(B)
          </text>
          <line x1={110} y1={600} x2={880} y2={600} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={110} y1={120} x2={110} y2={600} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={110} y1={Y(2)} x2={880} y2={Y(2)} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="5 7" />
          {[-4, -2, 0, 2, 4].map((th) => (
            <text key={th} x={X(th)} y={632} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {neg(th)}
            </text>
          ))}
          {[1, 1.5, 2].map((j) => (
            <text key={j} x={96} y={Y(j) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {j}
            </text>
          ))}
          <text x={880} y={580} textAnchor="end" fill={C.muted} fontSize={20}>
            θ →
          </text>
          <path d={curve} fill="none" stroke={C.accent} strokeWidth={4} />
          <g opacity={prog(t, 6.5)}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={C.orange} strokeWidth={3} strokeDasharray="10 6" />
            <circle cx={X(0)} cy={Y(1.5)} r={9} fill={C.orange} />
            <text x={X(0) - 18} y={Y(1.5) - 18} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              θ = 0, J = 1.5
            </text>
            <text x={tx1 + 12} y={ty1 + 30} fill={C.orange} fontSize={21}>
              기울기 0.25
            </text>
          </g>
          <g opacity={prog(t, 14.4)}>
            {arrow(X(0) + 4, Y(1.5) + 30, X(0.25) + 4, Y(1.5622) + 30, C.green, 3, 10)}
            <circle cx={X(0.25)} cy={Y(1.5622)} r={9} fill={C.green} />
            <text x={X(0.25) + 18} y={Y(1.5622) + 60} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              θ = 0.25
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 660, display: 'grid', gap: 4 }}>
          <Row at={7.4} style={one(C.text, 23)}>
            θ 를 0.01 늘리면 J 는 <span style={mono(C.orange, 24)}>1.5 → 1.5025</span>
          </Row>
          <Row at={9} style={one(C.text, 23)}>
            gradient <span style={mono(C.orange, 24)}>0.0025 ÷ 0.01 = 0.25</span>
          </Row>
        </div>
      </Card>
      <Box x={1030} y={130} w={830} h={190} at={0.8} title={<Head>두 기계의 J</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={1.2} style={mono(C.text, 24)}>
            J = π(A) × 1 + π(B) × 2
          </Row>
          <Row at={2.6} style={one(C.text, 23)}>
            <span style={mono(C.accent, 24)}>= 1 + π(B)</span> · 1 과 2 사이
          </Row>
        </div>
      </Box>
      <Box x={1030} y={340} w={830} h={240} at={13} color={`${C.green}88`} title={<Head color={C.green}>gradient ascent</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={13.4} style={mono(C.green, 26)}>
            θ ← θ + η × ∇J
          </Row>
          <Row at={14.2} style={one(C.text, 23)}>
            loss 는 gradient 를 빼지만, J 는 클수록 좋아 더한다
          </Row>
          <Row at={15.6} style={one(C.text, 23)}>
            η = 1: θ <span style={mono(C.green, 24)}>0 → 0.25</span> · π(B) <span style={mono(C.green, 24)}>0.5 → 0.5622</span>
          </Row>
        </div>
      </Box>
      <Box x={1030} y={600} w={830} h={240} at={19.5} color={`${C.orange}88`} title={<Head color={C.orange}>agent 가 아는 것은 sample 뿐</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={19.9} style={one(C.text, 23)}>
            기계의 기댓값 1 과 2 는 모른다
          </Row>
          <Row at={20.8} style={one(C.text, 23)}>
            아는 것: “B 를 당겨 동전 4 개를 받았다” 같은 결과
          </Row>
          <Row at={22} style={one(C.accent, 23)}>
            → gradient 를 sample 로 추정해야 한다
          </Row>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseSoftmax = () => (
  <PauseWrite
    question={
      <>
        θ = 3 이면 B 를 고를 확률 π(B) 는 얼마일까? (e<sup>3</sup> ≈ 20.09)
      </>
    }
    answer={
      <>
        π(B) = 20.09 ÷ (1 + 20.09) = 20.09 ÷ 21.09 ≈ 0.953
        <br />
        π(A) = 1 ÷ 21.09 ≈ 0.047
      </>
    }
  />
)

// ---------- 2. REINFORCE ----------

function LogTrick() {
  const t = useSec()
  const CX = 470
  const K = 320
  const rows: { y: number; th: string; b: number; a: number; at: number }[] = [
    { y: 140, th: 'θ = 0 · π(B) 0.5, π(A) 0.5', b: 0.5, a: -0.5, at: 6.6 },
    { y: 262, th: 'θ = 2 · π(B) 0.8808, π(A) 0.1192', b: 0.1192, a: -0.8808, at: 8 },
  ]
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={900} h={330} at={0.3} title={<Head>고른 action 의 log-probability gradient</Head>}>
        <Tab
          at={0.8}
          size={24}
          cols={[{ w: 100 }, { w: 160, mono: true, right: true }, { w: 260, mono: true, right: true }, { w: 260, mono: true, right: true }]}
          head={['θ', 'π(B)', 'B: 1 − π(B)', 'A: −π(B)']}
          rows={[
            { at: 1.4, cells: ['0', '0.5', '+0.5', '−0.5'] },
            { at: 6.8, cells: ['2', '0.8808', '+0.1192', '−0.8808'] },
          ]}
        />
        <Row at={2.4} style={one(C.muted, 22)}>
          부호: 그 action 을 더 자주 고르려면 θ 를 움직일 방향
        </Row>
      </Box>
      <Card x={990} y={130} w={870} h={330} at={6.3}>
        <svg width={870} height={330}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            θ 를 움직이는 방향과 크기
          </text>
          <line x1={CX} y1={76} x2={CX} y2={280} stroke={C.cardEdge} strokeWidth={2} strokeDasharray="5 6" />
          {rows.map((r) => (
            <g key={r.th} opacity={prog(t, r.at)}>
              <text x={30} y={r.y - 32} fill={C.muted} fontSize={21} fontFamily={MONO}>
                {r.th}
              </text>
              {arrow(CX, r.y, CX + r.b * K, r.y, C.green, 6, 16)}
              {arrow(CX, r.y, CX + r.a * K, r.y, C.blue, 6, 16)}
              <text x={CX + r.b * K + 12} y={r.y + 8} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
                B +{r.b}
              </text>
              <text x={CX + r.a * K - 12} y={r.y + 8} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
                A {neg(r.a)}
              </text>
            </g>
          ))}
          <text x={435} y={312} textAnchor="middle" fill={C.orange} fontSize={21} opacity={prog(t, 9.6)}>
            드물게 고르는 action 일수록 화살표가 길다
          </text>
        </svg>
      </Card>
      <Box x={60} y={490} w={900} h={390} at={12.2} color={`${C.accent}88`} title={<Head color={C.accent}>log-derivative trick</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Row at={12.6} style={mono(C.text, 24)}>
            ∇π(a) = π(a) × ∇ ln π(a)
          </Row>
          <Row at={13.8} style={one(C.muted, 22)}>
            확률 하나를 밖으로 꺼내면 “확률 × 무언가” 의 합 = 기댓값
          </Row>
          <Row at={15} style={mono(C.accent, 24)}>
            ∇J = E[ q*(a) × ∇ ln π(a) ]
          </Row>
          <div style={{ height: 1, background: C.cardEdge, margin: '6px 0', opacity: prog(t, 18.2) }} />
          <Row at={18.4} style={one(C.text, 23)}>
            모르는 기댓값 q*(a) 자리에 실제로 받은 reward r
          </Row>
          <Row at={19.6} style={one(C.text, 23)}>
            추정 <span style={mono(C.green, 26)}>r × ∇ ln π(a)</span>
          </Row>
        </div>
      </Box>
      <Box x={990} y={490} w={870} h={390} at={24.2} color={`${C.green}88`} title={<Head color={C.green}>θ = 0 에서 일어날 수 있는 세 경우</Head>}>
        <Tab
          at={24.4}
          size={23}
          cols={[{ w: 210 }, { w: 100, mono: true, right: true }, { w: 60, mono: true, right: true }, { w: 170, mono: true, right: true }, { w: 170, mono: true, right: true }]}
          head={['경우', '확률', 'r', '∇ ln π(a)', '추정']}
          rows={[
            { at: 24.8, cells: ['A 를 고름', '0.5', '1', '−0.5', '−0.5'] },
            { at: 25.3, cells: ['B 에서 4 개', '0.25', '4', '+0.5', '+2'] },
            { at: 25.8, cells: ['B 에서 0 개', '0.25', '0', '+0.5', '0'] },
          ]}
        />
        <Row at={26.6} style={mono(C.text, 21)}>
          0.5 × (−0.5) + 0.25 × 2 + 0.25 × 0 = 0.25
        </Row>
        <Row at={27.6} style={one(C.green, 23)}>
          기댓값이 진짜 gradient 0.25 와 같다 (unbiased)
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Reinforce() {
  const t = useSec()
  const vals = [0.5, 0.5498, 0.5362, 0.5362, 0.5819, 0.5677, 0.6095, 0.6095, 0.646]
  const shown = ['0.5', '0.5498', '0.5362', '0.5362', '0.5819', '0.5677', '0.6095', '0.6095', '0.6460']
  const acts = ['출발', 'B 4', 'A', 'B 0', 'B 4', 'A', 'B 4', 'B 0', 'B 4']
  const col = (a: string) => (a === 'A' ? C.blue : a === 'B 4' ? C.green : a === 'B 0' ? C.muted : C.dim)
  const base = 500
  const H = 520
  const bx = (i: number) => 100 + i * 94
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={980} h={750} at={0.3}>
        <svg width={980} height={600} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            π(B) 의 변화 · θ = 0, η = 0.1 에서 여덟 step
          </text>
          <line x1={80} y1={base} x2={950} y2={base} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={80} y1={base - 0.5 * H} x2={950} y2={base - 0.5 * H} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="5 7" />
          <text x={70} y={base - 0.5 * H + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0.5
          </text>
          <text x={70} y={base + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0
          </text>
          {vals.map((v, i) => {
            const at = i === 0 ? 0.6 : i === 1 ? 7.6 : 14 + (i - 2) * 0.35
            const p = prog(t, at, 0.7)
            const hl = (i === 2 || i === 5) && t > 15.2
            return (
              <g key={i} opacity={prog(t, at, 0.3)}>
                <rect x={bx(i)} y={base - v * H * p} width={60} height={v * H * p} rx={6} fill={col(acts[i])} opacity={0.85} stroke={hl ? C.orange : 'none'} strokeWidth={4} />
                <text x={bx(i) + 30} y={base - v * H - 14} textAnchor="middle" fill={C.text} fontSize={19} fontFamily={MONO}>
                  {shown[i]}
                </text>
                <text x={bx(i) + 30} y={base + 30} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {i}
                </text>
                <text x={bx(i) + 30} y={base + 58} textAnchor="middle" fill={col(acts[i])} fontSize={20} fontWeight={600}>
                  {acts[i]}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 610, display: 'grid', gap: 6 }}>
          <Row at={8.4} style={one(C.text, 23)}>
            step 1 · B 에서 4 개: <span style={mono(C.green, 24)}>θ = 0 + 0.1 × 4 × 0.5 = 0.2</span>
          </Row>
          <Row at={10} style={one(C.text, 23)}>
            π(B) <span style={mono(C.green, 24)}>0.5 → 0.5498</span> · B 에서 0 개인 step 3, 7 은 그대로
          </Row>
          <Row at={15.2} style={one(C.orange, 23)}>
            step 2, 5: 더 나쁜 A 를 골랐는데도 A 의 확률이 올랐다
          </Row>
        </div>
      </Card>
      <Box x={1070} y={130} w={790} h={200} at={0.3} title={<Head>REINFORCE (Williams, 1992)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={0.8} style={mono(C.accent, 25)}>
            θ ← θ + η × r × ∇ ln π(a)
          </Row>
          <Row at={2.4} style={one(C.muted, 22)}>
            reward 가 클수록 고른 action 의 확률을 크게 올린다
          </Row>
        </div>
      </Box>
      <Box x={1070} y={350} w={790} h={230} at={14} color={`${C.red}77`} title={<Head color={C.red}>오해: 좋은 action 의 확률만 올린다</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={14.6} style={one(C.text, 23)}>
            reward 가 양수이면 고른 action 은 언제나 확률이 오른다
          </Row>
          <Row at={16} style={one(C.green, 23)}>
            좋은 action 이 더 많이 오를 뿐이다
          </Row>
        </div>
      </Box>
      <Box x={1070} y={600} w={790} h={280} at={21} color={`${C.orange}88`} title={<Head color={C.orange}>여러 step 의 trajectory</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={21.4} style={mono(C.text, 25)}>
            <span style={{ color: C.blue }}>0.6</span> × <span style={{ color: C.orange }}>0.8</span> × <span style={{ color: C.blue }}>0.7</span> × <span style={{ color: C.orange }}>0.8</span> = 0.2688
          </Row>
          <Row at={22.2} style={one(C.blue, 23)}>
            0.6, 0.7: policy 가 정하는 확률
          </Row>
          <Row at={23} style={one(C.orange, 23)}>
            0.8: 미끄러운 바닥(environment) 이 정하는 확률
          </Row>
          <Row at={24.4} style={one(C.accent, 23)}>
            ln 을 씌워 θ 로 미분하면 0.8 의 항은 0
          </Row>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseReinforce = () => (
  <PauseWrite
    question={
      <>
        step 8 뒤 θ = 0.6015, π(B) = 0.6460 이다. 다음 step 에서 A 를 골라 동전 1 개를 받으면 새 θ 는? (η = 0.1)
      </>
    }
    answer={
      <>
        ∇ ln π(A) = −π(B) = −0.6460
        <br />
        θ 의 변화 = 0.1 × 1 × (−0.6460) = −0.0646
        <br />
        새 θ = 0.6015 − 0.0646 = 0.5369
      </>
    }
  />
)

// ---------- 3. baseline and critic ----------

function Baseline() {
  const t = useSec()
  const X = (v: number) => 120 + (v + 1) * 252.3
  const lines: { y: number; label: string; at: number; pts: [number, number, string][] }[] = [
    { y: 180, label: 'baseline 없음', at: 0.4, pts: [[-0.5, 0.5, '0.5'], [0, 0.25, '0.25'], [2, 0.25, '0.25']] },
    { y: 370, label: 'baseline b = 1.5', at: 12.4, pts: [[-0.75, 0.25, '0.25'], [0.25, 0.5, '0.5'], [1.25, 0.25, '0.25']] },
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1000} h={480} at={0.3}>
        <svg width={1000} height={480}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            θ = 0 에서 추정이 나올 수 있는 값
          </text>
          {lines.map((l) => (
            <g key={l.label} opacity={prog(t, l.at)}>
              <text x={30} y={l.y - 62} fill={C.muted} fontSize={22} fontWeight={600}>
                {l.label}
              </text>
              <line x1={100} y1={l.y} x2={960} y2={l.y} stroke={C.cardEdge} strokeWidth={2} />
              <line x1={X(0.25)} y1={l.y - 44} x2={X(0.25)} y2={l.y - 4} stroke={C.accent} strokeWidth={2.5} strokeDasharray="5 4" />
              <text x={X(0.25) + 10} y={l.y - 30} fill={C.accent} fontSize={20} fontFamily={MONO}>
                평균 0.25
              </text>
              {l.pts.map(([v, p, ps]) => (
                <g key={v}>
                  <circle cx={X(v)} cy={l.y} r={p > 0.3 ? 17 : 12} fill={v < 0 ? C.red : C.green} />
                  <text x={X(v)} y={l.y + 46} textAnchor="middle" fill={v < 0 ? C.red : C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                    {v > 0 ? `+${v}` : neg(v)}
                  </text>
                  <text x={X(v)} y={l.y + 72} textAnchor="middle" fill={C.muted} fontSize={20}>
                    확률 {ps}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </Card>
      <Box x={1090} y={130} w={770} h={480} at={0.8} title={<Head>variance 와 틀린 부호</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Row at={1.2} style={one(C.muted, 22)}>
            variance: 평균에서 떨어진 거리의 제곱을 평균한 값
          </Row>
          <Bar label="variance · b 없음" value={1.0625} max={1.1} color={C.red} at={2} width={220} labelW={240} fmt="1.0625" />
          <Bar label="틀린 부호 · b 없음" value={0.5} max={1.1} color={C.red} at={3.4} width={220} labelW={240} fmt="0.5" />
          <div style={{ height: 1, background: C.cardEdge, margin: '4px 0', opacity: prog(t, 6.3) }} />
          <Row at={6.5} style={mono(C.accent, 23)}>
            θ ← θ + η × (r − b) × ∇ ln π(a)
          </Row>
          <Row at={8} style={one(C.text, 22)}>
            <span style={mono(C.text, 22)}>E[∇ ln π(a)] = 0</span> 이라 기댓값은 그대로
          </Row>
          <Bar label="variance · b = 1.5" value={0.5} max={1.1} color={C.green} at={13.6} width={220} labelW={240} fmt="0.5" />
          <Bar label="틀린 부호 · b = 1.5" value={0.25} max={1.1} color={C.green} at={14.6} width={220} labelW={240} fmt="0.25" />
        </div>
      </Box>
      <Box x={60} y={640} w={1800} h={240} at={18.2} color={`${C.orange}88`} title={<Head color={C.orange}>동전을 10 개씩 더 준 문제 · 200 step 학습 × 4000 번</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <Row at={18.6} style={one(C.muted, 22)}>
              π(B) 가 0.5 아래로 끝난 판의 비율
            </Row>
            <Bar label="baseline 없음" value={35.2} max={100} color={C.red} at={19.2} width={360} labelW={270} fmt="35.2%" />
            <Bar label="reward 평균을 baseline" value={0} max={100} color={C.green} at={24.4} width={360} labelW={270} fmt="0%" />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <Row at={19.8} style={one(C.muted, 22)}>
              200 step 뒤 π(B) 의 평균
            </Row>
            <Bar label="baseline 없음" value={0.644} max={1} color={C.red} at={20.6} width={360} labelW={270} fmt="0.644" />
            <Bar label="reward 평균을 baseline" value={0.934} max={1} color={C.green} at={25.2} width={360} labelW={270} fmt="0.934" />
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Critic() {
  const t = useSec()
  const node = (x: number, y: number, title: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={270} height={110} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + 135} y={y + 46} textAnchor="middle" fill={color} fontSize={26} fontWeight={600}>
        {title}
      </text>
      <text x={x + 135} y={y + 82} textAnchor="middle" fill={C.text} fontSize={21}>
        {sub}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={820} h={230} at={0.3} title={<Head>state 의 value 를 baseline 으로</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={0.8} style={one(C.text, 23)}>
            V(s): 지금 policy 로 이 state 에서 받을 return 의 기댓값
          </Row>
          <Row at={2.4} style={one(C.text, 23)}>
            V(s) = 40 에서 return 30, 50 → weight <span style={mono(C.accent, 24)}>−10, +10</span>
          </Row>
          <Row at={4} style={one(C.muted, 22)}>
            V 는 value network 가 받은 return 에 맞춰 배운다
          </Row>
        </div>
      </Box>
      <Box x={60} y={380} w={820} h={220} at={6.3} color={`${C.accent}88`} title={<Head color={C.accent}>advantage</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row at={6.7} style={mono(C.accent, 25)}>
            A(s, a) = Q(s, a) − V(s)
          </Row>
          <Row at={8.4} style={one(C.text, 23)}>
            두 기계 (V = 1.5): 기계 A <span style={mono(C.blue, 24)}>−0.5</span> · 기계 B <span style={mono(C.green, 24)}>+0.5</span>
          </Row>
        </div>
      </Box>
      <Box x={60} y={620} w={820} h={260} at={24.2} title={<Head>세 방법 비교</Head>}>
        <Tab
          at={24.4}
          size={22}
          cols={[{ w: 210 }, { w: 230 }, { w: 140 }, { w: 180 }]}
          head={['방법', 'bias', 'variance', '고치는 시점']}
          rows={[
            { at: 24.8, cells: ['REINFORCE', '없음', '크다', 'episode 끝'] },
            { at: 25.3, cells: ['value baseline', '없음', '줄어든다', 'episode 끝'] },
            { at: 25.8, color: C.orange, cells: ['actor-critic', 'critic 이 틀린 만큼', '가장 작다', 'step 마다'] },
          ]}
        />
      </Box>
      <Card x={910} y={130} w={950} h={750} at={12.2}>
        <svg width={950} height={420} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            actor-critic 의 한 step
          </text>
          {node(50, 90, 'actor', 'action 을 뽑는다', C.blue, 12.4)}
          {node(630, 90, 'environment', 'reward 1 · 다음 state', C.orange, 12.8)}
          {node(340, 290, 'critic', 'V(s) 10 · V(s′) 9.5', C.green, 13.2)}
          <g opacity={prog(t, 12.8)}>{arrow(330, 145, 620, 145, C.muted, 3)}</g>
          <g opacity={prog(t, 13.2)}>{arrow(700, 210, 590, 285, C.muted, 3)}</g>
          <g opacity={prog(t, 13.8)}>{arrow(350, 290, 240, 210, C.accent, 3)}</g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 440, display: 'grid', gap: 8, width: 890 }}>
          <Row at={13.8} style={mono(C.text, 25)}>
            advantage = r + γ × V(s′) − V(s)
          </Row>
          <Row at={15} style={mono(C.green, 25)}>
            = 1 + 0.99 × 9.5 − 10 = 0.405
          </Row>
          <div style={{ marginTop: 10, padding: '16px 22px', borderRadius: 14, background: `${C.red}10`, border: `1.5px solid ${C.red}44`, display: 'grid', gap: 6, opacity: prog(t, 18.6) }}>
            <span style={one(C.text, 23)}>critic 이 V(s′) 를 12 로 틀리게 추정하면</span>
            <span style={mono(C.red, 25)}>1 + 0.99 × 12 − 10 = 2.88</span>
            <span style={{ ...one(C.muted, 22), opacity: prog(t, 24.6) }}>운이 아니라 critic 의 값에서 온 bias · 평균해도 남는다</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseCritic = () => (
  <PauseWrite
    question={
      <>
        r = 1, γ = 0.99, V(s) = 10 이고 진짜 V(s′) = 9.5 다. critic 이 V(s′) 를 7 로 잘못 추정하면 advantage 는?
      </>
    }
    answer={
      <>
        1 + 0.99 × 7 − 10 = −2.07 · 진짜 값은 0.405
        <br />
        작은 쪽으로 치우쳐, 조금 나았던 action 의 확률을 내린다
      </>
    }
  />
)

// ---------- 4. Gaussian policy ----------

/** one joint's Gaussian: mean μ, standard deviation σ, optional sample a */
function Bell({ w, h, mu, sigma, a, at, aAt, shift }: { w: number; h: number; mu: number; sigma: number; a?: number; at: number; aAt?: number; shift?: number }) {
  const t = useSec()
  const X = (v: number) => 60 + ((v + 3) / 6.4) * (w - 120)
  const base = h - 70
  const Y = (p: number) => base - p * (h - 170)
  const curve = path(range(-3, 3.4, 128), (v) => [X(v), Y(gauss(v, mu, sigma))])
  return (
    <svg width={w} height={h + 30}>
      <g opacity={prog(t, at)}>
        <line x1={40} y1={base} x2={w - 30} y2={base} stroke={C.cardEdge} strokeWidth={2} />
        {[-2, -1, 0, 1, 2, 3].map((v) => (
          <text key={v} x={X(v)} y={base + 30} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {neg(v)}
          </text>
        ))}
        <rect x={X(mu - sigma)} y={Y(1) - 10} width={X(mu + sigma) - X(mu - sigma)} height={base - Y(1) + 10} fill={`${C.accent}10`} />
        <path d={curve} fill="none" stroke={C.accent} strokeWidth={4} />
        <line x1={X(mu)} y1={Y(1) - 14} x2={X(mu)} y2={base} stroke={C.accent} strokeWidth={2} strokeDasharray="6 5" />
        <text x={X(mu) - 12} y={Y(1) - 24} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          μ = {mu}
        </text>
        <text x={X(mu - sigma) - 10} y={base - 16} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          μ − σ
        </text>
      </g>
      {a !== undefined && (
        <g opacity={prog(t, aAt ?? at)}>
          <line x1={X(a)} y1={Y(gauss(a, mu, sigma)) - 6} x2={X(a)} y2={base} stroke={C.orange} strokeWidth={3} />
          <circle cx={X(a)} cy={Y(gauss(a, mu, sigma))} r={9} fill={C.orange} />
          <text x={X(a) + 16} y={Y(gauss(a, mu, sigma)) - 12} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
            a = {a}
          </text>
        </g>
      )}
      {a !== undefined && shift !== undefined && (
        <g opacity={prog(t, shift)}>
          {arrow(X(mu) + 4, base + 62, X(a) - 4, base + 62, C.green, 4, 14)}
          <text x={X(a) + 16} y={base + 70} fill={C.green} fontSize={21}>
            advantage &gt; 0
          </text>
        </g>
      )}
    </svg>
  )
}

function Gaussian() {
  const t = useSec()
  const layers: [string, string][] = [
    ['입력', '48'],
    ['hidden', '128'],
    ['hidden', '64'],
    ['hidden', '32'],
    ['평균 μ', '12'],
  ]
  const lx = (i: number) => 30 + i * 186
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1000} h={750} at={0.3}>
        <svg width={1000} height={330} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            ANYmal C 평지 보행 MLP
          </text>
          {layers.map(([name, n], i) => (
            <g key={i} opacity={prog(t, 0.6 + i * 0.4)}>
              <rect x={lx(i)} y={100} width={140} height={130} rx={14} fill={i === 4 ? `${C.accent}18` : C.card} stroke={i === 4 ? C.accent : C.cardEdge} strokeWidth={2} />
              <text x={lx(i) + 70} y={150} textAnchor="middle" fill={i === 4 ? C.accent : C.muted} fontSize={22}>
                {name}
              </text>
              <text x={lx(i) + 70} y={200} textAnchor="middle" fill={i === 4 ? C.accent : C.text} fontSize={34} fontFamily={MONO} fontWeight={600}>
                {n}
              </text>
              {i < 4 && arrow(lx(i) + 146, 165, lx(i + 1) - 6, 165, C.muted, 3, 11)}
            </g>
          ))}
          <g opacity={prog(t, 2.6)}>
            <line x1={lx(1)} y1={256} x2={lx(3) + 140} y2={256} stroke={C.cardEdge} strokeWidth={2} />
            <text x={(lx(1) + lx(3) + 140) / 2} y={290} textAnchor="middle" fill={C.muted} fontSize={21}>
              hidden layer (ELU)
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 340, width: 940, display: 'grid', gap: 12 }}>
          <Row at={3.2} style={one(C.text, 23)}>
            몸 상태와 속도 명령 48 개 → 관절 12 개의 값 · <span style={mono(C.accent, 24)}>0.02</span> 초마다
          </Row>
          <Row at={6.8} style={one(C.orange, 23)}>
            출력이 연속된 숫자 → action 마다 확률을 적을 수 없다
          </Row>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8, opacity: prog(t, 13) }}>
            <div style={{ padding: '18px 22px', borderRadius: 14, background: `${C.accent}10`, border: `1.5px solid ${C.accent}55`, display: 'grid', gap: 6, height: 190, alignContent: 'start' }}>
              <span style={one(C.accent, 24)}>평균 μ</span>
              <span style={line(C.text, 22)}>rsl_rl 의 ActorCritic 에서 MLP 출력 12 개가 관절마다 평균이 된다</span>
            </div>
            <div style={{ padding: '18px 22px', borderRadius: 14, background: `${C.orange}10`, border: `1.5px solid ${C.orange}55`, display: 'grid', gap: 6, height: 190, alignContent: 'start' }}>
              <span style={one(C.orange, 24)}>standard deviation σ</span>
              <span style={line(C.text, 22)}>관절마다 parameter 하나 · state 와 상관없음</span>
              <span style={{ ...line(C.muted, 21), opacity: prog(t, 19.8) }}>init_noise_std = 1.0 에서 시작</span>
            </div>
          </div>
        </div>
      </Card>
      <Card x={1090} y={130} w={770} h={750} at={6.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={{ ...one(C.text, 26), fontWeight: 600 }}>관절 하나의 Gaussian</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 70 }}>
          <Bell w={770} h={400} mu={0.2} sigma={1} a={0.7} at={7} aAt={20.6} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 500, display: 'grid', gap: 10 }}>
          <Row at={8} style={one(C.muted, 22)}>
            평균 μ 와 standard deviation σ 로 정해지는 종 모양
          </Row>
          <Row at={19.8} style={mono(C.orange, 28)}>
            a = μ + σ × ε
          </Row>
          <Row at={21.2} style={one(C.text, 22)}>
            ε: 평균 0, standard deviation 1 인 Gaussian 에서
          </Row>
          <Row at={22.6} style={one(C.text, 22)}>
            예: μ = 0.2, σ = 1, ε = 0.5 → a = 0.7
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Knee() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={1800} h={170} at={0.3} title={<Head>목표 각도 = 기본 각도 + 0.5 × action (action_scale = 0.5)</Head>}>
        <Row at={1.6} style={one(C.text, 24)}>
          σ = 1 인 학습 초기: 목표 각도가 <span style={mono(C.orange, 25)}>0.5 × 1 = 0.5 rad</span> (약 28.6°) 만큼 흩어진다 · 이 흔들림이 exploration
        </Row>
      </Box>
      <Box x={60} y={320} w={1000} h={560} at={7} title={<Head>왼쪽 앞다리 무릎의 한 step (기본 각도 −0.8 rad)</Head>}>
        <Tab
          at={7.2}
          size={23}
          cols={[{ w: 300 }, { w: 380, mono: true }, { w: 230, mono: true, right: true }]}
          head={['단계', '계산', '값']}
          rows={[
            { at: 7.6, cells: ['뽑은 ε (예)', '', '0.5'] },
            { at: 8.6, cells: ['action a = μ + σ × ε', '0.2 + 1 × 0.5', '0.7'] },
            { at: 10, color: C.orange, cells: ['목표 각도', '−0.8 + 0.5 × 0.7', '−0.45 rad'] },
            { at: 14.6, color: C.green, cells: ['평균의 gradient', '(0.7 − 0.2) ÷ 1²', '+0.5'] },
            { at: 21.4, color: C.accent, cells: ['평균만 쓴 목표 각도', '−0.8 + 0.5 × 0.2', '−0.7 rad'] },
          ]}
        />
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <Row at={15.4} style={one(C.text, 23)}>
            Gaussian 의 log-probability 를 평균으로 미분: <span style={mono(C.green, 24)}>(a − μ) ÷ σ²</span>
          </Row>
          <Row at={17} style={one(C.muted, 22)}>
            softmax 의 1 − π(B) 와 같은 역할 · backpropagation 으로 weight 에 전해진다
          </Row>
          <Row at={22.4} style={one(C.accent, 23)}>
            실행할 때는 Gaussian 에서 뽑지 않고 평균 μ 만 쓴다 (act_inference)
          </Row>
        </div>
      </Box>
      <Card x={1090} y={320} w={770} h={560} at={14}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={{ ...one(C.text, 26), fontWeight: 600 }}>μ = 0.2, σ = 1 에서 뽑은 a = 0.7</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 70 }}>
          <Bell w={770} h={370} mu={0.2} sigma={1} a={0.7} at={14.2} aAt={14.6} shift={16} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 470, display: 'grid', gap: 6 }}>
          <Row at={16.6} style={one(C.green, 22)}>
            advantage 가 양수면 μ 를 a 쪽으로, 음수면 반대쪽으로
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseGauss = () => (
  <PauseWrite
    question={
      <>
        한 관절에서 μ = −0.1, σ = 0.5 이고 뽑힌 action 이 a = 0.4 다. 평균의 gradient 는? advantage 가 음수면 μ 는?
      </>
    }
    answer={
      <>
        (a − μ) ÷ σ² = 0.5 ÷ 0.25 = 2
        <br />
        advantage 가 음수라 μ 가 줄어 0.4 에서 멀어진다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items: { tag: string; color: string; text: ReactNode; at: number }[] = [
    { tag: script.sections[0], color: C.accent, text: 'softmax 는 θ 를 조금 바꾸면 확률도 조금 바뀐다 · θ = 0 의 gradient 0.25', at: 0.8 },
    { tag: script.sections[1], color: C.green, text: 'θ ← θ + η × r × ∇ ln π(a) · environment 의 이동 확률은 빠진다', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'baseline 은 variance 1.0625 → 0.5 · actor-critic 은 더 작은 variance 대신 bias', at: 8.4 },
    { tag: script.sections[3], color: C.purple, text: 'MLP 출력 12 개 = Gaussian 의 평균 μ · σ 는 parameter · 실행할 때는 μ 만', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            정답 없이 weight 를 어느 쪽으로 고쳐야 점수가 오를까?
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
            NEXT · RL
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>PPO</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            같은 데이터로 여러 번 고치면서 policy 가 한 번에 너무 바뀌지 않게 막기
          </Label>
        </Appear>
        <Appear at={3.6}>
          <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 600, marginTop: 16 }}>World Model</div>
        </Appear>
        <Appear at={4}>
          <Label color={C.muted} size={30}>
            environment 가 움직이는 방식을 배워 직접 움직여 보는 횟수를 줄이기
          </Label>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 40, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/policy-gradient (Williams · Sutton 등 · Mnih 등 · Rudin 등 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function PolicyGradient() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        softmax: Softmax,
        objective: Objective,
        'pause-softmax': PauseSoftmax,
        'log-trick': LogTrick,
        reinforce: Reinforce,
        'pause-reinforce': PauseReinforce,
        baseline: Baseline,
        critic: Critic,
        'pause-critic': PauseCritic,
        gaussian: Gaussian,
        knee: Knee,
        'pause-gauss': PauseGauss,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
