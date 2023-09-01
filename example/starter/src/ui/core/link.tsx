import type { LinkProps } from "@chakra-ui/react";
import { Link as CLink } from "@chakra-ui/react";
import NextLink from "next/link";
import type { FC, ReactNode } from "react";

export const Link: FC<LinkProps & { children: ReactNode }> = ({ children, ...rest }) => {
  return (
    <CLink as={NextLink} {...rest}>
      {children}
    </CLink>
  );
};
