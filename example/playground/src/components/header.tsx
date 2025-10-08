"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectButton } from "@/components/connect-button";
import { ConnectStatus } from "@/components/connect-status";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle} aria-label="Toggle menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
        <div className="hidden sm:block">
          <ConnectStatus />
        </div>
        <h1 className="lg:hidden text-lg font-bold truncate">Graz</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
