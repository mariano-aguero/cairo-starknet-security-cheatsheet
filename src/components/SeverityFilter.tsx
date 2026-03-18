import type { Severity } from '../types'

const SEVERITIES: { value: Severity; label: string; color: string; bg: string; border: string }[] = [
  { value: 'CRITICAL', label: 'Critical', color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
  { value: 'HIGH', label: 'High', color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  { value: 'MEDIUM', label: 'Medium', color: '#facc15', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)' },
  { value: 'LOW', label: 'Low', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)' },
]

interface SeverityFilterProps {
  active: Set<Severity>
  onToggle: (s: Severity) => void
}

export function SeverityFilter({ active, onToggle }: SeverityFilterProps) {
  return (
    <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
      {SEVERITIES.map(({ value, label, color, bg, border }) => {
        const isActive = active.has(value)
        return (
          <button
            key={value}
            onClick={() => onToggle(value)}
            aria-pressed={isActive}
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: `1px solid ${isActive ? border : 'var(--border-color)'}`,
              background: isActive ? bg : 'var(--bg-tertiary)',
              color: isActive ? color : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
