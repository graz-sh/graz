![graz](./banner.jpg)

[![npm/v](https://badgen.net/npm/v/graz)](https://www.npmjs.com/package/graz)
[![npm/dt](https://badgen.net/npm/dt/graz)](https://www.npmjs.com/package/graz)
[![stars](https://badgen.net/github/stars/strangelove-ventures/graz)](https://github.com/strangelove-ventures/graz)

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 20+ hooks for interfacing with wallets, clients, signers, etc. (connecting, view balances, send tokens, etc.)
- 💳 Multiple wallet supports (Keplr, Leap, Cosmostation, WalletConnect )
- ⚙️ Generate mainnet & testnet `ChainInfo` from chain registry
- 📚 Built-in caching, request deduplication, and all the good stuff from [`@tanstack/react-query`](https://tanstack.com/query) and [`zustand`](https://github.com/pmndrs/zustand)
- 🔄 Auto refresh on wallet and network change
- 👏 Fully typed and tree-shakeable
- ...and many more ✨

## Requirements

`graz` requires `react@>=17` due to using [function components and hooks](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) and the [new JSX transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).

## Installing

Install `graz` using [npm](https://docs.npmjs.com/cli/v8/commands/npm-install), [yarn](https://yarnpkg.com/cli/add), or [pnpm](https://pnpm.io/cli/install):

```sh
# using npm
npm install graz

# using yarn
yarn add graz

# using pnpm
pnpm add graz
```

## Quick start

Wrap your React app with `<GrazProvider />` and use available `graz` hooks anywhere:

```jsx
import { GrazProvider, mainnetChains } from "graz";

function App() {
  return (
    <GrazProvider
      // optional
      grazOptions={{
        defaultChain: mainnetChains.cosmos,
      }}
    >
      <Wallet />
    </GrazProvider>
  );
}
```

```jsx
import { mainnetChains, useAccount, useConnect, useDisconnect } from "graz";

function Wallet() {
  const { connect, status } = useConnect();
  const { data: account, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return isConnected ? disconnect() : connect();
  }

  return (
    <div>
      {account ? `Connected to ${account.bech32Address}` : status}
      <button onClick={handleConnect}>{isConnected ? "Disconnect" : "Connect"}</button>
    </div>
  );
}
```

## Generate ChainInfo

with `graz generate` you can generate mainnet and testnet chains directly from [Cosmos chain registry](https://github.com/cosmos/chain-registry), To generate `ChainInfo` `graz` is required in your project.

```shell
# using yarn
yarn graz generate

# using npm
npm graz generate

# using pnpm
pnpm graz generate
```

### Usage

FYI: it's fully typed❤️

```tsx
import { mainnetChains, getChainData, getChainDataArray } from "graz/chains";

mainnetChains.cosmoshub;

// Get chains only what you need
const { cosmoshub } = getChainData("cosmoshub");
const { cosmoshub, juno } = getChainData(["cosmoshub", "juno"]);

const [cosmoshub] = getChainData("cosmoshub");
const [cosmoshub, juno] = getChainDataArray(["cosmoshub", "juno"]);

// usage
cosmoshub.chainInfo;
cosmoshub.assetList;
cosmoshub.registry;
```

## Examples

- Next.js + Chakra UI: https://graz-example.vercel ([source code](./example/next/))
- Vite: https://graz-vite-example.vercel.app ([source code](./example/vite/))

## Third-party dependencies

`graz` uses various dependencies such as [`@cosmjs/cosmwasm-stargate`](https://www.npmjs.com/package/@cosmjs/cosmwasm-stargate) and [`@keplr-wallet/types`](https://www.npmjs.com/package/@keplr-wallet/types).

Rather than importing those packages directly, you can import from [`graz/dist/cosmjs`](./packages/graz/src/cosmjs.ts) and [`graz/dist/keplr`](./packages/graz/src/keplr.ts) which re-exports all respective dependencies:

```diff
- import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
+ import type { CosmWasmClient } from "graz/dist/cosmjs";
```

But if you prefer importing from their respective pacakges, you can install dependencies that `graz` uses for better intellisense:

```sh
# using pnpm
pnpm add @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @keplr-wallet/types
```

## API

You can read more about available hooks and exports on [Documentation Site](https://graz.strange.love/) or via [paka.dev](https://paka.dev/npm/graz).

## Maintainers

- Griko Nibras ([@grikomsn](https://github.com/grikomsn))
- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2023 Strangelove Ventures](./LICENSE)
