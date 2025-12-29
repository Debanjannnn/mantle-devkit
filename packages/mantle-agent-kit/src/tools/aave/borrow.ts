import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { POOL_ADDRESS, POOL_ABI, INTEREST_RATE_MODE } from "../../constants/aave";

/**
 * Borrow tokens from Aave V3
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to borrow
 * @param amount - Amount to borrow (in smallest units)
 * @param interestRateMode - Interest rate mode (1 = stable, 2 = variable)
 * @param onBehalfOf - Address to receive borrowed tokens (optional, defaults to agent address)
 * @returns Transaction hash
 */
export async function aaveBorrow(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  interestRateMode: 1 | 2 = INTEREST_RATE_MODE.VARIABLE,
  onBehalfOf?: Address,
): Promise<Hex> {
  const poolAddress = POOL_ADDRESS[agent.chain];

  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave Pool address not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  const amountBigInt = BigInt(amount);
  const onBehalfOfAddress = onBehalfOf || agent.account.address;

  // Encode borrow function call
  const data = encodeFunctionData({
    abi: POOL_ABI,
    functionName: "borrow",
    args: [tokenAddress, amountBigInt, interestRateMode, 0, onBehalfOfAddress], // referralCode = 0
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

