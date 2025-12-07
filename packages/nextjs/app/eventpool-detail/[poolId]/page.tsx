"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ParticipateModal from "./components/EventPoolParticipateModal";
import PrizeInfoSection from "./components/PrizeInfoSection";
import { useAccount } from "wagmi";
import CosmicBackground from "~~/components/CosmicBackground";
import StarsBackground from "~~/components/StarsBackground";
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

interface PrizesDetailPageProps {
  params: Promise<{
    poolId: string;
  }>;
}

export default function EventPoolDetailPage({ params }: PrizesDetailPageProps) {
  const { poolId } = use(params);
  const { address } = useAccount();
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const router = useRouter();

  const { data: detailData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [poolId ? BigInt(poolId) : undefined, address ?? undefined] as const,
    query: {
      enabled: !!poolId && !!address,
    },
  });

  const eventPoolDetail = useMemo(() => {
    if (!detailData) return null;
    const [pool, userInfo] = detailData as any;

    const poolNum = Number(pool.poolNum);
    const style = poolStyles[String(poolNum) as keyof typeof poolStyles] || poolStyles["1"];

    const tokenAddr = (pool.rewardToken as string).toLowerCase();
    const tokenInfo = Object.entries(TOKEN_INFO).find(([addr]) => addr.toLowerCase() === tokenAddr)?.[1] || {
      symbol: "MEMECORE",
      decimals: 18,
    };

    const totalPrizeNum = Number(pool.totalPrize) / 10 ** tokenInfo.decimals;

    return {
      id: String(pool.id),
      poolNum,
      name: `${tokenInfo.symbol} Pool`,
      tokenSymbol: tokenInfo.symbol,
      tokenAddress: pool.rewardToken as string,
      totalPrize: totalPrizeNum.toLocaleString(),
      currency: tokenInfo.symbol,
      frequency: FREQUENCY_MAP[Number(pool.frequency)] ?? "1D",
      nextDraw: Number(pool.nextDrawAt) * 1000,
      participants: Number(pool.participants),
      totalPoints: Number(pool.totalPoints),
      status: STATUS_MAP[Number(pool.status)] ?? "active",
      prizeBreakdown: [
        { place: "1st Place", percentage: 60, amount: (totalPrizeNum * 0.6).toLocaleString() },
        { place: "2nd Place", percentage: 30, amount: (totalPrizeNum * 0.3).toLocaleString() },
        { place: "3rd Place", percentage: 10, amount: (totalPrizeNum * 0.1).toLocaleString() },
      ],
      userStats: {
        userPoints: Number(userInfo.userPoints ?? 0n),
        winChance: (Number(userInfo.winRateBps ?? 0n) / 100).toFixed(4),
        totalTickets: Number(pool.totalPoints),
      },
      icon: style.icon,
      gradient: style.gradient,
    };
  }, [detailData]);

  if (!eventPoolDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
        <CosmicBackground />
        <StarsBackground />
        <main className="relative z-10 pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-400">Loading event pool details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      <CosmicBackground />
      <StarsBackground />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/eventpool")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to All Prizes</span>
          </button>

          <PrizeInfoSection eventPool={eventPoolDetail} onParticipate={() => setShowParticipateModal(true)} />
        </div>
      </main>

      {showParticipateModal && (
        <ParticipateModal eventpool={eventPoolDetail} onClose={() => setShowParticipateModal(false)} />
      )}
    </div>
  );
}
