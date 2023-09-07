import { Button, Text } from "@chakra-ui/react";
import { useRecentChainIds } from "graz";

export const RecentChain = () => {
  const { data: recentChainIds, clear } = useRecentChainIds();

  if (!recentChainIds) return null;

  return (
    <Text>
      Recent chain: <b>{recentChainIds?.join("; ")}</b> (
      <Button colorScheme="blue" onClick={clear} variant="link">
        clear
      </Button>
      )
    </Text>
  );
};
