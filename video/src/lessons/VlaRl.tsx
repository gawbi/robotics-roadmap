import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './vla-rl.narration.json'
import { script } from './vla-rl.script'

// Numbers follow lessons/vla-rl/README.md (see vla-rl.script.ts). The chunk strips, the cup demos and the loop diagram are
// schematic (marked 모식도 / 예); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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

/** before → after on one track: the grey part is where it started, the coloured part where RL took it */
function Lift({ label, from, to, max = 100, color, at, fmt }: { label: ReactNode; from: number; to: number; max?: number; color: string; at: number; fmt: string }) {
  const t = useSec()
  const p = prog(t, at + 0.4, 0.9)
  const W = 520
  return (
    <div style={{ display: 'grid', gap: 8, opacity: prog(t, at, 0.4) }}>
      <span style={{ fontSize: 22, color: C.muted }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: W, height: 28, borderRadius: 8, background: C.grid }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: (W * (from + (to - from) * p)) / max, borderRadius: 8, background: color, opacity: 0.85 }} />
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: (W * from) / max, borderRadius: 8, background: C.dim }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap' }}>{fmt}</span>
      </div>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

/** a plain table: every column sans and left-aligned, numbers in the cells set in MONO by the caller */
function Rows({ head, rows, widths, at, step = 0.5, size = 22, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontSize: size, whiteSpace: 'nowrap', lineHeight: 1.45 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), color: C.muted, fontSize: size - 1 }}>
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
            FRONTIER · RL FINE-TUNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>VLA + RL</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontSize: 36, color: C.muted }}>
            시연으로 배운 VLA 를 <span style={{ color: C.accent }}>성공 여부 reward</span> 로 더 학습하기
          </div>
        </Appear>
        <Appear at={1.4}>
          <Label color={C.muted} size={30}>
            π*0.6 (RECAP): 가장 어려운 작업 몇 가지에서 시간당 작업 수 두 배 넘게 · 실패율 대략 절반 · 에스프레소 13 시간
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
  const items: [string, number][] = [
    ['컵을 놓치면 바로잡지 못하고 하던 동작을 이어 가다 실패한다', 0.9],
    ['RL4VLA: 시연으로만 배운 OpenVLA 가 어긋난 채 동작을 계속했다', 1.8],
    ['시연을 더 모아도 성공률은 어느 선에서 잘 오르지 않는다', 2.7],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <svg width={800} height={300} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={40} y={50} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
            시연으로 SFT 한 VLA 의 episode (모식도)
          </text>
          {Array.from({ length: 10 }, (_, i) => {
            const slip = i === 4
            const after = i > 4
            const fill = after ? `${C.red}55` : slip ? `${C.pink}55` : `${C.blue}44`
            const stroke = after ? C.red : slip ? C.pink : C.blue
            return <rect key={i} x={40 + i * 66} y={86} width={56} height={56} rx={8} fill={fill} stroke={stroke} strokeWidth={2} opacity={prog(t, 0.5 + i * 0.12)} />
          })}
          <g opacity={prog(t, 1.4)}>
            <text x={332} y={182} textAnchor="middle" fill={C.pink} fontSize={22} fontWeight={600}>
              컵을 놓침
            </text>
            <text x={40} y={232} fill={C.red} fontSize={22}>
              바로잡지 못하고 하던 동작을 그대로 이어 가다 실패
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 860, top: 34, width: 900, display: 'grid', gap: 22 }}>
          <Label size={24} color={C.muted}>
            시연만으로 fine-tuning 한 VLA 에서 보이는 것
          </Label>
          {items.map(([s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color: C.red, fontSize: 28, fontWeight: 700 }}>✕</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 478, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          정답 action 없이, <span style={{ color: C.accent }}>직접 해 본 성공과 실패만으로 더 나아질 수 있을까?</span>
        </div>
      </Appear>
      <Card x={330} y={650} w={1260} h={200} at={5.6}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            RL fine-tuning: 시연으로 SFT 한 VLA 를 출발점으로
          </Label>
          <Flow steps={['작업을 여러 번 시도', '성공 1 · 실패 0 을 reward 로', 'reward 가 큰 행동을 더 자주']} color={C.green} at={5.9} gap={0.4} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. the ceiling demos set ----------

function Ceiling() {
  const t = useSec()
  const cell = 54
  const gx = 140
  const gy = 86
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <svg width={820} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            시연 100 개 (예)
          </text>
          <text x={790} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            컵을 집어 상자에 넣기
          </text>
          {Array.from({ length: 100 }, (_, i) => {
            const r = Math.floor(i / 10)
            const c = i % 10
            const centre = r < 7
            return <circle key={i} cx={gx + c * cell + cell / 2} cy={gy + r * cell + cell / 2} r={19} fill={centre ? `${C.blue}cc` : `${C.orange}cc`} opacity={prog(t, 0.5 + i * 0.025, 0.3)} />
          })}
          <g opacity={prog(t, 3.2)}>
            <circle cx={60} cy={680} r={12} fill={C.blue} />
            <text x={84} y={688} fill={C.blue} fontSize={24} fontWeight={600}>
              가운데 잡기 70 개 · 성공률 95%
            </text>
            <circle cx={60} cy={718} r={12} fill={C.orange} />
            <text x={84} y={726} fill={C.orange} fontSize={24} fontWeight={600}>
              가장자리 잡기 30 개 · 성공률 50%
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={916} y={140} w={940} h={214} at={7} title={<Head color={C.accent}>SFT 한 policy 의 성공률</Head>}>
        <span style={{ ...mono(C.text, 30), opacity: prog(t, 7.4) }}>0.7 × 0.95 + 0.3 × 0.5</span>
        <span style={{ ...mono(C.accent, 30), opacity: prog(t, 9.5) }}>= 0.665 + 0.15 = 0.815</span>
      </Box>
      <Box x={916} y={374} w={940} h={270} at={14} title={<Head>늘 가운데만 잡는 policy 와 비교</Head>}>
        <Bar label="늘 가운데만 잡기" value={95} max={100} color={C.green} at={14.4} width={460} unit="%" labelW={230} />
        <Bar label="시연을 따라 함" value={81.5} max={100} color={C.blue} at={15} width={460} unit="%" labelW={230} />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 16.5) }}>
          <span style={mono(C.orange, 24)}>95 − 81.5 = 13.5%p</span> 낮다 · 가장자리 시연 30 개도 똑같이 정답으로 쓰인다
        </span>
      </Box>
      <Box x={916} y={664} w={940} h={216} at={21} color={`${C.red}66`} title={<Head color={C.red}>오해: 시연을 더 모으면 policy 가 나아진다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.4) }}>
          같은 습관으로 1000 개를 더 모아도 비율은 70 : 30 이라 성공률은 <span style={mono(C.orange, 23)}>81.5%</span> 그대로다. 시연이 늘면 시연을 더 정확히 따라 할 뿐이다.
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function ChunkRow({ t, y, at, slip, recovers, label, result, resultAt, color }: { t: number; y: number; at: number; slip: number; recovers: boolean; label: string; result: string; resultAt: number; color: string }) {
  return (
    <g>
      <text x={40} y={y - 18} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        {label}
      </text>
      {Array.from({ length: 20 }, (_, i) => {
        const isSlip = i === slip
        const failed = !recovers && i > slip
        const fill = failed ? `${C.red}44` : isSlip ? (recovers ? `${C.green}55` : `${C.pink}66`) : `${C.blue}44`
        const stroke = failed ? C.red : isSlip ? C.pink : C.blue
        return <rect key={i} x={40 + i * 70} y={y} width={56} height={56} rx={8} fill={fill} stroke={stroke} strokeWidth={isSlip ? 4 : 2} opacity={prog(t, at + 0.2 + i * 0.08, 0.3)} />
      })}
      <text x={1470} y={y + 38} fill={color} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={prog(t, resultAt)}>
        성공률 {result}
      </text>
    </g>
  )
}

function Recovery() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={1792} height={330}>
          <ChunkRow t={t} y={64} at={0.3} slip={7} recovers={false} label="회복을 모르는 policy · chunk 20 개 (예)" result="0.668" resultAt={8} color={C.red} />
          <text x={530} y={156} fill={C.pink} fontSize={21} opacity={prog(t, 2.6)}>
            chunk 7 에서 미끄러진 뒤 끝까지 실패
          </text>
          <ChunkRow t={t} y={214} at={14} slip={7} recovers label="미끄러짐의 80% 를 되돌리는 policy" result="0.923" resultAt={17} color={C.green} />
          <text x={530} y={304} fill={C.green} fontSize={21} opacity={prog(t, 16)}>
            chunk 7 에서 미끄러져도 다시 잡음 · chunk 하나의 실패 확률 0.4%
          </text>
        </svg>
      </Panel>
      <Box x={64} y={494} w={880} h={386} at={7} title={<Head color={C.accent}>chunk 수에 따른 성공률</Head>}>
        <Rows
          head={['episode 의 chunk 수', '회복을 모를 때', '80% 를 되돌릴 때']}
          widths={[300, 250, 270]}
          rows={[
            ['10', <span style={mono(C.text, 24)}>0.817</span>, <span style={mono(C.text, 24)}>0.961</span>],
            ['20', <span style={mono(C.red, 24)}>0.668</span>, <span style={mono(C.green, 24)}>0.923</span>],
            ['40', <span style={mono(C.text, 24)}>0.446</span>, <span style={mono(C.text, 24)}>0.852</span>],
          ]}
          at={8.5}
          size={24}
        />
        <span style={{ ...mono(C.muted, 24), opacity: prog(t, 7.4) }}>chunk 하나를 넘길 확률: 1 − 0.02 = 0.98</span>
        <span style={{ ...mono(C.green, 24), opacity: prog(t, 15) }}>80% 회복: 0.02 × 0.2 = 0.004 → 0.996</span>
      </Box>
      <Box x={976} y={494} w={880} h={386} at={21} title={<Head color={C.orange}>회복 동작은 시연에 거의 없다</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 21.3) }}>시연하는 사람은 실수를 피하려 애쓰고, 실수한 시연은 지우는 경우가 많다</span>
        <span style={{ ...mono(C.orange, 52), opacity: prog(t, 23) }}>3.68%</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 23.4) }}>RaC 저자들: DROID dataset 의 1% 표본에서 회복 동작이 든 episode 의 비율</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 2. reward and advantage ----------

function LoopBox({ x, y, top, main, color, op }: { x: number; y: number; top?: string; main: string; color: string; op: number }) {
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={300} height={84} rx={14} fill={`${color}18`} stroke={color} strokeWidth={2} />
      {top ? (
        <>
          <text x={x + 150} y={y + 32} textAnchor="middle" fill={C.muted} fontSize={20}>
            {top}
          </text>
          <text x={x + 150} y={y + 64} textAnchor="middle" fill={C.text} fontSize={25} fontWeight={600}>
            {main}
          </text>
        </>
      ) : (
        <text x={x + 150} y={y + 51} textAnchor="middle" fill={C.text} fontSize={25} fontWeight={600}>
          {main}
        </text>
      )}
    </g>
  )
}

function Strip({ t, at, rate, wins, text, color }: { t: number; at: number; rate: string; wins: number; text: ReactNode; color: string }) {
  return (
    <div style={{ display: 'grid', gap: 8, opacity: prog(t, at) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ ...mono(color, 24), width: 170 }}>성공률 {rate}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 5, background: i < wins ? C.green : C.grid, border: `1px solid ${i < wins ? C.green : C.cardEdge}` }} />
          ))}
        </div>
      </div>
      <span style={{ ...line(C.muted, 22), paddingLeft: 186 }}>{text}</span>
    </div>
  )
}

function RlLoop() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            SFT 다음의 RL fine-tuning
          </text>
          <LoopBox x={40} y={80} main="시연으로 SFT" color={C.dim} op={prog(t, 0.4)} />
          <text x={370} y={130} fill={C.muted} fontSize={21} opacity={prog(t, 0.6)}>
            π0 까지 다룬 출발점
          </text>
          {arrow(190, 166, 190, 248, C.muted, 3, 11, prog(t, 0.8))}
          <LoopBox x={40} y={250} main="VLA (policy)" color={C.accent} op={prog(t, 1)} />
          {arrow(342, 292, 498, 292, C.blue, 3, 11, prog(t, 1.6))}
          <LoopBox x={500} y={250} main="rollout 모으기" color={C.blue} op={prog(t, 1.8)} />
          {arrow(650, 336, 650, 428, C.blue, 3, 11, prog(t, 2.4))}
          <LoopBox x={500} y={430} top="reward" main="성공 1 · 실패 0" color={C.green} op={prog(t, 2.6)} />
          {arrow(498, 472, 342, 472, C.blue, 3, 11, prog(t, 3.2))}
          <LoopBox x={40} y={430} main="VLA 고치기" color={C.orange} op={prog(t, 3.4)} />
          {arrow(190, 428, 190, 336, C.blue, 3, 11, prog(t, 4))}
          <text x={420} y={390} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 4.2)}>
            되풀이
          </text>
          <g opacity={prog(t, 6.6)}>
            <text x={40} y={588} fill={C.text} fontSize={23} fontWeight={600}>
              sparse reward: episode 끝에만 1
            </text>
            {Array.from({ length: 20 }, (_, i) => (
              <rect key={i} x={40 + i * 38} y={606} width={30} height={30} rx={5} fill={i === 19 ? C.green : C.grid} stroke={i === 19 ? C.green : C.cardEdge} strokeWidth={1.5} />
            ))}
            <text x={40} y={672} fill={C.muted} fontSize={21}>
              chunk 20 개 동안 reward 0 · 성공하면 마지막에 1
            </text>
            <text x={40} y={712} fill={C.dim} fontSize={21}>
              environment 는 가상 환경일 수도 있고 실물 로봇일 수도 있다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={740} at={12.5} gap={18} title={<Head color={C.accent}>episode 20 개 batch 의 advantage = reward − baseline</Head>}>
        <Strip
          t={t}
          at={12.8}
          rate="30%"
          wins={6}
          color={C.accent}
          text={
            <>
              baseline <span style={mono(C.text, 22)}>6 ÷ 20 = 0.3</span> · 성공 <span style={mono(C.green, 22)}>+0.7</span> · 실패 <span style={mono(C.red, 22)}>−0.3</span>
            </>
          }
        />
        <Strip t={t} at={18.7} rate="0%" wins={0} color={C.dim} text="advantage 가 모두 0 · 배울 것이 없다" />
        <Strip
          t={t}
          at={19.6}
          rate="5%"
          wins={1}
          color={C.orange}
          text={
            <>
              성공 1 개만 <span style={mono(C.green, 22)}>+0.95</span> · 단서가 episode 하나에 몰린다
            </>
          }
        />
        <Strip
          t={t}
          at={20.5}
          rate="95%"
          wins={19}
          color={C.orange}
          text={
            <>
              실패 1 개만 <span style={mono(C.red, 22)}>−0.95</span> · 우연이었는지 가리기 어렵다
            </>
          }
        />
        <div style={{ display: 'grid', gap: 12, paddingTop: 8, borderTop: `1.5px solid ${C.cardEdge}`, opacity: prog(t, 22.2) }}>
          <span style={line(C.text, 22)}>SimpleVLA-RL: 같은 시작 상황의 rollout 묶음이 모두 성공했거나 모두 실패하면 버리고, 섞인 묶음만으로 batch 를 채웠다</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 24.8) }}>
            πRL: LIBERO 작업 40 개가 모두 0 보다 큰 성공률에서 출발하려면 SFT 시연이 최소 <span style={mono(C.accent, 22)}>40</span> 개
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function RewardSource() {
  const t = useSec()
  const hackW = 560
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1020} h={300} at={0.3} title={<Head color={C.accent}>reward 의 출처</Head>}>
        <Rows
          head={['출처', '예', '한계']}
          widths={[270, 410, 280]}
          rows={[
            ['판정 프로그램', 'LIBERO · ManiSkill 의 성공 조건', '실물 로봇에는 없다'],
            ['reward classifier', 'HIL-SERL: 이미지로 성공을 맞힘', '틀리면 틀린 쪽으로 배운다'],
            ['사람의 판정', 'π*0.6: episode 마다 표시', '사람 손이 든다'],
            ['process reward model', 'VLA-RL: 중간 진행에 점수', '점수가 틀릴 수 있다'],
          ]}
          at={0.6}
          step={0.6}
        />
      </Box>
      <Box x={64} y={460} w={1020} h={420} at={7.5} title={<Head color={C.blue}>HIL-SERL 의 reward classifier</Head>}>
        <Flow steps={['성공 장면 200 개', '실패 장면 1000 개', 'classifier 학습']} color={C.blue} at={7.8} gap={0.5} />
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 9.4) }}>작업마다 로봇을 조종해 모은다 (5 분쯤 걸린다)</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 10.6) }}>
          카메라 이미지로 성공 여부를 맞히는 정확도: 대개 <span style={mono(C.green, 26)}>95%</span> 초과
        </span>
        <span style={{ ...line(C.red, 23), opacity: prog(t, 12.4) }}>컵을 상자 가장자리에 걸쳐 놓은 장면을 성공으로 잘못 판정하면, 그 행동도 reward 1 을 받아 확률이 올라간다</span>
      </Box>
      <Box x={1116} y={140} w={740} h={740} at={15} gap={16} title={<Head color={C.orange} size={26}>가상의 설계: 쥐고 있는 chunk 마다 0.1, 놓으면 1</Head>}>
        {[
          { label: 'chunk 1 에서 잡고 chunk 3 에 놓음', calc: '3 × 0.1 + 1 = 1.3', v: 1.3, color: C.green, at: 15.6 },
          { label: 'chunk 1 에서 잡고 끝까지 쥐고 있음', calc: '19 × 0.1 + 0 = 1.9', v: 1.9, color: C.red, at: 17.6 },
        ].map((o) => (
          <div key={o.label} style={{ display: 'grid', gap: 8, opacity: prog(t, o.at) }}>
            <span style={line(C.text, 23)}>{o.label}</span>
            <span style={mono(o.color, 26)}>{o.calc}</span>
            <div style={{ width: hackW, height: 28, borderRadius: 8, background: C.grid }}>
              <div style={{ width: (hackW * o.v * prog(t, o.at + 0.3, 0.9)) / 2, height: '100%', borderRadius: 8, background: o.color }} />
            </div>
          </div>
        ))}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 19.5) }}>놓지 않고 쥐고만 있는 policy 가 더 큰 reward 를 받으므로 RL 은 이 행동의 확률을 올린다</span>
        <div style={{ display: 'grid', gap: 10, paddingTop: 10, borderTop: `1.5px solid ${C.cardEdge}`, opacity: prog(t, 22.6) }}>
          <Head color={C.red} size={26}>
            reward hacking
          </Head>
          <span style={line(C.text, 23)}>설계한 사람의 의도와 달리 reward 숫자만 키우는 행동을 찾아낸다</span>
          <span style={{ ...line(C.green, 23), opacity: prog(t, 25.5) }}>중간 점수는 작게 주거나 한 번만 주고, 최종 성공의 reward 가 늘 가장 크게 남도록 설계한다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. token and flow probabilities ----------

function TokenRatio() {
  const t = useSec()
  const cols = [230, 380, 530]
  const rowsY = [120, 210, 300]
  const rows = [
    { label: '옛 policy', vals: ['0.5', '0.8', '0.25'], prod: '0.1', color: C.dim, at: 6.6 },
    { label: '새 policy', vals: ['0.6', '0.8', '0.25'], prod: '0.12', color: C.blue, at: 9 },
    { label: '자리별 ratio', vals: ['1.2', '1', '1'], prod: '1.2', color: C.accent, at: 12.6 },
  ]
  const X = (r: number) => 40 + ((r - 0.6) / 1.0) * 760
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={420} at={6.5}>
        <svg width={900} height={420}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 6.5)}>
            action token 세 자리의 확률 (예)
          </text>
          <g opacity={prog(t, 6.5)}>
            {['관절 1', '관절 2', '관절 3'].map((s, i) => (
              <text key={s} x={cols[i] + 60} y={100} textAnchor="middle" fill={C.muted} fontSize={21}>
                {s}
              </text>
            ))}
            <text x={770} y={100} textAnchor="middle" fill={C.muted} fontSize={21}>
              action 전체
            </text>
          </g>
          {rows.map((r, k) => (
            <g key={r.label} opacity={prog(t, r.at)}>
              <text x={30} y={rowsY[k] + 38} fill={r.color} fontSize={23} fontWeight={600}>
                {r.label}
              </text>
              {r.vals.map((v, i) => {
                const hot = k === 1 && i === 0
                return (
                  <g key={i}>
                    <rect x={cols[i]} y={rowsY[k]} width={120} height={60} rx={10} fill={hot ? `${C.blue}33` : C.bg} stroke={hot ? C.blue : C.cardEdge} strokeWidth={hot ? 3 : 1.5} />
                    <text x={cols[i] + 60} y={rowsY[k] + 40} textAnchor="middle" fill={C.text} fontSize={28} fontFamily={MONO} fontWeight={600}>
                      {v}
                    </text>
                  </g>
                )
              })}
              <rect x={690} y={rowsY[k]} width={160} height={60} rx={10} fill={`${r.color}22`} stroke={r.color} strokeWidth={2} />
              <text x={770} y={rowsY[k] + 40} textAnchor="middle" fill={r.color} fontSize={28} fontFamily={MONO} fontWeight={600}>
                {r.prod}
              </text>
            </g>
          ))}
          <text x={30} y={402} fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 10.5)}>
            0.5 × 0.8 × 0.25 = 0.1 → 0.6 × 0.8 × 0.25 = 0.12
          </text>
        </svg>
      </Card>
      <Box x={64} y={580} w={900} h={300} at={0.3} title={<Head color={C.accent}>PPO 의 probability ratio</Head>}>
        <span style={mono(C.text, 25)}>ratio = 새 policy 의 확률 ÷ 옛 policy 의 확률</span>
        <svg width={844} height={110} style={{ opacity: prog(t, 12.8) }}>
          <line x1={40} y1={56} x2={800} y2={56} stroke={C.muted} strokeWidth={2} />
          <rect x={X(0.8)} y={42} width={X(1.2) - X(0.8)} height={28} rx={6} fill={`${C.green}33`} stroke={C.green} strokeWidth={2} />
          {[0.8, 1.0, 1.2].map((v) => (
            <text key={v} x={X(v)} y={100} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
              {v.toFixed(1)}
            </text>
          ))}
          <text x={X(0.8)} y={26} fill={C.green} fontSize={21}>
            clip 범위 (ε = 0.2)
          </text>
          <polygon points={`${X(1.2)},40 ${X(1.2) - 9},24 ${X(1.2) + 9},24`} fill={C.accent} />
          <text x={X(1.2) + 18} y={30} fill={C.accent} fontSize={21} fontFamily={MONO} fontWeight={600}>
            ratio 1.2
          </text>
          <text x={X(1.2) + 70} y={100} fill={C.muted} fontSize={20}>
            밖으로는 더 고치지 않음
          </text>
        </svg>
      </Box>
      <Box x={996} y={140} w={860} h={360} at={18.5} title={<Head color={C.green}>GRPO: critic 없이 group 평균이 baseline</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.8) }}>언어 모델 학습에 쓰던 방법 · 같은 시작 상황에서 모은 episode 묶음(group)</span>
        <div style={{ display: 'flex', gap: 12, opacity: prog(t, 19.2) }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ width: 60, height: 60, borderRadius: 10, background: i < 3 ? `${C.green}55` : C.grid, border: `1.5px solid ${i < 3 ? C.green : C.cardEdge}`, display: 'grid', placeItems: 'center' }}>
              <span style={mono(i < 3 ? C.green : C.dim, 24)}>{i < 3 ? '1' : '0'}</span>
            </div>
          ))}
        </div>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.2) }}>group 평균 = 3 ÷ 8 = 0.375</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 21.4) }}>
          성공: <span style={{ color: C.green }}>1 − 0.375 = +0.625</span> · 실패: <span style={{ color: C.red }}>0 − 0.375 = −0.375</span>
        </span>
      </Box>
      <Box x={996} y={520} w={860} h={360} at={24.5} title={<Head>token VLA 의 RL 결과</Head>}>
        <Lift label="VLA-RL · OpenVLA-7B + PPO · LIBERO 작업 40 개 평균" from={76.5} to={81.0} color={C.blue} at={24.8} fmt="76.5% → 81.0%" />
        <Lift label="RL4VLA · 처음 보는 물체 (SFT 대비 PPO)" from={45.3} to={71.4} color={C.purple} at={25.3} fmt="0.453 → 0.714" />
        <Lift label="SimpleVLA-RL · 시연 1 개 SFT + GRPO · LIBERO-Long" from={17.3} to={91.7} color={C.green} at={25.8} fmt="17.3% → 91.7%" />
      </Box>
    </AbsoluteFill>
  )
}

function FlowFour() {
  const t = useSec()
  const methods = [
    {
      n: '①',
      name: 'step 마다 noise 넣기 · DPPO · ReinFlow · πRL',
      body: '경로의 확률 밀도 = step 마다 높이의 곱 · πRL: π0 LIBERO 평균 57.6% → 97.6%, π0.5 77.1% → 98.3%',
      color: C.blue,
      at: 13.2,
    },
    { n: '②', name: 'filtered BC · 성공한 episode 만 다시 SFT', body: '컵 예: 가운데 비율 0.7 → 0.816, 성공률 81.5% → 86.7% · 실패한 episode 와 그 정보는 버린다', color: C.green, at: 19.6 },
    { n: '③', name: '출발 noise 고르기 · DSRL', body: 'VLA 는 그대로 두고 작은 noise policy 만 RL · LIBERO 작업 하나에서 약 1 만 step 으로 약 20% → 약 100%', color: C.purple, at: 22.4 },
    { n: '④', name: 'advantage 조건 · π*0.6 의 RECAP', body: 'value 0.815 기준 · 가운데 0.95 − 0.815 = +0.135 → positive · 가장자리 0.5 − 0.815 = −0.315 → negative', color: C.orange, at: 25.6 },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <svg width={820} height={290}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            flow matching VLA (π0) 의 chunk
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={30} y={98} width={150} height={80} rx={12} fill={`${C.purple}22`} stroke={C.purple} strokeWidth={2} />
            <text x={105} y={147} textAnchor="middle" fill={C.purple} fontSize={26} fontFamily={MONO} fontWeight={600}>
              noise
            </text>
            <text x={30} y={210} fill={C.muted} fontSize={20}>
              Gaussian 에서 뽑은 숫자
            </text>
          </g>
          {arrow(182, 138, 226, 138, C.muted, 3, 10, prog(t, 1))}
          <text x={389} y={92} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600} opacity={prog(t, 1.2)}>
            Euler step 10 번
          </text>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={240 + i * 33} cy={138} r={9} fill={C.blue} opacity={prog(t, 1.3 + i * 0.15, 0.3)} />
          ))}
          {arrow(552, 138, 596, 138, C.muted, 3, 10, prog(t, 3))}
          <g opacity={prog(t, 3.2)}>
            <rect x={600} y={98} width={190} height={80} rx={12} fill={`${C.accent}18`} stroke={C.accent} strokeWidth={2} />
            <text x={695} y={132} textAnchor="middle" fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
              chunk
            </text>
            <text x={695} y={162} textAnchor="middle" fill={C.muted} fontSize={20}>
              action 50 개
            </text>
          </g>
          <text x={30} y={262} fill={C.text} fontSize={23} opacity={prog(t, 4.2)}>
            처음 noise 만 무작위 · 같은 관측 + 같은 noise → 늘 같은 chunk
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 312, width: 760, display: 'grid', gap: 14, opacity: prog(t, 6.6) }}>
          <Head color={C.red}>chunk 의 확률 밀도에 필요한 것</Head>
          <span style={mono(C.text, 26)}>숫자: 50 × 7 = 350 개</span>
          <span style={{ ...mono(C.red, 26), opacity: prog(t, 8.4) }}>변화 비율: 350 × 350 = 122,500 개</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 10) }}>속도가 자리마다 달라서, Euler step 10 번마다 따로 계산해야 한다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.3) }}>πRL · π*0.6 저자들: flow matching VLA 의 action log-likelihood 는 다루기 어렵다 (intractable)</span>
        </div>
      </Panel>
      {methods.map((m, i) => (
        <Box key={m.n} x={916} y={140 + i * 190} w={940} h={170} at={m.at} gap={10} color={`${m.color}88`}>
          <span style={{ fontSize: 26, fontWeight: 600, color: m.color, lineHeight: 1.45 }}>
            {m.n} {m.name}
          </span>
          <span style={line(C.text, 22)}>{m.body}</span>
        </Box>
      ))}
    </AbsoluteFill>
  )
}

// ---------- 4. off-policy and the real robot ----------

function OnOff() {
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={360} at={0.3} color={`${C.blue}88`} title={<Head color={C.blue}>on-policy · PPO · GRPO</Head>}>
        <Flow steps={['지금 policy', 'rollout', 'update', '버리고 다시 모음']} color={C.blue} at={0.8} gap={0.6} />
        <span style={line(C.text, 23)}>ratio 가 옛 policy 와 새 policy 의 차이를 재는 장치라서, policy 가 많이 바뀐 뒤의 데이터는 쓸 수 없다</span>
        <span style={line(C.muted, 22)}>시도가 싼 simulation 에서 쓴다 · SimpleVLA-RL · πRL</span>
      </Box>
      <Box x={976} y={140} w={880} h={360} at={7.5} color={`${C.green}88`} title={<Head color={C.green}>off-policy · SAC · RLPD</Head>}>
        <Flow steps={['시연 · 개입 · rollout', 'replay buffer', '되풀이해 꺼내 씀']} color={C.green} at={8} gap={0.6} />
        <span style={line(C.muted, 22)}>시도가 비싼 실물 로봇에서 쓴다 · DSRL · HIL-SERL</span>
        <span style={line(C.text, 23)}>π*0.6 의 반복 offline RL: 모으는 동안은 학습하지 않고, 다 모으면 지금까지의 데이터 전체로 critic 과 policy 를 다시 학습</span>
      </Box>
      <TimeCard />
    </AbsoluteFill>
  )
}

function TimeCard() {
  const t = useSec()
  return (
    <Card x={64} y={520} w={1792} h={360} at={15}>
      <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
        <Head>episode 1000 개를 모으는 시간 (예)</Head>
        <Bar label="실물 로봇 한 대" value={30000} max={30000} color={C.red} at={15.4} width={880} fmt="30,000 초 ≈ 8.3 시간" labelW={380} />
        <Bar label="simulation · environment 64 개" value={160} max={30000} color={C.green} at={16.6} width={880} fmt="160 초" labelW={380} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.8) }}>
          실물: 1000 × (10 초 episode + 사람이 컵을 되돌려 놓는 reset 20 초) · simulation: 16 번 × 10 초 = 160 초
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22.6) }}>
          SimpleVLA-RL: simulation 데이터로만 SFT 와 RL 을 한 뒤 Piper 팔 두 대에 올려, 작업 네 개 평균 <span style={mono(C.orange, 23)}>17.5% → 38.5%</span> · 성공률 자체는 여전히 낮다
        </span>
      </div>
    </Card>
  )
}

function Intervention() {
  const t = useSec()
  const x0 = 76
  const step = 82
  const cx = (a: number, b: number) => (x0 + a * step + x0 + b * step + 70) / 2
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <svg width={1792} height={300}>
          <text x={40} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            사람이 개입한 episode (예) · chunk 20 개
          </text>
          {Array.from({ length: 20 }, (_, i) => {
            const human = i >= 12 && i <= 14
            const lit = human ? prog(t, 2.2) : 0
            const color = human && lit > 0.5 ? C.orange : C.blue
            return (
              <g key={i} opacity={prog(t, 0.4 + i * 0.06, 0.3)}>
                <rect x={x0 + i * step} y={112} width={70} height={70} rx={10} fill={`${color}33`} stroke={color} strokeWidth={human ? 3 : 2} />
                <text x={x0 + i * step + 35} y={155} textAnchor="middle" fill={C.text} fontSize={21} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 2.4)}>
            <text x={cx(0, 11)} y={96} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              policy 0 ~ 11
            </text>
            <text x={cx(12, 14)} y={96} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              사람이 넘겨받음 12 ~ 14
            </text>
            <text x={cx(15, 19)} y={96} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              policy 15 ~ 19
            </text>
          </g>
          <g opacity={prog(t, 7)}>
            <text x={cx(0, 11)} y={220} textAnchor="middle" fill={C.blue} fontSize={22}>
              RL 데이터 (+ episode 의 성공 여부)
            </text>
            <text x={cx(12, 14)} y={220} textAnchor="middle" fill={C.orange} fontSize={22}>
              정답 시연 · 회복 동작
            </text>
            <text x={cx(15, 19)} y={220} textAnchor="middle" fill={C.blue} fontSize={22}>
              RL 데이터
            </text>
          </g>
          <text x={40} y={268} fill={C.muted} fontSize={21} opacity={prog(t, 9.5)}>
            HIL-SERL: 개입 구간은 시연 buffer 와 RL buffer 에 모두 넣고, policy 구간은 RL buffer 에만 넣었다
          </text>
        </svg>
      </Panel>
      <Box x={64} y={460} w={580} h={420} at={12.5} title={<Head color={C.green}>HIL-SERL · RAM 꽂기</Head>}>
        <Bar label="개입 없이" value={48} max={100} color={C.red} at={12.9} width={260} unit="%" labelW={130} />
        <Bar label="개입을 씀" value={100} max={100} color={C.green} at={13.6} width={260} unit="%" labelW={130} />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.2) }}>대부분의 작업에서 1 ~ 2.5 시간 만에 100 번 시험을 모두 성공</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.6) }}>같은 수의 episode 와 개입으로 학습한 HG-DAgger: 평균 49.7%</span>
      </Box>
      <Box x={670} y={460} w={580} h={420} at={18.5} title={<Head color={C.purple}>ConRFT · 실물에서 Octo 를 RL</Head>}>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 18.8) }}>실물 작업 8 개 · 작업마다 15 ~ 90 분</span>
        <Bar label="RL 전" value={39.4} max={100} color={C.dim} at={19.3} width={260} unit="%" labelW={130} />
        <Bar label="RL 뒤" value={96.3} max={100} color={C.purple} at={20} width={260} unit="%" labelW={130} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.6) }}>RL 중에도 BC loss 를 남기고 action head 만 학습해 policy 가 급격히 바뀌지 않게 했다</span>
      </Box>
      <Box x={1276} y={460} w={580} h={420} at={24.5} title={<Head color={C.orange}>평가 횟수</Head>}>
        <span style={{ ...mono(C.orange, 30), opacity: prog(t, 24.8) }}>1 ÷ 20 = 5%p</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 25.4) }}>episode 20 개로 재면 성공 하나가 5%p 라서, 10%p 개선은 성공 두 개</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.8) }}>HIL-SERL 은 작업마다 100 번 쟀고, ConRFT 와 DSRL 의 실물 실험은 20 번씩 쟀다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: S(0), color: C.accent, text: 'SFT 는 81.5% 에 묶임 · 회복을 모르면 0.98 을 20 번 곱한 66.8%', at: 1 },
    { tag: S(1), color: C.green, text: 'baseline 6 ÷ 20 = 0.3 → +0.7 · −0.3 · 성공률 0% 면 배울 것이 없어 SFT 먼저', at: 4.4 },
    { tag: S(2), color: C.blue, text: 'token: 0.12 ÷ 0.1 = 1.2 로 ratio 가 바로 나옴 · flow: 네 방법으로 우회', at: 8.4 },
    { tag: S(3), color: C.orange, text: '실물 episode 1000 개 ≈ 8.3 시간 · replay buffer 와 개입 · RAM 꽂기 48% → 100%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            정답 action 없이, 직접 해 본 성공과 실패만으로 VLA 를 더 낫게 만들 수 있을까?
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600 }}>World Model · Real Robot</div>
        </Appear>
        <Appear at={1}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <Label color={C.muted} size={32}>
              World Model: 다음 장면을 예측하는 model 로 행동을 미리 비교해 실제 시도 횟수 줄이기
            </Label>
            <Label color={C.muted} size={32}>
              Real Robot: 학습한 policy 를 실물 팔에서 실행하며 사람이 개입하는 수집 붙이기
            </Label>
          </div>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/vla-rl (π*0.6 · SimpleVLA-RL · VLA-RL · RL4VLA · πRL · DSRL · HIL-SERL · ConRFT 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseDemo = () => (
  <PauseWrite
    question="시연 100 개 중 가운데 잡기 40 개, 가장자리 잡기 60 개면 따라 한 policy 의 성공률은? (성공률 95% 와 50%)"
    answer={
      <>
        0.4 × 0.95 + 0.6 × 0.5 = 0.38 + 0.3 = 0.68 → 68%
        <br />
        시연이 가장자리 쪽으로 치우친 만큼 policy 도 나빠진다
      </>
    }
  />
)

const PauseAdvantage = () => (
  <PauseWrite
    question="episode 10 개 가운데 2 개가 성공했다. baseline 과 성공 episode, 실패 episode 의 advantage 는?"
    answer={
      <>
        baseline = 2 ÷ 10 = 0.2
        <br />
        성공: 1 − 0.2 = +0.8 · 실패: 0 − 0.2 = −0.2
      </>
    }
  />
)

const PauseRatio = () => (
  <PauseWrite
    question="token 세 자리의 ratio 가 1.1, 1.0, 0.9 이면 action ratio 는? clip 범위가 0.8 ~ 1.2 라면 잘리는가?"
    answer={
      <>
        action ratio = 1.1 × 1.0 × 0.9 = 0.99
        <br />
        0.8 과 1.2 사이라서 잘리지 않는다
      </>
    }
  />
)

const PauseOnOff = () => (
  <PauseWrite
    question="episode 50 개씩 6 iteration 을 모았다. 마지막 update 에 on-policy 와 off-policy 는 각각 몇 개를 쓸 수 있나?"
    answer={
      <>
        on-policy: 마지막 iteration 에 모은 50 개만
        <br />
        off-policy: 쌓아 둔 50 × 6 = 300 개 모두
      </>
    }
  />
)

export function VlaRl() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        ceiling: Ceiling,
        recovery: Recovery,
        'pause-demo': PauseDemo,
        'rl-loop': RlLoop,
        'reward-source': RewardSource,
        'pause-advantage': PauseAdvantage,
        'token-ratio': TokenRatio,
        'flow-four': FlowFour,
        'pause-ratio': PauseRatio,
        'on-off': OnOff,
        intervention: Intervention,
        'pause-onoff': PauseOnOff,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
