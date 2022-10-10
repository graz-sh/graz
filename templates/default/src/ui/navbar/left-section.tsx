import { Button, HStack } from "@chakra-ui/react";

export const NavbarLeftSection = () => {
  return (
    <HStack>
      <Button as="a" href="/">
        Home
      </Button>
      <Button as="a" href="/assets">
        Assets
      </Button>
      <Button as="a" href="/send-token">
        Send Tokens
      </Button>
    </HStack>
  );
};
