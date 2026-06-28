import type { Key, WalletType } from "./wallet";

/** Context shared by every normalized wallet event. */
export interface WalletEventContext {
  walletType: WalletType;
}

/** Account identities after a wallet account switch. */
export interface AccountChangeEvent extends WalletEventContext {
  accounts: Record<string, Key>;
  previousAccounts: Record<string, Key>;
  changedChainIds: string[];
}

/** The complete connected chain set after it changes. */
export interface ActiveChainsChangeEvent extends WalletEventContext {
  activeChainIds: string[];
  previousActiveChainIds: string[];
}

/** Why Graz cleared the complete wallet session. */
export type DisconnectReason = "user" | "wallet" | "session-expired" | "reconnect-failed";

/** Details for a full-session disconnect. */
export interface DisconnectEvent extends WalletEventContext {
  chainIds: string[];
  reason: DisconnectReason;
}

/** Callbacks accepted by wallet event subscriptions. */
export interface WalletEventHandlers {
  onAccountChange?: (event: AccountChangeEvent) => void;
  onActiveChainsChange?: (event: ActiveChainsChangeEvent) => void;
  onDisconnect?: (event: DisconnectEvent) => void;
}

/** @internal Semantic event used to dispatch committed wallet state changes. */
export type WalletEvent =
  | { type: "accountChange"; payload: AccountChangeEvent }
  | { type: "activeChainsChange"; payload: ActiveChainsChangeEvent }
  | { type: "disconnect"; payload: DisconnectEvent };
