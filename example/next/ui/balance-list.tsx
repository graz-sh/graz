import { Button, ListItem, Text, Tooltip, UnorderedList } from "@chakra-ui/react";
import { useBalances } from "graz";
import type { FC } from "react";

// Truncate denom utility
const truncateDenom = (denom: string, maxLength = 20): string => {
  if (denom.length <= maxLength) return denom;
  if (denom.startsWith("ibc/")) {
    return `${denom.slice(0, 12)}...${denom.slice(-6)}`;
  }
  const prefixLength = Math.floor(maxLength / 2) - 2;
  const suffixLength = Math.floor(maxLength / 2) - 2;
  return `${denom.slice(0, prefixLength)}...${denom.slice(-suffixLength)}`;
};

export const BalanceList: FC = () => {
  // NEW API: useBalances returns Record<chainId, Coin[]>
  const { data: balancesRecord, isRefetching, refetch } = useBalances({
    chainId: ["cosmoshub-4"],  // Specify chain ID as array
  });

  // Extract balances from Record
  const balances = balancesRecord?.["cosmoshub-4"];

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
          <Tooltip label={denom} placement="top" hasArrow>
            <Text as="span">
              {amount} {truncateDenom(denom)}
            </Text>
          </Tooltip>
        </ListItem>
      ))}

      {!balances && <ListItem ml={4}>no available balances</ListItem>}
    </UnorderedList>
  );
};
