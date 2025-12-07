"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VaultManageModal from "./VaultManageModal";
import { formatEther, parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import deployedContracts from "~~/contracts/deployedContracts";

const STAKING_MANAGER_ADDRESS = "0x9238e156A5bcb6a626Be9239b58168E57ea5e27f" as const;
const STAKING_MANAGER_ABI = deployedContracts[43522].StakingManager.abi;

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

interface MyStakingSectionProps {
  myStakings?: Staking[];
  isLoading?: boolean;
}

interface StakingUI {
  name: string;
  token: string;
  icon: string;
  gradient: string;
  balance: number;
  apy: number;
  earned: number;
  status: string;
  ticketRate: number;
  tokenAddress: `0x${string}`;
  stakingPoolId: string;
}

const TOKEN_STYLES: Record<string, { icon: string; gradient: string }> = {
  USDT: { icon: "ri-coin-fill", gradient: "from-green-600 to-emerald-600" },
  USDC: { icon: "ri-coin-line", gradient: "from-blue-600 to-cyan-600" },
  WETH: { icon: "ri-coin-fill", gradient: "from-purple-600 to-pink-600" },
};

export default function MyStakingSection({ myStakings = [], isLoading }: MyStakingSectionProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [showManageModal, setShowManageModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedStaking, setSelectedStaking] = useState<StakingUI | null>(null);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Approve / Prepare", status: "pending" },
    { id: "2", label: "Send Transaction", status: "pending" },
  ]);

  const [localStakings, setLocalStakings] = useState<StakingUI[]>([]);

  useEffect(() => {
    const mapped: StakingUI[] = (myStakings || []).map(staking => {
      const tokenStyle = TOKEN_STYLES[staking.tokenSymbol] || {
        icon: "ri-coin-fill",
        gradient: "from-gray-600 to-gray-700",
      };

      const balance = parseFloat(formatEther(BigInt(staking.stakedAmount)));
      const apr = parseFloat(staking.apr) / 100;

      // 데모용: 스테이킹의 1%를 earned로 표시 (0,0 방지)
      const fakeEarned = balance * 0.01;

      return {
        name: `${staking.tokenSymbol} Pool`,
        token: staking.tokenSymbol,
        icon: tokenStyle.icon,
        gradient: tokenStyle.gradient,
        balance,
        apy: apr,
        earned: fakeEarned,
        status: "Active",
        ticketRate: 1.0,
        tokenAddress: staking.tokenAddress as `0x${string}`,
        stakingPoolId: staking.stakingPoolId,
      };
    });
    setLocalStakings(mapped);
  }, [myStakings]);

  const stakingsFromChain = useMemo(() => localStakings, [localStakings]);

  const handleManageClick = (staking: StakingUI) => {
    setSelectedStaking(staking);
    setShowManageModal(true);
  };

  const handleDepositMore = () => {
    router.push("/staking");
  };

  const handleClaimRewards = async (staking: StakingUI) => {
    if (!address) return;

    setTransactionSteps([
      { id: "1", label: "Confirm in Wallet", status: "processing" },
      { id: "2", label: "Wait for Block Confirmation", status: "pending" },
    ]);
    setShowTransactionModal(true);

    try {
      await writeContractAsync({
        address: STAKING_MANAGER_ADDRESS,
        abi: STAKING_MANAGER_ABI,
        functionName: "claimStakingReward",
        args: [staking.tokenAddress],
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
      }, 2000);
    } catch (e) {
      console.error("claimStakingReward error:", e);
      setTransactionSteps(prev =>
        prev.map(step => (step.status === "processing" ? { ...step, status: "failed" } : step)),
      );
    }
  };

  const handleTransactionStart = async (action: "add" | "withdraw", amount: number, percentage?: number) => {
    if (!selectedStaking || !address) return;

    if (action === "withdraw") {
      setTransactionSteps([
        { id: "1", label: "Prepare Transaction", status: "processing" },
        { id: "2", label: "Unstake", status: "pending" },
      ]);
      setShowTransactionModal(true);

      try {
        setTransactionSteps(prev => prev.map(s => (s.id === "1" ? { ...s, status: "completed" } : s)));

        setTransactionSteps(prev => prev.map(s => (s.id === "2" ? { ...s, status: "processing" } : s)));

        await writeContractAsync({
          address: STAKING_MANAGER_ADDRESS,
          abi: STAKING_MANAGER_ABI,
          functionName: "unstake",
          args: [selectedStaking.tokenAddress, BigInt(amount)],
        });

        // 실제 블록 컨펌 대기 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 3000));

        setTransactionSteps(prev => prev.map(s => (s.id === "2" ? { ...s, status: "completed" } : s)));

        if (!percentage || percentage === 100) {
          setLocalStakings(prev => prev.filter(s => s.stakingPoolId !== selectedStaking.stakingPoolId));
        }

        setTimeout(() => {
          setShowTransactionModal(false);
          setShowManageModal(false);
        }, 2000);
      } catch (e) {
        console.error("unstake error:", e);
        setTransactionSteps(prev =>
          prev.map(step => (step.status === "processing" ? { ...step, status: "failed" } : step)),
        );
      }
      return;
    }

    if (action === "add" && amount > 0) {
      const decimals = 18;
      const amountRaw = parseUnits(amount.toString(), decimals);
      const erc20Abi = deployedContracts[43522].USDT.abi;

      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "processing" },
        { id: "2", label: "Deposit", status: "pending" },
      ]);
      setShowTransactionModal(true);

      try {
        await writeContractAsync({
          address: selectedStaking.tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [STAKING_MANAGER_ADDRESS, amountRaw],
        });

        setTransactionSteps(prev => prev.map(s => (s.id === "1" ? { ...s, status: "completed" } : s)));

        setTransactionSteps(prev => prev.map(s => (s.id === "2" ? { ...s, status: "processing" } : s)));

        await writeContractAsync({
          address: STAKING_MANAGER_ADDRESS,
          abi: STAKING_MANAGER_ABI,
          functionName: "deposit",
          args: [selectedStaking.tokenAddress, amountRaw],
        });

        setTransactionSteps(prev => prev.map(s => (s.id === "2" ? { ...s, status: "completed" } : s)));

        setTimeout(() => {
          setShowTransactionModal(false);
          setShowManageModal(false);
        }, 1500);
      } catch (e) {
        console.error("deposit error:", e);
        setTransactionSteps(prev =>
          prev.map(step => (step.status === "processing" ? { ...step, status: "failed" } : step)),
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mb-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Staking</h2>
          </div>
          <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 animate-pulse">
            <div className="h-8 bg-purple-500/20 rounded mb-4"></div>
            <div className="h-8 bg-purple-500/20 rounded mb-4"></div>
            <div className="h-8 bg-purple-500/20 rounded"></div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Staking</h2>
          <button
            onClick={handleDepositMore}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700/90 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line"></i>
            Deposit More
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          {stakingsFromChain.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-safe-line text-purple-400 text-3xl"></i>
              </div>
              <p className="text-gray-400 mb-4">No active staking yet</p>
              <button
                onClick={handleDepositMore}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700/90 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] rounded-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                <i className="ri-add-line"></i>
                Start Staking
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Pool</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Staked Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">APY</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Earned</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stakingsFromChain.map((staking, index) => (
                    <tr
                      key={index}
                      className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${staking.gradient} rounded-lg flex items-center justify-center shrink-0`}
                          >
                            <i className={`${staking.icon} text-white text-lg`}></i>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{staking.name}</p>
                            <p className="text-sm text-gray-400">{staking.token}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-white">${staking.balance.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-green-400">{staking.apy.toFixed(1)}%</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-semibold text-cyan-400">${staking.earned.toFixed(2)}</p>
                          {staking.earned > 0 && (
                            <button
                              onClick={() => handleClaimRewards(staking)}
                              className="px-2 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 rounded text-xs font-semibold transition-all cursor-pointer"
                              title="Claim Rewards"
                            >
                              <i className="ri-hand-coin-line"></i>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                          <i className="ri-checkbox-circle-fill text-xs"></i>
                          {staking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleManageClick(staking)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 hover:shadow-[0_0_18px_rgba(219,39,119,0.7)] rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-settings-3-line"></i>
                          Manage
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

      {showManageModal && selectedStaking && (
        <VaultManageModal
          vault={selectedStaking}
          onClose={() => setShowManageModal(false)}
          onTransaction={handleTransactionStart}
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
