import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { promisify } from 'node:util'
import type { Plugin } from 'vite'
import { CONFIG } from './src/config'
import { grade, parseBank, parseResult, type Attempt, type Pick, type QuizStatus } from './src/curriculum/quiz'

const run = promisify(execFile)
const PROJECT_ID = /^[a-z0-9-]+$/

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

/** Dev-only endpoints that let the map take the multiple-choice part of /evaluate and save it in the learner repo. */
export function quizServer(repoRoot: string): Plugin {
  const git = async (...args: string[]) => (await run('git', args, { cwd: repoRoot })).stdout.trim()

  async function status(id: string): Promise<QuizStatus> {
    const dir = `projects/${id}`
    const [head, changes, result] = await Promise.all([
      git('rev-parse', '--short', 'HEAD'),
      git('status', '--porcelain', '--', dir, `:!${dir}/${CONFIG.quiz.resultFile}`),
      readText(path.join(repoRoot, dir, CONFIG.quiz.resultFile)),
    ])
    return { head, dirty: changes !== '', attempts: parseResult(result).attempts }
  }

  async function submit(id: string, body: unknown): Promise<Attempt> {
    const bankSource = await readText(path.join(repoRoot, 'projects', id, CONFIG.quiz.bankFile))
    if (bankSource === null) throw new Error('이 과제에는 객관식 문항이 없습니다')
    const { commit, answers } = (body ?? {}) as { commit?: unknown; answers?: Submission[] }
    const current = await status(id)
    if (current.dirty) throw new Error('commit 하지 않은 변경이 있습니다. commit 한 뒤 다시 응시하세요')
    if (commit !== current.head) throw new Error('응시 중에 commit 이 바뀌었습니다. 처음부터 다시 응시하세요')
    if (!Array.isArray(answers)) throw new Error('답안이 없습니다')
    const graded = grade(
      parseBank(bankSource),
      answers.map(({ topic, variant }) => ({ topic, variant })),
      answers.map((a) => a.choice),
    )
    const attempt: Attempt = { date: today(), commit: current.head, answers: graded }
    const file = path.join(repoRoot, 'projects', id, CONFIG.quiz.resultFile)
    const attempts = [...current.attempts, attempt]
    await writeFile(file, `${JSON.stringify({ attempts }, null, 2)}\n`)
    return attempt
  }

  return {
    name: 'quiz-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(CONFIG.quiz.endpoint, async (req, res) => {
        const id = (req.url ?? '').replace(/^\//, '').split('?')[0]
        if (!PROJECT_ID.test(id)) return send(res, 404, { error: '없는 과제입니다' })
        try {
          if (req.method === 'GET') return send(res, 200, await status(id))
          if (req.method === 'POST') return send(res, 200, await submit(id, await readBody(req)))
          send(res, 405, { error: 'GET 또는 POST 만 받습니다' })
        } catch (e) {
          send(res, 400, { error: e instanceof Error ? e.message : String(e) })
        }
      })
    },
  }
}
