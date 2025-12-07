"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import deployedContracts from "~~/contracts/deployedContracts";

interface Staking {
  stakingPoolId: string;
  poolName: string;
  tokenSymbol: string;
  tokenAddress: string;
  stakedAmount: string;
  apr: string;
  earned: string;
  stakedAt: number;
  lastClaimAt: number;
}

interface UnclaimedRewards {
  fixedAprRewards: string;
  eventPoolPrizes: string;
  totalUnclaimed: string;
}

interface SummarySectionProps {
  myStakings?: Staking[];
  unclaimedRewards?: UnclaimedRewards;
  isLoading?: boolean;
  onRewardsClaimed?: () => void;
}

const REWARDS_MANAGER_ADDRESS = deployedContracts[43522].RewardsManager.address as `0x${string}`;
const REWARDS_MANAGER_ABI = deployedContracts[43522].RewardsManager.abi;

const TOKEN_ICON_MAP: Record<string, { icon: string; gradient: string }> = {
  USDT: { icon: "ri-coin-fill", gradient: "bg-green-500/20 text-green-400" },
  USDC: { icon: "ri-coin-line", gradient: "bg-blue-500/20 text-blue-400" },
  WETH: { icon: "ri-coin-fill", gradient: "bg-purple-500/20 text-purple-400" },
};

export default function SummarySection({
  myStakings = [],
  unclaimedRewards,
  isLoading,
  onRewardsClaimed,
}: SummarySectionProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Confirm in Wallet", status: "pending" },
    { id: "2", label: "Wait for Block Confirmation", status: "pending" },
  ]);

  // Calculate total staked in USD (assuming 1:1 for stablecoins, ETH needs price)
  const totalStakedUSD = myStakings.reduce((sum, staking) => {
    const amount = parseFloat(formatEther(BigInt(staking.stakedAmount)));
    // For demo, treating all as 1:1 USD equivalent
    return sum + amount;
  }, 0);

  // Parse unclaimed rewards
  const fixedAprRewardsUSD = unclaimedRewards ? parseFloat(formatEther(BigInt(unclaimedRewards.fixedAprRewards))) : 0;
  const eventPrizesUSD = unclaimedRewards ? parseFloat(formatEther(BigInt(unclaimedRewards.eventPoolPrizes))) : 0;
  const totalUnclaimedUSD = unclaimedRewards ? parseFloat(formatEther(BigInt(unclaimedRewards.totalUnclaimed))) : 0;

  const handleClaimAllRewards = async () => {
    if (!address || totalUnclaimedUSD === 0) return;

    setTransactionSteps([
      { id: "1", label: "Confirm in Wallet", status: "processing" },
      { id: "2", label: "Wait for Block Confirmation", status: "pending" },
    ]);
    setShowTransactionModal(true);

    try {
      await writeContractAsync({
        address: REWARDS_MANAGER_ADDRESS,
        abi: REWARDS_MANAGER_ABI,
        functionName: "claimAll",
        args: [],
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

      setTimeout(() => {
        setShowTransactionModal(false);
        if (onRewardsClaimed) {
          onRewardsClaimed();
        }
      }, 2000);
    } catch (e) {
      console.error("claimAll error:", e);
      setTransactionSteps(prev =>
        prev.map(step => (step.status === "processing" ? { ...step, status: "failed" } : step)),
      );
    }
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 animate-pulse">
            <div className="h-8 bg-purple-500/20 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-purple-500/20 rounded w-3/4"></div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/40 via-pink-800/30 to-pink-900/40 backdrop-blur-sm rounded-2xl border border-pink-500/30 p-8 animate-pulse">
            <div className="h-8 bg-pink-500/20 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-pink-500/20 rounded w-3/4"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Staked Assets */}
        <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-300 text-base font-semibold">Total Staked Assets</h3>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-safe-fill text-purple-400 text-2xl"></i>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-bold text-white">${totalStakedUSD.toFixed(2)}</span>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            {myStakings.length === 0 ? (
              <p className="text-sm text-gray-400">No active stakings</p>
            ) : (
              myStakings.map((staking, idx) => {
                const amountUSD = parseFloat(formatEther(BigInt(staking.stakedAmount)));
                const tokenInfo = TOKEN_ICON_MAP[staking.tokenSymbol] || {
                  icon: "ri-coin-fill",
                  gradient: "bg-gray-500/20 text-gray-400",
                };
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${tokenInfo.gradient} rounded-full flex items-center justify-center shrink-0`}
                      >
                        <i className={`${tokenInfo.icon} text-sm`}></i>
                      </div>
                      <span className="text-gray-300 font-medium">{staking.tokenSymbol}</span>
                    </div>
                    <span className="text-white font-semibold text-base">${amountUSD.toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Unclaimed Rewards */}
        <div className="bg-gradient-to-br from-pink-900/40 via-pink-800/30 to-pink-900/40 backdrop-blur-sm rounded-2xl border border-pink-500/30 p-8 hover:border-pink-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-300 text-base font-semibold">Unclaimed Rewards</h3>
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-gift-fill text-pink-400 text-2xl"></i>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-pink-400">${totalUnclaimedUSD.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400 mb-8">APY Returns + Prizes</p>

          {/* Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-percent-line text-cyan-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Fixed APY Returns</span>
              </div>
              <span className="text-white font-semibold text-base">${fixedAprRewardsUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-trophy-line text-yellow-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Prize Winnings</span>
              </div>
              <span className="text-white font-semibold text-base">${eventPrizesUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-gift-2-line text-pink-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Bonus Rewards</span>
              </div>
              <span className="text-white font-semibold text-base">$0.00</span>
            </div>
          </div>

          {/* Claim Button */}
          {totalUnclaimedUSD > 0 && (
            <button
              onClick={handleClaimAllRewards}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 hover:shadow-[0_0_20px_rgba(219,39,119,0.6)] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="ri-hand-coin-fill text-xl"></i>
              Claim All Rewards
            </button>
          )}
        </div>
      </div>

      {/* Transaction Progress Modal */}
      {showTransactionModal && (
        <TransactionProgressModal
          isOpen={showTransactionModal}
          steps={transactionSteps}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </section>
  );
}
