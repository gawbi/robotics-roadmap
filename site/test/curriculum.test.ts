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
