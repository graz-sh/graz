---
"graz": minor
---

Allow WalletConnect `connect()` and `reconnect()` to succeed with the wallet-approved subset of optional Cosmos chains configured in `GrazProvider`.

**Breaking change:** Successful connections may omit requested chains. Applications must check the returned `accounts[chainId]` for each chain required by their operation before proceeding. Public TypeScript signatures remain unchanged.
