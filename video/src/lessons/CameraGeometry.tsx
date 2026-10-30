import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './camera-geometry.narration.json'
import { script } from './camera-geometry.script'

// Numbers follow lessons/camera-geometry/README.md (see camera-geometry.script.ts). The same-ray, marker and robot drawings
// are schematic (marked 모식도); the pinhole triangles and the distortion grid are drawn to the lesson's numbers.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, fmt, labelW = 120 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
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

/** a line that fades in at `at` */
function Line({ at, children, style }: { at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ ...line(), ...style, opacity: prog(t, at) }}>{children}</div>
}

/** subscript, e.g. f<sub>x</sub> */
const sub = (base: string, s: string) => (
  <>
    {base}
    <sub style={{ fontSize: '0.7em' }}>{s}</sub>
  </>
)

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

/** a simple text table: first column sans, the rest mono unless `sans`; rows fade in one by one or at `rowAt` */
function Table({ head, rows, widths, at, step = 0.5, size = 22, colors, rowAt, sans = false }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; rowAt?: number[]; sans?: boolean }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 || sans ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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
        <div key={k} style={{ display: 'flex', opacity: prog(t, rowAt?.[k] ?? at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
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
            GRASPING · CAMERA GEOMETRY
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Camera Geometry</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            pixel 과 3D 점을 잇는 <span style={{ color: C.accent }}>pinhole model</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            intrinsics · lens distortion · extrinsics · checkerboard calibration · ArUco marker pose
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

/** a 640×480 photo at scale `k`, with the pixel axes, its centre and the cup at (370, 215) */
function Photo({ t, at, k = 0.75, ox = 60, oy = 80 }: { t: number; at: number; k?: number; ox?: number; oy?: number }) {
  const px = (u: number) => ox + u * k
  const py = (v: number) => oy + v * k
  return (
    <g opacity={prog(t, at)}>
      <rect x={ox} y={oy} width={640 * k} height={480 * k} rx={6} fill={`${C.blue}10`} stroke={C.muted} strokeWidth={2} />
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`c${i}`} x1={px(40 * (i + 1))} y1={oy} x2={px(40 * (i + 1))} y2={py(480)} stroke={C.grid} strokeWidth={1} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`r${i}`} x1={ox} y1={py(40 * (i + 1))} x2={px(640)} y2={py(40 * (i + 1))} stroke={C.grid} strokeWidth={1} />
      ))}
      <text x={ox} y={oy - 10} fill={C.muted} fontSize={22} fontFamily={MONO}>
        (0, 0)
      </text>
      {arrow(ox + 10, oy + 20, ox + 160, oy + 20, C.accent, 3)}
      <text x={ox + 170} y={oy + 28} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
        u
      </text>
      {arrow(ox + 10, oy + 20, ox + 10, oy + 150, C.accent, 3)}
      <text x={ox + 10} y={oy + 180} textAnchor="middle" fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
        v
      </text>
      <circle cx={px(320)} cy={py(240)} r={6} fill={C.muted} />
      <text x={px(320)} y={py(240) + 34} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
        (320, 240)
      </text>
      <circle cx={px(370)} cy={py(215)} r={9} fill={C.orange} />
      <text x={px(370) + 18} y={py(215) - 8} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
        컵 (370, 215)
      </text>
    </g>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={620} h={470}>
        <svg width={620} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            640×480 사진의 pixel 좌표
          </text>
          <Photo t={t} at={0.5} ox={60} oy={86} />
        </svg>
      </Panel>
      <Box x={716} y={140} w={540} h={470} at={0.9} title={<Head color={C.orange}>detector 가 내는 숫자 2 개</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={mono(C.orange, 52)}>u = 370</span>
          <span style={mono(C.orange, 52)}>v = 215</span>
        </div>
        <span style={line(C.muted, 22)}>u 는 왼쪽 위에서 오른쪽으로 간 칸 수이고, v 는 아래로 간 칸 수다. 수학의 좌표평면과 달리 v 는 아래로 갈수록 커진다</span>
      </Box>
      <Box x={1288} y={140} w={568} h={470} at={2.2} title={<Head color={C.green}>팔을 뻗는 데 필요한 숫자 3 개</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          {['앞으로 ? m', '옆으로 ? m', '위로 ? m'].map((s, i) => (
            <span key={s} style={{ ...mono(C.green, 44), opacity: prog(t, 2.5 + i * 0.4) }}>
              {s}
            </span>
          ))}
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.8) }}>로봇 base 에서 잰 3D 위치</span>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 650, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          pixel 두 숫자에서 3D 세 숫자로: <span style={{ color: C.accent }}>카메라의 무엇을 알아야 하고, 모자란 하나는 어디서 채울까?</span>
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- pinhole and distance ----------

function Projection() {
  const t = useSec()
  const O = { x: 120, y: 640 }
  const S = 240 // px per metre
  const P = { x: O.x + 0.4 * S, y: O.y - 2 * S }
  const Q = { x: O.x + 0.2 * S, y: O.y - 1 * S }
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={840} h={740} at={0.3}>
        <svg width={840} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            camera optical frame · 위에서 본 모습
          </text>
          <g opacity={prog(t, 0.5)}>
            {arrow(O.x, O.y, O.x, 96, C.accent, 3)}
            <text x={O.x + 12} y={104} fill={C.accent} fontSize={22} fontWeight={600}>
              z 앞쪽
            </text>
            {arrow(O.x, O.y, 360, O.y, C.accent, 3)}
            <text x={300} y={O.y + 32} fill={C.accent} fontSize={22} fontWeight={600}>
              x 오른쪽
            </text>
            <circle cx={O.x} cy={O.y} r={8} fill={C.text} />
            <text x={60} y={O.y + 44} fill={C.text} fontSize={22}>
              렌즈 중심
            </text>
          </g>
          <g opacity={prog(t, 6)}>
            <polygon points={`${O.x},${O.y} ${O.x},${P.y} ${P.x},${P.y}`} fill={`${C.orange}1c`} />
            <polygon points={`${O.x},${O.y} ${O.x},${Q.y} ${Q.x},${Q.y}`} fill={`${C.blue}33`} />
            <line x1={60} y1={Q.y} x2={340} y2={Q.y} stroke={C.blue} strokeWidth={2.5} strokeDasharray="8 6" />
            <text x={236} y={Q.y - 12} fill={C.blue} fontSize={22}>
              image plane
            </text>
            <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke={C.orange} strokeWidth={3} />
            <line x1={O.x} y1={P.y} x2={P.x} y2={P.y} stroke={C.orange} strokeWidth={2} strokeDasharray="6 5" />
            <circle cx={P.x} cy={P.y} r={8} fill={C.orange} />
            <text x={P.x + 16} y={P.y + 6} fill={C.orange} fontSize={22} fontFamily={MONO}>
              (X 0.4, Z 2)
            </text>
            <circle cx={Q.x} cy={Q.y} r={7} fill={C.blue} />
            <text x={72} y={Q.y - 18} fill={C.muted} fontSize={22} fontFamily={MONO}>
              1 m
            </text>
            <text x={72} y={P.y + 6} fill={C.muted} fontSize={22} fontFamily={MONO}>
              2 m
            </text>
            <text x={140} y={P.y + 30} fill={C.orange} fontSize={22} fontFamily={MONO}>
              0.4 m
            </text>
            <text x={Q.x + 8} y={Q.y + 28} fill={C.blue} fontSize={22} fontFamily={MONO}>
              0.2 m
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 440, top: 80, width: 370, display: 'grid', gap: 22 }}>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 0.6) }}>
            <Head color={C.accent} size={24}>
              축 방향
            </Head>
            <span style={line()}>z: 카메라가 보는 앞쪽 (optical axis)</span>
            <span style={line()}>x: 사진의 오른쪽</span>
            <span style={line()}>y: 사진의 아래쪽 (이 그림에서는 화면 안쪽)</span>
            <span style={line(C.muted, 22)}>pixel 의 u · v 와 방향이 같다</span>
          </div>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 6.1) }}>
            <Head color={C.orange} size={24}>
              pinhole model
            </Head>
            <span style={line()}>점과 렌즈 중심을 잇는 직선이 image plane 을 지나는 자리에 찍힌다</span>
          </div>
          <div style={{ display: 'grid', gap: 4, opacity: prog(t, 11.8) }}>
            <Head color={C.blue} size={24}>
              닮은 삼각형
            </Head>
            <span style={mono(C.blue, 24)}>0.4 ÷ 2 = 0.2 ÷ 1 = 0.2</span>
            <span style={line()}>normalized coordinates</span>
            <span style={mono(C.text, 24)}>x = X ÷ Z, y = Y ÷ Z</span>
          </div>
        </div>
      </Card>
      <Box x={936} y={140} w={920} h={200} at={17.2} title={<Head color={C.text}>예시 카메라</Head>} gap={10}>
        <span style={mono(C.accent, 26)}>
          640×480 · {sub('f', 'x')} = {sub('f', 'y')} = 500 · ({sub('c', 'x')}, {sub('c', 'y')}) = (320, 240)
        </span>
        <span style={line(C.muted, 22)}>focal length f 는 normalized 1 을 몇 pixel 로 나타낼지 정하는 배율이고, principal point 는 optical axis 가 찍히는 pixel 이다</span>
      </Box>
      <Box x={936} y={360} w={920} h={520} at={22.6} title={<Head>세 단계로 pixel 이 된다</Head>}>
        <Table
          head={['단계', '(0.1, −0.05, 1.0)', '(−0.2, 0.1, 2.0)']}
          rows={[
            ['① depth 로 나누기', '(0.1, −0.05)', '(−0.1, 0.05)'],
            ['② f = 500 곱하기', '(50, −25)', '(−50, 25)'],
            ['③ (320, 240) 더하기', '(370, 215)', '(270, 265)'],
          ]}
          widths={[320, 260, 260]}
          at={22.8}
          step={0.9}
          size={24}
          colors={[undefined, undefined, C.green]}
        />
        <div style={{ display: 'grid', gap: 6, marginTop: 10, opacity: prog(t, 25.5) }}>
          <span style={mono(C.accent, 30)}>
            u = {sub('f', 'x')} · X ÷ Z + {sub('c', 'x')}
          </span>
          <span style={mono(C.accent, 30)}>
            v = {sub('f', 'y')} · Y ÷ Z + {sub('c', 'y')}
          </span>
          <span style={line(C.muted, 22)}>세 단계를 모은 pinhole model 의 투영 (projection) 식</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Depth() {
  const t = useSec()
  const O = { x: 110, y: 300 }
  const pt = (z: number) => ({ x: O.x + 210 * z, y: O.y - 52 * z })
  const plane = 220
  const cross = O.y - 52 * ((plane - O.x) / 210)
  const pts: [number, string][] = [
    [1, '(0.1, −0.05, 1.0)'],
    [2, '(0.2, −0.1, 2.0)'],
    [3, '(0.3, −0.15, 3.0)'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={370} at={0.3}>
        <svg width={880} height={370}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            렌즈 중심에서 뻗은 직선 하나
          </text>
          <text x={850} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            위에서 본 모식도
          </text>
          <line x1={plane} y1={120} x2={plane} y2={318} stroke={C.blue} strokeWidth={2.5} strokeDasharray="8 6" />
          <text x={plane} y={106} textAnchor="middle" fill={C.blue} fontSize={22}>
            image plane
          </text>
          <line x1={O.x} y1={O.y} x2={pt(3.3).x} y2={pt(3.3).y} stroke={C.orange} strokeWidth={3} />
          <circle cx={O.x} cy={O.y} r={8} fill={C.text} />
          <text x={O.x - 14} y={O.y + 8} textAnchor="end" fill={C.text} fontSize={22}>
            렌즈 중심
          </text>
          <circle cx={plane} cy={cross} r={8} fill={C.blue} />
          <text x={plane} y={352} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
            같은 pixel (370, 215)
          </text>
          {pts.map(([z, s], i) => {
            const p = pt(z)
            return (
              <g key={z} opacity={prog(t, 0.8 + i * 0.6)}>
                <circle cx={p.x} cy={p.y} r={8} fill={C.orange} />
                <text x={p.x} y={p.y - 20} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {z} m
                </text>
                <text x={p.x} y={p.y + 56} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {s}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>
      <Box x={64} y={530} w={880} h={350} at={6.2} title={<Head size={26}>f = 500 · 사진 속 높이 = f × 실제 높이 ÷ 거리</Head>}>
        {[
          ['컵 10 cm · 1 m 앞', '500 × 0.1 ÷ 1 = 50 pixel', 6.6],
          ['상자 20 cm · 2 m 앞', '500 × 0.2 ÷ 2 = 50 pixel', 7.6],
        ].map(([a, b, at]) => (
          <div key={a as string} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, at as number) }}>
            <span style={{ ...line(C.text, 24), width: 290 }}>{a}</span>
            <span style={mono(C.orange, 26)}>{b}</span>
          </div>
        ))}
        <Line at={9} style={line(C.muted, 23)}>
          둘은 사진에서 같은 크기다. 거꾸로 실제 크기를 알면 거리 = f × 실제 크기 ÷ 사진 속 크기로 구한다 (ArUco marker 가 쓰는 원리)
        </Line>
      </Box>
      <Box x={976} y={140} w={880} h={370} at={12.2} title={<Head color={C.green}>back-projection · depth 를 알면 거꾸로</Head>}>
        <Table
          head={['단계', 'depth 1.0', 'depth 2.0']}
          rows={[
            ['① principal point 빼기', '(50, −25)', '(50, −25)'],
            ['② f = 500 으로 나누기', '(0.1, −0.05)', '(0.1, −0.05)'],
            ['③ depth 곱하기', '(0.1, −0.05, 1.0)', '(0.2, −0.1, 2.0)'],
          ]}
          widths={[310, 255, 255]}
          at={12.4}
          step={0.8}
          colors={[undefined, undefined, C.green]}
        />
        <Line at={15.5} style={line(C.muted, 22)}>
          ②까지는 depth 와 상관없이 같은 방향이다. depth camera 는 pixel 마다 거리를 재고, 모든 pixel 에 이 계산을 하면 point cloud 가 된다
        </Line>
      </Box>
      <Box x={976} y={530} w={880} h={350} at={18.2} gap={10} title={<Head color={C.orange}>stereo · depth = f × baseline ÷ disparity</Head>}>
        <Line at={18.6} style={mono(C.orange, 24)}>
          disparity 50 → 500 × 0.1 ÷ 50 = 1.0 m
        </Line>
        <Line at={19.6} style={mono(C.orange, 24)}>
          disparity 25 → 500 × 0.1 ÷ 25 = 2.0 m
        </Line>
        <Line at={24.2} style={line(C.muted, 22)}>
          D435 · f 424 · baseline 50 mm · disparity 오차 0.08 pixel
        </Line>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="1 m" value={4} max={60} color={C.green} at={24.6} width={440} labelW={70} fmt="약 4 mm" />
          <Bar label="2 m" value={15} max={60} color={C.orange} at={25.2} width={440} labelW={70} fmt="약 15 mm" />
          <Bar label="4 m" value={60} max={60} color={C.red} at={25.8} width={440} labelW={70} fmt="약 60 mm" />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseProject = () => (
  <PauseWrite
    question="f = 500, principal point (320, 240) 인 예시 카메라에서 camera frame 의 점 (0.2, 0.1, 2.0) 은 어느 pixel 에 찍힐까?"
    answer="(0.2 ÷ 2.0, 0.1 ÷ 2.0) = (0.1, 0.05) → × 500 = (50, 25) → + (320, 240) = (370, 265)"
  />
)

// ---------- camera_info and tf2 ----------

function Matrix({ rows, color }: { rows: string[][]; color: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', padding: '6px 10px', borderLeft: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderRadius: 6 }}>
      {rows.flat().map((v, i) => (
        <span key={i} style={{ ...mono(v === '0' || v === '1' ? C.dim : color, 30), textAlign: 'center', lineHeight: '48px' }}>
          {v}
        </span>
      ))}
    </div>
  )
}

/** OpenCV sample camera's radial distortion (k1 ≈ −0.281, k2 ≈ 0.078) on the 640×480 example camera, at scale k */
function DistortGrid({ t, at, k = 0.7 }: { t: number; at: number; k?: number }) {
  const k1 = -0.281
  const k2 = 0.078
  const toPx = (x: number, y: number, d: boolean): [number, number] => {
    const r2 = x * x + y * y
    const m = d ? 1 + k1 * r2 + k2 * r2 * r2 : 1
    return [(500 * x * m + 320) * k, (500 * y * m + 240) * k]
  }
  const path = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ')
  const xs = [-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6]
  const ys = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45]
  const N = 24
  const grid = (d: boolean) => [
    ...xs.map((x) => path(Array.from({ length: N + 1 }, (_, i) => toPx(x, -0.45 + (0.9 * i) / N, d)))),
    ...ys.map((y) => path(Array.from({ length: N + 1 }, (_, i) => toPx(-0.6 + (1.2 * i) / N, y, d)))),
  ]
  const a0 = toPx(0.6, 0.45, false)
  const a1 = toPx(0.6, 0.45, true)
  const b0 = toPx(0.3, 0, false)
  const b1 = toPx(0.3, 0, true)
  return (
    <svg width={640 * k} height={480 * k}>
      <rect x={0} y={0} width={640 * k} height={480 * k} rx={6} fill="none" stroke={C.cardEdge} strokeWidth={2} />
      {grid(false).map((d, i) => (
        <path key={`s${i}`} d={d} fill="none" stroke={C.dim} strokeWidth={1.5} />
      ))}
      <g opacity={prog(t, at, 1.2)}>
        {grid(true).map((d, i) => (
          <path key={`d${i}`} d={d} fill="none" stroke={C.blue} strokeWidth={2.5} />
        ))}
      </g>
      <g opacity={prog(t, at + 6)}>
        <circle cx={a0[0]} cy={a0[1]} r={7} fill={C.muted} />
        {arrow(a0[0] - 4, a0[1] - 3, a1[0] + 6, a1[1] + 5, C.red, 3, 10)}
        <circle cx={a1[0]} cy={a1[1]} r={8} fill={C.red} />
        <circle cx={b0[0]} cy={b0[1]} r={7} fill={C.muted} />
        <circle cx={b1[0]} cy={b1[1]} r={7} fill={C.green} />
      </g>
    </svg>
  )
}

function Intrinsics() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={370} at={0.3} title={<Head color={C.accent}>intrinsics K · 카메라 자체의 숫자</Head>}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          <Matrix
            color={C.accent}
            rows={[
              ['500', '0', '320'],
              ['0', '500', '240'],
              ['0', '0', '1'],
            ]}
          />
          <div style={{ display: 'grid', gap: 8, width: 420 }}>
            <span style={line(C.text, 23)}>
              {sub('f', 'x')} = {sub('f', 'y')} = 500 · focal length
            </span>
            <span style={line(C.text, 23)}>
              ({sub('c', 'x')}, {sub('c', 'y')}) = (320, 240) · principal point
            </span>
            <span style={line(C.muted, 22)}>렌즈와 센서가 정하는 숫자</span>
          </div>
        </div>
        <Line at={3.2} style={mono(C.accent, 22)}>
          camera_info · k = [500, 0, 320, 0, 500, 240, 0, 0, 1]
        </Line>
      </Box>
      <Box x={64} y={530} w={880} h={350} at={6.5} title={<Head color={C.orange}>사진 크기마다 다른 intrinsics</Head>}>
        <Table
          head={['사진 크기', 'f', 'principal point']}
          rows={[
            ['640×480', '500', '(320, 240)'],
            ['1280×960', '1000', '(640, 480)'],
          ]}
          widths={[260, 200, 300]}
          at={6.7}
          step={1.2}
          size={24}
          colors={[undefined, C.orange]}
        />
        <Line at={9.2} style={line(C.muted, 23)}>
          같은 센서라도 pixel 이 가로세로 두 배로 촘촘해진다. driver 의 해상도를 바꾸면 그 해상도의 camera_info 를 쓴다
        </Line>
      </Box>
      <Card x={976} y={140} w={880} h={740} at={12.2}>
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'grid', gap: 4 }}>
          <Head color={C.blue} size={26}>
            radial distortion · OpenCV 예제 카메라
          </Head>
          <span style={mono(C.muted, 22)}>k1 ≈ −0.281, k2 ≈ 0.078 · k1 &lt; 0 이라 barrel</span>
        </div>
        <div style={{ position: 'absolute', left: 216, top: 104 }}>
          <DistortGrid t={t} at={12.5} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 450, width: 820, ...line(C.muted, 22), opacity: prog(t, 13.4) }}>
          회색은 곧은 격자, 파랑은 휘어 찍힌 격자 · 배율 1 + k1 r² + k2 r⁴ 를 normalized coordinates 에 곱한다
        </div>
        <div style={{ position: 'absolute', left: 30, top: 528, width: 820 }}>
          <Table
            head={['점 (x, y)', 'r²', '배율', 'pixel: 휘기 전 → 휜 뒤']}
            rows={[
              ['(0.3, 0)', '0.09', '약 0.975', '(470, 240) → (466, 240)'],
              ['(0.6, 0.45)', '0.5625', '약 0.867', '(620, 465) → (580, 435)'],
            ]}
            widths={[170, 110, 150, 390]}
            at={18.2}
            step={1.2}
            colors={[C.green, C.red]}
          />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 664, width: 820, display: 'grid', gap: 2, opacity: prog(t, 24.3) }}>
          <span style={mono(C.text, 21)}>camera_info: plumb_bob · d = (k1, k2, t1, t2, k3)</span>
          <span style={line(C.muted, 21)}>image_proc 의 rectify node: image + camera_info → image_rect</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** one step of the world → pixel chain: a label line and a value line */
function Step({ y, label, value, color, at, valueAt }: { y: number; label: ReactNode; value: ReactNode; color: string; at: number; valueAt: number }) {
  const t = useSec()
  return (
    <div style={{ position: 'absolute', left: 40, top: y, width: 820, height: 96, boxSizing: 'border-box', padding: '10px 24px', borderRadius: 16, border: `1.5px solid ${color}88`, background: `${color}12`, display: 'grid', alignContent: 'center', gap: 2, opacity: prog(t, at) }}>
      <span style={line(C.muted, 22)}>{label}</span>
      <span style={{ ...mono(color, 28), opacity: prog(t, valueAt) }}>{value}</span>
    </div>
  )
}

function Extrinsics() {
  const t = useSec()
  const ys = [76, 216, 356, 496, 636]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <div style={{ position: 'absolute', left: 40, top: 22 }}>
          <Head size={26}>world 의 점에서 pixel 까지</Head>
        </div>
        <svg width={900} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          {ys.slice(0, 4).map((y, i) => (
            <g key={y}>{arrow(450, y + 102, 450, ys[i + 1] - 6, C.muted, 3, 12, prog(t, i < 2 ? 0.8 + i * 0.4 : 7.6 + (i - 2) * 0.5))}</g>
          ))}
        </svg>
        <Step y={ys[0]} label="world frame 의 점 (로봇 base 같은 카메라 밖의 frame)" value="p_w = (0.2, −0.05, 0)" color={C.purple} at={0.5} valueAt={7.2} />
        <Step y={ys[1]} label={<>extrinsics: p_c = R p_w + t</>} value="R = I, t = (−0.1, 0, 1.0)" color={C.orange} at={1} valueAt={7.6} />
        <Step y={ys[2]} label="camera frame 의 점" value="p_c = (0.1, −0.05, 1.0)" color={C.blue} at={1.4} valueAt={8.4} />
        <Step y={ys[3]} label="intrinsics: depth 로 나누고 f 곱하고 principal point 더하기" value="(0.1, −0.05) → (50, −25)" color={C.accent} at={8} valueAt={9} />
        <Step y={ys[4]} label="pixel" value="(370, 215)" color={C.green} at={8.6} valueAt={9.6} />
      </Card>
      <Box x={996} y={140} w={860} h={350} at={14.2} title={<Head color={C.orange}>extrinsics: 숫자 6 개</Head>}>
        <span style={line(C.text, 23)}>rotation R 의 3 개 + translation t 의 3 개 · 카메라가 world 의 어디에 어느 방향으로 놓였는지</span>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 14, padding: '10px 18px', borderRadius: 14, background: `${C.red}14`, border: `1.5px solid ${C.red}55`, opacity: prog(t, 16) }}>
            <span style={{ color: C.red, fontSize: 26, fontWeight: 700 }}>✕</span>
            <span style={line(C.text, 23)}>t 는 world 에서 본 카메라의 위치다</span>
          </div>
          <div style={{ display: 'flex', gap: 14, padding: '10px 18px', borderRadius: 14, background: `${C.green}14`, border: `1.5px solid ${C.green}55`, opacity: prog(t, 17.4) }}>
            <span style={{ color: C.green, fontSize: 26, fontWeight: 700 }}>✓</span>
            <span style={line(C.text, 23)}>t 는 카메라에서 본 world 원점의 위치다. 이 예에서 카메라는 world 의 (0.1, 0, −1.0) 에 있다</span>
          </div>
        </div>
      </Box>
      <Box x={996} y={510} w={860} h={370} at={21.2} title={<Head color={C.accent}>ROS 2 에서 담는 곳</Head>}>
        <Table
          head={['구분', '담긴 숫자', '담는 곳']}
          rows={[
            ['intrinsics K', <>{sub('f', 'x')}, {sub('f', 'y')}, {sub('c', 'x')}, {sub('c', 'y')}</>, 'camera_info 의 k'],
            ['extrinsics [R | t]', 'R 3 개 + t 3 개', 'tf2 transform'],
          ]}
          widths={[230, 280, 290]}
          at={21.4}
          step={0.7}
          sans
        />
        <Line at={23.5} style={line(C.muted, 22)}>
          REP 103 의 로봇 몸체 frame 은 x 앞 · y 왼쪽 · z 위라서, 카메라에는 이름 끝에 _optical 을 붙인 frame 을 따로 둔다
        </Line>
        <Line at={25} style={line(C.orange, 22)}>
          camera_link 좌표로 잘못 읽으면 앞쪽 1 m 가 위쪽 1 m 로 바뀐다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseDistort = () => (
  <PauseWrite
    question="k1 = −0.1, k2 = 0 인 렌즈에서 normalized 점 (0.6, 0.8) 은 어디로 옮겨질까? (배율 1 + k1 r² + k2 r⁴)"
    answer={
      <>
        r² = 0.6² + 0.8² = 0.36 + 0.64 = 1 → 배율 1 + (−0.1) × 1 = 0.9 → (0.6 × 0.9, 0.8 × 0.9) = (0.54, 0.72)
        <br />
        k1 이 음수라 중심 쪽으로 당겨졌다
      </>
    }
  />
)

// ---------- Zhang calibration ----------

function Checkerboard({ t, at }: { t: number; at: number }) {
  const s = 34
  const ox = 70
  const oy = 92
  const o = { x: ox + s, y: oy + s }
  return (
    <g opacity={prog(t, at)}>
      {Array.from({ length: 70 }, (_, i) => {
        const c = i % 10
        const r = Math.floor(i / 10)
        return <rect key={i} x={ox + c * s} y={oy + r * s} width={s} height={s} fill={(c + r) % 2 ? '#1a2336' : '#cbd5e1'} />
      })}
      <rect x={ox} y={oy} width={10 * s} height={7 * s} fill="none" stroke={C.muted} strokeWidth={2} />
      {Array.from({ length: 54 }, (_, i) => (
        <circle key={`k${i}`} cx={ox + s * (1 + (i % 9))} cy={oy + s * (1 + Math.floor(i / 9))} r={4} fill={C.orange} />
      ))}
      {arrow(o.x, o.y, 452, o.y, C.accent, 4, 13)}
      <text x={460} y={o.y + 8} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
        X
      </text>
      {arrow(o.x, o.y, o.x, 362, C.accent, 4, 13)}
      <text x={o.x} y={390} textAnchor="middle" fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
        Y
      </text>
      <text x={ox} y={78} fill={C.accent} fontSize={22} fontFamily={MONO}>
        원점 (0, 0, 0)
      </text>
    </g>
  )
}

function Reprojection() {
  const t = useSec()
  const P = { x: 140, y: 500 }
  const K = 40 // px per pixel in the zoom
  const F = { x: P.x + 3 * K, y: P.y + 4 * K }
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={740} at={0.3}>
        <svg width={860} height={740}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            checkerboard · 안쪽 corner 9 × 6
          </text>
          <Checkerboard t={t} at={0.5} />
          <g opacity={prog(t, 7.2)}>
            <text x={30} y={440} fill={C.text} fontSize={24} fontWeight={600}>
              reprojection error (확대한 그림)
            </text>
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`v${i}`} x1={60 + i * K} y1={460} x2={60 + i * K} y2={690} stroke={C.grid} strokeWidth={1.5} />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`h${i}`} x1={60} y1={460 + i * K} x2={500} y2={460 + i * K} stroke={C.grid} strokeWidth={1.5} />
            ))}
            <line x1={P.x} y1={P.y} x2={F.x} y2={P.y} stroke={C.muted} strokeWidth={2} strokeDasharray="6 5" />
            <line x1={F.x} y1={P.y} x2={F.x} y2={F.y} stroke={C.muted} strokeWidth={2} strokeDasharray="6 5" />
            <line x1={P.x} y1={P.y} x2={F.x} y2={F.y} stroke={C.red} strokeWidth={4} />
            <circle cx={P.x} cy={P.y} r={8} fill={C.orange} />
            <circle cx={F.x} cy={F.y} r={8} fill={C.green} />
            <text x={60} y={484} fill={C.orange} fontSize={22} fontFamily={MONO}>
              투영한 자리 (370, 215)
            </text>
            <text x={F.x + 20} y={F.y + 8} fill={C.green} fontSize={22} fontFamily={MONO}>
              찾은 corner (373, 219)
            </text>
            <text x={200} y={530} fill={C.muted} fontSize={22} fontFamily={MONO}>
              3
            </text>
            <text x={F.x + 12} y={586} fill={C.muted} fontSize={22} fontFamily={MONO}>
              4
            </text>
            <text x={180} y={606} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              5
            </text>
            <text x={60} y={720} fill={C.red} fontSize={26} fontFamily={MONO} fontWeight={600}>
              √(3² + 4²) = 5 pixel
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 500, top: 80, width: 330, display: 'grid', gap: 12, opacity: prog(t, 1.2) }}>
          <span style={line()}>board frame: 판에 붙인 frame</span>
          <span style={line()}>칸 한 변의 길이를 알면 corner 마다 좌표를 안다</span>
          <span style={line(C.accent)}>판이 평평해서 모든 corner 의 Z = 0</span>
          <span style={line(C.muted, 22)}>판을 여러 각도로 기울여 찍는다</span>
        </div>
      </Card>
      <Box x={956} y={140} w={900} h={300} at={14.2} title={<Head color={C.orange}>RMS (root mean square)</Head>}>
        <Line at={14.5} style={mono(C.orange, 24)}>
          거리 1, 7 pixel → √((1 + 49) ÷ 2) = 5 pixel
        </Line>
        <Line at={15.8} style={mono(C.muted, 24)}>
          그냥 평균: (1 + 7) ÷ 2 = 4 pixel
        </Line>
        <Line at={17} style={line(C.text, 23)}>
          제곱을 거치면서 크게 틀린 corner 가 더 큰 무게를 받는다. calibration 은 이 RMS 가 가장 작아지는 숫자를 찾는다
        </Line>
      </Box>
      <Box x={956} y={460} w={900} h={420} at={21.2} title={<Head color={C.green}>OpenCV 예제 사진 (640×480, 13 장, 안쪽 corner 9×6)</Head>}>
        <Table
          head={['distortion 모델', sub('f', 'x'), <>({sub('c', 'x')}, {sub('c', 'y')})</>, 'RMS']}
          rows={[
            ['없음', '557.5', '(360.1, 235.5)', '1.555'],
            ['k1, k2', '536.5', '(342.4, 234.3)', '0.418'],
            ['계수 5 개', '536.1', '(342.4, 235.5)', '0.409'],
          ]}
          widths={[220, 150, 250, 200]}
          at={21.4}
          colors={[C.red, C.green, C.green]}
        />
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="없음" value={1.555} max={1.6} color={C.red} at={23} labelW={150} fmt="1.555 pixel" />
          <Bar label="k1, k2" value={0.418} max={1.6} color={C.green} at={23.5} labelW={150} fmt="0.418 pixel" />
          <Bar label="계수 5 개" value={0.409} max={1.6} color={C.green} at={24} labelW={150} fmt="0.409 pixel" />
        </div>
        <Line at={25.2} style={line(C.muted, 22)}>
          distortion 을 빼면 {sub('f', 'x')} 도 약 4% 커진다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function Zhang() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={400} at={0.3} gap={12} title={<Head color={C.blue}>homography · 판 위의 점을 사진의 점으로</Head>}>
        <svg width={824} height={166}>
          <g opacity={prog(t, 0.6)}>
            <rect x={30} y={6} width={120} height={120} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={3} />
            <line x1={90} y1={6} x2={90} y2={126} stroke={C.blue} strokeWidth={1.5} />
            <line x1={30} y1={66} x2={150} y2={66} stroke={C.blue} strokeWidth={1.5} />
            <text x={4} y={156} fill={C.blue} fontSize={22}>
              판 위의 점 (X, Y)
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            {arrow(176, 66, 232, 66, C.muted, 3)}
            <rect x={240} y={34} width={160} height={64} rx={14} fill={`${C.accent}14`} stroke={C.accent} strokeWidth={2} />
            <text x={320} y={75} textAnchor="middle" fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
              H (3×3)
            </text>
            {arrow(408, 66, 464, 66, C.muted, 3)}
          </g>
          <g opacity={prog(t, 1.8)}>
            <polygon points="480,6 660,30 660,102 480,126" fill={`${C.orange}22`} stroke={C.orange} strokeWidth={3} />
            <line x1={570} y1={18} x2={570} y2={114} stroke={C.orange} strokeWidth={1.5} />
            <line x1={480} y1={66} x2={660} y2={66} stroke={C.orange} strokeWidth={1.5} />
            <text x={570} y={156} textAnchor="middle" fill={C.orange} fontSize={22}>
              사진의 pixel (u, v)
            </text>
          </g>
        </svg>
        <Line at={2.4} style={mono(C.accent, 24)}>
          s (u, v, 1) = K [{sub('r', '1')} {sub('r', '2')} t] (X, Y, 1)
        </Line>
        <Line at={3.6} style={line(C.muted, 22)}>
          Z = 0 이라 R 의 셋째 칸이 지워진다. 숫자 9 개 중 8 개만 정하면 되고, 점 하나가 식 2 개를 주므로 점은 최소 4 개다
        </Line>
      </Box>
      <Box x={64} y={560} w={880} h={320} at={6.6} gap={10} title={<Head color={C.green}>Zhang (2000) 의 방법</Head>}>
        <Line at={6.9}>H 의 두 칸에서 K 의 효과를 되돌리면 rotation 의 두 칸 {sub('r', '1')}, {sub('r', '2')}</Line>
        <Line at={8.2} style={line(C.green)}>
          → 길이가 같고 서로 수직 → 사진 한 장에 K 를 정하는 식 2 개
        </Line>
        <Line at={19.8}>skew 까지 5 개 → 서로 다르게 기울인 사진 최소 3 장 (skew 0 이면 2 장)</Line>
        <Line at={21.6}>정면 사진은 어떤 f 로 되돌려도 길이가 같아 단서가 안 된다</Line>
        <Line at={23.2} style={line(C.muted, 22)}>
          논문 simulation: 45° 안팎이 가장 좋고, 5° 만 기울이면 시도의 40% 실패
        </Line>
      </Box>
      <Box x={976} y={140} w={880} h={400} at={13.2} gap={10} title={<Head color={C.orange}>f 를 추측해 되돌린 두 칸의 길이</Head>}>
        <span style={mono(C.muted, 20)}>H = [[208, 0, 320], [−144, 500, 240], [−0.6, 0, 1]]</span>
        <span style={line(C.muted, 22)}>기울여 찍은 판 · principal point (320, 240) 는 안다고 둔다</span>
        <Table
          head={['추측한 f', '첫째 칸 길이', '둘째 칸 길이']}
          rows={[
            ['400', '1.166', '1.25'],
            ['500', '1', '1'],
            ['600', '0.897', '0.833'],
          ]}
          widths={[240, 280, 280]}
          at={13.5}
          step={0.9}
          colors={[C.red, C.green, C.red]}
        />
        <Line at={17} style={line(C.green, 24)}>
          f = 500 일 때만 두 길이가 같다
        </Line>
      </Box>
      <Box x={976} y={560} w={880} h={320} at={25.6} title={<Head size={26}>refinement · 논문 실험 (640×480, corner 256 개, 사진 5 장)</Head>}>
        <Table
          head={['값', 'closed-form', 'refinement 뒤']}
          rows={[
            [sub('f', 'x'), '877.16', '832.50'],
            ['k1', '0.136', '−0.228'],
            ['RMS', '0.881 pixel', '0.335 pixel'],
          ]}
          widths={[240, 280, 280]}
          at={25.8}
          step={0.6}
          colors={[undefined, undefined, C.green]}
        />
        <Line at={28} style={line(C.muted, 22)}>
          Levenberg-Marquardt 로 distortion 까지 넣어 다시 줄인다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseRms = () => (
  <PauseWrite
    question="corner 세 개의 reprojection error 가 각각 0, 0, 3 pixel 이면 RMS 는?"
    answer={
      <>
        제곱 0, 0, 9 → 평균 9 ÷ 3 = 3 → √3 ≈ 1.73 pixel
        <br />
        그냥 평균한 거리 1 보다 크다
      </>
    }
  />
)

// ---------- ArUco marker pose ----------

/** a 6×6-bit marker inside a black border, schematic */
function Marker({ t, at }: { t: number; at: number }) {
  const c = 40
  const ox = 220
  const oy = 92
  const bits = ['101100', '010011', '110101', '001110', '100101', '011010']
  const corners: [number, number, number, string][] = [
    [ox, oy, 1, 'end'],
    [ox + 8 * c, oy, 2, 'start'],
    [ox + 8 * c, oy + 8 * c, 3, 'start'],
    [ox, oy + 8 * c, 4, 'end'],
  ]
  return (
    <g opacity={prog(t, at)}>
      <rect x={ox - 12} y={oy - 12} width={8 * c + 24} height={8 * c + 24} fill="#e2e8f0" />
      <rect x={ox} y={oy} width={8 * c} height={8 * c} fill="#0b0f18" />
      {bits.flatMap((row, r) => [...row].map((b, k) => (b === '1' ? <rect key={`${r}-${k}`} x={ox + (k + 1) * c} y={oy + (r + 1) * c} width={c} height={c} fill="#e2e8f0" /> : null)))}
      {corners.map(([x, y, n, anchor]) => (
        <g key={n} opacity={prog(t, at + 0.8 + n * 0.25)}>
          <circle cx={x} cy={y} r={9} fill={C.orange} />
          <text x={anchor === 'end' ? x - 24 : x + 24} y={y + 8} textAnchor={anchor as 'end' | 'start'} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
            {n}
          </text>
        </g>
      ))}
      <g opacity={prog(t, at + 2)}>
        <circle cx={ox + 4 * c} cy={oy + 4 * c} r={12} fill="none" stroke={C.accent} strokeWidth={4} />
        <circle cx={ox + 4 * c} cy={oy + 4 * c} r={4} fill={C.accent} />
      </g>
    </g>
  )
}

function MarkerScene() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={740} at={0.3}>
        <svg width={760} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            ArUco marker
          </text>
          <text x={730} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <Marker t={t} at={0.5} />
          <g opacity={prog(t, 7.2)}>
            {arrow(380, 448, 222, 448, C.green, 3, 10)}
            {arrow(380, 448, 538, 448, C.green, 3, 10)}
            <text x={380} y={484} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              한 변 0.05 m → 사진에서 50 pixel
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 516, width: 680, display: 'grid', gap: 10 }}>
          <Line at={1.2}>검은 테두리 안의 흑백 칸으로 번호 (ID) 를 적은 정사각형 표식</Line>
          <Line at={2.6} style={line(C.muted, 22)}>
            OpenCV 의 DICT_6X6_250: 6×6 칸 marker 250 개짜리 dictionary
          </Line>
          <Line at={4}>
            detector 출력: ID 와 네 꼭짓점의 pixel · 중심 <span style={mono(C.accent, 23)}>(370, 215)</span>
          </Line>
        </div>
      </Card>
      <Box x={856} y={140} w={1000} h={380} at={7.2} title={<Head color={C.green}>정면을 보는 한 변 0.05 m marker · f = 500</Head>}>
        <Table
          head={['단계', '계산', '결과']}
          rows={[
            ['거리 = f × 실제 크기 ÷ 사진 속 크기', '500 × 0.05 ÷ 50', 'Z = 0.5 m'],
            ['back-projection 의 X', '(370 − 320) × 0.5 ÷ 500', 'X = 0.05 m'],
            ['back-projection 의 Y', '(215 − 240) × 0.5 ÷ 500', 'Y = −0.025 m'],
          ]}
          widths={[380, 340, 200]}
          at={7.4}
          rowAt={[7.8, 14.4, 15.2]}
        />
        <Line at={16.6} style={mono(C.green, 26)}>
          marker 중심 = camera frame 의 (0.05, −0.025, 0.5)
        </Line>
      </Box>
      <Box x={856} y={540} w={1000} h={340} at={21.2} title={<Head color={C.orange}>기울어진 marker · PnP (Perspective-n-Point)</Head>}>
        <Line at={21.5}>기울면 정사각형이 사다리꼴로 찍혀서 한 변의 길이를 하나로 정할 수 없다</Line>
        <Line at={22.8}>
          marker 중심을 원점, marker 평면을 Z = 0 으로 두면 한 변 a 인 꼭짓점은 <span style={mono(C.orange, 23)}>(±a/2, ±a/2, 0)</span>
        </Line>
        <Line at={24.4} style={line(C.muted, 22)}>
          3D 좌표 4 개와 pixel 4 개로 pose 를 구한다 · OpenCV 의 solvePnP, 그 옵션 SOLVEPNP_IPPE_SQUARE 는 Collins & Bartoli (2014) 의 IPPE 를 정사각형 marker 에 맞춘 방식
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

function MarkerError() {
  const t = useSec()
  const B = { x: 100, y: 560 }
  const S = 900 // px per metre
  const cam = { x: B.x + 0.3 * S, y: B.y - 0.5 * S }
  const mk = B.x + 0.35 * S
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={900} h={740} at={0.3}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            로봇 base 위의 카메라와 책상 위의 marker
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            옆에서 본 모식도
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={40} y1={B.y} x2={560} y2={B.y} stroke={C.muted} strokeWidth={3} />
            <rect x={B.x - 34} y={B.y} width={68} height={36} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
            <text x={B.x} y={B.y + 66} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              base_link
            </text>
            <line x1={B.x} y1={B.y} x2={B.x} y2={cam.y} stroke={C.muted} strokeWidth={4} />
            <line x1={B.x} y1={cam.y} x2={cam.x - 30} y2={cam.y} stroke={C.muted} strokeWidth={4} />
            <text x={B.x - 14} y={340} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.5 m
            </text>
            <text x={(B.x + cam.x) / 2} y={cam.y - 14} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.3 m
            </text>
            <rect x={cam.x - 30} y={cam.y - 20} width={60} height={40} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
            <polygon points={`${cam.x - 12},${cam.y + 20} ${cam.x + 12},${cam.y + 20} ${cam.x},${cam.y + 34}`} fill={C.accent} />
            <text x={cam.x + 42} y={cam.y + 8} fill={C.accent} fontSize={22} fontFamily={MONO}>
              camera (0.3, 0, 0.5)
            </text>
            <line x1={cam.x} y1={cam.y + 34} x2={cam.x - 80} y2={B.y} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
            <line x1={cam.x} y1={cam.y + 34} x2={cam.x + 90} y2={B.y} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
          </g>
          <g opacity={prog(t, 1.2)}>
            <rect x={mk - 23} y={B.y - 10} width={46} height={10} fill={C.orange} />
            <text x={mk} y={B.y + 36} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              marker
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 580, top: 190, width: 300, display: 'grid', gap: 8, opacity: prog(t, 2) }}>
          <Head color={C.accent} size={24}>
            camera 축 → base 축
          </Head>
          <span style={line(C.text, 22)}>x (사진 오른쪽) → +x</span>
          <span style={line(C.text, 22)}>y (사진 아래쪽) → −y</span>
          <span style={line(C.text, 22)}>z (카메라 앞쪽) → −z</span>
          <span style={line(C.muted, 22)}>base 는 x 앞 · z 위, 카메라는 수직 아래를 본다</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 648, width: 840, display: 'grid', gap: 4 }}>
          <Line at={3} style={mono(C.text, 22)}>
            camera (0.05, −0.025, 0.5) → base 축 (0.05, 0.025, −0.5)
          </Line>
          <Line at={4.4} style={mono(C.orange, 22)}>
            + 카메라 위치 (0.3, 0, 0.5) = marker (0.35, 0.025, 0)
          </Line>
        </div>
      </Card>
      <Box x={996} y={140} w={860} h={420} at={7.2} title={<Head color={C.red}>꼭짓점 pixel 이 1 pixel 틀리면</Head>}>
        <Table
          head={['틀린 값', '원래', '1 pixel 틀림', '오차']}
          rows={[
            ['중심 u 370 → 371', '0.05 m', '0.051 m', '1 mm'],
            ['한 변 50 → 49', '0.5 m', '약 0.510 m', '약 1 cm'],
          ]}
          widths={[230, 170, 230, 170]}
          at={7.4}
          rowAt={[8, 14.4]}
          colors={[C.green, C.red]}
        />
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="좌우" value={1} max={10} color={C.green} at={15.4} width={420} labelW={80} fmt="1 mm" />
          <Bar label="거리" value={10} max={10} color={C.red} at={16} width={420} labelW={80} fmt="약 1 cm" />
        </div>
        <Line at={17.2} style={line(C.muted, 22)}>
          한 변 50 pixel 의 1 pixel 은 2% 라서 거리도 2% 틀린다. 좌우 오차 0.5 ÷ 500 = 0.001 m 의 10 배다
        </Line>
      </Box>
      <Box x={996} y={580} w={860} h={300} at={21.2} title={<Head color={C.green}>정밀하게 집으려면</Head>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {['큰 marker', '여러 marker 를 배열한 board', '카메라를 가까이'].map((s, i) => (
            <span key={s} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${C.green}77`, background: `${C.green}14`, color: C.green, fontSize: 24, fontWeight: 600, opacity: prog(t, 21.6 + i * 0.6) }}>
              {s}
            </span>
          ))}
        </div>
        <Line at={23.6} style={line(C.muted, 22)}>
          marker 가 작거나 멀수록 거리 오차와 좌우 오차의 차이가 커진다
        </Line>
      </Box>
    </AbsoluteFill>
  )
}

const PauseMarker = () => (
  <PauseWrite
    question="한 변 0.04 m marker 가 f = 500 인 카메라 사진에서 한 변 20 pixel 로 찍혔다. 거리는? 1 pixel 틀려 19 pixel 로 찍혔다면?"
    answer={
      <>
        500 × 0.04 ÷ 20 = 1 m · 500 × 0.04 ÷ 19 ≈ 1.053 m → 약 5 cm 틀린다
        <br />
        사진 속 한 변이 20 pixel 로 짧아서 1 pixel 이 5% 에 해당한다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'pinhole 과 거리', color: C.accent, text: <>u = {sub('f', 'x')} · X ÷ Z + {sub('c', 'x')} · 거리는 depth camera · stereo · marker 로 채운다</>, at: 1 },
    { tag: 'camera_info 와 tf2', color: C.blue, text: 'K · distortion 은 camera_info, extrinsics [R | t] 는 tf2 transform', at: 4.4 },
    { tag: 'Zhang calibration', color: C.orange, text: 'homography 로 K 추측 → refinement · distortion 을 빼면 RMS 0.42 → 1.56 pixel', at: 8.4 },
    { tag: 'ArUco marker pose', color: C.green, text: '거리 = f × 실제 크기 ÷ 사진 속 크기 · 같은 1 pixel 이 거리에는 좌우의 10 배', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            pixel 두 숫자에서 3D 위치 세 숫자로: 카메라의 무엇을 알고, 모자란 하나는 어디서 채울까?
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
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · GRASPING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Classical Pick & Place</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            물체의 3D 위치로 잡기 자세를 정하고, IK 와 경로 계획으로 물체를 옮기기
          </Label>
        </Appear>
        <Appear at={3.6} style={{ marginTop: 30, display: 'grid', justifyItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600 }}>
            Hand-Eye Calibration <span style={{ color: C.dim }}>·</span> Visual SLAM & VIO
          </div>
          <Label color={C.muted} size={28}>
            카메라가 로봇의 어디에 달렸는지 구하기 · 움직이는 카메라로 자기 위치와 지도를 함께 만들기
          </Label>
        </Appear>
        <Appear at={4.6} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/camera-geometry (Zhang 2000 · Hartley & Zisserman · ArUco · IPPE)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function CameraGeometry() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        projection: Projection,
        depth: Depth,
        'pause-project': PauseProject,
        intrinsics: Intrinsics,
        extrinsics: Extrinsics,
        'pause-distort': PauseDistort,
        reprojection: Reprojection,
        zhang: Zhang,
        'pause-rms': PauseRms,
        marker: MarkerScene,
        'marker-error': MarkerError,
        'pause-marker': PauseMarker,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
