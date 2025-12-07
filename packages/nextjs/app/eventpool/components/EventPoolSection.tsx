"use client";

import { useMemo } from "react";
import EventPoolCard from "./EventPoolCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const poolStyles = {
  "1": { icon: "ri-fire-fill", gradient: "from-orange-500 to-red-500" },
  "2": { icon: "ri-flashlight-fill", gradient: "from-yellow-500 to-orange-500" },
  "3": { icon: "ri-rocket-fill", gradient: "from-purple-500 to-pink-500" },
  "4": { icon: "ri-coin-fill", gradient: "from-green-500 to-emerald-500" },
  "5": { icon: "ri-safe-fill", gradient: "from-teal-500 to-green-500" },
  "6": { icon: "ri-trophy-fill", gradient: "from-blue-500 to-cyan-500" },
};

const FREQUENCY_MAP: Record<number, "1D" | "1W" | "1M"> = {
  0: "1D",
  1: "1W",
  2: "1M",
};

const STATUS_MAP: Record<number, "active" | "completed" | "cancelled"> = {
  0: "active",
  1: "completed",
  2: "cancelled",
};

const TOKEN_INFO: Record<string, { symbol: string; decimals: number }> = {
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": { symbol: "MEMECORE", decimals: 18 },
  "0x201fC8Af6FFa65309BaF2b6607ea4ab039661272": { symbol: "USDT", decimals: 6 },
  "0xe93408d27914d1a9f4298ec86Dbd2A644CeB1cD9": { symbol: "NOCMU", decimals: 18 },
};

export default function EventPoolsSection() {
  const { data: poolsData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getAllEventPools",
  });

  const pools = useMemo(() => {
    if (!poolsData) return [];
    return (poolsData as any[]).map(p => {
      const tokenAddr = (p.rewardToken as string).toLowerCase();
      const tokenInfo = Object.entries(TOKEN_INFO).find(([addr]) => addr.toLowerCase() === tokenAddr)?.[1] || {
        symbol: "MEMECORE",
        decimals: 18,
      };

      return {
        id: String(p.id),
        poolNum: Number(p.poolNum),
        name: `${tokenInfo.symbol} Pool`,
        tokenSymbol: tokenInfo.symbol,
        tokenAddress: p.rewardToken as string,
        totalPrize: (Number(p.totalPrize) / 10 ** tokenInfo.decimals).toLocaleString(),
        currency: tokenInfo.symbol,
        frequency: FREQUENCY_MAP[Number(p.frequency)] ?? "1D",
        nextDraw: Number(p.nextDrawAt) * 1000,
        participants: Number(p.participants),
        totalPoints: Number(p.totalPoints),
        status: STATUS_MAP[Number(p.status)] ?? "active",
        prizeBreakdown: [
          { place: "1", percentage: 60 },
          { place: "2", percentage: 30 },
          { place: "3", percentage: 10 },
        ],
        icon: poolStyles[String(Number(p.poolNum)) as keyof typeof poolStyles]?.icon || "ri-fire-fill",
        gradient:
          poolStyles[String(Number(p.poolNum)) as keyof typeof poolStyles]?.gradient || "from-orange-500 to-red-500",
      };
    });
  }, [poolsData]);

  console.log(pools);

  return (
    <section className="relative px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mt-24">
          <h3 className="text-6xl font-bold text-center mb-24">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Active event Prize Pools
            </span>
          </h3>
          {pools.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Loading event pools...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pools.map(pool => (
                <EventPoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
