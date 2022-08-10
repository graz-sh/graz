# useClients

hook for accessing `SigningCosmWasmClient` and `SigningStargateClient` based on connected account

#### Usage

```tsx
import { useSigningClients } from "graz";

function App() {
  const { data } = useSigningClients();
  const { cosmWasm, stargate } = data;

  async function sendTokens() {
    return await cosmWasm.sendTokens(senderAddress, recipientAddress, amountPayload, fee);
  }
}
```

#### Return Value

```tsx
{
  data: {
    cosmWasm: SigningCosmWasmClient, //from @cosmjs/cosmwasm-stargate
    stargate: SigningStargateClient //from @cosmjs/stargate
 };
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  isSuccess: boolean;
  refetch: (options: {
    throwOnError: boolean
    cancelRefetch: boolean
  }) => Promise<Coin[]>
  status: "error" | "loading" | "success"
}
```
