import { Button } from "@chakra-ui/react";
import type { FC } from "react";

export interface ConnectButtonProps {
  TODO: unknown;
}

export const ConnectButton: FC<ConnectButtonProps> = (props) => {
  return <Button>Connect</Button>;
};
