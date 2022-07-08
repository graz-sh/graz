# API

## Utility Functions

### `defineChains`

The `defineChains` function allows you to standarized your chains info/config to interact with `graz` except `useSuggestChain` hook. `graz` use own `ChainInfo` config that called `GrazChain`

<details><summary>GrazChain</summary>
<p>

```tsx
interface GrazChain {
  chainId: string;
  currencies: AppCurrency[]; // from @keplr-wallet/types
  rest: string;
  rpc: string;
}
```

</p>
</details>

<details><summary>Where do I need GrazChain</summary>
<p>

- [useConnect](#useconnect)
- [useBalances](#usebalances)

</p>
</details>

#### Usage

to create your chains is simply create a record that filled with `GrazChain`

```tsx
import { defineChains } from "graz";

export const myCustomChains = defineChains({
  cosmos: {
    chainId: "cosmoshub-4",
    currencies: [
      {
        coinDenom: "atom",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      },
    ],
    rpc: "https://rpc.cosmoshub.strange.love",
    rest: "https://api.cosmoshub.strange.love",
  },
});
```

#### Return Value

return a records that typed as your defined

```tsx
{
  string: GrazChain;
}
```

## Hooks

### `useAccount`

Hook for accesing account data and connection status.

#### Usage

```tsx
import { useAccount } from "graz";
function App() {
  const { data, status } = useAccount();

  return <div>{data ? data.bech32Address : status}</div>;
}
```

#### Return Value

```tsx
{
  data: Key | null; // from @keplr-wallet/types
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: typeof reconnect;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}
```

### `useBalances`

Hook for accesing account balances based on active chain's currencies.

#### Usage

`useBalance` receiving address, but not required. if the address empty it will fetching connected account based on active chain.

```tsx
import { useBalances } from "graz";
function App() {
  const address = "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
  const { data, isFetching } = useBalances(address);

  return (
    <div>
      Balances:
      {isFetching ? (
        "Fetching balances..."
      ) : (
        <ul>
          {data?.map((coin) => (
            <li key={coin.denom}>
              {coin.amount} {coin.denom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Return Value

```tsx
{
  data: Coin[] | null; // from @cosmjs/proto-signing
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  isSuccess: boolean;
  refetch: (options: {
    throwOnError: boolean
    cancelRefetch: boolean
  }) => Promise<Coin[]>
  status: "idle" | "error" | "loading" | "success";
}
```

### `useCosmWasmClient`

hook for accessing `SigningCosmWasmClient` based on connected account

#### Usage

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  const client = useCosmWasmClient();

  async function getAccountFromClient() {
    return await client.getAccount();
  }
}
```

#### Return Value

```tsx
SigningCosmWasmClient | null; //from @cosmjs/cosmwasm-stargate
```

### `useConnect`

hook for connecting to an account with keplr wallet

#### Usage

```tsx
import { useAccount, useConnect, mainnetChains } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? account.bech32Address : <button onClick={() => connect(mainnetChains.cosmos)}>Connect</button>}
    </div>
  );
}
```

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  connect: (chain: GrazChain) => Key;
  connectAsync: (chain: GrazChain) => Promise<Key>;
  status: "idle" | "error" | "loading" | "success";
}
```

### `useDisconnect`

hook for disconnecting an account

#### Usage

```tsx
import { useAccount, useDisconnect } from "graz";

function App() {
  const { disconnect } = useDisconnect();
  const { isConnected, account, status } = useAccount();

  return (
    <div>
      {isConnected ? `Connected to ${account?.bech32Address}` : status}
      {isConnected && <button onClick={() => disconnect(undefined)}>Disconnect</button>}
    </div>
  );
}
```

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  disconnect: () => void;
  disconnectAsync: () => Promise<void>;
  status: "idle" | "error" | "loading" | "success";
}
```

### `useSigners`

hook for accessing signers based on connected account

#### Usage

```tsx
import { useSigners } from "graz";

function App() {
  const { signer } = useSigners();

  async function getAccountFromSigner() {
    return await signer.getAccount();
  }
}
```

#### Return Value

```tsx
{
  signer: (OfflineSigner & OfflineDirectSigner) | null;
  signerAmino: OfflineSigner | null;
  signerAuto: OfflineSigner | OfflineDirectSigner | null;
}
```

### `useActiveChain`

hook for accessing the `GrazChain` info based on connected chain/account

#### Usage

```tsx
import { useActiveChain } from "graz";

function App() {
  const activeChain = useActiveChain();

  return (
    <div>
      <span>Connected to {activeChain.chainId}</span>
    </div>
  );
}
```

#### Return Value

```tsx
{
  chainId: string;
  currencies: AppCurrency[]; // from @keplr-wallet/types
  rest: string;
  rpc: string;
}
```

### `useSuggestChain`

hook for suggesting a chain to keplr wallet

> Keplr's 'suggest chain' feature allows front-ends to request adding new Cosmos-SDK based blockchains that isn't natively integrated to Keplr extension. If the same chain is already added to Keplr, nothing will happen. If the user rejects the request, an error will be thrown.
>
> This allows all Cosmos-SDK blockchains to have permissionless, instant wallet and transaction signing support for front-ends.
> https://docs.keplr.app/api/suggest-chain.html

#### Usage

You need to have the `ChainInfo` to use `suggest` on `useSuggestChain`

<details><summary>ChainInfo</summary>
<p>

https://docs.keplr.app/api/suggest-chain.html

```tsx
interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency: Currency;
  readonly walletUrlForStaking?: string;
  readonly bip44: {
    coinType: number;
  };
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;

  readonly currencies: AppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: Currency[];

  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   * And, set field's type as primitive number because it is hard to restore the prototype after deserialzing if field's type is `Dec`.
   */
  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };

  /**
   * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
   */
  readonly features?: string[];
}
```

</p>
</details>

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChain } from "graz";

const OSMO = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
};

const osmosisTestnet = {
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: bech32Config: Bech32Address.defaultBech32Config("osmo"),
  currencies: [OSMO],
  feeCurrencies: [OSMO],
  coinType: 118,
};

function App(){
    const { suggest } = useSuggestChain()

    function handleSuggestChain(){
        suggest(osmosisTestnet)
    }

    return (
      <div>
        <button onClick={handleSuggestChain}>Suggest Osmosis Testnet to Keplr Wallet</button>
      </div>
    )
}
```

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  suggest: (chain: ChainInfo) => ChainInfo;
  suggestAsync: (chain: ChainInfo) => Promise<ChainInfo>;
  status: "idle" | "error" | "loading" | "success";
}
```

### `useSuggestChainAndConnect`

[Suggesting a chain](#usesuggestchain) and [connect](#useConnect) to keplr wallet in one hook.

#### Usage

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChainAndConnect } from "graz";

const OSMO = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
};

const osmosisTestnet = {
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("osmo"),
  currencies: [OSMO],
  feeCurrencies: [OSMO],
  coinType: 118,
};

function App() {
  const { suggestAndConnect } = useSuggestChainAndConnect();

  function handleSuggestAndConnect() {
    suggestAndConnect(osmosisTestnet);
  }

  return (
    <div>
      <button onClick={handleSuggestAndConnect}>Suggest and Connect to Osmosis Testnet</button>
    </div>
  );
}
```

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  status: "idle" | "error" | "loading" | "success";
  suggestAndConnect: (chain: ChainInfo) => ChainInfo;
  suggestAndConnectAsync: (chain: ChainInfo) => Promise<{ chain: ChainInfo; account: Key }>;
}
```
