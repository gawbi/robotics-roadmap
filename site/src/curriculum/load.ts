import branchesSource from '../../../lessons/branches.yaml?raw'
import { buildCurriculum, parseBranches, parseLesson } from './parse'
import { parseResult, type Attempt } from './quiz'
import { parseLab, type Lab } from './record'

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
// re-runs this module through HMR, so the map stays in step with the repo. The folder is CONFIG.quiz.progressDir (globs
// take literals only).
const results = import.meta.glob('../../../progress/*.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const initialAttempts: Record<string, Attempt[]> = Object.fromEntries(
  Object.entries(results).map(([file, source]) => [file.split('/').at(-1)!.replace(/\.json$/, ''), parseResult(source).attempts]),
)

// The learner's own record, in CONFIG.record.notesDir and labsDir (globs take literals only). README.md in notes/ is
// the folder's guide, not a note.
const notes = import.meta.glob(['../../../notes/*.md', '!../../../notes/README.md'], {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const notePath = (id: string) => `../../../notes/${id}.md`

/** Whether the learner has written a note for a lesson. */
export const hasNote = (id: string) => notePath(id) in notes

/** lessons with a note in the build */
export const noteIds: ReadonlySet<string> = new Set(Object.keys(notes).map((f) => f.split('/').at(-1)!.replace(/\.md$/, '')))

/** notes/<id>.md, fetched when its tab opens. */
export async function loadNote(id: string): Promise<string> {
  return notes[notePath(id)]()
}

const labSources = import.meta.glob('../../../labs/*/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const labs: Lab[] = Object.entries(labSources)
  .map(([file, source]) => parseLab(file.split('/').at(-2)!, source))
  .sort((a, b) => a.id.localeCompare(b.id))

/** Labs that implement a lesson. */
export const labsFor = (lessonId: string) => labs.filter((l) => l.lessons.includes(lessonId))

const recordAssets = import.meta.glob(['../../../notes/**/*.{png,jpg,jpeg,gif,svg,webp}', '../../../labs/**/*.{png,jpg,jpeg,gif,svg,webp}'], {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Resolve an image a note or lab links to, by its repo-relative path (e.g. `labs/kalman-1d/result.png`). */
export function recordAssetUrl(repoPath: string): string | undefined {
  return recordAssets[`../../../${repoPath}`]
}

/** commits per day that touched the record, read from git when the site was built (vite.config.ts) */
export { default as commitDays } from 'virtual:study-activity'

// Summary videos rendered from the lessons (video/, published to video/published/<lesson id>.mp4)
const videos = import.meta.glob('../../../video/published/*.mp4', { query: '?url', import: 'default', eager: true }) as Record<string, string>

/** the lesson's summary video, if one has been published */
export const videoUrl = (lessonId: string): string | undefined => videos[`../../../video/published/${lessonId}.mp4`]
