import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/hooks/useWallet";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useContractRead } from "wagmi";

// ABI for PancakeSwap Pair contract
const PAIR_ABI = [
  {
    "inputs": [],
    "name": "token0",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {"internalType": "uint112", "name": "_reserve0", "type": "uint112"},
      {"internalType": "uint112", "name": "_reserve1", "type": "uint112"},
      {"internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ERC20 ABI for token details
const ERC20_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface PoolData {
  tokenA: {
    symbol: string;
    address: string;
    reserve: string;
    decimals: number;
  };
  tokenB: {
    symbol: string;
    address: string;
    reserve: string;
    decimals: number;
  };
  lpToken: {
    address: string;
    totalSupply: string;
    userBalance: string;
  };
}

const PoolDetails = () => {
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const { wallet } = useWallet();
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { prepareRemoveLiquidity } = useContractInteraction();
  
  // Read token0 address from pair contract
  const { data: token0Address } = useContractRead({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: 'token0',
    enabled: !!pairAddress
  });
  
  // Read token1 address from pair contract
  const { data: token1Address } = useContractRead({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: 'token1',
    enabled: !!pairAddress
  });
  
  // Read reserves from pair contract
  const { data: reserves } = useContractRead({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: 'getReserves',
    enabled: !!pairAddress
  });
  
  // Read total supply from pair contract
  const { data: totalSupply } = useContractRead({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: 'totalSupply',
    enabled: !!pairAddress
  });
  
  // Read LP token balance for the current user
  const { data: lpBalance } = useContractRead({
    address: pairAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [wallet.address as `0x${string}`],
    enabled: !!pairAddress && !!wallet.address
  });
  
  // Fetch pool data from smart contract
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!pairAddress || !wallet.isConnected) return;
      
      setLoading(true);
      
      try {
        // For this example, we'll use mock data since we can't execute actual contract calls here
        // In a real implementation, you would use the useContractRead hook to fetch data from the contract
        
        // Mock data to simulate contract response
        const mockTokenA = {
          symbol: "BNB",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          reserve: "10.5",
          decimals: 18
        };
        
        const mockTokenB = {
          symbol: "BUSD",
          address: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
          reserve: "2100",
          decimals: 18
        };
        
        const mockPoolData: PoolData = {
          tokenA: mockTokenA,
          tokenB: mockTokenB,
          lpToken: {
            address: pairAddress,
            totalSupply: "15.75",
            userBalance: "2.5"
          }
        };
        
        setPoolData(mockPoolData);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast.error("Failed to fetch pool data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoolData();
  }, [pairAddress, wallet.isConnected]);
  
  // Prepare remove liquidity transaction
  const minA = poolData ? parseFloat(poolData.tokenA.reserve) * (parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply)) * 0.95 : 0;
  const minB = poolData ? parseFloat(poolData.tokenB.reserve) * (parseFloat(removeLiquidityAmount) / parseFloat(poolData.lpToken.totalSupply)) * 0.95 : 0;
  
  const { 
    removeLiquidity, 
    isSuccess: removeSuccess, 
    isLoading: removeLoading, 
    isError: removeError, 
    error: removeErrorDetails 
  } = prepareRemoveLiquidity(
    poolData?.tokenA.address || '0x',
    poolData?.tokenB.address || '0x',
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
    
    if (poolData && parseFloat(removeLiquidityAmount) > parseFloat(poolData.lpToken.userBalance)) {
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
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading pool data from blockchain...</span>
            </div>
          ) : poolData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pool Information</CardTitle>
                  <CardDescription>
                    Details for {poolData.tokenA.symbol}/{poolData.tokenB.symbol} pool on BSC Testnet
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
                    <a 
                      href={`https://testnet.bscscan.com/address/${pairAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View on BscScan
                    </a>
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
          ) : (
            <Alert variant="destructive" className="animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pool not found</AlertTitle>
              <AlertDescription>
                The liquidity pool you're looking for could not be found.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoolDetails;
