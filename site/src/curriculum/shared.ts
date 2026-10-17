import { useEffect, useState } from 'react'
import { parse } from 'yaml'
import { CONFIG } from '../config'
import { sanitize, type ProgressFile } from './progress'

/** A learner repo whose committed progress.yaml is shown on the map. */
export interface SharedSource {
  owner: string
  repo: string
}

export interface Evidence {
  title: string
  url: string
}

/** What a learner repo records about one project besides its status. */
export interface ProjectRecord {
  /** date of the latest evaluation, YYYY-MM-DD */
  evaluated?: string
  /** commit of the learner repo the evaluation looked at */
  commit?: string
  evidence: Evidence[]
}

export interface SharedProgress {
  progress: ProgressFile
  records: Record<string, ProjectRecord>
}

export type SharedState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: SharedProgress }
  | { kind: 'error'; message: string }

const SOURCE = /^([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([A-Za-z0-9._-]{1,100})$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const COMMIT = /^[0-9a-f]{7,40}$/

export function parseSource(value: string | null): SharedSource | null {
  const m = value ? SOURCE.exec(value.trim()) : null
  return m ? { owner: m[1], repo: m[2] } : null
}

function evidenceOf(raw: unknown): Evidence[] {
  if (!Array.isArray(raw)) return []
  const out: Evidence[] = []
  for (const item of raw) {
    const url = typeof item === 'string' ? item : (item as { url?: unknown })?.url
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) continue
    const title = (item as { title?: unknown })?.title
    out.push({ title: typeof title === 'string' && title.trim() ? title.trim() : url, url })
  }
  return out
}

/** Read a learner's progress.yaml, keeping only well-formed entries so a hand-edited file cannot break the page. */
export function parseSharedProgress(text: string): SharedProgress {
  const doc: unknown = parse(text)
  const projects = (doc as { projects?: unknown } | null)?.projects
  const status: Record<string, unknown> = {}
  const records: Record<string, ProjectRecord> = {}
  if (projects && typeof projects === 'object') {
    for (const [id, entry] of Object.entries(projects)) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      status[id] = e.status
      const evaluated = typeof e.evaluated === 'string' && DATE.test(e.evaluated) ? e.evaluated : undefined
      const commit = typeof e.commit === 'string' && COMMIT.test(e.commit) ? e.commit : undefined
      records[id] = { evaluated, commit, evidence: evidenceOf(e.evidence) }
    }
  }
  return { progress: sanitize({ status }), records }
}

export function sharedLinks({ owner, repo }: SharedSource) {
  const { rawBase, webBase, ref, file } = CONFIG.shared
  const web = `${webBase}/${owner}/${repo}`
  return {
    file: `${rawBase}/${owner}/${repo}/${ref}/${file}`,
    repo: web,
    folder: (id: string, commit: string) => `${web}/tree/${commit}/projects/${id}`,
    evaluation: (id: string) => `${web}/blob/${ref}/projects/${id}/EVALUATION.md`,
  }
}

export function useSharedProgress(source: SharedSource | null): SharedState | null {
  const [state, setState] = useState<SharedState | null>(source ? { kind: 'loading' } : null)

  useEffect(() => {
    if (!source) return
    let live = true
    const { file } = CONFIG.shared
    fetch(sharedLinks(source).file)
      .then(async (res) => {
        if (res.status === 404) throw new Error(`${source.owner}/${source.repo} 에서 ${file} 을 찾지 못했습니다`)
        if (!res.ok) throw new Error(`${file} 을 불러오지 못했습니다 (HTTP ${res.status})`)
        const text = await res.text()
        try {
          return parseSharedProgress(text)
        } catch {
          throw new Error(`${file} 의 YAML 형식이 올바르지 않습니다`)
        }
      })
      .then(
        (data) => live && setState({ kind: 'ready', data }),
        (err: unknown) =>
          live &&
          setState({
            kind: 'error',
            // fetch itself rejects with a browser-specific TypeError when offline or blocked
            message: err instanceof TypeError ? `${file} 을 불러오지 못했습니다 (네트워크 오류)` : String((err as Error).message),
          }),
      )
    return () => {
      live = false
    }
  }, [source])

  return state
}
