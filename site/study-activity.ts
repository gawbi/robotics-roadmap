import { execFileSync } from 'node:child_process'
import path from 'node:path'
import type { Plugin } from 'vite'
import { CONFIG } from './src/config.ts'

const ID = 'virtual:study-activity'
const RESOLVED = `\0${ID}`

/**
 * commits per day (author date) that touched the learner's record; empty outside a git checkout. The guides of the
 * notes and labs folders are not study, so commits that touch only them do not count.
 */
export function commitDays(repoRoot: string): Record<string, number> {
  const guides = [CONFIG.record.notesDir, CONFIG.record.labsDir].map((dir) => `:(exclude)${dir}/README.md`)
  let out: string
  try {
    out = execFileSync('git', ['log', '--no-merges', '--format=%ad', '--date=short', '--', ...CONFIG.record.activityDirs, ...guides], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return {}
  }
  const days: Record<string, number> = {}
  for (const date of out.split('\n').filter(Boolean)) days[date] = (days[date] ?? 0) + 1
  return days
}

/**
 * `virtual:study-activity`: the record's commit history, so the portfolio page can show which days were spent studying.
 * It is read once when the module loads; in dev a restart picks up new commits, and quiz attempts show at once anyway.
 * The Pages workflow checks out the full history (fetch-depth: 0) so the build sees every commit.
 */
export function studyActivity(repoRoot: string): Plugin {
  return {
    name: 'study-activity',
    // notes/ and labs/ sit outside the site root, so Vite would not see a new note or lab until it restarts
    configureServer(server) {
      server.watcher.add([CONFIG.record.notesDir, CONFIG.record.labsDir].map((dir) => path.join(repoRoot, dir)))
    },
    resolveId: (source) => (source === ID ? RESOLVED : undefined),
    load: (id) => (id === RESOLVED ? `export default ${JSON.stringify(commitDays(repoRoot))}` : undefined),
  }
}
