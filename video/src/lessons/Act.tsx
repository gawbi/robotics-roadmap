import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './act.narration.json'
import { script } from './act.script'

// Numbers follow lessons/act/README.md (see act.script.ts). The chunk table's cell shades and the drawn paths in the
// question scene are decoration with no values on them.

function Intro() {
  const t = useSec()
  const chips = script.sections
  const hi = { color: C.accent }
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 3 · IMITATION LEARNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 140, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ACT</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={hi}>A</span>ction <span style={hi}>C</span>hunking with <span style={hi}>T</span>ransformers
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            관측 한 번에 앞으로 2 초 동안의 action 100 개를 내는 policy
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 1700 }}>
          {chips.map((c, i) => (
            <Appear key={c} at={2 + i * 0.45}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 24px',
                  borderRadius: 999,
                  border: `1.5px solid ${C.cardEdge}`,
                  background: C.card,
                  fontSize: 28,
                  transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 2 - i * 0.45) * 2)})`,
                }}
              >
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
  const drift = prog(t, 0.7, 2.2)
  const grow = prog(t, 4.6, 1.4)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50, marginTop: -40 }}>
        <Appear at={3.6}>
          <div style={{ fontSize: 66, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            시연은 그대로 두고
            <br />
            <span style={{ color: C.accent }}>출력의 모양만 바꿔서 실패를 줄일 수 있을까?</span>
          </div>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          <Appear at={0.4}>
            <Panel x={0} y={0} w={600} h={290} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>지금까지 · step 마다 action 1 개</Label>
              </div>
              <svg width={600} height={210} style={{ position: 'absolute', bottom: 0 }}>
                <path d="M 30 170 C 200 160, 380 110, 570 80" fill="none" stroke={C.green} strokeWidth={4} strokeDasharray="12 10" opacity={0.8} />
                <text x={570} y={64} textAnchor="end" fill={C.green} fontSize={22}>
                  시연
                </text>
                <path
                  d="M 30 170 C 200 162, 380 140, 570 196"
                  fill="none"
                  stroke={C.blue}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={620}
                  strokeDashoffset={620 * (1 - drift)}
                />
                <text x={40} y={202} fill={C.blue} fontSize={22} opacity={prog(t, 1.2)}>
                  policy
                </text>
                <circle cx={570} cy={196} r={9} fill={C.red} opacity={prog(t, 2.8)} />
                <text x={30} y={40} fill={C.red} fontSize={24} fontWeight={600} opacity={prog(t, 2.4)}>
                  ✕ 끝으로 갈수록 어긋남
                </text>
                <text x={30} y={76} fill={C.red} fontSize={24} fontWeight={600} opacity={prog(t, 3)}>
                  ✕ 어떤 자세에서 멈춰 버림
                </text>
              </svg>
            </Panel>
          </Appear>
          <Appear at={4.3}>
            <Panel x={0} y={0} w={600} h={290} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>출력의 모양만 바꾸면?</Label>
              </div>
              <svg width={600} height={210} style={{ position: 'absolute', bottom: 0 }}>
                <rect x={40} y={60} width={50} height={50} rx={8} fill={C.blue} />
                <text x={65} y={146} textAnchor="middle" fill={C.muted} fontSize={20}>
                  action 1 개
                </text>
                <line x1={110} x2={160} y1={85} y2={85} stroke={C.muted} strokeWidth={4} />
                <path d="M 160 75 L 178 85 L 160 95 Z" fill={C.muted} />
                {Array.from({ length: 20 }, (_, i) => (
                  <rect key={i} x={196 + i * 19} y={60} width={16} height={50} rx={4} fill={C.orange} opacity={i < grow * 20 ? 0.85 : 0} />
                ))}
                <text x={386} y={146} textAnchor="middle" fill={C.orange} fontSize={20} opacity={prog(t, 5.4)}>
                  관측 한 번에 action 100 개
                </text>
                <text x={566} y={44} textAnchor="end" fill={C.accent} fontSize={44} fontWeight={700} opacity={prog(t, 5.8)}>
                  ?
                </text>
              </svg>
            </Panel>
          </Appear>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ---------- action chunking: 400 decisions vs 4 ----------

const TL = { x0: 300, x1: 1700 }
const tx = (step: number) => TL.x0 + (step / 400) * (TL.x1 - TL.x0)
const chunkAt = (i: number) => 12.4 + i * 1.1

function Chunking() {
  const t = useSec()
  const ticks = Math.round(prog(t, 6.4, 4.4) * 100)
  const n100 = [0, 1, 2, 3].filter((i) => t >= chunkAt(i)).length
  const facts: [string, string][] = [
    ['50 Hz', '1초에 50 번 명령'],
    ['1 step = 20 ms', '1 ÷ 50 = 0.02 초'],
    ['action = 14 개', '목표 관절 각도 · 양팔 7 + 7'],
  ]
  const cw = tx(100) - tx(0) - 8
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 150, display: 'flex', gap: 20 }}>
        {facts.map(([a, b], i) => (
          <Appear key={a} at={0.5 + i * 1.3}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '14px 26px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 600, color: C.accent }}>{a}</span>
              <Label size={24}>{b}</Label>
            </div>
          </Appear>
        ))}
      </div>
      <Panel x={64} y={260} w={1792} h={620}>
        <svg width={1792} height={620}>
          {/* k = 1: a decision every step */}
          <g opacity={prog(t, 5.9)}>
            <text x={40} y={134} fill={C.blue} fontSize={38} fontWeight={600} fontFamily={MONO}>
              k = 1
            </text>
            <text x={TL.x0} y={66} fill={C.muted} fontSize={22}>
              ▮ 관측을 보고 action 을 낸 순간 (4 step 마다 하나만 그렸다)
            </text>
            <rect x={TL.x0} y={90} width={TL.x1 - TL.x0} height={64} rx={8} fill={C.grid} />
            {Array.from({ length: 100 }, (_, i) => (
              <rect key={i} x={tx(i * 4) + 1} y={96} width={3} height={52} fill={C.blue} opacity={i < ticks ? 0.95 : 0} />
            ))}
            <text x={TL.x1} y={66} textAnchor="end" fill={C.blue} fontSize={30} fontWeight={700}>
              결정 <tspan fontFamily={MONO}>{ticks * 4}</tspan> 번
            </text>
          </g>
          {/* k = 100: a decision every chunk */}
          <g opacity={prog(t, 11.9)}>
            <text x={40} y={324} fill={C.orange} fontSize={38} fontWeight={600} fontFamily={MONO}>
              k = 100
            </text>
            <text x={TL.x0} y={256} fill={C.muted} fontSize={22}>
              chunk 를 낼 때만 관측을 본다
            </text>
            <rect x={TL.x0} y={280} width={TL.x1 - TL.x0} height={64} rx={8} fill={C.grid} />
            {[0, 1, 2, 3].map((i) => {
              const p = prog(t, chunkAt(i), 0.7)
              const x = tx(i * 100) + 4
              return (
                <g key={i} opacity={t >= chunkAt(i) ? 1 : 0}>
                  <rect x={x} y={286} width={cw * p} height={52} rx={6} fill={C.orange} opacity={0.3} />
                  <rect x={x} y={286} width={cw * p} height={52} rx={6} fill="none" stroke={C.orange} strokeWidth={2} />
                  <rect x={x - 3} y={276} width={6} height={72} rx={3} fill={C.orange} />
                  <text x={x + cw / 2} y={321} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} opacity={prog(t, chunkAt(i) + 0.4)}>
                    chunk {i + 1}
                  </text>
                </g>
              )
            })}
            <text x={TL.x1} y={256} textAnchor="end" fill={C.orange} fontSize={30} fontWeight={700}>
              결정 <tspan fontFamily={MONO}>{n100}</tspan> 번
            </text>
          </g>
          {/* step axis */}
          <g opacity={prog(t, 5.9)}>
            <line x1={TL.x0} x2={TL.x1} y1={396} y2={396} stroke={C.muted} strokeWidth={2} />
            {[0, 100, 200, 300, 400].map((s) => (
              <g key={s}>
                <line x1={tx(s)} x2={tx(s)} y1={396} y2={406} stroke={C.muted} strokeWidth={2} />
                <text x={tx(s)} y={436} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {s}
                </text>
                <text x={tx(s)} y={466} textAnchor="middle" fill={C.dim} fontSize={20}>
                  {s / 50} 초
                </text>
              </g>
            ))}
            <text x={TL.x0 - 30} y={436} textAnchor="end" fill={C.muted} fontSize={22}>
              step
            </text>
          </g>
          {/* the summary */}
          <g opacity={prog(t, 18.6)}>
            <text x={TL.x0} y={556} fill={C.orange} fontSize={28} fontWeight={600}>
              chunk 하나 <tspan fontFamily={MONO}>= (100, 14) · 100 × 20 ms = 2</tspan> 초
            </text>
            <text x={TL.x1} y={560} textAnchor="end" fill={C.accent} fontSize={44} fontWeight={700}>
              결정 <tspan fontFamily={MONO}>400</tspan> 번 → <tspan fontFamily={MONO}>4</tspan> 번
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- action chunking: the (100, 14) table, played a row every 20 ms ----------

const GRID = { x0: 150, y0: 128, colW: 26, gap: 4, armGap: 18, rowH: 5.4 }
const gx = (c: number) => GRID.x0 + c * (GRID.colW + GRID.gap) + (c >= 7 ? GRID.armGap : 0)
const gy = (r: number) => GRID.y0 + r * GRID.rowH
const GRID_W = gx(13) + GRID.colW - GRID.x0
/** decoration only: a smooth pattern so the table reads as 14 changing joint angles; the lesson gives no values */
const shade = (r: number, c: number, k: number) => 0.5 + 0.5 * Math.sin(r * (0.04 + c * 0.005) + c * 0.9 + k * 1.7)

function ChunkTable({ t }: { t: number }) {
  const RUN = 1.2
  const PER = 2 // 100 rows × 20 ms
  const run = Math.max(0, t - RUN)
  const k = Math.floor(run / PER)
  const row = t < RUN ? -1 : Math.floor(((run - k * PER) / PER) * 100)
  const fresh = t < RUN ? 0 : 1 - prog(run - k * PER, 0, 0.6)
  const cells = []
  for (let r = 0; r < 100; r++) {
    for (let c = 0; c < 14; c++) {
      const done = r < row
      cells.push(<rect key={`${r}-${c}`} x={gx(c)} y={gy(r)} width={GRID.colW} height={GRID.rowH - 1} fill={C.blue} opacity={done ? 0.08 : 0.15 + 0.6 * shade(r, c, k)} />)
    }
  }
  const cy = gy(Math.max(row, 0)) + GRID.rowH / 2
  return (
    <Panel x={64} y={140} w={720} h={740}>
      <svg width={720} height={740}>
        <text x={36} y={58} fill={C.text} fontSize={30} fontWeight={600} fontFamily={MONO}>
          chunk <tspan fill={C.accent}>(100, 14)</tspan>
        </text>
        <text x={684} y={58} textAnchor="end" fill={fresh > 0.5 ? C.orange : C.muted} fontSize={24} fontFamily={MONO} opacity={t >= RUN ? 1 : 0}>
          #{k + 1} · 줄 {Math.max(row, 0)}
        </text>
        <text x={(gx(0) + gx(6) + GRID.colW) / 2} y={110} textAnchor="middle" fill={C.muted} fontSize={22}>
          왼팔 7
        </text>
        <text x={(gx(7) + gx(13) + GRID.colW) / 2} y={110} textAnchor="middle" fill={C.muted} fontSize={22}>
          오른팔 7
        </text>
        {cells}
        {[0, 25, 50, 75, 100].map((r) => (
          <g key={r}>
            <text x={112} y={gy(r) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {r === 100 ? 99 : r}
            </text>
            <text x={GRID.x0 + GRID_W + 18} y={gy(r) + 7} fill={C.dim} fontSize={20}>
              {r / 50} 초
            </text>
          </g>
        ))}
        <rect x={GRID.x0 - 8} y={GRID.y0 - 8} width={GRID_W + 16} height={100 * GRID.rowH + 14} rx={8} fill="none" stroke={C.orange} strokeWidth={3} opacity={fresh} />
        {row >= 0 && (
          <g>
            <rect x={GRID.x0 - 6} y={cy - 5} width={GRID_W + 12} height={10} rx={3} fill="none" stroke={C.accent} strokeWidth={2.5} />
            <path d={`M 122 ${cy - 9} L 138 ${cy} L 122 ${cy + 9} Z`} fill={C.accent} />
          </g>
        )}
        <text x={36} y={720} fill={C.muted} fontSize={22}>
          한 줄 = 한 step 의 목표 관절 각도 14 개
        </text>
      </svg>
    </Panel>
  )
}

function PauseRow({ label, color, cells, at, note }: { label: string; color: string; cells: ('stop' | 'move')[]; at: (i: number) => number; note: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ width: 170, fontSize: 26, fontWeight: 600, color }}>{label}</span>
      <div style={{ display: 'flex', gap: 5 }}>
        {cells.map((c, i) => (
          <div key={i} style={{ width: 34, height: 44, borderRadius: 6, background: c === 'stop' ? C.orange : C.green, opacity: 0.85 * prog(t, at(i), 0.3) }} />
        ))}
      </div>
      <span style={{ marginLeft: 10, fontSize: 26, fontWeight: 600, color, opacity: prog(t, at(cells.length - 1) + 0.3) }}>{note}</span>
    </div>
  )
}

function Execute() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <ChunkTable t={t} />
      <Appear at={0.8} out={5.8} style={{ position: 'absolute', left: 830, top: 160, width: 1026 }}>
        <div style={{ padding: '28px 34px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 18 }}>
          <Label color={C.text} size={34} weight={600}>
            20 ms 마다 한 줄씩 → 100 줄 = 2 초
          </Label>
          <Label size={28}>다 쓰면 관측을 다시 보고 다음 chunk 를 낸다</Label>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 830, top: 150, width: 1026 }}>
        <Misconception
          at={6.3}
          belief="chunk 를 쓰면 로봇이 2 초에 한 번만 움직인다"
          fact="로봇은 여전히 20 ms 마다 새 목표 각도를 받는다. 줄어드는 것은 관측을 보고 결정하는 횟수뿐이다"
        />
      </div>
      <Appear at={12.6} style={{ position: 'absolute', left: 830, top: 590, width: 1026 }}>
        <div style={{ padding: '22px 28px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Label color={C.text} size={28} weight={600}>
              시연 중 사람이 잠깐 멈춘 자세
            </Label>
            <div style={{ display: 'flex', gap: 18, fontSize: 22 }}>
              <span style={{ color: C.orange }}>■ 멈춤</span>
              <span style={{ color: C.green }}>■ 움직임</span>
            </div>
          </div>
          <PauseRow label="action 1 개씩" color={C.red} cells={Array(10).fill('stop')} at={(i) => 13.2 + i * 0.22} note="같은 관측 → 또 멈춤 ✕" />
          <PauseRow label="chunk" color={C.green} cells={[...Array(3).fill('stop'), ...Array(7).fill('move')]} at={() => 15.6} note="멈췄다가 다시 움직임 ✓" />
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- decisions and compounding error ----------

const LOG = { base: 470, decade: 92, lo: -1 }
const ly = (v: number) => LOG.base - (Math.log10(v) - LOG.lo) * LOG.decade
const HORIZON = [
  { k: 1, H: 400, worst: '1600', w: 1600, expr: '400 × 400 × 0.01' },
  { k: 10, H: 40, worst: '16', w: 16, expr: '40 × 40 × 0.01' },
  { k: 100, H: 4, worst: '0.16', w: 0.16, expr: '4 × 4 × 0.01' },
]
const rowAt = (i: number) => 11 + i * 1.7
const GROUP_X = [290, 540, 790]

function HeaderCard({ at, big, title, sub }: { at: number; big: string; title: string; sub: string }) {
  return (
    <Appear at={at}>
      <div style={{ padding: '16px 28px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 36, fontWeight: 600, color: C.accent }}>{big}</span>
          <Label color={C.text} size={28} weight={600}>
            {title}
          </Label>
        </div>
        <Label size={22}>{sub}</Label>
      </div>
    </Appear>
  )
}

function Horizon() {
  const t = useSec()
  const cols = [90, 200, 440]
  const rates: [string, number][] = [
    ['k = 1', 1],
    ['k = 100', 44],
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 146, display: 'flex', gap: 24 }}>
        <HeaderCard at={0.5} big="H²ε" title="최악에 틀리는 결정 수" sub="ε: 결정 한 번이 틀릴 확률 · H: 결정 횟수" />
        <HeaderCard at={5.9} big="H = T ÷ k" title="chunk 를 쓸 때의 결정 횟수" sub="T: episode 의 step 수 · transfer-cube 는 T = 400" />
      </div>
      <Panel x={64} y={290} w={820} h={590}>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 34, display: 'grid', gap: 26, opacity: prog(t, 0.8) * (1 - prog(t, 10.1, 0.4)) }}>
          <Label size={24}>Behavior Cloning 에서 본 compounding error</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {['작은 오차', '시연에 없던 상황', '더 큰 오차'].map((n, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: '12px 18px', borderRadius: 14, fontSize: 24, fontWeight: 600, background: C.bg, border: `1.5px solid ${i === 2 ? C.red : C.cardEdge}`, color: i === 2 ? C.red : C.text }}>{n}</div>
                <span style={{ fontSize: 30, color: C.muted }}>{i < 2 ? '→' : '↺'}</span>
              </div>
            ))}
          </div>
          <Label color={C.text} size={28} weight={600} style={{ lineHeight: 1.5 }}>
            결정이 H 번이면 최악에 <span style={{ fontFamily: MONO, color: C.red }}>H²ε</span> 번 틀린다
          </Label>
          <div style={{ opacity: prog(t, 6.4) }}>
            <Label color={C.accent} size={28} weight={600}>
              → chunk 는 결정 횟수 H 를 줄인다
            </Label>
          </div>
        </div>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', color: C.muted, fontSize: 22, paddingBottom: 10, borderBottom: `1.5px solid ${C.cardEdge}`, opacity: prog(t, 10.6) }}>
            <span style={{ width: cols[0], fontFamily: MONO }}>k</span>
            <span style={{ width: cols[1], fontFamily: MONO }}>H = 400 ÷ k</span>
            <span style={{ width: cols[2] }}>
              <span style={{ fontFamily: MONO }}>H²ε</span> (ε = 0.01)
            </span>
          </div>
          {HORIZON.map((r, i) => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', height: 62, fontFamily: MONO, fontSize: 28, opacity: prog(t, rowAt(i), 0.4) }}>
              <span style={{ width: cols[0] }}>{r.k}</span>
              <span style={{ width: cols[1], color: C.blue, fontWeight: 600 }}>{r.H}</span>
              <span style={{ width: cols[2], fontSize: 26 }}>
                <span style={{ color: C.muted }}>{r.expr} = </span>
                <span style={{ color: C.red, fontWeight: 600 }}>{r.worst}</span>
              </span>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 28, fontWeight: 600, color: C.accent, opacity: prog(t, 16.6) }}>k 를 10 배 → H 는 10 분의 1, H²ε 은 100 분의 1</div>
          <div style={{ marginTop: 34, display: 'grid', gap: 14, opacity: prog(t, 21.2) }}>
            <Label size={22}>simulator 과제 2 개의 평균 성공률 (논문, k 만 바꿈)</Label>
            {rates.map(([name, pct], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ width: 120, fontFamily: MONO, fontSize: 26 }}>{name}</span>
                <div style={{ width: 480, height: 30, borderRadius: 8, background: C.grid }}>
                  <div style={{ width: `${pct * prog(t, 21.6 + i * 0.8, 1)}%`, minWidth: 4, height: '100%', borderRadius: 8, background: i ? C.green : C.red }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: i ? C.green : C.red }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Appear at={5.8} dy={0}>
      <Panel x={920} y={290} w={936} h={590}>
        <svg width={936} height={590}>
          {[0.1, 1, 10, 100, 1000].map((v) => (
            <g key={v} opacity={prog(t, 6.2)}>
              <line x1={120} x2={900} y1={ly(v)} y2={ly(v)} stroke={C.grid} strokeWidth={2} />
              <text x={106} y={ly(v) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 6.2)}>
            <text x={900} y={38} textAnchor="end" fontSize={24} fontWeight={600}>
              <tspan fill={C.blue}>■ 결정 횟수 H</tspan>
              <tspan dx={24} fill={C.red}>
                ■ H²ε
              </tspan>
            </text>
            <text x={900} y={68} textAnchor="end" fill={C.dim} fontSize={20}>
              세로축: 10 배씩 늘어나는 눈금
            </text>
          </g>
          {HORIZON.map((r, i) => {
            const p = prog(t, rowAt(i), 0.8)
            const cx = GROUP_X[i]
            const bars: [number, number, string][] = [
              [cx - 44, r.H, C.blue],
              [cx + 44, r.w, C.red],
            ]
            return (
              <g key={r.k} opacity={t >= rowAt(i) ? 1 : 0}>
                {bars.map(([x, v, color]) => {
                  const top = lerp(LOG.base, ly(v), p)
                  return (
                    <g key={x}>
                      <rect x={x - 35} y={top} width={70} height={LOG.base - top} rx={4} fill={color} opacity={0.85} />
                      <text x={x} y={top - 12} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, rowAt(i) + 0.6)}>
                        {v === r.w ? r.worst : v}
                      </text>
                    </g>
                  )
                })}
                <text x={cx} y={508} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO}>
                  k = {r.k}
                </text>
              </g>
            )
          })}
          <line x1={120} x2={900} y1={LOG.base} y2={LOG.base} stroke={C.muted} strokeWidth={2} opacity={prog(t, 6.2)} />
          {[0, 1].map((i) => (
            <g key={i} opacity={prog(t, 16.8 + i * 0.6)}>
              <text x={(GROUP_X[i] + GROUP_X[i + 1]) / 2} y={546} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600} fontFamily={MONO}>
                H ÷ 10
              </text>
              <text x={(GROUP_X[i] + GROUP_X[i + 1]) / 2} y={576} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} fontFamily={MONO}>
                H²ε ÷ 100
              </text>
            </g>
          ))}
        </svg>
      </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- the inference deadline ----------

const TM = { x0: 300, x1: 1720, span: 2.2 }
const sx = (sec: number) => TM.x0 + (sec / TM.span) * (TM.x1 - TM.x0)
const SLOT = sx(0.02) - sx(0)

function Timing() {
  const t = useSec()
  const sweep1 = TM.span * prog(t, 5.6, 4.6)
  const sweep2 = TM.span * prog(t, 11.3, 3.8)
  const clip = (a: number, b: number, sweep: number) => Math.max(0, Math.min(b, sweep) - a)
  const deadline: [string, number, string, string][] = [
    ['k = 1', 0.02, '20 ms', C.red],
    ['k = 100', 2, '2 초', C.green],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={460}>
        <svg width={1792} height={460}>
          {/* what one inference is */}
          <g opacity={prog(t, 0.6) * (1 - prog(t, 5, 0.4))}>
            <text x={896} y={70} textAnchor="middle" fill={C.muted} fontSize={24}>
              추론 (inference): 학습이 끝난 모델에 관측을 넣어 출력을 계산하는 일
            </text>
            {[
              ['관측', 470, C.cardEdge, C.text],
              ['모델', 896, C.accent, C.accent],
              ['action', 1322, C.cardEdge, C.text],
            ].map(([name, cx, edge, color]) => (
              <g key={name as string}>
                <rect x={(cx as number) - 110} y={130} width={220} height={90} rx={16} fill={C.bg} stroke={edge as string} strokeWidth={2.5} />
                <text x={cx as number} y={186} textAnchor="middle" fill={color as string} fontSize={32} fontWeight={600}>
                  {name}
                </text>
              </g>
            ))}
            {[580, 1006].map((x) => (
              <g key={x}>
                <line x1={x + 16} x2={x + 190} y1={175} y2={175} stroke={C.muted} strokeWidth={4} />
                <path d={`M ${x + 190} 163 L ${x + 210} 175 L ${x + 190} 187 Z`} fill={C.muted} />
              </g>
            ))}
            <text x={896} y={280} textAnchor="middle" fill={C.accent} fontSize={30} fontWeight={700} opacity={prog(t, 2.4)}>
              추론 한 번 = 100 ms (예로 둔 값)
            </text>
          </g>
          {/* k = 1 */}
          <g opacity={prog(t, 5.3)}>
            <text x={40} y={118} fill={C.text} fontSize={36} fontWeight={600} fontFamily={MONO}>
              k = 1
            </text>
            <text x={TM.x0 - 16} y={90} textAnchor="end" fill={C.muted} fontSize={20}>
              추론
            </text>
            <text x={TM.x0 - 16} y={128} textAnchor="end" fill={C.muted} fontSize={20}>
              명령
            </text>
            {Array.from({ length: 22 }, (_, j) => (
              <rect key={j} x={sx(j * 0.1) + 1} y={70} width={Math.max(0, clip(j * 0.1, j * 0.1 + 0.1, sweep1) * (SLOT / 0.02) - 2)} height={28} rx={3} fill={C.muted} opacity={0.4} />
            ))}
            {Array.from({ length: 21 }, (_, j) => {
              const c = (j + 1) * 0.1
              return (
                <g key={j} opacity={sweep1 >= c ? 1 : 0}>
                  <rect x={sx(c)} y={106} width={SLOT - 1} height={32} rx={2} fill={C.blue} />
                  <rect x={sx(c + 0.02)} y={106} width={Math.max(0, clip(c + 0.02, c + 0.1, sweep1) * (SLOT / 0.02) - 1)} height={32} rx={2} fill={C.red} opacity={0.3} />
                </g>
              )
            })}
            <text x={TM.x1} y={46} textAnchor="end" fill={C.red} fontSize={24} fontWeight={600} opacity={prog(t, 8.6)}>
              1초에 명령 10 개 · 명령마다 80 ms 기다림
            </text>
          </g>
          {/* k = 100 */}
          <g opacity={prog(t, 11)}>
            <text x={40} y={278} fill={C.text} fontSize={36} fontWeight={600} fontFamily={MONO}>
              k = 100
            </text>
            <text x={TM.x0 - 16} y={250} textAnchor="end" fill={C.muted} fontSize={20}>
              추론
            </text>
            <text x={TM.x0 - 16} y={288} textAnchor="end" fill={C.muted} fontSize={20}>
              명령
            </text>
            <rect x={sx(0) + 1} y={230} width={Math.max(0, clip(0, 0.1, sweep2) * (SLOT / 0.02) - 2)} height={28} rx={3} fill={C.muted} opacity={0.4} />
            {Array.from({ length: 100 }, (_, i) => {
              const c = 0.1 + i * 0.02
              return <rect key={i} x={sx(c)} y={266} width={SLOT - 2} height={32} rx={2} fill={C.blue} opacity={sweep2 >= c ? 1 : 0} />
            })}
            <g opacity={prog(t, 16)}>
              <rect x={sx(0.1) + 2} y={230} width={sx(2.1) - sx(0.1) - 4} height={28} rx={4} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="8 6" />
              <text x={(sx(0.1) + sx(2.1)) / 2} y={251} textAnchor="middle" fill={C.text} fontSize={20}>
                다음 chunk 를 계산할 시간 · 2 초 안에만 끝내면 된다
              </text>
            </g>
            <text x={TM.x1} y={206} textAnchor="end" fill={C.blue} fontSize={24} fontWeight={600} opacity={prog(t, 13.6)}>
              추론 한 번 → action 100 개 (2 초 분량) · 20 ms 마다 명령
            </text>
          </g>
          {/* time axis and legend */}
          <g opacity={prog(t, 5.3)}>
            <line x1={TM.x0} x2={TM.x1} y1={340} y2={340} stroke={C.muted} strokeWidth={2} />
            {[0, 0.5, 1, 1.5, 2].map((s) => (
              <g key={s}>
                <line x1={sx(s)} x2={sx(s)} y1={340} y2={350} stroke={C.muted} strokeWidth={2} />
                <text x={sx(s)} y={378} textAnchor="middle" fill={C.muted} fontSize={22}>
                  <tspan fontFamily={MONO}>{s}</tspan> 초
                </text>
              </g>
            ))}
            <text x={TM.x0} y={428} fontSize={22}>
              <tspan fill={C.muted}>■ 추론 중 (100 ms)</tspan>
              <tspan dx={36} fill={C.blue}>
                ■ 명령 실행 (20 ms)
              </tspan>
              <tspan dx={36} fill={C.red}>
                ■ 기다림
              </tspan>
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={16.2} style={{ position: 'absolute', left: 64, top: 630, width: 1100 }}>
        <div style={{ padding: '20px 30px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Label color={C.text} size={28} weight={600}>
              추론이 끝나야 하는 시한
            </Label>
            <Label color={C.accent} size={34} weight={700}>
              100 배
            </Label>
          </div>
          {deadline.map(([name, sec, text, color], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span style={{ width: 130, fontFamily: MONO, fontSize: 26 }}>{name}</span>
              <div style={{ width: 760, height: 28, borderRadius: 8, background: C.grid }}>
                <div style={{ width: 760 * (sec / 2) * prog(t, 16.8 + i * 0.6, 1), minWidth: 5, height: '100%', borderRadius: 8, background: color }} />
              </div>
              <span style={{ fontSize: 28, fontWeight: 600, color }}>{text}</span>
            </div>
          ))}
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 1200, top: 630, width: 656, display: 'grid', gap: 14 }}>
        <Appear at={21.2}>
          <div style={{ padding: '16px 26px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.orange}66`, display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 600, color: C.orange }}>논문의 ACT</span>
            <Label color={C.text} size={26}>
              추론 약 0.01 초 → 20 ms 시한에도 맞는다
            </Label>
          </div>
        </Appear>
        <Appear at={22.6}>
          <div style={{ padding: '16px 26px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.purple}66`, display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 600, color: C.purple }}>π0</span>
            <Label color={C.text} size={26}>
              parameter 수십억 개 → 늘어난 시한이 필요하다
            </Label>
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- open-loop: the pushed cube ----------

const OL = { x0: 130, x1: 1090, base: 560, top: 120 }
const ox = (s: number) => OL.x0 + (s / 120) * (OL.x1 - OL.x0)
const oy = (cm: number) => OL.base - (cm / 14) * (OL.base - OL.top)
/** gripper x (cm) at step s: 0.2 cm a step toward the target it last saw */
const fast = (s: number) => (s <= 40 ? 0.2 * s : s <= 70 ? 8 + 0.2 * (s - 40) : 14) // k = 20: sees the push at step 40
const slow = (s: number) => (s <= 50 ? 0.2 * s : s <= 100 ? 10 : 10 + 0.2 * (s - 100)) // k = 100: sees it at step 100
const BREAKS = [30, 40, 50, 70, 100]

function trace(f: (s: number) => number, upTo: number, dy = 0): string {
  const pts = [0, ...BREAKS.filter((b) => b < upTo), upTo]
  return pts.map((s) => `${ox(s)},${oy(f(s)) + dy}`).join(' ')
}

function OpenLoop() {
  const t = useSec()
  const s = 30 * prog(t, 5.9, 3.4) + 40 * prog(t, 11.3, 3.4) + 50 * prog(t, 16.3, 3)
  const pushed = s >= 30
  const cubeTrail = pushed ? `${ox(0)},${oy(10)} ${ox(30)},${oy(10)} ${ox(30)},${oy(14)} ${ox(s)},${oy(14)}` : `${ox(0)},${oy(10)} ${ox(s)},${oy(10)}`
  const show = prog(t, 5.5)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1190} h={740}>
        <svg width={1190} height={740}>
          <g opacity={prog(t, 0.4)}>
            {[0, 4, 8, 10, 14].map((cm) => (
              <g key={cm}>
                <line x1={OL.x0} x2={OL.x1} y1={oy(cm)} y2={oy(cm)} stroke={C.grid} strokeWidth={2} />
                <text x={OL.x0 - 24} y={oy(cm) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {cm}
                </text>
              </g>
            ))}
            {[0, 20, 30, 40, 60, 80, 100, 120].map((st) => (
              <text key={st} x={ox(st)} y={OL.base + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {st}
              </text>
            ))}
            <line x1={OL.x0} x2={OL.x1} y1={OL.base} y2={OL.base} stroke={C.muted} strokeWidth={2} />
            <line x1={OL.x0} x2={OL.x0} y1={OL.top - 20} y2={OL.base} stroke={C.muted} strokeWidth={2} />
            <text x={OL.x1} y={OL.base + 64} textAnchor="end" fill={C.muted} fontSize={20}>
              step
            </text>
            <text x={OL.x0 - 14} y={74} fill={C.muted} fontSize={22}>
              집게 위치 x (cm)
            </text>
          </g>
          {/* the start: gripper at 0 cm, cube at 10 cm */}
          <g opacity={prog(t, 0.8) * (1 - prog(t, 5.6, 0.4))}>
            <rect x={ox(0) - 12} y={oy(10) - 12} width={24} height={24} rx={4} fill={C.orange} />
            <text x={ox(0) + 26} y={oy(10) - 18} fill={C.orange} fontSize={24} fontWeight={600}>
              큐브 · 10 cm
            </text>
            <circle cx={ox(0)} cy={oy(0)} r={10} fill={C.green} />
            <text x={ox(0) + 26} y={oy(0) - 22} fill={C.green} fontSize={24} fontWeight={600}>
              집게 · 0 cm 에서 출발
            </text>
          </g>
          {/* where the cube got pushed */}
          <g opacity={prog(t, 9.4)}>
            <line x1={ox(30)} x2={ox(30)} y1={oy(10) + 18} y2={OL.base} stroke={C.red} strokeWidth={2} strokeDasharray="8 8" opacity={0.7} />
            <text x={ox(30) + 12} y={104} fill={C.red} fontSize={22} fontWeight={600}>
              step 30 · 큐브가 14 cm 로 밀림
            </text>
          </g>
          <g opacity={show}>
            <polyline points={cubeTrail} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="10 8" />
            <rect x={ox(s) - 12} y={oy(pushed ? 14 : 10) - 12} width={24} height={24} rx={4} fill={C.orange} />
            <polyline points={trace(slow, s, 3)} fill="none" stroke={C.blue} strokeWidth={5} strokeLinejoin="round" />
            <polyline points={trace(fast, s)} fill="none" stroke={C.green} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={ox(s)} cy={oy(slow(s)) + 3} r={9} fill={C.blue} />
            <circle cx={ox(s)} cy={oy(fast(s))} r={9} fill={C.green} />
          </g>
          {/* the new decisions */}
          <g opacity={prog(t, 12.4)}>
            <circle cx={ox(40)} cy={oy(8)} r={11} fill="none" stroke={C.green} strokeWidth={3} />
            <text x={ox(40) + 18} y={oy(8) + 36} fill={C.green} fontSize={22} fontWeight={600}>
              k = 20 · step 40 에 새 결정
            </text>
          </g>
          <g opacity={prog(t, 17.6)}>
            <circle cx={ox(100)} cy={oy(10) + 3} r={11} fill="none" stroke={C.blue} strokeWidth={3} />
            <text x={ox(100) - 18} y={oy(10) + 40} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
              k = 100 · step 100 에 새 결정
            </text>
          </g>
          {/* how late each one reacted */}
          <g opacity={prog(t, 13.2)}>
            <line x1={ox(30)} x2={ox(40)} y1={OL.base - 34} y2={OL.base - 34} stroke={C.green} strokeWidth={4} />
            <text x={ox(40) + 12} y={OL.base - 26} fill={C.green} fontSize={22} fontWeight={600}>
              10 step 늦게 반응
            </text>
          </g>
          <g opacity={prog(t, 18.6)}>
            <line x1={ox(30)} x2={ox(100)} y1={OL.base - 80} y2={OL.base - 80} stroke={C.blue} strokeWidth={4} />
            <text x={ox(65)} y={OL.base - 94} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              70 step = 1.4 초 늦게 반응
            </text>
          </g>
          {/* legend */}
          <g opacity={show}>
            <text x={OL.x0} y={660} fontSize={22} fontWeight={600}>
              <tspan fill={C.green}>— k = 20 집게</tspan>
              <tspan dx={36} fill={C.blue}>
                — k = 100 집게
              </tspan>
              <tspan dx={36} fill={C.orange}>
                - - 큐브 위치
              </tspan>
            </text>
            <text x={OL.x0} y={700} fill={C.dim} fontSize={20}>
              집게는 step 마다 0.2 cm 씩, 마지막으로 본 큐브 쪽으로 간다
            </text>
          </g>
        </svg>
      </Panel>
      <Panel x={1290} y={140} w={566} h={740}>
        <div style={{ padding: '30px 32px', display: 'grid', gap: 18 }}>
          <Appear at={0.5}>
            <div style={{ display: 'grid', gap: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.accent }}>open-loop 제어</span>
              <Label color={C.text} size={28} style={{ lineHeight: 1.45, textWrap: 'balance' }}>
                chunk 를 실행하는 동안에는 새 관측을 보지 않는다
              </Label>
              <Label size={24}>k 가 클수록 open-loop 구간도 길다</Label>
            </div>
          </Appear>
          <Appear at={21} style={{ marginTop: 40 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <Label color={C.text} size={28} weight={600}>
                k 를 키우면
              </Label>
              <Label color={C.green} size={26} style={{ lineHeight: 1.45 }}>
                + 결정 횟수 ↓ · 추론 시한 ↑
              </Label>
              <Label color={C.red} size={26} style={{ lineHeight: 1.45 }}>
                − 바뀐 상황에 늦게 반응
              </Label>
              <Label color={C.red} size={26} style={{ lineHeight: 1.45 }}>
                − 긴 action 열은 예측하기 어렵다
              </Label>
              <Label size={24} style={{ lineHeight: 1.5, textWrap: 'balance' }}>
                논문: 성공률은 k = 100 에서 가장 높고, 200 · 400 에서 조금 떨어졌다
              </Label>
            </div>
          </Appear>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- temporal ensembling: the jump at a chunk boundary ----------

const JP = { x0: 130, x1: 1090, base: 600, top: 130, s0: 90, s1: 110, a0: 36, a1: 48 }
const jx = (s: number) => JP.x0 + ((s - JP.s0) / (JP.s1 - JP.s0)) * (JP.x1 - JP.x0)
const jy = (a: number) => JP.base - ((a - JP.a0) / (JP.a1 - JP.a0)) * (JP.base - JP.top)
/** the shoulder's target angle: the first chunk reaches 40.0° at step 99 in 0.4° steps, the second starts at 44.0° */
const angleAt = (s: number) => (s < 100 ? 40 - 0.4 * (99 - s) : 44 + 0.4 * (s - 100))
const JUMP = 9.9

function Jump() {
  const t = useSec()
  const s = t < JUMP ? 90 + 9 * prog(t, 4.9, 3.6) : 100 + 10 * prog(t, 10.6, 3.4)
  const step = Math.floor(s + 1e-6)
  const first = Array.from({ length: Math.min(step, 99) - 90 + 1 }, (_, i) => 90 + i)
  const second = step >= 100 ? Array.from({ length: step - 100 + 1 }, (_, i) => 100 + i) : []
  const flash = t >= JUMP ? 1 - prog(t, JUMP + 0.6, 1.2) : 0
  const angle = angleAt(step)
  const th = (angle * Math.PI) / 180
  const sh = { x: 150, y: 560 }
  const elbow = { x: sh.x + 300 * Math.cos(th), y: sh.y - 300 * Math.sin(th) }
  const fa = th - Math.PI / 3
  const hand = { x: elbow.x + 170 * Math.cos(fa), y: elbow.y - 170 * Math.sin(fa) }
  const ghost = (40 * Math.PI) / 180
  const armColor = flash > 0.05 ? C.red : C.blue
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1150} h={740}>
        <svg width={1150} height={740}>
          {[36, 38, 40, 42, 44, 46, 48].map((a) => (
            <g key={a}>
              <line x1={JP.x0} x2={JP.x1} y1={jy(a)} y2={jy(a)} stroke={C.grid} strokeWidth={2} />
              <text x={JP.x0 - 14} y={jy(a) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {a}
              </text>
            </g>
          ))}
          {[90, 95, 99, 100, 105, 110].map((st) => (
            <text key={st} x={jx(st)} y={JP.base + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {st}
            </text>
          ))}
          <line x1={JP.x0} x2={JP.x1} y1={JP.base} y2={JP.base} stroke={C.muted} strokeWidth={2} />
          <text x={JP.x1} y={JP.base + 70} textAnchor="end" fill={C.muted} fontSize={20}>
            step
          </text>
          <text x={JP.x0 - 14} y={92} fill={C.muted} fontSize={22}>
            어깨의 목표 각도 (°)
          </text>
          <line x1={(jx(99) + jx(100)) / 2} x2={(jx(99) + jx(100)) / 2} y1={JP.top - 20} y2={JP.base} stroke={C.muted} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />
          <text x={(jx(99) + jx(100)) / 2} y={JP.top - 30} textAnchor="middle" fill={C.muted} fontSize={20}>
            chunk 경계
          </text>
          <text x={JP.x0 + 20} y={JP.top + 40} fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 4.8)}>
            ● 첫 chunk (step 0 에 결정)
          </text>
          <text x={JP.x0 + 20} y={JP.top + 74} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, JUMP)}>
            ● 둘째 chunk (step 100 에 결정)
          </text>
          <polyline points={first.map((st) => `${jx(st)},${jy(angleAt(st))}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={4} />
          {first.map((st) => (
            <circle key={st} cx={jx(st)} cy={jy(angleAt(st))} r={7} fill={C.blue} />
          ))}
          <text x={JP.x0 + 20} y={jy(39.4)} fill={C.blue} fontSize={22} opacity={prog(t, 6.4)}>
            평소: step 마다 0.4°
          </text>
          <text x={jx(99) - 12} y={jy(40) - 16} textAnchor="end" fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.4)}>
            40.0°
          </text>
          <g opacity={t >= JUMP ? 1 : 0}>
            <line x1={jx(99)} y1={jy(40)} x2={jx(100)} y2={jy(44)} stroke={C.red} strokeWidth={4} strokeDasharray="7 5" />
            <text x={jx(99) - 14} y={jy(42) + 8} textAnchor="end" fill={C.red} fontSize={30} fontWeight={700}>
              4.0° 튐
            </text>
            <text x={jx(100) + 14} y={jy(44) + 34} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              44.0°
            </text>
          </g>
          <polyline points={second.map((st) => `${jx(st)},${jy(angleAt(st))}`).join(' ')} fill="none" stroke={C.orange} strokeWidth={4} />
          {second.map((st) => (
            <circle key={st} cx={jx(st)} cy={jy(angleAt(st))} r={7} fill={C.orange} />
          ))}
        </svg>
      </Panel>
      <Panel x={1250} y={140} w={606} h={740}>
        <svg width={606} height={740}>
          <text x={40} y={62} fill={C.muted} fontSize={24}>
            어깨의 목표 각도
          </text>
          <text x={40} y={128} fill={flash > 0.05 ? C.red : C.text} fontSize={60} fontFamily={MONO} fontWeight={600}>
            {angle.toFixed(1)}°
          </text>
          <text x={40} y={170} fill={C.muted} fontSize={24} fontFamily={MONO}>
            step {step} · {((step * 20) / 1000).toFixed(2)} 초
          </text>
          {/* the arm: upper arm at the shoulder's angle, forearm fixed relative to it */}
          <line x1={60} x2={560} y1={sh.y} y2={sh.y} stroke={C.cardEdge} strokeWidth={3} />
          <g opacity={flash * 0.6}>
            <line x1={sh.x} y1={sh.y} x2={sh.x + 300 * Math.cos(ghost)} y2={sh.y - 300 * Math.sin(ghost)} stroke={C.muted} strokeWidth={16} strokeLinecap="round" opacity={0.5} />
          </g>
          <path
            d={`M ${sh.x + 90} ${sh.y} A 90 90 0 0 0 ${sh.x + 90 * Math.cos(th)} ${sh.y - 90 * Math.sin(th)}`}
            fill="none"
            stroke={C.accent}
            strokeWidth={3}
          />
          <line x1={sh.x} y1={sh.y} x2={elbow.x} y2={elbow.y} stroke={armColor} strokeWidth={18} strokeLinecap="round" />
          <line x1={elbow.x} y1={elbow.y} x2={hand.x} y2={hand.y} stroke={armColor} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
          <circle cx={elbow.x} cy={elbow.y} r={13} fill={C.card} stroke={armColor} strokeWidth={4} />
          <circle cx={sh.x} cy={sh.y} r={20} fill={C.card} stroke={armColor} strokeWidth={5} />
          <circle cx={elbow.x} cy={elbow.y} r={40 + 50 * (1 - flash)} fill={C.red} opacity={0.3 * flash} />
          <g opacity={prog(t, 10.8)}>
            <text x={40} y={660} fill={C.red} fontSize={26} fontWeight={600}>
              20 ms 사이에 4.0°
            </text>
            <text x={40} y={700} fill={C.text} fontSize={24}>
              평소 0.4° 의 10 배 → 팔이 튄다
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- temporal ensembling: overlapping chunks and the weighted mean ----------

const EN_COLS = ['t − 2', 't − 1', 't', 't + 1', 't + 2']
const ecx = (j: number) => 350 + j * 160
const ery = (i: number) => 90 + i * 76
const PRED = [30, 32, 35]
const W069 = [1, 0.5, 0.25]

function Ensemble() {
  const t = useSec()
  const rowIn = (i: number) => 0.8 + i * 1
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={450}>
        <svg width={1100} height={450}>
          {EN_COLS.map((c, j) => (
            <text key={c} x={ecx(j)} y={56} textAnchor="middle" fill={j === 2 ? C.accent : C.muted} fontSize={26} fontFamily={MONO} fontWeight={j === 2 ? 600 : 400}>
              {c}
            </text>
          ))}
          <g opacity={prog(t, 5.6)}>
            <rect x={ecx(2) - 84} y={74} width={168} height={ery(2) + 56 + 14 - 74} rx={12} fill={C.accent} opacity={0.07} />
            <rect x={ecx(2) - 84} y={74} width={168} height={ery(2) + 56 + 14 - 74} rx={12} fill="none" stroke={C.accent} strokeWidth={3} />
          </g>
          {[0, 1, 2].map((i) => {
            const p = prog(t, rowIn(i), 0.6)
            return (
              <g key={i} opacity={p} transform={`translate(${(1 - p) * 60} 0)`}>
                <text x={30} y={ery(i) + 36} fill={C.text} fontSize={22}>
                  <tspan fontFamily={MONO}>{EN_COLS[i]}</tspan> 에 낸 chunk
                </text>
                {[0, 1, 2].map((d) => {
                  const j = i + d
                  const atT = j === 2
                  return (
                    <g key={d}>
                      <rect x={ecx(j) - 70} y={ery(i)} width={140} height={56} rx={8} fill={C.blue} opacity={0.18} />
                      <rect x={ecx(j) - 70} y={ery(i)} width={140} height={56} rx={8} fill="none" stroke={C.blue} strokeWidth={2} opacity={0.6} />
                      {atT && (
                        <text x={ecx(j)} y={ery(i) + 38} textAnchor="middle" fill={C.text} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.4 + i * 0.4)}>
                          {PRED[i]}°
                        </text>
                      )}
                    </g>
                  )
                })}
                <circle cx={ecx(i) - 70} cy={ery(i) + 28} r={8} fill={C.accent} />
              </g>
            )
          })}
          <text x={ecx(2)} y={372} textAnchor="middle" fill={C.accent} fontSize={26} fontWeight={600} opacity={prog(t, 8)}>
            k = 3 · 시각 t 의 예측 3 개
          </text>
          <text x={550} y={424} textAnchor="middle" fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 11)}>
            같은 시각의 예측을 하나로 합치기 = <tspan fill={C.accent}>temporal ensembling</tspan>
          </text>
          <text x={30} y={424} fill={C.accent} fontSize={22} opacity={prog(t, 1.2) * (1 - prog(t, 10.6))}>
            ● 관측을 보고 chunk 를 낸 시각
          </text>
        </svg>
      </Panel>
      <Panel x={1200} y={140} w={656} h={450}>
        <svg width={656} height={450}>
          <g opacity={prog(t, 15.5)}>
            <text x={32} y={60} fill={C.accent} fontSize={34} fontFamily={MONO} fontWeight={600}>
              w_i = exp(−m · i)
            </text>
            <text x={32} y={98} fill={C.muted} fontSize={22}>
              i = 0 이 가장 오래된 예측, 최근일수록 i 가 크다
            </text>
            <text x={32} y={136} fill={C.text} fontSize={24}>
              가중 평균 = Σ (w × 예측) ÷ Σ w
            </text>
          </g>
          <text x={624} y={60} textAnchor="end" fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21.2)}>
            m = 0.69
          </text>
          {W069.map((w, i) => {
            const at = 21.8 + i * 0.9
            const h = 170 * w * prog(t, at, 0.7)
            const x = 140 + i * 190
            return (
              <g key={i} opacity={t >= at ? 1 : 0}>
                <rect x={x - 45} y={360 - h} width={90} height={h} rx={6} fill={C.orange} opacity={0.85} />
                <text x={x} y={360 - h - 12} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.5)}>
                  w = {w}
                </text>
                <text x={x} y={390} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  i = {i}
                </text>
                <text x={x} y={424} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
                  {PRED[i]}°
                </text>
              </g>
            )
          })}
          <line x1={40} x2={616} y1={360} y2={360} stroke={C.muted} strokeWidth={2} opacity={prog(t, 21.6)} />
        </svg>
      </Panel>
      <Appear at={26.2} style={{ position: 'absolute', left: 64, top: 620, width: 1792 }}>
        <div style={{ height: 250, padding: '30px 40px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'grid', gap: 16, width: 1100 }}>
            <span style={{ fontFamily: MONO, fontSize: 30, color: C.text }}>a_t = (1 × 30 + 0.5 × 32 + 0.25 × 35) ÷ (1 + 0.5 + 0.25)</span>
            <span style={{ fontFamily: MONO, fontSize: 42, fontWeight: 600, color: C.accent, opacity: prog(t, 27.2) }}>= 54.75 ÷ 1.75 ≈ 31.29°</span>
          </div>
          <NumberLine t={t} />
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

function NumberLine({ t }: { t: number }) {
  const nx = (v: number) => 30 + ((v - 29) / 7) * 500
  return (
    <svg width={560} height={190}>
      <line x1={20} x2={540} y1={100} y2={100} stroke={C.muted} strokeWidth={2} />
      {PRED.map((v) => (
        <g key={v}>
          <circle cx={nx(v)} cy={100} r={9} fill={C.blue} />
          <text x={nx(v)} y={140} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
            {v}°
          </text>
        </g>
      ))}
      <g opacity={prog(t, 27.6)}>
        <path d={`M ${nx(31.29) - 12} 66 L ${nx(31.29) + 12} 66 L ${nx(31.29)} 88 Z`} fill={C.accent} />
        <text x={nx(31.29)} y={52} textAnchor="middle" fill={C.accent} fontSize={24} fontWeight={600}>
          실행 31.29°
        </text>
        <text x={nx(31.29)} y={176} textAnchor="middle" fill={C.dim} fontSize={20}>
          가장 오래된 30° 쪽에 가깝다
        </text>
      </g>
    </svg>
  )
}

// ---------- temporal ensembling: m, the misconception, the cost ----------

function WeightGroup({ x, m, ws, labels, result, extra, at }: { x: number; m: string; ws: number[]; labels: string[]; result: string; extra?: string; at: number }) {
  const t = useSec()
  return (
    <g transform={`translate(${x} 0)`} opacity={prog(t, at)}>
      <text x={0} y={52} fill={C.orange} fontSize={28} fontFamily={MONO} fontWeight={600}>
        m = {m}
      </text>
      <line x1={0} x2={380} y1={290} y2={290} stroke={C.muted} strokeWidth={2} />
      {ws.map((w, i) => {
        const h = 170 * w * prog(t, at + 0.3 + i * 0.3, 0.6)
        const cx = 65 + i * 125
        return (
          <g key={i}>
            <rect x={cx - 38} y={290 - h} width={76} height={h} rx={6} fill={C.orange} opacity={0.85} />
            <text x={cx} y={290 - h - 12} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              {labels[i]}
            </text>
            <text x={cx} y={322} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
              {PRED[i]}°
            </text>
          </g>
        )
      })}
      <text x={0} y={354} fill={C.dim} fontSize={20}>
        오래된 예측 → 최근 예측
      </text>
      <text x={0} y={394} fill={C.accent} fontSize={28} fontWeight={600}>
        결과 <tspan fontFamily={MONO}>{result}</tspan>
      </text>
      {extra && (
        <text x={0} y={426} fill={C.muted} fontSize={22}>
          {extra}
        </text>
      )}
    </g>
  )
}

function Weights() {
  const t = useSec()
  const code = (s: string) => <span style={{ fontFamily: MONO, fontSize: 23 }}>{s}</span>
  const cards: { at: number; color: string; title: string; lines: [ReactNode, number][] }[] = [
    { at: 12, color: C.green, title: '얻는 것', lines: [['chunk 경계의 튐이 사라진다', 12], ['논문: 성공률 3.3% 높아짐', 17.8]] },
    { at: 13.2, color: C.red, title: '잃는 것', lines: [['step 마다 추론 → 20 ms 안에 끝나야 한다', 13.2], ['앞에서 늘린 2 초 시한을 포기', 14.4]] },
    {
      at: 18.6,
      color: C.muted,
      title: 'LeRobot 기본값: 꺼 둠',
      lines: [
        [code('temporal_ensemble_coeff = None'), 18.6],
        [<>켤 때는 {code('n_action_steps = 1')}</>, 19.4],
      ],
    },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={450}>
        <svg width={900} height={450}>
          <WeightGroup x={40} m="0.69" ws={W069} labels={['1', '0.5', '0.25']} result="31.29°" at={0.3} />
          <WeightGroup x={480} m="0.01 (공개 코드)" ws={[1, 0.99, 0.98]} labels={['1', '0.99', '0.98']} result="32.32°" extra="보통 평균은 32.33°" at={1.4} />
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: 1000, top: 150, width: 856 }}>
        <Misconception at={6.4} belief="가장 최근의 관측을 보고 낸 예측이 가장 큰 weight 를 받는다" fact="ACT 의 식에서는 w₀ = 1 인 가장 오래된 예측이 가장 큰 weight 를 받는다" />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 620, width: 1792, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {cards.map((c) => (
          <Appear key={c.title} at={c.at}>
            <div style={{ height: 250, padding: '22px 26px', borderRadius: 18, background: C.card, border: `1.5px solid ${c.color}66`, display: 'grid', alignContent: 'start', gap: 14 }}>
              <Label color={c.color} size={28} weight={700}>
                {c.title}
              </Label>
              {c.lines.map(([line, at]) => (
                <Label key={at} color={C.text} size={25} style={{ lineHeight: 1.45, opacity: prog(t, at), textWrap: 'balance' }}>
                  {line}
                </Label>
              ))}
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Answer() {
  const items = [
    { tag: 'action chunking', color: C.orange, text: '관측 한 번에 action 100 개 · 멈춤도 그 뒤 움직임과 한 묶음으로', at: 1 },
    { tag: 'compounding error', color: C.red, text: '결정 400 번 → 4 번 · 평균 성공률 1% → 44%', at: 3.2 },
    { tag: '추론 시한', color: C.blue, text: '20 ms → 2 초 · 대신 open-loop 구간이 길어진다', at: 7.8 },
    { tag: 'temporal ensembling', color: C.green, text: '겹친 예측의 가중 평균으로 chunk 경계의 튐을 없앤다', at: 10.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1500 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            시연은 그대로 두고 출력의 모양만 바꿔서 실패를 줄일 수 있을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 36, fontWeight: 600 }}>{it.text}</span>
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
            NEXT · SESSION 4
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600 }}>Real Robot</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={36}>
            학습한 policy 를 실물 팔에서 돌리고 성공률로 평가하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: woolimi/robotics-roadmap · CC BY-NC-SA 4.0
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseHorizon = () => (
  <PauseWrite
    question="T = 200, ε = 0.01 일 때 k = 1 과 k = 20 의 결정 횟수 H 와 H²ε 은 각각?"
    answer={
      <>
        k = 1 → H = 200, H²ε = 400 · k = 20 → H = 10, H²ε = 1
        <br />
        결정은 20 분의 1, H²ε 은 400 분의 1
      </>
    }
  />
)

const PauseDeadline = () => (
  <PauseWrite
    question="50 Hz 로봇에서 추론 한 번에 300 ms 가 걸린다. 명령을 기다리지 않으려면 k 는 최소 얼마?"
    answer="chunk 길이 k × 20 ms 가 추론 300 ms 이상이어야 하므로 k ≥ 300 ÷ 20 = 15, 최소 15"
  />
)

const PauseEnsemble = () => (
  <PauseWrite
    question="m = 0.69 이고 시각 t 의 세 예측이 오래된 것부터 40°, 44°, 44° 일 때 실행할 각도는?"
    answer="weight 1, 0.5, 0.25 → (40 + 22 + 11) ÷ 1.75 = 73 ÷ 1.75 ≈ 41.71°"
  />
)

export function Act() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        chunking: Chunking,
        execute: Execute,
        horizon: Horizon,
        'pause-horizon': PauseHorizon,
        timing: Timing,
        'open-loop': OpenLoop,
        'pause-deadline': PauseDeadline,
        jump: Jump,
        ensemble: Ensemble,
        weights: Weights,
        'pause-ensemble': PauseEnsemble,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
