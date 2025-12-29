import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { POOL_ADDRESS, POOL_ABI } from "../../constants/aave";

export interface UserAccountData {
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
  availableBorrowsBase: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

/**
 * Get user account data from Aave Pool
 * @param agent - MNTAgentKit instance
 * @param userAddress - User wallet address (optional, defaults to agent account)
 * @returns User account data including collateral, debt, and health factor
 */
export async function getUserAccountData(
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<UserAccountData> {
  const poolAddress = POOL_ADDRESS[agent.chain];
  const address = userAddress || agent.account.address;

  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave Pool address not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  const result = await agent.client.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: "getUserAccountData",
    args: [address],
  });

  return {
    totalCollateralBase: result[0],
    totalDebtBase: result[1],
    availableBorrowsBase: result[2],
    currentLiquidationThreshold: result[3],
    ltv: result[4],
    healthFactor: result[5],
  };
}

