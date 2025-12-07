"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventPool } from "../types/EventPool";
// wagmi + rainbowkit 사용하는 경우 예시
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface PrizePoolCardProps {
  pool: EventPool;
}

function formatBpsToPercent(bps: bigint | number) {
  const n = Number(bps);
  return (n / 100).toFixed(2);
}

export default function EventPoolCard({ pool }: PrizePoolCardProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data: detailData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [pool.id ? BigInt(pool.id) : undefined, address ?? undefined] as const,
    query: {
      enabled: !!pool.id && !!address,
    },
  });

  const userInfo = useMemo(() => {
    if (!detailData) return null;
    const [, info] = detailData as any;
    return {
      userPoints: Number(info.userPoints ?? 0n),
      winChance: formatBpsToPercent(info.winRateBps ?? 0n),
    };
  }, [detailData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const difference = pool.nextDraw - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [pool.nextDraw, mounted]);

  const handleViewDetails = () => {
    router.push(`/eventpool-detail/${pool.id}`);
    window.scrollTo(0, 0);
  };

  // 버튼 클릭 핸들러: 연결 여부에 따라 분기
  const handleClickButton = () => {
    if (!isConnected) {
      // 지갑 안 연결됐으면 connect 모달만 열고 종료
      if (openConnectModal) openConnectModal();
      return;
    }
    // 연결돼 있으면 원래 동작
    handleViewDetails();
  };

  const renderParticles = () => {
    if (!mounted) return null;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r ${pool.gradient} rounded-full animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="group relative bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
      {/* Animated Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${pool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* Energy Particles */}
      {renderParticles()}

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
              {pool.name} #{pool.poolNum}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs text-purple-300 font-semibold">
                {pool.frequency}
              </span>
            </div>
          </div>
          <div
            className={`w-14 h-14 bg-gradient-to-br ${pool.gradient} rounded-xl flex items-center justify-center shadow-lg animate-pulse`}
          >
            <i className={`${pool.icon} text-white text-2xl`} />
          </div>
        </div>

        {/* Prize Amount */}
        <div className="text-center py-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          <div className="relative">
            <p className="text-sm text-gray-400 mb-2">Total Prize Pool</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {pool.totalPrize}
              </span>
              <span className="text-2xl font-bold text-purple-400">{pool.currency}</span>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Next Draw In:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#0a0118]/60 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-cyan-400">{timeLeft.days}</div>
              <div className="text-xs text-gray-500 mt-1">Days</div>
            </div>
            <div className="bg-[#0a0118]/60 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-cyan-400">{timeLeft.hours}</div>
              <div className="text-xs text-gray-500 mt-1">Hours</div>
            </div>
            <div className="bg-[#0a0118]/60 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-cyan-400">{timeLeft.minutes}</div>
              <div className="text-xs text-gray-500 mt-1">Mins</div>
            </div>
            <div className="bg-[#0a0118]/60 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-cyan-400 animate-pulse">{timeLeft.seconds}</div>
              <div className="text-xs text-gray-500 mt-1">Secs</div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0118]/40 rounded-lg p-4 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">Your Tickets</p>
            <p className="text-xl font-bold text-white">{userInfo?.userPoints.toLocaleString() ?? 0}</p>
          </div>
          <div className="bg-[#0a0118]/40 rounded-lg p-4 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">Win Chance</p>
            <p className="text-xl font-bold text-green-400">{userInfo?.winChance ?? "0.00"}%</p>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Participants</span>
          <span className="text-white font-semibold">{pool.participants.toLocaleString()}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClickButton}
          className={`w-full py-3 bg-gradient-to-r ${pool.gradient} hover:opacity-90 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap`}
        >
          <i className="ri-ticket-fill text-lg" />
          {isConnected ? "View Prize Details" : "Connect wallet"}
          <i className="ri-arrow-right-line" />
        </button>
      </div>

      {/* Corner Sparkle Effect */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full blur-sm animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
      <div
        className="absolute bottom-4 left-4 w-2 h-2 bg-pink-400 rounded-full blur-sm animate-ping opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  );
}
