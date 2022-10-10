import { Box, Center, Container, Divider, Stack } from "@chakra-ui/react";
import Head from "next/head";
import type { ReactNode } from "react";

import { Navbar } from "../navbar";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Box>
      <Head>
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>
      <Stack>
        <Navbar insetX={0} pos="sticky" top={0} zIndex="docked" />
        <Divider />
        <Center>
          <Container maxW="4xl" mx="auto" pt={4}>
            {children}
          </Container>
        </Center>
      </Stack>
    </Box>
  );
};
