import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './clip.narration.json'
import { script } from './clip.script'

// Numbers follow lessons/clip/README.md (see clip.script.ts). The embedding-space arrows are schematic (marked 모식도); the
// cosine tables are the lesson's own example values, and every other number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 27 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at }: { children: ReactNode; color?: string; at: number }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Appear>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 400, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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
      {last && <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color, marginLeft: 8, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>{last}</span>}
    </div>
  )
}

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 25): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a text table whose columns can each fade in at their own time: first column sans, the rest mono */
function Table({ head, rows, widths, at, colAt = [], step = 0.5, size = 24, colors, align }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; colAt?: (number | undefined)[]; step?: number; size?: number; colors?: (string | undefined)[]; align?: ('left' | 'right')[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: align?.[i] ?? (i === 0 ? 'left' : 'right'), paddingRight: i === 0 ? 0 : 10, opacity: colAt[i] === undefined ? 1 : prog(t, colAt[i] as number) })
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            VISION · CLIP
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>CLIP</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            사진과 문장을 <span style={{ color: C.accent }}>같은 공간의 vector</span> 로
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            사진–글 쌍 4억 개로 학습해, 아무 문장이나 사진과 비교해 점수를 내는 model
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
      <Card x={64} y={140} w={880} h={310} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.orange}>이름표가 정해진 detector</Head>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 0.7) }}>COCO dataset 의 class 80 가지 가운데 하나를 고른다</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 1.2) }}>
            <span style={{ color: C.green, fontWeight: 700 }}>✓</span> "cup" 은 목록에 있다
          </span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 1.7) }}>
            <span style={{ color: C.red, fontWeight: 700 }}>✕</span> "파란 머그컵" 은 목록에 없다 → 사진을 모아 다시 학습
          </span>
        </div>
      </Card>
      <Card x={976} y={140} w={880} h={310} at={1.0}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.accent}>CLIP</Head>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 1.4) }}>사진 하나와 아무 문장 하나를 받아, 문장이 사진을 얼마나 잘 설명하는지 점수를 낸다</span>
          <span style={{ ...mono(C.accent, 24), opacity: prog(t, 2.2) }}>"a photo of a blue mug" → 점수</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 2.8) }}>이름표 목록이 없어서, 찾을 물체가 바뀌면 문장만 바꾼다</span>
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 480, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          이름이 하나 늘 때마다 <span style={{ color: C.accent }}>사진을 모아 다시 학습해야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={610} w={1260} h={250} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16, opacity: prog(t, 5.8) }}>
          <Label size={23}>OK-Robot (2024) · CLIP 계열 model 로 물체를 찾아 집어 옮기기</Label>
          <Bar label="처음 가 본 집 10 곳 · 학습 없이" value={58.5} max={100} color={C.green} at={6.1} width={520} unit="%" labelW={400} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.9) }}>찾을 물체가 바뀌어도 detector 를 다시 학습하지 않고, 문장만 바꿨다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. similarity matrix and InfoNCE ----------

function Encoders() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, label: string, color: string, at: number, size = 21, isMono = false) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" fill={color} fontSize={size} fontWeight={600} fontFamily={isMono ? MONO : undefined}>
        {label}
      </text>
    </g>
  )
  const photos = ['고양이', '강아지', '자동차']
  const texts = ['소파 위의 고양이', '공원을 달리는 개', '길가의 빨간 자동차']
  // embedding space (schematic): angles in degrees
  const before: [string, number, string][] = [
    ['I1', 15, C.blue],
    ['T2', 40, C.orange],
    ['T3', 68, C.orange],
    ['I2', 100, C.blue],
    ['T1', 130, C.orange],
    ['I3', 165, C.blue],
  ]
  const after: [string, number, string][] = [
    ['I1', 152, C.blue],
    ['T1', 140, C.orange],
    ['I2', 118, C.blue],
    ['T2', 106, C.orange],
    ['I3', 32, C.blue],
    ['T3', 20, C.orange],
  ]
  const plot = (cx: number, items: [string, number, string][], at: number) =>
    items.map(([name, deg, color], i) => {
      const a = (deg * Math.PI) / 180
      const p = prog(t, at + i * 0.15)
      return (
        <g key={name} opacity={p}>
          {arrow(cx, 285, cx + 180 * Math.cos(a), 285 - 180 * Math.sin(a), color, 3, 12)}
          <text x={cx + 210 * Math.cos(a)} y={285 - 210 * Math.sin(a) + 8} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
            {name}
          </text>
        </g>
      )
    })
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1060} h={400} at={0.3}>
        <svg width={1060} height={400}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            두 encoder · 사진 3장과 설명 3개
          </text>
          {photos.map((p, i) => node(30 + i * 110, 80, 100, 60, p, C.blue, 0.6 + i * 0.15, 20))}
          {texts.map((s, i) => node(30, 175 + i * 52, 330, 44, s, C.orange, 1.0 + i * 0.15, 20))}
          <g opacity={prog(t, 1.6)}>{arrow(362, 110, 412, 110, C.blue)}</g>
          <g opacity={prog(t, 1.6)}>{arrow(366, 249, 414, 249, C.orange)}</g>
          {node(420, 80, 220, 60, 'image encoder', C.blue, 1.8)}
          {node(420, 219, 220, 60, 'text encoder', C.orange, 1.9)}
          <g opacity={prog(t, 2.3)}>{arrow(646, 110, 700, 110, C.blue)}</g>
          <g opacity={prog(t, 2.3)}>{arrow(646, 249, 700, 249, C.orange)}</g>
          {['I1', 'I2', 'I3'].map((s, i) => node(710 + i * 80, 85, 70, 50, s, C.blue, 2.5 + i * 0.12, 22, true))}
          {['T1', 'T2', 'T3'].map((s, i) => node(710 + i * 80, 224, 70, 50, s, C.orange, 2.6 + i * 0.12, 22, true))}
          <text x={30} y={340} fill={C.muted} fontSize={22} opacity={prog(t, 3.2)}>
            embedding: 사진이나 문장 하나 전체를 나타내는 vector
          </text>
          <text x={30} y={378} fill={C.accent} fontSize={22} fontWeight={600} opacity={prog(t, 7)}>
            projection 으로 길이를 맞춰 512 차원 · 자기 길이로 나눠 길이 1
          </text>
        </svg>
      </Card>
      <Box x={1156} y={140} w={700} h={400} at={6.5} title={<Head color={C.accent}>점수: cosine similarity</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>길이 1 인 두 vector 의 dot product</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 8) }}>같은 방향 1 · 직각 0 · 반대 방향 −1</span>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 13.2) }}>[3, 4] · [4, 3] ÷ 길이 5</span>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 14.4) }}>→ [0.6, 0.8] · [0.8, 0.6]</span>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 15.6) }}>0.6 × 0.8 + 0.8 × 0.6 = 0.96</span>
      </Box>
      <Card x={64} y={570} w={1792} h={310} at={19.5}>
        <svg width={1792} height={310}>
          <text x={330} y={40} textAnchor="middle" fill={C.muted} fontSize={24} fontWeight={600}>
            학습 전 · 방향이 제멋대로
          </text>
          <text x={1150} y={40} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 21.5)}>
            학습 후 · 짝끼리 같은 방향
          </text>
          <circle cx={330} cy={285} r={5} fill={C.muted} />
          {plot(330, before, 19.8)}
          <g opacity={prog(t, 21.2)}>
            <text x={740} y={170} textAnchor="middle" fill={C.accent} fontSize={24} fontWeight={600}>
              학습
            </text>
            {arrow(680, 200, 800, 200, C.accent, 4, 14)}
          </g>
          <g opacity={prog(t, 21.5)}>
            <circle cx={1150} cy={285} r={5} fill={C.muted} />
          </g>
          {plot(1150, after, 21.6)}
          <g opacity={prog(t, 20)}>
            <circle cx={1432} cy={103} r={8} fill={C.blue} />
            <text x={1450} y={110} fill={C.blue} fontSize={21}>
              사진 embedding
            </text>
            <circle cx={1432} cy={143} r={8} fill={C.orange} />
            <text x={1450} y={150} fill={C.orange} fontSize={21}>
              설명 embedding
            </text>
            <text x={1420} y={200} fill={C.dim} fontSize={20}>
              512 차원 → 2 차원 모식도
            </text>
          </g>
          <text x={1420} y={240} fill={C.muted} fontSize={20} opacity={prog(t, 23)}>
            고양이와 개는 가깝고
          </text>
          <text x={1420} y={268} fill={C.muted} fontSize={20} opacity={prog(t, 23)}>
            자동차는 멀다
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Matrix() {
  const t = useSec()
  const S = [
    [0.8, 0.5, 0.1],
    [0.6, 0.7, 0.2],
    [0.0, 0.1, 0.9],
  ]
  const cols = ['T1 고양이', 'T2 개', 'T3 자동차']
  const rowsL = ['I1 고양이 사진', 'I2 강아지 사진', 'I3 자동차 사진']
  const cx = (j: number) => 200 + j * 160
  const cy = (i: number) => 115 + i * 100
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={480} at={0.3}>
        <svg width={760} height={480}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            유사도 행렬 · 예로 정한 cosine
          </text>
          {cols.map((c, j) => (
            <text key={c} x={cx(j) + 80} y={96} textAnchor="middle" fill={C.orange} fontSize={21} fontWeight={600}>
              {c}
            </text>
          ))}
          {rowsL.map((r, i) => (
            <text key={r} x={30} y={cy(i) + 58} fill={C.blue} fontSize={21} fontWeight={600}>
              {r}
            </text>
          ))}
          {S.map((row, i) =>
            row.map((v, j) => {
              const diag = i === j
              return (
                <g key={`${i}${j}`} opacity={prog(t, 0.6 + (i * 3 + j) * 0.08)}>
                  <rect x={cx(j) + 4} y={cy(i) + 4} width={152} height={92} rx={10} fill={diag ? `${C.green}33` : C.grid} stroke={diag ? C.green : C.cardEdge} strokeWidth={2} />
                  <text x={cx(j) + 80} y={cy(i) + 62} textAnchor="middle" fill={diag ? C.green : C.text} fontSize={34} fontFamily={MONO} fontWeight={600}>
                    {v.toFixed(1)}
                  </text>
                </g>
              )
            }),
          )}
          <rect x={200} y={215} width={480} height={100} rx={12} fill="none" stroke={C.accent} strokeWidth={4} opacity={prog(t, 6.6)} />
          <text x={30} y={452} fill={C.muted} fontSize={21} opacity={prog(t, 2.5)}>
            대각선 = positive (짝) · 나머지 = negative
          </text>
        </svg>
      </Card>
      <Box x={64} y={650} w={760} h={230} at={18.5} gap={10} title={<Head size={24}>logit 의 gradient = 확률 − (정답 칸이면 1)</Head>}>
        <Bar label="T1 고양이" value={0.2676} max={0.3} color={C.red} at={18.8} width={300} labelW={150} fmt="+0.2676" />
        <Bar label="T2 개 (정답)" value={0.2725} max={0.3} color={C.green} at={19.4} width={300} labelW={150} fmt="−0.2725" />
        <Bar label="T3 자동차" value={0.0049} max={0.3} color={C.muted} at={20} width={300} labelW={150} fmt="+0.0049" />
      </Box>
      <Box x={856} y={140} w={1000} h={440} at={6.5} gap={12} title={<Head color={C.accent}>강아지 사진 I2 행 · τ = 0.1 로 나눠 softmax</Head>}>
        <Table
          at={6.8}
          step={0.4}
          size={24}
          head={['설명', 'cosine', '÷ τ', 'exp(s − 7)', '확률']}
          widths={[220, 130, 100, 190, 160]}
          colors={[C.text, C.green, C.text]}
          rows={[
            ['T1 고양이 설명', '0.6', '6', '0.3679', '0.2676'],
            ['T2 개 설명 (정답)', '0.7', '7', '1', '0.7275'],
            ['T3 자동차 설명', '0.2', '2', '0.0067', '0.0049'],
          ]}
        />
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 9.5) }}>합 1.3746 → 1 ÷ 1.3746 = 0.7275</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 12.8) }}>loss = −log 0.7275 = 0.318</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 14.4) }}>행 0.049 · 0.318 · 0.000 → 평균 0.122</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 16) }}>열 평균 0.086 → (0.122 + 0.086) ÷ 2 = 0.104</span>
      </Box>
      <Box x={856} y={600} w={1000} h={280} at={24.5} gap={10} title={<Head color={C.purple}>CLIP 의 batch</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.8) }}>batch 에 쌍 32,768 개 → 사진 하나의 negative 32,767 개</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 25.6) }}>유사도 행렬 32,768 × 32,768 ≈ 10억 7천만 칸</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 26.6) }}>처음엔 점수가 모두 비슷 → 확률 1/B → loss 는 log B 에서 시작</span>
        <span style={{ ...mono(C.purple, 25), opacity: prog(t, 27.6) }}>log 32768 ≈ 10.4</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 2. temperature and zero-shot ----------

function Temperature() {
  const t = useSec()
  const base = 380
  const H = 270
  const group = (x0: number, vals: number[], color: string, at: number) =>
    vals.map((v, i) => {
      const x = x0 + i * 120
      const h = Math.max(2, v * H * prog(t, at + i * 0.15, 0.8))
      return (
        <g key={i} opacity={prog(t, at)}>
          <rect x={x} y={base - h} width={80} height={h} rx={6} fill={i === 0 ? color : C.muted} opacity={i === 0 ? 1 : 0.6} />
          <text x={x + 40} y={base - v * H - 10} textAnchor="middle" fill={i === 0 ? color : C.muted} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.6)}>
            {v.toFixed(3)}
          </text>
          <text x={x + 40} y={408} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
            {`T${i + 1}`}
          </text>
        </g>
      )
    })
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={470} at={0.3}>
        <svg width={880} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            고양이 사진 I1 행의 확률 (정답 T1)
          </text>
          <text x={200} y={80} textAnchor="middle" fill={C.red} fontSize={22} opacity={prog(t, 0.5)}>
            logit 0.8, 0.5, 0.1
          </text>
          <text x={620} y={80} textAnchor="middle" fill={C.green} fontSize={22} opacity={prog(t, 6.6)}>
            logit 8, 5, 1
          </text>
          <line x1={60} x2={820} y1={base} y2={base} stroke={C.cardEdge} strokeWidth={2} />
          {group(80, [0.447, 0.331, 0.222], C.red, 0.6)}
          {group(500, [0.952, 0.047, 0.001], C.green, 6.8)}
          <text x={200} y={448} textAnchor="middle" fill={C.red} fontSize={23} fontWeight={600} opacity={prog(t, 3)}>
            τ = 1 · loss 0.805
          </text>
          <text x={620} y={448} textAnchor="middle" fill={C.green} fontSize={23} fontWeight={600} opacity={prog(t, 9)}>
            τ = 0.1 · loss 0.049
          </text>
        </svg>
      </Card>
      <Box x={976} y={140} w={880} h={470} at={12.5} title={<Head color={C.red}>τ 로 나누지 않으면 · loss 의 하한</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 12.8) }}>cosine 은 −1 ~ 1 · 가장 좋은 행: 정답 1, 나머지 −1</span>
        <span style={{ ...mono(C.text, 25), opacity: prog(t, 14) }}>B = 3 → 정답 확률 ≈ 0.787</span>
        <span style={{ ...mono(C.text, 25), opacity: prog(t, 15.2) }}>B = 32,768 → 정답 확률 ≈ 0.000225</span>
        <span style={{ ...line(C.red, 23), opacity: prog(t, 16.4) }}>loss 는 8.4 아래로 내려가지 못한다 · 시작점 10.4 에서 2 정도만 준다</span>
        <span style={{ ...line(C.accent, 23), opacity: prog(t, 17.8) }}>τ 로 나누면 점수 차이가 1/τ 배 → 순서는 그대로, 확률은 정답에 몰린다</span>
      </Box>
      <Card x={64} y={640} w={1792} h={240} at={19}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 18 }}>
          <Head color={C.purple}>logit scale = 1/τ · CLIP 은 τ 도 encoder 와 함께 학습</Head>
          <Flow steps={['시작 τ = 0.07', 'logit scale 1 ÷ 0.07 ≈ 14.3', '상한 100 · τ ≥ 0.01', 'ViT-B/32 저장값 4.6052']} color={C.purple} at={19.4} gap={1.2} last="exp(4.6052) = 100.0" />
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 25) }}>학습이 끝났을 때 logit scale 은 상한 100 에 닿아 있었다 · 저자들은 상한이 없으면 학습이 불안정했다고 보고</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function ZeroShot() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1000} h={420} at={0.3} title={<Head color={C.accent}>zero-shot 분류 · 처음 보는 고양이 사진 (예로 정한 cosine)</Head>}>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 0.8) }}>class 이름을 넣은 prompt → text encoder → 사진 embedding 과 cosine 비교</span>
        <Table
          at={6.6}
          step={0.35}
          size={24}
          head={['prompt', 'cosine', '× 100', '확률', '× 100 없이']}
          widths={[220, 140, 120, 150, 190]}
          colAt={[undefined, undefined, 7.8, 9.2, 12.8]}
          colors={[C.green, C.text, C.text, C.text]}
          rows={[
            ['"고양이 사진"', '0.30', '30', '0.952', '0.265'],
            ['"개 사진"', '0.27', '27', '0.047', '0.257'],
            ['"자동차 사진"', '0.18', '18', '0.000', '0.235'],
            ['"새 사진"', '0.22', '22', '0.000', '0.244'],
          ]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14.5) }}>
          cosine 차이 0.03 이 × 100 으로 3 이 되어 확률이 <span style={mono(C.green, 24)}>0.952 대 0.047</span> 로 벌어진다
        </span>
      </Box>
      <Box x={1096} y={140} w={760} h={420} at={18.5} title={<Head color={C.green}>가장 큰 CLIP model · ImageNet zero-shot</Head>}>
        <span style={{ fontFamily: MONO, fontSize: 64, fontWeight: 600, color: C.green, lineHeight: 1.2, opacity: prog(t, 18.8) }}>76.2%</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 19.4) }}>label 달린 ImageNet 학습 사진 128만 장을 하나도 쓰지 않음</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.6) }}>그 사진으로 직접 학습한 원래의 ResNet-50 과 같은 수준</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.8) }}>학습 예시(shot) 0 개로 푸는 분류</span>
      </Box>
      <Box x={64} y={590} w={1792} h={290} at={24} title={<Head color={C.orange}>prompt 의 문구 · CLIP 논문의 ImageNet 결과</Head>}>
        <Table
          at={24.3}
          step={0.6}
          size={24}
          head={['prompt 를 만드는 방법', 'zero-shot 정확도 변화']}
          widths={[1000, 500]}
          colors={[C.muted, C.text, C.orange]}
          rows={[
            ['class 이름만 넣기', '기준'],
            ['"A photo of a {label}." template 하나', '+1.3%p'],
            ['template 80 개로 만든 embedding 의 평균 (ensemble)', '거기서 +3.5%p 더'],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. limits and SigLIP ----------

function Limits() {
  const t = useSec()
  const weak: [string, string][] = [
    ['개수 세기', '합성 장면의 물체 수 세기 (CLEVRCounts)'],
    ['위치 관계', '단어 순서만 다른 설명의 구분'],
    ['세밀한 구분', '차의 모델, 꽃의 종, 비행기 기종'],
    ['거리', '가장 가까운 차까지의 거리 분류 (KITTI Distance)'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.red}>CLIP 이 약한 일 · 설명 글에 잘 안 적히는 정보</Head>}>
        {weak.map(([a, b], i) => (
          <span key={a} style={{ ...line(C.text, 23), opacity: prog(t, 0.8 + i * 0.6) }}>
            <span style={{ color: C.red, fontWeight: 700 }}>✕</span> <span style={{ fontWeight: 600 }}>{a}</span> <span style={{ color: C.muted }}>· {b}</span>
          </span>
        ))}
      </Box>
      <Box x={976} y={140} w={880} h={330} at={6} title={<Head color={C.accent}>관계 시험 · 순서만 바꾼 설명 둘 중 하나 고르기</Head>}>
        <Bar label="무작위로 고를 때" value={50} max={100} color={C.dim} at={6.4} width={360} labelW={300} unit="%" />
        <Bar label="CLIP ViT-B/32 관계 전체" value={59} max={100} color={C.blue} at={7.2} width={360} labelW={300} unit="%" />
        <Bar label="위 · 아래 · 뒤 공간 관계" value={56} max={100} color={C.blue} at={8} width={360} labelW={300} unit="%" />
        <span style={{ ...line(C.dim, 21), opacity: prog(t, 9) }}>Yuksekgonul 등 (2023)</span>
      </Box>
      <Card x={64} y={500} w={880} h={380} at={12.5}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head>batch 안에서 짝 고르기</Head>
          <span style={{ ...line(C.green, 23), opacity: prog(t, 12.8), fontWeight: 600 }}>정답 설명 "말이 풀을 먹는다"</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 13.6) }}>다른 설명 "소파 위의 고양이" · "길가의 빨간 자동차"</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 15) }}>"말" 과 "풀" 이 들어 있는지만 봐도 구별된다</span>
          <span style={{ ...line(C.orange, 23), opacity: prog(t, 18.8) }}>"풀이 말을 먹는다" 와 단어가 같다 → 순서를 몰라도 loss 가 내려가서 순서를 배우지 않는다</span>
          <span style={{ ...line(C.dim, 22), opacity: prog(t, 21) }}>bag-of-words: 단어를 순서 없이 자루에 담은 것</span>
        </div>
      </Card>
      <Box x={976} y={500} w={880} h={380} at={24.5} title={<Head color={C.green}>NegCLIP · 순서를 바꾼 문장을 negative 로</Head>}>
        <Bar label="CLIP ViT-B/32" value={59} max={100} color={C.blue} at={24.8} width={360} labelW={300} unit="%" />
        <Bar label="COCO 로 다시 학습만" value={63} max={100} color={C.blue} at={25.4} width={360} labelW={300} unit="%" />
        <Bar label="NegCLIP" value={81} max={100} color={C.green} at={26} width={360} labelW={300} unit="%" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27) }}>헷갈리는 negative 가 있어야 그 차이를 구별하는 gradient 가 생긴다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Siglip() {
  const t = useSec()
  const S = [
    [0.8, 0.5, 0.1],
    [0.6, 0.7, 0.2],
    [0.0, 0.1, 0.9],
  ]
  const logit = [
    [3, 0, -4],
    [1, 2, -3],
    [-5, -4, 4],
  ]
  const loss = [
    ['0.049', '0.693', '0.018'],
    ['1.313', '0.127', '0.049'],
    ['0.007', '0.018', '0.018'],
  ]
  const sign = (v: number) => (v < 0 ? `−${-v}` : `${v}`)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={760} h={350} at={0.3} gap={12} title={<Head>CLIP · 행마다 softmax</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 96px)', gap: 6 }}>
          {S.flatMap((row, i) =>
            row.map((v, j) => (
              <div key={`${i}${j}`} style={{ height: 46, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 24, fontWeight: 600, background: i === 1 ? `${C.accent}22` : C.grid, border: `1.5px solid ${i === 1 ? C.accent : C.cardEdge}`, color: i === j ? C.green : C.text, opacity: prog(t, 0.6 + (i * 3 + j) * 0.06) }}>
                {v.toFixed(1)}
              </div>
            )),
          )}
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2) }}>softmax 의 분모 = 그 행의 모든 칸을 더한 값</span>
        <span style={{ ...line(C.red, 23), opacity: prog(t, 3.4) }}>→ 여러 GPU 에 나눠도 모든 embedding 을 서로 주고받는다</span>
      </Box>
      <Card x={856} y={140} w={1000} h={740} at={6.5}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.accent}>SigLIP · 칸마다 sigmoid 로 짝인지 따로 판정</Head>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 7.4) }}>logit = t × s + b · 예: t = 10, b = −5</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 8.6) }}>sigmoid σ 는 숫자를 0 ~ 1 로: σ(0) = 0.5, σ(3) = 0.953, σ(−3) = 0.047</span>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(3, 260px)', gap: 10, alignItems: 'center' }}>
            <span />
            {['T1', 'T2', 'T3'].map((c) => (
              <span key={c} style={{ ...mono(C.orange, 22), textAlign: 'center', opacity: prog(t, 9.4) }}>
                {c}
              </span>
            ))}
            {logit.flatMap((row, i) => [
              <span key={`r${i}`} style={{ ...mono(C.blue, 22), opacity: prog(t, 9.4) }}>{`I${i + 1}`}</span>,
              ...row.map((v, j) => {
                const diag = i === j
                const hot = i === 1 && j === 0
                const edge = hot ? C.red : diag ? C.green : C.cardEdge
                return (
                  <div key={`${i}${j}`} style={{ height: 104, borderRadius: 12, border: `${hot ? 3 : 1.5}px solid ${hot ? (prog(t, 13.2) > 0 ? C.red : C.cardEdge) : edge}`, background: diag ? `${C.green}1c` : C.grid, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 4, opacity: prog(t, 9.8 + (i * 3 + j) * 0.12) }}>
                    <span style={{ fontSize: 20, color: C.muted }}>
                      <span>{`logit ${sign(v)} · ${diag ? '짝' : '짝 아님'}`}</span>
                    </span>
                    <span style={{ ...mono(hot ? C.red : diag ? C.green : C.text, 32) }}>{loss[i][j]}</span>
                  </div>
                )
              }),
            ])}
          </div>
          <span style={{ ...mono(C.red, 23), opacity: prog(t, 14) }}>I2 · T1: 10 × 0.6 − 5 = 1 → σ(−1) = 0.269 → −log 0.269 = 1.313</span>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 19.8) }}>아홉 칸 합 2.292 ÷ B 3 = 0.764</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 21.6) }}>다른 칸을 더하는 분모가 없어서 GPU 마다 자기가 맡은 칸만 계산한다</span>
        </div>
      </Card>
      <Box x={64} y={515} w={760} h={365} at={22.4} gap={12} title={<Head color={C.green}>시작값과 batch (SigLIP 논문)</Head>}>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 22.7) }}>시작 t = 10, b = −10 → σ(−10) ≈ 0.00005</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.3) }}>
          짝의 비율 <span style={mono(C.text, 23)}>1 ÷ 32,768 ≈ 0.00003</span> · 처음부터 크게 틀리지 않는다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24) }}>batch 를 100만까지 키워 봤지만 32,000 정도면 충분</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 24.7) }}>SigLiT: TPUv4 칩 4 개 · 이틀 · ImageNet zero-shot 84.5%</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. robots ----------

function OpenVocab() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, label: string, color: string, at: number, size = 22, isMono = false) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fill={color} fontSize={size} fontWeight={600} fontFamily={isMono ? MONO : undefined}>
        {label}
      </text>
    </g>
  )
  const objects: [string, number][] = [
    ['A  파란 머그컵', 0.31],
    ['B  흰 머그컵', 0.26],
    ['C  파란 책', 0.22],
    ['D  운동화', 0.12],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={320} at={0.3}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head color={C.accent}>YOLO-World · open-vocabulary detector</Head>
          <Flow steps={['"cup"', 'CLIP text encoder', '이름의 embedding', '영역마다 embedding 과 비교', 'bounding box']} color={C.accent} at={0.8} gap={0.6} />
          <div style={{ display: 'flex', gap: 16 }}>
            <Chip at={6.8} color={C.green}>
              LVIS · class 1203 개 · 학습에 안 씀
            </Chip>
            <Chip at={7.6} color={C.green}>
              V100 GPU · 1초에 사진 52 장
            </Chip>
            <Chip at={8.4} color={C.green}>
              35.4 AP
            </Chip>
          </div>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 9.4) }}>찾을 이름의 embedding 은 한 번만 계산해 detector 의 weight 처럼 넣어 둔다 · "cup" 을 "screwdriver" 로 바꿔도 다시 학습하지 않는다</span>
        </div>
      </Card>
      <Card x={64} y={490} w={1100} h={390} at={12}>
        <svg width={1100} height={390}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            OK-Robot · 이름으로 물체를 찾아 집기
          </text>
          <text x={1070} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            점수는 설명용 예
          </text>
          {node(30, 90, 230, 56, '"blue mug"', C.accent, 12.3, 22, true)}
          <g opacity={prog(t, 12.6)}>{arrow(264, 118, 306, 118, C.accent)}</g>
          {node(310, 90, 220, 56, 'text encoder', C.accent, 12.8)}
          <g opacity={prog(t, 13.1)}>{arrow(534, 118, 586, 118, C.accent)}</g>
          {node(590, 90, 230, 56, '질의 embedding', C.accent, 13.3)}
          <g opacity={prog(t, 13.6)}>{arrow(705, 150, 705, 190, C.accent)}</g>
          <text x={50} y={206} fill={C.muted} fontSize={21} opacity={prog(t, 13.8)}>
            물체 memory · 위치와 CLIP embedding
          </text>
          <text x={420} y={206} fill={C.muted} fontSize={21} opacity={prog(t, 13.8)}>
            질의와의 cosine
          </text>
          {objects.map(([name, v], i) => {
            const y = 240 + i * 38
            const best = i === 0
            const p = prog(t, 14.4 + i * 0.4)
            return (
              <g key={name} opacity={p}>
                <text x={50} y={y} fill={best ? C.green : C.text} fontSize={22} fontWeight={best ? 700 : 500}>
                  {name}
                </text>
                <text x={420} y={y} fill={best ? C.green : C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {v.toFixed(2)}
                </text>
                <rect x={490} y={y - 20} width={v * 1000 * p} height={24} rx={5} fill={best ? C.green : C.muted} opacity={best ? 1 : 0.5} />
              </g>
            )
          })}
          <g opacity={prog(t, 18.6)}>{arrow(806, 230, 858, 230, C.green)}</g>
          {node(860, 202, 210, 56, 'A 의 위치로 이동', C.green, 18.8)}
          <g opacity={prog(t, 19.3)}>{arrow(965, 262, 965, 302, C.green)}</g>
          {node(860, 306, 210, 56, 'AnyGrasp 로 집기', C.green, 19.6, 20)}
        </svg>
      </Card>
      <Box x={1196} y={490} w={660} h={390} at={18.5} title={<Head color={C.green}>OK-Robot · 처음 가 본 집 10 곳</Head>}>
        <Bar label="성공률" value={58.5} max={100} color={C.green} at={21} width={260} labelW={200} unit="%" />
        <Bar label="조건을 다듬은 뒤" value={82.4} max={100} color={C.green} at={25.6} width={260} labelW={200} unit="%" />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.3) }}>171 번 중 가장 많은 실패: 엉뚱한 물체를 찾음 9.3%</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.4) }}>조건: 질의 문장을 다듬고 주변을 치우고, 너무 크거나 투명하거나 미끄러운 물체를 뺀다</span>
      </Box>
    </AbsoluteFill>
  )
}

function PolicyVla() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, lines: [string, string][], color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      {lines.map(([s, c], i) => (
        <text key={s} x={x + w / 2} y={y + 38 + i * 32} textAnchor="middle" fill={c} fontSize={i === 0 ? 22 : 20} fontWeight={i === 0 ? 600 : 500}>
          {s}
        </text>
      ))}
    </g>
  )
  const vla: [string, string, number][] = [
    ['PaliGemma', 'VLM · SigLIP So400m + Gemma-2B 언어 model', 14],
    ['π0', 'PaliGemma 의 weight 에서 출발해 로봇 데이터로 더 학습', 14.8],
    ['OpenVLA', 'SigLIP 과 DINOv2 의 출력을 이어 붙여 Llama 2 에', 19.8],
    ['SmolVLA', 'SmolVLM-2 의 SigLIP · 사진 한 장을 visual token 64 개로', 16.6],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={420} at={0.3}>
        <svg width={880} height={420}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            CLIPort · What 과 Where 두 갈래
          </text>
          {node(30, 170, 200, 120, [['지시문', C.text], ['+ 사진', C.muted]], C.muted, 0.6)}
          <g opacity={prog(t, 1)}>{arrow(232, 205, 288, 150, C.accent)}</g>
          <g opacity={prog(t, 1.6)}>{arrow(232, 255, 288, 300, C.orange)}</g>
          {node(290, 80, 330, 120, [['semantic stream', C.accent], ['CLIP 의 두 encoder', C.text], ['어느 물체인지', C.muted]], C.accent, 1.2)}
          {node(290, 240, 330, 120, [['spatial stream', C.orange], ['Transporter network', C.text], ['어디를 집고 놓을지', C.muted]], C.orange, 2.4)}
          <g opacity={prog(t, 3.2)}>{arrow(622, 150, 688, 205, C.accent)}</g>
          <g opacity={prog(t, 3.2)}>{arrow(622, 300, 688, 255, C.orange)}</g>
          {node(690, 180, 160, 100, [['action', C.green], ['집기 · 놓기', C.muted]], C.green, 3.6)}
          <text x={30} y={400} fill={C.muted} fontSize={21} opacity={prog(t, 4.4)}>
            CLIP 의 image encoder 는 학습 중 고정
          </text>
        </svg>
      </Card>
      <Box x={64} y={590} w={880} h={290} at={6.5} title={<Head color={C.orange}>CLIPort 의 학습 · Franka Panda 팔</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>실제 작업 9 가지를 하는 multi-task model 하나</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 8) }}>
          image–action 쌍 <span style={mono(C.orange, 24)}>179</span> 개로 학습
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.6) }}>simulation 에서는 시연에 없던 "pink" 같은 색 이름을 잘 다루지 못했다</span>
      </Box>
      <Box x={976} y={140} w={880} h={500} at={13} title={<Head color={C.purple}>VLA 의 사진 입력 · SigLIP image encoder</Head>}>
        {vla.map(([name, desc, at]) => (
          <div key={name} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ ...mono(C.purple, 25), width: 200, flexShrink: 0 }}>{name}</span>
            <span style={line(C.text, 23)}>{desc}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.4) }}>OpenVLA 저자들: SigLIP + DINOv2 조합으로 만든 policy 가 LLaVA 로 만든 policy 보다 성공률 약 10%p 높음</span>
      </Box>
      <Box x={976} y={665} w={880} h={215} at={22.8} color={`${C.green}66`} title={<Head color={C.green}>CLIP 은 점수를 낼 뿐 action 을 내지 않는다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.1) }}>VLA 는 patch token 을 전부 언어 model 에 넘겨 위치 정보를 지킨다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.9) }}>action 은 언어 model 이나 그 뒤에 따로 붙인 부분이 낸다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: '유사도 행렬과 InfoNCE', color: C.accent, text: 'τ 0.1 로 나눈 softmax · 정답 0.7275 · loss 0.318 · 평균 0.104', at: 0.6 },
    { tag: 'temperature · 분류', color: C.blue, text: 'τ 1 → 0.447, τ 0.1 → 0.952 · logit scale ≤ 100 · zero-shot 76.2%', at: 4.4 },
    { tag: '약점과 SigLIP', color: C.orange, text: '관계 시험 59% (무작위 50%) · NegCLIP 81% · SigLIP loss 0.764', at: 8.4 },
    { tag: '로봇에서의 쓰임', color: C.green, text: 'YOLO-World 35.4 AP · OK-Robot 58.5% · CLIPort 179 쌍 · VLA 의 SigLIP', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            물체 이름이 늘 때마다 다시 학습해야 할까? → <span style={{ color: C.accent }}>문장만 바꾸면 된다</span>
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 31, fontWeight: 600 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>RT-2 → OpenVLA · π0</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            RT-2 → OpenVLA · patch token 을 언어 model 에 넘기고 action 까지 token 으로 생성
          </Label>
        </Appear>
        <Appear at={1.4}>
          <Label color={C.muted} size={32}>
            π0 · SigLIP 을 쓰는 PaliGemma 에 action 을 내는 부분을 따로 붙인 VLA
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/clip (CLIP · SigLIP · NegCLIP · CLIPort · YOLO-World · OK-Robot 논문)
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
    question="batch 에 쌍이 4 개이고 모든 점수가 같다. 처음 loss 는 얼마이고, 사진 하나가 비교하는 negative 는 몇 개인가? (log 4 = 1.386)"
    answer={
      <>
        softmax 가 네 설명에 1/4 씩 → loss = −log (1/4) = log 4 = 1.386
        <br />
        negative 는 자기 짝을 뺀 4 − 1 = 3 개
      </>
    }
  />
)

const PauseScale = () => (
  <PauseWrite
    question="logit scale 이 50 이면 τ 는 얼마이고, cosine similarity 0.5 와 0.3 의 logit 차이는 얼마인가?"
    answer={
      <>
        logit scale = 1/τ → τ = 1 ÷ 50 = 0.02
        <br />
        logit 0.5 × 50 = 25 · 0.3 × 50 = 15 → 차이 10 (cosine 차이 0.2 의 50 배)
      </>
    }
  />
)

const PauseSig = () => (
  <PauseWrite
    question="t = 10, b = −5 에서 cosine 0.9 인 짝의 칸과 cosine 0.5 인 짝이 아닌 칸의 loss 는? (σ(4) = 0.982, σ(0) = 0.5)"
    answer={
      <>
        짝: logit 9 − 5 = 4 → −log 0.982 ≈ 0.018
        <br />
        짝 아님: logit 5 − 5 = 0 → −log 0.5 = 0.693 · 짝일 확률을 0.5 로 봐서 loss 가 크다
      </>
    }
  />
)

const PauseSwap = () => (
  <PauseWrite
    question='CLIP embedding memory 의 로봇이 찾을 물체를 "blue mug" 에서 "red screwdriver" 로 바꾸면 무엇을 다시 계산할까?'
    answer={
      <>
        text encoder 로 "red screwdriver" 의 질의 embedding 하나만 새로 계산
        <br />
        memory 의 물체별 위치 · embedding 은 그대로 → cosine 만 다시 계산 · 다시 학습할 필요 없음
      </>
    }
  />
)

export function Clip() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        encoders: Encoders,
        matrix: Matrix,
        'pause-batch': PauseBatch,
        temperature: Temperature,
        'zero-shot': ZeroShot,
        'pause-scale': PauseScale,
        limits: Limits,
        siglip: Siglip,
        'pause-sig': PauseSig,
        'open-vocab': OpenVocab,
        'policy-vla': PolicyVla,
        'pause-swap': PauseSwap,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
