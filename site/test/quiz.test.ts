import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { grade, parseBank, parseResult, passed, pickVariants, type Attempt } from '../src/curriculum/quiz'

const projectsDir = new URL('../../projects/', import.meta.url)
const banks = readdirSync(projectsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/quiz.yaml`, projectsDir)))
  .map((d) => d.name)

const bank = parseBank(`
- topic: a
  title: A
  variants:
    - { question: qa0, choices: [w, x, y, z], answer: 1, explanation: e }
    - { question: qa1, choices: [w, x, y, z], answer: 2, explanation: e }
- topic: b
  title: B
  variants:
    - { question: qb0, choices: [w, x, y, z], answer: 0, explanation: e }
    - { question: qb1, choices: [w, x, y, z], answer: 3, explanation: e }
`)

const attempt = (variants: number[]): Attempt => ({
  date: '2026-10-18',
  commit: 'abc1234',
  answers: variants.map((variant, i) => ({ topic: bank[i].topic, variant, choice: 0, correct: false })),
})

describe('quiz', () => {
  it.each(banks)('projects/%s/quiz.yaml is a valid bank', (id) => {
    const parsed = parseBank(readFileSync(new URL(`${id}/quiz.yaml`, projectsDir), 'utf8'))
    expect(parsed.length).toBeGreaterThan(0)
  })

  it('rejects a bank with a wrong answer index, choice count or a single variant', () => {
    const ok = '{ question: q, choices: [w, x, y, z], answer: 0, explanation: e }'
    expect(() => parseBank(`- { topic: a, title: A, variants: [${ok}, { question: q, choices: [w, x, y, z], answer: 4, explanation: e }] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, variants: [${ok}, { question: q, choices: [w, x], answer: 0, explanation: e }] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, variants: [${ok}] }`)).toThrow()
    expect(parseBank(`- { topic: a, title: A, variants: [${ok}, ${ok}] }`)).toHaveLength(1)
  })

  it('starts with the first variant and moves to the next one on a retake', () => {
    expect(pickVariants(bank, [])).toEqual([
      { topic: 'a', variant: 0 },
      { topic: 'b', variant: 0 },
    ])
    expect(pickVariants(bank, [attempt([0, 0])]).map((p) => p.variant)).toEqual([1, 1])
    expect(pickVariants(bank, [attempt([0, 0]), attempt([1, 0])]).map((p) => p.variant)).toEqual([0, 1])
  })

  it('grades each answer and passes only when all are right', () => {
    const picks = pickVariants(bank, [attempt([0, 0])])
    const answers = grade(bank, picks, [2, 3])
    expect(answers.map((a) => a.correct)).toEqual([true, true])
    expect(passed(answers)).toBe(true)
    expect(passed(grade(bank, picks, [1, 3]))).toBe(false)
    expect(() => grade(bank, picks, [2])).toThrow()
    expect(() => grade(bank, picks, [2, 9])).toThrow()
  })

  it('keeps only well-formed attempts from quiz-result.json', () => {
    expect(parseResult(null).attempts).toEqual([])
    expect(parseResult('not json').attempts).toEqual([])
    const good = attempt([0, 0])
    const result = parseResult(JSON.stringify({ attempts: [good, { date: 'x', commit: 'nothex', answers: [] }] }))
    expect(result.attempts).toEqual([good])
  })
})
