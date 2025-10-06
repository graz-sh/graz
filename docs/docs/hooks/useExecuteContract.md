# useExecuteContract

Mutation hook for executing transactions against a CosmWasm smart contract.

**Important**: `senderAddress` is a required parameter that must be explicitly provided.

**Enhanced**: This hook now returns all React Query mutation properties, giving you access to utilities like `reset`, `variables`, `context`, `failureCount`, and more.

## Usage

### Basic Example

```tsx
import { useExecuteContract, useAccount, useCosmWasmSigningClient } from "graz";

interface ExecuteMsg {
  increment?: {};
  reset?: { count: number };
}

function ExecuteContractComponent() {
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
  const { executeContractAsync, isLoading } = useExecuteContract<ExecuteMsg>({
    contractAddress: "juno1contractaddress...",
  });

  const account = accounts?.["juno-1"];
  const signingClient = signingClients?.["juno-1"];

  async function handleExecute() {
    if (!signingClient || !account) return;

    const result = await executeContractAsync({
      signingClient,
      senderAddress: account.bech32Address, // Explicit sender address
      msg: { increment: {} },
      fee: "auto",
    });

    console.log("Transaction hash:", result.transactionHash);
  }

  return (
    <button onClick={handleExecute} disabled={isLoading}>
      {isLoading ? "Executing..." : "Increment Counter"}
    </button>
  );
}
```

### With Funds

```tsx
import { useExecuteContract, useAccount, useCosmWasmSigningClient } from "graz";

function ExecuteWithFunds() {
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
  const { executeContractAsync } = useExecuteContract({
    contractAddress: "juno1contract...",
  });

  const account = accounts?.["juno-1"];
  const signingClient = signingClients?.["juno-1"];

  async function handleExecute() {
    if (!signingClient || !account) return;

    const result = await executeContractAsync({
      signingClient,
      senderAddress: account.bech32Address,
      msg: { deposit: {} },
      fee: "auto",
      funds: [{ denom: "ujuno", amount: "1000000" }], // Send 1 JUNO to contract
      memo: "Deposit via Graz",
    });

    return result;
  }

  return <button onClick={handleExecute}>Deposit</button>;
}
```

### With Custom Fee

```tsx
import { useExecuteContract, useAccount, useCosmWasmSigningClient } from "graz";

function ExecuteWithCustomFee() {
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
  const { executeContractAsync } = useExecuteContract({
    contractAddress: "juno1contract...",
  });

  const account = accounts?.["juno-1"];
  const signingClient = signingClients?.["juno-1"];

  async function handleExecute() {
    if (!signingClient || !account) return;

    await executeContractAsync({
      signingClient,
      senderAddress: account.bech32Address,
      msg: { execute: {} },
      fee: {
        amount: [{ denom: "ujuno", amount: "50000" }],
        gas: "500000",
      },
    });
  }

  return <button onClick={handleExecute}>Execute</button>;
}
```

### With Event Handlers

```tsx
import { useExecuteContract } from "graz";

function ExecuteWithEvents() {
  const { executeContractAsync } = useExecuteContract({
    contractAddress: "juno1contract...",
    onSuccess: (result) => {
      console.log("Execution successful!", result.transactionHash);
    },
    onError: (error) => {
      console.error("Execution failed:", error);
    },
    onMutate: (args) => {
      console.log("Starting execution...", args);
    },
  });

  // ... rest of component
}
```

## Types

### `ExecuteContractMutationArgs`

```ts
{
  signingClient: SigningCosmWasmClient;
  senderAddress: string; // Required - address executing the contract
  msg: Message; // Execution message (generic type)
  fee?: StdFee | "auto" | number; // Defaults to "auto"
  funds?: Coin[]; // Optional funds to send to contract
  memo?: string; // Optional transaction memo
}
```

## Hook Params

```ts
{
  contractAddress: string; // Required - address of contract to execute
  onError?: (error: unknown, result: ExecuteResult) => void | Promise<void>;
  onMutate?: (args: ExecuteContractMutationArgs) => void;
  onSuccess?: (result: ExecuteResult) => void | Promise<void>;
}
```

Note: `ExecuteResult` is from `@cosmjs/cosmwasm-stargate`

## Return Value

```tsx
{
  // Custom mutation functions
  executeContract: (args: ExecuteContractMutationArgs) => void;
  executeContractAsync: (args: ExecuteContractMutationArgs) => Promise<ExecuteResult>;

  // All React Query mutation properties
  data?: ExecuteResult; // From @cosmjs/cosmwasm-stargate
  error: unknown;
  failureCount: number;
  failureReason: Error | null;
  isError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  status: "idle" | "pending" | "error" | "success";
  variables?: ExecuteContractMutationArgs; // Arguments passed to the last mutation call
  submittedAt: number;

  // Mutation methods
  reset: () => void; // Reset mutation state

  // Context (from onMutate)
  context: unknown;
}
```

Note: `isLoading` has been replaced by `isPending` in React Query v5. Both work, but `isPending` is the modern property name.

### `ExecuteResult`

```ts
{
  transactionHash: string;
  logs: Log[];
  height: number;
  gasUsed: number;
  gasWanted: number;
  events: Event[];
}
```

## Migration from Previous Version

If upgrading from an older version where `senderAddress` was optional:

```diff
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });
+ const account = accounts?.["juno-1"];
  const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
+ const signingClient = signingClients?.["juno-1"];
  const { executeContractAsync } = useExecuteContract({
    contractAddress: "juno1contract..."
  });

  await executeContractAsync({
    signingClient,
+   senderAddress: account.bech32Address, // Now required
    msg: { increment: {} },
    fee: "auto",
  });
```
