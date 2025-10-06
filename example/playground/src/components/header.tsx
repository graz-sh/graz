"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectButton } from "@/components/connect-button";
import { ConnectStatus } from "@/components/connect-status";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex flex-1 items-center gap-4">
        <ConnectStatus />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
