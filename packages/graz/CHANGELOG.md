# graz

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
