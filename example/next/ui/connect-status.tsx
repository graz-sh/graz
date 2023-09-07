import { Box, Spinner, Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import { useAccount, useActiveChainIds } from "graz";
import type { FC } from "react";

export const ConnectStatus: FC = () => {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const activeChains = useActiveChainIds();

  return (
    <Tag>
      {isConnecting || isReconnecting ? (
        <Spinner size="xs" />
      ) : (
        <>
          <TagLeftIcon as={Box} bgColor={isConnected ? "green.500" : "red.500"} boxSize={3} rounded="full" />
          <TagLabel>
            {isConnected && activeChains ? `Connected to ${activeChains.join("; ")}` : "Disconnected"}
          </TagLabel>
        </>
      )}
    </Tag>
  );
};
