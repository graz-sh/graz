# Wallet

Wallet interaction/object. We follow Keplr's API and add few value to the wallet type.

```ts
type Wallet = Pick<
  Keplr,
  | "enable"
  | "getKey"
  | "getOfflineSigner"
  | "getOfflineSignerAuto"
  | "getOfflineSignerOnlyAmino"
  | "experimentalSuggestChain"
  | "signDirect"
  | "signAmino"
> & {
  subscription?: (reconnect: () => void) => void;
  init?: () => Promise<unknown>;
};
```
