
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SwapInterface } from "@/components/dex/SwapInterface";
import { TransactionHistory } from "@/components/dex/TransactionHistory";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Swap = () => {
  const { wallet } = useWallet();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 order-1 lg:order-none">
              <h1 className="text-3xl font-bold mb-6">Swap</h1>
              {!wallet.isConnected && (
                <Alert variant="destructive" className="mb-6 animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to use the swap feature.
                  </AlertDescription>
                </Alert>
              )}
              <SwapInterface />
            </div>
            
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <TransactionHistory />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Swap;
