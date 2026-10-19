import ELK, { type ElkExtendedEdge, type ElkNode, type ElkPoint } from 'elkjs/lib/elk.bundled.js'
import { CONFIG } from '../config'
import type { Curriculum, Lesson } from './types'

// Layered (Sugiyama) layout from ELK: prerequisites above, the lessons they open below.
// ELK assigns layers, inserts dummy nodes for edges that skip layers, minimises crossings
// and routes every edge as a spline between the layers, so no edge runs through a lesson.
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
  /** node circle plus label, relative to (x, y) */
  box: Box
  /** part of the core branch */
  core: boolean
}

export interface Edge {
  from: string
  to: string
  path: string
  /** the path sampled as a polyline */
  points: Point[]
  /** prerequisite edge inside the core branch; drawn as the graph's trunk */
  trunk: boolean
}

export interface Layout {
  nodes: Map<string, NodePos>
  edges: Edge[]
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

function boxFor(size: number, label: string[], startTag: boolean): Box {
  const textWidth = Math.max(...label.map((l) => l.length)) * L.labelCharWidth
  const half = Math.max(size, textWidth / 2) + L.boxPad / 2
  return {
    left: -half,
    right: half,
    top: -size - (startTag ? L.startTagHeight : 0),
    bottom: size + L.labelOffset + label.length * L.labelLineHeight,
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

/** ELK spline sections are cubic Béziers: the start point, then (control, control, end) triples. */
function curve(pts: ElkPoint[]): { path: string; points: Point[] } {
  const f = (p: ElkPoint) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  const rest = pts.slice(1)
  if (rest.length % 3 !== 0) {
    return { path: `M${pts.map(f).join('L')}`, points: pts.map((p) => ({ x: p.x, y: p.y })) }
  }
  let path = `M${f(pts[0])}`
  const points: Point[] = [{ x: pts[0].x, y: pts[0].y }]
  for (let i = 0; i < rest.length; i += 3) {
    const p0 = i === 0 ? pts[0] : rest[i - 1]
    const [c1, c2, p1] = [rest[i], rest[i + 1], rest[i + 2]]
    path += `C${f(c1)} ${f(c2)} ${f(p1)}`
    for (let k = 1; k <= L.curveSamples; k++) {
      const t = k / L.curveSamples
      const u = 1 - t
      points.push({
        x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
        y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
      })
    }
  }
  return { path, points }
}

export async function computeLayout(c: Curriculum): Promise<Layout> {
  const core = new Set(c.branches.filter((b) => b.core).map((b) => b.id))
  const isCore = (id: string) => core.has(c.byId.get(id)!.branch)
  const isTrunk = (from: string, to: string) => isCore(from) && isCore(to)
  const shapes = new Map(
    c.lessons.map((p) => {
      const size = nodeSize(p)
      const label = labelLines(p.title)
      return [p.id, { size, label, box: boxFor(size, label, p.requires.length === 0) }]
    }),
  )

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
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    // core lessons get a port under the label and one on top of the circle, both on the circle's axis, and every edge
    // of a core lesson uses them: the trunk runs straight through the circles and side branches leave from its centre
    children: c.lessons.map((p) => {
      const { size, box } = shapes.get(p.id)!
      const width = box.right - box.left
      const height = box.bottom - box.top
      const port = (id: string, y: number, side: string) => ({
        id: `${p.id}:${id}`,
        x: -box.left,
        y,
        width: 0,
        height: 0,
        layoutOptions: { 'elk.port.side': side },
      })
      return {
        id: p.id,
        width,
        height,
        ...(core.has(p.branch) && {
          layoutOptions: { 'elk.portConstraints': 'FIXED_POS' },
          ports: [port('in', -box.top - size, 'NORTH'), port('out', height, 'SOUTH')],
        }),
      }
    }),
    edges: c.lessons.flatMap((p) =>
      p.requires.map(
        (r): ElkExtendedEdge => ({
          id: `${r}>${p.id}`,
          sources: [isCore(r) ? `${r}:out` : r],
          targets: [isCore(p.id) ? `${p.id}:in` : p.id],
          // keep the core chain one straight line down the graph
          layoutOptions: isTrunk(r, p.id) ? { 'elk.layered.priority.straightness': String(L.trunkStraightness) } : {},
        }),
      ),
    ),
  }
  const graph = await new ELK().layout(input)

  const nodes = new Map<string, NodePos>()
  for (const n of graph.children ?? []) {
    const { size, label, box } = shapes.get(n.id)!
    nodes.set(n.id, {
      id: n.id,
      x: n.x! - box.left,
      y: n.y! - box.top,
      size,
      label,
      box,
      core: isCore(n.id),
    })
  }

  const edges: Edge[] = (graph.edges ?? []).map((e) => {
    const s = e.sections![0]
    const [from, to] = [e.sources[0].replace(/:out$/, ''), e.targets[0].replace(/:in$/, '')]
    return { from, to, trunk: isTrunk(from, to), ...curve([s.startPoint, ...(s.bendPoints ?? []), s.endPoint]) }
  })

  return { nodes, edges, bounds: { left: 0, top: 0, right: graph.width ?? 0, bottom: graph.height ?? 0 } }
}
