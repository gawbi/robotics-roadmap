import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './kalman-filter.narration.json'
import { script } from './kalman-filter.script'

// Numbers follow lessons/kalman-filter/README.md (see kalman-filter.script.ts). The bell curves are drawn from the lesson's
// means and variances (figures/kf-loop.svg, kf-gaussians.svg), the gain number lines follow figures/kf-gain.svg and the
// sensor-fusion flow follows figures/kf-fusion.svg.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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

const line = (color: string = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color: string = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** one line that fades in at `at` */
function Ln({ at, children, color = C.text, size = 23 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <div style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</div>
}

/** an SVG path of a bell curve with mean `mu` and variance `v`: `k / √v` px tall, drawn from v0 to v1 */
function bell(x: (m: number) => number, base: number, mu: number, v: number, k: number, v0: number, v1: number, closed = false) {
  const n = 140
  const s = Math.sqrt(v)
  const pts: string[] = []
  for (let i = 0; i <= n; i++) {
    const m = v0 + ((v1 - v0) * i) / n
    pts.push(`${x(m).toFixed(1)},${(base - (k / s) * Math.exp(-((m - mu) ** 2) / (2 * v))).toFixed(1)}`)
  }
  return closed ? `M${x(v0)},${base} L${pts.join(' L')} L${x(v1)},${base} Z` : `M${pts.join(' L')}`
}

function Bell({ x, base, mu, v, k, color, opacity = 1, v0 = -1.5, v1 = 5.5 }: { x: (m: number) => number; base: number; mu: number; v: number; k: number; color: string; opacity?: number; v0?: number; v1?: number }) {
  return (
    <g opacity={opacity}>
      <path d={bell(x, base, mu, v, k, v0, v1, true)} fill={color} opacity={0.13} />
      <path d={bell(x, base, mu, v, k, v0, v1)} fill="none" stroke={color} strokeWidth={4} />
    </g>
  )
}

/** the position axis shared by the predict and update scenes: −1.5 ~ 5.5 m */
const px = (m: number) => 120 + (m + 1.5) * 130
const BASE = 560
const PEAK = 300 // px height of a bell with variance 1

function Axis({ opacity = 1 }: { opacity?: number }) {
  return (
    <g opacity={opacity}>
      <line x1={px(-1.5)} y1={BASE} x2={px(5.5)} y2={BASE} stroke={C.muted} strokeWidth={2} />
      {[-1, 0, 1, 2, 3, 4, 5].map((m) => (
        <g key={m}>
          <line x1={px(m)} y1={BASE - 6} x2={px(m)} y2={BASE + 6} stroke={C.muted} strokeWidth={2} />
          <text x={px(m)} y={BASE + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            {m < 0 ? `−${-m}` : m}
          </text>
        </g>
      ))}
      <text x={px(5.5) + 14} y={BASE + 34} fill={C.muted} fontSize={20} fontFamily={MONO}>
        m
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
            ESTIMATION · KALMAN FILTER
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 100, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Kalman Filter</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontSize: 34, color: C.muted }}>
            틀린 예측 + 틀린 측정 → <span style={{ color: C.accent }}>둘보다 정확한 위치</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            예측과 보정을 되풀이하며 위치와 불확실성을 함께 고치는 법
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

/** where the robot really is, and where each sensor puts it: GPS jumps around, the wheel count falls behind more and more */
const TRUE = [0, 1, 2, 3, 4, 5, 6]
const GPS_OFF = [34, -46, 22, -30, 52, -18, 40]

function Question() {
  const t = useSec()
  const x = (i: number) => 330 + i * 210
  const lane = (y: number, color: string, label: string, sub: string, est: (i: number) => number, at: number) => (
    <g opacity={prog(t, at)}>
      <text x={40} y={y + 8} fill={color} fontSize={26} fontWeight={600}>
        {label}
      </text>
      <line x1={300} y1={y} x2={1720} y2={y} stroke={C.cardEdge} strokeWidth={2} />
      {TRUE.map((i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y} r={11} fill="none" stroke={C.green} strokeWidth={3} opacity={prog(t, at + i * 0.25, 0.3)} />
          <circle cx={x(i) + est(i)} cy={y} r={9} fill={color} opacity={prog(t, at + 0.15 + i * 0.25, 0.3)} />
        </g>
      ))}
      <text x={300} y={y + 56} fill={C.muted} fontSize={22}>
        {sub}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={400}>
        <svg width={1792} height={400}>
          {lane(90, C.orange, 'GPS', '잴 때마다 몇 m 씩 틀린다 · 오차가 쌓이지는 않는다', (i) => GPS_OFF[i], 0.3)}
          {lane(230, C.blue, '바퀴 odometry', '바퀴가 조금씩 미끄러져서 달릴수록 어긋난다', (i) => -i * 22, 1.6)}
          <g opacity={prog(t, 0.6)}>
            <circle cx={312} cy={352} r={11} fill="none" stroke={C.green} strokeWidth={3} />
            <text x={334} y={360} fill={C.muted} fontSize={22}>
              실제 위치
            </text>
            <circle cx={492} cy={352} r={9} fill={C.orange} />
            <circle cx={516} cy={352} r={9} fill={C.blue} />
            <text x={538} y={360} fill={C.muted} fontSize={22}>
              센서가 말하는 위치
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 580, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          둘 다 틀린 값을 섞으면 <span style={{ color: C.accent }}>어느 쪽보다도 정확한 위치</span>가 나올까?
        </div>
      </Appear>
      <Card x={330} y={700} w={1260} h={180} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 10, opacity: prog(t, 5.8) }}>
          <Head size={26}>1960 년 Rudolf Kalman 이 발표한 Kalman filter</Head>
          <span style={line(C.text, 23)}>메모리가 1 MB 도 안 되던 Apollo 11 의 컴퓨터가 달까지 가는 궤도를 추정했다</span>
          <span style={line(C.muted, 22)}>지금은 ROS 로봇이 위치를 계산할 때 많이 쓰는 robot_localization package 에도 들어 있다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- predict and update ----------

function Predict() {
  const t = useSec()
  const move = prog(t, 13.2, 1.6)
  const sig = px(1) - px(0)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            위치를 종 모양으로 기억한다
          </text>
          <Axis opacity={prog(t, 0.3)} />
          <Bell x={px} base={BASE} mu={0} v={1} k={PEAK} color={C.purple} opacity={prog(t, 0.6, 0.9) * (1 - 0.55 * prog(t, 20.2))} />
          <g opacity={prog(t, 1)}>
            <line x1={px(0)} y1={BASE - PEAK - 6} x2={px(0)} y2={BASE} stroke={C.purple} strokeWidth={2} strokeDasharray="7 6" />
            <text x={px(0)} y={BASE - PEAK - 20} textAnchor="middle" fill={C.purple} fontSize={24} fontFamily={MONO} fontWeight={600}>
              0 m · 분산 1
            </text>
          </g>
          <g opacity={prog(t, 6.7) * (1 - prog(t, 12.6, 0.4))}>
            <line x1={px(0) - sig} y1={BASE - 182} x2={px(0) + sig} y2={BASE - 182} stroke={C.text} strokeWidth={2.5} />
            <line x1={px(0) - sig} y1={BASE - 192} x2={px(0) - sig} y2={BASE - 172} stroke={C.text} strokeWidth={2.5} />
            <line x1={px(0) + sig} y1={BASE - 192} x2={px(0) + sig} y2={BASE - 172} stroke={C.text} strokeWidth={2.5} />
            <text x={px(0)} y={BASE - 140} textAnchor="middle" fill={C.text} fontSize={22}>
              흔들림
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <line x1={px(0)} y1={640} x2={px(0) + (px(2) - px(0)) * move} y2={640} stroke={C.orange} strokeWidth={4} />
            <polygon points={`${px(0) + (px(2) - px(0)) * move},628 ${px(0) + (px(2) - px(0)) * move + 18},640 ${px(0) + (px(2) - px(0)) * move},652`} fill={C.orange} />
            <text x={px(1) + 10} y={690} textAnchor="middle" fill={C.orange} fontSize={22}>
              바퀴로 2 m 앞으로 · 오차 분산 1
            </text>
          </g>
          <Bell x={px} base={BASE} mu={2} v={2} k={PEAK} color={C.blue} opacity={prog(t, 14.8, 0.9)} />
          <g opacity={prog(t, 15)}>
            <line x1={px(2)} y1={BASE - PEAK / Math.SQRT2 - 6} x2={px(2)} y2={BASE} stroke={C.blue} strokeWidth={2} strokeDasharray="7 6" />
            <text x={px(2) + 20} y={BASE - PEAK / Math.SQRT2 - 20} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              예측 2 m <tspan opacity={prog(t, 20.2)}>· 분산 2</tspan>
            </text>
          </g>
          <text x={1070} y={724} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 22)}>
            움직이기만 하면 종이 점점 넓어진다
          </text>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={300} at={0.3} title={<Head color={C.purple}>기억하는 두 숫자</Head>}>
        <Ln at={0.6}>
          가장 그럴듯한 값 → <span style={mono(C.purple, 24)}>0 m</span>
        </Ln>
        <Ln at={1.4}>흔들림의 크기 → 분산 · 클수록 덜 확실</Ln>
        <Ln at={6.7}>그래프로 그리면 Gaussian (정규분포) 종 모양</Ln>
      </Box>
      <Box x={1196} y={470} w={660} h={410} at={13} title={<Head color={C.blue}>① 예측 (predict)</Head>}>
        <Ln at={13.2}>
          이전 추정 <span style={mono(C.purple, 26)}>0 m · 분산 1</span>
        </Ln>
        <Ln at={14}>
          바퀴 이동 <span style={mono(C.orange, 26)}>+2 m · 오차 분산 1</span>
        </Ln>
        <Ln at={15}>
          예측 위치 <span style={mono(C.blue, 26)}>0 + 2 = 2 m</span>
        </Ln>
        <Ln at={20.2}>
          예측 분산 <span style={mono(C.blue, 26)}>1 + 1 = 2</span>
        </Ln>
        <Ln at={22} color={C.muted} size={22}>
          밖을 보지 않으면 불확실성은 계속 커진다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Update() {
  const t = useSec()
  const legend: [string, string, number][] = [
    ['예측 2 m · 분산 2', C.blue, 0.3],
    ['GPS 3 m · 분산 2', C.orange, 0.6],
    ['보정 2.5 m · 분산 1', C.green, 6.2],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            예측과 GPS 를 합친 결과
          </text>
          {legend.map(([label, color, at], i) => (
            <g key={label} opacity={prog(t, at)}>
              <line x1={30} y1={90 + i * 36} x2={56} y2={90 + i * 36} stroke={color} strokeWidth={4} />
              <text x={68} y={98 + i * 36} fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
            </g>
          ))}
          <Axis opacity={prog(t, 0.3)} />
          <Bell x={px} base={BASE} mu={2} v={2} k={PEAK} color={C.blue} opacity={prog(t, 0.3, 0.9) * (1 - 0.5 * prog(t, 6.2))} />
          <Bell x={px} base={BASE} mu={3} v={2} k={PEAK} color={C.orange} opacity={prog(t, 0.6, 0.9) * (1 - 0.5 * prog(t, 6.2))} />
          <Bell x={px} base={BASE} mu={2.5} v={1} k={PEAK} color={C.green} opacity={prog(t, 6.2, 0.9)} />
          <g opacity={prog(t, 6.6)}>
            <line x1={px(2.5)} y1={BASE - PEAK - 6} x2={px(2.5)} y2={BASE} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" />
            <text x={px(2.5) + 18} y={BASE - PEAK - 6} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              2.5 m
            </text>
          </g>
          <text x={30} y={640} fill={C.text} fontSize={24} opacity={prog(t, 12.2)}>
            합친 종이 더 좁다: 분산 1 &lt; 예측 2, 측정 2
          </text>
          <text x={30} y={690} fill={C.muted} fontSize={22} opacity={prog(t, 18.2)}>
            서로 다른 출처의 두 정보를 합치면 하나만 볼 때보다 확실해진다
          </text>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={330} at={0.3} title={<Head color={C.green}>② 보정 (update)</Head>}>
        <Ln at={0.4}>
          예측 <span style={mono(C.blue, 26)}>2 m · 분산 2</span>
        </Ln>
        <Ln at={0.8}>
          GPS 측정 <span style={mono(C.orange, 26)}>3 m · 오차 분산 2</span>
        </Ln>
        <Ln at={6.2}>
          분산이 같다 → 가운데 <span style={mono(C.green, 26)}>2.5 m</span>
        </Ln>
        <Ln at={12.2}>
          보정 뒤 분산 <span style={mono(C.green, 26)}>1</span> · 둘보다 작다
        </Ln>
      </Box>
      <Box x={1196} y={500} w={660} h={380} at={24} gap={0} title={<Head>1초에 수십 번 되풀이</Head>}>
        <div style={{ marginTop: 14, height: 56, borderRadius: 14, border: `1.5px solid ${C.blue}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 23 }}>
          <span>
            <span style={{ color: C.blue, fontWeight: 600 }}>① 예측</span> · 움직임으로 → 분산이 커진다
          </span>
        </div>
        <div style={{ height: 40, display: 'grid', placeItems: 'center', color: C.muted, fontSize: 26 }}>↓</div>
        <div style={{ height: 56, borderRadius: 14, border: `1.5px solid ${C.green}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 23 }}>
          <span>
            <span style={{ color: C.green, fontWeight: 600 }}>② 보정</span> · 측정으로 → 분산이 줄어든다
          </span>
        </div>
        <div style={{ height: 40, display: 'grid', placeItems: 'center', color: C.muted, fontSize: 26 }}>↓</div>
        <div style={{ height: 56, borderRadius: 14, border: `1.5px solid ${C.cardEdge}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 23 }}>
          <span>
            <span style={mono(C.green, 23)}>2.5 m · 분산 1</span> → 다음 예측의 출발점
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- Kalman gain ----------

function GainLine({ gpsVar, k, est, at }: { gpsVar: number; k: string; est: string; at: number }) {
  const t = useSec()
  const x = (m: number) => 80 + (m - 1.5) * 360
  const e = Number(est)
  return (
    <svg width={880} height={160} style={{ position: 'absolute', left: 0, top: 70 }}>
      <line x1={x(1.6)} y1={90} x2={x(3.4)} y2={90} stroke={C.muted} strokeWidth={2} />
      <line x1={x(2)} y1={90} x2={x(3)} y2={90} stroke={C.cardEdge} strokeWidth={8} />
      <circle cx={x(2)} cy={90} r={12} fill={C.blue} />
      <text x={x(2)} y={56} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
        예측 2 m
      </text>
      <circle cx={x(3)} cy={90} r={12} fill={C.orange} />
      <text x={x(3)} y={56} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
        GPS 3 m · 분산 {gpsVar}
      </text>
      <g opacity={prog(t, at + 0.8)}>
        <circle cx={x(2) + (x(e) - x(2)) * prog(t, at + 0.8, 1.2)} cy={90} r={14} fill="none" stroke={C.green} strokeWidth={4} />
        <text x={x(e)} y={140} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          k = {k} → {est} m
        </text>
      </g>
    </svg>
  )
}

function Gain() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={290} at={0.3}>
        <div style={{ padding: '24px 34px', display: 'grid', gap: 18 }}>
          <Head color={C.accent}>Kalman gain k · 더 확실한 쪽으로 얼마나 다가갈지 정하는 비율</Head>
          <div style={{ fontSize: 40, fontWeight: 600, opacity: prog(t, 6.2) }}>
            <span style={{ fontFamily: MONO, color: C.accent }}>k</span> = 예측의 분산 ÷ (예측의 분산 + 측정의 분산)
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, opacity: prog(t, 11.7) }}>
            새 위치 = 예측 + <span style={{ fontFamily: MONO, color: C.accent }}>k</span> × (측정 − 예측)
          </div>
        </div>
      </Card>
      <Card x={64} y={460} w={880} h={420} at={17.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={26}>GPS 분산 2 · 앞의 예</Head>
        </div>
        <GainLine gpsVar={2} k="0.5" est="2.5" at={17.5} />
        <div style={{ position: 'absolute', left: 30, top: 252, display: 'grid', gap: 10 }}>
          <Ln at={18}>
            <span style={mono(C.accent, 28)}>k = 2 ÷ (2 + 2) = 0.5</span>
          </Ln>
          <Ln at={19.5}>
            <span style={mono(C.green, 28)}>2 + 0.5 × (3 − 2) = 2.5 m</span>
          </Ln>
          <Ln at={20.5} color={C.muted} size={22}>
            분산이 같아서 정확히 가운데
          </Ln>
        </div>
      </Card>
      <Card x={976} y={460} w={880} h={420} at={23.5}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={26}>GPS 분산 6 · 나무가 많아 GPS 가 더 튄다</Head>
        </div>
        <GainLine gpsVar={6} k="0.25" est="2.25" at={23.5} />
        <div style={{ position: 'absolute', left: 30, top: 252, display: 'grid', gap: 10 }}>
          <Ln at={24}>
            <span style={mono(C.accent, 28)}>k = 2 ÷ (2 + 6) = 0.25</span>
          </Ln>
          <Ln at={25.5}>
            <span style={mono(C.green, 28)}>2 + 0.25 × 1 = 2.25 m</span>
          </Ln>
          <Ln at={26.5} color={C.muted} size={22}>
            믿기 어려운 GPS 보다 예측 쪽에 가깝게 남는다
          </Ln>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function GainCases() {
  const t = useSec()
  const x = (k: number) => 90 + k * 760
  const marks: [number, string, string, number][] = [
    [1, '1', C.orange, 0.5],
    [0, '0', C.blue, 6.7],
    [0.5, '0.5', C.green, 9.8],
  ]
  const rows: [string, string, string, string, number][] = [
    ['측정의 분산 → 0', '1 에 가까움', '측정값을 거의 그대로 믿는다', C.orange, 0.5],
    ['예측의 분산 → 0', '0 에 가까움', '측정을 거의 무시한다', C.blue, 6.7],
    ['둘이 비슷하다', '0.5 근처', '가운데쯤을 고른다', C.green, 9.8],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={510} at={0.3}>
        <svg width={1000} height={250}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            k 는 상황에 따라 0 과 1 사이에서 바뀐다
          </text>
          <line x1={x(0)} y1={140} x2={x(1)} y2={140} stroke={C.muted} strokeWidth={3} />
          <text x={x(0)} y={210} textAnchor="middle" fill={C.blue} fontSize={22}>
            예측을 믿는다
          </text>
          <text x={x(1)} y={210} textAnchor="middle" fill={C.orange} fontSize={22}>
            측정을 믿는다
          </text>
          {marks.map(([k, label, color, at]) => (
            <g key={label} opacity={prog(t, at)}>
              <circle cx={x(k)} cy={140} r={14} fill={color} />
              <text x={x(k)} y={108} textAnchor="middle" fill={color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 270, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted, fontSize: 22 }}>
            <span style={{ width: 280 }}>상황</span>
            <span style={{ width: 200 }}>k</span>
            <span style={{ width: 440 }}>결과</span>
          </div>
          {rows.map(([a, b, c, color, at]) => (
            <div key={a} style={{ display: 'flex', fontSize: 24, opacity: prog(t, at) }}>
              <span style={{ width: 280 }}>{a}</span>
              <span style={{ width: 200, fontFamily: MONO, color, fontWeight: 600 }}>{b}</span>
              <span style={{ width: 440 }}>{c}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={680} w={1000} h={200} at={20} title={<Head color={C.purple}>사람이 길을 찾을 때와 같다</Head>}>
        <Ln at={20.3}>낯선 길 → 표지판(측정)을 많이 믿는다</Ln>
        <Ln at={21.5}>매일 다니는 길 → 내 감(예측)을 더 믿는다</Ln>
      </Box>
      <div style={{ position: 'absolute', left: 1096, top: 140, width: 760 }}>
        <Misconception at={13.2} belief="Kalman filter 는 측정값의 noise 를 평균 내서 지우는 필터다" fact="움직임으로 예측한 값과 측정을 불확실성에 따라 섞는다" />
      </div>
      <Box x={1096} y={690} w={760} h={190} at={17}>
        <Ln at={17.2}>그래서 GPS 가 몇 초 끊겨도 예측만으로 위치를 이어 갈 수 있다</Ln>
        <Ln at={18.4} color={C.muted} size={22}>
          끊긴 동안 분산이 커져서, GPS 가 돌아오면 그 측정을 더 크게 믿는다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- Q and R ----------

function QR() {
  const t = useSec()
  const bars: [string, number, string, number, string][] = [
    ['Q = 0.1', 0.2, '0.2', 20.2, C.blue],
    ['Q = 1', 0.5, '0.5', 21.6, C.green],
    ['Q = 4', 0.73, '0.73', 23, C.orange],
  ]
  const base = 620
  const full = 440
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={400} at={0.3} gap={18} title={<Head>사람이 정해 넣는 두 분산</Head>}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'baseline', opacity: prog(t, 0.5) }}>
          <span style={mono(C.purple, 40)}>Q</span>
          <span style={line(C.text, 24)}>
            움직임의 오차 분산 · 바퀴 미끄러짐 · 앞의 예 <span style={mono(C.purple, 26)}>1</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'baseline', opacity: prog(t, 2.5) }}>
          <span style={mono(C.orange, 40)}>R</span>
          <span style={line(C.text, 24)}>
            센서의 오차 분산 · GPS 의 튐 · 앞의 예 <span style={mono(C.orange, 26)}>2</span>
          </span>
        </div>
        <Ln at={6.7}>실제 로봇에서는 이 두 값을 사람이 정해 넣는다</Ln>
        <Ln at={8.5} color={C.accent} size={26}>
          → Q 와 R 이 filter 의 성격을 정한다
        </Ln>
      </Box>
      <Box x={64} y={570} w={860} h={310} at={13} gap={16} title={<Head color={C.green}>수렴한 gain 비교</Head>}>
        <Ln at={13.2}>예측과 보정을 되풀이하면 gain 은 몇 step 만에 일정한 값으로 수렴한다</Ln>
        <Ln at={16}>
          <span style={mono(C.orange, 26)}>R = 2</span> 로 두고 <span style={mono(C.purple, 26)}>Q</span> 만 0.1, 1, 4 로 바꾼다
        </Ln>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={13}>
        <svg width={900} height={740}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            수렴한 Kalman gain · R = 2
          </text>
          {[0, 0.5, 1].map((g) => (
            <g key={g}>
              <line x1={130} y1={base - g * full} x2={840} y2={base - g * full} stroke={C.cardEdge} strokeWidth={2} strokeDasharray={g === 0 ? undefined : '8 8'} />
              <text x={110} y={base - g * full + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {g}
              </text>
            </g>
          ))}
          {bars.map(([label, g, v, at, color], i) => {
            const cx = 270 + i * 220
            const h = g * full * prog(t, at, 0.9)
            return (
              <g key={label} opacity={prog(t, at, 0.3)}>
                <rect x={cx - 60} y={base - h} width={120} height={h} rx={6} fill={color} opacity={0.85} />
                <text x={cx} y={base - g * full - 18} textAnchor="middle" fill={color} fontSize={32} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
                <text x={cx} y={base + 40} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO}>
                  {label}
                </text>
              </g>
            )
          })}
          <text x={30} y={710} fill={C.muted} fontSize={22} opacity={prog(t, 24)}>
            Q 가 클수록 수렴한 gain 이 커져서 측정을 크게 반영한다
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Tuning() {
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={210} at={0.3} title={<Head color={C.blue}>Q = 0.1 → gain 0.2</Head>}>
        <Ln at={0.6}>측정을 조금씩만 반영해 출력이 매끄럽다</Ln>
        <Ln at={2.5} color={C.red}>
          로봇이 갑자기 미끄러지면 늦게 따라간다
        </Ln>
      </Box>
      <Box x={976} y={140} w={880} h={210} at={6} title={<Head color={C.orange}>Q = 4 → gain 0.73</Head>}>
        <Ln at={6.3}>측정을 크게 반영해 빠르게 따라간다</Ln>
        <Ln at={8.3} color={C.red}>
          GPS 의 튐도 그대로 따라 흔들린다
        </Ln>
      </Box>
      <Box x={64} y={380} w={1792} h={170} at={12} title={<Head color={C.accent}>gain 을 정하는 것은 Q 와 R 의 비율</Head>}>
        <Ln at={12.4} size={28}>
          Q 를 키우는 것과 R 을 줄이는 것은 같은 쪽으로 움직인다 → 둘 다 <span style={mono(C.accent, 28)}>gain ↑</span>
        </Ln>
      </Box>
      <Box x={64} y={580} w={1100} h={300} at={18} gap={12} title={<Head color={C.green}>수렴한 gain 구하기 · 예측 분산 x = P + Q</Head>}>
        <Ln at={18.3}>
          보정 뒤 분산 P 가 매 cycle 같다 → <span style={mono(C.text, 26)}>(x − Q)(x + R) = xR</span>
        </Ln>
        <Ln at={19.8}>
          <span style={mono(C.green, 26)}>Q = 1, R = 2 → x² − x − 2 = 0 → x = 2</span>
        </Ln>
        <Ln at={21.5}>
          <span style={mono(C.accent, 26)}>gain = 2 ÷ (2 + 2) = 0.5</span>
        </Ln>
      </Box>
      <Box x={1196} y={580} w={660} h={300} at={24} title={<Head color={C.purple}>Q 와 R 의 출발점</Head>}>
        <Ln at={24.3}>센서 데이터시트의 noise 값</Ln>
        <Ln at={25.8}>로봇을 세워 둔 채 센서 값을 모아 잰 분산</Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- EKF and sensor fusion ----------

/** where a 1 m move ends when the heading is a little off: a bent band, not a bell */
const ARC = Array.from({ length: 21 }, (_, i) => {
  const a = ((-45 + i * 4.5) * Math.PI) / 180
  const r = 250 + [6, -8, 4, -3, 9, -6, 2, -9, 5, 7, 0, -4, 6, -7, 3, 8, -5, -2, 7, -8, 4][i]
  return [90 + r * Math.cos(a), 280 + r * Math.sin(a)] as const
})

function Ekf() {
  const t = useSec()
  const ax = (m: number) => 150 + m * 130
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={560} h={520} at={0.3}>
        <svg width={560} height={520}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            직선 관계
          </text>
          <Bell x={ax} base={330} mu={0} v={0.09} k={36} color={C.purple} v0={-0.9} v1={0.9} />
          <Bell x={ax} base={330} mu={2} v={0.09} k={36} color={C.blue} v0={1.1} v1={2.9} opacity={prog(t, 1.2)} />
          <g opacity={prog(t, 1.2)}>
            <line x1={ax(0) + 40} y1={170} x2={ax(2) - 54} y2={170} stroke={C.orange} strokeWidth={4} />
            <polygon points={`${ax(2) - 54},158 ${ax(2) - 34},170 ${ax(2) - 54},182`} fill={C.orange} />
            <text x={ax(1)} y={146} textAnchor="middle" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              +2 m
            </text>
          </g>
          <line x1={30} y1={330} x2={530} y2={330} stroke={C.muted} strokeWidth={2} />
          <text x={ax(0)} y={364} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0 m
          </text>
          <text x={ax(2)} y={364} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            2 m
          </text>
          <text x={30} y={430} fill={C.text} fontSize={23}>
            2 m 앞으로 → 위치에 2 m 를 더한다
          </text>
          <text x={30} y={470} fill={C.muted} fontSize={22}>
            종 모양 그대로 옮겨 가서 계산이 맞는다
          </text>
        </svg>
      </Card>
      <Card x={680} y={140} w={560} h={520} at={6.5}>
        <svg width={560} height={520}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            같은 1 m 앞으로
          </text>
          <g opacity={prog(t, 7)}>
            <circle cx={120} cy={290} r={30} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <line x1={150} y1={290} x2={236} y2={290} stroke={C.accent} strokeWidth={4} />
            <polygon points="236,278 256,290 236,302" fill={C.accent} />
            <text x={160} y={360} textAnchor="middle" fill={C.accent} fontSize={22}>
              x 쪽 이동
            </text>
          </g>
          <g opacity={prog(t, 9)}>
            <circle cx={400} cy={290} r={30} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <line x1={400} y1={260} x2={400} y2={174} stroke={C.pink} strokeWidth={4} />
            <polygon points="388,174 400,154 412,174" fill={C.pink} />
            <text x={400} y={360} textAnchor="middle" fill={C.pink} fontSize={22}>
              y 쪽 이동
            </text>
          </g>
          <text x={30} y={430} fill={C.text} fontSize={23} opacity={prog(t, 7.5)}>
            바라보는 방향에 따라 이동이 달라진다
          </text>
          <text x={30} y={470} fill={C.muted} fontSize={22} opacity={prog(t, 13.2)}>
            움직임이 각도의 sin · cos 를 따른다
          </text>
        </svg>
      </Card>
      <Card x={1296} y={140} w={560} h={520} at={13}>
        <svg width={560} height={520}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            휘어진 관계
          </text>
          <circle cx={90} cy={280} r={24} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} opacity={prog(t, 13.3)} />
          <text x={90} y={330} textAnchor="middle" fill={C.muted} fontSize={20} opacity={prog(t, 13.3)}>
            로봇
          </text>
          {ARC.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={6} fill={C.blue} opacity={0.8 * prog(t, 13.6 + i * 0.05, 0.3)} />
          ))}
          <g opacity={prog(t, 20.3)}>
            <line x1={340} y1={200} x2={340} y2={360} stroke={C.green} strokeWidth={4} />
            <text x={358} y={196} fill={C.green} fontSize={22} fontWeight={600}>
              EKF 직선
            </text>
          </g>
          <g opacity={prog(t, 23.5)}>
            {[-40, -20, 0, 20, 40].map((d) => {
              const a = (d * Math.PI) / 180
              return <circle key={d} cx={90 + 250 * Math.cos(a)} cy={280 + 250 * Math.sin(a)} r={11} fill="none" stroke={C.purple} strokeWidth={3.5} />
            })}
            <text x={358} y={314} fill={C.purple} fontSize={22} fontWeight={600}>
              UKF 점
            </text>
          </g>
          <text x={30} y={498} fill={C.muted} fontSize={22} opacity={prog(t, 15)}>
            도착점이 휘어진 띠 · 종 모양이 아니다
          </text>
        </svg>
      </Card>
      <Box x={64} y={690} w={880} h={190} at={20} title={<Head color={C.green}>EKF · Extended Kalman Filter</Head>}>
        <Ln at={20.3}>추정값 바로 근처에서만 휘어진 관계를 직선으로 근사</Ln>
        <Ln at={21.5} color={C.muted} size={22}>
          곡선 도로도 아주 짧게 잘라 보면 직선처럼 보인다
        </Ln>
      </Box>
      <Box x={976} y={690} w={880} h={190} at={23.3} title={<Head color={C.purple}>UKF · Unscented Kalman Filter</Head>}>
        <Ln at={23.6}>휘어진 관계에 점 몇 개를 직접 통과시켜 본다</Ln>
        <Ln at={24.8} color={C.muted} size={22}>
          더 정확한 대신 계산이 더 많다
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

function Fusion() {
  const t = useSec()
  const sensors: [string, string, string, number][] = [
    ['바퀴 odometry', '얼마나 굴렀나', C.orange, 100],
    ['IMU', '얼마나 돌았나', C.purple, 210],
    ['GPS', '지구 위 어디인가', C.blue, 320],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={510} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 22 }}>
          <Head size={26}>robot_localization · EKF node</Head>
        </div>
        <svg width={1000} height={510}>
          {sensors.map(([name, sub, color, y], i) => (
            <g key={name} opacity={prog(t, 0.5 + i * 0.4)}>
              <rect x={30} y={y} width={250} height={84} rx={12} fill={C.bg} stroke={color} strokeWidth={2} />
              <text x={155} y={y + 36} textAnchor="middle" fill={color} fontSize={24} fontWeight={600}>
                {name}
              </text>
              <text x={155} y={y + 68} textAnchor="middle" fill={C.muted} fontSize={20}>
                {sub}
              </text>
              <line x1={284} y1={y + 42} x2={352} y2={262} stroke={C.muted} strokeWidth={2.5} />
            </g>
          ))}
          <g opacity={prog(t, 1.6)}>
            <rect x={360} y={200} width={230} height={124} rx={14} fill={C.bg} stroke={C.green} strokeWidth={2.5} />
            <text x={475} y={250} textAnchor="middle" fill={C.green} fontSize={32} fontWeight={700}>
              EKF
            </text>
            <text x={475} y={290} textAnchor="middle" fill={C.text} fontSize={20}>
              예측 → 보정 반복
            </text>
            <line x1={594} y1={262} x2={630} y2={262} stroke={C.muted} strokeWidth={2.5} />
            <polygon points="630,252 648,262 630,272" fill={C.muted} />
          </g>
          <g opacity={prog(t, 2.4)}>
            <rect x={652} y={200} width={318} height={124} rx={14} fill={C.bg} stroke={C.text} strokeWidth={2} />
            <text x={811} y={250} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
              로봇의 상태 15 개
            </text>
            <text x={811} y={290} textAnchor="middle" fill={C.muted} fontSize={20}>
              위치·자세·속도·가속도
            </text>
          </g>
          <text x={30} y={470} fill={C.muted} fontSize={22} opacity={prog(t, 3.5)}>
            센서를 몇 개든 받아 하나의 추정으로 합친다 = sensor fusion
          </text>
        </svg>
      </Card>
      <Box x={1096} y={140} w={760} h={220} at={6} title={<Head>센서마다 약점이 다르다</Head>}>
        <Ln at={6.3}>
          <span style={{ color: C.orange }}>odometry</span> · <span style={{ color: C.purple }}>IMU</span> → 짧게는 매끄럽지만 오차가 쌓인다
        </Ln>
        <Ln at={8.5}>
          <span style={{ color: C.blue }}>GPS</span> → 오차가 쌓이지 않지만 순간순간 튄다
        </Ln>
      </Box>
      <Box x={1096} y={380} w={760} h={270} at={12} gap={8} title={<Head color={C.purple}>IMU 가속도 bias → 위치 오차 ½ × bias × t²</Head>}>
        <div style={{ display: 'flex', color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          <span style={{ width: 260 }}>가속도 bias</span>
          <span style={{ width: 200 }}>10 초 뒤</span>
          <span style={{ width: 200 }}>60 초 뒤</span>
        </div>
        {[
          ['0.01 m/s²', '0.5 m', '18 m', 12.4],
          ['0.05 m/s²', '2.5 m', '90 m', 14.5],
        ].map(([b, a10, a60, at]) => (
          <div key={b} style={{ display: 'flex', ...mono(C.text, 24), opacity: prog(t, at as number) }}>
            <span style={{ width: 260 }}>{b}</span>
            <span style={{ width: 200 }}>{a10}</span>
            <span style={{ width: 200, color: C.red }}>{a60}</span>
          </div>
        ))}
        <Ln at={16} color={C.muted} size={22}>
          0.01 m/s² 는 중력 가속도의 1000 분의 1 정도
        </Ln>
      </Box>
      <Box x={64} y={680} w={880} h={200} at={18} title={<Head color={C.green}>filter 두 개로 나눠 돌리기</Head>}>
        <Ln at={18.3}>
          <span style={mono(C.green, 24)}>odom</span> frame · 오차가 쌓이지만 매끄러운 추정
        </Ln>
        <Ln at={19.8}>
          <span style={mono(C.accent, 24)}>map</span> frame · 튈 수 있지만 전체적으로 정확한 추정
        </Ln>
      </Box>
      <Box x={976} y={680} w={880} h={200} at={24} title={<Head color={C.red}>부호를 먼저 확인한다 (REP-103)</Head>}>
        <Ln at={24.3}>반시계 방향으로 돌리면 yaw 가 커져야 한다</Ln>
        <Ln at={25.8}>
          평평한 곳의 IMU 는 z 축 가속도 <span style={mono(C.orange, 24)}>+9.81 m/s²</span>
        </Ln>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- pause scenes ----------

const PausePredict = () => (
  <PauseWrite
    question="0 m 에 분산 1 인 로봇이 GPS 없이 바퀴로 2 m 씩 두 번 갔다. 바퀴 움직임의 오차 분산은 매번 1 이다. 예측한 위치와 분산은?"
    answer={
      <>
        위치 0 + 2 + 2 = 4 m · 분산 1 + 1 + 1 = 3
        <br />
        밖을 보지 않으면 예측할 때마다 분산이 커진다
      </>
    }
  />
)

const PauseGain = () => (
  <PauseWrite
    question="예측은 10 m (분산 3), 측정은 14 m (분산 1) 다. 보정한 위치는 몇 m 일까?"
    answer={
      <>
        k = 3 ÷ (3 + 1) = 0.75 → 10 + 0.75 × (14 − 10) = 13 m
        <br />
        측정의 분산이 더 작아서 측정 쪽에 가깝게 간다
      </>
    }
  />
)

const PauseTune = () => (
  <PauseWrite
    question="filter 의 출력이 GPS 의 튐을 따라 너무 흔들린다. Q 와 R 을 각각 어느 쪽으로 바꿔야 할까?"
    answer={
      <>
        R 을 키우거나 Q 를 줄인다 → gain 이 작아져 측정을 덜 반영한다
        <br />
        실제 움직임을 늦게 따라가면 반대로 R 을 줄이거나 Q 를 키운다
      </>
    }
  />
)

const PauseTunnel = () => (
  <PauseWrite
    question="터널에 들어가 GPS 가 30 초 동안 끊겼다. 그동안 Kalman filter 의 추정과 불확실성은 어떻게 될까?"
    answer={
      <>
        예측만 되풀이 → 위치는 바퀴와 IMU 로 이어 가고 분산은 커진다
        <br />
        GPS 가 돌아오면 gain 이 1 에 가까워져 위치를 크게 고친다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: '예측과 보정', color: C.accent, text: '예측 0 m 분산 1 → 2 m 분산 2 · GPS 3 m 와 합쳐 2.5 m 분산 1', at: 0.4 },
    { tag: 'Kalman gain', color: C.blue, text: 'k = 2 ÷ (2 + 2) = 0.5 · GPS 분산 6 이면 k = 0.25 → 2.25 m', at: 4.3 },
    { tag: 'Q 와 R', color: C.orange, text: 'R = 2 에서 Q 0.1 / 1 / 4 → 수렴한 gain 0.2 / 0.5 / 0.73', at: 8.3 },
    { tag: 'EKF 와 센서 퓨전', color: C.green, text: '추정값 근처에서 직선 근사 · 바퀴, IMU, GPS → 상태 15 개', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            둘 다 틀린 값을 섞으면 어떻게 어느 쪽보다도 정확한 위치가 나올까?
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
            NEXT · ESTIMATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <Label color={C.muted} size={32}>
            Kalman filter 의 믿음은 늘 종 하나 · 봉우리가 두 개인 믿음은 나타낼 수 없다
          </Label>
        </Appear>
        <Appear at={3.9}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Particle Filter</div>
        </Appear>
        <Appear at={4.3}>
          <Label color={C.muted} size={34}>
            점 수천 개로 어떤 모양의 믿음이든 나타내기
          </Label>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/kalman-filter
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function KalmanFilter() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        predict: Predict,
        update: Update,
        'pause-predict': PausePredict,
        gain: Gain,
        'gain-cases': GainCases,
        'pause-gain': PauseGain,
        qr: QR,
        tuning: Tuning,
        'pause-tune': PauseTune,
        ekf: Ekf,
        fusion: Fusion,
        'pause-tunnel': PauseTunnel,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
