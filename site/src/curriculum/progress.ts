import { useSyncExternalStore } from 'react'
import { CONFIG } from '../config'
import type { Curriculum, NodeState, Status } from './types'

export interface ProgressFile {
  version: 1
  status: Record<string, Exclude<Status, 'todo'>>
  updatedAt: string
}

const empty = (): ProgressFile => ({ version: 1, status: {}, updatedAt: new Date(0).toISOString() })

function read(): ProgressFile {
  try {
    const raw = localStorage.getItem(CONFIG.storage.progressKey)
    if (!raw) return empty()
    return sanitize(JSON.parse(raw))
  } catch {
    return empty()
  }
}

/** Accept only well-formed entries so a hand-edited or foreign file cannot break the page. */
export function sanitize(data: unknown): ProgressFile {
  const out = empty()
  if (!data || typeof data !== 'object') return out
  const status = (data as { status?: unknown }).status
  if (status && typeof status === 'object') {
    for (const [id, s] of Object.entries(status)) {
      if (s === 'done' || s === 'in_progress') out.status[id] = s
    }
  }
  const updatedAt = (data as { updatedAt?: unknown }).updatedAt
  if (typeof updatedAt === 'string') out.updatedAt = updatedAt
  return out
}

let current = read()
const listeners = new Set<() => void>()

function commit(next: ProgressFile) {
  current = next
  try {
    localStorage.setItem(CONFIG.storage.progressKey, JSON.stringify(next))
  } catch {
    // storage unavailable (private mode): progress lives for this tab only
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG.storage.progressKey) {
      current = read()
      listeners.forEach((l) => l())
    }
  })
}

export const progress = {
  get: () => current,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  set(id: string, status: Status) {
    const next = { ...current.status }
    if (status === 'todo') delete next[id]
    else next[id] = status
    commit({ version: 1, status: next, updatedAt: new Date().toISOString() })
  },
  replace(file: ProgressFile) {
    commit({ ...file, updatedAt: new Date().toISOString() })
  },
  reset() {
    commit({ ...empty(), updatedAt: new Date().toISOString() })
  },
}

export function useProgress(): ProgressFile {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export function statusOf(p: ProgressFile, id: string): Status {
  return p.status[id] ?? 'todo'
}

export function nodeState(c: Curriculum, p: ProgressFile, id: string): NodeState {
  const s = statusOf(p, id)
  if (s !== 'todo') return s
  return c.byId.get(id)!.requires.every((r) => statusOf(p, r) === 'done') ? 'available' : 'locked'
}
