import { parse as parseYaml } from 'yaml'
import type { ProgressFile } from './progress'

// What the learner writes on top of the lessons: notes, labs, and the days they studied. Shared by the page and the
// tests, so it imports nothing browser-only.

/** labs/<id>/README.md: code the learner wrote while studying one or more lessons */
export interface Lab {
  /** folder name under labs/ */
  id: string
  title: string
  summary: string
  /** ids of the lessons it implements; the lab shows on each of their panels */
  lessons: string[]
  /** languages, libraries and tools, e.g. Python, PyTorch, MuJoCo */
  stack: string[]
  /** markdown body without frontmatter */
  body: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/** Parse labs/<id>/README.md. Throws on a malformed header so a broken lab shows up in tests, not on the page. */
export function parseLab(id: string, source: string): Lab {
  const where = `labs/${id}/README.md`
  const m = FRONTMATTER.exec(source)
  if (!m) throw new Error(`${where}: frontmatter(--- 로 감싼 머리말)가 없습니다`)
  const data = (parseYaml(m[1]) ?? {}) as Record<string, unknown>
  const text = (field: string): string => {
    const v = data[field]
    if (typeof v !== 'string' || !v.trim()) throw new Error(`${where}: "${field}" 를 적어 주세요`)
    return v.trim()
  }
  const list = (field: string): string[] => {
    const v = data[field] ?? []
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`${where}: "${field}" 는 [a, b] 꼴의 목록이어야 합니다`)
    return v as string[]
  }
  const lessons = list('lessons')
  if (lessons.length === 0) throw new Error(`${where}: "lessons" 에 구현한 강의 id 를 하나 이상 적어 주세요`)
  return { id, title: text('title'), summary: text('summary'), lessons, stack: list('stack'), body: source.slice(m[0].length) }
}

/** What happened on one day: commits to the record (notes, labs, quiz results) and quiz attempts. */
export interface DayActivity {
  commits: number
  quizzes: number
}

/** YYYY-MM-DD in local time, the same form quiz attempts and `git log --date=short` use */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function studyDays(commits: Readonly<Record<string, number>>, progress: ProgressFile): Map<string, DayActivity> {
  const days = new Map<string, DayActivity>()
  const at = (date: string) => days.get(date) ?? (days.set(date, { commits: 0, quizzes: 0 }), days.get(date)!)
  for (const [date, n] of Object.entries(commits)) at(date).commits += n
  for (const attempts of Object.values(progress)) for (const a of attempts) at(a.date).quizzes += 1
  return days
}

/** 0 for a day without study, then 1 ~ 4 as the day holds more */
export function activityLevel(a: DayActivity | undefined): number {
  const n = a ? a.commits + a.quizzes : 0
  if (n === 0) return 0
  if (n === 1) return 1
  if (n <= 3) return 2
  if (n <= 6) return 3
  return 4
}

export interface HeatmapDay {
  date: string
  /** after `today`: drawn empty */
  future: boolean
}

/** `weeks` columns of Sunday-to-Saturday days, the last column holding `today`. */
export function heatmapWeeks(today: Date, weeks: number): HeatmapDay[][] {
  const end = dayKey(today)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - (weeks - 1) * 7)
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = dayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d))
      return { date, future: date > end }
    }),
  )
}

/** the most days in a row with any study */
export function longestStreak(dates: Iterable<string>): number {
  const sorted = [...new Set(dates)].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number)
    const day = new Date(y, m - 1, d)
    run = prev && Math.round((day.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}
