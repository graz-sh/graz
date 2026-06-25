import type { CosmWasmClient, InstantiateOptions, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { StdSignature } from "@cosmjs/amino";
import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, SigningStargateClient, StdFee } from "@cosmjs/stargate";

import { useGrazInternalStore } from "../store";
import { LogCategory } from "../types/logger";
import type { WalletType } from "../types/wallet";
import { getLogger } from "../utils/logger";
import { getWallet } from "./wallet";

export interface Height {
  revisionNumber: bigint;
  revisionHeight: bigint;
}

export interface SignArbitraryArgs {
  walletType?: WalletType;
  chainId: string;
  signerAddress: string;
  data: string | Uint8Array;
}

export interface VerifyArbitraryArgs extends SignArbitraryArgs {
  signature: StdSignature;
}

/**
 * Sign arbitrary data using the active wallet's ADR-36-compatible signing API.
 */
export const signArbitrary = async ({
  walletType = useGrazInternalStore.getState().walletType,
  chainId,
  signerAddress,
  data,
}: SignArbitraryArgs): Promise<StdSignature> => {
  const wallet = getWallet(walletType);

  if (!wallet.signArbitrary) {
    throw new Error(`${walletType} does not support signArbitrary`);
  }

  return wallet.signArbitrary(chainId, signerAddress, data);
};

/**
 * Verify arbitrary data using the active wallet's ADR-36-compatible verification API.
 */
export const verifyArbitrary = async ({
  walletType = useGrazInternalStore.getState().walletType,
  chainId,
  signerAddress,
  data,
  signature,
}: VerifyArbitraryArgs): Promise<boolean> => {
  const wallet = getWallet(walletType);

  if (!wallet.verifyArbitrary) {
    throw new Error(`${walletType} does not support verifyArbitrary`);
  }

  return wallet.verifyArbitrary(chainId, signerAddress, data, signature);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
export interface SendTokensArgs {
  signingClient?: SigningStargateClient | SigningCosmWasmClient;
  senderAddress?: string;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendTokens = async ({
  signingClient,
  senderAddress,
  recipientAddress,
  amount,
  fee,
  memo,
}: SendTokensArgs): Promise<DeliverTxResponse> => {
  const logger = getLogger();

  if (!signingClient) {
    throw new Error("No connected account detected");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }

  logger.debug(LogCategory.TRANSACTION, "Signing transaction", {
    function: "sendTokens",
    senderAddress,
    recipientAddress,
    amount,
  });

  try {
    const result = await signingClient.sendTokens(senderAddress, recipientAddress, amount, fee, memo);

    logger.info(LogCategory.TRANSACTION, "Transaction broadcasted", {
      function: "sendTokens",
      txHash: result.transactionHash,
      height: result.height,
    });

    return result;
  } catch (error) {
    logger.error(LogCategory.TRANSACTION, "Transaction failed", {
      function: "sendTokens",
      error: error instanceof Error ? error.message : String(error),
      senderAddress,
      recipientAddress,
    });
    throw error;
  }
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
export interface SendIbcTokensArgs {
  signingClient?: SigningStargateClient;
  senderAddress?: string;
  recipientAddress: string;
  transferAmount: Coin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight?: Height;
  timeoutTimestamp?: number;
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendIbcTokens = async ({
  signingClient,
  senderAddress,
  recipientAddress,
  transferAmount,
  sourcePort,
  sourceChannel,
  timeoutHeight,
  timeoutTimestamp,
  fee,
  memo,
}: SendIbcTokensArgs) => {
  const logger = getLogger();

  if (!signingClient) {
    throw new Error("Stargate signing client is not ready");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }

  logger.debug(LogCategory.TRANSACTION, "Signing IBC transfer", {
    function: "sendIbcTokens",
    senderAddress,
    recipientAddress,
    transferAmount,
    sourceChannel,
    sourcePort,
  });

  try {
    const result = await signingClient.sendIbcTokens(
      senderAddress,
      recipientAddress,
      transferAmount,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      fee,
      memo,
    );

    logger.info(LogCategory.TRANSACTION, "IBC transfer successful", {
      function: "sendIbcTokens",
      txHash: result.transactionHash,
      height: result.height,
    });

    return result;
  } catch (error) {
    logger.error(LogCategory.TRANSACTION, "IBC transfer failed", {
      function: "sendIbcTokens",
      error: error instanceof Error ? error.message : String(error),
      senderAddress,
      recipientAddress,
      sourceChannel,
    });
    throw error;
  }
};

export interface InstantiateContractArgs<Message extends Record<string, unknown>> {
  signingClient?: SigningCosmWasmClient;
  msg: Message;
  label: string;
  fee: StdFee | "auto" | number;
  options?: InstantiateOptions;
  senderAddress: string;
  codeId: number;
}

export type InstantiateContractMutationArgs<Message extends Record<string, unknown>> = Omit<
  InstantiateContractArgs<Message>,
  "codeId" | "fee"
> & {
  fee?: StdFee | "auto" | number;
};

export const instantiateContract = async <Message extends Record<string, unknown>>({
  signingClient,
  senderAddress,
  msg,
  fee,
  options,
  label,
  codeId,
}: InstantiateContractArgs<Message>) => {
  const logger = getLogger();

  if (!signingClient) {
    throw new Error("CosmWasm signing client is not ready");
  }

  logger.debug(LogCategory.TRANSACTION, "Instantiating contract", {
    function: "instantiateContract",
    senderAddress,
    codeId,
    label,
  });

  try {
    const result = await signingClient.instantiate(senderAddress, codeId, msg, label, fee, options);

    logger.info(LogCategory.TRANSACTION, "Contract instantiated", {
      function: "instantiateContract",
      contractAddress: result.contractAddress,
      txHash: result.transactionHash,
    });

    return result;
  } catch (error) {
    logger.error(LogCategory.TRANSACTION, "Contract instantiation failed", {
      function: "instantiateContract",
      error: error instanceof Error ? error.message : String(error),
      codeId,
      senderAddress,
    });
    throw error;
  }
};

export interface ExecuteContractArgs<Message extends Record<string, unknown>> {
  signingClient?: SigningCosmWasmClient;
  msg: Message;
  fee: StdFee | "auto" | number;
  senderAddress: string;
  contractAddress: string;
  funds: Coin[];
  memo: string;
}

export type ExecuteContractMutationArgs<Message extends Record<string, unknown>> = Omit<
  ExecuteContractArgs<Message>,
  "contractAddress" | "fee" | "funds" | "memo"
> & {
  fee?: StdFee | "auto" | number;
  funds?: Coin[];
  memo?: string;
};

export const executeContract = async <Message extends Record<string, unknown>>({
  signingClient,
  senderAddress,
  msg,
  fee,
  contractAddress,
  funds,
  memo,
}: ExecuteContractArgs<Message>) => {
  const logger = getLogger();

  if (!signingClient) {
    throw new Error("CosmWasm signing client is not ready");
  }

  logger.debug(LogCategory.TRANSACTION, "Executing contract", {
    function: "executeContract",
    senderAddress,
    contractAddress,
    msg,
  });

  try {
    const result = await signingClient.execute(senderAddress, contractAddress, msg, fee, memo, funds);

    logger.info(LogCategory.TRANSACTION, "Contract execution successful", {
      function: "executeContract",
      txHash: result.transactionHash,
      events: result.events.length,
    });

    return result;
  } catch (error) {
    logger.error(LogCategory.TRANSACTION, "Contract execution failed", {
      function: "executeContract",
      error: error instanceof Error ? error.message : String(error),
      contractAddress,
      senderAddress,
    });
    throw error;
  }
};

export const getQuerySmart = async <TData>(
  address: string,
  queryMsg: Record<string, unknown>,
  client?: CosmWasmClient,
): Promise<TData> => {
  const logger = getLogger();

  if (!client) {
    throw new Error("CosmWasm client is not ready");
  }

  logger.debug(LogCategory.QUERY, "Querying smart contract", { function: "getQuerySmart", address, queryMsg });

  try {
    const result = (await client.queryContractSmart(address, queryMsg)) as TData;
    logger.debug(LogCategory.QUERY, "Smart query successful", { function: "getQuerySmart", address });
    return result;
  } catch (error) {
    logger.error(LogCategory.QUERY, "Smart query failed", {
      function: "getQuerySmart",
      error: error instanceof Error ? error.message : String(error),
      address,
    });
    throw error;
  }
};

export const getQueryRaw = async (
  address: string,
  keyStr: string,
  client?: CosmWasmClient,
): Promise<Uint8Array | null> => {
  const logger = getLogger();

  if (!client) {
    throw new Error("CosmWasm client is not ready");
  }

  logger.debug(LogCategory.QUERY, "Querying raw contract data", { function: "getQueryRaw", address, key: keyStr });

  try {
    const key = new TextEncoder().encode(keyStr);
    const result = await client.queryContractRaw(address, key);
    logger.debug(LogCategory.QUERY, "Raw query successful", { function: "getQueryRaw", address });
    return result;
  } catch (error) {
    logger.error(LogCategory.QUERY, "Raw query failed", {
      function: "getQueryRaw",
      error: error instanceof Error ? error.message : String(error),
      address,
    });
    throw error;
  }
};
