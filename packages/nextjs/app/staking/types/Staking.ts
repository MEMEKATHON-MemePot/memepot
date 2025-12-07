export interface Staking {
  id: string;
  name: string;
  token: string;
  apr: string;
  tokenContract: string;
  totalDeposits: string;
  chain: string;
  volume24h: string;
  decimals: number;
  isNative: boolean;
}
