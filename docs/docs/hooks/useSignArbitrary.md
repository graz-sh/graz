# useSignArbitrary

Mutation hook to sign arbitrary messages with the active wallet's ADR-36-compatible signing API.

Use this for authentication flows where your app asks a connected wallet address to sign a nonce, challenge, or other plain message. Wallets that do not expose `signArbitrary` reject with an explicit unsupported-method error.

## Usage

### Basic Example

```tsx
import { useAccount, useSignArbitrary } from "graz";

function SignInButton() {
  const chainId = "cosmoshub-4";
  const { data: accounts } = useAccount({ chainId: [chainId] });
  const { signArbitraryAsync, isPending } = useSignArbitrary();

  const account = accounts?.[chainId];

  async function handleSignIn() {
    if (!account) return;

    const signature = await signArbitraryAsync({
      chainId,
      signerAddress: account.bech32Address,
      data: "Sign in to example.com with nonce 12345",
    });

    console.log("Signature:", signature);
  }

  return (
    <button onClick={handleSignIn} disabled={!account || isPending}>
      {isPending ? "Signing..." : "Sign in"}
    </button>
  );
}
```

### With Event Handlers

```tsx
import { useSignArbitrary } from "graz";

function SignMessage() {
  const { signArbitrary } = useSignArbitrary({
    onSuccess: (signature) => {
      console.log("Message signed", signature);
    },
    onError: (error) => {
      console.error("Signing failed", error);
    },
    onLoading: (args) => {
      console.log("Signing message for", args.signerAddress);
    },
  });

  // ... call signArbitrary({ chainId, signerAddress, data })
}
```

### Action Usage

You can call the framework-agnostic action directly outside React components:

```ts
import { signArbitrary } from "graz";

const signature = await signArbitrary({
  chainId: "cosmoshub-4",
  signerAddress: "cosmos1...",
  data: "Sign in to example.com",
});
```

Pass `walletType` when you need to target a specific wallet instead of the active wallet from the Graz store.

## Types

### `SignArbitraryArgs`

```ts
{
  walletType?: WalletType;
  chainId: string;
  signerAddress: string;
  data: string | Uint8Array;
}
```

The hook and action resolve the wallet, then call `wallet.signArbitrary(chainId, signerAddress, data)`.

## Hook Params

```ts
{
  onError?: (error: unknown, args: SignArbitraryArgs) => void | Promise<void>;
  onLoading?: (args: SignArbitraryArgs) => void;
  onSuccess?: (signature: StdSignature) => void | Promise<void>;
}
```

## Return Value

```tsx
{
  // Custom mutation functions
  signArbitrary: (args: SignArbitraryArgs) => void;
  signArbitraryAsync: (args: SignArbitraryArgs) => Promise<StdSignature>;

  // React Query mutation properties
  data?: StdSignature;
  error: unknown;
  failureCount: number;
  failureReason: Error | null;
  isError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  status: "idle" | "pending" | "error" | "success";
  variables?: SignArbitraryArgs;
  submittedAt: number;
  reset: () => void;
  context: unknown;
}
```

`StdSignature` is from `@cosmjs/amino`.
