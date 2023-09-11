# GrazProvider

Provider component which wraps @tanstack/react-query's `QueryClientProvider` and various graz side effects

#### Usage

```tsx
import { GrazProvider, WalletType } from "graz";

const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... rest of cosmoshub ChainInfo
}

const sommelier = {
  chainId: "sommelier-1",
  chainName: "Sommelier",
  // ... rest of sommelier ChainInfo
}

// example next.js application in _app.tsx
export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <GrazProvider
      grazOptions={{
        chains: [cosmoshub, sommelier],
        chainsConfig: {
          "cosmoshub-4": {
            gas: {
              price: "",
              denom: ""
            }
          },
          "sommelier-1": {
            gas: {
              price: "",
              denom: ""
            }
          }
        }
        defaultWallet: WalletType.LEAP,
        onNotFound: () => {
          console.log("not found")
        },
        multiChainFetchConcurrency: 6
        // ...
      }}
    >
      <Component {...pageProps} />
    </GrazProvider>
  );
}
```

#### Params

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
    multiChainFetchConcurrency?: number // when using multi chain hooks it fetch 3 function simultaneously. defaults to 3.
  }
```

#### Types

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
