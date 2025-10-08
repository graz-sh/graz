"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useSuggestChainAndConnect } from "graz";
import { osmosistestnet } from "graz/chains";
import type { FC } from "react";

export const ChainSwitcher: FC = () => {
  const {
    isConnecting,
    isReconnecting,
    data: accounts,
  } = useAccount({
    chainId: [osmosistestnet.chainId],
  });

  const account = accounts?.[osmosistestnet.chainId];

  const { suggestAndConnect } = useSuggestChainAndConnect();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Suggest and connect chain</p>
      {account && (
        <p className="text-xs text-muted-foreground break-all">
          Address: {account.bech32Address}
        </p>
      )}
      <Button
        disabled={isConnecting || isReconnecting}
        variant={account ? "default" : "outline"}
        size="sm"
        className="w-full"
        onClick={() =>
          suggestAndConnect({
            chainInfo: osmosistestnet,
          })
        }
      >
        {osmosistestnet.chainId}
      </Button>
    </div>
  );
};
