import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './sim2real-locomotion.narration.json'
import { script } from './sim2real-locomotion.script'

// Numbers follow lessons/sim2real-locomotion/README.md (see sim2real-locomotion.script.ts). The quadruped drawings are
// schematic (marked 모식도); the friction, gait and noise values are the lesson's own example values (marked 예).

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false }: { children: ReactNode; color?: string; at: number; mono?: boolean }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '9px 18px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 23, fontWeight: 600, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap' }}>
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
      <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
      {sub && <span style={{ fontSize: 21, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
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

/** the padded column most cards use */
function Inner({ gap = 14, children }: { gap?: number; children: ReactNode }) {
  return <div style={{ padding: '22px 28px', display: 'grid', alignContent: 'start', gap }}>{children}</div>
}

const line = (color = C.text, size = 23): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.5, size = 23, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
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

/** a side-view quadruped: body, head and four two-segment legs; `shake` makes the legs tremble */
function Dog({ cx, ground, color, tilt = 0, shake = 0, t }: { cx: number; ground: number; color: string; tilt?: number; shake?: number; t: number }) {
  const bodyY = ground - 110
  const hips = [-78, -48, 48, 78]
  return (
    <g transform={`rotate(${tilt} ${cx} ${ground})`}>
      {hips.map((hx, i) => {
        const wob = shake * Math.sin(t * 38 + i * 1.7)
        const kx = cx + hx + (i < 2 ? -14 : 14) + wob
        const ky = bodyY + 56
        return (
          <g key={i}>
            <line x1={cx + hx} y1={bodyY + 20} x2={kx} y2={ky} stroke={color} strokeWidth={9} strokeLinecap="round" />
            <line x1={kx} y1={ky} x2={cx + hx + wob * 0.6} y2={ground - 4} stroke={color} strokeWidth={8} strokeLinecap="round" />
          </g>
        )
      })}
      <rect x={cx - 105} y={bodyY - 6} width={210} height={44} rx={16} fill={C.card} stroke={color} strokeWidth={4} />
      <rect x={cx + 100} y={bodyY - 22} width={46} height={34} rx={10} fill={C.card} stroke={color} strokeWidth={4} />
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
            RL · LEGGED ROBOTS
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 108, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Sim-to-Real Locomotion</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            ANYmal · A1 · Minitaur · <span style={{ color: C.accent }}>legged_gym</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            simulation 에서 배운 4족 보행 policy 를, 마찰도 motor 도 다른 실제 로봇에서 걷게 하기
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
  const shake = 6 * prog(t, 1.4, 0.5)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={880} h={320} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 20, display: 'flex', gap: 20, alignItems: 'baseline' }}>
          <Head color={C.blue}>simulation · 이상적인 PD 식</Head>
          <Label size={20} color={C.dim}>
            모식도
          </Label>
        </div>
        <svg width={880} height={320} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={150} x2={730} y1={250} y2={250} stroke={C.cardEdge} strokeWidth={3} />
          <Dog cx={420} ground={250} color={C.blue} t={t} />
        </svg>
        <div style={{ position: 'absolute', left: 28, top: 264, opacity: prog(t, 0.8) }}>
          <span style={line(C.green, 24)}>✓ 넘어지지 않고 잘 걷는다</span>
        </div>
      </Card>
      <Card x={976} y={130} w={880} h={320} at={1}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <Head color={C.orange}>실제 ANYmal · 같은 policy</Head>
        </div>
        <svg width={880} height={320} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={150} x2={730} y1={250} y2={250} stroke={C.cardEdge} strokeWidth={3} />
          <Dog cx={420} ground={250} color={C.orange} tilt={-7 * prog(t, 1.4, 0.8)} shake={shake} t={t} />
        </svg>
        <div style={{ position: 'absolute', left: 28, top: 264, opacity: prog(t, 1.6) }}>
          <span style={line(C.red, 24)}>✕ 다리가 심하게 떨리며 한 걸음도 내딛지 못했다 (Hwangbo 등 2019)</span>
        </div>
      </Card>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 478, width: 1792 }}>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          로봇도 policy 도 그대로인데, <span style={{ color: C.accent }}>simulation 을 어떻게 바꿔야 할까?</span>
        </div>
      </Appear>
      <Card x={330} y={610} w={1260} h={260} at={5.4}>
        <Inner gap={16}>
          <Label size={23}>Rudin 등(2021) · 이렇게 꾸민 simulation 에서 GPU 한 장으로 ANYmal 을 학습해 실제 로봇에 옮김</Label>
          <Bar label="평지 보행" value={4} max={22} color={C.blue} at={5.8} width={560} unit=" 분 안에" labelW={300} />
          <Bar label="계단 · 경사 지형 보행" value={20} max={22} color={C.green} at={6.3} width={560} unit=" 분 안에" labelW={300} />
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 6.9) }}>이 논문의 코드가 legged_gym 이다</span>
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- policy 와 reward ----------

function ObsAction() {
  const t = useSec()
  const rows: [string, number, string, number][] = [
    ['몸통 속도', 3, 'state estimator', 0.8],
    ['몸통 회전 속도', 3, 'IMU', 1.3],
    ['중력 방향', 3, 'IMU 로 계산', 1.8],
    ['속도 명령', 3, '조종기', 2.3],
    ['관절 각도', 12, 'motor 각도 센서', 2.8],
    ['관절 속도', 12, '각도의 변화', 3.3],
    ['직전 action', 12, 'policy 의 앞 step 출력', 3.8],
  ]
  const lit = prog(t, 6.6)
  const steps: [string, ReactNode, number, string][] = [
    ['목표 각도', '−1.5 + 0.25 × 0.4 = −1.4 rad', 13.3, C.text],
    ['각도 차이', '−1.4 − (−1.45) = 0.05 rad', 19.7, C.text],
    ['P 항', '20 × 0.05 = 1.0 N·m', 20.6, C.text],
    ['D 항', '0.5 × 0 = 0 (멈춰 있음)', 21.4, C.text],
    ['torque', '1.0 − 0 = 1.0 N·m', 22.2, C.accent],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={830} h={740} at={0.3}>
        <Inner gap={10}>
          <Head>observation 48 개 · ANYmal C 평지 설정</Head>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, marginTop: 6 }}>
            <span style={{ width: 270, ...line(C.muted, 21) }}>숫자 묶음</span>
            <span style={{ width: 90, textAlign: 'right', paddingRight: 30, ...line(C.muted, 21) }}>개수</span>
            <span style={{ width: 380, ...line(C.muted, 21) }}>실제 로봇에서 얻는 곳</span>
          </div>
          {rows.map(([n, k, src, at]) => {
            const c = k === 3 ? C.blue : C.green
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'baseline', opacity: prog(t, at) }}>
                <span style={{ width: 270, ...line(C.text, 24) }}>{n}</span>
                <span style={{ width: 90, textAlign: 'right', paddingRight: 30, ...mono(lit > 0 ? c : C.text, 25) }}>{k}</span>
                <span style={{ width: 380, ...line(C.muted, 23) }}>{src}</span>
              </div>
            )
          })}
          <div style={{ borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 10, opacity: prog(t, 7.4), display: 'flex', gap: 18, alignItems: 'baseline' }}>
            <span style={line(C.muted, 22)}>합</span>
            <span style={mono(C.blue, 26)}>3 × 4</span>
            <span style={mono(C.muted, 26)}>+</span>
            <span style={mono(C.green, 26)}>12 × 3</span>
            <span style={mono(C.accent, 26)}>= 48</span>
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 9.5) }}>다리 넷에 관절이 셋씩이라 관절은 12 개다. 계단 지형용 설정은 LiDAR 높이 지도에서 지형 높이 187 개를 더 받는다</span>
          <div style={{ marginTop: 6, padding: '12px 18px', borderRadius: 14, background: `${C.red}12`, border: `1.5px solid ${C.red}55`, opacity: prog(t, 3.6) }}>
            <span style={line(C.text, 22)}>
              <span style={{ color: C.red, fontWeight: 700 }}>✕ 마찰 계수</span> 는 simulator 에 있어도 실제 로봇에 잴 센서가 없어서 observation 에 넣으면 옮길 수 없다
            </span>
          </div>
        </Inner>
      </Card>
      <Card x={926} y={130} w={930} h={450} at={13}>
        <Inner gap={12}>
          <Head>action → 목표 각도 → torque · A1 무릎</Head>
          <span style={line(C.muted, 22)}>PD controller: τ = K_p × (목표 − 지금) − K_d × 각속도</span>
          <span style={line(C.muted, 22)}>기본 각도 −1.5 rad · 배율 s 0.25 · action a 0.4 · K_p 20 · K_d 0.5</span>
          {steps.map(([k, v, at, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: prog(t, at) }}>
              <span style={{ width: 170, ...line(C.muted, 24) }}>{k}</span>
              <span style={mono(c, 28)}>{v}</span>
            </div>
          ))}
        </Inner>
      </Card>
      <Card x={926} y={610} w={930} h={260} at={22.8}>
        <Inner gap={12}>
          <Head size={24}>목표 각도가 torque 가 되는 곳</Head>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
            <span style={{ width: 190, ...line(C.orange, 23) }}>실제 ANYmal</span>
            <span style={line(C.text, 23)}>motor 안의 PD controller 가 만든다</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 23.4) }}>
            <span style={{ width: 190, ...line(C.blue, 23) }}>simulation</span>
            <span style={line(C.text, 23)}>A1 은 위의 PD 식 · ANYmal C 는 actuator network</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 24) }}>
            <span style={{ width: 190, ...line(C.muted, 23) }}>주기</span>
            <span style={line(C.text, 23)}>action 0.02 초 · torque 0.005 초 → physics step 4 번</span>
          </div>
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

function Reward() {
  const t = useSec()
  const weights: [string, string, boolean][] = [
    ['속도 추종', '+1.0', true],
    ['회전 속도 추종', '+0.5', false],
    ['위아래 속도', '−2.0', true],
    ['기우는 회전 속도', '−0.05', false],
    ['torque', '−0.00001 (A1 −0.0002)', true],
    ['관절 가속도', '−2.5 × 10⁻⁷', false],
    ['action 변화', '−0.01', true],
    ['충돌', '−1', false],
    ['발이 공중에 있던 시간', '+1.0', false],
  ]
  const used = prog(t, 6.8)
  const holes: [string, string][] = [
    ['action 변화 penalty 없음', '관절을 아주 빠르게 떨며 미끄러지듯 간다'],
    ['몸통 흔들림 penalty 없음', '몸을 던지듯 크게 뛴다'],
    ['발의 공중 시간 항목 없음', '발을 거의 들지 않고 끌며 간다'],
    ['torque penalty 없음', '모든 관절에 큰 torque 를 걸고 버틴다'],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={760} h={740} at={0.3}>
        <Inner gap={8}>
          <Head>reward weight · legged_gym 기본값</Head>
          <span style={line(C.muted, 21)}>Rudin 등의 reward 는 아홉 항목의 합 · 음수 weight 는 penalty</span>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, marginTop: 6 }}>
            <span style={{ width: 330, ...line(C.muted, 21) }}>항목</span>
            <span style={{ width: 360, ...line(C.muted, 21) }}>weight</span>
          </div>
          {weights.map(([n, w, u], i) => {
            const on = u && used > 0
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'baseline', opacity: prog(t, 0.8 + i * 0.35) * (u ? 1 : 1 - 0.55 * used), borderRadius: 8, background: on ? `${C.accent}${Math.round(used * 24).toString(16).padStart(2, '0')}` : 'transparent', padding: '2px 6px' }}>
                <span style={{ width: 324, ...line(C.text, 24) }}>{n}</span>
                <span style={mono(w.startsWith('+') ? C.green : C.red, 24)}>{w}</span>
              </div>
            )
          })}
          <span style={{ ...line(C.muted, 21), marginTop: 10, opacity: prog(t, 4) }}>속도 추종 점수 e^(−(명령 − 실제)² ÷ 0.25) 는 속도가 명령과 같으면 1 이고 멀어질수록 0 에 가까워진다</span>
        </Inner>
      </Card>
      <Card x={856} y={130} w={1000} h={470} at={6.5}>
        <Inner gap={12}>
          <Head>명령 0.5 m/s · 네 항목만 더한 두 걸음 (측정값은 예)</Head>
          <Table
            head={['항목', '걸음 1 · 0.4 m/s', '걸음 2 · 0.7 m/s']}
            widths={[190, 360, 390]}
            at={7}
            step={0.45}
            size={23}
            rows={[
              ['속도 추종', '+0.9608', '+0.8521'],
              ['위아래 속도', '−2 × 0.01 = −0.02', '−2 × 0.09 = −0.18'],
              ['torque', '−0.0002 × 500 = −0.1', '−0.0002 × 1500 = −0.3'],
              ['action 변화', '−0.01 × 2 = −0.02', '−0.01 × 10 = −0.1'],
            ]}
          />
          <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
            <Bar label="걸음 1 (차분)" value={0.8208} max={1} color={C.green} at={13.4} width={400} fmt="0.8208" labelW={210} />
            <Bar label="걸음 2 (뛰듯이)" value={0.2721} max={1} color={C.red} at={14.2} width={400} fmt="0.2721" labelW={210} sub="세 배 가까이 낮다" />
          </div>
        </Inner>
      </Card>
      <Card x={856} y={620} w={1000} h={250} at={19.5}>
        <Inner gap={8}>
          <Head size={24} color={C.orange}>
            reward 의 빈틈 → policy 가 배우는 걸음 (reward hacking)
          </Head>
          {holes.map(([a, b], i) => (
            <div key={a} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 20 + i * 0.6) }}>
              <span style={{ width: 330, ...line(C.muted, 22) }}>{a}</span>
              <span style={line(C.muted, 22)}>→</span>
              <span style={line(C.text, 22)}>{b}</span>
            </div>
          ))}
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- reality gap ----------

function Gap() {
  const t = useSec()
  const frict: [string, number, boolean][] = [
    ['μ 1.0', 60, true],
    ['μ 0.8', 48, true],
    ['μ 0.7', 42, false],
    ['μ 0.6', 36, false],
  ]
  const xs = (i: number) => 100 + i * 115
  const ys = (v: number) => 120 - v * 20
  const red = [4, 0, -4, -4, 0, 4]
  const green = [4, 0, 0, 0, 0, 0]
  const draw = prog(t, 25, 2.5)
  const pts = (vals: number[]) => {
    const n = draw * (vals.length - 1)
    const out: string[] = []
    for (let i = 0; i < vals.length; i++) {
      if (i <= n) out.push(`${xs(i)},${ys(vals[i])}`)
      else {
        const f = n - (i - 1)
        if (f > 0) out.push(`${xs(i - 1) + (xs(i) - xs(i - 1)) * f},${ys(vals[i - 1]) + (ys(vals[i]) - ys(vals[i - 1])) * f}`)
        break
      }
    }
    return out.join(' ')
  }
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 130, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Chip at={0.4} mono color={C.muted}>
          1500 × 98,304 = 147,456,000 step × 0.02 초 ≈ 34 일
        </Chip>
        <Appear at={2}>
          <Label size={23} color={C.muted}>
            reality gap 의 원인
          </Label>
        </Appear>
        <Chip at={2.3} color={C.orange}>
          마찰
        </Chip>
        <Chip at={2.6} color={C.purple}>
          질량
        </Chip>
        <Chip at={2.9} color={C.red}>
          지연
        </Chip>
        <Chip at={3.2} color={C.pink}>
          센서 noise
        </Chip>
        <Chip at={3.5} color={C.blue}>
          actuator 반응
        </Chip>
      </div>
      <Card x={64} y={205} w={880} h={330} at={6.3}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <Head size={24} color={C.orange}>
            마찰 · 발 하나가 약 60 N 을 받칠 때 한계 μ × 60 (12 kg 로봇 예)
          </Head>
        </div>
        <svg width={880} height={270} style={{ position: 'absolute', left: 0, top: 60 }}>
          <g opacity={prog(t, 7.6)}>
            <line x1={500} x2={500} y1={30} y2={240} stroke={C.text} strokeWidth={2.5} strokeDasharray="8 7" />
            <text x={500} y={20} textAnchor="middle" fill={C.text} fontSize={21} fontWeight={600}>
              미는 힘 45 N
            </text>
          </g>
          {frict.map(([n, lim, ok], i) => {
            const y = 40 + i * 52
            const at = 6.8 + i * 0.4
            const c = ok ? C.green : C.red
            return (
              <g key={n} opacity={prog(t, at)}>
                <text x={30} y={y + 23} fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {n}
                </text>
                <rect x={140} y={y} width={lim * 8 * prog(t, at, 0.8)} height={32} rx={6} fill={c} opacity={0.85} />
                <text x={640} y={y + 24} fill={c} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {lim} N
                </text>
                <text x={715} y={y + 24} fill={c} fontSize={22} fontWeight={600} opacity={prog(t, 8.4 + i * 0.3)}>
                  {ok ? '버틴다' : '미끄러진다'}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>
      <Card x={976} y={205} w={880} h={330} at={12.3}>
        <Inner gap={12}>
          <Head size={24} color={C.purple}>
            질량 · CAD 관성값은 20% 가까이 틀릴 수 있다 (Hwangbo 등)
          </Head>
          {(
            [
              ['예: 버틸 무릎 torque', '6 × 1.2 = 7.2 N·m', 12.8],
              ['모자란 torque', '7.2 − 6 = 1.2 N·m', 14],
              ['더 접히는 각도', '1.2 ÷ 20 = 0.06 rad', 15.2],
            ] as [string, string, number][]
          ).map(([k, v, at]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: prog(t, at) }}>
              <span style={{ width: 240, ...line(C.muted, 23) }}>{k}</span>
              <span style={mono(C.text, 27)}>{v}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16.2) }}>K_p 20 · 약 3.4° 더 접혀 몸통이 낮아진 자세는 policy 가 학습 중에 본 적이 없다</span>
        </Inner>
      </Card>
      <Card x={64} y={560} w={880} h={310} at={18.3}>
        <Inner gap={14}>
          <Head size={24} color={C.red}>
            지연 · 명령을 보낸 뒤 결과가 보고되기까지 (Minitaur, Tan 등)
          </Head>
          <Bar label="motor 쪽 PD" value={3} max={20} color={C.green} at={18.8} width={320} unit=" ms" labelW={270} />
          <Bar label="Jetson TX2 를 거침" value={19} max={20} color={C.red} at={19.4} width={320} fmt="15 ~ 19" unit=" ms" labelW={270} />
          <Bar label="50 Hz 의 한 step" value={20} max={20} color={C.dim} at={20.2} width={320} unit=" ms" labelW={270} />
        </Inner>
      </Card>
      <Card x={976} y={560} w={880} h={310} at={24.3}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <Head size={24}>4° 기운 몸통 · 매 step 기울기 전체를 반대로 바로잡을 때</Head>
        </div>
        <svg width={880} height={250} style={{ position: 'absolute', left: 0, top: 60 }}>
          <line x1={xs(0) - 10} x2={xs(5) + 10} y1={ys(0)} y2={ys(0)} stroke={C.cardEdge} strokeWidth={2} />
          {[4, 0, -4].map((v) => (
            <text key={v} x={80} y={ys(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v < 0 ? `−${-v}°` : `${v}°`}
            </text>
          ))}
          <text x={22} y={234} fill={C.dim} fontSize={20}>
            step
          </text>
          {red.map((_, i) => (
            <text key={i} x={xs(i)} y={234} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {i}
            </text>
          ))}
          <polyline points={pts(green)} fill="none" stroke={C.green} strokeWidth={5} strokeLinejoin="round" />
          <polyline points={pts(red)} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" />
          <g opacity={prog(t, 27.4)}>
            <text x={690} y={ys(4) + 7} fill={C.red} fontSize={20} fontWeight={600}>
              한 step 지연
            </text>
            <text x={690} y={ys(0) - 12} fill={C.green} fontSize={20} fontWeight={600}>
              지연 없음
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Actuator() {
  const t = useSec()
  const inputs = ['각도 오차 (지금)', '각도 오차 (0.01 초 전)', '각도 오차 (0.02 초 전)', '각속도 (지금)', '각속도 (0.01 초 전)', '각속도 (0.02 초 전)']
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={300} at={0.3}>
        <Inner gap={14}>
          <Head>실제 ANYmal 의 series elastic actuator (SEA) · 목표 각도에서 torque 까지</Head>
          <Flow steps={['목표 각도', 'PD: 목표 torque', '전류 PID: 목표 전류', 'FOC: motor 전압', '기어 · spring', '관절 torque']} color={C.orange} at={0.8} gap={0.6} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 4.2) }}>단계마다 지연과 밖에서 잴 수 없는 내부 상태가 있어서, 같은 목표 각도라도 앞선 명령에 따라 torque 가 다르다 · 이전 분석 모델은 parameter 가 100 개 가까이</span>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Chip at={6.6} color={C.blue}>
              발을 사인파 경로로 · 진폭 5 ~ 10 cm · 1 ~ 25 Hz
            </Chip>
            <Chip at={7.4} color={C.blue}>
              1초에 400 번 기록
            </Chip>
            <Chip at={8.2} color={C.blue}>
              관절 12 개 · 4 분 미만 · sample 100만 개 넘게
            </Chip>
            <Chip at={9.2} color={C.muted}>
              90% 를 학습에
            </Chip>
          </div>
        </Inner>
      </Card>
      <Card x={64} y={450} w={860} h={420} at={12.3}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <Head size={24} color={C.accent}>
            actuator network · simulation 안에서만 motor 반응을 흉내
          </Head>
        </div>
        <svg width={860} height={300} style={{ position: 'absolute', left: 0, top: 64 }}>
          {inputs.map((s, k) => (
            <g key={s} opacity={prog(t, 12.6 + k * 0.3)}>
              <rect x={20} y={10 + k * 46} width={290} height={38} rx={8} fill={`${k < 3 ? C.blue : C.purple}18`} stroke={k < 3 ? C.blue : C.purple} strokeWidth={1.5} />
              <text x={36} y={36 + k * 46} fill={C.text} fontSize={20}>
                {s}
              </text>
            </g>
          ))}
          <g opacity={prog(t, 14.6)}>
            {arrow(318, 144, 372, 144, C.muted)}
            <rect x={380} y={74} width={220} height={140} rx={14} fill={`${C.accent}14`} stroke={C.accent} strokeWidth={2} />
            <text x={490} y={136} textAnchor="middle" fill={C.accent} fontSize={30} fontFamily={MONO} fontWeight={600}>
              MLP
            </text>
            <text x={490} y={174} textAnchor="middle" fill={C.text} fontSize={20}>
              32 unit 층 셋
            </text>
          </g>
          <g opacity={prog(t, 15.4)}>
            {arrow(608, 144, 662, 144, C.muted)}
            <rect x={670} y={109} width={160} height={70} rx={12} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
            <text x={750} y={152} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              torque
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 28, top: 370, opacity: prog(t, 16.4) }}>
          <span style={line(C.muted, 21)}>legged_gym 의 ANYmal C: 관절마다 지금 값 2 개 → LSTM (층 2 · 내부 상태 8)</span>
        </div>
      </Card>
      <Card x={952} y={450} w={904} h={420} at={18.3}>
        <Inner gap={14}>
          <Head size={24}>torque 예측의 평균 오차 (Hwangbo 등)</Head>
          <Table
            head={['', '검증 데이터', '걸을 때 데이터']}
            widths={[310, 250, 270]}
            at={18.6}
            step={0.6}
            size={24}
            colors={[C.red, C.green]}
            rows={[
              ['이상적인 PD 식', '3.55 N·m', '5.74 N·m'],
              ['actuator network', '0.740 N·m', '0.966 N·m'],
            ]}
          />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>PD 식 · 분석 모델로 학습한 policy 는 실물에서 한 걸음도 못 걷고 넘어졌다</span>
          <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
            <Bar label="network 로 학습" value={1.5} max={1.8} color={C.green} at={24.6} width={340} unit=" m/s" labelW={220} sub="25% 앞섬" />
            <Bar label="ANYmal 이전 기록" value={1.2} max={1.8} color={C.dim} at={25.2} width={340} unit=" m/s" labelW={220} />
          </div>
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- randomization ----------

function Dr() {
  const t = useSec()
  const mus = ['μ 0.8', 'μ 0.6', 'μ 1.2', 'μ 1.0']
  const pick = prog(t, 13.4)
  const mean = prog(t, 19.8)
  const cols = [170, 110, 110, 110, 110, 150]
  const left = (k: number) => cols.slice(0, k).reduce((a, b) => a + b, 0)
  const grid: [string, string, string[], string, string][] = [
    ['A (55 N)', C.orange, ['−1', '−1', '0.55', '0.55'], '−0.225', C.red],
    ['B (45 N)', C.blue, ['−1', '0.45', '0.45', '0.45'], '0.0875', C.text],
    ['C (35 N)', C.green, ['0.35', '0.35', '0.35', '0.35'], '0.35', C.green],
  ]
  const avg: [string, number, string][] = [
    ['A', -0.225, C.orange],
    ['B', 0.0875, C.blue],
    ['C', 0.35, C.green],
  ]
  const x0 = 260
  const sc = 600
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={740} at={0.3}>
        <Inner gap={12}>
          <Head>episode 마다 다시 뽑는 물리값</Head>
          {[
            ['nominal 학습', ['μ 1.0', 'μ 1.0', 'μ 1.0', 'μ 1.0'], C.dim, 0.8],
            ['domain randomization', mus, C.accent, 2.2],
          ].map(([n, chips, c, at]) => (
            <div key={n as string} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, at as number) }}>
              <span style={{ width: 270, ...line(C.muted, 22) }}>{n as string}</span>
              {(chips as string[]).map((m, i) => (
                <span key={i} style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${c as string}88`, ...mono(c === C.dim ? C.muted : (c as string), 22), opacity: prog(t, (at as number) + 0.3 * i) }}>
                  {m}
                </span>
              ))}
            </div>
          ))}
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 2.8) }}>episode 1 ~ 4 의 예 · env 를 reset 할 때 새로 뽑는다</span>
          <div style={{ marginTop: 12 }}>
            <Head size={24}>보행 논문들이 쓴 범위</Head>
          </div>
          <Table
            head={['무작위로 바꾼 숫자', '범위', '출처']}
            widths={[310, 300, 200]}
            at={6.6}
            step={0.45}
            size={22}
            rows={[
              ['발과 바닥의 마찰 계수', '0.5 ~ 1.25', 'legged_gym'],
              ['몸통에 더하는 질량', '−5 ~ +5 kg', 'legged_gym'],
              ['몸통 밀기 (15 초마다)', '−1 ~ 1 m/s', 'legged_gym'],
              ['link 질량 · 무게중심', '±15% · ±2 cm', 'Hwangbo 등'],
              ['질량 · motor 세기', '80 ~ 120%', 'Tan 등'],
              ['지연', '0 ~ 40 ms', 'Tan 등'],
              ['마찰 계수 · 짐 무게', '0.05 ~ 4.5 · 0 ~ 6 kg', 'Kumar 등'],
            ]}
          />
        </Inner>
      </Card>
      <Card x={996} y={130} w={860} h={740} at={13}>
        <Inner gap={12}>
          <Head>걸음 셋의 바닥별 점수 (예)</Head>
          <span style={line(C.muted, 21)}>발 하나가 60 N 을 받침 · 한계 μ × 60 · 버티면 속도만큼, 미끄러지면 −1</span>
          <div style={{ position: 'relative', marginTop: 6 }}>
            <div style={{ position: 'absolute', left: left(3) - 4, top: -4, width: cols[3], height: 212, borderRadius: 10, border: `2px solid ${C.orange}`, opacity: pick * (1 - 0.6 * mean) }} />
            <div style={{ position: 'absolute', left: left(5) - 4, top: -4, width: cols[5], height: 212, borderRadius: 10, border: `2px solid ${C.green}`, opacity: mean }} />
            <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
              {['걸음', 'μ 0.6', 'μ 0.8', 'μ 1.0', 'μ 1.2', '평균'].map((h, i) => (
                <span key={h} style={{ width: cols[i], textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 12, ...line(C.muted, 21), fontFamily: i > 0 && i < 5 ? MONO : undefined }}>
                  {h}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', paddingTop: 6 }}>
              {['한계', '36 N', '48 N', '60 N', '72 N', ''].map((h, i) => (
                <span key={i} style={{ width: cols[i], textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 12, ...(i === 0 ? line(C.dim, 21) : mono(C.dim, 21)) }}>
                  {h}
                </span>
              ))}
            </div>
            {grid.map(([n, c, vals, m, mc], k) => (
              <div key={n} style={{ display: 'flex', paddingTop: 8, opacity: prog(t, 13.4 + k * 0.4) }}>
                <span style={{ width: cols[0], ...line(c, 23), fontWeight: 600 }}>{n}</span>
                {vals.map((v, i) => (
                  <span key={i} style={{ width: cols[i + 1], textAlign: 'right', paddingRight: 12, ...mono(v === '−1' ? C.red : C.text, 23) }}>
                    {v}
                  </span>
                ))}
                <span style={{ width: cols[5], textAlign: 'right', paddingRight: 12, ...mono(mc, 23), opacity: mean }}>{m}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
            <span style={{ ...line(C.orange, 23), opacity: pick }}>nominal 값 μ 1.0 에서만 학습 → 가장 빠른 A (0.55)</span>
            <span style={{ ...line(C.green, 23), opacity: mean }}>μ 를 네 값에서 같은 가능성으로 뽑아 학습 → 평균이 가장 큰 C</span>
          </div>
          <svg width={804} height={190} style={{ marginTop: 8, opacity: prog(t, 20.4) }}>
            <text x={0} y={22} fill={C.muted} fontSize={21}>
              네 바닥의 평균 점수
            </text>
            <line x1={x0} x2={x0} y1={36} y2={186} stroke={C.cardEdge} strokeWidth={2} />
            {avg.map(([n, v, c], i) => {
              const y = 46 + i * 48
              const w = Math.abs(v) * sc * prog(t, 20.6 + i * 0.3, 0.8)
              return (
                <g key={n}>
                  <text x={20} y={y + 24} fill={c} fontSize={23} fontWeight={600}>
                    {n}
                  </text>
                  <rect x={v < 0 ? x0 - w : x0} y={y} width={w} height={32} rx={6} fill={c} opacity={0.85} />
                  <text x={v < 0 ? x0 + 14 : x0 + Math.abs(v) * sc + 14} y={y + 24} fill={c} fontSize={22} fontFamily={MONO} fontWeight={600}>
                    {v < 0 ? `−${-v}` : v}
                  </text>
                </g>
              )
            })}
          </svg>
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

function RangeNoise() {
  const t = useSec()
  const ax = (m: number) => 300 + m * 667
  const bands: [string, number, number, string, string, number][] = [
    ['좁게 0.95 ~ 1.05 → A', 0.95, 1.05, C.red, '55 > 42 → 미끄러진다', 1],
    ['알맞게 0.6 ~ 1.2 → C', 0.6, 1.2, C.green, '35 ≤ 42 → 버틴다', 0.5],
    ['넓게 0.2 ~ 1.4 → D', 0.2, 1.4, C.orange, '버티지만 0.10 m/s', 6.5],
  ]
  const read = [0.04, -0.03, 0.05, -0.05, 0.02]
  const sx = (i: number) => 90 + i * 110
  const sy = (v: number) => 240 - v * 220
  const poly = (k: number) => read.map((r, i) => `${sx(i)},${sy(-k * r)}`).join(' ')
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={330} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <Head size={24}>뽑는 μ 의 범위와 실제 바닥 (예)</Head>
        </div>
        <svg width={1792} height={330} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 0.6)}>
            <line x1={ax(0.7)} x2={ax(0.7)} y1={62} y2={238} stroke={C.text} strokeWidth={2.5} strokeDasharray="8 7" />
            <text x={ax(0.7)} y={48} textAnchor="middle" fill={C.text} fontSize={21} fontWeight={600}>
              실제 μ 0.7
            </text>
          </g>
          {bands.map(([n, a, b, c, res, at], i) => {
            const y = 80 + i * 55
            return (
              <g key={n} opacity={prog(t, at)}>
                <text x={40} y={y + 20} fill={c} fontSize={22} fontWeight={600}>
                  {n}
                </text>
                <rect x={ax(a)} y={y} width={(ax(b) - ax(a)) * prog(t, at, 0.8)} height={28} rx={6} fill={c} opacity={0.75} />
                <text x={1340} y={y + 21} fill={c} fontSize={22} fontWeight={600}>
                  {res}
                </text>
              </g>
            )
          })}
          <line x1={ax(0)} x2={ax(1.5)} y1={250} y2={250} stroke={C.muted} strokeWidth={2} />
          {[0, 0.5, 1, 1.5].map((m) => (
            <g key={m}>
              <line x1={ax(m)} x2={ax(m)} y1={244} y2={256} stroke={C.muted} strokeWidth={2} />
              <text x={ax(m)} y={282} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {m.toFixed(1)}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 40, top: 292, opacity: prog(t, 8) }}>
          <span style={line(C.muted, 21)}>μ 1.0 에서 A 대비 · C 는 (0.55 − 0.35) ÷ 0.55 ≈ 36% 느리고, D 는 (0.55 − 0.10) ÷ 0.55 ≈ 82% 느리다</span>
        </div>
      </Card>
      <Card x={64} y={480} w={560} h={390} at={12.3}>
        <Inner gap={16}>
          <Head size={24}>Tan 등의 범위 · 값의 불확실성에 맞춤</Head>
          {(
            [
              ['직접 잰 질량', 80, 120, C.green, 12.8],
              ['균일한 밀도로 계산한 관성', 50, 150, C.orange, 14.4],
            ] as [string, number, number, string, number][]
          ).map(([n, a, b, c, at]) => (
            <div key={n} style={{ display: 'grid', gap: 8, opacity: prog(t, at) }}>
              <span style={line(C.text, 23)}>{n}</span>
              <svg width={500} height={64}>
                <line x1={10} x2={490} y1={22} y2={22} stroke={C.grid} strokeWidth={14} strokeLinecap="round" />
                <rect x={10 + (a / 160) * 480} y={12} width={((b - a) / 160) * 480 * prog(t, at, 0.8)} height={20} rx={6} fill={c} />
                <text x={10 + (a / 160) * 480} y={58} textAnchor="middle" fill={c} fontSize={20} fontFamily={MONO}>
                  {a}%
                </text>
                <text x={10 + (b / 160) * 480} y={58} textAnchor="middle" fill={c} fontSize={20} fontFamily={MONO}>
                  {b}%
                </text>
              </svg>
            </div>
          ))}
        </Inner>
      </Card>
      <Card x={654} y={480} w={560} h={390} at={18.3}>
        <Inner gap={8}>
          <Head size={24}>observation noise (legged_gym)</Head>
          <Table
            head={['묶음', '더하는 범위']}
            widths={[260, 230]}
            at={18.6}
            step={0.3}
            size={21}
            rows={[
              ['관절 각도', '±0.01 rad'],
              ['관절 속도', '±1.5 rad/s'],
              ['몸통 속도', '±0.1 m/s'],
              ['몸통 회전 속도', '±0.2 rad/s'],
              ['중력 방향', '±0.05'],
              ['지형 높이', '±0.1 m'],
              ['명령 · 직전 action', '더하지 않음'],
            ]}
          />
        </Inner>
      </Card>
      <Card x={1244} y={480} w={612} h={390} at={24.3}>
        <div style={{ position: 'absolute', left: 24, top: 18, width: 564 }}>
          <span style={line(C.muted, 20)}>읽힌 기울기 (실제 0, 예): 0.04, −0.03, 0.05, −0.05, 0.02</span>
        </div>
        <svg width={612} height={390} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={sx(0) - 10} x2={sx(4) + 10} y1={sy(0)} y2={sy(0)} stroke={C.cardEdge} strokeWidth={2} />
          {[0.5, 0, -0.5].map((v) => (
            <text key={v} x={64} y={sy(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v < 0 ? '−0.5' : v.toString()}
            </text>
          ))}
          <polyline points={poly(10)} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, 24.8)} />
          <polyline points={poly(2)} fill="none" stroke={C.green} strokeWidth={4} strokeLinejoin="round" opacity={prog(t, 25.6)} />
          {read.map((_, i) => (
            <text key={i} x={sx(i)} y={378} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {i + 1}
            </text>
          ))}
          <g opacity={prog(t, 24.8)}>
            <line x1={300} x2={330} y1={74} y2={74} stroke={C.red} strokeWidth={4} />
            <text x={340} y={81} fill={C.red} fontSize={20} fontWeight={600}>
              10 배 반응 · 제곱 합 2.62
            </text>
          </g>
          <g opacity={prog(t, 25.6)}>
            <line x1={300} x2={330} y1={100} y2={100} stroke={C.green} strokeWidth={4} />
            <text x={340} y={107} fill={C.green} fontSize={20} fontWeight={600}>
              2 배 반응 · 0.1048
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- 지형 · teacher ----------

function Curriculum() {
  const t = useSec()
  const base = 520
  const sc = 1698
  const bx = (i: number) => 120 + i * 82
  const rules: [string, string, string, number][] = [
    ['출발점에서 4 m (지형 칸의 절반) 보다 멀리', '한 단계 위', C.green, 13.4],
    ['4 m 를 못 넘고, 명령 속도 × 20 초 × 0.5 보다 짧다', '한 단계 아래', C.red, 15],
    ['둘 다 아니다', '그대로', C.muted, 16.6],
    ['맨 위 단계를 넘었다', '무작위 단계', C.orange, 21.5],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1000} h={740} at={0.3}>
        <div style={{ position: 'absolute', left: 28, top: 20, display: 'grid', gap: 6 }}>
          <Head>legged_gym 의 지형 curriculum · 계단 한 칸 높이</Head>
          <span style={{ ...mono(C.muted, 24), opacity: prog(t, 6.8) }}>0.05 + 0.18 × i ÷ 10 m (단계 i)</span>
        </div>
        <svg width={1000} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const h = (0.05 + (0.18 * i) / 10) * sc
            const at = 7 + i * 0.25
            const p = prog(t, at, 0.6)
            return (
              <g key={i} opacity={p}>
                <rect x={bx(i)} y={base - h * p} width={60} height={h * p} rx={4} fill={i === 0 || i === 9 ? C.accent : C.blue} opacity={i === 0 || i === 9 ? 0.95 : 0.55} />
                <text x={bx(i) + 30} y={base + 32} textAnchor="middle" fill={C.dim} fontSize={21} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            )
          })}
          <line x1={100} x2={940} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
          <text x={530} y={base + 64} textAnchor="middle" fill={C.dim} fontSize={21}>
            단계 (어려운 정도)
          </text>
          <text x={bx(0) + 30} y={base - 0.05 * sc - 12} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7.6)}>
            5 cm
          </text>
          <text x={bx(9) + 30} y={base - 0.212 * sc - 12} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9.8)}>
            21.2 cm
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 28, top: 610, width: 944, display: 'grid', gap: 6, opacity: prog(t, 10.4) }}>
          <span style={mono(C.text, 24)}>단계 9: 0.05 + 0.18 × 0.9 = 0.212 m</span>
          <span style={line(C.muted, 20)}>한 변 8 m 인 지형 칸 · 20 줄 (지형 종류) × 10 단계 · 오르는 계단 35% · 내려가는 계단 25% · 흩어진 장애물 20% · 매끈한 경사 10% · 울퉁불퉁한 경사 10%</span>
        </div>
      </Card>
      <Card x={1094} y={130} w={762} h={420} at={13}>
        <Inner gap={12}>
          <Head size={24}>episode 20 초가 끝나 reset 할 때</Head>
          {rules.map(([cond, res, c, at]) => (
            <div key={res} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ width: 470, ...line(C.text, 22) }}>{cond}</span>
              <span style={{ ...line(c, 22), fontWeight: 600, whiteSpace: 'nowrap' }}>→ {res}</span>
            </div>
          ))}
        </Inner>
      </Card>
      <Card x={1094} y={580} w={762} h={290} at={19.5}>
        <div style={{ position: 'absolute', left: 28, top: 20 }}>
          <span style={mono(C.text, 24)}>명령 0.3 m/s → 0.3 × 20 × 0.5 = 3 m</span>
        </div>
        <svg width={762} height={290} style={{ position: 'absolute', left: 0, top: 0 }}>
          {(
            [
              [0, 3, C.red, '아래'],
              [3, 4, C.muted, '그대로'],
              [4, 8, C.green, '위'],
            ] as [number, number, string, string][]
          ).map(([a, b, c, n], i) => (
            <g key={n} opacity={prog(t, 20 + i * 0.5)}>
              <rect x={60 + a * 80} y={100} width={(b - a) * 80} height={40} fill={c} opacity={0.55} />
              <text x={60 + ((a + b) / 2) * 80} y={176} textAnchor="middle" fill={c} fontSize={21} fontWeight={600}>
                {n}
              </text>
            </g>
          ))}
          <line x1={60} x2={700} y1={196} y2={196} stroke={C.muted} strokeWidth={2} />
          {[0, 3, 4, 8].map((m) => (
            <g key={m}>
              <line x1={60 + m * 80} x2={60 + m * 80} y1={190} y2={202} stroke={C.muted} strokeWidth={2} />
              <text x={60 + m * 80} y={226} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {m} m
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 28, top: 244, opacity: prog(t, 22.5) }}>
          <span style={line(C.muted, 20)}>Rudin 등: 1000 iteration 뒤 모든 지형 종류에서 맨 위 단계에 이름</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Teacher() {
  const t = useSec()
  const priv = ['각 발 주변 반지름 10 cm 원 위 9 개 점의 지형 높이', '발이 닿았는지와 닿은 힘', '마찰 계수', '학습 중 몸통을 미는 외력']
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={850} h={400} at={0.3}>
        <Inner gap={10}>
          <Head color={C.orange}>1 단계 · teacher (simulation 안에서만)</Head>
          <span style={line(C.muted, 22)}>observation + privileged information → reinforcement learning</span>
          {priv.map((p, i) => (
            <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'baseline', opacity: prog(t, 6.8 + i * 0.6) }}>
              <span style={{ color: C.orange, fontSize: 22 }}>●</span>
              <span style={line(C.text, 24)}>{p}</span>
            </div>
          ))}
          <span style={{ ...line(C.dim, 21), opacity: prog(t, 9.6) }}>실제 로봇에서는 이 숫자를 얻을 수 없다</span>
        </Inner>
      </Card>
      <svg width={50} height={60} style={{ position: 'absolute', left: 914, top: 300, opacity: prog(t, 13.2) }}>
        {arrow(6, 30, 50, 30, C.muted, 3)}
      </svg>
      <Card x={964} y={130} w={892} h={400} at={13}>
        <Inner gap={10}>
          <Head color={C.green}>2 단계 · student (실제 로봇에 올라감)</Head>
          {(
            [
              ['입력', '센서 observation 의 최근 100 step (2 초) 이력', 13.5],
              ['구조', 'TCN · 시간 축으로 convolution 을 하는 network', 14.3],
              ['학습', 'teacher 의 출력을 정답으로 supervised learning', 15.1],
              ['데이터', 'student 가 움직인 상태마다 teacher 가 정답 (DAgger)', 15.9],
            ] as [string, string, number][]
          ).map(([k, v, at]) => (
            <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ width: 90, ...line(C.muted, 22) }}>{k}</span>
              <span style={line(C.text, 23)}>{v}</span>
            </div>
          ))}
          <span style={{ ...mono(C.accent, 25), marginTop: 6, opacity: prog(t, 16.8) }}>loss = (a_T − a_S)² + (l_T − l_S)²</span>
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 16.8) }}>a: action · l: privileged information 을 요약한 latent vector</span>
        </Inner>
      </Card>
      <Card x={64} y={560} w={1000} h={310} at={19.5}>
        <Inner gap={14}>
          <Head size={24}>Lee 등 (2020) 의 실험</Head>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 20) }}>
            <span style={mono(C.green, 40)}>35.5%</span>
            <span style={line(C.text, 23)}>50 N · 5 초 옆으로 밀 때, 2 초 이력 student 가 0.02 초 이력보다 덜 벗어남</span>
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 21.8) }}>학습에 없던 진흙 · 눈 · 덤불 · 흐르는 물을 지났다 · 이끼 위의 걷는 속도</span>
          <Bar label="이 controller" value={0.452} max={0.55} color={C.green} at={22.4} width={440} unit=" m/s" labelW={200} />
          <Bar label="기존 controller" value={0.199} max={0.55} color={C.dim} at={23} width={440} unit=" m/s" labelW={200} />
        </Inner>
      </Card>
      <Card x={1094} y={560} w={762} h={310} at={23.6}>
        <Inner gap={12}>
          <Head size={24}>RMA (Kumar 등 2021) · 같은 구조</Head>
          <span style={line(C.text, 22)}>마찰 · 짐 무게 · motor 세기 같은 숫자 17 개 → 8 개로 요약해 base policy 에 준다</span>
          <span style={line(C.text, 22)}>adaptation module 이 최근 50 step (0.5 초) 의 상태와 action 으로 그 8 개를 추정</span>
          <span style={line(C.muted, 21)}>Unitree A1 에 올렸다</span>
        </Inner>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'policy 와 reward', color: C.accent, text: 'observation 48 개 → 목표 각도 12 개 · penalty 까지 더하면 걸음 1 0.8208 대 걸음 2 0.2721', at: 0.6 },
    { tag: 'reality gap', color: C.orange, text: 'μ 0.7 바닥에서 45 N > 42 N 이면 미끄러짐 · actuator network 오차 3.55 → 0.740 N·m', at: 4.2 },
    { tag: 'randomization', color: C.blue, text: 'μ 0.6 ~ 1.2 에서 뽑으면 C (평균 0.35) · 0.95 ~ 1.05 는 A 를 배워 미끄러짐 · noise 반응 25 배', at: 8.2 },
    { tag: '지형 · teacher', color: C.green, text: '계단 5 cm → 21.2 cm · 4 m 넘으면 위로 · 2 초 이력 student 가 35.5% 덜 벗어남', at: 12.2 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            실물에서 한 번도 학습하지 않은 policy 를 실물에서 걷게 하려면, simulation 을 어떻게 바꿔야 할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 80, fontWeight: 600 }}>DQN → SAC</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            지난 데이터를 쌓아 두고 다시 써서 필요한 데이터를 줄이는 reinforcement learning
          </Label>
        </Appear>
        <Appear at={1.8}>
          <div style={{ display: 'flex', gap: 18 }}>
            <Chip at={1.8} color={C.blue}>
              VLA + RL · 시연으로 배운 큰 로봇 모델을 RL 로 다시 학습
            </Chip>
            <Chip at={2.3} color={C.purple}>
              World Model · 다음 장면을 예측하는 model 안에서 행동 비교
            </Chip>
          </div>
        </Appear>
        <Appear at={2.8} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/sim2real-locomotion (Hwangbo · Lee · Rudin · Tan · Kumar · Peng · Tobin 논문, legged_gym)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseTorque = () => (
  <PauseWrite
    question="기본 각도 0.8 rad, 배율 s = 0.25, action a = −0.4 다. 관절이 지금 0.75 rad 에 멈춰 있고 K_p = 20 이면 torque 는?"
    answer={
      <>
        목표 0.8 + 0.25 × (−0.4) = 0.7 rad
        <br />
        차이 0.7 − 0.75 = −0.05 rad · 멈춰 있어 D 항은 0
        <br />
        torque = 20 × (−0.05) = −1 N·m
      </>
    }
  />
)

const PauseActuator = () => (
  <PauseWrite
    question="actuator network 의 데이터: 관절 12 개에서 1초에 400 번씩 4 분 동안 기록하면 sample 은 몇 개일까?"
    answer={
      <>
        관절 하나: 400 × 240 초 = 96,000 개
        <br />
        관절 12 개: 96,000 × 12 = 1,152,000 개 ≈ 115만 개
        <br />
        Hwangbo 등: 4 분이 안 걸려 100만 개 넘게
      </>
    }
  />
)

const PauseDr = () => (
  <PauseWrite
    question="μ 가 0.7, 1.0, 1.3 으로 같은 가능성으로 나오면 A (55 N), B (45 N), C (35 N) 의 평균은 얼마이고 무엇을 고를까? 발 하나는 60 N 을 받친다"
    answer={
      <>
        한계 0.7 × 60 = 42 · 1.0 × 60 = 60 · 1.3 × 60 = 78 N
        <br />
        A (−1 + 0.55 + 0.55) ÷ 3 ≈ 0.0333 · B ≈ −0.0333
        <br />
        C 는 늘 0.35 → 평균이 가장 큰 C 를 고른다
      </>
    }
  />
)

const PauseHistory = () => (
  <PauseWrite
    question="policy 가 1초에 50 번 계산하고 student 가 최근 50 step 의 observation 을 받으면 몇 초의 이력일까? RMA 처럼 1초에 100 번이면?"
    answer={
      <>
        50 Hz: 한 step 1 ÷ 50 = 0.02 초 → 50 × 0.02 = 1 초
        <br />
        100 Hz: 한 step 1 ÷ 100 = 0.01 초 → 50 × 0.01 = 0.5 초
      </>
    }
  />
)

export function Sim2realLocomotion() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'obs-action': ObsAction,
        reward: Reward,
        'pause-torque': PauseTorque,
        gap: Gap,
        actuator: Actuator,
        'pause-actuator': PauseActuator,
        dr: Dr,
        'range-noise': RangeNoise,
        'pause-dr': PauseDr,
        curriculum: Curriculum,
        teacher: Teacher,
        'pause-history': PauseHistory,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
