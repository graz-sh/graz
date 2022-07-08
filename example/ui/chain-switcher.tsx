import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { OSMOSIS_TESTNET } from "constants/osmosis-testnet";
import { defaultChainsArray, useAccount, useConnect, useSuggestChainAndConnect } from "graz";

export function ChainSwitcher() {
  const toast = useToast();

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
      <FormLabel>Switch Chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        {defaultChainsArray.map((chain) => (
          <Button key={chain.chainId} onClick={() => connect(chain)}>
            {chain.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel mt={2}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button onClick={() => suggestAndConnect(OSMOSIS_TESTNET)}>{OSMOSIS_TESTNET.chainId}</Button>
      </ButtonGroup>
    </FormControl>
  );
}
