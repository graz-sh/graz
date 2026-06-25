# Refactoring Guide: Graz Modularization

## Overview

This document outlines the plan to refactor Graz from a monolithic package into a modular architecture with separate packages for core, React bindings, and wallet connectors.

## Goals

1. **Smaller Bundle Sizes**: Users only import what they need
2. **Framework Portability**: Core can be used with Vue, Svelte, etc.
3. **Independent Versioning**: Connectors can update independently
4. **Easier Maintenance**: Smaller, focused packages
5. **Better Tree-Shaking**: Remove unused code automatically

## Target Architecture

```
@graz-sh/
├── core                    # Framework-agnostic core
│   ├── actions
│   ├── stores
│   ├── utils
│   └── types
├── react                   # React-specific hooks
│   ├── hooks
│   ├── provider
│   └── components
└── connectors
    ├── keplr
    ├── leap
    ├── cosmostation
    ├── wallet-connect
    ├── vectis
    ├── station
    ├── xdefi
    ├── compass
    ├── initia
    ├── okx
    ├── para
    └── cosmiframe
```

---

## Package Structure

### 1. @graz-sh/core

**Purpose:** Framework-agnostic core functionality

**Contents:**

- Actions (connect, disconnect, sign, send)
- Store logic (Zustand stores)
- Multi-chain utilities
- Type definitions
- Constants

**Exports:**

```typescript
// @graz-sh/core
export { connect, disconnect, reconnect } from "./actions/account";
export { sendTokens, sendIbcTokens, executeContract } from "./actions/methods";
export { configureGraz } from "./actions/configure";
export { useGrazInternalStore, useGrazSessionStore } from "./store";
export { createMultiChainAsyncFunction } from "./utils/multi-chain";
export type { ConnectArgs, ConnectResult, Wallet } from "./types";
```

**Dependencies:**

- `zustand` - State management
- `@cosmjs/stargate` - Cosmos SDK client
- `@cosmjs/cosmwasm-stargate` - CosmWasm client
- `@keplr-wallet/types` - Wallet types
- `p-map` - Parallel execution

**Bundle Size Target:** < 80 KB minified

---

### 2. @graz-sh/react

**Purpose:** React hooks and components

**Contents:**

- All hooks (useAccount, useConnect, useBalance, etc.)
- GrazProvider
- GrazEvents
- React utilities

**Exports:**

```typescript
// @graz-sh/react
export { useAccount, useConnect, useDisconnect } from "./hooks/account";
export { useBalance, useBalances } from "./hooks/balance";
export { useSendTokens, useExecuteContract } from "./hooks/methods";
export { GrazProvider } from "./provider";
export { useWalletConnector } from "./hooks/connector";
```

**Dependencies:**

- `@graz-sh/core` - Core functionality
- `react` - React framework
- `@tanstack/react-query` - Data fetching

**Peer Dependencies:**

- `react` >= 17
- `@tanstack/react-query` >= 4

**Bundle Size Target:** < 50 KB minified

---

### 3. @graz-sh/connector-\* (Individual Connectors)

**Purpose:** Wallet-specific adapters as separate packages

**Example: @graz-sh/connector-keplr**

**Contents:**

```typescript
// packages/connectors/keplr/src/index.ts
import type { Wallet } from "@graz-sh/core";

export const getKeplr = (): Wallet => {
  if (typeof window.keplr === "undefined") {
    throw new Error("Keplr wallet not found");
  }

  const subscription = (reconnect: () => void) => {
    const listener = () => reconnect();
    window.addEventListener("keplr_keystorechange", listener);
    return () => window.removeEventListener("keplr_keystorechange", listener);
  };

  return Object.assign(window.keplr, { subscription });
};

export const keplrConnector = {
  id: "keplr" as const,
  name: "Keplr",
  getWallet: getKeplr,
  downloadUrl: "https://www.keplr.app/download",
};
```

**Dependencies:**

- `@graz-sh/core` - Core types
- `@keplr-wallet/types` - Keplr types

**Bundle Size Target:** < 5 KB minified per connector

---

## Migration Plan

### Phase 1: Preparation (2 weeks)

1. **Create New Package Structure**

   ```bash
   mkdir -p packages/{core,react,connectors/{keplr,leap,cosmostation}}
   ```

2. **Set Up Build Configuration**
   - Configure `tsup` for each package
   - Set up `tsconfig.json` with project references
   - Update `turbo.json` for build pipeline

3. **Create Package Manifests**
   ```json
   // packages/core/package.json
   {
     "name": "@graz-sh/core",
     "version": "2.0.0-alpha.1",
     "main": "./dist/index.js",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.mjs",
         "require": "./dist/index.js",
         "types": "./dist/index.d.ts"
       }
     }
   }
   ```

### Phase 2: Core Extraction (2 weeks)

1. **Move Actions to Core**
   - Copy `src/actions/` to `packages/core/src/actions/`
   - Remove React-specific code
   - Update imports

2. **Move Stores to Core**
   - Copy `src/store/` to `packages/core/src/store/`
   - Ensure no React dependencies

3. **Move Utils to Core**
   - Copy `src/utils/` to `packages/core/src/utils/`
   - Test all utilities

4. **Move Types to Core**
   - Copy `src/types/` to `packages/core/src/types/`
   - Export all types

5. **Test Core Package**
   - Write unit tests for actions
   - Ensure no framework dependencies
   - Verify TypeScript types

### Phase 3: React Package (1 week)

1. **Move Hooks to React**
   - Copy `src/hooks/` to `packages/react/src/hooks/`
   - Update imports to use `@graz-sh/core`

2. **Move Provider to React**
   - Copy `src/provider/` to `packages/react/src/provider/`
   - Update dependencies

3. **Test React Package**
   - Write tests for hooks
   - Test with example app
   - Verify React Query integration

### Phase 4: Connector Extraction (2 weeks)

1. **Create Connector Packages**
   - One package per wallet type
   - Implement connector interface
   - Add wallet-specific logic

2. **Update Core to Support Connectors**

   ```typescript
   // packages/core/src/actions/wallet/registry.ts
   const connectorRegistry = new Map<string, WalletConnector>();

   export const registerConnector = (connector: WalletConnector) => {
     connectorRegistry.set(connector.id, connector);
   };

   export const getWallet = (id: string): Wallet => {
     const connector = connectorRegistry.get(id);
     if (!connector) {
       throw new Error(`Connector ${id} not registered`);
     }
     return connector.getWallet();
   };
   ```

3. **Create Connector Bundles**
   - Individual packages for each wallet
   - Meta-package with all connectors

### Phase 5: Backward Compatibility (1 week)

1. **Create Compatibility Package**

   ```typescript
   // packages/graz/src/index.ts (compatibility layer)
   export * from "@graz-sh/core";
   export * from "@graz-sh/react";

   // Auto-register all connectors
   import { keplrConnector } from "@graz-sh/connector-keplr";
   import { leapConnector } from "@graz-sh/connector-leap";
   // ... all connectors

   registerConnector(keplrConnector);
   registerConnector(leapConnector);
   // ... register all
   ```

2. **Add Deprecation Warnings**
   ```typescript
   console.warn(
     'The "graz" package is deprecated. ' +
       "Please migrate to @graz-sh/core and @graz-sh/react. " +
       "See migration guide: https://graz.sh/docs/migration-guide",
   );
   ```

### Phase 6: Documentation & Migration (1 week)

1. **Write Migration Guide**
   - Before/after examples
   - Step-by-step instructions
   - Troubleshooting

2. **Update Documentation**
   - New installation instructions
   - Updated examples
   - API reference

3. **Update Example Apps**
   - Migrate to new packages
   - Show best practices
   - Demonstrate connector usage

### Phase 7: Release (1 week)

1. **Alpha Release**
   - Publish `2.0.0-alpha.1`
   - Gather feedback
   - Fix issues

2. **Beta Release**
   - Publish `2.0.0-beta.1`
   - Stabilize APIs
   - Update documentation

3. **Stable Release**
   - Publish `2.0.0`
   - Announce on social media
   - Update ecosystem

**Total Timeline:** ~10 weeks

---

## API Changes

### Before (v1.x)

```typescript
import { GrazProvider, useConnect, useAccount } from 'graz';

<GrazProvider grazOptions={{ chains }}>
  <App />
</GrazProvider>

function App() {
  const { connect } = useConnect();
  const { data: account } = useAccount();

  await connect({ chainId: 'cosmoshub-4' });
}
```

### After (v2.x) - Recommended

```typescript
import { GrazProvider, useConnect, useAccount } from '@graz-sh/react';
import { keplrConnector } from '@graz-sh/connector-keplr';
import { leapConnector } from '@graz-sh/connector-leap';

<GrazProvider
  grazOptions={{
    chains,
    connectors: [keplrConnector, leapConnector]
  }}
>
  <App />
</GrazProvider>

function App() {
  const { connect } = useConnect();
  const { data: account } = useAccount();

  await connect({ chainId: 'cosmoshub-4', connector: 'keplr' });
}
```

### After (v2.x) - Backward Compatible

```typescript
// Still works with compatibility package
import { GrazProvider, useConnect, useAccount } from "graz";
// Automatically includes all connectors
```

---

## Bundle Size Improvements

### Current (v0.3.x)

```
graz: ~107 KB (CJS, unminified, includes all wallet connectors)
```

### After Modularization (v2.x) - Projected

```
@graz-sh/core:              ~50 KB
@graz-sh/react:             ~30 KB
@graz-sh/connector-keplr:    ~5 KB
@graz-sh/connector-leap:     ~5 KB
-------------------------------------------
Total (core + react + 2 wallets): ~90 KB
Savings: ~17 KB (16% reduction)

With 1 wallet: ~85 KB (21% reduction)
With 5 wallets: ~105 KB (2% reduction)
With all wallets: ~107 KB (same as current)
```

**Key Benefit:** Users who only need 1-2 wallets can significantly reduce bundle size. All users benefit from better tree-shaking.

---

## Breaking Changes

### 1. Package Name

**Before:**

```typescript
import { useConnect } from "graz";
```

**After:**

```typescript
import { useConnect } from "@graz-sh/react";
```

### 2. Connector Registration

**Before:**

```typescript
await connect({ walletType: WalletType.KEPLR });
```

**After:**

```typescript
import { keplrConnector } from '@graz-sh/connector-keplr';

<GrazProvider connectors={[keplrConnector]} />

await connect({ connector: 'keplr' });
```

### 3. Wallet Type Enum

**Before:**

```typescript
import { WalletType } from "graz";
WalletType.KEPLR;
```

**After:**

```typescript
import { keplrConnector } from "@graz-sh/connector-keplr";
keplrConnector.id; // 'keplr'
```

---

## Rollout Strategy

### Option 1: Big Bang (v2.0)

- Release all packages at once
- Clear cut from v1 to v2
- Comprehensive migration guide

**Pros:**

- Clean break
- No confusion

**Cons:**

- Disruptive to users
- High migration effort

### Option 2: Gradual Migration (Recommended)

**Step 1:** Release new packages alongside `graz`

- `@graz-sh/core` - v2.0.0
- `@graz-sh/react` - v2.0.0
- `@graz-sh/connector-*` - v2.0.0
- `graz` - v1.15.0 (compatibility wrapper)

**Step 2:** Encourage migration over 6 months

- Documentation updates
- Blog posts
- Community support

**Step 3:** Deprecate `graz` package

- Mark as deprecated on npm
- Add console warnings
- Provide migration tooling

**Step 4:** Sunset `graz` package (12 months after v2.0)

- Stop updates to v1.x
- Archive old package
- Redirect to new packages

---

## Testing Strategy

1. **Unit Tests**: Test each package independently
2. **Integration Tests**: Test packages working together
3. **Example Apps**: Migrate examples to new packages
4. **Bundle Size Tests**: Verify size improvements
5. **Type Tests**: Ensure TypeScript types work correctly

---

## Documentation Updates

1. **Installation Guide**: Update for new packages
2. **API Reference**: Separate docs for each package
3. **Migration Guide**: Detailed v1 → v2 instructions
4. **Examples**: Update all code samples
5. **Troubleshooting**: Common migration issues

---

## Success Metrics

1. **Bundle Size**: > 20% reduction for typical use cases
2. **Adoption**: > 50% of users on v2 within 6 months
3. **Issues**: < 10 migration-related issues per month
4. **Performance**: No regression in performance metrics
5. **Satisfaction**: Positive community feedback

---

## Risks & Mitigation

### Risk 1: Breaking Changes Break Users

**Mitigation:**

- Provide compatibility package
- Comprehensive migration guide
- Automated migration tooling (codemod)
- Long deprecation period

### Risk 2: Bundle Size Doesn't Improve Enough

**Mitigation:**

- Measure before/after
- Optimize each package
- Provide size comparison tool
- Document size improvements

### Risk 3: Fragmentation of Ecosystem

**Mitigation:**

- Clear naming conventions
- Centralized documentation
- Meta-packages for convenience
- Active community support

### Risk 4: Maintenance Burden Increases

**Mitigation:**

- Shared build configuration
- Automated releases with changesets
- Clear ownership model
- Community contributions

---

## Related Documents

- [PROPOSALS.md](./PROPOSALS.md) - Feature proposals (migrated to [GitHub Issues](https://github.com/graz-sh/graz/issues?q=label%3Aenhancement+label%3ARFC))
- [IMPROVEMENT_SUMMARY.md](./IMPROVEMENT_SUMMARY.md) - Overall progress
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Testing approach
- [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) - Performance work
