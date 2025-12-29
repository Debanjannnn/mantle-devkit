import type { MNTAgentKit } from "../../agent";
import { getQuoteData, type OneInchQuote } from "../../utils/oneinch";

/**
 * Get swap quote from 1inch
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @returns Quote data including estimated output amount
 */
export async function get1inchQuote(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<OneInchQuote> {
  return await getQuoteData(fromToken, toToken, amount, agent.chain);
}
