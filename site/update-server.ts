import { execFile } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'
import { CONFIG } from './src/config.ts'

/** Where the fork stands against the original repository, as the page shows it. */
export type UpdateState =
  | { status: 'checking' | 'current' | 'original' | 'offline' | 'install' }
  | { status: 'behind' | 'updating' | 'updated'; behind: number }
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

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

/** Dependencies of the site that node_modules lacks or holds at another version than the lock file, e.g. after an update. */
export function outdatedDependencies(repoRoot: string): string[] {
  const pkg = readJson(join(repoRoot, U.packageFile)) as { dependencies?: object; devDependencies?: object }
  const lock = readJson(join(repoRoot, U.lockFile)) as { packages?: Record<string, { version?: string }> }
  const modules = join(repoRoot, dirname(U.packageFile), 'node_modules')
  return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((name) => {
    const installed = join(modules, name, 'package.json')
    return !existsSync(installed) || readJson(installed).version !== lock.packages?.[`node_modules/${name}`]?.version
  })
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
  let server: ViteDevServer | null = null

  const set = (next: UpdateState) => {
    state = next
    server?.ws.send({ type: 'custom', event: U.event, data: state })
    // the page may fail to load without the new packages, so the terminal says it too
    if (state.status === 'install') server?.config.logger.warn('\n  새 패키지가 필요합니다. 서버를 끄고 npm install 뒤 npm run dev 로 다시 실행해 주세요.\n')
  }

  async function check() {
    if (outdatedDependencies(repoRoot).length > 0) return set({ status: 'install' })
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
    const merged = await git(repoRoot, ['merge', '--no-edit', ref])
    if (!merged.ok) {
      await git(repoRoot, ['merge', '--abort'])
      return set({ status: 'failed', behind, detail: merged.out.split('\n').slice(0, 3).join('\n') })
    }
    // Vite restarts on its own for config and server code, which reloads the page; new packages need an install first
    set(outdatedDependencies(repoRoot).length > 0 ? { status: 'install' } : { status: 'updated', behind })
  }

  return {
    name: 'update-server',
    apply: 'serve',
    configureServer(devServer) {
      server = devServer
      void check()
      devServer.middlewares.use(U.endpoint, async (req, res) => {
        if (req.method === 'GET') return send(res, 200, state)
        if (req.method !== 'POST') return send(res, 405, { error: 'GET 과 POST 만 받습니다' })
        if (state.status !== 'behind') return send(res, 409, state)
        await merge()
        send(res, 200, state)
      })
    },
  }
}
