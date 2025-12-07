"use client";

import { useMemo, useState } from "react";
import HeroSection from "./components/HeroSection";
import MyStakingSection from "./components/MyStakingSection";
import PrizeParticipationModal from "./components/PrizeParticipationModal";
import PrizeStatusSection from "./components/PrizeStatusSection";
import PrizeWinningsModal from "./components/PrizeWinningsModal";
import SummarySection from "./components/SummarySection";
import VaultManageModal from "./components/VaultManageModal";
import VaultRewardsModal from "./components/VaultRewardsModal";
import { useAccount } from "wagmi";
import CosmicBackground from "~~/components/CosmicBackground";
import StarsBackground from "~~/components/StarsBackground";
import { ToastContainer } from "~~/components/ToastNotification";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useToast } from "~~/hooks/useToast";

export default function Dashboard() {
  const { address } = useAccount();
  const [showVaultManageModal, setShowVaultManageModal] = useState(false);
  const [showVaultRewardsModal, setShowVaultRewardsModal] = useState(false);
  const [showPrizeParticipationModal, setShowPrizeParticipationModal] = useState(false);
  const [showPrizeWinningsModal, setShowPrizeWinningsModal] = useState(false);
  const [showTransactionProgress, setShowTransactionProgress] = useState(false);

  const { toasts, removeToast, success } = useToast();

  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Approve Token", status: "pending" },
    { id: "2", label: "Send Transaction", status: "pending" },
  ]);

  const {
    data: userInfoData,
    isLoading: isUserInfoLoading,
    error: userInfoError,
  } = useScaffoldReadContract({
    contractName: "UserDashboard",
    functionName: "getUserInfo",
    args: [address],
    query: {
      enabled: !!address,
    },
  } as const);

  console.log("Dashboard address →", address);
  console.log("UserDashboard raw data →", userInfoData);
  console.log("UserDashboard loading/error →", isUserInfoLoading, userInfoError);

  const userInfo = useMemo(() => {
    if (!userInfoData) return null;
    const ui = userInfoData as any;
    console.log("ui inside useMemo →", ui);

    const totalTickets = Number(ui.totalTickets ?? 0);

    const myStakings = (ui.myStakings as any[]).map(s => ({
      stakingPoolId: String(s.stakingPoolId),
      poolName: s.poolName as string,
      tokenSymbol: s.tokenSymbol as string,
      tokenAddress: s.tokenAddress as string,
      stakedAmount: s.stakedAmount.toString(),
      apr: s.apr.toString(),
      earned: s.earned.toString(),
      stakedAt: Number(s.stakedAt),
      lastClaimAt: Number(s.lastClaimAt),
    }));

    const unclaimedRewards = {
      fixedAprRewards: ui.unclaimedRewards.fixedAprRewards.toString(),
      eventPoolPrizes: ui.unclaimedRewards.eventPoolPrizes.toString(),
      totalUnclaimed: ui.unclaimedRewards.totalUnclaimed.toString(),
    };

    const eventPoolWinHistory = (ui.eventPoolWinHistory as any[]).map(w => ({
      eventPoolId: String(w.eventPoolId),
      eventPoolName: "",
      poolNum: Number(w.poolNum),
      rank: Number(w.rank),
      prizeAmount: w.prizeAmount.toString(),
      wonAt: Number(w.wonAt),
      status: (w.status === 1 ? "claimed" : "unclaimed") as "claimed" | "unclaimed",
      claimedAt: Number(w.claimedAt ?? 0) || undefined,
    }));

    return {
      userWalletAddress: address,
      totalTickets,
      myStakings,
      unclaimedRewards,
      eventPoolWinHistory,
      eventPoolParticipations: [] as any[],
    };
  }, [userInfoData, address]);

  console.log("UserDashboard.getUserInfo (mapped) →", userInfo);

  const simulateTransaction = () => {
    setShowTransactionProgress(true);
    setTransactionSteps([
      { id: "1", label: "Approve Token", status: "processing" },
      { id: "2", label: "Send Transaction", status: "pending" },
    ]);

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
          setShowTransactionProgress(false);
          success("Transaction Successful!", "Your deposit has been confirmed");
        }, 1500);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      <CosmicBackground />
      <StarsBackground />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <HeroSection />
          <SummarySection
            myStakings={userInfo?.myStakings}
            unclaimedRewards={userInfo?.unclaimedRewards}
            isLoading={isUserInfoLoading}
          />
          <MyStakingSection myStakings={userInfo?.myStakings} isLoading={isUserInfoLoading} />
          <PrizeStatusSection
            eventPoolWinHistory={userInfo?.eventPoolWinHistory}
            totalTickets={userInfo?.totalTickets}
            isLoading={isUserInfoLoading}
          />
        </div>
      </main>

      {showVaultManageModal && (
        <VaultManageModal
          vault={{
            name: "USDT Vault",
            token: "USDT",
            icon: "ri-coin-fill",
            gradient: "from-green-600 to-emerald-600",
            balance: 1250.5,
            apy: 12.5,
            ticketRate: 1.0,
          }}
          onClose={() => setShowVaultManageModal(false)}
          onTransaction={simulateTransaction}
        />
      )}

      {showVaultRewardsModal && (
        <VaultRewardsModal
          rewards={[
            { token: "USDT", amount: 0.0001, icon: "ri-coin-fill", gradient: "from-green-600 to-emerald-600" },
            { token: "USDC", amount: 0.0002, icon: "ri-coin-line", gradient: "from-blue-600 to-cyan-600" },
            { token: "WETH", amount: 0.0000123, icon: "ri-coin-fill", gradient: "from-purple-600 to-pink-600" },
            { token: "MEME", amount: 0.4299, icon: "ri-coin-fill", gradient: "from-yellow-600 to-orange-600" },
          ]}
          totalValue={125.5}
          onClose={() => setShowVaultRewardsModal(false)}
          onClaim={simulateTransaction}
        />
      )}

      {showPrizeParticipationModal && (
        <PrizeParticipationModal
          prize={{
            name: "Ethereum Grand Prize",
            totalPrize: "11,585",
            currency: "ETH",
            userTickets: 1247,
            winChance: "0.0234%",
            nextDraw: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          }}
          onClose={() => setShowPrizeParticipationModal(false)}
        />
      )}

      {showPrizeWinningsModal && (
        <PrizeWinningsModal
          winnings={{
            poolName: "Weekly Mega Pool",
            amount: "450.00",
            currency: "USDC",
            place: "3rd Place",
            gradient: "from-blue-600 to-cyan-600",
            status: "pending",
          }}
          onClose={() => setShowPrizeWinningsModal(false)}
          onClaim={simulateTransaction}
        />
      )}

      <TransactionProgressModal
        isOpen={showTransactionProgress}
        steps={transactionSteps}
        onClose={() => setShowTransactionProgress(false)}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
