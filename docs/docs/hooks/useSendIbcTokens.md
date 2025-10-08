# useSendIbcTokens

Mutation hook to send IBC tokens and returns @cosmjs/stargate's `DeliverTxResponse`.

**Important**: `senderAddress` is a required parameter that must be explicitly provided.

**Enhanced**: This hook now returns all React Query mutation properties, giving you access to utilities like `reset`, `variables`, `context`, `failureCount`, and more.

## Usage

### Basic Example

```tsx
import { useSendIbcTokens, useAccount, useStargateSigningClient } from "graz";

function SendIbcTokensComponent() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
  const { sendIbcTokensAsync, isLoading } = useSendIbcTokens();

  const account = accounts?.["cosmoshub-4"];
  const signingClient = signingClients?.["cosmoshub-4"];

  async function handleSendIbc() {
    if (!signingClient || !account) return;

    const result = await sendIbcTokensAsync({
      signingClient,
      senderAddress: account.bech32Address, // Explicit sender address
      recipientAddress: "osmo1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
      transferAmount: { denom: "uatom", amount: "1000" },
      sourcePort: "transfer",
      sourceChannel: "channel-141", // Cosmos Hub -> Osmosis
      fee: "auto",
      memo: "IBC transfer via Graz",
    });

    console.log("Transaction hash:", result.transactionHash);
  }

  return (
    <button onClick={handleSendIbc} disabled={isLoading}>
      {isLoading ? "Sending..." : "Send IBC Tokens"}
    </button>
  );
}
```

### With Timeout

```tsx
import { useSendIbcTokens, useAccount, useStargateSigningClient } from "graz";

function SendIbcWithTimeout() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
  const { sendIbcTokensAsync } = useSendIbcTokens();

  const account = accounts?.["cosmoshub-4"];
  const signingClient = signingClients?.["cosmoshub-4"];

  async function handleSend() {
    if (!signingClient || !account) return;

    // Set timeout to 10 minutes from now
    const timeoutTimestamp = Math.floor(Date.now() / 1000) + 600;

    await sendIbcTokensAsync({
      signingClient,
      senderAddress: account.bech32Address,
      recipientAddress: "osmo1...",
      transferAmount: { denom: "uatom", amount: "1000" },
      sourcePort: "transfer",
      sourceChannel: "channel-141",
      timeoutTimestamp,
      fee: "auto",
    });
  }

  return <button onClick={handleSend}>Send IBC</button>;
}
```

### With Event Handlers

```tsx
import { useSendIbcTokens } from "graz";

function SendIbcWithEvents() {
  const { sendIbcTokensAsync } = useSendIbcTokens({
    onSuccess: (data) => {
      console.log("IBC transfer successful!", data.transactionHash);
    },
    onError: (error) => {
      console.error("IBC transfer failed:", error);
    },
    onMutate: (args) => {
      console.log("Starting IBC transfer...", args);
    },
  });

  // ... rest of component
}
```

## Types

### `SendIbcTokensArgs`

```ts
{
  signingClient: SigningStargateClient;
  senderAddress: string; // Required - address sending the tokens
  recipientAddress: string;
  transferAmount: Coin; // { denom: string, amount: string }
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight?: Height; // From cosmjs-types/ibc/core/client/v1/client
  timeoutTimestamp?: number; // Unix timestamp in seconds
  fee: number | StdFee | "auto";
  memo?: string;
}
```

## Hook Params

Object params for event handlers:

```ts
{
  onError?: (error: unknown, args: SendIbcTokensArgs) => void | Promise<void>;
  onMutate?: (args: SendIbcTokensArgs) => void;
  onSuccess?: (data: DeliverTxResponse) => void | Promise<void>;
}
```

## Return Value

```tsx
{
  // Custom mutation functions
  sendIbcTokens: (args: SendIbcTokensArgs) => void;
  sendIbcTokensAsync: (args: SendIbcTokensArgs) => Promise<DeliverTxResponse>;

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
  variables?: SendIbcTokensArgs; // Arguments passed to the last mutation call
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
  const { sendIbcTokensAsync } = useSendIbcTokens();

  await sendIbcTokensAsync({
    signingClient,
+   senderAddress: account.bech32Address, // Now required
    recipientAddress: "osmo1...",
    transferAmount: { denom: "uatom", amount: "1000" },
    sourcePort: "transfer",
    sourceChannel: "channel-141",
    fee: "auto",
  });
```
