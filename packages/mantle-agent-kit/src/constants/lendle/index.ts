// Lendle Protocol contract addresses on Mantle Network
// Official docs: https://docs.lendle.xyz/contracts-and-security/mantle-contracts
// Lendle is an Aave V2 fork optimized for Mantle Network

// LendingPool - Main contract for supply, borrow, withdraw operations
export const LENDING_POOL = {
  mainnet: "0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const, // Not deployed on testnet
} as const;

// LendingPoolAddressesProvider - Registry for protocol addresses
export const LENDING_POOL_ADDRESSES_PROVIDER = {
  mainnet: "0xAb94Bedd21ae3411eB2698945dfCab1D5C19C3d4" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// AaveProtocolDataProvider - Helper contract for reading protocol data
export const PROTOCOL_DATA_PROVIDER = {
  mainnet: "0x552b9e4bae485C4B7F540777d7D25614CdB84773" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// AaveOracle - Price oracle for assets
export const ORACLE = {
  mainnet: "0x870c9692Ab04944C86ec6FEeF63F261226506EfC" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// WMNT address for native MNT wrapping
export const WMNT_ADDRESS = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as const;

// Interest rate modes
export const INTEREST_RATE_MODE = {
  STABLE: 1,
  VARIABLE: 2,
} as const;

// Lendle LendingPool ABI (Aave V2 compatible)
export const LENDING_POOL_ABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    name: "deposit",
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
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "rateMode", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    name: "repay",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { name: "totalCollateralETH", type: "uint256" },
      { name: "totalDebtETH", type: "uint256" },
      { name: "availableBorrowsETH", type: "uint256" },
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
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "id", type: "uint8" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
