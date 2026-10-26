import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './dagger.narration.json'
import { script } from './dagger.script'

// ---------- shared numbers (lessons/dagger/README.md) ----------

/** y after each step of iteration 2: the behavior cloning policy, c = 0.3, 0.1 m inside, 0.1 + (y − c) outside */
const DRIFT_Y = [0, 0.1, 0.2, 0.3, 0.4, 0.6, 1.0, 1.8]
/** iteration 3 (c = 1.0): 0.1 m a step up to 1.1 m, then 1.3, 1.7, 2.5 */
const ROLL_3 = [...Array.from({ length: 12 }, (_, k) => k / 10), 1.3, 1.7, 2.5]
/** iteration 4 (c = 1.7): 0.1 m a step for all 15 steps */
const ROLL_4 = Array.from({ length: 16 }, (_, k) => k / 10)
const BAND = 0.3
const LANE = 1.75

const fmt = (v: number) => (Math.round(v * 10) / 10).toFixed(1)
/** the expert's steering at y: a = 4x = 8y degrees */
const label = (y: number) => (y === 0 ? '0°' : `${fmt(8 * y)}°`)

function Intro() {
  const t = useSec()
  const chips = script.sections
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 26, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 2 · IMITATION LEARNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.03em' }}>DAgger</div>
        </Appear>
        <Appear at={1.1}>
          <Label color={C.muted} size={40}>
            policy 가 직접 간 상태에서 expert 에게 정답을 묻는다
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

// ---------- question: doubling the demos leaves 0.3 m and beyond empty ----------

const DEMO_BINS: [string, number][] = [
  ['−0.3~−0.2', 30],
  ['−0.2~−0.1', 150],
  ['−0.1~0', 320],
  ['0~0.1', 330],
  ['0.1~0.2', 140],
  ['0.2~0.3', 30],
  ['0.3 바깥', 0],
]

function Question() {
  const t = useSec()
  const grow = prog(t, 2.2, 1.0)
  const swap = prog(t, 2.2, 0.4)
  const W = 1300
  const base = 330
  const maxH = 230
  const bx = (i: number) => 100 + i * 160
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'grid', justifyItems: 'center', gap: 14 }}>
        <Appear at={0.3}>
          <div style={{ fontSize: 58, fontWeight: 700, textAlign: 'center' }}>시연을 두 배로 늘려도 0.3 m 바깥은 0</div>
        </Appear>
        <Appear at={4.2}>
          <div style={{ fontSize: 58, fontWeight: 700, textAlign: 'center', color: C.accent }}>실수한 뒤 들어가는 상태의 정답은 어디서?</div>
        </Appear>
      </div>
      <Appear at={0.8} style={{ position: 'absolute', left: (1920 - W) / 2, top: 400 }}>
        <Panel x={0} y={0} w={W} h={460} style={{ position: 'relative' }}>
          <svg width={W} height={460}>
            <text x={60} y={58} fill={C.orange} fontSize={28} fontWeight={600}>
              ■ 시연 <tspan fontFamily={MONO}>{swap < 0.5 ? 1000 : 2000}</tspan> step
            </text>
            <text x={W - 60} y={58} textAnchor="end" fill={C.muted} fontSize={24} opacity={prog(t, 3)}>
              구간마다 두 배 · 0 의 두 배는 0
            </text>
            <line x1={60} x2={W - 60} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
            {DEMO_BINS.map(([name, n], i) => {
              const v = swap < 0.5 ? n : 2 * n
              const h = (lerp(n, 2 * n, grow) / 660) * maxH * prog(t, 1 + i * 0.08, 0.5)
              const empty = n === 0
              return (
                <g key={name}>
                  {empty ? (
                    <>
                      <rect x={bx(i) + 10} y={base - maxH} width={110} height={maxH} rx={6} fill={C.red} opacity={0.08 * prog(t, 2.6)} />
                      <rect x={bx(i) + 10} y={base - maxH} width={110} height={maxH} rx={6} fill="none" stroke={C.red} strokeDasharray="8 8" strokeWidth={2} opacity={prog(t, 2.6)} />
                      <text x={bx(i) + 65} y={base - 24} textAnchor="middle" fill={C.red} fontSize={34} fontWeight={700} fontFamily={MONO} opacity={prog(t, 2.6)}>
                        0
                      </text>
                    </>
                  ) : (
                    <>
                      <rect x={bx(i) + 10} y={base - h} width={110} height={h} rx={5} fill={C.orange} opacity={0.85} />
                      <text x={bx(i) + 65} y={base - h - 12} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} opacity={prog(t, 1.2) * Math.abs(1 - 2 * swap)}>
                        {v}
                      </text>
                    </>
                  )}
                  <text x={bx(i) + 65} y={base + 36} textAnchor="middle" fill={empty ? C.red : C.muted} fontSize={21} fontFamily={empty ? undefined : MONO}>
                    {name}
                  </text>
                </g>
              )
            })}
            <text x={W / 2} y={base + 84} textAnchor="middle" fill={C.muted} fontSize={22}>
              차가 가운데에서 벗어난 거리 y 의 구간 (m)
            </text>
          </svg>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- DAgger's loop ----------

const NODES = [
  { n: '①', title: 'policy 로 운전', text: '지금의 policy 에게 운전대를 맡긴다', x: 90, y: 320, at: 0.6, lit: [0.6, 8.4] },
  { n: '②', title: '지나간 상태 기록', text: 'policy 가 데려간 위치의 관측 o', x: 670, y: 320, at: 8.2, lit: [8.4, 10.6] },
  { n: '③', title: 'expert 정답 붙이기', text: '그 위치에서 expert 가 냈을 π*(o)', x: 670, y: 660, at: 10.4, lit: [10.6, 13.2] },
  { n: '④', title: '합치고 다시 학습', text: '모은 데이터 전체로 새 policy 학습', x: 90, y: 660, at: 13, lit: [13.2, 15.6] },
]
const NODE_W = 440
const NODE_H = 160

/** cumulative pairs after iterations 1 … 4 (dagger-loop figure): demos, then 700, 1400, 1500 new pairs */
const PILE = [1000, 1700, 3100, 4600]

function Loop() {
  const t = useSec()
  const [L, R, TOP, BOT] = [90, 670, 320, 660]
  const arrows = [
    { d: `M ${L + NODE_W + 10} ${TOP + NODE_H / 2} L ${R - 14} ${TOP + NODE_H / 2}`, at: 8.2 },
    { d: `M ${R + NODE_W / 2} ${TOP + NODE_H + 10} L ${R + NODE_W / 2} ${BOT - 14}`, at: 10.4 },
    { d: `M ${R - 10} ${BOT + NODE_H / 2} L ${L + NODE_W + 14} ${BOT + NODE_H / 2}`, at: 13 },
    { d: `M ${L + NODE_W / 2} ${BOT - 10} L ${L + NODE_W / 2} ${TOP + NODE_H + 14}`, at: 15.4 },
  ]
  const scale = 470 / 4600
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 150, display: 'grid', gap: 10 }}>
        <Appear at={0.3}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <span style={{ fontFamily: MONO, fontSize: 54, fontWeight: 600, color: C.accent }}>DAgger</span>
            <Label size={32} color={C.text}>
              policy 에게 운전을 맡기고, 간 곳마다 expert 에게 묻는다
            </Label>
          </div>
        </Appear>
        <Appear at={18.6}>
          <Label size={28} color={C.muted}>
            <span style={{ fontFamily: MONO }}>
              = <span style={{ color: C.text }}>D</span>ataset <span style={{ color: C.text }}>Agg</span>regation
            </span>{' '}
            · aggregation 은 여러 개를 한데 모은다는 뜻
          </Label>
        </Appear>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={C.muted} />
          </marker>
        </defs>
        {arrows.map((a, i) => (
          <path key={i} d={a.d} stroke={C.muted} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, a.at, 0.6)} markerEnd={prog(t, a.at, 0.6) > 0.95 ? 'url(#loop-arrow)' : undefined} />
        ))}
        <text x={(L + R + NODE_W) / 2} y={568} textAnchor="middle" fill={C.text} fontSize={30} fontWeight={600} opacity={prog(t, 15.6)}>
          한 바퀴 = iteration 하나
        </text>
        <text x={(L + R + NODE_W) / 2} y={610} textAnchor="middle" fill={C.muted} fontSize={24} opacity={prog(t, 16.2)}>
          새 policy 로 ① 부터 다시
        </text>
      </svg>
      <Appear at={1} out={7.6} style={{ position: 'absolute', left: 670, top: 340, display: 'grid', gap: 14 }}>
        <Label size={30}>시연의 빈 곳으로 가는 건 실수하는 policy</Label>
        <div style={{ opacity: prog(t, 3.4) }}>
          <Label size={30} color={C.text} weight={600}>
            ← 그래서 policy 에게 직접 운전을 맡긴다
          </Label>
        </div>
      </Appear>
      {NODES.map((nd) => {
        const lit = t >= nd.lit[0] && t < nd.lit[1]
        return (
          <Appear key={nd.n} at={nd.at} style={{ position: 'absolute', left: nd.x, top: nd.y }}>
            <div
              style={{
                width: NODE_W,
                height: NODE_H,
                boxSizing: 'border-box',
                padding: '22px 28px',
                borderRadius: 20,
                background: lit ? `${C.accent}1f` : C.card,
                border: `2px solid ${lit ? C.accent : C.cardEdge}`,
                display: 'grid',
                alignContent: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, color: nd.n === '③' ? C.orange : C.text }}>
                <span style={{ color: C.accent, marginRight: 10 }}>{nd.n}</span>
                {nd.title}
              </div>
              <Label size={24}>{nd.text}</Label>
            </div>
          </Appear>
        )
      })}
      <Appear at={13.4} style={{ position: 'absolute', left: 1220, top: 320 }}>
        <Panel x={0} y={0} w={636} h={480} style={{ position: 'relative' }}>
          <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
            <Label color={C.text} size={30} weight={600}>
              모은 데이터 D
            </Label>
            {PILE.map((total, i) => {
              const demo = 1000 * scale
              const added = (total - 1000) * scale
              const p = i === 0 ? 1 : prog(t, i === 1 ? 14.4 : 19.2 + (i - 2) * 0.9, 0.7)
              return (
                <div key={i} style={{ display: 'grid', gap: 6, opacity: i === 0 ? 1 : prog(t, i === 1 ? 14.2 : 19 + (i - 2) * 0.9, 0.4) }}>
                  <Label mono size={22}>
                    iteration {i + 1}
                    {i === 0 ? ' · expert 의 시연' : ''}
                  </Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', height: 32 }}>
                      <div style={{ width: demo, background: C.orange, borderRadius: '6px 0 0 6px', opacity: 0.85 }} />
                      <div style={{ width: added * p, background: C.blue, borderRadius: '0 6px 6px 0', opacity: 0.85 }} />
                    </div>
                    <Label mono size={26} color={C.text} weight={600}>
                      {Math.round(1000 + (total - 1000) * p)}
                    </Label>
                  </div>
                </div>
              )
            })}
            <div style={{ display: 'flex', gap: 24, fontSize: 21, opacity: prog(t, 15) }}>
              <span style={{ color: C.orange }}>■ 시연</span>
              <span style={{ color: C.blue }}>■ policy 가 간 곳 + expert 정답</span>
            </div>
          </div>
        </Panel>
      </Appear>
      <Appear at={21.8} style={{ position: 'absolute', left: 1220, top: 816, width: 636 }}>
        <div style={{ padding: '10px 18px', borderRadius: 12, background: `${C.red}14`, border: `1.5px solid ${C.red}55` }}>
          <Label size={23} color={C.red}>
            ✕ 이번 iteration 데이터만 쓰면, 전에 받은 정답을 잊는다
          </Label>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- iteration 2: where the policy went, and the expert's answers there ----------

const ROAD = { x: 64, y: 140, w: 1180, h: 740, yc: 370, scale: 170, x0: 110, dx: 140 }
const ry = (y: number) => ROAD.yc - y * ROAD.scale
const rx = (k: number) => ROAD.x0 + k * ROAD.dx
const stepAt = (k: number) => 6.6 + 0.8 * k
const MOVE = 0.6
const labelAt = (k: number) => 13.2 + 0.7 * k

function carAt(t: number): [number, number] {
  for (let k = 6; k >= 0; k--) {
    if (t >= stepAt(k)) {
      const p = prog(t, stepAt(k), MOVE)
      return [k + p, lerp(DRIFT_Y[k], DRIFT_Y[k + 1], p)]
    }
  }
  return [0, 0]
}

function Car({ x, y, angle, color = C.blue, glow = false }: { x: number; y: number; angle: number; color?: string; glow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {glow && <rect x={-36} y={-24} width={72} height={48} rx={14} fill={color} opacity={0.18} />}
      <rect x={-26} y={-15} width={52} height={30} rx={8} fill={color} />
      <rect x={6} y={-11} width={12} height={22} rx={3} fill={C.bg} opacity={0.55} />
    </g>
  )
}

function Iteration2() {
  const t = useSec()
  const [pos, y] = carAt(t)
  const k = Math.min(6, Math.floor(pos))
  const angle = (Math.atan2(-(DRIFT_Y[k + 1] - DRIFT_Y[k]) * ROAD.scale, ROAD.dx) * 180) / Math.PI
  const reached = Math.floor(pos + 1e-6)
  const out = y > BAND + 1e-6
  const crash = prog(t, stepAt(6) + MOVE, 0.4)
  const trail = DRIFT_Y.slice(0, reached + 1).map((v, i) => `${rx(i)},${ry(v)}`)
  trail.push(`${lerp(rx(0), rx(7), pos / 7)},${ry(y)}`)
  const focus = prog(t, 19.6, 0.5) * (1 - prog(t, 30.4, 0.5))
  const grown = prog(t, 33.4, 1)
  const orangeArrow = prog(t, 20.6, 0.6)
  return (
    <AbsoluteFill>
      <Panel x={ROAD.x} y={ROAD.y} w={ROAD.w} h={ROAD.h}>
        <svg width={ROAD.w} height={ROAD.h}>
          <defs>
            <marker id="it2-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={C.orange} />
            </marker>
          </defs>
          {/* lane */}
          <rect x={40} y={ry(LANE)} width={ROAD.w - 80} height={ry(-LANE) - ry(LANE)} fill="#0e1628" />
          <line x1={40} x2={ROAD.w - 40} y1={ry(LANE)} y2={ry(LANE)} stroke={crash > 0 ? C.red : C.muted} strokeWidth={4 + 3 * crash} opacity={0.9} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(-LANE)} y2={ry(-LANE)} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          <text x={52} y={ry(LANE) - 14} fill={crash > 0 ? C.red : C.muted} fontSize={24}>
            차선 경계 1.75 m
          </text>
          {/* the known range: the demos (±0.3 m), then the new answers up to 1.0 m */}
          <rect x={40} y={ry(BAND)} width={ROAD.w - 80} height={ry(-BAND) - ry(BAND)} fill={C.orange} opacity={0.2 * prog(t, 0.6, 0.8)} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(0)} y2={ry(0)} stroke={C.orange} strokeWidth={3} strokeDasharray="14 12" opacity={0.7 * prog(t, 0.6, 0.8)} />
          <rect x={40} y={lerp(ry(BAND), ry(1.0), grown)} width={ROAD.w - 80} height={ry(BAND) - lerp(ry(BAND), ry(1.0), grown)} fill={C.orange} opacity={0.12} />
          <line x1={40} x2={ROAD.w - 40} y1={lerp(ry(BAND), ry(1.0), grown)} y2={lerp(ry(BAND), ry(1.0), grown)} stroke={C.orange} strokeWidth={2} strokeDasharray="8 8" opacity={prog(t, 0.6, 0.8)} />
          <text x={ROAD.w - 52} y={ry(-0.22)} textAnchor="end" fill={C.orange} fontSize={24} opacity={prog(t, 1.2) * (1 - grown)}>
            시연 ±0.3 m = 아는 범위 c = 0.3
          </text>
          <text x={60} y={ry(0.62)} fill={C.orange} fontSize={28} fontWeight={600} opacity={grown}>
            새 정답 → 아는 범위 c = 1.0 m
          </text>
          {/* trail and the points the policy reached */}
          <polyline points={trail.join(' ')} fill="none" stroke={C.blue} strokeWidth={4} strokeLinejoin="round" opacity={0.9} />
          <line x1={rx(5)} y1={ry(0.6)} x2={rx(6)} y2={ry(1.0)} stroke={C.blue} strokeWidth={10} strokeLinecap="round" opacity={0.55 * focus} />
          {DRIFT_Y.slice(0, reached + 1).map((v, i) => {
            const o = v > BAND + 1e-6
            return (
              <g key={i}>
                <circle cx={rx(i)} cy={ry(v)} r={i === 5 ? 8 + 4 * focus : 8} fill={o ? C.red : C.blue} />
                <text x={i === 7 ? rx(i) + 56 : rx(i)} y={i === 7 ? ry(v) + 52 : ry(v) + 40} textAnchor="middle" fill={o ? C.red : C.text} fontSize={24} fontFamily={MONO}>
                  {fmt(v)}
                </text>
              </g>
            )
          })}
          {/* the expert's answers, asked at each place the policy went */}
          {DRIFT_Y.slice(0, 7).map((v, i) => {
            const p = prog(t, labelAt(i), 0.5)
            return (
              <g key={i} opacity={p} transform={`translate(${rx(i) - 12} ${ry(v) - 16 - 10 * (1 - p)})`}>
                <rect x={-78} y={-30} width={78} height={38} rx={8} fill={C.card} stroke={C.orange} strokeWidth={2} />
                <text x={-39} y={-3} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600} fontFamily={MONO}>
                  {label(v)}
                </text>
              </g>
            )
          })}
          {/* at 0.6 m: what was executed against what is stored */}
          <line
            x1={rx(5)}
            y1={ry(0.6)}
            x2={lerp(rx(5), rx(5) + 120, orangeArrow)}
            y2={lerp(ry(0.6), ry(0.6) + 70, orangeArrow)}
            stroke={C.orange}
            strokeWidth={5}
            markerEnd={orangeArrow > 0.9 ? 'url(#it2-orange)' : undefined}
            opacity={focus}
          />
          <g opacity={crash}>
            <text x={rx(6) - 50} y={ry(LANE) + 58} textAnchor="end" fill={C.red} fontSize={28} fontWeight={700}>
              step 7 · 1.8 m 이탈 (기록 안 함)
            </text>
          </g>
          <Car x={lerp(rx(0), rx(7), pos / 7)} y={ry(y)} angle={angle} color={out ? C.red : C.blue} glow={out} />
          <g opacity={prog(t, 0.4) * (1 - prog(t, 18.6, 0.4))}>
            <text x={60} y={ROAD.h - 34} fill={C.text} fontSize={26}>
              <tspan fill={C.orange}>iteration 1</tspan> expert 의 시연 1000 step → 학습 →{' '}
              <tspan fill={C.blue} opacity={prog(t, 3)}>
                iteration 2 · 이 policy 가 운전
              </tspan>
            </text>
          </g>
        </svg>
      </Panel>
      {/* callout: the executed steering is the policy's, the stored answer is the expert's */}
      <div style={{ position: 'absolute', left: ROAD.x + 560, top: ROAD.y + 470, width: 580, opacity: focus * (1 - prog(t, 25.3, 0.4)) }}>
        <div style={{ padding: '20px 26px', borderRadius: 18, background: C.bg, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 10 }}>
          <Label size={24}>0.6 m 에서</Label>
          <Label size={30} color={C.blue} weight={600}>
            실행한 조향 · policy 의 1.6°
          </Label>
          <Label size={30} color={C.orange} weight={600}>
            저장하는 정답 · expert 의 4.8°
          </Label>
        </div>
      </div>
      <div style={{ position: 'absolute', left: ROAD.x + 40, top: ROAD.y + 470, width: 1100, display: 'grid', gap: 14 }}>
        <MiniMyth at={25.6} out={30.4} mark="✕" color={C.red} tag="policy 의 1.6° 를 저장하면">
          다시 배운 policy 도 0.6 m 에서 1.6° 를 낸다. 아는 범위는 c = 0.3 그대로
        </MiniMyth>
        <MiniMyth at={27.2} out={30.4} mark="✓" color={C.green} tag="expert 의 4.8° 를 저장하면">
          벗어난 뒤 돌아오는 법을 배운다. 아는 범위를 넓히는 건 expert 의 정답
        </MiniMyth>
      </div>
      <Iteration2Table t={t} />
    </AbsoluteFill>
  )
}

function MiniMyth({ at, out, mark, color, tag, children }: { at: number; out: number; mark: string; color: string; tag: string; children: ReactNode }) {
  return (
    <Appear at={at} out={out}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '18px 24px', borderRadius: 16, background: C.card, boxShadow: `inset 0 0 0 1.5px ${color}66` }}>
        <span style={{ color, fontSize: 34, lineHeight: '40px', fontWeight: 700 }}>{mark}</span>
        <div style={{ display: 'grid', gap: 4 }}>
          <Label color={color} size={22} weight={600}>
            {tag}
          </Label>
          <Label color={C.text} size={30} weight={500} style={{ lineHeight: 1.4 }}>
            {children}
          </Label>
        </div>
      </div>
    </Appear>
  )
}

function Iteration2Table({ t }: { t: number }) {
  const cols = ['step', 'y (m)', '범위', '정답 8y']
  const widths = [80, 110, 120, 200]
  return (
    <Panel x={1284} y={ROAD.y} w={572} h={ROAD.h}>
      <div style={{ padding: '24px 26px 0', display: 'grid', gap: 4, fontFamily: MONO, fontSize: 26 }}>
        <div style={{ display: 'flex', color: C.muted, fontSize: 22, paddingBottom: 8, borderBottom: `1.5px solid ${C.cardEdge}` }}>
          {cols.map((c, i) => (
            <span key={c} style={{ width: widths[i], textAlign: i === 0 ? 'left' : 'right', color: i === 3 ? C.orange : C.muted }}>
              {c}
            </span>
          ))}
        </div>
        {DRIFT_Y.map((y, k) => {
          const outside = y > BAND + 1e-6
          const left = k === 7
          const color = outside ? C.red : C.text
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', height: 52, opacity: prog(t, k === 0 ? 6.4 : stepAt(k - 1) + MOVE, 0.4), color }}>
              <span style={{ width: widths[0] }}>{k}</span>
              <span style={{ width: widths[1], textAlign: 'right' }}>{fmt(y)}</span>
              <span style={{ width: widths[2], textAlign: 'right', fontSize: 22, fontFamily: SANS, color: left ? C.red : outside ? C.red : C.orange }}>{left ? '이탈' : outside ? '밖' : '안'}</span>
              <span style={{ width: widths[3], textAlign: 'right', fontWeight: 600, color: left ? C.dim : C.orange, fontSize: left ? 22 : 26, fontFamily: left ? SANS : MONO, opacity: left ? prog(t, labelAt(6) + 0.6) : prog(t, labelAt(k), 0.4) }}>
                {left ? '기록 안 함' : label(y)}
              </span>
            </div>
          )
        })}
        <div style={{ marginTop: 22, display: 'grid', gap: 12, fontSize: 28, color: C.text, fontFamily: SANS }}>
          <div style={{ opacity: prog(t, 30.8) }}>
            7 곳 × 100 번 = <span style={{ color: C.orange, fontWeight: 600 }}>700 쌍</span>
          </div>
          <div style={{ opacity: prog(t, 32) }}>
            1000 + 700 = <span style={{ color: C.accent, fontWeight: 600 }}>1700 쌍</span>
          </div>
          <div style={{ opacity: prog(t, 33.4) }}>
            아는 범위 c: 0.3 → <span style={{ color: C.orange, fontWeight: 600 }}>1.0 m</span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ---------- one mistake: the chain ----------

function Cell({ n, state }: { n: number; state: 'idle' | 'ok' | 'bad' | 'back' }) {
  const bg = state === 'bad' ? `${C.red}cc` : C.grid
  const edge = state === 'ok' || state === 'back' ? C.green : state === 'bad' ? C.red : C.cardEdge
  return (
    <div
      style={{
        width: 124,
        height: 96,
        borderRadius: 14,
        background: bg,
        border: `3px solid ${edge}`,
        boxSizing: 'border-box',
        display: 'grid',
        placeItems: 'center',
        fontFamily: MONO,
        fontSize: 30,
        fontWeight: 600,
        color: state === 'bad' ? C.bg : C.text,
      }}
    >
      {n}
    </div>
  )
}

function Chain() {
  const t = useSec()
  const rowY = [310, 545]
  const bcState = (i: number): 'idle' | 'ok' | 'bad' => {
    if (i < 4) return t >= 3.4 + i * 0.25 ? 'ok' : 'idle'
    if (i === 4) return t >= 4.6 ? 'bad' : 'idle'
    return t >= 6.6 + (i - 5) * 0.5 ? 'bad' : 'idle'
  }
  const dgState = (i: number): 'idle' | 'ok' | 'bad' | 'back' => {
    if (i < 4) return t >= 3.4 + i * 0.25 ? 'ok' : 'idle'
    if (i === 4) return t >= 4.6 ? 'bad' : 'idle'
    if (i === 5) return t >= 12.6 ? 'bad' : 'idle'
    return t >= 13.6 + (i - 6) * 0.45 ? 'back' : 'idle'
  }
  const cellX = (i: number) => 470 + (i - 1) * 138
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 150, display: 'flex', gap: 22 }}>
        <Appear at={0.3}>
          <div style={{ padding: '14px 24px', borderRadius: 14, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 30 }}>
            <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>ε</span> step 마다 틀릴 확률
          </div>
        </Appear>
        <Appear at={1.6}>
          <div style={{ padding: '14px 24px', borderRadius: 14, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 30 }}>
            <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>T</span> episode 길이 (step 수)
          </div>
        </Appear>
        <Appear at={3}>
          <div style={{ padding: '14px 24px', fontSize: 30, color: C.muted }}>
            예: <span style={{ color: C.text }}>T = 10</span>, step 4 에서 처음 틀림
          </div>
        </Appear>
      </div>
      {[0, 1].map((r) => (
        <Appear key={r} at={2.4 + r * 0.3} style={{ position: 'absolute', left: 64, top: rowY[r] }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 380, display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 600, color: r === 0 ? C.red : C.green }}>{r === 0 ? 'behavior cloning' : 'DAgger'}</span>
              <Label size={22}>{r === 0 ? '낯선 상태에서 계속 틀린다' : '벗어난 상태의 정답도 배워서 돌아온다'}</Label>
            </div>
          </div>
        </Appear>
      ))}
      {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
        <div key={n}>
          <div style={{ position: 'absolute', left: cellX(n), top: rowY[0] - 10, opacity: prog(t, 2.4 + n * 0.05) }}>
            <Cell n={n} state={bcState(n)} />
          </div>
          <div style={{ position: 'absolute', left: cellX(n), top: rowY[1] - 10, opacity: prog(t, 2.7 + n * 0.05) }}>
            <Cell n={n} state={dgState(n)} />
          </div>
        </div>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={prog(t, 4.6)}>
          <text x={cellX(4) + 62} y={rowY[0] - 30} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600}>
            ▼ 처음 틀림
          </text>
        </g>
        {/* the DAgger policy comes back */}
        <g opacity={prog(t, 13.4)}>
          <line x1={cellX(6)} x2={cellX(6) + 124 * prog(t, 13.4, 0.5)} y1={rowY[1] - 26} y2={rowY[1] - 26} stroke={C.green} strokeWidth={3} />
          <text x={cellX(6)} y={rowY[1] - 38} fill={C.green} fontSize={24} fontWeight={600}>
            ↩ step 6 부터 돌아와 맞힘
          </text>
        </g>
      </svg>
      <Appear at={9.6} style={{ position: 'absolute', left: cellX(4), top: rowY[0] + 100, width: cellX(10) + 124 - cellX(4) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, height: 3, background: C.red, opacity: 0.6 }} />
          <Label color={C.red} size={30} weight={700}>
            step 4 ~ 10 · 7 번 틀림
          </Label>
        </div>
      </Appear>
      <Appear at={15.6} style={{ position: 'absolute', left: cellX(10) - 300, top: rowY[1] + 100, width: 424, textAlign: 'right' }}>
        <Label color={C.green} size={30} weight={700}>
          step 4, 5 · 2 번 틀림
        </Label>
      </Appear>
      <Appear at={18.8} style={{ position: 'absolute', left: 64, top: 750, width: 1792 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '20px 30px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
          <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: C.accent }}>u</span>
          <Label size={30} color={C.text}>
            실수 한 번 때문에 틀리는 step 수의 상한 · 이 예는 <span style={{ color: C.green, fontWeight: 600 }}>u = 2</span>
          </Label>
          <span style={{ marginLeft: 'auto', opacity: prog(t, 21.6) }}>
            <Label size={30} color={C.red} weight={600}>
              behavior cloning: 많게는 T
            </Label>
          </span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- the two upper bounds ----------

const PL = { x0: 190, x1: 1110, base: 290, top: 50 }
const bx = (T: number) => PL.x0 + (T / 10) * (PL.x1 - PL.x0)
const by = (v: number) => PL.base - (v / 10) * (PL.base - PL.top)
const EPS = 0.1
const U = 2
const TS = [2, 4, 6, 8, 10]
const num = (v: number) => fmt(v).replace(/\.0$/, '')

function BoundCard({ at, color, name, formula, rows, lit }: { at: number; color: string; name: string; formula: ReactNode; rows: [string, ReactNode, number][]; lit: number }) {
  const t = useSec()
  return (
    <Appear at={at}>
      <div style={{ height: 248, boxSizing: 'border-box', padding: '20px 30px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}66`, display: 'grid', alignContent: 'start', gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color }}>{name}</span>
        <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600 }}>{formula}</span>
        {rows.map(([k, v, a], i) => (
          <div
            key={k}
            style={{
              display: 'flex',
              gap: 14,
              fontSize: 26,
              opacity: prog(t, a),
              padding: '2px 10px',
              marginLeft: -10,
              borderRadius: 8,
              background: i === 1 && lit > 0 ? `${color}${Math.round(lit * 48).toString(16).padStart(2, '0')}` : 'transparent',
            }}
          >
            <span style={{ color: C.muted, width: 150, flexShrink: 0 }}>{k}</span>
            <span style={{ color: C.text }}>{v}</span>
          </div>
        ))}
      </div>
    </Appear>
  )
}

function Bounds() {
  const t = useSec()
  const drawBc = prog(t, 18.6, 3.6)
  const drawDg = prog(t, 23.8, 2.6)
  const bcPts = Array.from({ length: 101 }, (_, i) => i / 10).filter((T) => T <= 10 * drawBc + 1e-9)
  const litBc = prog(t, 12.6, 0.4) * (1 - prog(t, 18, 0.4))
  const litDg = prog(t, 14.6, 0.4) * (1 - prog(t, 18, 0.4))
  const bcAt = (T: number) => 18.6 + 3.6 * Math.sqrt(T / 10)
  const dgAt = (T: number) => 23.8 + 2.6 * (T / 10)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 136, width: 1792, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <BoundCard
          at={0.3}
          color={C.red}
          name="behavior cloning · Ross·Bagnell 2010"
          formula={
            <>
              J ≤ J(π*) + <span style={{ color: C.red }}>T²ε</span>
            </>
          }
          rows={[
            ['실수의 피해', '한 번에 많게는 T  →  Tε 번 × T', 2.6],
            ['ε 을 잰 곳', 'expert 가 간 상태 (시연)', 12.6],
          ]}
          lit={litBc}
        />
        <BoundCard
          at={6.6}
          color={C.green}
          name="DAgger · Ross·Gordon·Bagnell 2011"
          formula={
            <>
              J ≤ J(π*) + <span style={{ color: C.green }}>uTε</span>
              <sub style={{ fontSize: 24, lineHeight: 0, color: C.green }}>N</sub> + O(1)
            </>
          }
          rows={[
            ['실수의 피해', '한 번에 u  →  Tε 번 × u', 8],
            ['ε 을 잰 곳', 'policy 들이 직접 간 상태', 14.6],
          ]}
          lit={litDg}
        />
      </div>
      <Appear at={9.6} style={{ position: 'absolute', left: 64, top: 396 }}>
        <Label size={21} color={C.dim}>
          J: episode 하나에서 틀린 step 수의 평균 · O(1): T 가 커져도 일정한 크기 아래에 머무는 작은 항
        </Label>
      </Appear>
      <Appear at={18.2} style={{ position: 'absolute', left: 64, top: 440 }}>
        <Panel x={0} y={0} w={1200} h={440} style={{ position: 'relative' }}>
          <svg width={1200} height={440}>
            <text x={PL.x0} y={PL.top - 20} fill={C.muted} fontSize={22}>
              상한 · 더 틀릴 수 있는 step 수 (ε = 0.1, u = 2)
            </text>
            <line x1={PL.x0} x2={PL.x1 + 20} y1={PL.base} y2={PL.base} stroke={C.muted} strokeWidth={2} />
            <line x1={PL.x0} x2={PL.x0} y1={PL.top - 6} y2={PL.base} stroke={C.muted} strokeWidth={2} />
            {[5, 10].map((v) => (
              <g key={v}>
                <line x1={PL.x0} x2={PL.x1} y1={by(v)} y2={by(v)} stroke={C.grid} strokeWidth={2} />
                <text x={PL.x0 - 14} y={by(v) + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {v}
                </text>
              </g>
            ))}
            <polyline points={bcPts.map((T) => `${bx(T)},${by(T * T * EPS)}`).join(' ')} fill="none" stroke={C.red} strokeWidth={5} strokeLinejoin="round" />
            <line x1={bx(0)} y1={by(0)} x2={bx(10 * drawDg)} y2={by(U * 10 * drawDg * EPS)} stroke={C.green} strokeWidth={5} opacity={drawDg > 0 ? 1 : 0} />
            {TS.map((T) => (
              <g key={T}>
                <circle cx={bx(T)} cy={by(T * T * EPS)} r={8} fill={C.red} opacity={prog(t, bcAt(T), 0.3)} />
                <circle cx={bx(T)} cy={by(U * T * EPS)} r={8} fill={C.green} opacity={prog(t, dgAt(T), 0.3)} />
              </g>
            ))}
            <text x={bx(0.4)} y={by(8.4)} fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 21)}>
              behavior cloning T²ε · 휘어 오른다
            </text>
            <text x={bx(7)} y={by(3.2)} fill={C.green} fontSize={26} fontWeight={600} opacity={prog(t, 26.4)}>
              DAgger uTε · T 에 비례
            </text>
            {/* the values, one column per T */}
            {[
              { name: 'T', color: C.muted, y: PL.base + 34, v: (T: number) => String(T), at: () => 18.2 },
              { name: 'T²ε', color: C.red, y: PL.base + 80, v: (T: number) => num(T * T * EPS), at: bcAt },
              { name: 'uTε', color: C.green, y: PL.base + 122, v: (T: number) => num(U * T * EPS), at: dgAt },
            ].map((row) => (
              <g key={row.name}>
                <text x={PL.x0 - 30} y={row.y} textAnchor="end" fill={row.color} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {row.name}
                </text>
                {TS.map((T) => (
                  <text key={T} x={bx(T)} y={row.y} textAnchor="middle" fill={row.color} fontSize={26} fontFamily={MONO} fontWeight={row.name === 'T' ? 400 : 600} opacity={prog(t, row.at(T), 0.3)}>
                    {row.v(T)}
                  </text>
                ))}
              </g>
            ))}
            <line x1={PL.x0 - 90} x2={PL.x1 + 20} y1={PL.base + 50} y2={PL.base + 50} stroke={C.cardEdge} strokeWidth={1.5} />
          </svg>
        </Panel>
      </Appear>
      <div style={{ position: 'absolute', left: 1300, top: 440, width: 556, display: 'grid', gap: 20 }}>
        <Appear at={26.8}>
          <div style={{ padding: '22px 28px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 10 }}>
            <Label size={26} color={C.text} weight={600}>
              T 가 4 → 8 로 두 배면
            </Label>
            <Label size={26} color={C.green} weight={600}>
              DAgger 0.8 → 1.6 · 2 배
            </Label>
            <div style={{ opacity: prog(t, 28.8) }}>
              <Label size={26} color={C.red} weight={600}>
                behavior cloning 1.6 → 6.4 · 4 배
              </Label>
            </div>
          </div>
        </Appear>
        <Appear at={29.6}>
          <div style={{ padding: '22px 28px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 10 }}>
            <Label size={26} color={C.text} weight={600}>
              두 상한의 비 T²ε ÷ uTε = <span style={{ color: C.accent }}>T ÷ u</span>
            </Label>
            <Label size={24}>T = 10 이면 10 ÷ 2 = 5 배, T 가 클수록 더 벌어진다</Label>
            <div style={{ opacity: prog(t, 33.4) }}>
              <Label size={26} color={C.accent} weight={600}>
                로봇: 1초에 10 번 × 30 초 → T = 300
              </Label>
            </div>
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- a human expert ----------

function Hard({ at, n, title, text, color }: { at: number; n: number; title: string; text: string; color: string }) {
  return (
    <Appear at={at}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '22px 28px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
        <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, color, width: 34 }}>{n}</span>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 34, fontWeight: 600 }}>{title}</span>
          <Label size={26} style={{ lineHeight: 1.45 }}>
            {text}
          </Label>
        </div>
      </div>
    </Appear>
  )
}

const COUNT_ROWS: [string, string, string, number][] = [
  ['episode 하나', '10 × 60', '600', 17.6],
  ['iteration 하나 (episode 20 번)', '600 × 20', '12,000', 19.2],
  ['iteration 5 번', '12,000 × 5', '60,000', 20.8],
  ['0.1 초에 하나씩 답하는 시간', '60,000 ÷ 10', '6,000 초', 23.3],
]

function Human() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 146, display: 'flex', alignItems: 'center', gap: 26 }}>
        <Appear at={0.3}>
          <div style={{ padding: '16px 26px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.cardEdge}`, fontSize: 28 }}>
            <span style={{ color: C.muted }}>이 강의의 expert · </span>위치를 아는 프로그램 → 어디서든 바로 8y
          </div>
        </Appear>
        <Appear at={3.4}>
          <span style={{ fontSize: 34, color: C.muted }}>→</span>
        </Appear>
        <Appear at={3.6}>
          <div style={{ padding: '16px 26px', borderRadius: 16, background: `${C.orange}1a`, border: `1.5px solid ${C.orange}88`, fontSize: 28 }}>
            <span style={{ color: C.muted }}>실물 로봇의 expert · </span>
            <span style={{ color: C.orange, fontWeight: 600 }}>대개 사람</span>
          </div>
        </Appear>
      </div>
      <div style={{ position: 'absolute', left: 64, top: 270, width: 880, display: 'grid', gap: 22 }}>
        <Hard at={6.3} n={1} color={C.red} title="결과를 못 보고 답한다" text="policy 가 운전하는 동안 사람은 자기 답이 실행되는 모습을 못 본다. 정답의 질이 떨어진다" />
        <Hard at={12.7} n={2} color={C.red} title="서툰 policy 가 실물을 움직인다" text="차가 부딪히고, 팔이 물건을 떨어뜨린다" />
        <Hard at={17.2} n={3} color={C.orange} title="묻는 횟수가 많다" text="매 step 정답이 필요하다" />
      </div>
      <Appear at={17.4} style={{ position: 'absolute', left: 990, top: 270 }}>
        <Panel x={0} y={0} w={866} h={610} style={{ position: 'relative' }}>
          <div style={{ padding: '24px 30px', display: 'grid', gap: 6 }}>
            <Label size={24} style={{ marginBottom: 10 }}>
              1초에 10 번 제어 · 60 초 episode · iteration 마다 20 번 · 5 iteration
            </Label>
            <div style={{ display: 'flex', color: C.muted, fontSize: 22, paddingBottom: 8, borderBottom: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ width: 360 }}>항목</span>
              <span style={{ width: 210, textAlign: 'right' }}>계산</span>
              <span style={{ width: 236, textAlign: 'right' }}>묻는 횟수</span>
            </div>
            {COUNT_ROWS.map(([k, calc, v, at], i) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', minHeight: 78, opacity: prog(t, at, 0.5), borderBottom: i < 3 ? `1px solid ${C.grid}` : undefined }}>
                <span style={{ width: 360, fontSize: 26, lineHeight: 1.35 }}>{k}</span>
                <span style={{ width: 210, textAlign: 'right', fontFamily: MONO, fontSize: 24, color: C.muted }}>{calc}</span>
                <span style={{ width: 236, textAlign: 'right', fontFamily: MONO, fontSize: 30, fontWeight: 600, color: i === 3 ? C.text : C.orange }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, opacity: prog(t, 24.4), textAlign: 'right' }}>
              <Label size={40} color={C.red} weight={700}>
                = 100 분, 쉬지 않고
              </Label>
            </div>
          </div>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- HG-DAgger, LeRobot and RaC ----------

const TL = { x0: 300, x1: 1740 }
const tlx = (s: number) => TL.x0 + (s / 600) * (TL.x1 - TL.x0)
const TAKEOVERS: [number, number][] = [
  [120, 140],
  [300, 320],
  [470, 490],
]

function Hg() {
  const t = useSec()
  const head = 600 * prog(t, 0.9, 5)
  const rowA = 60
  const rowB = 150
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={370}>
        <svg width={1792} height={370}>
          {/* HG-DAgger: the policy drives, the human takes over three times */}
          <g opacity={prog(t, 0.3)}>
            <text x={40} y={rowB + 32} fill={C.text} fontSize={30} fontFamily={MONO} fontWeight={600}>
              HG-DAgger
            </text>
            <rect x={tlx(0)} y={rowB} width={tlx(600) - tlx(0)} height={46} rx={8} fill={C.grid} />
            <rect x={tlx(0)} y={rowB} width={tlx(head) - tlx(0)} height={46} rx={8} fill={C.blue} opacity={0.55} />
            {TAKEOVERS.map(([a, b]) => (
              <g key={a} opacity={head >= a ? 1 : 0}>
                <rect x={tlx(a)} y={rowB - 6} width={tlx(Math.min(b, head)) - tlx(a)} height={58} rx={6} fill={C.orange} />
                <text x={(tlx(a) + tlx(b)) / 2} y={rowB + 84} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO}>
                  {a}~{b}
                </text>
              </g>
            ))}
            <text x={tlx(0)} y={rowB + 84} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
              0
            </text>
            <text x={tlx(600)} y={rowB + 84} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
              600
            </text>
          </g>
          {/* DAgger: every step asked */}
          <g opacity={prog(t, 6.8)}>
            <text x={40} y={rowA + 32} fill={C.muted} fontSize={30} fontFamily={MONO} fontWeight={600}>
              DAgger
            </text>
            <rect x={tlx(0)} y={rowA} width={(tlx(600) - tlx(0)) * prog(t, 6.8, 0.8)} height={46} rx={8} fill={C.orange} opacity={0.75} />
            <text x={tlx(600) - 20} y={rowA + 32} textAnchor="end" fill={C.bg} fontSize={24} fontWeight={600} opacity={prog(t, 7.4)}>
              600 step 모두 사람에게 묻는다
            </text>
          </g>
          <text x={tlx(0)} y={282} fill={C.muted} fontSize={22} opacity={prog(t, 2)}>
            <tspan fill={C.blue}>■ policy 가 운전 · 기록 안 함</tspan>
            <tspan dx={30} fill={C.orange}>
              ■ 사람이 넘겨받아 운전 · 그대로 정답
            </tspan>
          </text>
          <text x={tlx(600)} y={282} textAnchor="end" fill={C.text} fontSize={28} fontWeight={700} opacity={prog(t, 9)}>
            20 × 3 = <tspan fill={C.orange}>60 개</tspan> · 600 의 10 분의 1
          </text>
          <text x={tlx(0)} y={336} fill={C.green} fontSize={25} fontWeight={600} opacity={prog(t, 12.8)}>
            결과를 보며 운전한다 · 넘겨받는 곳 = policy 가 데려간 위험한 상태 → 그 근처의 정답이 모인다
          </text>
        </svg>
      </Panel>
      <Appear at={18.8} style={{ position: 'absolute', left: 64, top: 540 }}>
        <Panel x={0} y={0} w={900} h={340} style={{ position: 'relative' }}>
          <div style={{ padding: '22px 26px', display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.blue }}>LeRobot</span>
              <Label size={24}>실물 팔 · leader 팔로 넘겨받는다</Label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {[
                { name: 'AUTONOMOUS', text: 'policy 가 팔을 움직인다', rec: '기록 안 함', color: C.blue, at: 19.4 },
                { name: 'PAUSED', text: 'leader 팔이 자세를 맞춘다', rec: '기록 안 함', color: C.muted, at: 20.4 },
                { name: 'CORRECTING', text: '사람이 leader 팔로 고친다', rec: 'intervention = True', color: C.orange, at: 21.4 },
              ].map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: prog(t, s.at) }}>
                  {i > 0 && <span style={{ color: C.muted, fontSize: 26 }}>→</span>}
                  <div style={{ width: 250, height: 160, boxSizing: 'border-box', padding: '14px 16px', borderRadius: 14, border: `2px solid ${s.color}88`, background: i === 2 ? `${C.orange}14` : C.bg, display: 'grid', alignContent: 'start', gap: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: s.color }}>{s.name}</span>
                    <Label size={21} color={C.text} style={{ lineHeight: 1.35 }}>
                      {s.text}
                    </Label>
                    <Label mono={i === 2} size={i === 2 ? 17 : 19} color={i === 2 ? C.orange : C.dim} style={{ whiteSpace: 'nowrap' }}>
                      {s.rec}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ opacity: prog(t, 22.6) }}>
              <Label size={23} color={C.text}>
                기본 <span style={{ fontFamily: MONO, color: C.muted }}>record_autonomous = False</span> · 사람 구간만 저장 = HG-DAgger
              </Label>
            </div>
          </div>
        </Panel>
      </Appear>
      <Appear at={25.2} style={{ position: 'absolute', left: 994, top: 540 }}>
        <Panel x={0} y={0} w={862} h={340} style={{ position: 'relative' }}>
          <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.purple }}>RaC</span>
              <Label size={24}>Recovery and Correction · 셔츠 걸기</Label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, opacity: prog(t, 25.8) }}>
              <span style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${C.purple}88` }}>① recovery 되돌리기</span>
              <span style={{ color: C.muted }}>→</span>
              <span style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${C.purple}88`, opacity: prog(t, 27.2) }}>② correction 끝까지</span>
              <span style={{ color: C.muted, opacity: prog(t, 28.6) }}>→</span>
              <span style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${C.cardEdge}`, opacity: prog(t, 28.6) }}>episode 끝</span>
            </div>
            {[
              { name: 'RaC', hours: 5, pct: '78.3 %', color: C.purple, note: '데이터 5 시간' },
              { name: '이전 연구', hours: 89, pct: '75.0 %', color: C.dim, note: '시연 약 89 시간' },
            ].map((r, i) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: i === 0 ? 8 : 0, opacity: prog(t, 31.2 + i * 1.2) }}>
                <span style={{ width: 120, fontSize: 24, color: r.color === C.dim ? C.muted : r.color, fontWeight: 600 }}>{r.name}</span>
                <div style={{ width: 440, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: Math.max(8, (r.hours / 89) * 290 * prog(t, 31.4 + i * 1.2, 0.8)), height: 26, borderRadius: 6, background: r.color, opacity: 0.85 }} />
                  <Label size={22} color={C.text} style={{ whiteSpace: 'nowrap' }}>
                    {r.note}
                  </Label>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.text }}>{r.pct}</span>
              </div>
            ))}
            <div style={{ opacity: prog(t, 34) }}>
              <Label size={21} color={C.dim}>
                과제 구성이 완전히 같지는 않다 · 데이터는 약 89 ÷ 5 ≈ 18 분의 1
              </Label>
            </div>
          </div>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- the answer: the rollouts of iterations 2, 3 and 4 ----------

const MINI = { w: 560, h: 450, x0: 60, x1: 520, base: 390, top: 120, yMax: 2.5 }
const mx = (k: number) => MINI.x0 + (k / 15) * (MINI.x1 - MINI.x0)
const my = (y: number) => MINI.base - (y / MINI.yMax) * (MINI.base - MINI.top)

function Rollout({ at, draw, path, c, title, end, endColor, laneRight = false, endAbove = false }: { at: number; draw: number; path: number[]; c: number; title: string; end: string; endColor: string; laneRight?: boolean; endAbove?: boolean }) {
  const t = useSec()
  const p = prog(t, draw, 1.4)
  const n = Math.max(1, Math.round(p * (path.length - 1)))
  const shown = path.slice(0, n + 1)
  const last = path.length - 1
  return (
    <Appear at={at}>
      <Panel x={0} y={0} w={MINI.w} h={MINI.h} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 26, top: 20 }}>
          <Label color={C.text} size={28} weight={600}>
            {title}
          </Label>
        </div>
        <svg width={MINI.w} height={MINI.h}>
          <rect x={MINI.x0} y={my(c)} width={MINI.x1 - MINI.x0} height={my(0) - my(c)} fill={C.orange} opacity={0.16} />
          <text x={MINI.x1 - 8} y={MINI.base - 10} textAnchor="end" fill={C.orange} fontSize={21}>
            아는 범위 {fmt(c)} m
          </text>
          <line x1={MINI.x0} x2={MINI.x1} y1={my(LANE)} y2={my(LANE)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 6" />
          <text x={laneRight ? MINI.x1 : MINI.x0} y={my(LANE) - 10} textAnchor={laneRight ? 'end' : 'start'} fill={C.muted} fontSize={20}>
            차선 경계 1.75
          </text>
          <line x1={MINI.x0} x2={MINI.x1} y1={MINI.base} y2={MINI.base} stroke={C.muted} strokeWidth={2} />
          {[0, 5, 10, 15].map((k) => (
            <text key={k} x={mx(k)} y={MINI.base + 30} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {k}
            </text>
          ))}
          <polyline points={shown.map((v, k) => `${mx(k)},${my(v)}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, draw - 0.2, 0.3)} />
          <g opacity={prog(t, draw - 0.2, 0.3)}>
            {shown.map((v, k) => (
              <circle key={k} cx={mx(k)} cy={my(v)} r={4} fill={v > c + 1e-6 ? C.red : C.blue} />
            ))}
          </g>
          <g opacity={prog(t, draw + 1.4)}>
            <circle cx={mx(last)} cy={my(path[last])} r={8} fill={endColor} />
            <text x={mx(last) - 14} y={endAbove ? my(LANE) - 14 : my(path[last]) + 8} textAnchor="end" fill={endColor} fontSize={24} fontWeight={700}>
              {end}
            </text>
          </g>
        </svg>
      </Panel>
    </Appear>
  )
}

function Answer() {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 150, width: 1792, display: 'grid', gap: 14 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            policy 가 실수한 뒤에만 들어가는 상태의 정답은 어디서?
          </Label>
        </Appear>
        <Appear at={1.4}>
          <div style={{ fontSize: 46, fontWeight: 700 }}>
            policy 에게 운전을 맡기고, <span style={{ color: C.accent }}>그 자리에서 expert 에게 묻는다</span>
          </div>
        </Appear>
      </div>
      <div style={{ position: 'absolute', left: 64, top: 370, width: 1792, display: 'flex', justifyContent: 'space-between' }}>
        <Rollout at={3} draw={7.8} path={DRIFT_Y} c={0.3} title="iteration 2 · 1000 쌍 (시연)" end="step 7 이탈" endColor={C.red} laneRight endAbove />
        <Rollout at={3.5} draw={9.4} path={ROLL_3} c={1.0} title="iteration 3 · 1700 쌍" end="step 14 이탈" endColor={C.red} />
        <Rollout at={4} draw={11} path={ROLL_4} c={1.7} title="iteration 4 · 3100 쌍" end="15 step 완주 · 1.5 m" endColor={C.green} endAbove />
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
            NEXT · SESSION 3
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600 }}>ACT</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={36}>
            관측 한 번에 action 여러 step 을 묶어 내는 action chunking
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

const PauseLoop = () => (
  <PauseWrite
    question="DAgger 한 iteration 의 네 단계와, 정답으로 expert 의 action 을 저장하는 이유는?"
    answer="① policy 로 운전 → ② 관측 기록 → ③ expert 정답 붙이기 → ④ 모은 데이터 전체로 재학습. policy 가 낸 1.6° 를 저장하면 자기 값을 다시 배울 뿐이라 아는 범위가 0.3 m 그대로다"
  />
)

const PauseBounds = () => (
  <PauseWrite
    question="ε = 0.05, u = 2, T = 20 이면 두 상한은 각각 얼마이고, 몇 배 차이일까?"
    answer="behavior cloning T²ε = 20 × 20 × 0.05 = 20, DAgger uTε = 2 × 20 × 0.05 = 2 로 10 배. T ÷ u = 20 ÷ 2 = 10 으로도 같다"
  />
)

const PauseHuman = () => (
  <PauseWrite
    question="사람에게 매 step 묻기 어려운 이유 두 가지와, HG-DAgger 가 정답을 기록하는 구간은?"
    answer="결과를 못 본 채 답해 정답의 질이 떨어지고, 서툰 policy 가 실물을 움직여 위험하다(묻는 횟수도 많다). HG-DAgger 는 사람이 위험하다고 보고 넘겨받은 구간만 기록한다"
  />
)

export function Dagger() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        loop: Loop,
        iteration2: Iteration2,
        'pause-loop': PauseLoop,
        chain: Chain,
        bounds: Bounds,
        'pause-bounds': PauseBounds,
        human: Human,
        hg: Hg,
        'pause-human': PauseHuman,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
