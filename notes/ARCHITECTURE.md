# Graz Architecture

Graz is a React hooks library for Cosmos wallet and client-side chain interactions.

## Package Shape

- `packages/graz/src/index.ts` is the public export surface.
- `actions/` contains framework-agnostic wallet, chain, and transaction logic.
- `hooks/` wraps actions and clients with TanStack Query.
- `provider/` configures Graz and subscribes to wallet events.
- `store/` holds persisted Zustand state.
- `types/` defines public hook, wallet, and utility types.
- `utils/multi-chain.ts` centralizes single-chain and multi-chain result handling.

## Runtime Flow

1. `GrazProvider` calls `configureGraz()` with chains, wallet options, and reconnect settings.
2. Actions read/write Zustand stores and call wallet adapters.
3. Hooks expose actions and queries to React consumers.
4. Wallet adapters normalize Keplr, Leap, Cosmostation, WalletConnect, Para, MetaMask Snap, and other wallet APIs behind the `Wallet` interface.

## State

- `GrazInternalStore` persists configuration, wallet type, chain metadata, reconnect settings, WalletConnect config, Para config, iframe options, and multi-chain concurrency.
- `GrazSessionStore` persists active accounts, active chain IDs, connection status, wallet pings, WalletConnect clients, and Para connector session data.

## Multi-Chain API

- Hooks accept `chainId` as a string, tuple, or omitted value.
- Tuple `chainId` inputs preserve typed `Record<chainId, result>` inference.
- `UseMultiChainQueryResult` and `createMultiChainAsyncFunction()` keep sync and async hook behavior consistent.

## Build Outputs

- `pnpm graz build` builds `dist/index.{js,mjs,d.ts,d.mts}` and `dist/cli.js`.
- The same build generates `packages/graz/chains/index.{js,mjs,ts}` for the `graz/chains` export.
- Generated chain files are gitignored but included in package publishing through `packages/graz/package.json#files`.
