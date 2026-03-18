export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface CodeExample {
  label: string
  code: string
}

export interface Vulnerability {
  id: string
  number: string
  icon: string
  title: string
  severity: Severity
  description: string
  impact?: string
  whyCairo?: string
  examples: CodeExample[]
  tags: string[]
}

export interface Pattern {
  id: string
  icon: string
  title: string
  description: string
  examples?: CodeExample[]
}

export interface ChecklistCategory {
  id: string
  icon: string
  title: string
  items: string[]
}

export interface Tool {
  name: string
  url: string
  description: string
  icon: string
}
