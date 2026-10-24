import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { UpdateState } from '../../update-server'
import { CONFIG } from '../config'

const U = CONFIG.update

/** Offers to merge the original repository's new commits into the fork; hidden when there is nothing to say. */
export function UpdateBanner() {
  const [state, setState] = useState<UpdateState | null>(null)
  const [later, setLater] = useState(false)

  useEffect(() => {
    // a built site has no dev server to ask, so the banner stays hidden
    if (!import.meta.env.DEV) return
    fetch(U.endpoint)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: UpdateState | null) => s && setState(s))
      .catch(() => {})
    import.meta.hot?.on(U.event, setState)
    return () => import.meta.hot?.off(U.event, setState)
  }, [])

  const previous = useRef<UpdateState['status'] | null>(null)
  useEffect(() => {
    // lessons and the site changed under the page; reload so it shows them. Only on the change itself: the server keeps
    // saying 'updated' afterwards, and reloading on that would reload forever
    if (state?.status === 'updated' && previous.current === 'updating') window.location.reload()
    previous.current = state?.status ?? null
  }, [state])

  if (!state || !['behind', 'updating', 'install', 'failed'].includes(state.status)) return null
  if (later && state.status === 'behind') return null

  const merge = () => {
    setState({ status: 'updating', behind: 'behind' in state ? state.behind : 0 })
    fetch(U.endpoint, { method: 'POST' })
      .then((r) => r.json())
      .then(setState)
      .catch(() => {})
  }

  return (
    <div className={`update-banner is-${state.status}`} role="status">
      {state.status === 'behind' && (
        <>
          <span>
            원본 리포에 새 업데이트가 있습니다(커밋 {state.behind}개). 지금 업데이트할까요? 퀴즈 기록은 그대로 남습니다.
          </span>
          <button type="button" onClick={merge}>
            <RefreshCw size={14} aria-hidden="true" />
            업데이트
          </button>
          <button type="button" className="is-quiet" onClick={() => setLater(true)}>
            나중에
          </button>
        </>
      )}
      {state.status === 'updating' && <span>업데이트를 받는 중입니다…</span>}
      {state.status === 'install' && (
        <span>
          업데이트에 새 패키지가 들어 있습니다. 터미널에서 서버를 끄고 <code>npm install</code> 뒤 <code>npm run dev</code> 로 다시 실행해 주세요.
        </span>
      )}
      {state.status === 'failed' && (
        <span>
          직접 고친 파일이 원본과 겹쳐서 자동으로 합치지 못했습니다. 터미널에서 <code>git merge upstream/main</code> 으로 합쳐 주세요.
        </span>
      )}
    </div>
  )
}
