import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { useAccount, useActiveChain, useConnect, useSuggestChainAndConnect } from "graz";
import { getChainData, getChainDataArray } from "graz/chains";

export const ChainSwitcher = () => {
  const toast = useToast();

  const activeChain = useActiveChain();
  const { isConnecting, isReconnecting } = useAccount({
    onConnect: ({ account, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Switched chain!",
          description: `Connected as ${account.name}`,
        });
      }
    },
  });

  const { connect } = useConnect({
    onSuccess: () => console.log("switched chain"),
  });

  const { suggestAndConnect } = useSuggestChainAndConnect({
    onSuccess: () => console.log("switched chain"),
  });

  const chains = getChainDataArray(["cosmoshub", "juno", "osmosis", "stargaze"]).map((c) => c.chainInfo);
  const { osmosistestnet } = getChainData("osmosistestnet");
  return (
    <FormControl>
      <FormLabel my={4}>Switch Chain</FormLabel>
      <ButtonGroup flexWrap="wrap" gap={2} isDisabled={isConnecting || isReconnecting} size="sm" spacing={0}>
        {chains.map((chain) => (
          <Button
            key={chain.chainId}
            colorScheme={activeChain?.chainId === chain.chainId ? "green" : "gray"}
            onClick={() => connect({ chain })}
          >
            {chain.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel my={4}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
          colorScheme={activeChain?.chainId === osmosistestnet.chainInfo.chainId ? "green" : "gray"}
          onClick={() =>
            suggestAndConnect({
              chainInfo: osmosistestnet.chainInfo,
            })
          }
        >
          {osmosistestnet.chainInfo.chainId}
        </Button>
      </ButtonGroup>
    </FormControl>
  );
};
