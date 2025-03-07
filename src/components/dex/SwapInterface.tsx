
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenList } from "./TokenList";
import { TOKENS, DEFAULT_SLIPPAGE } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/components/ui/sonner";
import { ArrowDownUp, Settings, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Slider
} from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SwapInterface() {
  const { wallet } = useWallet();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      // Mocked price calculation (1:2 ratio for demonstration)
      if (value) {
        const calculatedToAmount = Number(value) * 2;
        setToAmount(calculatedToAmount.toString());
      } else {
        setToAmount("");
      }
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value);
      // Mocked price calculation (1:2 ratio for demonstration)
      if (value) {
        const calculatedFromAmount = Number(value) / 2;
        setFromAmount(calculatedFromAmount.toString());
      } else {
        setFromAmount("");
      }
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!fromAmount || !toAmount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      setIsSwapping(true);
      // Simulate API call/blockchain interaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
      // Reset form after successful swap
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error("Swap error:", error);
      toast.error("Failed to execute swap");
    } finally {
      setIsSwapping(false);
    }
  };

  const insufficientLiquidity = false; // Mock check
  const priceImpact = "0.05%"; // Mock price impact

  return (
    <Card className="glass-card w-full max-w-md mx-auto overflow-hidden animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Swap</CardTitle>
        <CardDescription>Exchange tokens at the best rates</CardDescription>
        <div className="absolute right-4 top-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Transaction Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="slippage" className="text-sm flex items-center space-x-1">
                      <span>Slippage Tolerance</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">
                              Your transaction will revert if the price changes unfavorably by more than this percentage.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <span className="font-medium text-sm">{slippage}%</span>
                  </div>
                  <Slider
                    id="slippage"
                    min={0.1}
                    max={5}
                    step={0.1}
                    defaultValue={[slippage]}
                    onValueChange={(value) => setSlippage(value[0])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <label htmlFor="from-amount">From</label>
            {fromToken && wallet.isConnected && (
              <span className="text-muted-foreground">
                Balance: <span className="font-medium">0.00</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="from-amount"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleFromAmountChange}
                className="h-12 pl-3 pr-16 text-lg font-medium"
              />
              <Button
                variant="ghost"
                className="absolute right-1 top-1 h-10 px-2 font-medium text-xs"
                onClick={() => setFromAmount("0.0")} // Ideally set to max balance
              >
                MAX
              </Button>
            </div>
            <TokenList
              onSelect={setFromToken}
              selectedToken={fromToken}
              otherToken={toToken}
            />
          </div>
        </div>

        <div className="flex justify-center my-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="h-8 w-8 rounded-full rotate-90 bg-muted hover:bg-muted/80 transition-all hover:rotate-[270deg]"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <label htmlFor="to-amount">To</label>
            {toToken && wallet.isConnected && (
              <span className="text-muted-foreground">
                Balance: <span className="font-medium">0.00</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="to-amount"
              placeholder="0.0"
              value={toAmount}
              onChange={handleToAmountChange}
              className="h-12 text-lg font-medium"
            />
            <TokenList
              onSelect={setToToken}
              selectedToken={toToken}
              otherToken={fromToken}
            />
          </div>
        </div>

        {fromAmount && toAmount && (
          <div className="text-sm rounded-md bg-muted p-2.5 text-muted-foreground">
            <div className="flex justify-between mb-1">
              <span>Rate</span>
              <span className="font-medium">
                1 {fromToken.symbol} = {2} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span className="font-medium text-green-500">{priceImpact}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!wallet.isConnected ? (
          <Button className="w-full h-12" disabled>
            Connect Wallet to Swap
          </Button>
        ) : insufficientLiquidity ? (
          <Button className="w-full h-12" disabled>
            Insufficient Liquidity
          </Button>
        ) : !fromAmount || !toAmount ? (
          <Button className="w-full h-12" disabled>
            Enter an amount
          </Button>
        ) : (
          <Button
            className="w-full h-12 font-semibold text-base"
            onClick={handleSwap}
            disabled={isSwapping}
          >
            {isSwapping ? "Swapping..." : "Swap"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
