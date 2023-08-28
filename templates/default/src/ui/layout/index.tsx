import { Box, Center, Container, Divider, Heading, Stack, Text } from "@chakra-ui/react";
import { useAccount } from "graz";
import Head from "next/head";
import type { ReactNode } from "react";

import { Navbar } from "../navbar";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isConnecting, isReconnecting, isConnected } = useAccount();

  return (
    <Box>
      <Head>
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>
      <Stack>
        <Navbar />
        <Divider />
        <Center>
          <Container maxW="4xl" mx="auto" pt={4}>
            {isConnecting || isReconnecting ? <Text>Connecting...</Text> : null}
            {!isConnected && !(isConnecting || isReconnecting) ? (
              <Box>
                <Heading>Welcome to Graz Example</Heading>
                <Text>Connect your wallet to interact within the app.</Text>
              </Box>
            ) : (
              children
            )}
          </Container>
        </Center>
      </Stack>
    </Box>
  );
};
