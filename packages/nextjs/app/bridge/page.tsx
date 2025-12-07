"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";

interface Chain {
  id: number;
  name: string;
  icon: string;
  gradient: string;
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
  gradient: string;
}

const CHAINS: Chain[] = [
  {
    id: 43522,
    name: "Memecore (Insectarium)",
    icon: "ri-links-line",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: 1,
    name: "Ethereum Mainnet",
    icon: "ri-space-ship-line",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "ri-polygon-line",
    gradient: "from-purple-700 to-indigo-600",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "ri-archive-line",
    gradient: "from-blue-700 to-sky-600",
  },
];

const TOKENS: Token[] = [
  {
    symbol: "MEME",
    name: "Memecore",
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "ri-copper-diamond-line",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: "ri-money-dollar-circle-fill",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "ri-coin-line",
    gradient: "from-blue-600 to-cyan-600",
  },
];

export default function BridgePage() {
  const { address } = useAccount();
  const [fromChain, setFromChain] = useState<Chain>(CHAINS[0]);
  const [toChain, setToChain] = useState<Chain>(CHAINS[1]);
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([]);

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const handleMaxClick = () => {
    setAmount("1000"); // Mock balance
  };

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "processing" },
        { id: "2", label: "Initiate Bridge", status: "pending" },
        { id: "3", label: "Wait for Confirmation", status: "pending" },
        { id: "4", label: "Receive on Destination", status: "pending" },
      ]);
      setShowTransactionModal(true);

      // Step 1: Approve
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionSteps(prev =>
        prev.map((step, i) => (i === 0 ? { ...step, status: "completed" } : i === 1 ? { ...step, status: "processing" } : step)),
      );

      // Step 2: Initiate Bridge
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionSteps(prev =>
        prev.map((step, i) => (i <= 1 ? { ...step, status: "completed" } : i === 2 ? { ...step, status: "processing" } : step)),
      );

      // Step 3: Wait for Confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTransactionSteps(prev =>
        prev.map((step, i) => (i <= 2 ? { ...step, status: "completed" } : i === 3 ? { ...step, status: "processing" } : step)),
      );

      // Step 4: Receive
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionSteps(prev => prev.map(step => ({ ...step, status: "completed" })));

      setTimeout(() => {
        setShowTransactionModal(false);
        setAmount("");
      }, 1500);
    } catch (error) {
      console.error("Bridge failed:", error);
      setTransactionSteps(prev => prev.map(step => ({ ...step, status: "failed" as const })));
    }
  };

  const estimatedTime = "5-10 minutes";
  const bridgeFee = "0.001 ETH";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Cross-Chain Bridge
          </h1>
          <p className="text-gray-400 text-lg">Transfer assets securely between blockchain networks</p>
        </div>

        {/* Bridge Card */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
          {/* From Chain */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-3">From Network</label>
            <div className="bg-[#0a0118]/60 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${fromChain.gradient} rounded-lg flex items-center justify-center`}>
                  <i className={`${fromChain.icon} text-white text-2xl`}></i>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{fromChain.name}</p>
                  <p className="text-sm text-gray-400">Chain ID: {fromChain.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 z-10 relative">
            <button
              onClick={handleSwapChains}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            >
              <i className="ri-arrow-up-down-line text-2xl"></i>
            </button>
          </div>

          {/* To Chain */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">To Network</label>
            <div className="bg-[#0a0118]/60 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${toChain.gradient} rounded-lg flex items-center justify-center`}>
                  <i className={`${toChain.icon} text-white text-2xl`}></i>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{toChain.name}</p>
                  <p className="text-sm text-gray-400">Chain ID: {toChain.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Select Token</label>
            <div className="grid grid-cols-4 gap-3">
              {TOKENS.map(token => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedToken.symbol === token.symbol
                      ? "bg-gradient-to-br " + token.gradient + " border-transparent"
                      : "bg-[#0a0118]/60 border-purple-500/30 hover:border-purple-500/60"
                  }`}
                >
                  <i className={`${token.icon} text-2xl block mb-2`}></i>
                  <p className="font-bold text-xs">{token.symbol}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Amount</label>
            <div className="bg-[#0a0118]/60 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">You Send</span>
                <button
                  onClick={handleMaxClick}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedToken.gradient} rounded-lg flex items-center justify-center shrink-0`}>
                  <i className={`${selectedToken.icon} text-white text-xl`}></i>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
                  placeholder="0.0"
                />
                <span className="text-white font-bold text-xl">{selectedToken.symbol}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Balance: 1,000.00 {selectedToken.symbol}</p>
            </div>
          </div>

          {/* Bridge Details */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">You Will Receive</span>
                <span className="font-bold text-white">
                  {amount} {selectedToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Bridge Fee</span>
                <span className="text-white font-semibold">{bridgeFee}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Estimated Time</span>
                <span className="text-cyan-400 font-semibold">{estimatedTime}</span>
              </div>
              <div className="h-px bg-purple-500/30"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Total Cost</span>
                <span className="font-bold text-white">
                  {amount} {selectedToken.symbol} + {bridgeFee}
                </span>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={!amount || parseFloat(amount) <= 0 || !address}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {!address ? "Connect Wallet" : "Bridge Tokens"}
          </button>

          {/* Warning Box */}
          <div className="mt-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-alert-fill text-yellow-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-yellow-400 mb-1">Important Notice</h4>
                <p className="text-sm text-gray-300">
                  Cross-chain bridges can take several minutes to complete. Make sure you're sending to the correct
                  network and double-check the destination address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bridge History */}
        <div className="mt-8 bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-xl font-bold mb-4">Recent Bridges</h3>
          <div className="space-y-3">
            {[
              {
                amount: "100 MEME",
                from: "Memecore",
                to: "Ethereum",
                status: "Completed",
                time: "10 minutes ago",
                statusColor: "text-green-400",
              },
              {
                amount: "50 USDT",
                from: "Ethereum",
                to: "Memecore",
                status: "Processing",
                time: "5 minutes ago",
                statusColor: "text-yellow-400",
              },
              {
                amount: "200 MEME",
                from: "Memecore",
                to: "Polygon",
                status: "Completed",
                time: "1 hour ago",
                statusColor: "text-green-400",
              },
            ].map((bridge, index) => (
              <div key={index} className="p-4 bg-[#0a0118]/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{bridge.amount}</span>
                  <span className={`text-sm font-semibold ${bridge.statusColor}`}>{bridge.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{bridge.from}</span>
                  <i className="ri-arrow-right-line"></i>
                  <span>{bridge.to}</span>
                  <span className="ml-auto">{bridge.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mt-8 bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-xl font-bold mb-4">Supported Networks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHAINS.map(chain => (
              <div key={chain.id} className="p-4 bg-[#0a0118]/40 rounded-lg text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${chain.gradient} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <i className={`${chain.icon} text-white text-2xl`}></i>
                </div>
                <p className="font-semibold text-sm text-white">{chain.name.split(" ")[0]}</p>
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
