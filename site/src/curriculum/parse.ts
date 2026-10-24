import { parse as parseYaml } from 'yaml'
import type { Branch, Curriculum, Hub, MapSpec, Paper, Lesson, Tree } from './types'

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export class CurriculumError extends Error {}

function fail(where: string, message: string): never {
  throw new CurriculumError(`${where}: ${message}`)
}

function str(value: unknown, where: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') fail(where, `"${field}" must be a non-empty string`)
  return value.trim()
}

export function parseBranches(source: string): MapSpec {
  const data = parseYaml(source) as Record<string, unknown> | null
  if (!data || !Array.isArray(data.trees) || !Array.isArray(data.branches)) fail('branches.yaml', 'expected "trees" and "branches" lists')
  const rawRings = ((data.hub ?? {}) as Record<string, unknown>).rings ?? []
  if (!Array.isArray(rawRings)) fail('branches.yaml', '"hub.rings" must be a list')
  const hub: Hub = {
    rings: rawRings.map((raw, i) => {
      const ring = (raw ?? {}) as Record<string, unknown>
      const ids = (field: string) => {
        const v = ring[field] ?? []
        if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) fail('branches.yaml', `"hub.rings[${i}].${field}" must be a list of ids`)
        return v as string[]
      }
      return { branches: ids('branches'), lessons: ids('lessons') }
    }),
  }
  const trees: Tree[] = data.trees.map((raw, i) => {
    const where = `branches.yaml trees[${i}]`
    const t = raw as Record<string, unknown>
    if (typeof t.angle !== 'number' || t.angle < 0 || t.angle >= 360) fail(where, '"angle" must be a number in [0, 360)')
    if (!Array.isArray(t.branches) || t.branches.some((b) => typeof b !== 'string')) fail(where, '"branches" must be a list of branch ids')
    return { id: str(t.id, where, 'id'), title: str(t.title, where, 'title'), color: str(t.color, where, 'color'), angle: t.angle, branches: t.branches as string[] }
  })
  const branches: Branch[] = data.branches.map((raw, i) => {
    const where = `branches.yaml branches[${i}]`
    const b = raw as Record<string, unknown>
    if (b.core !== undefined && typeof b.core !== 'boolean') fail(where, '"core" must be true or false')
    return {
      id: str(b.id, where, 'id'),
      title: str(b.title, where, 'title'),
      summary: str(b.summary, where, 'summary'),
      color: str(b.color, where, 'color'),
      core: b.core === true,
    }
  })
  return { hub, trees, branches }
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

/** Parse one `lessons/<id>/README.md`. `dir` is the folder name, which must equal the id. */
export function parseLesson(dir: string, source: string): Lesson {
  const path = `lessons/${dir}/README.md`
  const match = FRONTMATTER.exec(source)
  if (!match) fail(path, 'missing YAML frontmatter')
  const fm = (parseYaml(match[1]) ?? {}) as Record<string, unknown>

  const id = str(fm.id, path, 'id')
  if (id !== dir) fail(path, `id "${id}" must match folder name "${dir}"`)
  const requires = fm.requires ?? []
  if (!Array.isArray(requires) || requires.some((r) => typeof r !== 'string')) {
    fail(path, '"requires" must be a list of lesson ids')
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

/** Link lessons into a graph and check references, branches and cycles. */
export function buildCurriculum({ hub, trees, branches }: MapSpec, lessons: Lesson[]): Curriculum {
  const branchIds = new Set(branches.map((b) => b.id))
  if (branchIds.size !== branches.length) fail('branches.yaml', 'duplicate branch id')
  if (branches.filter((b) => b.core).length !== 1) fail('branches.yaml', 'exactly one core branch required')
  if (new Set(trees.map((t) => t.id)).size !== trees.length) fail('branches.yaml', 'duplicate tree id')
  const hubBranches = hub.rings.flatMap((r) => r.branches)
  const planted = [...hubBranches, ...trees.flatMap((t) => t.branches)]
  for (const b of branches) {
    if (planted.filter((id) => id === b.id).length !== 1) fail('branches.yaml', `branch "${b.id}" must sit in exactly one tree or the hub`)
  }
  for (const id of planted) if (!branchIds.has(id)) fail('branches.yaml', `tree lists unknown branch "${id}"`)

  const byId = new Map<string, Lesson>()
  for (const p of lessons) {
    if (byId.has(p.id)) fail(p.path, `duplicate id "${p.id}"`)
    if (!branchIds.has(p.branch)) fail(p.path, `unknown branch "${p.branch}"`)
    byId.set(p.id, p)
  }
  const ringOf = new Map<string, number>()
  hub.rings.forEach((r, i) => {
    for (const id of r.lessons) {
      if (!byId.has(id)) fail('branches.yaml', `hub lists unknown lesson "${id}"`)
      if (hubBranches.includes(byId.get(id)!.branch) || ringOf.has(id)) fail('branches.yaml', `hub lesson "${id}" is listed twice`)
      ringOf.set(id, i + 1)
    }
    for (const p of lessons) if (r.branches.includes(p.branch)) ringOf.set(p.id, p.requires.length === 0 ? 0 : i + 1)
  })
  for (const [id, ring] of ringOf) {
    for (const q of byId.get(id)!.requires) {
      if (!byId.has(q)) continue // reported below
      if (!ringOf.has(q) || ringOf.get(q)! > ring) fail(byId.get(id)!.path, `hub lesson requires "${q}", which is not on its ring or inside it`)
    }
  }

  const unlocks = new Map<string, string[]>(lessons.map((p) => [p.id, []]))
  for (const p of lessons) {
    for (const r of p.requires) {
      if (!byId.has(r)) fail(p.path, `requires unknown lesson "${r}"`)
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
  for (const p of lessons) visit(p.id, [])

  return { hub: ringOf, trees, branches, lessons, byId, unlocks }
}

/** All transitive prerequisites of a lesson. */
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
