# RFC 269: Wallet event subscriptions research

Status: implementation research

Issue: [graz-sh/graz#269](https://github.com/graz-sh/graz/issues/269)

Researched: 2026-06-27

## Recommendation

Implement a smaller first version than the issue sketch:

1. Add a framework-agnostic `subscribeWalletEvents()` action that returns an
   unsubscribe function.
2. Add a React `useWalletEvents()` hook that owns its subscription and cleanup;
   the hook should not require callers to invoke an unsubscribe function.
3. Support account, connected-chain-set, and disconnect events in v1.
4. Defer `onBalanceChange`. A balance change is chain state, not a wallet event,
   and none of Graz's wallet adapters emits it.
5. Normalize adapter events before exposing them. Do not build the public API by
   directly forwarding each wallet's native event.

This preserves the repository boundary that actions are framework-agnostic and
hooks wrap actions, while keeping the public behavior consistent across wallet
implementations.

## What the proposal currently says

The issue proposes one hook with four callbacks:

```ts
const unsubscribe = useWalletEvents({
  onAccountChange: (newAccount) => {},
  onChainChange: (chainId) => {},
  onDisconnect: () => {},
  onBalanceChange: (balance) => {},
});
```

The same text appeared in the now-removed
`notes/legacy/IMPROVEMENT_DESIGN.md`. It can be recovered from the parent of
commit `3196c98` with:

```sh
git show 3196c98^:notes/legacy/IMPROVEMENT_DESIGN.md
```

The issue and legacy note define the goal, but not event semantics, payloads,
ordering, multi-chain behavior, or the boundary between native wallet events
and Graz state changes.

## Existing behavior in Graz

### Adapter subscriptions are account-change triggers

The public `Wallet` type has:

```ts
subscription?: (reconnect: () => void) => () => void;
```

Most browser adapters use it to listen for an account/keystore-change event.
Their listeners clear the session and then invoke `reconnect`. Examples include
Keplr, Cosmostation, Compass, Station, Vectis, XDEFI, Initia, OKX, and Cactus.

WalletConnect is broader. It listens for `session_event`, `session_delete`, and
`session_expire`; its `session_event` handler recognizes `accountsChanged` but
otherwise falls through to reconnect.

This is not yet a general event API:

- the callback receives no event name or payload;
- adapter code owns session mutation;
- callers cannot distinguish account change from disconnect;
- several supported wallet types are not wired in `useGrazEvents`;
- the legacy `subscription` property is exported as part of `Wallet`, so
  replacing its signature would be a public breaking change.

### `useGrazEvents` owns native subscription lifetime, but drops cleanup

`packages/graz/src/provider/events.tsx` selects an adapter from
`_reconnectConnector` and invokes `wallet.subscription(...)` in an effect. The
unsubscribe function returned by the adapter is not returned from the effect.
Consequences:

- unmount does not remove the native listener;
- connector changes can leave the previous listener active;
- effect reruns can register duplicates;
- React Strict Mode can expose duplicate subscription behavior.

The first implementation slice should add a characterization test for this
before refactoring it.

### Store state can describe public events, but not their cause

`GrazSessionStore` contains:

- `accounts: Record<string, Key> | null`;
- `activeChainIds: string[] | null`;
- `status: "connected" | "connecting" | "reconnecting" | "disconnected"`.

That is enough to calculate account, chain-set, and connection diffs after an
operation. It is not enough to infer intent. Today an adapter account-change
listener calls `clearSession()` first, producing a temporary `disconnected`
state before reconnecting. A store-only subscriber would therefore emit a
false disconnect for an account switch.

The implementation must either:

- stop clearing session state before an account-change reconnect and emit
  normalized events from successful actions; or
- carry explicit event provenance through the reconciliation path.

Waiting a tick and guessing whether reconnect follows is not a stable contract.

### `useAccount` overlaps with two proposed callbacks

`useAccount` already accepts `onConnect` and `onDisconnect` and subscribes to
status transitions. `useWalletEvents` should not silently differ from it about
what "disconnect" means. Long term, both hooks should consume the same
framework-agnostic event source.

### Balance has no event source

`useBalance` and `useBalances` query chain RPC through a `StargateClient`.
Their cache only changes when a query runs. Wallet keystore events do not
contain balances, and the current adapters expose no balance event.

Calling a query-cache update `onBalanceChange` would be misleading: it means
"Graz fetched a different value," not "the chain balance changed." Detecting
the latter needs an explicit strategy such as polling, transaction-triggered
invalidation, or a chain-specific WebSocket/indexer subscription. That deserves
a separate API and performance budget.

## External event evidence

- The [Cosmostation Cosmos event documentation](https://docs.cosmostation.io/extension/integration/cosmos/typescript)
  describes `cosmostation_keystorechange` as an account/keystore switch signal
  and explicitly requires removing listeners.
- Cosmostation's
  [wallet normalization example](https://docs.cosmostation.io/extension/integration/cosmos/wallet)
  maps both Keplr's `keplr_keystorechange` and Leap's
  `leap_keystorechange` to a unified `AccountChanged` event.
- [WalletConnect session event documentation](https://docs.walletconnect.network/wallet-sdk/react-native/usage)
  distinguishes `accountsChanged`, `chainChanged`, and `session_delete`.

These sources support normalization and cleanup. They do not establish a
portable Cosmos balance-change event.

## Proposed v1 semantics

### Core API

```ts
export interface WalletEventContext {
  walletType: WalletType;
}

export interface AccountChangeEvent extends WalletEventContext {
  accounts: Record<string, Key>;
  previousAccounts: Record<string, Key>;
  changedChainIds: string[];
}

export interface ChainChangeEvent extends WalletEventContext {
  chainIds: string[];
  previousChainIds: string[];
  addedChainIds: string[];
  removedChainIds: string[];
}

export interface DisconnectEvent extends WalletEventContext {
  chainIds: string[];
  reason: "user" | "wallet" | "session-expired" | "reconnect-failed";
}

export interface WalletEventHandlers {
  onAccountChange?: (event: AccountChangeEvent) => void;
  onChainChange?: (event: ChainChangeEvent) => void;
  onDisconnect?: (event: DisconnectEvent) => void;
}

export function subscribeWalletEvents(
  handlers: WalletEventHandlers,
): () => void;
```

Names can be tightened during implementation, but payloads must remain
multi-chain. A singular `chainId` or `newAccount` would contradict Graz's
public multi-chain model.

### React API

```ts
useWalletEvents({
  onAccountChange(event) {
    console.log(event.changedChainIds, event.accounts);
  },
  onChainChange(event) {
    console.log(event.addedChainIds, event.removedChainIds);
  },
  onDisconnect(event) {
    console.log(event.reason);
  },
});
```

The hook returns `void` and automatically unsubscribes on unmount. If an
imperative unsubscribe is needed outside React, use
`subscribeWalletEvents()`.

### Event rules

- Do not emit account or chain events for initial hydration/subscription.
- Initial connect is a connect operation, not an account change.
- Emit account change only after a successful wallet reconciliation and after
  the store contains the new accounts.
- Compare account identity per chain. For v1, `bech32Address` is the identity;
  display-name-only changes do not count.
- Treat `activeChainIds` as a set. Reordering alone is not a chain change.
- Emit chain change for successful additions and partial disconnects.
- Emit disconnect once when the final active chain is removed, a wallet session
  is deleted/expired, or reconnect failure clears the session.
- An account-switch reconnect must not emit disconnect.
- Invoke handlers synchronously after the corresponding state commit.
- One throwing consumer must not prevent other subscribers from receiving the
  event; surface errors asynchronously or through the logger.
- Unsubscribe must be idempotent.

## Internal design

Add an internal typed event channel and keep ownership clear:

```text
native wallet event
  -> adapter normalization
  -> account action reconciles state
  -> action emits committed semantic event
  -> subscribeWalletEvents()
  -> useWalletEvents()
```

Suggested files:

- `packages/graz/src/actions/events.ts` — public framework-agnostic subscribe
  function and internal emitter;
- `packages/graz/src/types/events.ts` — public payload and handler types;
- `packages/graz/src/hooks/events.ts` — React lifecycle wrapper;
- `packages/graz/src/provider/events.tsx` — native adapter orchestration only.

Do not change the existing `Wallet.subscription` signature in place. Either:

1. add a new optional typed adapter event source and retain `subscription` for
   compatibility; or
2. keep the normalization helper internal to `provider/events.tsx` while the
   public event channel is driven by actions.

The second option is the smallest v1. The first is cleaner if maintainers are
ready to migrate every adapter in the same change.

## Decisions needed before implementation

1. Is `onDisconnect` full-session only? Recommended: yes; use chain change for
   partial disconnect.
2. Should an account event fire once with a multi-chain diff or once per chain?
   Recommended: once with `changedChainIds`.
3. Does initial connect count as account/chain change? Recommended: no.
4. Is `onBalanceChange` removed from v1? Recommended: yes, with a follow-up RFC.
5. Should reconnect failure report only disconnect or also an error event?
   Recommended: disconnect with `reason: "reconnect-failed"` for v1.

## Out of scope for v1

- balance monitoring;
- transaction events;
- arbitrary native event passthrough;
- changing generated `graz/chains` publishing;
- changing signer types or deep-importing `cosmjs-types`;
- replacing the deprecated WalletConnect modal package.
