import { Button, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useAccount, useBalances } from "graz";
import type { FC } from "react";

export const BalanceList: FC = () => {
  const account = useAccount();

  const {
    data: balances,
    isRefetching,
    refetch,
  } = useBalances({
    client: "stargate",
    rpc: "https://rpc.cosmoshub.strange.love",
    bech32Address: account.data?.bech32Address,
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
      },
    ],
  });

  const REFRESH_BUTTON = (
    <Button colorScheme="blue" onClick={() => void refetch()} variant="link">
      refresh
    </Button>
  );

  return (
    <UnorderedList>
      <Text>Balances ({isRefetching ? "loading..." : REFRESH_BUTTON}):</Text>

      {balances?.map(({ amount, denom }) => (
        <ListItem key={denom} fontFamily="mono" fontSize="sm" ml={4}>
          {amount} {denom}
        </ListItem>
      ))}

      {!balances && <ListItem ml={4}>no available balances</ListItem>}
    </UnorderedList>
  );
};
