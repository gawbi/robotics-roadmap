import { parse } from 'yaml'
import { CONFIG } from '../config'

// Shared by the panel (browser) and the dev server (node), so it imports nothing browser-only.

/** One way of asking about a topic. `answer` is the 0-based index into `choices`. */
export interface Variant {
  question: string
  choices: string[]
  answer: number
  explanation: string
}

/** One principle the oral part checks. A quiz asks one variant per topic. */
export interface Topic {
  topic: string
  title: string
  variants: Variant[]
}

export interface Pick {
  topic: string
  variant: number
}

export interface Answer extends Pick {
  choice: number
  correct: boolean
}

export interface Attempt {
  /** YYYY-MM-DD */
  date: string
  /** learner commit the quiz was taken on */
  commit: string
  answers: Answer[]
}

export interface QuizResult {
  attempts: Attempt[]
}

/** What the dev server reports before a quiz starts. */
export interface QuizStatus {
  /** short HEAD of the learner repo */
  head: string
  /** uncommitted changes under projects/<id>/ (the result file aside): the quiz must judge committed code */
  dirty: boolean
  attempts: Attempt[]
}

const TOPIC_ID = /^[a-z0-9-]+$/
const COMMIT = /^[0-9a-f]{7,40}$/

function text(value: unknown, where: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${where}: 문자열이 아닙니다`)
  return value.trim()
}

/** Parse projects/<id>/quiz.yaml. Throws on a malformed bank so a broken file shows up in tests, not mid-quiz. */
export function parseBank(source: string): Topic[] {
  const doc: unknown = parse(source)
  if (!Array.isArray(doc) || doc.length === 0) throw new Error('quiz.yaml: topic 목록이 비었습니다')
  const seen = new Set<string>()
  return doc.map((raw, i) => {
    const t = raw as Record<string, unknown>
    const topic = text(t?.topic, `topic ${i}`)
    if (!TOPIC_ID.test(topic) || seen.has(topic)) throw new Error(`topic ${topic}: id 가 잘못됐거나 중복입니다`)
    seen.add(topic)
    // a retake asks the next variant, so one variant would repeat the same question
    if (!Array.isArray(t.variants) || t.variants.length < 2) throw new Error(`${topic}: variant 가 2개 이상이어야 합니다`)
    const variants = t.variants.map((rawV, j): Variant => {
      const v = rawV as Record<string, unknown>
      const where = `${topic}.variants[${j}]`
      const choices = Array.isArray(v?.choices) ? v.choices.map((c, k) => text(c, `${where}.choices[${k}]`)) : []
      if (choices.length !== CONFIG.quiz.choiceCount) throw new Error(`${where}: 보기는 ${CONFIG.quiz.choiceCount}개여야 합니다`)
      const answer = v.answer
      if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= choices.length) {
        throw new Error(`${where}: answer 가 보기 범위를 벗어났습니다`)
      }
      return { question: text(v.question, `${where}.question`), choices, answer, explanation: text(v.explanation, `${where}.explanation`) }
    })
    return { topic, title: text(t.title, `${topic}.title`), variants }
  })
}

/** One variant per topic: the one after the variant used last time, so a retake asks each principle differently. */
export function pickVariants(bank: Topic[], attempts: Attempt[]): Pick[] {
  const last = attempts.at(-1)
  return bank.map(({ topic, variants }) => {
    const prev = last?.answers.find((a) => a.topic === topic)?.variant
    return { topic, variant: prev === undefined ? 0 : (prev + 1) % variants.length }
  })
}

export function grade(bank: Topic[], picks: Pick[], choices: number[]): Answer[] {
  if (picks.length !== bank.length || choices.length !== picks.length) throw new Error('문항 수가 맞지 않습니다')
  return picks.map((p, i) => {
    const topic = bank.find((t) => t.topic === p.topic)
    const variant = topic?.variants[p.variant]
    if (!variant) throw new Error(`${p.topic}: 없는 문항입니다`)
    const choice = choices[i]
    if (!Number.isInteger(choice) || choice < 0 || choice >= variant.choices.length) throw new Error(`${p.topic}: 보기를 고르지 않았습니다`)
    return { ...p, choice, correct: choice === variant.answer }
  })
}

/** Read projects/<id>/quiz-result.json, keeping only well-formed attempts. */
export function parseResult(source: string | null): QuizResult {
  if (!source) return { attempts: [] }
  let doc: unknown
  try {
    doc = JSON.parse(source)
  } catch {
    return { attempts: [] }
  }
  const raw = (doc as { attempts?: unknown } | null)?.attempts
  if (!Array.isArray(raw)) return { attempts: [] }
  const attempts = raw.filter(
    (a): a is Attempt =>
      typeof a?.date === 'string' &&
      typeof a?.commit === 'string' &&
      COMMIT.test(a.commit) &&
      Array.isArray(a?.answers) &&
      a.answers.every(
        (x: Answer) =>
          typeof x?.topic === 'string' && Number.isInteger(x.variant) && Number.isInteger(x.choice) && typeof x.correct === 'boolean',
      ),
  )
  return { attempts }
}

/** The oral part passes only when every answer is right: a wrong answer counts as 부족. */
export const passed = (answers: Answer[]) => answers.length > 0 && answers.every((a) => a.correct)
