import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import { BookOpen, Clock, ExternalLink, FolderGit2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { loadBody } from '../curriculum/load'
import { nodeState, progress, statusOf, type ProgressFile } from '../curriculum/progress'
import type { Curriculum, NodeState, Status } from '../curriculum/types'
import { Markdown } from './Markdown'

interface Props {
  curriculum: Curriculum
  progressFile: ProgressFile
  projectId: string
  onClose(): void
  onSelect(id: string): void
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: '시작 전' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'done', label: '완료' },
]

const STATE_TEXT: Record<NodeState, string> = {
  done: '완료',
  in_progress: '진행 중',
  available: '시작 가능',
  locked: '선수 과제 남음',
}

export function formatHours(h: number): string {
  if (h < 8) return `약 ${h}시간`
  return `약 ${h}시간 · 하루 2시간씩 ${Math.ceil(h / 2)}일`
}

function ProjectChip({ c, p, id, onSelect }: { c: Curriculum; p: ProgressFile; id: string; onSelect(id: string): void }) {
  const project = c.byId.get(id)!
  const branch = c.branches.find((b) => b.id === project.branch)!
  const state = nodeState(c, p, id)
  return (
    <li>
      <button
        type="button"
        className={`chip is-${state}`}
        style={{ ['--branch' as string]: branch.color }}
        onClick={() => onSelect(id)}
        title={STATE_TEXT[state]}
      >
        <span className="chip-dot" aria-hidden="true" />
        {project.title}
        <span className="sr-only">, {STATE_TEXT[state]}</span>
      </button>
    </li>
  )
}

export function ProjectPanel({ curriculum: c, progressFile, projectId, onClose, onSelect }: Props) {
  const project = c.byId.get(projectId)!
  const branch = c.branches.find((b) => b.id === project.branch)!
  const status = statusOf(progressFile, projectId)
  const missing = project.requires.filter((r) => statusOf(progressFile, r) !== 'done')
  const unlocks = c.unlocks.get(projectId) ?? []
  const [body, setBody] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let live = true
    loadBody(projectId).then(
      (text) => live && setBody(text),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [projectId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [projectId])

  return (
    <aside className="panel" aria-labelledby="panel-title" style={{ ['--branch' as string]: branch.color }}>
      <div className="panel-scroll" ref={scrollRef}>
        <header className="panel-head">
          <div className="panel-topline">
            <span className="branch-tag">
              <span className="branch-dot" aria-hidden="true" />
              {branch.title}
            </span>
            <button type="button" className="icon-button" onClick={onClose} aria-label="과제 닫기">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <h2 id="panel-title" ref={headingRef} tabIndex={-1}>
            {project.title}
          </h2>
          <p className="panel-summary">{project.summary}</p>
          <p className="panel-meta">
            <Clock size={15} aria-hidden="true" />
            {formatHours(project.hours)}
          </p>

          <fieldset className="status-switch">
            <legend className="sr-only">진행 상태</legend>
            {STATUS_OPTIONS.map((o) => (
              <label key={o.value} className={status === o.value ? 'is-on' : ''}>
                <input
                  type="radio"
                  name="status"
                  value={o.value}
                  checked={status === o.value}
                  onChange={() => progress.set(projectId, o.value)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>

          {missing.length > 0 && status === 'todo' && (
            <p className="soft-note">
              아직 완료하지 않은 선수 과제가 {missing.length}개 있습니다. 바로 시작해도 되고, 막히면 아래 선수 과제를 먼저
              보면 됩니다.
            </p>
          )}

          {project.requires.length > 0 && (
            <section className="relations">
              <h3>선수 과제</h3>
              <ul>
                {project.requires.map((id) => (
                  <ProjectChip key={id} c={c} p={progressFile} id={id} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}
          {unlocks.length > 0 && (
            <section className="relations">
              <h3>이어지는 과제</h3>
              <ul>
                {unlocks.map((id) => (
                  <ProjectChip key={id} c={c} p={progressFile} id={id} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}

          {project.papers.length > 0 && (
            <section className="papers">
              <h3>
                <BookOpen size={15} aria-hidden="true" /> 논문·자료
              </h3>
              <ul>
                {project.papers.map((paper) => (
                  <li key={paper.title}>
                    <span className="paper-year">{paper.year}</span>
                    <span>
                      {paper.url ? (
                        <a href={paper.url} target="_blank" rel="noreferrer">
                          {paper.title}
                        </a>
                      ) : (
                        paper.title
                      )}
                      <span className="paper-authors"> — {paper.authors}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </header>

        {body !== null ? (
          <Markdown projectId={projectId} source={body} />
        ) : failed ? (
          <p className="soft-note" role="alert">
            과제 설명을 불러오지 못했습니다. 새로고침하거나 아래 GitHub 링크에서 읽을 수 있습니다.
          </p>
        ) : (
          <div className="body-loading" aria-busy="true" aria-label="과제 설명 불러오는 중">
            <span />
            <span />
            <span />
          </div>
        )}

        <footer className="panel-foot">
          <p>
            <FolderGit2 size={15} aria-hidden="true" /> 작업 폴더 <code>projects/{projectId}/</code>
          </p>
          <a href={`${CONFIG.repoUrl}/blob/${CONFIG.repoBranch}/${project.path}`} target="_blank" rel="noreferrer">
            GitHub 에서 보기 <ExternalLink size={14} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </aside>
  )
}
