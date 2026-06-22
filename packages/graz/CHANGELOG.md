# graz

## 0.5.0

### Minor Changes

- 8296c48: Add automated library coverage and browser integration testing for Graz, including Vitest coverage across core actions, hooks, providers, wallet adapters, and utilities plus a Playwright harness with an injected Keplr-compatible wallet for connection, signer, and client flows.

## 0.4.3

### Patch Changes

- 1e7078a: Modernize the published package without changing the public API: bundle `p-map` into the CJS/ESM outputs so the package imports correctly in CJS consumers, preserve the existing generated-chain publish policy, and upgrade runtime dependencies (`@keplr-wallet/*` 0.13, `@walletconnect/*` 2.23, `zustand` 5.0.14, `long` 5) with CosmJS 0.39 compatibility.
- d417391: Update documentation to match the current API and tooling: fix the `QueryClientProvider` prop and multi-chain `useAccount` usage in the root README quick start, add the missing `@cosmjs/amino` peer dependency and `Cactus` wallet to the supported list, and refresh example/docs READMEs (Next.js 16, Docusaurus 3 with pnpm, corrected env setup, and legacy notes links).

## 0.4.2

### Patch Changes

- d7717cd: Implement comprehensive logging system
- 02324c2: bump react deps

## 0.4.1

### Patch Changes

- b37bcb2: ## Para Wallet Improvements

  ### Breaking Changes
  - **Para wallet now requires `connectorClass`**: The `ParaGrazConfig` interface now requires the `connectorClass` property to be explicitly provided. This eliminates dynamic import issues and provides better error messages.

  ### Improvements
  - **Simplified Para wallet implementation**: Removed complex dynamic import logic in favor of explicit connector class provision
  - **Better error messages**: More specific error messages when `connectorClass` is missing
  - **Improved performance**: No runtime dynamic imports, faster initialization
  - **Better tree-shaking**: Unused Para packages are automatically excluded from bundle
  - **Easier debugging**: Direct imports are easier to trace and debug
  - **No module resolution issues**: Eliminates pnpm/Node.js import resolution problems

  ### Migration Guide

  To migrate existing Para wallet implementations:

  **Before:**

  ```typescript
  const paraConfig = {
    paraWeb: para,
    // connectorClass was optional
  };
  ```

  **After:**

  ```typescript
  import { ParaGrazConnector } from "@getpara/graz-integration";

  const paraConfig = {
    paraWeb: para,
    connectorClass: ParaGrazConnector, // Now required
  };
  ```

  ### Documentation Updates
  - Updated Para integration guide with new approach
  - Added benefits section explaining advantages of explicit connector class
  - Updated troubleshooting section to reflect simplified implementation
  - Enhanced type documentation with clearer explanations

## 0.4.0

### Minor Changes

- f2cb59e: Major refactor and improvements for Graz v0.4.0

  ### Core Improvements
  - **Unified Multi-Chain API**: Refactored multi-chain functionality for better consistency and type safety across all hooks and utilities
  - **Enhanced Wallet Integration**: Added comprehensive wallet metadata (name, website, logo) to all wallet adapters for better UI integration
  - **Para Wallet Integration**:
    - Internalized Para types (`ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaModalProps`, `ParaGrazConnector`) directly in graz package
    - Fixed bundler compatibility issues with dynamic imports using Function constructor approach
    - Made `@getpara/graz-integration` an optional peer dependency
    - Users can now import Para types directly: `import { type ParaGrazConfig } from "graz"`

  ### Developer Experience
  - **Enhanced Documentation**: Comprehensive updates to all hook documentation with better examples and multi-chain usage patterns
  - **New Playground Example**: Added advanced Next.js playground example with responsive design and comprehensive wallet connection features
  - **Improved Testing**: Added Vitest testing framework with comprehensive test coverage for utilities and CLI
  - **Better Type Safety**: Enhanced TypeScript types and improved error handling throughout the codebase

  ### Build & Development
  - **CLI Improvements**: Enhanced chain fetching with better error handling and graceful failure recovery
  - **Build Optimization**: Improved build process with better tree-shaking and bundle optimization
  - **Dependency Updates**: Updated to latest compatible versions of all dependencies
  - **ESLint & Prettier**: Added comprehensive linting and formatting configuration

  ### Breaking Changes
  - **Multi-Chain API**: Some multi-chain hook signatures have been updated for better consistency
  - **Para Dependencies**: Para-related packages are now optional peer dependencies instead of direct dependencies
  - **TypeScript**: Minimum TypeScript version requirements updated for better compatibility

  ### Migration
  - See the migration guide in documentation for detailed upgrade instructions
  - Para integration now requires importing types from graz package instead of separate packages
  - Multi-chain hooks have improved type safety and consistency

## 0.4.0-alpha.4

### Patch Changes

- Fix Para wallet integration module resolution issue

  Fixed a bundler issue where Next.js and other bundlers would try to resolve `@getpara/graz-integration` at build time, causing "Module not found" errors. The fix uses a more opaque dynamic import approach that prevents static analysis by bundlers while still allowing runtime loading of the Para connector when needed.

  This change also declares `@getpara/graz-integration` as an optional peer dependency for better package manager awareness.

## 0.4.0-alpha.3

### Minor Changes

- Internalize Para types and improve wallet integration
  - Expose `ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaModalProps`, and `ParaGrazConnector` types directly from graz package
  - Remove `@getpara/graz-connector` and `@getpara/graz-integration` from dependencies (now use dynamic imports)
  - Users can now import Para types directly: `import { type ParaGrazConfig } from "graz"`
  - Fix TypeScript compatibility issues with string methods (replace `replaceAll` with `replace` for ES2020)
  - Update documentation with new Para integration guide

## 0.4.0-alpha.1

### Minor Changes

- Internalize Para types and improve wallet integration
  - Expose `ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaModalProps`, and `ParaGrazConnector` types directly from graz package
  - Remove `@getpara/graz-connector` and `@getpara/graz-integration` from dependencies (now use dynamic imports)
  - Users can now import Para types directly: `import { type ParaGrazConfig } from "graz"`
  - Fix TypeScript compatibility issues with string methods (replace `replaceAll` with `replace` for ES2020)
  - Update documentation with new Para integration guide

## Unreleased

### Minor Changes

- Added wallet metadata to all wallet adapters: Each wallet now includes optional `name`, `website`, and `logo` fields for better UI integration. Access wallet information via `getWallet()` to display wallet names, logos, and official website links in your application.

## 0.4.0-alpha.0

### Minor Changes

- 2d93c6d: Unified Multi-Chain API and Security Updates

  ## Breaking Changes

  ### Unified Multi-Chain API

  The multi-chain API has been refactored for consistency and improved type safety:
  1. **Removed `multiChain` parameter** - All hooks now consistently return `Record<chainId, T>` format
  2. **`chainId` now accepts `string[]` only** - Previously accepted `string | string[]`
  3. **Mutation hooks require explicit `senderAddress`** - `useSendTokens`, `useSendIbcTokens`, `useInstantiateContract`, `useExecuteContract`

  **Migration:**

  ```typescript
  // Before
  const { data: account } = useAccount({ chainId: "cosmoshub-4" });
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"], multiChain: true });

  // After
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const account = accounts?.["cosmoshub-4"];

  // Mutations - now require explicit senderAddress
  const { sendTokensAsync } = useSendTokens();
  await sendTokensAsync({
    signingClient,
    senderAddress: account.bech32Address, // Now required
    recipientAddress: "cosmos1...",
    amount: [{ denom: "uatom", amount: "1000" }],
    fee: "auto",
  });
  ```

  ### Benefits
  - **Consistency** - One pattern for all hooks
  - **Type Safety** - Better TypeScript inference with exact types
  - **Predictability** - Always know what format data will be in
  - **Simplicity** - Fewer parameters to remember
  - **Clarity** - Explicit `senderAddress` makes data flow clearer

  ## Security Updates

  Fixed multiple security vulnerabilities (Dependabot alerts):
  - **Critical**: Updated `ses` from 0.18.4 to >=0.18.7 (fixes arbitrary exfiltration vulnerability)
  - **High**: Updated `trim` to >=0.0.3 (fixes ReDoS vulnerability)
  - **High**: Updated `axios` to >=0.30.2 (fixes SSRF and DoS vulnerabilities)
  - **High**: Updated `next` from 13.5.11 to 14.2.15 in examples (fixes SSRF and authorization bypass)
  - **Moderate**: Updated `got` to >=11.8.5 (fixes redirect to UNIX socket vulnerability)
  - **Moderate**: Updated `esbuild` to >=0.25.0 (fixes SSRF vulnerability)
  - **Moderate**: Updated `webpack-dev-server` to >=5.2.1 (fixes source code theft vulnerabilities)
  - **Moderate**: Updated `vite` to >=5.4.20 (fixes file serving vulnerabilities)
  - Updated `wait-on` to >=7.0.0 for compatibility with newer axios

  All critical, high, and moderate security vulnerabilities have been resolved.

  ## Documentation
  - Added comprehensive migration guide
  - Updated all hook documentation
  - Updated multi-chain guide
  - Updated getting started guide
  - All example applications updated to demonstrate new API

## Unreleased

### Patch Changes

- Enhanced methods hooks (`useSendTokens`, `useSendIbcTokens`, `useExecuteContract`, `useInstantiateContract`) to return all React Query mutation properties. Hooks now provide access to additional utilities like `reset`, `variables`, `context`, `failureCount`, `failureReason`, `isPending`, etc., while maintaining backward compatibility with the existing API.

## 0.3.7

### Patch Changes

- 465f8ac: Updated Para wallet integration with clearer error messages for missing packages. Removed dynamic connector imports and related configs. Added bundler configuration guidance to docs for non-Para wallet users. Cleaned up package.json by removing Para packages as optional peer dependencies to prevent bundlers from auto-installing them. Improved disable() call to be less aggressive—absence of connector now implies disabled state.

## 0.3.6

### Patch Changes

- 4aa2a8c: release latest

## 0.3.5

### Patch Changes

- 25ad685: Add Para embedded wallet integration

## 0.3.4

### Patch Changes

- 4808068: fix useOfflineSigners always propmts user to connect wallet

## 0.3.3

### Patch Changes

- a0608c9: ping on window focus

## 0.3.2

### Patch Changes

- ec1a66c: fix install deps warning

## 0.3.1

### Patch Changes

- fff247b: fix type missmatch

## 0.3.0

### Minor Changes

- df4ed52: move cosmjs deps to peerDeps

### Patch Changes

- 0525070: remove @cosmjs/launchpad package deps
- 406b721: add @cosmjs/encoding as peer dependencies
- 25b5d66: bump zustand v5
- ab7afd7: bump walletconnect deps
- 2fb86fd: bump cosmjs package
- 72fb04d: remove terndermint client
- 50e5e55: remove capsule

## 0.2.6

### Patch Changes

- cd65f2f: This PR enable user to update wallet that connected with wallet connect

## 0.2.5

### Patch Changes

- fa5d0fd: Fixes multi chain connect on non-snaps/dapp browser wallets - bug introduced in 0.2.3

## 0.2.4

### Patch Changes

- 9240d0d: fixes build error

## 0.2.3

### Patch Changes

- 1de0f39: We have updated from `getKey` to `getKeys` for accounts fetching in leap dapp browser as that is much faster.

## 0.2.1

### Patch Changes

- 8e53aa0: Fixes multi connect for leap metamask snaps

## 0.2.0

### Patch Changes

- 775631a: release 0.2.0
