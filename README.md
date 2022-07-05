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
  data: Key | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: typeof reconnect;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}
```

## Development Guide

TODO

## License

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
