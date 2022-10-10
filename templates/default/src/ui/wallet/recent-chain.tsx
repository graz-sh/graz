import { Button, Text } from "@chakra-ui/react";
import { useRecentChain } from "graz";

export function RecentChain() {
  const { data: recentChain, clear } = useRecentChain();

  if (!recentChain) return null;

  return (
    <Text>
      Recent chain: <b>{recentChain.chainId}</b> (
      <Button colorScheme="blue" onClick={clear} variant="link">
        clear
      </Button>
      )
    </Text>
  );
}
