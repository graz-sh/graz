import { Button, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useAccount, useBalances } from "graz";
import type { FC } from "react";

export const BalanceList: FC = () => {
  const account = useAccount({
    chainId: "cosmoshub-4",
  });

  const {
    data: balances,
    isRefetching,
    refetch,
  } = useBalances({
    client: "stargate",
    bech32Address: account?.data?.account?.bech32Address,
    chainId: "cosmoshub-4",
  });

  const tes = useBalances({
    client: "stargate",
    bech32Address: account?.data?.account?.bech32Address,
  });
  console.log("multib", tes.data);

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
