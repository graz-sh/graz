import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { useAccount, useConnect, useSuggestChainAndConnect } from "graz";
import { getChainData, getChainDataArray } from "graz/chains";
import type { FC } from "react";

export const ChainSwitcher: FC = () => {
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

  const mainnetChainsArray = getChainDataArray(["cosmoshub", "juno", "sommelier", "stargaze", "osmosis"]);
  const { osmosistestnet } = getChainData("osmosistestnet");

  const { connect } = useConnect();

  const { suggestAndConnect } = useSuggestChainAndConnect();

  return (
    <FormControl>
      <FormLabel>Switch Chain</FormLabel>
      <ButtonGroup flexWrap="wrap" gap={2} isDisabled={isConnecting || isReconnecting} size="sm" spacing={0}>
        {mainnetChainsArray.map((chain) => (
          <Button key={chain.chainInfo.chainId} onClick={() => connect({ chain: chain.chainInfo })}>
            {chain.chainInfo.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel mt={2}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
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
