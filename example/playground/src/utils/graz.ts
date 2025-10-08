import { cosmoshub, osmosis, neutron } from "graz/chains";

export const chains = [
  { ...cosmoshub, rpc: "https://rpc.cosmos.directory/cosmoshub", rest: "https://rest.cosmos.directory/cosmoshub" },
  { ...osmosis, rpc: "https://rpc.cosmos.directory/osmosis", rest: "https://rest.cosmos.directory/osmosis" },
  { ...neutron, rpc: "https://rpc.cosmos.directory/neutron", rest: "https://rest.cosmos.directory/neutron" },
];

export const chainIds = chains.map((chain) => chain.chainId);
