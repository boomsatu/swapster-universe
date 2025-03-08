
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/hooks/useWallet";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PoolDetails = () => {
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const { wallet } = useWallet();
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Mock pool data - would be replaced with actual data from contract calls
  const poolData = {
    tokenA: {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      reserve: "10.5",
      decimals: 18
    },
    tokenB: {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      reserve: "21000",
      decimals: 6
    },
    lpToken: {
      address: pairAddress || "",
      totalSupply: "15.75",
      userBalance: "2.5"
    }
  };
  
  const { prepareRemoveLiquidity } = useContractInteraction();
  
  // Prepare remove liquidity transaction
  const minA = parseFloat(poolData.tokenA.reserve) * (parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply)) * 0.95;
  const minB = parseFloat(poolData.tokenB.reserve) * (parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply)) * 0.95;
  
  const { 
    removeLiquidity, 
    isSuccess: removeSuccess, 
    isLoading: removeLoading, 
    isError: removeError, 
    error: removeErrorDetails 
  } = prepareRemoveLiquidity(
    poolData.tokenA.address,
    poolData.tokenB.address,
    removeLiquidityAmount,
    minA.toString(),
    minB.toString(),
    wallet.address || '0x'
  );
  
  const handleRemoveLiquidity = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!removeLiquidityAmount || parseFloat(removeLiquidityAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (parseFloat(removeLiquidityAmount) > parseFloat(poolData.lpToken.userBalance)) {
      toast.error("Insufficient LP token balance");
      return;
    }
    
    try {
      setIsRemoving(true);
      
      if (removeLiquidity) {
        await removeLiquidity();
        toast.success(`Removed liquidity successfully`);
        setRemoveLiquidityAmount("");
      } else {
        toast.error("Unable to prepare remove liquidity transaction");
      }
    } catch (error) {
      console.error("Remove liquidity error:", error);
      toast.error("Failed to remove liquidity");
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Pool Details</h1>
          
          {!wallet.isConnected && (
            <Alert variant="destructive" className="mb-6 animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to view pool details.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Pool Information</CardTitle>
                <CardDescription>
                  Details for {poolData.tokenA.symbol}/{poolData.tokenB.symbol} pool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Token A</p>
                    <p className="font-medium">{poolData.tokenA.symbol}</p>
                    <p className="text-xl font-bold mt-2">{poolData.tokenA.reserve}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Token B</p>
                    <p className="font-medium">{poolData.tokenB.symbol}</p>
                    <p className="text-xl font-bold mt-2">{poolData.tokenB.reserve}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Pool Address</p>
                  <p className="font-medium break-all">{pairAddress}</p>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">LP Token Total Supply</p>
                  <p className="font-medium">{poolData.lpToken.totalSupply}</p>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Your LP Token Balance</p>
                  <p className="font-medium">{poolData.lpToken.userBalance}</p>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Exchange Rate</p>
                  <p className="font-medium">
                    1 {poolData.tokenA.symbol} = {parseFloat(poolData.tokenB.reserve) / parseFloat(poolData.tokenA.reserve)} {poolData.tokenB.symbol}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Remove Liquidity</CardTitle>
                <CardDescription>
                  Withdraw your tokens from the pool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount of LP Tokens</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="0.0"
                        value={removeLiquidityAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setRemoveLiquidityAmount(value);
                          }
                        }}
                        className="h-12 pl-3 pr-16 text-lg font-medium"
                      />
                      <Button
                        variant="ghost"
                        className="absolute right-1 top-1 h-10 px-2 font-medium text-xs"
                        onClick={() => setRemoveLiquidityAmount(poolData.lpToken.userBalance)}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                </div>
                
                {removeLiquidityAmount && parseFloat(removeLiquidityAmount) > 0 && (
                  <div className="bg-muted rounded-md p-4 space-y-2">
                    <p className="text-sm font-medium">You will receive (minimum):</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{poolData.tokenA.symbol}</p>
                        <p className="font-medium">
                          {(parseFloat(poolData.tokenA.reserve) * parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply) * 0.95).toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{poolData.tokenB.symbol}</p>
                        <p className="font-medium">
                          {(parseFloat(poolData.tokenB.reserve) * parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply) * 0.95).toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prices include a 5% slippage tolerance
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={handleRemoveLiquidity}
                  disabled={!wallet.isConnected || !removeLiquidityAmount || parseFloat(removeLiquidityAmount) <= 0 || isRemoving || removeLoading}
                >
                  {isRemoving || removeLoading ? "Removing Liquidity..." : "Remove Liquidity"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoolDetails;
