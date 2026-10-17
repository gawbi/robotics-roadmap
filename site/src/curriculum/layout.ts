import { CONFIG } from '../config'
import type { Branch, Curriculum, Project } from './types'

// Angles are measured clockwise from 12 o'clock, in radians.
const TAU = Math.PI * 2
const L = CONFIG.layout

export interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

export interface NodePos {
  id: string
  x: number
  y: number
  angle: number
  radius: number
  rank: number
  size: number
  label: string[]
  /** node circle plus label, relative to (x, y) */
  box: Box
}

export interface Sector {
  branch: Branch
  start: number
  end: number
}

export interface Edge {
  from: string
  to: string
  path: string
}

export interface Layout {
  nodes: Map<string, NodePos>
  edges: Edge[]
  sectors: Sector[]
  rings: number[]
  /** radius where sector titles sit */
  labelRadius: number
  /** radius that contains everything, sector titles included */
  outerRadius: number
}

export const ringRadius = (rank: number) => L.hubRadius + L.ringGap * rank

const polar = (radius: number, angle: number) => ({ x: radius * Math.sin(angle), y: -radius * Math.cos(angle) })
const angleOf = (x: number, y: number) => Math.atan2(x, -y)

/** Bring `a` within ±π of `ref`. */
const near = (a: number, ref: number) => a - TAU * Math.round((a - ref) / TAU)

function circularMean(angles: number[]): number | undefined {
  if (angles.length === 0) return undefined
  const s = angles.reduce((acc, a) => acc + Math.sin(a), 0)
  const c = angles.reduce((acc, a) => acc + Math.cos(a), 0)
  return Math.atan2(s, c)
}

export function nodeSize(p: Project): number {
  if (p.hours >= L.hoursForSize.large) return L.nodeRadius.large
  if (p.hours >= L.hoursForSize.medium) return L.nodeRadius.medium
  return L.nodeRadius.small
}

/** Split a title into at most two balanced lines. */
export function labelLines(title: string): string[] {
  if (title.length <= L.labelWrapAt) return [title]
  const words = title.split(' ')
  let best = [title]
  let bestScore = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    const score = Math.max(a.length, b.length)
    if (score < bestScore) {
      bestScore = score
      best = [a, b]
    }
  }
  return best
}

function boxFor(size: number, label: string[]): Box {
  const textWidth = Math.max(...label.map((l) => l.length)) * L.labelCharWidth
  const half = Math.max(size, textWidth / 2) + L.boxPad / 2
  return {
    left: -half,
    right: half,
    top: -size - L.boxPad / 2,
    bottom: size + L.labelOffset + label.length * L.labelLineHeight + L.boxPad / 2,
  }
}

export function boxesOverlap(a: NodePos, b: NodePos): boolean {
  return (
    a.x + a.box.left < b.x + b.box.right &&
    b.x + b.box.left < a.x + a.box.right &&
    a.y + a.box.top < b.y + b.box.bottom &&
    b.y + b.box.top < a.y + a.box.bottom
  )
}

/** rank 0 = hub; otherwise 1 + deepest prerequisite outside the hub. */
export function computeRanks(c: Curriculum): Map<string, number> {
  const hub = new Set(c.branches.filter((b) => b.layout === 'hub').map((b) => b.id))
  const ranks = new Map<string, number>()
  const rank = (p: Project): number => {
    const known = ranks.get(p.id)
    if (known !== undefined) return known
    const value = hub.has(p.branch) ? 0 : 1 + Math.max(0, ...p.requires.map((r) => rank(c.byId.get(r)!)))
    ranks.set(p.id, value)
    return value
  }
  c.projects.forEach(rank)
  return ranks
}

/** Spread targets on [lo, hi] keeping at least `gap` between neighbours and staying close to the targets. */
function spread(targets: number[], lo: number, hi: number, gap: number): number[] {
  const n = targets.length
  if (n === 0) return []
  if (gap * (n - 1) >= hi - lo) {
    return targets.map((_, i) => (n === 1 ? (lo + hi) / 2 : lo + ((hi - lo) * i) / (n - 1)))
  }
  const p = targets.map((t) => Math.min(hi, Math.max(lo, t)))
  for (let i = 1; i < n; i++) p[i] = Math.max(p[i], p[i - 1] + gap)
  // keep the cluster centred on its targets
  const shift = targets.reduce((a, t) => a + t, 0) / n - p.reduce((a, v) => a + v, 0) / n
  for (let i = 0; i < n; i++) p[i] += shift
  if (p[n - 1] > hi) {
    p[n - 1] = hi
    for (let i = n - 2; i >= 0; i--) p[i] = Math.min(p[i], p[i + 1] - gap)
  }
  if (p[0] < lo) {
    p[0] = lo
    for (let i = 1; i < n; i++) p[i] = Math.max(p[i], p[i - 1] + gap)
  }
  return p
}

/** Hub projects in prerequisite order, so the first one is the starting point. */
function hubOrder(c: Curriculum, hubIds: Set<string>): Project[] {
  const out: Project[] = []
  const seen = new Set<string>()
  const visit = (p: Project) => {
    if (seen.has(p.id)) return
    seen.add(p.id)
    p.requires.filter((r) => hubIds.has(r)).forEach((r) => visit(c.byId.get(r)!))
    out.push(p)
  }
  c.projects.filter((p) => hubIds.has(p.id)).forEach(visit)
  return out
}

/**
 * Push overlapping node+label boxes apart while springs hold each node near its ring and angle.
 * Position-based: every iteration fully resolves pairwise overlaps; the last iterations drop the springs
 * so the result is overlap-free.
 */
function relax(nodes: NodePos[], targets: Map<string, { radius: number; angle: number }>, pinned: Set<string>) {
  // springs run for the first iterations; afterwards only collisions, until nothing overlaps
  for (let it = 0; it < L.relaxIterations * 3; it++) {
    const settle = it >= L.relaxIterations * 0.8
    if (settle && it >= L.relaxIterations && !nodes.some((a, i) => nodes.slice(i + 1).some((b) => boxesOverlap(a, b)))) {
      break
    }
    if (!settle) {
      for (const n of nodes) {
        if (pinned.has(n.id)) continue
        const t = targets.get(n.id)!
        const r = Math.hypot(n.x, n.y)
        const a = angleOf(n.x, n.y)
        const nr = r + (t.radius - r) * L.ringStiffness
        const na = a + (near(t.angle, a) - a) * L.angleStiffness
        const p = polar(nr, na)
        n.x = p.x
        n.y = p.y
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        if (!boxesOverlap(a, b)) continue
        const ox = Math.min(a.x + a.box.right - (b.x + b.box.left), b.x + b.box.right - (a.x + a.box.left)) + 0.01
        const oy = Math.min(a.y + a.box.bottom - (b.y + b.box.top), b.y + b.box.bottom - (a.y + a.box.top)) + 0.01
        const aFixed = pinned.has(a.id)
        const bFixed = pinned.has(b.id)
        if (aFixed && bFixed) continue
        const share = aFixed ? 0 : bFixed ? 1 : 0.5
        if (ox < oy) {
          const dir = a.x + (a.box.left + a.box.right) / 2 < b.x + (b.box.left + b.box.right) / 2 ? -1 : 1
          a.x += dir * ox * share
          b.x -= dir * ox * (1 - share)
        } else {
          const dir = a.y + (a.box.top + a.box.bottom) / 2 < b.y + (b.box.top + b.box.bottom) / 2 ? -1 : 1
          a.y += dir * oy * share
          b.y -= dir * oy * (1 - share)
        }
      }
    }
  }
  for (const n of nodes) {
    n.radius = Math.hypot(n.x, n.y)
    n.angle = angleOf(n.x, n.y)
  }
}

export function computeLayout(c: Curriculum): Layout {
  const ranks = computeRanks(c)
  const maxRank = Math.max(...ranks.values())
  const nodes = new Map<string, NodePos>()
  const place = (p: Project, radius: number, angle: number) => {
    const { x, y } = polar(radius, angle)
    const size = nodeSize(p)
    const label = labelLines(p.title)
    nodes.set(p.id, { id: p.id, x, y, angle, radius, rank: ranks.get(p.id)!, size, label, box: boxFor(size, label) })
  }
  const byRank = (projects: Project[], r: number) => projects.filter((p) => ranks.get(p.id) === r)

  // 1. sector widths: each branch gets the angle its most crowded ring needs, then the circle is shared out.
  const sectorBranches = c.branches.filter((b) => b.layout === 'sector')
  const members = new Map(sectorBranches.map((b) => [b.id, c.projects.filter((p) => p.branch === b.id)]))
  const need = sectorBranches.map((b) => {
    let widest = 0
    for (let r = 1; r <= maxRank; r++) {
      const n = byRank(members.get(b.id)!, r).length
      widest = Math.max(widest, (n * L.nodeSpacing) / ringRadius(r))
    }
    return widest + 2 * L.sectorPadding
  })
  const scale = TAU / need.reduce((a, v) => a + v, 0)
  const sectors: Sector[] = []
  let cursor = 0
  sectorBranches.forEach((b, i) => {
    const width = need[i] * scale
    sectors.push({ branch: b, start: cursor, end: cursor + width })
    cursor += width
  })

  // 2. sector and float nodes ring by ring, each pulled toward the angle of its placed prerequisites.
  const hubIds = new Set(c.projects.filter((p) => ranks.get(p.id) === 0).map((p) => p.id))
  const parentAngles = (p: Project) =>
    p.requires.filter((r) => !hubIds.has(r) && nodes.has(r)).map((r) => nodes.get(r)!.angle)

  for (let r = 1; r <= maxRank; r++) {
    const radius = ringRadius(r)
    const gap = L.nodeSpacing / radius
    for (const s of sectors) {
      const ring = byRank(members.get(s.branch.id)!, r)
      const mid = (s.start + s.end) / 2
      const targets = ring.map((p) => {
        const mean = circularMean(parentAngles(p))
        return { p, t: mean === undefined ? mid : near(mean, mid) }
      })
      targets.sort((a, b) => a.t - b.t)
      const angles = spread(
        targets.map((x) => x.t),
        s.start + L.sectorPadding,
        s.end - L.sectorPadding,
        gap,
      )
      targets.forEach((x, i) => place(x.p, radius, angles[i]))
    }
    // floats sit between the sectors they draw from; relaxation moves them off occupied spots
    c.projects
      .filter((p) => ranks.get(p.id) === r && c.branches.find((b) => b.id === p.branch)!.layout === 'float')
      .forEach((p) => place(p, radius, circularMean(parentAngles(p)) ?? 0))
  }

  // 3. hub: the starting project sits in the centre, the rest of the core on a small circle,
  //    rotated so the last core project faces the sectors that build on it.
  const [root, ...ringHub] = hubOrder(c, hubIds)
  if (root) {
    place(root, 0, 0)
    nodes.get(root.id)!.box.top -= L.startTagHeight // room for the START tag above it
  }
  if (ringHub.length) {
    const last = ringHub[ringHub.length - 1]
    const facing =
      circularMean(
        (c.unlocks.get(last.id) ?? []).filter((id) => !hubIds.has(id)).map((id) => nodes.get(id)!.angle),
      ) ?? 0
    const step = TAU / ringHub.length
    ringHub.forEach((p, i) => place(p, L.hubRadius, facing - step * (ringHub.length - 1 - i)))
  }

  // 4. resolve label collisions around the intended positions
  const targets = new Map([...nodes.values()].map((n) => [n.id, { radius: n.radius, angle: n.angle }]))
  relax([...nodes.values()], targets, new Set(root ? [root.id] : []))

  // 5. edges: short hops follow the rings, long ones bow toward the centre
  const edges: Edge[] = []
  for (const p of c.projects) {
    for (const r of p.requires) {
      edges.push({ from: r, to: p.id, path: edgePath(nodes.get(r)!, nodes.get(p.id)!) })
    }
  }

  const reach = Math.max(
    ...[...nodes.values()].map((n) =>
      Math.max(
        Math.hypot(n.x + n.box.left, n.y + n.box.top),
        Math.hypot(n.x + n.box.right, n.y + n.box.bottom),
        Math.hypot(n.x + n.box.left, n.y + n.box.bottom),
        Math.hypot(n.x + n.box.right, n.y + n.box.top),
      ),
    ),
  )
  const labelRadius = reach + L.branchLabelGap
  const rings = Array.from({ length: maxRank }, (_, i) => ringRadius(i + 1))
  return { nodes, edges, sectors, rings, labelRadius, outerRadius: labelRadius + L.branchLabelGap }
}

function edgePath(a: NodePos, b: NodePos): string {
  const end = near(b.angle, a.angle)
  const span = Math.abs(end - a.angle)
  const line = `M${a.x.toFixed(1)},${a.y.toFixed(1)}L${b.x.toFixed(1)},${b.y.toFixed(1)}`
  if (a.radius < 1 || a.rank === 0 || span < 0.05) return line
  if (span > L.spiralMaxAngle) {
    const c = polar(Math.min(a.radius, b.radius) * Math.cos(span / 2) * 0.9, (a.angle + end) / 2)
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)}Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`
  }
  const steps = 20
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // ease the angle so the edge leaves radially and arrives radially
    const e = t * t * (3 - 2 * t)
    const { x, y } = polar(a.radius + (b.radius - a.radius) * t, a.angle + (end - a.angle) * e)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join('L')}`
}

export function polarPoint(radius: number, angle: number) {
  return polar(radius, angle)
}
