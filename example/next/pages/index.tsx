import { Center, HStack, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import { ToggleTheme } from "ui/toggle-theme";

const HomePage: NextPage = () => {
  return (
    <Center minH="100vh">
      <Stack bgColor="whiteAlpha.100" boxShadow="md" maxW="md" p={4} rounded="md" spacing={4} w="full">
        <HStack align="end" pt={4}>
          <ToggleTheme />
        </HStack>
      </Stack>
    </Center>
  );
};

export default HomePage;
