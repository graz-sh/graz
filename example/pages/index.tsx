import { Center, HStack, Spacer, Spinner, Stack, Text } from "@chakra-ui/react";
import { useAccount, useAddressToIbcDomain } from "graz";
import type { NextPage } from "next";
import { BalanceList } from "ui/balance-list";
import { ChainSwitcher } from "ui/chain-switcher";
import { ConnectButton } from "ui/connect-button";
import { ConnectStatus } from "ui/connect-status";
import { RecentChain } from "ui/recent-chain";
import { ToggleTheme } from "ui/toggle-theme";

const HomePage: NextPage = () => {
  const { data: accountData, isConnecting, isReconnecting } = useAccount();
  const { data: ibcDomain, isLoading: isIbcDomainLoading } = useAddressToIbcDomain({
    address: accountData?.bech32Address,
  });

  return (
    <Center minH="100vh">
      <Stack bgColor="whiteAlpha.100" boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <HStack>
          <ConnectStatus />
        </HStack>
        {!accountData && (isConnecting || isReconnecting) && <RecentChain />}
        {accountData && (
          <>
            <Text>
              Wallet name: <b>{accountData.name}</b>
            </Text>
            <Text noOfLines={1} wordBreak="break-all">
              Wallet address: <b>{accountData.bech32Address}</b>
            </Text>

            <Text>
              IBC Domain: <b>{isIbcDomainLoading ? <Spinner /> : ibcDomain?.domainFull || "Not found"}</b>
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
};

export default HomePage;
