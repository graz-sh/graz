import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import {
  mainnetChainsArray,
  testnetChains,
  useAccount,
  useActiveChain,
  useConnect,
  useSuggestChainAndConnect,
} from "graz";

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

  return (
    <FormControl>
      <FormLabel my={4}>Switch Chain</FormLabel>
      <ButtonGroup flexWrap="wrap" gap={2} isDisabled={isConnecting || isReconnecting} size="sm" spacing={0}>
        {mainnetChainsArray.map((chain) => (
          <Button
            key={chain.chainId}
            colorScheme={activeChain?.chainId === chain.chainId ? "green" : "gray"}
            onClick={() => connect(chain)}
          >
            {chain.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel my={4}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
          colorScheme={activeChain?.chainId === testnetChains.osmosis.chainId ? "green" : "gray"}
          onClick={() =>
            suggestAndConnect({
              chainInfo: testnetChains.osmosis,
            })
          }
        >
          {testnetChains.osmosis.chainId}
        </Button>
      </ButtonGroup>
    </FormControl>
  );
};
