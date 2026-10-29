import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './tactile-sensing.narration.json'
import { script } from './tactile-sensing.script'

// Numbers follow lessons/tactile-sensing/README.md (see tactile-sensing.script.ts). The gripper, gel and marker drawings are
// schematic (marked 모식도); every number on screen is the lesson's.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GRASPING · TACTILE SENSING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Tactile Sensing</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            손끝에서 재는 <span style={{ color: C.accent }}>모양 · 힘 · 미끄러짐</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            카메라가 보지 못하는 접촉면을, 손가락이 닿은 바로 그 자리에서 숫자로 내는 센서
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

/** fingers holding a plug, seen by a wrist camera; the contact faces are hidden behind the fingers */
function Gripper({ t, at, w = 760, h = 310, forceAt, slipAt }: { t: number; at: number; w?: number; h?: number; forceAt?: number; slipAt?: number }) {
  const cam = { x: 80, y: 150 }
  const fl = { x: 260, w: 50 }
  const fr = { x: 480, w: 50 }
  const top = 60
  const bottom = 250
  const mid = (fl.x + fl.w + fr.x) / 2
  return (
    <svg width={w} height={h}>
      <g opacity={prog(t, at)}>
        <rect x={cam.x - 30} y={cam.y - 22} width={60} height={44} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
        <circle cx={cam.x} cy={cam.y} r={9} fill={C.accent} />
        <text x={cam.x - 36} y={cam.y + 52} fill={C.accent} fontSize={22} fontWeight={600}>
          손목 카메라
        </text>
        <line x1={cam.x + 30} y1={cam.y} x2={fl.x} y2={top + 10} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
        <line x1={cam.x + 30} y1={cam.y} x2={fl.x} y2={bottom - 10} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
      </g>
      <g opacity={prog(t, at + 0.3)}>
        <rect x={fl.x} y={top} width={fl.w} height={bottom - top} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <rect x={fr.x} y={top} width={fr.w} height={bottom - top} rx={8} fill={C.cardEdge} stroke={C.muted} strokeWidth={2} />
        <text x={fl.x + fl.w / 2} y={top - 14} textAnchor="middle" fill={C.muted} fontSize={20}>
          손가락
        </text>
        <text x={fr.x + fr.w / 2} y={top - 14} textAnchor="middle" fill={C.muted} fontSize={20}>
          손가락
        </text>
        <rect x={fl.x + fl.w} y={top + 50} width={fr.x - fl.x - fl.w} height={bottom - top - 50} rx={6} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
        <text x={mid} y={top + 108} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
          물체
        </text>
        <text x={mid} y={top + 136} textAnchor="middle" fill={C.blue} fontSize={20}>
          (플러그)
        </text>
      </g>
      <g opacity={prog(t, at + 0.8)}>
        <line x1={fl.x + fl.w} y1={top + 50} x2={fl.x + fl.w} y2={bottom} stroke={C.red} strokeWidth={5} />
        <line x1={fr.x} y1={top + 50} x2={fr.x} y2={bottom} stroke={C.red} strokeWidth={5} />
        <text x={fr.x + fr.w + 16} y={top + 100} fill={C.red} fontSize={22} fontWeight={700}>
          접촉면
        </text>
        <text x={fr.x + fr.w + 16} y={top + 128} fill={C.red} fontSize={20}>
          손가락에 가려 안 보임
        </text>
      </g>
      {forceAt !== undefined && (
        <g opacity={prog(t, forceAt)}>
          {arrow(fl.x - 70, 225, fl.x - 6, 225, C.orange, 4)}
          {arrow(fr.x + fr.w + 70, 225, fr.x + fr.w + 6, 225, C.orange, 4)}
          <text x={fl.x - 160} y={262} fill={C.orange} fontSize={22} fontWeight={600} textAnchor="start">
            N = 5 N? 25 N?
          </text>
        </g>
      )}
      {slipAt !== undefined && (
        <g opacity={prog(t, slipAt)}>
          {arrow(fl.x + fl.w + 10, bottom - 8, fl.x + fl.w + 10, bottom + 30, C.pink, 3, 9)}
          {arrow(fr.x - 10, bottom - 8, fr.x - 10, bottom + 30, C.pink, 3, 9)}
          <text x={mid + 60} y={bottom + 46} textAnchor="middle" fill={C.pink} fontSize={21} fontWeight={600}>
            가장자리부터 미끄러짐 (partial slip)
          </text>
        </g>
      )}
    </svg>
  )
}

function Question() {
  const t = useSec()
  const misses: [string, number][] = [
    ['접촉면의 모양: 손가락과 물체 사이에 끼어 어느 카메라에서도 안 보인다', 0.9],
    ['누르는 힘: 사진 어디에도 찍히지 않는다', 1.8],
    ['미끄러지기 시작하는 순간: 물체가 실제로 움직인 뒤에야 보인다', 2.7],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={310}>
        <div style={{ position: 'absolute', left: 20, top: 0 }}>
          <Gripper t={t} at={0.5} />
        </div>
        <div style={{ position: 'absolute', left: 860, top: 30, width: 900, display: 'grid', gap: 18 }}>
          <Label size={24} color={C.muted}>
            USB 플러그를 쥐고 구멍에 꽂을 때, 사진에 없는 것
          </Label>
          {misses.map(([s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color: C.red, fontSize: 28, fontWeight: 700 }}>✕</span>
              <span style={line(C.text, 25)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 478, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          닿은 바로 그 자리에서 <span style={{ color: C.accent }}>무엇을 재야 하고, 그 값은 어떻게 얻을까?</span>
        </div>
      </Appear>
      <Card x={330} y={610} w={1260} h={270} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16, opacity: prog(t, 5.8) }}>
          <Label size={22}>AnySkin 논문 · 손끝 하나에 촉각 skin 을 붙인 xArm 의 플러그 꽂기 (10 번 중 평균 성공)</Label>
          <Bar label="카메라만 보는 policy" value={1.7} max={10} color={C.red} at={6.1} width={520} unit=" 번" labelW={300} />
          <Bar label="촉각을 함께 넣은 policy" value={6.7} max={10} color={C.green} at={6.7} width={520} unit=" 번" labelW={300} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.3) }}>tactile sensor: 손끝의 무른 면이 눌리고 끌리는 모양을 재서 접촉면의 모양 · 힘 · 미끄러지는 순간을 숫자로 낸다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- what a camera misses ----------

function Occlusion() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={760} h={740}>
        <svg width={760} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            손목 카메라가 보는 것
          </text>
          <text x={730} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 0, top: 70 }}>
          <Gripper t={t} at={0.5} forceAt={13.3} slipAt={19.8} />
        </div>
        <svg width={760} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 0.9)}>
            <text x={30} y={450} fill={C.text} fontSize={24} fontWeight={600}>
              pixel 하나가 덮는 폭
            </text>
            <rect x={30} y={472} width={480 * prog(t, 1.1, 1)} height={34} rx={6} fill={C.blue} />
            <text x={30} y={536} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              카메라 · 0.5 m 앞 · 1.2 mm
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <rect x={30} y={566} width={12} height={34} rx={3} fill={C.green} />
            <text x={54} y={592} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              DIGIT · 0.03 mm
            </text>
            <text x={30} y={640} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9)}>
              1.2 ÷ 0.03 = 약 40 배 촘촘
            </text>
          </g>
          <g opacity={prog(t, 10.5)}>
            <text x={30} y={690} fill={C.muted} fontSize={21}>
              보이는 부분도 거칠게 찍히고, 접촉면 자체는 어느 카메라에서든 손가락 뒤에 있다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={856} y={140} w={1000} h={230} at={0.5} title={<Head color={C.accent}>① 접촉면의 모양</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 0.8) }}>
            0.5 m 앞을 찍는 카메라 (focal length f = 424 pixel): pixel 하나가 <span style={mono(C.blue, 24)}>500 ÷ 424 ≈ 1.2 mm</span>
          </span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 6.8) }}>
            손끝 센서 DIGIT: 가로 19 mm 를 640 pixel 로 → <span style={mono(C.green, 24)}>19 ÷ 640 ≈ 0.03 mm</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 9.2) }}>같은 접촉면을 카메라보다 약 40 배 촘촘하게 본다</span>
        </div>
      </Box>
      <Box x={856} y={390} w={1000} h={235} at={13.2} title={<Head color={C.orange}>② 누르는 힘</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 13.5) }}>
            <span style={mono(C.orange, 24)}>5 N</span> 으로 쥐었는지 <span style={mono(C.orange, 24)}>25 N</span> 으로 쥐었는지 사진으로는 구별할 수 없다
          </span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 15.2) }}>
            손끝용 GelSight: 대부분의 조건에서 <span style={mono(C.green, 24)}>0.05 N</span> 보다 작은 힘도 구분 (논문)
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.2) }}>손목 F/T sensor 는 모든 접촉을 합친 숫자 6 개뿐 · 어느 손가락의 어느 자리인지 모름 · ATI mini45 약 3,000 달러</span>
        </div>
      </Box>
      <Box x={856} y={640} w={1000} h={240} at={19.7} title={<Head color={C.pink}>③ 미끄러지기 시작하는 순간</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 20) }}>
            접선 힘 T 가 friction cone 의 한계 <span style={mono(C.pink, 24)}>μN</span> 에 다가가면 가장자리부터 조금씩 미끄러진다 → partial slip
          </span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 22.5) }}>가려진 면 안에서 일어나서, 사진에는 물체가 통째로 움직인 뒤에야 나타난다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.8) }}>Grasp Planning 의 0.5 kg 예: 안전율 2 의 14.8 N (T ÷ N = 0.25) 대신, partial slip 을 보면 7.4 N 근처로 쥐다가 올릴 수 있다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

/** cross-sections of the three sensor families, 530 × 150 */
function Resistive({ t, at }: { t: number; at: number }) {
  return (
    <svg width={520} height={150}>
      <g opacity={prog(t, at)}>
        {arrow(260, 8, 260, 40, C.orange, 3, 10)}
        <text x={280} y={30} fill={C.orange} fontSize={20}>
          누르는 힘
        </text>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={120} x2={400} y1={56 + i * 14} y2={56 + i * 14} stroke={C.blue} strokeWidth={4} opacity={0.9} />
        ))}
        <rect x={110} y={88} width={300} height={16} rx={3} fill={`${C.muted}66`} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={126 + i * 48} y={110} width={6} height={30} fill={C.blue} opacity={0.9} />
        ))}
        <rect x={236} y={88} width={48} height={16} rx={3} fill={C.orange} opacity={0.8} />
        <text x={420} y={70} fill={C.blue} fontSize={19}>
          가로 전극
        </text>
        <text x={420} y={102} fill={C.muted} fontSize={19}>
          Velostat 막
        </text>
        <text x={420} y={134} fill={C.blue} fontSize={19}>
          세로 전극
        </text>
        <text x={12} y={102} fill={C.orange} fontSize={19}>
          눌린 칸
        </text>
      </g>
    </svg>
  )
}

function Magnetic({ t, at }: { t: number; at: number }) {
  return (
    <svg width={520} height={150}>
      <g opacity={prog(t, at)}>
        {arrow(150, 8, 210, 40, C.orange, 3, 10)}
        <text x={222} y={30} fill={C.orange} fontSize={20}>
          누르고 끄는 힘
        </text>
        <rect x={60} y={50} width={300} height={40} rx={6} fill={`${C.purple}33`} stroke={C.purple} strokeWidth={2} />
        {Array.from({ length: 36 }, (_, i) => (
          <circle key={i} cx={72 + (i % 12) * 25} cy={62 + Math.floor(i / 12) * 12} r={2.2} fill={C.purple} />
        ))}
        <rect x={60} y={100} width={300} height={34} rx={4} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={82 + i * 58} y={108} width={26} height={18} rx={3} fill={C.purple} />
        ))}
        <text x={372} y={75} fill={C.purple} fontSize={19}>
          자석 가루 막
        </text>
        <text x={372} y={116} fill={C.purple} fontSize={18}>
          magnetometer
        </text>
        <text x={372} y={138} fill={C.muted} fontSize={18}>
          5 개 · 회로 위
        </text>
      </g>
    </svg>
  )
}

function Vision({ t, at }: { t: number; at: number }) {
  return (
    <svg width={520} height={150}>
      <g opacity={prog(t, at)}>
        <path d="M222,6 L222,30 Q260,58 298,30 L298,6 Z" fill={C.muted} />
        <rect x={110} y={30} width={300} height={44} fill={`${C.green}22`} stroke={C.green} strokeWidth={1.5} />
        <path d="M110,30 L222,30 Q260,58 298,30 L410,30" fill="none" stroke={C.text} strokeWidth={3} />
        <circle cx={124} cy={100} r={7} fill={C.orange} />
        <circle cx={396} cy={100} r={7} fill={C.purple} />
        <line x1={130} y1={94} x2={200} y2={52} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={390} y1={94} x2={320} y2={52} stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 4" />
        <rect x={242} y={108} width={36} height={26} rx={4} fill={C.bg} stroke={C.text} strokeWidth={1.5} />
        <circle cx={260} cy={108} r={7} fill={C.card} stroke={C.text} strokeWidth={1.5} />
        <text x={420} y={38} fill={C.text} fontSize={19}>
          반사막
        </text>
        <text x={420} y={64} fill={C.green} fontSize={19}>
          투명 gel
        </text>
        <text x={420} y={106} fill={C.muted} fontSize={19}>
          LED
        </text>
        <text x={420} y={132} fill={C.text} fontSize={19}>
          카메라
        </text>
        <text x={12} y={28} fill={C.muted} fontSize={19}>
          물체
        </text>
      </g>
    </svg>
  )
}

function Families() {
  const t = useSec()
  const col = (x: number, at: number, title: string, color: string, pic: ReactNode, lines: [string, number][]) => (
    <Box x={x} y={140} w={580} h={400} at={at} title={<Head color={color}>{title}</Head>} gap={8}>
      <div style={{ marginLeft: -4 }}>{pic}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {lines.map(([s, a]) => (
          <span key={s} style={{ ...line(C.text, 21), opacity: prog(t, a) }}>
            {s}
          </span>
        ))}
      </div>
    </Box>
  )
  return (
    <AbsoluteFill>
      {col(64, 0.3, 'resistive array', C.blue, <Resistive t={t} at={0.8} />, [
        ['3D-ViTac 패드: 16 × 16 = 256 칸 · 한 칸 3 mm²', 1.6],
        ['1 mm 보다 얇음 · 1초에 약 32 번 · 약 20 달러 (Arduino 제외)', 2.8],
        ['칸마다 누르는 힘 하나뿐 → shear 는 직접 못 읽음', 4.2],
      ])}
      {col(668, 6, 'magnetic skin', C.purple, <Magnetic t={t} at={6.5} />, [
        ['ReSkin: 20 mm × 20 mm 막 · 5 개 × x·y·z = 숫자 15 개', 7.3],
        ['막 2 ~ 3 mm · 1초에 약 400 번 · 30 달러 미만', 8.6],
        ['닳은 막만 교체 · 자석·쇠붙이가 있으면 값이 흔들림', 10],
      ])}
      {col(1272, 12, 'vision-based', C.green, <Vision t={t} at={12.5} />, [
        ['DIGIT: 20 × 27 × 18 mm · 20 g · 19 × 16 mm 면', 13.3],
        ['640 × 480 을 1초에 60 장 · 1000 개 만들 때 부품 약 15 달러', 14.6],
        ['초점 거리 때문에 두껍다 · GelSight Mini 25 장, 549 달러', 16],
      ])}
      <Box x={64} y={565} w={1060} h={315} at={18} title={<Head color={C.accent}>1초에 들어오는 숫자 (사진은 pixel 마다 RGB 세 숫자)</Head>}>
        <Table
          at={18.2}
          head={['센서', '한 번에 내는 숫자', '1초에 읽는 횟수', '1초에 들어오는 숫자']}
          widths={[270, 320, 190, 220]}
          rows={[
            ['resistive · 3D-ViTac 손가락 하나', '256', '약 32', '약 8,200'],
            ['magnetic · ReSkin', '15', '약 400', '6,000'],
            ['vision-based · DIGIT', '640 × 480 × 3 = 921,600', '60', '약 5,500 만'],
          ]}
          colors={[C.blue, C.purple, C.green]}
        />
      </Box>
      <Box x={1148} y={565} w={708} h={315} at={24} gap={10} title={<Head color={C.red} size={24}>오해: 해상도 높은 vision-based 가 어디서든 가장 낫다</Head>}>
        <Label size={21} color={C.muted}>
          AnySkin 논문 · 같은 policy 구조 · 플러그 꽂기 (10 번 중 평균)
        </Label>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="카메라만" value={1.7} max={10} color={C.muted} at={24.4} width={260} labelW={110} unit=" 번" />
          <Bar label="DIGIT" value={2.3} max={10} color={C.red} at={24.9} width={260} labelW={110} unit=" 번" />
          <Bar label="AnySkin" value={6.7} max={10} color={C.green} at={25.6} width={260} labelW={110} unit=" 번" />
        </div>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 27) }}>vision-based 는 보통 1초에 30 ~ 60 장 · 카메라 때문에 두꺼워 손가락 모양을 바꾸기 어렵다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- gel and camera ----------

function Photometric() {
  const t = useSec()
  const A = [70, 65, 55, 45, 35, 30, 50]
  const B = [30, 35, 45, 55, 65, 70, 50]
  const slope = ['0.4', '0.3', '0.1', '−0.1', '−0.3', '−0.4', '0']
  const depth = [0.04, 0.07, 0.08, 0.07, 0.04, 0, 0]
  const cx = (i: number) => 230 + i * 100
  const base = 300
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={820} h={740}>
        <svg width={820} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            GelSight 의 gel 단면 · 빛 두 개로 줄인 예
          </text>
          <text x={790} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.6)}>
            <path d="M300,100 L300,160 Q410,250 520,160 L520,100 Q410,80 300,100 Z" fill={C.muted} />
            <text x={410} y={136} textAnchor="middle" fill={C.bg} fontSize={22} fontWeight={600}>
              물체
            </text>
            <rect x={120} y={160} width={580} height={150} fill={`${C.blue}1f`} stroke={C.blue} strokeWidth={1.5} />
            <path d="M120,160 L300,160 Q410,250 520,160 L700,160" fill="none" stroke={C.text} strokeWidth={5} />
            <text x={560} y={150} fill={C.text} fontSize={22}>
              불투명한 반사막
            </text>
            <text x={410} y={295} textAnchor="middle" fill={C.blue} fontSize={22}>
              투명한 gel
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            <circle cx={150} cy={470} r={14} fill={C.orange} />
            <text x={150} y={512} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              빛 A
            </text>
            <circle cx={670} cy={470} r={14} fill={C.purple} />
            <text x={670} y={512} textAnchor="middle" fill={C.purple} fontSize={24} fontWeight={600}>
              빛 B
            </text>
            <line x1={162} y1={458} x2={350} y2={212} stroke={C.orange} strokeWidth={2.5} strokeDasharray="8 6" />
            <line x1={658} y1={458} x2={470} y2={212} stroke={C.purple} strokeWidth={2.5} strokeDasharray="8 6" />
            <text x={236} y={330} fill={C.orange} fontSize={20}>
              45°
            </text>
            <text x={560} y={330} fill={C.purple} fontSize={20}>
              45°
            </text>
          </g>
          <g opacity={prog(t, 1)}>
            <rect x={380} y={520} width={60} height={40} rx={6} fill={C.bg} stroke={C.text} strokeWidth={2} />
            <circle cx={410} cy={520} r={11} fill={C.card} stroke={C.text} strokeWidth={2} />
            <line x1={400} y1={510} x2={330} y2={240} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 5" />
            <line x1={420} y1={510} x2={490} y2={240} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 5" />
            <text x={410} y={590} textAnchor="middle" fill={C.text} fontSize={22}>
              카메라
            </text>
          </g>
          <g opacity={prog(t, 13.3)}>
            <text x={30} y={624} fill={C.orange} fontSize={22}>
              왼쪽 비탈은 빛 A 쪽을 향해 A 가 밝다
            </text>
            <text x={30} y={654} fill={C.purple} fontSize={22}>
              오른쪽 비탈은 빛 B 쪽을 향해 B 가 밝다
            </text>
          </g>
          <g opacity={prog(t, 7.4)}>
            <rect x={30} y={672} width={760} height={64} rx={8} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={50} y={698} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              기울기 = (A − B) ÷ (A + B)
            </text>
            <text x={50} y={727} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.8)}>
              깊이 = 앞 깊이 + 기울기 × 0.1 mm
            </text>
          </g>
        </svg>
      </Panel>
      <Card x={916} y={140} w={940} h={480} at={1.4}>
        <svg width={940} height={480}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 1.6)}>
            패인 자리를 가로지르는 pixel 7 개의 밝기 · 간격 0.1 mm (예)
          </text>
          {[
            ['pixel', A.map((_, i) => String(i + 1)), C.muted, 1.8],
            ['빛 A', A.map(String), C.orange, 2.2],
            ['빛 B', B.map(String), C.purple, 2.5],
            ['기울기', slope, C.accent, 13.3],
            ['깊이 mm', depth.map((d) => d.toFixed(2)), C.green, 15.6],
          ].map(([lab, vals, color, at], r) => (
            <g key={lab as string} opacity={prog(t, at as number)}>
              <text x={30} y={96 + r * 42} fill={color as string} fontSize={22} fontWeight={600}>
                {lab as string}
              </text>
              {(vals as string[]).map((v, i) => (
                <text key={i} x={cx(i)} y={96 + r * 42} textAnchor="middle" fill={r === 0 ? C.muted : color as string} fontSize={24} fontFamily={MONO} fontWeight={r >= 3 ? 600 : 400}>
                  {v}
                </text>
              ))}
            </g>
          ))}
          <g opacity={prog(t, 16.4)}>
            <line x1={190} x2={870} y1={base} y2={base} stroke={C.muted} strokeWidth={1.5} />
            <text x={30} y={base + 8} fill={C.muted} fontSize={20}>
              깊이 0
            </text>
            <path d={`M${cx(0) - 50},${base} ${depth.map((d, i) => `L${cx(i)},${base + d * 1000}`).join(' ')} Z`} fill={`${C.green}33`} />
            {depth.map((d, i) => (
              <circle key={i} cx={cx(i)} cy={base + d * 1000} r={5} fill={C.green} />
            ))}
            <text x={cx(2)} y={base + 116} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              pixel 3 · 0.08 mm 로 가장 깊다
            </text>
          </g>
          <g opacity={prog(t, 18)}>
            <line x1={cx(0) - 50} x2={cx(4) + 50} y1={base + 134} y2={base + 134} stroke={C.text} strokeWidth={2} />
            <line x1={cx(0) - 50} x2={cx(0) - 50} y1={base + 126} y2={base + 142} stroke={C.text} strokeWidth={2} />
            <line x1={cx(4) + 50} x2={cx(4) + 50} y1={base + 126} y2={base + 142} stroke={C.text} strokeWidth={2} />
            <text x={cx(5) + 10} y={base + 141} fill={C.text} fontSize={21}>
              닿은 자리 pixel 1 ~ 5
            </text>
            <text x={cx(0) - 50} y={base + 166} fill={C.text} fontSize={21}>
              접촉 폭 5 × 0.1 = 0.5 mm
            </text>
          </g>
        </svg>
      </Card>
      <Box x={916} y={640} w={940} h={240} at={20.3} gap={10} title={<Head color={C.orange}>실제 센서 · 공으로 하는 calibration</Head>}>
        {[
          ['LED 가 gel 가까이 있어 빛이 나란하지 않다 → 같은 기울기도 사진의 위치마다 밝기가 다르다', 20.6],
          ['지름 3.96 mm 공을 여러 자리에 눌러 찍어 RGB → 기울기의 80 × 80 × 80 lookup table', 22.5],
          ['빈 사진과의 차이를 써서 LED 의 고르지 않음을 지움 · 조립이 달라 센서마다 calibration', 24.4],
          ['손끝용 GelSight: 18 × 14 mm 면 · USB webcam 1초에 30 장 · 공간 해상도 20 ~ 30 μm', 26],
        ].map(([s, at]) => (
          <span key={s as string} style={{ ...line(C.text, 21), opacity: prog(t, at as number) }}>
            {s as string}
          </span>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

function Markers() {
  const t = useSec()
  const pattern = (k: number, label: string, mode: 'push' | 'drag' | 'twist', at: number) => {
    const ox = 150 + k * 290
    const oy = 190
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4
      return { x: ox + 58 * Math.cos(a), y: oy + 58 * Math.sin(a), a }
    })
    const color = mode === 'push' ? C.orange : mode === 'drag' ? C.accent : C.pink
    return (
      <g key={label}>
        <g opacity={prog(t, 0.8 + k * 0.2)}>
          <circle cx={ox} cy={oy} r={92} fill="none" stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 6" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={5} fill={C.text} />
          ))}
          <circle cx={ox} cy={oy} r={5} fill={C.text} />
        </g>
        <g opacity={prog(t, at)}>
          {pts.map((p, i) => {
            const d = 26
            const [dx, dy] = mode === 'push' ? [d * Math.cos(p.a), d * Math.sin(p.a)] : mode === 'drag' ? [d, 0] : [-d * Math.sin(p.a), d * Math.cos(p.a)]
            return <g key={i}>{arrow(p.x, p.y, p.x + dx, p.y + dy, color, 3, 9)}</g>
          })}
          {mode === 'drag' && arrow(ox, oy, ox + 26, oy, color, 3, 9)}
          <text x={ox} y={318} textAnchor="middle" fill={color} fontSize={23} fontWeight={600}>
            {label}
          </text>
        </g>
      </g>
    )
  }
  const slipRow = (y: number, vals: number[], at: number) =>
    vals.map((v, i) => {
      const x = 340 + i * 110
      return (
        <g key={i} opacity={prog(t, at + i * 0.15)}>
          <circle cx={x} cy={y} r={6} fill={C.text} />
          {arrow(x, y, x + v * 400, y, i === 0 || i === 4 ? C.pink : C.accent, 4, 10)}
          <text x={x} y={y + 36} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
            {v.toFixed(2)}
          </text>
        </g>
      )
    })
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={400}>
        <svg width={900} height={400}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            고무와 반사막 사이의 검은 점 marker · 이동 모양
          </text>
          <text x={870} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 파란 점선은 접촉 영역
          </text>
          {pattern(0, '수직으로 누름 → 바깥으로', 'push', 6.8)}
          {pattern(1, '옆으로 끎 → 모두 끈 방향', 'drag', 7.8)}
          {pattern(2, '비틂 → 중심을 돌아', 'twist', 8.8)}
          <text x={30} y={372} fill={C.muted} fontSize={21} opacity={prog(t, 1.6)}>
            손끝용 GelSight: 25 × 25 mm gel 에 평균 1.1 mm 간격 · GelSight Mini: 7 × 9 = 63 개
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={400} at={12.6} gap={10} title={<Head color={C.orange}>shear 추정 · 예 (지름 25 mm 공, 1 N 마다 0.08 mm)</Head>}>
        <Table at={12.9} step={0.3} head={['marker', '1', '2', '3', '4', '5', '평균']} widths={[130, 100, 100, 100, 100, 100, 130]} rows={[['이동 mm', '0.20', '0.22', '0.18', '0.21', '0.19', '0.20']]} />
        <span style={{ ...mono(C.orange, 30), opacity: prog(t, 14.8) }}>shear = 0.20 ÷ 0.08 = 2.5 N</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 16.6) }}>
          수직 힘은 깊이에 비례: 0.1 mm 마다 1 N → 0.6 mm 눌리면 <span style={mono(C.text, 23)}>N = 6 N</span> · <span style={mono(C.green, 23)}>T ÷ N = 2.5 ÷ 6 = 0.42</span> 를 μ 와 비교
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18) }}>접촉 모양이 바뀌면 상수가 달라져서 논문은 사진에서 힘을 바로 내는 CNN 을 학습 (R² &gt; 0.9) · Mini 의 63 × 2 = 126 개 이동 → PCA 로 15 개 (RDP)</span>
      </Box>
      <Card x={64} y={565} w={1792} h={315} at={19.1}>
        <svg width={1792} height={315}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 19.3)}>
            미끄러짐은 가장자리에서 시작한다 · 접촉면을 가로지르는 marker 5 개의 이동 (mm, 예)
          </text>
          <g opacity={prog(t, 19.5)}>
            {['가장자리', '중간', '가운데', '중간', '가장자리'].map((s, i) => (
              <text key={i} x={340 + i * 110} y={86} textAnchor="middle" fill={C.dim} fontSize={19}>
                {s}
              </text>
            ))}
          </g>
          <text x={30} y={126} fill={C.green} fontSize={23} fontWeight={600} opacity={prog(t, 19.6)}>
            모두 붙어 있음
          </text>
          {slipRow(118, [0.2, 0.2, 0.2, 0.2, 0.2], 19.8)}
          <text x={960} y={126} fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 21.5)}>
            가장자리 ÷ 가운데 = 0.20 ÷ 0.20 = 1 → 그대로 쥔다
          </text>
          <text x={30} y={236} fill={C.red} fontSize={23} fontWeight={600} opacity={prog(t, 25.6)}>
            가장자리가 미끄러짐
          </text>
          {slipRow(228, [0.08, 0.18, 0.22, 0.18, 0.08], 25.8)}
          <text x={960} y={236} fill={C.red} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 27.6)}>
            0.08 ÷ 0.22 = 0.36 &lt; 문턱 0.5 → grip force ↑
          </text>
          <g opacity={prog(t, 29)}>
            <text x={960} y={272} fill={C.muted} fontSize={20}>
              사람은 partial slip 을 느끼고 grip force 를 고치는 데 약 80 ms (Sparsh 논문 인용)
            </text>
            <text x={960} y={300} fill={C.muted} fontSize={20}>
              80 ms 동안 GelSight Mini 는 0.08 × 25 = 2 장 · ReSkin 은 0.08 × 400 = 32 번 읽는다
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- simulation and learned policies ----------

function Sim() {
  const t = useSec()
  const rows: [string, number, string, string, number][] = [
    ['무작위로 찍기', 11.75, '46.56°', C.dim, 12.7],
    ['simulation → simulation', 0.41, '3.48°', C.blue, 13],
    ['simulation → 실물 (augmentation 없음)', 4.56, '17.64°', C.red, 14.6],
    ['simulation + 색 흔들기 → 실물', 1.66, '11.60°', C.orange, 20.4],
    ['실물 64 장 → 실물', 2.01, '10.96°', C.muted, 22],
    ['실물 128 장 → 실물', 0.76, '4.96°', C.muted, 23],
    ['simulation + 실물 128 장 → 실물', 0.52, '4.14°', C.green, 24.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={220}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 16 }}>
          <Flow steps={['physics engine · rigid body', 'pose · 수직 힘', 'TACTO: 힘 → gel 깊이', 'gel + 물체 mesh → OpenGL', '깊이 · RGB 사진 + noise σ 7']} color={C.blue} at={0.6} gap={0.45} />
          <div style={{ display: 'flex', gap: 28, alignItems: 'baseline', opacity: prog(t, 6.8) }}>
            <span style={line(C.text, 23)}>DIGIT 기본 설정 (소스 코드): 0 ~ 100 N 을 0 ~ 5 mm 에 직선으로, 100 N 넘으면 5 mm 에서 멈춤</span>
            <span style={{ ...mono(C.orange, 26), opacity: prog(t, 8.2) }}>10 N → 10 ÷ 100 × 5 = 0.5 mm</span>
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 3.6) }}>GPU 에서 DIGIT 하나를 160 × 120 으로 1초에 약 200 장 · grasp 100 만 번을 하루에 · 카메라 사진만 쓴 grasp 모델은 촉각 모델을 따라잡는 데 데이터가 1,000 ~ 10,000 배 더 필요</span>
        </div>
      </Panel>
      <Card x={64} y={385} w={1100} h={495} at={10.8}>
        <svg width={1100} height={495}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 11)}>
            펜이 닿은 자리와 각도 추정 · 시험 오차 (simulation 10,000 장 · 실물 label 200 장)
          </text>
          <g opacity={prog(t, 11.2)}>
            <text x={410} y={82} fill={C.muted} fontSize={19}>
              접촉 중심 위치 오차
            </text>
            <text x={1062} y={82} textAnchor="end" fill={C.muted} fontSize={19}>
              각도 오차
            </text>
          </g>
          {rows.map(([name, v, ang, color, at], i) => {
            const y = 106 + i * 50
            return (
              <g key={name} opacity={prog(t, at)}>
                <text x={392} y={y + 22} textAnchor="end" fill={color === C.dim ? C.muted : C.text} fontSize={21}>
                  {name}
                </text>
                <rect x={410} y={y} width={380} height={30} rx={7} fill={C.grid} />
                <rect x={410} y={y} width={(380 * Math.min(v, 12) * prog(t, at, 0.8)) / 12} height={30} rx={7} fill={color} />
                <text x={802} y={y + 23} fill={color} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.5)}>
                  {v.toFixed(2)} mm
                </text>
                <text x={1062} y={y + 23} textAnchor="end" fill={C.muted} fontSize={21} fontFamily={MONO} opacity={prog(t, at + 0.5)}>
                  {ang}
                </text>
              </g>
            )
          })}
          <text x={30} y={482} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16)}>
            simulation → 실물: 4.56 ÷ 0.41 ≈ 11 배
          </text>
        </svg>
      </Card>
      <Box x={1196} y={385} w={660} h={495} at={16.2} gap={12} title={<Head color={C.accent}>틈을 줄이는 것</Head>}>
        {[
          ['color jittering: RGB 채널마다 밝기와 대비를 무작위로 → 1.66 mm, 실물 64 장 (2.01 mm) 과 비슷 · 조명 차이에 강해진다', C.orange, 20.6],
          ['simulation 에 실물 128 장을 섞으면 0.52 mm · 실물 128 장만 쓴 0.76 mm 보다 늘 좋았다', C.green, 24.8],
          ['TACTO 의 한계: 접촉 경계에서 gel 이 늘어나는 모양을 못 흉내 냄 · 실물의 빈 사진 한 장을 더해 빛이 멀수록 어두워지는 것을 맞춤', C.muted, 26],
          ['Taxim: 실물 예시 사진으로 빛 반응을 맞춤 → 실물과의 pixel MSE 58.4 (TACTO 215.9)', C.muted, 27],
        ].map(([s, c, at]) => (
          <span key={s as string} style={{ ...line(c as string, 21), opacity: prog(t, at as number) }}>
            {s as string}
          </span>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

function Policy() {
  const t = useSec()
  const node = (x: number, y: number, w: number, label: string, color: string, at: number, h = 50) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fill={color} fontSize={21} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  const link = (x1: number, y1: number, x2: number, y2: number, color: string, at: number) => <g opacity={prog(t, at)}>{arrow(x1, y1, x2, y2, color, 2.5, 9)}</g>
  const vitac: [string, number, string, number][] = [
    ['카메라 RGB 만', 0.45, C.muted, 13.4],
    ['카메라 point cloud 만', 0.65, C.blue, 13.9],
    ['point cloud + 촉각 점', 0.9, C.green, 14.6],
    ['촉각 점만', 0.15, C.red, 16.2],
    ['카메라 한 대 point cloud', 0.3, C.blue, 17.2],
    ['한 대 + 촉각 점', 0.7, C.green, 17.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            학습한 policy 에 촉각을 넣는 세 방법
          </text>
          {/* 1: parallel inputs */}
          <text x={30} y={92} fill={C.accent} fontSize={23} fontWeight={600} opacity={prog(t, 0.6)}>
            ① 나란한 입력 · AnySkin 플러그 꽂기
          </text>
          {node(30, 110, 180, '카메라 사진', C.muted, 0.8)}
          {node(30, 170, 180, 'DIGIT 사진', C.muted, 0.9)}
          {node(30, 230, 180, 'AnySkin 숫자', C.muted, 1)}
          {link(210, 135, 290, 135, C.muted, 1.2)}
          {link(210, 195, 290, 195, C.muted, 1.3)}
          {link(210, 255, 290, 255, C.muted, 1.4)}
          {node(290, 110, 170, 'ResNet-18', C.accent, 1.5)}
          {node(290, 170, 170, 'ResNet-18', C.accent, 1.6)}
          {node(290, 230, 170, 'MLP', C.accent, 1.7)}
          {link(460, 135, 560, 185, C.accent, 2)}
          {link(460, 195, 560, 195, C.accent, 2)}
          {link(460, 255, 560, 205, C.accent, 2)}
          {node(560, 170, 190, 'transformer', C.accent, 2.4)}
          {link(750, 195, 800, 195, C.accent, 2.8)}
          {node(800, 170, 170, 'action 10 step', C.green, 3)}
          <text x={560} y={252} fill={C.muted} fontSize={20} opacity={prog(t, 3.4)}>
            시연 96 개로 학습 · 10 step 을 한 덩어리로
          </text>
          {/* 2: same 3D space */}
          <text x={30} y={322} fill={C.purple} fontSize={23} fontWeight={600} opacity={prog(t, 6.8)}>
            ② 같은 3차원 공간 · 3D-ViTac
          </text>
          {node(30, 340, 200, '패드 256 칸의 힘', C.muted, 7)}
          {link(230, 365, 300, 365, C.muted, 7.3)}
          {node(300, 340, 240, 'forward kinematics', C.purple, 7.5)}
          {link(540, 365, 600, 365, C.purple, 7.9)}
          {node(600, 340, 190, '촉각 점 256 개', C.purple, 8.1)}
          {node(600, 410, 190, '카메라 점 512 개', C.blue, 8.4)}
          {link(790, 365, 830, 395, C.purple, 8.8)}
          {link(790, 435, 830, 405, C.blue, 8.8)}
          {node(830, 370, 140, 'point cloud', C.green, 9.2, 60)}
          <text x={30} y={420} fill={C.muted} fontSize={20} opacity={prog(t, 9.8)}>
            칸마다 3차원 점을 만들고 누르는 힘을 그 점의 값으로 붙인다
          </text>
          <text x={30} y={448} fill={C.muted} fontSize={20} opacity={prog(t, 10.6)}>
            출처를 표시한 점들을 diffusion policy 에 넣는다
          </text>
          {/* 3: pretraining */}
          <text x={30} y={522} fill={C.orange} fontSize={23} fontWeight={600} opacity={prog(t, 19.8)}>
            ③ label 없는 pretraining · Sparsh
          </text>
          {node(30, 540, 330, '촉각 사진 46 만여 장 · label ✕', C.muted, 20)}
          {link(360, 565, 420, 565, C.muted, 20.4)}
          {node(420, 540, 300, 'self-supervised encoder', C.orange, 20.6)}
          {link(720, 565, 780, 565, C.orange, 21)}
          {node(780, 540, 190, '작은 decoder', C.green, 21.2)}
          <text x={30} y={624} fill={C.muted} fontSize={20} opacity={prog(t, 21.8)}>
            DIGIT · GelSight 2017 · GelSight Mini 사진 · 일부를 가리고 맞히는 식으로 데이터 자체에서 정답을 만든다
          </text>
          <text x={30} y={654} fill={C.muted} fontSize={20} opacity={prog(t, 22.8)}>
            힘·미끄러짐 label 은 F/T sensor 로 모아야 해서 적다 → 과제에서는 encoder 를 고정하고 decoder 만 학습
          </text>
          <text x={30} y={706} fill={C.dim} fontSize={20} opacity={prog(t, 24)}>
            구슬을 철사 미로로 옮기는 과제에서는 Sparsh 를 넣은 diffusion policy 도 실물에서 미로 끝까지 가지 못했다
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={375} at={13.2} gap={10} title={<Head color={C.purple} size={25}>3D-ViTac · 육각 렌치 꽂기 성공률 (시연 30 개 · 20 번)</Head>}>
        <div style={{ display: 'grid', gap: 7 }}>
          {vitac.map(([n, v, c, at]) => (
            <Bar key={n} label={n} value={v} max={1} color={c} at={at} width={240} labelW={250} fmt={v.toFixed(2)} />
          ))}
        </div>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 18.6) }}>촉각만으로는 거의 실패 · 가려진 한 대 카메라에서 효과가 가장 크다</span>
      </Box>
      <Box x={1096} y={540} w={760} h={340} at={25.6} gap={10} title={<Head color={C.orange} size={25}>Sparsh · DIGIT 힘 추정 오차 RMSE (mN, 1 mN = 0.001 N)</Head>}>
        <Table at={25.8} step={0.4} size={23} head={['학습에 쓴 label', '처음부터 (E2E)', 'Sparsh (DINO)']} widths={[220, 230, 230]} rows={[['전부', '39.34', '36.09'], ['1/10', '98.22', '51.89'], ['1/100', '187.51', '97.95']]} colors={[C.text, C.text, C.orange]} />
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 28) }}>
          187.51 ÷ 39.34 ≈ <span style={{ color: C.red }}>4.8 배</span> · 97.95 ÷ 36.09 ≈ <span style={{ color: C.green }}>2.7 배</span>
        </span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 29.4) }}>미끄러짐 F1 도 label 1/3 이면 E2E 0.238, Sparsh 0.828 (전부 쓰면 0.767 / 0.820)</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the tactile clock and slow-fast policy ----------

function SlowFast() {
  const t = useSec()
  const x0 = 320
  const sx = (s: number) => x0 + s * 1380
  const chunkEnd = sx(0.67)
  const reactX = sx(0.79)
  const rows: [string, string, string, string, string][] = [
    ['Diffusion Policy (카메라)', '0.56', '0.19', '0.44', C.text],
    ['Diffusion Policy + 촉각 사진', '0.60', '0.16', '0.41', C.text],
    ['Diffusion Policy + 촉각 PCA 값', '0.48', '0.15', '0.39', C.text],
    ['RDP (GelSight Mini)', '0.98', '0.80', '0.90', C.green],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={380}>
        <svg width={1792} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            action chunk 와 촉각의 주기 (RDP 논문)
          </text>
          {/* axis */}
          <g opacity={prog(t, 0.5)}>
            <line x1={sx(0)} x2={sx(1)} y1={340} y2={340} stroke={C.muted} strokeWidth={2} />
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((s) => (
              <g key={s}>
                <line x1={sx(s)} x2={sx(s)} y1={334} y2={346} stroke={C.muted} strokeWidth={2} />
                <text x={sx(s)} y={372} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {s.toFixed(1)} s
                </text>
              </g>
            ))}
          </g>
          {/* diffusion policy row */}
          <g opacity={prog(t, 0.6)}>
            <text x={30} y={118} fill={C.text} fontSize={24} fontWeight={600}>
              Diffusion Policy
            </text>
            <text x={30} y={146} fill={C.muted} fontSize={20}>
              chunk 0.67 초 · 추론 120 ms
            </text>
            <text x={30} y={172} fill={C.muted} fontSize={20}>
              1초에 action 12 개
            </text>
            <rect x={sx(0)} y={90} width={(chunkEnd - sx(0)) * prog(t, 0.8, 1)} height={40} rx={8} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} />
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={sx(i / 12)} x2={sx(i / 12)} y1={96} y2={124} stroke={C.blue} strokeWidth={2} opacity={prog(t, 0.9 + i * 0.05)} />
            ))}
            <text x={sx(0.3)} y={116} textAnchor="middle" fill={C.blue} fontSize={21} fontWeight={600}>
              chunk 실행 중 · 새 관측 ✕
            </text>
          </g>
          <g opacity={prog(t, 4.2)}>
            <rect x={chunkEnd} y={90} width={reactX - chunkEnd} height={40} rx={8} fill={`${C.muted}33`} stroke={C.muted} strokeWidth={2} />
            <text x={(chunkEnd + reactX) / 2} y={116} textAnchor="middle" fill={C.muted} fontSize={19}>
              추론 120 ms
            </text>
          </g>
          <g opacity={prog(t, 6.7)}>
            <line x1={sx(0)} x2={sx(0)} y1={60} y2={320} stroke={C.red} strokeWidth={2} strokeDasharray="6 6" />
            <text x={sx(0) + 10} y={72} fill={C.red} fontSize={21} fontWeight={600}>
              미끄러짐 시작 (chunk 직후)
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <circle cx={reactX} cy={110} r={9} fill={C.red} />
            <text x={reactX + 18} y={117} fill={C.red} fontSize={22} fontWeight={700}>
              0.67 + 0.12 = 0.79 초 뒤에야 반응
            </text>
          </g>
          <g opacity={prog(t, 8.8)}>
            {Array.from({ length: 17 }, (_, i) => (
              <line key={i} x1={sx(i * 0.04)} x2={sx(i * 0.04)} y1={140} y2={154} stroke={C.orange} strokeWidth={2.5} />
            ))}
            <text x={sx(0)} y={180} fill={C.orange} fontSize={20}>
              GelSight Mini 사진 (1초에 25 장): 0.67 × 25 ≈ 17 장이 오지만 policy 는 하나도 보지 않는다
            </text>
          </g>
          {/* RDP row */}
          <g opacity={prog(t, 13.2)}>
            <text x={30} y={236} fill={C.green} fontSize={24} fontWeight={600}>
              RDP · slow-fast
            </text>
            <text x={30} y={264} fill={C.muted} fontSize={20}>
              느린 층 1초에 1 ~ 2 번
            </text>
            <text x={30} y={292} fill={C.muted} fontSize={20}>
              빠른 층 1초에 24 번
            </text>
            <rect x={sx(0)} y={204} width={sx(0.5) - sx(0)} height={34} rx={8} fill={`${C.green}22`} stroke={C.green} strokeWidth={2} />
            <rect x={sx(0.5)} y={204} width={sx(1) - sx(0.5)} height={34} rx={8} fill={`${C.green}12`} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
            <text x={sx(0.25)} y={228} textAnchor="middle" fill={C.green} fontSize={20} fontWeight={600}>
              latent chunk (카메라 + 촉각)
            </text>
          </g>
          <g opacity={prog(t, 14.4)}>
            {Array.from({ length: 25 }, (_, i) => (
              <line key={i} x1={sx(i / 24)} x2={sx(i / 24)} y1={276} y2={300} stroke={C.accent} strokeWidth={2.5} opacity={prog(t, 14.4 + i * 0.03)} />
            ))}
            <text x={sx(0.5)} y={326} textAnchor="middle" fill={C.accent} fontSize={20}>
              빠른 층 (asymmetric tokenizer): 1초에 24 번 촉각 PCA 값을 받아 latent chunk 를 action 으로 풀면서 고친다 · 계산 1 ms 미만
            </text>
          </g>
          <g opacity={prog(t, 16.4)}>
            <circle cx={sx(1 / 24)} cy={288} r={9} fill={C.green} />
            <text x={sx(1 / 24) + 18} y={264} fill={C.green} fontSize={21} fontWeight={700}>
              다음 촉각 값에서 바로 고친다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={535} w={1060} h={345} at={20.2} gap={8} title={<Head color={C.accent}>오이 껍질 깎기 점수 (1 이 만점)</Head>}>
        <Table at={20.4} step={0.5} size={22} head={['policy', '방해 없음', '접촉 뒤 방해', '전체']} widths={[420, 180, 190, 150]} rows={rows.map(([n, a, b, c]) => [n, a, b, c])} colors={rows.map((r) => r[4])} />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 23.5) }}>접촉 뒤 방해: 필러가 닿은 뒤 사람이 오이를 옮겨 접촉을 깨뜨린 경우</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 24.2) }}>촉각을 관측에 더하기만 한 policy 는 chunk 중에 새 촉각을 못 봐서 나아지지 않았다</span>
      </Box>
      <Box x={1156} y={535} w={700} h={345} at={25.6} gap={10} title={<Head color={C.red}>chunk 를 짧게 하면?</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.8) }}>
          닦기 과제: chunk 를 action 8 개 → 2 개로 줄이자 지우개 쥐기 성공률 <span style={mono(C.red, 24)}>100% → 20%</span>
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 27.2) }}>짧은 chunk 는 시연에 섞인 잠깐 멈춤에 민감해 쥐기 전에 멈춰 버린다 (저자들의 해석)</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 28.2) }}>빠른 층의 24 FPS 는 GelSight Mini 의 25 장에 맞춘 값 · impedance controller 비유 (policy 10 Hz ↔ controller 1 kHz)</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 29) }}>센서 자체의 지연: vision-based 10 ~ 60 ms, 힘 센서 1 ms 이하 · 25 FPS 면 사진 간격 40 ms</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- wear, drift and sensor-to-sensor differences ----------

function Wear() {
  const t = useSec()
  const skins: [string, number, number, string, number][] = [
    ['AnySkin', 6.7, 5.3, C.green, 21],
    ['ReSkin', 6.0, 1.7, C.purple, 22.4],
    ['DIGIT', 2.3, 1.3, C.red, 23.4],
  ]
  const bx = 190
  const bw = 560
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={580} h={335} at={0.5} gap={10} title={<Head color={C.red}>gel 마모 · DIGIT 논문</Head>}>
        <Label size={20} color={C.muted}>
          1.7 N 연마 팁으로 문지른 뒤 새는 빛의 증가 (%)
        </Label>
        <Table at={0.9} step={0.5} size={23} head={['문지른 횟수', '5', '10', '15']} widths={[200, 100, 100, 110]} rows={[['DIGIT 의 gel', '0', '0.3', '0.3'], ['이전 GelSight gel', '276', '482', '805']]} colors={[C.green, C.red]} />
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 3.5) }}>막이 두꺼우면 해상도 ↓ · 얇으면 쉽게 상함</span>
        <span style={{ ...line(C.text, 20), opacity: prog(t, 5) }}>대응: 내마모 gel · 막만 교체 (ReSkin · AnySkin)</span>
      </Box>
      <Box x={668} y={140} w={580} h={335} at={7.2} gap={10} title={<Head color={C.orange}>drift · ReSkin 을 50,000 번 누름</Head>}>
        <svg width={520} height={126}>
          <g opacity={prog(t, 7.6)}>
            <line x1={40} x2={500} y1={100} y2={100} stroke={C.muted} strokeWidth={2} />
            <text x={40} y={118} fill={C.muted} fontSize={18}>
              0
            </text>
            <text x={500} y={118} textAnchor="end" fill={C.muted} fontSize={18}>
              50,000 번
            </text>
            <rect x={40} y={20} width={46} height={80} fill={`${C.green}33`} />
            <text x={92} y={36} fill={C.green} fontSize={18}>
              학습: 처음 5,000 번
            </text>
            <path d="M40,88 Q250,80 500,30" fill="none" stroke={C.orange} strokeWidth={4} strokeDasharray={`${600 * prog(t, 8, 1.4)} 600`} />
            <text x={360} y={72} fill={C.orange} fontSize={19} fontWeight={600}>
              추정 오차 ↑
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 20), opacity: prog(t, 9.6) }}>누를수록 오차 ↑ · 힘을 실제보다 크게 추정</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 10.4) }}>고무가 물러진 탓 (저자들의 해석)</span>
        <span style={{ ...line(C.text, 20), opacity: prog(t, 11.2) }}>대응: 영점을 자주 다시 재기 · 접촉 전 사진 빼기</span>
      </Box>
      <Box x={1272} y={140} w={584} h={335} at={13.7} gap={10} title={<Head color={C.purple}>센서마다 다른 신호 · ReSkin</Head>}>
        <Label size={20} color={C.muted}>
          다른 센서에서 닿은 위치를 ±1 mm 안으로 맞힌 비율
        </Label>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="한 센서로 학습" value={25.24} max={100} color={C.red} at={14} width={200} unit="%" labelW={170} />
          <Bar label="여러 센서로 학습" value={84.43} max={100} color={C.purple} at={15.6} width={200} unit="%" labelW={170} />
          <Bar label="+ 390 번 적응" value={87.0} max={100} color={C.green} at={26.3} width={200} unit="%" labelW={170} fmt="87.00" />
        </div>
        <span style={{ ...line(C.text, 20), opacity: prog(t, 17.2) }}>대응: 여러 센서로 학습 · label 없는 적응 · AnySkin 은 막 제작을 바꿔 차이를 줄임</span>
      </Box>
      <Card x={64} y={495} w={960} h={385} at={20.5}>
        <svg width={960} height={385}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 20.7)}>
            플러그 꽂기 · 10 번 중 평균 성공 (AnySkin 논문)
          </text>
          <g opacity={prog(t, 20.9)}>
            <rect x={bx} y={64} width={18} height={14} fill={C.accent} />
            <text x={bx + 26} y={77} fill={C.muted} fontSize={19}>
              학습에 쓴 skin
            </text>
            <rect x={bx + 190} y={64} width={18} height={14} fill={C.dim} />
            <text x={bx + 216} y={77} fill={C.muted} fontSize={19}>
              새 skin 으로 교체
            </text>
            <line x1={bx + (bw * 1.7) / 10} x2={bx + (bw * 1.7) / 10} y1={92} y2={330} stroke={C.red} strokeWidth={2} strokeDasharray="6 6" />
            <text x={bx + (bw * 1.7) / 10 + 8} y={346} fill={C.red} fontSize={19}>
              카메라만 1.7
            </text>
          </g>
          {skins.map(([n, used, fresh, color, at], i) => {
            const y = 100 + i * 78
            return (
              <g key={n} opacity={prog(t, at)}>
                <text x={bx - 16} y={y + 34} textAnchor="end" fill={color} fontSize={23} fontWeight={600}>
                  {n}
                </text>
                <rect x={bx} y={y} width={(bw * used * prog(t, at, 0.8)) / 10} height={26} rx={6} fill={color} />
                <text x={bx + (bw * used) / 10 + 12} y={y + 21} fill={color} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.5)}>
                  {used.toFixed(1)}
                </text>
                <rect x={bx} y={y + 32} width={(bw * fresh * prog(t, at + 0.4, 0.8)) / 10} height={26} rx={6} fill={C.dim} />
                <text x={bx + (bw * fresh) / 10 + 12} y={y + 53} fill={C.muted} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.9)}>
                  {fresh.toFixed(1)}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>
      <div style={{ position: 'absolute', left: 1056, top: 495, width: 800 }}>
        <Misconception at={24.4} belief="같은 제품의 촉각 센서로 바꿔 끼우면 학습한 모델을 그대로 쓸 수 있다" fact="다른 ReSkin 에서는 25.24% 만 맞혔고, 플러그 꽂기는 6.0 번에서 1.7 번이 됐다" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: '카메라가 못 보는 접촉', color: C.accent, text: '가려진 접촉면 · 힘 · partial slip 은 사진에 없다 · pixel 하나 1.2 mm 대 0.03 mm', at: 1 },
    { tag: 'gel 과 marker', color: C.blue, text: '(A − B) ÷ (A + B) 를 더해 깊이 · marker 0.20 ÷ 0.08 = 2.5 N · 가장자리 ÷ 가운데 0.36 < 0.5', at: 4.4 },
    { tag: 'simulation 과 학습', color: C.orange, text: 'simulation 0.41 → 실물 4.56 mm · 촉각 점으로 육각 렌치 0.65 → 0.90 · Sparsh 97.95 mN', at: 8.4 },
    { tag: '주기 · 마모 · 센서 차이', color: C.red, text: 'RDP 빠른 층 1초에 24 번 · gel 마모 805% 대 0.3% · ReSkin 25.24% → 87.00%', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            손가락이 닿은 바로 그 자리에서 무엇을 재야 하고, 그 값은 어떻게 얻을까?
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
            NEXT · GRASPING
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Real Robot</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            촉각 policy 를 실물 팔에서 비동기로 추론하고 chunk 를 이어 붙이기 · 성공률을 믿을 만하게 재기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/tactile-sensing (GelSight · DIGIT · ReSkin · AnySkin · TACTO · Sparsh · 3D-ViTac · RDP 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseCone = () => (
  <PauseWrite
    question="손가락 하나가 접촉면에 수직으로 10 N, 접촉면을 따라 3 N 의 힘을 받는다. μ = 0.5 면 friction cone 안인가? 접선 힘이 몇 N 을 넘으면 미끄러지는가?"
    answer={
      <>
        T ÷ N = 3 ÷ 10 = 0.3 ≤ μ = 0.5 → friction cone 안
        <br />
        미끄러지지 않는 조건 T ≤ μN 이므로 T 가 0.5 × 10 = 5 N 을 넘으면 미끄러진다
      </>
    }
  />
)

const PauseMarker = () => (
  <PauseWrite
    question="같은 공 calibration (shear 1 N 당 0.08 mm, 깊이 0.1 mm 당 1 N) 에서 marker 평균 이동이 0.12 mm 이고 깊이가 0.5 mm 면 T ÷ N 은?"
    answer={
      <>
        T = 0.12 ÷ 0.08 = 1.5 N · N = 0.5 ÷ 0.1 × 1 = 5 N → T ÷ N = 1.5 ÷ 5 = 0.3
        <br />
        이 상수는 같은 공에서만 맞는다 · 다른 모양은 다시 calibration
      </>
    }
  />
)

const PausePoints = () => (
  <PauseWrite
    question="3D-ViTac 의 양팔 과제: 손가락 4 개에 16 × 16 패드를 붙이고 카메라 점을 512 개 뽑는다. policy 가 한 번에 받는 점은 모두 몇 개인가?"
    answer="촉각 점 256 × 4 = 1,024 개 · 카메라 점 512 개 → 1,024 + 512 = 1,536 개"
  />
)

const PauseSwap = () => (
  <PauseWrite
    question="카메라만 쓴 policy (1.7 번) 보다 더 성공한 몫을 촉각의 기여라고 하자. skin 을 바꾼 뒤 AnySkin 과 ReSkin 은 그 기여의 몇 % 를 지켰는가?"
    answer={
      <>
        AnySkin: 6.7 − 1.7 = 5.0 번 → 5.3 − 1.7 = 3.6 번 → 3.6 ÷ 5.0 = 72%
        <br />
        ReSkin: 6.0 − 1.7 = 4.3 번 → 1.7 − 1.7 = 0 번 → 0%
      </>
    }
  />
)

export function TactileSensing() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        occlusion: Occlusion,
        families: Families,
        'pause-cone': PauseCone,
        photometric: Photometric,
        markers: Markers,
        'pause-marker': PauseMarker,
        sim: Sim,
        policy: Policy,
        'pause-points': PausePoints,
        'slow-fast': SlowFast,
        wear: Wear,
        'pause-swap': PauseSwap,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
