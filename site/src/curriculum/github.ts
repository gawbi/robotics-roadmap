// A small GitHub client, so the published site can read a learner's record from their repository and, with their
// token, commit to it. Nothing here runs on a server: every call goes from the browser straight to GitHub.

const API = 'https://api.github.com'

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/** UTF-8 text to the base64 the contents API takes */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

/** the contents API's base64 (wrapped at 60 columns) back to UTF-8 text */
export function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/** `owner/name`, or null when the text is not one */
export function parseRepo(text: string): string | null {
  const m = /^\s*(?:https:\/\/github\.com\/)?([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?\s*$/.exec(text)
  return m ? `${m[1]}/${m[2]}` : null
}

export interface RepoFile {
  text: string
  sha: string
}

export interface Entry {
  name: string
  type: 'file' | 'dir'
}

/** Calls GitHub as the token's user, or anonymously (60 requests an hour per address) without one. */
export function github(token: string | null) {
  async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path.startsWith('https:') ? path : `${API}${path}`, {
      ...init,
      // a file read right after a commit must not come from the browser cache, or its sha is stale
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(init.body && { 'Content-Type': 'application/json' }),
      },
    })
    if (!res.ok) {
      let message = ''
      try {
        message = ((await res.json()) as { message?: string }).message ?? ''
      } catch {
        // not JSON: keep the status alone
      }
      throw new GitHubError(message || `GitHub 응답 ${res.status}`, res.status)
    }
    return (await res.json()) as T
  }

  const missing = (e: unknown) => e instanceof GitHubError && e.status === 404

  return {
    user: () => call<{ login: string }>('/user'),
    repo: (repo: string) => call<{ full_name: string; private: boolean; permissions?: { push?: boolean } }>(`/repos/${repo}`),

    /** files and folders directly under `dir`; empty when the folder does not exist */
    async list(repo: string, dir: string): Promise<Entry[]> {
      try {
        const items = await call<{ name: string; type: string }[]>(`/repos/${repo}/contents/${dir}`)
        return items.filter((i) => i.type === 'file' || i.type === 'dir').map((i) => ({ name: i.name, type: i.type as Entry['type'] }))
      } catch (e) {
        if (missing(e)) return []
        throw e
      }
    },

    async read(repo: string, path: string): Promise<RepoFile | null> {
      try {
        const f = await call<{ content: string; sha: string }>(`/repos/${repo}/contents/${path}`)
        return { text: decodeBase64(f.content), sha: f.sha }
      } catch (e) {
        if (missing(e)) return null
        throw e
      }
    },

    /** commit `text` to `path` on the default branch; `sha` is the file's current one, or none for a new file */
    async write(repo: string, path: string, text: string, message: string, sha?: string): Promise<string> {
      const r = await call<{ content: { sha: string } }>(`/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({ message, content: encodeBase64(text), ...(sha && { sha }) }),
      })
      return r.content.sha
    },

    /** author dates of the commits on the default branch since `since` that touched `path` (at most 100) */
    async commitDates(repo: string, path: string, since: Date): Promise<{ sha: string; date: string }[]> {
      const items = await call<{ sha: string; commit: { author: { date: string } } }[]>(
        `/repos/${repo}/commits?path=${encodeURIComponent(path)}&since=${since.toISOString()}&per_page=100`,
      )
      return items.map((c) => ({ sha: c.sha, date: c.commit.author.date }))
    },

    /** GitHub's GraphQL API, which needs a token; one query can read many files at once */
    async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
      const r = await call<{ data?: T; errors?: { message: string }[] }>('/graphql', { method: 'POST', body: JSON.stringify({ query, variables }) })
      if (r.errors?.length) throw new GitHubError(r.errors[0].message, 400)
      return r.data!
    },

    /** a public file's text through raw.githubusercontent.com, which does not count against the API limit */
    async raw(repo: string, path: string): Promise<string | null> {
      const res = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/${path}`, { cache: 'no-store' })
      return res.ok ? res.text() : null
    },
  }
}

export type GitHub = ReturnType<typeof github>
