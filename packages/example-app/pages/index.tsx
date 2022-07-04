import { Button, Stack, Text } from "@chakra-ui/react";
import { defaultChains, useAccount, useConnect, useDisconnect } from "wadesta/src";

export default function HomePage() {
  const { data: account, isConnected, isConnecting, isReconnecting, status } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return isConnected ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <Stack p={4}>
      <Text>Account: {account ? account.name : status}</Text>
      <Button isLoading={isConnecting || isReconnecting} onClick={handleConnect}>
        {account ? "Disconnect" : "Connect"} Wallet
      </Button>
    </Stack>
  );
}
