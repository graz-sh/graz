"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, Coins, Send, FileCode, Network, Link2, Code2, BookOpen, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Account", href: "/account", icon: User },
  { name: "Balances", href: "/balances", icon: Coins },
  { name: "Send Tokens", href: "/send-tokens", icon: Send },
  { name: "Contracts", href: "/contracts", icon: FileCode },
  { name: "Chains", href: "/chains", icon: Network },
  { name: "Signing Clients", href: "/clients", icon: Link2 },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left">Graz Playground</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/graz-sh/graz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Code2 className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://graz.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Docs</span>
            </a>
            <a
              href="https://twitter.com/graz_sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Twitter</span>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">Built with Graz, Next.js, and shadcn/ui</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
