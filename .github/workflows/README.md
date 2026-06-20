# GitHub Actions Workflows

The workflows run on pinned `ubuntu-24.04` runner images and SHA-pinned actions with version comments. Node.js and pnpm are pinned to the project versions: Node `24.17.0`, pnpm `11.8.0`.

## Workflows

### CI (`ci.yml`)

Triggers on pushes and pull requests to `main` or `dev` when package, docs, example, dependency, or toolchain files change.

Jobs:

- `build-and-test`: frozen install, package/docs build, tests, CLI tests, and `graz` type-check.
- `build-examples`: frozen install, `graz` build, chain generation, and full workspace build including examples.

### Lint (`lint.yml`)

Triggers on pushes that change source, dependency, toolchain, or lint config files. Runs `pnpm lint` with ESLint 9 flat config.

### Docs (`docs.yml`)

Deploys the Docusaurus site from `dev` or manual dispatch using GitHub Pages actions.

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
- `PERSONAL_TOKEN` is used by the Changesets action to create release pull requests.
