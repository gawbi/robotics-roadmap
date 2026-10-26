// A video's script: its scenes in order, each with a length and the narration cues shown as captions. Kept free of JSX
// so render.mjs can read it with plain Node and write the .srt captions and the reading script for recording a voice.

/** [from, to, caption, spoken]: seconds within the scene; `spoken` replaces the caption for the voice when given */
export type Cue = [number, number, string, string?]

/** seconds of narration per cue, keyed `${scene id}-${cue index}`, as tts/synth.py measured them */
export type Narration = Record<string, number>

export const cueKey = (sceneId: string, index: number) => `${sceneId}-${index}`

export interface SceneScript {
  id: string
  seconds: number
  /** which of the lesson's focus sections the scene belongs to, shown at the top */
  section?: string
  cues: Cue[]
}

export interface VideoScript {
  id: string
  title: string
  lessonUrl: string
  sections: string[]
  scenes: SceneScript[]
}

export const totalSeconds = (s: VideoScript) => s.scenes.reduce((a, x) => a + x.seconds, 0)

const GAP = 0.35 // breath after each line of narration

/** a scene's clock: piecewise linear from real seconds to the seconds its script was written in */
export interface Warp {
  /** [script second, real second] at each joint, both increasing, starting at [0, 0] */
  joints: [number, number][]
}

/** script seconds at real second `t` of the scene */
export function scriptTime(w: Warp, t: number): number {
  const j = w.joints
  for (let i = 1; i < j.length; i++) {
    if (t <= j[i][1]) {
      const [s0, r0] = j[i - 1]
      const [s1, r1] = j[i]
      return r1 === r0 ? s1 : s0 + ((t - r0) / (r1 - r0)) * (s1 - s0)
    }
  }
  return j[j.length - 1][0] + (t - j[j.length - 1][1])
}

/** real seconds at script second `s` of the scene */
export function realTime(w: Warp, s: number): number {
  const j = w.joints
  for (let i = 1; i < j.length; i++) {
    if (s <= j[i][0]) {
      const [s0, r0] = j[i - 1]
      const [s1, r1] = j[i]
      return s1 === s0 ? r1 : r0 + ((s - s0) / (s1 - s0)) * (r1 - r0)
    }
  }
  return j[j.length - 1][1] + (s - j[j.length - 1][0])
}

/**
 * Give every line of narration the time it needs: a cue whose voice runs longer than its window is slowed by just enough,
 * and the stretches between cues (a countdown, an animation with no voice) keep their written pace. Returns the script on
 * the real clock and each scene's warp, which the scene components read their animation time through (kit.tsx useSec).
 */
export function fitNarration(s: VideoScript, narration: Narration): { script: VideoScript; warp: Record<string, Warp> } {
  const warp: Record<string, Warp> = {}
  const scenes = s.scenes.map((scene) => {
    const joints: [number, number][] = [[0, 0]]
    let real = 0
    let at = 0
    const ordered = scene.cues.map((c, i) => ({ c, i })).sort((x, y) => x.c[0] - y.c[0])
    for (const { c, i } of ordered) {
      const [a, b] = c
      if (a > at) {
        real += a - at
        joints.push([a, real])
      }
      const need = (narration[cueKey(scene.id, i)] ?? 0) + GAP
      real += Math.max(b - a, need)
      joints.push([b, real])
      at = b
    }
    real += scene.seconds - at
    joints.push([scene.seconds, real])
    const w = { joints }
    warp[scene.id] = w
    return { ...scene, seconds: real, cues: scene.cues.map(([a, b, t, sp]): Cue => [realTime(w, a), realTime(w, b), t, sp]) }
  })
  return { script: { ...s, scenes }, warp }
}

/** every cue on the video's own clock */
export function globalCues(s: VideoScript): Cue[] {
  let start = 0
  const out: Cue[] = []
  for (const scene of s.scenes) {
    for (const [a, b, text, spoken] of scene.cues) out.push([start + a, start + b, text, spoken])
    start += scene.seconds
  }
  return out
}
