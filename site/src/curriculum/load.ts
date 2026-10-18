import branchesSource from '../../../projects/branches.yaml?raw'
import { buildCurriculum, parseBranches, parseProject } from './parse'

// Headers are bundled with the graph; bodies are fetched when a subject is opened.
const headers = import.meta.glob('../../../projects/*/README.md', {
  query: '?frontmatter',
  import: 'default',
  eager: true,
}) as Record<string, string>

const bodies = import.meta.glob('../../../projects/*/README.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const assets = import.meta.glob('../../../projects/*/**/*.{png,jpg,jpeg,gif,svg,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

const subjectPath = (id: string) => `../../../projects/${id}/README.md`

const projects = Object.entries(headers).map(([file, header]) => parseProject(file.split('/').at(-2)!, header))

export const curriculum = buildCurriculum(parseBranches(branchesSource), projects)

/** Full subject markdown without its frontmatter. */
export async function loadBody(id: string): Promise<string> {
  const source = await bodies[subjectPath(id)]()
  return parseProject(id, source).body
}

/** Resolve an asset referenced from a project's README (e.g. `img/arch.png`). */
export function assetUrl(projectId: string, relative: string): string | undefined {
  const clean = relative.replace(/^\.\//, '')
  return assets[`../../../projects/${projectId}/${clean}`]
}

const banks = import.meta.glob('../../../projects/*/quiz.yaml', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** Whether a project has a multiple-choice bank for /evaluate. */
export const hasQuiz = (id: string) => `../../../projects/${id}/quiz.yaml` in banks

/** Raw projects/<id>/quiz.yaml, fetched when the quiz opens. */
export async function loadBank(id: string): Promise<string> {
  return banks[`../../../projects/${id}/quiz.yaml`]()
}
