import { Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useAccount, useBalance, useBalances, useBalanceStaked } from "graz";

const Assets = () => {
  const account = useAccount();
  const balances = useBalances();
  const balanceStaked = useBalanceStaked();
  const { data } = useBalance("uausdc", account.data?.bech32Address);
  console.log(data);
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
                <Td isNumeric>{balanceStaked.data?.amount}</Td>
                <Td isNumeric>{balance.amount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default Assets;
