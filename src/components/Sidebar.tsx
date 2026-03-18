import type { Vulnerability, Pattern, Severity } from '../types'
import { SearchBar } from './SearchBar'
import { SeverityFilter } from './SeverityFilter'

interface SidebarProps {
  vulnerabilities: Vulnerability[]
  patterns: Pattern[]
  query: string
  onQueryChange: (q: string) => void
  activeSeverities: Set<Severity>
  onToggleSeverity: (s: Severity) => void
}

export function Sidebar({
  vulnerabilities,
  patterns,
  query,
  onQueryChange,
  activeSeverities,
  onToggleSeverity,
}: SidebarProps) {
  const scrollTo = (id: string) => {
    window.location.hash = id
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinkStyle = {
    display: 'block',
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    width: '100%',
    fontFamily: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.15s',
  }

  const sectionLabelStyle = {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.375rem',
    padding: '0 0.5rem',
  }

  return (
    <aside
      className="no-print"
      style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        bottom: 0,
        width: '16rem',
        overflowY: 'auto',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        zIndex: 40,
      }}
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Search */}
        <SearchBar value={query} onChange={onQueryChange} />

        {/* Severity filter */}
        <SeverityFilter active={activeSeverities} onToggle={onToggleSeverity} />

        {/* Getting started */}
        <nav>
          <p style={sectionLabelStyle}>Getting Started</p>
          <button
            onClick={() => scrollTo('getting-started')}
            style={navLinkStyle}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
          >
            📖 Overview
          </button>
        </nav>

        {/* Vulnerabilities */}
        <nav>
          <p style={sectionLabelStyle}>
            Vulnerabilities ({vulnerabilities.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {vulnerabilities.map((v) => (
              <button
                key={v.id}
                onClick={() => scrollTo(v.id)}
                title={v.title}
                style={navLinkStyle}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                {v.icon} {v.number}. {v.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Patterns */}
        <nav>
          <p style={sectionLabelStyle}>Secure Patterns</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => scrollTo(p.id)}
                title={p.title}
                style={navLinkStyle}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                {p.icon} {p.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Reference */}
        <nav>
          <p style={sectionLabelStyle}>Reference</p>
          {[
            { id: 'audit-checklist', label: '✅ Audit Checklist' },
            { id: 'tools', label: '🛠️ Tools & Resources' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
