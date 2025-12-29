// Stargate Finance contract addresses
// Reference: https://stargateprotocol.gitbook.io/stargate/developers/contract-addresses
// Verify addresses on: https://explorer.mantle.xyz
// Official docs: https://docs.stargate.finance/resources/contracts/mainnet-contracts

// Stargate Router addresses (LayerZero chain IDs)
// IMPORTANT: Stargate may not be deployed on Mantle yet. Verify deployment status before use.
// To find the address: Check https://docs.stargate.finance/resources/contracts/mainnet-contracts
// Or search on Mantle explorer: https://explorer.mantle.xyz
// LayerZero chain ID for Mantle: 5000 (mainnet), 5003 (testnet)
export const STARGATE_ROUTER = {
  mainnet: "0x0000000000000000000000000000000000000000", // TODO: Update with verified Mantle address from Stargate docs or explorer
  testnet: "0x0000000000000000000000000000000000000000", // Stargate testnet not typically deployed
} as const;

// LayerZero chain IDs for Stargate
export const LAYERZERO_CHAIN_ID = {
  ethereum: 101,
  arbitrum: 110,
  optimism: 111,
  polygon: 109,
  base: 184,
  bsc: 102,
  avalanche: 106,
  mantle: 5000, // Mantle mainnet
  mantleTestnet: 5003, // Mantle testnet
} as const;

// Stargate Router ABI (simplified - key functions)
export const STARGATE_ROUTER_ABI = [
  {
    inputs: [
      { name: "_dstChainId", type: "uint16" },
      { name: "_srcPoolId", type: "uint256" },
      { name: "_dstPoolId", type: "uint256" },
      { name: "_refundAddress", type: "address" },
      { name: "_amountLD", type: "uint256" },
      { name: "_amountMinLD", type: "uint256" },
      {
        components: [
          { name: "dstGasForCall", type: "uint256" },
          { name: "dstNativeAmount", type: "uint256" },
          { name: "dstNativeAddr", type: "bytes" },
        ],
        name: "_lzTxParams",
        type: "tuple",
      },
      { name: "_to", type: "bytes" },
      { name: "_payload", type: "bytes" },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_dstChainId", type: "uint16" },
      { name: "_srcPoolId", type: "uint256" },
      { name: "_dstPoolId", type: "uint256" },
      { name: "_refundAddress", type: "address" },
      { name: "_amountLD", type: "uint256" },
      { name: "_amountMinLD", type: "uint256" },
      {
        components: [
          { name: "dstGasForCall", type: "uint256" },
          { name: "dstNativeAmount", type: "uint256" },
          { name: "dstNativeAddr", type: "bytes" },
        ],
        name: "_lzTxParams",
        type: "tuple",
      },
      { name: "_to", type: "bytes" },
      { name: "_payload", type: "bytes" },
    ],
    name: "swapETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Common pool IDs (these vary by chain and token)
// USDC pool ID is typically 1, USDT is 2, etc.
export const POOL_IDS = {
  USDC: 1,
  USDT: 2,
} as const;

