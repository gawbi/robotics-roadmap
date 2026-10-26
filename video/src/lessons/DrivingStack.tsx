import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './driving-stack.narration.json'
import { script } from './driving-stack.script'

// ---------- shared numbers (lessons/driving-stack/README.md, "modular 와 end-to-end") ----------

/** nuScenes planning results, averaged over 1, 2, 3 s (UniAD paper, table 7, as the lesson quotes it) */
const RESULTS = [
  { name: 'ST-P3', note: '이전 camera 기반 end-to-end', l2: 2.11, col: 0.71, color: C.muted, at: 22.3 },
  { name: 'UniAD', note: 'Hu 등, 2023', l2: 1.03, col: 0.31, color: C.blue, at: 27.7 },
]
/** share of nuScenes that is driving straight (Li et al., 2024) */
const STRAIGHT = 73.9

/** 0 → 1 → 0 smooth step on [0, 1] */
const ss = (x: number) => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}

/** fades in at `at` and, if given, out at `out` */
const vis = (t: number, at: number, out?: number, dur = 0.5) => prog(t, at, dur) * (out === undefined ? 1 : 1 - prog(t, out, 0.4))

function Car({ x, y, angle = 0, color = C.blue, glow = false, w = 52, h = 30 }: { x: number; y: number; angle?: number; color?: string; glow?: boolean; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {glow && <rect x={-w / 2 - 10} y={-h / 2 - 9} width={w + 20} height={h + 18} rx={14} fill={color} opacity={0.18} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={color} />
      <rect x={w / 2 - 20} y={-h / 2 + 4} width={12} height={h - 8} rx={3} fill={C.bg} opacity={0.55} />
    </g>
  )
}

/** a straight arrow drawn from (x1, y1) towards (x2, y2), `p` of the way */
function Arrow({ x1, y1, x2, y2, p = 1, color = C.muted, w = 3, head = 13 }: { x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; w?: number; head?: number }) {
  if (p <= 0) return null
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  const ux = dx / L
  const uy = dy / L
  const ex = x1 + dx * p
  const ey = y1 + dy * p
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex - ux * head * 0.7} y2={ey - uy * head * 0.7} stroke={color} strokeWidth={w} />
      <path d={`M ${ex} ${ey} L ${ex - ux * head - uy * head * 0.55} ${ey - uy * head + ux * head * 0.55} L ${ex - ux * head + uy * head * 0.55} ${ey - uy * head - ux * head * 0.55} Z`} fill={color} />
    </g>
  )
}

/** an HTML label centred on (x, y) of its panel */
function Tag({ x, y, children, style }: { x: number; y: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', ...style }}>{children}</div>
}

const pts = (xs: [number, number][]) => xs.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function Intro() {
  const t = useSec()
  const chips = script.sections
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 26, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            SESSION 7 · AUTONOMOUS DRIVING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 104, fontWeight: 600, letterSpacing: '-0.03em' }}>Autonomous Driving Stack</div>
        </Appear>
        <Appear at={1.1}>
          <Label color={C.muted} size={40}>
            module 로 나눌까, network 하나로 이을까, 그리고 무엇으로 평가할까
          </Label>
        </Appear>
        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
          {chips.map((c, i) => (
            <Appear key={c} at={2 + i * 0.45}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 26px',
                  borderRadius: 999,
                  border: `1.5px solid ${C.cardEdge}`,
                  background: C.card,
                  fontSize: 30,
                  transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 2 - i * 0.45) * 2)})`,
                }}
              >
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
  const draw = prog(t, 2, 1.6)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50, marginTop: -40 }}>
        <Appear at={0.3}>
          <div style={{ fontSize: 76, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            사람의 경로와 거의 같다면
            <br />
            <span style={{ color: C.accent }}>운전을 잘하는 걸까?</span>
          </div>
        </Appear>
        <div style={{ display: 'flex', gap: 40 }}>
          <Appear at={1.6}>
            <Panel x={0} y={0} w={460} h={230} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>기록된 장면 · 사람 경로와 비교</Label>
              </div>
              <svg width={460} height={170} style={{ position: 'absolute', bottom: 0 }}>
                <path d="M 30 130 C 150 130, 250 60, 430 50" fill="none" stroke={C.green} strokeWidth={5} strokeDasharray="12 9" opacity={draw > 0 ? 1 : 0} strokeDashoffset={0} style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }} />
                <path d="M 30 130 C 160 134, 260 74, 430 66" fill="none" stroke={C.blue} strokeWidth={5} strokeLinecap="round" strokeDasharray={480} strokeDashoffset={480 * (1 - draw)} />
                <text x={430} y={146} textAnchor="end" fill={C.green} fontSize={28} fontWeight={600} opacity={prog(t, 3.4)}>
                  차이 작음 ✓
                </text>
              </svg>
            </Panel>
          </Appear>
          <Appear at={3.6}>
            <Panel x={0} y={0} w={460} h={230} style={{ position: 'relative' }}>
              <div style={{ padding: '20px 26px' }}>
                <Label size={26}>실제로 차를 움직이면</Label>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', color: C.orange, fontSize: 110, fontWeight: 700, lineHeight: 1, opacity: prog(t, 4.4) }}>?</div>
            </Panel>
          </Appear>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ---------- modular stack vs one network ----------

const MOD = { x: 64, y: 140, w: 1792, h: 370 }
const MB = { w: 200, h: 90, cy: 200 }
const MODULES = [
  { name: 'perception', x: 256 },
  { name: 'prediction', x: 600 },
  { name: 'planning', x: 944 },
  { name: 'control', x: 1288 },
]
const LINKS = ['box 목록', '경로 + 확률', 'trajectory']
const SENSOR = { x: 36, y: 140, w: 160, h: 120 }

const E2E = { x: 64, y: 535, w: 1792, h: 345 }
const PARTS = [
  { name: 'camera 6 대', x: 36, w: 160, y: 130, h: 70, color: C.blue },
  { name: 'BEV feature', x: 256, w: 180, y: 130, h: 70, color: C.blue },
  { name: 'TrackFormer', x: 496, w: 200, y: 102, h: 56, color: C.green },
  { name: 'MapFormer', x: 496, w: 200, y: 172, h: 56, color: C.green },
  { name: 'MotionFormer', x: 756, w: 200, y: 130, h: 70, color: C.green },
  { name: 'OccFormer', x: 1016, w: 180, y: 130, h: 70, color: C.green },
  { name: 'Planner', x: 1256, w: 160, y: 130, h: 70, color: C.green },
]
const EDGES: [number, number, number, number][] = [
  [196, 165, 256, 165],
  [436, 165, 496, 130],
  [436, 165, 496, 200],
  [696, 130, 756, 165],
  [696, 200, 756, 165],
  [956, 165, 1016, 165],
  [1196, 165, 1256, 165],
  [1416, 165, 1474, 165],
]

function Stack() {
  const t = useSec()
  const badges = 1 - prog(t, 11, 0.4)
  const wrong = prog(t, 8.8, 0.4) * badges
  // what the sensor sees, carried to perception; only the box goes on
  const enter = prog(t, 12, 1)
  const go = prog(t, 13.3, 2)
  const drop = prog(t, 13.3, 0.8)
  const boxX = go > 0 ? lerp(356, 1044, go) : lerp(82, 356, enter)
  const boxY = go > 0 ? lerp(182, 200, Math.min(1, go * 4)) : lerp(214, 182, enter)
  const boxOp = vis(t, 11.6, 15.4)
  const dirX = drop > 0 ? lerp(356, 500, drop) : lerp(108, 340, enter)
  const dirY = drop > 0 ? lerp(200, 300, drop) : 200
  const blobX = drop > 0 ? lerp(356, 500, drop) : lerp(152, 356, enter)
  const blobY = drop > 0 ? lerp(218, 340, drop) : lerp(236, 218, enter)
  const lost = prog(t, 13.8, 0.5)
  const lossDraw = prog(t, 25, 1.2)
  const learn = prog(t, 26.2, 0.3) * (1 - prog(t, 27.2, 0.6))
  return (
    <AbsoluteFill>
      <Panel x={MOD.x} y={MOD.y} w={MOD.w} h={MOD.h} style={{ opacity: prog(t, 0.2) }}>
        <svg width={MOD.w} height={MOD.h} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="blur-obj" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          {/* the sensor's view: a pedestrian facing right, and something blurry */}
          <g opacity={prog(t, 0.4)}>
            <rect x={SENSOR.x} y={SENSOR.y} width={SENSOR.w} height={SENSOR.h} rx={12} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={SENSOR.x + 12} y={SENSOR.y + 26} fill={C.muted} fontSize={20}>
              센서
            </text>
            <g stroke={C.text} strokeWidth={3} strokeLinecap="round">
              <circle cx={82} cy={186} r={8} fill={C.text} stroke="none" />
              <line x1={82} y1={195} x2={82} y2={224} />
              <line x1={82} y1={224} x2={74} y2={244} />
              <line x1={82} y1={224} x2={90} y2={244} />
              <line x1={82} y1={204} x2={92} y2={216} />
            </g>
            <ellipse cx={152} cy={236} rx={18} ry={11} fill={C.purple} filter="url(#blur-obj)" opacity={1 - enter * 0.7} />
            <g opacity={1 - enter * 0.7}>
              <Arrow x1={94} y1={200} x2={126} y2={200} color={C.pink} w={3} head={10} />
            </g>
          </g>
          <Arrow x1={200} y1={MB.cy} x2={MODULES[0].x - 6} y2={MB.cy} p={prog(t, 0.9, 0.5)} />
          {/* what the sensor saw, carried to perception: only the box goes on (under the module boxes) */}
          <g opacity={boxOp}>
            <rect x={boxX - 15} y={boxY - 22} width={30} height={44} rx={4} fill={C.card} stroke={C.orange} strokeWidth={3} strokeDasharray="6 4" />
          </g>
          {/* modules */}
          {MODULES.map((m, i) => {
            const red = i === 1 ? wrong : 0
            return (
              <g key={m.name} opacity={prog(t, 0.6 + i * 0.35)}>
                <rect x={m.x} y={MB.cy - MB.h / 2} width={MB.w} height={MB.h} rx={12} fill="#111a2e" stroke={red > 0.5 ? C.red : C.orange} strokeWidth={2 + 2 * red} />
                <text x={m.x + MB.w / 2} y={MB.cy + 10} textAnchor="middle" fill={red > 0.5 ? C.red : C.orange} fontSize={28} fontWeight={600} fontFamily={MONO}>
                  {m.name}
                </text>
              </g>
            )
          })}
          {/* the interfaces people defined */}
          {LINKS.map((l, i) => {
            const x1 = MODULES[i].x + MB.w + 6
            const x2 = MODULES[i + 1].x - 6
            return <Arrow key={l} x1={x1} y1={MB.cy} x2={x2} y2={MB.cy} p={prog(t, 2.2 + i * 0.5, 0.5)} />
          })}
          <Arrow x1={MODULES[3].x + MB.w + 6} y1={MB.cy} x2={MODULES[3].x + MB.w + 60} y2={MB.cy} p={prog(t, 3.8, 0.4)} />
          <text x={MODULES[3].x + MB.w + 72} y={MB.cy + 9} fill={C.text} fontSize={26} opacity={prog(t, 4)}>
            핸들 · 브레이크
          </text>
          {/* "tested on its own", then one module found wrong */}
          {MODULES.map((m, i) => (
            <g key={m.name} opacity={prog(t, 6.2 + i * 0.45) * badges}>
              <text x={m.x + MB.w / 2} y={MB.cy + MB.h / 2 + 44} textAnchor="middle" fill={i === 1 && wrong > 0.5 ? C.red : C.green} fontSize={24} fontWeight={600}>
                {i === 1 && wrong > 0.5 ? '✕ 여기 출력이 틀렸다' : '✓ 따로 시험'}
              </text>
            </g>
          ))}
          {/* the other clues stop at perception */}
          <g opacity={vis(t, 11.6)}>
            <g transform={`translate(${dirX} ${dirY})`}>
              <Arrow x1={-16} y1={0} x2={16} y2={0} color={lost > 0.5 ? C.red : C.pink} w={4} head={11} />
            </g>
            <ellipse cx={blobX} cy={blobY} rx={18} ry={11} fill={lost > 0.5 ? C.red : C.purple} filter="url(#blur-obj)" />
          </g>
          <g opacity={prog(t, 14.1)}>
            <text x={530} y={308} fill={C.red} fontSize={24} fontWeight={600}>
              몸 방향 ✕
            </text>
            <text x={530} y={348} fill={C.red} fontSize={24} fontWeight={600}>
              흐릿한 물체 ✕
            </text>
          </g>
          <text x={760} y={330} fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 15.2)}>
            box 로 정리되지 않은 단서는 planning 까지 오지 않는다
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 36, top: 26, display: 'flex', alignItems: 'baseline', gap: 22 }}>
          <Label mono color={C.text} size={34} weight={600}>
            modular stack
          </Label>
          <Label size={24}>module 사이에 주고받을 것을 사람이 정한다</Label>
        </div>
        {LINKS.map((l, i) => (
          <Tag key={l} x={(MODULES[i].x + MB.w + MODULES[i + 1].x) / 2} y={MB.cy - 30} style={{ opacity: prog(t, 2.6 + i * 0.5) }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 21,
                color: i === 1 && wrong > 0.5 ? C.red : C.text,
                background: C.bg,
                border: `1.5px solid ${i === 1 && wrong > 0.5 ? C.red : C.cardEdge}`,
              }}
            >
              {l}
            </span>
          </Tag>
        ))}
      </Panel>

      <Panel x={E2E.x} y={E2E.y} w={E2E.w} h={E2E.h} style={{ opacity: prog(t, 17.1) }}>
        <svg width={E2E.w} height={E2E.h} style={{ position: 'absolute', inset: 0 }}>
          <rect x={236} y={86} width={1200} height={158} rx={16} fill={`${C.accent}0a`} stroke={C.accent} strokeWidth={2.5} strokeDasharray="12 9" opacity={prog(t, 19.4, 0.8)} />
          <text x={1436} y={74} textAnchor="end" fill={C.accent} fontSize={24} fontWeight={600} opacity={prog(t, 19.8)}>
            network 하나
          </text>
          {EDGES.map(([x1, y1, x2, y2], i) => (
            <Arrow key={i} x1={x1 + 3} y1={y1} x2={x2 - 4} y2={y2} p={prog(t, 17.8 + i * 0.3, 0.4)} w={2.5} head={11} />
          ))}
          {PARTS.map((p, i) => {
            const flash = p.color === C.green || p.name === 'BEV feature' ? learn : 0
            return (
              <g key={p.name} opacity={prog(t, 17.5 + i * 0.3)}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={10} fill="#111a2e" stroke={flash > 0.3 ? C.red : p.color} strokeWidth={2 + 2 * flash} />
                <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 8} textAnchor="middle" fill={p.color} fontSize={23} fontWeight={600} fontFamily={p.name.startsWith('camera') ? undefined : MONO}>
                  {p.name}
                </text>
              </g>
            )
          })}
          <text x={1484} y={174} fill={C.text} fontSize={26} opacity={prog(t, 20)}>
            경로
          </text>
          {/* learned vectors (queries) handed from part to part */}
          {EDGES.slice(1, 7).map(([x1, y1, x2, y2], i) => {
            const ph = ((t - 22.8 - i * 0.18) / 1.1) % 1
            const u = 0.3 + 0.4 * (ph < 0 ? 0 : ph)
            return (
              <g key={i} opacity={vis(t, 22.8) * (t > 22.8 + i * 0.18 ? 1 : 0)} transform={`translate(${lerp(x1, x2, u)} ${lerp(y1, y2, u)})`}>
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={-11 + k * 8} y={-3.5} width={7} height={7} rx={1.5} fill={C.purple} stroke={C.card} strokeWidth={1} />
                ))}
              </g>
            )
          })}
          <g opacity={prog(t, 23.2)}>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={36 + k * 11} y={286} width={8} height={8} rx={2} fill={C.purple} />
            ))}
            <text x={78} y={296} fill={C.purple} fontSize={22} fontWeight={600}>
              학습한 vector (query)
            </text>
          </g>
          {/* the planning loss reaches back to every part */}
          <path
            d="M 1336 250 C 1336 306, 346 306, 346 250"
            fill="none"
            stroke={C.red}
            strokeWidth={3}
            strokeDasharray="10 8"
            opacity={lossDraw > 0 ? 1 : 0}
            style={{ clipPath: `inset(0 0 0 ${(1 - lossDraw) * 100}%)` }}
          />
          <path d="M 346 247 L 337 263 L 355 263 Z" fill={C.red} opacity={prog(t, 26, 0.3)} />
          <text x={841} y={326} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600} opacity={prog(t, 25.6)}>
            최종 경로로 계산한 loss 하나로 전체를 함께 학습
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 36, top: 26, display: 'flex', alignItems: 'baseline', gap: 22, opacity: prog(t, 17.3) }}>
          <Label mono color={C.text} size={34} weight={600}>
            end-to-end · UniAD
          </Label>
          <Label size={24}>센서에서 경로까지 · Hu 등, 2023</Label>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- L2 and collision rate on a logged nuScenes scene ----------

const RD = { x: 64, y: 140, w: 1150, h: 740, top: 200, mid: 320, bot: 440 }
/** the human's logged path and the network's plan, s seconds ahead (pixels on the road panel) */
const human = (s: number): [number, number] => [150 + 250 * s, 380 - 120 * ss((s - 0.5) / 2.3)]
const plan = (s: number): [number, number] => [150 + 243 * s, 380 - 36 * ss((s - 0.8) / 2.6)]
const along = (f: (s: number) => [number, number], upto: number) => Array.from({ length: 61 }, (_, i) => f((i / 60) * upto))
const heading = (f: (s: number) => [number, number], s: number) => {
  const [x0, y0] = f(Math.max(0, s - 0.05))
  const [x1, y1] = f(s + 0.05)
  return (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI
}
const PARKED = { cx: 935, cy: 380, w: 110, h: 56 }

function Metrics() {
  const t = useSec()
  const planDraw = prog(t, 1.4, 2)
  const humanDraw = prog(t, 6, 1.6)
  const dimL2 = 1 - 0.65 * prog(t, 16.9, 0.5)
  const hit = prog(t, 18.6, 0.4)
  return (
    <AbsoluteFill>
      <Panel x={RD.x} y={RD.y} w={RD.w} h={RD.h}>
        <svg width={RD.w} height={RD.h} style={{ position: 'absolute', inset: 0 }}>
          <text x={60} y={66} fill={C.blue} fontSize={26} fontWeight={600} opacity={prog(t, 1.4)}>
            ━ network 가 계획한 경로 · 3 초 앞까지
          </text>
          <text x={60} y={108} fill={C.green} fontSize={26} fontWeight={600} opacity={prog(t, 6)}>
            ┅ 사람이 실제로 운전한 경로 · 기록
          </text>
          <text x={RD.w - 50} y={66} textAnchor="end" fill={C.muted} fontSize={24} opacity={prog(t, 0.4)}>
            nuScenes · 기록된 주행 장면
          </text>
          {/* road */}
          <rect x={40} y={RD.top} width={RD.w - 80} height={RD.bot - RD.top} fill="#0e1628" />
          <line x1={40} x2={RD.w - 40} y1={RD.top} y2={RD.top} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          <line x1={40} x2={RD.w - 40} y1={RD.bot} y2={RD.bot} stroke={C.muted} strokeWidth={4} opacity={0.6} />
          <line x1={40} x2={RD.w - 40} y1={RD.mid} y2={RD.mid} stroke={C.muted} strokeWidth={3} strokeDasharray="22 18" opacity={0.45} />
          {/* another object in the log */}
          <g opacity={prog(t, 0.6)}>
            <rect x={PARKED.cx - PARKED.w / 2} y={PARKED.cy - PARKED.h / 2} width={PARKED.w} height={PARKED.h} rx={10} fill={C.orange} opacity={0.9} />
            <text x={PARKED.cx} y={PARKED.cy + 8} textAnchor="middle" fill={C.bg} fontSize={22} fontWeight={700}>
              다른 차
            </text>
          </g>
          {/* paths */}
          <g opacity={dimL2}>
            <polyline points={pts(along(human, 3 * humanDraw))} fill="none" stroke={C.green} strokeWidth={4} strokeDasharray="14 10" opacity={humanDraw > 0 ? 1 : 0} />
          </g>
          <polyline points={pts(along(plan, 3 * planDraw))} fill="none" stroke={C.blue} strokeWidth={5} strokeLinejoin="round" opacity={planDraw > 0 ? 1 : 0} />
          {/* the three times, and the gaps */}
          {[1, 2, 3].map((s, i) => {
            const [hx, hy] = human(s)
            const [px, py] = plan(s)
            const g = prog(t, 9 + i * 0.6, 0.6)
            return (
              <g key={s}>
                <circle cx={px} cy={py} r={8} fill={C.blue} opacity={prog(t, 1.9 + i * 0.6)} />
                <g opacity={dimL2}>
                  <line x1={hx} y1={hy} x2={lerp(hx, px, g)} y2={lerp(hy, py, g)} stroke={C.purple} strokeWidth={4} opacity={g > 0 ? 1 : 0} />
                  <circle cx={hx} cy={hy} r={8} fill={C.green} opacity={prog(t, 7.6 + i * 0.5)} />
                  <text x={hx} y={hy - 22} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 7.6 + i * 0.5)}>
                    {s} 초
                  </text>
                  <text x={s === 1 ? px - 14 : (hx + px) / 2 + 22} y={s === 1 ? py + 44 : (hy + py) / 2 + 10} fill={C.purple} fontSize={28} fontWeight={600} fontFamily={MONO} opacity={prog(t, 9.4 + i * 0.6)}>
                    d{['₁', '₂', '₃'][i]}
                  </text>
                </g>
              </g>
            )
          })}
          {/* where the car would be if it followed the plan */}
          {[1, 2, 3].map((s, i) => {
            const [px, py] = plan(s)
            const red = s === 3 ? hit : 0
            return (
              <g key={s} opacity={prog(t, 17.2 + i * 0.4) * (s === 3 ? 1 : 0.7)} transform={`translate(${px} ${py}) rotate(${heading(plan, s)})`}>
                <rect x={-50} y={-26} width={100} height={52} rx={10} fill={red > 0.5 ? C.red : C.blue} fillOpacity={0.14 + 0.2 * red} stroke={red > 0.5 ? C.red : C.blue} strokeWidth={3} strokeDasharray="8 6" />
              </g>
            )
          })}
          <g opacity={hit}>
            <text x={PARKED.cx} y={RD.bot + 40} textAnchor="middle" fill={C.red} fontSize={28} fontWeight={700}>
              다른 물체와 겹침 → 충돌
            </text>
          </g>
          <Car x={150} y={380} color={C.blue} glow />
          {/* the definitions */}
          <g opacity={prog(t, 11.6)}>
            <text x={60} y={580} fill={C.text} fontSize={40} fontWeight={600} fontFamily={MONO}>
              L2 = (<tspan fill={C.purple}>d₁</tspan> + <tspan fill={C.purple}>d₂</tspan> + <tspan fill={C.purple}>d₃</tspan>) ÷ 3
            </text>
          </g>
          <text x={60} y={626} fill={C.muted} fontSize={26} opacity={prog(t, 12.6)}>
            1·2·3 초 시점의 위치 차이 평균 · 작을수록 사람의 경로에 가깝다
          </text>
          <text x={60} y={694} fill={C.text} fontSize={32} fontWeight={600} opacity={prog(t, 19.4)}>
            충돌률 = 계획한 경로가 다른 물체와 겹친 비율
          </text>
        </svg>
      </Panel>
      <ResultTable t={t} />
    </AbsoluteFill>
  )
}

function ResultTable({ t }: { t: number }) {
  const widths = [232, 140, 180]
  const l2On = prog(t, 11.6, 0.4) * (1 - prog(t, 16.8, 0.4))
  const colOn = prog(t, 16.8, 0.4) * (1 - prog(t, 22, 0.4))
  const BAR = 330
  const bars = [
    { label: '평균 L2', key: 'l2' as const, unit: ' m', max: RESULTS[0].l2 },
    { label: '평균 충돌률', key: 'col' as const, unit: '%', max: RESULTS[0].col },
  ]
  return (
    <Panel x={1244} y={RD.y} w={612} h={RD.h}>
      <div style={{ padding: '28px 30px 0', display: 'grid', gap: 6 }}>
        <Label color={C.text} size={28} weight={600}>
          nuScenes · 3 초 앞까지 계획
        </Label>
        <Label size={22}>UniAD 논문이 보고한 평균값</Label>
      </div>
      <div style={{ padding: '22px 30px 0', display: 'grid' }}>
        <div style={{ display: 'flex', fontSize: 22, color: C.muted, paddingBottom: 10, borderBottom: `1.5px solid ${C.cardEdge}` }}>
          <span style={{ width: widths[0] }}>방법</span>
          <span style={{ width: widths[1], textAlign: 'right', color: l2On > 0.5 ? C.accent : C.muted, fontWeight: l2On > 0.5 ? 600 : 400 }}>평균 L2</span>
          <span style={{ width: widths[2], textAlign: 'right', color: colOn > 0.5 ? C.accent : C.muted, fontWeight: colOn > 0.5 ? 600 : 400 }}>평균 충돌률</span>
        </div>
        {RESULTS.map((r) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', height: 86, opacity: prog(t, r.at, 0.4), borderBottom: `1px solid ${C.grid}` }}>
            <div style={{ width: widths[0], display: 'grid', gap: 2 }}>
              <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: r.name === 'UniAD' ? C.blue : C.text }}>{r.name}</span>
              <span style={{ fontSize: 17, color: C.muted, whiteSpace: 'nowrap' }}>{r.note}</span>
            </div>
            <span style={{ width: widths[1], textAlign: 'right', fontFamily: MONO, fontSize: 30, color: r.name === 'UniAD' ? C.blue : C.text }}>{r.l2.toFixed(2)} m</span>
            <span style={{ width: widths[2], textAlign: 'right', fontFamily: MONO, fontSize: 30, color: r.name === 'UniAD' ? C.blue : C.text }}>{r.col.toFixed(2)}%</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 30, top: 372, width: 552, display: 'grid', gap: 24 }}>
        {bars.map((b) => (
          <div key={b.key} style={{ display: 'grid', gap: 10, opacity: prog(t, RESULTS[0].at + 0.4) }}>
            <Label size={22}>{b.label}</Label>
            {RESULTS.map((r) => {
              const w = (r[b.key] / b.max) * BAR * prog(t, r.at + 0.5, 0.8)
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', height: 34, opacity: prog(t, r.at + 0.3) }}>
                  <span style={{ width: 96, fontFamily: MONO, fontSize: 20, color: C.muted }}>{r.name}</span>
                  <div style={{ position: 'relative', width: BAR, height: 26 }}>
                    <div style={{ width: w, height: '100%', borderRadius: 6, background: r.color, opacity: r.name === 'UniAD' ? 0.95 : 0.55 }} />
                    <div style={{ position: 'absolute', left: BAR / 2, top: -8, bottom: -8, borderLeft: `2px dashed ${C.dim}`, opacity: prog(t, 29.4) }} />
                  </div>
                  <span style={{ marginLeft: 14, fontFamily: MONO, fontSize: 22, color: r.name === 'UniAD' ? C.blue : C.text, opacity: prog(t, r.at + 1) }}>
                    {r[b.key].toFixed(2)}
                    {b.unit}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 30 + 96 + 330 / 2 - 40, top: 344, width: 80, textAlign: 'center', fontSize: 20, color: C.dim, opacity: prog(t, 29.4) }}>절반</div>
      <Appear at={30} style={{ position: 'absolute', left: 30, right: 30, top: 670 }}>
        <Label color={C.blue} size={28} weight={600}>
          UniAD 는 두 값 모두 ST-P3 의 절반 아래
        </Label>
      </Appear>
    </Panel>
  )
}

// ---------- open-loop vs closed-loop, and the straight-road trap ----------

const LP = { w: 900, h: 360, top: 96, bot: 290 }
/** the logged human path across a loop panel */
const logY = (x: number) => 206 - 50 * ss((x - 250) / 450)
/** a plan from (x0, y0) that drifts off the log by 45 px over its 260 px */
const planFrom = (x0: number, off: number, u: number): [number, number] => [x0 + 260 * u, logY(x0 + 260 * u) + off + 45 * u * u]
const planPts = (x0: number, off: number, upto = 1) => Array.from({ length: 31 }, (_, i) => planFrom(x0, off, (i / 30) * upto))
const OPEN_FRAMES = [0, 1, 2, 3].map((k) => ({ x: 100 + 170 * k, at: 0.8 + 2.4 * k }))
/** closed loop: the car drives 170 px of its own plan each frame, and the next plan starts where it got to */
const STEP = 170
const closedY = (x: number) => logY(x) + 70 * Math.pow(Math.max(0, x - 100) / 780, 1.6)
const CLOSED_FRAMES = [0, 1, 2, 3].map((k) => ({ x: 100 + STEP * k, at: 22.6 + 1.3 * k }))
const closedPts = (x0: number, len: number) => Array.from({ length: 31 }, (_, i): [number, number] => [x0 + (i / 30) * len, closedY(x0 + (i / 30) * len)])

function LoopRoad({ legend, opacity = 1 }: { legend: [string, string][]; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <rect x={30} y={LP.top} width={LP.w - 60} height={LP.bot - LP.top} fill="#0e1628" />
      <line x1={30} x2={LP.w - 30} y1={LP.top} y2={LP.top} stroke={C.muted} strokeWidth={3} opacity={0.6} />
      <line x1={30} x2={LP.w - 30} y1={LP.bot} y2={LP.bot} stroke={C.muted} strokeWidth={3} opacity={0.6} />
      <polyline points={pts(Array.from({ length: 41 }, (_, i) => [40 + i * 20.5, logY(40 + i * 20.5)]))} fill="none" stroke={C.green} strokeWidth={4} strokeDasharray="12 9" />
      <text x={LP.w - 44} y={LP.bot - 16} textAnchor="end" fontSize={20} fontWeight={600}>
        {legend.map(([label, color], i) => (
          <tspan key={label} fill={color} dx={i ? 22 : 0}>
            {label}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function OpenLoop({ t }: { t: number }) {
  // the car always sits where the log says; each plan is only compared, then dropped
  let k = 0
  OPEN_FRAMES.forEach((f, i) => {
    if (t >= f.at) k = i
  })
  const f = OPEN_FRAMES[k]
  const next = OPEN_FRAMES[k + 1]
  const move = next ? prog(t, next.at - 1, 0.8) : 0
  const carX = next ? lerp(f.x, next.x, move) : f.x
  const ang = (Math.atan2(logY(carX + 4) - logY(carX - 4), 8) * 180) / Math.PI
  return (
    <svg width={LP.w} height={LP.h} style={{ position: 'absolute', inset: 0 }}>
      <LoopRoad legend={[['┅ 기록 (사람)', C.green], ['━ 계획', C.blue]]} />
      {OPEN_FRAMES.map((fr, i) => {
        if (t < fr.at) return null
        const p = prog(t, fr.at + 0.15, 0.6)
        const ghost = i < k || (i === k && move > 0) ? 0.22 : 1
        return (
          <g key={i} opacity={ghost}>
            <polyline points={pts(planPts(fr.x, 0, p))} fill="none" stroke={C.blue} strokeWidth={4} strokeLinejoin="round" />
            {[1 / 3, 2 / 3, 1].map((u) => {
              const [x, y] = planFrom(fr.x, 0, u)
              return <line key={u} x1={x} x2={x} y1={logY(x)} y2={y} stroke={C.purple} strokeWidth={3} opacity={prog(t, fr.at + 0.8, 0.3) * (i === k && move === 0 ? 1 : 0)} />
            })}
          </g>
        )
      })}
      <Car x={carX} y={logY(carX)} angle={ang} color={C.blue} w={46} h={26} />
      <text x={44} y={LP.bot - 16} fill={C.muted} fontSize={20} fontFamily={MONO}>
        frame {k}
      </text>
    </svg>
  )
}

function ClosedLoop({ t }: { t: number }) {
  // the car drives its own plan; where it ends up is the next input
  let k = 0
  CLOSED_FRAMES.forEach((f, i) => {
    if (t >= f.at) k = i
  })
  const f = CLOSED_FRAMES[k]
  const carX = f.x + STEP * prog(t, f.at + 0.5, 0.7)
  const carY = closedY(carX)
  const ang = (Math.atan2(closedY(carX + 4) - closedY(carX - 4), 8) * 180) / Math.PI
  return (
    <svg width={LP.w} height={LP.h} style={{ position: 'absolute', inset: 0 }}>
      <LoopRoad legend={[['┅ 기록 (사람)', C.green], ['━ 내 차가 간 길', C.blue]]} />
      {CLOSED_FRAMES.map((fr, i) =>
        t >= fr.at ? <polyline key={i} points={pts(closedPts(fr.x, 260 * prog(t, fr.at + 0.05, 0.45)))} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="8 7" opacity={i === k ? 0.8 : 0.18} /> : null,
      )}
      {carX > 101 && <polyline points={pts(closedPts(100, carX - 100))} fill="none" stroke={C.blue} strokeWidth={5} strokeLinejoin="round" />}
      {CLOSED_FRAMES.map((fr, i) => {
        const p = prog(t, fr.at + 1.2, 0.2) * (1 - prog(t, fr.at + 1.4, 0.5))
        const x = fr.x + STEP
        return p > 0 ? <circle key={i} cx={x} cy={closedY(x)} r={22 + 18 * p} fill="none" stroke={C.accent} strokeWidth={3} opacity={p} /> : null
      })}
      <Car x={carX} y={carY} angle={ang} color={C.blue} w={46} h={26} />
      <text x={44} y={LP.bot - 16} fill={C.muted} fontSize={20} fontFamily={MONO}>
        frame {k}
      </text>
    </svg>
  )
}

function Loop() {
  const t = useSec()
  const bar = prog(t, 12.2, 1.2)
  const BW = 790
  const ego = prog(t, 17.4, 1.2)
  return (
    <AbsoluteFill>
      {/* open-loop */}
      <Panel x={64} y={140} w={LP.w} h={LP.h} style={{ opacity: prog(t, 0.2) }}>
        <OpenLoop t={t} />
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Label color={C.text} size={28} weight={600}>
            기록 재생
          </Label>
          <Label size={22} style={{ opacity: prog(t, 0.8) }}>
            frame 마다 계획을 기록과 비교
          </Label>
        </div>
        <Tag x={LP.w - 110} y={42} style={{ opacity: prog(t, 9.2) }}>
          <Label mono color={C.accent} size={30} weight={600}>
            open-loop
          </Label>
        </Tag>
        <div style={{ position: 'absolute', left: 30, top: 314, opacity: prog(t, 6.3) }}>
          <Label color={C.text} size={24}>
            차는 계획이 아니라 기록대로 움직이고, 계획은 비교만 한다
          </Label>
        </div>
      </Panel>

      {/* the straight-road shortcut */}
      <Panel x={994} y={140} w={862} h={LP.h} style={{ opacity: prog(t, 11.5) }}>
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Label color={C.text} size={28} weight={600}>
            Li 등, 2024 · nuScenes
          </Label>
          <Label mono size={20}>
            Is Ego Status All You Need?
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 36, top: 84, width: BW, height: 56, borderRadius: 10, background: C.grid, overflow: 'hidden' }}>
          <div style={{ width: (STRAIGHT / 100) * BW * bar, height: '100%', background: C.blue, opacity: 0.9 }} />
        </div>
        <div style={{ position: 'absolute', left: 56, top: 96, fontSize: 26, fontWeight: 700, color: C.bg, opacity: prog(t, 13.2) }}>직진 {STRAIGHT}%</div>
        <div style={{ position: 'absolute', left: 36 + (STRAIGHT / 100) * BW + 16, top: 100, fontSize: 22, color: C.muted, opacity: prog(t, 13.6) }}>나머지 {(100 - STRAIGHT).toFixed(1)}%</div>
        <div style={{ position: 'absolute', left: 36, top: 168, opacity: prog(t, 16.8) }}>
          <Label color={C.text} size={24} weight={600}>
            주변은 거의 보지 않고 내 차 속도만으로 경로를 늘이면
          </Label>
        </div>
        <svg width={862} height={LP.h} style={{ position: 'absolute', inset: 0 }}>
          <g opacity={prog(t, 16.9)}>
            <rect x={36} y={222} width={790} height={84} fill="#0e1628" />
            <line x1={36} x2={826} y1={222} y2={222} stroke={C.muted} strokeWidth={3} opacity={0.6} />
            <line x1={36} x2={826} y1={306} y2={306} stroke={C.muted} strokeWidth={3} opacity={0.6} />
          </g>
          <line x1={100} x2={lerp(100, 600, ego)} y1={264} y2={264} stroke={C.blue} strokeWidth={10} strokeLinecap="round" opacity={ego > 0 ? 0.9 : 0} />
          <g opacity={prog(t, 16.9)}>
            <line x1={100} x2={600} y1={264} y2={264} stroke={C.green} strokeWidth={4} strokeDasharray="12 9" />
            <Car x={76} y={264} color={C.blue} w={44} h={26} />
          </g>
          <text x={110} y={246} fill={C.blue} fontSize={20} fontWeight={600} opacity={prog(t, 18)}>
            ━ 내 차 속도로 곧게 늘인 경로
          </text>
          <text x={620} y={273} fill={C.green} fontSize={26} fontWeight={700} opacity={prog(t, 18.8)}>
            L2 작음 ✓
          </text>
          <text x={36} y={340} fill={C.muted} fontSize={22} opacity={prog(t, 19.4)}>
            입력은 내 차의 속도뿐인데도 사람의 경로와 거의 겹친다
          </text>
        </svg>
      </Panel>

      {/* closed-loop */}
      <Panel x={64} y={520} w={LP.w} h={LP.h} style={{ opacity: prog(t, 22) }}>
        {t >= 22 && <ClosedLoop t={t} />}
        <div style={{ position: 'absolute', left: 30, top: 22, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Label mono color={C.accent} size={30} weight={600}>
            closed-loop
          </Label>
          <Label size={22}>움직인 결과가 다음 입력으로 돌아온다</Label>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 314, opacity: prog(t, 23.6) }}>
          <Label color={C.text} size={24}>
            다음 frame 의 입력 = 내 차가 실제로 간 자리
          </Label>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 994, top: 520, width: 862 }}>
        <Misconception
          at={28.2}
          belief="nuScenes 의 L2 가 작으면 운전을 잘하는 것이다"
          fact={
            <>
              L2 는 기록 위에서 잰 <span style={{ whiteSpace: 'nowrap' }}>open-loop</span> 점수다. <span style={{ whiteSpace: 'nowrap' }}>closed-loop</span> simulation 이나 실차
              시험으로 확인해야 한다
            </>
          }
        />
      </div>
    </AbsoluteFill>
  )
}

function Answer() {
  const items = [
    { tag: 'modular ↔ end-to-end', color: C.orange, text: 'module 마다 시험할 수 있다 ↔ network 하나를 경로 loss 로 함께 학습한다', at: 1.2 },
    { tag: 'L2 · 충돌률', color: C.blue, text: '기록된 장면에서 사람의 경로와 비교한 open-loop 점수다', at: 3 },
    { tag: 'closed-loop', color: C.green, text: '움직인 결과가 다음 입력으로 돌아와야 운전 능력이 보인다', at: 6.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 170, display: 'grid', gap: 26, width: 1500 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            사람의 경로와 거의 같은 경로를 내면 운전을 잘하는 걸까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '26px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 38, fontWeight: 600 }}>{it.text}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Outro() {
  const papers = ['LIBERO-Plus', 'Is Ego Status All You Need?', 'OpenVLA', 'OpenVLA-OFT']
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT · SESSION 8–11
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontSize: 84, fontWeight: 700 }}>논문 4편을 평가 관점으로</div>
        </Appear>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {papers.map((p, i) => (
            <Appear key={p} at={1 + i * 0.3}>
              <div
                style={{
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: C.card,
                  border: `1.5px solid ${i === 1 ? C.accent : C.cardEdge}`,
                  fontFamily: MONO,
                  fontSize: 26,
                  color: i === 1 ? C.accent : C.text,
                }}
              >
                {p}
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={2.4} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: woolimi/robotics-roadmap · CC BY-NC-SA 4.0
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseStack = () => (
  <PauseWrite
    question="modular stack 의 장점 하나와 약점 하나는?"
    answer="module 마다 따로 시험하고 틀린 module 을 찾을 수 있다. 대신 앞 module 이 버린 정보(보행자의 몸 방향)는 뒤에서 쓸 수 없다"
  />
)

const PauseLoop = () => (
  <PauseWrite
    question="nuScenes 의 L2 가 작아도 운전을 잘한다고 할 수 없는 이유 두 가지는?"
    answer="기록된 장면에서 비교만 하는 open-loop 평가라 움직인 결과를 보지 않는다. 또 73.9% 가 직진이라 내 차 속도만으로도 L2 가 작다"
  />
)

export function DrivingStack() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        stack: Stack,
        'pause-stack': PauseStack,
        metrics: Metrics,
        loop: Loop,
        'pause-loop': PauseLoop,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
