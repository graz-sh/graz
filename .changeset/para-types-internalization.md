---
"graz": minor
---

Internalize Para types and improve wallet integration

- Expose `ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaModalProps`, and `ParaGrazConnector` types directly from graz package
- Remove `@getpara/graz-connector` and `@getpara/graz-integration` from dependencies (now use dynamic imports)
- Users can now import Para types directly: `import { type ParaGrazConfig } from "graz"`
- Fix TypeScript compatibility issues with string methods (replace `replaceAll` with `replace` for ES2020)
- Update documentation with new Para integration guide

