import { Center, Spinner, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useAccount, useBalances, useBalanceStaked } from "graz";
import { numberWithCommas } from "src/utils/numberWithCommas";

const Assets = () => {
  const { isConnected } = useAccount();
  const balances = useBalances();
  const balanceStaked = useBalanceStaked();

  return (
    <Stack w="full">
      {isConnected ? (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Asset denom</Th>
                <Th isNumeric>Staked</Th>
                <Th isNumeric>Available</Th>
              </Tr>
            </Thead>
            <Tbody>
              {balances.data?.map((balance) => {
                return (
                  <Tr key={balance.denom}>
                    <Td>
                      <Text w="260px" overflowX="auto">
                        {balance.denom}
                      </Text>
                    </Td>
                    <Td fontFamily="mono" isNumeric>
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {balanceStaked.data?.denom === balance.denom ? (
                        balanceStaked.isLoading ? (
                          <Spinner />
                        ) : (
                          numberWithCommas(balanceStaked.data.amount)
                        )
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td fontFamily="mono" isNumeric>
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
