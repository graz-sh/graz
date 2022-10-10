import { Heading, Stack, Text } from "@chakra-ui/react";
import { useAccount } from "graz";

import { ChainSwitcher } from "../ui/wallet/chain-switcher";
import { RecentChain } from "../ui/wallet/recent-chain";

const HomePage = () => {
  const { data: accountData, isConnecting, isReconnecting, isConnected } = useAccount();

  return (
    <Stack w="full" gap={2}>
      {!accountData && (isConnecting || isReconnecting) && <RecentChain />}
      {(isConnecting || isReconnecting) && <Text>Connecting</Text>}
      {accountData && (
        <>
          <Heading size="lg">Welcome {accountData.name}</Heading>
          <Text noOfLines={1} wordBreak="break-all">
            Wallet address: <b>{accountData.bech32Address}</b>
          </Text>
          <ChainSwitcher />
        </>
      )}
      {!isConnected && !(isConnecting || isReconnecting) && <Heading>Welcome to Create Graz App</Heading>}
    </Stack>
  );
};

export default HomePage;
