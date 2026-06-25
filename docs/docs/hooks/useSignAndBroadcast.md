# useSignAndBroadcast

Mutation hook to sign and broadcast arbitrary encoded Cosmos messages with a `SigningStargateClient`.

Use this when you already have one or more `EncodeObject` messages and want Graz to call CosmJS'
`signAndBroadcast` directly.

**Important**: `senderAddress` is a required parameter that must be explicitly provided.

**Enhanced**: This hook returns all React Query mutation properties, giving you access to utilities like
`reset`, `variables`, `context`, `failureCount`, and more.

## Usage

### Basic Example

```tsx
import type { EncodeObject } from "@cosmjs/proto-signing";
import { useAccount, useSignAndBroadcast, useStargateSigningClient } from "graz";

function BroadcastMessages() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
  const { signAndBroadcastAsync, isPending } = useSignAndBroadcast();

  const account = accounts?.["cosmoshub-4"];
  const signingClient = signingClients?.["cosmoshub-4"];

  async function broadcast() {
    if (!account || !signingClient) return;

    const messages: EncodeObject[] = [
      {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: account.bech32Address,
          toAddress: "cosmos1recipient...",
          amount: [{ denom: "uatom", amount: "1000" }],
        },
      },
    ];

    const result = await signAndBroadcastAsync({
      signingClient,
      senderAddress: account.bech32Address,
      messages,
      fee: "auto",
      memo: "Sent via Graz",
    });

    console.log(result.transactionHash);
  }

  return (
    <button onClick={broadcast} disabled={isPending}>
      Broadcast
    </button>
  );
}
```

### With Event Handlers

```tsx
import { useSignAndBroadcast } from "graz";

function BroadcastWithEvents() {
  const { signAndBroadcastAsync } = useSignAndBroadcast({
    onSuccess: (data) => {
      console.log("Transaction successful!", data.transactionHash);
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
    },
    onLoading: (args) => {
      console.log("Broadcasting messages...", args.messages.length);
    },
  });

  // ... rest of component
}
```

### Framework-Agnostic Action

`signAndBroadcast` is also available as a public action for non-React usage.

```ts
import type { EncodeObject } from "@cosmjs/proto-signing";
import { signAndBroadcast } from "graz";

const messages: EncodeObject[] = [
  {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: senderAddress,
      toAddress: "cosmos1recipient...",
      amount: [{ denom: "uatom", amount: "1000" }],
    },
  },
];

const result = await signAndBroadcast({
  signingClient,
  senderAddress,
  messages,
  fee: "auto",
  memo: "Sent via Graz",
});

console.log(result.transactionHash);
```

## Types

### `SignAndBroadcastArgs`

```ts
{
  signingClient?: SigningStargateClient; // Required at runtime
  senderAddress?: string; // Required at runtime - address signing the messages
  messages: readonly EncodeObject[]; // Cosmos messages to sign and broadcast
  fee: number | StdFee | "auto";
  memo?: string;
  timeoutHeight?: bigint;
}
```

`signingClient` and `senderAddress` are optional at the TypeScript action boundary so mutation args can be
assembled from wallet state that may still be loading. The action still requires them at runtime and throws if
either value is missing.

## Hook Params

Object params for event handlers:

```ts
{
  onError?: (error: unknown, args: SignAndBroadcastArgs) => void | Promise<void>;
  onLoading?: (args: SignAndBroadcastArgs) => void;
  onSuccess?: (data: DeliverTxResponse) => void | Promise<void>;
}
```

## Return Value

```tsx
{
  // Custom mutation functions
  signAndBroadcast: (args: SignAndBroadcastArgs) => void;
  signAndBroadcastAsync: (args: SignAndBroadcastArgs) => Promise<DeliverTxResponse>;

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
  variables?: SignAndBroadcastArgs; // Arguments passed to the last mutation call
  submittedAt: number;

  // Mutation methods
  reset: () => void; // Reset mutation state

  // Context (from onLoading)
  context: unknown;
}
```

Note: `isLoading` has been replaced by `isPending` in React Query v5. Both work, but `isPending` is the modern property name.
