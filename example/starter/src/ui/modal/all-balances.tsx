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
} from "@chakra-ui/react";
import type { ChainInfo } from "@graz-sh/types";
import { useAccount, useBalances } from "graz";

export const AllBalancesModal = ({ chain }: { chain: ChainInfo }) => {
  const modal = useDisclosure();
  const { data: account } = useAccount({
    chainId: chain.chainId,
  });
  const { data: balances } = useBalances({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address,
  });
  return (
    <>
      <Button onClick={modal.onOpen} size="xs">
        View all
      </Button>
      <Modal isCentered isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay bgColor="blackAlpha.800" />
        <ModalContent bgColor="baseBg" borderRadius="2xl" py={4}>
          <ModalBody>
            <Stack spacing={4}>
              <Heading fontSize="28px" fontWeight="semibold">
                {chain.chainName} coin balances
              </Heading>
              <Stack>
                {balances?.map((balance) => {
                  return (
                    <HStack key={balance.denom}>
                      <Text fontFamily="mono" fontWeight="bold">
                        {Number(balance.amount)}
                      </Text>
                      <Text fontFamily="mono" fontWeight="semibold" textTransform="uppercase">
                        {balance.denom.length > 5
                          ? `${balance.denom.slice(0, 6)}...${balance.denom.slice(-6)}`
                          : balance.denom}
                      </Text>
                    </HStack>
                  );
                })}
              </Stack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
