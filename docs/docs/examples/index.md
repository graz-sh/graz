---
sidebar_position: 5
---

# Examples

## Try it out

Start with the [Try it out](./try-it-out) page for a small React example that configures Graz, connects a Cosmos wallet, and queries an ATOM balance.

## Playground (Next.js)

A comprehensive example application showcasing Graz's multi-chain wallet integration capabilities.

### Features

- 🔗 **Multi-Chain Support**: Connect to multiple Cosmos chains simultaneously
- 👛 **Multi-Wallet**: Support for Keplr, Leap, Cosmostation, Compass, OKX, WalletConnect, Para and more
- 💰 **Balance Management**: View regular and staked balances across all chains
- 📝 **Smart Contracts**: Query and execute CosmWasm contracts
- ⚡ **Modern UI**: Built with Next.js App Router, Tailwind CSS, and shadcn/ui
- 🎨 **Syntax Highlighting**: Beautiful code examples with TypeScript highlighting

### Pages

- **Wallets**: Detect available wallets, connect to specific wallet types, switch between wallets
- **Account**: View connected accounts per chain, see wallet information, disconnect individual chains
- **Balances**: View all token balances and staked balances across chains
- **Contracts**: Query and execute smart contracts on any chain
- **Chains**: View all configured chains, connect/disconnect individual chains, suggest new chains
- **Send Tokens**: Send tokens to recipients
- **Clients**: Examples of using Stargate and CosmWasm clients

### Links

- Website: https://graz.sh/examples/playground
- GitHub: https://github.com/graz-sh/graz/tree/main/example/playground

### Technology Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query)
- Graz for wallet integration
- CosmJS for blockchain interactions

## Vite

A simple example demonstrating how to use Graz with Vite + React + TypeScript.

### Features

- ⚡ **Fast Development**: Powered by Vite for lightning-fast HMR
- 🎯 **Simple Setup**: Minimal configuration to get started
- 📦 **Node.js Polyfills**: Configured with vite-plugin-node-stdlib-browser for web3 compatibility

### Links

- Website: https://graz.sh/examples/vite
- GitHub: https://github.com/graz-sh/graz/tree/main/example/vite

## Running Examples Locally

To run any example locally:

```bash
# Clone the repository
git clone https://github.com/graz-sh/graz.git
cd graz

# Install dependencies
pnpm install

# Run playground example
pnpm example:playground dev

# Or run vite example
pnpm example:vite dev
```

For the Playground example, you may want to configure environment variables for WalletConnect and Para wallet support. See the [Playground README](https://github.com/graz-sh/graz/tree/main/example/playground/README.md) for details.
