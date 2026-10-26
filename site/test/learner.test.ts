import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONFIG } from '../src/config'
import { decodeBase64, encodeBase64 } from '../src/curriculum/github'
import { learner, SITE_REPO } from '../src/curriculum/learner'
import { formatResult, parseResult, type Attempt } from '../src/curriculum/quiz'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const attempt = (date: string, correct: boolean[]): Attempt => ({
  date,
  answers: correct.map((c, i) => ({ topic: `t${i}`, variant: 0, choice: 0, correct: c })),
})

type Call = { url: string; init?: RequestInit }
let calls: Call[]
let storage: Map<string, string>

function connectTo(repo: string) {
  storage.set(CONFIG.storage.connectionKey, JSON.stringify({ token: 'tok', repo, login: 'gawbi' }))
}

beforeEach(() => {
  calls = []
  storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  })
  vi.stubGlobal('window', { location: new URL('https://gawbi.github.io/robotics-roadmap/#/') })
  vi.stubGlobal('history', { replaceState: () => {} })
})

afterEach(() => vi.unstubAllGlobals())

function serve(handler: (call: Call) => Response | Promise<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const call = { url, init }
      calls.push(call)
      return handler(call)
    }),
  )
}

const puts = () => calls.filter((c) => c.init?.method === 'PUT').map((c) => JSON.parse(String(c.init!.body)))

describe('learner on the published site', () => {
  it('appends a quiz attempt to the file in the repository and commits it with the token', async () => {
    connectTo(SITE_REPO)
    const old = attempt('2026-10-20', [true, false])
    serve(({ init }) => (init?.method === 'PUT' ? json({ content: { sha: 'new' } }) : json({ content: encodeBase64(formatResult([old])), sha: 'old' })))

    const now = attempt('2026-10-26', [true, true])
    await learner.recordAttempt('pid-control', now)

    const [put] = puts()
    expect(calls[0].url).toBe(`https://api.github.com/repos/${SITE_REPO}/contents/progress/pid-control.json`)
    expect((calls[0].init!.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(put.sha).toBe('old')
    expect(put.message).toBe('Quiz pid-control: 2/2')
    expect(parseResult(decodeBase64(put.content)).attempts).toEqual([old, now])
    expect(decodeBase64(put.content)).toBe(formatResult([old, now]))
  })

  it('creates the file for a first attempt', async () => {
    connectTo(SITE_REPO)
    serve(({ init }) => (init?.method === 'PUT' ? json({ content: { sha: 'new' } }) : json({ message: 'Not Found' }, 404)))
    await learner.recordAttempt('kalman-filter', attempt('2026-10-26', [false]))
    const [put] = puts()
    expect(put.sha).toBeUndefined()
    expect(parseResult(decodeBase64(put.content)).attempts).toHaveLength(1)
  })

  it('reads again and appends when another device committed first', async () => {
    connectTo(SITE_REPO)
    const fromPhone = attempt('2026-10-26', [true])
    let reads = 0
    let writes = 0
    serve(({ init }) => {
      if (init?.method === 'PUT') return ++writes === 1 ? json({ message: 'sha does not match' }, 409) : json({ content: { sha: 'c' } })
      return ++reads === 1 ? json({ content: encodeBase64(formatResult([])), sha: 'a' }) : json({ content: encodeBase64(formatResult([fromPhone])), sha: 'b' })
    })
    const fromLaptop = attempt('2026-10-26', [false])
    await learner.recordAttempt('pid-control', fromLaptop)
    const last = puts().at(-1)
    expect(last.sha).toBe('b')
    expect(parseResult(decodeBase64(last.content)).attempts).toEqual([fromPhone, fromLaptop])
  })

  it('will not commit without a token for the repository on show', async () => {
    serve(() => json({}))
    await expect(learner.recordAttempt('pid-control', attempt('2026-10-26', [true]))).rejects.toThrow()
    expect(calls).toHaveLength(0)
  })

  it('says what to fix when GitHub refuses the token', async () => {
    connectTo(SITE_REPO)
    serve(() => json({ message: 'Resource not accessible by personal access token' }, 403))
    await expect(learner.recordAttempt('pid-control', attempt('2026-10-26', [true]))).rejects.toThrow(/Contents: Read and write/)
  })

  it('keeps someone else’s record in <login>/<study repo> unless a repository is given', async () => {
    serve(({ url, init }) => {
      if (url.endsWith('/user')) return json({ login: 'friend' })
      if (url.endsWith(`/repos/friend/${CONFIG.record.studyRepoName}`)) return json({ full_name: `friend/${CONFIG.record.studyRepoName}`, private: false, permissions: { push: true } })
      if (url.endsWith('/graphql') && init?.method === 'POST') return json({ data: { repository: { progress: null, notes: null, labs: null, defaultBranchRef: null } } })
      return json({ message: 'Not Found' }, 404)
    })
    expect(await learner.connect(' tok ')).toBe(`friend/${CONFIG.record.studyRepoName}`)
    expect(JSON.parse(storage.get(CONFIG.storage.connectionKey)!)).toEqual({ token: 'tok', repo: `friend/${CONFIG.record.studyRepoName}`, login: 'friend' })
    expect(learner.get()).toMatchObject({ repo: `friend/${CONFIG.record.studyRepoName}`, writable: true, status: 'ready', login: 'friend' })
    learner.disconnect()
    expect(storage.has(CONFIG.storage.connectionKey)).toBe(false)
    expect(learner.get()).toMatchObject({ repo: SITE_REPO, source: 'build', writable: false })
  })

  it('refuses a repository the account cannot write to', async () => {
    serve(({ url }) => (url.endsWith('/user') ? json({ login: 'friend' }) : json({ full_name: 'other/repo', private: false, permissions: { push: false } })))
    await expect(learner.connect('tok', 'other/repo')).rejects.toThrow(/쓸 수 없습니다/)
    expect(storage.has(CONFIG.storage.connectionKey)).toBe(false)
  })
})
