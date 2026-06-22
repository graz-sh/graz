---
sidebar_position: 5
---

# Generate ChainInfo

`graz` ships with pre-generated mainnet and testnet `ChainInfo` definitions, so you can import them from `graz/chains` right after installing — no extra step required.

Use the `graz` CLI only when you want to **regenerate or customize** the chain definitions, for example to pin specific chains or pick the best available endpoints. It pulls the latest data from https://cosmos.directory:

```shell
# using npx
npx graz --generate

# using yarn
yarn graz --generate
```

## Options:

```shell

  -g, --generate        Generate chain definitions and export to "graz/chains"
  -h, --help            Show this help message
```

## Generate options:

```shell
  -b, --best            Set REST and RPC endpoint to best available nodes instead or first listed ones
  -M, --mainnet         Generate given mainnet chain paths seperated by commas (e.g. "axelar,cosmoshub,juno")
  -T, --testnet         Generate given testnet chain paths seperated by commas (e.g. "atlantic,bitcannadev,cheqdtestnet")
  --authz               Generate only authz compatible chains

```

## Keep chains up to date (optional)

The bundled definitions are a snapshot from when the installed `graz` version was published. If you want to refresh them on every install, add the generate step to your `postinstall` script:

```ts
{
  // ...
  "scripts": {
    "postinstall": "graz --generate"
  }
  // ...
}
```

## Import chains

You can import the bundled (or regenerated) `ChainInfo` directly in your project:

```ts
import { axelar, cosmoshub, sommelier } from "graz/chains";
```
