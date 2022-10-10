import { Popover, PopoverContent, PopoverTrigger } from "@chakra-ui/react";

import { WalletConnectedButton } from "./connected-button";
import { WalletPopoverBody } from "./popover-body";

export function WalletPopover() {
  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <WalletConnectedButton />
      </PopoverTrigger>
      <PopoverContent>
        <WalletPopoverBody />
      </PopoverContent>
    </Popover>
  );
}
