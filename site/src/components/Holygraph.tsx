import { select } from 'd3-selection'
import 'd3-transition'
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from 'd3-zoom'
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { CONFIG } from '../config'
import type { Layout } from '../curriculum/layout'
import { polarPoint } from '../curriculum/layout'
import { ancestors } from '../curriculum/parse'
import { nodeState, type ProgressFile } from '../curriculum/progress'
import type { Curriculum, NodeState } from '../curriculum/types'

export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface GraphControls {
  zoomIn(): void
  zoomOut(): void
  fit(): void
}

interface Props {
  curriculum: Curriculum
  layout: Layout
  progress: ProgressFile
  selectedId: string | null
  hoverId: string | null
  hoverBranch: string | null
  insets: Insets
  /** inside an iframe: plain wheel and one-finger drags scroll the host page instead of the graph */
  wheelNeedsModifier?: boolean
  onSelect(id: string): void
  onHover(id: string | null): void
  onBlockedWheel?(): void
  ref?: Ref<GraphControls>
}

const STATE_LABEL: Record<NodeState, string> = {
  done: '완료',
  in_progress: '진행 중',
  available: '시작 가능',
  locked: '선수 과제 남음',
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function wedgePath(r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => polarPoint(r, a)
  const large = a1 - a0 > Math.PI ? 1 : 0
  const s0 = p(r0, a0)
  const s1 = p(r1, a0)
  const e1 = p(r1, a1)
  const e0 = p(r0, a1)
  return [
    `M${s0.x},${s0.y}`,
    `L${s1.x},${s1.y}`,
    `A${r1},${r1} 0 ${large} 1 ${e1.x},${e1.y}`,
    `L${e0.x},${e0.y}`,
    `A${r0},${r0} 0 ${large} 0 ${s0.x},${s0.y}`,
    'Z',
  ].join('')
}

export function Holygraph({
  curriculum: c,
  layout,
  progress,
  selectedId,
  hoverId,
  hoverBranch,
  insets,
  wheelNeedsModifier = false,
  onSelect,
  onHover,
  onBlockedWheel,
  ref,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const viewportRef = useRef<SVGGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const insetsRef = useRef(insets)
  insetsRef.current = insets

  const branchById = useMemo(() => new Map(c.branches.map((b) => [b.id, b])), [c])
  const states = useMemo(
    () => new Map(c.projects.map((p) => [p.id, nodeState(c, progress, p.id)])),
    [c, progress],
  )

  // what to emphasise: the hovered (or selected) node's prerequisite chain and what it opens
  const focusId = hoverId ?? selectedId
  const emphasis = useMemo(() => {
    if (hoverBranch) {
      return new Set(c.projects.filter((p) => p.branch === hoverBranch).map((p) => p.id))
    }
    if (!focusId) return null
    const set = ancestors(c, focusId)
    set.add(focusId)
    for (const id of c.unlocks.get(focusId) ?? []) set.add(id)
    return set
  }, [c, focusId, hoverBranch])

  const sizeOf = () => {
    const el = svgRef.current!
    return { w: el.clientWidth, h: el.clientHeight }
  }

  const fitTransform = (minScale: number = CONFIG.zoom.min) => {
    const { w, h } = sizeOf()
    const i = insetsRef.current
    const pad = CONFIG.zoom.fitPadding
    const aw = Math.max(80, w - i.left - i.right - pad * 2)
    const ah = Math.max(80, h - i.top - i.bottom - pad * 2)
    const R = layout.outerRadius
    const k = Math.min(CONFIG.zoom.max, Math.max(minScale, Math.min(aw, ah) / (2 * R)))
    const cx = i.left + pad + aw / 2
    const cy = i.top + pad + ah / 2
    return zoomIdentity.translate(cx, cy).scale(k)
  }

  const apply = (t: ReturnType<typeof fitTransform>, animate = true) => {
    const svg = select(svgRef.current!)
    const z = zoomRef.current!
    if (animate && !reducedMotion()) svg.transition().duration(450).call(z.transform, t)
    else svg.call(z.transform, t)
  }

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomRef.current && select(svgRef.current!).transition().duration(200).call(zoomRef.current.scaleBy, 1.35),
    zoomOut: () => zoomRef.current && select(svgRef.current!).transition().duration(200).call(zoomRef.current.scaleBy, 1 / 1.35),
    fit: () => apply(fitTransform()),
  }))

  useEffect(() => {
    const svg = select(svgRef.current!)
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([CONFIG.zoom.min, CONFIG.zoom.max])
      .on('zoom', (e) => {
        viewportRef.current!.setAttribute('transform', e.transform.toString())
        svgRef.current!.toggleAttribute('data-far', e.transform.k < CONFIG.zoom.labelMinScale)
      })
    if (wheelNeedsModifier) {
      z.filter((e: MouseEvent | WheelEvent | TouchEvent) => {
        if (e.type === 'wheel') return e.ctrlKey || e.metaKey
        if ('touches' in e) return e.touches.length > 1
        return !e.ctrlKey && !(e as MouseEvent).button
      })
    }
    zoomRef.current = z
    svg.call(z).on('dblclick.zoom', null)
    if (wheelNeedsModifier) {
      svg.on('wheel.hint', (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) onBlockedWheel?.()
      })
    }
    apply(fitTransform(CONFIG.zoom.initialMinScale), false)
    const onResize = () => apply(fitTransform(CONFIG.zoom.initialMinScale), false)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      svg.on('.zoom', null).on('wheel.hint', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  // bring the selected node into the visible area beside the panel
  useEffect(() => {
    if (!selectedId || !zoomRef.current) return
    const n = layout.nodes.get(selectedId)!
    const { w, h } = sizeOf()
    const i = insetsRef.current
    const k = Math.max(zoomTransform(svgRef.current!).k, 0.8)
    const cx = i.left + (w - i.left - i.right) / 2
    const cy = i.top + (h - i.top - i.bottom) / 2
    apply(zoomIdentity.translate(cx - n.x * k, cy - n.y * k).scale(k))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const L = CONFIG.layout
  const innerWedge = L.hubRadius + L.ringGap * 0.5
  const outerWedge = layout.labelRadius - L.branchLabelGap * 0.5
  const hubIds = c.projects.filter((p) => layout.nodes.get(p.id)!.rank === 0).map((p) => p.id)

  return (
    <svg
      ref={svgRef}
      className="holygraph"
      data-embed={wheelNeedsModifier || undefined}
      role="group"
      aria-label="과제 선수 관계 그래프"
      onClick={(e) => {
        if (e.target === svgRef.current) onHover(null)
      }}
    >
      <g ref={viewportRef}>
        <g className="hg-sectors" aria-hidden="true">
          {layout.sectors.map((s) => (
            <g key={s.branch.id}>
              <path
                d={wedgePath(innerWedge, outerWedge, s.start, s.end)}
                fill={s.branch.color}
                className={`hg-wedge ${hoverBranch === s.branch.id ? 'is-hot' : ''}`}
              />
              <line
                {...(() => {
                  const a = polarPoint(innerWedge, s.start)
                  const b = polarPoint(outerWedge + 24, s.start)
                  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
                })()}
                className="hg-sector-edge"
              />
            </g>
          ))}
          {layout.rings.map((r) => (
            <circle key={r} r={r} className="hg-ring" />
          ))}
          <circle r={L.hubRadius + 36} className="hg-hub" />
        </g>

        <g className="hg-sector-labels" aria-hidden="true">
          {layout.sectors.map((s) => {
            const mid = (s.start + s.end) / 2
            const { x, y } = polarPoint(layout.labelRadius, mid)
            const anchor = Math.abs(x) < 40 ? 'middle' : x > 0 ? 'start' : 'end'
            return (
              <text
                key={s.branch.id}
                x={x}
                y={y}
                className="hg-sector-label"
                textAnchor={anchor}
                dominantBaseline="middle"
                fill={s.branch.color}
              >
                {s.branch.title.toUpperCase()}
              </text>
            )
          })}
        </g>

        <g className="hg-edges" aria-hidden="true">
          {layout.edges.map((e) => {
            const from = states.get(e.from)!
            const to = states.get(e.to)!
            const kind = from === 'done' && to === 'done' ? 'done' : from === 'done' ? 'open' : 'locked'
            const lit = emphasis ? emphasis.has(e.from) && emphasis.has(e.to) : false
            const color = branchById.get(c.byId.get(e.to)!.branch)!.color
            return (
              <path
                key={`${e.from}>${e.to}`}
                d={e.path}
                className={`hg-edge is-${kind} ${lit ? 'is-lit' : ''} ${emphasis && !lit ? 'is-dim' : ''}`}
                stroke={kind === 'locked' && !lit ? undefined : color}
              />
            )
          })}
        </g>

        <g className="hg-nodes">
          {[...layout.nodes.values()].map((n) => {
            const p = c.byId.get(n.id)!
            const branch = branchById.get(p.branch)!
            const state = states.get(n.id)!
            const dim = emphasis ? !emphasis.has(n.id) : false
            const selected = selectedId === n.id
            const labelY = n.size + L.labelOffset + L.labelFontSize * 0.8
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className={`hg-node is-${state} ${dim ? 'is-dim' : ''} ${selected ? 'is-selected' : ''} ${
                  hubIds.includes(n.id) ? 'is-hub' : ''
                }`}
                style={{ ['--branch' as string]: branch.color }}
                role="button"
                tabIndex={0}
                aria-label={`${p.title}, ${branch.title}, 약 ${p.hours}시간, ${STATE_LABEL[state]}`}
                aria-pressed={selected}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(n.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(n.id)
                  }
                }}
                onMouseEnter={() => onHover(n.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(n.id)}
                onBlur={() => onHover(null)}
              >
                <circle r={n.size + 14} className="hg-hit" />
                {state === 'available' && <circle r={n.size + 5} className="hg-halo" />}
                {state === 'in_progress' && <circle r={n.size + 5} className="hg-orbit" />}
                {selected && <circle r={n.size + 9} className="hg-selected" />}
                <circle r={n.size} className="hg-core" />
                {n.radius === 0 && state === 'available' && (
                  <text className="hg-start" y={-n.size - 12} textAnchor="middle">
                    START
                  </text>
                )}
                {state === 'done' && (
                  <path
                    d={`M${-n.size * 0.38},0 L${-n.size * 0.08},${n.size * 0.3} L${n.size * 0.42},${-n.size * 0.32}`}
                    className="hg-check"
                  />
                )}
                <text className="hg-label" y={labelY} textAnchor="middle">
                  {n.label.map((line, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? 0 : L.labelLineHeight}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}
