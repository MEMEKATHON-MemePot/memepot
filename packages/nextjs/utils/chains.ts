import { defineChain } from "viem";

export const insectarium = defineChain({
  id: 43522,
  name: "Insectarium Testnet",
  network: "insectarium",
  nativeCurrency: {
    decimals: 18,
    name: "MEME",
    symbol: "MEME",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.insectarium.memecore.net"],
    },
    public: {
      http: ["https://rpc.insectarium.memecore.net"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://insectarium.blockscout.memecore.com",
    },
  },
  testnet: true,
});
