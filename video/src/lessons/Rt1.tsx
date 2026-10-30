import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './rt1.narration.json'
import { script } from './rt1.script'

// Numbers follow lessons/rt1/README.md (see rt1.script.ts). The box scene, the bin examples, the FiLM feature map, the
// TokenLearner weights and the action × object grid are the lesson's own illustrative values (marked 예); every other
// number is the paper's as the lesson reports it.

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
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, sub, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number }) {
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
      {sub && (
        <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>
          {sub}
        </span>
      )}
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


const deg = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}°`

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            IMITATION · RT-1
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>RT-1</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            사진 6 장 + 지시 문장 → <span style={{ color: C.accent }}>action 11 개 · 차원마다 칸 256 개</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            몇 번 칸인지를 분류로 골라, 갈린 시연의 봉우리를 남기는 policy
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

/** top view of the box scene: two demo paths at ±20° and the MSE mean straight into the box (schematic) */
function BoxScene({ t, at }: { t: number; at: number }) {
  const rx = 380
  const ry = 330
  const L = 300
  const s = Math.sin((20 * Math.PI) / 180)
  const c = Math.cos((20 * Math.PI) / 180)
  return (
    <svg width={760} height={380}>
      <g opacity={prog(t, at)}>
        <rect x={350} y={110} width={60} height={50} rx={6} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2.5} />
        <text x={380} y={142} textAnchor="middle" fill={C.orange} fontSize={20} fontWeight={600}>
          상자
        </text>
        <circle cx={rx} cy={ry + 16} r={16} fill={C.card} stroke={C.text} strokeWidth={2.5} />
        <text x={30} y={364} fill={C.dim} fontSize={20}>
          상자 앞 장면 · 모식도
        </text>
      </g>
      <g opacity={prog(t, at + 0.4)}>
        {arrow(rx, ry, rx - L * s, ry - L * c, C.blue, 4, 14)}
        <text x={rx - L * s - 14} y={ry - L * c + 6} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
          −20° · 시연 5 개
        </text>
        {arrow(rx, ry, rx + L * s, ry - L * c, C.blue, 4, 14)}
        <text x={rx + L * s + 14} y={ry - L * c + 6} fill={C.blue} fontSize={22} fontWeight={600}>
          +20° · 시연 5 개
        </text>
      </g>
      <g opacity={prog(t, at + 1.4)}>
        {arrow(rx, ry, rx, 166, C.red, 4, 14)}
        <text x={420} y={300} fill={C.red} fontSize={22} fontWeight={600}>
          MSE 평균 0°
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  const rows: [ReactNode, number, string][] = [
    [<>시연 10 개 가운데 5 개는 <span style={mono(C.blue, 25)}>−20°</span>, 5 개는 <span style={mono(C.blue, 25)}>+20°</span> 로 꺾었다</>, 0.9, C.blue],
    [<><span style={mono(C.orange, 25)}>−10° ~ +10°</span> 로 꺾으면 상자에 부딪힌다</>, 1.6, C.orange],
    [<>숫자 하나를 MSE 로 학습한 policy 는 두 정답의 평균 <span style={mono(C.red, 25)}>0°</span> → 상자로 곧장</>, 2.3, C.red],
    [<>로봇 여러 대 · 조작자 여러 명이 1 년 넘게 모은 시연이면 갈리는 장면이 훨씬 많아진다</>, 3.0, C.muted],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={380}>
        <div style={{ position: 'absolute', left: 20, top: 0 }}>
          <BoxScene t={t} at={0.4} />
        </div>
        <div style={{ position: 'absolute', left: 820, top: 36, width: 930, display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            Behavior Cloning 의 상자 앞 장면
          </Label>
          {rows.map(([s, at, color], i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color, fontSize: 26, fontWeight: 700 }}>•</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 556, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          숫자 하나 대신 <span style={{ color: C.accent }}>무엇으로 내야 갈린 시연을 뭉개지 않을까?</span>
        </div>
      </Appear>
      <Card x={330} y={690} w={1260} h={180} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12, opacity: prog(t, 5.8) }}>
          <Head color={C.accent}>RT-1 · Google · 2022</Head>
          <span style={line(C.text, 24)}>
            사진과 영어 지시 → 팔과 바퀴의 action <span style={mono(C.accent, 24)}>11</span> 개를 1 초에 <span style={mono(C.accent, 24)}>3</span> 번 · 시연 약{' '}
            <span style={mono(C.accent, 24)}>13</span> 만 개로 지시 <span style={mono(C.accent, 24)}>700</span> 개 이상을 <span style={mono(C.green, 24)}>97%</span> 성공
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 1: bins and two peaks ----------

const CENTRES = [-40, -20, 0, 20, 40]
const P_A = [0.056, 0.416, 0.056, 0.416, 0.056]

function Bins() {
  const t = useSec()
  const x0 = 80
  const bw = 184
  const base = 560
  const k = 900
  const bars = prog(t, 14.2, 1)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1040} h={740} at={0.3}>
        <svg width={1040} height={740}>
          <text x={36} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            핸들 각도 · 범위 −50° ~ +50° · 폭 20° 인 칸 다섯 개
          </text>
          {CENTRES.map((c, i) => (
            <g key={c} opacity={prog(t, 0.6 + i * 0.15)}>
              <rect x={x0 + i * bw + 4} y={base - 380} width={bw - 8} height={380} rx={8} fill={i === 2 ? `${C.red}12` : `${C.blue}08`} stroke={C.cardEdge} strokeWidth={1.5} />
              <text x={x0 + (i + 0.5) * bw} y={628} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {deg(c)}
              </text>
              <text x={x0 + (i + 0.5) * bw} y={664} textAnchor="middle" fill={C.dim} fontSize={20}>
                {i} 번 칸
              </text>
            </g>
          ))}
          <line x1={x0} y1={base} x2={x0 + 5 * bw} y2={base} stroke={C.muted} strokeWidth={2} opacity={prog(t, 0.6)} />
          {[-50, -30, -10, 10, 30, 50].map((e, i) => (
            <text key={e} x={x0 + i * bw} y={590} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO} opacity={prog(t, 0.9)}>
              {e > 0 ? `+${e}` : e < 0 ? `−${-e}` : '0'}
            </text>
          ))}
          <g opacity={prog(t, 2.2)}>
            <text x={x0 + 1.5 * bw} y={130} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              시연 5 개
            </text>
            <text x={x0 + 3.5 * bw} y={130} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              시연 5 개
            </text>
            <text x={x0 + 2.5 * bw} y={130} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              부딪힘
            </text>
          </g>
          {P_A.map((p, i) => (
            <g key={i}>
              <rect x={x0 + i * bw + 40} y={base - p * k * bars} width={bw - 80} height={p * k * bars} rx={6} fill={p > 0.1 ? C.green : C.muted} />
              <text x={x0 + (i + 0.5) * bw} y={base - p * k - 14} textAnchor="middle" fill={p > 0.1 ? C.green : C.muted} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15)}>
                {p.toFixed(3)}
              </text>
              <text x={x0 + (i + 0.5) * bw} y={708} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 14)}>
                점수 {i % 2 === 1 ? 2 : 0}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Box x={1136} y={140} w={720} h={230} at={7} title={<Head color={C.accent}>regression → 분류</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 7.3) }}>각도 하나를 맞히던 문제가 몇 번 칸인지를 고르는 분류(classification)가 된다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 8.8) }}>칸 하나하나가 class · 모델은 칸마다 점수 하나를 낸다</span>
      </Box>
      <Box x={1136} y={390} w={720} h={230} at={10.5} title={<Head color={C.green}>softmax · 합이 1 인 확률</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 10.8) }}>
          점수 z 마다 e<sup>z</sup> 를 구하고, 그 합으로 나눈다
        </span>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 14.4) }}>합 1 + 7.389 + 1 + 7.389 + 1 = 17.778</span>
        <span style={{ ...mono(C.green, 23), opacity: prog(t, 16) }}>7.389 ÷ 17.778 ≈ 0.416 · 1 ÷ 17.778 ≈ 0.056</span>
      </Box>
      <Box x={1136} y={640} w={720} h={240} at={21} title={<Head color={C.orange}>실행할 때 고르는 법</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.3) }}>
          argmax: 확률이 가장 큰 <span style={mono(C.green, 23)}>−20°</span> 칸이나 <span style={mono(C.green, 23)}>+20°</span> 칸
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.5) }}>
          sampling 100 번: 두 칸 약 <span style={mono(C.green, 23)}>42</span> 번씩 · 0° 칸 약 <span style={mono(C.muted, 23)}>6</span> 번
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>늘 0° 를 내는 regression 과 다르다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** five bins with the probabilities a model gives; the demo answer bins (−20°, +20°) are outlined in orange */
function MiniBars({ x, title, probs, loss, color, t, at }: { x: number; title: string; probs: number[]; loss: string; color: string; t: number; at: number }) {
  const bw = 96
  const x0 = x + 30
  const base = 400
  const k = 300
  const p = prog(t, at + 0.3, 0.9)
  return (
    <g opacity={prog(t, at)}>
      <text x={x0} y={60} fill={C.text} fontSize={24} fontWeight={600}>
        {title}
      </text>
      {probs.map((q, i) => (
        <g key={i}>
          {(i === 1 || i === 3) && <rect x={x0 + i * bw + 2} y={base - 280} width={bw - 4} height={280} rx={6} fill="none" stroke={C.orange} strokeWidth={2.5} strokeDasharray="7 5" />}
          <rect x={x0 + i * bw + 20} y={base - q * k * p} width={bw - 40} height={q * k * p} rx={5} fill={color} />
          <text x={x0 + (i + 0.5) * bw} y={base - q * k - 12} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 1)}>
            {q}
          </text>
          <text x={x0 + (i + 0.5) * bw} y={base + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {deg(CENTRES[i])}
          </text>
        </g>
      ))}
      <line x1={x0} y1={base} x2={x0 + 5 * bw} y2={base} stroke={C.muted} strokeWidth={2} />
      <text x={x0} y={474} fill={color} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 1.4)}>
        {loss}
      </text>
    </g>
  )
}

function CrossEntropy() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={500} at={0.3}>
        <svg width={1100} height={500}>
          <text x={60} y={100} fill={C.orange} fontSize={20} opacity={prog(t, 6.5)}>
            주황 점선: 시연의 정답 칸
          </text>
          <MiniBars x={30} title="모델 A · 두 봉우리" probs={P_A} loss="평균 loss ≈ 0.878" color={C.green} t={t} at={6.5} />
          <MiniBars x={570} title="모델 B · 가운데 봉우리" probs={[0.0415, 0.0415, 0.834, 0.0415, 0.0415]} loss="평균 loss ≈ 3.18" color={C.red} t={t} at={12.5} />
        </svg>
      </Card>
      <Box
        x={64}
        y={660}
        w={1100}
        h={220}
        at={0.3}
        gap={10}
        title={
          <Head color={C.accent}>
            cross-entropy <span style={mono(C.accent, 28)}>L = −log p</span>
            <span style={{ fontSize: 22, color: C.muted, fontWeight: 500 }}> · p 는 정답 칸이 받은 확률</span>
          </Head>
        }
      >
        <Table
          at={1.5}
          size={22}
          head={['정답 칸의 확률 p', '1', '0.8', '0.5', '0.416', '0.2', '0.0415']}
          widths={[220, 130, 130, 130, 130, 130, 130]}
          rows={[['loss −log p', '0', '0.223', '0.693', '0.878', '1.609', '3.18']]}
        />
      </Box>
      <Box x={1196} y={140} w={660} h={320} at={18.5} title={<Head color={C.green}>loss 가 가장 작은 확률</Head>}>
        <Table
          at={18.7}
          size={23}
          head={['확률', '−20° 칸', '+20° 칸', '평균 loss']}
          widths={[160, 130, 130, 150]}
          rows={[
            ['A', '0.416', '0.416', '0.878'],
            ['B', '0.0415', '0.0415', '3.18'],
            ['비율대로', '0.5', '0.5', '0.693'],
          ]}
          colors={[C.text, C.red, C.green]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>시연이 갈린 비율을 확률로 배워 봉우리 두 개가 남는다</span>
      </Box>
      <Box x={1196} y={480} w={660} h={400} at={24.5} gap={10} title={<Head color={C.orange} size={26}>출력을 Gaussian 으로 바꾸면 (저자 실험)</Head>}>
        <Label size={22} color={C.muted}>
          학습한 지시
        </Label>
        <Bar label="칸 분류" value={97} max={100} color={C.green} at={24.8} width={280} labelW={130} unit="%" />
        <Bar label="Gaussian" value={68} max={100} color={C.red} at={25.3} width={280} labelW={130} unit="%" />
        <Label size={22} color={C.muted}>
          처음 보는 지시
        </Label>
        <Bar label="칸 분류" value={76} max={100} color={C.green} at={26} width={280} labelW={130} unit="%" />
        <Bar label="Gaussian" value={43} max={100} color={C.red} at={26.5} width={280} labelW={130} unit="%" />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 27.3) }}>Gaussian 은 봉우리 하나만 나타낸다 (논문의 설명)</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseCe = () => (
  <PauseWrite
    question="같은 장면의 시연 10 개 가운데 −20° 가 2 개, +20° 가 8 개다. 평균 cross-entropy 를 가장 작게 만드는 확률은 −20° 칸과 +20° 칸에 각각 얼마인가?"
    answer={
      <>
        loss 를 가장 작게 만드는 확률은 칸마다 정답이 나온 비율
        <br />
        −20° 칸 2 ÷ 10 = 0.2 · +20° 칸 8 ÷ 10 = 0.8 · 나머지 칸 0
      </>
    }
  />
)

// ---------- section 2: binning and the number of bins ----------

function Binning() {
  const t = useSec()
  const x0 = 120
  const bw = 320
  const X = (a: number) => x0 + ((a + 50) / 100) * 5 * bw
  const pt = (a: number, b: number, at: number, dec: number) => (
    <>
      <g opacity={prog(t, at)}>
        <polygon points={`${X(a) - 9},${132} ${X(a) + 9},${132} ${X(a)},${148}`} fill={C.orange} />
        <text x={X(a)} y={118} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
          {deg(a)}
        </text>
      </g>
      <g opacity={prog(t, dec)}>
        <polygon points={`${X(b) - 9},${228} ${X(b) + 9},${228} ${X(b)},${212}`} fill={C.green} />
        <text x={X(b)} y={300} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          → {deg(b)} · 오차 +3°
        </text>
      </g>
    </>
  )
  // sawtooth: error of the centre value over −50 ~ +50
  const gx = (a: number) => 90 + ((a + 50) / 100) * 740
  const gy = (e: number) => 220 - e * 10
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <svg width={1792} height={330}>
          <text x={40} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            범위 −50° ~ +50° · 칸 폭 Δ = 100 ÷ 5 = 20°
          </text>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} opacity={prog(t, 0.6 + i * 0.15)}>
              <rect x={x0 + i * bw} y={152} width={bw} height={56} fill={i % 2 ? `${C.blue}22` : `${C.blue}0d`} stroke={C.cardEdge} strokeWidth={1.5} />
              <text x={x0 + (i + 0.5) * bw} y={188} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                {i} 번 칸
              </text>
            </g>
          ))}
          {[-50, -30, -10, 10, 30, 50].map((e, i) => (
            <text key={e} x={x0 + i * bw} y={250} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO} opacity={prog(t, 0.9)}>
              {deg(e)}
            </text>
          ))}
          {pt(17, 20, 6.8, 13.8)}
          {pt(-23, -20, 10.5, 16)}
        </svg>
      </Card>
      <Box x={64} y={490} w={880} h={390} at={6.5} gap={12} title={<Head color={C.accent}>encode · decode</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>
          칸 번호 = 내림(<span style={mono(C.text, 23)}>(a − a</span>
          <sub style={{ fontSize: 20 }}>min</sub>
          <span style={mono(C.text, 23)}>) ÷ Δ</span>) · 소수점 아래를 버린다
        </span>
        <span style={{ ...mono(C.orange, 23), opacity: prog(t, 8.5) }}>17°: (17 + 50) ÷ 20 = 3.35 → 3 번 칸</span>
        <span style={{ ...mono(C.orange, 23), opacity: prog(t, 10.7) }}>−23°: (−23 + 50) ÷ 20 = 1.35 → 1 번 칸</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13.8) }}>
          decode: 칸의 가운데 값 <span style={mono(C.text, 23)}>a</span>
          <sub style={{ fontSize: 20 }}>min</sub>
          <span style={mono(C.text, 23)}> + (b + 0.5) × Δ</span>
        </span>
        <span style={{ ...mono(C.green, 23), opacity: prog(t, 15) }}>3 번 칸: −50 + 3.5 × 20 = 20° · 오차 +3°</span>
      </Box>
      <Card x={976} y={490} w={880} h={390} at={21}>
        <svg width={880} height={390}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            가운데 값으로 되돌린 오차
          </text>
          <text x={30} y={84} fill={C.orange} fontSize={20} opacity={prog(t, 23)}>
            주황 점: 17° 와 −23° · 둘 다 오차 +3°
          </text>
          <line x1={90} y1={gy(0)} x2={830} y2={gy(0)} stroke={C.cardEdge} strokeWidth={1.5} />
          {[-10, 0, 10].map((e) => (
            <text key={e} x={78} y={gy(e) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {deg(e)}
            </text>
          ))}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = -50 + 20 * i
            const p = prog(t, 21.3 + i * 0.25, 0.5)
            return <line key={i} x1={gx(a)} y1={gy(10)} x2={gx(a) + (gx(a + 20) - gx(a)) * p} y2={gy(10) - 20 * 10 * p} stroke={C.blue} strokeWidth={3} />
          })}
          {[17, -23].map((a) => (
            <g key={a} opacity={prog(t, 23)}>
              <circle cx={gx(a)} cy={gy(3)} r={7} fill={C.orange} />
              <text x={gx(a) + 12} y={gy(3) - 14} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
                +3°
              </text>
            </g>
          ))}
          <text x={90} y={360} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 24.5)}>
            |오차| ≤ Δ ÷ 2 = 20 ÷ 2 = 10°
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function K256() {
  const t = useSec()
  const x0 = 90
  const bw = 240
  const X = (a: number) => x0 + (a - 9) * bw
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={420} at={0.3}>
        <svg width={900} height={420}>
          <text x={36} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            관절 범위 −128° ~ +128° · 칸 256 개 · 칸 폭 1°
          </text>
          <text x={36} y={82} fill={C.dim} fontSize={20}>
            예로 정한 범위 · 138 번 칸 근처를 확대
          </text>
          {[137, 138, 139].map((b, i) => (
            <g key={b} opacity={prog(t, 0.8 + i * 0.15)}>
              <rect x={x0 + i * bw} y={200} width={bw} height={70} fill={b === 138 ? `${C.blue}26` : `${C.blue}0d`} stroke={C.cardEdge} strokeWidth={1.5} />
              <text x={x0 + (i + 0.5) * bw} y={244} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                {b} 번 칸
              </text>
            </g>
          ))}
          {[9, 10, 11, 12].map((e) => (
            <text key={e} x={X(e)} y={304} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO} opacity={prog(t, 1)}>
              {e}°
            </text>
          ))}
          <g opacity={prog(t, 6.6)}>
            <polygon points={`${X(10.3) - 9},${178} ${X(10.3) + 9},${178} ${X(10.3)},${194}`} fill={C.orange} />
            <text x={X(10.3)} y={164} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              10.3°
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            <polygon points={`${X(10.5) - 9},${290} ${X(10.5) + 9},${290} ${X(10.5)},${274}`} fill={C.green} />
            <text x={X(10.5)} y={344} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              → 10.5° · 오차 +0.2°
            </text>
          </g>
          <text x={36} y={378} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7.5)}>
            encode (10.3 + 128) ÷ 1 = 138.3 → 138 번 칸
          </text>
          <text x={36} y={408} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9.8)}>
            decode −128 + 138.5 × 1 = 10.5°
          </text>
        </svg>
      </Card>
      <Box x={64} y={580} w={900} h={300} at={20.5} gap={12} title={<Head color={C.purple}>action token</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.8) }}>칸 번호 = action token · 칸 256 개를 단어 256 개짜리 vocabulary 로 본다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.5) }}>
          한 step: 차원 11 개 × 칸 256 개 = 점수 <span style={mono(C.purple, 24)}>2,816</span> 개
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>차원마다 softmax 를 따로 하고, loss 는 차원마다 구한 cross-entropy 의 합</span>
      </Box>
      <Box x={996} y={140} w={860} h={420} at={12.8} title={<Head color={C.accent}>칸 개수 K · 범위 256° · 각도 1000 개</Head>}>
        <Table
          at={13}
          head={['칸 개수 K', '칸 폭', '최대 오차', '칸 하나의 평균 각도 수']}
          widths={[160, 160, 180, 280]}
          rows={[
            ['16', '16°', '8°', '62.5'],
            ['256', '1°', '0.5°', '약 3.9'],
            ['4096', '0.0625°', '0.03125°', '약 0.24'],
          ]}
          colors={[C.red, C.green, C.orange]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15) }}>최대 오차 = 칸 폭 ÷ 2 · 평균 각도 수 = 1000 ÷ K</span>
      </Box>
      <Box x={996} y={580} w={860} h={300} at={14.5} gap={12} title={<Head color={C.text}>칸이 너무 적거나 너무 많으면</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14.8) }}>
          <span style={mono(C.red, 23)}>16</span> 개: 최대 오차 8° → 컵 손잡이를 정확히 잡을 수 없다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 16.8) }}>
          <span style={mono(C.orange, 23)}>4096</span> 개: 칸 하나에 약 0.24 개 → 대부분의 칸에 정답이 없어 확률을 배울 근거가 없다
        </span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 19) }}>RT-1 은 그 사이의 256 을 골랐다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseBin = () => (
  <PauseWrite
    question="범위 0 ~ 100 을 칸 4 개로 나눴다. 값 62 는 몇 번 칸이고, 그 칸을 가운데 값으로 decode 하면 몇이며, 이 범위에서 오차는 최대 얼마인가?"
    answer={
      <>
        칸 폭 (100 − 0) ÷ 4 = 25 · 62 ÷ 25 = 2.48 → 2 번 칸
        <br />
        decode 0 + (2 + 0.5) × 25 = 62.5 · 최대 오차 25 ÷ 2 = 12.5
      </>
    }
  />
)

// ---------- section 3: FiLM, TokenLearner and the 3 Hz budget ----------

function FlowBox({ x, y, w, h = 84, title, sub, color, op }: { x: number; y: number; w: number; h?: number; title: string; sub: string; color: string; op: number }) {
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
        {title}
      </text>
      <text x={x + w / 2} y={y + 66} textAnchor="middle" fill={C.muted} fontSize={20}>
        {sub}
      </text>
    </g>
  )
}

/** a 2 × 2 feature-map channel with its four values */
function Grid({ x, y, vals, color, op }: { x: number; y: number; vals: number[]; color: string; op: number }) {
  const s = 64
  return (
    <g opacity={op}>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x + (i % 2) * s} y={y + Math.floor(i / 2) * s} width={s} height={s} fill={v > 0 ? `${color}${v >= 3 ? '55' : '26'}` : C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
          <text x={x + (i % 2) * s + s / 2} y={y + Math.floor(i / 2) * s + 41} textAnchor="middle" fill={v < 0 ? C.dim : C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
            {v < 0 ? `−${-v}` : v}
          </text>
        </g>
      ))}
    </g>
  )
}

function Film() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={300} at={0.3}>
        <svg width={1792} height={300}>
          <FlowBox x={30} y={36} w={260} title="사진 6 장" sub="한 장 300 × 300 pixel" color={C.blue} op={prog(t, 0.6)} />
          {arrow(290, 78, 336, 78, C.muted, 3, 12, prog(t, 1))}
          <FlowBox x={340} y={36} w={440} title="EfficientNet-B3 + FiLM" sub="ImageNet pretrained 에서 시작" color={C.blue} op={prog(t, 1.2)} />
          {arrow(780, 78, 826, 78, C.muted, 3, 12, prog(t, 2))}
          <FlowBox x={830} y={36} w={360} title="image token 81 개 / 장" sub="9 × 9 칸 · 숫자 512 개씩" color={C.blue} op={prog(t, 2.2)} />
          <text x={1240} y={74} fill={C.blue} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={prog(t, 3.5)}>
            6 × 81 = 486 개
          </text>
          <text x={1240} y={108} fill={C.muted} fontSize={21} opacity={prog(t, 4.2)}>
            칸마다 token 이라 물체의 자리가 남는다
          </text>
          <FlowBox x={30} y={190} w={260} title="영어 지시 문장" sub="pick iced tea can" color={C.purple} op={prog(t, 6.2)} />
          {arrow(290, 232, 336, 232, C.muted, 3, 12, prog(t, 6.6))}
          <FlowBox x={340} y={190} w={440} title="Universal Sentence Encoder" sub="문장 → 숫자 512 개 (embedding)" color={C.purple} op={prog(t, 6.8)} />
          {arrow(560, 190, 560, 124, C.purple, 3, 12, prog(t, 9))}
          <text x={580} y={166} fill={C.purple} fontSize={24} fontWeight={600} opacity={prog(t, 9.4)}>
            γ, β 로 CNN 중간에 섞기
          </text>
        </svg>
      </Card>
      <Card x={64} y={460} w={1180} h={420} at={12}>
        <svg width={1180} height={420}>
          <text x={30} y={42} fill={C.text} fontSize={24} fontWeight={600}>
            channel 마다 y = γx + β · 예로 정한 feature map, 빨간 캔 지시 γ = (2, 0), β = (0, −1)
          </text>
          <text x={30} y={150} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 12.4)}>
            channel 1 (빨강)
          </text>
          <Grid x={250} y={80} vals={[3, 0, 0, 1]} color={C.red} op={prog(t, 12.6)} />
          {arrow(400, 144, 500, 144, C.muted, 3, 12, prog(t, 17.5))}
          <Grid x={520} y={80} vals={[6, 0, 0, 2]} color={C.red} op={prog(t, 18)} />
          <text x={690} y={138} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 18.4)}>
            2x + 0
          </text>
          <text x={690} y={172} fill={C.muted} fontSize={21} opacity={prog(t, 18.8)}>
            두 배가 된다
          </text>
          <text x={30} y={320} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 12.8)}>
            channel 2 (초록)
          </text>
          <Grid x={250} y={250} vals={[0, 1, 0, 3]} color={C.green} op={prog(t, 13)} />
          {arrow(400, 314, 500, 314, C.muted, 3, 12, prog(t, 19.5))}
          <Grid x={520} y={250} vals={[-1, -1, -1, -1]} color={C.green} op={prog(t, 20)} />
          <text x={690} y={308} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 20.4)}>
            0x − 1
          </text>
          <text x={690} y={342} fill={C.muted} fontSize={21} opacity={prog(t, 20.8)}>
            모두 −1 · 다음 층의 ReLU 를 지나면 0
          </text>
          <text x={30} y={404} fill={C.dim} fontSize={20} opacity={prog(t, 22)}>
            초록 봉지 지시면 γ = (0, 2), β = (−1, 0) 이라 반대로 초록 channel 이 (0, 2, 0, 6) 이 된다
          </text>
        </svg>
      </Card>
      <Box x={1276} y={460} w={580} h={420} at={24} gap={12} title={<Head color={C.orange} size={26}>방해 물체 시험 · 같은 데이터</Head>}>
        <Bar label="Gato" value={43} max={100} color={C.red} at={24.3} width={290} labelW={110} unit="%" />
        <Bar label="RT-1" value={83} max={100} color={C.green} at={24.9} width={290} labelW={110} unit="%" />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.8) }}>Gato: 사진 token 을 지시와 상관없이 만들고 나중에 합친다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26.8) }}>RT-1: FiLM 으로 지시를 사진 처리 도중에 섞는다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 27.8) }}>저자들은 그 차이의 원인을 FiLM 으로 추정했다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Tokens() {
  const t = useSec()
  const inputs: [string, number, number][] = [
    ['빨간 캔 (4, 0)', 0.7, 0.1],
    ['책상 (0, 0)', 0.1, 0.1],
    ['책상 (0, 0)', 0.1, 0.1],
    ['초록 봉지 (0, 4)', 0.1, 0.7],
  ]
  const big = 270
  const small = (big * 48) / 486
  const cell = (x: number, y: number, label: string, ok: boolean, sub: string) => (
    <g>
      <rect x={x} y={y} width={150} height={80} rx={8} fill={ok ? `${C.green}22` : `${C.red}14`} stroke={ok ? C.green : C.red} strokeWidth={2} strokeDasharray={ok ? undefined : '7 5'} />
      <text x={x + 75} y={y + 34} textAnchor="middle" fill={ok ? C.green : C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
        {label}
      </text>
      <text x={x + 75} y={y + 64} textAnchor="middle" fill={ok ? C.green : C.red} fontSize={20}>
        {sub}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={360} at={0.3}>
        <svg width={860} height={360}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            TokenLearner · 예로 정한 token 4 개 → 2 개
          </text>
          <text x={314} y={88} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={600}>
            A
          </text>
          <text x={374} y={88} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={600}>
            B
          </text>
          {inputs.map(([s, a, b], i) => (
            <g key={i} opacity={prog(t, 0.8 + i * 0.2)}>
              <rect x={30} y={96 + i * 56} width={250} height={44} rx={10} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
              <text x={46} y={126 + i * 56} fill={C.text} fontSize={21}>
                {s}
              </text>
              <text x={314} y={126 + i * 56} textAnchor="middle" fill={C.red} fontSize={20} fontFamily={MONO} opacity={prog(t, 2)}>
                {a}
              </text>
              <text x={374} y={126 + i * 56} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 2)}>
                {b}
              </text>
              <line x1={410} y1={118 + i * 56} x2={590} y2={138} stroke={C.red} strokeWidth={1 + 4 * a} opacity={0.7 * prog(t, 2.6)} />
              <line x1={410} y1={118 + i * 56} x2={590} y2={258} stroke={C.green} strokeWidth={1 + 4 * b} opacity={0.7 * prog(t, 2.6)} />
            </g>
          ))}
          <g opacity={prog(t, 3.2)}>
            <rect x={590} y={110} width={240} height={56} rx={10} fill={`${C.red}18`} stroke={C.red} strokeWidth={2} />
            <text x={710} y={146} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              A (2.8, 0.4)
            </text>
            <rect x={590} y={230} width={240} height={56} rx={10} fill={`${C.green}18`} stroke={C.green} strokeWidth={2} />
            <text x={710} y={266} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              B (0.4, 2.8)
            </text>
          </g>
          <text x={30} y={344} fill={C.muted} fontSize={21} opacity={prog(t, 4.2)}>
            weight 로 가중 평균 · RT-1 은 한 장의 81 개 → 8 개 · 6 장이면 48 개
          </text>
        </svg>
      </Card>
      <Card x={956} y={140} w={900} h={360} at={6.5}>
        <svg width={900} height={360}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            attention 점수 표 · 같은 비율로 그림
          </text>
          <rect x={30} y={66} width={big * prog(t, 6.8, 0.8)} height={big * prog(t, 6.8, 0.8)} fill={`${C.red}30`} stroke={C.red} strokeWidth={2} />
          <g opacity={prog(t, 7.6)}>
            <text x={330} y={100} fill={C.red} fontSize={22} fontWeight={600}>
              token 486 개
            </text>
            <text x={330} y={134} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              486 × 486 = 236,196
            </text>
          </g>
          <g opacity={prog(t, 9)}>
            <rect x={640} y={66} width={small} height={small} fill={`${C.green}55`} stroke={C.green} strokeWidth={2} />
            <text x={640} y={134} fill={C.green} fontSize={22} fontWeight={600}>
              token 48 개
            </text>
            <text x={640} y={168} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              48 × 48 = 2,304
            </text>
          </g>
          <text x={330} y={250} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 10.5)}>
            236,196 ÷ 2,304 ≈ 102.5
          </text>
          <text x={330} y={290} fill={C.muted} fontSize={21} opacity={prog(t, 11.2)}>
            token 이 약 10 분의 1 → 표는 약 100 분의 1
          </text>
        </svg>
      </Card>
      <Box x={64} y={520} w={860} h={360} at={13} gap={10} title={<Head color={C.accent} size={26}>1 초에 3 번 → 계산 한 번은 100 ms 안</Head>}>
        <Bar label="RT-1" value={15} max={140} color={C.green} at={13.4} width={340} labelW={250} unit=" ms" />
        <Bar label="Gato (약 3,700 만)" value={129} max={140} color={C.red} at={14.2} width={340} labelW={250} unit=" ms" />
        <Bar label="BC-Z" value={5.3} max={140} color={C.muted} at={15} width={340} labelW={250} unit=" ms" />
        <Bar label="autoregressive" value={36} max={140} color={C.orange} at={25.8} width={340} labelW={250} unit=" ms" />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 16.5) }}>카메라 · 통신 같은 다른 지연까지 따진 저자들의 기준 · 사람은 이 지시에 2 ~ 4 초</span>
      </Box>
      <Card x={956} y={520} w={900} h={360} at={19.5}>
        <svg width={900} height={360} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            x, y 를 따로 고르면 · 예로 정한 시연 A, B
          </text>
          <text x={195} y={84} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            x −20
          </text>
          <text x={355} y={84} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            x +20
          </text>
          <text x={108} y={145} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            y +20
          </text>
          <text x={108} y={235} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            y −20
          </text>
          <g opacity={prog(t, 20)}>
            {cell(120, 100, '0.25', true, '시연 A')}
            {cell(280, 100, '0.25', false, '시연에 없음')}
            {cell(120, 190, '0.25', false, '시연에 없음')}
            {cell(280, 190, '0.25', true, '시연 B')}
          </g>
          <text x={30} y={316} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 22)}>
            없는 짝 0.25 + 0.25 = 0.5
          </text>
          <text x={30} y={350} fill={C.muted} fontSize={20} opacity={prog(t, 23)}>
            칸 분류는 차원 하나 안의 봉우리만 지킨다
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 470, top: 70, width: 400, display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.orange, 22), opacity: prog(t, 25.8) }}>autoregressive: 앞에서 고른 x 를 보고 y 를 고른다</span>
          <span style={{ ...mono(C.orange, 22), opacity: prog(t, 27) }}>15 ms → 36 ms</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 28) }}>
            성공률 <span style={mono(C.red, 22)}>97% → 85%</span> · 처음 보는 지시 <span style={mono(C.red, 22)}>76% → 71%</span>
          </span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 29.5) }}>그래서 RT-1 은 11 개 차원을 한 번에 함께 낸다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseFilm = () => (
  <PauseWrite
    question="어떤 channel 의 값이 (1, 4) 이고 지시에서 만든 γ = 3, β = −2 다. FiLM 을 거친 값은? FiLM 의 행렬이 모두 0 이었다면?"
    answer={
      <>
        3 × 1 − 2 = 1 · 3 × 4 − 2 = 10 → (1, 10)
        <br />
        행렬이 0 이면 γ = 1 + 0 = 1, β = 0 → (1, 4) 그대로 (identity 초기화)
      </>
    }
  />
)

// ---------- section 4: generalization and its limit ----------

/** action × object grid (the lesson's illustrative example); `held` cells were left out of training, `none` rows never demonstrated */
function ComboGrid({ t, at, rows, cols, held, none, x0 = 220, cw = 125, top = 110, rh = 84 }: { t: number; at: number; rows: string[]; cols: string[]; held: [number, number][]; none?: number; x0?: number; cw?: number; top?: number; rh?: number }) {
  return (
    <g>
      {cols.map((c, j) => (
        <text key={c} x={x0 + (j + 0.5) * cw} y={top - 18} textAnchor="middle" fill={C.muted} fontSize={21} opacity={prog(t, at)}>
          {c}
        </text>
      ))}
      {rows.map((r, i) => (
        <g key={r} opacity={prog(t, at + 0.3 + i * 0.3)}>
          <text x={x0 - 16} y={top + i * rh + rh / 2 + 7} textAnchor="end" fill={i === none ? C.red : C.text} fontSize={22} fontWeight={600}>
            {r}
          </text>
          {cols.map((c, j) => {
            const h = held.some(([a, b]) => a === i && b === j)
            const n = i === none
            const color = n ? C.red : h ? C.orange : C.blue
            return (
              <g key={c}>
                <rect x={x0 + j * cw + 6} y={top + i * rh + 6} width={cw - 12} height={rh - 12} rx={8} fill={n ? `${C.red}10` : h ? `${C.orange}14` : `${C.blue}30`} stroke={color} strokeWidth={2} strokeDasharray={h || n ? '7 5' : undefined} />
                <text x={x0 + (j + 0.5) * cw} y={top + i * rh + rh / 2 + 8} textAnchor="middle" fill={color} fontSize={22} fontWeight={600}>
                  {n ? '✕' : h ? '?' : '✓'}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
}

function Data() {
  const t = useSec()
  const chips: [string, number][] = [
    ['로봇 13 대', 0.6],
    ['17 개월', 1.2],
    ['episode 약 13 만 개', 1.8],
    ['skill 9 가지', 3.6],
    ['지시 744 개', 4.4],
    ['지시 하나에 평균 130,000 ÷ 744 ≈ 175 개', 5.4],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={130} at={0.3} gap={12}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {chips.map(([c, at]) => (
            <Chip key={c} at={at}>
              {c}
            </Chip>
          ))}
        </div>
      </Box>
      <Card x={64} y={290} w={760} h={590} at={7}>
        <svg width={760} height={590}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            처음 보는 지시 · 예로 든 동작 × 물체 표
          </text>
          <ComboGrid
            t={t}
            at={7.3}
            rows={['집기', '옆으로 옮기기', '서랍에 넣기']}
            cols={['사과', '콜라 캔', '스펀지', '초코바']}
            held={[
              [0, 0],
              [1, 2],
              [2, 1],
            ]}
            x0={230}
            top={120}
            rh={90}
          />
          <g opacity={prog(t, 9.5)}>
            <rect x={30} y={420} width={36} height={28} rx={6} fill={`${C.blue}30`} stroke={C.blue} strokeWidth={2} />
            <text x={80} y={442} fill={C.blue} fontSize={22}>
              시연이 있는 조합
            </text>
            <rect x={330} y={420} width={36} height={28} rx={6} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={2} strokeDasharray="7 5" />
            <text x={380} y={442} fill={C.orange} fontSize={22}>
              학습에서 뺀 조합
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 480, width: 700, display: 'grid', gap: 8, opacity: prog(t, 10.5) }}>
          <span style={line(C.text, 23)}>논문의 처음 보는 지시 21 개: 동작과 물체는 각각 다른 지시에서 봤고 조합만 처음</span>
        </div>
      </Card>
      <Box x={856} y={290} w={1000} h={590} at={14} title={<Head color={C.accent} size={26}>성공률 · RT-1 논문 Table 2 · 모두 같은 데이터로 학습</Head>}>
        <Table
          at={14.2}
          step={0.4}
          size={23}
          head={['모델', '학습한 지시', '처음 보는 지시', '방해 물체', '처음 보는 배경']}
          widths={[180, 180, 200, 170, 200]}
          rows={[
            ['Gato', '65%', '52%', '43%', '35%'],
            ['BC-Z', '72%', '19%', '47%', '41%'],
            ['BC-Z XL', '56%', '43%', '23%', '35%'],
            ['RT-1', '97%', '76%', '83%', '59%'],
          ]}
          colors={[C.text, C.text, C.text, C.accent]}
        />
        <Label size={22} color={C.muted}>
          처음 보는 지시
        </Label>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="RT-1" value={76} max={100} color={C.accent} at={16} width={420} labelW={140} unit="%" />
          <Bar label="Gato" value={52} max={100} color={C.muted} at={16.4} width={420} labelW={140} unit="%" />
          <Bar label="BC-Z" value={19} max={100} color={C.muted} at={16.8} width={420} labelW={140} unit="%" />
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 18) }}>
          76 − 52 = <span style={mono(C.accent, 24)}>24%p</span> · %p 는 퍼센트끼리의 차이
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.5) }}>
          RT-1 도 처음 보는 배경은 <span style={mono(C.orange, 24)}>59%</span> 로 네 항목 가운데 가장 낮다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Diversity() {
  const t = useSec()
  const notes: [string, number, string][] = [
    ['붓기는 어느 칸에서도 정답으로 나온 적이 없어 모델이 그 동작을 만들 근거가 없다', 19.5, C.text],
    ['pour 라는 단어를 받아도 Universal Sentence Encoder 는 숫자로 바꿀 뿐 · 짝지어 배운 action 이 없다', 25.8, C.text],
    ['시연을 따라 배우는 imitation learning 이라 시연한 사람보다 잘하기 어렵다', 27.5, C.muted],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1100} h={420} at={0.3} gap={12} title={<Head color={C.accent} size={26}>데이터를 줄이는 두 방식 · 저자 실험</Head>}>
        <Table
          at={0.6}
          step={2.6}
          size={23}
          head={['줄인 방식', '남은 지시', '남은 데이터', '학습한 지시', '일반화 평균']}
          widths={[330, 150, 170, 170, 170]}
          rows={[
            ['줄이지 않음', '100%', '100%', '97%', '73%'],
            ['지시마다 최대 200 개', '100%', '51%', '71%', '50%'],
            ['시연이 적은 지시를 뺌', '75%', '97%', '86%', '54%'],
          ]}
          colors={[C.text, C.orange, C.purple]}
        />
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 1) }}>일반화 평균: 처음 보는 지시 · 방해 물체 · 처음 보는 배경의 성공률 평균</span>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="줄이지 않음" value={73} max={100} color={C.green} at={2} width={460} labelW={230} unit="%" />
          <Bar label="양만 줄임" value={50} max={100} color={C.orange} at={3.5} width={460} labelW={230} unit="%" />
          <Bar label="종류를 줄임" value={54} max={100} color={C.purple} at={7} width={460} labelW={230} unit="%" />
        </div>
      </Box>
      <Box x={64} y={580} w={1100} h={300} at={12.5} gap={12} title={<Head color={C.green} size={26}>양보다 다양성</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 12.8) }}>
          종류를 줄인 쪽은 데이터를 <span style={mono(C.purple, 24)}>3%</span> 만 잃고도 일반화가 <span style={mono(C.purple, 24)}>54%</span> 로, 데이터를{' '}
          <span style={mono(C.orange, 24)}>49%</span> 줄인 쪽의 <span style={mono(C.orange, 24)}>50%</span> 와 비슷하게 떨어졌다
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.5) }}>
          종류가 다른 데이터도 도왔다: simulation 데이터 23% → 87% · Kuka episode 20 만 9 천 개 22% → 39%
        </span>
      </Box>
      <Card x={1196} y={140} w={660} h={740} at={18.8}>
        <svg width={660} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            시연에 없는 동작 · 예로 든 표
          </text>
          <ComboGrid t={t} at={19} rows={['집기', '옆으로 옮기기', '붓기']} cols={['사과', '콜라 캔']} held={[]} none={2} x0={250} cw={170} top={120} rh={90} />
          <text x={30} y={430} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 20.5)}>
            붓기: 어떤 물체로도 하지 못한다
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 470, width: 600, display: 'grid', gap: 14 }}>
          {notes.map(([s, at, color]) => (
            <span key={s} style={{ ...line(color, 22), opacity: prog(t, at) }}>
              {s}
            </span>
          ))}
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseLimit = () => (
  <PauseWrite
    question="RT-1 의 시연에 집기와 서랍 열기는 있고 병뚜껑 돌려 열기는 없다. 사과 집기와 병뚜껑 돌려 열기 가운데 RT-1 이 해낼 가능성이 높은 것은?"
    answer={
      <>
        사과 집기: 집는 동작은 시연에 있고 사과가 다른 지시에 나왔다면 본 적 있는 조합
        <br />
        병뚜껑 돌려 열기: 돌려 여는 동작은 시연에 한 번도 없어 어떤 칸의 확률로도 배운 적이 없다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: S(0), color: C.green, text: '칸 256 개의 확률 · 갈린 시연에서 두 봉우리 loss 0.878 < 가운데 3.18', at: 0.6 },
    { tag: S(1), color: C.blue, text: '내림(거리 ÷ 칸 폭) → 가운데 값으로 decode · 오차 ≤ 칸 폭 ÷ 2', at: 4.4 },
    { tag: S(2), color: C.purple, text: 'FiLM 은 channel 마다 γx + β · token 486 → 48 개 · 계산 한 번 15 ms', at: 8.4 },
    { tag: S(3), color: C.orange, text: '처음 보는 지시 76% · 양보다 다양성 · 시연에 없는 동작은 못 한다', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            policy 가 action 을 숫자 하나 대신 무엇으로 내야 갈린 시연을 평균으로 뭉개지 않을까?
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

const S = (i: number) => script.sections[i]

function Outro() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · IMITATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>RT-2 → OpenVLA</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            RT-1 의 action token 을 vision-language model 의 vocabulary 에 넣어 글을 쓰듯 action 을 쓴다
          </Label>
        </Appear>
        <Appear at={2}>
          <Label color={C.muted} size={30}>
            칸 폭의 오차 없이 연속된 action 여러 step 을 한꺼번에 만드는 방법은 <span style={{ color: C.text, fontFamily: MONO }}>Diffusion Policy</span>
          </Label>
        </Appear>
        <Appear at={3} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/rt1 (RT-1 · FiLM · TokenLearner · Behavior Transformers 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Rt1() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        bins: Bins,
        'cross-entropy': CrossEntropy,
        'pause-ce': PauseCe,
        binning: Binning,
        k256: K256,
        'pause-bin': PauseBin,
        film: Film,
        tokens: Tokens,
        'pause-film': PauseFilm,
        data: Data,
        diversity: Diversity,
        'pause-limit': PauseLimit,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
