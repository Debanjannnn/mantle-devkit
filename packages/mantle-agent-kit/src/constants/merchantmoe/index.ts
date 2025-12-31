// Merchant Moe - #2 DEX on Mantle with $73.3M TVL
// TraderJoe fork with Liquidity Book (LB) 2.2
// Official docs: https://docs.merchantmoe.com

// LB Router - Main router for swaps
export const LB_ROUTER = {
  mainnet: "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// LB Factory - Creates liquidity book pairs
export const LB_FACTORY = {
  mainnet: "0xa6630671775c4EA2743840F9A5016dCf2A104054" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// LB Quoter - Get quotes for swaps
export const LB_QUOTER = {
  mainnet: "0x501b8AFd35df20f531fF45F6f695793AC3316c85" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// MOE Token
export const MOE_TOKEN = "0x4515a45337f461a11ff0fe8abf3c606ae5dc00c9" as const;

// Simple Router ABI for swaps
export const LB_ROUTER_ABI = [
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "uint256[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
