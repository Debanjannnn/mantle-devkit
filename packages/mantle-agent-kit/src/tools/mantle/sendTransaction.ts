import { parseEther, parseUnits, type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { getTransactionReceipt } from "viem/actions";

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export const sendTransaction = async (
  agent: MNTAgentKit,
  to: Address,
  amount: string,
  tokenAddress?: Address,
) => {
  let hash: `0x${string}`;

  if (tokenAddress) {
    const decimals = (await agent.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    })) as number;

    hash = await agent.client.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, parseUnits(amount, decimals)],
    });
  } else {
    hash = await agent.client.sendTransaction({
      to,
      value: parseEther(amount),
    });
  }

  const receipt = await getTransactionReceipt(agent.client, {
    hash,
  });

  return receipt;
};
