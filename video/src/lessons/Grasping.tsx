import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './grasping.narration.json'
import { script } from './grasping.script'

// Numbers follow lessons/grasping/README.md (see grasping.script.ts). The gripper, cone, hull and pipeline drawings are
// schematic (marked 모식도); every number on screen is the lesson's.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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


const tx = (color: string, size = 22, weight = 600) => ({ fill: color, fontSize: size, fontWeight: weight })

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GRASPING · GRASP PLANNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Grasp Planning</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            물체의 <span style={{ color: C.accent }}>어디를 · 어느 방향으로 · 얼마나 벌려</span> 쥘까
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            쥐어 보기 전에 계산으로 정하는 손가락의 자리
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
  const rows: [string, string, string, number][] = [
    ['✓', C.green, '상자: 위에서 내려가 마주 보는 두 면을 쥐면 집힌다', 0.9],
    ['✕', C.red, '둥근 과일 · 누운 컵: 닫는 순간 옆으로 밀려 빠져나간다', 1.8],
    ['✕', C.red, '들어 올리는 동안 손가락 사이에서 돌아 떨어진다', 2.7],
  ]
  const cx = 560
  const cy = 170
  const r = 70
  const ly = cy - 35
  const dx = Math.sqrt(r * r - 35 * 35)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={820} height={330}>
          <g opacity={prog(t, 0.5)}>
            <rect x={110} y={110} width={120} height={120} rx={6} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2.5} />
            <rect x={82} y={130} width={26} height={80} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={232} y={130} width={26} height={80} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={170} y={290} textAnchor="middle" {...tx(C.green, 22)}>
              한 변 5 cm 상자 ✓
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <circle cx={cx} cy={cy} r={r} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2.5} />
            <line x1={cx - dx} y1={ly} x2={cx} y2={cy} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <line x1={cx + dx} y1={ly} x2={cx} y2={cy} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <rect x={cx - dx - 27} y={ly - 20} width={25} height={40} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={cx + dx + 2} y={ly - 20} width={25} height={40} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            {arrow(cx, cy + 20, cx, cy + 95, C.red, 4, 14, prog(t, 2))}
            <text x={cx} y={300} textAnchor="middle" {...tx(C.red, 22)}>
              둥근 과일 · 밀려 나감 ✕
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 860, top: 34, width: 900, display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            같은 규칙으로 쥐었을 때
          </Label>
          {rows.map(([m, color, s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color, fontSize: 28, fontWeight: 700 }}>{m}</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          손가락을 <span style={{ color: C.accent }}>어디에, 어느 방향으로</span> 대야 미끄러지지 않을까?
        </div>
      </Appear>
      <Card x={64} y={630} w={1792} h={250} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 5.8) }}>
          <Label size={22}>UC Berkeley 의 Dex-Net 2.0 (2017) · 계산으로 만든 데이터로 학습한 network 가 depth image 한 장에서 grasp 를 고른다</Label>
          <div style={{ display: 'flex', gap: 60 }}>
            {(
              [
                ['670 만 개', '합성 데이터로 학습', C.blue, 6],
                ['0.8 초', 'grasp 하나를 고르는 시간', C.orange, 6.5],
                ['93%', '쥐기 까다로운 물체 8 개', C.green, 7],
              ] as const
            ).map(([v, s, color, at]) => (
              <div key={v} style={{ width: 520, display: 'grid', gap: 4, opacity: prog(t, at) }}>
                <span style={{ fontFamily: MONO, fontSize: 64, fontWeight: 600, color }}>{v}</span>
                <span style={line(C.muted, 24)}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. grasp 표현 · gripper ----------

function Repr() {
  const t = useSec()
  const legend: [string, string, string, number][] = [
    ['t', C.text, 'grasp 중심 · 두 손가락 끝 사이의 가운데', 0.6],
    ['a', C.orange, 'approach vector · 손이 물체로 다가가는 방향', 1.6],
    ['b', C.green, 'closing vector · 손가락이 닫히는 방향 (a 와 직각)', 2.6],
    ['w', C.blue, '폭 · 손가락 사이를 벌린 거리', 3.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <svg width={820} height={520}>
          <text x={30} y={44} {...tx(C.text, 26)} opacity={prog(t, 0.3)}>
            parallel-jaw gripper 의 grasp
          </text>
          <text x={790} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.4)}>
            <rect x={380} y={70} width={60} height={40} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={250} y={110} width={320} height={40} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={270} y={150} width={30} height={230} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={520} y={150} width={30} height={230} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={300} y={250} width={220} height={200} rx={6} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
          </g>
          <g opacity={prog(t, 0.6)}>
            <circle cx={410} cy={330} r={8} fill={C.text} />
            <text x={394} y={322} textAnchor="end" {...tx(C.text, 28)}>
              t
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            {arrow(410, 330, 410, 432, C.orange, 4, 14)}
            <text x={424} y={426} {...tx(C.orange, 28)}>
              a
            </text>
          </g>
          <g opacity={prog(t, 2.6)}>
            {arrow(410, 330, 506, 330, C.green, 4, 14)}
            <text x={492} y={314} {...tx(C.green, 28)}>
              b
            </text>
          </g>
          <g opacity={prog(t, 3.6)}>
            <line x1={302} y1={205} x2={518} y2={205} stroke={C.blue} strokeWidth={2.5} />
            <line x1={302} y1={195} x2={302} y2={215} stroke={C.blue} strokeWidth={2.5} />
            <line x1={518} y1={195} x2={518} y2={215} stroke={C.blue} strokeWidth={2.5} />
            <text x={410} y={192} textAnchor="middle" {...tx(C.blue, 28)}>
              w
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 540, width: 760, display: 'grid', gap: 8 }}>
          {legend.map(([k, color, s, at]) => (
            <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(color, 26), width: 24 }}>{k}</span>
              <span style={line(C.text, 22)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Box x={916} y={140} w={940} h={220} at={7} title={<Head color={C.accent}>숫자 7 개 = 위치 3 + 방향 3 + 폭 1</Head>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Chip at={7.4} color={C.text}>
            위치 t · 3
          </Chip>
          <Chip at={8.2} color={C.orange}>
            a, b → rotation · 3
          </Chip>
          <Chip at={9} color={C.blue}>
            폭 w · 1
          </Chip>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>위치와 방향이 6-DoF 라서 6-DoF grasp · AnyGrasp 는 폭까지 세어 7-DoF</span>
      </Box>
      <Box x={916} y={376} w={940} h={262} at={14} title={<Head color={C.green}>classical-pick 의 cube · top-down grasp</Head>}>
        <Table
          at={14.3}
          step={0.7}
          size={22}
          head={[]}
          widths={[60, 400, 380]}
          rows={[
            ['t', '(0.20, 0, 0.025) m', 'cube 가운데'],
            ['a', '(0, 0, −1)', '수직 아래로 다가감'],
            ['b', '(cos 10°, sin 10°, 0)', 'yaw 10° 방향으로 닫음'],
            ['w', '7 cm → 5 cm', '벌렸다가 cube 폭에서 멈춤'],
          ]}
        />
      </Box>
      <Box x={916} y={650} w={940} h={230} at={21} title={<Head color={C.orange}>planar grasp (Dex-Net 2.0) · 숫자 4 개</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.4) }}>
          depth image 의 pixel <span style={mono(C.orange, 23)}>(u, v)</span> · 각도 <span style={mono(C.orange, 23)}>φ</span> · gripper depth <span style={mono(C.orange, 23)}>z</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23) }}>a 를 수직 아래로 고정해 숫자가 적고 학습이 쉽다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.8) }}>선반 안의 책처럼 옆에서 쥐어야 하는 물체는 표현하지 못한다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Grippers() {
  const t = useSec()
  const col = (x: number, at: number, title: string, color: string, pic: ReactNode, lines: [string, number][]) => (
    <Box x={x} y={140} w={580} h={340} at={at} title={<Head color={color}>{title}</Head>} gap={10}>
      <svg width={520} height={130}>
        {pic}
      </svg>
      <div style={{ display: 'grid', gap: 6 }}>
        {lines.map(([s, a]) => (
          <span key={s} style={{ ...line(C.text, 22), opacity: prog(t, a) }}>
            {s}
          </span>
        ))}
      </div>
    </Box>
  )
  const finger = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
  return (
    <AbsoluteFill>
      {col(
        64,
        0.3,
        'parallel-jaw gripper',
        C.blue,
        <g>
          <rect x={200} y={30} width={120} height={80} rx={6} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
          {finger(170, 40, 28, 60)}
          {finger(322, 40, 28, 60)}
          {arrow(110, 70, 164, 70, C.blue, 3, 12)}
          {arrow(410, 70, 356, 70, C.blue, 3, 12)}
        </g>,
        [
          ['접촉 두 곳을 양쪽에서 눌러 마찰로 버팀', 0.8],
          ['Robotiq 2F-85 · 폭 85 mm · 20 ~ 235 N', 1.8],
        ],
      )}
      {col(
        664,
        6.5,
        'suction gripper',
        C.green,
        <g>
          <rect x={120} y={82} width={280} height={40} rx={6} fill={`${C.green}22`} stroke={C.green} strokeWidth={2} />
          <path d="M 222 82 L 298 82 L 284 50 L 236 50 Z" fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
          <rect x={252} y={8} width={16} height={42} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
          {arrow(340, 74, 340, 20, C.green, 3, 12)}
        </g>,
        [
          ['한 면을 밀폐하고 압력 차이로 당김', 7],
          ['Dex-Net 3.0 · 지름 15 mm 컵 · 최대 약 0.9 kg', 8.2],
        ],
      )}
      {col(
        1264,
        0.3,
        'multi-finger hand',
        C.purple,
        <g>
          <rect x={200} y={6} width={120} height={30} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
          <circle cx={260} cy={92} r={30} fill={`${C.purple}22`} stroke={C.purple} strokeWidth={2} />
          {[212, 240, 280, 308].map((x, i) => (
            <path key={x} d={`M ${x} 36 L ${x + (i < 2 ? -6 : 6)} 70 L ${x + (i < 2 ? 10 : -10)} 104`} fill="none" stroke={C.muted} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>,
        [
          ['여러 손가락으로 감싸거나 손끝으로 쥠', 2.6],
          ['Allegro Hand V3 · 4 × 4 = 16 관절', 3.6],
        ],
      )}
      <Box x={64} y={500} w={880} h={380} at={12.5} title={<Head color={C.green}>당기는 힘 = 압력 차이 ΔP × 컵 넓이 A</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 12.8) }}>지름 30 mm 컵 · 안의 압력을 대기압보다 60 kPa 낮춤</span>
        <span style={{ ...mono(C.text, 25), opacity: prog(t, 13.8) }}>A = π × 0.015² = 7.07 × 10⁻⁴ m²</span>
        <span style={{ ...mono(C.green, 25), opacity: prog(t, 15) }}>60,000 × 7.07 × 10⁻⁴ = 42.4 N</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.4) }}>seal (컵 테두리가 빈틈없이 붙은 상태) 이 깨지면 압력 차이와 힘이 함께 사라진다</span>
      </Box>
      <Box x={964} y={500} w={892} h={380} at={18.5} title={<Head color={C.orange}>Schmalz · 1 kg 을 5 m/s² 로 들어 올리기</Head>}>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 18.8) }}>윗면: m(g + a) × S = 1 × 14.81 × 1.5 = 22.2 N</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 24.7) }}>옆면: (m ÷ μ)(g + a) × S = 2 × 14.81 × 2 = 59.2 N</span>
        <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
          <Bar label="윗면 · S 1.5" value={22.2} max={65} color={C.green} at={20} width={360} labelW={230} unit=" N" />
          <Bar label="옆면 · μ 0.5, S 2" value={59.2} max={65} color={C.red} at={25} width={360} labelW={230} unit=" N" />
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 26.5) }}>
          42.4 N 컵으로 <span style={{ color: C.green }}>윗면 ✓</span> · <span style={{ color: C.red }}>옆면 ✕</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseSuction = () => (
  <PauseWrite
    question="지름 20 mm 컵에 압력 차이 50 kPa 를 만들면 몇 N 으로 당길까? 1 kg 을 천천히 들 때 안전율 1.5 를 지킬 수 있을까?"
    answer={
      <>
        A = π × 0.01² = 3.14 × 10⁻⁴ m² → 50,000 × 3.14 × 10⁻⁴ = 15.7 N
        <br />
        필요한 힘 1 × 9.81 × 1.5 = 14.7 N ≤ 15.7 N → 겨우 지킨다
      </>
    }
  />
)

// ---------- 2. 마찰 · antipodal ----------

function Cone() {
  const t = useSec()
  const o = { x: 430, y: 480 }
  const H = 300
  const half = H * 0.5
  const tip = (deg: number, len: number) => ({ x: o.x + len * Math.sin((deg * Math.PI) / 180), y: o.y - len * Math.cos((deg * Math.PI) / 180) })
  const g20 = tip(-20, 230)
  const r35 = tip(35, 230)
  // antipodal drawings, 50 px per cm
  const cyl = { x: 110, y: 75, r: 62 }
  const cdx = Math.sqrt(cyl.r * cyl.r - 31 * 31)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={540}>
          <text x={30} y={44} {...tx(C.text, 26)} opacity={prog(t, 0.3)}>
            friction cone · μ = 0.5
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <text x={30} y={88} fontFamily={MONO} {...tx(C.accent, 24)} opacity={prog(t, 0.8)}>
            T ≤ μN ⇔ 기운 각도 ≤ arctan μ
          </text>
          <g opacity={prog(t, 0.5)}>
            <rect x={120} y={o.y} width={620} height={26} fill={C.cardEdge} />
            <line x1={120} y1={o.y} x2={740} y2={o.y} stroke={C.muted} strokeWidth={2} />
            <text x={730} y={o.y + 20} textAnchor="end" fill={C.dim} fontSize={20}>
              물체 표면
            </text>
            <line x1={o.x} y1={o.y} x2={o.x} y2={150} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
            <text x={442} y={164} {...tx(C.muted, 22, 500)}>
              normal
            </text>
          </g>
          <g opacity={prog(t, 6.6)}>
            <polygon points={`${o.x},${o.y} ${o.x + half},${o.y - H} ${o.x - half},${o.y - H}`} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
            <text x={o.x + half + 10} y={o.y - H + 6} {...tx(C.blue, 22)}>
              반각 26.6°
            </text>
          </g>
          <g opacity={prog(t, 8.2)}>
            {arrow(o.x, o.y, g20.x, g20.y, C.green, 4, 14)}
            <text x={380} y={300} fontFamily={MONO} {...tx(C.green, 22)}>
              20°
            </text>
          </g>
          <g opacity={prog(t, 9.6)}>
            {arrow(o.x, o.y, r35.x, r35.y, C.red, 4, 14)}
            <text x={r35.x + 12} y={r35.y + 8} fontFamily={MONO} {...tx(C.red, 22)}>
              35°
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 556, width: 800, display: 'grid', gap: 16 }}>
          <Table at={10.5} size={22} head={['μ', '0.2', '0.3', '0.5', '1.0']} widths={[220, 120, 120, 120, 120]} rows={[['반각 arctan μ', '11.3°', '16.7°', '26.6°', '45°']]} />
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...mono(C.green, 22), opacity: prog(t, 8.4) }}>tan 20° = 0.36 ≤ 0.5 → 버팀</span>
            <span style={{ ...mono(C.red, 22), opacity: prog(t, 9.8) }}>tan 35° = 0.70 &gt; 0.5 → 세게 눌러도 미끄러짐</span>
          </div>
        </div>
      </Panel>
      <Box x={948} y={140} w={908} h={340} at={12.5} title={<Head color={C.accent}>antipodal grasp · 잇는 선이 양쪽 cone 안</Head>}>
        <svg width={840} height={190}>
          <g opacity={prog(t, 13)}>
            <rect x={60} y={30} width={250} height={120} rx={4} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
            <rect x={34} y={70} width={24} height={40} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={312} y={70} width={24} height={40} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <line x1={60} y1={90} x2={310} y2={90} stroke={C.green} strokeWidth={3} />
            <text x={185} y={180} textAnchor="middle" {...tx(C.green, 22)}>
              가운데 · 0°
            </text>
          </g>
          <g opacity={prog(t, 18.7)}>
            <rect x={490} y={30} width={250} height={120} rx={4} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
            <rect x={464} y={120} width={24} height={40} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <rect x={742} y={20} width={24} height={40} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <line x1={490} y1={140} x2={740} y2={40} stroke={C.orange} strokeWidth={3} />
            <text x={615} y={180} textAnchor="middle" {...tx(C.orange, 22)}>
              1 cm 씩 엇갈림 · 21.8°
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.5) }}>
          arctan(2 ÷ 5) = 21.8° · <span style={{ color: C.green }}>μ 0.5 (26.6°) 집힘</span> · <span style={{ color: C.red }}>μ 0.3 (16.7°) 미끄러짐</span>
        </span>
      </Box>
      <Box x={948} y={496} w={908} h={384} at={24.5} title={<Head color={C.red}>둥근 물체 · normal 은 늘 중심을 향한다</Head>}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <svg width={230} height={150}>
            <circle cx={cyl.x} cy={cyl.y} r={cyl.r} fill={`${C.orange}18`} stroke={C.orange} strokeWidth={2} />
            <circle cx={cyl.x} cy={cyl.y} r={4} fill={C.muted} />
            <line x1={cyl.x - cdx} y1={cyl.y - 31} x2={cyl.x} y2={cyl.y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <line x1={cyl.x + cdx} y1={cyl.y - 31} x2={cyl.x} y2={cyl.y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <line x1={cyl.x - cdx - 20} y1={cyl.y - 31} x2={cyl.x + cdx + 20} y2={cyl.y - 31} stroke={C.red} strokeWidth={3} />
          </svg>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={line(C.text, 23)}>반지름 3 cm · 중심에서 1.5 cm 벗어난 선</span>
            <span style={mono(C.red, 23)}>arcsin(1.5 ÷ 3) = 30° &gt; 26.6°</span>
            <span style={line(C.muted, 22)}>손가락을 닫으면 밀려 나간다</span>
          </div>
        </div>
        <Table
          at={26}
          size={22}
          step={0.3}
          head={['벗어난 거리 d', '0.5 cm', '1 cm', '1.5 cm', '2 cm']}
          widths={[250, 130, 130, 130, 130]}
          rows={[
            ['arcsin(d ÷ 3)', '9.6°', '19.5°', '30°', '41.8°'],
            ['필요한 μ 최솟값', '0.17', '0.35', '0.58', '0.89'],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

function Force() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={190} at={0.3} title={<Head color={C.accent}>force closure</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 0.6) }}>손가락 위치는 그대로, 접촉력만 friction cone 안에서 조절해 어떤 방향의 외부 wrench 든 상쇄할 수 있는 grasp</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.2) }}>wrench = 힘 3 개 + torque 3 개 · 3차원에서 point contact 두 개는 두 접촉점을 잇는 축을 도는 torque 를 못 버팀</span>
      </Box>
      <Box x={64} y={350} w={900} h={530} at={6.5} title={<Head color={C.green}>grip force · 2μF ≥ m(g + a) × S</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 6.8) }}>F = m(g + a) × S ÷ (2μ) · 0.5 kg 물체</span>
        <Table
          at={7.4}
          size={22}
          step={0.8}
          head={['μ', 'a (m/s²)', 'S', '필요한 F']}
          widths={[90, 130, 70, 480]}
          colors={[C.muted, C.green, C.red, C.muted]}
          rows={[
            ['0.5', '0', '1', '0.5 × 9.81 ÷ 1 = 4.9 N'],
            ['0.5', '5', '2', '0.5 × 14.81 × 2 ÷ 1 = 14.8 N'],
            ['0.3', '5', '2', '7.41 × 2 ÷ 0.6 = 24.7 N'],
            ['1.0', '5', '2', '7.41 × 2 ÷ 2 = 7.4 N'],
          ]}
        />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13) }}>μ 가 0.5 → 0.3 이면 필요한 힘이 1.7 배</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.2) }}>Robotiq 2F-85 의 grip force 는 20 ~ 235 N · 20 N 보다 약하게 쥐어야 하는 물렁한 물체는 다른 손이 필요하다</span>
      </Box>
      <Card x={984} y={350} w={872} h={530} at={18}>
        <svg width={872} height={250}>
          <text x={30} y={44} {...tx(C.text, 26)} opacity={prog(t, 18.2)}>
            무게중심에서 5 cm 벗어나 쥠
          </text>
          <text x={842} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <g opacity={prog(t, 18.4)}>
            <rect x={80} y={110} width={700} height={50} rx={8} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
            <circle cx={230} cy={135} r={24} fill={`${C.green}44`} stroke={C.green} strokeWidth={2.5} />
            <text x={230} y={96} textAnchor="middle" {...tx(C.green, 22)}>
              패드 · grasp 축
            </text>
            <circle cx={430} cy={135} r={8} fill={C.orange} />
            <text x={470} y={96} textAnchor="middle" {...tx(C.orange, 22)}>
              무게중심
            </text>
          </g>
          <g opacity={prog(t, 19.4)}>
            {arrow(430, 160, 430, 240, C.orange, 4, 14)}
            <text x={454} y={230} fontFamily={MONO} {...tx(C.orange, 22)}>
              0.5 × 9.81 N
            </text>
            <line x1={230} y1={200} x2={430} y2={200} stroke={C.muted} strokeWidth={2} />
            <line x1={230} y1={190} x2={230} y2={210} stroke={C.muted} strokeWidth={2} />
            <text x={320} y={236} textAnchor="middle" fontFamily={MONO} {...tx(C.muted, 22)}>
              5 cm
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 262, width: 812, display: 'grid', gap: 14 }}>
          <Bar label="gravity torque" value={0.245} max={0.26} color={C.red} at={19.8} width={280} labelW={300} fmt="0.245" unit=" N·m" />
          <Bar label="torsional friction · 패드 2 개" value={0.049} max={0.26} color={C.green} at={21} width={280} labelW={300} fmt="0.049" unit=" N·m" />
          <span style={{ ...line(C.text, 22), opacity: prog(t, 22.2) }}>
            0.049 는 0.245 의 5 분의 1 → 물체가 패드 사이에서 돈다 · grip force 만으로 버티려면 <span style={mono(C.red, 22)}>73.6 N</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.3) }}>AnyGrasp: 무게중심 거리를 점수에 · 미끄러짐 25 번 중 16 → 11 번</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseGrip = () => (
  <PauseWrite
    question="1 kg 물체를 μ = 0.4 인 패드로 천천히 들어 올린다. 안전율 2 를 지키려면 손가락 하나가 몇 N 으로 눌러야 할까?"
    answer={
      <>
        F = m(g + a) × S ÷ (2μ) = 1 × 9.81 × 2 ÷ (2 × 0.4)
        <br />= 19.62 ÷ 0.8 = 24.5 N 이상
      </>
    }
  />
)

// ---------- 3. ε · 학습한 grasp ----------

function Epsilon() {
  const t = useSec()
  const O = { x: 430, y: 330 }
  const pts: [number, number][] = [
    [250, -30],
    [110, -200],
    [-150, -180],
    [-280, 20],
    [-120, 125],
    [160, 115],
  ]
  // distance from the origin to each edge; the smallest is ε
  const edges = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length]
    const ex = q[0] - p[0]
    const ey = q[1] - p[1]
    const len = Math.hypot(ex, ey)
    const d = Math.abs(p[0] * ey - p[1] * ex) / len
    const s = -(p[0] * ex + p[1] * ey) / (len * len)
    return { p, q, d, foot: [p[0] + s * ex, p[1] + s * ey] as [number, number] }
  })
  const near = edges.reduce((a, b) => (b.d < a.d ? b : a))
  const eps = near.d
  const P = (p: [number, number]) => `${O.x + p[0]},${O.y + p[1]}`
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={560}>
          <text x={30} y={44} {...tx(C.text, 26)} opacity={prog(t, 0.3)}>
            Ferrari-Canny 의 ε
          </text>
          <text x={30} y={80} fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            primitive wrench 의 convex hull 을 2 차원으로 줄인 모식도
          </text>
          <g opacity={prog(t, 0.8)}>
            <polygon points={pts.map(P).join(' ')} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={2.5} />
            {pts.map((p) => (
              <circle key={p.join()} cx={O.x + p[0]} cy={O.y + p[1]} r={7} fill={C.blue} />
            ))}
            <text x={O.x - 150} y={O.y - 196} textAnchor="middle" {...tx(C.blue, 22, 500)}>
              primitive wrench
            </text>
            <text x={O.x + 230} y={O.y + 170} textAnchor="middle" {...tx(C.blue, 22, 500)}>
              convex hull
            </text>
          </g>
          <g opacity={prog(t, 2.5)}>
            <circle cx={O.x} cy={O.y} r={eps * prog(t, 2.5, 1.2)} fill={`${C.orange}18`} stroke={C.orange} strokeWidth={2.5} />
            <circle cx={O.x} cy={O.y} r={5} fill={C.text} />
            <text x={O.x + 12} y={O.y - 12} {...tx(C.text, 22, 500)}>
              원점
            </text>
            <line x1={O.x} y1={O.y} x2={O.x + near.foot[0]} y2={O.y + near.foot[1]} stroke={C.orange} strokeWidth={3} />
            <text x={O.x + near.foot[0] / 2 + 14} y={O.y + near.foot[1] / 2 + 8} fontFamily={MONO} {...tx(C.orange, 28)}>
              ε
            </text>
          </g>
          <g opacity={prog(t, 7.4)}>
            <line x1={O.x + near.p[0]} y1={O.y + near.p[1]} x2={O.x + near.q[0]} y2={O.y + near.q[1]} stroke={C.red} strokeWidth={5} />
            <text x={O.x - 110} y={O.y + 175} textAnchor="middle" {...tx(C.red, 22)}>
              가장 가까운 면 = 가장 약한 방향
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 570, width: 800, display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 9) }}>ε = 가장 약한 방향에서 버티는 외부 wrench 의 크기 (손가락 힘 1 당)</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>L∞ 기준: 손가락마다 normal force ≤ 1 · L1 기준: 모든 손가락의 합 ≤ 1</span>
        </div>
      </Panel>
      <Box x={948} y={140} w={908} h={400} at={14} title={<Head color={C.accent}>폭 5 cm 상자 · 평면 · L1 기준 ε</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="가운데 · μ 1.0" value={0.58} max={0.6} color={C.green} at={14.4} width={340} labelW={280} fmt="0.58" />
          <Bar label="가운데 · μ 0.5" value={0.33} max={0.6} color={C.green} at={15} width={340} labelW={280} fmt="0.33" />
          <Bar label="가운데 · μ 0.2" value={0.14} max={0.6} color={C.orange} at={15.6} width={340} labelW={280} fmt="0.14" />
          <Bar label="엇갈림 21.8° · μ 0.5" value={0.07} max={0.6} color={C.orange} at={17.4} width={340} labelW={280} fmt="0.07" />
          <Bar label="엇갈림 21.8° · μ 0.3" value={0} max={0.6} color={C.red} at={18.4} width={340} labelW={280} fmt="0" />
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19) }}>같은 μ 0.5 에서 0.07 은 0.33 의 약 5 분의 1 · ε &gt; 0 이면 force closure</span>
      </Box>
      <Box x={948} y={560} w={908} h={320} at={21} title={<Head color={C.orange}>robust epsilon quality (Dex-Net)</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.3) }}>카메라는 한쪽 면만 보고, 위치에는 몇 mm 의 오차가 있으며, μ 도 모른다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23) }}>물체 pose · gripper pose · μ 를 무작위로 흔들어 ε 의 기댓값을 구한다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>Dex-Net 2.0 의 μ: N(0.5, 0.1) 인 Gaussian 을 0 ~ 1 로 자른 분포에서 뽑음</span>
      </Box>
    </AbsoluteFill>
  )
}

function Learned() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={210}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 0.3) }}>
            Dex-Net 2.0 · mesh 1,500 개 → depth image 와 grasp <span style={mono(C.blue, 24)}>670 만</span> 쌍 · robust ε &gt; 0.002 를 성공으로 (양성 21.2%)
          </span>
          <Flow at={1.5} color={C.blue} steps={['depth image', 'edge 에서 antipodal 후보 ≤ 1000', 'GQ-CNN → 성공 확률 Q', '도달 · 충돌 검사', '최고 점수 실행']} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.8) }}>GQ-CNN: convolution 층 4 + fully connected 층 3 · parameter 약 1,800 만 개 · 후보를 grasp 축에 맞춰 돌린 depth 조각을 입력</span>
        </div>
      </Panel>
      <Box x={64} y={370} w={900} h={510} at={6.5} title={<Head color={C.accent}>ABB YuMi · 물체를 하나씩 놓은 실험</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Bar label="아는 8 개 · GQ-CNN" value={93} max={100} color={C.green} at={7} width={280} labelW={330} unit="%" sub="0.8 초" />
          <Bar label="아는 8 개 · registration" value={95} max={100} color={C.blue} at={9.8} width={280} labelW={330} unit="%" sub="2.6 초" />
          <Bar label="처음 보는 10 개 · registration" value={52} max={100} color={C.red} at={13.3} width={280} labelW={330} unit="%" />
          <Bar label="처음 보는 10 개 · GQ-CNN" value={80} max={100} color={C.green} at={15.5} width={280} labelW={330} unit="%" sub="0.8 초" />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.5) }}>registration: point cloud 를 database 의 mesh 에 맞춰 pose 를 구하고, 미리 계산한 grasp 를 꺼냄</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 17) }}>처음 보는 가정용품 40 개 · GQ-CNN + 반복 sampling · 94% · 2.5 초</span>
      </Box>
      <Box x={984} y={370} w={872} h={230} at={19.5} title={<Head color={C.purple}>Contact-GraspNet · 6-DoF grasp</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.8) }}>point cloud 의 점 하나를 접촉점 c 로 삼고, 점마다 점수 · a · b · w 를 낸다</span>
        <span style={{ ...mono(C.purple, 23), opacity: prog(t, 21.2) }}>t = c + (w ÷ 2) b + d a</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 23) }}>장면 하나 0.28 초 · 처음 보는 51 개 · 성공 90.2% (기존 80.4%)</span>
      </Box>
      <Box x={984} y={614} w={872} h={266} at={25.5} gap={10} title={<Head color={C.orange}>AnyGrasp · 처음 보는 300 여 개를 통에서 옮기기</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="AnyGrasp" value={93.3} max={100} color={C.orange} at={25.8} width={360} labelW={230} unit="%" />
          <Bar label="Dex-Net 4.0" value={72.2} max={100} color={C.muted} at={26.6} width={360} labelW={230} unit="%" />
          <Bar label="집게를 든 사람" value={93.9} max={100} color={C.green} at={27.4} width={360} labelW={230} unit="%" />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 28.4) }}>실제 카메라 데이터로 학습 · 논문마다 조건이 달라 성공률을 바로 비교할 수 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseEpsilon = () => (
  <PauseWrite
    question="폭 5 cm 상자를 1 cm 씩 엇갈려 쥐면 잇는 선이 21.8° 기운다. μ = 0.3 에서 ε 이 0 인 이유는?"
    answer={
      <>
        μ = 0.3 의 반각 arctan 0.3 = 16.7° &lt; 21.8° → 잇는 선이 friction cone 밖
        <br />
        antipodal 이 깨져 force closure 가 아니다 → ε = 0
      </>
    }
  />
)

// ---------- 4. pipeline · 실패 ----------

function Pipeline() {
  const t = useSec()
  const finger = (x: number, y: number, dashed: boolean) => (
    <rect x={x} y={y} width={14} height={104} rx={4} fill={dashed ? 'none' : C.cardEdge} stroke={C.muted} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} />
  )
  const ticks = Array.from({ length: 24 }, (_, k) => (k * 2 * Math.PI) / 24)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={170}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 18 }}>
          <Label size={24} color={C.text}>
            grasp 계획에서 실행까지 · 검사를 통과하지 못한 후보는 버리고 다음 후보를 본다
          </Label>
          <Flow at={0.6} gap={0.55} color={C.accent} steps={['depth image', '후보', '점수 정렬', 'IK', '충돌 검사', 'pre-grasp', '내려가 닫기', '들어 올려 확인']} />
        </div>
      </Panel>
      <Card x={64} y={330} w={860} h={550} at={7}>
        <svg width={860} height={410}>
          <text x={30} y={44} {...tx(C.text, 26)} opacity={prog(t, 7.2)}>
            frame 옮기기 → pre-grasp → grasp
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <g opacity={prog(t, 7.6)}>
            <rect x={85} y={90} width={50} height={36} rx={6} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
            <circle cx={110} cy={108} r={7} fill={C.accent} />
            <text x={60} y={156} {...tx(C.accent, 22)}>
              camera frame
            </text>
            {arrow(110, 170, 110, 292, C.muted, 3, 12)}
            <text x={124} y={238} {...tx(C.muted, 22, 500)}>
              변환
            </text>
            <rect x={80} y={300} width={60} height={60} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={40} y={392} {...tx(C.text, 22)}>
              robot base frame
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            <line x1={330} y1={360} x2={800} y2={360} stroke={C.muted} strokeWidth={2} />
            <rect x={500} y={280} width={100} height={80} rx={4} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
            <rect x={484} y={70} width={132} height={16} rx={4} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 5" />
            {finger(484, 86, true)}
            {finger(602, 86, true)}
            <text x={470} y={86} textAnchor="end" {...tx(C.muted, 22)}>
              pre-grasp
            </text>
          </g>
          <g opacity={prog(t, 11)}>
            <rect x={484} y={200} width={132} height={16} rx={4} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            {finger(484, 216, false)}
            {finger(602, 216, false)}
            <text x={470} y={216} textAnchor="end" {...tx(C.text, 22)}>
              grasp pose
            </text>
            {arrow(680, 80, 680, 206, C.orange, 3, 12)}
            <text x={696} y={150} fontFamily={MONO} {...tx(C.orange, 22)}>
              0.1 m
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 424, width: 800, display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 8) }}>camera frame 의 grasp pose → robot base frame 으로 옮긴 뒤 IK</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 12) }}>AnyGrasp: approach 반대로 10 cm 옮긴 waypoint 를 먼저 보냄</span>
        </div>
      </Card>
      <Box x={944} y={330} w={912} h={550} at={14} gap={16} title={<Head color={C.green}>MoveIt Task Constructor 의 stage</Head>}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <svg width={180} height={180}>
            <circle cx={90} cy={90} r={40} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
            {ticks.map((a, k) => (
              <line key={k} x1={90 + 54 * Math.cos(a)} y1={90 + 54 * Math.sin(a)} x2={90 + 80 * Math.cos(a)} y2={90 + 80 * Math.sin(a)} stroke={C.green} strokeWidth={3} strokeLinecap="round" opacity={prog(t, 15 + k * 0.12, 0.3)} />
            ))}
          </svg>
          <div style={{ display: 'grid', gap: 10 }}>
            <span style={{ ...mono(C.text, 22), opacity: prog(t, 14.4) }}>GenerateGraspPose · angle_delta 마다 후보</span>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 15) }}>angle_delta 기본값 0.1 rad · 예제 π / 12 (15°)</span>
            <span style={{ ...mono(C.green, 24), opacity: prog(t, 17.6) }}>2π ÷ (π / 12) = 24 개</span>
          </div>
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21) }}>
          <span style={mono(C.text, 22)}>ComputeIK</span> · 후보마다 IK 를 풀고, 풀지 못한 후보는 버림
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 22) }}>
          <span style={mono(C.text, 22)}>max_ik_solutions</span> 기본값 1 · 예제 8
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 24) }}>예제: grasp 직전 0.10 ~ 0.15 m 다가가고, 쥔 뒤 0.1 ~ 0.3 m 들어 올림</span>
      </Box>
    </AbsoluteFill>
  )
}

function Failures() {
  const t = useSec()
  const rows: [string, string, string, string, number][] = [
    ['투명 · 반짝이는 물체', 'depth 카메라가 물체 표면이 아닌 뒤의 배경을 재거나 값이 빔', 'ClearGrasp 로 depth 고치기 · 여러 각도 촬영', C.blue, 0.3],
    ['얇은 부분', 'depth 에서 빠져 빈 곳으로 보여 손가락이 부딪힘 (Dex-Net 2.0)', '고해상도 카메라 · analytic 충돌 검사 추가', C.purple, 6.5],
    ['depth noise', 'D435 는 같은 점이 ±5 mm 까지 흔들려 접촉점이 틀림', '실제 noise 를 넣은 학습 · 실제 데이터 학습', C.orange, 12.5],
    ['clutter', '물체가 서로 가려 한쪽 면만 보이고 손가락이 이웃 물체와 부딪힘', '6-DoF grasp · 충돌 검사 · 밀어 흩뜨리기', C.pink, 15.5],
    ['낮은 마찰', '젖은 물체가 좋은 grasp 에서도 미끄러짐 · 물고기 실패의 절반 가까이', '안전율 증가 · 패드 재질 교체', C.red, 18.5],
  ]
  return (
    <AbsoluteFill>
      {rows.map(([tag, what, fix, color, at], i) => (
        <Appear key={tag} at={at} style={{ position: 'absolute', left: 64, top: 140 + i * 114, width: 1792 }}>
          <div style={{ height: 104, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', borderRadius: 18, background: C.card, border: `1.5px solid ${color}66` }}>
            <span style={{ width: 280, fontSize: 26, fontWeight: 600, color }}>{tag}</span>
            <span style={{ width: 740, ...line(C.text, 23) }}>{what}</span>
            <span style={{ width: 620, ...line(C.muted, 22) }}>→ {fix}</span>
          </div>
        </Appear>
      ))}
      <Box x={64} y={716} w={1792} h={164} at={24.5}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
          <span style={{ width: 760, ...line(C.text, 24) }}>
            <span style={{ color: C.red, fontWeight: 600 }}>성공률 90% ≠ 내 로봇에서 열 번에 아홉 번</span> · 논문의 성공률은 그 논문의 물체 · 카메라 · gripper · 패드에서 잰 값
          </span>
          <div style={{ display: 'grid', gap: 12 }}>
            <Bar label="AnyGrasp · 철물" value={81.5} max={100} color={C.orange} at={26} width={360} labelW={230} unit="%" />
            <Bar label="과자 · 인형" value={100} max={100} color={C.green} at={26.8} width={360} labelW={230} unit="%" />
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseAngle = () => (
  <PauseWrite
    question="angle_delta 를 기본값 0.1 rad 로 두면 물체 축을 한 바퀴 도는 동안 후보가 대략 몇 개 생길까?"
    answer={
      <>
        한 바퀴 2π ≈ 6.28 rad → 6.28 ÷ 0.1 ≈ 63 개
        <br />
        예제의 π / 12 (24 개) 보다 촘촘해 후보가 많은 만큼 IK 도 더 많이 푼다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 't · a · b · w 숫자 7 개 · planar 4 개 · suction 42.4 N = 압력 차이 × 넓이', at: 1 },
    { tag: script.sections[1], color: C.blue, text: 'μ 0.5 → 반각 26.6° · 원기둥 1.5 cm 벗어나면 30° · grip force 14.8 N', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'ε = hull 안 가장 큰 공의 반지름 · 670 만 쌍 → GQ-CNN 0.8 초 93%', at: 8.4 },
    { tag: script.sections[3], color: C.red, text: '후보 → 점수 → IK → 충돌 검사 → pre-grasp → 닫기 · 투명 · 얇은 부분 · noise', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            손가락을 어디에, 어느 방향으로 대야 미끄러지지 않을까?
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
  const next: [string, string, number][] = [
    ['Hand-Eye Calibration', '카메라가 로봇 base 에서 어디에 어떤 방향으로 달렸는지 재기 · 회전 1° 오차면 0.5 m 앞 grasp 가 0.5 × tan 1° ≈ 8.7 mm 어긋남', 0.5],
    ['Motion Planning', 'pre-grasp 까지 다른 물체를 피해 가는 경로 찾기', 1.2],
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 30, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          {next.map(([name, sub, at]) => (
            <Appear key={name} at={at}>
              <div style={{ width: 780, height: 280, boxSizing: 'border-box', padding: '30px 36px', borderRadius: 24, background: C.card, border: `1.5px solid ${C.cardEdge}`, display: 'grid', alignContent: 'start', gap: 16 }}>
                <span style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600 }}>{name}</span>
                <span style={line(C.muted, 26)}>{sub}</span>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={2} style={{ marginTop: 40, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/grasping (Ferrari-Canny · Dex-Net 2.0 · 3.0 · GraspNet-1Billion · Contact-GraspNet · AnyGrasp)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function Grasping() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        repr: Repr,
        grippers: Grippers,
        'pause-suction': PauseSuction,
        cone: Cone,
        force: Force,
        'pause-grip': PauseGrip,
        epsilon: Epsilon,
        learned: Learned,
        'pause-epsilon': PauseEpsilon,
        pipeline: Pipeline,
        failures: Failures,
        'pause-angle': PauseAngle,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
