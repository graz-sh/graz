import type { Coin } from "@cosmjs/proto-signing";
import type { StdFee } from "@cosmjs/stargate";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

export interface SendTokensProps {
  senderAddress: string | undefined;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export interface SendIbcTokensProps {
  senderAddress: string | undefined;
  recipientAddress: string;
  transferAmount: Coin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight: Height | undefined;
  timeoutTimestamp: number | undefined;
  fee: number | StdFee | "auto";
  memo: string;
}
