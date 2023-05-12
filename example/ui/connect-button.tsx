import {
  Button,
  ButtonGroup,
  IconButton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect, WalletType } from "graz";
import type { FC } from "react";

export const ConnectButton: FC = () => {
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();

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

  const handleConnect = (wallet: WalletType) => {
    connect({ walletType: wallet });
    onClose();
  };

  return (
    <>
      <ButtonGroup alignSelf="end" isAttached variant="outline">
        <Button
          isDisabled={!isSupported}
          isLoading={isConnecting || isReconnecting}
          onClick={() => (isConnected ? disconnect() : onOpen())}
        >
          {isConnected ? "Disconnect" : "Connect"} Wallet
        </Button>
        {isConnected ? <IconButton aria-label="refresh" icon={<>🔄</>} onClick={() => void reconnect()} /> : null}
      </ButtonGroup>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a wallet</ModalHeader>
          <Stack spacing={3} p={4}>
            <Button onClick={() => handleConnect(WalletType.KEPLR)}>Keplr</Button>
            <Button onClick={() => handleConnect(WalletType.LEAP)}>Leap</Button>
            <Button onClick={() => handleConnect(WalletType.COSMOSTATION)}>Cosmostation</Button>
          </Stack>
        </ModalContent>
      </Modal>
    </>
  );
};
