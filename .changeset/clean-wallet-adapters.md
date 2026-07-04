---
"graz": minor
---

Refactor browser and mobile WalletConnect adapters around shared wallet factories, while preserving account-change subscription cleanup and async mutation callback sequencing.

This release also removes unused internal logger type aliases and utility modules, replaces the `p-map`, Keplr Cosmos, and Initia registry runtime dependencies with local implementations or types, and simplifies mutation keys. Consumers relying on undocumented deep imports, the removed dependency types, or the previous mutation-key shape may need to update.
