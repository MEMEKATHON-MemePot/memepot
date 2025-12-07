"use client";

import { useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { useAccount } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  gradient: string;
}

const TOKENS: Token[] = [
  {
    symbol: "MEME",
    name: "Memecore",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x681E7bb993F3a6f5710f177A45514Ec5b9cd330E",
    decimals: 6,
    icon: "ri-money-dollar-circle-fill",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x0D651A847C150d0eE1DB767E661E417dB5E2B09a",
    decimals: 6,
    icon: "ri-coin-line",
    gradient: "from-blue-600 to-cyan-600",
  },
];

export default function SwapPage() {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([]);

  // Mock exchange rate (in production, fetch from AMM/DEX)
  const EXCHANGE_RATE = 0.05; // 1 MEME = 0.05 USDT

  const { writeContractAsync: writeUSDT } = useScaffoldWriteContract({ contractName: "USDT" });
  const { writeContractAsync: writeUSDC } = useScaffoldWriteContract({ contractName: "USDC" });

  // Get token balance
  const { data: memeBalance } = useScaffoldReadContract({
    contractName: "VaultManager",
    functionName: "getUserBalance",
    args: [address, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"],
  });

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      // Calculate toAmount based on exchange rate
      const calculatedTo = parseFloat(value) * EXCHANGE_RATE;
      setToAmount(calculatedTo.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);

    // Recalculate amounts
    if (toAmount) {
      const newFromAmount = parseFloat(toAmount);
      setFromAmount(newFromAmount.toString());
      const newToAmount = newFromAmount * EXCHANGE_RATE;
      setToAmount(newToAmount.toFixed(6));
    }
  };

  const handleMaxClick = () => {
    if (memeBalance && fromToken.symbol === "MEME") {
      const formattedBalance = formatUnits(memeBalance as bigint, fromToken.decimals);
      handleFromAmountChange(formattedBalance);
    } else {
      handleFromAmountChange("1000"); // Mock balance for other tokens
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "processing" },
        { id: "2", label: "Execute Swap", status: "pending" },
      ]);
      setShowTransactionModal(true);

      // Mock swap transaction
      // In production, this would call a DEX router contract
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "completed" },
        { id: "2", label: "Execute Swap", status: "processing" },
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "completed" },
        { id: "2", label: "Execute Swap", status: "completed" },
      ]);

      setTimeout(() => {
        setShowTransactionModal(false);
        setFromAmount("");
        setToAmount("");
      }, 1500);
    } catch (error) {
      console.error("Swap failed:", error);
      setTransactionSteps(prev => prev.map(step => ({ ...step, status: "failed" as const })));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Swap Tokens
          </h1>
          <p className="text-gray-400 text-lg">Exchange tokens instantly on Memecore Network</p>
        </div>

        {/* Swap Card */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
          {/* From Token */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-3">From</label>
            <div className="bg-[#0a0118]/60 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${fromToken.gradient} rounded-lg flex items-center justify-center`}>
                    <i className={`${fromToken.icon} text-white text-xl`}></i>
                  </div>
                  <div>
                    <p className="font-bold text-white">{fromToken.symbol}</p>
                    <p className="text-xs text-gray-400">{fromToken.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleMaxClick}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all"
                >
                  MAX
                </button>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={e => handleFromAmountChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                placeholder="0.0"
              />
              <p className="text-sm text-gray-400 mt-2">Balance: 1,000.00</p>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 z-10 relative">
            <button
              onClick={handleSwapTokens}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            >
              <i className="ri-arrow-up-down-line text-2xl"></i>
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">To</label>
            <div className="bg-[#0a0118]/60 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${toToken.gradient} rounded-lg flex items-center justify-center`}>
                  <i className={`${toToken.icon} text-white text-xl`}></i>
                </div>
                <div>
                  <p className="font-bold text-white">{toToken.symbol}</p>
                  <p className="text-xs text-gray-400">{toToken.name}</p>
                </div>
              </div>
              <input
                type="number"
                value={toAmount}
                readOnly
                className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                placeholder="0.0"
              />
              <p className="text-sm text-gray-400 mt-2">Balance: 500.00</p>
            </div>
          </div>

          {/* Exchange Rate Info */}
          {fromAmount && toAmount && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Exchange Rate</span>
                <span className="font-bold text-white">
                  1 {fromToken.symbol} = {EXCHANGE_RATE} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-300">Price Impact</span>
                <span className="text-green-400 font-semibold">&lt; 0.01%</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-300">Network Fee</span>
                <span className="text-white font-semibold">~0.0001 MEME</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {!address ? "Connect Wallet" : "Swap Tokens"}
          </button>

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-information-fill text-cyan-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-cyan-400 mb-1">Instant Swap</h4>
                <p className="text-sm text-gray-300">
                  Swaps are executed instantly on Memecore Network with minimal fees. Always verify the exchange rate
                  before confirming.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Swaps */}
        <div className="mt-8 bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-xl font-bold mb-4">Recent Swaps</h3>
          <div className="space-y-3">
            {[
              { from: "100 MEME", to: "5 USDT", time: "2 minutes ago" },
              { from: "50 USDT", to: "1000 MEME", time: "15 minutes ago" },
              { from: "200 MEME", to: "10 USDC", time: "1 hour ago" },
            ].map((swap, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0a0118]/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="ri-arrow-right-line text-purple-400"></i>
                  <span className="text-white font-semibold">{swap.from}</span>
                  <i className="ri-arrow-right-line text-gray-500"></i>
                  <span className="text-cyan-400 font-semibold">{swap.to}</span>
                </div>
                <span className="text-sm text-gray-400">{swap.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
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
