---
"graz": patch
---

## Para Wallet Improvements

### Breaking Changes

- **Para wallet now requires `connectorClass`**: The `ParaGrazConfig` interface now requires the `connectorClass` property to be explicitly provided. This eliminates dynamic import issues and provides better error messages.

### Improvements

- **Simplified Para wallet implementation**: Removed complex dynamic import logic in favor of explicit connector class provision
- **Better error messages**: More specific error messages when `connectorClass` is missing
- **Improved performance**: No runtime dynamic imports, faster initialization
- **Better tree-shaking**: Unused Para packages are automatically excluded from bundle
- **Easier debugging**: Direct imports are easier to trace and debug
- **No module resolution issues**: Eliminates pnpm/Node.js import resolution problems

### Migration Guide

To migrate existing Para wallet implementations:

**Before:**

```typescript
const paraConfig = {
  paraWeb: para,
  // connectorClass was optional
};
```

**After:**

```typescript
import { ParaGrazConnector } from "@getpara/graz-integration";

const paraConfig = {
  paraWeb: para,
  connectorClass: ParaGrazConnector, // Now required
};
```

### Documentation Updates

- Updated Para integration guide with new approach
- Added benefits section explaining advantages of explicit connector class
- Updated troubleshooting section to reflect simplified implementation
- Enhanced type documentation with clearer explanations
