# GrazProvider

Provider component which wraps @tanstack/react-query's `QueryClientProvider` and various graz side effects

#### Usage

```tsx
import { GrazProvider, WalletType } from "graz";

// example next.js application in _app.tsx
export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <GrazProvider
      grazOptions={{
        defaultWallet: WalletType.KEPLR, // optional
        // ...
      }}
    >
      <Component {...pageProps} />
    </GrazProvider>
  );
}
```

#### Params

`grazOptions`(Optional)

- defaultChain?: `GrazChain`;
- defaultSigningClient?: `GrazStore["defaultSigningClient"]`;
- defaultWallet?: `WalletType`;
- onNotFound?: () => void;
