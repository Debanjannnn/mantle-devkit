// mETH Protocol - Mantle's Liquid Staking Token
// Official docs: https://docs.mantle.xyz/meth
// mETH represents staked ETH with accumulated rewards

// mETH Token Address on Mantle L2
export const METH_TOKEN = {
  mainnet: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// mETH exchange rate increases over time (1 mETH ≈ 1.08 ETH as of Dec 2025)
// This is a value-accumulating token, not a rebasing token
