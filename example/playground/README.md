# Graz Playground

A comprehensive example application showcasing Graz's multi-chain wallet integration capabilities.

## Features

- 🔗 **Multi-Chain Support**: Connect to multiple Cosmos chains simultaneously
- 👛 **Multi-Wallet**: Support for Keplr, Leap, Cosmostation, Compass, OKX, WalletConnect, Para and more
- 💰 **Balance Management**: View regular and staked balances across all chains
- 📝 **Smart Contracts**: Query and execute CosmWasm contracts
- ⚡ **Modern UI**: Built with Next.js App Router, Tailwind CSS, and shadcn/ui
- 🎨 **Syntax Highlighting**: Beautiful code examples with TypeScript highlighting

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Copy the example env file and add your API keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:

- **WalletConnect Project ID** (Required for WalletConnect): Get one at [cloud.walletconnect.com](https://cloud.walletconnect.com)
- **Para API Key** (Optional): Get one at [developer.getpara.com](https://developer.getpara.com)

> **Note**: Para wallet will work without an API key but with limited functionality. You'll see a console message with instructions.

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the playground.

## Pages

### 🏠 Overview
Landing page with feature overview

### 👛 Wallets
- Detect available wallets in browser
- Connect to specific wallet types
- View wallet type detection flags
- See recently connected chains
- Switch between wallets

### 👤 Account
- View connected accounts per chain
- See wallet information
- Disconnect individual chains

### 💰 Balances
- View all token balances across chains
- See staked balances
- Human-readable amounts with proper decimals
- Refresh all balances at once

### 📝 Contracts
- Query smart contracts on any chain
- Execute contract transactions
- Switch between chains

### 🔗 Chains
- View all configured chains
- Connect/disconnect individual chains
- Suggest new chains to wallet

## Wallet Configuration

### Para Wallet Setup

Para is an embedded wallet solution that doesn't require browser extensions. To enable it:

1. Get an API key from [developer.getpara.com](https://developer.getpara.com)
2. Add it to your `.env.local` file:
   ```
   NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
   ```
3. Restart the dev server
4. Para will appear in the Wallets page and be available for connection

Without an API key, Para will still initialize but with limited authentication capabilities.

### WalletConnect Setup

WalletConnect enables mobile wallet connections via QR code:

1. Create a project at [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Copy your Project ID
3. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
4. Restart the dev server

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Wallet Integration**: Graz
- **Blockchain**: CosmJS
- **Code Highlighting**: react-syntax-highlighter

## Learn More

- [Graz Documentation](https://graz.sh)
- [Graz GitHub](https://github.com/graz-sh/graz)
- [Cosmos SDK](https://docs.cosmos.network/)
- [CosmJS](https://cosmos.github.io/cosmjs/)

## Contributing

This example is part of the Graz monorepo. Contributions are welcome!
