import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './vit.narration.json'
import { script } from './vit.script'

// Numbers follow lessons/vit/README.md (see vit.script.ts). The photo, cup and grid drawings are schematic (marked 모식도);
// every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
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


/** a square grid of `n` × `n` cells; `fill(r, c)` gives each cell's colour */
function Grid({ x, y, n, cell, fill, stroke = C.cardEdge, sw = 1 }: { x: number; y: number; n: number; cell: number; fill: (r: number, c: number) => string; stroke?: string; sw?: number }) {
  const cells = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push(<rect key={`${r}-${c}`} x={x + c * cell} y={y + r * cell} width={cell} height={cell} fill={fill(r, c)} stroke={stroke} strokeWidth={sw} />)
  return <g>{cells}</g>
}

/** evenly spaced grid lines over a square, for "this photo is cut into k × k pieces" */
function GridLines({ x, y, size, k, color, opacity = 1, sw = 1 }: { x: number; y: number; size: number; k: number; color: string; opacity?: number; sw?: number }) {
  const ls = []
  for (let i = 1; i < k; i++) {
    const d = (size * i) / k
    ls.push(<line key={`v${i}`} x1={x + d} y1={y} x2={x + d} y2={y + size} stroke={color} strokeWidth={sw} opacity={opacity} />)
    ls.push(<line key={`h${i}`} x1={x} y1={y + d} x2={x + size} y2={y + d} stroke={color} strokeWidth={sw} opacity={opacity} />)
  }
  return <g>{ls}</g>
}

/** a schematic camera photo: table, a red cup, a little background */
function Photo({ x, y, size }: { x: number; y: number; size: number }) {
  const u = size / 16
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="#16233a" />
      <rect x={x} y={y + 10 * u} width={size} height={6 * u} fill="#2a3448" />
      <rect x={x + 9 * u} y={y + 6 * u} width={3 * u} height={4.5 * u} rx={u * 0.4} fill={C.red} />
      <rect x={x + 2 * u} y={y + 4 * u} width={4 * u} height={6 * u} fill="#24324d" />
    </g>
  )
}

// the lesson's 4×4 example photo (white 1, black 0) and photo B with patches 1 and 4 swapped
const IMG_A = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 1, 1],
]
const IMG_B = [
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
]
const px = (v: number) => (v ? C.text : C.bg)

/** a 4×4 example photo with its 2×2 patch borders */
function Tiny({ x, y, cell, img }: { x: number; y: number; cell: number; img: number[][] }) {
  return (
    <g>
      <Grid x={x} y={y} n={4} cell={cell} fill={(r, c) => px(img[r][c])} />
      <rect x={x} y={y} width={cell * 4} height={cell * 4} fill="none" stroke={C.accent} strokeWidth={3} />
      <line x1={x + cell * 2} y1={y} x2={x + cell * 2} y2={y + cell * 4} stroke={C.accent} strokeWidth={3} />
      <line x1={x} y1={y + cell * 2} x2={x + cell * 4} y2={y + cell * 2} stroke={C.accent} strokeWidth={3} />
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
            VISION · VISION TRANSFORMER
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ViT</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontSize: 36, color: C.muted }}>
            사진을 <span style={{ color: C.accent }}>patch</span> 로 잘라 <span style={{ color: C.accent }}>token</span> 으로 읽는 Transformer
          </div>
        </Appear>
        <Appear at={1.2}>
          <div style={{ fontFamily: MONO, fontSize: 36, color: C.text }}>224×224 사진 → 16×16 patch 196 개 → token 196 개</div>
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
      <Panel x={64} y={140} w={1792} h={400}>
        <svg width={420} height={400} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 0.4)}>
            <Photo x={50} y={36} size={300} />
            <GridLines x={50} y={36} size={300} k={14} color={C.text} opacity={0.18} />
            <text x={200} y={372} textAnchor="middle" fill={C.muted} fontSize={22}>
              224×224 컬러 사진 · 모식도
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 420, top: 40, width: 1330, display: 'grid', gap: 18 }}>
          <span style={{ ...line(C.muted, 26), opacity: prog(t, 0.6) }}>로봇 카메라 사진 한 장 · pixel 마다 빨강 · 초록 · 파랑의 세기 하나씩</span>
          <span style={{ ...mono(C.accent, 48), opacity: prog(t, 1) }}>3 × 224 × 224 = 150,528 개</span>
          <div style={{ marginTop: 10 }}>
            <Flow steps={['카메라 사진', '어떤 단위로 자를까?', 'Transformer', '로봇 행동']} color={C.accent} at={2} />
          </div>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 3) }}>OpenVLA · π0 같은 VLA 는 글 token 을 읽도록 만든 Transformer 에 이 사진을 넣는다</span>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 585, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', textWrap: 'balance' }}>
          단어도 글자도 아닌 숫자 격자를, Transformer 는 <span style={{ color: C.accent }}>어떤 단위로 잘라 읽을까?</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- 1. patch and token count ----------

function Patches() {
  const t = useSec()
  const sq = 300
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={740} at={5.6}>
        <svg width={880} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            224×224 사진을 무엇으로 자를까
          </text>
          <text x={850} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <g opacity={prog(t, 5.9)}>
            <Photo x={50} y={80} size={sq} />
            <GridLines x={50} y={80} size={sq} k={56} color={C.text} opacity={0.22} />
            <text x={200} y={422} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
              pixel 하나 = token
            </text>
            <text x={200} y={458} textAnchor="middle" fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              token 50,176 개
            </text>
            <text x={200} y={494} textAnchor="middle" fill={C.red} fontSize={24}>
              점수 표 약 25억 칸
            </text>
          </g>
          <g opacity={prog(t, 11.4)}>
            <Photo x={500} y={80} size={sq} />
            <GridLines x={500} y={80} size={sq} k={14} color={C.accent} opacity={0.7} sw={1.5} />
            <rect x={500 + (sq / 14) * 9} y={80 + (sq / 14) * 6} width={sq / 14} height={sq / 14} fill="none" stroke={C.orange} strokeWidth={3} />
            <text x={650} y={422} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
              16×16 patch = token
            </text>
            <text x={650} y={458} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              token 196 개
            </text>
            <text x={650} y={494} textAnchor="middle" fill={C.green} fontSize={24}>
              점수 표 38,416 칸
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 540, width: 820, display: 'grid', gap: 12, opacity: prog(t, 17.4) }}>
          <span style={mono(C.accent, 30)}>N = H/P × W/P</span>
          <span style={line(C.text, 24)}>
            224×224 를 16 으로: <span style={mono(C.text, 24)}>224 ÷ 16 = 14 → 14 × 14 = 196 개</span>
          </span>
          <span style={line(C.text, 24)}>
            컬러 patch 하나를 펼치면 <span style={mono(C.orange, 24)}>3 × 16 × 16 = 768 개</span> 숫자
          </span>
        </div>
      </Card>
      <Box x={976} y={140} w={880} h={300} at={0.3} title={<Head color={C.accent}>attention 의 점수 표</Head>}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          <svg width={180} height={180}>
            <Grid x={0} y={0} n={6} cell={30} fill={(r, c) => (r === c ? `${C.accent}66` : `${C.accent}${['18', '30', '22', '12', '28', '1c'][(r * 5 + c * 3) % 6]}`)} />
          </svg>
          <div style={{ display: 'grid', gap: 12 }}>
            <span style={line(C.text, 26)}>token 쌍마다 점수 하나</span>
            <span style={mono(C.accent, 30)}>token N 개 → N × N 칸</span>
            <span style={line(C.muted, 22)}>글 token 이든 사진 token 이든 같은 계산</span>
          </div>
        </div>
      </Box>
      <Box x={976} y={470} w={880} h={410} at={22.8} title={<Head color={C.orange}>patch 크기별 token 수 (224×224 사진)</Head>}>
        <Table
          head={['patch 크기', '한 변', 'token', '점수 표 칸']}
          widths={[190, 170, 170, 250]}
          at={23}
          step={0.3}
          colors={[undefined, C.accent, undefined, undefined]}
          rows={[
            ['32', '7', '49', '2,401'],
            ['16', '14', '196', '38,416'],
            ['14', '16', '256', '65,536'],
            ['8', '28', '784', '614,656'],
          ]}
        />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 24.8) }}>
          32 → 16: token <span style={mono(C.orange, 24)}>49 → 196 (4 배)</span> · 점수 표 <span style={mono(C.orange, 24)}>2,401 → 38,416 (16 배)</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Embed() {
  const t = useSec()
  const x0 = 50
  const y0 = 90
  const cell = 56
  const cols = [450, 510, 570, 630]
  const E = [
    ['1', '1', '1', '1'],
    ['1', '−1', '1', '−1'],
  ]
  // the 2×2 filter jumping by stride 2 over a 4×4 grid
  const k = Math.min(3, Math.max(0, Math.floor((t - 22.6) / 1.4)))
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={740} at={0.3}>
        <svg width={1000} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            예: 4×4 흑백 사진 (흰 칸 1 · 검은 칸 0) 을 2×2 patch 로
          </text>
          <g opacity={prog(t, 0.5)}>
            <Tiny x={x0} y={y0 + 10} cell={cell} img={IMG_A} />
            {[
              ['1', x0 + cell, y0 - 6],
              ['2', x0 + cell * 3, y0 - 6],
              ['3', x0 + cell, y0 + 10 + cell * 4 + 32],
              ['4', x0 + cell * 3, y0 + 10 + cell * 4 + 32],
            ].map(([s, x, y]) => (
              <text key={s as string} x={x as number} y={y as number} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {s}
              </text>
            ))}
          </g>
          <g opacity={prog(t, 2)}>
            <text x={340} y={222} fill={C.text} fontSize={32} fontFamily={MONO} fontWeight={600}>
              E =
            </text>
            <path d="M420 150 h-10 v110 h10" fill="none" stroke={C.muted} strokeWidth={2.5} />
            <path d="M660 150 h10 v110 h-10" fill="none" stroke={C.muted} strokeWidth={2.5} />
            {E.map((row, r) =>
              row.map((v, c) => (
                <text key={`${r}-${c}`} x={cols[c]} y={192 + r * 60} textAnchor="middle" fill={r === 0 ? C.blue : C.orange} fontSize={30} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
              )),
            )}
          </g>
          <g opacity={prog(t, 7.3)}>
            <text x={700} y={192} fill={C.blue} fontSize={22}>
              ← 흰 칸 수
            </text>
            <text x={700} y={252} fill={C.orange} fontSize={22}>
              ← 왼쪽 − 오른쪽
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 380, width: 920 }}>
          <Table
            head={['patch', '펼친 vector x', 'e = E x']}
            widths={[140, 340, 260]}
            at={7.6}
            step={0.7}
            size={28}
            colors={[undefined, undefined, undefined, C.green]}
            rows={[
              ['1', '[0, 1, 0, 1]', '[2, −2]'],
              ['2', '[1, 0, 1, 0]', '[2, 2]'],
              ['3', '[0, 0, 0, 0]', '[0, 0]'],
              ['4', '[1, 1, 1, 1]', '[4, 0]'],
            ]}
          />
        </div>
        <div style={{ position: 'absolute', left: 40, top: 650, width: 920, opacity: prog(t, 11) }}>
          <span style={line(C.muted, 23)}>네 patch 에 모두 같은 E 를 곱한다 · 예에서는 사람이 정한 값, 실제로는 학습</span>
        </div>
      </Card>
      <Box x={1096} y={140} w={760} h={330} at={14.5} title={<Head color={C.accent}>ViT-B/16 의 patch embedding</Head>}>
        <span style={line(C.text, 24)}>
          patch 하나: <span style={mono(C.text, 24)}>3 × 16 × 16 = 768</span> 개 숫자
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 15.5) }}>
          E: <span style={mono(C.text, 24)}>768 × 768</span> 행렬 + bias <span style={mono(C.text, 24)}>768</span> 개
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 16.5) }}>
          parameter: <span style={mono(C.green, 24)}>768 × 768 + 768 = 590,592</span> 개
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18) }}>숫자 768 개를 768 개로 다시 적을 뿐, 수를 줄이는 압축이 아니다</span>
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={22} title={<Head color={C.orange}>convolution 으로 쓰면</Head>}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <svg width={180} height={180}>
            <Grid x={10} y={10} n={4} cell={40} fill={(r, c) => px(IMG_A[r][c])} />
            <rect x={10 + (k % 2) * 80} y={10 + Math.floor(k / 2) * 80} width={80} height={80} fill="none" stroke={C.orange} strokeWidth={4} />
          </svg>
          <div style={{ display: 'grid', gap: 8, width: 500 }}>
            <span style={mono(C.orange, 24)}>filter 크기 = stride = P</span>
            <span style={line(C.text, 22)}>2×2 filter 가 2 칸씩 건너뛰며 patch 하나씩을 덮는다</span>
            <span style={line(C.text, 22)}>ViT-B/16: 16×16 filter 768 개, stride 16</span>
            <span style={line(C.muted, 22)}>patch 가 4 개든 196 개든 E 는 하나 (weight sharing)</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 2. [CLS] and position ----------

function Cls() {
  const t = useSec()
  const cx = [120, 320, 520, 720, 920]
  const names = ['[CLS]', 'patch 1', 'patch 2', 'patch 3', 'patch 4']
  const vecs = ['', '[2, −2]', '[2, 2]', '[0, 0]', '[4, 0]']
  const wA = [0.2, 0.2, 0.2, 0.2, 0.2]
  const wB = [0.037, 0.101, 0.101, 0.014, 0.747]
  const S = 160
  const bars = (w: number[], base: number, at: number, color: string) => (
    <g opacity={prog(t, at)}>
      <line x1={30} y1={base} x2={1010} y2={base} stroke={C.cardEdge} strokeWidth={2} />
      {w.map((v, i) => {
        const h = Math.max(2, v * S * prog(t, at, 0.9))
        return (
          <g key={i}>
            <rect x={cx[i] - 45} y={base - h} width={90} height={h} rx={4} fill={i === 4 && w === wB ? C.orange : color} />
            <text x={cx[i]} y={base - v * S - 10} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.7)}>
              {v}
            </text>
          </g>
        )
      })}
    </g>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1040} h={740} at={0.3}>
        <svg width={1040} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 6)}>
            예: patch 4 개 앞에 [CLS] 붙이기
          </text>
          <text x={1010} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 6)}>
            query · key · value 없는 간단한 attention
          </text>
          {names.map((n, i) => {
            const o = i === 0 ? prog(t, 6.2) : prog(t, 0.5 + i * 0.2)
            const isCls = i === 0
            return (
              <g key={n} opacity={o}>
                <rect x={cx[i] - 85} y={76} width={170} height={110} rx={14} fill={isCls ? `${C.accent}1c` : C.bg} stroke={isCls ? C.accent : C.cardEdge} strokeWidth={2} />
                <text x={cx[i]} y={114} textAnchor="middle" fill={isCls ? C.accent : C.muted} fontSize={22} fontWeight={600}>
                  {n}
                </text>
                {isCls ? (
                  <>
                    <text x={cx[i]} y={164} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={1 - prog(t, 18, 0.4)}>
                      [0, 0]
                    </text>
                    <text x={cx[i]} y={164} textAnchor="middle" fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 18, 0.4)}>
                      [1, 0]
                    </text>
                  </>
                ) : (
                  <text x={cx[i]} y={164} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {vecs[i]}
                  </text>
                )}
              </g>
            )
          })}
          {bars(wA, 410, 12.3, C.blue)}
          {bars(wB, 650, 18.3, C.blue)}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 218, width: 980, opacity: prog(t, 12) }}>
          <span style={line(C.text, 24)}>
            [CLS] = <span style={mono(C.text, 24)}>[0, 0]</span> → 점수가 모두 0 → weight <span style={mono(C.blue, 24)}>0.2</span> 씩 → 출력은 평균 <span style={mono(C.green, 24)}>[1.6, 0]</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 446, width: 980, opacity: prog(t, 18) }}>
          <span style={line(C.text, 24)}>
            [CLS] = <span style={mono(C.accent, 24)}>[1, 0]</span> → 흰 사각형 patch 4 의 weight <span style={mono(C.orange, 24)}>0.747</span> → 출력 <span style={mono(C.green, 24)}>[3.429, 0]</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 684, width: 980, opacity: prog(t, 6.6) }}>
          <span style={line(C.dim, 21)}>[CLS] 의 처음 vector 는 학습하는 parameter · 어떤 사진이든 같은 값에서 출발해 patch 에서 정보를 모은다</span>
        </div>
      </Card>
      <Box x={1136} y={140} w={720} h={300} at={0.3} title={<Head color={C.accent}>층은 받은 token 수만큼 내보낸다</Head>}>
        <span style={mono(C.text, 24)}>patch token 4 개 → 층 → vector 4 개</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 2.5) }}>사진에 무엇이 찍혔는지 답 하나에는 vector 하나가 필요</span>
        <span style={{ ...line(C.accent, 24), opacity: prog(t, 6.5) }}>ViT: 맨 앞에 [CLS] 를 붙여, 마지막 층의 그 자리 출력을 사진의 요약으로</span>
      </Box>
      <Box x={1136} y={470} w={720} h={410} at={24} title={<Head color={C.orange}>ViT-B/16 의 [CLS] 와 head</Head>}>
        <span style={line(C.text, 24)}>
          token: patch 196 + [CLS] 1 = <span style={mono(C.green, 26)}>197 개</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 25.2) }}>head: [CLS] 출력 → LayerNorm → Linear 하나 → class 마다 점수</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 26.4) }}>
          ImageNet 1,000 class: <span style={mono(C.orange, 24)}>768 × 1,000 + 1,000 = 769,000</span> 개 parameter
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.6) }}>다른 일에 쓸 때는 head 만 떼고 새 head 를 붙인다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Position() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={420} at={0.3}>
        <svg width={900} height={420}>
          <text x={148} y={50} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
            사진 A
          </text>
          <text x={568} y={50} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
            사진 B (patch 1 ↔ 4)
          </text>
          <Tiny x={60} y={74} cell={44} img={IMG_A} />
          <g opacity={prog(t, 0.8)}>
            <Tiny x={480} y={74} cell={44} img={IMG_B} />
            <text x={358} y={176} textAnchor="middle" fill={C.red} fontSize={56} fontWeight={700}>
              ≠
            </text>
            <text x={358} y={218} textAnchor="middle" fill={C.muted} fontSize={20}>
              다른 그림
            </text>
          </g>
          <g opacity={prog(t, 2.5)}>
            <text x={40} y={292} fill={C.text} fontSize={21} fontFamily={MONO}>
              [2,−2] [2,2] [0,0] [4,0]
            </text>
            <text x={460} y={292} fill={C.text} fontSize={21} fontFamily={MONO}>
              [4,0] [2,2] [0,0] [2,−2]
            </text>
          </g>
          <g opacity={prog(t, 4.5)}>
            <text x={40} y={342} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              [CLS] 출력 [1.6, 0]
            </text>
            <text x={368} y={342} textAnchor="middle" fill={C.green} fontSize={30} fontWeight={700}>
              =
            </text>
            <text x={460} y={342} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              [CLS] 출력 [1.6, 0]
            </text>
            <text x={40} y={392} fill={C.dim} fontSize={21}>
              위치 정보가 없으면 token 의 모음이 같아서 출력도 같다
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={590} w={900} h={290} at={21.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
          <Label size={22} color={C.text} weight={600}>
            위치 정보에 따른 정확도 (ViT-B/16 · class 마다 5 장 · 논문 부록 D.4)
          </Label>
          <Bar label="없음" value={61.38} max={70} color={C.red} at={22} width={380} unit="%" fmt="61.38" />
          <Bar label="자리마다 학습 (기본값)" value={64.21} max={70} color={C.accent} at={22.6} width={380} unit="%" fmt="64.21" />
          <Bar label="가로 · 세로 따로" value={64.0} max={70} color={C.blue} at={23.2} width={380} unit="%" fmt="64.00" />
          <Bar label="relative 방식" value={64.03} max={70} color={C.purple} at={23.8} width={380} unit="%" fmt="64.03" />
        </div>
      </Card>
      <Box x={996} y={140} w={860} h={740} at={7.5} title={<Head color={C.accent}>position embedding: 자리마다 vector 하나를 더한다</Head>}>
        <span style={line(C.text, 24)}>같은 흰 사각형 token [4, 0] 도 자리 4 와 자리 1 에서 더하는 vector 가 달라 서로 다른 vector 가 된다</span>
        <div style={{ opacity: prog(t, 9) }}>
          <Table head={['자리', '0 · [CLS]', '1', '2', '3', '4']} widths={[180, 140, 120, 120, 120, 110]} at={9} rows={[['예로 고른 값', '[1, 0]', '[0, 1]', '[0, −1]', '[−1, 0]', '[0, 0]']]} />
        </div>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 11) }}>
          더하면 [CLS] 출력: A <span style={mono(C.green, 24)}>[3.454, 0]</span> · B <span style={mono(C.green, 24)}>[3.454, 0.651]</span> → 달라진다
        </span>
        <div style={{ height: 1.5, background: C.cardEdge, opacity: prog(t, 14.5) }} />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 14.6) }}>ViT-B/16: 자리 197 개 ([CLS] 1 + patch 196)</span>
        <span style={{ ...mono(C.green, 30), opacity: prog(t, 15.4) }}>197 × 768 = 151,296 개 숫자</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 16.6) }}>sin · cos 식으로 계산하지 않고, 무작위 값에서 출발해 학습한다</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 18) }}>학습 뒤에는 가까운 patch, 같은 행 · 열의 patch 끼리 vector 가 비슷해진다 (논문 그림 7)</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. inductive bias ----------

function Bias() {
  const t = useSec()
  const c = t < 7.2 ? 0 : Math.min(4, Math.floor((t - 7.2) / 1.2))
  const cell = 46
  const ix = 40
  const iy = 64
  const ox = 560
  const oy = 125
  const oc = 40
  // the one patch that looks at every other patch
  const pc = 72
  const px0 = 40
  const py0 = 70
  const centre = (r: number, k: number) => [px0 + k * pc + pc / 2, py0 + r * pc + pc / 2]
  const [hx, hy] = centre(1, 1)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={540} at={0.3}>
        <svg width={880} height={540}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            CNN 의 첫 층
          </text>
          <text x={850} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <Grid x={ix} y={iy} n={7} cell={cell} fill={(r, k) => (r >= 2 && r <= 4 && k >= c && k <= c + 2 ? `${C.accent}44` : C.bg)} />
          <rect x={ix + c * cell} y={iy + 2 * cell} width={cell * 3} height={cell * 3} fill="none" stroke={C.accent} strokeWidth={4} />
          {arrow(400, iy + 3.5 * cell, ox - 14, oy + 2.5 * oc, C.accent, 3)}
          <Grid x={ox} y={oy} n={5} cell={oc} fill={(r, k) => (r === 2 && k === c ? C.accent : C.bg)} />
          <text x={ix + 3.5 * cell} y={416} textAnchor="middle" fill={C.muted} fontSize={22}>
            입력 pixel
          </text>
          <text x={ox + 2.5 * oc} y={362} textAnchor="middle" fill={C.muted} fontSize={22}>
            출력 feature map
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 440, width: 820, display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.accent, 23), opacity: prog(t, 0.8) }}>locality · 출력 한 칸은 가까운 3×3 만 본다</span>
          <span style={{ ...line(C.orange, 23), opacity: prog(t, 7.2) }}>translation equivariance · 같은 filter 를 모든 자리에 쓴다</span>
        </div>
      </Card>
      <Card x={976} y={140} w={880} h={540} at={13.6}>
        <svg width={880} height={540}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            ViT 의 첫 층
          </text>
          <Grid x={px0} y={py0} n={4} cell={pc} fill={(r, k) => (r === 1 && k === 1 ? C.accent : C.bg)} />
          <g opacity={prog(t, 20.6)}>
            {[0, 1, 2, 3].flatMap((r) =>
              [0, 1, 2, 3]
                .filter((k) => !(r === 1 && k === 1))
                .map((k) => {
                  const [x, y] = centre(r, k)
                  return <line key={`${r}-${k}`} x1={hx} y1={hy} x2={x} y2={y} stroke={C.accent} strokeWidth={2} opacity={0.7} />
                }),
            )}
            {[0, 1, 2, 3].flatMap((r) =>
              [0, 1, 2, 3].map((k) => {
                const [x, y] = centre(r, k)
                return <circle key={`d${r}-${k}`} cx={x} cy={y} r={5} fill={C.accent} />
              }),
            )}
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 370, top: 80, width: 470, display: 'grid', gap: 14 }}>
          <span style={{ ...line(C.text, 26), fontWeight: 600, opacity: prog(t, 20.6) }}>
            patch 하나가
            <br />
            모든 patch 를 한 번에 본다
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.6) }}>self-attention 은 첫 층부터 사진 전체를 본다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.6) }}>가까운 곳끼리 보고 모든 자리에 같은 계산을 쓰는 부분은 token 마다 따로 계산하는 MLP 뿐 (논문 3.1 절)</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 440, width: 820, opacity: prog(t, 24) }}>
          <span style={line(C.orange, 23)}>position embedding 도 무작위 값에서 출발 → patch 사이의 공간 관계는 모두 데이터에서 배운다</span>
        </div>
      </Card>
      <Box x={64} y={706} w={1792} h={174} at={13.5} gap={8} title={<Head color={C.accent}>inductive bias: 데이터를 보기 전에 모델 구조로 정해 둔 가정</Head>}>
        <span style={line(C.text, 23)}>CNN: locality · translation equivariance 를 구조에 담아, 가정이 맞으면 적은 데이터로도 빨리 배운다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.5) }}>ViT: 사진이 2차원 격자라는 정보는 patch 로 자르는 단계와 position embedding 의 interpolation 에만 있다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Data() {
  const t = useSec()
  const yv = (v: number) => 560 - (v - 70) * 21
  const groups: { name: string; n: string; b: number; l: number; at: number }[] = [
    { name: 'ImageNet', n: '130만 장', b: 77.91, l: 76.53, at: 6.2 },
    { name: 'ImageNet-21k', n: '1,400만 장', b: 83.97, l: 85.15, at: 12.7 },
    { name: 'JFT-300M', n: '3억 300만 장', b: 84.15, l: 87.12, at: 13.4 },
  ]
  const gx = [330, 600, 870]
  const bar = (cx: number, v: number, color: string, at: number) => {
    const p = prog(t, at, 0.9)
    const top = lerpY(v, p)
    return (
      <g>
        <rect x={cx - 42} y={top} width={84} height={560 - top} rx={4} fill={color} />
        <text x={cx} y={yv(v) - 10} textAnchor="middle" fill={C.text} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.7)}>
          {v.toFixed(2)}%
        </text>
      </g>
    )
  }
  const lerpY = (v: number, p: number) => 560 - (560 - yv(v)) * p
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={740} at={6}>
        <svg width={1100} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            미리 학습한 데이터 크기와 ImageNet 정확도 (논문 부록 표 5)
          </text>
          <rect x={30} y={70} width={20} height={20} rx={3} fill={C.blue} />
          <text x={58} y={88} fill={C.text} fontSize={22}>
            ViT-B/16 (86M)
          </text>
          <rect x={300} y={70} width={20} height={20} rx={3} fill={C.orange} />
          <text x={328} y={88} fill={C.text} fontSize={22}>
            ViT-L/16 (307M)
          </text>
          <line x1={110} y1={140} x2={110} y2={560} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={110} y1={560} x2={1060} y2={560} stroke={C.cardEdge} strokeWidth={2} />
          {[70, 75, 80, 85, 90].map((v) => (
            <g key={v}>
              <line x1={102} y1={yv(v)} x2={110} y2={yv(v)} stroke={C.muted} strokeWidth={2} />
              <text x={96} y={yv(v) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v}%
              </text>
            </g>
          ))}
          {groups.map((g, i) => (
            <g key={g.name} opacity={prog(t, g.at - 0.2, 0.3)}>
              {bar(gx[i] - 50, g.b, C.blue, g.at)}
              {bar(gx[i] + 50, g.l, C.orange, g.at + 0.3)}
              <text x={gx[i]} y={600} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                {g.name}
              </text>
              <text x={gx[i]} y={632} textAnchor="middle" fill={C.muted} fontSize={20}>
                {g.n}
              </text>
            </g>
          ))}
          <text x={30} y={700} fill={C.dim} fontSize={20}>
            ImageNet 으로 fine-tuning 해 잰 값 · 세로축은 70% 부터 · JFT-300M 은 Google 내부 데이터
          </text>
        </svg>
      </Card>
      <Box x={1196} y={140} w={660} h={330} at={0.3} title={<Head color={C.accent}>가정이 적으면 데이터가 더 필요하다</Head>}>
        <span style={line(C.text, 24)}>같은 데이터에 맞는 규칙이 여럿이다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 2) }}>하나를 고르려면 데이터가 더 많이 필요하다</span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 3.6) }}>충분하면 가정에 맞지 않는 규칙도 데이터에서 배운다</span>
      </Box>
      <Box x={1196} y={500} w={660} h={380} at={19} title={<Head color={C.orange}>CNN 과 비교</Head>}>
        <span style={line(C.text, 23)}>BiT (큰 ResNet): ImageNet 만으로 학습하면 ViT 보다 높았고, 데이터가 커지자 ViT 가 앞섰다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21) }}>계산량이 비슷한 ViT-B/32 는 ResNet50 보다 900만 장에서 훨씬 낮고, 9,000만 장 이상에서 더 높았다</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 24.6) }}>ACT: 과제마다 시연 50 개 정도 → ResNet-18</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 26) }}>VLA: 인터넷의 사진과 글 수억 쌍 이상 → ViT</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. ViT encoders in robot policies ----------

function Vla() {
  const t = useSec()
  const y = 150
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <svg width={1792} height={330}>
          <g opacity={prog(t, 0.4)}>
            <Photo x={40} y={50} size={200} />
            <GridLines x={40} y={50} size={200} k={16} color={C.text} opacity={0.25} />
            <text x={140} y={285} textAnchor="middle" fill={C.muted} fontSize={22}>
              224×224 사진
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            {arrow(252, y, 296, y, C.muted)}
            <rect x={300} y={95} width={240} height={110} rx={16} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={2} />
            <text x={420} y={142} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              SigLIP
            </text>
            <text x={420} y={180} textAnchor="middle" fill={C.muted} fontSize={20}>
              ViT 구조
            </text>
            <text x={420} y={240} textAnchor="middle" fill={C.muted} fontSize={20}>
              patch 14 → 16 × 16 = 256
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            {arrow(550, y, 600, y, C.muted)}
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={610} y={62 + i * 22} width={180} height={16} rx={4} fill={i === 3 ? C.pink : `${C.accent}${i % 2 ? '66' : '99'}`} />
            ))}
            <text x={700} y={276} textAnchor="middle" fill={C.text} fontSize={22}>
              patch token 256 개 전부
            </text>
          </g>
          <g opacity={prog(t, 2)}>
            {arrow(800, y, 846, y, C.muted)}
            <rect x={850} y={95} width={300} height={110} rx={16} fill={`${C.purple}14`} stroke={C.purple} strokeWidth={2} />
            <text x={1000} y={142} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              언어 모델
            </text>
            <text x={1000} y={180} textAnchor="middle" fill={C.muted} fontSize={20}>
              attention
            </text>
            <rect x={850} y={8} width={300} height={46} rx={12} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={1000} y={39} textAnchor="middle" fill={C.text} fontSize={21}>
              지시문: <tspan fill={C.pink}>빨간 컵</tspan> 집어
            </text>
            {arrow(1000, 56, 1000, 92, C.muted)}
          </g>
          <g opacity={prog(t, 2.6)}>
            {arrow(1160, y, 1206, y, C.muted)}
            <rect x={1210} y={95} width={200} height={110} rx={16} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
            <text x={1310} y={159} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              로봇 행동
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 1450, top: 70, width: 310, display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.red, 24), opacity: prog(t, 1) }}>✕ 분류: [CLS] 하나</span>
          <span style={{ ...line(C.green, 24), opacity: prog(t, 2.8) }}>✓ VLA: patch token 전부</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.4) }}>컵이 어디 있는지가 남는다</span>
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 9) }}>OpenVLA 논문: patch-as-token</span>
        </div>
      </Card>
      <Box x={64} y={500} w={880} h={380} at={14} title={<Head color={C.accent}>세 VLA 의 사진 입력 (224×224 한 장)</Head>}>
        <Table
          head={['VLA', 'image encoder', 'token']}
          widths={[220, 440, 140]}
          at={14.3}
          colors={[undefined, undefined, C.orange]}
          rows={[
            ['OpenVLA', 'SigLIP + DINOv2', '256'],
            ['π0', 'SigLIP So400m/14', '256'],
            ['GR00T N1', 'SigLIP-2', '64'],
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>So400m: parameter 약 4억 개의 ViT · /14 는 patch 크기</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18) }}>GR00T N1: 이웃한 token 을 합치는 pixel shuffle 로 64 개까지 줄인다</span>
      </Box>
      <Box x={976} y={500} w={880} h={380} at={21.5} title={<Head color={C.orange}>OpenVLA: patch 마다 두 encoder 출력을 이어 붙인다</Head>}>
        <div style={{ display: 'flex', width: 760, height: 56, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ width: (760 * 1152) / 2176, background: `${C.blue}cc`, display: 'grid', placeItems: 'center' }}>
            <span style={mono(C.bg, 22)}>SigLIP 1,152</span>
          </div>
          <div style={{ width: (760 * 1024) / 2176, background: `${C.purple}cc`, display: 'grid', placeItems: 'center', opacity: prog(t, 22.4) }}>
            <span style={mono(C.bg, 22)}>DINOv2 1,024</span>
          </div>
        </div>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 23.4) }}>1,152 + 1,024 = 2,176 개짜리 vector 256 개</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.8) }}>→ MLP projector → Llama 2 의 token 길이 4,096</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.2) }}>SigLIP 은 무엇이 있는지를, DINOv2 는 위치와 모양 같은 공간 정보를 더 담는다 (Prismatic 저자들의 해석)</span>
      </Box>
    </AbsoluteFill>
  )
}

function Cost() {
  const t = useSec()
  const s = 800 / 73
  const segs: [number, string, string][] = [
    [14, C.blue, 'image encoder (사진 3 장)'],
    [32, C.accent, '사진 · 지시문 token 의 언어 모델 계산'],
    [27, C.orange, '행동 계산 10 번'],
  ]
  let x = 40
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={400} at={0.3}>
        <svg width={900} height={200}>
          <text x={30} y={44} fill={C.text} fontSize={22} fontWeight={600}>
            π0 가 행동 한 덩어리를 내는 시간 (RTX 4090 · 사진 3 장)
          </text>
          {segs.map(([v, color], i) => {
            const x0 = x
            x += v * s
            return (
              <g key={i} opacity={prog(t, 0.6 + i * 0.4)}>
                <rect x={x0} y={130} width={v * s - 3} height={50} rx={6} fill={color} />
                <text x={x0 + (v * s) / 2} y={164} textAnchor="middle" fill={C.bg} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {v} ms
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 3.5)}>
            <path d={`M40 122 v-10 h${46 * s - 3} v10`} fill="none" stroke={C.accent} strokeWidth={2} />
            <text x={40} y={98} fill={C.accent} fontSize={22} fontWeight={600}>
              사진 token 을 다루는 두 단계 · 14 + 32 = 46 ms
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 206, width: 820, display: 'grid', gap: 8 }}>
          {segs.map(([v, color, name], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 1 + i * 0.4) }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: color }} />
              <span style={{ ...line(C.text, 23), width: 600 }}>{name}</span>
              <span style={mono(color, 24)}>{v} ms</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 2.4) }}>
            <span style={{ width: 18 }} />
            <span style={{ ...line(C.text, 23), width: 600, fontWeight: 600 }}>합 (로봇에 붙은 컴퓨터)</span>
            <span style={mono(C.text, 24)}>73 ms</span>
          </div>
        </div>
      </Card>
      <Card x={64} y={570} w={900} h={310} at={7.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <Label size={24} color={C.text} weight={600}>
            PaliGemma 의 사진 크기와 image token
          </Label>
          <Bar label="224 × 224" value={256} max={4096} color={C.blue} at={8} width={470} unit=" 개" fmt="256" labelW={200} />
          <Bar label="448 × 448" value={1024} max={4096} color={C.accent} at={8.8} width={470} unit=" 개" fmt="1,024" labelW={200} />
          <Bar label="896 × 896" value={4096} max={4096} color={C.orange} at={9.6} width={470} unit=" 개" fmt="4,096" labelW={200} />
          <span style={{ ...line(C.accent, 22), opacity: prog(t, 11) }}>사진 한 변이 2 배 → token 2 × 2 = 4 배</span>
        </div>
      </Card>
      <Box x={996} y={140} w={860} h={330} at={15} title={<Head color={C.accent}>OpenVLA 의 사진 크기 비교</Head>}>
        <span style={line(C.text, 24)}>224×224 와 384×384: 로봇 작업 성공률은 차이 없음</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 16.6) }}>384×384 는 학습 시간이 3 배</span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 18.2) }}>→ 저자들은 224×224 를 골랐다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 19.6) }}>로봇에서는 token 수가 반응 시간을 좌우한다</span>
      </Box>
      <Box x={996} y={500} w={860} h={380} at={22} title={<Head color={C.orange}>image encoder 를 고정할까, 함께 학습할까</Head>}>
        <span style={line(C.dim, 21)}>OpenVLA 에서 두 방법을 모두 시험한 과제들의 평균 성공률</span>
        <Bar label="encoder 고정" value={46.7} max={100} color={C.red} at={22.5} width={400} unit="%" fmt="46.7" labelW={230} />
        <Bar label="함께 fine-tuning" value={80.0} max={100} color={C.green} at={23.5} width={400} unit="%" fmt="80.0" labelW={230} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.5) }}>인터넷 사진으로 미리 학습한 encoder 는 정밀한 동작에 필요한 세밀한 위치 정보가 부족하다고 저자들은 추측했다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '224×224 를 patch 16 으로 → 14 × 14 = 196 token · patch 한 변 절반이면 점수 표 16 배', at: 1 },
    { tag: script.sections[1], color: C.blue, text: '[CLS] 를 붙여 197 개 · 위치 정보 없음 61.38% → 학습한 position embedding 64.21%', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'ViT-L/16: ImageNet 130만 장 76.53% → JFT-300M 약 3억 장 87.12%', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'patch token 전부 넘기기 · 한 장 256 개 (GR00T N1 64 개) · encoder 고정 46.7% → fine-tuning 80.0%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            숫자 격자인 사진을 Transformer 는 어떤 단위로 잘라 읽을까?
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
            NEXT · VISION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>CLIP</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            image encoder 를 text encoder 와 함께 학습해 문장으로 개념을 지정하기
          </Label>
        </Appear>
        <Appear at={1.6}>
          <Label color={C.text} size={30}>
            이어서 <span style={{ fontFamily: MONO, color: C.accent }}>RT-2 → OpenVLA</span> · <span style={{ fontFamily: MONO, color: C.accent }}>π0</span>
          </Label>
        </Appear>
        <Appear at={2.2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/vit (ViT · DINOv2 · PaliGemma · OpenVLA · π0 · GR00T N1 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PausePatch = () => (
  <PauseWrite
    question="96×96 컬러 사진을 16×16 patch 로 자르면 patch 는 몇 개이고, patch 하나를 펼치면 숫자가 몇 개인가?"
    answer={
      <>
        patch 수: 96 ÷ 16 = 6 → 6 × 6 = 36 개
        <br />
        patch 하나: 3 × 16 × 16 = 768 개 (사진 크기와 관계없다)
      </>
    }
  />
)

const PausePos = () => (
  <PauseWrite
    question="224×224 로 학습한 ViT-B/16 에 448×448 사진을 넣으면 patch 는 몇 개이고, position embedding 표의 patch 자리 196 개의 몇 배인가?"
    answer={
      <>
        448 ÷ 16 = 28 → 28 × 28 = 784 개
        <br />
        784 ÷ 196 = 4 배 → interpolation 으로 표를 늘린다
      </>
    }
  />
)

const PauseData = () => (
  <PauseWrite
    question="미리 학습한 데이터를 ImageNet (130만 장) 에서 JFT-300M (3억 300만 장) 으로 바꾸면 ViT-B/16 과 ViT-L/16 의 정확도는 각각 몇 %p 오르는가?"
    answer={
      <>
        ViT-B/16: 84.15 − 77.91 = 6.24%p
        <br />
        ViT-L/16: 87.12 − 76.53 = 10.59%p
      </>
    }
  />
)

const PausePi0 = () => (
  <PauseWrite
    question="π0 가 카메라 2 대의 사진 (224×224, patch 14) 과 text token 16 개짜리 지시문을 받으면, 언어 모델에 들어가는 token 은 모두 몇 개인가?"
    answer={
      <>
        사진 한 장 16 × 16 = 256 개 → 두 장 2 × 256 = 512 개
        <br />
        지시문을 더해 512 + 16 = 528 개
      </>
    }
  />
)

export function Vit() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        patches: Patches,
        embed: Embed,
        'pause-patch': PausePatch,
        cls: Cls,
        position: Position,
        'pause-pos': PausePos,
        bias: Bias,
        data: Data,
        'pause-data': PauseData,
        vla: Vla,
        cost: Cost,
        'pause-pi0': PausePi0,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
