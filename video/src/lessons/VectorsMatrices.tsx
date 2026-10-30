import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './vectors-matrices.narration.json'
import { script } from './vectors-matrices.script'

// Numbers follow lessons/vectors-matrices/README.md (see vectors-matrices.script.ts). The planes are drawn to scale; the
// slope and the robot body are schematic. Every number on screen is the lesson's.

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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, opacity = 1, dash?: string) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a matrix (or a column vector) between two brackets */
function Mat({ rows, color = C.muted, size = 28, rowColors }: { rows: (string | number)[][]; color?: string; size?: number; rowColors?: (string | undefined)[] }) {
  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${rows[0].length}, auto)`,
        columnGap: Math.round(size * 0.75),
        rowGap: 2,
        padding: `4px ${Math.round(size * 0.45)}px`,
        borderLeft: `3px solid ${color}`,
        borderRight: `3px solid ${color}`,
        borderRadius: 8,
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {rows.flatMap((r, i) =>
        r.map((v, j) => (
          <span key={`${i}-${j}`} style={{ textAlign: 'right', color: rowColors?.[i] ?? C.text }}>
            {v}
          </span>
        )),
      )}
    </div>
  )
}

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors, align = 'right' }: { head?: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; align?: 'left' | 'right' }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : align, paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {head && (
        <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          {head.map((h, i) => (
            <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            MATH · VECTORS & MATRICES
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Vectors & Matrices</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            숫자 묶음을 <span style={{ color: C.accent }}>돌리고 · 늘이고 · 되돌리기</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            로봇의 위치 · 속도 · 관절 각도 · 센서 값을 vector 로 적고 행렬로 바꾼다
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

/** the robot body with a LiDAR turned 30° counter-clockwise on it, and the obstacle it measured (1 m = 130 px) */
function LidarDiagram({ t, at }: { t: number; at: number }) {
  const o = { x: 120, y: 420 }
  const s = 130
  const P = (x: number, y: number) => ({ x: o.x + x * s, y: o.y - y * s })
  const c30 = 0.866
  const s30 = 0.5
  const lx = P(2.8 * c30, 2.8 * s30)
  const ly = P(-1.3 * s30, 1.3 * c30)
  const mid = P(2 * c30, 2 * s30)
  const obs = P(1.232, 1.866)
  return (
    <svg width={760} height={470}>
      <g opacity={prog(t, at)}>
        <rect x={o.x - 40} y={o.y - 28} width={80} height={56} rx={10} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
        {arrow(o.x, o.y, 470, o.y, C.blue, 3)}
        {arrow(o.x, o.y, o.x, 90, C.blue, 3)}
        <text x={480} y={o.y + 7} fill={C.blue} fontSize={22}>
          로봇 앞 (x)
        </text>
        <text x={o.x + 14} y={96} fill={C.blue} fontSize={22}>
          로봇 왼쪽 (y)
        </text>
      </g>
      <g opacity={prog(t, at + 0.4)}>
        {arrow(o.x, o.y, lx.x, lx.y, C.orange, 2.5, 11)}
        {arrow(o.x, o.y, ly.x, ly.y, C.orange, 2.5, 11)}
        <circle cx={o.x} cy={o.y} r={9} fill={C.orange} />
        <text x={lx.x + 11} y={lx.y + 2} fill={C.orange} fontSize={20}>
          LiDAR 앞
        </text>
        <text x={6} y={ly.y - 18} fill={C.orange} fontSize={20}>
          LiDAR 왼쪽
        </text>
        <path d={`M ${o.x + 80} ${o.y} A 80 80 0 0 0 ${o.x + 80 * c30} ${o.y - 80 * s30}`} fill="none" stroke={C.orange} strokeWidth={2} />
        <text x={215} y={410} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          30°
        </text>
      </g>
      <g opacity={prog(t, at + 1)}>
        <line x1={o.x} y1={o.y} x2={mid.x} y2={mid.y} stroke={C.text} strokeWidth={3} strokeDasharray="7 6" />
        <line x1={mid.x} y1={mid.y} x2={obs.x} y2={obs.y} stroke={C.text} strokeWidth={3} strokeDasharray="7 6" />
        <text x={291} y={355} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
          2 m
        </text>
        <text x={338} y={220} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
          1 m
        </text>
        <circle cx={obs.x} cy={obs.y} r={10} fill={C.red} />
        <text x={obs.x + 16} y={obs.y - 6} fill={C.red} fontSize={22} fontWeight={600}>
          장애물
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={470}>
        <LidarDiagram t={t} at={0.5} />
        <div style={{ position: 'absolute', left: 820, top: 46, width: 930, display: 'grid', gap: 18 }}>
          <div style={{ opacity: prog(t, 0.6) }}>
            <Head>LiDAR 가 잰 장애물</Head>
          </div>
          <span style={{ ...mono(C.orange, 30), opacity: prog(t, 1) }}>LiDAR 기준: 앞 2 m · 왼쪽 1 m</span>
          <span style={{ ...line(C.text, 25), opacity: prog(t, 1.6) }}>LiDAR 는 로봇 정면에서 시계 반대 방향으로 30° 돌아간 채 달려 있다</span>
          <span style={{ ...line(C.text, 25), opacity: prog(t, 2.2) }}>그래서 LiDAR 의 앞은 로봇의 앞이 아니다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.8) }}>ROS 2 의 tf2 library 도 점을 옮길 때, policy 의 neural network 도 층마다 같은 곱셈을 한다</span>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 625, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          LiDAR 의 앞쪽 2 m, 왼쪽 1 m 를 로봇 기준으로 바꾸려면
          <br />
          <span style={{ color: C.accent }}>무엇을 계산해야 할까?</span>
        </div>
      </Appear>
      <Appear at={6} style={{ position: 'absolute', left: 64, top: 795, width: 1792, textAlign: 'center' }}>
        <Label color={C.muted} size={28}>
          숫자를 순서대로 묶은 것은 vector, 숫자를 표처럼 늘어놓은 것은 행렬
        </Label>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- vector and norm ----------

/** the desk plane in m (1 m = 850 px): gripper (0.3, 0.2), target (0.6, 0.6) */
function DeskPlane({ t, at, target, disp, vel, tri, after }: { t: number; at: number; target?: number; disp?: number; vel?: number; tri?: number; after?: number }) {
  const o = { x: 110, y: 680 }
  const s = 850
  const P = (x: number, y: number) => ({ x: o.x + x * s, y: o.y - y * s })
  const G = P(0.3, 0.2)
  const T = P(0.6, 0.6)
  const A = P(0.42, 0.36)
  const ticks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
  const op = (a?: number) => (a === undefined ? 0 : prog(t, a))
  return (
    <svg width={820} height={740}>
      <g opacity={prog(t, at)}>
        <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
          책상 위 gripper 와 목표 (m)
        </text>
        {ticks.map((k) => (
          <g key={k}>
            <line x1={P(k, 0).x} y1={o.y} x2={P(k, 0).x} y2={P(0, 0.7).y} stroke={C.grid} strokeWidth={1.5} />
            <line x1={o.x} y1={P(0, k).y} x2={P(0.7, 0).x} y2={P(0, k).y} stroke={C.grid} strokeWidth={1.5} />
            <text x={P(k, 0).x} y={o.y + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {k}
            </text>
            <text x={o.x - 12} y={P(0, k).y + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {k}
            </text>
          </g>
        ))}
        <line x1={o.x} y1={o.y} x2={P(0.7, 0).x} y2={o.y} stroke={C.muted} strokeWidth={2} />
        <line x1={o.x} y1={o.y} x2={o.x} y2={P(0, 0.7).y} stroke={C.muted} strokeWidth={2} />
        <circle cx={G.x} cy={G.y} r={10} fill={C.blue} />
        <text x={G.x - 15} y={G.y + 40} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
          gripper (0.3, 0.2)
        </text>
      </g>
      <g opacity={op(target)}>
        <circle cx={T.x} cy={T.y} r={10} fill={C.green} />
        <text x={T.x - 16} y={T.y - 10} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
          목표 (0.6, 0.6)
        </text>
      </g>
      <g opacity={op(tri)}>
        <line x1={G.x} y1={G.y} x2={T.x} y2={G.y} stroke={C.muted} strokeWidth={2} strokeDasharray="7 6" />
        <line x1={T.x} y1={G.y} x2={T.x} y2={T.y} stroke={C.muted} strokeWidth={2} strokeDasharray="7 6" />
        <text x={(G.x + T.x) / 2} y={G.y + 30} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.3
        </text>
        <text x={T.x + 14} y={(G.y + T.y) / 2 + 8} fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600}>
          0.4
        </text>
        <text x={520} y={450} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600}>
          0.5 m
        </text>
      </g>
      <g opacity={op(disp)}>
        {arrow(G.x, G.y, T.x - 6, T.y + 8, C.green, 4, 14)}
        {disp !== undefined && tri === undefined && (
          <text x={(G.x + T.x) / 2 + 32} y={(G.y + T.y) / 2 + 30} fill={C.green} fontSize={22} fontWeight={600}>
            변위 <tspan fontFamily={MONO}>(0.3, 0.4)</tspan>
          </text>
        )}
      </g>
      <g opacity={op(vel)}>
        {arrow(G.x, G.y, A.x, A.y, C.orange, 7, 18)}
        <text x={395} y={416} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
          2 × 속도
        </text>
        <text x={395} y={444} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          (0.12, 0.16)
        </text>
      </g>
      <g opacity={op(after)}>
        <circle cx={A.x} cy={A.y} r={10} fill={C.orange} />
        <text x={440} y={380} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
          2 초 뒤 <tspan fontFamily={MONO}>(0.42, 0.36)</tspan>
        </text>
        <text x={530} y={252} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
          남은 <tspan fontFamily={MONO}>0.3 m</tspan>
        </text>
      </g>
    </svg>
  )
}

function VectorScene() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={860} h={420} at={0.3} title={<Head color={C.accent}>로봇의 값을 적은 vector</Head>}>
        <Table
          head={['로봇의 값', 'vector', 'dimension']}
          widths={[330, 300, 150]}
          at={0.6}
          step={0.5}
          rows={[
            ['gripper 끝의 위치', '(0.3, 0.2)', '2'],
            ['관절 세 개인 팔의 자세', '(30°, −45°, 60°)', '3'],
            ['카메라 사진의 pixel 하나', '(255, 128, 0)', '3'],
            ['LiDAR 가 잰 점 하나', '(2, 1, 2)', '3'],
          ]}
        />
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 6.6) }}>
          <span style={line(C.text, 23)}>frame: 원점과 축 방향과 단위(m 인지 mm 인지)를 정해 둔 기준</span>
          <span style={line(C.muted, 22)}>서론의 문제는 LiDAR frame 의 숫자를 로봇 frame 의 숫자로 바꾸는 일</span>
        </div>
      </Box>
      <Box x={64} y={570} w={860} h={310} at={19.5} gap={10} color={`${C.orange}88`} title={<Head color={C.orange}>scalar 곱: 방향은 그대로, 길이만 배수</Head>}>
        <span style={mono(C.orange, 26)}>2 × (0.06, 0.08) = (0.12, 0.16) m</span>
        <span style={line(C.text, 23)}>속도 (0.06, 0.08) m/s 로 2 초 움직인 변위 · 음수를 곱하면 방향이 반대</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.5) }}>
          <span style={mono(C.text, 24)}>새 위치 = 지금 위치 + Δt × 속도</span> <span style={{ color: C.muted }}>(Δt: 시간 간격)</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23) }}>관절 자세 (30°, −45°, 60°) → (40°, −45°, 50°): 차이 (10°, 0°, −10°) 의 0.1 배를 10 번 더하면 세 관절이 동시에 닿는다</span>
      </Box>
      <Card x={950} y={130} w={906} h={750} at={0.3}>
        <div style={{ position: 'absolute', left: 40, top: 0 }}>
          <DeskPlane t={t} at={0.5} target={13} disp={13.6} vel={19.8} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function NormScene() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={820} h={750} at={0.3}>
        <DeskPlane t={t} at={0.4} target={0.4} disp={0.8} tri={1.2} after={24.8} />
      </Card>
      <Box x={914} y={130} w={942} h={260} at={0.3} color={`${C.green}88`} title={<Head color={C.green}>norm: 원점에서 끝까지의 직선 거리</Head>}>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 0.8) }}>‖(0.3, 0.4)‖ = √(0.3² + 0.4²) = √0.25 = 0.5 m</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 6.6) }}>
          LiDAR 점 ‖(2, 1, 2)‖ = √(4 + 1 + 4) = 3 m
        </span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 12.6) }}>도착 판정: 거리가 미리 정한 값(예: 0.01 m)보다 작은가</span>
      </Box>
      <Box x={914} y={405} w={942} h={200} at={18.5} color={`${C.accent}88`} title={<Head color={C.accent}>unit vector: norm 으로 나눠 길이 1</Head>}>
        <span style={mono(C.accent, 26)}>(0.3, 0.4) ÷ 0.5 = (0.6, 0.8)</span>
        <span style={{ ...mono(C.muted, 24), opacity: prog(t, 20) }}>‖(0.6, 0.8)‖ = √(0.36 + 0.64) = 1 · 방향만 담는다</span>
      </Box>
      <Box x={914} y={620} w={942} h={260} at={24.5} color={`${C.orange}88`} title={<Head color={C.orange}>속력 0.1 m/s 명령과 2 초 뒤</Head>}>
        <span style={mono(C.orange, 24)}>0.1 × (0.6, 0.8) = (0.06, 0.08) m/s</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 25.6) }}>(0.3, 0.2) + 2 × (0.06, 0.08) = (0.42, 0.36)</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 26.6) }}>남은 (0.18, 0.24): √(0.0324 + 0.0576) = 0.3 m</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- dot product ----------

/** a robot on a 30° slope, gravity split into the part along the slope and the part into it (1 N = 1.8 px) */
function Slope({ t }: { t: number }) {
  const A = { x: 60, y: 640 }
  const B = { x: 700, y: 640 }
  const top = { x: 700, y: 640 - 640 * Math.tan(Math.PI / 6) }
  const cc = { x: 380, y: 409 }
  const k = 1.8
  const g = { x: cc.x, y: cc.y + 98.1 * k }
  const su = { x: cc.x - 0.866 * 49.05 * k, y: cc.y + 0.5 * 49.05 * k }
  const sn = { x: cc.x + 0.5 * 84.96 * k, y: cc.y + 0.866 * 84.96 * k }
  const u0 = { x: 540, y: 300 }
  return (
    <svg width={846} height={590}>
      <g opacity={prog(t, 6.6)}>
        <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
          30° 경사로의 10 kg 로봇
        </text>
        <text x={816} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
      <g transform="translate(0 -110)">
      <g opacity={prog(t, 6.6)}>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${top.x},${top.y}`} fill={`${C.muted}14`} stroke={C.muted} strokeWidth={2} />
        <path d={`M ${A.x + 90} ${A.y} A 90 90 0 0 0 ${A.x + 90 * 0.866} ${A.y - 45}`} fill="none" stroke={C.muted} strokeWidth={2} />
        <text x={165} y={627} fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600}>
          30°
        </text>
      </g>
      <g opacity={prog(t, 7.4)}>
        {arrow(cc.x, cc.y, g.x, g.y, C.red, 4, 14)}
        <text x={366} y={578} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600}>
          gravity
        </text>
        <text x={366} y={604} textAnchor="end" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
          98.1 N
        </text>
      </g>
      <g opacity={prog(t, 13.4)}>
        {arrow(u0.x, u0.y, u0.x + 80 * 0.866, u0.y - 40, C.accent, 3, 11)}
        <text x={u0.x + 80 * 0.866 + 10} y={u0.y - 40} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          u
        </text>
        {arrow(cc.x, cc.y, su.x, su.y, C.accent, 5, 15)}
        <text x={285} y={432} textAnchor="end" fill={C.accent} fontSize={22} fontWeight={600}>
          경사 몫
        </text>
        <text x={285} y={458} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          −49.05 N
        </text>
      </g>
      <g opacity={prog(t, 19.8)}>
        {arrow(u0.x, u0.y, u0.x - 40, u0.y - 80 * 0.866, C.purple, 3, 11)}
        <text x={u0.x - 40 - 22} y={u0.y - 80 * 0.866 - 6} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
          n
        </text>
        {arrow(cc.x, cc.y, sn.x, sn.y, C.purple, 5, 15)}
        <text x={472} y={566} fill={C.purple} fontSize={22} fontWeight={600}>
          수직 몫
        </text>
        <text x={472} y={592} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
          −84.96 N
        </text>
      </g>
      <g opacity={prog(t, 6.6)}>
        <g transform={`rotate(-30 ${cc.x} ${cc.y})`}>
          <rect x={cc.x - 60} y={cc.y - 34} width={120} height={68} rx={10} fill={C.card} stroke={C.blue} strokeWidth={2.5} />
          <text x={cc.x} y={cc.y + 8} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
            10 kg
          </text>
        </g>
      </g>
      </g>
    </svg>
  )
}

function DotSlope() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={846} h={140} at={0.3} color={`${C.accent}88`} title={<Head color={C.accent}>dot product: 같은 자리끼리 곱해 더한다</Head>}>
        <span style={mono(C.text, 26)}>(3, 4) · (2, 1) = 3 × 2 + 4 × 1 = 10</span>
      </Box>
      <Card x={64} y={290} w={846} h={590} at={6.5}>
        <Slope t={t} />
      </Card>
      <Box x={940} y={130} w={916} h={195} at={6.5} title={<Head>gravity g 와 경사 방향 u</Head>}>
        <span style={mono(C.red, 24)}>g = (0, −98.1) N · 10 × 9.81 = 98.1</span>
        <span style={{ ...mono(C.accent, 24), opacity: prog(t, 13.2) }}>u = (0.866, 0.5) · √(0.75 + 0.25) = 1</span>
      </Box>
      <Box x={940} y={345} w={916} h={235} at={13} color={`${C.accent}88`} title={<Head color={C.accent}>경사를 따라 작용하는 몫</Head>}>
        <span style={mono(C.accent, 24)}>g · u = 0 × 0.866 + (−98.1) × 0.5 = −49.05 N</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 15.5) }}>음수라서 내려가는 쪽 · 바퀴가 경사를 따라 위로 49.05 N 을 밀어야 한다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>바퀴 반지름 0.05 m → torque 0.05 × 49.05 ≈ 2.45 N·m (motor 를 고르는 기준)</span>
      </Box>
      <Box x={940} y={600} w={916} h={280} at={19.5} color={`${C.purple}88`} title={<Head color={C.purple}>면에 수직인 몫 · projection</Head>}>
        <span style={mono(C.purple, 24)}>n = (−0.5, 0.866)</span>
        <span style={mono(C.purple, 24)}>g · n = (−98.1) × 0.866 = −84.96 N</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.5) }}>unit vector 와의 dot product = 그 방향 직선 위로 수직으로 떨어뜨린 그림자의 길이</span>
      </Box>
    </AbsoluteFill>
  )
}

/** two arrows from one point and the angle between them, 576 × 190 */
function Angle({ t, at, deg, aLabel, bLabel, color, bLabelPos }: { t: number; at: number; deg: number; aLabel: string; bLabel: string; color: string; bLabelPos: [number, number] }) {
  const o = { x: 190, y: 160 }
  const r = deg === 90 ? 140 : 150
  const rad = (deg * Math.PI) / 180
  const b = { x: o.x + r * Math.cos(rad), y: o.y - r * Math.sin(rad) }
  const arcR = 42
  const mid = rad / 2
  return (
    <svg width={576} height={190}>
      <g opacity={prog(t, at)}>
        {arrow(o.x, o.y, o.x + 170, o.y, C.blue, 4, 13)}
        <text x={o.x + 180} y={o.y + 7} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
          {aLabel}
        </text>
        {arrow(o.x, o.y, b.x, b.y, color, 4, 13)}
        <text x={bLabelPos[0]} y={bLabelPos[1]} fill={color} fontSize={20} fontFamily={MONO} fontWeight={600}>
          {bLabel}
        </text>
        <path d={`M ${o.x + arcR} ${o.y} A ${arcR} ${arcR} 0 0 0 ${o.x + arcR * Math.cos(rad)} ${o.y - arcR * Math.sin(rad)}`} fill="none" stroke={C.muted} strokeWidth={2} />
        <text x={o.x + 64 * Math.cos(mid)} y={o.y - 64 * Math.sin(mid) + 8} textAnchor="middle" fill={C.muted} fontSize={22}>
          θ
        </text>
      </g>
    </svg>
  )
}

function DotSign() {
  const t = useSec()
  const cards = [
    { x: 64, at: 6.5, color: C.green, head: '양수 · θ 가 90° 보다 작다', deg: 30, a: '(1, 0)', b: '(0.866, 0.5)', bp: [330, 82] as [number, number], ex: ['(0.866, 0.5) · (1, 0)', '= 0.866 = cos 30°'], mean: '대체로 같은 쪽' },
    { x: 672, at: 8, color: C.orange, head: '0 · θ 가 90°', deg: 90, a: 'u', b: 'n', bp: [204, 32] as [number, number], ex: ['0.866 × (−0.5) + 0.5 × 0.866', '= 0'], mean: '경사 방향 u 와 수직 방향 n 은 직각' },
    { x: 1280, at: 9.5, color: C.red, head: '음수 · θ 가 90° 보다 크다', deg: 126.87, a: '(1, 0)', b: '(−0.6, 0.8)', bp: [6, 24] as [number, number], ex: ['(1, 0) · (−0.6, 0.8)', '= −0.6'], mean: '(1, 0) 을 보는 로봇에게 목표가 등 뒤' },
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1792} h={130} at={0.3} color={`${C.accent}88`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          <span style={mono(C.accent, 40)}>a · b = ‖a‖ ‖b‖ cos θ</span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 1.4) }}>
            cos θ 는 0° 에서 1, 90° 에서 0, 180° 에서 −1 → 부호만 봐도 두 방향의 관계를 안다
          </span>
        </div>
      </Box>
      {cards.map((c) => (
        <Card key={c.x} x={c.x} y={285} w={576} h={370} at={c.at}>
          <div style={{ position: 'absolute', left: 28, top: 20 }}>
            <Head color={c.color} size={26}>
              {c.head}
            </Head>
          </div>
          <div style={{ position: 'absolute', left: 0, top: 66 }}>
            <Angle t={t} at={c.at + 0.2} deg={c.deg} aLabel={c.a} bLabel={c.b} color={c.color} bLabelPos={c.bp} />
          </div>
          <div style={{ position: 'absolute', left: 28, top: 262, display: 'grid', gap: 4, opacity: prog(t, c.color === C.red ? 13.2 : c.at + 0.6) }}>
            {c.ex.map((e) => (
              <span key={e} style={mono(c.color, 22)}>
                {e}
              </span>
            ))}
            <span style={line(C.muted, 21)}>{c.mean}</span>
          </div>
        </Card>
      ))}
      <Box x={64} y={675} w={1792} h={205} at={19.5} color={`${C.purple}88`} title={<Head color={C.purple}>cosine similarity: 두 vector 를 길이 1 로 맞춘 뒤의 dot product = cos θ</Head>}>
        <span style={line(C.text, 24)}>길이와 상관없이 같은 쪽을 향하는 정도만 재서, 화살표로 그릴 수 없는 vector 에도 쓸 수 있다</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 21.5) }}>CLIP: 사진 한 장과 문장 하나를 숫자 수백 개짜리 vector 로 바꾸고, 사진과 cosine similarity 가 가장 큰 문장을 짝으로 고른다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- matrix products ----------

/** the robot frame (1 m = 190 px): R(30°)'s columns and where (2, 1) lands */
function RotPlane({ t }: { t: number }) {
  const o = { x: 240, y: 450 }
  const s = 190
  const P = (x: number, y: number) => ({ x: o.x + x * s, y: o.y - y * s })
  const raw = P(2, 1)
  const out = P(1.232, 1.866)
  const c1 = P(0.866, 0.5)
  const c2 = P(-0.5, 0.866)
  const c1x2 = P(1.732, 1)
  const R = 2.236 * s
  return (
    <svg width={862} height={500}>
      <g opacity={prog(t, 6.6)}>
        <text x={840} y={40} textAnchor="end" fill={C.text} fontSize={22} fontWeight={600}>
          로봇 frame (m)
        </text>
        <line x1={60} y1={o.y} x2={700} y2={o.y} stroke={C.muted} strokeWidth={2} />
        <line x1={o.x} y1={480} x2={o.x} y2={44} stroke={C.muted} strokeWidth={2} />
        <text x={P(1, 0).x} y={o.y + 28} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
          1
        </text>
        <text x={P(2, 0).x} y={o.y + 28} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
          2
        </text>
        <text x={o.x - 14} y={P(0, 2).y + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
          2
        </text>
        <text x={704} y={o.y + 6} fill={C.muted} fontSize={20}>
          x 앞
        </text>
        <text x={o.x + 14} y={62} fill={C.muted} fontSize={20}>
          y 왼쪽
        </text>
        <circle cx={raw.x} cy={raw.y} r={8} fill={C.muted} />
        <text x={raw.x + 14} y={raw.y + 7} fill={C.muted} fontSize={20}>
          <tspan fontFamily={MONO}>(2, 1)</tspan> LiDAR 숫자
        </text>
      </g>
      <g opacity={prog(t, 8)}>
        <path d={`M ${raw.x} ${raw.y} A ${R} ${R} 0 0 0 ${out.x} ${out.y}`} fill="none" stroke={C.orange} strokeWidth={2.5} strokeDasharray="7 6" />
        <text x={585} y={150} fill={C.orange} fontSize={20} fontWeight={600}>
          30° 회전
        </text>
        <circle cx={out.x} cy={out.y} r={10} fill={C.green} />
        <text x={out.x + 16} y={out.y - 3} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (1.232, 1.866)
        </text>
      </g>
      <g opacity={prog(t, 18.8)}>
        {arrow(o.x, o.y, c1.x, c1.y, C.blue, 5, 15)}
        {arrow(o.x, o.y, c2.x, c2.y, C.purple, 5, 15)}
        <text x={c1.x - 5} y={c1.y + 36} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (0.866, 0.5)
        </text>
        <text x={c2.x} y={c2.y - 16} textAnchor="middle" fill={C.purple} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (−0.5, 0.866)
        </text>
      </g>
      <g opacity={prog(t, 20.5)}>
        <line x1={c1.x} y1={c1.y} x2={c1x2.x} y2={c1x2.y} stroke={C.blue} strokeWidth={3} strokeDasharray="6 6" />
        {arrow(c1x2.x, c1x2.y, out.x, out.y, C.purple, 3, 12, 1, '6 6')}
      </g>
    </svg>
  )
}

function Rows() {
  const t = useSec()
  const r1 = prog(t, 7.2)
  const r2 = prog(t, 9.2)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={750} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 26, width: 840, display: 'grid', gap: 16 }}>
          <Head color={C.accent}>행렬 × vector: 행마다 dot product</Head>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.8) }}>행렬은 숫자를 행(가로줄)과 열(세로줄)로 늘어놓은 표 · 곱할 때 vector 는 세로로 세워 적는다</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 6, opacity: prog(t, 6.5) }}>
            <span style={line(C.muted, 24)}>R(30°)</span>
            <Mat rows={[['0.866', '−0.5'], ['0.5', '0.866']]} size={32} rowColors={[r1 > 0.5 ? C.accent : undefined, r2 > 0.5 ? C.accent : undefined]} />
            <Mat rows={[['2'], ['1']]} size={32} rowColors={[C.orange, C.orange]} />
            <span style={mono(C.muted, 32)}>=</span>
            <div style={{ opacity: r1 }}>
              <Mat rows={[['1.232'], [r2 > 0.05 ? '1.866' : '']]} size={32} rowColors={[C.green, C.green]} />
            </div>
          </div>
          <span style={{ ...mono(C.text, 24), opacity: r1 }}>첫째 행 (0.866, −0.5): 0.866 × 2 + (−0.5) × 1 = 1.232</span>
          <span style={{ ...mono(C.text, 24), opacity: r2 }}>둘째 행 (0.5, 0.866): 0.5 × 2 + 0.866 × 1 = 1.866</span>
          <div style={{ display: 'grid', gap: 4, marginTop: 8, opacity: prog(t, 12.6) }}>
            <span style={mono(C.green, 24)}>√(2² + 1²) = √(1.232² + 1.866²) = 2.236 m</span>
            <span style={line(C.muted, 22)}>회전은 방향만 바꾸고 길이는 지킨다 · 로봇 기준 앞 1.232 m, 왼쪽 1.866 m</span>
          </div>
          <div style={{ display: 'grid', gap: 4, marginTop: 8, opacity: prog(t, 18.6) }}>
            <span style={line(C.text, 23)}>열로 읽기: 첫째 열은 (1, 0) 이, 둘째 열은 (0, 1) 이 도착하는 곳</span>
            <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.2) }}>
              2 × <span style={{ color: C.blue }}>(0.866, 0.5)</span> + 1 × <span style={{ color: C.purple }}>(−0.5, 0.866)</span>
            </span>
            <span style={{ ...mono(C.green, 24), opacity: prog(t, 20.8) }}>= (1.232, 1.866)</span>
          </div>
        </div>
      </Card>
      <Card x={994} y={130} w={862} h={500} at={6.5}>
        <RotPlane t={t} />
      </Card>
      <Box x={994} y={650} w={862} h={230} at={24.5} color={`${C.orange}88`} title={<Head color={C.orange}>단위 변환 S: pixel → m (pixel 한 칸 = 2 mm)</Head>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Mat rows={[['0.002', '0'], ['0', '−0.002']]} size={26} rowColors={[undefined, C.orange]} />
          <span style={mono(C.text, 26)}>S (150, 100) = (0.3, −0.2) m</span>
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26) }}>사진의 y 는 아래로 커지고 책상 frame 은 위가 +y → 둘째 행의 − 가 뒤집는다</span>
      </Box>
    </AbsoluteFill>
  )
}

/** a turntable turning 90° about the origin and a conveyor moving 3 m along x, in both orders (1 m = 50 px) */
function OrderPlane({ t }: { t: number }) {
  const o = { x: 170, y: 400 }
  const s = 50
  const P = (x: number, y: number) => ({ x: o.x + x * s, y: o.y - y * s })
  const a = P(2, 1)
  const g1 = P(-1, 2)
  const g2 = P(2, 2)
  const r1 = P(5, 1)
  const r2 = P(-1, 5)
  const rA = Math.sqrt(5) * s
  const rB = Math.sqrt(26) * s
  return (
    <svg width={862} height={460}>
      <g opacity={prog(t, 13.2)}>
        <text x={24} y={36} fill={C.text} fontSize={22} fontWeight={600}>
          턴테이블 90° · 컨베이어 x 방향 3 m
        </text>
        <line x1={P(-1.6, 0).x} y1={o.y} x2={P(5.6, 0).x} y2={o.y} stroke={C.muted} strokeWidth={2} />
        <line x1={o.x} y1={P(0, -0.6).y} x2={o.x} y2={P(0, 5.6).y} stroke={C.muted} strokeWidth={2} />
        <circle cx={a.x} cy={a.y} r={8} fill={C.text} />
        <text x={a.x} y={a.y + 30} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (2, 1)
        </text>
      </g>
      <g opacity={prog(t, 13.8)}>
        <path d={`M ${a.x} ${a.y} A ${rA} ${rA} 0 0 0 ${g1.x} ${g1.y}`} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="7 6" />
        {arrow(g1.x, g1.y, g2.x - 4, g2.y, C.green, 3.5, 12)}
        <circle cx={g1.x} cy={g1.y} r={6} fill={C.green} />
        <text x={g1.x - 12} y={g1.y + 7} textAnchor="end" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (−1, 2)
        </text>
        <circle cx={g2.x} cy={g2.y} r={9} fill={C.green} />
        <text x={g2.x} y={g2.y - 16} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (2, 2)
        </text>
      </g>
      <g opacity={prog(t, 16)}>
        {arrow(a.x + 8, a.y, r1.x, r1.y, C.orange, 3.5, 12)}
        <text x={r1.x} y={r1.y + 30} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (5, 1)
        </text>
        <path d={`M ${r1.x} ${r1.y} A ${rB} ${rB} 0 0 0 ${r2.x} ${r2.y}`} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="7 6" />
        <circle cx={r2.x} cy={r2.y} r={9} fill={C.orange} />
        <text x={r2.x - 12} y={r2.y + 7} textAnchor="end" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (−1, 5)
        </text>
      </g>
      <foreignObject x={480} y={130} width={370} height={300}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.green, 21), fontWeight: 600, opacity: prog(t, 14) }}>돌린 뒤 옮김</span>
          <span style={{ ...mono(C.green, 20), opacity: prog(t, 14) }}>(2, 1) → (−1, 2) → (2, 2)</span>
          <span style={{ ...line(C.orange, 21), fontWeight: 600, marginTop: 8, opacity: prog(t, 16.2) }}>옮긴 뒤 돌림</span>
          <span style={{ ...mono(C.orange, 20), opacity: prog(t, 16.2) }}>(2, 1) → (5, 1) → (−1, 5)</span>
          <span style={{ ...line(C.muted, 21), marginTop: 8, opacity: prog(t, 17.5) }}>두 도착점 사이</span>
          <span style={{ ...mono(C.text, 20), opacity: prog(t, 17.5) }}>√(3² + 3²) ≈ 4.24 m</span>
        </div>
      </foreignObject>
    </svg>
  )
}

function Order() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={460} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 24, width: 840, display: 'grid', gap: 16 }}>
          <Head color={C.accent}>변환 두 개 = 행렬 하나 · D(Rx) = (DR)x</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 0.8) }}>
            <span style={line(C.text, 24)}>R = 90° 회전</span>
            <Mat rows={[['0', '−1'], ['1', '0']]} size={26} />
            <span style={{ ...line(C.text, 24), marginLeft: 40 }}>D = 가로 2 배</span>
            <Mat rows={[['2', '0'], ['0', '1']]} size={26} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 6.6) }}>
            <span style={{ ...line(C.green, 24), width: 220, fontWeight: 600 }}>DR (회전 먼저)</span>
            <Mat rows={[['0', '−2'], ['1', '0']]} size={26} rowColors={[C.green, C.green]} />
            <span style={mono(C.green, 26)}>(2, 1) → (−2, 2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 8.2) }}>
            <span style={{ ...line(C.orange, 24), width: 220, fontWeight: 600 }}>RD (늘이기 먼저)</span>
            <Mat rows={[['0', '−1'], ['2', '0']]} size={26} rowColors={[C.orange, C.orange]} />
            <span style={mono(C.orange, 26)}>(2, 1) → (−1, 4)</span>
          </div>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 10) }}>DR ≠ RD · DRx 는 x 에 가까운 오른쪽 행렬 R 부터 적용한다</span>
        </div>
      </Card>
      <Card x={994} y={130} w={862} h={460} at={13}>
        <OrderPlane t={t} />
      </Card>
      <Box x={64} y={610} w={1792} h={270} at={19.5} color={`${C.purple}88`} title={<Head color={C.purple}>모양 규칙 (m × n) × (n × p) = (m × p) · 앞 행렬의 열 수 = 뒤 행렬의 행 수</Head>}>
        <Table
          widths={[500, 320, 860]}
          at={19.8}
          step={0.7}
          align="left"
          colors={[undefined, prog(t, 26) > 0.5 ? C.accent : undefined, undefined, C.red]}
          rows={[
            ['회전 행렬 × 점', '(2 × 2) × (2 × 1)', '2 × 1 · 돌린 점'],
            ['neural network 층 W × 입력', '(2 × 3) × (3 × 1)', 'W (1, 2, 3) = (0.5 − 2 + 6, 1 + 0 − 1.5) = (4.5, −0.5)'],
            ['층 × 입력 64 개를 열로 붙인 batch', '(2 × 3) × (3 × 64)', '2 × 64 · 입력마다 출력 두 개씩'],
            ['층 × 2 dimension 입력', '(2 × 3) × (2 × 1)', '가운데 3 과 2 가 달라 계산할 수 없다'],
          ]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- inverse and singular ----------

function Inverse() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={200} at={0.3} color={`${C.accent}88`} title={<Head color={C.accent}>inverse A⁻¹: A 가 한 일을 되돌리는 행렬</Head>}>
        <span style={line(C.muted, 23)}>
          <span style={mono(C.text, 26)}>A⁻¹A = I</span> · identity matrix I: 아무것도 바꾸지 않는 행렬
        </span>
        <span style={{ ...mono(C.accent, 26), opacity: prog(t, 2.5) }}>A x = b → 양쪽에 A⁻¹ → x = A⁻¹b</span>
      </Box>
      <Box x={64} y={350} w={880} h={250} at={7} title={<Head>30° 회전의 inverse = 반대로 30° = transpose R(30°)ᵀ</Head>}>
        <span style={mono(C.text, 24)}>(0.866, 0.5) · (1.232, 1.866) = 1.067 + 0.933 = 2</span>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 8.5) }}>(−0.5, 0.866) · (1.232, 1.866) = −0.616 + 1.616 = 1</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>transpose 가 그대로 inverse 가 되는 것은 회전 행렬의 성질</span>
      </Box>
      <Box x={64} y={620} w={880} h={260} at={21} color={`${C.green}88`} title={<Head color={C.green}>같은 두 식을 행렬로: A (s, c) = (150, 250)</Head>}>
        <span style={mono(C.text, 22)}>A = [0.1 1; 0.3 1] · A⁻¹ = [−5 5; 1.5 −0.5]</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 23.5) }}>A⁻¹b = (−5 × 150 + 5 × 250, 1.5 × 150 − 0.5 × 250)</span>
        <span style={{ ...mono(C.green, 22), opacity: prog(t, 24.5) }}>= (500, 100) · 빼기로 푼 답과 같다</span>
      </Box>
      <Card x={974} y={130} w={882} h={750} at={14}>
        <div style={{ position: 'absolute', left: 30, top: 26, width: 822, display: 'grid', gap: 12 }}>
          <Head color={C.orange}>카메라 calibration: u = sX + c</Head>
          <span style={line(C.muted, 22)}>X: 책상 위 위치(m) · u: 사진의 가로 pixel 좌표 · s: 1 m 가 몇 pixel 인지 · c: X = 0 인 곳의 pixel</span>
          <svg width={820} height={200} style={{ opacity: prog(t, 14.3) }}>
            <text x={20} y={67} fill={C.muted} fontSize={22} fontFamily={MONO}>
              u
            </text>
            <line x1={60} y1={60} x2={760} y2={60} stroke={C.muted} strokeWidth={2} />
            <text x={20} y={157} fill={C.muted} fontSize={22} fontFamily={MONO}>
              X
            </text>
            <line x1={60} y1={150} x2={760} y2={150} stroke={C.muted} strokeWidth={2} />
            {[0, 0.1, 0.2, 0.3, 0.4].map((k) => (
              <g key={k}>
                <line x1={60 + k * 1750} y1={144} x2={60 + k * 1750} y2={156} stroke={C.muted} strokeWidth={2} />
                <text x={60 + k * 1750} y={184} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                  {k === 0.4 ? '0.4 m' : k}
                </text>
              </g>
            ))}
            {[
              [0.1, 150, C.orange],
              [0.3, 250, C.green],
            ].map(([k, u, col]) => (
              <g key={String(k)}>
                <line x1={60 + Number(k) * 1750} y1={140} x2={60 + Number(k) * 1750} y2={70} stroke={String(col)} strokeWidth={2} strokeDasharray="6 5" />
                <circle cx={60 + Number(k) * 1750} cy={150} r={9} fill={String(col)} />
                <circle cx={60 + Number(k) * 1750} cy={60} r={7} fill={String(col)} />
                <text x={60 + Number(k) * 1750} y={42} textAnchor="middle" fill={String(col)} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  u = {u}
                </text>
              </g>
            ))}
          </svg>
          <Table
            head={['표식', 'X', 'pixel u', '식']}
            widths={[120, 140, 150, 300]}
            at={14.8}
            colors={[C.orange, C.green]}
            rows={[
              ['첫째', '0.1 m', '150', '0.1s + c = 150'],
              ['둘째', '0.3 m', '250', '0.3s + c = 250'],
            ]}
          />
          <div style={{ display: 'grid', gap: 8, marginTop: 8, opacity: prog(t, 21.2) }}>
            <span style={mono(C.text, 24)}>둘째 − 첫째: 0.2s = 100 → s = 500 pixel/m</span>
            <span style={{ ...mono(C.text, 24), opacity: prog(t, 23.5) }}>c = 150 − 50 = 100 pixel</span>
            <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>pixel 한 칸 = 1 ÷ 500 = 0.002 m = 2 mm · 앞에서 S 에 쓴 값</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** M = [1 2; 2 4] squeezes the plane onto the line y = 2x (1 = 75 px) */
function SquashPlane({ t }: { t: number }) {
  const o = { x: 150, y: 470 }
  const s = 75
  const P = (x: number, y: number) => ({ x: o.x + x * s, y: o.y - y * s })
  const c1 = P(1, 2)
  const c2 = P(2, 4)
  const e = P(3, 6)
  const i1 = P(2, 0)
  const i2 = P(0, 1)
  return (
    <svg width={700} height={520}>
      <g opacity={prog(t, 0.5)}>
        <line x1={P(-0.8, 0).x} y1={o.y} x2={P(5.6, 0).x} y2={o.y} stroke={C.muted} strokeWidth={2} />
        <line x1={o.x} y1={P(0, -0.3).y} x2={o.x} y2={P(0, 6.4).y} stroke={C.muted} strokeWidth={2} />
        <line x1={P(-0.15, -0.3).x} y1={P(-0.15, -0.3).y} x2={P(3.1, 6.2).x} y2={P(3.1, 6.2).y} stroke={C.red} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
        <rect x={o.x} y={P(0, 1).y} width={s} height={s} fill={`${C.muted}18`} stroke={C.muted} strokeWidth={1.5} />
        <text x={240} y={450} fill={C.muted} fontSize={20}>
          넓이 1 정사각형
        </text>
        {arrow(o.x, o.y, c2.x, c2.y, C.purple, 4, 14)}
        {arrow(o.x, o.y, c1.x, c1.y, C.blue, 7, 18)}
        <text x={c1.x + 25} y={c1.y + 8} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (1, 2) 첫째 열
        </text>
        <text x={c2.x + 30} y={c2.y + 8} fill={C.purple} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (2, 4) 둘째 열
        </text>
      </g>
      <g opacity={prog(t, 6.8)}>
        <circle cx={i1.x} cy={i1.y} r={9} fill={C.green} />
        <text x={i1.x} y={i1.y + 30} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (2, 0)
        </text>
        <circle cx={i2.x} cy={i2.y} r={9} fill={C.green} />
        <text x={i2.x - 14} y={i2.y + 7} textAnchor="end" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
          (0, 1)
        </text>
        <circle cx={c2.x} cy={c2.y} r={16} fill="none" stroke={C.green} strokeWidth={3} />
      </g>
      <g opacity={prog(t, 13.5)}>
        <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke={C.red} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <text x={e.x + 16} y={e.y + 10} fill={C.red} fontSize={20} fontWeight={600}>
          선분으로 눌림 · 넓이 0
        </text>
      </g>
    </svg>
  )
}

function Singular() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={700} h={750} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 22, width: 644, display: 'grid', gap: 12 }}>
          <Head color={C.red}>M 의 두 열이 같은 방향</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <span style={line(C.text, 24)}>M =</span>
            <Mat rows={[['1', '2'], ['2', '4']]} size={28} />
            <div style={{ display: 'grid', gap: 4, opacity: prog(t, 6.6) }}>
              <span style={mono(C.green, 22)}>M (2, 0) = (2, 4)</span>
              <span style={mono(C.green, 22)}>M (0, 1) = (2, 4)</span>
            </div>
          </div>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 8.5) }}>결과만 보고 입력을 되찾을 수 없다 → singular matrix</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 205 }}>
          <SquashPlane t={t} />
        </div>
      </Card>
      <Box x={794} y={130} w={1062} h={260} at={13} title={<Head>determinant ad − bc = 한 변이 1 인 정사각형이 바뀐 넓이</Head>}>
        <Table
          head={['행렬', 'determinant', '정사각형이 바뀐 모양']}
          widths={[200, 320, 420]}
          at={13.3}
          size={22}
          align="left"
          colors={[undefined, undefined, C.red]}
          rows={[
            ['30° 회전', '0.866² + 0.5² = 1', '돌아간 정사각형, 넓이 그대로'],
            ['가로 2 배 D', '2 × 1 − 0 = 2', '가로로 긴 직사각형, 넓이 2'],
            ['M', '1 × 4 − 2 × 2 = 0', '선분 하나로 눌림, 넓이 0'],
          ]}
        />
      </Box>
      <Box x={794} y={405} w={1062} h={250} at={19.5} color={`${C.orange}88`} title={<Head color={C.orange}>거의 singular: 표식이 가까운 calibration</Head>}>
        <Table
          head={['표식 위치', 'determinant', 'pixel 정확히 잼', '둘째 pixel 1 칸 틀림']}
          widths={[210, 170, 250, 300]}
          at={19.8}
          size={22}
          align="left"
          colors={[undefined, C.red]}
          rows={[
            ['0.1 m, 0.3 m', '−0.2', 's = 500, c = 100', 's = 505, c = 99.5'],
            ['0.1 m, 0.101 m', '−0.001', 's = 500, c = 100', 's = 1500, c = 0'],
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.5) }}>같은 자리 X = 0.1 m 에 두 번 찍으면 두 행이 같아 singular · s 와 c 를 따로 구할 수 없다</span>
      </Box>
      <Box x={794} y={672} w={1062} h={208} at={26} color={`${C.purple}88`} title={<Head color={C.purple}>관절 두 개인 팔의 Jacobian (마디 1 m)</Head>}>
        <span style={mono(C.text, 22)}>굽힌 팔 (0°, 90°): 열 (−1, 1), (−1, 0) · determinant 1</span>
        <span style={{ ...mono(C.red, 22), opacity: prog(t, 27) }}>쭉 편 팔 (0°, 0°): 열 (0, 2), (0, 1) · determinant 0</span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 28.5) }}>두 열이 모두 세로라 손끝 속도 (0, 2a + b) 의 가로가 늘 0 → singularity</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'vector 와 norm', color: C.green, text: 'LiDAR 의 앞 2 m, 왼쪽 1 m → vector (2, 1) · 거리 √(2² + 1²) = 2.236 m', at: 0.5 },
    { tag: 'dot product', color: C.accent, text: 'R(30°) 의 행마다 dot product → 로봇 기준 앞 1.232 m, 왼쪽 1.866 m', at: 4.4 },
    { tag: '행렬 곱과 순서', color: C.orange, text: '변환을 이으면 행렬 곱 · (2, 1) 이 DR 로 (−2, 2), RD 로 (−1, 4)', at: 8.4 },
    { tag: 'inverse 와 singular', color: C.red, text: 'inverse = transpose 로 (2, 1) 을 되찾는다 · determinant 0 이면 되돌릴 수 없다', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            LiDAR 의 앞쪽 2 m, 왼쪽 1 m 를 로봇 기준으로 바꾸려면 무엇을 계산해야 할까?
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
            NEXT · MATH
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Derivatives & Gradients</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            관절을 조금 돌릴 때 손끝이 움직이는 양처럼, 값이 변하는 비율
          </Label>
        </Appear>
        <Appear at={3.6} style={{ display: 'grid', justifyItems: 'center', gap: 10, marginTop: 20 }}>
          <Label mono color={C.text} size={36} weight={600}>
            Rigid Transforms · Linear Regression
          </Label>
          <Label color={C.muted} size={28}>
            회전과 이동을 행렬 하나로 묶는 homogeneous transform · 식이 모르는 값보다 많을 때 오차가 가장 작은 답
          </Label>
        </Appear>
        <Appear at={4.4} style={{ marginTop: 40, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/vectors-matrices
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseUnit = () => (
  <PauseWrite
    question="gripper 가 (0.1, 0.1) 에, 목표가 (0.6, 1.3) 에 있다. 목표까지의 거리와 목표 쪽 unit vector 는?"
    answer={
      <>
        변위 (0.6 − 0.1, 1.3 − 0.1) = (0.5, 1.2) · 거리 √(0.25 + 1.44) = √1.69 = 1.3 m
        <br />
        unit vector (0.5 ÷ 1.3, 1.2 ÷ 1.3) ≈ (0.385, 0.923)
      </>
    }
  />
)

const PauseRail = () => (
  <PauseWrite
    question="gripper 가 물체를 힘 (3, 4) N 으로 당기는데, 물체는 30° 방향 (0.866, 0.5) 으로 놓인 레일 위에서만 움직인다. 레일을 따라 작용하는 힘은?"
    answer={
      <>
        레일 방향 unit vector 와 dot product: 3 × 0.866 + 4 × 0.5 = 2.598 + 2 = 4.598 N
        <br />
        힘의 크기 √(9 + 16) = 5 N 가운데 레일을 따라 미는 몫
      </>
    }
  />
)

const PauseLidar = () => (
  <PauseWrite
    question="LiDAR 가 로봇 정면에서 시계 반대 방향으로 90° 돌아간 채 달려 있고, LiDAR 기준 장애물 위치가 (3, 1) 이다. 로봇 기준 위치는?"
    answer={
      <>
        90° 회전 행렬 [0 −1; 1 0] · 첫째 행 0 × 3 + (−1) × 1 = −1 · 둘째 행 1 × 3 + 0 × 1 = 3
        <br />
        로봇 기준 (−1, 3) · LiDAR 앞 3 m 는 로봇 왼쪽 3 m
      </>
    }
  />
)

const PauseDet = () => (
  <PauseWrite
    question="첫째 행이 (2, 1), 둘째 행이 (4, 2) 인 2×2 행렬은 inverse 가 있는가?"
    answer={
      <>
        없다 · 두 열 (2, 4) 와 (1, 2) 는 첫째 열이 둘째 열의 2 배라 같은 방향
        <br />
        determinant 2 × 2 − 1 × 4 = 0
      </>
    }
  />
)

export function VectorsMatrices() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        vector: VectorScene,
        norm: NormScene,
        'pause-unit': PauseUnit,
        'dot-slope': DotSlope,
        'dot-sign': DotSign,
        'pause-rail': PauseRail,
        rows: Rows,
        order: Order,
        'pause-lidar': PauseLidar,
        inverse: Inverse,
        singular: Singular,
        'pause-det': PauseDet,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
