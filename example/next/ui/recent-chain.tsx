import { Button, Text } from "@chakra-ui/react";
import { useRecentChainIds } from "graz";
import type { FC } from "react";

export const RecentChain: FC = () => {
  const { data: recentChains, clear } = useRecentChainIds();

  if (!recentChains) return null;

  return (
    <Text>
      Recent chain: <b>{recentChains.join("; ")}</b> (
      <Button colorScheme="blue" onClick={clear} variant="link">
        clear
      </Button>
      )
    </Text>
  );
};
