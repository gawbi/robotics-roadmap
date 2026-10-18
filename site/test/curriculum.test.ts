import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { boxesOverlap, computeLayout, computeRanks } from '../src/curriculum/layout'
import { buildCurriculum, parseBranches, parseProject } from '../src/curriculum/parse'

const ROOT = join(__dirname, '..', '..', 'projects')
const REQUIRED_SECTIONS = [
  '## 배경',
  '## 목표',
  '## 준비물',
  '## 진행 순서',
  '## 시작점',
  '## 평가 기준',
  '## 생각해 볼 질문',
  '## 힌트',
  '## 참고 자료',
  '## 남은 한계',
]
const SHIPPED_LEAD = '아래 파일은 모두 리포에 들어 있다.'

/** Paths listed in a `tree`-style block, relative to the project folder (the first line is the folder itself). */
function treeEntries(tree: string): string[] {
  const parents: string[] = []
  const entries: string[] = []
  for (const line of tree.split('\n').slice(1)) {
    const m = /^((?:[│ ] {3})*)[├└]── (\S+)/.exec(line)
    if (!m) continue
    parents.length = m[1].length / 4
    parents.push(m[2].replace(/\/$/, ''))
    entries.push(parents.join('/'))
  }
  return entries
}

/** Module names a learner is likely to create in any project, so a module another project imports must not use them. */
const COMMON_MODULES = new Set([
  'agent', 'buffer', 'collect', 'common', 'config', 'control', 'data', 'dataset', 'env', 'evaluate', 'expert',
  'helpers', 'layers', 'load_weights', 'metrics', 'model', 'nets', 'policy', 'train', 'utils',
])

function pythonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.name.startsWith('.') || d.name === '__pycache__') return []
    const path = join(dir, d.name)
    return d.isDirectory() ? pythonFiles(path) : d.name.endsWith('.py') ? [path] : []
  })
}

/**
 * Modules one project imports from another through `sys.path.append(... / "<project>")`, followed into the
 * imported module's own imports of its siblings.
 */
function crossProjectImports(): { importer: string; project: string; module: string }[] {
  const found = new Map<string, { importer: string; project: string; module: string }>()
  const visit = (importer: string, file: string, own: string | null) => {
    const text = readFileSync(file, 'utf8')
    const appended = [...text.matchAll(/sys\.path\.append\(str\(Path\(__file__\)\.resolve\(\)\.parents\[\d\] \/ "([\w-]+)"\)\)/g)]
      .map((m) => m[1])
    for (const m of text.matchAll(/^from (\w+) import /gm)) {
      const project = [...(own ? [own] : []), ...appended].find((p) => existsSync(join(ROOT, p, `${m[1]}.py`)))
      if (!project) continue
      const key = `${importer}:${project}/${m[1]}`
      if (found.has(key)) continue
      found.set(key, { importer, project, module: m[1] })
      visit(importer, join(ROOT, project, `${m[1]}.py`), project)
    }
  }
  for (const d of readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const file of pythonFiles(join(ROOT, d.name))) visit(d.name, file, null)
  }
  return [...found.values()]
}

function load() {
  const branches = parseBranches(readFileSync(join(ROOT, 'branches.yaml'), 'utf8'))
  const dirs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
  const projects = dirs.map((d) => parseProject(d.name, readFileSync(join(ROOT, d.name, 'README.md'), 'utf8')))
  return buildCurriculum(branches, projects)
}

describe('curriculum', () => {
  const c = load()

  it('every project folder has a README.md', () => {
    for (const p of c.projects) expect(existsSync(join(ROOT, p.id, 'README.md'))).toBe(true)
  })

  it('every subject has the standard sections in order', () => {
    for (const p of c.projects) {
      const positions = REQUIRED_SECTIONS.map((h) => p.body.indexOf(`\n${h}\n`))
      expect(positions.filter((i) => i < 0).length, `${p.path} missing sections`).toBe(0)
      expect([...positions].sort((a, b) => a - b), `${p.path} section order`).toEqual(positions)
    }
  })

  it('every project ships its own uv environment', () => {
    for (const p of c.projects) {
      for (const file of ['pyproject.toml', 'uv.lock']) {
        expect(existsSync(join(ROOT, p.id, file)), `${p.id}/${file}`).toBe(true)
      }
    }
  })

  it('every file in the starting point tree ships with the repo', () => {
    for (const p of c.projects) {
      const start = p.body.slice(p.body.indexOf('\n## 시작점\n'), p.body.indexOf('\n## 평가 기준\n'))
      const lead = start.split('\n').find((line) => line.trim() && !line.startsWith('#'))
      expect(lead, `${p.path} starting point lead`).toBe(SHIPPED_LEAD)
      const tree = /```text\n([\s\S]*?)```/.exec(start)
      expect(tree, `${p.path} starting point tree`).not.toBeNull()
      for (const entry of treeEntries(tree![1])) {
        expect(existsSync(join(ROOT, p.id, entry)), `${p.id}/${entry} listed in 시작점`).toBe(true)
      }
    }
  })

  it('modules other projects import have names no other project uses', () => {
    const imports = crossProjectImports()
    expect(imports.length).toBeGreaterThan(0)
    const owners = new Map<string, string[]>()
    for (const d of readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const f of readdirSync(join(ROOT, d.name)).filter((f) => f.endsWith('.py'))) {
        owners.set(f.slice(0, -3), [...(owners.get(f.slice(0, -3)) ?? []), d.name])
      }
    }
    for (const { importer, project, module } of imports) {
      const where = `${project}/${module}.py imported by ${importer}`
      expect(COMMON_MODULES.has(module), `${where} has a common name`).toBe(false)
      expect(owners.get(module), `${where} shares its name`).toEqual([project])
    }
  })

  it('projects import code only from projects they require', () => {
    const ancestors = (id: string, seen = new Set<string>()): Set<string> => {
      for (const r of c.byId.get(id)!.requires) if (!seen.has(r)) ancestors(r, seen.add(r))
      return seen
    }
    for (const { importer, project } of crossProjectImports()) {
      if (importer === project) continue
      expect(ancestors(importer).has(project), `${importer} imports ${project} without requiring it`).toBe(true)
    }
  })

  it('links to other projects point at existing projects', () => {
    for (const p of c.projects) {
      for (const m of p.body.matchAll(/\]\(\.\.\/([a-z0-9-]+)\/README\.md\)/g)) {
        expect(c.byId.has(m[1]), `${p.path} links to missing project ${m[1]}`).toBe(true)
      }
    }
  })

  it('has exactly one starting point', () => {
    expect(c.projects.filter((p) => p.requires.length === 0).map((p) => p.id)).toEqual(['warmup'])
  })

  it('lays out every project without overlapping labels', () => {
    const layout = computeLayout(c)
    const ranks = computeRanks(c)
    expect(layout.nodes.size).toBe(c.projects.length)
    const nodes = [...layout.nodes.values()]
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(boxesOverlap(nodes[i], nodes[j]), `${nodes[i].id} overlaps ${nodes[j].id}`).toBe(false)
      }
    }
    for (const p of c.projects) {
      for (const r of p.requires) expect(ranks.get(r)!).toBeLessThanOrEqual(ranks.get(p.id)!)
    }
  })
})
