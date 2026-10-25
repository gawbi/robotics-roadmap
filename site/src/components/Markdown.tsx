import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import yaml from 'highlight.js/lib/languages/yaml'
import type { Element, ElementContent, Root, RootContent } from 'hast'
import { Check, X } from 'lucide-react'
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

/** text of the bold label a paragraph starts with, e.g. `**확인 문제.** ...` → "확인 문제." */
function boldLead(node: RootContent | ElementContent | undefined): string | undefined {
  if (node?.type !== 'element' || node.tagName !== 'p') return undefined
  const strong = node.children.find((c) => c.type !== 'text' || c.value.trim() !== '')
  if (strong?.type !== 'element' || strong.tagName !== 'strong') return undefined
  const text = strong.children[0]
  return text?.type === 'text' ? text.value : undefined
}

/** first bold label of a blockquote's first paragraph, e.g. `> **오해** ...` → "오해" */
function leadLabel(node: Element | undefined): string | undefined {
  return boldLead(node?.children.find((c): c is Element => c.type === 'element'))
}

function textOf(node: RootContent | ElementContent): string {
  if (node.type === 'text') return node.value
  return node.type === 'element' ? node.children.map(textOf).join('') : ''
}

function summaryOf(node: RootContent): Element | undefined {
  if (node.type !== 'element' || node.tagName !== 'details') return undefined
  return node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'summary')
}

/** drop a leading prefix from the first text node under `node` */
function stripPrefix(node: ElementContent, prefix: RegExp): boolean {
  if (node.type === 'text') {
    node.value = node.value.replace(prefix, '')
    return true
  }
  return node.type === 'element' && node.children.some((c) => stripPrefix(c, prefix))
}

const DEEP_PREFIX = /^심화:\s*/

/**
 * Mark the lesson's folding blocks so they can be drawn apart: a `**확인 문제.**` paragraph and everything up to its
 * `답 보기` answer become one `section.check`, and a `심화:` block gets `details.deep` with the prefix moved to a badge.
 * The markdown stays plain so the lesson reads the same on GitHub.
 */
function rehypeLessonBlocks() {
  return (tree: Root) => {
    const kids = tree.children
    const out: RootContent[] = []
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i]
      const summary = summaryOf(node)
      if (node.type === 'element' && summary && DEEP_PREFIX.test(textOf(summary))) {
        node.properties.className = ['deep']
        summary.properties.className = ['deep-summary']
        stripPrefix(summary, DEEP_PREFIX)
      }
      if (boldLead(node) === '확인 문제.') {
        const answer = kids.findIndex((n, j) => j > i && textOf(summaryOf(n) ?? { type: 'text', value: '' }) === '답 보기')
        const heading = kids.findIndex((n, j) => j > i && n.type === 'element' && /^h[1-6]$/.test(n.tagName))
        if (answer > 0 && (heading < 0 || answer < heading)) {
          out.push({ type: 'element', tagName: 'section', properties: { className: ['check'] }, children: kids.slice(i, answer + 1) as ElementContent[] })
          i = answer
          continue
        }
      }
      out.push(node)
    }
    tree.children = out
  }
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
          <span className="aside-label">흔한 오해</span>
          {misconceptionRows(children)}
        </aside>
      )
    },
    section({ className, children }) {
      if (className !== 'check') return <section className={className}>{children}</section>
      return (
        <section className="check">
          <span className="aside-label">확인 문제</span>
          {children}
        </section>
      )
    },
    summary({ className, children }) {
      if (className !== 'deep-summary') return <summary className={className}>{children}</summary>
      return (
        <summary className={className}>
          <span className="deep-badge">심화</span>
          <span>{children}</span>
        </summary>
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
        rehypePlugins={[rehypeRaw, rehypeLessonBlocks, [rehypeSlug, { prefix: SECTION_ID_PREFIX }], rehypeKatex, [rehypeHighlight, { detect: false, languages: LANGUAGES, aliases: { bash: ['sh', 'shell'] } }]]}
        components={components}
      >
        {body}
      </ReactMarkdown>
    </Wrapper>
  )
}
