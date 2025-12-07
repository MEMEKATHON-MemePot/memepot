import { useEffect, useMemo, useState } from "react";
import PrizeParticipationModal from "./PrizeParticipationModal";
import PrizeWinningsModal from "./PrizeWinningsModal";
import { formatEther } from "viem";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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
  name: string;
  totalPrize: string;
  currency: string;
  userTickets: number;
  winChance: string;
  nextDraw: string;
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

const POOL_GRADIENTS: Record<string, string> = {
  Daily: "from-green-600 to-emerald-600",
  Weekly: "from-blue-600 to-cyan-600",
  Monthly: "from-purple-600 to-pink-600",
};

const TOKEN_INFO: Record<string, { symbol: string; decimals: number }> = {
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": { symbol: "MEMECORE", decimals: 18 },
  "0x201fC8Af6FFa65309BaF2b6607ea4ab039661272": { symbol: "USDT", decimals: 6 },
  "0xe93408d27914d1a9f4298ec86Dbd2A644CeB1cD9": { symbol: "NOCMU", decimals: 18 },
};

export default function PrizeStatusSection({ eventPoolWinHistory = [], totalTickets = 0 }: PrizeStatusSectionProps) {
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showWinningsModal, setShowWinningsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [selectedWinning, setSelectedWinning] = useState<Winning | null>(null);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Approve Token", status: "pending" },
    { id: "2", label: "Send Transaction", status: "pending" },
  ]);

  // Fetch active event pools from contract
  const { data: poolsData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getAllEventPools",
  });

  const activePrizes = useMemo<Prize[]>(() => {
    if (!poolsData || !totalTickets) return [];

    return (poolsData as any[])
      .filter(p => Number(p.status) === 0) // Only active pools
      .map(p => {
        const tokenAddr = (p.rewardToken as string).toLowerCase();
        const tokenInfo = Object.entries(TOKEN_INFO).find(([addr]) => addr.toLowerCase() === tokenAddr)?.[1] || {
          symbol: "MEMECORE",
          decimals: 18,
        };

        const totalPoolPoints = Number(p.totalPoints) || 1;
        const winChance = totalTickets > 0 ? ((totalTickets / totalPoolPoints) * 100).toFixed(2) : "0.00";

        return {
          name: `${tokenInfo.symbol} Pool`,
          totalPrize: (Number(p.totalPrize) / 10 ** tokenInfo.decimals).toLocaleString(),
          currency: tokenInfo.symbol,
          userTickets: totalTickets,
          winChance: `${winChance}%`,
          nextDraw: new Date(Number(p.nextDrawAt) * 1000).toISOString(),
        };
      });
  }, [poolsData, totalTickets]);

  // on-chain win history → UI
  const prizeWinnings: Winning[] = useMemo(
    () =>
      eventPoolWinHistory.map(win => {
        const amountUSD = parseFloat(formatEther(BigInt(win.prizeAmount)));
        const date = new Date(win.wonAt * 1000).toISOString().split("T")[0];
        const poolType = win.eventPoolName || "Daily";
        const gradient = POOL_GRADIENTS[poolType] || "from-green-600 to-emerald-600";
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

  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: { [key: string]: string } = {};
      activePrizes.forEach(prize => {
        const now = new Date().getTime();
        const drawTime = new Date(prize.nextDraw).getTime();
        const difference = drawTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            newCountdowns[prize.name] = `${days}d ${hours}h`;
          } else {
            newCountdowns[prize.name] = `${hours}h ${minutes}m`;
          }
        } else {
          newCountdowns[prize.name] = "Drawing...";
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 60000);
    return () => clearInterval(timer);
  }, [activePrizes]);

  const handleViewDetails = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowParticipationModal(true);
  };

  const handleClaimPrize = (winning: Winning) => {
    setSelectedWinning(winning);
    setShowWinningsModal(true);
  };

  const handleTransactionStart = () => {
    setShowWinningsModal(false);

    setTransactionSteps([
      { id: "1", label: "Approve Token", status: "processing" },
      { id: "2", label: "Send Transaction", status: "pending" },
    ]);
    setShowTransactionModal(true);

    setTimeout(() => {
      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "completed" },
        { id: "2", label: "Send Transaction", status: "processing" },
      ]);

      setTimeout(() => {
        setTransactionSteps([
          { id: "1", label: "Approve Token", status: "completed" },
          { id: "2", label: "Send Transaction", status: "completed" },
        ]);

        setTimeout(() => {
          setShowTransactionModal(false);
          // 실제 claimed 상태 반영은 나중에 on-chain refetch로 처리
        }, 1500);
      }, 2000);
    }, 2000);
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

      {/* Prize Pool Participation */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Prize Pool Participation</h2>
          <span className="text-sm text-gray-400">{activePrizes.length} Active Entries</span>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Prize Pool</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Your Tickets</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Next Draw</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Win Chance</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Prize Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {activePrizes.map((prize, index) => (
                  <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                          <i className="ri-trophy-fill text-white text-lg"></i>
                        </div>
                        <p className="font-semibold text-white">{prize.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-purple-400">{prize.userTickets}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-cyan-400">{countdowns[prize.name] || "Loading..."}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-yellow-400">{prize.winChance}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-white">
                        ${prize.totalPrize} {prize.currency}
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
        </div>
      </section>

      {/* Modals */}
      {showParticipationModal && selectedPrize && (
        <PrizeParticipationModal prize={selectedPrize} onClose={() => setShowParticipationModal(false)} />
      )}

      {showWinningsModal && selectedWinning && (
        <PrizeWinningsModal
          winnings={selectedWinning}
          onClose={() => setShowWinningsModal(false)}
          onClaim={handleTransactionStart}
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
