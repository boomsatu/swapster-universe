
import { useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, polygon, optimism, arbitrum, bsc } from 'wagmi/chains';
import { NETWORKS } from '@/lib/constants';
import { toast } from 'sonner';

// Configure supported chains
const chains = [mainnet, polygon, optimism, arbitrum, bsc];
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
