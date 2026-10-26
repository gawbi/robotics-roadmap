import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './real-robot.narration.json'
import { script } from './real-robot.script'

// ---------- shared numbers (lessons/real-robot/README.md) ----------

/** ACT's 25 trials in the order they were run: 20 successes and 5 failures (which ones failed is only for the picture) */
const FAILED = new Set([3, 8, 14, 17, 22])
const TRIALS = Array.from({ length: 25 }, (_, i) => !FAILED.has(i))

/** the 70% policy tried in five batches of 10 */
const BATCHES = [7, 9, 6, 8, 5]

/** 80% over 10, 25, 100 and 400 trials, with its Wilson 95% interval in % */
const WILSON_80 = [
  { n: 10, k: 8, lo: 49, hi: 94 },
  { n: 25, k: 20, lo: 61, hi: 91 },
  { n: 100, k: 80, lo: 71, hi: 87 },
  { n: 400, k: 320, lo: 76, hi: 84 },
]

/** the failure types of ACT's 5 failed trials */
const FAILURES = [
  { name: '접근 빗나감', n: 2, color: C.red, text: '집게가 큐브 옆 몇 cm 자리로 내려간다' },
  { name: '쥐기 실패', n: 1, color: C.orange, text: '쥐었다가 들어 올리는 중에 미끄러진다' },
  { name: '놓기 빗나감', n: 1, color: C.purple, text: '상자 가장자리에 걸친다' },
  { name: '멈춤·떨림', n: 1, color: C.blue, text: '중간에 멈추거나 같은 자리에서 떤다' },
]

function Intro() {
  const t = useSec()
  const chips = script.sections
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 26, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 4 · IMITATION LEARNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.03em' }}>Real Robot</div>
        </Appear>
        <Appear at={1.1}>
          <Label color={C.muted} size={40}>
            실물 팔에서 성공률을 믿을 만하게 재고 읽는 네 가지 방법
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
          {chips.map((c, i) => (
            <Appear key={c} at={2 + i * 0.45}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 26px',
                  borderRadius: 999,
                  border: `1.5px solid ${C.cardEdge}`,
                  background: C.card,
                  fontSize: 30,
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
  const D = 28
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50, marginTop: -40 }}>
        <Appear at={0.3}>
          <div style={{ fontSize: 76, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            25 번 중 20 번 성공한 policy
            <br />
            <span style={{ color: C.accent }}>성공률 80% 라고만 적으면 될까?</span>
          </div>
        </Appear>
        <Appear at={1.6}>
          <Panel x={0} y={0} w={1000} h={250} style={{ position: 'relative' }}>
            <div style={{ padding: '22px 30px', display: 'flex', justifyContent: 'space-between' }}>
              <Label size={26}>실물 팔 · trial 25 번</Label>
              <Label size={26} style={{ opacity: prog(t, 4.6) }}>
                <span style={{ color: C.green }}>● 성공 20</span>
                <span style={{ color: C.red, marginLeft: 22 }}>● 실패 5</span>
              </Label>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 92, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {TRIALS.map((ok, i) => {
                const p = prog(t, 1.9 + i * 0.1, 0.3)
                return <div key={i} style={{ width: D, height: D, borderRadius: D / 2, background: ok ? C.green : C.red, opacity: p, transform: `scale(${0.5 + 0.5 * p})` }} />
              })}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 152, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 20, opacity: prog(t, 4.6) }}>
              <Label mono color={C.text} size={48} weight={600}>
                20 ÷ 25 = 80%
              </Label>
              <span style={{ color: C.accent, fontSize: 56, fontWeight: 700, opacity: prog(t, 5.4) }}>?</span>
            </div>
          </Panel>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- 성공률과 신뢰 구간: trials ----------

const fillAt = (i: number) => 10.7 + i * 0.12

function Trials() {
  const t = useSec()
  const cell = 62
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <div style={{ position: 'absolute', left: 30, top: 26 }}>
          <Label color={C.text} size={30} weight={600}>
            ACT · 실물 팔의 trial
          </Label>
        </div>
        <Appear at={0.5} style={{ position: 'absolute', left: 30, top: 86, width: 800 }}>
          <div style={{ fontSize: 28, lineHeight: 1.45 }}>
            <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600, fontSize: 32 }}>trial</span>
            <span style={{ color: C.muted }}> = </span>물체를 처음 자리에 놓고 policy 를 끝까지 실행해 보는 한 번
          </div>
        </Appear>
        <Appear at={5.7} style={{ position: 'absolute', left: 30, top: 190, width: 800 }}>
          <div style={{ padding: '16px 24px', borderRadius: 16, background: `${C.accent}10`, border: `1.5px solid ${C.accent}55`, display: 'grid', gap: 6 }}>
            <Label color={C.accent} size={22} weight={600}>
              성공 기준 · 시도 전에 문장으로 정해 둔다
            </Label>
            <Label color={C.text} size={28} style={{ lineHeight: 1.4 }}>
              큐브가 상자 바닥에 닿아 있고 팔이 처음 자세로 돌아왔다
            </Label>
          </div>
        </Appear>
        <div style={{ position: 'absolute', left: 30, top: 360, display: 'grid', gridTemplateColumns: `repeat(5, ${cell}px)`, gap: 10 }}>
          {TRIALS.map((ok, i) => {
            const p = prog(t, fillAt(i), 0.3)
            const color = ok ? C.green : C.red
            return (
              <div
                key={i}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: p > 0 ? `color-mix(in srgb, ${color} ${Math.round(22 * p)}%, ${C.grid})` : C.grid,
                  border: `1.5px solid ${p > 0 ? `${color}88` : C.cardEdge}`,
                  color,
                  fontSize: 30,
                  fontWeight: 700,
                  opacity: prog(t, 9.8 + i * 0.02, 0.4),
                }}
              >
                <span style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>{ok ? '✓' : '✕'}</span>
              </div>
            )
          })}
        </div>
        <Appear at={fillAt(24) + 0.4} style={{ position: 'absolute', left: 430, top: 380, width: 400, display: 'grid', gap: 14 }}>
          <Label size={28}>
            <span style={{ color: C.green }}>성공 20</span> · <span style={{ color: C.red }}>실패 5</span>
          </Label>
          <Label mono color={C.text} size={44} weight={600}>
            p̂ = 20 ÷ 25
          </Label>
          <Label mono color={C.accent} size={44} weight={600}>
            = 0.8 (80%)
          </Label>
          <Label color={C.muted} size={22} style={{ lineHeight: 1.5, marginTop: 6 }}>
            p̂ (p 햇): 끝없이 시도했을 때의 참 성공률을 몇 번의 시도로 어림한 값
          </Label>
        </Appear>
      </Panel>
      <Appear at={15} style={{ position: 'absolute', left: 964, top: 140 }}>
        <Panel x={0} y={0} w={892} h={740} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 30, top: 26, width: 830, display: 'grid', gap: 14 }}>
            <Label color={C.text} size={30} weight={600}>
              같은 policy 라도 결과가 흔들린다
            </Label>
            <Label color={C.muted} size={26} style={{ lineHeight: 1.45 }}>
              시도마다 큐브가 몇 mm 다르게 놓이고, 사진 밝기도 조금씩 다르다
            </Label>
          </div>
          <Appear at={19.6} style={{ position: 'absolute', left: 30, top: 186 }}>
            <Label color={C.text} size={28}>
              참 성공률 70% 인 policy · 10 번씩 다섯 묶음
            </Label>
          </Appear>
          <BatchChart t={t} />
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

function BatchChart({ t }: { t: number }) {
  const base = 420
  const unit = 30 // px per success
  const bx = (i: number) => 140 + i * 140
  const yAt = (n: number) => base - n * unit
  return (
    <svg width={892} height={500} style={{ position: 'absolute', left: 0, top: 236 }}>
      <g opacity={prog(t, 19.6)}>
        <line x1={70} x2={760} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
        {[0, 5, 10].map((n) => (
          <text key={n} x={58} y={yAt(n) + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
            {n}
          </text>
        ))}
        <line x1={70} x2={760} y1={yAt(10)} y2={yAt(10)} stroke={C.grid} strokeWidth={2} />
        <line x1={70} x2={760} y1={yAt(7)} y2={yAt(7)} stroke={C.orange} strokeWidth={3} strokeDasharray="12 10" />
        <text x={772} y={yAt(7) + 8} fill={C.orange} fontSize={24} fontWeight={600}>
          참 70%
        </text>
      </g>
      {BATCHES.map((n, i) => {
        const p = prog(t, 20 + i * 0.45, 0.6)
        const h = n * unit * p
        return (
          <g key={i}>
            <rect x={bx(i) - 42} y={base - h} width={84} height={h} rx={6} fill={C.blue} opacity={0.85} />
            <text x={bx(i)} y={base - n * unit + 42} textAnchor="middle" fill={C.bg} fontSize={32} fontWeight={700} fontFamily={MONO} opacity={prog(t, 20.4 + i * 0.45)}>
              {n}
            </text>
            <text x={bx(i)} y={base + 38} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 19.8)}>
              묶음 {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------- 성공률과 신뢰 구간: the interval narrows with n ----------

const IV = { x0: 400, x1: 1600, lo: 40, hi: 100 }
const ix = (p: number) => IV.x0 + ((p - IV.lo) / (IV.hi - IV.lo)) * (IV.x1 - IV.x0)

/** a confidence interval drawn as a bar that grows out of its estimate */
function IBar({ y, mid, lo, hi, grow, color, nums, x }: { y: number; mid: number; lo: number; hi: number; grow: number; color: string; nums: number; x: (p: number) => number }) {
  const a = x(lerp(mid, lo, grow))
  const b = x(lerp(mid, hi, grow))
  return (
    <g opacity={grow > 0 ? 1 : 0}>
      <rect x={a} y={y - 16} width={Math.max(0, b - a)} height={32} rx={6} fill={color} opacity={0.72} />
      <circle cx={x(mid)} cy={y} r={8} fill={C.orange} stroke={C.card} strokeWidth={3} />
      <g opacity={nums}>
        <text x={x(lo) - 12} y={y + 9} textAnchor="end" fill={color} fontSize={26} fontFamily={MONO} fontWeight={600}>
          {lo}%
        </text>
        <text x={x(hi) + 12} y={y + 9} fill={color} fontSize={26} fontFamily={MONO} fontWeight={600}>
          {hi}%
        </text>
      </g>
    </g>
  )
}

function Interval() {
  const t = useSec()
  const rowY = [190, 280, 370, 460]
  const rowAt = [12.2, 1.4, 14.4, 16.6]
  const numsAt = [12.9, 6.8, 15.1, 17.3]
  const quad = prog(t, 19.2)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740}>
          <text x={40} y={58} fill={C.text} fontSize={30} fontWeight={600} opacity={prog(t, 0.3)}>
            95% 신뢰 구간 · 어림한 성공률 80%
          </text>
          <text x={1752} y={58} textAnchor="end" fill={C.muted} fontSize={24} opacity={prog(t, 2.2)}>
            이렇게 만든 범위가 참값을 100 번 중 약 95 번 덮는다
          </text>
          <text x={40} y={100} fill={C.accent} fontSize={24} opacity={prog(t, 6.8)}>
            Wilson 구간 · 시도가 적어도 0 과 1 사이에 머문다
          </text>
          {/* grid and axis */}
          <g opacity={prog(t, 0.6)}>
            {[40, 50, 60, 70, 80, 90, 100].map((p) => (
              <g key={p}>
                <line x1={ix(p)} x2={ix(p)} y1={145} y2={630} stroke={C.grid} strokeWidth={2} />
                <text x={ix(p)} y={666} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO}>
                  {p}%
                </text>
              </g>
            ))}
            <line x1={ix(40)} x2={ix(100)} y1={630} y2={630} stroke={C.muted} strokeWidth={2} />
            <line x1={ix(80)} x2={ix(80)} y1={150} y2={500} stroke={C.orange} strokeWidth={2.5} strokeDasharray="10 8" />
            <text x={ix(80)} y={138} textAnchor="middle" fill={C.orange} fontSize={24}>
              어림한 성공률 80%
            </text>
          </g>
          {WILSON_80.map((r, i) => {
            const grow = prog(t, rowAt[i] + 0.4, 1.2)
            const lit = i > 0 && quad > 0
            return (
              <g key={r.n}>
                <text x={350} y={rowY[i] + 9} textAnchor="end" fill={C.text} fontSize={28} opacity={prog(t, rowAt[i])}>
                  {r.n} 번 ({r.k} 성공)
                </text>
                <IBar y={rowY[i]} mid={80} lo={r.lo} hi={r.hi} grow={grow} color={C.blue} nums={prog(t, numsAt[i])} x={ix} />
                <text x={ix(r.hi) + 92} y={rowY[i] + 9} fill={lit ? C.accent : C.muted} fontSize={24} fontFamily={MONO} fontWeight={lit ? 600 : 400} opacity={prog(t, Math.max(numsAt[i] + 0.4, 19.2))}>
                  폭 {r.hi - r.lo}
                </text>
              </g>
            )
          })}
          {/* 25 out of 25 */}
          <line x1={40} x2={1752} y1={515} y2={515} stroke={C.cardEdge} strokeWidth={1.5} opacity={prog(t, 24.6)} />
          <text x={350} y={579} textAnchor="end" fill={C.green} fontSize={28} opacity={prog(t, 24.6)}>
            25 번 (25 성공)
          </text>
          <IBar y={570} mid={100} lo={87} hi={100} grow={prog(t, 24.8, 0.9)} color={C.green} nums={prog(t, 25.2)} x={ix} />
          <text x={ix(40) + 12} y={579} fill={C.green} fontSize={26} fontWeight={600} opacity={prog(t, 25.6)}>
            모두 성공해도 참 성공률은 87% 까지 낮을 수 있다
          </text>
          {/* ×4 trials → half the width */}
          <g opacity={quad}>
            <text x={40} y={718} fill={C.accent} fontSize={28} fontWeight={600}>
              시도 × 4 → 폭 약 ½
            </text>
            <text x={330} y={718} fill={C.muted} fontSize={26} fontFamily={MONO}>
              25 → 100 → 400 번 : 폭 30 → 16 → 8
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- 두 policy 의 비교: overlapping intervals ----------

const CXS = { x0: 380, x1: 1620, lo: 30, hi: 100 }
const cxp = (p: number) => CXS.x0 + ((p - CXS.lo) / (CXS.hi - CXS.lo)) * (CXS.x1 - CXS.x0)

const CMP = [
  { name: 'ACT', color: C.blue, p: 80, few: [61, 91], many: [71, 87], k25: '20 / 25', k100: '80 / 100', y: 200 },
  { name: 'B', color: C.orange, p: 60, few: [41, 77], many: [50, 69], k25: '15 / 25', k100: '60 / 100', y: 320 },
]

function Compare() {
  const t = useSec()
  const m = prog(t, 16.9, 1.6)
  const before = 1 - prog(t, 16.6, 0.4)
  const after = prog(t, 18.6)
  const overlap = prog(t, 6.2) * before
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={520}>
        <svg width={1792} height={520}>
          <text x={40} y={58} fill={C.text} fontSize={30} fontWeight={600} opacity={prog(t, 0.3)}>
            두 policy 의 Wilson 95% 구간
          </text>
          <text x={1752} y={58} textAnchor="end" fill={C.accent} fontSize={30} fontWeight={600} opacity={prog(t, 0.6) * before}>
            시도 25 번씩
          </text>
          <text x={1752} y={58} textAnchor="end" fill={C.accent} fontSize={30} fontWeight={600} opacity={after}>
            시도 100 번씩
          </text>
          {[30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
            <g key={p} opacity={prog(t, 0.6)}>
              <line x1={cxp(p)} x2={cxp(p)} y1={150} y2={450} stroke={C.grid} strokeWidth={2} />
              <text x={cxp(p)} y={486} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO}>
                {p}%
              </text>
            </g>
          ))}
          <line x1={cxp(30)} x2={cxp(100)} y1={450} y2={450} stroke={C.muted} strokeWidth={2} opacity={prog(t, 0.6)} />
          {/* the overlap at 25 trials each */}
          <rect x={cxp(61)} y={150} width={cxp(77) - cxp(61)} height={220} fill={C.red} opacity={0.16 * overlap} />
          <text x={(cxp(61) + cxp(77)) / 2} y={136} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={600} opacity={overlap}>
            61% ~ 77% 겹침
          </text>
          <g opacity={prog(t, 11.8) * before}>
            <line x1={cxp(70)} x2={cxp(70)} y1={150} y2={370} stroke={C.text} strokeWidth={3} strokeDasharray="10 8" />
            <text x={cxp(70)} y={410} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              둘 다 참 성공률 70% 일 수도
            </text>
          </g>
          {/* the gap at 100 trials each */}
          <g opacity={prog(t, 19.2)}>
            <rect x={cxp(69)} y={150} width={cxp(71) - cxp(69)} height={220} fill={C.green} opacity={0.22} />
            <text x={cxp(70)} y={136} textAnchor="middle" fill={C.green} fontSize={26} fontWeight={600}>
              69% 와 71% 사이 · 겹치지 않는다
            </text>
          </g>
          {CMP.map((r) => {
            const lo = lerp(r.few[0], r.many[0], m)
            const hi = lerp(r.few[1], r.many[1], m)
            return (
              <g key={r.name} opacity={prog(t, r.name === 'ACT' ? 0.6 : 1.8)}>
                <text x={330} y={r.y + 4} textAnchor="end" fill={r.color} fontSize={36} fontWeight={600} fontFamily={MONO}>
                  {r.name}
                </text>
                <text x={330} y={r.y + 38} textAnchor="end" fill={C.muted} fontSize={24} fontFamily={MONO} opacity={before}>
                  {r.k25} · {r.p}%
                </text>
                <text x={330} y={r.y + 38} textAnchor="end" fill={C.muted} fontSize={24} fontFamily={MONO} opacity={after}>
                  {r.k100} · {r.p}%
                </text>
                <IBar y={r.y} mid={r.p} lo={lo} hi={hi} grow={prog(t, 5.8, 1)} color={r.color} nums={0} x={cxp} />
                <g opacity={prog(t, 6.6) * before}>
                  <text x={cxp(r.few[0]) - 12} y={r.y + 9} textAnchor="end" fill={r.color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {r.few[0]}%
                  </text>
                  <text x={cxp(r.few[1]) + 12} y={r.y + 9} fill={r.color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {r.few[1]}%
                  </text>
                </g>
                <g opacity={after}>
                  <text x={cxp(r.many[0]) - 12} y={r.y + 9} textAnchor="end" fill={r.color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {r.many[0]}%
                  </text>
                  <text x={cxp(r.many[1]) + 12} y={r.y + 9} fill={r.color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                    {r.many[1]}%
                  </text>
                </g>
                {/* before the intervals: just the two estimates */}
                <circle cx={cxp(r.p)} cy={r.y} r={9} fill={C.orange} stroke={C.card} strokeWidth={3} opacity={1 - prog(t, 5.8, 0.2)} />
              </g>
            )
          })}
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 690, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <ResultCard at={12} color={C.red} tag="25 번씩" text="구간이 61% ~ 77% 에서 겹친다 → ACT 가 낫다고 단정하기 어렵다" />
        <ResultCard at={22.2} color={C.green} tag="100 번씩" text="71% ~ 87% 와 50% ~ 69%, 겹치지 않는다 → ACT 가 낫다" />
      </div>
    </AbsoluteFill>
  )
}

function ResultCard({ at, color, tag, text }: { at: number; color: string; tag: string; text: string }) {
  return (
    <Appear at={at}>
      <div style={{ height: 176, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 18, background: `${color}12`, border: `1.5px solid ${color}66`, display: 'grid', alignContent: 'start', gap: 8 }}>
        <Label mono color={color} size={24} weight={600}>
          {tag}
        </Label>
        <Label color={C.text} size={32} weight={600} style={{ lineHeight: 1.4, textWrap: 'balance' }}>
          {text}
        </Label>
      </div>
    </Appear>
  )
}

// ---------- 두 policy 의 비교: the trial protocol ----------

function Protocol() {
  const t = useSec()
  const W = 60
  const G = 9
  const x0 = (1792 - (25 * W + 24 * G)) / 2
  const letter = (s: string) => ({ color: s === 'A' ? C.blue : C.orange })
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={400}>
        <div style={{ position: 'absolute', left: x0, top: 26 }}>
          <Appear at={0.3}>
            <Label color={C.text} size={30} weight={600}>
              처음 배치 25 개 · 미리 정해 사진으로 남긴다
            </Label>
          </Appear>
        </div>
        {Array.from({ length: 25 }, (_, i) => {
          const order = i % 2 === 0 ? ['A', 'B'] : ['B', 'A']
          // where the cube sits in this placement's photo: only to show that every placement differs
          const cx = 8 + ((i * 37) % 33)
          const cy = 8 + ((i * 53) % 31)
          const p = prog(t, 0.9 + i * 0.1, 0.4)
          const o = prog(t, 6.4 + i * 0.12, 0.35)
          return (
            <div key={i} style={{ position: 'absolute', left: x0 + i * (W + G), top: 88, width: W, display: 'grid', justifyItems: 'center', gap: 8, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
              <Label mono color={C.muted} size={20}>
                {i + 1}
              </Label>
              <div style={{ position: 'relative', width: W, height: W, borderRadius: 8, background: C.grid, border: `1.5px solid ${C.cardEdge}` }}>
                <div style={{ position: 'absolute', left: cx, top: cy, width: 13, height: 13, borderRadius: 3, background: C.orange }} />
              </div>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 2, opacity: o, fontFamily: MONO, fontSize: 30, fontWeight: 600, lineHeight: '36px' }}>
                <span style={letter(order[0])}>{order[0]}</span>
                <span style={{ ...letter(order[1]), opacity: 0.55 }}>{order[1]}</span>
              </div>
            </div>
          )
        })}
        <Appear at={6.2} style={{ position: 'absolute', left: x0, top: 290 }}>
          <Label color={C.muted} size={24}>
            <span style={{ color: C.blue, fontFamily: MONO, fontWeight: 600 }}>A</span>, <span style={{ color: C.orange, fontFamily: MONO, fontWeight: 600 }}>B</span> : 비교하는 두 policy · 위쪽이 먼저, 배치마다 순서를 번갈아 바꾼다
          </Label>
        </Appear>
        <Appear at={12} style={{ position: 'absolute', left: x0, top: 334 }}>
          <Label color={C.text} size={28} weight={600}>
            자리 운 · 시간에 따라 바뀌는 조명 · servo 의 열 <span style={{ color: C.accent }}>→ 두 policy 에 고르게 나뉜다</span>
          </Label>
        </Appear>
      </Panel>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 572 }}>
        <Misconception
          at={16.4}
          belief="80% 와 60% 처럼 20%p 나 차이 나면 당연히 앞의 것이 낫다"
          fact="%p 는 두 백분율의 차이다. 시도가 적으면 우연일 수 있어서, 성공률과 함께 구간과 시도 횟수를 적는다"
        />
      </div>
    </AbsoluteFill>
  )
}

// ---------- 실패 분석: failure types and stages ----------

function Failures() {
  const t = useSec()
  const bx0 = 40
  const unit = 1020 / 25
  const rowY = [272, 362, 452, 542]
  let seg = bx0 + 20 * unit
  const segs = FAILURES.flatMap((f, j) =>
    Array.from({ length: f.n }, () => {
      const x = seg
      seg += unit
      return { x, color: f.color, j }
    }),
  )
  const hl = prog(t, 12.2)
  const stages = [
    { name: '첫 단계', v: 92 },
    { name: '둘째 단계', v: 40 },
    { name: '최종', v: 20 },
  ]
  const sBase = 560
  const sH = 4 // px per %
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={bx0} y={56} fill={C.text} fontSize={30} fontWeight={600} opacity={prog(t, 0.3)}>
            ACT 25 번 시도의 결과
          </text>
          <rect x={bx0} y={88} width={20 * unit * prog(t, 0.7, 1.3) - 2} height={60} rx={6} fill={C.green} opacity={0.82} />
          <text x={bx0 + 10 * unit} y={128} textAnchor="middle" fill={C.bg} fontSize={28} fontWeight={700} opacity={prog(t, 1.8)}>
            성공 20
          </text>
          {segs.map((s, i) => (
            <rect key={i} x={s.x + 2} y={88} width={unit - 4} height={60} rx={6} fill={s.color} opacity={0.88 * prog(t, 2.2 + i * 0.25, 0.4)} />
          ))}
          <text x={bx0 + 22.5 * unit} y={184} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 3.4)}>
            실패 5
          </text>
          {/* the failures by type */}
          <rect x={18} y={rowY[0] - 36} width={1064} height={72} rx={14} fill={C.red} opacity={0.1 * hl} stroke={C.red} strokeOpacity={0.6 * hl} strokeWidth={2} />
          {FAILURES.map((f, j) => {
            const p = prog(t, 5.8 + j * 1.3)
            return (
              <g key={f.name} opacity={p}>
                <text x={220} y={rowY[j] + 10} textAnchor="end" fill={C.text} fontSize={30} fontWeight={600}>
                  {f.name}
                </text>
                <rect x={240} y={rowY[j] - 18} width={f.n * 80 * prog(t, 6 + j * 1.3, 0.6)} height={36} rx={6} fill={f.color} opacity={0.88} />
                <text x={240 + f.n * 80 + 14} y={rowY[j] + 11} fill={f.color} fontSize={32} fontWeight={600} fontFamily={MONO}>
                  {f.n}
                </text>
                <text x={460} y={rowY[j] + 9} fill={C.muted} fontSize={26}>
                  {f.text}
                </text>
              </g>
            )
          })}
        </svg>
        <Appear at={13} style={{ position: 'absolute', left: 40, right: 40, top: 610 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <Label color={C.red} size={28} weight={600}>
              접근 빗나감 2 번 모두 책상 오른쪽 끝 배치
            </Label>
            <Label color={C.text} size={28}>
              → 동작을 잘못 배웠다기보다 <span style={{ color: C.accent }}>그 자리의 시연이 모자랐을 가능성</span>이 크다
            </Label>
          </div>
        </Appear>
      </Panel>
      <Appear at={18.2} style={{ position: 'absolute', left: 1204, top: 140 }}>
        <Panel x={0} y={0} w={652} h={740} style={{ position: 'relative' }}>
          <svg width={652} height={740}>
            <text x={34} y={56} fill={C.text} fontSize={30} fontWeight={600}>
              단계별 성공률
            </text>
            <text x={34} y={94} fill={C.muted} fontSize={24}>
              ACT 논문 · Thread Velcro 과제
            </text>
            <line x1={40} x2={612} y1={sBase} y2={sBase} stroke={C.muted} strokeWidth={2} />
            {stages.map((s, i) => {
              const x = 130 + i * 196
              const h = s.v * sH * prog(t, 18.6 + i * 0.7, 0.7)
              return (
                <g key={s.name}>
                  <rect x={x - 60} y={sBase - h} width={120} height={h} rx={8} fill={C.accent} opacity={0.75} />
                  <text x={x} y={sBase - s.v * sH - 16} textAnchor="middle" fill={C.text} fontSize={34} fontWeight={600} fontFamily={MONO} opacity={prog(t, 19 + i * 0.7)}>
                    {s.v}%
                  </text>
                  <text x={x} y={sBase + 40} textAnchor="middle" fill={C.muted} fontSize={24}>
                    {s.name}
                  </text>
                </g>
              )
            })}
            <text x={326} y={sBase + 120} textAnchor="middle" fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 21)}>
              단계마다 대략 절반씩 줄어든다
            </text>
          </svg>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- 실패 분석: telling two kinds of shaking apart ----------

const PLOT_W = 880
const PX0 = 70
const PX1 = 830

function ChunkPlot({ t }: { t: number }) {
  const n = 5
  const cw = (PX1 - PX0) / n
  const off = [0, 40, 0, 40, 0]
  const yAt = (x: number, k: number) => 140 - 62 * Math.sin((x - PX0) / 230) + off[k]
  let d = ''
  for (let k = 0; k < n; k++) {
    for (let s = 0; s <= 24; s++) {
      const x = PX0 + k * cw + (s / 24) * cw
      d += `${d ? 'L' : 'M'} ${x.toFixed(1)} ${yAt(x, k).toFixed(1)} `
    }
  }
  const draw = prog(t, 6, 3)
  return (
    <svg width={PLOT_W} height={300} style={{ position: 'absolute', left: 0, top: 170 }}>
      <text x={PX0} y={20} fill={C.muted} fontSize={22}>
        보낸 목표 각도
      </text>
      <line x1={PX0} x2={PX0} y1={34} y2={270} stroke={C.muted} strokeWidth={2} />
      <line x1={PX0} x2={PX1} y1={270} y2={270} stroke={C.muted} strokeWidth={2} />
      <text x={PX1} y={298} textAnchor="end" fill={C.muted} fontSize={22}>
        tick →
      </text>
      {[1, 2, 3, 4].map((k) => (
        <line key={k} x1={PX0 + k * cw} x2={PX0 + k * cw} y1={34} y2={270} stroke={C.dim} strokeWidth={2} strokeDasharray="6 8" opacity={prog(t, 6.2)} />
      ))}
      <text x={PX0 + 2 * cw} y={20} textAnchor="middle" fill={C.dim} fontSize={22} opacity={prog(t, 6.2)}>
        chunk 경계
      </text>
      <path d={d} fill="none" stroke={C.blue} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {[1, 2, 3, 4].map((k) => {
        const x = PX0 + k * cw
        return <circle key={k} cx={x} cy={(yAt(x, k - 1) + yAt(x, k)) / 2} r={26} fill="none" stroke={C.red} strokeWidth={3} opacity={prog(t, 9 + k * 0.2)} />
      })}
    </svg>
  )
}

function ShakePlot({ t }: { t: number }) {
  const yc = 170
  const draw = prog(t, 12.4, 2.6)
  let d = ''
  for (let x = PX0; x <= PX1; x += 3) d += `${d ? 'L' : 'M'} ${x} ${(yc + 38 * Math.sin(((x - PX0) / 64) * 2 * Math.PI)).toFixed(1)} `
  return (
    <svg width={PLOT_W} height={300} style={{ position: 'absolute', left: 0, top: 170 }}>
      <line x1={PX0} x2={PX0} y1={34} y2={270} stroke={C.muted} strokeWidth={2} />
      <line x1={PX0} x2={PX1} y1={270} y2={270} stroke={C.muted} strokeWidth={2} />
      <text x={PX1} y={298} textAnchor="end" fill={C.muted} fontSize={22}>
        tick →
      </text>
      <g opacity={prog(t, 12)}>
        <line x1={PX0} x2={PX1} y1={yc} y2={yc} stroke={C.orange} strokeWidth={3} strokeDasharray="12 10" />
        <text x={PX0 + 16} y={44} fill={C.orange} fontSize={22} fontWeight={600}>
          - - 고정 목표 하나 · policy 끔
        </text>
      </g>
      <text x={PX0 + 16} y={76} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 12.6)}>
        ── 실제 관절 각도
      </text>
      <path d={d} fill="none" stroke={C.red} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    </svg>
  )
}

function Diagnosis({ at, cause, check }: { at: number; cause: string; check: string }) {
  return (
    <div style={{ position: 'absolute', left: 36, right: 36, top: 500, display: 'grid', gap: 22 }}>
      <Appear at={at}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label size={22}>의심할 원인</Label>
          <Label color={C.text} size={30} weight={600}>
            {cause}
          </Label>
        </div>
      </Appear>
      <Appear at={at + 1.2}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label size={22}>확인하는 방법</Label>
          <Label color={C.accent} size={28} weight={500} style={{ lineHeight: 1.45 }}>
            {check}
          </Label>
        </div>
      </Appear>
    </div>
  )
}

function Jitter() {
  const t = useSec()
  const title = (n: string, text: string) => (
    <div style={{ position: 'absolute', left: 36, top: 28, right: 36, display: 'grid', gap: 8 }}>
      <Label mono color={C.accent} size={22} weight={600}>
        떨림의 모습 {n}
      </Label>
      <Label color={C.text} size={32} weight={600} style={{ lineHeight: 1.35 }}>
        {text}
      </Label>
    </div>
  )
  return (
    <AbsoluteFill>
      <Appear at={0.5} style={{ position: 'absolute', left: 64, top: 140 }}>
        <Panel x={0} y={0} w={880} h={740} style={{ position: 'relative' }}>
          {title('①', 'chunk 가 바뀌는 순간에만 갑자기 크게 움직인다')}
          <ChunkPlot t={t} />
          <Diagnosis at={8.6} cause="chunk 경계의 목표 튐 · 추론 지연" check="보낸 목표 각도를 tick 마다 기록해 경계에서 값이 튀는지 보고, 추론 시간을 본다" />
        </Panel>
      </Appear>
      <Appear at={1.4} style={{ position: 'absolute', left: 976, top: 140 }}>
        <Panel x={0} y={0} w={880} h={740} style={{ position: 'relative' }}>
          {title('②', '일정한 주기로 계속 떤다')}
          <ShakePlot t={t} />
          <Diagnosis at={13.6} cause="servo 의 PID 설정 · 기계 문제" check="policy 없이 고정 목표 하나를 보내도 떠는지 본다" />
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- simulation 과 실물 ----------

const SIM_ROWS = [
  { item: '관절 값', sim: '정확한 값', real: '잴 때마다 조금씩 흔들리고, 기어 틈(backlash) 때문에 방향을 바꿀 때 늦는다' },
  { item: '추론 시간', sim: 'simulation 시계를 멈추고 기다릴 수 있다', real: '기다리는 동안 팔이 멈추거나 이전 목표대로 움직인다' },
  { item: '성공 판정과 처음 상태', sim: '코드가 계산하고 명령 한 줄로 되돌린다', real: '사람이 보고 기록하고, 물체를 손으로 다시 놓는다' },
]

/** the same collect → train → 25 trials procedure, first in simulation, then on the real arm */
function SameProcedure({ t }: { t: number }) {
  const steps = ['시연 50 개 모으기', 'policy 학습', '25 번 시도로 평가']
  const lanes = [
    { name: 'simulation', sub: 'SO-101 MuJoCo 모델', tag: '먼저', color: C.purple, at: 0.6, stepsAt: 5.8 },
    { name: '실물 SO-101 팔', sub: '같은 절차를 다시', tag: '다음', color: C.green, at: 1.6, stepsAt: 8.4 },
  ]
  return (
    <Appear at={0.5} out={10} style={{ position: 'absolute', left: 64, top: 236 }}>
      <Panel x={0} y={0} w={1792} h={336} style={{ position: 'relative' }}>
        {lanes.map((l, r) => (
          <div key={l.name} style={{ position: 'absolute', left: 34, right: 34, top: 34 + r * 150, height: 118, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, l.at) }}>
            <div style={{ width: 330, display: 'grid', gap: 6 }}>
              <Label color={l.color} size={32} weight={600}>
                {l.name}
                <span style={{ marginLeft: 14, fontSize: 22, color: C.muted, fontWeight: 500 }}>{l.tag}</span>
              </Label>
              <Label color={C.muted} size={22}>
                {l.sub}
              </Label>
            </div>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, l.stepsAt + i * (r === 0 ? 0.8 : 0.25)) }}>
                {i > 0 && <span style={{ fontSize: 36, color: C.muted }}>→</span>}
                <div style={{ width: 340, padding: '18px 0', textAlign: 'center', borderRadius: 16, border: `1.5px solid ${l.color}88`, background: `${l.color}14`, fontSize: 30, fontWeight: 600 }}>{s}</div>
              </div>
            ))}
          </div>
        ))}
      </Panel>
    </Appear>
  )
}

function Sim() {
  const t = useSec()
  const cols = ['260px', '620px', '1fr']
  const chip = (text: string, color: string) => (
    <div style={{ padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${color}88`, background: `${color}14`, fontSize: 28, fontWeight: 600 }}>{text}</div>
  )
  const track = { x0: 40, x1: 700 }
  const tx = (p: number) => track.x0 + (p / 100) * (track.x1 - track.x0)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 140, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Appear at={0.4}>{chip('① simulation 에서 먼저', C.purple)}</Appear>
        <Appear at={1.2}>
          <span style={{ fontSize: 36, color: C.muted }}>→</span>
        </Appear>
        <Appear at={1.4}>{chip('② 실물 팔', C.green)}</Appear>
      </div>
      <SameProcedure t={t} />
      <Appear at={10.4} style={{ position: 'absolute', left: 64, top: 236 }}>
        <Panel x={0} y={0} w={1792} h={336} style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols.join(' '), columnGap: 30, padding: '16px 34px 0', alignItems: 'center' }}>
            <Label size={22}>항목</Label>
            <Label color={C.purple} size={24} weight={600}>
              simulation
            </Label>
            <Label color={C.green} size={24} weight={600}>
              실물
            </Label>
          </div>
          {SIM_ROWS.map((r, i) => (
            <div
              key={r.item}
              style={{
                display: 'grid',
                gridTemplateColumns: cols.join(' '),
                columnGap: 30,
                alignItems: 'center',
                height: 92,
                padding: '0 34px',
                borderTop: `1.5px solid ${C.cardEdge}`,
                marginTop: i === 0 ? 14 : 0,
                opacity: prog(t, 10.7 + i * 1.3),
              }}
            >
              <Label color={C.text} size={26} weight={600}>
                {r.item}
              </Label>
              <Label color={C.text} size={26} style={{ lineHeight: 1.4 }}>
                {r.sim}
              </Label>
              <Label color={C.text} size={26} style={{ lineHeight: 1.4 }}>
                {r.real}
              </Label>
            </div>
          ))}
        </Panel>
      </Appear>
      <Appear at={16.6} style={{ position: 'absolute', left: 64, top: 604 }}>
        <Panel x={0} y={0} w={980} h={276} style={{ position: 'relative' }}>
          <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
            <Label color={C.purple} size={24} weight={600}>
              simulation 에 일부러 넣는 실물의 문제
            </Label>
            {['사진 밝기를 무작위로 바꾼다', '카메라를 시도마다 1 cm 안에서 옮긴다', '목표를 tick 한두 개 늦게 반영한다'].map((s, i) => (
              <Appear key={s} at={17 + i * 1.2}>
                <Label color={C.text} size={30}>
                  <span style={{ color: C.purple, fontFamily: MONO, marginRight: 14 }}>+</span>
                  {s}
                </Label>
              </Appear>
            ))}
          </div>
        </Panel>
      </Appear>
      <Appear at={21.6} style={{ position: 'absolute', left: 1076, top: 604 }}>
        <Panel x={0} y={0} w={780} h={276} style={{ position: 'relative' }}>
          <svg width={780} height={276}>
            <text x={40} y={50} fill={C.text} fontSize={28} fontWeight={600}>
              simulation 25 번 중 24 번 성공 · 96%
            </text>
            <rect x={tx(0)} y={118} width={tx(100) - tx(0)} height={20} rx={10} fill={C.grid} />
            <rect x={tx(0)} y={118} width={(tx(96) - tx(0)) * prog(t, 22, 1)} height={20} rx={10} fill={C.purple} opacity={0.8} />
            <line x1={tx(96)} x2={tx(96)} y1={98} y2={158} stroke={C.purple} strokeWidth={4} opacity={prog(t, 22.8)} />
            <text x={tx(96)} y={88} textAnchor="end" fill={C.purple} fontSize={24} fontWeight={600} opacity={prog(t, 22.8)}>
              위쪽 끝
            </text>
            <text x={tx(0)} y={184} fill={C.muted} fontSize={22} fontFamily={MONO}>
              0%
            </text>
            <text x={tx(100)} y={184} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
              100%
            </text>
            <g opacity={prog(t, 24)}>
              <text x={40} y={240} fill={C.green} fontSize={28} fontWeight={600}>
                실물 성공률은 이보다 낮을 수 있다 → 실물에서 따로 잰다
              </text>
            </g>
          </svg>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- recap ----------

function Answer() {
  const items = [
    { tag: '성공률과 신뢰 구간', color: C.blue, text: '80% 와 함께 Wilson 구간 61% ~ 91%, 시도 25 번을 적는다' },
    { tag: '두 policy 의 비교', color: C.orange, text: '구간이 겹치면 단정하지 않는다 · 같은 배치에서 번갈아 시도한다' },
    { tag: '실패 분석', color: C.red, text: '실패를 모습과 단계로 나누고, 원인을 가려 고칠 곳을 찾는다' },
    { tag: 'simulation 과 실물', color: C.purple, text: 'simulation 성공률은 위쪽 끝 · 실물에서 따로 잰다' },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1500 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            25 번 중 20 번 성공, 성공률 80% 라고만 적으면 될까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={1.2 + i * 1.5}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 24, color: it.color, fontWeight: 600 }}>{it.tag}</span>
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
            NEXT · SESSION 6
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600 }}>VLA Tokens</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={36}>
            VLM 이 로봇 action 을 token 으로 말하게 만든 RT-2·OpenVLA
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

const PauseInterval = () => (
  <PauseWrite
    question="25 번으로 얻은 Wilson 구간 61% ~ 91% 의 폭을 대략 절반으로 줄이려면 몇 번 시도해야 할까?"
    answer="폭은 시도 횟수의 제곱근에 반비례 → 시도 4 배, 25 × 4 = 100 번. 80 / 100 의 구간은 71% ~ 87% 로, 폭이 30 에서 16 으로 줄었다"
  />
)

const PauseCompare = () => (
  <PauseWrite
    question="두 policy 의 Wilson 구간이 50% ~ 70%, 72% ~ 90% 다. 차이가 있다고 말할 수 있을까?"
    answer="두 구간이 겹치지 않는다(70% 와 72% 사이에 틈이 있다). 뒤의 policy 가 낫다고 말할 수 있다"
  />
)

const PauseJitter = () => (
  <PauseWrite
    question="policy 를 끄고 고정 목표 하나만 보냈는데도 팔이 일정하게 떤다. 원인은 policy 쪽일까, 팔 쪽일까?"
    answer="policy 가 관여하지 않는데도 떨므로 팔 쪽이다. servo 의 PID 설정이나 기계 문제를 먼저 살핀다"
  />
)

export function RealRobot() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        trials: Trials,
        interval: Interval,
        'pause-interval': PauseInterval,
        compare: Compare,
        protocol: Protocol,
        'pause-compare': PauseCompare,
        failures: Failures,
        jitter: Jitter,
        'pause-jitter': PauseJitter,
        sim: Sim,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
