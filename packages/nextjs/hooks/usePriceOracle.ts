import { useScaffoldReadContract } from "./scaffold-eth";

// Native token address constant (same as in VaultManager and PriceOracle contracts)
const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as `0x${string}`;

/**
 * Hook to fetch MEME (native token) price from PriceOracle
 * @returns MEME token price in USD (8 decimals)
 */
export function useMemecorePrice() {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PriceOracle",
    functionName: "getPrice",
    args: [NATIVE_TOKEN],
  });

  // Convert from 8 decimals to float
  const priceInUSD = data ? Number(data) / 1e8 : 0;

  return {
    price: data as bigint | undefined,
    priceInUSD,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch any token price from PriceOracle
 * @param tokenAddress - Token contract address
 * @returns Token price in USD (8 decimals)
 */
export function useTokenPrice(tokenAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PriceOracle",
    functionName: "getPrice",
    args: [tokenAddress],
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Convert from 8 decimals to float
  const priceInUSD = data ? Number(data) / 1e8 : 0;

  return {
    price: data as bigint | undefined,
    priceInUSD,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to convert token amount to USD value
 * @param tokenAddress - Token contract address
 * @param amount - Token amount (in token decimals)
 * @param decimals - Token decimals
 * @returns USD value (8 decimals)
 */
export function useTokenUSDValue(
  tokenAddress: `0x${string}` | undefined,
  amount: bigint | undefined,
  decimals: number,
) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PriceOracle",
    functionName: "getUSDValue",
    args: [tokenAddress, amount, decimals],
    query: {
      enabled: !!tokenAddress && amount !== undefined,
    },
  });

  // Convert from 8 decimals to float
  const valueInUSD = data ? Number(data) / 1e8 : 0;

  return {
    value: data as bigint | undefined,
    valueInUSD,
    isLoading,
    error,
    refetch,
  };
}
