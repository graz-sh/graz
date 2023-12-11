import type { DirectSignResponse } from "@cosmjs/proto-signing";
import type { ChainInfo } from "@keplr-wallet/types";
import type { ChainInfoResponse } from "@terra-money/station-connector/keplrConnector";
import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import type { AccountData, GrazAdapter } from "graz";

export class StationAdapter implements GrazAdapter {
  name = "Station";
  id = "station";
  keystoreEvent = "station_wallet_change";

  private getConnector() {
    if (typeof window.station !== "undefined") return window.station.keplr;
    throw new Error("window.keplr is not defined");
  }

  checkConnector() {
    try {
      this.getConnector();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async enable(chainId: string) {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }
      await this.getConnector().enable(chainId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async experimentalSuggestChain(chainInfo: ChainInfo) {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }

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

      await this.getConnector().experimentalSuggestChain(chainInfoResponse);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccount(chainId: string, prefix?: string): Promise<AccountData> {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }
      const key = await this.getConnector().getKey(chainId);
      return {
        address: key.address,
        bech32Address: key.bech32Address,
        pubKey: key.pubKey,
        algo: key.algo,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getOfflineSigner(chainId: string) {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }
      const signerOnlyAmino = this.getConnector().getOfflineSignerOnlyAmino(chainId);
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
  }

  getOfflineSignerOnlyAmino(chainId: string) {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }
      const signer = this.getConnector().getOfflineSignerOnlyAmino(chainId);
      return signer;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getOfflineSignerAuto(chainId: string) {
    try {
      const isAvailable = this.checkConnector();
      if (!isAvailable) {
        throw new Error("Station is not available");
      }
      const signer = await this.getConnector().getOfflineSignerAuto(chainId);
      return signer;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
