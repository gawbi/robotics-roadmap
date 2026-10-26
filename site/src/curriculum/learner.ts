import { useSyncExternalStore } from 'react'
import { CONFIG } from '../config'
import { github, GitHubError, parseRepo, type GitHub } from './github'
import { commitDays as builtCommitDays, initialAttempts, labs as builtLabs, loadNote as loadBuiltNote, noteIds } from './load'
import { progress, type ProgressFile } from './progress'
import { formatResult, parseResult, type Attempt } from './quiz'
import { dayKey, parseLab, type Lab } from './record'

// Whose study record the site shows, and where a new quiz result or note goes. A visitor sees the site owner's record
// as of the last deploy. Anyone who connects a GitHub token keeps their own record in their own repository: the site
// reads it from GitHub and commits to it from the browser, so studying needs neither a server nor `npm run dev`.

/** the repository this site is built from; its record also ships in the build */
export const SITE_REPO = parseRepo(CONFIG.repoUrl)!

export interface LearnerState {
  /** owner/name of the repository whose progress/, notes/ and labs/ are on show */
  repo: string
  /** the build's copy of the site owner's record, or the repository on GitHub as it is now */
  source: 'build' | 'github'
  /** the GitHub user connected in this browser, if any */
  login: string | null
  /** this browser holds a token that can commit to `repo` */
  writable: boolean
  status: 'ready' | 'loading' | 'error'
  message?: string
  notes: ReadonlySet<string>
  labs: readonly Lab[]
  commitDays: Readonly<Record<string, number>>
}

interface Connection {
  token: string
  repo: string
  login: string
}

const BUILT: Pick<LearnerState, 'repo' | 'source' | 'notes' | 'labs' | 'commitDays'> = {
  repo: SITE_REPO,
  source: 'build',
  notes: noteIds,
  labs: builtLabs,
  commitDays: builtCommitDays,
}

/** the published site only: in dev the record is the working tree, written by the dev server */
export const CONNECTABLE = !import.meta.env.DEV

let state: LearnerState = { ...BUILT, login: null, writable: false, status: 'ready' }
const listeners = new Set<() => void>()
const set = (next: Partial<LearnerState>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

// notes read or written in this session, so a saved note shows before GitHub's caches catch up
const noteTexts = new Map<string, string>()
let loadRun = 0

function storedConnection(): Connection | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG.storage.connectionKey) ?? 'null') as Connection | null
    return c?.token && c.repo && c.login ? c : null
  } catch {
    return null
  }
}

function errorText(e: unknown): string {
  if (e instanceof GitHubError) {
    if (e.status === 401) return '토큰이 올바르지 않거나 만료됐습니다. 새 토큰으로 다시 연결합니다'
    if (e.status === 403) return `GitHub 가 거절했습니다(${e.message}). 토큰에 이 리포의 Contents: Read and write 권한이 있는지 확인합니다`
    if (e.status === 404) return '리포나 파일을 찾을 수 없습니다. 비공개 리포는 연결한 브라우저에서만 읽을 수 있습니다'
    return e.message
  }
  return e instanceof Error ? e.message : String(e)
}

/** the repository `?u=` asks to show, if any */
function viewedRepo(): string | null {
  const u = new URLSearchParams(window.location.search).get(CONFIG.record.viewParam)
  return u ? parseRepo(u) : null
}

const isNote = (name: string) => name.endsWith('.md') && name !== 'README.md'
const sinceHeatmap = () => new Date(Date.now() - CONFIG.record.heatmapWeeks * 7 * 86_400_000)

function countDays(commits: { sha: string; date: string }[]): Record<string, number> {
  const seen = new Set<string>()
  const days: Record<string, number> = {}
  for (const c of commits) {
    if (seen.has(c.sha)) continue
    seen.add(c.sha)
    const day = dayKey(new Date(c.date))
    days[day] = (days[day] ?? 0) + 1
  }
  return days
}

interface Snapshot {
  progress: ProgressFile
  notes: Set<string>
  labs: Lab[]
  commitDays: Record<string, number>
}

const RECORD_QUERY = `query($owner: String!, $name: String!, $since: GitTimestamp!) {
  repository(owner: $owner, name: $name) {
    progress: object(expression: "HEAD:progress") { ... on Tree { entries { name object { ... on Blob { text } } } } }
    notes: object(expression: "HEAD:notes") { ... on Tree { entries { name } } }
    labs: object(expression: "HEAD:labs") { ... on Tree { entries { name type } } }
    defaultBranchRef { target { ... on Commit {
      p: history(path: "progress", since: $since, first: 100) { nodes { oid authoredDate } }
      n: history(path: "notes", since: $since, first: 100) { nodes { oid authoredDate } }
      l: history(path: "labs", since: $since, first: 100) { nodes { oid authoredDate } }
    } } }
  }
}`

type Tree<T> = { entries: T[] } | null
interface RecordResult {
  repository: {
    progress: Tree<{ name: string; object: { text: string | null } | null }>
    notes: Tree<{ name: string }>
    labs: Tree<{ name: string; type: string }>
    defaultBranchRef: { target: Record<'p' | 'n' | 'l', { nodes: { oid: string; authoredDate: string }[] }> } | null
  } | null
}

function labsFrom(readmes: [string, string | null][]): Lab[] {
  const out: Lab[] = []
  for (const [name, text] of readmes) {
    if (text === null) continue
    try {
      out.push(parseLab(name, text))
    } catch {
      // a lab whose header does not parse is left off the page; the repo's own tests point at it
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}

/** With a token: two GraphQL queries at most, so a page load does not spend the API limit file by file. */
async function snapshotWithToken(gh: GitHub, repo: string): Promise<Snapshot> {
  const [owner, name] = repo.split('/')
  const r = await gh.graphql<RecordResult>(RECORD_QUERY, { owner, name, since: sinceHeatmap().toISOString() })
  if (!r.repository) throw new GitHubError(`${repo} 를 찾을 수 없습니다`, 404)
  const progressFile: Record<string, Attempt[]> = {}
  for (const e of r.repository.progress?.entries ?? []) {
    if (e.name.endsWith('.json')) progressFile[e.name.slice(0, -5)] = parseResult(e.object?.text ?? null).attempts
  }
  const labDirs = (r.repository.labs?.entries ?? []).filter((e) => e.type === 'tree').map((e) => e.name)
  let readmes: [string, string | null][] = []
  if (labDirs.length > 0) {
    const vars = labDirs.map((_, i) => `$e${i}: String!`).join(', ')
    const fields = labDirs.map((_, i) => `l${i}: object(expression: $e${i}) { ... on Blob { text } }`).join('\n')
    const q = `query($owner: String!, $name: String!, ${vars}) { repository(owner: $owner, name: $name) { ${fields} } }`
    const exprs = Object.fromEntries(labDirs.map((d, i) => [`e${i}`, `HEAD:labs/${d}/README.md`]))
    const l = await gh.graphql<{ repository: Record<string, { text: string | null } | null> }>(q, { owner, name, ...exprs })
    readmes = labDirs.map((d, i) => [d, l.repository[`l${i}`]?.text ?? null])
  }
  const t = r.repository.defaultBranchRef?.target
  const commits = (['p', 'n', 'l'] as const).flatMap((k) => t?.[k].nodes ?? []).map((c) => ({ sha: c.oid, date: c.authoredDate }))
  return {
    progress: progressFile,
    notes: new Set((r.repository.notes?.entries ?? []).map((e) => e.name).filter(isNote).map((n) => n.slice(0, -3))),
    labs: labsFrom(readmes),
    commitDays: countDays(commits),
  }
}

/** Without a token (someone viewing a shared record): six API calls, and the files through raw.githubusercontent.com. */
async function snapshotPublic(gh: GitHub, repo: string): Promise<Snapshot> {
  await gh.repo(repo) // a missing or private repository fails here with a clear message
  const [progressEntries, noteEntries, labEntries] = await Promise.all(['progress', 'notes', 'labs'].map((d) => gh.list(repo, d)))
  const since = sinceHeatmap()
  const [results, readmes, commits] = await Promise.all([
    Promise.all(
      progressEntries
        .filter((e) => e.type === 'file' && e.name.endsWith('.json'))
        .map(async (e) => [e.name.slice(0, -5), parseResult(await gh.raw(repo, `progress/${e.name}`)).attempts] as const),
    ),
    Promise.all(labEntries.filter((e) => e.type === 'dir').map(async (e) => [e.name, await gh.raw(repo, `labs/${e.name}/README.md`)] as [string, string | null])),
    Promise.all(['progress', 'notes', 'labs'].map((d) => gh.commitDates(repo, d, since))),
  ])
  return {
    progress: Object.fromEntries(results),
    notes: new Set(noteEntries.map((e) => e.name).filter(isNote).map((n) => n.slice(0, -3))),
    labs: labsFrom(readmes),
    commitDays: countDays(commits.flat()),
  }
}

/** Show `repo`'s record: the build's copy for the site's own repository when nobody can write to it, else GitHub's. */
async function show(repo: string) {
  const run = ++loadRun
  const conn = storedConnection()
  const writable = conn?.repo === repo
  noteTexts.clear()
  if (repo === SITE_REPO && !writable) {
    progress.replace(initialAttempts)
    set({ ...BUILT, login: conn?.login ?? null, writable: false, status: 'ready', message: undefined })
    return
  }
  set({ repo, source: 'github', login: conn?.login ?? null, writable, status: 'loading', message: undefined })
  try {
    const gh = github(writable ? conn!.token : null)
    const snap = writable ? await snapshotWithToken(gh, repo) : await snapshotPublic(gh, repo)
    if (run !== loadRun) return
    progress.replace(snap.progress)
    set({
      status: 'ready',
      notes: snap.notes,
      labs: snap.labs,
      // the site's own repository also holds the notes and labs folder guides, which the build's count leaves out
      commitDays: repo === SITE_REPO ? builtCommitDays : snap.commitDays,
    })
  } catch (e) {
    if (run !== loadRun) return
    progress.replace({})
    set({ status: 'error', message: errorText(e), notes: new Set(), labs: [], commitDays: {} })
  }
}

function connection(): Connection {
  const conn = storedConnection()
  if (!conn || conn.repo !== state.repo) throw new Error('이 리포에 쓸 수 있게 연결되어 있지 않습니다')
  return conn
}

export const learner = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /** pick the record to show from the address and this browser's connection; call once when the page starts */
  init() {
    if (!CONNECTABLE) return
    const repo = viewedRepo() ?? storedConnection()?.repo ?? SITE_REPO
    if (repo !== SITE_REPO || storedConnection()?.repo === SITE_REPO) void show(repo)
    else set({ login: storedConnection()?.login ?? null })
  },

  /**
   * Check the token and the repository, keep them in this browser, and show that repository's record. Without a
   * repository the site's own is used for its owner, and <login>/<CONFIG.record.studyRepoName> for anyone else.
   */
  async connect(token: string, repoText?: string): Promise<string> {
    const gh = github(token.trim())
    const { login } = await gh.user().catch((e) => {
      throw new Error(errorText(e))
    })
    const repo = repoText?.trim()
      ? parseRepo(repoText)
      : login.toLowerCase() === SITE_REPO.split('/')[0].toLowerCase()
        ? SITE_REPO
        : `${login}/${CONFIG.record.studyRepoName}`
    if (!repo) throw new Error('리포는 <아이디>/<리포 이름> 꼴로 적습니다')
    const r = await gh.repo(repo).catch((e) => {
      throw new Error(
        e instanceof GitHubError && e.status === 404
          ? `${repo} 를 찾을 수 없습니다. 먼저 리포를 만들고, 토큰을 만들 때 이 리포에 접근을 줍니다`
          : errorText(e),
      )
    })
    if (!r.permissions?.push) throw new Error(`${login} 계정은 ${repo} 에 쓸 수 없습니다`)
    const conn: Connection = { token: token.trim(), repo: r.full_name, login }
    try {
      localStorage.setItem(CONFIG.storage.connectionKey, JSON.stringify(conn))
    } catch {
      throw new Error('이 브라우저에 연결 정보를 저장할 수 없습니다(사생활 보호 모드 등)')
    }
    dropViewParam()
    await show(conn.repo)
    return conn.repo
  },

  /** forget the token in this browser and go back to the site owner's record */
  disconnect() {
    try {
      localStorage.removeItem(CONFIG.storage.connectionKey)
    } catch {
      // nothing stored
    }
    dropViewParam()
    void show(SITE_REPO)
  },

  /** leave someone else's record for this browser's own, or the site owner's */
  showOwn() {
    dropViewParam()
    void show(storedConnection()?.repo ?? SITE_REPO)
  },

  /** commit one more attempt to progress/<id>.json, on top of what the repository holds now */
  async recordAttempt(lessonId: string, attempt: Attempt): Promise<void> {
    const conn = connection()
    const gh = github(conn.token)
    const path = `${CONFIG.quiz.progressDir}/${lessonId}.json`
    const right = attempt.answers.filter((a) => a.correct).length
    for (let tries = 0; ; tries++) {
      try {
        const file = await gh.read(conn.repo, path)
        const attempts = [...parseResult(file?.text ?? null).attempts, attempt]
        await gh.write(conn.repo, path, formatResult(attempts), `Quiz ${lessonId}: ${right}/${attempt.answers.length}`, file?.sha)
        return
      } catch (e) {
        // another device committed in between: read again and append to that
        if (tries < 2 && e instanceof GitHubError && (e.status === 409 || e.status === 422)) continue
        throw new Error(errorText(e))
      }
    }
  },

  /** a note's text, or null when there is none */
  async loadNote(lessonId: string): Promise<string | null> {
    const cached = noteTexts.get(lessonId)
    if (cached !== undefined) return cached
    if (state.source === 'build') return state.notes.has(lessonId) ? loadBuiltNote(lessonId) : null
    const path = `${CONFIG.record.notesDir}/${lessonId}.md`
    const conn = storedConnection()
    const text = state.writable && conn ? ((await github(conn.token).read(state.repo, path))?.text ?? null) : await github(null).raw(state.repo, path)
    if (text !== null) noteTexts.set(lessonId, text)
    return text
  },

  async saveNote(lessonId: string, text: string): Promise<void> {
    const conn = connection()
    const gh = github(conn.token)
    const path = `${CONFIG.record.notesDir}/${lessonId}.md`
    try {
      const file = await gh.read(conn.repo, path)
      await gh.write(conn.repo, path, text, `${file ? 'Update' : 'Write'} note: ${lessonId}`, file?.sha)
    } catch (e) {
      throw new Error(errorText(e))
    }
    noteTexts.set(lessonId, text)
    set({ notes: new Set([...state.notes, lessonId]), source: 'github' })
  },
}

/** `?u=` named the record on show; once the learner switches, the address should not bring it back on reload */
function dropViewParam() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(CONFIG.record.viewParam)) return
  url.searchParams.delete(CONFIG.record.viewParam)
  history.replaceState(null, '', url)
}

export function useLearner(): LearnerState {
  return useSyncExternalStore(learner.subscribe, learner.get, learner.get)
}

export const hasNoteIn = (s: LearnerState, id: string) => s.notes.has(id)
export const labsIn = (s: LearnerState, id: string) => s.labs.filter((l) => l.lessons.includes(id))

/** where a learner's own files live on GitHub */
export const repoUrl = (repo: string) => `https://github.com/${repo}`
export const blobUrl = (repo: string, path: string) =>
  repo === SITE_REPO ? `${CONFIG.repoUrl}/blob/${CONFIG.repoBranch}/${path}` : `${repoUrl(repo)}/blob/HEAD/${path}`
export const treeUrl = (repo: string, path: string) =>
  repo === SITE_REPO ? `${CONFIG.repoUrl}/tree/${CONFIG.repoBranch}/${path}` : `${repoUrl(repo)}/tree/HEAD/${path}`
export const historyUrl = (repo: string, path: string) =>
  repo === SITE_REPO ? `${CONFIG.repoUrl}/commits/${CONFIG.repoBranch}/${path}` : `${repoUrl(repo)}/commits/HEAD/${path}`

/** a link that opens `repo`'s record on this site, for sending to someone */
export function shareUrl(repo: string): string {
  const base = CONFIG.share.siteUrl
  return repo === SITE_REPO ? `${base}#/me` : `${base}?${CONFIG.record.viewParam}=${repo}#/me`
}
