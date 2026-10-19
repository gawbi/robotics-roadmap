import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js'
import { CONFIG } from '../config'
import { orderLayers } from './order'
import type { Curriculum, Lesson } from './types'

// Layered (Sugiyama) layout: prerequisites above, the lessons they open below. orderLayers picks the layers and the
// left-to-right order with few crossings, ELK places the nodes on that order, and every edge is drawn as vertical
// S-curves between the layers, so no edge runs through a lesson.
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

/** Through the points top to bottom, each step a cubic that leaves and arrives vertically. */
function curve(stops: Point[]): { path: string; points: Point[] } {
  const f = (p: Point) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  let path = `M${f(stops[0])}`
  const points: Point[] = [stops[0]]
  for (let i = 1; i < stops.length; i++) {
    const [p0, p1] = [stops[i - 1], stops[i]]
    const mid = (p0.y + p1.y) / 2
    const [c1, c2] = [{ x: p0.x, y: mid }, { x: p1.x, y: mid }]
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

  // ELK keeps the layers and in-layer order of orderLayers through each node's starting position. An edge that skips
  // layers is split at invisible waypoints, one per layer it passes, placed where orderLayers put them; each waypoint
  // is as tall as its layer, so the edge runs straight down through the layer and leaves the lessons there alone.
  const order = orderLayers(c, { restarts: L.orderRestarts, sweeps: L.orderSweeps, seed: L.orderSeed })
  const layerHeight = order.rows.map((row) =>
    Math.max(...row.filter((v) => shapes.has(v)).map((v) => shapes.get(v)!.box.bottom - shapes.get(v)!.box.top)),
  )
  const chains = c.lessons.flatMap((p) =>
    p.requires.map((r) => {
      const via = order.rows.flatMap((row) => row.filter((v) => v.startsWith(`${r}>${p.id}@`)))
      return { from: r, to: p.id, via }
    }),
  )
  // every lesson takes its edges at the top of its circle and sends them from under its label, both on the circle's
  // axis, and a waypoint passes its edge straight from its top to its bottom
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
        const at = { x: i * 100, y: l * 1000 }
        if (!shapes.has(v)) {
          return {
            id: v,
            width: 0,
            height: layerHeight[l],
            ...at,
            layoutOptions: { 'elk.portConstraints': 'FIXED_POS', 'elk.spacing.individual': `elk.spacing.nodeNode:${L.edgeGap}` },
            ports: [port(v, 'in', 0, 0, 'NORTH'), port(v, 'out', 0, layerHeight[l], 'SOUTH')],
          }
        }
        const { size, box } = shapes.get(v)!
        const height = box.bottom - box.top
        return {
          id: v,
          width: box.right - box.left,
          height,
          ...at,
          layoutOptions: { 'elk.portConstraints': 'FIXED_POS' },
          ports: [port(v, 'in', -box.left, -box.top - size, 'NORTH'), port(v, 'out', -box.left, height, 'SOUTH')],
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
          // keep the core chain one straight line down the graph
          layoutOptions: isTrunk(from, to) ? { 'elk.layered.priority.straightness': String(L.trunkStraightness) } : {},
        }),
      )
    }),
  }
  const graph = await new ELK().layout(input)

  const nodes = new Map<string, NodePos>()
  const waypoints = new Map<string, { x: number; top: number; bottom: number }>()
  for (const n of graph.children ?? []) {
    if (!shapes.has(n.id)) {
      waypoints.set(n.id, { x: n.x!, top: n.y!, bottom: n.y! + n.height! })
      continue
    }
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

  const edges: Edge[] = chains.map(({ from, to, via }) => {
    const [a, b] = [nodes.get(from)!, nodes.get(to)!]
    const stops = [
      { x: a.x, y: a.y + a.box.bottom },
      ...via.flatMap((v) => {
        const w = waypoints.get(v)!
        return [
          { x: w.x, y: w.top },
          { x: w.x, y: w.bottom },
        ]
      }),
      { x: b.x, y: b.y - b.size },
    ]
    return { from, to, trunk: isTrunk(from, to), ...curve(stops) }
  })

  return { nodes, edges, bounds: { left: 0, top: 0, right: graph.width ?? 0, bottom: graph.height ?? 0 } }
}
