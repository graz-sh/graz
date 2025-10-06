"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBalances, useBalanceStaked } from "graz";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coin } from "@cosmjs/stargate";
import type { ChainInfo } from "@keplr-wallet/types";
import type { Key } from "@keplr-wallet/types";

interface ChainBalancesProps {
  chain: ChainInfo;
  account: Key | undefined;
}

const truncateDenom = (denom: string, maxLength = 20): string => {
  if (denom.length <= maxLength) return denom;
  if (denom.startsWith("ibc/")) {
    return `${denom.slice(0, 12)}...${denom.slice(-6)}`;
  }
  const prefixLength = Math.floor(maxLength / 2) - 2;
  const suffixLength = Math.floor(maxLength / 2) - 2;
  return `${denom.slice(0, prefixLength)}...${denom.slice(-suffixLength)}`;
};

export function ChainBalances({ chain, account }: ChainBalancesProps) {
  const { data: chainBalances, isLoading: isLoadingBalances } = useBalances({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  const { data: stakedBalance, isLoading: isLoadingStaked } = useBalanceStaked({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  const mainCurrency = chain.currencies?.[0];
  const stakeCurrency = chain.stakeCurrency;
  const mainDenom = mainCurrency?.coinMinimalDenom;
  const mainBalance = chainBalances?.find((b: Coin) => b.denom === mainDenom);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{chain.chainName}</CardTitle>
              <CardDescription className="font-mono text-xs">{chain.chainId}</CardDescription>
            </div>
          </div>
          {account ? <Badge variant="default">Connected</Badge> : <Badge variant="secondary">Not Connected</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {account ? (
          <>
            {isLoadingBalances || isLoadingStaked ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/5 border border-muted/10 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <div className="p-4 rounded-lg bg-muted/5 border border-muted/10 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ) : (
              (mainBalance || stakedBalance) && (
                <div className="grid grid-cols-2 gap-4">
                  {mainBalance && mainCurrency ? (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Main Balance</p>
                      <div className="text-2xl font-bold">
                        {(parseInt(mainBalance.amount) / Math.pow(10, mainCurrency.coinDecimals || 6)).toFixed(6)}{" "}
                        {mainCurrency.coinDenom}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {mainBalance.amount} {mainBalance.denom}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/5 border border-muted/10">
                      <p className="text-sm text-muted-foreground mb-1">Main Balance</p>
                      <div className="text-2xl font-bold text-muted-foreground">—</div>
                      <p className="text-xs text-muted-foreground mt-1">No balance</p>
                    </div>
                  )}

                  {stakedBalance && stakeCurrency && stakedBalance.amount !== "0" ? (
                    <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-1">Staked Balance</p>
                      <div className="text-2xl font-bold">
                        {(parseInt(stakedBalance.amount) / Math.pow(10, stakeCurrency.coinDecimals || 6)).toFixed(6)}{" "}
                        {stakeCurrency.coinDenom}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {stakedBalance.amount} {stakedBalance.denom}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/5 border border-muted/10">
                      <p className="text-sm text-muted-foreground mb-1">Staked Balance</p>
                      <div className="text-2xl font-bold text-muted-foreground">—</div>
                      <p className="text-xs text-muted-foreground mt-1">No stake</p>
                    </div>
                  )}
                </div>
              )
            )}

            <div>
              <p className="text-sm font-medium mb-2">All Balances</p>
              <div className="space-y-2">
                {isLoadingBalances ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {chainBalances?.map((balance: Coin) => {
                      const currency = chain.currencies?.find((c: any) => c.coinMinimalDenom === balance.denom);
                      const decimals = currency?.coinDecimals || 6;
                      const displayDenom = currency?.coinDenom || balance.denom;
                      const humanReadable = (parseInt(balance.amount) / Math.pow(10, decimals)).toFixed(decimals);

                      return (
                        <div key={balance.denom} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                              <span className="text-xs font-bold">{displayDenom.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{displayDenom}</p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-mono text-xs text-muted-foreground break-all cursor-help">
                                    {truncateDenom(balance.denom)}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs max-w-md break-all">{balance.denom}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-medium">{humanReadable}</p>
                            <p className="font-mono text-xs text-muted-foreground">{balance.amount}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(!chainBalances || chainBalances.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No balances found</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Chain not connected</p>
        )}
      </CardContent>
    </Card>
  );
}
