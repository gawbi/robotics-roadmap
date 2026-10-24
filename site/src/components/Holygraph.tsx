import { select } from 'd3-selection'
import 'd3-transition'
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from 'd3-zoom'
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { CONFIG } from '../config'
import type { Layout } from '../curriculum/layout'
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
  onSelect(id: string): void
  onBackgroundClick(): void
  onHover(id: string | null): void
  ref?: Ref<GraphControls>
}

const STATE_LABEL: Record<NodeState, string> = {
  done: '완료',
  in_progress: '진행 중',
  available: '시작 가능',
  locked: '선수 강의 남음',
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Holygraph({
  curriculum: c,
  layout,
  progress,
  selectedId,
  hoverId,
  hoverBranch,
  insets,
  onSelect,
  onBackgroundClick,
  onHover,
  ref,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const viewportRef = useRef<SVGGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const insetsRef = useRef(insets)
  insetsRef.current = insets

  const branchById = useMemo(() => new Map(c.branches.map((b) => [b.id, b])), [c])
  const states = useMemo(
    () => new Map(c.lessons.map((p) => [p.id, nodeState(c, progress, p.id)])),
    [c, progress],
  )

  // what to emphasise: the hovered (or selected) node's prerequisite chain and what it opens
  const focusId = hoverId ?? selectedId
  const emphasis = useMemo(() => {
    if (hoverBranch) {
      return new Set(c.lessons.filter((p) => p.branch === hoverBranch).map((p) => p.id))
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

  // whole map when it fits at minScale or larger; otherwise centred on the start, which sits at the origin
  const fitTransform = (minScale: number = CONFIG.zoom.min) => {
    const { w, h } = sizeOf()
    const i = insetsRef.current
    const pad = CONFIG.zoom.fitPadding
    const aw = Math.max(80, w - i.left - i.right - pad * 2)
    const ah = Math.max(80, h - i.top - i.bottom - pad * 2)
    const b = layout.bounds
    const bw = b.right - b.left
    const bh = b.bottom - b.top
    const k = Math.min(CONFIG.zoom.max, Math.max(minScale, Math.min(aw / bw, ah / bh)))
    const fits = bw * k <= aw && bh * k <= ah
    const tx = i.left + pad + aw / 2 - (fits ? (b.left + b.right) / 2 : 0) * k
    const ty = i.top + pad + ah / 2 - (fits ? (b.top + b.bottom) / 2 : 0) * k
    return zoomIdentity.translate(tx, ty).scale(k)
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
        const grow = Math.min(Math.max(CONFIG.zoom.labelMinPx / (CONFIG.layout.labelFontSize * e.transform.k), 1), CONFIG.zoom.labelMaxGrow)
        svgRef.current!.style.setProperty('--label-grow', grow.toFixed(3))
      })
    zoomRef.current = z
    svg.call(z).on('dblclick.zoom', null)
    apply(fitTransform(CONFIG.zoom.initialMinScale), false)
    const onResize = () => apply(fitTransform(CONFIG.zoom.initialMinScale), false)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      svg.on('.zoom', null)
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
  const coreColor = c.branches.find((b) => b.core)!.color

  return (
    <svg
      ref={svgRef}
      className="holygraph"
      role="group"
      aria-label="강의 선수 관계 그래프"
      onClick={(e) => {
        // d3-zoom swallows the click that ends a pan, so this only fires on a plain click off the nodes
        if ((e.target as Element).closest('.hg-node')) return
        onHover(null)
        onBackgroundClick()
      }}
    >
      <defs>
        <marker
          id="hg-trunk-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,1 L9,5 L0,9 Z" fill={coreColor} />
        </marker>
        {/* each tree's tint is strongest at the rim and fades out toward the edge of the map */}
        {c.trees.map((t) => (
          <radialGradient key={t.id} id={`hg-area-${t.id}`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={layout.reach}>
            <stop offset={layout.rim / layout.reach} stopColor={t.color} stopOpacity={0.09} />
            <stop offset={1} stopColor={t.color} stopOpacity={0} />
          </radialGradient>
        ))}
        <radialGradient id="hg-hub" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={layout.rim}>
          <stop offset={0} stopColor="var(--accent)" stopOpacity={0.1} />
          <stop offset={1} stopColor="var(--accent)" stopOpacity={0.02} />
        </radialGradient>
      </defs>
      <g ref={viewportRef}>
        <g className="hg-rings" aria-hidden="true">
          {layout.sectors.map((r) => {
            const at = (radius: number, deg: number) => {
              const a = (deg * Math.PI) / 180
              return `${(radius * Math.sin(a)).toFixed(1)},${(-radius * Math.cos(a)).toFixed(1)}`
            }
            // the tint runs far past the map so its outer edge never shows
            const [inner, outer] = [layout.rim, layout.reach * 4]
            const large = r.end - r.start > 180 ? 1 : 0
            return (
              <path
                key={r.tree}
                className="hg-area"
                fill={`url(#hg-area-${r.tree})`}
                d={`M${at(inner, r.start)}L${at(outer, r.start)}A${outer},${outer} 0 ${large} 1 ${at(outer, r.end)}L${at(inner, r.end)}A${inner},${inner} 0 ${large} 0 ${at(inner, r.start)}Z`}
              />
            )
          })}
          {layout.dividers.map((d, i) => (
            <line key={i} x1={d.from.x} y1={d.from.y} x2={d.to.x} y2={d.to.y} className="hg-divider" />
          ))}
          <circle r={layout.rim} className="hg-hub" fill="url(#hg-hub)" />
          {layout.rings.map((r) => (
            <circle key={r} r={r} className={`hg-ring ${r === layout.rim ? 'is-rim' : ''}`} />
          ))}
        </g>
        <g className="hg-sectors" aria-hidden="true">
          {layout.sectors.map((r) => (
            <g key={r.tree} transform={`translate(${r.x},${r.y})`}>
              <text className="hg-sector" textAnchor="middle" dominantBaseline="central" fill={c.trees.find((t) => t.id === r.tree)!.color}>
                {r.lines.map((line, i) => (
                  <tspan key={i} x={0} y={(i - (r.lines.length - 1) / 2) * CONFIG.sector.lineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
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
                className={`hg-edge is-${kind} ${e.trunk ? 'is-trunk' : ''} ${e.bridge ? 'is-bridge' : ''} ${lit ? 'is-lit' : ''} ${
                  emphasis && !lit ? 'is-dim' : ''
                }`}
                stroke={e.trunk || kind !== 'locked' || lit ? color : undefined}
                markerEnd={e.trunk ? 'url(#hg-trunk-arrow)' : undefined}
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
            // a label above the circle ends just over it; one below starts just under it
            const labelY = n.labelAbove
              ? -n.size - L.labelOffset - L.labelFontSize * 0.25 - (n.label.length - 1) * L.labelLineHeight
              : n.size + L.labelOffset + L.labelFontSize * 0.8
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className={`hg-node is-${state} ${dim ? 'is-dim' : ''} ${selected ? 'is-selected' : ''} ${
                  n.core ? 'is-core' : ''
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
                {p.requires.length === 0 && state === 'available' && (
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
