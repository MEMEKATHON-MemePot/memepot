import { EventPool } from "../types/EventPool";
import EventPoolCard from "./EventPoolCard";
import { getNextDraw } from "~~/utils/eventPoolUtils";

const poolStyles = {
  "1": { icon: "ri-fire-fill", gradient: "from-orange-500 to-red-500" },
  "2": { icon: "ri-flashlight-fill", gradient: "from-yellow-500 to-orange-500" },
  "3": { icon: "ri-rocket-fill", gradient: "from-purple-500 to-pink-500" },
  "4": { icon: "ri-coin-fill", gradient: "from-green-500 to-emerald-500" },
  "5": { icon: "ri-safe-fill", gradient: "from-teal-500 to-green-500" },
  "6": { icon: "ri-trophy-fill", gradient: "from-blue-500 to-cyan-500" },
};

const mockEventPoolsBase: EventPool[] = [
  {
    id: "1", // 고유값이여야 함
    poolNum: 1, // 몇번째 열리는 풀인지 관한 값. 종료되면 1씩 증가
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "11,585",
    currency: "M",
    frequency: "1D",
    nextDraw: getNextDraw("1D").getTime(),
    participants: 5328,
    totalPoints: 101233,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
  {
    id: "2",
    poolNum: 2,
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "23,112",
    currency: "M",
    frequency: "1W",
    nextDraw: getNextDraw("1W").getTime(),
    participants: 1234,
    totalPoints: 22388,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
  {
    id: "3",
    poolNum: 3,
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "34,183",
    currency: "M",
    frequency: "1M",
    nextDraw: getNextDraw("1M").getTime(),
    participants: 876,
    totalPoints: 34000,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
  {
    id: "4",
    poolNum: 4,
    name: "USDT Pool",
    tokenSymbol: "USDT",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "11,585",
    currency: "USDT",
    frequency: "1D",
    nextDraw: getNextDraw("1D").getTime(),
    participants: 5328,
    totalPoints: 101233,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
  {
    id: "5",
    poolNum: 5,
    name: "USDT Pool",
    tokenSymbol: "USDT",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "23,112",
    currency: "USDT",
    frequency: "1W",
    nextDraw: getNextDraw("1W").getTime(),
    participants: 1234,
    totalPoints: 22388,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
  {
    id: "6",
    poolNum: 6,
    name: "NOCMU Special Pool",
    tokenSymbol: "NOCMU",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    totalPrize: "159,513",
    currency: "NOCMU",
    frequency: "1W",
    nextDraw: getNextDraw("1W").getTime(),
    participants: 5328,
    totalPoints: 101233,
    status: "active",
    prizeBreakdown: [
      { place: 1, percentage: 60 },
      { place: 2, percentage: 30 },
      { place: 3, percentage: 10 },
    ],
  },
];

export const mockEventPools: EventPool[] = mockEventPoolsBase.map(pool => ({
  ...pool,
  ...poolStyles[pool.id as keyof typeof poolStyles],
}));

export default function EventPoolsSection() {
  return (
    <section className="relative px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* All Pools Grid */}
        <div className="mt-24">
          <h3 className="text-6xl font-bold text-center mb-24">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Active event Prize Pools
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockEventPools.map(pool => (
              <EventPoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
