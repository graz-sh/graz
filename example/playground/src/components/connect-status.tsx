"use client";

import { Badge } from "@/components/ui/badge";
import { useAccount, useActiveChainIds } from "graz";
import { Loader2 } from "lucide-react";
import type { FC } from "react";

export const ConnectStatus: FC = () => {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const activeChains = useActiveChainIds();

  if (!isConnected) {
    return (
      <Badge variant="outline" className="gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-xs">Disconnected</span>
      </Badge>
    );
  }

  if (isConnecting || isReconnecting) {
    return (
      <Badge variant="outline" className="gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Connecting...</span>
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-xs">Connected</span>
      </Badge>
      {activeChains && activeChains.length > 0 && (
        <div className="flex items-center gap-1">
          {activeChains.map((chainId) => (
            <Badge key={chainId} variant="secondary" className="text-xs">
              {chainId}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
