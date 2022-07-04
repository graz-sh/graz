import { Button, Stack, Text } from "@chakra-ui/react";
import { defaultChains, useAccount, useConnect, useDisconnect } from "wadesta/src";

export default function HomePage() {
  const account = useAccount();
  const { connect, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return account ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <Stack p={4}>
      <Text>Account: {account ? account.name : "not connected"}</Text>
      <Button isLoading={isLoading} onClick={handleConnect}>
        {account ? "Disconnect" : "Connect"} Wallet
      </Button>
    </Stack>
  );
}
