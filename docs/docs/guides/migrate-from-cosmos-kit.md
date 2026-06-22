---
sidebar_position: 6
---

# Migrate from Cosmos Kit

This guide maps common Cosmos Kit patterns to Graz. It focuses on application code that connects wallets, reads account state, creates clients, and sends transactions.

## Migration checklist

- Replace `ChainProvider` with `GrazProvider`.
- Keep your app-level `QueryClientProvider`; Graz uses TanStack Query for hooks.
- Provide Keplr-compatible `ChainInfo[]` through `grazOptions.chains`.
- Replace wallet modal state from Cosmos Kit with your own UI plus `useConnect`, `useDisconnect`, and `useCheckWallet`.
- Read accounts from `useAccount()` as a record keyed by chain id.
- Use Graz signing-client hooks and transaction hooks instead of calling Cosmos Kit wallet helpers directly.

## Provider setup

Cosmos Kit usually combines chains, assets, wallet adapters, and wallet modal configuration in `ChainProvider`.

```tsx title="Before"
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { chains, assets } from "chain-registry";

export function App() {
  return (
    <ChainProvider chains={chains} assetLists={assets} wallets={keplrWallets}>
      <YourApp />
    </ChainProvider>
  );
}
```

Graz keeps provider setup smaller. Wrap your app with TanStack Query, then pass chain information to `GrazProvider`.

```tsx title="After"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, WalletType } from "graz";
import { cosmoshub, osmosis } from "graz/chains";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub, osmosis],
          defaultWallet: WalletType.KEPLR,
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

If you already maintain custom chain registry data, convert each chain to the Keplr `ChainInfo` shape that Graz expects. You can also generate local chain exports with:

```sh
pnpm graz cli --generate
```

## Wallet connection

Cosmos Kit exposes wallet modal helpers from `useChain`.

```tsx title="Before"
import { useChain } from "@cosmos-kit/react";

export function ConnectButton() {
  const { address, connect, disconnect, status } = useChain("cosmoshub");

  return (
    <button onClick={() => (address ? disconnect() : connect())}>
      {address ?? status}
    </button>
  );
}
```

In Graz, call `useConnect` with the chain id you want to enable. `useAccount` returns accounts keyed by chain id.

```tsx title="After"
import { useAccount, useConnect, useDisconnect } from "graz";

const chainId = "cosmoshub-4";

export function ConnectButton() {
  const { connect, status } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: accounts, isConnected } = useAccount({ chainId: [chainId] });
  const account = accounts?.[chainId];

  return (
    <button onClick={() => (isConnected ? disconnect() : connect({ chainId: [chainId] }))}>
      {account?.bech32Address ?? status}
    </button>
  );
}
```

Graz does not require a bundled wallet modal. Build the wallet picker in your UI and pass the selected `walletType` to `connect`.

```tsx
import { WalletType, useConnect } from "graz";

const { connect } = useConnect();

connect({
  chainId: ["cosmoshub-4"],
  walletType: WalletType.LEAP,
});
```

## Account data

Cosmos Kit often returns one chain account directly from `useChain`.

```tsx title="Before"
const { address, username } = useChain("osmosis");
```

Graz returns multi-chain account records. This keeps single-chain and multi-chain code paths consistent.

```tsx title="After"
const { data: accounts } = useAccount({ chainId: ["osmosis-1"] });
const osmosisAccount = accounts?.["osmosis-1"];

const address = osmosisAccount?.bech32Address;
const username = osmosisAccount?.name;
```

For multiple chains, request all required ids at once:

```tsx
const { data: accounts } = useAccount({
  chainId: ["cosmoshub-4", "osmosis-1"],
});

const cosmoshubAddress = accounts?.["cosmoshub-4"]?.bech32Address;
const osmosisAddress = accounts?.["osmosis-1"]?.bech32Address;
```

## Balances

Cosmos Kit apps often query balances through a chain helper or a CosmJS client created from the wallet context.

```tsx title="Before"
const { address, getStargateClient } = useChain("cosmoshub");

const client = await getStargateClient();
const balance = await client.getBalance(address, "uatom");
```

Graz exposes balance hooks directly. Keep the query disabled until an address is available.

```tsx title="After"
import { useAccount, useBalance } from "graz";

const chainId = "cosmoshub-4";
const { data: accounts } = useAccount({ chainId: [chainId] });
const account = accounts?.[chainId];

const { data: balance, isLoading } = useBalance({
  chainId,
  bech32Address: account?.bech32Address,
  denom: "uatom",
  enabled: Boolean(account?.bech32Address),
});
```

Use `useBalances` for all balances on one chain, or `useBalanceStaked` for delegated stake.

## Clients and signers

Cosmos Kit exposes client helpers from `useChain`.

```tsx title="Before"
const { getStargateClient, getSigningStargateClient } = useChain("cosmoshub");

const client = await getStargateClient();
const signingClient = await getSigningStargateClient();
```

Graz exposes clients through query hooks. Multi-chain client hooks return records keyed by chain id.

```tsx title="After"
import { useStargateClient, useStargateSigningClient } from "graz";

const chainId = "cosmoshub-4";

const { data: clients } = useStargateClient({ chainId: [chainId] });
const { data: signingClients } = useStargateSigningClient({ chainId: [chainId] });

const client = clients?.[chainId];
const signingClient = signingClients?.[chainId];
```

For CosmWasm apps, use `useCosmWasmClient` and `useCosmWasmSigningClient`.

## Sending tokens

Cosmos Kit apps commonly send through a signing client returned by the chain context.

```tsx title="Before"
const { address, getSigningStargateClient } = useChain("cosmoshub");

const signingClient = await getSigningStargateClient();

await signingClient.sendTokens(
  address,
  "cosmos1recipient...",
  [{ denom: "uatom", amount: "1000" }],
  "auto",
);
```

With Graz, combine account data, signing clients, and mutation hooks.

```tsx title="After"
import { useAccount, useSendTokens, useStargateSigningClient } from "graz";

const chainId = "cosmoshub-4";
const { data: accounts } = useAccount({ chainId: [chainId] });
const { data: signingClients } = useStargateSigningClient({ chainId: [chainId] });
const { sendTokensAsync } = useSendTokens();

const account = accounts?.[chainId];
const signingClient = signingClients?.[chainId];

async function send() {
  if (!account || !signingClient) return;

  await sendTokensAsync({
    signingClient,
    senderAddress: account.bech32Address,
    recipientAddress: "cosmos1recipient...",
    amount: [{ denom: "uatom", amount: "1000" }],
    fee: "auto",
  });
}
```

For IBC transfers, use `useSendIbcTokens`. For CosmWasm contracts, use `useInstantiateContract` and `useExecuteContract`.

## Common mapping

| Cosmos Kit pattern | Graz replacement |
| --- | --- |
| `ChainProvider` | `QueryClientProvider` plus `GrazProvider` |
| `chains` / `assetLists` provider props | `grazOptions.chains` and your own app asset metadata |
| `useChain("cosmoshub")` | `useAccount({ chainId: ["cosmoshub-4"] })`, `useConnect`, `useDisconnect` |
| `connect()` | `connect({ chainId: ["cosmoshub-4"] })` |
| `disconnect()` | `disconnect()` or `disconnect({ chainId: ["cosmoshub-4"] })` |
| `address` | `accounts?.["cosmoshub-4"]?.bech32Address` |
| `getStargateClient()` | `useStargateClient({ chainId: ["cosmoshub-4"] })` |
| `getSigningStargateClient()` | `useStargateSigningClient({ chainId: ["cosmoshub-4"] })` |
| `getCosmWasmClient()` | `useCosmWasmClient({ chainId: ["juno-1"] })` |
| `getSigningCosmWasmClient()` | `useCosmWasmSigningClient({ chainId: ["juno-1"] })` |
| Wallet modal state | App-owned UI plus `WalletType` and `useCheckWallet` |

## Notes for production apps

- Keep chain ids explicit. Graz uses canonical chain ids such as `cosmoshub-4` and `osmosis-1`.
- Store display metadata such as token icons in your app if you previously read them from Cosmos Kit asset lists.
- Use `enabled` on query hooks when account-dependent inputs are loaded asynchronously.
- Use `chainsConfig` for chain-specific gas defaults or RPC headers.
- For multi-chain screens, keep the `Record<chainId, T>` shape instead of flattening state too early.
