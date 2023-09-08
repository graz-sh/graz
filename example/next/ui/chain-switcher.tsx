import { Button, ButtonGroup, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { useAccount, useConnect, useSuggestChainAndConnect } from "graz";
import { osmosistestnet } from "graz/chains";
import type { FC } from "react";
import { mainnetChains } from "utils/chains";

export const ChainSwitcher: FC = () => {
  const toast = useToast();

  const { isConnecting, isReconnecting } = useAccount({
    onConnect: ({ accounts, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Switched chain!",
          description: `Connected as ${Object.values(accounts)[0]?.name}`,
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
        {mainnetChains.map((chain) => (
          <Button key={chain.chainId} onClick={() => connect({ chainId: chain.chainId })}>
            {chain.chainId}
          </Button>
        ))}
      </ButtonGroup>
      <FormLabel mt={2}>Suggest and connect chain</FormLabel>
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
          onClick={() =>
            suggestAndConnect({
              chainInfo: osmosistestnet,
            })
          }
        >
          {osmosistestnet.chainId}
        </Button>
      </ButtonGroup>
    </FormControl>
  );
};
