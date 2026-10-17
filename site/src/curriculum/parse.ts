import { parse as parseYaml } from 'yaml'
import type { Branch, BranchLayout, Curriculum, Paper, Project } from './types'

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const LAYOUTS: BranchLayout[] = ['hub', 'sector', 'float']

export class CurriculumError extends Error {}

function fail(where: string, message: string): never {
  throw new CurriculumError(`${where}: ${message}`)
}

function str(value: unknown, where: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') fail(where, `"${field}" must be a non-empty string`)
  return value.trim()
}

export function parseBranches(source: string): Branch[] {
  const data: unknown = parseYaml(source)
  if (!Array.isArray(data)) fail('branches.yaml', 'expected a list of branches')
  return data.map((raw, i) => {
    const where = `branches.yaml[${i}]`
    const b = raw as Record<string, unknown>
    const layout = str(b.layout, where, 'layout') as BranchLayout
    if (!LAYOUTS.includes(layout)) fail(where, `layout must be one of ${LAYOUTS.join(', ')}`)
    return {
      id: str(b.id, where, 'id'),
      title: str(b.title, where, 'title'),
      summary: str(b.summary, where, 'summary'),
      color: str(b.color, where, 'color'),
      layout,
    }
  })
}

function parsePapers(value: unknown, where: string): Paper[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) fail(where, '"papers" must be a list')
  return value.map((raw, i) => {
    const p = raw as Record<string, unknown>
    const w = `${where} papers[${i}]`
    if (typeof p.year !== 'number') fail(w, '"year" must be a number')
    return {
      title: str(p.title, w, 'title'),
      authors: str(p.authors, w, 'authors'),
      year: p.year,
      url: p.url === undefined ? undefined : str(p.url, w, 'url'),
    }
  })
}

/** Parse one `projects/<id>/README.md`. `dir` is the folder name, which must equal the id. */
export function parseProject(dir: string, source: string): Project {
  const path = `projects/${dir}/README.md`
  const match = FRONTMATTER.exec(source)
  if (!match) fail(path, 'missing YAML frontmatter')
  const fm = (parseYaml(match[1]) ?? {}) as Record<string, unknown>

  const id = str(fm.id, path, 'id')
  if (id !== dir) fail(path, `id "${id}" must match folder name "${dir}"`)
  const requires = fm.requires ?? []
  if (!Array.isArray(requires) || requires.some((r) => typeof r !== 'string')) {
    fail(path, '"requires" must be a list of project ids')
  }
  if (typeof fm.hours !== 'number' || fm.hours <= 0) fail(path, '"hours" must be a positive number')

  return {
    id,
    title: str(fm.title, path, 'title'),
    branch: str(fm.branch, path, 'branch'),
    requires: requires as string[],
    hours: fm.hours,
    summary: str(fm.summary, path, 'summary'),
    papers: parsePapers(fm.papers, path),
    body: source.slice(match[0].length),
    path,
  }
}

/** Link projects into a graph and check references, branches and cycles. */
export function buildCurriculum(branches: Branch[], projects: Project[]): Curriculum {
  const branchIds = new Set(branches.map((b) => b.id))
  if (branchIds.size !== branches.length) fail('branches.yaml', 'duplicate branch id')
  if (branches.filter((b) => b.layout === 'hub').length !== 1) fail('branches.yaml', 'exactly one hub branch required')

  const byId = new Map<string, Project>()
  for (const p of projects) {
    if (byId.has(p.id)) fail(p.path, `duplicate id "${p.id}"`)
    if (!branchIds.has(p.branch)) fail(p.path, `unknown branch "${p.branch}"`)
    byId.set(p.id, p)
  }

  const unlocks = new Map<string, string[]>(projects.map((p) => [p.id, []]))
  for (const p of projects) {
    for (const r of p.requires) {
      if (!byId.has(r)) fail(p.path, `requires unknown project "${r}"`)
      unlocks.get(r)!.push(p.id)
    }
  }

  // cycle check (DFS colouring)
  const color = new Map<string, 0 | 1 | 2>()
  const visit = (id: string, trail: string[]) => {
    const c = color.get(id) ?? 0
    if (c === 2) return
    if (c === 1) fail(byId.get(id)!.path, `prerequisite cycle: ${[...trail, id].join(' -> ')}`)
    color.set(id, 1)
    for (const r of byId.get(id)!.requires) visit(r, [...trail, id])
    color.set(id, 2)
  }
  for (const p of projects) visit(p.id, [])

  return { branches, projects, byId, unlocks }
}

/** All transitive prerequisites of a project. */
export function ancestors(c: Curriculum, id: string): Set<string> {
  const out = new Set<string>()
  const stack = [...c.byId.get(id)!.requires]
  while (stack.length) {
    const r = stack.pop()!
    if (out.has(r)) continue
    out.add(r)
    stack.push(...c.byId.get(r)!.requires)
  }
  return out
}
