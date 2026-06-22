---
"graz": patch
---

Modernize the published package without changing the public API: bundle `p-map` into the CJS/ESM outputs so the package imports correctly in CJS consumers, preserve the existing generated-chain publish policy, and upgrade runtime dependencies (`@keplr-wallet/*` 0.13, `@walletconnect/*` 2.23, `zustand` 5.0.14, `long` 5) with CosmJS 0.39 compatibility.
