import { useScaffoldReadContract } from "./scaffold-eth";
import { useAccount, useBalance } from "wagmi";

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

  // Native token (MEME) → wagmi useBalance
  const nativeBalance = useBalance({
    address: userAddress,
    query: {
      enabled: isNative && !!userAddress,
    },
  });

  // ERC20 token → TokenBalanceHelper.getUserBalance(user, token)
  const erc20Balance = useScaffoldReadContract({
    contractName: "TokenBalanceHelper",
    functionName: "getUserBalance",
    args: [userAddress, tokenAddress],
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

  const raw = (erc20Balance.data ?? 0n) as bigint;

  return {
    balance: raw,
    formatted: Number(raw) ? (Number(raw) / 1e6).toFixed(2) : "0", // USDT/USDC 6 decimals 가정
    symbol: tokenAddress ? "TOKEN" : "",
    decimals: 6,
    isLoading: erc20Balance.isLoading,
    error: erc20Balance.error,
    refetch: erc20Balance.refetch,
  };
}
