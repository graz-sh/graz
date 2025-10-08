# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Graz project.

## Workflows

### 🔨 CI (`ci.yml`)
**Triggers:** Push/PR to `main` or `dev` branches (when packages change)

**Jobs:**
1. **Build & Test** (Matrix: Node 18, 20)
   - Installs dependencies
   - Builds packages
   - Runs unit tests
   - Runs type checking

2. **Build Examples**
   - Builds all example applications
   - Ensures examples compile correctly

3. **Test Coverage**
   - Runs tests with coverage reporting
   - Uploads coverage to Codecov (optional)

### 🧹 Lint (`lint.yml`)
**Triggers:** Push (when docs/example/packages change)

**Jobs:**
- Runs ESLint on all TypeScript files
- Auto-fixes formatting issues

### 📚 Docs (`docs.yml`)
**Jobs:**
- Builds and deploys documentation site

### 📦 Publish (`publish.yml`)
**Jobs:**
- Publishes packages to npm
- Uses changesets for versioning

## Running Locally

You can test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow
act -j build-and-test

# Run all jobs
act push
```

## Workflow Best Practices

### Cache Strategy
- All workflows use pnpm cache via `actions/setup-node`
- Use `--frozen-lockfile` to ensure consistent installs

### Node Version
- CI tests on Node 18 and 20
- Other workflows use `.nvmrc` version
- Update matrix in `ci.yml` when dropping/adding Node versions

### Performance
- `build-and-test` runs in parallel across Node versions
- Examples build runs after tests pass (saves time on failures)
- Coverage runs independently (doesn't block other jobs)

## Updating Workflows

When making changes:

1. **Test locally** with `act` if possible
2. **Update this README** if adding new workflows
3. **Update matrix versions** when Node support changes
4. **Check dependencies** - ensure actions use latest stable versions

## Secrets & Variables

### Required Secrets
- `NPM_TOKEN` - For publishing to npm (publish.yml)
- `CODECOV_TOKEN` - Optional, for coverage reporting (ci.yml)

### Optional Variables
None currently required.

## Troubleshooting

### Build fails on fork PRs
- Ensure the fork is up to date with main
- Check that `pnpm-lock.yaml` is committed

### Tests fail in CI but pass locally
- Check Node version (use nvm or similar)
- Clear pnpm cache: `pnpm store prune`
- Ensure no environment-specific code

### Coverage not uploading
- Verify `CODECOV_TOKEN` is set (optional)
- Check coverage directory path in workflow
- Codecov failures don't fail the CI (fail_ci_if_error: false)

## Related Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [actions/setup-node](https://github.com/actions/setup-node)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
