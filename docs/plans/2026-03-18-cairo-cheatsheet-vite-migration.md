# Cairo Security Cheatsheet — Vite Migration & Feature Expansion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the single `index.html` to a Vite + React + TypeScript SPA adding 8 new Cairo-specific vulnerabilities, live search, severity filter, copy buttons, hash nav, dark/light toggle, and print CSS.

**Architecture:** React SPA built with Vite, data in typed `.ts` files, Tailwind v4 for styling, `react-syntax-highlighter` (Prism) for code blocks with a custom Cairo grammar, deployed to GitHub Pages via updated GH Actions.

**Tech Stack:** pnpm, Vite, React 19, TypeScript, Tailwind v4, react-syntax-highlighter, lucide-react

---

## Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Modify: `.github/workflows/deploy.yml`

**Step 1: Scaffold the project**

```bash
# From repo root — scaffold into a temp dir, then move files
pnpm create vite@latest . --template react-ts
# When asked about existing files: overwrite package.json/tsconfig, keep index.html content
```

**Step 2: Install dependencies**

```bash
pnpm add react-syntax-highlighter lucide-react
pnpm add -D @types/react-syntax-highlighter @tailwindcss/vite tailwindcss
```

**Step 3: Replace vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/cairo-starknet-security-cheatsheet/',
})
```

**Step 4: Replace tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**Step 5: Replace index.html**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cairo Security Cheatsheet - Starknet Smart Contract Security</title>
  <meta name="description" content="A comprehensive, interactive security guide for Cairo 2.x and Starknet smart contract development." />
  <meta name="keywords" content="Cairo, Starknet, Security, Smart Contracts, Blockchain, ZK-Proof, Vulnerabilities, Cheatsheet, Ethereum L2, Sierra" />
  <link rel="canonical" href="https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/" />
  <meta property="og:title" content="Cairo Security Cheatsheet - Starknet Smart Contract Security" />
  <meta property="og:description" content="A comprehensive, interactive security guide for Cairo 2.x and Starknet smart contract development." />
  <meta property="og:image" content="https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/preview.svg" />
  <meta property="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cairo Security Cheatsheet",
    "url": "https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/",
    "description": "Comprehensive security guide for Cairo 2.x and Starknet smart contract development.",
    "author": { "@type": "Person", "name": "Mariano Aguero" }
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Step 6: Update GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - name: Install dependencies
        run: pnpm install
      - name: Type check
        run: pnpm typecheck
      - name: Build
        run: pnpm build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 7: Add scripts to package.json**

Ensure `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

**Step 8: Verify setup**

```bash
pnpm typecheck   # Expected: no errors
pnpm build       # Expected: dist/ created
```

**Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tsconfig.json tsconfig.node.json index.html .github/workflows/deploy.yml
git commit -m "build: initialize Vite + React + TS + Tailwind v4"
```

---

## Task 2: Define TypeScript types

**Files:**
- Create: `src/types.ts`

**Step 1: Write types**

```ts
// src/types.ts

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
```

**Step 2: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript types for data layer"
```

---

## Task 3: Create vulnerability data — existing 14

**Files:**
- Create: `src/data/vulnerabilities.ts`

**Step 1: Create the file with all 14 existing vulnerabilities**

```ts
// src/data/vulnerabilities.ts
import type { Vulnerability } from '../types'

export const VULNERABILITIES: Vulnerability[] = [
  {
    id: 'overflow',
    number: '01',
    icon: '💥',
    title: 'Underflow & Overflow',
    severity: 'HIGH',
    description:
      "In Cairo 2, integer types (u8 to u256) have native overflow protection and will panic on out-of-bounds operations. However, the base type 'felt252' uses modular arithmetic (Modulo P). Using felts for business logic can lead to unexpected wrap-around behavior.",
    impact: 'Incorrect balance calculations, logic bypasses, and potential loss of funds.',
    tags: ['arithmetic', 'felt252', 'overflow', 'integer'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn insecure_transfer(amount: felt252, balance: felt252) -> felt252 {
    // If amount > balance, this does not panic.
    // It wraps around due to felt252 modular arithmetic.
    balance - amount
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn secure_transfer(amount: u256, balance: u256) -> u256 {
    // Cairo 2 automatically panics if amount > balance
    balance - amount
}`,
      },
    ],
  },
  {
    id: 'access-control',
    number: '02',
    icon: '🔑',
    title: 'Inadequate Access Control',
    severity: 'CRITICAL',
    description:
      'Failure to restrict sensitive functions to authorized users allows attackers to modify configurations, steal funds, or destroy the contract via syscalls like replace_class_syscall.',
    tags: ['access-control', 'owner', 'admin', 'authorization'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[external(v0)]
fn upgrade_contract(ref self: ContractState, new_class_hash: ClassHash) {
    // Anyone can upgrade the contract class!
    starknet::replace_class_syscall(new_class_hash).unwrap();
}`,
      },
      {
        label: '✅ SECURE',
        code: `#[external(v0)]
fn upgrade_contract(ref self: ContractState, new_class_hash: ClassHash) {
    self.ownable.assert_only_owner();
    starknet::replace_class_syscall(new_class_hash).unwrap();
}`,
      },
    ],
  },
  {
    id: 'reentrancy',
    number: '03',
    icon: '🔄',
    title: 'Reentrancy',
    severity: 'HIGH',
    description:
      "While Starknet's execution model is synchronous, external calls to other contracts can still allow reentrancy attacks if the state is not updated before the call (breaking the Checks-Effects-Interactions pattern).",
    tags: ['reentrancy', 'CEI', 'external-call', 'state'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn withdraw(ref self: ContractState, amount: u256) {
    let caller = get_caller_address();
    let balance = self.balances.read(caller);
    assert(balance >= amount, 'Insufficient balance');

    let dispatcher = IERC20Dispatcher { contract_address: self.token.read() };
    dispatcher.transfer(caller, amount);

    // State updated AFTER external call — reentrancy window!
    self.balances.write(caller, balance - amount);
}`,
      },
      {
        label: '✅ SECURE (CEI Pattern)',
        code: `fn withdraw(ref self: ContractState, amount: u256) {
    let caller = get_caller_address();
    let balance = self.balances.read(caller);
    assert(balance >= amount, 'Insufficient balance');

    // Update state BEFORE external call
    self.balances.write(caller, balance - amount);

    let dispatcher = IERC20Dispatcher { contract_address: self.token.read() };
    dispatcher.transfer(caller, amount);
}`,
      },
    ],
  },
  {
    id: 'messaging',
    number: '04',
    icon: '📧',
    title: 'Insecure L1-L2 Messaging',
    severity: 'CRITICAL',
    description:
      "When receiving messages from L1 (Ethereum) via an l1_handler, it is mandatory to validate that the 'from_address' matches the expected L1 contract. Otherwise, any L1 user can trigger the handler.",
    tags: ['L1', 'L2', 'messaging', 'bridge', 'handler'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[l1_handler]
fn process_deposit(ref self: ContractState, from_address: felt252, amount: u256) {
    // No validation of the L1 sender!
    let user = get_caller_address();
    self.balances.write(user, self.balances.read(user) + amount);
}`,
      },
      {
        label: '✅ SECURE',
        code: `#[l1_handler]
fn process_deposit(ref self: ContractState, from_address: felt252, amount: u256) {
    let expected_l1_address = self.l1_bridge_address.read();
    assert(from_address == expected_l1_address, 'Invalid L1 sender');
    // Process deposit safely...
}`,
      },
    ],
  },
  {
    id: 'initializers',
    number: '05',
    icon: '🚀',
    title: 'Unprotected Initializers',
    severity: 'CRITICAL',
    description:
      "In proxy patterns, contracts often use an 'initializer' function instead of a constructor. If not protected, an attacker can call it to take ownership of the contract.",
    tags: ['proxy', 'initializer', 'upgrade', 'ownership'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[external(v0)]
fn initialize(ref self: ContractState, admin: ContractAddress) {
    // Can be called multiple times!
    self.admin.write(admin);
}`,
      },
      {
        label: '✅ SECURE',
        code: `#[external(v0)]
fn initialize(ref self: ContractState, admin: ContractAddress) {
    assert(self.admin.read().is_zero(), 'Already initialized');
    self.admin.write(admin);
}`,
      },
    ],
  },
  {
    id: 'constructor-caller',
    number: '06',
    icon: '👤',
    title: 'Constructor Caller Address',
    severity: 'MEDIUM',
    description:
      'In Starknet, during contract deployment (constructor execution), get_caller_address() returns 0. If you rely on it to set an owner or admin, you will lock the contract.',
    impact: 'Broken access control, permanent loss of administrative privileges.',
    tags: ['constructor', 'caller', 'address', 'deployment'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[constructor]
fn constructor(ref self: ContractState) {
    // This sets admin to address 0!
    self.admin.write(get_caller_address());
}`,
      },
      {
        label: '✅ SECURE',
        code: `#[constructor]
fn constructor(ref self: ContractState, admin: ContractAddress) {
    // Explicitly pass the admin address as a parameter
    self.admin.write(admin);
}`,
      },
    ],
  },
  {
    id: 'integer-division',
    number: '07',
    icon: '➗',
    title: 'Integer Division & Precision',
    severity: 'MEDIUM',
    description:
      'Integer division in Cairo (as in most smart contract languages) rounds down to the nearest integer. Performing multiplication after division can lead to significant precision loss.',
    impact: 'Incorrect financial calculations, under-distributed rewards.',
    tags: ['arithmetic', 'division', 'precision', 'rounding'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn calculate_reward(amount: u256, rate: u256) -> u256 {
    // If amount is small, (amount / 100) rounds down to 0
    (amount / 100) * rate
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn calculate_reward(amount: u256, rate: u256) -> u256 {
    // Multiply first to maintain precision
    (amount * rate) / 100
}`,
      },
    ],
  },
  {
    id: 'missing-events',
    number: '08',
    icon: '📢',
    title: 'Missing Event Emission',
    severity: 'LOW',
    description:
      'Critical state changes (ownership transfers, configuration updates, large fund movements) should emit events to allow indexers and UIs to track contract state reliably.',
    impact: 'Difficulties in auditing, broken UI updates, lack of transparency.',
    tags: ['events', 'transparency', 'indexer', 'observability'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn set_fees(ref self: ContractState, new_fees: u256) {
    self.ownable.assert_only_owner();
    self.fees.write(new_fees);
    // No event emitted — state change is invisible off-chain
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn set_fees(ref self: ContractState, new_fees: u256) {
    self.ownable.assert_only_owner();
    self.fees.write(new_fees);
    self.emit(FeesUpdated { new_fees });
}`,
      },
    ],
  },
  {
    id: 'external-calls-loops',
    number: '09',
    icon: '🔁',
    title: 'External Calls in Loops',
    severity: 'MEDIUM',
    description:
      "Executing external calls inside a loop whose size can be controlled or grows over time can lead to transaction failure due to Starknet step limits. If one call fails, the entire transaction reverts.",
    impact: 'Contract lockup, inability to process payments or critical logic.',
    tags: ['DoS', 'loops', 'gas', 'step-limit', 'external-call'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn distribute_rewards(ref self: ContractState, users: Array<ContractAddress>) {
    let mut i = 0;
    loop {
        if i >= users.len() { break; }
        let user = *users.at(i);
        // External call in a loop — hits step limits with large arrays
        let dispatcher = IERC20Dispatcher { contract_address: self.token.read() };
        dispatcher.transfer(user, 100);
        i += 1;
    };
}`,
      },
      {
        label: '✅ SECURE (Pull Pattern)',
        code: `fn claim_reward(ref self: ContractState) {
    let user = get_caller_address();
    let reward = self.rewards.read(user);
    assert(reward > 0, 'No reward to claim');

    self.rewards.write(user, 0);
    let dispatcher = IERC20Dispatcher { contract_address: self.token.read() };
    dispatcher.transfer(user, reward);
}`,
      },
    ],
  },
  {
    id: 'felt-comparisons',
    number: '10',
    icon: '⚖️',
    title: 'Felt252 Comparisons',
    severity: 'LOW',
    description:
      'The felt252 type represents elements in a prime field. When comparing felts with < or >, Cairo treats them as large positive integers. This can lead to logic errors if the developer assumes signed-like behavior.',
    impact: 'Incorrect validation logic, especially in threshold checks.',
    tags: ['felt252', 'comparison', 'arithmetic', 'signed'],
    examples: [
      {
        label: '⚠️ CAUTION',
        code: `// Comparing felts — dangerous with negative-looking values
let a: felt252 = 1;
let b: felt252 = -1; // This becomes P - 1 (a very large number)

if a < b {
    // This branch IS taken — b is a massive field element
}`,
      },
      {
        label: '✅ SECURE',
        code: `// Use explicit integer types for range comparisons
let a: u256 = 1;
let b: u256 = 100;

if a < b {
    // Works as expected — u256 is properly bounded
}`,
      },
    ],
  },
  {
    id: 'account-abstraction',
    number: '11',
    icon: '👤',
    title: 'Insecure Account Validation',
    severity: 'CRITICAL',
    description:
      'Starknet uses native Account Abstraction. Custom account contracts must validate the signature in __validate__ and __validate_declare__. Failure to properly validate the caller or the signature allows anyone to impersonate the account.',
    impact: 'Full account takeover and loss of all managed funds.',
    tags: ['account-abstraction', 'AA', 'signature', 'validation'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
    // No signature validation — anyone can execute transactions!
    starknet::VALID
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
    let tx_info = get_tx_info().unbox();
    let signature = tx_info.signature;

    let is_valid = self.validate_signature(tx_info.transaction_hash, signature);
    assert(is_valid, 'Invalid signature');

    starknet::VALID
}`,
      },
    ],
  },
  {
    id: 'storage-collision',
    number: '12',
    icon: '📦',
    title: 'Component Storage Collision',
    severity: 'HIGH',
    description:
      "When using the Cairo 2 component system, different components must not accidentally use overlapping storage areas. The compiler and OpenZeppelin's patterns mitigate this with #[substorage(v0)], but manual storage management can still lead to state corruption.",
    impact: 'State corruption, unintended data modification, and logic bypasses.',
    tags: ['storage', 'component', 'collision', 'namespace'],
    examples: [
      {
        label: '⚠️ CAUTION — use substorage namespacing',
        code: `#[storage]
struct Storage {
    // Each component gets its own isolated storage segment
    #[substorage(v0)]
    ownable: ownable_component::Storage,
    #[substorage(v0)]
    upgradeable: upgradeable_component::Storage,

    // Contract-specific storage — no naming conflicts
    my_value: u256,
}`,
      },
    ],
  },
  {
    id: 'unchecked-upgrade',
    number: '13',
    icon: '🏗️',
    title: 'Unchecked Class Hash Upgrades',
    severity: 'HIGH',
    description:
      "Using replace_class_syscall allows a contract to change its logic. If the new class hash is not validated against a whitelist or doesn't follow the same storage layout, the contract can be bricked or taken over.",
    impact: 'Loss of contract functionality, state corruption, or complete takeover.',
    tags: ['upgrade', 'class-hash', 'proxy', 'governance'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
    self.ownable.assert_only_owner();
    // Blindly replacing class hash — no validation!
    starknet::replace_class_syscall(new_class_hash).unwrap();
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
    self.ownable.assert_only_owner();
    assert(!new_class_hash.is_zero(), 'Class hash cannot be zero');
    // Whitelist check or governance timelock before upgrade
    assert(self.is_whitelisted(new_class_hash), 'Class hash not whitelisted');
    starknet::replace_class_syscall(new_class_hash).unwrap();
}`,
      },
    ],
  },
  {
    id: 'predictable-salt',
    number: '14',
    icon: '🧂',
    title: 'Predictable Salt & Frontrunning',
    severity: 'LOW',
    description:
      "When deploying contracts via deploy_syscall, using a predictable salt (like a simple counter) can allow attackers to frontrun the deployment or predict the contract address, enabling 'address squatting'.",
    impact: 'Gaining control over a contract address before the intended deployer.',
    tags: ['deployment', 'salt', 'frontrunning', 'deploy_syscall'],
    examples: [
      {
        label: '⚠️ CAUTION',
        code: `fn deploy_child(ref self: ContractState, salt: felt252) {
    // If salt is just 1, 2, 3... it's easily predictable
    let (addr, _) = starknet::deploy_syscall(
        self.child_class_hash.read(), salt, calldata.span(), false
    ).unwrap();
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn deploy_child(ref self: ContractState, salt: felt252) {
    // Mix salt with caller address using a hash function
    let unique_salt = pedersen(get_caller_address().into(), salt);
    let (addr, _) = starknet::deploy_syscall(
        self.child_class_hash.read(), unique_salt, calldata.span(), false
    ).unwrap();
}`,
      },
    ],
  },
]
```

**Step 2: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 3: Commit**

```bash
git add src/data/vulnerabilities.ts
git commit -m "feat: migrate 14 existing vulnerabilities to typed data"
```

---

## Task 4: Add 8 new Cairo-specific vulnerabilities

**Files:**
- Modify: `src/data/vulnerabilities.ts` (append to the array)

**Step 1: Append the 8 new entries**

Add these to the `VULNERABILITIES` array after entry 14:

```ts
  {
    id: 'signature-replay',
    number: '15',
    icon: '🔁',
    title: 'Signature Replay',
    severity: 'CRITICAL',
    description:
      'In custom Account Abstraction contracts, a valid signature for one transaction can be replayed in a different context if the contract does not bind the signature to the nonce, chain_id, and transaction hash together.',
    impact: 'Unauthorized execution of transactions, fund theft, account takeover.',
    whyCairo:
      'Starknet uses native AA — every account is a contract and every transaction goes through __validate__. Unlike EVM where replay protection is built into the protocol, Cairo AA developers must implement nonce + chain_id binding manually.',
    tags: ['account-abstraction', 'signature', 'replay', 'nonce', 'AA'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
    let tx_info = get_tx_info().unbox();
    let signature = tx_info.signature;

    // Only checks the signature — not bound to nonce or chain_id
    let hash = tx_info.transaction_hash;
    let is_valid = check_ecdsa_signature(hash, self.pub_key.read(), *signature[0], *signature[1]);
    assert(is_valid, 'Invalid sig');
    starknet::VALID
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
    let tx_info = get_tx_info().unbox();

    // transaction_hash already includes nonce + chain_id + version in Starknet
    // Ensure you're using the full tx hash, not a custom partial hash
    let hash = tx_info.transaction_hash;
    let signature = tx_info.signature;

    let is_valid = check_ecdsa_signature(
        hash, self.pub_key.read(), *signature[0], *signature[1]
    );
    assert(is_valid, 'Invalid signature');

    // Verify nonce separately for custom account logic
    let expected_nonce = self.nonce.read();
    assert(tx_info.nonce == expected_nonce, 'Invalid nonce');

    starknet::VALID
}`,
      },
    ],
  },
  {
    id: 'multicall-abuse',
    number: '16',
    icon: '📋',
    title: 'Multicall Abuse via Account Abstraction',
    severity: 'HIGH',
    description:
      'Starknet AA accounts execute calls as atomic batches via __execute__. A contract that checks state at the start of a call may be bypassed if an attacker batches a state-changing call before it in the same multicall transaction.',
    impact: 'Access control bypasses, logic exploits through state manipulation within a single transaction.',
    whyCairo:
      'EVM users need a separate multicall contract. On Starknet, every AA account natively supports atomic batching in __execute__. This makes within-transaction state manipulation more accessible to any user without needing special infrastructure.',
    tags: ['account-abstraction', 'multicall', 'AA', 'batch', 'state'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `// Attacker batches these two calls atomically in one transaction:
// Call 1: whitelist(attacker_addr)  <- modifies state
// Call 2: privileged_action()       <- reads the now-modified state

#[external(v0)]
fn privileged_action(ref self: ContractState) {
    // Reads whitelist — but it was just modified in the same tx batch!
    assert(self.is_whitelisted(get_caller_address()), 'Not whitelisted');
    // ... executes privileged logic
}`,
      },
      {
        label: '✅ SECURE',
        code: `// Use time-locks or commit-reveal for whitelist changes
#[external(v0)]
fn request_whitelist(ref self: ContractState, addr: ContractAddress) {
    // Change takes effect after a block delay
    let effective_at = get_block_number() + TIMELOCK_DELAY;
    self.pending_whitelist.write(addr, effective_at);
    self.emit(WhitelistRequested { addr, effective_at });
}

#[external(v0)]
fn privileged_action(ref self: ContractState) {
    let caller = get_caller_address();
    let effective_at = self.pending_whitelist.read(caller);
    assert(effective_at != 0 && get_block_number() >= effective_at, 'Not whitelisted');
    // ... executes privileged logic
}`,
      },
    ],
  },
  {
    id: 'storage-layout-upgrade',
    number: '17',
    icon: '🗂️',
    title: 'Storage Layout Break on Upgrade',
    severity: 'HIGH',
    description:
      "When upgrading a contract via replace_class_syscall, the storage layout of the new class must be compatible with the existing on-chain storage. Inserting new storage variables before existing ones shifts all subsequent slots, corrupting the contract's state.",
    impact: 'Silent state corruption, reading wrong values, complete contract malfunction after upgrade.',
    whyCairo:
      "Cairo storage variables are assigned slots based on their order and name via hashing. Unlike Solidity's explicit slot system, Cairo's slot calculation is deterministic but easy to break by reordering. Always append new variables at the end of Storage.",
    tags: ['upgrade', 'storage', 'layout', 'compatibility', 'class-hash'],
    examples: [
      {
        label: '❌ VULNERABLE — inserting before existing vars',
        code: `// Version 1 (deployed)
#[storage]
struct Storage {
    owner: ContractAddress,   // slot A
    balance: u256,            // slot B
}

// Version 2 (upgraded) — BREAKS storage!
#[storage]
struct Storage {
    owner: ContractAddress,   // slot A (ok)
    new_fee: u256,            // NEW — pushes 'balance' to slot C
    balance: u256,            // was slot B, now slot C — reads wrong data!
}`,
      },
      {
        label: '✅ SECURE — append new vars at the end',
        code: `// Version 2 (upgraded) — SAFE
#[storage]
struct Storage {
    owner: ContractAddress,   // slot A — unchanged
    balance: u256,            // slot B — unchanged
    new_fee: u256,            // NEW — appended at end, no collision
}`,
      },
    ],
  },
  {
    id: 'phantom-functions',
    number: '18',
    icon: '👻',
    title: 'Phantom Functions / Interface Mismatch',
    severity: 'HIGH',
    description:
      "When calling an external contract via a dispatcher in Cairo, if the target contract does not implement the expected interface, the call does not automatically revert in all cases. A function selector mismatch can result in a silent no-op or unexpected behavior depending on the contract's fallback handling.",
    impact: 'Silent failures, funds sent to contracts that cannot process them, logic that assumes success when operations did nothing.',
    whyCairo:
      "In EVM, calling a non-existent function reverts or hits the fallback. In Cairo/Starknet, selector dispatch is stricter but interface mismatches at the ABI level (e.g., wrong parameter types) can still cause silent issues when using low-level call patterns. Always validate return values.",
    tags: ['interface', 'dispatcher', 'selector', 'external-call', 'ABI'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `// Assumes contract implements IERC20 — but what if it doesn't?
fn pay_user(ref self: ContractState, token: ContractAddress, user: ContractAddress, amount: u256) {
    let dispatcher = IERC20Dispatcher { contract_address: token };
    // If token is not ERC20-compatible, this may fail silently
    // or revert with a confusing error
    dispatcher.transfer(user, amount);
    // No verification that transfer actually succeeded
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn pay_user(ref self: ContractState, token: ContractAddress, user: ContractAddress, amount: u256) {
    // Validate the token implements the expected interface before calling
    // Option 1: use safe dispatchers that return Option
    let dispatcher = IERC20SafeDispatcher { contract_address: token };
    let result = dispatcher.transfer(user, amount);
    assert(result.is_ok(), 'Transfer call failed');

    // Option 2: check balance before and after
    let balance_before = IERC20Dispatcher { contract_address: token }.balance_of(user);
    IERC20Dispatcher { contract_address: token }.transfer(user, amount);
    let balance_after = IERC20Dispatcher { contract_address: token }.balance_of(user);
    assert(balance_after == balance_before + amount, 'Transfer did not execute');
}`,
      },
    ],
  },
  {
    id: 'randomness',
    number: '19',
    icon: '🎲',
    title: 'Insecure Randomness from Block Hash',
    severity: 'MEDIUM',
    description:
      'Using get_block_hash_syscall() or block metadata (block number, timestamp) as a source of randomness is insecure. Starknet sequencers can influence these values, and block hashes are known before finality.',
    impact: 'Lottery manipulation, NFT rarity gaming, unfair advantage in random-based mechanics.',
    whyCairo:
      "Cairo exposes get_block_hash_syscall() as a native syscall, making it temptingly convenient. Unlike EVM where block.prevrandao has some validity constraints, Cairo's block hash is fully sequencer-influenced. Use Pragma VRF or a commit-reveal scheme instead.",
    tags: ['randomness', 'VRF', 'block-hash', 'sequencer', 'commit-reveal'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn pick_winner(ref self: ContractState) -> ContractAddress {
    // Block hash is known to the sequencer before inclusion
    let block_hash = get_block_hash_syscall(get_block_number() - 1).unwrap();
    let participants_count: u256 = self.participants.len().into();
    let winner_index = block_hash.into() % participants_count;
    *self.participants.at(winner_index.try_into().unwrap())
}`,
      },
      {
        label: '✅ SECURE — Commit-Reveal scheme',
        code: `// Phase 1: participants commit a hash of their secret
fn commit(ref self: ContractState, commitment: felt252) {
    self.commitments.write(get_caller_address(), commitment);
}

// Phase 2: after all commits, reveal and combine
fn reveal(ref self: ContractState, secret: felt252) {
    let caller = get_caller_address();
    let expected = pedersen(secret, caller.into());
    assert(self.commitments.read(caller) == expected, 'Invalid reveal');
    self.revealed_secrets.write(caller, secret);
}

// Randomness derived from XOR of all revealed secrets
fn finalize(ref self: ContractState) -> felt252 {
    // Combine all secrets — no single party controls the outcome
    self.aggregate_randomness()
}`,
      },
    ],
  },
  {
    id: 'price-oracle',
    number: '20',
    icon: '💱',
    title: 'Flash Loan / Single-block Price Oracle',
    severity: 'HIGH',
    description:
      'Reading price data from a DEX spot price within the same block (or transaction) is vulnerable to flash loan manipulation. An attacker can temporarily move the price, exploit the contract logic, and restore the price — all within one transaction.',
    impact: 'Draining lending protocols, minting tokens at below-market prices, exploiting liquidation thresholds.',
    whyCairo:
      "Starknet does not currently support flash loans natively (no callbacks in the same tx like Uniswap V2), but single-block price manipulation via sequential transactions (or within multicall AA batches) is possible. Pragma Oracle provides TWAP (time-weighted average price) feeds — use those instead of spot prices.",
    tags: ['DeFi', 'oracle', 'flash-loan', 'price', 'TWAP', 'Pragma'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn get_collateral_value(ref self: ContractState) -> u256 {
    // Spot price from DEX — manipulable within the same block
    let dex = IDEXDispatcher { contract_address: self.dex_address.read() };
    let (reserve_a, reserve_b) = dex.get_reserves();

    // Instant spot price — an attacker can move reserves before this call
    reserve_b / reserve_a * self.collateral_amount.read(get_caller_address())
}`,
      },
      {
        label: '✅ SECURE — use Pragma TWAP',
        code: `use pragma_lib::abi::{IPragmaABIDispatcher, IPragmaABIDispatcherTrait};

fn get_collateral_value(ref self: ContractState) -> u256 {
    let oracle = IPragmaABIDispatcher { contract_address: self.pragma_address.read() };

    // Request TWAP over last N seconds — manipulation-resistant
    let (price, decimals, _, num_sources) = oracle.get_data_median(
        DataType::SpotEntry('ETH/USD')
    );
    assert(num_sources >= MIN_SOURCES, 'Insufficient oracle sources');

    let normalized_price = price / pow(10, decimals.into());
    normalized_price * self.collateral_amount.read(get_caller_address())
}`,
      },
    ],
  },
  {
    id: 'unbounded-array',
    number: '21',
    icon: '📏',
    title: 'DoS via Unbounded Array Input',
    severity: 'MEDIUM',
    description:
      "Starknet transactions have step limits. Functions that iterate over a user-supplied array without bounding its size can be deliberately called with a massive array to exhaust the transaction's step budget, causing the transaction to fail or making the function unusable.",
    impact: 'Denial of service, contract functions becoming permanently uncallable, griefing attacks.',
    whyCairo:
      "Cairo's felt252 and u256 operations each consume a fixed number of 'steps' (computational units). Unlike EVM gas which is user-adjustable, Starknet's resource meter has hard limits per transaction type. An attacker passing a 10,000-element array to an O(n) function can reliably hit these limits.",
    tags: ['DoS', 'array', 'step-limit', 'gas', 'loop', 'griefing'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[external(v0)]
fn process_batch(ref self: ContractState, items: Array<u256>) {
    // No size limit — attacker passes 10_000 items → exceeds step limit
    let mut i = 0;
    loop {
        if i >= items.len() { break; }
        self.process_item(*items.at(i));
        i += 1;
    };
}`,
      },
      {
        label: '✅ SECURE',
        code: `const MAX_BATCH_SIZE: u32 = 100;

#[external(v0)]
fn process_batch(ref self: ContractState, items: Array<u256>) {
    assert(items.len() <= MAX_BATCH_SIZE, 'Batch too large');

    let mut i = 0;
    loop {
        if i >= items.len() { break; }
        self.process_item(*items.at(i));
        i += 1;
    };
}`,
      },
    ],
  },
  {
    id: 'erc20-approval-race',
    number: '22',
    icon: '🏃',
    title: 'ERC20 Approval Race Condition',
    severity: 'MEDIUM',
    description:
      "The standard ERC20 approve() function has a well-known race condition: if a spender is already approved for N tokens and the owner updates to M tokens, the spender can observe the pending transaction and spend N tokens before the update, then M tokens after — consuming N + M total.",
    impact: 'Double-spending of token allowances, up to N + M tokens transferred instead of intended M.',
    whyCairo:
      "OpenZeppelin's Cairo ERC20 component exposes increase_allowance and decrease_allowance functions specifically to avoid this. Use them instead of calling approve() to change an existing non-zero allowance.",
    tags: ['ERC20', 'approval', 'allowance', 'race-condition', 'token'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `// Owner wants to change Alice's allowance from 100 to 50
// Alice sees the pending tx and quickly spends 100 first
// Then the approve(50) lands — Alice spends 50 more = 150 total

// Owner calls:
token.approve(alice, 50);  // Was 100, now setting to 50

// Alice front-runs and calls:
token.transfer_from(owner, alice, 100);  // Spends old allowance
// Then after approve confirms:
token.transfer_from(owner, alice, 50);   // Spends new allowance`,
      },
      {
        label: '✅ SECURE',
        code: `// Option 1: Reset to 0 first, then set new value
token.approve(alice, 0);
token.approve(alice, new_amount);

// Option 2 (preferred): use increase/decrease allowance
// To reduce from 100 to 50:
token.decrease_allowance(alice, 50);

// To increase from 100 to 150:
token.increase_allowance(alice, 50);

// In Cairo with OpenZeppelin ERC20 component:
fn decrease_allowance(ref self: ContractState, spender: ContractAddress, subtracted_value: u256) -> bool {
    self.erc20._decrease_allowance(spender, subtracted_value)
}`,
      },
    ],
  },
```

**Step 2: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 3: Commit**

```bash
git add src/data/vulnerabilities.ts
git commit -m "feat: add 8 new Cairo-specific vulnerabilities (15-22)"
```

---

## Task 5: Create patterns, checklist, and tools data

**Files:**
- Create: `src/data/patterns.ts`
- Create: `src/data/checklist.ts`
- Create: `src/data/tools.ts`

**Step 1: Create patterns.ts**

```ts
// src/data/patterns.ts
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
```

**Step 2: Create checklist.ts**

```ts
// src/data/checklist.ts
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
```

**Step 3: Create tools.ts**

```ts
// src/data/tools.ts
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
```

**Step 4: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add patterns, checklist, and tools data"
```

---

## Task 6: Global styles and theme system

**Files:**
- Create: `src/styles/global.css`

**Step 1: Create global.css**

```css
/* src/styles/global.css */
@import 'tailwindcss';

/* ── Theme: Dark (default) ── */
:root,
[data-theme='dark'] {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-tertiary: #1a2332;
  --bg-code: #0d1117;
  --accent-primary: #00d4ff;
  --accent-secondary: #00ff88;
  --accent-warning: #ff6b35;
  --accent-danger: #ff3860;
  --accent-purple: #a855f7;
  --text-primary: #e4e8ef;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #21293a;
  --border-glow: rgba(0, 212, 255, 0.3);
  --gradient-main: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
  --shadow-glow: 0 0 40px rgba(0, 212, 255, 0.15);
  --bg-card: #111827;
  --bg-card-hover: #1a2332;
  --severity-critical-bg: rgba(255, 56, 96, 0.1);
  --severity-critical-border: rgba(255, 56, 96, 0.3);
  --severity-high-bg: rgba(255, 107, 53, 0.1);
  --severity-high-border: rgba(255, 107, 53, 0.3);
  --severity-medium-bg: rgba(255, 193, 7, 0.1);
  --severity-medium-border: rgba(255, 193, 7, 0.3);
  --severity-low-bg: rgba(0, 255, 136, 0.1);
  --severity-low-border: rgba(0, 255, 136, 0.3);
}

/* ── Theme: Light ── */
[data-theme='light'] {
  --bg-primary: #f0f4f8;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e8edf5;
  --bg-code: #f6f8fa;
  --accent-primary: #0086cc;
  --accent-secondary: #00a855;
  --accent-warning: #d94f00;
  --accent-danger: #cc0032;
  --accent-purple: #7c3aed;
  --text-primary: #0d1117;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --border-color: #d0d7de;
  --border-glow: rgba(0, 134, 204, 0.2);
  --gradient-main: linear-gradient(135deg, #0086cc 0%, #00a855 100%);
  --shadow-glow: 0 0 40px rgba(0, 134, 204, 0.1);
  --bg-card: #ffffff;
  --bg-card-hover: #f0f4f8;
  --severity-critical-bg: rgba(204, 0, 50, 0.06);
  --severity-critical-border: rgba(204, 0, 50, 0.2);
  --severity-high-bg: rgba(217, 79, 0, 0.06);
  --severity-high-border: rgba(217, 79, 0, 0.2);
  --severity-medium-bg: rgba(146, 112, 0, 0.06);
  --severity-medium-border: rgba(146, 112, 0, 0.2);
  --severity-low-bg: rgba(0, 168, 85, 0.06);
  --severity-low-border: rgba(0, 168, 85, 0.2);
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

body {
  font-family: 'Outfit', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.7;
  min-height: 100vh;
  transition: background 0.2s, color 0.2s;
}

/* Animated background grid */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: -1;
}

[data-theme='light'] body::before {
  background-image:
    linear-gradient(rgba(0, 134, 204, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 134, 204, 0.04) 1px, transparent 1px);
}

code,
pre,
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* ── Print ── */
@media print {
  header,
  aside,
  .no-print {
    display: none !important;
  }

  main {
    margin-left: 0 !important;
    padding-top: 0 !important;
  }

  .card {
    break-inside: avoid;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
  }

  pre,
  code {
    background: #f6f8fa !important;
    color: black !important;
    border: 1px solid #d0d7de;
    white-space: pre-wrap;
  }

  a {
    color: inherit !important;
    text-decoration: underline;
  }
}
```

**Step 2: Update main.tsx to import styles**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Step 3: Verify build**

```bash
pnpm build  # Expected: no errors, dist/ created
```

**Step 4: Commit**

```bash
git add src/styles/global.css src/main.tsx
git commit -m "feat: add global styles with dark/light theme system"
```

---

## Task 7: Create CodeBlock component

**Files:**
- Create: `src/components/CodeBlock.tsx`

**Step 1: Write the component**

```tsx
// src/components/CodeBlock.tsx
import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vscLightPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import type { CodeExample } from '../types'

// Register a basic Cairo language grammar on top of Rust
// (react-syntax-highlighter uses prism which doesn't include Cairo natively)
import { PrismLight as SH } from 'react-syntax-highlighter'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
SH.registerLanguage('cairo', rust)

interface CodeBlockProps {
  example: CodeExample
  isDark: boolean
}

export function CodeBlock({ example, isDark }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(example.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isVulnerable = example.label.includes('VULNERABLE')
  const isSecure = example.label.includes('SECURE')
  const isCaution = example.label.includes('CAUTION')

  const labelColor = isVulnerable
    ? 'text-red-400'
    : isSecure
      ? 'text-green-400'
      : isCaution
        ? 'text-orange-400'
        : 'text-blue-400'

  const borderColor = isVulnerable
    ? 'border-red-500/30'
    : isSecure
      ? 'border-green-500/30'
      : isCaution
        ? 'border-orange-500/30'
        : 'border-blue-500/30'

  const codeStyle = isDark ? vscDarkPlus : vscLightPlus

  return (
    <div
      className={`rounded-lg border ${borderColor} overflow-hidden`}
      style={{ background: 'var(--bg-code)' }}
    >
      {/* Label bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
      >
        <span className={`text-sm font-semibold font-mono ${labelColor}`}>
          {example.label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors no-print"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language="cairo"
        style={codeStyle}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{ style: { fontFamily: "'JetBrains Mono', monospace" } }}
      >
        {example.code}
      </SyntaxHighlighter>
    </div>
  )
}
```

**Step 2: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 3: Commit**

```bash
git add src/components/CodeBlock.tsx
git commit -m "feat: add CodeBlock component with syntax highlight and copy button"
```

---

## Task 8: Create VulnerabilityCard component

**Files:**
- Create: `src/components/VulnerabilityCard.tsx`

**Step 1: Write the component**

```tsx
// src/components/VulnerabilityCard.tsx
import type { Vulnerability } from '../types'
import { CodeBlock } from './CodeBlock'

const SEVERITY_STYLES: Record<string, { badge: string; border: string }> = {
  CRITICAL: {
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    border: 'border-red-500/20',
  },
  HIGH: {
    badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    border: 'border-orange-500/20',
  },
  MEDIUM: {
    badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    border: 'border-yellow-500/20',
  },
  LOW: {
    badge: 'bg-green-500/15 text-green-400 border border-green-500/30',
    border: 'border-green-500/20',
  },
}

interface VulnerabilityCardProps {
  vuln: Vulnerability
  isDark: boolean
}

export function VulnerabilityCard({ vuln, isDark }: VulnerabilityCardProps) {
  const styles = SEVERITY_STYLES[vuln.severity]

  return (
    <div
      id={vuln.id}
      className={`rounded-xl border ${styles.border} p-6 scroll-mt-20 transition-colors`}
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{vuln.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                #{vuln.number}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${styles.badge}`}>
                {vuln.severity}
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {vuln.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {vuln.description}
      </p>

      {/* Impact */}
      {vuln.impact && (
        <div className="mb-4 px-3 py-2 rounded-lg border border-orange-500/20 bg-orange-500/5">
          <span className="text-xs font-bold text-orange-400 mr-2">IMPACT:</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {vuln.impact}
          </span>
        </div>
      )}

      {/* Why Cairo callout — only on new entries */}
      {vuln.whyCairo && (
        <div className="mb-4 px-3 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
          <span className="text-xs font-bold mr-2" style={{ color: 'var(--accent-primary)' }}>
            WHY CAIRO:
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {vuln.whyCairo}
          </span>
        </div>
      )}

      {/* Code examples */}
      <div className="flex flex-col gap-3">
        {vuln.examples.map((example, i) => (
          <CodeBlock key={i} example={example} isDark={isDark} />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/VulnerabilityCard.tsx
git commit -m "feat: add VulnerabilityCard component"
```

---

## Task 9: Create PatternCard component

**Files:**
- Create: `src/components/PatternCard.tsx`

**Step 1: Write the component**

```tsx
// src/components/PatternCard.tsx
import type { Pattern } from '../types'
import { CodeBlock } from './CodeBlock'

interface PatternCardProps {
  pattern: Pattern
  isDark: boolean
}

export function PatternCard({ pattern, isDark }: PatternCardProps) {
  return (
    <div
      id={pattern.id}
      className="rounded-xl border p-6 scroll-mt-20 transition-colors"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{pattern.icon}</span>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {pattern.title}
        </h3>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {pattern.description}
      </p>
      {pattern.examples && pattern.examples.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {pattern.examples.map((example, i) => (
            <CodeBlock key={i} example={example} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/PatternCard.tsx
git commit -m "feat: add PatternCard component"
```

---

## Task 10: Search, filter, and useSearch hook

**Files:**
- Create: `src/hooks/useSearch.ts`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/SeverityFilter.tsx`

**Step 1: Create useSearch hook**

```ts
// src/hooks/useSearch.ts
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

  const clearAll = () => {
    setQuery('')
    setActiveSeverities(new Set())
  }

  return { query, setQuery, activeSeverities, toggleSeverity, filtered, clearAll }
}
```

**Step 2: Create SearchBar**

```tsx
// src/components/SearchBar.tsx
import { X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder="Search vulnerabilities..."
        className="w-full px-4 py-2 pr-8 rounded-lg text-sm outline-none transition-colors"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }}
        aria-label="Search vulnerabilities"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 no-print"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
```

**Step 3: Create SeverityFilter**

```tsx
// src/components/SeverityFilter.tsx
import type { Severity } from '../types'

const SEVERITIES: { value: Severity; label: string; activeClass: string }[] = [
  { value: 'CRITICAL', label: 'Critical', activeClass: 'bg-red-500/20 text-red-400 border-red-500/50' },
  { value: 'HIGH', label: 'High', activeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
  { value: 'MEDIUM', label: 'Medium', activeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  { value: 'LOW', label: 'Low', activeClass: 'bg-green-500/20 text-green-400 border-green-500/50' },
]

interface SeverityFilterProps {
  active: Set<Severity>
  onToggle: (s: Severity) => void
}

export function SeverityFilter({ active, onToggle }: SeverityFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 no-print">
      {SEVERITIES.map(({ value, label, activeClass }) => {
        const isActive = active.has(value)
        return (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`text-xs px-2.5 py-1 rounded-full border font-mono font-semibold transition-colors ${
              isActive
                ? activeClass
                : 'border-transparent'
            }`}
            style={
              isActive
                ? {}
                : { color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }
            }
            aria-pressed={isActive}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
```

**Step 4: Verify typecheck**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 5: Commit**

```bash
git add src/hooks/useSearch.ts src/components/SearchBar.tsx src/components/SeverityFilter.tsx
git commit -m "feat: add search hook, SearchBar, and SeverityFilter components"
```

---

## Task 11: ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.tsx`

**Step 1: Write the component**

```tsx
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors no-print"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

## Task 12: Sidebar component

**Files:**
- Create: `src/components/Sidebar.tsx`

**Step 1: Write the component**

```tsx
// src/components/Sidebar.tsx
import type { Vulnerability, Pattern } from '../types'
import { SearchBar } from './SearchBar'
import { SeverityFilter } from './SeverityFilter'
import type { Severity } from '../types'

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

  return (
    <aside
      className="fixed top-[70px] left-0 bottom-0 w-64 overflow-y-auto border-r no-print"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Search */}
        <SearchBar value={query} onChange={onQueryChange} />

        {/* Severity filter */}
        <SeverityFilter active={activeSeverities} onToggle={onToggleSeverity} />

        {/* Getting started */}
        <nav>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Getting Started
          </p>
          <a
            href="#getting-started"
            onClick={(e) => { e.preventDefault(); scrollTo('getting-started') }}
            className="block text-sm px-2 py-1 rounded transition-colors hover:text-cyan-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            📖 Overview
          </a>
        </nav>

        {/* Vulnerabilities */}
        <nav>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Vulnerabilities
          </p>
          <div className="flex flex-col gap-0.5">
            {vulnerabilities.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(v.id) }}
                className="block text-xs px-2 py-1 rounded transition-colors hover:text-cyan-400 truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {v.icon} {v.number}. {v.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Patterns */}
        <nav>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Secure Patterns
          </p>
          <div className="flex flex-col gap-0.5">
            {patterns.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(p.id) }}
                className="block text-xs px-2 py-1 rounded transition-colors hover:text-cyan-400 truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {p.icon} {p.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Static sections */}
        <nav>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Reference
          </p>
          {[
            { id: 'audit-checklist', label: '✅ Audit Checklist' },
            { id: 'tools', label: '🛠️ Tools & Resources' },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => { e.preventDefault(); scrollTo(id) }}
              className="block text-xs px-2 py-1 rounded transition-colors hover:text-cyan-400"
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add Sidebar with search, filter, and hash navigation"
```

---

## Task 13: Assemble App.tsx

**Files:**
- Create: `src/App.tsx`

**Step 1: Write App.tsx**

```tsx
// src/App.tsx
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

  // Sync theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Handle initial hash scroll
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 h-[70px] flex items-center justify-between px-6 z-50 no-print"
        style={{
          background: 'rgba(10, 14, 23, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔐</span>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Cairo Security Cheatsheet
            </h1>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
            >
              Cairo 2.x
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          <a
            href="https://github.com/mariano-aguero/cairo-security-cheatsheet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
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
      <main className="ml-64 pt-[70px] px-8 py-8 max-w-4xl">
        {/* Getting started */}
        <section id="getting-started" className="mb-16 scroll-mt-20">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Cairo Security Cheatsheet
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            A comprehensive, interactive reference for Cairo 2.x and Starknet smart contract security.
            22 vulnerabilities, 7 secure patterns, and an audit checklist — all with real Cairo code examples.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Zero-Knowledge Proofs', body: 'Cairo generates STARK proofs for execution correctness. Every valid transaction is provable.' },
              { title: 'Linear Memory Model', body: "Memory in Cairo is immutable — variables can be reassigned but underlying slots can't be overwritten." },
              { title: 'Sierra Safety Net', body: "Sierra (Safe Intermediate Representation) ensures every transaction is provable, even reverts. No unprovable states." },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="rounded-xl p-4 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--accent-primary)' }}>{title}</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vulnerabilities */}
        <section id="vulnerabilities" className="mb-16">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Vulnerabilities
            <span className="ml-2 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              ({filtered.length}/{VULNERABILITIES.length})
            </span>
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              No vulnerabilities match your current filter.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {filtered.map((vuln) => (
                <VulnerabilityCard key={vuln.id} vuln={vuln} isDark={isDark} />
              ))}
            </div>
          )}
        </section>

        {/* Secure Patterns */}
        <section id="patterns" className="mb-16">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Secure Patterns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PATTERNS.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} isDark={isDark} />
            ))}
          </div>
        </section>

        {/* Audit Checklist */}
        <section id="audit-checklist" className="mb-16 scroll-mt-20">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Security Audit Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CHECKLIST.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border p-5"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>{category.icon}</span> {category.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-0.5 text-green-400 flex-shrink-0">☐</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="mb-16 scroll-mt-20">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Tools & Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border p-4 transition-colors hover:border-cyan-500/40 block"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{tool.icon}</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>
                    {tool.name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t text-xs no-print" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          Made for the Starknet community •{' '}
          <a href="https://github.com/mariano-aguero/cairo-security-cheatsheet" className="hover:text-cyan-400 transition-colors">
            GitHub
          </a>{' '}
          •{' '}
          <a href="https://docs.starknet.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
            Starknet Docs
          </a>
        </footer>
      </main>
    </div>
  )
}
```

**Step 2: Verify typecheck + build**

```bash
pnpm typecheck   # Expected: no errors
pnpm build       # Expected: dist/ created successfully
```

**Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: assemble App with full layout, search, filter, theme, and hash nav"
```

---

## Task 14: Final verification

**Step 1: Run local preview**

```bash
pnpm dev
# Open http://localhost:5173/cairo-starknet-security-cheatsheet/
# Verify:
# - All 22 vulnerabilities render
# - Search filters in real time
# - Severity filter pills work
# - Copy buttons copy code to clipboard
# - Dark/light toggle persists on reload
# - Clicking sidebar links scrolls and updates URL hash
# - Loading with #reentrancy in URL scrolls to that section
# - Print preview (Cmd+P) hides sidebar and UI chrome
```

**Step 2: Production build check**

```bash
pnpm build
pnpm preview
# Verify at http://localhost:4173/cairo-starknet-security-cheatsheet/
```

**Step 3: Typecheck clean**

```bash
pnpm typecheck  # Expected: no errors
```

**Step 4: Final commit + push**

```bash
git add -A
git commit -m "chore: final verification pass"
git push origin main
# GitHub Actions will build and deploy automatically
```

**Step 5: Verify live site**

After the Actions run completes (~2-3 min), check:
`https://mariano-aguero.github.io/cairo-starknet-security-cheatsheet/`

---

## Execution Notes

- The `base` in `vite.config.ts` must match the GitHub Pages sub-path exactly: `/cairo-starknet-security-cheatsheet/`
- `react-syntax-highlighter` Prism edition (`dist/esm/prism`) is used — not the Highlight.js edition — to avoid CDN dependency
- Cairo language is registered as an alias of Rust grammar, which covers ~90% of syntax correctly (both languages share `fn`, `let`, `impl`, `trait`, `use`, `match` etc.)
- Tailwind v4 uses `@import 'tailwindcss'` — not the v3 `@tailwind base/components/utilities` directives
- The `data-theme` attribute on `<html>` drives all CSS variable switches — no JS class toggling needed
