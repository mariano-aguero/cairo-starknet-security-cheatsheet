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
  {
    id: 'signature-replay',
    number: '15',
    icon: '🎭',
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

    // transaction_hash includes nonce + chain_id + version in Starknet
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
        code: `// Use time-locks for whitelist changes
#[external(v0)]
fn request_whitelist(ref self: ContractState, addr: ContractAddress) {
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
      "In EVM, calling a non-existent function reverts or hits the fallback. In Cairo/Starknet, selector dispatch is stricter but interface mismatches at the ABI level can still cause silent issues when using low-level call patterns. Always validate return values with SafeDispatcher.",
    tags: ['interface', 'dispatcher', 'selector', 'external-call', 'ABI'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `fn pay_user(ref self: ContractState, token: ContractAddress, user: ContractAddress, amount: u256) {
    let dispatcher = IERC20Dispatcher { contract_address: token };
    // If token is not ERC20-compatible, this may fail silently
    dispatcher.transfer(user, amount);
    // No verification that transfer actually succeeded
}`,
      },
      {
        label: '✅ SECURE',
        code: `fn pay_user(ref self: ContractState, token: ContractAddress, user: ContractAddress, amount: u256) {
    // Use SafeDispatcher — returns Result instead of panicking
    let dispatcher = IERC20SafeDispatcher { contract_address: token };
    let result = dispatcher.transfer(user, amount);
    assert(result.is_ok(), 'Transfer call failed');
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

// Randomness derived from combination of all revealed secrets
fn finalize(ref self: ContractState) -> felt252 {
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
      'Reading price data from a DEX spot price within the same block is vulnerable to manipulation. An attacker can temporarily move the price, exploit the contract logic, and restore the price — all within one transaction batch.',
    impact: 'Draining lending protocols, minting tokens at below-market prices, exploiting liquidation thresholds.',
    whyCairo:
      "Starknet does not currently support flash loans natively, but single-block price manipulation via sequential transactions (or within multicall AA batches) is possible. Pragma Oracle provides TWAP feeds — use those instead of spot prices.",
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

    // Request TWAP — manipulation-resistant
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
      "Starknet transactions have step limits. Functions that iterate over a user-supplied array without bounding its size can be deliberately called with a massive array to exhaust the transaction's step budget, causing the function to fail or become permanently uncallable.",
    impact: 'Denial of service, contract functions becoming permanently uncallable, griefing attacks.',
    whyCairo:
      "Cairo's felt252 and u256 operations each consume a fixed number of 'steps' (computational units). Unlike EVM gas which is user-adjustable, Starknet's resource meter has hard limits per transaction type. An attacker passing a 10,000-element array to an O(n) function can reliably hit these limits.",
    tags: ['DoS', 'array', 'step-limit', 'gas', 'loop', 'griefing'],
    examples: [
      {
        label: '❌ VULNERABLE',
        code: `#[external(v0)]
fn process_batch(ref self: ContractState, items: Array<u256>) {
    // No size limit — attacker passes 10_000 items -> exceeds step limit
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
      "The standard ERC20 approve() function has a known race condition: if a spender is already approved for N tokens and the owner updates to M tokens, the spender can spend N tokens before the update, then M tokens after — consuming N + M total.",
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
]
