import { HStack, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const NavbarLeftSection = () => {
  const router = useRouter();
  return (
    <HStack fontSize="lg" gap={4}>
      <Link fontWeight={router.pathname === "/" ? "bold" : "normal"} href="/">
        Home
      </Link>
      <Link fontWeight={router.pathname === "/assets" ? "bold" : "normal"} href="/assets">
        Assets
      </Link>
      <Link fontWeight={router.pathname === "/send-token" ? "bold" : "normal"} href="/send-token">
        Send Tokens
      </Link>
      <Link fontWeight={router.pathname === "/validators" ? "bold" : "normal"} href="/validators">
        Validators
      </Link>
    </HStack>
  );
};
