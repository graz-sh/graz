# useSendTokens

Mutation hook to send tokens and returns @cosmjs/stargate's `DeliverTxResponse`.

**Important**: `senderAddress` is a required parameter that must be explicitly provided.

**Enhanced**: This hook now returns all React Query mutation properties, giving you access to utilities like `reset`, `variables`, `context`, `failureCount`, and more.

## Usage

### Basic Example

```tsx
import { useSendTokens, useAccount, useStargateSigningClient } from "graz";

function SendTokensComponent() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
  const { sendTokensAsync, isLoading } = useSendTokens();

  const account = accounts?.["cosmoshub-4"];
  const signingClient = signingClients?.["cosmoshub-4"];

  async function handleSend() {
    if (!signingClient || !account) return;

    const result = await sendTokensAsync({
      signingClient,
      senderAddress: account.bech32Address, // Explicit sender address
      recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
      amount: [{ denom: "uatom", amount: "1000" }],
      fee: "auto",
      memo: "Sent via Graz",
    });

    console.log("Transaction hash:", result.transactionHash);
  }

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? "Sending..." : "Send Tokens"}
    </button>
  );
}
```

### With Custom Fee

```tsx
import { useSendTokens, useAccount, useStargateSigningClient } from "graz";

function SendWithCustomFee() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
  const { sendTokensAsync } = useSendTokens();

  const account = accounts?.["cosmoshub-4"];
  const signingClient = signingClients?.["cosmoshub-4"];

  async function handleSend() {
    if (!signingClient || !account) return;

    await sendTokensAsync({
      signingClient,
      senderAddress: account.bech32Address,
      recipientAddress: "cosmos1...",
      amount: [{ denom: "uatom", amount: "1000" }],
      fee: {
        amount: [{ denom: "uatom", amount: "500" }],
        gas: "200000",
      },
    });
  }

  return <button onClick={handleSend}>Send</button>;
}
```

### With Event Handlers

```tsx
import { useSendTokens } from "graz";

function SendWithEvents() {
  const { sendTokensAsync } = useSendTokens({
    onSuccess: (data) => {
      console.log("Transaction successful!", data.transactionHash);
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
    },
    onMutate: (args) => {
      console.log("Starting transaction...", args);
    },
  });

  // ... rest of component
}
```

## Types

### `SendTokensArgs`

```ts
{
  signingClient: SigningStargateClient | SigningCosmWasmClient;
  senderAddress: string; // Required - address sending the tokens
  recipientAddress: string;
  amount: Coin[]; // Array of { denom: string, amount: string }
  fee: number | StdFee | "auto";
  memo?: string;
}
```

## Hook Params

Object params for event handlers:

```ts
{
  onError?: (error: unknown, args: SendTokensArgs) => void | Promise<void>;
  onMutate?: (args: SendTokensArgs) => void;
  onSuccess?: (data: DeliverTxResponse) => void | Promise<void>;
}
```

## Return Value

```tsx
{
  // Custom mutation functions
  sendTokens: (args: SendTokensArgs) => void;
  sendTokensAsync: (args: SendTokensArgs) => Promise<DeliverTxResponse>;

  // All React Query mutation properties
  data?: DeliverTxResponse; // From @cosmjs/stargate
  error: unknown;
  failureCount: number;
  failureReason: Error | null;
  isError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  status: "idle" | "pending" | "error" | "success";
  variables?: SendTokensArgs; // Arguments passed to the last mutation call
  submittedAt: number;

  // Mutation methods
  reset: () => void; // Reset mutation state

  // Context (from onMutate)
  context: unknown;
}
```

Note: `isLoading` has been replaced by `isPending` in React Query v5. Both work, but `isPending` is the modern property name.

## Migration from Previous Version

If upgrading from an older version where `senderAddress` was optional:

```diff
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
+ const account = accounts?.["cosmoshub-4"];
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
+ const signingClient = signingClients?.["cosmoshub-4"];
  const { sendTokensAsync } = useSendTokens();

  await sendTokensAsync({
    signingClient,
+   senderAddress: account.bech32Address, // Now required
    recipientAddress: "cosmos1...",
    amount: [{ denom: "uatom", amount: "1000" }],
    fee: "auto",
  });
```
