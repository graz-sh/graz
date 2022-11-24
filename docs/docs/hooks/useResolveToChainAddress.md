# useSendIbcTokens

Mutation hook to resolve an Ibc domain or an address to bech32 address from given string

#### Usage

```tsx
  import { useResolveToChainAddress } from "graz";

  // basic example
  const { resolveToChainAddress } = useResolveToChainAddress();

  // with event arguments
  useResolveToChainAddress({
    onError: (err, args) => { ... },
    onLoading: () => { ... },
    onSuccess: ({ account, address }) => { ... },
  });

  // resolveToChainAddress usage
  resolveToChainAddress({
    value: "kikiding.cosmos",
    prefix: "osmo"
    ...
  });
```

#### Types

- `ResolveToChainAddressArgs`
  ```ts
  {
    value: string;
    prefix: ChainPrefix;
    isTestnet?: boolean;
  }
  ```

#### Params

Object params

- onError?: `(error: unknown, args: ResolveToChainAddressArgs) => void`
- onMutate?: `(data: ResolveToChainAddressArgs) => void`
- onSuccess?: `(data: string) => void`

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  resolveToChainAddress: (args: ResolveToChainAddressArgs) => void;
  resolveToChainAddressAsync: (args: ResolveToChainAddressArgs) => Promise<string>;
  status: "error" | "idle" | "loading" | "success";
}
```
