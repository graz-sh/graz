import {
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import type { ChainInfo } from "@graz-sh/types";
import { checkWallet, useAccount } from "graz";
import { useConnect, type WalletType } from "graz";
import { listedWallets, mainnetChains } from "src/utils/graz";

const WalletModal = ({
  modal,
  onClick,
}: {
  modal: ReturnType<typeof useDisclosure>;
  onClick: (walletType: WalletType) => void;
}) => {
  return (
    <Modal isCentered isOpen={modal.isOpen} onClose={modal.onClose} size="xs">
      <ModalOverlay bgColor="blackAlpha.800" />
      <ModalContent bgColor="baseBg" borderRadius="2xl" py={4}>
        <ModalBody>
          <Stack spacing={4}>
            <Heading fontSize="28px" fontWeight="semibold" textAlign="center">
              Choose wallet
            </Heading>
            <Stack>
              {Object.entries(listedWallets)
                .filter(([key, wallet]) => checkWallet(key as WalletType))
                .map(([key, wallet]) => (
                  <HStack
                    key={wallet.name}
                    _hover={{
                      bgColor: "whiteAlpha.400",
                    }}
                    as="button"
                    bgColor="whiteAlpha.200"
                    borderRadius={12}
                    flex={1}
                    onClick={() => {
                      modal.onClose();
                      onClick(key as WalletType);
                    }}
                    p={4}
                    spacing={4}
                  >
                    {/* <Image alt={wallet.name} boxSize="40px" src={wallet.imgSrc} /> */}
                    <Text fontWeight="bold">{wallet.name}</Text>
                  </HStack>
                ))}
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const ConnectAllChainsWallet = () => {
  const toast = useToast();
  const modal = useDisclosure();
  const { connect } = useConnect({
    onSuccess: (args) => {
      toast({
        description: `Successfully connected to ${args.chains.map((chain) => chain.chainName).join("; ")}`,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
    },
    onError: (error) => {
      toast({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: error?.message || "Error connecting to wallet",
        duration: 3000,
        isClosable: true,
        status: "error",
      });
    },
  });
  return (
    <>
      <Button
        colorScheme="green"
        onClick={() => {
          modal.onOpen();
        }}
        size="sm"
      >
        Connect all
      </Button>
      <WalletModal
        modal={modal}
        onClick={(wallet) => {
          connect({
            chainId: mainnetChains.map((item) => item.chainId),
            walletType: wallet,
          });
        }}
      />
    </>
  );
};

export const ConnectWalletModal = ({ chain }: { chain: ChainInfo }) => {
  const toast = useToast();
  const modal = useDisclosure();
  const { connect } = useConnect({
    onSuccess: () => {
      toast({
        description: `Successfully connected to ${chain.chainName}`,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
    },
    onError: (error) => {
      toast({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: error?.message || "Error connecting to wallet",
        duration: 3000,
        isClosable: true,
        status: "error",
      });
    },
  });
  const { walletType } = useAccount();
  return (
    <>
      <Button
        colorScheme="green"
        onClick={() => {
          walletType ? connect({ chainId: chain.chainId, walletType }) : modal.onOpen();
        }}
        size="sm"
      >
        Connect
      </Button>
      <WalletModal
        modal={modal}
        onClick={(wallet) => {
          connect({
            chainId: chain.chainId,
            walletType: wallet,
          });
        }}
      />
    </>
  );
};
