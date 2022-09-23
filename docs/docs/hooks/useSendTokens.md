# useSendTokens

Mutation hook to send tokens and returns @cosmjs/stargate's `DeliverTxResponse`
Note: if `senderAddress` undefined, it will use current connected account address

#### Usage

```tsx
import { useSendTokens } from "graz";

  // basic example
 const { sendTokens } = useSendTokens();

  sendTokens({
    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
    // ...
  })
```

#### Types

- `SendTokensArgs`
  ```ts
  {
    senderAddress?: string;
    recipientAddress: string;
    amount: Coin[];
    fee: number | StdFee | "auto";
    memo?: string;
  }
  ```

#### Params

Object params

- onError?: `(error: unknown, args: SendTokensArgs) => void`
- onMutate?: `(data: SendTokensArgs) => void`
- onSuccess?: `(data: DeliverTxResponse, args: SendTokensArgs) => void`

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  sendTokens: (args: SendTokensArgs) => void;
  sendTokensAsync: (args: SendTokensArgs) => Promise<DeliverTxResponse>;
  status: "error" | "idle" | "loading" | "success";
}
```
