import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './visual-slam.narration.json'
import { script } from './visual-slam.script'

// Numbers follow lessons/visual-slam/README.md and its figures (see visual-slam.script.ts). The camera, ray and room drawings
// are schematic (marked 모식도); every number on screen is the lesson's.

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

/** a camera drawn as a small triangle pointing up, its centre at (x, y) */
function Cam({ x, y, color = C.blue, s = 18 }: { x: number; y: number; color?: string; s?: number }) {
  return <polygon points={`${x},${y - s} ${x - s},${y + s * 0.8} ${x + s},${y + s * 0.8}`} fill={`${color}33`} stroke={color} strokeWidth={2.5} />
}

/** a left-aligned text table: first column sans, the rest mono; each row fades in at its own time */
function Table({ head, rows, widths, ats, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; ats: number[]; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', paddingRight: 10 })
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', opacity: prog(t, ats[0] - 0.2), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, ats[k]), color: colors?.[k] ?? C.text }}>
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
            ESTIMATION · VISUAL SLAM
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Visual SLAM &amp; VIO</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            카메라 사진으로 <span style={{ color: C.accent }}>자기 위치 · 3D 지도</span> 를 함께
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            여러 사진에서 같은 점을 찾아 방향을 겹치고, IMU 로 실제 크기를 맞춘다
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
  const facts: [ReactNode, string, number][] = [
    ['사진 한 장: 점이 있는 방향만 알고, 거리는 모른다', C.red, 0.9],
    ['두 자리에서 본 방향을 겹치면 거리가 나온다 → Visual SLAM', C.green, 1.8],
    ['움직인 거리의 실제 크기 (m) 는 IMU 로 맞춘다 → VIO', C.orange, 2.7],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={330}>
        <svg width={760} height={330}>
          <text x={30} y={44} fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.5)}>
            <rect x={300} y={70} width={60} height={50} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2.5} />
            <text x={380} y={104} fill={C.orange} fontSize={22} fontWeight={600}>
              가상 의자
            </text>
            <line x1={170} y1={255} x2={318} y2={122} stroke={C.blue} strokeWidth={2} strokeDasharray="7 6" />
            <Cam x={170} y={262} />
            <text x={170} y={312} textAnchor="middle" fill={C.blue} fontSize={22}>
              사진 1
            </text>
          </g>
          <g opacity={prog(t, 1.8)}>
            <line x1={500} y1={255} x2={346} y2={122} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" />
            <Cam x={500} y={262} color={C.green} />
            <text x={500} y={312} textAnchor="middle" fill={C.green} fontSize={22}>
              사진 2
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 820, top: 40, width: 930, display: 'grid', gap: 16 }}>
          <Label size={24} color={C.muted}>
            휴대폰 AR 앱: 바닥을 몇 초 비추고 의자를 올려 두면, 방을 한 바퀴 돌아도 그 자리에 있다
          </Label>
          {facts.map(([s, color, at], i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color, fontSize: 28, fontWeight: 700 }}>●</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          카메라만으로 <span style={{ color: C.accent }}>몇 m 움직였고 바닥이 어디인지</span> 어떻게 알까?
        </div>
      </Appear>
      <Card x={330} y={680} w={1260} h={190} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 12, opacity: prog(t, 5.8) }}>
          <Label size={22}>ORB-SLAM3 논문 Table II · stereo camera + IMU · 드론 dataset EuRoC</Label>
          <span style={mono(C.green, 38)}>평균 위치 오차 3.5 cm (RMS ATE 0.035 m)</span>
          <Label size={22} color={C.muted}>
            Apple ARKit 문서: 휴대폰의 위치 추적은 VIO 로 한다
          </Label>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. feature 와 짝짓기 ----------

// the 16 pixels on FAST's circle of radius 3, clockwise from the top
const RING: [number, number][] = [
  [0, -3], [1, -3], [2, -2], [3, -1], [3, 0], [3, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 2], [-3, 1], [-3, 0], [-3, -1], [-2, -2], [-1, -3],
]

function Orb() {
  const t = useSec()
  const cell = 58
  const ox = 147
  const oy = 100
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={700} h={730}>
        <svg width={700} height={730}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            FAST: 둘레 16 pixel 과 비교
          </text>
          <g opacity={prog(t, 0.5)}>
            {Array.from({ length: 49 }, (_, k) => {
              const i = k % 7
              const j = Math.floor(k / 7)
              return <rect key={k} x={ox + i * cell} y={oy + j * cell} width={cell - 4} height={cell - 4} rx={5} fill={C.grid} />
            })}
          </g>
          {RING.map(([dx, dy], k) => {
            const bright = k < 11
            const p = prog(t, 6.8 + k * 0.08)
            return (
              <rect
                key={k}
                x={ox + (dx + 3) * cell}
                y={oy + (dy + 3) * cell}
                width={cell - 4}
                height={cell - 4}
                rx={5}
                fill={bright ? C.orange : C.dim}
                opacity={0.25 + 0.75 * p}
              />
            )
          })}
          <rect x={ox + 3 * cell} y={oy + 3 * cell} width={cell - 4} height={cell - 4} rx={5} fill={C.green} opacity={prog(t, 6.6)} />
          <g opacity={prog(t, 8)}>
            <text x={30} y={540} fill={C.text} fontSize={22}>
              가운데 (초록) 보다 문턱 이상 밝은 pixel
            </text>
            <text x={30} y={572} fill={C.orange} fontSize={22} fontWeight={600}>
              11 개가 이어져서 corner 로 본다
            </text>
          </g>
          <g opacity={prog(t, 12.8)}>
            <text x={30} y={636} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ORB-SLAM3 EuRoC: 문턱 20 → 7
            </text>
            <text x={30} y={676} fill={C.muted} fontSize={21}>
              밝기 0 ~ 255 · corner 가 모자란 칸만 다시 찾는다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={796} y={140} w={1060} h={170} at={0.3} title={<Head color={C.accent}>① 다시 찾기 쉬운 점 = corner</Head>}>
        <span style={line(C.text, 23)}>
          흰 벽의 pixel 은 옆 pixel 과 똑같고, 직선 위의 점은 직선을 따라 옮기면 똑같다 → 두 방향으로 밝기가 바뀌는 corner 만 구별된다
        </span>
      </Box>
      <Box x={796} y={325} w={1060} h={245} at={6.5} title={<Head color={C.orange}>② FAST 로 corner 찾기</Head>}>
        <span style={line(C.text, 23)}>후보 pixel 둘레 원 위의 16 개 중 연속한 여러 개가 가운데보다 문턱 이상 밝거나, 모두 어두우면 corner</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 12.7) }}>
          ORB-SLAM3 의 EuRoC 설정: <span style={mono(C.accent, 24)}>문턱 20</span> 으로 먼저 찾고, 모자란 칸만 <span style={mono(C.accent, 24)}>문턱 7</span>
        </span>
      </Box>
      <Box x={796} y={585} w={1060} h={285} at={18.5} title={<Head color={C.green}>③ ORB descriptor 와 pyramid</Head>}>
        <span style={line(C.text, 23)}>
          BRIEF: 정해 둔 pixel 짝마다 앞이 더 밝으면 1, 아니면 0 → <span style={mono(C.green, 24)}>256 번 비교 = 256 bit (32 byte)</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.7) }}>
          1.2 배씩 줄인 사진 8 장 → <span style={mono(C.green, 24)}>1.2<sup>7</sup> ≈ 3.6 배</span> · 3 배 넘게 멀어진 점도 찾는다
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.5) }}>ORB-SLAM: 한 장에 corner 1000 개 · 칸마다 5 개 이상 찾아 한쪽에 몰리지 않게</span>
      </Box>
    </AbsoluteFill>
  )
}

const BITS1 = '1011001011100101'
const BITS_SAME = '1011011011000101'
const BITS_OTHER = '0000000110101000'

function BitRow({ label, bits, ref0, color, at, markAt }: { label: string; bits: string; ref0?: string; color: string; at: number; markAt?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, at) }}>
      <span style={{ width: 200, fontSize: 22, color }}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...bits].map((b, i) => {
          const diff = ref0 !== undefined && ref0[i] !== b
          const on = diff && markAt !== undefined ? prog(t, markAt) : 0
          return (
            <span
              key={i}
              style={{
                width: 34,
                height: 40,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 6,
                fontFamily: MONO,
                fontSize: 22,
                fontWeight: 600,
                background: on ? `${C.red}${Math.round(0x22 + on * 0x44).toString(16)}` : C.grid,
                border: `1.5px solid ${on > 0.5 ? C.red : C.cardEdge}`,
                color: C.text,
              }}
            >
              {b}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Matching() {
  const t = useSec()
  const x0 = 150
  const k = 6 // px per bit
  const group = (y: number, name: string, first: number, second: number, pass: boolean, at: number) => {
    const thr = 0.6 * second
    return (
      <g opacity={prog(t, at)}>
        <text x={30} y={y} fill={C.text} fontSize={23} fontWeight={600}>
          {name}
        </text>
        <text x={x0 - 14} y={y + 49} textAnchor="end" fill={C.muted} fontSize={20}>
          1등
        </text>
        <rect x={x0} y={y + 30} width={first * k * prog(t, at + 0.2, 0.8)} height={26} rx={5} fill={pass ? C.green : C.red} />
        <text x={x0 + first * k + 10} y={y + 50} fill={pass ? C.green : C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
          {first}
        </text>
        <text x={x0 - 14} y={y + 85} textAnchor="end" fill={C.muted} fontSize={20}>
          2등
        </text>
        <rect x={x0} y={y + 66} width={second * k * prog(t, at + 0.4, 0.8)} height={26} rx={5} fill={C.dim} />
        <text x={x0 + second * k + 10} y={y + 86} fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600}>
          {second}
        </text>
        <g opacity={prog(t, at + 1.2)}>
          <line x1={x0 + thr * k} y1={y + 22} x2={x0 + thr * k} y2={y + 100} stroke={C.orange} strokeWidth={3} strokeDasharray="6 5" />
          <text x={x0 + thr * k} y={y + 128} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
            0.6 × {second} = {thr}
          </text>
          <text x={600} y={y + 128} fill={pass ? C.green : C.red} fontSize={22} fontWeight={700}>
            {pass ? `${first} < ${thr} → 받는다` : `${first} > ${thr} → 버린다`}
          </text>
        </g>
      </g>
    )
  }
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={430}>
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'grid', gap: 12 }}>
          <Head size={25}>descriptor 비교 (256 bit 중 앞 16 bit)</Head>
          <BitRow label="사진 1 의 점" bits={BITS1} color={C.blue} at={0.4} />
          <BitRow label="사진 2 의 같은 점" bits={BITS_SAME} ref0={BITS1} color={C.green} at={1} markAt={3} />
          <span style={{ ...mono(C.green, 22), opacity: prog(t, 3.4) }}>XOR → 다른 bit 2 개 = Hamming distance 2</span>
          <BitRow label="사진 2 의 다른 점" bits={BITS_OTHER} ref0={BITS1} color={C.red} at={4.2} markAt={4.8} />
          <span style={{ ...mono(C.red, 22), opacity: prog(t, 5.2) }}>다른 bit 9 개 → 다른 점</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 7.2) }}>ORB-SLAM3 코드: 256 bit 중 50 bit 이하 (일부 검색 100 bit) 로 다를 때만 짝 후보</span>
        </div>
      </Panel>
      <Card x={996} y={140} w={860} h={430} at={10.5}>
        <svg width={860} height={430}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600}>
            ratio test (ratio 0.6)
          </text>
          {group(80, '점 A (책상 모서리)', 20, 60, true, 13.6)}
          {group(250, '점 B (반복되는 타일)', 40, 45, false, 16.5)}
          <text x={30} y={412} fill={C.dim} fontSize={20} opacity={prog(t, 18)}>
            Hamming distance (bit) · 1등이 2등의 0.6 배보다 작을 때만 짝으로 받는다
          </text>
        </svg>
      </Card>
      <Card x={64} y={600} w={1792} h={270} at={20.5}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Head color={C.purple}>RANSAC: ratio test 를 지나도 남는 틀린 짝 (outlier) 거르기</Head>
          <Flow steps={['짝 몇 개를 무작위로 뽑기', '두 사진 사이 움직임 계산', '그 움직임과 맞는 짝 세기', '가장 많은 경우를 고르기']} color={C.purple} at={21} last="→ outlier 제거" />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.5) }}>VINS-Mono 도 RANSAC 으로 거른다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.5) }}>ORB-SLAM 의 tracking: 직전 속도로 움직였다고 가정해 map point 가 찍힐 자리를 먼저 계산하고, 그 근처 feature 만 비교</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseRatio = () => (
  <PauseWrite
    question="어떤 점의 가장 가까운 후보가 30 bit, 두 번째 후보가 40 bit 다. ratio 0.6 이면 이 짝을 받을까?"
    answer={
      <>
        문턱 0.6 × 40 = 24 bit · 30 &gt; 24 → 받지 않는다
        <br />
        두 후보가 10 bit 밖에 차이 나지 않아 어느 쪽이 진짜 짝인지 확신할 수 없다
      </>
    }
  />
)

// ---------- 2. triangulation 과 BA ----------

function Triangulation() {
  const t = useSec()
  const sub = (cx: number, py: number, lo: number, hi: number, label: string, title: string, at: number, rangeAt: number) => (
    <g>
      <text x={cx} y={60} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        {title}
      </text>
      <g opacity={prog(t, at + 0.2)}>
        <line x1={cx - 80} y1={630} x2={cx} y2={py} stroke={C.blue} strokeWidth={2.5} />
        <line x1={cx + 80} y1={630} x2={cx} y2={py} stroke={C.blue} strokeWidth={2.5} />
        <Cam x={cx - 80} y={640} />
        <Cam x={cx + 80} y={640} />
        <line x1={cx - 80} y1={685} x2={cx + 80} y2={685} stroke={C.muted} strokeWidth={2} />
        <text x={cx} y={712} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
          0.1 m
        </text>
        <circle cx={cx} cy={py} r={9} fill={C.green} />
      </g>
      <g opacity={prog(t, rangeAt)}>
        <line x1={cx} y1={lo} x2={cx} y2={hi} stroke={C.orange} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
        <text x={cx + 22} y={lo + 8} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          {label}
        </text>
      </g>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={730}>
        <svg width={900} height={730}>
          <text x={870} y={30} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 (축척 다름)
          </text>
          {sub(220, 440, 420, 460, '1.92 ~ 2.08 m', '2 m 앞의 점', 0.4, 12.8)}
          {sub(640, 250, 150, 360, '8.33 ~ 12.5 m', '10 m 앞의 점', 0.8, 19.3)}
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={230} at={6.5} title={<Head color={C.accent}>옆으로 나란히 움직인 경우</Head>}>
        <span style={mono(C.accent, 30)}>Z = f × b ÷ d</span>
        <span style={line(C.text, 22)}>f: pixel 단위 focal length · b: 두 keyframe 사이에 카메라가 움직인 거리 · d: 같은 점이 밀려 찍힌 pixel 수 (disparity)</span>
      </Box>
      <Box x={996} y={390} w={860} h={230} at={12.5} title={<Head color={C.orange}>f = 500, b = 0.1 m 에서 1 pixel 이 틀리면</Head>}>
        <Table
          head={['실제 depth', 'd', 'd ± 1 일 때 depth', '오차 범위']}
          widths={[170, 80, 290, 250]}
          ats={[12.8, 19.2]}
          rows={[
            ['2 m', '25', '1.92 ~ 2.08 m', '약 ±4 %'],
            ['10 m', '5', '8.33 ~ 12.5 m', '−17 ~ +25 %'],
          ]}
          colors={[C.green, C.orange]}
        />
      </Box>
      <Box x={996} y={640} w={860} h={230} at={24.8} title={<Head color={C.green}>parallax 가 충분할 때만 점을 만든다</Head>}>
        <span style={line(C.text, 22)}>VINS-Mono: 30 개 넘는 feature 가 이어서 추적되고, 회전을 뺀 parallax 가 20 pixel 을 넘는 두 사진을 기다린다</span>
        <span style={line(C.muted, 22)}>제자리에서 돌기만 하면 b = 0 → parallax 가 없어 triangulation 을 할 수 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Ba() {
  const t = useSec()
  const cell = 60
  const gx = 110
  const gy = 90
  const px = (u: number) => gx + (u - 369) * cell + cell / 2
  const py = (v: number) => gy + (v - 213) * cell + cell / 2
  const kfs = [140, 420, 700]
  const pts: [number, number][] = [
    [230, 30],
    [380, 50],
    [520, 26],
    [650, 48],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={420}>
        <svg width={860} height={420}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            사진 속 한 관측을 확대 (한 칸 = 1 pixel)
          </text>
          <g opacity={prog(t, 0.5)}>
            {Array.from({ length: 20 }, (_, k) => (
              <rect key={k} x={gx + (k % 5) * cell} y={gy + Math.floor(k / 5) * cell} width={cell - 3} height={cell - 3} rx={4} fill={C.grid} />
            ))}
            {[369, 370, 371, 372, 373].map((u) => (
              <text key={u} x={px(u)} y={gy + 4 * cell + 28} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {u}
              </text>
            ))}
            {[213, 214, 215, 216].map((v) => (
              <text key={v} x={gx - 12} y={py(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}
              </text>
            ))}
          </g>
          <circle cx={px(370)} cy={py(215)} r={13} fill={C.green} opacity={prog(t, 0.9)} />
          <circle cx={px(372)} cy={py(214)} r={13} fill={C.orange} opacity={prog(t, 6.8)} />
          <line x1={px(370)} y1={py(215)} x2={px(372)} y2={py(214)} stroke={C.accent} strokeWidth={3} strokeDasharray="6 5" opacity={prog(t, 8)} />
          <g opacity={prog(t, 0.9)}>
            <circle cx={460} cy={140} r={9} fill={C.green} />
            <text x={480} y={148} fill={C.green} fontSize={22} fontFamily={MONO}>
              찍힌 pixel (370, 215)
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <circle cx={460} cy={192} r={9} fill={C.orange} />
            <text x={480} y={200} fill={C.orange} fontSize={22} fontFamily={MONO}>
              투영한 pixel (372, 214)
            </text>
          </g>
          <text x={450} y={262} fill={C.accent} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.5)}>
            √(2² + 1²) ≈ 2.24 pixel
          </text>
          <text x={450} y={296} fill={C.muted} fontSize={21} opacity={prog(t, 9.2)}>
            = reprojection error
          </text>
          <text x={30} y={400} fill={C.muted} fontSize={21} opacity={prog(t, 2)}>
            PnP: 투영한 자리가 짝지은 pixel 에 가장 가까워지는 pose 를 찾는다
          </text>
        </svg>
      </Panel>
      <Box x={956} y={140} w={900} h={420} at={13} title={<Head color={C.purple}>bundle adjustment (BA)</Head>}>
        <svg width={840} height={160}>
          {kfs.flatMap((x, i) =>
            pts.map(([qx, qy], j) => (Math.abs(i - j) <= 2 ? <line key={`${i}-${j}`} x1={x} y1={130} x2={qx} y2={qy} stroke={C.dim} strokeWidth={1.5} opacity={0.7} /> : null)),
          )}
          {kfs.map((x) => (
            <Cam key={x} x={x} y={138} color={C.purple} />
          ))}
          {pts.map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={9} fill={C.green} />
          ))}
        </svg>
        <span style={line(C.text, 22)}>여러 keyframe 의 pose (삼각형) 와 map point (초록 점) 를 한꺼번에 움직여, 모든 관측의 reprojection error 합을 가장 작게</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>local BA: 새 keyframe 과 map point 를 함께 보는 keyframe 만 움직인다</span>
      </Box>
      <Card x={64} y={580} w={1792} h={290} at={19.5}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Head>ORB-SLAM 계산 시간 (NewCollege 512 × 382 사진, 20 fps → 50 ms 마다 사진 · 중앙값)</Head>
          <Bar label="tracking (사진마다)" value={30.57} max={300} color={C.accent} at={20.2} width={900} unit=" ms" labelW={330} />
          <Bar label="local BA (keyframe 마다)" value={296.08} max={300} color={C.purple} at={22} width={900} unit=" ms" labelW={330} />
          <span style={{ ...line(C.text, 23), opacity: prog(t, 25.7) }}>
            <span style={mono(C.purple, 24)}>296 ÷ 50 ≈ 5.9</span> → 사진 여섯 장쯤 지나는 동안 계산 → 무거운 BA 는 keyframe 에만, 그동안 tracking 은 지난 지도로
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.5) }}>keyframe 조건: map point 를 50 개 이상 추적하면서, 기준 keyframe 이 본 점의 90 % 보다 적게 볼 때</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseDisparity = () => (
  <PauseWrite
    question="f = 500 인 카메라가 옆으로 0.2 m 움직이며 5 m 앞의 점을 봤다. disparity 는 몇 pixel 이고, 1 pixel 틀리면 depth 는 어디부터 어디까지 흔들릴까?"
    answer={
      <>
        d = 500 × 0.2 ÷ 5 = 20 pixel · f × b = 100
        <br />
        d = 21 → 100 ÷ 21 = 4.76 m · d = 19 → 100 ÷ 19 = 5.26 m → 4.76 ~ 5.26 m
      </>
    }
  />
)

// ---------- 3. scale 과 VIO ----------

function World({ x, title, move, pt, calc1, calc2, big, at }: { x: number; title: string; move: string; pt: string; calc1: string; calc2: string; big: boolean; at: number }) {
  const t = useSec()
  const c1 = 120
  const c2 = big ? 320 : 220
  const p = big ? { x: 200, y: 110 } : { x: 160, y: 250 }
  return (
    <Card x={x} y={140} w={880} h={430} at={at}>
      <svg width={880} height={430}>
        <text x={30} y={50} fill={big ? C.orange : C.blue} fontSize={26} fontWeight={600}>
          {title}
        </text>
        <text x={850} y={48} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
        <line x1={c1} y1={372} x2={p.x} y2={p.y} stroke={C.blue} strokeWidth={2} />
        <line x1={c2} y1={372} x2={p.x} y2={p.y} stroke={C.green} strokeWidth={2} />
        <circle cx={p.x} cy={p.y} r={9} fill={C.text} />
        <text x={p.x + 20} y={p.y - 6} fill={C.text} fontSize={22} fontFamily={MONO}>
          {pt}
        </text>
        <Cam x={c1} y={380} />
        <Cam x={c2} y={380} color={C.green} />
        <text x={(c1 + c2) / 2} y={418} textAnchor="middle" fill={C.muted} fontSize={21}>
          {move}
        </text>
        <g opacity={prog(t, 7)}>
          <text x={490} y={160} fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
            사진 1: u = 370
          </text>
          <text x={490} y={196} fill={C.dim} fontSize={20} fontFamily={MONO}>
            {calc1}
          </text>
          <text x={490} y={262} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600}>
            사진 2: u = 245
          </text>
          <text x={490} y={298} fill={C.dim} fontSize={20} fontFamily={MONO}>
            {calc2}
          </text>
        </g>
      </svg>
    </Card>
  )
}

function Scale() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <World x={64} title="작은 세계" move="이동 0.5 m" pt="(0.2, 0, 2) m" calc1="500 × 0.2 ÷ 2 + 320" calc2="500 × (0.2 − 0.5) ÷ 2 + 320" big={false} at={0.3} />
      <World x={976} title="2 배 큰 세계" move="이동 1.0 m" pt="(0.4, 0, 4) m" calc1="500 × 0.4 ÷ 4 + 320" calc2="500 × (0.4 − 1.0) ÷ 4 + 320" big at={1.5} />
      <Box x={64} y={600} w={1792} h={270} at={10} title={<Head color={C.accent}>두 사진이 pixel 하나까지 똑같다 → 사진만으로는 scale 을 알 수 없다 (f = 500, c_x = 320)</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 13.6) }}>
          monocular SLAM 은 길이 하나를 임의로 1 로 정한다 · ORB-SLAM3 (카메라만): <span style={mono(C.accent, 24)}>처음 지도의 depth 중앙값 = 1</span> · VINS-Mono 도 시작할 때 scale 을 임의로 정한다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.2) }}>
          scale drift: 오래 움직이면 지도의 단위가 조금씩 바뀐다 → ORB-SLAM 은 loop 를 닫을 때 <span style={mono(C.orange, 24)}>위치 3 + 회전 3 + scale 1 = 7 자유도</span> (Sim(3)) 로 고친다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Vio() {
  const t = useSec()
  const x0 = 160
  const pxMs = 14.5
  const X = (ms: number) => x0 + ms * pxMs
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={330} at={0.3} title={<Head color={C.accent}>IMU 가 scale 을 정한다</Head>}>
        <span style={line(C.text, 22)}>IMU = accelerometer (가속도 m/s²) + gyroscope (각속도 rad/s) · 처음부터 m 와 s 라는 실제 단위로 나온다</span>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 6.7) }}>½ × 1 × 1² = 0.5 m (1 m/s² 로 1 초)</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9.5) }}>
          같은 1 초에 monocular 지도로 2.0 단위 → <span style={mono(C.green, 23)}>1 단위 = 0.5 ÷ 2.0 = 0.25 m</span>
        </span>
      </Box>
      <Box x={976} y={140} w={880} h={330} at={13} title={<Head color={C.orange}>scale 오차 (ORB-SLAM3 논문)</Head>}>
        <Bar label="2 초 뒤" value={5} max={5} color={C.orange} at={13.4} width={460} unit=" %" labelW={140} />
        <Bar label="15 초 뒤" value={1} max={5} color={C.green} at={14.6} width={460} unit=" %" labelW={140} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.5) }}>가속이 없으면 지도를 2 배, 속도도 2 배로 잡아도 측정이 그대로 맞는다 → 움직여 가속을 주며 시작</span>
      </Box>
      <Card x={64} y={500} w={1792} h={370} at={19}>
        <svg width={1792} height={370}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            EuRoC: 카메라 20 Hz (50 ms 마다) · IMU 200 Hz (5 ms 마다)
          </text>
          <text x={x0 - 24} y={128} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
            카메라
          </text>
          {[0, 50, 100].map((ms) => (
            <rect key={ms} x={X(ms) - 16} y={98} width={32} height={42} rx={5} fill={`${C.blue}44`} stroke={C.blue} strokeWidth={2} opacity={prog(t, 19.3 + ms / 100)} />
          ))}
          <text x={x0 - 24} y={200} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
            IMU
          </text>
          {Array.from({ length: 21 }, (_, i) => (
            <line key={i} x1={X(i * 5)} y1={176} x2={X(i * 5)} y2={210} stroke={C.orange} strokeWidth={3} opacity={prog(t, 20 + i * 0.08)} />
          ))}
          <line x1={x0} y1={230} x2={X(100)} y2={230} stroke={C.cardEdge} strokeWidth={2} />
          {[0, 50, 100].map((ms) => (
            <text key={ms} x={X(ms)} y={258} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {ms} ms
            </text>
          ))}
          <g opacity={prog(t, 22.5)}>
            <path d={`M ${X(1)} 282 Q ${X(1)} 292 ${X(5)} 292 L ${X(45)} 292 Q ${X(49)} 292 ${X(49)} 282`} fill="none" stroke={C.accent} strokeWidth={2.5} />
            <text x={30} y={334} fill={C.accent} fontSize={22}>
              IMU 측정 10 개 → 상대 움직임 하나로 미리 적분 (preintegration)
            </text>
          </g>
          <g opacity={prog(t, 25.2)}>
            <text x={950} y={300} fill={C.text} fontSize={22}>
              map point 15 개 미만 → 5 초 동안 IMU 로 pose 를 잇는다
            </text>
            <text x={950} y={338} fill={C.green} fontSize={22} fontFamily={MONO}>
              bias 0.01 m/s²: ½ × 0.01 × 5² = 0.125 m
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

const PauseScale = () => (
  <PauseWrite
    question="멈춰 있던 카메라가 2 초 동안 0.5 m/s² 로 일정하게 가속했고, 같은 시간 동안 monocular SLAM 이 구한 이동 거리는 4 단위다. 지도의 1 단위는 몇 m 인가?"
    answer={
      <>
        IMU: ½ × 0.5 × 2² = 1 m
        <br />
        지도에서는 4 단위 → 1 단위 = 1 ÷ 4 = 0.25 m
      </>
    }
  />
)

// ---------- 4. ORB-SLAM3 와 실패 ----------

function Systems() {
  const t = useSec()
  const threads: [string, string, string, string, number][] = [
    ['tracking', '사진마다 · 약 30 ms', 'ORB 추출 → 짝짓기 → pose', C.accent, 0.5],
    ['local mapping', 'keyframe 마다 · 약 300 ms', 'triangulation · local BA', C.purple, 1.6],
    ['loop closing', '전에 온 곳인지 확인', 'DBoW2 → 쌓인 오차 보정', C.orange, 2.7],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={250}>
        <div style={{ position: 'absolute', left: 28, top: 18 }}>
          <Head size={24}>ORB-SLAM 의 thread 세 개 (동시에 실행)</Head>
        </div>
        {threads.map(([name, when, what, color, at], i) => (
          <div key={name} style={{ position: 'absolute', left: 26 + i * 590, top: 70, width: 530, height: 156, opacity: prog(t, at) }}>
            <div style={{ height: '100%', padding: '18px 24px', borderRadius: 18, border: `1.5px solid ${color}88`, background: `${color}12`, display: 'grid', alignContent: 'start', gap: 6 }}>
              <span style={mono(color, 28)}>{name}</span>
              <span style={line(C.text, 23)}>{when}</span>
              <span style={line(C.muted, 22)}>{what}</span>
            </div>
          </div>
        ))}
        <svg width={1792} height={250} style={{ position: 'absolute', left: 0, top: 0 }}>
          {arrow(562, 148, 610, 148, C.muted, 3, 11, prog(t, 1.6))}
          {arrow(1152, 148, 1200, 148, C.muted, 3, 11, prog(t, 2.7))}
        </svg>
      </Panel>
      <Card x={64} y={420} w={1792} h={450} at={6.8}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Table
            head={['항목', 'ORB-SLAM3 (2021)', 'VINS-Mono (2018)']}
            widths={[380, 620, 720]}
            ats={[7, 13.6, 20.5, 21.3]}
            rows={[
              ['feature 짝짓기', 'ORB descriptor 비교', 'Shi-Tomasi + KLT optical flow · 100 ~ 300 개'],
              ['monocular + IMU RMS ATE', '0.043 m', '0.110 m'],
              ['최적화', 'local BA (covisible keyframe)', '최근 keyframe 의 sliding window'],
              ['loop closure', 'DBoW2 · Atlas 로 지도 병합', 'DBoW2 + 4-DoF pose graph'],
            ]}
            colors={[undefined, C.green, undefined, undefined]}
          />
          <span style={{ ...line(C.text, 23), opacity: prog(t, 16) }}>
            EuRoC 평균 · <span style={mono(C.green, 24)}>0.110 ÷ 0.043 ≈ 2.6 배</span> · VINS-Mono 값은 ORB-SLAM3 저자들이 기본 설정으로 돌려 얻었다
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.5) }}>
            논문이 든 이유: ORB-SLAM3 는 오래전에 본 keyframe 의 map point 도 BA 에 다시 쓴다 · sliding window 는 최근 keyframe 만 최적화한다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Failure() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={230} at={0.3} title={<Head color={C.red}>① 흰 벽 · 무늬 없는 바닥</Head>}>
        <span style={line(C.text, 23)}>FAST 가 corner 를 거의 찾지 못해 짝 수가 줄어든다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 3) }}>
          ORB-SLAM3 (카메라만): <span style={mono(C.red, 24)}>inlier 30 개 미만</span> 이면 tracking 실패
        </span>
      </Box>
      <Box x={976} y={140} w={880} h={470} at={6.5} title={<Head color={C.orange}>② 빠른 회전 → motion blur</Head>}>
        <span style={line(C.text, 23)}>번진 길이 = f × 각속도 × 노출 시간</span>
        <span style={line(C.muted, 22)}>EuRoC f_x = 458.654 pixel (ORB-SLAM3 설정) · 노출 10 ms 로 가정</span>
        <Table
          head={['회전 속도', '번진 길이']}
          widths={[380, 260]}
          ats={[8.5, 9.5, 10.5]}
          rows={[
            ['30°/s (0.52 rad/s)', '약 2.4 pixel'],
            ['90°/s (1.57 rad/s)', '약 7.2 pixel'],
            ['180°/s (3.14 rad/s)', '약 14.4 pixel'],
          ]}
          colors={[C.text, C.orange, C.red]}
        />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 13.3) }}>FAST 의 16 pixel 원은 지름이 약 7 pixel → 그만큼 번지면 원 위의 밝기 차가 고르게 뭉개진다</span>
      </Box>
      <Box x={64} y={390} w={880} h={220} at={19} title={<Head color={C.purple}>③ 어두운 곳</Head>}>
        <span style={line(C.text, 23)}>
          밝기 차 40 인 corner 가 30 % 로 어두워지면 <span style={mono(C.purple, 24)}>40 × 0.3 = 12</span>
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 21.5) }}>문턱 20 에서는 빠지고, 다시 찾는 문턱 7 에서만 잡힌다</span>
      </Box>
      <Card x={64} y={630} w={1792} h={240} at={25}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14 }}>
          <Head size={25}>EuRoC V203 (논문이 가장 어렵다고 꼽은 sequence) · ORB-SLAM3 의 RMS ATE</Head>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span style={{ width: 240, fontSize: 24, textAlign: 'right', color: C.muted }}>monocular</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: C.red }}>✕ 끝까지 추적하지 못함</span>
            </div>
            <Bar label="monocular + IMU" value={0.027} max={0.6} color={C.green} at={27.5} width={380} unit=" m" labelW={240} />
            <Bar label="stereo" value={0.521} max={0.6} color={C.red} at={26} width={380} unit=" m" labelW={240} />
            <Bar label="stereo + IMU" value={0.024} max={0.6} color={C.green} at={28} width={380} unit=" m" labelW={240} />
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 29) }}>IMU 를 합친 두 구성은 2 ~ 3 cm · 카메라가 흰 벽만 보지 않게 방향을 정하고, 빠르게 도는 로봇이면 노출 시간을 짧게</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const PauseBlur = () => (
  <PauseWrite
    question="f = 500 pixel 인 카메라를 단 로봇이 60°/s 로 돌고, 노출 시간은 20 ms 다. 사진 가운데의 점은 몇 pixel 번질까?"
    answer={
      <>
        60° = 60 × π ÷ 180 ≈ 1.05 rad → 500 × 1.05 × 0.02 ≈ 10.5 pixel
        <br />
        FAST 원의 지름 (약 7 pixel) 보다 길어서 corner 를 찾기 어렵다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'feature 와 짝짓기', color: C.accent, text: 'FAST corner + 256 bit descriptor · Hamming 50 bit 이하 · ratio 0.6 · RANSAC', at: 1 },
    { tag: 'triangulation 과 BA', color: C.purple, text: '1 pixel 오차: 2 m 앞 약 ±4 % · 10 m 앞 −17 ~ +25 % · local BA 296.08 ms 는 keyframe 에만', at: 4.4 },
    { tag: 'scale 과 VIO', color: C.orange, text: '0.5 m · 2 m 와 1.0 m · 4 m 가 똑같이 찍힘 · IMU 로 2 초에 scale 오차 5 %', at: 8.4 },
    { tag: 'ORB-SLAM3 와 실패', color: C.red, text: '0.043 대 0.110 m · 90°/s blur 약 7.2 pixel · V203 stereo 0.521 → stereo + IMU 0.024 m', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            카메라만으로 몇 m 움직였고 바닥이 어디인지 어떻게 알까?
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Path Planning</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            듬성듬성한 map point 지도를 장애물 비용 지도 (costmap) 로 바꾸고, 그 위에서 경로 찾기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/visual-slam (ORB · ORB-SLAM · ORB-SLAM3 · VINS-Mono · Bundle Adjustment 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function VisualSlam() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        orb: Orb,
        matching: Matching,
        'pause-ratio': PauseRatio,
        triangulation: Triangulation,
        ba: Ba,
        'pause-disparity': PauseDisparity,
        scale: Scale,
        vio: Vio,
        'pause-scale': PauseScale,
        systems: Systems,
        failure: Failure,
        'pause-blur': PauseBlur,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
