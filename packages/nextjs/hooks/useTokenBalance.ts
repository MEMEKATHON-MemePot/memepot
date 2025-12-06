import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";

/**
 * Hook to get user's balance for a specific token
 * Supports both ERC20 tokens and native tokens
 *
 * @param tokenAddress - Token contract address (use native token address for MEME)
 * @param isNative - Whether the token is native (MEME)
 * @returns Balance data including formatted value
 */
export function useTokenBalance(tokenAddress: `0x${string}` | undefined, isNative?: boolean) {
  const { address: userAddress } = useAccount();

  // For native token (MEME)
  const nativeBalance = useBalance({
    address: userAddress,
    query: {
      enabled: isNative && !!userAddress,
    },
  });

  // For ERC20 tokens
  const erc20Balance = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !isNative && !!tokenAddress && !!userAddress,
    },
  });

  if (isNative) {
    return {
      balance: nativeBalance.data?.value || 0n,
      formatted: nativeBalance.data?.formatted || "0",
      symbol: nativeBalance.data?.symbol || "MEME",
      decimals: nativeBalance.data?.decimals || 18,
      isLoading: nativeBalance.isLoading,
      error: nativeBalance.error,
      refetch: nativeBalance.refetch,
    };
  }

  return {
    balance: erc20Balance.data || 0n,
    formatted: erc20Balance.data ? (Number(erc20Balance.data) / 1e6).toFixed(2) : "0", // Assuming 6 decimals for USDT/USDC
    symbol: tokenAddress ? "TOKEN" : "",
    decimals: 6, // Default to 6 for USDT/USDC
    isLoading: erc20Balance.isLoading,
    error: erc20Balance.error,
    refetch: erc20Balance.refetch,
  };
}

/**
 * Hook to get user's balance for multiple tokens
 * @param tokens - Array of token addresses with their native flags
 *
 * Note: This hook violates react-hooks/rules-of-hooks when using map.
 * For multiple token balances, call useTokenBalance separately for each token.
 */
// Commented out to avoid ESLint error
// export function useMultiTokenBalance(tokens: Array<{ address: `0x${string}`; isNative?: boolean }>) {
//   const balances = tokens.map(token => useTokenBalance(token.address, token.isNative));
//   return {
//     balances,
//     isLoading: balances.some(b => b.isLoading),
//     refetchAll: () => balances.forEach(b => b.refetch()),
//   };
// }
