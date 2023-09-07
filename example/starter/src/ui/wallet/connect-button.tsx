import { Button, Stack, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { getAvailableWallets, mainnetChains, useAccount, useConnect, useDisconnect, WalletType } from "graz";

import { Modal } from "../core/modal";

export const WalletConnectButton = () => {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected, isConnecting, status } = useAccount({
    onConnect: ({ chains, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Switched chain!",
          description: `Connected as ${Object.values(chains)
            .map((c) => c.chainId)
            .join("; ")}`,
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
  console.log(status, isConnected);

  const { connect } = useConnect();

  const { disconnect } = useDisconnect();

  const handleConnect = (wallet: WalletType) => {
    onClose();
    return connect({ chainId: mainnetChains.cosmoshub.chainId, walletType: wallet });
  };

  const wallets = getAvailableWallets();

  return (
    <>
      {!isConnected ? (
        <Button onClick={onOpen} isLoading={isConnecting}>
          Connect Wallet
        </Button>
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
            {wallets.metamask_snap_leap ? (
              <Button onClick={() => handleConnect(WalletType.METAMASK_SNAP_LEAP)}>Metamask Snap Leap</Button>
            ) : null}
          </Stack>
        </Modal>
      )}
    </>
  );
};
