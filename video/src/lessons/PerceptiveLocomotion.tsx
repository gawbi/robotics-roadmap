import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './perceptive-locomotion.narration.json'
import { script } from './perceptive-locomotion.script'

// Numbers follow lessons/perceptive-locomotion/README.md (see perceptive-locomotion.script.ts). The robot, step, obstacle
// and depth-image drawings are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false }: { children: ReactNode; color?: string; at: number; mono?: boolean }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Appear>
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

function Box({ x, y, w, h, title, color = C.cardEdge, at, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap: 14 }}>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, fontFamily: MONO, fontWeight: 600, whiteSpace: 'nowrap' })

/** a side-view quadruped, body from x to x + 180 at height y (its back), facing right */
function Robot({ x, y, color = C.blue, legLift = 0 }: { x: number; y: number; color?: string; legLift?: number }) {
  const ground = y + 110
  return (
    <g>
      <rect x={x} y={y} width={180} height={44} rx={10} fill="#111a2e" stroke={color} strokeWidth={3} />
      <rect x={x + 176} y={y - 10} width={40} height={34} rx={8} fill="#111a2e" stroke={color} strokeWidth={3} />
      <circle cx={x + 208} cy={y + 7} r={5} fill={color} />
      <line x1={x + 22} y1={y + 44} x2={x + 10} y2={ground} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <line x1={x + 50} y1={y + 44} x2={x + 52} y2={ground} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <line x1={x + 130} y1={y + 44} x2={x + 128} y2={ground} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <line x1={x + 158} y1={y + 44} x2={x + 176} y2={ground - legLift} stroke={color} strokeWidth={4} strokeLinecap="round" />
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
            RL · PERCEPTIVE LOCOMOTION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Perceptive Locomotion</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            ANYmal · Unitree A1 · <span style={{ color: C.accent }}>exteroception</span> 으로 지형을 보고 걷는 policy
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            발이 닿기 전에 계단을 보는 보행 · 높이 지도의 height sample 과 egocentric depth image
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
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Label size={24}>앞 강의의 student policy · 몸 안의 센서(proprioception)만 쓰는 blind policy</Label>
          <Flow steps={['관절 각도 · IMU 의 최근 이력', 'policy', 'action']} color={C.red} at={0.6} last="→ 계단은 앞발이 앞면에 부딪힌 뒤에야 안다" />
          <div style={{ opacity: prog(t, 2.6) }}>
            <Label size={24}>Miki 등(2022) · ANYmal · 나무 단</Label>
          </div>
          <div style={{ display: 'flex', gap: 16, opacity: prog(t, 2.8) }}>
            <Chip at={2.8} color={C.red}>
              단 높이 20 cm 에 이르자 앞발이 자주 걸려 성공률이 떨어졌다
            </Chip>
          </div>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          발이 닿기 전에 계단을 알아채려면 <span style={{ color: C.accent }}>policy 에 무엇을 어떤 모양으로 보여 주어야 할까?</span>
        </div>
      </Appear>
      <Panel x={230} y={640} w={1460} h={210}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 6) }}>
          <Label size={22}>몸 밖을 재는 센서(exteroception)로 지형을 넣는 두 갈래</Label>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 6.2) }}>
            <span style={{ ...mono(C.green, 28), width: 40 }}>1</span>
            <span style={line()}>LiDAR · depth camera 의 점 → 로봇 둘레의 높이 지도 → 발 주변 height sample (Miki 등)</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 6.9) }}>
            <span style={{ ...mono(C.orange, 28), width: 40 }}>2</span>
            <span style={line()}>depth camera 사진을 그대로 neural network 에 (Agarwal 등)</span>
          </div>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- blind vs perceptive ----------

function Blind() {
  const t = useSec()
  const ground = 560
  const footX = 300 // front foot
  const stepX = footX + 480 // 1.0 m at 480 px/m
  const stepTop = ground - 96 // 0.2 m
  const ticks = 100
  const seen = prog(t, 13.8, 1.4)
  const filled = Math.round(ticks * prog(t, 14.6, 4))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            예로 든 값 · 0.5 m/s 로 걷는 로봇 앞 1.0 m 의 0.2 m 계단
          </text>
          <text x={1070} y={46} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 0.3)}>
            모식도
          </text>
          {/* ground and step */}
          <g opacity={prog(t, 6.7)}>
            <line x1={40} x2={stepX} y1={ground} y2={ground} stroke={C.muted} strokeWidth={4} />
            <path d={`M${stepX},${ground} L${stepX},${stepTop} L${1060},${stepTop}`} fill="none" stroke={C.muted} strokeWidth={4} />
            <rect x={stepX} y={stepTop} width={1060 - stepX} height={ground - stepTop} fill={C.cardEdge} opacity={0.5} />
            <text x={stepX + 70} y={ground - 36} fill={C.text} fontSize={24} fontFamily={MONO}>
              0.2 m
            </text>
            <line x1={footX} x2={stepX} y1={ground + 54} y2={ground + 54} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <line x1={footX} x2={footX} y1={ground + 42} y2={ground + 66} stroke={C.dim} strokeWidth={2} />
            <line x1={stepX} x2={stepX} y1={ground + 42} y2={ground + 66} stroke={C.dim} strokeWidth={2} />
            <text x={(footX + stepX) / 2} y={ground + 94} textAnchor="middle" fill={C.muted} fontSize={24} fontFamily={MONO}>
              앞발에서 1.0 m
            </text>
          </g>
          {/* robot */}
          <g opacity={prog(t, 6.9)}>
            <Robot x={footX - 176} y={ground - 110} />
            <line x1={footX - 150} x2={footX - 30} y1={ground - 150} y2={ground - 150} stroke={C.text} strokeWidth={2.5} />
            <path d={`M${footX - 30},${ground - 150} l-14,-8 l0,16 z`} fill={C.text} />
            <text x={footX - 150} y={ground - 164} fill={C.text} fontSize={24} fontFamily={MONO}>
              0.5 m/s
            </text>
            <text x={footX - 150} y={ground - 196} fill={C.muted} fontSize={22}>
              0.02 초마다 action · 1초에 50 번
            </text>
          </g>
          {/* perceptive: the sensor sees the step */}
          <g opacity={prog(t, 13.8)}>
            <line x1={footX + 40} y1={ground - 112} x2={footX + 40 + (stepX - footX - 40) * seen} y2={ground - 112 + (stepTop - 4 - (ground - 112)) * seen} stroke={C.green} strokeWidth={4} strokeDasharray="12 10" />
            <text x={560} y={ground - 270} fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 14.6)}>
              perceptive · 센서가 1.0 m 앞의 계단을 볼 때 안다
            </text>
            <text x={560} y={ground - 236} fill={C.green} fontSize={24} fontFamily={MONO} opacity={prog(t, 15.4)}>
              남은 시간 1.0 ÷ 0.5 = 2.0 초
            </text>
          </g>
          {/* blind: only at contact */}
          <g opacity={prog(t, 21.3)}>
            <path d={`M${stepX - 12},${ground - 40} l24,24 M${stepX + 12},${ground - 40} l-24,24`} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
            <text x={560} y={ground - 166} fill={C.red} fontSize={24} fontWeight={600}>
              blind · 앞면에 닿을 때 안다 → 0 초, action 0 번
            </text>
          </g>
          {/* the 100 actions */}
          <g opacity={prog(t, 14.4)}>
            <text x={30} y={676} fill={C.text} fontSize={24} fontWeight={600}>
              닿기까지 2.0 초 동안 낼 수 있는 action
            </text>
            {Array.from({ length: ticks }, (_, i) => (
              <rect key={i} x={30 + i * 10.4} y={692} width={6} height={30} rx={2} fill={i < filled ? C.green : C.grid} />
            ))}
            <text x={1070} y={676} textAnchor="end" fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 18)}>
              2.0 ÷ 0.02 = 100 번
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={740} at={0.3} title={<Head color={C.accent}>계단을 처음 아는 때</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.6) }}>blind policy 는 발이 닿은 뒤 관절 각도와 torque 가 평소와 달라지는 것으로 지형을 짐작한다 · 낮은 턱은 넘지만 높은 계단은 앞발이 걸리고 틈은 발이 빠지는 순간 늦다</span>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: `${C.green}14`, border: `1.5px solid ${C.green}66`, display: 'grid', gap: 8, opacity: prog(t, 13.8) }}>
          <Label color={C.green} size={24} weight={600}>
            perceptive · 센서가 1.0 m 앞의 계단을 볼 때
          </Label>
          <span style={mono(C.text, 26)}>남은 시간 1.0 ÷ 0.5 = 2.0 초</span>
          <span style={{ ...mono(C.text, 26), opacity: prog(t, 16.2) }}>action 2.0 ÷ 0.02 = 100 번</span>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: `${C.red}14`, border: `1.5px solid ${C.red}66`, display: 'grid', gap: 8, opacity: prog(t, 21.3) }}>
          <Label color={C.red} size={24} weight={600}>
            blind · 앞발이 계단 앞면에 닿을 때
          </Label>
          <span style={mono(C.text, 26)}>남은 시간 0 초</span>
          <span style={mono(C.text, 26)}>action 0 번</span>
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.5) }}>perceptive policy 는 100 번의 action 동안 보폭을 계단에 맞추고 앞발을 높이 들 준비를 하지만, blind policy 는 부딪힌 다음 action 부터 고칠 수 있다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Results() {
  const t = useSec()
  const group = (title: string, at: number, rows: [string, number, number, string, string, string?][]) => (
    <div style={{ display: 'grid', gap: 8, opacity: prog(t, at) }}>
      <Label size={22}>{title}</Label>
      {rows.map(([label, v, max, color, fmt, sub], i) => (
        <Bar key={label} label={label} value={v} max={max} color={color} at={at + 0.3 + i * 0.5} width={300} fmt={fmt} sub={sub} labelW={190} />
      ))}
    </div>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 18 }}>
          <Head>실제 로봇 · blind policy 와 perceptive policy</Head>
          {group('ANYmal · 높이 12 ~ 36.5 cm 나무 단, 높이마다 10 번 (Miki 등)', 0.5, [
            ['blind', 20, 36.5, C.red, '20 cm', '부터 성공률이 떨어진다'],
            ['perceptive', 30.5, 36.5, C.green, '30.5 cm', '까지 안정적으로 오른다'],
          ])}
          {group('ANYmal · 20 cm 단과 17 cm 계단이 있는 장애물 코스 (Miki 등)', 7.3, [
            ['blind', 75, 80, C.red, '75 초', '세 장애물에 모두 걸려 사람이 들어 옮김'],
            ['perceptive', 33, 80, C.green, '33 초', '도움 없이'],
          ])}
          {group('A1 · 높이 17 cm, 깊이 30 cm 계단 13 칸 오르기 (Agarwal 등)', 14.3, [
            ['blind', 2.2, 13, C.red, '평균 2.2 칸', '성공률 0%'],
            ['perceptive', 13, 13, C.green, '13 칸', '성공률 100%'],
          ])}
          {group('A1 · 26 cm 틈 / 디딤돌 (Agarwal 등)', 17.6, [
            ['blind', 0, 100, C.red, '0% / 0%', '틈을 만나자마자 떨어졌다'],
            ['perceptive', 100, 100, C.green, '100% / 94%'],
          ])}
        </div>
      </Panel>
      <Box x={1196} y={140} w={660} h={270} at={0.8} title={<Head color={C.accent}>Miki 등과 Agarwal 등의 관찰</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 1.2) }}>perceptive policy 는 단에 닿기 전에 다리를 더 높이 들고 몸을 앞으로 기울여 뒷다리가 넘어올 자리를 만들었다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 14.6) }}>blind A1 은 틈을 만나자마자 떨어졌다 · 발이 빠지기 전에는 틈의 단서가 관절 값에 남지 않는다</span>
      </Box>
      <div style={{ position: 'absolute', left: 1196, top: 440, width: 660 }}>
        <Misconception at={21.3} belief="blind policy 는 계단을 오르내리지 못한다" fact="내려가기 13 칸은 100% · 다만 칸마다 떨어지듯 내려가 hip 이 빠졌고, 오르기는 평균 2.2 칸" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- elevation map and height samples ----------

const RINGS: [number, number][] = [
  [0.08, 6],
  [0.16, 8],
  [0.26, 10],
  [0.36, 12],
  [0.48, 16],
]

function Map() {
  const t = useSec()
  const cell = 26
  const gx = 30
  const gy = 86
  const n = 10
  const krows: [string, string, string, string, string, number][] = [
    ['① 처음', '모름, 분산 1000', '2 m 앞 0.25 m, 분산 0.2', '≈ 1', '0.25 m, 약 0.2', 13.4],
    ['② 다가간 뒤', '0.25 m, 0.2', '1 m 앞 0.20 m, 분산 0.05', '0.8', '0.21 m, 0.04', 16.2],
  ]
  const errors: [string, string][] = [
    ['발이 미끄러져 pose 가 drift', '바닥에 턱이 생긴다'],
    ['나뭇가지 · 낮은 천장', '바닥에서 솟은 벽'],
    ['반사하는 금속 바닥 · 질감 없는 눈', '도랑이나 빈 지도'],
    ['풀 · 깊은 눈', '발이 빠지는 높이 대신 윗면'],
  ]
  const cx = 330
  const cy = 256
  const scale = 146 / 0.48
  const stepEdge = cx + 0.3 * scale
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1040} h={740}>
        <svg width={1040} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            robot-centric elevation map · 칸마다 높이 하나 (2.5D 지도)
          </text>
          {/* the grid */}
          <g opacity={prog(t, 0.8)}>
            {Array.from({ length: n * n }, (_, i) => {
              const r = Math.floor(i / n)
              const c = i % n
              const step = c >= 7
              return <rect key={i} x={gx + c * cell + 1} y={gy + r * cell + 1} width={cell - 2} height={cell - 2} rx={3} fill={step ? `${C.orange}55` : C.grid} />
            })}
            <rect x={gx + 3 * cell} y={gy + 4 * cell} width={2 * cell} height={2 * cell} rx={6} fill="#111a2e" stroke={C.blue} strokeWidth={2.5} />
            <text x={gx + 4 * cell} y={gy + 5 * cell + 8} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              로봇
            </text>
            <text x={gx + 8.5 * cell} y={gy - 12} textAnchor="middle" fill={C.orange} fontSize={22}>
              계단 (높은 칸)
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <text x={330} y={110} fill={C.text} fontSize={24}>
              장마다 받은 점을 추정한 pose 로 한 좌표계에 쌓는다
            </text>
            <text x={330} y={146} fill={C.muted} fontSize={22}>
              지금 보이지 않는 곳(몸 아래 · 뒤)의 높이는 지난 장에서 가져온다
            </text>
          </g>
          <g opacity={prog(t, 6.7)}>
            <text x={330} y={200} fill={C.muted} fontSize={22}>
              elevation_mapping_cupy 의 기본값
            </text>
            <text x={330} y={238} fill={C.text} fontSize={26} fontFamily={MONO}>
              칸 0.04 m · 한 변 8 m → 8 ÷ 0.04 = 200 칸
            </text>
            <text x={330} y={276} fill={C.text} fontSize={26} fontFamily={MONO} opacity={prog(t, 9)}>
              200 × 200 = 40,000 칸 · 칸마다 높이와 분산
            </text>
            <text x={330} y={312} fill={C.muted} fontSize={22} opacity={prog(t, 10.5)}>
              점의 분산 = 0.05 × 거리² (stereo depth 오차와 같은 꼴)
            </text>
          </g>
          {/* the Kalman-style update */}
          <g opacity={prog(t, 13.2)}>
            <text x={30} y={385} fill={C.text} fontSize={25} fontWeight={600}>
              칸 높이의 갱신 · Kalman Filter 의 보정 단계와 같은 식
            </text>
            {['단계', '칸의 높이와 분산', '새 점', 'gain k', '고친 값'].map((h, i) => (
              <text key={h} x={[30, 180, 440, 760, 836][i]} y={424} fill={C.dim} fontSize={22}>
                {h}
              </text>
            ))}
            {krows.map(([a, b, c, d, e, at], r) => (
              <g key={a} opacity={prog(t, at)}>
                <text x={30} y={466 + r * 42} fill={C.text} fontSize={23}>
                  {a}
                </text>
                <text x={180} y={466 + r * 42} fill={C.text} fontSize={23} fontFamily={MONO}>
                  {b}
                </text>
                <text x={440} y={466 + r * 42} fill={C.orange} fontSize={22} fontFamily={MONO}>
                  {c}
                </text>
                <text x={760} y={466 + r * 42} fill={C.accent} fontSize={23} fontFamily={MONO}>
                  {d}
                </text>
                <text x={836} y={466 + r * 42} fill={C.green} fontSize={23} fontFamily={MONO}>
                  {e}
                </text>
              </g>
            ))}
          </g>
          <g opacity={prog(t, 19.8)}>
            <rect x={30} y={556} width={980} height={140} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={50} y={592} fill={C.accent} fontSize={25} fontFamily={MONO}>
              gain 0.2 ÷ (0.2 + 0.05) = 0.8 · 분산 0.2 × 0.05 ÷ 0.25 = 0.04
            </text>
            <text x={50} y={630} fill={C.text} fontSize={25} fontFamily={MONO} opacity={prog(t, 21.6)}>
              높이 0.25 + 0.8 × (0.20 − 0.25) = 0.21 m
            </text>
            <text x={50} y={668} fill={C.muted} fontSize={22} opacity={prog(t, 22.6)}>
              가까이서 잰 점은 분산이 작아 gain 0.8 로 크게 반영되고, 높이는 0.20 m 쪽으로 옮겨 간다
            </text>
          </g>
          <text x={30} y={724} fill={C.dim} fontSize={22} opacity={prog(t, 24)}>
            GPU 병렬 처리 · Jetson Xavier 는 LiDAR 점 43,017 개를 6.857 ms 에 · ANYmal 의 지도는 1초에 20 번 갱신
          </text>
        </svg>
      </Panel>
      <Box x={1136} y={140} w={720} h={250} at={10.8} title={<Head color={C.red} size={24}>추정한 pose 와 칸당 높이 하나에 기대어 틀리는 때</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          {errors.map(([a, b], i) => (
            <div key={a} style={{ display: 'flex', gap: 12, alignItems: 'baseline', whiteSpace: 'nowrap', opacity: prog(t, 11.2 + i * 0.4) }}>
              <span style={line(C.muted, 22)}>{a}</span>
              <span style={{ fontSize: 22, color: C.dim }}>→</span>
              <span style={line(C.text, 22)}>{b}</span>
            </div>
          ))}
        </div>
      </Box>
      <Panel x={1136} y={410} w={720} h={470} style={{ opacity: prog(t, 26.2) }}>
        <svg width={720} height={470}>
          <text x={24} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 26.2)}>
            앞발 둘레의 height sample 52 개 · 위에서 본 그림
          </text>
          <g opacity={prog(t, 26.4)}>
            <rect x={stepEdge} y={64} width={720 - stepEdge} height={356} fill={`${C.orange}22`} />
            <line x1={stepEdge} x2={stepEdge} y1={64} y2={420} stroke={C.orange} strokeWidth={2} strokeDasharray="6 5" />
            <text x={stepEdge + 14} y={94} fill={C.orange} fontSize={22}>
              계단 0.2 m · 발 앞 0.3 m 부터
            </text>
            <text x={stepEdge + 14} y={124} fill={C.orange} fontSize={23} fontWeight={600} opacity={prog(t, 28.8)}>
              8 개가 +0.2 m 를 읽는다
            </text>
            <text x={stepEdge + 14} y={152} fill={C.orange} fontSize={22} opacity={prog(t, 28.8)}>
              나머지 44 개는 0
            </text>
          </g>
          {RINGS.map(([r, k], ri) => (
            <g key={r} opacity={prog(t, 26.6 + ri * 0.3)}>
              <circle cx={cx} cy={cy} r={r * scale} fill="none" stroke="#334155" strokeWidth={1.2} />
              {Array.from({ length: k }, (_, i) => {
                const a = (i * 2 * Math.PI) / k
                const px = cx + r * scale * Math.cos(a)
                const py = cy - r * scale * Math.sin(a)
                const onStep = r * Math.cos(a) > 0.3
                return <circle key={i} cx={px} cy={py} r={onStep ? 6 : 4.5} fill={onStep ? C.orange : C.blue} opacity={onStep ? prog(t, 28.6) * 0.8 + 0.2 : 1} />
              })}
            </g>
          ))}
          <circle cx={cx} cy={cy} r={6} fill={C.text} opacity={prog(t, 26.6)} />
          <text x={24} y={428} fill={C.muted} fontSize={22} opacity={prog(t, 28)}>
            반지름 0.08 · 0.16 · 0.26 · 0.36 · 0.48 m 원에 6 · 8 · 10 · 12 · 16 개
          </text>
          <text x={24} y={456} fill={C.text} fontSize={24} fontFamily={MONO} opacity={prog(t, 27.8)}>
            6 + 8 + 10 + 12 + 16 = 52 · 네 발 52 × 4 = 208
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- noise and the gate ----------

const NOISE_STATES: [string, string, string, 'nominal' | 'offset' | 'noise', number][] = [
  ['nominal', '60%', C.green, 'nominal', 7.1],
  ['large offset', '30%', C.orange, 'offset', 7.8],
  ['large noise', '10%', C.red, 'noise', 8.5],
]

function Gate() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + (sub ? 34 : h / 2 + 8)} textAnchor="middle" fill={color} fontSize={24} fontWeight={700}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 62} textAnchor="middle" fill={C.muted} fontSize={21}>
          {sub}
        </text>
      )}
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <circle cx={x2} cy={y2} r={6} fill={color} />
    </g>
  )
  const offs: [string, string, string, number][] = [
    ['앞발 아래 바닥', '0 m', '0.1 m', 13.6],
    ['계단 윗면', '0.2 m', '0.3 m', 14.4],
    ['둘의 차이', '0.2 m', '0.2 m', 15.4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <div style={{ padding: '24px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
          <Head>student 가 받는 height sample 에 섞는 noise</Head>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.6) }}>점의 자리를 옆으로 옮기는 noise 와 높이를 바꾸는 noise · 점마다 · 발마다 · episode 동안 고정 · 가끔 큰 outlier · 학습 초반 0 에서 점점 키운다</span>
          <div style={{ display: 'grid', gap: 12, opacity: prog(t, 6.7) }}>
            <Label size={22}>episode 시작과 중간에 고르는 지도 상태</Label>
            <Bar label="nominal · 작은 noise" value={60} max={100} color={C.green} at={6.9} width={170} unit="%" sub="평소의 지도" labelW={240} />
            <Bar label="large offset · 발마다" value={30} max={100} color={C.orange} at={7.6} width={170} unit="%" sub="pose drift · 빠지는 바닥" labelW={240} />
            <Bar label="large noise · 점마다" value={10} max={100} color={C.red} at={8.3} width={170} unit="%" sub="가려짐 · sensor 고장" labelW={240} />
          </div>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 13.2) }}>
            <Label size={22}>예: 앞발의 sample 에 episode 동안 +0.1 m offset</Label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['자리', '실제 높이', '+0.1 m offset 뒤'].map((h, i) => (
                <span key={h} style={{ ...line(C.dim, 22), width: [220, 180, 220][i] }}>
                  {h}
                </span>
              ))}
            </div>
            {offs.map(([a, b, c, at]) => (
              <div key={a} style={{ display: 'flex', gap: 16, opacity: prog(t, at) }}>
                <span style={{ ...line(C.text, 23), width: 220 }}>{a}</span>
                <span style={{ ...mono(C.text, 24), width: 180 }}>{b}</span>
                <span style={{ ...mono(C.orange, 24), width: 220 }}>{c}</span>
              </div>
            ))}
            <span style={{ ...line(C.text, 22), opacity: prog(t, 16.6) }}>offset 은 높이 차이를 바꾸지 않아 계단의 모양은 남는다 · 발이 바닥을 디딜 때 관절로 잰 발 높이가 sample 보다 0.1 m 낮다는 것이 드러난다</span>
          </div>
          <span style={{ ...line(C.dim, 21), opacity: prog(t, 3) }}>loss = teacher 와의 action 차이 제곱 (behavior cloning) + 0.5 × noise 없는 값의 복원 오차 (reconstruction) · 데이터는 DAgger 처럼 student 가 모은다</span>
        </div>
      </Panel>
      <Panel x={956} y={140} w={900} h={740} style={{ opacity: prog(t, 6.9) }}>
        <svg width={900} height={740}>
          {/* the three map states, until the gate diagram takes the panel */}
          <g opacity={prog(t, 6.9) * (1 - prog(t, 19.5, 0.4))}>
            <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
              0.2 m 계단의 height sample 에 넣는 noise 의 세 상태
            </text>
            <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={22}>
              모식도
            </text>
            {NOISE_STATES.map(([name, pct, color, mode, at], i) => {
              const x0 = 30 + i * 285
              const y0 = 90
              const w = 250
              const h = 200
              const ground = y0 + 150
              const hm = 250 // px per m, the step rises 0.2 m
              return (
                <g key={name} opacity={prog(t, at)}>
                  <rect x={x0} y={y0} width={w} height={h} rx={12} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
                  <path d={`M${x0 + 12},${ground} L${x0 + w / 2},${ground} L${x0 + w / 2},${ground - 0.2 * hm} L${x0 + w - 12},${ground - 0.2 * hm}`} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" />
                  {Array.from({ length: 14 }, (_, k) => {
                    const px = x0 + 20 + k * ((w - 40) / 13)
                    const base = k >= 7 ? 0.2 : 0
                    const j = Math.sin((k + 1) * 12.9898 + i * 78.233) * 43758.5453
                    const r = j - Math.floor(j) - 0.5 // deterministic jitter in [-0.5, 0.5)
                    const dz = mode === 'nominal' ? r * 0.02 : mode === 'offset' ? 0.1 : r * 0.4
                    return <circle key={k} cx={px} cy={ground - (base + dz) * hm} r={5} fill={color} />
                  })}
                  <text x={x0 + w / 2} y={y0 + h + 34} textAnchor="middle" fill={color} fontSize={24} fontWeight={600}>
                    {name} · {pct}
                  </text>
                </g>
              )
            })}
            <text x={30} y={372} fill={C.muted} fontSize={22} opacity={prog(t, 9.4)}>
              nominal 은 조금 흔들리고, large offset 은 예로 든 +0.1 m 만큼 통째로 올라간다
            </text>
            <text x={30} y={404} fill={C.muted} fontSize={22} opacity={prog(t, 9.4)}>
              large noise 는 계단을 알아볼 수 없다 · 점선은 실제 지형 · 정보가 없는 자리에는 무작위 값
            </text>
          </g>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 19.7)}>
            belief encoder 의 gate · 지도를 얼마나 통과시킬지 학습으로 정한다
          </text>
          {node(30, 80, 230, 56, 'proprioception', '', C.blue, 19.9)}
          {node(30, 150, 230, 56, '앞 step 의 내부 상태', '', C.muted, 20.1)}
          {node(30, 220, 230, 56, '지도 feature lᵉ (96)', '', C.orange, 20.3)}
          {arrow(260, 108, 330, 170, C.muted, 20.5)}
          {arrow(260, 178, 330, 178, C.muted, 20.5)}
          {arrow(260, 248, 330, 186, C.muted, 20.5)}
          {node(330, 140, 170, 78, 'GRU', '2 층 × 50 unit', C.purple, 20.7)}
          <text x={508} y={128} fill={C.purple} fontSize={26} fontFamily={MONO} opacity={prog(t, 21.2)}>
            b′
          </text>
          {arrow(500, 178, 560, 110, C.purple, 21.2)}
          {arrow(500, 178, 560, 358, C.purple, 21.2)}
          {node(560, 70, 200, 68, 'gₐ → sigmoid', 'α 96 개 · 0 ~ 1', C.green, 21.6)}
          {node(560, 324, 200, 68, 'g_b', '지도 없이 만든 값', C.purple, 21.6)}
          {/* α ⊙ lᵉ, then + g_b */}
          <g opacity={prog(t, 22.4)}>
            <path d="M760,104 L800,104 L800,228" fill="none" stroke={C.green} strokeWidth={3} />
            <path d="M260,248 L780,248" fill="none" stroke={C.orange} strokeWidth={3} />
            <circle cx={800} cy={248} r={20} fill={C.card} stroke={C.text} strokeWidth={2.5} />
            <text x={800} y={257} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={700}>
              ⊙
            </text>
            <text x={826} y={256} fill={C.orange} fontSize={22}>
              α × lᵉ
            </text>
            <path d="M800,268 L800,338" fill="none" stroke={C.text} strokeWidth={3} />
            <path d="M760,358 L780,358" fill="none" stroke={C.purple} strokeWidth={3} />
            <circle cx={800} cy={358} r={20} fill={C.card} stroke={C.text} strokeWidth={2.5} />
            <text x={800} y={367} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={700}>
              +
            </text>
          </g>
          {node(650, 420, 240, 56, 'belief b (120)', '', C.accent, 23)}
          {arrow(800, 378, 800, 420, C.accent, 23)}
          {node(650, 498, 240, 56, 'MLP → action', '', C.text, 23.4)}
          {arrow(800, 476, 800, 498, C.text, 23.4)}
          <text x={30} y={440} fill={C.text} fontSize={24} fontFamily={MONO} opacity={prog(t, 23.8)}>
            b = g_b(b′) + α ⊙ lᵉ
          </text>
          <text x={30} y={476} fill={C.muted} fontSize={22} opacity={prog(t, 23.8)}>
            α = sigmoid(gₐ(b′)) · 1 이면 지도가 그대로, 0 이면 막힌다
          </text>
          <text x={30} y={506} fill={C.muted} fontSize={22} opacity={prog(t, 23.8)}>
            막히면 GRU 가 proprioception 이력으로 만든 짐작에 기댄다
          </text>
          {/* the example */}
          <g opacity={prog(t, 26.2)}>
            <rect x={30} y={566} width={840} height={118} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={50} y={596} fill={C.dim} fontSize={21}>
              예 · 지도 feature 0.5, g_b(b′) 0.1 · sigmoid(2.2) ≈ 0.90, sigmoid(−2.2) ≈ 0.10
            </text>
            <text x={50} y={632} fill={C.green} fontSize={22} fontFamily={MONO}>
              맞음 2.2 → α 0.90 → 0.90 × 0.5 = 0.45 → 0.1 + 0.45 = 0.55
            </text>
            <text x={50} y={668} fill={C.red} fontSize={22} fontFamily={MONO} opacity={prog(t, 28.4)}>
              어긋남 −2.2 → α 0.10 → 0.10 × 0.5 = 0.05 → 0.1 + 0.05 = 0.15
            </text>
          </g>
          <text x={30} y={710} fill={C.dim} fontSize={21} opacity={prog(t, 30)}>
            손으로 짠 규칙 ✕ · α 는 작은 MLP 의 출력이고 나머지와 함께 학습한다
          </text>
          <text x={30} y={734} fill={C.dim} fontSize={21} opacity={prog(t, 30)}>
            DARPA SubT 결선 · ANYmal 네 대가 1700 m 넘게 탐사하는 동안 한 번도 넘어지지 않았다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- egocentric depth image ----------

function Depth() {
  const t = useSec()
  const stages: [string, string, number][] = [
    ['촬영 480 × 848', '100 ± 20 ms 마다 · RealSense D435 한 대', 6.2],
    ['전처리 → 58 × 87', '왼쪽 200 pixel 자르기 · 빈 pixel 은 가장 가까운 값', 7],
    ['CNN image encoder', 'Jetson NX 의 GPU · feature 를 policy 컴퓨터로 · 지연 10 ± 10 ms', 7.8],
    ['GRU policy', '1초에 50 번 관절 목표 각도', 8.6],
    ['PD controller', '1초에 400 번 · Kp 40, Kd 0.5', 9.4],
  ]
  const img = (x: number, y: number, rows: number, label: string, at: number, bandAt: number, note: string) => {
    const rh = 3.2
    const w = 87 * 3.2
    return (
      <g opacity={prog(t, at)}>
        <rect x={x} y={y} width={w} height={58 * rh} fill="#0a1a30" stroke={C.cardEdge} strokeWidth={1.5} />
        {Array.from({ length: 58 }, (_, r) => (
          <rect key={r} x={x} y={y + r * rh} width={w} height={rh} fill={C.blue} opacity={r < 29 ? 0.05 : 0.08 + ((r - 29) / 29) * 0.35} />
        ))}
        <g opacity={prog(t, bandAt)}>
          <rect x={x} y={y + 29 * rh} width={w} height={rows * rh} fill={C.orange} opacity={0.85} />
          <line x1={x} x2={x + w} y1={y + 29 * rh} y2={y + 29 * rh} stroke={C.text} strokeWidth={1} strokeDasharray="4 4" />
          <text x={x + w + 12} y={y + 29 * rh + (rows * rh) / 2 + 8} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
            {note}
          </text>
        </g>
        <text x={x + w / 2} y={y - 12} textAnchor="middle" fill={C.text} fontSize={23} fontWeight={600}>
          {label}
        </text>
      </g>
    )
  }
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            Agarwal 등의 Unitree A1 · 머리의 depth camera 한 대, Jetson NX 와 보드 컴퓨터 하나
          </text>
          <text x={30} y={80} fill={C.muted} fontSize={22} opacity={prog(t, 0.8)}>
            지도를 만드는 단계가 noise 와 가짜 형상을 만들고 비싼 하드웨어를 요구한다고 보았다
          </text>
          <text x={30} y={110} fill={C.dim} fontSize={22} opacity={prog(t, 1.2)}>
            (ANYmal C 는 같은 카메라 네 대와 dome LiDAR 두 대를 싣는다)
          </text>
          {stages.map(([a, b, at], i) => (
            <g key={a} opacity={prog(t, at)}>
              <rect x={30} y={136 + i * 74} width={300} height={58} rx={12} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={2} />
              <text x={180} y={136 + i * 74 + 37} textAnchor="middle" fill={C.orange} fontSize={23} fontWeight={700}>
                {a}
              </text>
              <text x={350} y={136 + i * 74 + 37} fill={C.text} fontSize={22}>
                {b}
              </text>
              {i < stages.length - 1 && <path d={`M180,${194 + i * 74} l0,16 l-7,-7 M180,${210 + i * 74} l7,-7`} fill="none" stroke={C.muted} strokeWidth={2} />}
            </g>
          ))}
          <g opacity={prog(t, 12.7)}>
            <text x={30} y={538} fill={C.text} fontSize={25} fontWeight={600}>
              policy 에 들어가는 숫자의 개수
            </text>
            <rect x={30} y={556} width={940} height={30} rx={8} fill={C.grid} />
            <rect x={30} y={556} width={940 * prog(t, 12.9, 1)} height={30} rx={8} fill={C.orange} />
            <text x={30} y={614} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              depth image 58 × 87 = 5,046 개
            </text>
            <rect x={30} y={630} width={940} height={30} rx={8} fill={C.grid} />
            <rect x={30} y={630} width={(940 * 208 * prog(t, 13.6, 1)) / 5046} height={30} rx={8} fill={C.blue} />
            <text x={30} y={688} fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              height sample 208 개 · 5,046 ÷ 208 ≈ 24 배
            </text>
            <text x={30} y={726} fill={C.muted} fontSize={22} opacity={prog(t, 15.2)}>
              height sample 에는 계단 높이 0.2 m 가 바로 있지만, pixel 에는 그 방향으로 잰 거리만 있다
            </text>
          </g>
        </svg>
      </Panel>
      <Panel x={1096} y={140} w={760} h={740} style={{ opacity: prog(t, 12.7) }}>
        <svg width={760} height={740}>
          <text x={24} y={44} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 12.7)}>
            58 × 87 depth image · pixel 값은 그 방향으로 잰 거리
          </text>
          <text x={736} y={44} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 12.7)}>
            모식도
          </text>
          <text x={24} y={80} fill={C.muted} fontSize={22} opacity={prog(t, 19.4)}>
            0.2 m 계단 앞면 · f = 424 로 424 × 0.2 ÷ Z 줄 (원래 480 줄)
          </text>
          {img(24, 120, 10, 'Z = 1 m', 12.9, 19.8, '≈ 10 줄')}
          <text x={24} y={330} fill={C.text} fontSize={23} fontFamily={MONO} opacity={prog(t, 20.6)}>
            424 × 0.2 ÷ 1 ≈ 85 줄 → 85 × 58 ÷ 480 ≈ 10 줄
          </text>
          {img(24, 378, 5, 'Z = 2 m', 22.2, 22.4, '≈ 5 줄')}
          <text x={24} y={588} fill={C.text} fontSize={23} fontFamily={MONO} opacity={prog(t, 22.8)}>
            424 × 0.2 ÷ 2 ≈ 42 줄 → 42 × 58 ÷ 480 ≈ 5 줄
          </text>
          <g opacity={prog(t, 25.3)}>
            <text x={24} y={632} fill={C.text} fontSize={23} fontWeight={600}>
              카메라가 앞만 본다 → 기억이 필요하다
            </text>
            <text x={24} y={664} fill={C.orange} fontSize={23} fontFamily={MONO}>
              앞발 ↔ 뒷발 약 0.4 m · 0.4 ÷ 0.35 ≈ 1.14 초
            </text>
            <text x={24} y={694} fill={C.orange} fontSize={23} fontFamily={MONO}>
              ≈ action 57 번 뒤 · 그 자리는 시야 밖 → GRU 가 기억
            </text>
            <text x={24} y={724} fill={C.muted} fontSize={22}>
              A1 은 24 cm 계단, 26 cm 연석 · hip 높이 28 cm 라 다리를 옆으로 벌려 올린다
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- scandots and the two phases, latency ----------

/** a compact "오해 / 사실" pair for a narrow column */
function Myth({ at, belief, fact }: { at: number; belief: string; fact: string }) {
  const t = useSec()
  const rows: [string, string, string, string, number][] = [
    ['✕', '흔한 오해', belief, C.red, at],
    ['✓', '사실', fact, C.green, at + 1.6],
  ]
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {rows.map(([mark, label, text, color, a]) => (
        <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 20px', borderRadius: 14, background: `${color}14`, border: `1.5px solid ${color}55`, opacity: prog(t, a) }}>
          <span style={{ color, fontSize: 30, fontWeight: 700, lineHeight: '34px' }}>{mark}</span>
          <div style={{ display: 'grid', gap: 4 }}>
            <Label color={color} size={22} weight={600}>
              {label}
            </Label>
            <Label color={C.text} size={25} weight={500} style={{ lineHeight: 1.4 }}>
              {text}
            </Label>
          </div>
        </div>
      ))}
    </div>
  )
}

function TwoPhase() {
  const t = useSec()
  const lat: [string, string, string, number][] = [
    ['Miki 등 · 지도 1초에 20 번 = 0.05 초', '1.2 m/s × 0.05 초', '= 0.06 m', 26.6],
    ['Agarwal 등 · depth 100 ms 마다', '0.35 m/s × 0.1 초', '= 0.035 m', 27.4],
    ['Cheng 등 · 지연을 0.08 초로 고정', '예로 1 m/s × 0.08 초', '= 0.08 m', 28.2],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={340} at={0.3} title={<Head color={C.accent}>simulation 처리량 · RTX 3090 한 장 (Agarwal 등의 측정)</Head>}>
        <div style={{ display: 'grid', gap: 12, marginTop: 2 }}>
          <Bar label="높이만 읽기 · 로봇 4096 대" value={200000} max={200000} color={C.green} at={0.7} width={220} fmt="약 2 × 10⁵" unit=" step/초" labelW={320} />
          <Bar label="depth rendering · 환경 256 개" value={500} max={200000} color={C.red} at={1.6} width={220} fmt="500" unit=" step/초" labelW={320} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.4) }}>depth 를 그리면 열 배쯤 느려지고 memory 도 많이 들어 환경 수까지 줄여야 했다</span>
          <span style={{ ...mono(C.text, 25), opacity: prog(t, 6.7) }}>2 × 10⁵ ÷ 500 = 400 배</span>
          <span style={{ ...mono(C.red, 25), opacity: prog(t, 8.4) }}>150억 ÷ 500 = 3 × 10⁷ 초 ≈ 347 일</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>첫 단계의 150억 sample 을 depth 를 그리며 모을 수는 없다 → 학습을 두 단계로 나눈다</span>
        </div>
      </Box>
      <Panel x={64} y={500} w={880} h={380} style={{ opacity: prog(t, 26.2) }}>
        <svg width={880} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 26.2)}>
            지연 · 잰 순간부터 policy 에 닿기까지 로봇이 간 거리
          </text>
          <text x={30} y={76} fill={C.muted} fontSize={22} opacity={prog(t, 26.4)}>
            Zhuang 등의 예: 1 m/s 에서 0.2 초 지연 = 지형이 0.2 m 어긋나 보인다
          </text>
          {['시스템', '속도 × 지연', '간 거리'].map((h, i) => (
            <text key={h} x={[30, 420, 690][i]} y={118} fill={C.dim} fontSize={21} opacity={prog(t, 26.4)}>
              {h}
            </text>
          ))}
          {lat.map(([a, b, c, at], i) => (
            <g key={a} opacity={prog(t, at)}>
              <text x={30} y={158 + i * 44} fill={C.text} fontSize={22}>
                {a}
              </text>
              <text x={420} y={158 + i * 44} fill={C.muted} fontSize={22} fontFamily={MONO}>
                {b}
              </text>
              <text x={690} y={158 + i * 44} fill={C.orange} fontSize={23} fontFamily={MONO} fontWeight={600}>
                {c}
              </text>
            </g>
          ))}
          <text x={30} y={302} fill={C.text} fontSize={23} opacity={prog(t, 29.2)}>
            action 1초에 50 번, depth 1초에 10 번 → 사진 하나를 action 5 번에 걸쳐 쓴다
          </text>
          <text x={30} y={336} fill={C.dim} fontSize={21} opacity={prog(t, 30.2)}>
            Agarwal 등: 갱신 간격 80 ~ 120 ms, 지연 10 ~ 30 ms 를 무작위로 바꿔 학습
          </text>
          <text x={30} y={362} fill={C.dim} fontSize={21} opacity={prog(t, 30.2)}>
            Cheng 등: 0.08 초 안에 끝나면 기다려 늘 0.08 초 (jitter 방지)
          </text>
        </svg>
      </Panel>
      <Panel x={976} y={140} w={880} h={370} style={{ opacity: prog(t, 13.2) }}>
        <svg width={880} height={370}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 13.2)}>
            depth policy 의 2 단계 학습 · distillation
          </text>
          <g opacity={prog(t, 13.4)}>
            <rect x={30} y={64} width={820} height={108} rx={16} fill={`${C.green}12`} stroke={C.green} strokeWidth={2.5} />
            <text x={50} y={98} fill={C.green} fontSize={25} fontWeight={700}>
              phase 1 · scandots → PPO · 150억 sample
            </text>
            <text x={50} y={130} fill={C.text} fontSize={22}>
              scandots = 로봇 좌표계의 정해 둔 (x, y) 자리에서 읽은 simulation 지형 높이
            </text>
            <text x={50} y={160} fill={C.muted} fontSize={21}>
              Cheng 등의 코드: 뒤 0.45 m ~ 앞 1.2 m 를 0.15 m 간격으로 12 × 11 = 132 개
            </text>
          </g>
          <g opacity={prog(t, 19.7)}>
            <line x1={440} y1={172} x2={440} y2={204} stroke={C.muted} strokeWidth={3} />
            <path d="M440,206 l-8,-10 l16,0 z" fill={C.muted} />
            <text x={460} y={196} fill={C.muted} fontSize={22}>
              weight 복사
            </text>
            <rect x={30} y={212} width={820} height={140} rx={16} fill={`${C.orange}12`} stroke={C.orange} strokeWidth={2.5} />
            <text x={50} y={246} fill={C.orange} fontSize={25} fontWeight={700}>
              phase 2 · depth 58 × 87 → CNN + 복사한 policy · DAgger · 600만 sample
            </text>
            <text x={50} y={278} fill={C.text} fontSize={22}>
              student 가 24 step 움직인 상태마다 phase 1 의 action 을 정답으로 붙여 차이 제곱을 줄인다
            </text>
            <text x={50} y={308} fill={C.muted} fontSize={21}>
              scandots 자리는 카메라 시야와 맞춘다 · 카메라로 알 수 없는 정보는 student 가 흉내 못 낸다
            </text>
            <text x={50} y={338} fill={C.dim} fontSize={21}>
              한계: simulation 과 실제의 겉모습 · 지형이 다르면 simulation 에 다시 만들어 학습한다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={976} y={530} w={880} h={350} at={22.2}>
        <Myth at={22.4} belief="phase 2 에서도 depth image 로 reinforcement learning 을 한다" fact="phase 2 에 reward 는 없다 · phase 1 action 과의 차이 제곱을 줄이는 supervised learning 이라 600만 sample 로 끝난다" />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- parkour: soft dynamics ----------

function Soft() {
  const t = useSec()
  const ground = 300
  const sx = 40
  const sw = 1010
  const sAt = prog(t, 15.2, 1.2)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            Zhuang 등(2023) · 로봇 키보다 높은 상자 앞에서
          </text>
          <text x={970} y={46} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 0.3)}>
            모식도
          </text>
          {/* hard physics: stuck */}
          <g opacity={prog(t, 0.8)}>
            <line x1={30} x2={470} y1={ground} y2={ground} stroke={C.muted} strokeWidth={4} />
            <rect x={330} y={ground - 170} width={140} height={170} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <Robot x={110} y={ground - 110} color={C.red} />
            <path d={`M318,${ground - 60} l24,24 M342,${ground - 60} l-24,24`} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
            <text x={30} y={90} fill={C.red} fontSize={24} fontWeight={600}>
              실제 물리로 처음부터 학습
            </text>
            <text x={30} y={120} fill={C.muted} fontSize={22}>
              장애물 앞에서 막힌다 · local minimum
            </text>
          </g>
          {/* soft dynamics: penetration allowed, penalised */}
          <g opacity={prog(t, 7.2)}>
            <line x1={530} x2={970} y1={ground} y2={ground} stroke={C.muted} strokeWidth={4} />
            <rect x={830} y={ground - 170} width={140} height={170} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} strokeDasharray="8 6" />
            <Robot x={660} y={ground - 150} color={C.green} legLift={20} />
            <rect x={830} y={ground - 170} width={46} height={60} fill={`${C.orange}66`} stroke={C.orange} strokeWidth={2} />
            <text x={530} y={90} fill={C.green} fontSize={24} fontWeight={600}>
              soft dynamics constraint · 학습 초반
            </text>
            <text x={530} y={120} fill={C.muted} fontSize={22}>
              뚫고 지나가도 되고, 들어간 만큼 penalty
            </text>
            <text x={886} y={ground - 84} fill={C.orange} fontSize={22} fontWeight={600}>
              penalty
            </text>
          </g>
          <text x={30} y={352} fill={C.muted} fontSize={22} opacity={prog(t, 10.2)}>
            그 뒤 실제 물리로 다시 학습 · 다섯 기술을 DAgger 로 depth GRU policy 하나에 모은다
          </text>
          <text x={30} y={382} fill={C.dim} fontSize={22} opacity={prog(t, 10.2)}>
            오르기 · 뛰어넘기 · 기어가기 · 몸 기울여 틈 지나기 · 달리기
          </text>
          {/* difficulty score */}
          <g opacity={prog(t, 14.2)}>
            <text x={30} y={430} fill={C.text} fontSize={25} fontWeight={600}>
              오르기의 상자 높이 · 난이도 점수 s (0 에서 1 까지, 잘 지날수록 0.05 씩)
            </text>
            <line x1={sx} x2={sx + sw - 80} y1={520} y2={520} stroke={C.muted} strokeWidth={4} strokeLinecap="round" />
            <circle cx={sx} cy={520} r={9} fill={C.green} />
            <circle cx={sx + sw - 80} cy={520} r={9} fill={C.red} />
            <text x={sx} y={566} fill={C.green} fontSize={23} fontFamily={MONO}>
              s = 0 · 쉬운 끝 0.2 m
            </text>
            <text x={sx + sw - 80} y={566} textAnchor="end" fill={C.red} fontSize={23} fontFamily={MONO}>
              s = 1 · 어려운 끝 0.45 m
            </text>
            <g opacity={prog(t, 15.2)}>
              <circle cx={sx + ((sw - 80) / 2) * sAt} cy={520} r={13} fill={C.orange} />
              <text x={sx + (sw - 80) / 2} y={492} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
                예로 s = 0.5
              </text>
            </g>
            <text x={30} y={636} fill={C.text} fontSize={26} fontFamily={MONO} opacity={prog(t, 16.8)}>
              (1 − 0.5) × 0.2 + 0.5 × 0.45 = 0.325 m
            </text>
            <text x={30} y={674} fill={C.muted} fontSize={22} opacity={prog(t, 18.4)}>
              (1 − s) × l_easy + s × l_hard · 0.05 씩 오르는 s 로 쉬운 높이에서 어려운 높이로 옮겨 간다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={740} at={21.3} title={<Head color={C.green}>A1 의 결과 (Zhuang 등)</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Bar label="0.40 m 상자 · 키의 1.53 배" value={80} max={100} color={C.green} at={21.6} width={200} unit="%" labelW={300} />
          <Bar label="0.60 m 틈 · 몸 길이의 1.5 배" value={80} max={100} color={C.green} at={22.3} width={200} unit="%" labelW={300} />
          <Label size={22} style={{ marginTop: 8, opacity: prog(t, 23.6) }}>
            simulation 비교 · 오르기 / 뛰어넘기
          </Label>
          <Bar label="soft dynamics 뺀 teacher" value={0} max={100} color={C.red} at={23.8} width={160} fmt="0% / 0%" labelW={340} />
          <Bar label="기억이 없는 MLP student" value={1} max={100} color={C.red} at={24.6} width={160} fmt="0% / 1%" labelW={340} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.6) }}>앞발을 상자에 올린 뒤 뒷다리를 끌어올리려면 이미 시야를 지나간 상자의 크기를 기억해야 해서 GRU 가 필요하다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- parkour: heading and the inner product reward ----------

function Heading() {
  const t = useSec()
  const ox = 300
  const oy = 380
  const s = 170
  const vs: [number, number, string, string, string, string, string][] = [
    [1.2, 0, '(1.2, 0)', '(1.2, 0) 경유점 쪽으로 빠르게', '1.2', '1.0', C.green],
    [0.6, 0.8, '(0.6, 0.8)', '(0.6, 0.8) 비스듬히', '0.6', '0.6', C.blue],
    [0, 1.0, '(0, 1.0)', '(0, 1.0) 옆으로', '0', '0', C.muted],
    [-0.5, 0, '(−0.5, 0)', '(−0.5, 0) 뒤로', '−0.5', '−0.5', C.red],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            Cheng 등(2023)의 inner product reward
          </text>
          <text x={30} y={78} fill={C.muted} fontSize={22} opacity={prog(t, 0.6)}>
            예 · 다음 경유점 방향 d̂ = (1, 0), 명령 속도 1.0 m/s · reward = min(v · d̂, 1.0)
          </text>
          {/* axes */}
          <g opacity={prog(t, 1)}>
            <line x1={ox - 150} x2={ox + 300} y1={oy} y2={oy} stroke={C.dim} strokeWidth={2} />
            <line x1={ox} x2={ox} y1={oy + 40} y2={oy - 230} stroke={C.dim} strokeWidth={2} />
            <path d={`M${ox + 300},${oy} l-14,-7 l0,14 z`} fill={C.accent} />
            <text x={ox + 170} y={oy + 34} fill={C.accent} fontSize={23} fontWeight={600}>
              d̂ 경유점 방향
            </text>
            <circle cx={ox} cy={oy} r={7} fill={C.text} />
          </g>
          {vs.map(([vx, vy, tag, name, dot, rw, color], i) => {
            const at = 6.7 + i * 0.7
            const g = prog(t, at, 0.8)
            const ex = ox + vx * s * g
            const ey = oy - vy * s * g
            const lx = ox + vx * s + (vx > 0 ? 16 : vx < 0 ? -16 : 16)
            const ly = vy > 0 ? oy - vy * s - 14 : vx < 0 ? oy + 36 : oy - 20
            return (
              <g key={name} opacity={prog(t, at - 0.2)}>
                <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={color} strokeWidth={5} strokeLinecap="round" />
                <circle cx={ex} cy={ey} r={9} fill={color} />
                <text x={lx} y={ly} textAnchor={vx < 0 ? 'end' : 'start'} fill={color} fontSize={23} fontFamily={MONO} fontWeight={600}>
                  {tag}
                </text>
                <text x={30} y={512 + i * 42} fill={color} fontSize={23}>
                  {name}
                </text>
                <text x={520} y={512 + i * 42} fill={C.text} fontSize={23} fontFamily={MONO}>
                  v · d̂ = {dot}
                </text>
                <text x={740} y={512 + i * 42} fill={color} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  → {rw}
                </text>
              </g>
            )
          })}
          <text x={520} y={484} fill={C.dim} fontSize={21} opacity={prog(t, 6.7)}>
            inner product
          </text>
          <text x={740} y={484} fill={C.dim} fontSize={21} opacity={prog(t, 6.7)}>
            reward
          </text>
          <g opacity={prog(t, 13.7)}>
            <text x={30} y={674} fill={C.text} fontSize={23}>
              명령보다 빨라도 안 늘고, 방향이 어긋난 만큼 덜 받는다
            </text>
            <text x={30} y={702} fill={C.muted} fontSize={22}>
              world 좌표 속도라서 둘러 가는 꼼수 ✕ · 모서리 5 cm 안을 디디면 penalty
            </text>
            <text x={30} y={728} fill={C.muted} fontSize={22}>
              방향: phase 1 은 경유점으로 계산, phase 2 student 는 depth 로 예측
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={270} at={19.7} title={<Head color={C.accent}>A1 (Cheng 등) · 경사진 판을 연달아 건너려면 방향을 순간에 바꿔야</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 20) }}>
            <span style={mono(C.green, 30)}>0.5 m 상자</span>
            <span style={line(C.text, 23)}>서 있을 때 thigh 관절 높이 0.26 m 의 약 2 배</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 21.2) }}>
            <span style={mono(C.green, 30)}>0.8 m 틈</span>
            <span style={line(C.text, 23)}>앞발과 뒷발 사이의 2 배</span>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.4) }}>사람이 joystick 으로 방향을 주면 실패가 잦았다 → student 가 depth 로 스스로 진행 방향을 예측</span>
        </div>
      </Box>
      <Box x={996} y={430} w={860} h={450} at={24.7} title={<Head color={C.purple}>Hoeller 등(2023) · ANYmal D 의 계층 구조</Head>}>
        <Flow steps={['point cloud → 3D 복원', 'navigation policy · 1초에 5 번', '기술 policy 5 개 · 1초에 50 번']} color={C.purple} at={25} gap={0.5} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.6) }}>3D 복원은 2.5D 지도에 없는 테이블 아래까지 담고, navigation policy 가 어느 기술로 어디까지 갈지 정한다 · 실제 로봇 최대 2 m/s</span>
        <div style={{ display: 'grid', gap: 8, opacity: prog(t, 27.6) }}>
          <Label size={22}>simulation 코스 3 개의 성공률</Label>
          <Bar label="navigation policy" value={98.2} max={100} color={C.purple} at={27.8} width={200} fmt="98.2 / 96.3 / 97.6" unit="%" labelW={260} />
          <Bar label="사람이 경로와 기술을 정함" value={95.3} max={100} color={C.muted} at={28.6} width={200} fmt="95.3 / 60.9 / 75.3" unit="%" labelW={260} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.red, text: '부딪힌 뒤에야 안다 · 1.0 m 앞 계단에 2.0 초, action 100 번 vs 0 번 · ANYmal 20 cm vs 30.5 cm', at: 1 },
    { tag: script.sections[1], color: C.blue, text: '0.04 m 칸 · height sample 208 개 · 60 / 30 / 10% 의 틀린 지도 · gate α · 2.2 km 등산로 78 분', at: 4.6 },
    { tag: script.sections[2], color: C.orange, text: 'rendering 400 배 → scandots PPO 150억, DAgger 600만 · 17 cm 계단 13 칸 100% · 시야 밖은 GRU', at: 8.6 },
    { tag: script.sections[3], color: C.green, text: 'soft dynamics constraint · inner product reward · 스스로 정하는 방향 · 0.5 m 상자, 0.8 m 틈', at: 12.6 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            발이 닿기 전에 계단을 알아채려면 policy 에 무엇을 어떤 모양으로 보여 주어야 할까?
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
            NEXT · RL
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Humanoid Whole-Body Control</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            사람의 동작을 따라 하는 humanoid 의 전신 policy 를 privileged teacher 에서 student 로 옮기기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Miki 2022 · Agarwal 2022 · Zhuang · Cheng · Hoeller 2023
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseBlind = () => (
  <PauseWrite
    question="1.2 m/s 로 걷는 로봇의 센서가 0.6 m 앞의 계단을 처음 보았다. 1초에 50 번 action 을 내면 발이 닿기 전에 몇 번 낼 수 있을까?"
    answer={
      <>
        남은 시간 0.6 ÷ 1.2 = 0.5 초 · action 간격 1 ÷ 50 = 0.02 초
        <br />
        0.5 ÷ 0.02 = 25 번 · 빨리 걸을수록 같은 거리에서 준비할 action 이 준다
      </>
    }
  />
)

const PauseGate = () => (
  <PauseWrite
    question="gate 입력이 0 이고 지도 feature 가 0.4, 중간 belief 에서 온 값이 0.2 다. 최종 belief 는? gate 입력이 크게 음수라 α 가 0.05 가 되면?"
    answer={
      <>
        sigmoid(0) = 0.5 → 0.2 + 0.5 × 0.4 = 0.4
        <br />
        α = 0.05 → 0.2 + 0.05 × 0.4 = 0.22 · α 가 작으면 belief 는 0.2 근처에 머문다
      </>
    }
  />
)

const PauseLatency = () => (
  <PauseWrite
    question="action 은 1초에 50 번, depth 는 1초에 10 번 오고 지연은 0.08 초로 고정. 0.8 m/s 로 걷는 로봇은 사진을 처음 쓰기까지 얼마나 가고, 사진 하나는 action 몇 번에 쓰일까?"
    answer={
      <>
        0.8 × 0.08 = 0.064 m, 약 6.4 cm
        <br />
        사진 간격 1 ÷ 10 = 0.1 초, action 간격 0.02 초 → 0.1 ÷ 0.02 = 5 번
      </>
    }
  />
)

const PauseReward = () => (
  <PauseWrite
    question="경유점 방향이 d̂ = (0.6, 0.8), 명령 속도가 1.0 m/s 다. 로봇의 속도가 (0.8, 0.6) m/s 이면 inner product reward 는?"
    answer={
      <>
        0.8 × 0.6 + 0.6 × 0.8 = 0.48 + 0.48 = 0.96 · min(0.96, 1.0) = 0.96
        <br />
        속도 크기는 1.0 m/s 지만 방향이 조금 어긋나 그만큼 덜 받는다
      </>
    }
  />
)

export function PerceptiveLocomotion() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        blind: Blind,
        results: Results,
        'pause-blind': PauseBlind,
        map: Map,
        gate: Gate,
        'pause-gate': PauseGate,
        depth: Depth,
        'two-phase': TwoPhase,
        'pause-latency': PauseLatency,
        soft: Soft,
        heading: Heading,
        'pause-reward': PauseReward,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
