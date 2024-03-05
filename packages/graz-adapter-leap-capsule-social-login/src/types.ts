import { AminoMsg, Coin } from '@cosmjs/amino';
import { Algo } from "@cosmjs/proto-signing";
import { CosmosCapsuleClient } from './client';

export type SignAminoOptions = {
    preferNoSetFee?: boolean;
    isADR36?: boolean;
    enableExtraEntropy?: boolean;
};

export type preferredSignType = "amino" | "direct" | undefined

export type StdFee = {
    amount: readonly Coin[];
    readonly gas: string;
    /** The granter address that is used for paying with feegrants */
    readonly granter?: string;
    /** The fee payer address. The payer must have signed the transaction. */
    readonly payer?: string;
};

export type StdSignDoc = {
    readonly chain_id: string;
    readonly account_number: string;
    readonly sequence: string;
    fee: StdFee;
    readonly msgs: readonly AminoMsg[];
    readonly memo: string;
  };

export type keyInfo = {
    username: string | undefined;
    address: string;
    algo: Algo;
    pubkey: Uint8Array;
}