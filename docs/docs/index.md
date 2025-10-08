---
sidebar_position: 1
---

# Overview

`graz` is a comprehensive React hooks library for building applications in the [Cosmos ecosystem](https://cosmos.network/). It provides everything you need to interact with Cosmos blockchains and wallets through a simple, intuitive API.

## Why Graz?

- 🪝 **20+ React Hooks** - Complete toolkit for wallet connections, transactions, queries, and more
- 💳 **Multi-Wallet Support** - Keplr, Leap, Cosmostation, Vectis, Station, XDefi, WalletConnect, and more
- 🌐 **Multi-Chain Ready** - Built-in support for connecting to and interacting with multiple chains simultaneously
- ⚙️ **ChainInfo Generator** - Generate mainnet & testnet chain configurations with ease
- 📚 **Smart Caching** - Powered by [@tanstack/react-query](https://tanstack.com/query) for optimal performance
- 🔄 **Auto-Refresh** - Automatically updates on wallet and network changes
- 📦 **Lightweight** - Only ~220 KB, fully tree-shakeable
- 🎯 **Type-Safe** - Built with TypeScript for excellent IDE support
- ⚡️ **Developer Experience** - Fast builds, instant hot-reload, great documentation

## Quick Example

```tsx
import { useAccount, useConnect, useBalance } from "graz";

function WalletStatus() {
  const { connect } = useConnect();
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const account = accounts?.["cosmoshub-4"];

  const { data: balance } = useBalance({
    chainId: "cosmoshub-4",
    bech32Address: account?.bech32Address || "",
    denom: "uatom",
    enabled: Boolean(account?.bech32Address),
  });

  return (
    <div>
      {account ? (
        <div>
          <p>Connected: {account.bech32Address}</p>
          <p>Balance: {balance?.amount} ATOM</p>
        </div>
      ) : (
        <button onClick={() => connect({ chainId: ["cosmoshub-4"] })}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Requirements

- **React** `>=17` - Uses function components, hooks, and the new JSX transform
- **Node.js** `>=14` - For building and bundling

## Installation

Install `graz` using your preferred package manager:

```shell
# npm
npm install graz

# yarn
yarn add graz

# pnpm
pnpm add graz
```

### Peer Dependencies

Install required CosmJS packages to avoid version conflicts:

```shell
# npm
npm install @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding

# yarn
yarn add @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding

# pnpm
pnpm add @cosmjs/cosmwasm-stargate @cosmjs/proto-signing @cosmjs/stargate @cosmjs/encoding
```

## Quick Start

1. **Wrap your app** with `QueryClientProvider` and `GrazProvider`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";

const queryClient = new QueryClient();

const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... see full ChainInfo configuration in Getting Started
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ chains: [cosmoshub] }}>
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

2. **Use hooks** anywhere in your app:

```tsx
import { useAccount, useConnect } from "graz";

function ConnectButton() {
  const { connect } = useConnect();
  const { data: accounts, isConnected } = useAccount({
    chainId: ["cosmoshub-4"],
  });

  return (
    <button onClick={() => (isConnected ? null : connect({ chainId: ["cosmoshub-4"] }))}>
      {isConnected ? accounts?.["cosmoshub-4"]?.bech32Address : "Connect"}
    </button>
  );
}
```

## Next Steps

- 📖 [Getting Started Guide](./getting-started) - Complete setup walkthrough
- 🎣 [Hooks Reference](./category/hooks) - Explore all available hooks
- 🔗 [Multi-Chain Guide](./guides/multi-chain) - Build multi-chain applications
- 🎨 [Live Examples](./examples) - See working demos

## Example Applications

- **Playground (Next.js + Multi-Chain)** - Full-featured demo with multi-chain support and modern UI • [Code](https://github.com/graz-sh/graz/tree/main/example/playground/)
- **Vite** - Simple Vite app showcasing core functionality • [Code](https://github.com/graz-sh/graz/tree/main/example/vite/)

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

## Community & Support

- 💬 [GitHub Discussions](https://github.com/graz-sh/graz/discussions) - Ask questions and share ideas
- 🐛 [Issues](https://github.com/graz-sh/graz/issues) - Report bugs or request features
- 🤝 [Contributing](./contributing) - Help improve Graz

## Maintainers

- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2023 Graz](./license)
