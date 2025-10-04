# useInstantiateContract

Mutation hook to instantiate a CosmWasm smart contract.

**Important**: `senderAddress` is a required parameter that must be explicitly provided.

## Usage

### Basic Example

```tsx
import { useInstantiateContract, useAccount, useCosmWasmSigningClient } from "graz";

interface InitMsg {
  count: number;
}

function InstantiateContractComponent() {
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
  const { instantiateContractAsync, isLoading } = useInstantiateContract<InitMsg>({
    codeId: 1234,
  });

  const account = accounts?.["juno-1"];
  const signingClient = signingClients?.["juno-1"];

  async function handleInstantiate() {
    if (!signingClient || !account) return;

    const result = await instantiateContractAsync({
      signingClient,
      senderAddress: account.bech32Address, // Explicit sender address
      msg: { count: 0 },
      label: "My Counter Contract",
      fee: "auto",
    });

    console.log("Contract address:", result.contractAddress);
    console.log("Transaction hash:", result.transactionHash);
  }

  return (
    <button onClick={handleInstantiate} disabled={isLoading}>
      {isLoading ? "Instantiating..." : "Instantiate Contract"}
    </button>
  );
}
```

### With Admin and Funds

```tsx
import { useInstantiateContract, useAccount, useCosmWasmSigningClient } from "graz";

function InstantiateWithOptions() {
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
  const { instantiateContractAsync } = useInstantiateContract({
    codeId: 1234,
  });

  const account = accounts?.["juno-1"];
  const signingClient = signingClients?.["juno-1"];

  async function handleInstantiate() {
    if (!signingClient || !account) return;

    const result = await instantiateContractAsync({
      signingClient,
      senderAddress: account.bech32Address,
      msg: { owner: account.bech32Address },
      label: "My Contract",
      fee: "auto",
      options: {
        admin: account.bech32Address, // Set contract admin
        funds: [{ denom: "ujuno", amount: "1000000" }], // Send funds to contract
      },
    });

    return result;
  }

  return <button onClick={handleInstantiate}>Instantiate</button>;
}
```

### With Event Handlers

```tsx
import { useInstantiateContract } from "graz";

function InstantiateWithEvents() {
  const { instantiateContractAsync } = useInstantiateContract({
    codeId: 1234,
    onSuccess: (result) => {
      console.log("Contract instantiated!", result.contractAddress);
    },
    onError: (error) => {
      console.error("Instantiation failed:", error);
    },
    onMutate: (args) => {
      console.log("Starting instantiation...", args);
    },
  });

  // ... rest of component
}
```

## Types

### `InstantiateContractMutationArgs`

```ts
{
  signingClient: SigningCosmWasmClient;
  senderAddress: string; // Required - address instantiating the contract
  msg: Message; // Instantiation message (generic type)
  label: string; // Human-readable label for the contract
  fee?: StdFee | "auto" | number; // Defaults to "auto"
  options?: InstantiateOptions; // Optional admin and funds
}
```

### `InstantiateOptions`

```ts
{
  admin?: string; // Address that can migrate the contract
  funds?: Coin[]; // Funds to send to contract on instantiation
}
```

## Hook Params

```ts
{
  codeId: number; // Required - code ID to instantiate
  onError?: (error: unknown, result: InstantiateResult) => void | Promise<void>;
  onMutate?: (args: InstantiateContractMutationArgs) => void;
  onSuccess?: (result: InstantiateResult) => void | Promise<void>;
}
```

Note: `InstantiateResult` is from `@cosmjs/cosmwasm-stargate`

## Return Value

```tsx
{
  error: unknown;
  isError: boolean;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  data?: InstantiateResult; // From @cosmjs/cosmwasm-stargate
  instantiateContract: (args: InstantiateContractMutationArgs) => void;
  instantiateContractAsync: (args: InstantiateContractMutationArgs) => Promise<InstantiateResult>;
  reset: () => void;
  status: "error" | "idle" | "loading" | "success";
}
```

### `InstantiateResult`

```ts
{
  contractAddress: string;
  transactionHash: string;
  logs: Log[];
  height: number;
  gasUsed: number;
  gasWanted: number;
}
```

## Migration from Previous Version

If upgrading from an older version where `senderAddress` was optional:

```diff
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
+ const account = accounts?.["juno-1"];
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
+ const signingClient = signingClients?.["juno-1"];
  const { instantiateContractAsync } = useInstantiateContract({ codeId: 1234 });

  await instantiateContractAsync({
    signingClient,
+   senderAddress: account.bech32Address, // Now required
    msg: { count: 0 },
    label: "My Contract",
    fee: "auto",
  });
```
