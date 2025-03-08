
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MetaMaskSDK } from '@metamask/sdk';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

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

let MMSDK: MetaMaskSDK | null = null;

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  // Initialize MetaMask SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !MMSDK) {
      MMSDK = new MetaMaskSDK({
        dappMetadata: {
          name: 'DEX Exchange',
          url: window.location.href,
        },
        checkInstallationImmediately: false,
      });
    }
  }, []);

  // Update wallet state when account changes
  useEffect(() => {
    if (address && isConnected && chain) {
      setWallet({
        address: address,
        chainId: chain.id,
        isConnected: true,
        isConnecting: false,
        provider: window.ethereum,
      });
    } else if (!isConnected) {
      setWallet(initialState);
    }
  }, [address, isConnected, chain]);

  const connectWallet = async () => {
    try {
      setWallet(prev => ({ ...prev, isConnecting: true }));
      
      // First try using wagmi
      connect({ connector: new MetaMaskConnector() });
      
      // If MetaMask isn't detected, show an error
      if (!window.ethereum && MMSDK) {
        await MMSDK.connect();
      }
      
      if (!window.ethereum) {
        toast.error('MetaMask not detected! Please install MetaMask first.');
        setWallet(prev => ({ ...prev, isConnecting: false }));
        return;
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle user rejected request error
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask to continue.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      
      setWallet(initialState);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setWallet(initialState);
    toast.info('Wallet disconnected');
  };

  const switchToNetwork = (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId);
    }
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToNetwork,
  };
}
