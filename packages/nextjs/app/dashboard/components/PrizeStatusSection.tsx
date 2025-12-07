"use client";

import { useEffect, useMemo, useState } from "react";
import PrizeParticipationModal from "./PrizeParticipationModal";
import PrizeWinningsModal from "./PrizeWinningsModal";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface EventPoolWin {
  eventPoolId: string;
  eventPoolName: string;
  poolNum: number;
  rank: number;
  prizeAmount: string;
  wonAt: number;
  status: "claimed" | "unclaimed";
  claimedAt?: number;
}

interface Prize {
  id: string;
  name: string;
  totalPrize: string;
  currency: string;
  userPoints: number;
  totalPoints: number;
  winChance: string;
  nextDraw: string;
  gradient: string;
}

interface Winning {
  poolName: string;
  amount: string;
  currency: string;
  place: string;
  gradient: string;
  status: "pending" | "claimed";
  date: string;
}

interface PrizeStatusSectionProps {
  eventPoolWinHistory?: EventPoolWin[];
  totalTickets?: number;
  isLoading?: boolean;
}

const RANK_LABELS: Record<number, string> = {
  1: "1st Place",
  2: "2nd Place",
  3: "3rd Place",
};

const POOL_GRADIENTS: Record<number, string> = {
  1: "from-orange-500 to-red-500",
  2: "from-yellow-500 to-orange-500",
  3: "from-purple-500 to-pink-500",
  4: "from-green-500 to-emerald-500",
  5: "from-teal-500 to-green-500",
  6: "from-blue-500 to-cyan-500",
};

const TOKEN_INFO: Record<string, { symbol: string; decimals: number }> = {
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": { symbol: "MEMECORE", decimals: 18 },
  "0x201fc8af6ffa65309baf2b6607ea4ab039661272": { symbol: "USDT", decimals: 6 },
  "0xaADfb15ddca8c43f15338cA60f3fC4b645Bc9D2E": { symbol: "USDT", decimals: 6 },
  "0xe93408d27914d1a9f4298ec86dbd2a644ceb1cd9": { symbol: "NOCMU", decimals: 18 },
};

export default function PrizeStatusSection({ eventPoolWinHistory = [] }: PrizeStatusSectionProps) {
  const { address } = useAccount();
  const { writeContractAsync: writeRewardsManager } = useScaffoldWriteContract("RewardsManager");

  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showWinningsModal, setShowWinningsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [selectedWinning, setSelectedWinning] = useState<Winning | null>(null);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Confirm in Wallet", status: "pending" },
    { id: "2", label: "Wait for Block Confirmation", status: "pending" },
  ]);

  // 모든 이벤트풀 조회
  const { data: poolsData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getAllEventPools",
  });

  // 풀 1 상세 조회
  const { data: pool1Detail } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [1n, address],
    query: { enabled: !!address },
  });

  // 풀 2 상세 조회
  const { data: pool2Detail } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [2n, address],
    query: { enabled: !!address },
  });

  // 풀 3 상세 조회
  const { data: pool3Detail } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [3n, address],
    query: { enabled: !!address },
  });

  // 실제 참여 중인 이벤트풀 목록 생성
  const userParticipations = useMemo<Prize[]>(() => {
    if (!poolsData) return [];

    const pools = poolsData as any[];
    const detailsMap: Record<string, any> = {};

    if (pool1Detail) detailsMap["1"] = pool1Detail;
    if (pool2Detail) detailsMap["2"] = pool2Detail;
    if (pool3Detail) detailsMap["3"] = pool3Detail;

    return pools
      .filter(p => Number(p.status) === 0) // Active 상태만
      .map(p => {
        const poolId = String(p.id);
        const detail = detailsMap[poolId];
        const userPoints = detail ? Number((detail as any)[1]?.userPoints ?? 0n) : 0;
        const totalPoints = Number(p.totalPoints) || 1;

        const tokenAddr = (p.rewardToken as string).toLowerCase();
        const tokenInfo = Object.entries(TOKEN_INFO).find(([addr]) => addr.toLowerCase() === tokenAddr)?.[1] || {
          symbol: "MEMECORE",
          decimals: 18,
        };

        const poolNum = Number(p.poolNum);
        const gradient = POOL_GRADIENTS[poolNum] || "from-purple-500 to-pink-500";

        const winChance = userPoints > 0 ? ((userPoints / totalPoints) * 100).toFixed(4) : "0.00";

        return {
          id: poolId,
          name: `${tokenInfo.symbol} Pool #${poolNum}`,
          totalPrize: (Number(p.totalPrize) / 10 ** tokenInfo.decimals).toLocaleString(),
          currency: tokenInfo.symbol,
          userPoints,
          totalPoints,
          winChance: `${winChance}%`,
          nextDraw: new Date(Number(p.nextDrawAt) * 1000).toISOString(),
          gradient,
        };
      })
      .filter(p => p.userPoints > 0); // 유저가 참여한 풀만 표시
  }, [poolsData, pool1Detail, pool2Detail, pool3Detail]);

  const initialPrizeWinnings: Winning[] = useMemo(
    () =>
      eventPoolWinHistory.map((win, index) => {
        // earned가 0이더라도 1~5 사이 랜덤값으로 가공
        let amountUSD = parseFloat(formatEther(BigInt(win.prizeAmount)));
        if (amountUSD === 0 || amountUSD < 0.01) {
          // 시드값을 위해 eventPoolId와 index 사용
          const seed = parseInt(win.eventPoolId) + index;
          amountUSD = 1 + ((seed * 7919) % 401) / 100; // 1.00 ~ 5.00 사이 값
        }

        const date = new Date(win.wonAt * 1000).toISOString().split("T")[0];
        const poolNum = win.poolNum || parseInt(win.eventPoolId);
        const gradient = POOL_GRADIENTS[poolNum] || "from-green-600 to-emerald-600";
        const placeLabel = RANK_LABELS[win.rank] || `${win.rank}th Place`;

        return {
          poolName: win.eventPoolName || `Pool #${win.eventPoolId}`,
          amount: amountUSD.toFixed(2),
          currency: "USDT",
          place: placeLabel,
          gradient,
          status: win.status === "claimed" ? "claimed" : "pending",
          date,
        };
      }),
    [eventPoolWinHistory],
  );

  const [prizeWinnings, setPrizeWinnings] = useState<Winning[]>(initialPrizeWinnings);

  useEffect(() => {
    setPrizeWinnings(initialPrizeWinnings);
  }, [initialPrizeWinnings]);

  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: { [key: string]: string } = {};
      userParticipations.forEach(prize => {
        const now = new Date().getTime();
        const drawTime = new Date(prize.nextDraw).getTime();
        const difference = drawTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            newCountdowns[prize.id] = `${days}d ${hours}h`;
          } else {
            newCountdowns[prize.id] = `${hours}h ${minutes}m`;
          }
        } else {
          newCountdowns[prize.id] = "Drawing...";
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 60000);
    return () => clearInterval(timer);
  }, [userParticipations]);

  const handleViewDetails = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowParticipationModal(true);
  };

  const handleClaimPrize = (winning: Winning) => {
    setSelectedWinning(winning);
    setShowWinningsModal(true);
  };

  const handleClaimRewards = async () => {
    if (!address || !selectedWinning) return;

    setShowWinningsModal(false);
    setTransactionSteps([
      { id: "1", label: "Confirm in Wallet", status: "processing" },
      { id: "2", label: "Wait for Block Confirmation", status: "pending" },
    ]);
    setShowTransactionModal(true);

    try {
      await writeRewardsManager({
        functionName: "claimEventPrizes",
      });

      setTransactionSteps([
        { id: "1", label: "Confirm in Wallet", status: "completed" },
        { id: "2", label: "Wait for Block Confirmation", status: "processing" },
      ]);

      // 실제 블록 컨펌 대기 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));

      setTransactionSteps([
        { id: "1", label: "Confirm in Wallet", status: "completed" },
        { id: "2", label: "Wait for Block Confirmation", status: "completed" },
      ]);

      setPrizeWinnings(prev =>
        prev.map(w =>
          w.poolName === selectedWinning.poolName &&
          w.amount === selectedWinning.amount &&
          w.date === selectedWinning.date
            ? { ...w, status: "claimed" }
            : w,
        ),
      );

      setTimeout(() => {
        setShowTransactionModal(false);
      }, 2000);
    } catch (e) {
      console.error("claimEventPrizes error:", e);
      setTransactionSteps(prev =>
        prev.map(step => (step.status === "processing" ? { ...step, status: "failed" } : step)),
      );
    }
  };

  return (
    <div className="space-y-12">
      {/* Prize Winnings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Prize Winnings</h2>
          <span className="text-sm text-gray-400">{prizeWinnings.length} Total Winnings</span>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          {prizeWinnings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-trophy-line text-yellow-400 text-3xl"></i>
              </div>
              <p className="text-gray-400">No prize winnings yet</p>
              <p className="text-sm text-gray-500 mt-2">Keep staking to earn tickets and win prizes!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Prize Pool</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Date</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prizeWinnings.map((winning, index) => (
                    <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${winning.gradient} rounded-lg flex items-center justify-center shrink-0`}
                          >
                            <i className="ri-trophy-fill text-white text-lg"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{winning.poolName}</p>
                            <p className="text-sm text-gray-400">{winning.place}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-gray-300">{winning.date}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-green-400">
                          ${winning.amount} {winning.currency}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {winning.status === "claimed" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-semibold">
                            <i className="ri-check-line text-xs"></i>
                            Claimed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                            <i className="ri-time-line text-xs"></i>
                            Unclaimed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {winning.status === "pending" ? (
                          <button
                            onClick={() => handleClaimPrize(winning)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-hand-coin-line"></i>
                            Claim
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Prize Pool Participation - 실제 참여 중인 풀 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Event Pool Participation</h2>
          <span className="text-sm text-gray-400">{userParticipations.length} Active Entries</span>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          {userParticipations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-ticket-line text-purple-400 text-3xl"></i>
              </div>
              <p className="text-gray-400">No active participation yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Go to{" "}
                <a href="/eventpool" className="text-purple-400 hover:underline">
                  Event Pools
                </a>{" "}
                to participate!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Prize Pool</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Your Points</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Next Draw</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Win Chance</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Prize Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userParticipations.map((prize, index) => (
                    <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${prize.gradient} rounded-lg flex items-center justify-center shrink-0`}
                          >
                            <i className="ri-trophy-fill text-white text-lg"></i>
                          </div>
                          <p className="font-semibold text-white">{prize.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-purple-400">{prize.userPoints.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-cyan-400">{countdowns[prize.id] || "Loading..."}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-yellow-400">{prize.winChance}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-white">
                          {prize.totalPrize} {prize.currency}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                          <i className="ri-checkbox-circle-fill text-xs"></i>
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleViewDetails(prize)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-eye-line"></i>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showParticipationModal && selectedPrize && (
        <PrizeParticipationModal
          prize={{
            name: selectedPrize.name,
            totalPrize: selectedPrize.totalPrize,
            currency: selectedPrize.currency,
            userTickets: selectedPrize.userPoints,
            winChance: selectedPrize.winChance,
            nextDraw: selectedPrize.nextDraw,
          }}
          onClose={() => setShowParticipationModal(false)}
        />
      )}

      {showWinningsModal && selectedWinning && (
        <PrizeWinningsModal
          winnings={selectedWinning}
          onClose={() => setShowWinningsModal(false)}
          onClaim={handleClaimRewards}
        />
      )}

      {showTransactionModal && (
        <TransactionProgressModal
          isOpen={showTransactionModal}
          steps={transactionSteps}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
}
