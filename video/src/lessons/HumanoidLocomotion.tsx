import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './humanoid-locomotion.narration.json'
import { script } from './humanoid-locomotion.script'

// Numbers follow lessons/humanoid-locomotion/README.md (see humanoid-locomotion.script.ts). The stick figures, the
// terrain profile and the gait clock are schematic (marked 모식도 where proportions matter); every number on screen is
// the lesson's.

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

function Box({ x, y, w, h, title, color = C.cardEdge, at, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap: 14 }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const num = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a schematic two-legged stick figure; `lift` raises the left foot, `arm` swings the arms */
function Biped({ x, y, h = 150, color, lift = 0, lean = 0 }: { x: number; y: number; h?: number; color: string; lift?: number; lean?: number }) {
  const r = h * 0.11
  const hip = { x: x + lean * h * 0.1, y: y + h * 0.55 }
  const neck = { x: x + lean * h * 0.18, y: y + h * 0.22 }
  const foot = y + h
  return (
    <g stroke={color} strokeWidth={h * 0.045} strokeLinecap="round" fill="none">
      <circle cx={neck.x} cy={y + r} r={r} fill={`${color}33`} />
      <line x1={neck.x} y1={neck.y} x2={hip.x} y2={hip.y} />
      <line x1={neck.x} y1={y + h * 0.3} x2={neck.x - h * 0.2} y2={y + h * 0.48} />
      <line x1={neck.x} y1={y + h * 0.3} x2={neck.x + h * 0.2} y2={y + h * 0.44} />
      <line x1={hip.x} y1={hip.y} x2={hip.x + h * 0.14} y2={foot} />
      <line x1={hip.x} y1={hip.y} x2={hip.x - h * 0.16 - lift * h * 0.1} y2={foot - lift * h * 0.3} />
    </g>
  )
}

function Quadruped({ x, y, h = 90, color }: { x: number; y: number; h?: number; color: string }) {
  const bodyY = y + h * 0.45
  const foot = y + h
  return (
    <g stroke={color} strokeWidth={h * 0.07} strokeLinecap="round" fill="none">
      <line x1={x - h * 0.7} y1={bodyY} x2={x + h * 0.7} y2={bodyY} />
      <circle cx={x + h * 0.85} cy={bodyY - h * 0.15} r={h * 0.14} fill={`${color}33`} />
      {[-0.6, -0.35, 0.35, 0.6].map((k) => (
        <line key={k} x1={x + k * h} y1={bodyY} x2={x + k * h + (k > 0 ? 0.1 : -0.1) * h} y2={foot} />
      ))}
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
            RL · HUMANOID LOCOMOTION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Humanoid Locomotion</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            clock reward · <span style={{ color: C.accent }}>causal Transformer</span> · teacher + RL · sim-to-sim · depth parkour
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            simulation 에서만 학습한 policy 로 humanoid 가 산길을 오르고 장애물을 뛰어넘게 하는 방법
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
          <Label size={24}>4족 보행 (Sim-to-Real Locomotion 의 Rudin 등)</Label>
          <Flow steps={['걸음 모양을 정해 주지 않음', 'RL 학습', '대각선 두 다리를 함께 딛는 trot 으로 수렴']} color={C.green} at={0.6} last="✓ 걸음이 저절로 생긴다" />
          <div style={{ opacity: prog(t, 2.3) }}>
            <Label size={24}>humanoid Digit 을 여러 지형에서 처음부터 RL 로 학습하면 (Radosavovic 등 2024 의 비교 실험)</Label>
          </div>
          <Flow steps={['걸음 모양을 정해 주지 않음', 'RL 학습', '왼다리를 덜 들어 바닥에 끎', '좌우가 크게 다른 걸음']} color={C.red} at={2.5} gap={0.4} last="✕" />
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 465, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          발을 언제 들고 디딜지를 <span style={{ color: C.accent }}>무엇으로 알려 주고,</span>
          <br />
          산길과 장애물을 넘게 하려면 <span style={{ color: C.accent }}>무엇을 더해야 할까?</span>
        </div>
      </Appear>
      <Panel x={200} y={660} w={1520} h={220}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16, opacity: prog(t, 6) }}>
          <Label size={22}>이 강의의 답 셋</Label>
          <div style={{ display: 'flex', gap: 16 }}>
            <Chip at={6.2}>걸음 주기를 알려 주는 clock reward</Chip>
            <Chip at={6.6} color={C.purple}>관측·action 이력을 읽는 Transformer policy</Chip>
            <Chip at={7} color={C.orange}>지형을 미리 보는 depth 카메라</Chip>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.2) }}>simulation 에서만 학습한 Transformer policy 를 올린 Digit: 일주일 동안 날마다 야외를 걸으며 넘어짐 0 · 후속 policy 는 카메라 없이 산길 약 4.3 마일 (약 6.9 km)</span>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- why two legs are hard ----------

function Hard() {
  const t = useSec()
  const rows: [string, string, string, string][] = [
    ['몸통의 위치·자세 (floating base)', '6', '✕', '발과 바닥 사이 힘으로만'],
    ['팔 관절', '2 × 4 = 8', '✓', 'policy 가 정한다'],
    ['다리의 motor 관절 (발가락 제외)', '2 × 4 = 8', '✓', 'policy 가 정한다'],
    ['발가락 motor', '2 × 2 = 4', '–', '기본 위치에 고정'],
    ['다리의 수동 관절 (spring · 4절 링크)', '2 × 5 = 10', '✕', '정하지 못한다'],
  ]
  const sx = (s: number) => 40 + (s / 64) * 1000
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', gap: 14 }}>
        <Chip at={0.3}>① 딛는 넓이가 좁다</Chip>
        <Chip at={6.5} color={C.orange}>② underactuation · 몸통을 미는 motor 가 없다</Chip>
        <Chip at={13} color={C.red}>③ 넘어지면 episode 가 끝난다</Chip>
        <Chip at={19.5} color={C.purple}>④ 정해진 걸음이 없다</Chip>
      </div>
      <Panel x={64} y={210} w={900} h={410}>
        <svg width={900} height={410}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            한 발로 서서 옆으로 밀릴 때 넘어가는 힘
          </text>
          <text x={872} y={42} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <text x={28} y={74} fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            무게중심 높이와 발 크기로 계산 (Humanoid Whole-Body Control 의 예)
          </text>
          <line x1={28} x2={872} y1={250} y2={250} stroke={C.muted} strokeWidth={3} opacity={prog(t, 0.5)} />
          <g opacity={prog(t, 0.6)}>
            <Biped x={230} y={90} h={160} color={C.accent} lift={1} />
            <line x1={90} y1={150} x2={160} y2={150} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
            <polygon points="160,140 180,150 160,160" fill={C.red} />
            <text x={60} y={135} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              약 28.6 N
            </text>
            <text x={230} y={290} textAnchor="middle" fill={C.accent} fontSize={24} fontWeight={600}>
              35 kg G1 · 한 발
            </text>
            <text x={230} y={322} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              343.4 × 0.05 ÷ 0.6 ≈ 28.6 N
            </text>
          </g>
          <g opacity={prog(t, 2.6)}>
            <Quadruped x={640} y={150} h={100} color={C.green} />
            <line x1={470} y1={190} x2={545} y2={190} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
            <polygon points="545,180 565,190 545,200" fill={C.red} />
            <text x={440} y={175} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
              약 78.5 N
            </text>
            <text x={640} y={290} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600}>
              12 kg 4족 로봇
            </text>
            <text x={640} y={322} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              117.7 × 0.2 ÷ 0.3 ≈ 78.5 N
            </text>
          </g>
          <g opacity={prog(t, 4.2)}>
            <rect x={28} y={352} width={(28.6 / 90) * 700 * prog(t, 4.2, 0.8)} height={16} rx={4} fill={C.accent} />
            <rect x={28} y={376} width={(78.5 / 90) * 700 * prog(t, 4.6, 0.8)} height={16} rx={4} fill={C.green} />
            <text x={760} y={366} fill={C.accent} fontSize={20} fontFamily={MONO}>
              28.6 N
            </text>
            <text x={760} y={390} fill={C.green} fontSize={20} fontFamily={MONO}>
              78.5 N
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={210} w={860} h={410} at={6.5} title={<Head color={C.orange}>Digit 의 자유도 36 개 가운데 policy 가 정하는 것</Head>}>
        <div style={{ display: 'grid', gap: 9 }}>
          {rows.map(([n, c, ok, d], i) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 7 + i * 0.55) }}>
              <span style={{ ...line(C.text, 22), width: 330, whiteSpace: 'nowrap' }}>{n}</span>
              <span style={{ ...num(C.text, 22), width: 130 }}>{c}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: ok === '✓' ? C.green : ok === '✕' ? C.red : C.dim, width: 30 }}>{ok}</span>
              <span style={{ ...line(C.muted, 21), whiteSpace: 'nowrap' }}>{d}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 10, opacity: prog(t, 10.2) }}>
            <span style={{ ...line(C.text, 24), width: 330, fontWeight: 600 }}>합</span>
            <span style={{ ...num(C.text, 26), width: 130 }}>36</span>
            <span style={{ ...num(C.orange, 26) }}>policy 16 개</span>
          </div>
          <span style={{ ...line(C.muted, 21), whiteSpace: 'nowrap', opacity: prog(t, 11.2) }}>자유도보다 motor 가 적다 = underactuation · 한 발로 서면 접점도 발 하나뿐</span>
        </div>
      </Box>
      <Panel x={64} y={640} w={1792} h={240} style={{ opacity: prog(t, 13) }}>
        <svg width={1792} height={240}>
          <g opacity={prog(t, 13)}>
            <text x={28} y={40} fill={C.text} fontSize={25} fontWeight={600}>
              Humanoid-Gym: 1초에 100 번 action → 한 step 0.01 초 · 걸음 한 주기 0.64 초 = 64 step
            </text>
            <line x1={sx(0)} x2={sx(64)} y1={126} y2={126} stroke={C.muted} strokeWidth={3} />
            {[0, 16, 32, 48, 64].map((s) => (
              <g key={s}>
                <line x1={sx(s)} x2={sx(s)} y1={116} y2={136} stroke={C.muted} strokeWidth={2} />
                <text x={sx(s)} y={166} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {s} step
                </text>
              </g>
            ))}
            <text x={sx(64)} y={196} textAnchor="middle" fill={C.dim} fontSize={20}>
              0.64 초 · 한 주기
            </text>
          </g>
          <g opacity={prog(t, 14.6)}>
            <rect x={sx(0)} y={114} width={(sx(30) - sx(0)) * prog(t, 14.6, 0.9)} height={24} rx={4} fill={`${C.red}66`} />
            <line x1={sx(30)} x2={sx(30)} y1={96} y2={151} stroke={C.red} strokeWidth={4} />
            <text x={sx(30)} y={88} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={700} fontFamily={MONO}>
              0.3 초에 넘어짐 = 30 step
            </text>
            <text x={28} y={228} fill={C.red} fontSize={23} fontWeight={600}>
              한 주기의 절반도 담지 못한다 → 버틴 step 마다 점수를 주는 alive 항목 (BeamDojo: 헛디뎌도 끝내지 않고 penalty 만)
            </text>
          </g>
          <g opacity={prog(t, 19.8)}>
            <rect x={1120} y={60} width={650} height={150} rx={14} fill={`${C.purple}12`} stroke={`${C.purple}77`} strokeWidth={1.5} />
            <text x={1140} y={96} fill={C.purple} fontSize={23} fontWeight={700}>
              ④ 속도만 적은 reward → 학습마다 다른 걸음 (Siekmann 등)
            </text>
            <text x={1140} y={132} fill={C.text} fontSize={22}>
              발을 들게 하고 끌지 않게 하는 항목이 필요 (Zhuang 등)
            </text>
            <text x={1140} y={168} fill={C.muted} fontSize={21}>
              답 하나: 걸음 주기를 알려 주는 clock → 다음 장면
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- the gait clock ----------

function Clock() {
  const t = useSec()
  const x0 = 120
  const w = 920
  const sx = (s: number) => x0 + (s / 64) * w
  const cy = 170
  const amp = 70
  const pts = Array.from({ length: 65 }, (_, s) => `${sx(s)},${cy - amp * Math.sin((2 * Math.PI * s) / 64)}`).join(' ')
  const drawn = prog(t, 0.6, 2)
  const rows: [string, string, string, string, string, string][] = [
    ['두 발 지지', '6', '(1, 1)', '1', '1', '1'],
    ['왼발 지지', '29', '(1, 0)', '1', '0.35', '−0.3'],
    ['오른발 지지', '29', '(0, 1)', '1', '0.35', '−0.3'],
  ]
  const tasks: [string, number, number][] = [
    ['상자 뛰어오르기', 80, 90],
    ['틈 건너뛰기', 50, 80],
    ['계단 오르기', 90, 100],
    ['허들 넘기', 20, 100],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={480}>
        <svg width={1100} height={480}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            phase φ: 한 주기 안의 위치 0 → 1 · clock 신호 sin(2πφ) 를 observation 에 넣는다
          </text>
          <g opacity={prog(t, 0.5)}>
            <line x1={sx(0)} x2={sx(64)} y1={cy} y2={cy} stroke={C.cardEdge} strokeWidth={2} />
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <g key={p}>
                <line x1={sx(p * 64)} x2={sx(p * 64)} y1={cy - amp - 10} y2={cy + amp + 10} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="6 6" />
                <text x={sx(p * 64)} y={cy + amp + 40} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                  φ = {p}
                </text>
              </g>
            ))}
          </g>
          <polyline points={pts} fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - drawn)} />
          <text x={sx(16) + 12} y={cy - amp - 14} fill={C.accent} fontSize={22} fontFamily={MONO} opacity={prog(t, 2)}>
            sin(2πφ) ≥ 0
          </text>
          <text x={sx(44)} y={cy - 22} fill={C.accent} fontSize={22} fontFamily={MONO} opacity={prog(t, 2)}>
            sin(2πφ) &lt; 0
          </text>
          {/* stance bands */}
          <g opacity={prog(t, 6.8)}>
            <text x={28} y={322} fill={C.text} fontSize={22} fontWeight={600}>
              왼발
            </text>
            <rect x={sx(3)} y={304} width={sx(31) - sx(3)} height={26} rx={5} fill={`${C.green}44`} stroke={C.green} strokeWidth={1.5} />
            <text x={sx(17)} y={323} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={600}>
              딛음 (1) · 29 step
            </text>
            <text x={sx(48)} y={323} textAnchor="middle" fill={C.dim} fontSize={20}>
              swing (0)
            </text>
            <text x={28} y={372} fill={C.text} fontSize={22} fontWeight={600}>
              오른발
            </text>
            <rect x={sx(35)} y={354} width={sx(63) - sx(35)} height={26} rx={5} fill={`${C.orange}44`} stroke={C.orange} strokeWidth={1.5} />
            <text x={sx(49)} y={373} textAnchor="middle" fill={C.orange} fontSize={20} fontWeight={600}>
              딛음 (1) · 29 step
            </text>
            <text x={sx(17)} y={373} textAnchor="middle" fill={C.dim} fontSize={20}>
              swing (0)
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            {[0, 32, 64].map((s) => (
              <rect key={s} x={sx(Math.max(0, s - 1.5))} y={296} width={sx(Math.min(64, s + 1.5)) - sx(Math.max(0, s - 1.5))} height={92} rx={4} fill={`${C.purple}33`} stroke={C.purple} strokeWidth={1.5} />
            ))}
            <text x={28} y={430} fill={C.purple} fontSize={21} fontWeight={600}>
              sin 이 0 에서 ±0.1 안: 두 발 지지 · 모두 6 step
            </text>
            <text x={1072} y={430} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              6 + 29 + 29 = 64 step = 0.64 초
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={480} at={13} title={<Head color={C.accent} size={25}>한 주기의 점수 · 맞으면 +1, 틀리면 −0.3 (두 발 평균)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['구간', 'step', '약속 (왼, 오)', 'A 약속대로', 'B 늘 바닥', 'C 거꾸로'].map((h, i) => (
              <span key={h} style={{ ...line(C.muted, 19), width: [120, 56, 110, 100, 100, 100][i], whiteSpace: 'nowrap', fontWeight: 600, color: [C.muted, C.muted, C.muted, C.green, C.orange, C.red][i] }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([n, s, p, a, b, c], i) => (
            <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'baseline', opacity: prog(t, 13.6 + i * 0.5) }}>
              <span style={{ ...line(C.text, 21), width: 120, whiteSpace: 'nowrap' }}>{n}</span>
              <span style={{ ...num(C.text, 21), width: 56 }}>{s}</span>
              <span style={{ ...num(C.muted, 21), width: 110 }}>{p}</span>
              <span style={{ ...num(C.green, 22), width: 100 }}>{a}</span>
              <span style={{ ...num(C.orange, 22), width: 100 }}>{b}</span>
              <span style={{ ...num(C.red, 22), width: 100 }}>{c}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 8, opacity: prog(t, 15.6) }}>
            <span style={{ ...line(C.text, 22), width: 120, fontWeight: 600 }}>한 주기의 합</span>
            <span style={{ ...num(C.text, 22), width: 56 }}>64</span>
            <span style={{ width: 110 }} />
            <span style={{ ...num(C.green, 26), width: 100 }}>64</span>
            <span style={{ ...num(C.orange, 26), width: 100, opacity: prog(t, 19.3) }}>26.3</span>
            <span style={{ ...num(C.red, 26), width: 100, opacity: prog(t, 21.5) }}>−11.4</span>
          </div>
          <div style={{ display: 'grid', gap: 6, marginTop: 4 }}>
            <span style={{ ...num(C.muted, 21), opacity: prog(t, 19.3) }}>틀린 발 하나: (1 − 0.3) ÷ 2 = 0.35</span>
            <span style={{ ...num(C.orange, 22), opacity: prog(t, 19.8) }}>B: 6 + 58 × 0.35 = 26.3 · 발을 끌며 미끄러지듯</span>
            <span style={{ ...num(C.red, 22), opacity: prog(t, 21.5) }}>C: 6 − 58 × 0.3 = −11.4 · 모양은 멀쩡, 박자는 반대</span>
            <span style={{ ...line(C.text, 21), opacity: prog(t, 23) }}>C &lt; B 라서 policy 는 clock 에 박자를 맞춘다 · swing 발을 6 cm 까지 들게 하는 항목도 더한다</span>
          </div>
        </div>
      </Box>
      <Panel x={64} y={650} w={1792} h={230} style={{ opacity: prog(t, 25.5) }}>
        <div style={{ padding: '18px 28px', display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 30, alignItems: 'baseline' }}>
            <Head color={C.text} size={24}>
              박자가 없는 과제: 발 공중 시간 항목 (0.5 초 기준) 대신 fractal 지형 · H1 simulation · 과제마다 로봇 10 대 (Zhuang 등 2024)
            </Head>
            <span style={{ fontSize: 21, color: C.orange, fontWeight: 600 }}>■ 발 공중 시간 항목</span>
            <span style={{ fontSize: 21, color: C.green, fontWeight: 600 }}>■ fractal 지형</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {tasks.map(([n, a, b], i) => (
              <div key={n} style={{ display: 'grid', gap: 6, opacity: prog(t, 26 + i * 0.5) }}>
                <span style={{ ...line(C.text, 22), fontWeight: 600 }}>{n}</span>
                {[
                  [a, C.orange],
                  [b, C.green],
                ].map(([v, c]) => (
                  <div key={c as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 300, height: 18, borderRadius: 5, background: C.grid }}>
                      <div style={{ width: `${(v as number) * prog(t, 26.2 + i * 0.5, 0.8)}%`, height: '100%', borderRadius: 5, background: c as string }} />
                    </div>
                    <span style={num(c as string, 22)}>{v as number}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- the causal Transformer ----------

function Transformer() {
  const t = useSec()
  const tok = (i: number) => 40 + i * 62
  const obs: [string, string][] = [
    ['몸통의 속도, 회전 속도', '3 + 3'],
    ['관절 각도, 관절 속도 (수동 관절 포함)', '26 + 26'],
    ['몸통에서 본 중력 방향', '3'],
    ['clock', '2'],
    ['속도 명령 (앞뒤, 옆, 회전)', '3'],
    ['action: motor 16 개의 목표 각도, Kp, Kd', '16 × 3 = 48'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={740}>
        <svg width={1180} height={740}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            HT · 최근 16 step 의 token 을 읽는 causal Transformer (token 의 숫자는 HT-2 의 표)
          </text>
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i} opacity={prog(t, 0.6 + i * 0.08)}>
              <rect x={tok(i)} y={80} width={54} height={44} rx={6} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={1.5} />
              <text x={tok(i) + 27} y={110} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO}>
                66
              </text>
              <rect x={tok(i)} y={124} width={54} height={36} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={1.5} />
              <text x={tok(i) + 27} y={150} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
                48
              </text>
              {(i === 0 || i === 15 || i === 8) && (
                <text x={tok(i) + 27} y={188} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {i === 15 ? 't' : `t−${15 - i}`}
                </text>
              )}
            </g>
          ))}
          <g opacity={prog(t, 2)}>
            <text x={1040} y={110} fill={C.blue} fontSize={21}>
              observation
            </text>
            <text x={1040} y={150} fill={C.orange} fontSize={21}>
              action
            </text>
            <text x={28} y={228} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              token 하나 = 66 + 48 = 114 개
            </text>
          </g>
          <g opacity={prog(t, 6.5)}>
            <text x={520} y={228} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              16 step × 0.02 초 = 0.32 초 · 16 × 114 = 1,824 개
            </text>
            <text x={28} y={262} fill={C.muted} fontSize={21}>
              1초에 50 번 계산, 한 step 0.02 초 · 매 step 새 token 이 맨 뒤에 붙고 가장 오래된 것이 빠진다
            </text>
          </g>
          {/* the stack */}
          <g opacity={prog(t, 12.5)}>
            <polygon points="560,276 600,276 580,300" fill={C.muted} />
            <rect x={40} y={310} width={1100} height={64} rx={14} fill={`${C.purple}14`} stroke={C.purple} strokeWidth={2} />
            <text x={590} y={350} textAnchor="middle" fill={C.purple} fontSize={24} fontWeight={600}>
              token 마다 같은 MLP: 114 개 → 192 차원 vector · positional encoding 더하기
            </text>
          </g>
          <g opacity={prog(t, 14)}>
            <polygon points="560,384 600,384 580,408" fill={C.muted} />
            <rect x={40} y={418} width={1100} height={150} rx={14} fill={`${C.accent}10`} stroke={C.accent} strokeWidth={2} />
            <text x={70} y={460} fill={C.accent} fontSize={24} fontWeight={600}>
              Transformer block × 4 · causal self-attention
            </text>
            <text x={70} y={496} fill={C.text} fontSize={22}>
              causal mask: token 마다 자기와 앞선 token 만 본다
            </text>
            <text x={70} y={530} fill={C.muted} fontSize={21}>
              마지막 위치의 출력만 action 으로 쓴다
            </text>
            {Array.from({ length: 16 }, (_, k) => {
              const r = Math.floor(k / 4)
              const c = k % 4
              return <rect key={k} x={900 + c * 34} y={434 + r * 34} width={30} height={30} rx={4} fill={c <= r ? C.accent : C.grid} opacity={c <= r ? 0.9 : 0.6} />
            })}
            <text x={1060} y={500} fill={C.muted} fontSize={20}>
              mask
            </text>
          </g>
          <g opacity={prog(t, 16)}>
            <polygon points="560,578 600,578 580,602" fill={C.muted} />
            <rect x={40} y={612} width={1100} height={64} rx={14} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={2} />
            <text x={590} y={652} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              마지막 위치의 192 차원 → 작은 MLP → 다음 action 48 개 (목표 각도 16, Kp 16, Kd 16)
            </text>
          </g>
          <g opacity={prog(t, 18.8)}>
            <text x={40} y={716} fill={C.text} fontSize={23} fontFamily={MONO} fontWeight={600}>
              parameter 140 만 개
            </text>
            <text x={330} y={716} fill={C.muted} fontSize={22}>
              action 도 token 에 넣는 이유: 목표 관절 각도 − 실제로 도달한 각도 에 지형의 성질이 담긴다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={380} at={0.8} title={<Head color={C.blue}>token 하나의 114 개 (HT-2 의 표)</Head>}>
        <div style={{ display: 'grid', gap: 7 }}>
          {obs.map(([n, c], i) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', opacity: prog(t, 1.2 + i * 0.35) }}>
              <span style={{ ...line(i === 5 ? C.orange : C.text, 21), whiteSpace: 'nowrap' }}>{n}</span>
              <span style={num(i === 5 ? C.orange : C.blue, 21)}>{c}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 8, opacity: prog(t, 3.4) }}>
            <span style={{ ...line(C.text, 22), fontWeight: 600 }}>합</span>
            <span style={num(C.text, 24)}>66 + 48 = 114</span>
          </div>
          <span style={{ ...line(C.muted, 20), whiteSpace: 'nowrap', opacity: prog(t, 19.5) }}>Kp, Kd 는 PD gain · HT-2 가 step 마다 정한다</span>
        </div>
      </Box>
      <Box x={1276} y={550} w={580} h={330} at={24} title={<Head color={C.accent} size={25}>network 만 바꿔 비교 · 성공률 (그래프에서 읽음)</Head>}>
        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <Bar label="Transformer" value={97} max={100} color={C.accent} at={24.4} width={220} fmt="약 97" unit="%" labelW={140} />
          <Bar label="LSTM" value={89} max={100} color={C.muted} at={25} width={220} fmt="약 89" unit="%" labelW={140} />
          <Bar label="TCN" value={87} max={100} color={C.muted} at={25.6} width={220} fmt="약 87" unit="%" labelW={140} />
          <Bar label="MLP" value={76} max={100} color={C.red} at={26.2} width={220} fmt="약 76" unit="%" labelW={140} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- in-context adaptation ----------

function InContext() {
  const t = useSec()
  const slots = 16
  const sw = 50
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={460}>
        <svg width={1000} height={460}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 weight, 다른 token 16 개 → 다른 걸음 (저자들이 든 근거 셋)
          </text>
          <text x={972} y={42} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          {/* flat → downhill → flat */}
          <g opacity={prog(t, 6.8)}>
            <polyline points="40,150 300,150 520,250 760,250" fill="none" stroke={C.muted} strokeWidth={4} strokeLinecap="round" />
            <Biped x={160} y={60} h={90} color={C.accent} lift={1} />
            <Biped x={410} y={110} h={90} color={C.orange} lift={0.3} lean={-0.3} />
            <Biped x={650} y={160} h={90} color={C.accent} lift={1} />
            <text x={160} y={290} textAnchor="middle" fill={C.accent} fontSize={21}>
              평지: 원래 걸음
            </text>
            <text x={410} y={290} textAnchor="middle" fill={C.orange} fontSize={21} fontWeight={600}>
              내리막: 발 덜 들고 보폭 줄임
            </text>
            <text x={650} y={290} textAnchor="middle" fill={C.accent} fontSize={21}>
              평지: 원래 걸음으로
            </text>
          </g>
          <g opacity={prog(t, 10.2)}>
            <polyline points="800,250 880,250 880,205 960,205" fill="none" stroke={C.muted} strokeWidth={4} strokeLinecap="round" />
            <Biped x={840} y={115} h={90} color={C.red} lift={2} />
            <text x={880} y={290} textAnchor="middle" fill={C.red} fontSize={21} fontWeight={600}>
              학습에 없던 턱
            </text>
          </g>
          <g opacity={prog(t, 8.4)}>
            <text x={40} y={340} fill={C.text} fontSize={22}>
              · 마지막 층의 192 차원 출력을 2 차원으로 그리면 점들이 지형별로 무리를 이룬다
            </text>
          </g>
          <g opacity={prog(t, 10.6)}>
            <text x={40} y={374} fill={C.text} fontSize={22}>
              · 계단 턱에 걸리면 다음 시도에서 다리를 더 높고 빠르게 들어 넘어간다
            </text>
          </g>
          <g opacity={prog(t, 12)}>
            <text x={40} y={408} fill={C.text} fontSize={22}>
              · 모래 (HT-2): 흙길과 엉덩이 관절의 궤적이 같고, 같은 궤적을 위해 torque 를 더 낸다
            </text>
            <text x={40} y={442} fill={C.muted} fontSize={21}>
              4족의 RMA 는 마찰·짐 무게 8 개 값을 따로 추정했지만, HT 는 알아채기와 걸음 바꾸기가 한 network 안에서
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={460} at={0.3}>
        <Misconception at={0.6} belief="로봇 위에서 계속 학습해 weight 를 고친다" fact="weight 는 그대로다. 바뀌는 것은 최근 16 step(0.32 초)의 token 뿐이다" />
      </Box>
      <Panel x={64} y={630} w={1000} h={250} style={{ opacity: prog(t, 13.5) }}>
        <svg width={1000} height={250}>
          <g opacity={prog(t, 13.5)}>
            <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
              모래에 들어선 뒤 context 16 token 이 바뀌는 데 걸리는 시간
            </text>
            {Array.from({ length: slots }, (_, i) => {
              const sand = i >= 11
              return (
                <g key={i}>
                  <rect x={28 + i * (sw + 8)} y={70} width={sw} height={54} rx={6} fill={sand ? `${C.orange}44` : `${C.blue}33`} stroke={sand ? C.orange : C.blue} strokeWidth={1.5} opacity={sand ? prog(t, 15 + (i - 11) * 0.25) : 1} />
                  <text x={28 + i * (sw + 8) + sw / 2} y={104} textAnchor="middle" fill={sand ? C.orange : C.blue} fontSize={18} fontFamily={MONO} opacity={sand ? prog(t, 15 + (i - 11) * 0.25) : 1}>
                    {i - 15 === 0 ? 't' : `${i - 15}`}
                  </text>
                </g>
              )
            })}
            <text x={28} y={160} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              단단한 바닥 16 − 5 = 11
            </text>
            <text x={660} y={160} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15.4)}>
              모래 0.1 ÷ 0.02 = 5
            </text>
          </g>
          <text x={28} y={206} fill={C.text} fontSize={22} opacity={prog(t, 18)}>
            16 개가 모두 모래 위의 token 이 되는 때: <tspan fontFamily={MONO} fontWeight={600} fill={C.accent}>16 × 0.02 = 0.32 초</tspan>
          </text>
          <text x={28} y={236} fill={C.muted} fontSize={20} opacity={prog(t, 18.6)}>
            그 0.32 초 동안 policy 의 입력이 점점 모래 쪽으로 옮겨 간다
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={630} w={760} h={250} at={20.5} title={<Head color={C.accent}>context 길이 · 25° 경사 · 1 m/s 명령 · 평균 속도</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="1 step" value={0.62} max={1} color={C.muted} at={20.9} width={300} fmt="약 0.62" unit=" m/s" labelW={90} />
          <Bar label="8 step" value={0.71} max={1} color={C.muted} at={21.5} width={300} fmt="약 0.71" unit=" m/s" labelW={90} />
          <Bar label="16 step" value={0.75} max={1} color={C.accent} at={22.1} width={300} fmt="약 0.75" unit=" m/s" labelW={90} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- teacher + RL ----------

function Teacher() {
  const t = useSec()
  const gx = (p: number) => 60 + p * 7.2 // 0..100 % → x
  const gy = (l: number) => 200 - l * 120 // λ 0..1 → y
  const cols: [string, string, string, string][] = [
    ['0%', '1', '1 × 0.4 = 0.4', 'teacher 와 RL'],
    ['25%', '0.5', '0.5 × 0.4 = 0.2', 'teacher 와 RL'],
    ['50% 이후', '0', '0', 'RL 만'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={400}>
        <svg width={1180} height={400}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            관측만 받는 Transformer 를 처음부터 RL 로 → sample 이 많이 들어 실험을 되풀이하기 어렵다
          </text>
          <g opacity={prog(t, 1.6)}>
            <rect x={28} y={70} width={520} height={200} rx={16} fill={`${C.green}12`} stroke={C.green} strokeWidth={2.5} />
            <text x={50} y={108} fill={C.green} fontSize={25} fontWeight={700}>
              1 단계 · MLP teacher
            </text>
            <text x={50} y={144} fill={C.text} fontSize={22}>
              simulation 의 상태 전체 (로봇·환경 parameter 포함)
            </text>
            <text x={50} y={178} fill={C.text} fontSize={22}>
              RL 로 빨리 학습 · reward 설정을 여기서 맞춤
            </text>
            <text x={50} y={212} fill={C.muted} fontSize={21}>
              실물에는 올라가지 않는다
            </text>
            <text x={50} y={246} fill={C.muted} fontSize={21}>
              Isaac Gym · 닫힌 링크는 아주 단단한 가상 spring 으로
            </text>
          </g>
          <g opacity={prog(t, 3.6)}>
            <rect x={632} y={70} width={520} height={200} rx={16} fill={`${C.accent}10`} stroke={C.accent} strokeWidth={2.5} />
            <text x={654} y={108} fill={C.accent} fontSize={25} fontWeight={700}>
              2 단계 · Transformer student
            </text>
            <text x={654} y={144} fill={C.text} fontSize={22}>
              관측 이력 16 step 만 → 실제 Digit 에 올림
            </text>
            <text x={654} y={182} fill={C.text} fontSize={21} fontFamily={MONO} fontWeight={600}>
              loss = RL + λ × KL(student‖teacher)
            </text>
            <text x={654} y={216} fill={C.muted} fontSize={21}>
              두 항 모두 student 가 모은 상태에서 계산
            </text>
            <text x={654} y={246} fill={C.muted} fontSize={21}>
              실수로 들어간 상태에서도 teacher 정답을 배운다
            </text>
          </g>
          <g opacity={prog(t, 12.8)}>
            <line x1={548} y1={170} x2={632} y2={170} stroke={C.orange} strokeWidth={3} />
            <circle cx={632} cy={170} r={6} fill={C.orange} />
            <text x={590} y={158} textAnchor="middle" fill={C.orange} fontSize={21} fontWeight={600}>
              KL
            </text>
            <text x={28} y={316} fill={C.text} fontSize={22}>
              KL divergence: 같은 상태에서 student 가 action 을 고르는 분포와 teacher 의 분포가 얼마나 다른가 · 같으면 0, 다를수록 커진다
            </text>
          </g>
          <text x={28} y={360} fill={C.muted} fontSize={21} opacity={prog(t, 24.5)}>
            실물 Digit: policy 1초에 50 번, 관절 PD controller 1,000 번 · 학습 지형의 경사는 10% grade (약 5.7°) 까지
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={400} at={24.5} title={<Head color={C.accent}>25° 경사 · 1 m/s 명령 · 평균 속도 (그래프에서 읽음)</Head>}>
        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <Bar label="RL 만" value={0.15} max={1} color={C.red} at={24.9} width={200} fmt="약 0.15" unit=" m/s" labelW={120} />
          <Bar label="따라 하기만" value={0.63} max={1} color={C.muted} at={25.7} width={200} fmt="약 0.63" unit=" m/s" labelW={120} />
          <Bar label="둘을 섞음" value={0.75} max={1} color={C.green} at={26.5} width={200} fmt="약 0.75" unit=" m/s" labelW={120} />
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 27.6) }}>따라 하기만 하면 teacher 의 action 을 맞히는 데 그친다 · teacher 는 상태 전체를 보고 student 는 관측만 받아서, teacher 의 최선이 student 의 최선은 아닐 수 있다</span>
        </div>
      </Box>
      <Panel x={64} y={570} w={1792} h={310} style={{ opacity: prog(t, 12.5) }}>
        <svg width={1792} height={310}>
          <g opacity={prog(t, 12.5)}>
            <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
              따라 하기 항의 weight λ · 예: 시작값 1, 학습 절반에서 0 (KL 은 늘 0.4 로 둔다)
            </text>
            <line x1={gx(0)} x2={gx(100)} y1={gy(0)} y2={gy(0)} stroke={C.muted} strokeWidth={2} />
            <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(1) - 10} stroke={C.muted} strokeWidth={2} />
            {[0, 25, 50, 75, 100].map((p) => (
              <text key={p} x={gx(p)} y={gy(0) + 30} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {p}%
              </text>
            ))}
            {[0, 0.5, 1].map((l) => (
              <text key={l} x={gx(0) - 14} y={gy(l) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {l}
              </text>
            ))}
            <text x={gx(100) + 16} y={gy(0) + 7} fill={C.muted} fontSize={20}>
              학습 진행
            </text>
            <text x={gx(0) - 14} y={gy(1) - 20} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              λ
            </text>
          </g>
          <polyline points={`${gx(0)},${gy(1)} ${gx(50)},${gy(0)} ${gx(100)},${gy(0)}`} fill="none" stroke={C.orange} strokeWidth={4} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - prog(t, 13.5, 1.5))} />
          {cols.map(([p, l, term, who], i) => {
            const px = [0, 25, 50][i]
            return (
              <g key={p} opacity={prog(t, 18.8 + i * 0.9)}>
                <circle cx={gx(px)} cy={gy(Number(l))} r={8} fill={C.orange} />
                <rect x={960 + i * 280} y={70} width={260} height={150} rx={14} fill={C.bg} stroke={i === 2 ? C.accent : C.cardEdge} strokeWidth={1.5} />
                <text x={980 + i * 280} y={104} fill={C.text} fontSize={22} fontWeight={600}>
                  학습 {p}
                </text>
                <text x={980 + i * 280} y={138} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  λ = {l}
                </text>
                <text x={980 + i * 280} y={170} fill={C.text} fontSize={21} fontFamily={MONO}>
                  {term}
                </text>
                <text x={980 + i * 280} y={202} fill={i === 2 ? C.accent : C.muted} fontSize={21} fontWeight={600}>
                  {who}
                </text>
              </g>
            )
          })}
          <text x={28} y={286} fill={C.muted} fontSize={21} opacity={prog(t, 22)}>
            초반에는 teacher 가 빠르게 길을 알려 주고, 후반에는 student 가 RL 만으로 teacher 를 넘어설 수 있다
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- pretraining + RL fine-tuning ----------

function Finetune() {
  const t = useSec()
  const pairs: [string, number, number, number][] = [
    ['오르막', 45.3, 95.8, 20],
    ['몸통 밀기', 5.8, 87.6, 21],
    ['장애물', 24.9, 93.2, 22],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={340}>
        <svg width={1100} height={340}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            teacher 를 거쳐도 HT 는 10억 step 넘게 RL → 걷기 궤적으로 먼저 사전 학습
          </text>
          <g opacity={prog(t, 2.5)}>
            <rect x={28} y={70} width={400} height={180} rx={14} fill={`${C.blue}12`} stroke={C.blue} strokeWidth={2} />
            <text x={48} y={104} fill={C.blue} fontSize={23} fontWeight={700}>
              평지 걷기 궤적
            </text>
            <text x={48} y={138} fill={C.text} fontSize={21}>
              · HT 의 simulation 10 초 궤적 1만 개
            </text>
            <text x={48} y={170} fill={C.text} fontSize={21}>
              · 제조사 controller 의 궤적
            </text>
            <text x={48} y={202} fill={C.text} fontSize={21}>
              · 사람 motion capture · YouTube
            </text>
            <text x={48} y={234} fill={C.muted} fontSize={20}>
              뒤의 둘은 action 을 mask token 으로
            </text>
          </g>
          <g opacity={prog(t, 4)}>
            <polygon points="432,160 462,160 462,148 486,160 462,172 462,160" fill={C.muted} />
            <rect x={492} y={70} width={280} height={180} rx={14} fill={`${C.purple}14`} stroke={C.purple} strokeWidth={2} />
            <text x={632} y={128} textAnchor="middle" fill={C.purple} fontSize={23} fontWeight={700}>
              사전 학습
            </text>
            <text x={632} y={164} textAnchor="middle" fill={C.text} fontSize={21}>
              다음 관측·action 맞히기
            </text>
            <text x={632} y={198} textAnchor="middle" fill={C.muted} fontSize={20}>
              이것만으로
            </text>
            <text x={632} y={226} textAnchor="middle" fill={C.muted} fontSize={20}>
              샌프란시스코 거리를 걸음
            </text>
          </g>
          <g opacity={prog(t, 13.5)}>
            <polygon points="776,160 806,160 806,148 830,160 806,172 806,160" fill={C.muted} />
            <rect x={836} y={70} width={240} height={180} rx={14} fill={`${C.green}12`} stroke={C.green} strokeWidth={2} />
            <text x={956} y={108} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={700}>
              RL fine-tuning
            </text>
            <text x={956} y={142} textAnchor="middle" fill={C.text} fontSize={20}>
              PPO · 거친 바닥 · 언덕
            </text>
            <text x={956} y={172} textAnchor="middle" fill={C.text} fontSize={20}>
              경사 2 ~ 20% grade
            </text>
            <text x={956} y={202} textAnchor="middle" fill={C.text} fontSize={20}>
              장애물 0.5 ~ 5 cm
            </text>
            <text x={956} y={234} textAnchor="middle" fill={C.muted} fontSize={19}>
              noise std 0.135
            </text>
          </g>
          <text x={28} y={300} fill={C.muted} fontSize={21} opacity={prog(t, 13.5)}>
            HT-2 · 사전 학습한 걸음을 망가뜨리지 않도록 작은 noise 로 시작
          </text>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={340} at={6.5} title={<Head color={C.blue}>데이터의 양과 RL step</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...num(C.blue, 24), opacity: prog(t, 7) }}>10,000 × 10 = 100,000 초 ≈ 27.8 시간</span>
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 8) }}>저자들: 걷기 데이터 27 시간만으로도 실물에 옮겨졌다</span>
          <span style={{ ...num(C.green, 23), opacity: prog(t, 13.5) }}>2048 env × 24 step × 2000 iteration</span>
          <span style={{ ...num(C.green, 23), opacity: prog(t, 14.3) }}>= 98,304,000 ≈ 1억 step</span>
          <div style={{ display: 'grid', gap: 8, opacity: prog(t, 15.5) }}>
            <Bar label="HT" value={10} max={10} color={C.red} at={15.6} width={170} fmt="10억" unit=" step" labelW={70} />
            <Bar label="HT-2" value={1} max={10} color={C.green} at={16.4} width={170} fmt="약 1억" unit=" step" sub="약 10 분의 1" labelW={70} />
          </div>
        </div>
      </Box>
      <Panel x={64} y={510} w={1100} h={370} style={{ opacity: prog(t, 19.5) }}>
        <svg width={1100} height={370}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 19.5)}>
            simulation 성공률 · 사전 학습 → fine-tuning (HT-2 Fig. 10)
          </text>
          <g opacity={prog(t, 19.5)}>
            <text x={790} y={42} fill={C.muted} fontSize={19} fontWeight={600}>
              ■ 사전 학습만
            </text>
            <text x={935} y={42} fill={C.green} fontSize={19} fontWeight={600}>
              ■ fine-tuning 뒤
            </text>
          </g>
          {pairs.map(([n, a, b, at], i) => {
            const y = 80 + i * 92
            return (
              <g key={n} opacity={prog(t, at)}>
                <text x={28} y={y + 34} fill={C.text} fontSize={23} fontWeight={600}>
                  {n}
                </text>
                <rect x={180} y={y} width={(a / 100) * 640 * prog(t, at, 0.8)} height={24} rx={5} fill={C.muted} opacity={0.7} />
                <text x={180 + (a / 100) * 640 + 12} y={y + 19} fill={C.muted} fontSize={21} fontFamily={MONO} opacity={prog(t, at + 0.6)}>
                  {a}%
                </text>
                <rect x={180} y={y + 32} width={(b / 100) * 640 * prog(t, at + 0.4, 0.8)} height={24} rx={5} fill={C.green} />
                <text x={180 + (b / 100) * 640 + 12} y={y + 51} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 1)}>
                  {b}%
                </text>
                <text x={1072} y={y + 40} textAnchor="end" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 1.2)}>
                  {a} → {b}
                </text>
              </g>
            )
          })}
        </svg>
      </Panel>
      <Box x={1196} y={510} w={660} h={370} at={25.5} title={<Head color={C.green}>처음부터 RL 과 비교 · 실제 Digit</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.red, 22), opacity: prog(t, 25.9) }}>✕ 오해: 사전 학습 뒤 RL 은 처음부터 RL 과 같은 곳에 더 빨리 이를 뿐</span>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 27) }}>✓ 약 1억 step 의 fine-tuning 이 처음부터 2억 step 학습한 policy 보다 높았다 · 처음부터는 한쪽 다리를 끄는 걸음에 머묾</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 28.6) }}>카메라 없이 버클리 산길 다섯 곳 약 4.3 마일 (약 6.9 km) 완주 · 31% grade (약 17°) 오르내림 · 진흙·물·모래</span>
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 30) }}>한계: 연석 같은 턱은 부딪혀 봐야 알고, 계단과 징검다리는 시각이 필요 → parkour 장면</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- sim-to-sim ----------

function Sim2Sim() {
  const t = useSec()
  const inputs: [string, number][] = [
    ['clock', 2],
    ['속도 명령', 3],
    ['관절 각도', 12],
    ['관절 속도', 12],
    ['몸통 회전 속도', 3],
    ['몸통 자세', 3],
    ['직전 action', 12],
  ]
  const node = (x: number, w: number, title: string, lines: string[], color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={70} width={w} height={170} rx={16} fill={`${color}12`} stroke={color} strokeWidth={2.5} />
      <text x={x + 22} y={108} fill={color} fontSize={24} fontWeight={700}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={x + 22} y={144 + i * 32} fill={i === lines.length - 1 ? C.muted : C.text} fontSize={21}>
          {l}
        </text>
      ))}
    </g>
  )
  const arrow = (x1: number, x2: number, label: string, at: number) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={155} x2={x2 - 10} y2={155} stroke={C.accent} strokeWidth={3} />
      <polygon points={`${x2 - 14},145 ${x2},155 ${x2 - 14},165`} fill={C.accent} />
      <text x={(x1 + x2) / 2} y={140} textAnchor="middle" fill={C.accent} fontSize={20} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <svg width={1792} height={300}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            Humanoid-Gym (Gu 등 2024) · 학습한 simulator 와 다른 simulator 에서 같은 policy 를 다시 시험한다
          </text>
          {node(28, 520, '① Isaac Gym 에서 학습', ['GPU 로 env 8192 개를 함께 계산', '빠르지만 덜 정확', 'actor 만 실물에 올라간다'], C.orange, 0.6)}
          {arrow(548, 636, '', 1.6)}
          {node(636, 560, '② MuJoCo 에서 다시 걷기', ['CPU 로 계산, 더 정확', '실물 XBot 관절의 사인파 궤적에 맞춰 보정', '로봇이 없는 연구자도 여기서 검증'], C.accent, 2.2)}
          {arrow(1196, 1284, '', 3.4)}
          {node(1284, 480, '③ 실물 XBot', ['XBot-S 키 1.2 m', 'XBot-L 키 1.65 m', '보정한 MuJoCo 가 실물에 더 가까움'], C.green, 4)}
          <text x={28} y={282} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 7)}>
            simulator 마다 접촉과 관절을 계산하는 방식이 달라서, 한 simulator 의 계산 방식에만 맞춘 걸음은 다른 simulator 에서 무너진다 → sim-to-sim 검증
          </text>
        </svg>
      </Panel>
      <Box x={64} y={470} w={1100} h={410} at={13} title={<Head color={C.accent}>actor 의 입력 (실물에 올라가는 쪽)</Head>}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {inputs.map(([n, v], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: prog(t, 13.4 + i * 0.3) }}>
              <div style={{ padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${C.cardEdge}`, background: C.bg, display: 'grid', justifyItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 20, color: C.muted, whiteSpace: 'nowrap' }}>{n}</span>
                <span style={num(C.text, 24)}>{v}</span>
              </div>
              {i < inputs.length - 1 && <span style={{ fontSize: 24, color: C.muted }}>+</span>}
            </div>
          ))}
          <span style={{ ...num(C.accent, 28), marginLeft: 10, opacity: prog(t, 15.6) }}>= 47</span>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 6 }}>
          <span style={{ ...num(C.accent, 28), opacity: prog(t, 16.2) }}>47 × 15 step = 705 개 · 0.15 초의 이력</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 17.2) }}>policy 는 1초에 100 번 (한 step 0.01 초) · PD controller 는 1초에 1,000 번 torque 계산 · 걸음 clock 은 sin·cos 2 개</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 18) }}>이어 붙인 705 개를 첫 층 512 개 MLP 에 넣는다 (HT 는 token 마다 같은 MLP)</span>
        </div>
      </Box>
      <Box x={1196} y={470} w={660} h={410} at={19.5} title={<Head color={C.purple}>asymmetric actor-critic</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 19.9) }}>
            <span style={{ ...num(C.accent, 22), width: 90 }}>actor</span>
            <span style={line(C.text, 22)}>47 × 15 = 705 개 · 실물에 올라간다</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 20.8) }}>
            <span style={{ ...num(C.purple, 22), width: 90 }}>critic</span>
            <span style={line(C.text, 22)}>마찰·질량·몸통 속도 같은 privileged 값까지 73 개 × 3 step · 학습할 때만</span>
          </div>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 22.2) }}>✓ 실물에는 actor 만 올라가므로 teacher 를 student 로 옮기는 단계가 없다</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 23.6) }}>HT 도 Isaac Gym 의 policy 를 제조사의 정밀 simulator 로 걸렀고, HT-2 는 sample 이 적게 들어 처음부터 MuJoCo 에서 학습</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- depth parkour ----------

function Parkour() {
  const t = useSec()
  const stage = (x: number, w: number, title: string, lines: string[], color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={70} width={w} height={210} rx={16} fill={`${color}12`} stroke={color} strokeWidth={2.5} />
      <text x={x + 20} y={106} fill={color} fontSize={23} fontWeight={700}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={x + 20} y={142 + i * 32} fill={C.text} fontSize={20}>
          {l}
        </text>
      ))}
    </g>
  )
  const obstacles: [string, string, string, string, string][] = [
    ['상자 (jump up)', '0.42 m', '0.42 ÷ 0.8 ≈ 0.53', '90%', '0% · 0%'],
    ['허들', '0.25 m', '0.25 ÷ 0.8 ≈ 0.31', '100%', 'MPC 0%'],
    ['틈 (leap)', '0.8 m', '0.8 ÷ 0.8 = 1', '두 발이 뜨는 도약', ''],
  ]
  const tx = (s: number) => 40 + s * 7800 // 0..0.1 s → 780 px
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={400}>
        <svg width={1180} height={400}>
          <text x={28} y={42} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 0.3)}>
            카메라 없는 policy 는 턱에 부딪혀 봐야 안다 → 머리의 depth 카메라 (픽셀마다 거리) · 세 단계 학습
          </text>
          {stage(28, 340, '① 평지 걷기 policy', ['fractal 지형에서 학습', '앞뒤 −0.8 ~ 2.0 m/s', '옆 −0.8 ~ 0.8 m/s', '회전 −1 ~ 1 rad/s 명령'], C.blue, 2.2)}
          {stage(408, 370, '② oracle parkour policy', ['scandot 11 × 19 = 209 점의 높이', '→ 32 개로 요약, GRU + MLP', '지형 10 종류 × 난이도 10 단계', '3/4 넘게 가면 ↑ · 1/2 못 가면 ↓'], C.orange, 7.2)}
          {stage(818, 334, '③ depth student', ['depth 48 × 64 = 3,072 픽셀', '→ CNN 으로 32 개', 'GRU·MLP 는 oracle 에서 복사', 'DAgger 로 distillation'], C.green, 13)}
          <g opacity={prog(t, 7)}>
            <polygon points="370,175 400,175 400,163 408,175 400,187 400,175" fill={C.muted} />
            <text x={388} y={210} textAnchor="middle" fill={C.muted} fontSize={18}>
              
            </text>
          </g>
          <g opacity={prog(t, 13.4)}>
            <polygon points="780,175 810,175 810,163 818,175 810,187 810,175" fill={C.muted} />
            <text x={798} y={210} textAnchor="middle" fill={C.muted} fontSize={18}>
              
            </text>
          </g>
          <text x={28} y={322} fill={C.text} fontSize={22} opacity={prog(t, 15.5)}>
            DAgger: student 가 움직이고 지나간 상태마다 oracle 이 정답 action 을 낸다 = distillation
          </text>
          <text x={28} y={360} fill={C.muted} fontSize={21} opacity={prog(t, 17)}>
            simulation 의 depth 이미지에는 실제 카메라처럼 noise 와 무작위 잡티를 넣는다
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={400} at={0.3} title={<Head color={C.green}>Unitree H1 (Zhuang 등 2024)</Head>}>
        <div style={{ display: 'flex', gap: 20 }}>
          <svg width={130} height={150}>
            <Biped x={62} y={12} h={135} color={C.green} lift={1} />
            <rect x={48} y={14} width={34} height={14} rx={4} fill={C.orange} opacity={prog(t, 1.5)} />
            <text x={66} y={10} textAnchor="middle" fill={C.orange} fontSize={16} fontWeight={600} opacity={prog(t, 1.5)}>
              depth
            </text>
          </svg>
          <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 0.8) }}>키 약 1.8 m · 무게 약 47 kg · 관절 19 개</span>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 1.3) }}>허벅지 0.4 m + 정강이 0.4 m = 다리 0.8 m</span>
            <span style={{ ...line(C.muted, 21), opacity: prog(t, 1.8) }}>0.42 m 상자, 0.8 m 틈 parkour 는 카메라 없이는 어렵다</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8, opacity: prog(t, 17.5) }}>
          <Label size={21}>24 시간 학습한 student 의 상자 성공률</Label>
          <Bar label="GPU 4 장" value={85} max={100} color={C.green} at={17.8} width={150} unit="%" labelW={200} />
          <Bar label="GPU 1 장" value={40} max={100} color={C.orange} at={18.3} width={150} unit="%" labelW={200} />
          <Bar label="oracle weight 없이" value={0} max={100} color={C.red} at={18.8} width={150} unit="%" labelW={200} />
        </div>
      </Box>
      <Panel x={64} y={570} w={900} h={310} style={{ opacity: prog(t, 19.5) }}>
        <svg width={900} height={310}>
          <g opacity={prog(t, 19.5)}>
            <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
              실물에서 0.1 초 동안의 계산
            </text>
            {[
              ['depth encoder · 1초에 10 번', 1, C.orange, 90],
              ['policy · 1초에 50 번', 5, C.accent, 150],
              ['motor PD · 1초에 1,000 번', 100, C.muted, 210],
            ].map(([n, k, c, y]) => (
              <g key={n as string}>
                <text x={28} y={(y as number) - 14} fill={c as string} fontSize={21} fontWeight={600}>
                  {n as string}
                </text>
                <line x1={tx(0)} x2={tx(0.1)} y1={y as number} y2={y as number} stroke={C.cardEdge} strokeWidth={2} />
                {Array.from({ length: (k as number) + 1 }, (_, i) => (
                  <line key={i} x1={tx((i / (k as number)) * 0.1)} x2={tx((i / (k as number)) * 0.1)} y1={(y as number) - 10} y2={(y as number) + 10} stroke={c as string} strokeWidth={(k as number) > 20 ? 1.5 : 3} opacity={prog(t, 19.8 + i * (0.6 / (k as number)))} />
                ))}
              </g>
            ))}
            <text x={tx(0)} y={250} textAnchor="middle" fill={C.muted} fontSize={19} fontFamily={MONO}>
              0 초
            </text>
            <text x={tx(0.1)} y={250} textAnchor="middle" fill={C.muted} fontSize={19} fontFamily={MONO}>
              0.1 초
            </text>
          </g>
          <text x={28} y={292} fill={C.accent} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 22.5)}>
            depth 하나를 policy 가 50 ÷ 10 = 5 번 · PD 는 1,000 ÷ 50 = 20 번
          </text>
        </svg>
      </Panel>
      <Box x={996} y={570} w={860} h={310} at={25.8} title={<Head color={C.orange}>실물 시험 · 장애물마다 10 번 (그래프에서 읽음)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['장애물', '크기', '다리 0.8 m 에 대한 비율', 'depth policy', '걷기 policy · MPC'].map((h, i) => (
              <span key={h} style={{ ...line(C.muted, 19), width: [150, 80, 220, 130, 170][i], fontWeight: 600, whiteSpace: 'nowrap' }}>
                {h}
              </span>
            ))}
          </div>
          {obstacles.map(([n, s, r, d, m], i) => (
            <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'baseline', opacity: prog(t, 26.2 + i * 0.6) }}>
              <span style={{ ...line(C.text, 22), width: 150, whiteSpace: 'nowrap' }}>{n}</span>
              <span style={{ ...num(C.text, 22), width: 80 }}>{s}</span>
              <span style={{ ...num(C.muted, 21), width: 220 }}>{r}</span>
              <span style={{ ...num(C.green, 23), width: 130, fontSize: i === 2 ? 20 : 23 }}>{d}</span>
              <span style={{ ...num(C.red, 22), width: 170 }}>{m}</span>
            </div>
          ))}
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 28.4) }}>0.8 m 틈은 다리 길이만큼 넓다 · 공중에서는 발이 바닥을 밀 수 없어 궤적을 바꿀 수 없으므로, 도약 전에 본 depth 로 도약을 정한다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: '2족 보행과 clock', color: C.accent, text: 'Digit 자유도 36 개 중 policy 가 16 개 · clock reward 64 점 vs −11.4 점 · fractal 지형으로 허들 20% → 100%', at: 0.5 },
    { tag: 'causal Transformer', color: C.purple, text: 'token 16 개 (0.32 초) 를 읽고 weight 는 그대로 · 내리막·계단 턱·모래에 맞춰 걸음을 바꾼다', at: 4.4 },
    { tag: 'teacher · 사전 학습', color: C.orange, text: 'λ × KL 을 학습 절반까지 줄이며 RL 과 섞음 · 사전 학습 뒤 약 1억 step fine-tuning → 산길 약 4.3 마일', at: 8.3 },
    { tag: 'MuJoCo 검증과 parkour', color: C.green, text: '보정한 MuJoCo 에서 다시 시험 · depth student 로 distillation → 0.42 m 상자 10 번 중 9 번', at: 12.2 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            두 발 로봇에게 발을 언제 들고 디딜지 무엇으로 알려 주고, 산길과 장애물을 넘게 하려면 무엇을 더해야 할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 32px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.35 }}>{it.text}</span>
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
            NEXT · RL
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600 }}>Humanoid WBC · Legged Balance</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            사람 동작을 frame 마다 따라 하는 전신 controller · 발 디딜 자리를 계산하는 model-based 균형 제어
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Siekmann 등 2021 · Radosavovic 등 2024 · Gu 등 2024 · Zhuang 등 2024
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseClock = () => (
  <PauseWrite
    question="두 발이 반 주기 어긋나고 swing 비율이 0.3 인 걸음에서, 두 발이 함께 바닥을 딛는 구간은 한 주기의 몇 % 일까?"
    answer={
      <>
        왼발 stance 0.3 ~ 1.0 · 오른발 stance 0.8 ~ 1.0 과 0 ~ 0.5
        <br />
        겹치는 0.3 ~ 0.5 와 0.8 ~ 1.0 → 0.2 + 0.2 = 0.4, 40% · swing 0.4 일 때의 20% 보다 길다
      </>
    }
  />
)

const PauseContext = () => (
  <PauseWrite
    question="token 하나가 114 개이고 1초에 50 번 계산하는 HT 의 context 를 16 step 에서 32 step 으로 늘리면, 들어가는 숫자는 몇 개이고 몇 초의 이력을 볼까?"
    answer="32 × 114 = 3,648 개 · 한 step 이 1 ÷ 50 = 0.02 초라서 32 × 0.02 = 0.64 초"
  />
)

const PauseLambda = () => (
  <PauseWrite
    question="λ 의 시작값을 2 로 두고 학습 절반에서 0 이 되도록 일정하게 줄인다. 학습의 20% 지점에서 λ 는 얼마이고, 그때 KL divergence 가 0.5 라면 따라 하기 항은?"
    answer="50% 까지의 20 ÷ 50 = 0.4 만큼 온 곳 → λ = 2 × (1 − 0.4) = 1.2 · 따라 하기 항 1.2 × 0.5 = 0.6"
  />
)

const PauseDepth = () => (
  <PauseWrite
    question="depth encoder 는 1초에 10 번, policy 는 50 번 계산한다. H1 이 2 m/s 로 달릴 때, 새 depth 요약이 오는 사이에 몇 cm 를 가고 policy 는 몇 번 계산할까?"
    answer="요약 사이 1 ÷ 10 = 0.1 초 → 2 × 0.1 = 0.2 m, 20 cm · policy 는 0.1 ÷ 0.02 = 5 번 같은 요약으로 계산 · 그사이는 1초에 50 번 오는 관절·IMU 값으로 따라간다"
  />
)

export function HumanoidLocomotion() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        hard: Hard,
        clock: Clock,
        'pause-clock': PauseClock,
        transformer: Transformer,
        incontext: InContext,
        'pause-context': PauseContext,
        teacher: Teacher,
        finetune: Finetune,
        'pause-lambda': PauseLambda,
        sim2sim: Sim2Sim,
        parkour: Parkour,
        'pause-depth': PauseDepth,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
