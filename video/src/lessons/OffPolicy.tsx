import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './off-policy.narration.json'
import { script } from './off-policy.script'

// Numbers follow lessons/off-policy/README.md (see off-policy.script.ts). The corridor bars, the Q(s, a) curve and the
// buffer slots are redrawn from the lesson's figures; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
    </div>
  )
}

function Flow({ steps, color, at, gap = 0.5 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

/** the padded column most cards use */
function Col({ children, gap = 14 }: { children: ReactNode; gap?: number }) {
  return <div style={{ padding: '22px 28px', display: 'grid', alignContent: 'start', gap }}>{children}</div>
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a text table: the first column sans and left-aligned, the rest mono (unless `sans`) and right-aligned */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors, sans = false }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; sans?: boolean }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 || sans ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 || sans ? 'left' : 'right', paddingRight: i === 0 || sans ? 0 : 10 })
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

/** a label and a run of mono values, e.g. "복사본 1 로 고정  0.8 → 0.4 → 0.2 → 0.1" */
function Seq({ label, values, color, at, labelW = 230, size = 24 }: { label: string; values: string; color: string; at: number; labelW?: number; size?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, opacity: prog(t, at) }}>
      <span style={{ ...line(C.muted, 22), width: labelW }}>{label}</span>
      <span style={mono(color, size)}>{values}</span>
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
            REINFORCEMENT LEARNING · OFF-POLICY
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>DQN → SAC</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            replay buffer · target network · <span style={{ color: C.accent }}>twin critic · entropy</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            겪은 경험을 쌓아 두고 몇 번이고 다시 학습하는 강화학습
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
  const wins: [string, string, string, number][] = [
    ['DQN · 2015', 'replay buffer 로 Atari 게임 49 개를 화면만 보고 학습', C.blue, 6],
    ['SERL · 2024', '시연 20 개 + 실물 학습 20 분 → Franka 팔의 PCB 꽂기 100/100', C.green, 6.6],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={300} at={0.3}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Label size={24}>CleanRL 의 SAC 예제는 simulator 환경 하나를 배우는 데 기본으로 100 만 step 을 쓴다</Label>
          <div style={{ ...mono(C.text, 46), opacity: prog(t, 0.9) }}>
            1,000,000 step ÷ 10 번/초 = <span style={{ color: C.orange }}>100,000 초</span>
          </div>
          <span style={{ ...line(C.orange, 30), opacity: prog(t, 2.2) }}>쉬지 않고 28 시간 가까이 · 그동안 모터가 닳고, 떨어진 물건은 사람이 제자리에 놓는다</span>
        </div>
      </Card>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 476, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          경험과 시연을 다시 쓰면 <span style={{ color: C.accent }}>실물 로봇도 몇 시간 안에 배울까?</span>
        </div>
      </Appear>
      <Card x={260} y={640} w={1400} h={230} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 16 }}>
          <Label size={22}>겪은 경험을 버리지 않고 다시 쓰는 off-policy 의 결과</Label>
          {wins.map(([tag, text, color, at]) => (
            <div key={tag} style={{ display: 'flex', gap: 22, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(color, 26), width: 220 }}>{tag}</span>
              <span style={line(C.text, 28)}>{text}</span>
            </div>
          ))}
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- DQN 의 두 장치 ----------

function MovingTarget() {
  const t = useSec()
  // corridor Q = w × x: bars for x = 1, 2, 3 before (w = 0.2) and after (w = 0.4) learning x = 2 only
  const base = 290
  const unit = 180
  const cx = [230, 440, 650]
  const after = [0.4, 0.8, 1.2]
  const before = [0.2, 0.4, 0.6]
  const grow = [prog(t, 11.3, 1), prog(t, 7.5, 1), prog(t, 11.3, 1)]
  const diffs = [0.8, 1.12, 1.57, 2.2]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={560} h={340} at={0.3}>
        <Col>
          <Head color={C.accent}>CartPole 의 state = 숫자 4 개</Head>
          <span style={line(C.muted, 22)}>수레 위치 · 수레 속도 · 막대 각도 · 막대 각속도</span>
          <span style={{ ...mono(C.text, 30), opacity: prog(t, 1.4) }}>10⁴ = 10,000 칸</span>
          <span style={{ ...mono(C.red, 30), opacity: prog(t, 2.6) }}>100⁴ = 1 억 칸</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.8) }}>대부분의 칸은 한 번도 채워지지 않는다</span>
        </Col>
      </Card>
      <Card x={648} y={130} w={1208} h={340} at={5.5}>
        <svg width={1208} height={340} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            복도 예 Q = w × x
          </text>
          <line x1={150} x2={740} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
          <g opacity={prog(t, 13.5)}>
            <line x1={150} x2={740} y1={base - unit} y2={base - unit} stroke={C.red} strokeWidth={2} strokeDasharray="8 7" />
            <text x={30} y={base - unit + 7} fill={C.red} fontSize={22}>
              최대 1
            </text>
          </g>
          {cx.map((c, i) => {
            const hb = before[i] * unit
            const ha = (before[i] + (after[i] - before[i]) * grow[i]) * unit
            const over = i === 2 && t > 13.5
            return (
              <g key={c}>
                <g opacity={prog(t, 5.8)}>
                  <rect x={c - 66} y={base - hb} width={60} height={hb} rx={6} fill={C.dim} />
                  <text x={c - 36} y={base - hb - 10} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                    {before[i]}
                  </text>
                </g>
                <g opacity={i === 1 ? prog(t, 7.3) : prog(t, 11.1)}>
                  <rect x={c + 6} y={base - ha} width={60} height={ha} rx={6} fill={over ? C.red : C.accent} />
                  <text x={c + 36} y={base - ha - 10} textAnchor="middle" fill={over ? C.red : C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
                    {(before[i] + (after[i] - before[i]) * grow[i]).toFixed(1)}
                  </text>
                </g>
                <text x={c} y={324} textAnchor="middle" fill={i === 1 ? C.accent : C.muted} fontSize={22}>
                  {i === 1 ? 'x = 2 · 배운 곳' : `x = ${i + 1}`}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 790, top: 30, width: 390, display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 5.8) }}>■ w = 0.2 · 배우기 전</span>
          <span style={{ ...line(C.accent, 22), opacity: prog(t, 7.3) }}>■ x = 2 의 target 0.9 로 한 번 고쳐 w = 0.4</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 11.6) }}>x = 1 과 3 의 Q 도 두 배 → generalization</span>
          <span style={{ ...line(C.red, 22), fontWeight: 600, opacity: prog(t, 13.8) }}>x = 3 의 Q 는 1.2 · reward 최대 1 이라 넘을 수 없는 값</span>
        </div>
      </Card>
      <Card x={64} y={500} w={1792} h={380} at={16.5}>
        <div style={{ position: 'absolute', left: 28, top: 22, width: 1060, display: 'grid', gap: 14 }}>
          <Head size={24} color={C.accent}>
            transition A: x 1 → 2, reward 0 · target = 0.9 × Q(2) = 0.9 × 2w = 1.8 w
          </Head>
          <Table
            head={['update', 'w', 'target 1.8 w', '차이', '새 w']}
            widths={[130, 110, 190, 130, 440]}
            at={16.9}
            step={0.8}
            rows={[
              ['0', '1', '1.8', '0.8', '1 + 0.5 × 0.8 = 1.4'],
              ['1', '1.4', '2.52', '1.12', '1.4 + 0.5 × 1.12 = 1.96'],
              ['2', '1.96', '3.528', '1.568', '1.96 + 0.5 × 1.568 = 2.744'],
            ]}
          />
          <span style={{ ...line(C.text, 24), opacity: prog(t, 22.7) }}>Q(1) 은 0.4 다가가고 target 은 1.8 → 2.52 로 0.72 달아난다 · 진짜 Q(1) 은 0.9</span>
          <div style={{ opacity: prog(t, 25.5) }}>
            <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${C.red}77`, background: `${C.red}14`, color: C.red, fontSize: 24, fontWeight: 600 }}>moving target · w 가 update 마다 1.4 배</span>
          </div>
        </div>
        <svg width={620} height={330} style={{ position: 'absolute', left: 1140, top: 26 }}>
          <text x={10} y={30} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 18.3)}>
            차이 = target − Q(1)
          </text>
          <line x1={20} x2={600} y1={290} y2={290} stroke={C.muted} strokeWidth={2} opacity={prog(t, 18.3)} />
          {diffs.map((d, i) => {
            const p = prog(t, 18.6 + i * 0.7, 0.8)
            const h = (d / 2.2) * 200 * p
            const x = 40 + i * 140
            return (
              <g key={i} opacity={prog(t, 18.5 + i * 0.7, 0.3)}>
                <rect x={x} y={290 - h} width={90} height={h} rx={6} fill={C.red} />
                <text x={x + 45} y={290 - h - 10} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {d.toFixed(2)}
                </text>
                <text x={x + 45} y={318} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            )
          })}
          <text x={615} y={318} textAnchor="end" fill={C.muted} fontSize={20} opacity={prog(t, 18.3)}>
            update
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Dqn() {
  const t = useSec()
  const slots = ['A', 'B', 'A', 'B', 'A']
  const picked = [1, 2]
  const games: [string, string, string, string, string][] = [
    ['Breakout', '316.8', '240.7', '10.2', '3.2'],
    ['Enduro', '1006.3', '831.4', '141.9', '29.1'],
    ['River Raid', '7446.6', '4102.8', '2867.7', '1453.0'],
    ['Seaquest', '2894.4', '822.6', '1003.0', '275.8'],
    ['Space Invaders', '1088.9', '826.3', '373.2', '302.0'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={390} at={0.3}>
        <Col gap={10}>
          <Head color={C.accent}>target network · A 만 배울 때 차이</Head>
          <Flow steps={['online network · 학습', 'target network · target 계산']} color={C.blue} at={0.8} />
          <Seq label="같은 w 로 계산" values="0.8 → 1.12 → 1.57 → 2.20" color={C.red} at={1.8} />
          <Seq label="복사본 = 1 고정" values="0.8 → 0.4 → 0.2 → 0.1" color={C.green} at={3.2} />
          <span style={{ ...line(C.text, 22), opacity: prog(t, 6.3) }}>hard update · DQN 논문: update 10,000 번마다 통째로 복사</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.6) }}>CleanRL 의 dqn.py: 기본 500 step 마다 복사</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 9.2) }}>soft update · SAC 의 τ = 0.005 → 매 step 남은 거리의 0.5%</span>
        </Col>
      </Card>
      <Card x={976} y={130} w={880} h={390} at={12}>
        <Col gap={10}>
          <Head color={C.accent}>replay buffer</Head>
          <svg width={824} height={70}>
            {slots.map((s, i) => {
              const on = picked.includes(i) && t > 14.6
              return (
                <g key={i} opacity={prog(t, 12.3 + i * 0.2)}>
                  <rect x={2 + i * 112} y={4} width={100} height={56} rx={10} fill={on ? `${C.orange}22` : C.bg} stroke={on ? C.orange : C.cardEdge} strokeWidth={2} />
                  <text x={52 + i * 112} y={41} textAnchor="middle" fill={on ? C.orange : C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {s}
                  </text>
                </g>
              )
            })}
            <text x={584} y={30} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 14.6)}>
              무작위 batch
            </text>
            <text x={584} y={60} fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 13.2)}>
              (s, a, r, s', d)
            </text>
          </svg>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 15.6) }}>한 transition 을 뽑는 횟수: 250,000 × 32 ÷ 1,000,000 = 평균 8 번</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.3) }}>복사할 때마다 바뀌는 복사본 weight</span>
          <Seq label="A 만" values="1 → 1.8 → 3.24 → 5.83" color={C.red} at={18.6} />
          <Seq label="A 와 B 섞기" values="0.76 → 0.674 → 0.643 → 0.631 → 0.625" color={C.green} at={20.4} />
        </Col>
      </Card>
      <Card x={64} y={545} w={1792} h={335} at={24}>
        <div style={{ position: 'absolute', left: 28, top: 22, display: 'grid', gap: 10 }}>
          <Head size={24} color={C.accent}>
            두 장치를 하나씩 끈 비교 · 게임 5 개를 10,000,000 frame 씩 학습한 최고 점수
          </Head>
          <Table
            head={['게임', '둘 다 켬', 'target network 끔', 'replay buffer 끔', '둘 다 끔']}
            widths={[250, 220, 220, 220, 220]}
            size={22}
            at={24.3}
            step={0.35}
            colors={[C.accent]}
            rows={games}
          />
        </div>
        <div style={{ position: 'absolute', left: 1250, top: 80, width: 500, display: 'grid', gap: 16 }}>
          <span style={{ ...line(C.green, 26), fontWeight: 600, opacity: prog(t, 25.6) }}>다섯 게임 모두 두 장치를 함께 쓸 때 가장 높다</span>
          <span style={{ ...mono(C.accent, 28), opacity: prog(t, 26.4) }}>Breakout 316.8 → 3.2</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.2) }}>Seaquest 를 뺀 네 게임은 replay buffer 를 끌 때 더 떨어진다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- overestimation ----------

function Overestimation() {
  const t = useSec()
  const R = (s: string) => <span style={{ color: C.red, fontWeight: 600 }}>{s}</span>
  const D = (s: string) => <span style={{ color: C.dim }}>{s}</span>
  const base = 390
  const unit = 250
  const bars: [string, number, string, number][] = [
    ['추정값 하나의 평균', 1, C.blue, 8],
    ['max 로 고른 값의 평균', 1.15, C.red, 9.6],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={450} at={0.3}>
        <Col>
          <Head color={C.accent} size={26}>
            진짜 Q 가 1 인 action 두 개 · 추정값마다 같은 확률로 ±0.3
          </Head>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.5) }}>네 경우가 같은 확률로 나온다</span>
          <Table
            head={['경우', '추정값 1', '추정값 2', '큰 값', '작은 값']}
            widths={[130, 160, 160, 160, 160]}
            size={26}
            at={6.6}
            step={0.7}
            rows={[
              ['1', '1.3', '1.3', R('1.3'), D('1.3')],
              ['2', '1.3', '0.7', R('1.3'), D('0.7')],
              ['3', '0.7', '1.3', R('1.3'), D('0.7')],
              ['4', '0.7', '0.7', R('0.7'), D('0.7')],
              [<b key="m">평균</b>, '1', '1', R('1.15'), D('0.85')],
            ]}
          />
        </Col>
      </Card>
      <Card x={996} y={130} w={860} h={450} at={7.6}>
        <svg width={860} height={450} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            평균을 비교하면
          </text>
          <line x1={120} x2={760} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
          <g opacity={prog(t, 8.2)}>
            <line x1={120} x2={760} y1={base - unit} y2={base - unit} stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
            <text x={770} y={base - unit + 7} fill={C.muted} fontSize={22}>
              진짜 1
            </text>
          </g>
          {bars.map(([label, v, color, at], i) => {
            const x = 250 + i * 310
            const h = v * unit * prog(t, at, 0.9)
            return (
              <g key={label} opacity={prog(t, at - 0.2, 0.3)}>
                <rect x={x - 70} y={base - h} width={140} height={h} rx={8} fill={color} />
                <text x={x} y={base - h - 12} textAnchor="middle" fill={color} fontSize={30} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
                <text x={x} y={425} textAnchor="middle" fill={C.muted} fontSize={22}>
                  {label}
                </text>
              </g>
            )
          })}
          <text x={650} y={110} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 11)}>
            +0.15 쏠림
          </text>
        </svg>
      </Card>
      <Card x={64} y={610} w={1792} h={270} at={13}>
        <Col>
          <Head color={C.accent}>overestimation 이 쌓이는 길</Head>
          <Flow steps={['잡음이 위로 튄 값을 max 가 고름', 'target 이 커짐', '앞 state 의 Q 가 커짐', '그 Q 가 더 앞 state 의 target']} color={C.red} at={13.5} gap={0.9} />
          <span style={{ ...line(C.text, 24), opacity: prog(t, 19.8) }}>action 이 많을수록 잡음이 위로 튄 action 이 하나쯤 있을 가능성이 커서 쏠림도 크다</span>
        </Col>
      </Card>
    </AbsoluteFill>
  )
}

function Role({ tag, text, color, at }: { tag: string; text: string; color: string; at: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at) }}>
      <span style={{ ...line(C.muted, 24), width: 100 }}>{tag}</span>
      <span style={mono(color, 26)}>{text}</span>
    </div>
  )
}

function DoubleQ() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={340} at={0.3}>
        <Col>
          <Head color={C.red}>DQN 의 target</Head>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 0.8) }}>r + γ × max (target network 의 Q)</span>
          <Role tag="고르기" text="target network" color={C.red} at={1.6} />
          <Role tag="읽기" text="target network" color={C.red} at={2.4} />
          <span style={{ ...line(C.red, 24), opacity: prog(t, 3.6) }}>잡음이 위로 튄 action 을 고르고, 그 튄 값을 그대로 쓴다</span>
        </Col>
      </Card>
      <Card x={976} y={130} w={880} h={340} at={6.5}>
        <Col>
          <Head color={C.green}>Double DQN · van Hasselt 등, 2015</Head>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7) }}>고르는 network 와 읽는 network 를 나눈다</span>
          <Role tag="고르기" text="online network" color={C.blue} at={7.6} />
          <Role tag="읽기" text="target network" color={C.green} at={8.6} />
          <span style={{ ...line(C.green, 24), opacity: prog(t, 10) }}>두 network 는 잡음이 서로 달라 함께 튀어 있을 가능성이 작다</span>
        </Col>
      </Card>
      <Card x={64} y={500} w={880} h={380} at={13}>
        <Col>
          <Head color={C.accent}>게임 49 개 · 사람 점수에 견준 점수의 중앙값</Head>
          <span style={line(C.muted, 22)}>DQN 과 같은 설정으로 학습</span>
          <Bar label="DQN" value={93.5} max={130} color={C.red} at={13.6} width={420} unit="%" labelW={200} />
          <Bar label="Double DQN" value={114.7} max={130} color={C.green} at={14.6} width={420} unit="%" labelW={200} />
        </Col>
      </Card>
      <Card x={976} y={500} w={880} h={380} at={19.5}>
        <Col>
          <Head color={C.accent}>clipped double Q · TD3 (2018) · SAC</Head>
          <span style={line(C.text, 24)}>critic 두 개를 따로 학습하고 target 에는 작은 값을 쓴다</span>
          <Bar label="큰 값의 평균" value={1.15} max={1.3} color={C.red} at={20.4} width={360} labelW={220} />
          <Bar label="진짜 Q" value={1} max={1.3} color={C.muted} at={21} width={360} labelW={220} />
          <Bar label="작은 값의 평균" value={0.85} max={1.3} color={C.green} at={21.6} width={360} labelW={220} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24) }}>작게 잡은 action 은 policy 가 찾아가지 않아 오차가 쌓이지 않는다</span>
        </Col>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- actor-critic · SAC ----------

function ActorCritic() {
  const t = useSec()
  const X = (a: number) => 500 + 200 * a
  const Y = (q: number) => 140 + (1.2 - q) * 53.7
  const Q = (a: number) => 1 - (a - 0.5) ** 2
  const drawn = prog(t, 0.6, 2.2)
  const pts: string[] = []
  for (let i = 0; i <= 160; i++) {
    const a = -2 + (4 * i) / 160
    if (i / 160 <= drawn) pts.push(`${X(a).toFixed(1)},${Y(Q(a)).toFixed(1)}`)
  }
  const ints: [number, string, number, number, 'start' | 'end' | 'middle'][] = [
    [-2, '−5.25', 14, 6, 'start'],
    [-1, '−1.25', -10, -16, 'end'],
    [0, '0.75', 0, 36, 'middle'],
    [1, '0.75', 0, 36, 'middle'],
    [2, '−1.25', 10, -16, 'start'],
  ]
  const climb = [0, 0.25, 0.375, 0.4375]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1000} h={750} at={0.3}>
        <svg width={1000} height={560} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            예로 든 Q(s, a) = 1 − (a − 0.5)²
          </text>
          <text x={30} y={84} fill={C.muted} fontSize={22}>
            Pendulum · action = torque 하나, −2 에서 2 사이
          </text>
          <line x1={80} x2={80} y1={140} y2={505} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={80} x2={920} y1={505} y2={505} stroke={C.muted} strokeWidth={2} />
          {[1, 0].map((q) => (
            <text key={q} x={70} y={Y(q) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {q < 0 ? `−${-q}` : q}
            </text>
          ))}
          {[-2, -1, 0, 1, 2].map((a) => (
            <text key={a} x={X(a)} y={537} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              {a < 0 ? `−${-a}` : a}
            </text>
          ))}
          <text x={960} y={537} textAnchor="end" fill={C.muted} fontSize={22}>
            a
          </text>
          <polyline points={pts.join(' ')} fill="none" stroke={C.blue} strokeWidth={3.5} />
          {ints.map(([a, label, dx, dy, anchor], i) => (
            <g key={a} opacity={prog(t, 6.6 + i * 0.4)}>
              <circle cx={X(a)} cy={Y(Q(a))} r={8} fill={C.orange} />
              <text x={X(a) + dx} y={Y(Q(a)) + dy} textAnchor={anchor} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 9.6)}>
            <circle cx={X(0.5)} cy={Y(1)} r={9} fill={C.green} />
            <text x={X(0.5)} y={128} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              a = 0.5 에서 1
            </text>
          </g>
          {climb.slice(1).map((a, i) => (
            <circle key={a} cx={X(a)} cy={Y(Q(a))} r={6} fill={C.red} opacity={prog(t, 25.2 + i * 0.6)} />
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 578, display: 'grid', gap: 14 }}>
          <Table head={['a', '−2', '−1', '0', '1', '2']} widths={[120, 150, 150, 150, 150, 150]} at={7} step={0.4} rows={[['Q', '−5.25', '−1.25', '0.75', '0.75', '−1.25']]} colors={[C.orange]} />
          <span style={{ ...line(C.text, 22), opacity: prog(t, 9.8) }}>정수 다섯 개 가운데 최댓값은 0.75 · 실제 최댓값은 a = 0.5 에서 1</span>
        </div>
      </Card>
      <Card x={1096} y={130} w={760} h={250} at={12.5}>
        <Col>
          <Head color={C.accent}>max 를 찾는 비용</Head>
          <span style={line(C.muted, 22)}>target 하나마다 넣어 본 수만큼 network 를 계산한다</span>
          <span style={{ ...mono(C.red, 30), opacity: prog(t, 14.2) }}>5⁶ = 15,625 개 조합</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.6) }}>관절 6 개 × 관절마다 값 5 개</span>
        </Col>
      </Card>
      <Card x={1096} y={410} w={760} h={470} at={18.5}>
        <Col>
          <Head color={C.accent}>actor-critic</Head>
          {(
            [
              ['actor', 'state 를 받아 action 을 낸다', 19],
              ['critic', 'state 와 action 을 받아 Q 하나를 낸다', 20.6],
            ] as [string, string, number][]
          ).map(([tag, text, at]) => (
            <div key={tag} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(C.accent, 26), width: 120 }}>{tag}</span>
              <span style={line(C.text, 24)}>{text}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.6) }}>actor 는 Q 가 커지는 쪽으로 · 걸음 크기 0.25</span>
          <Flow steps={['a = 0', '0.25', '0.375', '0.4375']} color={C.red} at={25} gap={0.6} />
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 26.5) }}>a = 0 의 비율 1 → 0 + 0.25 × 1 = 0.25</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.4) }}>critic target 의 max 자리에는 actor 가 낸 action 의 Q</span>
        </Col>
      </Card>
    </AbsoluteFill>
  )
}

function Sac() {
  const t = useSec()
  const G = (s: string) => <span style={{ color: C.green }}>{s}</span>
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={345} at={0.3}>
        <Col>
          <Head color={C.accent}>entropy · 놀라움 −ln p 의 기댓값</Head>
          <Bar label="(0.5, 0.5)" value={0.693} max={0.8} color={C.green} at={1.2} width={420} labelW={200} />
          <Bar label="(0.9, 0.1)" value={0.325} max={0.8} color={C.blue} at={3.4} width={420} labelW={200} />
          <Bar label="(1, 0)" value={0} max={0.8} color={C.red} at={4.6} width={420} labelW={200} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 5.2) }}>반반 섞으면 가장 크고, 한 action 만 고르면 0</span>
        </Col>
      </Card>
      <Card x={976} y={130} w={880} h={345} at={6.5}>
        <Col gap={10}>
          <Head color={C.accent}>temperature α = 0.1 · Q 가 1.0 과 0.9</Head>
          <span style={line(C.muted, 22)}>합 = Q 의 기댓값 + 0.1 × entropy</span>
          <Table
            head={['p', 'Q 의 기댓값', 'entropy', '0.1 × entropy', '합']}
            widths={[100, 170, 140, 190, 140]}
            size={22}
            at={7.2}
            step={0.6}
            rows={[
              ['1', '1.0', '0', '0', '1.0'],
              ['0.9', '0.99', '0.325', '0.0325', '1.0225'],
              [G('0.731'), G('0.9731'), G('0.582'), G('0.0582'), G('1.0313')],
              ['0.5', '0.95', '0.693', '0.0693', '1.0193'],
            ]}
          />
        </Col>
      </Card>
      <Card x={64} y={505} w={880} h={375} at={12.5}>
        <Col gap={10}>
          <Head color={C.accent}>SAC 의 critic target · twin critic</Head>
          <span style={line(C.muted, 22)}>예: r = 0 · γ = 0.9 · d = 0 · α = 0.1 · 뽑은 action 의 확률 0.5</span>
          <Table
            head={['단계', '계산']}
            widths={[300, 500]}
            at={13}
            step={1.2}
            rows={[
              ['작은 critic 값', 'min(1.0, 0.9) = 0.9'],
              ['entropy bonus', '−0.1 × ln 0.5 = 0.069'],
              ['다음 state 의 값', '0.9 + 0.069 = 0.969'],
              [<b key="y">target</b>, <b key="v">0 + 0.9 × 0.969 = 0.872</b>],
            ]}
          />
        </Col>
      </Card>
      <Card x={976} y={505} w={880} h={375} at={19}>
        <Col gap={10}>
          <Head color={C.accent}>tanh 로 묶은 Gaussian actor</Head>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 19.6) }}>u = μ + σ × ε = 0.2 + 0.5 × 0.6 = 0.5</span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 21.6) }}>torque = 2 × tanh 0.5 = 2 × 0.462 = 0.924</span>
          <div style={{ opacity: prog(t, 25.5), marginTop: 6 }}>
            <Head color={C.accent}>temperature 자동 조정 · 목표 entropy −dim A</Head>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 26) }}>Pendulum (torque 1 개) → 목표 −1 · HalfCheetah → −6</span>
          <span style={{ ...mono(C.orange, 22), opacity: prog(t, 27) }}>entropy −1.5 → α = 0.2 − 0.1 × (−1.5 + 1) = 0.25</span>
          <span style={{ ...mono(C.muted, 22), opacity: prog(t, 28.6) }}>entropy −0.5 → α = 0.2 − 0.1 × (−0.5 + 1) = 0.15</span>
        </Col>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- off-policy · SERL ----------

function OnOff() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={420} at={0.3}>
        <Col>
          <Head color={C.accent}>behavior policy 와 배우는 policy</Head>
          <span style={line(C.text, 22)}>transition 은 이 state 에서 이 action 을 했더니 나온 reward 와 다음 state 라는 environment 의 기록</span>
          <div style={{ display: 'grid', gap: 10, opacity: prog(t, 6.6) }}>
            <span style={line(C.red, 22)}>on-policy · PPO</span>
            <Flow steps={['지금 policy 로 모으기', '고치기', '데이터 버리기']} color={C.red} at={6.8} gap={0.6} />
          </div>
          <div style={{ display: 'grid', gap: 10, opacity: prog(t, 9.4) }}>
            <span style={line(C.green, 22)}>off-policy · DQN · SAC</span>
            <Flow steps={['어느 policy 든 · 시연', 'replay buffer', '몇 번이고 다시']} color={C.green} at={9.6} gap={0.6} />
          </div>
        </Col>
      </Card>
      <Card x={976} y={130} w={880} h={420} at={13}>
        <Col>
          <Table
            head={['항목', 'on-policy', 'off-policy']}
            widths={[220, 290, 300]}
            size={22}
            sans
            at={13.2}
            step={0.5}
            rows={[
              ['학습 데이터', '지금 policy 로 모은 것만', '어느 policy 로 모은 것이든'],
              ['예전 데이터', '버린다', 'buffer 에 남겨 다시 쓴다'],
              ['사람 시연', '그대로 섞기 어렵다', 'buffer 에 넣어 함께 쓴다'],
              ['안정성', '비교적 안정적', 'twin critic 같은 장치 필요'],
              ['대표 방법', 'Policy Gradient, PPO', 'DQN, TD3, SAC'],
            ]}
          />
          <span style={{ ...line(C.text, 22), opacity: prog(t, 16) }}>sample efficiency: 같은 성능에 드는 environment step 이 적을수록 높다</span>
          <span style={{ ...line(C.orange, 22), opacity: prog(t, 17.4) }}>실물에서는 step 마다 실제 시간이 든다 → off-policy 가 유리</span>
        </Col>
      </Card>
      <Card x={64} y={580} w={1792} h={300} at={19.5}>
        <div style={{ position: 'absolute', left: 28, top: 22, width: 700, display: 'grid', gap: 12 }}>
          <Head color={C.accent}>SAC 를 실물에서 바로 학습</Head>
          <span style={line(C.text, 24)}>Minitaur · 다리 4 개, actuator 8 개</span>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 20.4) }}>160,000 step · episode 약 400 번</span>
          <span style={{ ...line(C.green, 24), fontWeight: 600, opacity: prog(t, 21) }}>약 2 시간에 걷기를 배웠다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.6) }}>평평한 바닥에서만 배우고도 경사를 오르내리고 계단도 내려갔다</span>
        </div>
        <div style={{ position: 'absolute', left: 790, top: 22, width: 970, display: 'grid', gap: 14 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.6) }}>손가락 세 개짜리 손 (Dynamixel servo 9 개) 으로 밸브 돌리기</span>
          <Bar label="PPO · Zhu 등, 2018" value={7.4} max={20} color={C.red} at={23} width={420} unit=" 시간" labelW={290} />
          <Bar label="SAC · 밸브 각도 입력" value={3} max={20} color={C.green} at={24} width={420} unit=" 시간" labelW={290} />
          <Bar label="SAC · 카메라 영상만" value={20} max={20} color={C.dim} at={25.2} width={420} fmt="약 20" unit=" 시간" labelW={290} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Serl() {
  const t = useSec()
  const changes: [string, string, number][] = [
    ['1', 'batch 256 = 시연 데이터 128 + 로봇이 모은 데이터 128', 0.9],
    ['2', 'UTD ratio 20 · environment step 하나에 update 20 번', 6.3],
    ['3', 'critic 에 layer normalization · critic 10 개 중 무작위 2 개의 작은 값', 8.4],
  ]
  const roles: [string, string, number][] = [
    ['actor process', '10 Hz 로 손끝 목표를 낸다', 12.4],
    ['impedance controller', '1 kHz 로 손끝 목표를 따라간다', 13.6],
    ['learner process', 'demo buffer (시연 20 개) 와 RL buffer 에서 반씩 뽑아 update → 새 weight 를 actor 로', 15],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={360} at={0.3}>
        <Col>
          <Head color={C.accent}>RLPD 가 SAC 에서 바꾼 세 가지</Head>
          {changes.map(([n, text, at]) => (
            <div key={n} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(C.accent, 26), width: 26 }}>{n}</span>
              <span style={line(C.text, 24)}>{text}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>update 를 많이 하면 critic 의 값이 크게 튀기 쉽다</span>
        </Col>
      </Card>
      <Card x={976} y={130} w={880} h={360} at={12}>
        <Col>
          <Head color={C.accent}>SERL · actor 와 learner 를 나눈다</Head>
          {roles.map(([tag, text, at]) => (
            <div key={tag} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(C.blue, 23), width: 310 }}>{tag}</span>
              <span style={{ ...line(C.text, 22), flex: 1 }}>{text}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.4) }}>update 를 많이 하는 동안에도 로봇은 정해진 주기로 움직인다</span>
        </Col>
      </Card>
      <Card x={64} y={520} w={1100} h={360} at={17.5}>
        <Col>
          <Head color={C.accent}>SERL · Franka 팔의 실물 학습</Head>
          <Table
            head={['작업', '시연', '실물 학습', '성공']}
            widths={[460, 140, 200, 180]}
            at={17.8}
            step={0.7}
            colors={[C.green]}
            rows={[
              ['PCB 에 부품 꽂기', '20', '20 분', '100/100'],
              ['cable routing', '20', '31 분', '100/100'],
              ['물건 옮기기 · policy 두 개', '20', '105 분', '100/100'],
            ]}
          />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 20.6) }}>시연 100 개로 배운 behavior cloning 은 PCB 에서 성공률이 10 배 낮았다 · SERL policy 는 사람 시연보다 최대 3 배 빨랐다</span>
        </Col>
      </Card>
      <Card x={1196} y={520} w={660} h={360} at={23.5}>
        <Col gap={12}>
          <Head color={C.accent}>HIL-SERL</Head>
          <span style={line(C.text, 22)}>사람이 SpaceMouse 로 개입해 바로잡고, 그 수정도 buffer 에 넣는다 · 시연 20 ~ 30 개</span>
          <Bar label="HIL-SERL" value={100} max={100} color={C.green} at={24.4} width={220} unit="%" labelW={200} />
          <Bar label="HG-DAgger 평균" value={49.7} max={100} color={C.orange} at={25.2} width={220} unit="%" labelW={200} />
          <Bar label="처음부터 · 세 작업" value={0} max={100} color={C.red} at={26} width={220} unit="%" labelW={200} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.8) }}>작업 대부분 1 ~ 2.5 시간 학습</span>
        </Col>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'DQN 의 두 장치', color: C.accent, text: 'target network 와 replay buffer · 둘 다 끄면 Breakout 316.8 → 3.2', at: 0.8 },
    { tag: 'overestimation', color: C.red, text: 'max 평균 1.15 > 진짜 1 · Double DQN 93.5% → 114.7% · 작은 critic 값', at: 4.4 },
    { tag: 'actor-critic · SAC', color: C.orange, text: 'α × entropy 를 reward 에 · p 0.731 · target 0.872 · 목표 entropy −dim A', at: 8.4 },
    { tag: 'off-policy · SERL', color: C.green, text: '시연 20 개 + 실물 20 분 → PCB 꽂기 100/100 · UTD ratio 20', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            경험과 시연을 다시 쓰면 실물 로봇도 몇 시간 안에 배울까?
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
            NEXT · REINFORCEMENT LEARNING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Policy Gradient · PPO</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            value 를 거치지 않고 policy 를 직접 고치는 on-policy 방법 · 그다음 VLA + RL
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/off-policy (DQN · Double DQN · TD3 · SAC · RLPD · SERL · HIL-SERL 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseTarget = () => (
  <PauseWrite
    question="r = 1, γ = 0.9, 다음 state 에서 target network 의 Q 가 (6, 8) 이다. 계속될 때, 시간 제한으로 끊길 때, 막대가 쓰러질 때 target 은?"
    answer={
      <>
        계속 · 시간 제한(truncated): d = 0 → 1 + 0.9 × 8 = 8.2
        <br />
        쓰러짐(terminated): d = 1 → 1 + 0.9 × 0 × 8 = 1
      </>
    }
  />
)

const PauseDouble = () => (
  <PauseWrite
    question="target network 의 Q 가 (5.2, 4.6), online network 의 Q 가 (4.4, 5.0) 일 때 DQN 과 Double DQN 의 target 값은?"
    answer={
      <>
        DQN: target network 가 가장 크게 본 5.2
        <br />
        Double DQN: online 이 두 번째 action 을 골라 target 값 4.6
      </>
    }
  />
)

const PauseSac = () => (
  <PauseWrite
    question="같은 target 예에서 actor 가 뽑은 action 의 확률만 0.5 → 0.25 로 바꾸면 target 은? (ln 0.25 = −1.386)"
    answer={
      <>
        bonus 0.1 × 1.386 = 0.1386 · 다음 값 0.9 + 0.1386 = 1.0386
        <br />
        target 0 + 0.9 × 1.0386 ≈ 0.935
      </>
    }
  />
)

const PauseUtd = () => (
  <PauseWrite
    question="1초에 10 번 행동하는 로봇이 20 분 학습했다. transition 은 몇 개이고, UTD ratio 20 이면 update 는 몇 번인가?"
    answer={
      <>
        20 × 60 = 1,200 초 → 1,200 × 10 = 12,000 개
        <br />
        12,000 × 20 = 240,000 번 → step 마다 한 번일 때의 20 배
      </>
    }
  />
)

export function OffPolicy() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'moving-target': MovingTarget,
        dqn: Dqn,
        'pause-target': PauseTarget,
        overestimation: Overestimation,
        'double-q': DoubleQ,
        'pause-double': PauseDouble,
        'actor-critic': ActorCritic,
        sac: Sac,
        'pause-sac': PauseSac,
        'on-off': OnOff,
        serl: Serl,
        'pause-utd': PauseUtd,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
