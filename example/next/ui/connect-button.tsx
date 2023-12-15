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

  const { isConnected, isConnecting, isReconnecting, reconnect } = useAccount({
    chainId: "cosmoshub-4",
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
    connect({ walletType: wallet, chainId: "cosmoshub-4" });
    onClose();
  };
  const wallets = getAvailableWallets();
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
            {wallets.keplr ? <Button onClick={() => handleConnect(WalletType.KEPLR)}>Keplr</Button> : null}
            {wallets.leap ? <Button onClick={() => handleConnect(WalletType.LEAP)}>Leap</Button> : null}
            {wallets.cosmostation ? (
              <Button onClick={() => handleConnect(WalletType.COSMOSTATION)}>Cosmostation</Button>
            ) : null}
            {wallets.vectis ? <Button onClick={() => handleConnect(WalletType.VECTIS)}>Vectis</Button> : null}
            {wallets.xdefi ? <Button onClick={() => handleConnect(WalletType.XDEFI)}>XDefi</Button> : null}
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
            {wallets.station ? <Button onClick={() => handleConnect(WalletType.STATION)}>Station</Button> : null}
            {wallets.metamask_snap_leap ? (
              <Button onClick={() => handleConnect(WalletType.METAMASK_SNAP_LEAP)}>Metamask Snap Leap</Button>
            ) : null}
          </Stack>
        </ModalContent>
      </Modal>
    </>
  );
};
