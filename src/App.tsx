import { useState, useEffect } from 'react'
import { VULNERABILITIES } from './data/vulnerabilities'
import { PATTERNS } from './data/patterns'
import { CHECKLIST } from './data/checklist'
import { TOOLS } from './data/tools'
import { useSearch } from './hooks/useSearch'
import { Sidebar } from './components/Sidebar'
import { ThemeToggle } from './components/ThemeToggle'
import { VulnerabilityCard } from './components/VulnerabilityCard'
import { PatternCard } from './components/PatternCard'
import { Github } from 'lucide-react'

function getInitialTheme(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [isDark, setIsDark] = useState(getInitialTheme)
  const { query, setQuery, activeSeverities, toggleSeverity, filtered } = useSearch(VULNERABILITIES)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [])

  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    zIndex: 50,
    background: 'rgba(10, 14, 23, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border-color)',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={headerStyle} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔐</span>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cairo Security Cheatsheet
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '0.1rem 0.4rem',
                borderRadius: '0.25rem',
                background: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
              }}
            >
              Cairo 2.x
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          <a
            href="https://github.com/mariano-aguero/cairo-starknet-security-cheatsheet"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
            aria-label="View on GitHub"
          >
            <Github size={15} />
          </a>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        vulnerabilities={filtered}
        patterns={PATTERNS}
        query={query}
        onQueryChange={setQuery}
        activeSeverities={activeSeverities}
        onToggleSeverity={toggleSeverity}
      />

      {/* Main content */}
      <main
        style={{
          marginLeft: '16rem',
          paddingTop: '70px',
          maxWidth: 'calc(16rem + 52rem)',
        }}
      >
        <div style={{ padding: '2rem 2rem 2rem 2.5rem' }}>

          {/* Getting Started */}
          <section id="getting-started" style={{ marginBottom: '4rem', scrollMarginTop: '5rem' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                background: 'var(--gradient-main)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cairo Security Cheatsheet
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '40rem' }}>
              A comprehensive, interactive reference for Cairo 2.x and Starknet smart contract security.
              22 vulnerabilities, 7 secure patterns, and an audit checklist — all with real Cairo code examples.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Zero-Knowledge Proofs', body: 'Cairo generates STARK proofs for execution correctness. Every valid transaction is provable.' },
                { title: 'Linear Memory Model', body: "Memory in Cairo is immutable — variables can be reassigned but underlying slots can't be overwritten." },
                { title: 'Sierra Safety Net', body: 'Sierra (Safe Intermediate Representation) ensures every transaction is provable, even reverts. No unprovable states.' },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  style={{
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                  }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-primary)', marginBottom: '0.375rem' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Vulnerabilities */}
          <section id="vulnerabilities" style={{ marginBottom: '4rem' }}>
            <h2 style={sectionTitleStyle}>
              Vulnerabilities{' '}
              <span style={{ fontSize: '0.875rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', fontWeight: 400 }}>
                ({filtered.length}/{VULNERABILITIES.length})
              </span>
            </h2>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No vulnerabilities match your current filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {filtered.map((vuln) => (
                  <VulnerabilityCard key={vuln.id} vuln={vuln} isDark={isDark} />
                ))}
              </div>
            )}
          </section>

          {/* Secure Patterns */}
          <section id="patterns" style={{ marginBottom: '4rem', scrollMarginTop: '5rem' }}>
            <h2 style={sectionTitleStyle}>Secure Patterns</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem' }}>
              {PATTERNS.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} isDark={isDark} />
              ))}
            </div>
          </section>

          {/* Audit Checklist */}
          <section id="audit-checklist" style={{ marginBottom: '4rem', scrollMarginTop: '5rem' }}>
            <h2 style={sectionTitleStyle}>Security Audit Checklist</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
              {CHECKLIST.map((category) => (
                <div
                  key={category.id}
                  style={{
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    padding: '1.25rem',
                    background: 'var(--bg-card)',
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{category.icon}</span> {category.title}
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
                    {category.items.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '0.1rem' }}>☐</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Tools */}
          <section id="tools" style={{ marginBottom: '4rem', scrollMarginTop: '5rem' }}>
            <h2 style={sectionTitleStyle}>Tools & Resources</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
              {TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.4)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>{tool.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-primary)' }}>
                      {tool.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {tool.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer
            className="no-print"
            style={{
              textAlign: 'center',
              padding: '2rem 0',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            Made for the Starknet community •{' '}
            <a
              href="https://github.com/mariano-aguero/cairo-starknet-security-cheatsheet"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
            >
              GitHub
            </a>{' '}
            •{' '}
            <a
              href="https://docs.starknet.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
            >
              Starknet Docs
            </a>
          </footer>
        </div>
      </main>
    </div>
  )
}
