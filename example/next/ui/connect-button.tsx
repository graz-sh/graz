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
import { getAvailableWallets, useAccount, useConnect, useDisconnect, WalletType } from "graz";
import type { FC } from "react";

export const ConnectButton: FC = () => {
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();

  // NEW API: chainId must be an array
  const { isConnected, isConnecting, isReconnecting, reconnect } = useAccount({
    chainId: ["cosmoshub-4"],  // Changed to array format
    onConnect: ({ walletType, chains }) => {
      toast({
        status: "success",
        title: `Wallet connected! using ${walletType} to ${chains.map((item) => item.chainId)}`,
      });
    },
    onDisconnect: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

  const { connect } = useConnect();

  const { disconnect } = useDisconnect({
    onSuccess: () => console.log("wallet disconnected"),
  });

  const handleConnect = (wallet: WalletType) => {
    connect({ walletType: wallet, chainId: ["cosmoshub-4"] });
    onClose();
  };

  const availableWallets = getAvailableWallets();
  const wallets = Object.entries(availableWallets)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => ({
      walletType: walletType as WalletType,
      name: walletType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));

  const paraWallet = wallets.find((wallet) => wallet.walletType === WalletType.PARA);
  const otherWallets = wallets.filter((wallet) => wallet.walletType !== WalletType.PARA);
  return (
    <>
      <ButtonGroup alignSelf="end" isAttached variant="outline">
        <Button isLoading={isConnecting || isReconnecting} onClick={() => (isConnected ? disconnect() : onOpen())}>
          {isConnected ? "Disconnect" : "Connect"} Wallet
        </Button>
        {isConnected ? <IconButton aria-label="refresh" icon={<>🔄</>} onClick={() => void reconnect()} /> : null}
      </ButtonGroup>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a wallet</ModalHeader>
          <Stack p={4} spacing={3}>
            {paraWallet && (
              <>
                <Stack spacing={2}>
                  <strong>Social Login</strong>
                  <Button
                    onClick={() => handleConnect(paraWallet.walletType)}
                    colorScheme="blue"
                    width="100%"
                  >
                    Connect with {paraWallet.name}
                  </Button>
                </Stack>
              </>
            )}

            {otherWallets.length > 0 && (
              <>
                {paraWallet && <hr style={{ margin: "16px 0" }} />}
                <Stack spacing={2}>
                  <strong>Other Wallets</strong>
                  {otherWallets.map((wallet) => (
                    <Button
                      key={wallet.walletType}
                      onClick={() => handleConnect(wallet.walletType)}
                      width="100%"
                    >
                      Connect with {wallet.name}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </ModalContent>
      </Modal>
    </>
  );
};
