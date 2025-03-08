
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/hooks/useWallet";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenList } from "@/components/dex/TokenList";
import { TOKENS } from "@/lib/constants";
import { Plus, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatUnits } from "viem";

interface PoolData {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  tvl: string;
  volume24h: string;
  apr: string;
}

const Pool = () => {
  const { wallet } = useWallet();
  const [tokenA, setTokenA] = useState(TOKENS[0]);
  const [tokenB, setTokenB] = useState(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddLiquidityDialog, setShowAddLiquidityDialog] = useState(false);
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    prepareAddLiquidity, 
    prepareApproveToken, 
    useGetPair, 
    useGetAllPairsLength, 
    useGetPairAtIndex 
  } = useContractInteraction();
  
  // Get all pools length
  const { data: pairsLength, isLoading: isLoadingPairsLength } = useGetAllPairsLength();
  
  // Function to fetch pool data
  const fetchPoolData = async () => {
    if (!pairsLength || !wallet.isConnected) return;
    
    setLoading(true);
    const poolsData: PoolData[] = [];
    
    // Only fetch first 5 pools for performance reasons
    const poolsToFetch = Number(pairsLength) > 5 ? 5 : Number(pairsLength);
    
    try {
      for (let i = 0; i < poolsToFetch; i++) {
        const { data: pairAddress } = useGetPairAtIndex(i);
        
        if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
          // For demonstration, we're creating placeholder data
          // In a real implementation, you'd fetch token symbols and reserves from the pair contract
          const mockPool: PoolData = {
            id: pairAddress as string,
            tokenA: TOKENS[i % TOKENS.length].symbol,
            tokenB: TOKENS[(i + 1) % TOKENS.length].symbol,
            reserveA: ((Math.random() * 100) + 10).toFixed(2),
            reserveB: ((Math.random() * 200000) + 10000).toFixed(2),
            tvl: `$${((Math.random() * 1000000) + 100000).toFixed(0)}`,
            volume24h: `$${((Math.random() * 300000) + 10000).toFixed(0)}`,
            apr: `${((Math.random() * 10) + 2).toFixed(1)}%`
          };
          
          poolsData.push(mockPool);
        }
      }
      
      setPools(poolsData);
    } catch (error) {
      console.error("Error fetching pool data:", error);
      toast.error("Failed to fetch pool data from blockchain");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch pool data when pairsLength changes or wallet connects
  useEffect(() => {
    if (pairsLength && wallet.isConnected) {
      fetchPoolData();
    }
  }, [pairsLength, wallet.isConnected]);
  
  // Check if pair exists
  const { data: pairAddress } = useGetPair(
    tokenA?.address, 
    tokenB?.address
  );
  
  // Prepare add liquidity transaction
  const slippageTolerance = 0.05; // 5%
  const amountAMin = parseFloat(amountA) * (1 - slippageTolerance);
  const amountBMin = parseFloat(amountB) * (1 - slippageTolerance);
  
  const { 
    addLiquidity, 
    isSuccess: addSuccess, 
    isLoading: addLoading, 
    isError: addError, 
    error: addErrorDetails 
  } = prepareAddLiquidity(
    tokenA?.address,
    tokenB?.address,
    amountA,
    amountB,
    amountAMin.toString(),
    amountBMin.toString(),
    wallet.address || '0x'
  );
  
  // Prepare token approval for both tokens
  const { 
    approveToken: approveTokenA, 
    isSuccess: approvalASuccess, 
    isLoading: approvalALoading 
  } = prepareApproveToken(
    tokenA?.address,
    // DEX Router address
    '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // Updated to PancakeSwap Router on BSC Testnet
    amountA
  );
  
  const { 
    approveToken: approveTokenB, 
    isSuccess: approvalBSuccess, 
    isLoading: approvalBLoading 
  } = prepareApproveToken(
    tokenB?.address,
    // DEX Router address
    '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // Updated to PancakeSwap Router on BSC Testnet
    amountB
  );
  
  // Handle add liquidity
  const handleAddLiquidity = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amountA || !amountB) {
      toast.error("Please enter amounts for both tokens");
      return;
    }
    
    try {
      setIsAdding(true);
      
      // First approve tokenA
      toast.info(`Approving ${tokenA.symbol}...`);
      if (approveTokenA) {
        await approveTokenA();
      } else {
        toast.error(`Unable to approve ${tokenA.symbol}`);
        setIsAdding(false);
        return;
      }
      
      // Then approve tokenB
      toast.info(`Approving ${tokenB.symbol}...`);
      if (approveTokenB) {
        await approveTokenB();
      } else {
        toast.error(`Unable to approve ${tokenB.symbol}`);
        setIsAdding(false);
        return;
      }
      
      // Then add liquidity
      toast.info("Adding liquidity...");
      if (addLiquidity) {
        await addLiquidity();
        toast.success(`Added liquidity with ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol}`);
        setAmountA("");
        setAmountB("");
        setShowAddLiquidityDialog(false);
        
        // Refresh pool data after adding liquidity
        fetchPoolData();
      } else {
        toast.error("Unable to add liquidity");
      }
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast.error("Failed to add liquidity");
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Liquidity Pools</h1>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowAddLiquidityDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Add Liquidity
              </Button>
              <Link to="/create-pool">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Pool
                </Button>
              </Link>
            </div>
          </div>
          
          {!wallet.isConnected && (
            <Alert variant="destructive" className="mb-6 animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to view and manage your liquidity positions.
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Liquidity Positions</CardTitle>
              <CardDescription>
                View and manage your liquidity pool positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wallet.isConnected ? (
                loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading your positions...</span>
                  </div>
                ) : pools.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pools.map((pool) => (
                      <Link to={`/pool/${pool.id}`} key={pool.id}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                              {pool.tokenA} / {pool.tokenB}
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Your liquidity:</span>
                                <span className="font-medium">$12,345</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Share of pool:</span>
                                <span className="font-medium">1.2%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Earned fees:</span>
                                <span className="font-medium text-green-500">$235</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>You don't have any liquidity positions yet.</p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setShowAddLiquidityDialog(true)}
                    >
                      Add Liquidity
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Connect your wallet to view your liquidity positions.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>All Liquidity Pools</CardTitle>
              <CardDescription>
                Explore active liquidity pools and their statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading pools from blockchain...</span>
                </div>
              ) : pools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pools.map((pool) => (
                    <Link to={`/pool/${pool.id}`} key={pool.id}>
                      <Card className="glass-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{pool.tokenA} / {pool.tokenB}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">TVL:</span>
                              <span className="font-medium">{pool.tvl}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">24h Volume:</span>
                              <span className="font-medium">{pool.volume24h}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">APR:</span>
                              <span className="font-medium text-green-500">{pool.apr}</span>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4" onClick={(e) => {
                            e.preventDefault();
                            setShowAddLiquidityDialog(true);
                          }}>
                            Add Liquidity
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No pools found. Be the first to create a liquidity pool!</p>
                  <Link to="/create-pool">
                    <Button className="mt-4">Create Pool</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add Liquidity Dialog */}
          <Dialog open={showAddLiquidityDialog} onOpenChange={setShowAddLiquidityDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Liquidity</DialogTitle>
                <DialogDescription>
                  Provide tokens to earn fees from trades
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <label htmlFor="token-a-amount">Token A</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="token-a-amount"
                        placeholder="0.0"
                        value={amountA}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setAmountA(value);
                          }
                        }}
                        className="h-12 pl-3 pr-16 text-lg font-medium"
                      />
                      <Button
                        variant="ghost"
                        className="absolute right-1 top-1 h-10 px-2 font-medium text-xs"
                        onClick={() => setAmountA("0.0")} // Would set to max balance
                      >
                        MAX
                      </Button>
                    </div>
                    <TokenList
                      onSelect={setTokenA}
                      selectedToken={tokenA}
                      otherToken={tokenB}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <label htmlFor="token-b-amount">Token B</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="token-b-amount"
                        placeholder="0.0"
                        value={amountB}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setAmountB(value);
                          }
                        }}
                        className="h-12 pl-3 pr-16 text-lg font-medium"
                      />
                      <Button
                        variant="ghost"
                        className="absolute right-1 top-1 h-10 px-2 font-medium text-xs"
                        onClick={() => setAmountB("0.0")} // Would set to max balance
                      >
                        MAX
                      </Button>
                    </div>
                    <TokenList
                      onSelect={setTokenB}
                      selectedToken={tokenB}
                      otherToken={tokenA}
                    />
                  </div>
                </div>
                
                {amountA && amountB && (
                  <div className="text-sm rounded-md bg-muted p-2.5 text-muted-foreground">
                    <div className="flex justify-between mb-1">
                      <span>Starting price:</span>
                      <span className="font-medium">
                        1 {tokenA.symbol} = {parseFloat(amountB) / parseFloat(amountA)} {tokenB.symbol}
                      </span>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={handleAddLiquidity}
                  disabled={!wallet.isConnected || !amountA || !amountB || isAdding || approvalALoading || approvalBLoading || addLoading}
                >
                  {isAdding || approvalALoading || approvalBLoading || addLoading ? "Adding Liquidity..." : "Add Liquidity"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pool;
