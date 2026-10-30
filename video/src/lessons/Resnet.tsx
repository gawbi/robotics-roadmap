import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './resnet.narration.json'
import { script } from './resnet.script'

// Numbers follow lessons/resnet/README.md (see resnet.script.ts). Block and shape drawings are schematic (marked 모식도);
// every number on screen is the lesson's or shows its arithmetic from the lesson's numbers.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
        {children}
      </span>
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
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <>
          <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + steps.length * gap - 0.25) }}>→</span>
          <span style={{ fontSize: 26, fontWeight: 700, color, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>{last}</span>
        </>
      )}
    </div>
  )
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** one line of a box that fades in at `at` */
function L({ at, children, color = C.text, size = 24 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
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

/** a simple text table: first column sans, the rest mono; `colAt` reveals a column later than its row */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors, colAt }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; colAt?: (number | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10, opacity: colAt?.[i] === undefined ? 1 : prog(t, colAt[i]!) })
  return (
    <div style={{ display: 'grid', gap: 8 }}>
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            VISION · RESNET
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ResNet</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 40, color: C.muted }}>
            y = <span style={{ color: C.accent }}>F(x)</span> + <span style={{ color: C.green }}>x</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            층 두세 개마다 입력을 출력에 그대로 더하는 residual connection
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
      <Box x={64} y={140} w={900} h={330} at={0.4} title={<Head>ImageNet 검증 사진의 top-1 error</Head>}>
        <Bar label="plain 18 층" value={27.94} max={30} color={C.blue} at={0.8} width={380} labelW={170} fmt="27.94%" />
        <Bar label="plain 34 층" value={28.54} max={30} color={C.red} at={1.4} width={380} labelW={170} fmt="28.54%" />
        <L at={2.2} color={C.muted} size={22}>
          top-1 error: 모델이 가장 높은 점수를 준 class 가 정답과 다른 사진의 비율
        </L>
      </Box>
      <Box x={996} y={140} w={860} h={330} at={1.6} title={<Head color={C.red}>학습에 쓴 사진에서도</Head>}>
        <L at={2}>34 층의 training error 가 학습하는 내내 18 층보다 높았다</L>
        <L at={2.8}>CIFAR-10 에서도 56 층 plain 망이 20 층보다 높았다</L>
        <L at={3.4} color={C.muted} size={22}>
          plain network: conv 층을 차례로 쌓기만 한 망 (He 등, 2015)
        </L>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 540, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          층을 늘렸는데 <span style={{ color: C.accent }}>왜 학습 사진조차 덜 맞힐까?</span>
        </div>
      </Appear>
      <Appear at={5.6} style={{ position: 'absolute', left: 64, top: 690, width: 1792, display: 'flex', justifyContent: 'center' }}>
        <Label color={C.muted} size={30}>
          LeRobot 의 ACT 와 Diffusion Policy 도 기본 설정에서 ResNet-18 로 카메라 사진을 읽는다
        </Label>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- residual block ----------

/** 20 trained layers followed by 36 identity layers: a 56-layer net that answers like the 20-layer one */
function DeepIdentity({ t, at }: { t: number; at: number }) {
  const bw = 11
  const gx = 13
  const x0 = 30
  const split = x0 + 20 * gx
  return (
    <svg width={820} height={250}>
      <g opacity={prog(t, at)}>
        <text x={x0} y={34} fill={C.blue} fontSize={22} fontWeight={600}>
          학습한 20 층
        </text>
        <text x={split + 20} y={34} fill={C.dim} fontSize={22} fontWeight={600}>
          identity 층 36 개 (입력을 그대로 내보냄)
        </text>
        {Array.from({ length: 56 }, (_, i) => (
          <rect key={i} x={x0 + i * gx + (i >= 20 ? 10 : 0)} y={56} width={bw} height={90} rx={3} fill={i < 20 ? C.blue : C.cardEdge} opacity={i < 20 ? 0.9 : prog(t, at + 0.3 + (i - 20) * 0.02)} />
        ))}
      </g>
      <g opacity={prog(t, at + 1)}>
        <text x={x0} y={190} fill={C.text} fontSize={24} fontWeight={600}>
          20 + 36 = 56 층 망 → 20 층 망과 똑같은 답, 똑같은 error
        </text>
        <text x={x0} y={230} fill={C.red} fontSize={22}>
          그런데 gradient descent 는 56 층 plain 망에서 이 상태도 찾지 못했다
        </text>
      </g>
    </svg>
  )
}

function Degradation() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={350} at={0.3} title={<Head>plain network 의 top-1 error (ImageNet 검증)</Head>}>
        <Table head={['망', '층 수', 'top-1 error']} widths={[240, 200, 260]} rows={[['plain', '18', '27.94%'], ['plain', '34', '28.54%']]} colors={[C.blue, C.red]} at={0.5} />
        <L at={6.5}>training error 도 학습 내내 34 층 &gt; 18 층</L>
        <L at={8.5} color={C.muted} size={22}>
          CIFAR-10 (32×32 사진 10 class): 56 층 plain &gt; 20 층 plain
        </L>
      </Box>
      <Appear at={18.3} style={{ position: 'absolute', left: 64, top: 510, width: 880, height: 370 }}>
        <Panel x={0} y={0} w={880} h={370}>
          <div style={{ position: 'absolute', left: 28, top: 22 }}>
            <Head>깊은 망이 나빠질 이유는 없다</Head>
          </div>
          <div style={{ position: 'absolute', left: 20, top: 80 }}>
            <DeepIdentity t={t} at={18.6} />
          </div>
          <span style={{ position: 'absolute', right: 28, top: 28, fontSize: 20, color: C.dim }}>모식도</span>
        </Panel>
      </Appear>
      <Appear at={12.3} style={{ position: 'absolute', left: 976, top: 130, width: 880 }}>
        <Misconception at={12.5} belief="parameter 가 많아져 학습 데이터를 외우는 overfitting 이 생겼다" fact="overfitting 이면 training error 가 낮다. degradation 은 training error 자체가 높아서 덜 배운 것이다" />
      </Appear>
      <Box x={976} y={580} w={880} h={300} at={24.3} color={`${C.orange}88`} title={<Head color={C.orange}>vanishing gradient 와 다른 문제</Head>}>
        <L at={24.6}>He 초기화 (weight 크기 √(2 ÷ 입력 개수)) 와 BatchNorm 으로 층마다 곱하는 수를 1 근처에</L>
        <L at={25.8}>논문: plain 망의 backward gradient 크기는 정상이었다</L>
        <L at={27} color={C.orange}>
          학습을 3 배 더 오래 해도 degradation 이 남았다
        </L>
      </Box>
    </AbsoluteFill>
  )
}

function ResidualDiagram({ t }: { t: number }) {
  return (
    <svg width={900} height={360}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
        residual block
      </text>
      <g opacity={prog(t, 0.5)}>
        <rect x={50} y={170} width={130} height={60} rx={12} fill={`${C.green}18`} stroke={C.green} strokeWidth={2} />
        <text x={115} y={209} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          x = 2
        </text>
        {arrow(180, 200, 248, 200, C.muted)}
        <rect x={250} y={160} width={280} height={80} rx={12} fill={`${C.accent}12`} stroke={C.accent} strokeWidth={2} />
        <text x={390} y={193} textAnchor="middle" fill={C.text} fontSize={22}>
          F: block 안의 층들
        </text>
        <text x={390} y={225} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          F(x) = 0.3
        </text>
        {arrow(530, 200, 600, 200, C.muted)}
        <circle cx={630} cy={200} r={28} fill={C.card} stroke={C.text} strokeWidth={2.5} />
        <text x={630} y={211} textAnchor="middle" fill={C.text} fontSize={32} fontWeight={700}>
          +
        </text>
        {arrow(658, 200, 718, 200, C.muted)}
        <rect x={720} y={170} width={150} height={60} rx={12} fill={`${C.orange}18`} stroke={C.orange} strokeWidth={2} />
        <text x={795} y={209} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          y = 2.3
        </text>
      </g>
      <g opacity={prog(t, 1.2)}>
        <path d="M 115 170 L 115 100 L 630 100 L 630 160" fill="none" stroke={C.green} strokeWidth={3} />
        {arrow(630, 150, 630, 171, C.green)}
        <text x={300} y={84} fill={C.green} fontSize={22} fontWeight={600}>
          shortcut: x 를 그대로 덧셈으로
        </text>
      </g>
      <g opacity={prog(t, 2)}>
        <text x={50} y={292} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
          y = F(x) + x = 0.3 + 2 = 2.3
        </text>
        <text x={50} y={332} fill={C.muted} fontSize={22}>
          같은 층을 plain 망처럼 쓰면 y = F(x) = 0.3 뿐
        </text>
      </g>
    </svg>
  )
}

function Residual() {
  const t = useSec()
  const c3 = 19.4
  const g = (s: ReactNode, color: string, at?: number) => <span style={{ ...mono(color, 24), opacity: at === undefined ? 1 : prog(t, at) }}>{s}</span>
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={900} h={360}>
        <ResidualDiagram t={t} />
      </Panel>
      <Box x={996} y={130} w={860} h={360} at={6.6} title={<Head>identity 까지의 거리 (처음 w = 0.05)</Head>}>
        <L at={6.9}>F(x) = wx 로 두면 identity 가 되는 w 는 plain 1, residual 0</L>
        <Bar label="plain" value={0.95} max={1} color={C.red} at={7.6} width={440} labelW={140} fmt="0.95" />
        <Bar label="residual" value={0.05} max={1} color={C.green} at={8.6} width={440} labelW={140} fmt="0.05" />
        <L at={9.8} color={C.muted} size={22}>
          residual block 은 weight 를 0 쪽으로 보내기만 하면 입력을 그대로 전한다
        </L>
      </Box>
      <Box x={64} y={520} w={900} h={360} at={12.9} title={<Head color={C.accent}>x 쪽으로 전하는 gradient 비율 (w = 0.1)</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 260px 300px', rowGap: 12, fontSize: 24 }}>
          <span style={{ color: C.muted, fontSize: 22 }}>block</span>
          <span style={{ color: C.muted, fontSize: 22, textAlign: 'right' }}>block 하나</span>
          <span style={{ color: C.muted, fontSize: 22, textAlign: 'right', opacity: prog(t, c3) }}>block 20 개</span>
          <span style={{ color: C.red }}>plain</span>
          <span style={{ textAlign: 'right' }}>{g('0.1', C.red)}</span>
          <span style={{ textAlign: 'right' }}>
            {g(
              <>
                10<sup style={{ fontSize: 16 }}>−20</sup>
              </>,
              C.red,
              c3,
            )}
          </span>
          <span style={{ color: C.green }}>residual</span>
          <span style={{ textAlign: 'right' }}>{g('1 + 0.1 = 1.1', C.green)}</span>
          <span style={{ textAlign: 'right' }}>{g('1.1²⁰ ≈ 6.73', C.green, c3)}</span>
          <span style={{ color: C.green, opacity: prog(t, c3 + 0.8) }}>residual (w = −0.1)</span>
          <span style={{ textAlign: 'right', opacity: prog(t, c3 + 0.8) }}>{g('1 − 0.1 = 0.9', C.green)}</span>
          <span style={{ textAlign: 'right' }}>{g('0.9²⁰ ≈ 0.12', C.green, c3 + 0.8)}</span>
        </div>
        <L at={14.5} color={C.muted} size={22}>
          shortcut 길은 덧셈뿐이라 비율 1 · ∂y/∂x = 1 + ∂F/∂x
        </L>
      </Box>
      <Box x={996} y={520} w={860} h={360} at={25.5} title={<Head>ImageNet 검증 top-1 error</Head>}>
        <Bar label="plain 18 층" value={27.94} max={30} color={C.blue} at={25.8} width={360} labelW={180} fmt="27.94%" />
        <Bar label="plain 34 층" value={28.54} max={30} color={C.red} at={26.2} width={360} labelW={180} fmt="28.54%" />
        <Bar label="ResNet 18 층" value={27.88} max={30} color={C.blue} at={26.6} width={360} labelW={180} fmt="27.88%" />
        <Bar label="ResNet 34 층" value={25.03} max={30} color={C.green} at={27} width={360} labelW={180} fmt="25.03%" />
        <L at={28}>
          18 → 34 층: plain <span style={mono(C.red)}>+0.60%p</span> · ResNet <span style={mono(C.green)}>−2.85%p</span>
        </L>
      </Box>
    </AbsoluteFill>
  )
}

const PausePaths = () => (
  <PauseWrite
    question="block 3 개의 weight 가 모두 0.5 다. plain 망과 residual 망에서 입력까지 전해지는 gradient 비율은 각각?"
    answer={
      <>
        plain: 0.5 × 0.5 × 0.5 = 0.125
        <br />
        residual: (1 + 0.5) × (1 + 0.5) × (1 + 0.5) = 1.5 × 1.5 × 1.5 = 3.375
      </>
    }
  />
)

// ---------- BatchNorm ----------

function NormLine({ t, at }: { t: number; at: number }) {
  const vals: [number, string][] = [
    [-1.069, '−1.069'],
    [-0.535, '−0.535'],
    [0, '0'],
    [1.604, '1.604'],
  ]
  const X = (v: number) => 520 + v * 210
  return (
    <svg width={1040} height={130}>
      <g opacity={prog(t, at)}>
        <line x1={X(-2)} y1={60} x2={X(2)} y2={60} stroke={C.muted} strokeWidth={2} />
        {[-2, -1, 0, 1, 2].map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={54} x2={X(v)} y2={66} stroke={C.muted} strokeWidth={2} />
            <text x={X(v)} y={92} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          </g>
        ))}
        {vals.map(([v, s], i) => (
          <g key={s} opacity={prog(t, at + 0.3 + i * 0.25)}>
            <circle cx={X(v)} cy={60} r={9} fill={C.accent} />
            <text x={X(v)} y={i % 2 === 0 ? 34 : 124} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              {s}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function BnCalc() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1100} h={500} at={0.3} title={<Head>정규화: 평균을 빼고 표준편차로 나눈다</Head>}>
        <L at={0.6}>
          <span style={mono(C.accent)}>(x − 평균) ÷ √(분산 + ε)</span> → channel 마다 평균 0, 분산 1
        </L>
        <Table
          head={['원래 값', '평균', '표준편차', '정규화한 값']}
          widths={[250, 110, 250, 420]}
          rows={[
            ['1, 2, 3, 6', '3', '√3.5 ≈ 1.871', '−1.069, −0.535, 0, 1.604'],
            ['10, 20, 30, 60', '30', '√350 ≈ 18.71', '−1.069, −0.535, 0, 1.604'],
          ]}
          at={7}
          step={0.9}
        />
        <L at={9} color={C.muted} size={22}>
          값이 모두 10 배가 되면 평균과 표준편차도 10 배라 나눗셈에서 지워진다
        </L>
        <div style={{ marginTop: -6 }}>
          <NormLine t={t} at={9.6} />
        </div>
      </Box>
      <Box x={1196} y={130} w={660} h={500} at={14} color={`${C.purple}88`} title={<Head color={C.purple}>γ 와 β 로 다시 정하기</Head>}>
        <L at={14.3}>
          <span style={mono(C.purple)}>y = γ × (정규화한 값) + β</span>
        </L>
        <L at={15}>γ 는 퍼진 정도 · 처음 값 1</L>
        <L at={15.6}>β 는 평균 위치 · 처음 값 0</L>
        <L at={16.6} color={C.muted} size={22}>
          γ 가 원래 표준편차, β 가 원래 평균을 배우면 정규화 전 값이 돌아온다
        </L>
        <L at={18} color={C.muted} size={22}>
          BatchNorm 논문: 학습 step 을 14 배 적게 쓰고 같은 정확도
        </L>
        <L at={19.2} color={C.muted} size={22}>
          평균을 빼면 bias 도 지워져서 ResNet 의 conv 에는 bias 가 없다
        </L>
      </Box>
      <Box x={64} y={660} w={1792} h={220} at={21} title={<Head color={C.accent}>channel 마다 따로 모으는 값</Head>}>
        <L at={21.3}>
          conv 출력 <span style={mono(C.text)}>N × C × H × W</span> 에서 channel 하나의 평균 · 분산은 batch 의 모든 사진 × feature map 의 모든 칸으로 구한다
        </L>
        <L at={22.6}>
          batch 32 · channel 64 · 56×56 → <span style={mono(C.accent)}>32 × 56 × 56 = 100,352</span> 개 값 · 평균 · 분산 · γ · β 는 channel 마다 하나씩
        </L>
      </Box>
    </AbsoluteFill>
  )
}

function BnSmall() {
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={320} at={0.3} title={<Head>학습 때와 평가 때의 통계</Head>}>
        <L at={0.6}>
          <span style={mono(C.accent)}>running mean ← 0.9 × running mean + 0.1 × batch 평균</span>
        </L>
        <L at={1.6}>학습: 이번 batch 의 평균 · 분산으로 정규화</L>
        <L at={2.4}>평가: 쌓아 둔 running mean · variance 를 고정해 쓴다</L>
        <L at={3.4} color={C.muted} size={22}>
          model.eval() 을 빠뜨리면 같은 장면에서도 함께 계산한 사진에 따라 action 이 달라진다
        </L>
      </Box>
      <Box x={64} y={470} w={880} h={410} at={6.3} color={`${C.red}88`} title={<Head color={C.red}>batch 2 장이면</Head>}>
        <Table
          head={['batch 의 두 값', '평균', '분산', '정규화한 값']}
          widths={[260, 160, 140, 240]}
          rows={[
            ['1, 3', '2', '1', '−1, 1'],
            ['100, 102', '101', '1', '−1, 1'],
          ]}
          at={6.6}
          step={0.9}
        />
        <L at={8.6}>1 과 100 은 크기가 전혀 다른데 둘 다 −1 이 된다</L>
        <L at={9.6} color={C.muted} size={22}>
          batch 1 장이면 무엇을 넣어도 0 · 같은 사진도 함께 들어온 사진에 따라 정규화한 값이 바뀐다
        </L>
      </Box>
      <Box x={976} y={130} w={880} h={750} at={12.3} title={<Head>ResNet-50 ImageNet 검증 error (GroupNorm 논문)</Head>}>
        <Table
          head={['GPU 하나의 batch', '32', '16', '8', '4', '2']}
          widths={[230, 115, 115, 115, 115, 115]}
          rows={[
            ['BatchNorm', '23.6%', '23.7%', '24.8%', '27.3%', '34.7%'],
            ['GroupNorm', '24.1%', '24.2%', '24.0%', '24.2%', '24.1%'],
          ]}
          colors={[C.red, C.green]}
          at={12.6}
          step={5.7}
        />
        <div style={{ height: 6 }} />
        <Bar label="BN · batch 32" value={23.6} max={36} color={C.blue} at={13.6} width={340} labelW={210} fmt="23.6%" />
        <Bar label="BN · batch 2" value={34.7} max={36} color={C.red} at={14.4} width={340} labelW={210} fmt="34.7%" />
        <Bar label="GN · batch 2" value={24.1} max={36} color={C.green} at={19} width={340} labelW={210} fmt="24.1%" />
        <L at={19.8} color={C.muted} size={22}>
          GroupNorm: 사진 한 장 안에서 channel 몇 개씩 묶어 평균 · 분산을 구한다
        </L>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
          <Chip at={24.5} color={C.orange} mono>
            ACT 논문 batch 8
          </Chip>
          <Chip at={25} color={C.orange} mono>
            LeRobot 기본 batch 8
          </Chip>
        </div>
        <L at={26} color={C.text}>
          → 로봇 policy 는 FrozenBatchNorm 이나 GroupNorm 을 쓰기도 한다
        </L>
      </Box>
    </AbsoluteFill>
  )
}

const PauseRunning = () => (
  <PauseWrite
    question="running mean 2, 이번 batch 평균 12 일 때 0.9 × running mean + 0.1 × batch 평균 으로 고친 새 값은?"
    answer="0.9 × 2 + 0.1 × 12 = 1.8 + 1.2 = 3"
  />
)

// ---------- blocks and the network ----------

function BasicBlockDiagram({ t }: { t: number }) {
  const bx = 40
  const bw = 480
  const cx = bx + bw / 2
  const box = (y: number, label: string, color: string, at: number, monoFont = false) => (
    <g opacity={prog(t, at)}>
      <rect x={bx} y={y} width={bw} height={56} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={cx} y={y + 36} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600} fontFamily={monoFont ? MONO : undefined}>
        {label}
      </text>
    </g>
  )
  const down = (y1: number, y2: number, at: number) => <g opacity={prog(t, at)}>{arrow(cx, y1, cx, y2, C.muted)}</g>
  return (
    <svg width={860} height={640}>
      {box(30, '입력 x · 64×56×56', C.green, 0.5)}
      {down(86, 128, 0.8)}
      {box(130, '3×3 conv, stride 2 · BN · ReLU', C.accent, 1)}
      {down(186, 228, 1.3)}
      {box(230, '3×3 conv · BN → F(x) 128×28×28', C.accent, 1.6)}
      {down(286, 340, 1.9)}
      <g opacity={prog(t, 2.2)}>
        <circle cx={cx} cy={370} r={28} fill={C.card} stroke={C.text} strokeWidth={2.5} />
        <text x={cx} y={381} textAnchor="middle" fill={C.text} fontSize={32} fontWeight={700}>
          +
        </text>
      </g>
      {down(398, 448, 2.5)}
      {box(450, 'ReLU', C.accent, 2.7)}
      {down(506, 548, 3)}
      {box(550, '출력 y · 128×28×28', C.orange, 3.2)}
      <g opacity={prog(t, 2.2)}>
        <path d={`M ${bx + bw} 58 L 680 58 L 680 370 L ${cx + 40} 370`} fill="none" stroke={C.green} strokeWidth={3} />
        {arrow(cx + 60, 370, cx + 29, 370, C.green)}
        <text x={700} y={344} fill={C.green} fontSize={22} fontWeight={600}>
          shortcut
        </text>
      </g>
      <g opacity={prog(t, 7.4)}>
        <rect x={570} y={180} width={220} height={78} rx={12} fill={C.card} stroke={C.green} strokeWidth={2} />
        <text x={680} y={212} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
          1×1 conv · BN
        </text>
        <text x={680} y={242} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
          stride 2
        </text>
      </g>
    </svg>
  )
}

function Blocks() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Appear at={0.3} style={{ position: 'absolute', left: 64, top: 130, width: 900, height: 750 }}>
        <Panel x={0} y={0} w={900} h={750}>
          <div style={{ position: 'absolute', left: 28, top: 22 }}>
            <Head>BasicBlock · ResNet-18 · 34 (layer2 의 첫 block)</Head>
          </div>
          <div style={{ position: 'absolute', left: 10, top: 76 }}>
            <BasicBlockDiagram t={t} />
          </div>
          <span style={{ position: 'absolute', right: 28, top: 28, fontSize: 20, color: C.dim }}>모식도</span>
        </Panel>
      </Appear>
      <Box x={996} y={130} w={860} h={250} at={7} color={`${C.green}88`} title={<Head color={C.green}>stage 첫 block: stride 2 · filter 두 배</Head>}>
        <L at={7.3}>
          가로세로 반, channel 두 배 → <span style={mono(C.text)}>64×56×56 → 128×28×28</span>
        </L>
        <L at={8.6}>모양이 달라 x 를 그대로 더할 수 없어 shortcut 에 1×1 conv · BN</L>
        <L at={10} color={C.muted} size={22}>
          1×1 conv 의 weight: 128 × 64 = 8,192 개
        </L>
      </Box>
      <Box x={996} y={410} w={860} h={470} at={14} color={`${C.purple}88`} title={<Head color={C.purple}>bottleneck block · ResNet-50 부터</Head>}>
        <Flow steps={['1×1 · 256 → 64', '3×3 · 64 → 64', '1×1 · 64 → 256']} color={C.purple} at={14.3} />
        <L at={16} color={C.muted} size={22}>
          channel 을 1/4 로 줄인 가운데가 병의 목 (bottleneck)
        </L>
        <Bar label="BasicBlock 64" value={73728} max={1179648} color={C.blue} at={21.2} width={300} labelW={250} fmt="73,728" />
        <Bar label="bottleneck 256" value={69632} max={1179648} color={C.purple} at={21.8} width={300} labelW={250} fmt="69,632" />
        <Bar label="3×3 두 개 · 256" value={1179648} max={1179648} color={C.red} at={22.6} width={300} labelW={250} fmt="1,179,648" />
        <L at={23.6} color={C.muted} size={22}>
          256 × 64 + 64 × 64 × 9 + 64 × 256 = 69,632 · 3×3 두 개는 17 배쯤 많다
        </L>
      </Box>
    </AbsoluteFill>
  )
}

function ShapeCard({ name, shape, side, at, color, note }: { name: string; shape: string; side: number; at: number; color: string; note?: string }) {
  const t = useSec()
  return (
    <div style={{ width: 178, display: 'grid', justifyItems: 'center', gap: 8, opacity: prog(t, at) }}>
      <div style={{ height: 116, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: side, height: side, borderRadius: 6, background: `${color}33`, border: `2px solid ${color}` }} />
      </div>
      <span style={{ fontSize: 22, fontWeight: 600, color, whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ ...mono(C.text, 22) }}>{shape}</span>
      {note && <span style={{ fontSize: 20, color: C.muted, whiteSpace: 'nowrap' }}>{note}</span>}
    </div>
  )
}

function ResNet18() {
  const t = useSec()
  const cards: { name: string; shape: string; s: number; at: number; color: string; note?: string }[] = [
    { name: '사진', shape: '3×224×224', s: 224, at: 0.5, color: C.muted },
    { name: 'stem conv', shape: '64×112×112', s: 112, at: 1.2, color: C.blue, note: '7×7 · stride 2' },
    { name: 'max pooling', shape: '64×56×56', s: 56, at: 1.9, color: C.blue, note: '3×3 · stride 2' },
    { name: 'layer1', shape: '64×56×56', s: 56, at: 6.6, color: C.accent, note: 'BasicBlock ×2' },
    { name: 'layer2', shape: '128×28×28', s: 28, at: 7.3, color: C.accent, note: 'BasicBlock ×2' },
    { name: 'layer3', shape: '256×14×14', s: 14, at: 8, color: C.accent, note: 'BasicBlock ×2' },
    { name: 'layer4', shape: '512×7×7', s: 7, at: 8.7, color: C.accent, note: 'BasicBlock ×2' },
    { name: 'pooling → fc', shape: '512 → 1000', s: 0, at: 12.5, color: C.orange, note: 'class 점수' },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={330}>
        <div style={{ position: 'absolute', left: 30, top: 20, display: 'flex', gap: 20, alignItems: 'baseline' }}>
          <Head>ResNet-18 의 출력 모양</Head>
          <span style={{ fontSize: 20, color: C.dim }}>네모 크기는 모식도</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 80, display: 'flex', gap: 44 }}>
          {cards.map((c, i) => (
            <div key={c.name} style={{ position: 'relative' }}>
              <ShapeCard name={c.name} shape={c.shape} side={c.s ? 20 + (c.s / 224) * 90 : 26} at={c.at} color={c.color} note={c.note} />
              {i < cards.length - 1 && <span style={{ position: 'absolute', right: -36, top: 92, fontSize: 28, color: C.muted, opacity: prog(t, cards[i + 1].at) }}>→</span>}
            </div>
          ))}
        </div>
      </Panel>
      <Box x={64} y={480} w={860} h={400} at={12.3} color={`${C.orange}88`} title={<Head color={C.orange}>global average pooling 과 fc</Head>}>
        <L at={12.6}>
          channel 마다 <span style={mono(C.orange)}>7×7 = 49</span> 칸의 평균 → 숫자 512 개 (feature vector)
        </L>
        <L at={13.8}>
          fc (Linear) 가 512 개를 <span style={mono(C.orange)}>1000</span> 개 class 점수로 바꾼다
        </L>
        <L at={15} color={C.muted} size={22}>
          2×2 예: 1, 3, 5, 7 의 평균은 4
        </L>
        <L at={16} color={C.muted} size={22}>
          448×448 사진이면 layer4 가 512×14×14 지만 평균을 내면 여전히 512 개
        </L>
        <L at={17} color={C.muted} size={22}>
          크기를 줄이는 곳은 다섯 곳 → 2⁵ = 32 분의 1
        </L>
      </Box>
      <Box x={956} y={480} w={900} h={400} at={18.3} title={<Head>층 수와 parameter 수 (torchvision)</Head>}>
        <L at={18.6}>
          ResNet-18: <span style={mono(C.accent)}>1 + 8 × 2 + 1 = 18</span> (stem conv + BasicBlock 의 conv + fc)
        </L>
        <L at={20}>
          ResNet-50: <span style={mono(C.purple)}>1 + 16 × 3 + 1 = 50</span> (bottleneck 16 개 × conv 3)
        </L>
        <Table
          head={['', 'ResNet-18', 'ResNet-50']}
          widths={[260, 260, 260]}
          rows={[
            ['parameter', '11,689,512', '25,557,032'],
            ['feature vector', '512', '2048'],
            ['layer4 의 비율', '71.8%', '58.6%'],
          ]}
          at={24.3}
          step={0.8}
        />
      </Box>
    </AbsoluteFill>
  )
}

const PauseBottleneck = () => (
  <PauseWrite
    question="bottleneck 이 2048 → 512 (1×1), 512 → 512 (3×3), 512 → 2048 (1×1) 이면 weight 는 모두 몇 개?"
    answer={
      <>
        512 × 2048 = 1,048,576 · 512 × 512 × 9 = 2,359,296 · 2048 × 512 = 1,048,576
        <br />
        합: 4,456,448 개
      </>
    }
  />
)

// ---------- backbone and robot policies ----------

function BackboneHead({ t }: { t: number }) {
  const card = (w: number, color: string, children: ReactNode, at: number, extra?: React.CSSProperties) => (
    <div style={{ width: w, padding: '16px 20px', borderRadius: 16, border: `2px solid ${color}`, background: `${color}14`, display: 'grid', gap: 6, justifyItems: 'center', opacity: prog(t, at), ...extra }}>{children}</div>
  )
  const arr = (at: number) => <span style={{ width: 44, textAlign: 'center', fontSize: 30, color: C.muted, opacity: prog(t, at) }}>→</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {card(170, C.muted, <span style={{ fontSize: 24, fontWeight: 600 }}>사진</span>, 0.4)}
      {arr(0.6)}
      {card(
        520,
        C.blue,
        <>
          <span style={{ fontSize: 26, fontWeight: 700, color: C.blue }}>backbone · ResNet-18</span>
          <span style={{ fontSize: 22, color: C.muted }}>stem ~ layer4 · global average pooling</span>
          <span style={mono(C.blue, 24)}>11,176,512 개</span>
        </>,
        0.7,
      )}
      {arr(0.9)}
      {card(170, C.accent, <span style={mono(C.accent, 24)}>512 개</span>, 1)}
      {arr(1.2)}
      <div style={{ display: 'grid', gap: 16 }}>
        {card(
          420,
          C.red,
          <span style={{ fontSize: 24, fontWeight: 600, color: C.red, textDecoration: prog(t, 1.8) > 0.5 ? 'line-through' : 'none' }}>ImageNet head · 512 → 1000</span>,
          1.3,
          { opacity: prog(t, 1.3) * (1 - 0.6 * prog(t, 1.8)) },
        )}
        {card(
          420,
          C.green,
          <>
            <span style={{ fontSize: 24, fontWeight: 600, color: C.green }}>새 head · 512 → 10</span>
            <span style={mono(C.green, 22)}>512 × 10 + 10 = 5,130 개</span>
          </>,
          2.4,
        )}
      </div>
    </div>
  )
}

function Transfer() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={300}>
        <div style={{ position: 'absolute', left: 30, top: 20 }}>
          <Head>pretrained backbone 에 새 head 붙이기 (transfer learning)</Head>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 84 }}>
          <BackboneHead t={t} />
        </div>
      </Panel>
      <Box x={64} y={460} w={880} h={420} at={7} title={<Head>학습하는 parameter</Head>}>
        <Table
          head={['학습 방식', 'backbone', 'parameter']}
          widths={[190, 380, 230]}
          rows={[
            ['freeze', '고정', '5,130'],
            ['fine-tuning', '작은 learning rate 로 고침', '11,181,642'],
            ['처음부터', '무작위 값에서 출발', '11,181,642'],
          ]}
          colors={[C.blue, C.green, C.muted]}
          at={7.3}
          step={0.8}
        />
        <L at={10}>
          <span style={mono(C.text, 22)}>11,176,512 + 5,130 = 11,181,642</span>
        </L>
        <L at={11.2} color={C.muted} size={22}>
          ACT 는 pretrained ResNet-18 을 fine-tuning · backbone learning rate 1e-5
        </L>
      </Box>
      <Box x={976} y={460} w={880} h={420} at={14} title={<Head>robomimic Square 성공률 (Diffusion Policy 논문)</Head>}>
        <L at={14.2} color={C.muted} size={22}>
          ImageNet-21k 로 pretraining 한 ResNet-18 encoder 를 학습하는 방식
        </L>
        <Bar label="처음부터 학습" value={0.94} max={1} color={C.blue} at={14.6} width={340} labelW={210} fmt="0.94" />
        <Bar label="freeze" value={0.58} max={1} color={C.red} at={15.4} width={340} labelW={210} fmt="0.58" />
        <Bar label="fine-tuning" value={0.92} max={1} color={C.green} at={16.2} width={340} labelW={210} fmt="0.92" />
        <L at={21.3} color={C.text} size={22}>
          입력 전처리: 256 으로 줄여 가운데 224×224 · 0 ~ 1 로 바꾼 뒤 channel 마다
        </L>
        <L at={22.2} color={C.muted} size={22}>
          평균 (0.485, 0.456, 0.406) 을 빼고 표준편차 (0.229, 0.224, 0.225) 로 나눔
        </L>
      </Box>
    </AbsoluteFill>
  )
}

function TokenGrid({ t, at }: { t: number; at: number }) {
  const s = 14
  return (
    <svg width={20 * s + 2} height={15 * s + 2}>
      <g opacity={prog(t, at)}>
        {Array.from({ length: 300 }, (_, k) => {
          const r = Math.floor(k / 20)
          const c = k % 20
          const cup = r >= 6 && r <= 8 && c >= 12 && c <= 14
          return <rect key={k} x={1 + c * s} y={1 + r * s} width={s - 2} height={s - 2} rx={2} fill={cup ? C.orange : C.accent} opacity={cup ? prog(t, 6.8) * 0.9 + 0.35 : 0.35} />
        })}
      </g>
    </svg>
  )
}

function RobotEncoder() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={430} at={0.3} color={`${C.accent}88`} title={<Head color={C.accent}>ACT · feature map 을 token 으로</Head>}>
        <Flow steps={['480×640 사진', 'ResNet-18', '512×15×20']} color={C.accent} at={0.6} last="token 300 개" />
        <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start', marginTop: 6 }}>
          <TokenGrid t={t} at={1.8} />
          <div style={{ display: 'grid', gap: 10, width: 470 }}>
            <L at={2.2}>
              <span style={mono(C.text)}>480 ÷ 32 = 15</span>
            </L>
            <L at={2.8}>
              <span style={mono(C.text)}>640 ÷ 32 = 20</span>
            </L>
            <L at={3.4}>15 × 20 = 300 칸 → 칸마다 token</L>
            <L at={6.6} color={C.orange}>
              평균을 내지 않아서 컵이 어느 구역에 있는지가 남는다
            </L>
          </div>
        </div>
      </Box>
      <Box x={64} y={580} w={880} h={300} at={12.3} color={`${C.blue}88`} title={<Head color={C.blue}>FrozenBatchNorm (ACT)</Head>}>
        <L at={12.6}>ImageNet 때 쌓은 running mean · variance 와 γ · β 를 모두 고정</L>
        <L at={13.6}>
          평균 2 · 분산 4 · γ 3 · β 1 → 입력 6: <span style={mono(C.blue)}>3 × (6 − 2) ÷ 2 + 1 = 7</span>
        </L>
        <L at={15} color={C.muted} size={22}>
          batch 에 무엇이 함께 있든 같고, batch 8 로 fine-tuning 해도 통계가 흔들리지 않는다
        </L>
      </Box>
      <Box x={976} y={130} w={880} h={420} at={18.3} color={`${C.green}88`} title={<Head color={C.green}>Diffusion Policy 논문 · 처음부터 학습</Head>}>
        <L at={18.6}>BatchNorm → GroupNorm: 사진 한 장 안의 channel 묶음으로 평균 · 분산</L>
        <L at={19.8} color={C.muted} size={22}>
          LeRobot: 16 channel 씩 묶어 64 channel 층은 4 묶음, 512 channel 층은 32 묶음
        </L>
        <L at={20.8}>global average pooling → spatial softmax: channel 마다 값이 큰 칸의 위치 (x, y)</L>
        <L at={22} color={C.muted} size={22}>
          저자들: weight 의 moving average (EMA) 와 함께 쓸 때 GroupNorm 이 중요
        </L>
      </Box>
      <Box x={976} y={580} w={880} h={300} at={24.3} title={<Head>PushT 의 96×96 사진</Head>}>
        <Flow steps={['96×96 사진', '512×3×3', '32 channel']} color={C.green} at={24.5} gap={0.4} last="keypoint 32 개" />
        <L at={26}>
          keypoint 마다 (x, y) → <span style={mono(C.green)}>32 × 2 = 64</span> 개 숫자
        </L>
        <L at={27} color={C.muted} size={22}>
          LeRobot 기본 설정은 ImageNet weight 에서 출발하고 BatchNorm 을 그대로 둔다
        </L>
      </Box>
    </AbsoluteFill>
  )
}

const PauseHead = () => (
  <PauseWrite
    question="ResNet-18 위에 head (Linear 512 → 7) 를 붙이면 head 의 parameter 는 몇 개이고, freeze 로 학습하면 몇 개를 학습할까?"
    answer={
      <>
        weight 512 × 7 = 3,584 · bias 7 → head 3,584 + 7 = 3,591 개
        <br />
        freeze 는 backbone 을 고정하므로 학습하는 parameter 도 3,591 개
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'plain 34 층 28.54% > 18 층 27.94% · ∂y/∂x = 1 + ∂F/∂x 로 weight 없는 길', at: 0.6 },
    { tag: script.sections[1], color: C.purple, text: '평균 0 · 분산 1 → γ · β · 평가는 running mean · batch 2 에서 34.7% 대 GroupNorm 24.1%', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'BasicBlock 8 개 → 512 개 · bottleneck 16 개 → 2048 개 · 11,689,512 대 25,557,032', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'freeze 5,130 · fine-tuning 11,181,642 · ACT 512×15×20 → token 300 개', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            층을 늘렸는데 왜 학습 사진조차 덜 맞히고, 어떻게 풀까?
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>ViT · ACT · RT-1</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            patch 끼리 서로 참고하는 ViT · ResNet 의 feature map 을 token 으로 쓰는 ACT · image token 에 지시 문장을 섞는 RT-1
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/resnet (ResNet · BatchNorm · GroupNorm · Diffusion Policy 논문, torchvision · LeRobot)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Resnet() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        degradation: Degradation,
        residual: Residual,
        'pause-paths': PausePaths,
        'bn-calc': BnCalc,
        'bn-small': BnSmall,
        'pause-running': PauseRunning,
        blocks: Blocks,
        resnet18: ResNet18,
        'pause-bottleneck': PauseBottleneck,
        transfer: Transfer,
        'robot-encoder': RobotEncoder,
        'pause-head': PauseHead,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
