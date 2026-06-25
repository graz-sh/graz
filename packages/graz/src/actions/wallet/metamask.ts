import type { MetaMaskInpageProvider } from "@metamask/providers";

type InjectedEthereumProvider = MetaMaskInpageProvider & {
  isMetaMask?: boolean;
  providers?: InjectedEthereumProvider[];
};

const isMetamaskProvider = (provider: unknown): boolean => {
  if (!provider || typeof provider !== "object") return false;
  const candidate = provider as InjectedEthereumProvider;
  return Boolean(candidate.isMetaMask && typeof candidate.request === "function");
};

export const selectMetamaskProvider = (): MetaMaskInpageProvider | undefined => {
  const ethereum = window.ethereum as InjectedEthereumProvider | undefined;
  if (!ethereum) return undefined;

  const metamask = isMetamaskProvider(ethereum) ? ethereum : ethereum.providers?.find(isMetamaskProvider);
  if (metamask && window.ethereum !== metamask) {
    window.ethereum = metamask;
  }

  return metamask ?? ethereum;
};
