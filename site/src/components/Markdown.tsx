import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import yaml from 'highlight.js/lib/languages/yaml'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CONFIG } from '../config'
import { assetUrl } from '../curriculum/load'

const LANGUAGES = { bash, json, python, yaml }
const PROJECT_LINK = /^\.\.\/([a-z0-9-]+)\/(README\.md)?$/

interface Props {
  projectId: string
  source: string
  /** render inside phrasing content (a quiz choice label): paragraphs become spans */
  inline?: boolean
}

/** Render a subject body. The leading `# Title` is dropped because the panel header shows it. */
export function Markdown({ projectId, source, inline = false }: Props) {
  const body = source.replace(/^\s*# .*\n/, '')
  const blob = `${CONFIG.repoUrl}/blob/${CONFIG.repoBranch}/projects/${projectId}/`

  const components: Components = {
    a({ href = '', children, ...rest }) {
      const internal = PROJECT_LINK.exec(href)
      if (internal) return <a href={`#/p/${internal[1]}`}>{children}</a>
      if (/^[a-z]+:/i.test(href) || href.startsWith('#')) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...rest}>
            {children}
          </a>
        )
      }
      return (
        <a href={new URL(href, blob).toString()} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    },
    img({ src = '', alt = '' }) {
      const resolved = typeof src === 'string' && !/^[a-z]+:/i.test(src) ? assetUrl(projectId, src) : src
      return <img src={resolved as string} alt={alt} loading="lazy" />
    },
    ...(inline && { p: ({ children }) => <span>{children}</span> }),
    table({ children }) {
      return (
        <div className="md-table">
          <table>{children}</table>
        </div>
      )
    },
  }

  const Wrapper = inline ? 'span' : 'div'
  return (
    <Wrapper className={inline ? 'markdown-inline' : 'markdown'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeHighlight, { detect: false, languages: LANGUAGES, aliases: { bash: ['sh', 'shell'] } }]]}
        components={components}
      >
        {body}
      </ReactMarkdown>
    </Wrapper>
  )
}
