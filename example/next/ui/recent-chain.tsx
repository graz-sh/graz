import { Button, Text } from "@chakra-ui/react";
import { useRecentChain } from "graz";
import type { FC } from "react";

export const RecentChain: FC = () => {
  const { data: recentChain, clear } = useRecentChain();

  if (!recentChain) return null;

  return (
    <Text>
      Recent chain: <b>{recentChain}</b> (
      <Button colorScheme="blue" onClick={clear} variant="link">
        clear
      </Button>
      )
    </Text>
  );
};
