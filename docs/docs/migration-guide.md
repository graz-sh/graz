---
sidebar_position: 3
---

# Migration Guide

This guide helps you upgrade between major versions of `graz`. Each section covers breaking changes and provides migration examples.

## Latest Version - Unified Multi-Chain API

### Overview

This release simplifies the multi-chain API by making it consistent across all hooks. The changes improve developer experience with a predictable, unified pattern.

### Breaking Changes Summary

| Change | Before | After |
|--------|--------|-------|
| Hook `chainId` format | `string` or `string[]` | Always `string[]` |
| Return type | `T` or `Record<string, T>` | Always `Record<chainId, T>` |
| `multiChain` parameter | Required boolean flag | Removed (automatic) |
| Method hooks | Auto `senderAddress` | Explicit `senderAddress` required |
| Actions | `string \| string[]` | Still accepts both (unchanged) |

### Quick Migration Checklist

- [ ] Change `chainId: "chain-id"` → `chainId: ["chain-id"]`
- [ ] Remove all `multiChain: true/false` parameters
- [ ] Extract values from Record: `data?.["chain-id"]`
- [ ] Add explicit `senderAddress` to mutation hooks
- [ ] Update TypeScript types if using custom types

### Detailed Migration Examples

## Hook Return Types

All query hooks now return data in a `Record<chainId, T>` format:

```diff
  import { useAccount } from "graz";

  function Component() {
-   const { data: account } = useAccount({ chainId: "cosmoshub-4" });
+   const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
+   const account = accounts?.["cosmoshub-4"];

    return <div>{account?.bech32Address}</div>;
  }
```

### Removed `multiChain` Parameter

The `multiChain` boolean parameter has been removed from all hooks:

```diff
  import { useBalance } from "graz";

  function Balances() {
    const { data: balances } = useBalance({
-     chainId: ["cosmoshub-4", "osmosis-1"],
-     multiChain: true,
+     chainId: ["cosmoshub-4", "osmosis-1"],
      denom: "uatom",
    });

    // Data is always Record<chainId, Coin> now
    return (
      <div>
        {balances && Object.entries(balances).map(([chainId, balance]) => (
          <div key={chainId}>
            {chainId}: {balance.amount}
          </div>
        ))}
      </div>
    );
  }
```

### Array-Only `chainId` in Hooks

All hooks now require `chainId` as an array:

```diff
  import { useStargateClient } from "graz";

  function Component() {
-   const { data: client } = useStargateClient({ chainId: "cosmoshub-4" });
+   const { data: clients } = useStargateClient({ chainId: ["cosmoshub-4"] });
+   const client = clients?.["cosmoshub-4"];

    return <div>...</div>;
  }
```

### Method Hooks - Explicit `senderAddress`

Method mutation hooks now require explicit `senderAddress` parameter:

## `useSendTokens`

```diff
  import { useSendTokens, useAccount, useStargateSigningClient } from "graz";

  function SendTokens() {
-   const { data: account } = useAccount({ chainId: "cosmoshub-4" });
+   const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
-   const { data: signingClient } = useStargateSigningClient({ chainId: "cosmoshub-4" });
+   const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
    const { sendTokensAsync } = useSendTokens();

+   const account = accounts?.["cosmoshub-4"];
+   const signingClient = signingClients?.["cosmoshub-4"];

    const handleSend = async () => {
      await sendTokensAsync({
        signingClient,
+       senderAddress: account.bech32Address,
        recipientAddress: "cosmos1...",
        amount: [{ denom: "uatom", amount: "1000" }],
        fee: "auto",
      });
    };

    return <button onClick={handleSend}>Send</button>;
  }
```

## `useSendIbcTokens`

```diff
  import { useSendIbcTokens } from "graz";

  function SendIbc() {
-   const { data: account } = useAccount({ chainId: "cosmoshub-4" });
+   const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
-   const { data: signingClient } = useStargateSigningClient({ chainId: "cosmoshub-4" });
+   const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
    const { sendIbcTokensAsync } = useSendIbcTokens();

+   const account = accounts?.["cosmoshub-4"];
+   const signingClient = signingClients?.["cosmoshub-4"];

    await sendIbcTokensAsync({
      signingClient,
+     senderAddress: account.bech32Address,
      recipientAddress: "osmo1...",
      transferAmount: { denom: "uatom", amount: "1000" },
      sourcePort: "transfer",
      sourceChannel: "channel-141",
      fee: "auto",
    });
  }
```

## `useInstantiateContract`

```diff
  import { useInstantiateContract } from "graz";

  function Instantiate() {
-   const { data: account } = useAccount({ chainId: "cosmoshub-4" });
+   const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
-   const { data: signingClient } = useCosmWasmSigningClient({ chainId: "cosmoshub-4" });
+   const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["cosmoshub-4"] });
    const { instantiateContractAsync } = useInstantiateContract();

+   const account = accounts?.["cosmoshub-4"];
+   const signingClient = signingClients?.["cosmoshub-4"];

    await instantiateContractAsync({
      signingClient,
+     senderAddress: account.bech32Address,
      msg: { count: 0 },
      label: "My Contract",
      fee: "auto",
    });
  }
```

## `useExecuteContract`

```diff
  import { useExecuteContract } from "graz";

  function Execute() {
-   const { data: account } = useAccount({ chainId: "cosmoshub-4" });
+   const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
-   const { data: signingClient } = useCosmWasmSigningClient({ chainId: "cosmoshub-4" });
+   const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["cosmoshub-4"] });
    const { executeContractAsync } = useExecuteContract();

+   const account = accounts?.["cosmoshub-4"];
+   const signingClient = signingClients?.["cosmoshub-4"];

    await executeContractAsync({
      signingClient,
+     senderAddress: account.bech32Address,
      msg: { increment: {} },
      fee: "auto",
    });
  }
```

### Actions - Backward Compatible

The `connect()` and `disconnect()` actions maintain backward compatibility and still accept `string | string[]`:

```tsx
import { connect, disconnect } from "graz";

// Both still work
await connect({ chainId: "cosmoshub-4" });
await connect({ chainId: ["cosmoshub-4", "osmosis-1"] });

await disconnect({ chainId: "cosmoshub-4" });
await disconnect({ chainId: ["cosmoshub-4"] });
```

### Why These Changes?

The new API provides significant improvements:

#### 1. **Consistency**
All hooks use the same pattern - no need to remember when to use `multiChain: true`

```tsx
// Old: Different patterns
const { data: account } = useAccount({ chainId: "chain-1" });
const { data: accounts } = useAccount({ chainId: ["chain-1"], multiChain: true });

// New: One pattern
const { data: accounts } = useAccount({ chainId: ["chain-1"] });
const account = accounts?.["chain-1"];
```

#### 2. **Type Safety**
Predictable types make TypeScript integration seamless

```tsx
// Always Record<string, T>
const { data: balances } = useBalance({ chainId: ["cosmoshub-4"] });
// balances is always Record<string, Coin>
```

#### 3. **Simplicity**
Less cognitive load - one parameter (`chainId`) instead of two (`chainId` + `multiChain`)

#### 4. **Flexibility**
Easy to scale from single to multi-chain without refactoring

```tsx
// Start with one chain
const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });

// Add more chains later (same code pattern!)
const { data: accounts } = useAccount({ chainId: ["cosmoshub-4", "osmosis-1"] });
```

## 0.3.0 Breaking Changes

Changes:

- @cosmjs dependencies moved to peer dependencies
- bump @cosmjs packages dependencies to support only >= 0.32.4
- zustand bumped to v5
- @walletconnect packages bumped to v2.20.2
- removed `@cosmjs/launchpad` and `@cosmjs/tendermint-rpc` package

Removed:

- Capsule wallet, will replaced by Para soon.
- `useCosmWasmTmSigningClient` hook
- `useStargateTmSigningClient` hook
- `useTendermintClient` hook

## 0.2.0 Breaking Changes

We updates the react-query version to 5.62.0 and removes QueryClientProvider initialisation from Graz Provider. As a results, dApps must now wrap Graz provider with QueryClientProvider on their end. Also note that react-query has been added as peer dependency now.

```diff
+ import { QueryClient, QueryClientProvider } from 'react-query';
  import { GrazProvider } from 'graz';

+  const queryClient = new QueryClient();

+  <QueryClientProvider client={queryClient}>
    <GrazProvider grazOptions={{
      // ... Your options
    }}>
      // children
    </GrazProvider>
+  </QueryClientProvider>
```

## 0.1.26 Breaking Changes

### WalletConnect

Wallet connect modal uses `@walletconnect/modal` instead of deprecated `web3modal`
Renamed prop `walletConnect.web3Modal` to `walletConnect.walletConnectModal`

```diff
<GrazProvider
  grazOptions={{
    walletConnect: {
-     web3Modal: web3ModalOptions
+     walletConnectModal: walletConnectModalOptions
    }
  }}
>
```

## 0.1.18 Breaking Changes

### Signing client hooks

Now siging client hooks not returning `undefined` when the signing client is not available, it will return `null` instead.

## 0.1.0 Breaking Changes

### `<GrazProvider/>`

`grazOptions` is required to provide a `ChainInfo[]` to the `chains` param. [Read more](./provider/grazProvider.md)

```diff
const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  //...
}
- <GrazProvider>
+ <GrazProvider grazOptions={{
+   chains: [cosmoshub]
+ }}>
  // children
  </GrazProvider>
```

`defaultChain` removed from `grazOptions`

### Removed `GrazChain` type

We are using [`ChainInfo` from `@keplr-wallet/types`](https://github.com/chainapsis/keplr-wallet/blob/master/packages/types/src/chain-info.ts#L5-L46) instead of `GrazChain`

Our initial intention having `GrazChain` is for adding and only using required value for interacting with signingClients. We adding rpcHeaders and gas in there for interacting with clients and signingClient for simplicity, but this can make a different problem when you already have a ChainInfo you will need to mutate those constants. [Read RFC](https://github.com/orgs/graz-sh/discussions/115).

For adding rpcHeaders and gas, we can add it in `GrazProvider` on `grazOptions.chainsConfig` to provide those values.

```ts
interface ChainConfig {
  rpcHeaders?: Dictionary<string>;
  gas?: { price: string; denom: string };
}

type ChainsConfig = Record<string, ChainConfig>;
```

```diff
// previous GrazChain
const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
- rpcHeaders: {
-   "custom-header": "custom-value"
-  },
- gas: {
-   price: "0.025",
-   denom: "uatom"
- }
}

  <GrazProvider grazOptions={
    chains: [cosmoshub],
+   chainsConfig:{
+     "cosmoshub-4": {
+       rpcHeaders: {
+         "custom-header": "custom-value"
+       },
+       gas: {
+         price: "0.025",
+         denom: "uatom"
+       }
+      }
+   }
  }>
  // children
  </GrazProvider>
```

When you connect you don't need `GrazChain` anymore, you only need the `chainId`

```diff
  const { connect } = useConnect();
  connect({
-   chain: cosmoshub,
+   chainId: "cosmoshub-4", // chainId receive string | string[]
    // ...
  })

```

### `useConnect`

```diff
const { connect } = useConnect();
  connect({
-   chain: cosmoshub,
+   chainId: "cosmoshub-4", // chainId receive string | string[]
    // ...
  })
```

### `ConnectResult`

return type of `connect` in `useConnect` and `onConnect` params

```diff
interface ConnectResult {
- account: Key;
+ account: Record<string, Key>
  walletType: WalletType;
- chain: GrazChain;
+ chains: ChainInfo[];
}
```

### `useBalance`

```diff
- const balance = useBalance(denom, bech32Address);
+ const balance = useBalance({ denom, bech32Address });
```

### `useBalances`

```diff
- const balances = useBalances(denom, bech32Address);
+ const balances = useBalances({ denom, bech32Address });
```

### `useBalanceStaked`

```diff
- const balanceStaked = useBalances(bech32Address);
+ const balanceStaked = useBalanceStaked({ bech32Address });
```

### `useQuerySmart`

```diff
- const querySmart = useQuerySmart(address, message);
+ const querySmart = useQuerySmart({ address, queryMsg });
```

### `useQueryRaw`

```diff
- const queryRaw = useQueryRaw(address, key);
+ const queryRaw = useQueryRaw({ address, key });
```

## 0.0.50 Breaking Changes

[Full changelog](/docs/change-log/#version-0045)

### `useSuggestChain`

`suggestChain` and `suggestChainAsync` param to object param

```ts
interface SuggestChainArgs {
  chainInfo: ChainInfo;
  walletType: WalletType;
}
```

```diff
- suggestChain(chainInfo)
+ suggestChain({ chainInfo, walletType }: SuggestChainArgs)
```

### `useConnect`

We remove `signerOpts` param from `connect` and `connectAsync` in `useConnect`

```diff
  connect({
    chain: chain,
    walletType: walletType,
-   signerOpts: signerOpts
  })
```

### `useSuggestChainAndConnect`

We remove `signerOpts` param from `suggestAndConnect` and `suggestAndConnectAsync` in `useSuggestChainAndConnect`

```diff
  suggestAndConnect({
    chain: chain,
    walletType: walletType,
-   signerOpts: signerOpts
  })
```

## 0.0.45 Breaking Changes

[Full changelog](/docs/change-log/#version-0045)

### Reworked connect

connect not creating offline signers, clients and signing clients

### Removed Actions:

- `createClients`
- `createSigningClients`
- `createQueryClient`
- `getBalances`
- `getBalanceStaked`

### Removed `useClients`

Use these hooks instead:

- `useStargateClient`
- `useCosmwasmClient`
- `useTendermintClient`

### Removed `useSigningClients`

Use these hooks instead:

- `useStargateSigningClient`
- `useStargateTmSigningClient`
- `useCosmWasmSigningClient`
- `useCosmwasmTmSigningClient`

### `useSendTokens`

added mutation param `signingClient?: SigningStargateClient | SigningCosmWasmClient`

```diff
+ const { data: signingClient } = useStargateSigningClient()
  const { sendTokens } = useSendTokens();
  sendTokens({
+   signingClient,
    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
    // ...
  })
```

### `useSendIbcTokens`

added mutation param `signingClient?: SigningStargateClient`

```diff
+ const { data: signingClient } = useStargateSigningClient()
  const { sendIbcTokens } = useSendIbcTokens();
  sendIbcTokens({
+   signingClient,
    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
    // ...
  })
```

### `useInstantiateContract`

added mutation param `signingClient?: SigningCosmWasmClient`

```diff
+ const { data: signingClient } = useCosmwasmSigningClient()
  const { instantiateContract } = useInstantiateContract();
  instantiateContract({
+   signingClient,
    msg: instatiateMessage,
    label: "test"
  });
```

### `useExecuteContract`

added mutation param `signingClient?: SigningCosmWasmClient`

```diff
+ const { data: signingClient } = useCosmwasmSigningClient()
  const { executeContract } = useExecuteContract();
  executeContract({
+   signingClient,
    msg: {
    foo: "bar"
    }
  });
```
