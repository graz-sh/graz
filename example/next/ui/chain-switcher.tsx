import { Button, ButtonGroup, Stack, Text } from "@chakra-ui/react";
import { useAccount, useSuggestChainAndConnect } from "graz";
import osmosisTestnet from "graz/chains/osmosistestnet";
import type { FC } from "react";

export const ChainSwitcher: FC = () => {
  const {
    isConnecting,
    isReconnecting,
    data: account,
  } = useAccount({
    chainId: osmosisTestnet.chainId,
  });

  const { suggestAndConnect } = useSuggestChainAndConnect();

  return (
    <Stack spacing={4}>
      <Text>Suggest and connect chain</Text>
      {account ? <Text>Address: {account.bech32Address}</Text> : null}
      <ButtonGroup isDisabled={isConnecting || isReconnecting} size="sm">
        <Button
          colorScheme={account ? "green" : "gray"}
          onClick={() =>
            suggestAndConnect({
              chainInfo: osmosisTestnet,
            })
          }
        >
          {osmosisTestnet.chainId}
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
