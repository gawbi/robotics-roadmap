import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js'
import { CONFIG } from '../config'
import { orderLayers } from './order'
import type { Curriculum, Lesson, Tree } from './types'

// The starting lesson sits at the centre and each tree of branches.yaml grows out of it in its own direction, so a few
// trees together read as one round map. Each tree is a layered (Sugiyama) layout of the start and the tree's lessons:
// orderLayers picks the layers and the in-layer order with few crossings, ELK places the nodes on that order, and every
// edge is drawn as S-curves between the layers, so no edge runs through a lesson. The tree is laid out growing down,
// then turned to its direction; labels stay level, so each lesson takes the space its label needs once turned. A tree
// whose labels would touch another tree's moves away from the centre.
const L = CONFIG.layout

export interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

export interface Point {
  x: number
  y: number
}

export interface NodePos {
  id: string
  /** centre of the node circle */
  x: number
  y: number
  size: number
  label: string[]
  /** the label sits above the circle (trees growing upward), so edges from the centre reach the circle, not the label */
  labelAbove: boolean
  /** node circle plus label, relative to (x, y) */
  box: Box
  /** part of the core branch */
  core: boolean
  /** the tree the lesson grows in; empty for the starting lesson */
  tree: string
}

export interface Edge {
  from: string
  to: string
  path: string
  /** the path sampled as a polyline */
  points: Point[]
  /** prerequisite edge inside the core branch; drawn as the graph's trunk */
  trunk: boolean
  /** prerequisite in another tree; drawn faint so it does not compete with the trees */
  bridge: boolean
}

/** A tree's area of the map: the wedge from angle `start` clockwise to `end`, and its name centred on x, y, broken
 * into lines at " · ". */
export interface Sector {
  tree: string
  lines: string[]
  x: number
  y: number
  width: number
  height: number
  start: number
  end: number
}

export interface Layout {
  nodes: Map<string, NodePos>
  edges: Edge[]
  /** radii of the hub's rings around the start, innermost first */
  rings: number[]
  /** radius of the outermost ring, which the trees grow from */
  rim: number
  /** each tree's area and the lines from the rim that mark the areas off */
  sectors: Sector[]
  dividers: { from: Point; to: Point }[]
  /** how far the dividers and the areas reach from the centre */
  reach: number
  /** everything drawn, in graph coordinates */
  bounds: Box
}

export function nodeSize(p: Lesson): number {
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

function boxFor(size: number, label: string[], startTag: boolean, above: boolean): Box {
  const textWidth = Math.max(...label.map((l) => l.length)) * L.labelCharWidth
  const half = Math.max(size, textWidth / 2) + L.boxPad / 2
  const text = L.labelOffset + label.length * L.labelLineHeight
  return {
    left: -half,
    right: half,
    top: -size - (above ? text : 0) - (startTag ? L.startTagHeight : 0),
    bottom: size + (above ? 0 : text),
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

/** Turn a point about the origin by `deg` degrees clockwise on screen. */
function turn(p: Point, deg: number): Point {
  const a = (deg * Math.PI) / 180
  const [c, s] = [Math.cos(a), Math.sin(a)]
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
}

/** A tree is laid out growing down (180°); this turns it to its own direction. */
const spin = (t: Tree) => t.angle - 180

/** Labels go above the circle in trees that grow upward. */
const labelAboveIn = (t: Tree) => Math.cos((t.angle * Math.PI) / 180) > 1e-9

const f = (p: Point) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`

const unit = (p: Point) => {
  const n = Math.hypot(p.x, p.y) || 1
  return { x: p.x / n, y: p.y / n }
}

function bezier(p0: Point, c1: Point, c2: Point, p1: Point, out: Point[]) {
  for (let k = 1; k <= L.curveSamples; k++) {
    const t = k / L.curveSamples
    const u = 1 - t
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
    })
  }
}

/** Through the points top to bottom of a tree laid out growing down, each step a cubic that leaves and arrives
 * vertically, then turned with `map` to the tree's direction. */
function treeCurve(stops: Point[], map: (p: Point) => Point): { path: string; points: Point[] } {
  let path = `M${f(map(stops[0]))}`
  const points: Point[] = [map(stops[0])]
  for (let i = 1; i < stops.length; i++) {
    const [p0, p1] = [stops[i - 1], stops[i]]
    const mid = (p0.y + p1.y) / 2
    const [c1, c2] = [map({ x: p0.x, y: mid }), map({ x: p1.x, y: mid })]
    path += `C${f(c1)} ${f(c2)} ${f(map(p1))}`
    bezier(map(p0), c1, c2, map(p1), points)
  }
  return { path, points }
}

/** The start and one tree's lessons, each keeping only its prerequisites inside the tree; a prerequisite in the hub
 * becomes the start, which stands for the whole hub. A lesson whose prerequisites all lie in other trees hangs from the
 * start, so it still grows out of the centre. */
export function treeCurriculum(c: Curriculum, t: Tree): { curriculum: Curriculum; hung: Set<string> } {
  const root = c.lessons.find((p) => p.requires.length === 0)!
  const inTree = (id: string) => id === root.id || (!c.hub.has(id) && t.branches.includes(c.byId.get(id)!.branch))
  const inHub = (id: string) => id === root.id || c.hub.has(id)
  const hung = new Set<string>()
  const lessons = c.lessons
    .filter((p) => inTree(p.id))
    .map((p) => {
      if (p.id === root.id) return p
      const own = p.requires.filter(inTree)
      if (!own.includes(root.id) && p.requires.some(inHub)) own.push(root.id)
      if (own.length === 0) hung.add(p.id)
      return { ...p, requires: own.length ? own : [root.id] }
    })
  const byId = new Map(lessons.map((p) => [p.id, p]))
  const unlocks = new Map(lessons.map((p) => [p.id, lessons.filter((q) => q.requires.includes(p.id)).map((q) => q.id)]))
  return { curriculum: { ...c, lessons, byId, unlocks }, hung }
}

/** A level label box turned into a tree's frame takes the box around its four turned corners. */
function turnedBox(box: Box, t: Tree): Box {
  const corners = [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.left, y: box.bottom },
    { x: box.right, y: box.bottom },
  ].map((q) => turn(q, -spin(t)))
  const xs = corners.map((q) => q.x)
  const ys = corners.map((q) => q.y)
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
}

/**
 * The hub sits around the start at the centre, on the rings branches.yaml gives. On its ring a lesson faces the trees it
 * leads to: the sum of one step toward its tree for every tree lesson it opens, plus
 * what each hub lesson it opens leads to. A lesson whose trees cancel out (or that leads nowhere yet) faces the way its
 * prerequisites face, so a chain stays in one line, and the core chain all faces the way its first lesson does.
 * Neighbours whose labels touch turn apart, keeping a chain on one ring in prerequisite order, and a ring too crowded
 * for that moves outward.
 */
function placeHub(c: Curriculum, boxOf: (id: string) => Box): { at: Map<string, Point>; rings: number[] } {
  const root = c.lessons.find((p) => p.requires.length === 0)!
  const members = c.lessons.filter((p) => p.id === root.id || c.hub.has(p.id))
  const isMember = new Set(members.map((p) => p.id))
  const ring = new Map(members.map((p) => [p.id, p.id === root.id ? 0 : c.hub.get(p.id)!]))
  const treeAngle = new Map(c.trees.flatMap((t) => t.branches.map((b) => [b, t.angle] as const)))
  // the sum of the steps, and how many steps went into it
  const pull = new Map<string, Point & { n: number }>()
  const pullOf = (id: string): Point & { n: number } => {
    if (!pull.has(id)) {
      const sum = { x: 0, y: 0, n: 0 }
      for (const u of c.unlocks.get(id) ?? []) {
        const v = isMember.has(u) ? pullOf(u) : { ...turn({ x: 0, y: -1 }, treeAngle.get(c.byId.get(u)!.branch)!), n: 1 }
        sum.x += v.x
        sum.y += v.y
        sum.n += v.n
      }
      pull.set(id, sum)
    }
    return pull.get(id)!
  }
  const faced = new Map<string, number>([[root.id, 0]])
  const isCore = (id: string) => c.branches.find((b) => b.id === c.byId.get(id)!.branch)!.core
  const coreHead = members.find((p) => isCore(p.id) && !p.requires.some((q) => isMember.has(q) && isCore(q)))
  const facing = (id: string): number => {
    if (coreHead && id !== coreHead.id && isCore(id)) return facing(coreHead.id)
    if (!faced.has(id)) {
      const v = pullOf(id)
      const prereqs = c.byId.get(id)!.requires.filter((q) => isMember.has(q) && q !== root.id)
      faced.set(
        id,
        Math.hypot(v.x, v.y) > L.hubPullAgreement * v.n || !prereqs.length
          ? ((Math.atan2(v.x, -v.y) * 180) / Math.PI + 360) % 360
          : facing(prereqs[0]),
      )
    }
    return faced.get(id)!
  }

  const at = new Map<string, Point>([[root.id, { x: 0, y: 0 }]])
  // the hub is packed tight, so its labels keep apart at the size they grow to when the map is zoomed out
  const grown = (id: string): Box => {
    const b = boxOf(id)
    const k = CONFIG.zoom.labelMaxGrow
    return { left: b.left * k, right: b.right * k, top: b.top * k, bottom: b.bottom * k }
  }
  const touch = (a: string, b: string) => {
    const [pa, pb, ba, bb] = [at.get(a)!, at.get(b)!, grown(a), grown(b)]
    const g = L.treeGap
    return (
      pa.x + ba.left < pb.x + bb.right + g &&
      pb.x + bb.left < pa.x + ba.right + g &&
      pa.y + ba.top < pb.y + bb.bottom + g &&
      pb.y + bb.top < pa.y + ba.bottom + g
    )
  }
  const rings: number[] = []
  for (let r = 1; r <= Math.max(0, ...ring.values()); r++) {
    // lessons facing the same way keep their prerequisites first, so a chain spreads along the ring in order
    const depth = new Map<string, number>()
    const depthOf = (id: string): number => {
      if (!depth.has(id)) depth.set(id, Math.max(0, ...c.byId.get(id)!.requires.filter((q) => ring.get(q) === r).map((q) => depthOf(q) + 1)))
      return depth.get(id)!
    }
    const ids = members
      .filter((p) => ring.get(p.id) === r)
      .map((p) => p.id)
      .sort((a, b) => facing(a) - facing(b) || depthOf(a) - depthOf(b))
    const angle = new Map(ids.map((id) => [id, facing(id)]))
    for (let radius = (rings.at(-1) ?? 0) + L.hubRing; ; radius += L.pushStep) {
      const set = () => ids.forEach((id) => at.set(id, turn({ x: 0, y: -radius }, angle.get(id)!)))
      set()
      for (let round = 0; round < L.pushRounds; round++) {
        let moved = false
        for (const [i, a] of ids.entries()) {
          for (const b of ids.slice(i + 1)) {
            if (!touch(a, b)) continue
            // turn the pair apart, each the short way round from the other
            const d = ((angle.get(b)! - angle.get(a)! + 540) % 360) - 180 || 1
            angle.set(a, angle.get(a)! - Math.sign(d) * L.hubTurnStep)
            angle.set(b, angle.get(b)! + Math.sign(d) * L.hubTurnStep)
            moved = true
          }
        }
        set()
        if (!moved) break
      }
      const inner = members.filter((p) => ring.get(p.id)! < r).map((p) => p.id)
      if (ids.every((a, i) => ids.slice(i + 1).every((b) => !touch(a, b)) && inner.every((b) => !touch(a, b)))) {
        rings.push(radius)
        break
      }
    }
  }
  return { at, rings }
}

interface TreeDraft {
  tree: Tree
  /** circle centres in the tree's own frame (growing down, start at the origin) */
  at: Map<string, Point>
  /** the space each lesson's label takes in the tree's frame, relative to its circle */
  frame: Map<string, Box>
  waypoints: Map<string, { x: number; top: number; bottom: number }>
  chains: { from: string; to: string; via: string[] }[]
}

async function draftTree(c: Curriculum, t: Tree, shapeOf: (id: string) => { size: number; box: Box }): Promise<TreeDraft> {
  const { curriculum: sub, hung } = treeCurriculum(c, t)
  const core = new Set(c.branches.filter((b) => b.core).map((b) => b.id))
  const isTrunk = (from: string, to: string) => [from, to].every((id) => core.has(c.byId.get(id)!.branch))

  const frame = new Map(sub.lessons.map((p) => [p.id, turnedBox(shapeOf(p.id).box, t)]))

  // ELK keeps the layers and in-layer order of orderLayers through each node's starting position. An edge that skips
  // layers is split at invisible waypoints, one per layer it passes, placed where orderLayers put them; each waypoint
  // is as tall as its layer, so the edge runs straight down through the layer and leaves the lessons there alone.
  const order = orderLayers(sub, { restarts: L.orderRestarts, sweeps: L.orderSweeps, seed: L.orderSeed })
  const layerHeight = order.rows.map((row) =>
    Math.max(...row.filter((v) => frame.has(v)).map((v) => frame.get(v)!.bottom - frame.get(v)!.top)),
  )
  const chains = sub.lessons.flatMap((p) =>
    p.requires.map((r) => {
      const via = order.rows.flatMap((row) => row.filter((v) => v.startsWith(`${r}>${p.id}@`)))
      return { from: r, to: p.id, via }
    }),
  )
  // every lesson takes its edges at the near side of its circle and sends them from the far side of its label, both on
  // the circle's axis, and a waypoint passes its edge straight from its top to its bottom
  const port = (node: string, id: string, x: number, y: number, side: string) => ({
    id: `${node}:${id}`,
    x,
    y,
    width: 0,
    height: 0,
    layoutOptions: { 'elk.port.side': side },
  })

  const input: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.edgeRouting': 'SPLINES',
      'elk.spacing.nodeNode': String(L.nodeGap),
      'elk.spacing.edgeNode': String(L.edgeNodeGap),
      'elk.spacing.edgeEdge': String(L.edgeGap),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(L.layerGap),
      'elk.layered.spacing.edgeNodeBetweenLayers': String(L.edgeNodeGap),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.layering.strategy': 'INTERACTIVE',
      'elk.layered.crossingMinimization.strategy': 'INTERACTIVE',
    },
    children: order.rows.flatMap((row, l) =>
      row.map((v, i): ElkNode => {
        const start = { x: i * 100, y: l * 1000 }
        if (!frame.has(v)) {
          return {
            id: v,
            width: 0,
            height: layerHeight[l],
            ...start,
            layoutOptions: { 'elk.portConstraints': 'FIXED_POS', 'elk.spacing.individual': `elk.spacing.nodeNode:${L.edgeGap}` },
            ports: [port(v, 'in', 0, 0, 'NORTH'), port(v, 'out', 0, layerHeight[l], 'SOUTH')],
          }
        }
        const fb = frame.get(v)!
        const height = fb.bottom - fb.top
        return {
          id: v,
          width: fb.right - fb.left,
          height,
          ...start,
          layoutOptions: { 'elk.portConstraints': 'FIXED_POS' },
          ports: [port(v, 'in', -fb.left, -fb.top - shapeOf(v).size, 'NORTH'), port(v, 'out', -fb.left, height, 'SOUTH')],
        }
      }),
    ),
    edges: chains.flatMap(({ from, to, via }) => {
      const stops = [from, ...via, to]
      return stops.slice(1).map(
        (v, k): ElkExtendedEdge => ({
          id: `${from}>${to}#${k}`,
          sources: [`${stops[k]}:out`],
          targets: [`${v}:in`],
          // keep the core chain one straight line down the tree
          layoutOptions: isTrunk(from, to) ? { 'elk.layered.priority.straightness': String(L.trunkStraightness) } : {},
        }),
      )
    }),
  }
  const graph = await new ELK().layout(input)

  const at = new Map<string, Point>()
  const waypoints = new Map<string, { x: number; top: number; bottom: number }>()
  for (const n of graph.children ?? []) {
    if (frame.has(n.id)) at.set(n.id, { x: n.x! - frame.get(n.id)!.left, y: n.y! - frame.get(n.id)!.top })
    else waypoints.set(n.id, { x: n.x!, top: n.y!, bottom: n.y! + n.height! })
  }
  // the start goes to the origin
  const root = sub.lessons.find((p) => p.requires.length === 0)!.id
  const o = at.get(root)!
  for (const [id, p] of at) at.set(id, { x: p.x - o.x, y: p.y - o.y })
  for (const [id, w] of waypoints) waypoints.set(id, { x: w.x - o.x, top: w.top - o.y, bottom: w.bottom - o.y })

  // an edge that only hangs a lesson from the start is not a prerequisite and is not drawn
  return { tree: t, at, frame, waypoints, chains: chains.filter((e) => !(e.from === root && hung.has(e.to))) }
}

export async function computeLayout(c: Curriculum): Promise<Layout> {
  const core = new Set(c.branches.filter((b) => b.core).map((b) => b.id))
  const isCore = (id: string) => core.has(c.byId.get(id)!.branch)
  const root = c.lessons.find((p) => p.requires.length === 0)!
  const treeOfBranch = new Map(c.trees.flatMap((t) => t.branches.map((b) => [b, t] as const)))
  const treeOf = (id: string) => (id === root.id || c.hub.has(id) ? undefined : treeOfBranch.get(c.byId.get(id)!.branch)!)
  const shapes = new Map(
    c.lessons.map((p) => {
      const size = nodeSize(p)
      const label = labelLines(p.title)
      const t = treeOf(p.id)
      const labelAbove = t ? labelAboveIn(t) : false
      return [p.id, { size, label, labelAbove, box: boxFor(size, label, p.id === root.id, labelAbove) }]
    }),
  )
  const { at: hub, rings } = placeHub(c, (id) => shapes.get(id)!.box)
  const drafts = await Promise.all(c.trees.map((t) => draftTree(c, t, (id) => shapes.get(id)!)))
  const draftOf = new Map(drafts.map((d) => [d.tree.id, d]))
  const inHub = (id: string) => hub.has(id)

  // a tree moves away from the centre, along its own direction, by its offset; the hub stays put, and every tree starts
  // outside the outermost ring
  const outer = rings.at(-1) ?? 0
  const offset = new Map([['', 0], ...c.trees.map((t) => [t.id, outer] as const)])
  const toScreen = (d: TreeDraft, p: Point) => turn({ x: p.x, y: p.y + offset.get(d.tree.id)! }, spin(d.tree))
  const place = (id: string): Point => {
    const t = treeOf(id)
    if (!t) return hub.get(id)!
    const d = draftOf.get(t.id)!
    return toScreen(d, d.at.get(id)!)
  }

  // push apart trees whose labels touch, the smaller tree first, so the largest tree keeps its place
  const lessonsOf = (t: Tree) => c.lessons.filter((p) => treeOf(p.id) === t).map((p) => p.id)
  const touch = (a: string, b: string) => {
    const [pa, pb] = [place(a), place(b)]
    const [ba, bb] = [shapes.get(a)!.box, shapes.get(b)!.box]
    const g = L.treeGap
    return (
      pa.x + ba.left < pb.x + bb.right + g &&
      pb.x + bb.left < pa.x + ba.right + g &&
      pa.y + ba.top < pb.y + bb.bottom + g &&
      pb.y + bb.top < pa.y + ba.bottom + g
    )
  }
  const bySize = [...c.trees].sort((a, b) => lessonsOf(a).length - lessonsOf(b).length || a.id.localeCompare(b.id))
  for (let round = 0; round < L.pushRounds; round++) {
    const t = bySize.find((t) => {
      const others = c.lessons.map((p) => p.id).filter((id) => treeOf(id) !== t)
      return lessonsOf(t).some((a) => others.some((b) => touch(a, b)))
    })
    if (!t) break
    offset.set(t.id, offset.get(t.id)! + L.pushStep)
  }

  const nodes = new Map<string, NodePos>()
  for (const p of c.lessons) {
    const { size, label, labelAbove, box } = shapes.get(p.id)!
    nodes.set(p.id, { id: p.id, ...place(p.id), size, label, labelAbove, box, core: isCore(p.id), tree: treeOf(p.id)?.id ?? '' })
  }

  const edges: Edge[] = []
  const drawn = new Set<string>()
  // lessons in the hub only sit on their rings: no edge joins two of them
  for (const d of drafts) {
    for (const { from, to, via } of d.chains) {
      // in a tree the start stands for the whole hub: the edge comes off the outermost ring, one for each hub lesson the
      // lesson requires so each still lights with it. A lesson that also builds on lessons outside the hub is reached
      // through them, so its edge from the ring is drawn faint like an edge from another tree
      const sources = from === root.id ? c.byId.get(to)!.requires.filter(inHub) : [from]
      const aside = c.byId.get(to)!.requires.some((r) => !inHub(r))
      const b = d.at.get(to)!
      const rest = [
        ...via.flatMap((v) => {
          const w = d.waypoints.get(v)!
          return [
            { x: w.x, y: w.top },
            { x: w.x, y: w.bottom },
          ]
        }),
        { x: b.x, y: b.y - shapes.get(to)!.size },
      ]
      for (const q of sources) {
        let first: Point
        if (inHub(q)) {
          // the point of the ring straight above the edge's next stop, in the tree's frame where the centre is at
          // (0, -offset)
          const x = Math.max(-L.hubExit * outer, Math.min(L.hubExit * outer, rest[0].x))
          first = { x, y: Math.sqrt(outer * outer - x * x) - offset.get(d.tree.id)! }
        } else {
          const a = d.at.get(q)!
          first = { x: a.x, y: a.y + turnedBox(shapes.get(q)!.box, d.tree).bottom }
        }
        const trunk = isCore(q) && isCore(to)
        edges.push({ from: q, to, trunk, bridge: inHub(q) && aside, ...treeCurve([first, ...rest], (p) => toScreen(d, p)) })
        drawn.add(`${q}>${to}`)
      }
    }
  }

  // a prerequisite in another tree: a cubic that leaves along the first tree's direction and arrives along the second's,
  // each blended with the straight line so it does not loop wide
  const along = (t: Tree | undefined, fallback: Point) => (t ? turn({ x: 0, y: 1 }, spin(t)) : fallback)
  for (const p of c.lessons) {
    for (const q of p.requires) {
      if (drawn.has(`${q}>${p.id}`) || (inHub(q) && inHub(p.id))) continue
      const [a, b] = [nodes.get(q)!, nodes.get(p.id)!]
      const toward = unit({ x: b.x - a.x, y: b.y - a.y })
      const [ua, ub] = [along(treeOf(q), toward), along(treeOf(p.id), toward)]
      const out = unit({ x: ua.x + toward.x, y: ua.y + toward.y })
      const inward = unit({ x: ub.x + toward.x, y: ub.y + toward.y })
      const start = { x: a.x + out.x * a.size, y: a.y + out.y * a.size }
      const end = { x: b.x - inward.x * b.size, y: b.y - inward.y * b.size }
      const k = Math.hypot(end.x - start.x, end.y - start.y) * L.edgeBend
      const c1 = { x: start.x + out.x * k, y: start.y + out.y * k }
      const c2 = { x: end.x - inward.x * k, y: end.y - inward.y * k }
      const points = [start]
      bezier(start, c1, c2, end, points)
      edges.push({ from: q, to: p.id, trunk: false, bridge: true, path: `M${f(start)}C${f(c1)} ${f(c2)} ${f(end)}`, points })
    }
  }

  // the lines between the trees' areas leave the rim through the middle of the gap between two neighbouring trees, as
  // seen from the centre, and run out to the edge of the map
  const deg = (p: Point) => (Math.atan2(p.x, -p.y) * 180) / Math.PI
  const spread = (t: Tree) => {
    const offs = [...nodes.values()]
      .filter((n) => n.tree === t.id)
      .flatMap((n) => [
        { x: n.x + n.box.left, y: n.y + n.box.top },
        { x: n.x + n.box.right, y: n.y + n.box.top },
        { x: n.x + n.box.left, y: n.y + n.box.bottom },
        { x: n.x + n.box.right, y: n.y + n.box.bottom },
      ])
      .map((p) => ((deg(p) - t.angle + 540) % 360) - 180)
    return { min: Math.min(...offs), max: Math.max(...offs) }
  }
  const reach = Math.max(...[...nodes.values()].map((n) => Math.hypot(n.x, n.y) + Math.hypot(n.box.right - n.box.left, n.box.bottom - n.box.top)))
  const around = [...c.trees].sort((a, b) => a.angle - b.angle)
  // the line after each tree, clockwise
  const after = new Map(
    around.map((t, i) => {
      const next = around[(i + 1) % around.length]
      const from = t.angle + spread(t).max
      const to = next.angle + spread(next).min
      return [t.id, from + ((((to - from) % 360) + 360) % 360) / 2] as const
    }),
  )
  const dividers = [...after.values()].map((a) => ({ from: turn({ x: 0, y: -outer }, a), to: turn({ x: 0, y: -reach }, a) }))

  // each tree's area is the wedge between the line before it and the line after it; its name is written large and faint
  // like a background, as near as it can to the middle of the tree's lessons (the middle of their distances from the
  // centre) without covering a lesson, kept inside the wedge and off the hub; if no spot is free of lessons, it sits
  // behind them at the nearest spot in the wedge
  const sectors: Sector[] = []
  const S = CONFIG.sector
  for (const [i, t] of around.entries()) {
    const start = after.get(around[(i + around.length - 1) % around.length].id)!
    const end = after.get(t.id)!
    const lo = ((start - t.angle + 540) % 360) - 180
    const hi = ((end - t.angle + 540) % 360) - 180
    const lines = t.title.split(' · ')
    const width = Math.max(...lines.map((l) => l.length)) * S.charWidth
    const height = lines.length * S.lineHeight
    const fits = (x: number, y: number) => {
      const [hw, hh] = [width / 2, height / 2]
      for (const [dx, dy] of [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]]) {
        const off = ((deg({ x: x + dx, y: y + dy }) - t.angle + 540) % 360) - 180
        if (off < lo + S.angleGap || off > hi - S.angleGap) return false
      }
      return Math.hypot(Math.max(Math.abs(x) - hw, 0), Math.max(Math.abs(y) - hh, 0)) >= outer + S.gap
    }
    const bare = (x: number, y: number) =>
      [...nodes.values()].every(
        (n) =>
          x + width / 2 + S.gap < n.x + n.box.left ||
          x - width / 2 - S.gap > n.x + n.box.right ||
          y + height / 2 + S.gap < n.y + n.box.top ||
          y - height / 2 - S.gap > n.y + n.box.bottom,
      )
    const dists = [...nodes.values()].filter((n) => n.tree === t.id).map((n) => Math.hypot(n.x, n.y)).sort((a, b) => a - b)
    const anchor = turn({ x: 0, y: -(dists[Math.floor(dists.length / 2)] ?? outer * 2) }, t.angle)
    const nearest = (ok: (x: number, y: number) => boolean) => {
      for (let r = 0; r <= S.searchRadius; r += S.searchStep) {
        for (let a = 0; a < 360; a += r ? Math.max(5, (S.searchStep / r) * (180 / Math.PI)) : 360) {
          const p = { x: anchor.x + r * Math.sin((a * Math.PI) / 180), y: anchor.y - r * Math.cos((a * Math.PI) / 180) }
          if (ok(p.x, p.y)) return p
        }
      }
      return undefined
    }
    const spot = nearest((x, y) => fits(x, y) && bare(x, y)) ?? nearest(fits) ?? anchor
    sectors.push({ tree: t.id, lines, ...spot, width, height, start, end: start + ((((end - start) % 360) + 360) % 360) })
  }

  const xs: number[] = []
  const ys: number[] = []
  for (const n of nodes.values()) {
    xs.push(n.x + n.box.left, n.x + n.box.right)
    ys.push(n.y + n.box.top, n.y + n.box.bottom)
  }
  for (const e of edges) for (const pt of e.points) {
    xs.push(pt.x)
    ys.push(pt.y)
  }
  xs.push(-outer, outer)
  ys.push(-outer, outer)
  return {
    nodes,
    edges,
    rings,
    rim: outer,
    sectors,
    dividers,
    reach,
    bounds: { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) },
  }
}
