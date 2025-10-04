import {
  Badge,
  Center,
  Heading,
  HStack,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { useAccount, useBalances, useBalanceStaked } from "graz";
import { numberWithCommas } from "src/utils/numberWithCommas";
import { truncateDenom } from "src/utils/truncateDenom";
import { PageNavigation } from "src/ui/core/page-navigation";

const Assets = () => {
  const { isConnected } = useAccount();

  // NEW API: Hooks return Record format
  const balances = useBalances();
  const balanceStaked = useBalanceStaked();

  // Flatten Record<chainId, Coin[]> to array with chainId included
  const allBalances = balances.data
    ? Object.entries(balances.data).flatMap(([chainId, coins]) => coins.map((coin) => ({ ...coin, chainId })))
    : [];

  // Get all staked balances as Record
  const stakedBalancesRecord = balanceStaked.data || {};

  return (
    <Stack w="full" spacing={6}>
      <HStack justifyContent="space-between">
        <Heading size="md">Assets</Heading>
        <PageNavigation />
      </HStack>
      {isConnected ? (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Chain</Th>
                <Th>Asset denom</Th>
                <Th isNumeric>Staked</Th>
                <Th isNumeric>Available</Th>
              </Tr>
            </Thead>
            <Tbody>
              {allBalances.map((balance) => {
                const stakedForChain = stakedBalancesRecord[balance.chainId];
                return (
                  <Tr key={`${balance.chainId}-${balance.denom}`}>
                    <Td>
                      <Badge colorScheme="purple" fontSize="xs">
                        {balance.chainId}
                      </Badge>
                    </Td>
                    <Td>
                      <Tooltip label={balance.denom} placement="top" hasArrow>
                        <Text fontSize="sm" fontFamily="mono">
                          {truncateDenom(balance.denom)}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td fontFamily="mono" isNumeric fontSize="sm">
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {stakedForChain?.denom === balance.denom ? (
                        balanceStaked.isLoading ? (
                          <Spinner size="xs" />
                        ) : (
                          numberWithCommas(stakedForChain.amount)
                        )
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td fontFamily="mono" isNumeric fontSize="sm">
                      {numberWithCommas(balance.amount)}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          {balances.isLoading ? (
            <Center>
              <Spinner />
            </Center>
          ) : null}
        </TableContainer>
      ) : null}
    </Stack>
  );
};

export default Assets;
