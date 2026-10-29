import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './legged-balance.narration.json'
import { script } from './legged-balance.script'

// Numbers follow lessons/legged-balance/README.md (see legged-balance.script.ts). The drawings are schematic (marked 모식도
// where the shape is not to scale: the preview-control curve, the pendulum); every number on screen is the lesson's.

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
const num = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, whiteSpace: 'nowrap' })

/** an arrow in an SVG, drawn from (x1, y1) toward (x2, y2); `p` grows it */
function Arrow({ x1, y1, x2, y2, color, p = 1, width = 5 }: { x1: number; y1: number; x2: number; y2: number; color: string; p?: number; width?: number }) {
  const ex = x1 + (x2 - x1) * p
  const ey = y1 + (y2 - y1) * p
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const h = 16
  return (
    <g opacity={p > 0.02 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={ex - ux * h * 0.6} y2={ey - uy * h * 0.6} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${ex},${ey} ${ex - ux * h - uy * h * 0.55},${ey - uy * h + ux * h * 0.55} ${ex - ux * h + uy * h * 0.55},${ey - uy * h - ux * h * 0.55}`} fill={color} />
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
            KINEMATICS · LEGGED BALANCE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>ZMP → Convex MPC</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            gravity + <span style={{ color: C.accent }}>ground reaction force</span> · 바닥을 미는 힘만으로 균형을 잡는 model 기반 제어
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            Mini Cheetah 9 kg · 네 발의 힘을 1초에 30 ~ 40 번 QP 로 풀어 3.7 m/s 로 달렸다 (Kim 등, 2019)
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
  const gx = 480
  const ground = 300
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={330}>
        <svg width={900} height={330}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            다리 로봇의 몸통은 어디에도 고정되어 있지 않다
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={60} x2={860} y1={ground} y2={ground} stroke={C.muted} strokeWidth={4} />
            <rect x={gx - 150} y={120} width={300} height={70} rx={14} fill={C.card} stroke={C.blue} strokeWidth={3} />
            <text x={gx - 130} y={164} fill={C.blue} fontSize={24} fontWeight={600}>
              몸통
            </text>
            <line x1={gx - 70} y1={190} x2={gx - 110} y2={ground} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <line x1={gx + 70} y1={190} x2={gx + 110} y2={ground} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <circle cx={gx + 20} cy={155} r={7} fill={C.text} />
            <text x={gx + 34} y={163} fill={C.muted} fontSize={22}>
              무게중심
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            <Arrow x1={gx + 20} y1={170} x2={gx + 20} y2={270} color={C.purple} p={prog(t, 1.2, 0.8)} />
            <text x={gx + 4} y={250} textAnchor="end" fill={C.purple} fontSize={24} fontWeight={600}>
              gravity
            </text>
          </g>
          <g opacity={prog(t, 1.8)}>
            <Arrow x1={gx - 110} y1={ground} x2={gx - 110} y2={210} color={C.green} p={prog(t, 1.8, 0.8)} />
            <Arrow x1={gx + 110} y1={ground} x2={gx + 110} y2={210} color={C.green} p={prog(t, 1.8, 0.8)} />
            <text x={gx + 130} y={236} fill={C.green} fontSize={24} fontWeight={600}>
              바닥 반력 · 밀어 올리기만
            </text>
            <text x={gx - 130} y={236} textAnchor="end" fill={C.green} fontSize={24} fontWeight={600}>
              끌어당기지는 못한다
            </text>
          </g>
          <g opacity={prog(t, 2.6)}>
            <Arrow x1={gx + 110} y1={ground - 8} x2={gx + 200} y2={ground - 8} color={C.orange} p={prog(t, 2.6, 0.8)} width={4} />
            <text x={gx + 130} y={ground - 24} fill={C.orange} fontSize={22} fontWeight={600}>
              옆으로는 마찰만큼만
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={0.5} title={<Head color={C.accent}>로봇 팔과 다른 점</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            ['로봇 팔은 받침대에 볼트로 고정 → 받침대가 팔을 붙잡아 준다', C.muted, 0.8],
            ['다리 로봇을 움직이는 바깥 힘은 gravity 와 바닥 반력뿐', C.text, 1.6],
            ['바닥은 밀어 올릴 수만 있고, 옆으로는 마찰이 버티는 만큼만 민다', C.text, 2.6],
            ['걸을 때는 무게중심이 딛고 있는 발보다 앞으로 나가는 순간도 있다', C.text, 3.6],
          ].map(([s, c, at]) => (
            <span key={s as string} style={{ ...line(c as string, 23), opacity: prog(t, at as number) }}>
              · {s}
            </span>
          ))}
        </div>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          발을 언제 어디에 딛고, <span style={{ color: C.accent }}>바닥을 어느 쪽으로 얼마나 세게 밀어야 할까?</span>
        </div>
      </Appear>
      <Box x={64} y={640} w={1792} h={240} at={5.8} title={<Label size={24}>고전적인 답: 단순한 모델로 바닥 반력을 먼저 계산하고, joint torque 로 바꾼다</Label>}>
        <Flow steps={['로봇 전체 → 무게중심 하나 · 몸통 하나', '바닥이 밀어 줄 힘(바닥 반력)을 계산', 'τ = Jᵀ F 로 joint torque']} color={C.blue} at={6.2} gap={0.45} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.4) }}>Mini Cheetah: 네 발의 힘을 1초에 30 ~ 40 번 최적화로 풀고 1초에 500 번 다듬어 3.7 m/s (Kim 등, 2019) · RL 보행 논문도 이런 controller 를 비교 대상으로 쓴다 (Jenelten 등, 2024)</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- ground reaction force and friction ----------

function Grf() {
  const t = useSec()
  const fx = 420
  const gy = 600
  const scale = 6.5 // px per N
  const vz = 44.1 * scale
  const hx = 17.7 * scale
  const pv = prog(t, 1, 1)
  const ph = prog(t, 13, 0.9)
  const pr = prog(t, 14.4, 0.9)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={980} h={740}>
        <svg width={980} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            한 발의 바닥 반력 (ground reaction force)
          </text>
          <text x={950} y={46} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 6.2)}>
            trot · 두 발이 땅에 · μ = 0.4
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={60} x2={920} y1={gy} y2={gy} stroke={C.muted} strokeWidth={4} />
            {Array.from({ length: 18 }, (_, i) => (
              <line key={i} x1={70 + i * 48} y1={gy + 4} x2={50 + i * 48} y2={gy + 26} stroke={C.cardEdge} strokeWidth={2} />
            ))}
            <circle cx={fx} cy={gy} r={14} fill={C.card} stroke={C.blue} strokeWidth={4} />
            <text x={fx - 24} y={gy + 56} textAnchor="end" fill={C.muted} fontSize={22}>
              발
            </text>
          </g>
          {/* friction cone */}
          <g opacity={prog(t, 15.4)}>
            <polygon points={`${fx},${gy} ${fx - hx},${gy - vz} ${fx + hx},${gy - vz}`} fill={`${C.green}22`} stroke={C.green} strokeWidth={2.5} strokeDasharray="10 8" />
            <text x={fx + hx + 14} y={gy - vz + 10} fill={C.green} fontSize={24} fontWeight={700}>
              friction cone
            </text>
          </g>
          <g opacity={prog(t, 16.4)}>
            <path d={`M ${fx} ${gy - 150} A 150 150 0 0 0 ${fx - 150 * Math.sin((21.8 * Math.PI) / 180)} ${gy - 150 * Math.cos((21.8 * Math.PI) / 180)}`} fill="none" stroke={C.green} strokeWidth={3} />
            <text x={fx - 50} y={gy - 110} textAnchor="end" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              21.8°
            </text>
          </g>
          <line x1={fx} y1={gy} x2={fx} y2={gy - 150} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" opacity={prog(t, 13)} />
          {/* vertical force */}
          <Arrow x1={fx} y1={gy} x2={fx} y2={gy - vz} color={C.blue} p={pv} width={6} />
          <text x={fx} y={gy - vz - 30} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600} opacity={prog(t, 1.4)}>
            바닥이 발을 되미는 힘
          </text>
          <text x={fx - 20} y={gy - 40} textAnchor="end" fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.6)}>
            수직 44.1 N
          </text>
          {/* cannot pull */}
          <g opacity={prog(t, 3.4)}>
            <Arrow x1={110} y1={gy - 230} x2={110} y2={gy - 130} color={C.red} p={prog(t, 3.4, 0.7)} width={4} />
            <line x1={80} y1={gy - 210} x2={140} y2={gy - 150} stroke={C.red} strokeWidth={5} />
            <text x={160} y={gy - 190} fill={C.red} fontSize={24} fontWeight={600}>
              당기지 못한다
            </text>
            <text x={160} y={gy - 158} fill={C.red} fontSize={24} fontWeight={600}>
              수직 힘 ≥ 0
            </text>
          </g>
          {/* horizontal and resultant */}
          <Arrow x1={fx} y1={gy} x2={fx + hx} y2={gy} color={C.orange} p={ph} width={6} />
          <text x={fx + hx + 14} y={gy + 46} fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.4)}>
            수평 최대 17.7 N
          </text>
          <Arrow x1={fx} y1={gy} x2={fx + hx} y2={gy - vz} color={C.text} p={pr} width={6} />
          <text x={fx + hx + 14} y={gy - vz / 2 - 30} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 15)}>
            바닥 반력 화살표는
          </text>
          <text x={fx + hx + 14} y={gy - vz / 2 + 2} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 15)}>
            수직선에서 21.8° 안쪽
          </text>
          <text x={30} y={700} fill={C.muted} fontSize={22} opacity={prog(t, 17.2)}>
            수평 ÷ 수직 이 μ = 0.4 를 넘으면 발이 미끄러진다 · 이 각도로 만든 원뿔이 friction cone
          </text>
        </svg>
      </Panel>
      <Box x={1076} y={140} w={780} h={350} at={0.5} title={<Head color={C.accent}>Mini Cheetah · trot (Cheetah-Software 의 값)</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2) }}>바닥 반력에는 제약이 둘: 수직 성분은 0 이상 (Tedrake: 무게중심이 중력보다 빨리 바닥 쪽으로 가속할 수 없다) · 수평 성분은 수직 × μ 이하</span>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['질량 9 kg → 무게 9 × 9.81 = 88.3 N', 6.4],
            ['대각선 두 발이 나눠 받음 → 88.3 ÷ 2 = 44.1 N', 8.4],
            ['μ = 0.4 → 수평 ≤ 0.4 × 44.1 = 17.7 N', 12.8],
            ['수평 ÷ 수직 = 0.4 가 되는 각도 → 21.8°', 16.2],
          ].map(([s, at]) => (
            <span key={s as string} style={{ ...num(C.text, 25), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
        </div>
      </Box>
      <Box x={1076} y={520} w={780} h={360} at={19.5} title={<Head color={C.orange}>몸 전체의 앞쪽 가속도 한계 (높이 유지)</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <span style={{ ...num(C.text, 25), opacity: prog(t, 19.8) }}>수평 힘의 합 ≤ 0.4 × 88.3 = 35.3 N</span>
          <Bar label="μ = 0.4" value={3.92} max={4.5} color={C.orange} at={20.8} width={260} unit=" m/s²" sub="35.3 ÷ 9" labelW={190} />
          <Bar label="μ = 0.1 (젖은 바닥)" value={0.98} max={4.5} color={C.red} at={24.4} width={260} unit=" m/s²" sub="0.1 × 9.81" labelW={190} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.6) }}>3.92 = μ × g = 0.4 × 9.81 → 로봇의 무게와 상관없다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- ZMP and the cart-table ----------

function Zmp() {
  const t = useSec()
  const ax = 500 // ankle x in the cart-table svg
  const floor = 400
  const m = 2000 // px per metre along the foot
  const marks: [number, string, string, number, number][] = [
    [0, '0', C.green, 18.4, 36],
    [-0.082, '−8.2 cm', C.green, 19.6, 36],
    [-0.1, '−10.0 cm', C.orange, 21, 64],
    [-0.163, '−16.3 cm', C.red, 22.4, 36],
  ]
  const press: [number, number, number][] = [
    [160, 170, 16],
    [212, 205, 11],
    [152, 330, 24],
    [205, 352, 15],
  ]
  const defs: [string, string, string, number][] = [
    ['CoP (center of pressure)', '발바닥 여러 곳에 걸린 바닥 반력을 수직 힘으로 가중 평균한 한 점 · 가중치가 모두 0 이상이라 늘 발이 닿은 영역 안', C.blue, 0.5],
    ['support polygon', '발이 닿은 점들을 고무줄로 감싼 영역 · 균형을 잃지 않은 동안 ZMP 와 CoP 가 같아서, 실제 로봇은 발바닥의 force sensor 로 ZMP 를 잰다', C.green, 2.6],
    ['ZMP (zero-moment point)', '원하는 움직임에서 거꾸로 구한, 바닥 반력이 몸을 돌리는 moment 를 남기지 않는 점 · support polygon 안이면 발바닥이 붙은 채 그 움직임을 낼 수 있다 (Vukobratović · Borovac, 2004)', C.orange, 6.3],
  ]
  return (
    <AbsoluteFill>
      {defs.map(([h, s, c, at], i) => (
        <Box key={h} x={64 + i * 604} y={140} w={584} h={220} at={at} color={`${c}66`} title={<Head color={c}>{h}</Head>}>
          <span style={line(C.text, 22)}>{s}</span>
        </Box>
      ))}
      <Appear at={0.6} out={11.6} style={{ position: 'absolute', left: 64, top: 390, width: 1000 }}>
        <div style={{ height: 490, borderRadius: 24, background: C.card, border: `1.5px solid ${C.cardEdge}`, overflow: 'hidden' }}>
          <svg width={1000} height={490}>
            <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600}>
              위에서 본 두 발 · 바닥 반력을 한 점에 모으면 CoP
            </text>
            {[120, 300].map((x) => (
              <rect key={x} x={x} y={110} width={120} height={270} rx={52} fill={`${C.blue}10`} stroke={C.blue} strokeWidth={2.5} />
            ))}
            {press.map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={`${C.blue}55`} stroke={C.blue} strokeWidth={2} />
            ))}
            <text x={470} y={170} fill={C.muted} fontSize={22}>
              발바닥 여러 곳에 걸린 바닥 반력
            </text>
            <text x={470} y={200} fill={C.muted} fontSize={22}>
              (원의 크기 = 수직 힘)
            </text>
            <g opacity={prog(t, 1.4)}>
              <circle cx={172} cy={286} r={10} fill={C.accent} />
              <text x={470} y={270} fill={C.accent} fontSize={24} fontWeight={600}>
                CoP: 수직 힘으로 가중 평균한 점
              </text>
            </g>
            <g opacity={prog(t, 2.8)}>
              <rect x={118} y={108} width={304} height={274} rx={8} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="10 8" />
              <text x={118} y={414} fill={C.green} fontSize={24} fontWeight={600}>
                support polygon
              </text>
              <text x={118} y={444} fill={C.green} fontSize={22}>
                발이 닿은 점들을 감싼 영역 · CoP 는 늘 이 안
              </text>
            </g>
            <g opacity={prog(t, 7)}>
              <text x={470} y={330} fill={C.orange} fontSize={23} fontWeight={600}>
                균형을 잃지 않은 동안 ZMP = CoP
              </text>
              <circle cx={880} cy={430} r={10} fill={C.red} opacity={prog(t, 9)} />
              <text x={880} y={400} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 9)}>
                fictitious ZMP
              </text>
              <text x={880} y={462} textAnchor="middle" fill={C.red} fontSize={22} opacity={prog(t, 9)}>
                발이 가장자리를
              </text>
              <text x={880} y={486} textAnchor="middle" fill={C.red} fontSize={22} opacity={prog(t, 9)}>
                축으로 돈다
              </text>
            </g>
          </svg>
        </div>
      </Appear>
      <Appear at={12} style={{ position: 'absolute', left: 64, top: 390, width: 1000 }}>
      <Panel x={0} y={0} w={1000} h={490}>
        <svg width={1000} height={490}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 12.2)}>
            cart-table 모델 (Kajita 등, 2003) · 수레 = 무게중심, 탁자 받침 = 발
          </text>
          <g opacity={prog(t, 12.6)}>
            <line x1={40} x2={960} y1={floor} y2={floor} stroke={C.muted} strokeWidth={4} />
            <rect x={ax - 200} y={floor - 22} width={400} height={22} rx={6} fill={`${C.green}33`} stroke={C.green} strokeWidth={2.5} />
            <rect x={ax - 22} y={190} width={44} height={floor - 22 - 190} fill={C.card} stroke={C.muted} strokeWidth={3} />
            <rect x={ax - 320} y={178} width={640} height={14} rx={4} fill={C.muted} />
            <rect x={ax - 70} y={118} width={140} height={60} rx={10} fill={C.card} stroke={C.blue} strokeWidth={3} />
            <circle cx={ax - 40} cy={182} r={10} fill={C.blue} />
            <circle cx={ax + 40} cy={182} r={10} fill={C.blue} />
            <circle cx={ax} cy={148} r={7} fill={C.text} />
            <text x={ax} y={100} textAnchor="middle" fill={C.blue} fontSize={23} fontWeight={600}>
              무게중심 (발목 위, x = 0)
            </text>
            <line x1={ax + 380} y1={148} x2={ax + 380} y2={floor} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <text x={ax + 368} y={250} textAnchor="end" fill={C.muted} fontSize={24} fontFamily={MONO}>
              z = 0.8 m
            </text>
            <text x={ax - 200} y={floor + 60} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              뒤꿈치 −0.1
            </text>
            <text x={ax} y={floor + 60} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              발목 0
            </text>
            <text x={ax + 200} y={floor + 60} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              발끝 +0.1
            </text>
            <text x={ax + 300} y={floor + 60} fill={C.dim} fontSize={22}>
              (m)
            </text>
          </g>
          <g opacity={prog(t, 18.2)}>
            <Arrow x1={ax + 80} y1={148} x2={ax + 230} y2={148} color={C.orange} p={prog(t, 18.2, 0.8)} width={6} />
            <text x={ax + 90} y={136} fill={C.orange} fontSize={24} fontWeight={600}>
              앞으로 가속 ẍ
            </text>
            <text x={ax + 80} y={300} fill={C.muted} fontSize={22}>
              앞으로 미는 힘은 0.8 m 아래에서 걸려
            </text>
            <text x={ax + 80} y={330} fill={C.muted} fontSize={22}>
              몸을 뒤로 젖힌다 → 수직 힘은 뒤에서 받쳐야
            </text>
            <text x={ax + 80} y={360} fill={C.orange} fontSize={22} fontWeight={600}>
              가속이 클수록 ZMP 는 더 뒤로
            </text>
          </g>
          {marks.map(([d, l, c, at, up]) => (
            <g key={l} opacity={prog(t, at)}>
              <circle cx={ax + d * m} cy={floor - 11} r={11} fill={c} />
              <text x={ax + d * m} y={floor - up} textAnchor="middle" fill={c} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {l}
              </text>
            </g>
          ))}
          <text x={ax - 0.163 * m} y={floor - 92} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 22.8)}>
            발 밖 · 낼 수 없다
          </text>
        </svg>
      </Panel>
      </Appear>
      <Box x={1096} y={390} w={760} h={490} at={12.2} title={<Head color={C.accent}>ZMP equation · 무게중심이 발목 위(x = 0)일 때</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 12.6) }}>예: z = 0.8 m (HRP-2P 의 0.814 m 와 비슷) · 발 앞뒤 0.1 m</span>
        <div style={{ display: 'grid', gap: 2 }}>
          {[
            ['0', '0', '발목', C.green, 18.4],
            ['1 m/s²', '0.8 ÷ 9.81 × 1 = 0.082 m', '발목 뒤 8.2 cm', C.green, 19.6],
            ['1.23 m/s²', '0.100 m', '뒤꿈치 끝', C.orange, 21],
            ['2 m/s²', '0.163 m', '발 밖 ✕', C.red, 22.4],
          ].map(([a, b, c, col, at]) => (
            <div key={a as string} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={{ ...num(col as string, 24), width: 130 }}>{a as string}</span>
              <span style={{ ...num(C.muted, 22), width: 330 }}>{b as string}</span>
              <span style={{ ...line(col as string, 23), fontWeight: 600 }}>{c as string}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', opacity: prog(t, 24.3) }}>
          <span style={num(C.accent, 30)}>
            p = x − (z / g) × <span style={{ fontFamily: 'inherit' }}>가속도</span>
          </span>
          <span style={line(C.muted, 22)}>Kajita 등의 ZMP equation</span>
        </div>
        <span style={{ ...num(C.orange, 22), opacity: prog(t, 25.2) }}>뒤꿈치 −0.1 m 한계 → 0.1 × 9.81 ÷ 0.8 = 1.23 m/s²</span>
        <div style={{ display: 'grid', gap: 6, opacity: prog(t, 27.2) }}>
          <span style={{ ...line(C.red, 22), fontWeight: 600 }}>✕ ZMP 가 support polygon 안에 있으면 로봇은 넘어지지 않는다</span>
          <span style={line(C.green, 22)}>✓ 지금 이 순간 발바닥이 들리지 않는다는 뜻일 뿐이다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- preview control ----------

function Plan() {
  const t = useSec()
  const feet: [number, number, string][] = [
    [0, 0.1, '2.0 초'],
    [0.3, -0.1, '2.8 초'],
    [0.6, 0.1, '3.6 초'],
    [0.9, -0.1, '4.4 초'],
  ]
  const sx = (x: number) => 200 + x * 500
  const sy = (y: number) => 225 - y * 500
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={340}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 16 }}>
          <Label size={24} style={{ opacity: prog(t, 0.4) }}>
            ZMP equation 의 방향: 무게중심의 움직임을 알면 ZMP 가 나온다
          </Label>
          <Flow steps={['무게중심의 위치·가속도', 'p = x − (z / g) ẍ', 'ZMP']} color={C.blue} at={0.6} />
          <Label size={24} style={{ opacity: prog(t, 2.8) }}>
            걸음 계획 (walking pattern generation) 은 거꾸로 · Kajita 등(2003)
          </Label>
          <Flow steps={['발자국 (언제 · 어디)', 'ZMP 목표 = 딛고 있는 발바닥 가운데', '그 ZMP 를 만드는 무게중심 경로']} color={C.orange} at={3} gap={0.6} />
        </div>
      </Panel>
      <Panel x={1196} y={140} w={660} h={340}>
        <svg width={660} height={340}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 6.5)}>
            오른발 → 왼발로 옮겨 디딜 때
          </text>
          <g opacity={prog(t, 6.8)}>
            <text x={30} y={110} fill={C.muted} fontSize={22}>
              왼발
            </text>
            <text x={30} y={250} fill={C.muted} fontSize={22}>
              오른발
            </text>
            <line x1={110} x2={630} y1={100} y2={100} stroke={C.cardEdge} strokeWidth={2} />
            <line x1={110} x2={630} y1={240} y2={240} stroke={C.cardEdge} strokeWidth={2} />
            <polyline points="110,240 370,240 380,100 630,100" fill="none" stroke={C.orange} strokeWidth={4} />
            <text x={330} y={88} fill={C.orange} fontSize={22} fontWeight={600}>
              ZMP 목표 · 바꾸는 순간 건너감
            </text>
          </g>
          <g opacity={prog(t, 8.4)}>
            <path d="M 110 240 L 230 240 C 330 240 340 100 470 100 L 630 100" fill="none" stroke={C.green} strokeWidth={4} />
            <line x1={230} y1={250} x2={230} y2={300} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
            <text x={230} y={322} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              무게중심은 먼저 움직이기 시작
            </text>
          </g>
          <text x={630} y={322} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 10.2)}>
            지금 입력 ← 앞의 목표
          </text>
        </svg>
      </Panel>
      <Box x={64} y={510} w={900} h={370} at={13} title={<Head color={C.accent}>preview control</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 13.3) }}>미래의 ZMP 목표를 미리 보고 지금의 입력을 정한다 → 굽은 길에서 앞을 내다보며 핸들을 꺾는 운전과 같다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.4) }}>MPC 처럼 앞으로의 오차와 입력 크기를 함께 줄이되, 제약 없이 한 번 풀어 둔 gain 을 쓴다 → 매 주기 미래의 ZMP 목표에 gain 을 곱해 더하기만</span>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 17.4) }}>
            <Label size={22} color={C.muted}>
              Kajita 등이 쓴 값
            </Label>
            <span style={num(C.text, 24)}>무게중심 높이 0.814 m · 계산 간격 5 ms</span>
            <span style={num(C.text, 24)}>ZMP 오차의 weight 1 · 입력 변화의 weight 10⁻⁶</span>
          </div>
        </div>
      </Box>
      <Panel x={996} y={510} w={860} h={370}>
        <svg width={860} height={370}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 19.5)}>
            예로 정한 ZMP 목표 · 위에서 본 발자국
          </text>
          <g opacity={prog(t, 19.8)}>
            <line x1={130} x2={820} y1={sy(0)} y2={sy(0)} stroke={C.cardEdge} strokeWidth={2} strokeDasharray="8 8" />
            <text x={60} y={sy(0) + 8} fill={C.dim} fontSize={22}>
              가운데
            </text>
            <text x={60} y={sy(0.1) + 8} fill={C.muted} fontSize={22}>
              왼발
            </text>
            <text x={60} y={sy(-0.1) + 8} fill={C.muted} fontSize={22}>
              오른발
            </text>
            <Arrow x1={720} y1={320} x2={820} y2={320} color={C.muted} width={3} />
            <text x={710} y={327} textAnchor="end" fill={C.muted} fontSize={22}>
              앞
            </text>
          </g>
          {feet.map(([x, y, when], i) => (
            <g key={when} opacity={prog(t, 20.2 + i * 0.5)}>
              <rect x={sx(x) - 40} y={sy(y) - 22} width={80} height={44} rx={12} fill={`${C.green}22`} stroke={C.green} strokeWidth={2.5} />
              <circle cx={sx(x)} cy={sy(y)} r={7} fill={C.orange} />
              <text x={sx(x)} y={sy(y) + (y > 0 ? -34 : 58)} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
                {when}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 22.4)}>
            <polyline points={feet.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="6 6" />
            <text x={sx(0.9) + 60} y={sy(0) + 8} fill={C.orange} fontSize={22} fontWeight={600}>
              ZMP 목표
            </text>
          </g>
          <g opacity={prog(t, 23.4)}>
            <line x1={sx(0.3)} x2={sx(0.6)} y1={80} y2={80} stroke={C.muted} strokeWidth={2} />
            <text x={(sx(0.3) + sx(0.6)) / 2} y={72} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.3 m
            </text>
            <line x1={sx(0.6) + 60} x2={sx(0.6) + 60} y1={sy(0.1)} y2={sy(0)} stroke={C.muted} strokeWidth={2} />
            <text x={sx(0.6) + 70} y={sy(0.05) + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.1 m
            </text>
            <text x={30} y={352} fill={C.dim} fontSize={22}>
              2.0 초부터 0.8 초마다 한 걸음 · 발을 바꾸는 0.1 초 동안 ZMP 목표를 직선으로 옮김
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

function Preview() {
  const t = useSec()
  const x0 = 110
  const y0 = 400
  const px = 170 // px per second
  const py = 20 // px per cm
  const sx = (s: number) => x0 + s * px
  const sy = (cm: number) => y0 - cm * py
  const zmpRef = (s: number) => {
    if (s < 2.0) return 0
    const k = Math.floor((s - 2.0) / 0.8)
    const r = s - 2.0 - k * 0.8
    const cur = k % 2 === 0 ? 10 : -10
    const prev = k === 0 ? 0 : -cur
    return r < 0.1 ? prev + ((cur - prev) * r) / 0.1 : cur
  }
  const smooth = (a: number, b: number, s: number) => {
    const u = Math.min(1, Math.max(0, (s - a) / (b - a)))
    return u * u * (3 - 2 * u)
  }
  // schematic: starts at 0.97 s, 3.7 cm at 2.0 s, swings ±6.6 cm (shape not computed, see 모식도)
  const com = (s: number) => 6.6 * Math.sin((2 * Math.PI * (s - 2.0)) / 1.6 + 0.9) * smooth(0.97, 2.55, s)
  const N = 240
  const pts = (f: (s: number) => number, upto: number) =>
    Array.from({ length: N + 1 }, (_, i) => (i / N) * 6)
      .filter((s) => s <= upto)
      .map((s) => `${sx(s)},${sy(f(s))}`)
      .join(' ')
  const show = Math.min(6, 6 * prog(t, 0.6, 3.6))
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={740}>
        <svg width={1180} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            좌우 방향의 ZMP 목표와 무게중심 · preview 1.6 초
          </text>
          <text x={1150} y={44} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 0.3)}>
            모식도 · 곡선 모양은 개략
          </text>
          <g opacity={prog(t, 0.4)}>
            {[-10, -5, 0, 5, 10].map((v) => (
              <g key={v}>
                <line x1={x0} x2={sx(6)} y1={sy(v)} y2={sy(v)} stroke={v === 0 ? C.muted : C.cardEdge} strokeWidth={v === 0 ? 2 : 1.5} />
                <text x={x0 - 14} y={sy(v) + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {v > 0 ? `+${v}` : v}
                </text>
              </g>
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((s) => (
              <text key={s} x={sx(s)} y={sy(-10) + 40} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {s}
              </text>
            ))}
            <text x={sx(6)} y={sy(-10) + 74} textAnchor="end" fill={C.muted} fontSize={22}>
              t (초)
            </text>
            <text x={x0 - 14} y={sy(10) - 24} textAnchor="end" fill={C.muted} fontSize={22}>
              y (cm)
            </text>
          </g>
          <polyline points={pts(zmpRef, show)} fill="none" stroke={C.orange} strokeWidth={4} opacity={prog(t, 0.6)} />
          <polyline points={pts(com, show)} fill="none" stroke={C.green} strokeWidth={5} opacity={prog(t, 0.6)} />
          <g opacity={prog(t, 4.3)}>
            <text x={sx(2.15)} y={sy(10) - 14} fill={C.orange} fontSize={23} fontWeight={600}>
              ZMP 목표 (±10 cm · 두 발)
            </text>
            <text x={sx(4.35)} y={sy(-8.5)} textAnchor="end" fill={C.green} fontSize={23} fontWeight={600}>
              무게중심
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <line x1={sx(0.97)} x2={sx(0.97)} y1={sy(0) - 100} y2={sy(0)} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
            <text x={sx(0.97)} y={sy(0) - 112} textAnchor="middle" fill={C.green} fontSize={23} fontWeight={600}>
              0.97 초: 무게중심 출발
            </text>
          </g>
          <g opacity={prog(t, 3.6)}>
            <circle cx={sx(2.0)} cy={sy(3.7)} r={9} fill={C.green} />
            <text x={sx(2.0) + 30} y={sy(3.7) + 36} fill={C.green} fontSize={23} fontWeight={600}>
              2.0 초에 이미 3.7 cm
            </text>
            <line x1={sx(0.97)} x2={sx(2.0)} y1={sy(-2)} y2={sy(-2)} stroke={C.dim} strokeWidth={2} />
            <text x={sx(1.48)} y={sy(-2) + 30} textAnchor="middle" fill={C.muted} fontSize={22}>
              약 1 초 먼저
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <line x1={x0 + 10} x2={sx(3.77)} y1={sy(6.6)} y2={sy(6.6)} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
            <text x={x0 + 10} y={sy(6.6) - 12} fill={C.green} fontSize={23} fontWeight={600}>
              좌우 최대 6.6 cm
            </text>
          </g>
          <g opacity={prog(t, 13)}>
            <line x1={x0} x2={sx(6)} y1={sy(10.8)} y2={sy(10.8)} stroke={C.red} strokeWidth={2} strokeDasharray="4 8" />
            <text x={sx(6)} y={sy(10.8) - 30} textAnchor="end" fill={C.red} fontSize={23} fontWeight={600}>
              preview 0.8 초면 ZMP 가 10.8 cm 까지 나간다
            </text>
          </g>
          <text x={30} y={716} fill={C.dim} fontSize={22} opacity={prog(t, 9)}>
            ZMP 는 두 발 위를 오가지만 무게중심은 그 사이를 작게 흔들린다 · preview 1.6 초 = 320 step × 5 ms
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={740} at={0.5} title={<Head color={C.accent}>preview 길이 비교 (Kajita 등의 설정)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 140px 140px', gap: 8, opacity: prog(t, 0.7) }}>
            <span />
            <span style={{ ...num(C.green, 22) }}>1.6 초</span>
            <span style={{ ...num(C.red, 22), opacity: prog(t, 12.8) }}>0.8 초</span>
          </div>
          {[
            ['무게중심 출발', '0.97 초', '1.38 초', 0.9, 13.2],
            ['2.0 초의 무게중심', '3.7 cm', '', 3.8, 99],
            ['좌우 흔들림 최대', '6.6 cm', '', 7.4, 99],
            ['목표를 지나친 ZMP', '', '10.8 cm', 7.8, 14.4],
            ['ZMP 오차 최대 (앞뒤)', '0.97 cm', '3.96 cm', 19.8, 21.6],
            ['ZMP 오차 최대 (좌우)', '0.63 cm', '2.13 cm', 20.4, 22.2],
          ].map(([h, a, b, at1, at2]) => (
            <div key={h as string} style={{ display: 'grid', gridTemplateColumns: '220px 140px 140px', alignItems: 'baseline', gap: 8 }}>
              <span style={{ ...line(C.muted, 22), opacity: prog(t, at1 as number) }}>{h as string}</span>
              <span style={{ ...num(C.green, 25), fontWeight: 600, opacity: prog(t, at1 as number) }}>{a as string}</span>
              <span style={{ ...num(C.red, 25), fontWeight: 600, opacity: prog(t, at2 as number) }}>{b as string}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16) }}>0.8 초로는 무게중심이 늦게 출발한 만큼 ZMP 가 목표를 지나친다 · Kajita 등도 0.8 초로는 잘 따라가지 못했다고 보고</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.6) }}>preview gain 은 2 초보다 먼 미래에서 아주 작아진다 · 이 패턴으로 simulation 의 HRP-2P (키 154 cm, 58 kg) 가 단 높이 0.1 m 나선 계단을 걸었다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- linear inverted pendulum ----------

function Lip() {
  const t = useSec()
  const pivot = { x: 250, y: 380 }
  const mass = { x: 330, y: 150 }
  const rows: [string, number, string, number][] = [
    ['0 초', 5.0, '0', 20],
    ['0.2 초', 6.3, '0.13 m/s', 21.4],
    ['0.4 초', 10.8, '0.33 m/s', 22.8],
    ['0.6 초', 20.7, '0.70 m/s', 24.2],
  ]
  const bx = (i: number) => 120 + i * 200
  const bh = (cm: number) => cm * 7.4
  const base = 705
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            linear inverted pendulum (LIP)
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={22} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.6)}>
            <line x1={60} x2={480} y1={pivot.y} y2={pivot.y} stroke={C.muted} strokeWidth={4} />
            <line x1={pivot.x} y1={pivot.y} x2={mass.x} y2={mass.y} stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
            <circle cx={pivot.x} cy={pivot.y} r={10} fill={C.orange} />
            <circle cx={mass.x} cy={mass.y} r={22} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={3} />
            <text x={pivot.x} y={pivot.y + 40} textAnchor="middle" fill={C.orange} fontSize={23} fontWeight={600}>
              ZMP p
            </text>
            <text x={mass.x + 34} y={mass.y + 8} fill={C.blue} fontSize={23} fontWeight={600}>
              무게중심 x
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <Arrow x1={mass.x} y1={mass.y - 40} x2={mass.x + 110} y2={mass.y - 40} color={C.red} p={prog(t, 1.6, 0.8)} />
            <text x={150} y={mass.y - 54} fill={C.red} fontSize={23} fontWeight={600}>
              멀어지는 쪽으로 가속
            </text>
            <line x1={pivot.x} x2={mass.x} y1={pivot.y + 58} y2={pivot.y + 58} stroke={C.dim} strokeWidth={2} />
            <text x={(pivot.x + mass.x) / 2} y={pivot.y + 84} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              x − p
            </text>
            <line x1={mass.x + 120} x2={mass.x + 120} y1={mass.y} y2={pivot.y} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <text x={mass.x + 112} y={(mass.y + pivot.y) / 2 + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
              z = 0.8 m
            </text>
          </g>
          <g opacity={prog(t, 6.5)}>
            <rect x={500} y={80} width={392} height={190} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={516} y={118} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
              가속도 = ω² (x − p)
            </text>
            <text x={516} y={160} fill={C.text} fontSize={21} fontFamily={MONO}>
              ω² = g/z = 9.81 ÷ 0.8 = 12.26
            </text>
            <text x={516} y={200} fill={C.text} fontSize={21} fontFamily={MONO}>
              5 cm: 12.26 × 0.05 = 0.61 m/s²
            </text>
            <text x={516} y={240} fill={C.muted} fontSize={21} fontFamily={MONO}>
              1 cm: 0.12 m/s²
            </text>
          </g>
          <g opacity={prog(t, 13)}>
            <rect x={500} y={290} width={392} height={150} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={516} y={328} fill={C.text} fontSize={21} fontFamily={MONO}>
              ω = √12.26 = 3.50 /s
            </text>
            <text x={516} y={368} fill={C.orange} fontSize={21} fontFamily={MONO}>
              z = 0.29 m (Mini Cheetah)
            </text>
            <text x={516} y={404} fill={C.orange} fontSize={21} fontFamily={MONO}>
              √(9.81 ÷ 0.29) = 5.82 /s
            </text>
          </g>
          <text x={30} y={500} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 19.5)}>
            발끝보다 5 cm 앞에 멈춘 무게중심 · ZMP = 발끝 → 발끝에서 무게중심까지
          </text>
          {rows.map(([when, cm, , at], i) => (
            <g key={when} opacity={prog(t, at)}>
              <rect x={bx(i)} y={base - bh(cm) * prog(t, at, 0.8)} width={120} height={bh(cm) * prog(t, at, 0.8)} rx={8} fill={i === 3 ? C.red : C.blue} opacity={0.85} />
              <text x={bx(i) + 60} y={base - bh(cm) - 14} textAnchor="middle" fill={i === 3 ? C.red : C.blue} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.5)}>
                {cm.toFixed(1)} cm
              </text>
              <text x={bx(i) + 60} y={base + 30} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {when}
              </text>
            </g>
          ))}
          <line x1={80} x2={880} y1={base} y2={base} stroke={C.muted} strokeWidth={3} opacity={prog(t, 19.5)} />
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={360} at={0.3} title={<Head color={C.accent}>ZMP equation 을 가속도에 대해 풀면</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['무게중심은 ZMP 에서 멀어지는 쪽으로, 거리에 비례해 가속한다', C.text, 0.6],
            ['손끝에 세운 막대가 기운 쪽으로 점점 빨리 넘어지는 것과 같다', C.muted, 2.4],
            ['높이를 일정하게 두면 비례 상수 g / z 가 일정 → linear', C.text, 4.2],
            ['ω 가 넘어지는 빠르기 · 낮을수록 같은 거리에서 더 빨리 넘어진다', C.orange, 13.4],
          ].map(([s, c, at]) => (
            <span key={s as string} style={{ ...line(c as string, 23), opacity: prog(t, at as number) }}>
              · {s}
            </span>
          ))}
        </div>
      </Box>
      <Box x={996} y={530} w={860} h={350} at={19.5} title={<Head color={C.red}>발끝을 넘어가면 발목으로는 되돌릴 수 없다</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          {rows.map(([when, cm, v, at]) => (
            <div key={when} style={{ display: 'flex', gap: 20, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...num(C.muted, 23), width: 100 }}>{when}</span>
              <span style={{ ...num(C.text, 24), width: 130, fontWeight: 600 }}>{cm.toFixed(1)} cm</span>
              <span style={{ ...num(C.muted, 23) }}>속도 {v}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.4) }}>0.2 초마다 두 배에 가깝게 늘어난다 · 발 안이면 발목 torque 로 ZMP 를 앞에 두어 되돌리지만, 발끝 밖이면 가속을 줄일 수 있을 뿐</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- capture point ----------

function Capture() {
  const t = useSec()
  const m = 1400 // px per metre
  const x0 = 200
  const sx = (d: number) => x0 + d * m
  const rows: [string, number, string, string, number][] = [
    ['0.35 m/s', 0.1, '발끝 · 디디지 않고 선다', C.green, 18.8],
    ['0.7 m/s', 0.2, '발 밖 · 0.20 m 앞에 한 걸음', C.orange, 6.8],
    ['1.4 m/s', 0.4, '한 걸음 밖 · 두 걸음 이상', C.red, 20.6],
  ]
  const wait: [string, number, string, number][] = [
    ['0 초', 0.2, '0.10 + 0.10 = 0.20', 24.3],
    ['0.2 초', 0.3, '0.10 + 0.10 × 2.01 = 0.30', 25.5],
    ['0.4 초', 0.51, '0.10 + 0.10 × 4.06 = 0.51', 26.7],
  ]
  const band = (y: number) => (
    <g>
      <line x1={sx(-0.05)} x2={sx(0.6)} y1={y} y2={y} stroke={C.cardEdge} strokeWidth={3} />
      <rect x={sx(0)} y={y - 9} width={0.1 * m} height={18} rx={5} fill={`${C.green}44`} stroke={C.green} strokeWidth={2} />
      <line x1={sx(0.35)} x2={sx(0.35)} y1={y - 16} y2={y + 16} stroke={C.red} strokeWidth={2} strokeDasharray="6 6" />
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={740}>
        <svg width={1100} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            밀린 로봇은 어디를 디뎌야 멈춰 서나 · 높이 0.8 m, ω = 3.50 /s
          </text>
          <g opacity={prog(t, 0.6)}>
            {band(120)}
            <text x={sx(0)} y={160} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              발목 0
            </text>
            <text x={sx(0.1)} y={160} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
              발끝 0.10 m
            </text>
            <text x={sx(0.35)} y={160} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO}>
              한 걸음 최대 0.35 m
            </text>
            <text x={sx(0.6)} y={160} textAnchor="end" fill={C.dim} fontSize={22}>
              (예로 정한 값)
            </text>
          </g>
          <text x={30} y={214} fill={C.muted} fontSize={23} opacity={prog(t, 6.5)}>
            발목 위의 무게중심이 밀린 속도 → capture point = 속도 ÷ 3.50
          </text>
          {rows.map(([v, d, what, c, at], i) => {
            const y = 262 + i * 86
            return (
              <g key={v} opacity={prog(t, at)}>
                {band(y)}
                <text x={sx(-0.05) - 12} y={y + 8} textAnchor="end" fill={c} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
                <circle cx={sx(d)} cy={y} r={11} fill={c} />
                <text x={sx(d)} y={y - 22} textAnchor="middle" fill={c} fontSize={23} fontFamily={MONO} fontWeight={600}>
                  {d.toFixed(2)} m
                </text>
                <text x={sx(d)} y={y + 36} textAnchor="middle" fill={c} fontSize={22} fontWeight={600}>
                  {what}
                </text>
              </g>
            )
          })}
          <text x={30} y={534} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 24)}>
            0.7 m/s 로 밀린 뒤 ZMP 를 발끝(0.10 m)에 두고 버티면 capture point 는
          </text>
          {wait.map(([w, d, f, at], i) => {
            const y = 584 + i * 58
            return (
              <g key={w} opacity={prog(t, at)}>
                {band(y)}
                <text x={sx(-0.05) - 12} y={y + 8} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {w} 뒤
                </text>
                <circle cx={sx(d)} cy={y} r={10} fill={i === 2 ? C.red : C.orange} />
                <text x={sx(-0.05) + 10} y={y - 14} fill={i === 2 ? C.red : C.orange} fontSize={22} fontFamily={MONO}>
                  {f} m
                </text>
              </g>
            )
          })}
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={740} at={6.5} title={<Head color={C.accent}>capture point (Pratt 등, 2006)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...num(C.accent, 26), opacity: prog(t, 6.8) }}>capture point = 위치 + 속도 ÷ ω</span>
          <span style={{ ...num(C.text, 24), opacity: prog(t, 8) }}>0 + 0.7 ÷ 3.50 = 0.20 m</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.6) }}>그 점을 디디고 ZMP 를 두면 무게중심은 다가가며 느려져 정확히 그 위에서 멈춘다</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 13.4) }}>더 가까이 디디면 → 무게중심이 발을 넘어간다</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 14.6) }}>더 멀리 디디면 → 발에 닿기 전에 멈췄다가 되돌아온다</span>
          <div style={{ display: 'grid', gap: 6, marginTop: 4, opacity: prog(t, 18.6) }}>
            <Label size={22} color={C.muted}>
              언제, 어디에 디딜지
            </Label>
            <span style={line(C.green, 22)}>support polygon 안 → 발을 떼지 않고 선다</span>
            <span style={line(C.orange, 22)}>밖 → support polygon 이 그 점을 덮도록 디딘다</span>
            <span style={line(C.red, 22)}>한 걸음 범위 밖 → 한 걸음으로는 설 수 없다</span>
          </div>
          <span style={{ ...line(C.text, 22), marginTop: 4, opacity: prog(t, 24.4) }}>발끝과의 거리 0.10 m 는 0.2 초마다 e^(3.50 × 0.2) ≈ 2.01 배</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.4) }}>0.2 초 안에 디디면 0.30 m 걸음으로 서지만, 0.4 초를 기다리면 0.51 m 가 필요해 최대 0.35 m 로는 설 수 없다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- single rigid body and convex MPC ----------

function Mpc() {
  const t = useSec()
  const cx = 450 // hip centre x in the svg
  const com = cx + 20 // 2 cm ahead at 1000 px/m
  const gy = 340
  const fs = 2.5 // px per N
  const pf = prog(t, 13.5, 1)
  const accel: [string, string, string, string, boolean, number][] = [
    ['1 m/s²', '9 N', '4.5 N', '0.10', true, 26.3],
    ['3 m/s²', '27 N', '13.5 N', '0.31', true, 27],
    ['5 m/s²', '45 N', '22.5 N', '0.51', false, 27.7],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={400}>
        <svg width={900} height={400}>
          <text x={30} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            점 발 · trot 의 support polygon 은 선분 → 바닥 반력 자체를 계획
          </text>
          <g opacity={prog(t, 6.6)}>
            <line x1={40} x2={860} y1={gy} y2={gy} stroke={C.muted} strokeWidth={4} />
            <rect x={cx - 260} y={110} width={520} height={70} rx={14} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={3} />
            <text x={cx} y={98} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600}>
              몸통 9 kg · single rigid body (질량 m, 회전 관성 I)
            </text>
            {[cx - 190, cx + 190].map((hx) => (
              <g key={hx}>
                <line x1={hx} y1={180} x2={hx + 40} y2={260} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
                <line x1={hx + 40} y1={260} x2={hx} y2={gy} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
                <circle cx={hx} cy={gy} r={8} fill={C.blue} />
              </g>
            ))}
            <text x={cx + 214} y={gy - 8} fill={C.muted} fontSize={22}>
              앞발 둘
            </text>
            <text x={cx - 200} y={gy - 8} textAnchor="end" fill={C.muted} fontSize={22}>
              뒷발 둘
            </text>
            <text x={cx + 290} y={gy + 36} fill={C.dim} fontSize={22}>
              앞 →
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <circle cx={com} cy={145} r={9} fill={C.text} />
            <line x1={com} y1={145} x2={com} y2={gy - 10} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
            <text x={com + 16} y={153} fill={C.text} fontSize={22} fontWeight={600}>
              무게중심 (가운데 + 2 cm)
            </text>
            <line x1={com} x2={cx + 190} y1={gy - 40} y2={gy - 40} stroke={C.orange} strokeWidth={2} />
            <text x={(com + cx + 190) / 2} y={gy - 50} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO}>
              0.17 m
            </text>
            <line x1={cx - 190} x2={com} y1={gy - 40} y2={gy - 40} stroke={C.green} strokeWidth={2} />
            <text x={(com + cx - 190) / 2} y={gy - 50} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO}>
              0.21 m
            </text>
          </g>
          <Arrow x1={cx + 190} y1={gy} x2={cx + 190} y2={gy - 48.8 * fs} color={C.orange} p={pf} width={6} />
          <text x={cx + 236} y={gy - 48.8 * fs + 6} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 14.2)}>
            48.8 N
          </text>
          <Arrow x1={cx - 190} y1={gy} x2={cx - 190} y2={gy - 39.5 * fs} color={C.green} p={pf} width={6} />
          <text x={cx - 206} y={gy - 39.5 * fs + 6} textAnchor="end" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 14.2)}>
            39.5 N
          </text>
          <text x={30} y={385} fill={C.text} fontSize={22} fontFamily={MONO} opacity={prog(t, 16)}>
            48.8 × 0.17 = 8.3 N·m = 39.5 × 0.21 · 합 88.3 N
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={400} at={6.5} title={<Head color={C.accent}>single rigid body 모델 (Di Carlo 등, 2018)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.8) }}>다리가 몸통에 주는 영향을 무시 · 다리 질량은 로봇 전체의 약 10%</span>
          <span style={{ ...num(C.text, 24), opacity: prog(t, 8.4) }}>m × 가속도 = Σ fᵢ + m g · 발 힘의 합 − 무게 → 몸통 가속</span>
          <span style={{ ...num(C.text, 24), opacity: prog(t, 10) }}>d/dt (I ω) = Σ rᵢ × fᵢ · moment 의 합 → 회전</span>
          <div style={{ display: 'grid', gap: 6, marginTop: 4 }}>
            {[
              ['앞발 둘', '0.19 − 0.02 = 0.17 m', '88.3 × 0.21 ÷ 0.38 = 48.8 N', C.orange, 13.6],
              ['뒷발 둘', '0.19 + 0.02 = 0.21 m', '88.3 × 0.17 ÷ 0.38 = 39.5 N', C.green, 14.6],
            ].map(([a, b, c, col, at]) => (
              <div key={a as string} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at as number) }}>
                <span style={{ ...line(col as string, 23), fontWeight: 600, width: 100 }}>{a as string}</span>
                <span style={{ ...num(C.muted, 22), width: 280 }}>{b as string}</span>
                <span style={{ ...num(col as string, 23) }}>{c as string}</span>
              </div>
            ))}
          </div>
          <span style={{ ...line(C.red, 22), opacity: prog(t, 17) }}>네 발이 똑같이 22.1 N 씩이면 뒷발 44.1 × 0.21 = 9.3 N·m 가 앞발 7.5 N·m 보다 커서 앞으로 숙여진다</span>
        </div>
      </Box>
      <Box x={64} y={570} w={1000} h={310} at={19.5} title={<Head color={C.accent}>convex MPC 의 QP · Mini Cheetah 코드의 값</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 19.8) }}>상태 12 개 (자세·위치·각속도·속도) · 변수는 step 마다 땅에 닿은 발의 바닥 반력 · 제약 |fx| ≤ μ fz, |fy| ≤ μ fz, fz ≥ 0, 한 발 120 N 까지</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>비용: (상태 − 목표)² × weight (높이 50, yaw 10) + 힘² × 작은 weight · 직선 관계 + 그릇 모양 비용 = convex → 전역 최소 하나</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: prog(t, 22.4) }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ width: 40, height: 36, borderRadius: 6, background: i < 5 ? `${C.orange}44` : `${C.green}44`, border: `1.5px solid ${i < 5 ? C.orange : C.green}`, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 22, color: C.text, opacity: prog(t, 22.4 + i * 0.1) }}>
                {i + 1}
              </div>
            ))}
            <span style={{ ...num(C.text, 22), marginLeft: 14 }}>0.026 초 × 10 = 0.26 초 = 걸음 한 주기</span>
          </div>
          <span style={{ ...num(C.orange, 22), opacity: prog(t, 24.2) }}>변수 4 × 3 × 10 = 120 → 공중 발을 빼면 60 · 10 배 넘게 빨라짐</span>
        </div>
      </Box>
      <Box x={1096} y={570} w={760} h={310} at={26} title={<Head color={C.orange}>trot 에서 앞으로 가속하라는 명령 (한 발 수직 44.1 N)</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 130px 110px 90px 1fr', gap: 8, opacity: prog(t, 26.1) }}>
            {['가속도', '수평 힘 합 9 ×', '한 발', '수평÷수직', ''].map((h) => (
              <span key={h} style={line(C.dim, 20)}>
                {h}
              </span>
            ))}
          </div>
          {accel.map(([a, b, c, d, ok, at]) => (
            <div key={a} style={{ display: 'grid', gridTemplateColumns: '100px 130px 110px 90px 1fr', gap: 8, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={num(C.text, 23)}>{a}</span>
              <span style={num(C.muted, 23)}>{b}</span>
              <span style={num(C.text, 23)}>{c}</span>
              <span style={{ ...num(ok ? C.green : C.red, 23), fontWeight: 600 }}>{d}</span>
              <span style={{ ...line(ok ? C.green : C.red, 22), fontWeight: 600 }}>{ok ? '✓ 제약 안' : '✕ 0.4 넘어 미끄러짐'}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 29.2) }}>QP 는 처음부터 제약 안의 힘 가운데 회전까지 맞추는 조합을 고르고, 못 낸 가속은 뒤 step 에서 이어 간다 · 1초에 30 ~ 40 번</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- foot force to joint torque, WBIC, policies ----------

function Torque() {
  const t = useSec()
  const hip = { x: 330, y: 80 }
  const knee = { x: 486, y: 236 }
  const foot = { x: 330, y: 392 }
  const fs = 2.6 // px per N
  const p1 = prog(t, 12.2, 0.9)
  const p2 = prog(t, 14.6, 0.9)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={440}>
        <svg width={820} height={440}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            다리는 −f 로 바닥을 민다 → τ = Jᵀ(−f)
          </text>
          <g opacity={prog(t, 6.3)}>
            <line x1={60} x2={780} y1={foot.y} y2={foot.y} stroke={C.muted} strokeWidth={4} />
            <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
            <line x1={knee.x} y1={knee.y} x2={foot.x} y2={foot.y} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
            <circle cx={hip.x} cy={hip.y} r={13} fill={C.card} stroke={C.blue} strokeWidth={4} />
            <circle cx={knee.x} cy={knee.y} r={13} fill={C.card} stroke={C.blue} strokeWidth={4} />
            <circle cx={foot.x} cy={foot.y} r={10} fill={C.blue} />
            <text x={hip.x - 24} y={hip.y + 8} textAnchor="end" fill={C.text} fontSize={23} fontWeight={600}>
              엉덩이 45°
            </text>
            <text x={knee.x + 24} y={knee.y + 8} fill={C.text} fontSize={23} fontWeight={600}>
              무릎 −90°
            </text>
            <text x={(hip.x + knee.x) / 2 + 18} y={(hip.y + knee.y) / 2 - 12} fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.2 m
            </text>
            <text x={(knee.x + foot.x) / 2 + 18} y={(knee.y + foot.y) / 2 + 24} fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.2 m
            </text>
            <text x={foot.x + 24} y={foot.y - 12} fill={C.muted} fontSize={22}>
              발 · 엉덩이 바로 아래 0.283 m
            </text>
            <line x1={foot.x} x2={knee.x} y1={foot.y + 24} y2={foot.y + 24} stroke={C.dim} strokeWidth={2} />
            <text x={(foot.x + knee.x) / 2} y={foot.y + 46} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.141 m
            </text>
          </g>
          <Arrow x1={foot.x} y1={foot.y} x2={foot.x} y2={foot.y - 44.1 * fs} color={C.green} p={p1} width={6} />
          <text x={foot.x - 18} y={foot.y - 44.1 * fs + 30} textAnchor="end" fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 12.6)}>
            f = (0, 44.1) N
          </text>
          <Arrow x1={foot.x} y1={foot.y} x2={foot.x + 13.5 * fs} y2={foot.y - 44.1 * fs} color={C.orange} p={p2} width={6} />
          <text x={foot.x + 13.5 * fs + 14} y={foot.y - 44.1 * fs + 2} fill={C.orange} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15)}>
            f = (13.5, 44.1) N
          </text>
          <text x={640} y={120} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 7.4)}>
            힘의 작용선이 엉덩이를
          </text>
          <text x={640} y={150} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 7.4)}>
            지나면 엉덩이 torque = 0
          </text>
        </svg>
      </Panel>
      <Box x={916} y={140} w={940} h={440} at={0.3} title={<Head color={C.accent}>τ = Jᵀ(−f)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 0.6) }}>f 는 바닥이 발을 미는 힘 (MPC 가 정함) · 다리가 바닥을 미는 힘은 F = −f</span>
          <span style={{ ...num(C.text, 24), opacity: prog(t, 6.2) }}>J = [ 0.283 0.141 ; 0 −0.141 ] · 첫 줄 앞뒤, 둘째 줄 위아래</span>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 12.3) }}>
            <span style={num(C.green, 23)}>(0, 44.1) N · 높이 유지 → F = (0, −44.1)</span>
            <span style={num(C.text, 23)}>엉덩이 τ₁ = 0.283 × 0 + 0 × (−44.1) = 0</span>
            <span style={num(C.text, 23)}>무릎 τ₂ = 0.141 × 0 + (−0.141)(−44.1) = 6.24 N·m</span>
          </div>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 14.8) }}>
            <span style={num(C.orange, 23)}>(13.5, 44.1) N · 3 m/s² 로 가속 → F = (−13.5, −44.1)</span>
            <span style={num(C.text, 23)}>엉덩이 τ₁ = 0.283 × (−13.5) + 0 = −3.82 N·m</span>
            <span style={num(C.text, 23)}>무릎 τ₂ = 0.141 × (−13.5) + 6.24 = 4.33 N·m</span>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.8) }}>관절의 최대 torque 는 17 N·m (Kim 등) · 다리 0.2 m 는 예 (코드: 0.209 m, 0.195 m)</span>
        </div>
      </Box>
      <Box x={64} y={610} w={1000} h={270} at={18} title={<Head color={C.accent}>Mini Cheetah 의 제어 구조 (Kim 등, 2019) · gait scheduler 가 발 순서를 정함</Head>}>
        <Flow steps={['MPC · 1초에 30 ~ 40 번', 'WBIC · 1초에 500 번', 'joint PD · 1초에 40,000 번']} color={C.blue} at={18.3} gap={0.45} />
        <div style={{ display: 'grid', gap: 8, marginTop: 2 }}>
          <Bar label="MPC 만" value={2.45} max={4} color={C.muted} at={21} width={260} unit=" m/s" labelW={150} />
          <Bar label="MPC + WBIC" value={3.7} max={4} color={C.green} at={22} width={260} unit=" m/s" sub="최고 속도" labelW={150} />
        </div>
      </Box>
      <Box x={1096} y={610} w={760} h={270} at={24} title={<Head color={C.orange}>학습한 policy 와 함께</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 24.3) }}>DTC (Jenelten 등, 2024): model 기반 계획이 착지점과 몸통 경로를 정하고, policy 는 그 계획을 따라가도록 학습</span>
          <span style={{ ...line(C.green, 22), fontWeight: 600, opacity: prog(t, 26) }}>폭 0.1 m 틈: RL policy 는 피하지 못함 · DTC 는 10 번 모두 건넘 (0.6 m 틈 네 개도 4 번 모두)</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.6) }}>Spot: MPC 여러 개 중 점수 높은 출력을 고르고, 어려운 부분만 RL 로 더함</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: '바닥 반력과 ZMP', color: C.accent, text: 'μ = 0.4 → 수평 가속도 3.92 m/s² 까지 · ZMP 가 발 밖인 움직임은 낼 수 없다 (0.8 m, 0.1 m → 1.23 m/s²)', at: 1 },
    { tag: 'preview control', color: C.blue, text: '1.6 초 앞의 ZMP 목표를 보고 약 1 초 전(0.97 초)부터 무게중심을 움직인다 · 좌우 6.6 cm', at: 4.6 },
    { tag: 'capture point', color: C.orange, text: '무게중심은 ZMP 에서 멀어지며 가속 · 0.7 m/s → 0.7 ÷ 3.50 = 0.20 m 앞을 디디면 선다', at: 8.4 },
    { tag: 'convex MPC', color: C.green, text: 'single rigid body + QP (0.026 초 × 10 step, μ = 0.4) → τ = Jᵀ(−f) 로 joint torque', at: 12.2 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            발을 언제 어디에 딛고, 바닥을 어느 쪽으로 얼마나 세게 밀어야 할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 31, fontWeight: 600 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Sim-to-Real Locomotion</div>
        </Appear>
        <Appear at={1}>
          <div style={{ maxWidth: 1500, textAlign: 'center' }}>
            <Label color={C.muted} size={34} style={{ lineHeight: 1.45 }}>
              같은 보행을 reinforcement learning 으로 simulation 에서 학습하고, actuator network 와 domain randomization 으로 실제 ANYmal 에 옮기기
            </Label>
          </div>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Vukobratović 2004 · Kajita 2003 · Pratt 2006 · Di Carlo 2018 · Kim 2019 · Jenelten 2024
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseZmp = () => (
  <PauseWrite
    question="무게중심 높이 1.0 m, 발목에서 뒤꿈치 끝까지 0.08 m. 발바닥이 들리지 않고 낼 수 있는 앞쪽 가속도는 최대 얼마일까?"
    answer={
      <>
        ZMP 를 뒤꿈치 끝 p = −0.08 m 에 두면 −0.08 = 0 − 1.0 ÷ 9.81 × ẍ
        <br />
        ẍ = 0.08 × 9.81 ÷ 1.0 ≈ 0.785 m/s²
      </>
    }
  />
)

const PausePreview = () => (
  <PauseWrite
    question="높이 0.814 m 인 무게중심이 두 발 사이 가운데(y = 0)에 멈춰 있다. 왼쪽(+y)으로 0.6 m/s² 로 가속하기 시작하려면 ZMP 는 어디에?"
    answer="p = 0 − 0.814 ÷ 9.81 × 0.6 ≈ −0.050 m → 오른쪽으로 약 5 cm · 두 발로 서 있는 동안 ZMP 는 두 발 사이 어디든 갈 수 있다"
  />
)

const PauseCapture = () => (
  <PauseWrite
    question="높이 1.0 m 인 로봇의 무게중심이 발목보다 0.05 m 앞에 있을 때 앞으로 0.5 m/s 로 밀렸다. capture point 는 발목에서 얼마나 앞일까?"
    answer="ω = √(9.81 ÷ 1.0) ≈ 3.13 /s · 속도 ÷ ω = 0.5 ÷ 3.13 ≈ 0.16 m → 0.05 + 0.16 = 0.21 m 앞"
  />
)

const PauseMpc = () => (
  <PauseWrite
    question="같은 trot(한 발 수직 44.1 N)에서 고무 바닥이라 μ = 0.6 이면, 높이를 유지하며 낼 수 있는 앞쪽 가속도는 최대 얼마이고 5 m/s² 명령은 제약을 지킬까?"
    answer="한 발 0.6 × 44.1 = 26.5 N, 두 발 53.0 N → 53.0 ÷ 9 ≈ 5.89 m/s² (= 0.6 × 9.81) · 5 m/s² 는 한 발 9 × 5 ÷ 2 = 22.5 N < 26.5 N 이라 지킨다"
  />
)

export function LeggedBalance() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        grf: Grf,
        zmp: Zmp,
        'pause-zmp': PauseZmp,
        plan: Plan,
        preview: Preview,
        'pause-preview': PausePreview,
        lip: Lip,
        capture: Capture,
        'pause-capture': PauseCapture,
        mpc: Mpc,
        torque: Torque,
        'pause-mpc': PauseMpc,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
