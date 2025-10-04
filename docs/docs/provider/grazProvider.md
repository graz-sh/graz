# GrazProvider

Provider component which configures various graz side effects.
Graz uses `@tanstack/react-query`'s features under the hood, hence you need to wrap `GrazProvider` with `QueryClientProvider`.

:::tip Performance
Graz is highly optimized with built-in caching, request deduplication, and efficient state management. See the [Performance Guide](/docs/performance) for optimization tips and best practices.
:::

## Usage

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, WalletType } from "graz";

const queryClient = new QueryClient();

const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... rest of cosmoshub ChainInfo
};

const sommelier = {
  chainId: "sommelier-1",
  chainName: "Sommelier",
  // ... rest of sommelier ChainInfo
};

// example next.js application in _app.tsx
export default function CustomApp({ Component, pageProps }: AppProps) {
  const onNotFound = () => {
    console.log("not found");
  };

  return (
    <QueryClientProvider queryClient={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub, sommelier],
          chainsConfig: {
            "cosmoshub-4": {
              gas: {
                price: "",
                denom: "",
              },
            },
            "sommelier-1": {
              gas: {
                price: "",
                denom: "",
              },
            },
          },
          defaultWallet: WalletType.LEAP,
          onNotFound,
          multiChainFetchConcurrency: 6,
          // ...
        }}
      >
        <Component {...pageProps} />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

## Params

`grazOptions`

```ts
  {
    chains?: ChainInfo[];
    chainsConfig?: Record<string, ChainConfig>
    defaultWallet?: WalletType; // default to `WalletType.KEPLR`
    onNotFound?: () => void;
    autoReconnect?: boolean; // Defaults to true, will try to reconnect when initial start(session empty)
    onReconnectFailed?: () => void;
    walletConnect?: WalletConnectStore | null;
    multiChainFetchConcurrency?: number // Multi-chain request concurrency limit. Defaults to 3 for optimal performance.
    iframeOptions?: {
      // for integrating using WalletType.COSMIFRAME
      allowedIframeParentOrigins: string[]
      autoConnect?: boolean
    }
    paraConfig?: ParaConfig; // Configuration for Para embedded wallet
    walletDefaultOptions?: KeplrIntereactionOptions; // Default options for wallet interactions
  }
```

## Types

[`WalletConnectStore`](../types/WalletConnectStore.md)

```ts
interface ChainConfig {
  path?: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
}
```
