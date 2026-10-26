// Renders lesson videos into out/, each with its captions (.srt) and a reading script (.txt) for recording a voice over
// it. usage: node render.mjs behavior-cloning [more ids]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fitNarration, globalCues } from './src/script.ts'

const ids = process.argv.slice(2)
if (ids.length === 0) throw new Error('usage: node render.mjs <video id> ...')
mkdirSync('out', { recursive: true })

const stamp = (s) => {
  const ms = Math.round(s * 1000)
  const pad = (n, w = 2) => String(n).padStart(w, '0')
  return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`
}
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

for (const id of ids) {
  const written = (await import(`./src/lessons/${id}.script.ts`)).script
  const narrationFile = `src/lessons/${id}.narration.json`
  const narration = existsSync(narrationFile) ? JSON.parse(readFileSync(narrationFile, 'utf8')) : {}
  // with narration the scenes stretch to fit the voice, so the captions and the reading script follow the same clock
  const { script } = fitNarration(written, narration)
  const cues = globalCues(script)
  writeFileSync(`out/${id}.srt`, cues.map(([a, b, text], i) => `${i + 1}\n${stamp(a)} --> ${stamp(b)}\n${text}\n`).join('\n'))
  const lines = [`${script.title} · 녹음 대본`, `강의: ${script.lessonUrl}`, '']
  let start = 0
  for (const scene of script.scenes) {
    lines.push(`[${clock(start)}] ${scene.id}${scene.section ? ` · ${scene.section}` : ''} (${Math.round(scene.seconds)}초)`)
    for (const [a, , text] of scene.cues) lines.push(`  ${clock(start + a)}  ${text}`)
    lines.push('')
    start += scene.seconds
  }
  writeFileSync(`out/${id}.txt`, lines.join('\n'))
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, `out/${id}.mp4`, '--crf=24'], { stdio: 'inherit' })
}
