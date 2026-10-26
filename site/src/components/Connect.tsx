import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CONFIG } from '../config'
import { learner, repoUrl, shareUrl, SITE_REPO, useLearner } from '../curriculum/learner'

const NEW_REPO = `https://github.com/new?name=${CONFIG.record.studyRepoName}&visibility=public&description=${encodeURIComponent(
  '로보틱스 공부 기록: 퀴즈 결과와 노트 (Robotics Roadmap)',
)}`
// GitHub fills in the name, a year's expiry and Contents: Read and write from these; only the repository is left to pick
const NEW_TOKEN = `https://github.com/settings/personal-access-tokens/new?name=robotics-roadmap&description=${encodeURIComponent(
  'Robotics Roadmap 사이트에서 공부 기록 커밋',
)}&expires_in=366&contents=write`

/** #/connect: keep this browser's GitHub token and the repository the learner's record goes to. */
export function Connect({ onClose, onPortfolio }: { onClose(): void; onPortfolio(): void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const s = useLearner()
  const [token, setToken] = useState('')
  const [repo, setRepo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const connected = s.writable && s.login

  useEffect(() => {
    const d = dialogRef.current!
    if (!d.open) d.showModal()
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    d.addEventListener('cancel', onCancel)
    return () => d.removeEventListener('cancel', onCancel)
  }, [onClose])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await learner.connect(token, repo)
      setToken('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl(s.repo))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('복사하지 못했습니다. 링크를 길게 눌러 복사합니다')
    }
  }

  return (
    <dialog ref={dialogRef} className="intro connect" aria-labelledby="connect-title">
      <button type="button" className="icon-button intro-close" onClick={onClose} aria-label="닫기">
        <X size={20} aria-hidden="true" />
      </button>
      <p className="intro-kicker">study with github</p>
      <h2 id="connect-title">내 공부 기록</h2>

      {connected ? (
        <>
          <p className="intro-lead">
            <strong>@{s.login}</strong> 으로 연결되어 있습니다. 이 브라우저에서 푼 퀴즈와 쓴 노트는{' '}
            <a href={repoUrl(s.repo)} target="_blank" rel="noreferrer">
              {s.repo}
            </a>{' '}
            에 커밋되고, 그 커밋이 내 GitHub 잔디가 됩니다.
          </p>
          <p className="connect-share">
            <span>내 기록을 보여 줄 링크</span>
            <code>{shareUrl(s.repo)}</code>
          </p>
          <div className="intro-actions">
            <button type="button" className="primary-button" onClick={onPortfolio}>
              내 기록 보기
            </button>
            <button type="button" className="text-button" onClick={copy}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? '복사했습니다' : '링크 복사'}
            </button>
            <button type="button" className="text-button" onClick={() => learner.disconnect()}>
              연결 끊기
            </button>
          </div>
          {error && (
            <p className="quiz-error" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="intro-lead">
            GitHub 계정이 있으면 이 사이트에서 푼 퀴즈와 쓴 노트가 <strong>내 GitHub 리포</strong>에 커밋됩니다. 내 잔디가 쌓이고, 그
            리포가 공부한 증거가 됩니다. 서버를 거치지 않고 이 브라우저에서 GitHub 로 바로 보냅니다.
          </p>
          <ol className="intro-steps">
            <li>
              <strong>기록을 둘 리포 만들기</strong>
              <span>
                <a href={NEW_REPO} target="_blank" rel="noreferrer">
                  GitHub 에서 새 리포 만들기 <ExternalLink size={12} aria-hidden="true" />
                </a>{' '}
                이름은 <code>{CONFIG.record.studyRepoName}</code> 를 권하고, Public 으로 만들면 기록을 다른 사람에게 링크로 보여 줄 수 있습니다.
                이미 있는 리포를 써도 되고, 이 사이트의 주인은 <code>{SITE_REPO}</code> 를 씁니다.
              </span>
            </li>
            <li>
              <strong>토큰 만들기</strong>
              <span>
                <a href={NEW_TOKEN} target="_blank" rel="noreferrer">
                  Fine-grained token 만들기 <ExternalLink size={12} aria-hidden="true" />
                </a>{' '}
를 누르면 이름과 권한(<b>Contents: Read and write</b>)이 채워진 화면이 열립니다. <b>Repository access</b> 에서{' '}
                <b>Only select repositories</b> 를 고르고 1 의 리포 하나를 선택한 뒤, 맨 아래 <b>Generate token</b> 을 눌러 나온{' '}
                <code>github_pat_…</code> 를 복사합니다. 이 값은 한 번만 보입니다.
              </span>
            </li>
            <li>
              <strong>붙여넣고 연결</strong>
              <div>
                <form className="connect-form" onSubmit={submit}>
                  <label>
                    토큰
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="github_pat_…"
                      autoComplete="off"
                      spellCheck={false}
                      required
                    />
                  </label>
                  <label>
                    기록 리포
                    <input
                      type="text"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder={`비워 두면 <내 아이디>/${CONFIG.record.studyRepoName}`}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </label>
                  <button type="submit" className="primary-button" disabled={busy || !token.trim()}>
                    {busy ? '확인 중…' : '연결'}
                  </button>
                </form>
              </div>
            </li>
          </ol>
          {error && (
            <p className="quiz-error" role="alert">
              {error}
            </p>
          )}
          <p className="intro-note">
            토큰은 이 브라우저에만 저장되고 GitHub 말고는 어디로도 보내지 않습니다. 리포 하나의 파일만 바꿀 수 있는 토큰이라, 새어 나가도 그
            리포 밖은 건드리지 못합니다. 다른 기기나 홈 화면에 추가한 앱에서는 한 번 더 연결합니다.
          </p>
        </>
      )}
    </dialog>
  )
}
