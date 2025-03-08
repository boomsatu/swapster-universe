
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { DEX_ROUTER_ADDRESS, DEX_FACTORY_ADDRESS } from '@/lib/constants';

// Simple ABI fragments for the router and factory contracts
const ROUTER_ABI = [
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "addLiquidity",
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "removeLiquidity",
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" }
    ],
    name: "getReserves",
    outputs: [
      { name: "reserveA", type: "uint256" },
      { name: "reserveB", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" }
    ],
    name: "createPair",
    outputs: [{ name: "pair", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" }
    ],
    name: "getPair",
    outputs: [{ name: "pair", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "allPairsLength",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "allPairs",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
];

// ERC20 ABI fragment for approve and other token operations
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  }
];

export function useContractInteraction() {
  // Swap tokens
  const prepareSwap = (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    walletAddress: string
  ) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    
    // Validate inputs before parsing to avoid NaN errors
    const isValidAmount = (amount: string) => {
      return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
    };
    
    if (!isValidAmount(amountIn) || !isValidAmount(amountOutMin)) {
      // Return a dummy config when inputs are invalid
      return {
        swap: undefined,
        isSuccess: false,
        isLoading: false,
        isError: false,
        error: null
      };
    }

    const { config } = usePrepareContractWrite({
      address: DEX_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [
        parseUnits(amountIn, 18), // Assuming 18 decimals, should be token-specific
        parseUnits(amountOutMin, 18), // Minimum amount out with slippage
        [tokenIn, tokenOut], // Path
        walletAddress, // Recipient
        BigInt(deadline) // Deadline
      ],
      enabled: isValidAmount(amountIn) && isValidAmount(amountOutMin)
    });
    
    const { write: swap, isSuccess, isLoading, isError, error } = useContractWrite(config);
    
    return {
      swap,
      isSuccess,
      isLoading,
      isError,
      error
    };
  };
  
  // Add liquidity
  const prepareAddLiquidity = (
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
    amountAMin: string,
    amountBMin: string,
    walletAddress: string
  ) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    
    // Validate inputs
    const isValidAmount = (amount: string) => {
      return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
    };
    
    if (!isValidAmount(amountA) || !isValidAmount(amountB) || 
        !isValidAmount(amountAMin) || !isValidAmount(amountBMin)) {
      return {
        addLiquidity: undefined,
        isSuccess: false,
        isLoading: false,
        isError: false,
        error: null
      };
    }
    
    const { config } = usePrepareContractWrite({
      address: DEX_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'addLiquidity',
      args: [
        tokenA,
        tokenB,
        parseUnits(amountA, 18),
        parseUnits(amountB, 18),
        parseUnits(amountAMin, 18),
        parseUnits(amountBMin, 18),
        walletAddress,
        BigInt(deadline)
      ],
      enabled: isValidAmount(amountA) && isValidAmount(amountB) &&
              isValidAmount(amountAMin) && isValidAmount(amountBMin)
    });
    
    const { write: addLiquidity, isSuccess, isLoading, isError, error } = useContractWrite(config);
    
    return {
      addLiquidity,
      isSuccess,
      isLoading,
      isError,
      error
    };
  };
  
  // Remove liquidity
  const prepareRemoveLiquidity = (
    tokenA: string,
    tokenB: string,
    liquidity: string,
    amountAMin: string,
    amountBMin: string,
    walletAddress: string
  ) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    
    // Validate inputs
    const isValidAmount = (amount: string) => {
      return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
    };
    
    if (!isValidAmount(liquidity) || !isValidAmount(amountAMin) || !isValidAmount(amountBMin)) {
      return {
        removeLiquidity: undefined,
        isSuccess: false,
        isLoading: false,
        isError: false,
        error: null
      };
    }
    
    const { config } = usePrepareContractWrite({
      address: DEX_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'removeLiquidity',
      args: [
        tokenA,
        tokenB,
        parseUnits(liquidity, 18),
        parseUnits(amountAMin, 18),
        parseUnits(amountBMin, 18),
        walletAddress,
        BigInt(deadline)
      ],
      enabled: isValidAmount(liquidity) && isValidAmount(amountAMin) && isValidAmount(amountBMin)
    });
    
    const { write: removeLiquidity, isSuccess, isLoading, isError, error } = useContractWrite(config);
    
    return {
      removeLiquidity,
      isSuccess,
      isLoading,
      isError,
      error
    };
  };
  
  // Create pool
  const prepareCreatePool = (tokenA: string, tokenB: string) => {
    const { config } = usePrepareContractWrite({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'createPair',
      args: [tokenA, tokenB],
    });
    
    const { write: createPool, isSuccess, isLoading, isError, error } = useContractWrite(config);
    
    return {
      createPool,
      isSuccess,
      isLoading,
      isError,
      error
    };
  };
  
  // Get pair
  const useGetPair = (tokenA: string, tokenB: string) => {
    return useContractRead({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getPair',
      args: [tokenA, tokenB],
    });
  };
  
  // Get reserves
  const useGetReserves = (tokenA: string, tokenB: string) => {
    return useContractRead({
      address: DEX_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'getReserves',
      args: [tokenA, tokenB],
    });
  };
  
  // Get all pairs
  const useGetAllPairsLength = () => {
    return useContractRead({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'allPairsLength',
    });
  };
  
  const useGetPairAtIndex = (index: number) => {
    return useContractRead({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'allPairs',
      args: [BigInt(index)],
    });
  };
  
  // Token approval
  const prepareApproveToken = (tokenAddress: string, spenderAddress: string, amount: string) => {
    // Validate inputs
    const isValidAmount = (amount: string) => {
      return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
    };
    
    if (!isValidAmount(amount)) {
      return {
        approveToken: undefined,
        isSuccess: false,
        isLoading: false,
        isError: false,
        error: null
      };
    }
    
    const { config } = usePrepareContractWrite({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, parseUnits(amount, 18)],
      enabled: isValidAmount(amount)
    });
    
    const { write: approveToken, isSuccess, isLoading, isError, error } = useContractWrite(config);
    
    return {
      approveToken,
      isSuccess,
      isLoading,
      isError,
      error
    };
  };
  
  // Get token balance
  const useGetTokenBalance = (tokenAddress: string, walletAddress: string) => {
    return useContractRead({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });
  };
  
  return {
    prepareSwap,
    prepareAddLiquidity,
    prepareRemoveLiquidity,
    prepareCreatePool,
    prepareApproveToken,
    useGetPair,
    useGetReserves,
    useGetAllPairsLength,
    useGetPairAtIndex,
    useGetTokenBalance
  };
}
