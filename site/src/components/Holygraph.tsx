import { select } from 'd3-selection'
import 'd3-transition'
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from 'd3-zoom'
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { CONFIG } from '../config'
import type { Layout } from '../curriculum/layout'
import { ancestors } from '../curriculum/parse'
import { nodeState, type ProgressFile } from '../curriculum/progress'
import type { Curriculum, NodeState } from '../curriculum/types'
import { MapScene, type SceneHandle } from './MapScene'
import { TREE_ART } from './treeArt'

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
  const sceneRef = useRef<SceneHandle>(null)
  // the WebGL layer draws the trees' tints as clouds; without WebGL the SVG draws them flat
  const [scene, setScene] = useState(false)
  // the area under the pointer: 'hub', a tree's id, or null
  const [focus, setFocus] = useState<string | null>(null)
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
        sceneRef.current?.setTransform({ k: e.transform.k, x: e.transform.x, y: e.transform.y })
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
  // a tree's area: the wedge between its two dividers, from the hub's rim to far past the map so its outer edge never
  // shows
  const wedge = (r: Layout['sectors'][number]) => {
    const at = (radius: number, deg: number) => {
      const a = (deg * Math.PI) / 180
      return `${(radius * Math.sin(a)).toFixed(1)},${(-radius * Math.cos(a)).toFixed(1)}`
    }
    const [inner, outer] = [layout.rim, layout.reach * 4]
    const large = r.end - r.start > 180 ? 1 : 0
    return `M${at(inner, r.start)}L${at(outer, r.start)}A${outer},${outer} 0 ${large} 1 ${at(outer, r.end)}L${at(inner, r.end)}A${inner},${inner} 0 ${large} 0 ${at(inner, r.start)}Z`
  }

  return (
    <>
      <MapScene ref={sceneRef} curriculum={c} layout={layout} onReady={setScene} />
      <svg
        ref={svgRef}
        className={`holygraph ${scene ? 'has-scene' : ''}`}
        role="group"
        aria-label="강의 선수 관계 그래프"
        onPointerMove={(e) => {
          // the area under the pointer: the hub, or the tree whose wedge holds it
          const t = zoomTransform(svgRef.current!)
          const box = svgRef.current!.getBoundingClientRect()
          const [x, y] = [(e.clientX - box.left - t.x) / t.k, (e.clientY - box.top - t.y) / t.k]
          const angle = (((Math.atan2(x, -y) * 180) / Math.PI) % 360 + 360) % 360
          const tree = layout.sectors.find((r) => (((angle - r.start) % 360) + 360) % 360 < r.end - r.start)
          const area = Math.hypot(x, y) <= layout.rim ? 'hub' : (tree?.tree ?? null)
          sceneRef.current?.setFocus(area)
          setFocus(area)
        }}
        onPointerLeave={() => {
          sceneRef.current?.setFocus(null)
          setFocus(null)
        }}
        onClick={(e) => {
          // d3-zoom swallows the click that ends a pan, so this only fires on a plain click off the nodes
          if ((e.target as Element).closest('.hg-node')) return
          onHover(null)
          onBackgroundClick()
        }}
      >
        <defs>
          {/* each tree's tint is strongest at the rim and fades out toward the edge of the map */}
          {c.trees.map((t) => (
            <radialGradient key={t.id} id={`hg-area-${t.id}`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={layout.reach}>
              <stop offset={layout.rim / layout.reach} stopColor={t.color} stopOpacity={0.09} />
              <stop offset={1} stopColor={t.color} stopOpacity={0} />
            </radialGradient>
          ))}
          {/* a tree's picture stays inside its own area */}
          {layout.sectors.map((r) => (
            <clipPath key={r.tree} id={`hg-wedge-${r.tree}`}>
              <path d={wedge(r)} />
            </clipPath>
          ))}
          <radialGradient id="hg-hub" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={layout.rim}>
            <stop offset={0} stopColor="var(--accent)" stopOpacity={0.1} />
            <stop offset={1} stopColor="var(--accent)" stopOpacity={0.02} />
          </radialGradient>
        </defs>
        <g ref={viewportRef}>
          <g className="hg-rings" aria-hidden="true">
            {layout.sectors.map((r) => (
              <path key={r.tree} className="hg-area" fill={`url(#hg-area-${r.tree})`} d={wedge(r)} />
            ))}
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
              <g key={r.tree} className={focus === r.tree ? 'is-focus' : undefined} color={c.trees.find((t) => t.id === r.tree)!.color}>
                {TREE_ART[r.tree] && (
                  <g className="hg-art" clipPath={`url(#hg-wedge-${r.tree})`}>
                    <g
                      transform={`translate(${r.art.x - r.art.size / 2},${r.art.y - r.art.size / 2}) scale(${r.art.size / TREE_ART[r.tree].size})`}
                    >
                      {TREE_ART[r.tree].paths.map((d, i) => (
                        <path key={i} d={d} />
                      ))}
                    </g>
                  </g>
                )}
                <text className="hg-sector" textAnchor="middle" dominantBaseline="central" transform={`translate(${r.x},${r.y})`}>
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
              return (
                <path
                  key={`${e.from}>${e.to}`}
                  d={e.path}
                  className={`hg-edge is-${kind} ${e.bridge ? 'is-bridge' : ''} ${lit ? 'is-lit' : ''} ${
                    emphasis && !lit ? 'is-dim' : ''
                  }`}
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
    </>
  )
}
