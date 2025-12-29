import { type Address, type Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { STARGATE_ROUTER, POOL_IDS } from "../../constants/stargate";
import { approveToken } from "../../utils/common";
import { getBridgeQuote, buildBridgeCalldata } from "../../utils/stargate";

/**
 * Bridge tokens via Stargate
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to bridge (use native address for native token)
 * @param amount - Amount to bridge (in smallest units)
 * @param dstChainId - Destination chain ID (LayerZero chain ID)
 * @param dstAddress - Destination address to receive tokens
 * @param srcPoolId - Source pool ID (optional, defaults based on token)
 * @param dstPoolId - Destination pool ID (optional, defaults based on token)
 * @param slippage - Slippage tolerance percentage (default: 0.1%)
 * @returns Transaction hash
 */
export async function bridgeViaStargate(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  dstChainId: number,
  dstAddress: Address,
  srcPoolId?: number,
  dstPoolId?: number,
  slippage: number = 0.1,
): Promise<Hex> {
  const routerAddress = STARGATE_ROUTER[agent.chain];

  if (routerAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Stargate Router address not configured for ${agent.chain}. Please update constants/stargate/index.ts`,
    );
  }

  // Determine pool IDs (default to USDC if not provided)
  const sourcePoolId = srcPoolId || POOL_IDS.USDC;
  const destPoolId = dstPoolId || POOL_IDS.USDC;

  // Get bridge quote
  const quote = getBridgeQuote(amount, slippage);

  // Check if native token (you may need to adjust this based on your native token address)
  const isNative = false; // Adjust based on your native token detection logic

  // Approve token if not native
  if (!isNative) {
    await approveToken(agent, tokenAddress, routerAddress, amount);
  }

  // Build bridge calldata
  const { to, data, value } = await buildBridgeCalldata(
    agent,
    dstChainId,
    sourcePoolId,
    destPoolId,
    amount,
    quote.amountMinLD.toString(),
    dstAddress,
    isNative,
  );

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to,
    data,
    value,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}

/**
 * Get Stargate bridge quote
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to bridge
 * @param amount - Amount to bridge (in smallest units)
 * @param dstChainId - Destination chain ID (LayerZero chain ID)
 * @param slippage - Slippage tolerance percentage (default: 0.1%)
 * @returns Bridge quote data
 */
export async function getStargateBridgeQuote(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  dstChainId: number,
  slippage: number = 0.1,
) {
  return getBridgeQuote(amount, slippage);
}

