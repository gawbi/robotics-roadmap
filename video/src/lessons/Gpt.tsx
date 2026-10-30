import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './gpt.narration.json'
import { script } from './gpt.script'

// Numbers follow lessons/gpt/README.md (see gpt.script.ts). The logits, scores and per-position probabilities are the
// lesson's own illustrative values (marked 설명용); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 18px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11, opacity = 1, dash?: string) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a simple text table: first column sans, the rest mono (or all sans and left-aligned with `plain`) */
function Table({ head, rows, widths, at, step = 0.5, size = 24, colors, plain = false }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; plain?: boolean }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({
    width: widths[i],
    fontFamily: i === 0 || plain ? undefined : MONO,
    fontSize: size,
    whiteSpace: 'nowrap',
    textAlign: i === 0 || plain ? 'left' : 'right',
    paddingRight: i === 0 || plain ? 0 : 10,
  })
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

const TOK = [C.green, C.blue, C.orange, C.red] // 집어, 놓아, 밀어, 던져
const NAMES = ['집어', '놓아', '밀어', '던져']

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            LANGUAGE · GPT-2
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>GPT-2</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            다음 token 을 맞히는 <span style={{ color: C.accent }}>decoder-only Transformer</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            웹 문서 약 800 만 개 (40 GB) 에서 다음 token 맞히기만 배운 2019 년의 language model
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
      <Box x={64} y={140} w={1792} h={290} at={0.3} title={<Head color={C.muted} size={24}>배운 것은 다음 조각 하나 맞히기뿐</Head>} gap={22}>
        <Flow steps={['웹 문서 약 800 만 개 (40 GB)', '다음 token 하나 맞히기', 'GPT-2 (2019)']} color={C.blue} at={0.6} />
        <Flow steps={['카메라 영상 + 지시문', 'Llama 2 7B', '행동 하나 = token 7 개']} color={C.green} at={2} />
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          다음 조각 하나를 맞히는 모델이 어떻게 <span style={{ color: C.accent }}>긴 글을 쓰고 로봇의 움직임까지 낼까?</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- S1: next-token probabilities and loss ----------

function Probs() {
  const t = useSec()
  const counts = [6, 2, 1, 1]
  const logits = ['2.0', '1.0', '0.5', '−1.0']
  const ez = ['7.389', '2.718', '1.649', '0.368']
  const p = [0.609, 0.224, 0.136, 0.03]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={110} at={0.3}>
        <Flow steps={['앞의 token 들: "빨간 컵"', 'language model', 'vocabulary 의 token 마다 다음에 올 확률']} color={C.accent} at={0.5} />
      </Box>
      <Box x={64} y={270} w={860} h={610} at={6} title={<Head color={C.green}>지시문 10 개를 세어 만든 확률표</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          {counts.map((c, i) => (
            <Bar key={i} label={NAMES[i]} value={c / 10} max={1} color={TOK[i]} at={6.3 + i * 0.4} width={360} labelW={110} fmt={`${c} ÷ 10 = ${c / 10}`} />
          ))}
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 18, opacity: prog(t, 12) }}>
          <Head color={C.red} size={24}>세어 두는 방법의 한계</Head>
          <span style={line(C.text, 23)}>
            GPT-2 의 vocabulary: token <span style={mono(C.orange, 24)}>50,257</span> 개
          </span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 18) }}>
            token 2 개짜리 앞부분: <span style={mono(C.orange, 24)}>50,257 × 50,257 ≈ 25 억</span> 가지
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 19.5) }}>실제 앞부분은 수백 token 이라 같은 앞부분이 두 번 나오기 드물다</span>
        </div>
      </Box>
      <Box x={956} y={270} w={900} h={610} at={18} title={<Head color={C.accent}>network 의 logit → softmax (설명용 값)</Head>}>
        <Table
          head={['후보 token', 'logit z', <span key="e">e<sup>z</sup></span>, <span key="p">e<sup>z</sup> ÷ 12.124</span>]}
          rows={[...NAMES.map((n, i) => [n, logits[i], ez[i], p[i].toFixed(3)]), ['합', '', '12.124', '1']]}
          widths={[160, 150, 170, 240]}
          at={18.3}
          step={0.35}
          colors={[...TOK, C.muted]}
        />
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {p.map((v, i) => (
            <Bar key={i} label={NAMES[i]} value={v} max={1} color={TOK[i]} at={24.3 + i * 0.35} width={460} labelW={110} fmt={v.toFixed(3)} />
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function ShiftDiagram({ t }: { t: number }) {
  const xs = [275, 465, 655, 845]
  const input = ['<bos>', '빨간', '컵', '집어']
  const target = ['빨간', '컵', '집어', '<eos>']
  const hi = prog(t, 2.4)
  return (
    <svg width={1000} height={420}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
        입력을 왼쪽으로 한 칸 밀면 정답 줄
      </text>
      <g opacity={prog(t, 0.5)}>
        {xs.map((x, i) => (
          <text key={i} x={x} y={92} textAnchor="middle" fill={C.dim} fontSize={20}>
            위치 {i + 1}
          </text>
        ))}
        <text x={30} y={148} fill={C.blue} fontSize={24} fontWeight={600}>
          입력 x
        </text>
        {xs.map((x, i) => (
          <g key={i}>
            <rect x={x - 75} y={112} width={150} height={56} rx={10} fill={`${C.blue}18`} stroke={i === 2 ? C.orange : C.blue} strokeWidth={i === 2 ? 2 + hi : 2} />
            <text x={x} y={148} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={input[i].startsWith('<') ? MONO : undefined}>
              {input[i]}
            </text>
          </g>
        ))}
      </g>
      <g opacity={prog(t, 1.4)}>
        <text x={30} y={274} fill={C.green} fontSize={24} fontWeight={600}>
          정답 y
        </text>
        {xs.map((x, i) => (
          <g key={i}>
            <rect x={x - 75} y={238} width={150} height={56} rx={10} fill={`${C.green}18`} stroke={i === 2 ? C.orange : C.green} strokeWidth={i === 2 ? 2 + hi : 2} />
            <text x={x} y={274} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={target[i].startsWith('<') ? MONO : undefined}>
              {target[i]}
            </text>
          </g>
        ))}
        {[1, 2, 3].map((k) => arrow(xs[k] - 20, 172, xs[k - 1] + 20, 234, C.muted, 2, 10, 0.8, '6 6'))}
      </g>
      <text x={30} y={338} fill={C.orange} fontSize={22} opacity={hi}>
        위치 3 은 "&lt;bos&gt; 빨간 컵" 만 보고 "집어" 를 맞힌다 · 길이 T + 1 조각 → 문제 T 개
      </text>
      <text x={30} y={374} fill={C.text} fontSize={21} opacity={prog(t, 6.2)}>
        self-supervised learning: 사람이 label 을 달지 않고 데이터 안에서 정답을 만든다
      </text>
      <text x={30} y={406} fill={C.muted} fontSize={21} opacity={prog(t, 7.6)}>
        GPT-1: BooksCorpus 책 7,000 권 남짓 · GPT-2: WebText 웹 문서 800 만 개 남짓, 40 GB
      </text>
    </svg>
  )
}

/** −log p for p in (0, 1], with the lesson's four example points */
function NegLog({ t, at }: { t: number; at: number }) {
  const X = (p: number) => 70 + p * 600
  const Y = (l: number) => 250 - (l / 3) * 220
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const p = 0.05 + (0.95 * i) / 60
    pts.push(`${X(p)},${Y(-Math.log(p))}`)
  }
  const ex: [number, number][] = [
    [0.5, 0.693],
    [0.609, 0.496],
    [0.8, 0.223],
    [0.9, 0.105],
  ]
  return (
    <svg width={704} height={300}>
      <g opacity={prog(t, at)}>
        <line x1={70} y1={250} x2={690} y2={250} stroke={C.cardEdge} strokeWidth={2} />
        <line x1={70} y1={20} x2={70} y2={250} stroke={C.cardEdge} strokeWidth={2} />
        {[0, 0.5, 1].map((p) => (
          <text key={p} x={X(p)} y={278} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {p}
          </text>
        ))}
        {[1, 2, 3].map((l) => (
          <text key={l} x={58} y={Y(l) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {l}
          </text>
        ))}
        <text x={520} y={278} textAnchor="end" fill={C.muted} fontSize={20}>
          정답 확률 p
        </text>
        <text x={300} y={60} fill={C.muted} fontSize={20}>
          loss = −log p
        </text>
        <polyline points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth={3} />
      </g>
      <g opacity={prog(t, at + 0.8)}>
        {ex.map(([p, l]) => (
          <circle key={p} cx={X(p)} cy={Y(l)} r={7} fill={C.orange} />
        ))}
        <circle cx={X(1)} cy={Y(0)} r={7} fill={C.green} />
        <text x={X(0.5) + 16} y={Y(0.693) - 14} fill={C.orange} fontSize={20} fontFamily={MONO}>
          p 0.5 → 0.693
        </text>
        <text x={X(1) - 6} y={Y(0) - 36} textAnchor="end" fill={C.green} fontSize={20} fontFamily={MONO}>
          p 1 → 0
        </text>
      </g>
    </svg>
  )
}

function Shift() {
  const t = useSec()
  const rows: [string, number, number][] = [
    ['위치 1 → 빨간', 0.5, 0.693],
    ['위치 2 → 컵', 0.8, 0.223],
    ['위치 3 → 집어', 0.609, 0.496],
    ['위치 4 → <eos>', 0.9, 0.105],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={420} at={0.3}>
        <ShiftDiagram t={t} />
      </Card>
      <Box x={1096} y={140} w={760} h={420} at={12} title={<Head color={C.accent}>cross-entropy: 위치마다 −log p</Head>} gap={6}>
        <NegLog t={t} at={12.3} />
      </Box>
      <Box x={64} y={580} w={1100} h={300} at={18.5} title={<Head color={C.orange}>위치마다 loss (정답 확률은 설명용 값, 위치 3 은 0.609)</Head>} gap={10}>
        {rows.map(([lab, p, l], i) => (
          <Bar key={i} label={lab} value={l} max={0.8} color={C.orange} at={18.8 + i * 0.4} width={380} labelW={200} fmt={l.toFixed(3)} sub={`p ${p}`} />
        ))}
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 21) }}>
          평균 1.517 ÷ 4 ≈ <span style={{ color: C.orange }}>0.379</span>
        </span>
      </Box>
      <Box x={1196} y={580} w={660} h={300} at={24.5} title={<Head color={C.purple}>학습 전 loss ≈ log V</Head>}>
        <Table
          head={['vocabulary', 'V', 'log V']}
          rows={[
            ['이 강의의 예', '8', '2.079'],
            ['Tiny Shakespeare 글자', '65', '4.174'],
            ['GPT-2 의 BPE token', '50,257', '10.825'],
          ]}
          widths={[290, 140, 140]}
          at={24.8}
          size={22}
          colors={[undefined, undefined, C.purple]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.5) }}>처음 logit 이 비슷해 확률이 모두 약 1/V</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseLoss = () => (
  <PauseWrite
    question={
      <>
        token 3 개짜리 조각에서 정답의 확률이 0.5, 0.5, 1 이었다. 이 조각의 loss 는? <span style={{ fontFamily: MONO, color: C.muted, fontSize: 40 }}>(log 0.5 = −0.693)</span>
      </>
    }
    answer={
      <>
        −log p: 0.693 · 0.693 · 0 → 합 1.386
        <br />
        위치 수 3 으로 나눈다: 1.386 ÷ 3 ≈ 0.462
      </>
    }
  />
)

// ---------- S2: decoder-only, causal mask ----------

function Architecture({ t }: { t: number }) {
  const cx = 350
  const rect = (y: number, h: number, color: string, label: ReactNode, opacity: number, sub?: string, x = 60, w = 580) => (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={`${color}18`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 4 : y + h / 2 + 8} textAnchor="middle" fill={C.text} fontSize={21}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO}>
          {sub}
        </text>
      )}
    </g>
  )
  const top = prog(t, 21)
  const emb = prog(t, 14)
  const blk = prog(t, 0.6)
  return (
    <svg width={700} height={740}>
      <text x={30} y={34} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
        가장 작은 GPT-2 (아래에서 위로)
      </text>
      {rect(54, 44, C.accent, 'softmax → 다음 token 확률표', top)}
      {arrow(cx, 138, cx, 100, C.muted, 2.5, 10, top)}
      {rect(140, 44, C.purple, 'token embedding 표와 dot product → logit', top)}
      {arrow(cx, 224, cx, 186, C.muted, 2.5, 10, top)}
      {rect(226, 44, C.blue, '마지막 LayerNorm', top)}
      {arrow(cx, 322, cx, 274, C.muted, 2.5, 10, blk)}
      <g opacity={blk}>
        <rect x={40} y={312} width={620} height={200} rx={14} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="8 7" />
        <text x={640} y={500} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600} fontFamily={MONO} opacity={prog(t, 7.2)}>
          block × 12
        </text>
      </g>
      {rect(326, 46, C.green, 'LayerNorm → FFN (GELU) → 더하기', blk, undefined, 70, 560)}
      {arrow(cx, 418, cx, 376, C.muted, 2.5, 10, blk)}
      {rect(420, 46, C.green, 'LayerNorm → masked self-attention → 더하기', blk, undefined, 70, 560)}
      {arrow(cx, 556, cx, 470, C.muted, 2.5, 10, emb)}
      <g opacity={emb}>
        <circle cx={cx} cy={578} r={20} fill={C.card} stroke={C.orange} strokeWidth={2} />
        <text x={cx} y={587} textAnchor="middle" fill={C.orange} fontSize={26} fontWeight={700}>
          +
        </text>
      </g>
      {arrow(195, 640, cx - 18, 592, C.muted, 2.5, 10, emb)}
      {arrow(505, 640, cx + 18, 592, C.muted, 2.5, 10, emb)}
      {rect(642, 64, C.orange, 'token embedding', emb, '50,257 × 768', 40, 310)}
      {rect(642, 64, C.orange, 'position embedding', emb, '1,024 × 768', 370, 290)}
    </svg>
  )
}

function Decoder() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={700} h={740} at={0.3}>
        <Architecture t={t} />
      </Card>
      <Box x={796} y={140} w={1060} h={180} at={0.3} title={<Head color={C.accent}>encoder 와 cross-attention 을 뺀다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 0.8) }}>번역 Transformer: 원문을 읽는 encoder + 출력을 쓰는 decoder</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 3) }}>
          language model: 지금까지 쓴 text 만 본다 → <span style={{ color: C.accent }}>decoder 만 쌓는다</span>
        </span>
      </Box>
      <Box x={796} y={335} w={1060} h={330} at={7} title={<Head color={C.green}>원래 Transformer 와 GPT-2 의 차이</Head>}>
        <Table
          plain
          head={['항목', '원래 Transformer (2017)', 'GPT-2']}
          rows={[
            ['구성', 'encoder + decoder', 'decoder 만 (cross-attention 없음)'],
            ['위치 정보', 'sin · cos 식으로 계산', '위치마다 한 행씩 학습하는 표'],
            ['FFN activation', 'ReLU', 'GELU'],
            ['LayerNorm', 'sub-layer 뒤 (Post-LN)', 'sub-layer 앞 (Pre-LN) + 마지막에 하나'],
            ['출력 층', '따로 둔 행렬', 'token embedding 표를 다시 씀'],
          ]}
          widths={[190, 330, 480]}
          at={7.3}
          size={21}
        />
      </Box>
      <Box x={796} y={680} w={1060} h={200} at={14} title={<Head color={C.orange}>embedding 표의 크기</Head>}>
        <span style={line(C.text, 22)}>
          token 표 <span style={mono(C.orange, 23)}>50,257 × 768</span> 의 행 + position 표 <span style={mono(C.orange, 23)}>1,024 × 768</span> 의 행
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21) }}>
          1,025 번째 token 엔 더할 행이 없어 context length <span style={mono(C.accent, 23)}>1,024</span> · 출력도 같은 표 (weight tying)
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function MaskGrid({ t }: { t: number }) {
  const toks = ['<bos>', '빨간', '컵', '집어']
  const X0 = 210
  const Y0 = 150
  const S = 110
  const m = prog(t, 12)
  return (
    <svg width={760} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
        4 × 4 attention (행 = query, 열 = key)
      </text>
      <g opacity={prog(t, 0.5)}>
        {toks.map((s, j) => (
          <text key={j} x={X0 + j * S + S / 2} y={Y0 - 16} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={s.startsWith('<') ? MONO : undefined}>
            {s}
          </text>
        ))}
        {toks.map((s, i) => (
          <text key={i} x={X0 - 16} y={Y0 + i * S + S / 2 + 8} textAnchor="end" fill={i === 2 ? C.orange : C.muted} fontSize={22}>
            {`위치 ${i + 1}`}
          </text>
        ))}
        {toks.map((_, i) =>
          toks.map((__, j) => {
            const future = j > i
            return (
              <g key={`${i}-${j}`}>
                <rect x={X0 + j * S + 4} y={Y0 + i * S + 4} width={S - 8} height={S - 8} rx={10} fill={future ? `${C.red}${m > 0.5 ? '22' : '10'}` : `${C.green}22`} stroke={future ? `${C.red}${m > 0.5 ? 'aa' : '44'}` : `${C.green}88`} strokeWidth={2} />
                {future && (
                  <text x={X0 + j * S + S / 2} y={Y0 + i * S + S / 2 + 9} textAnchor="middle" fill={C.red} fontSize={26} fontFamily={MONO} opacity={m}>
                    −∞
                  </text>
                )}
              </g>
            )
          }),
        )}
        <rect x={X0 - 2} y={Y0 + 2 * S} width={4 * S + 4} height={S} rx={12} fill="none" stroke={C.orange} strokeWidth={3} opacity={prog(t, 1.2)} />
        <text x={X0 + 3 * S + S / 2} y={Y0 + 2 * S + S / 2 + 8} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 1.6) * (1 - m)}>
          정답
        </text>
      </g>
      <text x={30} y={650} fill={C.orange} fontSize={22} opacity={prog(t, 2) * (1 - m)}>
        mask 가 없으면 위치 3 은 위치 4 의 "집어" 를 베낄 수 있다
      </text>
      <text x={30} y={650} fill={C.red} fontSize={22} opacity={m}>
        softmax 전에 뒤쪽 점수를 −∞ 로 → e 의 −∞ 제곱 = 0 이라 weight 0
      </text>
      <text x={30} y={694} fill={C.green} fontSize={22} opacity={prog(t, 18.3)}>
        초록 칸만 보므로 위치 t 의 출력은 위치 1 ~ t 의 입력으로 정해진다
      </text>
    </svg>
  )
}

function WeightBars({ t }: { t: number }) {
  const groups: [string, number[], number, string][] = [
    ['mask 없음', [0.032, 0.087, 0.237, 0.644], 6.2, C.orange],
    ['causal mask', [0.09, 0.245, 0.665, 0], 12.3, C.green],
  ]
  const keys = ['<bos>', '빨간', '컵', '집어']
  return (
    <svg width={944} height={280}>
      {groups.map(([name, ws, at, color], g) => {
        const gx = 40 + g * 470
        return (
          <g key={name} opacity={prog(t, at)}>
            <text x={gx} y={26} fill={color} fontSize={22} fontWeight={600}>
              {name}
            </text>
            <line x1={gx} y1={230} x2={gx + 390} y2={230} stroke={C.cardEdge} strokeWidth={2} />
            {ws.map((w, j) => {
              const h = w * 200 * prog(t, at + 0.2, 0.8)
              const x = gx + j * 100
              return (
                <g key={j}>
                  <rect x={x + 10} y={230 - h} width={70} height={Math.max(h, 2)} rx={6} fill={j === 3 ? (g === 0 ? C.red : C.dim) : color} />
                  <text x={x + 45} y={222 - h} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                    {w === 0 ? '0' : w.toFixed(3)}
                  </text>
                  <text x={x + 45} y={260} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={keys[j].startsWith('<') ? MONO : undefined}>
                    {keys[j]}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function Mask() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <MaskGrid t={t} />
      </Card>
      <Box x={856} y={140} w={1000} h={380} at={6} title={<Head color={C.accent}>위치 3 의 attention weight (점수 0, 1, 2, 3 · 설명용)</Head>} gap={8}>
        <WeightBars t={t} />
      </Box>
      <Box x={856} y={540} w={1000} h={175} at={18} title={<Head color={C.green}>teacher forcing</Head>} gap={8}>
        <span style={line(C.text, 22)}>정답 줄을 입력으로 한꺼번에 넣고, 위치마다 다음 token 을 맞힌다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20) }}>한 번 계산한 결과 = 앞부분 4 개를 따로 넣어 얻은 마지막 위치의 확률표</span>
      </Box>
      <Box x={856} y={735} w={1000} h={145} at={24} title={<Head color={C.orange}>GPT-2 의 batch: 길이 1,024 조각 512 개</Head>} gap={8}>
        <span style={mono(C.orange, 30)}>
          1,024 × 512 = 524,288 <span style={{ fontFamily: undefined, fontSize: 24, color: C.text, fontWeight: 500 }}>문제 / forward 한 번</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseMask = () => (
  <PauseWrite
    question="causal mask 모델에 길이 256 입력을 넣으면 forward 한 번에 문제 몇 개? 위치 11 을 바꾸면 위치 10 이 달라질까?"
    answer={
      <>
        위치마다 하나씩 256 개를 푼다
        <br />
        위치 10 은 위치 1 ~ 10 의 입력만 보므로 그대로다
      </>
    }
  />
)

// ---------- S3: generation and sampling ----------

function Generate() {
  const t = useSec()
  const steps: [string[], string, string, number][] = [
    [['<bos>', '빨간'], '컵', '0.8', 0.6],
    [['<bos>', '빨간', '컵'], '집어', '0.609', 7.4],
    [['<bos>', '빨간', '컵', '집어'], '<eos>', '0.9', 9.6],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={430} at={0.3}>
        <svg width={1792} height={430}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            autoregressive 생성: 고른 token 을 입력 끝에 붙여 다시 넣는다 (확률은 앞의 설명용 값)
          </text>
          {steps.map(([inp, out, p, at], i) => {
            const y = 80 + i * 112
            const o = prog(t, at)
            const endX = 170 + inp.length * 150
            return (
              <g key={i} opacity={o}>
                <text x={30} y={y + 36} fill={C.muted} fontSize={22}>
                  단계 {i + 1}
                </text>
                {inp.map((s, j) => {
                  const fresh = i > 0 && j === inp.length - 1
                  return (
                    <g key={j}>
                      <rect x={150 + j * 150} y={y} width={136} height={56} rx={10} fill={`${C.blue}18`} stroke={fresh ? C.green : C.blue} strokeWidth={fresh ? 3 : 2} />
                      <text x={150 + j * 150 + 68} y={y + 36} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={s.startsWith('<') ? MONO : undefined}>
                        {s}
                      </text>
                    </g>
                  )
                })}
                {arrow(endX, y + 28, endX + 70, y + 28, C.muted, 3, 12)}
                <rect x={endX + 84} y={y} width={460} height={56} rx={10} fill={`${C.green}18`} stroke={C.green} strokeWidth={2} />
                <text x={endX + 104} y={y + 36} fill={C.text} fontSize={23}>
                  확률이 가장 큰 token: <tspan fill={C.green} fontFamily={MONO} fontWeight={600}>{`${out} ${p}`}</tspan>
                </text>
                {i < 2 && arrow(endX + 200, y + 60, 150 + (inp.length + 0.5) * 150 - 7, y + 108, C.green, 2, 10, 0.8, '6 6')}
                {i === 2 && (
                  <text x={endX + 570} y={y + 36} fill={C.red} fontSize={24} fontWeight={600}>
                    → 멈춤
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </Card>
      <Box x={64} y={590} w={880} h={290} at={14} title={<Head color={C.orange}>생성은 token 하나마다 forward 한 번</Head>}>
        <span style={line(C.text, 23)}>학습: forward 한 번에 위치 수만큼의 문제를 푼다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.5) }}>생성: 앞에서 고른 token 이 있어야 다음 token 을 고를 수 있다</span>
        <span style={{ ...mono(C.orange, 28), opacity: prog(t, 17.5) }}>100 token → forward 100 번</span>
      </Box>
      <Box x={976} y={590} w={880} h={290} at={21} title={<Head color={C.green}>행동과 context length</Head>}>
        <span style={line(C.text, 23)}>
          OpenVLA: 행동 하나 = token 7 개 → <span style={mono(C.green, 24)}>forward 7 번</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.8) }}>
          입력이 context length 보다 길면 최근 token 만 남긴다: GPT-2 는 <span style={mono(C.accent, 24)}>1,024</span> 개
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function SampleRow({ t, at, label, sub, probs, pick, y }: { t: number; at: number; label: string; sub: string; probs: number[]; pick: string; y: number }) {
  const X0 = 210
  const Wd = 780
  let acc = 0
  return (
    <g opacity={prog(t, at)}>
      <text x={30} y={y + 24} fill={C.text} fontSize={23} fontWeight={600} fontFamily={MONO}>
        {label}
      </text>
      <text x={30} y={y + 52} fill={C.dim} fontSize={20}>
        {sub}
      </text>
      {probs.map((p, i) => {
        const x = X0 + acc * Wd
        acc += p
        return p > 0 ? <rect key={i} x={x} y={y} width={p * Wd} height={46} fill={TOK[i]} opacity={0.85} stroke={C.card} strokeWidth={2} /> : null
      })}
      <text x={X0} y={y + 80} fill={C.muted} fontSize={21} fontFamily={MONO}>
        {probs.map((p) => (p === 0 ? '0' : p.toFixed(3))).join(' · ')}
      </text>
      <text x={X0 + Wd} y={y + 80} textAnchor="end" fill={C.text} fontSize={21}>
        0.75 → <tspan fontWeight={700}>{pick}</tspan>
      </text>
    </g>
  )
}

function Sampling() {
  const t = useSec()
  const X0 = 210
  const Wd = 780
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={740} at={0.3}>
        <svg width={1100} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            logit 2.0, 1.0, 0.5, −1.0 으로 만든 확률표
          </text>
          {NAMES.map((n, i) => (
            <g key={n}>
              <rect x={30 + i * 140} y={70} width={22} height={22} rx={4} fill={TOK[i]} />
              <text x={62 + i * 140} y={89} fill={C.muted} fontSize={21}>
                {n}
              </text>
            </g>
          ))}
          <SampleRow t={t} at={6.5} label="τ = 1" sub="누적 확률 구간" probs={[0.609, 0.224, 0.136, 0.03]} pick="놓아" y={150} />
          <SampleRow t={t} at={19.6} label="τ = 0.5" sub="logit ÷ 0.5" probs={[0.842, 0.114, 0.042, 0.002]} pick="집어" y={290} />
          <SampleRow t={t} at={21.8} label="τ = 2" sub="logit ÷ 2" probs={[0.434, 0.263, 0.205, 0.097]} pick="밀어" y={430} />
          <SampleRow t={t} at={26.2} label="top-k" sub="상위 2 개만" probs={[0.731, 0.269, 0, 0]} pick="놓아" y={570} />
          <g opacity={prog(t, 8)}>
            <line x1={X0 + 0.75 * Wd} y1={136} x2={X0 + 0.75 * Wd} y2={630} stroke={C.text} strokeWidth={2.5} strokeDasharray="7 6" />
            <text x={X0 + 0.75 * Wd + 10} y={128} fill={C.text} fontSize={21} fontFamily={MONO}>
              random 0.75
            </text>
          </g>
        </svg>
      </Card>
      <Box x={1196} y={140} w={660} h={230} at={0.3} title={<Head color={C.blue}>greedy decoding</Head>} gap={10}>
        <span style={line(C.text, 23)}>매번 확률이 가장 큰 token · 같은 prompt 면 늘 같은 결과</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3) }}>같은 앞부분이 다시 나오면 "공 집어 공 집어 …" 처럼 반복하기 쉽다</span>
      </Box>
      <Box x={1196} y={390} w={660} h={230} at={13} title={<Head color={C.red}>확률 낮은 token 도 끼어든다</Head>} gap={10}>
        <span style={line(C.text, 23)}>확률 3% token 이 100 번 내내 안 뽑힐 확률</span>
        <span style={mono(C.red, 28)}>
          0.97<sup style={{ fontSize: 18 }}>100</sup> ≈ 0.048
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16) }}>긴 글에는 95% 넘는 확률로 한 번은 나온다</span>
      </Box>
      <Box x={1196} y={640} w={660} h={240} at={26} title={<Head color={C.green}>실제 설정</Head>} gap={8}>
        <span style={line(C.text, 22)}>GPT-2 논문의 생성 예시: top-k, k = 40</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 27.5) }}>GPT-2 요약 실험: k = 2 로 반복을 줄임</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 29) }}>OpenVLA 예제: greedy (do_sample=False) → 같은 장면에서 같은 행동</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseTemp = () => (
  <PauseWrite
    question={
      <>
        logit 이 [1, 0] 이고 τ = 0.5 다. 두 token 의 확률은? <span style={{ fontFamily: MONO, color: C.muted, fontSize: 40 }}>(e² ≈ 7.389)</span>
      </>
    }
    answer={
      <>
        τ 로 나눈다: [1 ÷ 0.5, 0 ÷ 0.5] = [2, 0] → 7.389 과 1, 합 8.389
        <br />
        7.389 ÷ 8.389 = 0.881 · 1 ÷ 8.389 = 0.119 (τ = 1 의 0.731, 0.269 보다 몰림)
      </>
    }
  />
)

// ---------- S4: size, scaling, VLA ----------

function Size() {
  const t = useSec()
  const parts: [string, number, string, string][] = [
    ['block 12 개', 85054464, '85,054,464 (≈ 68%)', C.green],
    ['token embedding 표', 38597376, '38,597,376 (≈ 31%)', C.orange],
    ['position', 786432, '786,432', C.purple],
  ]
  const total = 124439808
  let acc = 0
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1000} h={330} at={0.3} title={<Head color={C.accent}>GPT-2 네 모델 (vocabulary 50,257 · context length 1,024)</Head>}>
        <Table
          head={['모델', 'block', 'vector 길이 d', '논문', '공개 weight 로 센 수']}
          rows={[
            ['가장 작은 모델', '12', '768', '117M', '124,439,808'],
            ['중간', '24', '1,024', '345M', '354,823,168'],
            ['큰 모델', '36', '1,280', '762M', '774,030,080'],
            ['가장 큰 모델', '48', '1,600', '1,542M', '1,557,611,200'],
          ]}
          widths={[190, 100, 180, 140, 330]}
          at={0.6}
          size={22}
          step={0.4}
        />
      </Box>
      <Box x={1096} y={140} w={760} h={330} at={7} title={<Head color={C.green}>124M 의 parameter 124,439,808 개</Head>}>
        <svg width={704} height={200}>
          {parts.map(([, n, , color], i) => {
            const x = (acc / total) * 700
            acc += n
            return <rect key={i} x={x} y={10} width={Math.max((n / total) * 700 * prog(t, 7.3 + i * 0.3, 0.8), 0)} height={50} fill={color} stroke={C.card} strokeWidth={2} />
          })}
          <g opacity={prog(t, 8)}>
            <text x={0} y={100} fill={C.green} fontSize={22}>
              block 12 개
            </text>
            <text x={0} y={128} fill={C.green} fontSize={21} fontFamily={MONO}>
              85,054,464 (≈ 68%)
            </text>
            <text x={700} y={100} textAnchor="end" fill={C.orange} fontSize={22}>
              token embedding 표
            </text>
            <text x={700} y={128} textAnchor="end" fill={C.orange} fontSize={21} fontFamily={MONO}>
              38,597,376 (≈ 31%)
            </text>
            <text x={0} y={180} fill={C.purple} fontSize={20}>
              position embedding 786,432 · 마지막 LayerNorm 1,536
            </text>
          </g>
        </svg>
      </Box>
      <Box x={64} y={490} w={1000} h={390} at={14} title={<Head color={C.orange}>block 하나 ≈ 12d²</Head>}>
        <span style={line(C.text, 23)}>
          attention: query · key · value · 출력 행렬 4 개 (d × d) → <span style={mono(C.orange, 24)}>4d²</span>
        </span>
        <span style={line(C.text, 23)}>
          FFN: d → 4d → d 로 늘렸다 되돌리는 행렬 2 개 → <span style={mono(C.orange, 24)}>8d²</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.5) }}>
          d = 768: <span style={mono(C.orange, 24)}>12 × 768² = 7,077,888</span> + bias · LayerNorm 9,984
        </span>
        <span style={{ ...line(C.accent, 24), opacity: prog(t, 17.5) }}>
          d 가 두 배 → 12 × (2d)² = 4 × 12d² · block 하나가 네 배
        </span>
      </Box>
      <Box x={1096} y={490} w={760} h={390} at={21} title={<Head color={C.purple}>float32 (숫자 하나 4 byte) 로 저장하면</Head>}>
        <span style={line(C.text, 22)}>
          124,439,808 × 4 ≈ 5 억 byte → <span style={mono(C.purple, 24)}>약 500 MB</span>
        </span>
        <Bar label="124M" value={0.5} max={6.2} color={C.purple} at={21.6} width={430} labelW={90} fmt="≈ 500 MB" />
        <Bar label="1.5B" value={6.2} max={6.2} color={C.purple} at={22.2} width={430} labelW={90} fmt="≈ 6.2 GB" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24) }}>token 하나마다 숫자 거의 모두가 곱셈에 쓰여, 클수록 메모리도 시간도 더 든다</span>
      </Box>
    </AbsoluteFill>
  )
}

function ScalingPlot({ t }: { t: number }) {
  const lx = (n: number) => Math.log10(n)
  const X = (n: number) => 110 + ((lx(n) - 7.8) / (9.4 - 7.8)) * 800
  const Y = (l: number) => 600 - ((l - 2.4) / 0.8) * 460
  const pts: [string, number, number][] = [
    ['124M', 85056000, 3.12],
    ['355M', 302311424, 2.84],
    ['774M', 708390400, 2.67],
    ['1.5B', 1475561600, 2.54],
  ]
  const curve: string[] = []
  for (let i = 0; i <= 50; i++) {
    const n = 10 ** (7.85 + (1.45 * i) / 50)
    curve.push(`${X(n)},${Y(3.12 * (n / 85056000) ** -0.076)}`)
  }
  return (
    <svg width={980} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
        OpenWebText 의 validation loss (nanoGPT 로 잼)
      </text>
      <g opacity={prog(t, 0.4)}>
        <line x1={110} y1={600} x2={920} y2={600} stroke={C.cardEdge} strokeWidth={2} />
        <line x1={110} y1={130} x2={110} y2={600} stroke={C.cardEdge} strokeWidth={2} />
        {[
          [1e8, '1 억'],
          [3e8, '3 억'],
          [1e9, '10 억'],
        ].map(([n, s]) => (
          <g key={s as string}>
            <line x1={X(n as number)} y1={600} x2={X(n as number)} y2={610} stroke={C.dim} strokeWidth={2} />
            <text x={X(n as number)} y={638} textAnchor="middle" fill={C.dim} fontSize={20}>
              {s}
            </text>
          </g>
        ))}
        {[2.5, 2.75, 3.0].map((l) => (
          <text key={l} x={96} y={Y(l) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {l.toFixed(2)}
          </text>
        ))}
        <text x={920} y={684} textAnchor="end" fill={C.muted} fontSize={21}>
          embedding 표를 뺀 parameter 수 (log 눈금)
        </text>
        <text x={124} y={110} fill={C.muted} fontSize={21}>
          validation loss
        </text>
      </g>
      <g opacity={prog(t, 6.8, 1)}>
        <polyline points={curve.join(' ')} fill="none" stroke={C.accent} strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={X(5e8) + 40} y={Y(2.95)} fill={C.accent} fontSize={22}>
          2 배마다 loss × 0.95
        </text>
      </g>
      {pts.map(([name, n, l], i) => (
        <g key={name} opacity={prog(t, 0.8 + i * 0.6)}>
          <circle cx={X(n)} cy={Y(l)} r={9} fill={C.orange} />
          <text x={X(n) + 16} y={Y(l) - 18} fill={C.orange} fontSize={21} fontFamily={MONO}>
            {`${name} ${l.toFixed(2)}`}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Scaling() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={980} h={740} at={0.3}>
        <ScalingPlot t={t} />
      </Card>
      <Box x={1076} y={140} w={780} h={270} at={6.5} title={<Head color={C.accent}>scaling law (Kaplan 등, 2020)</Head>} gap={10}>
        <span style={line(C.text, 22)}>
          embedding 표를 뺀 parameter 2 배 → loss × <span style={mono(C.accent, 23)}>2<sup style={{ fontSize: 15 }}>−0.076</sup> ≈ 0.95</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9) }}>
          124M → 355M: 302 ÷ 85 ≈ 3.55 배 → <span style={mono(C.accent, 23)}>3.12 × 3.55<sup style={{ fontSize: 15 }}>−0.076</sup> ≈ 2.83</span>
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 10.5) }}>잰 값 2.84 와 가깝다 · 데이터가 달라 줄어드는 비율만 썼다</span>
      </Box>
      <Box x={1076} y={430} w={780} h={225} at={13} title={<Head color={C.green}>RT-2 · 처음 보는 물체 · 배경 · 환경의 평균 성공률</Head>} gap={12}>
        <Bar label="5B 로봇 데이터만" value={9} max={100} color={C.red} at={13.3} width={300} labelW={250} fmt="9%" />
        <Bar label="5B 미리 학습" value={44} max={100} color={C.orange} at={15} width={300} labelW={250} fmt="44%" />
        <Bar label="55B 미리 학습" value={63} max={100} color={C.green} at={19.7} width={300} labelW={250} fmt="63%" />
      </Box>
      <Box x={1076} y={675} w={780} h={205} at={21} title={<Head color={C.purple}>language model 위의 VLA</Head>} gap={10}>
        <span style={line(C.text, 22)}>행동 값을 차원마다 bin 256 개로 나눠 token 하나씩에 짝짓는다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26.2) }}>
          OpenVLA: token <span style={mono(C.purple, 23)}>7</span> 개 · RTX 4090 한 장에서 1초에 약 <span style={mono(C.purple, 23)}>6</span> 번
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseScale = () => (
  <PauseWrite
    question={
      <>
        scaling law 의 지수가 0.076 일 때, embedding 표를 뺀 parameter 수를 4 배로 키우면 loss 는 몇 배가 될까?{' '}
        <span style={{ fontFamily: MONO, color: C.muted, fontSize: 40 }}>
          (4<sup style={{ fontSize: 26 }}>−0.076</sup> ≈ 0.90)
        </span>
      </>
    }
    answer={
      <>
        4 배 = 2 배를 두 번 → 0.949 × 0.949 ≈ 0.90 배
        <br />
        loss 가 3.0 이었다면 약 2.7
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '정답 = 입력을 한 칸 민 줄 · loss = −log p 의 평균 (예 0.379) · 첫 loss ≈ log V', at: 0.5 },
    { tag: script.sections[1], color: C.green, text: 'encoder · cross-attention 없음 · causal mask → forward 한 번에 1,024 × 512 문제', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: '고른 token 을 붙여 다시 forward · τ 0.5 → 0.842 · top-2 → 0.731, 0.269', at: 8.4 },
    { tag: script.sections[3], color: C.purple, text: '124M ~ 1.5B · 2 배마다 loss × 0.95 · OpenVLA 행동 하나 = token 7 개', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            다음 조각 하나를 맞히는 모델이 어떻게 긴 글을 쓰고 로봇의 움직임까지 낼까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>CLIP · RT-2 → OpenVLA</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            사진과 글을 같은 숫자 공간에 놓기 · image encoder 와 action token 을 더한 VLA 의 구조와 약점
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/gpt (GPT-1 · GPT-2 · weight tying · scaling law 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Gpt() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        probs: Probs,
        shift: Shift,
        'pause-loss': PauseLoss,
        decoder: Decoder,
        mask: Mask,
        'pause-mask': PauseMask,
        generate: Generate,
        sampling: Sampling,
        'pause-temp': PauseTemp,
        size: Size,
        scaling: Scaling,
        'pause-scale': PauseScale,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
