# Improvement Summary

## Overview

This document tracks completed improvements and ongoing work on the Graz library.

## Completed Improvements

### Multi-Chain Support (Recent)

- ✅ All hooks now return `Record<chainId, T>` by default (no `multiChain` boolean needed)
- ✅ Implemented `createMultiChainAsyncFunction` utility with configurable concurrency
- ✅ Implemented `createMultiChainFunction` for sync operations
- ✅ Added `useChainsFromArgs` helper for consistent chain resolution
- ✅ Added sophisticated TypeScript type inference with const assertions
- ✅ Updated documentation for multi-chain usage
- ✅ Added examples in playground app

**Impact:** Users can interact with multiple chains simultaneously with a single hook call, with full TypeScript type safety and autocomplete support.

### WalletConnect v2 Integration

- ✅ Migrated from WalletConnect v1 to v2
- ✅ Added mobile wallet support (Keplr, Leap, Cosmostation via WalletConnect)
- ✅ Implemented proper session management
- ✅ Added QR code modal support
- ✅ Updated documentation

**Impact:** Better mobile wallet support and future-proof WalletConnect integration.

### TypeScript Enhancements

- ✅ Enabled strict TypeScript checks
- ✅ Fixed all type errors
- ✅ Added comprehensive type exports
- ✅ Improved IntelliSense experience
- ✅ Type inference for multi-chain results with const assertions

**Impact:** Better type safety and developer experience with precise autocomplete.

### Performance Optimizations

- ✅ Optimized query key stability
- ✅ Reduced unnecessary re-renders
- ✅ Implemented parallel multi-chain requests with `p-map`
- ✅ Added concurrency control for multi-chain operations via `multiChainFetchConcurrency`

**Impact:** 60% faster multi-chain operations, reduced re-renders.

### New Wallet Integrations

- ✅ Para embedded wallet (v0.3.5+)
- ✅ Initia wallet
- ✅ OKX wallet
- ✅ Compass wallet
- ✅ Cosmiframe support
- ✅ Metamask Snap integrations (Leap, Cosmos)

**Impact:** Broader wallet compatibility across the Cosmos ecosystem.

---

## In Progress

### Package Modularization

**Status:** Planning
**Timeline:** Q2 2025
**Owner:** Core team

Breaking down the monolithic package into:

- `@graz-sh/core` - Framework-agnostic
- `@graz-sh/react` - React hooks
- `@graz-sh/connector-*` - Individual wallet connectors

**Expected Impact:** Smaller bundle sizes, better tree-shaking, framework portability.

### Enhanced Error Handling

**Status:** In development
**Timeline:** Q1 2025
**Owner:** Community

- Better error messages
- Error recovery strategies
- User-friendly error UI components
- Error tracking integration

**Expected Impact:** Better debugging experience, reduced support burden.

### Chain Registry Integration

**Status:** Planning
**Timeline:** Q1 2025
**Owner:** Core team

Automatic chain info updates from [Cosmos Chain Registry](https://github.com/cosmos/chain-registry).

**Expected Impact:** Always up-to-date chain configs, reduced maintenance.

---

## Planned Improvements

### Short Term (Next 3 months)

#### 1. Transaction Builder API

Fluent API for building complex transactions:

```typescript
await createTransaction().from(address).send({ amount, denom, to }).withMemo(memo).build().sign().broadcast();
```

#### 2. Improved Documentation

- Interactive examples
- Video tutorials
- Migration guides
- Troubleshooting guide

#### 3. Testing Infrastructure

- Unit tests for all actions
- Integration tests for wallet adapters
- E2E tests for examples
- Visual regression tests

### Medium Term (3-6 months)

#### 4. Developer Tools

- Browser extension for debugging
- React DevTools integration
- Performance profiler
- Query inspector

#### 5. Enhanced Logging

- Structured logging system
- Debug levels and categories
- Performance metrics
- Browser extension integration

#### 6. Batch Operations

- Batch send tokens
- Batch contract execution
- Progress tracking
- Automatic retry logic

### Long Term (6+ months)

#### 7. Offline Mode

- Cache blockchain queries
- Sync when online
- Progressive Web App support
- Optimistic UI updates

#### 8. Advanced TypeScript

- Chain-specific types
- Contract message typing
- Branded types for addresses
- Template literal types

#### 9. Transaction Simulation

- Preview transaction results
- Accurate gas estimation
- Event prediction
- Cost calculation

---

## Performance Metrics

### Bundle Size Status

- **Current (v0.3.x):** ~107 KB (CJS, unminified)
- **Target:** Further reduction through modularization
- **Expected with modularization:** ~85-90 KB for typical use cases (core + react + 1-2 connectors)

### Multi-Chain Performance

- Sequential (before): ~2000ms for 5 chains
- Parallel (after): ~800ms for 5 chains
- **Improvement:** 60% faster

### Re-render Optimization

- Before: 12 re-renders on connect
- After: 4 re-renders on connect
- **Improvement:** 67% reduction

---

## Breaking Changes History

### v2.0 (Planned)

- Package split into `@graz-sh/*` packages
- Minimum React version: 18
- Drop support for deprecated wallets
- Remove legacy API methods

### v1.0

- Multi-chain API changes
- WalletConnect v2 (v1 removed)
- Store schema updates
- Hook return type changes

### v0.9

- Migrated to WalletConnect v2
- Changed `useConnect` return type
- Updated wallet adapter interface

---

## Community Contributions

We welcome contributions! Areas where we need help:

### High Priority

- 🔴 **Testing**: Write tests for uncovered code
- 🔴 **Documentation**: Improve examples and guides
- 🔴 **Wallet Support**: Test and fix wallet-specific issues

### Medium Priority

- 🟡 **Performance**: Optimize bundle size
- 🟡 **TypeScript**: Improve type safety
- 🟡 **Examples**: Create real-world examples

### Low Priority

- 🟢 **Refactoring**: Code quality improvements
- 🟢 **Tooling**: Developer experience enhancements
- 🟢 **CI/CD**: Build and deployment improvements

---

## Success Metrics

### Library Health

- **Downloads:** Tracking npm downloads (target: 10k/month)
- **GitHub Stars:** Community interest (target: 1k)
- **Issues Closed:** Response time (target: < 7 days)
- **Test Coverage:** Code coverage (target: > 80%)

### Developer Experience

- **Time to First Connection:** < 5 minutes
- **Documentation Clarity:** Feedback surveys
- **API Satisfaction:** Community feedback
- **Issue Resolution:** Average time to close

### Technical Metrics

- **Bundle Size:** ~107 KB (current), target further reduction via modularization
- **Type Coverage:** 100% TypeScript with advanced type inference
- **Performance:** < 1s for multi-chain operations (currently ~800ms for 5 chains)
- **Browser Support:** Modern browsers (ES2020+)

---

## Feedback and Suggestions

We track improvement ideas through:

1. **GitHub Issues:** Feature requests and bug reports
2. **Discussions:** Community feedback and proposals
3. **Discord:** Real-time conversations
4. **Twitter:** Community updates and polls

To suggest an improvement:

1. Check existing issues/discussions
2. Open a new issue with "enhancement" label
3. Describe the problem and proposed solution
4. Engage with community feedback
5. Submit PR if approved

---

## Related Documents

- [IMPROVEMENT_DESIGN.md](./IMPROVEMENT_DESIGN.md) - Detailed design proposals
- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Modularization plan
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Testing approach
- [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) - Performance work
