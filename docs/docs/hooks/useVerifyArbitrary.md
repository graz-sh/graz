# useVerifyArbitrary

Mutation hook to verify arbitrary message signatures with the active wallet's ADR-36-compatible verification API.

Use this with signatures produced by `useSignArbitrary` or the `signArbitrary` action. Wallets that do not expose `verifyArbitrary` reject with an explicit unsupported-method error.

## Usage

### Basic Example

```tsx
import { useAccount, useSignArbitrary, useVerifyArbitrary } from "graz";

function SignAndVerify() {
  const chainId = "cosmoshub-4";
  const message = "Sign in to example.com with nonce 12345";
  const { data: accounts } = useAccount({ chainId: [chainId] });
  const { signArbitraryAsync } = useSignArbitrary();
  const { verifyArbitraryAsync, isPending } = useVerifyArbitrary();

  const account = accounts?.[chainId];

  async function handleVerify() {
    if (!account) return;

    const signature = await signArbitraryAsync({
      chainId,
      signerAddress: account.bech32Address,
      data: message,
    });

    const verified = await verifyArbitraryAsync({
      chainId,
      signerAddress: account.bech32Address,
      data: message,
      signature,
    });

    console.log("Verified:", verified);
  }

  return (
    <button onClick={handleVerify} disabled={!account || isPending}>
      {isPending ? "Verifying..." : "Sign and verify"}
    </button>
  );
}
```

### With Event Handlers

```tsx
import { useVerifyArbitrary } from "graz";

function VerifyMessage() {
  const { verifyArbitrary } = useVerifyArbitrary({
    onSuccess: (verified) => {
      console.log("Signature valid:", verified);
    },
    onError: (error) => {
      console.error("Verification failed", error);
    },
    onLoading: (args) => {
      console.log("Verifying message for", args.signerAddress);
    },
  });

  // ... call verifyArbitrary({ chainId, signerAddress, data, signature })
}
```

### Action Usage

You can call the framework-agnostic action directly outside React components:

```ts
import { verifyArbitrary } from "graz";

const verified = await verifyArbitrary({
  chainId: "cosmoshub-4",
  signerAddress: "cosmos1...",
  data: "Sign in to example.com",
  signature,
});
```

Pass `walletType` when you need to target a specific wallet instead of the active wallet from the Graz store.

## Types

### `VerifyArbitraryArgs`

```ts
{
  walletType?: WalletType;
  chainId: string;
  signerAddress: string;
  data: string | Uint8Array;
  signature: StdSignature;
}
```

The hook and action resolve the wallet, then call `wallet.verifyArbitrary(chainId, signerAddress, data, signature)`.

## Hook Params

```ts
{
  onError?: (error: unknown, args: VerifyArbitraryArgs) => void | Promise<void>;
  onLoading?: (args: VerifyArbitraryArgs) => void;
  onSuccess?: (verified: boolean) => void | Promise<void>;
}
```

## Return Value

```tsx
{
  // Custom mutation functions
  verifyArbitrary: (args: VerifyArbitraryArgs) => void;
  verifyArbitraryAsync: (args: VerifyArbitraryArgs) => Promise<boolean>;

  // React Query mutation properties
  data?: boolean;
  error: unknown;
  failureCount: number;
  failureReason: Error | null;
  isError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  status: "idle" | "pending" | "error" | "success";
  variables?: VerifyArbitraryArgs;
  submittedAt: number;
  reset: () => void;
  context: unknown;
}
```

`StdSignature` is from `@cosmjs/amino`.
