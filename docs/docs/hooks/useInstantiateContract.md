# useInstantiateContract

Mutation hook to instantiate a CosmWasm smart contract.
Note: `senderAddress` will be filled with current connected account.

#### Usage

```tsx
import { useInstantiateContract } from "graz";

// basic example
const { instantiateContract } = useInstantiateContract({
  codeId: 4,
});

const instantiateMessage = { foo: "bar" };
instantiateContract({
  msg: {
    foo: "bar",
  },
  label: "test",
});
```

#### Params

Object params

- codeId: `number`
- onError?: `(error: unknown, args: InstantiateResult) => void`
- onMutate?: `(data: InstantiateResult) => void`
- onSuccess?: `(data: InstantiateResult) => void`

Note: `InstantiateResult` is from `@cosmjs/cosmwasm-stargate`

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  instantiateContract: (args: InstantiateContractMutationArgs) => void;
  instantiateContractAsync: (args: InstantiateContractMutationArgs) => Promise<InstantiateResult>;
  status: "error" | "idle" | "loading" | "success";
}
```
