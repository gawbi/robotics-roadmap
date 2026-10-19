import { HelpCircle, Maximize2, Minus, Plus } from 'lucide-react'
import { CONFIG } from '../config'
import { nodeState, statusOf, type ProgressFile } from '../curriculum/progress'
import type { Curriculum } from '../curriculum/types'
import type { GraphControls } from './Holygraph'

export function TopBar({
  curriculum: c,
  progressFile,
  onHelp,
}: {
  curriculum: Curriculum
  progressFile: ProgressFile
  onHelp(): void
}) {
  const done = c.lessons.filter((p) => statusOf(progressFile, p.id) === 'done')
  const total = c.lessons.length
  const hoursDone = done.reduce((a, p) => a + p.hours, 0)
  const hoursTotal = c.lessons.reduce((a, p) => a + p.hours, 0)
  const pct = Math.round((done.length / total) * 100)

  return (
    <header className="topbar">
      <a className="brand" href="#/" aria-label="Physical AI Study, 처음 화면">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <circle cx="16" cy="16" r="2.5" fill="currentColor" />
        </svg>
        <span>
          Physical AI <em>Study</em>
        </span>
      </a>

      <div className="meter" aria-label={`완료 ${done.length} / ${total}, ${hoursDone} / ${hoursTotal}시간`}>
        <div className="meter-text" aria-hidden="true">
          <strong>{done.length}</strong>
          <span>/ {total} 완료</span>
          <span className="meter-hours">
            {hoursDone}h / {hoursTotal}h
          </span>
        </div>
        <div className="meter-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav className="topbar-actions" aria-label="도구">
        <button type="button" className="icon-button" onClick={onHelp} aria-label="사용 안내">
          <HelpCircle size={20} aria-hidden="true" />
        </button>
        <a className="icon-button" href={CONFIG.repoUrl} target="_blank" rel="noreferrer" aria-label="GitHub 리포">
          <GithubMark />
        </a>
      </nav>
    </header>
  )
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function NextUp({
  curriculum: c,
  progressFile,
  onSelect,
  onHover,
}: {
  curriculum: Curriculum
  progressFile: ProgressFile
  onSelect(id: string): void
  onHover(id: string | null): void
}) {
  const rank = (id: string) => c.lessons.findIndex((p) => p.id === id)
  const doing = c.lessons.filter((p) => statusOf(progressFile, p.id) === 'in_progress')
  const ready = c.lessons
    .filter((p) => nodeState(c, progressFile, p.id) === 'available')
    .sort((a, b) => a.hours - b.hours || rank(a.id) - rank(b.id))
  const items = [...doing, ...ready].slice(0, 5)
  const more = doing.length + ready.length - items.length

  if (items.length === 0) {
    return (
      <section className="nextup" aria-labelledby="nextup-title">
        <h2 id="nextup-title">모든 강의 완료</h2>
      </section>
    )
  }

  return (
    <section className="nextup" aria-labelledby="nextup-title">
      <h2 id="nextup-title">{doing.length ? '진행 중 · 지금 시작 가능' : '지금 시작 가능'}</h2>
      <ul>
        {items.map((p) => {
          const branch = c.branches.find((b) => b.id === p.branch)!
          const state = nodeState(c, progressFile, p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`nextup-item is-${state}`}
                style={{ ['--branch' as string]: branch.color }}
                onClick={() => onSelect(p.id)}
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={() => onHover(null)}
              >
                <span className="chip-dot" aria-hidden="true" />
                <span className="nextup-title">{p.title}</span>
                <span className="nextup-hours">{p.hours}h</span>
                {state === 'in_progress' && <span className="sr-only">, 진행 중</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {more > 0 && <p className="nextup-more">외 {more}개는 그래프에서 밝게 표시된 원</p>}
    </section>
  )
}

export function Legend({
  curriculum: c,
  onHoverBranch,
}: {
  curriculum: Curriculum
  onHoverBranch(id: string | null): void
}) {
  return (
    <section className="legend" aria-label="범례">
      <ul className="legend-states">
        <li>
          <span className="lg-node is-done" aria-hidden="true" />
          완료
        </li>
        <li>
          <span className="lg-node is-in_progress" aria-hidden="true" />
          진행 중
        </li>
        <li>
          <span className="lg-node is-available" aria-hidden="true" />
          시작 가능
        </li>
        <li>
          <span className="lg-node is-locked" aria-hidden="true" />
          선수 강의 남음
        </li>
      </ul>
      <ul className="legend-branches">
        {c.branches.map((b) => (
          <li
            key={b.id}
            style={{ ['--branch' as string]: b.color }}
            onMouseEnter={() => onHoverBranch(b.id)}
            onMouseLeave={() => onHoverBranch(null)}
            title={b.summary}
          >
            <span className="chip-dot" aria-hidden="true" />
            {b.title}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ZoomControls({ controls }: { controls: React.RefObject<GraphControls | null> }) {
  return (
    <div className="zoom-controls" role="group" aria-label="확대·축소">
      <button type="button" className="icon-button" onClick={() => controls.current?.zoomIn()} aria-label="확대">
        <Plus size={18} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => controls.current?.zoomOut()} aria-label="축소">
        <Minus size={18} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => controls.current?.fit()} aria-label="전체 보기">
        <Maximize2 size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
