interface prizeBreakdown {
  place: string;
  percentage: number;
  amount?: string;
}

interface userStats {
  userPoints: number;
  winChance: string;
  totalTickets: number;
}

export interface EventPool {
  id: string;
  poolNum: number; // 밈팟의 모든 이벤트 풀에 대한 번호. 생성될 때만 1씩 증가하도록 구현 필요
  name: string;
  tokenSymbol: string;
  tokenAddress: string;
  totalPrize: string;
  currency: string;
  frequency: string;
  nextDraw: number; // Daily: next day 00:00, Weekly: next Mon 00:00, Monthly: next month 1st 00:00
  participants: number;
  totalPoints: number;
  status: "active" | "completed" | "cancelled";
  prizeBreakdown: prizeBreakdown[];
  userStats?: userStats;
  icon?: string; //front에서 아이콘 지정 가능
  gradient?: string; //front에서 그라데이션 지정 가능
}
