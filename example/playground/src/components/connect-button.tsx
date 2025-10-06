"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAvailableWallets, useAccount, useConnect, useDisconnect, WalletType } from "graz";
import { RefreshCw } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { chainIds } from "@/utils/graz";

export const ConnectButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { isConnected, isConnecting, isReconnecting, reconnect } = useAccount({
    onConnect: ({ walletType, chains }) => {
      toast({
        title: "Wallet connected!",
        description: `Using ${walletType} to ${chains.map((item) => item.chainId).join(", ")}`,
      });
    },
    onDisconnect: () => {
      toast({
        title: "Wallet disconnected!",
        variant: "destructive",
      });
    },
  });

  const { connect } = useConnect();

  const { disconnect } = useDisconnect({
    onSuccess: () => console.log("wallet disconnected"),
  });

  const handleConnect = (wallet: WalletType) => {
    connect({ walletType: wallet, chainId: chainIds });
    setIsOpen(false);
  };

  const availableWallets = getAvailableWallets();
  const wallets = Object.entries(availableWallets)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => ({
      walletType: walletType as WalletType,
      name: walletType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));

  return (
    <>
      <div className="flex gap-1">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isConnecting || isReconnecting}
              onClick={() => (isConnected ? disconnect() : setIsOpen(true))}
            >
              {isConnecting || isReconnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.walletType}
                  onClick={() => handleConnect(wallet.walletType)}
                  variant="outline"
                  className="w-full"
                >
                  Connect with {wallet.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {isConnected && (
          <Button size="icon" variant="outline" onClick={() => void reconnect()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};
