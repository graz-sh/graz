import {
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  modalHeader: string;
}

export const Modal = ({ isOpen, onClose, children, modalHeader }: ModalProps) => {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent pb="4">
        <ModalCloseButton />
        <ModalHeader fontWeight="bold">{modalHeader}</ModalHeader>
        <ModalBody pt="2">{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  );
};
