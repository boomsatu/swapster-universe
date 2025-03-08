
import { useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, polygon, optimism, arbitrum, bsc } from 'wagmi/chains';
import { NETWORKS } from '@/lib/constants';
import { toast } from 'sonner';

// Create BSC Testnet chain
const bscTestnet = {
  id: 97,
  name: 'BSC Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  rpcUrls: {
    public: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'] },
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
};

// Configure supported chains with BSC Testnet as first (default)
const chains = [bscTestnet, bsc, mainnet, polygon, optimism, arbitrum];
const projectId = 'YOUR_PROJECT_ID'; // Replace with your Web3Modal project ID if needed

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [publicProvider()]
);

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'light',
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiConfig config={config}>{children}</WagmiConfig>
      ) : (
        <div>Loading Web3...</div>
      )}
    </>
  );
}
