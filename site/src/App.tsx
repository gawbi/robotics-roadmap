import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Legend, NextUp, RecordBanner, TopBar, ZoomControls } from './components/Chrome'
import { Connect } from './components/Connect'
import { Holygraph, type GraphControls, type Insets } from './components/Holygraph'
import { Intro } from './components/Intro'
import { PanelResizer, usePanelWidth } from './components/PanelResizer'
import { UpdateBanner } from './components/UpdateBanner'
import { CONFIG } from './config'
import { computeLayout, type Layout } from './curriculum/layout'
import { curriculum } from './curriculum/load'
import { learner } from './curriculum/learner'
import { useProgress } from './curriculum/progress'
import type { LessonTab } from './components/LessonPanel'

// the panel pulls in markdown, KaTeX and highlighting; the graph does not need them to show up
const LessonPanel = lazy(() => import('./components/LessonPanel').then((m) => ({ default: m.LessonPanel })))
const Portfolio = lazy(() => import('./components/Portfolio').then((m) => ({ default: m.Portfolio })))

// #/p/<lesson> opens a lecture, #/p/<lesson>/note and /lab the learner's note and code for it; #/me the portfolio page
const ROUTE = /^#\/p\/([a-z0-9-]+)(?:\/(note|lab))?$/
const PORTFOLIO_ROUTE = '#/me'
// connecting a GitHub repository to keep one's own record (components/Connect.tsx)
const CONNECT_ROUTE = '#/connect'

function readRoute(): { id: string; tab: LessonTab } | null {
  const m = ROUTE.exec(window.location.hash)
  return m && curriculum.byId.has(m[1]) ? { id: m[1], tab: (m[2] as LessonTab | undefined) ?? 'lecture' } : null
}

const readPortfolio = () => window.location.hash === PORTFOLIO_ROUTE
const readConnect = () => window.location.hash === CONNECT_ROUTE

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

function introSeen(): boolean {
  try {
    return localStorage.getItem(CONFIG.storage.introSeenKey) === '1'
  } catch {
    return false
  }
}

export function App() {
  const [layout, setLayout] = useState<Layout | null>(null)
  useEffect(() => {
    let live = true
    computeLayout(curriculum).then((l) => live && setLayout(l))
    return () => {
      live = false
    }
  }, [])
  const progressFile = useProgress()
  const [route, setRoute] = useState(readRoute)
  const selectedId = route?.id ?? null
  const [portfolio, setPortfolio] = useState(readPortfolio)
  const [connect, setConnect] = useState(readConnect)

  // whose record to show: the site owner's, a shared one (?u=), or this browser's connected repository
  useEffect(() => learner.init(), [])
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [hoverBranch, setHoverBranch] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(() => !introSeen() && !readRoute() && !readPortfolio() && !readConnect())
  const controls = useRef<GraphControls>(null)
  const wide = useMediaQuery('(min-width: 960px)')
  const sidebarInset = wide ? 280 : 0
  const panel = usePanelWidth()
  const [resizing, setResizing] = useState(false)

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      setPortfolio(readPortfolio())
      setConnect(readConnect())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = useCallback((id: string, tab: LessonTab = 'lecture') => {
    window.location.hash = tab === 'lecture' ? `#/p/${id}` : `#/p/${id}/${tab}`
  }, [])
  const close = useCallback(() => {
    history.pushState(null, '', window.location.pathname + window.location.search + '#/')
    setRoute(null)
    setPortfolio(false)
    setConnect(false)
  }, [])
  // switching tabs keeps the lesson's place in history: Back returns to the map, not to the previous tab
  const showTab = useCallback((tab: LessonTab) => {
    if (!selectedId) return
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/p/${selectedId}${tab === 'lecture' ? '' : `/${tab}`}`)
    setRoute({ id: selectedId, tab })
  }, [selectedId])
  const openPortfolio = useCallback(() => {
    window.location.hash = PORTFOLIO_ROUTE
  }, [])
  const openConnect = useCallback(() => {
    window.location.hash = CONNECT_ROUTE
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (selectedId || portfolio) && !showIntro) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, portfolio, showIntro, close])

  const closeIntro = useCallback(() => {
    try {
      localStorage.setItem(CONFIG.storage.introSeenKey, '1')
    } catch {
      // storage unavailable: the intro shows again next visit
    }
    setShowIntro(false)
  }, [])

  const panelOpen = selectedId !== null
  const insets: Insets = {
    top: 64,
    right: panelOpen && wide ? panel.width : 0,
    bottom: wide ? 0 : panelOpen ? window.innerHeight * 0.55 : 72,
    left: sidebarInset,
  }

  const root = curriculum.lessons.find((p) => p.requires.length === 0 && p.branch === 'core') ?? curriculum.lessons[0]

  return (
    <div
      className={`app ${panelOpen ? 'has-panel' : ''} ${resizing ? 'is-resizing' : ''}`}
      style={{ ['--panel-width' as string]: `${panel.width}px` }}
    >
      {layout && (
        <Holygraph
          ref={controls}
          curriculum={curriculum}
          layout={layout}
          progress={progressFile}
          selectedId={selectedId}
          hoverId={hoverId}
          hoverBranch={hoverBranch}
          insets={insets}
          onSelect={select}
          onBackgroundClick={() => selectedId && close()}
          onHover={setHoverId}
        />
      )}

      <TopBar
        curriculum={curriculum}
        progressFile={progressFile}
        onHelp={() => setShowIntro(true)}
        onPortfolio={openPortfolio}
        onConnect={openConnect}
      />

      <RecordBanner onConnect={openConnect} />

      <UpdateBanner />

      <div className="sidebar">
        <NextUp curriculum={curriculum} progressFile={progressFile} onSelect={select} onHover={setHoverId} />
        <Legend curriculum={curriculum} onHoverBranch={setHoverBranch} />
      </div>

      <ZoomControls controls={controls} />

      {selectedId && wide && <PanelResizer panel={panel} onDragging={setResizing} />}

      {selectedId && (
        <Suspense fallback={<aside className="panel" aria-busy="true" />}>
          <LessonPanel
            key={selectedId}
            curriculum={curriculum}
            progressFile={progressFile}
            lessonId={selectedId}
            tab={route!.tab}
            onTab={showTab}
            onClose={close}
            onSelect={select}
          />
        </Suspense>
      )}

      {portfolio && (
        <Suspense fallback={<main className="portfolio" aria-busy="true" />}>
          <Portfolio curriculum={curriculum} progressFile={progressFile} onClose={close} onSelect={select} onConnect={openConnect} />
        </Suspense>
      )}

      {connect && <Connect onClose={close} onPortfolio={openPortfolio} />}

      {showIntro && (
        <Intro
          firstLessonId={root.id}
          lessonCount={curriculum.lessons.length}
          onClose={closeIntro}
          onStart={(id) => {
            closeIntro()
            select(id)
          }}
          onPortfolio={() => {
            closeIntro()
            openPortfolio()
          }}
          onConnect={() => {
            closeIntro()
            openConnect()
          }}
        />
      )}
    </div>
  )
}
