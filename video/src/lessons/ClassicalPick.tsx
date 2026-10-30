import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './classical-pick.narration.json'
import { script } from './classical-pick.script'

// Numbers follow lessons/classical-pick/README.md (see classical-pick.script.ts). The gripper and side-view drawings are
// schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, out, gap = 10, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; out?: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} out={out} style={{ position: 'absolute', left: x, top: y, width: w }}>
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

function Bar({ label, value, max, color, at, width = 320, labelW = 300 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{value}</span>
    </div>
  )
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a simple text table: first column sans, the rest mono unless `sans` lists them */
function Table({ head, rows, widths, at, step = 0.5, size = 24, colors, sans = [] }: { head?: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; sans?: number[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 || sans.includes(i) ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 || sans.includes(i) ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {head && (
        <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          {head.map((h, i) => (
            <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 3 }}>
              {h}
            </span>
          ))}
        </div>
      )}
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

const MODULES = ['인식', '3D 위치', '잡기 자세', 'IK', '경로', '실행']

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GRASPING · CLASSICAL PICK & PLACE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 104, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Classical Pick & Place</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            사진 → <span style={{ color: C.accent }}>인식 → 3D 위치 → 잡기 자세 → IK → 경로 → 실행</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            사진에서 찾은 물체를, 사람이 짠 규칙으로 이은 module 여섯 개로 옮기는 방식
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

/** side view: a gripper comes down a little off the cube's centre and one finger lands on the cube's top edge */
function Snag({ t, at }: { t: number; at: number }) {
  const s = 24 // px per cm
  const cube = { x: 300, y: 250, w: 5 * s }
  const cx = 396 // gripper centre, off the cube's centre (360)
  const gap = 7 * s
  const fw = 16
  const down = prog(t, at + 0.4, 1.4)
  const tip = 150 + (cube.y - 150) * down // finger tips
  const palm = tip - 110
  const hit = prog(t, at + 1.8, 0.4)
  return (
    <svg width={760} height={420}>
      <text x={730} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, at)}>
        옆에서 본 모식도
      </text>
      <g opacity={prog(t, at)}>
        <line x1={40} y1={370} x2={720} y2={370} stroke={C.dim} strokeWidth={3} />
        <rect x={cube.x} y={cube.y} width={cube.w} height={cube.w} rx={4} fill={`${C.red}55`} stroke={C.red} strokeWidth={2.5} />
        <line x1={360} y1={cube.y - 10} x2={360} y2={60} stroke={C.red} strokeWidth={1.5} strokeDasharray="5 6" opacity={0.7} />
        <text x={360} y={402} textAnchor="middle" fill={C.muted} fontSize={22}>
          cube 5 cm
        </text>
      </g>
      <g opacity={prog(t, at + 0.2)}>
        <rect x={cx - gap / 2 - fw} y={palm} width={gap + 2 * fw} height={20} rx={5} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={cx - 10} y={palm - 60} width={20} height={60} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={cx - gap / 2 - fw} y={palm + 20} width={fw} height={tip - palm - 20} rx={4} fill={C.muted} />
        <rect x={cx + gap / 2} y={palm + 20} width={fw} height={tip - palm - 20} rx={4} fill={C.muted} />
        <line x1={cx} y1={palm + 26} x2={cx} y2={tip} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 6" opacity={0.7} />
      </g>
      <g opacity={hit}>
        <circle cx={cx - gap / 2 - fw / 2} cy={cube.y} r={18} fill="none" stroke={C.orange} strokeWidth={3} />
        <text x={270} y={238} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
          손가락이 걸림
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  const causes: [string, number][] = [
    ['카메라가 상자 위치를 몇 mm 틀리게 봤다', 0.9],
    ['관절 각도를 잘못 계산했다', 1.6],
    ['내려가는 길이 휘었다', 2.3],
  ]
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={760} h={420}>
        <Snag t={t} at={0.3} />
      </Panel>
      <Box x={850} y={130} w={1010} h={420} at={0.6} title={<Head color={C.muted} size={26}>원인이 될 수 있는 계산</Head>} gap={18}>
        {causes.map(([s, at]) => (
          <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ color: C.red, fontSize: 28, fontWeight: 700 }}>?</span>
            <span style={line(C.text, 28)}>{s}</span>
          </div>
        ))}
        <span style={{ ...line(C.orange, 28), fontWeight: 600, opacity: prog(t, 3.1) }}>겉으로 보이는 결과는 ‘못 집었다’ 하나뿐</span>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 60, top: 590, width: 1800 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          어느 계산이 틀렸는지 <span style={{ color: C.accent }}>어떻게 가려낼 수 있을까?</span>
        </div>
      </Appear>
      <Appear at={5.4} style={{ position: 'absolute', left: 60, top: 690, width: 1800, textAlign: 'center' }}>
        <Label size={30} color={C.muted}>
          사진 한 장에서 손가락이 닫히기까지, 로봇은 여러 계산을 차례로 한다
        </Label>
      </Appear>
      <div style={{ position: 'absolute', left: 60, top: 770, width: 1800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        {['사진', ...MODULES].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 5.8 + i * 0.2) }}>
            <span style={{ padding: '10px 18px', borderRadius: 14, border: `1.5px solid ${C.accent}77`, background: `${C.accent}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
            {i < MODULES.length && <span style={{ fontSize: 28, color: C.muted }}>→</span>}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

// ---------- 1. six modules and perception ----------

function Pipeline() {
  const t = useSec()
  const out = ['pixel (220, 240) · yaw 10°', 'base frame (0.20, 0, 0.05)', 'waypoint 여섯 개', 'waypoint 마다 joint angle', 'minimum-jerk trajectory', '팔과 gripper 를 움직인다']
  const W = 266
  const G = 40
  return (
    <AbsoluteFill>
      {MODULES.map((m, i) => {
        const x = 62 + i * (W + G)
        const check = prog(t, 7 + i * 0.5, 0.4)
        return (
          <div key={m}>
            <div style={{ position: 'absolute', left: x, top: 130, width: W, height: 170, opacity: prog(t, 0.5 + i * 0.35), padding: '20px 20px', borderRadius: 18, background: C.card, border: `1.5px solid ${check > 0.5 ? C.green : C.cardEdge}`, display: 'grid', alignContent: 'start', gap: 10, boxSizing: 'border-box' }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>
                <span style={{ fontFamily: MONO, color: C.accent }}>{i + 1}</span> {m}
              </span>
              <span style={{ ...line(C.muted, 22) }}>{out[i]}</span>
            </div>
            <span style={{ position: 'absolute', left: x + W - 44, top: 142, fontSize: 26, color: C.green, fontWeight: 700, opacity: check }}>✓</span>
            {i < MODULES.length - 1 && (
              <svg style={{ position: 'absolute', left: x + W, top: 200 }} width={G} height={30}>
                {arrow(6, 15, G - 6, 15, C.muted, 3, 10, prog(t, 0.7 + i * 0.35))}
              </svg>
            )}
          </div>
        )
      })}
      <Card x={60} y={330} w={1800} h={310} at={2.6}>
        <div style={{ padding: '18px 40px' }}>
          <Table
            at={2.8}
            step={0.45}
            size={25}
            widths={[300, 460, 640, 300]}
            sans={[1, 2, 3]}
            head={['module', '입력', '출력', '']}
            rows={[
              ['① 인식', '카메라 사진', '상자 가운데의 pixel 과 돌아간 각도', ''],
              ['② 3D 위치', 'pixel, depth', 'base frame 의 실제 좌표 (m)', ''],
              ['③ 잡기 자세', '상자의 좌표와 각도', '손이 거쳐 갈 자세 여섯 개', ''],
              ['④ IK', '손의 자세', '그 자세의 joint angle', ''],
              ['⑤ 경로', '자세별 joint angle', '시각별 목표 각도', ''],
              ['⑥ 실행', '시각별 목표 각도', '실제로 움직이는 팔과 gripper', ''],
            ]}
          />
        </div>
        <div style={{ position: 'absolute', left: 1440, top: 90, width: 330, opacity: prog(t, 7.2) }}>
          <span style={{ ...line(C.green, 24), fontWeight: 600 }}>앞 module 의 출력이 다음 module 의 입력 → 중간 값을 하나씩 확인</span>
        </div>
      </Card>
      <Box x={60} y={660} w={880} h={220} at={12.6} title={<Head color={C.accent}>classical pick-and-place</Head>}>
        <span style={line(C.text, 24)}>사람이 짠 규칙으로 module 을 잇는다 (데이터로 학습하는 방식보다 먼저 쓰였다)</span>
        <span style={line(C.muted, 24)}>ROS 2 의 MoveIt 2 는 같은 구조를 MoveIt Task Constructor 의 stage 로 제공</span>
      </Box>
      <Box x={980} y={660} w={880} h={220} at={19.2} title={<Head color={C.orange}>첫 Amazon Picking Challenge (2015) 뒤 설문</Head>}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} style={{ width: 22, height: 22, borderRadius: 4, background: i < 20 ? C.orange : C.grid, opacity: prog(t, 19.6 + i * 0.04, 0.3) }} />
          ))}
        </div>
        <span style={line(C.text, 24)}>
          답한 <span style={mono(C.orange)}>25</span> 팀 중 <span style={mono(C.orange)}>20</span> 팀이 motion planning 으로 경로를 따로 계산
        </span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 21.5) }}>팀들이 꼽은 가장 어려운 단계는 인식</span>
      </Box>
    </AbsoluteFill>
  )
}

/** the 5 × 5 photo patch and the two masks */
function MaskPanel({ t }: { t: number }) {
  const cell = 64
  const x0 = 90
  const y0 = 80
  const inCube = (i: number, j: number) => i >= 1 && i <= 3 && j >= 1 && j <= 3
  const shaded = (i: number, j: number) => i === 3 && j === 3
  const fill = (i: number, j: number) => (shaded(i, j) ? `${C.red}66` : inCube(i, j) ? C.red : `${C.muted}55`)
  const mask = (mx: number, my: number, keepShaded: boolean, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      {Array.from({ length: 25 }, (_, k) => {
        const i = k % 5
        const j = Math.floor(k / 5)
        const on = inCube(i, j) && (keepShaded || !shaded(i, j))
        return <rect key={k} x={mx + i * 30} y={my + j * 30} width={28} height={28} rx={3} fill={on ? color : C.grid} stroke={C.cardEdge} />
      })}
    </g>
  )
  return (
    <svg width={760} height={750}>
      <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.4)}>
        사진 조각 (5 × 5 칸)
      </text>
      <g opacity={prog(t, 0.5)}>
        {Array.from({ length: 25 }, (_, k) => {
          const i = k % 5
          const j = Math.floor(k / 5)
          return <rect key={k} x={x0 + i * cell} y={y0 + j * cell} width={cell - 3} height={cell - 3} rx={4} fill={fill(i, j)} />
        })}
        {[218, 219, 220, 221, 222].map((u, i) => (
          <text key={u} x={x0 + i * cell + cell / 2} y={y0 + 5 * cell + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {u}
          </text>
        ))}
        {[238, 239, 240, 241, 242].map((v, j) => (
          <text key={v} x={x0 - 12} y={y0 + j * cell + cell / 2 + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {v}
          </text>
        ))}
      </g>
      <g opacity={prog(t, 7.2)}>
        <rect x={x0 + 3 * cell - 2} y={y0 + 3 * cell - 2} width={cell + 1} height={cell + 1} rx={5} fill="none" stroke={C.orange} strokeWidth={3} />
        <text x={30} y={480} fill={C.orange} fontSize={22} fontWeight={600}>
          그늘진 칸 (100, 20, 15)
        </text>
      </g>
      <text x={450} y={100} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 1.6)}>
        R 문턱 규칙
      </text>
      {mask(450, 115, false, C.red, 1.8)}
      <g opacity={prog(t, 9.6)}>
        <text x={450} y={295} fill={C.text} fontSize={20}>
          8 칸 · centroid
        </text>
        <text x={450} y={323} fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (219.875, 239.875)
        </text>
      </g>
      <text x={450} y={380} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 8.8)}>
        빨강의 몫 규칙
      </text>
      {mask(450, 395, true, C.green, 9)}
      <g opacity={prog(t, 9.8)}>
        <text x={450} y={575} fill={C.text} fontSize={20}>
          9 칸 · centroid
        </text>
        <text x={450} y={603} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (220, 240)
        </text>
      </g>
    </svg>
  )
}

function Mask() {
  const t = useSec()
  const later = { opacity: prog(t, 7.6) }
  const head = (s: string) => <span>{s}</span>
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={760} h={750}>
        <MaskPanel t={t} />
        <div style={{ position: 'absolute', left: 30, top: 640, width: 700, opacity: prog(t, 10.4) }}>
          <span style={line(C.muted, 22)}>centroid: mask 에서 1 인 칸들의 u 평균과 v 평균 → cube 윗면 가운데의 pixel</span>
        </div>
      </Panel>
      <Box x={850} y={130} w={1010} h={300} at={0.4} title={<Head size={26}>두 규칙: R ≥ 150 이고 G·B ≤ 80 · 빨강의 몫 ≥ 0.6</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted, fontSize: 20 }}>
            <span style={{ width: 180 }}>{head('pixel')}</span>
            <span style={{ width: 220 }}>{head('RGB')}</span>
            <span style={{ width: 120 }}>{head('R 문턱')}</span>
            <span style={{ width: 300, ...later }}>{head('빨강의 몫 R ÷ (R+G+B)')}</span>
            <span style={{ width: 110, ...later }}>{head('몫 ≥ 0.6')}</span>
          </div>
          {[
            ['밝은 cube', '(200, 40, 30)', 'cube', '200 ÷ 270 ≈ 0.74', 'cube', C.text],
            ['그늘진 cube', '(100, 20, 15)', '놓침', '100 ÷ 135 ≈ 0.74', 'cube', C.orange],
            ['책상', '(120, 110, 100)', '아님', '120 ÷ 330 ≈ 0.36', '아님', C.text],
            ['책상의 반사광', '(230, 200, 190)', '아님', '230 ÷ 620 ≈ 0.37', '아님', C.text],
          ].map(([a, b, c, d, e, color], k) => (
            <div key={a} style={{ display: 'flex', fontSize: 22, lineHeight: 1.45, color, opacity: prog(t, (k === 1 ? 7.2 : 0.8) + (k === 1 ? 0 : k * 0.4)) }}>
              <span style={{ width: 180 }}>{a}</span>
              <span style={{ width: 220, fontFamily: MONO }}>{b}</span>
              <span style={{ width: 120, color: c === '놓침' ? C.red : undefined, fontWeight: c === '놓침' ? 700 : 500 }}>{c}</span>
              <span style={{ width: 300, fontFamily: MONO, ...later }}>{d}</span>
              <span style={{ width: 110, color: k === 1 ? C.green : undefined, fontWeight: k === 1 ? 700 : 500, ...later }}>{e}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={850} y={450} w={1010} h={210} at={14.2} title={<Head color={C.blue} size={26}>이름으로 찾는 인식기 · YOLO-World (2024)</Head>}>
        <span style={line(C.text, 23)}>
          이름 ‘red cube’ → bounding box <span style={mono(C.blue, 23)}>(200, 220)–(240, 260)</span>, 점수 <span style={mono(C.blue, 23)}>0.91</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.6) }}>
          가운데 <span style={mono(C.green, 23)}>(220, 240)</span> 은 mask 의 centroid 와 같은 칸 → 첫 module 만 바꿔 끼운다
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 17.4) }}>논문: 학습에 쓰지 않은 LVIS 로 평가 · V100 GPU 에서 1초에 52 장 · 35.4 AP</span>
      </Box>
      <Box x={850} y={680} w={1010} h={200} at={21.2} title={<Head color={C.purple} size={26}>yaw: 위에서 본 회전 각도 · 90° 주기 (box 는 각도를 주지 않는다)</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {['10°', '100°', '−80°', '−170°'].map((s, i) => (
            <span key={s} style={{ padding: '6px 18px', borderRadius: 999, border: `1.5px solid ${i === 0 ? C.green : C.cardEdge}`, background: i === 0 ? `${C.green}22` : 'transparent', ...mono(i === 0 ? C.green : C.muted, 24), opacity: prog(t, 22 + i * 0.3) }}>
              {s}
            </span>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.6) }}>손가락 방향의 후보</span>
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.2) }}>
          지금 wrist_roll <span style={mono(C.green, 23)}>0°</span> → 가장 가까운 <span style={mono(C.green, 23)}>10°</span> · wrist_roll <span style={mono(C.orange, 23)}>70°</span> 이면 <span style={mono(C.orange, 23)}>100°</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 2. depth and the height assumption ----------

function BackprojectPanel({ t }: { t: number }) {
  const X = (x: number) => 140 + (x - 0.05) * 1100
  const Z = (z: number) => 700 - z * 1100
  const cam = { x: X(0.3), y: Z(0.55) }
  const top = { x: X(0.2), y: Z(0.05) }
  const dots = [0.45, 0.35, 0.25, 0.15].map((z) => ({ x: X(0.3 - 0.2 * (0.55 - z)), y: Z(z) }))
  return (
    <svg width={720} height={750}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        옆에서 본 장면
      </text>
      <g opacity={prog(t, 0.4)}>
        <line x1={30} y1={Z(0)} x2={690} y2={Z(0)} stroke={C.dim} strokeWidth={3} />
        <text x={690} y={735} textAnchor="end" fill={C.dim} fontSize={20}>
          책상 윗면 (높이 0)
        </text>
        <rect x={X(0.175)} y={Z(0.05)} width={0.05 * 1100} height={0.05 * 1100} rx={3} fill={`${C.red}55`} stroke={C.red} strokeWidth={2} />
        <rect x={cam.x - 25} y={cam.y - 18} width={50} height={36} rx={7} fill={C.card} stroke={C.accent} strokeWidth={3} />
        <circle cx={cam.x} cy={cam.y} r={7} fill={C.accent} />
        <text x={450} y={70} fill={C.accent} fontSize={22}>
          카메라 · 높이 0.55 m
        </text>
      </g>
      <g opacity={prog(t, 0.8)}>
        <line x1={cam.x} y1={cam.y + 18} x2={top.x} y2={top.y} stroke={C.blue} strokeWidth={3} />
        <line x1={top.x} y1={top.y} x2={X(0.19)} y2={Z(0)} stroke={C.blue} strokeWidth={2} strokeDasharray="5 6" opacity={0.6} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={6} fill={C.blue} opacity={prog(t, 1.2 + i * 0.25)} />
        ))}
        <text x={60} y={300} fill={C.blue} fontSize={22}>
          ray 위의 점은 모두
        </text>
        <text x={60} y={330} fill={C.blue} fontSize={22}>
          같은 pixel (220, 240)
        </text>
      </g>
      <g opacity={prog(t, 2.6)}>
        <line x1={470} y1={cam.y} x2={470} y2={top.y} stroke={C.orange} strokeWidth={2.5} />
        <line x1={460} y1={cam.y} x2={480} y2={cam.y} stroke={C.orange} strokeWidth={2.5} />
        <line x1={460} y1={top.y} x2={480} y2={top.y} stroke={C.orange} strokeWidth={2.5} />
        <line x1={top.x + 30} y1={top.y} x2={455} y2={top.y} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4 5" />
        <text x={482} y={360} fill={C.orange} fontSize={22} fontWeight={600}>
          depth 0.5 m
        </text>
        <text x={482} y={390} fill={C.orange} fontSize={20} fontFamily={MONO}>
          0.55 − 0.05
        </text>
      </g>
      <g opacity={prog(t, 16)}>
        <circle cx={top.x} cy={top.y} r={8} fill={C.green} />
        <text x={60} y={610} fill={C.green} fontSize={22}>
          cube 윗면 가운데
        </text>
        <text x={60} y={640} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          (0.20, 0, 0.05)
        </text>
      </g>
    </svg>
  )
}

function Backproject() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={720} h={750}>
        <BackprojectPanel t={t} />
      </Panel>
      <Box x={810} y={130} w={1050} h={180} at={0.4} out={20.6} title={<Head color={C.accent} size={26}>예시 카메라 (Camera Geometry 강의와 같은 값)</Head>}>
        <span style={line(C.text, 24)}>
          focal length <span style={mono(C.accent)}>f = 500</span> · principal point <span style={mono(C.accent)}>(320, 240)</span>
        </span>
        <span style={line(C.muted, 24)}>
          base frame 의 <span style={mono(C.text)}>(0.3, 0, 0.55)</span> 에서 수직 아래를 본다 · cube 한 변 <span style={mono(C.text)}>5 cm</span>
        </span>
      </Box>
      <Box x={810} y={130} w={1050} h={180} at={21.2} color={`${C.red}88`} title={<Head color={C.red} size={26}>✕ depth 가 틀리면 높이만 틀린다</Head>}>
        <span style={line(C.text, 24)}>
          ✓ depth 를 0.5 대신 0.51 로 재면 <span style={mono(C.green)}>X = −0.2 × 0.51 = −0.102</span>
        </span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 23.4) }}>방향에 depth 를 곱하므로 가로 위치도 2 mm 바뀐다</span>
      </Box>
      <Box x={810} y={330} w={1050} h={270} at={7.2} title={<Head color={C.blue} size={26}>back-projection 세 단계</Head>}>
        <Table
          at={7.4}
          step={1.4}
          widths={[380, 320, 280]}
          head={['단계', 'u 쪽', 'v 쪽']}
          rows={[
            ['① principal point 빼기', '220 − 320 = −100', '240 − 240 = 0'],
            ['② f = 500 으로 나누기', '−0.2', '0'],
            ['③ depth 0.5 곱하기', '−0.1', '0'],
          ]}
        />
      </Box>
      <Box x={810} y={620} w={1050} h={260} at={14.2} title={<Head color={C.green} size={26}>camera frame → base frame</Head>}>
        <Table
          at={14.4}
          step={1.1}
          widths={[460, 320]}
          rows={[
            ['camera 좌표 (X, Y, Z)', '(−0.1, 0, 0.5)'],
            ['축 맞추기 (X, −Y, −Z)', '(−0.1, 0, −0.5)'],
            ['카메라 자리 더하기', '+ (0.3, 0, 0.55)'],
            ['base frame 좌표', '(0.20, 0, 0.05)'],
          ]}
          colors={[undefined, undefined, undefined, C.green]}
        />
      </Box>
    </AbsoluteFill>
  )
}

function HeightPanel({ t }: { t: number }) {
  const X = (x: number) => 100 + (x - 0.1) * 1200
  const Z = (z: number) => 710 - z * 1200
  const cam = { x: X(0.3), y: Z(0.55) }
  const lift = prog(t, 7.2, 1)
  const b = prog(t, 7.2, 0.6)
  const a = 1 - prog(t, 6.8, 0.4)
  const cubeY = Z(0.05) - 0.05 * 1200 * lift
  return (
    <svg width={900} height={750}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        옆에서 본 장면
      </text>
      <g opacity={prog(t, 0.4)}>
        <line x1={30} y1={Z(0)} x2={870} y2={Z(0)} stroke={C.dim} strokeWidth={3} />
        <rect x={cam.x - 25} y={cam.y - 18} width={50} height={36} rx={7} fill={C.card} stroke={C.accent} strokeWidth={3} />
        <circle cx={cam.x} cy={cam.y} r={7} fill={C.accent} />
        <text x={380} y={58} fill={C.accent} fontSize={22}>
          카메라 · 높이 0.55 m
        </text>
        <line x1={330} y1={Z(0.05)} x2={870} y2={Z(0.05)} stroke={C.red} strokeWidth={2} strokeDasharray="8 7" />
        <text x={560} y={Z(0.05) - 16} fill={C.red} fontSize={22}>
          가정한 높이 0.05 m
        </text>
      </g>
      <g opacity={b}>
        <rect x={X(0.12)} y={Z(0.05)} width={0.16 * 1200} height={0.05 * 1200} rx={4} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} />
        <text x={X(0.2)} y={Z(0) - 14} textAnchor="middle" fill={C.orange} fontSize={20}>
          책 5 cm
        </text>
      </g>
      <rect x={X(0.175)} y={cubeY} width={0.05 * 1200} height={0.05 * 1200} rx={3} fill={`${C.red}55`} stroke={C.red} strokeWidth={2} opacity={prog(t, 0.4)} />
      {/* phase A: the cube on the table */}
      <g opacity={prog(t, 0.8) * a}>
        <line x1={cam.x} y1={cam.y + 18} x2={X(0.2)} y2={Z(0.05)} stroke={C.blue} strokeWidth={3} />
        <circle cx={X(0.2)} cy={Z(0.05)} r={8} fill={C.green} />
        <line x1={X(0.2) + 8} y1={Z(0.05) - 6} x2={420} y2={560} stroke={C.green} strokeWidth={1.5} />
        <text x={430} y={566} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          (0.20, 0, 0.05)
        </text>
        <text x={300} y={330} fill={C.blue} fontSize={22}>
          pixel (220, 240) 의 ray
        </text>
      </g>
      {/* phase B: the cube on a book */}
      <g opacity={prog(t, 8.2)}>
        <line x1={cam.x} y1={cam.y + 18} x2={X(0.189)} y2={Z(0.05)} stroke={C.blue} strokeWidth={3} />
        <text x={300} y={330} fill={C.blue} fontSize={22}>
          pixel u ≈ 209 의 ray
        </text>
        <circle cx={X(0.2)} cy={Z(0.1)} r={8} fill={C.green} />
        <line x1={X(0.2) + 8} y1={Z(0.1) - 6} x2={420} y2={530} stroke={C.green} strokeWidth={1.5} />
        <text x={430} y={536} fill={C.green} fontSize={22} fontWeight={600}>
          실제 윗면 <tspan fontFamily={MONO}>(0.20, 0, 0.10)</tspan>
        </text>
      </g>
      <g opacity={prog(t, 14.3)}>
        <circle cx={X(0.189)} cy={Z(0.05)} r={8} fill={C.red} />
        <line x1={X(0.189) + 6} y1={Z(0.05) + 4} x2={420} y2={683} stroke={C.red} strokeWidth={1.5} />
        <text x={430} y={690} fill={C.red} fontSize={22} fontWeight={600}>
          pipeline 의 답 <tspan fontFamily={MONO}>(0.189, 0, 0.05)</tspan>
        </text>
      </g>
    </svg>
  )
}

function Height() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={900} h={750}>
        <HeightPanel t={t} />
      </Panel>
      <Box x={990} y={130} w={870} h={210} at={0.4} title={<Head color={C.accent} size={26}>depth 대신 높이 0.05 m 를 가정</Head>}>
        <span style={line(C.text, 24)}>ray 는 1 m 내려갈 때 로봇 쪽으로 0.2 m 다가온다 (back-projection ② 의 값)</span>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 3.5) }}>x = 0.3 − 0.2 × 0.5 = 0.20</span>
      </Box>
      <Box x={990} y={360} w={870} h={280} at={7.4} title={<Head color={C.orange} size={26}>cube 를 두께 5 cm 인 책 위에 올리면</Head>}>
        <span style={line(C.text, 24)}>
          윗면 <span style={mono(C.green)}>(0.20, 0, 0.10)</span> 은 pixel <span style={mono(C.blue)}>u ≈ 209</span> 에 찍힌다
        </span>
        <Table
          at={14.4}
          step={0.8}
          widths={[200, 180, 220, 180]}
          head={['', '실제', 'pipeline 의 답', '차이']}
          rows={[
            ['앞뒤 위치 x', '0.20', '0.189', '1.1 cm'],
            ['높이', '0.10', '0.05', '5 cm'],
          ]}
          colors={[C.text, C.text]}
        />
      </Box>
      <Box x={990} y={660} w={870} h={220} at={21.2} title={<Head color={C.red} size={26}>결과</Head>}>
        <span style={line(C.text, 24)}>gripper 가 윗면보다 5 cm 아래로 가려다 cube 를 위에서 누른다</span>
        <span style={{ ...line(C.green, 24), opacity: prog(t, 24.2) }}>depth camera 는 이 pixel 의 depth 를 0.45 m 로 직접 재서 위치와 높이가 맞는다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3. IK, the path and MTC ----------

function WaypointPanel({ t }: { t: number }) {
  const X = (x: number) => 160 + (x - 0.15) * 2400
  const Z = (z: number) => 680 - z * 2400
  const g = { x: X(0.2), top: Z(0.225), low: Z(0.025) }
  const p = { x: X(0.3), top: Z(0.225), low: Z(0.025) }
  return (
    <svg width={900} height={750}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        옆에서 본 waypoint (손끝 위치)
      </text>
      <g opacity={prog(t, 0.4)}>
        <line x1={30} y1={Z(0)} x2={870} y2={Z(0)} stroke={C.dim} strokeWidth={3} />
        <rect x={X(0.175)} y={Z(0.05)} width={0.05 * 2400} height={0.05 * 2400} rx={4} fill={`${C.red}55`} stroke={C.red} strokeWidth={2} />
        <rect x={X(0.275)} y={Z(0.05)} width={0.05 * 2400} height={0.05 * 2400} rx={4} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="7 6" />
        <circle cx={g.x} cy={g.low} r={9} fill={C.green} />
        <text x={X(0.175) - 16} y={g.low + 7} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
          ② grasp
        </text>
      </g>
      <g opacity={prog(t, 13.2)}>
        {arrow(g.x - 14, g.top + 12, g.x - 14, g.low - 14, C.green, 3, 11)}
        {arrow(g.x + 14, g.low - 14, g.x + 14, g.top + 12, C.orange, 3, 11, prog(t, 14))}
        {arrow(g.x + 24, g.top, p.x - 24, p.top, C.orange, 3, 11, prog(t, 14.6))}
        {arrow(p.x - 14, p.top + 12, p.x - 14, p.low - 14, C.orange, 3, 11, prog(t, 15.2))}
        {arrow(p.x + 14, p.low - 14, p.x + 14, p.top + 12, C.muted, 3, 11, prog(t, 15.8))}
        <circle cx={g.x} cy={g.top} r={9} fill={C.accent} />
        <circle cx={p.x} cy={p.top} r={9} fill={C.accent} />
        <circle cx={p.x} cy={p.low} r={9} fill={C.orange} />
        <text x={300} y={g.top - 30} textAnchor="end" fill={C.accent} fontSize={22} fontWeight={600}>
          ① pre-grasp · ③ lift
        </text>
        <text x={500} y={p.top - 30} fill={C.accent} fontSize={22} fontWeight={600}>
          ④ pre-place · ⑥ retreat
        </text>
        <text x={X(0.325) + 18} y={p.low + 7} fill={C.orange} fontSize={22} fontWeight={600}>
          ⑤ place
        </text>
        <line x1={400} y1={g.top + 20} x2={400} y2={g.low - 20} stroke={C.muted} strokeWidth={1.5} />
        <line x1={390} y1={g.top + 20} x2={410} y2={g.top + 20} stroke={C.muted} strokeWidth={1.5} />
        <line x1={390} y1={g.low - 20} x2={410} y2={g.low - 20} stroke={C.muted} strokeWidth={1.5} />
        <text x={412} y={386} fill={C.muted} fontSize={22} fontFamily={MONO}>
          0.2 m
        </text>
      </g>
    </svg>
  )
}

function Waypoints() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={900} h={750}>
        <WaypointPanel t={t} />
        <div style={{ position: 'absolute', left: 30, top: 700, opacity: prog(t, 16.4) }}>
          <span style={{ ...mono(C.muted, 20), fontWeight: 400 }}>pre-grasp (0.20, 0, 0.225) · place (0.30, 0, 0.025)</span>
        </div>
      </Panel>
      <Box x={990} y={130} w={870} h={260} at={0.4} title={<Head color={C.green} size={26}>grasp pose · top-down grasp</Head>}>
        <span style={line(C.text, 24)}>
          손끝 = cube 가운데 <span style={mono(C.green)}>(0.20, 0, 0.025)</span> · 손가락 방향 <span style={mono(C.green)}>10°</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 6.8) }}>
          손가락 7 cm, cube 5 cm → 한쪽 여유 <span style={mono(C.orange)}>(7 − 5) ÷ 2 = 1 cm</span>
        </span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 9.4) }}>손끝이 1 cm 넘게 벗어나면 손가락이 모서리에 걸린다 → 모든 module 이 나눠 쓰는 오차 한도</span>
      </Box>
      <Box x={990} y={410} w={870} h={470} at={13.2} title={<Head color={C.accent} size={26}>waypoint 와 IK</Head>}>
        <span style={line(C.text, 23)}>cube 위에서 먼저 멈춘 뒤 수직으로 내려가야 손가락이 cube 를 밀어내지 않는다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 19.2) }}>위팔 0.2 m + 아래팔 0.2 m → 손목은 어깨에서 최대 0.4 m</span>
        <span style={{ ...mono(C.green, 22), opacity: prog(t, 20.4) }}>pre-grasp 손목 √(0.2² + 0.2²) ≈ 0.283 m → 닿음</span>
        <span style={{ ...mono(C.red, 22), opacity: prog(t, 22) }}>놓을 자리 0.40 m → √(0.4² + 0.2²) ≈ 0.447 m → 실패</span>
        <div style={{ opacity: prog(t, 25.6) }}>
          <Table
            at={25.8}
            step={0.6}
            size={22}
            widths={[200, 200, 200, 200]}
            head={['waypoint', 'shoulder_lift', 'elbow_flex', 'wrist_flex']}
            rows={[
              ['pre-grasp', '90°', '−90°', '−90°'],
              ['grasp', '60°', '−120°', '−30°'],
            ]}
          />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.6) }}>같은 손목 자리의 elbow-down 답 (0°, 90°) 대신 앞 waypoint 에 가까운 답</span>
      </Box>
    </AbsoluteFill>
  )
}

function PathPanel({ t }: { t: number }) {
  const X = (x: number) => 140 + (x - 0.19) * 10000
  const Z = (z: number) => 680 - z * 2400
  const pts: [number, number][] = [
    [0.2, 0.225],
    [0.225, 0.118],
    [0.212, 0.05],
    [0.2, 0.025],
  ]
  const P = pts.map(([x, z]) => [X(x), Z(z)] as [number, number])
  // Catmull-Rom through the lesson's four points
  let d = `M ${P[0][0]} ${P[0][1]}`
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)]
    const p1 = P[i]
    const p2 = P[i + 1]
    const p3 = P[Math.min(P.length - 1, i + 2)]
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`
  }
  const draw = prog(t, 0.8, 2.4)
  return (
    <svg width={760} height={750}>
      <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        pre-grasp → grasp 의 손끝 경로
      </text>
      <text x={730} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
        가로 확대
      </text>
      <g opacity={prog(t, 0.4)}>
        <rect x={X(0.19)} y={Z(0.05)} width={X(0.225) - X(0.19)} height={Z(0) - Z(0.05)} fill={`${C.red}33`} stroke={`${C.red}88`} strokeWidth={1.5} />
        <line x1={X(0.19)} y1={Z(0)} x2={X(0.235)} y2={Z(0)} stroke={C.dim} strokeWidth={2} />
        <line x1={X(0.19)} y1={Z(0)} x2={X(0.19)} y2={Z(0.25)} stroke={C.dim} strokeWidth={2} />
        {[
          [0.2, '0.20'],
          [0.212, '0.212'],
          [0.225, '0.225'],
        ].map(([x, s]) => (
          <text key={s as string} x={X(x as number)} y={Z(0) + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {s}
          </text>
        ))}
        <text x={730} y={Z(0) + 30} textAnchor="end" fill={C.dim} fontSize={20}>
          x (m)
        </text>
        {[
          [0.225, '0.225'],
          [0.118, '0.118'],
          [0.05, '0.05'],
        ].map(([z, s]) => (
          <text key={s as string} x={X(0.19) - 12} y={Z(z as number) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {s}
          </text>
        ))}
      </g>
      <path d={d} fill="none" stroke={C.orange} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <g opacity={prog(t, 2.2)}>
        <circle cx={P[1][0]} cy={P[1][1]} r={8} fill={C.orange} />
        <text x={P[1][0] + 18} y={P[1][1] - 6} fill={C.orange} fontSize={22} fontWeight={600}>
          1 초 · 2.5 cm
        </text>
        <text x={470} y={290} fill={C.orange} fontSize={22}>
          joint angle 보간
        </text>
      </g>
      <g opacity={prog(t, 7.2)}>
        <line x1={X(0.21)} y1={Z(0.235)} x2={X(0.21)} y2={Z(0)} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" opacity={0.8} />
        <text x={X(0.21) + 10} y={Z(0.21)} fill={C.orange} fontSize={20}>
          여유 1 cm
        </text>
        <circle cx={P[2][0]} cy={P[2][1]} r={8} fill={C.red} />
        <text x={380} y={600} fill={C.red} fontSize={22} fontWeight={600}>
          윗면 높이에서 1.2 cm
        </text>
      </g>
      <g opacity={prog(t, 9.5)}>
        <line x1={X(0.2)} y1={Z(0.225)} x2={X(0.2)} y2={Z(0.025)} stroke={C.green} strokeWidth={4} />
        <circle cx={X(0.2)} cy={Z(0.025)} r={8} fill={C.green} />
        <text x={X(0.2) - 14} y={300} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
          Cartesian
        </text>
        <text x={X(0.2) - 14} y={328} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
          path
        </text>
      </g>
    </svg>
  )
}

function Path() {
  const t = useSec()
  const kind = (s: string, color: string) => <span style={{ ...mono(color, 22), width: 170, flexShrink: 0 }}>{s}</span>
  const row = (at: number, k: ReactNode, text: ReactNode) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
      {k}
      <span style={line(C.text, 23)}>{text}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={760} h={750}>
        <PathPanel t={t} />
      </Panel>
      <Box x={850} y={130} w={1010} h={290} at={0.4} title={<Head color={C.orange} size={26}>joint angle 을 minimum-jerk 로 보간 (T = 2 초)</Head>}>
        <Table
          at={0.8}
          step={0.6}
          widths={[260, 210, 210, 260]}
          head={['시각', '손끝 x (m)', '높이 (m)', '곧은 경로와 차이']}
          rows={[
            ['0 초', '0.200', '0.225', '0'],
            ['1 초', '0.225', '0.118', '2.5 cm'],
            ['윗면 높이를 지날 때', '0.212', '0.050', '1.2 cm'],
            ['2 초', '0.200', '0.025', '0'],
          ]}
          colors={[undefined, C.orange, C.red, undefined]}
        />
      </Box>
      <Box x={850} y={440} w={1010} h={440} at={7.4} title={<Head color={C.accent} size={26}>MoveIt Task Constructor 의 stage</Head>} gap={12}>
        {row(7.6, kind('CartesianPath', C.green), '손끝을 곧은 선으로 옮기며 0.01 m 간격으로 IK 를 푼다')}
        {row(
          14.7,
          kind('generator', C.accent),
          <>
            generate grasp pose: <span style={mono(C.accent, 22)}>π/12</span> (15°) 마다 후보 → <span style={mono(C.accent, 22)}>2π ÷ (π/12) = 24</span> 개
          </>,
        )}
        {row(16.4, kind('', C.accent), 'grasp pose IK: 후보마다 IK 를 풀어 답이 없는 후보를 버린다 (답 최대 8 개)')}
        {row(22.2, kind('propagator', C.orange), 'approach object · lift object · retreat → Cartesian path')}
        {row(23.6, kind('connector', C.purple), '지금 자세 → pre-grasp, lift → 놓을 자리를 OMPL 로 잇는다')}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.4) }}>계산은 grasp pose 에서 시작해 앞뒤로 넓힌다 · task.plan(5) 로 해를 최대 5 개 찾는다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 4. error budget and the comparison ----------

function Budget() {
  const t = useSec()
  const mm = 56 // px per mm on the bar
  const x0 = 300
  const segs: [string, string, number, string, number][] = [
    ['인식', '2 mm', 2, C.blue, 6.8],
    ['calibration', '3 mm', 3, C.purple, 13.8],
    ['실행', '3 mm', 3, C.green, 14.6],
  ]
  let acc = 0
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={860} h={300} at={0.4} title={<Head color={C.text} size={26}>오차는 고쳐지지 않고 더해진다</Head>} gap={12}>
        <span style={line(C.text, 25)}>인식이 pixel 을 틀리면 3D 위치가 틀리고</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 2) }}>IK 는 그 틀린 자리의 joint angle 을 정확히 푼다</span>
        <span style={{ ...line(C.muted, 25), opacity: prog(t, 3.6) }}>뒤 module 은 앞 module 의 오차를 알 방법이 없다</span>
      </Box>
      <Card x={950} y={130} w={910} h={300} at={0.6}>
        <svg width={910} height={300}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            위에서 본 손가락과 cube
          </text>
          <rect x={297} y={100} width={18} height={180} rx={4} fill={C.muted} />
          <rect x={595} y={100} width={18} height={180} rx={4} fill={C.muted} />
          <rect x={355} y={90} width={200} height={200} rx={6} fill={`${C.red}55`} stroke={C.red} strokeWidth={2} />
          {arrow(318, 185, 352, 185, C.orange, 2.5, 9)}
          {arrow(352, 185, 318, 185, C.orange, 2.5, 9)}
          {arrow(558, 185, 592, 185, C.orange, 2.5, 9)}
          {arrow(592, 185, 558, 185, C.orange, 2.5, 9)}
          <text x={335} y={78} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
            1 cm
          </text>
          <text x={575} y={78} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
            1 cm
          </text>
          <text x={640} y={150} fill={C.muted} fontSize={22}>
            손가락 사이 7 cm
          </text>
          <text x={640} y={185} fill={C.red} fontSize={22}>
            cube 5 cm
          </text>
          <text x={640} y={220} fill={C.orange} fontSize={20} fontFamily={MONO}>
            (7 − 5) ÷ 2 = 1 cm
          </text>
        </svg>
      </Card>
      <Card x={60} y={460} w={1800} h={420} at={6.6}>
        <svg width={1800} height={420} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            손끝 위치 오차 · 같은 방향으로 겹치는 가장 나쁜 경우
          </text>
          <text x={1770} y={44} textAnchor="end" fill={C.accent} fontSize={24} fontWeight={600} opacity={prog(t, 16.2)}>
            error budget: 여유를 module 마다 나눠 준다
          </text>
          <rect x={x0} y={150} width={25 * mm} height={50} rx={6} fill={C.grid} />
          {segs.map(([name, v, n, color, at]) => {
            const x = x0 + acc * mm
            acc += n
            return (
              <g key={name} opacity={prog(t, at)}>
                <rect x={x} y={150} width={n * mm - 3} height={50} rx={4} fill={color} />
                <text x={x + (n * mm) / 2} y={110} textAnchor="middle" fill={color} fontSize={20} fontWeight={600}>
                  {name}
                </text>
                <text x={x + (n * mm) / 2} y={136} textAnchor="middle" fill={color} fontSize={20} fontFamily={MONO}>
                  {v}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 21)}>
            <rect x={x0 + 8 * mm} y={150} width={17 * mm} height={50} rx={4} fill={`${C.red}cc`} />
            <text x={x0 + 16.5 * mm} y={183} textAnchor="middle" fill={C.bg} fontSize={22} fontWeight={700}>
              카메라 2° 기울기 17 mm
            </text>
            <text x={x0 + 25 * mm} y={240} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              합 25 mm
            </text>
          </g>
          <g opacity={prog(t, 15.4)}>
            <text x={x0 + 8 * mm} y={240} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              합 8 mm
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <line x1={x0 + 10 * mm} y1={80} x2={x0 + 10 * mm} y2={260} stroke={C.orange} strokeWidth={3} strokeDasharray="8 6" />
            <text x={x0 + 10 * mm} y={290} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              여유 10 mm
            </text>
            <text x={x0 - 20} y={183} textAnchor="end" fill={C.muted} fontSize={22}>
              손끝 오차
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 316, width: 1740, display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 8.4) }}>
            인식: centroid 가 2 pixel 밀림 · depth 0.5 m 에서 1 pixel 은 <span style={mono(C.blue)}>0.5 ÷ 500 = 0.001 m</span> → 2 mm
          </span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 22.4) }}>
            카메라 2°: 반지름 50 cm 원의 둘레 <span style={mono(C.red)}>2 × 3.14 × 50 = 314 cm</span> 의 2 / 360 → <span style={mono(C.red)}>314 × 2 ÷ 360 ≈ 1.7 cm</span> · 건드리면 calibration 을 다시
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Failures() {
  const t = useSec()
  const kinds: [string, number, string, string][] = [
    ['성공', 41, C.green, '82%'],
    ['인식', 4, C.red, '8%'],
    ['IK', 2, C.orange, '4%'],
    ['grasp', 2, C.purple, '4%'],
    ['충돌', 1, C.pink, '2%'],
  ]
  const cells: string[] = kinds.flatMap(([, n, c]) => Array.from({ length: n }, () => c))
  return (
    <AbsoluteFill>
      <Panel x={60} y={130} w={900} h={420}>
        <svg width={900} height={420}>
          <text x={30} y={45} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            무작위 배치로 50 번 시도 · 한 칸 = 1 번
          </text>
          {cells.map((c, i) => {
            const fixed = i >= 41 && i < 45 && prog(t, 7.6, 0.6) > 0.5
            return <rect key={i} x={30 + (i % 10) * 56} y={80 + Math.floor(i / 10) * 56} width={48} height={48} rx={6} fill={fixed ? C.green : c} opacity={prog(t, 0.4 + i * 0.03, 0.3)} />
          })}
          {kinds.map(([name, n, c, pct], k) => (
            <text key={name} x={660} y={110 + k * 40} fill={c} fontSize={22} fontWeight={600} opacity={prog(t, 2 + k * 0.4)}>
              {name} {n} · {pct}
            </text>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 368, opacity: prog(t, 7.2) }}>
          <span style={line(C.text, 24)}>
            인식 4 번을 고치면 <span style={mono(C.green, 24)}>45 ÷ 50 = 90%</span>
          </span>
        </div>
      </Panel>
      <Box x={990} y={130} w={870} h={420} at={12.7} title={<Head color={C.orange} size={26}>첫 Amazon Picking Challenge (2015)</Head>}>
        <span style={line(C.text, 23)}>26 팀 · 20 분 동안 선반 칸 12 곳에서 정해진 물건 12 개 꺼내기</span>
        <span style={line(C.muted, 23)}>모든 팀이 꺼낸 정답 물건은 합쳐 36 개 · 우승한 RBO 팀은 12 개 중 10 개</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14.4) }}>대회 뒤 설문 · 어려운 정도 점수의 평균 (높을수록 어려움)</span>
        <Bar label="인식" value={4.52} max={5} color={C.red} at={15} />
        <Bar label="grasping" value={4.36} max={5} color={C.orange} at={15.6} />
        <Bar label="planning and control" value={3.75} max={5} color={C.blue} at={16.2} />
      </Box>
      <Card x={60} y={580} w={1800} h={300} at={19.2}>
        <div style={{ padding: '20px 40px', display: 'grid', gap: 10 }}>
          <span style={line(C.text, 25)}>
            <span style={{ color: C.accent, fontWeight: 600 }}>end-to-end</span>: 시연의 (사진, 관절 각도) 로 network 하나를 학습 · Levine 등 (2016) 은 parameter <span style={mono(C.accent, 25)}>92,000</span> 개 CNN 으로 영상 → motor torque
          </span>
          <Table
            at={25.6}
            step={0.5}
            widths={[260, 720, 720]}
            sans={[1, 2]}
            head={['기준', '모듈 pipeline', 'end-to-end policy']}
            rows={[
              ['필요한 것', 'calibration, 사람이 짠 규칙', '시연 데이터'],
              ['고장 진단', 'module 별 중간 값으로 원인을 찾는다', '중간 값이 없어 영상으로 실패 모습을 나눈다'],
              ['물체가 바뀌면', '여러 module 의 규칙을 다시 짠다', '새 물체의 시연을 모아 다시 학습한다'],
              ['실패하기 쉬운 때', '높이 · 색 · calibration 가정이 틀릴 때', '시연 범위 밖의 위치 · 물체 · 조명'],
            ]}
          />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'module 마다 입력 · 출력을 정해 중간 값을 확인 · 빨강의 몫 0.74 · box 가운데 (220, 240)', at: 0.6 },
    { tag: script.sections[1], color: C.blue, text: '(220, 240) 과 depth 0.5 m → (0.20, 0, 0.05) · 높이 가정이 틀리면 1.1 cm · 5 cm 틀림', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'joint 보간은 손끝이 1.2 cm 휨 → Cartesian path · generator · propagator · connector', at: 8.4 },
    { tag: script.sections[3], color: C.red, text: '2 + 3 + 3 = 8 mm 가 여유 10 mm 안 · 카메라 2° 면 25 mm · 인식을 고치면 82% → 90%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            사진 한 장에서 손가락이 닫히기까지, 어느 계산이 틀렸는지 어떻게 가려낼까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · GRASPING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Grasp Planning · Behavior Cloning</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            손가락을 어디에 어느 방향으로 댈지 계산하기 · 사람이 짠 규칙 없이 시연에서 배우기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/classical-pick (Amazon Picking Challenge · MoveIt Task Constructor · YOLO-World · Levine 등 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseMask = () => (
  <PauseWrite
    question="밝기가 반이 된 책상 pixel (60, 55, 50) 은 ‘빨강의 몫 ≥ 0.6’ 규칙으로 cube 일까?"
    answer={
      <>
        60 + 55 + 50 = 165 → 60 ÷ 165 ≈ 0.36 &lt; 0.6 → cube 가 아니다
        <br />
        밝은 책상의 몫 0.36 과 같아서, 밝기가 바뀌어도 판정이 바뀌지 않는다
      </>
    }
  />
)

const PauseBackproject = () => (
  <PauseWrite
    question="pixel (420, 290) 의 depth 가 0.5 m 다. base frame 좌표는? (f = 500, principal point (320, 240), 카메라 (0.3, 0, 0.55))"
    answer={
      <>
        (100, 50) → ÷ 500 → (0.2, 0.1) → × 0.5 → camera (0.1, 0.05, 0.5)
        <br />
        (0.1, −0.05, −0.5) + (0.3, 0, 0.55) = (0.4, −0.05, 0.05) · 앞 40 cm, 오른쪽 5 cm
      </>
    }
  />
)

const PauseMtc = () => (
  <PauseWrite
    question="generate grasp pose 의 간격을 π/12 에서 π/6 으로 바꾸면 한 바퀴의 후보는 몇 개? 후보마다 IK 답을 최대 8 개 구하면 모두 최대 몇 개?"
    answer={
      <>
        2π ÷ (π/6) = 12 개 → 12 × 8 = 96 개까지
        <br />
        닿지 않거나 충돌하는 후보가 빠져서 실제로는 더 적다
      </>
    }
  />
)

const PauseFail = () => (
  <PauseWrite
    question="40 번 시도에 30 번 성공했고, 실패 10 번 가운데 grasp 실패가 6 번이다. 지금 성공률은? grasp 실패를 모두 고치면?"
    answer="지금 30 ÷ 40 = 75% → 성공 30 + 6 = 36 번 → 36 ÷ 40 = 90%"
  />
)

export function ClassicalPick() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        pipeline: Pipeline,
        mask: Mask,
        'pause-mask': PauseMask,
        backproject: Backproject,
        height: Height,
        'pause-backproject': PauseBackproject,
        waypoints: Waypoints,
        path: Path,
        'pause-mtc': PauseMtc,
        budget: Budget,
        failures: Failures,
        'pause-fail': PauseFail,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
