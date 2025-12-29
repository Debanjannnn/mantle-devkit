import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { POOL_ADDRESS, POOL_ABI, WMNT_ADDRESS } from "../../constants/aave";
import { approveToken } from "../../utils/common";

/**
 * Supply tokens to Aave V3
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to supply (use WMNT_ADDRESS for native MNT)
 * @param amount - Amount to supply (in smallest units)
 * @returns Transaction hash
 */
export async function aaveSupply(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
): Promise<Hex> {
  const poolAddress = POOL_ADDRESS[agent.chain];

  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave Pool address not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  const amountBigInt = BigInt(amount);
  const isNative = tokenAddress.toLowerCase() === WMNT_ADDRESS.toLowerCase();

  // Approve token spending if not native
  if (!isNative) {
    await approveToken(agent, tokenAddress, poolAddress, amount);
  }

  // Encode supply function call
  const data = encodeFunctionData({
    abi: POOL_ABI,
    functionName: "supply",
    args: [tokenAddress, amountBigInt, agent.account.address, 0], // referralCode = 0
  });

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to: poolAddress,
    data,
    value: isNative ? amountBigInt : 0n,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}

