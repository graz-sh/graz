import { Center, HStack, Spacer, Stack, Text } from "@chakra-ui/react";
import { useAccount } from "graz";
import { BalanceList } from "ui/balance-list";
import { ChainSwitcher } from "ui/chain-switcher";
import { ConnectButton } from "ui/connect-button";
import { ConnectStatus } from "ui/connect-status";
import { RecentChain } from "ui/recent-chain";
import { ToggleTheme } from "ui/toggle-theme";

export default function HomePage() {
  const { data: accountData } = useAccount();

  return (
    <Center minH="100vh">
      <Stack bgColor="whiteAlpha.100" boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <HStack>
          <ConnectStatus />
        </HStack>
        {!accountData && <RecentChain />}
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
        <HStack align="end" pt={4}>
          <ToggleTheme />
          <Spacer />
          <ConnectButton />
        </HStack>
      </Stack>
    </Center>
  );
}
