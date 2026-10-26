import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { Appear, Label, lerp, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './vla-tokens.narration.json'
import { script } from './vla-tokens.script'

// ---------- shared numbers (lessons/vla-tokens/README.md) ----------

/** the lesson's example bins for one action's 7 tokens (figures/generate-actions.svg) */
const EX_BINS = [138, 173, 97, 188, 128, 115, 121]
/** OpenVLA's 7 action numbers (figures/vla-overview.svg) */
const DIMS: { group: number; name: string }[] = [
  { group: 0, name: '위치 변화 x' },
  { group: 0, name: '위치 변화 y' },
  { group: 0, name: '위치 변화 z' },
  { group: 1, name: '회전 변화 x' },
  { group: 1, name: '회전 변화 y' },
  { group: 1, name: '회전 변화 z' },
  { group: 2, name: '집게' },
]
const GROUP_COLOR = [C.blue, C.orange, C.green]

/** Korean reads in the sans face; the mono face only for numbers and code-like labels */
const fam = (s: string) => (/[가-힣]/.test(s) ? SANS : MONO)
/** a signed degree label with a real minus sign */
const sgn = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${-d}` : `${d}`)

/** a fixed pseudo-random number in [0, 1) for index i, so every frame draws the same scatter */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function Arrow({ x1, y1, x2, y2, p = 1, color = C.muted, width = 3 }: { x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; width?: number }) {
  if (p <= 0) return null
  const x = lerp(x1, x2, p)
  const y = lerp(y1, y2, p)
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hs = 14
  return (
    <g>
      <line x1={x1} y1={y1} x2={x - Math.cos(a) * hs * 0.7} y2={y - Math.sin(a) * hs * 0.7} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path d={`M ${x} ${y} L ${x - hs * Math.cos(a - 0.45)} ${y - hs * Math.sin(a - 0.45)} L ${x - hs * Math.cos(a + 0.45)} ${y - hs * Math.sin(a + 0.45)} Z`} fill={color} />
    </g>
  )
}

/** a token drawn in SVG: a rounded chip with its name */
function SvgChip({ x, y, w, h = 46, text, color = C.purple, opacity = 1, size = 22, filled = true }: { x: number; y: number; w: number; h?: number; text: string; color?: string; opacity?: number; size?: number; filled?: boolean }) {
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={filled ? `${color}2e` : 'none'} stroke={color} strokeWidth={2} strokeDasharray={filled ? undefined : '6 6'} />
      {text && (
        <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fill={C.text} fontSize={size} fontFamily={fam(text)} fontWeight={600}>
          {text}
        </text>
      )}
    </g>
  )
}

/** a token drawn in HTML */
function Chip({ children, color = C.cardEdge, text = C.text, size = 28, style }: { children: ReactNode; color?: string; text?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '8px 18px',
        borderRadius: 12,
        border: `2px solid ${color}`,
        background: `${color}22`,
        color: text,
        fontFamily: typeof children === 'string' ? fam(children) : SANS,
        fontSize: size,
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

function Intro() {
  const t = useSec()
  const chips = script.sections
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 26, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 6 · VLA
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.03em' }}>RT-2 → OpenVLA</div>
        </Appear>
        <Appear at={1.1}>
          <Label color={C.muted} size={40}>
            인터넷으로 배운 VLM 이 로봇 action 을 token 으로 쓰는 방법과 그 대가
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
          {chips.map((c, i) => (
            <Appear key={c} at={2 + i * 0.45}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 26px',
                  borderRadius: 999,
                  border: `1.5px solid ${C.cardEdge}`,
                  background: C.card,
                  fontSize: 30,
                  transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 2 - i * 0.45) * 2)})`,
                }}
              >
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
  const vocab = ['the', 'cup', 'box', 'put', 'red', 'in']
  const picked = t > 2 ? Math.floor((t - 2) / 0.55) % vocab.length : -1
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50, marginTop: -40 }}>
        <Appear at={0.3}>
          <div style={{ fontSize: 70, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            token 만 고를 수 있는 language model 이
            <br />
            <span style={{ color: C.accent }}>10.3° 같은 관절 각도를 어떻게 낼까?</span>
          </div>
        </Appear>
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          <Appear at={1.6}>
            <Panel x={0} y={0} w={560} h={250} style={{ position: 'relative' }}>
              <div style={{ padding: '22px 28px', display: 'grid', gap: 22 }}>
                <Label size={26}>language model 이 내는 것: token 하나</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {vocab.map((w, i) => (
                    <Chip key={w} color={i === picked ? C.accent : C.cardEdge} size={26}>
                      {w}
                    </Chip>
                  ))}
                  <Chip size={26} text={C.muted}>
                    …
                  </Chip>
                </div>
              </div>
            </Panel>
          </Appear>
          <Appear at={3.2}>
            <span style={{ fontSize: 80, fontWeight: 700, color: C.muted }}>?</span>
          </Appear>
          <Appear at={3.6}>
            <Panel x={0} y={0} w={560} h={250} style={{ position: 'relative' }}>
              <div style={{ padding: '22px 28px', display: 'grid', gap: 20 }}>
                <Label size={26}>로봇 팔이 받아야 하는 것: 실수</Label>
                <div style={{ fontSize: 64, fontWeight: 600, color: C.orange }}>관절 1 = 10.3°</div>
              </div>
            </Panel>
          </Appear>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ---------- action token: a joint value snapping into one of 256 bins ----------

const BR = { x0: 80, x1: 1712, top: 170, bot: 256 }

function Bins() {
  const t = useSec()
  // zoom from the whole range −128° ~ +128° to 4.5° ~ 16.5° around bin 138
  const z = prog(t, 12.2, 2.4)
  const width = Math.exp(lerp(Math.log(256), Math.log(12), z))
  const center = lerp(0, 10.5, z)
  const lo = center - width / 2
  const hi = center + width / 2
  const X = (v: number) => BR.x0 + ((v - lo) / (hi - lo)) * (BR.x1 - BR.x0)
  const cellW = X(1) - X(0)
  const split = interpolate(t, [6.4, 9], [0, 256], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const v = 10.3 * prog(t, 0.8, 2.2)
  const drop = prog(t, 14.6, 0.6)
  const hl = prog(t, 15, 0.5)
  const back = prog(t, 19.4, 0.6)
  const gap = prog(t, 23.8, 0.6)

  const cells = []
  for (let b = 0; b < 256; b++) {
    const a0 = -128 + b
    const xa = Math.max(X(a0), BR.x0)
    const xb = Math.min(X(a0 + 1), BR.x1)
    if (xb <= BR.x0 || xa >= BR.x1) continue
    const on = Math.min(1, Math.max(0, split - b))
    cells.push(
      <g key={b} opacity={on}>
        <rect x={xa} y={BR.top} width={xb - xa} height={BR.bot - BR.top} fill={b % 2 ? '#0e1628' : '#1a2740'} />
        {b === 138 && <rect x={xa} y={BR.top} width={xb - xa} height={BR.bot - BR.top} fill={C.accent} opacity={0.4 * hl} />}
        <line x1={xa} x2={xa} y1={BR.top} y2={BR.bot} stroke={C.muted} strokeWidth={1.5} opacity={Math.min(1, Math.max(0, (cellW - 4) / 30))} />
        {cellW > 60 && (
          <text x={(xa + xb) / 2} y={BR.top + 32} textAnchor="middle" fill={b === 138 ? C.text : C.muted} fontSize={24} fontFamily={MONO} fontWeight={b === 138 ? 700 : 400} opacity={prog(t, 13.8, 0.6)}>
            {b}
          </text>
        )}
      </g>,
    )
  }

  const farTicks = [-128, -64, 0, 64, 128]
  const nearTicks: number[] = []
  for (let d = Math.ceil(lo); d <= Math.floor(hi); d++) nearTicks.push(d)

  const steps = [
    { at: 12.4, title: '시연의 각도', value: '10.3°', color: C.orange, size: 36 },
    { at: 15.2, title: '칸 번호', value: '138', color: C.accent, size: 36 },
    { at: 16.4, title: 'action token', value: '138 번 칸의 token', color: C.purple, size: 28 },
    { at: 19.8, title: '되돌린 값 · 칸의 가운데', value: '10.5°', color: C.green, size: 36 },
  ]
  const boxX = (i: number) => 80 + i * 444
  const links = [
    { at: 15.2, lines: ['(10.3 + 128) ÷ 1 = 138.3', '→ 내림 → 138'] },
    { at: 16.4, lines: ['칸 번호마다', 'token 하나를 짝짓는다'] },
    { at: 19.8, lines: ['모델이 이 token 을 내면', '−128 + 138.5 × 1 = 10.5'] },
  ]

  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740} style={{ position: 'absolute', inset: 0 }}>
          <text x={BR.x0} y={56} fontSize={30} fontWeight={600} fill={C.text} opacity={prog(t, 0.6)}>
            관절 1 의 범위 −128° ~ +128°
            <tspan fill={C.accent} opacity={prog(t, 6.6)}>
              {' '}→ 같은 폭의 칸 256 개
            </tspan>
          </text>
          <text x={BR.x1} y={56} textAnchor="end" fontSize={28} fontWeight={600} fill={C.accent} opacity={prog(t, 9.4)}>
            칸 폭 = 256° ÷ 256 = 1°
          </text>
          <text x={BR.x0} y={150} fontSize={22} fill={C.muted} opacity={prog(t, 12.6) * (1 - prog(t, 18, 0.4))}>
            ▸ 10° 근처를 확대
          </text>
          {/* the continuous range, before it is cut into bins */}
          <rect x={BR.x0} y={BR.top} width={BR.x1 - BR.x0} height={BR.bot - BR.top} fill="#0e1628" stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 0.4)} />
          {cells}
          <rect x={BR.x0} y={BR.top} width={BR.x1 - BR.x0} height={BR.bot - BR.top} fill="none" stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 0.4)} />
          {farTicks.map((d) => (
            <text key={d} x={X(d)} y={BR.bot + 38} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO} opacity={prog(t, 0.6) * (1 - prog(t, 12.2, 0.5))}>
              {sgn(d)}°
            </text>
          ))}
          {nearTicks.map((d) => (
            <text key={d} x={X(d)} y={BR.bot + 38} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO} opacity={prog(t, 13.6, 0.6)}>
              {d}°
            </text>
          ))}
          {/* the joint value: a continuous number */}
          <g opacity={prog(t, 0.6)}>
            <line x1={X(v)} x2={X(v)} y1={112} y2={BR.bot} stroke={C.orange} strokeWidth={3} />
            <path d={`M ${X(v) - 11} 106 L ${X(v) + 11} 106 L ${X(v)} 122 Z`} fill={C.orange} />
            <text x={X(v)} y={94} textAnchor="middle" fill={C.orange} fontSize={30} fontFamily={MONO} fontWeight={600}>
              {v.toFixed(1)}°
            </text>
          </g>
          {/* it drops into bin 138 */}
          {drop > 0 && <circle cx={X(10.3)} cy={lerp(124, BR.bot - 22, drop)} r={11} fill={C.orange} stroke={C.card} strokeWidth={3} />}
          {/* back to the bin's centre */}
          <g opacity={back}>
            <line x1={X(10.5)} x2={X(10.5)} y1={BR.top - 14} y2={BR.bot + 8} stroke={C.green} strokeWidth={3} strokeDasharray="7 6" />
            <circle cx={X(10.5)} cy={BR.bot - 22} r={9} fill={C.green} stroke={C.card} strokeWidth={3} />
            <text x={X(10.5) + 14} y={BR.top - 18} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              10.5°
            </text>
          </g>
          <g opacity={gap}>
            <line x1={X(10.3)} x2={X(10.5)} y1={BR.bot + 16} y2={BR.bot + 16} stroke={C.red} strokeWidth={4} />
            <line x1={X(10.3)} x2={X(10.3)} y1={BR.bot + 8} y2={BR.bot + 24} stroke={C.red} strokeWidth={3} />
            <line x1={X(10.5)} x2={X(10.5)} y1={BR.bot + 8} y2={BR.bot + 24} stroke={C.red} strokeWidth={3} />
            <text x={X(10.4)} y={BR.bot + 72} textAnchor="middle" fill={C.red} fontSize={26} fontFamily={MONO} fontWeight={700}>
              0.2°
            </text>
          </g>
          {/* the round trip */}
          {links.map((l, i) => {
            const x1 = boxX(i) + 300
            const x2 = boxX(i + 1)
            return (
              <g key={i}>
                <Arrow x1={x1 + 14} y1={490} x2={x2 - 14} y2={490} p={prog(t, l.at - 0.3, 0.5)} color={C.muted} />
                {l.lines.map((s, j) => (
                  <text key={j} x={(x1 + x2) / 2} y={600 + j * 32} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={fam(s)} opacity={prog(t, l.at + 0.2)}>
                    {s}
                  </text>
                ))}
              </g>
            )
          })}
          <text x={896} y={705} textAnchor="middle" fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 24.2)}>
            어긋남 10.5° − 10.3° = 0.2° · 가장 크게는 칸 폭 ÷ 2 = 0.5° 까지
          </text>
        </svg>
        {steps.map((s, i) => (
          <Appear key={s.title} at={s.at} style={{ position: 'absolute', left: boxX(i), top: 430, width: 300 }}>
            <div style={{ height: 120, borderRadius: 18, border: `2px solid ${s.color}`, background: `${s.color}14`, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 6 }}>
              <Label size={22}>{s.title}</Label>
              <span style={{ fontFamily: fam(s.value), fontSize: s.size, fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
          </Appear>
        ))}
        <Appear at={0.8} out={11} style={{ position: 'absolute', left: 80, top: 420, width: 1632 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <Label size={26}>vocabulary · language model 이 쓸 수 있는 token 의 목록</Label>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              {['the', 'cup', 'box', 'put', 'red', 'in', '…'].map((w) => (
                <Chip key={w} size={30}>
                  {w}
                </Chip>
              ))}
              <Appear at={2.8} style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 30 }}>
                <Chip color={C.red} text={C.red} size={30} style={{ textDecoration: 'line-through' }}>
                  10.3
                </Chip>
                <Label color={C.red} size={28} weight={600}>
                  ✕ 실수는 목록에 없다
                </Label>
              </Appear>
            </div>
          </div>
        </Appear>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- action token: 7 tokens, and which vocabulary entries they take ----------

function Vocab() {
  const t = useSec()
  const groups = [
    { name: '손끝 위치 변화 3', from: 0, n: 3 },
    { name: '회전 변화 3', from: 3, n: 3 },
    { name: '집게 1', from: 6, n: 1 },
  ]
  const slotX = (i: number) => 170 + i * 230
  // the vocabulary bar, ordered by how often a token is used (not to scale)
  const N = 214
  const TAIL = 167
  const bx = (i: number) => 40 + i * 8
  const frequent = ['the', 'cup', 'put', 'box', 'red']
  const bad = prog(t, 13.4)
  return (
    <AbsoluteFill>
      {/* one action = 7 tokens */}
      {groups.map((g, k) => (
        <Appear key={g.name} at={2.6 + k * 0.3} style={{ position: 'absolute', left: slotX(g.from), top: 150, width: g.n * 230 - 30 }}>
          <div style={{ borderBottom: `3px solid ${GROUP_COLOR[k]}`, paddingBottom: 8, textAlign: 'center' }}>
            <Label color={GROUP_COLOR[k]} size={26} weight={600}>
              {g.name}
            </Label>
          </div>
        </Appear>
      ))}
      {DIMS.map((d, i) => (
        <Appear key={d.name} at={0.5 + i * 0.3} style={{ position: 'absolute', left: slotX(i), top: 214, width: 200 }}>
          <div style={{ height: 136, borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 14 }}>
            <Label color={C.muted} size={22}>
              {`자리 ${i + 1} · ${d.name}`}
            </Label>
            <Chip color={C.purple} size={26}>
              {`칸 ${EX_BINS[i]}`}
            </Chip>
          </div>
        </Appear>
      ))}
      <Appear at={3.6} style={{ position: 'absolute', left: 170, top: 372, width: 1580, textAlign: 'center' }}>
        <Label color={C.text} size={26}>
          action 하나 = token 7 개. 같은 action token 256 개를 7 자리가 함께 쓰고, 자리마다 그 차원의 범위로 되돌린다
        </Label>
      </Appear>
      <Panel x={64} y={460} w={1792} h={420} style={{ opacity: prog(t, 5.8) }}>
        <svg width={1792} height={420}>
          <text x={40} y={52} fontSize={28} fontWeight={600} fill={C.text}>
            Llama tokenizer 의 vocabulary
            <tspan fill={C.muted} fontSize={22} fontWeight={400}>
              {'  '}쓰이는 빈도 순으로 늘어놓음 · 길이는 비율대로 그리지 않음
            </tspan>
          </text>
          {/* room for new tokens: 100 < 256 */}
          <g opacity={prog(t, 7)}>
            <text x={1240} y={40} fill={C.text} fontSize={22}>
              새 token 을 더할 자리 <tspan fontFamily={MONO} fill={C.orange} fontWeight={600}>100</tspan> 개 &lt; 필요한 <tspan fontFamily={MONO} fill={C.purple} fontWeight={600}>256</tspan> 개
            </text>
            <rect x={1240} y={54} width={100 * 1.8 * prog(t, 7.2, 0.6)} height={14} rx={4} fill={C.orange} />
            <rect x={1240} y={76} width={256 * 1.8 * prog(t, 7.6, 0.8)} height={14} rx={4} fill="none" stroke={C.purple} strokeWidth={2} strokeDasharray="6 4" />
          </g>
          {/* frequent tokens */}
          {frequent.map((w, k) => {
            const cx = 40 + k * 112
            const isBad = w === 'the' || w === 'cup'
            return (
              <g key={w} opacity={prog(t, 6.4 + k * 0.15)}>
                <line x1={cx + 45} y1={158} x2={cx + 45} y2={188} stroke={C.dim} strokeWidth={2} />
                <SvgChip x={cx} y={112} w={90} h={44} text={w} color={isBad && bad > 0 ? C.red : C.blue} size={22} />
                {isBad && (
                  <text x={cx + 45} y={102} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={700} opacity={bad}>
                    ✕
                  </text>
                )}
              </g>
            )
          })}
          {Array.from({ length: N }, (_, i) => {
            const tail = i >= TAIL
            const take = tail ? prog(t, 9.9 + (i - TAIL) * 0.03, 0.3) : 0
            const base = 0.85 - (0.6 * i) / N
            return (
              <g key={i}>
                <rect x={bx(i)} y={190} width={7} height={60} fill={C.blue} opacity={base * (1 - take)} />
                <rect x={bx(i)} y={190} width={7} height={60} fill={C.purple} opacity={take} />
              </g>
            )
          })}
          <text x={bx(N)} y={176} textAnchor="end" fill={C.purple} fontSize={24} fontWeight={600} opacity={prog(t, 10.4)}>
            가장 덜 쓰이는 token 256 개 → action token 으로 덮어씀
          </text>
          <text x={40} y={286} fill={C.muted} fontSize={22}>
            ← 자주 쓰임
          </text>
          <text x={bx(N)} y={286} textAnchor="end" fill={C.muted} fontSize={22}>
            거의 안 쓰임 →
          </text>
          <text x={40} y={350} fill={C.red} fontSize={28} fontWeight={600} opacity={bad}>
            ✕ "the", "cup" 을 덮어쓰면 지시문을 못 읽는다
          </text>
          <text x={bx(N)} y={350} textAnchor="end" fill={C.green} fontSize={28} fontWeight={600} opacity={prog(t, 15.6)}>
            ✓ 거의 안 나오는 token 은 뜻을 잃어도 손해가 적다
          </text>
          <text x={40} y={396} fill={C.dim} fontSize={20} opacity={prog(t, 11)}>
            OpenVLA 논문에 따른 방식 · 칸 번호와 token 을 짝짓는 세부 순서는 여기서 다루지 않는다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- action token: where the range ends ----------

const Q = { x0: 120, x1: 1680 }
/** demo values of one joint, almost all within −10° ~ +10° */
const VALUES = Array.from({ length: 110 }, (_, i) => (0.55 * ((rand(i) + rand(i + 500)) / 2) + 0.45 * rand(i + 900)) * 19.6 - 9.8)

function Quantile() {
  const t = useSec()
  const hiA = lerp(10, 200, prog(t, 3.6, 1.8))
  const XA = (v: number) => Q.x0 + ((v + 10) / (hiA + 10)) * (Q.x1 - Q.x0)
  const XB = (v: number) => Q.x0 + ((v + 10) / 20) * (Q.x1 - Q.x0)
  const binsA = prog(t, 6.8)
  const binsB = prog(t, 13.4)
  const showB = prog(t, 13.1)
  const A = { top: 200, bot: 240 }
  const B = { top: 540, bot: 580 }
  const lines16 = Array.from({ length: 17 }, (_, k) => k * 16)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740}>
          {/* A: min ~ max */}
          <text x={Q.x0} y={60} fill={C.text} fontSize={30} fontWeight={600} opacity={prog(t, 0.3)}>
            범위 = 시연의 최솟값 ~ 최댓값
          </text>
          <text x={Q.x1} y={60} textAnchor="end" fill={C.muted} fontSize={22} opacity={prog(t, 0.6)}>
            OpenVLA 논문에 따르면 RT-2 의 방식
          </text>
          <rect x={Q.x0} y={A.top} width={Q.x1 - Q.x0} height={A.bot - A.top} fill="#0e1628" stroke={C.cardEdge} strokeWidth={2} />
          <rect x={XA(-10)} y={A.top} width={XA(10) - XA(-10)} height={A.bot - A.top} fill={C.accent} opacity={0.35 * prog(t, 7.6)} />
          {lines16.map((b) => {
            const x = Q.x0 + (b / 256) * (Q.x1 - Q.x0)
            return <line key={b} x1={x} x2={x} y1={A.top} y2={A.bot} stroke={C.muted} strokeWidth={1.5} opacity={binsA} />
          })}
          {VALUES.map((v, i) => (
            <circle key={i} cx={XA(v)} cy={186 - rand(i + 2000) * 60} r={5} fill={C.orange} opacity={prog(t, 0.5 + i * 0.012, 0.3) * 0.85} />
          ))}
          <g opacity={prog(t, 3.0, 0.4)}>
            <circle cx={Math.min(XA(200), Q.x1)} cy={176} r={10} fill={C.red} />
            <text x={Math.min(XA(200), Q.x1)} y={150} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600}>
              튄 값 +200°
            </text>
          </g>
          {[-10, 10, 100, 200]
            .filter((d) => d <= hiA + 1e-6)
            .map((d) => (
              <text key={d} x={XA(d)} y={A.bot + 34} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 0.6)}>
                {sgn(d)}°
              </text>
            ))}
          <text x={(XA(10) + Q.x1) / 2} y={176} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 10.6)}>
            남은 약 232 칸은 거의 비어 있다
          </text>
          <text x={Q.x0} y={318} fill={C.accent} fontSize={26} fontWeight={600} opacity={prog(t, 8)}>
            값이 모인 −10° ~ +10°: 20 ÷ 0.82 ≈ 24 칸
          </text>
          <text x={Q.x1} y={318} textAnchor="end" fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 7)}>
            칸 폭 210 ÷ 256 ≈ 0.82°
          </text>

          {/* B: 1% ~ 99% quantiles */}
          <g opacity={showB}>
            <line x1={40} x2={1752} y1={366} y2={366} stroke={C.cardEdge} strokeWidth={2} />
            <text x={Q.x0} y={420} fill={C.text} fontSize={30} fontWeight={600}>
              범위 = 1% ~ 99% 분위수 (아래 1%, 위 1% 를 뺀 범위)
            </text>
            <text x={Q.x1} y={420} textAnchor="end" fill={C.purple} fontSize={24} fontWeight={600}>
              OpenVLA
            </text>
            <rect x={Q.x0} y={B.top} width={Q.x1 - Q.x0} height={B.bot - B.top} fill="#0e1628" stroke={C.cardEdge} strokeWidth={2} />
            <rect x={Q.x0} y={B.top} width={Q.x1 - Q.x0} height={B.bot - B.top} fill={C.accent} opacity={0.3 * prog(t, 15)} />
            {lines16.map((b) => {
              const x = Q.x0 + (b / 256) * (Q.x1 - Q.x0)
              return <line key={b} x1={x} x2={x} y1={B.top} y2={B.bot} stroke={C.muted} strokeWidth={1.5} opacity={binsB} />
            })}
            {VALUES.map((v, i) => (
              <circle key={i} cx={XB(v)} cy={526 - rand(i + 2000) * 60} r={5} fill={C.orange} opacity={prog(t, 13.3 + i * 0.008, 0.3) * 0.85} />
            ))}
            {[-10, 0, 10].map((d) => (
              <text key={d} x={XB(d)} y={B.bot + 34} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {sgn(d)}°
              </text>
            ))}
            <g opacity={prog(t, 16.6)}>
              <circle cx={1730} cy={500} r={10} fill={C.red} />
              <text x={1730} y={474} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
                +200°
              </text>
              <path d={`M 1730 512 Q 1724 560 ${Q.x1 - 8} 560`} fill="none" stroke={C.red} strokeWidth={3} />
              <path d={`M ${Q.x1 - 6} 560 l 12 -8 l 0 16 Z`} fill={C.red} transform={`rotate(180 ${Q.x1} 560)`} />
            </g>
            <text x={Q.x0} y={672} fill={C.accent} fontSize={26} fontWeight={600} opacity={prog(t, 14.6)}>
              칸 폭 20 ÷ 256 ≈ 0.078° · 256 칸 모두 값이 모인 곳에 쓰인다
            </text>
            <text x={Q.x1} y={672} textAnchor="end" fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 16.8)}>
              범위 밖 값은 clip → 255 번 칸
            </text>
          </g>
          <text x={Q.x0} y={716} fill={C.dim} fontSize={20} opacity={binsA}>
            세로선은 16 칸마다 하나
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- OpenVLA: the computation ----------

function Arch() {
  const t = useSec()
  const struct = prog(t, 0.8, 0.8)
  const lit = (at: number) => struct * lerp(0.3, 1, prog(t, at, 0.6))
  const tokAt = (i: number) => 16 + i * 0.45
  const outs = EX_BINS.filter((_, i) => t >= tokAt(i)).length
  const pulse = outs > 0 && t < tokAt(6) + 0.45 ? 0.5 + 0.5 * Math.cos(((t - tokAt(0)) / 0.45) * 2 * Math.PI) : 0
  const llmOn = prog(t, 15.5, 0.6)
  const grid = []
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const i = r * 16 + c
      grid.push(<rect key={i} x={790 + c * 13} y={92 + r * 13} width={11} height={11} rx={2} fill={C.blue} opacity={prog(t, 10.1 + i * 0.008, 0.3)} />)
    }
  }
  const textToks = ['put', 'the', 'red', 'cup', 'in', '…']
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740}>
          {/* Prismatic-7B */}
          <g opacity={struct}>
            <rect x={370} y={20} width={1000} height={604} rx={24} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="10 8" opacity={0.7} />
            <text x={394} y={56} fill={C.accent} fontSize={24} fontWeight={600}>
              Prismatic-7B · 출발점이 된 VLM
            </text>
          </g>
          {/* inputs */}
          <g opacity={prog(t, 0.4)}>
            <text x={50} y={72} fill={C.text} fontSize={26} fontWeight={600}>
              카메라 사진
            </text>
            <text x={50} y={102} fill={C.muted} fontSize={22}>
              224×224 한 장
            </text>
            <rect x={50} y={118} width={260} height={200} rx={14} fill="#0e1628" stroke={C.cardEdge} strokeWidth={2} />
            <rect x={50} y={258} width={260} height={60} fill="#1a2740" />
            <rect x={108} y={212} width={40} height={48} rx={6} fill={C.red} />
            <rect x={196} y={208} width={88} height={52} rx={4} fill="none" stroke={C.orange} strokeWidth={4} />
          </g>
          <g opacity={prog(t, 2.6)}>
            <text x={50} y={458} fill={C.text} fontSize={26} fontWeight={600}>
              지시문
            </text>
            <rect x={50} y={474} width={260} height={106} rx={14} fill="#0e1628" stroke={C.cardEdge} strokeWidth={2} />
            <text x={70} y={518} fill={C.text} fontSize={22} fontFamily={MONO}>
              "put the red cup
            </text>
            <text x={70} y={552} fill={C.text} fontSize={22} fontFamily={MONO}>
              in the box"
            </text>
          </g>
          {/* image path */}
          <g opacity={lit(6.4)}>
            <rect x={410} y={90} width={310} height={150} rx={16} fill={C.card} stroke={C.blue} strokeWidth={2} />
            <text x={565} y={134} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              image encoder
            </text>
            <text x={565} y={172} textAnchor="middle" fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              SigLIP + DINOv2
            </text>
            <text x={565} y={208} textAnchor="middle" fill={C.muted} fontSize={22}>
              약 6 억 parameter
            </text>
          </g>
          <g opacity={lit(9.6)}>
            <rect x={410} y={262} width={310} height={62} rx={14} fill={C.card} stroke={C.blue} strokeWidth={2} />
            <text x={565} y={302} textAnchor="middle" fill={C.text} fontSize={23}>
              2 층 MLP projector
            </text>
          </g>
          <Arrow x1={314} y1={218} x2={404} y2={166} p={prog(t, 6.2, 0.5)} />
          <Arrow x1={565} y1={242} x2={565} y2={260} p={prog(t, 9.4, 0.3)} width={3} />
          <Arrow x1={724} y1={293} x2={784} y2={250} p={prog(t, 9.9, 0.4)} />
          {grid}
          <text x={790} y={330} fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 11.6)}>
            image token 256 개
          </text>
          {/* text path */}
          <g opacity={lit(12.8)}>
            <rect x={410} y={480} width={310} height={92} rx={16} fill={C.card} stroke={C.green} strokeWidth={2} />
            <text x={565} y={518} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              Llama tokenizer
            </text>
            <text x={565} y={552} textAnchor="middle" fill={C.muted} fontSize={22}>
              글 → text token
            </text>
          </g>
          <Arrow x1={314} y1={527} x2={404} y2={527} p={prog(t, 12.6, 0.5)} />
          <Arrow x1={724} y1={527} x2={776} y2={515} p={prog(t, 13.1, 0.4)} />
          {textToks.map((w, i) => (
            <SvgChip key={w} x={782 + (i % 3) * 72} y={466 + Math.floor(i / 3) * 46} w={64} h={38} text={w} color={C.green} size={18} opacity={prog(t, 13.3 + i * 0.1)} />
          ))}
          <text x={782} y={590} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 13.8)}>
            text token
          </text>
          {/* the language model */}
          <g opacity={struct * lerp(0.3, 1, llmOn)}>
            <rect x={1070} y={150} width={270} height={380} rx={20} fill={`${C.purple}${Math.round(18 + 40 * pulse).toString(16).padStart(2, '0')}`} stroke={C.purple} strokeWidth={2 + 2 * pulse} />
            <text x={1205} y={318} textAnchor="middle" fill={C.text} fontSize={34} fontFamily={MONO} fontWeight={600}>
              Llama 2 7B
            </text>
            <text x={1205} y={358} textAnchor="middle" fill={C.muted} fontSize={22}>
              70 억 parameter
            </text>
            <text x={1205} y={408} textAnchor="middle" fill={C.text} fontSize={22} opacity={llmOn}>
              token 을 하나씩
            </text>
            <text x={1205} y={438} textAnchor="middle" fill={C.text} fontSize={22} opacity={llmOn}>
              7 번 고른다
            </text>
          </g>
          <Arrow x1={1004} y1={200} x2={1064} y2={250} p={prog(t, 15.5, 0.4)} />
          <Arrow x1={1004} y1={510} x2={1064} y2={450} p={prog(t, 15.5, 0.4)} />
          <Arrow x1={1344} y1={340} x2={1392} y2={340} p={prog(t, 15.8, 0.3)} color={C.purple} />
          {/* 7 action tokens, one at a time, then what they mean */}
          <text x={1404} y={68} fill={C.purple} fontSize={24} fontWeight={600} opacity={prog(t, 15.8)}>
            action token 7 개
          </text>
          {EX_BINS.map((b, i) => {
            const y = 86 + i * 72
            const d = DIMS[i]
            return (
              <g key={i}>
                <SvgChip x={1404} y={y} w={118} h={48} text={`칸 ${b}`} color={C.purple} size={22} opacity={prog(t, tokAt(i), 0.3)} />
                <g opacity={prog(t, 19.4 + i * 0.3)}>
                  <Arrow x1={1528} y1={y + 24} x2={1562} y2={y + 24} color={C.dim} width={2} />
                  <text x={1572} y={y + 32} fill={GROUP_COLOR[d.group]} fontSize={24} fontWeight={600}>
                    {d.name}
                  </text>
                </g>
              </g>
            )
          })}
          <text x={1404} y={604} fill={C.text} fontSize={22} opacity={prog(t, 21.6)}>
            <tspan fill={C.blue}>위치 변화 3</tspan> · <tspan fill={C.orange}>회전 변화 3</tspan> · <tspan fill={C.green}>집게 1</tspan>
          </text>
          <text x={50} y={680} fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 23)}>
            ✕ 관절 각도 같은 로봇 상태는 입력으로 받지 않는다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- OpenVLA: the training data ----------

const PAL = [C.blue, C.orange, C.green, C.pink, C.purple, C.accent]
const DOTS = (() => {
  let k = 0
  return Array.from({ length: 220 }, (_, i) => {
    const col = i % 20
    const row = Math.floor(i / 20)
    const reject = rand(i + 99) < 0.08
    const slot = reject ? -1 : k++
    return {
      fx: 70 + col * 20 + (rand(i) - 0.5) * 10,
      fy: 272 + row * 28 + (rand(i + 7) - 0.5) * 10,
      tx: 664 + (slot % 20) * 19,
      ty: 272 + Math.floor(slot / 20) * 28,
      slot,
      reject,
      color: PAL[i % PAL.length],
    }
  })
})()

function Data() {
  const t = useSec()
  const stats = [
    { n: 21, unit: '개 기관', at: 0.8 },
    { n: 22, unit: '가지 로봇', at: 1.8 },
    { n: 60, unit: '개 dataset', at: 2.8 },
    { n: -1, unit: '시연', at: 6.8 },
    { n: 527, unit: '가지 skill', at: 7.8 },
  ]
  const bars = [
    { name: 'OpenVLA', sub: ['Open X-Embodiment', '시연 97 만 개'], pct: 76.3, color: C.purple, at: 12.8 },
    { name: 'Prismatic', sub: ['BridgeData V2', '하나로만 학습'], pct: 45.6, color: C.blue, at: 15.7 },
  ]
  const BASE = 520
  const SCALE = 3.8
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={40} y={56} fill={C.accent} fontSize={32} fontFamily={MONO} fontWeight={600} opacity={prog(t, 0.3)}>
            Open X-Embodiment
          </text>
          <text x={420} y={56} fill={C.muted} fontSize={24} opacity={prog(t, 0.5)}>
            여러 로봇의 시연을 한 형식으로 합친 데이터
          </text>
          {stats.map((s, i) => {
            const p = prog(t, s.at, 1)
            return (
              <g key={s.unit} opacity={prog(t, s.at, 0.4)}>
                <text x={40 + i * 206} y={136} fill={C.text} fontSize={46} fontFamily={s.n < 0 ? SANS : MONO} fontWeight={600}>
                  {s.n < 0 ? '100 만+' : Math.round(s.n * p)}
                </text>
                <text x={40 + i * 206} y={172} fill={C.muted} fontSize={22}>
                  {s.unit}
                </text>
              </g>
            )
          })}
          {/* demos, filtered at the gate */}
          <rect x={40} y={250} width={440} height={340} rx={16} fill="none" stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 3)} />
          <rect x={640} y={250} width={420} height={340} rx={16} fill={`${C.purple}10`} stroke={C.purple} strokeWidth={2} opacity={prog(t, 9.2)} />
          <g opacity={prog(t, 9)}>
            <rect x={536} y={250} width={28} height={340} rx={8} fill={C.cardEdge} />
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x={536} y={262 + k * 42} width={28} height={18} rx={4} fill={C.accent} opacity={0.5} />
            ))}
          </g>
          {DOTS.map((d, i) => {
            const m = d.reject ? 0 : prog(t, 9.6 + d.slot * 0.011, 0.9)
            const x = lerp(d.fx, d.tx, m)
            const y = lerp(d.fy, d.ty, m) - Math.sin(m * Math.PI) * 30
            const red = d.reject ? prog(t, 9.2, 0.4) : 0
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={6}
                fill={red > 0.5 ? C.red : d.color}
                opacity={prog(t, 3.2 + i * 0.012, 0.3) * (d.reject ? 1 - 0.65 * prog(t, 10.4, 0.6) : 0.9)}
              />
            )
          })}
          <text x={260} y={630} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 7)}>
            시연 100 만 개 이상
          </text>
          <text x={550} y={630} textAnchor="middle" fill={C.accent} fontSize={22} opacity={prog(t, 9)}>
            바깥 카메라 + 팔 하나
          </text>
          <text x={550} y={658} textAnchor="middle" fill={C.accent} fontSize={22} opacity={prog(t, 9)}>
            손끝 제어만 남김
          </text>
          <text x={850} y={630} textAnchor="middle" fill={C.purple} fontSize={26} fontWeight={700} opacity={prog(t, 11.4)}>
            시연 97 만 개로 학습
          </text>
          <text x={850} y={660} textAnchor="middle" fill={C.muted} fontSize={20} opacity={prog(t, 11.8)}>
            섞는 비율은 Octo 의 설정을 따름
          </text>
        </svg>
      </Panel>
      <Panel x={1200} y={140} w={656} h={740} style={{ opacity: prog(t, 12.3) }}>
        <svg width={656} height={740}>
          <text x={36} y={56} fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 12.6)}>
            WidowX 과제 8 개의 성공률
          </text>
          <line x1={60} x2={600} y1={BASE} y2={BASE} stroke={C.muted} strokeWidth={2} opacity={prog(t, 12.6)} />
          {bars.map((b, i) => {
            const cx = 190 + i * 280
            const h = b.pct * SCALE * prog(t, b.at, 1.1)
            return (
              <g key={b.name} opacity={prog(t, b.at - 0.2, 0.4)}>
                <rect x={cx - 80} y={BASE - h} width={160} height={h} rx={8} fill={b.color} opacity={0.85} />
                <text x={cx} y={BASE - h - 16} textAnchor="middle" fill={b.color} fontSize={34} fontFamily={MONO} fontWeight={600}>
                  {b.pct}%
                </text>
                <text x={cx} y={BASE + 38} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
                  {b.name}
                </text>
                {b.sub.map((s, j) => (
                  <text key={s} x={cx} y={BASE + 68 + j * 26} textAnchor="middle" fill={C.muted} fontSize={20}>
                    {s}
                  </text>
                ))}
              </g>
            )
          })}
          <g opacity={prog(t, 18.8)}>
            <rect x={36} y={640} width={584} height={74} rx={16} fill={`${C.green}14`} stroke={`${C.green}66`} strokeWidth={1.5} />
            <text x={328} y={686} textAnchor="middle" fill={C.text} fontSize={25} fontWeight={600}>
              다양한 로봇·장면·작업 → 일반화
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- weakness: precision ----------

function Precision() {
  const t = useSec()
  const P = { x: 150, y: 540 }
  const L = 620
  const th0 = 22
  const delta = lerp(0.5, 8, prog(t, 12.8, 1.4))
  const rad = (d: number) => (d * Math.PI) / 180
  const E = (d: number) => [P.x + L * Math.cos(rad(d)), P.y - L * Math.sin(rad(d))]
  const [gx, gy] = E(th0)
  const [rx, ry] = E(th0 + delta)
  const armOn = prog(t, 0.6)
  const errOn = prog(t, 1.4)
  const arcPath = (a: number, b: number, r: number) => {
    const [x1, y1] = [P.x + r * Math.cos(rad(a)), P.y - r * Math.sin(rad(a))]
    const [x2, y2] = [P.x + r * Math.cos(rad(b)), P.y - r * Math.sin(rad(b))]
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`
  }
  const big = prog(t, 12.8, 1.4)
  const rows = [
    { n: '256', w: '1°', e: '0.5°', d: '≈ 2.6 mm', at: 1, atD: 9, color: C.orange },
    { n: '16', w: '16°', e: '8°', d: '≈ 41.9 mm', at: 12.8, atD: 13.6, color: C.red },
  ]
  const K = 11.4
  const bars = [
    { name: '칸 16 개', v: 41.9, color: C.red, at: 13.4 },
    { name: '칸 256 개', v: 2.6, color: C.orange, at: 9.2 },
    { name: '핀을 꽂는 틈', v: 1, color: C.green, at: 14.4 },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={980} h={740}>
        <svg width={980} height={740}>
          <text x={40} y={56} fill={C.text} fontSize={28} fontWeight={600}>
            관절에서 30 cm 떨어진 손끝
          </text>
          <path d={arcPath(-4, 48, L)} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" opacity={prog(t, 6.4)} />
          <g opacity={armOn}>
            <rect x={P.x - 60} y={P.y + 14} width={120} height={26} rx={6} fill={C.cardEdge} />
            <line x1={P.x} y1={P.y} x2={gx} y2={gy} stroke={C.green} strokeWidth={8} strokeLinecap="round" />
            <circle cx={gx} cy={gy} r={12} fill={C.green} />
            <text x={gx + 22} y={gy + 40} fill={C.green} fontSize={24} fontWeight={600}>
              원하는 자리
            </text>
            <text x={(P.x + gx) / 2 + 16} y={(P.y + gy) / 2 + 44} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
              30 cm
            </text>
          </g>
          <g opacity={errOn}>
            <line x1={P.x} y1={P.y} x2={rx} y2={ry} stroke={C.red} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
            <path d={arcPath(th0, th0 + delta, L)} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" />
            <path d={arcPath(th0, th0 + delta, 150)} fill="none" stroke={C.red} strokeWidth={3} />
            <circle cx={rx} cy={ry} r={9} fill={C.red} />
            <text x={rx - 44} y={ry - 22} textAnchor="end" fill={C.red} fontSize={28} fontWeight={700} opacity={1 - big}>
              0.5° 어긋나면 약 2.6 mm
            </text>
            <text x={rx - 44} y={ry - 22} textAnchor="end" fill={C.red} fontSize={28} fontWeight={700} opacity={big}>
              8° 어긋나면 약 41.9 mm
            </text>
          </g>
          <circle cx={P.x} cy={P.y} r={16} fill={C.muted} opacity={armOn} />
          <text x={P.x - 30} y={P.y - 26} textAnchor="middle" fill={C.muted} fontSize={22} opacity={armOn}>
            관절
          </text>
          <text x={40} y={640} fill={C.muted} fontSize={24} opacity={prog(t, 6.6)}>
            둘레 2 × 3.14 × 300 = 1,884 mm
          </text>
          <text x={40} y={678} fill={C.orange} fontSize={24} fontFamily={MONO} opacity={prog(t, 8.6)}>
            0.5° → 1,884 × 0.5 ÷ 360 ≈ 2.6 mm
          </text>
          <text x={40} y={716} fill={C.red} fontSize={24} fontFamily={MONO} opacity={prog(t, 13.6)}>
            8° → 1,884 × 8 ÷ 360 ≈ 41.9 mm
          </text>
        </svg>
      </Panel>
      <Panel x={1080} y={140} w={776} h={740}>
        <svg width={776} height={740}>
          <text x={36} y={56} fill={C.text} fontSize={28} fontWeight={600}>
            칸 개수와 최대 어긋남
          </text>
          {['칸 개수', '칸 폭', '최대 각도 오차', '30 cm 끝'].map((h, i) => (
            <text key={h} x={[36, 190, 330, 560][i]} y={112} fill={C.muted} fontSize={22}>
              {h}
            </text>
          ))}
          <line x1={36} x2={740} y1={128} y2={128} stroke={C.cardEdge} strokeWidth={2} />
          {rows.map((r, k) => (
            <g key={r.n} fontFamily={MONO} fontSize={28} fontWeight={600}>
              <g opacity={prog(t, r.at)}>
                <text x={36} y={178 + k * 56} fill={C.text}>
                  {r.n}
                </text>
                <text x={190} y={178 + k * 56} fill={C.text}>
                  {r.w}
                </text>
                <text x={330} y={178 + k * 56} fill={r.color}>
                  {r.e}
                </text>
              </g>
              <text x={560} y={178 + k * 56} fill={r.color} opacity={prog(t, r.atD)}>
                {r.d}
              </text>
            </g>
          ))}
          <text x={36} y={318} fill={C.muted} fontSize={22} opacity={prog(t, 9.2)}>
            30 cm 끝의 최대 어긋남 (mm)
          </text>
          {bars.map((b, i) => {
            const y = 344 + i * 56
            const w = Math.max(3, b.v * K * prog(t, b.at, 0.9))
            return (
              <g key={b.name} opacity={prog(t, b.at - 0.1, 0.4)}>
                <text x={36} y={y + 26} fill={C.text} fontSize={22}>
                  {b.name}
                </text>
                <rect x={200} y={y + 4} width={w} height={30} rx={5} fill={b.color} opacity={0.85} />
                <text x={200 + w + 12} y={y + 28} fill={b.color} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {b.v}
                </text>
              </g>
            )
          })}
          <text x={36} y={548} fill={C.text} fontSize={24} opacity={prog(t, 15)}>
            컵 집기 <tspan fill={C.green}>✓</tspan> · 1 mm 틈에 핀 꽂기 <tspan fill={C.red}>✕</tspan>
          </text>
          <g opacity={prog(t, 17.3)}>
            <rect x={36} y={580} width={704} height={130} rx={16} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={60} y={630} fill={C.text} fontSize={24}>
              칸을 더 잘게 → 덮어쓸 token ↑ · 칸마다 시연 ↓
            </text>
            <text x={60} y={676} fill={C.accent} fontSize={24} fontWeight={600}>
              RT-1 · RT-2 · OpenVLA 는 모두 256 칸
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- weakness: speed ----------

function Speed() {
  const t = useSec()
  const stepAt = (k: number) => 0.9 + k * 0.75
  const slotX = (k: number) => 304 + k * 136
  const done = EX_BINS.filter((_, k) => t >= stepAt(k) + 0.75).length
  const running = EX_BINS.findIndex((_, k) => t >= stepAt(k) && t < stepAt(k) + 0.75)
  const computing = running >= 0 && t < stepAt(running) + 0.4
  const T0 = 300
  const T1 = 1740
  const span = T1 - T0
  const s = interpolate(t, [7, 11.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cellW = (span / 6 - 6) / 7
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <svg width={1792} height={300}>
          <text x={40} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            action 하나 = Llama 2 7B 를 7 번 차례로 계산
          </text>
          <SvgChip x={40} y={80} w={120} h={56} text="사진" color={C.blue} size={22} />
          <SvgChip x={172} y={80} w={120} h={56} text="지시문" color={C.green} size={22} />
          {EX_BINS.map((b, k) => (
            <g key={k}>
              <SvgChip x={slotX(k)} y={80} w={124} h={56} text="" color={C.dim} filled={false} opacity={k >= done ? 0.8 : 0} />
              <SvgChip x={slotX(k)} y={80} w={124} h={56} text={`칸 ${b}`} color={C.purple} size={22} opacity={k < done ? 1 : 0} />
            </g>
          ))}
          <Arrow x1={1262} y1={108} x2={1410} y2={108} color={C.dim} />
          <rect x={1420} y={60} width={330} height={150} rx={18} fill={computing ? `${C.purple}40` : C.card} stroke={C.purple} strokeWidth={computing ? 4 : 2} />
          <text x={1585} y={122} textAnchor="middle" fill={C.text} fontSize={30} fontFamily={MONO} fontWeight={600}>
            Llama 2 7B
          </text>
          <text x={1585} y={170} textAnchor="middle" fill={C.purple} fontSize={26} fontWeight={600}>
            {`계산 ${Math.max(done, running + 1)} / 7`}
          </text>
          {/* the chosen token travels back to the end of the input */}
          {running >= 0 &&
            !computing &&
            (() => {
              const p = prog(t, stepAt(running) + 0.4, 0.35)
              const x0 = 1585
              const y0 = 212
              const x2 = slotX(running) + 62
              const y2 = 140
              const cx = (x0 + x2) / 2
              const cy = 290
              const x = (1 - p) * (1 - p) * x0 + 2 * (1 - p) * p * cx + p * p * x2
              const y = (1 - p) * (1 - p) * y0 + 2 * (1 - p) * p * cy + p * p * y2
              return <SvgChip x={x - 62} y={y - 28} w={124} h={56} text={`칸 ${EX_BINS[running]}`} color={C.purple} size={22} />
            })()}
          <text x={40} y={272} fill={C.muted} fontSize={22} opacity={prog(t, 3)}>
            고른 token 을 입력 끝에 붙여 다시 계산한다 · 앞 token 을 봐야 다음 token 을 고른다
          </text>
        </svg>
      </Panel>
      <Panel x={64} y={470} w={1792} h={410} style={{ opacity: prog(t, 6.3) }}>
        <svg width={1792} height={410}>
          <text x={40} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 6.6)}>
            1 초 동안
          </text>
          <g opacity={prog(t, 6.6)}>
            {[0, 0.5, 1].map((v) => (
              <g key={v}>
                <line x1={T0 + v * span} x2={T0 + v * span} y1={90} y2={300} stroke={C.grid} strokeWidth={2} />
                <text x={T0 + v * span} y={78} textAnchor="middle" fill={C.muted} fontSize={22}>
                  {v === 0 ? '0' : `${v} 초`}
                </text>
              </g>
            ))}
            <text x={40} y={136} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
              OpenVLA
            </text>
            <text x={40} y={164} fill={C.muted} fontSize={20}>
              RTX 4090 한 장
            </text>
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <rect x={T0 + (i * span) / 6 + 3} y={100} width={span / 6 - 6} height={60} rx={6} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
                {Array.from({ length: 7 }, (_, j) => {
                  const on = s * 42 >= i * 7 + j + 1
                  return <rect key={j} x={T0 + (i * span) / 6 + 6 + j * cellW} y={104} width={cellW - 3} height={52} rx={3} fill={C.purple} opacity={on ? 0.8 : 0} />
                })}
                <g opacity={s * 6 >= i + 1 ? 1 : 0}>
                  <rect x={T0 + ((i + 0.5) * span) / 6 - 54} y={114} width={108} height={32} rx={8} fill={C.card} opacity={0.92} />
                  <text x={T0 + ((i + 0.5) * span) / 6} y={138} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                    action {i + 1}
                  </text>
                </g>
              </g>
            ))}
          </g>
          {s > 0 && s < 1 && <line x1={T0 + s * span} x2={T0 + s * span} y1={92} y2={168} stroke={C.accent} strokeWidth={3} />}
          <g opacity={prog(t, 9.6)}>
            <path d={`M ${T0 + 3} 174 L ${T0 + 3} 182 L ${T0 + span / 6 - 3} 182 L ${T0 + span / 6 - 3} 174`} fill="none" stroke={C.purple} strokeWidth={2} />
            <text x={T0} y={210} fill={C.purple} fontSize={22} fontWeight={600}>
              약 0.167 초 = 1 ÷ 6
            </text>
          </g>
          <g opacity={prog(t, 12.8)}>
            <text x={40} y={270} fill={C.text} fontSize={26} fontWeight={600}>
              목표 50 Hz
            </text>
            <text x={40} y={298} fill={C.muted} fontSize={20}>
              20 ms 마다 하나
            </text>
          </g>
          {Array.from({ length: 50 }, (_, k) => (
            <rect key={k} x={T0 + k * (span / 50) + 3} y={242} width={span / 50 - 6} height={50} rx={3} fill={C.green} opacity={0.8 * prog(t, 13.2 + k * 0.06, 0.2)} />
          ))}
          <text x={T0} y={330} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 16.4)}>
            1 초에 action 50 번
          </text>
          <text x={T1} y={386} textAnchor="end" fill={C.accent} fontSize={32} fontWeight={700} opacity={prog(t, 19.4)}>
            50 ÷ 6 ≈ 8.3 배 빨라져야 한다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- weakness: order, and one step at a time ----------

function OneStep() {
  const t = useSec()
  const K = 4.8
  const bars = [
    { name: 'OpenVLA', v: 4.2, color: C.blue, at: 16.2 },
    { name: 'OpenVLA-OFT', v: 108.8, color: C.purple, at: 16.8 },
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 150 }}>
        <Misconception
          at={0.3}
          belief="GPU 가 빠르면 token 7 개도 한 번에 나온다"
          fact={'GPU 는 계산 안의 곱셈을 동시에 할 뿐이다. 관절 2 의 token\u00a0은 관절 1 의 token\u00a0을 보고 고르므로 이 순서는 못 바꾼다'}
        />
      </div>
      <Appear at={6.8} style={{ position: 'absolute', left: 64, top: 560, width: 860 }}>
        <div style={{ height: 320, borderRadius: 24, background: C.card, border: `1.5px solid ${C.cardEdge}`, position: 'relative' }}>
          <svg width={860} height={320}>
            <text x={32} y={52} fill={C.text} fontSize={28} fontWeight={600}>
              추론 한 번 = 지금 step 의 action 하나
            </text>
            {[0, 1, 2].map((c) => {
              const x = 32 + c * 264
              const on = prog(t, 7.4 + c * 1.3, 0.5)
              return (
                <g key={c} opacity={on}>
                  <rect x={x} y={92} width={210} height={70} rx={10} fill={C.grid} stroke={C.cardEdge} strokeWidth={1.5} />
                  <text x={x + 105} y={124} textAnchor="middle" fill={C.muted} fontSize={22}>
                    추론 · token 7 개
                  </text>
                  <text x={x + 105} y={150} textAnchor="middle" fill={C.red} fontSize={20}>
                    로봇은 기다린다
                  </text>
                  <rect x={x + 218} y={92} width={30} height={70} rx={6} fill={C.green} />
                </g>
              )
            })}
            <text x={32} y={200} fill={C.green} fontSize={20} opacity={prog(t, 7.8)}>
              초록 = 실행하는 action 하나
            </text>
            <text x={32} y={252} fill={C.text} fontSize={24} opacity={prog(t, 9.6)}>
              ACT 의 action chunk 처럼 여러 step 을 묶어 낼 수 없다
            </text>
            <text x={32} y={288} fill={C.muted} fontSize={22} opacity={prog(t, 10.4)}>
              느린 추론 사이에 로봇이 멈추고, 움직임도 매끄럽지 않다
            </text>
          </svg>
        </div>
      </Appear>
      <Appear at={12.8} style={{ position: 'absolute', left: 964, top: 560, width: 892 }}>
        <div style={{ height: 320, borderRadius: 24, background: C.card, border: `1.5px solid ${C.purple}66`, position: 'relative' }}>
          <svg width={892} height={320}>
            <text x={32} y={52} fill={C.purple} fontSize={28} fontFamily={MONO} fontWeight={600}>
              OpenVLA-OFT
            </text>
            <text x={262} y={52} fill={C.muted} fontSize={22}>
              2025 · 같은 제1 저자
            </text>
            <text x={32} y={96} fill={C.text} fontSize={24}>
              7 자리를 계산 한 번에 + 8 step 을 한 묶음으로
            </text>
            <text x={32} y={136} fill={C.muted} fontSize={20}>
              A100 에서 1 초에 내는 action 수
            </text>
            {bars.map((b, i) => {
              const y = 156 + i * 64
              const w = Math.max(4, b.v * K * prog(t, b.at, 1.2))
              return (
                <g key={b.name}>
                  <text x={32} y={y + 34} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                    {b.name}
                  </text>
                  <rect x={220} y={y + 8} width={w} height={38} rx={6} fill={b.color} opacity={0.85} />
                  <text x={220 + w + 12} y={y + 36} fill={b.color} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, b.at + 0.4)}>
                    {b.v}
                  </text>
                </g>
              )
            })}
            <text x={860} y={300} textAnchor="end" fill={C.accent} fontSize={30} fontWeight={700} opacity={prog(t, 18.4)}>
              26 배
            </text>
          </svg>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

function Answer() {
  const items = [
    { tag: 'action token', color: C.purple, text: '차원마다 범위를 256 칸으로 나누고, 칸 번호마다 token 하나. action 하나 = token 7 개', at: 1.4 },
    { tag: 'OpenVLA', color: C.blue, text: 'Prismatic-7B 가 사진 한 장과 지시문을 받아 action token 7 개를 쓴다 · 시연 97 만 개', at: 4.4 },
    { tag: 'action token 의 약점', color: C.red, text: '최대 0.5° ≈ 2.6 mm · RTX 4090 에서 1 초에 약 6 번 · 한 번에 한 step', at: 8 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 170, display: 'grid', gap: 26, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            token 만 고를 수 있는 language model 이 10.3° 같은 관절 각도를 어떻게 낼까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '26px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: fam(it.tag), fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.4 }}>{it.text}</span>
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
            NEXT · SESSION 7
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600 }}>Driving Stack</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={36}>
            modular 와 end-to-end, open-loop 평가가 무엇을 놓치나
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: woolimi/robotics-roadmap · CC BY-NC-SA 4.0
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseToken = () => (
  <PauseWrite
    question="−128° ~ +128° 를 256 칸으로 나누면, 45.8° 는 몇 번 칸이고 되돌리면 몇 도일까?"
    answer="(45.8 + 128) ÷ 1 = 173.8 → 173 번 칸. 되돌리면 −128 + 173.5 × 1 = 45.5° (어긋남 0.3°)"
  />
)

const PauseOpenVla = () => (
  <PauseWrite
    question="OpenVLA 의 입력 두 가지와, 출력 token 7 개는 각각 무엇일까?"
    answer="입력: 224×224 사진 한 장 + 지시문 (로봇 상태는 없다). 출력: 손끝 위치 변화 3 + 회전 변화 3 + 집게 1 의 action token"
  />
)

const PauseWeak = () => (
  <PauseWrite
    question="계산 한 번에 0.01 초인 VLA 가 token 7 개를 하나씩 내면, 1 초에 action 을 몇 번 낼까?"
    answer="action 하나에 7 × 0.01 = 0.07 초 → 1 ÷ 0.07 ≈ 14.3, 약 14 번. 50 Hz 에는 한참 모자란다"
  />
)

export function VlaTokens() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        bins: Bins,
        vocab: Vocab,
        quantile: Quantile,
        'pause-token': PauseToken,
        arch: Arch,
        data: Data,
        'pause-openvla': PauseOpenVla,
        precision: Precision,
        speed: Speed,
        onestep: OneStep,
        'pause-weak': PauseWeak,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
