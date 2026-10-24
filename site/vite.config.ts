import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { quizServer } from './quiz-server'
import { updateServer } from './update-server'

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/

/** `README.md?frontmatter` imports only the YAML header, so the graph loads without every subject body. */
function frontmatterOnly(): Plugin {
  return {
    name: 'frontmatter-only',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('?frontmatter')) return
      const file = id.slice(0, -'?frontmatter'.length)
      this.addWatchFile(file)
      const match = FRONTMATTER.exec(await readFile(file, 'utf8'))
      return `export default ${JSON.stringify(match ? match[0] : '')}`
    },
  }
}

/**
 * Optional, git-ignored dev-server.local.json for opening the map from another machine, e.g.
 * { "host": true, "allowedHosts": ["my-laptop", ".ts.net"] }. Without it the server answers on localhost only.
 */
function localServerOptions(): { host?: boolean | string; allowedHosts?: string[] } {
  try {
    return JSON.parse(readFileSync(new URL('./dev-server.local.json', import.meta.url), 'utf8'))
  } catch {
    return {}
  }
}

// lessons/ lives one level above the site root.
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  base: './',
  plugins: [frontmatterOnly(), react(), quizServer(repoRoot), updateServer(repoRoot)],
  server: { ...localServerOptions(), fs: { allow: ['..'] } },
  // the lazily loaded panel chunk carries markdown + KaTeX (~240 kB gzip)
  build: { chunkSizeWarningLimit: 900 },
})
