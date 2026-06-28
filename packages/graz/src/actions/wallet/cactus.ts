import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { Keplr } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";

export type CactusCosmosWallet = Pick<
  Keplr,
  "enable" | "getOfflineSigner" | "signDirect" | "signAmino" | "signArbitrary" | "getKey"
>;

export const getCactusCosmos = (): Wallet => {
  if (typeof window.cactuslink_cosmos !== "undefined") {
    const cactusCosmos = window.cactuslink_cosmos;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => reconnect();
      window.addEventListener("accountsChanged", listener);
      return () => {
        window.removeEventListener("accountsChanged", listener);
      };
    };

    const res = Object.assign(cactusCosmos, {
      subscription,
    });

    const getOfflineSignerAuto = (chainId: string) => {
      return Promise.resolve(cactusCosmos.getOfflineSigner(chainId));
    };

    const getOfflineSignerOnlyAmino = (chainId: string) => {
      return cactusCosmos.getOfflineSigner(chainId) as OfflineAminoSigner;
    };

    return {
      ...res,
      getOfflineSignerAuto,
      getOfflineSignerOnlyAmino,
      experimentalSuggestChain: async () => {
        throw new Error("Cactus Cosmos does not support experimentalSuggestChain");
      },
    } as unknown as Wallet;
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.cactuslink_cosmos is not defined");
};
