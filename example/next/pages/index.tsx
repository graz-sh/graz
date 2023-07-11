import { Center, HStack, Stack } from "@chakra-ui/react";
import { useOfflineSigners } from "graz";
import { useConnectClient } from "graz";
import type { NextPage } from "next";
import { BalanceList } from "ui/balance-list";
import { ConnectButton } from "ui/connect-button";
import { ToggleTheme } from "ui/toggle-theme";

const HomePage: NextPage = () => {
  const { data } = useConnectClient({
    client: "stargate",
  });
  const oS = useOfflineSigners({
    chainId: "cosmoshub-4",
  });

  return (
    <Center minH="100vh">
      <Stack bgColor="whiteAlpha.100" boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <HStack align="end" pt={4}>
          <ToggleTheme />
          <BalanceList />
          <ConnectButton />
        </HStack>
      </Stack>
    </Center>
  );
};

export default HomePage;
