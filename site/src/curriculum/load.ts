import branchesSource from '../../../lessons/branches.yaml?raw'
import { buildCurriculum, parseBranches, parseLesson } from './parse'
import { parseResult, type Attempt } from './quiz'

// Headers are bundled with the graph; bodies are fetched when a subject is opened.
const headers = import.meta.glob('../../../lessons/*/README.md', {
  query: '?frontmatter',
  import: 'default',
  eager: true,
}) as Record<string, string>

const bodies = import.meta.glob('../../../lessons/*/README.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const assets = import.meta.glob('../../../lessons/*/**/*.{png,jpg,jpeg,gif,svg,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

const subjectPath = (id: string) => `../../../lessons/${id}/README.md`

const lessons = Object.entries(headers).map(([file, header]) => parseLesson(file.split('/').at(-2)!, header))

export const curriculum = buildCurriculum(parseBranches(branchesSource), lessons)

/** Full subject markdown without its frontmatter. */
export async function loadBody(id: string): Promise<string> {
  const source = await bodies[subjectPath(id)]()
  return parseLesson(id, source).body
}

/** Resolve an asset referenced from a lesson's README (e.g. `img/arch.png`). */
export function assetUrl(lessonId: string, relative: string): string | undefined {
  const clean = relative.replace(/^\.\//, '')
  return assets[`../../../lessons/${lessonId}/${clean}`]
}

const banks = import.meta.glob('../../../lessons/*/quiz.yaml', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** Whether a lesson has a quiz bank. */
export const hasQuiz = (id: string) => `../../../lessons/${id}/quiz.yaml` in banks

/** Raw lessons/<id>/quiz.yaml, fetched when the quiz opens. */
export async function loadBank(id: string): Promise<string> {
  return banks[`../../../lessons/${id}/quiz.yaml`]()
}

// Results are small and decide every node's state, so they ship with the graph. In dev, a file the quiz server writes
// re-runs this module through HMR, so the map stays in step with the repo.
const results = import.meta.glob('../../../lessons/*/quiz-result.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const initialAttempts: Record<string, Attempt[]> = Object.fromEntries(
  Object.entries(results).map(([file, source]) => [file.split('/').at(-2)!, parseResult(source).attempts]),
)
