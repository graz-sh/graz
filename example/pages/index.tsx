import { Center, Stack, Text } from "@chakra-ui/react";
import { useAccount } from "graz";
import { BalanceList } from "ui/balance-list";
import { ChainSwitcher } from "ui/chain-switcher";
import { ConnectButton } from "ui/connect-button";
import { ConnectStatus } from "ui/connect-status";

export default function HomePage() {
  const { data: accountData } = useAccount();

  return (
    <Center minH="100vh">
      <Stack boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <ConnectStatus />
        {accountData && (
          <>
            <Text>
              Wallet name: <b>{accountData.name}</b>
            </Text>
            <Text noOfLines={1} wordBreak="break-all">
              Wallet address: <b>{accountData.bech32Address}</b>
            </Text>
            <BalanceList />
            <ChainSwitcher />
          </>
        )}
        <br />
        <ConnectButton />
      </Stack>
    </Center>
  );
}
