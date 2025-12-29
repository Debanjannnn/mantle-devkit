import type { Address, Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { NATIVE_TOKEN_ADDRESS, OPENOCEAN_EXCHANGE_PROXY } from "../../constants/openocean";
import { approveToken } from "../../utils/common";
import { getSwapData } from "../../utils/openocean";

/**
 * Execute token swap on OpenOcean
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param slippage - Slippage percentage (e.g., "1" for 1%)
 * @returns Transaction hash
 */
export async function swapOnOpenOcean(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string = "1",
): Promise<{ txHash: string; outAmount: string }> {
  const walletAddress = agent.account.address;

  // 1. Approve token if not native
  if (fromToken.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    await approveToken(agent, fromToken, OPENOCEAN_EXCHANGE_PROXY, amount);
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

  console.log("OpenOcean swap data received");
  console.log(`Expected output: ${swapData.outAmount}`);

  // 3. Execute swap transaction
  const txHash = await agent.client.sendTransaction({
    to: swapData.to as Address,
    data: swapData.data as Hex,
    value: BigInt(swapData.value || "0"),
    gas: BigInt(swapData.estimatedGas),
  });

  console.log(`OpenOcean swap tx sent: ${txHash}`);

  // 4. Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(`Swap confirmed: ${receipt.status}`);

  return {
    txHash,
    outAmount: swapData.outAmount,
  };
}
