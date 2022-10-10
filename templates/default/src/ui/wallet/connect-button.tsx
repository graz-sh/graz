import { Button, Stack, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { mainnetChains, useAccount, useConnect, useDisconnect, WalletType } from "graz";

import { Modal } from "../core/modal";

export const WalletConnectButton = () => {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected, isConnecting } = useAccount({
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

  const { connect } = useConnect();

  const { disconnect } = useDisconnect();

  function handleConnect(wallet: WalletType) {
    return connect({ ...mainnetChains.cosmoshub, walletType: wallet });
  }

  return (
    <>
      {!isConnected ? (
        <Button onClick={onOpen}>Connect Wallet</Button>
      ) : (
        <Tooltip label="Disconnect" placement="bottom">
          <Button variant="outline" onClick={() => disconnect()} isLoading={isConnecting}>
            Connected
          </Button>
        </Tooltip>
      )}

      {!isConnected && (
        <Modal isOpen={isOpen} onClose={onClose} modalHeader="Select a wallet">
          <Stack spacing={3}>
            <Button onClick={() => handleConnect(WalletType.KEPLR)}>Keplr</Button>
            <Button onClick={() => handleConnect(WalletType.LEAP)}>Leap</Button>
          </Stack>
        </Modal>
      )}
    </>
  );
};
