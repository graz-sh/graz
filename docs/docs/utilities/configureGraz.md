# configureGraz

`configureGraz` is a function that you can use to set default action or state that provided to interact with `graz`

#### Arguments

```tsx
{
    defaultChain?: GrazChain,
    defaultSigningClient?: "cosmWasm" | "stargate",
    onKeplrNotFound?: () => void
}
```
