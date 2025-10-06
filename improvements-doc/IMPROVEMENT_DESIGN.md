# Improvement Design Proposals

## Overview

This document outlines design proposals for new features and improvements to the Graz library.

## Proposed Improvements

### 1. Package Modularization

**Status:** Planned
**Priority:** High
**Effort:** Large

#### Problem

The current monolithic package includes all wallet connectors, increasing bundle size for users who only need specific wallets.

#### Proposed Solution

Split into modular packages:

```
@graz-sh/core           - Framework-agnostic core
@graz-sh/react          - React hooks
@graz-sh/connector-keplr
@graz-sh/connector-leap
@graz-sh/connector-cosmostation
@graz-sh/connector-walletconnect
...
```

#### Benefits

- Smaller bundle sizes (tree-shakeable connectors)
- Framework portability (Vue, Svelte, vanilla JS)
- Independent versioning for connectors
- Easier maintenance

#### Implementation Plan

1. Create new package structure
2. Move actions to `@graz-sh/core`
3. Move hooks to `@graz-sh/react`
4. Extract wallet adapters to separate connector packages
5. Create adapter for backward compatibility
6. Update documentation and examples
7. Publish alpha versions for testing
8. Gradual migration path for existing users

---

### 2. Enhanced Logging and Debugging

**Status:** Proposed
**Priority:** Medium
**Effort:** Medium

#### Problem

Debugging wallet connections and transactions is difficult without proper logging infrastructure.

#### Proposed Solution

Add structured logging system with:

- Debug levels (error, warn, info, debug)
- Category-based filtering (wallet, transaction, query)
- Browser extension support
- Performance metrics

#### Example API

```typescript
import { createLogger } from "@graz-sh/core";

const logger = createLogger({
  level: "debug",
  categories: ["wallet", "transaction"],
  enabled: process.env.NODE_ENV === "development",
});

// In code
logger.debug("wallet", "Attempting connection", { walletType, chainId });
logger.error("transaction", "Send failed", { error, amount });
```

#### Benefits

- Better debugging experience
- Production monitoring capability
- Performance tracking
- Easier issue reproduction

---

### 3. Transaction Builder API

**Status:** Proposed
**Priority:** Medium
**Effort:** Medium

#### Problem

Complex transactions require verbose setup and manual fee estimation.

#### Proposed Solution

Fluent transaction builder API:

```typescript
const tx = await createTransaction()
  .from(account.bech32Address)
  .send({ amount: "1000", denom: "uatom", to: recipientAddress })
  .withMemo("Payment for services")
  .withAutoFee()
  .build();

await tx.sign().broadcast();
```

#### Benefits

- Simpler API for common operations
- Automatic fee estimation
- Transaction composition
- Better error messages

---

### 4. Batch Operations Support

**Status:** Proposed
**Priority:** Medium
**Effort:** Small

#### Problem

Sending multiple transactions requires manual loop and coordination.

#### Proposed Solution

```typescript
const results = await useBatchSendTokens({
  transactions: [
    { to: addr1, amount: "100", denom: "uatom" },
    { to: addr2, amount: "200", denom: "uatom" },
    { to: addr3, amount: "300", denom: "uatom" },
  ],
  onProgress: (completed, total) => console.log(`${completed}/${total}`),
});
```

#### Benefits

- Simplified batch operations
- Progress tracking
- Automatic retry logic
- Optimized gas estimation

---

### 5. Wallet Event Subscriptions

**Status:** Proposed
**Priority:** Low
**Effort:** Small

#### Problem

Apps need to react to wallet events but lack unified subscription API.

#### Proposed Solution

```typescript
const unsubscribe = useWalletEvents({
  onAccountChange: (newAccount) => console.log("Account changed"),
  onChainChange: (chainId) => console.log("Chain changed"),
  onDisconnect: () => console.log("Wallet disconnected"),
  onBalanceChange: (balance) => console.log("Balance updated"),
});
```

#### Benefits

- Unified event handling
- Automatic cleanup
- Type-safe events
- Framework-agnostic core

---

### 6. Transaction Simulation

**Status:** Proposed
**Priority:** Low
**Effort:** Medium

#### Problem

Users can't preview transaction results before signing.

#### Proposed Solution

```typescript
const simulation = await useSimulateTransaction({
  type: "send",
  amount: "1000",
  denom: "uatom",
  to: recipientAddress,
});

// simulation.success, simulation.gasUsed, simulation.events
```

#### Benefits

- Prevent failed transactions
- Accurate gas estimation
- Better UX
- Cost savings

---

### 7. Chain Registry Integration

**Status:** Proposed
**Priority:** High
**Effort:** Small

#### Problem

Manually maintaining chain configurations is error-prone and outdated.

#### Proposed Solution

Integrate with [Cosmos Chain Registry](https://github.com/cosmos/chain-registry):

```typescript
import { chainRegistry } from '@graz-sh/core';

<GrazProvider
  chains={await chainRegistry.getChains(['cosmoshub', 'osmosis'])}
>
  <App />
</GrazProvider>
```

#### Benefits

- Always up-to-date chain info
- Standardized chain data
- Reduced maintenance
- Community-driven updates

---

### 8. Enhanced TypeScript Support

**Status:** Partially Implemented
**Priority:** Medium
**Effort:** Medium

#### Current State

TypeScript type inference with const assertions is already implemented:

```typescript
// Type inference with chainId arrays (Already working!)
const { data: accounts } = useAccount({
  chainId: ["cosmoshub-4", "osmosis-1"] as const,
});
// Type: { data?: { "cosmoshub-4": Key, "osmosis-1": Key } }
const cosmosAccount = accounts?.["cosmoshub-4"]; // ✅ Autocomplete works!
const osmosisAccount = accounts?.["osmosis-1"]; // ✅ Autocomplete works!
```

#### Proposed Further Enhancements

```typescript
// Chain-specific address type branding (Future)
const cosmoshub = useAccount<"cosmoshub-4">({ chainId: ["cosmoshub-4"] });
cosmoshub.data["cosmoshub-4"]?.bech32Address; // Type: `cosmos${string}`

// Contract typing (Future)
const result = useExecuteContract<MyContractMsg, MyContractResponse>({
  msg: {
    /* typed */
  },
});
```

#### Benefits

- ✅ Already have: Type inference for multi-chain results with const assertions
- 🔄 Future: Chain-specific address type branding
- 🔄 Future: Contract message type validation
- Improved developer experience with better autocomplete

---

### 9. Offline Mode Support

**Status:** Proposed
**Priority:** Low
**Effort:** Large

#### Problem

Apps can't function when blockchain RPC is down.

#### Proposed Solution

```typescript
<GrazProvider
  offlineMode={{
    enabled: true,
    storage: indexedDB, // Cache queries
    syncInterval: 30000, // Sync when online
  }}
>
```

#### Benefits

- Better UX during outages
- Progressive Web App support
- Reduced RPC load
- Faster load times

---

### 10. Developer Tools Extension

**Status:** Proposed
**Priority:** Low
**Effort:** Large

#### Problem

Debugging Cosmos apps requires multiple tools and browser tabs.

#### Proposed Solution

Browser extension for:

- Wallet state inspection
- Transaction history
- Query cache viewer
- Network request monitoring
- Time-travel debugging

#### Benefits

- Streamlined debugging
- Better developer experience
- Visual state inspection
- Community contribution

---

## Evaluation Criteria

When evaluating proposals, consider:

1. **User Value**: Does it solve real user problems?
2. **API Design**: Is the API intuitive and consistent?
3. **Bundle Size Impact**: Does it increase bundle size?
4. **Breaking Changes**: Does it require migration?
5. **Maintenance Burden**: How much ongoing maintenance?
6. **Community Need**: Is there demand from users?
7. **Implementation Complexity**: Is it feasible?
8. **Performance Impact**: Does it affect performance?

## Contributing Proposals

To propose a new improvement:

1. Open a GitHub issue with the "enhancement" label
2. Use this template structure:
   - Problem statement
   - Proposed solution
   - API examples
   - Benefits
   - Trade-offs
   - Implementation considerations
3. Gather community feedback
4. Create design document here if approved
5. Submit PR with implementation

## References

- [Wagmi Design Patterns](https://wagmi.sh/)
- [TanStack Query Best Practices](https://tanstack.com/query/latest)
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
- [Keplr Wallet API](https://docs.keplr.app/)
