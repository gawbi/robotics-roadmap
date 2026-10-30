import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './locomotion-deployment.narration.json'
import { script } from './locomotion-deployment.script'

// Numbers follow lessons/locomotion-deployment/README.md only (see locomotion-deployment.script.ts). The torso and timing
// drawings are schematic; every number on screen is the lesson's or shows its arithmetic from the lesson's numbers.

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

const line = (color = C.text, size = 23): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a text line that fades in at `at` */
function Line({ at, color = C.text, size = 23, children }: { at: number; color?: string; size?: number; children: ReactNode }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
}

/** a mono formula line that fades in at `at` */
function Mono({ at, color = C.text, size = 24, children }: { at: number; color?: string; size?: number; children: ReactNode }) {
  const t = useSec()
  return <span style={{ ...mono(color, size), opacity: prog(t, at) }}>{children}</span>
}

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

/** a text table; `monoCols` are the columns set in the mono font */
function Table({ head, rows, widths, at, step = 0.5, size = 23, colors, monoCols = [] }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; monoCols?: number[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: monoCols.includes(i) ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', paddingRight: 10 })
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            RL · TRAIN → PLAY → SIM2SIM → SIM2REAL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Locomotion Deployment</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            보행 policy 파일 하나를 <span style={{ color: C.accent }}>실물 4족 · 휴머노이드</span> 에 올리기
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            학습 때 simulator 가 대신 해 주던 일을 배포 코드가 모두 다시 한다
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
  const jobs: [string, number][] = [
    ['센서 값을 학습 때와 같은 순서와 배율로 묶어 observation 을 만든다', 1.0],
    ['policy 가 낸 목표 각도를 맞는 motor 로 보낸다', 1.6],
    ['로봇이 쓰러지지 않게 켜고 끈다', 2.2],
    ['이 일을 학습 때와 같은 주기로 되풀이한다', 2.8],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <svg width={640} height={330}>
          <g opacity={prog(t, 0.5)}>
            <path d="M120,50 L340,50 L380,90 L380,280 L120,280 Z" fill={C.bg} stroke={C.blue} strokeWidth={2.5} />
            <path d="M340,50 L340,90 L380,90" fill="none" stroke={C.blue} strokeWidth={2.5} />
            <text x={250} y={130} textAnchor="middle" fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
              policy 파일
            </text>
            <text x={250} y={166} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              TorchScript
            </text>
            <text x={250} y={214} textAnchor="middle" fill={C.text} fontSize={22}>
              weight 만 담음
            </text>
            <text x={250} y={252} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO}>
              G1: 47 개 → 12 개
            </text>
          </g>
          {arrow(420, 165, 600, 165, C.muted, 3, 12, prog(t, 0.8))}
        </svg>
        <div style={{ position: 'absolute', left: 660, top: 34, width: 1090, display: 'grid', gap: 16 }}>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 0.6) }}>학습 때 simulator 가 대신 해 주던 일 → 이제 배포 코드가 해야 할 일</span>
          {jobs.map(([s, at], i) => (
            <div key={s} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ fontFamily: MONO, color: C.accent, fontSize: 26, fontWeight: 600 }}>{i + 1}</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 498, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          policy 파일 하나로 실물이 첫 발을 떼려면, <span style={{ color: C.accent }}>배포 코드는 무엇을 똑같이 다시 해야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={680} w={1260} h={200} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 5.8) }}>따라가는 저장소: Unitree 의 unitree_rl_gym (4족 Go2 · 휴머노이드 G1 · H1 · H1_2)</span>
          <Flow steps={['Train', 'Play', 'Sim2Sim', 'Sim2Real']} color={C.blue} at={6.0} gap={0.3} />
          <span style={{ ...line(C.red, 23), opacity: prog(t, 7.2) }}>하나만 어긋나도 simulation 에서 잘 걷던 policy 가 실물에서 바로 쓰러진다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 1: the four stages and the numbers outside the policy ----------

function Stages() {
  const t = useSec()
  const stages = [
    { name: 'Train', sim: 'Isaac Gym', job: '환경 수천 개를 함께 돌려 PPO 로 학습', test: 'reward 가 원하는 걸음을 만드는가', color: C.blue, at: 0.6 },
    { name: 'Play', sim: 'Isaac Gym', job: '같은 simulator 에서 재생하고 파일로 내보냄', test: '걸음이 눈으로 봐도 괜찮은가', color: C.blue, at: 1.6 },
    { name: 'Sim2Sim', sim: 'MuJoCo', job: '같은 policy 로 다른 simulator 에서 걷게 함', test: 'Isaac Gym 에만 맞춘 걸음인가 · 배포 script 가 맞는가', color: C.green, at: 2.6 },
    { name: 'Sim2Real', sim: '실물 로봇', job: '실물 로봇에 올림', test: '센서 · 통신 · motor 의 차이', color: C.green, at: 3.6 },
  ]
  const X = (i: number) => 64 + i * 460
  return (
    <AbsoluteFill>
      {stages.map((s, i) => (
        <Box
          key={s.name}
          x={X(i)}
          y={140}
          w={410}
          h={340}
          at={s.at}
          color={`${s.color}88`}
          gap={8}
          title={
            <span>
              <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: s.color }}>{s.name}</span>
              <span style={{ fontSize: 22, color: C.muted }}> · {s.sim}</span>
            </span>
          }
        >
          <span style={line(C.dim, 20)}>하는 일</span>
          <span style={line(C.text, 22)}>{s.job}</span>
          <span style={{ ...line(C.dim, 20), marginTop: 6 }}>걸러 내는 문제</span>
          <span style={line(C.text, 22)}>{s.test}</span>
        </Box>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => (
          <g key={i}>{arrow(X(i) + 410 + 6, 310, X(i) + 460 - 6, 310, C.muted, 3, 11, prog(t, stages[i + 1].at))}</g>
        ))}
        <rect x={X(2) - 2} y={138} width={414} height={344} rx={21} fill="none" stroke={C.accent} strokeWidth={3.5} opacity={prog(t, 13.2)} />
      </svg>
      <Appear at={6.7} style={{ position: 'absolute', left: 64, top: 500, width: 870 }}>
        <div style={{ height: 46, borderRadius: 12, background: `${C.blue}22`, border: `1.5px solid ${C.blue}77`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: C.blue, fontWeight: 600 }}>
          observation 을 만드는 코드: 학습 환경
        </div>
      </Appear>
      <Appear at={13.2} style={{ position: 'absolute', left: X(2), top: 500, width: 870 }}>
        <div style={{ height: 46, borderRadius: 12, background: `${C.green}22`, border: `1.5px solid ${C.green}77`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: C.green, fontWeight: 600 }}>
          observation 을 만드는 코드: 따로 쓴 배포 script (같은 조립 방식)
        </div>
      </Appear>
      <Box x={64} y={570} w={1040} h={310} at={19.6} gap={12} title={<Head color={C.accent}>policy 주기 = physics 간격 × decimation</Head>}>
        <Table
          at={19.8}
          head={['', 'physics 간격', 'decimation', 'policy 주기']}
          widths={[300, 200, 150, 330]}
          monoCols={[1, 2, 3]}
          rows={[
            ['학습 (Isaac Gym)', '0.005 초', '4', '0.005 × 4 = 0.02 초'],
            ['Sim2Sim (MuJoCo)', '0.002 초', '10', '0.002 × 10 = 0.02 초'],
            ['실물', 'motor 제어기', '', '0.02 초'],
          ]}
        />
        <Line at={21.8} color={C.accent} size={21}>
          세 곳 모두 1초에 50 번 · 바꾸면 안 되는 값은 physics 간격이 아니라 policy 주기
        </Line>
      </Box>
      <Box x={1128} y={570} w={728} h={310} at={13.2} gap={10} color={`${C.red}77`} title={<Head color={C.red} size={24}>오해: Play 에서 잘 걸었으면 Sim2Sim 은 건너뛰어도 된다</Head>}>
        <Line at={13.6} size={22}>
          Play 에서는 학습 환경이 observation 을 만들어서, 배포 때 쓸 조립 코드는 Sim2Sim 에서 처음 실행된다
        </Line>
        <Line at={15.4} size={22} color={C.muted}>
          여기서 쓰러지면 policy 가 Isaac Gym 에만 맞춰졌거나 배포 코드가 틀린 것이고, 실물을 넘어뜨리지 않고 가릴 수 있다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Obs() {
  const t = useSec()
  const segs = [
    { idx: '0–2', name: '회전 속도', n: 3, scale: '× 0.25', color: C.blue, w: 190 },
    { idx: '3–5', name: '중력 방향', n: 3, scale: '× 1', color: C.purple, w: 190 },
    { idx: '6–8', name: '속도 명령', n: 3, scale: '× 2, 2, 0.25', color: C.orange, w: 190 },
    { idx: '9–20', name: '관절 각도 − 기본', n: 12, scale: '× 1', color: C.green, w: 300 },
    { idx: '21–32', name: '관절 속도', n: 12, scale: '× 0.05', color: C.pink, w: 300 },
    { idx: '33–44', name: '직전 action', n: 12, scale: '그대로', color: C.muted, w: 300 },
    { idx: '45–46', name: 'clock', n: 2, scale: 'sin, cos', color: C.dim, w: 150 },
  ]
  let x = 56
  const xs = segs.map((s) => {
    const at = x
    x += s.w + 10
    return at
  })
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={300} at={0.3}>
        <svg width={1792} height={300}>
          <text x={56} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.4)}>
            G1 policy 의 observation 47 칸 (g1_env.py · 배포 yaml g1.yaml)
          </text>
          <text x={56} y={80} fill={C.muted} fontSize={22} opacity={prog(t, 0.8)}>
            policy 파일은 숫자 47 개를 받아 12 개를 내는 함수일 뿐 · 칸의 뜻과 배율은 학습 설정과 배포 yaml 에 따로 적혀 있다
          </text>
          {segs.map((s, i) => {
            const cx = xs[i] + s.w / 2
            const hot = i === 4 ? prog(t, 6.6) : 0
            return (
              <g key={s.idx} opacity={prog(t, 1.2 + i * 0.3)}>
                <text x={cx} y={120} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                  {s.idx}
                </text>
                <rect x={xs[i]} y={132} width={s.w} height={80} rx={10} fill={`${s.color}22`} stroke={s.color} strokeWidth={1.5 + 2.5 * hot} />
                <text x={cx} y={166} textAnchor="middle" fill={s.color} fontSize={22} fontWeight={600}>
                  {s.name}
                </text>
                <text x={cx} y={196} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {s.n} 칸
                </text>
                <text x={cx} y={244} textAnchor="middle" fill={s.color} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  {s.scale}
                </text>
              </g>
            )
          })}
          <text x={56} y={282} fill={C.dim} fontSize={20} opacity={prog(t, 3.4)}>
            배율: 칸마다 숫자의 크기를 비슷하게 맞추려고 곱한다 · clock: 0.8 초짜리 걸음 주기의 어디쯤인지 나타내는 sin, cos 두 숫자
          </text>
        </svg>
      </Card>
      <Box x={64} y={464} w={900} h={416} at={6.5} color={`${C.pink}77`} title={<Head color={C.pink}>관절 속도 칸 (× 0.05) · 무릎이 4 rad/s 로 돌 때</Head>}>
        <Line at={6.8}>
          맞게 만들면 이 칸에는 <span style={mono(C.green)}>4 × 0.05 = 0.2</span>
        </Line>
        <Bar label="맞게 만든 경우" value={0.2} max={4} color={C.green} at={7.6} width={380} labelW={210} fmt="0.2" />
        <Line at={9.8} size={22} color={C.muted}>
          학습 때 이 칸에 더한 noise: <span style={mono(C.muted, 22)}>±1.5 × 0.05 = ±0.075</span> · policy 는 학습 내내 0.2 근처의 숫자를 봤다
        </Line>
        <Bar label="0.05 를 빠뜨림" value={4} max={4} color={C.red} at={12.7} width={380} labelW={210} fmt="4" />
        <Line at={14.6} color={C.red}>
          <span style={mono(C.red)}>4 ÷ 0.2 = 20</span> 배 큰 숫자 → policy 가 무엇을 낼지 예측할 수 없다
        </Line>
      </Box>
      <Box x={988} y={464} w={868} h={416} at={18.5} color={`${C.blue}77`} title={<Head color={C.blue}>목표 각도 = 기본 자세 + 0.25 × action</Head>}>
        <Line at={18.8}>G1 무릎의 기본 각도 0.3 rad · policy 가 0.4 를 낸 경우</Line>
        <Mono at={20} color={C.green} size={30}>
          0.3 + 0.25 × 0.4 = 0.4 rad
        </Mono>
        <Line at={24.7} color={C.red}>
          legged_gym 의 기본 배율 0.5 를 배포 yaml 에 잘못 적으면
        </Line>
        <Mono at={25.4} color={C.red} size={30}>
          0.3 + 0.5 × 0.4 = 0.5 rad
        </Mono>
        <Line at={27} size={22} color={C.muted}>
          기본 자세에서 벗어나는 양 <span style={mono(C.muted, 22)}>0.25 × 0.4 = 0.1</span> 이 <span style={mono(C.red, 22)}>0.5 × 0.4 = 0.2</span> rad 로, 학습 때의 두 배
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- section 2: joint order and gravity ----------

const H1_MAP = [7, 3, 4, 5, 10, 8, 0, 1, 2, 11]
const H1_NAMES = ['왼 yaw', '왼 roll', '왼 pitch', '왼 knee', '왼 ankle', '오 yaw', '오 roll', '오 pitch', '오 knee', '오 ankle']

function Joints() {
  const t = useSec()
  const slotX = (i: number) => 56 + i * 170
  const motorX = (m: number) => 56 + m * 140
  const hot = prog(t, 12.6)
  const chip = (s: string, color: string) => (
    <span key={s} style={{ padding: '5px 12px', borderRadius: 10, border: `1.5px solid ${color}88`, background: `${color}14`, color, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s}
    </span>
  )
  const leg = (s: string) => (s.startsWith('왼') ? C.blue : C.orange)
  const depth = ['왼 yaw', '왼 roll', '왼 pitch', '왼 knee', '왼 ankle', '오 yaw']
  const breadth = ['왼 yaw', '오 yaw', '왼 roll', '오 roll', '왼 pitch', '오 pitch']
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={390} at={0.3}>
        <svg width={1792} height={390}>
          <text x={56} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
            H1: policy 칸 (simulator 가 정한 관절 순서) → motor 번호 (제조사가 정함) · leg_joint2motor_idx
          </text>
          {H1_NAMES.map((n, i) => (
            <g key={n} opacity={prog(t, 0.8 + i * 0.15)}>
              <rect x={slotX(i)} y={66} width={150} height={84} rx={10} fill={`${leg(n)}1c`} stroke={leg(n)} strokeWidth={i === 3 ? 1.5 + 2.5 * hot : 1.5} />
              <text x={slotX(i) + 75} y={100} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
                칸 {i}
              </text>
              <text x={slotX(i) + 75} y={132} textAnchor="middle" fill={leg(n)} fontSize={20}>
                {n}
              </text>
            </g>
          ))}
          {H1_MAP.map((m, i) => {
            const isKnee = i === 3
            const dim = isKnee ? 1 : 1 - 0.7 * hot
            return (
              <line
                key={i}
                x1={slotX(i) + 75}
                y1={152}
                x2={motorX(m) + 64}
                y2={268}
                stroke={isKnee ? C.green : leg(H1_NAMES[i])}
                strokeWidth={isKnee ? 2 + 2 * hot : 2}
                opacity={prog(t, 6.7 + i * 0.25) * 0.85 * dim}
              />
            )
          })}
          <line x1={slotX(3) + 75} y1={152} x2={motorX(3) + 64} y2={268} stroke={C.red} strokeWidth={4} strokeDasharray="10 7" opacity={hot} />
          {Array.from({ length: 12 }, (_, m) => {
            const used = H1_MAP.includes(m)
            const color = m === 3 ? (hot > 0.5 ? C.red : C.text) : m === 5 ? (hot > 0.5 ? C.green : C.text) : C.text
            return (
              <g key={m} opacity={prog(t, 3) * (used ? 1 : 0.35)}>
                <rect x={motorX(m)} y={270} width={128} height={58} rx={10} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
                <text x={motorX(m) + 64} y={308} textAnchor="middle" fill={color} fontSize={26} fontFamily={MONO} fontWeight={600}>
                  {m}
                </text>
              </g>
            )
          })}
          <text x={56} y={366} fill={C.muted} fontSize={21} opacity={prog(t, 3)}>
            motor 번호
          </text>
          <text x={1736} y={366} textAnchor="end" fill={C.accent} fontSize={21} opacity={prog(t, 9.4)}>
            같은 회사의 G1 은 대응표가 [0, 1, …, 11] 이라 칸과 motor 번호가 같다 · 같은 제조사라도 모델마다 확인
          </text>
        </svg>
      </Card>
      <Box x={64} y={554} w={880} h={326} at={12.5} color={`${C.red}77`} title={<Head color={C.red}>대응표를 빠뜨리면: 칸 3 의 목표가 motor 3 으로</Head>}>
        <Line at={12.9}>칸 3 = 왼쪽 knee · 기본 0.3 rad · 각도 차이에 곱하는 gain kp 200</Line>
        <Line at={13.8}>motor 3 = 왼쪽 hip roll · 기본 각도가 0 이어야 할 관절</Line>
        <Mono at={15} color={C.red} size={28}>
          200 × 0.3 = 60 N·m
        </Mono>
        <Line at={16.4} color={C.muted}>
          0.3 rad (약 17°) 만큼 다리를 옆으로 돌리려 한다
        </Line>
      </Box>
      <Box x={968} y={554} w={888} h={326} at={19} gap={10} title={<Head color={C.accent}>관절을 세는 순서 · 앞 여섯 칸</Head>}>
        <Line at={19.3} size={21} color={C.muted}>
          깊이 우선 (Isaac Gym) · 한 다리를 끝까지 센 뒤 다음 다리
        </Line>
        <div style={{ display: 'flex', gap: 10, opacity: prog(t, 19.6) }}>{depth.map((s) => chip(s, leg(s)))}</div>
        <Line at={20.6} size={21} color={C.muted}>
          너비 우선 (Isaac Lab) · 몸통에서 같은 거리의 관절끼리 먼저
        </Line>
        <div style={{ display: 'flex', gap: 10, opacity: prog(t, 20.9) }}>{breadth.map((s) => chip(s, leg(s)))}</div>
        <Line at={22.6} size={22}>
          quaternion 칸 순서: Isaac Lab <span style={mono(C.purple, 22)}>(w, x, y, z)</span> · Isaac Gym <span style={mono(C.purple, 22)}>(x, y, z, w)</span>
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

/** a torso seen from the side (x forward = right, z up), leaning forward by `deg`, with gravity pointing down */
function Torso({ cx, cy, deg, color }: { cx: number; cy: number; deg: number; color: string }) {
  const a = (deg * Math.PI) / 180
  const up = [Math.sin(a), -Math.cos(a)]
  const fw = [Math.cos(a), Math.sin(a)]
  return (
    <g>
      <rect x={cx - 35} y={cy - 75} width={70} height={150} rx={18} fill={`${color}22`} stroke={color} strokeWidth={2.5} transform={`rotate(${deg} ${cx} ${cy})`} />
      {arrow(cx, cy, cx + fw[0] * 95, cy + fw[1] * 95, C.muted, 2.5, 10)}
      {arrow(cx, cy, cx + up[0] * 115, cy + up[1] * 115, C.muted, 2.5, 10)}
      <text x={cx + fw[0] * 95 + 8} y={cy + fw[1] * 95 + 24} fill={C.muted} fontSize={20} fontFamily={MONO}>
        x
      </text>
      <text x={cx + up[0] * 115 + 12} y={cy + up[1] * 115 + 6} fill={C.muted} fontSize={20} fontFamily={MONO}>
        z
      </text>
      {arrow(cx, cy + 10, cx, cy + 140, C.orange, 4, 13)}
      <text x={cx - 14} y={cy + 132} textAnchor="end" fill={C.orange} fontSize={20} fontWeight={600}>
        중력
      </text>
    </g>
  )
}

function Gravity() {
  const t = useSec()
  const poses = [
    { cx: 170, deg: 0, title: '똑바로 섬', v: '(0, 0, −1)', color: C.blue, at: 0.4 },
    { cx: 500, deg: 10, title: '앞으로 10° 숙임', v: '(0.174, 0, −0.985)', color: C.green, at: 6.4 },
    { cx: 830, deg: -10, title: '잘못 읽은 자세 (뒤로 젖힘)', v: '(−0.174, 0, −0.985)', color: C.red, at: 18.4 },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={460} at={0.3}>
        <svg width={1000} height={460}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
            옆에서 본 몸통과 중력 (몸통 좌표: x 앞, y 왼쪽, z 위)
          </text>
          {poses.map((p) => (
            <g key={p.title} opacity={prog(t, p.at)}>
              <text x={p.cx} y={92} textAnchor="middle" fill={p.color} fontSize={22} fontWeight={600}>
                {p.title}
              </text>
              <Torso cx={p.cx} cy={230} deg={p.deg} color={p.color} />
              <text x={p.cx} y={402} textAnchor="middle" fill={C.dim} fontSize={20}>
                몸통에서 본 중력
              </text>
              <text x={p.cx} y={436} textAnchor="middle" fill={p.color} fontSize={24} fontFamily={MONO} fontWeight={600}>
                {p.v}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Box x={1088} y={140} w={768} h={460} at={6.3} gap={10} title={<Head color={C.green} size={26}>앞으로 10° 숙인 자세의 중력 방향</Head>}>
        <Mono at={6.6} color={C.green} size={21}>
          sin 10° = 0.174, cos 10° = 0.985 → (0.174, 0, −0.985)
        </Mono>
        <Line at={12.4} size={21} color={C.muted}>
          배포 script 가 quaternion (w, x, y, z) 에서 계산하는 식
        </Line>
        <Mono at={12.8} size={26} color={C.purple}>
          x 성분 = 2(wy − zx)
        </Mono>
        <Mono at={13.2} size={26} color={C.purple}>
          y 성분 = −2(zy + wx)
        </Mono>
        <Mono at={13.6} size={26} color={C.purple}>
          z 성분 = 1 − 2(w² + z²)
        </Mono>
        <Line at={14.6} size={22}>
          숙인 자세 = y 축으로 10° · 절반 5° 를 써서 <span style={mono(C.text, 22)}>(0.996, 0, 0.087, 0)</span>
        </Line>
        <Mono at={16} size={23} color={C.green}>
          x 성분 = 2 × 0.996 × 0.087 = 0.174
        </Mono>
      </Box>
      <Box x={64} y={624} w={880} h={256} at={18.3} gap={10} color={`${C.red}77`} title={<Head color={C.red} size={26}>칸 순서를 잘못 읽으면</Head>}>
        <Line at={18.6}>
          (x, y, z, w) 로 저장된 <span style={mono(C.text, 22)}>(0, 0.087, 0, 0.996)</span> 을 (w, x, y, z) 로 읽음 → <span style={{ whiteSpace: 'nowrap' }}>w = 0, z = 0.996</span>
        </Line>
        <Mono at={20} color={C.red}>
          x 성분 = 2(0 − 0.996 × 0.087) = −0.174
        </Mono>
        <Line at={21.4} size={22} color={C.muted}>
          앞으로 숙였는데 policy 는 뒤로 젖혔다고 읽는다
        </Line>
      </Box>
      <Box x={968} y={624} w={888} h={256} at={24.5} gap={10} color={`${C.orange}77`} title={<Head color={C.orange} size={26}>똑바로 서 있을 때는 멀쩡하다</Head>}>
        <Line at={24.8}>
          똑바로 선 <span style={mono(C.text, 22)}>(0, 0, 0, 1)</span> 은 잘못 읽어도 <span style={mono(C.orange, 22)}>(0, 0, −1)</span>
        </Line>
        <Line at={26} size={22}>
          서 있는 동안 오류가 보이지 않다가, 몸이 기우는 순간 policy 가 반대쪽으로 바로잡으려 한다
        </Line>
        <Line at={28} size={21} color={C.accent}>
          점검: 매단 로봇을 앞으로 기울여 중력 방향의 x 칸이 + 가 되는지 본다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- section 3: body velocity ----------

function Integrate() {
  const t = useSec()
  const ox = 100
  const oy = 300
  const sx = 63 // px per second
  const sy = 433 // px per m/s
  const p = prog(t, 7.2, 3)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={240} at={0.3} gap={10} title={<Head>몸통 속도라는 빈칸</Head>}>
        <Line at={0.6}>legged_gym 의 기본 observation 48 개 (Go2 설정이 그대로 씀): 맨 앞 3 칸 = 몸통 선속도 × 2</Line>
        <Line at={2.2} size={22} color={C.muted}>
          속도 명령을 따라가려면 지금 속도를 알아야 하지만, 몸통 속도를 직접 재는 센서는 없다
        </Line>
      </Box>
      <Box x={64} y={404} w={860} h={476} at={6.5} gap={8} color={`${C.orange}77`} title={<Head color={C.orange}>IMU 가속도를 적분하면 · 오차 0.05 m/s² 가 남는 경우</Head>}>
        <svg width={800} height={360}>
          <text x={ox} y={26} fill={C.muted} fontSize={20}>
            속도 오차 (m/s)
          </text>
          <line x1={ox} y1={oy} x2={ox + 10 * sx + 20} y2={oy} stroke={C.muted} strokeWidth={1.5} />
          <line x1={ox} y1={oy} x2={ox} y2={44} stroke={C.muted} strokeWidth={1.5} />
          {[0, 5, 10].map((s) => (
            <text key={s} x={ox + s * sx} y={oy + 28} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          <text x={ox + 10 * sx + 20} y={oy + 56} textAnchor="end" fill={C.muted} fontSize={20}>
            시간 (초)
          </text>
          <text x={ox - 12} y={oy + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={ox - 12} y={oy - 0.5 * sy + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            0.5
          </text>
          <line x1={ox} y1={oy - 0.5 * sy} x2={ox + 10 * sx + 20} y2={oy - 0.5 * sy} stroke={C.red} strokeWidth={2} strokeDasharray="8 6" />
          <text x={ox + 12} y={oy - 0.5 * sy - 12} fill={C.red} fontSize={20}>
            걷기 명령 0.5 m/s
          </text>
          <line x1={ox} y1={oy} x2={ox + 10 * sx * p} y2={oy - 0.5 * sy * p} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />
          <circle cx={ox + 10 * sx} cy={oy - 0.5 * sy} r={7} fill={C.orange} opacity={prog(t, 10.2)} />
          <text x={ox + 10 * sx + 20} y={250} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 10.4)}>
            10 초 뒤 0.05 × 10 = 0.5 m/s
          </text>
        </svg>
      </Box>
      <Box x={948} y={140} w={908} h={420} at={12.8} gap={12} color={`${C.blue}77`} title={<Head color={C.blue}>Kalman filter · Bloesch 등 (2012) 의 EKF</Head>}>
        <Flow steps={['IMU 가속도 · 회전 속도', '몸통의 움직임 예측']} color={C.blue} at={13.1} />
        <Flow steps={['관절 각도', '몸통에서 발까지 vector', '보정 (닿은 발은 고정)']} color={C.blue} at={14.2} />
        <Line at={16} size={22} color={C.muted}>
          state 에 몸통의 위치 · 속도 · 자세와 발 위치를 넣고, 발이 떨어지면 그 발 위치의 noise 를 아주 크게 잡는다
        </Line>
        <Line at={19.5} size={22} color={C.green}>
          발 하나라도 닿아 있으면 바로잡힘: 속도, roll · pitch
        </Line>
        <Line at={21.5} size={22} color={C.red}>
          바로잡을 관측이 없음: 절대 위치, yaw → 계속 조금씩 어긋남
        </Line>
      </Box>
      <Box x={948} y={584} w={908} h={296} at={19.2} gap={10} color={`${C.green}77`} title={<Head color={C.green}>StarlETH 실험 · 60 초 동안 약 1 m 걸음</Head>}>
        <Line at={19.6} size={22}>
          속도 RMS 오차: 방향마다 <span style={mono(C.green, 22)}>0.011 ~ 0.015 m/s</span>
        </Line>
        <Line at={20.2} size={20} color={C.dim}>
          RMS 오차: 오차를 제곱해 평균 낸 뒤 제곱근을 씌운 값
        </Line>
        <Line at={21} size={22}>
          위치: 이동 거리의 10% 정도까지 어긋남
        </Line>
        <Line at={23} size={22} color={C.red}>
          미끄러지는 발을 고정으로 보면: 0.02 초에 1 cm → <span style={mono(C.red, 22)}>0.01 ÷ 0.02 = 0.5 m/s</span> 틀어짐
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Estimator() {
  const t = useSec()
  const rowHot = prog(t, 19.6)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1100} h={440} at={0.3} gap={12} color={`${C.purple}77`} title={<Head color={C.purple}>학습한 estimator · Ji 등 (2022, KAIST)</Head>}>
        <Flow steps={['관절 · IMU 이력', 'MLP estimator', '선속도 · 발 높이 · 접촉 확률', 'policy']} color={C.purple} at={0.7} gap={0.4} />
        <Line at={2.2}>estimator 는 simulator 가 아는 정답과의 오차 (MSE) 를 줄이고, policy 는 PPO 로 학습한다</Line>
        <Line at={3.6}>두 network 를 같은 batch 로 함께 학습 → policy 는 추정값을 받으며 배우고, 추정이 흔들리면 조심스럽게 움직인다</Line>
        <Line at={5} size={22} color={C.muted}>
          정답 속도로 policy 를 먼저 학습하고 estimator 를 나중에 따로 학습하면 함께 학습한 경우보다 조금 나빴다
        </Line>
      </Box>
      <Box x={1188} y={140} w={668} h={440} at={6.8} gap={12} color={`${C.green}77`} title={<Head color={C.green}>Mini Cheetah 에서 달린 속도</Head>}>
        <Bar label="평지" value={3.75} max={4} color={C.green} at={7.2} width={220} labelW={200} unit=" m/s" />
        <Bar label="마찰 계수 0.22 판" value={3.54} max={4} color={C.orange} at={8.6} width={220} labelW={200} unit=" m/s" />
        <Line at={9.6} size={21} color={C.dim}>
          마찰 계수: 작을수록 미끄럽다
        </Line>
        <div style={{ marginTop: 8, opacity: prog(t, 13.2) }}>
          <Head size={24}>한 번 계산하는 시간</Head>
        </div>
        <Bar label="estimator" value={7} max={34} color={C.purple} at={13.6} width={220} labelW={200} unit=" µs" />
        <Bar label="Kalman filter" value={34} max={34} color={C.blue} at={14.4} width={220} labelW={200} unit=" µs" />
        <Line at={15.6} size={21} color={C.dim}>
          Mini Cheetah 의 linear Kalman filter · 1 µs 는 100만분의 1 초
        </Line>
      </Box>
      <Box x={64} y={604} w={1792} h={276} at={19.4} gap={10} title={<Head color={C.accent}>몸통 속도를 다루는 세 방법</Head>}>
        <Table
          at={19.5}
          step={0.3}
          head={['방법', '배포 때 필요한 것', '약점']}
          widths={[520, 560, 620]}
          rows={[
            ['Kalman filter (Bloesch 2012)', '정확한 다리 kinematics, 접촉 판정', '미끄러짐과 접촉 판정 오류에 약하다'],
            ['학습한 estimator (Ji 2022)', 'estimator network', 'simulator 의 정답에 의존한다'],
            ['actor 에서 빼기 (G1)', '없음 · 속도는 critic 의 50 칸에만', 'policy 가 속도를 이력에서 짐작해야 한다'],
          ]}
          colors={[C.blue, C.purple, rowHot > 0.5 ? C.accent : C.text]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- section 4: motor commands, start-up and loop timing ----------

function Motor() {
  const t = useSec()
  const states = [
    { name: 'zero torque (매단 채)', body: '관절이 손으로 움직인다', next: '다음: start 버튼', color: C.muted },
    { name: '기본 자세로 이동', body: '2 초 · 100 step 보간', next: '다음: 자동', color: C.blue },
    { name: '기본 자세 유지', body: '줄을 내려 발을 땅에', next: '다음: A 버튼', color: C.blue },
    { name: '실행', body: '0.02 초마다 policy', next: '다음: select 버튼', color: C.green },
    { name: 'damping', body: 'kp 0 · kd 8 · 주저앉음', next: '프로그램을 끝낸다', color: C.orange },
  ]
  const SX = (i: number) => 64 + i * 368
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1000} h={340} at={0.3} gap={10} title={<Head color={C.accent}>rt/lowcmd · motor 마다 다섯 숫자 (DDS, Ethernet)</Head>}>
        <Table
          at={0.6}
          step={0.4}
          head={['숫자', '뜻', '보행 policy 가 보내는 값']}
          widths={[130, 330, 460]}
          monoCols={[0]}
          rows={[
            ['q', '목표 각도', '기본 자세 + 0.25 × action'],
            ['dq', '목표 각속도', '0'],
            ['kp', '각도 차이에 곱하는 gain', '학습 때와 같은 값'],
            ['kd', '각속도 차이에 곱하는 gain', '학습 때와 같은 값'],
            ['tau', '더할 torque', '0'],
          ]}
        />
      </Box>
      <Box x={1088} y={140} w={768} h={340} at={6.5} gap={8} color={`${C.green}77`} title={<Head color={C.green}>G1 왼쪽 무릎 · kp 150 · kd 4</Head>}>
        <Line at={6.8}>목표 0.4 rad · 지금 0.35 rad · 각속도 1 rad/s</Line>
        <Mono at={7.8}>150 × (0.4 − 0.35) = 150 × 0.05 = 7.5</Mono>
        <Mono at={8.8}>4 × (0 − 1) = −4</Mono>
        <Mono at={9.8} color={C.green} size={28}>
          7.5 − 4 = 3.5 N·m
        </Mono>
        <Line at={10.8} size={21} color={C.muted}>
          gain 을 바꾸면 같은 action 이 다른 torque 가 된다 → 배포 yaml 의 gain 은 학습 설정과 똑같이
        </Line>
      </Box>
      <Box x={64} y={500} w={860} h={210} at={12.6} gap={10} color={`${C.orange}77`} title={<Head color={C.orange}>damping 명령 · kp 0, kd 8, 나머지 0</Head>}>
        <Mono at={13}>torque = −8 × 각속도 → 2 rad/s 면 8 × 2 = 16 N·m</Mono>
        <Line at={14.6} size={22} color={C.muted}>
          관절이 멈춰 있으면 torque 가 0 이라 자세를 지키지 못해, 로봇은 천천히 주저앉는다
        </Line>
      </Box>
      <Box x={948} y={500} w={908} h={210} at={24.6} gap={8} color={`${C.red}77`} title={<Head color={C.red} size={24}>기본 자세로 옮기기 · 무릎 1.0 → 0.3 rad (0.7 rad, kp 150)</Head>}>
        <Bar label="한 번에" value={105} max={105} color={C.red} at={25} width={220} labelW={200} fmt="150 × 0.7 = 105" unit=" N·m" />
        <Bar label="100 step 에 나눔" value={1.05} max={105} color={C.green} at={26.4} width={220} labelW={200} fmt="150 × 0.007 = 1.05" unit=" N·m" />
        <Line at={27.6} size={21} color={C.dim}>
          step 마다 목표가 0.7 ÷ 100 = 0.007 rad 씩 움직인다
        </Line>
      </Box>
      {states.map((s, i) => (
        <Appear key={s.name} at={18.8 + i * 0.5} style={{ position: 'absolute', left: SX(i), top: 730, width: 320 }}>
          <div style={{ height: 150, padding: '16px 18px', borderRadius: 18, background: C.card, border: `1.5px solid ${s.color}88`, display: 'grid', alignContent: 'start', gap: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: s.color, lineHeight: 1.45 }}>{s.name}</span>
            <span style={line(C.text, 21)}>{s.body}</span>
            <span style={line(C.accent, 20)}>{s.next}</span>
          </div>
        </Appear>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>{arrow(SX(i) + 320 + 6, 805, SX(i) + 368 - 6, 805, C.muted, 3, 10, prog(t, 19.1 + i * 0.5))}</g>
        ))}
      </svg>
    </AbsoluteFill>
  )
}

function Loop() {
  const t = useSec()
  const k = 21 // px per ms
  const x0 = 260
  const row = (y: number, cycle: number, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      {[0, 1, 2].map((c) => {
        const x = x0 + c * cycle * k
        return (
          <g key={c}>
            <rect x={x} y={y} width={3 * k} height={50} rx={4} fill={C.orange} />
            <rect x={x + 3 * k} y={y} width={(cycle - 3) * k - 4} height={50} rx={4} fill={`${C.blue}44`} stroke={C.blue} strokeWidth={1.5} />
            <line x1={x} y1={y - 8} x2={x} y2={y + 58} stroke={C.text} strokeWidth={2} />
            <text x={x + (cycle * k) / 2} y={y + 86} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
              {cycle} ms
            </text>
          </g>
        )
      })}
      <line x1={x0 + 3 * cycle * k} y1={y - 8} x2={x0 + 3 * cycle * k} y2={y + 58} stroke={C.text} strokeWidth={2} />
    </g>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={370} at={0.3}>
        <svg width={1792} height={370}>
          <text x={40} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
            loop 한 바퀴의 시간 · 계산 · 통신 3 ms 인 경우
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={1340} y={26} width={26} height={22} rx={4} fill={C.orange} />
            <text x={1376} y={44} fill={C.muted} fontSize={21}>
              계산 · 통신
            </text>
            <rect x={1530} y={26} width={26} height={22} rx={4} fill={`${C.blue}44`} stroke={C.blue} strokeWidth={1.5} />
            <text x={1566} y={44} fill={C.muted} fontSize={21}>
              기다림
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <text x={40} y={116} fill={C.red} fontSize={22} fontWeight={600}>
              Python 예제
            </text>
            <text x={40} y={146} fill={C.muted} fontSize={20}>
              끝에서 20 ms 쉼
            </text>
          </g>
          {row(96, 23, C.red, 1)}
          <g opacity={prog(t, 13.2)}>
            <text x={40} y={262} fill={C.green} fontSize={22} fontWeight={600}>
              C++ 예제 cpp_g1
            </text>
            <text x={40} y={292} fill={C.muted} fontSize={20} fontFamily={MONO}>
              sleep_until
            </text>
          </g>
          {row(242, 20, C.green, 13.4)}
        </svg>
      </Card>
      <Box x={64} y={534} w={880} h={346} at={0.8} gap={12} color={`${C.red}77`} title={<Head color={C.red}>쉬기만 하면 한 바퀴 = 3 ms + 20 ms = 23 ms</Head>}>
        <Line at={1.2}>
          1초에 50 번이 아니라 <span style={mono(C.red)}>1 ÷ 0.023 ≈ 43.5</span> 번 불린다
        </Line>
        <Line at={7}>
          걸음 clock 의 0.8 초 주기 = <span style={mono(C.text)}>0.8 ÷ 0.02 = 40</span> step
        </Line>
        <Mono at={7.8} color={C.red}>
          40 × 0.023 = 0.92 초 (학습 때 0.8 초)
        </Mono>
        <Line at={10} size={22} color={C.muted}>
          action 하나가 motor 에 머무는 시간도 0.02 초에서 0.023 초로 15% 늘어나, 같은 action 이 관절을 더 멀리 움직인다
        </Line>
      </Box>
      <Box x={968} y={534} w={888} h={346} at={13} gap={12} color={`${C.green}77`} title={<Head color={C.green}>다음 시작 시각까지만 기다리기</Head>}>
        <Line at={13.4} size={22}>
          cpp_g1 은 다음 loop 를 시작할 시각을 미리 정해 두고 그 시각까지만 기다린다 (sleep_until)
        </Line>
        <Line at={15} size={22}>
          계산 시간이 기다리는 시간에서 빠져서, 계산이 0.02 초보다 짧은 한 주기는 그대로 0.02 초
        </Line>
        <Line at={19.6} size={22} color={C.accent}>
          어느 쪽이든 계산이 0.02 초를 넘으면 주기를 못 지킨다 → loop 시작 시각을 기록해 간격의 분포를 본다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '배율 · 기본 자세 · action 배율 · PD gain · 0.02 초 주기를 학습 때와 같게', at: 1 },
    { tag: script.sections[1], color: C.blue, text: 'H1 대응표 [7, 3, 4, 5, 10, 8, 0, 1, 2, 11] · 중력 x 성분 0.174 → −0.174', at: 4.4 },
    { tag: script.sections[2], color: C.purple, text: '적분 오차 0.05 m/s² → 10 초 뒤 0.5 m/s · EKF · estimator · actor 에서 빼기', at: 8.4 },
    { tag: script.sections[3], color: C.orange, text: 'q, dq, kp, kd, tau · zero torque → 2 초 보간 → damping · 시작 시각까지 기다리기', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            policy 파일 하나로 실물이 첫 발을 떼려면, 배포 코드는 무엇을 다시 해야 할까?
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Perceptive Locomotion</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            지형을 보는 센서를 observation 에 더하고, 센서가 늦거나 틀릴 때 policy 가 버티는 방법
          </Label>
        </Appear>
        <Appear at={3.7}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600 }}>Humanoid Locomotion</span>
            <Label color={C.muted} size={30}>
              · 휴머노이드의 보행
            </Label>
          </div>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/locomotion-deployment (unitree_rl_gym · Bloesch 2012 · Ji 2022)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseObs = () => (
  <PauseWrite
    question="G1 이 z 축으로 0.8 rad/s 돌고, 앞으로 0.5 m/s 걸으라는 명령을 받았고, 왼쪽 무릎이 −2 rad/s 로 움직인다. 회전 속도 z 칸, 앞 속도 명령 칸, 왼쪽 무릎 속도 칸의 값은?"
    answer={
      <>
        0.8 × 0.25 = 0.2 · 0.5 × 2 = 1.0 · −2 × 0.05 = −0.1
        <br />
        배율: 회전 속도 × 0.25 · 속도 명령 × 2 · 관절 속도 × 0.05
      </>
    }
  />
)

const PauseJoint = () => (
  <PauseWrite
    question="H1 대응표 [7, 3, 4, 5, 10, 8, 0, 1, 2, 11]. 칸 8 (오른쪽 무릎) 의 목표는 어느 motor 로 가야 하고, 대응표를 빠뜨려 motor 8 로 보내면 어느 관절이 받는가?"
    answer={
      <>
        칸 8 → motor 2 · motor 8 은 대응표에서 칸 5 의 motor
        <br />
        칸 5 = 오른쪽 hip yaw → 무릎의 목표를 받아 다리를 비튼다
      </>
    }
  />
)

const PauseSlip = () => (
  <PauseWrite
    question="Kalman filter 가 땅에 닿았다고 본 발이 실제로는 0.02 초 동안 2 cm 미끄러졌다. 그 사이 몸통 속도 추정은 얼마나 틀어지는가?"
    answer={
      <>
        미끄러진 2 cm = 0.02 m → 0.02 ÷ 0.02 = 1 m/s
        <br />
        걷기 명령 0.5 m/s 보다 큰 오차 → 접촉 판정이 정확도를 좌우
      </>
    }
  />
)

const PauseLoop = () => (
  <PauseWrite
    question="계산과 통신에 5 ms 가 걸리는데 loop 끝에서 20 ms 를 쉰다. policy 는 1초에 몇 번 불리고, 0.8 초 주기로 학습한 걸음 clock 은 실제로 몇 초마다 한 바퀴 도는가?"
    answer={
      <>
        한 바퀴 5 + 20 = 25 ms → 1 ÷ 0.025 = 40 번
        <br />
        0.8 ÷ 0.02 = 40 step → 40 × 0.025 = 1.0 초
      </>
    }
  />
)

export function LocomotionDeployment() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        stages: Stages,
        obs: Obs,
        'pause-obs': PauseObs,
        joints: Joints,
        gravity: Gravity,
        'pause-joint': PauseJoint,
        integrate: Integrate,
        estimator: Estimator,
        'pause-slip': PauseSlip,
        motor: Motor,
        loop: Loop,
        'pause-loop': PauseLoop,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
