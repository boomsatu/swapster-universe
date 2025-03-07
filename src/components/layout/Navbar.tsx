
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useWallet } from "@/hooks/useWallet";
import { Menu, X, Wallet, ChevronDown, ExternalLink, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  const navItems = [
    { name: "Swap", path: "/swap" },
    { name: "Pool", path: "/pool" },
    { name: "Charts", path: "/charts" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-card py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-2xl transition-opacity hover:opacity-80"
          >
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded">DEX</span>
            <span>Exchange</span>
          </Link>
          
          <nav className="hidden md:flex ml-10">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {wallet.isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center overflow-hidden">
                  <span className="mr-2">{formatAddress(wallet.address || "")}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  Connected to {wallet.chainId === 1 ? "Ethereum" : "Network " + wallet.chainId}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href={`https://etherscan.io/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center cursor-pointer"
                  >
                    View on Explorer <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={disconnectWallet}
                  className="flex items-center text-destructive cursor-pointer"
                >
                  Disconnect <LogOut className="h-4 w-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={wallet.isConnecting}
              className="flex items-center"
            >
              {wallet.isConnecting ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-2xl font-medium ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="mt-8"
              onClick={() => setIsMenuOpen(false)}
            >
              Close Menu
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
