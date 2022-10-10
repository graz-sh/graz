import type { ContainerProps } from "@chakra-ui/react";
import { Container, HStack } from "@chakra-ui/react";

import { NavbarLeftSection } from "./left-section";
import { NavbarRightSection } from "./right-section";

export const Navbar = (props: ContainerProps) => {
  return (
    <Container maxWidth="4xl" pt={6} pb={3} {...props}>
      <HStack justifyContent="space-between" width="full">
        <NavbarLeftSection />
        <NavbarRightSection />
      </HStack>
    </Container>
  );
};
