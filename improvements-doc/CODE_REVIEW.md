# Code Review Guidelines for Graz

## Overview

This document outlines code review guidelines and best practices for maintaining high code quality in the Graz library.

## Review Checklist

### Architecture & Design

- [ ] Changes follow the actions/hooks separation pattern
- [ ] Multi-chain support is properly implemented where applicable
- [ ] Store updates are minimal and necessary
- [ ] Wallet adapter pattern is followed for new wallet integrations
- [ ] SSR safety is maintained (no direct `window` access without checks)

### Code Quality

- [ ] TypeScript types are explicit and accurate
- [ ] No `any` types without justification
- [ ] Error handling is comprehensive
- [ ] Console logs are removed or use proper debug utilities
- [ ] Code follows existing naming conventions (camelCase for functions, PascalCase for types)

### Performance

- [ ] React Query keys are stable and properly memoized
- [ ] No unnecessary re-renders or state updates
- [ ] Multi-chain operations use `createMultiChainAsyncFunction` for proper concurrency control
- [ ] Large operations are optimized (parallel execution with configurable concurrency via `multiChainFetchConcurrency`)

### Testing

- [ ] New features have appropriate tests
- [ ] Edge cases are covered
- [ ] Tests pass locally
- [ ] Manual testing guide is updated if needed

### Documentation

- [ ] Public APIs have JSDoc comments
- [ ] Hook documentation is updated in `docs/docs/hooks/`
- [ ] Breaking changes are noted in CHANGELOG.md
- [ ] README updated if needed for new features

### Security

- [ ] No sensitive data logged or exposed
- [ ] User inputs are validated
- [ ] External data sources are sanitized
- [ ] Wallet connections use secure methods

### Compatibility

- [ ] Changes are backward compatible (or properly versioned)
- [ ] Multi-wallet support is maintained
- [ ] Works with SSR/SSG frameworks (Next.js, etc.)
- [ ] Browser compatibility is considered

## Common Issues to Watch For

### 1. Store Mutations

**Bad:**

```typescript
const store = useGrazSessionStore.getState();
store.accounts = newAccounts; // Direct mutation
```

**Good:**

```typescript
useGrazSessionStore.setState({ accounts: newAccounts });
```

### 2. Unstable Query Keys

**Bad:**

```typescript
const { data } = useQuery({
  queryKey: ["balance", { chainId, address }], // Object creates new reference
});
```

**Good:**

```typescript
const { data } = useQuery({
  queryKey: ["balance", chainId, address], // Stable primitives
});
```

### 3. Missing SSR Guards

**Bad:**

```typescript
const wallet = window.keplr; // Crashes on server
```

**Good:**

```typescript
const wallet = typeof window !== "undefined" ? window.keplr : undefined;
```

### 4. Inconsistent Error Handling

**Bad:**

```typescript
try {
  await connect();
} catch (e) {
  console.log(e); // Silent failure
}
```

**Good:**

```typescript
try {
  await connect();
} catch (error) {
  console.error("connect ", error);
  throw error; // Let caller handle
}
```

### 5. Proper Multi-Chain Support

**Note:** All hooks now return `Record<chainId, T>` by default. The `multiChain` boolean parameter has been removed.

**Bad:**

```typescript
// Doesn't use multi-chain utilities properly
export const useNewFeature = ({ chainId }: Args) => {
  const chain = getChain(chainId);
  return useQuery({
    queryKey: ["newFeature", chainId],
    queryFn: () => fetchData(chainId),
  });
};
```

**Good:**

```typescript
export const useNewFeature = ({ chainId }: Args) => {
  const chains = useChainsFromArgs({ chainId });
  return useQuery({
    queryKey: ["newFeature", chainId],
    queryFn: () => createMultiChainAsyncFunction(chains, async (chain) => fetchData(chain.chainId)),
  });
};
```

## Review Process

### For Authors

1. **Self-review** before requesting review
2. **Add description** explaining the change and why
3. **Link issues** or related PRs
4. **Update tests** and ensure they pass
5. **Run linter** and fix all issues
6. **Test manually** using example apps

### For Reviewers

1. **Understand the context** - Read the issue/PR description
2. **Check the checklist** above
3. **Test locally** for significant changes
4. **Provide constructive feedback** with examples
5. **Ask questions** if unclear
6. **Approve or request changes** with clear rationale

## Feedback Guidelines

### Good Feedback

- **Specific**: "This query key will cause unnecessary refetches because the object is recreated on every render"
- **Actionable**: "Consider using `useMemo` to stabilize the query key"
- **Educational**: "Here's why: React Query uses shallow comparison for cache keys"
- **Constructive**: "This works, but we could simplify it by..."

### Avoid

- Vague: "This looks wrong"
- Non-actionable: "I don't like this"
- Subjective: "I prefer a different style"
- Nitpicky: Minor style issues when code is otherwise good

## Priority Levels

### 🔴 Critical (Must Fix)

- Security vulnerabilities
- Breaking changes without migration path
- Major performance regressions
- Data corruption or loss

### 🟡 Important (Should Fix)

- Significant performance issues
- Missing error handling
- Type safety issues
- Documentation gaps for public APIs

### 🟢 Nice to Have (Consider)

- Code style improvements
- Refactoring suggestions
- Additional test coverage
- Performance micro-optimizations

## Approval Criteria

A PR should be approved when:

- All critical and important issues are resolved
- Tests pass
- Documentation is updated
- Code follows project conventions
- Reviewer understands and agrees with the approach

A PR may be approved with minor issues if:

- Only nice-to-have improvements remain
- Author commits to addressing them in follow-up
- Changes don't block release

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
