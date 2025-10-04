import { Button, ButtonGroup } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";

export const PageNavigation = () => {
  const router = useRouter();

  return (
    <ButtonGroup size="sm" variant="outline" spacing={2}>
      <Button
        as={NextLink}
        href="/"
        colorScheme={router.pathname === "/" ? "green" : "gray"}
        variant={router.pathname === "/" ? "solid" : "outline"}
      >
        Home
      </Button>
      <Button
        as={NextLink}
        href="/assets"
        colorScheme={router.pathname === "/assets" ? "green" : "gray"}
        variant={router.pathname === "/assets" ? "solid" : "outline"}
      >
        Assets
      </Button>
      <Button
        as={NextLink}
        href="/send-token"
        colorScheme={router.pathname === "/send-token" ? "green" : "gray"}
        variant={router.pathname === "/send-token" ? "solid" : "outline"}
      >
        Send Token
      </Button>
    </ButtonGroup>
  );
};
