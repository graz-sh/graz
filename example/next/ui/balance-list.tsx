import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { useBalanceStaked } from "graz";
import { truncate, useAccount, useAllBalances, useConnectClient } from "graz";
import { type FC, useEffect } from "react";

export const BalanceList: FC = () => {
  const account = useAccount({
    chainId: "cosmoshub-4",
  });

  const { data } = useConnectClient({
    client: "stargate",
    chainId: "cosmoshub-4",
  });

  const {
    data: balances,
    isRefetching,
    refetch,
  } = useAllBalances({
    client: "stargate",
    bech32Address: account?.account?.bech32Address,
    chainId: "cosmoshub-4",
  });

  const { data: balanceStaked } = useBalanceStaked({
    chainId: "cosmoshub-4",
    bech32Address: account?.account?.bech32Address,
  });

  const tes = useAllBalances({
    bech32Address: account?.account?.bech32Address,
  });

  console.log("all balance", tes);
  const tas = async () => {
    if (!account?.account?.bech32Address) return;
    const gg = await data?.getAllBalances(account.account.bech32Address);
    const bb = await data?.getBalance(
      account.account.bech32Address,
      "ibc/932D6003DA334ECBC5B23A071B4287D0A5CC97331197FE9F1C0689BA002A8421",
    );
    console.log(gg);
    console.log(bb);
  };

  useEffect(() => {
    void tas();
  }, [data, account?.account?.bech32Address]);

  const REFRESH_BUTTON = (
    <Button colorScheme="blue" onClick={() => void refetch()} variant="link">
      refresh
    </Button>
  );

  return (
    <>
      <HStack>
        <Text>Staked Balance: </Text>
        <Text fontFamily="mono">
          {balanceStaked?.amount} {balanceStaked?.denom}
        </Text>
      </HStack>
      <Stack>
        <Text>Balances ({isRefetching ? "loading..." : REFRESH_BUTTON}):</Text>

        {balances?.map(({ amount, denom }) => (
          <Text key={denom} fontFamily="mono" fontSize="sm">
            - {amount} {truncate(denom, 6)}
          </Text>
        ))}

        {!balances && <Text ml={4}>no available balances</Text>}
      </Stack>
    </>
  );
};
