import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { SWAP_ROUTER, SWAP_ROUTER_ABI, FEE_TIERS } from "../../constants/agni";
import { approveToken } from "../../utils/common";

/**
 * Swap tokens on Agni Finance DEX
 * @param agent - MNTAgentKit instance
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in smallest units)
 * @param slippagePercent - Slippage tolerance (default: 0.5%)
 * @param feeTier - Pool fee tier (default: MEDIUM = 0.3%)
 * @returns Transaction hash
 */
export async function agniSwap(
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
  feeTier: number = FEE_TIERS.MEDIUM,
): Promise<Hex> {
  const swapRouterAddress = SWAP_ROUTER[agent.chain];

  if (swapRouterAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Agni SwapRouter not available on ${agent.chain}`);
  }

  const amountInBigInt = BigInt(amountIn);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes

  // Calculate minimum amount out (with slippage)
  const amountOutMinimum = (amountInBigInt * BigInt(10000 - Math.floor(slippagePercent * 100))) / 10000n;

  // Approve token
  await approveToken(agent, tokenIn, swapRouterAddress, amountIn);

  // Encode swap
  const data = encodeFunctionData({
    abi: SWAP_ROUTER_ABI,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn,
        tokenOut,
        fee: feeTier,
        recipient: agent.account.address,
        deadline,
        amountIn: amountInBigInt,
        amountOutMinimum,
        sqrtPriceLimitX96: 0n,
      },
    ],
  });

  const hash = await agent.client.sendTransaction({
    to: swapRouterAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash });
  return hash;
}
