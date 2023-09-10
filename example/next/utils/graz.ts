import cosmos from "graz/chains/cosmoshub";
import osmosisTestnet from "graz/chains/osmosistestnet";

export const chains = [
  { ...cosmos, rpc: "https://rpc.cosmos.directory/cosmoshub", rest: "https://rest.cosmos.directory/cosmoshub" },
  osmosisTestnet,
];
