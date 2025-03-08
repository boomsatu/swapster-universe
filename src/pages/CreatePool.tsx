
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/hooks/useWallet";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { Button } from "@/components/ui/button";
import { TOKENS } from "@/lib/constants";
import { TokenList } from "@/components/dex/TokenList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CreatePool = () => {
  const { wallet } = useWallet();
  const [tokenA, setTokenA] = useState(TOKENS[0]);
  const [tokenB, setTokenB] = useState(TOKENS[1]);
  const [isCreating, setIsCreating] = useState(false);
  
  const { prepareCreatePool, useGetPair } = useContractInteraction();
  
  // Check if pair already exists
  const { data: existingPair, isLoading: isCheckingPair } = useGetPair(
    tokenA?.address, 
    tokenB?.address
  );
  
  const pairExists = existingPair && existingPair !== '0x0000000000000000000000000000000000000000';
  
  // Prepare create pool transaction
  const { 
    createPool, 
    isSuccess: createSuccess, 
    isLoading: createLoading, 
    isError: createError, 
    error: createErrorDetails 
  } = prepareCreatePool(tokenA?.address, tokenB?.address);
  
  const handleCreatePool = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (pairExists) {
      toast.error("Pool already exists for these tokens");
      return;
    }
    
    try {
      setIsCreating(true);
      
      if (createPool) {
        await createPool();
        toast.success(`Created pool for ${tokenA.symbol}/${tokenB.symbol}`);
      } else {
        toast.error("Unable to prepare create pool transaction");
      }
    } catch (error) {
      console.error("Create pool error:", error);
      toast.error("Failed to create pool");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Create Liquidity Pool</h1>
          
          {!wallet.isConnected && (
            <Alert variant="destructive" className="mb-6 animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to create a liquidity pool.
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create New Pool</CardTitle>
              <CardDescription>
                Select two tokens to create a new liquidity pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Token A</label>
                <TokenList
                  onSelect={setTokenA}
                  selectedToken={tokenA}
                  otherToken={tokenB}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Token B</label>
                <TokenList
                  onSelect={setTokenB}
                  selectedToken={tokenB}
                  otherToken={tokenA}
                />
              </div>
              
              {isCheckingPair ? (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  Checking if pool exists...
                </div>
              ) : pairExists ? (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle className="text-yellow-600 dark:text-yellow-400">Pool exists</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    A pool for {tokenA.symbol}/{tokenB.symbol} already exists.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-600 dark:text-green-400">Ready to create</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    No existing pool found. You can create a new {tokenA.symbol}/{tokenB.symbol} pool.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                className="w-full mt-4"
                onClick={handleCreatePool}
                disabled={!wallet.isConnected || isCreating || createLoading || pairExists}
              >
                {isCreating || createLoading ? "Creating Pool..." : "Create Pool"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreatePool;
