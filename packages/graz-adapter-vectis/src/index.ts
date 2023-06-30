import type { ChainInfo, KeyInfo, OfflineAminoSigner, OfflineDirectSigner } from "@vectis/extension-client";
import type { AccountData, GrazAdapter } from "graz";

export class VectisAdapter implements GrazAdapter {
  name = "vectis";
  id = "vectis";
  keystoreEvent = "vectis_accountChanged";

  private getConnector() {
    if (typeof window.vectis.cosmos !== "undefined") return window.vectis.cosmos;
    throw new Error("window.vectis is not defined");
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
      await this.getConnector().enable(chainId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async experimentalSuggestChain(chainInfo: ChainInfo) {
    try {
      await this.getConnector().suggestChains([chainInfo]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getKey(chainId: string): Promise<KeyInfo> {
    try {
      const key = await this.getConnector().getKey(chainId);
      return key;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccount(chainId: string, _prefix?: string): Promise<AccountData> {
    try {
      const [account] = await this.getConnector().getAccounts(chainId);
      if (!account) throw new Error("Account not found");
      return {
        address: Uint8Array.from([]),
        bech32Address: account.address,
        pubKey: account.pubkey,
        algo: account.algo,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getOfflineSigner(chainId: string) {
    try {
      const signer = this.getConnector().getOfflineSigner(chainId);
      return signer as OfflineAminoSigner & OfflineDirectSigner;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getOfflineSignerOnlyAmino(chainId: string) {
    try {
      const signer = this.getConnector().getOfflineSignerAmino(chainId);
      return signer;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getOfflineSignerAuto(chainId: string) {
    try {
      const key = await this.getConnector().getKey(chainId);
      if (key.isNanoLedger) return this.getConnector().getOfflineSignerAmino(chainId);
      return await this.getConnector().getOfflineSignerAuto(chainId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
