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

## Development

- `pnpm install` runs `setup-para` postinstall (installs Para SDK native bindings; can fail if build tools missing).
- `pnpm build` uses turbo and filters out example apps. Use `pnpm build-all` to include them.
- `pnpm dev` = `pnpm graz build && turbo run dev --filter=!@project/docs` (builds graz first).
- `pnpm graz <cmd>` shorthand for `pnpm --dir packages/graz <cmd>`; likewise `pnpm example:vite`, `pnpm example:playground`.
- `GrazProvider` must be nested inside `QueryClientProvider` from `@tanstack/react-query`.
- For graz library usage reference, use `docs/static/SKILL.md` (not `.agents/`). This file is for public-facing integration patterns, not repo development.

## Verification

- `pnpm install --frozen-lockfile && pnpm peers check`
- `pnpm graz build && pnpm graz type-check && pnpm graz test`
- `pnpm build && pnpm lint`
- `pnpm graz cli --generate && pnpm example:vite build && pnpm example:playground build`
- `pnpm --dir packages/graz pack --dry-run`

## Integration / E2E

- `pnpm integration:test` runs Playwright in `integration/playwright/`.
- Local default mnemonic (outside CI): `"test test test test test test test test test test test junk"`.
- CI skips tx tests via `--grep-invert @tx`; enable locally with `GRAZ_E2E_ENABLE_TX=1`.
- Copy `integration/playwright/.env.example` to `.env` and set `GRAZ_E2E_WALLET_MNEMONIC`.

## Release

- Changesets-based. `pnpm release` = `pnpm graz build && changeset publish`.
- CI publishing uses npm OIDC/trusted publishing (no npm token) against the `npm-publish` environment.

## Current Pins

- Vite stays on latest 7.x; Vite 8/Rolldown fails on transitive Coinbase/Para CommonJS in examples.
- Playground stays on Tailwind 3.x; Tailwind 4 needs a separate CSS/config migration.
- Para AA packages stay explicit in examples; Para React SDK imports optional AA hooks eagerly.
- `@walletconnect/modal@2.7.0` is deprecated; replacement requires a separate Reown/AppKit migration.
