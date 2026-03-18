import type { Pattern } from '../types'
import { CodeBlock } from './CodeBlock'

interface PatternCardProps {
  pattern: Pattern
  isDark: boolean
}

export function PatternCard({ pattern, isDark }: PatternCardProps) {
  return (
    <div
      id={pattern.id}
      className="card"
      style={{
        borderRadius: '0.75rem',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        scrollMarginTop: '5rem',
        background: 'var(--bg-card)',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{pattern.icon}</span>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {pattern.title}
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {pattern.description}
      </p>
      {pattern.examples && pattern.examples.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pattern.examples.map((example, i) => (
            <CodeBlock key={i} example={example} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  )
}
