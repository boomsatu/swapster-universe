
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: any | null;
}

const initialState: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  provider: null,
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(initialState);

  const resetWallet = () => setWallet(initialState);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        return;
      }

      // Check if user is already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWallet({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true,
          isConnecting: false,
          provider: window.ethereum,
        });
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      resetWallet();
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not detected! Please install MetaMask first.');
        return;
      }

      setWallet(prev => ({ ...prev, isConnecting: true }));

      // Request accounts access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      setWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        provider: window.ethereum,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle user rejected request error
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask to continue.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      
      resetWallet();
    }
  };

  const disconnectWallet = () => {
    resetWallet();
    toast.info('Wallet disconnected');
  };

  // Initial check for wallet connection
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  // Setup event listeners for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          resetWallet();
          toast.info('Wallet disconnected');
        } else if (wallet.isConnected) {
          // User switched accounts
          setWallet(prev => ({ ...prev, address: accounts[0] }));
          toast.info('Account changed');
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Handle chain change
        setWallet(prev => ({ 
          ...prev, 
          chainId: parseInt(chainId, 16)
        }));
        toast.info('Network changed');
        
        // Refresh page to avoid any issues
        window.location.reload();
      };

      const handleDisconnect = () => {
        resetWallet();
        toast.info('Wallet disconnected');
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [wallet.isConnected]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
  };
}
