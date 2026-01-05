import type { MNTAgentKit } from "../../agent";
import { getQuoteData, type OneInchQuote } from "../../utils/oneinch";
import { createMockQuoteResponse } from "../../utils/demo/mockResponses";

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
  if (agent.demo) {
    return createMockQuoteResponse("1inch", amount) as unknown as OneInchQuote;
  }
  return await getQuoteData(fromToken, toToken, amount, agent.chain);
}
