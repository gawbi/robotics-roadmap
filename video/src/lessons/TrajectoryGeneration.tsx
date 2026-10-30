import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './trajectory-generation.narration.json'
import { script } from './trajectory-generation.script'

// Numbers follow lessons/trajectory-generation/README.md (see trajectory-generation.script.ts). The curves are computed
// from the lesson's own profiles (trapezoid, S-curve, minimum-jerk, cubic spline); the phase-plane curve inside the arc is
// schematic (marked 모식도).

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

function Flow({ steps, color, at, gap = 0.5 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
    </div>
  )
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line of text that fades in at `at` */
function Row({ at, color = C.text, size = 24, children }: { at: number; color?: string; size?: number; children: ReactNode }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
}

/** a text table: per-column alignment, numbers in mono */
function Table({ head, rows, widths, at, step = 0.5, size = 22, align, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; align?: ('left' | 'right')[]; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 || align?.[i] === 'left' ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: align?.[i] ?? (i === 0 ? 'left' : 'right'), paddingRight: i === 0 ? 0 : 8, paddingLeft: i > 0 && align?.[i] === 'left' ? 16 : 0, boxSizing: 'border-box' })
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

/** an SVG polyline through f(t) for t in [a, b], drawn up to fraction `p` */
function curve(f: (t: number) => number, a: number, b: number, X: (t: number) => number, Y: (v: number) => number, p = 1, n = 160) {
  const end = a + (b - a) * Math.max(0.001, p)
  const pts: string[] = []
  for (let i = 0; i <= n; i++) {
    const t = a + ((end - a) * i) / n
    pts.push(`${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** velocity of a rest-to-rest trapezoid (or triangle) with accel time ta, total T, peak vp */
const trapV = (ta: number, T: number, vp: number) => (t: number) => (t <= 0 ? 0 : t < ta ? (vp * t) / ta : t <= T - ta ? vp : t < T ? (vp * (T - t)) / ta : 0)

/** position of a rest-to-rest trapezoid with a = vp / ta */
const trapQ = (ta: number, T: number, vp: number) => (t: number) => {
  const a = vp / ta
  const d = vp * (T - ta)
  if (t <= ta) return 0.5 * a * t * t
  if (t <= T - ta) return 0.5 * a * ta * ta + vp * (t - ta)
  return d - 0.5 * a * (T - t) * (T - t)
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            MOTION · TRAJECTORY GENERATION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Trajectory Generation</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            자세의 목록 + <span style={{ color: C.accent }}>시각</span> = trajectory
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            planner 가 낸 자세의 목록에 시각을 붙여, 관절 한계 안에서 움직이게 하는 계산
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
  const needs: [string, number][] = [
    ['모든 관절이 속도 · 가속도 한계를 넘지 않는다', 1.2],
    ['모든 관절이 같은 순간에 도착한다', 2.0],
    ['그러면서도 가장 빨리 끝난다', 2.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <svg width={900} height={300} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={40} y={50} fill={C.muted} fontSize={24} opacity={prog(t, 0.4)}>
            planner 가 돌려주는 path · 자세의 목록
          </text>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 40 + i * 170
            return (
              <g key={i} opacity={prog(t, 0.6 + i * 0.2)}>
                <rect x={x} y={95} width={130} height={64} rx={12} fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
                <text x={x + 65} y={136} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
                  자세 {i + 1}
                </text>
                {i < 4 && <line x1={x + 136} y1={127} x2={x + 164} y2={127} stroke={C.muted} strokeWidth={3} />}
                <text x={x + 65} y={210} textAnchor="middle" fill={C.red} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 1.6 + i * 0.15)}>
                  t = ?
                </text>
              </g>
            )
          })}
          <text x={40} y={262} fill={C.dim} fontSize={22} opacity={prog(t, 2.4)}>
            언제 어느 자세에 있어야 하는지는 적혀 있지 않다
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 960, top: 36, width: 790, display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            관절 여섯 개 · 관절마다 다른 최고 속도와 가속도
          </Label>
          {needs.map(([s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color: C.green, fontSize: 28, fontWeight: 700 }}>✓</span>
              <span style={line(C.text, 26)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 478, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          목록의 자세마다 <span style={{ color: C.accent }}>시각을 어떻게 붙여야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={620} w={1260} h={240} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 16, opacity: prog(t, 5.8) }}>
          <span style={line(C.text, 26)}>
            <b style={{ color: C.accent }}>trajectory generation</b>: 자세의 목록에 시각을 붙여 매 순간의 목표 자세를 정하는 일
          </span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 6.4) }}>
            MoveIt 2 는 마지막 단계에서 TOTG (Kunz · Stilman, 2012) 로 시각을 붙인다 · 공식 문서는 이 방법을 MoveIt 2 의 모든 곳에서 쓰는 기본값이라고 적는다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- path and trajectory ----------

function PathTraj() {
  const t = useSec()
  // joint space: q1 0..2 → x 120..760, q2 0..1 → y 620..300
  const JX = (q1: number) => 120 + 320 * q1
  const JY = (q2: number) => 620 - 320 * q2
  const q25 = trapQ(0.5, 2.5, 1) // the 2.5 s trajectory of J1 (2 rad); q2 = q1 / 2
  const q45 = trapQ(0.5, 4.5, 0.5)
  const dots = Array.from({ length: 11 }, (_, i) => i * 0.25)
  // progress: t 0..4.5 → x 100..820, s 0..1 → y 400..100
  const PX = (s: number) => 100 + 160 * s
  const PY = (s: number) => 400 - 300 * s
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={860} h={750} at={0.3}>
        <svg width={860} height={750}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            joint 공간의 path
          </text>
          <line x1={120} y1={620} x2={800} y2={620} stroke={C.muted} strokeWidth={2} />
          <line x1={120} y1={620} x2={120} y2={250} stroke={C.muted} strokeWidth={2} />
          {[0, 1, 2].map((v) => (
            <text key={v} x={JX(v)} y={652} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          {[0, 0.5, 1].map((v) => (
            <text key={v} x={104} y={JY(v) + 7} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <text x={800} y={684} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
            q1 (rad)
          </text>
          <text x={134} y={240} fill={C.muted} fontSize={22} fontFamily={MONO}>
            q2 (rad)
          </text>
          <line x1={JX(0)} y1={JY(0)} x2={JX(0) + (JX(2) - JX(0)) * prog(t, 0.6, 1.2)} y2={JY(0) + (JY(1) - JY(0)) * prog(t, 0.6, 1.2)} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
          <circle cx={JX(0)} cy={JY(0)} r={9} fill={C.blue} opacity={prog(t, 0.6)} />
          <circle cx={JX(2)} cy={JY(1)} r={9} fill={C.blue} opacity={prog(t, 1.6)} />
          <text x={200} y={612} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 0.8)}>
            A (0, 0)
          </text>
          <text x={760} y={276} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 1.6)}>
            B (2, 1) rad
          </text>
          {dots.map((d, i) => {
            const q1 = q25(d)
            return <circle key={d} cx={JX(q1)} cy={JY(q1 / 2)} r={8} fill={C.orange} stroke={C.card} strokeWidth={2} opacity={prog(t, 13.3 + i * 0.25, 0.3)} />
          })}
          <text x={120} y={730} fill={C.orange} fontSize={22} opacity={prog(t, 14)}>
            주황 점: 2.5 초 trajectory 에서 0.25 초마다 찍은 위치 · 양 끝에서 촘촘하다
          </text>
        </svg>
      </Card>
      <Card x={960} y={130} w={900} h={470} at={6.5}>
        <svg width={900} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            같은 path 를 지나는 두 trajectory 의 진행률 s(t)
          </text>
          <line x1={100} y1={400} x2={830} y2={400} stroke={C.muted} strokeWidth={2} />
          <line x1={100} y1={400} x2={100} y2={90} stroke={C.muted} strokeWidth={2} />
          {[0, 2.5, 4.5].map((v) => (
            <text key={v} x={PX(v)} y={426} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <text x={84} y={406} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
            0
          </text>
          <text x={84} y={106} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
            1
          </text>
          <text x={840} y={406} fill={C.muted} fontSize={20} fontFamily={MONO}>
            t (s)
          </text>
          <polyline points={curve((x) => q25(x) / 2, 0, 2.5, PX, PY, prog(t, 7, 1.4))} fill="none" stroke={C.orange} strokeWidth={4} />
          <text x={500} y={80} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.2)}>
            2.5 s
          </text>
          <polyline points={curve((x) => q45(x) / 2, 0, 4.5, PX, PY, prog(t, 19.8, 1.6))} fill="none" stroke={C.blue} strokeWidth={4} />
          <text x={820} y={80} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21.2)}>
            4.5 s
          </text>
          <text x={30} y={454} fill={C.muted} fontSize={22} opacity={prog(t, 22.5)}>
            장애물 회피는 path 에서 끝났고, 남은 일은 관절 한계 안에서 얼마나 빨리 지날지다
          </text>
        </svg>
      </Card>
      <Box x={960} y={620} w={900} h={260} at={0.3} gap={10} title={<Head color={C.accent}>path 와 trajectory</Head>}>
        <Row at={0.6}>
          <span style={mono(C.blue)}>path q(s)</span> · 지나갈 자세의 선 · 진행률 s 하나로 위치 · 시간 없음
        </Row>
        <Row at={6.8}>
          <span style={mono(C.orange)}>trajectory q(t) = q(s(t))</span> · 시각마다 정한 자세
        </Row>
        <Row at={9} color={C.muted} size={22}>
          s(t) 를 Modern Robotics 는 time scaling, MoveIt 은 time parameterization 이라고 부른다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- joint vs Cartesian ----------

function Cartesian() {
  const t = useSec()
  const bars: [string, number, string][] = [
    ['d = 0.1 m', 1, '1 rad/s'],
    ['d = 0.05 m', 2, '2 rad/s'],
    ['d = 0.02 m', 5, '5 rad/s'],
  ]
  const BX = 220
  const S = 80 // px per rad/s
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={880} h={260} at={0.3} gap={10} title={<Head color={C.blue}>joint space 보간</Head>}>
        <Row at={0.6}>관절 각도를 시작값에서 끝값까지 같은 진행률로 움직인다</Row>
        <Row at={2}>관절마다 식 하나로 끝나고 관절 한계를 확인하기 쉽다</Row>
        <Row at={3.6} color={C.orange}>
          손끝은 휘어진 길을 간다 · Classical Pick 의 pre-grasp → grasp 도 가운데에서 <span style={mono(C.orange)}>2.5 cm</span> 벗어남
        </Row>
      </Box>
      <Box x={980} y={130} w={880} h={260} at={7} gap={10} title={<Head color={C.orange}>Cartesian 보간</Head>}>
        <Row at={7.3}>
          손끝의 곧은 선을 <span style={mono(C.orange)}>eef_step 0.01 m</span> (튜토리얼 값) 간격으로 나눈다
        </Row>
        <Row at={9}>나눈 점마다 IK 를 풀어 관절 각도를 구하고, 손의 방향은 slerp 로 보간한다</Row>
        <Row at={10.6} color={C.muted} size={22}>
          MoveIt 의 computeCartesianPath
        </Row>
      </Box>
      <Box x={60} y={410} w={880} h={470} at={14} gap={16} title={<Head color={C.red}>점마다 IK 를 풀어서 생기는 문제</Head>}>
        {[
          ['① IK 해가 없는 점', '팔이 닿지 않거나 관절 한계에 걸리면 거기서 멈추고, 어디까지 만들었는지를 0 ~ 1 의 비율로 돌려준다', 14.3],
          ['② 해의 갈래가 바뀜', 'elbow-up ↔ elbow-down: 손끝은 조금 움직였는데 관절은 크게 jump · MoveIt 은 이 jump 를 검사한다', 16.5],
          ['③ singularity 근처', '손끝 속도가 일정해도 관절 속도가 한없이 커진다 · 손목 중심이 joint 1 축 위 (shoulder singularity)', 19],
        ].map(([h, d, at]) => (
          <div key={h as string} style={{ display: 'grid', gap: 4, opacity: prog(t, at as number) }}>
            <span style={{ fontSize: 25, fontWeight: 600, color: C.red }}>{h}</span>
            <span style={line(C.text, 23)}>{d}</span>
          </div>
        ))}
      </Box>
      <Card x={980} y={410} w={880} h={470} at={21}>
        <svg width={880} height={300}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            joint 1 의 최대 각속도 = v ÷ d (v = 0.1 m/s)
          </text>
          {bars.map(([l, v, s], k) => {
            const y = 95 + k * 70
            const p = prog(t, 21.4 + k * 0.6, 0.8)
            const over = v > 2.62
            return (
              <g key={l} opacity={prog(t, 21.2 + k * 0.6)}>
                <text x={BX - 16} y={y + 22} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {l}
                </text>
                <rect x={BX} y={y} width={S * v * p} height={30} rx={6} fill={over ? C.red : C.blue} />
                <text x={660} y={y + 22} fill={over ? C.red : C.blue} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21.9 + k * 0.6)}>
                  {s}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 23.2)}>
            <line x1={BX + S * 2.62} y1={84} x2={BX + S * 2.62} y2={286} stroke={C.red} strokeWidth={2.5} strokeDasharray="8 6" />
            <text x={BX + S * 2.62 + 10} y={78} fill={C.red} fontSize={22} fontWeight={600}>
              FR3 joint 1 한계 2.62 rad/s
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 300, width: 820, display: 'grid', gap: 10 }}>
          <Row at={24}>
            축 위 (d = 0 m) 를 지나면 joint 1 이 <span style={mono(C.red)}>한순간에 180°</span> 돌아야 한다
          </Row>
          <Row at={25.4}>
            0.1 m/s 로 지나려면 축에서 <span style={mono(C.green)}>0.1 ÷ 2.62 ≈ 0.038 m</span> 보다 멀리
          </Row>
          <Row at={26.6} color={C.muted} size={22}>
            그래서 그 구간의 속도를 줄이거나, 곧은 선이 필요 없는 구간을 joint space 보간으로 바꾼다
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- trapezoid ----------

function Trapezoid() {
  const t = useSec()
  const X = (s: number) => 110 + 336 * s
  const Y = (v: number) => 600 - 380 * v
  const trap = trapV(0.5, 2.5, 1)
  const tri = trapV(0.4, 0.8, 0.8)
  const pTrap = prog(t, 0.6, 1.6)
  const area = `${X(0)},${Y(0)} ${X(0.5)},${Y(1)} ${X(2)},${Y(1)} ${X(2.5)},${Y(0)}`
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1040} h={750} at={0.3}>
        <svg width={1040} height={750}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            사다리꼴 속도 profile · 2 rad 이동
          </text>
          <text x={110} y={190} fill={C.muted} fontSize={22}>
            속도 (rad/s)
          </text>
          <line x1={110} y1={600} x2={990} y2={600} stroke={C.muted} strokeWidth={2} />
          <line x1={110} y1={600} x2={110} y2={200} stroke={C.muted} strokeWidth={2} />
          <text x={96} y={Y(1) + 7} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
            1
          </text>
          <text x={96} y={Y(0) + 7} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
            0
          </text>
          <text x={96} y={Y(0.8) + 7} textAnchor="end" fill={C.orange} fontSize={20} fontFamily={MONO} opacity={prog(t, 20)}>
            0.8
          </text>
          {[0, 0.5, 2, 2.5].map((v) => (
            <text key={v} x={X(v)} y={632} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <polygon points={area} fill={`${C.blue}22`} opacity={prog(t, 16.5)} />
          <polyline points={curve(trap, 0, 2.5, X, Y, pTrap, 200)} fill="none" stroke={C.blue} strokeWidth={5} strokeLinejoin="round" />
          {[
            ['가속 0.5 s', 0.25, 6.8],
            ['등속 1.5 s', 1.25, 7.6],
            ['감속 0.5 s', 2.25, 8.4],
          ].map(([l, c, at]) => (
            <text key={l as string} x={X(c as number)} y={672} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, at as number)}>
              {l}
            </text>
          ))}
          <text x={X(1.25)} y={480} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600} opacity={prog(t, 16.8)}>
            넓이 = 움직인 각도 2 rad
          </text>
          <text x={110} y={722} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.3)}>
            T = d ÷ v_max + v_max ÷ a_max = 2 + 0.5 = 2.5 s
          </text>
          <polyline points={curve(tri, 0, 0.8, X, Y, prog(t, 19.8, 1), 120)} fill="none" stroke={C.orange} strokeWidth={4} strokeDasharray="10 6" />
          <text x={390} y={342} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 20.6)}>
            0.32 rad → 삼각형 · 0.8 s
          </text>
        </svg>
      </Card>
      <Box x={1140} y={130} w={720} h={290} at={6.5} title={<Head color={C.blue}>v_max = 1 rad/s · a_max = 2 rad/s²</Head>}>
        <Table
          head={['구간', '시간', '움직인 각도']}
          widths={[180, 240, 220]}
          at={6.8}
          rows={[
            ['가속', '1 ÷ 2 = 0.5 s', '0.25 rad'],
            ['등속', '1.5 s', '1.5 rad'],
            ['감속', '0.5 s', '0.25 rad'],
            ['합', '2.5 s', '2 rad'],
          ]}
          colors={[undefined, undefined, undefined, C.accent]}
        />
      </Box>
      <Box x={1140} y={440} w={720} h={210} at={19.5} gap={10} title={<Head color={C.orange}>짧은 이동 0.32 rad</Head>}>
        <Row at={19.8}>
          <span style={mono(C.orange)}>v_max² ÷ a_max = 0.5 rad</span> 보다 짧아 최고 속도에 못 닿는다 → 삼각형
        </Row>
        <Row at={21.5}>
          꼭짓점 <span style={mono(C.orange)}>√(2 × 0.32) = 0.8 rad/s</span> · 시간 <span style={mono(C.orange)}>0.8 s</span>
        </Row>
      </Box>
      <Box x={1140} y={670} w={720} h={210} at={25.5} gap={10} title={<Head color={C.green}>FR3 joint 1 의 한계</Head>}>
        <Row at={25.8}>
          <span style={mono(C.green)}>2.62 rad/s</span> (joint_limits.yaml) · <span style={mono(C.green)}>10 rad/s²</span> (libfranka 0.10.0 이후)
        </Row>
        <Row at={27.5}>
          90° 회전: <span style={mono(C.green)}>1.571 ÷ 2.62 + 0.262 ≈ 0.86 s</span>
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S-curve and polynomials ----------

/** acceleration of the lesson's S-curve: 2 rad, v 1, a 2, j 10 → 0.2 s ramps, 0.7 s accel, 1.3 s cruise, 2.7 s */
function sAcc(t: number) {
  const up = (u: number) => (u < 0 ? 0 : u < 0.2 ? 10 * u : u < 0.5 ? 2 : u < 0.7 ? 2 - 10 * (u - 0.5) : 0)
  if (t <= 0.7) return up(t)
  if (t < 2.0) return 0
  if (t <= 2.7) return -up(t - 2.0)
  return 0
}
function sVel(t: number) {
  // integrate the acceleration numerically (fine enough for drawing)
  const n = Math.max(1, Math.round(t / 0.002))
  let v = 0
  for (let i = 0; i < n; i++) v += sAcc(((i + 0.5) * t) / n) * (t / n)
  return Math.max(0, v)
}
const trapAcc = (t: number) => (t < 0 ? 0 : t < 0.5 ? 2 : t < 2.0 ? 0 : t < 2.5 ? -2 : 0)

function ScurvePoly() {
  const t = useSec()
  const X = (s: number) => 100 + 280 * s
  const VY = (v: number) => 390 - 230 * v
  const AY = (a: number) => 590 - 45 * a
  const trap = trapV(0.5, 2.5, 1)
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={900} h={750} at={0.3}>
        <svg width={900} height={750}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            같은 2 rad 이동 · 사다리꼴과 S-curve
          </text>
          <g opacity={prog(t, 0.6)}>
            <line x1={30} y1={96} x2={70} y2={96} stroke={C.muted} strokeWidth={4} strokeDasharray="8 5" />
            <text x={80} y={103} fill={C.muted} fontSize={22}>
              사다리꼴 2.5 s
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <line x1={300} y1={96} x2={340} y2={96} stroke={C.green} strokeWidth={4} />
            <text x={350} y={103} fill={C.green} fontSize={22}>
              S-curve (jerk 10 rad/s³) 2.7 s
            </text>
          </g>
          <text x={100} y={142} fill={C.muted} fontSize={22}>
            속도 (rad/s)
          </text>
          <line x1={100} y1={390} x2={870} y2={390} stroke={C.muted} strokeWidth={2} />
          <line x1={100} y1={390} x2={100} y2={152} stroke={C.muted} strokeWidth={2} />
          <text x={86} y={VY(1) + 7} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
            1
          </text>
          {[0, 0.7, 2.5, 2.7].map((v) => (
            <text key={v} x={X(v)} y={418} textAnchor={v === 2.5 ? 'end' : v === 2.7 ? 'start' : 'middle'} fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <polyline points={curve(trap, 0, 2.5, X, VY, prog(t, 0.8, 1.2))} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="8 5" />
          <polyline points={curve(sVel, 0, 2.7, X, VY, prog(t, 7, 1.6), 135)} fill="none" stroke={C.green} strokeWidth={4} />
          <text x={100} y={472} fill={C.muted} fontSize={22}>
            가속도 (rad/s²)
          </text>
          <line x1={100} y1={AY(0)} x2={870} y2={AY(0)} stroke={C.muted} strokeWidth={2} />
          <line x1={100} y1={AY(2.4)} x2={100} y2={AY(-2.4)} stroke={C.muted} strokeWidth={2} />
          <text x={86} y={AY(2) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            2
          </text>
          <text x={86} y={AY(-2) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            −2
          </text>
          <polyline points={curve(trapAcc, 0, 2.5, X, AY, prog(t, 1.2, 1.2), 500)} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="8 5" />
          <polyline points={curve(sAcc, 0, 2.7, X, AY, prog(t, 7.4, 1.6), 270)} fill="none" stroke={C.green} strokeWidth={4} />
          <text x={320} y={572} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 2.2)}>
            계단처럼 바뀜 → jerk 무한대
          </text>
          <text x={320} y={624} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 8.6)}>
            0.2 s 동안 기울게 바뀜
          </text>
          <text x={100} y={726} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.3)}>
            2.5 s + a_max ÷ j_max (0.2 s) = 2.7 s
          </text>
        </svg>
      </Card>
      <Box x={1000} y={130} w={860} h={280} at={0.3} gap={10} title={<Head color={C.red}>jerk 와 S-curve</Head>}>
        <Row at={0.6}>계단 가속도 → jerk 무한대 → 감속기 · link 가 흔들려 팔 끝에 진동</Row>
        <Row at={6.8}>
          <span style={mono(C.green)}>j_max 10 rad/s³</span>: 가속도가 <span style={mono(C.green)}>2 ÷ 10 = 0.2 s</span> 동안 기울게
        </Row>
        <Row at={13.3}>
          <span style={mono(C.green)}>가속 0.7 s · 등속 1.3 s · 감속 0.7 s = 2.7 s</span>
        </Row>
        <Row at={15.5} color={C.muted} size={22}>
          Ruckig: 7 관절 한 번 평균 19.8 µs, 최대 123 µs → 1 ms 제어 주기 안
        </Row>
      </Box>
      <Card x={1000} y={430} w={860} h={450} at={19.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 10 }}>
          <Head color={C.purple}>0° → 90° 를 1 초에 (처음과 끝 정지)</Head>
          <Table
            head={['', 'cubic', 'quintic']}
            widths={[290, 250, 260]}
            at={19.8}
            size={22}
            rows={[
              ['맞추는 조건', '위치 · 속도 (4)', '+ 가속도 (6)'],
              ['최고 각속도', '135 °/s', '168.75 °/s'],
              ['출발 순간 각가속도', '540 °/s²', '0'],
              ['가장 큰 각가속도', '540 °/s²', '519.6 °/s²'],
            ]}
          />
          <Row at={25.8} color={C.orange} size={23}>
            cubic 은 출발 순간 가속도가 0 → 540 °/s² 로 뛰어 사다리꼴처럼 jerk 무한대
          </Row>
          <Row at={27.8} color={C.muted} size={22}>
            한계는 식에 없다 · 2 rad 이동은 1.875 × 2 ÷ T ≤ 1 이라 T ≥ 3.75 s (사다리꼴 2.5 s)
          </Row>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- spline ----------

/** minimum-jerk between waypoints that stop: 0 → 1 rad on [0, 1], 1 → 1.5 rad on [1, 2] */
function mjVel(t: number) {
  const seg = (d: number, u: number) => d * (30 * u * u - 60 * u ** 3 + 30 * u ** 4)
  if (t <= 0 || t >= 2) return 0
  return t < 1 ? seg(1, t) : seg(0.5, t - 1)
}
/** the lesson's cubic spline: v1 = 1.125 rad/s, rest at both ends */
function splVel(t: number) {
  if (t <= 0 || t >= 2) return 0
  if (t < 1) return 3.75 * t - 2.625 * t * t
  const u = t - 1
  return 1.125 - 1.5 * u + 0.375 * u * u
}

function Spline() {
  const t = useSec()
  const X = (s: number) => 120 + 430 * s
  const Y = (v: number) => 650 - 210 * v
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1100} h={750} at={0.3}>
        <svg width={1100} height={750}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600}>
            관절 속도 · 0 → 1 → 1.5 rad 를 0, 1, 2 초에
          </text>
          <text x={120} y={210} fill={C.muted} fontSize={22}>
            속도 (rad/s)
          </text>
          <line x1={120} y1={650} x2={1000} y2={650} stroke={C.muted} strokeWidth={2} />
          <line x1={120} y1={650} x2={120} y2={220} stroke={C.muted} strokeWidth={2} />
          {[0, 1, 2].map((v) => (
            <text key={v} x={104} y={Y(v) + 7} textAnchor="end" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          {[0, 1, 2].map((v) => (
            <text key={v} x={X(v)} y={682} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO}>
              {v}
            </text>
          ))}
          <text x={1010} y={657} fill={C.muted} fontSize={20} fontFamily={MONO}>
            t (s)
          </text>
          <line x1={X(1)} y1={230} x2={X(1)} y2={650} stroke={C.cardEdge} strokeWidth={2} strokeDasharray="6 6" />
          <text x={X(1)} y={716} textAnchor="middle" fill={C.muted} fontSize={22} opacity={prog(t, 0.8)}>
            가운데 waypoint
          </text>
          <polyline points={curve(mjVel, 0, 2, X, Y, prog(t, 6.8, 1.6), 240)} fill="none" stroke={C.red} strokeWidth={4} />
          <text x={X(1.04)} y={Y(1.9)} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 8.2)}>
            waypoint 마다 멈춤 · 최고 1.875 rad/s
          </text>
          <polyline points={curve(splVel, 0, 2, X, Y, prog(t, 13.3, 1.6), 240)} fill="none" stroke={C.green} strokeWidth={4} />
          <circle cx={X(1)} cy={Y(1.125)} r={8} fill={C.green} opacity={prog(t, 14.6)} />
          <text x={X(1.04)} y={Y(1.55)} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 14.6)}>
            cubic spline · 최고 1.34 rad/s
          </text>
        </svg>
      </Card>
      <Box x={1200} y={130} w={660} h={360} at={0.3} gap={12} title={<Head color={C.blue}>waypoint 를 잇는 두 방법</Head>}>
        <Row at={0.6}>시각 0, 1, 2 초에 0 → 1 → 1.5 rad 를 지나야 한다</Row>
        <Row at={6.8} color={C.red}>
          멈추는 minimum-jerk: 가운데 속도 0 → 첫 구간 최고 1.875 rad/s
        </Row>
        <Row at={13.3}>
          <span style={mono(C.green, 23)}>0 + 4v1 + 0 = 3 × 1.5 → v1 = 1.125</span>
        </Row>
        <Row at={15.5} color={C.green}>
          가운데 가속도는 양쪽 모두 −1.5 rad/s² · 최고 1.34 rad/s
        </Row>
      </Box>
      <Box x={1200} y={510} w={660} h={370} at={19.5} gap={14} title={<Head color={C.orange}>spline 의 주의점</Head>}>
        <Row at={19.8}>t = 0 에서 가속도가 0 → 3.75 rad/s² 로 뛴다 → 끝 가속도까지 맞추려면 quintic spline</Row>
        <Row at={21.6}>0 → 1 → 0.5 rad (1 초 간격): 가운데 속도 0.375 rad/s 라 약 1.02 rad 까지 넘쳐 오른다</Row>
        <Row at={23.6} color={C.accent}>
          waypoint 를 지날 시각을 미리 알아야 한다 → time-optimal parameterization
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- synchronization ----------

function Sync() {
  const t = useSec()
  const X = (s: number) => 120 + 258 * s
  const Y1 = (v: number) => 340 - 200 * v
  const Y2 = (v: number) => 670 - 200 * v
  const free: [string, (x: number) => number, number, string][] = [
    ['J1 2.5 s', trapV(0.5, 2.5, 1), 2.5, C.blue],
    ['J2 3.4 s', trapV(0.4, 3.4, 0.4), 3.4, C.orange],
    ['J3 1.0 s', trapV(0.5, 1.0, 1), 1.0, C.green],
  ]
  const sync: [string, (x: number) => number, string][] = [
    ['J1 0.67', trapV(0.4, 3.4, 2 / 3), C.blue],
    ['J2 0.4', trapV(0.4, 3.4, 0.4), C.orange],
    ['J3 0.17', trapV(0.4, 3.4, 0.5 / 3), C.green],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1100} h={750} at={0.3}>
        <svg width={1100} height={750}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            관절마다 따로 · 자기 한계로 가장 빨리
          </text>
          {free.map(([l, , , c], i) => (
            <text key={l} x={560 + i * 170} y={46} fill={c} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 0.8 + i * 0.4)}>
              {l}
            </text>
          ))}
          <line x1={120} y1={340} x2={1020} y2={340} stroke={C.muted} strokeWidth={2} />
          <line x1={120} y1={340} x2={120} y2={110} stroke={C.muted} strokeWidth={2} />
          <text x={104} y={Y1(1) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            1
          </text>
          <text x={104} y={Y1(0.4) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0.4
          </text>
          {[0, 1, 2.5, 3.4].map((v) => (
            <text key={v} x={X(v)} y={366} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v}
            </text>
          ))}
          {free.map(([l, f, T, c], i) => (
            <polyline key={l} points={curve(f, 0, T, X, Y1, prog(t, 0.8 + i * 0.4, 1.2))} fill="none" stroke={c} strokeWidth={4} />
          ))}
          <text x={X(1.05)} y={324} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 12.3)}>
            ← J3 가 먼저 멈춤
          </text>
          <g opacity={prog(t, 18)}>
            <text x={30} y={430} fill={C.text} fontSize={26} fontWeight={600}>
              가장 느린 J2 의 3.4 s 에 맞추면
            </text>
            {sync.map(([l, , c], i) => (
              <text key={l} x={560 + i * 170} y={430} fill={c} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {l}
              </text>
            ))}
            <line x1={120} y1={670} x2={1020} y2={670} stroke={C.muted} strokeWidth={2} />
            <line x1={120} y1={670} x2={120} y2={450} stroke={C.muted} strokeWidth={2} />
            <text x={104} y={Y2(1) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              1
            </text>
            {[0, 0.4, 3.0, 3.4].map((v) => (
              <text key={v} x={X(v)} y={696} textAnchor={v === 3.0 ? 'end' : v === 3.4 ? 'start' : 'middle'} fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v.toFixed(1)}
              </text>
            ))}
          </g>
          {sync.map(([l, f, c], i) => (
            <polyline key={l} points={curve(f, 0, 3.4, X, Y2, prog(t, 18.4 + i * 0.4, 1.2))} fill="none" stroke={c} strokeWidth={4} />
          ))}
          <text x={30} y={736} fill={C.accent} fontSize={24} fontWeight={600} opacity={prog(t, 25)}>
            모든 관절의 진행률이 매 순간 같다 → path 가 곧은 선 그대로 남는다
          </text>
        </svg>
      </Card>
      <Box x={1200} y={130} w={660} h={330} at={0.3} gap={12} title={<Head color={C.blue}>세 관절의 이동과 한계</Head>}>
        <Table
          head={['', '각도', 'v_max', 'a_max', '혼자 갈 때']}
          widths={[60, 120, 140, 150, 120]}
          at={0.6}
          rows={[
            ['J1', '2 rad', '1 rad/s', '2 rad/s²', '2.5 s'],
            ['J2', '1.2 rad', '0.4 rad/s', '1 rad/s²', '3.4 s'],
            ['J3', '0.5 rad', '1 rad/s', '2 rad/s²', '1.0 s'],
          ]}
          colors={[C.blue, C.orange, C.green]}
        />
        <Row at={6.3} color={C.orange} size={22}>
          가장 많이 움직이는 J1 이 아니라 한계가 낮은 J2 가 가장 느리다
        </Row>
      </Box>
      <Box x={1200} y={480} w={660} h={400} at={12} gap={14} title={<Head color={C.accent}>동기화 (synchronization)</Head>}>
        <Row at={12.3}>제각각이면 J3 가 1 초에 멈춰 곧은 path 가 꺾이고, 충돌 검사하지 않은 자세를 지난다</Row>
        <Row at={18.3}>
          모두 J2 에 맞춰 <span style={mono(C.accent)}>0.4 s 가속 · 2.6 s 등속 · 0.4 s 감속</span>
        </Row>
        <Row at={24.3}>
          J1 <span style={mono(C.blue, 23)}>2 ÷ (3.4 − 0.4) = 0.67 rad/s</span>
          <br />
          J3 <span style={mono(C.green, 23)}>0.5 ÷ 3.0 = 0.17 rad/s</span>
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- time-optimal path parameterization ----------

const ARC_R = 0.2414
const L1 = 1 - ARC_R // straight part before the arc
const LA = (Math.PI / 2) * ARC_R // arc length
const LT = 2 * L1 + LA // whole path length

/** limit curve: 1 rad/s on the straight parts, 0.695 at the arc ends rising to 0.826 in the middle (schematic in between) */
function limitS(s: number) {
  if (s < L1 || s > L1 + LA) return 1
  const u = (s - L1) / LA
  return 0.695 + (0.826 - 0.695) * Math.sin(Math.PI * u)
}
/** an example time-optimal profile: max accel 2, cruise at 1, brake to ≈ 0.7 for the arc, and back */
function profS(s: number) {
  const va = 0.695
  const up = Math.sqrt(4 * Math.max(0, s))
  const down = Math.sqrt(4 * Math.max(0, LT - s))
  const intoArc = s <= L1 ? Math.sqrt(va * va + 4 * (L1 - s)) : Infinity
  const outArc = s >= L1 + LA ? Math.sqrt(va * va + 4 * (s - L1 - LA)) : Infinity
  const inArc = s > L1 && s < L1 + LA ? va : Infinity
  return Math.min(1, up, down, intoArc, outArc, inArc)
}

function Topp() {
  const t = useSec()
  // joint space: A (0, 0) → B (1, 0) → C (1, 1), 480 px per rad
  const JX = (q: number) => 90 + 480 * q
  const JY = (q: number) => 610 - 480 * q
  const r = ARC_R * 480
  const cx = JX(1) - r
  const cy = JY(0) - r
  const mid = { x: cx + r * Math.SQRT1_2, y: cy + r * Math.SQRT1_2 }
  const pArc = prog(t, 13.3, 1.2)
  // phase plane: s 0..LT → x 100..940, path speed 0..1 → y 400..120
  const PX = (s: number) => 100 + (840 * s) / LT
  const PY = (v: number) => 400 - 280 * v
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={760} h={750} at={0.3}>
        <svg width={760} height={750}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            joint 공간의 path · 두 관절 모두 1 rad/s · 2 rad/s²
          </text>
          <g opacity={prog(t, 0.6)}>
            <line x1={JX(0)} y1={JY(0)} x2={cx} y2={JY(0)} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <line x1={JX(1)} y1={cy} x2={JX(1)} y2={JY(1)} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <circle cx={JX(0)} cy={JY(0)} r={9} fill={C.blue} />
            <circle cx={JX(1)} cy={JY(1)} r={9} fill={C.blue} />
            <text x={JX(0)} y={646} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              A (0, 0)
            </text>
            <text x={JX(1) + 20} y={JY(1) + 12} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              C (1, 1)
            </text>
          </g>
          <g opacity={prog(t, 6.8) * (1 - 0.6 * prog(t, 13.3))}>
            <line x1={cx} y1={JY(0)} x2={JX(1)} y2={JY(0)} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <line x1={JX(1)} y1={JY(0)} x2={JX(1)} y2={cy} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
            <circle cx={JX(1)} cy={JY(0)} r={10} fill={C.red} />
          </g>
          <text x={JX(1) + 20} y={646} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.8)}>
            B (1, 0)
          </text>
          <path d={`M ${cx} ${JY(0)} A ${r} ${r} 0 0 0 ${JX(1)} ${cy}`} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray={`${(Math.PI / 2) * r * pArc} 1000`} />
          <g opacity={prog(t, 14.6)}>
            <line x1={cx} y1={cy} x2={mid.x} y2={mid.y} stroke={C.green} strokeWidth={2} strokeDasharray="5 5" />
            <circle cx={cx} cy={cy} r={4} fill={C.green} />
            <text x={cx - 14} y={cy - 6} textAnchor="end" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              r = 0.24 rad
            </text>
            <line x1={mid.x} y1={mid.y} x2={JX(1)} y2={JY(0)} stroke={C.orange} strokeWidth={2.5} />
            <text x={JX(1) + 20} y={570} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              δ = 0.1 rad
            </text>
          </g>
          <text x={30} y={690} fill={C.red} fontSize={22} opacity={prog(t, 7.6)}>
            B 에서 멈추면: 1 rad 사다리꼴 두 번 · 1.5 s + 1.5 s = 3.0 s
          </text>
          <text x={30} y={726} fill={C.green} fontSize={22} opacity={prog(t, 15.4)}>
            TOTG: 모서리를 B 의 0.1 rad 안쪽으로 도는 원호로 깎는다
          </text>
        </svg>
      </Card>
      <Card x={860} y={130} w={1000} h={470} at={19.5}>
        <svg width={1000} height={470}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            phase plane · 가로 path 위 거리 s, 세로 path 속도
          </text>
          <text x={970} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <text x={30} y={74} fill={C.muted} fontSize={20} fontFamily={MONO}>
            (rad/s)
          </text>
          <line x1={100} y1={400} x2={950} y2={400} stroke={C.muted} strokeWidth={2} />
          <line x1={100} y1={400} x2={100} y2={90} stroke={C.muted} strokeWidth={2} />
          <text x={88} y={PY(1) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            1
          </text>
          <text x={88} y={PY(0.7) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0.7
          </text>
          <text x={88} y={PY(0) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
            0
          </text>
          <text x={PX(LT)} y={432} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
            s
          </text>
          <rect x={PX(L1)} y={404} width={PX(L1 + LA) - PX(L1)} height={8} rx={3} fill={C.green} opacity={0.6} />
          <text x={(PX(L1) + PX(L1 + LA)) / 2} y={440} textAnchor="middle" fill={C.green} fontSize={20}>
            원호
          </text>
          <polyline points={curve(limitS, 0, LT, PX, PY, prog(t, 19.8, 1.2), 600)} fill="none" stroke={C.red} strokeWidth={3} />
          <text x={120} y={104} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 20.4)}>
            limit curve (관절 한계)
          </text>
          <text x={520} y={262} textAnchor="middle" fill={C.text} fontSize={22} opacity={prog(t, 22.4)}>
            원호 입구 ≈ 0.7 rad/s
          </text>
          <polyline points={curve(profS, 0, LT, PX, PY, prog(t, 25.8, 1.6), 600)} fill="none" stroke={C.green} strokeWidth={4} />
          <text x={900} y={330} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 27)}>
            시간 최적 profile 2.59 s
          </text>
        </svg>
      </Card>
      <Box x={860} y={620} w={1000} h={260} at={25.5} gap={12} title={<Head color={C.green}>time-optimal parameterization</Head>}>
        <Row at={25.8}>
          limit curve 아래에서 최대로 가속 · 늦지 않게 최대로 감속 → <span style={mono(C.green)}>2.59 s</span> (멈추면 3.0 s, 0.41 s 빠름)
        </Row>
        <Row at={27.6}>TOTG: limit curve 위 switching point 를 찾아 앞뒤로 적분</Row>
        <Row at={29}>
          TOPP-RA: <span style={mono(C.accent)}>N = 500</span>, 부등식 30 개 → <span style={mono(C.accent)}>29.8 ms</span> (수치 적분 방식 455.3 ms)
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- MoveIt 2 ----------

function MoveIt() {
  const t = useSec()
  const rows: [string, number, string, string][] = [
    ['1.0 / 1.0', 2.5, '2.5 s', C.blue],
    ['0.5 / 0.5', 4.5, '4.5 s', C.green],
    ['0.1 / 1.0', 20.05, '20.05 s', C.orange],
    ['1.0 / 0.1', 6.32, '6.32 s (삼각형)', C.purple],
    ['0.1 / 0.1 (기본값)', 20.5, '20.5 s', C.red],
  ]
  const BX = 280
  const S = 27 // px per second
  return (
    <AbsoluteFill>
      <Box x={60} y={130} w={1800} h={150} at={0.3} gap={12} title={<Head color={C.accent}>MoveIt 2 planning pipeline 의 response adapter</Head>}>
        <Flow steps={['planner 의 path', 'AddTimeOptimalParameterization', 'AddRuckigTrajectorySmoothing (선택)', 'trajectory']} color={C.accent} at={0.6} />
      </Box>
      <Box x={60} y={300} w={860} h={330} at={6.5} gap={12} title={<Head color={C.blue}>TOTG adapter 의 기본값</Head>}>
        <Table
          head={['parameter', '기본값', '뜻']}
          widths={[260, 110, 430]}
          align={['left', 'right', 'left']}
          at={6.8}
          rows={[
            ['path_tolerance', '0.1', '원래 path 에서 벗어나도 되는 거리'],
            ['resample_dt', '0.1', '결과 점 사이 시간 간격 (s)'],
            ['min_angle_change', '0.001', '이보다 덜 변하면 같은 점'],
          ]}
        />
        <Row at={9.5} color={C.orange} size={22}>
          joint_limits.yaml 에 가속도 한계가 없으면 "No acceleration limit was defined for joint" 로 실패 (URDF 에는 가속도가 없다)
        </Row>
      </Box>
      <Box x={960} y={300} w={900} h={330} at={13} gap={12} title={<Head color={C.orange}>scaling factor</Head>}>
        <Row at={13.3}>TOTG 는 관절 한계에 max_velocity_scaling_factor 와 max_acceleration_scaling_factor 를 곱해 쓴다 (0 보다 크고 1 이하)</Row>
        <Row at={15.5}>
          Setup Assistant 기본값 <span style={mono(C.red)}>0.1</span> · "For beginners, we downscale velocity and acceleration limits."
        </Row>
        <Row at={23} color={C.green}>
          MoveIt 의 migration 문서 권장 <span style={mono(C.green)}>0.2 ~ 0.6</span>
        </Row>
      </Box>
      <Card x={60} y={650} w={1800} h={230} at={19.5}>
        <svg width={940} height={230} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={36} fill={C.text} fontSize={22} fontWeight={600}>
            2 rad 이동 시간 · velocity / acceleration scaling
          </text>
          {rows.map(([l, v, s, c], k) => {
            const y = 56 + k * 34
            return (
              <g key={l} opacity={prog(t, 19.8 + k * 0.4)}>
                <text x={BX - 16} y={y + 20} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {l}
                </text>
                <rect x={BX} y={y} width={S * v * prog(t, 19.9 + k * 0.4, 0.8)} height={24} rx={5} fill={c} />
                <text x={BX + S * v + 12} y={y + 20} fill={c} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  {s}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ position: 'absolute', left: 990, top: 22, width: 780, display: 'grid', gap: 12, opacity: prog(t, 25.6) }}>
          <div style={{ padding: '12px 20px', borderRadius: 14, background: `${C.red}14`, border: `1.5px solid ${C.red}55` }}>
            <span style={line(C.red, 23)}>✕ 흔한 오해 · scaling 0.5 면 시간이 정확히 두 배</span>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: 14, background: `${C.green}14`, border: `1.5px solid ${C.green}55`, opacity: prog(t, 26.8) }}>
            <span style={line(C.text, 22)}>
              ✓ 2 rad 은 2.5 → 4.5 s 로 1.8 배 · 0.32 rad 은 0.8 → 1.14 s 로 1.43 배 · T = d ÷ v_max + v_max ÷ a_max 의 첫 항만 두 배
            </span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'path 는 시간 없는 선 · Cartesian 직선은 IK 실패 · jump · 5 rad/s 급증', at: 1 },
    { tag: script.sections[1], color: C.blue, text: 'T = d ÷ v_max + v_max ÷ a_max · S-curve 는 a_max ÷ j_max 만큼만 길다', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'spline 은 멈추지 않고 1.34 rad/s · 가장 느린 J2 의 3.4 s 에 모두 맞춘다', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'phase plane 에서 2.59 s (멈추면 3.0 s) · MoveIt 2 는 한계 × scaling factor', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            모든 관절이 한계를 지키며 같은 순간에, 가장 빨리 도착하려면 시각을 어떻게 붙일까?
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
            NEXT · MOTION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600 }}>Motion Planning · ros2_control</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            장애물을 피하는 path 를 joint 공간에서 찾기 · trajectory 를 1초에 수백 번 motor 명령으로 바꾸기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/trajectory-generation (Kunz · Stilman, Pham · Pham, Berscheid · Kröger 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseCart = () => (
  <PauseWrite
    question="손목이 0.2 m/s 로 joint 1 축에서 0.05 m 떨어진 곧은 선을 지난다. joint 1 의 최대 각속도는? FR3 의 한계 2.62 rad/s 안에 들어가는가?"
    answer={
      <>
        v ÷ d = 0.2 ÷ 0.05 = 4 rad/s → 2.62 rad/s 를 넘는다
        <br />
        속도를 2.62 × 0.05 ≈ 0.13 m/s 아래로 줄이거나, 선을 0.2 ÷ 2.62 ≈ 0.076 m 보다 멀리
      </>
    }
  />
)

const PauseTri = () => (
  <PauseWrite
    question="v_max = 1 rad/s, a_max = 2 rad/s² 인 관절을 0.18 rad 옮긴다. profile 의 모양, 꼭짓점 속도, 걸리는 시간은?"
    answer={
      <>
        v_max² ÷ a_max = 0.5 rad 보다 짧다 → 삼각형
        <br />
        꼭짓점 √(2 × 0.18) = √0.36 = 0.6 rad/s · 가속 0.6 ÷ 2 = 0.3 s → 전체 2 × 0.3 = 0.6 s
      </>
    }
  />
)

const PauseSync = () => (
  <PauseWrite
    question="J1 은 1 rad 를 v_max = 1 rad/s, a_max = 2 rad/s² 로 움직이고, J2 는 0.6 rad 를 v_max = 0.5 rad/s, a_max = 1 rad/s² 로 움직인다. 동기화한 전체 시간은?"
    answer={
      <>
        J1: 1 ÷ 1 + 1 ÷ 2 = 1.5 s · J2: 0.6 ÷ 0.5 + 0.5 ÷ 1 = 1.7 s (둘 다 사다리꼴)
        <br />
        느린 J2 에 맞춘 1.7 s 가 전체 시간 · J1 은 더 천천히 움직인다
      </>
    }
  />
)

const PauseScale = () => (
  <PauseWrite
    question="v_max = 1 rad/s, a_max = 2 rad/s² 인 관절을 1 rad 옮긴다. scaling factor 를 둘 다 0.5 로 주면 시간은?"
    answer={
      <>
        한계 0.5 rad/s · 1 rad/s² → 0.5² ÷ 1 = 0.25 ≤ 1 이라 사다리꼴
        <br />
        T = 1 ÷ 0.5 + 0.5 ÷ 1 = 2.5 s · scaling 전 1.5 s 의 1.67 배
      </>
    }
  />
)

export function TrajectoryGeneration() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'path-traj': PathTraj,
        cartesian: Cartesian,
        'pause-cart': PauseCart,
        trapezoid: Trapezoid,
        'scurve-poly': ScurvePoly,
        'pause-tri': PauseTri,
        spline: Spline,
        sync: Sync,
        'pause-sync': PauseSync,
        topp: Topp,
        moveit: MoveIt,
        'pause-scale': PauseScale,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
