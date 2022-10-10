import { Center, Spinner, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useBalances, useBalanceStaked } from "graz";

const Assets = () => {
  const balances = useBalances();
  const balanceStaked = useBalanceStaked();

  return (
    <Stack w="full">
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Asset</Th>
              <Th isNumeric>Staked</Th>
              <Th isNumeric>Available</Th>
            </Tr>
          </Thead>
          <Tbody>
            {balances.data?.map((balance) => (
              <Tr key={balance.denom}>
                <Td>{balance.denom}</Td>
                <Td isNumeric>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {balanceStaked.data?.denom === balance.denom ? (
                    balanceStaked.isLoading ? (
                      <Spinner />
                    ) : (
                      balanceStaked.data.amount
                    )
                  ) : (
                    "-"
                  )}
                </Td>
                <Td isNumeric>{balance.amount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {balances.isLoading && (
          <Center>
            <Spinner />
          </Center>
        )}
      </TableContainer>
    </Stack>
  );
};

export default Assets;
