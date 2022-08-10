# useClients

hook for accessing `CosmWasmClient` and `StargateClient` based on connected account

#### Usage

```tsx
import { useClients } from "graz";

function App() {
  const { data } = useClients();
  const { cosmWasm, stargate } = data;

  async function getAccountFromClient() {
    return await cosmWasm.getAccount();
  }
}
```

#### Return Value

```tsx
{
  data: {
    cosmWasm: CosmWasmClient, //from @cosmjs/cosmwasm-stargate
    stargate: StargateClient //from @cosmjs/stargate
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
