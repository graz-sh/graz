import {
  Button,
  ButtonGroup,
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

  const { isConnected, isConnecting, isReconnecting } = useAccount({
    chainId: "cosmoshub-4",
    onConnect: ({ account, chainId }) => {
      toast({
        status: "success",
        title: `Wallet connected! to ${chainId}`,
        description: `Connected as ${account?.name}`,
      });
    },
    onDisconnect: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

  const { connect } = useConnect({
    onSuccess: () => console.log("wallet connected"),
  });

  const { disconnect } = useDisconnect({
    onSuccess: () => console.log("wallet disconnected"),
  });

  const handleConnect = (wallet: WalletType) => {
    connect({ walletType: wallet, chainId: ["cosmoshub-4"] });
    onClose();
  };
  const wallets = getAvailableWallets();
  return (
    <>
      <ButtonGroup alignSelf="end" isAttached variant="outline">
        <Button isLoading={isConnecting || isReconnecting} onClick={() => (isConnected ? disconnect() : onOpen())}>
          {isConnected ? "Disconnect" : "Connect"} Wallet
        </Button>
      </ButtonGroup>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a wallet</ModalHeader>
          <Stack spacing={3} p={4}>
            {wallets.keplr ? <Button onClick={() => handleConnect(WalletType.KEPLR)}>Keplr</Button> : null}
            {wallets.leap ? <Button onClick={() => handleConnect(WalletType.LEAP)}>Leap</Button> : null}
            {wallets.cosmostation ? (
              <Button onClick={() => handleConnect(WalletType.COSMOSTATION)}>Cosmostation</Button>
            ) : null}
            {wallets.vectis ? <Button onClick={() => handleConnect(WalletType.VECTIS)}>Vectis</Button> : null}
            {wallets.walletconnect ? (
              <Button onClick={() => handleConnect(WalletType.WALLETCONNECT)}>WalletConnect</Button>
            ) : null}
            {wallets.wc_keplr_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_KEPLR_MOBILE)}>Keplr Mobile</Button>
            ) : null}
            {wallets.wc_leap_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_LEAP_MOBILE)}>LEAP Mobile</Button>
            ) : null}
            {wallets.wc_cosmostation_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_COSMOSTATION_MOBILE)}>Cosmostation Mobile</Button>
            ) : null}
          </Stack>
        </ModalContent>
      </Modal>
    </>
  );
};
