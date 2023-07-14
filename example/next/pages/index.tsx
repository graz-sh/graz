import { Center, HStack, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import { BalanceList } from "ui/balance-list";
import { ConnectButton } from "ui/connect-button";
import { ToggleTheme } from "ui/toggle-theme";

const HomePage: NextPage = () => {
  return (
    <Center minH="100vh">
      <Stack bgColor="whiteAlpha.100" boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <Stack>
          <BalanceList />
        </Stack>
        <HStack align="end" justifyContent="space-between" pt={4}>
          <ToggleTheme />
          <ConnectButton />
        </HStack>
      </Stack>
    </Center>
  );
};

export default HomePage;
