import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './pid-control.narration.json'
import { script } from './pid-control.script'

// Numbers follow lessons/pid-control/README.md (see pid-control.script.ts). The curves are redrawn from the lesson's own
// figures (p-only, pd-compare, kd-compare, dt-unstable, pid-compare, windup, ff-step) and the minimum-jerk formula in its
// 심화 block; the arm, rail and question curves are schematic (marked 모식도). Every number on screen is the lesson's.

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

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
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

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
    </div>
  )
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, lineHeight: 1.45, whiteSpace: 'nowrap' })

/** a text table: columns in `sans` are left-aligned sans, the rest right-aligned mono; `hl` lights a row for a while */
function Table({ head, rows, widths, at, step = 0.6, size = 24, rowAt, sans = [0], hl = [] }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; rowAt?: number[]; sans?: number[]; hl?: { row: number; from: number; to: number; color: string }[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => {
    const s = sans.includes(i)
    return { width: widths[i], boxSizing: 'border-box', fontFamily: s ? SANS : MONO, fontSize: size, lineHeight: 1.45, whiteSpace: 'nowrap', textAlign: s ? 'left' : 'right', paddingRight: s ? 0 : 10, paddingLeft: i === 0 ? 8 : s ? 24 : 0 }
  }
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 4 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: SANS, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => {
        const lit = hl.find((x) => x.row === k && t >= x.from && t < x.to)
        return (
          <div key={k} style={{ display: 'flex', borderRadius: 8, opacity: prog(t, rowAt ? rowAt[k] : at + 0.3 + k * step), background: lit ? `${lit.color}26` : 'transparent', color: lit ? lit.color : C.text }}>
            {r.map((v, i) => (
              <span key={i} style={cell(i)}>
                {v}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ---------- plotting inside an svg ----------

type Pt = [number, number]

const scale = (p0: number, p1: number, v0: number, v1: number) => (v: number) => p0 + ((v - v0) / (v1 - v0)) * (p1 - p0)

/** the first fraction `p` of a curve, by its x extent, ending on an interpolated point */
function partial(pts: Pt[], p: number): Pt[] {
  if (p >= 1) return pts
  if (p <= 0) return []
  const x0 = pts[0][0]
  const xe = x0 + (pts[pts.length - 1][0] - x0) * p
  const out: Pt[] = []
  for (let i = 0; i < pts.length; i++) {
    if (pts[i][0] <= xe) {
      out.push(pts[i])
      continue
    }
    const [a, b] = pts[i - 1]
    const [c, d] = pts[i]
    out.push([xe, c === a ? d : b + ((d - b) * (xe - a)) / (c - a)])
    break
  }
  return out
}

function Curve({ pts, X, Y, color, p, width = 4, dash, op = 1 }: { pts: Pt[]; X: (v: number) => number; Y: (v: number) => number; color: string; p: number; width?: number; dash?: string; op?: number }) {
  const shown = partial(pts, p)
  if (shown.length < 2) return null
  const d = shown.map(([a, b], i) => `${i ? 'L' : 'M'}${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' ')
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} opacity={op} />
}

/** left and bottom axes with tick labels; a y tick may carry its own label and colour */
function Axes({ X, Y, x0, x1, y0, y1, xt = [], yt = [], op = 1 }: { X: (v: number) => number; Y: (v: number) => number; x0: number; x1: number; y0: number; y1: number; xt?: number[]; yt?: (number | [number, string, string?])[]; op?: number }) {
  return (
    <g opacity={op}>
      <line x1={X(x0)} x2={X(x1)} y1={Y(y0)} y2={Y(y0)} stroke={C.dim} strokeWidth={1.5} />
      <line x1={X(x0)} x2={X(x0)} y1={Y(y0)} y2={Y(y1)} stroke={C.dim} strokeWidth={1.5} />
      {xt.map((v) => (
        <text key={`x${v}`} x={X(v)} y={Y(y0) + 26} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
          {v}
        </text>
      ))}
      {yt.map((tk) => {
        const [v, lab, col] = typeof tk === 'number' ? [tk, String(tk).replace('-', '−'), C.dim] : tk
        return (
          <text key={`y${v}`} x={X(x0) - 10} y={Y(v) + 7} textAnchor="end" fill={col ?? C.dim} fontSize={20} fontFamily={MONO}>
            {lab}
          </text>
        )
      })}
    </g>
  )
}

function Ref({ X, Y, x0, x1, v, color = C.muted, op = 1 }: { X: (v: number) => number; Y: (v: number) => number; x0: number; x1: number; v: number; color?: string; op?: number }) {
  return <line x1={X(x0)} x2={X(x1)} y1={Y(v)} y2={Y(v)} stroke={color} strokeWidth={1.5} strokeDasharray="8 6" opacity={op} />
}

/** a legend entry: a short line sample and its label */
function Key({ x, y, color, label, op = 1, dash }: { x: number; y: number; color: string; label: string; op?: number; dash?: string }) {
  return (
    <g opacity={op}>
      <line x1={x} x2={x + 36} y1={y - 7} y2={y - 7} stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={dash} />
      <text x={x + 46} y={y} fill={color} fontSize={22} fontWeight={600}>
        {label}
      </text>
    </g>
  )
}

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 12, opacity = 1) {
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

/** linear 0 → 1 over [from, from + dur], for drawing a curve at an even pace */
const draw = (t: number, from: number, dur: number) => Math.min(1, Math.max(0, (t - from) / dur))

// curves redrawn from the lesson figures: [t (s), value]
const P4: Pt[] = [[0.0,0.0],[0.499,1.0],[1.0,2.0],[1.5,2.0],[2.0,1.0],[2.5,0.0],[3.001,0.0],[3.5,1.0],[3.999,2.0],[4.5,2.0],[5.0,1.0],[5.5,0.0],[6.0,0.0],[6.501,1.0],[7.0,2.0]]
const PD1: Pt[] = [[0.0,0.0],[0.499,1.0],[1.0,1.5],[1.5,1.25],[2.0,0.875],[2.5,0.812],[3.001,0.969],[3.5,1.077],[3.999,1.055],[4.5,0.989],[5.0,0.966],[5.5,0.989],[6.0,1.011],[6.501,1.011],[7.0,1.0]]
const KD1: Pt[] = [[0.0,0.0],[0.091,0.018],[0.171,0.058],[0.26,0.126],[0.349,0.217],[0.429,0.31],[0.52,0.428],[0.611,0.553],[0.7,0.681],[0.78,0.794],[0.869,0.917],[0.96,1.031],[1.04,1.124],[1.131,1.216],[1.22,1.294],[1.3,1.349],[1.389,1.396],[1.48,1.427],[1.571,1.442],[1.651,1.442],[1.74,1.43],[1.829,1.405],[1.909,1.374],[2.0,1.331],[2.091,1.282],[2.171,1.234],[2.26,1.178],[2.349,1.122],[2.429,1.072],[2.52,1.018],[2.611,0.97],[2.7,0.926],[2.78,0.891],[2.869,0.859],[2.96,0.834],[3.04,0.818],[3.131,0.808],[3.22,0.803],[3.3,0.805],[3.389,0.813],[3.48,0.826],[3.571,0.842],[3.651,0.86],[3.74,0.883],[3.829,0.907],[3.909,0.93],[4.0,0.955],[4.091,0.979],[4.171,0.999],[4.26,1.021],[4.351,1.039],[4.429,1.054],[4.52,1.066],[4.611,1.076],[4.7,1.083],[4.78,1.086],[4.869,1.087],[4.96,1.085],[5.04,1.082],[5.131,1.075],[5.22,1.067],[5.3,1.058],[5.389,1.048],[5.48,1.037],[5.571,1.026],[5.651,1.016],[5.74,1.006],[5.829,0.996],[5.909,0.988],[6.0,0.98]]
const KD4: Pt[] = [[0.0,0.0],[0.091,0.016],[0.171,0.05],[0.26,0.101],[0.349,0.161],[0.429,0.219],[0.52,0.285],[0.611,0.351],[0.7,0.414],[0.78,0.468],[0.869,0.524],[0.96,0.577],[1.04,0.619],[1.131,0.663],[1.22,0.703],[1.3,0.735],[1.389,0.767],[1.48,0.796],[1.571,0.822],[1.651,0.842],[1.74,0.862],[1.829,0.88],[1.909,0.894],[2.0,0.908],[2.091,0.92],[2.171,0.93],[2.26,0.939],[2.349,0.947],[2.429,0.954],[2.52,0.96],[2.611,0.966],[2.7,0.97],[2.78,0.974],[2.869,0.978],[2.96,0.981],[3.04,0.983],[3.131,0.986],[3.22,0.987],[3.3,0.989],[3.389,0.99],[3.48,0.992],[3.571,0.993],[3.651,0.994],[3.74,0.994],[3.829,0.995],[3.909,0.996],[4.0,0.997],[4.091,0.997],[4.171,0.998],[4.26,0.998],[4.351,0.998],[4.429,0.998],[4.52,0.998],[4.611,0.999],[4.7,0.999],[4.78,0.999],[4.869,0.999],[4.96,0.999],[5.04,0.999],[5.131,0.999],[5.22,0.999],[5.3,1.0],[5.389,1.0],[5.48,1.0],[5.571,1.0],[5.651,1.0],[5.74,1.0],[5.829,1.0],[5.909,1.0],[6.0,1.0]]
const KD10: Pt[] = [[0.0,0.0],[0.091,0.014],[0.171,0.038],[0.26,0.069],[0.349,0.102],[0.429,0.13],[0.52,0.162],[0.611,0.193],[0.7,0.222],[0.78,0.248],[0.869,0.275],[0.96,0.302],[1.04,0.325],[1.131,0.35],[1.22,0.374],[1.3,0.394],[1.389,0.417],[1.48,0.438],[1.571,0.458],[1.651,0.477],[1.74,0.496],[1.829,0.514],[1.909,0.53],[2.0,0.547],[2.091,0.564],[2.171,0.578],[2.26,0.594],[2.349,0.609],[2.429,0.622],[2.52,0.636],[2.611,0.649],[2.7,0.662],[2.78,0.673],[2.869,0.685],[2.96,0.697],[3.04,0.706],[3.131,0.718],[3.22,0.728],[3.3,0.737],[3.389,0.746],[3.48,0.756],[3.571,0.765],[3.651,0.772],[3.74,0.781],[3.829,0.789],[3.909,0.796],[4.0,0.803],[4.091,0.81],[4.171,0.817],[4.26,0.823],[4.351,0.83],[4.429,0.835],[4.52,0.842],[4.611,0.847],[4.7,0.853],[4.78,0.858],[4.869,0.863],[4.96,0.868],[5.04,0.873],[5.131,0.877],[5.22,0.882],[5.3,0.886],[5.389,0.89],[5.48,0.894],[5.571,0.898],[5.651,0.901],[5.74,0.905],[5.829,0.908],[5.909,0.911],[6.0,0.914]]
const DT_FINE: Pt[] = [[0.0,0.0],[0.04,0.004],[0.09,0.017],[0.13,0.029],[0.17,0.051],[0.22,0.076],[0.26,0.101],[0.3,0.126],[0.35,0.16],[0.39,0.189],[0.43,0.219],[0.48,0.257],[0.52,0.286],[0.57,0.32],[0.61,0.349],[0.65,0.379],[0.7,0.413],[0.74,0.442],[0.78,0.467],[0.83,0.501],[0.87,0.526],[0.91,0.547],[0.96,0.577],[1.0,0.598],[1.04,0.619],[1.09,0.644],[1.13,0.665],[1.17,0.682],[1.22,0.703],[1.26,0.72],[1.3,0.737],[1.35,0.754],[1.39,0.766],[1.43,0.779],[1.48,0.796],[1.52,0.808],[1.57,0.821],[1.61,0.834],[1.65,0.842],[1.7,0.855],[1.74,0.863],[1.78,0.872],[1.83,0.88],[1.87,0.888],[1.91,0.893],[1.96,0.901],[2.0,0.909],[2.04,0.914],[2.09,0.922],[2.13,0.926],[2.17,0.931],[2.22,0.935],[2.26,0.939],[2.3,0.943],[2.35,0.947],[2.39,0.952],[2.43,0.956],[2.48,0.956],[2.52,0.96],[2.57,0.964],[2.61,0.964],[2.65,0.968],[2.7,0.968],[2.74,0.973],[2.78,0.973],[2.83,0.977],[2.87,0.977],[2.91,0.981],[2.96,0.981],[3.0,0.981]]
const DT_COARSE: Pt[] = [[0.0,0.0],[0.5,1.002],[1.0,0.0],[1.5,2.0],[2.0,-1.002],[2.5,4.0],[3.0,-4.0]]
const RAIL_PD: Pt[] = [[0.0,0.0],[0.501,0.5],[1.0,0.75],[1.499,0.625],[2.0,0.437],[2.501,0.407],[3.0,0.485],[3.499,0.539],[4.0,0.527],[4.501,0.494],[5.0,0.484],[5.499,0.495],[6.0,0.506],[6.501,0.506],[7.0,0.5],[7.499,0.497],[8.0,0.499],[8.501,0.501],[9.0,0.501],[9.499,0.5],[10.0,0.5],[10.501,0.5],[11.0,0.5],[11.499,0.5],[12.0,0.5]]
const RAIL_PID: Pt[] = [[0.0,0.0],[0.501,0.75],[1.0,1.188],[1.499,0.984],[2.0,0.668],[2.501,0.695],[3.0,0.942],[3.499,1.068],[4.0,0.989],[4.501,0.89],[5.0,0.908],[5.499,0.989],[6.0,1.024],[6.501,0.995],[7.0,0.964],[7.499,0.972],[8.0,0.998],[8.501,1.008],[9.0,0.998],[9.499,0.989],[10.0,0.992],[10.501,1.001],[11.0,1.003],[11.499,0.999],[12.0,0.996]]
const FF_PD: Pt[] = [[0.0,0.0],[0.5,0.5],[0.999,0.75],[1.5,0.625],[2.0,0.437],[2.5,0.407],[3.001,0.485],[3.5,0.539],[4.0,0.527],[4.5,0.494],[4.999,0.484],[5.5,0.495],[6.0,0.506],[6.5,0.506],[7.001,0.5],[7.5,0.497],[8.0,0.499]]
const FF_2: Pt[] = [[0.0,0.0],[0.5,1.0],[0.999,1.5],[1.5,1.251],[2.0,0.875],[2.5,0.812],[3.001,0.969],[3.5,1.079],[4.0,1.055],[4.5,0.989],[4.999,0.967],[5.5,0.989],[6.0,1.011],[6.5,1.011],[7.001,1.0],[7.5,0.995],[8.0,0.998]]
const FF_25: Pt[] = [[0.0,0.0],[0.5,0.875],[0.999,1.313],[1.5,1.094],[2.0,0.766],[2.5,0.711],[3.001,0.848],[3.5,0.944],[4.0,0.923],[4.5,0.865],[4.999,0.846],[5.5,0.866],[6.0,0.885],[6.5,0.884],[7.001,0.875],[7.5,0.87],[8.0,0.872]]
const WU_X_ON: Pt[] = [[0.0,0.0],[0.2,0.021],[0.45,0.101],[0.65,0.213],[0.85,0.368],[1.1,0.608],[1.3,0.853],[1.5,1.131],[1.75,1.541],[1.95,1.909],[2.15,2.32],[2.4,2.891],[2.6,3.392],[2.85,4.075],[3.05,4.667],[3.25,5.275],[3.5,5.952],[3.7,6.379],[3.9,6.688],[4.15,6.923],[4.35,7.003],[4.55,7.019],[4.8,6.965],[5.0,6.885],[5.2,6.784],[5.45,6.645],[5.65,6.533],[5.85,6.427],[6.1,6.299],[6.3,6.208],[6.5,6.123],[6.75,6.027],[6.95,5.957],[7.15,5.893],[7.4,5.824],[7.6,5.771],[7.85,5.712],[8.05,5.669],[8.25,5.627],[8.5,5.579],[8.7,5.541],[8.9,5.509],[9.15,5.472],[9.35,5.445],[9.55,5.419],[9.8,5.387],[10.0,5.36],[10.2,5.339],[10.45,5.312],[10.65,5.296],[10.85,5.275],[11.1,5.253],[11.3,5.237],[11.5,5.227],[11.75,5.205],[11.95,5.195],[12.15,5.184],[12.4,5.168],[12.6,5.157],[12.85,5.147],[13.05,5.136],[13.25,5.131],[13.5,5.12],[13.7,5.109],[13.9,5.104],[14.15,5.099],[14.35,5.093],[14.55,5.083],[14.8,5.077],[15.0,5.072]]
const WU_X_OFF: Pt[] = [[0.0,0.0],[0.2,0.021],[0.45,0.101],[0.65,0.213],[0.85,0.368],[1.1,0.608],[1.3,0.853],[1.5,1.131],[1.75,1.541],[1.95,1.909],[2.15,2.32],[2.4,2.885],[2.6,3.339],[2.85,3.84],[3.05,4.165],[3.25,4.416],[3.5,4.645],[3.7,4.773],[3.9,4.853],[4.15,4.912],[4.35,4.933],[4.55,4.944],[4.8,4.949],[5.0,4.944],[5.2,4.939],[5.45,4.933],[5.65,4.933],[5.85,4.928],[6.1,4.928],[6.3,4.933],[6.5,4.933],[6.75,4.939],[6.95,4.939],[7.15,4.944],[7.4,4.949],[7.6,4.949],[7.85,4.955],[8.05,4.96],[8.25,4.96],[8.5,4.965],[8.7,4.965],[8.9,4.971],[9.15,4.971],[9.35,4.971],[9.55,4.976],[9.8,4.976],[10.0,4.976],[10.2,4.981],[10.45,4.981],[10.65,4.981],[10.85,4.981],[11.1,4.987],[11.3,4.987],[11.5,4.987],[11.75,4.987],[11.95,4.987],[12.15,4.987],[12.4,4.992],[12.6,4.992],[12.85,4.992],[13.05,4.992],[13.25,4.992],[13.5,4.992],[13.7,4.992],[13.9,4.992],[14.15,4.992],[14.35,4.992],[14.55,4.997],[14.8,4.997],[15.0,4.997]]
const WU_I_ON: Pt[] = [[0.0,0.0],[0.2,1.0],[0.45,2.23],[0.65,3.2],[0.85,4.15],[1.1,5.28],[1.3,6.13],[1.5,6.94],[1.75,7.86],[1.95,8.51],[2.15,9.09],[2.4,9.7],[2.6,10.07],[2.85,10.39],[3.05,10.52],[3.25,10.53],[3.5,10.38],[3.7,10.14],[3.9,9.84],[4.15,9.38],[4.35,8.99],[4.55,8.59],[4.8,8.09],[5.0,7.7],[5.2,7.33],[5.45,6.91],[5.65,6.59],[5.85,6.29],[6.1,5.95],[6.3,5.7],[6.5,5.46],[6.75,5.2],[6.95,5.0],[7.15,4.81],[7.4,4.6],[7.6,4.44],[7.85,4.25],[8.05,4.11],[8.25,3.98],[8.5,3.83],[8.7,3.72],[8.9,3.62],[9.15,3.49],[9.35,3.4],[9.55,3.31],[9.8,3.21],[10.0,3.14],[10.2,3.07],[10.45,2.99],[10.65,2.93],[10.85,2.87],[11.1,2.8],[11.3,2.75],[11.5,2.71],[11.75,2.65],[11.95,2.61],[12.15,2.58],[12.4,2.53],[12.6,2.5],[12.85,2.46],[13.05,2.43],[13.25,2.41],[13.5,2.38],[13.7,2.35],[13.9,2.33],[14.15,2.31],[14.35,2.29],[14.55,2.27],[14.8,2.25],[15.0,2.23]]
const WU_I_OFF: Pt[] = [[0.0,0.0],[0.2,0.0],[0.45,0.0],[0.65,0.0],[0.85,0.0],[1.1,0.0],[1.3,0.0],[1.5,0.0],[1.75,0.0],[1.95,0.0],[2.15,0.0],[2.4,0.32],[2.6,0.7],[2.85,1.05],[3.05,1.25],[3.25,1.39],[3.5,1.51],[3.7,1.57],[3.9,1.61],[4.15,1.63],[4.35,1.65],[4.55,1.66],[4.8,1.67],[5.0,1.69],[5.2,1.7],[5.45,1.71],[5.65,1.73],[5.85,1.74],[6.1,1.76],[6.3,1.77],[6.5,1.79],[6.75,1.8],[6.95,1.81],[7.15,1.83],[7.4,1.84],[7.6,1.85],[7.85,1.86],[8.05,1.87],[8.25,1.88],[8.5,1.89],[8.7,1.89],[8.9,1.9],[9.15,1.91],[9.35,1.91],[9.55,1.92],[9.8,1.93],[10.0,1.93],[10.2,1.93],[10.45,1.94],[10.65,1.94],[10.85,1.95],[11.1,1.95],[11.3,1.95],[11.5,1.96],[11.75,1.96],[11.95,1.96],[12.15,1.96],[12.4,1.97],[12.6,1.97],[12.85,1.97],[13.05,1.97],[13.25,1.98],[13.5,1.98],[13.7,1.98],[13.9,1.98],[14.15,1.98],[14.35,1.98],[14.55,1.98],[14.8,1.98],[15.0,1.99]]

// minimum-jerk from 0° to 90° in 1 s (the lesson's 심화 formula): angle 90 (10s³ − 15s⁴ + 6s⁵), speed 90 × 30 s² (1 − s)²
const MJ_ANGLE: Pt[] = Array.from({ length: 41 }, (_, i) => {
  const s = i / 40
  return [s, 90 * (10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5)]
})
const MJ_SPEED: Pt[] = Array.from({ length: 41 }, (_, i) => {
  const s = i / 40
  return [s, 90 * 30 * s * s * (1 - s) * (1 - s)]
})

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            KINEMATICS · PID CONTROL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>PID Control</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            오차 = 목표 − 지금 → <span style={{ color: C.accent }}>P · I · D</span> → motor 의 힘
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            목표와의 오차를 보고 힘을 고치는 feedback 제어
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

const OVER: Pt[] = Array.from({ length: 121 }, (_, i) => {
  const s = (i / 120) * 6
  return [s, 30 * (1 - Math.exp(-0.55 * s) * Math.cos(2.4 * s))]
})
const SHORT: Pt[] = Array.from({ length: 121 }, (_, i) => {
  const s = (i / 120) * 6
  return [s, 29 * (1 - Math.exp(-1.3 * s))]
})

function Question() {
  const t = useSec()
  const XA = scale(120, 820, 0, 6)
  const XB = scale(1040, 1740, 0, 6)
  const Y = scale(340, 90, 0, 48)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={400}>
        <svg width={1792} height={400}>
          <g opacity={prog(t, 0.3)}>
            <text x={40} y={50} fill={C.orange} fontSize={26} fontWeight={600}>
              30° 를 지나쳤다가 흔들림
            </text>
            <text x={960} y={50} fill={C.red} fontSize={26} fontWeight={600}>
              29° 근처에서 멈춤
            </text>
            <text x={1752} y={50} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
            <Axes X={XA} Y={Y} x0={0} x1={6} y0={0} y1={48} yt={[[0, '0°'], [30, '목표 30°', C.accent]]} />
            <Axes X={XB} Y={Y} x0={0} x1={6} y0={0} y1={48} yt={[[0, '0°'], [30, '목표 30°', C.accent]]} />
            <Ref X={XA} Y={Y} x0={0} x1={6} v={30} color={C.accent} />
            <Ref X={XB} Y={Y} x0={0} x1={6} v={30} color={C.accent} />
            <text x={820} y={374} textAnchor="end" fill={C.dim} fontSize={20}>
              시간 →
            </text>
            <text x={1740} y={374} textAnchor="end" fill={C.dim} fontSize={20}>
              시간 →
            </text>
          </g>
          <Curve pts={OVER} X={XA} Y={Y} color={C.orange} p={draw(t, 0.6, 3.4)} />
          <Curve pts={SHORT} X={XB} Y={Y} color={C.red} p={draw(t, 1, 3.4)} />
          <text x={1740} y={Y(29) + 32} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 4)}>
            29° 에서 멈춤
          </text>
        </svg>
      </Panel>
      <Appear at={4.4} style={{ position: 'absolute', left: 64, top: 580, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          명령도 맞고 motor 도 멀쩡한데 <span style={{ color: C.accent }}>왜 정확히 30° 에서 서지 못할까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 64, top: 710, width: 1792, display: 'flex', justifyContent: 'center', opacity: prog(t, 5.4) }}>
        <Flow steps={['motor 의 힘', '속도', '각도']} color={C.blue} at={5.6} gap={0.35} last="→ 매 순간 각도를 재서 힘을 정하는 계산 = PID" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- P 항과 D 항 ----------

function POnly() {
  const t = useSec()
  const rows = [
    ['0', '0', '0', '1', '4', '2', '1'],
    ['1', '1', '2', '0', '0', '2', '2'],
    ['2', '2', '2', '−1', '−4', '0', '2'],
    ['3', '2', '0', '−1', '−4', '−2', '1'],
    ['4', '1', '−2', '0', '0', '−2', '0'],
    ['5', '0', '−2', '1', '4', '0', '0'],
  ]
  const X = scale(100, 990, 0, 7)
  const Y = scale(270, 70, -0.2, 2.2)
  const p = draw(t, 18.8, 6.5)
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={720} h={340} at={0.4} title={<Head color={C.accent}>한 step 의 계산 · 카트 1 kg</Head>}>
        <Flow steps={['힘', '가속도', '새 속도', '새 위치']} color={C.blue} at={0.9} gap={0.4} />
        <div style={{ display: 'grid', gap: 6 }}>
          {[
            ['힘 2 N 을 1 초 동안 유지', 6.8],
            ['가속도 = 2 ÷ 1 = 2', 8.2],
            ['새 속도 = 0 + 2 × 1 = 2', 9.6],
            ['새 위치 = 0 + 2 × 1 = 2', 11],
          ].map(([s, at]) => (
            <span key={s as string} style={{ ...mono(C.text, 24), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
        </div>
      </Box>
      <Box x={64} y={500} w={720} h={380} at={12.6} color={`${C.orange}88`} title={<Head color={C.orange}>P 항 · 오차에 비례하는 힘</Head>}>
        {[
          ['오차 e = 목표 − 지금 = 1 − x', 12.9],
          ['힘 = Kp × e = 4e', 14.4],
          ['Kp = 4 · Δt = 0.5 초 · 마찰 없음', 15.9],
        ].map(([s, at]) => (
          <span key={s as string} style={{ ...mono(C.text, 26), opacity: prog(t, at as number) }}>
            {s as string}
          </span>
        ))}
        <div style={{ opacity: prog(t, 24), padding: '12px 18px', borderRadius: 14, background: `${C.red}14`, border: `1.5px solid ${C.red}66` }}>
          <span style={mono(C.red, 26)}>최고 2 − 목표 1 = 1 → overshoot 100%</span>
        </div>
      </Box>
      <Card x={816} y={140} w={1040} h={400} at={12.7}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
          <Head size={26} color={C.orange}>
            P 제어 표 · Kp = 4 · Δt = 0.5 초 · 목표 1 m
          </Head>
          <Table head={['step', '위치', '속도', '오차 1 − x', '힘 4e', '새 속도', '새 위치']} widths={[100, 120, 120, 160, 130, 160, 160]} rows={rows} at={13.1} step={0.65} hl={[{ row: 1, from: 18.6, to: 23.5, color: C.orange }]} />
        </div>
      </Card>
      <Card x={816} y={560} w={1040} h={320} at={18.6}>
        <svg width={1040} height={320}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            위치 x (m) · Kp = 4 · 마찰 없는 레일
          </text>
          <text x={990} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Axes X={X} Y={Y} x0={0} x1={7} y0={-0.2} y1={2.2} xt={[0, 1, 2, 3, 4, 5, 6, 7]} yt={[0, [1, '목표 1', C.accent], 2]} />
          <Ref X={X} Y={Y} x0={0} x1={7} v={1} color={C.accent} />
          <Curve pts={P4} X={X} Y={Y} color={C.orange} p={p} />
          {P4.map(([a, b], i) => (
            <circle key={i} cx={X(a)} cy={Y(b)} r={6} fill={C.orange} opacity={p * 7 >= a - 0.01 ? 1 : 0} />
          ))}
          <text x={330} y={95} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 24)}>
            overshoot 100%
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function PD() {
  const t = useSec()
  const XL = scale(80, 850, 0, 7)
  const YL = scale(330, 100, 0, 2.2)
  const XR = scale(80, 850, 0, 6)
  const YR = scale(330, 100, 0, 1.6)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', gap: 16 }}>
        <Chip at={0.4}>D 항 = Kd × 오차가 변하는 빠르기</Chip>
        <Chip at={3.2} color={C.blue}>
          목표가 멈춰 있으면 −Kd × v · 속도에 맞서는 힘
        </Chip>
      </div>
      <Card x={64} y={215} w={880} h={400} at={6.5}>
        <svg width={880} height={400}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            Δt = 0.5 초로 계산한 위치 x (m)
          </text>
          <text x={850} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Key x={28} y={76} color={C.orange} label="P (Kp = 4)" op={0.6} />
          <Key x={260} y={76} color={C.blue} label="PD (Kp = 4, Kd = 1)" op={prog(t, 7.4)} />
          <Axes X={XL} Y={YL} x0={0} x1={7} y0={0} y1={2.2} xt={[0, 1, 2, 3, 4, 5, 6, 7]} yt={[0, [1, '목표 1', C.accent], 2]} />
          <Ref X={XL} Y={YL} x0={0} x1={7} v={1} color={C.accent} />
          <Curve pts={P4} X={XL} Y={YL} color={C.orange} p={draw(t, 6.7, 2.2)} op={0.55} width={3} />
          <Curve pts={PD1} X={XL} Y={YL} color={C.blue} p={draw(t, 7.5, 3.5)} />
          {[
            [1, 1.5],
            [2.5, 0.812],
            [3.5, 1.077],
          ].map(([a, b], i) => (
            <circle key={i} cx={XL(a)} cy={YL(b)} r={7} fill={C.blue} opacity={prog(t, 8 + i * 0.9, 0.3)} />
          ))}
          <text x={28} y={390} fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 10)}>
            PD 의 꼭짓점 1.5 → 0.81 → 1.08 → 목표 1 에 자리 잡음
          </text>
        </svg>
      </Card>
      <Card x={976} y={215} w={880} h={400} at={12.5}>
        <svg width={880} height={400}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            Δt = 0.01 초 · Kp = 4 · Kd 비교
          </text>
          <text x={850} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Key x={28} y={76} color={C.orange} label="Kd = 1" op={prog(t, 12.7)} />
          <Key x={200} y={76} color={C.purple} label="Kd = 10" op={prog(t, 14.5)} />
          <Key x={372} y={76} color={C.green} label="Kd = 4" op={prog(t, 18.6)} />
          <Axes X={XR} Y={YR} x0={0} x1={6} y0={0} y1={1.6} xt={[0, 1, 2, 3, 4, 5, 6]} yt={[0, 0.5, [1, '목표 1', C.accent], 1.5]} />
          <Ref X={XR} Y={YR} x0={0} x1={6} v={1} color={C.accent} />
          <Curve pts={KD1} X={XR} Y={YR} color={C.orange} p={draw(t, 12.8, 2.4)} />
          <Curve pts={KD10} X={XR} Y={YR} color={C.purple} p={draw(t, 14.6, 2.4)} />
          <Curve pts={KD4} X={XR} Y={YR} color={C.green} p={draw(t, 18.7, 2.4)} width={5} />
          <circle cx={XR(2.4)} cy={YR(0.95)} r={7} fill={C.green} opacity={prog(t, 20.4, 0.3)} />
          <text x={XR(1.6)} y={YR(1.44) - 14} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 14)}>
            1.44
          </text>
          <text x={850} y={YR(0.91) + 32} textAnchor="end" fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16.8)}>
            0.91
          </text>
        </svg>
      </Card>
      <Box x={64} y={640} w={880} h={240} at={12.8}>
        <Table
          head={['Kd', '가장 멀리 간 위치', '6 초 뒤 위치', '움직임']}
          widths={[80, 190, 150, 400]}
          sans={[3]}
          rows={[
            ['1', '1.44', '0.98', '넘쳤다가 흔들리며 들어옴'],
            ['4', '1.00', '1.00', '넘치지 않음 · 2.4 초에 0.95'],
            ['10', '0.91', '0.91', '넘치지 않지만 아주 느림'],
          ]}
          at={13}
          rowAt={[13.2, 18.8, 15]}
          hl={[{ row: 1, from: 18.8, to: 30, color: C.green }]}
        />
      </Box>
      <Box x={976} y={640} w={880} h={240} at={18.6} gap={10} color={`${C.green}88`} title={<Head size={26} color={C.green}>critical damping · 넘치지 않는 가장 빠른 Kd</Head>}>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 19.3) }}>Kd = 2√(Kp × m) = 2√(4 × 1) = 4</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 23.6) }}>gripper 로 질량 × 4 → 2√(4 × 4) = 8, Kd 두 배</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 25.2) }}>부하가 바뀌었는데 예전 gain 을 그대로 쓰면 팔이 떨린다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 계산 주기와 gain ----------

function Dt() {
  const t = useSec()
  const X = scale(90, 620, 0, 3)
  const Y = scale(640, 180, -4.6, 4.6)
  const pr = draw(t, 19.2, 5.2)
  const marks: [number, number, 'up' | 'down' | 'right'][] = [
    [0.5, 1, 'up'],
    [1, 0, 'down'],
    [1.5, 2, 'up'],
    [2, -1, 'down'],
    [2.5, 4, 'up'],
    [3, -4, 'right'],
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', gap: 16 }}>
        <Chip at={0.4}>Δt = controller 가 힘을 다시 정하기까지 걸리는 시간</Chip>
        <Chip at={3.4} color={C.orange} mono>
          Kp = 4 · Kd = 4 · Δt = 0.5 초
        </Chip>
      </div>
      <Card x={64} y={215} w={1060} h={310} at={3.6}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
          <Head size={26} color={C.orange}>
            PD 표 · Δt = 0.5 초 · 목표 1 m · 1 kg
          </Head>
          <Table
            head={['step', '위치', '속도', 'P 항 4e', 'D 항 −4v', '힘', '새 속도', '새 위치']}
            widths={[90, 100, 100, 140, 150, 110, 140, 140]}
            rows={[
              ['0', '0', '0', '4', '0', '4', '2', '1'],
              ['1', '1', '2', '0', '−8', '−8', '−2', '0'],
              ['2', '0', '−2', '4', '8', '12', '4', '2'],
              ['3', '2', '4', '−4', '−16', '−20', '−6', '−1'],
            ]}
            at={3.9}
            rowAt={[4.2, 6.7, 12.9, 14.6]}
            hl={[
              { row: 1, from: 6.7, to: 12.5, color: C.orange },
              { row: 2, from: 12.9, to: 19, color: C.red },
              { row: 3, from: 14.6, to: 19, color: C.red },
            ]}
          />
        </div>
      </Card>
      <Box x={64} y={545} w={1060} h={335} at={6.8} color={`${C.red}88`} title={<Head size={26} color={C.red}>step 1 의 브레이크</Head>}>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 7.1) }}>D 항 = −Kd × v = −4 × 2 = −8 N</span>
        <span style={{ ...mono(C.text, 26), opacity: prog(t, 8.9) }}>0.5 초 동안 유지 → 속도 변화 −8 × 0.5 = −4</span>
        <span style={{ ...line(C.text, 26), opacity: prog(t, 10.6) }}>새 속도 = 2 − 4 = −2 · 0 에서 멈추지 못하고 뒤집힘</span>
        <Flow steps={['속도 2', '−2', '4', '−6']} color={C.red} at={12.9} gap={0.7} last="→ 끝없이 커지는 발산" />
      </Box>
      <Card x={1156} y={140} w={700} h={740} at={0.6}>
        <svg width={700} height={740}>
          <text x={28} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            위치 x (m) · 같은 gain, 두 Δt
          </text>
          <Key x={28} y={84} color={C.green} label="Δt = 0.01 초" />
          <Key x={300} y={84} color={C.red} label="Δt = 0.5 초" op={prog(t, 19)} />
          <Axes X={X} Y={Y} x0={0} x1={3} y0={-4.6} y1={4.6} xt={[0, 0.5, 1, 1.5, 2, 2.5, 3]} yt={[-4, -2, 0, [1, '목표 1', C.accent], 2, 4]} />
          <line x1={X(0)} x2={X(3)} y1={Y(0)} y2={Y(0)} stroke={C.cardEdge} strokeWidth={1.5} />
          <Ref X={X} Y={Y} x0={0} x1={3} v={1} color={C.accent} />
          <text x={620} y={700} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Curve pts={DT_FINE} X={X} Y={Y} color={C.green} p={draw(t, 0.9, 3)} />
          <Curve pts={DT_COARSE} X={X} Y={Y} color={C.red} p={pr} />
          {marks.map(([a, b, dir], i) => {
            const on = pr * 3 >= a - 0.01 ? 1 : 0
            const tx = dir === 'right' ? X(a) + 12 : X(a)
            const ty = dir === 'up' ? Y(b) - 16 : dir === 'down' ? Y(b) + 30 : Y(b) + 8
            return (
              <g key={i} opacity={on}>
                <circle cx={X(a)} cy={Y(b)} r={6} fill={C.red} />
                <text x={tx} y={ty} textAnchor={dir === 'right' ? 'start' : 'middle'} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {String(b).replace('-', '−')}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Ratio() {
  const t = useSec()
  const rows: [string, string, string, number, string, string, number][] = [
    ['4', '0.5 초', '4 × 0.5 = 2', 2, '200% · 발산', C.red, 6.8],
    ['4', '0.01 초', '4 × 0.01 = 0.04', 0.04, '4% · 매끄럽게', C.green, 9.2],
    ['40', '0.01 초', '40 × 0.01 = 0.4', 0.4, '40% · 아직 괜찮음', C.green, 12.8],
    ['40', '0.05 초', '40 × 0.05 = 2', 2, '200% · 발산', C.red, 15.2],
  ]
  const W = [80, 140, 240, 260, 240]
  const BAR = 260
  const MAX = 2.2
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={170} at={0.4}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 14 }}>
          <span style={{ ...mono(C.accent, 40), whiteSpace: 'normal' }}>D 항이 한 step 에 줄이는 비율 = Kd × Δt ÷ m</span>
          <span style={{ ...line(C.muted, 26), opacity: prog(t, 2.5) }}>1 보다 작으면 속도가 줄어들고, 1 을 넘으면 0 에서 멈추지 못하고 반대로 뒤집는다</span>
        </div>
      </Box>
      <Card x={64} y={330} w={1100} h={360} at={6.5}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 12 }}>
          <Head size={26}>Kd · Δt 와 비율 (m = 1 kg)</Head>
          <div style={{ display: 'flex', gap: 16, color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 4 }}>
            {['Kd', 'Δt', 'Kd × Δt ÷ m', '비율 막대 (1 = 경계)', '결과'].map((h, i) => (
              <span key={h} style={{ width: W[i], whiteSpace: 'nowrap', lineHeight: 1.45 }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([kd, dt, calc, r, res, color, at]) => (
            <div key={calc} style={{ display: 'flex', gap: 16, alignItems: 'center', height: 44, opacity: prog(t, at) }}>
              <span style={{ ...mono(C.text, 24), width: W[0] }}>{kd}</span>
              <span style={{ ...mono(C.text, 24), width: W[1] }}>{dt}</span>
              <span style={{ ...mono(color, 24), width: W[2] }}>{calc}</span>
              <div style={{ position: 'relative', width: BAR, height: 26, borderRadius: 6, background: C.grid }}>
                <div style={{ width: `${(100 * Math.min(r, MAX) * prog(t, at + 0.2, 0.9)) / MAX}%`, minWidth: 4, height: '100%', borderRadius: 6, background: color }} />
                <div style={{ position: 'absolute', left: (BAR * 1) / MAX - 1, top: -6, width: 3, height: 38, background: C.text, opacity: 0.8 }} />
              </div>
              <span style={{ ...line(color, 24), fontWeight: 600, width: W[4], whiteSpace: 'nowrap' }}>{res}</span>
            </div>
          ))}
        </div>
      </Card>
      <Box x={1196} y={330} w={660} h={360} at={18} color={`${C.orange}88`} title={<Head size={26} color={C.orange}>gain 과 주기는 함께 정한다</Head>}>
        <span style={{ ...mono(C.orange, 28), opacity: prog(t, 18.3) }}>gain × 10 → Δt ÷ 10</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 20.2) }}>무거운 팔을 단단히 붙잡는 큰 gain 은 짧은 주기에서만 안정하다</span>
        <span style={{ ...line(C.accent, 24), opacity: prog(t, 22) }}>→ 관절의 저수준 controller 는 1초에 수백 ~ 수천 번 계산한다</span>
      </Box>
      <Box x={64} y={710} w={1792} h={170} at={24} gap={10} color={`${C.purple}88`}>
        <span style={{ ...line(C.purple, 26), fontWeight: 600 }}>주기도 일정해야 한다 · I 항은 오차 × Δt 를 쌓고, D 항은 오차의 차이 ÷ Δt 로 계산한다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 25.8) }}>loop 가 들쭉날쭉하면 같은 gain 이라도 두 항의 크기가 매번 달라진다 → 일정한 주기의 timer 로 돌리거나, 실제로 지난 시간을 재서 Δt 로 쓴다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- I 항과 windup ----------

function Integral() {
  const t = useSec()
  // the tilted rail (schematic): s metres along the rail → svg point
  const A: Pt = [60, 280]
  const len = Math.hypot(640, 90)
  const u: Pt = [640 / len, -90 / len]
  const n: Pt = [u[1], -u[0]] // perpendicular to the rail, pointing up
  const at = (s: number, off = 0): Pt => [A[0] + u[0] * (60 + s * 440) + n[0] * off, A[1] + u[1] * (60 + s * 440) + n[1] * off]
  const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI
  const s = prog(t, 0.8, 3.6) * 0.5
  const c = at(s, 24)
  const S: Pt = [c[0] + n[0] * 44, c[1] + n[1] * 44]
  const end = at(1.2)
  const XR = scale(80, 970, 0, 12)
  const YR = scale(340, 100, 0, 1.4)
  const PX = 160
  const PY = 110
  const L = 120
  const arm = (deg: number): Pt => [PX + L * Math.sin((deg * Math.PI) / 180), PY + L * Math.cos((deg * Math.PI) / 180)]
  const ja = prog(t, 24.3)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={760} h={400} at={0.4}>
        <svg width={760} height={400}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            기울어진 레일 · PD (Kp = 4, Kd = 1)
          </text>
          <text x={732} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <polygon points={`${A[0]},${A[1]} ${end[0]},${end[1]} ${end[0]},${A[1]}`} fill={C.grid} />
          <line x1={A[0]} y1={A[1]} x2={end[0]} y2={end[1]} stroke={C.muted} strokeWidth={4} />
          <g opacity={prog(t, 12.6)}>
            <line x1={at(0.5, -8)[0]} y1={at(0.5, -8)[1]} x2={at(1, -8)[0]} y2={at(1, -8)[1]} stroke={C.accent} strokeWidth={5} strokeLinecap="round" />
            <text x={at(0.75, -56)[0]} y={at(0.75, -56)[1]} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
              오차 0.5 m
            </text>
          </g>
          {[
            [0, '0'],
            [0.5, '0.5'],
            [1, '1 m'],
          ].map(([v, lab]) => {
            const p0 = at(v as number)
            const p1 = at(v as number, -12)
            const pl = at(v as number, -34)
            return (
              <g key={lab as string}>
                <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={C.muted} strokeWidth={2} />
                <text x={pl[0]} y={pl[1]} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                  {lab}
                </text>
              </g>
            )
          })}
          <line x1={at(1)[0]} y1={at(1)[1]} x2={at(1, 100)[0]} y2={at(1, 100)[1]} stroke={C.accent} strokeWidth={2} strokeDasharray="6 5" />
          <text x={at(1, 116)[0]} y={at(1, 116)[1]} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
            목표 1 m
          </text>
          <g transform={`translate(${c[0]},${c[1]}) rotate(${ang})`}>
            <rect x={-48} y={-22} width={96} height={44} rx={8} fill={C.blue} opacity={0.85} />
          </g>
          <g opacity={prog(t, 0.6)}>{arrow(S[0], S[1], S[0] - u[0] * 100, S[1] - u[1] * 100, C.red, 4)}</g>
          <text x={240} y={150} textAnchor="end" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 0.8)}>
            gravity 2 N
          </text>
          <g opacity={prog(t, 6.8)}>
            {arrow(S[0], S[1], S[0] + u[0] * 100, S[1] + u[1] * 100, C.orange, 4)}
            <text x={420} y={140} fill={C.orange} fontSize={22} fontWeight={600}>
              P 항 2 N
            </text>
          </g>
          <text x={28} y={350} fill={C.orange} fontSize={22} fontWeight={600} opacity={prog(t, 7.2)}>
            P 항 = 4 × 오차 0.5 = 2 N 이 gravity 2 N 과 맞아 멈춤
          </text>
          <text x={28} y={382} fill={C.muted} fontSize={22} opacity={prog(t, 10)}>
            카트가 멈췄으니 D 항 = 0 · 아무도 더 밀지 않는다
          </text>
        </svg>
      </Card>
      <Card x={856} y={140} w={1000} h={400} at={0.6}>
        <svg width={1000} height={400}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            위치 x (m) · 기울어진 레일
          </text>
          <text x={970} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Key x={28} y={76} color={C.blue} label="PD (Kp = 4, Kd = 1)" />
          <Key x={330} y={76} color={C.green} label="PID (+ Ki = 2)" op={prog(t, 18.6)} />
          <Axes X={XR} Y={YR} x0={0} x1={12} y0={0} y1={1.4} xt={[0, 2, 4, 6, 8, 10, 12]} yt={[0, 0.5, [1, '목표 1', C.accent]]} />
          <Ref X={XR} Y={YR} x0={0} x1={12} v={1} color={C.accent} />
          <Curve pts={RAIL_PD} X={XR} Y={YR} color={C.blue} p={draw(t, 0.9, 4.5)} />
          <Curve pts={RAIL_PID} X={XR} Y={YR} color={C.green} p={draw(t, 18.7, 4)} />
          <text x={970} y={YR(0.5) - 14} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600} opacity={prog(t, 5)}>
            0.5 에서 멈춤
          </text>
          <text x={XR(1)} y={YR(1.19) - 14} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 19.6)}>
            1.19
          </text>
        </svg>
      </Card>
      <Box x={64} y={560} w={760} h={320} at={12.5} gap={12} color={`${C.blue}88`} title={<Head size={26} color={C.blue}>steady-state error</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 12.8) }}>멈춘 뒤에도 남는 오차 = 당기는 힘 ÷ Kp</span>
        <span style={{ ...mono(C.accent, 28), opacity: prog(t, 14) }}>2 ÷ 4 = 0.5 m</span>
        <span style={{ ...line(C.muted, 24), opacity: prog(t, 16) }}>Kp 를 키우면 줄어들지만 0 이 되지는 않는다</span>
        <span style={{ ...line(C.green, 24), fontWeight: 600, opacity: prog(t, 18.7) }}>I 항 = Ki × 쌓인 오차 · 남은 오차만큼 계속 커진다</span>
      </Box>
      <Card x={856} y={560} w={1000} h={320} at={24}>
        <svg width={1000} height={320}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            로봇 팔 관절 · 길이 0.5 m 팔 끝에 1 kg
          </text>
          <g opacity={ja}>
            <line x1={PX} y1={PY} x2={arm(0)[0]} y2={arm(0)[1]} stroke={C.dim} strokeWidth={5} strokeLinecap="round" />
            <line x1={PX} y1={PY} x2={arm(30)[0]} y2={arm(30)[1]} stroke={C.muted} strokeWidth={5} strokeLinecap="round" />
            <line x1={PX} y1={PY} x2={arm(90)[0]} y2={arm(90)[1]} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
            <circle cx={arm(0)[0]} cy={arm(0)[1]} r={13} fill={C.dim} />
            <circle cx={arm(30)[0]} cy={arm(30)[1]} r={13} fill={C.muted} />
            <circle cx={arm(90)[0]} cy={arm(90)[1]} r={13} fill={C.orange} />
            <circle cx={PX} cy={PY} r={9} fill={C.bg} stroke={C.text} strokeWidth={3} />
            <text x={arm(0)[0]} y={arm(0)[1] + 38} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              0°
            </text>
            <text x={arm(30)[0]} y={arm(30)[1] + 36} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              30°
            </text>
            <text x={arm(90)[0]} y={arm(90)[1] - 22} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              90°
            </text>
            {arrow(arm(90)[0], arm(90)[1] + 14, arm(90)[0], arm(90)[1] + 80, C.red, 3)}
            <text x={arm(90)[0] + 12} y={arm(90)[1] + 66} fill={C.red} fontSize={20} fontFamily={MONO}>
              9.81 N
            </text>
          </g>
          {[
            ['팔의 각도', ['0°', '30°', '90°'], C.muted, 100, 24.6],
            ['수평 거리 (m)', ['0', '0.25', '0.5'], C.text, 150, 25.4],
            ['torque (N·m)', ['0', '2.45', '4.905'], C.orange, 200, 26.2],
          ].map(([lab, vals, color, y, a]) => (
            <g key={lab as string} opacity={prog(t, a as number)}>
              <text x={380} y={y as number} fill={C.muted} fontSize={20}>
                {lab as string}
              </text>
              {(vals as string[]).map((v, i) => (
                <text key={i} x={[620, 750, 890][i]} y={y as number} textAnchor="middle" fill={color as string} fontSize={24} fontFamily={MONO} fontWeight={600}>
                  {v}
                </text>
              ))}
            </g>
          ))}
          <text x={380} y={256} fill={C.text} fontSize={22} opacity={prog(t, 27)}>
            90° 에서 9.81 × 0.5 = 4.905 N·m 로 가장 크다
          </text>
          <text x={380} y={292} fill={C.muted} fontSize={22} opacity={prog(t, 27.8)}>
            팔을 수평으로 뻗을수록 어깨 motor 가 더 큰 torque 를 낸다
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Windup() {
  const t = useSec()
  const X = scale(100, 1060, 0, 15)
  const Y1 = scale(366, 126, 0, 8)
  const Y2 = scale(620, 420, 0, 12)
  const pOn = draw(t, 7, 10)
  const pOff = draw(t, 19.2, 5)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', gap: 16 }}>
        <Chip at={0.5} color={C.orange}>
          saturation: 10 N 을 계산해도 최대가 3 N 이면 3 N 만 나온다
        </Chip>
        <Chip at={6.6} color={C.muted} mono>
          Kp 4 · Kd 3 · Ki 1 · 한계 3 N · gravity 2 N · Δt 0.01 초
        </Chip>
      </div>
      <Card x={64} y={215} w={1100} h={665} at={6.6}>
        <svg width={1100} height={665}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            목표 5 m 로 보낸 카트 · 가로축 t (초)
          </text>
          <Key x={28} y={78} color={C.red} label="integral 을 계속 쌓음" />
          <Key x={380} y={78} color={C.green} label="한계에 걸린 동안 멈춤 (anti-windup)" op={prog(t, 19)} />
          <rect x={X(0)} y={126} width={X(3) - X(0)} height={494} fill={`${C.orange}1a`} opacity={prog(t, 7.2)} />
          <g opacity={prog(t, 7.4)}>
            <text x={X(1.5)} y={150} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              한계 3 N
            </text>
            <text x={X(1.5)} y={176} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              처음 3 초
            </text>
          </g>
          <text x={100} y={112} fill={C.muted} fontSize={20}>
            위치 x (m)
          </text>
          <text x={100} y={404} fill={C.muted} fontSize={20}>
            I 항이 내는 힘 (N)
          </text>
          <Axes X={X} Y={Y1} x0={0} x1={15} y0={0} y1={8} yt={[0, 2, 4, [5, '목표 5', C.accent], 6, 8]} />
          <Ref X={X} Y={Y1} x0={0} x1={15} v={5} color={C.accent} />
          <Axes X={X} Y={Y2} x0={0} x1={15} y0={0} y1={12} xt={[0, 3, 6, 9, 12, 15]} yt={[0, 4, 8, 12]} />
          <Curve pts={WU_X_ON} X={X} Y={Y1} color={C.red} p={pOn} />
          <Curve pts={WU_I_ON} X={X} Y={Y2} color={C.red} p={pOn} />
          <Curve pts={WU_X_OFF} X={X} Y={Y1} color={C.green} p={pOff} />
          <Curve pts={WU_I_OFF} X={X} Y={Y2} color={C.green} p={pOff} />
          <text x={320} y={430} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 13)}>
            최고 10.5 N
          </text>
          <text x={400} y={142} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 14.5)}>
            최고 7.02 m · 2.02 m 넘침
          </text>
          <text x={1060} y={Y1(5) + 30} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 23.4)}>
            넘치지 않음
          </text>
          <text x={1060} y={Y2(2) - 14} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 23.8)}>
            2 N 이하
          </text>
        </svg>
      </Card>
      <Box x={1196} y={215} w={660} h={300} at={12.6} gap={10} color={`${C.red}88`} title={<Head size={26} color={C.red}>integral 을 계속 쌓음</Head>}>
        {[
          ['목표에 도착할 때 I 항 10.5 N', 12.9],
          ['gravity 에 필요한 2 N 보다 8.5 N 더 민다', 14.2],
          ['3 m/s 로 지나 7.02 m 까지 · 2.02 m 넘침', 15.5],
          ['목표 ±2% 안에 드는 데 14.0 초', 17],
        ].map(([s, a]) => (
          <span key={s as string} style={{ ...line(C.text, 24), opacity: prog(t, a as number) }}>
            {s as string}
          </span>
        ))}
      </Box>
      <Box x={1196} y={535} w={660} h={300} at={19.2} gap={10} color={`${C.green}88`} title={<Head size={26} color={C.green}>anti-windup · 한계 동안 쌓기 멈춤</Head>}>
        {[
          ['I 항이 2 N 을 넘지 않는다', 19.5],
          ['5 m 를 넘지 않는다', 21],
          ['목표 ±2% 안에 드는 데 4.1 초', 22.5],
          ['쌓인 값을 정해 둔 범위 안으로 자르는 방법도 있다', 24],
        ].map(([s, a]) => (
          <span key={s as string} style={{ ...line(C.text, 24), opacity: prog(t, a as number) }}>
            {s as string}
          </span>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

// ---------- feedforward 와 policy ----------

function Feedforward() {
  const t = useSec()
  const X = scale(80, 720, 0, 8)
  const Y = scale(330, 100, 0, 1.6)
  const XA = scale(90, 400, 0, 1)
  const YA = scale(330, 120, 0, 90)
  const XV = scale(540, 850, 0, 1)
  const YV = scale(330, 120, 0, 180)
  const pc = draw(t, 18.8, 1.6)
  const pm = draw(t, 19.2, 2.4)
  const CONST_A: Pt[] = [
    [0, 0],
    [1, 90],
  ]
  const CONST_V: Pt[] = [
    [0, 0],
    [0.0001, 90],
    [0.9999, 90],
    [1, 0],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={420} at={0.4}>
        <svg width={880} height={420}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            기울어진 레일 2 N · PD (Kp = 4, Kd = 1)
          </text>
          <text x={850} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
            t (초)
          </text>
          <Key x={28} y={76} color={C.blue} label="PD" />
          <Key x={150} y={76} color={C.green} label="PD + feedforward 2 N" op={prog(t, 6.2)} />
          <Key x={470} y={76} color={C.purple} label="실제 2.5 N 에 2 N 만 더함" op={prog(t, 9.4)} />
          <Axes X={X} Y={Y} x0={0} x1={8} y0={0} y1={1.6} xt={[0, 1, 2, 3, 4, 5, 6, 7, 8]} yt={[0, 0.5, 1, 1.5]} />
          <Ref X={X} Y={Y} x0={0} x1={8} v={1} color={C.accent} />
          <Curve pts={FF_PD} X={X} Y={Y} color={C.blue} p={draw(t, 0.6, 3)} />
          <Curve pts={FF_2} X={X} Y={Y} color={C.green} p={draw(t, 6.3, 2.8)} />
          <Curve pts={FF_25} X={X} Y={Y} color={C.purple} p={draw(t, 9.5, 2.6)} />
          <text x={732} y={Y(1) - 6} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9)}>
            1
          </text>
          <text x={732} y={Y(0.875) + 24} fill={C.purple} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 12)}>
            0.875
          </text>
          <text x={732} y={Y(0.5) + 8} fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 3.6)}>
            0.5
          </text>
          <text x={28} y={398} fill={C.purple} fontSize={22} fontWeight={600} opacity={prog(t, 11)}>
            남는 0.5 N → 0.5 ÷ 4 = 0.125 모자란 0.875 에 멈춤
          </text>
        </svg>
      </Card>
      <Box x={64} y={580} w={880} h={300} at={12.5} gap={12} color={`${C.orange}88`} title={<Head size={26} color={C.orange}>gravity feedforward · 회전하는 관절</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 12.8) }}>Kp = 50 인 PD 만 쓰면 90° 에서 4.905 ÷ 50 ≈ 0.098 rad ≈ 5.6° 가 남는다</span>
        <span style={{ ...line(C.orange, 24), fontWeight: 600, opacity: prog(t, 14.6) }}>목표 90° 면 4.905 N·m, 30° 면 2.45 N·m 를 미리 더한다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 16.4) }}>→ 5.6° 오차가 사라진다 · gripper 무게가 model 에 빠지면 그만큼 처진다</span>
      </Box>
      <Card x={976} y={140} w={880} h={420} at={18.5}>
        <svg width={880} height={420}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            0° → 90° 를 1 초에 · minimum-jerk 목표
          </text>
          <Key x={28} y={76} color={C.green} label="minimum-jerk" />
          <Key x={260} y={76} color={C.orange} label="일정한 속도" />
          <text x={90} y={110} fill={C.muted} fontSize={20}>
            각도 (°)
          </text>
          <text x={540} y={110} fill={C.muted} fontSize={20}>
            각속도 (°/s)
          </text>
          <Axes X={XA} Y={YA} x0={0} x1={1} y0={0} y1={90} xt={[0, 0.5, 1]} yt={[0, 45, 90]} />
          <Axes X={XV} Y={YV} x0={0} x1={1} y0={0} y1={180} xt={[0, 0.5, 1]} yt={[0, 90, [168.75, '168.75', C.green]]} />
          <Curve pts={CONST_A} X={XA} Y={YA} color={C.orange} p={pc} width={3} />
          <Curve pts={CONST_V} X={XV} Y={YV} color={C.orange} p={pc} width={3} />
          <Curve pts={MJ_ANGLE} X={XA} Y={YA} color={C.green} p={pm} />
          <Curve pts={MJ_SPEED} X={XV} Y={YV} color={C.green} p={pm} />
          <g opacity={prog(t, 21)}>
            <circle cx={XA(0.5)} cy={YA(45)} r={7} fill={C.green} />
            <text x={262} y={YA(25)} fill={C.green} fontSize={20} fontWeight={600}>
              0.5 초에 45°
            </text>
            <circle cx={XV(0.5)} cy={YV(168.75)} r={7} fill={C.green} />
          </g>
          <text x={28} y={398} fill={C.text} fontSize={22} opacity={prog(t, 22.4)}>
            출발 · 도착의 속도와 가속도 0 · 최고 각속도는 90 °/s 의 약 1.9 배
          </text>
        </svg>
      </Card>
      <Box x={976} y={580} w={880} h={300} at={24.5} gap={12} color={`${C.green}88`} title={<Head size={26} color={C.green}>minimum-jerk 로 2 초 동안 0 → 1 · 기울어진 레일</Head>}>
        <Table
          head={['방법', '움직이는 동안 최대 오차', '4 초 뒤 위치']}
          widths={[340, 280, 160]}
          rows={[
            ['PD', '0.50', '0.52'],
            ['PD + gravity 2 N', '0.15', '1.01'],
            ['+ 목표 가속도에 필요한 힘', '0.003', '1.00'],
          ]}
          at={24.8}
          step={0.7}
          hl={[{ row: 2, from: 27.4, to: 31, color: C.green }]}
        />
      </Box>
    </AbsoluteFill>
  )
}

function Policy() {
  const t = useSec()
  const T0 = 220
  const PX = 8.4 // px per ms
  const pidN = Math.round(100 * draw(t, 7.2, 4))
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1100} h={480} at={0.4}>
        <svg width={1100} height={480}>
          <g opacity={prog(t, 0.5)}>
            <rect x={40} y={40} width={1020} height={110} rx={16} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={1.5} />
            <text x={68} y={86} fill={C.blue} fontSize={28} fontWeight={700}>
              VLA policy
            </text>
            <text x={1032} y={86} textAnchor="end" fill={C.blue} fontSize={22} fontWeight={600}>
              1초에 10 ~ 50 번 · 예: 30 Hz
            </text>
            <text x={68} y={128} fill={C.text} fontSize={22}>
              카메라 영상과 지시문을 보고 관절마다 다음 목표 각도를 낸다
            </text>
          </g>
          <g opacity={prog(t, 2.4)}>
            {arrow(550, 150, 550, 204, C.muted, 3)}
            <rect x={40} y={210} width={1020} height={110} rx={16} fill={`${C.green}14`} stroke={C.green} strokeWidth={1.5} />
            <text x={68} y={256} fill={C.green} fontSize={28} fontWeight={700}>
              PID
            </text>
            <text x={1032} y={256} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              1초에 수백 ~ 수천 번 · 예: 1000 Hz
            </text>
            <text x={68} y={298} fill={C.text} fontSize={22}>
              받은 목표 각도를 따라가게 motor 를 움직인다
            </text>
          </g>
          <g opacity={prog(t, 4)}>
            {arrow(550, 320, 550, 374, C.muted, 3)}
            <rect x={40} y={380} width={1020} height={70} rx={16} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={1.5} />
            <text x={68} y={424} fill={C.orange} fontSize={26} fontWeight={700}>
              motor → joint
            </text>
            <text x={1032} y={424} textAnchor="end" fill={C.muted} fontSize={22}>
              돌아간 각도를 다시 재서 오차를 계산한다
            </text>
          </g>
        </svg>
      </Card>
      <Card x={64} y={640} w={1100} h={240} at={6.6}>
        <svg width={1100} height={240}>
          <text x={28} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            0 ~ 100 ms 동안 계산하는 시점
          </text>
          <text x={28} y={108} fill={C.blue} fontSize={22} fontWeight={600}>
            policy 30 Hz
          </text>
          <text x={28} y={172} fill={C.green} fontSize={22} fontWeight={600}>
            PID 1000 Hz
          </text>
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={T0 + k * 280} x2={T0 + k * 280} y1={82} y2={118} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
          ))}
          <text x={T0 + 140} y={72} textAnchor="middle" fill={C.blue} fontSize={20} fontFamily={MONO} opacity={prog(t, 7)}>
            33 ms
          </text>
          {Array.from({ length: pidN + 1 }, (_, i) => (
            <line key={i} x1={T0 + i * PX} x2={T0 + i * PX} y1={152} y2={178} stroke={C.green} strokeWidth={2} />
          ))}
          <g opacity={prog(t, 10.6)}>
            <line x1={T0} x2={T0 + 280} y1={194} y2={194} stroke={C.green} strokeWidth={2} />
            <line x1={T0} x2={T0} y1={188} y2={200} stroke={C.green} strokeWidth={2} />
            <line x1={T0 + 280} x2={T0 + 280} y1={188} y2={200} stroke={C.green} strokeWidth={2} />
            <text x={T0 + 140} y={222} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              약 33 번
            </text>
          </g>
        </svg>
      </Card>
      <Box x={1196} y={140} w={660} h={400} at={13} gap={14} color={`${C.orange}88`} title={<Head size={26} color={C.orange}>아래층을 자주 계산하는 이유</Head>}>
        {[
          ['안정성', '큰 gain 은 짧은 주기에서만 안정하다', 13.3],
          ['빠르게 바뀌는 힘', 'gravity torque 는 각도에 따라, 접촉 힘은 ms 단위로 변한다 · 33 ms 를 기다리면 팔이 처지거나 튕긴다', 15.2],
          ['역할 분담', 'policy 는 어디로 갈지만 정하고, gravity 버티기와 흔들림 줄이기는 PID 와 feedforward 가 맡는다', 17.2],
        ].map(([k, s, a]) => (
          <span key={k as string} style={{ ...line(C.text, 22), opacity: prog(t, a as number) }}>
            <b style={{ color: C.orange }}>{k as string}</b> · {s as string}
          </span>
        ))}
      </Box>
      <Box x={1196} y={560} w={660} h={320} at={19.5} gap={10} color={`${C.green}88`} title={<Head size={26} color={C.green}>예: SO-101 · servo STS3215</Head>}>
        {[
          ['servo 안에서 position PID 가 각도를 목표에 맞춘다', 19.8],
          ['LeRobot 은 팔을 연결할 때 P · I · D 계수를 servo 에 써 넣는다', 21.6],
          ['VLA 가 낸 행동도 목표 각도로 servo 에 전달되어 이 PID 를 거친다', 23.4],
        ].map(([s, a]) => (
          <span key={s as string} style={{ ...line(C.text, 22), opacity: prog(t, a as number) }}>
            {s as string}
          </span>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'P 만 쓰면 0 ↔ 2 진동 · overshoot 100% → D 항 · Kd = 2√(Kp × m) = 4', at: 1 },
    { tag: script.sections[1], color: C.blue, text: 'Kd × Δt ÷ m > 1 이면 발산 · 4 × 0.5 = 2 → 발산 · 4 × 0.01 = 0.04 → 매끄럽게', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'gravity 2 N → 0.5 m 에 멈춤 · Ki 2 → 1 m · windup 7.02 m, anti-windup 은 넘침 없음', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'feedforward 로 최대 오차 0.50 → 0.15 → 0.003 · policy 30 Hz 아래 PID 1000 Hz', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            명령도 맞고 motor 도 멀쩡한데 왜 정확히 30° 에서 서지 못할까?
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
            NEXT · KINEMATICS
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Inverse Kinematics</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            손끝을 물체 위치에 두려면 관절마다 몇 도가 되어야 하는지 구하는 계산
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/pid-control (Åström & Murray · Flash & Hogan)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseKd = () => <PauseWrite question="Kp = 9 이고 질량이 1 kg 이다. 넘치지 않으면서 가장 빠른 Kd 는?" answer="critical damping: Kd = 2√(Kp × m) = 2√(9 × 1) = 2 × 3 = 6" />

const PauseDt = () => (
  <PauseWrite
    question="Kd = 2, m = 1, Δt = 0.1 이면 D 항은 한 step 에 지금 속도의 몇 % 를 줄일까? 발산할까?"
    answer={
      <>
        Kd × Δt ÷ m = 2 × 0.1 ÷ 1 = 0.2 → 20% 를 줄인다
        <br />1 보다 작으므로 속도를 뒤집지 않고 매끄럽게 줄인다
      </>
    }
  />
)

const PauseSteady = () => (
  <PauseWrite
    question="로봇 팔의 관절이 목표보다 늘 2° 아래에서 멈춘다. gain 을 어떻게 바꿔야 할까?"
    answer={
      <>
        gravity 를 P 항 혼자 버티느라 남는 steady-state error → I 항을 더하거나 Ki 를 키운다
        <br />
        gravity feedforward 도 같은 문제를 푼다 · Kd 는 멈춘 상태에서 0 이라 관계없다
      </>
    }
  />
)

const PauseRates = () => (
  <PauseWrite
    question="policy 가 20 Hz, PID 가 500 Hz 로 계산한다. policy 출력 한 번 사이에 PID 는 몇 번 계산할까?"
    answer="policy 는 1 ÷ 20 = 0.05 초마다 · PID 는 1 ÷ 500 = 0.002 초마다 → 0.05 ÷ 0.002 = 25 번"
  />
)

export function PidControl() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        'p-only': POnly,
        pd: PD,
        'pause-kd': PauseKd,
        dt: Dt,
        ratio: Ratio,
        'pause-dt': PauseDt,
        integral: Integral,
        windup: Windup,
        'pause-steady': PauseSteady,
        feedforward: Feedforward,
        policy: Policy,
        'pause-rates': PauseRates,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
