---
sidebar_position: 8
---

# Changelog

## version 0.0.50

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
