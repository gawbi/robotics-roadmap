import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './pi0.narration.json'
import { script } from './pi0.script'

// Numbers follow lessons/pi0/README.md (see pi0.script.ts). The attention example, the two-number Euler chunk and the ±2 cm
// two-peak demo are the lesson's own example values; the timelines are drawn to scale from the lesson's ms values.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
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
        <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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

/** a token box in a diagram: a bold name and a mono count under it */
function TokenBox({ x, y, w, h = 80, name, count, color, op }: { x: number; y: number; w: number; h?: number; name: string; count: string; color: string; op: number }) {
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={`${color}22`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
        {name}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 24} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO} fontWeight={600}>
        {count}
      </text>
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
            VLA · PHYSICAL INTELLIGENCE 2024
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 140, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>π0</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            PaliGemma <span style={{ color: C.accent }}>+ action expert</span> · flow matching
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            사진과 지시문을 읽는 VLM 옆에 action 만 만드는 작은 network 를 붙인 모델
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
  const x0 = 340
  const px = 1.4 // px per ms: 1000 ms → 1400 px
  const rowLabel = (y: number, name: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <text x={30} y={y - 4} fill={color} fontSize={26} fontWeight={600}>
        {name}
      </text>
      <text x={30} y={y + 24} fill={C.muted} fontSize={20}>
        {sub}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={400}>
        <svg width={1792} height={400}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            1 초 동안 나오는 action (RTX 4090)
          </text>
          {rowLabel(110, 'OpenVLA', '약 167 ms 마다 1 개', C.red, 0.6)}
          <g opacity={prog(t, 0.8)}>
            {Array.from({ length: 6 }, (_, k) => (
              <g key={k}>
                <rect x={x0 + k * 167 * px} y={92} width={167 * px - 6} height={36} rx={6} fill={`${C.red}22`} stroke={C.red} strokeWidth={1.5} />
                {Array.from({ length: 7 }, (_, j) => (
                  <rect key={j} x={x0 + k * 167 * px + 8 + j * 31} y={100} width={24} height={20} rx={3} fill={C.red} opacity={0.55} />
                ))}
              </g>
            ))}
          </g>
          {rowLabel(200, '50 Hz 로봇', '20 ms 마다 목표 1 개', C.text, 1.4)}
          <g opacity={prog(t, 1.6)}>
            {Array.from({ length: 50 }, (_, i) => (
              <rect key={i} x={x0 + i * 20 * px} y={184} width={20} height={32} rx={3} fill={C.muted} opacity={0.5} />
            ))}
          </g>
          {rowLabel(290, 'π0', '73 ms 에 50 개', C.green, 2.2)}
          <g opacity={prog(t, 2.4)}>
            <rect x={x0} y={272} width={73 * px} height={36} rx={6} fill={C.green} />
            {Array.from({ length: 47 }, (_, i) => (
              <rect key={i} x={x0 + (73 + i * 20) * px + 4} y={276} width={20} height={28} rx={3} fill={C.green} opacity={0.45 * prog(t, 2.6 + i * 0.03, 0.2)} />
            ))}
          </g>
          <g opacity={prog(t, 0.6)}>
            <line x1={x0} y1={340} x2={x0 + 1000 * px} y2={340} stroke={C.cardEdge} strokeWidth={2} />
            <text x={x0} y={372} fill={C.dim} fontSize={20} fontFamily={MONO}>
              0
            </text>
            <text x={x0 + 500 * px} y={372} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              0.5 초
            </text>
            <text x={x0 + 1000 * px} y={372} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              1 초
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 556, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          VLM 의 지식을 쓰면서 <span style={{ color: C.accent }}>1 초에 action 50 개를 제때 만들 수 있을까?</span>
        </div>
      </Appear>
      <Box x={64} y={692} w={570} h={188} at={5.2} title={<Head color={C.red}>OpenVLA</Head>}>
        <span style={mono(C.red, 28)}>약 167 ms → action 1 개</span>
        <span style={line(C.muted, 22)}>action 하나에 token 7 개를 차례로 낸다</span>
      </Box>
      <Box x={675} y={692} w={570} h={188} at={5.7} title={<Head color={C.green}>π0</Head>}>
        <span style={mono(C.green, 28)}>73 ms → action 50 개</span>
        <span style={line(C.muted, 22)}>50 Hz 로봇의 1 초 분량을 한 번에</span>
      </Box>
      <Box x={1286} y={692} w={570} h={188} at={6.2} title={<Head color={C.accent}>필요한 양</Head>}>
        <span style={mono(C.accent, 28)}>50 ÷ 6 ≈ 8.3 배</span>
        <span style={line(C.muted, 22)}>50 Hz 로봇에 필요한 action 대 OpenVLA</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- backbone and expert ----------

function Architecture() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1000} h={750}>
        <svg width={1000} height={750}>
          <text x={40} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            π0 의 token 한 줄
          </text>
          {[0, 1, 2].map((i) => (
            <TokenBox key={i} x={40 + i * 130} y={70} w={120} name={`사진 ${i + 1}`} count="256 개" color={C.blue} op={prog(t, 0.5 + i * 0.2)} />
          ))}
          <TokenBox x={430} y={70} w={150} name="지시문" count="최대 48 개" color={C.blue} op={prog(t, 1.2)} />
          <TokenBox x={600} y={70} w={90} name="상태" count="1 개" color={C.orange} op={prog(t, 13.8)} />
          <TokenBox x={710} y={70} w={250} name="noise 섞인 action" count="50 개" color={C.orange} op={prog(t, 14.2)} />
          <g opacity={prog(t, 1.6)}>
            {arrow(310, 156, 310, 226, C.blue)}
            <rect x={40} y={230} width={540} height={240} rx={16} fill={`${C.blue}10`} stroke={C.blue} strokeWidth={2} />
            <text x={64} y={276} fill={C.blue} fontSize={28} fontWeight={600}>
              PaliGemma backbone
            </text>
            <text x={64} y={396} fill={C.muted} fontSize={22}>
              처음 weight: 인터넷 사진·글로 pretraining
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <text x={64} y={316} fill={C.text} fontSize={22} fontFamily={MONO}>
              SigLIP image encoder + Gemma 2B
            </text>
          </g>
          <g opacity={prog(t, 8.4)}>
            <text x={64} y={354} fill={C.text} fontSize={22}>
              224×224 사진 1 장 → image token 256 개
            </text>
          </g>
          <g opacity={prog(t, 21)}>
            <text x={64} y={444} fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
              약 30 억 parameter
            </text>
          </g>
          <g opacity={prog(t, 14.6)}>
            {arrow(835, 156, 835, 226, C.orange)}
            <rect x={620} y={230} width={340} height={240} rx={16} fill={`${C.orange}10`} stroke={C.orange} strokeWidth={2} />
            <text x={644} y={276} fill={C.orange} fontSize={28} fontWeight={600}>
              action expert
            </text>
            <text x={644} y={316} fill={C.muted} fontSize={22}>
              처음 weight: 무작위
            </text>
          </g>
          <g opacity={prog(t, 16.5)}>
            <text x={644} y={354} fill={C.text} fontSize={22}>
              출력: action 마다 속도
            </text>
            <text x={644} y={392} fill={C.muted} fontSize={22}>
              팔 하나면 숫자 7 개
            </text>
          </g>
          <g opacity={prog(t, 21.6)}>
            <text x={644} y={444} fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600}>
              약 3 억 parameter
            </text>
          </g>
          <g opacity={prog(t, 15.4)}>
            {arrow(584, 336, 616, 336, C.purple, 3, 10)}
            {arrow(616, 366, 584, 366, C.purple, 3, 10)}
            <text x={500} y={512} textAnchor="middle" fill={C.purple} fontSize={22}>
              층마다 attention 으로 정보를 주고받는다
            </text>
          </g>
          <g opacity={prog(t, 22.4)}>
            <text x={40} y={588} fill={C.accent} fontSize={30} fontFamily={MONO} fontWeight={600}>
              π0 전체 ≈ 30 억 + 3 억 = 약 33 억
            </text>
          </g>
          <g opacity={prog(t, 17.5)}>
            <text x={40} y={640} fill={C.muted} fontSize={22}>
              저자들은 expert 가 둘인 mixture of experts 에 견주었다
            </text>
          </g>
          <g opacity={prog(t, 25.6)}>
            <text x={40} y={700} fill={C.orange} fontSize={24} fontWeight={600}>
              chunk 마다 여러 번 계산하는 쪽을 작게 → 추론이 빨라진다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1100} y={130} w={756} h={320} at={20.4} title={<Head color={C.accent}>논문 부록의 두 묶음 크기</Head>}>
        <Table
          head={['', 'PaliGemma', 'action expert']}
          widths={[250, 210, 230]}
          at={20.6}
          step={0.5}
          size={26}
          rows={[
            ['width', '2048', '1024'],
            ['mlp_dim', '16,384', '4096'],
            ['parameter', '약 30 억', '약 3 억'],
          ]}
        />
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 22.6) }}>width · mlp_dim 은 Gemma 2B 부분 · 30 억은 image encoder 포함</span>
      </Box>
      <Box x={1100} y={468} w={756} h={245} at={13.6} title={<Head color={C.orange}>action expert 의 출력</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 14) }}>언어 모델처럼 vocabulary 의 token 마다 확률을 내지 않는다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 16.5) }}>action token 마다 행렬 하나를 곱해, noise 섞인 action 을 고칠 속도 (velocity) 를 낸다</span>
      </Box>
      <Box x={1100} y={731} w={756} h={149} at={2.5}>
        <span style={line(C.muted, 22)}>
          두 묶음은 attention 에서만 만나서 width 가 달라도 되고, openpi 는 attention head 하나의 길이를 둘 다 <span style={mono(C.text, 22)}>256</span> 으로 맞춘다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Mask() {
  const t = useSec()
  const blocks = ['사진·지시문', '로봇 상태', 'noise 섞인 action']
  const head: [string, string?][] = [['사진·지시문'], ['로봇 상태'], ['noise 섞인', 'action']]
  const gx = 300
  const gy = 170
  const cs = 140
  const colors = [C.blue, C.orange, C.green]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={860} h={380} at={0.3} title={<Head color={C.accent}>attention: 비율대로 value 를 섞는다 (예로 정한 값)</Head>}>
        <Table
          head={['action token 이 보는 대상', '비율', 'value', '비율 × value']}
          widths={[330, 120, 120, 200]}
          at={0.6}
          step={0.5}
          rows={[
            ['컵이 찍힌 image token', '0.7', '10', '7.0'],
            ['지시문의 "cup" token', '0.2', '4', '0.8'],
            ['로봇 상태 token', '0.1', '2', '0.2'],
            ['합', '1.0', '', '8.0'],
          ]}
          colors={[undefined, undefined, undefined, C.accent]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3) }}>query: action expert 의 weight · key 와 value: PaliGemma 의 weight</span>
      </Box>
      <Box x={64} y={530} w={860} h={350} at={6.8} title={<Head color={C.purple}>층 18 개 · 층을 지날 때마다 다시 가져온다</Head>}>
        <svg width={804} height={240}>
          <text x={40} y={18} fill={C.blue} fontSize={20} fontWeight={600}>
            PaliGemma
          </text>
          <text x={504} y={18} fill={C.orange} fontSize={20} fontWeight={600}>
            action expert
          </text>
          {Array.from({ length: 18 }, (_, i) => {
            const y = 30 + i * 11.5
            const op = prog(t, 7.4 + i * 0.25, 0.3)
            return (
              <g key={i} opacity={0.25 + 0.75 * op}>
                <rect x={40} y={y} width={260} height={8} rx={3} fill={C.blue} opacity={0.7} />
                <rect x={504} y={y} width={260} height={8} rx={3} fill={C.orange} opacity={0.7} />
                <line x1={306} y1={y + 4} x2={498} y2={y + 4} stroke={C.purple} strokeWidth={2} strokeDasharray="5 6" opacity={op} />
              </g>
            )
          })}
        </svg>
      </Box>
      <Card x={960} y={130} w={896} h={750} at={13.4}>
        <svg width={896} height={600}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
            blockwise causal attention mask
          </text>
          <text x={30} y={80} fill={C.muted} fontSize={22}>
            행 = 보는 쪽 · 열 = 보이는 쪽
          </text>
          {head.map(([a, b], j) => (
            <g key={j}>
              <text x={gx + j * cs + cs / 2} y={b ? 130 : 152} textAnchor="middle" fill={colors[j]} fontSize={20} fontWeight={600}>
                {a}
              </text>
              {b && (
                <text x={gx + j * cs + cs / 2} y={154} textAnchor="middle" fill={colors[j]} fontSize={20} fontWeight={600}>
                  {b}
                </text>
              )}
            </g>
          ))}
          {blocks.map((name, r) => {
            const op = prog(t, 14 + r * 0.9)
            return (
              <g key={name} opacity={op}>
                <text x={gx - 15} y={gy + r * cs + cs / 2 + 8} textAnchor="end" fill={colors[r]} fontSize={22} fontWeight={600}>
                  {name}
                </text>
                {[0, 1, 2].map((c) => {
                  const sees = c <= r
                  const same = c === r
                  return (
                    <g key={c}>
                      <rect x={gx + c * cs + 4} y={gy + r * cs + 4} width={cs - 8} height={cs - 8} rx={10} fill={sees ? `${C.green}${same ? '55' : '30'}` : C.grid} stroke={same ? C.green : C.cardEdge} strokeWidth={same ? 2.5 : 1.5} />
                      <text x={gx + c * cs + cs / 2} y={gy + r * cs + cs / 2 + 8} textAnchor="middle" fill={sees ? C.text : C.dim} fontSize={22} fontWeight={sees ? 600 : 400}>
                        {sees ? '본다' : '못 본다'}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 610, width: 836, display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.blue, 22), opacity: prog(t, 20.8) }}>사진·지시문: 로봇 입력을 못 봐서 pretraining 때 배운 계산을 지킨다</span>
          <span style={{ ...line(C.orange, 22), opacity: prog(t, 21.6) }}>로봇 상태: action 을 안 봐서 chunk 하나에 한 번만 계산한다</span>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 22.4) }}>action: 세 block 을 모두 보고 chunk 50 개를 함께 고친다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseWeights = () => (
  <PauseWrite
    question='손목 카메라 사진, "put the cup in the box", 지금 관절 각도 7 개, noise 가 섞인 action 은 각각 어느 weight 묶음이 처리할까?'
    answer={
      <>
        사진 · 지시문 → PaliGemma backbone
        <br />
        관절 각도 · noise 섞인 action → action expert
      </>
    }
  />
)

// ---------- flow matching ----------

function Chunk() {
  const t = useSec()
  const sx = 216 // px per second on the two time bars
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={360} at={0.3}>
        <svg width={900} height={360}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            chunk = action 50 개
          </text>
          <text x={30} y={80} fill={C.muted} fontSize={22} fontFamily={MONO}>
            A(t) = [a(t), a(t+1), …, a(t+49)]
          </text>
          {Array.from({ length: 50 }, (_, i) => (
            <rect key={i} x={30 + i * 16.4} y={104} width={14} height={40} rx={3} fill={C.accent} opacity={0.2 + 0.6 * prog(t, 0.8 + i * 0.03, 0.2)} />
          ))}
          <g opacity={prog(t, 3)}>
            <text x={30} y={208} fill={C.text} fontSize={22}>
              50 Hz 로봇
            </text>
            <rect x={220} y={188} width={sx * prog(t, 3, 0.8)} height={26} rx={6} fill={C.green} />
            <text x={220 + sx + 16} y={209} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              1 초 분량
            </text>
          </g>
          <g opacity={prog(t, 4.4)}>
            <text x={30} y={268} fill={C.text} fontSize={22}>
              20 Hz 로봇
            </text>
            <rect x={220} y={248} width={2.5 * sx * prog(t, 4.4, 1)} height={26} rx={6} fill={C.orange} />
            <text x={220 + 2.5 * sx + 14} y={269} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              2.5 초
            </text>
            <text x={30} y={326} fill={C.muted} fontSize={22}>
              20 Hz 는 step 하나가 0.05 초 → 50 × 0.05 = 2.5 초
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={510} w={900} h={370} at={7}>
        <svg width={900} height={370}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            action 하나 = 숫자 18 개 (가장 큰 로봇 기준)
          </text>
          <text x={30} y={78} fill={C.muted} fontSize={20}>
            6 관절 팔 둘 · 집게 둘 · 움직이는 바닥 · 위아래로 움직이는 몸통
          </text>
          {Array.from({ length: 18 }, (_, i) => {
            const used = i < 7
            return (
              <g key={i} opacity={prog(t, 7.4 + i * 0.08, 0.3)}>
                <rect x={30 + i * 46} y={100} width={40} height={48} rx={6} fill={used ? `${C.orange}66` : C.grid} stroke={used ? C.orange : C.cardEdge} strokeWidth={1.5} />
                {!used && (
                  <text x={50 + i * 46} y={132} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                    0
                  </text>
                )}
              </g>
            )
          })}
          <g opacity={prog(t, 8.6)}>
            <text x={30} y={184} fill={C.orange} fontSize={22}>
              팔 하나 + 집게: 7 개
            </text>
            <text x={362} y={184} fill={C.dim} fontSize={22}>
              0 으로 채움: 18 − 7 = 11 개
            </text>
          </g>
          <g opacity={prog(t, 9.8)}>
            <text x={30} y={240} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
              chunk 하나의 숫자 50 × 18 = 900 개
            </text>
          </g>
          <g opacity={prog(t, 11)}>
            <text x={30} y={290} fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600}>
              뜻이 있는 숫자 50 × 7 = 350 개
            </text>
          </g>
          <g opacity={prog(t, 12)}>
            <text x={30} y={340} fill={C.dim} fontSize={20}>
              openpi 와 LeRobot 은 이 자리 수를 32 로 둔다
            </text>
          </g>
        </svg>
      </Card>
      <Box x={1000} y={130} w={856} h={470} at={13.8} title={<Head color={C.accent}>flow matching 학습 (A: 시연 chunk · ε: noise)</Head>}>
        {(
          [
            ['섞은 점', 'τ × A + (1 − τ) × ε', C.text, 14.2],
            ['정답 속도', 'A − ε  (target velocity)', C.green, 15.6],
            ['loss', '(network 속도 − (A − ε))²', C.text, 17.2],
            ['Euler 한 step', '새 값 = 지금 값 + δ × 속도', C.accent, 18.6],
            ['관측 o', '사진 · 지시문 · 관절 각도', C.muted, 19.4],
          ] as [string, string, string, number][]
        ).map(([k, v, c, at]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 20, opacity: prog(t, at) }}>
            <span style={{ width: 200, ...line(C.muted, 22) }}>{k}</span>
            <span style={mono(c, 26)}>{v}</span>
          </div>
        ))}
        <span style={{ ...line(C.dim, 21), opacity: prog(t, 19.8) }}>아래첨자 t 는 로봇의 step · 시각 τ 는 0 이 noise, 1 이 시연 쪽</span>
      </Box>
      <Box x={1000} y={616} w={856} h={264} at={20.8} title={<Head color={C.purple}>τ 를 뽑는 분포 (beta 분포, s = 0.999)</Head>}>
        <svg width={800} height={165}>
          <TauCurve t={t} />
        </svg>
      </Box>
    </AbsoluteFill>
  )
}

function TauCurve({ t }: { t: number }) {
  const X = (tau: number) => 40 + tau * 520
  const base = 140
  const hmax = 120
  const pts = Array.from({ length: 101 }, (_, i) => {
    const tau = (i / 100) * 0.999
    return `${X(tau)},${base - hmax * Math.sqrt((0.999 - tau) / 0.999)}`
  })
  const h1 = hmax * 0.949
  const h9 = hmax * 0.315
  return (
    <g>
      <polyline points={`${X(0)},${base} ${pts.join(' ')} ${X(0.999)},${base}`} fill={`${C.purple}26`} stroke={C.purple} strokeWidth={2.5} opacity={prog(t, 21)} />
      <line x1={X(0)} y1={base} x2={X(1)} y2={base} stroke={C.cardEdge} strokeWidth={2} />
      <g opacity={prog(t, 22)}>
        <line x1={X(0.1)} y1={base} x2={X(0.1)} y2={base - h1} stroke={C.accent} strokeWidth={3} />
        <circle cx={X(0.1)} cy={base - h1} r={6} fill={C.accent} />
        <line x1={X(0.9)} y1={base} x2={X(0.9)} y2={base - h9} stroke={C.orange} strokeWidth={3} />
        <circle cx={X(0.9)} cy={base - h9} r={6} fill={C.orange} />
      </g>
      {(
        [
          [0, '0'],
          [0.1, '0.1'],
          [0.9, '0.9'],
          [1, '1'],
        ] as [number, string][]
      ).map(([v, s]) => (
        <text key={s} x={X(v)} y={162} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO} opacity={prog(t, 21)}>
          {s}
        </text>
      ))}
      <g opacity={prog(t, 22.6)} fontFamily={MONO} fontSize={22} fontWeight={600}>
        <text x={600} y={44} fill={C.accent}>
          τ 0.1: 0.949
        </text>
        <text x={600} y={86} fill={C.orange}>
          τ 0.9: 0.315
        </text>
        <text x={600} y={128} fill={C.text}>
          비 ≈ 3.0
        </text>
      </g>
    </g>
  )
}

function Euler() {
  const t = useSec()
  const X = (k: number) => 100 + 85 * k
  const Y = (v: number) => 500 - (v + 0.75) * 146.7
  const shown = Math.max(0, Math.min(10, Math.floor((t - 12.4) / 0.42)))
  const s1 = Array.from({ length: 11 }, (_, k) => -0.5 + 0.25 * k)
  const s2 = Array.from({ length: 11 }, (_, k) => 1.0 - 0.05 * k)
  const series = (vals: number[], color: string) => (
    <g>
      <polyline points={vals.slice(0, shown + 1).map((v, k) => `${X(k)},${Y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth={3} />
      {vals.slice(0, shown + 1).map((v, k) => (
        <circle key={k} cx={X(k)} cy={Y(v)} r={6} fill={color} />
      ))}
    </g>
  )
  // the two-peak demo on the right
  const D = (v: number) => 348 + v * 96
  const bump = Array.from({ length: 121 }, (_, i) => {
    const v = -3 + i * 0.05
    const g = Math.exp(-((v - 2) ** 2) / (2 * 0.2)) + Math.exp(-((v + 2) ** 2) / (2 * 0.2))
    return `${D(v)},${590 - 150 * g}`
  })
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1060} h={750}>
        <div style={{ position: 'absolute', left: 30, top: 28 }}>
          <Flow steps={['noise (τ = 0)', 'action expert', '속도 × 0.1 을 더한다']} color={C.accent} at={0.6} last="× 10 번" />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 104, ...line(C.muted, 22), opacity: prog(t, 6.2) }}>
          step 마다 action token 50 개의 속도를 한꺼번에 받는다 · 10 step 이면 τ 가 0 → 1
        </div>
        <svg width={1060} height={590} style={{ position: 'absolute', left: 0, top: 150 }}>
          <g opacity={prog(t, 12)}>
            <text x={30} y={30} fill={C.text} fontSize={22} fontWeight={600}>
              두 숫자짜리 chunk 의 Euler 10 step (예로 정한 값)
            </text>
            <line x1={X(0)} y1={520} x2={X(10)} y2={520} stroke={C.cardEdge} strokeWidth={2} />
            {[0, 5, 10].map((k) => (
              <text key={k} x={X(k)} y={548} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                τ {k / 10}
              </text>
            ))}
            <line x1={X(0)} y1={Y(0)} x2={X(10)} y2={Y(0)} stroke={C.grid} strokeWidth={1.5} strokeDasharray="6 6" />
            {series(s1, C.blue)}
            {series(s2, C.orange)}
            <text x={X(0) - 14} y={Y(-0.5) + 7} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              −0.5
            </text>
            <text x={X(0) - 14} y={Y(1.0) + 7} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              1.0
            </text>
          </g>
          <g opacity={prog(t, 14.5)}>
            <text x={400} y={230} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              +0.25 / step
            </text>
            <text x={760} y={345} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              −0.05 / step
            </text>
          </g>
          <g opacity={prog(t, 16.6)}>
            <text x={X(10) + 14} y={Y(2.0) + 7} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              2.0
            </text>
            <text x={X(10) + 14} y={Y(0.5) + 7} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0.5
            </text>
            <text x={30} y={582} fill={C.muted} fontSize={21} fontFamily={MONO}>
              속도 = A − ε = (2.0, 0.5) − (−0.5, 1.0) = (2.5, −0.5)
            </text>
          </g>
        </svg>
      </Panel>
      <Card x={1160} y={130} w={696} h={750} at={18.2}>
        <svg width={696} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            정답이 여럿인 시연 (예)
          </text>
          <g opacity={prog(t, 18.6)}>
            <rect x={288} y={120} width={120} height={70} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={348} y={163} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              상자
            </text>
            <path d="M348,320 Q120,205 348,92" fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="8 6" />
            <path d="M348,320 Q576,205 348,92" fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="8 6" />
            <circle cx={348} cy={92} r={8} fill={C.green} />
            <circle cx={348} cy={320} r={8} fill={C.text} />
            <text x={70} y={212} fill={C.green} fontSize={22}>
              왼쪽 2 cm
            </text>
            <text x={500} y={212} fill={C.green} fontSize={22}>
              오른쪽 2 cm
            </text>
          </g>
          <g opacity={prog(t, 20.4)}>
            {arrow(348, 310, 348, 200, C.red, 3)}
            <text x={348} y={356} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={600}>
              평균 0 → 상자에 부딪힘
            </text>
          </g>
          <g opacity={prog(t, 19.2)}>
            <polyline points={bump.join(' ')} fill={`${C.green}22`} stroke={C.green} strokeWidth={2.5} />
            <line x1={D(-3)} y1={590} x2={D(3)} y2={590} stroke={C.cardEdge} strokeWidth={2} />
            {(
              [
                [-2, '−2'],
                [0, '0'],
                [2, '+2'],
              ] as [number, string][]
            ).map(([v, s]) => (
              <text key={s} x={D(v)} y={618} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {s}
              </text>
            ))}
          </g>
          <g opacity={prog(t, 20.8)}>
            <line x1={D(0)} y1={590} x2={D(0)} y2={472} stroke={C.red} strokeWidth={2.5} strokeDasharray="6 5" />
            <text x={D(0)} y={458} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              평균 0
            </text>
          </g>
          <g opacity={prog(t, 24.3)}>
            <circle cx={D(0.3)} cy={590} r={6} fill={C.accent} />
            <circle cx={D(-0.3)} cy={590} r={6} fill={C.accent} />
            <text x={30} y={668} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              noise 0.3 → +2 · noise −0.3 → −2
            </text>
          </g>
          <g opacity={prog(t, 26.4)}>
            <text x={30} y={712} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              Euler 1 step: 0.3 − 0.3 = 0 (평균)
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

const PauseFlow = () => (
  <PauseWrite
    question="시연 값 A = 2.0, noise ε = −0.5 일 때 τ = 0.3 의 섞은 점 τ × A + (1 − τ) × ε 과 target velocity 는?"
    answer={
      <>
        섞은 점 = 0.3 × 2.0 + 0.7 × (−0.5) = 0.25
        <br />
        target velocity = A − ε = 2.0 − (−0.5) = 2.5
      </>
    }
  />
)

// ---------- KV cache and execution ----------

function KvCache() {
  const t = useSec()
  const x0 = 300
  const px = 2.67 // px per ms: 487 ms → 1300 px
  const seg = (x: number, y: number, ms: number, color: string) => <rect x={x} y={y} width={Math.max(2, ms * px - 1.5)} height={44} rx={3} fill={color} />
  const step = (x: number, y: number, withPrefix: boolean, n: number) => (
    <g>
      {withPrefix && seg(x, y, 14, C.blue)}
      {withPrefix && seg(x + 14 * px, y, 32, C.purple)}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{seg(x + (withPrefix ? 46 * px : 0) + i * 2.7 * px, y, 2.7, C.green)}</g>
      ))}
    </g>
  )
  const done = prog(t, 18.4, 1.2)
  const noCache = Math.floor(10 * prog(t, 24.4, 2.4))
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={300} at={0.3}>
        <svg width={1792} height={300}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            chunk 하나를 만드는 동안의 token
          </text>
          <TokenBox x={30} y={70} w={760} h={90} name="카메라 3 대의 image token" count="3 × 256 = 768 개" color={C.blue} op={prog(t, 0.6)} />
          <TokenBox x={810} y={70} w={260} h={90} name="지시문" count="최대 48 개" color={C.blue} op={prog(t, 0.9)} />
          <TokenBox x={1090} y={70} w={200} h={90} name="로봇 상태" count="1 개" color={C.orange} op={prog(t, 1.2)} />
          <TokenBox x={1340} y={70} w={420} h={90} name="noise 섞인 action token" count="50 개" color={C.green} op={prog(t, 1.5)} />
          <g opacity={prog(t, 6.2)}>
            <path d="M30,180 L30,192 L1290,192 L1290,180" fill="none" stroke={C.muted} strokeWidth={2} />
            <text x={660} y={230} textAnchor="middle" fill={C.text} fontSize={24}>
              바뀌지 않음: 768 + 48 + 1 = 최대 817 개
            </text>
          </g>
          <g opacity={prog(t, 12.2)}>
            <text x={660} y={270} textAnchor="middle" fill={C.accent} fontSize={24} fontWeight={600}>
              key · value 를 처음 한 번만 계산해 KV cache 에 저장
            </text>
          </g>
          <g opacity={prog(t, 2)}>
            <path d="M1340,180 L1340,192 L1760,192 L1760,180" fill="none" stroke={C.green} strokeWidth={2} />
            <text x={1550} y={230} textAnchor="middle" fill={C.green} fontSize={24}>
              Euler step 마다 바뀜 (10 번)
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={450} w={1792} h={430} at={18}>
        <svg width={1792} height={430}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            RTX 4090 · 카메라 3 대로 잰 chunk 하나의 시간
          </text>
          <text x={30} y={122} fill={C.accent} fontSize={24} fontWeight={600}>
            KV cache 사용
          </text>
          <g opacity={done}>{step(x0, 90, true, Math.round(10 * done))}</g>
          <text x={x0 + 73 * px + 16} y={124} fill={C.accent} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.4)}>
            73 ms
          </text>
          <text x={30} y={180} fill={C.muted} fontSize={22} opacity={prog(t, 19)}>
            <tspan fill={C.blue}>image encoder 14 ms</tspan>
            <tspan> → </tspan>
            <tspan fill={C.purple}>사진·지시문·상태 32 ms (한 번)</tspan>
            <tspan> → </tspan>
            <tspan fill={C.green}>action 계산 2.7 ms × 10 = 27 ms</tspan>
            <tspan> → 합 14 + 32 + 27 = 73 ms</tspan>
          </text>
          <g opacity={prog(t, 24)}>
            <text x={30} y={262} fill={C.red} fontSize={24} fontWeight={600}>
              cache 없음
            </text>
            {Array.from({ length: noCache }, (_, i) => (
              <g key={i}>{step(x0 + i * 48.7 * px, 230, true, 1)}</g>
            ))}
            <text x={x0 + 487 * px + 16} y={264} fill={C.red} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={prog(t, 26.6)}>
              487 ms
            </text>
            <text x={30} y={320} fill={C.muted} fontSize={22}>
              step 마다 14 + 32 + 2.7 = 48.7 ms → × 10 = 487 ms
            </text>
          </g>
          <g opacity={prog(t, 27)}>
            <text x={30} y={384} fill={C.accent} fontSize={26} fontWeight={600}>
              487 ÷ 73 ≈ 6.7 배 · 사진에서 가져오는 정보는 그대로, 되풀이하던 계산만 줄었다
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Async() {
  const t = useSec()
  const x0 = 260
  const px = 1.25 // px per ms
  const ticks = (from: number, y: number, n: number, color: string, op: number) => (
    <g opacity={op}>
      <rect x={x0 + from * px} y={y} width={n * 20 * px - 2} height={50} rx={6} fill={`${color}33`} stroke={color} strokeWidth={1.5} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <line key={i} x1={x0 + (from + (i + 1) * 20) * px} y1={y + 8} x2={x0 + (from + (i + 1) * 20) * px} y2={y + 42} stroke={color} strokeWidth={1} opacity={0.6} />
      ))}
    </g>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={470} at={0.3}>
        <svg width={1792} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            50 Hz 로봇의 실행 시간표 (칸 하나 = action 1 개 = 20 ms)
          </text>
          <text x={30} y={82} fill={C.muted} fontSize={22} opacity={prog(t, 1.2)}>
            chunk 50 개 중 25 개 (0.5 초) 실행 후 새로 추론 · 20 Hz 로봇은 16 개 (0.8 초)
          </text>
          <text x={30} y={186} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.6)}>
            동기
          </text>
          {ticks(0, 150, 25, C.green, prog(t, 0.8))}
          <g opacity={prog(t, 7.4)}>
            <rect x={x0 + 500 * px} y={150} width={73 * px - 2} height={50} rx={6} fill={`${C.red}55`} stroke={C.red} strokeWidth={1.5} />
            <text x={x0 + 536 * px} y={136} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              멈춤 73 ms
            </text>
          </g>
          {ticks(573, 150, 25, C.green, prog(t, 8.6))}
          <g opacity={prog(t, 10)}>
            <text x={x0 + 573 * px} y={232} fill={C.red} fontSize={22} fontFamily={MONO}>
              73 ÷ 20 = 3.65 → 약 4 step 동안 새 목표 없음
            </text>
          </g>
          <text x={30} y={316} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 13.8)}>
            비동기
          </text>
          {ticks(0, 280, 25, C.green, prog(t, 14))}
          {ticks(500, 280, 25, C.accent, prog(t, 15.6))}
          <g opacity={prog(t, 14.8)}>
            <rect x={x0 + 420 * px} y={346} width={73 * px} height={24} rx={5} fill={C.purple} />
            <text x={x0 + 505 * px} y={365} fill={C.purple} fontSize={22}>
              4 개 남았을 때 추론 시작 · 4 × 20 = 80 ms 안에 73 ms 추론 끝
            </text>
          </g>
          <g opacity={prog(t, 17.4)}>
            <text x={30} y={432} fill={C.accent} fontSize={24} fontWeight={600}>
              0.5 초 실행 한 번 · 동기 500 + 73 = 573 ms (멈춤 73 ms) · 비동기 500 ms (멈춤 0 ms)
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={620} w={1792} h={260} at={20.8}>
        <div style={{ position: 'absolute', left: 40, top: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          {(
            [
              ['π0 추론', '사진과 지시를 보고 chunk 를 만든다', '0.5 초마다 (2 Hz)', C.purple, 21],
              ['action 실행 (queue)', '목표 각도를 하나씩 꺼내 보낸다', '20 ms 마다 (50 Hz)', C.accent, 22],
              ['PID (모터 안)', '목표를 따라가도록 힘을 계산한다', '예: 1 ms 마다 (1000 Hz)', C.orange, 23],
            ] as [string, string, string, string, number][]
          ).map(([name, job, period, color, at], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at) }}>
              <div style={{ width: 520, height: 150, boxSizing: 'border-box', padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${color}`, background: `${color}12`, display: 'grid', alignContent: 'start', gap: 6 }}>
                <span style={{ ...line(color, 26), fontWeight: 600 }}>{name}</span>
                <span style={line(C.text, 22)}>{job}</span>
                <span style={mono(color, 22)}>{period}</span>
              </div>
              {i < 2 && <span style={{ fontSize: 30, color: C.muted }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 40, top: 196, ...line(C.muted, 22), opacity: prog(t, 24.5) }}>
          PID 가 1000 Hz 라면 목표 하나 (20 ms) 동안 20 번 계산해서, 0.5 초에 한 번인 추론 사이를 1 ms 주기로 채운다
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseKv = () => (
  <PauseWrite
    question="image encoder 20 ms, 사진·지시문·상태 계산 40 ms, action 계산 한 번 3 ms 인 모델이 Euler 10 step 을 밟는다. KV cache 를 쓸 때와 안 쓸 때 chunk 하나의 시간은?"
    answer={
      <>
        쓸 때: 20 + 40 + 10 × 3 = 90 ms
        <br />
        안 쓸 때: 10 × (20 + 40 + 3) = 630 ms
      </>
    }
  />
)

// ---------- training and π0-FAST ----------

function Training() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={860} h={420} at={0.3} title={<Head color={C.accent}>pretraining</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 0.6) }}>PaliGemma weight 에서 출발하고, PaliGemma 도 함께 고친다</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 2) }}>
            직접 모은 로봇 시연 <span style={mono(C.accent, 24)}>약 10,000 시간</span> · 로봇 구성 7 가지 · 작업 68 가지
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 4.2) }}>학습 예시 하나 = 관측 하나 + 그 뒤 chunk 하나 → 데이터를 step 수로 센다</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 6.6) }}>
            <span style={mono(C.text, 24)}>9 억 300 만 step</span> = 팔 하나 1 억 600 만 + 두 팔 7 억 9,700 만
          </span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 9) }}>
            공개 데이터 (Open X-Embodiment · DROID · Bridge, 대개 2 ~ 10 Hz): 학습 예시의 <span style={mono(C.orange, 24)}>9.1%</span>
          </span>
        </div>
      </Box>
      <Box x={64} y={570} w={860} h={310} at={12.4} title={<Head color={C.purple}>예시 수 n 대신 n 의 0.43 제곱에 비례하게 뽑는다</Head>}>
        <Bar label="예시 수" value={100} max={100} color={C.muted} at={13} width={420} labelW={200} fmt="100" unit=" 배" />
        <Bar label="뽑히는 횟수" value={7.3} max={100} color={C.purple} at={14.4} width={420} labelW={200} fmt="약 7.3" unit=" 배" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.6) }}>100 의 0.43 제곱 ≈ 7.3 · 많이 모은 작업 (빨래 개기 등) 이 학습을 채우지 않게 한다</span>
      </Box>
      <Box x={960} y={130} w={896} h={330} at={18.6} title={<Head color={C.green}>fine-tuning (논문은 post-training 이라고도 부른다)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 18.9) }}>작업 하나의 질 좋은 데이터로 조금 더 학습한다</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 19.8) }}>
            가장 단순한 작업 <span style={mono(C.green, 24)}>5 시간</span> · 가장 복잡한 작업 <span style={mono(C.green, 24)}>100 시간 이상</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.6) }}>질 좋은 데이터만 쓰면 실수에서 회복하는 법을 못 배운다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.4) }}>거친 pretraining 데이터만 쓰면 작업을 매끄럽고 빠르게 하지 못한다</span>
        </div>
      </Box>
      <Box x={960} y={480} w={896} h={400} at={24.4} title={<Head color={C.orange}>실험 결과 (작업마다 10 번, 일부 성공은 해낸 비율만큼)</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 24.8) }}>
            pretraining 만 (5 가지 작업): 셔츠 개기 · 쉬운 식탁 정리가 거의 완벽했고, 16 만 step 만 학습한 π0 도 비교 모델보다 높았다
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 25.6) }}>새 작업 fine-tuning: pretraining 한 π0 가 처음부터 학습한 π0 보다 많게는 2 배 높았다</span>
          <span style={{ ...line(C.green, 24), fontWeight: 600, opacity: prog(t, 26.4) }}>
            긴 작업 7 가지 (한 번에 5 ~ 20 분): 두 단계를 거친 π0 가 모든 작업에서 최고 점수의 50% 넘게 받았다
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Fast() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={876} h={380} at={0.3} color={`${C.green}88`} title={<Head color={C.green} size={32}>π0</Head>}>
        <span style={line(C.text, 24)}>만드는 부분: action expert (약 3 억)</span>
        <span style={line(C.text, 24)}>flow matching 10 step 으로 50 개를 한꺼번에</span>
        <Bar label="1 초 chunk 추론" value={73} max={750} color={C.green} at={14} width={360} labelW={210} fmt="73" unit=" ms" />
        <Bar label="학습 GPU 시간" value={1} max={1} color={C.green} at={16} width={360} labelW={210} fmt="1" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>KV cache 로 VLM 쪽은 chunk 하나에 한 번만 계산</span>
      </Box>
      <Box x={980} y={130} w={876} h={380} at={0.9} color={`${C.orange}88`} title={<Head color={C.orange} size={32}>π0-FAST</Head>}>
        <span style={line(C.text, 24)}>만드는 부분: PaliGemma 의 언어 모델 (약 20 억)</span>
        <span style={line(C.text, 24)}>FAST token 30 ~ 60 개를 하나씩</span>
        <Bar label="1 초 chunk 추론" value={750} max={750} color={C.orange} at={14.6} width={360} labelW={210} fmt="약 750" unit=" ms" />
        <Bar label="학습 GPU 시간" value={0.2} max={1} color={C.orange} at={16.4} width={360} labelW={210} fmt="약 5 분의 1" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18) }}>750 ÷ 73 ≈ 10 배 · token 마다 언어 모델 전체를 거친다</span>
      </Box>
      <Box x={64} y={530} w={1792} h={176} at={7} title={<Head color={C.accent}>1 초 분량 chunk 의 token 수 (50 Hz 두 팔 로봇, 숫자 14 개)</Head>}>
        <Bar label="값마다 token 하나" value={700} max={700} color={C.muted} at={7.4} width={900} labelW={360} fmt="50 × 14 = 700" unit=" 개" />
        <Bar label="FAST (DCT → 반올림 → BPE)" value={53} max={700} color={C.orange} at={9.4} width={900} labelW={360} fmt="평균 53" unit=" 개" />
      </Box>
      <Box x={64} y={724} w={1792} h={156} at={20.8} title={<Head color={C.purple}>π0.5 (2025): 두 방식을 단계별로 나눠 쓴다</Head>}>
        <Flow steps={['pretraining: action 을 FAST token 으로', 'post-training: action expert 를 더한다', '실행: 다음 작은 작업을 글로 → flow matching 으로 chunk']} color={C.purple} at={21.2} gap={1.2} />
      </Box>
    </AbsoluteFill>
  )
}

const PauseFast = () => (
  <PauseWrite
    question="π0-FAST 의 추론이 750 ms 걸린다. 50 Hz 로봇이 그동안 지나가는 step 은 몇 개이고, 새 chunk 50 개 가운데 앞쪽 몇 개가 이미 지난 시점의 몫일까?"
    answer={
      <>
        750 ÷ 20 = 37.5 step 지남 → 앞쪽 약 38 개는 지난 몫
        <br />
        쓸 수 있는 것은 뒤쪽 12 개 남짓 · π0 는 4 개만 버린다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.blue, text: 'PaliGemma 약 30 억 + action expert 약 3 억 · attention 에서만 만난다', at: 0.6 },
    { tag: script.sections[1], color: C.green, text: 'noise 에서 δ = 0.1 의 Euler 10 step → action 50 개 (50 Hz 로 1 초 분량)', at: 4.4 },
    { tag: script.sections[2], color: C.accent, text: '14 + 32 + 27 = 73 ms (cache 없이 487 ms) · 25 개 실행마다 비동기로 다시 추론', at: 8.4 },
    { tag: script.sections[3], color: C.orange, text: '약 10,000 시간 pretraining + fine-tuning · π0-FAST 는 학습 5 분의 1, 추론 약 750 ms', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            VLM 의 지식을 쓰면서 1 초에 50 개씩 필요한 관절 목표를 제때 만들 수 있을까?
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
          <div style={{ fontFamily: MONO, fontSize: 80, fontWeight: 600 }}>GR00T N1 · VLA + RL</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={30}>
            VLM 과 action network 를 따로 두는 GR00T N1 · reward 로 π0 를 더 학습하는 VLA + RL
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/pi0 (π0 · FAST · π0.5 · real-time chunking 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Pi0() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        architecture: Architecture,
        mask: Mask,
        'pause-weights': PauseWeights,
        chunk: Chunk,
        euler: Euler,
        'pause-flow': PauseFlow,
        'kv-cache': KvCache,
        async: Async,
        'pause-kv': PauseKv,
        training: Training,
        fast: Fast,
        'pause-fast': PauseFast,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
