import { useScaffoldReadContract } from "./scaffold-eth";

// Match Solidity VaultInfo struct
export interface VaultData {
  id: bigint;
  name: string;
  token: string;
  tokenContract: `0x${string}`;
  apr: bigint;
  totalDeposits: bigint;
  chain: string;
  volume24h: bigint;
  decimals: number;
  isNative: boolean;
}

/**
 * Hook to fetch all vaults information from VaultManager contract
 * @returns Array of all vault data
 */
export function useAllVaults() {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "VaultManager",
    functionName: "getAllVaultInfos",
  });

  console.log("🏦 [useAllVaults] Loading:", isLoading);
  console.log("🏦 [useAllVaults] Data:", data);
  console.log("🏦 [useAllVaults] Error:", error);

  return {
    vaults: data as VaultData[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch vault information for a specific token
 * @param tokenAddress - The token contract address to query
 * @returns Vault data including APR, total deposits, volume, etc.
 */
export function useVaultData(tokenAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "VaultManager",
    functionName: "getVaultInfo",
    args: [tokenAddress],
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    vault: data as VaultData | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch user's deposit balance in a vault
 * @param userAddress - User wallet address
 * @param tokenAddress - Token contract address
 * @returns User's deposited amount
 */
export function useUserVaultBalance(userAddress: `0x${string}` | undefined, tokenAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "VaultManager",
    functionName: "getUserBalance",
    args: [userAddress, tokenAddress],
    query: {
      enabled: !!userAddress && !!tokenAddress,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}
