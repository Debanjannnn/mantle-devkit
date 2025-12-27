import type { MNTAgentKit } from "../../agent";
import { getSwapTransaction } from "../../utils/okx/getSwapLimit";

export const getSwapQuote = async (
  agent: MNTAgentKit,
  from: string,
  to: string,
  amount: string,
  slippagePercentage: string,
) => {
  const chainIndex = agent.chain === "mainnet" ? "5000" : "5003";

  return getSwapTransaction(from, to, amount, chainIndex, slippagePercentage);
};
