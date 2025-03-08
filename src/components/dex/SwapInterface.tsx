import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenList } from "./TokenList";
import { TOKENS, DEFAULT_SLIPPAGE } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { toast } from "sonner";
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
  const [needsApproval, setNeedsApproval] = useState(false);
  
  const { 
    prepareSwap, 
    prepareApproveToken, 
    useGetReserves, 
    useGetTokenBalance 
  } = useContractInteraction();
  
  const { 
    data: reserves 
  } = useGetReserves(
    fromToken?.address, 
    toToken?.address
  );
  
  const { data: fromTokenBalance } = useGetTokenBalance(
    fromToken?.address, 
    wallet.address || '0x'
  );
  
  const { data: toTokenBalance } = useGetTokenBalance(
    toToken?.address, 
    wallet.address || '0x'
  );
  
  const amountOutMin = parseFloat(toAmount) * (1 - slippage / 100);
  const { 
    swap, 
    isSuccess: swapSuccess, 
    isLoading: swapLoading, 
    isError: swapError,
    error: swapErrorDetails 
  } = prepareSwap(
    fromToken?.address,
    toToken?.address,
    fromAmount,
    amountOutMin.toString(),
    wallet.address || '0x'
  );
  
  const { 
    approveToken, 
    isSuccess: approvalSuccess, 
    isLoading: approvalLoading 
  } = prepareApproveToken(
    fromToken?.address,
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    fromAmount
  );
  
  useEffect(() => {
    if (approvalSuccess && needsApproval) {
      setNeedsApproval(false);
      toast.success("Token approved successfully!");
      
      if (swap) {
        swap();
      }
    }
  }, [approvalSuccess, needsApproval, swap]);
  
  useEffect(() => {
    if (swapSuccess) {
      toast.success(`Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
      setFromAmount("");
      setToAmount("");
      setIsSwapping(false);
    }
  }, [swapSuccess, fromAmount, toAmount, fromToken.symbol, toToken.symbol]);
  
  useEffect(() => {
    if (swapError && swapErrorDetails) {
      console.error("Swap error:", swapErrorDetails);
      toast.error("Failed to execute swap: " + swapErrorDetails.message);
      setIsSwapping(false);
    }
  }, [swapError, swapErrorDetails]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      
      if (value && reserves && value !== "0" && value !== ".") {
        const [reserveFrom, reserveTo] = reserves as [bigint, bigint];
        
        if (reserveFrom > BigInt(0) && reserveTo > BigInt(0)) {
          try {
            const fromValue = parseFloat(value);
            if (fromValue > 0) {
              const k = reserveFrom * reserveTo;
              const newX = reserveFrom + BigInt(Math.floor(fromValue * 10**18));
              const newY = k / newX;
              const diff = reserveTo - newY;
              const calculatedToAmount = Number(diff) / 10**18;
              
              const withFee = calculatedToAmount * 0.997;
              if (!isNaN(withFee)) {
                setToAmount(withFee.toFixed(6));
              } else {
                setToAmount("");
              }
            } else {
              setToAmount("");
            }
          } catch (error) {
            console.error("Calculation error:", error);
            setToAmount("");
          }
        } else {
          if (value && value !== "0" && value !== ".") {
            try {
              const calculatedToAmount = Number(value) * 2;
              if (!isNaN(calculatedToAmount)) {
                setToAmount(calculatedToAmount.toString());
              } else {
                setToAmount("");
              }
            } catch (error) {
              console.error("Fallback calculation error:", error);
              setToAmount("");
            }
          } else {
            setToAmount("");
          }
        }
      } else {
        setToAmount("");
      }
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value);
      
      if (value && reserves && value !== "0" && value !== ".") {
        const [reserveFrom, reserveTo] = reserves as [bigint, bigint];
        
        if (reserveFrom > BigInt(0) && reserveTo > BigInt(0)) {
          try {
            const toValue = parseFloat(value);
            if (toValue > 0) {
              const k = reserveFrom * reserveTo;
              const newY = reserveTo - BigInt(Math.floor(toValue * 10**18));
              if (newY > BigInt(0)) {
                const newX = k / newY;
                const diff = newX - reserveFrom;
                const calculatedFromAmount = Number(diff) / 10**18;
                
                const withFee = calculatedFromAmount / 0.997;
                if (!isNaN(withFee)) {
                  setFromAmount(withFee.toFixed(6));
                } else {
                  setFromAmount("");
                }
              } else {
                setFromAmount("");
              }
            } else {
              setFromAmount("");
            }
          } catch (error) {
            console.error("Calculation error:", error);
            setFromAmount("");
          }
        } else {
          if (value) {
            try {
              const calculatedFromAmount = Number(value) / 2;
              if (!isNaN(calculatedFromAmount)) {
                setFromAmount(calculatedFromAmount.toString());
              } else {
                setFromAmount("");
              }
            } catch (error) {
              console.error("Fallback calculation error:", error);
              setFromAmount("");
            }
          } else {
            setFromAmount("");
          }
        }
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

    if (isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountOutMin = parseFloat(toAmount) * (1 - slippage / 100);
    if (isNaN(amountOutMin) || amountOutMin <= 0) {
      toast.error("Invalid output amount calculation");
      return;
    }

    try {
      setIsSwapping(true);
      
      setNeedsApproval(true);
      
      if (approveToken) {
        approveToken();
      } else {
        toast.error("Unable to prepare approval transaction");
        setIsSwapping(false);
        return;
      }
      
    } catch (error) {
      console.error("Swap error:", error);
      toast.error("Failed to execute swap");
      setIsSwapping(false);
    }
  };

  const insufficientLiquidity = !reserves || reserves[0] === BigInt(0) || reserves[1] === BigInt(0);
  
  const getPriceImpact = () => {
    if (!fromAmount || !toAmount || !reserves) return "0.00%";
    
    try {
      const [reserveFrom, reserveTo] = reserves as [bigint, bigint];
      const fromValue = parseFloat(fromAmount);
      
      if (fromValue > 0 && reserveFrom > BigInt(0) && reserveTo > BigInt(0)) {
        const currentPrice = Number(reserveTo) / Number(reserveFrom);
        
        const expectedOutput = fromValue * currentPrice;
        
        const actualOutput = parseFloat(toAmount);
        
        if (isNaN(expectedOutput) || isNaN(actualOutput) || expectedOutput === 0) {
          return "0.00%";
        }
        
        const impact = (expectedOutput - actualOutput) / expectedOutput * 100;
        return impact > 0 ? impact.toFixed(2) + "%" : "0.00%";
      }
      
      return "0.00%";
    } catch (error) {
      console.error("Price impact calculation error:", error);
      return "0.00%";
    }
  };
  
  const priceImpact = getPriceImpact();

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
                Balance: <span className="font-medium">
                  {fromTokenBalance ? (Number(fromTokenBalance) / 10**fromToken.decimals).toFixed(4) : "0.00"}
                </span>
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
                onClick={() => {
                  if (fromTokenBalance) {
                    const maxBalance = (Number(fromTokenBalance) / 10**fromToken.decimals).toString();
                    setFromAmount(maxBalance);
                    handleFromAmountChange({ target: { value: maxBalance } } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
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
                Balance: <span className="font-medium">
                  {toTokenBalance ? (Number(toTokenBalance) / 10**toToken.decimals).toFixed(4) : "0.00"}
                </span>
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
                1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span className={`font-medium ${
                parseFloat(priceImpact) > 3 ? "text-orange-500" : 
                parseFloat(priceImpact) > 1 ? "text-yellow-500" : "text-green-500"
              }`}>
                {priceImpact}
              </span>
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
        ) : isSwapping || approvalLoading || swapLoading ? (
          <Button className="w-full h-12" disabled>
            {needsApproval ? "Approving..." : "Swapping..."}
          </Button>
        ) : (
          <Button
            className="w-full h-12 font-semibold text-base"
            onClick={handleSwap}
            disabled={isSwapping}
          >
            Swap
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
