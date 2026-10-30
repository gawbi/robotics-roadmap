import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './autograd.narration.json'
import { script } from './autograd.script'

// Numbers follow lessons/autograd/README.md (see autograd.script.ts). The graphs are the lesson's own examples
// (L = (a × b + c) × f, q = a × b with L = q + a, the XOR network with input [1, 0]); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 380, fmt, sub, labelW = 230 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt}</span>
      {sub && <span style={{ fontFamily: MONO, fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
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
        <div key={s + i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line of text that fades in at `at` */
function Line({ at, children, color = C.text, size = 23 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <div style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</div>
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, opacity = 1, dash?: string) {
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

/** the point where a line from (x1, y1) towards a circle's centre meets the circle, `gap` px early */
function toCircle(x1: number, y1: number, cx: number, cy: number, r: number, gap = 4): [number, number] {
  const d = Math.hypot(cx - x1, cy - y1)
  const k = (d - r - gap) / d
  return [x1 + (cx - x1) * k, y1 + (cy - y1) * k]
}

/** a text table: first column sans, the rest mono, all left-aligned; each row fades in at its own time */
function Table({ head, rows, widths, at, size = 22 }: { head: string[]; rows: { cells: ReactNode[]; at: number; color?: string }[]; widths: number[]; at: number; size?: number }) {
  const t = useSec()
  const cell = (i: number, sans = false): CSSProperties => ({ width: widths[i], fontFamily: i === 0 || sans ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: 'left' })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i, true), color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, r.at), color: C.text }}>
          {r.cells.map((v, i) => (
            <span key={i} style={{ ...cell(i), color: i === r.cells.length - 1 ? (r.color ?? C.orange) : C.text, fontWeight: i === r.cells.length - 1 ? 600 : 400 }}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** the legend the lesson's figures use: forward values in white, gradients in orange */
function Legend({ at, grad = true }: { at: number; grad?: boolean }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', gap: 22, opacity: prog(t, at), fontSize: 22, color: C.muted, whiteSpace: 'nowrap' }}>
      <span>
        <span style={{ color: C.text }}>■</span> forward 값
      </span>
      {grad && (
        <span>
          <span style={{ color: C.orange }}>■</span> gradient
        </span>
      )}
    </div>
  )
}

/** a value node of a computational graph: a 150 × 96 box with "name = value" and, below, its gradient */
function ValueNode({ t, x, y, name, value, at, grad, gradAt, w = 150 }: { t: number; x: number; y: number; name: string; value: string; at: number; grad?: string; gradAt?: number; w?: number }) {
  const g = gradAt === undefined ? 0 : prog(t, gradAt)
  return (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={96} rx={14} fill={C.bg} stroke={g > 0 ? C.orange : C.muted} strokeOpacity={g > 0 ? 0.4 + 0.6 * g : 0.7} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + (grad ? 40 : 58)} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
        {name} = {value}
      </text>
      {grad && (
        <text x={x + w / 2} y={y + 80} textAnchor="middle" fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={g}>
          {grad}
        </text>
      )}
    </g>
  )
}

function OpNode({ t, cx, cy, op, at }: { t: number; cx: number; cy: number; op: string; at: number }) {
  return (
    <g opacity={prog(t, at)}>
      <circle cx={cx} cy={cy} r={30} fill={C.card} stroke={C.blue} strokeWidth={2.5} />
      <text x={cx} y={cy + 11} textAnchor="middle" fill={C.blue} fontSize={32} fontWeight={700}>
        {op}
      </text>
    </g>
  )
}

/** L = (a × b + c) × f, as the lesson draws it; 1140 × 500 */
function SmallGraph({ t, valAt, gradAt }: { t: number; valAt: Record<string, number>; gradAt?: Record<string, number> }) {
  const B = 150
  const N = {
    a: { x: 20, y: 50, v: '2', g: '6' },
    b: { x: 20, y: 200, v: '−3', g: '−4' },
    p: { x: 340, y: 125, v: '−6', g: '−2' },
    c: { x: 340, y: 300, v: '10', g: '−2' },
    d: { x: 660, y: 212, v: '4', g: '−2' },
    f: { x: 660, y: 390, v: '−2', g: '4' },
    L: { x: 980, y: 301, v: '−8', g: '1' },
  }
  const ops = { m1: [265, 173], add: [585, 260], m2: [905, 349] } as const
  const right = (k: keyof typeof N): [number, number] => [N[k].x + B, N[k].y + 48]
  const left = (k: keyof typeof N): [number, number] => [N[k].x, N[k].y + 48]
  const into = (from: [number, number], op: readonly [number, number]) => {
    const [ex, ey] = toCircle(from[0], from[1], op[0], op[1], 30)
    return arrow(from[0], from[1], ex, ey, C.muted, 2.5, 12, 0.85)
  }
  const out = (op: readonly [number, number], to: [number, number]) => arrow(op[0] + 30, op[1], to[0] - 2, to[1], C.muted, 2.5, 12, 0.85)
  const at = (k: string) => valAt[k] ?? 0
  return (
    <svg width={1140} height={500}>
      <g opacity={prog(t, at('m1'))}>{into(right('a'), ops.m1)}{into(right('b'), ops.m1)}{out(ops.m1, left('p'))}</g>
      <g opacity={prog(t, at('add'))}>{into(right('p'), ops.add)}{into(right('c'), ops.add)}{out(ops.add, left('d'))}</g>
      <g opacity={prog(t, at('m2'))}>{into(right('d'), ops.m2)}{into(right('f'), ops.m2)}{out(ops.m2, left('L'))}</g>
      <OpNode t={t} cx={ops.m1[0]} cy={ops.m1[1]} op="×" at={at('m1')} />
      <OpNode t={t} cx={ops.add[0]} cy={ops.add[1]} op="+" at={at('add')} />
      <OpNode t={t} cx={ops.m2[0]} cy={ops.m2[1]} op="×" at={at('m2')} />
      {(Object.keys(N) as (keyof typeof N)[]).map((k) => (
        <ValueNode key={k} t={t} x={N[k].x} y={N[k].y} name={k} value={N[k].v} at={at(k)} grad={gradAt ? N[k].g : undefined} gradAt={gradAt?.[k]} />
      ))}
    </svg>
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
            CORE · AUTOGRAD
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Backpropagation</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            graph 를 한 번 거꾸로 훑어 <span style={{ color: C.accent }}>모든 gradient</span> 를 한꺼번에
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            정답이 출력에만 있는 network 에서 모든 parameter 의 gradient 를 구하는 계산
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
  const boxes = [
    { x: 46, w: 420, title: '입력', lines: ['카메라 사진 · 관절 각도'], color: C.blue, at: 0.5 },
    { x: 586, w: 560, title: 'ACT policy', lines: ['parameter 약 8천만 개', '숫자 하나하나에는 정답 없음'], color: C.red, at: 1.0 },
    { x: 1266, w: 480, title: '출력: 관절 목표 각도', lines: ['정답 있음 · 시연이 준 값'], color: C.green, at: 1.5 },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={1792} height={330}>
          <text x={46} y={46} fill={C.muted} fontSize={24} opacity={prog(t, 0.3)}>
            LeRobot 으로 로봇 팔 policy ACT 를 학습시킬 때
          </text>
          {boxes.map((b, i) => (
            <g key={b.title} opacity={prog(t, b.at)}>
              <rect x={b.x} y={80} width={b.w} height={200} rx={18} fill={C.bg} stroke={b.color} strokeWidth={2.5} />
              <text x={b.x + 28} y={134} fill={b.color} fontSize={28} fontWeight={600} fontFamily={i === 1 ? MONO : undefined}>
                {b.title}
              </text>
              {b.lines.map((l, k) => (
                <text key={l} x={b.x + 28} y={186 + k * 44} fill={C.text} fontSize={24}>
                  {l}
                </text>
              ))}
              {i < 2 && arrow(b.x + b.w + 14, 180, boxes[i + 1].x - 14, 180, C.muted, 3, 13)}
            </g>
          ))}
        </svg>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          8천만 개를 각각 <span style={{ color: C.accent }}>어느 쪽으로 얼마나</span> 고쳐야 할까?
        </div>
      </Appear>
      <Card x={64} y={610} w={1792} h={260} at={5.4}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 16 }}>
          <Line at={5.6} size={26}>
            <span style={{ color: C.red, fontWeight: 600 }}>숫자마다 조금 늘리고 줄여 보며 재기</span> · network 를 <span style={mono(C.red, 26)}>8천만 × 2 = 1억 6천만</span> 번 다시 계산
          </Line>
          <Line at={6.4} size={26}>
            <span style={{ color: C.green, fontWeight: 600 }}>backpropagation</span> · graph 를 출력에서 입력 쪽으로 한 번 거꾸로 훑기 → network 를 몇 번 계산하는 정도의 시간
          </Line>
          <Line at={7.1} size={24} color={C.muted}>
            ACT 논문: parameter 약 8천만 개를 GPU 한 장(<span style={mono(C.muted, 24)}>11 GB RTX 2080 Ti</span>)에서 약 5 시간 학습 · PyTorch 에서는 <span style={mono(C.muted, 24)}>loss.backward()</span> 한 줄
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- graph and backward ----------

function GraphScene() {
  const t = useSec()
  const valAt = { a: 0.6, b: 0.8, c: 1.0, f: 1.2, m1: 0.9, add: 1.1, m2: 1.3, p: 7.0, d: 8.8, L: 10.6 }
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1180} h={750} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={mono(C.text, 30)}>L = (a × b + c) × f</span>
        </div>
        <div style={{ position: 'absolute', right: 30, top: 30 }}>
          <Label size={22} color={C.muted}>
            computational graph · 상자는 값, 원은 연산
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 20, top: 70 }}>
          <SmallGraph t={t} valAt={valAt} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 585, width: 1120, display: 'grid', gap: 10, opacity: prog(t, 13.4) }}>
          <Head size={24} color={C.blue}>
            local derivative · 입력 하나를 0.01 늘려 잰 비율
          </Head>
          <Table
            head={['연산', '바꾼 입력', '출력 변화', '비율']}
            widths={[200, 240, 250, 400]}
            at={13.4}
            rows={[
              { cells: ['d = p + c', 'p: −6 → −5.99', 'd: 4 → 4.01', '0.01 ÷ 0.01 = 1'], at: 14.2, color: C.blue },
              { cells: ['L = d × f', 'd: 4 → 4.01', 'L: −8 → −8.02', '−0.02 ÷ 0.01 = −2 = f'], at: 16.0, color: C.blue },
            ]}
          />
        </div>
      </Card>
      <Box x={1276} y={130} w={580} h={250} at={0.4} title={<Head>forward · 입력에서 출력 쪽으로</Head>}>
        <Table
          head={['순서', '연산', '계산', '값']}
          widths={[60, 150, 170, 90]}
          at={0.6}
          rows={[
            { cells: ['1', 'p = a × b', '2 × (−3)', '−6'], at: 7.0, color: C.text },
            { cells: ['2', 'd = p + c', '−6 + 10', '4'], at: 8.8, color: C.text },
            { cells: ['3', 'L = d × f', '4 × (−2)', '−8'], at: 10.6, color: C.text },
          ]}
        />
      </Box>
      <Box x={1276} y={396} w={580} h={292} at={13} title={<Head color={C.blue}>local derivative 표</Head>}>
        <Table
          head={['연산', '출력', '첫 입력 쪽', '둘째 입력 쪽']}
          widths={[110, 110, 160, 130]}
          at={13.2}
          rows={[
            { cells: ['덧셈', 'x + y', '1', '1'], at: 13.6, color: C.blue },
            { cells: ['곱셈', 'x × y', 'y', 'x'], at: 15.4, color: C.blue },
            { cells: ['제곱', 'x²', '2x', '없음'], at: 17.4, color: C.blue },
            { cells: ['sigmoid', 'σ(x)', 'σ(1 − σ)', '없음'], at: 20.3, color: C.blue },
          ]}
        />
      </Box>
      <Box x={1276} y={704} w={580} h={176} at={21.5} color={`${C.orange}88`} title={<Head color={C.orange}>forward 값을 남겨 둔다</Head>}>
        <Line at={22}>곱셈 규칙에는 다른 입력의 값이, sigmoid 규칙에는 출력 값이 필요하다</Line>
      </Box>
    </AbsoluteFill>
  )
}

function Backward() {
  const t = useSec()
  const valAt = { a: 0.3, b: 0.3, c: 0.3, f: 0.3, m1: 0.3, add: 0.3, m2: 0.3, p: 0.3, d: 0.3, L: 0.3 }
  const gradAt = { L: 0.9, d: 6.8, f: 8.6, p: 10.4, c: 11.0, a: 12.8, b: 14.8 }
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1180} h={750} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={mono(C.text, 30)}>backward · L 의 gradient 1 에서 출발</span>
        </div>
        <div style={{ position: 'absolute', right: 30, top: 30 }}>
          <Legend at={0.5} />
        </div>
        <div style={{ position: 'absolute', left: 20, top: 70 }}>
          <SmallGraph t={t} valAt={valAt} gradAt={gradAt} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 590, width: 1120, display: 'grid', gap: 12 }}>
          <Line at={18.8} size={24}>
            확인 · <span style={mono(C.text, 24)}>a: 2 → 2.01 (+0.01)</span> 일 때 <span style={mono(C.text, 24)}>L: −8 → −7.94 (+0.06)</span>
          </Line>
          <Line at={20.6} size={24}>
            전체 비율 <span style={mono(C.green, 24)}>0.06 ÷ 0.01 = 6</span> · 단계별 비율의 곱 <span style={mono(C.green, 24)}>(−3) × 1 × (−2) = 6</span>
          </Line>
          <Line at={22.4} size={22} color={C.muted}>
            단계별 비율은 곱셈 a × b 의 다른 입력 b, 덧셈의 1, 곱셈 d × f 의 다른 입력 f 다 (chain rule)
          </Line>
        </div>
      </Card>
      <Box x={1276} y={130} w={580} h={404} at={0.4} title={<Head color={C.orange}>backward 표</Head>}>
        <Table
          head={['값', '계산', 'gradient']}
          widths={[60, 330, 110]}
          at={0.6}
          rows={[
            { cells: ['L', '출발점', '1'], at: 0.9 },
            { cells: ['d', '1 × f = 1 × (−2)', '−2'], at: 6.8 },
            { cells: ['f', '1 × d = 1 × 4', '4'], at: 8.6 },
            { cells: ['p', '−2 × 1 (덧셈)', '−2'], at: 10.4 },
            { cells: ['c', '−2 × 1 (덧셈)', '−2'], at: 11.0 },
            { cells: ['a', '−2 × b = −2 × (−3)', '6'], at: 12.8 },
            { cells: ['b', '−2 × a = −2 × 2', '−4'], at: 14.8 },
          ]}
        />
      </Box>
      <Box x={1276} y={550} w={580} h={330} at={24.5} color={`${C.red}77`} title={<Head color={C.red} size={26}>✕ 흔한 오해: gradient 는 값의 크기다</Head>}>
        <Line at={25.2}>
          <span style={{ color: C.green, fontWeight: 600 }}>✓</span> gradient 는 값을 바꿀 때 L 이 얼마나 민감하게 반응하는지를 나타낸다
        </Line>
        <Line at={26.6}>
          <span style={mono(C.text, 23)}>c = 10</span> 은 가장 큰 값이지만 gradient <span style={mono(C.orange, 23)}>−2</span>
        </Line>
        <Line at={27.8}>
          <span style={mono(C.text, 23)}>a = 2</span> 는 작은 값이지만 gradient <span style={mono(C.orange, 23)}>6</span> 으로 가장 크다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- accumulation and reverse-mode ----------

function Fanout() {
  const t = useSec()
  const op1 = [290, 140] as const
  const op2 = [620, 268] as const
  const node = (x: number, y: number, name: string, value: string, at: number, grad?: string, gradAt?: number) => (
    <ValueNode t={t} x={x} y={y} name={name} value={value} at={at} grad={grad} gradAt={gradAt} />
  )
  const [e1x, e1y] = toCircle(180, 78, op1[0], op1[1], 30)
  const [e2x, e2y] = toCircle(180, 250, op1[0], op1[1], 30)
  const [e3x, e3y] = toCircle(520, 140, op2[0], op2[1], 30)
  const [e4x, e4y] = toCircle(180, 292, op2[0], op2[1], 30)
  const order: [string, string][] = [
    ['L', '1'],
    ['f', '4'],
    ['d', '−2'],
    ['c', '−2'],
    ['p', '−2'],
    ['b', '−4'],
    ['a', '6'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={750} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={mono(C.text, 30)}>q = a × b,  L = q + a</span>
        </div>
        <div style={{ position: 'absolute', right: 30, top: 30 }}>
          <Legend at={0.5} />
        </div>
        <svg width={860} height={470} style={{ position: 'absolute', left: 20, top: 80 }}>
          <g opacity={prog(t, 0.6)}>
            {arrow(180, 78, e1x, e1y, C.muted, 2.5, 12, 0.85)}
            {arrow(180, 250, e2x, e2y, C.muted, 2.5, 12, 0.85)}
            {arrow(op1[0] + 30, op1[1], 368, 140, C.muted, 2.5, 12, 0.85)}
            {arrow(520, 140, e3x, e3y, C.muted, 2.5, 12, 0.85)}
            {arrow(op2[0] + 30, op2[1], 698, 268, C.muted, 2.5, 12, 0.85)}
          </g>
          <g opacity={prog(t, 0.9)}>{arrow(180, 292, e4x, e4y, C.pink, 3, 12, 0.95)}</g>
          <OpNode t={t} cx={op1[0]} cy={op1[1]} op="×" at={0.6} />
          <OpNode t={t} cx={op2[0]} cy={op2[1]} op="+" at={0.6} />
          {node(30, 30, 'b', '2', 0.5)}
          {node(30, 220, 'a', '3', 0.5, '3', 11.6)}
          {node(370, 92, 'q', '6', 0.7, '1', 7.0)}
          {node(700, 220, 'L', '9', 0.9, '1', 6.8)}
          <g opacity={prog(t, 7.4)}>
            <text x={540} y={70} fill={C.blue} fontSize={22} fontWeight={600}>
              q 를 거친 길 · 1 × b = 2
            </text>
          </g>
          <g opacity={prog(t, 9.6)}>
            <text x={262} y={345} fill={C.pink} fontSize={22} fontWeight={600}>
              바로 가는 길 · 1
            </text>
          </g>
          <g opacity={prog(t, 11.6)}>
            <text x={30} y={360} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              2 + 1 = 3
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 560, width: 840, display: 'grid', gap: 12 }}>
          <Line at={13.4} size={24}>
            확인 · <span style={mono(C.text, 24)}>a: 3 → 3.01 · q: 6 → 6.02 · L: 9 → 9.03</span>
          </Line>
          <Line at={15.2} size={24}>
            비율 <span style={mono(C.green, 24)}>0.03 ÷ 0.01 = 3 = 2 + 1</span> · 두 길의 비율을 더한 값과 같다
          </Line>
        </div>
      </Card>
      <Box x={996} y={130} w={860} h={340} at={6.5} title={<Head color={C.orange}>길마다 들어온 gradient 를 더해 쌓는다</Head>}>
        <Line at={7.2}>
          q 를 거친 길 · <span style={mono(C.blue, 23)}>1 × b = 1 × 2 = 2</span>
        </Line>
        <Line at={9.6}>
          바로 가는 길 · 덧셈 L = q + a 의 <span style={mono(C.pink, 23)}>1</span>
        </Line>
        <Line at={11.6}>
          a 의 gradient · <span style={mono(C.orange, 23)}>2 + 1 = 3</span>
        </Line>
        <Line at={16.5} color={C.muted}>
          덮어쓰면 2 나 1 하나만 남아 틀린다
        </Line>
      </Box>
      <Box x={996} y={490} w={860} h={390} at={19.5} title={<Head>backward 순서 · L = (a × b + c) × f</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, 19.8) }}>
          <span style={{ width: 140, fontSize: 22, color: C.muted }}>forward</span>
          {['a', 'b', 'p', 'c', 'd', 'f', 'L'].map((k) => (
            <span key={k} style={{ width: 64, height: 50, display: 'grid', placeItems: 'center', borderRadius: 12, border: `1.5px solid ${C.muted}`, ...mono(C.text, 24) }}>
              {k}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, opacity: prog(t, 21.2) }}>
          <span style={{ width: 140, fontSize: 22, color: C.orange, paddingTop: 12 }}>backward</span>
          {order.map(([k, g], i) => (
            <div key={k} style={{ width: 64, display: 'grid', justifyItems: 'center', gap: 4, opacity: prog(t, 21.4 + i * 0.3) }}>
              <span style={{ width: 64, height: 50, display: 'grid', placeItems: 'center', borderRadius: 12, border: `1.5px solid ${C.orange}`, ...mono(C.text, 24) }}>{k}</span>
              <span style={mono(C.orange, 22)}>{g}</span>
            </div>
          ))}
        </div>
        <Line at={24.8} color={C.red}>
          p 를 d 보다 먼저 처리하면 아직 비어 있는 d 의 gradient 0 을 곱해, p · a · b 의 gradient 가 모두 0 이 된다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Reverse() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1792} h={170} at={0.3} title={<Head color={C.accent}>automatic differentiation</Head>}>
        <Flow steps={['forward 중에 graph 를 기록', '연산마다 local derivative 규칙 적용', '식 전체를 미분한 공식은 필요 없음']} color={C.accent} at={0.8} gap={1.2} />
      </Box>
      <Card x={64} y={320} w={880} h={310} at={6}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 18 }}>
          <Head>parameter 9 개 · graph 를 훑는 횟수</Head>
          <Bar label="조금 바꿔 재기" value={18} max={18} color={C.red} at={6.5} width={360} fmt="18 번" sub="9 × 2" />
          <Bar label="forward-mode" value={9} max={18} color={C.orange} at={9.5} width={360} fmt="9 번" />
          <Bar label="reverse-mode" value={2} max={18} color={C.green} at={12.8} width={360} fmt="2 번" sub="1 + 1" />
          <Line at={13.6} color={C.muted}>
            reverse-mode · forward 한 번 뒤 L 에서 backward 한 번
          </Line>
        </div>
      </Card>
      <Card x={976} y={320} w={880} h={310} at={13}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 18 }}>
          <Head>parameter 약 8천만 개 (ACT)</Head>
          <Bar label="조금 바꿔 재기" value={160} max={160} color={C.red} at={13.4} width={360} fmt="1억 6천만 번" />
          <Bar label="forward-mode" value={80} max={160} color={C.orange} at={14.6} width={360} fmt="8천만 번" />
          <Bar label="reverse-mode" value={0} max={160} color={C.green} at={15.8} width={360} fmt="2 번" />
          <Line at={16.8} color={C.muted}>
            <span style={mono(C.muted, 23)}>8천만 × 2 = 1억 6천만</span> 번 · reverse-mode 는 <span style={mono(C.green, 23)}>1 + 1 = 2</span> 번
          </Line>
        </div>
      </Card>
      <Box x={64} y={650} w={1792} h={230} at={19} title={<Head color={C.blue}>Baydin 등의 survey · 출력이 하나일 때</Head>}>
        <Line at={19.4}>
          reverse-mode 로 gradient 전체를 구하는 계산량은 함수를 한 번 계산하는 양의 <span style={mono(C.blue, 23)}>6 배</span> 를 넘지 않고, 보통 <span style={mono(C.blue, 23)}>2 ~ 3 배</span>
        </Line>
        <Line at={22.4} color={C.orange}>
          대가: backward 에 쓸 중간 값을 forward 동안 저장해야 해서, 메모리가 많게는 연산 수에 비례해 는다
        </Line>
        <Line at={24} color={C.muted}>
          학습은 parameter 가 많고 loss 는 숫자 하나라서 reverse-mode 가 맞는다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the XOR network and vanishing gradients ----------

function Xor() {
  const t = useSec()
  const node = (x: number, y: number, w: number, text: string, at: number, grad?: string, gradAt?: number, edge = C.muted) => {
    const g = gradAt === undefined ? 0 : prog(t, gradAt)
    return (
      <g opacity={prog(t, at)}>
        <rect x={x} y={y} width={w} height={110} rx={16} fill={C.bg} stroke={g > 0 ? C.orange : edge} strokeWidth={2.5} />
        <text x={x + w / 2} y={y + (grad ? 46 : 64)} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
          {text}
        </text>
        {grad && (
          <text x={x + w / 2} y={y + 86} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={g}>
            {grad}
          </text>
        )}
      </g>
    )
  }
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1120} h={750} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <span style={mono(C.text, 28)}>XOR network · 입력 [1, 0], 정답 1</span>
        </div>
        <div style={{ position: 'absolute', right: 30, top: 28 }}>
          <Legend at={0.5} />
        </div>
        <svg width={1100} height={520} style={{ position: 'absolute', left: 10, top: 72 }}>
          <g opacity={prog(t, 0.6)}>
            {arrow(170, 110, 388, 110, C.muted, 2.5, 12, 0.7)}
            {arrow(170, 140, 388, 365, C.muted, 2.5, 12, 0.7)}
            {arrow(170, 360, 388, 135, C.muted, 2.5, 12, 0.7)}
            {arrow(170, 390, 388, 390, C.muted, 2.5, 12, 0.7)}
            {arrow(600, 120, 848, 230, C.muted, 2.5, 12, 0.85)}
            {arrow(600, 380, 848, 270, C.muted, 2.5, 12, 0.85)}
            <text x={680} y={128} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              v₁ = 1
            </text>
            <text x={680} y={408} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              v₂ = −1
            </text>
          </g>
          {node(30, 55, 140, 'x₁ = 1', 0.5)}
          {node(30, 335, 140, 'x₂ = 0', 0.5)}
          {node(390, 55, 210, 'h₁ = 0.7311', 7.0, '−0.2183', 16.5, C.blue)}
          {node(390, 335, 210, 'h₂ = 0.5', 8.5, '+0.2183', 17.5, C.blue)}
          {node(850, 195, 210, 'ŷ = 0.5575', 10.5, '−0.8850', 13.3, C.green)}
          <g opacity={prog(t, 11.5)}>
            <text x={850} y={345} fill={C.green} fontSize={22}>
              정답 y = 1
            </text>
            <text x={850} y={377} fill={C.muted} fontSize={22}>
              오차 제곱 <tspan fontFamily={MONO}>0.1958</tspan>
            </text>
          </g>
          <g opacity={prog(t, 14.3)}>
            <text x={1060} y={175} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              z₃ 의 gradient <tspan fontFamily={MONO}>−0.2183</tspan>
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 610, width: 1060, display: 'grid', gap: 10 }}>
          <Line at={0.9} size={22} color={C.muted}>
            시작 값 · <span style={mono(C.muted, 22)}>w₁₁ = w₁₂ = 1, b₁ = 0</span> · <span style={mono(C.muted, 22)}>w₂₁ = w₂₂ = 1, b₂ = −1</span> · <span style={mono(C.muted, 22)}>b₃ = 0</span>
          </Line>
          <Line at={2.2} size={22}>
            neuron 마다 weight 2 개 + bias 1 개 → parameter <span style={mono(C.accent, 22)}>3 × 3 = 9</span> 개 · h = σ(z), sigmoid
          </Line>
        </div>
      </Card>
      <Box x={1216} y={130} w={640} h={380} at={13} title={<Head color={C.orange}>backward 표 · 입력 [1, 0]</Head>}>
        <Table
          head={['값', '계산', 'gradient']}
          widths={[56, 370, 110]}
          at={13.1}
          rows={[
            { cells: ['ŷ', '2 × (0.5575 − 1)', '−0.8850'], at: 13.3 },
            { cells: ['z₃', '−0.8850 × 0.5575 × 0.4425', '−0.2183'], at: 14.3 },
            { cells: ['h₁', '−0.2183 × v₁ (1)', '−0.2183'], at: 16.5 },
            { cells: ['h₂', '−0.2183 × v₂ (−1)', '+0.2183'], at: 17.5 },
            { cells: ['z₁', '−0.2183 × 0.1966', '−0.0429'], at: 18.3 },
            { cells: ['z₂', '0.2183 × 0.25', '0.0546'], at: 18.9 },
          ]}
        />
      </Box>
      <Box x={1216} y={530} w={640} h={350} at={19.5} color={`${C.accent}77`} title={<Head color={C.accent}>credit assignment</Head>}>
        <Line at={19.8}>
          h₁: <span style={mono(C.orange, 23)}>−0.2183 &lt; 0</span> → 키우면 오차가 준다
        </Line>
        <Line at={21.6}>
          h₂: <span style={mono(C.orange, 23)}>+0.2183 &gt; 0</span> → 키우면 오차가 커진다
        </Line>
        <Line at={23.2} color={C.muted}>
          <span style={mono(C.muted, 23)}>v₂ = −1</span> 이라 h₂ 를 줄여야 ŷ 가 커진다
        </Line>
        <Line at={25.8} color={C.green}>
          정답 없는 hidden neuron 에도 gradient 가 온다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Vanishing() {
  const t = useSec()
  const pts: [number, number, string][] = [
    [0, 0.2478, '0.2478'],
    [100, 0.227, '0.2270'],
    [500, 0.0258, '0.0258'],
    [1000, 0.0059, '0.0059'],
    [2000, 0.002, '0.0020'],
  ]
  const X = (s: number) => 60 + (s / 2000) * 740
  const Y = (v: number) => 280 - (v / 0.25) * 240
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={330} at={0.3} title={<Head>sigmoid 를 지날 때마다 기울기가 곱해진다</Head>}>
        <Flow steps={['z₃ · −0.2183', '× σ′(1) = 0.1966', 'z₁ · −0.0429']} color={C.orange} at={0.8} gap={0.9} />
        <Flow steps={['z₃ · −0.2183', '× σ′(0) = 0.25', 'z₂ · 0.0546']} color={C.orange} at={2.6} gap={0.9} />
        <Line at={4.4} color={C.muted}>
          둘 다 4 ~ 5 분의 1 로 준다 · sigmoid 기울기는 z = 0 에서 최대 0.25
        </Line>
      </Box>
      <Card x={976} y={130} w={880} h={330} at={6.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 18 }}>
          <Head>step 0 의 평균 gradient (네 sample 평균)</Head>
          <Bar label="출력 쪽 b₃" value={0.0264} max={0.0264} color={C.green} at={7.0} width={380} labelW={200} fmt="0.0264" />
          <Bar label="hidden 쪽 w₁₁" value={0.0037} max={0.0264} color={C.red} at={9.0} width={380} labelW={200} fmt="−0.0037" />
          <Line at={7.6} size={20} color={C.dim}>
            b₃ · <span style={mono(C.dim, 20)}>(0.2751 − 0.2183 − 0.2183 + 0.2672) ÷ 4 = 0.0264</span>
          </Line>
          <Line at={10.6} color={C.muted}>
            hidden 쪽 크기는 출력 쪽의 7 분의 1 에 그쳐, hidden neuron 이 거의 움직이지 않는다
          </Line>
        </div>
      </Card>
      <Card x={64} y={480} w={880} h={400} at={13}>
        <div style={{ position: 'absolute', left: 28, top: 22 }}>
          <Head>loss · η = 1 로 2,000 step</Head>
        </div>
        <svg width={860} height={300} style={{ position: 'absolute', left: 10, top: 84 }}>
          <g opacity={prog(t, 13.2)}>
            <line x1={60} y1={280} x2={800} y2={280} stroke={C.cardEdge} strokeWidth={2} />
            <line x1={60} y1={30} x2={60} y2={280} stroke={C.cardEdge} strokeWidth={2} />
            {[0, 1000, 2000].map((s) => (
              <text key={s} x={X(s)} y={300} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {s.toLocaleString('en-US')}
              </text>
            ))}
          </g>
          <rect x={X(200)} y={30} width={X(500) - X(200)} height={250} fill={C.orange} opacity={0.12 * prog(t, 16)} />
          <text x={260} y={150} fill={C.orange} fontSize={20} opacity={prog(t, 16)}>
            200 ~ 500 step 에 급히 떨어진다
          </text>
          <polyline points={pts.map(([s, v]) => `${X(s)},${Y(v)}`).join(' ')} fill="none" stroke={C.accent} strokeWidth={3} opacity={prog(t, 13.4)} />
          {pts.map(([s, v], i) => (
            <circle key={s} cx={X(s)} cy={Y(v)} r={5} fill={C.accent} opacity={prog(t, 13.4 + i * 0.3)} />
          ))}
          <text x={72} y={30} fill={C.text} fontSize={20} fontFamily={MONO} opacity={prog(t, 13.4)}>
            0.2478
          </text>
          <text x={112} y={62} fill={C.text} fontSize={20} fontFamily={MONO} opacity={prog(t, 14.4)}>
            0.2270 · 100 step
          </text>
          <text x={800} y={256} textAnchor="end" fill={C.text} fontSize={20} fontFamily={MONO} opacity={prog(t, 15)}>
            0.0020 · 2,000 step
          </text>
        </svg>
      </Card>
      <Card x={976} y={480} w={880} h={400} at={19.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 18 }}>
          <Head>sigmoid 층 n 개 · 곱해지는 값의 최댓값 0.25ⁿ</Head>
          <Bar label="1 층" value={0.25} max={0.25} color={C.red} at={19.8} width={380} labelW={100} fmt="0.25" />
          <Bar label="2 층" value={0.0625} max={0.25} color={C.red} at={20.4} width={380} labelW={100} fmt="0.0625" />
          <Bar label="3 층" value={0.0156} max={0.25} color={C.red} at={21.0} width={380} labelW={100} fmt="0.0156" />
          <Bar label="5 층" value={0.00098} max={0.25} color={C.red} at={21.6} width={380} labelW={100} fmt="0.00098" />
          <Bar label="10 층" value={0.00000095} max={0.25} color={C.red} at={22.2} width={380} labelW={100} fmt="0.00000095" />
          <Line at={25.8} color={C.green}>
            ReLU 는 양수 입력에서 기울기 1 · 입력을 출력에 더하는 연결 (ResNet18)
          </Line>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- initialisation and PyTorch autograd ----------

function Init() {
  const t = useSec()
  const P = (x: number, y: number): [number, number] => [50 + x * 240, 290 - y * 240]
  const pts: [number, number, boolean, string, number, number][] = [
    [0, 0, false, '[0, 0]', 26, 330],
    [0, 1, true, '[0, 1]', 26, 26],
    [1, 0, true, '[1, 0]', 256, 330],
    [1, 1, false, '[1, 1]', 256, 26],
  ]
  const band = [P(0.43, 0), P(1, 0), P(1, 0.54), P(0.54, 1), P(0, 1), P(0, 0.43)].map((p) => p.join(',')).join(' ')
  const nb = (name: string) => (
    <div style={{ padding: '16px 20px', borderRadius: 16, border: `1.5px solid ${C.red}77`, background: C.bg, display: 'grid', gap: 8 }}>
      <span style={mono(C.text, 24)}>{name}</span>
      <span style={{ ...line(C.text, 22), opacity: prog(t, 13.6) }}>
        gradient <span style={mono(C.orange, 22)}>−0.0113</span>
      </span>
      <span style={{ ...line(C.text, 22), opacity: prog(t, 19.8) }}>
        2,000 step 뒤 <span style={mono(C.text, 22)}>weight 5.34, bias −0.38</span>
      </span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={550} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 22 }}>
          <Head color={C.green}>서로 다른 값에서 출발 · η = 1, 2,000 step</Head>
        </div>
        <svg width={340} height={340} style={{ position: 'absolute', left: 20, top: 90 }}>
          <rect x={50} y={50} width={240} height={240} fill="none" stroke={C.cardEdge} strokeWidth={2} opacity={prog(t, 0.6)} />
          <polygon points={band} fill={C.green} opacity={0.14 * prog(t, 11.5)} />
          <g opacity={prog(t, 7.0)}>
            <line x1={P(0.43, 0)[0]} y1={P(0.43, 0)[1]} x2={P(0, 0.43)[0]} y2={P(0, 0.43)[1]} stroke={C.blue} strokeWidth={3} />
            <text x={135} y={330} fill={C.blue} fontSize={20} fontFamily={MONO}>
              h₁ 0.43
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            <line x1={P(1, 0.54)[0]} y1={P(1, 0.54)[1]} x2={P(0.54, 1)[0]} y2={P(0.54, 1)[1]} stroke={C.purple} strokeWidth={3} />
            <text x={150} y={26} fill={C.purple} fontSize={20} fontFamily={MONO}>
              h₂ 1.54
            </text>
          </g>
          {pts.map(([x, y, one, label, lx, ly]) => (
            <g key={label} opacity={prog(t, 1.8)}>
              <circle cx={P(x, y)[0]} cy={P(x, y)[1]} r={9} fill={one ? C.green : C.red} />
              <text x={lx} y={ly} fill={C.muted} fontSize={20} fontFamily={MONO}>
                {label}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 380, top: 90, width: 470, display: 'grid', gap: 12 }}>
          <Line at={0.8}>
            loss <span style={mono(C.green, 23)}>0.2478 → 0.0020</span>
          </Line>
          <Line at={1.8} color={C.muted}>
            예측 [0, 0] 0.048 · [0, 1]·[1, 0] 0.957 · [1, 1] 0.045
          </Line>
          <Line at={7.0}>
            <span style={{ color: C.blue }}>h₁</span> weight 5.64, bias −2.40 → x₁ + x₂ &gt; 0.43 · OR 에 가깝다
          </Line>
          <Line at={9.5}>
            <span style={{ color: C.purple }}>h₂</span> weight 4.12, bias −6.33 → x₁ + x₂ &gt; 1.54 · AND 에 가깝다
          </Line>
          <Line at={11.5} color={C.green}>
            출력 v₁ 7.84, v₂ −8.35 → OR 이면서 AND 는 아닐 때 켜진다 = XOR
          </Line>
        </div>
        <div style={{ position: 'absolute', left: 28, top: 460, width: 820, opacity: prog(t, 1.8) }}>
          <Label size={20} color={C.dim}>
            <span style={{ color: C.green }}>●</span> 정답 1 &nbsp; <span style={{ color: C.red }}>●</span> 정답 0 · 두 경계 사이의 띠에서 출력이 0.5 를 넘는다
          </Label>
        </div>
      </Card>
      <Card x={976} y={130} w={880} h={550} at={13}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 18 }}>
          <Head color={C.red}>같은 값에서 출발 · weight [1, 1], bias 0, v₁ = v₂ = 1</Head>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, opacity: prog(t, 13.3) }}>
            {nb('h₁')}
            {nb('h₂')}
          </div>
          <Line at={13.8} size={20} color={C.dim}>
            입력 [1, 0] · z 의 gradient = z₃ 의 gradient −0.0574 × v 1 × σ′(1) 0.1966
          </Line>
          <Line at={20.6}>
            예측 [0, 0] 0.069 · [0, 1]·[1, 0] 0.662 · [1, 1] <span style={{ color: C.red }}>0.670 ✕</span>
          </Line>
          <Line at={22.2}>
            loss <span style={mono(C.red, 23)}>0.1708</span> · 20,000 step 을 학습해도 0.167 근처에서 멈춘다
          </Line>
          <Line at={23.8} color={C.muted}>
            똑같은 neuron 두 개는 neuron 하나와 같아서 직선 하나밖에 긋지 못한다
          </Line>
        </div>
      </Card>
      <Box x={64} y={700} w={1792} h={180} at={25.5} gap={10} color={`${C.green}77`} title={<Head color={C.green}>그래서 서로 다른 작은 random 값으로 출발시킨다</Head>}>
        <Line at={25.8}>
          모든 parameter 가 0 이면 이 XOR 문제에서는 gradient 아홉 개가 모두 0 이라 아무것도 배우지 못한다
        </Line>
        <Line at={27}>
          PyTorch <span style={mono(C.text, 23)}>nn.Linear</span> 기본 · −1/√(입력 수) 와 +1/√(입력 수) 사이에서 고르게 · 입력 2 개면 <span style={mono(C.green, 23)}>±1/√2 ≈ ±0.71</span>
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function AutogradScene() {
  const t = useSec()
  const chain = [
    { x: 860, w: 220, top: 'L = −8', bottom: '.backward()', at: 0.8, color: C.accent },
    { x: 580, w: 230, top: 'MulBackward0', bottom: 'd 4 · f −2 저장', at: 1.6, color: C.blue },
    { x: 300, w: 230, top: 'AddBackward0', bottom: '', at: 2.4, color: C.blue },
    { x: 20, w: 230, top: 'MulBackward0', bottom: 'a 2 · b −3 저장', at: 3.2, color: C.blue },
  ]
  const leaves = [
    { x: 20, y: 20, name: 'a', g: '6', at: 7.4 },
    { x: 20, y: 410, name: 'b', g: '−4', at: 8.2 },
    { x: 300, y: 20, name: 'c', g: '−2', at: 9.0 },
    { x: 580, y: 410, name: 'f', g: '4', at: 9.8 },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1140} h={750} at={0.2}>
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'grid', gap: 6 }}>
          <span style={mono(C.text, 28)}>PyTorch 가 기록한 graph · L = (a × b + c) × f</span>
          <Label size={22} color={C.muted}>
            requires_grad=True 인 tensor 로 계산하면 연산마다 backward 규칙을 담은 grad_fn 이 남는다
          </Label>
        </div>
        <svg width={1100} height={520} style={{ position: 'absolute', left: 20, top: 110 }}>
          {chain.map((c, i) => (
            <g key={i} opacity={prog(t, c.at)}>
              <rect x={c.x} y={200} width={c.w} height={120} rx={16} fill={C.bg} stroke={c.color} strokeWidth={2.5} />
              <text x={c.x + c.w / 2} y={c.bottom ? 250 : 268} textAnchor="middle" fill={c.color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {c.top}
              </text>
              {c.bottom && (
                <text x={c.x + c.w / 2} y={290} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={i === 0 ? MONO : undefined}>
                  {c.bottom}
                </text>
              )}
              {i > 0 && arrow(chain[i - 1].x - 2, 260, c.x + c.w + 2, 260, C.orange, 3, 12)}
            </g>
          ))}
          <text x={600} y={186} fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 1.8)}>
            L.grad_fn
          </text>
          {leaves.map((l) => {
            const from = l.name === 'c' ? 415 : l.name === 'f' ? 695 : 135
            const up = l.y < 200
            return (
              <g key={l.name} opacity={prog(t, 4.2)}>
                {arrow(from, up ? 198 : 322, from, up ? 112 : 408, C.orange, 3, 12)}
                <rect x={l.x} y={l.y} width={230} height={90} rx={14} fill={C.bg} stroke={C.muted} strokeWidth={2} />
                <text x={l.x + 115} y={l.y + 36} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  AccumulateGrad
                </text>
                <text x={l.x + 115} y={l.y + 72} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, l.at)}>
                  {l.name}.grad = {l.g}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 660, width: 1080 }}>
          <Line at={10.8} color={C.muted}>
            leaf(사용자가 만든 tensor)의 AccumulateGrad 가 받은 gradient 를 .grad 에 더한다 · 중간 값 p, d 의 .grad 는 남기지 않는다
          </Line>
        </div>
      </Card>
      <Box x={1236} y={130} w={620} h={360} at={13.5} color={`${C.orange}88`} title={<Head color={C.orange}>.grad 는 더해 쌓는다</Head>}>
        <Line at={13.8}>
          L = q + a 에서 backward 한 번 → <span style={mono(C.orange, 23)}>a.grad = 2 + 1 = 3</span>
        </Line>
        <Line at={16}>
          forward 부터 다시 계산해 backward 를 한 번 더 → <span style={mono(C.red, 23)}>3 + 3 = 6</span>
        </Line>
        <Line at={18} color={C.green}>
          그래서 학습 loop 는 매 step gradient 를 0 으로 지우고 시작한다
        </Line>
      </Box>
      <Box x={1236} y={510} w={620} h={370} at={20.5} title={<Head>graph 가 필요 없을 때</Head>}>
        <Line at={20.8}>
          LeRobot ACT 의 <span style={mono(C.accent, 22)}>select_action</span> 은 <span style={mono(C.accent, 22)}>@torch.no_grad()</span> 로 감싸 graph 를 기록하지 않는다
        </Line>
        <Line at={23}>
          일부 parameter 고정: <span style={mono(C.accent, 22)}>requires_grad_(False)</span> → 그 gradient 는 계산하지 않는다
        </Line>
        <Line at={25} color={C.muted}>
          SmolVLA: 약 4억 5천만 개 중 action 을 내는 약 1억 개만 학습
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'graph 와 backward', color: C.accent, text: 'L 의 gradient 1 에서 local derivative 를 곱하며 거꾸로 · a: (−2) × 1 × (−3) = 6', at: 0.5 },
    { tag: '누적과 reverse-mode', color: C.blue, text: 'L = q + a 의 a 는 2 + 1 = 3 · parameter 9 개든 8천만 개든 graph 를 2 번 훑는다', at: 4.4 },
    { tag: 'XOR 와 vanishing', color: C.orange, text: '정답 없는 h₁ 도 −0.2183 을 받는다 · sigmoid 마다 0.25 이하 → 5 층이면 0.00098', at: 8.4 },
    { tag: '초기화와 autograd', color: C.red, text: '같은 값 출발 → 끝까지 같은 neuron · grad_fn 으로 backward 해 .grad 에 더해 쌓기', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            출력 각도가 틀렸을 때 8천만 개를 각각 어느 쪽으로 얼마나 고칠지 어떻게 알까?
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
            NEXT · CORE
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>PyTorch Training Loop</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            같은 계산을 tensor 단위로 한꺼번에 · 매 step gradient 를 지운 뒤 update 하는 학습 loop
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/autograd (Rumelhart · Hinton · Williams 1986 · Baydin 등 2018)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseBackward = () => (
  <PauseWrite
    question="같은 graph L = (a × b + c) × f 에 a = 1, b = 4, c = −1, f = 3 을 넣었다. forward 를 한 뒤 f, d, p, a, b 의 gradient 를 backward 순서대로 구하라."
    answer={
      <>
        forward: p = 1 × 4 = 4 · d = 4 + (−1) = 3 · L = 3 × 3 = 9
        <br />
        f = 1 × d = 3 · d = 1 × f = 3 · p = 3 × 1 = 3 · a = 3 × b = 12 · b = 3 × a = 3
      </>
    }
  />
)

const PauseFanout = () => (
  <PauseWrite
    question="L = a × a 이고 a = 3 이다. a 의 gradient 는? 두 번째 입력 쪽 gradient 가 올 때 앞의 값을 덮어쓰면 얼마가 나오는가?"
    answer={
      <>
        입력마다 다른 입력 3 이 local derivative 로 들어와 3 + 3 = 6 · a² 의 derivative 2a = 6 과 같다
        <br />
        덮어쓰면 6 대신 3 이 남는다
      </>
    }
  />
)

const PauseVanish = () => (
  <PauseWrite
    question="sigmoid 층 세 개를 거친 gradient 는 sigmoid 기울기의 곱만 따졌을 때 가장 커도 처음의 몇 배인가? 세 층의 출력이 모두 0.9 라면?"
    answer={
      <>
        가장 클 때: 0.25 × 0.25 × 0.25 = 0.0156 배
        <br />
        출력 0.9: 기울기 0.9 × 0.1 = 0.09 → 0.09 × 0.09 × 0.09 ≈ 0.00073 배
      </>
    }
  />
)

const PauseSymmetry = () => (
  <PauseWrite
    question="hidden neuron 이 4 개인 network 의 hidden weight 와 bias 를 모두 같은 값으로 출발시켰다. 학습이 끝난 뒤 hidden layer 가 긋는 서로 다른 직선은 몇 개일까?"
    answer="한 개 · 네 neuron 이 늘 같은 gradient 를 받아 같은 값으로 남으므로 모두 같은 직선 하나를 긋는다"
  />
)

export function Autograd() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        graph: GraphScene,
        backward: Backward,
        'pause-backward': PauseBackward,
        fanout: Fanout,
        reverse: Reverse,
        'pause-fanout': PauseFanout,
        xor: Xor,
        vanishing: Vanishing,
        'pause-vanish': PauseVanish,
        init: Init,
        autograd: AutogradScene,
        'pause-symmetry': PauseSymmetry,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
