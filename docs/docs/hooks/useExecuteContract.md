# useExecuteContract

Mutation hook to executing transactions against a CosmWasm smart contract.
Note: `senderAddress` will be filled with current connected account.

#### Usage

```ts
import { useExecuteContract } from "graz";

const contractAddress = "cosmosfoobarbaz";
const { executeContract } = useExecuteContract<ExecuteMessage>({ contractAddress });

executeContract({
  msg: {
    foo: "bar",
  },
});
```

#### Types

- `ExecuteContractMutationArgs`
  ```ts
  {
    msg: Record<string, unknown>;
    fee?: StdFee | "auto" | number; // will be default to "auto"
  }
  ```

#### Params

Object params

- onError?: `(error: unknown, args: ExecuteResult) => void`
- onMutate?: `(data: ExecuteResult) => void`
- onSuccess?: `(data: ExecuteResult) => void`

Note: `ExecuteResult` is from `@cosmjs/cosmwasm-stargate`

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  executeContract: (args: ExecuteContractMutationArgs) => void;
  executeContractAsync: (args: ExecuteContractMutationArgs) => Promise<ExecuteResult>;
  status: "error" | "idle" | "loading" | "success";
}
```
