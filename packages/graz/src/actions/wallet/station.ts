import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";
import { ChainInfo, DirectSignResponse, Key, SignDoc } from "@keplr-wallet/types";
import { ChainInfoResponse } from "@terra-money/station-connector/keplrConnector";

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
  if (typeof window.station !== "undefined") {
    const station = window.station.keplr;

    const subscription: (reconnect: () => void) => void = (reconnect) => {
      window.addEventListener("station_wallet_change", () => {
        clearSession();
        reconnect();
      });
      return () => {
        window.removeEventListener("station_wallet_change", () => {
          clearSession();
          reconnect();
        });
      };
    };

    const getKey = async (chainId: string): Promise<Key> => {
      const key = await station.getKey(chainId);
      return {
        isKeystone: false,
        ...key,
      };
    };

    const getOfflineSigner = (chainId: string) => {
      try {
        const signerOnlyAmino = station.getOfflineSignerOnlyAmino(chainId);
        const signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse> = async (
          signerAddress: string,
          signDoc: SignDoc,
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
        const chainInfoResponse: ChainInfoResponse = Object.assign(chainInfo, {
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
      enable: station.enable,
      getOfflineSignerAuto: station.getOfflineSignerAuto,
      getOfflineSignerOnlyAmino: station.getOfflineSignerOnlyAmino,
      signDirect: station.signDirect,
      signAmino: station.signAmino,
    };
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.station is not defined");
};
