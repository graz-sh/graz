# Graz

![graz](./banner.png)

[![npm/v](https://badgen.net/npm/v/graz)](https://www.npmjs.com/package/graz)
[![npm/dt](https://badgen.net/npm/dt/graz)](https://www.npmjs.com/package/graz)
[![stars](https://badgen.net/github/stars/graz-sh/graz)](https://github.com/graz-sh/graz)

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 20+ hooks for interfacing with wallets, clients, signers, etc. (connecting, view balances, send tokens, etc.)
- 💳 Multiple wallet supports (Keplr, Leap, Cosmostation, Vectis, Station, XDefi, Metamask Snap, WalletConnect, Compass, Initia, OKX, Para, Cactus)
- ⚙️ Generate mainnet & testnet `ChainInfo`
- 📚 Built-in caching, request deduplication, and all the good stuff from [`@tanstack/react-query`](https://tanstack.com/query) and [`zustand`](https://github.com/pmndrs/zustand)
- 🔄 Auto refresh on wallet and network change
- 👏 Fully typed and tree-shakeable
- 📦 Lightweight and optimized (only ~220 KB package size)
- ⚡️ Optimized build system for fast development and production builds
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

To avoid version mismatch we decided to make these packages peer dependencies

```shell
# using npm
npm install @cosmjs/amino @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding

# using yarn
yarn add @cosmjs/amino @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding

# using pnpm
pnpm add @cosmjs/amino @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding
```

## Quick start

Wrap your React app with `<QueryClientProvider />` and `<GrazProvider />`, and use available `graz` hooks anywhere:

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmoshub } from "graz/chains";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{
        chains: [cosmoshub]
      }}>
        <Wallet />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

```jsx
import { useAccount, useConnect, useDisconnect } from "graz";
import { cosmoshub } from "graz/chains";

function Wallet() {
  const { connect, status } = useConnect();
  // useAccount returns a Record keyed by chain id: Record<chainId, Key>
  const { data: accounts, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const account = accounts?.[cosmoshub.chainId];

  function handleConnect() {
    return isConnected ? disconnect() : connect({ chainId: cosmoshub.chainId });
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

- **Playground (Next.js + Multi-Chain)** - Full-featured demo with multi-chain support and modern UI ([source code](./example/playground/))
- **Vite** - Simple Vite app showcasing core functionality ([source code](./example/vite/))

## Why Developers Love Graz

- **🎯 Simple & Intuitive API** - Get started in minutes with well-designed hooks that follow React best practices
- **🚀 Production Ready** - Battle-tested in production apps across the Cosmos ecosystem
- **📖 Excellent Documentation** - Comprehensive guides, examples, and API references to help you build faster
- **🔧 Developer Experience** - TypeScript support, autocomplete, and helpful error messages make development a breeze
- **🤝 Active Maintenance** - Regular updates, bug fixes, and new features based on community feedback
- **🌟 Ecosystem Integration** - Built on proven tools like TanStack Query and Zustand for reliability
- **⚡️ Performance Focused** - Optimized for speed with smart caching, request deduplication, and minimal re-renders
- **🔄 Multi-Chain First** - Designed from the ground up to support multi-chain applications seamlessly

## Featured Projects Using Graz

Graz powers some of the most popular applications in the Cosmos ecosystem:

- **[dYdX](https://dydx.trade/)** - Leading decentralized exchange for perpetual trading
- **[Stargaze](https://www.stargaze.zone/)** - The premier Cosmos NFT marketplace
- **[Skip Go](https://go.skip.build/)** - Cross-chain swaps and bridging infrastructure

_Want to add your project? [Submit a PR](https://github.com/graz-sh/graz/blob/main/CONTRIBUTING.md) or [open an issue](https://github.com/graz-sh/graz/issues/new)!_

## API

You can read more about available hooks and exports on [Documentation Site](https://graz.sh/) or via [paka.dev](https://paka.dev/npm/graz).

## Maintainers

- Nur Fikri/Kiki ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2023 Graz](./LICENSE)
