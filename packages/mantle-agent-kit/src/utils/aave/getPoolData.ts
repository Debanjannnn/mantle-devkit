import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { POOL_ADDRESS, POOL_ABI } from "../../constants/aave";

export interface ReserveData {
  configuration: bigint;
  liquidityIndex: bigint;
  currentLiquidityRate: bigint;
  variableBorrowIndex: bigint;
  currentVariableBorrowRate: bigint;
  currentStableBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
  id: number;
  aTokenAddress: Address;
  stableDebtTokenAddress: Address;
  variableDebtTokenAddress: Address;
  interestRateStrategyAddress: Address;
  accruedToTreasury: bigint;
  unbacked: bigint;
  isolationModeTotalDebt: bigint;
}

/**
 * Get reserve data for a token from Aave Pool
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address
 * @returns Reserve data including rates and token addresses
 */
export async function getPoolData(
  agent: MNTAgentKit,
  tokenAddress: Address,
): Promise<ReserveData> {
  const poolAddress = POOL_ADDRESS[agent.chain];

  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave Pool address not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  const result = await agent.client.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: "getReserveData",
    args: [tokenAddress],
  });

  return {
    configuration: result[0],
    liquidityIndex: result[1],
    currentLiquidityRate: result[2],
    variableBorrowIndex: result[3],
    currentVariableBorrowRate: result[4],
    currentStableBorrowRate: result[5],
    lastUpdateTimestamp: result[6],
    id: Number(result[7]),
    aTokenAddress: result[8],
    stableDebtTokenAddress: result[9],
    variableDebtTokenAddress: result[10],
    interestRateStrategyAddress: result[11],
    accruedToTreasury: result[12],
    unbacked: result[13],
    isolationModeTotalDebt: result[14],
  };
}

