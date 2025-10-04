---
"graz": minor
---

Unified Multi-Chain API and Security Updates

## Breaking Changes

### Unified Multi-Chain API

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

### Benefits

- **Consistency** - One pattern for all hooks
- **Type Safety** - Better TypeScript inference with exact types
- **Predictability** - Always know what format data will be in
- **Simplicity** - Fewer parameters to remember
- **Clarity** - Explicit `senderAddress` makes data flow clearer

## Security Updates

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

## Documentation

- Added comprehensive migration guide
- Updated all hook documentation
- Updated multi-chain guide
- Updated getting started guide
- All example applications updated to demonstrate new API
