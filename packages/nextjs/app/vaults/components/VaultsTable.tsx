"use client";

import { useEffect, useRef, useState } from "react";

interface Vault {
  id: string;
  name: string;
  token: string;
  icon: string;
  maxPrize: string;
  baseAPR: string;
  ticketAPR: string;
  totalDeposits: string;
  chain: string;
  volume24h: string;
}

export default function VaultsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"tvl" | "apy" | "volume">("tvl");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && displayCount < vaults.length) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + 8, vaults.length));
            setIsLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 },
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, displayCount]);

  const vaults: Vault[] = [
    {
      id: "1",
      name: "Prize USDT",
      token: "USDT",
      icon: "💵",
      maxPrize: "Up to $50,000",
      baseAPR: "4.2",
      ticketAPR: "2.8",
      totalDeposits: "$3,200,000",
      chain: "Memecore",
      volume24h: "$890,123",
    },
    {
      id: "2",
      name: "Prize USDC",
      token: "USDC",
      icon: "💎",
      maxPrize: "Up to $75,000",
      baseAPR: "5.1",
      ticketAPR: "3.2",
      totalDeposits: "$1,890,000",
      chain: "Memecore",
      volume24h: "$4,567,890",
    },
    {
      id: "3",
      name: "Prize WETH",
      token: "WETH",
      icon: "⚡",
      maxPrize: "Up to $100,000",
      baseAPR: "3.8",
      ticketAPR: "2.5",
      totalDeposits: "$5,120,000",
      chain: "Memecore",
      volume24h: "$1,234,567",
    },
    {
      id: "4",
      name: "Prize DAI",
      token: "DAI",
      icon: "🌟",
      maxPrize: "Up to $40,000",
      baseAPR: "7.9",
      ticketAPR: "4.5",
      totalDeposits: "$780,000",
      chain: "Memecore",
      volume24h: "$3,456,789",
    },
    {
      id: "5",
      name: "Prize WBTC",
      token: "WBTC",
      icon: "🔶",
      maxPrize: "Up to $120,000",
      baseAPR: "6.5",
      ticketAPR: "3.0",
      totalDeposits: "$2,340,000",
      chain: "Memecore",
      volume24h: "$2,345,678",
    },
    {
      id: "6",
      name: "Prize MATIC",
      token: "MATIC",
      icon: "🟣",
      maxPrize: "Up to $35,000",
      baseAPR: "3.5",
      ticketAPR: "2.2",
      totalDeposits: "$6,450,000",
      chain: "Memecore",
      volume24h: "$678,901",
    },
    {
      id: "7",
      name: "Prize LINK",
      token: "LINK",
      icon: "🔗",
      maxPrize: "Up to $60,000",
      baseAPR: "5.8",
      ticketAPR: "3.8",
      totalDeposits: "$4,890,000",
      chain: "Memecore",
      volume24h: "$5,789,012",
    },
    {
      id: "8",
      name: "Prize UNI",
      token: "UNI",
      icon: "🦄",
      maxPrize: "Up to $55,000",
      baseAPR: "8.3",
      ticketAPR: "5.5",
      totalDeposits: "$1,340,000",
      chain: "Memecore",
      volume24h: "$1,456,789",
    },
    {
      id: "9",
      name: "Prize AAVE",
      token: "AAVE",
      icon: "👻",
      maxPrize: "Up to $65,000",
      baseAPR: "4.7",
      ticketAPR: "3.1",
      totalDeposits: "$2,890,000",
      chain: "Memecore",
      volume24h: "$1,890,234",
    },
    {
      id: "10",
      name: "Prize SUSHI",
      token: "SUSHI",
      icon: "🍣",
      maxPrize: "Up to $45,000",
      baseAPR: "6.2",
      ticketAPR: "4.0",
      totalDeposits: "$1,560,000",
      chain: "Memecore",
      volume24h: "$2,123,456",
    },
    {
      id: "11",
      name: "Prize CRV",
      token: "CRV",
      icon: "🌀",
      maxPrize: "Up to $50,000",
      baseAPR: "5.5",
      ticketAPR: "3.5",
      totalDeposits: "$2,120,000",
      chain: "Memecore",
      volume24h: "$1,567,890",
    },
    {
      id: "12",
      name: "Prize SNX",
      token: "SNX",
      icon: "⚙️",
      maxPrize: "Up to $55,000",
      baseAPR: "7.1",
      ticketAPR: "4.8",
      totalDeposits: "$1,780,000",
      chain: "Memecore",
      volume24h: "$2,890,123",
    },
    {
      id: "13",
      name: "Prize COMP",
      token: "COMP",
      icon: "🏦",
      maxPrize: "Up to $70,000",
      baseAPR: "4.9",
      ticketAPR: "3.3",
      totalDeposits: "$3,450,000",
      chain: "Memecore",
      volume24h: "$3,234,567",
    },
    {
      id: "14",
      name: "Prize MKR",
      token: "MKR",
      icon: "🎯",
      maxPrize: "Up to $80,000",
      baseAPR: "5.3",
      ticketAPR: "3.6",
      totalDeposits: "$4,120,000",
      chain: "Memecore",
      volume24h: "$4,123,456",
    },
    {
      id: "15",
      name: "Prize YFI",
      token: "YFI",
      icon: "💙",
      maxPrize: "Up to $90,000",
      baseAPR: "6.8",
      ticketAPR: "4.2",
      totalDeposits: "$3,890,000",
      chain: "Memecore",
      volume24h: "$3,678,901",
    },
    {
      id: "16",
      name: "Prize BAL",
      token: "BAL",
      icon: "⚖️",
      maxPrize: "Up to $48,000",
      baseAPR: "5.9",
      ticketAPR: "3.9",
      totalDeposits: "$2,340,000",
      chain: "Memecore",
      volume24h: "$2,456,789",
    },
  ];

  const filteredVaults = vaults.filter(
    vault =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.token.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedVaults = [...filteredVaults].sort((a, b) => {
    if (sortBy === "tvl") {
      return parseFloat(b.totalDeposits.replace(/[$,]/g, "")) - parseFloat(a.totalDeposits.replace(/[$,]/g, ""));
    } else if (sortBy === "apy") {
      return parseFloat(b.baseAPR) - parseFloat(a.baseAPR);
    } else {
      return parseFloat(b.volume24h.replace(/[$,]/g, "")) - parseFloat(a.volume24h.replace(/[$,]/g, ""));
    }
  });

  const displayedVaults = sortedVaults.slice(0, displayCount);

  const handleFilterSelect = (filter: "tvl" | "apy" | "volume") => {
    setSortBy(filter);
    setIsDropdownOpen(false);
  };

  const getFilterLabel = () => {
    switch (sortBy) {
      case "tvl":
        return "TVL";
      case "apy":
        return "APY";
      case "volume":
        return "24h Vol";
      default:
        return "TVL";
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#AD47FF]/20 rounded-lg">
              <i className="ri-money-dollar-circle-line text-[#AD47FF] text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">Fixed Yield</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Earn guaranteed returns on your deposits. Base yield is paid out regularly regardless of prize outcomes.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-pink-500/20 rounded-lg">
              <i className="ri-ticket-2-line text-pink-400 text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">Event Tickets</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Additional yield is converted into event tickets, giving you chances to win prizes while maintaining your
            principal.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
              <i className="ri-shield-check-line text-green-400 text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">No Loss</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your principal is always safe. Withdraw anytime with no penalties. Only the yield is used for prizes and
            tickets.
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base"></i>
          <input
            type="text"
            placeholder="Search by token name or contract"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#0f0820]/60 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#AD47FF]/50 transition-colors"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AD47FF]/20 to-pink-500/20 border border-[#AD47FF]/30 rounded-lg text-white hover:from-[#AD47FF]/30 hover:to-pink-500/30 transition-all text-sm cursor-pointer whitespace-nowrap"
          >
            <span>{getFilterLabel()}</span>
            <i className={`ri-arrow-${isDropdownOpen ? "up" : "down"}-s-line text-base transition-transform`}></i>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#1a0f2e] border border-[#AD47FF]/30 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => handleFilterSelect("tvl")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "tvl" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                TVL
              </button>
              <button
                onClick={() => handleFilterSelect("apy")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "apy" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                APY
              </button>
              <button
                onClick={() => handleFilterSelect("volume")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "volume" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                24h Vol
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f0820]/40 border border-gray-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Vault</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Base Yield</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Ticket Yield</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Total APR</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">
                  Total Deposits
                </th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Chain</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedVaults.map((vault, index) => (
                <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition-colors">
                  {/* Pool */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-2xl">{vault.icon}</div>
                      <div>
                        <div className="font-semibold text-white text-sm">{vault.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Base Yield */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm">
                      {vault.baseAPR}% <span className="text-xs text-gray-400">(Fixed)</span>
                    </div>
                  </td>

                  {/* Ticket Yield */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm">
                      {vault.ticketAPR}% <span className="text-xs text-gray-400">(Tickets)</span>
                    </div>
                  </td>

                  {/* Total APR */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-pink-400 text-base">
                      {(parseFloat(vault.baseAPR) + parseFloat(vault.ticketAPR)).toFixed(1)}%
                    </div>
                  </td>

                  {/* Total Deposits */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white text-sm">{vault.totalDeposits}</div>
                  </td>

                  {/* Chain */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs px-2 py-1 bg-[#AD47FF]/20 text-[#AD47FF] rounded-md border border-[#AD47FF]/30 inline-block">
                      {vault.chain}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    <button className="px-5 py-2 bg-gradient-to-r from-pink-500 to-[#AD47FF] rounded-full text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(173,71,255,0.5)] transition-all whitespace-nowrap cursor-pointer">
                      Deposit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite Scroll Trigger & Loading */}
      {displayCount < sortedVaults.length && (
        <div ref={observerRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#AD47FF] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading more vaults...</span>
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {displayCount >= sortedVaults.length && sortedVaults.length > 8 && (
        <div className="flex justify-center py-6">
          <span className="text-sm text-gray-500">All vaults loaded</span>
        </div>
      )}
    </div>
  );
}
