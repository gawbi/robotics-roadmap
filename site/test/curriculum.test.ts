import { readdirSync, readFileSync, existsSync } from 'node:fs'
import GithubSlugger from 'github-slugger'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '../src/config'
import { boxesOverlap, computeLayout, type Point } from '../src/curriculum/layout'
import { orderLayers } from '../src/curriculum/order'
import { buildCurriculum, parseBranches, parseLesson } from '../src/curriculum/parse'

const ROOT = join(__dirname, '..', '..', 'lessons')
// a lecture opens with its goals and closes with a summary and references; the sections between are free
const REQUIRED_SECTIONS = ['## 학습 목표', '## 정리', '## 참고 자료']
// a lesson is a lecture, its figures and its quiz; anything else (code, environments) does not belong
const LESSON_FILES = new Set(['README.md', 'quiz.yaml', 'figures'])

function load() {
  const branches = parseBranches(readFileSync(join(ROOT, 'branches.yaml'), 'utf8'))
  const dirs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
  const lessons = dirs.map((d) => parseLesson(d.name, readFileSync(join(ROOT, d.name, 'README.md'), 'utf8')))
  return buildCurriculum(branches, lessons)
}

describe('curriculum', () => {
  const c = load()

  it('every lesson folder has a README.md', () => {
    for (const p of c.lessons) expect(existsSync(join(ROOT, p.id, 'README.md'))).toBe(true)
  })

  it('every lecture has the standard sections in order', () => {
    for (const p of c.lessons) {
      const positions = REQUIRED_SECTIONS.map((h) => p.body.indexOf(`\n${h}\n`))
      expect(positions.filter((i) => i < 0).length, `${p.path} missing sections`).toBe(0)
      expect([...positions].sort((a, b) => a - b), `${p.path} section order`).toEqual(positions)
    }
  })

  it('every lesson holds only its lecture, figures and quiz', () => {
    for (const p of c.lessons) {
      for (const f of readdirSync(join(ROOT, p.id))) expect(LESSON_FILES.has(f), `${p.id}/${f}`).toBe(true)
    }
  })

  it('every lesson ends with a quiz', () => {
    for (const p of c.lessons) expect(existsSync(join(ROOT, p.id, 'quiz.yaml')), `${p.id}/quiz.yaml`).toBe(true)
  })

  it('section links point at a heading of the same lecture', () => {
    for (const p of c.lessons) {
      const slugger = new GithubSlugger()
      const slugs = new Set([...p.body.matchAll(/^#{1,6} (.+)$/gm)].map((m) => slugger.slug(m[1])))
      for (const m of p.body.matchAll(/\]\(#([^)]+)\)/g)) {
        expect(slugs.has(decodeURIComponent(m[1])), `${p.path} links to missing section #${m[1]}`).toBe(true)
      }
    }
  })

  it('every progress file belongs to a lesson', () => {
    const dir = join(ROOT, '..', CONFIG.quiz.progressDir)
    if (!existsSync(dir)) return
    for (const f of readdirSync(dir)) expect(c.byId.has(f.replace(/\.json$/, '')), `${CONFIG.quiz.progressDir}/${f}`).toBe(true)
  })

  it('links to other lessons point at existing lessons', () => {
    for (const p of c.lessons) {
      for (const m of p.body.matchAll(/\]\(\.\.\/([a-z0-9-]+)\/README\.md\)/g)) {
        expect(c.byId.has(m[1]), `${p.path} links to missing lesson ${m[1]}`).toBe(true)
      }
    }
  })

  it('has exactly one starting point', () => {
    expect(c.lessons.filter((p) => p.requires.length === 0).map((p) => p.id)).toEqual(['linear-regression'])
  })

  it('lays out every lesson without overlapping labels', async () => {
    const layout = await computeLayout(c)
    expect(layout.nodes.size).toBe(c.lessons.length)
    const nodes = [...layout.nodes.values()]
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(boxesOverlap(nodes[i], nodes[j]), `${nodes[i].id} overlaps ${nodes[j].id}`).toBe(false)
      }
    }
  })

  it('puts every prerequisite above the lessons it opens', async () => {
    const layout = await computeLayout(c)
    for (const p of c.lessons) {
      for (const r of p.requires) expect(layout.nodes.get(r)!.y, `${r} → ${p.id}`).toBeLessThan(layout.nodes.get(p.id)!.y)
    }
  })

  it('keeps the core chain in one straight column', async () => {
    const layout = await computeLayout(c)
    const xs = [...layout.nodes.values()].filter((n) => n.core).map((n) => n.x)
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(1)
  })

  it('routes every edge around the lessons it does not connect', async () => {
    const layout = await computeLayout(c)
    for (const e of layout.edges) {
      for (const n of layout.nodes.values()) {
        if (n.id === e.from || n.id === e.to) continue
        // sample each segment so a corner cut between two points counts too
        for (let i = 1; i < e.points.length; i++) {
          const a = e.points[i - 1]
          const b = e.points[i]
          for (let t = 0; t <= 1; t += 0.25) {
            const x = a.x + (b.x - a.x) * t - n.x
            const y = a.y + (b.y - a.y) * t - n.y
            const inside = x > n.box.left && x < n.box.right && y > n.box.top && y < n.box.bottom
            expect(inside, `${e.from} → ${e.to} crosses ${n.id}`).toBe(false)
          }
        }
      }
    }
  })

  it('draws no more crossings than the layer order it was given', async () => {
    const L = CONFIG.layout
    const order = orderLayers(c, { restarts: L.orderRestarts, sweeps: L.orderSweeps, seed: L.orderSeed })
    const layout = await computeLayout(c)
    const side = (a: Point, b: Point, p: Point) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
    const cross = (a: Point, b: Point, p: Point, q: Point) => side(a, b, p) * side(a, b, q) < 0 && side(p, q, a) * side(p, q, b) < 0
    let drawn = 0
    layout.edges.forEach((e, i) => {
      for (const f of layout.edges.slice(i + 1)) {
        // edges that share a lesson meet at its port; that is not a crossing
        if ([e.from, e.to].some((id) => id === f.from || id === f.to)) continue
        // count every place two edges meet, as orderLayers counts one crossing per layer gap
        e.points.slice(1).forEach((b, k) => {
          f.points.slice(1).forEach((q, m) => {
            if (cross(e.points[k], b, f.points[m], q)) drawn++
          })
        })
      }
    })
    expect(drawn).toBeLessThanOrEqual(order.crossings)
  })
})
