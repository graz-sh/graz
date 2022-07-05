> **🚧 Currently in development, readme and published package coming soon 🚧**

# wadesta

**React hooks for Cosmos**

**wadesta** is a collection of React hooks containing everything you need to start working with Cosmos 🪐

- [wadesta](#wadesta)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick start](#quick-start)
  - [Utility Functions](#utility-functions)
    - [`defineChains`](#definechains)
      - [Usage](#usage)
      - [Return Value](#return-value)
  - [Hooks](#hooks)
    - [`useAccount`](#useaccount)
      - [Usage](#usage-1)
      - [Return Value](#return-value-1)
    - [`useBalances`](#usebalances)
      - [Usage](#usage-2)
      - [Return Value](#return-value-2)
    - [`useCosmWasmClient`](#usecosmwasmclient)
      - [Usage](#usage-3)
      - [Return Value](#return-value-3)
    - [`useConnect`](#useconnect)
      - [Usage](#usage-4)
      - [Return Value](#return-value-4)
    - [`useDisconnect`](#usedisconnect)
      - [Usage](#usage-5)
      - [Return Value](#return-value-5)
  - [Development Guide](#development-guide)
  - [License](#license)

## Features

- 💳 Currently supports Keplr
- 🪝 Hooks for interacting with wallets, balances, signer, client, chains and more coming soon!
- 🛠 Utilty functions
- 🔄 Auto reconnect wallet
- 😵‍💫 Caching, request deduplication, multicall, batching, and persistence
- 😇 Typescript ready

and a lot more coming soon 👀

## Installation

```sh
# using npm
npm install wadesta

# using yarn
yarn add wadesta
```

## Quick start

Don't waste your time wrapping Cosmos wallets API, connecting a wallet is 60 seconds away. LFG 🚀

```tsx
import { WadestaProvider } from "wadesta";

function App() {
  return (
    <WadestaProvider>
      <Wallet />
    </WadestaProvider>
  );
}
```

```tsx
import { defaultChains, useAccount, useConnect, useDisconnect } from "wadesta";

function Wallet() {
  const { connect, status } = useConnect();
  const { data: account, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return isConnected ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <div>
      {account ? `Connected to ${account.bech32Address}` : status}
      <button onClick={handleConnect}>{isConnected ? "Connect" : "Disconnect"}</button>
    </div>
  );
}
```

In this example, we wrap our root component with `WadestaProvider`. The provider is set up to handle auto reconnect wallet and data persistence.

> We provide certain chains as `defaultChains` that you can use.

Next, we use the `useConnect` hook to connect to a `chain`(e.g. cosmoshub). Finally we show the account's address with `useAccount` and allow the to disconnect with `useDisconnect` hook.

## Utility Functions

### `defineChains`

The `defineChains` function allows you to standarized your chains info/config to interact with `wadesta` except `useSuggestChain` hook. `wadesta` use own `ChainInfo` config that called `WadestaChain`

<details><summary>WadestaChain</summary>
<p>

```tsx
interface WadestaChain {
  chainId: string;
  currencies: AppCurrency[]; // from @keplr-wallet/types
  rest: string;
  rpc: string;
}
```

</p>
</details>

<details><summary>Where do I need WadestaChain</summary>
<p>

- [useConnect](#useConnect)
- [useBalances](#useBalances)

</p>
</details>

#### Usage

to create your chains is simply create a record that filled with `WadestaChain`

```tsx
import { defineChains } from "wadesta";

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
  string: WadestaChain;
}
```

## Hooks

### `useAccount`

Hook for accesing account data and connection status.

#### Usage

```tsx
import { useAccount } from "wadesta";
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
import { useBalances } from "wadesta";
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
          ))}{" "}
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
import { useCosmWasmClient } from "wadesta";

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
import { useAccount, useConnect, defaultChains } from "wadesta";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? account.bech32Address : <button onClick={() => connect(defaultChains.cosmos)}>Connect</button>}
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
  connect: (chain: WadestaChain) => Key;
  connectAsync: (chain: WadestaChain) => Promise<Key>;
  status: "idle" | "error" | "loading" | "success";
}
```

### `useDisconnect`

hook for disconnecting to an account

#### Usage

```tsx
import { useAccount, useDisconnect, defaultChains } from "wadesta";

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

## Development Guide

TODO

## License

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
