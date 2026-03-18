import { useState, useMemo } from 'react'
import type { Vulnerability, Severity } from '../types'

export function useSearch(vulnerabilities: Vulnerability[]) {
  const [query, setQuery] = useState('')
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(new Set())

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return vulnerabilities.filter((v) => {
      const matchesSeverity =
        activeSeverities.size === 0 || activeSeverities.has(v.severity)

      if (!matchesSeverity) return false
      if (!q) return true

      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        (v.whyCairo?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [vulnerabilities, query, activeSeverities])

  const toggleSeverity = (severity: Severity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev)
      if (next.has(severity)) {
        next.delete(severity)
      } else {
        next.add(severity)
      }
      return next
    })
  }

  return { query, setQuery, activeSeverities, toggleSeverity, filtered }
}
