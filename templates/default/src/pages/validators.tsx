import { Button, Center, Spinner, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { useActiveChain, useActiveChainValidators, useBalances } from "graz";
import { useQueryClient } from "src/hooks/use-query-client";
import { numberWithCommas } from "src/utils/numberWithCommas";

const Validators = () => {
  const balances = useBalances();
  const queryClient = useQueryClient();
  const { data } = useActiveChainValidators(queryClient.data);
  const activeChain = useActiveChain();

  const validators = (() => {
    const sort = data?.validators.sort((a, b) => Number(b.tokens) - Number(a.tokens));
    return sort;
  })();

  const stakeCurrencyDenom = activeChain?.currencies[0]?.coinDenom;
  const stakeCurrencyDecimal = activeChain?.currencies[0]?.coinDecimals;

  const url = (() => {
    const path = () => {
      switch (true) {
        case activeChain?.chainId === "cosmoshub-4":
          return "cosmoshub";
        case activeChain?.chainId === "axelar-dojo-1":
          return "axelar";
        case activeChain?.chainId === "juno-1":
          return "juno";
        case activeChain?.chainId === "osmosis-1" || activeChain?.chainId === "osmo-test-4":
          return "osmosis";
        case activeChain?.chainId === "sommelier-3":
          return "sommelier";
        default:
          return "";
      }
    };
    const link =
      activeChain?.chainId === "osmo-test-4"
        ? `https://testnet.keplr.app/chains/${path()}`
        : `https://wallet.keplr.app/chains/${path()}`;

    return link;
  })();

  return (
    <Stack w="full">
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th isNumeric>#</Th>
              <Th>Name</Th>
              <Th isNumeric>Voting Power</Th>
              <Th isNumeric>Comission</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {validators?.map((validator, index) => {
              const votingPower = Number(new BigNumber(validator.tokens).shiftedBy(-stakeCurrencyDecimal!))
                .toFixed()
                .toString();
              const commissionRates = `${Number(
                Number(
                  new BigNumber(validator.commission!.commissionRates!.rate).div(1e18).toFixed(2, BigNumber.ROUND_CEIL),
                ) * 100,
              ).toFixed()}%`;
              return (
                <Tr key={validator.description?.moniker}>
                  <Td isNumeric>{index + 1}</Td>
                  <Td>{validator.description?.moniker}</Td>
                  <Td isNumeric fontFamily="mono">
                    {numberWithCommas(votingPower)} {stakeCurrencyDenom}
                  </Td>
                  <Td isNumeric fontFamily="mono">
                    {commissionRates}
                  </Td>
                  <Td>
                    <Button as="a" href={url} target="_blank" size="xs">
                      Manage
                    </Button>
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
    </Stack>
  );
};

export default Validators;
