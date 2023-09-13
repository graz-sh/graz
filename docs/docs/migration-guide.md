---
sidebar_position: 3
---

# Migration Guide

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
