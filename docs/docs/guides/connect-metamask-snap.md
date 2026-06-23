---
sidebar_position: 7
---

# Connect with MetaMask Snap

Graz supports Cosmos accounts in MetaMask through Snap integrations. Use this guide when you want a small hello-world connection flow for MetaMask users.

## Supported Snap wallet types

Graz exposes two MetaMask Snap wallet types:

| Wallet type | Use when |
| --- | --- |
| `WalletType.METAMASK_SNAP_LEAP` | Your app should connect through Leap's Cosmos Snap integration. |
| `WalletType.METAMASK_SNAP_COSMOS` | Use the standard Cosmos Snap integration instead of the Leap-managed Snap. |

Both options require MetaMask in the user's browser. On first use, MetaMask may ask the user to install or approve the selected Snap.

## Provider setup

Configure `GrazProvider` with the chains your app supports. MetaMask Snap connections use the same provider setup as other wallets.

```tsx title="App.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, WalletType } from "graz";
import { cosmoshub } from "graz/chains";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub],
          defaultWallet: WalletType.METAMASK_SNAP_LEAP,
        }}
      >
        <Wallet />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

## Hello world connection

Use `useCheckWallet` to hide the action when MetaMask is not available, then connect with the Snap wallet type.

```tsx title="Wallet.tsx"
import { useAccount, useCheckWallet, useConnect, useDisconnect, WalletType } from "graz";
import { cosmoshub } from "graz/chains";

const walletType = WalletType.METAMASK_SNAP_LEAP;
const chainId = cosmoshub.chainId;

export function Wallet() {
  const { data: isSupported } = useCheckWallet(walletType);
  const { connect, status } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: accounts, isConnected } = useAccount({ chainId: [chainId] });

  const account = accounts?.[chainId];

  if (!isSupported) {
    return <p>Install MetaMask to connect with MetaMask Snap.</p>;
  }

  return (
    <section>
      <p>{account ? `Connected as ${account.bech32Address}` : `Status: ${status}`}</p>
      <button
        onClick={() => {
          if (isConnected) {
            disconnect();
            return;
          }

          connect({
            chainId: [chainId],
            walletType,
          });
        }}
      >
        {isConnected ? "Disconnect" : "Connect MetaMask Snap"}
      </button>
    </section>
  );
}
```

To use the Cosmos Snap integration instead, change the wallet type:

```ts
const walletType = WalletType.METAMASK_SNAP_COSMOS;
```

## Suggest and connect to a custom chain

If the target chain is not configured in `GrazProvider`, use `useSuggestChainAndConnect`. Graz adds the suggested chain to its internal store after the wallet accepts it.

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChainAndConnect, WalletType } from "graz";

const walletType = WalletType.METAMASK_SNAP_LEAP;

const testnetChain = {
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("osmo"),
  stakeCurrency: {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
  },
  currencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    },
  ],
};

export function ConnectTestnet() {
  const { suggestAndConnect, status } = useSuggestChainAndConnect();

  return (
    <button
      onClick={() => {
        suggestAndConnect({
          chainInfo: testnetChain,
          walletType,
        });
      }}
    >
      Connect Osmosis Testnet with MetaMask Snap ({status})
    </button>
  );
}
```

## Troubleshooting

- If `useCheckWallet(WalletType.METAMASK_SNAP_LEAP)` returns `false`, confirm MetaMask is installed and enabled in the browser.
- If another extension also injects `window.ethereum`, keep MetaMask enabled and retry. Graz selects the MetaMask provider when multiple Ethereum providers are present.
- If the Snap install prompt does not appear, check MetaMask's Snap settings and remove any rejected or partially installed Snap entry before retrying.
- If chain suggestion fails, verify that the chain has complete `ChainInfo`, including `bech32Config`, `stakeCurrency`, `currencies`, and `feeCurrencies`.

