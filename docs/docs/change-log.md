---
sidebar_position: 15
---

# Changelog

## Version 0.0.42

- ✅ [WalletConnect v2 support](./wallet-connect.md)
- ✅ Added more `WalletType` for connecting WalletConnect wallets
- ✨ Improved [`graz cli generate`](./generate-chain-info.mdx) to generate chain info directly from [Cosmos chain registry](https://github.com/cosmos/chain-registry)
- 🗑️ Removed constants `mainnetChains`, `mainnetChainsArray`, `testnetChains`, `testnetChainsArray`. Use [`graz cli generate`](./generate-chain-info.mdx)👍
- 🛠️ Splitted internal store between user session and graz internal
