"use client";

import { useState } from "react";

interface VaultsPool {
  id: number;
  name: string;
  token: string;
  apy: string;
  tvl: string;
  minStake: string;
  lockPeriod: string;
  status: "active" | "coming-soon" | "ended";
}

export default function VaultsList() {
  const [selectedPool, setSelectedPool] = useState<number | null>(null);

  const pools: VaultsPool[] = [
    {
      id: 1,
      name: "MEME Classic Pool",
      token: "MEME",
      apy: "45.2%",
      tvl: "$12,345,678",
      minStake: "100 MEME",
      lockPeriod: "30 days",
      status: "active",
    },
    {
      id: 2,
      name: "MEME-ETH LP Pool",
      token: "MEME-ETH LP",
      apy: "67.8%",
      tvl: "$8,234,567",
      minStake: "0.1 LP",
      lockPeriod: "60 days",
      status: "active",
    },
    {
      id: 3,
      name: "MEME Flexible Pool",
      token: "MEME",
      apy: "28.5%",
      tvl: "$5,678,901",
      minStake: "50 MEME",
      lockPeriod: "Flexible",
      status: "active",
    },
    {
      id: 4,
      name: "MEME Premium Pool",
      token: "MEME",
      apy: "89.3%",
      tvl: "$15,234,890",
      minStake: "1000 MEME",
      lockPeriod: "90 days",
      status: "active",
    },
    {
      id: 5,
      name: "MEME-USDT LP Pool",
      token: "MEME-USDT LP",
      apy: "52.1%",
      tvl: "$6,789,012",
      minStake: "0.5 LP",
      lockPeriod: "45 days",
      status: "active",
    },
    {
      id: 6,
      name: "MEME Starter Pool",
      token: "MEME",
      apy: "35.7%",
      tvl: "$3,456,789",
      minStake: "10 MEME",
      lockPeriod: "15 days",
      status: "active",
    },
    {
      id: 7,
      name: "MEME VIP Pool",
      token: "MEME",
      apy: "125.4%",
      tvl: "$25,678,901",
      minStake: "5000 MEME",
      lockPeriod: "180 days",
      status: "active",
    },
    {
      id: 8,
      name: "MEME-BNB LP Pool",
      token: "MEME-BNB LP",
      apy: "73.2%",
      tvl: "$9,876,543",
      minStake: "0.2 LP",
      lockPeriod: "60 days",
      status: "active",
    },
    {
      id: 9,
      name: "MEME Quick Pool",
      token: "MEME",
      apy: "18.9%",
      tvl: "$2,345,678",
      minStake: "25 MEME",
      lockPeriod: "7 days",
      status: "active",
    },
    {
      id: 10,
      name: "MEME Diamond Pool",
      token: "MEME",
      apy: "156.8%",
      tvl: "$35,234,567",
      minStake: "10000 MEME",
      lockPeriod: "365 days",
      status: "active",
    },
    {
      id: 11,
      name: "MEME-MATIC LP Pool",
      token: "MEME-MATIC LP",
      apy: "61.5%",
      tvl: "$7,123,456",
      minStake: "0.3 LP",
      lockPeriod: "45 days",
      status: "active",
    },
    {
      id: 12,
      name: "MEME Express Pool",
      token: "MEME",
      apy: "22.3%",
      tvl: "$1,987,654",
      minStake: "20 MEME",
      lockPeriod: "3 days",
      status: "active",
    },
    {
      id: 13,
      name: "MEME Gold Pool",
      token: "MEME",
      apy: "98.7%",
      tvl: "$18,765,432",
      minStake: "2500 MEME",
      lockPeriod: "120 days",
      status: "active",
    },
    {
      id: 14,
      name: "MEME-AVAX LP Pool",
      token: "MEME-AVAX LP",
      apy: "69.4%",
      tvl: "$8,654,321",
      minStake: "0.25 LP",
      lockPeriod: "60 days",
      status: "active",
    },
    {
      id: 15,
      name: "MEME Boost Pool",
      token: "MEME",
      apy: "42.6%",
      tvl: "$4,567,890",
      minStake: "150 MEME",
      lockPeriod: "30 days",
      status: "active",
    },
    {
      id: 16,
      name: "MEME Platinum Pool",
      token: "MEME",
      apy: "178.9%",
      tvl: "$42,345,678",
      minStake: "15000 MEME",
      lockPeriod: "540 days",
      status: "coming-soon",
    },
    {
      id: 17,
      name: "MEME-FTM LP Pool",
      token: "MEME-FTM LP",
      apy: "58.3%",
      tvl: "$6,234,567",
      minStake: "0.4 LP",
      lockPeriod: "45 days",
      status: "active",
    },
    {
      id: 18,
      name: "MEME Sprint Pool",
      token: "MEME",
      apy: "15.7%",
      tvl: "$1,234,567",
      minStake: "15 MEME",
      lockPeriod: "1 day",
      status: "active",
    },
    {
      id: 19,
      name: "MEME Silver Pool",
      token: "MEME",
      apy: "76.4%",
      tvl: "$13,456,789",
      minStake: "1500 MEME",
      lockPeriod: "90 days",
      status: "active",
    },
    {
      id: 20,
      name: "MEME-SOL LP Pool",
      token: "MEME-SOL LP",
      apy: "81.2%",
      tvl: "$11,234,567",
      minStake: "0.15 LP",
      lockPeriod: "75 days",
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
            Active
          </span>
        );
      case "coming-soon":
        return (
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30">
            Coming Soon
          </span>
        );
      case "ended":
        return (
          <span className="px-3 py-1 bg-slate-500/20 text-slate-400 text-xs font-semibold rounded-full border border-slate-500/30">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {pools.map(pool => (
        <div
          key={pool.id}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-[#AD47FF]/50 transition-all cursor-pointer"
          onClick={() => setSelectedPool(selectedPool === pool.id ? null : pool.id)}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Pool Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-[#AD47FF] to-[#8B2FE6] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-coin-line text-white text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold text-lg truncate">{pool.name}</h3>
                  {getStatusBadge(pool.status)}
                </div>
                <p className="text-slate-400 text-sm">{pool.token}</p>
              </div>
            </div>

            {/* Pool Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              <div>
                <p className="text-slate-400 text-xs mb-1">APY</p>
                <p className="text-[#AD47FF] font-bold text-lg">{pool.apy}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">TVL</p>
                <p className="text-white font-semibold">{pool.tvl}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Min Stake</p>
                <p className="text-white font-semibold">{pool.minStake}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Lock Period</p>
                <p className="text-white font-semibold">{pool.lockPeriod}</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              className={`px-6 py-2.5 ${
                pool.status === "active" ? "bg-[#AD47FF] hover:bg-[#8B2FE6]" : "bg-slate-600 cursor-not-allowed"
              } text-white font-semibold rounded-lg transition-all whitespace-nowrap`}
              disabled={pool.status !== "active"}
            >
              {pool.status === "active" ? "Stake" : "Coming Soon"}
            </button>
          </div>

          {/* Expanded Details */}
          {selectedPool === pool.id && pool.status === "active" && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-bold mb-3">Pool Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Daily Rewards</span>
                      <span className="text-white font-semibold text-sm">
                        {(parseFloat(pool.apy) / 365).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Total Stakers</span>
                      <span className="text-white font-semibold text-sm">{Math.floor(Math.random() * 5000 + 500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Reward Token</span>
                      <span className="text-white font-semibold text-sm">MEME</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold mb-3">Your Stake</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Staked Amount</span>
                      <span className="text-white font-semibold text-sm">0 MEME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Pending Rewards</span>
                      <span className="text-[#AD47FF] font-semibold text-sm">0 MEME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Unlock Date</span>
                      <span className="text-white font-semibold text-sm">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-6 py-3 bg-[#AD47FF] hover:bg-[#8B2FE6] text-white font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer">
                  <i className="ri-add-line mr-2"></i>
                  Stake Now
                </button>
                <button className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer">
                  <i className="ri-subtract-line mr-2"></i>
                  Unstake
                </button>
                <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer">
                  <i className="ri-gift-line mr-2"></i>
                  Claim
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
