import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './object-pose.narration.json'
import { script } from './object-pose.script'

// Numbers follow lessons/object-pose/README.md (see object-pose.script.ts). The mug drawings, the box top face and the
// lever-arm angle are schematic (marked 모식도 / 각도 과장); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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

function Box({ x, y, w, h, title, color = C.cardEdge, at, children, gap = 14 }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; children?: ReactNode; gap?: number }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, fontFamily: MONO, whiteSpace: 'nowrap' })

/** a mug seen from above: body circle and a handle at `deg` (0 = image right, −90 = image up) */
function MugTop({ cx, cy, r, deg, color, at, dash = false, handle = 46 }: { cx: number; cy: number; r: number; deg: number; color: string; at: number; dash?: boolean; handle?: number }) {
  const t = useSec()
  return (
    <g opacity={prog(t, at)}>
      <circle cx={cx} cy={cy} r={r} fill={`${color}1c`} stroke={color} strokeWidth={3} strokeDasharray={dash ? '9 7' : undefined} />
      <circle cx={cx} cy={cy} r={r * 0.7} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
      <g transform={`rotate(${deg} ${cx} ${cy})`}>
        <rect x={cx + r - 4} y={cy - 12} width={handle} height={24} rx={11} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={cx + r + handle - 8} cy={cy} r={7} fill={color} />
      </g>
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
            GRASPING · 6D OBJECT POSE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>6D Object Pose</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            rotation 3 + translation 3 = <span style={{ color: C.accent }}>T_co</span> · camera 에서 본 object
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            사진 속 물체가 어디에, 어느 쪽으로 얼마나 돌아가 있는지 숫자 6 개로 구하는 계산
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
      <Panel x={64} y={140} w={1000} h={420}>
        <svg width={1000} height={420}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 자리에 선 머그컵 둘 · 위에서 내려다본 사진
          </text>
          <text x={970} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <MugTop cx={250} cy={230} r={70} deg={0} color={C.blue} at={0.8} handle={66} />
          <MugTop cx={680} cy={230} r={70} deg={-90} color={C.orange} at={1.6} handle={66} />
          <g opacity={prog(t, 0.8)}>
            <text x={250} y={360} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600}>
              손잡이가 오른쪽
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <text x={680} y={360} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              손잡이가 뒤쪽
            </text>
          </g>
          <g opacity={prog(t, 2.4)}>
            <line x1={250} y1={230} x2={680} y2={230} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <text x={465} y={400} textAnchor="middle" fill={C.muted} fontSize={23}>
              컵 가운데의 3D 점은 둘 다 같다 → 손가락을 어디로 보낼지 정해지지 않는다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={420} at={0.5} title={<Head color={C.accent}>인식이 주는 것</Head>}>
        <div style={{ display: 'grid', gap: 16, marginTop: 6 }}>
          {[
            ['✓', 'detector 의 bounding box', '컵이 사진 어디쯤에 있는지', C.green, 0.9],
            ['✓', 'depth camera → 3D 점', '컵 가운데의 위치 (Classical Pick & Place)', C.green, 2],
            ['?', '어느 쪽으로 얼마나 돌아갔나', '손잡이의 방향 · grasp 를 정하려면 필요', C.red, 4.8],
          ].map(([m, a, b, c, at]) => (
            <div key={a as string} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', opacity: prog(t, at as number) }}>
              <span style={{ color: c as string, fontSize: 34, fontWeight: 700, lineHeight: '40px', width: 30 }}>{m as string}</span>
              <div style={{ display: 'grid', gap: 2 }}>
                <span style={{ ...line(C.text, 26), fontWeight: 600 }}>{a as string}</span>
                <span style={line(C.muted, 22)}>{b as string}</span>
              </div>
            </div>
          ))}
        </div>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 610, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          사진에서 물체의 위치에 더해 <span style={{ color: C.accent }}>어느 쪽으로 얼마나 돌아가 있는지</span>까지 어떻게 구할까?
        </div>
      </Appear>
      <Appear at={6.6} style={{ position: 'absolute', left: 64, top: 790, width: 1792, textAlign: 'center' }}>
        <Label mono color={C.muted} size={26}>
          6D object pose estimation · rotation 3 개 + translation 3 개 = T_co
        </Label>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- 6D pose ----------

function Pose() {
  const t = useSec()
  const o = { x: 300, y: 440 } // object origin in the drawing (10 cm = 300 px)
  const hx = o.x + 210 // the handle point, 7 cm to +x
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={760} h={740}>
        <svg width={760} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            object frame · CAD model 의 원점과 축
          </text>
          <text x={730} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            옆에서 본 머그컵 · 모식도
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={o.x - 120} y={o.y - 150} width={240} height={300} rx={18} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={3} />
            <path d={`M ${o.x + 120} ${o.y - 70} C ${hx + 40} ${o.y - 70}, ${hx + 40} ${o.y + 70}, ${o.x + 120} ${o.y + 70}`} fill="none" stroke={C.blue} strokeWidth={14} strokeLinecap="round" />
            <text x={o.x - 150} y={o.y - 60} textAnchor="end" fill={C.muted} fontSize={22}>
              높이 10 cm
            </text>
            <line x1={o.x - 138} x2={o.x - 138} y1={o.y - 150} y2={o.y + 150} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
          </g>
          {/* origin and axes */}
          <g opacity={prog(t, 1.4)}>
            <circle cx={o.x} cy={o.y} r={9} fill={C.accent} />
            <text x={o.x + 100} y={o.y + 44} textAnchor="end" fill={C.accent} fontSize={23} fontWeight={600}>
              원점 · 몸통 가운데
            </text>
            <line x1={o.x} y1={o.y} x2={o.x} y2={o.y - 230} stroke={C.green} strokeWidth={4} />
            <polygon points={`${o.x},${o.y - 244} ${o.x - 9},${o.y - 222} ${o.x + 9},${o.y - 222}`} fill={C.green} />
            <text x={o.x + 14} y={o.y - 226} fill={C.green} fontSize={26} fontWeight={700} fontFamily={MONO}>
              z
            </text>
            <text x={o.x + 42} y={o.y - 226} fill={C.green} fontSize={22}>
              컵이 서 있을 때 위쪽
            </text>
            <line x1={o.x} y1={o.y} x2={hx + 50} y2={o.y} stroke={C.orange} strokeWidth={4} />
            <polygon points={`${hx + 64},${o.y} ${hx + 42},${o.y - 9} ${hx + 42},${o.y + 9}`} fill={C.orange} />
            <text x={hx + 74} y={o.y + 9} fill={C.orange} fontSize={26} fontWeight={700} fontFamily={MONO}>
              x
            </text>
            <text x={hx + 74} y={o.y + 40} fill={C.orange} fontSize={22}>
              손잡이 쪽
            </text>
          </g>
          <g opacity={prog(t, 3.2)}>
            <circle cx={hx} cy={o.y} r={10} fill={C.orange} />
            <text x={hx} y={o.y - 24} textAnchor="middle" fill={C.orange} fontSize={23} fontWeight={600}>
              손잡이 점
            </text>
            <text x={hx} y={o.y + 216} textAnchor="middle" fill={C.orange} fontSize={26} fontFamily={MONO} fontWeight={600}>
              (0.07, 0, 0) m
            </text>
            <line x1={o.x} x2={hx} y1={o.y + 176} y2={o.y + 176} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
            <line x1={o.x} x2={o.x} y1={o.y + 150} y2={o.y + 184} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={hx} x2={hx} y1={o.y + 12} y2={o.y + 184} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={(o.x + hx) / 2} y={o.y + 170} textAnchor="middle" fill={C.muted} fontSize={21}>
              7 cm
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={856} y={140} w={1000} h={270} at={0.4} title={<Head color={C.accent}>object frame 과 6D pose T_co (camera 에서 본 object)</Head>} gap={6}>
        {[
          ['CAD model', 'mesh · 물체의 모양을 점과 삼각형 면으로 적은 파일', C.blue, 0.7],
          ['object frame', '그 파일을 만들 때 정한 원점과 축 · 손잡이 좌표는 p_o', C.blue, 1.8],
          ['rotation R', 'object frame 이 돌아간 방향 · 숫자 3 개 · 행렬의 열 = 각 축의 camera 방향', C.orange, 6.8],
          ['translation t', 'object frame 의 원점이 놓인 camera 좌표 · 숫자 3 개', C.green, 9.6],
          ['합쳐 6 개', '6-DoF pose · yaw 하나만 구하던 Classical Pick & Place 와 다르다', C.accent, 13.7],
        ].map(([a, b, c, at]) => (
          <div key={a as string} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at as number) }}>
            <span style={{ ...mono(c as string, 23), fontWeight: 600, width: 200 }}>{a as string}</span>
            <span style={{ ...line(C.text, 22), whiteSpace: 'nowrap' }}>{b as string}</span>
          </div>
        ))}
      </Box>
      <Box x={856} y={430} w={1000} h={205} at={14} title={<Head color={C.accent}>예시 카메라 (Classical Pick & Place 와 같은 카메라)</Head>} gap={8}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 14.3) }}>
          base 의 (0.3, 0, 0.55) 에서 수직 아래를 봄 · f = 500 · principal point (320, 240)
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 15.6) }}>
          컵 가운데 base (0.20, 0, 0.05) → camera 의 <span style={mono(C.green, 23)}>t = (−0.1, 0, 0.5)</span>
        </span>
        <span style={{ ...mono(C.accent, 23), opacity: prog(t, 17.4) }}>u = 500 × (−0.1 ÷ 0.5) + 320 = 220 · v = 240 → pixel (220, 240)</span>
      </Box>
      <Box x={856} y={655} w={1000} h={225} at={20.5} title={<Head color={C.accent}>이 예의 값 → 기호로 쓴 값</Head>} gap={4}>
        {[
          ['손잡이의 object 좌표 (0.07, 0, 0)', 'p_o', 20.8],
          ['0.07 × (x 축의 camera 방향)', 'R p_o', 21.9],
          ['컵 가운데 (−0.1, 0, 0.5)', 't', 23],
          ['손잡이의 camera 좌표', 'p_c = R p_o + t', 24.2],
        ].map(([a, b, at], i) => (
          <div key={a as string} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at as number) }}>
            <span style={{ ...line(i === 3 ? C.text : C.muted, 22), width: 560 }}>{a as string}</span>
            <span style={{ ...mono(i === 3 ? C.accent : C.text, 24), fontWeight: 600 }}>{b as string}</span>
          </div>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

function TwoCups() {
  const t = useSec()
  const px = (u: number, v: number) => ({ x: 50 + 1.25 * u, y: 70 + 1.25 * v })
  const c = px(220, 240)
  const hA = px(290, 240)
  const hB = px(220, 170)
  const rows: [string, string, string][] = [
    ['x 축 (camera)', '(1, 0, 0)', '(0, −1, 0)'],
    ['가운데 t', '(−0.1, 0, 0.5)', '(−0.1, 0, 0.5)'],
    ['손잡이 = 0.07 × x 축 + t', '(−0.03, 0, 0.5)', '(−0.1, −0.07, 0.5)'],
    ['손잡이의 pixel', '(290, 240)', '(220, 170)'],
  ]
  const outs: [string, string, string, number][] = [
    ['2D bounding box', '4', '거리, 방향', 19.8],
    ['3D 점', '3', '방향', 20.6],
    ['3D 점과 yaw', '4', '기울거나 누운 자세', 21.6],
    ['6D pose', '6', '없음', 22.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            사진에 찍힌 두 컵 · 가운데는 같은 pixel
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 컵 몸통 크기는 임의
          </text>
          <g opacity={prog(t, 0.3)}>
            <rect x={50} y={70} width={800} height={600} rx={8} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <line x1={60} y1={82} x2={150} y2={82} stroke={C.muted} strokeWidth={2} />
            <polygon points="160,82 148,76 148,88" fill={C.muted} />
            <text x={170} y={89} fill={C.muted} fontSize={20} fontFamily={MONO}>
              u (+X)
            </text>
            <line x1={60} y1={82} x2={60} y2={170} stroke={C.muted} strokeWidth={2} />
            <polygon points="60,180 54,168 66,168" fill={C.muted} />
            <text x={72} y={176} fill={C.muted} fontSize={20} fontFamily={MONO}>
              v (+Y)
            </text>
            <text x={836} y={100} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              f = 500 · principal point (320, 240)
            </text>
          </g>
          <MugTop cx={c.x} cy={c.y} r={50} deg={0} color={C.blue} at={0.6} />
          <g opacity={prog(t, 1.2)}>
            <text x={hA.x + 24} y={hA.y + 8} fill={C.blue} fontSize={23} fontWeight={600}>
              컵 A · 손잡이 (290, 240)
            </text>
            <text x={hA.x + 24} y={hA.y + 36} fill={C.muted} fontSize={20}>
              사진 오른쪽 (+X)
            </text>
          </g>
          <MugTop cx={c.x} cy={c.y} r={50} deg={-90} color={C.orange} at={6.8} dash />
          <g opacity={prog(t, 7.4)}>
            <text x={c.x} y={hB.y - 36} textAnchor="middle" fill={C.orange} fontSize={23} fontWeight={600}>
              컵 B · 손잡이 (220, 170)
            </text>
            <text x={c.x} y={hB.y - 62} textAnchor="middle" fill={C.muted} fontSize={20}>
              90° 돌아 사진 위쪽 (−Y)
            </text>
          </g>
          <g opacity={prog(t, 2)}>
            <circle cx={c.x} cy={c.y} r={6} fill={C.text} />
            <text x={c.x} y={c.y + 90} textAnchor="middle" fill={C.text} fontSize={23} fontWeight={600}>
              가운데 (220, 240) · 두 컵 모두
            </text>
            <text x={c.x} y={c.y + 118} textAnchor="middle" fill={C.muted} fontSize={20}>
              t = (−0.1, 0, 0.5) 도 같다
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <line x1={hA.x} y1={hA.y} x2={hB.x} y2={hB.y} stroke={C.red} strokeWidth={4} strokeDasharray="10 8" />
            <text x={c.x - 80} y={c.y + 190} fill={C.red} fontSize={24} fontWeight={700}>
              두 손잡이 사이 √(0.07² + 0.07²) ≈ 0.099 m, 약 10 cm
            </text>
            <text x={c.x - 80} y={c.y + 222} fill={C.red} fontSize={22}>
              3D 점 하나만 내는 인식으로는 두 컵이 구별되지 않는다
            </text>
          </g>
          <text x={30} y={716} fill={C.dim} fontSize={21} opacity={prog(t, 1.6)}>
            손잡이의 camera 좌표 = 0.07 × (x 축의 camera 방향) + t → f 로 투영해 pixel
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={0.3} title={<Head color={C.accent}>두 컵의 pose</Head>} gap={8}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: 8, alignItems: 'baseline' }}>
          <span />
          <span style={{ ...line(C.blue, 24), fontWeight: 700, opacity: prog(t, 0.6) }}>컵 A</span>
          <span style={{ ...line(C.orange, 24), fontWeight: 700, opacity: prog(t, 6.8) }}>컵 B</span>
          {rows.map(([n, a, b], i) => (
            <div key={n} style={{ display: 'contents' }}>
              <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.6 + i * 0.4) }}>{n}</span>
              <span style={{ ...mono(C.blue, 24), opacity: prog(t, 0.9 + i * 0.5) }}>{a}</span>
              <span style={{ ...mono(C.orange, 24), opacity: prog(t, 7.1 + i * 0.5) }}>{b}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={996} y={500} w={860} h={380} at={19.5} title={<Head color={C.accent}>인식의 출력 · 숫자 수 · grasp 에 모자라는 것</Head>} gap={8}>
        {outs.map(([a, n, b, at], i) => (
          <div key={a} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ ...line(i === 3 ? C.green : C.text, 23), width: 250 }}>{a}</span>
            <span style={{ ...mono(i === 3 ? C.green : C.accent, 26), fontWeight: 600, width: 60 }}>{n}</span>
            <span style={line(i === 3 ? C.green : C.red, 23)}>{i === 3 ? '모르는 것 없음' : `모름: ${b}`}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24) }}>통 안에 쌓인 물체나 옆으로 누운 컵은 roll 과 pitch 도 0 이 아니라서 rotation 숫자 3 개가 모두 필요하다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- PnP ----------

function Pnp() {
  const t = useSec()
  // the box top face in image pixels (220, 210) ~ (420, 270), drawn at 1.5 px a pixel
  const ix = (u: number) => 40 + (u - 220) * 1.5
  const iy = (v: number) => 120 + (v - 210) * 1.5
  const z = { x: 400, y: 70, s: 30 } // zoom inset: 30 px a pixel
  const p0 = { x: z.x + 60, y: z.y + 80 }
  const p1 = { x: p0.x + 3 * z.s, y: p0.y + 4 * z.s }
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={980} h={310} at={0.3} title={<Head color={C.accent}>2D–3D 대응 → PnP (Perspective-n-Point)</Head>} gap={12}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, 0.6) }}>
          <Chip at={0.6} color={C.green}>
            object frame 의 3D 점
          </Chip>
          <span style={line(C.muted, 22)}>↔ 짝</span>
          <Chip at={0.9} color={C.blue}>
            사진에 찍힌 pixel
          </Chip>
          <span style={{ ...line(C.accent, 22), fontWeight: 600, opacity: prog(t, 2.4) }}>대응 여러 개 → R, t</span>
        </div>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 3.4) }}>특징점 짝짓기는 무늬 없는 물체에서 막힌다 (PoseCNN 논문) → network 가 keypoint 의 pixel 을 찾게 학습한다</span>
        <div style={{ display: 'grid', gap: 6, padding: '12px 18px', borderRadius: 14, background: `${C.accent}10`, border: `1.5px solid ${C.accent}66`, opacity: prog(t, 14.2) }}>
          <span style={{ ...line(C.accent, 23), fontWeight: 700 }}>PnP: 모든 대응의 reprojection error 제곱 합이 가장 작아지는 R, t (OpenCV solvePnP)</span>
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 15.4) }}>대응 하나 = 식 2 개 (u, v) · 모르는 숫자 6 개 → 점 3 개면 식 6 개, 답이 최대 4 개라서 넷째 점으로 하나를 고른다</span>
        </div>
      </Box>
      <Box x={64} y={470} w={980} h={410} at={19.5} title={<Head color={C.red}>같은 1 pixel 오차가 주는 위치 오차 (f = 500, 0.5 m 앞)</Head>} gap={10}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 19.8) }}>
            <Label color={C.red} size={23} weight={700}>
              depth 방향 (카메라 앞쪽)
            </Label>
            <span style={mono(C.text, 22)}>20 cm 변 → 500 × 0.2 ÷ 0.5 = 200 pixel</span>
            <span style={{ ...mono(C.text, 22), opacity: prog(t, 20.8) }}>양 끝이 1 pixel 씩 안쪽 → 198 pixel</span>
            <span style={{ ...mono(C.red, 22), fontWeight: 600, opacity: prog(t, 21.8) }}>500 × 0.2 ÷ 198 ≈ 0.505 m → 5 mm 틀림</span>
          </div>
          <div style={{ display: 'grid', gap: 6, alignContent: 'start', opacity: prog(t, 23.4) }}>
            <Label color={C.green} size={23} weight={700}>
              옆 방향
            </Label>
            <span style={mono(C.text, 22)}>1 pixel → 0.5 ÷ 500 = 0.001 m</span>
            <span style={{ ...mono(C.green, 22), fontWeight: 600 }}>→ 1 mm 틀림</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="depth 방향 1 pixel" value={5} max={6} color={C.red} at={24.6} width={300} unit=" mm" labelW={210} />
          <Bar label="옆 방향 1 pixel" value={1} max={6} color={C.green} at={25.3} width={300} unit=" mm" labelW={210} />
        </div>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 26.2) }}>Joyce 등 (2025): RGB 만 쓰는 pose 추정기 5 개를 grasp simulation 에 넣자 translation 오차의 80% 이상이 카메라 시선 방향에서 나왔다</span>
      </Box>
      <Panel x={1076} y={140} w={780} h={740} style={{ opacity: prog(t, 6.5) }}>
        <svg width={780} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 6.6)}>
            reprojection error
          </text>
          <g opacity={prog(t, 6.8)}>
            <text x={ix(220)} y={iy(210) - 14} fill={C.muted} fontSize={20}>
              상자 윗면 20 × 6 cm · 0.5 m 앞
            </text>
            <rect x={ix(220)} y={iy(210)} width={ix(420) - ix(220)} height={iy(270) - iy(210)} rx={4} fill={`${C.blue}10`} stroke={C.blue} strokeWidth={2} />
            <text x={ix(220)} y={iy(270) + 28} fill={C.dim} fontSize={19} fontFamily={MONO}>
              (220, 210)
            </text>
            <text x={ix(220)} y={iy(270) + 56} fill={C.dim} fontSize={19}>
              지금 pose 로 투영
            </text>
            <circle cx={ix(420)} cy={iy(210)} r={7} fill={C.blue} />
            <circle cx={ix(423)} cy={iy(214)} r={7} fill={C.orange} />
            <line x1={ix(423) + 8} y1={iy(214)} x2={z.x} y2={z.y + 165} stroke={C.dim} strokeWidth={1.5} strokeDasharray="6 6" />
          </g>
          <g opacity={prog(t, 7.2)}>
            <rect x={z.x} y={z.y} width={330} height={330} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={z.x + 16} y={z.y + 30} fill={C.dim} fontSize={19}>
              확대 · 1 칸 = 1 pixel
            </text>
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line x1={z.x} x2={z.x + 330} y1={z.y + 40 + i * z.s} y2={z.y + 40 + i * z.s} stroke={C.grid} strokeWidth={1} />
                <line y1={z.y + 40} y2={z.y + 330} x1={z.x + i * z.s} x2={z.x + i * z.s} stroke={C.grid} strokeWidth={1} />
              </g>
            ))}
            <circle cx={p0.x} cy={p0.y} r={9} fill={C.blue} />
            <text x={p0.x - 14} y={p0.y - 16} fill={C.blue} fontSize={22} fontWeight={600}>
              투영 (420, 210)
            </text>
            <circle cx={p1.x} cy={p1.y} r={9} fill={C.orange} />
            <text x={p1.x + 16} y={p1.y + 32} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              찾음 (423, 214)
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p0.y} stroke={C.muted} strokeWidth={3} />
            <line x1={p1.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={C.muted} strokeWidth={3} />
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={C.red} strokeWidth={5} />
            <text x={(p0.x + p1.x) / 2} y={p0.y - 12} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              3
            </text>
            <text x={p1.x + 14} y={(p0.y + p1.y) / 2 + 8} fill={C.muted} fontSize={22} fontFamily={MONO}>
              4
            </text>
            <text x={390} y={460} textAnchor="middle" fill={C.red} fontSize={28} fontFamily={MONO} fontWeight={600}>
              √(3² + 4²) = 5 pixel
            </text>
            <text x={390} y={494} textAnchor="middle" fill={C.muted} fontSize={21}>
              투영한 pixel 과 찾은 pixel 의 거리 = 이 대응의 reprojection error
            </text>
          </g>
          <g opacity={prog(t, 20)}>
            <text x={30} y={560} fill={C.text} fontSize={22} fontWeight={600}>
              사진만 쓰는 PnP 는 depth 방향에 약하다
            </text>
            <text x={30} y={596} fill={C.muted} fontSize={20}>
              20 cm 변이 200 pixel 대신 198 pixel 로 잡히면 상자가 더 멀리 있는 것으로 계산된다
            </text>
            <text x={30} y={626} fill={C.muted} fontSize={20}>
              거리가 2 배면 같은 1 pixel 의 depth 오차는 4 배 (확인 문제: 1.0 m 에서 약 2 cm)
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- RANSAC and ICP ----------

function RansacIcp() {
  const t = useSec()
  const lx = (n: number) => 330 + (Math.log10(n) / 4) * 340 // log scale, 85 px a decade
  const rows: [string, string, number, string, string, number][] = [
    ['0.7', '0.168', 25, '25 번', '99% 이상', 13.3],
    ['0.5', '0.031', 145, '145 번', '95.8%', 14],
    ['0.3', '0.0024', 1893, '1,893 번', '21.6%', 14.7],
  ]
  const cm = (v: number) => 80 + v * 72
  const pins = (start: number, y: number, color: string, at: number, diffs: [number, number][], text: string) => (
    <g opacity={prog(t, at)}>
      {[0, 2, 4, 6].map((p, i) => {
        const x = cm(start + p)
        const [d, tgt] = diffs[i]
        return (
          <g key={p}>
            <circle cx={x} cy={y} r={7} fill={color} />
            {d !== 0 && (
              <g>
                <line x1={x} y1={y} x2={cm(tgt) - (d > 0 ? 8 : -8)} y2={y} stroke={color} strokeWidth={2.5} />
                <polygon points={d > 0 ? `${cm(tgt) - 2},${y} ${cm(tgt) - 12},${y - 5} ${cm(tgt) - 12},${y + 5}` : `${cm(tgt) + 2},${y} ${cm(tgt) + 12},${y - 5} ${cm(tgt) + 12},${y + 5}`} fill={color} />
              </g>
            )}
            <text x={x} y={y - 14} textAnchor="middle" fill={color} fontSize={18} fontFamily={MONO}>
              {d > 0 ? `+${d}` : d}
            </text>
          </g>
        )
      })}
      <text x={30} y={y + 38} fill={C.text} fontSize={21}>
        {text}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={880} h={740}>
        <svg width={880} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            RANSAC · 틀린 짝 (outlier) 을 거른다
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={30} y={70} width={420} height={56} rx={12} fill={`${C.red}14`} stroke={C.red} strokeWidth={1.5} />
            <text x={240} y={105} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={600} fontFamily={MONO}>
              outlier 140 pixel: 140² = 19,600
            </text>
          </g>
          <g opacity={prog(t, 1.4)}>
            <rect x={470} y={70} width={380} height={56} rx={12} fill={`${C.green}14`} stroke={C.green} strokeWidth={1.5} />
            <text x={660} y={105} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={600} fontFamily={MONO}>
              inlier 5 pixel: 5² = 25
            </text>
          </g>
          <text x={30} y={162} fill={C.muted} fontSize={21} opacity={prog(t, 2.8)}>
            제곱 합이라서 outlier 하나가 inlier 수백 개보다 큰 몫을 차지해 pose 를 끌고 간다
          </text>
          {[
            ['대응 5 개 뽑기', 6.7],
            ['EPnP 로 pose', 7.2],
            ['8 pixel 안 inlier 수', 7.7],
            ['최다 inlier 로 PnP', 8.2],
          ].map(([s, at], i) => (
            <g key={s as string} opacity={prog(t, at as number)}>
              <rect x={30 + i * 210} y={196} width={195} height={54} rx={12} fill={`${C.purple}14`} stroke={C.purple} strokeWidth={1.5} />
              <text x={127 + i * 210} y={230} textAnchor="middle" fill={C.purple} fontSize={20} fontWeight={600}>
                {s as string}
              </text>
              {i < 3 && (
                <text x={232 + i * 210} y={230} textAnchor="middle" fill={C.muted} fontSize={22}>
                  →
                </text>
              )}
            </g>
          ))}
          <text x={30} y={284} fill={C.dim} fontSize={19} opacity={prog(t, 9)}>
            OpenCV solvePnPRansac · 문턱 reprojectionError 의 기본값 8 pixel
          </text>
          <text x={30} y={310} fill={C.dim} fontSize={19} opacity={prog(t, 9)}>
            = 0.5 m 앞 옆 방향 8 × 0.5 ÷ 500 = 0.008 m · iterationsCount 100 은 상한
          </text>
          <g opacity={prog(t, 13)}>
            <text x={30} y={360} fill={C.muted} fontSize={20}>
              inlier 비율 w
            </text>
            <text x={170} y={360} fill={C.muted} fontSize={20}>
              w⁵
            </text>
            <text x={330} y={360} fill={C.muted} fontSize={20}>
              99% 에 필요한 횟수 (log 눈금)
            </text>
            <text x={760} y={360} fill={C.muted} fontSize={20}>
              100 번 성공
            </text>
            <line x1={lx(100)} x2={lx(100)} y1={374} y2={584} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
            <text x={lx(100)} y={602} textAnchor="middle" fill={C.orange} fontSize={19}>
              상한 100
            </text>
          </g>
          {rows.map(([w, w5, n, nl, ok, at], i) => {
            const y = 404 + i * 60
            const p = prog(t, at, 0.9)
            return (
              <g key={w} opacity={prog(t, at - 0.2, 0.3)}>
                <text x={30} y={y + 9} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
                  {w}
                </text>
                <text x={170} y={y + 9} fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {w5}
                </text>
                <rect x={330} y={y - 14} width={(lx(n) - 330) * p} height={28} rx={6} fill={i === 2 ? C.red : i === 1 ? C.orange : C.green} />
                <text x={lx(n) + 10} y={y + 9} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.6)}>
                  {nl}
                </text>
                <text x={760} y={y + 9} fill={i === 2 ? C.red : i === 1 ? C.orange : C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.8)}>
                  {ok}
                </text>
              </g>
            )
          })}
          <text x={30} y={660} fill={C.text} fontSize={21} opacity={prog(t, 16.2)}>
            횟수 = log(1 − 0.99) ÷ log(1 − w⁵) · 5 개가 모두 inlier 일 확률이 w⁵
          </text>
          <text x={30} y={694} fill={C.muted} fontSize={20} opacity={prog(t, 17)}>
            inlier 가 30% 뿐이면 상한을 올리거나, segmentation mask 안의 대응만 써서 w 를 먼저 올린다
          </text>
        </svg>
      </Panel>
      <Panel x={976} y={140} w={880} h={740} style={{ opacity: prog(t, 19.3) }}>
        <svg width={880} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 19.5)}>
            ICP · depth 의 point cloud 에 model 점 맞추기
          </text>
          <g opacity={prog(t, 19.8)}>
            <text x={30} y={88} fill={C.text} fontSize={22}>
              ① 짝짓기: 지금 pose 로 옮긴 model 점마다 가장 가까운 관측 점
            </text>
          </g>
          <g opacity={prog(t, 21.6)}>
            <text x={30} y={122} fill={C.text} fontSize={22}>
              ② 옮기기: 짝 거리의 제곱 합이 가장 작은 R, t (rotation 없으면 차이의 평균)
            </text>
          </g>
          <g opacity={prog(t, 25.5)}>
            <text x={30} y={176} fill={C.muted} fontSize={21}>
              model 핀 0, 2, 4, 6 cm · 실제 물체는 3 cm 옮겨져 관측 핀은 3, 5, 7, 9 cm (1차원 예)
            </text>
            <line x1={cm(0)} x2={cm(10)} y1={236} y2={236} stroke={C.muted} strokeWidth={2} />
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line x1={cm(i)} x2={cm(i)} y1={230} y2={242} stroke={C.muted} strokeWidth={2} />
                <text x={cm(i)} y={264} textAnchor="middle" fill={C.dim} fontSize={18} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            ))}
            <text x={cm(10) + 14} y={264} fill={C.dim} fontSize={18}>
              cm
            </text>
            {[3, 5, 7, 9].map((v) => (
              <g key={v}>
                <line x1={cm(v)} x2={cm(v)} y1={236} y2={520} stroke={`${C.green}55`} strokeWidth={2} strokeDasharray="4 6" />
                <circle cx={cm(v)} cy={214} r={8} fill="none" stroke={C.green} strokeWidth={3} />
              </g>
            ))}
            <text x={cm(9) + 20} y={220} fill={C.green} fontSize={19}>
              관측한 핀
            </text>
          </g>
          {pins(2.2, 310, C.blue, 26.2, [[0.8, 3], [0.8, 5], [0.8, 7], [0.8, 9]], '출발 2.2 → 차이 +0.8 씩 · 평균 +0.8 → 3.0 (참값, 오차 0 에서 멈춤)')}
          {pins(1.0, 400, C.orange, 28.2, [[2, 3], [0, 3], [0, 5], [0, 7]], '출발 1.0 → 짝 3, 3, 5, 7 · 차이 +2, 0, 0, 0 · 평균 +0.5 → 1.5')}
          {pins(1.5, 490, C.red, 29.6, [[1.5, 3], [-0.5, 3], [-0.5, 5], [-0.5, 7]], '1.5 → 차이 +1.5, −0.5, −0.5, −0.5 · 평균 0 → 멈춤 · local minimum (RMS ≈ 0.87 cm)')}
          <g opacity={prog(t, 30.6)}>
            <rect x={cm(2)} y={580} width={cm(4) - cm(2)} height={36} rx={8} fill={`${C.green}33`} stroke={C.green} strokeWidth={2} />
            <text x={cm(3)} y={605} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={700}>
              2 ~ 4 cm
            </text>
            <text x={cm(4) + 16} y={605} fill={C.green} fontSize={21} fontWeight={600}>
              basin of attraction · 참값 3 ± 1 cm (핀 간격의 절반) 에서 출발해야 참값에 닿는다
            </text>
          </g>
          <text x={30} y={664} fill={C.muted} fontSize={20} opacity={prog(t, 31)}>
            DeepIM 논문: ICP 는 첫 pose 에 민감해 출발점이 멀면 local minimum 에 수렴한다
          </text>
          <text x={30} y={694} fill={C.muted} fontSize={20} opacity={prog(t, 31)}>
            PoseCNN 은 pose 를 흔든 여러 출발점에서 ICP 를 실행해 가장 잘 맞은 결과를 고른다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- symmetry and metrics ----------

function Symmetry() {
  const t = useSec()
  const bx = (X: number) => 450 + 22 * X
  const by = (Y: number) => 292 - 22 * Y
  const corners: [number, number, string, string, number, number][] = [
    // X, Y, true label, estimate label at the same spot, label dx, dy
    [10, 3, '1', '4′', 22, -12],
    [10, -3, '2', '3′', 22, 30],
    [-10, 3, '3', '2′', -22, -12],
    [-10, -3, '4', '1′', -22, 30],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            ADD (average distance)
          </text>
          <text x={30} y={82} fill={C.text} fontSize={22} opacity={prog(t, 0.6)}>
            model 의 점을 정답 pose 와 추정 pose 로 옮긴 뒤 같은 점끼리의 거리를 평균
          </text>
          <text x={30} y={114} fill={C.muted} fontSize={21} opacity={prog(t, 2.8)}>
            맞음: ADD &lt; diameter (model 의 가장 먼 두 점 사이 거리) 의 10% · PoseCNN 의 평가 기준
          </text>
          <text x={30} y={166} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 6.5)}>
            무늬 없는 20 × 6 × 4 cm 상자를 수직축으로 180° 돌린 추정 · 위에서 본 그림
          </text>
          <g opacity={prog(t, 6.8)}>
            <rect x={bx(-10)} y={by(3)} width={bx(10) - bx(-10)} height={by(-3) - by(3)} rx={4} fill={`${C.blue}12`} stroke={C.blue} strokeWidth={2.5} />
            <text x={450} y={by(3) - 10} textAnchor="middle" fill={C.dim} fontSize={20}>
              20 × 6 cm
            </text>
            {corners.map(([X, Y, a, , dx, dy]) => (
              <g key={a}>
                <circle cx={bx(X)} cy={by(Y)} r={7} fill={C.blue} />
                <text x={bx(X) + dx} y={by(Y) + dy} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={700} fontFamily={MONO}>
                  {a}
                </text>
              </g>
            ))}
            <text x={bx(10) + 40} y={by(3) - 12} fill={C.blue} fontSize={20} fontFamily={MONO}>
              = (10, 3, 2) cm
            </text>
          </g>
          <g opacity={prog(t, 8.2)}>
            {corners.map(([X, Y, , b, dx, dy]) => (
              <text key={b} x={bx(X) - dx * 2.4} y={by(Y) + (dy > 0 ? -16 : 34)} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={700} fontFamily={MONO}>
                {b}
              </text>
            ))}
            <text x={bx(-10) + 40} y={by(-3) + 32} fill={C.orange} fontSize={20} fontFamily={MONO}>
              1′ = (−10, −3, 2) cm
            </text>
          </g>
          <g opacity={prog(t, 9.6)}>
            <line x1={bx(10)} y1={by(3)} x2={bx(-10) + 14} y2={by(-3) - 4} stroke={C.red} strokeWidth={4} />
            <polygon points={`${bx(-10)},${by(-3)} ${bx(-10) + 22},${by(-3) - 4} ${bx(-10) + 10},${by(-3) - 18}`} fill={C.red} />
            <text x={450} y={430} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={700} fontFamily={MONO}>
              1 → 1′ : 2 × √(10² + 3²) ≈ 20.9 cm
            </text>
            <text x={450} y={460} textAnchor="middle" fill={C.muted} fontSize={20}>
              파란 숫자: 정답 pose 의 꼭짓점 · 주황 숫자: 추정 pose 의 꼭짓점 · 여덟 꼭짓점이 모두 그만큼 옮겨진다
            </text>
          </g>
          <g opacity={prog(t, 13.2)}>
            <text x={30} y={506} fill={C.text} fontSize={23} fontFamily={MONO}>
              diameter = √(20² + 6² + 4²) ≈ 21.3 cm → 문턱 2.13 cm
            </text>
            <rect x={30} y={526} width={840} height={54} rx={12} fill={`${C.red}14`} stroke={C.red} strokeWidth={1.5} />
            <text x={50} y={561} fill={C.red} fontSize={24} fontWeight={700}>
              ADD (같은 꼭짓점끼리) = 20.9 cm → 2.13 cm 를 넘어 틀림
            </text>
          </g>
          <g opacity={prog(t, 16.2)}>
            <rect x={30} y={594} width={840} height={54} rx={12} fill={`${C.green}14`} stroke={C.green} strokeWidth={1.5} />
            <text x={50} y={629} fill={C.green} fontSize={24} fontWeight={700}>
              ADD-S (가장 가까운 꼭짓점까지) = 0 cm → 맞음 · 돌린 꼭짓점 집합이 정답과 같다
            </text>
          </g>
          <text x={30} y={686} fill={C.muted} fontSize={20} opacity={prog(t, 18)}>
            구별할 수 없는 pose 를 ADD 는 크게 벌한다 → PoseCNN 은 학습에도 가장 가까운 점까지의 거리를 쓰는
          </text>
          <text x={30} y={716} fill={C.muted} fontSize={20} opacity={prog(t, 18)}>
            ShapeMatch-Loss 로 대칭 물체의 똑같아 보이는 pose 를 벌하지 않는다
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={265} at={19.5} title={<Head color={C.accent}>PoseCNN · YCB-Video · AUC (문턱 0 ~ 10 cm 의 곡선 아래 넓이)</Head>} gap={8}>
        <Bar label="그릇 (bowl) · ADD" value={6.5} max={100} color={C.red} at={19.9} width={280} labelW={270} sub="축 둘레로 대칭" />
        <Bar label="그릇 (bowl) · ADD-S" value={69.7} max={100} color={C.green} at={20.8} width={280} labelW={270} />
        <Bar label="21 개 평균 ADD · 사진만" value={53.7} max={100} color={C.muted} at={22.2} width={280} labelW={270} />
        <Bar label="21 개 평균 ADD · + ICP" value={79.3} max={100} color={C.blue} at={23} width={280} labelW={270} sub="앞 절의 ICP" />
      </Box>
      <div style={{ position: 'absolute', left: 996, top: 430, width: 860 }}>
        <Misconception
          at={25.2}
          belief="ADD-S 가 작으면 grasp 에 쓸 만한 pose 다"
          fact={
            <>
              가장 가까운 점과만 비교해서 구별되는 잘못도 작게 잰다 (BOP 2020). 점 100 개 중 손잡이 점 5 개만 3 cm 떨어진 컵은 손잡이가 반대여도{' '}
              <span style={{ fontFamily: MONO, color: C.green }}>5 × 3 ÷ 100 = 0.15 cm</span>
            </>
          }
        />
      </div>
    </AbsoluteFill>
  )
}

function Bop() {
  const t = useSec()
  const rx = (v: number) => 70 + v * 87 // 0 ~ 11 cm across 957 px
  const d = 21.3
  const named: Record<number, string> = { 1: '1.06', 2: '2.13', 3: '3.19', 4: '4.25', 5: '5.32', 10: '10.63' }
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={320} at={0.3} title={<Head color={C.accent}>BOP (Benchmark for 6D Object Pose Estimation) 의 세 지표</Head>} gap={10}>
        {[
          ['MSSD', '대칭 변환 목록에서 정답에 가장 잘 맞는 것을 골라 model 점 사이 거리의 최댓값 · 3D 공간 · 표면의 가장 큰 어긋남이라 grasp 에 맞는다', C.orange, 0.6],
          ['MSPD', '같은 최댓값을 pixel 로 투영해 잰다', C.blue, 2.4],
          ['VSD', '사진에 보이는 표면의 depth 만 비교', C.purple, 3.6],
        ].map(([a, b, c, at]) => (
          <div key={a as string} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at as number) }}>
            <span style={{ ...mono(c as string, 24), fontWeight: 700, width: 90 }}>{a as string}</span>
            <span style={line(C.text, 21)}>{b as string}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 5) }}>
          무늬 없는 상자: 180° 회전이 목록에 있어 MSSD 0 · 손잡이 달린 컵: 목록이 비어서 손잡이가 반대쪽인 pose 의 MSSD 는 <span style={mono(C.red, 22)}>14 cm</span>
        </span>
      </Box>
      <Box x={976} y={140} w={880} h={320} at={7} title={<Head color={C.accent}>AR (Average Recall)</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 7.3) }}>문턱 하나 대신 여러 문턱에서 맞은 비율 (recall) 을 평균한다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 8.8) }}>
          MSSD 의 문턱: diameter 의 <span style={mono(C.orange, 23)}>5%, 10%, 15%, …, 50%</span> → 10 개
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 10.4) }}>dataset 점수 = VSD·MSSD·MSPD 의 AR 평균 · 대표 dataset 7 개의 평균이 BOP 의 대표 점수</span>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 11.6) }}>MSPD 문턱 5r ~ 50r pixel (r = 사진 폭 ÷ 640) · VSD 는 허용치 τ 와 문턱을 함께 바꾼다</span>
      </Box>
      <Panel x={64} y={490} w={1100} h={390} style={{ opacity: prog(t, 13.4) }}>
        <svg width={1100} height={390}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 13.5)}>
            21.3 cm 상자 · MSSD 3 cm 인 추정 하나가 AR 에 보태는 값
          </text>
          <g opacity={prog(t, 13.8)}>
            <line x1={rx(0)} x2={rx(11)} y1={170} y2={170} stroke={C.muted} strokeWidth={2} />
            {Array.from({ length: 12 }, (_, i) => (
              <g key={i}>
                <line x1={rx(i)} x2={rx(i)} y1={166} y2={176} stroke={C.muted} strokeWidth={2} />
                <text x={rx(i)} y={198} textAnchor="middle" fill={C.dim} fontSize={17} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            ))}
            <text x={rx(11) + 14} y={198} fill={C.dim} fontSize={17}>
              cm
            </text>
            {Array.from({ length: 10 }, (_, i) => {
              const k = i + 1
              const x = rx(d * 0.05 * k)
              return (
                <g key={k}>
                  <line x1={x} x2={x} y1={110} y2={170} stroke={C.orange} strokeWidth={2} />
                  <text x={x} y={100} textAnchor="middle" fill={C.orange} fontSize={17} fontFamily={MONO}>
                    {5 * k}%
                  </text>
                  {named[k] && (
                    <text x={x} y={222} textAnchor="middle" fill={C.muted} fontSize={16} fontFamily={MONO}>
                      {named[k]}
                    </text>
                  )}
                </g>
              )
            })}
            <text x={30} y={100} fill={C.orange} fontSize={18}>
              문턱
            </text>
          </g>
          <g opacity={prog(t, 14.6)}>
            <line x1={rx(3)} x2={rx(3)} y1={120} y2={176} stroke={C.red} strokeWidth={4} />
            <text x={rx(3) + 10} y={140} fill={C.red} fontSize={22} fontWeight={700}>
              오차 3 cm
            </text>
          </g>
          {Array.from({ length: 10 }, (_, i) => {
            const k = i + 1
            const pass = d * 0.05 * k > 3
            return (
              <text key={k} x={rx(d * 0.05 * k)} y={266} textAnchor="middle" fill={pass ? C.green : C.red} fontSize={26} fontWeight={700} opacity={prog(t, 15.4 + i * 0.25)}>
                {pass ? '✓' : '✗'}
              </text>
            )
          })}
          <g opacity={prog(t, 18.2)}>
            <text x={30} y={320} fill={C.text} fontSize={22}>
              1.06, 2.13 cm: 오차보다 작아 통과 못 함 · 3.19 cm (15%) 부터 10.63 cm 까지 8 개 통과
            </text>
            <text x={30} y={360} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600}>
              8 ÷ 10 = 0.8
            </text>
            <text x={230} y={360} fill={C.muted} fontSize={21}>
              을 이 추정이 AR 에 보탠다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={490} w={660} h={390} at={20.5} title={<Head color={C.accent}>BOP 의 최고 AR</Head>} gap={10}>
        <Bar label="학습한 물체 · 2017" value={56.9} max={100} color={C.muted} at={20.8} width={190} labelW={230} />
        <Bar label="학습한 물체 · 2023" value={85.6} max={100} color={C.green} at={21.6} width={190} labelW={230} />
        <Bar label="처음 보는 물체 · 2023" value={67.4} max={100} color={C.muted} at={23} width={190} labelW={230} />
        <Bar label="처음 보는 물체 · 2024" value={82.1} max={100} color={C.orange} at={23.8} width={190} labelW={230} />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 25) }}>처음 보는 물체 부문: 3D model 만 받아 GPU 한 대로 5 분 안에 준비 · 2024 년 1 위 FreeZeV2.1 은 이미지 한 장에 24.9 초</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- learned methods and render-and-compare ----------

function RenderCompare() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fill={color} fontSize={24} fontWeight={700}>
        {title}
      </text>
      <text x={x + w / 2} y={y + 66} textAnchor="middle" fill={C.muted} fontSize={19}>
        {sub}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <circle cx={x2} cy={y2} r={6} fill={color} />
    </g>
  )
  const methods: [string, string, string, string, number][] = [
    ['DeepIM', '2018 · 학습한 물체', 'PoseCNN 의 pose 를 4 번 고침 → LINEMOD 의 ADD 정답률 (문턱 diameter 10%) 62.7% → 88.6% · 2 번이면 GTX 1080 Ti 에서 물체 하나당 1초에 12 번', C.blue, 19.8],
    ['MegaPose', 'CoRL 2022 · 처음 보는 물체', 'coarse: hypothesis 5 × 104 = 520 개를 refiner 의 basin 안인지 점수 → 가장 높은 하나를 5 번 refine · 한 번 약 50 ms, 520 개 약 2.5 초 (RTX 2080)', C.orange, 22.4],
    ['FoundationPose', 'CVPR 2024 · 처음 보는 물체 + tracking', 'hypothesis 42 × 6 = 252 (논문 42 × 12 = 504) → refine → score (self-attention) · 약 1.3 초 = 4 ms + 0.88 초 + 0.42 초 (RTX 3090) · tracking 약 32 Hz · AR 83.3 (MegaPose RGB-D 58.6) · Isaac ROS refine_iterations 3', C.green, 26.2],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={820} h={740} at={0.3} title={<Head color={C.accent}>instance-level · 합성 데이터로 학습한 물체만</Head>} gap={12}>
        {[
          ['PoseCNN', 'RSS 2018 · pixel 마다 물체 분류 + 중심 방향 투표 + 거리 → t (back-projection) · rotation 은 quaternion regression · YCB-Video 21 개, 133,827 frame', C.blue, 0.6],
          ['DOPE', 'CoRL 2018 · cuboid 꼭짓점 8 + 중심 1 = belief map 9 장 → 봉우리 pixel 로 PnP · 꼭짓점 4 개 이상이면 pose', C.orange, 2.4],
        ].map(([a, b, c, at]) => (
          <div key={a as string} style={{ display: 'grid', gap: 2, opacity: prog(t, at as number) }}>
            <span style={{ ...mono(c as string, 24), fontWeight: 700 }}>{a as string}</span>
            <span style={line(C.text, 21)}>{b as string}</span>
          </div>
        ))}
        <span style={{ ...line(C.red, 22), fontWeight: 600, opacity: prog(t, 4.4) }}>새 물체 → 그 물체로 다시 학습: 물체마다 몇 시간 ~ 며칠 (MegaPose 논문)</span>
        <div style={{ opacity: prog(t, 6.5), marginTop: 6 }}>
          <Head color={C.orange} size={24}>
            DOPE · sugar box 의 ADD AUC (학습 사진의 종류와 장 수)
          </Head>
        </div>
        <Bar label="domain randomization 만 · 30만 장" value={66.64} max={100} color={C.orange} at={6.9} width={200} labelW={350} fmt="66.64" />
        <Bar label="사실적인 사진만 · 60만 장" value={62.94} max={100} color={C.blue} at={8.2} width={200} labelW={350} fmt="62.94" />
        <Bar label="둘을 섞음 · 12만 장" value={77} max={100} color={C.green} at={9.6} width={200} labelW={350} fmt="77.00" sub="가장 높다" />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 11) }}>domain randomization: 무늬·조명·배경·방해 물체를 일부러 비현실적으로 바꿔 실제 사진이 또 하나의 변형으로 보이게 한다 (Tobin 등 2017: 실제 위치를 1.5 cm 안으로)</span>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 12) }}>실제 사진 없이 학습한 DOPE 의 pose 로 Baxter 로봇이 물체 5 개를 12 번씩 집어 60 번 중 49 번 성공</span>
      </Box>
      <Panel x={916} y={140} w={940} h={350} style={{ opacity: prog(t, 12.9) }}>
        <svg width={940} height={350}>
          <text x={30} y={40} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 13)}>
            render-and-compare · refiner
          </text>
          {node(30, 130, 200, 90, '지금 pose', 'R, t', C.accent, 13.3)}
          {node(290, 56, 320, 84, 'render', 'CAD model 을 지금 pose 로 그린 그림', C.blue, 13.8)}
          {node(290, 210, 320, 84, '사진의 물체 영역', '같은 자리를 자른 사진', C.muted, 14.3)}
          {node(660, 130, 250, 90, 'refiner', '두 그림을 비교하는 network', C.orange, 14.8)}
          {arrow(230, 160, 290, 104, C.blue, 13.8)}
          {arrow(610, 98, 660, 160, C.orange, 14.8)}
          {arrow(610, 252, 660, 190, C.orange, 14.8)}
          <g opacity={prog(t, 16)}>
            <path d="M 785 220 L 785 312 L 130 312 L 130 228" fill="none" stroke={C.green} strokeWidth={3} />
            <polygon points="130,222 123,236 137,236" fill={C.green} />
            <text x={460} y={340} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600} fontFamily={MONO}>
              Δt, ΔR → t + Δt, ΔR ⊗ R → 다시 render (되풀이)
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={916} y={520} w={940} h={360} at={19.5} gap={10}>
        {methods.map(([a, b, c, col, at]) => (
          <div key={a} style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ ...mono(col, 24), fontWeight: 700 }}>{a}</span>
              <span style={line(C.muted, 20)}>{b}</span>
            </div>
            <span style={line(C.text, 20)}>{c}</span>
          </div>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

// ---------- pose to grasp ----------

function Grasp() {
  const t = useSec()
  const nodes: [number, string, string, string, number][] = [
    [20, 'base', '로봇 기준', C.text, 0.8],
    [270, 'camera', '(0.3, 0, 0.55)', C.blue, 1],
    [520, 'object (컵)', 't = (−0.1, 0, 0.5)', C.orange, 1.2],
    [770, 'grasp', '손잡이 (0.07, 0, 0)', C.green, 1.4],
  ]
  const edges: [number, string, string, string, number][] = [
    [200, 'T_bc', 'hand-eye calibration · 아래를 봄', C.blue, 7.2],
    [450, 'T_co', 'pose 추정기가 낸다', C.orange, 8.6],
    [700, 'T_og', 'CAD model 위에서 미리 정함', C.green, 1.8],
  ]
  const cup = { x: 250, y: 330 }
  const arm = 300 // 7 cm
  const ang = (14 * Math.PI) / 180 // drawn larger than 5°
  const h0 = { x: cup.x + arm, y: cup.y }
  const h1 = { x: cup.x + arm * Math.cos(ang), y: cup.y - arm * Math.sin(ang) }
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={48} fill={C.accent} fontSize={32} fontWeight={600} fontFamily={MONO} opacity={prog(t, 0.3)}>
            T_bg = T_bc · T_co · T_og
          </text>
          <text x={30} y={84} fill={C.muted} fontSize={20} opacity={prog(t, 0.6)}>
            base 에서 본 gripper = (base → camera) · (camera → object) · (object → gripper)
          </text>
          {nodes.map(([x, a, b, c, at]) => (
            <g key={a} opacity={prog(t, at)}>
              <rect x={x} y={120} width={180} height={76} rx={14} fill={`${c}14`} stroke={c} strokeWidth={2.5} />
              <text x={x + 90} y={152} textAnchor="middle" fill={c} fontSize={24} fontWeight={700}>
                {a}
              </text>
              <text x={x + 90} y={182} textAnchor="middle" fill={C.muted} fontSize={16} fontFamily={MONO}>
                {b}
              </text>
            </g>
          ))}
          {edges.map(([x, a, b, c, at]) => (
            <g key={a} opacity={prog(t, at)}>
              <line x1={x + 4} x2={x + 56} y1={158} y2={158} stroke={c} strokeWidth={3} />
              <polygon points={`${x + 68},158 ${x + 54},151 ${x + 54},165`} fill={c} />
              <text x={x + 35} y={108} textAnchor="middle" fill={c} fontSize={24} fontWeight={700} fontFamily={MONO}>
                {a}
              </text>
              <text x={x + 35} y={226} textAnchor="middle" fill={c} fontSize={18}>
                {b}
              </text>
            </g>
          ))}
          <text x={30} y={278} fill={C.muted} fontSize={20} opacity={prog(t, 2.6)}>
            grasp 는 실행 때마다 계산하지 않고 CAD model 위에서 한 번 정한다 · Isaac ROS 예제는 grasp YAML 을 받는다
          </text>
          <text x={30} y={340} fill={C.text} fontSize={23} fontWeight={600} opacity={prog(t, 13)}>
            camera 좌표 → base 좌표: 축을 (X, −Y, −Z) 로 바꾸고 카메라 자리 (0.3, 0, 0.55) 를 더한다
          </text>
          <g opacity={prog(t, 13.3)}>
            {['손잡이 (camera)', '축 맞추기 (X, −Y, −Z)', '+ (0.3, 0, 0.55) → base'].map((h, i) => (
              <text key={h} x={[100, 390, 690][i]} y={382} fill={C.muted} fontSize={19}>
                {h}
              </text>
            ))}
          </g>
          {[
            ['A', '(−0.03, 0, 0.5)', '(−0.03, 0, −0.5)', '(0.27, 0, 0.05)', C.blue, 13.6, 422],
            ['B', '(−0.1, −0.07, 0.5)', '(−0.1, 0.07, −0.5)', '(0.20, 0.07, 0.05)', C.orange, 16.6, 470],
          ].map(([k, a, b, c, col, at, y]) => (
            <g key={k as string} opacity={prog(t, at as number)}>
              <text x={30} y={y as number} fill={col as string} fontSize={23} fontWeight={700}>
                컵 {k as string}
              </text>
              <text x={100} y={y as number} fill={C.text} fontSize={22} fontFamily={MONO}>
                {a as string}
              </text>
              <text x={390} y={y as number} fill={C.text} fontSize={22} fontFamily={MONO}>
                {b as string}
              </text>
              <text x={690} y={y as number} fill={col as string} fontSize={23} fontFamily={MONO} fontWeight={700}>
                {c as string}
              </text>
            </g>
          ))}
          <text x={30} y={524} fill={C.muted} fontSize={20} opacity={prog(t, 17.8)}>
            카메라가 아래를 보므로 camera 의 Y, Z 축은 base 의 −Y, −Z 방향 · 컵 A 는 T_bc 와 T_co 의 rotation 을 곱하면 I 라서
          </text>
          <text x={30} y={552} fill={C.muted} fontSize={20} opacity={prog(t, 17.8)}>
            컵의 축이 base 축과 나란하다 · (0.2, 0, 0.05) + (0.07, 0, 0) = (0.27, 0, 0.05)
          </text>
          <text x={30} y={612} fill={C.text} fontSize={22} opacity={prog(t, 18.6)}>
            대칭 물체는 grasp 도 대칭에 맞춰 여러 개 저장 → 어느 pose 가 나와도 쓴다
          </text>
          <text x={30} y={650} fill={C.text} fontSize={22} opacity={prog(t, 19)}>
            손잡이가 몸통 뒤에 가려진 컵: 사진엔 대칭인 원기둥만 보여 손잡이 방향을 믿을 수 없다
          </text>
          <text x={30} y={684} fill={C.muted} fontSize={21} opacity={prog(t, 19)}>
            → 몸통을 쥐거나 카메라를 옮겨 다시 본다
          </text>
        </svg>
      </Panel>
      <Panel x={1096} y={140} w={760} h={740} style={{ opacity: prog(t, 19.9) }}>
        <svg width={760} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 20)}>
            rotation 오차 → 위치 오차 (위에서 본 컵)
          </text>
          <text x={730} y={44} textAnchor="end" fill={C.dim} fontSize={19} opacity={prog(t, 20)}>
            각도는 보기 쉽게 키움
          </text>
          <g opacity={prog(t, 20.3)}>
            <circle cx={cup.x} cy={cup.y} r={64} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={3} />
            <circle cx={cup.x} cy={cup.y} r={8} fill={C.accent} />
            <text x={cup.x} y={cup.y + 100} textAnchor="middle" fill={C.muted} fontSize={20}>
              object 원점
            </text>
            <line x1={cup.x} y1={cup.y} x2={h0.x} y2={h0.y} stroke={C.green} strokeWidth={4} />
            <circle cx={h0.x} cy={h0.y} r={10} fill={C.green} />
            <text x={h0.x + 10} y={h0.y + 66} textAnchor="end" fill={C.green} fontSize={21} fontWeight={600}>
              정답 pose 의 손잡이
            </text>
            <text x={cup.x + 150} y={cup.y + 30} textAnchor="middle" fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              7 cm
            </text>
          </g>
          <g opacity={prog(t, 21.4)}>
            <line x1={cup.x} y1={cup.y} x2={h1.x} y2={h1.y} stroke={C.orange} strokeWidth={4} strokeDasharray="10 8" />
            <circle cx={h1.x} cy={h1.y} r={10} fill={C.orange} />
            <text x={h1.x + 10} y={h1.y - 20} textAnchor="end" fill={C.orange} fontSize={21} fontWeight={600}>
              5° 틀린 pose 의 손잡이
            </text>
            <path d={`M ${cup.x + 110} ${cup.y} A 110 110 0 0 0 ${cup.x + 110 * Math.cos(ang)} ${cup.y - 110 * Math.sin(ang)}`} fill="none" stroke={C.orange} strokeWidth={2.5} />
            <text x={cup.x + 126} y={cup.y - 18} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={700}>
              5°
            </text>
          </g>
          <g opacity={prog(t, 22.4)}>
            <line x1={h0.x} y1={h0.y} x2={h1.x} y2={h1.y} stroke={C.red} strokeWidth={6} />
            <text x={h0.x + 22} y={(h0.y + h1.y) / 2 + 2} fill={C.red} fontSize={24} fontWeight={700} fontFamily={MONO}>
              ≈ 6.1 mm
            </text>
          </g>
          <g opacity={prog(t, 22.8)}>
            <rect x={30} y={450} width={700} height={110} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={50} y={490} fill={C.text} fontSize={25} fontFamily={MONO}>
              0.07 × tan 5° ≈ 0.0061 m → 약 6.1 mm
            </text>
            <text x={50} y={532} fill={C.muted} fontSize={21}>
              위치 오차 = 원점에서 grasp 점까지의 거리 × rotation 오차 (lever arm)
            </text>
          </g>
          <text x={30} y={600} fill={C.red} fontSize={23} fontWeight={700} opacity={prog(t, 24.2)}>
            10° 면 약 12 mm → Classical Pick & Place 의 한쪽 여유 1 cm 를 넘는다
          </text>
          <text x={30} y={640} fill={C.text} fontSize={21} opacity={prog(t, 25.4)}>
            translation 오차는 그대로 더해진다 · calibration + pose + 실행 오차의 합이
          </text>
          <text x={30} y={668} fill={C.text} fontSize={21} opacity={prog(t, 25.4)}>
            gripper 의 여유 안에 들어야 한다 (error budget)
          </text>
          <text x={30} y={704} fill={C.muted} fontSize={20} opacity={prog(t, 26.4)}>
            Joyce 등 (2025) simulation: grasp 실패를 가른 것은 대부분 translation 오차
          </text>
          <text x={30} y={730} fill={C.muted} fontSize={20} opacity={prog(t, 26.4)}>
            rotation 오차는 실패를 가장 덜 예측했다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: '6D pose 와 두 컵', color: C.accent, text: 'rotation 3 + translation 3 · p_c = R p_o + t · 가운데가 같은 두 컵의 손잡이는 약 10 cm 차이', at: 0.6 },
    { tag: 'PnP · RANSAC · ICP', color: C.blue, text: '1 pixel → depth 5 mm, 옆 1 mm · inlier 0.5 면 99% 에 145 번 · ICP 는 basin (2 ~ 4 cm) 안에서 출발', at: 4.5 },
    { tag: '대칭과 BOP 의 AR', color: C.orange, text: '180° 돈 상자 ADD 20.9 cm vs ADD-S 0 · MSSD·MSPD·VSD · 문턱 10 개의 recall 평균 (3 cm → 0.8)', at: 8.4 },
    { tag: 'refiner 와 grasp', color: C.green, text: 'FoundationPose 약 1.3 초 · tracking 약 32 Hz · T_bg = T_bc · T_co · T_og · 7 cm, 5° → 6.1 mm', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            사진에서 물체가 어디에, 어느 쪽으로 얼마나 돌아가 있는지 어떻게 구할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
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
            NEXT · GRASPING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Motion Planning · Behavior Cloning</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            grasp pose 까지 다른 물체를 피해 팔을 옮기는 경로 · pose 없이 사진에서 바로 action 을 내는 policy
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/object-pose (PoseCNN · DOPE · DeepIM · MegaPose · FoundationPose · BOP)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PausePose = () => (
  <PauseWrite
    question="컵이 제자리에서 180° 돌아 손잡이가 사진 왼쪽(−X)을 향한다. 손잡이의 camera 좌표와 pixel 은?"
    answer={
      <>
        x 축 = (−1, 0, 0) → 손잡이 0.07 × (−1, 0, 0) + (−0.1, 0, 0.5) = (−0.17, 0, 0.5)
        <br />
        u = 500 × (−0.17 ÷ 0.5) + 320 = 150, v = 240 → pixel (150, 240)
      </>
    }
  />
)

const PausePnp = () => (
  <PauseWrite
    question="같은 상자가 1.0 m 앞에 있다. 20 cm 변은 몇 pixel 로 찍히고, 양 끝이 1 pixel 씩 안쪽으로 잡히면 depth 는 얼마나 틀릴까?"
    answer={
      <>
        500 × 0.2 ÷ 1.0 = 100 pixel · 98 pixel 이면 500 × 0.2 ÷ 98 ≈ 1.020 m, 약 2 cm
        <br />
        옆 1 pixel 은 1.0 ÷ 500 = 2 mm · 거리 2 배에 depth 오차는 5 mm → 2 cm, 4 배
      </>
    }
  />
)

const PauseAr = () => (
  <PauseWrite
    question="같은 21.3 cm 상자의 추정 하나가 MSSD 5 cm 다. 문턱 10 개 가운데 몇 개를 통과해 AR 에 얼마를 보탤까?"
    answer={
      <>
        문턱 1.06, 2.13, 3.19, 4.25, 5.32, …, 10.63 cm (diameter 의 5% 간격)
        <br />5 cm 보다 큰 문턱은 25% (5.32 cm) 부터 50% 까지 6 개 → 6 ÷ 10 = 0.6
      </>
    }
  />
)

const PauseGrasp = () => (
  <PauseWrite
    question="손잡이의 camera 좌표가 (−0.17, 0, 0.5) 인 컵 (180° 돈 컵) 의 손잡이는 base frame 의 어디일까?"
    answer={
      <>
        (X, −Y, −Z) = (−0.17, 0, −0.5) → + (0.3, 0, 0.55) = (0.13, 0, 0.05)
        <br />
        컵 가운데 (0.20, 0, 0.05) 보다 로봇 쪽으로 7 cm 가까운 자리
      </>
    }
  />
)

export function ObjectPose() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        pose: Pose,
        'two-cups': TwoCups,
        'pause-pose': PausePose,
        pnp: Pnp,
        'ransac-icp': RansacIcp,
        'pause-pnp': PausePnp,
        symmetry: Symmetry,
        bop: Bop,
        'pause-ar': PauseAr,
        'render-compare': RenderCompare,
        grasp: Grasp,
        'pause-grasp': PauseGrasp,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
