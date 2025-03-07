
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Pool = () => {
  const { wallet } = useWallet();
  
  // Mock liquidity pools data
  const mockPools = [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Liquidity Pools</h1>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Liquidity
            </Button>
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
                mockPools.length > 0 ? (
                  <div>
                    {/* Liquidity positions would be listed here */}
                    Liquidity pool positions...
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>You don't have any liquidity positions yet.</p>
                    <Button className="mt-4" variant="outline">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* This would be populated with actual pool data */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">ETH / USDT</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TVL:</span>
                          <span className="font-medium">$1,245,678</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">24h Volume:</span>
                          <span className="font-medium">$324,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">APR:</span>
                          <span className="font-medium text-green-500">8.2%</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Add Liquidity
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pool;
