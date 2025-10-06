# graz

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
