import { Button, Stack, Text } from "@chakra-ui/react";
import { chain, useAccount, useConnect, useDisconnect } from "wadesta";

export default function HomePage() {
  const account = useAccount();
  const { connect, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return account ? disconnect(undefined) : connect(chain.cosmoshub);
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
