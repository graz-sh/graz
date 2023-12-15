import { WalletType } from "graz";
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from "graz/chains";

export const mainnetChains = [
  { ...cosmoshub, rpc: "https://rpc.cosmos.directory/cosmoshub", rest: "https://rest.cosmos.directory/cosmoshub" },
  { ...sommelier, rpc: "https://rpc.cosmos.directory/sommelier", rest: "https://rest.cosmos.directory/sommelier" },
  { ...stargaze, rpc: "https://rpc.cosmos.directory/stargaze", rest: "https://rest.cosmos.directory/stargaze" },
  { ...axelar, rpc: "https://rpc.cosmos.directory/axelar", rest: "https://rest.cosmos.directory/axelar" },
  { ...osmosis, rpc: "https://rpc.cosmos.directory/osmosis", rest: "https://rest.cosmos.directory/osmosis" },
];

export const listedWallets = {
  [WalletType.KEPLR]: {
    name: "Keplr",
    imgSrc: "/assets/wallet-icon-keplr.png",
  },
  [WalletType.LEAP]: {
    name: "Leap",
    imgSrc: "/assets/wallet-icon-leap.png",
  },
  [WalletType.COSMOSTATION]: {
    name: "Cosmostation",
    imgSrc: "/assets/wallet-icon-cosmostation.png",
  },
  [WalletType.VECTIS]: {
    name: "Vectis",
    imgSrc: "/assets/wallet-icon-vectis.svg",
  },
  [WalletType.STATION]: {
    name: "Station",
    imgSrc: "/assets/wallet-icon-station.svg",
  },
  [WalletType.XDEFI]: {
    name: "XDefi",
    imgSrc: "/assets/wallet-icon-xdefi.jpeg",
  },
  [WalletType.METAMASK_SNAP_LEAP]: {
    name: "Metamask Snap Leap",
    imgSrc: "/assets/wallet-icon-metamask.png",
  },
  [WalletType.WALLETCONNECT]: {
    name: "WalletConnect",
    imgSrc: "/assets/wallet-icon-walletconnect.png",
  },
  [WalletType.WC_KEPLR_MOBILE]: {
    name: "Keplr Mobile",
    imgSrc: "/assets/wallet-icon-keplr.png",
    mobile: true,
  },
  [WalletType.WC_LEAP_MOBILE]: {
    name: "Leap Mobile",
    imgSrc: "/assets/wallet-icon-leap.png",
    mobile: true,
  },
  [WalletType.WC_COSMOSTATION_MOBILE]: {
    name: "Cosmostation Mobile",
    imgSrc: "/assets/wallet-icon-cosmostation.png",
    mobile: true,
  },
};
