import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { POOL_ADDRESS, POOL_ABI } from "../../constants/aave";

/**
 * Withdraw tokens from Aave V3
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to withdraw
 * @param amount - Amount to withdraw (in smallest units, use max uint256 for max)
 * @param to - Address to receive withdrawn tokens (optional, defaults to agent address)
 * @returns Transaction hash
 */
export async function aaveWithdraw(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  to?: Address,
): Promise<Hex> {
  const poolAddress = POOL_ADDRESS[agent.chain];

  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave Pool address not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  const amountBigInt = BigInt(amount);
  const toAddress = to || agent.account.address;

  // Encode withdraw function call
  const data = encodeFunctionData({
    abi: POOL_ABI,
    functionName: "withdraw",
    args: [tokenAddress, amountBigInt, toAddress],
  });

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to: poolAddress,
    data,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}

