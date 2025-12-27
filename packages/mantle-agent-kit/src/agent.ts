import {
  createWalletClient,
  http,
  publicActions,
  type Chain,
  type PublicActions,
  type Transport,
  type WalletClient,
} from "viem";
import {
  privateKeyToAccount,
  type Address,
  type PrivateKeyAccount,
} from "viem/accounts";
import { mantle, mantleSepoliaTestnet } from "viem/chains";
import { executeSwap, sendTransaction } from "./tools";
import { getSwapQuote } from "./tools/okx/getSwapQuote";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount> &
    PublicActions;
  public chain: "testnet" | "mainnet";

  constructor(privateKey: Address, chain: "mainnet" | "testnet") {
    this.account = privateKeyToAccount(privateKey);
    this.chain = chain;
    this.client = createWalletClient({
      chain: chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    }).extend(publicActions);
  }

  async sendTransaction(to: Address, amount: string) {
    return await sendTransaction(this, to, amount);
  }

  async getSwapQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    return await getSwapQuote(
      this,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippagePercentage,
    );
  }

  async executeSwap(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    if (this.chain === "mainnet") {
      return await executeSwap(
        this,
        fromTokenAddress,
        toTokenAddress,
        amount,
        slippagePercentage,
      );
    }
  }
}
