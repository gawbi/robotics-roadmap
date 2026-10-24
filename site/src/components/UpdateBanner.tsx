import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { UpdateState } from '../../update-server'
import { CONFIG } from '../config'

const U = CONFIG.update

/** Offers to merge the original repository's new commits into the fork; hidden when there is nothing to say. */
export function UpdateBanner() {
  const [state, setState] = useState<UpdateState | null>(null)

  useEffect(() => {
    // a built site has no dev server to ask, so the request fails and the banner stays hidden
    fetch(U.endpoint)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: UpdateState | null) => s && setState(s))
      .catch(() => {})
    import.meta.hot?.on(U.event, setState)
    return () => import.meta.hot?.off(U.event, setState)
  }, [])

  useEffect(() => {
    // lessons and the site changed under the page; reload so it shows them
    if (state?.status === 'updated') window.location.reload()
  }, [state])

  if (!state || !['behind', 'updating', 'restart', 'failed'].includes(state.status)) return null

  const merge = () => {
    fetch(U.endpoint, { method: 'POST' })
      .then((r) => r.json())
      .then(setState)
      .catch(() => {})
  }

  return (
    <div className={`update-banner is-${state.status}`} role="status">
      {state.status === 'behind' && (
        <>
          <span>원본 리포에 새 업데이트가 있습니다 (커밋 {state.behind}개)</span>
          <button type="button" onClick={merge}>
            <RefreshCw size={14} aria-hidden="true" />
            업데이트
          </button>
        </>
      )}
      {state.status === 'updating' && <span>업데이트를 받는 중입니다…</span>}
      {state.status === 'restart' && (
        <span>
          업데이트를 받았습니다. 터미널에서 서버를 끄고 <code>npm install</code> 뒤 <code>npm run dev</code> 로 다시 실행해 주세요.
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
