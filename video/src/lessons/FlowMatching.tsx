import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './flow-matching.narration.json'
import { script } from './flow-matching.script'

// Numbers follow lessons/flow-matching/README.md (see flow-matching.script.ts). The grey crossing lines are schematic (marked
// 모식도); the Euler paths for v = 2t and the learned ±2 paths are computed from the lesson's own formulas.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600 }}>
        {children}
      </span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, sub, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number }) {
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
function Table({ head, rows, widths, at, step = 0.6, size = 22, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
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

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GENERATIVE · FLOW MATCHING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Flow Matching</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            noise → 데이터 <span style={{ color: C.accent }}>직선 위의 속도</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            그 속도를 network 가 맞히게 학습하고, Euler step 몇 번으로 sample 을 만든다
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
      <Card x={64} y={140} w={1792} h={270} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>action chunk 하나를 만들 때 network 를 쓰는 횟수</Head>
          <Bar label="Diffusion Policy 학습" value={100} max={100} color={C.orange} at={0.6} width={700} unit=" 번" sub="DDPM 100 단계" labelW={330} />
          <Bar label="Diffusion Policy 실행" value={10} max={100} color={C.red} at={1.6} width={700} unit=" 번" sub="DDIM 10 단계 · RTX 3080 에서 0.1 초" labelW={330} />
          <Bar label="π0 (flow matching)" value={10} max={100} color={C.green} at={4.6} width={700} unit=" 번" sub="action 50 개 · 10 번에 27 ms (RTX 4090)" labelW={330} />
        </div>
      </Card>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 450, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          쓸 때만 건너뛰지 말고, <span style={{ color: C.accent }}>처음부터 몇 step 만에 noise 에서 행동까지 가도록 학습할 수 있을까?</span>
        </div>
      </Appear>
      <Card x={280} y={660} w={1360} h={210} at={5.4}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12, opacity: prog(t, 5.6) }}>
          <Head color={C.accent} size={26}>
            flow matching (2022)
          </Head>
          <span style={line(C.text, 25)}>noise 와 데이터를 직선으로 잇고, 그 직선을 따라 움직이는 속도를 network 가 맞히게 한다</span>
          <span style={line(C.muted, 22)}>Lipman 등 (Flow Matching) · Liu 등 (rectified flow) · Albergo 와 Vanden-Eijnden (stochastic interpolant) 이 따로 발표</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. straight line and target velocity ----------

function LinePlot({ t }: { t: number }) {
  const X = (s: number) => 110 + 690 * s
  const Y = (v: number) => 640 - 130 * (v + 1.5)
  const reach = prog(t, 6.7, 2.2)
  const dots: [number, number, string?, ('start' | 'end')?, number?, number?][] = [
    [0, -1, 'noise −1', 'start', 16, 35],
    [0.25, -0.25, '−0.25', 'end', -16, -16],
    [0.5, 0.5, '0.5', 'end', -16, -16],
    [0.75, 1.25],
    [1, 2, '데이터 2', 'end', -16, -16],
  ]
  return (
    <svg width={860} height={740}>
      <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.4)}>
        noise −1 과 데이터 2 를 잇는 직선
      </text>
      <text x={30} y={86} fill={C.muted} fontSize={21} opacity={prog(t, 0.6)}>
        t 는 초가 아니라 출발 0 부터 도착 1 까지 얼마나 왔는지
      </text>
      <g opacity={prog(t, 0.6)}>
        <line x1={X(0)} y1={640} x2={X(1)} y2={640} stroke={C.cardEdge} strokeWidth={2} />
        <line x1={X(0)} y1={150} x2={X(0)} y2={640} stroke={C.cardEdge} strokeWidth={2} />
        {[-1, 2].map((v) => (
          <g key={v}>
            <line x1={X(0)} y1={Y(v)} x2={X(1)} y2={Y(v)} stroke={C.grid} strokeWidth={1.5} strokeDasharray="5 7" />
            <text x={96} y={Y(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v < 0 ? `−${-v}` : v}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((s) => (
          <text key={s} x={X(s)} y={674} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {s}
          </text>
        ))}
        <text x={822} y={647} fill={C.muted} fontSize={22} fontFamily={MONO}>
          t
        </text>
      </g>
      <line x1={X(0)} y1={Y(-1)} x2={X(reach)} y2={Y(-1 + 3 * reach)} stroke={C.accent} strokeWidth={4} strokeLinecap="round" opacity={prog(t, 6.6, 0.3)} />
      {dots.map(([s, v, label, anchor, dx, dy]) => (
        <g key={s} opacity={prog(t, 6.8 + s * 2.2)}>
          <circle cx={X(s)} cy={Y(v)} r={8} fill={s === 0 ? C.purple : s === 1 ? C.green : C.accent} />
          {label && (
            <text x={X(s) + (dx ?? 0)} y={Y(v) + (dy ?? 0)} textAnchor={anchor} fill={s === 0 ? C.purple : s === 1 ? C.green : C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              {label}
            </text>
          )}
        </g>
      ))}
      <g opacity={prog(t, 10)}>
        <polyline points={pts([[X(0.25), Y(-0.25)], [X(0.5), Y(-0.25)], [X(0.5), Y(0.5)]])} fill="none" stroke={C.orange} strokeWidth={2.5} strokeDasharray="6 5" />
        <text x={(X(0.25) + X(0.5)) / 2} y={Y(-0.25) + 34} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          Δt 0.25
        </text>
        <text x={X(0.5) + 12} y={Y(0.125) + 8} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          Δx 0.75
        </text>
      </g>
      <text x={30} y={716} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21.5)}>
        속도 3 으로 시간 1 동안 → −1 + 3 × 1 = 2
      </text>
    </svg>
  )
}

function LineScene() {
  const t = useSec()
  const xt = (
    <>
      x<sub>t</sub>
    </>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <LinePlot t={t} />
      </Card>
      <Box x={956} y={140} w={900} h={190} at={0.4} title={<Head color={C.orange}>DDPM 의 sampling</Head>}>
        <span style={{ ...line(), opacity: prog(t, 0.8) }}>
          step 하나에 network 한 번 · <span style={mono(C.orange, 24)}>T = 1000</span> 이면 1000 번
        </span>
        <span style={{ ...line(C.muted), opacity: prog(t, 3) }}>작은 변화를 가정한 식이라 크게 건너뛰면 맞지 않는다</span>
      </Box>
      <Box x={956} y={350} w={900} h={360} at={13} title={<Head color={C.accent}>직선 위 시각 t 의 점</Head>}>
        <span style={{ ...mono(C.text, 30), opacity: prog(t, 13.3) }}>
          {xt} = (1 − t)·ε + t·x<sub>1</sub>
        </span>
        <Table
          head={['t', '(1 − t) × ε', 't × x₁', '점']}
          widths={[100, 290, 220, 130]}
          at={14.5}
          step={0.7}
          rows={[
            ['0', '1 × (−1) = −1', '0 × 2 = 0', '−1'],
            ['0.25', '0.75 × (−1) = −0.75', '0.25 × 2 = 0.5', '−0.25'],
            ['0.5', '0.5 × (−1) = −0.5', '0.5 × 2 = 1', '0.5'],
            ['1', '0 × (−1) = 0', '1 × 2 = 2', '2'],
          ]}
          colors={[C.purple, undefined, undefined, C.green]}
        />
      </Box>
      <Box x={956} y={730} w={900} h={150} at={20} color={`${C.green}88`} title={<Head color={C.green}>target velocity</Head>}>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 20.4) }}>
          0.75 ÷ 0.25 = 3 = x<sub>1</sub> − ε = 2 − (−1)
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function CfmLoss() {
  const t = useSec()
  const node = (s: string, color: string, at: number) => (
    <div style={{ padding: '11px 18px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at) }}>{s}</div>
  )
  const arr = (at: number) => <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at) }}>→</span>
  const steps: [string, ReactNode, number][] = [
    ['①', <>데이터에서 x<sub>1</sub> 하나를 꺼내고, N(0, 1) 에서 noise ε 을 뽑는다</>, 6.8],
    ['②', '0 과 1 사이에서 t 를 고르게 뽑는다 (uniform 분포)', 8.4],
    ['③', <>직선 위의 점 (1 − t)·ε + t·x<sub>1</sub> 을 만들어 network 에 점과 t 를 넣는다</>, 10],
    ['④', <>출력과 target velocity x<sub>1</sub> − ε 의 차이를 제곱해 loss 를 구하고, gradient descent 로 weight 를 조금 고친다</>, 11.6],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={220} at={0.3} title={<Head>생성할 때는 noise 의 짝을 모른다 → network 가 그 자리의 속도를 대신 낸다</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {node('지금 위치 + 시각 t', C.purple, 0.8)}
          {arr(1.2)}
          {node('network', C.orange, 1.5)}
          {arr(1.9)}
          {node('그 자리의 속도', C.accent, 2.2)}
        </div>
        <span style={{ ...line(C.muted), opacity: prog(t, 3.2) }}>
          데이터가 2 하나여도 위치 0.5 의 속도는 t = 0 이면 <span style={mono(C.text, 23)}>1.5 ÷ 1 = 1.5</span>, t = 0.5 이면 <span style={mono(C.text, 23)}>1.5 ÷ 0.5 = 3</span> → 시각도 함께 넣는다
        </span>
      </Box>
      <Box x={64} y={390} w={880} h={490} at={6.5} title={<Head color={C.accent}>학습 한 step</Head>}>
        {steps.map(([n, s, at]) => (
          <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ color: C.accent, fontSize: 24, fontWeight: 700 }}>{n}</span>
            <span style={line()}>{s}</span>
          </div>
        ))}
        <span style={{ ...line(C.green), fontWeight: 600, opacity: prog(t, 19.8), borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 10 }}>
          쌍 (ε, x<sub>1</sub>) 하나를 조건으로 정해야 정답이 계산된다 → conditional flow matching loss (Lipman 등)
        </span>
      </Box>
      <Box x={976} y={390} w={880} h={240} at={13} title={<Head>예: x₁ = 2, ε = −1, t = 0.5</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 13.4) }}>점 = 0.5 × (−1) + 0.5 × 2 = 0.5</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 15) }}>
          출력 <span style={{ color: C.orange }}>2.5</span> · 정답 2 − (−1) = <span style={{ color: C.green }}>3</span>
        </span>
        <span style={{ ...mono(C.red, 26), opacity: prog(t, 16.8) }}>loss = (3 − 2.5)² = 0.25</span>
      </Box>
      <Box x={976} y={650} w={880} h={230} at={24.5}>
        <Table
          head={['', 'DDPM', 'flow matching']}
          widths={[200, 290, 320]}
          at={24.7}
          step={0.5}
          rows={[
            ['맞히는 값', '섞인 noise ε', '직선의 속도 x₁ − ε'],
            ['시각 입력', 'step 번호 1 ~ 1000', 't (0 ~ 1 의 실수)'],
            ['이 예의 정답', '−1', '3'],
          ]}
          colors={[undefined, undefined, C.green]}
        />
      </Box>
    </AbsoluteFill>
  )
}

const PauseTarget = () => (
  <PauseWrite
    question="noise ε = 1.5, 데이터 x₁ = 2 다. target velocity 와 t = 0.4 일 때 직선 위의 점은?"
    answer={
      <>
        target velocity = x₁ − ε = 2 − 1.5 = 0.5
        <br />
        점 = 1.5 + 0.4 × 0.5 = 1.7 · 섞는 식 0.6 × 1.5 + 0.4 × 2 = 1.7
      </>
    }
  />
)

// ---------- 2. Euler and the number of steps ----------

function EulerPlot({ t }: { t: number }) {
  const X = (s: number) => 90 + 530 * s
  const Y = (v: number) => 400 - 330 * v
  const curve: [number, number][] = Array.from({ length: 41 }, (_, i) => [X(i / 40), Y((i / 40) ** 2)])
  // Euler on v = 2t from 0: after k of n steps the position is k(k − 1) ÷ n²
  const path = (n: number): [number, number][] => Array.from({ length: n + 1 }, (_, k) => [X(k / n), Y((k * (k - 1)) / (n * n))])
  const runs: [number, string, number, string][] = [
    [1, C.red, 20.2, '0'],
    [2, C.orange, 21.2, '0.5'],
    [4, C.purple, 22.2, '0.75'],
    [10, C.blue, 23.2, '0.9'],
  ]
  return (
    <svg width={780} height={460}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
        속도 v = 2t · 초록 점선 = 실제 위치 x = t²
      </text>
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} stroke={C.cardEdge} strokeWidth={2} />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(1) - 10} stroke={C.cardEdge} strokeWidth={2} />
      <line x1={X(0)} y1={Y(1)} x2={X(1)} y2={Y(1)} stroke={C.grid} strokeWidth={1.5} strokeDasharray="5 7" />
      {[0, 1].map((v) => (
        <text key={v} x={76} y={Y(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
          {v}
        </text>
      ))}
      {[0, 0.5, 1].map((s) => (
        <text key={s} x={X(s)} y={430} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
          {s}
        </text>
      ))}
      <text x={X(1) + 4} y={452} fill={C.muted} fontSize={20} fontFamily={MONO}>
        t
      </text>
      <polyline points={pts(curve)} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="8 6" />
      <text x={X(1) + 15} y={Y(1) + 7} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
        실제 · 1
      </text>
      {runs.map(([n, color, at, end]) => (
        <g key={n} opacity={prog(t, at)}>
          <polyline points={pts(path(n))} fill="none" stroke={color} strokeWidth={3} />
          {path(n).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4} fill={color} />
          ))}
          <text x={X(1) + 15} y={Y(1 - 1 / n) + 7} fill={color} fontSize={20} fontFamily={MONO} fontWeight={600}>
            n {n} · {end}
          </text>
        </g>
      ))}
    </svg>
  )
}

function EulerScene() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={584} h={260} at={0.3} title={<Head color={C.accent}>Euler 법</Head>}>
        <span style={{ ...line(), opacity: prog(t, 0.7) }}>0 부터 1 까지를 n 토막으로 자른다</span>
        <span style={{ ...line(), opacity: prog(t, 2.2) }}>한 토막 동안은 속도가 바뀌지 않는다고 보고 직진</span>
        <span style={{ ...line(C.muted), opacity: prog(t, 3.8) }}>이름은 18 세기 스위스 수학자 Leonhard Euler</span>
      </Box>
      <Box x={668} y={140} w={584} h={260} at={6.5} title={<Head color={C.orange}>step 하나의 계산</Head>}>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 6.8) }}>x새 = x + Δt × v(x, t)</span>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 8.6) }}>Δt = 1 ÷ n</span>
        <span style={{ ...line(), opacity: prog(t, 10.2) }}>step 하나에 network 를 한 번 쓴다</span>
      </Box>
      <Box x={1272} y={140} w={584} h={260} at={13} color={`${C.green}88`} title={<Head color={C.green}>직선이면 오차 0</Head>}>
        <span style={{ ...line(), opacity: prog(t, 13.3) }}>속도가 줄곧 3 인 점 (noise −1 → 데이터 2)</span>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 15) }}>−1 + 1 × 3 = 2</span>
        <span style={{ ...line(C.muted), opacity: prog(t, 16.6) }}>n = 1 이어도 정확히 닿는다</span>
      </Box>
      <Card x={64} y={420} w={1792} h={460} at={19.8}>
        <EulerPlot t={t} />
        <div style={{ position: 'absolute', left: 820, top: 40, width: 940, display: 'grid', gap: 18 }}>
          <Table
            head={['step 수 n', '1', '2', '4', '10']}
            widths={[240, 140, 140, 140, 140]}
            at={20.4}
            step={1.2}
            size={24}
            rows={[
              ['닿는 위치', '0', '0.5', '0.75', '0.9'],
              ['오차 1 ÷ n', '1', '0.5', '0.25', '0.1'],
            ]}
            colors={[undefined, C.red]}
          />
          <span style={{ ...line(C.text, 24), opacity: prog(t, 23.5) }}>Euler 법은 step 을 시작할 때의 속도로 끝까지 직진해서, 도중에 빨라지면 매번 실제보다 덜 간다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>잘게 나눌수록 정확하지만, step 마다 network 를 한 번 쓴다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Cost() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>network 한 번에 0.02 초라면</Head>
          <Bar label="1000 step" value={20} max={20} color={C.red} at={0.8} width={1000} fmt="1000 × 0.02 = 20" unit=" 초" labelW={200} />
          <Bar label="100 step" value={2} max={20} color={C.orange} at={2} width={1000} fmt="100 × 0.02 = 2" unit=" 초" labelW={200} />
          <Bar label="10 step" value={0.2} max={20} color={C.green} at={3.2} width={1000} fmt="10 × 0.02 = 0.2" unit=" 초" labelW={200} />
          <div style={{ display: 'flex', gap: 18, marginTop: 6 }}>
            <Chip at={6.8}>시간은 network 를 쓰는 횟수에 그대로 비례</Chip>
            <Chip at={9} color={C.orange}>
              Diffusion Policy: DDIM 10 단계 · RTX 3080 에서 0.1 초
            </Chip>
          </div>
        </div>
      </Card>
      <Box x={64} y={490} w={880} h={390} at={12.5} title={<Head color={C.accent}>flow matching 의 선택</Head>}>
        <svg width={824} height={130} style={{ opacity: prog(t, 12.8) }}>
          <text x={20} y={30} fill={C.orange} fontSize={21} fontWeight={600}>
            곡선 · 여러 step
          </text>
          <path d="M 20 110 Q 300 110 360 20" fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="7 5" />
          <polyline points="20,110 105,110 190,98 275,72 350,30" fill="none" stroke={C.orange} strokeWidth={2.5} opacity={0.8} />
          <text x={460} y={30} fill={C.green} fontSize={21} fontWeight={600}>
            직선 · 1 step
          </text>
          {arrow(460, 110, 800, 22, C.green, 3.5)}
        </svg>
        <span style={{ ...line(C.orange, 24), opacity: prog(t, 13.6) }}>곡선 경로 (v = 2t): 오차 1 ÷ n → 줄이려면 step 을 늘려야 한다</span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 15) }}>직선 경로: 1 step 이어도 오차 0</span>
        <span style={{ ...line(C.text, 26), fontWeight: 600, opacity: prog(t, 16.4) }}>→ 경로를 직선으로 정해, step 을 늘리지 않고 오차를 줄인다</span>
      </Box>
      <div style={{ position: 'absolute', left: 976, top: 490, width: 880 }}>
        <Misconception at={19} belief="step 은 많을수록 좋다" fact="직선 경로에서는 step 1 번과 1000 번의 결과가 같아서, 나머지 999 번은 시간만 쓴다" />
      </div>
    </AbsoluteFill>
  )
}

const PauseEuler = () => (
  <PauseWrite
    question="속도가 v = 2t 인 점을 0 에서 출발시켜 n = 5 로 걸으면 t = 1 의 위치는? 오차는 얼마일까?"
    answer={
      <>
        Δt = 1 ÷ 5 = 0.2 · step 시작 속도 0, 0.4, 0.8, 1.2, 1.6
        <br />
        위치 = 0.2 × 4 = 0.8 · 오차 = 1 − 0.8 = 0.2 = 1 ÷ 5
      </>
    }
  />
)

// ---------- 3. two peaks, averaging, and diffusion ----------

const X3 = (s: number) => 90 + 670 * s
const Y3 = (v: number) => 400 - 110 * v
// schematic random pairs: noise at t = 0, data ±2 at t = 1
const PAIRS: [number, number][] = [
  [-1.8, 2], [-1.3, -2], [-0.9, 2], [-0.6, -2], [-0.3, -2], [-0.1, 2], [0.1, -2], [0.35, 2], [0.6, -2],
  [0.9, 2], [1.2, -2], [1.7, -2], [-1.5, -2], [-0.45, 2], [0.2, 2], [0.75, -2], [1.4, 2], [-1.0, 2],
]
// the learned (marginal) field for data ±2 half and half: v = (2 tanh(2tx ÷ (1 − t)²) − x) ÷ (1 − t), walked in fine steps
function learned(eps: number): [number, number][] {
  const out: [number, number][] = [[X3(0), Y3(eps)]]
  let x = eps
  const n = 500
  for (let k = 0; k < n; k++) {
    const s = k / n
    if (s > 0.996) break
    const xh = 2 * Math.tanh((2 * s * x) / (1 - s) ** 2)
    x += ((xh - x) / (1 - s)) * (1 / n)
    if (k % 5 === 4) out.push([X3((k + 1) / n), Y3(x)])
  }
  out.push([X3(1), Y3(x > 0 ? 2 : -2)])
  return out
}
const LEARNED = [-2.0, -1.5, -1.0, -0.6, -0.3, -0.1, 0.1, 0.3, 0.6, 1.0, 1.5, 2.0].map(learned)

function CrossPlot({ t }: { t: number }) {
  const grey = 0.55 - 0.42 * prog(t, 6.5, 0.8)
  const pair = prog(t, 6.8) * (1 - 0.75 * prog(t, 25.5, 0.6))
  const labels = prog(t, 7.6) * (1 - prog(t, 25.3, 0.4))
  return (
    <svg width={860} height={740}>
      <g opacity={1 - prog(t, 25.3, 0.5)}>
        <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600}>
          데이터 +2 · −2 반반, 무작위로 짝지은 직선
        </text>
        <text x={830} y={50} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
      <text x={30} y={50} fill={C.blue} fontSize={26} fontWeight={600} opacity={prog(t, 25.6)}>
        network 가 배운 속도로 따라간 경로 (파란 선)
      </text>
      <line x1={X3(0)} y1={Y3(-2.4)} x2={X3(0)} y2={Y3(2.4)} stroke={C.cardEdge} strokeWidth={2} />
      <line x1={X3(0)} y1={Y3(-2.4) + 12} x2={X3(1)} y2={Y3(-2.4) + 12} stroke={C.cardEdge} strokeWidth={2} />
      {[0, 0.5, 1].map((s) => (
        <text key={s} x={X3(s)} y={Y3(-2.4) + 42} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
          {s}
        </text>
      ))}
      <text x={X3(1) + 20} y={Y3(-2.4) + 42} fill={C.muted} fontSize={20} fontFamily={MONO}>
        t
      </text>
      <g opacity={grey * prog(t, 0.6, 1)}>
        {PAIRS.map(([e, d], i) => (
          <line key={i} x1={X3(0)} y1={Y3(e)} x2={X3(1)} y2={Y3(d)} stroke={C.muted} strokeWidth={2} />
        ))}
      </g>
      <g opacity={prog(t, 0.6)}>
        <circle cx={X3(1)} cy={Y3(2)} r={9} fill={C.green} />
        <circle cx={X3(1)} cy={Y3(-2)} r={9} fill={C.green} />
        <text x={X3(1) + 18} y={Y3(2) + 8} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          +2
        </text>
        <text x={X3(1) + 18} y={Y3(-2) + 8} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          −2
        </text>
      </g>
      <g opacity={pair}>
        <line x1={X3(0)} y1={Y3(-2)} x2={X3(1)} y2={Y3(2)} stroke={C.accent} strokeWidth={4} />
        <line x1={X3(0)} y1={Y3(2)} x2={X3(1)} y2={Y3(-2)} stroke={C.pink} strokeWidth={4} />
        <circle cx={X3(0.5)} cy={Y3(0)} r={9} fill={C.text} />
      </g>
      <g opacity={labels}>
        <line x1={X3(0.5)} y1={Y3(2.3)} x2={X3(0.5)} y2={Y3(0) - 16} stroke={C.text} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
        <text x={X3(0.5) + 12} y={Y3(2.3) + 8} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
          t 0.5 · x 0
        </text>
        <text x={630} y={320} fill={C.accent} fontSize={22} fontWeight={600}>
          쌍 A · 속도 +4
        </text>
        <text x={630} y={490} fill={C.pink} fontSize={22} fontWeight={600}>
          쌍 B · 속도 −4
        </text>
      </g>
      <g opacity={prog(t, 25.6, 1)}>
        {LEARNED.map((p, i) => (
          <polyline key={i} points={pts(p)} fill="none" stroke={C.blue} strokeWidth={3} />
        ))}
      </g>
    </svg>
  )
}

function Crossing() {
  const t = useSec()
  const best = [undefined, undefined, C.green, undefined]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <CrossPlot t={t} />
      </Card>
      <Box x={956} y={140} w={900} h={230} at={6.5} title={<Head>엇갈리는 두 쌍</Head>}>
        <span style={{ ...mono(C.accent, 24), opacity: prog(t, 6.8) }}>쌍 A  noise −2 → 데이터 +2 · 속도 2 − (−2) = 4</span>
        <span style={{ ...mono(C.pink, 24), opacity: prog(t, 8.4) }}>쌍 B  noise 2 → 데이터 −2 · 속도 −2 − 2 = −4</span>
        <span style={{ ...line(), opacity: prog(t, 10) }}>t = 0.5 에서 둘 다 x = 0 을 지난다</span>
      </Box>
      <Box x={956} y={390} w={900} h={280} at={13}>
        <Table
          head={['출력 c', '쌍 A (4 − c)²', '쌍 B (−4 − c)²', '평균']}
          widths={[150, 240, 260, 150]}
          at={13.2}
          step={0.6}
          rows={[
            ['4', '0', '64', '32'],
            ['2', '4', '36', '20'],
            ['0', '16', '16', '16'],
            ['−2', '36', '4', '20'],
          ]}
          colors={best}
        />
        <span style={{ ...line(C.green), opacity: prog(t, 16.5) }}>평균 loss 가 가장 작은 출력은 두 정답의 평균 0 · 그때도 loss 는 16</span>
      </Box>
      <Box x={956} y={690} w={900} h={190} at={19.5} color={`${C.accent}88`} title={<Head color={C.accent}>marginal velocity field</Head>}>
        <span style={{ ...line(), opacity: prog(t, 19.8) }}>network 가 배우는 속도 = 그 자리를 지나는 쌍들의 target velocity 를 가능성으로 무게를 두어 평균한 값</span>
      </Box>
    </AbsoluteFill>
  )
}

/** one step count: flow matching's bar over DDPM's bar */
function DualBar({ n, fm, dd, ddText, at, ddAt }: { n: number; fm: number; dd: number; ddText?: string; at: number; ddAt: number }) {
  const t = useSec()
  const W2 = 520
  const bar = (v: number, color: string, from: number, text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, from - 0.2, 0.3) }}>
      <div style={{ width: W2, height: 22, borderRadius: 6, background: C.grid }}>
        <div style={{ width: `${v * prog(t, from, 0.9)}%`, minWidth: 4, height: '100%', borderRadius: 6, background: color }} />
      </div>
      <span style={{ ...mono(color, 22), opacity: prog(t, from + 0.5) }}>{text}</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ width: 110, fontSize: 24, color: C.muted, textAlign: 'right', whiteSpace: 'nowrap', opacity: prog(t, at - 0.2, 0.3) }}>{n} step</span>
      <div style={{ display: 'grid', gap: 6 }}>
        {bar(fm, C.accent, at, `${fm}%`)}
        {bar(dd, C.orange, ddAt, ddText ?? `${dd}%`)}
      </div>
    </div>
  )
}

function StepsQuality() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={170} at={0.3} title={<Head color={C.accent}>마지막 step 은 남은 시간 1 − t 를 한 번에 간다</Head>}>
        <span style={{ ...line(), opacity: prog(t, 1.5) }}>결과 = 그 step 을 시작하는 자리에서 추정한 데이터의 평균</span>
      </Box>
      <Box x={64} y={330} w={880} h={270} at={6.5} title={<Head color={C.red}>1 step = 데이터의 평균</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 6.8) }}>t = 0 의 평균 0.5 × 2 + 0.5 × (−2) = 0</span>
        <span style={{ ...line(), opacity: prog(t, 8.6) }}>출발점과 상관없이 sample 이 모두 0 · 데이터 어디에도 없는 값</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.4) }}>로봇이라면: 상자를 왼쪽 · 오른쪽으로 비켜 간 시연이 반반일 때, 1 step action 은 두 길의 평균인 상자 정면으로 향한다</span>
      </Box>
      <Box x={64} y={620} w={880} h={260} at={13} title={<Head color={C.green}>noise 0.5 에서 출발한 sample (실제 경로는 +2)</Head>}>
        <Table head={['step 수', '1', '2', '4', '10']} widths={[200, 140, 140, 140, 140]} at={13.3} size={24} rows={[['sample', '0', '1.52', '2.00', '2.00']]} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.5) }}>n = 2 의 마지막 step 은 t = 0.5 에서 시작 → 아직 +2 쪽으로 다 기울지 않은 1.52 가 그대로 sample</span>
      </Box>
      <Card x={976} y={140} w={880} h={450} at={19}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <Head size={24}>봉우리 ±2 에서 0.3 넘게 벗어난 sample 비율</Head>
            <Label size={21} color={C.dim}>
              noise 20000 개 · 두 방법 모두 network 대신 정확한 답을 쓴 계산
            </Label>
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 22, fontWeight: 600 }}>
            <span style={{ color: C.accent, opacity: prog(t, 19.3) }}>■ flow matching (Euler)</span>
            <span style={{ color: C.orange, opacity: prog(t, 25.2) }}>■ DDPM (step 을 건너뛴 reverse)</span>
          </div>
          <DualBar n={1} fm={100} dd={100} at={19.6} ddAt={25.4} />
          <DualBar n={2} fm={47} dd={97} at={20.4} ddAt={25.8} />
          <DualBar n={4} fm={1} dd={29} at={21.2} ddAt={26.2} />
          <DualBar n={10} fm={0} dd={0.2} ddText="약 0.2%" at={22} ddAt={26.6} />
        </div>
      </Card>
      <Box x={976} y={610} w={880} h={270} at={25} gap={10} title={<Head>이미지에서도 같은 경향 (Lipman 등)</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.3) }}>CIFAR-10 · 같은 U-Net · network 를 쓴 평균 횟수</span>
        <Bar label="DDPM loss" value={274} max={274} color={C.orange} at={25.8} width={380} unit=" 번" labelW={250} />
        <Bar label="flow matching (OT)" value={142} max={274} color={C.accent} at={26.4} width={380} unit=" 번" labelW={250} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.4) }}>ImageNet 32×32: 같은 오차에 diffusion 경로 모델의 약 60% 만 사용</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseMean = () => (
  <PauseWrite
    question="같은 자리를 지나는 쌍이 셋이고 target velocity 가 4, 4, −4 다. 세 쌍이 같은 가능성으로 나온다면 network 는 어떤 값을 배울까?"
    answer={
      <>
        loss 를 가장 작게 하는 출력 = 세 정답의 평균
        <br />
        (4 + 4 − 4) ÷ 3 = 4 ÷ 3 ≈ 1.33 → +2 쪽으로 기운다
      </>
    }
  />
)

// ---------- 4. π0 and GR00T N1 ----------

function Pi0() {
  const t = useSec()
  const nodes: [string, string, string, number][] = [
    ['카메라 이미지 · 지시문', '관측', C.muted, 0.4],
    ['VLM · PaliGemma', 'weight 30 억 개', C.purple, 0.9],
    ['action expert', 'weight 3 억 개', C.orange, 1.6],
    ['action chunk', '앞으로 50 step', C.green, 2.3],
  ]
  const NX = (i: number) => 126 + i * 400
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={300} at={0.3}>
        {nodes.map(([a, b, color, at], i) => (
          <div key={a} style={{ position: 'absolute', left: NX(i), top: 40, width: 340, height: 120, borderRadius: 18, border: `2px solid ${color}`, background: `${color}14`, display: 'grid', placeItems: 'center', opacity: prog(t, at) }}>
            <span style={{ textAlign: 'center', lineHeight: 1.4 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: C.text }}>{a}</span>
              <br />
              <span style={{ fontSize: 21, color: C.muted }}>{b}</span>
            </span>
          </div>
        ))}
        <svg width={1792} height={300} style={{ position: 'absolute', left: 0, top: 0 }}>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={prog(t, nodes[i + 1][3])}>{arrow(NX(i) + 348, 100, NX(i + 1) - 8, 100, C.muted, 3)}</g>
          ))}
          <g opacity={prog(t, 19.8)}>
            <path d={`M ${NX(2) + 300} 160 C ${NX(2) + 300} 215, ${NX(2) + 40} 215, ${NX(2) + 40} 168`} fill="none" stroke={C.orange} strokeWidth={3} />
            <polygon points={`${NX(2) + 40},160 ${NX(2) + 33},174 ${NX(2) + 47},174`} fill={C.orange} />
            <text x={NX(2) + 170} y={250} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              step 마다 다시 계산 · 10 번
            </text>
            <text x={NX(1) + 170} y={205} textAnchor="middle" fill={C.purple} fontSize={22} fontWeight={600}>
              chunk 하나에 한 번
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={460} w={880} h={220} at={6.5} title={<Head color={C.green}>action chunk · H = 50</Head>}>
        <svg width={824} height={60} style={{ opacity: prog(t, 6.8) }}>
          {Array.from({ length: 50 }, (_, i) => (
            <rect key={i} x={i * 16.4} y={0} width={13} height={26} rx={3} fill={i < 25 ? C.green : C.cardEdge} opacity={i < 25 ? 0.35 + 0.65 * prog(t, 8.5 + i * 0.04, 0.3) : 1} />
          ))}
          <text x={205} y={54} textAnchor="middle" fill={C.green} fontSize={21} fontWeight={600} opacity={prog(t, 9.6)}>
            실행 25 개 = 0.5 초
          </text>
          <text x={615} y={54} textAnchor="middle" fill={C.muted} fontSize={21} opacity={prog(t, 10.4)}>
            그다음 새 chunk 를 만든다
          </text>
        </svg>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>1 초에 명령을 50 번 보내는 로봇이면 1 초 분량</span>
      </Box>
      <Box x={976} y={460} w={880} h={220} at={13} title={<Head color={C.accent}>π0 의 표기 · τ = 0 이 noise</Head>}>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 13.4) }}>
          A<sup>τ</sup> = τ·A + (1 − τ)·ε
        </span>
        <span style={{ ...line(), opacity: prog(t, 15.4) }}>
          Euler: 한 step 길이 <span style={mono(C.accent, 23)}>δ = 0.1</span> 로 10 번 · 정답 속도 <span style={mono(C.green, 23)}>A − ε</span>
        </span>
      </Box>
      <Box x={64} y={698} w={1792} h={182} at={25.5} gap={10} title={<Head>RTX 4090 · 카메라 3 대 · 추론 시간 (논문)</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 1400, height: 44, borderRadius: 10, overflow: 'hidden', background: C.grid }}>
            {(
              [
                [14, 'encoder 14 ms', C.blue, 25.8],
                [32, 'VLM 관측 읽기 32 ms', C.purple, 26.3],
                [27, 'action expert 10 번 27 ms', C.green, 26.8],
              ] as [number, string, string, number][]
            ).map(([ms, s, color, at]) => (
              <div key={s} style={{ width: (1400 * ms) / 73, height: '100%', background: `${color}cc`, display: 'grid', placeItems: 'center', opacity: prog(t, at), borderRight: `2px solid ${C.card}` }}>
                <span style={{ fontSize: 21, fontWeight: 600, color: C.bg, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
            ))}
          </div>
          <span style={{ ...mono(C.text, 26), opacity: prog(t, 27.3) }}>= 73 ms</span>
        </div>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 27.8) }}>
          flow matching 한 step 은 약 <span style={mono(C.green, 23)}>27 ÷ 10 = 2.7 ms</span> · 실행하는 action 25 개가 0.5 초 분량이라 그 안에 넉넉히 끝난다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Groot() {
  const t = useSec()
  const code = (label: string, src: string, at: number) => (
    <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at) }}>
      <span style={{ width: 110, fontSize: 22, color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={mono(C.orange, 22)}>{src}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={260} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>action chunk 하나를 만들 때 network 를 쓰는 횟수</Head>
          <Bar label="Diffusion Policy (DDIM)" value={10} max={10} color={C.red} at={0.6} width={600} unit=" 번" sub="학습 100 단계 · DDIM 10 단계 · RTX 3080 에서 0.1 초" labelW={320} />
          <Bar label="π0" value={10} max={10} color={C.accent} at={1.4} width={600} unit=" 번" sub="action 50 개 · RTX 4090 에서 73 ms" labelW={320} />
          <Bar label="GR00T N1" value={4} max={10} color={C.green} at={2.4} width={600} unit=" 번" sub="action 16 개 · L40 에서 63.9 ms" labelW={320} />
        </div>
      </Card>
      <div style={{ position: 'absolute', left: 64, top: 420, width: 880 }}>
        <Misconception at={6.8} belief="GR00T N1 논문의 식 (1) 대로 정답 속도는 ε − A 다" fact="τ = 0 의 noise 에서 출발해 속도를 더해 가는 Euler 식에 맞는 정답은 A − ε 이다" />
      </div>
      <Box x={976} y={420} w={880} h={280} at={13.5} title={<Head color={C.orange}>openpi 코드 · time = 1 이 noise</Head>}>
        {code('섞는 식', 'time * noise + (1 - time) * actions', 13.8)}
        {code('정답 속도', 'noise - actions', 15)}
        {code('sampling', 'time 1 → 0, dt = -1/num_steps', 16.2)}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.6) }}>시각의 방향과 부호가 함께 뒤집혀 논문의 식과 같은 경로를 따라간다</span>
      </Box>
      <Box x={976} y={720} w={880} h={160} at={20.5} color={`${C.accent}88`} title={<Head color={C.accent}>step 수를 정하는 조건</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 20.8) }}>실행 중인 chunk 가 끝나기 전에 다음 chunk 가 나와야 로봇이 멈추지 않는다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseSign = () => (
  <PauseWrite
    question="시연 값 A = 0.5, noise ε = 1.5 다. 정답 속도를 A − ε 으로 학습한 network 와 ε − A 로 학습한 network 로 Euler 4 step 을 밟으면?"
    answer={
      <>
        A − ε = −1 → step 마다 −0.25 → 1.5 + 4 × (−0.25) = 0.5 (시연 값)
        <br />
        ε − A = 1 → step 마다 0.25 → 1.5 + 4 × 0.25 = 2.5 (시연에서 멀어짐)
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '(1 − t)·ε + t·x₁ 위의 속도 x₁ − ε 를 맞힌다 · ε = −1, x₁ = 2 이면 3', at: 0.5 },
    { tag: script.sections[1], color: C.orange, text: 'x + Δt × v 를 n 번 · 직선이면 1 step 도 정확 · v = 2t 이면 오차 1 ÷ n', at: 4.4 },
    { tag: script.sections[2], color: C.red, text: '1 step 은 평균 0 · 4 step 에서 벗어난 sample 1% 대 DDPM 29%', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'π0 50 개 · 10 step · 73 ms / GR00T N1 16 개 · 4 step · 63.9 ms / 정답 A − ε', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            처음부터 몇 step 만에 noise 에서 행동까지 가도록 학습할 수 있을까?
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
            NEXT · VLA
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>π0</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            이미지와 지시문을 VLM 으로 읽어 조건으로 넣고, 그 계산을 10 step 동안 다시 쓰며 실시간으로 실행하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/flow-matching (Lipman 등 · Liu 등 · Albergo 와 Vanden-Eijnden · π0 · GR00T N1 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function FlowMatching() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        line: LineScene,
        'cfm-loss': CfmLoss,
        'pause-target': PauseTarget,
        euler: EulerScene,
        cost: Cost,
        'pause-euler': PauseEuler,
        crossing: Crossing,
        'steps-quality': StepsQuality,
        'pause-mean': PauseMean,
        pi0: Pi0,
        groot: Groot,
        'pause-sign': PauseSign,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
