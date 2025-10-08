---
sidebar_position: 8
---

# Changelog

## Version 0.4.0 (Unified Multi-Chain API & Performance)

### ⚠️ Breaking Changes

#### Unified Multi-Chain API

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

**Benefits:**
- **Consistency** - One pattern for all hooks
- **Type Safety** - Better TypeScript inference with exact types
- **Predictability** - Always know what format data will be in
- **Simplicity** - Fewer parameters to remember
- **Clarity** - Explicit `senderAddress` makes data flow clearer

### 🔒 Security Updates

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

### ⚡️ Build System Improvements

- **Faster builds**: Production build time reduced by 25% (5.2s → 3.9s)
- **Instant dev rebuilds**: Development rebuild time reduced by 87% (5.2s → 0.7s)
- **Smaller package**: Package size reduced by 72% (800 KB → 220 KB)
- **TypeScript optimizations**:
  - Enabled incremental compilation for faster rebuilds
  - DTS generation optimized (resolve: false)
  - DTS size reduced by 43% (87 KB → 49 KB)
- **Better minification**: Upgraded to Terser for improved compression
- **Removed source maps in production**: Saves 476 KB in package size

### 📚 Documentation

- Added comprehensive migration guide
- Updated all hook documentation for new multi-chain API
- Updated multi-chain guide
- Updated getting started guide
- All example applications updated to demonstrate new API

### 🛠️ Developer Experience

- Watch mode now skips DTS generation for instant hot-reload
- TypeScript build cache improves incremental compilation
- Optimized for modern browsers (ES2020 target)

## Version 0.1.26

- Wallet connect modal uses `@walletconnect/modal` instead of deprecated `web3modal`
- Renamed prop `walletConnect.web3Modal` to `walletConnect.walletConnectModal`

## Version 0.1.19

- Added Compass wallet integration

## Version 0.1.18

- Added Wallet connect mobile clot integration
- Fix signing client hooks client side error

## Version 0.1.16

- Bump capsule deps

## Version 0.1.15

- Fetch all keys from wallet instead of transforming bech32

## Version 0.1.14

- Support iframe autoconnect

## version 0.1.13

- Support iframe connection

## Version 0.1.9

- graz cli fix null `gasPriceStep`

## Version 0.1.8

- Added [Metamask Snap Cosmos](https://github.com/cosmos/snap) integration

## Version 0.1.7

- Fix Metamask Snap Leap when signing

## Version 0.1.6

- Added capsule wallet integration
- `walletDefaultOptions` param in `GrazProvider` for setting default options for wallet.
- Added `useCapsule` hook for leap login capsule ui
- `denom` in `useBalance` param is now optional

## Version 0.1.5

- Fix typing on SigningClient hooks for single chain `opts` param

## Version 0.1.4

- Improve `useChainInfos` and `useChainInfo` to return `ChainInfo` object from `GrazProvider` with given `chainId`
- Added Actions `getChainInfos` and `getChainInfo` to retrieve `ChainInfo` object from `GrazProvider` with given `chainId`
- Improve wallet connect `getKey`
- Improve Metamask Snap if okxwallet inject ethereum object to window

## Version 0.1.3

- ✅ Added `signArbitrary` to `Wallet` type
- ✅ Added XDefi wallet integration

## Version 0.1.2

- Various bug fixes for Wallet Connect

## Version 0.1.1

- ✅ Added Station Wallet integration

## Version 0.1.0

- Multi Chain experience
- Removed `GrazChain` type
- Reworked `GrazProvider`
- Roworked most of the hooks

Read migration guide [here](./migration-guide/#010-breaking-changes)

## Version 0.0.51

- Fix Wallet Connect multiple prompt when connect in mobile
- Added `isWalletConnect` to check walletType is using Wallet Connect or not

## Version 0.0.50

- MetaMask Snap: Remove Flask flag, you can now use MetaMask wallet for MetaMask Snap.
- Fix `suggestChain` (`useSuggestChain`), `suggestAndConnect` (`useSuggestChainAndConnect`) for MetaMask Snap
- Change `suggestChain` param to object param
  ```ts
  {
    chainInfo: ChainInfo;
    walletType: WalletType;
  }
  ```
- Removed `signerOpts` param in `connect` and `connectAsync` from `useConnect`
- Removed `signerOpts` param in `suggestChainAndConnect` and `suggestChainAndConnectAsync` from `useSuggestChainAndConnect`

## Version 0.0.49

- Fix client side error
- Fix wallet not found error
- Add experimentalSuggestChain to metamask snap

## Version 0.0.48

- Added Wallet integration Metamask Snap for Leap Cosmos 🐺🐸
- Fix: refetch `useBalance`
- Feat: `useBalance` if no address passed will use current connected account
- Feat: `useCosmWasmSigningClient` and `useCosmwasmTmSigningClient` now prefilled with gas price from chain state

## Version 0.0.45

- Reworked connect: connect not creating offline signers, clients and signing clients

- Added Actions:

  - `getOfflineSigners`

- Removed Actions:

  - `createClients`
  - `createSigningClients`
  - `createQueryClient`
  - `getBalances`
  - `getBalanceStaked`

- Breaking Change:

  - `useSendTokens` - added mutation param `signingClient?: SigningStargateClient | SigningCosmWasmClient`
  - `useSendIbcTokens` - added mutation param `signingClient?: SigningStargateClient`
  - `useInstantiateContract` - added mutation param `signingClient?: SigningCosmWasmClient`
  - `useExecuteContract` - added mutation param `signingClient?: SigningCosmWasmClient`
  - `getQuerySmart` - added param `client?: CosmWasmClient`
  - `getQueryRaw` - added param `client?: CosmWasmClient`

- Improved `useBalances` returning all balances from an account not from provided chainInfo(`GrazChain`)

- Added Hooks:

  - `useStargateClient`
  - `useCosmwasmClient`
  - `useTendermintClient`
  - `useStargateSigningClient`
  - `useStargateTmSigningClient`
  - `useCosmWasmSigningClient`
  - `useCosmwasmTmSigningClient`

- Removed Hooks:
  - `useClients`
  - `useSigningClients`
  - `useQueryClient`

## Version 0.0.44

- ✅ Added Vectis Wallet integration

## Version 0.0.43

- ✅ Added `useActiveWalletType` hook

## Version 0.0.42

- ✅ [WalletConnect v2 support](./wallet-connect.md)
- ✅ Added more `WalletType` for connecting WalletConnect wallets
- 🗑️ Deprecated constants, will be removed in next version `mainnetChains`, `mainnetChainsArray`, `testnetChains`, `testnetChainsArray`. Use [`graz generate`](./generate-chain-info.md)👍
- 🛠️ Splitted internal store between user session and graz internal
