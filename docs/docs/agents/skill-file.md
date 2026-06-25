---
sidebar_position: 1
---

# Skills

Public integration reference for using `graz` in your application. Available at [https://graz.sh/skill.md](https://graz.sh/skill.md), a concise guide for AI coding assistants and developers.

## What's Covered

The skill file (source at [`docs/static/SKILL.md`](https://github.com/graz-sh/graz/blob/dev/docs/static/SKILL.md)) provides:

- **Provider setup**: `<GrazProvider>` inside `<QueryClientProvider>` with chain configuration
- **Chain info**: Defining chains with `defineChainInfo()` and generating via CLI
- **Wallet connection**: `useConnect()`, `useAccount()`, `useDisconnect()`, wallet detection
- **Account state**: Multi-chain `Record<chainId, Key>` with typed tuple inference
- **Balance queries**: All balances, single denom, staked
- **Clients**: Read clients (`useStargateClient`, `useCosmWasmClient`) and signing clients
- **Transactions**: Send tokens, IBC transfers, contract execute/instantiate/query
- **Chain management**: Suggest chain, add chain, chain info hooks
- **Multi-chain API**: Three overload forms for all chain-aware hooks
- **Quick reference table**: Task-to-hook mapping

## Usage

For AI agents, the skill is automatically loaded when working with graz integration patterns. Direct link: [https://graz.sh/skill.md](https://graz.sh/skill.md).
