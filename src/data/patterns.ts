import type { Pattern } from '../types'

export const PATTERNS: Pattern[] = [
  {
    id: 'pattern-cei',
    icon: '🔄',
    title: 'Checks-Effects-Interactions (CEI)',
    description:
      'Validate all conditions (Checks) first, then update internal contract state (Effects), and only then perform external calls (Interactions). In Cairo 2, this remains critical even with its synchronous execution model to maintain state consistency and prevent reentrancy.',
  },
  {
    id: 'pattern-access',
    icon: '🔑',
    title: 'Standard Access Control',
    description:
      "Implement robust access control using OpenZeppelin's Ownable or AccessControl components instead of manual address checks. This ensures sensitive functions like upgrading contracts or withdrawing fees are strictly restricted to authorized roles.",
  },
  {
    id: 'pattern-components',
    icon: '🧩',
    title: 'OpenZeppelin Components',
    description:
      'Leverage the Cairo 2 component system to integrate battle-tested security logic. OpenZeppelin provides ERC20, ERC721, ReentrancyGuard, Pausable, and more — significantly reducing the attack surface compared to rolling your own implementations.',
  },
  {
    id: 'pattern-assert',
    icon: '✅',
    title: 'Strict Assertions',
    description:
      'Use assert and panic strategically to enforce invariants throughout execution. In Cairo 2, providing clear descriptive error messages in your assertions not only helps with debugging but ensures any invalid state transition results in an immediate, safe revert.',
  },
  {
    id: 'pattern-events',
    icon: '📢',
    title: 'Event-Driven State',
    description:
      'Emit events for every critical state change to ensure transparency and off-chain synchronicity. Events are the primary way for indexers, frontends, and auditors to track contract activity without replaying every transaction.',
  },
  {
    id: 'pattern-resource',
    icon: '⚡',
    title: 'Resource & Step Optimization',
    description:
      "Starknet transactions have limits on computational steps and builtins. Avoid unnecessary loops over large collections, redundant syscalls, and unbounded user input. Optimize Cairo code to stay within resource limits and lower user transaction costs.",
  },
  {
    id: 'pattern-pull',
    icon: '↩️',
    title: 'Pull-over-Push Payments',
    description:
      'Favor pull for fund distributions. Instead of pushing tokens to multiple users in a single transaction (which hits step limits with large arrays), allow users to withdraw their own funds individually. This shifts cost to the user and prevents one failing transfer from blocking others.',
  },
]
