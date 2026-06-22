"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAccount, useActiveChains, useConnect } from "graz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Network,
  Code2,
  Sparkles,
  DollarSign,
  User,
  ExternalLink,
  BookOpen,
  Zap,
  Shield,
  Package,
  Heart,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { chainIds } from "@/utils/graz";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

export default function HomePage() {
  const { isConnected, data: accounts } = useAccount();
  const activeChains = useActiveChains();
  const { connect } = useConnect();

  const features = [
    {
      icon: User,
      title: "Wallets",
      description: "Explore wallet detection, connection, and management",
      href: "/wallets",
    },
    {
      icon: Wallet,
      title: "Account",
      description: "View connected accounts and manage wallet connections",
      href: "/account",
    },
    {
      icon: Network,
      title: "Chains",
      description: "Connect and interact with multiple Cosmos chains",
      href: "/chains",
    },
    {
      icon: DollarSign,
      title: "Balances",
      description: "Check token balances and staked amounts across chains",
      href: "/balances",
    },
    {
      icon: Code2,
      title: "Contracts",
      description: "Query and execute CosmWasm smart contracts",
      href: "/contracts",
    },
    {
      icon: Sparkles,
      title: "Transfers",
      description: "Send tokens and initiate IBC transfers",
      href: "/transfers",
    },
  ];

  const whyGraz = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized bundle size (~50KB gzipped) with tree-shaking support",
    },
    {
      icon: Shield,
      title: "Type Safe",
      description: "Built with TypeScript for excellent IntelliSense and type safety",
    },
    {
      icon: Package,
      title: "Zero Config",
      description: "Works out of the box with sensible defaults and easy customization",
    },
    {
      icon: Heart,
      title: "Developer First",
      description: "Simple, intuitive API with comprehensive documentation",
    },
  ];

  const projects = [
    {
      name: "dYdX",
      description: "Decentralized derivatives exchange",
      url: "https://dydx.trade",
      logo: "⚡",
    },
    {
      name: "Stargaze",
      description: "NFT marketplace and platform",
      url: "https://stargaze.zone",
      logo: "⭐",
    },
    {
      name: "Skip",
      description: "Cross-chain infrastructure for Cosmos",
      url: "https://go.skip.build",
      logo: "⏩",
    },
  ];

  const accountCount = accounts ? Object.keys(accounts).length : 0;
  const chainCount = activeChains?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 md:space-y-6 py-6 md:py-12 max-w-4xl">
          <div className="space-y-2 md:space-y-3">
            <Badge variant="secondary" className="text-xs px-2 md:px-3 py-1 w-fit">
              ~50KB gzipped • Tree-shakeable
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Build Cosmos dApps
              <br />
              <span className="text-primary">with React Hooks</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
              The most powerful and developer-friendly library for integrating Cosmos wallets and chains into your React
              applications
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 pt-2 md:pt-4">
            {!isConnected ? (
              <>
                <Button size="lg" onClick={() => connect({ chainId: chainIds })} className="gap-2 text-base px-8">
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/wallets">
                  <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                    <User className="h-5 w-5" />
                    Explore Wallets
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/balances">
                  <Button size="lg" className="gap-2 text-base px-8">
                    <DollarSign className="h-5 w-5" />
                    View Balances
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/chains">
                  <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                    <Network className="h-5 w-5" />
                    Manage Chains
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 md:pt-4 text-xs sm:text-sm">
            <a
              href="https://github.com/graz-sh/graz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Code2 className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://graz.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </a>
            <a
              href="https://www.npmjs.com/package/graz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package className="h-4 w-4" />
              npm Package
            </a>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Connected Chains</CardDescription>
                <CardTitle className="text-3xl">{chainCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {activeChains?.slice(0, 3).map((chain) => (
                    <Badge key={chain.chainId} variant="outline" className="text-xs">
                      {chain.chainName}
                    </Badge>
                  ))}
                  {chainCount > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{chainCount - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Accounts</CardDescription>
                <CardTitle className="text-3xl">{accountCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Multi-chain account management active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Wallet Status</CardDescription>
                <CardTitle className="text-xl text-green-600">Connected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Ready to interact with Cosmos chains</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Why Developers Love Graz */}
        <div>
          <div className="mb-4 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Developers Love Graz</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Built for speed, developer experience, and production readiness
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyGraz.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="p-3 rounded-full bg-primary/10 w-fit mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-2">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Explore Features</h2>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Start Code */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with Graz in your React application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">1. Install Graz</p>
              <CodeBlock code={`npm install graz`} language="bash" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">2. Set up the provider</p>
              <CodeBlock
                language="tsx"
                code={`import { GrazProvider } from "graz";

<GrazProvider
  grazOptions={{
    chains: [cosmoshubChainInfo, osmosisChainInfo],
  }}
>
  <App />
</GrazProvider>`}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">3. Use hooks in your components</p>
              <CodeBlock
                language="typescript"
                code={`import { useAccount, useConnect, useBalance } from "graz";

const { connect } = useConnect();
const { data: accounts } = useAccount();
const account = accounts?.["cosmoshub-4"];

const { data: balance } = useBalance({
  chainId: "cosmoshub-4",
  bech32Address: account?.bech32Address || "",
  denom: "uatom"
});`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects Using Graz */}
        <div>
          <div className="mb-4 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Powering Leading Cosmos Projects</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Trusted by top teams building in the Cosmos ecosystem
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="hover:shadow-lg transition-all hover:scale-[1.02] h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{project.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <CardDescription className="text-xs mt-1">{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">20+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">React Hooks</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">~50KB</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Bundle Size (gzipped)</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">13+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Wallet Integrations</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">TypeScript Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
