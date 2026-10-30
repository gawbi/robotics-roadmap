import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './ros2-control.narration.json'
import { script } from './ros2-control.script'

// Numbers follow lessons/ros2-control/README.md and its figures (see ros2-control.script.ts). The error curves in the
// tolerance plot are schematic (marked 모식도) apart from the crossings the lesson gives (2.6 s, 4.2 s); the interpolation
// curves are the cubic through the lesson's three points, and the gz response is the lesson's 10%-per-cycle rule.

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

/** a vertical arrow drawn on its own little SVG, for the gaps between stacked boxes */
function VArrow({ x, y1, y2, at, color = C.muted }: { x: number; y1: number; y2: number; at: number; color?: string }) {
  const t = useSec()
  const top = Math.min(y1, y2)
  return (
    <svg width={24} height={Math.abs(y2 - y1)} style={{ position: 'absolute', left: x - 12, top, opacity: prog(t, at) }}>
      {arrow(12, y1 - top, 12, y2 - top, color, 3, 12)}
    </svg>
  )
}

/** one table row: a fixed-width first cell, then the rest */
function Row({ at, k, kw, kColor = C.accent, kMono = true, kSize = 22, children, size = 22, color = C.text }: { at: number; k: ReactNode; kw: number; kColor?: string; kMono?: boolean; kSize?: number; children: ReactNode; size?: number; color?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
      <span style={{ width: kw, flex: 'none', fontFamily: kMono ? MONO : undefined, fontSize: kSize, fontWeight: 600, color: kColor, whiteSpace: 'nowrap' }}>{k}</span>
      <span style={{ ...line(color, size), flex: 1 }}>{children}</span>
    </div>
  )
}

/** path through points */
const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

/** a path drawn from start to end as `p` goes 0 → 1 */
function Drawn({ d, color, p, width = 4, dash }: { d: string; color: string; p: number; width?: number; dash?: string }) {
  if (dash) return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={p} />
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            KINEMATICS · ROS2_CONTROL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ros2_control</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            trajectory → <span style={{ color: C.accent }}>1초에 수백 번의 motor 명령</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            점 사이의 명령을 채우고 오차를 검사해 알리는 ROS 2 제어 framework
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

/** 41 points over 4 s against 2000 commands over the same 4 s */
function Question() {
  const t = useSec()
  const X = (s: number) => 120 + s * 395
  const pts = Array.from({ length: 41 }, (_, i) => i * 0.1)
  let ticks = ''
  for (let i = 0; i < 2000; i++) ticks += `M${X(i * 0.002).toFixed(2)} 222 V262 `
  const sweep = prog(t, 2.2, 1.6)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={340} at={0.3}>
        <svg width={1792} height={340}>
          <text x={40} y={60} fill={C.blue} fontSize={26} fontWeight={600}>
            MoveIt 2 의 점 · 0.1 초 간격 41 개
          </text>
          {pts.map((s, i) => (
            <circle key={i} cx={X(s)} cy={112} r={7} fill={C.blue} opacity={prog(t, 0.6 + i * 0.035, 0.3)} />
          ))}
          <g opacity={prog(t, 2)}>
            <text x={40} y={196} fill={C.orange} fontSize={26} fontWeight={600}>
              driver 의 명령 · 2 ms 마다 2000 번
            </text>
          </g>
          <clipPath id="rc-q-sweep">
            <rect x={0} y={200} width={X(0) + sweep * 1580} height={80} />
          </clipPath>
          <path d={ticks} stroke={C.orange} strokeWidth={0.6} clipPath="url(#rc-q-sweep)" />
          <line x1={X(0)} x2={X(4)} y1={284} y2={284} stroke={C.dim} strokeWidth={2} />
          {[0, 1, 2, 3, 4].map((s) => (
            <text key={s} x={X(s)} y={318} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              {s} s
            </text>
          ))}
        </svg>
      </Card>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 520, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          점과 점 사이의 명령은 누가 채우고,
          <br />
          <span style={{ color: C.accent }}>못 따라가면 누가 알아채 알려 줄까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 64, top: 730, width: 1792, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <Chip at={5.4} color={C.blue} mono>
          4 ÷ 0.1 + 1 = 41 개
        </Chip>
        <Chip at={5.8} color={C.orange} mono>
          4 × 500 = 2000 번
        </Chip>
        <Chip at={6.2} color={C.muted}>
          UR5e driver · 500 Hz
        </Chip>
      </div>
    </AbsoluteFill>
  )
}

// ---------- controller_manager ----------

function Node({ x, y, w, h, at, color, title, sub, titleMono = false }: { x: number; y: number; w: number; h: number; at: number; color: string; title: ReactNode; sub: ReactNode; titleMono?: boolean }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '14px 24px', borderRadius: 18, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'center', gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 600, color, fontFamily: titleMono ? MONO : undefined, whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ fontSize: 22, color: C.muted, lineHeight: 1.4 }}>{sub}</span>
      </div>
    </Appear>
  )
}

function Stack() {
  const t = useSec()
  const AX = (s: number) => 60 + s * 6760 // 0 ~ 0.1 s over 676 px
  return (
    <AbsoluteFill>
      <Node x={64} y={140} w={960} h={112} at={0.5} color={C.blue} title="MoveIt 2" sub="4 초 trajectory · 0.1 초 간격 점 41 개 → FollowJointTrajectory action" />
      <VArrow x={544} y1={256} y2={298} at={2.3} />
      <Appear at={2.5} style={{ position: 'absolute', left: 64, top: 302, width: 960 }}>
        <div style={{ height: 210, padding: '18px 24px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.accent}`, display: 'grid', alignContent: 'start', gap: 14 }}>
          <span style={{ fontSize: 24, fontWeight: 600, color: C.accent, whiteSpace: 'nowrap' }}>controller_manager · 500 Hz · 2 ms 마다 read → update → write</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 520, height: 96, padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${C.green}88`, background: `${C.green}10`, display: 'grid', alignContent: 'center', gap: 4 }}>
              <span style={mono(C.green, 22)}>joint_trajectory_controller</span>
              <span style={line(C.text, 22)}>
                점 사이 0.1 초를 50 번 보간 <span style={{ color: C.orange, opacity: prog(t, 7) }}>· 오차 검사</span>
              </span>
            </div>
            <div style={{ width: 368, height: 96, padding: '12px 18px', borderRadius: 14, border: `1.5px solid ${C.cardEdge}`, display: 'grid', alignContent: 'center', gap: 4, opacity: prog(t, 21.5) }}>
              <span style={mono(C.muted, 22)}>joint_state_broadcaster</span>
              <span style={line(C.muted, 22)}>관절 상태를 /joint_states 로</span>
            </div>
          </div>
        </div>
      </Appear>
      <VArrow x={394} y1={516} y2={558} at={14} color={C.orange} />
      <VArrow x={694} y1={558} y2={516} at={14} color={C.green} />
      <Node x={64} y={562} w={960} h={112} at={14} color={C.orange} title="hardware interface · SystemInterface plugin" sub="write: 위치 명령을 보냄 · read: 관절 각도와 속도를 받음" />
      <VArrow x={394} y1={678} y2={720} at={14.4} color={C.orange} />
      <VArrow x={694} y1={720} y2={678} at={14.4} color={C.green} />
      <Node x={64} y={724} w={960} h={112} at={14.4} color={C.muted} title="로봇 controller · motor · encoder" sub="Ethernet, CAN, USB serial 등 로봇마다 다른 통신" />

      <Card x={1060} y={140} w={796} h={380} at={0.8}>
        <svg width={796} height={380}>
          <text x={32} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            점 사이 0.1 초 = 2 ms × 50 주기
          </text>
          <line x1={AX(0)} x2={AX(0.1)} y1={150} y2={150} stroke={C.dim} strokeWidth={2} />
          {Array.from({ length: 49 }, (_, i) => (
            <line key={i} x1={AX((i + 1) * 0.002)} x2={AX((i + 1) * 0.002)} y1={134} y2={166} stroke={C.orange} strokeWidth={3} opacity={prog(t, 1.2 + i * 0.05, 0.2)} />
          ))}
          <circle cx={AX(0)} cy={150} r={11} fill={C.text} />
          <circle cx={AX(0.1)} cy={150} r={11} fill={C.text} />
          <text x={AX(0) - 12} y={205} fill={C.muted} fontSize={22}>
            앞 점
          </text>
          <text x={AX(0.1) + 12} y={205} textAnchor="end" fill={C.muted} fontSize={22}>
            다음 점
          </text>
          <text x={398} y={262} textAnchor="middle" fill={C.orange} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={prog(t, 3.8)}>
            0.1 ÷ 0.002 = 50
          </text>
          <text x={398} y={330} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} opacity={prog(t, 4.8)}>
            4 초 × 500 Hz = 2000 번 명령
          </text>
        </svg>
      </Card>
      <Box x={1060} y={550} w={796} h={330} at={14.2} title={<Head color={C.accent}>나눠 맡기</Head>}>
        <Row at={14.4} k="controller" kw={300} kColor={C.green} kSize={24} size={24}>
          보간 · 오차 검사
        </Row>
        <Row at={15.6} k="hardware interface" kw={300} kColor={C.orange} kSize={24} size={24}>
          로봇마다 다른 통신
        </Row>
        <Row at={21.3} k="controller_manager" kw={300} kColor={C.accent} kSize={24} size={24}>
          정해 둔 주기로 차례로 부름
        </Row>
        <Row at={23} k="같은 controller" kw={300} kColor={C.text} kMono={false} kSize={24} size={24}>
          UR5e · Franka FR3 · Gazebo 속 팔
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Loop() {
  const t = useSec()
  const boxes: [number, number, string, string][] = [
    [24, 140, 'read', C.green],
    [208, 150, 'update', C.accent],
    [402, 140, 'write', C.orange],
    [586, 260, '다음 주기까지 잠듦', C.muted],
  ]
  // 500 Hz ticks over 0 ~ 20 ms
  const RX = (ms: number) => 60 + ms * 38
  // overrun over 0 ~ 10 ms
  const OX = (ms: number) => 60 + ms * 76
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={350} at={0.3}>
        <svg width={880} height={350}>
          <text x={28} y={48} fill={C.text} fontSize={28} fontWeight={600}>
            controller_manager 의 loop
          </text>
          {boxes.map(([x, w, label, color], i) => (
            <g key={label} opacity={prog(t, 0.6 + i * 0.5)}>
              <rect x={x} y={82} width={w} height={70} rx={14} fill={`${color}14`} stroke={color} strokeWidth={2} />
              <text x={x + w / 2} y={126} textAnchor="middle" fill={color} fontSize={i === 3 ? 22 : 26} fontFamily={i === 3 ? undefined : MONO} fontWeight={600}>
                {label}
              </text>
              {i < 3 && arrow(x + w + 4, 117, boxes[i + 1][0] - 4, 117, C.muted, 3, 11)}
            </g>
          ))}
          <g opacity={prog(t, 2.6)}>
            <path d="M716 152 V198 H94 V164" fill="none" stroke={C.muted} strokeWidth={3} />
            {arrow(94, 180, 94, 154, C.muted, 3, 11)}
            <text x={405} y={240} textAnchor="middle" fill={C.muted} fontSize={22}>
              update_rate 마다 반복 · 기본 100 Hz
            </text>
          </g>
          <text x={28} y={300} fill={C.dim} fontSize={22} opacity={prog(t, 3.4)}>
            loop 는 executor 와 다른 thread 에서 실행된다
          </text>
        </svg>
      </Card>
      <Box x={64} y={520} w={880} h={360} at={6.5} title={<Head color={C.purple}>controller 의 lifecycle</Head>}>
        <Flow steps={['unconfigured', 'inactive', 'active']} color={C.purple} at={6.8} gap={0.6} />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 9) }}>spawner 가 대신 바꾸고, update 는 active 인 controller 만 계산</span>
        <span style={{ ...line(C.accent, 24), opacity: prog(t, 12.8) }}>switch_controller service 로 켜고 끔</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 14.3) }}>trajectory 제어 ↔ force 제어 · process 재시작 없음</span>
      </Box>
      <Card x={976} y={140} w={880} h={400} at={18.5}>
        <svg width={880} height={400}>
          <text x={28} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            controller 마다 update_rate · controller_manager 500 Hz
          </text>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={RX(i * 2)} x2={RX(i * 2)} y1={100} y2={132} stroke={C.muted} strokeWidth={3} />
          ))}
          {[0, 10, 20].map((ms) => (
            <text key={ms} x={RX(ms)} y={160} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {ms} ms
            </text>
          ))}
          <g opacity={prog(t, 19.6)}>
            <text x={60} y={212} fill={C.green} fontSize={24} fontWeight={600}>
              100 Hz → 500 ÷ 100 = 5 주기마다 한 번
            </text>
            {[0, 10, 20].map((ms) => (
              <line key={ms} x1={RX(ms)} x2={RX(ms)} y1={228} y2={266} stroke={C.green} strokeWidth={5} />
            ))}
          </g>
          <g opacity={prog(t, 21.2)}>
            <text x={60} y={312} fill={C.red} fontSize={24} fontWeight={600}>
              200 Hz → 500 ÷ 200 = 2.5 → 경고
            </text>
            {[0, 5, 10, 15, 20].map((ms) => (
              <line key={ms} x1={RX(ms)} x2={RX(ms)} y1={328} y2={366} stroke={ms % 10 === 5 ? C.red : C.muted} strokeWidth={ms % 10 === 5 ? 4 : 3} strokeDasharray={ms % 10 === 5 ? '6 5' : undefined} />
            ))}
          </g>
        </svg>
      </Card>
      <Card x={976} y={570} w={880} h={310} at={24.5}>
        <svg width={880} height={310}>
          <text x={28} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            overrun · 500 Hz loop 의 한 주기가 5 ms
          </text>
          <rect x={OX(0)} y={84} width={OX(5) - OX(0)} height={44} rx={8} fill={`${C.orange}55`} stroke={C.orange} strokeWidth={2} />
          <text x={(OX(0) + OX(5)) / 2} y={114} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
            한 주기 계산 5 ms
          </text>
          {[0, 2, 4, 6, 8, 10].map((ms) => {
            const c = ms === 2 || ms === 4 ? C.red : ms === 6 ? C.green : C.muted
            return (
              <g key={ms}>
                <line x1={OX(ms)} x2={OX(ms)} y1={148} y2={180} stroke={c} strokeWidth={3} strokeDasharray={ms === 2 || ms === 4 ? '5 4' : undefined} />
                <text x={OX(ms)} y={206} textAnchor="middle" fill={c} fontSize={20} fontFamily={MONO}>
                  {ms} ms
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 25.6)}>
            <text x={OX(2)} y={238} textAnchor="middle" fill={C.red} fontSize={22}>
              건너뜀
            </text>
            <text x={OX(4)} y={238} textAnchor="middle" fill={C.red} fontSize={22}>
              건너뜀
            </text>
            <text x={OX(6)} y={238} textAnchor="middle" fill={C.green} fontSize={22}>
              다음 주기
            </text>
          </g>
          <text x={28} y={284} fill={C.muted} fontSize={22} opacity={prog(t, 26.6)}>
            overruns.manage: true (기본) → "Overrun detected!" 경고
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- interface 와 URDF ----------

function Interfaces() {
  const t = useSec()
  const cmd: [string, number][] = [
    ['joint1/position', 100],
    ['joint2/position', 150],
  ]
  const st: [string, number][] = [
    ['joint1/position', 262],
    ['joint1/velocity', 306],
    ['joint2/position', 350],
    ['joint2/velocity', 394],
  ]
  const ctrl: [string, string, number, string, number][] = [
    ['joint_trajectory_controller', 'active · command 를 claim', 80, C.green, 0.3],
    ['forward_command_controller', '활성화 거부 (claim 충돌)', 196, C.red, 18.5],
    ['joint_state_broadcaster', '모든 state 를 읽음', 364, C.blue, 12.8],
  ]
  const IX = 480
  const IW = 280
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={490} at={0.3}>
        <svg width={1100} height={490}>
          <text x={28} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            command interface 와 state interface
          </text>
          {ctrl.map(([name, sub, y, color, at]) => (
            <g key={name} opacity={prog(t, at)}>
              <rect x={24} y={y} width={380} height={84} rx={14} fill={`${color}12`} stroke={color} strokeWidth={2} />
              <text x={44} y={y + 34} fill={color} fontSize={20} fontFamily={MONO} fontWeight={600}>
                {name}
              </text>
              <text x={44} y={y + 66} fill={C.text} fontSize={20}>
                {sub}
              </text>
            </g>
          ))}
          <text x={IX} y={88} fill={C.orange} fontSize={22} fontWeight={600}>
            command (쓰기)
          </text>
          {cmd.map(([n, y]) => (
            <g key={`c${y}`}>
              <rect x={IX} y={y} width={IW} height={40} rx={10} fill={C.bg} stroke={C.orange} strokeWidth={2} />
              <text x={IX + IW / 2} y={y + 27} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                {n}
              </text>
            </g>
          ))}
          <text x={IX} y={250} fill={C.green} fontSize={22} fontWeight={600}>
            state (읽기)
          </text>
          {st.map(([n, y]) => (
            <g key={`s${y}`}>
              <rect x={IX} y={y} width={IW} height={36} rx={10} fill={C.bg} stroke={C.green} strokeWidth={2} />
              <text x={IX + IW / 2} y={y + 25} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                {n}
              </text>
            </g>
          ))}
          <rect x={850} y={80} width={226} height={368} rx={16} fill={`${C.muted}10`} stroke={C.muted} strokeWidth={2} />
          <text x={963} y={136} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
            hardware
          </text>
          <text x={963} y={166} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
            interface
          </text>
          <g opacity={prog(t, 12.5)}>
            <text x={963} y={228} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              write
            </text>
            <text x={963} y={258} textAnchor="middle" fill={C.text} fontSize={20}>
              command → 로봇
            </text>
            <text x={963} y={330} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              read
            </text>
            <text x={963} y={360} textAnchor="middle" fill={C.text} fontSize={20}>
              로봇 → state
            </text>
            {cmd.map(([, y]) => arrow(IX + IW + 6, y + 20, 844, y + 20, C.orange, 3, 11))}
            {st.map(([, y]) => arrow(844, y + 18, IX + IW + 6, y + 18, C.green, 3, 11))}
            {cmd.map(([, y]) => arrow(408, 122, IX - 6, y + 20, C.green, 3, 11))}
          </g>
          <g opacity={prog(t, 12.8)}>{st.map(([, y], i) => arrow(IX - 6, y + 18, 410, 382 + i * 16, C.blue, 2.5, 10))}</g>
          <g opacity={prog(t, 18.8)}>
            <line x1={408} y1={238} x2={IX - 8} y2={184} stroke={C.red} strokeWidth={3} strokeDasharray="7 6" />
          </g>
        </svg>
      </Card>
      <Box x={1196} y={140} w={660} h={490} at={6.5} title={<Head color={C.accent}>interface 의 이름</Head>}>
        <span style={mono(C.accent, 28)}>{'<관절 이름>/<종류>'}</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 7.2) }}>joint2/position</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 8.2) }}>종류: position · velocity · acceleration · effort</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.4) }}>effort 는 회전 관절에서 torque (N·m), 직선 관절에서 힘 (N)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.4) }}>UR5e → position</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.9) }}>Franka FR3 의 torque 제어 → effort</span>
      </Box>
      <Box x={64} y={650} w={1792} h={230} at={24.5} title={<Head color={C.orange}>motor 쪽 값 ↔ 관절 쪽 값 · 예: 감속비 50</Head>}>
        <Flow steps={['motor encoder 12.5 바퀴', '12.5 ÷ 50 = 0.25 바퀴', '2π × 0.25 ≈ 1.571 rad', 'state interface 에 넣음']} color={C.orange} at={24.8} gap={0.6} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.2) }}>write 는 반대로 관절 명령에 감속비를 곱해 motor 명령으로 바꾼다 · transmission_interface</span>
      </Box>
    </AbsoluteFill>
  )
}

function Urdf() {
  const t = useSec()
  const xml: [string, 'type' | 'plugin' | 'joint' | null][] = [
    ['<ros2_control name="Arm" type="system">', 'type'],
    ['  <hardware>', null],
    ['    <plugin> ? </plugin>', 'plugin'],
    ['    <param name="robot_ip">…</param>', null],
    ['  </hardware>', null],
    ['  <joint name="joint1">', 'joint'],
    ['    <command_interface name="position">', 'joint'],
    ['      <param name="min">-3.14</param>', 'joint'],
    ['      <param name="max">3.14</param>', 'joint'],
    ['    </command_interface>', 'joint'],
    ['    <state_interface name="position"/>', 'joint'],
    ['    <state_interface name="velocity"/>', 'joint'],
    ['  </joint>', 'joint'],
    ['</ros2_control>', null],
  ]
  const plugins: [string, string][] = [
    ['실제 UR 팔', 'ur_robot_driver/URPositionHardwareInterface'],
    ['mock', 'mock_components/GenericSystem'],
    ['Gazebo', 'gz_ros2_control/GazeboSimSystem'],
    ['MuJoCo', 'mujoco_ros2_control/MujocoSystemInterface'],
  ]
  const lit = (k: 'type' | 'plugin' | 'joint' | null) => {
    if (k === 'type') return prog(t, 7) * (1 - prog(t, 13.3, 0.4))
    if (k === 'plugin') return prog(t, 13.5)
    if (k === 'joint') return prog(t, 1.5) * (1 - prog(t, 6.8, 0.4))
    return 0
  }
  const litColor = (k: 'type' | 'plugin' | 'joint' | null) => (k === 'type' ? C.purple : k === 'plugin' ? C.accent : C.green)
  const which = Math.floor(Math.max(0, t - 14.2) / 1.1) % 4
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={440} at={0.3}>
        <div style={{ padding: '18px 24px', display: 'grid' }}>
          {xml.map(([s, k], i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 20, lineHeight: '28.5px', whiteSpace: 'pre', color: C.text, borderRadius: 6, background: k ? `${litColor(k)}${Math.round(lit(k) * 40).toString(16).padStart(2, '0')}` : undefined }}>
              {s}
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={605} w={900} h={275} at={20.5} gap={12} title={<Head color={C.orange}>hardware interface 의 함수</Head>}>
        <Row at={20.8} k="on_configure" kw={200}>
          로봇과 통신을 연다 · state 는 읽을 수 있음
        </Row>
        <Row at={21.6} k="on_activate" kw={200}>
          brake 를 풀고 명령을 받을 준비
        </Row>
        <Row at={22.6} k="read" kw={200} kColor={C.green}>
          매 주기 처음 · 로봇 상태를 state interface 에
        </Row>
        <Row at={23.4} k="write" kw={200} kColor={C.orange}>
          매 주기 끝 · command 값을 로봇에 · 주기 안에
        </Row>
      </Box>
      <Box x={996} y={140} w={860} h={300} at={7} title={<Head color={C.purple}>type</Head>}>
        {(
          [
            ['system', '통신 채널 하나로 관절 여러 개', '읽기·쓰기', 7.4],
            ['actuator', '관절 하나를 맡는 motor·valve', '읽기·쓰기', 8.6],
            ['sensor', 'encoder 처럼 읽기만 하는 장치', '읽기만', 9.8],
          ] as [string, string, string, number][]
        ).map(([k, d, rw, at]) => (
          <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ ...mono(C.purple, 24), width: 150 }}>{k}</span>
            <span style={{ ...line(C.text, 24), flex: 1 }}>{d}</span>
            <span style={{ ...line(C.muted, 24), width: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>{rw}</span>
          </div>
        ))}
      </Box>
      <Box x={996} y={470} w={860} h={410} at={13.5} title={<Head color={C.accent}>{'<plugin> 한 줄로 바꾸기'}</Head>}>
        {plugins.map(([k, p], i) => (
          <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 13.8 + i * 0.4) }}>
            <span style={{ ...line(i === which ? C.accent : C.muted, 22), width: 130, flex: 'none', fontWeight: 600 }}>{k}</span>
            <span style={{ ...mono(i === which ? C.accent : C.text, 20), fontWeight: i === which ? 600 : 400 }}>{p}</span>
          </div>
        ))}
        <span style={{ ...line(C.green, 24), opacity: prog(t, 17.5) }}>controller 설정과 MoveIt 2 설정은 그대로</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- JTC ----------

/** cubic Hermite on a 1 s segment: position and velocity */
const herm = (p0: number, p1: number, v0: number, v1: number, s: number) => (2 * s ** 3 - 3 * s * s + 1) * p0 + (s ** 3 - 2 * s * s + s) * v0 + (-2 * s ** 3 + 3 * s * s) * p1 + (s ** 3 - s * s) * v1
const hermV = (p0: number, p1: number, v0: number, v1: number, s: number) => (6 * s * s - 6 * s) * p0 + (3 * s * s - 4 * s + 1) * v0 + (-6 * s * s + 6 * s) * p1 + (3 * s * s - 2 * s) * v1

function Interp() {
  const t = useSec()
  const PX = (s: number) => 100 + s * 455
  const PY = (p: number) => 330 - p * (220 / 0.6)
  const VY = (v: number) => 640 - v * 275
  const P = [0, 0.5, 0.6]
  const V = [0, 0.3, 0]
  const cubicP: [number, number][] = []
  const cubicV: [number, number][] = []
  for (let k = 0; k < 2; k++)
    for (let i = 0; i <= 60; i++) {
      const s = i / 60
      cubicP.push([PX(k + s), PY(herm(P[k], P[k + 1], V[k], V[k + 1], s))])
      cubicV.push([PX(k + s), VY(hermV(P[k], P[k + 1], V[k], V[k + 1], s))])
    }
  const linP = pathOf([0, 1, 2].map((s) => [PX(s), PY(P[s])]))
  const linV = pathOf([
    [PX(0), VY(0.5)],
    [PX(1), VY(0.5)],
    [PX(1), VY(0.1)],
    [PX(2), VY(0.1)],
  ])
  const pl = prog(t, 12.8, 1.6)
  const pc = prog(t, 20.6, 1.6)
  const rows: [string, string, string, string, number][] = [
    ['위치만', 'linear', '위치', C.red, 7],
    ['위치, 속도', 'cubic', '위치 · 속도', C.green, 8.4],
    ['위치, 속도, 가속도', 'quintic', '위치 · 속도 · 가속도', C.accent, 9.8],
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 125, display: 'flex', gap: 16 }}>
        <Chip at={0.3} mono>
          JTC = joint_trajectory_controller
        </Chip>
        <Chip at={1.6} color={C.blue}>
          follow_joint_trajectory action 으로 받음
        </Chip>
        <Chip at={3} color={C.green}>
          매 주기 그 시각의 목표를 씀
        </Chip>
      </div>
      <Box x={64} y={195} w={700} h={330} at={6.5} title={<Head color={C.accent}>점 사이 보간 · 기본값 splines</Head>}>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          {['점에 적힌 값', '곡선', '이어지는 것'].map((h, i) => (
            <span key={h} style={{ width: [250, 150, 240][i], fontSize: 22, color: C.muted }}>
              {h}
            </span>
          ))}
        </div>
        {rows.map(([a, b, c, color, at]) => (
          <div key={b} style={{ display: 'flex', opacity: prog(t, at), alignItems: 'baseline' }}>
            <span style={{ width: 250, fontSize: 24 }}>{a}</span>
            <span style={{ ...mono(color, 24), width: 150 }}>{b}</span>
            <span style={{ width: 240, fontSize: 24, color: C.muted }}>{c}</span>
          </div>
        ))}
      </Box>
      <Box x={64} y={548} w={700} h={332} at={18.5} title={<Head color={C.orange}>가속도</Head>}>
        <span style={mono(C.red, 24)}>(0.1 − 0.5) ÷ 0.002 = −200 rad/s²</span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 19.6) }}>motor 가 못 내는 가속도 → 충격이나 큰 오차</span>
        <span style={{ ...line(C.green, 22), opacity: prog(t, 21.6) }}>cubic: 속도는 0.3 rad/s 로 이어지고 가속도는 −1.8 → −0.6</span>
        <span style={{ ...line(C.accent, 24), opacity: prog(t, 24.8) }}>MoveIt 2 의 점 = 속도 · 가속도 포함 → quintic</span>
      </Box>
      <Card x={796} y={195} w={1060} h={685} at={12.5}>
        <svg width={1060} height={685}>
          <line x1={40} x2={70} y1={38} y2={38} stroke={C.red} strokeWidth={4} />
          <text x={82} y={46} fill={C.red} fontSize={22}>
            위치만 준 점: linear
          </text>
          <g opacity={prog(t, 18.5)}>
            <line x1={420} x2={450} y1={38} y2={38} stroke={C.green} strokeWidth={4} />
            <text x={462} y={46} fill={C.green} fontSize={22}>
              위치 + 속도를 준 점: cubic
            </text>
          </g>
          <text x={40} y={84} fill={C.muted} fontSize={22}>
            위치 (rad)
          </text>
          {[0, 0.2, 0.4, 0.6].map((v) => (
            <g key={`p${v}`}>
              <line x1={100} x2={1010} y1={PY(v)} y2={PY(v)} stroke={C.grid} strokeWidth={1.5} />
              <text x={88} y={PY(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            </g>
          ))}
          <text x={40} y={394} fill={C.muted} fontSize={22}>
            속도 (rad/s)
          </text>
          {[0, 0.2, 0.4, 0.6, 0.8].map((v) => (
            <g key={`v${v}`}>
              <line x1={100} x2={1010} y1={VY(v)} y2={VY(v)} stroke={C.grid} strokeWidth={1.5} />
              <text x={88} y={VY(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            </g>
          ))}
          {[0, 1, 2].map((s) => (
            <g key={`x${s}`}>
              <line x1={PX(s)} x2={PX(s)} y1={PY(0.6)} y2={PY(0)} stroke={C.grid} strokeWidth={1.5} />
              <line x1={PX(s)} x2={PX(s)} y1={VY(0.8)} y2={VY(0)} stroke={C.grid} strokeWidth={1.5} />
              <text x={PX(s)} y={670} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {s} s
              </text>
            </g>
          ))}
          <Drawn d={linP} color={C.red} p={pl} />
          <Drawn d={linV} color={C.red} p={pl} />
          <Drawn d={pathOf(cubicP)} color={C.green} p={pc} />
          <Drawn d={pathOf(cubicV)} color={C.green} p={pc} />
          {[0, 1, 2].map((s) => (
            <circle key={s} cx={PX(s)} cy={PY(P[s])} r={8} fill={C.text} />
          ))}
          <text x={PX(1.08)} y={VY(0.62)} fill={C.red} fontSize={22} opacity={prog(t, 14.4)}>
            0.5 → 0.1 이 한 주기에
          </text>
          <text x={PX(1.08)} y={VY(0.42)} fill={C.green} fontSize={22} opacity={prog(t, 22)}>
            1 초에 0.3 으로 이어짐
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Tolerance() {
  const t = useSec()
  const TX = (s: number) => 100 + s * 180
  const TY = (e: number) => 390 - e * 5000
  const g = (s: number) => (s <= 4 ? 0.01 + 0.016 * Math.sin((Math.PI * s) / 8) : 0.026 * Math.exp(-(s - 4) / 0.762))
  const r = (s: number) => 0.01 + 0.04 * (s / 2.6) ** 2
  const green = pathOf(Array.from({ length: 101 }, (_, i) => [TX(i * 0.05), TY(g(i * 0.05))]))
  const red = pathOf(Array.from({ length: 53 }, (_, i) => [TX(i * 0.05), TY(r(i * 0.05))]))
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1180} h={440} at={0.3}>
        <svg width={1180} height={440}>
          <text x={28} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            {'오차 |목표 − 실제| (rad)'}
          </text>
          <text x={1150} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
            곡선 모양은 모식도
          </text>
          <line x1={TX(0)} x2={TX(5)} y1={TY(0)} y2={TY(0)} stroke={C.dim} strokeWidth={2} />
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <text key={s} x={TX(s)} y={422} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {s} s
            </text>
          ))}
          {[0, 0.02, 0.05].map((e) => (
            <text key={e} x={88} y={TY(e) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {e}
            </text>
          ))}
          <g opacity={prog(t, 0.8)}>
            <line x1={TX(0)} x2={TX(4)} y1={TY(0.05)} y2={TY(0.05)} stroke={C.orange} strokeWidth={3} strokeDasharray="10 7" />
            <text x={110} y={126} fill={C.orange} fontSize={22}>
              trajectory tolerance 0.05 rad
            </text>
          </g>
          <g opacity={prog(t, 6.6)}>
            <rect x={TX(4)} y={TY(0.06)} width={TX(4.5) - TX(4)} height={TY(0) - TY(0.06)} fill={`${C.blue}1c`} />
            <text x={(TX(4) + TX(4.5)) / 2} y={112} textAnchor="middle" fill={C.blue} fontSize={22}>
              goal_time 0.5 s
            </text>
            <line x1={TX(4)} x2={TX(5)} y1={TY(0.02)} y2={TY(0.02)} stroke={C.blue} strokeWidth={3} strokeDasharray="10 7" />
            <text x={890} y={274} fill={C.blue} fontSize={22}>
              goal 0.02
            </text>
          </g>
          <Drawn d={green} color={C.green} p={prog(t, 7.5, 3)} />
          <g opacity={prog(t, 10.4)}>
            <circle cx={TX(4.2)} cy={TY(0.02)} r={8} fill={C.green} />
            <text x={848} y={322} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              4.2 s
            </text>
          </g>
          <Drawn d={red} color={C.red} p={prog(t, 13.2, 2)} />
          <g opacity={prog(t, 15)}>
            <circle cx={TX(2.6)} cy={TY(0.05)} r={9} fill={C.red} />
            <text x={TX(2.6) + 14} y={124} fill={C.red} fontSize={22} fontWeight={600}>
              2.6 s · 정지
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={610} w={580} h={270} at={9} color={`${C.green}88`} title={<Head color={C.green}>초록 관절 → SUCCESSFUL</Head>}>
        <span style={line(C.text, 24)}>움직이는 동안 0.05 rad 이하</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 9.8) }}>4 초에 마지막 점을 지남</span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 10.6) }}>4.2 초에 0.02 rad 안으로 들어옴</span>
      </Box>
      <Box x={664} y={610} w={580} h={270} at={13} color={`${C.red}88`} title={<Head color={C.red}>빨강 관절 → abort</Head>}>
        <span style={line(C.text, 24)}>2.6 초에 0.05 rad 을 넘어 그 자리에 정지</span>
        <span style={{ ...mono(C.red, 22), opacity: prog(t, 15.4) }}>PATH_TOLERANCE_VIOLATED (−4)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>4.5 초에도 goal 밖이면 GOAL_TOLERANCE_VIOLATED (−5)</span>
      </Box>
      <Box x={1276} y={140} w={580} h={340} at={19.5} gap={12} title={<Head color={C.accent}>constraints 기본값</Head>}>
        <Row at={19.8} k="trajectory" kw={330} kSize={20} size={20}>
          0 · 검사 안 함
        </Row>
        <Row at={20.4} k="goal" kw={330} kSize={20} size={20}>
          0 · 검사 안 함
        </Row>
        <Row at={21} k="goal_time" kw={330} kSize={20} size={20}>
          0 · 무한히 기다림
        </Row>
        <Row at={21.6} k="stopped_velocity_tolerance" kw={330} kSize={20} size={20}>
          0.01
        </Row>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 23) }}>UR driver: trajectory 0.2 · goal 0.1 rad</span>
      </Box>
      <Box x={1276} y={510} w={580} h={370} at={25.5} gap={10} title={<Head color={C.blue}>MoveIt 2 의 감시</Head>}>
        <span style={line(C.muted, 20)}>보내기 전</span>
        <span style={mono(C.text, 22)}>|첫 점 − 현재| ≤ 0.01 rad</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 27.6) }}>실행 중 · scaling 1.1 · margin 0.5 초</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 27.8) }}>4 × 1.1 + 0.5 = 4.9 초</span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 29.4) }}>넘으면 cancel</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- real-time 과 mock ----------

function Realtime() {
  const t = useSec()
  const RX = (ms: number) => 400 + ms * (1340 / 24)
  const ticks = Array.from({ length: 25 }, (_, i) => i)
  const missed = (ms: number) => ms >= 5 && ms <= 17
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <svg width={1792} height={330}>
          <text x={28} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            1 kHz loop 의 실행 시각
          </text>
          <text x={1764} y={44} textAnchor="end" fill={C.accent} fontSize={24} fontWeight={600} opacity={prog(t, 6.5)}>
            jitter = 정해진 시각에서 벗어나는 정도
          </text>
          <g opacity={prog(t, 12.5)}>
            <text x={28} y={112} fill={C.green} fontSize={24} fontWeight={600}>
              real-time kernel
            </text>
            <text x={28} y={142} fill={C.muted} fontSize={22}>
              최대 지연 110 µs
            </text>
            {ticks.map((ms) => (
              <line key={ms} x1={RX(ms)} x2={RX(ms)} y1={94} y2={148} stroke={C.green} strokeWidth={4} />
            ))}
          </g>
          <text x={28} y={222} fill={C.red} fontSize={24} fontWeight={600}>
            일반 kernel
          </text>
          <text x={28} y={252} fill={C.muted} fontSize={22} opacity={prog(t, 12.5)}>
            최대 지연 13,197 µs
          </text>
          {ticks.map((ms) => (
            <line key={ms} x1={RX(ms)} x2={RX(ms)} y1={206} y2={260} stroke={missed(ms) ? C.dim : C.red} strokeWidth={missed(ms) ? 2 : 4} strokeDasharray={missed(ms) ? '5 5' : undefined} opacity={prog(t, 0.6 + ms * 0.06, 0.3)} />
          ))}
          <line x1={RX(17.2)} x2={RX(17.2)} y1={200} y2={266} stroke={C.orange} strokeWidth={5} opacity={prog(t, 2.4)} />
          <g opacity={prog(t, 18.5)}>
            <line x1={RX(4)} x2={RX(17.2)} y1={194} y2={194} stroke={C.orange} strokeWidth={2.5} />
            <text x={(RX(4) + RX(17.2)) / 2} y={182} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              13.2 ms 동안 계산 없음 · 13 주기를 놓침
            </text>
          </g>
          {[0, 4, 8, 12, 16, 20, 24].map((ms) => (
            <text key={ms} x={RX(ms)} y={300} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {ms} ms
            </text>
          ))}
        </svg>
      </Card>
      <Box x={64} y={500} w={880} h={380} at={6.5} title={<Head color={C.accent}>Gutiérrez 등 (2018) · cyclictest 1 시간</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 7) }}>ARMv7 2 core 보드 · kernel 4.9.30 · 가장 큰 지연</span>
        <Bar label="일반 kernel" value={13197} max={13197} color={C.red} at={12.8} width={330} fmt="13,197" unit=" µs" labelW={220} />
        <Bar label="PREEMPT-RT" value={110} max={13197} color={C.green} at={14} width={330} unit=" µs" labelW={220} />
        <Bar label="core 분리" value={88} max={13197} color={C.blue} at={15.6} width={330} unit=" µs" labelW={220} />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.5) }}>1 ms 주기에서 110 µs 는 11% · 13.2 ms 는 13 주기</span>
      </Box>
      <Box x={976} y={500} w={880} h={380} at={24.5} title={<Head color={C.purple}>ros2_control 의 loop 설정</Head>}>
        <Row at={24.8} k="thread_priority" kw={230} kColor={C.purple}>
          기본 50 · SCHED_FIFO 우선순위 (0 ~ 99)
        </Row>
        <Row at={25.6} k="lock_memory" kw={230} kColor={C.purple}>
          real-time kernel 이면 true · RAM 에 고정
        </Row>
        <Row at={26.4} k="cpu_affinity" kw={230} kColor={C.purple}>
          loop thread 를 지정한 core 에서만
        </Row>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.2) }}>SCHED_FIFO: 높은 우선순위 thread 가 스스로 양보할 때까지 CPU 를 쥔다</span>
        <span style={{ ...line(C.orange, 22), opacity: prog(t, 28) }}>update · read · write 안에서는 메모리 할당 · lock 기다림 · 보통 publisher ✕</span>
      </Box>
    </AbsoluteFill>
  )
}

function Mock() {
  const t = useSec()
  const GX = (ms: number) => 100 + ms * (740 / 300)
  const GY = (rad: number) => 330 - rad * 2700
  const fast = pathOf(Array.from({ length: 301 }, (_, n) => [GX(n), GY(0.1 * (1 - 0.9 ** n))]))
  const slowPts: [number, number][] = []
  for (let k = 0; k < 30; k++) {
    const v = GY(0.1 * (1 - 0.9 ** k))
    slowPts.push([GX(k * 10), v], [GX(k * 10 + 10), v])
  }
  const slow = pathOf(slowPts)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={400} at={0.3} title={<Head color={C.accent}>mock_components/GenericSystem</Head>}>
        <Flow steps={['position 명령 (write)', '그대로 복사', '다음 read 의 상태']} color={C.accent} at={0.8} gap={0.7} />
        <span style={{ ...line(C.green, 24), opacity: prog(t, 7) }}>오차가 늘 0 → JTC 의 tolerance 에 걸리지 않음</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 9) }}>확인할 수 있는 것: topic 이름 · controller 이름 · 관절 목록</span>
        <span style={{ ...line(C.red, 24), opacity: prog(t, 11) }}>다시 확인할 것: tracking 오차 · gripper stall · 통신 지연</span>
      </Box>
      <Box x={64} y={570} w={860} h={310} at={13.5} title={<Head color={C.blue}>plugin 으로 바꾸는 simulation</Head>}>
        <Row at={13.8} k="mock_components/GenericSystem" kw={520} kColor={C.text} kSize={20}>
          명령을 그대로 상태로
        </Row>
        <Row at={14.4} k="gz_ros2_control/GazeboSimSystem" kw={520} kColor={C.blue} kSize={20}>
          Gazebo 의 물리 계산
        </Row>
        <Row at={15} k="mujoco_ros2_control/MujocoSystemInterface" kw={520} kColor={C.text} kSize={20}>
          MuJoCo 의 물리 계산
        </Row>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={13.5}>
        <div style={{ position: 'absolute', left: 32, top: 24, right: 32, display: 'grid', gap: 8 }}>
          <Head size={26} color={C.blue}>
            gz_ros2_control 의 position 명령 응답 · gain 0.1
          </Head>
          <span style={line(C.text, 24)}>매 주기 남은 오차의 10% 를 줄인다</span>
          <span style={mono(C.accent, 24)}>T = 1 ÷ (gain × update_rate)</span>
          <span style={{ fontSize: 22 }}>
            <span style={{ color: C.green, fontWeight: 600 }}>━ 1000 Hz</span>
            <span style={{ color: C.orange, fontWeight: 600, marginLeft: 32, opacity: prog(t, 20.5) }}>━ 100 Hz</span>
          </span>
        </div>
        <svg width={900} height={380} style={{ position: 'absolute', left: 0, top: 200 }}>
          <text x={100} y={30} fill={C.muted} fontSize={20}>
            관절 각도 (rad)
          </text>
          {[0, 0.05, 0.1].map((v) => (
            <text key={v} x={88} y={GY(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <line x1={GX(0)} x2={GX(300)} y1={GY(0)} y2={GY(0)} stroke={C.dim} strokeWidth={2} />
          {[0, 100, 200, 300].map((ms) => (
            <text key={ms} x={GX(ms)} y={362} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {ms} ms
            </text>
          ))}
          <line x1={GX(0)} x2={GX(300)} y1={GY(0.1)} y2={GY(0.1)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 6" />
          <text x={GX(300)} y={46} textAnchor="end" fill={C.muted} fontSize={20}>
            목표 0.1
          </text>
          <Drawn d={fast} color={C.green} p={prog(t, 14.4, 1.4)} />
          <Drawn d={slow} color={C.orange} p={prog(t, 20.8, 2)} />
          <g opacity={prog(t, 16)}>
            <circle cx={GX(10)} cy={GY(0.0651)} r={7} fill={C.green} />
            <text x={138} y={162} fill={C.green} fontSize={22}>
              10 ms 에 0.065
            </text>
          </g>
          <g opacity={prog(t, 22.6)}>
            <circle cx={GX(100)} cy={GY(0.0651)} r={7} fill={C.orange} />
            <text x={360} y={200} fill={C.orange} fontSize={22}>
              100 ms 에 0.065
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 32, top: 596, right: 32, display: 'grid', gap: 8 }}>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 20.7) }}>1000 Hz: 1 ÷ (0.1 × 1000) = 10 ms</span>
          <span style={{ ...mono(C.orange, 24), opacity: prog(t, 21.5) }}>100 Hz: 1 ÷ (0.1 × 100) = 100 ms</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24) }}>gain 이 1 을 넘으면 진동 · 2 를 넘으면 불안정</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'controller_manager', color: C.accent, text: '점 사이 0.1 ÷ 0.002 = 50 주기 · controller_manager 가 매 주기 부르는 JTC 가 채운다', at: 0.6 },
    { tag: 'interface 와 URDF', color: C.orange, text: 'claim 한 command interface 로 명령 · <plugin> 한 줄로 실제 팔 · mock · Gazebo', at: 4.4 },
    { tag: 'JTC 보간과 tolerance', color: C.green, text: 'tolerance 를 넘으면 −4 · −5 로 MoveIt 2 에 알림 · 기본값 0 은 검사 안 함', at: 8.4 },
    { tag: 'real-time 과 mock', color: C.purple, text: '일반 kernel 13,197 µs 대 real-time 110 µs · mock 은 오차가 늘 0 → 연결 확인용', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            점 사이의 명령은 누가 채우고, 못 따라가면 누가 알아채 알려 줄까?
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
  const next: [string, string][] = [
    ['Force & Impedance Control', '접촉한 뒤 손끝의 힘 조절 · effort command interface'],
    ['Motion Planning', '장애물을 피하는 경로를 찾아 이 controller 에 넘기기'],
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        {next.map(([name, sub], i) => (
          <Appear key={name} at={0.5 + i * 0.5} style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 600 }}>{name}</div>
            <Label color={C.muted} size={32}>
              {sub}
            </Label>
          </Appear>
        ))}
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/ros2-control (ros_control 논문 · Gutiérrez 등 2018)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- pauses ----------

const PauseRate = () => (
  <PauseWrite
    question="controller_manager 의 update_rate 가 1000 Hz 다. controller 의 update_rate 를 250 Hz 로 주면 몇 주기마다 한 번 계산될까? 300 Hz 는?"
    answer={
      <>
        1000 ÷ 250 = 4 → 4 주기 (4 ms) 마다 한 번
        <br />
        1000 ÷ 300 ≈ 3.33 → 3 ms 와 4 ms 가 섞임 → 경고
      </>
    }
  />
)

const PauseClaim = () => (
  <PauseWrite
    question="joint_trajectory_controller 가 joint2/position 을 claim 하고 있다. 같은 command interface 에 쓰는 forward_command_controller 를 켜려면?"
    answer={
      <>
        그냥 켜면 claim 충돌로 활성화되지 않는다
        <br />
        switch_controller 로 하나를 끄면서 다른 하나를 켠다 · state interface 는 함께 읽는다
      </>
    }
  />
)

const PauseDuration = () => (
  <PauseWrite
    question="기본 설정 (scaling 1.1 · margin 0.5 초) 의 MoveIt 2 가 6 초짜리 trajectory 를 실행한다. 몇 초가 지나도 result 가 없으면 cancel 할까?"
    answer="6 × 1.1 + 0.5 = 7.1 초"
  />
)

const PauseGain = () => (
  <PauseWrite
    question="gz_ros2_control 의 update_rate 가 250 Hz 이고 gain 이 0.1 이다. position 명령에 대한 time constant 는? gain 을 0.5 로 올리면?"
    answer={
      <>
        1 ÷ (0.1 × 250) = 0.04 초 = 40 ms
        <br />1 ÷ (0.5 × 250) = 0.008 초 = 8 ms · 0.5 는 1 보다 작아 진동하지 않는다
      </>
    }
  />
)

export function Ros2Control() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        stack: Stack,
        loop: Loop,
        'pause-rate': PauseRate,
        interfaces: Interfaces,
        urdf: Urdf,
        'pause-claim': PauseClaim,
        interp: Interp,
        tolerance: Tolerance,
        'pause-duration': PauseDuration,
        realtime: Realtime,
        mock: Mock,
        'pause-gain': PauseGain,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
