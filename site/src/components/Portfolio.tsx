import { ArrowLeft, ExternalLink, FlaskConical, NotebookPen } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { commitDays, hasNote, labs } from '../curriculum/load'
import { passedOn, statusOf, type ProgressFile } from '../curriculum/progress'
import { activityLevel, heatmapWeeks, longestStreak, studyDays, type DayActivity } from '../curriculum/record'
import type { Curriculum, Lesson } from '../curriculum/types'
import type { LessonTab } from './LessonPanel'

interface Props {
  curriculum: Curriculum
  progressFile: ProgressFile
  onClose(): void
  onSelect(id: string, tab?: LessonTab): void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const HUB_TITLE = '공통 기초'

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="pf-stat">
      <span className="pf-stat-label">{label}</span>
      <strong className="pf-stat-value">{value}</strong>
      {sub && <span className="pf-stat-sub">{sub}</span>}
    </div>
  )
}

function describeDay(date: string, a: DayActivity | undefined): string {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  if (!a) return `${date} (${weekday}) · 기록 없음`
  const parts = [a.commits > 0 && `기록 커밋 ${a.commits}`, a.quizzes > 0 && `퀴즈 ${a.quizzes}회`].filter(Boolean)
  return `${date} (${weekday}) · ${parts.join(' · ')}`
}

/** GitHub-style grid of the last weeks: one cell a day, darker for days that hold more study. */
function Heatmap({ days }: { days: Map<string, DayActivity> }) {
  const weeks = useMemo(() => heatmapWeeks(new Date(), CONFIG.record.heatmapWeeks), [])
  const [hover, setHover] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inRange = weeks.flat().filter((d) => !d.future && days.has(d.date)).length

  // on a narrow screen the grid scrolls sideways; start at the most recent weeks
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  // a month is named over the week it starts in; a name with the next one less than three weeks on is left out, and so is
  // one over the last week, where it would run past the grid
  const starts = weeks.flatMap((week, i) => (i === 0 || week[0].date.slice(5, 7) !== weeks[i - 1][0].date.slice(5, 7) ? [i] : []))
  const months = weeks.map((week, i) => {
    const k = starts.indexOf(i)
    const roomy = k >= 0 && (k === starts.length - 1 || starts[k + 1] - i >= 3) && i < weeks.length - 1
    return roomy ? `${Number(week[0].date.slice(5, 7))}월` : ''
  })

  return (
    <section className="pf-section" aria-labelledby="pf-heatmap-title">
      <div className="pf-section-head">
        <h3 id="pf-heatmap-title">공부한 날</h3>
        <p className="pf-readout" aria-live="polite">
          {hover ? describeDay(hover, days.get(hover)) : `최근 ${CONFIG.record.heatmapWeeks}주 동안 ${inRange}일`}
        </p>
      </div>
      <div className="pf-heatmap-scroll" ref={scrollRef}>
        <div className="pf-heatmap" style={{ ['--weeks' as string]: weeks.length }} onMouseLeave={() => setHover(null)}>
          <span className="pf-heatmap-corner" aria-hidden="true" />
          {months.map((m, i) => (
            <span key={`m${i}`} className="pf-heatmap-month" style={{ gridColumn: i + 2 }} aria-hidden="true">
              {m}
            </span>
          ))}
          {WEEKDAYS.map((w, d) => (
            <span key={`w${d}`} className="pf-heatmap-weekday" style={{ gridRow: d + 2 }} aria-hidden="true">
              {d % 2 === 1 ? w : ''}
            </span>
          ))}
          {weeks.map((week, w) =>
            week.map((day, d) => {
              const a = days.get(day.date)
              const text = describeDay(day.date, a)
              return (
                <span
                  key={day.date}
                  className={`pf-cell ${day.future ? 'is-future' : `is-l${activityLevel(a)}`} ${hover === day.date ? 'is-hover' : ''}`}
                  style={{ gridColumn: w + 2, gridRow: d + 2 }}
                  title={day.future ? undefined : text}
                  aria-label={day.future ? undefined : text}
                  role={day.future ? undefined : 'img'}
                  onMouseEnter={() => !day.future && setHover(day.date)}
                />
              )
            }),
          )}
        </div>
      </div>
      <div className="pf-heatmap-foot">
        <span>노트·구현·퀴즈 기록을 바꾼 커밋과 퀴즈 응시를 날짜별로 셉니다</span>
        <span className="pf-legend" aria-hidden="true">
          적음
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`pf-cell is-l${l}`} />
          ))}
          많음
        </span>
      </div>
    </section>
  )
}

interface Group {
  id: string
  title: string
  color: string
  track: boolean
  lessons: Lesson[]
}

/** lessons by tree, the shared basics first and the trees of the owner's job tracks next */
function groups(c: Curriculum): Group[] {
  const treeOf = new Map(c.trees.flatMap((t) => t.branches.map((b) => [b, t] as const)))
  const hub: Group = { id: 'hub', title: HUB_TITLE, color: '#d6d3d1', track: false, lessons: [] }
  const byTree = new Map<string, Group>(
    c.trees.map((t) => [t.id, { id: t.id, title: t.title, color: t.color, track: (CONFIG.owner.tracks as readonly string[]).includes(t.id), lessons: [] }]),
  )
  for (const p of c.lessons) {
    const tree = treeOf.get(p.branch)
    ;(tree && !c.hub.has(p.id) ? byTree.get(tree.id)! : hub).lessons.push(p)
  }
  const trees = [...byTree.values()].sort((a, b) => Number(b.track) - Number(a.track))
  return [hub, ...trees]
}

function TrackProgress({ c, progressFile }: { c: Curriculum; progressFile: ProgressFile }) {
  return (
    <section className="pf-section" aria-labelledby="pf-tracks-title">
      <div className="pf-section-head">
        <h3 id="pf-tracks-title">영역별 퀴즈 통과</h3>
      </div>
      <ul className="pf-tracks">
        {groups(c).map((g) => {
          const done = g.lessons.filter((p) => statusOf(progressFile, p.id) === 'done').length
          const pct = g.lessons.length ? (done / g.lessons.length) * 100 : 0
          return (
            <li key={g.id} style={{ ['--tree' as string]: g.color }}>
              <span className="pf-track-name">
                {g.title}
                {g.track && <span className="pf-track-tag">지원 직무</span>}
              </span>
              <span className="pf-track-bar" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="pf-track-count">
                {done} / {g.lessons.length}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Projects({ c, onSelect }: { c: Curriculum; onSelect: Props['onSelect'] }) {
  return (
    <section className="pf-section" aria-labelledby="pf-labs-title">
      <div className="pf-section-head">
        <h3 id="pf-labs-title">
          <FlaskConical size={16} aria-hidden="true" /> 구현 프로젝트
        </h3>
      </div>
      {labs.length === 0 ? (
        <p className="pf-empty">
          아직 구현 프로젝트가 없습니다.
          {import.meta.env.DEV && (
            <>
              {' '}
              <code>{CONFIG.record.labsDir}/&lt;이름&gt;/README.md</code> 를 <code>docs/templates/lab.md</code> 형식으로 만들면 여기에
              나타납니다.
            </>
          )}
        </p>
      ) : (
        <ul className="pf-labs">
          {labs.map((lab) => (
            <li key={lab.id} className="pf-lab">
              <h4>{lab.title}</h4>
              <p>{lab.summary}</p>
              {lab.stack.length > 0 && (
                <ul className="lab-stack" aria-label="사용 기술">
                  {lab.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
              <div className="pf-lab-foot">
                <span className="pf-lab-lessons">
                  {lab.lessons
                    .filter((id) => c.byId.has(id))
                    .map((id) => (
                      <button key={id} type="button" className="text-button" onClick={() => onSelect(id, 'lab')}>
                        {c.byId.get(id)!.title}
                      </button>
                    ))}
                </span>
                <a href={`${CONFIG.repoUrl}/tree/${CONFIG.repoBranch}/${CONFIG.record.labsDir}/${lab.id}`} target="_blank" rel="noreferrer">
                  코드 <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Notes({ c, progressFile, onSelect }: { c: Curriculum; progressFile: ProgressFile; onSelect: Props['onSelect'] }) {
  const noted = c.lessons.filter((p) => hasNote(p.id))
  return (
    <section className="pf-section" aria-labelledby="pf-notes-title">
      <div className="pf-section-head">
        <h3 id="pf-notes-title">
          <NotebookPen size={16} aria-hidden="true" /> 강의 노트
        </h3>
      </div>
      {noted.length === 0 ? (
        <p className="pf-empty">
          아직 노트가 없습니다.
          {import.meta.env.DEV && (
            <>
              {' '}
              <code>{CONFIG.record.notesDir}/&lt;강의 id&gt;.md</code> 를 <code>docs/templates/note.md</code> 형식으로 만들면 여기에
              나타납니다.
            </>
          )}
        </p>
      ) : (
        <ul className="pf-notes">
          {noted.map((p) => {
            const branch = c.branches.find((b) => b.id === p.branch)!
            const passed = passedOn(progressFile, p.id)
            return (
              <li key={p.id}>
                <button type="button" className="pf-note" style={{ ['--branch' as string]: branch.color }} onClick={() => onSelect(p.id, 'note')}>
                  <span className="chip-dot" aria-hidden="true" />
                  <span className="pf-note-title">{p.title}</span>
                  <span className="pf-note-meta">{passed ? `퀴즈 통과 ${passed}` : '퀴즈 전'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** #/me: the study record at a glance, for the learner and for anyone the link is sent to. */
export function Portfolio({ curriculum: c, progressFile, onClose, onSelect }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const done = c.lessons.filter((p) => statusOf(progressFile, p.id) === 'done')
  const hoursDone = done.reduce((a, p) => a + p.hours, 0)
  const hoursTotal = c.lessons.reduce((a, p) => a + p.hours, 0)
  const days = useMemo(() => studyDays(commitDays, progressFile), [progressFile])
  const noteCount = c.lessons.filter((p) => hasNote(p.id)).length

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <main className="portfolio" aria-labelledby="pf-title">
      <div className="pf-inner">
        <header className="pf-hero">
          <button type="button" className="text-button pf-back" onClick={onClose}>
            <ArrowLeft size={16} aria-hidden="true" /> 지도로
          </button>
          <p className="intro-kicker">study record</p>
          <h2 id="pf-title" ref={headingRef} tabIndex={-1}>
            {CONFIG.owner.name}
          </h2>
          <p className="pf-tagline">{CONFIG.owner.tagline}</p>
          <p className="pf-links">
            <a href={CONFIG.owner.githubUrl} target="_blank" rel="noreferrer">
              GitHub <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a href={CONFIG.repoUrl} target="_blank" rel="noreferrer">
              이 리포 <ExternalLink size={13} aria-hidden="true" />
            </a>
          </p>
        </header>

        <section className="pf-stats" aria-label="요약">
          <Stat label="퀴즈 통과 강의" value={`${done.length} / ${c.lessons.length}`} />
          <Stat label="통과한 강의 분량" value={`${hoursDone}h`} sub={`전체 ${hoursTotal}h`} />
          <Stat label="직접 쓴 노트" value={noteCount} />
          <Stat label="구현 프로젝트" value={labs.length} />
          <Stat label="공부한 날" value={`${days.size}일`} sub={`최장 ${longestStreak(days.keys())}일 연속`} />
        </section>

        <Heatmap days={days} />
        <TrackProgress c={c} progressFile={progressFile} />
        <Projects c={c} onSelect={onSelect} />
        <Notes c={c} progressFile={progressFile} onSelect={onSelect} />

        <footer className="pf-section pf-verify">
          <h3>기록을 확인하는 법</h3>
          <ul>
            <li>
              퀴즈 기록은 리포의 <code>progress/&lt;강의&gt;.json</code> 에 응시 날짜와 문항별 정답 여부로 남습니다. 퀴즈는 강의의 원리마다
              한 문항을 묻고, 다시 풀 때는 틀린 원리만 다른 문항으로 묻습니다.
            </li>
            <li>
              노트(<code>{CONFIG.record.notesDir}/</code>)와 구현 코드(<code>{CONFIG.record.labsDir}/</code>)는 각 탭의 작성 이력 링크에서
              커밋 날짜를 볼 수 있습니다.
            </li>
          </ul>
          <p className="pf-credit">
            커리큘럼은{' '}
            <a href={CONFIG.upstreamUrl} target="_blank" rel="noreferrer">
              {CONFIG.upstreamUrl.replace('https://github.com/', '')}
            </a>{' '}
            을 바탕으로 합니다(강의 CC BY-NC-SA 4.0, 사이트 MIT). 이 리포는 강의를 더하고, 노트·구현 기록과 이 페이지를 붙였습니다.
          </p>
        </footer>
      </div>
    </main>
  )
}
