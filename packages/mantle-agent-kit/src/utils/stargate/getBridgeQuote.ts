import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { STARGATE_ROUTER, STARGATE_ROUTER_ABI } from "../../constants/stargate";

export interface BridgeQuote {
  amountLD: bigint;
  amountMinLD: bigint;
  dstGasForCall: bigint;
  dstNativeAmount: bigint;
}

/**
 * Get bridge quote from Stargate
 * Note: Stargate doesn't have a direct quote endpoint, so this is a helper
 * to calculate minimum amounts based on slippage
 * @param amount - Amount to bridge (in smallest units)
 * @param slippage - Slippage tolerance percentage (default: 0.1%)
 * @returns Quote data
 */
export function getBridgeQuote(
  amount: string,
  slippage: number = 0.1,
): BridgeQuote {
  const amountBigInt = BigInt(amount);
  const slippageBps = BigInt(Math.floor(slippage * 100)); // Convert to basis points
  const amountMinLD =
    (amountBigInt * (10000n - slippageBps)) / 10000n;

  return {
    amountLD: amountBigInt,
    amountMinLD,
    dstGasForCall: 0n, // Default, can be adjusted
    dstNativeAmount: 0n, // Default, can be adjusted
  };
}

/**
 * Build swap calldata for Stargate bridge
 * @param agent - MNTAgentKit instance
 * @param dstChainId - Destination chain ID (LayerZero chain ID)
 * @param srcPoolId - Source pool ID
 * @param dstPoolId - Destination pool ID
 * @param amount - Amount to bridge (in smallest units)
 * @param amountMin - Minimum amount to receive (in smallest units)
 * @param to - Destination address
 * @param isNative - Whether bridging native token
 * @returns Encoded function data
 */
export async function buildBridgeCalldata(
  agent: MNTAgentKit,
  dstChainId: number,
  srcPoolId: number,
  dstPoolId: number,
  amount: string,
  amountMin: string,
  to: Address,
  isNative: boolean = false,
): Promise<{
  to: Address;
  data: `0x${string}`;
  value: bigint;
}> {
  const routerAddress = STARGATE_ROUTER[agent.chain];

  if (routerAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Stargate Router address not configured for ${agent.chain}. Please update constants/stargate/index.ts`,
    );
  }

  const { encodeFunctionData } = await import("viem");

  const lzTxParams = {
    dstGasForCall: 0n,
    dstNativeAmount: 0n,
    dstNativeAddr: "0x" as `0x${string}`,
  };

  const toBytes = to as `0x${string}`;
  const payload = "0x" as `0x${string}`;

  const data = isNative
    ? encodeFunctionData({
        abi: STARGATE_ROUTER_ABI,
        functionName: "swapETH",
        args: [
          dstChainId,
          srcPoolId,
          dstPoolId,
          agent.account.address,
          BigInt(amount),
          BigInt(amountMin),
          lzTxParams,
          toBytes,
          payload,
        ],
      })
    : encodeFunctionData({
        abi: STARGATE_ROUTER_ABI,
        functionName: "swap",
        args: [
          dstChainId,
          srcPoolId,
          dstPoolId,
          agent.account.address,
          BigInt(amount),
          BigInt(amountMin),
          lzTxParams,
          toBytes,
          payload,
        ],
      });

  return {
    to: routerAddress,
    data,
    value: isNative ? BigInt(amount) : 0n,
  };
}

