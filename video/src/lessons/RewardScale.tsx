import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './reward-scale.narration.json'
import { script } from './reward-scale.script'

// Numbers follow lessons/reward-scale/README.md (see reward-scale.script.ts). The Q bars in the q-init scene are schematic
// (marked 모식도, no numbers); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
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

/** a line that fades in at `at` */
function Line({ at, color = C.text, size = 23, children }: { at: number; color?: string; size?: number; children: ReactNode }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            RL · REWARD SCALE & SHAPING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Reward Scale & Shaping</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            reward 를 고치는 세 변환 <span style={{ color: C.accent }}>shaping · shift · scale</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            최적 행동을 지키는 변환과 바꾸는 변환, 그리고 SAC 에서 달라지는 결과
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
  const kinds: [string, string, string, string, number][] = [
    ['r + F', 'shaping', '목표에 가까워질 때 점수를 더 준다', C.blue, 0.5],
    ['r + c', 'shift (생존 보너스)', '넘어지지 않은 step 마다 1 씩 준다', C.green, 1.2],
    ['k × r', 'scale', '값이 너무 커서 10 으로 나눈다', C.purple, 1.9],
    ['±1', '자르기', '값이 너무 커서 ±1 로 자른다', C.red, 2.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <div style={{ position: 'absolute', left: 36, top: 22, opacity: prog(t, 0.3) }}>
          <Label size={24} color={C.muted}>
            로봇에 RL 을 쓸 때 reward 를 고치는 흔한 방법
          </Label>
        </div>
        {kinds.map(([f, name, desc, color, at], i) => (
          <div key={f} style={{ position: 'absolute', left: 36 + i * 436, top: 70, width: 412, height: 206, padding: '20px 22px', boxSizing: 'border-box', borderRadius: 18, border: `1.5px solid ${color}66`, background: `${color}10`, display: 'grid', alignContent: 'start', gap: 8, opacity: prog(t, at) }}>
            <span style={mono(color, 34)}>{f}</span>
            <span style={{ fontSize: 24, fontWeight: 600, color }}>{name}</span>
            <span style={line(C.text, 22)}>{desc}</span>
          </div>
        ))}
      </Panel>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          어떤 변환이 최적 행동을 지키고, <span style={{ color: C.accent }}>어떤 변환이 바꿀까?</span>
        </div>
      </Appear>
      <Card x={330} y={590} w={1260} h={290} at={4.8}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Line at={5} color={C.muted} size={22}>
            같은 변환도 무엇을 바꾸는지가 다르다
          </Line>
          <Line at={5.4} size={25}>
            <span style={{ color: C.green, fontWeight: 700 }}>✓</span> 최적 행동을 그대로 두고 학습만 빠르게 하는 변환
          </Line>
          <Line at={6} size={25}>
            <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 최적 행동 자체를 바꾸는 변환
          </Line>
          <Line at={6.6} size={25}>
            <span style={{ color: C.orange, fontWeight: 700 }}>!</span> 최적 행동을 지키는 변환도 SAC 처럼 entropy 를 함께 키우면 결과를 바꾼다
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- shaping and Q initialisation ----------

/** a chain of states drawn as circles with the distance to the goal inside, F above each step and Φ below each state */
function Chain({ t, at, y, xs, dist, label, labelColor }: { t: number; at: number; y: number; xs: number[]; dist: number[]; label: string; labelColor: string }) {
  const r = 34
  const step = 0.6
  return (
    <g>
      <text x={30} y={y + 9} fill={labelColor} fontSize={26} fontWeight={600} opacity={prog(t, at)}>
        {label}
      </text>
      {xs.map((x, i) => {
        const goal = dist[i] === 0
        const f = i > 0 ? dist[i - 1] - dist[i] : 0
        return (
          <g key={i}>
            {i > 0 && (
              <g opacity={prog(t, at + i * step - 0.2)}>
                {arrow(xs[i - 1] + r + 4, y, x - r - 4, y, C.muted, 3, 11)}
                <text x={(xs[i - 1] + x) / 2} y={y - 50} textAnchor="middle" fill={f > 0 ? C.green : C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {f > 0 ? '+1' : '−1'}
                </text>
              </g>
            )}
            <g opacity={prog(t, at + i * step)}>
              <circle cx={x} cy={y} r={r} fill={goal ? `${C.green}33` : C.bg} stroke={goal ? C.green : C.blue} strokeWidth={2.5} />
              <text x={x} y={y + 10} textAnchor="middle" fill={C.text} fontSize={28} fontFamily={MONO} fontWeight={600}>
                {dist[i]}
              </text>
              <text x={x} y={y + 64} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {`Φ ${dist[i] === 0 ? '0' : `−${dist[i]}`}`}
              </text>
            </g>
          </g>
        )
      })}
      <text x={900} y={y + 11} fill={C.accent} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + xs.length * step + 0.3)}>
        합 = 3
      </text>
    </g>
  )
}

function Telescoping() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={230} at={0.3} title={<Head color={C.accent}>potential-based shaping</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ ...mono(C.accent, 46), width: 560, opacity: prog(t, 0.6) }}>F = γΦ(s') − Φ(s)</span>
          <div style={{ display: 'grid', gap: 8 }}>
            <Line at={0.9}>Φ(s) 는 state 마다 정해 둔 점수이고, s 는 지금 state, s' 은 다음 state 다</Line>
            <Line at={1.6}>γ 는 미래의 reward 를 깎아 더하는 discount factor 다</Line>
            <Line at={7.2} color={C.green}>
              Ng 등(1999): 이 꼴로 더한 shaping 은 최적 policy 를 바꾸지 않는다
            </Line>
          </div>
        </div>
      </Box>
      <Card x={64} y={390} w={1100} h={490} at={13.3}>
        <svg width={1100} height={490}>
          <text x={30} y={46} fill={C.muted} fontSize={22} opacity={prog(t, 13.5)}>
            Φ(s) = −(목표까지 거리) · γ = 1 · 원 안의 숫자는 목표까지 거리
          </text>
          <Chain t={t} at={13.8} y={170} xs={[170, 330, 490, 650]} dist={[3, 2, 1, 0]} label="곧장" labelColor={C.blue} />
          <Chain t={t} at={20.7} y={360} xs={[170, 300, 430, 560, 690, 820]} dist={[3, 2, 3, 2, 1, 0]} label="돌아서" labelColor={C.orange} />
          <text x={30} y={470} fill={C.text} fontSize={23} opacity={prog(t, 24.6)}>
            멀어진 step 의 −1 이 앞에서 받은 +1 을 되돌린다
          </text>
        </svg>
      </Card>
      <Box x={1188} y={390} w={668} h={490} at={21} title={<Head color={C.orange}>γ = 1 이면 가운데 항이 지워진다</Head>}>
        <Line at={21.3}>step 마다 Φ(다음 state) − Φ(지금 state) 를 더하면, 합에는 끝과 처음만 남는다</Line>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 22.2) }}>합 = Φ(끝) − Φ(처음)</span>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 23) }}>&nbsp;&nbsp;&nbsp;= 0 − (−3) = 3</span>
        <Line at={24.2} color={C.green}>
          곧장도 3 · 돌아서도 3 → 어떤 경로가 더 좋은지는 원래 reward 만으로 정해진다
        </Line>
        <Line at={25.8} color={C.muted} size={21}>
          목표 쪽으로 갈 때만 점수를 받은 자전거가 원을 돌며 점수를 모은 일이 potential-based shaping 에서는 생기지 않는다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

/** three actions' Q as bars, before and after every one of them is lowered by the same Φ(s); schematic, no numbers */
function QShift({ t, at }: { t: number; at: number }) {
  const base = 190
  const hs = [110, 160, 80]
  const drop = 50
  const g1 = [70, 160, 250]
  const g2 = [510, 600, 690]
  const bw = 60
  return (
    <svg width={824} height={250}>
      <g opacity={prog(t, at)}>
        <text x={190} y={22} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
          원래 Q*
        </text>
        {g1.map((x, i) => (
          <g key={i}>
            <rect x={x} y={base - hs[i]} width={bw} height={hs[i]} rx={6} fill={i === 1 ? C.green : C.blue} opacity={i === 1 ? 0.9 : 0.6} />
            <text x={x + bw / 2} y={base + 26} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {`a${i + 1}`}
            </text>
          </g>
        ))}
        <line x1={50} x2={330} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
      </g>
      <g opacity={prog(t, at + 0.8)}>
        {arrow(352, 120, 470, 120, C.muted, 3, 12)}
        <text x={630} y={22} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
          shaping 을 더한 뒤
        </text>
        {g2.map((x, i) => (
          <g key={i}>
            <rect x={x} y={base - hs[i]} width={bw} height={hs[i]} rx={6} fill="none" stroke={C.dim} strokeWidth={1.5} strokeDasharray="5 5" />
            <rect x={x} y={base - hs[i] + drop} width={bw} height={hs[i] - drop} rx={6} fill={i === 1 ? C.green : C.blue} opacity={i === 1 ? 0.9 : 0.6} />
            <text x={x + bw / 2} y={base + 26} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {`a${i + 1}`}
            </text>
          </g>
        ))}
        <line x1={490} x2={770} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
      </g>
      <text x={0} y={244} fill={C.dim} fontSize={20} opacity={prog(t, at + 1.4)}>
        모식도 · 모든 action 에서 같은 Φ(s) 를 빼서 가장 큰 action (초록) 은 그대로
      </text>
    </svg>
  )
}

function QInit() {
  const t = useSec()
  const learner = (name: string, text: string, color: string, at: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${color}66`, background: `${color}10`, opacity: prog(t, at) }}>
      <span style={{ ...mono(color, 22), width: 130 }}>{name}</span>
      <span style={line(C.text, 23)}>{text}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={420} at={0.3} title={<Head color={C.accent}>shaping 을 더한 문제의 최적 Q (Ng 등)</Head>}>
        <span style={{ ...mono(C.accent, 30), opacity: prog(t, 0.6) }}>Q*shaped(s, a) = Q*(s, a) − Φ(s)</span>
        <QShift t={t} at={1.2} />
      </Box>
      <Box x={968} y={140} w={888} h={420} at={6.3} title={<Head color={C.blue}>Wiewiora (2003) 의 두 learner</Head>}>
        {learner('learner 1', 'shaping 점수 F 를 reward 에 더해 받는다', C.blue, 6.6)}
        {learner('learner 2', 'shaping 없이 Q 의 시작값을 Φ(s) 만큼 올려 둔다', C.purple, 8.4)}
        <Line at={12.7} color={C.green}>
          같은 learning rate · 같은 순서의 경험 → Q 값 update 가 매번 똑같다
        </Line>
        <Line at={14.6} size={22}>
          greedy · ε-greedy · Boltzmann policy 라면 다음 action 을 고를 확률도 같다
        </Line>
        <Line at={16.2} color={C.muted} size={21}>
          저자: Sarsa 같은 다른 TD 알고리즘과 eligibility trace 에도 이어진다
        </Line>
      </Box>
      <Box x={64} y={580} w={880} h={300} at={18.3} color={`${C.green}88`} title={<Head color={C.green}>결론: Q 값을 표로 저장하는 Q-learning</Head>}>
        <Line at={18.6} size={25}>
          shaping 대신 Q 를 Φ 로 초기화하면 된다
        </Line>
        <Line at={20.8} color={C.muted} size={22}>
          Q 를 network 로 나타내는 연속 state 문제에서는 초기화를 원하는 대로 정하기 어려워서, shaping 이 여전히 쓸모 있을 수 있다 (저자)
        </Line>
      </Box>
      <Box x={968} y={580} w={888} h={300} at={24.3} title={<Head color={C.orange}>shaping 이 학습을 빠르게 하는 이유</Head>}>
        <Line at={24.6}>목표에 가까운 state 의 Q 를 처음부터 높게 잡아 둔 것과 같아서, 탐색이 그쪽으로 먼저 끌린다</Line>
        <Line at={26.4} size={21} color={C.red}>
          ✕ 최적 policy 를 지키니 학습 과정에도 영향이 없다
        </Line>
        <Line at={27.4} size={21} color={C.green}>
          ✓ 바뀌지 않는 것은 끝까지 학습한 뒤의 최적 policy 다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- constant shift ----------

function ShiftMaze() {
  const t = useSec()
  const maze = (x: number, at: number, title: string, color: string, vals: [string, number, string][], foot: string) => (
    <Card x={x} y={350} w={880} h={330} at={at}>
      <div style={{ padding: '22px 28px', display: 'grid', gap: 16 }}>
        <Head color={color}>{title}</Head>
        <Line at={at + 0.2} color={C.muted} size={22}>
          경로마다 끝날 때까지 받은 return
        </Line>
        {vals.map(([label, v, fmt], i) => (
          <Bar key={label} label={label} value={v} max={10} fmt={fmt} color={color} at={at + 0.5 + i * 0.8} width={380} labelW={170} />
        ))}
        <Line at={at + 2.4} size={24}>
          {foot}
        </Line>
      </div>
    </Card>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={190} at={0.3} title={<Head color={C.blue}>끝없이 이어지는 문제 (continuing task)</Head>}>
        <Line at={0.6} size={24}>
          Naik 등: 모든 reward 에 상수 c 를 더하면 discount 를 쓴 가치가 <span style={mono(C.blue, 26)}>c ÷ (1 − γ)</span> 만큼 커진다
        </Line>
        <Line at={3.6} color={C.green} size={24}>
          모든 state 와 action 에 같은 양이 더해지므로, 어떤 action 이 더 좋은지는 그대로다
        </Line>
      </Box>
      {maze(64, 7, 'step 마다 −1 인 미로 · 목표에 닿으면 끝', C.red, [['5 step 경로', 5, '−5'], ['10 step 경로', 10, '−10']], '짧은 경로가 좋다 → 빨리 끝낸다')}
      {maze(976, 13.5, '모든 reward 에 2 를 더함 → step 마다 +1', C.green, [['5 step 경로', 5, '5'], ['10 step 경로', 10, '10']], '긴 경로가 좋다 → 늦게 끝내거나 끝내지 않는다')}
      <Box x={64} y={700} w={1792} h={180} at={20.5} gap={10} title={<Head color={C.orange}>episode 가 끝나는 문제에서 상수가 하는 일</Head>}>
        <Line at={20.8}>Naik 등: step 마다 −1 인 격자에서 평균을 빼면 모든 reward 가 0 → 모든 policy 가 똑같이 최적</Line>
        <Line at={24}>Kostrikov 등(2019), imitation learning: 늘 양수인 reward → 더 오래 살아남으려 함 · 늘 음수인 reward → episode 를 일찍 끝냄</Line>
      </Box>
    </AbsoluteFill>
  )
}

function Survival() {
  const t = useSec()
  const row = (y: number, at: number, stop: boolean, color: string, text: string) => (
    <g opacity={prog(t, at)}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} opacity={prog(t, at + i * 0.15)}>
          <rect x={i * 66} y={y - 26} width={56} height={44} rx={8} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={1.5} />
          <text x={i * 66 + 28} y={y + 3} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
            +1
          </text>
        </g>
      ))}
      {stop ? (
        <g stroke={color} strokeWidth={5} strokeLinecap="round">
          <line x1={406} y1={y - 16} x2={428} y2={y + 6} />
          <line x1={428} y1={y - 16} x2={406} y2={y + 6} />
        </g>
      ) : (
        <g fill={color}>
          <rect x={406} y={y - 18} width={7} height={26} rx={2} />
          <rect x={420} y={y - 18} width={7} height={26} rx={2} />
        </g>
      )}
      <text x={450} y={y + 5} fill={color} fontSize={22} fontWeight={600}>
        {text}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1100} h={360} at={0.3} title={<Head color={C.blue}>Gymnasium Hopper · 한 다리로 뛰어 앞으로 가는 로봇</Head>}>
        <Line at={0.6}>
          넘어지지 않은 step 마다 <span style={mono(C.blue, 24)}>healthy_reward</span> (기본값 <span style={mono(C.blue, 24)}>1</span>) 를 받는다 → 생존 보너스
        </Line>
        <svg width={1044} height={200}>
          {row(50, 1.5, true, C.red, '넘어져 끝남 (terminated) → 이후 reward 없음')}
          {row(150, 6.7, false, C.orange, '시간 제한으로 끊김 (truncated) → 미래가 남아 있다')}
        </svg>
      </Box>
      <Box x={1188} y={140} w={668} h={360} at={6.3} title={<Head color={C.orange}>Pardo 등 (2018)</Head>}>
        <Line at={8.5} size={22}>
          시간 제한을 진짜 종료로 다루면 남은 미래를 지운다 · 저자들이 꼽은 흔한 실수
        </Line>
        <Line at={12.8} size={22}>
          남은 시간을 모르는 PPO, γ = 1: 생존 reward 를 모으려고 제자리에 머묾
        </Line>
        <Line at={15.4} color={C.muted} size={22}>
          남은 시간을 아는 agent: 시간 제한이 과제의 끝인 Hopper 에서 시간 제한 직전에 앞으로 넘어지며 거리를 늘림
        </Line>
      </Box>
      <Box x={64} y={520} w={880} h={360} at={18.3} gap={10} title={<Head color={C.green}>legged_gym 기본 설정</Head>}>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 18.6) }}>only_positive_rewards = True</span>
        <Line at={19.2} size={22}>
          step 마다 더한 reward 의 합이 음수이면 0 으로 자른다 (설정 파일 주석)
        </Line>
        <Line at={20.6} size={22}>
          보행 reward 는 torque · 관절 가속도 같은 penalty 항이 많아 학습 초반에는 합이 음수가 되기 쉽다
        </Line>
        <Line at={22.2} color={C.muted} size={22}>
          그대로 두면 일찍 넘어져 penalty 를 덜 받는 것이 오래 서 있는 것보다 나아진다
        </Line>
      </Box>
      <Box x={968} y={520} w={888} h={360} at={24.3} title={<Head color={C.pink}>Unitree humanoid G1 학습 설정</Head>}>
        <span style={{ ...mono(C.pink, 44), opacity: prog(t, 24.6) }}>alive · 0.15</span>
        <Line at={25.2} size={22}>
          살아 있는 step 마다 0.15 를 주는 alive 항으로 생존 보너스를 직접 준다
        </Line>
        <Line at={26.8} color={C.accent} size={22}>
          시간 제한을 과제의 끝으로 볼지, 학습을 위해 자른 것으로 볼지에 따라 배워야 할 행동이 달라진다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- reward scale and SAC ----------

function Softmax() {
  const t = useSec()
  const col = (i: number, at: number, k: string, q: string, p: [number, string][], foot: string, color: string) => (
    <div style={{ position: 'absolute', left: 41 + i * 580, top: 80, width: 550, height: 340, boxSizing: 'border-box', padding: '20px 22px', borderRadius: 18, border: `1.5px solid ${color}66`, background: `${color}0d`, display: 'grid', alignContent: 'start', gap: 14, opacity: prog(t, at) }}>
      <span style={mono(color, 30)}>{`배율 ${k}`}</span>
      <span style={line(C.muted, 22)}>{`Q 값 ${q}`}</span>
      {p.map(([v, f], j) => (
        <Bar key={j} label={`action ${j + 1}`} value={v} max={1} fmt={f} color={color} at={at + 0.4 + j * 0.5} width={200} labelW={110} />
      ))}
      <span style={line(C.text, 24)}>{foot}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={260} at={0.3} title={<Head color={C.blue}>일반 RL · 모든 reward 에 양수 k 를 곱하면</Head>}>
        <Line at={0.6}>모든 return 이 k 배가 된다</Line>
        <Line at={2.4}>어떤 policy 가 더 좋은지는 그대로 → 최적 policy 를 지킨다 (Ng 등)</Line>
      </Box>
      <Box x={968} y={140} w={888} h={260} at={6.3} gap={12} title={<Head color={C.purple}>SAC · reward 와 entropy 항을 함께 키운다</Head>}>
        <Line at={6.6} size={22}>
          entropy 는 policy 가 action 을 얼마나 고르게 고르는지 재는 값이다
        </Line>
        <Line at={8.4} size={22}>
          policy 는 Q 가 큰 action 일수록 확률이 큰 꼴이다
        </Line>
        <Line at={10.2} size={22}>
          확률은 <span style={mono(C.purple, 24)}>exp(Q / α)</span> 에 비례 · α 는 entropy 항의 가중치 temperature
        </Line>
      </Box>
      <Card x={64} y={420} w={1792} h={460} at={13.3}>
        <div style={{ position: 'absolute', left: 41, top: 26, opacity: prog(t, 13.5) }}>
          <Label size={24} color={C.muted}>
            action 두 개 · 배율 1 에서 Q 값 1 과 2 · α = 1 · reward 배율을 바꾸면 Q 값도 같은 배율로 바뀐다
          </Label>
        </div>
        {col(0, 17, '0.1', '0.1, 0.2', [[0.475, '0.475'], [0.525, '0.525']], '거의 고르게 고른다', C.blue)}
        {col(1, 13.7, '1', '1, 2', [[0.269, '0.269'], [0.731, '0.731']], '좋은 쪽을 더 자주 고른다', C.green)}
        {col(2, 20.7, '10', '10, 20', [[0.00005, '0.00005'], [0.99995, '0.99995']], '거의 한쪽만 고른다', C.orange)}
      </Card>
    </AbsoluteFill>
  )
}

function SacScale() {
  const t = useSec()
  const side = (at: number, tag: string, color: string, text: string) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, opacity: prog(t, at) }}>
      <span style={{ flexShrink: 0, width: 150, boxSizing: 'border-box', textAlign: 'center', padding: '4px 0', borderRadius: 999, border: `1.5px solid ${color}88`, background: `${color}14`, color, fontSize: 22, fontWeight: 600 }}>{tag}</span>
      <span style={line(C.text, 22)}>{text}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.accent}>reward 배율 = temperature 의 역수</Head>}>
        <span style={{ ...line(C.text, 26), opacity: prog(t, 0.6) }}>
          <span style={mono(C.accent, 30)}>reward × 10</span> 은 <span style={mono(C.purple, 30)}>α ÷ 10</span> 과 같은 효과
        </span>
        {side(6.6, '배율이 작다', C.blue, 'policy 가 거의 고르게 퍼져 reward 를 활용하지 못한다')}
        {side(9.4, '배율이 크다', C.red, '거의 한 action 만 고르는 deterministic policy → 탐색이 모자라 나쁜 local minimum 에 빠진다')}
      </Box>
      <Box x={968} y={140} w={888} h={330} at={12.3} title={<Head color={C.orange}>SAC 논문 부록 Table 2 · 환경별 reward 배율</Head>}>
        <Table
          at={12.5}
          size={22}
          head={['환경', '배율']}
          widths={[640, 120]}
          rows={[
            ['Hopper-v1, Walker2d-v1, HalfCheetah-v1, Ant-v1', '5'],
            ['Humanoid-v1', '20'],
            ['Humanoid (rllab)', '10'],
          ]}
        />
        <Line at={14.8} size={22} color={C.muted}>
          저자들: reward 배율이 조정이 필요한 유일한 hyperparameter 였다
        </Line>
      </Box>
      <Box x={64} y={490} w={1792} h={390} at={18.3} title={<Head color={C.green}>후속 논문 · temperature 자동 조정</Head>}>
        <Flow at={18.6} gap={1.2} color={C.green} steps={['reward 크기가 과제마다 다르다', '학습 중 policy 가 좋아지면서도 바뀐다', 'temperature 를 자동으로 조정']} />
        <Line at={24.7}>자동 조정을 쓰면 reward 배율의 영향이 줄지만, critic 이 다루는 값의 크기는 여전히 배율을 따라간다</Line>
        <Line at={26.6} color={C.red} size={22}>
          ✕ reward 에 양수를 곱하는 것은 어떤 RL 알고리즘에서나 결과를 바꾸지 않는다
        </Line>
        <Line at={27.6} color={C.green} size={22}>
          ✓ SAC 에서는 Q 값이 1 과 2 인 예에서 배율 10 이면 좋은 action 의 확률이 0.731 에서 0.99995 로 몰린다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- clipping, Pop-Art and centering ----------

function PopArt() {
  const t = useSec()
  const chip = (text: string, color: string, at: number) => (
    <span style={{ ...mono(color, 24), padding: '6px 14px', borderRadius: 12, border: `1.5px solid ${color}66`, background: `${color}12`, opacity: prog(t, at) }}>{text}</span>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={360} at={0.3} gap={10} title={<Head color={C.red}>DQN 의 reward 자르기 (Mnih 등 2015)</Head>}>
        <Line at={0.6}>
          양수 reward → <span style={mono(C.red, 24)}>1</span> · 음수 reward → <span style={mono(C.red, 24)}>−1</span>
        </Line>
        <Line at={2.4} color={C.muted} size={22}>
          오차의 미분이 커지는 것을 막고 모든 게임에 같은 learning rate 를 쓰려고
        </Line>
        <Line at={6.7} size={22}>
          Ms. Pac-Man (van Hasselt 등): 자르기는 reward 사이의 비율을 바꾼다
        </Line>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {chip('유령 100 이상 → 1', C.orange, 7.4)}
          {chip('알약 25 → 1', C.blue, 8.2)}
        </div>
        <Line at={9.6} color={C.red} size={22}>
          reward 의 합 대신 받는 횟수를 키우게 되어, 자른 agent 는 유령을 알약보다 더 노리지 않는다
        </Line>
      </Box>
      <Box x={968} y={140} w={888} h={360} at={12.3} gap={12} title={<Head color={C.blue}>Pop-Art (van Hasselt 등 2016)</Head>}>
        <Line at={12.6} size={22}>
          target 의 평균 μ 와 표준편차 σ 를 학습 중에 이동 평균으로 추적한다
        </Line>
        <Line at={14} size={22}>
          network 는 정규화한 target <span style={mono(C.blue, 24)}>(y − μ) ÷ σ</span> 를 배운다
        </Line>
        <Line at={15.4} size={22}>
          실제 Q 값 = <span style={mono(C.blue, 24)}>σ × network 출력 + μ</span>
        </Line>
        <Line at={16.6} color={C.muted} size={21}>
          Pop = Preserving Outputs Precisely (출력을 정확히 지킨다)
        </Line>
        <Line at={17.2} color={C.muted} size={21}>
          Art = Adaptively Rescaling Targets (target 의 크기를 맞춘다)
        </Line>
      </Box>
      <Card x={64} y={520} w={1100} h={360} at={18.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.accent}>기준이 바뀌는 순간 · 마지막 층을 함께 고친다 (h = 2)</Head>
          <Table
            at={18.6}
            size={22}
            step={1}
            head={['', '기준', '마지막 층', '실제 출력 σ(W h + b) + μ']}
            widths={[130, 170, 230, 470]}
            rows={[
              ['바꾸기 전', 'σ 10, μ 0', 'W 1, b 0', '10 × (1 × 2 + 0) + 0 = 20'],
              ['바꾼 뒤', 'σ 20, μ 5', 'W 0.5, b −0.25', '20 × (0.5 × 2 − 0.25) + 5 = 20'],
            ]}
            colors={[C.text, C.green]}
          />
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 20.6) }}>새 W = 1 × 10 ÷ 20 = 0.5</span>
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 21.4) }}>새 b = (0 + 0 − 5) ÷ 20 = −0.25</span>
          <Line at={22.6} color={C.green}>
            출력은 20 그대로 · 마지막 층만 고치므로 앞의 층이 배운 표현도 그대로 남는다
          </Line>
        </div>
      </Card>
      <Box x={1188} y={520} w={668} h={360} at={24.3} gap={10} title={<Head color={C.green}>Atari 57 개 게임 · Double DQN</Head>}>
        <Line at={24.6} size={22}>
          Pop-Art 는 <span style={mono(C.green, 26)}>32 / 57</span> 개 게임에서 자른 경우와 같거나 나았다
        </Line>
        <Line at={25.8} size={22}>
          점수 중앙값 <span style={mono(C.green, 24)}>+0.4%</span> · 평균 <span style={mono(C.green, 24)}>+34%</span>
        </Line>
        <Line at={27} size={21} color={C.muted}>
          gradient norm 범위: 자르지 않으면 여섯 자릿수 넘게, 자르면 네 자릿수 가까이, Pop-Art 는 두 자릿수 안
        </Line>
        <Line at={28.2} size={21} color={C.muted}>
          Time Pilot 처럼 더 나빴던 게임도 있다 · 자르기를 그만두면 문제 자체가 바뀌기 때문이다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Centering() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={300} at={0.3} title={<Head color={C.accent}>reward centering (Naik 등 2024)</Head>}>
        <Line at={0.6}>지금까지 받은 reward 의 평균을 추정해 두고, 받은 reward 에서 평균을 뺀 값으로 학습한다</Line>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 2.4) }}>평균 ← 평균 + β(R − 평균)</span>
        <Line at={3.4} color={C.muted} size={21}>
          R 은 이번 step 의 reward · β 는 0 과 1 사이의 작은 비율 · ← 는 왼쪽 값을 오른쪽 값으로 바꾼다는 뜻
        </Line>
      </Box>
      <Box x={968} y={140} w={888} h={300} at={6.3} gap={12} title={<Head color={C.orange}>가치에 들어 있는 공통 항</Head>}>
        <Line at={6.6} size={22}>
          공통 항 = 평균 reward <span style={mono(C.orange, 24)}>r(π) ÷ (1 − γ)</span>
        </Line>
        <Line at={7.8} size={22}>
          모든 state 에 똑같이 들어 있어 어떤 action 이 좋은지와는 상관없지만, γ 가 1 에 가까울수록 커진다
        </Line>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 9.6) }}>평균 1, γ = 0.99 → 1 ÷ 0.01 = 100</span>
        <Line at={11} color={C.muted} size={21}>
          state 사이 차이가 1 정도인 값을 100 근처에서 나타내야 한다
        </Line>
      </Box>
      <Card x={64} y={460} w={1100} h={420} at={12.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.blue}>state 세 개짜리 순환 문제 (평균 reward 1)</Head>
          <Table
            at={12.6}
            head={['γ', '보통의 가치 (A, B, C)', '평균을 뺀 가치 (A, B, C)']}
            widths={[120, 430, 430]}
            rows={[
              ['0.8', '6.15, 3.93, 4.92', '1.15, −1.07, −0.08'],
              ['0.9', '11.07, 8.97, 9.96', '1.07, −1.03, −0.04'],
              ['0.99', '101.01, 98.99, 99.99', '1.01, −1.01, −0.01'],
            ]}
            colors={[C.text, C.text, C.accent]}
          />
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 18.7) }}>γ = 0.99 줄: A − B = 101.01 − 98.99 = 2.02</span>
          <Line at={19.8} color={C.red} size={22}>
            출력이 1% 만 틀려도 오차는 약 1 → 두 state 차이의 절반
          </Line>
          <Line at={21.6} color={C.green} size={22}>
            평균을 뺀 1.01 과 −1.01 에서는 같은 1% 오차가 0.01 에 그친다
          </Line>
        </div>
      </Card>
      <Box x={1188} y={460} w={668} h={420} at={24.3} gap={12} title={<Head color={C.red}>상수와 episode 문제</Head>}>
        <Line at={24.6} size={21}>
          reward 에 상수 c 를 더해도 평균이 c 만큼 커져서, 평균을 뺀 가치는 그대로다
        </Line>
        <Line at={25.8} size={21} color={C.muted}>
          Access-Control Queuing 문제에서 모든 reward 에 −8 ~ 8 의 상수를 더하자, 평균을 빼지 않은 Q-learning 은 상수마다 결과가 크게 달랐다
        </Line>
        <Line at={27.2} size={21} color={C.orange}>
          끝없이 이어지는 문제를 위한 방법이다 · episode 문제에서는 문제 자체가 바뀔 수 있다
        </Line>
        <Line at={28.4} size={21} color={C.muted}>
          부록: 모든 state 에 Φ(s) = r(π) ÷ (1 − γ) 를 쓰는 potential-based shaping 과 같다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.blue, text: 'F 의 합 = Φ(끝) − Φ(처음) · 곧장도 돌아서도 3 · Q 를 Φ 로 초기화한 것과 같다', at: 0.4 },
    { tag: script.sections[1], color: C.green, text: 'step 마다 −1 에 2 를 더하면 return −5, −10 → 5, 10 · Hopper 1, G1 0.15 의 생존 보너스', at: 4.4 },
    { tag: script.sections[2], color: C.purple, text: 'SAC 에서 배율은 temperature 의 역수 · 0.731 → 0.99995 · 환경마다 배율 5, 10, 20', at: 8.4 },
    { tag: script.sections[3], color: C.orange, text: '자르면 유령 100 이상도 알약 25 도 1 · Pop-Art 는 출력 20 유지 · centering 은 100 근처 → 1, −1, 0 근처', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            어떤 변환이 무엇을 바꿀까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.4 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>RL Experiments</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            이런 변환이 정말 도움이 됐는지 확인하기 · seed 를 몇 개 쓰고 결과를 어떻게 적을지
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/reward-scale (Ng · Wiewiora · SAC · Pop-Art · Reward Centering · Time Limits 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseShaping = () => (
  <PauseWrite
    question="Φ(s) = −(목표까지 거리), γ = 1 이고 출발점의 거리가 4 다. 4 → 3 → 4 → 3 → 2 → 1 → 0 으로 간 경로의 shaping 점수 합은?"
    answer={
      <>
        F = +1, −1, +1, +1, +1, +1 → 합 4
        <br />
        규칙으로는 Φ(목표) − Φ(처음) = 0 − (−4) = 4 · 곧장 갔을 때와 같다
      </>
    }
  />
)

const PauseShift = () => (
  <PauseWrite
    question="step 마다 −0.5 를 받는 미로에 3 step 경로와 8 step 경로가 있다. 모든 reward 에 1 을 더하면 두 경로의 return 은? 어느 쪽이 더 좋아지나?"
    answer={
      <>
        step 마다 −0.5 + 1 = 0.5 → 3 × 0.5 = 1.5 · 8 × 0.5 = 4
        <br />
        원래 −1.5 와 −4 로 짧은 경로가 좋았지만, 이제 긴 경로가 더 좋다
      </>
    }
  />
)

const PauseScale = () => (
  <PauseWrite
    question="action 두 개의 Q 값이 0 과 1 이고, 확률이 exp(Q / α) 에 비례하며 α = 0.5 다. 좋은 action 의 확률은? reward 를 2 배 하면?"
    answer={
      <>
        지수 0, 2 → 7.39 ÷ (1 + 7.39) = 7.39 ÷ 8.39 ≈ 0.88
        <br />
        2 배: 지수 0, 4 → 54.6 ÷ 55.6 ≈ 0.98 · α 를 절반으로 줄인 것과 같다
      </>
    }
  />
)

const PauseCenter = () => (
  <PauseWrite
    question="평균 reward 가 2 인 끝없이 이어지는 문제에서 γ = 0.95 다. 모든 state 의 가치에 공통으로 들어가는 항은? reward 에서 평균을 빼면?"
    answer={
      <>
        공통 항 = 2 ÷ (1 − 0.95) = 2 ÷ 0.05 = 40
        <br />
        평균 2 를 빼면 평균 reward 가 0 → 0 ÷ 0.05 = 0
      </>
    }
  />
)

export function RewardScale() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        telescoping: Telescoping,
        'q-init': QInit,
        'pause-shaping': PauseShaping,
        'shift-maze': ShiftMaze,
        survival: Survival,
        'pause-shift': PauseShift,
        softmax: Softmax,
        'sac-scale': SacScale,
        'pause-scale': PauseScale,
        popart: PopArt,
        centering: Centering,
        'pause-center': PauseCenter,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
