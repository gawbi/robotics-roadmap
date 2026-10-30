import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './ppo.narration.json'
import { script } from './ppo.script'

// Numbers follow lessons/ppo/README.md (see ppo.script.ts). The reward curve in the question scene is schematic (marked
// 모식도); the sigmoid, clip, GAE-weight and decay plots are drawn from the lesson's own formulas and numbers.

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
function Bar({ label, value, max, color, at, width = 520, fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
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

function Flow({ steps, color, at, gap = 0.5 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
    </div>
  )
}

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })
const one = (color = C.text, size = 23): CSSProperties => ({ ...line(color, size), whiteSpace: 'nowrap' })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11) {
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
  /** the column fades in at this second instead of with its row */
  at?: number
}

/** a text table; each column sets its width, font and alignment, and may fade in on its own */
function Tab({ cols, head, rows, at, step = 0.5, size = 22, colors }: { cols: Col[]; head: ReactNode[]; rows: ReactNode[][]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number, isHead: boolean): CSSProperties => ({
    width: cols[i].w,
    fontFamily: cols[i].mono && !isHead ? MONO : undefined,
    fontSize: isHead ? size - 2 : size,
    whiteSpace: 'nowrap',
    textAlign: cols[i].right ? 'right' : 'left',
    paddingRight: cols[i].right ? 12 : 0,
    opacity: cols[i].at === undefined ? 1 : prog(t, cols[i].at as number),
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
        <div key={k} style={{ display: 'flex', opacity: prog(t, at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            REINFORCEMENT LEARNING · PPO
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 140, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>PPO</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            Proximal Policy Optimization · <span style={{ color: C.accent }}>clip ε = 0.2</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            한 번 모은 데이터로 여러 epoch 학습하면서 policy 의 변화를 묶어 두는 RL 알고리즘
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
  const draw = prog(t, 0.6, 3)
  const curve = 'M80,330 L130,310 L170,318 L210,280 L250,286 L290,240 L330,250 L370,200 L410,206 L450,160 L490,150 L520,120 L560,330 L620,322 L680,332 L740,318 L800,328 L840,322'
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={400} at={0.3}>
        <svg width={900} height={400}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            policy gradient 의 reward
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <line x1={70} y1={350} x2={860} y2={350} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={70} y1={90} x2={70} y2={350} stroke={C.cardEdge} strokeWidth={2} />
          <text x={860} y={382} textAnchor="end" fill={C.muted} fontSize={20}>
            update 횟수 →
          </text>
          <path d={curve} fill="none" stroke={C.accent} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <g opacity={prog(t, 2.6)}>
            <text x={585} y={200} fill={C.red} fontSize={22} fontWeight={600}>
              갑자기 떨어짐
            </text>
            <text x={600} y={296} fill={C.red} fontSize={21}>
              다시 올라오지 않음
            </text>
          </g>
        </svg>
      </Card>
      <Box x={996} y={140} w={860} h={400} at={1.2} title={<Head color={C.orange}>learning rate 를 줄이면</Head>}>
        <div style={{ display: 'grid', gap: 18 }}>
          <span style={{ ...line(C.text, 26), opacity: prog(t, 1.6) }}>붕괴는 줄지만 학습이 느려진다</span>
          <span style={{ ...line(C.text, 26), opacity: prog(t, 2.4) }}>비싸게 모은 데이터는 여전히 한 번 쓰고 버린다</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 3.2) }}>같은 데이터로 여러 번 고치면 한 번에 크게 고친 것과 비슷한 효과가 난다</span>
        </div>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 575, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          한 번 모은 데이터로 여러 번 고치면서도
          <br />
          <span style={{ color: C.accent }}>policy 가 한 번에 망가지지 않게 막을 수는 없을까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 64, top: 790, width: 1792, display: 'flex', justifyContent: 'center', gap: 24 }}>
        <Chip at={5.8}>PPO: 확률 비를 0.8 ~ 1.2 근처로 묶고 같은 데이터로 여러 epoch</Chip>
        <Chip at={6.4} color={C.green}>
          Rudin 등 (2021): GPU 한 장 · ANYmal 수천 대 · 평지 보행 4 분 안에
        </Chip>
      </div>
    </AbsoluteFill>
  )
}

// ---------- 1. one big update ----------

function BigStep() {
  const t = useSec()
  const rows: [string, string, number, string, string][] = [
    ['0.1', '−0.075', 0.4813, '0.4813', '약 481 번'],
    ['1', '−0.75', 0.3208, '0.3208', '약 321 번'],
    ['10', '−7.5', 0.000553, '0.000553', '약 0.55 번'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={740} at={0.3} title={<Head>슬롯머신 두 대 · θ 하나로 고르는 policy</Head>}>
        <svg width={800} height={190}>
          <g opacity={prog(t, 0.6)}>
            <rect x={10} y={10} width={360} height={170} rx={16} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={2} />
            <text x={34} y={62} fill={C.blue} fontSize={44} fontFamily={MONO} fontWeight={600}>
              A
            </text>
            <text x={34} y={110} fill={C.text} fontSize={24}>
              당길 때마다 동전 1 개
            </text>
            <text x={34} y={152} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              기댓값 1
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <rect x={420} y={10} width={370} height={170} rx={16} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
            <text x={444} y={62} fill={C.green} fontSize={44} fontFamily={MONO} fontWeight={600}>
              B
            </text>
            <text x={444} y={100} fill={C.text} fontSize={23}>
              0.5 의 확률로 동전 4 개
            </text>
            <text x={444} y={130} fill={C.muted} fontSize={22}>
              나머지 경우에는 0 개
            </text>
            <text x={444} y={164} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              기댓값 4 × 0.5 = 2
            </text>
          </g>
        </svg>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...one(C.text, 24), opacity: prog(t, 2.6) }}>
            B 를 고를 확률 <span style={mono(C.accent, 25)}>π(B) = e<sup>θ</sup> ÷ (1 + e<sup>θ</sup>)</span> · θ 가 0 이면 반반
          </span>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 3.6) }}>
            update: <span style={mono(C.text, 24)}>θ ← θ + η × advantage × ∇ ln π(a)</span>
          </span>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 8, padding: '18px 22px', borderRadius: 14, background: `${C.red}10`, border: `1.5px solid ${C.red}44`, opacity: prog(t, 6.6) }}>
          <span style={one(C.red, 24)}>θ = 0 에서 B 를 골랐는데 0 개 (운이 나쁨)</span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 7.4) }}>
            평균 reward <span style={mono(C.text, 24)}>0.5 × 1 + 0.5 × 2 = 1.5</span>
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 8.4) }}>
            advantage <span style={mono(C.red, 24)}>0 − 1.5 = −1.5</span>
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 9.4) }}>
            <span style={mono(C.text, 24)}>∇ ln π(B) = 1 − 0.5 = 0.5</span>
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 10.6) }}>
            θ 의 변화 <span style={mono(C.orange, 24)}>η × (−1.5) × 0.5 = −0.75η</span>
          </span>
        </div>
      </Box>
      <Box x={948} y={140} w={908} h={740} at={13} title={<Head color={C.orange}>learning rate η 만 바꾼 한 번의 update</Head>}>
        <Tab
          at={13.3}
          cols={[{ w: 130 }, { w: 170, mono: true, right: true }, { w: 210, mono: true, right: true }, { w: 280, right: true }]}
          head={['η', '새 θ', '새 π(B)', '1000 번 중 B']}
          rows={rows.map(([e, th, , p, n]) => [<span style={{ fontFamily: MONO }}>{e}</span>, th, p, n])}
          colors={[C.text, C.text, C.red]}
          size={26}
        />
        <div style={{ display: 'grid', gap: 14, marginTop: 10 }}>
          <span style={{ ...one(C.muted, 22), opacity: prog(t, 14.6) }}>B 를 고를 확률 (출발은 θ = 0 의 0.5)</span>
          {rows.map(([e, , v, p], i) => (
            <Bar key={e} label={`η = ${e}`} value={v} max={0.5} color={i === 2 ? C.red : C.green} at={15 + i * 0.8} width={420} labelW={120} fmt={p} />
          ))}
        </div>
        <div style={{ marginTop: 10, padding: '18px 22px', borderRadius: 14, background: `${C.red}12`, border: `1.5px solid ${C.red}55`, display: 'grid', gap: 8, opacity: prog(t, 19.8) }}>
          <span style={one(C.red, 24)}>η = 10: 더 좋은 기계 B 를 거의 버린다</span>
          <span style={line(C.text, 23)}>다음 데이터에는 B 가 더 좋다는 정보가 거의 들어오지 않는다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function NoRecover() {
  const t = useSec()
  const X = (th: number) => 110 + (th + 8) * 59.29
  const Y = (p: number) => 560 - p * 440
  const pts = Array.from({ length: 141 }, (_, i) => -8 + i * 0.1)
  const path = pts.map((th, i) => `${i ? 'L' : 'M'}${X(th).toFixed(1)},${Y(sig(th)).toFixed(1)}`).join(' ')
  const seg = (a: number, b: number) =>
    Array.from({ length: 11 }, (_, i) => a + ((b - a) * i) / 10)
      .map((th, i) => `${i ? 'L' : 'M'}${X(th).toFixed(1)},${Y(sig(th)).toFixed(1)}`)
      .join(' ')
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={740} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={{ ...one(C.text, 26), fontWeight: 600 }}>
            B 를 고를 확률 <span style={mono(C.accent, 26)}>π(B) = e<sup>θ</sup> ÷ (1 + e<sup>θ</sup>)</span>
          </span>
        </div>
        <svg width={1000} height={610} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={110} y1={560} x2={940} y2={560} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={110} y1={120} x2={110} y2={560} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={110} y1={Y(0.5)} x2={940} y2={Y(0.5)} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="5 7" />
          {[-8, -6, -4, -2, 0, 2, 4, 6].map((th) => (
            <text key={th} x={X(th)} y={592} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {th < 0 ? `−${-th}` : th}
            </text>
          ))}
          {[
            [0, '0'],
            [0.5, '0.5'],
            [1, '1'],
          ].map(([p, s]) => (
            <text key={s as string} x={98} y={Y(p as number) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          <text x={940} y={540} textAnchor="end" fill={C.muted} fontSize={20}>
            θ →
          </text>
          <path d={path} fill="none" stroke={C.green} strokeWidth={4} />
          <g opacity={prog(t, 0.8)}>
            <path d={`M${X(0)},${Y(0.5)} Q360,200 ${X(-7.5) + 6},${Y(0.000553) - 14}`} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="8 7" />
            <circle cx={X(0)} cy={Y(0.5)} r={9} fill={C.green} />
            <circle cx={X(-7.5)} cy={Y(0.000553)} r={9} fill={C.red} />
          </g>
          <g opacity={prog(t, 1.4)}>
            <text x={130} y={160} fill={C.red} fontSize={23} fontWeight={600}>
              η = 10 의 update 한 번: θ 0 → −7.5
            </text>
            <text x={130} y={194} fill={C.red} fontSize={22} fontFamily={MONO}>
              π(B) 0.5 → 0.000553
            </text>
            <text x={130} y={228} fill={C.muted} fontSize={21} opacity={prog(t, 3)}>
              그 자리의 기울기는 약 0.00055, 거의 평평
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <path d={seg(0, 1)} fill="none" stroke={C.orange} strokeWidth={9} strokeLinecap="round" />
            <path d={seg(4, 5)} fill="none" stroke={C.orange} strokeWidth={9} strokeLinecap="round" />
            <text x={660} y={300} fill={C.orange} fontSize={21} fontWeight={600}>
              θ 0 → 1
            </text>
            <text x={940} y={98} textAnchor="end" fill={C.orange} fontSize={21} fontWeight={600}>
              θ 4 → 5
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 618, opacity: prog(t, 13.6) }}>
          <Tab
            at={13.6}
            cols={[{ w: 140, mono: true }, { w: 260, mono: true }, { w: 270, mono: true }, { w: 230, mono: true, right: true }]}
            head={['θ 의 변화', 'π(B)', 'π(A)', 'A 의 확률']}
            rows={[
              ['0 → 1', '0.5 → 0.7311', '0.5 → 0.2689', '× 0.5379'],
              ['4 → 5', '0.9820 → 0.9933', '0.0180 → 0.0067', '× 0.3721'],
            ]}
            colors={[C.text, C.orange]}
          />
        </div>
      </Card>
      <Box x={1088} y={140} w={768} h={176} at={0.3} title={<Head color={C.red}>① 진짜 gradient 도 거의 0</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 0.8) }}>
            진짜 gradient <span style={mono(C.text, 24)}>π(A) · π(B) · (2 − 1)</span> 을 정확히 알아도
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 2.2) }}>
            θ = −7.5: <span style={mono(C.red, 24)}>0.9994 × 0.000553 ≈ 0.00055</span>
          </span>
        </div>
      </Box>
      <Box x={1088} y={334} w={768} h={150} at={6.5} title={<Head color={C.red}>② η = 10 으로 계속 고치면</Head>}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={one(C.text, 23)}>θ 가 0 으로 돌아오기까지 update</span>
          <span style={mono(C.red, 34)}>186 번</span>
        </div>
      </Box>
      <Box x={1088} y={502} w={768} h={176} at={13} title={<Head color={C.orange}>③ θ 를 똑같이 1 옮겨도</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 15.5) }}>
            출발점마다 확률이 바뀌는 비율이 다르다 · A 는 <span style={mono(C.orange, 24)}>0.3721 배</span>
          </span>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 17) }}>policy 의 변화는 action 마다 확률이 몇 배가 됐는지로 잰다</span>
        </div>
      </Box>
      <Box x={1088} y={696} w={768} h={176} at={19.5} title={<Head color={C.accent}>④ supervised learning 과 다른 점</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 19.9) }}>supervised: 모델이 틀려도 학습 데이터는 그대로</span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 21.2) }}>RL: policy 가 자기 데이터를 모은다 → 크게 바꾸지 않는 장치</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseStep = () => (
  <PauseWrite
    question={
      <>
        θ = 0 에서 B 를 골라 0 개를 받은 같은 sample 로 η = 2 만큼 고치면 새 θ 와 π(B) 는? (e<sup>−1.5</sup> ≈ 0.2231)
      </>
    }
    answer={
      <>
        θ 의 변화 = −0.75 × 2 = −1.5 → 새 θ = −1.5
        <br />
        π(B) = 0.2231 ÷ (1 + 0.2231) = 0.2231 ÷ 1.2231 ≈ 0.1824 · 1000 번에 약 182 번
      </>
    }
  />
)

// ---------- 2. ratio and clip ----------

function Ratio() {
  const t = useSec()
  const s = 257
  const bars: [number, number, string, string, string][] = [
    [80, 0.5, '0.5', C.dim, 'old'],
    [180, 0.3775, '0.3775', C.blue, 'new'],
    [470, 0.5, '0.5', C.dim, 'old'],
    [570, 0.6225, '0.6225', C.green, 'new'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={150} at={0.3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <span style={mono(C.accent, 36)}>r(θ) =</span>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <span style={one(C.text, 27)}>
              <span>새 policy 가 그 action 을 고를 확률 </span>
              <span style={mono(C.green, 27)}>
                π<sub>θ</sub>(a | s)
              </span>
            </span>
            <div style={{ width: '100%', height: 3, background: C.text, opacity: 0.8 }} />
            <span style={one(C.text, 27)}>
              <span>옛 policy 가 그 action 을 고를 확률 </span>
              <span style={mono(C.dim, 27)}>
                π<sub>θold</sub>(a | s)
              </span>
            </span>
          </div>
          <span style={{ ...line(C.muted, 24), width: 600, opacity: prog(t, 2.4) }}>
            고치기 시작하는 순간에는 θ = θ<sub>old</sub> 라서 모든 sample 의 ratio 가 정확히 1
          </span>
        </div>
      </Box>
      <Box x={64} y={314} w={880} h={566} at={6.5} title={<Head color={C.blue}>θ<sub>old</sub> = 0 으로 모았고, 고쳐서 θ = 0.5</Head>}>
        <svg width={820} height={240}>
          <g opacity={prog(t, 6.8)}>
            <rect x={20} y={10} width={18} height={18} fill={C.dim} />
            <text x={46} y={26} fill={C.muted} fontSize={21}>
              옛 policy (θ = 0)
            </text>
            <rect x={290} y={10} width={18} height={18} fill={C.green} />
            <text x={316} y={26} fill={C.muted} fontSize={21}>
              새 policy (θ = 0.5)
            </text>
          </g>
          <line x1={40} y1={210} x2={800} y2={210} stroke={C.cardEdge} strokeWidth={2} />
          {bars.map(([x, v, label, color, kind], i) => {
            const p = prog(t, kind === 'old' ? 7 : 8 + (i > 1 ? 0.6 : 0), 0.8)
            const h = v * s * p
            return (
              <g key={x} opacity={prog(t, 6.9)}>
                <rect x={x} y={210 - h} width={90} height={h} rx={6} fill={color} />
                <text x={x + 45} y={210 - v * s - 10} textAnchor="middle" fill={kind === 'old' ? C.muted : color} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.6 + (i > 1 ? 0.6 : 0))}>
                  {label}
                </text>
              </g>
            )
          })}
          <text x={180} y={238} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
            A
          </text>
          <text x={570} y={238} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
            B
          </text>
        </svg>
        <Tab
          at={9.6}
          cols={[{ w: 120 }, { w: 140, mono: true, right: true }, { w: 140, mono: true, right: true }, { w: 400, mono: true, right: true }]}
          head={['action', '옛 확률', '새 확률', 'ratio']}
          rows={[
            ['A', '0.5', '0.3775', '0.3775 ÷ 0.5 = 0.7551'],
            ['B', '0.5', '0.6225', '0.6225 ÷ 0.5 = 1.2449'],
          ]}
          colors={[C.blue, C.green]}
          size={24}
        />
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 11.4) }}>
          rsl_rl:{' '}
          <span style={mono(C.muted, 22)}>
            e<sup>ln 0.6225 − ln 0.5</sup> = e<sup>0.2191</sup> ≈ 1.245
          </span>
        </span>
      </Box>
      <Box x={968} y={314} w={888} h={340} at={13} title={<Head color={C.green}>importance sampling: 옛 데이터를 θ = 2 의 비율로</Head>}>
        <Tab
          at={13.3}
          cols={[{ w: 200 }, { w: 170, mono: true, right: true }, { w: 170, mono: true, right: true }, { w: 230, mono: true, right: true }]}
          head={['경우', '옛 비율', 'ratio', '비율 × ratio']}
          rows={[
            ['A 를 고름', '0.5', '0.2384', '0.1192'],
            ['B 를 고름', '0.5', '1.7616', '0.8808'],
          ]}
          size={24}
        />
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 15.4) }}>
            gradient: <span style={mono(C.green, 24)}>−0.1050 + 0.2100 + 0 = 0.105</span> (θ = 2 의 진짜 값)
          </span>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 17) }}>ratio 없이 옛 sample 을 그대로 쓰면 −0.3212 · 부호까지 틀림</span>
        </div>
      </Box>
      <Box x={968} y={672} w={888} h={208} at={19.5} color={`${C.red}88`} title={<Head color={C.red}>ratio 가 1 에서 아주 멀면</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 19.9) }}>
            옛 0.01 → 새 0.5: <span style={mono(C.red, 24)}>ratio = 0.5 ÷ 0.01 = 50</span>
          </span>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 21.6) }}>100 번에 1 번꼴로만 있던 sample 하나가 50 개 몫 → 평균이 크게 흔들림</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Clip() {
  const t = useSec()
  const X = (r: number) => 110 + (r - 0.4) * 591.7
  const Y = (v: number) => 220 - v * 43.75
  const pos = `M${X(0.4)},${Y(0.8)} L${X(1.2)},${Y(2.4)} L${X(1.6)},${Y(2.4)}`
  const neg = `M${X(0.4)},${Y(-1.6)} L${X(0.8)},${Y(-1.6)} L${X(1.6)},${Y(-3.2)}`
  const mj: [string, number, string, string][] = [
    ['clip 없음', -0.39, '−0.39', C.red],
    ['ε = 0.1', 0.76, '0.76', C.blue],
    ['ε = 0.2', 0.82, '0.82', C.accent],
    ['ε = 0.3', 0.7, '0.70', C.blue],
  ]
  const cases: [string, string, string, string, string][] = [
    ['양수', '0.8 아래', '자르지 않은 항', '흐름 · 다시 올림', C.text],
    ['양수', '0.8 ~ 1.2', '두 항이 같음', '흐름 · 올림', C.text],
    ['양수', '1.2 위', '자른 항', '0 · 멈춤', C.orange],
    ['음수', '0.8 아래', '자른 항', '0 · 멈춤', C.orange],
    ['음수', '0.8 ~ 1.2', '두 항이 같음', '흐름 · 내림', C.text],
    ['음수', '1.2 위', '자르지 않은 항', '흐름 · 다시 내림', C.text],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={430} at={6.3}>
        <svg width={860} height={430}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600}>
            sample 하나의 clipped 목표 값
          </text>
          <g opacity={prog(t, 6.6)}>
            <line x1={560} y1={36} x2={590} y2={36} stroke={C.green} strokeWidth={4} />
            <text x={598} y={43} fill={C.green} fontSize={20}>
              +2
            </text>
            <line x1={650} y1={36} x2={680} y2={36} stroke={C.red} strokeWidth={4} />
            <text x={688} y={43} fill={C.red} fontSize={20}>
              −2
            </text>
            <text x={440} y={43} fill={C.muted} fontSize={20}>
              advantage
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <rect x={X(0.8)} y={85} width={X(1.2) - X(0.8)} height={280} fill={`${C.accent}12`} />
            <text x={X(1)} y={78} textAnchor="middle" fill={C.accent} fontSize={20} fontWeight={600}>
              clip 범위 0.8 ~ 1.2
            </text>
          </g>
          <line x1={110} y1={Y(0)} x2={820} y2={Y(0)} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="5 7" />
          <line x1={110} y1={365} x2={820} y2={365} stroke={C.cardEdge} strokeWidth={2} />
          {[0.4, 0.8, 1, 1.2, 1.6].map((r) => (
            <text key={r} x={X(r)} y={390} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {r}
            </text>
          ))}
          <text x={X(1)} y={420} textAnchor="middle" fill={C.muted} fontSize={20}>
            ratio
          </text>
          <text x={98} y={Y(0) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <g opacity={prog(t, 8)}>
            <line x1={X(1.2)} y1={Y(2.4)} x2={X(1.6)} y2={Y(3.2)} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" opacity={0.6} />
            <path d={pos} fill="none" stroke={C.green} strokeWidth={4} />
            <text x={600} y={145} fill={C.green} fontSize={20} fontWeight={600}>
              평평 · gradient 0
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            <line x1={X(0.4)} y1={Y(-0.8)} x2={X(0.8)} y2={Y(-1.6)} stroke={C.red} strokeWidth={2} strokeDasharray="6 6" opacity={0.6} />
            <path d={neg} fill="none" stroke={C.red} strokeWidth={4} />
            <text x={120} y={322} fill={C.red} fontSize={20} fontWeight={600}>
              −1.6 · gradient 0
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={590} w={860} h={290} at={24.2} title={<Head size={24}>MuJoCo 7 과제 × seed 3 개 · 0 = 무작위, 1 = 가장 좋음</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          {mj.map(([label, v, s, color], i) => {
            const p = prog(t, 24.5 + i * 0.5, 0.8)
            const zero = 150
            const scale = 380
            const w = Math.abs(v) * scale * p
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, 24.3 + i * 0.5, 0.3) }}>
                <span style={{ width: 140, fontSize: 24, textAlign: 'right', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
                <div style={{ position: 'relative', width: zero + scale, height: 30 }}>
                  <div style={{ position: 'absolute', left: zero, top: -4, width: 2, height: 38, background: C.muted }} />
                  <div style={{ position: 'absolute', top: 0, height: 30, borderRadius: 6, background: color, left: v < 0 ? zero - w : zero + 2, width: w }} />
                  <span style={{ ...mono(color, 24), position: 'absolute', top: -1, left: v < 0 ? zero + 14 : zero + v * scale + 12, opacity: prog(t, 25 + i * 0.5) }}>{s}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Box>
      <Box x={948} y={140} w={908} h={372} at={12.2} title={<Head color={C.accent}>min(자르지 않은 항, 자른 항) 의 여섯 경우</Head>}>
        <Tab
          at={12.5}
          step={0.45}
          cols={[{ w: 150 }, { w: 170 }, { w: 250 }, { w: 270 }]}
          head={['advantage', 'ratio 구간', '고르는 항', 'gradient']}
          rows={cases.map(([a, b, c, d]) => [a, b, c, d])}
          colors={cases.map((c) => c[4])}
        />
      </Box>
      <Box x={948} y={530} w={908} h={350} at={0.3} title={<Head size={24}>운 나쁜 sample 하나 (advantage −1.5) · η 0.5 · 10 epoch</Head>}>
        <Tab
          at={0.6}
          step={0.4}
          cols={[{ w: 120, mono: true }, { w: 165, mono: true, right: true }, { w: 120, mono: true, right: true }, { w: 165, mono: true, right: true, at: 18.3 }, { w: 120, mono: true, right: true, at: 18.3 }, { w: 150, mono: true, right: true, at: 19 }]}
          head={['epoch', '없음 π(B)', 'ratio', '있음 π(B)', 'ratio', 'gradient']}
          rows={[
            ['1', '0.5', '1', '0.5', '1', '−0.75'],
            ['2', '0.4073', '0.8147', '0.4073', '0.8147', '−0.7242'],
            ['3', '0.3236', '0.6473', <span style={{ color: C.green }}>0.3236</span>, <span style={{ color: C.green }}>0.6473</span>, <span style={{ color: C.orange }}>0</span>],
            ['10', '0.0922', '0.1843', <span style={{ color: C.green }}>0.3236</span>, '0.6473', <span style={{ color: C.orange }}>0</span>],
            [<span style={{ fontFamily: undefined }}>10 뒤</span>, <span style={{ color: C.red }}>0.0822</span>, <span style={{ color: C.red }}>0.1644</span>, <span style={{ color: C.green }}>0.3236</span>, '0.6473', ''],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

const PauseClip = () => (
  <PauseWrite
    question="advantage = −1, ratio = 0.6 인 sample 의 자르지 않은 항과 자른 항은? min 으로 고르는 값은? 이 sample 은 θ 를 움직일까?"
    answer={
      <>
        자르지 않은 항 0.6 × (−1) = −0.6 · 자른 항 0.8 × (−1) = −0.8
        <br />
        min 은 −0.8 (자른 항) → gradient 0 → θ 를 움직이지 않는다
      </>
    }
  />
)

// ---------- 3. GAE and bootstrap ----------

function Gae() {
  const t = useSec()
  const weights: [string, number[], string, number][] = [
    ['λ = 0', [1, 0, 0, 0], '1', 14.6],
    ['λ = 0.5', [1, 0.5, 0.25, 0.125], '1.125', 12.6],
    ['λ = 1', [1, 1, 1, 1], '1', 15.4],
  ]
  const fmt = (w: number) => (w === 0 ? '0' : String(w))
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={300} at={0.3}>
        <div style={{ display: 'flex', gap: 50 }}>
          <div style={{ width: 860, display: 'grid', gap: 14, alignContent: 'start' }}>
            <Head color={C.accent}>TD error δ: 한 step 으로 만든 advantage</Head>
            <span style={{ ...mono(C.text, 34), opacity: prog(t, 0.8) }}>
              δ<sub>t</sub> = r<sub>t+1</sub> + γ · V(s<sub>t+1</sub>) − V(s<sub>t</sub>)
            </span>
            <span style={{ ...one(C.muted, 23), opacity: prog(t, 2) }}>받은 reward 에 다음 state 의 예측을 γ 만큼 깎아 더하고</span>
            <span style={{ ...one(C.muted, 23), opacity: prog(t, 3) }}>지금 state 의 예측을 뺀다 · V(s): 앞으로 받을 reward 합의 예측</span>
          </div>
          <div style={{ display: 'grid', gap: 10, alignContent: 'start', opacity: prog(t, 6.3) }}>
            <span style={one(C.text, 23)}>CartPole · γ = 1 · 네 번째 reward 뒤에 막대가 쓰러짐</span>
            <Tab
              at={6.6}
              cols={[{ w: 230 }, { w: 105, mono: true, right: true }, { w: 105, mono: true, right: true }, { w: 105, mono: true, right: true }, { w: 105, mono: true, right: true }, { w: 120, mono: true, right: true }]}
              head={['step t', '0', '1', '2', '3', '끝']}
              rows={[
                [
                  <>
                    예측 V(s<sub>t</sub>)
                  </>,
                  '3',
                  '3',
                  '2',
                  '2',
                  '0',
                ],
                ['reward', '1', '1', '1', '1', ''],
                [
                  <span style={{ color: C.accent }}>
                    δ<sub>t</sub>
                  </span>,
                  '1',
                  '0',
                  '1',
                  '−1',
                  '',
                ],
              ]}
              colors={[C.text, C.text, C.accent]}
              step={0.9}
              size={24}
            />
          </div>
        </div>
      </Box>
      <Box x={64} y={464} w={900} h={416} at={12.2} title={<Head color={C.green}>GAE: 뒤의 δ 일수록 γλ 를 거듭 곱해 섞는다 · γ = 1</Head>}>
        <span style={{ ...mono(C.text, 25), opacity: prog(t, 12.5) }}>
          A<sub>t</sub> = δ<sub>t</sub> + γλ·δ<sub>t+1</sub> + (γλ)²·δ<sub>t+2</sub> + …
        </span>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', color: C.muted, fontSize: 21, opacity: prog(t, 12.6) }}>
            <span style={{ width: 130 }}>몫</span>
            {['δ₀ = 1', 'δ₁ = 0', 'δ₂ = 1', 'δ₃ = −1'].map((d) => (
              <span key={d} style={{ width: 120, fontFamily: MONO, whiteSpace: 'nowrap' }}>
                {d}
              </span>
            ))}
            <span style={{ width: 150, textAlign: 'right' }}>step 0 의 A</span>
          </div>
          {weights.map(([label, ws, a, at]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', opacity: prog(t, at) }}>
              <span style={{ width: 130, ...mono(label === 'λ = 0.5' ? C.green : C.text, 22) }}>{label}</span>
              {ws.map((w, i) => (
                <div key={i} style={{ width: 120, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 50 * w * prog(t, at + 0.2 + i * 0.15), height: 24, borderRadius: 5, background: label === 'λ = 0.5' ? C.green : C.blue, minWidth: 2 }} />
                  <span style={mono(C.muted, 20)}>{fmt(w)}</span>
                </div>
              ))}
              <span style={{ width: 150, textAlign: 'right', ...mono(label === 'λ = 0.5' ? C.green : C.text, 26) }}>{a}</span>
            </div>
          ))}
        </div>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 16.2) }}>λ = 0 은 actor-critic 의 δ 하나 · λ = 1 은 return − V(s₀) = 4 − 3 = 1</span>
      </Box>
      <Box x={988} y={464} w={868} h={416} at={18.2} title={
          <Head color={C.orange}>
            마지막 step 부터 거꾸로 · A<sub>t</sub> = δ<sub>t</sub> + 0.5 × A<sub>t+1</sub>
          </Head>
        }>
        <Tab
          at={18.5}
          step={0.7}
          cols={[{ w: 90, mono: true }, { w: 90, mono: true, right: true }, { w: 110, mono: true, right: true }, { w: 300, mono: true, right: true }, { w: 150, mono: true, right: true }]}
          head={[
            '순서',
            'step',
            'δ',
            <>
              0.5 × A<sub>t+1</sub>
            </>,
            <>
              A<sub>t</sub>
            </>,
          ]}
          rows={[
            ['1', '3', '−1', '0.5 × 0 = 0', '−1'],
            ['2', '2', '1', '0.5 × (−1) = −0.5', '0.5'],
            ['3', '1', '0', '0.5 × 0.5 = 0.25', '0.25'],
            ['4', '0', '1', '0.5 × 0.25 = 0.125', <span style={{ color: C.green }}>1.125</span>],
          ]}
        />
        <div style={{ display: 'grid', gap: 8, marginTop: 6 }}>
          <span style={{ ...one(C.text, 22), opacity: prog(t, 24.4) }}>
            V(s₁) 을 3 대신 5 로 틀리면 어긋나는 양:{' '}
            <span style={mono(C.red, 22)}>λ 0: 2 · λ 0.5: 1 · λ 1: 0</span>
          </span>
          <span style={{ ...one(C.muted, 22), opacity: prog(t, 26) }}>λ 가 작으면 critic 오차를 받는 bias, 크면 여러 step 의 운이 섞이는 variance</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Bootstrap() {
  const t = useSec()
  const gl = 0.9405
  const X = (l: number) => 90 + l * 14.8
  const Y = (v: number) => 320 - v * 220
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={380} at={0.3}>
        <svg width={880} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600}>
            γ = 0.99, λ = 0.95 → γλ = 0.9405 · l step 뒤 δ 의 몫
          </text>
          <line x1={80} y1={320} x2={850} y2={320} stroke={C.cardEdge} strokeWidth={2} />
          {Array.from({ length: 51 }, (_, l) => {
            const v = gl ** l
            const p = prog(t, 0.6 + l * 0.04, 0.4)
            const hi = l === 10 || l === 50
            return <rect key={l} x={X(l) - 5} y={Y(v * p)} width={10} height={320 - Y(v * p)} rx={2} fill={hi ? C.accent : `${C.blue}aa`} />
          })}
          {[0, 10, 20, 30, 40, 50].map((l) => (
            <text key={l} x={X(l)} y={346} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {l}
            </text>
          ))}
          <text x={850} y={372} textAnchor="end" fill={C.muted} fontSize={20}>
            l (몇 step 뒤)
          </text>
          <text x={X(10) + 14} y={180} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 2.6)}>
            10 step 뒤 ≈ 0.54
          </text>
          <text x={X(50)} y={270} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 3.4)}>
            50 step 뒤 ≈ 0.047
          </text>
        </svg>
      </Card>
      <Box x={968} y={140} w={888} h={380} at={6.5} title={<Head color={C.green}>rollout 이 끝났지만 막대는 아직 서 있다</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 6.8) }}>
            쓰러져 끝남 · V = 0 → <span style={mono(C.red, 24)}>δ₃ = 1 + 0 − 2 = −1</span>
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 8.2) }}>
            rollout 의 끝 · V(s₄) = 2 → <span style={mono(C.green, 24)}>δ₃ = 1 + 2 − 2 = 1</span>
          </span>
          <div style={{ marginTop: 6, padding: '16px 20px', borderRadius: 14, background: `${C.green}10`, border: `1.5px solid ${C.green}44`, display: 'grid', gap: 6, opacity: prog(t, 13.2) }}>
            <span style={one(C.green, 24)}>bootstrap: 받지 않은 reward 를 critic 의 예측으로 채운다</span>
            <span style={line(C.muted, 22)}>episode 가 rollout 한가운데에서 끝나면 V = 0 으로 두고, 새 episode 의 A 는 더하지 않는다</span>
          </div>
        </div>
      </Box>
      <Box x={64} y={544} w={880} h={336} at={13} title={<Head color={C.orange} size={26}>γλ = 0.5 로 다시 훑은 advantage</Head>}>
        <Tab
          at={13.3}
          step={0.5}
          cols={[{ w: 90, mono: true }, { w: 90, mono: true, right: true }, { w: 200, mono: true, right: true }, { w: 220, mono: true, right: true }, { w: 220, mono: true, right: true }]}
          head={[
            'step',
            'δ',
            <>
              0.5 × A<sub>t+1</sub>
            </>,
            'bootstrap A',
            '쓰러짐 A',
          ]}
          rows={[
            ['3', '1', '0', <span style={{ color: C.green }}>1</span>, <span style={{ color: C.red }}>−1</span>],
            ['2', '1', '0.5', '1.5', '0.5'],
            ['1', '0', '0.75', '0.75', '0.25'],
            ['0', '1', '0.375', '1.375', '1.125'],
          ]}
        />
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 16) }}>쓰러지지 않은 만큼 step 3 이 −1 → +1, 앞 step 으로 0.5 배씩 전해짐</span>
      </Box>
      <Box x={968} y={544} w={888} h={336} at={19.5} title={<Head color={C.accent} size={26}>Rudin 등의 보행 설정</Head>}>
        <svg width={832} height={70}>
          <text x={0} y={22} fill={C.text} fontSize={21}>
            episode 20 초 ÷ 0.02 초 = 1000 step
          </text>
          <rect x={0} y={36} width={800 * prog(t, 19.8, 1)} height={22} rx={4} fill={`${C.blue}55`} />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={(i + 1) * 19.2} y1={36} x2={(i + 1) * 19.2} y2={58} stroke={C.bg} strokeWidth={2} opacity={prog(t, 20.4 + i * 0.02)} />
          ))}
        </svg>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...one(C.text, 22), opacity: prog(t, 20.8) }}>rollout 은 env 마다 24 step → episode 하나가 iteration 약 42 번에 걸침</span>
          <span style={{ ...one(C.red, 22), opacity: prog(t, 21.8) }}>넘어져 끝남 → V = 0 이 맞다</span>
          <span style={{ ...one(C.green, 22), opacity: prog(t, 22.8) }}>20 초에 끊긴 time-out → 계속 걸을 수 있었으므로 예측으로 bootstrap</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseGae = () => (
  <PauseWrite
    question={
      <>
        γλ = 0.5 이고 δ = (2, 0, −2) 인 3 step episode. A<sub>t</sub> = δ<sub>t</sub> + 0.5 × A<sub>t+1</sub> 을 뒤에서부터 써서 A₂, A₁, A₀ 를 구하면? (끝난 뒤 A₃ = 0)
      </>
    }
    answer="A₂ = −2 + 0.5 × 0 = −2 · A₁ = 0 + 0.5 × (−2) = −1 · A₀ = 2 + 0.5 × (−1) = 1.5"
  />
)

// ---------- 4. loss, iteration and the parallel setup ----------

function Loss() {
  const t = useSec()
  const coef: [string, string, string][] = [
    ['PPO Atari', '1', '0.01'],
    ['CleanRL', '0.5', '0.01'],
    ['legged_gym', '1.0', '0.01'],
    ['Isaac Lab ANYmal-D', '1.0', '0.005'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={300} at={0.3} title={<Head color={C.blue}>value loss: critic 을 정답 쪽으로</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 0.7) }}>
            정답{' '}
            <span style={mono(C.blue, 24)}>
              R<sub>t</sub> = A<sub>t</sub> + V(s<sub>t</sub>)
            </span>{' '}
            · 차이를 제곱해 평균
          </span>
          <span style={{ ...one(C.muted, 23), opacity: prog(t, 2) }}>
            앞의 episode: <span style={mono(C.muted, 24)}>R = (4.125, 3.25, 2.5, 1)</span>
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 3.2) }}>
            step 0: <span style={mono(C.blue, 26)}>(3 − 4.125)² = 1.2656</span>
          </span>
        </div>
      </Box>
      <Box x={968} y={140} w={888} h={300} at={6.5} title={<Head color={C.purple}>entropy: 확률이 고르게 퍼진 정도</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 6.8) }}>H(π) = −Σ π(a) ln π(a)</span>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="A 0.5 · B 0.5" value={0.6931} max={0.6931} color={C.purple} at={7.4} width={300} labelW={330} fmt="0.6931" />
          <Bar label="A 0.9 · B 0.1" value={0.3251} max={0.6931} color={C.purple} at={8.2} width={300} labelW={330} fmt="0.3251" />
          <Bar label="망가진 policy (η = 10)" value={0.0047} max={0.6931} color={C.red} at={9.2} width={300} labelW={330} fmt="0.0047" />
        </div>
      </Box>
      <Box x={64} y={460} w={1792} h={150} at={13}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <span style={mono(C.accent, 34)}>
            loss = −L<sub>CLIP</sub> + c<sub>v</sub> · L<sub>VF</sub> − c<sub>e</sub> · H
          </span>
          <span style={{ ...one(C.muted, 22), opacity: prog(t, 14) }}>gradient descent 로 줄이므로 키울 값에는 마이너스</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          {coef.map(([name, v, e], i) => (
            <div key={name} style={{ padding: '6px 18px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, fontSize: 21, whiteSpace: 'nowrap', opacity: prog(t, 15 + i * 0.4) }}>
              <span style={{ color: C.muted }}>{name}</span>{' '}
              <span style={mono(C.text, 21)}>
                c<sub>v</sub> {v} · c<sub>e</sub> {e}
              </span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={64} y={630} w={1792} h={250} at={19.5} gap={10} title={<Head color={C.green}>PPO 의 한 iteration</Head>}>
        <Flow steps={['rollout 모으기', 'GAE 계산', 'mini-batch × epoch 로 고치기', '데이터 버리기']} color={C.green} at={19.8} gap={0.45} />
        <span style={{ ...one(C.text, 24), opacity: prog(t, 21.4) }}>
          CleanRL CartPole · <span style={mono(C.green, 24)}>env 4 개 × 128 step = 512 개 → 128 개씩 4 묶음 × 4 epoch = 16 번</span>
        </span>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 23) }}>policy gradient 라면 한 번 쓰고 버렸을 512 개를 16 번 쓴다 · ratio 가 경계를 넘은 sample 은 gradient 0</span>
        <div style={{ position: 'absolute', right: 34, top: 22, display: 'grid', gap: 6, justifyItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 36px)', gap: 8 }}>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 6, background: i === 0 ? C.accent : `${C.green}88`, opacity: prog(t, 21.6 + i * 0.15, 0.3) }} />
            ))}
          </div>
          <span style={{ ...one(C.muted, 20), opacity: prog(t, 24) }}>첫 step 은 ratio 모두 1</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Parallel() {
  const t = useSec()
  const split = prog(t, 6.6)
  const segColors = [C.blue, C.green, C.orange, C.purple]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={450} at={0.3} title={<Head size={26}>기본 설정 (legged_gym 과 Isaac Lab ANYmal-D 는 같은 값)</Head>}>
        <Tab
          at={0.6}
          step={0.35}
          cols={[{ w: 220 }, { w: 300, mono: true, right: true }, { w: 300, mono: true, right: true }]}
          head={['설정', 'CleanRL CartPole', 'legged_gym · Isaac Lab']}
          rows={[
            ['env 수', '4', <span style={{ color: C.accent }}>4096</span>],
            ['env 마다 step', '128', <span style={{ color: C.accent }}>24</span>],
            ['한 iteration sample', '512', <span style={{ color: C.accent }}>98,304</span>],
            ['mini-batch', '4 개로 나눔', '4 개로 나눔'],
            ['epoch', '4', '5'],
            ['clip ε', '0.2', '0.2'],
            ['γ, λ', '0.99, 0.95', '0.99, 0.95'],
            ['learning rate', '2.5 × 10⁻⁴ → 0', '10⁻³ adaptive'],
          ]}
        />
      </Box>
      <Box x={988} y={140} w={868} h={450} at={1.2} title={<Head color={C.accent} size={26}>iteration 하나의 batch</Head>}>
        <svg width={812} height={190}>
          <text x={110} y={34} fill={C.muted} fontSize={22}>
            env 4096 개 →
          </text>
          <text x={100} y={118} textAnchor="end" fill={C.muted} fontSize={22}>
            24 step
          </text>
          <rect x={110} y={50} width={680} height={120} fill={`${C.accent}14`} stroke={C.cardEdge} strokeWidth={2} />
          {segColors.map((c, i) => (
            <rect key={i} x={110 + i * 170} y={50} width={170} height={120} fill={`${c}33`} stroke={c} strokeWidth={2} opacity={split} />
          ))}
          <text x={450} y={120} textAnchor="middle" fill={C.text} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={1 - split}>
            4096 × 24 = 98,304
          </text>
          {segColors.map((c, i) => (
            <text key={i} x={195 + i * 170} y={120} textAnchor="middle" fill={c} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={split}>
              24,576
            </text>
          ))}
        </svg>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 7.4) }}>
            mini-batch 하나 <span style={mono(C.accent, 24)}>4096 × 24 ÷ 4 = 24,576 개</span> · CartPole 128 개의 192 배
          </span>
          <span style={{ ...one(C.text, 23), opacity: prog(t, 9.4) }}>
            <span style={mono(C.green, 24)}>4 개 × 5 epoch = 20 번</span> 고친다
          </span>
        </div>
      </Box>
      <Box x={64} y={610} w={900} h={270} at={12.2} gap={10} title={<Head color={C.orange} size={26}>adaptive schedule · desired_kl = 0.01</Head>}>
        <svg width={844} height={100}>
          <line x1={20} y1={55} x2={820} y2={55} stroke={C.muted} strokeWidth={2} />
          {[
            [250, '0.005'],
            [420, '0.01'],
            [590, '0.02'],
          ].map(([x, s]) => (
            <g key={s as string}>
              <line x1={x as number} y1={45} x2={x as number} y2={65} stroke={C.muted} strokeWidth={2} />
              <text x={x as number} y={92} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {s}
              </text>
            </g>
          ))}
          <text x={135} y={32} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 14.8)}>
            × 1.5
          </text>
          <text x={420} y={32} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 13.6)}>
            그대로
          </text>
          <text x={705} y={32} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 12.8)}>
            ÷ 1.5
          </text>
          <text x={820} y={92} textAnchor="end" fill={C.muted} fontSize={20}>
            KL
          </text>
        </svg>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 16) }}>
          KL 0.03 → <span style={mono(C.text, 22)}>10⁻³ ÷ 1.5 ≈ 6.7 × 10⁻⁴</span> · 목표는 TRPO 의 δ 와 같은 0.01
        </span>
      </Box>
      <Box x={988} y={610} w={868} h={270} at={18.2} gap={10} title={<Head color={C.green} size={26}>Rudin 등 · GPU 한 장 · 1500 번 update</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="평지 보행" value={4} max={20} color={C.green} at={18.6} width={380} labelW={150} fmt="4 분 안" />
          <Bar label="험지 보행" value={20} max={20} color={C.orange} at={19.4} width={380} labelW={150} fmt="20 분 안" />
        </div>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 21) }}>
          <span style={mono(C.muted, 22)}>1500 × 98,304 ≈ 1.47 억</span> step
        </span>
        <span style={{ ...one(C.red, 22), opacity: prog(t, 24.4) }}>env 마다 25 step 보다 짧으면 학습이 잘 안 됨 · 기본값 24 step 이 경계</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseBatch = () => (
  <PauseWrite
    question="env 2048 개를 각 48 step 씩 움직이고 mini-batch 를 8 개로 나눠 5 epoch 학습한다. mini-batch 하나의 크기와 gradient step 수는?"
    answer={
      <>
        sample 2048 × 48 = 98,304 개 → mini-batch 하나 98,304 ÷ 8 = 12,288 개
        <br />
        gradient step: epoch 마다 8 번 × 5 epoch = 40 번
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items: { tag: string; color: string; text: ReactNode; at: number }[] = [
    { tag: script.sections[0], color: C.red, text: '운 나쁜 sample 하나로 η = 10 만큼 고치면 π(B) 0.5 → 0.000553 · 회복에 update 186 번', at: 0.8 },
    { tag: script.sections[1], color: C.accent, text: 'min(r·A, clip(r, 0.8, 1.2)·A) · 운 나쁜 sample 로 10 epoch 해도 B 0.3236 에서 멈춤', at: 4.4 },
    {
      tag: script.sections[2],
      color: C.green,
      text: (
        <span>
          GAE: δ 에 (γλ)<sup>l</sup> 몫 · γ 0.99, λ 0.95 · 끊긴 rollout 과 time-out 은 예측으로 bootstrap
        </span>
      ),
      at: 8.4,
    },
    { tag: script.sections[3], color: C.orange, text: '4096 × 24 = 98,304 · mini-batch 4 개 × 5 epoch = 20 번 · KL 로 learning rate 조절', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            한 번 모은 데이터로 여러 번 고치면서도 policy 가 한 번에 망가지지 않게 하려면?
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Sim-to-Real Locomotion</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            보행 policy 의 관측과 action, reward 설계, simulator 와 실물의 물리값 차이
          </Label>
        </Appear>
        <Appear at={3.6}>
          <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 600, marginTop: 16 }}>VLA + RL</div>
        </Appear>
        <Appear at={4}>
          <Label color={C.muted} size={30}>
            시연으로 먼저 배운 VLA 를 성공 여부 reward 와 PPO 로 더 학습하기
          </Label>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 40, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/ppo (TRPO · GAE · PPO · Engstrom 등 · Rudin 등 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Ppo() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'big-step': BigStep,
        'no-recover': NoRecover,
        'pause-step': PauseStep,
        ratio: Ratio,
        clip: Clip,
        'pause-clip': PauseClip,
        gae: Gae,
        bootstrap: Bootstrap,
        'pause-gae': PauseGae,
        loss: Loss,
        parallel: Parallel,
        'pause-batch': PauseBatch,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
