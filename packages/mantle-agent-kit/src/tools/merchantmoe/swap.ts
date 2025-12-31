import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LB_ROUTER, LB_ROUTER_ABI } from "../../constants/merchantmoe";
import { approveToken } from "../../utils/common";

/**
 * Swap tokens on Merchant Moe DEX
 * @param agent - MNTAgentKit instance
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in smallest units)
 * @param slippagePercent - Slippage tolerance (default: 0.5%)
 * @returns Transaction hash
 */
export async function merchantMoeSwap(
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
): Promise<Hex> {
  const routerAddress = LB_ROUTER[agent.chain];

  if (routerAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Merchant Moe LB Router not available on ${agent.chain}`);
  }

  const amountInBigInt = BigInt(amountIn);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min

  // Calculate minimum out with slippage
  const amountOutMin = (amountInBigInt * BigInt(10000 - Math.floor(slippagePercent * 100))) / 10000n;

  // Approve token
  await approveToken(agent, tokenIn, routerAddress, amountIn);

  // Simple path (direct swap)
  const path = [BigInt(tokenIn), BigInt(tokenOut)];

  const data = encodeFunctionData({
    abi: LB_ROUTER_ABI,
    functionName: "swapExactTokensForTokens",
    args: [amountInBigInt, amountOutMin, path, agent.account.address, deadline],
  });

  const hash = await agent.client.sendTransaction({
    to: routerAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash });
  return hash;
}
