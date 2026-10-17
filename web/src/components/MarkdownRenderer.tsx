import React, { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function renderInlineText(text: string): React.ReactNode[] {
  // Regex to match URLs, @mentions, #hashtags, inline code `...`, and **bold**
  const regex = /(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+|@[a-zA-Z0-9_]+|#[^\s#]+)/g
  const parts = text.split(regex)

  return parts.map((part, idx) => {
    if (!part) return null

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 break-all inline-flex items-center gap-0.5 mx-0.5"
        >
          <span>{part.length > 40 ? `${part.slice(0, 37)}...` : part}</span>
          <ExternalLink className="h-2.5 w-2.5 inline" />
        </a>
      )
    }

    if (part.startsWith('@') && part.length > 1) {
      const handle = part.slice(1)
      return (
        <a
          key={idx}
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:text-blue-300 font-medium inline-block hover:underline"
        >
          {part}
        </a>
      )
    }

    if (part.startsWith('#') && part.length > 1) {
      const tag = part.slice(1)
      return (
        <a
          key={idx}
          href={`https://x.com/hashtag/${tag}`}
          target="_blank"
          rel="noreferrer"
          className="text-purple-400 hover:text-purple-300 font-medium inline-block hover:underline"
        >
          {part}
        </a>
      )
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>
  })
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
        <span>{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null

  // Split into lines for structured block parsing
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: React.ReactNode[] = []

  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeLang = ''

  let listBuffer: string[] = []
  let isOrderedList = false

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return
    if (isOrderedList) {
      blocks.push(
        <ol key={key} className="list-decimal list-inside space-y-1.5 my-2.5 text-slate-200 pl-2">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      )
    } else {
      blocks.push(
        <ul key={key} className="list-disc list-inside space-y-1.5 my-2.5 text-slate-200 pl-2">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ul>
      )
    }
    listBuffer = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block start/end
    if (line.trim().startsWith('```')) {
      flushList(`list-before-code-${i}`)
      if (inCodeBlock) {
        blocks.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            lang={codeLang}
          />
        )
        codeBuffer = []
        codeLang = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLang = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      flushList(`list-before-hr-${i}`)
      blocks.push(<hr key={`hr-${i}`} className="my-5 border-slate-800" />)
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList(`list-before-h1-${i}`)
      blocks.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 tracking-tight">
          {renderInlineText(line.slice(2).trim())}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList(`list-before-h2-${i}`)
      blocks.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-slate-100 mt-5 mb-2.5 border-b border-slate-800/80 pb-1.5">
          {renderInlineText(line.slice(3).trim())}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      flushList(`list-before-h3-${i}`)
      blocks.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-semibold text-slate-200 mt-4 mb-2">
          {renderInlineText(line.slice(4).trim())}
        </h3>
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`list-before-quote-${i}`)
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-indigo-500/80 pl-3.5 py-1 my-3 bg-indigo-500/5 rounded-r-lg text-slate-300 italic text-xs leading-relaxed"
        >
          {renderInlineText(line.slice(2).trim())}
        </blockquote>
      )
      continue
    }

    // Unordered list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (isOrderedList) flushList(`flush-ordered-${i}`)
      isOrderedList = false
      listBuffer.push(line.trim().slice(2))
      continue
    }

    // Ordered list
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/)
    if (orderedMatch) {
      if (!isOrderedList) flushList(`flush-unordered-${i}`)
      isOrderedList = true
      listBuffer.push(orderedMatch[2])
      continue
    }

    // Regular line / Paragraph
    flushList(`list-before-p-${i}`)
    if (line.trim().length === 0) {
      // Empty line -> spacing
      blocks.push(<div key={`empty-${i}`} className="h-2" />)
    } else {
      blocks.push(
        <p key={`p-${i}`} className="my-1.5 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {renderInlineText(line)}
        </p>
      )
    }
  }

  flushList('list-end')

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <CodeBlock
        key="code-unclosed"
        code={codeBuffer.join('\n')}
        lang={codeLang}
      />
    )
  }

  return <div className={`space-y-0.5 ${className}`}>{blocks}</div>
}
