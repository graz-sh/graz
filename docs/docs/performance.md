---
sidebar_position: 9
---

# Performance & Build Optimization

Graz has been optimized for both runtime performance and developer experience with significant improvements to build times and package size.

## Package Size

The graz package has been highly optimized for minimal bundle impact:

- **Total package size**: ~220 KB (down from 800 KB)
- **Main bundle (ESM)**: 52 KB (minified)
- **Main bundle (CJS)**: 52 KB (minified)
- **TypeScript declarations**: 49 KB per format (.d.ts and .d.mts)

### What This Means for You

- **72% smaller npm installs**: Faster CI/CD pipelines and local development setup
- **Optimized for tree-shaking**: Modern bundlers can eliminate unused code
- **No source maps in production**: Keeps package size minimal

## Build Performance

### Production Builds

Production builds are optimized for output quality:

- **Build time**: ~4 seconds
- **TypeScript declaration generation**: ~3 seconds
- **Incremental builds**: Cached for faster subsequent builds

### Development Builds

Development mode is optimized for speed:

- **Initial build**: ~1 second
- **Hot-reload rebuilds**: &lt;500ms (nearly instant)
- **DTS generation**: Skipped in watch mode for maximum speed

## Development Experience

### Fast Watch Mode

When developing with graz, use watch mode for the best experience:

```bash
# In the graz package
pnpm graz dev

# This provides:
# - Instant rebuilds (<500ms)
# - No DTS generation (saves ~3 seconds)
# - Hot module reloading
```

### Build Optimizations Applied

## TypeScript Incremental Compilation

Graz uses TypeScript's incremental compilation feature:

- Caches type information between builds
- Only recompiles changed files
- Reduces build time by up to 70% on subsequent builds

## Terser Minification

Production builds use Terser for advanced minification:

- Better compression than basic minification
- Dead code elimination
- Optimized for ES2020+ targets

## Smart DTS Generation

TypeScript declarations are generated efficiently:

- `resolve: false` keeps external types external (43% smaller)
- Skipped entirely in watch mode for instant feedback
- Generated only for production builds

## Runtime Performance

### Built on React Query

Graz leverages `@tanstack/react-query` for optimal data fetching:

- Automatic caching and request deduplication
- Background refetching and stale-while-revalidate
- Optimistic updates and mutations

### Zustand State Management

State is managed efficiently with Zustand:

- Minimal re-renders (selector-based subscriptions)
- Persistent state with localStorage/sessionStorage
- Lightweight (~1 KB overhead)

### Tree-Shaking Support

Graz is built with tree-shaking in mind:

- ES module exports for optimal bundler compatibility
- `sideEffects: false` in package.json
- Modular architecture allows importing only what you need

## Multi-Chain Performance

### Concurrent Request Management

Multi-chain operations are optimized with configurable concurrency:

```tsx
<GrazProvider
  grazOptions={{
    chains: [chain1, chain2, chain3],
    multiChainFetchConcurrency: 3, // Default: 3 concurrent requests
  }}
>
  {/* Your app */}
</GrazProvider>
```

Benefits:

- Prevents overwhelming RPC endpoints
- Balances speed with reliability
- Configurable per application needs

### Efficient Multi-Chain Utilities

The `createMultiChainAsyncFunction` utility uses `p-map` for efficient parallel processing:

- Controlled concurrency to prevent rate limiting
- Promise-based for optimal async handling
- Automatic error handling per chain

## Best Practices

### For Application Developers

1. **Use the hooks**: They're optimized with React Query for caching and performance
2. **Enable stale-while-revalidate**: Let React Query handle background updates
3. **Optimize re-renders**: Use selector functions with `useAccount` and other hooks
4. **Configure concurrency**: Adjust `multiChainFetchConcurrency` based on your needs

```tsx
// Good: Use selector to avoid unnecessary re-renders
const { data: account } = useAccount({
  onConnect: (data) => {
    // Only runs on connect, not on every state change
  },
});

// Good: Configure concurrency for your use case
<GrazProvider
  grazOptions={{
    chains: myChains,
    multiChainFetchConcurrency: 5, // Increase if you have fast RPCs
  }}
/>;
```

### For Contributors

1. **Use `pnpm graz dev`** for development (instant rebuilds)
2. **Run `pnpm graz build`** before committing (verify production build)
3. **Avoid unnecessary dependencies**: Keep bundle size minimal
4. **Write tree-shakeable code**: Use named exports, avoid side effects

## Monitoring Performance

### Bundle Analysis

To analyze what's in your application bundle:

```bash
# Using webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Using source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

### Build Time Tracking

Track graz build times:

```bash
# Production build with timing
time pnpm graz build

# Watch mode (note rebuild speed)
pnpm graz dev
```

## Version History

### v0.4.0 - Build Optimizations

Major performance improvements:

- **25% faster production builds** (5.2s → 3.9s)
- **87% faster dev rebuilds** (5.2s → 0.7s)
- **72% smaller package** (800 KB → 220 KB)
- **43% smaller TypeScript declarations** (87 KB → 49 KB)

See the [changelog](./change-log.md#version-040-unified-multi-chain-api--performance) for details.

## Future Optimizations

Potential future improvements being considered:

### Code Splitting by Wallet

Split wallet adapters into separate entry points:

```tsx
// Instead of bundling all wallets
import { getKeplr, getLeap /* all 12+ wallets */ } from "graz";

// Users could import only what they need
import { useConnect } from "graz";
import { getKeplr } from "graz/wallets/keplr";
import { getLeap } from "graz/wallets/leap";
```

**Expected impact**: 60-70% smaller bundles for most users

### Dynamic Imports

Lazy-load wallet adapters on-demand:

```tsx
// Load wallet adapter only when needed
const wallet = await import(`graz/wallets/${walletType}`);
```

**Expected impact**: Faster initial page load, smaller initial bundle

## Contributing

Have ideas for performance improvements? We welcome contributions!

- See [BUILD_OPTIMIZATION_ANALYSIS.md](https://github.com/graz-sh/graz/blob/dev/BUILD_OPTIMIZATION_ANALYSIS.md) for detailed analysis
- Check [Contributing Guide](./contributing.md) for development setup
- Open an issue or PR with your optimization ideas

## Questions?

If you have questions about performance or build optimizations:

- Check our [GitHub Discussions](https://github.com/graz-sh/graz/discussions)
- Open an [issue](https://github.com/graz-sh/graz/issues) for bugs
- Join the conversation in our community channels
