import { AbsoluteFill, interpolate, spring } from 'remotion'
import { Appear, Label, lerp, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, FPS, MONO, SANS } from '../theme'
import narration from './behavior-cloning.narration.json'
import { script } from './behavior-cloning.script'

// ---------- shared numbers (lessons/behavior-cloning/README.md) ----------

/** y after each step of the drift rule: 0.1 m inside the ±0.3 m demo band, 0.1 + (y − 0.3) outside */
const DRIFT_Y = [0, 0.1, 0.2, 0.3, 0.4, 0.6, 1.0, 1.8]
const BAND = 0.3
const LANE = 1.75
/** the seconds at which step k → k+1 starts in the drift scene */
const stepAt = (k: number) => 4 + 3 * k
const MOVE = 1.4

const fmt = (v: number) => (Math.round(v * 10) / 10).toFixed(1)

function Intro() {
  const t = useSec()
  const chips = script.sections
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 26, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 1 · IMITATION LEARNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 120, fontWeight: 600, letterSpacing: '-0.03em' }}>Behavior Cloning</div>
        </Appear>
        <Appear at={1.1}>
          <Label color={C.muted} size={40}>
            시연을 따라 배운 policy 가 실제로 돌리면 무너지는 세 가지 이유
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
  const curve = prog(t, 2, 1.6)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50, marginTop: -40 }}>
        <Appear at={0.3}>
          <div style={{ fontSize: 76, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            검증 loss 는 낮은데
            <br />
            <span style={{ color: C.accent }}>실제로 돌리면 왜 실패할까?</span>
          </div>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          <Appear at={1.6}>
            <Panel x={0} y={0} w={460} h={230} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>validation loss</Label>
              </div>
              <svg width={460} height={170} style={{ position: 'absolute', bottom: 0 }}>
                <path
                  d="M 30 20 C 120 120, 220 140, 430 150"
                  fill="none"
                  stroke={C.green}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={520}
                  strokeDashoffset={520 * (1 - curve)}
                />
                <text x={430} y={128} textAnchor="end" fill={C.green} fontSize={28} fontWeight={600} opacity={prog(t, 3.4)}>
                  낮음 ✓
                </text>
              </svg>
            </Panel>
          </Appear>
          <Appear at={3.6}>
            <Panel x={0} y={0} w={460} h={230} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>실제로 돌린 성공률</Label>
              </div>
              <div style={{ position: 'absolute', left: 30, right: 30, bottom: 50, height: 22, borderRadius: 11, background: C.grid }}>
                <div style={{ width: `${18 * prog(t, 4.2, 1)}%`, height: '100%', borderRadius: 11, background: C.red }} />
              </div>
              <div style={{ position: 'absolute', right: 30, bottom: 84, color: C.red, fontSize: 28, fontWeight: 600, opacity: prog(t, 5) }}>낮음 ✕</div>
            </Panel>
          </Appear>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ---------- compounding error: the car leaving the lane ----------

const ROAD = { x: 64, y: 140, w: 1180, h: 740, yc: 370, scale: 170, x0: 110, dx: 140 }
const ry = (y: number) => ROAD.yc - y * ROAD.scale
const rx = (k: number) => ROAD.x0 + k * ROAD.dx

/** where the car is at time t of the drift scene: [step position (fractional), y] */
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

function Drift() {
  const t = useSec()
  const [pos, y] = carAt(t)
  const k = Math.min(6, Math.floor(pos))
  const angle = (Math.atan2(-(DRIFT_Y[k + 1] - DRIFT_Y[k]) * ROAD.scale, ROAD.dx) * 180) / Math.PI
  const reached = Math.floor(pos + 1e-6)
  const out = y > BAND + 1e-6
  const crash = prog(t, stepAt(6) + MOVE, 0.4)
  const trail = DRIFT_Y.slice(0, reached + 1).map((v, i) => `${rx(i)},${ry(v)}`)
  trail.push(`${lerp(rx(0), rx(7), pos / 7)},${ry(y)}`)

  return (
    <AbsoluteFill>
      <Panel x={ROAD.x} y={ROAD.y} w={ROAD.w} h={ROAD.h}>
        <svg width={ROAD.w} height={ROAD.h}>
          {/* lane */}
          <rect x={40} y={ry(LANE)} width={ROAD.w - 80} height={ry(-LANE) - ry(LANE)} fill="#0e1628" />
          <line x1={40} x2={ROAD.w - 40} y1={ry(LANE)} y2={ry(LANE)} stroke={crash > 0 ? C.red : C.muted} strokeWidth={4 + 4 * crash} opacity={0.9} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(-LANE)} y2={ry(-LANE)} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          {/* outside the demos: lit when the car first gets there */}
          <g opacity={prog(t, stepAt(3) + MOVE, 0.6)}>
            <rect x={40} y={ry(LANE)} width={ROAD.w - 80} height={ry(BAND) - ry(LANE)} fill={C.red} opacity={0.07} />
            <rect x={40} y={ry(-BAND)} width={ROAD.w - 80} height={ry(-LANE) - ry(-BAND)} fill={C.red} opacity={0.07} />
            <text x={60} y={ry(1.25)} fill={C.red} fontSize={28} fontWeight={600}>
              0.3 m 바깥 · 시연에 없던 위치
            </text>
          </g>
          {/* demo band */}
          <rect x={40} y={ry(BAND)} width={ROAD.w - 80} height={ry(-BAND) - ry(BAND)} fill={C.orange} opacity={0.22 * prog(t, 0.4, 0.8)} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(BAND)} y2={ry(BAND)} stroke={C.orange} strokeWidth={2} opacity={0.6 * prog(t, 0.4, 0.8)} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(-BAND)} y2={ry(-BAND)} stroke={C.orange} strokeWidth={2} opacity={0.6 * prog(t, 0.4, 0.8)} />
          <line x1={40} x2={ROAD.w - 40} y1={ry(0)} y2={ry(0)} stroke={C.orange} strokeWidth={3} strokeDasharray="14 12" opacity={prog(t, 0.4, 0.8)} />
          <text x={ROAD.w - 52} y={ry(0) - 14} textAnchor="end" fill={C.orange} fontSize={24} opacity={prog(t, 0.8)}>
            expert · 시연 범위 ±0.3 m
          </text>
          <text x={52} y={ry(LANE) - 14} fill={crash > 0 ? C.red : C.muted} fontSize={24}>
            차선 경계 1.75 m
          </text>
          {/* trail and reached points */}
          <polyline points={trail.join(' ')} fill="none" stroke={C.blue} strokeWidth={4} strokeLinejoin="round" opacity={0.9} />
          {DRIFT_Y.slice(0, reached + 1).map((v, i) => (
            <g key={i}>
              <circle cx={rx(i)} cy={ry(v)} r={8} fill={v > BAND + 1e-6 ? C.red : C.blue} />
              <text x={rx(i)} y={ry(v) + 40} textAnchor="middle" fill={v > BAND + 1e-6 ? C.red : C.text} fontSize={24} fontFamily={MONO}>
                {fmt(v)}
              </text>
            </g>
          ))}
          {/* how far each step pushed */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const p = prog(t, stepAt(i) + 0.3, 0.5)
            const d = DRIFT_Y[i + 1] - DRIFT_Y[i]
            const outside = DRIFT_Y[i] > BAND + 1e-6
            return (
              <text
                key={i}
                x={(rx(i) + rx(i + 1)) / 2}
                y={(ry(DRIFT_Y[i]) + ry(DRIFT_Y[i + 1])) / 2 - 22}
                textAnchor="middle"
                fill={outside ? C.red : C.orange}
                fontSize={26}
                fontWeight={600}
                fontFamily={MONO}
                opacity={p}
              >
                +{fmt(d)}
              </text>
            )
          })}
          <g opacity={crash}>
            <text x={rx(7) - 80} y={ry(LANE) - 14} textAnchor="end" fill={C.red} fontSize={30} fontWeight={700}>
              차선 이탈 · step 7
            </text>
          </g>
          <Car x={lerp(rx(0), rx(7), pos / 7)} y={ry(y)} angle={angle} color={out ? C.red : C.blue} glow={out} />
        </svg>
      </Panel>
      <DriftTable t={t} />
      <Appear at={31} style={{ position: 'absolute', left: ROAD.x + 60, top: ROAD.y + ROAD.h - 100 }}>
        <Label color={C.text} size={34} weight={600}>
          작은 오차 → 시연에 없던 상황 → 더 큰 오차
        </Label>
      </Appear>
    </AbsoluteFill>
  )
}

function DriftTable({ t }: { t: number }) {
  const cols = ['step', 'y', '범위', '밀림', '다음 y']
  const widths = [80, 90, 110, 120, 120]
  return (
    <Panel x={1284} y={ROAD.y} w={572} h={ROAD.h}>
      <div style={{ padding: '26px 26px 0', display: 'grid', gap: 10, fontFamily: MONO, fontSize: 26 }}>
        <div style={{ display: 'flex', color: C.muted, fontSize: 22, paddingBottom: 8, borderBottom: `1.5px solid ${C.cardEdge}` }}>
          {cols.map((c, i) => (
            <span key={c} style={{ width: widths[i], textAlign: i === 0 ? 'left' : 'right', fontFamily: i === 2 ? undefined : MONO }}>
              {c}
            </span>
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const y = DRIFT_Y[k]
          const outside = y > BAND + 1e-6
          const color = outside ? C.red : C.text
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', height: 64, opacity: prog(t, stepAt(k), 0.4), color }}>
              <span style={{ width: widths[0] }}>{k}</span>
              <span style={{ width: widths[1], textAlign: 'right' }}>{fmt(y)}</span>
              <span style={{ width: widths[2], textAlign: 'right', fontSize: 22, color: outside ? C.red : C.orange }}>{outside ? '밖' : k === 3 ? '안 (끝)' : '안'}</span>
              <span style={{ width: widths[3], textAlign: 'right', fontWeight: 600 }}>{fmt(DRIFT_Y[k + 1] - y)}</span>
              <span style={{ width: widths[4], textAlign: 'right' }}>{fmt(DRIFT_Y[k + 1])}</span>
            </div>
          )
        })}
        <div style={{ marginTop: 18, fontSize: 22, color: C.muted, fontFamily: SANS, lineHeight: 1.5, opacity: prog(t, 16) }}>
          밖에서는 0.1 m 에 0.3 m 를 넘어선 거리를 더한 만큼 밀려난다
        </div>
      </div>
    </Panel>
  )
}

// ---------- compounding error: the chain, and T²ε ----------

function Grid({ x, y, red, title, sub }: { x: number; y: number; red: (i: number) => number; title: string; sub: string }) {
  const cell = 26
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div style={{ marginBottom: 18, display: 'grid', gap: 4 }}>
        <Label color={C.text} size={30} weight={600}>
          {title}
        </Label>
        <Label mono color={C.muted} size={24}>
          {sub}
        </Label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(10, ${cell}px)`, gap: 5 }}>
        {Array.from({ length: 100 }, (_, i) => {
          const r = red(i)
          return <div key={i} style={{ width: cell, height: cell, borderRadius: 7, background: r > 0 ? `color-mix(in srgb, ${C.red} ${Math.round(r * 100)}%, ${C.grid})` : C.grid }} />
        })}
      </div>
    </div>
  )
}

function Compound() {
  const t = useSec()
  const nodes = ['작은 오차', '시연에 없던 상황', '더 큰 오차']
  const turn = Math.max(0, t - 1.2)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 150, width: 1792 }}>
        <Appear at={0.2}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <span style={{ fontFamily: MONO, fontSize: 54, fontWeight: 600, color: C.accent }}>compounding error</span>
            <Label size={30}>compound = 복리. 이자에 이자가 붙듯 오차에 오차가 붙는다</Label>
          </div>
        </Appear>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 34 }}>
          {nodes.map((n, i) => {
            const lit = Math.floor(turn / 0.9) % 3 === i && t < 6
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <Appear at={0.6 + i * 0.4}>
                  <div
                    style={{
                      padding: '18px 30px',
                      borderRadius: 16,
                      fontSize: 32,
                      fontWeight: 600,
                      background: lit ? `${C.red}26` : C.card,
                      border: `1.5px solid ${lit ? C.red : C.cardEdge}`,
                      color: i === 2 ? C.red : C.text,
                    }}
                  >
                    {n}
                  </div>
                </Appear>
                <Appear at={0.8 + i * 0.4}>
                  <span style={{ fontSize: 40, color: C.muted }}>{i < 2 ? '→' : '↺'}</span>
                </Appear>
              </div>
            )
          })}
        </div>
      </div>
      <Appear at={6}>
        <Label mono color={C.muted} size={26} style={{ position: 'absolute', left: 64, top: 390 }}>
          episode 길이 T = 100 · 한 step 에 틀릴 확률 ε = 0.01
        </Label>
      </Appear>
      <Appear at={6.4}>
        <Grid x={64} y={450} red={(i) => (i === 37 ? prog(t, 8, 0.4) : 0)} title="실수가 이어지지 않으면" sub="T × ε = 100 × 0.01 = 1 번" />
      </Appear>
      <Appear at={11.6}>
        <Grid x={980} y={450} red={(i) => prog(t, 12.4 + i * 0.03, 0.2)} title="한 번 틀린 뒤 계속 틀리면 (최악)" sub="T² × ε = 100 × 100 × 0.01 = 100 번" />
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- distribution shift: the histogram ----------

const HIST = { x0: 200, x1: 1720, base: 640, top: 250, lo: -0.5, hi: 2.0 }
const hx = (m: number) => HIST.x0 + ((m - HIST.lo) / (HIST.hi - HIST.lo)) * (HIST.x1 - HIST.x0)
const COUNTS = [30, 150, 320, 330, 140, 30]

function Histogram() {
  const t = useSec()
  const bw = hx(0.1) - hx(0) - 6
  const maxH = HIST.base - HIST.top
  const dots = DRIFT_Y.map((v, i) => ({ v, at: i < 4 ? 7 + i * 1.1 : 13.4 + (i - 4) * 1.2, inside: v <= BAND + 1e-6 }))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740}>
          <line x1={HIST.x0 - 20} x2={HIST.x1 + 20} y1={HIST.base} y2={HIST.base} stroke={C.muted} strokeWidth={2} />
          {[-0.3, 0, 0.3, 1.0, 1.75].map((m) => (
            <g key={m}>
              <line x1={hx(m)} x2={hx(m)} y1={HIST.base} y2={HIST.base + 10} stroke={C.muted} strokeWidth={2} />
              <text x={hx(m)} y={HIST.base + 42} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO}>
                {m}
              </text>
            </g>
          ))}
          <text x={(HIST.x0 + HIST.x1) / 2} y={HIST.base + 86} textAnchor="middle" fill={C.muted} fontSize={24}>
            차가 가운데에서 벗어난 거리 y (m)
          </text>
          <line x1={hx(1.75)} x2={hx(1.75)} y1={HIST.top - 60} y2={HIST.base} stroke={C.muted} strokeDasharray="10 10" strokeWidth={2} opacity={0.7} />
          <text x={hx(1.75) + 12} y={HIST.top - 40} fill={C.muted} fontSize={22}>
            차선 경계
          </text>
          {COUNTS.map((n, i) => {
            const p = prog(t, 0.6 + i * 0.18, 0.7)
            const h = (n / 330) * maxH * p
            const x = hx(-0.3 + i * 0.1) + 3
            return (
              <g key={i}>
                <rect x={x} y={HIST.base - h} width={bw} height={h} rx={4} fill={C.orange} opacity={0.85} />
                <text x={x + bw / 2} y={HIST.base - h - 12} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} opacity={prog(t, 1.8)}>
                  {n}
                </text>
              </g>
            )
          })}
          <text x={HIST.x0} y={70} fill={C.orange} fontSize={26} fontWeight={600} opacity={prog(t, 1)}>
            ■ 시연 1000 step 의 위치 · 학습 데이터
          </text>
          <text x={HIST.x0} y={110} fill={C.blue} fontSize={26} fontWeight={600} opacity={prog(t, 6.6)}>
            ● policy 가 실행 중에 지나간 위치
          </text>
          {dots.map(({ v, at, inside }) => {
            const s = spring({ frame: Math.max(0, (t - at) * FPS), fps: FPS, config: { damping: 14 } })
            const y = interpolate(s, [0, 1], [HIST.top - 120, HIST.base - 26])
            return (
              <g key={v} opacity={t >= at ? 1 : 0}>
                <circle cx={hx(v)} cy={y} r={13} fill={inside ? C.blue : C.red} stroke={C.card} strokeWidth={3} />
                <text x={hx(v)} y={HIST.base - 52} textAnchor="middle" fill={inside ? C.green : C.red} fontSize={26} fontWeight={700} opacity={prog(t, at + 0.6)}>
                  {inside ? '✓' : '✕'}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 16.8)}>
            <text x={hx(1.0)} y={HIST.top + 40} textAnchor="middle" fill={C.red} fontSize={28} fontWeight={600}>
              0.4, 0.6, 1.0, 1.8 m 는 시연에 0 번
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={19.4} style={{ position: 'absolute', left: 980, top: 200 }}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', fontSize: 30, fontWeight: 600 }}>
          <span style={{ color: C.orange, fontFamily: MONO }}>학습: d_π*</span>
          <span style={{ color: C.muted, fontSize: 40 }}>≠</span>
          <span style={{ color: C.blue, fontFamily: MONO }}>실행: d_πθ</span>
          <span style={{ color: C.accent, marginLeft: 20 }}>distribution shift</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

function Validation() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 170 }}>
        <Misconception
          at={0.3}
          belief="validation loss 가 낮으면 rollout 도 잘 된다"
          fact="validation set 도 시연에서 떼어 둔 쌍이라 policy 가 밀려나 들어간 위치는 없다. 그래서 로봇 policy 는 rollout 성공률로 평가한다"
        />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36 }}>
        <Appear at={7.4}>
          <div style={{ padding: '22px 34px', borderRadius: 18, border: `2px solid ${C.blue}`, fontSize: 34, fontWeight: 600 }}>
            distribution shift <span style={{ color: C.muted, fontWeight: 500 }}>· 원인</span>
          </div>
        </Appear>
        <Appear at={8.2}>
          <svg width={140} height={40}>
            <line x1={0} x2={110 * prog(t, 8.2, 0.6)} y1={20} y2={20} stroke={C.muted} strokeWidth={4} />
            <path d="M 110 8 L 134 20 L 110 32 Z" fill={C.muted} opacity={prog(t, 8.7)} />
          </svg>
        </Appear>
        <Appear at={9}>
          <div style={{ padding: '22px 34px', borderRadius: 18, border: `2px solid ${C.red}`, fontSize: 34, fontWeight: 600 }}>
            compounding error <span style={{ color: C.muted, fontWeight: 500 }}>· 결과</span>
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- multimodal: swerving around the box ----------

const SW = { w: 1792, h: 740, yc: 370, carX: 170, boxX: 1150, half: 300 }

/** a demo path: straight, then around the box on one side, back to the lane centre */
function swervePath(side: -1 | 1, jitter: number): string {
  const dy = side * (180 + jitter)
  const { carX, boxX, yc } = SW
  return `M ${carX} ${yc} C ${carX + 300} ${yc}, ${boxX - 420} ${yc + dy}, ${boxX - 150} ${yc + dy} S ${boxX + 200} ${yc + dy}, ${boxX + 520} ${yc}`
}

function Swerve() {
  const t = useSec()
  const demos = Array.from({ length: 10 }, (_, i) => ({ side: (i % 2 === 0 ? -1 : 1) as -1 | 1, jitter: ((i * 37) % 5) * 9 - 18, at: 1 + i * 0.55 }))
  const fan = [-20, -10, 0, 10, 20]
  const go = prog(t, 20, 3.4)
  const hit = prog(t, 23.4, 0.3)
  const carX = lerp(SW.carX, SW.boxX - 100, go)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={SW.w} h={SW.h}>
        <svg width={SW.w} height={SW.h}>
          <rect x={30} y={SW.yc - SW.half} width={SW.w - 60} height={SW.half * 2} fill="#0e1628" />
          <line x1={30} x2={SW.w - 30} y1={SW.yc - SW.half} y2={SW.yc - SW.half} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          <line x1={30} x2={SW.w - 30} y1={SW.yc + SW.half} y2={SW.yc + SW.half} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          {demos.map((d, i) => (
            <path
              key={i}
              d={swervePath(d.side, d.jitter)}
              fill="none"
              stroke={C.green}
              strokeWidth={3}
              strokeDasharray={1600}
              strokeDashoffset={1600 * (1 - prog(t, d.at, 1.2))}
              opacity={0.75 * (1 - 0.6 * prog(t, 19, 0.8))}
            />
          ))}
          <g opacity={prog(t, 6.6)}>
            <text x={SW.boxX - 150} y={SW.yc - 240} textAnchor="middle" fill={C.green} fontSize={30} fontWeight={700} fontFamily={MONO}>
              −20° × 5
            </text>
            <text x={SW.boxX - 150} y={SW.yc + 265} textAnchor="middle" fill={C.green} fontSize={30} fontWeight={700} fontFamily={MONO}>
              +20° × 5
            </text>
          </g>
          {/* the box */}
          <g transform={`translate(${SW.boxX} ${SW.yc}) scale(${1 + 0.08 * hit})`}>
            <rect x={-60} y={-60} width={120} height={120} rx={12} fill={C.orange} opacity={0.9} />
            <text x={0} y={12} textAnchor="middle" fill={C.bg} fontSize={30} fontWeight={700}>
              상자
            </text>
          </g>
          {/* steering fan */}
          <g opacity={prog(t, 12.2, 0.6) * (1 - prog(t, 19.2, 0.6))}>
            <path
              d={`M ${SW.carX} ${SW.yc} L ${SW.carX + 520 * Math.cos((-10 * Math.PI) / 180)} ${SW.yc + 520 * Math.sin((-10 * Math.PI) / 180)} A 520 520 0 0 1 ${SW.carX + 520 * Math.cos((10 * Math.PI) / 180)} ${SW.yc + 520 * Math.sin((10 * Math.PI) / 180)} Z`}
              fill={C.red}
              opacity={0.22}
            />
            {fan.map((a) => {
              const r = 560
              const ex = SW.carX + r * Math.cos((a * Math.PI) / 180)
              const ey = SW.yc + r * Math.sin((a * Math.PI) / 180)
              const ok = Math.abs(a) >= 20
              return (
                <g key={a}>
                  <line x1={SW.carX} y1={SW.yc} x2={ex} y2={ey} stroke={ok ? C.green : C.red} strokeWidth={4} />
                  <text x={ex + 20} y={ey + 10} fill={ok ? C.green : C.red} fontSize={28} fontFamily={MONO} fontWeight={600}>
                    {a > 0 ? `+${a}` : a}°
                  </text>
                </g>
              )
            })}
            <text x={SW.carX - 60} y={SW.yc - SW.half + 52} fill={C.red} fontSize={30} fontWeight={600}>
              빨간 부채꼴 −10° ~ +10° 는 상자에 부딪힌다
            </text>
          </g>
          {/* the MSE policy goes straight */}
          <g opacity={prog(t, 19.4)}>
            <line x1={SW.carX} y1={SW.yc} x2={SW.boxX - 70} y2={SW.yc} stroke={C.blue} strokeWidth={4} strokeDasharray="14 12" />
            <text x={SW.carX + 20} y={SW.yc - 40} fill={C.blue} fontSize={30} fontWeight={600}>
              MSE policy: 평균 0°
            </text>
          </g>
          <g opacity={hit}>
            <circle cx={SW.boxX - 70} cy={SW.yc} r={70 + 60 * hit} fill={C.red} opacity={0.25 * (1 - prog(t, 24, 1.5))} />
            <text x={SW.boxX} y={SW.yc - 100} textAnchor="middle" fill={C.red} fontSize={36} fontWeight={700}>
              충돌
            </text>
          </g>
          <Car x={carX} y={SW.yc} angle={0} color={hit > 0 ? C.red : C.blue} />
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- multimodal: the MSE curve ----------

const PLOT = { x0: 200, x1: 1260, base: 640, top: 140, aLo: -30, aHi: 30, mHi: 1000 }
const px = (a: number) => PLOT.x0 + ((a - PLOT.aLo) / (PLOT.aHi - PLOT.aLo)) * (PLOT.x1 - PLOT.x0)
const py = (m: number) => PLOT.base - (m / PLOT.mHi) * (PLOT.base - PLOT.top)
/** 5 demos at −20° and 5 at +20°: MSE(a) = ((a + 20)² + (a − 20)²) / 2 = a² + 400 */
const mse = (a: number) => a * a + 400

function Mse() {
  const t = useSec()
  const draw = prog(t, 0.4, 2.4)
  // past ±24.4° the MSE runs over the top of the plot (1000)
  const curve = Array.from({ length: 121 }, (_, i) => -30 + i * 0.5).filter((a) => mse(a) <= PLOT.mHi && a <= -30 + 60 * draw)
  const pts = [-20, -10, 0, 10, 20]
  const ball = lerp(-20, 0, prog(t, 7.6, 4.6))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={740}>
        <svg width={1792} height={740}>
          <rect x={px(-10)} y={PLOT.top - 20} width={px(10) - px(-10)} height={PLOT.base - PLOT.top + 20} fill={C.red} opacity={0.12 * prog(t, 1.4)} />
          <text x={px(0)} y={PLOT.top + 10} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 1.6)}>
            부딪히는 구간
          </text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} stroke={C.muted} strokeWidth={2} />
          <line x1={PLOT.x0} x2={PLOT.x0} y1={PLOT.top - 20} y2={PLOT.base} stroke={C.muted} strokeWidth={2} />
          {[-30, -20, -10, 0, 10, 20, 30].map((a) => (
            <text key={a} x={px(a)} y={PLOT.base + 40} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO}>
              {a > 0 ? `+${a}` : a}°
            </text>
          ))}
          {[400, 800].map((m) => (
            <g key={m}>
              <line x1={PLOT.x0} x2={PLOT.x1} y1={py(m)} y2={py(m)} stroke={C.grid} strokeWidth={2} />
              <text x={PLOT.x0 - 16} y={py(m) + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {m}
              </text>
            </g>
          ))}
          <text x={PLOT.x0} y={PLOT.top - 40} fill={C.muted} fontSize={24}>
            MSE
          </text>
          <text x={(PLOT.x0 + PLOT.x1) / 2} y={PLOT.base + 84} textAnchor="middle" fill={C.muted} fontSize={24}>
            policy 가 내는 핸들 각도 â
          </text>
          <polyline points={curve.map((a) => `${px(a)},${py(mse(a))}`).join(' ')} fill="none" stroke={C.accent} strokeWidth={5} />
          {pts.map((a, i) => {
            const ok = Math.abs(a) === 20
            return (
              <g key={a} opacity={prog(t, 1.4 + i * 0.35) * (a === 0 ? 1 - prog(t, 11, 0.4) : 1)}>
                <circle cx={px(a)} cy={py(mse(a))} r={11} fill={ok ? C.green : C.red} />
                <text x={px(a)} y={py(mse(a)) - 24} textAnchor="middle" fill={ok ? C.green : C.red} fontSize={26} fontFamily={MONO} fontWeight={600}>
                  {mse(a)}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 3.6)}>
            <text x={px(-20)} y={py(800) - 64} textAnchor="middle" fill={C.green} fontSize={26} fontWeight={600}>
              피한다
            </text>
            <text x={px(20)} y={py(800) - 64} textAnchor="middle" fill={C.green} fontSize={26} fontWeight={600}>
              피한다
            </text>
          </g>
          {/* gradient descent rolls the answer down to the mean */}
          <g opacity={prog(t, 7.4)}>
            <circle cx={px(ball)} cy={py(mse(ball))} r={17} fill={C.blue} stroke={C.card} strokeWidth={4} />
          </g>
          <g opacity={prog(t, 12.2)}>
            <text x={px(0)} y={py(400) + 70} textAnchor="middle" fill={C.blue} fontSize={30} fontWeight={700}>
              최소 400 → policy 는 0°
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={14.2} style={{ position: 'absolute', left: 1400, top: 220, width: 420 }}>
        <div style={{ padding: '24px 28px', borderRadius: 18, background: C.bg, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 12 }}>
          <Label size={24}>MSE 를 가장 작게 하는 값</Label>
          <Label color={C.accent} size={34} weight={700}>
            = 정답들의 평균
          </Label>
          <Label mono color={C.text} size={24} style={{ lineHeight: 1.5 }}>
            (5×(−20) + 5×(+20)) ÷ 10
            <br />= 0°
          </Label>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- multimodal: two peaks, and what fixes it ----------

const MODE_BINS: [number, number][] = [
  [-22, 2],
  [-20, 5],
  [-18, 3],
  [18, 3],
  [20, 5],
  [22, 2],
]

function Modes() {
  const t = useSec()
  const x0 = 70
  const x1 = 840
  const base = 330
  const ax = (a: number) => x0 + ((a + 26) / 52) * (x1 - x0)
  const fixes = [
    { name: 'RT-1', text: 'action 구간마다 확률을 내고 한 구간을 고른다', color: C.blue },
    { name: 'ACT', text: '학습 땐 style z 로 갈림을 받는다. 실행 땐 z = 0 이라 봉우리 보장은 없다', color: C.orange },
    { name: 'Diffusion Policy', text: '무작위에서 출발해 고쳐 가며 봉우리 하나에 도착한다', color: C.purple },
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={480}>
        <div style={{ padding: '22px 30px' }}>
          <Label color={C.text} size={30} weight={600}>
            상자 앞 시연 20 개의 action
          </Label>
        </div>
        <svg width={900} height={400} style={{ position: 'absolute', top: 70 }}>
          <line x1={x0} x2={x1} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
          {[-20, 0, 20].map((a) => (
            <text key={a} x={ax(a)} y={base + 34} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              {a > 0 ? `+${a}` : a}°
            </text>
          ))}
          {MODE_BINS.map(([a, n], i) => {
            const h = (n / 5) * 200 * prog(t, 0.4 + i * 0.15, 0.6)
            return <rect key={a} x={ax(a) - 13} y={base - h} width={26} height={h} rx={4} fill={C.green} opacity={0.85} />
          })}
          <g opacity={prog(t, 2.6)}>
            <line x1={ax(0)} x2={ax(0)} y1={60} y2={base} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
            <text x={ax(0)} y={44} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={600}>
              평균 0° · 시연 0 개
            </text>
          </g>
          <text x={ax(-20)} y={112} textAnchor="middle" fill={C.green} fontSize={24} opacity={prog(t, 1.6)}>
            봉우리 ①
          </text>
          <text x={ax(20)} y={112} textAnchor="middle" fill={C.green} fontSize={24} opacity={prog(t, 1.6)}>
            봉우리 ②
          </text>
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: 1000, top: 160, width: 856 }}>
        <Misconception at={6.6} belief="시연을 더 모으면 풀린다" fact="왼쪽 500 번, 오른쪽 500 번이어도 평균은 그대로 0° 다" />
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 660, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {fixes.map((f, i) => (
          <Appear key={f.name} at={12.6 + i * 0.8}>
            <div style={{ height: 200, padding: '22px 26px', borderRadius: 18, background: C.card, border: `1.5px solid ${f.color}66`, display: 'grid', alignContent: 'start', gap: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 600, color: f.color }}>{f.name}</span>
              <Label color={C.text} size={26} style={{ lineHeight: 1.45, textWrap: 'balance' }}>
                {f.text}
              </Label>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Answer() {
  const items = [
    { tag: 'distribution shift', color: C.blue, text: '검증 loss 는 시연이 지나간 위치에서만 잰 오차다' },
    { tag: 'compounding error', color: C.red, text: '밀려난 곳에서 오차가 쌓여 커진다 · 최악 T²ε' },
    { tag: 'multimodal', color: C.green, text: '정답이 갈리면 MSE 는 아무도 안 한 평균을 낸다' },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 170, display: 'grid', gap: 26, width: 1500 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            검증 loss 는 낮은데 실제로 돌리면 왜 실패할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={1.4 + i * 1.6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '26px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 38, fontWeight: 600 }}>{it.text}</span>
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
            NEXT · SESSION 2
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600 }}>DAgger</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={36}>
            policy 가 직접 간 상태에서 expert 에게 정답을 묻는다
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

const PauseCompound = () => (
  <PauseWrite
    question="compounding error 를 한 문장으로, 차 예시의 숫자 하나와 함께"
    answer="작은 오차 → 시연에 없던 상황 → 더 큰 오차. 0.3 m 를 넘자 0.2 → 0.4 → 0.8 m 로 커졌다"
  />
)

const PauseShift = () => (
  <PauseWrite
    question="validation loss 가 낮아도 실제로 돌리면 실패할 수 있는 이유를 한 줄로"
    answer="validation set 도 시연(d_π*)에서 뽑아서, policy 가 밀려나 들어간 상태(d_πθ)의 오차는 재지 못한다"
  />
)

const PauseModes = () => (
  <PauseWrite
    question="±20° 로 반반 갈린 시연에서 MSE 로 학습한 policy 가 0° 를 내는 이유는?"
    answer="MSE 를 가장 작게 하는 값은 정답들의 평균이고, (−20 + 20) ÷ 2 = 0° 는 아무도 하지 않은 action 이다"
  />
)

export function BehaviorCloning() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        drift: Drift,
        compound: Compound,
        'pause-compound': PauseCompound,
        histogram: Histogram,
        validation: Validation,
        'pause-shift': PauseShift,
        swerve: Swerve,
        mse: Mse,
        modes: Modes,
        'pause-modes': PauseModes,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
