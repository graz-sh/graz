import { Button, ButtonGroup, IconButton, useToast } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "graz";

export function ConnectButton() {
  const toast = useToast();

  const { isConnected, isConnecting, isReconnecting, reconnect } = useAccount({
    onConnect: ({ account, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Wallet connected!",
          description: `Connected as ${account.name}`,
        });
      }
    },
    onDisconnect: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

  const { connect, isSupported } = useConnect({
    onSuccess: () => console.log("wallet connected"),
  });

  const { disconnect } = useDisconnect({
    onSuccess: () => console.log("wallet disconnected"),
  });

  function handleConnect() {
    return (isConnected ? disconnect : connect)();
  }

  return (
    <ButtonGroup alignSelf="end" isAttached variant="outline">
      <Button isDisabled={!isSupported} isLoading={isConnecting || isReconnecting} onClick={handleConnect}>
        {isConnected ? "Disconnect" : "Connect"} Wallet
      </Button>
      {isConnected && <IconButton aria-label="refresh" icon={<>🔄</>} onClick={reconnect} />}
    </ButtonGroup>
  );
}
