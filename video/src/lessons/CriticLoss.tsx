import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './critic-loss.narration.json'
import { script } from './critic-loss.script'

// Numbers follow lessons/critic-loss/README.md only (see critic-loss.script.ts). The loss / gradient curves, the vector
// diagram and the target-jump plot are redrawn from the lesson's figures; every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false }: { children: ReactNode; color?: string; at: number; mono?: boolean }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250, ghost }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number; ghost?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, fontFamily: MONO }}>{label}</span>
      <div style={{ position: 'relative', width, height: 30, borderRadius: 8, background: C.grid }}>
        {ghost !== undefined && <div style={{ position: 'absolute', left: 0, top: 0, width: `${(100 * ghost) / max}%`, height: '100%', borderRadius: 8, background: `${C.red}33`, border: `1.5px dashed ${C.red}88` }} />}
        <div style={{ position: 'absolute', left: 0, top: 0, width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line of text that fades in at `at` */
function Row({ at, children, color = C.text, size = 24 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 13, opacity = 1) {
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            RL · DQN → SAC · CRITIC LOSS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Critic Loss</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            TD target 을 따라가게 하는 <span style={{ color: C.accent }}>loss 의 선택</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            오차가 큰 sample 하나가 update 를 얼마나 세게 끄는가
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
      <Box x={64} y={140} w={880} h={230} at={0.5} title={<Head color={C.green}>Stable-Baselines3 DQN</Head>}>
        <span style={line(C.text, 24)}>
          critic loss: <span style={mono(C.green, 24)}>smooth_l1_loss</span> (Huber, 경계 1)
        </span>
        <span style={line(C.muted, 24)}>
          gradient norm 을 최대 <span style={mono(C.text, 24)}>10</span> 으로 자름 (<span style={mono(C.muted, 22)}>clip_grad_norm_</span>)
        </span>
      </Box>
      <Box x={976} y={140} w={880} h={230} at={1.2} title={<Head color={C.orange}>CleanRL DQN</Head>}>
        <span style={line(C.text, 24)}>
          critic loss: <span style={mono(C.orange, 24)}>mse_loss</span> (squared error)
        </span>
        <span style={line(C.muted, 24)}>optimizer Adam · clipping 없음</span>
      </Box>
      <Appear at={2.2} style={{ position: 'absolute', left: 64, top: 396, width: 1792, textAlign: 'center' }}>
        <Label size={24} color={C.muted}>
          학습 초반이나 reward 가 큰 환경에서는 Q 값과 target 의 차이가 같은 batch 안에서도 sample 마다 수십 배씩 다르다
        </Label>
      </Appear>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          오차가 sample 마다 수십 배 다를 때,
          <br />
          <span style={{ color: C.accent }}>loss 의 선택은 학습에서 무엇을 바꿀까?</span>
        </div>
      </Appear>
      <Card x={330} y={680} w={1260} h={180} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 14, opacity: prog(t, 5.8) }}>
          <Label size={22}>DQN 논문 (Mnih 등 2015)</Label>
          <span style={line(C.text, 30)}>
            저자들은 TD 오차를 <span style={mono(C.accent, 30)}>−1</span> 과 <span style={mono(C.accent, 30)}>1</span> 사이로 잘랐더니 학습이 더 안정됐다고 적었다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- squared error and Huber ----------

const BATCH: [string, number][] = [
  ['δ = 0.5', 0.5],
  ['δ = −1', 1],
  ['δ = 2', 2],
  ['δ = 20', 20],
]

function Squared() {
  const t = useSec()
  const formula = (label: string, f: ReactNode, at: number, color = C.text) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, opacity: prog(t, at) }}>
      <span style={{ width: 200, fontSize: 22, color: C.muted, flexShrink: 0 }}>{label}</span>
      <span style={mono(color, 26)}>{f}</span>
    </div>
  )
  const share = prog(t, 20.8, 1)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={740} at={0.3} title={<Head color={C.accent}>TD 오차와 squared error</Head>}>
        {formula('TD target', 'y = r + γ · (다음 state 의 값)', 0.6)}
        <Row at={1.2} color={C.muted} size={22}>
          γ: 미래의 reward 를 깎아 더하는 discount factor
        </Row>
        {formula('TD 오차', 'δ = y − Q(s, a)', 2.2, C.blue)}
        {formula('squared error', 'L = ½ δ²', 7.2, C.red)}
        <Row at={8} color={C.muted} size={22}>
          SAC 논문 식 (7): 이 값을 batch 에서 평균 (MSE) 한 것을 critic 이 줄인다
        </Row>
        {formula('Q 로 미분', '−δ', 9.2, C.red)}
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <Row at={10}>
            <span style={{ color: C.green, fontWeight: 600 }}>δ &gt; 0</span> (target 이 Q 보다 큼) → gradient 는 − → Q 를 키운다
          </Row>
          <Row at={10.8}>
            <span style={{ color: C.orange, fontWeight: 600 }}>δ &lt; 0</span> → Q 를 줄인다
          </Row>
          <Row at={11.6}>
            크기는 오차에 비례 → 오차가 <span style={mono(C.red, 24)}>10</span> 배인 sample 은 <span style={mono(C.red, 24)}>10</span> 배 세게 끈다
          </Row>
        </div>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={13.5}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Head>batch 네 sample 의 gradient 크기 · squared error</Head>
          <div style={{ display: 'grid', gap: 16 }}>
            {BATCH.map(([l, v], i) => (
              <Bar key={l} label={l} value={v} max={20} color={i === 3 ? C.red : C.blue} at={13.9 + i * 0.5} width={480} labelW={150} />
            ))}
          </div>
          <div style={{ ...mono(C.text, 28), opacity: prog(t, 16.2) }}>합 0.5 + 1 + 2 + 20 = 23.5</div>
          <div style={{ display: 'grid', gap: 10, opacity: prog(t, 20.6) }}>
            <span style={line(C.muted, 22)}>gradient 크기의 합에서 차지하는 몫</span>
            <div style={{ display: 'flex', width: 800, height: 56, borderRadius: 10, overflow: 'hidden', background: C.grid }}>
              <div style={{ width: 800 * 0.85 * share, background: C.red, display: 'flex', alignItems: 'center', paddingLeft: 18, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ ...mono(C.bg, 24) }}>오차 20 · 20 ÷ 23.5 = 85%</span>
              </div>
              <div style={{ flex: 1, background: `${C.blue}55` }} />
            </div>
            <span style={{ ...line(C.blue, 22), textAlign: 'right', width: 800 }}>나머지 세 sample 15%</span>
          </div>
          <Row at={22.4} color={C.muted} size={23}>
            그 sample 의 target 이 잘못 계산된 값이라면, 이번 update 는 거의 그 잘못을 따라 움직인다
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** gradient size against TD error for squared error and Huber (δ_H = 1), 860 × 470 */
function GradPlot({ t }: { t: number }) {
  const x0 = 450
  const yAxis = 420
  const X = (d: number) => x0 + d * 120
  const Y = (g: number) => yAxis - g * 86.7
  const sq = `${X(-3)},${Y(3)} ${X(0)},${Y(0)} ${X(3)},${Y(3)}`
  const hub = `${X(-3)},${Y(1)} ${X(-1)},${Y(1)} ${X(0)},${Y(0)} ${X(1)},${Y(1)} ${X(3)},${Y(1)}`
  return (
    <svg width={860} height={470} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g opacity={prog(t, 0.5)}>
        <line x1={X(-3)} y1={yAxis} x2={X(3)} y2={yAxis} stroke={C.muted} strokeWidth={2} />
        <line x1={x0} y1={yAxis} x2={x0} y2={Y(3) - 10} stroke={C.muted} strokeWidth={2} />
        {[-3, -1, 1, 3].map((d) => (
          <g key={d}>
            <line x1={X(d)} y1={yAxis} x2={X(d)} y2={yAxis + 8} stroke={C.muted} strokeWidth={2} />
            <text x={X(d)} y={yAxis + 32} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {d < 0 ? `−${-d}` : d}
            </text>
          </g>
        ))}
        <text x={X(3)} y={yAxis - 18} textAnchor="end" fill={C.muted} fontSize={20}>
          오차 δ
        </text>
        <text x={x0 - 12} y={Y(3) + 10} textAnchor="end" fill={C.muted} fontSize={20}>
          gradient 크기
        </text>
      </g>
      <g opacity={prog(t, 0.7)}>
        <polyline points={sq} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" />
        <text x={x0 + 20} y={Y(3) - 6} fill={C.red} fontSize={22} fontWeight={600}>
          squared error
        </text>
      </g>
      <g opacity={prog(t, 1.2)}>
        <polyline points={hub} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" strokeDasharray="0" />
        <text x={X(1.58)} y={Y(1) + 34} fill={C.green} fontSize={22} fontWeight={600}>
          Huber · 1 에 머묾
        </text>
      </g>
    </svg>
  )
}

function Huber() {
  const t = useSec()
  const cell = (w: number, m = false): React.CSSProperties => ({ width: w, fontSize: 23, fontFamily: m ? MONO : undefined, whiteSpace: 'nowrap' })
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={470} at={0.3}>
        <GradPlot t={t} />
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={24}>gradient 크기 · squared error 와 Huber (δ_H = 1)</Head>
        </div>
      </Card>
      <Box x={64} y={630} w={860} h={250} at={6.5} gap={10}>
        <div style={{ display: 'flex', color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          <span style={{ width: 230 }}>오차 |δ|</span>
          <span style={{ width: 330 }}>loss</span>
          <span style={{ width: 200 }}>gradient 크기</span>
        </div>
        <div style={{ display: 'flex', opacity: prog(t, 6.8) }}>
          <span style={cell(230)}>δ_H 보다 작음</span>
          <span style={cell(330, true)}>½ δ²</span>
          <span style={cell(200, true)}>|δ|</span>
        </div>
        <div style={{ display: 'flex', opacity: prog(t, 7.4), color: C.green }}>
          <span style={cell(230)}>δ_H 이상</span>
          <span style={cell(330, true)}>δ_H (|δ| − ½ δ_H)</span>
          <span style={cell(200, true)}>δ_H</span>
        </div>
        <Row at={8.4} color={C.muted} size={22}>
          직선 구간의 기울기가 일정 → 오차가 아무리 커도 gradient 크기는 δ_H 이하
        </Row>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={12.5}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 14 }}>
          <Head color={C.accent}>PyTorch 의 두 loss</Head>
          <Row at={12.8} size={23}>
            <span style={mono(C.text, 23)}>HuberLoss</span> · 경계 <span style={mono(C.accent, 23)}>delta</span> · 기본값 <span style={mono(C.accent, 23)}>1.0</span> · 직선 구간 기울기 delta
          </Row>
          <Row at={13.6} size={23}>
            <span style={mono(C.text, 23)}>SmoothL1Loss</span> · 경계 <span style={mono(C.accent, 23)}>beta</span> · 기본값 <span style={mono(C.accent, 23)}>1.0</span> · 직선 구간 기울기 늘 1
          </Row>
          <Row at={14.6} color={C.muted} size={22}>
            SmoothL1Loss 는 Huber loss 를 beta 로 나눈 것 → 경계가 1 이면 두 loss 는 같다
          </Row>
          <div style={{ height: 1, background: C.cardEdge, margin: '6px 0', opacity: prog(t, 18.5) }} />
          <div style={{ opacity: prog(t, 18.5) }}>
            <Head size={24}>같은 batch · 경계 1 인 Huber (점선은 squared error)</Head>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {BATCH.map(([l, v], i) => (
              <Bar key={l} label={l} value={Math.min(v, 1)} ghost={v} max={20} color={C.green} at={18.8 + i * 0.4} width={480} labelW={150} fmt={v > 1 ? `${v} → 1` : `${v}`} />
            ))}
          </div>
          <div style={{ ...mono(C.text, 26), opacity: prog(t, 20.6) }}>합 0.5 + 1 + 1 + 1 = 3.5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 21.4) }}>
            <span style={line(C.muted, 22)}>오차 20 의 몫</span>
            <span style={mono(C.red, 26)}>85%</span>
            <span style={{ fontSize: 26, color: C.muted }}>→</span>
            <span style={mono(C.green, 30)}>1 ÷ 3.5 = 29%</span>
          </div>
          <Row at={24.8} color={C.muted} size={22}>
            경계를 넘어도 gradient 의 부호는 그대로 → Q 를 target 쪽으로 고치는 방향은 같고 세기만 일정
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- DQN error clipping and norm clipping ----------

function DqnClip() {
  const t = useSec()
  const rows: [string, ReactNode, ReactNode][] = [
    ['Stable-Baselines3 DQN', <><span style={{ fontFamily: MONO }}>smooth_l1_loss</span> (Huber, 경계 1)</>, <><span style={{ fontFamily: MONO }}>clip_grad_norm_</span> 최대 10</>],
    ['CleanRL DQN', <span style={{ fontFamily: MONO }}>mse_loss</span>, 'Adam, clipping 없음'],
    ['Dopamine DQN (TensorFlow 판)', <span style={{ fontFamily: MONO }}>huber_loss</span>, 'RMSProp'],
    ['Dopamine DQN (JAX 판)', <>기본값 <span style={{ fontFamily: MONO }}>mse</span></>, '기본 optimizer Adam'],
    ['Stable-Baselines3 SAC', <>두 critic 의 <span style={{ fontFamily: MONO }}>mse_loss</span> <span style={{ whiteSpace: 'nowrap' }}>합 × 0.5</span></>, 'clipping 없음'],
    ['CleanRL SAC', <>두 critic 의 <span style={{ fontFamily: MONO }}>mse_loss</span> 합</>, 'clipping 없음'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={250} at={0.3} title={<Head color={C.accent}>① 오차 자르기 · DQN 논문 Methods 절</Head>}>
        <Row at={0.8}>
          update 의 오차 항 (TD 오차) 을 <span style={mono(C.accent, 24)}>−1</span> 과 <span style={mono(C.accent, 24)}>1</span> 사이로 자름
        </Row>
        <Row at={2.2}>(−1, 1) 밖의 오차에 절댓값 loss 를 쓰는 것과 같음 → gradient 크기 1</Row>
        <Row at={3.8} color={C.green}>
          이름은 쓰지 않았지만 gradient 로는 경계 1 인 Huber 와 같다
        </Row>
      </Box>
      <Box x={64} y={400} w={880} h={290} at={7} title={<Head color={C.orange}>② reward 자르기 · 같은 논문</Head>}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Chip color={C.orange} at={7.3} mono>
            양수 → 1
          </Chip>
          <Chip color={C.orange} at={7.6} mono>
            음수 → −1
          </Chip>
          <Chip color={C.muted} at={7.9} mono>
            0 → 0
          </Chip>
        </div>
        <Row at={9}>
          오차의 미분이 커지는 것을 막아 <span style={mono(C.orange, 24)}>49</span> 개 Atari 게임에 같은 learning rate 를 쓰기 쉬워진다
        </Row>
        <Row at={11} color={C.muted} size={22}>
          다만 크기가 다른 reward 를 구별하지 못한다는 점도 적었다
        </Row>
      </Box>
      <Box x={64} y={700} w={880} h={180} at={13.5} gap={12} title={<Head size={24}>둘의 차이</Head>}>
        <Row at={13.8}>
          <span style={{ color: C.accent, fontWeight: 600 }}>오차 자르기</span> → gradient 의 세기만 줄이고 학습 목표는 그대로
        </Row>
        <Row at={15.5}>
          <span style={{ color: C.orange, fontWeight: 600 }}>reward 자르기</span> → 무엇을 잘한 것으로 칠지를 바꾼다
        </Row>
      </Box>
      <Card x={976} y={140} w={880} h={740} at={20.5}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 16 }}>
          <Head size={26}>구현마다 다른 critic loss</Head>
          <Label size={21} color={C.dim}>
            2026 년 10 월에 열어 본 각 저장소의 기본값
          </Label>
          <div style={{ display: 'flex', color: C.muted, fontSize: 21, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
            <span style={{ width: 280 }}>구현</span>
            <span style={{ width: 280 }}>critic loss</span>
            <span style={{ width: 236 }}>그 밖의 장치</span>
          </div>
          {rows.map(([a, b, c], k) => (
            <div key={a} style={{ display: 'flex', alignItems: 'flex-start', fontSize: 22, lineHeight: 1.35, opacity: prog(t, 20.9 + k * 0.45), color: k === 0 ? C.green : k === 1 ? C.orange : C.text }}>
              <span style={{ width: 280, paddingRight: 16 }}>{a}</span>
              <span style={{ width: 280, paddingRight: 16 }}>{b}</span>
              <span style={{ width: 236 }}>{c}</span>
            </div>
          ))}
          <Row at={24.5} color={C.muted} size={21}>
            Dopamine JAX 판의 Adam 은 원래 Nature DQN 과 TensorFlow 판의 optimizer 와 다르다 → 같은 이름의 알고리즘은 loss 와 optimizer 부터 비교
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** the gradient (6, 8), the threshold-5 circle and the two ways to cut it, 760 × 740 */
function VectorPlot({ t }: { t: number }) {
  const ox = 110
  const oy = 640
  const k = 60
  const P = (x: number, y: number): [number, number] => [ox + x * k, oy - y * k]
  const [ax, ay] = P(6, 8)
  const [gx, gy] = P(3, 4)
  const [sx, sy] = P(5, 5)
  // only up to 45°, so the arc stays clear of the (3, 4) label at the tip it passes through
  const arc = `M ${ox + 5 * k} ${oy} A ${5 * k} ${5 * k} 0 0 0 ${ox + 5 * k * Math.SQRT1_2} ${oy - 5 * k * Math.SQRT1_2}`
  return (
    <svg width={760} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g opacity={prog(t, 0.5)}>
        <line x1={ox} y1={oy} x2={ox + 9 * k} y2={oy} stroke={C.muted} strokeWidth={2} />
        <line x1={ox} y1={oy} x2={ox} y2={oy - 8.9 * k} stroke={C.muted} strokeWidth={2} />
        <line x1={P(5, 0)[0]} y1={oy} x2={P(5, 0)[0]} y2={oy + 8} stroke={C.muted} strokeWidth={2} />
        <text x={P(5, 0)[0]} y={oy + 32} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          5
        </text>
        <text x={ox - 14} y={P(0, 5)[1] + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          5
        </text>
        <text x={ox - 14} y={oy + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0
        </text>
      </g>
      <g opacity={prog(t, 6.6)}>
        {arrow(ox, oy, ax, ay, C.blue, 4, 16)}
        <text x={ax + 16} y={ay + 6} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
          (6, 8) · 길이 10
        </text>
      </g>
      <g opacity={prog(t, 7.6)}>
        <path d={arc} fill="none" stroke={C.green} strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={P(5, 0)[0] + 20} y={540} fill={C.green} fontSize={22} fontWeight={600}>
          문턱 5
        </text>
      </g>
      <g opacity={prog(t, 9.4)}>
        {arrow(ox, oy, gx, gy, C.green, 7, 20)}
        <text x={gx - 18} y={gy - 4} textAnchor="end" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          (3, 4)
        </text>
      </g>
      <g opacity={prog(t, 12.8)}>
        <rect x={ox} y={sy} width={5 * k} height={5 * k} fill="none" stroke={C.orange} strokeWidth={2} strokeDasharray="5 6" />
        {arrow(ox, oy, sx, sy, C.orange, 4, 16)}
        <text x={sx + 16} y={sy - 2} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          (5, 5)
        </text>
      </g>
    </svg>
  )
}

function NormClip() {
  const t = useSec()
  const shareRow = (name: ReactNode, where: string, v: number, color: string, at: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at) }}>
      <span style={{ width: 300, fontSize: 23, lineHeight: 1.3, color }}>{name}</span>
      <span style={{ width: 190, fontSize: 22, color: C.muted, whiteSpace: 'nowrap' }}>{where}</span>
      <div style={{ width: 270, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${v * prog(t, at + 0.2, 0.8)}%`, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={mono(color, 26)}>{v}%</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <VectorPlot t={t} />
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={24}>gradient (6, 8) 을 자르는 두 방법 · 문턱 5</Head>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 684, width: 700, display: 'flex', gap: 28, opacity: prog(t, 13.2) }}>
          <span style={line(C.green, 22)}>초록: 길이로 자름 → 방향 그대로</span>
          <span style={line(C.orange, 22)}>주황: 성분마다 → 45° 로 바뀜</span>
        </div>
      </Card>
      <Box x={856} y={140} w={1000} h={340} at={0.3} title={<Head color={C.accent}>gradient norm clipping · Pascanu 등 2013</Head>}>
        <Row at={0.6}>norm: 모든 parameter 의 gradient 를 한 vector 로 이어 붙인 길이</Row>
        <Row at={2}>문턱을 넘으면 방향은 두고 길이만 문턱으로 줄인다 (Algorithm 1)</Row>
        <Row at={7}>
          <span style={mono(C.blue, 24)}>√(6² + 8²) = 10</span> &gt; 문턱 5 → 배율 <span style={mono(C.green, 24)}>5 ÷ 10 = 0.5</span> → <span style={mono(C.green, 24)}>(3, 4)</span>
        </Row>
        <Row at={13}>
          성분마다 따로 ±5 로 자르면 <span style={mono(C.orange, 24)}>(5, 5)</span> → 방향이 바뀐다
        </Row>
        <Row at={15} color={C.muted} size={22}>
          PyTorch clip_grad_norm_ 은 길이로 자르고, 배율이 1 이하라 gradient 를 키우지는 않는다
        </Row>
      </Box>
      <Box x={856} y={500} w={1000} h={380} at={18.5} title={<Head color={C.red}>자르는 자리와 오차 20 인 sample 의 몫</Head>}>
        {shareRow('squared error', '자르지 않음', 85, C.red, 18.8)}
        {shareRow('Huber loss (δ_H = 1)', 'sample 마다', 29, C.green, 19.8)}
        {shareRow(
          <>
            squared error
            <br />+ norm clipping
          </>,
          'batch 합 전체',
          85,
          C.blue,
          24.6,
        )}
        <Row at={25.6} color={C.muted} size={22}>
          batch 합 전체에 같은 배율을 곱하므로 sample 사이의 몫은 그대로
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- reward scale and the Huber boundary ----------

function MeanMedian() {
  const t = useSec()
  const X = (v: number) => 80 + v * 80
  const axisY = 330
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={760} h={740} at={0.3} title={<Head color={C.accent}>gradient 에 부호만 남을 때</Head>}>
        <Row at={0.6}>
          reward <span style={mono(C.orange, 24)}>× 100</span> → TD 오차도 대략 <span style={mono(C.orange, 24)}>× 100</span>
        </Row>
        <Row at={6.8}>경계를 1 로 두면 거의 모든 sample 이 직선 구간 → gradient 크기가 모두 1</Row>
        <Row at={8.6} color={C.orange}>
          gradient 에는 오차의 부호만 남는다
        </Row>
        <Row at={10.2} color={C.muted} size={22}>
          critic 이 배워야 하는 값은 같은 (s, a) 에서 나오는 target 의 평균인 기대 return
        </Row>
        <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
          <Row at={12.8}>
            <span style={{ color: C.red, fontWeight: 700 }}>●</span> squared error 로 맞춘 값 → target 의 <span style={{ color: C.red, fontWeight: 600 }}>평균</span>
          </Row>
          <Row at={14.4}>
            <span style={{ color: C.blue, fontWeight: 700 }}>●</span> 부호만 보는 loss → <span style={{ color: C.blue, fontWeight: 600 }}>중앙값</span> (+ 쪽과 − 쪽 sample 수가 같아지는 값)
          </Row>
          <Row at={16}>
            <span style={{ color: C.green, fontWeight: 700 }}>●</span> Huber 로 맞춘 값 → 경계에 따라 <span style={{ color: C.green, fontWeight: 600 }}>그 사이</span>
          </Row>
        </div>
      </Box>
      <Card x={856} y={140} w={1000} h={740} at={18.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={24}>같은 (s, a) 의 target 0, 0, 0, 10 에 맞춘 Q 값</Head>
        </div>
        <svg width={1000} height={580} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 18.8)}>
            <line x1={X(0)} y1={axisY} x2={X(10)} y2={axisY} stroke={C.muted} strokeWidth={2} />
            {[0, 5, 10].map((v) => (
              <line key={v} x1={X(v)} y1={axisY - 6} x2={X(v)} y2={axisY + 6} stroke={C.muted} strokeWidth={2} />
            ))}
            <text x={X(5)} y={axisY + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              5
            </text>
            <text x={X(10)} y={axisY + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              10
            </text>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={X(0)} cy={axisY - 26 - i * 28} r={11} fill={C.text} />
            ))}
            <circle cx={X(10)} cy={axisY - 26} r={11} fill={C.text} />
            <text x={X(0) + 26} y={axisY - 74} fill={C.text} fontSize={22}>
              target 0 세 개
            </text>
            <text x={X(10) - 24} y={axisY - 20} textAnchor="end" fill={C.text} fontSize={22}>
              target 10
            </text>
          </g>
          <g opacity={prog(t, 19.6)}>
            <line x1={X(2.5)} y1={axisY} x2={X(2.5)} y2={398} stroke={C.red} strokeWidth={3} strokeDasharray="6 5" />
            <polygon points={`${X(2.5)},${axisY} ${X(2.5) - 9},${axisY + 14} ${X(2.5) + 9},${axisY + 14}`} fill={C.red} />
            <text x={X(2.5) + 14} y={420} fill={C.red} fontSize={24} fontWeight={600}>
              squared error → 평균 2.5
            </text>
          </g>
          <g opacity={prog(t, 21.2)}>
            <line x1={X(0)} y1={axisY} x2={X(0)} y2={518} stroke={C.blue} strokeWidth={3} strokeDasharray="6 5" />
            <text x={X(0) + 14} y={540} fill={C.blue} fontSize={24} fontWeight={600}>
              부호만 보는 loss → 중앙값 0
            </text>
          </g>
          <g opacity={prog(t, 25)}>
            <line x1={X(1 / 3)} y1={axisY} x2={X(1 / 3)} y2={458} stroke={C.green} strokeWidth={3} strokeDasharray="6 5" />
            <polygon points={`${X(1 / 3)},${axisY} ${X(1 / 3) - 8},${axisY + 13} ${X(1 / 3) + 8},${axisY + 13}`} fill={C.green} />
            <text x={X(1 / 3) + 14} y={480} fill={C.green} fontSize={24} fontWeight={600}>
              Huber (δ_H = 1) → 약 0.33
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 590, width: 940, display: 'grid', gap: 12 }}>
          <Row at={25.4} size={23}>
            Q 가 0 과 1 사이: 0 세 개는 각각 Q 만큼 줄이고 (경계 안), 10 은 1 만큼 키운다 (경계 밖)
          </Row>
          <Row at={26.6}>
            <span style={mono(C.green, 28)}>3Q = 1 → Q = 1/3 ≈ 0.33</span>
            <span style={{ color: C.muted }}> · 평균 2.5 의 13%</span>
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Scale() {
  const t = useSec()
  const rows: { at: number; barAt: number; name: string; nums: string; pct: number; label: string; color: string }[] = [
    { at: 0.6, barAt: 1, name: '원래 · target 0, 0, 0, 10', nums: '평균 2.5 · 경계 1 → 1/3 ≈ 0.33', pct: 13, label: '13%', color: C.green },
    { at: 2.4, barAt: 7, name: 'reward 100 배 · 0, 0, 0, 1000', nums: '평균 250 · 경계 1 → 1/3 ≈ 0.33', pct: 0.13, label: '0.13%', color: C.red },
    { at: 9.6, barAt: 10.2, name: 'reward 100 배 · 경계도 100 배', nums: '평균 250 · 경계 100 → 100/3 ≈ 33.3', pct: 13, label: '13%', color: C.green },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={440} at={0.3}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Head>reward 를 100 배로 키우면 · Huber 의 답 ÷ 평균</Head>
          <div style={{ display: 'flex', gap: 20, color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 8 }}>
            <span style={{ width: 420 }}>경우</span>
            <span style={{ width: 540 }}>평균과 Huber 의 답</span>
            <span style={{ width: 480 }}>평균 대비 Huber 의 답</span>
          </div>
          {rows.map((r) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, r.at) }}>
              <span style={{ width: 420, fontSize: 24 }}>{r.name}</span>
              <span style={{ width: 540, ...mono(C.text, 24) }}>{r.nums}</span>
              <div style={{ width: 480, height: 32, borderRadius: 8, background: C.grid, border: `1.5px solid ${C.cardEdge}` }}>
                <div style={{ width: `${r.pct * prog(t, r.barAt, 0.8)}%`, minWidth: 4, height: '100%', borderRadius: 8, background: r.color }} />
              </div>
              <span style={{ ...mono(r.color, 30), opacity: prog(t, r.barAt + 0.4) }}>{r.label}</span>
            </div>
          ))}
          <Row at={11.5} color={C.muted} size={22}>
            막대 전체가 평균 · 경계를 1 로 두면 답이 0.33 에 머물러 평균 250 의 0.13% 가 된다
          </Row>
        </div>
      </Card>
      <Box x={64} y={605} w={876} h={270} at={13.3} title={<Head color={C.green}>DQN 처럼 reward 를 자르면</Head>}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Chip color={C.green} at={13.6} mono>
            양수 → 1
          </Chip>
          <Chip color={C.green} at={13.9} mono>
            음수 → −1
          </Chip>
        </div>
        <Row at={15}>TD 오차도 대체로 Huber 의 경계 근처에 머문다</Row>
      </Box>
      <Box x={980} y={605} w={876} h={270} at={19.5} title={<Head color={C.red}>reward 를 자르지 않고 경계를 1 로 두면</Head>}>
        <Row at={19.8}>critic 은 평균보다 작은 값을 배울 수 있다</Row>
        <Row at={21.2}>Huber loss 를 쓸 때는 reward 의 크기를 함께 본다</Row>
        <Row at={22.6} color={C.muted} size={22}>
          reward 의 크기를 맞추는 방법 → Reward Scale &amp; Shaping
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- Adam and reading the loss ----------

function Adam() {
  const t = useSec()
  const calc = (s: string, at: number, color = C.text) => <div style={{ ...mono(color, 22), opacity: prog(t, at) }}>{s}</div>
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={470} at={0.3} title={<Head color={C.accent}>Adam 이 지우는 배율 · Kingma 와 Ba 2015</Head>}>
        <Row at={0.6}>
          <span style={mono(C.blue, 24)}>m</span>: gradient 의 이동 평균 (최근 값에 더 큰 무게)
        </Row>
        <Row at={1.6}>
          <span style={mono(C.purple, 24)}>v</span>: gradient 제곱의 이동 평균
        </Row>
        <Row at={2.6}>
          움직이는 양 = learning rate × <span style={mono(C.accent, 24)}>m / √v</span>
        </Row>
        <Row at={6.8}>
          gradient × c → <span style={mono(C.blue, 24)}>m</span> 은 c 배, <span style={mono(C.purple, 24)}>v</span> 는 c² 배 → 나누면 <span style={{ color: C.green, fontWeight: 600 }}>c 가 지워진다</span>
        </Row>
        <Row at={8.6} color={C.muted} size={22}>
          DQN 논문의 RMSProp 도 gradient 제곱의 이동 평균의 제곱근으로 나눠 배율이 비슷하게 지워진다
        </Row>
        <Row at={10} color={C.muted} size={22}>
          Stable-Baselines3 SAC 는 critic loss 에 0.5 를 곱하고 CleanRL SAC 는 곱하지 않지만, 둘 다 Adam 이라 update 가 두 배 차이 나지는 않는다
        </Row>
      </Box>
      <Box x={64} y={630} w={860} h={250} at={12.5} title={<Head color={C.red}>지우지 못하는 것 ① batch 안의 몫</Head>}>
        <Row at={12.8} size={23}>
          오차 20 인 sample 의 몫 <span style={mono(C.red, 23)}>20 ÷ 23.5 = 85%</span> 는 batch 안의 비율
        </Row>
        <Row at={14.4} size={23} color={C.muted}>
          전체에 같은 수를 곱해도 85% 는 그대로 · 이 비율은 Huber 처럼 sample 마다 잘라야 바뀐다
        </Row>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={18.5}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 14 }}>
          <Head color={C.red}>지우지 못하는 것 ② 한 step 만 튄 gradient</Head>
          <span style={{ ...mono(C.muted, 22), opacity: prog(t, 18.8) }}>기본값 β₁ = 0.9 · β₂ = 0.999 · 그 전까지 m = v = 1</span>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 19.2) }}>
            <Label size={23} color={C.text}>
              평소 (gradient 1)
            </Label>
            <Bar label="m / √v" value={1} max={3.5} color={C.muted} at={19.4} width={440} labelW={130} fmt="1.00" unit=" 배" />
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 20.2) }}>
            <Label size={23} color={C.red}>
              gradient 가 한 step 만 100 그대로
            </Label>
            {calc('m = 0.9 × 1 + 0.1 × 100 = 10.9', 20.6)}
            {calc('v = 0.999 × 1 + 0.001 × 100² = 11.0', 21.4)}
            <Bar label="m / √v" value={3.29} max={3.5} color={C.red} at={22.2} width={440} labelW={130} unit=" 배" />
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 24.6) }}>
            <Label size={23} color={C.green}>
              norm clipping 으로 10 까지 자른 뒤
            </Label>
            {calc('m = 0.9 × 1 + 0.1 × 10 = 1.9', 25)}
            {calc('v = 0.999 × 1 + 0.001 × 10² = 1.10', 25.6)}
            <Bar label="m / √v" value={1.81} max={3.5} color={C.green} at={26.2} width={440} labelW={130} unit=" 배" />
          </div>
          <Row at={27.4} color={C.muted} size={21}>
            m 이 v 보다 빨리 반응해 한 번 튄 값은 Adam 안에서도 다 지워지지 않는다 · Stable-Baselines3 DQN 은 Adam 과 함께 clip_grad_norm_ 을 쓴다
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** a target that jumps from 10 to 12 when the target network is overwritten, Q catching up, and the loss, 1000 × 460 */
function JumpPlot({ t }: { t: number }) {
  const x0 = 100
  const xs = 440
  const x1 = 950
  const V = (v: number) => 200 - (v - 10) * 45
  const L = (l: number) => 410 - l * 60
  const q = (x: number) => (x <= xs ? 10 : 12 - 2 * Math.exp(-(x - xs) / 120))
  const pts = (f: (x: number) => number, Y: (v: number) => number, from: number, to: number) =>
    Array.from({ length: 60 }, (_, i) => from + ((to - from) * i) / 59)
      .map((x) => `${x},${Y(f(x))}`)
      .join(' ')
  const grow = prog(t, 1.2, 2.5)
  const xe = xs + (x1 - xs) * grow
  const loss = (x: number) => 0.5 * (12 - q(x)) ** 2
  return (
    <svg width={1000} height={460} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g opacity={prog(t, 0.5)}>
        <text x={30} y={V(11) + 8} fill={C.muted} fontSize={22}>
          값
        </text>
        <text x={30} y={L(1) + 8} fill={C.muted} fontSize={22}>
          loss
        </text>
        <line x1={x0} y1={L(0)} x2={x1} y2={L(0)} stroke={C.muted} strokeWidth={2} />
        <text x={x1} y={L(0) + 32} textAnchor="end" fill={C.muted} fontSize={20}>
          update 횟수
        </text>
        <line x1={x0} y1={V(10)} x2={xs} y2={V(10)} stroke={C.blue} strokeWidth={4} />
        <text x={x0 + 10} y={V(10) - 16} fill={C.blue} fontSize={22} fontWeight={600}>
          target 10
        </text>
        <polyline points={pts(q, V, x0, xs)} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="10 6" />
        <line x1={x0} y1={L(0)} x2={xs} y2={L(0)} stroke={C.red} strokeWidth={4} />
      </g>
      <g opacity={prog(t, 1)}>
        <line x1={xs} y1={84} x2={xs} y2={L(0)} stroke={C.muted} strokeWidth={2} strokeDasharray="5 6" />
        <text x={xs + 14} y={258} fill={C.muted} fontSize={21}>
          target network 덮어씀
        </text>
        <line x1={xs} y1={V(12)} x2={xe} y2={V(12)} stroke={C.blue} strokeWidth={4} />
        <text x={x1} y={V(12) - 16} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 2.5)}>
          target 12
        </text>
        <polyline points={pts(q, V, xs, xe)} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="10 6" />
        <text x={640} y={V(q(640)) + 40} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 2.5)}>
          Q
        </text>
      </g>
      <g opacity={prog(t, 1.2)}>
        <polyline points={`${xs},${L(0)} ${pts(loss, L, xs, xe)}`} fill="none" stroke={C.red} strokeWidth={4} />
        <text x={xs + 24} y={L(2) + 4} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 2.6)}>
          ½ × (12 − 10)² = 2
        </text>
      </g>
    </svg>
  )
}

function LossRead() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={460} at={0.3}>
        <JumpPlot t={t} />
        <div style={{ position: 'absolute', left: 30, top: 18 }}>
          <Head size={24}>target network 를 덮어쓴 직후의 한 sample (예로 든 값)</Head>
        </div>
      </Card>
      <Box x={1096} y={140} w={760} h={460} at={0.5} title={<Head color={C.accent}>loss 가 뛰는 이유</Head>}>
        <Row at={0.8} size={23}>
          DQN: parameter update <span style={mono(C.accent, 23)}>10,000</span> 번마다 target network 를 학습 중인 online network 로 덮어씀
        </Row>
        <Row at={2.6} size={23}>
          덮어쓴 직후 target 12, Q 는 아직 10 → squared error <span style={mono(C.red, 23)}>½ × 2² = 2</span>
        </Row>
        <Row at={6.8} size={23} color={C.orange}>
          critic 이 나빠진 것이 아니라 따라갈 목표가 움직였다
        </Row>
        <Row at={8.8} size={23} color={C.muted}>
          SAC: target network 를 매 update 조금씩 섞음 → loss 가 한 번에 뛰지 않고 완만하게 오르내림
        </Row>
      </Box>
      <Box x={64} y={620} w={876} h={260} at={12.5} gap={10} title={<Head color={C.orange}>loss 의 크기는 reward 배율을 따라간다</Head>}>
        <Row at={12.8} size={23}>
          reward × 100 → squared error <span style={mono(C.orange, 23)}>100² = 10,000</span> 배 · Huber 의 직선 구간은 <span style={mono(C.orange, 23)}>100</span> 배
        </Row>
        <Row at={14.8} size={23} color={C.muted}>
          reward 배율이나 loss 종류가 다른 두 실험의 critic loss 숫자는 직접 비교할 수 없다
        </Row>
      </Box>
      <Box x={980} y={620} w={876} h={260} at={18.5} gap={10} title={<Head color={C.green}>DQN 논문 Fig. 2 가 본 지표</Head>}>
        <Row at={18.8} size={23}>
          episode 한 번에 얻은 점수의 평균
        </Row>
        <Row at={20.2} size={23}>
          학습 전에 모아 둔 state 묶음 (held-out set) 에서 계산한 Q 의 평균
        </Row>
        <Row at={24.7} size={23} color={C.red}>
          return 은 그대로인데 평균 Q 만 계속 커지면 → critic 이 가치를 부풀리는 신호
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'Huber 와 sample 몫', color: C.accent, text: 'squared error 에서 오차 20 인 sample 의 몫 85% → Huber (δ_H = 1) 에서 29%', at: 1 },
    { tag: 'clipping 의 자리', color: C.blue, text: 'DQN error clipping = 경계 1 인 Huber · norm clipping 은 방향과 몫을 그대로 둔다', at: 4.4 },
    { tag: 'reward 크기와 경계', color: C.orange, text: 'target 0, 0, 0, 10: 평균 2.5 · 중앙값 0 · Huber (δ_H = 1) 의 답 0.33', at: 8.4 },
    { tag: 'Adam 과 loss 읽기', color: C.red, text: 'Adam 은 배율만 지우고 spike 3.29 배는 남긴다 · loss 는 target 이 움직이면 오른다', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            오차가 sample 마다 수십 배 다를 때, loss 의 선택은 학습에서 무엇을 바꿀까?
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Reward Scale &amp; Shaping</div>
        </Appear>
        <Appear at={1} style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
          <Label color={C.muted} size={34}>
            critic 이 다루는 값의 크기 자체를 바꾸는 방법
          </Label>
          <Label color={C.muted} size={30}>
            reward 에 수를 곱하거나 더할 때 policy 가 바뀌는 경우 · target 을 normalize 하는 Pop-Art · reward centering
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/critic-loss (DQN · Pascanu 등 · Adam · SAC 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseBatch = () => (
  <PauseWrite
    question="TD 오차가 1, −1, 1, −1, 16 인 batch 에서 오차 16 인 sample 이 gradient 크기의 합에서 차지하는 몫은? squared error 와 Huber (δ_H = 1) 각각"
    answer={
      <>
        squared error: 1, 1, 1, 1, 16 → 합 20 → 16 ÷ 20 = 80%
        <br />
        Huber: 다섯 sample 모두 1 → 합 5 → 1 ÷ 5 = 20%
      </>
    }
  />
)

const PauseNorm = () => (
  <PauseWrite
    question="gradient 가 (9, 12) 이고 norm clipping 의 문턱이 3 이다. 자른 뒤의 gradient 는?"
    answer={
      <>
        길이 √(9² + 12²) = √225 = 15 &gt; 3 → 배율 3 ÷ 15 = 0.2
        <br />
        (9 × 0.2, 12 × 0.2) = (1.8, 2.4) · 길이 3, 방향 그대로
      </>
    }
  />
)

const PauseMedian = () => (
  <PauseWrite
    question="같은 (s, a) 의 target 이 0 아홉 개와 20 하나다. squared error 로 맞춘 값과 Huber (δ_H = 1) 로 맞춘 값은 각각 얼마인가?"
    answer={
      <>
        squared error: 평균 20 ÷ 10 = 2
        <br />
        Huber: Q 가 0 과 1 사이면 0 아홉 개가 각각 Q 만큼 줄이고 20 은 1 만큼 키움 → 9Q = 1 → Q = 1/9 ≈ 0.11
      </>
    }
  />
)

const PauseAdam = () => (
  <PauseWrite
    question="오래 1 이던 gradient 가 한 step 만 50 이 됐다. β₁ = 0.9, β₂ = 0.999, 그 전의 m = 1, v = 1 이면 그 step 의 m / √v 는?"
    answer={
      <>
        m = 0.9 × 1 + 0.1 × 50 = 5.9 · v = 0.999 × 1 + 0.001 × 50² = 3.499
        <br />
        √3.499 ≈ 1.87 → m / √v ≈ 5.9 ÷ 1.87 ≈ 3.15 · 평소의 3 배쯤
      </>
    }
  />
)

export function CriticLoss() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        squared: Squared,
        huber: Huber,
        'pause-batch': PauseBatch,
        'dqn-clip': DqnClip,
        'norm-clip': NormClip,
        'pause-norm': PauseNorm,
        'mean-median': MeanMedian,
        scale: Scale,
        'pause-median': PauseMedian,
        adam: Adam,
        'loss-read': LossRead,
        'pause-adam': PauseAdam,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
