import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './humanoid-wbc.narration.json'
import { script } from './humanoid-wbc.script'

// Numbers follow lessons/humanoid-wbc/README.md (see humanoid-wbc.script.ts). The support-polygon, lever, clap and
// teacher → student drawings are schematic (marked 모식도); every number on screen is the lesson's.

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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            RL · HUMANOID WHOLE-BODY CONTROL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Humanoid Whole-Body Control</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            motion capture → retargeting → <span style={{ color: C.accent }}>motion tracking policy</span> → Unitree H1 · G1
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            사람의 동작을 관절 23 개의 humanoid 가 넘어지지 않고 따라 하게 하는 전신 제어
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
        <div style={{ padding: '26px 32px', display: 'grid', gap: 20 }}>
          <Label size={24}>Sim-to-Real Locomotion 의 4족 보행 policy</Label>
          <Flow steps={['속도 명령 3 개 (앞뒤 · 옆 · 회전)', '4족 policy', '다리 관절 12 개']} color={C.blue} at={0.6} last="→ 걷는다" />
          <div style={{ opacity: prog(t, 2.2) }}>
            <Label size={24}>humanoid 가 바닥의 상자를 집어 선반에 올리려면?</Label>
          </div>
          <Flow steps={['쪼그려 앉기', '허리 숙이기', '두 팔 뻗기', '그동안 두 발로 버티기']} color={C.orange} at={2.4} gap={0.4} last="→ 속도 세 개로는 적을 수 없다" />
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          관절 23 개의 G1 에게 <span style={{ color: C.accent }}>무엇을 목표로 주고, 무엇으로 reward 를 줄까?</span>
        </div>
      </Appear>
      <Panel x={240} y={620} w={1440} h={220}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16, opacity: prog(t, 6) }}>
          <Label size={22}>최근 humanoid 연구의 답 · motion tracking</Label>
          <Flow steps={['사람 motion capture', 'retargeting', 'reference 동작', 'RL 로 매 순간 따라 하기']} color={C.green} at={6.2} gap={0.35} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.3) }}>policy 하나가 팔 · 다리 · 허리를 함께 움직인다 → whole-body controller (WBC) · H2O 는 웹캠 한 대로 H1 이 사람을 따라 공을 차게 했다</span>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- support polygon ----------

function Balance() {
  const t = useSec()
  const joints: [string, number, string, number][] = [
    ['Unitree A1 (4족)', 12, '다리 4 × 3', 0.8],
    ['Unitree H1', 19, '다리 2 × 5 · 팔 2 × 4 · 몸통 1', 1.6],
    ['Unitree G1 (기본형)', 23, '다리 2 × 6 · 허리 1 · 팔 2 × 5', 2.4],
    ['HumanPlus 로봇', 33, 'H1 개조 · 손목 2 · 손 2 × 6', 3.4],
  ]
  // top view, 1 m = 500 px; three columns
  const cols = [170, 450, 700]
  const cy = 275
  const polyAt = 6.8
  const footAt = 0.8
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.5)}>
            위에서 본 발 · <tspan fill={C.green} opacity={prog(t, polyAt)}>초록 = support polygon</tspan> <tspan fill={C.muted} opacity={prog(t, polyAt)}>· 흰 점 = 무게중심</tspan>
          </text>
          <text x={870} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.5)}>
            모식도 · 1 m = 500 px
          </text>
          {['4족 로봇 · 네 발', 'humanoid · 두 발', 'humanoid · 한 발'].map((h, i) => (
            <text key={h} x={cols[i]} y={100} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, footAt + i * 0.3)}>
              {h}
            </text>
          ))}
          {/* 4족: polygon 0.3 × 0.4 m, feet at the corners */}
          <g opacity={prog(t, polyAt)}>
            <rect x={cols[0] - 75} y={cy - 100} width={150} height={200} fill={`${C.green}2e`} stroke={C.green} strokeWidth={2.5} />
          </g>
          <g opacity={prog(t, footAt)}>
            {[
              [-75, -100],
              [75, -100],
              [-75, 100],
              [75, 100],
            ].map(([dx, dy]) => (
              <circle key={`${dx}${dy}`} cx={cols[0] + dx} cy={cy + dy} r={10} fill="#334155" stroke={C.muted} strokeWidth={2} />
            ))}
          </g>
          {/* 두 발: two feet 0.1 × 0.2 m, 0.3 m apart outside to outside */}
          <g opacity={prog(t, polyAt + 0.3)}>
            <rect x={cols[1] - 75} y={cy - 50} width={150} height={100} fill={`${C.green}2e`} stroke={C.green} strokeWidth={2.5} />
          </g>
          <g opacity={prog(t, footAt + 0.3)}>
            <rect x={cols[1] - 75} y={cy - 50} width={50} height={100} rx={8} fill="#334155" stroke={C.muted} strokeWidth={2} />
            <rect x={cols[1] + 25} y={cy - 50} width={50} height={100} rx={8} fill="#334155" stroke={C.muted} strokeWidth={2} />
            <text x={cols[1]} y={cy - 64} textAnchor="middle" fill={C.muted} fontSize={20}>
              발 길이 0.2 m
            </text>
          </g>
          {/* 한 발 */}
          <g opacity={prog(t, polyAt + 0.6)}>
            <rect x={cols[2] - 25} y={cy - 50} width={50} height={100} fill={`${C.green}2e`} stroke={C.green} strokeWidth={2.5} />
          </g>
          <g opacity={prog(t, footAt + 0.6)}>
            <rect x={cols[2] - 25} y={cy - 50} width={50} height={100} rx={8} fill="#334155" stroke={C.muted} strokeWidth={2} />
            <text x={cols[2]} y={cy - 64} textAnchor="middle" fill={C.muted} fontSize={20}>
              발 폭 0.1 m
            </text>
          </g>
          {/* centre of mass and d */}
          <g opacity={prog(t, polyAt + 0.8)}>
            {cols.map((cx) => (
              <circle key={cx} cx={cx} cy={cy} r={7} fill={C.text} />
            ))}
          </g>
          <g opacity={prog(t, 13.3)}>
            {/* d arrows: forward (up) for the first two, sideways for the last */}
            <line x1={cols[0]} y1={cy} x2={cols[0]} y2={cy - 92} stroke={C.orange} strokeWidth={3} />
            <polygon points={`${cols[0] - 7},${cy - 90} ${cols[0] + 7},${cy - 90} ${cols[0]},${cy - 102}`} fill={C.orange} />
            <text x={cols[0]} y={cy + 50} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              d = 0.2 m
            </text>
            <line x1={cols[1]} y1={cy} x2={cols[1]} y2={cy - 42} stroke={C.orange} strokeWidth={3} />
            <polygon points={`${cols[1] - 7},${cy - 40} ${cols[1] + 7},${cy - 40} ${cols[1]},${cy - 52}`} fill={C.orange} />
            <text x={cols[1]} y={cy + 78} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              d = 0.1 m
            </text>
            <line x1={cols[2]} y1={cy} x2={cols[2] + 18} y2={cy} stroke={C.orange} strokeWidth={3} />
            <polygon points={`${cols[2] + 16},${cy - 7} ${cols[2] + 16},${cy + 7} ${cols[2] + 27},${cy}`} fill={C.orange} />
            <text x={cols[2] + 34} y={cy + 8} fill={C.orange} fontSize={20} fontFamily={MONO}>
              d = 0.05 m
            </text>
            {/* push arrows */}
            {[0, 1].map((i) => (
              <g key={i}>
                <line x1={cols[i]} y1={cy + 150} x2={cols[i]} y2={cy + 118} stroke={C.red} strokeWidth={4} />
                <polygon points={`${cols[i] - 8},${cy + 120} ${cols[i] + 8},${cy + 120} ${cols[i]},${cy + 106}`} fill={C.red} />
                <text x={cols[i] + 12} y={cy + 148} fill={C.red} fontSize={21}>
                  앞으로 밀기
                </text>
              </g>
            ))}
            <line x1={cols[2] - 110} y1={cy + 80} x2={cols[2] - 60} y2={cy + 80} stroke={C.red} strokeWidth={4} />
            <polygon points={`${cols[2] - 62},${cy + 72} ${cols[2] - 62},${cy + 88} ${cols[2] - 48},${cy + 80}`} fill={C.red} />
            <text x={cols[2] - 110} y={cy + 112} fill={C.red} fontSize={21}>
              옆으로 밀기
            </text>
          </g>
          {/* per-column numbers */}
          {[
            ['12 kg · 무게중심 높이 0.3 m', '117.7 × 0.2 ÷ 0.3', '≈ 78.5 N', C.green, 14.5],
            ['35 kg · 무게중심 높이 0.6 m', '343.4 × 0.1 ÷ 0.6', '≈ 57.2 N', C.orange, 21],
            ['35 kg · 무게중심 높이 0.6 m', '343.4 × 0.05 ÷ 0.6', '≈ 28.6 N', C.red, 23.5],
          ].map(([w, f, r, c, at], i) => (
            <g key={i} opacity={prog(t, at as number)}>
              <text x={cols[i]} y={470} textAnchor="middle" fill={C.muted} fontSize={20}>
                {w as string}
              </text>
              <text x={cols[i]} y={504} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
                {f as string}
              </text>
              <text x={cols[i]} y={542} textAnchor="middle" fill={c as string} fontSize={30} fontFamily={MONO} fontWeight={600}>
                {r as string}
              </text>
            </g>
          ))}
          <g opacity={prog(t, polyAt)}>
            <text x={30} y={610} fill={C.text} fontSize={22}>
              바닥에 닿은 점들을 고무줄로 감쌌을 때 생기는 영역이 support polygon
            </text>
            <text x={30} y={642} fill={C.muted} fontSize={22}>
              무게중심을 수직으로 내린 점이 이 안에 있어야 쓰러지지 않는다
            </text>
          </g>
          <text x={30} y={690} fill={C.muted} fontSize={22} opacity={prog(t, 10)}>
            4족은 네 발이 넓은 사각형을 만들지만, humanoid 는 두 발바닥의 좁은 영역 위에 서고
          </text>
          <text x={30} y={720} fill={C.muted} fontSize={22} opacity={prog(t, 10)}>
            걸을 때는 걸음마다 한 발로만 서는 순간이 있다
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={0.5} title={<Head color={C.accent}>관절 수 (제조사 사양 · 논문)</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {joints.map(([n, v, sub, at]) => (
            <Bar key={n} label={n} value={v} max={33} color={v === 12 ? C.blue : C.orange} at={at} width={200} labelW={230} sub={sub} />
          ))}
        </div>
      </Box>
      <Box x={996} y={500} w={860} h={380} at={13.3} title={<Head color={C.accent}>넘어지는 힘 = 무게 × 9.81 × d ÷ 무게중심 높이</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 13.6) }}>미는 힘 × 높이가 무게 × d 보다 크면 가장자리를 축으로 쓰러진다 (발을 내딛지 않는 정적 계산)</span>
        <span style={{ ...num(C.muted, 22), opacity: prog(t, 14) }}>무게 × 9.81: 12 kg → 117.7 N · 35 kg → 343.4 N</span>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="4족 · 네 발 · 12 kg" value={78.5} max={90} color={C.green} at={14.5} width={300} unit=" N" labelW={230} />
          <Bar label="G1 · 두 발 · 앞으로" value={57.2} max={90} color={C.orange} at={21} width={300} unit=" N" labelW={230} />
          <Bar label="G1 · 한 발 · 옆으로" value={28.6} max={90} color={C.red} at={23.5} width={300} unit=" N" labelW={230} />
        </div>
        <span style={{ ...line(C.red, 24), fontWeight: 600, opacity: prog(t, 25.5) }}>35 kg 은 12 kg 의 세 배 가까이 · 그런데 더 작은 힘에 넘어진다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Arm() {
  const t = useSec()
  const ground = 600
  const cx = 400 // body centre, side view, 1 m = 500 px
  const com = { x: cx, y: ground - 300 } // 0.6 m up
  const box = { x: cx + 200, y: ground - 270 } // 0.4 m in front
  const showBox = prog(t, 12.6)
  const shift = 11 * showBox // 0.022 m
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            옆에서 본 지렛대 · 두 발로 서서 앞으로 밀릴 때
          </text>
          <text x={870} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 1 m = 500 px
          </text>
          {/* ground and foot */}
          <g opacity={prog(t, 0.5)}>
            <line x1={80} x2={820} y1={ground} y2={ground} stroke={C.muted} strokeWidth={4} />
            <rect x={cx - 50} y={ground - 12} width={100} height={12} rx={4} fill="#334155" stroke={C.muted} strokeWidth={2} />
            <text x={cx - 50} y={ground + 32} fill={C.muted} fontSize={20}>
              발 0.2 m
            </text>
            {/* stick humanoid */}
            <circle cx={cx + shift * 0} cy={ground - 440} r={24} fill="none" stroke={C.blue} strokeWidth={4} />
            <line x1={cx} y1={ground - 416} x2={cx} y2={ground - 270} stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
            <line x1={cx} y1={ground - 270} x2={cx - 20} y2={ground - 12} stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
            <line x1={cx} y1={ground - 270} x2={cx + 20} y2={ground - 12} stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
          </g>
          {/* arms: down when idle, forward with the box */}
          <line x1={cx} y1={ground - 390} x2={cx + 20 + (box.x - 40 - cx - 20) * showBox} y2={ground - 250 + (box.y - (ground - 250)) * showBox} stroke={C.blue} strokeWidth={5} strokeLinecap="round" opacity={prog(t, 0.5)} />
          {/* centre of mass */}
          <g opacity={prog(t, 0.7)}>
            <circle cx={com.x} cy={com.y} r={9} fill={C.text} />
            <text x={com.x - 18} y={com.y - 16} textAnchor="end" fill={C.text} fontSize={21}>
              무게중심
            </text>
          </g>
          {/* levers h and d */}
          <g opacity={prog(t, 0.9)}>
            <line x1={cx - 150} x2={cx - 150} y1={com.y} y2={ground} stroke={C.orange} strokeWidth={2} strokeDasharray="8 8" />
            <line x1={cx - 160} x2={cx - 140} y1={com.y} y2={com.y} stroke={C.orange} strokeWidth={2} />
            <text x={cx - 166} y={(com.y + ground) / 2 + 8} textAnchor="end" fill={C.orange} fontSize={24} fontFamily={MONO}>
              h = 0.6 m
            </text>
            <text x={cx - 166} y={(com.y + ground) / 2 + 36} textAnchor="end" fill={C.muted} fontSize={20}>
              미는 힘의 지렛대 (길다)
            </text>
            <line x1={cx} x2={cx + 50} y1={ground + 56} y2={ground + 56} stroke={C.orange} strokeWidth={4} />
            <text x={cx + 60} y={ground + 64} fill={C.orange} fontSize={24} fontFamily={MONO}>
              d = 0.1 m
            </text>
            <text x={cx + 60} y={ground + 92} fill={C.muted} fontSize={20}>
              무게의 지렛대 (짧다) · 앞쪽 여유
            </text>
          </g>
          {/* push */}
          <g opacity={prog(t, 1.2)}>
            <line x1={cx - 110} x2={cx - 30} y1={com.y} y2={com.y} stroke={C.red} strokeWidth={5} />
            <polygon points={`${cx - 32},${com.y - 9} ${cx - 32},${com.y + 9} ${cx - 16},${com.y}`} fill={C.red} />
            <text x={cx - 112} y={com.y - 16} fill={C.red} fontSize={24} fontWeight={700}>
              F
            </text>
            <text x={30} y={96} fill={C.text} fontSize={24} fontFamily={MONO}>
              F × 0.6 &gt; 343.4 × 0.1 이면 넘어진다 → F ≈ 57.2 N
            </text>
            <text x={30} y={128} fill={C.muted} fontSize={21} opacity={prog(t, 2.4)}>
              h 가 두 배면 F 는 반 · d 가 반이면 F 도 반 → 발을 내디뎌 support polygon 을 무게중심 아래로 옮긴다
            </text>
          </g>
          {/* step forward */}
          <g opacity={prog(t, 3.6)}>
            <rect x={cx + 90} y={ground - 12} width={100} height={12} rx={4} fill="none" stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
            <text x={cx + 90} y={ground + 32} fill={C.green} fontSize={20}>
              내디딘 발
            </text>
          </g>
          {/* the box */}
          <g opacity={showBox}>
            <rect x={box.x - 25} y={box.y - 25} width={50} height={50} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={3} />
            <text x={box.x} y={box.y - 40} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              약 2 kg 상자
            </text>
            <line x1={cx + 12} x2={box.x} y1={box.y + 60} y2={box.y + 60} stroke={C.orange} strokeWidth={2} strokeDasharray="8 8" />
            <text x={(cx + box.x) / 2 + 20} y={box.y + 88} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO}>
              몸 앞 0.4 m
            </text>
            <circle cx={com.x + shift} cy={com.y + 40} r={8} fill={C.accent} />
            <text x={com.x + 28} y={com.y + 160} fill={C.accent} fontSize={21}>
              합친 무게중심 (하늘색) · 0.022 m, 2.2 cm 앞으로
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={300} at={6.3} title={<Head color={C.orange}>HumanPlus · H1 의 골반을 앞으로 밀기</Head>}>
        <div style={{ display: 'grid', gap: 14, marginTop: 6 }}>
          <Bar label="제조사 기본 controller" value={24} max={40} color={C.red} at={6.6} width={300} unit=" N" labelW={250} sub="균형을 잃음" />
          <Bar label="학습한 policy" value={32} max={40} color={C.green} at={7.8} width={300} unit=" N" labelW={250} sub="버팀" />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.4) }}>학습한 policy 는 발목과 엉덩이를 움직이고 발을 내디뎌 정적 계산의 한계를 넘는 힘도 버틴다</span>
      </Box>
      <Box x={996} y={470} w={860} h={410} at={12.3} title={<Head color={C.accent}>팔이 옮기는 무게중심</Head>}>
        <span style={{ ...line(), opacity: prog(t, 12.6) }}>
          G1 팔의 최대 하중 <span style={num(C.orange)}>약 2 kg</span> (사양) 상자를 몸 앞 <span style={num(C.orange)}>0.4 m</span> 에 들면
        </span>
        <span style={{ ...num(C.text, 28), fontWeight: 600, opacity: prog(t, 13.8) }}>2 × 0.4 ÷ (35 + 2) ≈ 0.022 m ≈ 2.2 cm</span>
        <div style={{ display: 'grid', gap: 8, opacity: prog(t, 18.8) }}>
          <Label size={22}>앞쪽 여유 10 cm 가운데</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 400, height: 30, borderRadius: 8, background: C.green, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${22 * prog(t, 19, 0.9)}%`, background: C.red }} />
            </div>
            <span style={{ ...num(C.red, 26), fontWeight: 600 }}>2.2 ÷ 10 = 22% 가 사라진다</span>
          </div>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>다리와 허리가 무게를 그만큼 뒤로 옮겨야 한다 · OmniH2O: 조작과 보행을 함께 안정하게 하려면 상체와 하체를 한꺼번에 조율해야 한다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- retargeting ----------

function Retarget() {
  const t = useSec()
  const cols = [190, 450, 710]
  const sy = 250 // shoulder y
  const figure = (cx: number, sw: number, hands: number, elbowIn: number, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <circle cx={cx} cy={sy - 60} r={26} fill="none" stroke={color} strokeWidth={4} />
      <line x1={cx} y1={sy - 34} x2={cx} y2={sy + 170} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1={cx - sw} y1={sy} x2={cx + sw} y2={sy} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1={cx} y1={sy + 170} x2={cx - 30} y2={sy + 300} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1={cx} y1={sy + 170} x2={cx + 30} y2={sy + 300} stroke={color} strokeWidth={6} strokeLinecap="round" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <line x1={cx + s * sw} y1={sy} x2={cx + s * (sw - elbowIn)} y2={sy + 90} stroke={color} strokeWidth={5} strokeLinecap="round" />
          <line x1={cx + s * (sw - elbowIn)} y1={sy + 90} x2={cx + s * hands} y2={sy + 90} stroke={color} strokeWidth={5} strokeLinecap="round" />
          <circle cx={cx + s * hands} cy={sy + 90} r={8} fill={color} />
        </g>
      ))}
    </g>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={250} at={0.5} title={<Head color={C.accent}>motion capture → AMASS (SMPL 형식)</Head>}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Chip at={0.9} mono>
            346 명
          </Chip>
          <Chip at={1.4} mono>
            동작 11,451 개
          </Chip>
          <Chip at={1.9} mono>
            42 시간
          </Chip>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.9) }}>SMPL: 체형은 숫자 10 개 (β), 자세는 관절 24 개의 회전 (24 × 3), 이 둘로 꼭짓점 6,890 개의 몸 표면을 만든다</span>
      </Box>
      <Box x={64} y={420} w={860} h={460} at={6.3} title={<Head color={C.accent}>retargeting · 사람 동작 → 로봇이 할 수 있는 관절 값</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gap: 2, opacity: prog(t, 12.3) }}>
            <span style={{ ...line(C.blue, 25), fontWeight: 600 }}>관절 각도 복사 · ExBody · HumanPlus</span>
            <span style={line(C.muted, 21)}>엉덩이 · 무릎 · 어깨 · 팔꿈치 각도를 로봇의 같은 관절에 그대로 넣는다</span>
          </div>
          <div style={{ display: 'grid', gap: 2, opacity: prog(t, 13.5) }}>
            <span style={{ ...line(C.green, 25), fontWeight: 600 }}>keypoint 위치 맞추기 · H2O · ASAP</span>
            <span style={line(C.muted, 21)}>발목 · 팔꿈치 · 손목 등 대응점 12 개가 가까워지는 로봇 각도를 gradient descent 로 찾는다 (frame 마다)</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
          {[
            ['손이 안쪽으로', '0.18 × 0.75 = 0.135 m', '0.22 m', 18.6],
            ['몸 중심에서', '0.22 − 0.135 = 0.085 m', '0 m', 20.2],
            ['두 손 사이', '0.085 × 2 = 0.17 m', '0 m · 손바닥이 닿는다', 24.8],
          ].map(([k, a, b, at]) => (
            <div key={k as string} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={{ ...line(C.muted, 22), width: 130 }}>{k as string}</span>
              <span style={{ ...num(C.blue, 23), width: 330 }}>{a as string}</span>
              <span style={num(C.green, 23)}>{b as string}</span>
            </div>
          ))}
        </div>
      </Box>
      <Panel x={956} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.5)}>
            정면에서 본 박수 동작 · 사람과 로봇은 뼈대가 다르다
          </text>
          <text x={870} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.5)}>
            모식도 · 예로 든 값
          </text>
          {['사람 (reference)', '관절 각도 복사', 'keypoint 위치 맞추기'].map((h, i) => (
            <text key={h} x={cols[i]} y={110} textAnchor="middle" fill={[C.text, C.blue, C.green][i]} fontSize={23} fontWeight={600} opacity={prog(t, [1, 18.6, 24.8][i])}>
              {h}
            </text>
          ))}
          {/* human: shoulders ±0.18 m (72 px at 400 px/m), hands meet at the centre */}
          {figure(cols[0], 72, 0, 0, C.text, 1)}
          {/* robot, angles copied: shoulders ±0.22 m (88 px), forearm 0.75 × 0.18 = 0.135 m (54 px) → hands at ±34 px */}
          {figure(cols[1], 88, 34, 0, C.blue, 18.6)}
          {/* robot, keypoints matched: angles re-solved so the hands meet */}
          {figure(cols[2], 88, 0, 40, C.green, 24.8)}
          <g opacity={prog(t, 1.6)}>
            <text x={cols[0]} y={sy + 340} textAnchor="middle" fill={C.muted} fontSize={21}>
              어깨 ±0.18 m
            </text>
            <text x={cols[0]} y={sy + 366} textAnchor="middle" fill={C.muted} fontSize={21}>
              손은 어깨보다 0.18 m 안쪽
            </text>
            <text x={cols[0]} y={sy + 398} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              두 손이 몸 중심에서 만난다
            </text>
          </g>
          <g opacity={prog(t, 19.2)}>
            <line x1={cols[1] - 34} x2={cols[1] + 34} y1={sy + 112} y2={sy + 112} stroke={C.red} strokeWidth={5} />
            <text x={cols[1] + 44} y={sy + 120} fill={C.red} fontSize={22} fontWeight={700}>
              0.17 m
            </text>
            <text x={cols[1]} y={sy + 340} textAnchor="middle" fill={C.muted} fontSize={21}>
              어깨 ±0.22 m
            </text>
            <text x={cols[1]} y={sy + 366} textAnchor="middle" fill={C.muted} fontSize={21}>
              팔 길이 0.75 배
            </text>
            <text x={cols[1]} y={sy + 398} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              박수가 허공을 친다
            </text>
          </g>
          <g opacity={prog(t, 25.4)}>
            <text x={cols[2]} y={sy + 340} textAnchor="middle" fill={C.muted} fontSize={21}>
              어깨 ±0.22 m
            </text>
            <text x={cols[2]} y={sy + 366} textAnchor="middle" fill={C.muted} fontSize={21}>
              각도를 다시 찾음
            </text>
            <text x={cols[2]} y={sy + 398} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              두 손 사이 0 m
            </text>
          </g>
          <text x={30} y={692} fill={C.muted} fontSize={21} opacity={prog(t, 26.5)}>
            H2O 는 먼저 기본 자세에서 대응점 12 개가 가장 가까워지는 사람 체형 β′ 을 찾고,
          </text>
          <text x={30} y={720} fill={C.muted} fontSize={21} opacity={prog(t, 26.5)}>
            동작마다 그 체형의 점들에 로봇을 맞췄다 · ASAP 도 같은 두 단계를 썼다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

function Filter() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.5} title={<Head color={C.accent}>sim-to-data · simulation 으로 동작 거르기 (H2O)</Head>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Chip at={0.8} color={C.red}>
            옆돌기
          </Chip>
          <Chip at={1.2} color={C.red}>
            다리 길이보다 넓은 보폭
          </Chip>
          <Chip at={1.6} color={C.muted}>
            바닥에 앉기 → 규칙으로 먼저 지움
          </Chip>
        </div>
        <Flow steps={['① privileged imitator 학습', '② 못 따라 한 동작 지움', '③ 남은 동작으로 실제 policy 학습']} color={C.green} at={6.8} gap={0.6} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 9) }}>privileged = 모든 link 의 위치 · 속도 (실제 로봇은 못 얻음) → 따라 하기 성능의 상한</span>
      </Box>
      <Box x={976} y={140} w={880} h={320} at={6.8} title={<Head color={C.accent}>남는 동작 수 (H2O)</Head>}>
        <div style={{ display: 'grid', gap: 14, marginTop: 6 }}>
          <Bar label="AMASS 원본" value={13000} max={13000} color={C.muted} at={7} width={220} fmt="약 13,000" labelW={230} />
          <Bar label="규칙 필터 뒤" value={10000} max={13000} color={C.blue} at={14.2} width={220} fmt="약 10,000" labelW={230} sub="10 ÷ 13 ≈ 77%" />
          <Bar label="privileged imitator 뒤" value={8500} max={13000} color={C.green} at={15.6} width={220} fmt="약 8,500" labelW={230} sub="8.5 ÷ 13 ≈ 65%" />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18) }}>ExBody2 는 하체 추적 오차가 기준값 이하인 동작만 남겼다 · 너무 작으면 쉬운 동작만, 너무 크면 할 수 없는 동작이 섞여 중간 기준값이 가장 좋았다</span>
      </Box>
      <Box x={64} y={500} w={880} h={380} at={20.3} title={<Head color={C.accent}>거르지 않은 10,000 개 전체로 평가한 성공률</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="거른 약 8,500 개로 학습" value={72.5} max={100} color={C.green} at={20.6} width={240} unit="%" labelW={250} />
          <Bar label="10,000 개 전체로 학습" value={67.9} max={100} color={C.red} at={21.6} width={240} unit="%" labelW={250} />
        </div>
        <span style={{ ...num(C.accent, 26), fontWeight: 600, opacity: prog(t, 23) }}>72.5 − 67.9 = 4.6%p · 데이터가 더 적은데도 높다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24.5) }}>성공 = reference 와 몸 link 들의 평균 거리가 한 번도 0.5 m 를 넘지 않음 · 학습 때 보지 못한 동작에서도 더 잘 버텼다</span>
      </Box>
      <Appear at={24.6} style={{ position: 'absolute', left: 976, top: 486, width: 880 }}>
        <Misconception at={24.6} belief="mocap 데이터는 많을수록 좋으니 retargeting 한 동작을 모두 넣는다" fact="거른 약 8,500 개로 학습한 policy 가 10,000 개 전체보다 4.6%p 높았다" />
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- reward ----------

function Reward() {
  const t = useSec()
  const terms: [string, string, string, string, number][] = [
    ['자세', '관절마다 회전 차이(rad)의 제곱 합', '2', '0.65', 6.8],
    ['관절 속도', '관절마다 각속도 차이의 제곱 합', '0.1', '0.1', 7.3],
    ['손발 위치', '두 손 · 두 발 위치 차이(m)의 제곱 합', '40', '0.15', 7.8],
    ['무게중심', '무게중심 위치 차이(m)의 제곱', '10', '0.1', 8.3],
  ]
  const rows: [string, string, string, string, string, number, boolean][] = [
    ['자세', '0.65 × e^(−2 × 0.05)', '0.5881', '0.5881', '0.5881', 13.2, false],
    ['관절 속도', '0.1 × e^(−0.1 × 1.0)', '0.0905', '0.0905', '0.0905', 13.6, false],
    ['손발 위치', '0.15 × e^(−40 × 오차²)', '0.15', '0.1005', '0.0303', 14, true],
    ['무게중심', '0.1 × e^(−10 × 0.0009)', '0.0991', '0.0991', '0.0991', 14.4, false],
    ['reward', '합', '0.9277', '0.8783', '0.8080', 19.3, true],
  ]
  const cell = (w: number, color = C.text, bold = false): React.CSSProperties => ({ width: w, fontFamily: MONO, fontSize: 23, color, fontWeight: bold ? 600 : 400, whiteSpace: 'nowrap', textAlign: 'right' })
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={290} at={0.5} title={<Head color={C.accent}>motion tracking policy 의 입력과 출력</Head>}>
        <Flow steps={['관절 상태 + 몸통 IMU', 'reference 의 다음 frame', 'policy', '관절 목표 각도', 'PD → torque']} color={C.blue} at={0.8} gap={0.35} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 3.2) }}>보행 policy 의 속도 명령 자리에 다음 순간의 목표 자세가 온다 · DeepMimic (2018) 은 진행 정도 phase 0 ~ 1 도 넣었다</span>
      </Box>
      <Box x={64} y={460} w={880} h={420} at={6.3} title={<Head color={C.accent}>DeepMimic 의 네 항목 · 점수 e^(−k × 오차²) × weight</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <span style={{ ...line(C.dim, 20), width: 110 }}>항목</span>
            <span style={{ ...line(C.dim, 20), flex: 1 }}>오차</span>
            <span style={{ ...cell(70, C.dim) }}>k</span>
            <span style={{ ...cell(90, C.dim) }}>weight</span>
          </div>
          {terms.map(([n, e, k, w, at]) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...line(C.text, 23), width: 110, fontWeight: 600 }}>{n}</span>
              <span style={{ ...line(C.muted, 21), flex: 1 }}>{e}</span>
              <span style={cell(70, C.orange, true)}>{k}</span>
              <span style={cell(90, C.green, true)}>{w}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 15.5) }}>점수는 오차 0 에서 1 이고 커질수록 0 에 가까워진다 · m 단위 손발 오차는 작은 숫자라서 k 가 40 처럼 커야 몇 cm 차이가 점수에 보인다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 21) }}>H2O 는 관절과 link 를 따라 하는 항목 6 개에 torque 한계 · action 변화 · 발 미끄러짐 penalty 를 더했다</span>
      </Box>
      <Panel x={976} y={140} w={880} h={420} style={{ opacity: prog(t, 6.3) }}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 8 }}>
          <Head color={C.orange} size={25}>
            예: 오른손만 reference 에서 벗어날 때 (나머지 오차는 예로 든 값)
          </Head>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 4 }}>
            <span style={{ ...line(C.dim, 20), width: 110 }}>항목</span>
            <span style={{ ...line(C.dim, 20), flex: 1 }}>weight × 점수</span>
            <span style={cell(110, C.dim)}>손 오차 0</span>
            <span style={cell(110, C.dim)}>10 cm</span>
            <span style={cell(110, C.dim)}>20 cm</span>
          </div>
          {rows.map(([n, f, a, b, c, at, hi], i) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, n === 'reward' ? at : 6.8 + i * 0.4), padding: hi ? '6px 0' : 0, borderTop: n === 'reward' ? `1.5px solid ${C.cardEdge}` : undefined }}>
              <span style={{ ...line(hi ? C.orange : C.text, 23), width: 110, fontWeight: 600 }}>{n}</span>
              <span style={{ ...num(C.muted, 20), flex: 1 }}>{f}</span>
              <span style={{ ...cell(110, hi ? C.orange : C.text, hi), opacity: prog(t, at) }}>{a}</span>
              <span style={{ ...cell(110, hi ? C.orange : C.text, hi), opacity: prog(t, at) }}>{b}</span>
              <span style={{ ...cell(110, hi ? C.orange : C.text, hi), opacity: prog(t, at) }}>{c}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 19.8) }}>손 오차 2 배 → 오차² 4 배 → 손발 점수 0.1005 → 0.0303 (3 분의 1 이하) · 자세 0.05, 속도 1.0, 무게중심 0.03 m 는 예로 든 오차</span>
        </div>
      </Panel>
      <Box x={976} y={590} w={880} h={290} at={25.3} title={<Head color={C.accent}>조기 종료와 reference state initialization (RSI)</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.6) }}>
          <span style={{ color: C.red, fontWeight: 600 }}>조기 종료</span> · 몸통이나 머리가 바닥에 닿으면 episode 끝 (DeepMimic) · H2O 는 link 평균 거리 0.5 m · ASAP 은 1.5 m 에서 0.3 m 로 좁힘
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 27.4) }}>
          <span style={{ color: C.green, fontWeight: 600 }}>RSI</span> · episode 마다 reference 의 무작위 시점 자세 · 속도에서 시작 · 없으면 뒤공중제비 대신 뒤로 작게 뛰기만 배웠다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- teacher → student ----------

function Student() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string, color: string, at: number, lines: string[]) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + 22} y={y + 40} fill={color} fontSize={27} fontWeight={700}>
        {title}
      </text>
      {lines.map((s, i) => (
        <text key={s} x={x + 22} y={y + 76 + i * 30} fill={C.text} fontSize={21}>
          {s}
        </text>
      ))}
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            OmniH2O · privileged teacher → student
          </text>
          <g opacity={prog(t, 0.6)}>
            <text x={30} y={86} fill={C.red} fontSize={21} fontWeight={600}>
              실제 로봇에 있는 것: 몸통 IMU + 관절 encoder · 몸통의 linear velocity 는 없다
            </text>
            <text x={30} y={114} fill={C.muted} fontSize={21}>
              H2O 는 mocap 시스템으로 로봇 속도를 재야 했다 · VR 헤드셋이 주는 목표도 머리 · 두 손 3 점의 위치뿐
            </text>
          </g>
          {node(30, 150, 440, 200, 'teacher · PPO', C.purple, 6.3, ['모든 link 의 위치 · 회전 · 속도', '전신 link 의 reference 와 그 차이', '직전 action', '입력 913 개 · simulation 안에서만'])}
          {node(530, 150, 440, 290, 'student · DAgger', C.accent, 12.8, ['지금 상태 90 개: 관절 각도 19 · 속도 19', '몸통 각속도 3 · 중력 방향 3', '머리 · 두 손 3 점 목표 27 · 직전 action 19', '이력: 지난 25 step × 63 = 1,575 개', '합 90 + 1,575 = 1,665 개 · 로봇에 올린다'])}
          <g opacity={prog(t, 13.6)}>
            <line x1={470} y1={250} x2={528} y2={250} stroke={C.green} strokeWidth={3} />
            <circle cx={528} cy={250} r={6} fill={C.green} />
            <text x={499} y={232} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={600}>
              정답
            </text>
          </g>
          <g opacity={prog(t, 15.2)}>
            <text x={30} y={482} fill={C.text} fontSize={22}>
              student 가 simulation 에서 직접 움직이고, 지나간 상태마다 teacher 가 낼 action 을 정답으로 삼는다
            </text>
            <text x={30} y={514} fill={C.muted} fontSize={22} fontFamily={MONO}>
              loss = ‖a_teacher − a_student‖²
            </text>
            <text x={30} y={552} fill={C.muted} fontSize={21}>
              linear velocity 가 입력에 없어서, student 는 지난 25 step 의 관절 · IMU 값 변화에서 그 속도를 짐작한다
            </text>
          </g>
          <g opacity={prog(t, 28)}>
            <rect x={30} y={600} width={940} height={116} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={50} y={636} fill={C.orange} fontSize={22} fontWeight={600}>
              ASAP · SONIC: asymmetric actor-critic
            </text>
            <text x={50} y={668} fill={C.muted} fontSize={21}>
              PPO 의 critic 에만 privileged 정보를 주고 actor 에는 실제 센서값만 준다
            </text>
            <text x={50} y={698} fill={C.muted} fontSize={21}>
              로봇에는 actor 만 올라가므로 teacher → student 단계가 필요 없다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={400} at={19.3} title={<Head color={C.accent} size={25}>simulation 성공률 · 1 만 4 천 개 동작</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="teacher · PPO" value={94.77} max={100} color={C.purple} at={19.6} width={220} unit="%" labelW={230} />
          <Bar label="student · DAgger" value={94.1} max={100} color={C.accent} at={20.4} width={220} fmt="94.10" unit="%" labelW={230} sub="이력 25 step" />
          <Bar label="같은 입력 · PPO" value={47.11} max={100} color={C.red} at={22.2} width={220} unit="%" labelW={230} sub="1,665 개" />
          <Bar label="이력 없이 · PPO" value={90.62} max={100} color={C.orange} at={23.4} width={220} unit="%" labelW={230} />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 22.6) }}>입력이 길어지면 PPO 는 그 복잡함을 감당하지 못하고, 정답 action 을 바로 주는 supervised learning 은 긴 이력을 잘 쓴다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24.2) }}>simulation 에서는 이력의 효과가 작아 보인다 (90.62% 대 94.10%)</span>
      </Box>
      <Box x={1096} y={570} w={760} h={310} at={25.3} title={<Head color={C.accent}>실제 로봇 · 서 있는 동작 20 개의 전역 위치 오차</Head>}>
        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <Bar label="이력 없는 student" value={83.26} max={100} color={C.red} at={25.6} width={200} unit=" mm" labelW={230} />
          <Bar label="25 step 이력 student" value={47.94} max={100} color={C.green} at={26.8} width={200} unit=" mm" labelW={230} />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 28) }}>실제 로봇에서는 이력이 오차를 거의 반으로 줄였다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- delta action ----------

function Delta() {
  const t = useSec()
  const steps: [string, number][] = [
    ['① simulation 에서 motion tracking policy 를 학습한다', 3.6],
    ['② 그 policy 를 실제 G1 에 올려 동작을 시키고, 관절 값과 mocap 으로 잰 몸통 위치 · 속도를 기록한다', 4.3],
    ['③ simulation 을 실제 기록의 상태에서 시작해 기록한 action 에 Δa 를 더해 진행 · 다음 상태가 실제와 가까울수록 reward → delta action model 을 PPO 로 학습', 6.8],
    ['④ delta action model 을 고정해 simulation 에 넣고 policy 를 fine-tuning · 실제 로봇에는 policy 만 올린다 (Δa 없이)', 8.2],
  ]
  const rows: [string, string, string, string, string, number][] = [
    ['① sim 학습', '0.10', '없음', 'sim 0.10 · 실제 0.06', '실제 = 0.10 × 0.6 = 0.06 (명령의 60%)', 13.5],
    ['③ Δa 학습', '0.10', '−0.04', '고친 sim 0.06', 'Δa = 0.06 − 0.10 = −0.04 → 실제 기록과 같다 · Δa = −0.4 × a', 15],
    ['④ fine-tuning', '0.167', '−0.067', '고친 sim 0.10', 'action 0.10 ÷ 0.6 ≈ 0.167 · Δa = −0.4 × 0.167 ≈ −0.067', 19.8],
    ['배포', '0.167', '없음', '실제 0.10', '0.167 × 0.6 ≈ 0.10 = reference · 차이는 실제 몸이 이미 만든다', 22.2],
  ]
  const cw = [150, 110, 120, 240]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={300} at={0.5} title={<Head color={C.accent}>H2O 의 domain randomization 범위</Head>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Chip at={0.8} color={C.muted} mono>
            마찰 계수 0.2 ~ 1.1
          </Chip>
          <Chip at={1.1} color={C.muted} mono>
            link 질량 0.7 ~ 1.3 배
          </Chip>
          <Chip at={1.4} color={C.muted} mono>
            PD gain 0.75 ~ 1.25 배
          </Chip>
          <Chip at={1.7} color={C.muted} mono>
            제어 지연 20 ~ 60 ms
          </Chip>
        </div>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 3) }}>ASAP: 범위를 넓힐수록 조심스러운 policy 가 되어 멀리뛰기 같은 민첩한 동작을 막는다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 4.4) }}>system identification (SysID) 은 미리 정해 둔 parameter 밖의 차이를 잡지 못한다</span>
      </Box>
      <Panel x={976} y={140} w={880} h={380} style={{ opacity: prog(t, 3.4) }}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 10 }}>
          <div>
            <Head color={C.accent}>ASAP 의 네 단계 · delta action model Δa = π^Δ(s, a)</Head>
          </div>
          {steps.map(([s, at]) => (
            <span key={s} style={{ ...line(C.text, 21), opacity: prog(t, at) }}>
              {s}
            </span>
          ))}
        </div>
      </Panel>
      <Box x={64} y={470} w={880} h={410} at={13.3} title={<Head color={C.orange}>예로 든 발목 · 명령의 60% 만 움직인다 · reference 0.10 rad</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {['단계', 'action', 'Δa', '발목의 움직임'].map((h, i) => (
              <span key={h} style={{ ...line(C.dim, 20), width: cw[i] }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([s, a, d, r, sub, at]) => (
            <div key={s} style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ ...line(C.text, 22), width: cw[0], fontWeight: 600 }}>{s}</span>
                <span style={{ ...num(C.orange, 23), width: cw[1] }}>{a}</span>
                <span style={{ ...num(d === '없음' ? C.dim : C.purple, 23), width: cw[2] }}>{d}</span>
                <span style={{ ...num(C.green, 23), width: cw[3] }}>{r}</span>
              </div>
              <span style={{ ...num(C.muted, 20) }}>{sub}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={976} y={550} w={880} h={330} at={25.8} title={<Head color={C.accent} size={25}>IsaacGym 을 IsaacSim 기록에 맞춰 1 초 재생 · 전역 관절 위치 오차</Head>}>
        <div style={{ display: 'grid', gap: 4 }}>
          <Bar label="고치지 않음" value={80.8} max={90} color={C.muted} at={26} width={240} unit=" mm" labelW={200} />
          <Bar label="SysID" value={77.6} max={90} color={C.orange} at={26.6} width={240} unit=" mm" labelW={200} />
          <Bar label="delta dynamics" value={68.1} max={90} color={C.blue} at={27.2} width={240} unit=" mm" labelW={200} sub="다음 상태에 더할 차이" />
          <Bar label="delta action" value={37.9} max={90} color={C.green} at={27.8} width={240} unit=" mm" labelW={200} />
        </div>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 29) }}>실제 G1 공 차기 61.2 → 50.2 mm · 학습에 안 쓴 동작 159 → 112 mm · 발목 관절 4 개만 고쳐 기록 100 개로 충분 (23 개 전체면 400 개 넘게 · G1 두 대가 과열로 망가짐)</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- VLA 아래의 WBC ----------

function Layers() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string, rate: string, color: string, at: number, lines: string[]) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + 22} y={y + 38} fill={color} fontSize={26} fontWeight={700}>
        {title}
      </text>
      <text x={x + w - 22} y={y + 38} textAnchor="end" fill={color} fontSize={24} fontFamily={MONO} fontWeight={600}>
        {rate}
      </text>
      {lines.map((s, i) => (
        <text key={s} x={x + 22} y={y + 70 + i * 28} fill={C.text} fontSize={21}>
          {s}
        </text>
      ))}
    </g>
  )
  const arrow = (y1: number, y2: number, label: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <line x1={120} y1={y1} x2={120} y2={y2 - 4} stroke={color} strokeWidth={3} />
      <polygon points={`112,${y2 - 10} 128,${y2 - 10} 120,${y2 + 2}`} fill={color} />
      <text x={146} y={(y1 + y2) / 2 + 8} fill={color} fontSize={22} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            SONIC 실험의 층 구조 · 위층은 느리게 넓은 범위를 판단하고, 아래층은 자주 계산한다
          </text>
          {node(30, 70, 940, 100, 'VLA (GR00T N1.5)', '주기: 논문에 없음', C.purple, 0.6, ['사진 · 지시문을 읽고 손과 몸이 어디로 가야 할지 정한다 · 수십 ms 걸려 action 덩어리를 만든다'])}
          {arrow(170, 236, 'motion token 64 개 숫자 + 손가락 관절 14 개 = 78 개 숫자', C.purple, 6.8)}
          {node(30, 240, 940, 128, 'whole-body controller (SONIC)', '1 초에 50 번', C.accent, 0.9, ['token + 로봇 상태 → 관절 29 개의 목표 각도', '그동안 몸이 밀리거나 미끄러져도 50 번 균형을 다시 잡는다'])}
          {arrow(368, 434, '최신 목표 각도', C.accent, 13.8)}
          {node(30, 438, 940, 100, 'command writer', '1 초에 500 번', C.orange, 13.9, ['controller 의 목표 하나를 500 ÷ 50 = 10 번 로봇의 관절 PD 로 보낸다'])}
          {arrow(538, 592, 'torque', C.orange, 14.8)}
          {node(30, 596, 940, 56, '로봇 관절의 PD controller (G1 내장)', '', C.muted, 14.9, [])}
          <g opacity={prog(t, 16)}>
            <text x={30} y={678} fill={C.muted} fontSize={20}>
              policy 한 번 계산: Jetson Orin 에서 1 ~ 2 ms
            </text>
            <text x={30} y={701} fill={C.muted} fontSize={20}>
              조이스틱 · VR 3 점 입력: kinematic planner 가 1 초에 10 번 reference 를 만든다
            </text>
            <text x={30} y={724} fill={C.muted} fontSize={20}>
              GR00T N1.5 · N1.6 의 Decoupled WBC 는 하체 RL + 상체 IK · SONIC 은 전신 motion tracking
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={300} at={20.8} title={<Head color={C.accent}>VLA 의 출력 공간 · 세 작업 평균 성공률</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="motion token 78 개" value={68} max={100} color={C.green} at={21} width={200} unit="%" labelW={250} />
          <Bar label="SMPL 자세 81 개" value={27} max={100} color={C.red} at={21.8} width={200} unit="%" labelW={250} />
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 23) }}>캔을 집어 쓰레기통까지 걸어가 던져 넣는 가장 복잡한 작업: <span style={num(C.green, 22)}>60%</span> 와 <span style={num(C.red, 22)}>0%</span></span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24.2) }}>연속값 자세 공간은 작은 예측 오차가 큰 추적 실패로 번지고, 정해진 값만 갖는 token 공간은 배우기 쉽다</span>
      </Box>
      <Appear at={24.6} style={{ position: 'absolute', left: 1096, top: 470, width: 760 }}>
        <Misconception at={24.6} belief="humanoid 용 VLA 는 관절 29 개의 목표 각도를 직접 낸다" fact="VLA 는 token 과 손 관절만 내고, 관절 목표는 controller 가 1 초에 50 번 낸다" />
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '35 kg G1 도 한 발로는 28.6 N 에 넘어간다 → 발을 내디뎌 균형', at: 1 },
    { tag: script.sections[1], color: C.blue, text: '각도 복사는 손이 0.17 m 어긋남 · sim-to-data 약 10,000 → 8,500 개', at: 4.5 },
    { tag: script.sections[2], color: C.orange, text: 'e^(−k × 오차²) 점수의 합 · student 1,665 개 입력 → 94.10%', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'delta action 80.8 → 37.9 mm · token 64 개 → 1 초에 50 번 관절 목표', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            관절 23 개의 G1 에게 무엇을 목표로 주고, 무엇으로 reward 를 줄까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 34, fontWeight: 600, whiteSpace: 'nowrap' }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>VLA + RL · World Model</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            시연으로 학습한 VLA 를 작업 성공 reward 로 다시 학습하기 · 다음 장면을 예측해 행동을 미리 비교하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Humanoid Whole-Body Control
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap/#/p/humanoid-wbc
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseBalance = () => (
  <PauseWrite
    question="35 kg G1 이 두 발로 서서 앞쪽 여유가 0.1 m 인데, 2 kg 상자를 몸 앞 0.5 m 에 든다. 무게중심은 얼마나 옮겨 가고, 여유는 얼마나 남을까?"
    answer={
      <>
        2 × 0.5 ÷ (35 + 2) = 1 ÷ 37 ≈ 0.027 m, 약 2.7 cm 앞으로
        <br />
        남은 여유 0.1 − 0.027 = 0.073 m, 약 7.3 cm
      </>
    }
  />
)

const PauseRetarget = () => (
  <PauseWrite
    question="박수 예에서 로봇의 팔 길이가 사람의 0.6 배라면, 관절 각도를 복사했을 때 두 손 사이는 얼마나 떨어질까? 어깨는 사람 0.18 m, 로봇 0.22 m 그대로."
    answer={
      <>
        안쪽으로 0.18 × 0.6 = 0.108 m · 중심에서 0.22 − 0.108 = 0.112 m
        <br />
        두 손 사이 0.112 × 2 = 0.224 m, 약 22 cm · 팔이 짧을수록 각도 복사의 오차가 커진다
      </>
    }
  />
)

const PauseStudent = () => (
  <PauseWrite
    question="OmniH2O 의 student 는 지금 상태 90 개와 step 마다 63 개의 이력을 받는다. 이력을 5 step 만 받으면 입력은 몇 개? 50 step 이면?"
    answer={
      <>
        5 step: 90 + 5 × 63 = 405 개 · 50 step: 90 + 50 × 63 = 3,240 개
        <br />
        저자들은 25 step (1,665 개) 이 성능과 학습 효율의 균형이 가장 좋다고 보았다
      </>
    }
  />
)

const PauseWbc = () => (
  <PauseWrite
    question="whole-body controller 가 1 초에 50 번, command writer 가 1 초에 500 번 계산한다. controller 의 목표 하나를 command writer 는 몇 번 보낼까? VLA 가 덩어리 하나에 0.2 초 걸리면 그동안 controller 는 몇 번 계산할까?"
    answer={
      <>
        command writer: 500 ÷ 50 = 10 번 · controller: 한 번에 1 ÷ 50 = 0.02 초라서 0.2 ÷ 0.02 = 10 번
        <br />
        VLA 의 새 출력을 기다리는 동안에도 마지막 token 으로 균형을 계속 잡는다
      </>
    }
  />
)

export function HumanoidWbc() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        balance: Balance,
        arm: Arm,
        'pause-balance': PauseBalance,
        retarget: Retarget,
        filter: Filter,
        'pause-retarget': PauseRetarget,
        reward: Reward,
        student: Student,
        'pause-student': PauseStudent,
        delta: Delta,
        layers: Layers,
        'pause-wbc': PauseWbc,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
