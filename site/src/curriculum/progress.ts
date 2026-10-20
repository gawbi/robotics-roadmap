import { useSyncExternalStore } from 'react'
import { initialAttempts } from './load'
import { clearedAt, type Attempt } from './quiz'
import type { Curriculum, NodeState, Status } from './types'

/** Quiz attempts per lesson id, as recorded in progress/<id>.json. */
export type ProgressFile = Readonly<Record<string, readonly Attempt[]>>

let current: ProgressFile = initialAttempts
const listeners = new Set<() => void>()

export const progress = {
  get: () => current,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** the dev server has written `attempt` to the lesson's result file; show it without waiting for a reload */
  add(id: string, attempt: Attempt) {
    current = { ...current, [id]: [...(current[id] ?? []), attempt] }
    listeners.forEach((l) => l())
  },
}

export function useProgress(): ProgressFile {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export function attemptsOf(p: ProgressFile, id: string): readonly Attempt[] {
  return p[id] ?? []
}

/** done once no wrong answer is left (retries ask only the wrong topics); in progress before that */
export function statusOf(p: ProgressFile, id: string): Status {
  const attempts = attemptsOf(p, id)
  if (clearedAt(attempts) >= 0) return 'done'
  return attempts.length > 0 ? 'in_progress' : 'todo'
}

/** date of the attempt that left no wrong answer */
export function passedOn(p: ProgressFile, id: string): string | undefined {
  const attempts = attemptsOf(p, id)
  return attempts[clearedAt(attempts)]?.date
}

export function nodeState(c: Curriculum, p: ProgressFile, id: string): NodeState {
  const s = statusOf(p, id)
  if (s !== 'todo') return s
  return c.byId.get(id)!.requires.every((r) => statusOf(p, r) === 'done') ? 'available' : 'locked'
}
