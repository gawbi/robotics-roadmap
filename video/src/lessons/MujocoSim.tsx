import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './mujoco-sim.narration.json'
import { script } from './mujoco-sim.script'

// Numbers follow lessons/mujoco-sim/README.md (see mujoco-sim.script.ts). The box, arm, gripper and sag drawings are
// schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap, overflow: 'hidden' }}>
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
        <span style={{ fontSize: 24, fontWeight: 600, color, marginLeft: 8, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
    </div>
  )
}

const line = (color = C.text, size = 22): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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
function Table({ head, rows, widths, at, step = 0.6, size = 22, colors, ats }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; ats?: number[] }) {
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
        <div key={k} style={{ display: 'flex', opacity: prog(t, ats?.[k] ?? at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
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

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 330, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
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
            KINEMATICS · PHYSICS ENGINE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>MuJoCo Simulation</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            step 마다 푸는 <span style={{ color: C.accent }}>equation of motion · soft contact</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            2012 년 Todorov 등이 발표한 physics engine 을 로봇 팔 예제로 숫자부터 따라가 본다
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

function OddCard({ x, at, title, text, color, children }: { x: number; at: number; title: string; text: string; color: string; children: ReactNode }) {
  return (
    <Card x={x} y={140} w={568} h={330} at={at}>
      <svg width={568} height={200} style={{ position: 'absolute', left: 0, top: 10 }}>
        {children}
      </svg>
      <div style={{ position: 'absolute', left: 24, top: 214, width: 520, display: 'grid', gap: 6 }}>
        <Head color={color} size={24}>
          {title}
        </Head>
        <span style={line(C.muted, 21)}>{text}</span>
      </div>
    </Card>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <OddCard x={64} at={0.4} title="바닥 속으로 0.1 mm 쯤" text="바닥에 내려놓은 상자가 바닥 안으로 조금 들어가 있다" color={C.orange}>
        <rect x={60} y={150} width={448} height={40} fill={`${C.muted}33`} />
        <line x1={60} y1={150} x2={508} y2={150} stroke={C.muted} strokeWidth={2} />
        <rect x={210} y={66} width={148} height={96} rx={4} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2.5} />
        <rect x={210} y={150} width={148} height={12} fill={`${C.red}aa`} />
        <text x={378} y={172} fill={C.red} fontSize={20}>
          겹친 부분
        </text>
        <text x={540} y={30} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </OddCard>
      <OddCard x={676} at={1.2} title="timestep 을 키우면 튀어 오름" text="Δt 를 조금 키웠을 뿐인데 물체가 하늘로 튀어 오른다" color={C.red}>
        <line x1={60} y1={180} x2={508} y2={180} stroke={C.muted} strokeWidth={2} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={170 + i * 90} y={130 - i * 50} width={60} height={46} rx={4} fill={`${C.red}${['33', '55', '99'][i]}`} stroke={C.red} strokeWidth={2} opacity={prog(t, 1.4 + i * 0.3)} />
        ))}
        {arrow(420, 90, 470, 30, C.red, 3, 11, prog(t, 2.4))}
      </OddCard>
      <OddCard x={1288} at={2} title="집히던 큐브가 미끄러짐" text="simulation 에서 잘 집히던 큐브가 실제 팔에서는 손가락 사이로 빠진다" color={C.pink}>
        <rect x={180} y={30} width={28} height={140} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={360} y={30} width={28} height={140} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={208} y={70 + 30 * prog(t, 2.4, 1.5)} width={152} height={100} rx={4} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} />
        {arrow(284, 150, 284, 196, C.pink, 3, 10, prog(t, 2.6))}
      </OddCard>
      <Appear at={4.5} style={{ position: 'absolute', left: 64, top: 505, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          컴퓨터는 매 순간 <span style={{ color: C.accent }}>무엇을 계산하길래</span> 이런 일이 생길까?
        </div>
      </Appear>
      <Card x={330} y={630} w={1260} h={250} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Label size={22}>OpenAI 2018 · Shadow 로봇 손이 블록을 원하는 방향으로 돌리는 policy 를 MuJoCo 안에서만 학습해 실제 손으로 옮겼다</Label>
          <div style={{ display: 'flex', gap: 24, opacity: prog(t, 6.2) }}>
            {[
              ['마찰 · 질량을 무작위로 바꾸며 쌓은 simulation 경험', '약 100 년치', C.accent],
              ['실제로 걸린 학습 시간', '50 시간 정도', C.green],
            ].map(([a, b, c]) => (
              <div key={a} style={{ flex: 1, padding: '14px 22px', borderRadius: 16, border: `1.5px solid ${c}55`, background: `${c}10`, display: 'grid', gap: 4 }}>
                <span style={line(C.muted, 21)}>{a}</span>
                <span style={mono(c, 36)}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- step and state ----------

const BOX_T = [0, 0.1, 0.2, 0.3, 0.4, 0.5]
const BOX_H = [1, 0.9019, 0.7057, 0.4114, 0.019, -0.4715]
const BOX_LABEL = ['1', '0.9019', '0.7057', '0.4114', '0.0190', '−0.4715']

function Step() {
  const t = useSec()
  const px = (s: number) => 100 + (s / 0.5) * 660
  const py = (h: number) => 90 + (1 - h) * 253.3
  const shown = (i: number) => prog(t, 6.6 + i * 0.9, 0.4)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 132, width: 1792, display: 'grid', gap: 12 }}>
        <Flow steps={['상태 (위치 · 속도)', '힘', '가속도', '새 속도', '새 위치']} color={C.accent} at={0.5} gap={0.45} last="= step 하나 (간격 Δt)" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.2) }}>
          semi-implicit Euler: 속도를 먼저 고친 뒤 그 <span style={{ color: C.text }}>새 속도</span>로 위치를 옮긴다 · 1 kg 상자의 gravity 1 × 9.81 = 9.81 N → 가속도 −9.81 m/s²
        </span>
      </div>
      <Card x={64} y={240} w={900} h={640} at={6}>
        <svg width={900} height={640}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            1 m 에서 놓은 1 kg 상자 · Δt = 0.1 초
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            바닥 계산 없음
          </text>
          <rect x={70} y={py(0)} width={740} height={py(-0.5) - py(0)} fill={`${C.red}10`} />
          <line x1={70} y1={py(0)} x2={810} y2={py(0)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 6" />
          <text x={110} y={py(0) - 12} fill={C.muted} fontSize={20}>
            바닥 (높이 0)
          </text>
          <text x={110} y={py(0) + 34} fill={C.red} fontSize={20} opacity={0.8}>
            바닥 아래
          </text>
          <line x1={70} y1={80} x2={70} y2={480} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={70} y1={480} x2={810} y2={480} stroke={C.cardEdge} strokeWidth={2} />
          {[
            [1, '1 m'],
            [0, '0'],
            [-0.5, '−0.5'],
          ].map(([h, s]) => (
            <text key={s} x={60} y={py(h as number) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          {BOX_T.map((s, i) => (
            <text key={s} x={px(s)} y={508} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          <text x={810} y={540} textAnchor="end" fill={C.dim} fontSize={20}>
            시각 (초)
          </text>
          {BOX_T.slice(1).map((s, k) => {
            const i = k + 1
            return <line key={s} x1={px(BOX_T[i - 1])} y1={py(BOX_H[i - 1])} x2={px(s)} y2={py(BOX_H[i])} stroke={i === 5 ? C.red : C.blue} strokeWidth={3} opacity={shown(i)} />
          })}
          {BOX_T.map((s, i) => (
            <g key={s} opacity={shown(i)}>
              <circle cx={px(s)} cy={py(BOX_H[i])} r={9} fill={i === 5 ? C.red : i === 4 ? C.orange : C.blue} />
              <text x={px(s) + 14} y={py(BOX_H[i]) - 14} fill={i === 5 ? C.red : i === 4 ? C.orange : C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
                {BOX_LABEL[i]}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 12.6)}>
            <text x={30} y={584} fill={C.orange} fontSize={22} fontWeight={600}>
              0.4 초: 바닥 바로 위 0.019 m → 다음 step: −0.4715 m (바닥을 약 47 cm 뚫음)
            </text>
            <text x={30} y={620} fill={C.muted} fontSize={20}>
              닿았는지 검사하고 미는 힘을 구하는 계산이 따로 있어야 한다 → soft contact
            </text>
          </g>
        </svg>
      </Card>
      <Box x={990} y={240} w={866} h={360} at={6.3} title={<Head size={24}>step 표 · 새 속도 = 속도 − 9.81 × 0.1</Head>}>
        <Table
          at={6.5}
          step={0.9}
          head={['step', '시각 (초)', '높이 (m)', '속도 (m/s)']}
          widths={[120, 200, 230, 240]}
          rows={BOX_T.map((s, i) => [String(i), String(s), BOX_LABEL[i], ['0', '−0.981', '−1.962', '−2.943', '−3.924', '−4.905'][i]])}
          colors={[undefined, undefined, undefined, undefined, C.orange, C.red]}
        />
      </Box>
      <Box x={990} y={620} w={420} h={260} at={18} gap={12} title={<Head size={24} color={C.accent}>상태 = 위치 + 속도</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={line(C.text, 22)}>
            <span style={mono(C.blue, 22)}>mjModel</span> 바뀌지 않는 길이 · 질량 · 모양 · motor
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 19.2) }}>
            <span style={mono(C.green, 22)}>mjData</span> 매 step 바뀌는 위치와 속도
          </span>
        </div>
      </Box>
      <Box x={1430} y={620} w={426} h={260} at={24} gap={12} title={<Head size={24} color={C.green}>SO-101 · step 약 3.2 µs</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={line(C.text, 22)}>
            timestep 5 ms → <span style={mono(C.green, 22)}>약 1560 배</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>10 초짜리 시도 100 만 번</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 25.6) }}>
            실제 팔로 <span style={mono(C.red, 22)}>약 116 일</span>
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 26.4) }}>
            physics 계산은 <span style={mono(C.green, 22)}>2 시간 미만</span>
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- equation of motion ----------

function Arm({ t }: { t: number }) {
  const L = 210
  const A = { s: [110, 190], e: [110 + L, 190], p: [110 + 2 * L, 190] }
  const B = { s: [110, 440], e: [110 + L, 440], p: [110 + L, 440 + L] }
  const mass = (x: number, y: number) => <circle cx={x} cy={y} r={18} fill={C.orange} />
  const joint = (x: number, y: number) => <circle cx={x} cy={y} r={12} fill={C.card} stroke={C.accent} strokeWidth={3} />
  const ccw = prog(t, 6.7)
  return (
    <svg width={860} height={740}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
        joint 두 개짜리 팔 · 막대 무게 없음
      </text>
      <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
        추 1 kg × 2 · 0.5 m 간격
      </text>
      {/* pose A: stretched */}
      <g opacity={prog(t, 0.5)}>
        <text x={30} y={100} fill={C.muted} fontSize={22}>
          편 자세
        </text>
        <line x1={A.s[0]} y1={A.s[1]} x2={A.p[0]} y2={A.p[1]} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
        {joint(A.s[0], A.s[1])}
        {mass(A.e[0], A.e[1])}
        {mass(A.p[0], A.p[1])}
        <text x={A.s[0]} y={236} textAnchor="middle" fill={C.muted} fontSize={20}>
          어깨
        </text>
        <text x={A.e[0]} y={236} textAnchor="middle" fill={C.muted} fontSize={20}>
          팔꿈치
        </text>
        <text x={A.p[0]} y={236} textAnchor="middle" fill={C.muted} fontSize={20}>
          손끝
        </text>
        <text x={30} y={284} fill={C.text} fontSize={23}>
          어깨 inertia = <tspan fontFamily={MONO}>1 × 0.5² + 1 × 1² =</tspan>{' '}
          <tspan fontFamily={MONO} fill={C.accent} fontWeight={700}>
            1.25
          </tspan>
        </text>
      </g>
      {/* torque on the shoulder only: the elbow mass moves, the tip mass stays */}
      <g opacity={ccw}>
        <path d={`M ${A.s[0] + 26} ${A.s[1] + 14} A 30 30 0 1 0 ${A.s[0] - 6} ${A.s[1] + 29}`} fill="none" stroke={C.orange} strokeWidth={3} />
        <text x={A.s[0]} y={140} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
          1 N·m
        </text>
        {arrow(A.e[0], A.e[1] - 24, A.e[0], A.e[1] - 80, C.orange, 3, 11)}
        <text x={A.e[0] + 16} y={124} fill={C.orange} fontSize={20}>
          앞으로 가속
        </text>
        <text x={A.p[0]} y={158} textAnchor="middle" fill={C.pink} fontSize={20}>
          제자리
        </text>
        <text x={30} y={334} fill={C.orange} fontSize={23} fontWeight={600}>
          어깨 <tspan fontFamily={MONO}>+4</tspan> · 팔꿈치 <tspan fontFamily={MONO}>−8 rad/s²</tspan> (팔꿈치가 반대로 꺾인다)
        </text>
      </g>
      {/* pose B: elbow bent 90° */}
      <g opacity={prog(t, 2.5)}>
        <text x={30} y={392} fill={C.muted} fontSize={22}>
          직각으로 굽힌 자세
        </text>
        <line x1={B.s[0]} y1={B.s[1]} x2={B.e[0]} y2={B.e[1]} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
        <line x1={B.e[0]} y1={B.e[1]} x2={B.p[0]} y2={B.p[1]} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
        <line x1={B.s[0]} y1={B.s[1]} x2={B.p[0]} y2={B.p[1]} stroke={C.accent} strokeWidth={2} strokeDasharray="6 6" />
        {joint(B.s[0], B.s[1])}
        {mass(B.e[0], B.e[1])}
        {mass(B.p[0], B.p[1])}
        <text x={B.s[0]} y={486} textAnchor="middle" fill={C.muted} fontSize={20}>
          어깨
        </text>
        <text x={B.e[0] + 28} y={432} fill={C.muted} fontSize={20}>
          팔꿈치
        </text>
        <text x={B.p[0] + 28} y={B.p[1] + 7} fill={C.muted} fontSize={20}>
          손끝
        </text>
        <text x={420} y={540} fill={C.accent} fontSize={22}>
          손끝까지 거리² <tspan fontFamily={MONO}>= 0.5² + 0.5² = 0.5</tspan>
        </text>
        <text x={420} y={584} fill={C.text} fontSize={23}>
          inertia <tspan fontFamily={MONO}>= 0.25 + 0.5 =</tspan>{' '}
          <tspan fontFamily={MONO} fill={C.accent} fontWeight={700}>
            0.75
          </tspan>
        </text>
      </g>
      <text x={30} y={720} fill={C.muted} fontSize={20} opacity={prog(t, 4)}>
        같은 1 N·m 의 어깨 각가속도: <tspan fontFamily={MONO}>1 ÷ 1.25 = 0.8 · 1 ÷ 0.75 ≈ 1.33 rad/s²</tspan>
      </text>
    </svg>
  )
}

function Mass() {
  const t = useSec()
  const cellNum = (v: string, x: number, y: number, color: string) => (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={36} fontFamily={MONO} fontWeight={600}>
      {v}
    </text>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <Arm t={t} />
      </Card>
      <Box x={950} y={140} w={906} h={290} at={12.5} title={<Head size={24} color={C.accent}>mass matrix M · 편 자세 (수평면, gravity 없음)</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <svg width={240} height={150}>
            <path d="M 22 10 L 8 10 L 8 140 L 22 140" fill="none" stroke={C.muted} strokeWidth={3} />
            <path d="M 218 10 L 232 10 L 232 140 L 218 140" fill="none" stroke={C.muted} strokeWidth={3} />
            {cellNum('1.25', 70, 60, C.text)}
            {cellNum('0.5', 175, 60, C.orange)}
            {cellNum('0.5', 70, 122, C.orange)}
            {cellNum('0.25', 175, 122, C.text)}
          </svg>
          <div style={{ display: 'grid', gap: 8 }}>
            <span style={mono(C.text, 24)}>1.25 α₁ + 0.5 α₂ = τ₁</span>
            <span style={mono(C.text, 24)}>0.5 α₁ + 0.25 α₂ = τ₂</span>
            <span style={{ ...mono(C.orange, 24), opacity: prog(t, 14) }}>τ = (1, 0) → α = (4, −8)</span>
          </div>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.5) }}>
          굽히면 M 이 <span style={mono(C.text, 22)}>0.75 · 0.25 · 0.25</span> 로 바뀌어 α = <span style={mono(C.text, 22)}>(2, −2)</span>
        </span>
      </Box>
      <Box x={950} y={446} w={906} h={214} at={18.5} gap={10} title={<Head size={24} color={C.orange}>gravity torque · 팔을 세워 수평으로 편 자세</Head>}>
        <span style={line(C.text, 24)}>
          어깨 <span style={mono(C.text, 24)}>9.81 × 0.5 + 9.81 × 1.0 = </span>
          <span style={mono(C.orange, 24)}>14.715 N·m</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 19.6) }}>
          팔꿈치 <span style={mono(C.text, 24)}>9.81 × 0.5 = </span>
          <span style={mono(C.orange, 24)}>4.905 N·m</span>
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 21) }}>아래팔을 늘어뜨리면 어깨 9.81 N·m · 팔꿈치 0</span>
      </Box>
      <Box x={950} y={676} w={906} h={190} at={22.5} gap={10}>
        <span style={line(C.muted, 22)}>
          <span style={{ color: C.purple, fontWeight: 600 }}>bias force c(q, q̇)</span> = gravity torque + 속도에서 생기는 torque
        </span>
        <span style={{ ...mono(C.accent, 40), opacity: prog(t, 24.6) }}>
          M(q) <QDD /> + c(q, q̇) = τ + τ<span style={{ fontFamily: 'inherit', fontSize: 26 }}>접촉</span>
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 25.6) }}>joint 6 개인 SO-101 의 M 은 6 × 6 행렬 · MuJoCo 는 c 를 qfrc_bias 에 담는다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** q with two dots above, drawn by hand: the mono font misplaces the combining diaeresis of q̈ */
function QDD() {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      q
      <span style={{ position: 'absolute', left: 0, right: 0, top: '-0.42em', textAlign: 'center', fontSize: '0.7em', letterSpacing: '-0.05em' }}>··</span>
    </span>
  )
}

// ---------- MJCF ----------

function Tag({ children, color = C.blue }: { children: ReactNode; color?: string }) {
  return <span style={mono(color, 22)}>{children}</span>
}

function Nest({ children, color, at }: { children: ReactNode; color: string; at: number }) {
  const t = useSec()
  return <div style={{ display: 'grid', gap: 6, padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${color}77`, background: `${color}0c`, opacity: prog(t, at) }}>{children}</div>
}

function Mjcf() {
  const t = useSec()
  const joints: [string, string, string, string][] = [
    ['hinge', '축 하나를 중심으로 돈다', '1', 'revolute'],
    ['slide', '축 방향으로 미끄러진다', '1', 'prismatic'],
    ['ball', '한 점을 중심으로 어느 방향으로든 돈다', '3', '없음'],
    ['free', '공중에서 자유롭게 옮겨 가고 돈다', '6', '없음'],
  ]
  const chips: [string, string][] = [
    ['timestep 0.005 초 (기본 0.002)', C.green],
    ['implicitfast (기본 Euler)', C.blue],
    ['iterations 10 (기본 100)', C.purple],
    ['elliptic cone · impratio 10', C.orange],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={820} h={740} at={0.3}>
        <div style={{ padding: '24px 28px', display: 'grid', gap: 16 }}>
          <Head size={24}>두 joint 팔을 적은 MJCF (XML) 의 구조</Head>
          <Nest color={C.muted} at={0.6}>
            <Tag color={C.muted}>{'<worldbody>'}</Tag>
            <Nest color={C.blue} at={1.2}>
              <span style={line(C.text, 22)}>
                <Tag>{'<body>'}</Tag> 위팔
              </span>
              <span style={line(C.muted, 22)}>
                <Tag color={C.accent}>{'<joint type="hinge">'}</Tag> 어깨
              </span>
              <span style={line(C.muted, 22)}>
                <Tag color={C.green}>{'<geom>'}</Tag> 충돌용 모양 · 질량
              </span>
              <Nest color={C.blue} at={2}>
                <span style={line(C.text, 22)}>
                  <Tag>{'<body>'}</Tag> 아래팔 (위팔 안에 들어 있다)
                </span>
                <span style={line(C.muted, 22)}>
                  <Tag color={C.accent}>{'<joint type="hinge">'}</Tag> 팔꿈치
                </span>
                <span style={line(C.muted, 22)}>
                  <Tag color={C.green}>{'<geom>'}</Tag> 충돌용 모양 · 질량
                </span>
              </Nest>
            </Nest>
          </Nest>
          <Nest color={C.orange} at={3}>
            <Tag color={C.orange}>{'<actuator>'}</Tag>
            <span style={line(C.muted, 22)}>
              <Tag color={C.orange}>{'<motor>'}</Tag> 어깨 joint 를 돌린다
            </span>
            <span style={line(C.muted, 22)}>
              <Tag color={C.orange}>{'<motor>'}</Tag> 팔꿈치 joint 를 돌린다
            </span>
          </Nest>
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 4) }}>joint 가 없는 body 는 바깥 body 에 고정된다 (URDF 의 fixed joint)</span>
        </div>
      </Card>
      <Box x={910} y={140} w={946} h={310} at={6.5} gap={10} title={<Head size={24} color={C.accent}>joint 종류와 DOF (움직일 수 있는 방향의 수)</Head>}>
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 4 }}>
            {['MJCF joint', '움직임', 'DOF', 'URDF'].map((h, i) => (
              <span key={h} style={{ width: [150, 480, 90, 170][i], fontSize: 20, color: C.muted, textAlign: i === 2 ? 'right' : 'left', paddingLeft: i === 3 ? 30 : 0 }}>
                {h}
              </span>
            ))}
          </div>
          {joints.map(([j, m, d, u], k) => (
            <div key={j} style={{ display: 'flex', alignItems: 'baseline', opacity: prog(t, 6.8 + k * 0.5) }}>
              <span style={{ ...mono(C.accent, 21), width: 150 }}>{j}</span>
              <span style={{ fontSize: 21, width: 480, whiteSpace: 'nowrap' }}>{m}</span>
              <span style={{ ...mono(C.text, 21), width: 90, textAlign: 'right' }}>{d}</span>
              <span style={{ fontSize: 20, width: 170, color: C.muted, paddingLeft: 30, whiteSpace: 'nowrap' }}>{u}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.text, 21), opacity: prog(t, 9.5) }}>
          free joint 상자 (방향은 quaternion): 위치 <span style={mono(C.green, 21)}>nq = 3 + 4 = 7</span> · 속도 <span style={mono(C.green, 21)}>nv = 3 + 3 = 6</span>
        </span>
      </Box>
      <Box x={910} y={465} w={946} h={170} at={13} gap={10} title={<Head size={24} color={C.green}>geom · 접촉 계산에 쓰는 모양, 질량도 정한다</Head>}>
        <span style={line(C.text, 22)}>
          기본 밀도 1000 kg/m³ → 한 변 0.1 m 상자 <span style={mono(C.green, 22)}>0.1³ × 1000 = 1 kg</span>
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 15.5) }}>mesh 는 convex hull 로 바꿔 계산 → 컵 안쪽 같은 오목한 곳이 메워진 것처럼 닿는다</span>
      </Box>
      <Box x={910} y={650} w={946} h={230} at={19.5} gap={12} title={<Head size={24} color={C.purple}>MuJoCo Menagerie 의 SO-101 · hinge 6 개 · 손목 카메라</Head>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {chips.map(([s, c], i) => (
            <span key={s} style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${c}77`, background: `${c}14`, color: c, fontSize: 21, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, 19.8 + i * 0.4) }}>
              {s}
            </span>
          ))}
        </div>
        <span style={{ ...line(C.text, 21), opacity: prog(t, 22.5) }}>
          모든 joint 0° 에서 URDF 의 <span style={mono(C.muted, 20)}>gripper_frame_link</span> 와 MJCF 의 <span style={mono(C.muted, 20)}>gripperframe</span> 가 <span style={mono(C.red, 22)}>19.9 mm</span> 차이
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- contact and friction ----------

function Contact() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={400} at={0.3}>
        <svg width={860} height={400}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            soft contact · 조금 겹치게 두고 밀어낸다
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도 (침투를 크게 그림)
          </text>
          <rect x={100} y={300} width={400} height={70} fill={`${C.muted}2a`} />
          <line x1={100} y1={300} x2={500} y2={300} stroke={C.muted} strokeWidth={2} />
          <rect x={110} y={140} width={180} height={180} rx={4} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2.5} />
          <rect x={110} y={300} width={180} height={20} fill={`${C.red}aa`} />
          <text x={200} y={234} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
            1 kg
          </text>
          <line x1={92} y1={300} x2={92} y2={320} stroke={C.red} strokeWidth={2} />
          <text x={84} y={318} textAnchor="end" fill={C.red} fontSize={20}>
            침투
          </text>
          <g opacity={prog(t, 1.4)}>
            {arrow(320, 150, 320, 250, C.orange, 4)}
            <text x={336} y={206} fill={C.orange} fontSize={20}>
              gravity 9.81 N
            </text>
            {arrow(320, 374, 320, 306, C.green, 4)}
            <text x={336} y={350} fill={C.green} fontSize={20}>
              normal force 9.81 N
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 580, top: 96, width: 250, display: 'grid', gap: 10, opacity: prog(t, 6.2) }}>
          <span style={line(C.muted, 21)}>바닥을 용수철로 보면</span>
          <span style={mono(C.text, 22)}>k = 10000 N/m</span>
          <span style={mono(C.text, 22)}>k × 침투 = 9.81</span>
          <span style={mono(C.text, 22)}>침투 = 9.81 ÷ 10000</span>
          <span style={mono(C.accent, 22)}>≈ 0.001 m ≈ 1 mm</span>
        </div>
      </Card>
      <Box x={64} y={560} w={860} h={320} at={12} gap={10} title={<Head size={24} color={C.accent}>기본 solref=&quot;0.02 1&quot; · MuJoCo 3.13 으로 잰 정지 침투</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="0.02 초 · 기본값" value={0.108} max={0.12} color={C.accent} at={12.4} unit=" mm" />
          <Bar label="0.01 초 · SO-101" value={0.061} max={0.12} color={C.blue} at={13.2} unit=" mm" />
          <Bar label="0.005 초" value={0.043} max={0.12} color={C.purple} at={14} unit=" mm" />
          <Bar label="10 g 상자 · 0.02 초" value={0.108} max={0.12} color={C.green} at={15} unit=" mm" />
        </div>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 15.8) }}>time constant 0.02 초는 겹침을 되돌리는 시간이라, 질량에 맞춰 단단함이 정해져 1 kg 과 10 g 이 같다</span>
      </Box>
      <Box x={950} y={140} w={906} h={364} at={18} gap={12} title={<Head size={24} color={C.orange}>Coulomb friction · 마찰 힘 ≤ μ × normal force</Head>}>
        <span style={line(C.text, 22)}>
          μ = 1 바닥의 1 kg 상자 → 한계 <span style={mono(C.orange, 22)}>1 × 9.81 = 9.81 N</span>
        </span>
        <Table
          at={18.6}
          step={0.7}
          head={['미는 힘', '한계', '실제 마찰', '가속도']}
          widths={[150, 160, 170, 370]}
          rows={[
            ['5 N', '9.81 N', '5 N', '0'],
            ['9.81 N', '9.81 N', '9.81 N', '0 (직전)'],
            ['12 N', '9.81 N', '9.81 N', '12 − 9.81 = 2.19 m/s²'],
          ]}
          colors={[undefined, undefined, C.orange]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 21.5) }}>μ × normal force 는 한계일 뿐이라, 5 N 으로 밀면 마찰도 5 N 만 생긴다</span>
      </Box>
      <Box x={950} y={520} w={906} h={360} at={24} gap={12} title={<Head size={24} color={C.pink}>두 손가락으로 0.1 kg 큐브 · 무게 0.1 × 9.81 = 0.981 N</Head>}>
        <div style={{ display: 'flex', gap: 20 }}>
          <svg width={240} height={220}>
            <text x={55} y={38} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              0.6 N
            </text>
            <text x={185} y={38} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              0.6 N
            </text>
            <rect x={40} y={50} width={30} height={140} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={170} y={50} width={30} height={140} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={70} y={80} width={100} height={100} rx={4} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} />
            <text x={120} y={137} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO}>
              0.1 kg
            </text>
            {arrow(4, 120, 36, 120, C.orange, 3, 9)}
            {arrow(236, 120, 204, 120, C.orange, 3, 9)}
            <text x={120} y={214} textAnchor="middle" fill={C.muted} fontSize={20}>
              한계 = 2 × μ × 0.6
            </text>
          </svg>
          <svg width={590} height={220}>
            <text x={0} y={54} fill={C.text} fontSize={22} fontFamily={MONO}>
              μ = 1
            </text>
            <text x={0} y={124} fill={C.text} fontSize={22} fontFamily={MONO}>
              μ = 0.6
            </text>
            <rect x={110} y={30} width={290} height={34} rx={6} fill={C.grid} />
            <rect x={110} y={100} width={290} height={34} rx={6} fill={C.grid} />
            <rect x={110} y={30} width={288 * prog(t, 24.6, 0.9)} height={34} rx={6} fill={C.green} />
            <rect x={110} y={100} width={173 * prog(t, 26, 0.9)} height={34} rx={6} fill={C.red} />
            <line x1={345} y1={15} x2={345} y2={150} stroke={C.text} strokeWidth={2.5} strokeDasharray="6 5" />
            <text x={345} y={180} textAnchor="middle" fill={C.text} fontSize={20}>
              무게 0.981 N
            </text>
            <text x={410} y={54} fill={C.green} fontSize={20} fontWeight={600} opacity={prog(t, 25.3)}>
              1.2 N · 들린다
            </text>
            <text x={410} y={124} fill={C.red} fontSize={20} fontWeight={600} opacity={prog(t, 26.7)}>
              0.72 N · 미끄러짐
            </text>
          </svg>
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 27.3) }}>μ = 1 로 학습한 집기를 μ = 0.6 인 매끈한 실물 큐브에 쓰면 큐브가 빠진다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- timestep ----------

function Tiles({ values, color, at, w }: { values: string[]; color: string; at: number; w: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {values.map((v, i) => (
        <div key={i} style={{ width: w, display: 'grid', justifyItems: 'center', gap: 4, opacity: prog(t, at + i * 0.6) }}>
          <span style={{ fontSize: 19, color: C.dim }}>step {i}</span>
          <div style={{ width: w, padding: '10px 0', textAlign: 'center', borderRadius: 12, border: `1.5px solid ${color}88`, background: `${color}14`, ...mono(color, 26) }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

function Timestep() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1180} h={470} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 22, right: 30, display: 'flex', alignItems: 'baseline' }}>
          <Head size={26}>용수철로 본 timestep 의 한계</Head>
          <span style={{ marginLeft: 'auto', ...line(C.muted, 22) }}>
            MuJoCo 기본 timestep <span style={mono(C.accent, 22)}>0.002 초</span> = 1초에 500 step
          </span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 76, ...line(C.muted, 22), opacity: prog(t, 6.2) }}>단단함 k = 100 N/m · 1 kg · 1 cm 눌렀다 놓음 · 용수철의 힘 = −k x (단위 m)</div>
        <div style={{ position: 'absolute', left: 30, top: 140, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, 6.4) }}>
          <span style={{ ...mono(C.green, 26), width: 160 }}>Δt = 0.1 초</span>
          <Tiles values={['0.01', '0', '−0.01', '−0.01', '0', '0.01']} color={C.green} at={6.8} w={120} />
        </div>
        <div style={{ position: 'absolute', left: 220, top: 240, ...line(C.green, 22), opacity: prog(t, 10.4) }}>−0.01 m 와 0.01 m 사이를 오간다</div>
        <div style={{ position: 'absolute', left: 30, top: 290, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, 12.2) }}>
          <span style={{ ...mono(C.red, 26), width: 160 }}>Δt = 0.3 초</span>
          <Tiles values={['0.01', '−0.08', '0.55', '−3.77', '25.84']} color={C.red} at={12.5} w={150} />
        </div>
        <div style={{ position: 'absolute', left: 220, top: 392, ...line(C.red, 22), opacity: prog(t, 15.4) }}>부호를 바꾸며 점점 멀리 튄다 → 물리 법칙이 아니라 계산 방식 때문 (단위 m)</div>
      </Card>
      <Box x={1264} y={140} w={592} h={470} at={18} gap={12} title={<Head size={24} color={C.accent}>발산하지 않는 조건</Head>}>
        <span style={mono(C.accent, 40)}>Δt &lt; 2√(m / k)</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 19) }}>k 100, m 1 → 2√(1 ÷ 100) = 0.2 초</span>
        <Table
          at={20.5}
          step={0.5}
          head={['k (N/m)', 'm (kg)', '경계 (초)']}
          widths={[220, 130, 170]}
          rows={[
            ['100', '1', '0.2'],
            ['10000', '1', '0.02'],
            ['1000000', '1', '0.002'],
            ['10000', '0.01', '0.002'],
          ]}
          colors={[C.green, undefined, undefined, C.orange]}
        />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 23) }}>접촉이 단단하고 부품이 가벼울수록 timestep 이 작아야 한다</span>
      </Box>
      <Box x={64} y={630} w={1792} h={250} at={24} gap={10} title={<Head size={24} color={C.green}>timestep 과 계산 시간 · SO-101 의 step 하나 약 3.2 µs</Head>}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
          <Table
            at={24.3}
            step={0.5}
            head={['timestep', 'simulation 1 초의 step 수', '계산 시간', '실제 시간 대비']}
            widths={[200, 380, 240, 300]}
            rows={[
              ['5 ms', '200', '0.64 ms', '약 1560 배'],
              ['2 ms', '500', '1.6 ms', '약 625 배'],
              ['0.5 ms', '2000', '6.4 ms', '약 156 배'],
            ]}
            colors={[C.green, undefined, C.orange]}
          />
          <span style={{ ...line(C.muted, 22), width: 540, opacity: prog(t, 26.5) }}>
            실시간으로 돌리려면 timestep 이 step 하나의 계산 시간보다 커야 하고, 학습은 발산하지 않는 범위에서 timestep 을 크게 잡는다
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- actuator and control ----------

function Control() {
  const t = useSec()
  const kx = (e: number) => 100 + e * 72000
  const ky = (tau: number) => 380 - (tau / 4) * 260
  const knee = 2.94 / 998.22
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={250} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ ...mono(C.orange, 24), width: 330 }}>{'<motor>'} 제어</span>
          <Flow steps={['바깥 controller: PD + gravity compensation', 'torque', '±2.94 N·m 로 자름', 'joint']} color={C.orange} at={0.6} gap={0.35} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 108, display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, 2.5) }}>
          <span style={{ ...mono(C.blue, 24), width: 330 }}>{'<position>'} 제어</span>
          <Flow steps={['목표 각도 (명령값)', 'engine 안의 PD: kp(명령값 − q) − kv q̇', '±2.94 N·m 로 자름', 'joint']} color={C.blue} at={2.7} gap={0.35} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 188, ...line(C.muted, 21), opacity: prog(t, 4.5) }}>
          SO-101 의 STS3215 servo 도 목표 각도를 받아 안에서 PID 로 motor 를 움직인다 · Menagerie 값 kp = 998.22 N·m/rad, kv = 2.731
        </div>
      </Card>
      <Card x={64} y={410} w={900} h={470} at={6.5}>
        <svg width={900} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            SO-101 position actuator · 오차와 torque
          </text>
          <line x1={100} y1={90} x2={100} y2={380} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={100} y1={380} x2={830} y2={380} stroke={C.cardEdge} strokeWidth={2} />
          <text x={90} y={ky(2.94) + 7} textAnchor="end" fill={C.red} fontSize={20} fontFamily={MONO}>
            2.94
          </text>
          <text x={90} y={387} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={100} y={110} fill={C.dim} fontSize={20} dx={10}>
            torque (N·m)
          </text>
          {[
            [0, '0'],
            [0.005, '0.005'],
            [0.01, '0.01 rad'],
          ].map(([e, s]) => (
            <text key={s} x={kx(e as number)} y={412} textAnchor={e === 0.01 ? 'end' : 'middle'} fill={C.dim} fontSize={20} fontFamily={MONO}>
              {s}
            </text>
          ))}
          <g opacity={prog(t, 7)}>
            <line x1={kx(knee)} y1={ky(2.94)} x2={kx(4 / 998.22)} y2={ky(4)} stroke={C.orange} strokeWidth={2.5} strokeDasharray="7 6" />
            <text x={400} y={118} fill={C.orange} fontSize={20}>
              계산값 998.22 × 오차
            </text>
            <line x1={kx(0)} y1={ky(0)} x2={kx(knee)} y2={ky(2.94)} stroke={C.accent} strokeWidth={4} />
            <line x1={kx(knee)} y1={ky(2.94)} x2={830} y2={ky(2.94)} stroke={C.red} strokeWidth={4} />
            <text x={600} y={ky(2.94) - 14} fill={C.red} fontSize={20}>
              한계 2.94 N·m 로 잘림
            </text>
          </g>
          <g opacity={prog(t, 13.8)}>
            <line x1={kx(knee)} y1={ky(2.94)} x2={kx(knee)} y2={380} stroke={C.text} strokeWidth={1.5} strokeDasharray="5 5" />
            <text x={kx(knee) + 12} y={300} fill={C.text} fontSize={20} fontFamily={MONO}>
              2.94 ÷ 998.22
            </text>
            <text x={kx(knee) + 12} y={328} fill={C.text} fontSize={20} fontFamily={MONO}>
              ≈ 0.00295 rad ≈ 0.17°
            </text>
          </g>
          <text x={30} y={452} fill={C.muted} fontSize={21} opacity={prog(t, 10)}>
            오차 0.1 rad: <tspan fontFamily={MONO}>998.22 × 0.1 = 99.8 N·m</tspan> → <tspan fontFamily={MONO} fill={C.red}>2.94 N·m</tspan> 로 잘린다
          </text>
        </svg>
      </Card>
      <Box x={984} y={410} w={872} h={470} at={13.5} gap={12} title={<Head size={24} color={C.green}>멈춘 팔의 처짐 · shoulder_lift bias force 0.573 N·m</Head>}>
        <span style={line(C.muted, 20)}>MuJoCo 3.13 · 모든 joint angle 0 · 처짐 = (gravity torque) ÷ P gain</span>
        <Table
          at={13.8}
          head={['제어', 'P gain', 'shoulder_lift 처짐']}
          widths={[330, 160, 320]}
          rows={[
            ['바깥에서 짠 PD', 'Kp = 10', '0.0573 rad ≈ 3.3°'],
            ['position actuator', 'kp = 998.22', '≈ 0.00057 rad ≈ 0.033°'],
            ['PD + gravity compensation', 'Kp = 10', '0'],
          ]}
          ats={[14.4, 16.5, 21]}
          colors={[C.red, undefined, C.green]}
        />
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 21.8) }}>
          τ = Kp(q<span style={{ fontSize: 18 }}>목표</span> − q) − Kd q̇ + c(q, q̇)
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 23.5) }}>더한 bias force 가 gravity 를 미리 상쇄해서 PD 는 목표와의 차이만 고친다 · shoulder_lift 는 gravity 에만 한계의 약 20% (0.573 ÷ 2.94 ≈ 0.19) 를 쓴다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- sim-to-real gap ----------

function Gap() {
  const t = useSec()
  const steps: [ReactNode, number][] = [
    [
      <>
        부품 질량 +20% → 필요한 torque <span style={mono(C.text, 23)}>0.573 × 1.2 = 0.688 N·m</span>
      </>,
      6.8,
    ],
    [
      <>
        gravity compensation 은 모델대로 <span style={mono(C.text, 23)}>0.573 N·m</span> 만 더한다
      </>,
      9.5,
    ],
    [
      <>
        남는 torque <span style={mono(C.orange, 23)}>0.688 − 0.573 = 0.115 N·m</span>
      </>,
      13.8,
    ],
    [
      <>
        Kp = 10 인 PD 의 처짐 <span style={mono(C.orange, 23)}>0.115 ÷ 10 = 0.0115 rad</span>
      </>,
      15.2,
    ],
    [
      <>
        집게 끝까지 약 0.35 m → <span style={mono(C.red, 23)}>0.35 × 0.0115 ≈ 0.004 m ≈ 4 mm</span>
      </>,
      16.8,
    ],
  ]
  const missing: [string, string][] = [
    ['명령 지연', '명령이 servo 에 반영되기까지 걸리는 시간'],
    ['backlash', '기어 틈만큼 link 가 흔들린다'],
    ['noise', '각도 측정값이 흔들린다'],
    ['motor torque', '온도와 전압에 따라 줄어든다'],
    ['카메라 영상', '장면마다 조명과 반사가 다르다'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={740} at={0.3} gap={14} title={<Head color={C.orange}>① 모델 숫자가 실물과 다르다</Head>}>
        <span style={line(C.muted, 22)}>질량 · 마찰 계수 · 모양처럼 모델 파일에 적은 숫자가 실물과 어긋난다</span>
        <div style={{ display: 'grid', gap: 8 }}>
          {steps.map(([s, at], i) => (
            <span key={i} style={{ ...line(C.text, 22), opacity: prog(t, at) }}>
              {s}
            </span>
          ))}
        </div>
        <svg width={824} height={190} style={{ opacity: prog(t, 17.4) }}>
          <text x={820} y={24} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도 (처짐을 크게 그림)
          </text>
          <circle cx={60} cy={90} r={12} fill={C.card} stroke={C.accent} strokeWidth={3} />
          <line x1={72} y1={90} x2={660} y2={90} stroke={C.muted} strokeWidth={4} strokeDasharray="10 8" />
          <line x1={72} y1={91} x2={660} y2={150} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
          <circle cx={660} cy={150} r={10} fill={C.red} />
          <line x1={700} y1={90} x2={700} y2={150} stroke={C.red} strokeWidth={2} />
          <line x1={692} y1={90} x2={708} y2={90} stroke={C.red} strokeWidth={2} />
          <line x1={692} y1={150} x2={708} y2={150} stroke={C.red} strokeWidth={2} />
          <text x={720} y={128} fill={C.red} fontSize={22} fontWeight={600}>
            약 4 mm
          </text>
          <text x={300} y={70} fill={C.muted} fontSize={20}>
            모델이 예상한 자세
          </text>
          <text x={300} y={160} fill={C.text} fontSize={20}>
            실제 자세
          </text>
          <text x={36} y={130} fill={C.accent} fontSize={20}>
            shoulder_lift
          </text>
        </svg>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18.5) }}>마찰 계수가 틀리면 큐브가 미끄러지고 (μ 1 대 0.6), convex hull 로 홈이 메워지면 다른 곳이 닿는다</span>
      </Box>
      <Box x={964} y={140} w={892} h={740} at={0.8} gap={14} title={<Head color={C.red}>② 실물의 현상이 모델에 아예 없다</Head>}>
        <span style={line(C.muted, 22)}>지연 · 기어 틈 · noise · 영상처럼 모델 파일에 적을 자리가 없는 현상</span>
        <div style={{ display: 'grid', gap: 8 }}>
          {missing.map(([a, b], i) => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', borderRadius: 12, border: `1.5px solid ${C.red}44`, background: `${C.red}0c`, opacity: prog(t, 20.8 + i * 0.4) }}>
              <span style={{ width: 170, fontSize: 22, fontWeight: 600, color: C.red, whiteSpace: 'nowrap' }}>{a}</span>
              <span style={{ fontSize: 21, whiteSpace: 'nowrap' }}>{b}</span>
            </div>
          ))}
        </div>
        <svg width={836} height={190} style={{ opacity: prog(t, 23.5) }}>
          <line x1={40} y1={110} x2={800} y2={110} stroke={C.cardEdge} strokeWidth={2} />
          <circle cx={160} cy={110} r={9} fill={C.orange} />
          <circle cx={560} cy={110} r={9} fill={C.red} />
          <text x={160} y={84} textAnchor="middle" fill={C.orange} fontSize={20}>
            명령을 보냄
          </text>
          <text x={560} y={84} textAnchor="middle" fill={C.red} fontSize={20}>
            motor 에 닿음
          </text>
          {arrow(176, 140, 544, 140, C.muted, 2, 10)}
          <text x={360} y={170} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
            20 ms
          </text>
          <text x={40} y={30} fill={C.text} fontSize={21}>
            1 rad/s 로 움직이는 중: <tspan fontFamily={MONO} fill={C.red}>1 × 0.02 = 0.02 rad ≈ 1.1°</tspan> 더 간다
          </text>
        </svg>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 25) }}>지연 없이 학습한 controller 는 이런 어긋남을 겪어 본 적이 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Randomize() {
  const t = useSec()
  const ranges: [string, number, number, string][] = [
    ['물체 크기', 0.95, 1.05, '0.95 ~ 1.05'],
    ['물체와 link 의 질량', 0.5, 1.5, '0.5 ~ 1.5'],
    ['면의 마찰 계수', 0.7, 1.3, '0.7 ~ 1.3'],
    ['joint damping (log)', 0.3, 3.0, '0.3 ~ 3.0'],
    ['actuator P gain (log)', 0.75, 1.5, '0.75 ~ 1.5'],
  ]
  const rx = (v: number) => 300 + v * 180
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={270} at={0.3} gap={14} title={<Head color={C.blue}>system identification · 실물을 재서 모델을 고친다</Head>}>
        <Flow steps={['무게 달기 · joint 흔들기', '마찰 · damping 측정', '모델 숫자 수정']} color={C.blue} at={0.8} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 3) }}>Shadow hand 연구도 joint damping · 마찰 손실 · actuator gain 등을 먼저 실제 손의 움직임에 맞췄다</span>
      </Box>
      <Box x={964} y={140} w={892} h={270} at={6} gap={14} title={<Head color={C.purple}>domain randomization · episode 마다 다시 뽑는다</Head>}>
        <Flow steps={['episode 시작', '숫자를 범위 안에서 뽑기', 'policy 학습']} color={C.purple} at={6.4} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 8.5) }}>범위 어디에서도 통하는 policy 를 배운다 · 모델에 없는 기어 틈 · 명령 지연 · noise 도 일부러 넣었다</span>
      </Box>
      <Box x={64} y={430} w={1060} h={450} at={12} gap={10} title={<Head color={C.accent}>OpenAI 2018 · 논문 Table 1 의 배율 범위 (보정값 × 배율)</Head>}>
        <svg width={1004} height={340}>
          <line x1={rx(1)} y1={24} x2={rx(1)} y2={290} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 6" />
          <text x={rx(1)} y={16} textAnchor="middle" fill={C.muted} fontSize={20}>
            보정값 × 1
          </text>
          {ranges.map(([name, a, b, s], i) => {
            const y = 54 + i * 52
            const p = prog(t, 12.4 + i * 0.6, 0.8)
            const hi = name === '물체와 link 의 질량' || name === '면의 마찰 계수'
            return (
              <g key={name} opacity={prog(t, 12.2 + i * 0.6, 0.3)}>
                <text x={0} y={y + 8} fill={hi ? C.text : C.muted} fontSize={21}>
                  {name}
                </text>
                <line x1={rx(0)} y1={y} x2={rx(3)} y2={y} stroke={C.grid} strokeWidth={3} />
                <rect x={rx(a)} y={y - 12} width={(rx(b) - rx(a)) * p} height={24} rx={6} fill={hi ? C.accent : C.blue} opacity={hi ? 1 : 0.7} />
                <text x={860} y={y + 8} fill={hi ? C.accent : C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  {s}
                </text>
              </g>
            )
          })}
          <line x1={rx(0)} y1={300} x2={rx(3)} y2={300} stroke={C.cardEdge} strokeWidth={2} />
          {[0, 1, 2, 3].map((v) => (
            <text key={v} x={rx(v)} y={330} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
        </svg>
      </Box>
      <Box x={1144} y={430} w={712} h={450} at={18} gap={14} title={<Head color={C.green}>같은 성능에 이르는 데 든 경험 (물체 돌리기)</Head>}>
        {[
          ['randomization 없음', 3, '약 3 년치', '실제 약 1.5 시간', C.muted, 18.4],
          ['randomization 모두 켬', 100, '약 100 년치', '실제 50 시간 정도', C.green, 20],
        ].map(([name, v, a, b, c, at]) => (
          <div key={name as string} style={{ display: 'grid', gap: 8, opacity: prog(t, at as number) }}>
            <span style={line(C.text, 22)}>{name}</span>
            <div style={{ width: 600, height: 30, borderRadius: 8, background: C.grid }}>
              <div style={{ width: `${(v as number) * prog(t, (at as number) + 0.2, 1)}%`, minWidth: 6, height: '100%', borderRadius: 8, background: c as string }} />
            </div>
            <span style={line(C.muted, 22)}>
              <span style={mono(c as string, 24)}>{a}</span> · {b}
            </span>
          </div>
        ))}
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.2) }}>범위가 실제 값을 포함해야 효과가 있고, 넓힐수록 학습에 드는 경험도 는다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'step 과 mass matrix', color: C.accent, text: 'step 마다 M(q) q̈ + c = τ + τ접촉 · 어깨에만 1 N·m → 팔꿈치 −8 rad/s²', at: 0.8 },
    { tag: 'MJCF · 접촉 · 마찰', color: C.blue, text: '1 kg 상자 침투 0.108 mm · 마찰 힘 ≤ μ × normal force · μ 0.6 이면 미끄러짐', at: 4.4 },
    { tag: 'timestep 과 제어', color: C.orange, text: 'Δt < 2√(m / k) · 0.17° 넘으면 2.94 N·m 로 잘림 · 처짐은 gravity compensation 으로 0', at: 8.4 },
    { tag: 'sim-to-real gap', color: C.red, text: '질량 +20% → 약 4 mm 처짐 · system identification 과 domain randomization', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            컴퓨터는 매 순간 무엇을 계산하길래 실제로는 일어나지 않는 일이 생길까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600 }}>{it.text}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Outro() {
  const next: [string, string][] = [
    ['Classical Pick & Place', '카메라로 물체를 찾아 IK · 경로 · 실행으로 집는 파이프라인'],
    ['Teleop Dataset', '사람이 조종한 시연을 학습 데이터로 모으기'],
    ['Force & Impedance Control', '손끝의 힘과 단단함을 정하는 제어'],
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 28, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 28 }}>
          {next.map(([a, b], i) => (
            <Appear key={a} at={0.5 + i * 0.4}>
              <div style={{ width: 540, height: 170, padding: '24px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', alignContent: 'start', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600 }}>{a}</span>
                <span style={line(C.muted, 22)}>{b}</span>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/mujoco-sim (MuJoCo · MuJoCo Menagerie · Learning Dexterous In-Hand Manipulation)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseElbow = () => (
  <PauseWrite
    question="팔을 편 채 멈춘 상태에서 이번에는 팔꿈치에만 torque 1 N·m 를 준다 (τ₁ = 0, τ₂ = 1, gravity 없음). 두 joint 의 각가속도는?"
    answer={
      <>
        1.25 α₁ + 0.5 α₂ = 0 → α₁ = −0.4 α₂
        <br />
        0.5 × (−0.4 α₂) + 0.25 α₂ = 0.05 α₂ = 1 → α₂ = 20 · α₁ = −8 rad/s²
      </>
    }
  />
)

const PauseGrip = () => (
  <PauseWrite
    question="μ = 0.5 인 손가락 두 개로 0.2 kg 물체를 집으려면, 손가락마다 최소 몇 N 으로 눌러야 할까?"
    answer={
      <>
        무게 = 0.2 × 9.81 = 1.962 N
        <br />
        2 × 0.5 × (누르는 힘) ≥ 1.962 이고 2 × 0.5 = 1 → 손가락마다 1.962 N 이상
      </>
    }
  />
)

const PauseSpring = () => (
  <PauseWrite
    question="k = 400 N/m, m = 1 kg 인 용수철을 semi-implicit Euler 로 계산한다. 발산하지 않는 Δt 의 경계는? Δt = 0.12 초로 계산하면?"
    answer={
      <>
        경계 = 2√(1 ÷ 400) = 2 × 0.05 = 0.1 초
        <br />
        0.12 초: k Δt² ÷ m = 400 × 0.0144 = 5.76 &gt; 4 → 발산
      </>
    }
  />
)

const PauseRange = () => (
  <PauseWrite
    question="마찰 계수를 보정값의 0.7 ~ 1.3 배에서 뽑으며 집기를 학습했다. 보정값이 1 인데 실제 큐브의 마찰 계수가 0.5 라면 무엇이 문제인가?"
    answer={
      <>
        학습 범위 1 × 0.7 = 0.7 ~ 1 × 1.3 = 1.3 → 0.5 는 범위 밖
        <br />
        겪어 본 적 없는 미끄러운 큐브 → 실제 마찰을 재서 고치거나 (system identification) 범위를 넓힌다
      </>
    }
  />
)

export function MujocoSim() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        step: Step,
        mass: Mass,
        'pause-elbow': PauseElbow,
        mjcf: Mjcf,
        contact: Contact,
        'pause-grip': PauseGrip,
        timestep: Timestep,
        control: Control,
        'pause-spring': PauseSpring,
        gap: Gap,
        randomize: Randomize,
        'pause-range': PauseRange,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
