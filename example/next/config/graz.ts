import { getChainDataArray } from "graz/chains";

export const mainnetChainsArray = getChainDataArray(["axelar", "cosmoshub", "juno", "osmosis", "sommelier"]);

export { default as defaultChain } from "graz/chains/cosmoshub";
