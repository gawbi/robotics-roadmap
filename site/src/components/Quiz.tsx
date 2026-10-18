import { Check, ListChecks, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { hasQuiz, loadBank } from '../curriculum/load'
import { parseBank, passed, pickVariants, type Attempt, type Pick, type QuizStatus, type Topic } from '../curriculum/quiz'
import { Markdown } from './Markdown'

type ServerState = { kind: 'loading' } | { kind: 'offline' } | { kind: 'ready'; status: QuizStatus }

const url = (id: string) => `${CONFIG.quiz.endpoint}/${id}`

async function request<T>(id: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(id), init)
  const body = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : null
  if (!body) throw new Error('offline')
  if (!res.ok) throw new Error(body.error ?? `요청 실패 (${res.status})`)
  return body as T
}

const score = (a: Attempt) => `${a.answers.filter((x) => x.correct).length} / ${a.answers.length}`

/** Panel card that starts the multiple-choice part of /evaluate. Renders nothing for projects without a bank. */
export function QuizSection({ projectId, title }: { projectId: string; title: string }) {
  const [server, setServer] = useState<ServerState>({ kind: 'loading' })
  const [open, setOpen] = useState(false)
  const enabled = hasQuiz(projectId)
  const live = useRef(true)

  // HEAD and the working tree change in the terminal, so re-read them whenever the learner comes back to the map
  const refresh = useCallback(async (): Promise<QuizStatus | null> => {
    try {
      const status = await request<QuizStatus>(projectId)
      if (live.current) setServer({ kind: 'ready', status })
      return status
    } catch {
      if (live.current) setServer({ kind: 'offline' })
      return null
    }
  }, [projectId])

  useEffect(() => {
    if (!enabled) return
    live.current = true
    refresh()
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      live.current = false
      window.removeEventListener('focus', onFocus)
    }
  }, [enabled, refresh])

  async function start() {
    const status = await refresh()
    if (status && !status.dirty) setOpen(true)
  }

  if (!enabled) return null
  const last = server.kind === 'ready' ? server.status.attempts.at(-1) : undefined

  return (
    <section className="quiz-card" aria-labelledby="quiz-card-title">
      <h3 id="quiz-card-title">
        <ListChecks size={15} aria-hidden="true" /> 객관식 평가
      </h3>
      {server.kind === 'loading' && <p className="quiz-card-text">응시 정보 확인 중…</p>}
      {server.kind === 'offline' && (
        <p className="quiz-card-text">
          로컬에서 띄운 지도에서만 응시할 수 있습니다. 리포의 <code>site/</code> 에서 <code>npm run dev</code> 로 띄웁니다.
        </p>
      )}
      {server.kind === 'ready' && (
        <>
          {last && (
            <p className={`quiz-card-last ${passed(last.answers) ? 'is-pass' : 'is-fail'}`}>
              마지막 응시 {last.date} · {score(last)} 정답 · <code>{last.commit}</code>
            </p>
          )}
          {server.status.dirty ? (
            <p className="quiz-card-text">
              <code>projects/{projectId}/</code> 에 commit 하지 않은 변경이 있습니다. 평가는 commit 된 코드만 보므로 commit 한 뒤
              응시합니다.
            </p>
          ) : (
            <button type="button" className="primary-button quiz-start" onClick={start}>
              {last ? '다시 응시' : '응시 시작'}
            </button>
          )}
        </>
      )}
      {open && server.kind === 'ready' && (
        <QuizDialog
          projectId={projectId}
          title={title}
          status={server.status}
          onClose={() => setOpen(false)}
          onSubmitted={(attempt) =>
            setServer((prev) =>
              prev.kind === 'ready' ? { kind: 'ready', status: { ...prev.status, attempts: [...prev.status.attempts, attempt] } } : prev,
            )
          }
        />
      )}
    </section>
  )
}

interface DialogProps {
  projectId: string
  title: string
  status: QuizStatus
  onClose(): void
  onSubmitted(attempt: Attempt): void
}

function QuizDialog({ projectId, title, status: opened, onClose, onSubmitted }: DialogProps) {
  // the questions and the commit are fixed when the dialog opens; later status refreshes must not re-pick them
  const [status] = useState(opened)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [bank, setBank] = useState<Topic[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [picks, setPicks] = useState<Pick[]>([])
  const [choices, setChoices] = useState<(number | null)[]>([])
  const [step, setStep] = useState(0)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Attempt | null>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
    let live = true
    loadBank(projectId)
      .then(parseBank)
      .then(
        (b) => {
          if (!live) return
          setBank(b)
          setPicks(pickVariants(b, status.attempts))
          setChoices(b.map(() => null))
        },
        (e) => live && setError(`문항을 불러오지 못했습니다: ${e instanceof Error ? e.message : e}`),
      )
    return () => {
      live = false
    }
  }, [projectId, status.attempts])

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    dialogRef.current?.querySelector('.quiz-body')?.scrollTo({ top: 0 })
  }, [step, result])

  const total = picks.length
  const topic = bank?.[step]
  const variant = topic && picks[step] ? topic.variants[picks[step].variant] : undefined
  const chosen = choices[step]
  const isLast = step === total - 1

  async function submit() {
    setSending(true)
    setError(null)
    try {
      const attempt = await request<Attempt>(projectId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commit: status.head, answers: picks.map((p, i) => ({ ...p, choice: choices[i] })) }),
      })
      setResult(attempt)
      onSubmitted(attempt)
    } catch (e) {
      setError(e instanceof Error && e.message !== 'offline' ? e.message : '제출하지 못했습니다. dev server 가 켜져 있는지 확인합니다')
    } finally {
      setSending(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="quiz-dialog"
      aria-labelledby="quiz-heading"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <header className="quiz-head">
        <p className="quiz-kicker">객관식 평가 · {title}</p>
        <button type="button" className="icon-button" onClick={onClose} aria-label="평가 닫기">
          <X size={20} aria-hidden="true" />
        </button>
        {!result && total > 0 && (
          <div className="quiz-progress" aria-hidden="true">
            <span style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        )}
      </header>

      <div className="quiz-body">
        {result && bank ? (
          <Results projectId={projectId} bank={bank} attempt={result} headingRef={headingRef} />
        ) : topic && variant ? (
          <fieldset className="quiz-question">
            <legend className="sr-only">
              {step + 1}번 문항 / 전체 {total}문항
            </legend>
            <p className="quiz-step">
              {step + 1} / {total} · {topic.title}
            </p>
            <h2 id="quiz-heading" ref={headingRef} tabIndex={-1} className="sr-only">
              {step + 1}번 문항
            </h2>
            <Markdown projectId={projectId} source={variant.question} />
            <div className="quiz-choices">
              {variant.choices.map((choice, i) => (
                <label key={i} className={`quiz-choice ${chosen === i ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name={`q-${step}`}
                    checked={chosen === i}
                    onChange={() => setChoices((prev) => prev.map((c, j) => (j === step ? i : c)))}
                  />
                  <span className="quiz-choice-key" aria-hidden="true">
                    {i + 1}
                  </span>
                  <Markdown projectId={projectId} source={choice} inline />
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          !error && (
            <p id="quiz-heading" className="quiz-card-text" aria-busy="true">
              문항 불러오는 중…
            </p>
          )
        )}
        {error && (
          <p className="quiz-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="quiz-foot">
        {result ? (
          <button type="button" className="primary-button" onClick={onClose}>
            닫기
          </button>
        ) : (
          <>
            <button type="button" className="text-button" onClick={() => setStep(step - 1)} disabled={step === 0 || sending}>
              이전
            </button>
            {isLast ? (
              <button type="button" className="primary-button" onClick={submit} disabled={chosen == null || sending}>
                {sending ? '제출 중…' : '제출'}
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={() => setStep(step + 1)} disabled={chosen == null || !variant}>
                다음
              </button>
            )}
          </>
        )}
      </footer>
    </dialog>
  )
}

function Results({
  projectId,
  bank,
  attempt,
  headingRef,
}: {
  projectId: string
  bank: Topic[]
  attempt: Attempt
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const ok = passed(attempt.answers)
  return (
    <div className="quiz-results">
      <h2 id="quiz-heading" ref={headingRef} tabIndex={-1} className={ok ? 'is-pass' : 'is-fail'}>
        {score(attempt)} 정답
      </h2>
      <p className="quiz-verdict">
        {ok
          ? '구두 평가 기준을 통과했습니다.'
          : '틀린 문항이 있어 구두 평가는 재평가입니다. 아래 해설을 읽고 다시 응시하면 같은 원리를 다른 문항으로 묻습니다.'}
      </p>
      <p className="soft-note">
        터미널에서 <code>/evaluate {projectId}</code> 를 실행하면 실행 검사와 함께 이 결과가 평가 기록에 남습니다.
      </p>
      <ol className="quiz-review">
        {attempt.answers.map((a) => {
          const topic = bank.find((t) => t.topic === a.topic)!
          const v = topic.variants[a.variant]
          return (
            <li key={a.topic} className={a.correct ? 'is-correct' : 'is-wrong'}>
              <p className="quiz-review-title">
                {a.correct ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                <span className="sr-only">{a.correct ? '정답' : '오답'}</span>
                {topic.title}
              </p>
              <Markdown projectId={projectId} source={v.question} />
              <dl>
                {!a.correct && (
                  <>
                    <dt>고른 답</dt>
                    <dd>
                      <Markdown projectId={projectId} source={v.choices[a.choice]} inline />
                    </dd>
                  </>
                )}
                <dt>정답</dt>
                <dd>
                  <Markdown projectId={projectId} source={v.choices[v.answer]} inline />
                </dd>
              </dl>
              <Markdown projectId={projectId} source={v.explanation} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
