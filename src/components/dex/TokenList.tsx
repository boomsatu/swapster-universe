
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOKENS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, ChevronDown } from "lucide-react";

interface TokenListProps {
  onSelect: (token: typeof TOKENS[0]) => void;
  selectedToken?: typeof TOKENS[0];
  otherToken?: typeof TOKENS[0]; // To prevent selecting the same token
}

export function TokenList({ onSelect, selectedToken, otherToken }: TokenListProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTokens, setFilteredTokens] = useState(TOKENS);

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = TOKENS.filter(
        (token) =>
          token.symbol.toLowerCase().includes(lowercaseQuery) ||
          token.name.toLowerCase().includes(lowercaseQuery) ||
          token.address.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(TOKENS);
    }
  }, [searchQuery]);

  const handleSelect = (token: typeof TOKENS[0]) => {
    onSelect(token);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 px-3 justify-between w-full hover:bg-muted transition-colors"
        >
          {selectedToken ? (
            <div className="flex items-center gap-2">
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium">{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select Token</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Search for a token by name, symbol, or address
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-2 mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <div className="space-y-1 h-80 overflow-y-auto pr-1">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const isSelected = selectedToken?.address === token.address;
              const isDisabled = otherToken?.address === token.address;
              
              return (
                <Button
                  key={token.address}
                  variant="ghost"
                  className={`w-full justify-start h-14 ${
                    isSelected
                      ? "bg-primary/10 hover:bg-primary/20"
                      : isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => !isDisabled && handleSelect(token)}
                  disabled={isDisabled}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {token.name}
                      </span>
                    </div>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              No tokens found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
