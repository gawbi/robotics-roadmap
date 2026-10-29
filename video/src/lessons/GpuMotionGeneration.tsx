import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './gpu-motion-generation.narration.json'
import { script } from './gpu-motion-generation.script'

// Numbers follow lessons/gpu-motion-generation/README.md (see gpu-motion-generation.script.ts). The sphere-arm, the SDF
// grid and the MPC timeline are schematic (marked 모식도); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a row of a small table: cells laid out on a grid */
function TRow({ cells, widths, at, color = C.text, size = 23, monoCols = [], weight = 500 }: { cells: ReactNode[]; widths: number[]; at: number; color?: string; size?: number; monoCols?: number[]; weight?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: widths.map((w) => `${w}px`).join(' '), gap: 12, alignItems: 'center', opacity: prog(t, at) }}>
      {cells.map((c, i) => (
        <span key={i} style={{ fontSize: size, color, fontWeight: weight, whiteSpace: 'nowrap', fontFamily: monoCols.includes(i) ? MONO : undefined, lineHeight: 1.3 }}>
          {c}
        </span>
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
            MOTION · GPU MOTION GENERATION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 108, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, whiteSpace: 'nowrap' }}>GPU Motion Generation</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            cuRobo · <span style={{ color: C.accent }}>trajectory optimization</span> × seed 수십 개 · RTX 4090 평균 50 ms
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            경로 찾기와 다듬기를 나누지 않고, 비용 하나의 최적화 수십 개를 GPU 에서 동시에 푼다
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
          <Label size={24}>선반에서 물건을 꺼내는 7 관절 팔 · 사람이 상자를 밀어 넣으면 바뀐 장면에서 다시 계획해야 한다</Label>
          <Flow steps={['RRTConnect: 충돌 없는 경로 찾기', 'shortcut: 경로 펴기', 'TOTG: 시각 붙이기']} color={C.orange} at={0.6} last="→ 몇 초 · 그동안 상자는 또 움직인다" />
          <div style={{ display: 'flex', gap: 16, opacity: prog(t, 2.6) }}>
            <Chip at={2.6} color={C.red}>
              무작위 표본 → 요청마다 경로 모양이 다르다
            </Chip>
            <Chip at={3.2} color={C.red}>
              TOTG 의 시각에는 jerk 한계가 없다
            </Chip>
          </div>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          다시 계획해도 될 만큼 빠르고, <span style={{ color: C.accent }}>그대로 보내도 될 만큼 매끄러운 trajectory</span> 를 어떻게 얻을까?
        </div>
      </Appear>
      <Panel x={330} y={640} w={1260} h={240}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 5.6) }}>
          <Label size={22}>Franka Panda 계획 문제 2,600 개 · 평균 계획 시간 (cuRobo 논문 · 같은 PC)</Label>
          <Bar label="Tesseract · CPU" value={2950} max={3000} color={C.red} at={5.8} width={520} fmt="2.95" unit=" 초" labelW={300} />
          <Bar label="cuRobo · RTX 4090" value={50} max={3000} color={C.green} at={6.5} width={520} fmt="50" unit=" ms" labelW={300} />
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- S1: pipeline ----------

function Pipeline() {
  const t = useSec()
  const node = (x: number, y: number, w: number, title: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={92} rx={14} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 38} textAnchor="middle" fill={color} fontSize={25} fontWeight={700}>
        {title}
      </text>
      <text x={x + w / 2} y={y + 70} textAnchor="middle" fill={C.muted} fontSize={21}>
        {sub}
      </text>
    </g>
  )
  const arrow = (x1: number, y: number, x2: number, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={y} x2={x2 - 10} y2={y} stroke={color} strokeWidth={3} />
      <polygon points={`${x2},${y} ${x2 - 14},${y - 8} ${x2 - 14},${y + 8}`} fill={color} />
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1120} h={400}>
        <svg width={1120} height={400}>
          <text x={30} y={44} fill={C.orange} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            CPU 의 3 단계 pipeline (MoveIt 2 기본)
          </text>
          <text x={1090} y={44} textAnchor="end" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.3)}>
            Tesseract 평균 2.95 초
          </text>
          {node(30, 66, 300, 'RRTConnect', '충돌만 보고 경로 1 개', C.orange, 0.6)}
          {arrow(330, 112, 390, C.muted, 1.4)}
          {node(390, 66, 300, 'shortcut', '꼭짓점 줄이기 · 경로 근처만', C.orange, 1.6)}
          {arrow(690, 112, 750, C.muted, 2.4)}
          {node(750, 66, 340, 'TOTG', '속도·가속도 한계 안에서 시각 붙이기', C.orange, 2.6)}
          <text x={30} y={200} fill={C.red} fontSize={23} fontWeight={600} opacity={prog(t, 6.3)}>
            뒤 단계는 앞 단계의 결과를 고치기만 한다 · 앞 단계가 고른 길을 뒤 단계가 바꾸지 못한다
          </text>
          <text x={30} y={252} fill={C.green} fontSize={26} fontWeight={600} opacity={prog(t, 12.7)}>
            cuRobo 의 GPU motion generation
          </text>
          <text x={1090} y={252} textAnchor="end" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15.5)}>
            RTX 4090 평균 50 ms
          </text>
          {node(30, 274, 230, '충돌 없는 IK', 'seed 30 개를 함께', C.green, 13)}
          {arrow(260, 320, 300, C.muted, 13.5)}
          {node(300, 274, 250, 'trajectory seed', '12 개 (직선 · 경유)', C.green, 13.6)}
          {arrow(550, 320, 590, C.muted, 14.1)}
          {node(590, 274, 260, 'particle 2 회', '→ L-BFGS 로 마무리', C.green, 14.2)}
          {arrow(850, 320, 890, C.muted, 14.7)}
          {node(890, 274, 200, 'dt 재조정', 'jerk 비용 켜고 다시', C.green, 14.8)}
          <text x={30} y={392} fill={C.muted} fontSize={21} opacity={prog(t, 15.8)}>
            비용 하나로 묶고 seed 마다·자세마다·구마다 거리를 동시에 계산해 가장 좋은 trajectory 하나를 고른다
          </text>
        </svg>
      </Panel>
      <Box x={1216} y={140} w={640} h={400} at={6.1} title={<Head color={C.orange}>Motion Planning 의 2 관절 예시</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="RRT-Connect 경로" value={451.2} max={480} color={C.red} at={6.6} width={200} fmt="451.2" unit="°" labelW={200} />
          <Bar label="shortcut 뒤" value={370.7} max={480} color={C.orange} at={7.6} width={200} fmt="370.7" unit="°" labelW={200} />
          <Bar label="위쪽의 다른 길" value={240} max={480} color={C.green} at={8.6} width={200} fmt="약 240" unit="°" labelW={200} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 10) }}>shortcut 은 꼭짓점을 줄일 뿐 위쪽의 약 240° 길로는 옮기지 못한다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>TOTG 는 가속도를 0 과 최댓값 사이에서 한순간에 바꾼다 → jerk 제한 없음</span>
        </div>
      </Box>
      <Panel x={64} y={570} w={1792} h={310}>
        <svg width={1792} height={310}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 19.3)}>
            상자가 0.3 m/s 로 밀려 들어올 때, planner 가 계산하는 동안 상자가 움직인 거리
          </text>
          <g opacity={prog(t, 19.8)}>
            <text x={30} y={118} fill={C.red} fontSize={24} fontWeight={600}>
              Tesseract 2.95 초
            </text>
            <rect x={300} y={92} width={1000 * prog(t, 20, 1.2)} height={36} rx={8} fill={C.red} opacity={0.85} />
            <text x={1330} y={118} fill={C.red} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21)}>
              0.3 × 2.95 = 0.885 m
            </text>
          </g>
          <g opacity={prog(t, 22)}>
            <text x={30} y={188} fill={C.green} fontSize={24} fontWeight={600}>
              cuRobo 50 ms
            </text>
            <rect x={300} y={162} width={Math.max(4, 17 * prog(t, 22.2, 0.8))} height={36} rx={4} fill={C.green} />
            <text x={340} y={188} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 22.8)}>
              0.3 × 0.05 = 0.015 m
            </text>
          </g>
          <text x={30} y={262} fill={C.muted} fontSize={22} opacity={prog(t, 23.6)}>
            planner 는 계획을 시작할 때의 장면으로 계산한다 → 상자가 0.885 m 옮겨 간 뒤에 나온 결과는 지난 장면에 대한 답이다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- S1: the planar trajectory optimization example ----------

function TrajOpt() {
  const t = useSec()
  const S = 220 // px per metre
  const px = (x: number) => 70 + (x + 0.2) * S
  const py = (y: number) => 500 - y * S
  const path = (ys: number[]) => [0, 1, 2, 3, 4].map((x, i) => `${px(x)},${py([0, ...ys, 0][i])}`).join(' ')
  const cand: [string, number[], string, number, string][] = [
    ['직선 seed', [0, 0, 0], C.red, 13.2, '0, 0, 0'],
    ['B', [-0.1, -0.3, -0.1], C.green, 19.7, '−0.1, −0.3, −0.1'],
    ['C', [0.2, 0.9, 0.2], C.orange, 20.6, '0.2, 0.9, 0.2'],
  ]
  const legend: [string, string, number][] = [
    ['직선 seed (0, 0, 0): x = 2 에서 0.2 m 파고듦 → 충돌 비용 10 × 0.2 = 2.0', C.red, 13.4],
    ['B (−0.1, −0.3, −0.1): 0 + 0.10 = 0.10 · C (0.2, 0.9, 0.2): 0 + 1.06 = 1.06', C.text, 19.9],
    ['직선 seed 의 gradient +10 → y 를 줄이는 쪽(아래) · step 0.01: 0 − 0.01 × 10 = −0.1', C.accent, 22.6],
    ['y = 0.5 에서 출발한 seed 는 위로 밀려 비용 1.06 인 C 에서 멈춘다 = local minimum', C.orange, 26.5],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1080} h={740}>
        <svg width={1080} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 6.7)}>
            평면 예시 · 반지름 0.1 m 구가 (0, 0) 에서 (4, 0) 으로 · 가운데 waypoint 셋의 y 만 변수
          </text>
          <text x={30} y={78} fill={C.muted} fontSize={21} opacity={prog(t, 13.2)}>
            비용 = 충돌 (파고든 깊이 × 10) + 매끄러움 (이웃 y 차이² 의 합)
          </text>
          {legend.map(([s, c, at], i) => (
            <text key={s} x={30} y={118 + i * 32} fill={c} fontSize={21} fontWeight={600} opacity={prog(t, at)}>
              {s}
            </text>
          ))}
          {/* axes */}
          <g opacity={prog(t, 6.9)}>
            <line x1={px(-0.2)} x2={px(4.3)} y1={py(0)} y2={py(0)} stroke={C.dim} strokeWidth={1.5} />
            <line x1={px(0)} x2={px(0)} y1={py(-0.6)} y2={py(1.15)} stroke={C.dim} strokeWidth={1.5} />
            {[0, 1, 2, 3, 4].map((x) => (
              <text key={x} x={px(x)} y={py(-0.6) + 26} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {x}
              </text>
            ))}
            {[-0.5, 0.5, 1].map((y) => (
              <text key={y} x={px(0) - 14} y={py(y) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {y}
              </text>
            ))}
            <text x={px(4.3)} y={py(-0.6) + 26} textAnchor="end" fill={C.dim} fontSize={20}>
              x (m)
            </text>
            <text x={px(0) - 14} y={py(1.15) + 6} textAnchor="end" fill={C.dim} fontSize={20}>
              y (m)
            </text>
          </g>
          {/* obstacle */}
          <g opacity={prog(t, 7.4)}>
            <circle cx={px(2)} cy={py(0.3)} r={0.4 * S} fill={`${C.purple}33`} stroke={C.purple} strokeWidth={2.5} />
            <circle cx={px(2)} cy={py(0.3)} r={0.5 * S} fill="none" stroke={C.purple} strokeWidth={1.5} strokeDasharray="8 8" />
            <text x={px(2)} y={py(0.2)} textAnchor="middle" fill={C.purple} fontSize={22} fontWeight={600}>
              장애물
            </text>
            <text x={px(2)} y={py(0.08)} textAnchor="middle" fill={C.purple} fontSize={19}>
              (2, 0.3) · r 0.4
            </text>
            <text x={px(2.6)} y={py(0.72)} fill={C.purple} fontSize={19}>
              구 반지름만큼 키운 경계 0.5 m
            </text>
          </g>
          {/* start, goal */}
          <g opacity={prog(t, 7.2)}>
            <circle cx={px(0)} cy={py(0)} r={7} fill={C.text} />
            <text x={px(0) + 10} y={py(0) + 32} fill={C.text} fontSize={21}>
              출발
            </text>
            <circle cx={px(4)} cy={py(0)} r={7} fill={C.text} />
            <text x={px(4) - 10} y={py(0) + 32} textAnchor="end" fill={C.text} fontSize={21}>
              목표
            </text>
          </g>
          {/* candidates */}
          {cand.map(([name, ys, c, at]) => (
            <g key={name} opacity={prog(t, at)}>
              <polyline points={path(ys)} fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
              {[1, 2, 3].map((x, i) => (
                <circle key={x} cx={px(x)} cy={py(ys[i])} r={7} fill={c} />
              ))}
            </g>
          ))}
          {/* the sphere on the straight seed at x = 2 */}
          <g opacity={prog(t, 13.6)}>
            <circle cx={px(2)} cy={py(0)} r={0.1 * S} fill={`${C.red}44`} stroke={C.red} strokeWidth={2} />
            <rect x={px(2.16)} y={py(0) - 16} width={150} height={32} rx={6} fill={C.card} />
            <text x={px(2.2)} y={py(0) + 8} fill={C.red} fontSize={22} fontWeight={700}>
              직선 seed 2.0
            </text>
          </g>
          <text x={px(2)} y={py(-0.3) + 36} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={700} opacity={prog(t, 19.9)}>
            B 0.10
          </text>
          <text x={px(2.15)} y={py(0.9) - 2} fill={C.orange} fontSize={22} fontWeight={700} opacity={prog(t, 20.8)}>
            C 1.06
          </text>
          {/* gradient and the step */}
          <g opacity={prog(t, 22.4)}>
            <line x1={px(2) - 34} y1={py(-0.02)} x2={px(2) - 34} y2={py(-0.19)} stroke={C.accent} strokeWidth={4} />
            <polygon points={`${px(2) - 34},${py(-0.22)} ${px(2) - 43},${py(-0.17)} ${px(2) - 25},${py(-0.17)}`} fill={C.accent} />
            <text x={px(2) - 48} y={py(-0.12) + 7} textAnchor="end" fill={C.accent} fontSize={21} fontWeight={700}>
              +10
            </text>
          </g>
          <g opacity={prog(t, 24.2)}>
            <circle cx={px(2)} cy={py(-0.1)} r={8} fill="none" stroke={C.accent} strokeWidth={3} />
            <text x={px(2) + 16} y={py(-0.1) + 8} fill={C.accent} fontSize={20} fontFamily={MONO} fontWeight={600}>
              −0.1
            </text>
          </g>
          {/* the seed above the obstacle */}
          <g opacity={prog(t, 26.3)}>
            <circle cx={px(2)} cy={py(0.5)} r={8} fill={C.orange} stroke={C.text} strokeWidth={2} />
            <line x1={px(2)} y1={py(0.56)} x2={px(2)} y2={py(0.8)} stroke={C.orange} strokeWidth={4} />
            <polygon points={`${px(2)},${py(0.84)} ${px(2) - 9},${py(0.79)} ${px(2) + 9},${py(0.79)}`} fill={C.orange} />
            <text x={px(2) - 16} y={py(0.5) + 7} textAnchor="end" fill={C.orange} fontSize={20} fontWeight={700}>
              y = 0.5
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1176} y={140} w={680} h={170} at={0.5} title={<Head color={C.accent}>trajectory optimization</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 0.9) }}>trajectory = 숫자의 목록 → 조금씩 고쳐 비용을 줄인다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.4) }}>
          <span style={mono(C.accent, 22)}>32 × 7 = 224</span> 개 변수 · 제약은 weight 5000 의 비용으로
        </span>
      </Box>
      <Box x={1176} y={330} w={680} h={300} at={13} title={<Head color={C.accent}>후보의 비용 · 충돌 + 매끄러움</Head>} gap={10}>
        <TRow cells={['후보', '가운데 y 셋', '충돌', '매끄러움', '합']} widths={[100, 220, 80, 100, 50]} at={13.2} color={C.muted} size={21} />
        {cand.map(([name, , c, at, ys], i) => (
          <TRow key={name} cells={[name, ys, ['2.0', '0', '0'][i], ['0', '0.10', '1.06'][i], ['2.0', '0.10', '1.06'][i]]} widths={[100, 220, 80, 100, 50]} at={at + 0.2} color={c} size={22} monoCols={[1, 2, 3, 4]} weight={600} />
        ))}
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 13.6) }}>직선 seed 의 충돌 = 10 × 0.2 = 2.0 · B 의 매끄러움 = 0.01 + 0.04 + 0.04 + 0.01</span>
      </Box>
      <Box x={1176} y={650} w={680} h={230} at={22.2} title={<Head color={C.accent}>gradient 와 한 걸음</Head>} gap={8}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 22.5) }}>
          (2, 0) 은 중심에서 0.3 m → <span style={mono(C.text, 22)}>d = 0.3 − 0.5 = −0.2 m</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 23.2) }}>
          y 를 늘리면 더 파고듦 → gradient <span style={mono(C.accent, 22)}>+10</span> · step 0.01 → <span style={mono(C.accent, 22)}>y = −0.1</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 24.2) }}>
          첫째 waypoint 의 매끄러움 gradient <span style={mono(C.accent, 22)}>+0.2</span> → 이웃도 끌려온다
        </span>
        <span style={{ ...line(C.orange, 22), opacity: prog(t, 26.4) }}>seed 근처 골짜기로만 내려간다 → 길이 있어도 보장 없음</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: spheres and the SDF ----------

function Spheres() {
  const t = useSec()
  // a schematic arm: joints of a polyline, with spheres along each link
  const J: [number, number][] = [
    [430, 660],
    [430, 520],
    [330, 400],
    [430, 280],
    [580, 250],
    [690, 320],
    [730, 420],
  ]
  const R = [30, 26, 22, 20, 17, 14]
  const spheres: [number, number, number][] = []
  for (let i = 0; i < J.length - 1; i++) {
    const [x0, y0] = J[i]
    const [x1, y1] = J[i + 1]
    const n = 3
    for (let k = 0; k <= n; k++) {
      if (i > 0 && k === 0) continue
      spheres.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, R[i]])
    }
  }
  const obs = { x: 560, y: 480, w: 230, h: 150 }
  const tip = spheres[spheres.length - 1]
  const cells = 12
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            로봇을 구로 근사 · 거리 = 중심까지 거리 − 반지름
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.8)}>
            <rect x={370} y={660} width={120} height={28} rx={6} fill={C.cardEdge} />
            {J.slice(0, -1).map(([x0, y0], i) => (
              <line key={i} x1={x0} y1={y0} x2={J[i + 1][0]} y2={J[i + 1][1]} stroke={C.dim} strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
          {spheres.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} opacity={prog(t, 2.2 + i * 0.12, 0.4)} />
          ))}
          <text x={60} y={110} fill={C.blue} fontSize={23} fontWeight={600} opacity={prog(t, 6.2)}>
            Franka Panda (v0.7.8 설정)
          </text>
          <text x={60} y={142} fill={C.blue} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.4)}>
            구 61 개 · 반지름 1.1 ~ 6 cm
          </text>
          <text x={60} y={172} fill={C.muted} fontSize={20} opacity={prog(t, 6.8)}>
            (손에 든 물체용 4 개를 더하면 65 개)
          </text>
          {/* obstacle and a distance */}
          <g opacity={prog(t, 8.2)}>
            <rect x={obs.x} y={obs.y} width={obs.w} height={obs.h} rx={10} fill={`${C.purple}33`} stroke={C.purple} strokeWidth={2.5} />
            <text x={obs.x + obs.w / 2} y={obs.y + obs.h / 2 + 8} textAnchor="middle" fill={C.purple} fontSize={22} fontWeight={600}>
              장애물
            </text>
            <line x1={tip[0]} y1={tip[1]} x2={tip[0]} y2={obs.y} stroke={C.orange} strokeWidth={3} strokeDasharray="6 6" />
            <circle cx={tip[0]} cy={tip[1]} r={4} fill={C.orange} />
            <text x={tip[0] + 14} y={(tip[1] + obs.y) / 2 + 8} fill={C.orange} fontSize={21} fontWeight={600}>
              중심 → 표면
            </text>
            <text x={520} y={698} fill={C.orange} fontSize={22} fontWeight={600}>
              구–장애물: 중심까지 거리 − r
            </text>
          </g>
          {/* self collision */}
          <g opacity={prog(t, 9.6)}>
            <line x1={spheres[4][0]} y1={spheres[4][1]} x2={spheres[13][0]} y2={spheres[13][1]} stroke={C.green} strokeWidth={3} strokeDasharray="6 6" />
            <text x={60} y={236} fill={C.green} fontSize={22} fontWeight={600}>
              구–구 (자기 충돌): 중심 거리 − r₁ − r₂
            </text>
            <text x={60} y={266} fill={C.muted} fontSize={20}>
              이웃 link · 닿을 수 없는 쌍을 빼면
            </text>
            <text x={60} y={294} fill={C.muted} fontSize={20}>
              검사할 구 쌍이 절반 정도로 준다
            </text>
          </g>
          <text x={30} y={728} fill={C.dim} fontSize={20} opacity={prog(t, 1)}>
            충돌 비용과 gradient 를 1 초에 수백만 번 계산하려면 거리 계산이 단순해야 한다
          </text>
        </svg>
      </Panel>
      <Panel x={956} y={140} w={900} h={350}>
        <svg width={900} height={350}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12.2)}>
            signed distance field (SDF) · 칸마다 가장 가까운 표면까지의 거리
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 12.2)}>
            모식도
          </text>
          {/* a strip of voxels: a wall on the right, distances growing to the left */}
          {Array.from({ length: cells }, (_, i) => {
            const d = (8 - i) * 0.02 // metres from the wall, negative inside
            const inside = d < 0
            const a = inside ? 0.55 : Math.max(0.12, 0.6 - d * 3)
            const w = 64
            return (
              <g key={i} opacity={prog(t, 12.6 + i * 0.08, 0.4)}>
                <rect x={30 + i * w} y={80} width={w - 3} height={120} rx={6} fill={inside ? C.red : C.blue} opacity={a} />
                <text x={30 + i * w + (w - 3) / 2} y={148} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={700}>
                  {inside ? '−' : d === 0 ? '0' : '+'}
                </text>
              </g>
            )
          })}
          <line x1={30 + 8 * 64 - 2} y1={70} x2={30 + 8 * 64 - 2} y2={210} stroke={C.text} strokeWidth={4} opacity={prog(t, 12.8)} />
          <text x={30 + 8 * 64 + 8} y={228} fill={C.text} fontSize={20} opacity={prog(t, 12.8)}>
            표면 (장애물 안 →)
          </text>
          <g opacity={prog(t, 14.6)}>
            <line x1={430} y1={250} x2={180} y2={250} stroke={C.accent} strokeWidth={4} />
            <polygon points="166,250 184,241 184,259" fill={C.accent} />
            <text x={30} y={290} fill={C.accent} fontSize={22} fontWeight={600}>
              gradient: 이웃 칸과 비교하면 거리가 늘어나는 방향
            </text>
          </g>
          <text x={30} y={326} fill={C.muted} fontSize={21} opacity={prog(t, 13.8)}>
            구 중심이 든 칸을 읽으면 거리 · 밖은 +, 안은 − · 공간을 정육면체 칸(voxel)으로 나눈 표
          </text>
        </svg>
      </Panel>
      <Box x={956} y={520} w={900} h={360} at={18.7} title={<Head color={C.accent}>nvblox · depth camera 장면을 ESDF 로</Head>}>
        <Flow steps={['depth image', 'TSDF: 표면 근처 칸만 갱신', 'ESDF: 바뀐 block 만 GPU 에서']} color={C.blue} at={19} gap={0.5} />
        <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
          <Bar label="nvblox · RTX 3090 Ti" value={1.9} max={64} color={C.green} at={21.4} width={300} fmt="1.9" unit=" ms" labelW={230} />
          <Bar label="voxblox · CPU" value={58} max={64} color={C.red} at={22.4} width={300} fmt="58" unit=" ms" sub="58 ÷ 1.9 ≈ 31 배" labelW={230} />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24) }}>ESDF 갱신 시간의 평균 (nvblox 논문) · 1 cm 보다 작은 voxel 은 GPU memory 를 빠르게 채운다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: activation distance ----------

function Activation() {
  const t = useSec()
  const ETA = 0.025
  const X0 = 120
  const X1 = 940
  const Y0 = 620
  const Y1 = 130
  const dx = (d: number) => X0 + ((d + 0.03) / 0.1) * (X1 - X0)
  const cy = (c: number) => Y0 - (c / 0.04) * (Y0 - Y1)
  const cost = (d: number) => (d >= ETA ? 0 : d >= 0 ? (ETA - d) ** 2 / (2 * ETA) : -d + ETA / 2)
  const pts: string[] = []
  for (let d = -0.0275; d <= 0.07; d += 0.0005) pts.push(`${dx(d)},${cy(cost(d))}`)
  const marks: [number, number, string, string, number][] = [
    [0.06, 0, '0.06, 비용 0', C.green, 6.6],
    [0.01, 0.0045, '0.01, 비용 0.0045', C.orange, 12.8],
    [-0.02, 0.0325, '−0.02, 비용 0.0325', C.red, 14.6],
  ]
  const rows: [string, string, string, string, string, number][] = [
    ['0.12 m', '0.06 m', '0', '0', C.green, 6.6],
    ['0.07 m', '0.01 m', '0.0045', '−0.6', C.orange, 12.8],
    ['0.04 m', '−0.02 m', '0.0325', '−1', C.red, 14.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            충돌 비용 c(d) · activation distance η = 0.025 m
          </text>
          <text x={30} y={76} fill={C.muted} fontSize={21} opacity={prog(t, 0.8)}>
            표면 바로 밖에서도 비용을 줘서, 촘촘히 보간한 사이 자세가 표면 안으로 미끄러지는 것을 막는다
          </text>
          {/* axes */}
          <g opacity={prog(t, 1.2)}>
            <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={C.dim} strokeWidth={1.5} />
            <line x1={dx(-0.03)} x2={dx(-0.03)} y1={Y0} y2={Y1 - 10} stroke={C.dim} strokeWidth={1.5} />
            {[-0.02, 0, 0.02, 0.04, 0.06].map((d) => (
              <text key={d} x={dx(d)} y={Y0 + 28} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {d < 0 ? `−${-d}` : d}
              </text>
            ))}
            {[0.01, 0.02, 0.03, 0.04].map((c) => (
              <text key={c} x={X0 - 10} y={cy(c) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {c}
              </text>
            ))}
            <text x={X1} y={Y0 + 56} textAnchor="end" fill={C.dim} fontSize={20}>
              표면까지 거리 d (m) · 파고들면 음수
            </text>
            <text x={X0 - 10} y={Y1 - 20} textAnchor="end" fill={C.dim} fontSize={20}>
              비용
            </text>
          </g>
          {/* surface and eta */}
          <g opacity={prog(t, 2)}>
            <line x1={dx(0)} x2={dx(0)} y1={Y0} y2={Y1} stroke={C.text} strokeWidth={2} strokeDasharray="8 8" />
            <text x={dx(0) + 8} y={Y1 + 10} fill={C.text} fontSize={21} fontWeight={600}>
              표면
            </text>
            <line x1={dx(ETA)} x2={dx(ETA)} y1={Y0} y2={Y1} stroke={C.accent} strokeWidth={2} strokeDasharray="8 8" />
            <text x={dx(ETA) + 8} y={Y1 + 10} fill={C.accent} fontSize={21} fontWeight={600}>
              η = 0.025
            </text>
            <rect x={dx(0)} y={Y1} width={dx(ETA) - dx(0)} height={Y0 - Y1} fill={`${C.accent}10`} />
          </g>
          <polyline points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, 2.6)} />
          {marks.map(([d, c, l, col, at], i) => (
            <g key={l} opacity={prog(t, at)}>
              <circle cx={dx(d)} cy={cy(c)} r={10} fill={col} />
              <text x={i === 0 ? dx(d) : dx(d) + 18} y={i === 0 ? cy(c) - 18 : cy(c) + 8} textAnchor={i === 0 ? 'middle' : 'start'} fill={col} fontSize={22} fontWeight={600} fontFamily={MONO}>
                d {l}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 19.3)}>
            <text x={600} y={290} fill={C.red} fontSize={21} fontWeight={600}>
              d &lt; 0 (파고듦): −d + η ÷ 2 · 기울기 −1
            </text>
            <text x={600} y={324} fill={C.orange} fontSize={21} fontWeight={600}>
              0 ≤ d &lt; η: (η − d)² ÷ (2η) · 기울기 −0.6
            </text>
            <text x={600} y={358} fill={C.green} fontSize={21} fontWeight={600}>
              d ≥ η: 비용 0 · 기울기 0
            </text>
          </g>
          <text x={30} y={700} fill={C.muted} fontSize={21} opacity={prog(t, 20.5)}>
            기울기가 − 라서 d 를 늘리는 쪽 (ESDF gradient 방향) 으로 옮기면 비용이 준다 · 파고들어도 힘은 일정
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={6.2} title={<Head color={C.accent}>반지름 0.06 m 구 세 개</Head>} gap={10}>
        <TRow cells={['중심의 ESDF 값', 'd = ESDF − 0.06', '비용', '기울기']} widths={[180, 200, 120, 100]} at={6.4} color={C.muted} size={21} />
        {rows.map(([e, d, c, g, col, at]) => (
          <TRow key={e} cells={[e, d, c, g]} widths={[180, 200, 120, 100]} at={at} color={col} size={23} monoCols={[0, 1, 2, 3]} weight={600} />
        ))}
        <span style={{ ...mono(C.orange, 21), opacity: prog(t, 13.2) }}>0.0045 = (0.025 − 0.01)² ÷ (2 × 0.025)</span>
        <span style={{ ...mono(C.red, 21), opacity: prog(t, 15) }}>0.0325 = 0.02 + 0.025 ÷ 2</span>
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={25.2} title={<Head color={C.accent}>η 가 올린 성공률 · seed 하나 · L-BFGS 만</Head>} gap={10}>
        <Bar label="η = 0" value={38} max={100} color={C.red} at={25.5} width={220} unit="%" labelW={310} />
        <Bar label="η = 2.5 cm" value={65} max={100} color={C.green} at={26.3} width={220} unit="%" labelW={310} />
        <Bar label="+ continuous collision check" value={69} max={100} color={C.green} at={27.2} width={220} unit="%" labelW={310} />
        <Bar label="+ speed metric" value={71} max={100} color={C.green} at={28} width={220} unit="%" labelW={310} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 28.8) }}>실제 로봇은 구를 일부러 키운다: Franka 의 collision_sphere_buffer 0.004 m · UR10e 의 buffer_distance 0.01 m</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S3: seeds, particle optimization, L-BFGS ----------

function Seeds() {
  const t = useSec()
  const table: [string, number, number, number][] = [
    ['1', 77, 25, 0.8],
    ['12', 84, 27, 1.3],
    ['48', 87, 36, 1.8],
    ['128', 88, 66, 2.3],
    ['graph 경로 12', 96, 116, 2.8],
  ]
  // particle panel
  const PX0 = 90
  const PX1 = 820
  const py0 = 315
  const yx = (y: number) => PX0 + ((y + 0.3) / 0.6) * (PX1 - PX0)
  const parts: [number, string, string, string][] = [
    [-0.2, '0.08', '0.86', C.green],
    [0, '2.0', '0.13', C.orange],
    [0.2, '4.08', '0.02', C.red],
  ]
  // L-BFGS panel
  const LX0 = 80
  const LX1 = 800
  const LY0 = 330
  const LY1 = 110
  const lx = (x: number) => LX0 + (x / 4.5) * (LX1 - LX0)
  const ly = (c: number) => LY0 - (c / 10) * (LY0 - LY1)
  const para: string[] = []
  for (let x = 0; x <= 4.5; x += 0.05) para.push(`${lx(x)},${ly((x - 3) ** 2)}`)
  const gd = [0, 0.6, 1.08]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={300} at={0.3} title={<Head color={C.accent}>trajectory seed 수 · Panda 문제 2,600 개를 한 번씩</Head>} gap={6}>
        <TRow cells={['seed', '성공률', '평균 계획 시간']} widths={[200, 240, 260]} at={0.5} color={C.muted} size={21} />
        {table.map(([s, ok, ms, at]) => (
          <div key={s} style={{ display: 'grid', gridTemplateColumns: '200px 240px 260px', gap: 12, alignItems: 'center', opacity: prog(t, at) }}>
            <span style={mono(C.text, 23)}>{s}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 150, height: 20, borderRadius: 6, background: C.grid }}>
                <div style={{ width: `${ok * prog(t, at, 0.8)}%`, height: '100%', borderRadius: 6, background: C.green }} />
              </div>
              <span style={mono(C.green, 22)}>{ok}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 150, height: 20, borderRadius: 6, background: C.grid }}>
                <div style={{ width: `${(ms / 120) * 100 * prog(t, at, 0.8)}%`, height: '100%', borderRadius: 6, background: C.orange }} />
              </div>
              <span style={mono(C.orange, 22)}>{ms} ms</span>
            </div>
          </div>
        ))}
      </Box>
      <Box x={976} y={140} w={880} h={300} at={0.6} title={<Head color={C.accent}>seed 근처의 해만 찾는다 → seed 를 여럿</Head>} gap={10}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 1) }}>
          TrajOpt · PR2 팔 문제 198 개: 직선 seed 1 개 <span style={mono(C.red, 22)}>84.3%</span> (0.206 초) → seed 4 개 <span style={mono(C.green, 22)}>99.0%</span> (0.307 초) · CHOMP 67.7% → 83.3%
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 6.3) }}>
          GPU 는 seed·자세·구마다 동시에: <span style={mono(C.accent, 22)}>12 × 32 × 65 = 24,960</span> 번 거리 조회
        </span>
        <Flow steps={['IK seed 30 → seed 12 개', 'particle × 2', 'L-BFGS', '최선 고르기']} color={C.green} at={12.8} gap={0.4} />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 15) }}>점수: 목표 오차 · 최대 jerk · 이동 시간 · 세 번 실패하면 graph planner 의 경로를 seed 로</span>
      </Box>
      <Panel x={64} y={465} w={880} h={415}>
        <svg width={880} height={415}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 19.2)}>
            particle 최적화 · 직선 seed 의 가운데 y 를 흔든 후보 셋 (β = 1)
          </text>
          <line x1={PX0} x2={PX1} y1={py0} y2={py0} stroke={C.dim} strokeWidth={1.5} opacity={prog(t, 19.4)} />
          {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((y) => (
            <text key={y} x={yx(y)} y={py0 + 26} textAnchor="middle" fill={C.dim} fontSize={19} fontFamily={MONO} opacity={prog(t, 19.4)}>
              {y < 0 ? `−${-y}` : y}
            </text>
          ))}
          {parts.map(([y, c, w, col], i) => {
            const h = Number(w) * 165 * prog(t, 19.8 + i * 0.4, 0.8)
            return (
              <g key={y}>
                <rect x={yx(y) - 36} y={py0 - h} width={72} height={h} rx={6} fill={col} opacity={0.8} />
                <text x={yx(y)} y={py0 - h - 40} textAnchor="middle" fill={col} fontSize={21} fontWeight={600} opacity={prog(t, 20 + i * 0.4)}>
                  비용 {c}
                </text>
                <text x={yx(y)} y={py0 - h - 14} textAnchor="middle" fill={col} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 20 + i * 0.4)}>
                  weight {w}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 22)}>
            <line x1={yx(0)} y1={py0 + 54} x2={yx(-0.17)} y2={py0 + 54} stroke={C.accent} strokeWidth={4} />
            <polygon points={`${yx(-0.17) - 2},${py0 + 54} ${yx(-0.17) + 14},${py0 + 46} ${yx(-0.17) + 14},${py0 + 62}`} fill={C.accent} />
            <text x={yx(0) + 10} y={py0 + 60} fill={C.muted} fontSize={20}>
              전: 0
            </text>
            <text x={yx(-0.17) - 10} y={py0 + 60} textAnchor="end" fill={C.accent} fontSize={20} fontWeight={600}>
              후: −0.17
            </text>
          </g>
          <text x={30} y={78} fill={C.muted} fontSize={20} opacity={prog(t, 19.6)}>
            weight ∝ exp(−(비용 − 0.08) ÷ 1) = 1, 0.147, 0.018 → 합 1.165 로 나눔
          </text>
          <text x={30} y={400} fill={C.accent} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 22.4)}>
            새 y = 0.86 × (−0.2) + 0.13 × 0 + 0.02 × 0.2 ≈ −0.17
          </text>
          <text x={30} y={106} fill={C.muted} fontSize={20} opacity={prog(t, 23.6)}>
            particle 2 회에 +2 ms · 성공률 71 → 76% (seed 1 개) · 82 → 85% (seed 여럿)
          </text>
        </svg>
      </Panel>
      <Panel x={976} y={465} w={880} h={415}>
        <svg width={880} height={415}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 25.7)}>
            L-BFGS · 비용 (x − 3)² 에서 한 걸음
          </text>
          <g opacity={prog(t, 25.9)}>
            <line x1={LX0} x2={LX1} y1={LY0} y2={LY0} stroke={C.dim} strokeWidth={1.5} />
            {[0, 1, 2, 3, 4].map((x) => (
              <text key={x} x={lx(x)} y={LY0 + 26} textAnchor="middle" fill={C.dim} fontSize={19} fontFamily={MONO}>
                {x}
              </text>
            ))}
            <polyline points={para.join(' ')} fill="none" stroke={C.dim} strokeWidth={3} />
          </g>
          {gd.map((x, i) => (
            <g key={x} opacity={prog(t, 26.4 + i * 0.5)}>
              <circle cx={lx(x)} cy={ly((x - 3) ** 2)} r={9} fill={C.red} />
              {i > 0 && <line x1={lx(gd[i - 1])} y1={ly((gd[i - 1] - 3) ** 2)} x2={lx(x)} y2={ly((x - 3) ** 2)} stroke={C.red} strokeWidth={3} />}
            </g>
          ))}
          <text x={lx(0) - 8} y={ly(9) - 16} fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, 26.6)}>
            x = 0, gradient −6
          </text>
          <text x={lx(1.08) + 16} y={ly(3.69) - 10} fill={C.red} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, 27.4)}>
            0 → 0.6 → 1.08
          </text>
          <text x={lx(1.08) + 16} y={ly(3.69) + 16} fill={C.red} fontSize={19} opacity={prog(t, 27.4)}>
            배율 0.1 의 gradient descent · 남은 거리 3 → 2.4 → 1.92
          </text>
          <g opacity={prog(t, 28.6)}>
            <line x1={lx(0.6)} y1={ly(5.76)} x2={lx(3)} y2={ly(0)} stroke={C.green} strokeWidth={4} />
            <circle cx={lx(3)} cy={ly(0)} r={10} fill={C.green} />
            <text x={lx(3)} y={ly(0) - 20} textAnchor="middle" fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              x = 3.0 한 번에
            </text>
            <text x={30} y={380} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
              s = 0.6 · y = (−4.8) − (−6) = 1.2 → 휜 정도 1.2 ÷ 0.6 = 2
            </text>
            <text x={30} y={406} fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
              걸음 4.8 × 0.6 ÷ 1.2 = 2.4 → x = 0.6 + 2.4 = 3.0 한 번에
            </text>
          </g>
          <text x={850} y={78} textAnchor="end" fill={C.muted} fontSize={20} opacity={prog(t, 30.2)}>
            같은 28 ms: gradient descent 61% · L-BFGS 85%
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- S3: dt and the benchmark ----------

function Dt() {
  const t = useSec()
  const rows: [string, string, string, string, number][] = [
    ['속도', '0.4 rad/s', '2 rad/s', '0.4 ÷ s ≤ 2 → s ≥ 0.2', 6.6],
    ['가속도', '0.5 rad/s²', '15 rad/s²', '0.5 ÷ s² ≤ 15 → s ≥ 0.183', 7.6],
    ['jerk', '2 rad/s³', '500 rad/s³', '2 ÷ s³ ≤ 500 → s ≥ 0.159', 8.6],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={760} h={310} at={0.3} title={<Head color={C.accent}>자세 32 개 사이의 간격 dt</Head>} gap={12}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 0.6) }}>같은 자세 목록에서 dt 를 절반으로 줄이면</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Chip at={1} color={C.blue} mono>
            속도 × 2
          </Chip>
          <Chip at={1.4} color={C.orange} mono>
            가속도 × 4
          </Chip>
          <Chip at={1.8} color={C.red} mono>
            jerk × 8
          </Chip>
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 3.2) }}>짧은 이동과 긴 이동을 같은 weight 로 풀기 어려워 dt 를 따로 찾는다</span>
        <span style={{ ...line(C.green, 21), opacity: prog(t, 3.8) }}>순서: dt = 0.25 초 (31 구간 = 7.75 초) 로 최적화 → 한계에 닿을 때까지 dt 줄이기 → jerk 비용 켜고 다시 최적화 → dt 다시 맞춤</span>
      </Box>
      <Box x={856} y={140} w={1000} h={310} at={6.2} title={<Head color={C.accent}>예시 · 첫 최적화 결과를 dt 배율 s 로 줄이면</Head>} gap={8}>
        <TRow cells={['양', 'dt = 0.25 초일 때', '한계', '한계 안에 들 조건']} widths={[90, 190, 170, 400]} at={6.4} color={C.muted} size={21} />
        {rows.map(([n, v, l, c, at]) => (
          <TRow key={n} cells={[n, v, l, c]} widths={[90, 190, 170, 400]} at={at} color={C.text} size={22} monoCols={[1, 2, 3]} weight={600} />
        ))}
        <span style={{ ...mono(C.green, 23), opacity: prog(t, 12.7) }}>s = 0.2 → dt = 0.25 × 0.2 = 0.05 초 · 이동 시간 31 × 0.05 = 1.55 초</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 14.6) }}>
          속도 2 rad/s (한계) · 가속도 <span style={mono(C.muted, 21)}>0.5 ÷ 0.04 = 12.5</span> · jerk <span style={mono(C.muted, 21)}>2 ÷ 0.008 = 250</span> → 한계 안 · 먼저 닿는 양이 시간을 정한다
        </span>
      </Box>
      <Box x={64} y={475} w={880} h={405} at={19.2} title={<Head color={C.accent}>평균 이동 시간과 최대 jerk · Panda 문제 2,600 개</Head>} gap={10}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <Label size={21}>평균 이동 시간 (초)</Label>
            <Bar label="Tesseract" value={1.96} max={2.2} color={C.muted} at={19.5} width={130} fmt="1.96" labelW={150} />
            <Bar label="Tesseract-TG" value={1.25} max={2.2} color={C.orange} at={20} width={130} fmt="1.25" labelW={150} />
            <Bar label="cuRobo" value={1.59} max={2.2} color={C.green} at={20.5} width={130} fmt="1.59" labelW={150} />
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <Label size={21}>평균 최대 jerk (rad/s³)</Label>
            <Bar label="Tesseract" value={200} max={660} color={C.muted} at={19.5} width={130} fmt="200" labelW={150} />
            <Bar label="Tesseract-TG" value={602} max={660} color={C.red} at={20} width={130} fmt="602" labelW={150} />
            <Bar label="cuRobo" value={49} max={660} color={C.green} at={20.5} width={130} fmt="49" labelW={150} />
          </div>
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 22.4) }}>
          TOTG 로 시각을 다시 붙인 Tesseract-TG 는 <span style={mono(C.orange, 22)}>1.59 − 1.25 = 0.34</span> 초 빨리 끝나지만 최대 jerk 는 <span style={mono(C.red, 22)}>602 ÷ 49 ≈ 12</span> 배
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24) }}>UR10 에서 jerk 까지 줄인 trajectory 의 평균 관절 오차 0.00133 rad · 가속도만 줄이면 0.00250 rad (encoder 정확도 0.0017 rad)</span>
      </Box>
      <Box x={976} y={475} w={880} h={405} at={25.7} title={<Head color={C.accent}>벤치마크 조건과 꼬리</Head>} gap={10}>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 25.9) }}>Panda 문제 2,600 개 · 장면 12 종류 · 60 초 제한 · 성공: 위치 오차 5 mm, 방향 5% 안</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.4) }}>한 PC: Ryzen 9 7950X 의 Tesseract 대 RTX 4090 의 cuRobo · warm-up 뒤 GPU 동기화</span>
        <Bar label="평균" value={50} max={280} color={C.green} at={27} width={260} fmt="50" unit=" ms" labelW={170} />
        <Bar label="75번째 백분위" value={30} max={280} color={C.green} at={27.6} width={260} fmt="30" unit=" ms" labelW={170} />
        <Bar label="98번째 백분위" value={260} max={280} color={C.red} at={28.2} width={260} fmt="260" unit=" ms" sub="세 번 실패한 문제" labelW={170} />
        <span style={{ ...line(C.text, 21), opacity: prog(t, 29.4) }}>Jetson AGX Orin 15 W: 평균 0.48 초 · 98번째 3.3 초 → 주기는 평균이 아니라 꼬리로</span>
        <span style={{ ...line(C.orange, 21), opacity: prog(t, 30.4) }}>SIMD 로 다시 짠 CPU RRTConnect (VAMP): 중앙값 40 µs · 배율은 비교 대상에 따라 다르다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: MPC ----------

function Mpc() {
  const t = useSec()
  const X0 = 250
  const X1 = 1720
  const tx = (s: number) => X0 + (s / 1.7) * (X1 - X0)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={340}>
        <svg width={1792} height={340}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            계획 한 번과 MPC · 0.3 m/s 로 움직이는 상자
          </text>
          <text x={1762} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={X0} x2={X1} y1={300} y2={300} stroke={C.dim} strokeWidth={1.5} />
            {[0, 0.5, 1, 1.5].map((s) => (
              <text key={s} x={tx(s)} y={326} textAnchor="middle" fill={C.dim} fontSize={19} fontFamily={MONO}>
                {s} s
              </text>
            ))}
          </g>
          {/* one-shot plan */}
          <g opacity={prog(t, 0.6)}>
            <text x={30} y={118} fill={C.orange} fontSize={24} fontWeight={600}>
              계획 한 번
            </text>
            <rect x={tx(0)} y={90} width={tx(0.05) - tx(0)} height={44} rx={6} fill={C.orange} />
            <text x={tx(0)} y={78} fill={C.orange} fontSize={19} fontFamily={MONO}>
              계획 50 ms
            </text>
            <rect x={tx(0.05)} y={90} width={(tx(1.64) - tx(0.05)) * prog(t, 1, 1.6)} height={44} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} />
            <text x={tx(0.85)} y={118} textAnchor="middle" fill={C.text} fontSize={21} fontWeight={600} opacity={prog(t, 1.8)}>
              1.59 초 실행 · 장면을 다시 보지 않는다
            </text>
            <text x={tx(0.85)} y={162} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 3)}>
              실행 중 상자 이동 0.3 × 1.59 ≈ 0.48 m
            </text>
          </g>
          {/* MPC */}
          <g opacity={prog(t, 6.3)}>
            <text x={30} y={238} fill={C.green} fontSize={24} fontWeight={600}>
              MPC
            </text>
            {Array.from({ length: 55 }, (_, i) => (
              <rect key={i} x={tx(i * 0.03)} y={212} width={Math.max(3, tx(0.03) - tx(0) - 4)} height={40} rx={3} fill={C.green} opacity={0.75 * prog(t, 6.6 + i * 0.06, 0.3)} />
            ))}
            <text x={tx(0.85)} y={282} textAnchor="middle" fill={C.text} fontSize={21} fontWeight={600} opacity={prog(t, 8)}>
              0.03 초마다 장면을 읽고 horizon 을 다시 최적화해 첫 명령만 보낸다
            </text>
            <text x={X1} y={198} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.4)}>
              명령 사이 상자 이동 0.3 × 0.03 = 0.009 m (9 mm)
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={505} w={880} h={375} at={6.2} title={<Head color={C.green}>MPC · model predictive control</Head>} gap={12}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 6.5) }}>짧은 앞날(horizon)의 명령을 매 주기 새로 최적화하고 그 가운데 첫 명령만 보낸다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 9) }}>cuRobo 의 MPC 는 MPPI: 지금 명령 순서에 noise 를 더한 후보를 GPU 에서 수백 개 만들어 비용으로 가중 평균 (particle 최적화)</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Chip at={12.8} color={C.green} mono>
            horizon 30 step
          </Chip>
          <Chip at={13.2} color={C.green} mono>
            후보 400 개
          </Chip>
          <Chip at={13.6} color={C.green} mono>
            주기마다 5 번 반복
          </Chip>
          <Chip at={14} color={C.muted}>
            v0.7.8 설정
          </Chip>
        </div>
        <Bar label="cuRobo MPC · RTX 4090" value={500} max={560} color={C.green} at={15} width={280} fmt="500" unit=" 번/초" labelW={300} />
        <Bar label="STORM (2021 · GPU MPPI)" value={125} max={560} color={C.muted} at={15.8} width={280} fmt="125" unit=" 번/초" labelW={300} />
      </Box>
      <Box x={976} y={505} w={880} h={375} at={19.4} title={<Head color={C.red}>MPC 가 내주는 것</Head>} gap={12}>
        {[
          ['✕', C.red, '움직임의 질: 무작위로 뽑은 몇 개의 가속도 후보에서 최적화 → trajectory optimization 보다 덜 좋은 움직임', 19.6],
          ['✕', C.red, '안전 보장: 문서는 이 기능이 실험 단계라 안전을 보장하지 않는다고 적는다', 20.8],
          ['✕', C.red, '짧은 horizon 만 보므로 크게 돌아가야 하는 목표에서는 local minimum 에 갇힐 수 있다', 22],
          ['✓', C.green, '나누기: 큰 이동은 motion generation 으로 계획하고, 장면이 계속 바뀌는 짧은 구간에만 MPC', 23.6],
        ].map(([m, c, s, at]) => (
          <div key={s as string} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: prog(t, at as number) }}>
            <span style={{ color: c as string, fontSize: 26, fontWeight: 700, lineHeight: '32px' }}>{m as string}</span>
            <span style={line(C.text, 22)}>{s as string}</span>
          </div>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: MoveIt 2 and cuMotion ----------

function CuMotion() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string[], sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      {title.map((s, i) => (
        <text key={s} x={x + w / 2} y={y + 34 + i * 28} textAnchor="middle" fill={color} fontSize={23} fontWeight={700} fontFamily={MONO}>
          {s}
        </text>
      ))}
      <text x={x + w / 2} y={y + h - 16} textAnchor="middle" fill={C.muted} fontSize={20}>
        {sub}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, at: number, label?: string, ly = -12) => {
    const ang = Math.atan2(y2 - y1, x2 - x1)
    const hx = x2 - 14 * Math.cos(ang)
    const hy = y2 - 14 * Math.sin(ang)
    return (
      <g opacity={prog(t, at)}>
        <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={3} />
        <polygon points={`${x2},${y2} ${hx - 8 * Math.sin(ang)},${hy + 8 * Math.cos(ang)} ${hx + 8 * Math.sin(ang)},${hy - 8 * Math.cos(ang)}`} fill={color} />
        {label && (
          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + ly} textAnchor="middle" fill={color} fontSize={20} fontWeight={600}>
            {label}
          </text>
        )}
      </g>
    )
  }
  const settings: [string[], string, string[], string, number][] = [
    [['XRDF'], 'URDF 와 함께 요구하는 YAML', ['collision 구 · 여유 buffer_distance · ignore 할 link 쌍', '관절별 가속도·jerk 한계 (UR10e 예: 12 rad/s², 500 rad/s³)', 'Isaac Sim 4.0 의 Robot Description Editor 로 만든다'], C.orange, 6.7],
    [['read_esdf_world'], '기본 false', ['false: planning scene 물체만 본다', 'true: nvblox 의 ESDF 를 읽는다', 'ESDF service 가 30 초 안에 안 뜨면 node 종료', 'robot segmenter distance_threshold 0.05 m'], C.blue, 13.2],
    [['allow_nonzero_velocity', '_at_trajectory_end'], 'joint_trajectory_controller · 기본 false', ['cuMotion trajectory 의 마지막 점 속도가 0 이 아닐 수 있다', '→ true 로 바꾼다', '기본 false 를 두면 controller 가 goal 을 거절한다'], C.green, 19.7],
    [['time_dilation_factor'], '기본 0.5 · 시각을 다시 붙일 때의 속도 배율', ['v0.7.8: dt 를 1 ÷ 0.5 = 2 배로 늘려 속도를 절반으로', 'velocity_scale 로 한계를 줄이면 비용 weight 를 다시 맞춰야 한다', '→ 느리게 하려면 이 배율을 쓰라고 권함'], C.purple, 22.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={380}>
        <svg width={1792} height={380}>
          <text x={30} y={40} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            MoveIt 2 + Isaac ROS cuMotion · Jetson Thor 는 1 초 안, RTX 6000 Ada 같은 discrete GPU 는 수십 ms
          </text>
          {node(40, 250, 250, 90, ['RViz'], 'OMPL / cuMotion 선택', C.muted, 1.4)}
          {arrow(290, 295, 340, 295, C.muted, 1.6)}
          {node(340, 250, 470, 90, ['MoveIt 2 move_group'], 'planning_pipelines: ompl, isaac_ros_cumotion', C.accent, 0.6)}
          {arrow(810, 295, 1140, 250, C.accent, 2.2, 'cumotion/move_group action', -40)}
          {node(1140, 150, 300, 120, ['cuMotion node', '(cuRobo)'], 'URDF + XRDF', C.green, 1)}
          {arrow(1440, 210, 1540, 210, C.green, 2.8, 'trajectory', -14)}
          {node(1540, 150, 250, 120, ['joint_trajectory', '_controller'], 'FollowJointTrajectory', C.green, 1.2)}
          {node(40, 70, 250, 90, ['depth camera'], 'depth image', C.blue, 13.2)}
          {arrow(290, 115, 340, 115, C.blue, 13.5)}
          {node(340, 70, 330, 90, ['robot segmenter'], '팔 pixel 지움 · 여유 0.05 m', C.blue, 13.7)}
          {arrow(670, 115, 720, 115, C.blue, 14.1)}
          {node(720, 70, 300, 90, ['nvblox'], 'TSDF → ESDF', C.blue, 14.3)}
          {arrow(1020, 115, 1140, 180, C.blue, 15)}
          <text x={1150} y={136} fill={C.blue} fontSize={20} fontWeight={600} opacity={prog(t, 15)}>
            ESDF service (read_esdf_world: true 일 때만)
          </text>
          <text x={1140} y={320} fill={C.dim} fontSize={20} opacity={prog(t, 3.4)}>
            /joint_states → 지금 관절 각도
          </text>
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: 64, top: 545, width: 1792, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
        {settings.map(([title, sub, lines, color, at]) => (
          <Appear key={title[0]} at={at}>
            <div style={{ height: 335, padding: '20px 24px', borderRadius: 18, background: C.card, border: `1.5px solid ${color}66`, display: 'grid', alignContent: 'start', gap: 8 }}>
              <div style={{ display: 'grid' }}>
                {title.map((s) => (
                  <span key={s} style={{ fontFamily: MONO, fontSize: 23, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
                    {s}
                  </span>
                ))}
              </div>
              <span style={line(C.muted, 20)}>{sub}</span>
              {lines.map((s, i) => (
                <span key={s} style={{ ...line(C.text, 20), opacity: prog(t, at + 0.5 + i * 0.5) }}>
                  · {s}
                </span>
              ))}
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'trajectory 최적화', color: C.accent, text: '224 개 숫자로 비용의 합을 줄인다 · 직선 seed 2.0 → 0.10 · 위쪽 seed 는 1.06 에 멈춤', at: 0.8 },
    { tag: '구 근사와 SDF', color: C.blue, text: '구 61 개 + ESDF 로 비용과 gradient 를 조회 한 번에 · η 2.5 cm: 38% → 65%', at: 4.4 },
    { tag: 'seed 병렬과 dt', color: C.orange, text: 'seed 수십 개 · particle + L-BFGS · dt 재조정 → 평균 50 ms 대 2.95 초 · VAMP 40 µs', at: 8.4 },
    { tag: 'MPC 와 cuMotion', color: C.green, text: '0.03 초마다 고치는 MPC · 질과 안전 보장은 약함 · cuMotion 은 MoveIt 2 의 plugin', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            다시 계획해도 될 만큼 빠르고 그대로 보내도 될 만큼 매끄러운 trajectory 를 어떻게 얻을까?
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
            NEXT · MANIPULATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600, whiteSpace: 'nowrap' }}>Grasp Planning · Diffusion Policy</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            물체를 어떤 자세로 잡을지 정하기 · 계획 대신 시연에서 배운 policy 가 매 순간 action 을 내기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · cuRobo 논문 arXiv 2310.17274 · nvblox arXiv 2311.00626
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseTrajOpt = () => (
  <PauseWrite
    question="평면 예에서 가운데 waypoint 의 y 를 −0.1, −0.2, −0.1 로 두면 비용의 합은? 이 후보에서 구는 장애물과 어떤 관계인가?"
    answer={
      <>
        (2, −0.2) 와 중심 (2, 0.3) 의 거리 0.5 m → d = 0.5 − 0.4 − 0.1 = 0 → 충돌 비용 0 · 매끄러움 0.1² + 0.1² + 0.1² + 0.1² = 0.04 → 합 0.04
        <br />
        B 의 0.10 보다 작지만 구가 장애물 표면에 딱 붙어 지나간다
      </>
    }
  />
)

const PauseSdf = () => (
  <PauseWrite
    question="반지름 0.06 m 구의 중심에서 ESDF 값이 0.08 m 이고 η = 0.025 m 다. 이 구의 비용과 d 에 대한 기울기는?"
    answer={
      <>
        d = 0.08 − 0.06 = 0.02 m (0 과 η 사이) · 비용 (0.025 − 0.02)² ÷ 0.05 = 0.0005 · 기울기 −(0.025 − 0.02) ÷ 0.025 = −0.2
        <br />
        − 라서 장애물에서 멀어지는 쪽으로 옮기면 비용이 준다
      </>
    }
  />
)

const PauseDt = () => (
  <PauseWrite
    question="dt = 0.25 초 결과의 최대 속도 0.3 rad/s, 가속도 0.6 rad/s², jerk 1 rad/s³ 이고 한계는 2, 15, 500 이다. 새 dt 와 이동 시간은? 어느 한계가 정하나?"
    answer={
      <>
        s ≥ 0.3 ÷ 2 = 0.15 · s ≥ √(0.6 ÷ 15) = 0.2 · s ≥ ∛(1 ÷ 500) ≈ 0.126 → 가장 큰 0.2
        <br />
        dt = 0.25 × 0.2 = 0.05 초 · 이동 시간 31 × 0.05 = 1.55 초 · 이번에는 가속도 한계가 정한다
      </>
    }
  />
)

const PauseMpc = () => (
  <PauseWrite
    question="MPC 가 1 초에 500 번 명령을 낸다. 명령 사이의 시간은 몇 ms 이고, 1 m/s 로 다가오는 손은 그동안 몇 mm 움직이는가?"
    answer="명령 사이 시간 1 ÷ 500 = 0.002 초 (2 ms) · 손은 1 × 0.002 = 0.002 m (2 mm) 움직인다"
  />
)

export function GpuMotionGeneration() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        pipeline: Pipeline,
        trajopt: TrajOpt,
        'pause-trajopt': PauseTrajOpt,
        spheres: Spheres,
        activation: Activation,
        'pause-sdf': PauseSdf,
        seeds: Seeds,
        dt: Dt,
        'pause-dt': PauseDt,
        mpc: Mpc,
        cumotion: CuMotion,
        'pause-mpc': PauseMpc,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
