import type { Tool } from '../types'

export const TOOLS: Tool[] = [
  {
    name: 'Scarb',
    url: 'https://docs.swmansion.com/scarb/',
    description: 'The official build toolchain and package manager for Cairo and Starknet contracts.',
    icon: '🔧',
  },
  {
    name: 'Starknet Foundry',
    url: 'https://foundry-rs.github.io/starknet-foundry/',
    description: 'Fast testing and development toolkit for Starknet — unit tests, fuzzing, and scripting.',
    icon: '⚒️',
  },
  {
    name: 'Caracal',
    url: 'https://github.com/crytic/caracal',
    description: 'Static analyzer for Starknet smart contracts — detects common vulnerability patterns automatically.',
    icon: '🔍',
  },
  {
    name: 'Starknet-compile',
    url: 'https://github.com/starkware-libs/cairo',
    description: 'Official Cairo compiler for verifying Sierra and CASM bytecode output.',
    icon: '⚙️',
  },
  {
    name: 'OpenZeppelin Cairo',
    url: 'https://github.com/OpenZeppelin/cairo-contracts',
    description: 'Battle-tested Cairo 2 component library — ERC20, ERC721, access control, upgradeable patterns.',
    icon: '🛡️',
  },
  {
    name: 'Pragma Oracle',
    url: 'https://docs.pragma.build/',
    description: 'Decentralized price oracle for Starknet — provides TWAP feeds to prevent price manipulation.',
    icon: '📊',
  },
]
