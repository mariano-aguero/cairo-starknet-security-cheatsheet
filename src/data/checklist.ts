import type { ChecklistCategory } from '../types'

export const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'architecture',
    icon: '🏗️',
    title: 'Architecture',
    items: [
      'CEI pattern followed in all functions with external calls',
      'Initializers protected against re-initialization',
      'Upgrade logic uses whitelist or governance timelock',
      'Component storage namespaces are unique (#[substorage(v0)])',
      'New storage variables appended at end (never inserted before existing ones)',
      'Proxy patterns verified for storage layout compatibility across versions',
    ],
  },
  {
    id: 'arithmetic',
    icon: '🔢',
    title: 'Arithmetic',
    items: [
      'No felt252 used for balance or business logic comparisons',
      'Integer division precision handled (multiply before divide)',
      'Safe integer types (u8–u256) used throughout',
      'Array sizes bounded to prevent step limit DoS',
      'No reliance on block hash or timestamps for randomness',
    ],
  },
  {
    id: 'access-control',
    icon: '🔑',
    title: 'Access Control',
    items: [
      'get_caller_address() not used in constructor for ownership',
      'All admin functions restricted with proper access control',
      'L1 handlers validate from_address against expected L1 contract',
      'Custom AA accounts validate signature, nonce, and chain_id',
      'Multicall batching considered in access control threat model',
      'ERC20 allowances use increase/decrease instead of direct approve for updates',
    ],
  },
  {
    id: 'external',
    icon: '🌐',
    title: 'External Interactions',
    items: [
      'All external calls use SafeDispatcher or validate return values',
      'Interface compatibility verified before calling external contracts',
      'Price data sourced from TWAP oracle (e.g., Pragma), not spot price',
      'No external calls in unbounded loops',
      'L2→L1 messages account for potential consumption failures',
    ],
  },
]
