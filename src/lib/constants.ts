export const TOKENS = [
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Represents native BNB
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png',
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee', // BSC Testnet BUSD
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    address: '0xFa60D973F7642B748046464e165A65B7323b0DEE', // BSC Testnet CAKE
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Represents native ETH
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  },
];

export const NETWORKS = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-id',
    blockExplorerUrl: 'https://etherscan.io',
  },
  {
    id: 56,
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
  },
  {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'BNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    isTestnet: true,
  },
];

// Mock contract addresses replaced with PancakeSwap Testnet addresses
export const DEX_ROUTER_ADDRESS = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'; // PancakeSwap Router V2 on BSC Testnet
export const DEX_FACTORY_ADDRESS = '0x6725F303b657a9451d8BA641348b6761A6CC7a17'; // PancakeSwap Factory on BSC Testnet

// Transaction settings
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const TX_FEE_MULTIPLIER = 1.1; // 10% buffer for gas price
export const GAS_LIMIT_MULTIPLIER = 1.2; // 20% buffer for gas limit
