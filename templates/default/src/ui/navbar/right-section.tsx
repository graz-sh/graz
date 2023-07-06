import { HStack } from "@chakra-ui/react";

import { WalletConnectButton } from "../wallet/connect-button";
import { ToggleTheme } from "./toggle-theme";

export const NavbarRightSection = () => {
  return (
    <HStack>
      <WalletConnectButton />
      <ToggleTheme />
    </HStack>
  );
};
