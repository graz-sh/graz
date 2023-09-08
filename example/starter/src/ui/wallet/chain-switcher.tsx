import { ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { useAccount, useActiveChainIds, useConnect, useSuggestChainAndConnect } from "graz";

export const ChainSwitcher = () => {
  const toast = useToast();

  const activeChainIds = useActiveChainIds();
  const { isConnecting, isReconnecting } = useAccount({
    onConnect: ({ chains, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Switched chain!",
          description: `Connected as ${Object.values(chains)
            .map((c) => c.chainId)
            .join("; ")}`,
        });
      }
    },
  });

  const { connect } = useConnect({
    onSuccess: () => console.log("Connnected"),
  });

  const { suggestAndConnect } = useSuggestChainAndConnect({
    onSuccess: () => console.log("Connnected"),
  });

  return (
    <FormControl>
      <FormLabel my={4}>Connect other chains</FormLabel>
      <ButtonGroup flexWrap="wrap" gap={2} isDisabled={isConnecting || isReconnecting} size="sm" spacing={0}>
        {/* {mainnetChainsArray.map((chain) => (
          <Button
            key={chain.chainId}
            colorScheme={activeChainIds?.includes(chain.chainId) ? "green" : "gray"}
            onClick={() => connect({ chainId: chain.chainId })}
          >
            {chain.chainId}
          </Button>
        ))} */}
      </ButtonGroup>
      <FormLabel my={4}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        {/* <Button
          colorScheme={activeChainIds?.includes(testnetChains.osmosis.chainId) ? "green" : "gray"}
          onClick={() =>
            suggestAndConnect({
              chainInfo: testnetChains.osmosis,
            })
          }
        >
          {testnetChains.osmosis.chainId}
        </Button> */}
      </ButtonGroup>
    </FormControl>
  );
};
