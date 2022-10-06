import { Button, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useBalances } from "graz";
import type { FC } from "react";

export const BalanceList: FC = () => {
  const { data: balances, isRefetching, refetch } = useBalances();

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
