# Graz Agent Notes

## Invariants

- `dev` is the integration/default branch. Target PRs, workflow branches, and release automation at `dev`; do not introduce `main` triggers unless explicitly requested.
- Public API starts at `packages/graz/src/index.ts`; preserve existing action, hook, provider, wallet, type, and `graz/chains` exports.
- `pnpm graz cli --generate` creates ignored `packages/graz/chains/index.{js,mjs,ts}` for local/example use.
- Published files intentionally include only `chains/*.stub`, not generated `chains/index.*`; do not change this without explicit maintainer direction.
- Actions stay framework-agnostic. Hooks wrap actions with TanStack Query.
- Multi-chain overloads are public API. Preserve `chainId` tuple inference and `UseMultiChainQueryResult`.
- Public signer contracts use CosmJS signer types. Do not leak wallet-specific signer aliases unless already exposed.
- Do not add deep `cosmjs-types` imports to public declarations.

## Verification

- `pnpm install --frozen-lockfile && pnpm peers check`
- `pnpm graz build && pnpm graz type-check && pnpm graz test`
- `pnpm build && pnpm lint`
- `pnpm graz cli --generate && pnpm example:vite build && pnpm example:playground build`
- `pnpm --dir packages/graz pack --dry-run`

## Current Pins

- Vite stays on latest 7.x; Vite 8/Rolldown fails on transitive Coinbase/Para CommonJS in examples.
- Playground stays on Tailwind 3.x; Tailwind 4 needs a separate CSS/config migration.
- Para AA packages stay explicit in examples; Para React SDK imports optional AA hooks eagerly.
- `@walletconnect/modal@2.7.0` is deprecated; replacement requires a separate Reown/AppKit migration.
