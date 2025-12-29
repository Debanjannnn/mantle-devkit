import type { Address, Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { NATIVE_TOKEN_ADDRESS, ONEINCH_ROUTER_ADDRESS } from "../../constants/oneinch";
import { approveToken } from "../../utils/common";
import { getSwapData } from "../../utils/oneinch";

/**
 * Execute token swap on 1inch
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param slippage - Slippage percentage (e.g., "1" for 1%)
 * @returns Transaction hash and output amount
 */
export async function swapOn1inch(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string = "1",
): Promise<{ txHash: string; dstAmount: string }> {
  const walletAddress = agent.account.address;

  // 1. Approve token if not native
  if (fromToken.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    await approveToken(agent, fromToken, ONEINCH_ROUTER_ADDRESS, amount);
  }

  // 2. Get swap transaction data
  const swapData = await getSwapData(
    fromToken,
    toToken,
    amount,
    walletAddress,
    slippage,
    agent.chain,
  );

  console.log("1inch swap data received");
  console.log(`Expected output: ${swapData.dstAmount}`);

  // 3. Estimate gas
  const gasEstimate = await agent.client.estimateGas({
    account: agent.account,
    to: swapData.tx.to as Address,
    data: swapData.tx.data as Hex,
    value: BigInt(swapData.tx.value || "0"),
  });

  // 4. Execute swap transaction
  const txHash = await agent.client.sendTransaction({
    to: swapData.tx.to as Address,
    data: swapData.tx.data as Hex,
    value: BigInt(swapData.tx.value || "0"),
    gas: gasEstimate,
  });

  console.log(`1inch swap tx sent: ${txHash}`);

  // 5. Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(`Swap confirmed: ${receipt.status}`);

  return {
    txHash,
    dstAmount: swapData.dstAmount,
  };
}
