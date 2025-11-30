"use client";

import { useState } from "react";
import HeroSection from "./components/HeroSection";
import MyVaultsSection from "./components/MyVaultsSection";
import PrizeParticipationModal from "./components/PrizeParticipationModal";
import PrizeStatusSection from "./components/PrizeStatusSection";
import PrizeWinningsModal from "./components/PrizeWinningsModal";
import SummarySection from "./components/SummarySection";
import VaultManageModal from "./components/VaultManageModal";
import VaultRewardsModal from "./components/VaultRewardsModal";
import { ToastContainer } from "~~/components/ToastNotification";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useToast } from "~~/hooks/useToast";

export default function Dashboard() {
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

  const simulateTransaction = () => {
    setShowTransactionProgress(true);
    setTransactionSteps([
      { id: "1", label: "Approve Token", status: "processing" },
      { id: "2", label: "Send Transaction", status: "pending" },
    ]);

    // Simulate approve step
    setTimeout(() => {
      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "completed" },
        { id: "2", label: "Send Transaction", status: "processing" },
      ]);

      // Simulate transaction step
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
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Stars Background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          ></div>
        ))}
      </div>

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <HeroSection />
          <SummarySection />
          <MyVaultsSection />
          <PrizeStatusSection />
        </div>
      </main>

      {/* Modals */}
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
