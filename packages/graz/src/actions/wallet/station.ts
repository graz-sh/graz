import type { DirectSignResponse } from "@cosmjs/proto-signing";
import type { ChainInfo, KeplrSignOptions, StdSignDoc } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Key, SignDoc, Wallet } from "../../types/wallet";
import { clearSession } from ".";

interface ChainInfoResponse {
  chainId: string;
  chainName: string;
  chainSymbolImageUrl: string;
  stakeCurrency: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
  };
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
  };
  currencies: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
  }[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  feeCurrencies: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
    gasPriceStep: {
      average: number;
      high: number;
      low: number;
    };
  }[];
}

interface GetKeyResponse {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  isNanoLedger: boolean;
}

/**
 * Function to return Station object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const station = getStation();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 */
export const getStation = (): Wallet => {
  if (typeof window.station?.keplr !== "undefined") {
    const station = window.station.keplr;

    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.addEventListener("station_wallet_change", listener);
      return () => {
        window.removeEventListener("station_wallet_change", listener);
      };
    };

    const getKey = async (chainId: string): Promise<Key> => {
      const key = (await station.getKey(chainId)) as GetKeyResponse;
      return {
        isKeystone: false,
        ...key,
      };
    };

    const getOfflineSigner = (chainId: string) => {
      try {
        const signerOnlyAmino = station.getOfflineSignerOnlyAmino(chainId);
        const signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse> = (
          _signerAddress: string,
          _signDoc: SignDoc,
        ) => {
          throw new Error("signDirect not supported by Station");
        };
        const signer = Object.assign(signerOnlyAmino, { signDirect });

        return signer;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const experimentalSuggestChain = async (chainInfo: ChainInfo) => {
      try {
        if (!chainInfo.bech32Config) throw new Error("Bech32Config is required");
        if (!chainInfo.stakeCurrency) throw new Error("StakeCurrency is required");

        const chainInfoResponse: ChainInfoResponse = Object.assign(chainInfo, {
          bech32Config: chainInfo.bech32Config,
          chainSymbolImageUrl: chainInfo.chainSymbolImageUrl || "",
          stakeCurrency: {
            coinDecimals: chainInfo.stakeCurrency.coinDecimals,
            coinDenom: chainInfo.stakeCurrency.coinDenom,
            coinImageUrl: chainInfo.stakeCurrency.coinImageUrl || "",
            coinMinimalDenom: chainInfo.stakeCurrency.coinMinimalDenom,
          },
          currencies: chainInfo.currencies.map((currency) => ({
            coinDecimals: currency.coinDecimals,
            coinDenom: currency.coinDenom,
            coinImageUrl: currency.coinImageUrl || "",
            coinMinimalDenom: currency.coinMinimalDenom,
          })),
          feeCurrencies: chainInfo.feeCurrencies.map((currency) => ({
            coinDecimals: currency.coinDecimals,
            coinDenom: currency.coinDenom,
            coinImageUrl: currency.coinImageUrl || "",
            coinMinimalDenom: currency.coinMinimalDenom,
            gasPriceStep: {
              average: currency.gasPriceStep?.average || 0,
              high: currency.gasPriceStep?.high || 0,
              low: currency.gasPriceStep?.low || 0,
            },
          })),
        });

        await station.experimentalSuggestChain(chainInfoResponse);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    return {
      subscription,
      getKey,
      getOfflineSigner,
      experimentalSuggestChain,
      enable: (chainIds: string | string[]) => station.enable(chainIds),
      disable: (chainIds?: string | string[]) => station.disable(chainIds),
      getOfflineSignerAuto: ((chainId: string) =>
        station.getOfflineSignerAuto(chainId)) as unknown as Wallet["getOfflineSignerAuto"],
      getOfflineSignerOnlyAmino: (chainId: string) => station.getOfflineSignerOnlyAmino(chainId),
      signDirect: station.signDirect as unknown as Wallet["signDirect"],
      signAmino: (chainId: string, signer: string, signDoc: StdSignDoc, _signOptions?: KeplrSignOptions) =>
        station.signAmino(chainId, signer, signDoc),
    };
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.station is not defined");
};
