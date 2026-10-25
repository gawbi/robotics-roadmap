import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// the config and the files it imports name their .ts extension, as Node's own TypeScript loading requires
import { quizServer } from './quiz-server.ts'
import { updateServer } from './update-server.ts'
import { CONFIG } from './src/config.ts'

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

/** Description and Open Graph / Twitter card tags, so a shared link shows a title, summary and the map image. */
function shareMeta(): Plugin {
  const S = CONFIG.share
  const image = new URL(S.image, S.siteUrl).href
  const tags: [string, string, string][] = [
    ['name', 'description', S.description],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', S.title],
    ['property', 'og:locale', S.locale],
    ['property', 'og:url', S.siteUrl],
    ['property', 'og:title', S.title],
    ['property', 'og:description', S.description],
    ['property', 'og:image', image],
    ['property', 'og:image:secure_url', image],
    ['property', 'og:image:type', 'image/png'],
    ['property', 'og:image:width', String(S.imageWidth)],
    ['property', 'og:image:height', String(S.imageHeight)],
    ['property', 'og:image:alt', S.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', S.title],
    ['name', 'twitter:description', S.description],
    ['name', 'twitter:image', image],
  ]
  return {
    name: 'share-meta',
    transformIndexHtml: () =>
      tags.map(([key, name, content]): HtmlTagDescriptor => ({ tag: 'meta', attrs: { [key]: name, content }, injectTo: 'head' })),
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
  plugins: [frontmatterOnly(), react(), shareMeta(), quizServer(repoRoot), updateServer(repoRoot)],
  server: { ...localServerOptions(), fs: { allow: ['..'] } },
  // the lazily loaded panel chunk carries markdown + KaTeX (~240 kB gzip)
  build: { chunkSizeWarningLimit: 900 },
})
