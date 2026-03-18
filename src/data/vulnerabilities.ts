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
    icon: '🔐',
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
