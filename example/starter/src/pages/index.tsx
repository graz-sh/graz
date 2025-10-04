import { Heading, HStack, Stack } from "@chakra-ui/react";
import { Card } from "src/ui/card/chain";
import { PageNavigation } from "src/ui/core/page-navigation";
import { mainnetChains } from "src/utils/graz";

const HomePage = () => {
  return (
    <Stack spacing={6} w="full">
      <HStack justifyContent="space-between">
        <Heading size="md">Connected Chains</Heading>
        <PageNavigation />
      </HStack>
      <Stack spacing={4}>
        {mainnetChains.map((chain) => (
          <Card key={chain.chainId} chain={chain} />
        ))}
      </Stack>
    </Stack>
  );
};

export default HomePage;
