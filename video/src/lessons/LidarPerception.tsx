import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './lidar-perception.narration.json'
import { script } from './lidar-perception.script'

// Numbers follow lessons/lidar-perception/README.md (see lidar-perception.script.ts). The scatter plots, the beam fan and the
// side views are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 12, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
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

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 400, unit = '', fmt, sub, labelW = 200 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
      {sub && <span style={{ fontSize: 21, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
  )
}

/** before → after on one track: the old value in grey under the new one */
function Gain({ label, before, after, max, color, at, width = 360, labelW = 160 }: { label: string; before: number; after: number; max: number; color: string; at: number; width?: number; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at + 0.5, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 22, textAlign: 'right', color: C.muted }}>{label}</span>
      <div style={{ position: 'relative', width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(100 * (before + (after - before) * p)) / max}%`, borderRadius: 8, background: color }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(100 * before) / max}%`, borderRadius: 8, background: C.dim }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
        {before.toFixed(1)} → {after.toFixed(1)}%
      </span>
    </div>
  )
}

const line = (color = C.text, size = 23): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.5, size = 22, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
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

/** a fixed pseudo-random number in [0, 1) for index i, so the scatter plots are the same in every frame */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            DRIVING · LIDAR PERCEPTION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>LiDAR Perception</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            point cloud <span style={{ color: C.accent }}>→ 3D box → track</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            땅을 지우고, 묶거나 격자로 펴서 상자를 씌우고, frame 사이로 잇는다
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

/** a top view of one scan: rings around the car, a car and a person, all points the same colour (900 × 340) */
function TopScatter({ t, at }: { t: number; at: number }) {
  const cx = 450
  const cy = 200
  const pts: [number, number][] = []
  ;[44, 74, 108, 146, 190, 240, 296, 360].forEach((r, k) => {
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * 2 * Math.PI + k * 0.13
      if (rnd(k * 100 + i) < 0.18) continue
      pts.push([cx + r * Math.cos(a), cy + 0.5 * r * Math.sin(a)])
    }
  })
  for (let i = 0; i < 26; i++) pts.push([640 + 70 * rnd(500 + i), 120 + 34 * rnd(600 + i)])
  for (let i = 0; i < 12; i++) pts.push([268 + 14 * rnd(700 + i), 250 + 26 * rnd(800 + i)])
  const shown = pts.filter(([x, y]) => x > 16 && x < 884 && y > 62 && y < 326)
  return (
    <svg width={900} height={340}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        위에서 본 scan 한 장
      </text>
      <text x={870} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, at)}>
        모식도
      </text>
      {shown.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={C.blue} opacity={0.75 * prog(t, at + 0.2 + (i % 20) * 0.04)} />
      ))}
      <g opacity={prog(t, at + 0.4)}>
        <rect x={cx - 22} y={cy - 11} width={44} height={22} rx={6} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={4} fill={C.accent} />
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={900} h={340} at={0.3}>
        <TopScatter t={t} at={0.4} />
      </Card>
      <Box x={980} y={130} w={880} h={340} at={0.6} gap={16} title={<Head>점 하나에 담긴 것</Head>}>
        <span style={{ ...mono(C.blue, 30), opacity: prog(t, 0.9) }}>(x, y, z, intensity)</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 1.4) }}>레이저가 맞고 돌아온 곳의 좌표와 반사 세기뿐</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 2.0) }}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 이 점이 차인지 사람인지
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 2.6) }}>
          <span style={{ color: C.red, fontWeight: 700 }}>✕</span> 그 물체가 어느 쪽으로 움직이는지
        </span>
      </Box>
      <Appear at={4.4} style={{ position: 'absolute', left: 60, top: 500, width: 1800 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          이 점 더미에서 보행자를 찾아 상자를 씌우고, <span style={{ color: C.accent }}>걷는 방향까지 알아내려면?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 60, top: 700, width: 1800, display: 'flex', justifyContent: 'center' }}>
        <Flow at={5.4} gap={0.35} color={C.accent} steps={['point cloud', '땅 점 지우기', '묶기 또는 학습한 detector', '3D box', 'tracking', '물체 목록 (속도 · ID)']} />
      </div>
    </AbsoluteFill>
  )
}

// ---------- point cloud and density ----------

/** VLP-16 seen from the side: 16 beams from −15° to +15°, 2° apart (860 × 460) */
function BeamFan({ t, at }: { t: number; at: number }) {
  const sx = 110
  const sy = 250
  const end = 740
  const beams = Array.from({ length: 16 }, (_, k) => -15 + 2 * k)
  return (
    <svg width={860} height={460}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        옆에서 본 VLP-16 · beam 16 개
      </text>
      <text x={830} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, at)}>
        모식도
      </text>
      {beams.map((a, i) => {
        const y2 = sy - Math.tan((a * Math.PI) / 180) * (end - sx)
        const p = prog(t, at + 0.3 + i * 0.05, 0.5)
        return (
          <g key={a} opacity={p}>
            <line x1={sx + 25} y1={sy} x2={sx + 25 + (end - sx - 25) * p} y2={sy + (y2 - sy) * p} stroke={a === 15 || a === -15 ? C.accent : C.blue} strokeWidth={2} opacity={0.7} />
            <circle cx={end} cy={y2} r={4.5} fill={C.blue} opacity={p} />
          </g>
        )
      })}
      <g opacity={prog(t, at + 1.4)}>
        <text x={752} y={sy - Math.tan((15 * Math.PI) / 180) * (end - sx) + 7} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          +15°
        </text>
        <text x={752} y={sy + Math.tan((15 * Math.PI) / 180) * (end - sx) + 7} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
          −15°
        </text>
        <text x={752} y={sy + 7} fill={C.blue} fontSize={22} fontWeight={600}>
          2° 간격
        </text>
      </g>
      <g opacity={prog(t, at)}>
        <rect x={sx - 25} y={sy - 25} width={50} height={50} rx={10} fill={C.card} stroke={C.accent} strokeWidth={3} />
        <circle cx={sx} cy={sy} r={8} fill={C.accent} />
        <text x={40} y={335} fill={C.muted} fontSize={22}>
          5 ~ 20 Hz 로 회전
        </text>
      </g>
    </svg>
  )
}

function Sensor() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={860} h={460} at={6.5}>
        <BeamFan t={t} at={6.7} />
      </Card>
      <Box x={60} y={610} w={860} h={260} at={19.5} color={`${C.green}88`} title={<Head color={C.green}>④ perception 의 출력 · 3D bounding box 목록</Head>}>
        <span style={{ ...mono(C.green, 28), opacity: prog(t, 19.9) }}>(x, y, z, l, w, h, yaw) + class</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.8) }}>중심 위치 3 개 · 크기 3 개 · 방향 1 개 = 숫자 7 개, class 는 차 · 사람 · 자전거</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.2) }}>tracking 을 거치면 속도와 물체 번호 (ID) 가 붙는다</span>
      </Box>
      <Box x={950} y={130} w={910} h={220} at={0.3} color={`${C.accent}88`} title={<Head color={C.accent}>① 거리 = 왕복 시간 × 빛의 속도 ÷ 2</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 0.8) }}>레이저 펄스가 반사되어 돌아오기까지 걸린 시간으로 거리를 잰다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.5) }}>
          100 m 앞 벽: <span style={mono(C.accent, 24)}>2 × 100 ÷ (3 × 10⁸ m/s) ≈ 667 ns</span>
        </span>
      </Box>
      <Box x={950} y={370} w={910} h={240} at={6.5} color={`${C.blue}88`} title={<Head color={C.blue}>② Velodyne VLP-16 데이터시트</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 6.9) }}>
          beam <span style={mono(C.blue)}>16</span> 개 · 위아래 <span style={mono(C.blue)}>−15° ~ +15°</span> · <span style={mono(C.blue)}>2°</span> 간격
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 9.2) }}>
          <span style={mono(C.blue)}>5 ~ 20 Hz</span> 로 돌며 1초에 약 <span style={mono(C.blue)}>30만</span> 개의 점 (single return)
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>beam 하나가 한 바퀴 돌며 그린 점의 고리 = ring · 한 바퀴 = scan</span>
      </Box>
      <Box x={950} y={630} w={910} h={240} at={13} color={`${C.orange}88`} title={<Head color={C.orange}>③ 점 하나 = 16 byte</Head>}>
        <div style={{ display: 'flex', gap: 12 }}>
          {['x', 'y', 'z', 'intensity'].map((f, i) => (
            <div key={f} style={{ width: 190, padding: '6px 0', borderRadius: 12, border: `1.5px solid ${C.orange}77`, background: `${C.orange}14`, display: 'grid', justifyItems: 'center', opacity: prog(t, 13.4 + i * 0.4) }}>
              <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.orange }}>{f}</span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: C.muted }}>4 byte</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.6) }}>
          4 byte 실수 4 개 → <span style={mono(C.orange)}>4 × 4 = 16 byte</span> · 어느 점이 차인지는 없다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

/** side view of VLP-16 beams hitting a 1.7 m person at 10, 30 and 50 m (1100 × 480, vertical exaggerated) */
function RingSide({ t }: { t: number }) {
  const x0 = 80
  const H = 17.6 // px per m along the road
  const V = 110 // px per m in height
  const G = 400
  const sh = 0.8
  const X = (d: number) => x0 + d * H
  const Y = (h: number) => G - h * V
  const beams = [-5, -3, -1, 1, 3, 5, 7]
  const people: [number, number, string, string][] = [
    [10, 7.2, '0.35 m', '5'],
    [30, 9.2, '1.05 m', '2'],
    [50, 11.2, '1.75 m', '1'],
  ]
  const far = 62
  return (
    <svg width={1100} height={480}>
      <defs>
        <clipPath id="lp-ring-clip">
          <rect x={0} y={60} width={1100} height={G - 60} />
        </clipPath>
      </defs>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        2° 간격 beam 과 키 1.7 m 사람 (센서 높이 0.8 m)
      </text>
      <text x={1070} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
        모식도 · 세로 과장
      </text>
      <line x1={20} x2={1080} y1={G} y2={G} stroke={C.muted} strokeWidth={2} opacity={prog(t, 0.3)} />
      <g clipPath="url(#lp-ring-clip)">
        {beams.map((a, i) => {
          const p = prog(t, 0.6 + i * 0.08, 0.8)
          const hEnd = sh + far * Math.tan((a * Math.PI) / 180)
          return <line key={a} x1={X(0)} y1={Y(sh)} x2={X(0) + (X(far) - X(0)) * p} y2={Y(sh) + (Y(hEnd) - Y(sh)) * p} stroke={C.blue} strokeWidth={1.8} opacity={0.55} />
        })}
      </g>
      <g opacity={prog(t, 0.3)}>
        <rect x={X(0) - 14} y={Y(sh) - 14} width={28} height={28} rx={6} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
        <line x1={X(0)} x2={X(0)} y1={Y(sh) + 14} y2={G} stroke={C.accent} strokeWidth={2} />
      </g>
      {people.map(([d, at, gapText, rings]) => {
        const hits = beams.map((a) => sh + d * Math.tan((a * Math.PI) / 180)).filter((h) => h >= 0 && h <= 1.7)
        return (
          <g key={d}>
            <rect x={X(d) - 11} y={Y(1.7)} width={22} height={1.7 * V} rx={10} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} opacity={prog(t, 0.8)} />
            {hits.map((h, k) => (
              <circle key={k} cx={X(d)} cy={Y(h)} r={6.5} fill={C.green} opacity={prog(t, at + k * 0.15)} />
            ))}
            <g opacity={prog(t, at)}>
              <text x={X(d)} y={G + 30} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                {`${d} m · ring ${rings} 개`}
              </text>
              <text x={X(d)} y={G + 60} textAnchor="middle" fill={C.blue} fontSize={21} fontFamily={MONO} fontWeight={600}>
                {`간격 ${gapText}`}
              </text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}

function Density() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1100} h={480} at={0.3}>
        <RingSide t={t} />
      </Card>
      <Box x={1190} y={130} w={670} h={300} at={0.3} title={<Head color={C.blue}>ring 사이 세로 간격 ∝ 거리</Head>}>
        <Table
          at={0.8}
          step={0.5}
          head={['거리', 'ring 간격', '사람에 닿는 ring']}
          widths={[130, 200, 270]}
          rows={[
            ['10 m', '0.35 m', '5'],
            ['30 m', '1.05 m', '2'],
            ['50 m', '1.75 m', '1'],
          ]}
        />
      </Box>
      <Box x={1190} y={450} w={670} h={270} at={13.5} color={`${C.green}88`} title={<Head color={C.green}>사람 한 명 (폭 0.5 m) 의 점</Head>}>
        {(
          [
            ['10 m', '0.5 ÷ 0.035 ≈ 14', '× 5 ≈ 70', 13.8],
            ['30 m', '0.5 ÷ 0.105 ≈ 5', '× 2 ≈ 10', 14.6],
            ['50 m', '0.5 ÷ 0.175 ≈ 3', '× 1 ≈ 3', 15.4],
          ] as [string, string, string, number][]
        ).map(([d, per, total, at]) => (
          <div key={d} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
            <span style={{ width: 80, fontSize: 23, color: C.muted }}>{d}</span>
            <span style={{ width: 290, ...mono(C.text, 23) }}>{per}</span>
            <span style={mono(C.green, 23)}>{total}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 16.2) }}>ring 하나의 점 × 닿는 ring 수 (10 Hz)</span>
      </Box>
      <Box x={1190} y={735} w={670} h={135} at={17} gap={4}>
        <span style={line(C.text, 22)}>nuScenes 의 32-beam LiDAR 도 정답 상자 하나의 점이</span>
        <span style={line(C.text, 22)}>
          3 m 에서 최대 <span style={mono(C.orange, 22)}>1만 2천</span> 개 · 80 m 에서 많아야 <span style={mono(C.orange, 22)}>100</span> 개
        </span>
      </Box>
      <Box x={60} y={630} w={1100} h={240} at={20.5} color={`${C.pink}88`} title={<Head color={C.pink}>한 바퀴 도는 동안 차도 움직인다</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 20.9) }}>
          10 Hz → 첫 점과 마지막 점 사이 <span style={mono(C.pink)}>0.1 초</span> · 15 m/s 로 달리면 <span style={mono(C.pink)}>15 × 0.1 = 1.5 m</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23) }}>그대로 쓰면 벽이 휘어 보여서, 점마다 찍은 시각의 차량 위치로 점을 옮긴다 (Autoware distortion_corrector)</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseScan = () => (
  <PauseWrite
    question="10 Hz 로 도는 VLP-16 은 1초에 약 30만 개의 점을 내고, 점 하나는 16 byte 다. scan 하나에는 점이 몇 개이고, 1초에 몇 MB 를 보내는가?"
    answer={
      <>
        scan 하나: 300,000 ÷ 10 = 30,000 개
        <br />
        1초: 300,000 × 16 byte = 4.8 MB
      </>
    }
  />
)

// ---------- rule-based boxes ----------

/** 52 points in 13 voxels, replaced by their means (860 × 330) */
function VoxelGrid({ t, at, merge }: { t: number; at: number; merge: number }) {
  const cell = 80
  const ox = 40
  const oy = 64
  const cells: [number, number, number][] = [
    [0, 1, 8],
    [0, 2, 7],
    [1, 1, 6],
    [1, 2, 5],
    [0, 0, 4],
    [2, 2, 4],
    [1, 0, 4],
    [2, 1, 3],
    [3, 2, 3],
    [3, 1, 3],
    [4, 2, 2],
    [4, 0, 2],
    [5, 1, 1],
  ]
  const m = prog(t, merge, 1)
  let n = 0
  return (
    <svg width={860} height={330}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        voxel downsampling
      </text>
      <g opacity={prog(t, at)}>
        {Array.from({ length: 6 * 3 }, (_, k) => (
          <rect key={k} x={ox + (k % 6) * cell} y={oy + Math.floor(k / 6) * cell} width={cell} height={cell} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
        ))}
      </g>
      {cells.map(([cx, cy, count], ci) => {
        const pts = Array.from({ length: count }, () => {
          n += 1
          return [ox + cx * cell + 10 + 60 * rnd(n * 3), oy + cy * cell + 10 + 60 * rnd(n * 3 + 1)] as [number, number]
        })
        const mx = pts.reduce((a, p) => a + p[0], 0) / count
        const my = pts.reduce((a, p) => a + p[1], 0) / count
        return (
          <g key={ci}>
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x + (mx - x) * m} cy={y + (my - y) * m} r={4} fill={C.blue} opacity={prog(t, at + 0.2 + ci * 0.05) * (1 - 0.85 * m)} />
            ))}
            <circle cx={mx} cy={my} r={8} fill={C.green} opacity={m} />
          </g>
        )
      })}
      <g opacity={prog(t, at + 0.4)}>
        <text x={560} y={120} fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600}>
          점 52 개
        </text>
        <text x={560} y={165} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={m}>
          → 13 개
        </text>
        <text x={560} y={215} fill={C.muted} fontSize={22} opacity={m}>
          칸마다 평균 위치 하나
        </text>
        <text x={560} y={255} fill={C.muted} fontSize={22} opacity={m}>
          leaf size = 칸 한 변
        </text>
      </g>
    </svg>
  )
}

// RANSAC side view: 33 ground points and 14 car points; candidate 1 passes one ground point and leans into the car
const RG = 600
const RBAND = 9
const ground: [number, number][] = Array.from({ length: 33 }, (_, i) => {
  const x = 40 + i * 25
  const j = x === 265 || x === 290 || x === 315 ? 0 : [3, -2, 1, -3, 2, -1][i % 6]
  return [x, RG + j]
})
const carPts: [number, number][] = [
  [560, RG - 40],
  [560, RG - 60],
  [560, RG - 81],
  [560, RG - 100],
  [560, RG - 120],
  [590, RG - 140],
  [630, RG - 140],
  [670, RG - 140],
  [710, RG - 140],
  [610, RG - 96],
  [660, RG - 111],
  [760, RG - 40],
  [760, RG - 80],
  [760, RG - 120],
]
const c1 = (x: number) => RG - 0.3 * (x - 290)
const nearC1 = ([x, y]: [number, number]) => Math.abs(y - c1(x)) / Math.sqrt(1 + 0.09) <= RBAND
const nearC2 = ([, y]: [number, number]) => Math.abs(y - RG) <= RBAND

function RansacSide({ t }: { t: number }) {
  const p1 = prog(t, 14)
  const p2 = prog(t, 16)
  return (
    <svg width={910} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
      <text x={870} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 7.2)}>
        모식도 · 옆에서 봄
      </text>
      <g opacity={prog(t, 7.6)}>
        <rect x={545} y={RG - 145} width={230} height={140} rx={18} fill="none" stroke={C.cardEdge} strokeWidth={2} strokeDasharray="6 6" />
        {ground.map(([x, y], i) => (
          <circle key={`g${i}`} cx={x} cy={y} r={5} fill={p2 > 0 ? C.green : C.muted} opacity={p2 > 0 && !nearC2([x, y]) ? 0.4 : 1} />
        ))}
        {carPts.map(([x, y], i) => (
          <circle key={`c${i}`} cx={x} cy={y} r={5} fill={C.orange} opacity={p2 > 0 ? 0.5 : 1} />
        ))}
      </g>
      <g opacity={p1 * (1 - 0.6 * p2)}>
        <line x1={230} y1={c1(230)} x2={870} y2={c1(870)} stroke={C.red} strokeWidth={3} />
        {[...ground, ...carPts].filter(nearC1).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill="none" stroke={C.red} strokeWidth={2.5} />
        ))}
      </g>
      <g opacity={p2}>
        <rect x={30} y={RG - RBAND} width={850} height={2 * RBAND} fill={`${C.green}22`} />
        <line x1={30} y1={RG} x2={880} y2={RG} stroke={C.green} strokeWidth={3} />
      </g>
    </svg>
  )
}

function SlopeSide({ t, at }: { t: number; at: number }) {
  const P = 300
  const H = 19.5
  const V = 50
  const X = (d: number) => 40 + d * H
  const road = (d: number) => P - (d <= 10 ? 0 : 0.1 * (d - 10) * V)
  return (
    <svg width={860} height={390}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        땅 전체가 평면 하나라는 가정
      </text>
      <text x={830} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, at)}>
        모식도 · 세로 과장
      </text>
      <g opacity={prog(t, at + 0.2)}>
        <line x1={X(0)} y1={P} x2={X(40)} y2={P} stroke={C.green} strokeWidth={2.5} strokeDasharray="10 8" />
        <polyline points={[0, 10, 40].map((d) => `${X(d)},${road(d)}`).join(' ')} fill="none" stroke={C.text} strokeWidth={4} />
        <text x={X(10)} y={P + 34} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
          10 m
        </text>
        <text x={X(30)} y={P + 34} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
          30 m
        </text>
        <text x={X(0)} y={P + 34} fill={C.green} fontSize={21}>
          RANSAC 평면
        </text>
        <text x={X(17)} y={P - 120} fill={C.text} fontSize={21}>
          10% 오르막
        </text>
      </g>
      <g opacity={prog(t, at + 1.2)}>
        {arrow(X(30), P - 4, X(30), road(30) + 4, C.red, 3)}
        <text x={X(30) + 14} y={P - 52} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
          20 × 0.1 = 2 m
        </text>
        <text x={X(30) + 14} y={P - 22} fill={C.red} fontSize={21}>
          → 벽 같은 물체로 분류
        </text>
      </g>
      <text x={30} y={372} fill={C.muted} fontSize={21} opacity={prog(t, at + 2.4)}>
        Autoware 의 scan_ground_filter 는 기울기로 땅을 가린다 (10° · 13°)
      </text>
    </svg>
  )
}

function Ransac() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={860} h={330} at={0.3}>
        <VoxelGrid t={t} at={0.4} merge={3.4} />
      </Card>
      <Card x={60} y={480} w={860} h={390} at={20.8}>
        <SlopeSide t={t} at={21} />
      </Card>
      <Card x={950} y={130} w={910} h={740} at={7}>
        <RansacSide t={t} />
        <div style={{ position: 'absolute', left: 24, top: 22, width: 862, display: 'grid', gap: 14 }}>
          <Head color={C.accent}>RANSAC ground removal · 무작위로 여러 번 되풀이</Head>
          <Flow at={7.5} gap={0.6} color={C.accent} steps={['점 3 개 → 평면', '0.1 m 안 inlier 세기', '최다 inlier = 땅']} />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 640, display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.red, 23), opacity: prog(t, 14.3) }}>━ 첫 후보: 차 점이 섞임 → inlier 6 개</span>
          <span style={{ ...line(C.green, 23), opacity: prog(t, 16.3) }}>━ 둘째 후보: 땅 점만 → inlier 33 개 → 땅으로 고름</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

/** two people 0.5 m apart, clustered with tolerance 0.7 m and 0.3 m (860 × 360) */
function TwoPeople({ t }: { t: number }) {
  const blob = (cx: number, cy: number, seed: number) =>
    Array.from({ length: 11 }, (_, i) => {
      const a = rnd(seed + i) * 2 * Math.PI
      const r = 16 * Math.sqrt(rnd(seed + 50 + i))
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
    })
  const scen: [number, string, boolean, string][] = [
    [215, 'tolerance 0.7 m', true, '상자 1 개 · 두 사람이 한 무리'],
    [645, 'tolerance 0.3 m', false, '상자 2 개'],
  ]
  return (
    <svg width={860} height={360}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        Euclidean clustering · 0.5 m 떨어져 걷는 두 사람 (위에서 봄)
      </text>
      <line x1={430} x2={430} y1={70} y2={340} stroke={C.cardEdge} strokeWidth={1.5} opacity={prog(t, 0.3)} />
      {scen.map(([cx, head, one, result], k) => {
        const at = 0.8 + k * 1.6
        const col = one ? C.orange : C.green
        return (
          <g key={head} opacity={prog(t, at)}>
            <text x={cx} y={100} textAnchor="middle" fill={col} fontSize={23} fontFamily={MONO} fontWeight={600}>
              {head}
            </text>
            {[...blob(cx - 48, 200, 10 + k * 100), ...blob(cx + 48, 200, 40 + k * 100)].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={4} fill={C.blue} />
            ))}
            <g opacity={prog(t, at + 0.6)}>
              {one ? (
                <rect x={cx - 74} y={172} width={148} height={56} rx={6} fill="none" stroke={col} strokeWidth={3} />
              ) : (
                <>
                  <rect x={cx - 74} y={172} width={52} height={56} rx={6} fill="none" stroke={col} strokeWidth={3} />
                  <rect x={cx + 22} y={172} width={52} height={56} rx={6} fill="none" stroke={col} strokeWidth={3} />
                </>
              )}
            </g>
            <line x1={cx - 30} x2={cx + 30} y1={250} y2={250} stroke={C.muted} strokeWidth={2} />
            <text x={cx} y={280} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
              0.5 m
            </text>
            <text x={cx} y={325} textAnchor="middle" fill={col} fontSize={23} fontWeight={600} opacity={prog(t, at + 0.6)}>
              {result}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** a car at 30 m: two rings 1.05 m apart on its side (860 × 360) */
function CarRings({ t, at }: { t: number; at: number }) {
  const rows = [150, 255]
  return (
    <>
      <svg width={860} height={360} style={{ position: 'absolute', left: 0, top: 0 }}>
        <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
          30 m 앞 차 한 대 (옆에서 봄)
        </text>
        <g opacity={prog(t, at + 0.2)}>
          <rect x={140} y={110} width={360} height={190} rx={22} fill="none" stroke={C.cardEdge} strokeWidth={2} strokeDasharray="6 6" />
          <line x1={20} x2={520} y1={320} y2={320} stroke={C.muted} strokeWidth={2} />
          {rows.map((y, r) =>
            Array.from({ length: 16 }, (_, i) => <circle key={`${r}-${i}`} cx={160 + i * 21.5} cy={y} r={5} fill={r === 0 ? C.blue : C.purple} />),
          )}
          <line x1={115} x2={115} y1={rows[0]} y2={rows[1]} stroke={C.orange} strokeWidth={2.5} />
          <line x1={106} x2={124} y1={rows[0]} y2={rows[0]} stroke={C.orange} strokeWidth={2.5} />
          <line x1={106} x2={124} y1={rows[1]} y2={rows[1]} stroke={C.orange} strokeWidth={2.5} />
          <text x={100} y={209} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
            1.05 m
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 540, top: 78, width: 300, display: 'grid', gap: 16 }}>
        <span style={{ ...line(C.red, 22), opacity: prog(t, at + 1.4) }}>3D 거리로 묶으면 ring 사이 1.05 m &gt; 0.7 m 라서 무리 2 개로 쪼개짐</span>
        <span style={{ ...line(C.green, 22), opacity: prog(t, at + 3) }}>
          높이를 빼고 x·y 거리로 묶으면 한 무리 <span style={mono(C.green, 20)}>use_height: false</span>
        </span>
      </div>
    </>
  )
}

/** a 4.5 × 1.8 m car turned 30°: the x·y min–max box against the L-shape box (910 × 500) */
function RotatedCar({ t, at }: { t: number; at: number }) {
  const s = 55
  const cx = 270
  const cy = 280
  const a = (30 * Math.PI) / 180
  const L = 4.5 * s
  const Wd = 1.8 * s
  const P = (lx: number, ly: number): [number, number] => [cx + lx * Math.cos(a) + ly * Math.sin(a), cy - lx * Math.sin(a) + ly * Math.cos(a)]
  const corners = [P(-L / 2, -Wd / 2), P(L / 2, -Wd / 2), P(L / 2, Wd / 2), P(-L / 2, Wd / 2)]
  const side = Array.from({ length: 11 }, (_, i) => P(-L / 2 + (i * L) / 10, Wd / 2))
  const back = Array.from({ length: 5 }, (_, i) => P(-L / 2, -Wd / 2 + (i * Wd) / 4))
  const hw = (L / 2) * Math.cos(a) + (Wd / 2) * Math.sin(a)
  const hh = (L / 2) * Math.sin(a) + (Wd / 2) * Math.cos(a)
  return (
    <>
      <svg width={910} height={500} style={{ position: 'absolute', left: 0, top: 0 }}>
        <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
          30° 돌아간 4.5 × 1.8 m 차 (위에서 봄)
        </text>
        <g opacity={prog(t, at + 0.2)}>
          <polygon points={corners.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.cardEdge} strokeWidth={2} strokeDasharray="5 6" />
          {[...side, ...back].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill={C.blue} />
          ))}
          <rect x={40} y={450} width={36} height={22} rx={5} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
          <text x={88} y={468} fill={C.accent} fontSize={21}>
            센서 쪽
          </text>
        </g>
        <rect x={cx - hw} y={cy - hh} width={2 * hw} height={2 * hh} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="10 7" opacity={prog(t, at + 1)} />
        <polygon points={corners.map((p) => p.join(',')).join(' ')} fill={`${C.green}18`} stroke={C.green} strokeWidth={3.5} opacity={prog(t, at + 2.6)} />
      </svg>
      <div style={{ position: 'absolute', left: 560, top: 100, width: 320, display: 'grid', gap: 22 }}>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, at + 0.4) }}>LiDAR 는 센서 쪽 두 면만 봐서 점이 L 자로 찍힌다</span>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, at + 1) }}>
          <span style={line(C.red, 22)}>x·y 최솟값 · 최댓값 상자</span>
          <span style={mono(C.red, 22)}>4.8 × 3.8 m</span>
          <span style={line(C.red, 21)}>
            넓이 <span style={mono(C.red, 21)}>8.1 → 18.3 m²</span>
          </span>
        </div>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, at + 2.6) }}>
          <span style={line(C.green, 22)}>L-shape fitting</span>
          <span style={mono(C.green, 22)}>4.5 × 1.8 m</span>
          <span style={line(C.muted, 21)}>상자 방향을 여러 개 시험해 L 에 가장 잘 맞는 직사각형</span>
        </div>
      </div>
    </>
  )
}

function Cluster() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={860} h={360} at={0.3}>
        <TwoPeople t={t} />
      </Card>
      <Card x={60} y={510} w={860} h={360} at={7}>
        <CarRings t={t} at={7.2} />
      </Card>
      <Box x={950} y={130} w={910} h={220} at={14} color={`${C.orange}88`} title={<Head color={C.orange}>Autoware euclidean_cluster 기본값</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14.4) }}>
          tolerance <span style={mono(C.orange)}>0.7 m</span> · 무리 하나의 점 수 <span style={mono(C.orange)}>10 ~ 1000</span> 개
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 16) }}>
          사람의 점: 30 m 약 <span style={mono(C.text)}>10</span> 개 · 50 m 약 <span style={mono(C.red)}>3</span> 개 → <span style={{ color: C.red }}>50 m 의 사람은 버려짐</span>
        </span>
      </Box>
      <Card x={950} y={370} w={910} h={500} at={20.5}>
        <RotatedCar t={t} at={20.7} />
      </Card>
    </AbsoluteFill>
  )
}

const PauseRansac = () => (
  <PauseWrite
    question="땅 점이 절반 (w = 0.5) 이면 k = log(1 − p) ÷ log(1 − w³) 로 99% 확률에 몇 번 반복할까?"
    answer={
      <>
        3 개가 모두 땅일 확률 0.5³ = 0.125
        <br />
        k = log 0.01 ÷ log 0.875 ≈ (−4.61) ÷ (−0.134) ≈ 34.5 → 35 번
      </>
    }
  />
)

// ---------- PointPillars and metrics ----------

function ImageVsCloud({ t, at }: { t: number; at: number }) {
  return (
    <svg width={560} height={260}>
      <g opacity={prog(t, at)}>
        {Array.from({ length: 48 }, (_, k) => (
          <rect key={k} x={30 + (k % 8) * 25} y={70 + Math.floor(k / 8) * 25} width={23} height={23} fill={C.blue} opacity={0.25 + 0.6 * rnd(k + 900)} />
        ))}
        <text x={130} y={245} textAnchor="middle" fill={C.muted} fontSize={21}>
          사진 · 모든 칸에 값
        </text>
      </g>
      <g opacity={prog(t, at + 0.5)}>
        <rect x={300} y={70} width={230} height={150} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
        {Array.from({ length: 22 }, (_, k) => (
          <circle key={k} cx={310 + 210 * rnd(k + 300)} cy={80 + 130 * Math.pow(rnd(k + 400), 2)} r={3.5} fill={C.orange} />
        ))}
        <text x={415} y={245} textAnchor="middle" fill={C.muted} fontSize={21}>
          point cloud · 대부분 빈 공간
        </text>
      </g>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        CNN 에 바로 넣을 수 없다
      </text>
    </svg>
  )
}

function BevGrid({ t, at }: { t: number; at: number }) {
  const cols = 30
  const rows = 13
  const c = 20
  const lit = Array.from({ length: cols * rows }, (_, k) => k).filter((k) => rnd(k + 1200) < 0.04)
  return (
    <svg width={640} height={360}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, at)}>
        위에서 본 격자 (BEV) · 칸 위의 기둥 = pillar
      </text>
      <g opacity={prog(t, at + 0.2)}>
        {Array.from({ length: cols * rows }, (_, k) => (
          <rect key={k} x={30 + (k % cols) * c} y={70 + Math.floor(k / cols) * c} width={c} height={c} fill="none" stroke={C.grid} strokeWidth={1.2} />
        ))}
      </g>
      {lit.map((k, i) => (
        <rect key={k} x={30 + (k % cols) * c + 1} y={70 + Math.floor(k / cols) * c + 1} width={c - 2} height={c - 2} fill={C.green} opacity={prog(t, at + 1.5 + i * 0.05)} />
      ))}
      <text x={30} y={350} fill={C.dim} fontSize={20} opacity={prog(t, at + 0.2)}>
        모식도 · 높이 방향은 나누지 않는다
      </text>
    </svg>
  )
}

function Pillars() {
  const t = useSec()
  const steps: [string, string, number][] = [
    ['점마다 숫자 9 개', 'x, y, z, 반사 세기 + 평균에서 거리 3 개 + 중심에서 x·y 거리 2 개', 14],
    ['같은 선형층', '점마다 숫자 64 개로 바꾼다', 14.8],
    ['pillar 안 최댓값', '64 개 자리마다 최댓값 → 점 순서와 상관없다', 15.6],
    ['pseudo-image', '64 × 500 × 440 크기의 사진 같은 배열', 16.4],
    ['2D CNN + head', 'detection head 가 칸마다 상자 숫자 7 개와 class 점수', 17.2],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={560} h={360} at={0.3}>
        <ImageVsCloud t={t} at={0.5} />
        <div style={{ position: 'absolute', left: 30, top: 270, width: 500, opacity: prog(t, 2.5) }}>
          <span style={line(C.text, 22)}>
            3D voxel + 3D convolution 의 VoxelNet: scan 하나 <span style={mono(C.red, 22)}>225 ms (4.4 Hz)</span>
          </span>
        </div>
      </Card>
      <Card x={640} y={130} w={1220} h={360} at={7}>
        <BevGrid t={t} at={7.2} />
        <div style={{ position: 'absolute', left: 670, top: 70, width: 520, display: 'grid', gap: 14 }}>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 7.6) }}>앞 0 ~ 70.4 m ÷ 0.16 = 440 칸</span>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 8.2) }}>좌우 −40 ~ 40 m ÷ 0.16 = 500 칸</span>
          <span style={{ ...mono(C.accent, 23), opacity: prog(t, 8.8) }}>440 × 500 = 22만 칸</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 9.6) }}>
            KITTI scan 에서 <span style={mono(C.green, 22)}>97%</span> 가 빈 칸 → 점이 있는 pillar 만 최대 <span style={mono(C.green, 22)}>12,000</span> 개
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>pillar 하나에 점 최대 100 개 · 넘치면 무작위, 모자라면 0</span>
        </div>
      </Card>
      {steps.map(([head, body, at], i) => (
        <Box key={head} x={60 + i * 370} y={505} w={320} h={178} at={at} gap={6} color={`${C.accent}66`} title={<Head color={C.accent} size={23}>{head}</Head>}>
          <span style={line(C.text, 21)}>{body}</span>
        </Box>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {steps.slice(1).map(([, , at], i) => (
          <g key={i}>{arrow(60 + (i + 1) * 370 - 44, 594, 60 + (i + 1) * 370 - 6, 594, C.muted, 3, 11, prog(t, at))}</g>
        ))}
      </svg>
      <Box x={60} y={700} w={880} h={170} at={21} gap={10} title={<Head size={24}>한 scan 처리 시간 (GTX 1080 Ti)</Head>}>
        <Bar label="PointPillars" value={16.2} max={225} color={C.green} at={21.3} width={380} unit=" ms" sub="(62 Hz)" labelW={170} />
        <Bar label="VoxelNet" value={225} max={225} color={C.red} at={21.8} width={380} unit=" ms" sub="(4.4 Hz)" labelW={170} />
      </Box>
      <Box x={980} y={700} w={880} h={170} at={23.5} gap={10} title={<Head size={24}>KITTI test · 3D 차 검출 Moderate AP</Head>}>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 23.8) }}>
          <span style={{ color: C.green }}>PointPillars 74.99</span> · SECOND 73.66 · VoxelNet 65.11
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 25) }}>KITTI 는 앞 카메라 시야 안의 점 (전체의 약 10%) 만 쓴다</span>
      </Box>
    </AbsoluteFill>
  )
}

function IouBoxes({ t }: { t: number }) {
  const s = 80
  const shift = prog(t, 0.8, 1.2)
  return (
    <svg width={430} height={400} style={{ position: 'absolute', left: 0, top: 0 }}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        IoU = 겹친 부피 ÷ 합친 부피
      </text>
      <g opacity={prog(t, 0.4)}>
        <rect x={60 + 0.5 * s * shift} y={100} width={(4 - 0.5 * shift) * s} height={2 * s} fill={`${C.green}33`} />
        <rect x={60} y={100} width={4 * s} height={2 * s} fill="none" stroke={C.blue} strokeWidth={3} />
        <rect x={60 + 0.5 * s * shift} y={100} width={4 * s} height={2 * s} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="9 6" />
        <line x1={60} x2={100} y1={82} y2={82} stroke={C.orange} strokeWidth={2} opacity={shift} />
        <text x={60} y={74} fill={C.orange} fontSize={20} fontFamily={MONO} opacity={shift}>
          0.5 m
        </text>
        <text x={220} y={290} textAnchor="middle" fill={C.muted} fontSize={21}>
          4 × 2 m 차 상자
        </text>
      </g>
      <g opacity={prog(t, 6.5)}>
        <rect x={84} y={322} width={0.3 * s} height={0.6 * s} fill={`${C.green}33`} />
        <rect x={60} y={322} width={0.6 * s} height={0.6 * s} fill="none" stroke={C.blue} strokeWidth={3} />
        <rect x={84} y={322} width={0.6 * s} height={0.6 * s} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="7 5" />
        <text x={150} y={355} fill={C.muted} fontSize={21}>
          0.6 × 0.6 m 사람 상자
        </text>
      </g>
    </svg>
  )
}

function Metrics() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={860} h={400} at={0.3}>
        <IouBoxes t={t} />
        <div style={{ position: 'absolute', left: 440, top: 90, width: 400, display: 'grid', gap: 12 }}>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 1.6) }}>겹침 3.5 × 2 = 7</span>
          <span style={{ ...mono(C.text, 23), opacity: prog(t, 2.4) }}>합침 8 + 8 − 7 = 9</span>
          <span style={{ ...mono(C.green, 26), opacity: prog(t, 3.2) }}>IoU = 7 ÷ 9 ≈ 0.78</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 4.4) }}>
            1.0 m 어긋나면 <span style={mono(C.muted, 21)}>0.60</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 440, top: 318, width: 400, display: 'grid', gap: 6, opacity: prog(t, 7.2) }}>
          <span style={line(C.text, 22)}>
            0.3 m 만 어긋나도 <span style={mono(C.red, 24)}>IoU 0.33</span>
          </span>
          <span style={line(C.muted, 21)}>같은 거리 오차도 작은 물체에서 크게 떨어진다</span>
        </div>
      </Card>
      <Box x={950} y={130} w={910} h={400} at={12.8} gap={10} title={<Head color={C.accent}>정답 차 4 대 · 예측 5 개를 점수 순으로</Head>}>
        <Table
          at={13.1}
          step={0.35}
          size={21}
          head={['순서', '점수', '판정', '누적 TP', 'precision', 'recall']}
          widths={[80, 100, 90, 110, 200, 180]}
          colors={[C.green, C.green, C.red, C.green, C.red]}
          rows={[
            ['1', '0.95', 'TP', '1', '1/1 = 1.00', '1/4 = 0.25'],
            ['2', '0.90', 'TP', '2', '2/2 = 1.00', '2/4 = 0.50'],
            ['3', '0.80', 'FP', '2', '2/3 = 0.67', '0.50'],
            ['4', '0.70', 'TP', '3', '3/4 = 0.75', '0.75'],
            ['5', '0.50', 'FP', '3', '3/5 = 0.60', '0.75'],
          ]}
        />
        <span style={{ ...mono(C.accent, 23), opacity: prog(t, 15.8) }}>AP = 0.5 × 1.00 + 0.25 × 0.75 = 0.6875 ≈ 69%</span>
      </Box>
      <Box x={60} y={550} w={860} h={320} at={19.3} title={<Head color={C.blue}>맞혔다고 보는 기준</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 19.6) }}>
          KITTI: 3D IoU 차 <span style={mono(C.blue)}>0.7</span> · 사람과 자전거 <span style={mono(C.blue)}>0.5</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20.6) }}>학습 7,481 개 · 시험 7,518 개 · Easy / Moderate / Hard 중 Moderate 로 순위</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 22) }}>
          nuScenes: 위에서 본 중심 거리 <span style={mono(C.blue)}>0.5, 1, 2, 4 m</span> 기준 AP 의 평균
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23.2) }}>0.3 m 어긋난 사람 상자도 0.5 m 기준은 통과</span>
      </Box>
      <Box x={950} y={550} w={910} h={320} at={25.6} gap={12} title={<Head color={C.purple}>NDS (nuScenes Detection Score)</Head>}>
        <span style={{ ...mono(C.purple, 22), opacity: prog(t, 25.9) }}>NDS = [5 × mAP + Σ (1 − min(1, 오차))] ÷ 10</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.6) }}>오차 5 가지: 위치 · 크기 · 방향 · 속도 · 속성</span>
        <Bar label="PointPillars" value={45.3} max={60} color={C.green} at={27.4} width={260} unit="%" sub="mAP 30.5%" labelW={170} />
        <Bar label="MonoDIS" value={38.4} max={60} color={C.red} at={28.2} width={260} unit="%" sub="mAP 30.4% · 속도 1.55 m/s" labelW={170} />
      </Box>
    </AbsoluteFill>
  )
}

const PauseIou = () => (
  <PauseWrite
    question="4 × 2 m 차 상자가 길이 방향으로 0.8 m 어긋났다. KITTI 기준 (차 IoU 0.7) 으로 맞힌 것인가?"
    answer={
      <>
        겹침 (4 − 0.8) × 2 = 6.4 · 합침 8 + 8 − 6.4 = 9.6 → IoU = 6.4 ÷ 9.6 ≈ 0.67
        <br />
        0.7 보다 작아서 FP · 그 차는 놓친 것으로 센다
      </>
    }
  />
)

// ---------- tracking and fusion ----------

/** A and B predicted 0.1 s ahead, then paired with detections d1 and d2 (980 × 300) */
function Association({ t }: { t: number }) {
  const X = (m: number) => 60 + (m - 8.5) * 143
  const r1 = 95
  const r2 = 170
  const r3 = 245
  const tracks: [string, number, number, string][] = [
    ['A', 9.0, 10.0, 'A 9.0 m · 10 m/s'],
    ['B', 11.5, 12.0, 'B 11.5 m · 5 m/s'],
  ]
  const dets: [string, number][] = [
    ['d1', 11.2],
    ['d2', 13.5],
  ]
  const greedy = prog(t, 12.3)
  const hung = prog(t, 18.3)
  const pair = (from: number, to: number, color: string, op: number, dash?: string) => (
    <line x1={X(from)} y1={r2 + 10} x2={X(to)} y2={r3 - 12} stroke={color} strokeWidth={3.5} strokeDasharray={dash} opacity={op} />
  )
  return (
    <svg width={980} height={300}>
      <text x={30} y={38} fill={C.text} fontSize={23} fontWeight={600} opacity={prog(t, 6.3)}>
        ● 지난 위치 → ○ 0.1 초 뒤 예측 · ■ 새 detection
      </text>
      {tracks.map(([n, last, pred, label], i) => (
        <g key={n} opacity={prog(t, 6.6 + i * 0.6)}>
          <circle cx={X(last)} cy={r1} r={9} fill={C.blue} />
          <text x={X(last) + 14} y={r1 - 14} fill={C.blue} fontSize={21} fontFamily={MONO} fontWeight={600}>
            {label}
          </text>
          {arrow(X(last) + 8, r1 + 6, X(pred) - 7, r2 - 7, C.blue, 2.5, 10, prog(t, 8 + i * 0.6))}
          <g opacity={prog(t, 8.3 + i * 0.6)}>
            <circle cx={X(pred)} cy={r2} r={10} fill={C.card} stroke={C.blue} strokeWidth={3} />
            <text x={X(pred) + 14} y={r2 - 12} fill={C.text} fontSize={21} fontFamily={MONO} fontWeight={600}>
              {pred.toFixed(1)} m
            </text>
          </g>
        </g>
      ))}
      {dets.map(([n, m], i) => (
        <g key={n} opacity={prog(t, 9.6 + i * 0.4)}>
          <rect x={X(m) - 10} y={r3 - 10} width={20} height={20} fill={C.orange} />
          <text x={X(m)} y={r3 + 40} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600}>
            {`${n} ${m} m`}
          </text>
        </g>
      ))}
      {pair(12.0, 11.2, C.red, greedy * (1 - 0.75 * hung))}
      {pair(10.0, 13.5, C.red, greedy * (1 - 0.75 * hung), '8 7')}
      {pair(10.0, 11.2, C.green, hung)}
      {pair(12.0, 13.5, C.green, hung)}
    </svg>
  )
}

function Tracking() {
  const t = useSec()
  const loop: [string, string, number][] = [
    ['① 예측', 'track 마다 지난 위치와 속도로 지금 위치를 예측 · x + v × 0.1', 0.6],
    ['② 짝짓기', 'data association: 예측과 detection 사이 거리를 모두 계산 · gate 를 넘는 짝은 버림', 1.6],
    ['③ 보정', '짝이 된 detection 으로 Kalman filter 가 위치를 고치고 속도도 추정', 2.6],
    ['④ 남은 것', '짝 없는 detection 은 새 물체 후보 · 짝 없는 track 은 사라진 물체 후보', 3.6],
  ]
  return (
    <AbsoluteFill>
      {loop.map(([head, body, at], i) => (
        <Box key={head} x={60 + i * 460} y={130} w={410} h={200} at={at} gap={6} color={`${C.accent}66`} title={<Head color={C.accent} size={24}>{head}</Head>}>
          <span style={line(C.text, 22)}>{body}</span>
        </Box>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {[1, 2, 3].map((i) => (
          <g key={i}>{arrow(60 + i * 460 - 44, 230, 60 + i * 460 - 6, 230, C.muted, 3, 11, prog(t, loop[i][2]))}</g>
        ))}
      </svg>
      <Card x={60} y={350} w={980} h={300} at={6.3}>
        <Association t={t} />
      </Card>
      <Box x={1060} y={350} w={800} h={145} at={12} color={`${C.red}88`} title={<Head color={C.red}>가장 가까운 쌍부터 고르면</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 12.5) }}>
          B–d1 <span style={mono(C.red, 22)}>0.8 m</span> 먼저 → A–d2 <span style={mono(C.red, 22)}>3.5 m</span> 는 gate 2 m 초과 → A 를 놓침
        </span>
      </Box>
      <Box x={1060} y={505} w={800} h={145} at={18} color={`${C.green}88`} title={<Head color={C.green}>Hungarian algorithm · 거리 합이 최소인 조합</Head>}>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 18.5) }}>
          A–d1 + B–d2 = <span style={{ color: C.green }}>2.7 m</span> &lt; A–d2 + B–d1 = 4.3 m
        </span>
      </Box>
      <Box x={60} y={670} w={1800} h={200} at={24} color={`${C.purple}88`} title={<Head color={C.purple}>AB3DMOT (Weng 등, 2020) · KITTI 설정</Head>}>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 24.4) }}>
          새 물체는 <span style={mono(C.purple)}>3 frame</span> 연속 짝지어져야 track 이 된다 → 한 frame 에만 나온 잘못된 detection 은 track 이 되지 못한다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 26.4) }}>
          짝 잃은 track 은 <span style={mono(C.purple)}>2 frame (2 ÷ 10 = 0.2 초)</span> 동안 예측만으로 유지 · GPU 없이 1초에 <span style={mono(C.purple)}>207.4</span> frame
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Fusion() {
  const t = useSec()
  const col = (head: string, color: string, items: string[], at: number) => (
    <div style={{ display: 'grid', gap: 10, alignContent: 'start', opacity: prog(t, at) }}>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color }}>{head}</span>
      {items.map((s, i) => (
        <span key={s} style={{ ...line(C.text, 22), opacity: prog(t, at + 0.4 + i * 0.4) }}>
          · {s}
        </span>
      ))}
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={860} h={330} at={0.3} title={<Head>서로 모자란 것을 채운다</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          {col('LiDAR', C.blue, ['거리를 cm 단위로 잰다', '멀수록 점이 듬성하다', '색이 없다'], 0.6)}
          {col('camera', C.orange, ['먼 물체도 pixel 이 빽빽하다', '색과 글자까지 담는다', '사진 한 장으로는 거리를 모른다'], 3.2)}
        </div>
      </Box>
      <Box x={950} y={130} w={910} h={330} at={6.8} gap={10} color={`${C.accent}88`} title={<Head color={C.accent}>점을 pixel 로 투영 (extrinsic → intrinsic)</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 7.1) }}>
          LiDAR frame (x 앞 · z 위) <span style={mono(C.text, 23)}>(10, 1, 0.5) m</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 8.3) }}>
          → camera frame (Z 앞 · Y 아래) <span style={mono(C.accent, 23)}>(−1, −0.5, 10) m</span>
        </span>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 9.8) }}>u = 700 × (−1 ÷ 10) + 640 = 570</span>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 10.8) }}>v = 700 × (−0.5 ÷ 10) + 360 = 325</span>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 11.8) }}>두 원점이 같다고 두고, focal length 700 px 와 사진 중심 (640, 360) 은 예로 정한 값</span>
      </Box>
      <Box x={60} y={480} w={860} h={390} at={13.8} gap={14} color={`${C.green}88`} title={<Head color={C.green}>PointPainting · nuScenes test (PointPillars+)</Head>}>
        <Flow at={14.1} gap={0.4} color={C.green} steps={['사진', 'segmentation', '점수 붙이기', 'PointPillars']} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 15.5) }}>투영된 pixel 의 class 점수 (사람 0.9, 차 0.05, …) 를 점 뒤에 붙인다</span>
        <Gain label="mAP" before={40.1} after={46.4} max={70} color={C.green} at={16.2} />
        <Gain label="자전거" before={14.0} after={24.1} max={70} color={C.green} at={17} />
        <Gain label="라바콘" before={45.6} after={62.4} max={70} color={C.green} at={17.8} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 19) }}>
          직전 사진의 결과를 써서 늘어난 지연은 <span style={mono(C.muted, 21)}>0.75 ms</span>
        </span>
      </Box>
      <Box x={950} y={480} w={910} h={390} at={20.8} gap={14} color={`${C.red}88`} title={<Head color={C.red}>같은 곳을 같은 시각에 본다는 가정이 어긋나면</Head>}>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 21.1) }}>
          <span style={line(C.text, 23)}>
            extrinsic 회전 1° · <span style={mono(C.red)}>700 × tan 1° ≈ 12 px</span>
          </span>
          <span style={line(C.muted, 21)}>30 m 앞 폭 0.5 m 사람 (700 × 0.5 ÷ 30 ≈ 12 px) 이 통째로 옆 pixel 로 밀린다</span>
        </div>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 24) }}>
          <span style={line(C.text, 23)}>
            시각 차이 50 ms · <span style={mono(C.red)}>20 m/s × 0.05 s = 1 m</span>
          </span>
          <span style={line(C.muted, 21)}>마주 오는 차의 점이 1 m 어긋난 자리의 pixel 점수를 받는다</span>
        </div>
        <span style={{ ...line(C.dim, 21), opacity: prog(t, 25.6) }}>nuScenes 는 LiDAR 20 Hz · 카메라 12 Hz 라서 둘이 같은 순간에 찍히지 않는다</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseTrack = () => (
  <PauseWrite
    question="10 Hz LiDAR 에서 짝을 잃은 track 을 2 frame 까지 유지하는 tracker 가 있다. 보행자가 주차된 차 뒤를 0.5 초 동안 지나가면 어떻게 되는가?"
    answer={
      <>
        0.5 초 = 5 frame &gt; 2 frame → track 이 지워진다
        <br />
        다시 나온 보행자는 새 번호로 시작하고 속도도 0 에서 다시 추정
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: 'point cloud 와 밀도', color: C.accent, text: '좌표와 반사 세기뿐 · VLP-16 사람의 점 10 m 약 70 개 → 50 m 약 3 개', at: 1 },
    { tag: '규칙 기반 상자', color: C.blue, text: 'voxel → RANSAC 땅 지우기 → Euclidean clustering → L-shape fitting', at: 4.4 },
    { tag: 'PointPillars 와 지표', color: C.orange, text: 'pillar → pseudo-image → 2D CNN · 16.2 ms · IoU 차 0.7 · AP · NDS', at: 8.4 },
    { tag: 'tracking 과 fusion', color: C.red, text: '예측 → Hungarian 짝짓기 → 보정 · 1° 틀리면 약 12 px, 50 ms 면 1 m', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            점 더미에서 보행자를 찾아 상자를 씌우고, 걷는 방향까지 알아내려면?
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
            NEXT · DRIVING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Autonomous Driving Stack</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            localization · prediction · planning · control 을 한 차량 위에서 잇기 · Autoware 의 구조
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/lidar-perception (PointPillars · RANSAC · KITTI · nuScenes · AB3DMOT · PointPainting 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function LidarPerception() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        sensor: Sensor,
        density: Density,
        'pause-scan': PauseScan,
        ransac: Ransac,
        cluster: Cluster,
        'pause-ransac': PauseRansac,
        pillars: Pillars,
        metrics: Metrics,
        'pause-iou': PauseIou,
        tracking: Tracking,
        fusion: Fusion,
        'pause-track': PauseTrack,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
