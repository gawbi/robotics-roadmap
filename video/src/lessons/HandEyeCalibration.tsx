import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './hand-eye-calibration.narration.json'
import { script } from './hand-eye-calibration.script'

// Numbers follow lessons/hand-eye-calibration/README.md and its figures (see hand-eye-calibration.script.ts). The arm, frame
// and ray drawings are schematic (marked 모식도); the scatter points are redrawn from figures/he-validate.svg.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a small rounded tag, e.g. separable / simultaneous */
function Tag({ children, color }: { children: ReactNode; color: string }) {
  return <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 20, fontWeight: 600, marginLeft: 14, verticalAlign: 'middle' }}>{children}</span>
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250, labelSize = 22 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number; labelSize?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: labelSize, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
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

const line = (color = C.text, size = 22): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a line of text that fades in at `at` */
function Row({ at, children, color = C.text, size = 22 }: { at: number; children: ReactNode; color?: string; size?: number }) {
  const t = useSec()
  return <span style={{ ...line(color, size), opacity: prog(t, at) }}>{children}</span>
}

/** HTML subscript, never below 20 px */
const Sb = ({ children }: { children: ReactNode }) => <sub style={{ fontSize: 20, lineHeight: 0 }}>{children}</sub>
/** a transform written T with its two frames below, e.g. T_base,grip */
const Tf = ({ s }: { s: string }) => (
  <>
    T<Sb>{s}</Sb>
  </>
)

/** an SVG label with a subscript (x_g, R_X) */
function SubText({ x, y, main, sub, color, size = 26, anchor = 'start', weight = 600 }: { x: number; y: number; main: string; sub: string; color: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} fontFamily={MONO}>
      {main}
      <tspan dy={7} fontSize={20}>
        {sub}
      </tspan>
    </text>
  )
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, opacity = 1, dash?: string) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** an SVG frame node: a rounded box with a main label and an optional second line */
function Node({ cx, cy, w, h, label, sub, color, op }: { cx: number; cy: number; w: number; h: number; label: string; sub?: string; color: string; op: number }) {
  return (
    <g opacity={op}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={12} fill={`${color}1c`} stroke={color} strokeWidth={2.5} />
      <text x={cx} y={sub ? cy - 4 : cy + 9} textAnchor="middle" fill={C.text} fontSize={sub ? 24 : 26} fontWeight={600}>
        {label}
      </text>
      {sub && (
        <text x={cx} y={cy + 22} textAnchor="middle" fill={color} fontSize={20}>
          {sub}
        </text>
      )}
    </g>
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GRASPING · HAND-EYE CALIBRATION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Hand-Eye Calibration</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            로봇을 움직여 계산하는 <span style={{ color: C.accent }}>gripper ↔ camera transform</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            고정한 marker 를 여러 자세에서 찍고, FK 로 구한 gripper pose 와 맞춰 X 를 계산한다
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
  const card = (x: number, at: number, color: string, title: string, what: string, value: string, ok: boolean) => (
    <Box x={x} y={140} w={576} h={260} at={at} color={`${color}88`} title={<Head color={color}>{title}</Head>}>
      <span style={line(C.text, 24)}>{what}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color, fontSize: 34, fontWeight: 700 }}>{ok ? '✓' : '✕'}</span>
        <span style={mono(color, 30)}>{value}</span>
      </div>
    </Box>
  )
  const nodes = ['base', 'gripper', 'camera', 'marker']
  const cx = (i: number) => 220 + i * 460
  return (
    <AbsoluteFill>
      {card(64, 0.5, C.green, '① 카메라 · marker pose', 'camera frame 에서 잰 marker 위치', '1 mm 안에서 맞음', true)}
      {card(672, 1.6, C.green, '② 관절 각도 · FK', '관절 각도로 계산한 gripper 위치', '1 mm 안에서 맞음', true)}
      {card(1280, 4.5, C.red, '③ 두 값을 이으면', 'gripper 를 marker 자리로 보내면', '1 cm 가까이 옆', false)}
      <Appear at={5.2} style={{ position: 'absolute', left: 64, top: 428, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          카메라도 맞고 관절 계산도 맞는데, <span style={{ color: C.accent }}>1 cm 는 어디서 생길까?</span>
        </div>
      </Appear>
      <Appear at={5.9} style={{ position: 'absolute', left: 64, top: 540, width: 1792, height: 340 }}>
        <Panel x={0} y={0} w={1792} h={340}>
          <div style={{ position: 'absolute', left: 30, top: 22 }}>
            <Head size={26}>두 계산을 잇는 값 · gripper 에서 본 camera 의 pose</Head>
          </div>
          <svg width={1792} height={340} style={{ position: 'absolute', left: 0, top: 0 }}>
            {nodes.map((n, i) => (
              <Node key={n} cx={cx(i)} cy={130} w={240} h={64} label={n} color={i === 2 ? C.accent : C.blue} op={prog(t, 6.1 + i * 0.2)} />
            ))}
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={prog(t, 6.4 + i * 0.2)}>
                {arrow(cx(i) + 130, 130, cx(i + 1) - 130, 130, i === 1 ? C.red : C.muted, 3)}
                <path d={`M${cx(i)},190 L${cx(i)},206 L${cx(i + 1)},206 L${cx(i + 1)},190`} fill="none" stroke={i === 1 ? C.red : C.green} strokeWidth={2} />
              </g>
            ))}
            <g opacity={prog(t, 6.8)}>
              <text x={(cx(0) + cx(1)) / 2} y={248} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600}>
                FK ✓ · 1 mm
              </text>
              <text x={(cx(1) + cx(2)) / 2} y={248} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={700}>
                X = ?
              </text>
              <text x={(cx(1) + cx(2)) / 2} y={284} textAnchor="middle" fill={C.muted} fontSize={21}>
                렌즈 중심은 몸체 안쪽이라 자로 잴 수 없다
              </text>
              <text x={(cx(2) + cx(3)) / 2} y={248} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600}>
                PnP ✓ · 1 mm
              </text>
            </g>
          </svg>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- S1: X can't be measured with a ruler ----------

function Chain() {
  const t = useSec()
  const node = (cy: number, label: string, sub: string | undefined, color: string, at: number) => <Node cx={180} cy={cy} w={240} h={70} label={label} sub={sub} color={color} op={prog(t, at)} />
  const lab = (top: number, at: number, head: ReactNode, note: string, color: string) => (
    <div style={{ position: 'absolute', left: 340, top, width: 490, display: 'grid', gap: 4, opacity: prog(t, at) }}>
      <span style={mono(color, 28)}>{head}</span>
      <span style={line(C.muted, 22)}>{note}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={860} h={750}>
        <svg width={860} height={750} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            eye-in-hand 의 transform 사슬
          </text>
          {node(125, 'base', undefined, C.blue, 0.5)}
          {node(285, 'gripper', undefined, C.blue, 0.8)}
          {node(445, 'camera', '손목에 단 카메라', C.accent, 1.1)}
          {node(605, 'target', '책상에 고정', C.green, 1.4)}
          <g opacity={prog(t, 0.9)}>{arrow(180, 160, 180, 250, C.muted)}</g>
          <g opacity={prog(t, 1.2)}>{arrow(180, 320, 180, 410, prog(t, 12.6) > 0.5 ? C.red : C.muted, prog(t, 12.6) > 0.5 ? 5 : 3)}</g>
          <g opacity={prog(t, 1.5)}>{arrow(180, 480, 180, 570, C.muted)}</g>
        </svg>
        {lab(166, 6.6, <Tf s="base,grip" />, 'FK 로 계산 (관절 각도)', C.blue)}
        {lab(326, 12.6, <>X = <Tf s="grip,cam" /></>, 'FK 로도 PnP 로도 구할 수 없는 값', C.red)}
        {lab(486, 9, <Tf s="cam,target" />, 'marker pose 계산 (PnP)', C.green)}
        <div style={{ position: 'absolute', left: 30, right: 30, top: 670, textAlign: 'center', opacity: prog(t, 2) }}>
          <span style={mono(C.text, 28)}>
            <Tf s="base,target" /> = <Tf s="base,grip" /> · <span style={{ color: C.red }}>X</span> · <Tf s="cam,target" />
          </span>
        </div>
      </Panel>
      <Box x={948} y={130} w={908} h={360} at={18.5} color={`${C.accent}88`} gap={10} title={<Head color={C.accent}>eye-in-hand · 카메라는 손목, target 은 책상</Head>}>
        <Row at={18.9}>
          구하는 값 <span style={mono(C.accent, 24)}>X = <Tf s="grip,cam" /></span>
        </Row>
        <Row at={19.5}>
          고정이지만 몰라도 되는 값 <span style={mono(C.muted, 24)}><Tf s="base,target" /></span> · AX = XB 에서 지워진다
        </Row>
        <Row at={20.4}>장점: 물체에 다가가 가까이서 찍을 수 있다</Row>
        <Row at={21.2} color={C.muted}>
          f = 500 pixel 이면 pixel 하나가 0.5 m 에서 1 mm, 0.25 m 에서 0.5 mm
        </Row>
        <Row at={22.2}>약점: 사진마다 그 순간의 FK 가 정확해야 한다</Row>
      </Box>
      <Box x={948} y={510} w={908} h={370} at={24} color={`${C.orange}88`} gap={10} title={<Head color={C.orange}>eye-to-hand · 카메라는 삼각대·천장, target 은 gripper</Head>}>
        <Row at={24.4}>
          구하는 값 <span style={mono(C.orange, 24)}>X = <Tf s="base,cam" /></span>
        </Row>
        <Row at={25}>
          고정이지만 몰라도 되는 값 <span style={mono(C.muted, 24)}><Tf s="grip,target" /></span>
        </Row>
        <Row at={25.8}>장점: 카메라가 움직이지 않아 작업 공간 전체를 늘 본다</Row>
        <Row at={26.5} color={C.muted}>
          예: 로봇 옆 RGB-D 카메라의 point cloud 로 MoveIt 의 충돌 회피
        </Row>
        <Row at={27.2}>약점: 물체가 멀고, 팔이 시야를 가릴 수 있다</Row>
        <Row at={27.9} color={C.muted}>
          easy_handeye2 는 eye-to-hand 를 eye-on-base 라고 부른다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Lever() {
  const t = useSec()
  const cam = { x: 100, y: 250 }
  const obj = { x: 820, y: 250 }
  const off = (obj.x - cam.x - 20) * Math.tan((6 * Math.PI) / 180) // the figure's angle, 6 times the real 1°
  const wrong = { x: obj.x, y: obj.y - off }
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1000} h={480}>
        <svg width={1000} height={480}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            rotation 오차와 거리 (lever arm)
          </text>
          <text x={970} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 각도는 6 배 키움
          </text>
          <g opacity={prog(t, 0.5)}>
            <rect x={cam.x - 40} y={cam.y - 22} width={60} height={44} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
            <circle cx={cam.x + 4} cy={cam.y} r={8} fill={C.accent} />
            <text x={cam.x - 10} y={cam.y + 52} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
              camera
            </text>
            <line x1={cam.x + 20} y1={cam.y} x2={obj.x - 16} y2={obj.y} stroke={C.green} strokeWidth={3} />
            <circle cx={obj.x} cy={obj.y} r={14} fill={C.green} />
            <text x={obj.x} y={obj.y + 46} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              실제 물체
            </text>
            <text x={(cam.x + obj.x) / 2} y={cam.y + 40} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              0.5 m
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <line x1={cam.x + 20} y1={cam.y} x2={wrong.x - 14} y2={wrong.y + 1.5} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
            <circle cx={wrong.x} cy={wrong.y} r={14} fill="none" stroke={C.red} strokeWidth={3} />
            <text x={wrong.x} y={wrong.y - 26} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              계산한 위치
            </text>
            <text x={262} y={214} fill={C.red} fontSize={24} fontWeight={700} fontFamily={MONO}>
              1°
            </text>
            <line x1={862} y1={wrong.y} x2={862} y2={obj.y} stroke={C.orange} strokeWidth={3} />
            <line x1={852} y1={wrong.y} x2={872} y2={wrong.y} stroke={C.orange} strokeWidth={3} />
            <line x1={852} y1={obj.y} x2={872} y2={obj.y} stroke={C.orange} strokeWidth={3} />
            <text x={882} y={(wrong.y + obj.y) / 2 + 8} fill={C.orange} fontSize={24} fontWeight={700} fontFamily={MONO}>
              8.7 mm
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 340, display: 'grid', gap: 8 }}>
          <Row at={0.6} color={C.muted}>
            translation 이 3 mm 틀리면 위치도 3 mm 만 틀린다
          </Row>
          <span style={{ ...mono(C.text, 26), opacity: prog(t, 7.6) }}>0.5 × tan 1° = 0.5 × 0.01746 ≈ 0.0087 m</span>
          <Row at={9} color={C.orange} size={24}>
            rotation 1° 오차 → 물체가 약 8.7 mm 옆에 있는 것으로 계산된다
          </Row>
        </div>
      </Panel>
      <Box x={1088} y={130} w={768} h={480} at={14} title={<Head color={C.accent}>X 의 rotation 오차 → 위치 오차</Head>}>
        <Table
          at={14.3}
          head={['rotation 오차', '0.3 m 앞', '0.5 m 앞', '1.0 m 앞']}
          widths={[180, 160, 160, 160]}
          size={25}
          rows={[
            ['0.5°', '2.6 mm', '4.4 mm', '8.7 mm'],
            ['1°', '5.2 mm', '8.7 mm', '17.5 mm'],
            ['2°', '10.5 mm', '17.5 mm', '34.9 mm'],
          ]}
          colors={[C.muted, C.accent, C.muted]}
        />
        <Row at={16.5}>
          1° 는 0.3 m 앞에서 <span style={mono(C.accent)}>5.2 mm</span>, 1.0 m 앞에서 <span style={mono(C.accent)}>17.5 mm</span>
        </Row>
        <Row at={18} color={C.muted}>
          멀리 있는 물체를 볼수록 rotation 을 정확히 구해야 한다
        </Row>
        <Row at={19.5} color={C.muted} size={21}>
          Classical Pick & Place 의 error budget: 카메라가 2° 기울자 cube 위치가 1.7 cm 틀렸다 (같은 계산)
        </Row>
      </Box>
      <Box x={64} y={635} w={880} h={245} at={21.5} color={`${C.orange}88`} gap={12} title={<Head color={C.orange}>카메라 받침대가 1° 기울면</Head>}>
        <Bar label="받침대 끝 (50 mm)" value={0.87} max={10} color={C.orange} at={21.9} width={420} labelW={220} unit=" mm" />
        <Bar label="0.5 m 앞 물체" value={8.7} max={10} color={C.red} at={22.5} width={420} labelW={220} unit=" mm" />
        <Row at={23.2} color={C.muted}>
          50 × tan 1° ≈ 0.87 mm 라서 도면이나 자로는 잡아내기 어렵다
        </Row>
      </Box>
      <Box x={968} y={635} w={888} h={245} at={24.5} color={`${C.accent}88`} gap={10} title={<Head color={C.accent}>camera frame 의 원점</Head>}>
        <Row at={24.9}>렌즈 안쪽의 투영 중심이라 몸체 겉면 어디에서도 찾을 수 없다</Row>
        <Row at={25.8} color={C.muted}>
          CAD 도면 값은 첫 추측으로만 쓴다
        </Row>
        <Row at={26.8} color={C.accent} size={24}>
          실제 X 는 로봇을 움직여 계산한다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

const PauseLever = () => (
  <PauseWrite
    question="X 의 rotation 이 0.5° 틀렸고 물체는 카메라에서 0.8 m 떨어져 있다. 위치는 약 몇 mm 틀릴까?"
    answer={
      <>
        0.8 × tan 0.5° = 0.8 × 0.00873 ≈ 0.0070 m → 약 7 mm
        <br />
        같은 0.5° 라도 0.3 m 앞이면 2.6 mm · 멀리 볼수록 rotation 이 중요하다
      </>
    }
  />
)

// ---------- S2: AX = XB and the rotation axes ----------

function Axxb() {
  const t = useSec()
  const g1 = { x: 200, y: 280 }
  const g2 = { x: 780, y: 280 }
  const c1 = { x: 200, y: 470 }
  const c2 = { x: 780, y: 470 }
  const p1 = prog(t, 0.4)
  const p2 = prog(t, 1.6)
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={980} h={750}>
        <svg width={980} height={750}>
          <text x={30} y={48} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            자세 두 개로 만든 고리
          </text>
          <Node cx={490} cy={120} w={160} h={56} label="base" color={C.blue} op={p1} />
          <Node cx={490} cy={650} w={220} h={56} label="target · 고정" color={C.green} op={p1} />
          <Node cx={g1.x} cy={g1.y} w={200} h={60} label="gripper" sub="자세 1" color={C.blue} op={p1} />
          <Node cx={c1.x} cy={c1.y} w={200} h={60} label="camera" sub="자세 1" color={C.accent} op={p1} />
          <Node cx={g2.x} cy={g2.y} w={200} h={60} label="gripper" sub="자세 2" color={C.blue} op={p2} />
          <Node cx={c2.x} cy={c2.y} w={200} h={60} label="camera" sub="자세 2" color={C.accent} op={p2} />
          <g opacity={p1}>
            {arrow(430, 148, 270, 250, C.muted)}
            <text x={340} y={190} textAnchor="end" fill={C.muted} fontSize={22} fontWeight={600}>
              FK
            </text>
            {arrow(g1.x, 310, c1.x, 440, C.red)}
            <text x={216} y={384} fill={C.red} fontSize={26} fontWeight={700} fontFamily={MONO}>
              X
            </text>
            {arrow(230, 500, 400, 622, C.muted)}
            <text x={60} y={590} fill={C.muted} fontSize={20}>
              target pose 1
            </text>
          </g>
          <g opacity={p2}>
            {arrow(550, 148, 710, 250, C.muted)}
            <text x={640} y={190} fill={C.muted} fontSize={22} fontWeight={600}>
              FK
            </text>
            {arrow(g2.x, 310, c2.x, 440, C.red)}
            <text x={796} y={384} fill={C.red} fontSize={26} fontWeight={700} fontFamily={MONO}>
              X
            </text>
            {arrow(750, 500, 580, 622, C.muted)}
            <text x={770} y={590} fill={C.muted} fontSize={20}>
              target pose 2
            </text>
          </g>
          <g opacity={prog(t, 6.8)}>
            {arrow(302, 280, 678, 280, C.accent, 4)}
            <text x={490} y={318} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
              A · gripper 의 움직임
            </text>
            <text x={490} y={346} textAnchor="middle" fill={C.muted} fontSize={20}>
              FK 두 번으로 계산
            </text>
          </g>
          <g opacity={prog(t, 12.8)}>
            {arrow(302, 470, 678, 470, C.orange, 4)}
            <text x={490} y={508} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              B · camera 의 움직임
            </text>
            <text x={490} y={536} textAnchor="middle" fill={C.muted} fontSize={20}>
              사진 두 장의 target pose
            </text>
          </g>
          <text x={490} y={726} textAnchor="middle" fill={C.accent} fontSize={23} fontWeight={600} opacity={prog(t, 9.5)}>
            gripper 1 → camera 2 의 두 길이 같다: A 다음 X = X 다음 B
          </text>
        </svg>
      </Panel>
      <Box x={1068} y={130} w={788} h={200} at={0.6} title={<Head size={26}>base 에서 본 target pose 는 두 자세에서 같다</Head>}>
        <span style={mono(C.text, 26)}>
          <Tf s="base,grip" />
          <sup style={{ fontSize: 20 }}>(1)</sup> X <Tf s="cam,target" />
          <sup style={{ fontSize: 20 }}>(1)</sup>
        </span>
        <span style={mono(C.text, 26)}>
          = <Tf s="base,grip" />
          <sup style={{ fontSize: 20 }}>(2)</sup> X <Tf s="cam,target" />
          <sup style={{ fontSize: 20 }}>(2)</sup>
        </span>
      </Box>
      <Box x={1068} y={345} w={788} h={240} at={6.5} color={`${C.accent}88`} gap={10} title={<span style={mono(C.accent, 36)}>A X = X B</span>}>
        <Row at={7}>A: gripper 가 자세 1 → 2 로 움직인 양 · FK 두 번</Row>
        <Row at={12.8}>B: 그동안 camera 가 움직인 양 · target pose 두 장</Row>
        <Row at={15} color={C.green}>
          <Tf s="base,target" /> 이 식에 남지 않는다 → target 위치를 몰라도 된다
        </Row>
      </Box>
      <Box x={1068} y={605} w={788} h={275} at={18.5} gap={10} title={<Head>rotation 과 translation 으로 나누기</Head>}>
        <span style={mono(C.text, 26)}>
          R<Sb>A</Sb> R<Sb>X</Sb> = R<Sb>X</Sb> R<Sb>B</Sb>
        </span>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 19.2) }}>
          R<Sb>A</Sb> t<Sb>X</Sb> + t<Sb>A</Sb> = R<Sb>X</Sb> t<Sb>B</Sb> + t<Sb>X</Sb>
        </span>
        <Row at={20.5} color={C.muted}>
          첫 식에는 t<Sb>X</Sb> 가 없다 → rotation 을 먼저 구하고 그 R<Sb>X</Sb> 로 translation
        </Row>
        <Row at={24.8} color={C.accent}>
          자세 N 개 → 짝 N(N−1)/2 개 · 자세 10 개면 움직임 45 개
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Axes() {
  const t = useSec()
  const G = { x: 230, y: 240 }
  const K = { x: 690, y: 240 }
  const L = 130
  const dot = (x: number, y: number, color: string) => (
    <g>
      <circle cx={x} cy={y} r={12} fill="none" stroke={color} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={4} fill={color} />
    </g>
  )
  const hi1 = prog(t, 7.2)
  const hi2 = prog(t, 8.6)
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={900} h={750}>
        <svg width={900} height={420}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 각도, 다른 좌표로 적힌 회전 축
          </text>
          <text x={870} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            위에서 본 그림
          </text>
          <g opacity={prog(t, 0.6)}>
            {arrow(G.x, G.y, G.x + L, G.y, C.blue, 3 + 3 * hi1)}
            {arrow(G.x, G.y, G.x, G.y - L, C.green, 3 + 3 * hi2)}
            {dot(G.x, G.y, C.purple)}
            <SubText x={G.x + L + 12} y={G.y + 8} main="x" sub="g" color={C.blue} />
            <SubText x={G.x + 14} y={G.y - L + 6} main="y" sub="g" color={C.green} />
            <SubText x={G.x - 20} y={G.y + 44} main="z" sub="g" color={C.purple} anchor="end" />
            <text x={G.x + 40} y={G.y + 110} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              gripper frame
            </text>
            <text x={G.x + 40} y={G.y + 140} textAnchor="middle" fill={C.muted} fontSize={20}>
              축 a 는 FK 로 계산
            </text>
          </g>
          <g opacity={prog(t, 2)}>
            {arrow(K.x, K.y, K.x, K.y - L, C.green, 3 + 3 * hi2)}
            {arrow(K.x, K.y, K.x - L, K.y, C.blue, 3 + 3 * hi1)}
            {dot(K.x, K.y, C.purple)}
            <SubText x={K.x + 14} y={K.y - L + 6} main="x" sub="c" color={C.green} />
            <SubText x={K.x - L - 12} y={K.y - 18} main="y" sub="c" color={C.blue} anchor="end" />
            <SubText x={K.x + 20} y={K.y + 44} main="z" sub="c" color={C.purple} />
            <text x={K.x - 30} y={G.y + 110} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              camera frame
            </text>
            <text x={K.x - 30} y={G.y + 140} textAnchor="middle" fill={C.muted} fontSize={20}>
              축 b 는 target pose 로 계산
            </text>
          </g>
          <text x={30} y={410} fill={C.muted} fontSize={21} opacity={prog(t, 3.5)}>
            예: camera 의 x 축이 gripper 의 y 축 방향 → X 의 rotation 은 z 축으로 90°
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 440, display: 'grid', gap: 18 }}>
          <Table
            at={6.8}
            step={1.4}
            head={['움직임', 'gripper 에서 잰 축 a', 'camera 에서 잰 축 b', '각도']}
            widths={[110, 260, 260, 150]}
            rows={[
              ['1', '(1, 0, 0)', '(0, −1, 0)', '둘 다 30°'],
              ['2', '(0, 1, 0)', '(1, 0, 0)', '둘 다 30°'],
            ]}
            colors={[C.blue, C.green]}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: prog(t, 10) }}>
            <span style={mono(C.accent, 34)}>
              a = R<Sb>X</Sb> b
            </span>
            <span style={line(C.text, 24)}>축의 짝 두 개가 R<Sb>X</Sb> 를 하나로 정한다</span>
          </div>
          <Row at={11.2} color={C.muted} size={21}>
            움직임 2 에서 camera 의 (1, 0, 0) 축과 gripper 의 (0, 1, 0) 축이 같은 축 → camera 의 x 축은 gripper 의 y 축 방향
          </Row>
        </div>
      </Panel>
      <Box x={988} y={130} w={868} h={400} at={13} color={`${C.red}88`} gap={10} title={<Head color={C.red}>축의 짝이 하나뿐이면</Head>}>
        <Row at={13.4}>b 를 a 로 보내는 rotation 에 a 축으로 아무 각도나 더 돌려도 같은 짝을 만족한다</Row>
        <Row at={15.5}>Park & Martin: 회전 축이 평행하지 않은 움직임이 2 개 있어야 해가 하나로 정해진다</Row>
        <Row at={19.8} color={C.accent}>
          움직임 2 개 = 자세 3 개 → OpenCV 문서와 Tsai-Lenz 논문의 최소 자세 수
        </Row>
        <Row at={21.6} color={C.red}>
          오해: 로봇을 여러 번 움직이기만 하면 된다
        </Row>
        <Row at={22.6} color={C.muted}>
          사실: 마지막 관절 하나만 돌린 자세 10 개는 움직임 45 개라도 축이 모두 같아서, Tsai 와 Park 모두 rotation 이 약 90°, translation 이 1 ~ 1.4 m 틀린다
        </Row>
      </Box>
      <Box x={988} y={548} w={868} h={332} at={24.5} color={`${C.orange}88`} gap={10} title={<Head color={C.orange}>translation 만 하는 움직임</Head>}>
        <svg width={812} height={110}>
          <g opacity={prog(t, 24.8)}>
            <rect x={20} y={32} width={120} height={66} rx={10} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} />
            <circle cx={80} cy={16} r={9} fill={C.accent} />
            <circle cx={140} cy={72} r={9} fill={C.accent} />
            <rect x={400} y={32} width={120} height={66} rx={10} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={2} strokeDasharray="6 5" />
            <circle cx={460} cy={16} r={9} fill={C.accent} opacity={0.7} />
            <circle cx={520} cy={72} r={9} fill={C.accent} opacity={0.7} />
            {arrow(94, 16, 446, 16, C.orange, 3)}
            {arrow(154, 72, 506, 72, C.orange, 3)}
            <text x={560} y={50} fill={C.orange} fontSize={22} fontWeight={600}>
              모두 같은 화살표
            </text>
            <text x={560} y={80} fill={C.muted} fontSize={20}>
              카메라 위치 둘 · 모식도
            </text>
          </g>
        </svg>
        <Row at={25.6}>
          R<Sb>A</Sb> = I 이면 (R<Sb>A</Sb> − I) t<Sb>X</Sb> 가 통째로 0 → t<Sb>X</Sb> 가 식에서 사라진다
        </Row>
        <Row at={27} color={C.muted}>
          simulation: translation 만 한 자세 10 개 → Tsai 는 계산 실패, Park 는 rotation 이 100° 넘게 틀림
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

const PauseAxis = () => (
  <PauseWrite
    question="모든 자세를 gripper 의 z 축 회전으로만 만들었다. X 의 어느 부분을 알 수 없을까?"
    answer={
      <span style={{ fontSize: 32 }}>
        translation: R<Sb>A</Sb> − I 의 셋째 열이 늘 0 이라 t<Sb>X</Sb> 의 z 성분을 모른다
        <br />
        rotation: 축의 짝이 하나뿐이라 z 축으로 더 돈 각도를 모른다
        <br />→ x 나 y 축으로 크게 도는 자세를 더한다
      </span>
    }
  />
)

// ---------- S3: collecting poses and the solvers ----------

function Poses() {
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1792} h={180} at={0.3} gap={8} title={<Head color={C.accent}>simulation 가정 (강의의 계산)</Head>}>
        <Row at={0.6}>camera: gripper 원점에서 y 7 cm, z 5 cm · z 축으로 90° · target 을 0.4 m 아래에서 내려다보고 세 축을 ±s° 안에서 무작위로 기울인다</Row>
        <Row at={1.6}>noise: target pose 0.1° · 0.5 mm, FK 0.01° · 0.1 mm (Gaussian) · OpenCV 4.14 calibrateHandEye 로 300 번 풀어 오차의 중앙값</Row>
      </Box>
      <Box x={64} y={330} w={880} h={330} at={6.5} gap={8} title={<Head>자세 수 → translation 오차 (±30°, Park)</Head>}>
        {(
          [
            ['자세 3 개', 3.57],
            ['5 개', 1.84],
            ['10 개', 1.18],
            ['15 개', 0.88],
            ['20 개', 0.75],
          ] as [string, number][]
        ).map(([l, v], i) => (
          <Bar key={l} label={l} value={v} max={8} color={C.blue} at={6.9 + i * 0.5} width={520} labelW={110} unit=" mm" fmt={v.toFixed(2)} />
        ))}
        <Row at={10} color={C.muted}>
          3 개 → 10 개에서 약 3 분의 1 로 줄고, 그 뒤로는 천천히 준다
        </Row>
      </Box>
      <Box x={968} y={330} w={888} h={330} at={13} gap={8} title={<Head>기울이는 범위 → translation 오차 (자세 10 개, Park)</Head>}>
        {(
          [
            ['±5°', 6.83],
            ['±10°', 3.38],
            ['±20°', 1.72],
            ['±30°', 1.17],
            ['±45°', 0.77],
          ] as [string, number][]
        ).map(([l, v], i) => (
          <Bar key={l} label={l} value={v} max={8} color={i === 0 ? C.red : C.green} at={13.4 + i * 0.5} width={520} labelW={110} unit=" mm" fmt={v.toFixed(2)} />
        ))}
        <Row at={16.5} color={C.muted}>
          ±5° 에서는 Tsai 가 계산 실패 · 자세 수보다 회전 범위를 먼저 챙긴다
        </Row>
      </Box>
      <Box x={64} y={680} w={880} h={200} at={19.5} color={`${C.red}88`} gap={10} title={<Head color={C.red}>OpenCV 4.10 (2024 년) 이상의 Tsai 구현</Head>}>
        <Row at={19.9}>회전이 약 17° 보다 작거나 약 116° 보다 큰 짝을 버린다</Row>
        <Row at={21.5} color={C.muted}>
          남은 짝이 2 개 미만이면 단위 rotation · 0 translation 을 돌려준다 → 다시 수집
        </Row>
      </Box>
      <Box x={968} y={680} w={888} h={200} at={26} color={`${C.green}88`} gap={10} title={<Head color={C.green}>도구의 권장값</Head>}>
        <Row at={26.4}>MoveIt Calibration: 자세 5 개부터 계산 · 보통 12 ~ 15 개에서 더 나아지지 않음</Row>
        <Row at={28} color={C.muted}>
          easy_handeye2 의 자동 자세: 기본 ±25° 회전 · 0.1 m 이동
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Solvers() {
  const solver = (x: number, at: number, color: string, name: string, kind: string, rows: [ReactNode, number, string?][]) => (
    <Box x={x} y={130} w={576} h={360} at={at} color={`${color}88`} gap={10} title={
      <span>
        <Head color={color}>{name}</Head>
        <Tag color={color}>{kind}</Tag>
      </span>
    }>
      {rows.map(([r, a, c], i) => (
        <Row key={i} at={a} color={c} size={21}>
          {r}
        </Row>
      ))}
    </Box>
  )
  return (
    <AbsoluteFill>
      {solver(64, 0.3, C.blue, 'Tsai-Lenz (1989)', 'separable', [
        ['rotation 을 축 · 각도 vector 의 선형 식으로 구한 뒤 translation', 0.7],
        [<span style={mono(C.blue, 21)}>CALIB_HAND_EYE_TSAI</span>, 1.2],
        ['기본: OpenCV, easy_handeye2', 14.3, C.accent],
        ['IBM Clean Room Robot · 사진마다 90 ms · rotation 10 배 정확 (논문 보고)', 2.2, C.muted],
      ])}
      {solver(672, 1.4, C.purple, 'Park-Martin (1994)', 'separable', [
        ['rotation vector 의 least squares 를 closed form 으로 구한 뒤 translation', 1.8],
        [<span style={mono(C.purple, 21)}>CALIB_HAND_EYE_PARK</span>, 2.3],
        ['논문의 simulation: 측정이 10 개에 가까워질 때까지 오차가 빠르게 준다', 3.2, C.muted],
      ])}
      {solver(1280, 7, C.green, 'Daniilidis (1999)', 'simultaneous', [
        ['dual quaternion 으로 rotation 과 translation 을 함께, SVD 로', 7.4],
        [<span style={mono(C.green, 21)}>CALIB_HAND_EYE_DANIILIDIS</span>, 7.9],
        ['기본: MoveIt Calibration', 16.8, C.accent],
        ['separable 은 rotation 오차가 translation 에 넘어가지만, 이 방법은 둘을 한꺼번에 구한다', 9.5, C.muted],
      ])}
      <Box x={64} y={510} w={1100} h={370} at={21} gap={10} title={<Head>simulation 오차의 중앙값 (±30°, rotation · translation)</Head>}>
        <Table
          at={21.3}
          step={0.4}
          head={['자세 수', 'Tsai', 'Park', 'Daniilidis']}
          widths={[140, 280, 280, 280]}
          rows={[
            ['3 개', '0.37° · 3.27 mm', '0.37° · 3.57 mm', '0.35° · 3.32 mm'],
            ['5 개', '0.22° · 1.98 mm', '0.20° · 1.84 mm', '0.22° · 2.08 mm'],
            ['10 개', '0.13° · 1.17 mm', '0.13° · 1.18 mm', '0.14° · 1.30 mm'],
            ['20 개', '0.10° · 0.75 mm', '0.08° · 0.75 mm', '0.10° · 0.85 mm'],
          ]}
        />
        <Row at={23.5} color={C.accent}>
          세 solver 차이는 0.1 mm 단위 · 범위를 ±5° → ±30° 로 넓히면 translation 오차가 약 6 mm 준다
        </Row>
        <Row at={25.5} color={C.muted}>
          solver 마다 결과가 크게 다르면 데이터가 나쁘다는 신호 → 자세부터 다시 모은다
        </Row>
      </Box>
      <Box x={1188} y={510} w={668} h={370} at={17.5} color={`${C.orange}88`} gap={14} title={<Head color={C.orange}>실제 로봇 비교 · Enebuse 등 (2022)</Head>}>
        <Row at={17.9}>UR5e 손목에 Azure Kinect · 자세 101 개</Row>
        <Row at={18.6}>rotation 은 Park 가 가장 정확했다</Row>
        <Row at={19.2}>translation 은 Daniilidis 가 가장 정확했다</Row>
        <Row at={19.9} color={C.muted}>
          회전 범위를 넓히면 separable 은 정확해지고 simultaneous 는 오히려 나빠진다
        </Row>
        <Row at={20.6} color={C.muted}>
          translation 범위를 넓히면 그 반대다
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

const PausePairs = () => (
  <PauseWrite
    question="자세를 12 개 모았다. OpenCV 구현이 쓰는 자세 짝 (움직임) 은 몇 개인가?"
    answer={
      <span style={{ fontSize: 34 }}>
        12 개에서 두 개씩 고르는 경우의 수: 12 × 11 ÷ 2 = 66 개
        <br />
        다만 OpenCV 4.10 이상의 Tsai 는 회전이 약 17° 보다 작거나 약 116° 보다 큰 짝을 버린다
      </span>
    }
  />
)

// ---------- S4: validation and tf ----------

// target positions per pose, from figures/he-validate.svg (24 figure px = 1 mm), relative to their mean
const GOOD: [number, number][] = [[-14.4, 16.8], [0, -9.6], [-26.4, 7.2], [-2.4, 26.4], [2.4, -12], [-2.4, -2.4], [2.4, -4.8], [14.4, -2.4], [14.4, -2.4], [9.6, -14.4]]
const BAD: [number, number][] = [[-4.8, 12], [2.4, -12], [-33.6, -2.4], [48, 19.2], [55.2, -16.8], [-12, 7.2], [-55.2, 0], [86.4, -2.4], [-33.6, 4.8], [-52.8, -9.6]]

function Scatter({ cx, cy, pts, color, at, title, rms, t }: { cx: number; cy: number; pts: [number, number][]; color: string; at: number; title: string; rms: string; t: number }) {
  const k = 2.2 // svg px per figure px: 52.8 px per mm
  const mm4 = 4 * 24 * k
  return (
    <g opacity={prog(t, at)}>
      <line x1={cx - mm4} y1={cy} x2={cx + mm4} y2={cy} stroke={C.cardEdge} strokeWidth={1.5} />
      <line x1={cx} y1={cy - 150} x2={cx} y2={cy + 150} stroke={C.cardEdge} strokeWidth={1.5} />
      <text x={cx - mm4} y={cy + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
        −4
      </text>
      <text x={cx + mm4} y={cy + 30} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
        4
      </text>
      <circle cx={cx} cy={cy} r={48 * k} fill="none" stroke={C.dim} strokeDasharray="5 5" strokeWidth={1.5} />
      <text x={cx + 84} y={cy - 88} fill={C.dim} fontSize={20} fontFamily={MONO}>
        2 mm
      </text>
      {pts.map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx * k} cy={cy + dy * k} r={8} fill={color} fillOpacity={0.85 * prog(t, at + 0.3 + i * 0.12, 0.3)} />
      ))}
      <text x={cx} y={cy + 200} textAnchor="middle" fill={color} fontSize={24} fontWeight={600}>
        {title}
      </text>
      <text x={cx} y={cy + 232} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
        {rms}
      </text>
    </g>
  )
}

function Validate() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1100} h={510}>
        <svg width={1100} height={510}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            자세마다 계산한 target 위치 (위에서 본 그림, 평균을 0 으로, mm)
          </text>
          <Scatter cx={290} cy={250} pts={GOOD} color={C.green} at={0.8} title="맞는 X" rms="3D 거리 rms 0.79 mm" t={t} />
          <Scatter cx={810} cy={250} pts={BAD} color={C.red} at={7.6} title="rotation 이 1° 틀린 X" rms="3D 거리 rms 2.59 mm" t={t} />
        </svg>
      </Panel>
      <Box x={1188} y={130} w={668} h={510} at={7.2} gap={14} title={<Head>퍼짐 (rms) · 새 자세 10 개</Head>}>
        <Bar label="맞는 X" value={0.79} max={3} color={C.green} at={7.6} width={200} labelW={220} unit=" mm" />
        <Bar label="rotation 1° 틀림" value={2.59} max={3} color={C.red} at={8.4} width={200} labelW={220} unit=" mm" />
        <Bar label="translation 5 mm 틀림" value={1.96} max={3} color={C.orange} at={9.2} width={200} labelW={220} unit=" mm" />
        <Row at={14.8}>
          0.4 m 앞에서 1° 는 <span style={mono(C.red, 22)}>0.4 × tan 1° ≈ 7.0 mm</span> 인데 퍼짐은 2.59 mm
        </Row>
        <Row at={16.5} color={C.muted}>
          자세가 바뀌어도 같은 방향으로 남는 오차는 퍼짐에 나타나지 않는다
        </Row>
        <Row at={18.5} color={C.muted}>
          calibration 에 쓴 자세로 검사하면 좋게 나오기 쉬워서, 새 자세로 검사한다
        </Row>
      </Box>
      <Box x={64} y={660} w={1100} h={220} at={22} color={`${C.accent}88`} gap={12} title={<Head color={C.accent}>touch test</Head>}>
        <Row at={22.4}>marker 를 새 자리에 놓고 카메라로 위치를 계산 → 끝이 뾰족한 tool 을 그 위 몇 cm 까지 천천히 보낸다</Row>
        <Row at={23.8} color={C.muted}>
          tool 끝과 실제 점 사이 거리는 calibration · FK · tool 길이 오차의 합 → Classical Pick & Place 의 error budget 에서 calibration 몫 안에 들어야 한다
        </Row>
      </Box>
      <Box x={1188} y={660} w={668} h={220} at={25.5} color={`${C.purple}88`} gap={12} title={<Head color={C.purple}>overlay 로도 확인</Head>}>
        <Row at={25.9}>depth camera: RViz 에서 point cloud 가 gripper mesh 위에 겹치는지 본다</Row>
        <Row at={27} color={C.muted}>
          pixel: FK 로 아는 gripper 점을 사진에 투영해 비교
        </Row>
      </Box>
    </AbsoluteFill>
  )
}

function Tools() {
  const t = useSec()
  const pit = (at: number, title: string, text: ReactNode) => (
    <div style={{ display: 'grid', gap: 6, opacity: prog(t, at), alignContent: 'start' }}>
      <span style={{ fontSize: 22, fontWeight: 600, color: C.orange }}>{title}</span>
      <span style={line(C.text, 21)}>{text}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1792} h={160} at={0.3} title={<Head color={C.accent}>ROS 2 에서 두 도구가 맡는 흐름</Head>}>
        <Flow steps={['자세마다 sample', 'OpenCV calibrateHandEye', 'static transform', 'tf 에 올림']} color={C.accent} at={0.8} gap={1.2} />
      </Box>
      <Box x={64} y={310} w={880} h={340} at={7} color={`${C.green}88`} gap={8} title={<Head color={C.green}>MoveIt Calibration</Head>}>
        <Row at={7.4}>화면: RViz panel 의 Target, Context, Calibrate 탭</Row>
        <Row at={8.4}>target: 직접 인쇄하는 ArUco board · 기본 3 × 4 개 (DICT_5X5_250)</Row>
        <Row at={9.6}>Take sample: base→end-effector 와 camera→target 짝이 쌓인다</Row>
        <Row at={11} color={C.accent}>
          sample 5 개부터 결과 · 그 뒤로는 sample 마다 갱신
        </Row>
        <Row at={12.4} color={C.muted}>
          기본 solver Daniilidis · 결과는 static transform publisher 를 담은 launch file
        </Row>
      </Box>
      <Box x={968} y={310} w={888} h={340} at={14.5} color={`${C.orange}88`} gap={12} title={<Head color={C.orange}>easy_handeye2</Head>}>
        <Row at={14.9}>화면: rqt (sample 추가 · 삭제, 계산, 저장)</Row>
        <Row at={15.8}>
          <span style={mono(C.text, 21)}>calibration_type: eye_in_hand / eye_on_base</span>
        </Row>
        <Row at={16.8}>
          frame 4 개: <span style={mono(C.text, 21)}>robot_base_frame · robot_effector_frame</span>
        </Row>
        <Row at={17.4}>
          <span style={{ ...mono(C.text, 21), paddingLeft: 108 }}>tracking_base_frame · tracking_marker_frame</span>
        </Row>
        <Row at={19} color={C.muted}>
          기본 solver Tsai-Lenz · yaml 로 저장 → publish.launch.py 가 tf 로 올림
        </Row>
      </Box>
      <Box x={64} y={670} w={1792} h={210} at={22} color={`${C.red}88`} gap={12} title={<Head color={C.red}>어느 도구든 틀리기 쉬운 곳</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36 }}>
          {pit(22.4, 'frame 선택', 'marker pose 는 optical frame 기준 · camera_link 를 고르면 90° 단위로 틀어질 수 있다')}
          {pit(25, '방향', <>OpenCV 결과는 <Tf s="grip,cam" /> · tf 의 parent 와 child 를 바꾸면 X 의 역행렬이 올라간다</>)}
          {pit(27, '단위와 표기', 'mm 와 Euler angle 로 주는 pose 는 m 와 rotation 행렬로 바꿔서 넣는다')}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PausePixel = () => (
  <PauseWrite
    question="f = 600 pixel 인 카메라로 0.3 m 앞 gripper 끝을 투영했더니 실제로 찍힌 자리와 2 pixel 떨어졌다. 좌우 위치로는 약 몇 mm 인가?"
    answer={
      <>
        pixel 하나 = Z ÷ f = 0.3 ÷ 600 = 0.0005 m (Z 는 카메라 앞 거리)
        <br />2 pixel → 2 × 0.5 = 1 mm
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: S(0), color: C.accent, text: <>X = <Tf s="grip,cam" /> 은 자로 못 잰다 · 1° 는 0.5 m 앞에서 0.5 × tan 1° ≈ 8.7 mm</>, at: 0.4 },
    { tag: S(1), color: C.green, text: 'A (FK) 와 B (target pose) 로 AX = XB · 축이 평행하지 않은 움직임 2 개 (자세 3 개) 이상', at: 4.3 },
    { tag: S(2), color: C.orange, text: '±5° → ±45°: 6.83 → 0.77 mm · 자세 10 ~ 15 개 · solver 차이는 0.1 mm 단위', at: 8.3 },
    { tag: S(3), color: C.red, text: '퍼짐 0.79 mm, 1° 틀리면 2.59 mm · touch test · MoveIt Calibration / easy_handeye2 → tf', at: 12.3 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            카메라도 맞고 관절 계산도 맞는데, 1 cm 는 어디서 생길까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={i} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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

const S = (i: number) => script.sections[i]

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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Grasp Planning</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            찾은 물체를 어떤 자세와 너비로 잡아야 미끄러지지 않는가 · friction cone, force closure, Dex-Net
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/hand-eye-calibration (Tsai-Lenz · Park-Martin · Daniilidis 논문, OpenCV · MoveIt · easy_handeye2 문서)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function HandEyeCalibration() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        chain: Chain,
        lever: Lever,
        'pause-lever': PauseLever,
        axxb: Axxb,
        axes: Axes,
        'pause-axis': PauseAxis,
        poses: Poses,
        solvers: Solvers,
        'pause-pairs': PausePairs,
        validate: Validate,
        tools: Tools,
        'pause-pixel': PausePixel,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
