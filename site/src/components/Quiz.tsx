import { Check, ListChecks, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { hasQuiz, loadBank } from '../curriculum/load'
import { progress } from '../curriculum/progress'
import { clearedAt, grade, parseBank, passed, pickVariants, wrongTopics, type Attempt, type Pick, type Topic } from '../curriculum/quiz'
import { Markdown } from './Markdown'

const url = (id: string) => `${CONFIG.quiz.endpoint}/${id}`

async function request<T>(id: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(id), init)
  const body = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : null
  if (!body) throw new Error('offline')
  if (!res.ok) throw new Error(body.error ?? `요청 실패 (${res.status})`)
  return body as T
}

const score = (a: Attempt) => `${a.answers.filter((x) => x.correct).length} / ${a.answers.length}`

/** Quiz card at the end of a lecture. Renders nothing for lessons without a bank. */
export function QuizSection({ lessonId, title, attempts }: { lessonId: string; title: string; attempts: readonly Attempt[] }) {
  const [open, setOpen] = useState(false)
  // bumped by "틀린 문제 다시 풀기" so the dialog remounts and picks its questions from the attempts that include the last one
  const [run, setRun] = useState(0)
  if (!hasQuiz(lessonId)) return null
  const last = attempts.at(-1)
  const cleared = clearedAt(attempts) >= 0
  const wrong = cleared ? 0 : wrongTopics(attempts).length

  return (
    <section className="quiz-card" aria-labelledby="quiz-card-title">
      <h3 id="quiz-card-title">
        <ListChecks size={15} aria-hidden="true" /> 퀴즈
      </h3>
      <p className="quiz-card-text">
        강의의 핵심을 한 문항씩 묻습니다. 틀린 문항은 해설을 보여 주고, 틀린 문항만 같은 원리의 다른 문항으로 다시 풉니다.
        틀린 문항이 남지 않으면 이 강의를 통과합니다.
      </p>
      {last && (
        <p className={`quiz-card-last ${cleared ? 'is-pass' : 'is-fail'}`}>
          마지막 응시 {last.date} · {score(last)} 정답{wrong > 0 && ` · 남은 문항 ${wrong}개`}
        </p>
      )}
      {!import.meta.env.DEV && (
        <p className="quiz-card-text">
          이 사이트에서는 풀어 볼 수만 있고 결과는 새로고침하면 사라집니다. 기록을 남기려면 리포를 fork 해 <code>site/</code> 에서{' '}
          <code>npm run dev</code> 로 띄웁니다.
        </p>
      )}
      <button type="button" className="primary-button quiz-start" onClick={() => setOpen(true)}>
        {!last ? '퀴즈 풀기' : wrong > 0 ? `틀린 문제 다시 풀기 (${wrong}문항)` : '처음부터 다시 풀기'}
      </button>
      {open && (
        <QuizDialog
          key={run}
          lessonId={lessonId}
          title={title}
          attempts={attempts}
          onClose={() => setOpen(false)}
          onSubmitted={(attempt) => progress.add(lessonId, attempt)}
          onRetry={() => setRun((r) => r + 1)}
        />
      )}
    </section>
  )
}

interface DialogProps {
  lessonId: string
  title: string
  attempts: readonly Attempt[]
  onClose(): void
  onSubmitted(attempt: Attempt): void
  onRetry(): void
}

function QuizDialog({ lessonId, title, attempts: opened, onClose, onSubmitted, onRetry }: DialogProps) {
  // the questions are fixed when the dialog opens; the submission below must not re-pick them
  const [attempts] = useState(opened)
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
    loadBank(lessonId)
      .then(parseBank)
      .then(
        (b) => {
          if (!live) return
          const next = pickVariants(b, attempts)
          setBank(b)
          setPicks(next)
          setChoices(next.map(() => null))
        },
        (e) => live && setError(`문항을 불러오지 못했습니다: ${e instanceof Error ? e.message : e}`),
      )
    return () => {
      live = false
    }
  }, [lessonId, attempts])

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    dialogRef.current?.querySelector('.quiz-body')?.scrollTo({ top: 0 })
  }, [step, result])

  const total = picks.length
  const topic = bank?.find((t) => t.topic === picks[step]?.topic)
  const variant = topic ? topic.variants[picks[step].variant] : undefined
  const chosen = choices[step]
  const isLast = step === total - 1

  async function submit() {
    setSending(true)
    setError(null)
    try {
      // a built site has no dev server: grade in the page and keep the result only until reload
      if (!import.meta.env.DEV) {
        const attempt: Attempt = { date: new Date().toISOString().slice(0, 10), answers: grade(bank!, picks, choices as number[]) }
        setResult(attempt)
        onSubmitted(attempt)
        return
      }
      const attempt = await request<Attempt>(lessonId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: picks.map((p, i) => ({ ...p, choice: choices[i] })) }),
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
        <p className="quiz-kicker">퀴즈 · {title}</p>
        <button type="button" className="icon-button" onClick={onClose} aria-label="퀴즈 닫기">
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
          <Results lessonId={lessonId} bank={bank} attempt={result} cleared={clearedAt([...attempts, result]) >= 0} headingRef={headingRef} />
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
            <Markdown lessonId={lessonId} source={variant.question} />
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
                  <Markdown lessonId={lessonId} source={choice} inline />
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
          passed(result.answers) ? (
            <button type="button" className="primary-button" onClick={onClose}>
              닫기
            </button>
          ) : (
            <>
              <button type="button" className="text-button" onClick={onClose}>
                강의 다시 읽기
              </button>
              <button type="button" className="primary-button" onClick={onRetry}>
                틀린 문제 다시 풀기
              </button>
            </>
          )
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
  lessonId,
  bank,
  attempt,
  cleared,
  headingRef,
}: {
  lessonId: string
  bank: Topic[]
  attempt: Attempt
  /** no wrong answer is left across all attempts, this one included */
  cleared: boolean
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const ok = passed(attempt.answers)
  const wrong = attempt.answers.filter((a) => !a.correct).length
  return (
    <div className="quiz-results">
      <h2 id="quiz-heading" ref={headingRef} tabIndex={-1} className={ok ? 'is-pass' : 'is-fail'}>
        {score(attempt)} 정답
      </h2>
      <p className="quiz-verdict">
        {ok
          ? cleared
            ? '틀린 문항이 남지 않아 이 강의를 통과했습니다. 지도에서 이어지는 강의가 밝아집니다.'
            : '모두 맞혔습니다.'
          : `틀린 문항이 ${wrong}개입니다. 아래 해설을 읽은 뒤 "틀린 문제 다시 풀기" 를 누르면 그 ${wrong}문항만 같은 원리의 다른 문항으로 다시 묻습니다.`}
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
              <Markdown lessonId={lessonId} source={v.question} />
              <dl>
                {!a.correct && (
                  <>
                    <dt>고른 답</dt>
                    <dd>
                      <Markdown lessonId={lessonId} source={v.choices[a.choice]} inline />
                    </dd>
                  </>
                )}
                <dt>정답</dt>
                <dd>
                  <Markdown lessonId={lessonId} source={v.choices[v.answer]} inline />
                </dd>
              </dl>
              <Markdown lessonId={lessonId} source={v.explanation} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
