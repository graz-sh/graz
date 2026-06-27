# RFC 269: Test-first implementation plan

Companion research:
[269-wallet-events-research.md](./269-wallet-events-research.md)

## Baseline

On 2026-06-27, the Graz Vitest suite passed before RFC changes:

```text
Test Files  33 passed (33)
Tests       179 passed (179)
```

The bundled `pnpm` on PATH was `11.7.0` and was rejected by the repository's
engine check. The passing run used the available pnpm `11.8.0` installation.
Before implementation, make sure these report the pinned versions:

```sh
node -v   # v24.17.0
pnpm -v   # 11.8.0
```

## TDD rules for this RFC

- Work in one externally observable behavior per red-green-refactor cycle.
- Run the narrow test file while red/green; run the full Graz checks after each
  completed slice.
- Test semantic events at the action boundary, not private emitter
  implementation details.
- Use real Zustand stores and fake wallet adapters where practical.
- Use `vi.fn()` for event handlers and native listener spies.
- Use `expectTypeOf` for payload contracts and public export checks.
- Do not use snapshots for event payload behavior.
- Every subscription test must prove cleanup.
- Do not add `onBalanceChange` tests until a real detection mechanism and its
  resource cost are specified.

## Slice 0: Characterize current cleanup failure

Target:
`packages/graz/src/provider/__tests__/provider-events.test.tsx`

Write a failing test:

1. mount `GrazEvents` with a Keplr reconnect connector;
2. spy on `window.addEventListener` and `window.removeEventListener`;
3. verify one `keplr_keystorechange` listener is installed;
4. unmount;
5. expect the same listener to be removed;
6. dispatch after unmount and prove reconnect is not called.

Expected red: `useGrazEvents` currently ignores the adapter's unsubscribe
function.

Minimal green: return the adapter cleanup from the effect. Refactor the adapter
selection only after the test passes.

Also add a connector-change case: switching Keplr to another connector removes
the Keplr listener before installing the next one.

## Slice 1: Framework-agnostic subscription lifecycle

Create:

- `packages/graz/src/actions/events.ts`;
- `packages/graz/src/actions/__tests__/events.test.ts`;
- `packages/graz/src/types/events.ts`.

Write failing tests in this order:

1. `subscribeWalletEvents()` returns a function.
2. A subscribed handler receives one emitted semantic event.
3. Unsubscribed handlers receive no later events.
4. Calling unsubscribe twice is harmless.
5. Two subscribers both receive an event.
6. A throwing subscriber does not block the other subscriber.

Keep the internal emitter unexported from `packages/graz/src/index.ts`. Tests may
import an explicitly named internal test seam from the module, but action tests
in later slices should become the primary coverage.

Minimal green can be a module-local `Set<WalletEventHandlers>`. Do not introduce
an event-emitter dependency.

## Slice 2: Full and partial disconnect semantics

Target:
`packages/graz/src/actions/__tests__/account.test.ts`

Red tests:

- full `disconnect()` emits exactly one disconnect event after the session store
  is cleared;
- the payload contains the wallet type, previously active chain IDs, and
  `reason: "user"`;
- partial disconnect emits one chain-change event with correct removed and
  remaining chain IDs;
- partial disconnect does not emit full disconnect while another chain remains;
- disconnecting the final chain emits disconnect once, not both a misleading
  chain event and a disconnect unless that dual behavior is explicitly chosen;
- calling disconnect when already disconnected emits nothing.

Minimal green: snapshot relevant pre-action state, commit existing mutations,
then emit the semantic event. Avoid deriving the payload after the state has
been erased.

## Slice 3: Connect and account reconciliation diffs

Target:
`packages/graz/src/actions/__tests__/account.test.ts`

Red tests:

- initial connect emits no account-change event;
- adding a chain to an existing session emits a chain-change event;
- reconnect with the same addresses emits no account-change event;
- reconnect with a changed address emits one account-change event containing
  `previousAccounts`, `accounts`, and `changedChainIds`;
- account comparison is per chain and independent of object identity;
- reordering active chain IDs emits no event;
- handlers observe the already-committed store state.

Minimal green: capture a pre-operation snapshot at the start of `connect`,
compare it with the committed result, and emit once after status becomes
`connected`.

Do not clear the existing session before account-change reconciliation. Add a
regression test proving an account switch follows:

```text
connected -> reconnecting -> connected
```

and never exposes a false public disconnect.

## Slice 4: React hook lifecycle and fresh callbacks

Create:

- `packages/graz/src/hooks/events.ts`;
- `packages/graz/src/hooks/__tests__/events.test.tsx`.

Use the existing local `renderHook` helper.

Red tests:

- the hook receives core events;
- unmount automatically unsubscribes;
- rerender with new callbacks calls the latest callback, not a stale closure;
- rerender does not create a duplicate subscription;
- omitted handlers are valid;
- Strict Mode setup/cleanup leaves one live subscription;
- a callback can read the committed account/session state.

Recommended implementation:

- keep the latest handler object in a ref;
- install one core subscription in an effect;
- dispatch through the ref;
- return the core unsubscribe function from the effect;
- return `void` from the hook.

This avoids resubscribing whenever a consumer passes an inline object.

## Slice 5: Native adapter normalization

Targets:

- `packages/graz/src/provider/events.tsx`;
- `packages/graz/src/provider/__tests__/provider-events.test.tsx`;
- wallet adapter tests under
  `packages/graz/src/actions/wallet/__tests__/`.

Start with Keplr, then use table-driven coverage for adapters with equivalent
keystore events.

Red tests:

- a native account/keystore event reconnects and emits account change only after
  the new key is committed;
- it does not emit disconnect;
- unmount removes the exact native listener;
- connector change removes the old listener;
- repeated effect execution does not duplicate callbacks;
- unsupported/no-subscription adapters install nothing and do not throw.

Then cover WalletConnect separately:

- `accountsChanged` reconciles the affected chain and emits account change;
- `chainChanged` has an explicitly selected meaning, or is ignored with a
  documented reason for Cosmos multi-chain sessions;
- `session_delete` emits disconnect with `reason: "wallet"`;
- `session_expire` emits disconnect with `reason: "session-expired"`;
- every `events.on` has a matching `events.off`.

Refactor repeated connector `if` statements only after behavior is green. A
map from `WalletType` to adapter getter is preferable to another expanding
conditional block.

## Slice 6: Reconnect failure

Targets:

- `packages/graz/src/actions/__tests__/account.test.ts`;
- `packages/graz/src/provider/__tests__/provider-events.test.tsx`.

Red tests:

- failed account-change reconciliation clears the session once;
- it emits one disconnect with `reason: "reconnect-failed"`;
- it does not emit account change;
- the existing `_onReconnectFailed` callback still runs;
- native listener cleanup still occurs after failure.

This test prevents `reconnect()` and `disconnect()` from double-emitting.
Choose one layer as the owner of the final event.

## Slice 7: Public API and type contract

Targets:

- `packages/graz/src/index.ts`;
- `packages/graz/src/__tests__/runtime-package.test.ts`;
- a type test under `packages/graz/src/types/__tests__/`.

Red tests:

- runtime package exports `subscribeWalletEvents` and `useWalletEvents`;
- event payload types are available from `graz`;
- `accounts` remains `Record<string, Key>`;
- chain payloads use arrays/diffs and do not collapse to a singular chain;
- public declarations do not add deep `cosmjs-types` imports;
- existing action, hook, provider, wallet, type, and `graz/chains` exports remain.

Add a changeset only after maintainers confirm whether this is a minor release.

## Slice 8: Documentation and integration proof

Update `docs/static/SKILL.md` with:

- React usage through `useWalletEvents`;
- non-React usage through `subscribeWalletEvents`;
- exact cleanup behavior;
- multi-chain payload examples;
- a clear statement that balance monitoring is not included.

An initial Playwright test is optional because the behavior is exhaustively
testable with injected wallet events in jsdom. Add an E2E case only if the
integration harness exposes a deterministic wallet account-switch control.
Do not make CI depend on manually switching a real extension account.

## Narrow commands during development

```sh
pnpm graz test -- src/actions/__tests__/events.test.ts
pnpm graz test -- src/actions/__tests__/account.test.ts
pnpm graz test -- src/hooks/__tests__/events.test.tsx
pnpm graz test -- src/provider/__tests__/provider-events.test.tsx
pnpm graz test -- src/actions/wallet/__tests__/wallet-connect.test.ts
```

Vitest may interpret arguments differently through nested pnpm scripts. If a
command unexpectedly runs every test, invoke it from the package:

```sh
pnpm --dir packages/graz exec vitest run src/hooks/__tests__/events.test.tsx
```

## Full verification after green

```sh
pnpm graz build
pnpm graz type-check
pnpm graz test
pnpm build
pnpm lint
pnpm --dir packages/graz pack --dry-run
```

If provider wiring or the integration fixture changes, also run:

```sh
pnpm graz cli --generate
pnpm example:vite build
pnpm example:playground build
pnpm integration:test
```

## Completion checklist

- [ ] Core subscription is usable without React.
- [ ] React hook cleans up automatically.
- [ ] No listener survives unmount or connector change.
- [ ] Account switch never reports a false disconnect.
- [ ] Events are emitted after committed state.
- [ ] Multi-chain payload semantics are tested.
- [ ] Full and partial disconnect behavior is distinct.
- [ ] WalletConnect deletion and expiry are covered.
- [ ] `onBalanceChange` is deferred or backed by a separately approved design.
- [ ] Public exports and declarations remain compatible.
- [ ] Graz build, type-check, test, lint, and package dry-run pass.
