import { Button, Stack, Text, useToast } from "@chakra-ui/react";
import { defaultChains, useAccount, useConnect, useDisconnect } from "wadesta/src";

export default function HomePage() {
  const toast = useToast();

  const { data: account, isConnected, isConnecting, isReconnecting, status } = useAccount();

  const { connect } = useConnect({
    onSuccess: (_account) => {
      toast({
        status: "success",
        title: "Wallet connected!",
        description: `Connected as ${_account.name}`,
      });
    },
  });

  const { disconnect } = useDisconnect({
    onSuccess: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

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
