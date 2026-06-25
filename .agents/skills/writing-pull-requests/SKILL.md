# Writing Pull Requests for graz-sh/graz

## Branch & Title

```text
<type>/<description>          # feat/prefix-storage-key, chore/bump-versions
<scope>/<description>         # codex/modernize-baseline
<type>(<scope>)/<description> # feat(wallet)/add-ethereum-sign-type
```

Allowed `<type>`: `feat`, `chore`, `refactor`, `deps`. Title follows same type prefix (conventional commits). Breaking changes: prefix with `[Breaking Change]: <type>: <description>`.

## PR Body

Minimum sections: Description, Changes (Added/Changed/Removed bullets), Testing (exact commands). Checklist is optional.

## Rules

- **Base**: All PRs target `dev`
- **Review**: Needs >=1 maintainer approval (usually @codingki or @grikomsn)
- **Changesets**: Required if published packages change — `pnpm changeset` (changeset-bot will confirm)
- **Verification**: Paste validation commands in the body
- **Generated files**: Do NOT commit `packages/graz/chains/index.*` — run `pnpm graz cli --generate` for local testing only
- **Labels**: Use `enhancement` (feat), `javascript` (refactor/chore), `dependencies` (deps)
- **Auto PRs**: Don't manually create `Version Packages` PRs (changeset bot handles them). Dependabot handles `deps/` branches.
