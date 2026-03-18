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

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: '#f87171',
  HIGH: '#fb923c',
  MEDIUM: '#facc15',
  LOW: '#4ade80',
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8125rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    width: '100%',
    fontFamily: 'inherit',
    transition: 'color 0.15s',
    overflow: 'hidden',
  }

  const sectionLabelStyle = {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    padding: '0 0.5rem',
  }

  const textStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flex: 1,
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
        <SearchBar value={query} onChange={onQueryChange} />

        <SeverityFilter active={activeSeverities} onToggle={onToggleSeverity} />

        <nav>
          <p style={sectionLabelStyle}>Getting Started</p>
          <button
            onClick={() => scrollTo('getting-started')}
            style={navLinkStyle}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
          >
            <span style={textStyle}>Overview</span>
          </button>
        </nav>

        <nav>
          <p style={sectionLabelStyle}>Vulnerabilities ({vulnerabilities.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {vulnerabilities.map((v) => (
              <button
                key={v.id}
                onClick={() => scrollTo(v.id)}
                title={v.title}
                style={navLinkStyle}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: SEVERITY_DOT[v.severity] ?? 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
                <span style={textStyle}>
                  {v.number}. {v.title}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <nav>
          <p style={sectionLabelStyle}>Secure Patterns</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => scrollTo(p.id)}
                title={p.title}
                style={navLinkStyle}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                <span style={textStyle}>{p.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <nav>
          <p style={sectionLabelStyle}>Reference</p>
          {[
            { id: 'audit-checklist', label: 'Audit Checklist' },
            { id: 'tools', label: 'Tools & Resources' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              <span style={textStyle}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
