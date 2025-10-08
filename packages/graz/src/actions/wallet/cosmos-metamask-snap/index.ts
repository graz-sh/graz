import { CosmosSnap, installSnap, isSnapInstalled } from "@cosmsnap/snapper";

import { useGrazInternalStore } from "../../../store";
import type { KnownKeys, Wallet } from "../../../types/wallet";
import type { ChainId } from "../../../utils/multi-chain";

const metamaskSnapCosmosKeysMap: KnownKeys = {};

export const getMetamaskSnapCosmos = (): Wallet => {
  const ethereum = window.ethereum;
  let cosmos = window.cosmos;
  if (ethereum) {
    const init = async () => {
      const clientVersion = await ethereum.request({
        method: "web3_clientVersion",
      });

      const isMetamask = (clientVersion as string).includes("MetaMask");

      if (!isMetamask) throw new Error("Metamask is not installed");

      if (typeof window.okxwallet !== "undefined") {
        if (window.okxwallet.isOkxWallet) {
          throw new Error("You have OKX Wallet installed. Please disable and reload the page to use Metamask Snap.");
        }
      }
      const version = (clientVersion as string).split("MetaMask/v")[1]?.split(".")[0];
      const isSupportMMSnap = Number(version) >= 11;
      if (!isSupportMMSnap) throw new Error("Metamask Snap is not supported in this version");

      const installedSnap = await isSnapInstalled();
      if (!installedSnap) await installSnap();
      window.cosmos = new CosmosSnap();
      cosmos = window.cosmos;
      return true;
    };

    const enable = async (_chainId: ChainId) => {
      const installedSnap = await isSnapInstalled();
      if (!installedSnap) await installSnap();
    };

    const getOfflineSignerAuto = async (chainId: string) => {
      const key = await cosmos.getKey(chainId);
      if (key.isNanoLedger) return cosmos.getOfflineSignerOnlyAmino(chainId);
      return cosmos.getOfflineSigner(chainId);
    };

    return {
      init,
      enable,
      getOfflineSigner: ((chainId: string) =>
        cosmos.getOfflineSigner(chainId)) as unknown as Wallet["getOfflineSigner"],
      experimentalSuggestChain: async (chainInfo) => {
        if (!chainInfo.bech32Config) throw new Error("Bech32Config is required");
        if (!chainInfo.stakeCurrency) throw new Error("StakeCurrency is required");
        await cosmos.experimentalSuggestChain({
          ...chainInfo,
          stakeCurrency: chainInfo.stakeCurrency,
          bech32Config: chainInfo.bech32Config,
        });
      },
      signAmino: async (chainId, signer, signDoc) => {
        return cosmos.signAmino(chainId, signer, signDoc);
      },
      getKey: async (chainId) => {
        if (typeof metamaskSnapCosmosKeysMap[chainId] !== "undefined") return metamaskSnapCosmosKeysMap[chainId];

        return cosmos.getKey(chainId);
      },
      getOfflineSignerAuto,
      getOfflineSignerOnlyAmino: (chainId) => {
        return cosmos.getOfflineSignerOnlyAmino(chainId);
      },
      signDirect: async (chainId, signer, signDoc) => {
        // @ts-expect-error - signDoc is not the same as SignDoc
        return cosmos.signDirect(chainId, signer, signDoc);
      },
      signArbitrary: async (chainId, signer, data) => {
        return cosmos.signArbitrary(chainId, signer, data);
      },
      disable: async (chainId) => {
        chainId && (await cosmos.deleteChain(chainId));
      },
    };
  }
  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.ethereum is not defined");
};
