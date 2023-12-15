![graz](./banner.png)

[![npm/v](https://badgen.net/npm/v/graz)](https://www.npmjs.com/package/graz)
[![npm/dt](https://badgen.net/npm/dt/graz)](https://www.npmjs.com/package/graz)
[![stars](https://badgen.net/github/stars/graz-sh/graz)](https://github.com/graz-sh/graz)

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 20+ hooks for interfacing with wallets, clients, signers, etc. (connecting, view balances, send tokens, etc.)
- 💳 Multiple wallet supports (Keplr, Leap, Cosmostation, Vectis, Station, XDefi, Metamask Snap, WalletConnect)
- ⚙️ Generate mainnet & testnet `ChainInfo`
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

### Install peer dependencies

To avoid version mismatch we decided to make these packages as peer dependencies:

```shell
# using npm
npm install @cosmjs/cosmwasm-stargate @cosmjs/launchpad @cosmjs/proto-signing @cosmjs/stargate @cosmjs/tendermint-rpc long

# using yarn
yarn add @cosmjs/cosmwasm-stargate @cosmjs/launchpad @cosmjs/proto-signing @cosmjs/stargate @cosmjs/tendermint-rpc long

# using pnpm
pnpm add @cosmjs/cosmwasm-stargate @cosmjs/launchpad @cosmjs/proto-signing @cosmjs/stargate @cosmjs/tendermint-rpc long
```

## Quick start

Wrap your React app with `<GrazProvider />` and use available `graz` hooks anywhere:

```jsx
import { GrazProvider } from "graz";

const cosmoshub: ChainInfo = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  //... rest of cosmoshub ChainInfo
}

function App() {
  return (
    <GrazProvider grazOptions={{
      chains: [cosmoshub]
    }}>
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

- Next.js + Multi chain: https://graz.sh/examples/starter ([source code](https://github.com/graz-sh/graz/tree/dev/example/starter/))
- Next.js + Chakra UI: https://graz.sh/examples/next ([source code](./example/next/))
- Vite: https://graz.sh/examples/vite ([source code](./example/vite/))

## API

You can read more about available hooks and exports on [Documentation Site](https://graz.sh/) or via [paka.dev](https://paka.dev/npm/graz).

## Maintainers

- Griko Nibras ([@grikomsn](https://github.com/grikomsn))
- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2023 Graz](./LICENSE)
