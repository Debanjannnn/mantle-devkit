// Aave V3 contract addresses on Mantle
// Reference: https://docs.aave.com/developers/deployed-contracts/v3-mainnet
// Verify addresses on: https://explorer.mantle.xyz

// PoolAddressesProvider - Main registry for Aave V3 protocol addresses
// Use this to fetch the Pool address dynamically via getPool() function
// IMPORTANT: Aave V3 may not be deployed on Mantle yet. Verify deployment status before use.
// To find the address: Check https://docs.aave.com/developers/deployed-contracts/v3-mainnet
// Or search on Mantle explorer: https://explorer.mantle.xyz
export const POOL_ADDRESSES_PROVIDER = {
  mainnet: "0x0000000000000000000000000000000000000000", // TODO: Update with verified Mantle address from Aave docs or explorer
  testnet: "0x0000000000000000000000000000000000000000", // Aave V3 testnet not typically deployed
} as const;

// Pool contract address - Can be fetched from PoolAddressesProvider.getPool()
// If Aave V3 is deployed on Mantle, verify this address on explorer
// Alternatively, use getPoolAddress() utility to fetch dynamically from PoolAddressesProvider
export const POOL_ADDRESS = {
  mainnet: "0x0000000000000000000000000000000000000000", // TODO: Update with verified Mantle address or use getPoolAddress() utility
  testnet: "0x0000000000000000000000000000000000000000", // Aave V3 testnet not typically deployed
} as const;

// PoolAddressesProvider ABI for fetching Pool address
export const POOL_ADDRESSES_PROVIDER_ABI = [
  {
    inputs: [],
    name: "getPool",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Native token address (Wrapped MNT for Aave)
export const WMNT_ADDRESS = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8";

// Interest rate modes
export const INTEREST_RATE_MODE = {
  STABLE: 1,
  VARIABLE: 2,
} as const;

// Aave V3 Pool ABI (simplified - key functions)
export const POOL_ABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "referralCode", type: "uint16" },
      { name: "onBehalfOf", type: "address" },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { name: "totalCollateralBase", type: "uint256" },
      { name: "totalDebtBase", type: "uint256" },
      { name: "availableBorrowsBase", type: "uint256" },
      { name: "currentLiquidationThreshold", type: "uint256" },
      { name: "ltv", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      {
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

