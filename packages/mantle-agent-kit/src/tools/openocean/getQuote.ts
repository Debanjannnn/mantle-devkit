import type { MNTAgentKit } from "../../agent";
import { getQuoteData, type OpenOceanQuote } from "../../utils/openocean";

/**
 * Get swap quote from OpenOcean
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @returns Quote data including estimated output amount
 */
export async function getOpenOceanQuote(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<OpenOceanQuote> {
  return await getQuoteData(fromToken, toToken, amount, agent.chain);
}
