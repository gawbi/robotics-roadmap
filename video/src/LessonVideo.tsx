import type { ComponentType } from 'react'
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { Backdrop, prog, SceneWarp } from './kit'
import { cueKey, fitNarration, globalCues, type Narration, type VideoScript } from './script'
import { C, FPS, MONO, SANS } from './theme'

/**
 * Plays a script's scenes back to back, with the lesson's title, its focus sections and the captions over them. With
 * narration (public/audio/<video id>/<scene>-<cue>.wav and their lengths), each line plays at its cue and a scene whose
 * lines run long is slowed to fit them.
 */
export function LessonVideo({ script: written, scenes, narration = {} }: { script: VideoScript; scenes: Record<string, ComponentType>; narration?: Narration }) {
  const { script, warp } = fitNarration(written, narration)
  let from = 0
  return (
    // keep-all: Korean lines break between words, not inside them
    <AbsoluteFill style={{ fontFamily: SANS, color: C.text, wordBreak: 'keep-all' }}>
      <Backdrop />
      {script.scenes.map((s) => {
        const Scene = scenes[s.id]
        const seq = (
          <Sequence key={s.id} from={Math.round(from * FPS)} durationInFrames={Math.round(s.seconds * FPS)} name={s.id}>
            <SceneWarp.Provider value={warp[s.id]}>
              <SceneFade seconds={s.seconds}>
                <Scene />
              </SceneFade>
            </SceneWarp.Provider>
            {s.cues.map(([a], i) =>
              narration[cueKey(s.id, i)] ? (
                <Sequence key={i} from={Math.round(a * FPS)} name={cueKey(s.id, i)}>
                  <Audio src={staticFile(`audio/${script.id}/${cueKey(s.id, i)}.wav`)} />
                </Sequence>
              ) : null,
            )}
          </Sequence>
        )
        from += s.seconds
        return seq
      })}
      <TopBar script={script} />
      <Captions script={script} />
    </AbsoluteFill>
  )
}

function SceneFade({ seconds, children }: { seconds: number; children: React.ReactNode }) {
  const t = useCurrentFrame() / FPS
  const opacity = prog(t, 0, 0.5) * (1 - prog(t, seconds - 0.45, 0.45))
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

/** lesson title on the left, the focus sections on the right with the current one lit */
function TopBar({ script }: { script: VideoScript }) {
  const t = useCurrentFrame() / FPS
  let start = 0
  let section: string | undefined
  for (const s of script.scenes) {
    if (t >= start) section = s.section
    start += s.seconds
  }
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, top: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg viewBox="0 0 32 32" width="34" height="34">
        <circle cx="16" cy="16" r="13" fill="none" stroke={C.accent} strokeWidth="2.5" />
        <circle cx="16" cy="16" r="6" fill="none" stroke={C.accent} strokeWidth="2" opacity="0.6" />
        <circle cx="16" cy="16" r="2.5" fill={C.accent} />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600 }}>{script.title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        {script.sections.map((name) => {
          const on = name === section
          return (
            <span
              key={name}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 500,
                color: on ? C.bg : C.muted,
                background: on ? C.accent : 'transparent',
                border: `1.5px solid ${on ? C.accent : C.cardEdge}`,
              }}
            >
              {name}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** the narration as subtitles: one cue at a time, faded in and out */
function Captions({ script }: { script: VideoScript }) {
  const t = useCurrentFrame() / FPS
  const cue = globalCues(script).find(([a, b]) => t >= a && t < b)
  if (!cue) return null
  const [a, b, text] = cue
  const opacity = prog(t, a, 0.25) * (1 - prog(t, b - 0.25, 0.25))
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', opacity }}>
      <div
        style={{
          maxWidth: 1500,
          padding: '14px 30px',
          borderRadius: 16,
          background: 'rgba(5, 8, 15, 0.82)',
          border: `1px solid ${C.cardEdge}`,
          fontSize: 34,
          lineHeight: 1.45,
          fontWeight: 500,
          textAlign: 'center',
          textWrap: 'balance',
        }}
      >
        {text}
      </div>
    </div>
  )
}
