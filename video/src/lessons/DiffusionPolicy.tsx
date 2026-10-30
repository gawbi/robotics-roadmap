import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, lerp, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './diffusion-policy.narration.json'
import { script } from './diffusion-policy.script'

// Numbers follow lessons/diffusion-policy/README.md (see diffusion-policy.script.ts). The PushT block, the sample paths of
// the diffusion head and the scattered chunk points are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 380, unit = '', fmt, sub, labelW = 300 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number }) {
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
      {sub && <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** superscript / subscript kept at ≥ 20 px for the sizes used here */
const Sup = ({ children }: { children: ReactNode }) => <sup style={{ fontSize: '0.85em', lineHeight: 0 }}>{children}</sup>
const Sub = ({ children }: { children: ReactNode }) => <sub style={{ fontSize: '0.85em', lineHeight: 0 }}>{children}</sub>

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

/** a polyline drawn segment by segment from `at` */
function Path({ pts, color, at, step = 0.45, width = 4, dots = true }: { pts: [number, number][]; color: string; at: number; step?: number; width?: number; dots?: boolean }) {
  const t = useSec()
  return (
    <g>
      {pts.slice(1).map(([x, y], i) => {
        const [x0, y0] = pts[i]
        const p = prog(t, at + i * step, step)
        return <line key={i} x1={x0} y1={y0} x2={lerp(x0, x, p)} y2={lerp(y0, y, p)} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={p > 0 ? 1 : 0} />
      })}
      {dots && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill={color} opacity={prog(t, at + (i - 1) * step + step * 0.9, 0.2)} />)}
    </g>
  )
}

/** a T-shaped block, top bar centred on (cx, top) */
function TBlock({ cx, top, bar = 140, thick = 30, stem = 90, fill, stroke, dash, rotate = 0 }: { cx: number; top: number; bar?: number; thick?: number; stem?: number; fill: string; stroke: string; dash?: string; rotate?: number }) {
  const d = `M ${cx - bar / 2} ${top} H ${cx + bar / 2} V ${top + thick} H ${cx + thick / 2} V ${top + thick + stem} H ${cx - thick / 2} V ${top + thick} H ${cx - bar / 2} Z`
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={2.5} strokeDasharray={dash} transform={rotate ? `rotate(${rotate} ${cx} ${top + (thick + stem) / 2})` : undefined} />
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            IMITATION · DIFFUSION POLICY
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Diffusion Policy</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            관측 → <span style={{ color: C.accent }}>noise 를 걷어 낸 action chunk</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            관측을 조건으로 noise 에서 앞으로 몇 step 의 action 을 한 덩어리로 걷어 내는 policy
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
  const items: [string, string, string, number][] = [
    ['✓', C.blue, '시연 A: 블록의 왼쪽으로 돌아가 아래쪽을 민다', 0.9],
    ['✓', C.purple, '시연 B: 블록의 오른쪽으로 돌아가 아래쪽을 민다', 1.6],
    ['✕', C.red, 'MSE 로 배운 policy: 두 길의 평균인 블록 한가운데로 손끝을 밀어 넣는다', 2.3],
    ['✕', C.red, 'step 마다 따로 뽑는 policy: 두 길 사이를 오가며 떨린다', 3.0],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={330}>
        <svg width={760} height={330} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={40} fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            PushT · 모식도
          </text>
          <g opacity={prog(t, 0.4)}>
            <TBlock cx={380} top={120} bar={160} stem={100} fill={C.cardEdge} stroke={C.muted} />
            <circle cx={380} cy={60} r={16} fill={C.blue} />
            <text x={350} y={52} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
              손끝
            </text>
          </g>
          <g opacity={prog(t, 0.9)}>
            <path d="M 366 72 C 250 90, 250 150, 255 210 S 300 292, 370 290" fill="none" stroke={C.blue} strokeWidth={4} strokeDasharray="10 8" />
            <text x={238} y={200} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
              시연 A
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <path d="M 394 72 C 510 90, 510 150, 505 210 S 460 292, 390 290" fill="none" stroke={C.purple} strokeWidth={4} strokeDasharray="10 8" />
            <text x={525} y={200} fill={C.purple} fontSize={22} fontWeight={600}>
              시연 B
            </text>
          </g>
          <g opacity={prog(t, 2.3)}>
            {arrow(380, 78, 380, 128, C.red, 4)}
            <text x={380} y={146} textAnchor="middle" fill={C.red} fontSize={30} fontWeight={700}>
              ✕
            </text>
            <text x={406} y={196} fill={C.red} fontSize={22} fontWeight={600}>
              평균
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 800, top: 30, width: 950, display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            T 자 블록을 밀어 목표 자리에 맞추는 PushT, 블록 아래쪽을 밀러 갈 때
          </Label>
          {items.map(([m, c, s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color: c, fontSize: 28, fontWeight: 700 }}>{m}</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 490, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          시연의 길 하나를 끝까지 따라가려면 <span style={{ color: C.accent }}>policy 는 무엇을 내야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={590} w={1260} h={290} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Label size={22}>Diffusion Policy 논문 · 실물 PushT, UR5 로봇 팔 · 같은 시작 상태 20 개의 성공률</Label>
          <Bar label="Diffusion Policy" value={95} max={100} color={C.green} at={6.0} width={640} unit="%" labelW={340} sub="19 / 20" />
          <Bar label="LSTM-GMM (가장 좋은 설정)" value={20} max={100} color={C.orange} at={6.5} width={640} unit="%" labelW={340} />
          <Bar label="IBC" value={0} max={100} color={C.red} at={7.0} width={640} unit="%" labelW={340} />
          <span style={{ ...line(C.dim, 22), opacity: prog(t, 7.3) }}>LSTM-GMM: 종 모양 여러 개를 섞어 action 의 확률을 낸다 · IBC: action 마다 점수를 매겨 가장 좋은 action 을 찾는다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 1. conditioned denoising ----------

const xd = (deg: number) => 600 + deg * 13

function HeadInfo({ x, y, at, title, color, rows }: { x: number; y: number; at: number; title: string; color: string; rows: [string, string][] }) {
  return (
    <Card x={x} y={y} w={666} h={236} at={at}>
      <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
        <Head color={color}>{title}</Head>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 14, ...line(C.text, 22) }}>
            <span style={{ color: C.muted, width: 150, flexShrink: 0 }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Heads() {
  const t = useSec()
  const ticks = [-30, -20, -10, 0, 10, 20, 30]
  // schematic diffusion-head samples: random start → end near one of the two peaks
  const samples: [number, number][] = [
    [-25, -21],
    [8, 19],
    [-5, -19],
    [22, 21],
    [15, 20.5],
    [-12, -20.5],
    [3, 21.5],
    [-28, -19.5],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1100} h={750} at={0.3}>
        <svg width={1100} height={750}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            상자 앞 시연 10 번 · 핸들 각도 (오른쪽이 +)
          </text>
          <text x={1070} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 20.3)}>
            diffusion 줄은 모식도
          </text>
          {/* demos */}
          <rect x={xd(-10)} y={66} width={xd(10) - xd(-10)} height={114} fill={`${C.red}18`} stroke={`${C.red}55`} strokeWidth={1.5} />
          <text x={600} y={100} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={600}>
            부딪히는 구간
          </text>
          <text x={600} y={128} textAnchor="middle" fill={C.red} fontSize={20} fontFamily={MONO}>
            −10° ~ +10°
          </text>
          <line x1={xd(-30)} y1={180} x2={xd(30)} y2={180} stroke={C.muted} strokeWidth={2} />
          {ticks.map((d) => (
            <g key={d}>
              <line x1={xd(d)} y1={180} x2={xd(d)} y2={188} stroke={C.muted} strokeWidth={2} />
              <text x={xd(d)} y={210} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '0'}
              </text>
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} opacity={prog(t, 0.6 + i * 0.15)}>
              <circle cx={xd(-20)} cy={168 - i * 22} r={9} fill={C.blue} />
              <circle cx={xd(20)} cy={168 - i * 22} r={9} fill={C.purple} />
            </g>
          ))}
          <text x={xd(-20) - 24} y={128} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
            5 번
          </text>
          <text x={xd(20) + 24} y={128} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600}>
            5 번
          </text>
          {/* MSE */}
          <g opacity={prog(t, 6.8)}>
            <text x={30} y={270} fill={C.red} fontSize={24} fontWeight={600}>
              MSE head · 두 정답의 평균
            </text>
            <line x1={xd(-30)} y1={340} x2={xd(30)} y2={340} stroke={C.cardEdge} strokeWidth={2} />
            <text x={600} y={334} textAnchor="middle" fill={C.red} fontSize={36} fontWeight={700}>
              ✕
            </text>
            <text x={628} y={330} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0° → 충돌
            </text>
          </g>
          {/* RT-1 */}
          <g opacity={prog(t, 13.3)}>
            <text x={30} y={410} fill={C.orange} fontSize={24} fontWeight={600}>
              RT-1 head · 256 칸 가운데 두 칸에 확률
            </text>
            <line x1={xd(-30)} y1={500} x2={xd(30)} y2={500} stroke={C.cardEdge} strokeWidth={2} />
            {[-19.5, 20.5].map((d) => (
              <g key={d}>
                <rect x={xd(d) - 8} y={500 - 56 * prog(t, 13.6, 0.8)} width={16} height={56 * prog(t, 13.6, 0.8)} fill={C.orange} />
                <text x={xd(d) + 20} y={478} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  0.5
                </text>
                <text x={xd(d)} y={528} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
                  {d > 0 ? `+${d}°` : `−${-d}°`}
                </text>
              </g>
            ))}
          </g>
          {/* diffusion */}
          <g opacity={prog(t, 20.3)}>
            <text x={30} y={590} fill={C.green} fontSize={24} fontWeight={600}>
              diffusion head · noise 에서 K 번 걷어 낸 값
            </text>
            <line x1={xd(-30)} y1={700} x2={xd(30)} y2={700} stroke={C.cardEdge} strokeWidth={2} />
            {samples.map(([a, b], i) => {
              const p = prog(t, 20.8 + i * 0.25, 2)
              return (
                <g key={i}>
                  <circle cx={xd(a)} cy={614} r={4} fill={C.muted} />
                  <line x1={xd(a)} y1={614} x2={lerp(xd(a), xd(b), p)} y2={lerp(614, 690, p)} stroke={`${C.green}88`} strokeWidth={2} />
                  <circle cx={lerp(xd(a), xd(b), p)} cy={lerp(614, 690, p)} r={7} fill={C.green} />
                </g>
              )
            })}
            <text x={xd(-20)} y={730} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 23.5)}>
              −20° 근처
            </text>
            <text x={xd(20)} y={730} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} opacity={prog(t, 23.5)}>
              +20° 근처
            </text>
          </g>
        </svg>
      </Card>
      <HeadInfo
        x={1190}
        y={130}
        at={6.8}
        title="MSE head"
        color={C.red}
        rows={[
          ['내는 것', '각도 숫자 1 개'],
          ['다시 실행하면', '언제나 같은 값'],
          ['network 계산', 'action 하나당 1 번'],
        ]}
      />
      <HeadInfo
        x={1190}
        y={387}
        at={13.3}
        title="RT-1 head"
        color={C.orange}
        rows={[
          ['내는 것', '256 칸 각각의 확률'],
          ['다시 실행하면', 'argmax 면 같은 칸'],
          ['x, y 두 차원', '따로 골라 짝이 깨질 수 있음'],
        ]}
      />
      <HeadInfo
        x={1190}
        y={644}
        at={20.3}
        title="diffusion head"
        color={C.green}
        rows={[
          ['내는 것', 'noise 를 걷어 내고 남은 각도'],
          ['다시 실행하면', '출발 noise 에 따라 다른 봉우리'],
          ['network 계산', 'action 하나당 K 번'],
        ]}
      />
    </AbsoluteFill>
  )
}

const xk = (k: number) => 140 + (5 - k) * 170
const yv = (v: number) => 205 - v * 135

function Denoise() {
  const t = useSec()
  const box1 = [0.6, 0.65, 0.41, 0.58, 0.92, 1.0]
  const box2 = [-0.4, -0.58, -0.3, -0.24, -0.54, -1.0]
  const road = [0.6, 0.56, 0.18, 0.19, 0.15, 0.0]
  const pts = (vs: number[]): [number, number][] => vs.map((v, i) => [xk(5 - i), yv(v)])
  const steps: [ReactNode, number][] = [
    [<>1. 시연에서 (O, 정규화한 A<Sup>0</Sup>) 한 쌍을 꺼낸다</>, 6.4],
    [<>2. 단계 번호 k 를 1 ~ K 에서 무작위로 고른다</>, 7.0],
    [<>3. noise ε 을 뽑아 A<Sup>0</Sup> 에 섞어 A<Sup>k</Sup> 를 만든다</>, 7.6],
    [<>4. network 가 맞힌 값과 ε 의 차이를 제곱해 loss 로 쓴다</>, 8.4],
    [<>5. encoder 의 weight 도 이 loss 로 함께 고친다</>, 9.4],
  ]
  const calc: [ReactNode, number, string][] = [
    [<>A<Sup>5</Sup> = 0.60 → network 의 답 0.54</>, 12.3, C.green],
    [<>곧은 길 장면이면 같은 0.60 에 0.65</>, 13.2, C.orange],
    [<>0.60 − 0.54 × 0.54 = 0.31</>, 14.2, C.text],
    [<>1.41 × 0.31 = 0.44</>, 15.0, C.text],
    [<>새 noise 0.71 × 0.3 = 0.21</>, 15.8, C.text],
    [<>A<Sup>4</Sup> = 0.44 + 0.21 = 0.65</>, 16.6, C.green],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={860} h={330} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <Head>Diffusion Policy 의 network 가 받는 것</Head>
          <div style={{ ...mono(C.accent, 34), opacity: prog(t, 0.8) }}>
            noise 추정 = network(<span style={{ fontFamily: SANS }}>O</span>, A<Sup>k</Sup>, k)
          </div>
          {[
            [<span style={{ fontFamily: SANS }}>O</span>, '관측: 카메라 사진과 로봇 상태', 1.6],
            [<>A<Sup>k</Sup></>, 'noise 를 k 단계만큼 섞은 action', 2.4],
            [<>k</>, '단계 번호 (1 ~ K)', 3.2],
          ].map(([k, v, at], i) => (
            <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={{ ...mono(C.accent, 26), width: 60 }}>{k as ReactNode}</span>
              <span style={line(C.text, 24)}>{v as string}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card x={950} y={130} w={906} h={330} at={6.2}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 8 }}>
          <Head>학습 한 번 · DDPM 과 같고 관측만 더한다</Head>
          {steps.map(([s, at], i) => (
            <span key={i} style={{ ...line(C.text, 22), opacity: prog(t, at) }}>
              {s}
            </span>
          ))}
        </div>
      </Card>
      <Card x={64} y={490} w={1792} h={390} at={12.0}>
        <svg width={1150} height={390} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 18.0)}>
            <text x={30} y={38} fill={C.muted} fontSize={22}>
              K = 5 sampling 세 번의 예 · 새 noise 를 정해 두고 계산
            </text>
            <circle cx={760} cy={31} r={7} fill={C.green} />
            <text x={776} y={38} fill={C.green} fontSize={22}>
              상자 장면
            </text>
            <circle cx={910} cy={31} r={7} fill={C.orange} />
            <text x={926} y={38} fill={C.orange} fontSize={22}>
              곧은 길 장면
            </text>
            {[1, 0, -1].map((v) => (
              <line key={v} x1={xk(5)} y1={yv(v)} x2={xk(0)} y2={yv(v)} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="6 6" />
            ))}
            <text x={1008} y={yv(1) + 7} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              +1 · +20°
            </text>
            <text x={1008} y={yv(0) + 7} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0 · 0°
            </text>
            <text x={1008} y={yv(-1) + 7} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              −1 · −20°
            </text>
            {[5, 4, 3, 2, 1, 0].map((k) => (
              <text key={k} x={xk(k)} y={376} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                k = {k}
              </text>
            ))}
            <text x={xk(5) - 14} y={yv(0.6) + 7} textAnchor="end" fill={C.text} fontSize={20} fontFamily={MONO}>
              0.60
            </text>
          </g>
          <Path pts={pts(box1)} color={C.green} at={18.4} />
          <g opacity={prog(t, 24.2)}>
            <text x={xk(5) - 14} y={yv(-0.4) + 7} textAnchor="end" fill={C.text} fontSize={20} fontFamily={MONO}>
              −0.40
            </text>
          </g>
          <Path pts={pts(box2)} color={C.green} at={24.4} step={0.35} />
          <Path pts={pts(road)} color={C.orange} at={26.4} step={0.35} />
        </svg>
        <div style={{ position: 'absolute', left: 1180, top: 24, width: 580, display: 'grid', gap: 6 }}>
          <Head size={24}>상자 장면 k = 5 의 reverse 한 단계</Head>
          {calc.map(([s, at, c], i) => (
            <span key={i} style={{ ...mono(c, 22), lineHeight: 1.45, opacity: prog(t, at) }}>
              {s}
            </span>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.2) }}>정규화: −20° → −1 · +20° → +1</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 2. chunk and horizons ----------

function Cells({ signs, at, step = 0.15 }: { signs: string[]; at: number; step?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {signs.map((s, i) => {
        const c = s === '+' ? C.purple : C.blue
        return (
          <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 4, opacity: prog(t, at + i * step) }}>
            <div style={{ width: 80, height: 80, borderRadius: 12, border: `2px solid ${c}`, background: `${c}22`, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 40, fontWeight: 700, color: c }}>
              <span>{s}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 20, color: C.dim }}>{i}</span>
          </div>
        )
      })}
    </div>
  )
}

function Chunk() {
  const t = useSec()
  // schematic: 16 scattered points (k = 5) settle onto a path that passes the block on the right (k = 0)
  const scatter: [number, number][] = [
    [250, 300], [690, 90], [420, 250], [780, 310], [330, 120], [600, 330], [230, 180], [720, 220],
    [480, 90], [360, 320], [800, 150], [540, 280], [280, 250], [650, 160], [450, 330], [760, 70],
  ]
  const bez = (s: number): [number, number] => {
    const [p0, p1, p2] = [[420, 70], [760, 150], [540, 320]]
    const a = (1 - s) * (1 - s)
    const b = 2 * (1 - s) * s
    const c = s * s
    return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]
  }
  const m = prog(t, 21.5, 3.5)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={360} at={0.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.red}>step 마다 따로 sampling · 예</Head>
          <Cells signs={['+', '−', '−', '+', '+', '−', '+', '−']} at={0.8} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.6) }}>+ 는 오른쪽 길(+20°) · − 는 왼쪽 길(−20°) · 앞에서 고른 쪽이 다음에 안 들어간다</span>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 6.8) }}>
            <span style={line(C.text, 24)}>8 step 이 모두 같은 쪽:</span>
            <span style={mono(C.red, 26)}>
              2 × 0.5<Sup>8</Sup> = 2 ÷ 256 ≈ 0.008
            </span>
          </div>
        </div>
      </Card>
      <Card x={976} y={130} w={880} h={360} at={13.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head color={C.green}>action chunk · 여러 step 을 한 번에 정한다</Head>
          <Cells signs={['−', '−', '−', '−', '−', '−', '−', '−']} at={13.6} step={0.05} />
          <div style={{ ...mono(C.accent, 26), opacity: prog(t, 14.8) }}>
            A<Sub>t</Sub> = (a<Sub>t</Sub>, a<Sub>t+1</Sub>, …, a<Sub>t+15</Sub>)
          </div>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 16) }}>
            prediction horizon T<Sub>p</Sub> = 16 · chunk 하나는 한 봉우리에서 나온다
          </span>
        </div>
      </Card>
      <Card x={64} y={520} w={1792} h={360} at={20.0}>
        <svg width={1000} height={360} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            길이 16 chunk 의 denoising
          </text>
          <text x={30} y={72} fill={C.dim} fontSize={20}>
            모식도
          </text>
          <TBlock cx={500} top={150} bar={150} stem={100} fill={C.cardEdge} stroke={C.muted} />
          <path d="M 420 70 Q 760 150 540 320" fill="none" stroke={`${C.purple}66`} strokeWidth={3} strokeDasharray="8 8" opacity={m} />
          {scatter.map(([x, y], i) => {
            const [bx, by] = bez(i / 15)
            return <circle key={i} cx={lerp(x, bx, m)} cy={lerp(y, by, m)} r={9} fill={m > 0.95 ? C.purple : C.accent} />
          })}
          <text x={970} y={40} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={1 - m}>
            k = 5 · 흩어진 16 개
          </text>
          <text x={970} y={40} textAnchor="end" fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={m}>
            k = 0 · 오른쪽 길과 겹침
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 1030, top: 24, width: 730, display: 'grid', gap: 10 }}>
          <Head>PushT 의 chunk 하나</Head>
          {[
            ['action 하나 = 손끝이 갈 목표 위치 (x, y)', 20.4],
            ['16 × 2 = 숫자 32 개 · noise 도 같은 모양으로 32 개', 21.2],
            ['network 가 32 개를 한꺼번에 보고 답을 낸다', 22.4],
            ['첫 step 이 오른쪽 길이면 나머지도 오른쪽 길', 23.6],
          ].map(([s, at]) => (
            <span key={s as string} style={{ ...line(C.text, 24), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 25) }}>
            관측: 최근 2 step 의 사진 (T<Sub>o</Sub> = 2)
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

const xs = (step: number) => 260 + step * 58

function Receding() {
  const t = useSec()
  const rows: { y: number; from: number; at: number; label: string; keep: string; drop?: string }[] = [
    { y: 84, from: 0, at: 0.8, label: 'step 0 의 chunk', keep: '실행 · step 0 ~ 7', drop: '버림 · step 8 ~ 15' },
    { y: 164, from: 8, at: 3.2, label: 'step 8 의 chunk', keep: '실행 · step 8 ~ 15', drop: '버림 · step 16 ~ 23' },
    { y: 244, from: 16, at: 4.6, label: 'step 16 의 chunk', keep: '실행 · step 16 ~ 23' },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={410} at={0.3}>
        <svg width={1792} height={410} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            receding horizon · simulation PushT 설정
          </text>
          {[0, 8, 16].map((s) => (
            <line key={s} x1={xs(s)} y1={70} x2={xs(s)} y2={330} stroke={C.accent} strokeWidth={2} strokeDasharray="4 6" opacity={0.5 * prog(t, s === 0 ? 0.8 : s === 8 ? 3.2 : 4.6)} />
          ))}
          {rows.map((r) => {
            const p = prog(t, r.at)
            return (
              <g key={r.from} opacity={p}>
                <text x={30} y={r.y + 32} fill={C.muted} fontSize={22}>
                  {r.label}
                </text>
                <rect x={xs(r.from)} y={r.y} width={xs(r.from + 8) - xs(r.from)} height={48} rx={8} fill={`${C.accent}44`} stroke={C.accent} strokeWidth={2} />
                <text x={(xs(r.from) + xs(r.from + 8)) / 2} y={r.y + 32} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                  {r.keep}
                </text>
                {r.drop && (
                  <g>
                    <rect x={xs(r.from + 8)} y={r.y} width={xs(r.from + 16) - xs(r.from + 8)} height={48} rx={8} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="8 6" />
                    <text x={(xs(r.from + 8) + xs(r.from + 16)) / 2} y={r.y + 32} textAnchor="middle" fill={C.dim} fontSize={22}>
                      {r.drop}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
          <g opacity={prog(t, 0.6)}>
            <line x1={xs(0)} y1={330} x2={xs(24)} y2={330} stroke={C.muted} strokeWidth={2} />
            {[0, 4, 8, 12, 16, 20, 24].map((s) => (
              <g key={s}>
                <line x1={xs(s)} y1={330} x2={xs(s)} y2={338} stroke={C.muted} strokeWidth={2} />
                <text x={xs(s)} y={362} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {s}
                </text>
              </g>
            ))}
            <text x={30} y={362} fill={C.muted} fontSize={20}>
              step
            </text>
          </g>
          <text x={xs(0)} y={396} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 12.3)}>
            10 Hz · step 하나 0.1 초 → 8 step 마다 추론 · 8 × 0.1 = 0.8 초
          </text>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 20, display: 'flex', gap: 14, opacity: prog(t, 6.3) }}>
          <span style={{ ...mono(C.muted, 24), padding: '4px 14px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}` }}>
            prediction horizon T<Sub>p</Sub> = 16
          </span>
          <span style={{ ...mono(C.accent, 24), padding: '4px 14px', borderRadius: 999, border: `1.5px solid ${C.accent}88` }}>
            action horizon T<Sub>a</Sub> = 8
          </span>
        </div>
      </Card>
      <Card x={64} y={570} w={880} h={310} at={18.2}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head>action horizon 을 바꾸면 (10 Hz, T<Sub>p</Sub> = 16)</Head>
          {[
            ['1', 'step 마다 새 noise 의 첫 action · 봉우리 사이를 오감', C.red, 18.5],
            ['8', 'step 2 의 변화를 step 8 에 반영 · 0.6 초 뒤', C.green, 19.6],
            ['16', '다음 추론 step 16 까지 · 1.4 초 동안 옛 계획', C.orange, 20.7],
          ].map(([k, v, c, at]) => (
            <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={{ ...mono(c as string, 24), width: 150 }}>
                T<Sub>a</Sub> = {k}
              </span>
              <span style={line(C.text, 22)}>{v}</span>
            </div>
          ))}
          <span style={{ ...line(C.dim, 22), opacity: prog(t, 22) }}>
            실물 PushT 실험: T<Sub>p</Sub> = 16, T<Sub>a</Sub> = 6
          </span>
        </div>
      </Card>
      <Card x={976} y={570} w={880} h={310} at={24.2}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 10 }}>
          <Head>같은 step 의 예측 +20°, −20°, +20° 가 겹치면</Head>
          <span style={{ ...line(C.orange, 22), fontWeight: 600 }}>ACT · temporal ensembling</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 24.8) }}>weight 1, 0.990, 0.980 으로 가중 평균</span>
          <span style={{ ...mono(C.red, 24), opacity: prog(t, 25.6) }}>19.8 ÷ 2.970 ≈ 6.67° → 부딪히는 구간</span>
          <span style={{ ...line(C.green, 22), fontWeight: 600, opacity: prog(t, 26.6) }}>Diffusion Policy · receding horizon</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 27.2) }}>섞지 않고 실행 중인 chunk 의 +20° 를 그대로 실행</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 3. encoder and denoiser ----------

function Grid3({ x, y, cell, values, hot, color, size = 26 }: { x: number; y: number; cell: number; values: string[]; hot: number; color: string; size?: number }) {
  return (
    <g>
      {values.map((v, i) => {
        const cx = x + (i % 3) * cell
        const cy = y + Math.floor(i / 3) * cell
        const on = i === hot
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={cell} height={cell} fill={on ? `${color}33` : C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={cx + cell / 2} y={cy + cell / 2 + size * 0.36} textAnchor="middle" fill={on ? color : C.muted} fontSize={size} fontFamily={MONO} fontWeight={600}>
              {v}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Encoder() {
  const t = useSec()
  const cell = 80
  const g3 = { x: 610, y: 50 }
  const c3 = { x: g3.x + 120, y: g3.y + 120 }
  const dot = { x: c3.x + 0.415 * 120, y: c3.y - 0.415 * 120 }
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={750} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 24, display: 'grid', gap: 14 }}>
          <Head>image encoder · 사진 → keypoint</Head>
          <Flow steps={['사진', 'ResNet-18', 'spatial softmax', 'keypoint (x, y)']} color={C.accent} at={0.8} />
          <span style={{ ...line(C.red, 22), opacity: prog(t, 6.8) }}>✕ global average pooling: 칸의 평균 하나만 남아 위치가 사라진다</span>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 8.6) }}>✓ spatial softmax: 값이 큰 칸의 위치 (x, y) 를 뽑는다</span>
        </div>
        <svg width={900} height={380} style={{ position: 'absolute', left: 0, top: 250, opacity: prog(t, 13.3) }}>
          <text x={150} y={30} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
            3×3 feature map
          </text>
          <text x={440} y={30} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
            softmax 확률
          </text>
          <text x={730} y={30} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
            좌표의 기댓값
          </text>
          <Grid3 x={30} y={50} cell={cell} values={['0', '0', '2', '0', '0', '0', '0', '0', '0']} hot={2} color={C.accent} />
          <g opacity={prog(t, 14.3)}>
            {arrow(276, 170, 314, 170, C.muted, 3)}
            <Grid3 x={320} y={50} cell={cell} values={['0.065', '0.065', '0.480', '0.065', '0.065', '0.065', '0.065', '0.065', '0.065']} hot={2} color={C.accent} size={20} />
          </g>
          <g opacity={prog(t, 16.0)}>
            {arrow(566, 170, 604, 170, C.muted, 3)}
            <rect x={g3.x} y={g3.y} width={240} height={240} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <rect x={g3.x + 160} y={g3.y} width={80} height={80} fill={`${C.accent}22`} />
            <line x1={g3.x} y1={c3.y} x2={g3.x + 240} y2={c3.y} stroke={C.cardEdge} strokeWidth={1} />
            <line x1={c3.x} y1={g3.y} x2={c3.x} y2={g3.y + 240} stroke={C.cardEdge} strokeWidth={1} />
            <text x={g3.x + 8} y={g3.y + 26} fill={C.dim} fontSize={20} fontFamily={MONO}>
              (−1, −1)
            </text>
            <text x={g3.x + 232} y={g3.y + 230} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              (1, 1)
            </text>
            <circle cx={dot.x} cy={dot.y} r={10} fill={C.accent} />
            <circle cx={dot.x} cy={dot.y} r={18} fill="none" stroke={C.accent} strokeWidth={2} />
            <text x={c3.x} y={322} textAnchor="middle" fill={C.accent} fontSize={20} fontFamily={MONO} fontWeight={600}>
              (0.415, −0.415)
            </text>
          </g>
          <text x={30} y={322} fill={C.muted} fontSize={20} fontFamily={MONO} opacity={prog(t, 14.3)}>
            e² ≈ 7.389 · 합 7.389 + 8 = 15.389
          </text>
          <text x={30} y={356} fill={C.muted} fontSize={20} fontFamily={MONO} opacity={prog(t, 14.8)}>
            7.389 ÷ 15.389 ≈ 0.480 · 1 ÷ 15.389 ≈ 0.065
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 650, width: 840, opacity: prog(t, 17.5) }}>
          <span style={line(C.text, 22)}>LeRobot: keypoint 32 개 → 사진 한 장이 32 × 2 = 64 개의 숫자</span>
        </div>
      </Card>
      <Card x={996} y={130} w={860} h={750} at={0.3}>
        <div style={{ position: 'absolute', left: 30, top: 24, width: 800, display: 'grid', gap: 10 }}>
          <Head>논문의 encoder</Head>
          {[
            ['ResNet-18 · pretrained weight 없이 처음부터', 0.8],
            ['diffusion head 의 loss 로 함께 학습', 2.0],
            ['카메라마다 encoder 를 따로 둔다', 3.2],
            ['BatchNorm 을 GroupNorm 으로 바꾼다', 4.4],
          ].map(([s, at]) => (
            <span key={s as string} style={{ ...line(C.text, 24), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 30, top: 300, width: 800, display: 'grid', gap: 14, opacity: prog(t, 20.3) }}>
          <Label size={22} color={C.muted}>
            robomimic Square (사각 고리를 막대에 끼우기) · 성공률
          </Label>
          <Table
            head={['encoder', '처음부터', '고정', 'fine-tuning']}
            widths={[270, 150, 130, 190]}
            at={20.5}
            rows={[
              ['ResNet-18', '0.94', <span style={{ color: C.red }}>0.58</span>, '0.92'],
              ['ResNet-34', '0.92', <span style={{ color: C.red }}>0.40</span>, '0.94'],
              ['ViT-B/16 (CLIP)', '0.22', '0.70', <span style={{ color: C.green }}>0.98</span>],
            ]}
          />
          <span style={{ ...line(C.dim, 22), opacity: prog(t, 23) }}>pretrained: ResNet 은 ImageNet-21k, ViT 는 CLIP · fine-tuning 때 encoder 의 learning rate 는 10 분의 1</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 25) }}>LeRobot 은 2026 년 5 월부터 ImageNet pretrained ResNet-18 과 BatchNorm 이 기본값</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Denoiser() {
  const t = useSec()
  const input = [0, 0, 4, 0, 0, 0]
  const output = [0, 1, 2, 1, 0, 0]
  const cx = (i: number) => 110 + i * 110
  const pos = Math.floor(lerp(0, 6, prog(t, 6.5, 5))) // kernel position; 6 = done
  const blocks: [number, number, string][] = [
    [70, 160, '16'],
    [230, 90, '8'],
    [390, 50, '4'],
    [550, 90, '8'],
    [710, 160, '16'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={330} at={0.3}>
        <svg width={880} height={330}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            시간축 1D convolution · kernel (0.25, 0.5, 0.25)
          </text>
          <text x={30} y={86} fill={C.muted} fontSize={22}>
            입력
          </text>
          <text x={30} y={216} fill={C.muted} fontSize={22}>
            출력
          </text>
          {input.map((v, i) => {
            const near = pos < 6 && Math.abs(i - pos) <= 1 && t > 6.5
            return (
              <g key={i} opacity={prog(t, 0.6 + i * 0.1)}>
                <rect x={cx(i)} y={100} width={90} height={60} rx={8} fill={near ? `${C.accent}33` : C.bg} stroke={near ? C.accent : C.cardEdge} strokeWidth={2} />
                <text x={cx(i) + 45} y={141} textAnchor="middle" fill={v ? C.orange : C.muted} fontSize={30} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
              </g>
            )
          })}
          {pos < 6 &&
            t > 6.5 &&
            [-1, 0, 1]
              .filter((d) => pos + d >= 0 && pos + d < 6)
              .map((d) => <line key={d} x1={cx(pos + d) + 45} y1={162} x2={cx(pos) + 45} y2={228} stroke={C.accent} strokeWidth={2} opacity={0.8} />)}
          {output.map((v, i) => (
            <g key={i} opacity={prog(t, 0.6 + i * 0.1)}>
              <rect x={cx(i)} y={230} width={90} height={60} rx={8} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
              <text x={cx(i) + 45} y={271} textAnchor="middle" fill={v ? C.green : C.muted} fontSize={30} fontFamily={MONO} fontWeight={600} opacity={t > 6.5 && i < pos ? 1 : 0}>
                {v}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Card x={976} y={130} w={880} h={330} at={12.2}>
        <svg width={880} height={330}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            1D U-Net · 시간축 길이 16 → 8 → 4 → 8 → 16
          </text>
          <g opacity={prog(t, 13.4)}>
            <polyline points={`120,130 120,108 760,108 760,130`} fill="none" stroke={C.purple} strokeWidth={2.5} />
            <polyline points={`280,165 280,152 600,152 600,165`} fill="none" stroke={C.purple} strokeWidth={2.5} />
            <text x={440} y={136} textAnchor="middle" fill={C.purple} fontSize={20}>
              skip connection
            </text>
          </g>
          {blocks.map(([x, h, label], i) => (
            <g key={i} opacity={prog(t, 12.6 + i * 0.3)}>
              <rect x={x} y={210 - h / 2} width={100} height={h} rx={8} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} />
              <text x={x + 50} y={219} textAnchor="middle" fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={600}>
                {label}
              </text>
              {i < blocks.length - 1 && arrow(x + 108, 210, x + 152, 210, C.muted, 2.5, 9)}
            </g>
          ))}
          <text x={30} y={318} fill={C.muted} fontSize={20} opacity={prog(t, 15)}>
            길이 4 에서 chunk 전체의 큰 모양이 정해지고, skip connection 이 세밀한 값을 되살린다
          </text>
        </svg>
      </Card>
      <Card x={64} y={490} w={1792} h={390} at={18.2}>
        <div style={{ position: 'absolute', left: 30, top: 24, width: 820, display: 'grid', gap: 10 }}>
          <Head color={C.blue}>CNN denoiser 의 조건 (lerobot/diffusion_pusht)</Head>
          {[
            [<>사진 2 장의 keypoint + 손끝 위치 → 관측 조건 132 개</>, 18.5],
            [<>단계 번호 embedding 128 개를 이어 붙여 132 + 128 = 260 개</>, 19.6],
            [<>FiLM: 260 개로 channel 마다 γ, β 를 만들어 h 를 γh + β 로</>, 20.8],
            [<>모든 block 에 넣고, A<Sup>k</Sup> (16, 2) 를 받아 같은 모양의 noise 추정</>, 22.0],
          ].map(([s, at], i) => (
            <span key={i} style={{ ...line(C.text, 23), opacity: prog(t, at as number) }}>
              {s as ReactNode}
            </span>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 920, top: 24, width: 820, display: 'grid', gap: 10, opacity: prog(t, 24.2) }}>
          <Head color={C.pink}>transformer denoiser</Head>
          {[
            ['noise 섞인 action 16 개 → 입력 token 16 개', 24.4],
            ['단계 번호 k 의 embedding 을 맨 앞 token 으로 붙인다', 25.2],
            ['causal attention: 자기와 앞 step 의 token 만 참고', 26.0],
            ['관측 embedding 은 cross-attention 으로 받는다', 26.8],
          ].map(([s, at]) => (
            <span key={s as string} style={{ ...line(C.text, 23), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 27.6) }}>권장: 새 과제는 CNN 먼저 · 급하게 바뀌는 action 은 transformer</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 4. DDIM and PushT ----------

const sx = (s: number) => 300 + s * 420
const xk2 = (k: number) => 120 + (5 - k) * 180
const yv2 = (v: number) => 320 - ((v - 0.3) / 0.8) * 240

function Ddim() {
  const t = useSec()
  const ddpm: [number, number][] = [
    [5, 0.6],
    [4, 0.65],
    [3, 0.41],
    [2, 0.58],
    [1, 0.92],
    [0, 1.0],
  ]
  const a: [number, number][] = [
    [5, 0.6],
    [3, 0.56],
    [1, 0.67],
    [0, 1.0],
  ]
  const b: [number, number][] = [
    [5, 0.6],
    [2, 0.51],
    [0, 0.91],
  ]
  const P = (q: [number, number][]): [number, number][] => q.map(([k, v]) => [xk2(k), yv2(v)])
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={360} at={0.3}>
        <svg width={880} height={360}>
          <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            chunk 하나를 만드는 시간
          </text>
          <g opacity={prog(t, 3.5)}>
            <line x1={sx(0.8)} y1={100} x2={sx(0.8)} y2={262} stroke={C.orange} strokeWidth={2.5} strokeDasharray="6 6" />
            <text x={sx(0.8)} y={90} textAnchor="middle" fill={C.orange} fontSize={20} fontWeight={600}>
              0.8 초마다 새 chunk 필요
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <text x={30} y={140} fill={C.text} fontSize={22} fontWeight={600}>
              DDPM 100 단계
            </text>
            <text x={30} y={166} fill={C.dim} fontSize={20}>
              예: 한 번 0.01 초
            </text>
            <rect x={sx(0)} y={118} width={(sx(1) - sx(0)) * prog(t, 1.2, 1.2)} height={34} rx={6} fill={C.red} />
            <text x={sx(1) + 12} y={143} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 2.2)}>
              1 초
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <text x={30} y={230} fill={C.text} fontSize={22} fontWeight={600}>
              DDIM 10 단계
            </text>
            <text x={30} y={256} fill={C.dim} fontSize={20}>
              RTX 3080 · 저자 보고
            </text>
            <rect x={sx(0)} y={208} width={(sx(0.1) - sx(0)) * prog(t, 7.2, 0.6)} height={34} rx={6} fill={C.green} />
            <text x={sx(0.1) + 12} y={233} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7.8)}>
              0.1 초
            </text>
          </g>
          <text x={30} y={305} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 4.2)}>
            100 × 0.01 = 1 초 &gt; 0.8 초 → 제때 못 낸다
          </text>
          <text x={30} y={340} fill={C.muted} fontSize={22} opacity={prog(t, 9.5)}>
            학습은 100 단계 그대로 · 실물 과제 설정표의 실행 단계는 16
          </text>
        </svg>
      </Card>
      <Card x={976} y={130} w={880} h={360} at={13.3}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 12 }}>
          <Head>DDIM 한 번 건너뛰기 (k → k')</Head>
          {[
            [<>1. 원래 값 추정 = (A<Sup>k</Sup> − noise 비중 × 답) ÷ action 비중</>, 13.7, C.text],
            [<>2. A<Sup>k'</Sup> = action 비중' × 추정 + noise 비중' × 답</>, 15.0, C.text],
            [<>새 noise 를 더하지 않는다 → 같은 출발점이면 같은 결과</>, 16.6, C.accent],
            [<>DDPM 과 같은 loss 로 학습한 network 를 그대로 쓴다</>, 18.0, C.muted],
          ].map(([s, at, c], i) => (
            <span key={i} style={{ ...line(c as string, 24), opacity: prog(t, at as number) }}>
              {s as ReactNode}
            </span>
          ))}
        </div>
      </Card>
      <Card x={64} y={520} w={1792} h={360} at={20.0}>
        <svg width={1120} height={360} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            상자 장면의 0.60 에서 시작한 세 sampling (5 단계 schedule)
          </text>
          {[5, 4, 3, 2, 1, 0].map((k) => (
            <g key={k}>
              <line x1={xk2(k)} y1={70} x2={xk2(k)} y2={322} stroke={C.grid} strokeWidth={1.5} />
              <text x={xk2(k)} y={348} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                k = {k}
              </text>
            </g>
          ))}
          <text x={xk2(5) - 14} y={yv2(0.6) + 7} textAnchor="end" fill={C.text} fontSize={20} fontFamily={MONO}>
            0.60
          </text>
          <Path pts={P(ddpm)} color={C.muted} at={20.4} step={0.3} width={3} />
          <Path pts={P(a)} color={C.green} at={21.8} step={0.5} />
          <Path pts={P(b)} color={C.orange} at={23.6} step={0.6} />
          <text x={xk2(0) + 14} y={yv2(1.0) + 7} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 23.2)}>
            1.00
          </text>
          <text x={xk2(0) + 14} y={yv2(0.91) + 14} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 24.8)}>
            0.91
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 1150, top: 30, width: 610, display: 'grid', gap: 12 }}>
          {[
            ['DDPM · network 5 번 → 1.00 → +20°', C.muted, 20.4],
            ['DDIM 5 → 3 → 1 → 0 · 3 번 → 1.00 → +20°', C.green, 21.8],
            ['DDIM 5 → 2 → 0 · 2 번 → 0.91', C.orange, 23.6],
          ].map(([s, c, at]) => (
            <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: prog(t, at as number) }}>
              <span style={{ width: 28, height: 4, background: c as string, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ ...line(c as string, 22), fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
          ))}
          <span style={{ ...mono(C.orange, 22), opacity: prog(t, 25) }}>1.91 ÷ 2 × 40 − 20 = 18.2°</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 26) }}>단계를 너무 줄이면 평균 쪽으로 조금 끌린 값이 남는다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function PushT() {
  const t = useSec()
  const setup: [ReactNode, ReactNode][] = [
    ['관측', '96×96 사진 + 손끝의 지금 위치'],
    ['action', '손끝이 갈 목표 위치 (x, y)'],
    ['시연', '사람이 조종한 200 개'],
    ['dataset', 'lerobot/pusht · 206 episode · 10 Hz'],
    [
      'horizon',
      <>
        T<Sub>o</Sub>, T<Sub>p</Sub>, T<Sub>a</Sub> = 2, 16, 8
      </>,
    ],
    ['평가', '블록이 목표를 덮은 비율 (coverage)'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={640} h={750} at={0.3}>
        <svg width={640} height={300} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            PushT
          </text>
          <text x={120} y={40} fill={C.dim} fontSize={20}>
            모식도
          </text>
          <TBlock cx={500} top={120} bar={120} stem={90} fill="none" stroke={C.green} dash="8 6" rotate={30} />
          <text x={500} y={290} textAnchor="middle" fill={C.green} fontSize={20}>
            목표 자리
          </text>
          <TBlock cx={290} top={120} bar={140} stem={100} fill={C.cardEdge} stroke={C.muted} />
          <circle cx={290} cy={70} r={18} fill={C.blue} />
          <text x={318} y={64} fill={C.blue} fontSize={22} fontWeight={600}>
            손끝
          </text>
          <path d="M 274 82 C 180 110, 180 200, 200 240 S 250 282, 282 272" fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="8 7" opacity={prog(t, 1.4)} />
          <path d="M 306 82 C 400 110, 400 200, 380 240 S 330 282, 298 272" fill="none" stroke={C.purple} strokeWidth={3} strokeDasharray="8 7" opacity={prog(t, 1.4)} />
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 310, width: 580, display: 'grid', gap: 8 }}>
          {setup.map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, ...line(C.text, 22), opacity: prog(t, 1.8 + i * 0.4) }}>
              <span style={{ color: C.muted, width: 110, flexShrink: 0 }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 30, top: 580, width: 580, boxSizing: 'border-box', padding: '16px 22px', borderRadius: 16, border: `1.5px solid ${C.accent}66`, background: `${C.accent}10`, display: 'grid', gap: 6, opacity: prog(t, 24.3) }}>
          <span style={{ ...line(C.accent, 22), fontWeight: 600 }}>LeRobot checkpoint · simulation 500 episode</span>
          <span style={line(C.text, 22)}>최대 겹침 평균 0.955 (공식 구현 0.957)</span>
          <span style={line(C.text, 22)}>기준 0.95 이상 → 성공률 65.4% (64.2%)</span>
        </div>
      </Card>
      <Card x={736} y={130} w={1120} h={330} at={6.0}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 2 }}>
            <Head>simulation PushT · 사진 관측 · coverage (DP = Diffusion Policy)</Head>
            <Label size={20} color={C.dim}>
              가장 좋은 checkpoint · 회색은 마지막 10 개의 평균 · 학습 3 번, 시작 상태 50 개
            </Label>
          </div>
          <Bar label="LSTM-GMM" value={0.69} max={1} color={C.orange} at={6.4} sub="마지막 10 개 0.54" />
          <Bar label="IBC" value={0.75} max={1} color={C.red} at={6.9} sub="마지막 10 개 0.64" />
          <Bar label="DP · CNN" value={0.91} max={1} color={C.green} at={7.4} sub="마지막 10 개 0.84" />
          <Bar label="DP · transformer" value={0.78} max={1} color={C.pink} at={7.9} sub="마지막 10 개 0.66" />
        </div>
      </Card>
      <Card x={736} y={490} w={1120} h={390} at={12.0}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 10 }}>
          <Head>실물 PushT 성공률 · UR5 · 시연 136 개 · 시작 상태 20 개 · 회색은 마지막 IoU</Head>
          <Bar label="사람 시연" value={100} max={100} unit="%" color={C.muted} at={12.6} sub="IoU 0.84" labelW={320} />
          <Bar label="DP · CNN" value={95} max={100} unit="%" color={C.green} at={18.3} sub="IoU 0.80" labelW={320} />
          <Bar label="DP · R3M encoder" value={80} max={100} unit="%" color={C.green} at={18.7} sub="IoU 0.66" labelW={320} />
          <Bar label="DP · transformer" value={65} max={100} unit="%" color={C.pink} at={19.1} sub="IoU 0.53" labelW={320} />
          <Bar label="DP · ImageNet encoder" value={15} max={100} unit="%" color={C.blue} at={19.5} sub="IoU 0.24" labelW={320} />
          <Bar label="LSTM-GMM · 위치 action" value={20} max={100} unit="%" color={C.orange} at={20.3} sub="IoU 0.24" labelW={320} />
          <Bar label="IBC · 위치 action" value={0} max={100} unit="%" color={C.red} at={20.7} sub="IoU 0.14" labelW={320} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'MSE head 는 0° 로 충돌 · diffusion head 는 −20° 나 +20° 근처 · 0.60 → 1.00 → +20°', at: 0.6 },
    { tag: script.sections[1], color: C.blue, text: 'action 16 개를 chunk 하나로 · 앞 8 개만 실행하고 다시 만들기 · 0.8 초마다 추론', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'spatial softmax 로 keypoint 위치 · 조건 260 개를 FiLM 으로 · 1D U-Net 16 → 8 → 4', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'DDIM 10 단계로 0.1 초 · 실물 PushT 성공률 95% 대 LSTM-GMM 20%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            시연에 있던 길 하나를 끝까지 따라가려면 policy 는 무엇을 내야 할까?
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
            NEXT · IMITATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Flow Matching · π0 · Real Robot</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            적은 단계로 sampling 하기 · action chunk head 를 큰 모델에 붙이기 · 실물 로봇 팔에서 실행하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/diffusion-policy (Chi 등 2023 · Janner 등 2022 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseMse = () => (
  <PauseWrite
    question="시연이 −20° 7 개와 +20° 3 개라면 MSE head 는 몇 도를 낼까? 이상적으로 학습한 RT-1 head 는 −20° 가 든 108 번 칸과 +20° 가 든 148 번 칸에 확률을 얼마씩 줄까?"
    answer={
      <>
        MSE: (7 × (−20) + 3 × 20) ÷ 10 = −80 ÷ 10 = −8° → −10° ~ +10° 안이라 상자에 부딪힌다
        <br />
        RT-1: 정답이 나온 비율대로 108 번 칸 0.7 · 148 번 칸 0.3
      </>
    }
  />
)

const PauseHorizon = () => (
  <PauseWrite
    question="10 Hz 로봇에서 prediction horizon 16, action horizon 4 로 바꾸면 추론은 몇 초마다 하고, chunk 하나에서 버리는 action 은 몇 개일까? step 3 의 변화는 몇 초 뒤에 반영될까?"
    answer={
      <>
        추론 간격 4 × 0.1 = 0.4 초 · 버리는 action 16 − 4 = 12 개
        <br />
        추론은 step 0, 4, 8 … → step 3 의 변화는 step 4 에 반영 · 4 − 3 = 1 step = 0.1 초
      </>
    }
  />
)

const PauseSpatial = () => (
  <PauseWrite
    question="3×3 feature map 의 가운데 칸만 2 이고 나머지가 0 이면 spatial softmax 의 결과는?"
    answer={
      <>
        확률: 가운데 칸 0.480 · 나머지 여덟 칸 0.065 씩
        <br />
        나머지 칸은 좌우 · 위아래가 똑같이 놓여 기여가 지워지고, 가운데 좌표가 (0, 0) 이라 결과는 (0, 0)
      </>
    }
  />
)

const PauseDdim = () => (
  <PauseWrite
    question="network 한 번에 0.02 초가 걸린다. 100 단계와 10 단계의 추론 시간은 각각 얼마이고, 0.8 초마다 새 chunk 가 필요할 때 제때 나오는 것은?"
    answer={
      <>
        100 단계: 100 × 0.02 = 2 초 · 10 단계: 10 × 0.02 = 0.2 초
        <br />
        0.8 초 안에 끝나는 것은 10 단계뿐
      </>
    }
  />
)

export function DiffusionPolicy() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        heads: Heads,
        denoise: Denoise,
        'pause-mse': PauseMse,
        chunk: Chunk,
        receding: Receding,
        'pause-horizon': PauseHorizon,
        encoder: Encoder,
        denoiser: Denoiser,
        'pause-spatial': PauseSpatial,
        ddim: Ddim,
        pusht: PushT,
        'pause-ddim': PauseDdim,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
