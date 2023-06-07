import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { mainnetChainsArray } from "config/graz";
import { useAccount, useConnect, useSuggestChainAndConnect } from "graz";
import osmosisTestnetChainInfo from "graz/chains/osmosistestnet";
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

  const { connect } = useConnect();

  const { suggestAndConnect } = useSuggestChainAndConnect();

  return (
    <FormControl>
      <FormLabel>Switch Chain</FormLabel>
      <ButtonGroup flexWrap="wrap" gap={2} isDisabled={isConnecting || isReconnecting} size="sm" spacing={0}>
        {mainnetChainsArray.map(({ chainInfo }) => (
          <Button key={chainInfo.chainId} onClick={() => connect({ chain: chainInfo })}>
            {chainInfo.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel mt={2}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
          onClick={() =>
            suggestAndConnect({
              chainInfo: osmosisTestnetChainInfo,
            })
          }
        >
          {osmosisTestnetChainInfo.chainId}
        </Button>
      </ButtonGroup>
    </FormControl>
  );
};
