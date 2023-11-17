import { IconButton, useColorMode } from "@chakra-ui/react";
import type { FC } from "react";

export const ToggleTheme: FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton icon={<>{colorMode === "dark" ? "🌑" : "☀️"}</>} onClick={toggleColorMode} aria-label="toggle theme" />
  );
};
