import type { MNTAgentKit } from "../../agent";
import { getSwapTransaction } from "../../utils/okx";
import { createMockQuoteResponse } from "../../utils/demo/mockResponses";

export const getSwapQuote = async (
  agent: MNTAgentKit,
  from: string,
  to: string,
  amount: string,
  slippagePercentage: string,
) => {
  if (agent.demo) {
    return createMockQuoteResponse("OKX", amount);
  }

  const chainIndex = agent.chain === "mainnet" ? "5000" : "5003";

  return getSwapTransaction(from, to, amount, chainIndex, slippagePercentage);
};
