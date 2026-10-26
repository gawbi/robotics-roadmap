import { createContext, useContext, type CSSProperties, type ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { scriptTime, type Warp } from './script'
import { C, FPS, MONO, SANS } from './theme'

/** how a scene was stretched to fit its narration (script.ts fitNarration); none for a scene played as written */
export const SceneWarp = createContext<Warp | null>(null)

/** seconds since the start of the current scene, on the clock its script was written in */
export function useSec() {
  const warp = useContext(SceneWarp)
  const t = useCurrentFrame() / FPS
  return warp ? scriptTime(warp, t) : t
}

const EASE = Easing.bezier(0.2, 0.7, 0.2, 1)

/** 0 before `from`, 1 after `from + dur`, eased in between */
export function prog(t: number, from: number, dur = 0.6): number {
  return interpolate(t, [from, from + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE })
}

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p

/** fades and rises in at `at` seconds, and out at `out` if given */
export function Appear({ at, out, dur = 0.6, dy = 18, style, children }: { at: number; out?: number; dur?: number; dy?: number; style?: CSSProperties; children: ReactNode }) {
  const t = useSec()
  const p = prog(t, at, dur)
  const q = out === undefined ? 1 : 1 - prog(t, out, 0.4)
  return <div style={{ opacity: p * q, transform: `translateY(${(1 - p) * dy}px)`, ...style }}>{children}</div>
}

export function Panel({ x, y, w, h, children, style }: { x: number; y: number; w: number; h: number; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: C.card,
        border: `1.5px solid ${C.cardEdge}`,
        borderRadius: 24,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Label({ children, color = C.muted, size = 26, mono = false, weight = 500, style }: { children: ReactNode; color?: string; size?: number; mono?: boolean; weight?: number; style?: CSSProperties }) {
  return <span style={{ color, fontSize: size, fontFamily: mono ? MONO : SANS, fontWeight: weight, ...style }}>{children}</span>
}

/** "오해 / 사실" box, as the lessons draw it */
export function Misconception({ at, belief, fact }: { at: number; belief: ReactNode; fact: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Row at={at} mark="✕" color={C.red} label="흔한 오해" text={belief} />
      <Row at={at + 1.6} mark="✓" color={C.green} label="사실" text={fact} />
    </div>
  )
}

function Row({ at, mark, color, label, text }: { at: number; mark: string; color: string; label: string; text: ReactNode }) {
  return (
    <Appear at={at}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '22px 28px', borderRadius: 18, background: `${color}14`, border: `1.5px solid ${color}55` }}>
        <span style={{ color, fontSize: 40, lineHeight: '48px', fontWeight: 700 }}>{mark}</span>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label color={color} size={22} weight={600}>
            {label}
          </Label>
          <Label color={C.text} size={34} weight={500} style={{ lineHeight: 1.45, textWrap: 'balance' }}>
            {text}
          </Label>
        </div>
      </div>
    </Appear>
  )
}

/** the faint dotted field every scene sits on */
export function Backdrop() {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 700px at 70% 30%, #0f1b30 0%, ${C.bg} 60%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.grid} 1.5px, transparent 1.5px)`,
          backgroundSize: '48px 48px',
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  )
}

/**
 * "멈추고 적어 보기": a question, a countdown to write the answer on paper, then the answer. The scene's script reads the
 * question at 0.3 s and the answer at `reveal`.
 */
export function PauseWrite({ question, answer, from = 4.5, reveal = 16.5 }: { question: ReactNode; answer: ReactNode; from?: number; reveal?: number }) {
  const t = useSec()
  const total = reveal - from
  const left = Math.max(0, Math.ceil(reveal - t))
  const p = Math.min(1, Math.max(0, (t - from) / total))
  const R = 64
  const shown = prog(t, reveal, 0.6)
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 170, width: 1500, display: 'grid', gap: 34 }}>
        <Appear at={0.2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 46 }}>✎</span>
            <Label mono color={C.accent} size={30} weight={600} style={{ letterSpacing: '0.12em' }}>
              멈추고 적어 보기
            </Label>
          </div>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.4, textWrap: 'balance' }}>{question}</div>
        </Appear>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, minHeight: 200 }}>
          <div style={{ position: 'relative', width: 2 * R + 20, height: 2 * R + 20, opacity: prog(t, from - 0.4) * (1 - shown) }}>
            <svg width={2 * R + 20} height={2 * R + 20}>
              <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke={C.grid} strokeWidth={10} />
              <circle
                cx={R + 10}
                cy={R + 10}
                r={R}
                fill="none"
                stroke={C.accent}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * R}
                strokeDashoffset={2 * Math.PI * R * p}
                transform={`rotate(-90 ${R + 10} ${R + 10})`}
              />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 48, fontWeight: 600 }}>{left}</span>
          </div>
          <div style={{ opacity: prog(t, from) * (1 - shown) }}>
            <Label size={32} color={C.muted}>
              영상을 멈추고 종이에 적어 본 뒤 이어서 보세요
            </Label>
          </div>
          <div style={{ position: 'absolute', left: 210, right: 210, opacity: shown, transform: `translateY(${(1 - shown) * 20}px)` }}>
            <div style={{ padding: '26px 32px', borderRadius: 20, background: `${C.green}14`, border: `1.5px solid ${C.green}66`, display: 'grid', gap: 10 }}>
              <Label color={C.green} size={24} weight={600}>
                답
              </Label>
              <span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.45, textWrap: 'balance' }}>{answer}</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
