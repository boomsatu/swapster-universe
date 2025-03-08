
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Web3Provider } from "./providers/Web3Provider";
import Index from "./pages/Index";
import Swap from "./pages/Swap";
import Pool from "./pages/Pool";
import Charts from "./pages/Charts";
import NotFound from "./pages/NotFound";
import CreatePool from "./pages/CreatePool";
import PoolDetails from "./pages/PoolDetails";

const queryClient = new QueryClient();

// Remove the global declaration since it's already in types.d.ts

const App = () => {
  // Add listener for theme changes
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Apply the theme, or use system preference
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/pool" element={<Pool />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/create-pool" element={<CreatePool />} />
              <Route path="/pool/:pairAddress" element={<PoolDetails />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
};

export default App;
