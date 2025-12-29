import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  POOL_ADDRESSES_PROVIDER,
  POOL_ADDRESSES_PROVIDER_ABI,
} from "../../constants/aave";

/**
 * Get the Pool contract address from PoolAddressesProvider
 * This is the recommended way to get the Pool address dynamically
 * @param agent - MNTAgentKit instance
 * @returns Pool contract address
 */
export async function getPoolAddress(
  agent: MNTAgentKit,
): Promise<Address> {
  const providerAddress = POOL_ADDRESSES_PROVIDER[agent.chain];

  if (providerAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Aave PoolAddressesProvider not configured for ${agent.chain}. Please update constants/aave/index.ts`,
    );
  }

  try {
    const poolAddress = await agent.client.readContract({
      address: providerAddress,
      abi: POOL_ADDRESSES_PROVIDER_ABI,
      functionName: "getPool",
    });

    return poolAddress as Address;
  } catch (error) {
    throw new Error(
      `Failed to fetch Pool address from PoolAddressesProvider: ${error}. Please verify the PoolAddressesProvider address is correct.`,
    );
  }
}

