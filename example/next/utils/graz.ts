import { cosmoshub, osmosistestnet } from "graz/chains";

export const chains = [
  { ...cosmoshub, rpc: "https://rpc.cosmos.directory/cosmoshub", rest: "https://rest.cosmos.directory/cosmoshub" },
  osmosistestnet,
];
