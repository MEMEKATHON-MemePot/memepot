"use client";

import HeroSection from "./components/HeroSection";
import StakingTable from "./components/StakingTable";
import { Staking } from "./types/Staking";
import { formatUnits } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function StakingPage() {
  const { data: stakingPoolList, refetch: refetchStakings } = useScaffoldReadContract({
    contractName: "StakingManager",
    functionName: "getAllStakingPoolInfos",
  });

  // Fetch MEME token price
  const memePriceUSD = 1.67;

  const formmatedStakingList: Staking[] =
    (stakingPoolList as any[] | undefined)?.map(pool => ({
      id: pool.id.toString(),
      name: pool.name,
      token: pool.token,
      tokenContract: pool.tokenContract,
      apr: pool.apr.toString(),
      totalDeposits: formatUnits(pool.totalDeposits, Number(pool.decimals)),
      chain: "Memecore",
      volume24h: formatUnits(pool.volume24h, Number(pool.decimals)),
      decimals: Number(pool.decimals),
      isNative: pool.isNative,
    })) ?? [];

  let tvl = 0;
  let volume24h = 0;

  formmatedStakingList.forEach(staking => {
    tvl += staking.isNative ? Number(staking.totalDeposits) * memePriceUSD : Number(staking.totalDeposits);
    volume24h += staking.isNative ? Number(staking.volume24h) * memePriceUSD : Number(staking.volume24h);
  });

  return (
    <div className="min-h-screen bg-[#0a0118]">
      <HeroSection tvl={tvl} volume24h={volume24h} />

      {/* Staking Table Section */}
      <div className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <StakingTable stakingList={formmatedStakingList} refetchStakings={refetchStakings} />
        </div>
      </div>
    </div>
  );
}
