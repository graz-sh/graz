---
sidebar_position: 1
---

# Overview

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 8+ hooks for interfacing with [Keplr Wallet](https://www.keplr.app/) (connecting, view balances, etc.)
- 📚 Built-in caching, request deduplication, and all the good stuff from [`@tanstack/react-query`](https://tanstack.com/query) and [`zustand`](https://github.com/pmndrs/zustand)
- 🔄 Auto refresh on wallet and network change
- 👏 Fully typed and tree-shakeable
- ...and many more ✨

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
# using yarn
yarn add @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @keplr-wallet/types
```

## Maintainers

- Griko Nibras ([@grikomsn](https://github.com/grikomsn))
- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
