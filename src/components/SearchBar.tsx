import { X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder="Search vulnerabilities..."
        style={{
          width: '100%',
          padding: '0.5rem 2rem 0.5rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          outline: 'none',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          fontFamily: 'inherit',
        }}
        aria-label="Search vulnerabilities"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="no-print"
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
