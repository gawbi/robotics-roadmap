import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'
import { CONFIG } from './src/config.ts'
import { formatResult, grade, parseBank, parseResult, type Attempt, type Pick } from './src/curriculum/quiz.ts'

const LESSON_ID = /^[a-z0-9-]+$/

interface Submission extends Pick {
  choice: number
}

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function readText(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8')
  } catch {
    return null
  }
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return JSON.parse(raw)
}

function send(res: ServerResponse, code: number, body: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

/** Dev-only endpoint that grades a quiz submission and appends it to progress/<id>.json. */
export function quizServer(repoRoot: string): Plugin {
  const progressDir = path.join(repoRoot, CONFIG.quiz.progressDir)

  async function submit(id: string, body: unknown): Promise<Attempt> {
    const bankSource = await readText(path.join(repoRoot, 'lessons', id, CONFIG.quiz.bankFile))
    if (bankSource === null) throw new Error('이 강의에는 퀴즈가 없습니다')
    const answers = (body as { answers?: Submission[] } | null)?.answers
    if (!Array.isArray(answers)) throw new Error('답안이 없습니다')
    const graded = grade(
      parseBank(bankSource),
      answers.map(({ topic, variant }) => ({ topic, variant })),
      answers.map((a) => a.choice),
    )
    const attempt: Attempt = { date: today(), answers: graded }
    const file = path.join(progressDir, `${id}.json`)
    const attempts = [...parseResult(await readText(file)).attempts, attempt]
    await writeFile(file, formatResult(attempts))
    return attempt
  }

  return {
    name: 'quiz-server',
    apply: 'serve',
    async configureServer(server) {
      // lessons/ and progress/ sit outside the site root, so Vite does not watch them by default; without this an edited
      // lesson stays stale and a progress file the first submission creates never enters the glob in load.ts, so the
      // attempt vanishes on the next reload. progress/ is made up front so there is a folder to watch.
      await mkdir(progressDir, { recursive: true })
      server.watcher.add([path.join(repoRoot, 'lessons'), progressDir])
      server.middlewares.use(CONFIG.quiz.endpoint, async (req, res) => {
        const id = (req.url ?? '').replace(/^\//, '').split('?')[0]
        if (!LESSON_ID.test(id)) return send(res, 404, { error: '없는 강의입니다' })
        if (req.method !== 'POST') return send(res, 405, { error: 'POST 만 받습니다' })
        try {
          send(res, 200, await submit(id, await readBody(req)))
        } catch (e) {
          send(res, 400, { error: e instanceof Error ? e.message : String(e) })
        }
      })
    },
  }
}
