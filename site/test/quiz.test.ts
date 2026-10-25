import { readdirSync, readFileSync, existsSync } from 'node:fs'
import GithubSlugger from 'github-slugger'
import { describe, expect, it } from 'vitest'
import { parseLesson } from '../src/curriculum/parse'
import { clearedAt, grade, parseBank, parseResult, passed, pickVariants, sectionOf, wrongTopics, type Attempt } from '../src/curriculum/quiz'

const lessonsDir = new URL('../../lessons/', import.meta.url)
const banks = readdirSync(lessonsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/quiz.yaml`, lessonsDir)))
  .map((d) => d.name)

const bank = parseBank(`
- topic: a
  title: A
  section: s
  variants:
    - { question: qa0, choices: [w, x, y, z], answer: 1, explanation: e }
    - { question: qa1, choices: [w, x, y, z], answer: 2, explanation: e }
- topic: b
  title: B
  section: s
  variants:
    - { question: qb0, choices: [w, x, y, z], answer: 0, explanation: e, section: t }
    - { question: qb1, choices: [w, x, y, z], answer: 3, explanation: e }
`)

const attempt = (variants: number[]): Attempt => ({
  date: '2026-10-18',
  answers: variants.map((variant, i) => ({ topic: bank[i].topic, variant, choice: 0, correct: false })),
})

describe('quiz', () => {
  it.each(banks)('lessons/%s/quiz.yaml is a valid bank', (id) => {
    const parsed = parseBank(readFileSync(new URL(`${id}/quiz.yaml`, lessonsDir), 'utf8'))
    expect(parsed.length).toBeGreaterThan(0)
  })

  // picking the longest (or shortest) choice must not beat knowing the answer
  it.each(banks)('lessons/%s/quiz.yaml does not give the answer away by its length', (id) => {
    const parsed = parseBank(readFileSync(new URL(`${id}/quiz.yaml`, lessonsDir), 'utf8'))
    const variants = parsed.flatMap((t) => t.variants.map((v, j) => ({ name: `${t.topic}[${j}]`, ...v })))
    const len = (s: string) => [...s.trim()].length
    let longest = 0
    let shortest = 0
    const standouts: string[] = []
    for (const v of variants) {
      const answer = len(v.choices[v.answer])
      const others = v.choices.filter((_, i) => i !== v.answer).map(len)
      const longestOther = Math.max(...others)
      if (others.every((n) => answer > n)) longest++
      if (others.every((n) => answer < n)) shortest++
      if (answer > longestOther * 1.2 && answer - longestOther > 5) standouts.push(`${v.name}: ${answer} vs ${longestOther}`)
    }
    expect(standouts, 'answers much longer than every other choice').toEqual([])
    expect(longest, 'variants whose answer is the longest choice').toBeLessThanOrEqual(Math.floor(0.35 * variants.length))
    expect(shortest, 'variants whose answer is the shortest choice').toBeLessThanOrEqual(Math.floor(0.35 * variants.length))
  })

  it.each(banks)('lessons/%s/quiz.yaml asks in the plain written style of an exam', (id) => {
    const parsed = parseBank(readFileSync(new URL(`${id}/quiz.yaml`, lessonsDir), 'utf8'))
    const polite = parsed.flatMap((t) => t.variants.map((v, j) => ({ name: `${t.topic}[${j}]`, text: v.question })))
      .filter((q) => /(요[?.]|(?<!아)니다[?.]|세요|십시오)/.test(q.text))
      .map((q) => q.name)
    expect(polite, 'questions ending in polite speech').toEqual([])
  })

  // a wrong answer links to this section; one folded into a closed 심화 block would scroll to nothing visible
  it.each(banks)('lessons/%s/quiz.yaml points every topic at a visible heading of its lecture', (id) => {
    const { body } = parseLesson(id, readFileSync(new URL(`${id}/README.md`, lessonsDir), 'utf8'))
    const slugger = new GithubSlugger()
    const visible = new Set<string>()
    let folded = 0
    for (const line of body.split('\n')) {
      folded += (line.match(/<details/g) ?? []).length - (line.match(/<\/details>/g) ?? []).length
      const heading = /^#{1,6} (.+)$/.exec(line)
      if (heading) {
        const slug = slugger.slug(heading[1])
        if (folded === 0) visible.add(slug)
      }
    }
    const parsed = parseBank(readFileSync(new URL(`${id}/quiz.yaml`, lessonsDir), 'utf8'))
    const missing = parsed.flatMap((t) =>
      t.variants.map((_, j) => sectionOf(t, j)).filter((s) => !visible.has(s)).map((s) => `${t.topic} → #${s}`),
    )
    expect(missing, 'sections that are not a visible heading').toEqual([])
  })

  it('rejects a bank with a wrong answer index, choice count, a single variant or no section', () => {
    const ok = '{ question: q, choices: [w, x, y, z], answer: 0, explanation: e }'
    expect(() => parseBank(`- { topic: a, title: A, section: s, variants: [${ok}, { question: q, choices: [w, x, y, z], answer: 4, explanation: e }] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, section: s, variants: [${ok}, { question: q, choices: [w, x], answer: 0, explanation: e }] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, section: s, variants: [${ok}] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, variants: [${ok}, ${ok}] }`)).toThrow()
    expect(() => parseBank(`- { topic: a, title: A, section: '#S', variants: [${ok}, ${ok}] }`)).toThrow()
    expect(parseBank(`- { topic: a, title: A, section: s, variants: [${ok}, ${ok}] }`)).toHaveLength(1)
  })

  it('links a missed variant to its own section, else to its topic\'s', () => {
    expect(sectionOf(bank[0], 0)).toBe('s')
    expect(sectionOf(bank[1], 0)).toBe('t')
    expect(sectionOf(bank[1], 1)).toBe('s')
  })

  it('starts with the first variant and moves to the next one on a retake', () => {
    expect(pickVariants(bank, [])).toEqual([
      { topic: 'a', variant: 0 },
      { topic: 'b', variant: 0 },
    ])
    expect(pickVariants(bank, [attempt([0, 0])]).map((p) => p.variant)).toEqual([1, 1])
    expect(pickVariants(bank, [attempt([0, 0]), attempt([1, 0])]).map((p) => p.variant)).toEqual([0, 1])
  })

  it('retries only the wrong topics, then asks everything again after clearing', () => {
    const first: Attempt = {
      date: 'd',
      answers: [
        { topic: 'a', variant: 0, choice: 1, correct: true },
        { topic: 'b', variant: 0, choice: 1, correct: false },
      ],
    }
    const retry: Attempt = { date: 'd', answers: [{ topic: 'b', variant: 1, choice: 3, correct: true }] }
    expect(wrongTopics([first])).toEqual(['b'])
    expect(pickVariants(bank, [first])).toEqual([{ topic: 'b', variant: 1 }])
    expect(clearedAt([first])).toBe(-1)
    expect(clearedAt([first, retry])).toBe(1)
    const gone: Attempt = { date: 'd', answers: [{ topic: 'removed', variant: 0, choice: 0, correct: false }] }
    expect(pickVariants(bank, [gone]).map((p) => p.topic)).toEqual(['a', 'b'])
    expect(pickVariants(bank, [first, retry])).toEqual([
      { topic: 'a', variant: 1 },
      { topic: 'b', variant: 0 },
    ])
  })

  it('grades each answer and passes only when all are right', () => {
    const picks = pickVariants(bank, [attempt([0, 0])])
    const answers = grade(bank, picks, [2, 3])
    expect(answers.map((a) => a.correct)).toEqual([true, true])
    expect(passed(answers)).toBe(true)
    expect(passed(grade(bank, picks, [1, 3]))).toBe(false)
    expect(() => grade(bank, picks, [2])).toThrow()
    expect(grade(bank, [{ topic: 'b', variant: 1 }], [3])).toEqual([{ topic: 'b', variant: 1, choice: 3, correct: true }])
    expect(() => grade(bank, [], [])).toThrow()
    expect(() => grade(bank, [picks[0], picks[0]], [2, 2])).toThrow()
    expect(() => grade(bank, picks, [2, 9])).toThrow()
  })

  it('keeps only well-formed attempts from a progress file', () => {
    expect(parseResult(null).attempts).toEqual([])
    expect(parseResult('not json').attempts).toEqual([])
    const good = attempt([0, 0])
    const result = parseResult(JSON.stringify({ attempts: [good, { date: 3, answers: [] }] }))
    expect(result.attempts).toEqual([good])
  })
})
