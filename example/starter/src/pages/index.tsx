import { Stack } from "@chakra-ui/react";
import { Card } from "src/ui/card/chain";
import { mainnetChains } from "src/utils/graz";

const HomePage = () => {
  return (
    <Stack spacing={4}>
      {mainnetChains.map((chain) => (
        <Card key={chain.chainId} chain={chain} />
      ))}
    </Stack>
  );
};

export default HomePage;
