/* eslint @typescript-eslint/no-explicit-any: 0 */ // --> OFF

import { CapsuleProvider } from "@leapwallet/cosmos-social-login-capsule-provider";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { SignAminoOptions, StdSignDoc, preferredSignType } from "./types";

export class CosmosCapsuleClient  {
  readonly loginProvider: CapsuleProvider;

  constructor(options: { loginProvider: CapsuleProvider }) {
    this.loginProvider = options.loginProvider
  }

  async disconnect() {
    await this.loginProvider.disconnect();
  }

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: "cosmos",
      chainId,
      address,
      username,
    };
  }

  async enable() {
    await this.handleConnect();
}

  async handleConnect() {
    await this.loginProvider.handleConnect();
  }

  async getAccount(chainId: string) {
    return this.loginProvider.getAccount(chainId);
  }

  getOfflineSigner(chainId: string, preferredSignType?: preferredSignType) {
    return this.loginProvider.getOfflineSigner(chainId, preferredSignType)
  }

  getOfflineSignerAmino(chainId: string): any {
    return this.loginProvider.getOfflineSignerAmino(chainId);
  }



  getOfflineSignerAuto(chainId: string): any {
    return this.loginProvider.getOfflineSignerAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string): any {
    return this.loginProvider.getOfflineSignerDirect(chainId);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignAminoOptions,
  ) {
    return this.loginProvider.signAmino(chainId, signer, signDoc, signOptions)
  }

  async signDirect(chainId: string, signer: string, signDoc: SignDoc): Promise<any> {
    return this.loginProvider.signDirect(chainId, signer, signDoc);
  }
}
