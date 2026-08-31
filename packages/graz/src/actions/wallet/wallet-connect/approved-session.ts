import type { SessionTypes } from "@walletconnect/types";
import { parseAccountId, parseChainId, parseNamespaceKey } from "@walletconnect/utils";

export type ApprovedAccount = {
  address: string;
  chainId: string;
};

export type SessionScope = {
  accounts: ApprovedAccount[];
  chainIds: string[];
};

export type ResolvedSession = {
  session: SessionTypes.Struct;
  scope: SessionScope;
};

export const resolveSession = (
  session: SessionTypes.Struct | undefined,
  options: { chainIds?: readonly string[]; now?: number } = {},
): ResolvedSession | undefined => {
  if (!session || session.expiry * 1000 <= (options.now ?? Date.now()) + 1000) return;

  const accounts = new Map<string, ApprovedAccount>();

  for (const [namespaceKey, namespace] of Object.entries(session.namespaces ?? {})) {
    if (parseNamespaceKey(namespaceKey) !== "cosmos" || !Array.isArray(namespace.accounts)) continue;

    const scopedChainId = namespaceKey.includes(":") ? parseChainId(namespaceKey).reference : undefined;

    for (const accountId of namespace.accounts) {
      if (typeof accountId !== "string" || accountId.split(":").length !== 3) continue;

      const { namespace: accountNamespace, reference: chainId, address } = parseAccountId(accountId);
      if (accountNamespace !== "cosmos" || !chainId || !address) continue;
      if (scopedChainId && scopedChainId !== chainId) continue;

      const accountKey = `${chainId}:${address}`;
      accounts.set(accountKey, { address, chainId });
    }
  }

  const approvedAccounts = [...accounts.values()];
  if (approvedAccounts.length === 0) return;

  const chainIds = [...new Set(approvedAccounts.map((account) => account.chainId))];
  if (options.chainIds?.length && !options.chainIds.some((chainId) => chainIds.includes(chainId))) return;

  return {
    session,
    scope: {
      accounts: approvedAccounts,
      chainIds,
    },
  };
};
