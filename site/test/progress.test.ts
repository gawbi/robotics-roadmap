import { describe, expect, it } from 'vitest'
import { buildCurriculum } from '../src/curriculum/parse'
import { nodeState, passedOn, statusOf } from '../src/curriculum/progress'
import type { Attempt } from '../src/curriculum/quiz'
import type { Branch, Lesson } from '../src/curriculum/types'

const branch: Branch = { id: 'core', title: 'Core', summary: 's', color: '#fff', core: true }
const lesson = (id: string, requires: string[]): Lesson => ({
  id,
  title: id,
  branch: 'core',
  requires,
  hours: 1,
  summary: 's',
  papers: [],
  body: '',
  path: `lessons/${id}/README.md`,
})
const c = buildCurriculum([branch], [lesson('a', []), lesson('b', ['a']), lesson('c', ['a', 'b'])])

const pass: Attempt = { date: '2026-10-19', answers: [{ topic: 't', variant: 0, choice: 1, correct: true }] }
const fail: Attempt = { date: '2026-10-18', answers: [{ topic: 't', variant: 0, choice: 0, correct: false }] }

describe('progress', () => {
  it('derives status from quiz attempts', () => {
    expect(statusOf({}, 'a')).toBe('todo')
    expect(statusOf({ a: [fail] }, 'a')).toBe('in_progress')
    expect(statusOf({ a: [fail, pass] }, 'a')).toBe('done')
    expect(passedOn({ a: [fail, pass] }, 'a')).toBe('2026-10-19')
  })

  it('is done once a retry of the wrong topics leaves none wrong', () => {
    const first: Attempt = {
      date: '2026-10-18',
      answers: [
        { topic: 't', variant: 0, choice: 1, correct: true },
        { topic: 'u', variant: 0, choice: 0, correct: false },
      ],
    }
    const retry: Attempt = { date: '2026-10-19', answers: [{ topic: 'u', variant: 1, choice: 2, correct: true }] }
    expect(statusOf({ a: [first] }, 'a')).toBe('in_progress')
    expect(statusOf({ a: [first, retry] }, 'a')).toBe('done')
    expect(passedOn({ a: [first, retry] }, 'a')).toBe('2026-10-19')
  })

  it('stays done after a later failed retake', () => {
    expect(statusOf({ a: [pass, fail] }, 'a')).toBe('done')
  })

  it('derives availability from passed prerequisites', () => {
    const p = { a: [pass] }
    expect(nodeState(c, p, 'a')).toBe('done')
    expect(nodeState(c, p, 'b')).toBe('available')
    expect(nodeState(c, p, 'c')).toBe('locked')
  })
})
