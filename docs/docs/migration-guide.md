---
sidebar_position: 3
---

# Migration Guide

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
