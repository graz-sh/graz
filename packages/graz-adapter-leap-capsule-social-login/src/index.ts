
import {CosmosCapsuleClient} from './client';
import { CapsuleProvider, CapsuleEnvironment } from "@leapwallet/cosmos-social-login-capsule-provider";
import { CapsuleAminoSigner } from "@leapwallet/capsule-web-sdk-lite"
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { AccountData, GrazAdapter } from "graz";
import { keyInfo } from './types';


declare global {
  interface Window { leapCapsuleClient: CosmosCapsuleClient; }
}

export class VectisAdapter implements GrazAdapter {
  name = "leap-capsule";
  id = "leap-capsule";
  keystoreEvent = "leap-capsule_accountChanged";

  constructor() {
    let leapCapsuleClient = new CosmosCapsuleClient({ loginProvider: new CapsuleProvider({ apiKey: process.env.CAPSULE_KEY || process.env.NEXT_PUBLIC_CAPSULE_KEY, env: process.env.CAPSULE_ENV || process.env.NEXT_PUBLIC_CAPSULE_ENV as unknown as CapsuleEnvironment }) })
    window.leapCapsuleClient = leapCapsuleClient;
  }

  private getConnector() {
    if (typeof window.leapCapsuleClient !== "undefined") return window.leapCapsuleClient;
    throw new Error("window.leapCapsuleClient is not defined");
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
      await this.getConnector().enable();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getKey(chainId: string): Promise<keyInfo> {
    try {
      const account = await this.getConnector().getAccount(chainId);
      return account;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccount(chainId: string, _prefix?: string): Promise<AccountData> {
    try {
      const account = await this.getConnector().getAccount(chainId);
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
      return signer as CapsuleAminoSigner & OfflineDirectSigner;
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
      const key = await this.getConnector().getAccount(chainId);
      return await this.getConnector().getOfflineSignerAuto(chainId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
