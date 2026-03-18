import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import type { CodeExample } from '../types'

interface CodeBlockProps {
  example: CodeExample
  isDark: boolean
}

export function CodeBlock({ example, isDark }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(example.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isVulnerable = example.label.includes('VULNERABLE')
  const isSecure = example.label.includes('SECURE')

  const labelColor = isVulnerable
    ? '#f87171'
    : isSecure
      ? '#4ade80'
      : '#fb923c'

  const borderColor = isVulnerable
    ? 'rgba(239, 68, 68, 0.3)'
    : isSecure
      ? 'rgba(74, 222, 128, 0.3)'
      : 'rgba(251, 146, 60, 0.3)'

  return (
    <div
      style={{
        borderRadius: '0.5rem',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        background: 'var(--bg-code)',
      }}
    >
      {/* Label bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.375rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: labelColor,
          }}
        >
          {example.label}
        </span>
        <button
          onClick={handleCopy}
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.7rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: copied ? '#4ade80' : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Syntax-highlighted code */}
      <SyntaxHighlighter
        language="rust"
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8rem',
          lineHeight: '1.65',
        }}
        codeTagProps={{
          style: { fontFamily: "'JetBrains Mono', monospace" },
        }}
      >
        {example.code}
      </SyntaxHighlighter>
    </div>
  )
}
