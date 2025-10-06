"use client";

import { Button } from "@/components/ui/button";
import { useBalances, useAccount } from "graz";
import { RefreshCw } from "lucide-react";
import type { FC } from "react";

// Truncate denom utility
const truncateDenom = (denom: string, maxLength = 20): string => {
  if (denom.length <= maxLength) return denom;
  if (denom.startsWith("ibc/")) {
    return `${denom.slice(0, 12)}...${denom.slice(-6)}`;
  }
  const prefixLength = Math.floor(maxLength / 2) - 2;
  const suffixLength = Math.floor(maxLength / 2) - 2;
  return `${denom.slice(0, prefixLength)}...${denom.slice(-suffixLength)}`;
};

export const BalanceList: FC = () => {
  const { data: accounts } = useAccount();
  const cosmosAccount = accounts?.["cosmoshub-4"];

  const { data: balances, isRefetching, refetch } = useBalances({
    chainId: "cosmoshub-4",
    bech32Address: cosmosAccount?.bech32Address || "",
    enabled: Boolean(cosmosAccount?.bech32Address),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Balances:</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          disabled={isRefetching}
          className="h-8"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          {isRefetching ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <ul className="space-y-1 ml-4 text-sm">
        {balances?.map(({ amount, denom }) => (
          <li key={denom} className="font-mono text-xs">
            <span title={denom}>
              {amount} {truncateDenom(denom)}
            </span>
          </li>
        ))}
        {!balances && <li className="text-muted-foreground">No available balances</li>}
      </ul>
    </div>
  );
};
