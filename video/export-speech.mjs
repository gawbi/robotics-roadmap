// Writes tts/jobs/<id>.json: each narration line of a video as the text the voice reads (src/speech.ts), for
// tts/synth.py. usage: node export-speech.mjs behavior-cloning [more ids]
import { mkdirSync, writeFileSync } from 'node:fs'
import { cueKey } from './src/script.ts'
import { speakable, unknownWords } from './src/speech.ts'

mkdirSync('tts/jobs', { recursive: true })
for (const id of process.argv.slice(2)) {
  const { script } = await import(`./src/lessons/${id}.script.ts`)
  const lines = script.scenes.flatMap((scene) => scene.cues.map(([, , caption, spoken], i) => ({ key: cueKey(scene.id, i), text: speakable(spoken ?? caption) })))
  const unknown = unknownWords(lines.map((l) => l.text).join(' '))
  if (unknown.length) console.warn(`${id}: English words with no Korean reading yet (src/speech.ts TERMS): ${unknown.join(', ')}`)
  writeFileSync(`tts/jobs/${id}.json`, `${JSON.stringify({ id, lines }, null, 2)}\n`)
  console.log(`tts/jobs/${id}.json: ${lines.length} lines`)
}
