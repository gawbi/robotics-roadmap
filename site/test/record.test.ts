import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '../src/config'
import { activityLevel, heatmapWeeks, longestStreak, parseLab, studyDays } from '../src/curriculum/record'

const REPO = join(__dirname, '..', '..')
const lessonIds = new Set(readdirSync(join(REPO, 'lessons'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name))

describe('record files', () => {
  it('every note is named after a lesson', () => {
    const dir = join(REPO, CONFIG.record.notesDir)
    if (!existsSync(dir)) return
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
      expect(lessonIds.has(f.replace(/\.md$/, '')), `${CONFIG.record.notesDir}/${f}`).toBe(true)
    }
  })

  it('every lab has a valid header that names existing lessons', () => {
    const dir = join(REPO, CONFIG.record.labsDir)
    if (!existsSync(dir)) return
    for (const d of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const file = join(dir, d.name, 'README.md')
      expect(existsSync(file), `${CONFIG.record.labsDir}/${d.name}/README.md`).toBe(true)
      const lab = parseLab(d.name, readFileSync(file, 'utf8'))
      for (const id of lab.lessons) expect(lessonIds.has(id), `${CONFIG.record.labsDir}/${d.name}: lessons 의 ${id}`).toBe(true)
    }
  })
})

describe('parseLab', () => {
  const header = (body: string) => `---\n${body}\n---\n\n# 본문\n`

  it('reads the header and keeps the body', () => {
    const lab = parseLab('kalman-1d', header('title: 1D Kalman\nsummary: 손으로 짠 filter\nlessons: [kalman-filter]\nstack: [Python, NumPy]'))
    expect(lab).toMatchObject({ id: 'kalman-1d', title: '1D Kalman', lessons: ['kalman-filter'], stack: ['Python', 'NumPy'] })
    expect(lab.body.trim()).toBe('# 본문')
  })

  it('rejects a lab without lessons or a title', () => {
    expect(() => parseLab('x', header('title: t\nsummary: s'))).toThrow(/lessons/)
    expect(() => parseLab('x', header('summary: s\nlessons: [pid-control]'))).toThrow(/title/)
    expect(() => parseLab('x', '# 머리말 없음')).toThrow(/frontmatter/)
  })
})

describe('study days', () => {
  it('adds commits and quiz attempts of the same day', () => {
    const days = studyDays({ '2026-10-20': 2 }, { 'pid-control': [{ date: '2026-10-20', answers: [] }, { date: '2026-10-21', answers: [] }] })
    expect(days.get('2026-10-20')).toEqual({ commits: 2, quizzes: 1 })
    expect(days.get('2026-10-21')).toEqual({ commits: 0, quizzes: 1 })
  })

  it('grades a day by how much it holds', () => {
    expect([undefined, { commits: 1, quizzes: 0 }, { commits: 2, quizzes: 1 }, { commits: 5, quizzes: 1 }, { commits: 7, quizzes: 0 }].map(activityLevel)).toEqual([
      0, 1, 2, 3, 4,
    ])
  })

  it('lays out whole weeks from Sunday, the last one holding today', () => {
    const today = new Date(2026, 9, 25) // a Sunday
    const weeks = heatmapWeeks(today, 3)
    expect(weeks).toHaveLength(3)
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks[0][0].date).toBe('2026-10-11')
    expect(weeks[2][0]).toEqual({ date: '2026-10-25', future: false })
    expect(weeks[2][1]).toEqual({ date: '2026-10-26', future: true })
  })

  it('finds the longest run of days in a row', () => {
    expect(longestStreak([])).toBe(0)
    expect(longestStreak(['2026-10-01', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-07'])).toBe(3)
    expect(longestStreak(['2026-02-28', '2026-03-01', '2026-03-01'])).toBe(2)
  })
})
