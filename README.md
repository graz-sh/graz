![graz](./banner.jpg)

[![npm/v](https://badgen.net/npm/v/graz)](https://www.npmjs.com/package/graz)
[![npm/dt](https://badgen.net/npm/dt/graz)](https://www.npmjs.com/package/graz)
[![stars](https://badgen.net/github/stars/strangelove-ventures/graz)](https://github.com/strangelove-ventures/graz)

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 10+ hooks for interfacing with [Keplr Wallet](https://www.keplr.app/) (connecting, view balances, etc.)
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

configureGraz({
  defaultChain: mainnetChains.cosmos,
});

function App() {
  return (
    <GrazProvider>
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

## Examples

- Next.js + Chakra UI: https://graz-example.vercel.app
- Vite: https://graz-vite-example.vercel.app

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

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
