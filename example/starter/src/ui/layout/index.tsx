import { Box, Button, Center, Heading, HStack, keyframes, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useAccount, useDisconnect } from "graz";
import Head from "next/head";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { ToggleTheme } from "../core/toggle-theme";
import { ConnectAllChainsWallet } from "../modal/connect-wallet";

const glowAnimation = keyframes`100% {
    box-shadow: 0 0 3px #dff8e3, 0 0 10px #dff8e3, 0 0 20px #dff8e3, 0 0 40px #b7fcc2,
      0 0 70px #b7fcc2, 0 0 80px #b7fcc2;
  }`;

export const Layout = ({ children }: { children: ReactNode }) => {
  const toast = useToast();
  const { isConnected } = useAccount({
    multiChain: true,
  });
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      toast({
        description: `Successfully disconnected from all chains`,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
    },
  });
  return (
    <Box>
      <Head>
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <Stack alignItems="center" my={20} spacing={16}>
        <Stack
          bgColor="whiteAlpha.100"
          borderRadius={12}
          justifyContent="space-between"
          minH="200px"
          mx={2}
          p={8}
          px={6}
          spacing={4}
          sx={{
            boxShadow: `0 0 2px #dff8e3, 0 0 10px #dff8e3, 0 0 20px #b7fcc2, 0 0 30px #b7fcc2,
    0 0 40px #b7fcc2, 0 0 50px #b7fcc2`,
            animation: `${glowAnimation} 3s infinite linear alternate`,
          }}
          w="container.md"
        >
          <HStack alignItems="start" justifyContent="space-between">
            <Stack spacing={1}>
              <Heading size="lg">Graz Playground</Heading>
              <Text fontWeight="semibold">Everything you need to start working with the Cosmos ecosystem.</Text>
            </Stack>
            <ToggleTheme />
          </HStack>
          {children}

          <HStack justifyContent="end">
            {isConnected ? (
              <Button colorScheme="red" onClick={() => disconnect()} size="sm" variant="outline">
                Disconnect all
              </Button>
            ) : (
              <ConnectAllChainsWallet />
            )}
          </HStack>
        </Stack>
        <Center bottom={0}>
          <HStack divider={<Text>•</Text>} gap={4} wrap="wrap">
            <Link as={NextLink} href="https://graz.sh" isExternal>
              Documentation
            </Link>
            <Link as={NextLink} href="https://github.com/graz-sh/graz" isExternal>
              Graz Github Repo
            </Link>
            <Link as={NextLink} href="https://github.com/graz-sh/graz/tree/dev/example/starter" isExternal>
              This Code
            </Link>
            <Link as={NextLink} href="https://twitter.com/graz_sh" isExternal>
              Twitter
            </Link>
            <Link as={NextLink} href="https://discord.gg/2RkzXyjxgt" isExternal>
              Discord
            </Link>
          </HStack>
        </Center>
      </Stack>
    </Box>
  );
};
