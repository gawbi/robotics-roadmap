import { describe, expect, it } from 'vitest'
import { parseSharedProgress, parseSource, sharedLinks } from '../src/curriculum/shared'

describe('shared progress', () => {
  it('accepts only owner/repo sources', () => {
    expect(parseSource('woolimi/physical-ai-study')).toEqual({ owner: 'woolimi', repo: 'physical-ai-study' })
    expect(parseSource(' a-b/c.d_e ')).toEqual({ owner: 'a-b', repo: 'c.d_e' })
    expect(parseSource(null)).toBeNull()
    expect(parseSource('woolimi')).toBeNull()
    expect(parseSource('https://github.com/woolimi/x')).toBeNull()
    expect(parseSource('../evil/x')).toBeNull()
  })

  it('reads status, evaluation and evidence from progress.yaml', () => {
    const { progress, records } = parseSharedProgress(`
projects:
  autograd:
    status: done
    evaluated: 2026-10-21
    commit: "1a2b3c4"
    evidence:
      - title: 정리 글
        url: https://example.com/autograd
      - https://github.com/someone/repo
  warmup:
    status: in_progress
    evaluated: 2026-10-20
`)
    expect(progress.status).toEqual({ autograd: 'done', warmup: 'in_progress' })
    expect(records.autograd).toEqual({
      evaluated: '2026-10-21',
      commit: '1a2b3c4',
      evidence: [
        { title: '정리 글', url: 'https://example.com/autograd' },
        { title: 'https://github.com/someone/repo', url: 'https://github.com/someone/repo' },
      ],
    })
    expect(records.warmup.commit).toBeUndefined()
  })

  it('drops malformed fields instead of failing', () => {
    const { progress, records } = parseSharedProgress(`
projects:
  a:
    status: finished
    evaluated: yesterday
    commit: 1234567
    evidence:
      - url: javascript:alert(1)
      - title: no url
  b: 3
`)
    expect(progress.status).toEqual({})
    expect(records.a).toEqual({ evaluated: undefined, commit: undefined, evidence: [] })
    expect(records.b).toBeUndefined()
    expect(parseSharedProgress('').progress.status).toEqual({})
    expect(parseSharedProgress('- just\n- a list').progress.status).toEqual({})
  })

  it('links into the learner repo', () => {
    const l = sharedLinks({ owner: 'o', repo: 'r' })
    expect(l.file).toBe('https://raw.githubusercontent.com/o/r/HEAD/progress.yaml')
    expect(l.folder('ppo', 'abc1234')).toBe('https://github.com/o/r/tree/abc1234/projects/ppo')
    expect(l.evaluation('ppo')).toBe('https://github.com/o/r/blob/HEAD/projects/ppo/EVALUATION.md')
  })
})
