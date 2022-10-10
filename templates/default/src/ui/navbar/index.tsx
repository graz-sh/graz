import type { StackProps } from "@chakra-ui/react";
import { Container, HStack } from "@chakra-ui/react";
import type { OmitChildren } from "src/utils/react";

import { NavbarLeftSection } from "./left-section";
import { NavbarRightSection } from "./right-section";

export const Navbar = (props: OmitChildren<StackProps>) => {
  return (
    <Container maxWidth="4xl" pt={4} pb={3}>
      <HStack justifyContent="space-between" width="full">
        <NavbarLeftSection />
        <NavbarRightSection />
      </HStack>
    </Container>
  );
};
