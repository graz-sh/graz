# useSignAndBroadcast

Mutation hook to sign and broadcast arbitrary encoded Cosmos messages with a `SigningStargateClient`.

## Usage

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

## Types

### `SignAndBroadcastArgs`

```ts
{
  signingClient: SigningStargateClient;
  senderAddress: string;
  messages: readonly EncodeObject[];
  fee: number | StdFee | "auto";
  memo?: string;
  timeoutHeight?: bigint;
}
```

## Return Value

```ts
{
  signAndBroadcast: (args: SignAndBroadcastArgs) => void;
  signAndBroadcastAsync: (args: SignAndBroadcastArgs) => Promise<DeliverTxResponse>;
}
```
