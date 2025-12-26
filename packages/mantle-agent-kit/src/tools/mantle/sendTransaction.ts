import { parseEther, type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { getTransactionReceipt } from "viem/actions";

export const sendTransaction = async (
  agent: MNTAgentKit,
  to: Address,
  amount: string,
) => {
  const hash = await agent.client.sendTransaction({
    to,
    value: parseEther(amount),
  });

  const receipt = await getTransactionReceipt(agent.client, {
    hash,
  });

  return receipt;
};
