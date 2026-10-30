import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './probability.narration.json'
import { script } from './probability.script'

// Numbers follow lessons/probability/README.md (see probability.script.ts). The histogram bars are the lesson's figure
// (figures/histogram.svg, 1000 readings); the curves and the ellipse are drawn from the lesson's μ, σ and covariance matrix.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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

const line = (color: string = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color: string = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** one line that fades in at `at` */
function Ln({ at, children, color = C.text, size = 23 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <div style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</div>
}

/** a text table: column 0 in sans, the others in mono from `monoFrom`; a column can wait for its own cue (`colAt`) */
function Grid({ head, rows, widths, at, colAt = [], step = 0.35, size = 24, colors, monoFrom = 1 }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; colAt?: (number | undefined)[]; step?: number; size?: number; colors?: (string | undefined)[]; monoFrom?: number }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i >= monoFrom ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  const when = (i: number, base: number) => Math.max(base, colAt[i] ?? 0)
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, opacity: prog(t, at) }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2, opacity: prog(t, when(i, at)) }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
            <span key={i} style={{ ...cell(i), opacity: prog(t, when(i, at + 0.3 + k * step)) }}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const gauss = (v: number, mu: number, s: number) => Math.exp(-((v - mu) ** 2) / (2 * s * s))

/** an SVG path of a bell curve: `peak` px tall at μ, drawn from v0 to v1 */
function bell(x: (v: number) => number, base: number, mu: number, s: number, peak: number, v0: number, v1: number, closed = false) {
  const n = 120
  const pts: string[] = []
  for (let i = 0; i <= n; i++) {
    const v = v0 + ((v1 - v0) * i) / n
    pts.push(`${x(v).toFixed(1)},${(base - peak * gauss(v, mu, s)).toFixed(1)}`)
  }
  return closed ? `M${x(v0)},${base} L${pts.join(' L')} L${x(v1)},${base} Z` : `M${pts.join(' L')}`
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            MATH · PROBABILITY
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 100, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Probability & Gaussians</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            흔들리는 값을 두 숫자로: <span style={{ color: C.accent }}>평균 μ · 표준편차 σ</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            센서 값이 읽을 때마다 흔들릴 때, 그 흔들림을 숫자로 적고 계산하는 법
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

const READINGS = [2.01, 1.97, 2.03, 2.0, 1.99, 1.97, 2.01, 2.03, 1.99, 2.0]

/** how many earlier readings share this value, to stack the dots */
const stackIndex = (i: number) => READINGS.slice(0, i).filter((v) => v === READINGS[i]).length

function Question() {
  const t = useSec()
  const x = (v: number) => 900 + ((v - 1.96) / 0.08) * 800
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={1792} height={330}>
          <g opacity={prog(t, 0.3)}>
            <rect x={80} y={120} width={130} height={90} rx={14} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <circle cx={115} cy={222} r={14} fill={C.dim} />
            <circle cx={175} cy={222} r={14} fill={C.dim} />
            <rect x={200} y={152} width={22} height={26} rx={4} fill={C.accent} />
            <text x={145} y={290} textAnchor="middle" fill={C.muted} fontSize={22}>
              거리 센서를 단 로봇
            </text>
            <line x1={226} y1={165} x2={752} y2={165} stroke={C.accent} strokeWidth={2} strokeDasharray="8 8" />
            <text x={489} y={142} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
              2.00 m
            </text>
            <rect x={760} y={50} width={30} height={240} fill={C.dim} />
            <text x={775} y={316} textAnchor="middle" fill={C.muted} fontSize={22}>
              벽
            </text>
          </g>
          <text x={900} y={50} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
            같은 자리에서 열 번 읽은 값 (m)
          </text>
          <text x={900} y={96} fontSize={22} fontFamily={MONO} fontWeight={600}>
            {READINGS.map((v, i) => (
              <tspan key={i} fill={C.orange} opacity={prog(t, 0.6 + i * 0.3)}>
                {v.toFixed(2)}
                {'  '}
              </tspan>
            ))}
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={880} y1={220} x2={1720} y2={220} stroke={C.muted} strokeWidth={2} />
            {[1.96, 1.98, 2.0, 2.02, 2.04].map((v) => (
              <g key={v}>
                <line x1={x(v)} y1={214} x2={x(v)} y2={226} stroke={C.muted} strokeWidth={2} />
                <text x={x(v)} y={256} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {v.toFixed(2)}
                </text>
              </g>
            ))}
          </g>
          {READINGS.map((v, i) => (
            <circle key={i} cx={x(v)} cy={200 - 26 * stackIndex(i)} r={10} fill={C.orange} opacity={prog(t, 0.6 + i * 0.3, 0.3)} />
          ))}
          <text x={900} y={306} fill={C.dim} fontSize={22} opacity={prog(t, 3.6)}>
            로봇도 벽도 그대로인데 읽을 때마다 1.97 ~ 2.03 m 사이에서 값이 바뀐다
          </text>
        </svg>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          장애물 앞 <span style={{ color: C.accent }}>몇 cm 에서 멈춰야</span> 부딪히지 않을까?
        </div>
      </Appear>
      <Card x={330} y={624} w={1260} h={250} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12, opacity: prog(t, 5.8) }}>
          <Head size={26}>확률로 적는 두 숫자</Head>
          <span style={line(C.text, 24)}>
            가장 그럴듯한 값 → <span style={mono(C.green, 26)}>평균 μ</span>
            <span style={{ display: 'inline-block', width: 60 }} />
            흔들리는 폭 → <span style={mono(C.orange, 26)}>표준편차 σ</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.6) }}>데이터시트의 예: Hokuyo UST-10LX 는 σ &lt; 30 mm 로 적고, ROS 의 NavSatFix 는 오차를 3 × 3 공분산 행렬로 보낸다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- mean and standard deviation ----------

const DEV = [1, -3, 3, 0, -1, -3, 1, 3, -1, 0]
const signed = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '0')

function MeanStd() {
  const t = useSec()
  const x = (v: number) => 90 + ((v - 1.96) / 0.08) * 760
  const widths = [110, 190, 190, 210]
  const cell = (i: number, at: number, color: string = C.text, bold = false): CSSProperties => ({
    width: widths[i],
    fontFamily: i === 0 ? undefined : MONO,
    fontSize: 26,
    color,
    fontWeight: bold ? 600 : 400,
    textAlign: i === 0 ? 'left' : 'right',
    paddingRight: i === 0 ? 0 : 14,
    whiteSpace: 'nowrap',
    opacity: prog(t, at, 0.4),
  })
  const steps: { tag: string; color: string; formula: string; note: string; at: number }[] = [
    { tag: '평균 μ', color: C.green, formula: '20.00 ÷ 10 = 2.00 m', note: '값을 모두 더해 개수로 나눈다', at: 0.6 },
    { tag: '편차', color: C.blue, formula: '측정값 − μ → 합 = 0', note: '그대로 평균하면 +와 −가 지워진다', at: 6.7 },
    { tag: '분산 σ²', color: C.orange, formula: '40 ÷ 10 = 4 cm²', note: '편차² 의 평균 · 단위가 cm² 라 읽기 어렵다', at: 13.2 },
    { tag: '표준편차 σ', color: C.accent, formula: '√4 = 2 cm', note: '분산의 제곱근 · 원래 단위로 돌아온다', at: 20.2 },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <div style={{ position: 'absolute', left: 30, top: 24, opacity: prog(t, 0.3) }}>
          <Head size={26}>벽 2.00 m 앞에서 열 번 읽은 값</Head>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 84, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
            {['번호', '측정값 (m)', '편차 (cm)', '편차² (cm²)'].map((h, i) => (
              <span key={h} style={{ ...cell(i, [0.3, 0.3, 6.6, 13.1][i], C.muted), fontFamily: undefined, fontSize: 22 }}>
                {h}
              </span>
            ))}
          </div>
          {READINGS.map((v, k) => (
            <div key={k} style={{ display: 'flex' }}>
              <span style={cell(0, 0.5 + k * 0.15, C.muted)}>{k + 1}</span>
              <span style={cell(1, 0.5 + k * 0.15, C.orange)}>{v.toFixed(2)}</span>
              <span style={cell(2, 6.8 + k * 0.15, DEV[k] === 0 ? C.muted : C.blue)}>{signed(DEV[k])}</span>
              <span style={cell(3, 13.3 + k * 0.15)}>{DEV[k] ** 2}</span>
            </div>
          ))}
          <div style={{ display: 'flex', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 6 }}>
            <span style={cell(0, 2.2, C.text, true)}>합</span>
            <span style={cell(1, 2.2, C.green, true)}>20.00</span>
            <span style={cell(2, 8.6, C.blue, true)}>0</span>
            <span style={cell(3, 15.1, C.orange, true)}>40</span>
          </div>
        </div>
      </Panel>
      <Card x={916} y={140} w={940} h={280} at={0.3}>
        <svg width={940} height={280}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            수직선 위의 열 값
          </text>
          <line x1={70} y1={200} x2={870} y2={200} stroke={C.muted} strokeWidth={2} />
          {[1.96, 1.98, 2.0, 2.02, 2.04].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={194} x2={x(v)} y2={206} stroke={C.muted} strokeWidth={2} />
              <text x={x(v)} y={236} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 20.2)}>
            <rect x={x(1.98)} y={118} width={x(2.02) - x(1.98)} height={82} fill={C.accent} opacity={0.14} />
            <line x1={x(1.98)} y1={118} x2={x(1.98)} y2={200} stroke={C.accent} strokeWidth={2} />
            <line x1={x(2.02)} y1={118} x2={x(2.02)} y2={200} stroke={C.accent} strokeWidth={2} />
            <text x={x(2.02) + 10} y={124} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              ±σ = ±2 cm
            </text>
          </g>
          {READINGS.map((v, i) => (
            <circle key={i} cx={x(v)} cy={180 - 24 * stackIndex(i)} r={10} fill={C.orange} opacity={prog(t, 0.5 + i * 0.15, 0.3)} />
          ))}
          <g opacity={prog(t, 1.4)}>
            <line x1={x(2.0)} y1={84} x2={x(2.0)} y2={206} stroke={C.green} strokeWidth={2.5} strokeDasharray="7 6" />
            <text x={x(2.0) + 10} y={86} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              μ = 2.00 m
            </text>
          </g>
        </svg>
      </Card>
      <Card x={916} y={440} w={940} h={440} at={0.3}>
        <div style={{ padding: '26px 28px', display: 'grid', gap: 16 }}>
          {steps.map((s) => (
            <div key={s.tag} style={{ display: 'grid', gap: 2, opacity: prog(t, s.at) }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
                <span style={{ width: 170, fontSize: 26, fontWeight: 600, color: s.color }}>{s.tag}</span>
                <span style={mono(s.color, 30)}>{s.formula}</span>
              </div>
              <span style={{ ...line(C.muted, 22), paddingLeft: 190 }}>{s.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- the Gaussian and the safety margin ----------

/** counts of the lesson's histogram (figures/histogram.svg), 1 cm bins from 1.93 to 2.06 m, 1000 in all */
const BINS = [1, 0, 14, 32, 59, 96, 166, 211, 196, 127, 62, 20, 15, 1]

function Gaussian() {
  const t = useSec()
  const base = 560
  const k = 330 / 211
  const x = (v: number) => 110 + ((v - 1.925) / 0.01) * 60
  const brackets: [string, number, number, string, number][] = [
    ['±1σ 68.3%', 1.98, 2.02, C.green, 630],
    ['±2σ 95.4%', 1.96, 2.04, C.blue, 672],
    ['±3σ 99.7%', 1.94, 2.06, C.orange, 714],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1060} h={740}>
        <svg width={1060} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 센서를 1000 번 읽어 1 cm 칸마다 센 histogram
          </text>
          <g opacity={prog(t, 1.5)}>
            <rect x={30} y={72} width={22} height={22} rx={4} fill={C.blue} />
            <text x={64} y={91} fill={C.blue} fontSize={22}>
              2.00 m 칸 211 개 · 2.04 m 칸 20 개
            </text>
          </g>
          <g opacity={prog(t, 6.2)}>
            <line x1={30} y1={120} x2={52} y2={120} stroke={C.orange} strokeWidth={4} />
            <text x={64} y={127} fill={C.orange} fontSize={22}>
              Gaussian · μ 2.00 m, σ 2 cm 인 종 모양 곡선
            </text>
          </g>
          {BINS.map((n, i) => {
            const h = n * k * prog(t, 0.3 + i * 0.08, 0.8)
            const strong = i === 7 || i === 11
            return <rect key={i} x={x(1.93 + i * 0.01) - 26} y={base - h} width={52} height={h} rx={3} fill={C.blue} opacity={strong ? 0.95 : 0.45} />
          })}
          <line x1={100} y1={base} x2={960} y2={base} stroke={C.muted} strokeWidth={2} />
          {[1.94, 1.96, 1.98, 2.0, 2.02, 2.04, 2.06].map((v) => (
            <text key={v} x={x(v)} y={590} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v.toFixed(2)}
            </text>
          ))}
          <text x={975} y={590} fill={C.muted} fontSize={20} fontFamily={MONO}>
            m
          </text>
          <path d={bell(x, base, 2.0, 0.02, 199.5 * k, 1.925, 2.065)} fill="none" stroke={C.orange} strokeWidth={4} opacity={prog(t, 6.2)} />
          {brackets.map(([label, a, b, color, y], i) => (
            <g key={label} opacity={prog(t, 12.2 + i * 1.2)}>
              <line x1={x(a)} y1={y - 8} x2={x(a)} y2={y + 8} stroke={color} strokeWidth={3} />
              <line x1={x(b)} y1={y - 8} x2={x(b)} y2={y + 8} stroke={color} strokeWidth={3} />
              <line x1={x(a)} y1={y} x2={490} y2={y} stroke={color} strokeWidth={3} />
              <line x1={630} y1={y} x2={x(b)} y2={y} stroke={color} strokeWidth={3} />
              <text x={560} y={y + 8} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
            </g>
          ))}
        </svg>
      </Panel>
      <Box x={1156} y={140} w={700} h={140} at={6}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={line(C.text, 23)}>
            Gaussian (정규분포) · <span style={mono(C.orange, 24)}>N(μ, σ²)</span>
          </span>
          <Ln at={7}>
            이 센서는 <span style={mono(C.orange, 24)}>N(2.00 m, (2 cm)²)</span> · 곡선 아래 넓이가 확률
          </Ln>
        </div>
      </Box>
      <Box x={1156} y={296} w={700} h={264} at={12} title={<Head color={C.green}>68-95-99.7 규칙 · σ = 2 cm</Head>}>
        <Grid
          head={['범위', '이 센서', '안', '밖']}
          widths={[120, 220, 130, 130]}
          at={12.1}
          step={1.2}
          size={24}
          monoFrom={1}
          colors={[C.green, C.blue, C.orange]}
          rows={[
            ['μ ± 1σ', '1.98 ~ 2.02 m', '68.3%', '31.7%'],
            ['μ ± 2σ', '1.96 ~ 2.04 m', '95.4%', '4.6%'],
            ['μ ± 3σ', '1.94 ~ 2.06 m', '99.7%', '0.27%'],
          ]}
        />
      </Box>
      <Box x={1156} y={576} w={700} h={304} at={18.5} gap={10} title={<Head color={C.accent}>Hokuyo UST-10LX 의 안전 여유</Head>}>
        <Ln at={18.7}>accuracy ±40 mm · 실제 거리와 어긋날 수 있는 폭</Ln>
        <Ln at={20}>
          repeated accuracy σ &lt; 30 mm → <span style={mono(C.blue, 24)}>3σ = 3 × 30 = 90 mm</span>
        </Ln>
        <Ln at={24.5} size={30}>
          <span style={mono(C.accent, 30)}>여유 40 + 90 = 130 mm</span>
        </Ln>
        <Ln at={26}>
          멀게 읽는 한쪽만 위험: <span style={mono(C.red, 24)}>0.27% ÷ 2 = 0.135%</span>
        </Ln>
        <Ln at={27.5} color={C.muted} size={22}>
          1초에 1080 × 40 ≈ 43,000 점 → 3σ 밖 약 58 개
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- averaging and bias ----------

function Averaging() {
  const t = useSec()
  const base = 640
  const x = (v: number) => 100 + ((v - 1.94) / 0.12) * 800
  const curves: [string, number, number, string, number, number][] = [
    ['1 개 · σ 2 cm', 0.02, 110, C.dim, 0.3, 30],
    ['4 개 평균 · σ 1 cm', 0.01, 220, C.blue, 6.7, 300],
    ['16 개 평균 · σ 0.5 cm', 0.005, 440, C.orange, 7.6, 610],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            독립인 측정 N 개를 평균한 값의 분포
          </text>
          {curves.map(([label, , , color, at, lx]) => (
            <g key={label} opacity={prog(t, at)}>
              <line x1={lx} y1={84} x2={lx + 24} y2={84} stroke={color} strokeWidth={4} />
              <text x={lx + 34} y={92} fill={color} fontSize={22}>
                {label}
              </text>
            </g>
          ))}
          {curves.map(([label, s, peak, color, at]) => (
            <g key={label} opacity={prog(t, at, 0.9)}>
              <path d={bell(x, base, 2.0, s, peak, 1.94, 2.06, true)} fill={color} opacity={0.12} />
              <path d={bell(x, base, 2.0, s, peak, 1.94, 2.06)} fill="none" stroke={color} strokeWidth={3.5} />
            </g>
          ))}
          <g opacity={prog(t, 0.6)}>
            <line x1={x(2.0)} y1={130} x2={x(2.0)} y2={base} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" />
            <text x={x(2.0) + 12} y={150} fill={C.green} fontSize={22}>
              실제 2.00 m
            </text>
          </g>
          <line x1={90} y1={base} x2={910} y2={base} stroke={C.muted} strokeWidth={2} />
          {[1.94, 1.96, 1.98, 2.0, 2.02, 2.04, 2.06].map((v) => (
            <text key={v} x={x(v)} y={672} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {v.toFixed(2)}
            </text>
          ))}
          <text x={30} y={716} fill={C.dim} fontSize={22} opacity={prog(t, 8.5)}>
            곡선 아래 넓이는 모두 1 이라서, 폭이 좁아지면 높이가 높아진다
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={350} at={6.5} title={<Head color={C.blue}>평균값의 표준편차 2 ÷ √N</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Grid
            head={['평균한 개수 N', '2 ÷ √N', '모으는 시간']}
            widths={[200, 200, 220]}
            at={6.6}
            step={0.5}
            colAt={[undefined, undefined, 13.2]}
            rows={[
              ['1', '2 cm', '0.025 초'],
              ['4', '1 cm', '0.1 초'],
              ['16', '0.5 cm', '0.4 초'],
              ['100', '0.2 cm', '2.5 초'],
            ]}
            colors={[C.dim, C.blue, C.orange, C.accent]}
          />
          <Ln at={13.6} color={C.muted} size={22}>
            모으는 시간은 1초에 40 번 읽는 센서 기준
          </Ln>
        </div>
      </Box>
      <Box x={1096} y={506} w={760} h={374} at={13} gap={10} title={<Head color={C.orange}>반으로 줄이려면 측정이 네 배</Head>}>
        <Ln at={13.3}>
          σ 2 → 1 cm 는 N 1 → 4, 1 → 0.5 cm 는 N 4 → 16
        </Ln>
        <Ln at={15}>
          100 개를 모으는 시간: <span style={mono(C.orange, 24)}>100 ÷ 40 = 2.5 초</span>
        </Ln>
        <Ln at={20.2} size={30}>
          <span style={mono(C.red, 30)}>0.5 m/s × 2.5 초 = 1.25 m</span>
        </Ln>
        <Ln at={21.5}>모으는 동안 달리는 로봇은 벌써 1.25 m 를 간다</Ln>
        <Ln at={23.5} color={C.muted} size={22}>
          → 오래 평균하는 방법은 서 있을 때나 천천히 변하는 값에만 쓴다 · 움직이는 로봇은 Kalman Filter
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Bias() {
  const t = useSec()
  const x = (v: number) => 60 + (v - 1.94) * 5500
  const sig: [number, number, string][] = [
    [0.02, 55, C.dim],
    [0.01, 110, C.blue],
    [0.005, 220, C.orange],
  ]
  const plot = (mu: number, base: number, at: number) =>
    sig.map(([s, peak, color], i) => (
      <g key={s} opacity={prog(t, at + i * 0.4, 0.8)}>
        <path d={bell(x, base, mu, s, peak, 1.94, 2.1, true)} fill={color} opacity={0.12} />
        <path d={bell(x, base, mu, s, peak, 1.94, 2.1)} fill="none" stroke={color} strokeWidth={3.5} />
      </g>
    ))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            noise 만 있는 센서
          </text>
          {plot(2.0, 330, 0.5)}
          <line x1={40} y1={330} x2={960} y2={330} stroke={C.muted} strokeWidth={2} />
          {[1.96, 2.0, 2.04, 2.08].map((v) => (
            <text key={v} x={x(v)} y={360} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO} opacity={prog(t, 0.3)}>
              {v.toFixed(2)}
            </text>
          ))}
          <g opacity={prog(t, 1.4)}>
            <text x={30} y={420} fill={C.text} fontSize={26} fontWeight={600}>
              bias +3 cm 가 있는 센서
            </text>
            <line x1={40} y1={650} x2={960} y2={650} stroke={C.muted} strokeWidth={2} />
            {[1.96, 2.0, 2.06, 2.1].map((v) => (
              <text key={v} x={x(v)} y={680} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v.toFixed(2)}
              </text>
            ))}
            <text x={x(2.03)} y={680} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              2.03
            </text>
          </g>
          {plot(2.03, 650, 1.6)}
          <g opacity={prog(t, 0.6)}>
            <line x1={x(2.0)} y1={96} x2={x(2.0)} y2={330} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" />
            <line x1={x(2.0)} y1={376} x2={x(2.0)} y2={650} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" />
            <text x={x(2.0) + 12} y={90} fill={C.green} fontSize={22}>
              실제 2.00 m
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <line x1={x(2.0)} y1={712} x2={x(2.03)} y2={712} stroke={C.red} strokeWidth={3} />
            <line x1={x(2.0)} y1={702} x2={x(2.0)} y2={722} stroke={C.red} strokeWidth={3} />
            <line x1={x(2.03)} y1={702} x2={x(2.03)} y2={722} stroke={C.red} strokeWidth={3} />
            <text x={x(2.03) + 16} y={720} fill={C.red} fontSize={22} fontWeight={600}>
              3 cm 는 그대로 남는다
            </text>
            <text x={600} y={470} fill={C.muted} fontSize={22}>
              100 개 평균 → 2.03 m 에 0.2 cm 폭
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={280} at={6.5} title={<Head>noise 와 bias</Head>}>
        <Grid
          head={['성질', 'noise', 'bias']}
          widths={[180, 250, 250]}
          at={6.6}
          step={0.6}
          size={22}
          monoFrom={9}
          rows={[
            ['읽을 때마다', '크기와 부호가 바뀐다', '같은 쪽으로 같은 만큼'],
            ['N 개를 평균하면', <span style={{ color: C.blue }}>√N 분의 1 로 준다</span>, <span style={{ color: C.red }}>그대로 남는다</span>],
            ['줄이는 방법', '평균, filter', <span style={{ color: C.green }}>calibration</span>],
          ]}
        />
      </Box>
      <Box x={1096} y={440} w={760} h={220} at={13} gap={10} title={<Head color={C.green}>calibration</Head>}>
        <Ln at={13.3}>
          벽을 정확히 2.00 m 에 두고 100 번 읽은 평균 = <span style={mono(C.orange, 24)}>2.03 m</span>
        </Ln>
        <Ln at={15.5}>
          → 3 cm 길게 읽는 센서 · 이후 측정마다 <span style={mono(C.green, 24)}>3 cm</span> 를 뺀다
        </Ln>
      </Box>
      <Box x={1096} y={680} w={760} h={200} at={20} gap={10} title={<Head color={C.purple}>Gazebo SDF 의 noise 설정</Head>}>
        <Ln at={20.5}>
          <span style={mono(C.purple, 24)}>stddev</span> · 측정마다 새로 뽑는 noise
        </Ln>
        <Ln at={22.5}>
          <span style={mono(C.purple, 24)}>bias_mean · bias_stddev</span> · bias
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- covariance and the error ellipse ----------

const GPS: [number, number][] = [
  [2, 1],
  [-2, -1],
  [1, 2],
  [-1, -2],
  [0, 0],
]

function Axes({ cx, cy, r, s, t, at }: { cx: number; cy: number; r: number; s: number; t: number; at: number }) {
  const ticks = []
  for (let i = -r; i <= r; i++) ticks.push(i)
  return (
    <g opacity={prog(t, at)}>
      {ticks.map((i) => (
        <g key={i}>
          <line x1={cx + i * s} y1={cy - r * s} x2={cx + i * s} y2={cy + r * s} stroke={C.grid} strokeWidth={1.5} />
          <line x1={cx - r * s} y1={cy + i * s} x2={cx + r * s} y2={cy + i * s} stroke={C.grid} strokeWidth={1.5} />
        </g>
      ))}
      <line x1={cx - r * s} y1={cy} x2={cx + r * s} y2={cy} stroke={C.muted} strokeWidth={2} />
      <line x1={cx} y1={cy - r * s} x2={cx} y2={cy + r * s} stroke={C.muted} strokeWidth={2} />
    </g>
  )
}

function Covariance() {
  const t = useSec()
  const cx = 430
  const cy = 420
  const s = 100
  const labels: [string, number, number, 'start' | 'end'][] = [
    ['(+2, +1)', 646, 337, 'start'],
    ['(−2, −1)', 214, 537, 'end'],
    ['(+1, +2)', 546, 227, 'start'],
    ['(−1, −2)', 314, 637, 'end'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            GPS 위치 5 개 · 평균에서 떨어진 거리 (m)
          </text>
          <g opacity={prog(t, 6.8)}>
            <rect x={cx} y={cy - 3 * s} width={3 * s} height={3 * s} fill={C.green} opacity={0.07} />
            <rect x={cx - 3 * s} y={cy} width={3 * s} height={3 * s} fill={C.green} opacity={0.07} />
          </g>
          <Axes cx={cx} cy={cy} r={3} s={s} t={t} at={0.3} />
          <g opacity={prog(t, 0.3)}>
            <text x={738} y={410} fill={C.muted} fontSize={22}>
              x 동쪽
            </text>
            <text x={442} y={134} fill={C.muted} fontSize={22}>
              y 북쪽
            </text>
            <text x={cx - 2 * s} y={452} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              −2
            </text>
            <text x={cx + 2 * s} y={452} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              +2
            </text>
            <text x={420} y={cy - 2 * s + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              +2
            </text>
            <text x={420} y={cy + 2 * s + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              −2
            </text>
          </g>
          {GPS.map(([gx, gy], i) => (
            <circle key={i} cx={cx + gx * s} cy={cy - gy * s} r={11} fill={i === 4 ? C.muted : C.orange} opacity={prog(t, 0.6 + i * 0.3, 0.3)} />
          ))}
          {labels.map(([l, lx, ly, anchor], i) => (
            <text key={l} x={lx} y={ly} textAnchor={anchor} fill={C.orange} fontSize={20} fontFamily={MONO} stroke={C.card} strokeWidth={7} paintOrder="stroke" opacity={prog(t, 0.6 + i * 0.3)}>
              {l}
            </text>
          ))}
          <g opacity={prog(t, 7.2)}>
            <text x={720} y={170} textAnchor="end" fill={C.green} fontSize={22} stroke={C.card} strokeWidth={7} paintOrder="stroke">
              같은 쪽으로 틀림 · 곱 +
            </text>
            <text x={140} y={702} fill={C.green} fontSize={22} stroke={C.card} strokeWidth={7} paintOrder="stroke">
              같은 쪽으로 틀림 · 곱 +
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={424} at={0.3} title={<Head>x 편차와 y 편차 (m)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Grid
            head={['번호', 'x 편차', 'y 편차', 'x × y']}
            widths={[220, 150, 150, 170]}
            at={0.4}
            step={0.3}
            size={22}
            colAt={[undefined, undefined, undefined, 6.8]}
            rows={[
              ['1', '+2', '+1', '+2'],
              ['2', '−2', '−1', '+2'],
              ['3', '+1', '+2', '+2'],
              ['4', '−1', '−2', '+2'],
              ['5', '0', '0', '0'],
              [<span style={{ fontWeight: 600 }}>제곱 · 곱의 평균</span>, <span style={{ color: C.blue }}>2 m²</span>, <span style={{ color: C.blue }}>2 m²</span>, <span style={{ color: C.green }}>1.6 m²</span>],
            ]}
          />
          <Ln at={9} color={C.muted} size={22}>
            분산 (4 + 4 + 1 + 1 + 0) ÷ 5 = 2 · 공분산 8 ÷ 5 = 1.6
          </Ln>
        </div>
      </Box>
      <Box x={956} y={580} w={900} h={300} at={13} gap={10} title={<Head color={C.green}>상관계수 · 함께 움직이는 정도</Head>}>
        <Ln at={13.3} size={28}>
          <span style={mono(C.green, 28)}>1.6 ÷ (√2 × √2) = 0.8</span>
        </Ln>
        <Ln at={15}>공분산을 두 표준편차의 곱으로 나눈 값 · 언제나 −1 과 1 사이</Ln>
        <Ln at={20.2}>
          <span style={{ color: C.orange, fontWeight: 600 }}>함께 틀리는 원인</span> · 높은 건물 사이 도로에서는 위성이 도로를 따라 늘어서서, 도로를 가로지르는 방향으로 오차가 길게 퍼진다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Ellipse() {
  const t = useSec()
  const cx = 430
  const cy = 400
  const s = 90
  const L = 1.9 * s
  const S = 0.63 * s
  const d = Math.SQRT1_2
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            공분산 행렬로 그린 오차 타원
          </text>
          <Axes cx={cx} cy={cy} r={3} s={s} t={t} at={0.3} />
          <g opacity={prog(t, 0.3)}>
            <text x={cx + 3 * s - 4} y={cy - 12} textAnchor="end" fill={C.muted} fontSize={22}>
              x 동쪽
            </text>
            <text x={cx + 12} y={cy - 3 * s + 22} fill={C.muted} fontSize={22}>
              y 북쪽
            </text>
          </g>
          <g opacity={prog(t, 18.6)}>
            <ellipse cx={cx} cy={cy} rx={2 * L} ry={2 * S} transform={`rotate(-45 ${cx} ${cy})`} fill="none" stroke={C.accent} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.7} />
          </g>
          <g opacity={prog(t, 12.6, 0.9)}>
            <ellipse cx={cx} cy={cy} rx={L} ry={S} transform={`rotate(-45 ${cx} ${cy})`} fill={C.accent} fillOpacity={0.12} stroke={C.accent} strokeWidth={3.5} />
          </g>
          {GPS.map(([gx, gy], i) => (
            <circle key={i} cx={cx + gx * s} cy={cy - gy * s} r={10} fill={C.orange} opacity={prog(t, 0.5 + i * 0.2, 0.3)} />
          ))}
          <g opacity={prog(t, 6.6)}>
            <line x1={cx - L * d} y1={cy + L * d} x2={cx + L * d} y2={cy - L * d} stroke={C.orange} strokeWidth={4} />
            <line x1={cx - S * d} y1={cy - S * d} x2={cx + S * d} y2={cy + S * d} stroke={C.green} strokeWidth={4} />
          </g>
          <g opacity={prog(t, 6.6)}>
            <line x1={30} y1={700} x2={58} y2={700} stroke={C.orange} strokeWidth={4} />
            <text x={68} y={708} fill={C.orange} fontSize={22}>
              긴 축 σ 1.90 m (북동쪽)
            </text>
            <line x1={430} y1={700} x2={458} y2={700} stroke={C.green} strokeWidth={4} />
            <text x={468} y={708} fill={C.green} fontSize={22}>
              짧은 축 σ 0.63 m (북서쪽)
            </text>
          </g>
          <text x={30} y={86} fill={C.dim} fontSize={20} opacity={prog(t, 18.8)}>
            실선 1σ 타원 · 점선 2σ 타원 · 칸 1 m
          </text>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={204} at={0.3} title={<Head>공분산 행렬 Σ (m²)</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 90px', rowGap: 4, padding: '4px 18px', borderLeft: `3px solid ${C.muted}`, borderRight: `3px solid ${C.muted}`, borderRadius: 6, fontFamily: MONO, fontSize: 32, fontWeight: 600, textAlign: 'center' }}>
            <span style={{ color: C.blue }}>2</span>
            <span style={{ color: C.green }}>1.6</span>
            <span style={{ color: C.green }}>1.6</span>
            <span style={{ color: C.blue }}>2</span>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <Ln at={1.5}>
              대각선: x, y 각자의 분산 <span style={mono(C.blue, 24)}>2</span>
            </Ln>
            <Ln at={2.5}>
              대각선 밖: 공분산 <span style={mono(C.green, 24)}>1.6</span>
            </Ln>
          </div>
        </div>
      </Box>
      <Box x={956} y={360} w={900} h={290} at={6} title={<Head color={C.orange}>방향 u 의 분산 uᵀΣu</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Grid
            head={['방향', 'u', 'uᵀΣu', 'σ']}
            widths={[130, 300, 190, 160]}
            at={6.2}
            step={0.8}
            size={24}
            colors={[C.text, C.orange, C.green]}
            rows={[
              ['동쪽', '[1, 0]', '2', '1.41 m'],
              ['북동쪽', '[0.707, 0.707]', '3.6', '1.90 m'],
              ['북서쪽', '[−0.707, 0.707]', '0.4', '0.63 m'],
            ]}
          />
        </div>
      </Box>
      <Box x={956} y={666} w={900} h={214} at={18.5} gap={8} title={<Head color={C.accent}>값이 둘이면 · 타원 안에 드는 비율</Head>}>
        <Ln at={18.8}>
          <span style={mono(C.accent, 24)}>1σ 39% · 2σ 86% · 3σ 98.9%</span> · 68-95-99.7 이 아니다
        </Ln>
        <Ln at={24.6}>
          <span style={mono(C.purple, 22)}>NavSatFix</span> 의 <span style={mono(C.purple, 22)}>position_covariance</span>: 숫자 9 개 (3 × 3, m²)
        </Ln>
        <Ln at={26.6} color={C.muted} size={22}>
          대각선만 채우면 filter 는 기운 타원을 축에 나란한 타원으로 계산한다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- Bayes rule and expected value ----------

function Node({ x, y, w, h = 64, color, at, size = 23, children }: { x: number; y: number; w: number; h?: number; color: string; at: number; size?: number; children: ReactNode }) {
  const t = useSec()
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'grid', placeItems: 'center', borderRadius: 14, border: `1.5px solid ${color}aa`, background: `${color}18`, fontSize: size, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at) }}>
      <span>{children}</span>
    </div>
  )
}

function Bayes() {
  const t = useSec()
  const edge = (x1: number, y1: number, x2: number, y2: number, at: number, color: string = C.muted) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} opacity={prog(t, at)} />
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1060} h={740}>
        <div style={{ position: 'absolute', left: 30, top: 22, opacity: prog(t, 0.3) }}>
          <Head size={26}>복도 위치 1000 곳으로 세기</Head>
        </div>
        <svg width={1060} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          {edge(530, 144, 255, 200, 0.8)}
          {edge(530, 144, 805, 200, 0.8)}
          {edge(255, 264, 135, 330, 6.6)}
          {edge(255, 264, 380, 330, 6.6)}
          {edge(805, 264, 690, 330, 7.4)}
          {edge(805, 264, 935, 330, 7.4)}
          {edge(135, 394, 300, 490, 13, C.accent)}
          {edge(690, 394, 560, 490, 13, C.accent)}
        </svg>
        <Node x={380} y={80} w={300} color={C.muted} at={0.4}>
          복도 위치 <span style={mono(C.text, 24)}>1000</span> 곳
        </Node>
        <Node x={90} y={200} w={330} color={C.green} at={0.9}>
          문 <span style={mono(C.green, 24)}>100</span> 곳 (10%)
        </Node>
        <Node x={640} y={200} w={330} color={C.dim} at={1.2}>
          벽 <span style={mono(C.text, 24)}>900</span> 곳 (90%)
        </Node>
        <Node x={20} y={330} w={230} color={C.green} at={6.7}>
          감지 <span style={mono(C.green, 24)}>90</span> 곳 (90%)
        </Node>
        <Node x={270} y={330} w={220} color={C.dim} at={7.1}>
          놓침 <span style={mono(C.muted, 24)}>10</span> 곳
        </Node>
        <Node x={570} y={330} w={240} color={C.red} at={7.5}>
          오경보 <span style={mono(C.red, 24)}>45</span> 곳 (5%)
        </Node>
        <Node x={830} y={330} w={210} color={C.dim} at={7.9}>
          조용 <span style={mono(C.muted, 24)}>855</span> 곳
        </Node>
        <Node x={100} y={490} w={620} h={70} color={C.accent} at={13.1} size={25}>
          <span>
            감지가 뜬 곳 <span style={mono(C.accent, 26)}>90 + 45 = 135</span>
          </span>
        </Node>
        <div style={{ position: 'absolute', left: 30, top: 596, width: 1000, display: 'grid', gap: 10 }}>
          <div style={{ ...mono(C.accent, 40), opacity: prog(t, 14.6) }}>P(문 | 감지) = 90 ÷ 135 ≈ 0.67</div>
          <div style={{ ...line(C.muted, 22), opacity: prog(t, 16.6) }}>감지기의 90% 는 P(감지 | 문) = 90 ÷ 100 · 같은 90 곳을 다른 범위로 나눈 값</div>
        </div>
      </Panel>
      <Box x={1156} y={140} w={700} h={250} at={19.5} gap={10} title={<Head color={C.accent}>Bayes rule 의 세 이름</Head>}>
        <Ln at={19.7}>
          <span style={mono(C.blue, 24)}>prior</span> · 측정 전 믿음 P(문) = 0.1
        </Ln>
        <Ln at={20.9}>
          <span style={mono(C.orange, 24)}>likelihood</span> · P(감지 | 문) = 0.9
        </Ln>
        <Ln at={22.1}>
          <span style={mono(C.green, 24)}>posterior</span> · 측정 뒤 믿음 P(문 | 감지) ≈ 0.67
        </Ln>
      </Box>
      <Box x={1156} y={406} w={700} h={264} at={23} title={<Head color={C.blue}>prior 에 따라 바뀌는 posterior</Head>}>
        <Grid
          head={['prior', 'posterior']}
          widths={[110, 490]}
          at={23.1}
          step={0.5}
          size={22}
          colors={[C.text, C.accent, C.text]}
          rows={[
            ['1%', '0.009 ÷ (0.009 + 0.0495) ≈ 0.15'],
            ['10%', '0.09 ÷ (0.09 + 0.045) ≈ 0.67'],
            ['50%', '0.45 ÷ (0.45 + 0.025) ≈ 0.95'],
          ]}
        />
      </Box>
      <Box x={1156} y={684} w={700} h={196} at={25.5} gap={10} title={<Head color={C.green}>같은 자리에서 다시 읽으면</Head>}>
        <Ln at={25.7} size={28}>
          <span style={mono(C.green, 28)}>0.10 → 0.67 → 0.97 → 0.998</span>
        </Ln>
        <Ln at={27.6} color={C.muted} size={22}>
          한 번 감지 뒤 다음 측정이 조용하면 0.67 → 0.17
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function OptionBar({ y, name, p, good, bad, badColor, formula, at, formulaAt }: { y: number; name: string; p: number; good: string; bad: string; badColor: string; formula: string; at: number; formulaAt: number }) {
  const t = useSec()
  const W0 = 940
  return (
    <div style={{ position: 'absolute', left: 60, top: y, width: W0, display: 'grid', gap: 10, opacity: prog(t, at) }}>
      <Head size={26}>{name}</Head>
      <div style={{ display: 'flex', height: 50, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: W0 * p * prog(t, at + 0.2, 0.9), background: `${C.green}cc` }} />
        <div style={{ flex: 1, background: `${badColor}aa` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ ...line(C.green, 22), fontWeight: 600 }}>{good}</span>
        <span style={{ ...line(badColor, 22), fontWeight: 600 }}>{bad}</span>
      </div>
      <div style={{ ...mono(C.text, 26), opacity: prog(t, formulaAt) }}>{formula}</div>
    </div>
  )
}

function Expected() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1060} h={470} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 20 }}>
          <Label size={22} color={C.muted}>
            어느 방법이든 성공하면 보상 10 · 막대 너비가 확률
          </Label>
        </div>
        <OptionBar y={60} name="A · 위에서 집기" p={0.9} good="90% · 보상 +10" bad="10% · 떨어뜨려 보상 −50" badColor={C.red} formula="기댓값 0.9 × 10 + 0.1 × (−50) = 4" at={0.4} formulaAt={13.2} />
        <OptionBar y={262} name="B · 옆에서 밀어 집기" p={0.7} good="70% · 보상 +10" bad="30% · 실패해도 보상 0" badColor={C.dim} formula="기댓값 0.7 × 10 + 0.3 × 0 = 7" at={6.6} formulaAt={14.4} />
      </Card>
      <Box x={1156} y={140} w={700} h={470} at={6.5} gap={10} title={<Head color={C.accent}>기댓값 = 결과마다 보상 × 확률의 합</Head>}>
        <Ln at={13.6} color={C.muted} size={22}>
          100 번 시도한다고 세면
        </Ln>
        <Ln at={14}>
          A: 90 번 성공 <span style={mono(C.green, 24)}>+900</span>, 10 번 떨어뜨림 <span style={mono(C.red, 24)}>−500</span> → <span style={mono(C.text, 24)}>400</span>
        </Ln>
        <Ln at={15}>
          B: 70 번 성공 <span style={mono(C.green, 24)}>+700</span> → <span style={mono(C.text, 24)}>700</span>
        </Ln>
        <Ln at={16.2} size={26}>
          한 번에 평균 <span style={mono(C.accent, 28)}>4</span> 와 <span style={mono(C.accent, 28)}>7</span> → 성공률이 낮은 B 가 낫다
        </Ln>
        <Ln at={18} color={C.muted} size={22}>
          센서 값의 평균 μ 도 값 × 확률을 더한 기댓값이다
        </Ln>
      </Box>
      <Card x={64} y={630} w={1792} h={250} at={20}>
        <div style={{ position: 'absolute', left: 30, top: 20 }}>
          <Head color={C.purple}>sampling · 분포에서 값을 하나씩 뽑기</Head>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 74, width: 820, display: 'grid', gap: 10, opacity: prog(t, 20.4) }}>
          <span style={line(C.text, 22)}>0 ~ 1 의 무작위 수 u 를 뽑아 u &lt; 0.9 면 A 의 성공, 아니면 실패</span>
          <div style={{ display: 'flex', width: 760, height: 36, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: 684, background: `${C.green}aa` }} />
            <div style={{ flex: 1, background: `${C.red}aa` }} />
          </div>
          <div style={{ position: 'relative', width: 760, height: 26 }}>
            <span style={{ ...mono(C.muted, 20), position: 'absolute', left: 0 }}>0</span>
            <span style={{ ...mono(C.muted, 20), position: 'absolute', left: 684, transform: 'translateX(-50%)' }}>0.9</span>
            <span style={{ ...mono(C.muted, 20), position: 'absolute', right: 0 }}>1</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 900, top: 74, width: 860, display: 'grid', gap: 10 }}>
          <Ln at={21}>
            Gaussian 은 <span style={mono(C.purple, 26)}>x = μ + σε</span> · ε 는 N(0, 1) 에서 뽑는다
          </Ln>
          <Ln at={22.5}>
            ε = 1.5 → <span style={mono(C.orange, 24)}>2.00 + 0.02 × 1.5 = 2.03 m</span>
          </Ln>
          <Ln at={24}>
            ε = −0.5 → <span style={mono(C.orange, 24)}>2.00 − 0.01 = 1.99 m</span>
          </Ln>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: '평균 · σ · Gaussian', color: C.accent, text: 'σ = √4 = 2 cm · 여유 = accuracy + 3σ → 3 × 2 = 6 cm, UST-10LX 130 mm', at: 0.4 },
    { tag: '평균 내기와 bias', color: C.blue, text: 'N 개 평균의 σ 는 2 ÷ √N (100 개면 0.2 cm) · bias 3 cm 는 calibration 으로 뺀다', at: 4.3 },
    { tag: '공분산과 오차 타원', color: C.orange, text: '공분산 1.6, 상관계수 0.8 → 북동쪽 σ 1.90 m, 북서쪽 σ 0.63 m 의 기운 타원', at: 8.3 },
    { tag: 'Bayes rule 과 기댓값', color: C.red, text: '90 ÷ 135 ≈ 0.67 · 다시 감지하면 0.97 · 기댓값 A 4 대 B 7', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            흔들리는 센서를 보고 달리는 로봇은 장애물 앞 몇 cm 에서 멈춰야 할까?
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
            NEXT · MATH
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Kalman Filter</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            움직임으로 예측하고 센서로 보정하며 Gaussian 의 평균과 분산을 고쳐 가기
          </Label>
        </Appear>
        <Appear at={3.9}>
          <Label color={C.muted} size={30}>
            그리고 <span style={{ fontFamily: MONO, color: C.text }}>Bandits & MDPs</span> · 확률을 모를 때 해 보며 기댓값을 어림하기
          </Label>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/probability
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- pause scenes ----------

const PauseMargin = () => (
  <PauseWrite
    question="표준편차가 1.5 cm 인 거리 센서가 있다. bias 는 없다. 값의 99.7% 를 덮으려면 측정값에서 몇 cm 를 여유로 빼야 할까?"
    answer={
      <>
        99.7% 는 μ ± 3σ 범위 → 여유 = 3 × 1.5 = 4.5 cm
      </>
    }
  />
)

const PauseAverage = () => (
  <PauseWrite
    question="표준편차가 4 cm 인 센서로 평균값의 표준편차를 1 cm 로 줄이려면 독립인 측정을 몇 개 평균해야 할까?"
    answer={
      <>
        4 ÷ √N = 1 → √N = 4 → N = 4 × 4 = 16 개
        <br />
        σ 는 N 이 아니라 √N 에 반비례 · 4 개면 4 ÷ √4 = 2 cm 에 그친다
      </>
    }
  />
)

const PauseMatrix = () => (
  <PauseWrite
    question={
      <>
        공분산 행렬이 <span style={{ fontFamily: MONO }}>[[4, 1], [1, 1]] m²</span> 이다. x 와 y 의 표준편차와 상관계수는?
      </>
    }
    answer={
      <>
        대각선이 분산 → x 는 √4 = 2 m, y 는 √1 = 1 m
        <br />
        상관계수 = 공분산 ÷ 두 표준편차의 곱 = 1 ÷ (2 × 1) = 0.5
      </>
    }
  />
)

const PauseAlarm = () => (
  <PauseWrite
    question="문이 10% 인 같은 복도에서 감지기를 바꿔 적중률은 90% 그대로, 오경보율을 1% 로 낮췄다. 감지가 떴을 때 문일 확률은?"
    answer={
      <>
        1000 곳: 문 100 × 0.9 = 90 곳 · 벽 900 × 0.01 = 9 곳 → 90 ÷ 99 ≈ 0.91
        <br />
        오경보율 5% → 1% 로 posterior 0.67 → 0.91
      </>
    }
  />
)

export function Probability() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'mean-std': MeanStd,
        gaussian: Gaussian,
        'pause-margin': PauseMargin,
        averaging: Averaging,
        bias: Bias,
        'pause-average': PauseAverage,
        covariance: Covariance,
        ellipse: Ellipse,
        'pause-matrix': PauseMatrix,
        bayes: Bayes,
        expected: Expected,
        'pause-alarm': PauseAlarm,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
