# useSendIbcTokens

Mutation hook to send IBC tokens and returns @cosmjs/stargate's `DeliverTxResponse`
Note: if `senderAddress` undefined, it will use current connected account address

#### Usage

```tsx
import { useSendIbcTokens } from "graz";

  // basic example
 const { sendIbcTokens } = useSendIbcTokens();

  sendTokens({
    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
    // ...
  })
```

#### Types

- `SendIbcTokensArgs`
  ```ts
  {
    senderAddress?: string;
    recipientAddress: string;
    transferAmount: Coin;
    sourcePort: string;
    sourceChannel: string;
    timeoutHeight?: Height; // cosmjs-types/ibc/core/client/v1/client
    timeoutTimestamp?: number;
    fee: number | StdFee | "auto";
    memo: string;
  }
  ```

#### Params

Object params

- onError?: `(error: unknown, args: SendIbcTokensArgs) => void`
- onMutate?: `(data: SendIbcTokensArgs) => void`
- onSuccess?: `(data: DeliverTxResponse, args: SendIbcTokensArgs) => void`

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  sendTokens: (args: SendIbcTokensArgs) => void;
  sendTokensAsync: (args: SendIbcTokensArgs) => Promise<DeliverTxResponse>;
  status: "error" | "idle" | "loading" | "success";
}
```
