import { describe, expect, it } from 'vitest'
import { buildCurriculum } from '../src/curriculum/parse'
import { nodeState, sanitize } from '../src/curriculum/progress'
import type { Branch, Project } from '../src/curriculum/types'

const branch: Branch = { id: 'core', title: 'Core', summary: 's', color: '#fff', layout: 'hub' }
const project = (id: string, requires: string[]): Project => ({
  id,
  title: id,
  branch: 'core',
  requires,
  hours: 1,
  summary: 's',
  papers: [],
  body: '',
  path: `projects/${id}/README.md`,
})
const c = buildCurriculum([branch], [project('a', []), project('b', ['a']), project('c', ['a', 'b'])])

describe('progress', () => {
  it('keeps only known statuses from an imported file', () => {
    const file = sanitize({ status: { a: 'done', b: 'in_progress', c: 'finished', d: 3 }, updatedAt: 'x' })
    expect(file.status).toEqual({ a: 'done', b: 'in_progress' })
  })

  it('treats garbage as an empty file', () => {
    expect(sanitize('nope').status).toEqual({})
    expect(sanitize(null).status).toEqual({})
  })

  it('derives availability from finished prerequisites', () => {
    const p = sanitize({ status: { a: 'done' } })
    expect(nodeState(c, p, 'a')).toBe('done')
    expect(nodeState(c, p, 'b')).toBe('available')
    expect(nodeState(c, p, 'c')).toBe('locked')
  })

  it('lets a learner mark a project done before its prerequisites', () => {
    const p = sanitize({ status: { c: 'done' } })
    expect(nodeState(c, p, 'c')).toBe('done')
  })
})
