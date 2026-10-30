import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './ddpm.narration.json'
import { script } from './ddpm.script'

// Numbers follow lessons/ddpm/README.md (see ddpm.script.ts). The box-avoidance drawing, the bell curves' heights and the
// T = 1000 sampling paths are schematic (marked 모식도 where it matters); every number on screen is the lesson's.

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

function Box({ x, y, w, h, title, color = C.cardEdge, at, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap: 14 }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

/** boxes joined by arrows; each box fades in at its own time */
function Flow({ steps, color, at, gap = 0.5, times, mono = false }: { steps: ReactNode[]; color: string; at: number; gap?: number; times?: number[]; mono?: boolean }) {
  const t = useSec()
  const when = (i: number) => times?.[i] ?? at + i * gap
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: mono ? MONO : undefined, opacity: prog(t, when(i)) }}>
            {s}
          </div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, when(i + 1) - 0.2) }}>→</span>}
        </div>
      ))}
    </div>
  )
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, lineHeight: 1.45, whiteSpace: 'nowrap' })

/** a letter with a subscript, e.g. x₀ */
const Sub = ({ v, s }: { v: ReactNode; s: ReactNode }) => (
  <span>
    {v}
    <sub style={{ fontSize: '0.62em' }}>{s}</sub>
  </span>
)
/** ᾱ drawn as α with an overline (the precomposed letter is missing from the fonts) */
const AB = ({ s }: { s?: ReactNode }) => (
  <span>
    <span style={{ textDecoration: 'overline', fontFamily: SANS }}>α</span>
    {s !== undefined && <sub style={{ fontSize: '0.62em' }}>{s}</sub>}
  </span>
)

interface Row {
  label: ReactNode
  cells: string[]
  color?: string
  at: number
}

/** a small table: a label column and number columns; `hi` lights one number column from `hiAt` */
function Table({ rows, labelW, cellW, size = 26, hi, hiAt = 0, header }: { rows: Row[]; labelW: number; cellW: number; size?: number; hi?: number; hiAt?: number; header?: Row }) {
  const t = useSec()
  const all = header ? [header, ...rows] : rows
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {all.map((r, ri) => (
        <div key={ri} style={{ display: 'flex', alignItems: 'center', opacity: prog(t, r.at) }}>
          <span style={{ width: labelW, fontSize: size - 2, color: ri === 0 && header ? C.dim : C.muted, whiteSpace: 'nowrap' }}>{r.label}</span>
          {r.cells.map((c, ci) => (
            <span
              key={ci}
              style={{
                width: cellW,
                textAlign: 'center',
                fontFamily: MONO,
                fontSize: size,
                fontWeight: ri === 0 && header ? 400 : 600,
                color: ri === 0 && header ? C.dim : (r.color ?? C.text),
                lineHeight: 1.45,
                borderRadius: 8,
                background: hi === ci ? `${C.accent}${Math.round(prog(t, hiAt) * 0x22).toString(16).padStart(2, '0')}` : 'transparent',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** polyline through points, drawn from the left as `p` goes 0 → 1 */
function Path({ pts, color, p, dash, width = 4 }: { pts: [number, number][]; color: string; p: number; dash?: string; width?: number }) {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  if (dash) return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={p} strokeLinejoin="round" />
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinejoin="round" strokeLinecap="round" />
}

const gauss = (v: number, m: number, s: number) => Math.exp(-((v - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))

/** a bell curve as an SVG path: x(v) maps value to px, height in px per unit density */
function bell(m: number, s: number, x: (v: number) => number, base: number, scale: number, from: number, to: number) {
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const v = from + ((to - from) * i) / 120
    pts.push(`${i ? 'L' : 'M'}${x(v).toFixed(1)} ${(base - gauss(v, m, s) * scale).toFixed(1)}`)
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
            GENERATIVE · DDPM
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>DDPM</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={{ color: C.accent }}>Denoising</span> Diffusion Probabilistic Model
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            무작위 숫자에서 noise 를 조금씩 걷어 내 sample 을 만드는 생성 모델
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 1700 }}>
          {script.sections.map((c, i) => (
            <Appear key={c} at={4.4 + i * 0.45}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 28, transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 4.4 - i * 0.45) * 2)})` }}>
                <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>{i + 1}</span>
                <span>{c}</span>
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
      <Panel x={64} y={140} w={900} h={580}>
        <svg width={900} height={580}>
          <text x={30} y={46} fill={C.dim} fontSize={22} opacity={prog(t, 0.3)}>
            시연을 반반 모은 데이터 (모식도)
          </text>
          <circle cx={450} cy={90} r={12} fill={C.accent} opacity={prog(t, 0.3)} />
          <text x={474} y={98} fill={C.accent} fontSize={24} opacity={prog(t, 0.3)}>
            목표
          </text>
          <rect x={370} y={240} width={160} height={100} rx={10} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2} opacity={prog(t, 0.3)} />
          <text x={450} y={298} textAnchor="middle" fill={C.orange} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            상자
          </text>
          <circle cx={450} cy={500} r={12} fill={C.text} opacity={prog(t, 0.3)} />
          <path d="M450 500 C 200 430, 200 170, 450 90" fill="none" stroke={C.blue} strokeWidth={5} strokeDasharray={700} strokeDashoffset={700 * (1 - prog(t, 0.7, 1))} />
          <path d="M450 500 C 700 430, 700 170, 450 90" fill="none" stroke={C.green} strokeWidth={5} strokeDasharray={700} strokeDashoffset={700 * (1 - prog(t, 1.3, 1))} />
          <text x={235} y={300} textAnchor="end" fill={C.blue} fontSize={24} opacity={prog(t, 1.2)}>
            왼쪽 시연 절반
          </text>
          <text x={665} y={300} textAnchor="start" fill={C.green} fontSize={24} opacity={prog(t, 1.8)}>
            오른쪽 시연 절반
          </text>
          <line x1={450} y1={488} x2={450} y2={488 - 146 * prog(t, 2.4, 0.8)} stroke={C.red} strokeWidth={5} strokeDasharray="12 8" />
          <circle cx={450} cy={342} r={16} fill="none" stroke={C.red} strokeWidth={3} opacity={prog(t, 3.2)} />
          <text x={450} y={548} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600} opacity={prog(t, 3)}>
            MSE policy = 평균인 가운데 길 → 부딪힘
          </text>
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: 1010, top: 160, width: 846, display: 'grid', gap: 26 }}>
        <Chip at={3.2} color={C.red}>
          MSE → 두 길의 평균
        </Chip>
        <Chip at={3.6} color={C.orange}>
          VAE → sample 일부가 두 길 사이로 번짐
        </Chip>
        <Appear at={4.5}>
          <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.35, marginTop: 30 }}>
            정답이 둘로 갈라진 데이터에서 <span style={{ color: C.accent }}>평균 대신 한 길을 또렷하게</span> 뽑으려면?
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- forward process ----------

const RUN1 = [2, 1.9, 0.92, 0.86, 1.59, 0.97]
const RUN2 = [2, 1.3, 0.32, 0.5, -0.2, 0.02]
const SHRINK = [2, 1.6, 1.28, 1.024, 0.8192, 0.66]

function Forward() {
  const t = useSec()
  const xs = (i: number) => 90 + i * 130
  const ys = (v: number) => 380 - ((v + 0.5) / 2.7) * 300
  const pts = (a: number[]): [number, number][] => a.map((v, i) => [xs(i), ys(v)])
  const rows: Row[] = [
    { label: '1', cells: ['2', '1.6', '0.5', '0.3', '1.9'], at: 6.5 },
    { label: '2', cells: ['1.9', '1.52', '−1', '−0.6', '0.92'], at: 9.6 },
    { label: '3', cells: ['0.92', '0.74', '0.2', '0.12', '0.86'], at: 10.8 },
    { label: '4', cells: ['0.86', '0.69', '1.5', '0.9', '1.59'], at: 11.4 },
    { label: '5', cells: ['1.59', '1.27', '−0.5', '−0.3', '0.97'], at: 12 },
  ]
  return (
    <AbsoluteFill>
      <Box
        x={64}
        y={140}
        w={900}
        h={440}
        at={0.4}
        title={
          <Head color={C.accent}>
            <Sub v="x" s="0" /> = 2 · 0.8 을 곱하고 0.6 × ε 을 더한다
          </Head>
        }
      >
        <Table
          labelW={110}
          cellW={146}
          header={{ label: 'step t', cells: ['지금 값', '× 0.8', 'ε', '0.6 × ε', '새 값'], at: 1.2 }}
          rows={rows}
        />
      </Box>
      <Panel x={996} y={140} w={860} h={440} style={{ opacity: prog(t, 6.5) }}>
        <svg width={860} height={440}>
          {[
            ['실행 1', C.blue, 40, false],
            ['실행 2', C.purple, 230, false],
            ['0.8 만 곱한 값', C.muted, 420, true],
          ].map(([l, c, x, d]) => (
            <g key={l as string}>
              <line x1={x as number} x2={(x as number) + 34} y1={36} y2={36} stroke={c as string} strokeWidth={4} strokeDasharray={d ? '6 6' : undefined} />
              <text x={(x as number) + 46} y={44} fill={c as string} fontSize={22}>
                {l as string}
              </text>
            </g>
          ))}
          <line x1={xs(0)} x2={xs(5)} y1={ys(0)} y2={ys(0)} stroke={C.cardEdge} strokeWidth={2} />
          <text x={70} y={ys(0) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={70} y={ys(2) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            2
          </text>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <text key={i} x={xs(i)} y={420} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {i}
            </text>
          ))}
          <text x={800} y={420} fill={C.dim} fontSize={20}>
            t
          </text>
          <Path pts={pts(SHRINK)} color={C.muted} p={prog(t, 12.8)} dash="6 6" width={3} />
          <Path pts={pts(RUN1)} color={C.blue} p={prog(t, 6.8, 5.4)} />
          <Path pts={pts(RUN2)} color={C.purple} p={prog(t, 12.2, 1.2)} />
          <g fontFamily={MONO} fontSize={22} fontWeight={600}>
            <text x={752} y={ys(0.97) + 7} fill={C.blue} opacity={prog(t, 12)}>
              0.97
            </text>
            <text x={752} y={ys(0.66) + 7} fill={C.muted} opacity={prog(t, 13.4)}>
              0.66
            </text>
            <text x={752} y={ys(0.02) + 7} fill={C.purple} opacity={prog(t, 13.2)}>
              0.02
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={610} w={581} h={250} at={12.6} color={`${C.blue}88`} title={<Head color={C.blue}>원래 값의 몫</Head>}>
        <span style={mono(C.text, 26)}>
          다섯 step 뒤 2 × 0.8<sup>5</sup> ≈ 0.66
        </span>
        <span style={mono(C.text, 26)}>
          스무 step 뒤 2 × 0.8<sup>20</sup> ≈ 0.023
        </span>
      </Box>
      <Box x={669} y={610} w={581} h={250} at={18.6} color={`${C.red}88`} title={<Head color={C.red}>곱하지 않고 더하기만 하면</Head>}>
        <span style={line(C.text, 26)}>가운데가 언제까지나 2 에 머문다</span>
        <span style={mono(C.text, 26)}>분산 0.36 × 100 = 36</span>
      </Box>
      <Box x={1274} y={610} w={582} h={250} at={24.4} color={`${C.green}88`} title={<Head color={C.green}>분산 1 을 지키는 계수</Head>}>
        <span style={mono(C.text, 24)}>
          <Sub v="x" s="t" /> = √(1 − β)·<Sub v="x" s="t−1" /> + √β·ε
        </span>
        <span style={mono(C.text, 24)}>β = 0.36 → 0.8 과 0.6</span>
        <span style={mono(C.green, 24)}>0.64 + 0.36 = 1</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- noise schedule ----------

function Schedule() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1000} h={410} at={0.4} title={<Head color={C.accent}>T = 5 schedule (손 계산용)</Head>}>
        <Table
          labelW={340}
          cellW={110}
          hi={2}
          hiAt={13.4}
          header={{ label: 'step t', cells: ['1', '2', '3', '4', '5'], at: 0.6 }}
          rows={[
            { label: 'β · 더하는 noise 의 분산', cells: ['0.1', '0.2', '0.3', '0.4', '0.5'], at: 1.2, color: C.orange },
            { label: 'α = 1 − β', cells: ['0.9', '0.8', '0.7', '0.6', '0.5'], at: 6.7 },
            {
              label: (
                <span>
                  <AB /> · α 를 차례로 곱함
                </span>
              ),
              cells: ['0.9', '0.72', '0.504', '0.3024', '0.1512'],
              at: 8,
              color: C.purple,
            },
            {
              label: (
                <span>
                  √<AB /> · 원래 값에 곱함
                </span>
              ),
              cells: ['0.95', '0.85', '0.71', '0.55', '0.39'],
              at: 13.2,
              color: C.blue,
            },
            {
              label: (
                <span>
                  √(1 − <AB />) · noise 에 곱함
                </span>
              ),
              cells: ['0.32', '0.53', '0.70', '0.84', '0.92'],
              at: 13.6,
              color: C.green,
            },
          ]}
        />
      </Box>
      <Box x={1096} y={140} w={760} h={410} at={13} title={<Head color={C.accent}>한 번에 건너뛰는 식</Head>}>
        <span style={mono(C.text, 28)}>
          <Sub v="x" s="t" /> = √<AB s="t" />·<Sub v="x" s="0" /> + √(1 − <AB s="t" />)·ε
        </span>
        <span style={{ ...mono(C.muted, 26), opacity: prog(t, 14.4) }}>
          t = 3 · <Sub v="x" s="0" /> = 2 · ε = 0.5
        </span>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 15.4) }}>
          <Sub v="x" s="3" /> = 0.71 × 2 + 0.70 × 0.5
        </span>
        <span style={{ ...mono(C.accent, 26), opacity: prog(t, 16.4) }}>= 1.42 + 0.35 = 1.77</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 17.5) }}>step 을 차례로 밟지 않아도 된다</span>
      </Box>
      <Box x={64} y={580} w={1792} h={300} at={20} title={<Head color={C.accent}>T = 1000 · 원래 값에 곱하는 수</Head>}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'start' }}>
          <Table
            labelW={200}
            cellW={130}
            hi={2}
            hiAt={21.6}
            header={{ label: 't', cells: ['100', '250', '500', '750', '1000'], at: 20.2 }}
            rows={[
              { label: 'linear', cells: ['0.947', '0.724', '0.280', '0.058', '0.006'], at: 20.6, color: C.blue },
              { label: 'cosine', cells: ['0.986', '0.920', '0.703', '0.380', '0.000'], at: 21.2, color: C.green },
            ]}
          />
          <div style={{ display: 'grid', gap: 12 }}>
            <span style={{ ...line(C.blue, 24), opacity: prog(t, 22), whiteSpace: 'nowrap' }}>Ho 등 · linear · β 0.0001 → 0.02</span>
            <span style={{ ...line(C.green, 24), opacity: prog(t, 23), whiteSpace: 'nowrap' }}>Nichol · Dhariwal · 더 천천히 지우는 cosine</span>
            <span style={{ ...line(C.muted, 24), opacity: prog(t, 24), whiteSpace: 'nowrap' }}>Diffusion Policy · cosine · T = 100</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the network and its loss ----------

function Network() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={190} at={0.4} title={<Head color={C.accent}>섞인 noise 를 알면 원래 값이 계산된다 (t = 3)</Head>}>
        <Flow
          mono
          color={C.blue}
          at={0.8}
          gap={1}
          steps={[
            <span key="a">
              <Sub v="x" s="3" /> = 1.77
            </span>,
            '− 0.70 × 0.5 = 0.35',
            '1.42',
            '÷ 0.71',
            <span key="b">
              <Sub v="x" s="0" /> = 2.00
            </span>,
          ]}
        />
      </Box>
      <Box x={64} y={360} w={880} h={250} at={6.6} title={<Head color={C.accent}>network 가 맞히는 것</Head>}>
        <Flow color={C.purple} at={7} gap={0.8} steps={['섞인 값 · step 번호 t', 'network', '맞힌 noise']} />
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 9.5), whiteSpace: 'nowrap' }}>
          아는 것: 섞인 값과 t · 모르는 것: <span style={{ color: C.orange }}>ε 하나</span>
        </span>
      </Box>
      <Box x={976} y={360} w={880} h={250} at={13.2} title={<Head color={C.accent}>같은 1.42 라도 t 가 다르면</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 13.8) }}>
          t = 3: 1.42 = 0.71 × 2 + 0.70 × ε → <span style={{ color: C.green }}>ε = 0</span>
        </span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 15.6) }}>
          t = 1: 1.42 = 0.95 × 2 + 0.32 × ε → <span style={{ color: C.orange }}>ε = −1.5</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.4) }}>그래서 network 는 t 를 함께 받는다</span>
      </Box>
      <Box x={64} y={640} w={1792} h={240} at={20.2} title={<Head color={C.accent}>학습 한 번 (Ho 등의 Algorithm 1)</Head>}>
        <Flow
          color={C.green}
          at={20.5}
          gap={0.6}
          steps={[
            <span key="1">
              ① 데이터에서 <Sub v="x" s="0" />
            </span>,
            '② t 를 무작위로',
            '③ ε 을 뽑아 섞기',
            '④ noise 맞히기',
            '⑤ 차이를 제곱 → 조금 고치기',
          ]}
        />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24), whiteSpace: 'nowrap' }}>
          예: <span style={{ fontFamily: MONO }}>
            <Sub v="x" s="0" /> = 2 · t = 3 · ε = 0.5 → 1.77
          </span> · network 가 0.3 을 내면 loss{' '}
          <span style={{ fontFamily: MONO, color: C.green, fontWeight: 600 }}>(0.5 − 0.3)² = 0.04</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the reverse step ----------

const RUN_A = [0.6, 0.89, 1.08, 1.65, 1.97, 2.0]
const RUN_B = [-0.4, -0.73, -0.88, -1.33, -1.83, -2.0]

function Reverse() {
  const t = useSec()
  const xs = (i: number) => 300 + i * 268 // i = 0 is t = 5
  const ys = (v: number) => 104 - v * 38
  const pts = (a: number[]): [number, number][] => a.map((v, i) => [xs(i), ys(v)])
  return (
    <AbsoluteFill>
      <Box
        x={64}
        y={140}
        w={1000}
        h={280}
        at={0.4}
        title={
          <Head color={C.accent} size={26}>
            <Sub v="x" s="t−1" /> = (<Sub v="x" s="t" /> − 계수 × 맞힌 noise) × 1/√<Sub v="α" s="t" /> + <Sub v="σ" s="t" /> z
          </Head>
        }
      >
        <Table
          labelW={340}
          cellW={110}
          size={24}
          hi={4}
          hiAt={6.8}
          header={{ label: 'step t', cells: ['1', '2', '3', '4', '5'], at: 0.8 }}
          rows={[
            { label: '빼는 noise 의 계수', cells: ['0.32', '0.38', '0.43', '0.48', '0.54'], at: 1.4, color: C.orange },
            { label: '나눠 되돌리는 수 1/√α', cells: ['1.05', '1.12', '1.20', '1.29', '1.41'], at: 2.2, color: C.blue },
            { label: '새 noise 의 크기 σ', cells: ['0.32', '0.45', '0.55', '0.63', '0.71'], at: 3, color: C.purple },
          ]}
        />
      </Box>
      <Box x={1096} y={140} w={760} h={280} at={18.6} title={<Head color={C.accent}>+ 쪽 sample 의 표준편차 (2 만 개)</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Bar label="z 를 더함" value={0.5} max={0.6} color={C.green} at={19} width={300} fmt="0.50" labelW={170} />
          <Bar label="z 를 뺌" value={0.14} max={0.6} color={C.red} at={20} width={300} fmt="0.14" labelW={170} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.2), whiteSpace: 'nowrap' }}>평균: 더하면 2.00 · 빼면 1.45 로 안쪽에 몰림</span>
      </Box>
      <Box x={64} y={450} w={1792} h={180} at={6.6} title={<Head color={C.accent}>실행 A 의 step 5 → 4</Head>}>
        <Flow
          mono
          color={C.blue}
          at={6.8}
          times={[6.8, 7.8, 9.2, 10.8, 13, 15]}
          steps={[
            <span key="a">
              <Sub v="x" s="5" /> = 0.60
            </span>,
            '− 0.54 × 0.23 = 0.12',
            '0.48',
            '× 1.41 = 0.68',
            '+ 0.71 × 0.3 = 0.21',
            <span key="b">
              <Sub v="x" s="4" /> = 0.89
            </span>,
          ]}
        />
      </Box>
      <Panel x={64} y={660} w={1792} h={220} style={{ opacity: prog(t, 24.6) }}>
        <svg width={1792} height={220}>
          <line x1={xs(0)} x2={xs(5)} y1={ys(0)} y2={ys(0)} stroke={C.cardEdge} strokeWidth={2} />
          <text x={40} y={60} fill={C.green} fontSize={24} fontWeight={600}>
            실행 A
          </text>
          <text x={40} y={170} fill={C.orange} fontSize={24} fontWeight={600}>
            실행 B
          </text>
          {[5, 4, 3, 2, 1, 0].map((s, i) => (
            <text key={s} x={xs(i)} y={212} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              t = {s}
            </text>
          ))}
          <Path pts={pts(RUN_A)} color={C.green} p={prog(t, 24.8, 2.4)} />
          <Path pts={pts(RUN_B)} color={C.orange} p={prog(t, 25.4, 2.4)} />
          <g fontFamily={MONO} fontSize={20} fontWeight={600}>
            <text x={285} y={ys(0.6) + 7} textAnchor="end" fill={C.green} opacity={prog(t, 24.8)}>
              0.60
            </text>
            <text x={285} y={ys(-0.4) + 7} textAnchor="end" fill={C.orange} opacity={prog(t, 25.4)}>
              −0.40
            </text>
            <text x={1655} y={ys(2) + 7} fill={C.green} opacity={prog(t, 27.2)}>
              2.00
            </text>
            <text x={1655} y={ys(-2) + 7} fill={C.orange} opacity={prog(t, 27.8)}>
              −2.00
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- step count and sampling time ----------

function Time() {
  const t = useSec()
  const call = (c: string, on: number) => <span style={{ display: 'inline-block', width: 30, height: 30, borderRadius: 6, background: `${c}55`, border: `1.5px solid ${c}`, opacity: on }} />
  const xl = (v: number) => 230 + v * 60 // small-step plot
  const xr = (v: number) => 660 + v * 55 // big-step plot, −2 … +2 → 550 … 770
  const base = 280
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.4} title={<Head color={C.accent}>network 를 쓰는 횟수</Head>}>
        <span style={line(C.muted, 24)}>학습 · 예 하나에</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {call(C.green, prog(t, 1))}
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 1.2) }}>× 1</span>
        </div>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 2.6) }}>sampling · sample 하나에 t = T 부터 1 까지</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i}>{call(C.orange, prog(t, 3 + i * 0.12, 0.3))}</span>
          ))}
          <span style={{ ...mono(C.orange, 24), marginLeft: 8, opacity: prog(t, 4.8) }}>… × T</span>
        </div>
      </Box>
      <Box x={976} y={140} w={880} h={330} at={6.4} title={<Head color={C.accent}>DDIM 논문 · 32 × 32 그림 5 만 장 (2080 Ti)</Head>}>
        <div style={{ display: 'grid', gap: 18, marginTop: 10 }}>
          <Bar label="DDPM" value={1200} max={1200} color={C.red} at={7} width={380} fmt="약 20 시간" labelW={120} />
          <Bar label="GAN" value={1} max={1200} color={C.green} at={9.6} width={380} fmt="1 분 미만" labelW={120} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>로봇은 sampling 이 끝나야 action 을 받는다</span>
      </Box>
      <Box x={64} y={500} w={880} h={380} at={12.9} title={<Head color={C.accent}>network 한 번에 0.01 초라면 (예)</Head>}>
        <div style={{ display: 'grid', gap: 18, marginTop: 6 }}>
          <Bar label="T = 1000" value={10} max={10} color={C.red} at={13.3} width={380} fmt="10 초" labelW={170} />
          <Bar label="T = 100" value={1} max={10} color={C.orange} at={14.8} width={380} fmt="1 초" labelW={170} />
          <Bar label="명령 간격" value={0.1} max={10} color={C.green} at={16.4} width={380} fmt="0.1 초" labelW={170} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.4) }}>Diffusion Policy 실물 실험은 0.1 초마다 명령을 보냈다</span>
      </Box>
      <Panel x={976} y={500} w={880} h={380} style={{ opacity: prog(t, 19.4) }}>
        <svg width={880} height={380}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            한 번의 변화가 크면 직전 값이 갈라진다
          </text>
          <text x={30} y={80} fill={C.dim} fontSize={20}>
            데이터 −2 와 +2 · x 를 보고 짐작한 직전 값의 범위 (모식도)
          </text>
          <line x1={60} x2={400} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
          <path d={bell(0, 0.42, xl, base, 130 * 0.42 * Math.sqrt(2 * Math.PI), -2.8, 2.8)} fill={`${C.green}22`} stroke={C.green} strokeWidth={3} opacity={prog(t, 19.8)} />
          <text x={xl(0)} y={134} textAnchor="middle" fill={C.green} fontSize={22} opacity={prog(t, 20.2)}>
            표준편차 ≈ 0.13
          </text>
          <text x={xl(0)} y={318} textAnchor="middle" fill={C.text} fontSize={22} opacity={prog(t, 19.8)}>
            작은 step · β = 0.018
          </text>
          <line x1={480} x2={840} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
          <path d={bell(-2, 0.75, xr, base, 116 * 0.75 * Math.sqrt(2 * Math.PI), -3.6, -0.1)} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={3} opacity={prog(t, 21)} />
          <path d={bell(2, 0.75, xr, base, 160 * 0.75 * Math.sqrt(2 * Math.PI), 0.1, 3.2)} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={3} opacity={prog(t, 21)} />
          <text x={xr(-2)} y={150} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} opacity={prog(t, 21.6)}>
            −2 쪽 0.42
          </text>
          <text x={xr(2)} y={106} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} opacity={prog(t, 21.6)}>
            +2 쪽 0.58
          </text>
          <line x1={xr(0)} x2={xr(0)} y1={base} y2={190} stroke={C.red} strokeWidth={3} strokeDasharray="6 6" opacity={prog(t, 23)} />
          <text x={xr(0)} y={318} textAnchor="middle" fill={C.text} fontSize={22} opacity={prog(t, 21)}>
            큰 step · β = 0.87
          </text>
          <text x={xr(0)} y={352} textAnchor="middle" fill={C.red} fontSize={20} opacity={prog(t, 23)}>
            종 하나로 맞히면 가운데가 두 무리 사이
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- DDIM ----------

function Ddim() {
  const t = useSec()
  const xs = (s: number) => 120 + (5 - s) * 128
  const ys = (v: number) => 360 - ((v + 0.2) / 2.4) * 290
  const ddpm: [number, number][] = RUN_A.map((v, i) => [xs(5 - i), ys(v)])
  const ddim: [number, number][] = [
    [xs(5), ys(0.6)],
    [xs(2), ys(0.97)],
    [xs(0), ys(2)],
  ]
  const jump: [number, number][] = [
    [xs(5), ys(0.6)],
    [xs(0), ys(1)],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={300} at={0.4} title={<Head color={C.accent}>DDIM 의 한 번 건너뛰기 (같은 network)</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 1) }}>
          ① 추정 = (<Sub v="x" s="t" /> − √(1 − <AB s="t" />)·맞힌 ε) ÷ √<AB s="t" />
        </span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 3) }}>
          ② <Sub v="x" s="s" /> = √<AB s="s" />·추정 + √(1 − <AB s="s" />)·맞힌 ε
        </span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 4.6) }}>새 noise z 는 더하지 않는다 → 같은 출발점이면 같은 sample</span>
      </Box>
      <Box
        x={956}
        y={140}
        w={900}
        h={300}
        at={6.6}
        title={
          <Head color={C.accent}>
            <Sub v="x" s="5" /> = 0.60 에서 두 번 건너뛰기
          </Head>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: 10, alignItems: 'baseline' }}>
          <span style={{ ...mono(C.accent, 22), opacity: prog(t, 6.8) }}>5 → 2</span>
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 6.8) }}>추정 (0.60 − 0.92 × 0.23) ÷ 0.39 ≈ 1.00</span>
          <span />
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 8.4) }}>다음 값 0.85 × 1.00 + 0.53 × 0.23 ≈ 0.97</span>
          <span style={{ ...mono(C.accent, 22), opacity: prog(t, 10) }}>2 → 0</span>
          <span style={{ ...mono(C.text, 22), opacity: prog(t, 10) }}>추정 (0.97 + 0.53 × 1.37) ÷ 0.85 ≈ 2.00</span>
          <span />
          <span style={{ ...mono(C.green, 22), opacity: prog(t, 11.4) }}>
            <AB s="0" /> = 1 이라 추정 그대로 2.00 · network 2 번
          </span>
        </div>
      </Box>
      <Panel x={64} y={470} w={860} h={410} style={{ opacity: prog(t, 6.8) }}>
        <svg width={860} height={410}>
          {[
            ['DDPM 5 step', C.blue, 30, false],
            ['DDIM 2 번', C.green, 300, false],
            ['한 번에', C.red, 560, true],
          ].map(([l, c, x, d]) => (
            <g key={l as string} opacity={l === '한 번에' ? prog(t, 13.2) : 1}>
              <line x1={x as number} x2={(x as number) + 34} y1={36} y2={36} stroke={c as string} strokeWidth={4} strokeDasharray={d ? '8 6' : undefined} />
              <text x={(x as number) + 46} y={44} fill={c as string} fontSize={22}>
                {l as string}
              </text>
            </g>
          ))}
          <line x1={xs(5)} x2={xs(0)} y1={ys(0)} y2={ys(0)} stroke={C.cardEdge} strokeWidth={2} />
          {[5, 4, 3, 2, 1, 0].map((s) => (
            <text key={s} x={xs(s)} y={392} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              t = {s}
            </text>
          ))}
          <Path pts={ddpm} color={C.blue} p={prog(t, 7.2, 1.4)} width={3} />
          <Path pts={ddim} color={C.green} p={prog(t, 8.4, 3)} width={5} />
          <Path pts={jump} color={C.red} p={prog(t, 13.2)} dash="10 8" width={4} />
          {ddim.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={7} fill={C.green} opacity={prog(t, 8.4 + i * 1.4)} />
          ))}
          <circle cx={xs(0)} cy={ys(1)} r={8} fill="none" stroke={C.red} strokeWidth={3} opacity={prog(t, 14)} />
          <g fontFamily={MONO} fontSize={22} fontWeight={600}>
            <text x={105} y={ys(0.6) + 7} textAnchor="end" fill={C.text} opacity={prog(t, 7.2)}>
              0.60
            </text>
            <text x={494} y={200} textAnchor="end" fill={C.green} opacity={prog(t, 9.6)}>
              0.97
            </text>
            <text x={775} y={ys(2) + 7} fill={C.green} opacity={prog(t, 11.4)}>
              2.00
            </text>
            <text x={775} y={ys(1) + 7} fill={C.red} opacity={prog(t, 14)}>
              1.00
            </text>
          </g>
          <text x={300} y={300} fill={C.red} fontSize={22} opacity={prog(t, 15)}>
            1.00 = 두 봉우리의 평균 · 데이터에 없음
          </text>
        </svg>
      </Panel>
      <Box x={956} y={470} w={900} h={410} at={20} title={<Head color={C.accent}>CIFAR-10 FID (낮을수록 실제 그림에 가깝다)</Head>}>
        <Table
          labelW={200}
          cellW={124}
          size={26}
          hi={3}
          hiAt={24}
          header={{ label: 'step 수', cells: ['10', '20', '50', '100', '1000'], at: 20.3 }}
          rows={[
            { label: 'DDIM', cells: ['13.36', '6.84', '4.67', '4.16', '4.04'], at: 20.8, color: C.green },
            { label: 'DDPM 식', cells: ['41.07', '18.36', '8.01', '5.78', '4.73'], at: 21.6, color: C.red },
          ]}
        />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24.2), marginTop: 10 }}>DDIM 은 20 ~ 100 step 으로 1000 step 과 비슷한 품질</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 25.4) }}>저자들: 원래 DDPM 보다 10 ~ 50 배 빠르다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- two modes ----------

/** one panel of the two-mode explanation: the two bells at step t and the lines under them */
function Bells({ x, at, title, m, s, scale, lines }: { x: number; at: number; title: ReactNode; m: number; s: number; scale: number; lines: [ReactNode, number][] }) {
  const t = useSec()
  const xv = (v: number) => 412 + v * 112
  const base = 145
  return (
    <Panel x={x} y={140} w={880} h={420} style={{ opacity: prog(t, at) }}>
      <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
          <Head color={C.accent}>{title}</Head>
          <span style={{ fontSize: 20, color: C.blue, marginLeft: 'auto' }}>— +2 에서 온 값</span>
          <span style={{ fontSize: 20, color: C.orange }}>— −2 에서 온 값</span>
        </div>
        <svg width={824} height={165}>
          <line x1={20} x2={804} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
          <path d={bell(-m, s, xv, base, scale, -3.6, 3.6)} fill={`${C.orange}1a`} stroke={C.orange} strokeWidth={3} />
          <path d={bell(m, s, xv, base, scale, -3.6, 3.6)} fill={`${C.blue}1a`} stroke={C.blue} strokeWidth={3} />
          <line x1={xv(0.2)} x2={xv(0.2)} y1={base} y2={8} stroke={C.accent} strokeWidth={3} strokeDasharray="6 5" opacity={prog(t, at + 0.6)} />
          <circle cx={xv(0.2)} cy={base - gauss(0.2, m, s) * scale} r={7} fill={C.blue} opacity={prog(t, at + 1)} />
          <circle cx={xv(0.2)} cy={base - gauss(0.2, -m, s) * scale} r={7} fill={C.orange} opacity={prog(t, at + 1)} />
          <text x={xv(0.2) + 12} y={base + 18} fill={C.accent} fontSize={20} fontFamily={MONO} opacity={prog(t, at + 0.6)}>
            0.2
          </text>
        </svg>
        {lines.map(([l, a], i) => (
          <div key={i} style={{ opacity: prog(t, a) }}>
            {l}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Modes() {
  const t = useSec()
  // schematic T = 1000 paths: start near 0, wander, then commit to −2 or +2
  const X = (u: number) => 60 + u * 920
  const Y = (v: number) => 170 - v * 42
  const paths = Array.from({ length: 12 }, (_, k) => {
    const s = k % 2 ? 1 : -1
    const v0 = (((k * 0.37 + 0.11) % 1) - 0.5) * 1.6
    const pts: [number, number][] = []
    for (let i = 0; i <= 80; i++) {
      const u = i / 80
      const w = u ** 1.4 * u * (3 - 2 * u)
      const wig = 0.45 * Math.sin(9 * u + k * 1.3) + 0.3 * Math.sin(17 * u + k * 2.1)
      pts.push([X(u), Y((v0 + wig * (1 - u)) * (1 - w) + s * 2 * w)])
    }
    return { pts, color: s > 0 ? C.blue : C.orange }
  })
  return (
    <AbsoluteFill>
      <Bells
        x={64}
        at={0.4}
        title="t = 5 · 받은 값 0.2"
        m={0.78}
        s={0.92}
        scale={300}
        lines={[
          [
            <span style={line(C.text, 24)}>
              0.2 에서의 높이: <span style={{ color: C.blue, fontFamily: MONO }}>0.36</span> · <span style={{ color: C.orange, fontFamily: MONO }}>0.25</span>
            </span>,
            1.4,
          ],
          [<span style={mono(C.text, 24)}>+2 쪽 가능성 0.36 ÷ (0.36 + 0.25) ≈ 0.59</span>, 3],
          [<span style={mono(C.accent, 24)}>추정 0.59 × 2 + 0.41 × (−2) = 0.36</span>, 7],
        ]}
      />
      <Bells
        x={976}
        at={13.2}
        title="t = 2 · 같은 0.2"
        m={1.7}
        s={0.53}
        scale={170}
        lines={[
          [<span style={line(C.text, 24)}>noise 가 작아 두 분포가 떨어져 있다</span>, 14.4],
          [<span style={mono(C.blue, 24)}>+2 쪽 가능성 0.92</span>, 15.6],
          [<span style={mono(C.accent, 24)}>추정 1.68 · 한 봉우리 쪽으로</span>, 16.8],
        ]}
      />
      <Panel x={64} y={590} w={1100} h={290} style={{ opacity: prog(t, 19.6) }}>
        <svg width={1100} height={290}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            T = 1000 sampling 경로 (모식도)
          </text>
          <text x={X(0)} y={280} fill={C.dim} fontSize={20} fontFamily={MONO}>
            t = 1000
          </text>
          <text x={X(1)} y={280} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            t = 0
          </text>
          {paths.map((p, i) => (
            <Path key={i} pts={p.pts} color={p.color} p={prog(t, 19.8 + i * 0.15, 3.5)} width={2.5} />
          ))}
          <text x={995} y={Y(2) + 8} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 23)}>
            +2
          </text>
          <text x={995} y={Y(-2) + 8} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 23)}>
            −2
          </text>
        </svg>
      </Panel>
      <Box x={1196} y={590} w={660} h={290} at={25.6} title={<Head color={C.accent}>sample 4000 개가 끝난 곳</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="+2" value={51} max={60} color={C.blue} at={25.8} width={260} unit="%" labelW={140} />
          <Bar label="−2" value={49} max={60} color={C.orange} at={26.2} width={260} unit="%" labelW={140} />
          <Bar label="−1.5 ~ 1.5" value={0} max={60} color={C.red} at={26.6} width={260} fmt="0 개" labelW={140} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.2), whiteSpace: 'nowrap' }}>MSE 로 정답 하나를 배우면 언제나 0</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- VAE vs DDPM, Diffusion Policy ----------

function Policy() {
  const t = useSec()
  const xz = (z: number) => 110 + ((z + 2) / 4) * 680
  const yo = (o: number) => 190 - o * 45
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={340} style={{ opacity: prog(t, 0.4) }}>
        <svg width={860} height={340}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            예로 든 1 차원 VAE decoder
          </text>
          <rect x={xz(-0.25)} y={90} width={xz(0.25) - xz(-0.25)} height={210} fill={`${C.orange}22`} opacity={prog(t, 2)} />
          <line x1={xz(-2)} x2={xz(2)} y1={300} y2={300} stroke={C.cardEdge} strokeWidth={2} />
          <Path
            pts={[
              [xz(-2), yo(-2)],
              [xz(-0.25), yo(-2)],
              [xz(0.25), yo(2)],
              [xz(2), yo(2)],
            ]}
            color={C.purple}
            p={prog(t, 0.8, 1.2)}
          />
          <text x={xz(0)} y={80} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600} opacity={prog(t, 2.4)}>
            약 20%
          </text>
          <text x={120} y={266} fill={C.muted} fontSize={22} opacity={prog(t, 1.2)}>
            출력 −2
          </text>
          <text x={780} y={86} textAnchor="end" fill={C.muted} fontSize={22} opacity={prog(t, 1.8)}>
            출력 +2
          </text>
          <g fontFamily={MONO} fontSize={20} fill={C.dim}>
            <text x={xz(-0.25) - 6} y={326} textAnchor="end">
              −0.25
            </text>
            <text x={xz(0.25) + 6} y={326}>
              0.25
            </text>
            <text x={xz(2)} y={326} textAnchor="end">
              z
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={340} at={6.6} title={<Head color={C.accent}>봉우리 8 개 · 0.3 넘게 벗어난 sample</Head>}>
        <div style={{ display: 'grid', gap: 16, marginTop: 6 }}>
          <Bar label="데이터" value={1} max={25} color={C.muted} at={7} width={380} fmt="약 1%" labelW={130} />
          <Bar label="VAE" value={22} max={25} color={C.red} at={8.2} width={380} fmt="22%" labelW={130} />
          <Bar label="DDPM" value={2} max={25} color={C.green} at={9.4} width={380} fmt="2%" labelW={130} />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.8), whiteSpace: 'nowrap' }}>DDPM 은 봉우리마다 11 ~ 15% · 고르게 나뉘면 12.5%</span>
      </Box>
      <Box x={64} y={510} w={1792} h={180} at={13.2} title={<Head color={C.accent}>Diffusion Policy · PushT</Head>}>
        <Flow
          color={C.blue}
          at={13.4}
          times={[13.4, 14.4, 15.4, 16.6, 18]}
          steps={['관측 2 개 (조건)', 'noise 16 × 2', 'noise 를 걷어 내는 step 을 T 번', 'action chunk: 손끝 위치 16 개 = 숫자 32 개', '앞 8 개 실행 → 다시 만든다']}
        />
      </Box>
      <Box x={64} y={720} w={880} h={160} at={19.6} title={<Head color={C.accent}>PushT: 블록의 왼쪽 · 오른쪽으로 돌기</Head>}>
        <span style={{ ...line(C.text, 24), whiteSpace: 'nowrap' }}>두 방식 모두 배움 → 한 실행 안에서는 한쪽만</span>
      </Box>
      <Box x={976} y={720} w={880} h={160} at={25.6} title={<Head color={C.accent}>실물 로봇 (논문 본문)</Head>}>
        <span style={{ ...line(C.text, 24), whiteSpace: 'nowrap' }}>
          DDIM 10 step · RTX 3080 에서 0.1 초 · <span style={{ color: C.muted }}>부록 표 7 은 16 step</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    {
      tag: script.sections[0],
      color: C.accent,
      text: (
        <span>
          <Sub v="x" s="t" /> = √<AB s="t" />·<Sub v="x" s="0" /> + √(1 − <AB s="t" />)·ε · 정답 noise 는 직접 뽑은 값
        </span>
      ),
      at: 0.6,
    },
    { tag: script.sections[1], color: C.blue, text: '섞인 noise 를 맞히고, 이번 step 의 몫을 빼고 새 noise 를 더하기를 T 번', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: '10 step FID 13.36 vs 41.07 · 20 ~ 100 step 으로 1000 step 에 가깝다', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'sample 4000 개 중 −1.5 ~ 1.5 에서 끝난 것 0 개 · 51% / 49%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            정답이 둘로 갈라진 데이터에서 평균 대신 한 길을 또렷하게 뽑으려면?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={i} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 34, fontWeight: 600 }}>{it.text}</span>
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
            NEXT · GENERATIVE
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Flow Matching · Diffusion Policy</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            경로를 곧게 학습해 몇 step 만에 sample 만들기 · 관측을 조건으로 action chunk 만들기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Ho, Jain, Abbeel (2020) · Song, Meng, Ermon (2020)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseForward = () => (
  <PauseWrite
    question="β = 0.64 인 step 에서 직전 값이 2 이고 ε = 0.5 가 뽑혔다. 새 값은?"
    answer="√(1 − 0.64) = √0.36 = 0.6 · √0.64 = 0.8 → 0.6 × 2 + 0.8 × 0.5 = 1.2 + 0.4 = 1.6"
  />
)

const PauseReverse = () => (
  <PauseWrite
    question="T = 5 schedule 의 step 2 에서 값이 1.0 이고 network 가 0.5 를 냈다. 새 noise 를 더하기 전의 값은?"
    answer="빼는 noise 의 계수 0.38 → 1.0 − 0.38 × 0.5 = 0.81 → 0.81 × 1.12 ≈ 0.91 · 여기에 0.45 × z 를 더하면 다음 값"
  />
)

const PauseTime = () => (
  <PauseWrite
    question="network 한 번에 0.02 초가 걸린다. 100 step 을 모두 밟을 때와 10 step 으로 줄였을 때, sample 하나의 시간은?"
    answer="쓰는 횟수 × 한 번의 시간 → 100 × 0.02 = 2 초 · 10 × 0.02 = 0.2 초"
  />
)

const PauseCup = () => (
  <PauseWrite
    question="컵 손잡이를 절반은 왼쪽에서, 절반은 오른쪽에서 잡은 시연. MSE policy 와 Diffusion Policy 는 어떤 손 위치를 낼까?"
    answer="MSE policy 는 두 위치의 가운데(시연에 없던 위치) · Diffusion Policy 는 sampling 마다 둘 중 한 위치"
  />
)

export function Ddpm() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        forward: Forward,
        schedule: Schedule,
        'pause-forward': PauseForward,
        network: Network,
        reverse: Reverse,
        'pause-reverse': PauseReverse,
        time: Time,
        ddim: Ddim,
        'pause-time': PauseTime,
        modes: Modes,
        policy: Policy,
        'pause-cup': PauseCup,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
