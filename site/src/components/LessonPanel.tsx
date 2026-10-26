import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import { BookOpen, ClipboardCheck, Clock, ExternalLink, FlaskConical, History, ListChecks, NotebookPen, Pencil, Video, X } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import noteTemplateSource from '../../../docs/templates/note.md?raw'
import { blobUrl, hasNoteIn, historyUrl, labsIn, learner, SITE_REPO, treeUrl, useLearner, type LearnerState } from '../curriculum/learner'
import { loadBody, videoUrl } from '../curriculum/load'
import { noteTemplate } from '../curriculum/record'
import { hasQuiz } from '../curriculum/load'
import { attemptsOf, nodeState, passedOn, statusOf, type ProgressFile } from '../curriculum/progress'
import type { Curriculum, NodeState, Status } from '../curriculum/types'
import { Markdown } from './Markdown'
import { QuizReturn, QuizSection, useQuizNav } from './Quiz'

/** the lecture, the learner's note on it, or the code they wrote for it */
export type LessonTab = 'lecture' | 'note' | 'lab'

interface Props {
  curriculum: Curriculum
  progressFile: ProgressFile
  lessonId: string
  tab: LessonTab
  onTab(tab: LessonTab): void
  onClose(): void
  onSelect(id: string): void
}


const STATE_TEXT: Record<NodeState, string> = {
  done: '완료',
  in_progress: '진행 중',
  available: '시작 가능',
  locked: '선수 강의 남음',
}

function formatHours(h: number): string {
  return `강의와 퀴즈 약 ${h}시간`
}

function LessonChip({ c, p, id, onSelect }: { c: Curriculum; p: ProgressFile; id: string; onSelect(id: string): void }) {
  const lesson = c.byId.get(id)!
  const branch = c.branches.find((b) => b.id === lesson.branch)!
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
        {lesson.title}
        <span className="sr-only">, {STATE_TEXT[state]}</span>
      </button>
    </li>
  )
}

function statusText(status: Status, passedDate: string | undefined, tries: number, quiz: boolean): string {
  if (status === 'done') return `퀴즈 통과 · ${passedDate}`
  if (status === 'in_progress') return `퀴즈 ${tries}회 응시 · 아직 통과 전`
  return quiz ? '강의를 끝까지 읽고 퀴즈로 마무리' : '퀴즈 준비 중'
}

/** Where the learner stands on this lesson, with a button that opens its quiz. */
function StatusCard({ progressFile, lessonId, onTake }: { progressFile: ProgressFile; lessonId: string; onTake(): void }) {
  const status = statusOf(progressFile, lessonId)
  const quiz = hasQuiz(lessonId)
  const attempts = attemptsOf(progressFile, lessonId)
  return (
    <section className={`record is-${status}`} aria-labelledby="record-title">
      <h3 id="record-title">
        <ClipboardCheck size={15} aria-hidden="true" /> 진행 상태
      </h3>
      <div className="record-row">
        <p className="record-status">
          <span className="record-dot" aria-hidden="true" />
          {statusText(status, passedOn(progressFile, lessonId), attempts.length, quiz)}
        </p>
        {quiz && (
          <button type="button" className="text-button record-quiz" onClick={onTake}>
            <ListChecks size={15} aria-hidden="true" /> 퀴즈 풀기
          </button>
        )}
      </div>
      {attempts.length > 0 && (
        <ol className="record-history" aria-label="퀴즈 응시 기록">
          {attempts.map((a, i) => {
            const right = a.answers.filter((x) => x.correct).length
            return (
              <li key={i} className={right === a.answers.length ? 'is-pass' : undefined}>
                <span className="record-history-date">{a.date}</span>
                <span>
                  {right}/{a.answers.length}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

/** In dev the note and lab tabs always show, to say where the files go; the published site shows what exists, and the
 * note tab to a learner who can write one. */
function tabsFor(s: LearnerState, lessonId: string): LessonTab[] {
  const tabs: LessonTab[] = ['lecture']
  if (hasNoteIn(s, lessonId) || s.writable || import.meta.env.DEV) tabs.push('note')
  if (labsIn(s, lessonId).length > 0 || import.meta.env.DEV) tabs.push('lab')
  return tabs
}

function TabBar({ s, lessonId, tabs, tab, onTab }: { s: LearnerState; lessonId: string; tabs: LessonTab[]; tab: LessonTab; onTab(t: LessonTab): void }) {
  const labCount = labsIn(s, lessonId).length
  const label: Record<LessonTab, React.ReactNode> = {
    lecture: (
      <>
        <BookOpen size={15} aria-hidden="true" /> 강의
      </>
    ),
    note: (
      <>
        <NotebookPen size={15} aria-hidden="true" /> 내 노트{!hasNoteIn(s, lessonId) && <span className="tab-empty"> · 없음</span>}
      </>
    ),
    lab: (
      <>
        <FlaskConical size={15} aria-hidden="true" /> 구현{labCount > 0 ? <span className="tab-count">{labCount}</span> : <span className="tab-empty"> · 없음</span>}
      </>
    ),
  }
  return (
    <div className="panel-tabs" role="tablist" aria-label="강의와 내 기록">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={`tab-${t}`}
          aria-selected={tab === t}
          aria-controls={`tabpanel-${t}`}
          className={`panel-tab ${tab === t ? 'is-active' : ''}`}
          onClick={() => onTab(t)}
        >
          {label[t]}
        </button>
      ))}
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div className="body-loading" aria-busy="true" aria-label={label}>
      <span />
      <span />
      <span />
    </div>
  )
}

const draftKey = (lessonId: string) => `${CONFIG.storage.noteDraftKey}.${lessonId}`

function readDraft(lessonId: string): string | null {
  try {
    return localStorage.getItem(draftKey(lessonId))
  } catch {
    return null
  }
}

function writeDraft(lessonId: string, text: string | null) {
  try {
    if (text === null) localStorage.removeItem(draftKey(lessonId))
    else localStorage.setItem(draftKey(lessonId), text)
  } catch {
    // storage unavailable: the draft lives until the page closes
  }
}

/** Write a note in the page and commit it to the learner's repository. The draft survives a reload on this device. */
function NoteEditor({ lessonId, title, initial, onDone }: { lessonId: string; title: string; initial: string | null; onDone(): void }) {
  const [draft] = useState(() => readDraft(lessonId))
  const [text, setText] = useState(() => draft ?? initial ?? noteTemplate(noteTemplateSource, title))
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const path = `${CONFIG.record.notesDir}/${lessonId}.md`

  // the editor opens below the lesson's header; bring it up so the text box is where the eye goes
  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: 'start' })
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await learner.saveNote(lessonId, text)
      writeDraft(lessonId, null)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  return (
    <div className="note-editor" ref={rootRef}>
      <div className="note-editor-bar">
        <div className="note-editor-modes" role="tablist" aria-label="노트 편집">
          <button type="button" role="tab" aria-selected={!preview} className={`panel-tab ${!preview ? 'is-active' : ''}`} onClick={() => setPreview(false)}>
            쓰기
          </button>
          <button type="button" role="tab" aria-selected={preview} className={`panel-tab ${preview ? 'is-active' : ''}`} onClick={() => setPreview(true)}>
            미리보기
          </button>
        </div>
        <div className="note-editor-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => {
              writeDraft(lessonId, null)
              onDone()
            }}
            disabled={saving}
          >
            취소
          </button>
          <button type="button" className="primary-button" onClick={save} disabled={saving || !text.trim() || text === initial}>
            {saving ? '저장 중…' : 'GitHub 에 저장'}
          </button>
        </div>
      </div>
      {draft !== null && draft !== initial && <p className="soft-note">이 기기에 저장하지 않은 초안이 있어 이어서 엽니다.</p>}
      {error && (
        <p className="quiz-error" role="alert">
          {error}
        </p>
      )}
      {preview ? (
        <Markdown file={path} remote={learner.get().repo} source={text} />
      ) : (
        <textarea
          className="note-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            writeDraft(lessonId, e.target.value)
          }}
          aria-label={`${title} 노트`}
          spellCheck={false}
        />
      )}
      <p className="note-editor-hint">
        강의를 덮고 내 말로 씁니다. 저장하면 <code>{path}</code> 에 커밋되고, 쓰는 중인 글은 이 기기에 초안으로 남습니다.
      </p>
    </div>
  )
}

/** The learner's own explanation of the lesson, with a link to its edit history so a reader can see when it was written. */
function NoteTab({ s, lessonId, title }: { s: LearnerState; lessonId: string; title: string }) {
  const [note, setNote] = useState<string | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const path = `${CONFIG.record.notesDir}/${lessonId}.md`
  const exists = hasNoteIn(s, lessonId)
  const remote = s.source === 'github' ? s.repo : undefined

  useEffect(() => {
    let live = true
    setNote(undefined)
    if (exists) learner.loadNote(lessonId).then((text) => live && setNote(text), () => live && setNote(null))
    else setNote(null)
    return () => {
      live = false
    }
  }, [lessonId, exists, s.repo, editing])

  if (editing) return <NoteEditor lessonId={lessonId} title={title} initial={note ?? null} onDone={() => setEditing(false)} />
  if (note === undefined) return <Loading label="노트 불러오는 중" />

  if (note === null) {
    return s.writable ? (
      <div className="note-empty">
        <p>아직 이 강의의 노트가 없습니다. 강의를 덮고 내 말로 정리해 봅니다.</p>
        <button type="button" className="primary-button" onClick={() => setEditing(true)}>
          <NotebookPen size={16} aria-hidden="true" /> 노트 쓰기
        </button>
      </div>
    ) : (
      <p className="soft-note">
        아직 이 강의의 노트가 없습니다. <code>{path}</code> 를 만들면 여기에 나타납니다. 형식은 <code>docs/templates/note.md</code> 를 복사해서
        씁니다.
      </p>
    )
  }
  return (
    <>
      <Markdown file={path} remote={remote} source={note} />
      <p className="record-links">
        {s.writable && (
          <button type="button" className="text-button" onClick={() => setEditing(true)}>
            <Pencil size={14} aria-hidden="true" /> 고치기
          </button>
        )}
        <a href={blobUrl(s.repo, path)} target="_blank" rel="noreferrer">
          GitHub 에서 보기 <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a href={historyUrl(s.repo, path)} target="_blank" rel="noreferrer">
          <History size={14} aria-hidden="true" /> 작성 이력
        </a>
      </p>
    </>
  )
}

/** Code the learner wrote for this lesson: each lab's write-up, with links to its folder and history. */
function LabTab({ c, s, lessonId, onSelect }: { c: Curriculum; s: LearnerState; lessonId: string; onSelect(id: string): void }) {
  const list = labsIn(s, lessonId)
  const remote = s.source === 'github' ? s.repo : undefined
  if (list.length === 0) {
    return (
      <p className="soft-note">
        아직 이 강의를 구현한 코드가 없습니다. <code>{CONFIG.record.labsDir}/&lt;이름&gt;/README.md</code> 를 만들고 frontmatter 의{' '}
        <code>lessons</code> 에 <code>{lessonId}</code> 를 넣으면 여기에 나타납니다. 형식은 <code>docs/templates/lab.md</code> 를
        복사해서 씁니다.
      </p>
    )
  }
  return (
    <>
      {list.map((lab) => {
        const dir = `${CONFIG.record.labsDir}/${lab.id}`
        const others = lab.lessons.filter((id) => id !== lessonId && c.byId.has(id))
        return (
          <article key={lab.id} className="lab" aria-labelledby={`lab-${lab.id}`}>
            <header className="lab-head">
              <h3 id={`lab-${lab.id}`}>{lab.title}</h3>
              <p>{lab.summary}</p>
              {lab.stack.length > 0 && (
                <ul className="lab-stack" aria-label="사용 기술">
                  {lab.stack.map((st) => (
                    <li key={st}>{st}</li>
                  ))}
                </ul>
              )}
              {others.length > 0 && (
                <p className="lab-also">
                  함께 구현한 강의:{' '}
                  {others.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ', '}
                      <a href={`#/p/${id}`} onClick={(e) => (e.preventDefault(), onSelect(id))}>
                        {c.byId.get(id)!.title}
                      </a>
                    </span>
                  ))}
                </p>
              )}
              <p className="record-links">
                <a href={treeUrl(s.repo, dir)} target="_blank" rel="noreferrer">
                  코드 보기 <ExternalLink size={14} aria-hidden="true" />
                </a>
                <a href={historyUrl(s.repo, dir)} target="_blank" rel="noreferrer">
                  <History size={14} aria-hidden="true" /> 커밋 이력
                </a>
              </p>
            </header>
            <Markdown file={`${dir}/README.md`} remote={remote} source={lab.body} />
          </article>
        )
      })}
    </>
  )
}

// memo: hovering the graph re-renders the app, and the lesson body is costly to render again
export const LessonPanel = memo(function LessonPanel({ curriculum: c, progressFile, lessonId, tab: asked, onTab, onClose, onSelect }: Props) {
  const learnerState = useLearner()
  const tabs = tabsFor(learnerState, lessonId)
  const tab = tabs.includes(asked) ? asked : 'lecture'
  const lesson = c.byId.get(lessonId)!
  const branch = c.branches.find((b) => b.id === lesson.branch)!
  const status = statusOf(progressFile, lessonId)
  const missing = lesson.requires.filter((r) => statusOf(progressFile, r) !== 'done')
  const unlocks = c.unlocks.get(lessonId) ?? []
  const [body, setBody] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const quiz = useQuizNav(lessonId)
  const attempts = attemptsOf(progressFile, lessonId)
  const tabsAnchor = useRef<HTMLDivElement>(null)
  const firstTab = useRef(true)

  // editing a lesson in dev re-runs curriculum/load.ts through HMR, which hands down a new curriculum; the body is
  // fetched again then, so the open panel shows the edit without a reload
  useEffect(() => {
    let live = true
    loadBody(lessonId).then(
      (text) => live && setBody(text),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [lessonId, c])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [lessonId])

  // a tab opens at its own top, under the header; a lesson opened on its lecture still starts at the header
  useEffect(() => {
    const first = firstTab.current
    firstTab.current = false
    if (first && tab === 'lecture') return
    const top = tabsAnchor.current?.offsetTop
    if (top !== undefined) scrollRef.current?.scrollTo({ top })
  }, [tab])

  return (
    <aside className={`panel ${quiz.back ? 'has-quiz-return' : ''}`} aria-labelledby="panel-title" style={{ ['--branch' as string]: branch.color }}>
      <div className="panel-scroll" ref={scrollRef}>
        <header className="panel-head">
          <div className="panel-topline">
            <span className="branch-tag">
              <span className="branch-dot" aria-hidden="true" />
              {branch.title}
            </span>
            <button type="button" className="icon-button" onClick={onClose} aria-label="강의 닫기">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <h2 id="panel-title" ref={headingRef} tabIndex={-1}>
            {lesson.title}
          </h2>
          <p className="panel-summary">{lesson.summary}</p>
          <p className="panel-meta">
            <Clock size={15} aria-hidden="true" />
            {formatHours(lesson.hours)}
          </p>

          <StatusCard
            progressFile={progressFile}
            lessonId={lessonId}
            onTake={() => {
              // the quiz's explanations link into the lecture, so it has to be the tab on show
              onTab('lecture')
              quiz.take()
            }}
          />

          {missing.length > 0 && status === 'todo' && (
            <p className="soft-note">
              아직 통과하지 않은 선수 강의가 {missing.length}개 있습니다. 바로 읽어도 되고, 낯선 용어가 나오면 아래 선수 강의를
              먼저 보면 됩니다.
            </p>
          )}

          {lesson.requires.length > 0 && (
            <section className="relations">
              <h3>선수 강의</h3>
              <ul>
                {lesson.requires.map((id) => (
                  <LessonChip key={id} c={c} p={progressFile} id={id} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}
          {unlocks.length > 0 && (
            <section className="relations">
              <h3>이어지는 강의</h3>
              <ul>
                {unlocks.map((id) => (
                  <LessonChip key={id} c={c} p={progressFile} id={id} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}

          {lesson.papers.length > 0 && (
            <section className="papers">
              <h3>
                <BookOpen size={15} aria-hidden="true" /> 논문·자료
              </h3>
              <ul>
                {lesson.papers.map((paper) => (
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

        <div ref={tabsAnchor} />
        {tabs.length > 1 && <TabBar s={learnerState} lessonId={lessonId} tabs={tabs} tab={tab} onTab={onTab} />}

        {/* the lecture stays mounted behind the other tabs, so the quiz's links into it keep their targets */}
        <div role="tabpanel" id="tabpanel-lecture" aria-labelledby={tabs.length > 1 ? 'tab-lecture' : undefined} hidden={tab !== 'lecture'}>
          {videoUrl(lessonId) && (
            <section className="lesson-video" aria-labelledby="lesson-video-title">
              <h3 id="lesson-video-title">
                <Video size={15} aria-hidden="true" /> 요약 영상
              </h3>
              <video src={videoUrl(lessonId)} controls preload="metadata" playsInline />
              <p>
                이 강의의 핵심 절만 애니메이션으로 줄인 영상입니다. 중간의 "멈추고 적어 보기"에서 영상을 멈추고 직접 적어 본 뒤, 아래 본문에서
                자세히 읽습니다.
              </p>
            </section>
          )}
          {body !== null ? (
            <Markdown lessonId={lessonId} source={body} />
          ) : failed ? (
            <p className="soft-note" role="alert">
              강의를 불러오지 못했습니다. 새로고침하거나 아래 GitHub 링크에서 읽을 수 있습니다.
            </p>
          ) : (
            <Loading label="강의 불러오는 중" />
          )}

          <div className="panel-quiz">
            <QuizSection lessonId={lessonId} title={lesson.title} attempts={attempts} nav={quiz} />
          </div>

          <footer className="panel-foot">
            <a href={blobUrl(SITE_REPO, lesson.path)} target="_blank" rel="noreferrer">
              GitHub 에서 보기 <ExternalLink size={14} aria-hidden="true" />
            </a>
          </footer>
        </div>

        {tab === 'note' && (
          <div role="tabpanel" id="tabpanel-note" aria-labelledby="tab-note" className="record-tab">
            <NoteTab s={learnerState} lessonId={lessonId} title={lesson.title} />
          </div>
        )}
        {tab === 'lab' && (
          <div role="tabpanel" id="tabpanel-lab" aria-labelledby="tab-lab" className="record-tab">
            <LabTab c={c} s={learnerState} lessonId={lessonId} onSelect={onSelect} />
          </div>
        )}
      </div>
      <QuizReturn attempts={attempts} nav={quiz} />
    </aside>
  )
})
