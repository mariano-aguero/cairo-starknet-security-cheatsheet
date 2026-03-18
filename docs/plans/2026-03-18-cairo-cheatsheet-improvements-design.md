# Cairo Security Cheatsheet — Improvements Design

**Date:** 2026-03-18
**Status:** Approved

## Goal

Migrate the single-file `index.html` cheatsheet to a Vite + React + TypeScript project with:
- 8 new Cairo-specific vulnerabilities (total: 22)
- Full UX feature set (search, severity filter, copy, hash nav, dark/light theme, print)
- Typed, contributor-friendly data layer
- Updated GitHub Actions CI/CD

## Architecture

```
cairo-security-cheatsheet/
├── src/
│   ├── data/
│   │   ├── vulnerabilities.ts   # 22 vulnerabilities
│   │   ├── patterns.ts          # 7 secure patterns
│   │   ├── checklist.ts         # audit checklist
│   │   └── tools.ts             # tools & resources
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SeverityFilter.tsx
│   │   ├── VulnerabilityCard.tsx
│   │   ├── PatternCard.tsx
│   │   ├── CodeBlock.tsx        # syntax highlight + copy
│   │   ├── Sidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   └── useSearch.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles/
│       ├── global.css
│       └── themes.css
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Tech stack:**
- Build: Vite
- Framework: React + TypeScript
- Styling: Tailwind CSS v4
- Syntax highlighting: react-syntax-highlighter (Cairo grammar)
- Package manager: pnpm
- Deploy: GitHub Pages via GitHub Actions (`dist/`)

## New Vulnerabilities (8 Cairo-specific)

All new entries include: description, vulnerable code, secure code, and a "Why Cairo?" callout explaining the Cairo/Starknet-specific angle.

| # | Vulnerability | Severity | Cairo-specific angle |
|---|---|---|---|
| 15 | Signature Replay | CRITICAL | AA `__validate__` must check nonce + chain_id + tx hash together |
| 16 | Multicall Abuse via AA | HIGH | Native AA batching bypasses per-call state guards |
| 17 | Storage Layout Break on Upgrade | HIGH | Inserting vars before existing ones shifts all subsequent slots |
| 18 | Phantom Functions / Interface Mismatch | HIGH | Cairo dispatch doesn't revert on missing selector — silent return |
| 19 | Randomness from Block Hash | MEDIUM | `get_block_hash_syscall` is sequencer-influenced, not secure RNG |
| 20 | Flash Loan / Single-block Price Oracle | HIGH | No TWAP support native to Starknet; price manipulable in one block |
| 21 | DoS via Unbounded Array Input | MEDIUM | User-controlled array sizes can exhaust Starknet step limits |
| 22 | ERC20 Approval Race | MEDIUM | `approve + transferFrom` race; use `increase_allowance` / `decrease_allowance` |

## UX Features

| Feature | Details |
|---|---|
| Live search | Filters vulnerabilities + patterns by title/description/keywords. Escape clears. |
| Severity filter | Pills: ALL / CRITICAL / HIGH / MEDIUM / LOW. Combinable. |
| Copy button | On every code block. Copies raw Cairo. Shows "Copied!" for 1.5s. |
| Hash navigation | Each section has a stable `id`. Sidebar links update URL hash. |
| Dark / Light toggle | Persisted to `localStorage`. Defaults to system preference via `prefers-color-scheme`. |
| Print / PDF | `@media print`: hide sidebar + chrome, expand code blocks, no color backgrounds. |
| Cairo version badge | Header: "Cairo 2.x" badge indicating target version. |
| "Why Cairo?" callout | On new vulnerability cards: highlighted box explaining Cairo-specific vs EVM difference. |

## CI/CD

- **GitHub Actions**: on push/PR → `pnpm typecheck` + `pnpm build`
- **Deploy**: on push to `main` → `pnpm build` → deploy `dist/` to GitHub Pages
- Replaces current workflow that serves `index.html` directly

## Migration Notes

- Current `index.html` is the source of truth for all 14 existing vulnerability entries
- All existing content must be preserved verbatim in the migrated TypeScript data files
- The visual design (dark theme, color palette, typography) should be maintained
- The live URL (`https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/`) must continue to work post-migration
