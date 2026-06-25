# GitHub Actions Workflows

The workflows run on pinned `ubuntu-24.04` runner images and SHA-pinned actions with version comments. Node.js and pnpm are pinned to the project versions: Node `24.17.0`, pnpm `11.8.0`.

## Workflows

### CI (`ci.yml`)

Triggers on pushes and pull requests to `dev` when package, example, integration, dependency, or toolchain files change. Docs-only changes are handled by the docs workflow instead of running package CI.

Jobs:

- `build-and-test`: frozen install, package/docs build, tests, CLI tests, and `graz` type-check.
- `build-examples`: frozen install, `graz` build, chain generation, and full workspace build including examples.

### Lint (`lint.yml`)

Triggers on pushes that change package, example, integration, dependency, toolchain, or lint config files. Runs `pnpm lint` with ESLint 9 flat config.

### Docs (`docs.yml`)

Deploys the Docusaurus site from `dev` or manual dispatch using GitHub Pages actions. It runs when docs, dependency, package, or docs workflow files change.

### Playwright Integration (`integration-playwright.yml`)

Runs a purpose-built browser integration harness for `graz` on `dev` pushes, PRs targeting `dev`, nightly schedule, or manual dispatch. It uses the protected `graz-integration` environment and a Keplr-compatible test wallet injected by Playwright.

Required environment secret:

- `GRAZ_E2E_WALLET_MNEMONIC`: burner testnet wallet mnemonic.

Optional environment secret:

- `GRAZ_E2E_RPC_HEADERS_JSON`: JSON object with RPC headers for private/authenticated endpoints.

Environment variables:

- `GRAZ_E2E_CHAIN_ID`
- `GRAZ_E2E_CHAIN_NAME`
- `GRAZ_E2E_RPC_URL`
- `GRAZ_E2E_REST_URL`
- `GRAZ_E2E_BECH32_PREFIX`
- `GRAZ_E2E_DENOM`
- `GRAZ_E2E_DISPLAY_DENOM`
- `GRAZ_E2E_GAS_PRICE`
- `GRAZ_E2E_EXPECTED_ADDRESS` (optional)
- `GRAZ_E2E_ENABLE_TX` (optional, defaults to disabled)
- `GRAZ_E2E_RECIPIENT_ADDRESS` (optional, required only when tx tests are enabled)

Setup pattern:

```bash
REPO=graz-sh/graz
ENV=graz-integration

gh api --method PUT "repos/$REPO/environments/$ENV"

read -rsp "Testnet mnemonic: " GRAZ_E2E_WALLET_MNEMONIC; echo
printf '%s' "$GRAZ_E2E_WALLET_MNEMONIC" \
  | gh secret set GRAZ_E2E_WALLET_MNEMONIC --repo "$REPO" --env "$ENV"
unset GRAZ_E2E_WALLET_MNEMONIC

gh variable set GRAZ_E2E_CHAIN_ID --repo "$REPO" --env "$ENV" --body "cosmoshub-4"
gh variable set GRAZ_E2E_CHAIN_NAME --repo "$REPO" --env "$ENV" --body "Cosmos Hub"
gh variable set GRAZ_E2E_RPC_URL --repo "$REPO" --env "$ENV" --body "https://cosmos-rpc.publicnode.com"
gh variable set GRAZ_E2E_REST_URL --repo "$REPO" --env "$ENV" --body "https://rest.cosmos.directory/cosmoshub"
gh variable set GRAZ_E2E_BECH32_PREFIX --repo "$REPO" --env "$ENV" --body "cosmos"
gh variable set GRAZ_E2E_DENOM --repo "$REPO" --env "$ENV" --body "uatom"
gh variable set GRAZ_E2E_DISPLAY_DENOM --repo "$REPO" --env "$ENV" --body "ATOM"
gh variable set GRAZ_E2E_GAS_PRICE --repo "$REPO" --env "$ENV" --body "0.025"
gh variable set GRAZ_E2E_ENABLE_TX --repo "$REPO" --env "$ENV" --body "0"
# Optional: set GRAZ_E2E_EXPECTED_ADDRESS and GRAZ_E2E_RECIPIENT_ADDRESS when needed.
```

### Publish (`publish.yml`)

Checks release state on `dev` or manual dispatch. Pending changesets create a version PR; unpublished package versions publish with `pnpm release`.

The publish job uses npm Trusted Publishing/OIDC, not npm token secrets. It must target the protected `npm-publish` environment, which is restricted to `dev` and requires maintainer approval.

## Local Parity

Run these before trusting workflow changes:

```bash
fnm use 24.17.0
pnpm install --frozen-lockfile
pnpm peers check
pnpm build
pnpm lint
pnpm example:vite build
pnpm example:playground build
```

Use `nvm use` instead of `fnm use 24.17.0` in shells that rely on nvm.

## Maintenance Notes

- Keep workflow action SHAs paired with readable version comments.
- Keep root dependency and toolchain files in path filters so lockfile, pnpm, Node, Turbo, and ESLint changes trigger CI.
- `CHANGESETS_APP_CLIENT_ID` and `CHANGESETS_APP_PRIVATE_KEY` are used to mint a GitHub App token for Changesets release pull requests.
