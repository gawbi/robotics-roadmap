import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import yaml from 'highlight.js/lib/languages/yaml'
import type { Element } from 'hast'
import { Check, Info, X } from 'lucide-react'
import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CONFIG } from '../config'
import { assetUrl } from '../curriculum/load'

const LANGUAGES = { bash, json, python, yaml }
const LESSON_LINK = /^\.\.\/([a-z0-9-]+)\/(README\.md)?$/
// headings get GitHub's slug as their id, prefixed so they cannot clash with the app's own ids; a `#slug` link in a
// lesson therefore works both here and on GitHub
const SECTION_ID_PREFIX = 'sec-'

/** first bold label of a blockquote's first paragraph, e.g. `> **오해** ...` → "오해" */
function leadLabel(node: Element | undefined): string | undefined {
  const p = node?.children.find((c): c is Element => c.type === 'element')
  const strong = p?.tagName === 'p' ? p.children.find((c) => c.type !== 'text' || c.value.trim() !== '') : undefined
  if (strong?.type !== 'element' || strong.tagName !== 'strong') return undefined
  const text = strong.children[0]
  return text?.type === 'text' ? text.value : undefined
}

/** the belief paragraph gets an X, the fact paragraph a check; the bold label stays for screen readers only */
function misconceptionRows(children: ReactNode) {
  const paragraphs = Children.toArray(children).filter(isValidElement)
  return paragraphs.map((p, i) => {
    const Icon = i === 0 ? X : Check
    return (
      <div key={i} className={`misconception-row ${i === 0 ? 'is-belief' : 'is-fact'}`}>
        <Icon size={16} aria-hidden />
        {p}
      </div>
    )
  })
}

interface Props {
  lessonId: string
  source: string
  /** render inside phrasing content (a quiz choice label): paragraphs become spans */
  inline?: boolean
}

/** Render a subject body. The leading `# Title` is dropped because the panel header shows it. */
export function Markdown({ lessonId, source, inline = false }: Props) {
  const body = source.replace(/^\s*# .*\n/, '')
  const blob = `${CONFIG.repoUrl}/blob/${CONFIG.repoBranch}/lessons/${lessonId}/`

  const components: Components = {
    a({ href = '', children, ...rest }) {
      const internal = LESSON_LINK.exec(href)
      if (internal) return <a href={`#/p/${internal[1]}`}>{children}</a>
      // the page hash holds the route, so a section link scrolls the panel instead of changing it
      if (href.startsWith('#')) {
        const id = SECTION_ID_PREFIX + decodeURIComponent(href.slice(1))
        return (
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            {children}
          </a>
        )
      }
      if (/^[a-z]+:/i.test(href)) {
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
      const resolved = typeof src === 'string' && !/^[a-z]+:/i.test(src) ? assetUrl(lessonId, src) : src
      return <img src={resolved as string} alt={alt} loading="lazy" />
    },
    ...(inline && { p: ({ children }) => <span>{children}</span> }),
    // `> **오해** ...` then `> **사실** ...` is a misconception box: one line for the belief, one for the fact
    blockquote({ node, children }) {
      if (leadLabel(node) !== '오해') return <blockquote>{children}</blockquote>
      return (
        <aside className="misconception">
          <div className="misconception-title">
            <Info size={16} aria-hidden />
            흔한 오해
          </div>
          {misconceptionRows(children)}
        </aside>
      )
    },
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
        // a single ~ is a range ("10~50 Hz"), so only ~~text~~ strikes through
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeSlug, { prefix: SECTION_ID_PREFIX }], rehypeKatex, [rehypeHighlight, { detect: false, languages: LANGUAGES, aliases: { bash: ['sh', 'shell'] } }]]}
        components={components}
      >
        {body}
      </ReactMarkdown>
    </Wrapper>
  )
}
