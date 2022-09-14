import type { Coin } from "@cosmjs/proto-signing";
import type { StdFee } from "@cosmjs/stargate";

export interface SendTokensProps {
  senderAddress: string | undefined;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}
