import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './rl-experiments.narration.json'
import { script } from './rl-experiments.script'

// Numbers follow lessons/rl-experiments/README.md (see rl-experiments.script.ts). The learning curves are schematic (marked
// 모식도 / 예로 든 모양, as the lesson's own figure is); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, fmt, sub, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
      {sub && <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a fading line of text inside a Box */
function Ln({ t, at, children, style }: { t: number; at: number; children: ReactNode; style: CSSProperties }) {
  return <span style={{ ...style, opacity: prog(t, at) }}>{children}</span>
}

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

/** an SVG polyline of f(u) for u in [0, upto], mapped into the box (x0..x1, y0 at v = 0, y1 at v = 1) */
function curve(f: (u: number) => number, x0: number, x1: number, y0: number, y1: number, upto = 1) {
  const pts: string[] = []
  const n = Math.max(1, Math.round(100 * upto))
  for (let k = 0; k <= n; k++) {
    const u = (k / n) * upto
    pts.push(`${(x0 + (x1 - x0) * u).toFixed(1)},${(y0 + (y1 - y0) * f(u)).toFixed(1)}`)
  }
  return pts.join(' ')
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            REINFORCEMENT LEARNING · EXPERIMENTS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>RL Experiments</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            seed 가 만드는 분산 속에서 <span style={{ color: C.accent }}>차이를 믿는 법</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            같은 알고리즘도 seed 만 바꾸면 결과가 갈린다 · 두 설정을 공정하게 비교하기
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
  const old = (u: number) => 0.85 * (1 - Math.exp(-3 * u))
  const neu = (u: number) => 0.92 * (1 - Math.exp(-3 * u))
  const band = (f: (u: number) => number, d: number) => {
    const up = curve((u) => f(u) + d * Math.min(1, u * 3), 60, 760, 270, 80)
    const lo = curve((u) => f(u) - d * Math.min(1, u * 3), 60, 760, 270, 80).split(' ').reverse().join(' ')
    return `${up} ${lo}`
  }
  const p = prog(t, 0.6, 2)
  const sources: [string, number][] = [
    ['network 의 초기 weight', 1.2],
    ['탐색 noise', 1.8],
    ['환경의 무작위성', 2.4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={320}>
        <svg width={820} height={320} style={{ position: 'absolute', left: 10, top: 10 }}>
          <g opacity={prog(t, 0.4)}>
            <line x1={60} y1={270} x2={770} y2={270} stroke={C.muted} strokeWidth={1.5} />
            <line x1={60} y1={270} x2={60} y2={60} stroke={C.muted} strokeWidth={1.5} />
            <text x={770} y={298} textAnchor="end" fill={C.muted} fontSize={20}>
              학습 step
            </text>
            <text x={790} y={30} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
          </g>
          <g opacity={p}>
            <polygon points={band(old, 0.12)} fill={`${C.orange}22`} />
            <polygon points={band(neu, 0.12)} fill={`${C.blue}22`} />
            <polyline points={curve(old, 60, 760, 270, 80, p)} fill="none" stroke={C.orange} strokeWidth={4} />
            <polyline points={curve(neu, 60, 760, 270, 80, p)} fill="none" stroke={C.blue} strokeWidth={4} />
          </g>
          <g opacity={prog(t, 1)}>
            <line x1={84} y1={44} x2={120} y2={44} stroke={C.blue} strokeWidth={4} />
            <text x={132} y={52} fill={C.blue} fontSize={22} fontWeight={600}>
              새 critic loss
            </text>
            <line x1={84} y1={80} x2={120} y2={80} stroke={C.orange} strokeWidth={4} />
            <text x={132} y={88} fill={C.orange} fontSize={22} fontWeight={600}>
              기존
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 880, top: 34, width: 880, display: 'grid', gap: 18 }}>
          <Label size={26} color={C.text} weight={600}>
            곡선이 조금 올라갔다 → 바꾼 것 덕분일까?
          </Label>
          <Label size={23} color={C.muted}>
            아래가 모두 random seed 에 달려 있어서, seed 만 바꿔도 결과가 크게 달라진다
          </Label>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {sources.map(([s, at]) => (
              <span key={s} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${C.accent}77`, background: `${C.accent}14`, color: C.accent, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at) }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 492, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          seed 를 몇 개 쓰고, <span style={{ color: C.accent }}>어떻게 계산하고 적어야 차이를 믿을 수 있을까?</span>
        </div>
      </Appear>
      <Card x={64} y={676} w={1792} h={204} at={5.6}>
        <div style={{ padding: '26px 34px', display: 'grid', gap: 22, opacity: prog(t, 5.8) }}>
          <Label size={24}>Henderson 등 (2018) 의 실험</Label>
          <Flow steps={['같은 알고리즘 · 같은 hyperparameter', 'seed 10 개 학습', '5 개씩 두 묶음', '두 평균 곡선이 다르다는 검정 결과']} color={C.red} at={6} gap={0.4} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. seed 와 비교 조건 ----------

const G1 = [0.95, 0.7, 0.85, 0.9, 0.75]
const G2 = [0.45, 0.8, 0.55, 0.6, 0.5]
const seedF = (a: number, i: number) => (u: number) => a * (1 - Math.exp(-3 * u)) + 0.035 * Math.sin(11 * u + i * 1.3) * Math.min(1, u * 4)
const meanF = (g: number[], off: number) => (u: number) => g.reduce((s, a, i) => s + seedF(a, i + off)(u), 0) / g.length

function SeedVar() {
  const t = useSec()
  const draw = prog(t, 0.5, 2.5)
  const split = prog(t, 6.8, 0.8)
  const X0 = 90
  const X1 = 860
  const Y0 = 540
  const Y1 = 140
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 알고리즘 · seed 10 개를 5 개씩 두 묶음으로
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            예로 든 모양
          </text>
          <g opacity={prog(t, 0.4)}>
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.muted} strokeWidth={1.5} />
            <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 10} stroke={C.muted} strokeWidth={1.5} />
            <text x={X1} y={Y0 + 34} textAnchor="end" fill={C.muted} fontSize={20}>
              학습 step
            </text>
            <text x={X0 + 12} y={Y1 + 6} fill={C.muted} fontSize={20}>
              return
            </text>
          </g>
          {[...G1.map((a, i) => ({ f: seedF(a, i), g: 0 })), ...G2.map((a, i) => ({ f: seedF(a, i + 5), g: 1 }))].map(({ f, g }, k) => (
            <polyline key={k} points={curve(f, X0, X1, Y0, Y0 - 400, draw)} fill="none" stroke={split > 0 ? (g === 0 ? C.blue : C.orange) : C.muted} strokeWidth={2} opacity={0.35 + 0.05 * (1 - split)} />
          ))}
          <g opacity={split}>
            <polyline points={curve(meanF(G1, 0), X0, X1, Y0, Y0 - 400)} fill="none" stroke={C.blue} strokeWidth={5} />
            <polyline points={curve(meanF(G2, 5), X0, X1, Y0, Y0 - 400)} fill="none" stroke={C.orange} strokeWidth={5} />
            <line x1={120} y1={88} x2={156} y2={88} stroke={C.blue} strokeWidth={5} />
            <text x={168} y={96} fill={C.blue} fontSize={22} fontWeight={600}>
              묶음 1 평균 (seed 5 개)
            </text>
            <line x1={480} y1={88} x2={516} y2={88} stroke={C.orange} strokeWidth={5} />
            <text x={528} y={96} fill={C.orange} fontSize={22} fontWeight={600}>
              묶음 2 평균 (seed 5 개)
            </text>
          </g>
          <g opacity={prog(t, 7.4)}>
            <text x={30} y={630} fill={C.text} fontSize={24}>
              Henderson 등 · TRPO · HalfCheetah · 같은 hyperparameter
            </text>
            <text x={30} y={674} fill={C.red} fontSize={30} fontFamily={MONO} fontWeight={600}>
              t 검정: t = −9.09 · p = 0.0016
            </text>
            <text x={30} y={714} fill={C.muted} fontSize={21}>
              곡선의 점들이 서로 독립이 아니라 이 p 를 그대로 믿기는 어렵다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={230} at={0.5} gap={10} title={<Head color={C.accent}>seed 에서 나오는 것</Head>}>
        <Ln t={t} at={0.8} style={line(C.text, 24)}>
          network 의 초기 weight · action 의 탐색 noise
        </Ln>
        <Ln t={t} at={1.4} style={line(C.text, 24)}>
          replay buffer 에서 뽑는 순서 · 환경의 시작 상태
        </Ln>
        <Ln t={t} at={3.5} style={line(C.orange, 24)}>
          초반의 작은 차이 → 다른 경험 → 다른 policy
        </Ln>
      </Box>
      <Box x={996} y={396} w={860} h={230} at={13.2} gap={10} title={<Head color={C.orange}>Colas 등 · 같은 DDPG 를 seed 5 개씩 두 번</Head>}>
        <Ln t={t} at={13.5} style={line(C.muted, 22)}>
          Welch t 검정: 두 묶음의 분산이 달라도 쓸 수 있는 t 검정
        </Ln>
        <svg width={800} height={74} style={{ opacity: prog(t, 14) }}>
          <line x1={20} y1={54} x2={780} y2={54} stroke={C.muted} strokeWidth={1.5} />
          <line x1={653} y1={34} x2={653} y2={70} stroke={C.red} strokeWidth={3} />
          <text x={653} y={22} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
            5% 기준 0.05
          </text>
          <circle cx={20 + (0.031 / 0.06) * 760} cy={54} r={10} fill={C.orange} />
          <text x={20 + (0.031 / 0.06) * 760} y={22} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
            p = 0.031
          </text>
          <text x={20} y={22} fill={C.dim} fontSize={20} fontFamily={MONO}>
            0
          </text>
        </svg>
      </Box>
      <Box x={996} y={650} w={860} h={230} at={19.7} gap={10} title={<Head color={C.purple}>실제 논문의 seed 수</Head>}>
        <Ln t={t} at={19.9} style={line(C.text, 23)}>
          Henderson 등이 정리한 이전 연구: 대개 3 ~ 5 번 · 저자들은 기본 5 번
        </Ln>
        <Ln t={t} at={20.8} style={line(C.text, 23)}>
          Agarwal 등: 3 ~ 10 번이 흔하다
        </Ln>
        <Ln t={t} at={22} style={line(C.orange, 23)}>
          Atari 게임 50 여 개 × 5 번만 해도 GPU 로 1,000 일 넘게
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Conditions() {
  const t = useSec()
  const rows: [string, string, number, string][] = [
    ['환경 step 예산', '더 오래 학습한 쪽이 이기는 것을 막는다 · Machado 등: 정해 둔 frame (게임 화면 한 장) 수에서 적는다', 0.6, C.accent],
    ['평가 방식', '평가 episode 수와 탐색 여부가 점수를 바꾼다 · DER 을 CURL 의 방식으로 재면 CURL 보다 높다', 5.7, C.blue],
    ['평가 시점', '마지막 한 번의 점수는 흔들린다 · 마지막 k 개 episode 의 평균을 적는다', 11.2, C.green],
    ['구현', 'Henderson 등: TRPO 구현 세 가지가 같은 환경에서 크게 다른 곡선을 냈다', 12.4, C.orange],
    ['기준선', '학습 전 policy · 무작위 policy 의 점수 · 서 있기만 해도 점수가 쌓이는 환경도 있다', 13.6, C.purple],
  ]
  const x = (v: number) => 80 + ((v - 44) / 12) * 600
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <div style={{ padding: '28px 30px', display: 'grid', gap: 12 }}>
          <div style={{ opacity: prog(t, 0.3), marginBottom: 6 }}>
            <Head>비교 조건 맞추기 · seed 말고는 모두 같게</Head>
          </div>
          {rows.map(([k, v, at, color]) => (
            <div key={k} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '12px 18px', borderRadius: 14, background: `${color}10`, border: `1.5px solid ${color}44`, opacity: prog(t, at) }}>
              <span style={{ width: 210, flexShrink: 0, fontSize: 25, fontWeight: 600, color, lineHeight: 1.35 }}>{k}</span>
              <span style={line(C.text, 23)}>{v}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 8.5), marginTop: 4 }}>평가할 때는 탐색 noise 를 끄고 policy 가 정하는 action 하나만 쓰는 결정론적 평가가 흔하다 (SAC 는 Gaussian 의 평균 action)</span>
        </div>
      </Panel>
      <Card x={1096} y={140} w={760} h={740} at={16.5}>
        <svg width={760} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            가장 좋은 점수만 고르면
          </text>
          <text x={30} y={88} fill={C.muted} fontSize={21}>
            실제 성능 50 · 평가마다 −5 ~ 5 의 noise 가 고르게 섞임
          </text>
          <g opacity={prog(t, 16.8)}>
            <rect x={x(45)} y={272} width={x(55) - x(45)} height={56} rx={6} fill={`${C.blue}22`} stroke={`${C.blue}66`} strokeWidth={1.5} />
            <line x1={x(44)} y1={300} x2={x(56)} y2={300} stroke={C.muted} strokeWidth={1.5} />
            {[45, 50, 55].map((v) => (
              <text key={v} x={x(v)} y={372} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {v}
              </text>
            ))}
            <line x1={x(50)} y1={244} x2={x(50)} y2={344} stroke={C.blue} strokeWidth={4} />
            <text x={x(50)} y={226} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              실제 성능 50
            </text>
            <text x={x(45)} y={160} fill={C.dim} fontSize={20}>
              평가 점수 = 50 + noise (50 ± 5 사이)
            </text>
          </g>
          <g opacity={prog(t, 18)}>
            <line x1={x(54.1)} y1={244} x2={x(54.1)} y2={344} stroke={C.orange} strokeWidth={4} />
            <text x={x(54.1)} y={226} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              10 번 중 최고 ≈ 54.1
            </text>
          </g>
          <g opacity={prog(t, 19.3)}>
            {arrow(x(50) + 6, 410, x(54.1) - 6, 410, C.orange, 3)}
            <text x={(x(50) + x(54.1)) / 2} y={448} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              약 4 점
            </text>
          </g>
          <g opacity={prog(t, 20)}>
            <text x={30} y={524} fill={C.accent} fontSize={28} fontFamily={MONO} fontWeight={600}>
              50 + (−5 + 10 × 10 ÷ 11) ≈ 54.1
            </text>
            <text x={30} y={570} fill={C.text} fontSize={23}>
              학습이 그대로여도 checkpoint 를 고르기만 해서 오른다
            </text>
          </g>
          <g opacity={prog(t, 22.7)}>
            <text x={30} y={630} fill={C.green} fontSize={23} fontWeight={600}>
              → 두 설정에 같은 규칙을 미리 (예: 마지막 평가의 점수)
            </text>
            <text x={30} y={672} fill={C.muted} fontSize={21}>
              Henderson 등: hyperparameter, 구현 세부, 실험 설정,
            </text>
            <text x={30} y={702} fill={C.muted} fontSize={21}>
              평가 방법을 모두 적는다
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

const PauseBest = () => (
  <PauseWrite
    question="실제 성능 50, 평가 noise −5 ~ 5 인 policy 를 10 번 평가해 최고 점수만 적으면 몇 점쯤일까?"
    answer={
      <>
        50 + (−5 + 10 × 10 ÷ 11) ≈ 54.1
        <br />
        학습 없이 고르기만으로 약 4 점 높게 적힌다
      </>
    }
  />
)

// ---------- 2. 짝짓기와 sign-flip ----------

function Paired() {
  const t = useSec()
  const A = [50, 62, 45, 70, 58]
  const B = [47, 61, 41, 69, 53]
  const rx = (v: number) => 80 + ((v - 40) / 32) * 840
  const ix = (v: number) => 80 + (v + 15) * 24
  const cols = [110, 140, 140, 240]
  const calc: [string, number, string][] = [
    ['평균 = 14 ÷ 5 = 2.8', 11.2, C.text],
    ['표준편차 s = 1.79', 12.4, C.text],
    ['표준오차 = 1.79 ÷ √5 = 0.8', 14, C.text],
    ['t 배수 (자유도 5 − 1 = 4) = 2.776', 17.2, C.text],
    ['2.8 ± 2.776 × 0.8 → [0.58, 5.02]', 19.4, C.green],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={410} at={0.3}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 8 }}>
          <Label size={24} color={C.text} weight={600}>
            설정 A (새 critic loss) · B (기존) · 마지막 return (예)
          </Label>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, marginTop: 8 }}>
            {['seed', 'A', 'B', '차이 A − B'].map((h, i) => (
              <span key={h} style={{ width: cols[i], fontSize: 24, color: i === 3 ? C.green : C.muted, textAlign: 'right', opacity: i === 3 ? prog(t, 6) : 1 }}>
                {h}
              </span>
            ))}
          </div>
          {A.map((a, k) => (
            <div key={k} style={{ display: 'flex', opacity: prog(t, 0.6 + k * 0.3) }}>
              <span style={{ ...mono(C.muted, 28), width: cols[0], textAlign: 'right' }}>{k + 1}</span>
              <span style={{ ...mono(C.blue, 28), width: cols[1], textAlign: 'right' }}>{a}</span>
              <span style={{ ...mono(C.orange, 28), width: cols[2], textAlign: 'right' }}>{B[k]}</span>
              <span style={{ ...mono(C.green, 28), width: cols[3], textAlign: 'right', opacity: prog(t, 6.2 + k * 0.3) }}>{a - B[k]}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={580} w={760} h={300} at={11} gap={8} title={<Head color={C.green}>짝지은 t 구간</Head>}>
        {calc.map(([s, at, color]) => (
          <Ln key={s} t={t} at={at} style={mono(color, 23)}>
            {s}
          </Ln>
        ))}
      </Box>
      <Card x={856} y={140} w={1000} h={740} at={5.5}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            return 은 41 ~ 70 으로 퍼지고, 차이는 모두 1 ~ 5 의 양수
          </text>
          <g>
            <circle cx={680} cy={76} r={8} fill={C.blue} />
            <text x={696} y={84} fill={C.blue} fontSize={21}>
              A
            </text>
            <circle cx={740} cy={76} r={8} fill={C.orange} />
            <text x={756} y={84} fill={C.orange} fontSize={21}>
              B
            </text>
            <line x1={800} y1={76} x2={836} y2={76} stroke={C.green} strokeWidth={4} />
            <text x={848} y={84} fill={C.green} fontSize={21}>
              차이
            </text>
          </g>
          {A.map((a, k) => {
            const y = 120 + k * 36
            return (
              <g key={k} opacity={prog(t, 5.8 + k * 0.3)}>
                <text x={40} y={y + 7} fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {k + 1}
                </text>
                <line x1={rx(B[k])} y1={y} x2={rx(a)} y2={y} stroke={C.green} strokeWidth={4} />
                <circle cx={rx(B[k])} cy={y} r={8} fill={C.orange} />
                <circle cx={rx(a)} cy={y} r={8} fill={C.blue} />
                <text x={rx(a) + 16} y={y + 7} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  +{a - B[k]}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 5.8)}>
            <line x1={rx(40)} y1={290} x2={rx(72)} y2={290} stroke={C.muted} strokeWidth={1.5} />
            {[40, 50, 60, 70].map((v) => (
              <text key={v} x={rx(v)} y={318} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            ))}
          </g>
          <g opacity={prog(t, 17.2)}>
            <text x={30} y={392} fill={C.text} fontSize={24} fontWeight={600}>
              같은 숫자의 두 95% 구간 · 평균 차이는 둘 다 2.8
            </text>
            <line x1={80} y1={690} x2={920} y2={690} stroke={C.muted} strokeWidth={1.5} />
            {[-10, 0, 10, 20].map((v) => (
              <text key={v} x={ix(v)} y={720} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v < 0 ? `−${-v}` : v}
              </text>
            ))}
            <line x1={ix(0)} y1={584} x2={ix(0)} y2={636} stroke={C.text} strokeWidth={2} strokeDasharray="5 5" />
            <text x={80} y={570} fill={C.green} fontSize={22} fontWeight={600}>
              seed 를 짝지음 · [0.58, 5.02] · 0 을 포함하지 않음
            </text>
            <rect x={ix(0.58)} y={601} width={ix(5.02) - ix(0.58)} height={18} rx={6} fill={C.green} />
            <circle cx={ix(2.8)} cy={610} r={8} fill={C.text} />
          </g>
          <g opacity={prog(t, 23.8)}>
            <line x1={ix(0)} y1={444} x2={ix(0)} y2={496} stroke={C.text} strokeWidth={2} strokeDasharray="5 5" />
            <text x={80} y={430} fill={C.red} fontSize={22} fontWeight={600}>
              짝짓지 않음 · Welch t 구간 [−12.5, 18.1] · 0 을 포함
            </text>
            <rect x={ix(-12.5)} y={461} width={ix(18.1) - ix(-12.5)} height={18} rx={6} fill={C.red} opacity={0.85} />
            <circle cx={ix(2.8)} cy={470} r={8} fill={C.text} />
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function SignFlip() {
  const t = useSec()
  const counts: [number, number][] = [
    [-14, 1], [-12, 2], [-10, 1], [-8, 1], [-6, 3], [-4, 4], [-2, 3], [0, 2], [2, 3], [4, 4], [6, 3], [8, 1], [10, 1], [12, 2], [14, 1],
  ]
  const cx = (v: number) => 80 + ((v + 14) / 2) * 56 + 28
  const base = 600
  const examples: [string, string, number][] = [
    ['+3 +1 +4 +1 +5 = 14', '관측한 합', 1.2],
    ['−3 +1 +4 +1 +5 = 8', '', 2],
    ['+3 −1 −4 +1 −5 = −6', '', 2.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            차이 3, 1, 4, 1, 5 의 부호를 뒤집는 32 가지 경우의 합
          </text>
          {examples.map(([s, note, at], i) => (
            <g key={s} opacity={prog(t, at)}>
              <text x={40} y={100 + i * 38} fill={i === 0 ? C.green : C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
                {s}
              </text>
              {note && (
                <text x={420} y={100 + i * 38} fill={C.green} fontSize={22}>
                  {note}
                </text>
              )}
            </g>
          ))}
          <text x={40} y={214} fill={C.muted} fontSize={22} opacity={prog(t, 3.6)}>
            부호 5 개 · 2 × 2 × 2 × 2 × 2 = 32 가지
          </text>
          <g opacity={prog(t, 6.2)}>
            <line x1={80} y1={base} x2={920} y2={base} stroke={C.muted} strokeWidth={1.5} />
            {counts.map(([v, n], i) => {
              const h = 70 * n * prog(t, 6.4 + i * 0.08, 0.5)
              const edge = Math.abs(v) === 14
              return (
                <g key={v}>
                  <rect x={cx(v) - 22} y={base - h} width={44} height={h} rx={4} fill={edge ? C.red : C.blue} opacity={edge ? 0.95 : 0.7} />
                  <text x={cx(v)} y={base - 70 * n - 10} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                    {n}
                  </text>
                  <text x={cx(v)} y={base + 30} textAnchor="middle" fill={edge ? C.red : C.muted} fontSize={20} fontFamily={MONO}>
                    {v < 0 ? `−${-v}` : v}
                  </text>
                </g>
              )
            })}
            <text x={500} y={base + 62} textAnchor="middle" fill={C.muted} fontSize={20}>
              합 (가로) · 그 합이 나오는 경우의 수 (막대)
            </text>
          </g>
          <g opacity={prog(t, 8)}>
            <text x={960} y={400} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600}>
              관측한 합 14 · 모두 +
            </text>
            <text x={40} y={400} fill={C.red} fontSize={22} fontWeight={600}>
              반대 −14 · 모두 −
            </text>
          </g>
          <text x={40} y={715} fill={C.accent} fontSize={32} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9.4)}>
            양측 p = 2 ÷ 32 = 0.0625
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={12.7} title={<Head color={C.orange}>같은 데이터의 짝지은 t 검정</Head>}>
        <Ln t={t} at={13} style={mono(C.orange, 24)}>
          t = 2.8 ÷ 0.8 = 3.5 (자유도 4) → p ≈ 0.025
        </Ln>
        <Ln t={t} at={15} style={line(C.text, 23)}>
          차이가 정규분포를 따른다고 가정한 값 · seed 가 적으면 이 가정을 확인할 방법이 거의 없다
        </Ln>
        <Ln t={t} at={16.5} style={line(C.green, 23)}>
          sign-flip 검정은 이 가정 없이 쓴다
        </Ln>
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={19.2} title={<Head color={C.red}>seed 수에 따른 가장 작은 양측 p</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
            {['seed 수', '부호 경우의 수', '가장 작은 양측 p'].map((h, i) => (
              <span key={h} style={{ width: [150, 230, 310][i], fontSize: 22, color: C.muted, textAlign: 'right' }}>
                {h}
              </span>
            ))}
          </div>
          {[
            ['5', '32', '2 ÷ 32 = 0.0625', C.red],
            ['6', '64', '2 ÷ 64 ≈ 0.031', C.green],
            ['10', '1,024', '2 ÷ 1024 ≈ 0.002', C.green],
          ].map(([n, m, p, color], k) => (
            <div key={n} style={{ display: 'flex', opacity: prog(t, 19.5 + k * 0.4) }}>
              <span style={{ ...mono(C.text, 24), width: 150, textAlign: 'right' }}>{n}</span>
              <span style={{ ...mono(C.text, 24), width: 230, textAlign: 'right' }}>{m}</span>
              <span style={{ ...mono(color, 24), width: 310, textAlign: 'right' }}>{p}</span>
            </div>
          ))}
        </div>
        <Ln t={t} at={21.5} style={line(C.text, 22)}>
          5% 기준에는 seed 6 개 이상 · 미리 정한 방향만 보는 단측 검정이면 1 ÷ 32 ≈ 0.031 (방향은 결과를 보기 전에)
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

const PauseSignFlip = () => (
  <PauseWrite
    question="seed 8 개의 차이가 모두 양수다. 정확 sign-flip 검정의 양측 p 는 얼마일까?"
    answer={
      <>
        2 를 8 번 곱한 256 가지 중 극단은 모두 + 와 모두 − 의 2 가지
        <br />
        양측 p = 2 ÷ 256 ≈ 0.0078
      </>
    }
  />
)

// ---------- 3. seed 수와 Holm ----------

function Power() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={740} at={6}>
        <div style={{ padding: '28px 32px', display: 'grid', gap: 16 }}>
          <div style={{ opacity: prog(t, 6.2) }}>
            <Head color={C.orange}>Colas 등 · HalfCheetah 의 DDPG 두 탐색 방식</Head>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.6) }}>action 에 noise 를 더하는 방식 · network parameter 에 noise 를 더하는 방식</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 7.6) }}>
            seed 5 개씩 · 평균 return <span style={mono(C.text, 24)}>3523</span> 과 <span style={mono(C.text, 24)}>4905</span> · 표준편차 <span style={mono(C.text, 24)}>1341</span> 과 <span style={mono(C.text, 24)}>990</span>
          </span>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, opacity: prog(t, 8.4) }}>
              {['seed 수', 'Welch t 검정의 p', '놓칠 확률 β', '판정'].map((h, i) => (
                <span key={h} style={{ width: [150, 260, 220, 280][i], fontSize: 23, color: C.muted, textAlign: i === 3 ? 'left' : 'right', paddingLeft: i === 3 ? 30 : 0 }}>
                  {h}
                </span>
              ))}
            </div>
            {[
              ['5', '0.1', '0.51', '차이를 못 찾음', C.red, 8.8],
              ['10', '0.0037', '0.19', '차이를 찾음', C.green, 13],
            ].map(([n, p, b, r, color, at]) => (
              <div key={n as string} style={{ display: 'flex', alignItems: 'baseline', opacity: prog(t, at as number) }}>
                <span style={{ ...mono(C.text, 28), width: 150, textAlign: 'right' }}>{n}</span>
                <span style={{ ...mono(color as string, 28), width: 260, textAlign: 'right' }}>{p}</span>
                <span style={{ ...mono(color as string, 28), width: 220, textAlign: 'right' }}>{b}</span>
                <span style={{ fontSize: 24, color: color as string, fontWeight: 600, width: 280, paddingLeft: 30 }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 26 }}>
            <span style={{ ...line(C.text, 23), opacity: prog(t, 9.6) }}>실제 차이가 이 정도일 때 놓칠 확률 β</span>
            <Bar label="seed 5 개" value={0.51} max={1} color={C.red} at={10} width={420} labelW={160} sub="절반의 확률로 놓친다" />
            <Bar label="seed 10 개" value={0.19} max={1} color={C.green} at={13.6} width={420} labelW={160} />
          </div>
        </div>
      </Card>
      <Box x={1096} y={140} w={760} h={340} at={0.3} gap={12} title={<Head color={C.accent}>검정이 틀리는 두 방식</Head>}>
        <Ln t={t} at={0.6} style={line(C.text, 23)}>
          type I 오류: 차이가 없는데 있다고 판정 · 5% 기준이 이 확률을 정한다
        </Ln>
        <Ln t={t} at={1.8} style={line(C.red, 23)}>
          type II 오류: 차이가 있는데 찾지 못함 · 그 확률이 β
        </Ln>
        <Ln t={t} at={3.4} style={line(C.muted, 22)}>
          β 는 seed 수 · 차이의 크기 · seed 사이 분산으로 정해지고, 1 − β 를 검정력(power)이라고 한다
        </Ln>
      </Box>
      <Box x={1096} y={506} w={760} h={374} at={19.2} gap={12} title={<Head color={C.purple}>seed 수 정하기</Head>}>
        <Ln t={t} at={19.5} style={line(C.text, 23)}>
          표준편차를 실제보다 40% 작게 어림하면 seed 17 개가 필요한 비교에 7 개면 된다고 잘못 정한다
        </Ln>
        <Ln t={t} at={21.6} style={line(C.green, 23)}>
          본 실험 전에 seed 20 개 이상으로 분산을 어림하고, 계산보다 넉넉히 쓴다
        </Ln>
        <Ln t={t} at={23.4} style={line(C.muted, 22)}>
          Agarwal 등 · Atari 100k: 흔히 충분하다는 20 ~ 30 번보다 많은 50 ~ 100 번이 있어야 중앙값의 개선을 믿을 수 있었다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Holm() {
  const t = useSec()
  const rows: [string, string, string, string][] = [
    ['1', '0.01', '0.05 ÷ 3 = 0.0167', '기각'],
    ['2', '0.02', '0.05 ÷ 2 = 0.025', '기각 못 함'],
    ['3', '0.04', '0.05 ÷ 1 = 0.05', '기각 못 함'],
  ]
  const W = [100, 120, 290, 110, 290]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={150} at={0.3} gap={12} title={<Head>독립인 검정 3 개를 각각 5% 기준으로 하면</Head>}>
        <Ln t={t} at={1.6} style={mono(C.red, 28)}>
          적어도 하나가 우연히 유의 = 1 − 0.95³ ≈ 0.143 (약 14%)
        </Ln>
      </Box>
      <Panel x={64} y={320} w={1100} h={560} style={{ opacity: prog(t, 6.2) }}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 12 }}>
          <Head color={C.text}>p = 0.01, 0.02, 0.04 · 비교 3 개 (m = 3)</Head>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, marginTop: 6 }}>
            {['순서 k', 'p', 'Holm 의 기준', 'Holm', 'Bonferroni 0.0167'].map((h, i) => (
              <span key={h} style={{ width: W[i], fontSize: 22, color: i >= 2 ? (i === 4 ? C.orange : C.green) : C.muted, textAlign: i === 4 ? 'left' : 'right', paddingLeft: i === 4 ? 40 : 0 }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([k, p, th, bon], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'baseline', opacity: prog(t, 6.6 + i * 0.4) }}>
              <span style={{ ...mono(C.muted, 26), width: W[0], textAlign: 'right' }}>{k}</span>
              <span style={{ ...mono(C.text, 26), width: W[1], textAlign: 'right' }}>{p}</span>
              <span style={{ ...mono(C.green, 24), width: W[2], textAlign: 'right' }}>{th}</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: C.green, width: W[3], textAlign: 'right', opacity: prog(t, 13 + i * 0.6) }}>기각</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: bon === '기각' ? C.green : C.red, width: W[4], paddingLeft: 40, opacity: prog(t, 15 + i * 0.6) }}>{bon}</span>
            </div>
          ))}
          <span style={{ ...line(C.text, 22), marginTop: 14, opacity: prog(t, 8) }}>Holm: p 를 작은 것부터 늘어놓고 k 번째 p 를 0.05 ÷ (m + 1 − k) 와 비교 · 기준을 처음 넘는 곳에서 멈춘다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>R 문서: Holm 은 같은 보장을 하면서 Bonferroni 보다 늘 같거나 많이 기각한다</span>
        </div>
      </Panel>
      <Box x={1196} y={320} w={660} h={560} at={19.2} gap={16} title={<Head color={C.red}>seed 수의 한계와 겹치면</Head>}>
        <Ln t={t} at={19.5} style={mono(C.text, 24)}>
          seed 6 개 · 가장 작은 p
        </Ln>
        <Ln t={t} at={19.8} style={mono(C.orange, 26)}>
          2 ÷ 64 ≈ 0.031
        </Ln>
        <Ln t={t} at={20.6} style={mono(C.text, 24)}>
          비교 셋 · Holm 의 첫 기준
        </Ln>
        <Ln t={t} at={20.9} style={mono(C.green, 26)}>
          0.05 ÷ 3 ≈ 0.0167
        </Ln>
        <Ln t={t} at={22} style={line(C.red, 24)}>
          0.031 은 0.0167 보다 커서 어떤 결과도 기각할 수 없다
        </Ln>
        <Ln t={t} at={23.4} style={line(C.green, 23)}>
          → 비교할 설정의 수를 미리 줄이거나 seed 를 늘린다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

const PauseHolm = () => (
  <PauseWrite
    question="비교 4 개의 p 가 0.005, 0.03, 0.02, 0.2 다. Holm 보정 (5%) 으로 기각되는 것은 몇 개일까?"
    answer={
      <>
        0.005 ≤ 0.05 ÷ 4 = 0.0125 → 기각
        <br />
        다음 0.02 &gt; 0.05 ÷ 3 ≈ 0.0167 → 멈춤 · 답: 1 개
      </>
    }
  />
)

// ---------- 4. IQM · 사전 등록 · GPU ----------

function Iqm() {
  const t = useSec()
  const vals = [0, 10, 52, 55, 58, 60, 63, 200]
  const bx = (i: number) => 74 + i * 116
  const groups: [string, number, number, string][] = [
    ['아래 25% · 버림', 0, 1, C.dim],
    ['가운데 50% · 평균', 2, 5, C.green],
    ['위 25% · 버림', 6, 7, C.dim],
  ]
  const steps: [string, number][] = [
    ['seed 결과 n 개에서 뽑은 값을 다시 넣는 복원 추출로 n 개를 다시 뽑는다', 17.8],
    ['뽑은 묶음의 IQM 을 계산한다', 18.6],
    ['예: 2,000 번 되풀이해 IQM 2,000 개를 얻는다', 19.4],
    ['늘어놓아 50 번째 (2.5%) 와 1,950 번째 (97.5%) → 95% 구간', 20.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1060} h={500}>
        <svg width={1060} height={200}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            seed 8 개의 return (크기순) · 한 seed 는 실패, 한 seed 는 매우 좋음
          </text>
          {groups.map(([s, a, b, color]) => (
            <text key={s} x={(bx(a) + bx(b) + 100) / 2} y={96} textAnchor="middle" fill={color} fontSize={22} fontWeight={600} opacity={prog(t, 5.8)}>
              {s}
            </text>
          ))}
          {vals.map((v, i) => {
            const mid = i >= 2 && i <= 5
            const k = prog(t, 5.8)
            return (
              <g key={i} opacity={prog(t, 0.6 + i * 0.15) * (mid ? 1 : 1 - 0.55 * k)}>
                <rect x={bx(i)} y={112} width={100} height={70} rx={12} fill={mid ? `${C.green}${k > 0.5 ? '22' : '10'}` : C.bg} stroke={mid && k > 0.5 ? C.green : C.cardEdge} strokeWidth={2} />
                <text x={bx(i) + 50} y={158} textAnchor="middle" fill={C.text} fontSize={30} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 222, display: 'grid', gap: 18 }}>
          <Bar label="평균" value={62.25} max={70} color={C.red} at={11.2} width={420} labelW={120} fmt="62.25" sub="합 498 ÷ 8" />
          <Bar label="중앙값" value={56.5} max={70} color={C.blue} at={12.4} width={420} labelW={120} fmt="56.5" sub="55 와 58 의 평균" />
          <Bar label="IQM" value={56.25} max={70} color={C.green} at={13.6} width={420} labelW={120} fmt="56.25" sub="52, 55, 58, 60 의 평균" />
        </div>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 400, opacity: prog(t, 15) }}>
          <span style={line(C.muted, 22)}>평균은 200 하나에 끌려 올라가고, 중앙값과 IQM 은 가운데에 머문다 · IQM 은 가운데 네 값을 모두 써서 seed 가 적을 때 덜 흔들린다</span>
        </div>
      </Panel>
      <Box x={64} y={670} w={1060} h={210} at={15.8} gap={10} title={<Head color={C.purple}>분포 전체로 보기 · 점수 분포 (performance profile)</Head>}>
        <Ln t={t} at={16} style={mono(C.text, 23)}>
          점수 50 보다 높은 비율 6 ÷ 8 = 0.75 · 100 보다 높은 비율 1 ÷ 8 = 0.125
        </Ln>
        <Ln t={t} at={16.6} style={line(C.muted, 22)}>
          두 설정의 곡선을 겹치면 한쪽이 모든 점수대에서 위인지, 큰 점수 몇 개로 평균만 높은지 보인다
        </Ln>
      </Box>
      <Box x={1156} y={140} w={700} h={740} at={17.5} gap={10} title={<Head color={C.accent}>IQM 의 bootstrap 구간</Head>}>
        {steps.map(([s, at], i) => (
          <div key={s} style={{ display: 'grid', gap: 6, opacity: prog(t, at) }}>
            <div style={{ padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${C.accent}66`, background: `${C.accent}10`, ...line(C.text, 22) }}>{s}</div>
            {i < steps.length - 1 && <span style={{ textAlign: 'center', fontSize: 24, color: C.muted, lineHeight: 1 }}>↓</span>}
          </div>
        ))}
        <Ln t={t} at={22} style={{ ...line(C.muted, 22), marginTop: 8 }}>
          과제가 여러 개면 과제마다 따로 다시 뽑는 stratified bootstrap
        </Ln>
        <Ln t={t} at={23.8} style={line(C.green, 22)}>
          Agarwal 등: seed 10 개부터 괜찮은 추정
        </Ln>
        <Ln t={t} at={26} style={line(C.red, 22)}>
          seed 3 개에서는 실제 95% 구간보다 좁게 나왔다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Prereg() {
  const t = useSec()
  const plan: [string, string][] = [
    ['비교할 설정과 기준', 'A: Huber loss · B: squared error'],
    ['seed 수와 짝짓기', 'seed 0 ~ 9 를 두 설정에 함께 사용'],
    ['step 예산과 평가 방식', '10 만 step · 결정론적 평가 10 episode 의 평균'],
    ['요약과 검정', '마지막 평가의 IQM 과 95% bootstrap 구간 · 짝지은 sign-flip 검정 (양측 5%)'],
    ['여러 비교의 보정', '비교가 둘 이상이면 Holm 보정'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={740} at={0.3} gap={12} title={<Head color={C.accent}>사전 등록 · 실험 전에 적어 둘 것 (예)</Head>}>
        {plan.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 10, borderBottom: `1px solid ${C.cardEdge}`, opacity: prog(t, 0.8 + i * 0.5) }}>
            <span style={{ width: 250, flexShrink: 0, fontSize: 23, fontWeight: 600, color: C.accent, lineHeight: 1.45 }}>{k}</span>
            <span style={line(C.text, 23)}>{v}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.4), marginTop: 6 }}>결과를 본 뒤 seed 수 · 평가 시점 · 요약을 고르면 p 값과 구간이 뜻을 잃는다 · 바꾼 것은 이유와 함께 밝힌다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 4.2), marginTop: 4 }}>NeurIPS 2020 pre-registration workshop · 계획만 담은 논문을 먼저 심사</span>
        <Flow steps={['제안 73 편', '채택 38 편', '결과 25 편', '논문집 23 편']} color={C.purple} at={4.6} gap={0.3} />
      </Box>
      <Box x={956} y={140} w={900} h={200} at={6.2} gap={10} title={<Head color={C.orange}>부동소수점 덧셈의 순서 · Python 에서</Head>}>
        <Ln t={t} at={7} style={mono(C.text, 28)}>
          (0.1 + 0.2) + 0.3 = <span style={{ color: C.red }}>0.6000000000000001</span>
        </Ln>
        <Ln t={t} at={8.6} style={mono(C.text, 28)}>
          0.1 + (0.2 + 0.3) = <span style={{ color: C.green }}>0.6</span>
        </Ln>
      </Box>
      <Box x={956} y={360} w={900} h={250} at={12.7} gap={10} title={<Head color={C.red}>GPU 에서는</Head>}>
        <Ln t={t} at={13} style={line(C.text, 22)}>
          덧셈을 나눠 병렬로 계산해 순서가 실행마다 달라질 수 있다 (CUDA 문서)
        </Ln>
        <Ln t={t} at={14.6} style={line(C.text, 22)}>
          cuDNN 의 일부 연산은 여러 thread 가 같은 값에 동시에 더하는 atomic 연산 → 같은 GPU 에서도 실행마다 반올림이 다르다
        </Ln>
        <Ln t={t} at={16.6} style={line(C.orange, 22)}>
          RL: 마지막 자리 차이가 action 을 한 번 바꾸면 그 뒤 경험이 달라진다
        </Ln>
      </Box>
      <Box x={956} y={630} w={900} h={250} at={19.2} gap={8} title={<Head color={C.green}>그래서 기록과 비교는</Head>}>
        <Ln t={t} at={19.5} style={mono(C.muted, 21)}>
          torch.use_deterministic_algorithms(True)
        </Ln>
        <Ln t={t} at={19.9} style={mono(C.muted, 21)}>
          torch.backends.cudnn.benchmark = False
        </Ln>
        <Ln t={t} at={21} style={line(C.text, 22)}>
          결정론적 연산은 대개 더 느리다 · seed 와 함께 GPU 종류, CUDA · cuDNN · PyTorch 버전을 적고 seed 묶음의 구간을 비교한다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

const PauseIqm = () => (
  <PauseWrite
    question="seed 4 개의 return 이 10, 20, 30, 100 이다. 평균과 IQM 은 얼마이고, 100 이 1,000 이 되면 어떨까?"
    answer={
      <>
        평균 (10 + 20 + 30 + 100) ÷ 4 = 40 · IQM 25
        <br />
        1,000 이면 평균 265 로 뛰지만 IQM 은 25 그대로
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'seed 와 비교 조건', color: C.accent, text: 'seed 만 달라도 p = 0.0016 · step 예산 · 평가 방식 · 기준선을 맞추고 적는다', at: 1 },
    { tag: '짝짓기와 sign-flip', color: C.blue, text: '[−12.5, 18.1] → [0.58, 5.02] · seed 5 개의 양측 p 하한 2 ÷ 32 = 0.0625', at: 4.4 },
    { tag: 'seed 수와 Holm', color: C.orange, text: 'seed 5 개 β 0.51 → 10 개 0.19 · 기준을 0.0167 · 0.025 · 0.05 로 차례로', at: 8.4 },
    { tag: 'IQM · 사전 등록 · GPU', color: C.green, text: 'IQM 56.25 대 평균 62.25 · 계획은 실험 전에 · seed 는 분포에서 뽑는 번호', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            seed 를 몇 개 쓰고, 어떻게 계산하고 적어야 차이를 믿을 수 있을까?
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Diffusion Policy · ACT · Real Robot</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            성공률을 비교할 때도 같은 방법 · 실물 로봇에서는 성공률을 시도 수와 함께 적기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/rl-experiments (Henderson · Colas · Agarwal · Machado 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function RlExperiments() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'seed-var': SeedVar,
        conditions: Conditions,
        'pause-best': PauseBest,
        paired: Paired,
        'sign-flip': SignFlip,
        'pause-signflip': PauseSignFlip,
        power: Power,
        holm: Holm,
        'pause-holm': PauseHolm,
        iqm: Iqm,
        record: Prereg,
        'pause-iqm': PauseIqm,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
