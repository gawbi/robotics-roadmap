import { execFile } from 'node:child_process'
import type { ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'
import { CONFIG } from './src/config'

/** Where the fork stands against the original repository, as the page shows it. */
export type UpdateState =
  | { status: 'checking' | 'current' | 'original' | 'offline' }
  | { status: 'behind' | 'updating' | 'updated' | 'restart'; behind: number }
  | { status: 'failed'; behind: number; detail: string }

const U = CONFIG.update

interface GitResult {
  ok: boolean
  out: string
}

function git(repoRoot: string, args: string[], timeout: number = U.gitTimeoutMs): Promise<GitResult> {
  return new Promise((resolve) => {
    execFile('git', args, { cwd: repoRoot, timeout }, (error, stdout, stderr) => {
      resolve({ ok: !error, out: (error ? stderr || error.message : stdout).trim() })
    })
  })
}

/** owner/name of a GitHub remote, whether written as https://github.com/o/n(.git) or git@github.com:o/n(.git) */
export function repositoryOf(url: string): string | null {
  const m = /github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(url.trim())
  return m ? `${m[1]}/${m[2]}`.toLowerCase() : null
}

function send(res: ServerResponse, code: number, body: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

/**
 * Dev-only check against the original repository. When the server starts it fetches the original into the `upstream`
 * remote (adding the remote if the fork has none) and tells the page how many commits the fork is behind; POST to the
 * endpoint merges them. The original never touches progress/, so a fork that only records quiz progress merges without
 * conflicts. The page hears about every change of state over Vite's own WebSocket.
 */
export function updateServer(repoRoot: string): Plugin {
  const upstream = `${CONFIG.repoUrl}.git`
  const ref = `${U.remote}/${CONFIG.repoBranch}`
  let state: UpdateState = { status: 'checking' }
  let ws: ViteDevServer['ws'] | null = null

  const set = (next: UpdateState) => {
    state = next
    ws?.send({ type: 'custom', event: U.event, data: state })
  }

  async function check() {
    const origin = await git(repoRoot, ['remote', 'get-url', 'origin'])
    // the original repository itself has nothing to take updates from
    if (origin.ok && repositoryOf(origin.out) === repositoryOf(upstream)) return set({ status: 'original' })
    if (!(await git(repoRoot, ['remote', 'get-url', U.remote])).ok) await git(repoRoot, ['remote', 'add', U.remote, upstream])
    if (!(await git(repoRoot, ['fetch', '--quiet', U.remote, CONFIG.repoBranch], U.fetchTimeoutMs)).ok) return set({ status: 'offline' })
    const behind = Number((await git(repoRoot, ['rev-list', '--count', `HEAD..${ref}`])).out) || 0
    set(behind > 0 ? { status: 'behind', behind } : { status: 'current' })
  }

  async function merge() {
    const behind = state.status === 'behind' ? state.behind : 0
    set({ status: 'updating', behind })
    const changed = (await git(repoRoot, ['diff', '--name-only', `HEAD...${ref}`])).out.split('\n')
    const merged = await git(repoRoot, ['merge', '--no-edit', ref])
    if (!merged.ok) {
      await git(repoRoot, ['merge', '--abort'])
      return set({ status: 'failed', behind, detail: merged.out.split('\n').slice(0, 3).join('\n') })
    }
    // new dependencies need an install, and changes to the server code need a restart
    const restart = changed.some((f) => U.restartFiles.some((r) => f === r))
    set({ status: restart ? 'restart' : 'updated', behind })
  }

  return {
    name: 'update-server',
    apply: 'serve',
    configureServer(server) {
      ws = server.ws
      void check()
      server.middlewares.use(U.endpoint, async (req, res) => {
        if (req.method === 'GET') return send(res, 200, state)
        if (req.method !== 'POST') return send(res, 405, { error: 'GET 과 POST 만 받습니다' })
        if (state.status !== 'behind') return send(res, 409, state)
        await merge()
        send(res, 200, state)
      })
    },
  }
}
