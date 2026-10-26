import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64, parseRepo } from '../src/curriculum/github'

describe('github helpers', () => {
  it('round-trips UTF-8 text through the base64 the contents API uses', () => {
    for (const text of ['', 'plain', '# 칼만 필터 노트\n예측과 보정 — σ² ≈ 0.5\n', '가'.repeat(100_000)]) {
      expect(decodeBase64(encodeBase64(text))).toBe(text)
    }
  })

  it('reads the line-wrapped base64 GitHub returns', () => {
    const wrapped = encodeBase64('노트 '.repeat(40)).replace(/(.{60})/g, '$1\n')
    expect(decodeBase64(wrapped)).toBe('노트 '.repeat(40))
  })

  it('takes a repository as owner/name or as its GitHub URL', () => {
    expect(parseRepo('gawbi/robotics-study')).toBe('gawbi/robotics-study')
    expect(parseRepo(' https://github.com/gawbi/robotics-roadmap.git ')).toBe('gawbi/robotics-roadmap')
    expect(parseRepo('https://github.com/a-b/c.d_e/')).toBe('a-b/c.d_e')
    expect(parseRepo('robotics-study')).toBeNull()
    expect(parseRepo('a/b/c')).toBeNull()
  })
})
