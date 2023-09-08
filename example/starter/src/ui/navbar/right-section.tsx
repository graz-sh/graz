import { HStack } from "@chakra-ui/react";

import { ToggleTheme } from "../core/toggle-theme";
import { WalletConnectButton } from "../wallet/connect-button";

export const NavbarRightSection = () => {
  return (
    <HStack>
      <WalletConnectButton />
      <ToggleTheme />
    </HStack>
  );
};
